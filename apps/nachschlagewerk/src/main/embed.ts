/**
 * Die Montage-Schnittstelle des Nachschlagewerks (Konvention 7).
 *
 * Die Huelle ruft `mountNachschlagewerk` und bekommt zurueck, was sie zum
 * Anzeigen braucht. Kein eigenstaendiger Hauptprozess, aus demselben Grund
 * wie beim Encounter Creator: das Werkzeug laeuft nur in der Huelle.
 *
 * NOCH KEINE ABLAGE. Der Bestand ist der offizielle und steht fest; er kommt
 * aus `@suite/srd` und muss nicht gelesen werden. Die Ablage kommt mit den
 * Hausregeln (#145) — dann schreibt dieses Werkzeug, und dann gehoert es auch
 * in die Sicherung.
 */
import path from 'node:path';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import type { Eintrag } from '@suite/eintraege';
import { ART_NAME, alleRegeln } from '../shared/bestand';
import { kanal } from '../shared/kanaele';

/** Der Name, unter dem das Werkzeug in der Huelle und in der Suche steht. */
export const WERKZEUG = 'nachschlagewerk';

export interface NachschlagewerkEmbedOptions {
  readonly distDir: string;
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
export async function leseEintraege(_datenordner: string): Promise<Eintrag[]> {
  return alleRegeln().map((regel) => ({
    werkzeug: WERKZEUG,
    kennung: regel.id,
    name: regel.name.de,
    art: ART_NAME[regel.art].de,
    stichworte: [regel.name.en, ART_NAME[regel.art].en, 'SRD'].join(' ')
  }));
}

export async function mountNachschlagewerk(
  options: NachschlagewerkEmbedOptions
): Promise<NachschlagewerkEmbed> {
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
  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
}
