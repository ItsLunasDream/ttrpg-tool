/**
 * Import eigener Bilder als Props.
 *
 * Drei Wege, weil kein einzelner überall funktioniert:
 *
 * 1. `showDirectoryPicker` liest einen ganzen Ordnerbaum samt Unterordnern —
 *    daraus entstehen Kategorien und Tags von selbst. Gibt es nur in Chromium,
 *    und auch dort *nicht* in einem sicheren Kontext-Ersatz wie `file://` —
 *    also gerade nicht in der portablen Einzeldatei.
 * 2. Ein Dateifeld mit `webkitdirectory`. Das kennt jeder heutige Browser,
 *    liefert den ganzen Ordner und über `webkitRelativePath` sogar die
 *    Unterordner. Der Name führt in die Irre: es ist kein Chromium-Sonderweg.
 * 3. Der gewöhnliche Mehrfach-Dateidialog für einzelne Bilder.
 *
 * Der zweite Weg fehlte, und deshalb tat „Ordner wählen" ohne
 * `showDirectoryPicker` genau dasselbe wie „Dateien wählen" — es griff auf
 * dasselbe Dateifeld zurück. Gemeldet wurde es als „ich kann damit nur eine
 * Datei und keinen Ordner auswählen".
 */

import { useRef, useState } from 'react';
import { useEditor } from '@/model/store';
import { importAssets, importedAssets, isImageFile, removeImported } from '@/assets/importStore';
import { useT } from '@/i18n/useT';
import { NumberField, Row } from './controls';

interface Verzeichnis {
  kind: 'directory' | 'file';
  name: string;
  values?: () => AsyncIterable<Verzeichnis>;
  getFile?: () => Promise<File>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (opts?: { mode?: 'read' | 'readwrite' }) => Promise<Verzeichnis>;
  }
}

/** Ordnerbaum rekursiv einlesen; der Pfad unterhalb der Wurzel bleibt erhalten. */
async function sammle(
  dir: Verzeichnis,
  praefix: string,
  raus: Array<{ relativePath: string; blob: Blob }>,
  tiefe = 0,
): Promise<void> {
  // Eine Grenze, damit ein versehentlich gewähltes Wurzelverzeichnis nicht
  // den Browser lahmlegt.
  if (tiefe > 6 || !dir.values) return;
  for await (const eintrag of dir.values()) {
    const pfad = praefix ? `${praefix}/${eintrag.name}` : eintrag.name;
    if (eintrag.kind === 'directory') {
      await sammle(eintrag, pfad, raus, tiefe + 1);
    } else if (isImageFile(eintrag.name) && eintrag.getFile) {
      raus.push({ relativePath: pfad, blob: await eintrag.getFile() });
    }
  }
}

export function AssetImport() {
  const { t } = useT();
  const setStatus = useEditor((s) => s.setStatusMessage);
  const [pixelsPerTile, setPixelsPerTile] = useState(100);
  const [busy, setBusy] = useState(false);
  const [rev, setRev] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const uebernehmen = async (dateien: Array<{ relativePath: string; blob: Blob }>) => {
    if (dateien.length === 0) {
      setStatus(t('import.nothing'));
      return;
    }
    setBusy(true);
    try {
      const neu = await importAssets(dateien, { pixelsPerTile });
      setRev((r) => r + 1);
      setStatus(t('import.done', { count: neu.length }));
    } catch (err) {
      setStatus(t('import.failed', { error: err instanceof Error ? err.message : String(err) }));
    } finally {
      setBusy(false);
    }
  };

  const ordnerWaehlen = async () => {
    if (!window.showDirectoryPicker) {
      folderInput.current?.click();
      return;
    }
    try {
      const dir = await window.showDirectoryPicker({ mode: 'read' });
      const raus: Array<{ relativePath: string; blob: Blob }> = [];
      await sammle(dir, '', raus);
      await uebernehmen(raus);
    } catch (err) {
      // Abbruch im Dialog ist keine Störung.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setStatus(t('import.failed', { error: err instanceof Error ? err.message : String(err) }));
    }
  };

  const vorhandene = importedAssets();
  void rev;

  return (
    <>
      <NumberField
        label={t('import.pixelsPerTile')}
        min={8}
        max={1024}
        step={2}
        value={pixelsPerTile}
        onChange={setPixelsPerTile}
      />
      <p className="hint">{t('import.pixelsHint')}</p>

      <div className="row-inline">
        <button disabled={busy} onClick={() => void ordnerWaehlen()}>
          {t('import.folder')}
        </button>
        <button disabled={busy} onClick={() => fileInput.current?.click()}>
          {t('import.files')}
        </button>
      </div>

      {vorhandene.length > 0 ? (
        <Row label={t('import.count')}>
          <div className="row-inline">
            <span className="value">{vorhandene.length}</span>
            <button
              className="ghost icon"
              title={t('import.clear')}
              onClick={() => {
                if (!window.confirm(t('import.confirmClear', { count: vorhandene.length }))) return;
                removeImported(vorhandene.map((a) => a.id));
                setRev((r) => r + 1);
              }}
            >
              🗑
            </button>
          </div>
        </Row>
      ) : null}

      <p className="hint">{t('import.hint')}</p>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/webp,image/jpeg,image/gif,image/avif"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const liste = [...(e.target.files ?? [])].map((f) => ({
            // webkitRelativePath ist gesetzt, wenn der Browser einen Ordner liefert.
            relativePath: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
            blob: f,
          }));
          e.target.value = '';
          void uebernehmen(liste);
        }}
      />

      {/*
        `webkitdirectory` steht in keiner React-Typdefinition und wird deshalb
        am Element gesetzt. Kein `accept`: bei einem Ordner filtern die Browser
        damit unterschiedlich, und was ein Bild ist, entscheidet ohnehin
        `isImageFile` — sonst bliebe eine mitgelieferte `readme.txt` als
        kaputtes Prop übrig.
      */}
      <input
        ref={(el) => {
          folderInput.current = el;
          if (el) {
            el.setAttribute('webkitdirectory', '');
            el.setAttribute('directory', '');
          }
        }}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const liste = [...(e.target.files ?? [])]
            .filter((f) => isImageFile(f.name))
            .map((f) => ({
              relativePath: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
              blob: f,
            }));
          e.target.value = '';
          void uebernehmen(liste);
        }}
      />
    </>
  );
}
