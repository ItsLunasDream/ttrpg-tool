/**
 * Die Montage-Schnittstelle der Inspirationshilfe (Konvention 7).
 *
 * Wie bei den anderen Werkzeugen: die Huelle ruft `mountInspiration` und
 * bekommt zurueck, was sie zum Anzeigen braucht. Kein eigenstaendiger
 * Hauptprozess.
 *
 * Eine eigene Ablage gibt es nicht, und das ist die wichtigste Entscheidung
 * des ganzen Werkzeugs (docs/inspirationshilfe.md): der Entwurf lebt in der
 * Sitzung, die Wahrheit liegt im Backstory Creator. Zwei Ablagen fuer
 * dieselbe Welt haetten frueher oder spaeter zwei verschiedene Welten
 * ergeben.
 */
import path from 'node:path';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Notiz } from '../shared/notizen';

export interface ExportErgebnis {
  readonly ok: boolean;
  readonly text: string;
  readonly angelegt: number;
}

/**
 * Wie Notizen ins Archiv kommen.
 *
 * Die Huelle reicht das durch, weil nur sie weiss, ob der Backstory Creator
 * montiert ist und welche Kampagne offen steht — genauso wie beim NPC
 * Creator.
 */
export type Anleger = (notizen: readonly Notiz[]) => Promise<ExportErgebnis>;

export interface InspirationEmbedOptions {
  readonly distDir: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
  /** Legt die Notizen an. Fehlt sie, meldet der Export das ehrlich. */
  readonly anlegen?: Anleger;
}

export interface InspirationEmbed {
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
 * Alles aus den eigenen Dateien; `connect-src` geht nirgendwohin. Das
 * Werkzeug wuerfelt aus Tabellen, es braucht kein Netz.
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

export async function mountInspiration(
  options: InspirationEmbedOptions
): Promise<InspirationEmbed> {
  // Erst abmelden: nach einem Fehlschlag kann dieselbe Anwendung ein zweites
  // Mal montiert werden, und `handle` weist einen zweiten Handler ab.
  ipcMain.removeHandler(kanal('export'));
  ipcMain.handle(kanal('export'), async (_e, notizen: Notiz[]) => {
    if (!options.anlegen) {
      return { ok: false, text: 'Der Backstory Creator ist nicht verfügbar.', angelegt: 0 };
    }
    try {
      return await options.anlegen(notizen);
    } catch (fehler) {
      return {
        ok: false,
        text: String(fehler instanceof Error ? fehler.message : fehler),
        angelegt: 0
      };
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
      // Nichts zu sichern: der Entwurf lebt in der Sitzung, und was bleiben
      // soll, ist beim Uebernehmen schon drueben.
    },
    setLanguage: async (webContents, language) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('sprache:gesetzt'), language);
    }
  };
}
