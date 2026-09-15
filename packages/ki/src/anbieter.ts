/**
 * Die Schnittstelle, hinter der ein Sprachmodell steckt.
 *
 * Bewusst schmal: eine Frage rein, eine Antwort raus. Alles, was die
 * Werkzeuge der Sammlung mit einem Modell tun, laesst sich darauf abbilden —
 * Rueckfragen zur Hintergrundgeschichte genauso wie ein Vorschlag fuer den
 * Beruf einer Figur. Ein neuer Anbieter ist damit eine Datei, kein Eingriff
 * in eine Anwendung.
 *
 * Plattformfrei nach Regel 4: kein node:*, kein electron, keine
 * Browser-Globals. Der API-Schluessel wird uebergeben, nicht hier
 * gespeichert — verschluesseln und ablegen kann nur die Anwendung, weil nur
 * sie den Schluesselbund des Systems kennt.
 */

/**
 * Meldungsschluessel, die ein Anbieter zurueckgeben kann.
 *
 * Schluessel statt fertiger Texte, sonst waeren die Meldungen bei englischer
 * Oberflaeche weiterhin deutsch. Die Texte dazu gehoeren der Anwendung, die
 * sie anzeigt; die Namen sind so gewaehlt, dass sie in das Woerterbuch des
 * Story Creators passen, das sie schon fuehrt.
 */
export type KiSchluessel =
  | 'error.aiNoConnection'
  | 'error.aiTimeout'
  | 'error.aiHttp'
  | 'error.aiEmpty'
  | 'error.aiAuth'
  | 'error.aiRateLimit'
  | 'error.aiModelMissing'
  | 'error.aiRefused'
  | 'error.aiOther'
  | 'error.aiNoModels'
  | 'error.aiModelNotInstalled'
  | 'error.aiNoKey';

/** Werte fuer die Platzhalter der Meldung, etwa {status} oder {model}. */
export type KiWerte = Record<string, string | number>;

/** Ergebnis der Bereitschaftspruefung. Der Grund bleibt uebersetzbar. */
export type KiZustand =
  | { bereit: true; beschreibung: string }
  | { bereit: false; schluessel: KiSchluessel; werte?: KiWerte };

export interface KiNachricht {
  rolle: 'user' | 'assistant';
  inhalt: string;
}

/**
 * Eine Anfrage an das Modell.
 *
 * Systemanweisung und Nachrichten kommen fertig aus der Anwendung. Das Paket
 * kennt weder Notizen noch Figuren — es weiss nur, wie man mit einem Modell
 * spricht.
 */
export interface KiAnfrage {
  /** Die Systemanweisung. Legt fest, was das Modell tun darf und was nicht. */
  readonly system: string;
  /** Der Gespraechsverlauf, aelteste Nachricht zuerst, Frage zuletzt. */
  readonly nachrichten: readonly KiNachricht[];
}

export interface KiAnbieter {
  readonly id: string;
  /** Kurze Beschreibung des eingestellten Modells, fuer die Oberflaeche. */
  beschreibe(): string;
  /** Prueft, ob der Anbieter erreichbar und eingerichtet ist. */
  pruefe(): Promise<KiZustand>;
  /**
   * Stellt die Frage. `aufTeil` bekommt Teiltexte, sobald sie eintreffen;
   * der Rueckgabewert ist die vollstaendige Antwort. Anbieter ohne Stroemen
   * rufen `aufTeil` einfach einmal am Ende auf.
   */
  frage(anfrage: KiAnfrage, aufTeil: (text: string) => void): Promise<string>;
}

/**
 * Fehler eines Anbieters. Traegt einen Schluessel statt eines fertigen
 * Textes, damit die Anwendung ihn in ihrer Sprache anzeigen kann.
 */
export class KiFehler extends Error {
  constructor(readonly schluessel: KiSchluessel, readonly werte?: KiWerte) {
    super(schluessel);
    this.name = 'KiFehler';
  }
}
