/**
 * Was eingestellt sein muss, damit eine KI-Anbindung entsteht.
 *
 * Bewusst eine eigene Datei und ein eigener Einstiegspunkt
 * (`@suite/ki/einstellungen`): eine Oberflaeche muss die Einstellungen
 * anzeigen und aendern koennen, ohne dabei die Anbieter mitzuladen. Ueber den
 * Hauptzugang `@suite/ki` kaeme das Anthropic-SDK mit ins Buendel des
 * Renderers — hundertfach die Groesse, fuer eine Aufzaehlung mit drei
 * Eintraegen, und in einer Oberflaeche ohne Netzzugriff ohne jeden Nutzen.
 */

export type KiAnbieterId = 'none' | 'ollama' | 'claude' | 'offen';

export function istAnbieterId(wert: unknown): wert is KiAnbieterId {
  return wert === 'none' || wert === 'ollama' || wert === 'claude' || wert === 'offen';
}

/** Voreinstellung. Bewusst nicht kleiner gewaehlt, die Wahl gehoert der Nutzerin. */
export const CLAUDE_VOREINSTELLUNG = 'claude-opus-5';

/**
 * Der Schluessel steht nicht darin: er liegt verschluesselt in der Anwendung
 * und wird erst beim Bauen des Anbieters dazugegeben, damit er nirgends
 * mitgereicht wird, wo nur die Einstellungen hingehoeren — etwa in die
 * Oberflaeche.
 */
export interface KiEinstellungen {
  readonly anbieter: KiAnbieterId;
  readonly ollamaAdresse: string;
  readonly ollamaModell: string;
  readonly claudeModell: string;
  /**
   * Basis-Adresse eines Dienstes mit der Schnittstelle von OpenAI. Leer,
   * solange dieser Anbieter nicht benutzt wird.
   */
  readonly offenAdresse: string;
  readonly offenModell: string;
}

export const KI_VOREINSTELLUNGEN: KiEinstellungen = {
  anbieter: 'none',
  ollamaAdresse: 'http://127.0.0.1:11434',
  ollamaModell: 'llama3.1',
  claudeModell: CLAUDE_VOREINSTELLUNG,
  // Keine Vorgabe: die Adresse haengt am Dienst, und ein geratener Wert
  // fuehrte nur zu einer Fehlermeldung, die nach einem Programmfehler
  // aussieht.
  offenAdresse: '',
  offenModell: ''
};
