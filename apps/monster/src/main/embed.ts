/**
 * Die Montage-Schnittstelle des Monster Creators (Konvention 7).
 *
 * Die Huelle ruft `mountMonster` und bekommt zurueck, was sie zum Anzeigen
 * braucht. Kein eigenstaendiger Hauptprozess.
 *
 * ANDERS ALS DER NPC CREATOR hat dieses Werkzeug eine EIGENE ABLAGE: einen
 * Ordner `monster` im Datenordner, eine Markdown-Datei je Monster. Grund ist
 * nicht Eigensinn, sondern der Encounter Creator — er soll die Monster
 * lesen koennen, ohne dass es einen Kanal zwischen den beiden Werkzeugen
 * gibt. Derselbe Ordner ist die billigste Kopplung, die es gibt.
 */
import path from 'node:path';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { baueAnbieter, KiFehler, leseJsonAntwort } from '@suite/ki';
import type { KiEinstellungen } from '@suite/ki/einstellungen';
import { kanal } from '../shared/kanaele';
import { alsEintrag, alsMarkdown, zuId, type Abgelegt, type Eintrag } from '../shared/ablage';
import { anweisung, systemAnweisung, uebernehmbar, type Frage } from '../shared/kiAufgaben';
import type { Sprache } from '../shared/tabellen';

export type KiQuelle = () => { einstellungen: KiEinstellungen; schluessel: string };

export interface KiErgebnis<T> {
  readonly ok: boolean;
  readonly wert: T | null;
  /** Ein Textschluessel, kein fertiger Satz — die Oberflaeche uebersetzt. */
  readonly grund: string;
}

export interface MonsterEmbedOptions {
  readonly distDir: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
  /** Wohin die Monster gehoeren. Ueblicherweise der Datenordner der Huelle. */
  readonly datenordner: string;
  readonly kiQuelle?: KiQuelle;
  /** Legt eine Notiz im Story Creator an. Fehlt sie, meldet der Export es ehrlich. */
  readonly anlegen?: (titel: string, markdown: string) => Promise<{ ok: boolean; text: string }>;
}

export interface MonsterEmbed {
  readonly preloadPath: string;
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly csp: string;
  /** Wo die Monster liegen. Der Encounter Creator wird denselben Pfad lesen. */
  readonly ordner: string;
  flush(): Promise<void>;
  setLanguage(webContents: WebContents, language: string): Promise<void>;
  meldeKiWechsel(webContents: WebContents): void;
}

/**
 * Die Richtlinie. Alles aus den eigenen Dateien.
 *
 * `connect-src 'self'` bleibt zu, auch mit KI: die Anfrage geht vom
 * Hauptprozess aus, nicht von der Oberflaeche. Der Schluessel erreicht den
 * Renderer nie.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'"
].join('; ');

/** Der Ordnername im Datenordner. Taucht in der Oberflaeche auf. */
export const ORDNER_NAME = 'monster';

