import type { Language, MessageKey, MessageParams } from '../../shared/i18n';

/** Die drei Aufgaben, die der Assistent uebernimmt. Kein Textgenerator. */
export type AiTask = 'questions' | 'consistency' | 'style';

/** Ergebnis der Bereitschaftspruefung. Fehlergruende bleiben uebersetzbar. */
export type AiStatus =
  | { ready: true; detail: string }
  | { ready: false; key: MessageKey; params?: MessageParams };

export interface AiRequest {
  task: AiTask;
  language: Language;
  /** Die Notiz, um die es geht, bereits als Klartext aufbereitet. */
  note: string;
  /** Verlinkte Notizen als Kontext, gekuerzt. */
  context: string;
}

/**
 * Austauschbare Anbindung an ein Sprachmodell.
 *
 * Bewusst schmal gehalten: eine Frage rein, eine Antwort raus. Alles, was der
 * Assistent tut, laesst sich darauf abbilden. Ein neuer Anbieter ist damit
 * eine Datei, kein Eingriff in die Anwendung.
 */
export interface AiProvider {
  readonly id: string;
  /** Kurze Beschreibung des eingestellten Modells, fuer die Oberflaeche. */
  describe(): string;
  /**
   * Prueft, ob der Anbieter erreichbar und eingerichtet ist. Der Grund kommt
   * als Schluessel zurueck, damit er uebersetzt werden kann.
   */
  check(): Promise<AiStatus>;
  ask(request: AiRequest, systemPrompt: string, userPrompt: string): Promise<string>;
}

/**
 * Fehler eines Anbieters. Wie VaultError traegt er einen Schluessel statt
 * eines fertigen Textes, sonst waeren die Meldungen bei englischer
 * Oberflaeche weiterhin deutsch.
 */
export class AiError extends Error {
  constructor(readonly key: MessageKey, readonly params?: MessageParams) {
    super(key);
    this.name = 'AiError';
  }
}
