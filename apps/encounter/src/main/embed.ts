/**
 * Die Montage-Schnittstelle des Encounter Creators (Konvention 7).
 *
 * Die Huelle ruft `mountEncounter` und bekommt zurueck, was sie zum
 * Anzeigen braucht. Kein eigenstaendiger Hauptprozess: das Werkzeug laeuft
 * ausschliesslich in der Huelle, und ein zweiter Einstiegspunkt waere Code,
 * den niemand benutzt und den trotzdem jeder pflegen muesste.
 *
 * EINE EIGENE ABLAGE, und zwar aus demselben Grund wie ueberall: ein Ordner
 * `encounter` im Datenordner, eine Markdown-Datei je Begegnung. Der
 * Initiative Tracker wird sie spaeter lesen (Stufe 4) — derselbe Ordner ist
 * die billigste Kopplung, die es gibt, und sie ueberlebt, wenn eines der
 * beiden Werkzeuge umgebaut wird.
 */
import path from 'node:path';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import type { Eintrag as SuchEintrag } from '@suite/eintraege';
import type { Uebergabe } from '@suite/uebergabe';
import { kanal } from '../shared/kanaele';
import { alsMonsterkarte, type Monsterkarte } from '../shared/monsterliste';
import {
  alsEintrag,
  alsMarkdown,
  freieKennung,
  leseBegegnung,
  zuId,
  type Begegnung,
  type Eintrag
} from '../shared/ablage';

/** Der Unterordner im Datenordner. Auch fuer die Suche der Huelle. */
export const ORDNER_NAME = 'encounter';

export interface EncounterEmbedOptions {
  readonly distDir: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
  /** Wohin die Begegnungen gehoeren. Ueblicherweise der Datenordner der Huelle. */
  readonly datenordner: string;
  /**
   * Wo die Monster des Monster Creators liegen.
   *
   * Die Huelle reicht den Pfad durch, weil sie beide Werkzeuge kennt und
   * dieses hier keines von beiden ueber das andere wissen soll. Fehlt er,
   * bleibt die Auswahlliste leer — das ist kein Fehler, sondern der Fall
   * „noch kein Monster gebaut".
   */
  readonly monsterordner?: string;
  /**
   * Schiebt eine Begegnung in den Initiative Tracker.
   *
   * Reicht die Huelle durch, und nur sie: dieses Werkzeug kennt den
   * Tracker nicht, und der Tracker kennt dieses hier nicht. Derselbe Weg
   * wie bei „Karte anlegen" aus der Inspirationshilfe. Fehlt der Haken,
   * bleibt der Knopf ohne Wirkung und meldet das ehrlich.
   */
  readonly inDenTracker?: (uebergabe: Uebergabe) => Promise<boolean>;
}

export interface EncounterEmbed {
  readonly preloadPath: string;
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly csp: string;
  /** Wo die Begegnungen liegen. Der Tracker wird denselben Pfad lesen. */
  readonly ordner: string;
  flush(): Promise<void>;
  setLanguage(webContents: WebContents, language: string): Promise<void>;
  /** Zeigt eine Begegnung, die die Suche der Huelle gefunden hat. */
  zeigeEintrag(webContents: WebContents, kennung: string): Promise<boolean>;
}

/**
 * Die Content-Security-Policy.
 *
 * `style-src` braucht 'unsafe-inline', weil React Stile ueber
 * `style`-Attribute setzt. Kein `unsafe-eval`, kein `connect-src` nach
 * draussen: dieses Werkzeug redet mit niemandem.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'"
].join('; ');

/** Der Ordner, in dem die Begegnungen liegen. */
function ordnerVon(datenordner: string): string {
  return path.join(datenordner, ORDNER_NAME);
}

function dateiVon(ordner: string, id: string): string {
  return path.join(ordner, `${zuId(id)}.md`);
}

/** Alle Begegnungen, die auf der Platte liegen. */
async function leseAlle(ordner: string): Promise<Begegnung[]> {
  let dateien: string[];
  try {
    dateien = await readdir(ordner);
  } catch {
    // Noch nichts angelegt ist kein Fehler.
    return [];
  }
  const heraus: Begegnung[] = [];
  for (const datei of dateien) {
    if (!datei.endsWith('.md')) continue;
    try {
      const text = await readFile(path.join(ordner, datei), 'utf8');
      heraus.push(leseBegegnung(text, datei.slice(0, -3)));
    } catch {
      // Eine unlesbare Datei darf die Liste nicht kippen — die uebrigen
      // Begegnungen soll man trotzdem oeffnen koennen.
    }
  }
  return heraus;
}

/**
 * Was dieses Werkzeug abgelegt hat, fuer die Suche der Huelle.
 *
 * Die Gegner gehoeren als Stichworte dazu: wer eine Begegnung sucht, weiss
 * oft nur noch, wer darin vorkam.
 */
