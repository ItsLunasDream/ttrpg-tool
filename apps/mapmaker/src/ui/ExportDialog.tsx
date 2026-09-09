/** Dialog für den Bild-Export. */

import { useMemo, useState } from 'react';
import { useEditor } from '@/model/store';
import { flattenLayers } from '@/model/document';
import { isSystemLayer } from '@/model/types';
import { getRenderer } from '@/engine/instance';
import {
  canvasToBlob,
  defaultExportOptions,
  downloadBlob,
  exportSize,
  renderMapToCanvasAsync,
  type ExportProgress,
  safeFilename,
  type ImageFormat,
} from '@/io/exportImage';
import { useT } from '@/i18n/useT';
import { Row, Select, Slider, Toggle, useEscapeClose } from './controls';

const PRESETS = [40, 70, 100, 140, 200];

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  useEscapeClose(onClose);
  const doc = useEditor((s) => s.doc);
  const [options, setOptions] = useState(() => defaultExportOptions(doc));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const size = useMemo(
    () => exportSize(doc, options.pixelsPerTile),
    [doc, options.pixelsPerTile],
  );

  const [perLayer, setPerLayer] = useState(false);
  /** Fortschritt des laufenden Exports; null heißt: läuft gerade keiner. */
  const [progress, setProgress] = useState<(ExportProgress & { name?: string }) | null>(null);

  const patch = (p: Partial<typeof options>) => setOptions((o) => ({ ...o, ...p }));

  const run = async () => {
    const renderer = getRenderer();
    if (!renderer) return;
    setBusy(true);
    setError(null);
    try {
      // Kurz durchatmen lassen, damit der „Wird exportiert"-Zustand sichtbar
      // wird, bevor die erste Kachel den Hauptthread belegt.
      await new Promise((r) => setTimeout(r, 30));
      if (perLayer) {
        // Jede Ebene einzeln: Grid und Hintergrund bleiben außen vor, sonst
        // läge auf jeder Datei derselbe Untergrund und das Stapeln ginge nicht.
        const ebenen = flattenLayers(doc).filter(
          (l) => !l.isGroup && !isSystemLayer(l.id) && l.includeInExport,
        );
        for (const ebene of ebenen) {
          const canvas = await renderMapToCanvasAsync(
            renderer,
            doc,
            {
              ...options,
              includeGrid: false,
              includeBackground: false,
              onlyLayer: ebene.id,
            },
            (p) => setProgress({ ...p, name: ebene.name }),
          );
          const blob = await canvasToBlob(canvas, options.format, options.quality);
          downloadBlob(blob, safeFilename(`${doc.meta.name} - ${ebene.name}`, options.format));
        }
      } else {
        const canvas = await renderMapToCanvasAsync(renderer, doc, options, setProgress);
        const blob = await canvasToBlob(canvas, options.format, options.quality);
        downloadBlob(blob, safeFilename(doc.meta.name, options.format));
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>{t('export.imageTitle')}</h3>
          <button className="ghost icon" onClick={onClose} title={t('export.close')}>
            ✕
          </button>
        </header>

        <div className="modal-body">
          <Row label={t('export.resolution')}>
            <div className="chips">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  className={options.pixelsPerTile === p ? 'active' : ''}
                  onClick={() => patch({ pixelsPerTile: p })}
                >
                  {p} px
                </button>
              ))}
            </div>
          </Row>
          <Slider
            label={t('export.perTile')}
            min={20}
            max={300}
            step={5}
            value={options.pixelsPerTile}
            onChange={(v) => patch({ pixelsPerTile: v })}
          />

          <Select<ImageFormat>
            label={t('export.format')}
            value={options.format}
            options={[
              { value: 'webp', label: t('export.webp') },
              { value: 'png', label: t('export.png') },
              { value: 'jpeg', label: t('export.jpeg') },
            ]}
            onChange={(v) => patch({ format: v })}
          />
          {options.format !== 'png' ? (
            <Slider
              label={t('export.quality')}
              min={0.4}
              max={1}
              step={0.01}
              value={options.quality}
              onChange={(v) => patch({ quality: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          ) : null}

          <Toggle
            label={t('export.includeGrid')}
            checked={options.includeGrid}
            onChange={(v) => patch({ includeGrid: v })}
          />
          <Toggle
            label={t('export.includeBackground')}
            checked={options.includeBackground}
            onChange={(v) => patch({ includeBackground: v })}
          />
          <Toggle label={t('export.perLayer')} checked={perLayer} onChange={setPerLayer} />
          {perLayer ? <p className="hint">{t('export.perLayerHint')}</p> : null}

          <p className={size.tooLarge ? 'warn' : 'hint'}>
            {t('export.result', { w: size.width, h: size.height, mp: size.megapixels })}
            {size.tooLarge ? ` — ${t('export.tooLarge', { reason: size.reason ?? '' })}` : ''}
          </p>
          {!options.includeGrid ? <p className="hint">{t('export.gridOffHint')}</p> : null}
          {options.format === 'jpeg' && !options.includeBackground ? (
            <p className="warn">{t('export.jpegAlpha')}</p>
          ) : null}
          {error ? <p className="warn">{error}</p> : null}
          {progress ? (
            <>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
                <div style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
              </div>
              <p className="hint">
                {progress.name
                  ? t('export.progressLayer', {
                      name: progress.name,
                      done: progress.done,
                      total: progress.total,
                    })
                  : t('export.progress', { done: progress.done, total: progress.total })}
              </p>
            </>
          ) : null}
        </div>

        <footer>
          <button onClick={onClose}>{t('export.cancel')}</button>
          <button className="primary" disabled={busy || size.tooLarge} onClick={run}>
            {busy ? t('export.rendering') : t('export.run')}
          </button>
        </footer>
      </div>
    </div>
  );
}