export async function mountMonster(options: MonsterEmbedOptions): Promise<MonsterEmbed> {
  const ordner = path.join(options.datenordner, ORDNER_NAME);
  await mkdir(ordner, { recursive: true });

  const datei = (id: string) => path.join(ordner, `${id}.md`);

  /* ---------- Ablage ---------- */

  /**
   * Die Liste, ohne die Leiber zu lesen.
   *
   * Gelesen werden muss die Datei trotzdem — der Kopf steht darin. Bei ein
   * paar hundert Monstern ist das nichts; bei deutlich mehr braeuchte es
   * einen Index, und dann faellt es hier auf.
   */
  ipcMain.removeHandler(kanal('liste'));
  ipcMain.handle(kanal('liste'), async (): Promise<Eintrag[]> => {
    let dateien: string[];
    try {
      dateien = await readdir(ordner);
    } catch {
      return [];
    }
    const heraus: Eintrag[] = [];
    for (const name of dateien) {
      if (!name.endsWith('.md')) continue;
      try {
        const inhalt = await readFile(path.join(ordner, name), 'utf8');
        heraus.push(alsEintrag(inhalt, name.slice(0, -3)));
      } catch {
        // Eine kaputte Datei nimmt nicht die ganze Sammlung mit.
      }
    }
    return heraus;
  });

  ipcMain.removeHandler(kanal('lesen'));
  ipcMain.handle(kanal('lesen'), async (_e, id: string): Promise<string | null> => {
    try {
      return await readFile(datei(zuId(id)), 'utf8');
    } catch {
      return null;
    }
  });

  ipcMain.removeHandler(kanal('speichern'));
  ipcMain.handle(
    kanal('speichern'),
    async (_e, monster: Abgelegt, sprache: Sprache): Promise<{ ok: boolean; id: string; text: string }> => {
      const id = zuId(monster.id || monster.name);
      try {
        await writeFile(
          datei(id),
          alsMarkdown({ ...monster, id, geaendert: new Date().toISOString() }, sprache),
          'utf8'
        );
        return { ok: true, id, text: '' };
      } catch (fehler) {
        return { ok: false, id, text: String(fehler instanceof Error ? fehler.message : fehler) };
      }
    }
  );

  ipcMain.removeHandler(kanal('loeschen'));
  ipcMain.handle(kanal('loeschen'), async (_e, id: string): Promise<boolean> => {
    try {
      await unlink(datei(zuId(id)));
      return true;
    } catch {
      return false;
    }
  });

  /* ---------- Export in den Story Creator ---------- */

  ipcMain.removeHandler(kanal('export'));
  ipcMain.handle(kanal('export'), async (_e, titel: string, markdown: string) => {
    if (!options.anlegen) return { ok: false, text: 'Der Story Creator ist nicht verfügbar.' };
    try {
      return await options.anlegen(titel, markdown);
    } catch (fehler) {
      return { ok: false, text: String(fehler instanceof Error ? fehler.message : fehler) };
    }
  });

  /* ---------- KI ---------- */

  const anbieter = () => {
    if (!options.kiQuelle) return null;
    const quelle = options.kiQuelle();
    return baueAnbieter(quelle.einstellungen, quelle.schluessel);
  };

  ipcMain.removeHandler(kanal('ki:da'));
  ipcMain.handle(kanal('ki:da'), () => anbieter() !== null);

  ipcMain.removeHandler(kanal('ki:frage'));
  ipcMain.handle(
    kanal('ki:frage'),
    async (_e, frage: Frage, sprache: Sprache): Promise<KiErgebnis<unknown>> => {
      const gewaehlt = anbieter();
      if (!gewaehlt) return { ok: false, wert: null, grund: 'fehler.kiKeinAnbieter' };
      try {
        const antwort = await gewaehlt.frage(
          {
            system: systemAnweisung(sprache),
            nachrichten: [{ rolle: 'user', inhalt: anweisung(frage, sprache) }]
          },
          // Teiltexte interessieren nicht: es kommt ein kurzes JSON, und ein
          // halb geschriebenes kann die Oberflaeche nicht anzeigen.
          () => {}
        );
        const gelesen = leseJsonAntwort(antwort);
        if (gelesen === null) return { ok: false, wert: null, grund: 'fehler.kiKeinJson' };
        const wert = uebernehmbar(frage.aufgabe, gelesen);
        if (wert === null) return { ok: false, wert: null, grund: 'fehler.kiKeinJson' };
        return { ok: true, wert, grund: '' };
      } catch (fehler) {
        if (fehler instanceof KiFehler) return { ok: false, wert: null, grund: fehler.schluessel };
        return { ok: false, wert: null, grund: 'error.aiOther' };
      }
    }
  );

  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
  ipcMain.on(kanal('sprache:gewechselt'), (_event, language: string) => {
    options.onLanguageChange?.(language);
  });

  return {
    preloadPath: path.join(options.distDir, 'preload.js'),
    indexFile: options.devServerUrl
      ? null
      : path.join(options.distDir, '..', 'renderer', 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    csp: CSP,
    ordner,
    flush: async () => {
      // Gespeichert wird beim Klick, nicht beim Schliessen: ein Monster ist
      // ein Dokument, kein Sitzungszustand.
    },
    setLanguage: async (webContents, language) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('sprache:gesetzt'), language);
    },
    meldeKiWechsel: (webContents) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('ki:gewechselt'));
    }
  };
}
