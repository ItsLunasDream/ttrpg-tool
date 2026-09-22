/**
 * Die Montage-Schnittstelle des Initiative Trackers (Konvention 7).
 *
 * Die Huelle ruft `mountInitiative` und bekommt zurueck, was sie zum Anzeigen
 * braucht: Preload, Oberflaeche, die Content-Security-Policy und die
 * Sprachkopplung. Die Anwendung selbst merkt nicht, dass sie eingebettet
 * laeuft.
 *
 * Anders als der Story Creator bringt der Tracker keinen eigenen
 * eigenstaendigen Hauptprozess mit: er laeuft ausschliesslich in der Huelle.
 * Ein zweiter Einstiegspunkt waere Code, den niemand benutzt und den trotzdem
 * jeder pflegen muesste.
 */
import path from 'node:path';
import type { Eintrag as SuchEintrag } from '@suite/eintraege';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { Ablage } from './ablage';
import { registriereIpc, entferneIpc } from './ipc';
import { behandleBildProtokoll, registriereBildSchema } from './bildProtokoll';
import { kanal, BILD_SCHEMA } from '../shared/kanaele';

export { registriereBildSchema };

export interface InitiativeEmbedOptions {
  /** Wohin der Tracker seine Daten legt. */
  readonly userDataDir: string;
  /** Wo die gebaute Oberflaeche liegt (dist/renderer). */
  readonly distDir: string;
  /** Sitzung der eingebetteten Ansicht, fuer Protokoll und CSP. */
  readonly partition?: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  /** Wird gerufen, wenn *hier* die Sprache umgestellt wurde. */
  readonly onLanguageChange?: (language: string) => void;
}

export interface InitiativeEmbed {
  readonly preloadPath: string;
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  /** Die Richtlinie, die die Huelle ueber die Sitzung legt. */
  readonly csp: string;
  /** Sichert Ungespeichertes. Der Tracker schreibt laufend, hier bleibt wenig. */
  flush(): Promise<void>;
  setLanguage(webContents: WebContents, language: string): Promise<void>;
  /**
   * Zeigt einen Eintrag, den die Suche der Huelle gefunden hat.
   *
   * Antwortet `false`, wenn die Ansicht weg ist. Ob es den Eintrag noch
   * gibt, entscheidet die Oberflaeche — sie hat die Liste.
   */
  zeigeEintrag(webContents: WebContents, kennung: string): Promise<boolean>;
}

/**
 * Die Content-Security-Policy des Trackers.
 *
 * `img-src` erlaubt das eigene Bildprotokoll — ohne diesen Eintrag blieben die
 * Bilder der Teilnehmer leer, und zwar ohne sichtbaren Fehler. `style-src`
 * braucht 'unsafe-inline', weil React Stile ueber `style`-Attribute setzt.
 * Kein `unsafe-eval`, kein `connect-src` nach draussen: der Tracker redet mit
 * niemandem.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${BILD_SCHEMA}:`,
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'"
].join('; ');

/**
 * Was dieses Werkzeug abgelegt hat, fuer die Suche der Huelle.
 *
 * Nur die Begegnungen: der laufende Kampf ist kein Eintrag, den man sucht,
 * sondern der Zustand des Abends. Die Teilnehmer gehoeren als Stichworte
 * dazu — wer eine Begegnung sucht, weiss oft nur noch, wer darin vorkam.
 */
export async function leseEintraege(datenordner: string): Promise<SuchEintrag[]> {
  try {
    // `datenordner` ist die Wurzel der Huelle, nicht der Ordner dieses
    // Werkzeugs: jedes Werkzeug haengt seinen eigenen Unterordner an (siehe
    // `datenordner(id)` in der Huelle). Ohne das `initiative` hier laese die
    // Ablage in der Wurzel — und faende stumm nichts.
    const begegnungen = await new Ablage(path.join(datenordner, 'initiative')).listeBegegnungen();
    return begegnungen.map((begegnung) => ({
      werkzeug: 'initiative',
      kennung: begegnung.id,
      name: begegnung.name,
      art: 'Begegnung',
      stichworte: begegnung.teilnehmer.map((teilnehmer) => teilnehmer.name).join(' ')
    }));
  } catch {
    return [];
  }
}

export async function mountInitiative(
  options: InitiativeEmbedOptions
): Promise<InitiativeEmbed> {
  const ablage = new Ablage(options.userDataDir);
  await ablage.init();
  registriereIpc(ablage);
  behandleBildProtokoll(ablage, options.partition);

  // Meldet die Oberflaeche einen Sprachwechsel, reicht die Huelle ihn an die
  // anderen Werkzeuge weiter.
  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
  ipcMain.on(kanal('sprache:gewechselt'), (_event, language: string) => {
    options.onLanguageChange?.(language);
  });

  return {
    zeigeEintrag: async (webContents, kennung) => {
      if (webContents.isDestroyed()) return false;
      webContents.send(kanal('suche:zeigen'), kennung);
      return true;
    },
    // Das Preload liegt neben dem gebuendelten Hauptprozessteil, die
    // Oberflaeche eine Ebene darueber.
    preloadPath: path.join(options.distDir, 'preload.js'),
    indexFile: options.devServerUrl ? null : path.join(options.distDir, '..', 'renderer', 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    csp: CSP,
    flush: async () => {
      // Der Tracker schreibt den laufenden Kampf bei jeder Aenderung. Hier
      // bleibt nichts zu sichern — die Zusage steht trotzdem in der
      // Schnittstelle, damit die Huelle alle Werkzeuge gleich behandeln kann.
    },
    setLanguage: async (webContents, language) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('sprache:gesetzt'), language);
    }
  };
}

/** Meldet alles ab. Fuer Tests und einen sauberen Abbau. */
export function unmountInitiative(): void {
  entferneIpc();
  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
}
