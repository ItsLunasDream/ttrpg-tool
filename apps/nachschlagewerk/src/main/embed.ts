/**
 * Die Montage-Schnittstelle des Nachschlagewerks (Konvention 7).
 *
 * Die Huelle ruft `mountNachschlagewerk` und bekommt zurueck, was sie zum
 * Anzeigen braucht. Kein eigenstaendiger Hauptprozess, aus demselben Grund
 * wie beim Encounter Creator: das Werkzeug laeuft nur in der Huelle.
 *
 * Der offizielle Bestand steht fest und kommt aus `@suite/srd`. Geschrieben
 * wird nur eines: die Hausregeln, als Markdown-Dateien unter
 * `<datenordner>/hausregeln`. Damit gehoert das Werkzeug in die Sicherung,
 * und die nimmt den Ordner von selbst mit.
 */
import path from 'node:path';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import type { Eintrag } from '@suite/eintraege';
import { ART_NAME, alleRegeln } from '../shared/bestand';
import { kanal } from '../shared/kanaele';
import {
  alsMarkdown,
  freieKennung,
  leseHausregel,
  zuId,
  type Hausregel
} from '../shared/hausregeln';

/** Der Ordner der Hausregeln im Datenordner des Werkzeugs. */
export const ORDNER_NAME = 'hausregeln';

async function leseHausregeln(ordner: string): Promise<Hausregel[]> {
  let dateien: string[];
  try {
    dateien = await readdir(ordner);
  } catch {
    return [];
  }
  const heraus: Hausregel[] = [];
  for (const datei of dateien) {
    if (!datei.endsWith('.md')) continue;
    try {
      heraus.push(leseHausregel(await readFile(path.join(ordner, datei), 'utf8'), datei.slice(0, -3)));
    } catch {
      // Eine unlesbare Datei kippt die Liste nicht.
    }
  }
  return heraus;
}

/** Der Name, unter dem das Werkzeug in der Huelle und in der Suche steht. */
export const WERKZEUG = 'nachschlagewerk';

export interface NachschlagewerkEmbedOptions {
  readonly distDir: string;
  /** Der eigene Datenordner; darin liegen die Hausregeln. */
  readonly datenordner: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
}

export interface NachschlagewerkEmbed {
  readonly preloadPath: string;
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly csp: string;
  flush(): Promise<void>;
  setLanguage(webContents: WebContents, language: string): Promise<void>;
  /** Zeigt einen Eintrag, den die Suche der Huelle gefunden hat. */
  zeigeEintrag(webContents: WebContents, kennung: string): Promise<boolean>;
}

/**
 * Die Content-Security-Policy.
 *
 * `style-src` braucht 'unsafe-inline', weil React Stile ueber
 * `style`-Attribute setzt. Kein `unsafe-eval`, kein `connect-src` nach
 * draussen: ein Nachschlagewerk, das offline sein soll, redet mit niemandem.
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

/**
 * Der offizielle Bestand, fuer die Suche der Huelle (Strg+K).
 *
 * DAS IST DER EIGENTLICHE GEWINN DIESES WERKZEUGS. Bisher fand die Suche
 * nur Selbstgebautes; ab hier findet „poisoned" den offiziellen Zustand UND
 * den eigenen aus dem Status Effect Creator, nebeneinander.
 *
 * Beide Sprachen als Stichworte: wer „prone" tippt, soll „Liegend" finden,
 * auch wenn die Huelle auf Deutsch steht. Die englischen Begriffe sind am
 * Tisch ohnehin im Umlauf. Der Name steht in der Sprache der Huelle — die
 * kennt dieser Leser nicht, also die deutsche als Anzeige und die englische
 * in den Stichworten; die Suche der Huelle gewichtet den Namen hoeher.
 *
 * `datenordner` wird nicht gebraucht und steht trotzdem in der Unterschrift:
 * alle Leser haben dieselbe, und die Huelle ruft sie gleich auf.
 */