export async function leseEintraege(datenordner: string): Promise<SuchEintrag[]> {
  /*
   * ZWEIMAL `encounter`. Die Huelle gibt dem Werkzeug seinen eigenen
   * Unterordner, und `mountEncounter` legt darin den Ablageordner an — der
   * Bestand liegt unter `<userData>/encounter/encounter`.
   *
   * Dieselbe Falle hatten Monster und Zustaende, dort war sie ein Fehler:
   * die Suche las den Elternordner und fand nichts.
   */
  const begegnungen = await leseAlle(ordnerVon(path.join(datenordner, ORDNER_NAME)));
  return begegnungen.map((begegnung) => ({
    werkzeug: 'encounter',
    kennung: begegnung.id,
    name: begegnung.name,
    art: 'Begegnung',
    stichworte: begegnung.gegner.map((einer) => einer.name).join(' ')
  }));
}

export async function mountEncounter(
  options: EncounterEmbedOptions
): Promise<EncounterEmbed> {
  const ordner = ordnerVon(options.datenordner);
  await mkdir(ordner, { recursive: true });

  // `removeHandler` vor jedem `handle`: die Huelle kann ein Werkzeug
  // abbauen und neu montieren, und ein zweites Mal denselben Kanal
  // anzumelden wirft.
  const handle = (name: string, hoerer: (...a: never[]) => unknown) => {
    ipcMain.removeHandler(kanal(name));
    ipcMain.handle(kanal(name), hoerer as never);
  };

  handle('liste', async (): Promise<Eintrag[]> =>
    (await leseAlle(ordner)).map(alsEintrag)
  );

  handle('lesen', async (_e: never, id: string): Promise<Begegnung | null> => {
    try {
      return leseBegegnung(await readFile(dateiVon(ordner, id), 'utf8'), zuId(id));
    } catch {
      return null;
    }
  });

  handle(
    'speichern',
    async (
      _e: never,
      begegnung: Begegnung,
      neu: boolean
    ): Promise<{ ok: boolean; id: string; text: string }> => {
      /*
       * Beim ANLEGEN eine freie Kennung suchen, beim Bearbeiten nicht.
       *
       * Namen wiederholen sich — zwei Begegnungen „Hinterhalt" sind der
       * Normalfall. Ohne diese Unterscheidung wuerde die zweite die erste
       * ueberschreiben; mit ihr an der falschen Stelle zoege jedes
       * Speichern eine Kopie nach sich.
       */
      const vergeben = neu ? (await leseAlle(ordner)).map((b) => b.id) : [];
      const id = neu ? freieKennung(zuId(begegnung.name), vergeben) : zuId(begegnung.id);
      const fertig: Begegnung = { ...begegnung, id, geaendert: new Date().toISOString() };
      try {
        await writeFile(dateiVon(ordner, id), alsMarkdown(fertig), 'utf8');
        return { ok: true, id, text: '' };
      } catch (fehler) {
        return {
          ok: false,
          id,
          text: String(fehler instanceof Error ? fehler.message : fehler)
        };
      }
    }
  );

  /*
   * Die Monster, aus denen man waehlen kann.
   *
   * Direkt von der Platte, bei jedem Oeffnen frisch. Kein Kanal zwischen
   * den beiden Werkzeugen und kein zweiter Bestand: wer sein Monster
   * gerade eben gebaut hat, soll es hier sofort finden.
   */
  handle('monster:liste', async (): Promise<Monsterkarte[]> => {
    if (!options.monsterordner) return [];
    let dateien: string[];
    try {
      dateien = await readdir(options.monsterordner);
    } catch {
      // Noch kein Monster gebaut.
      return [];
    }
    const heraus: Monsterkarte[] = [];
    for (const name of dateien) {
      if (!name.endsWith('.md')) continue;
      try {
        const inhalt = await readFile(path.join(options.monsterordner, name), 'utf8');
        heraus.push(alsMonsterkarte(inhalt, name.slice(0, -3)));
      } catch {
        // Eine kaputte Datei nimmt nicht die ganze Liste mit.
      }
    }
    return heraus;
  });

  /*
   * Der Weg in den Tracker.
   *
   * Hier wird nichts umgerechnet: was der Renderer zusammengestellt hat,
   * geht unveraendert an die Huelle. Die Uebersetzung in Teilnehmer und
   * Terrain macht der Tracker selbst, mit seinen eigenen Regeln.
   */
  handle('tracker', async (_e: never, uebergabe: Uebergabe): Promise<boolean> => {
    if (!options.inDenTracker) return false;
    return options.inDenTracker(uebergabe);
  });

  handle('loeschen', async (_e: never, id: string): Promise<boolean> => {
    try {
      await unlink(dateiVon(ordner, id));
      return true;
    } catch {
      return false;
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
    ordner,
    flush: async () => {
      // Die Oberflaeche speichert auf Knopfdruck; hier bleibt nichts liegen.
      // Die Zusage steht trotzdem in der Schnittstelle, damit die Huelle
      // alle Werkzeuge gleich behandeln kann.
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
export function unmountEncounter(): void {
  for (const name of ['liste', 'lesen', 'speichern', 'loeschen', 'monster:liste', 'tracker']) {
    ipcMain.removeHandler(kanal(name));
  }
  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
}
