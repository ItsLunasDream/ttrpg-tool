/**
 * Die Montage-Schnittstelle des NPC Creators (Konvention 7).
 *
 * Wie bei den anderen Werkzeugen: die Huelle ruft `mountNpc` und bekommt
 * zurueck, was sie zum Anzeigen braucht. Kein eigenstaendiger Hauptprozess.
 *
 * Der NPC Creator hat keine eigene Ablage — die Figuren gehoeren in den
 * Backstory Creator, und die Merkliste lebt nur in der Sitzung. Gespeichert
 * wird hier nichts.
 */
import path from 'node:path';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { kanal } from '../shared/kanaele';

export interface ExportErgebnis {
  readonly ok: boolean;
  readonly text: string;
}

/**
 * Wie eine Figur ins Archiv kommt.
 *
 * Die Huelle reicht das durch, weil nur sie weiss, ob der Backstory Creator
 * ueberhaupt montiert ist und welche Kampagne offen steht. Der NPC Creator
 * kennt den Vault nicht und soll ihn auch nicht kennen.
 */
export type Anleger = (titel: string, markdown: string) => Promise<ExportErgebnis>;

export interface NpcEmbedOptions {
  readonly distDir: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
  /** Legt die Figur an. Fehlt sie, meldet der Export das ehrlich. */
  readonly anlegen?: Anleger;
}

export interface NpcEmbed {
  readonly preloadPath: string;
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly csp: string;
  flush(): Promise<void>;
  setLanguage(webContents: WebContents, language: string): Promise<void>;
}

/**
 * Die Richtlinie.
 *
 * Alles aus den eigenen Dateien. `style-src` braucht 'unsafe-inline', weil
 * React Stile ueber `style`-Attribute setzt; `connect-src` geht nirgendwohin
 * — die Tabellen liegen im Buendel, und eine KI-Anbindung gibt es noch
 * nicht. Kommt sie, muss diese Zeile bewusst geoeffnet werden.
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

export async function mountNpc(options: NpcEmbedOptions): Promise<NpcEmbed> {
  // Erst abmelden: nach einem Fehlschlag kann dieselbe Anwendung ein zweites
  // Mal montiert werden, und `handle` weist einen zweiten Handler ab.
  ipcMain.removeHandler(kanal('export'));
  ipcMain.handle(kanal('export'), async (_e, titel: string, markdown: string) => {
    if (!options.anlegen) {
      return { ok: false, text: 'Der Backstory Creator ist nicht verfügbar.' };
    }
    try {
      return await options.anlegen(titel, markdown);
    } catch (fehler) {
      return { ok: false, text: String(fehler instanceof Error ? fehler.message : fehler) };
    }
  });

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
    flush: async () => {
      // Nichts zu sichern: die Merkliste lebt nur in der Sitzung, und Figuren
      // wandern auf Knopfdruck in den Backstory Creator.
    },
    setLanguage: async (webContents, language) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('sprache:gesetzt'), language);
    }
  };
}