export async function leseEintraege(datenordner: string): Promise<Eintrag[]> {
  // Die Huelle gibt ihren Datenordner; darin hat jedes Werkzeug seinen.
  const hausregeln = await leseHausregeln(path.join(datenordner, WERKZEUG, ORDNER_NAME));
  const eigene: Eintrag[] = hausregeln.map((regel) => ({
    werkzeug: WERKZEUG,
    kennung: `hausregel/${regel.id}`,
    name: regel.name,
    art: 'Hausregel',
    stichworte: `House rule ${regel.text.slice(0, 200)}`
  }));
  return [...eigene, ...alleRegeln().map((regel) => ({
    werkzeug: WERKZEUG,
    kennung: regel.id,
    name: regel.name.de,
    art: ART_NAME[regel.art].de,
    stichworte: [regel.name.en, ART_NAME[regel.art].en, 'SRD'].join(' ')
  }))];
}

export async function mountNachschlagewerk(
  options: NachschlagewerkEmbedOptions
): Promise<NachschlagewerkEmbed> {
  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
  ipcMain.on(kanal('sprache:gewechselt'), (_event, language: string) => {
    options.onLanguageChange?.(language);
  });

  const ordner = path.join(options.datenordner, ORDNER_NAME);
  await mkdir(ordner, { recursive: true });

  const handle = (name: string, hoerer: (...a: never[]) => unknown) => {
    ipcMain.removeHandler(kanal(name));
    ipcMain.handle(kanal(name), hoerer as never);
  };

  handle('hausregeln:liste', async (): Promise<Hausregel[]> => leseHausregeln(ordner));

  /*
   * Beim ANLEGEN eine freie Kennung, beim Bearbeiten die alte: zwei
   * Hausregeln „Kritische Treffer" sollen sich nicht ueberschreiben, und
   * eine umbenannte soll keine Kopie hinterlassen.
   */
  handle(
    'hausregeln:speichern',
    async (_e: never, regel: Hausregel, neu: boolean): Promise<{ ok: boolean; id: string; text: string }> => {
      const vergeben = neu ? (await leseHausregeln(ordner)).map((r) => r.id) : [];
      const id = neu ? freieKennung(zuId(regel.name), vergeben) : zuId(regel.id);
      try {
        await writeFile(
          path.join(ordner, `${id}.md`),
          alsMarkdown({ ...regel, id, geaendert: new Date().toISOString() }),
          'utf8'
        );
        return { ok: true, id, text: '' };
      } catch (fehler) {
        return { ok: false, id, text: String(fehler instanceof Error ? fehler.message : fehler) };
      }
    }
  );

  handle('hausregeln:loeschen', async (_e: never, id: string): Promise<boolean> => {
    try {
      await unlink(path.join(ordner, `${zuId(id)}.md`));
      return true;
    } catch {
      return false;
    }
  });

  return {
    preloadPath: path.join(options.distDir, 'preload.js'),
    indexFile: options.devServerUrl
      ? null
      : path.join(options.distDir, '..', 'renderer', 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    csp: CSP,
    flush: async () => {
      // Nichts zu sichern: der Bestand steht fest. Die Zusage steht trotzdem
      // in der Schnittstelle, damit die Huelle alle Werkzeuge gleich
      // behandeln kann — und die Hausregeln sie spaeter brauchen.
    },
    setLanguage: async (webContents, language) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('sprache:gesetzt'), language);
    },
    zeigeEintrag: async (webContents, kennung) => {
      if (webContents.isDestroyed()) return false;
      webContents.send(kanal('suche:zeigen'), kennung);
      return true;
    }
  };
}

/** Meldet alles ab. Fuer Tests und einen sauberen Abbau. */
export function unmountNachschlagewerk(): void {
  for (const name of ['hausregeln:liste', 'hausregeln:speichern', 'hausregeln:loeschen']) {
    ipcMain.removeHandler(kanal(name));
  }
  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
}
