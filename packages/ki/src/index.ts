/**
 * Anbindung an Sprachmodelle fuer alle Anwendungen der Sammlung.
 *
 * Das Paket bringt den Mechanismus, nicht die Aufgaben: wie man mit einem
 * Modell spricht, wie Fehler heissen, welche Anbieter es gibt. Was gefragt
 * wird, gehoert zu der Anwendung, die fragt — eine Systemanweisung fuer
 * Hintergrundgeschichten hat beim Erfinden einer Figur nichts zu suchen.
 *
 * Plattformfrei nach Regel 4: kein node:*, kein electron, keine
 * Browser-Globals. Auch das Ablegen des API-Schluessels fehlt hier bewusst —
 * verschluesseln kann nur, wer den Schluesselbund des Systems kennt, und das
 * ist die Anwendung.
 */
import { ClaudeAnbieter, CLAUDE_VOREINSTELLUNG } from './claude';
import { OllamaAnbieter } from './ollama';
import type { KiAnbieter } from './anbieter';

export { KiFehler } from './anbieter';
export type { KiAnbieter, KiAnfrage, KiNachricht, KiSchluessel, KiWerte, KiZustand } from './anbieter';
export { OllamaAnbieter } from './ollama';
export { ClaudeAnbieter, CLAUDE_VOREINSTELLUNG } from './claude';

export type KiAnbieterId = 'none' | 'ollama' | 'claude';

export function istAnbieterId(wert: unknown): wert is KiAnbieterId {
  return wert === 'none' || wert === 'ollama' || wert === 'claude';
}

/**
 * Was eingestellt sein muss, damit ein Anbieter entsteht.
 *
 * Der Schluessel steht nicht darin: er liegt verschluesselt in der Anwendung
 * und wird erst beim Bauen dazugegeben, damit er nirgends mitgereicht wird,
 * wo nur die Einstellungen hingehoeren — etwa in die Oberflaeche.
 */
export interface KiEinstellungen {
  readonly anbieter: KiAnbieterId;
  readonly ollamaAdresse: string;
  readonly ollamaModell: string;
  readonly claudeModell: string;
}

export const KI_VOREINSTELLUNGEN: KiEinstellungen = {
  anbieter: 'none',
  ollamaAdresse: 'http://127.0.0.1:11434',
  ollamaModell: 'llama3.1',
  claudeModell: CLAUDE_VOREINSTELLUNG
};

/**
 * Waehlt den eingestellten Anbieter aus. Der Rest der Sammlung kennt nur die
 * Schnittstelle, ein Wechsel aendert hier eine Zeile.
 */
export function baueAnbieter(
  einstellungen: KiEinstellungen,
  schluessel: string
): KiAnbieter | null {
  switch (einstellungen.anbieter) {
    case 'ollama':
      return new OllamaAnbieter({
        adresse: einstellungen.ollamaAdresse,
        modell: einstellungen.ollamaModell
      });
    case 'claude':
      return new ClaudeAnbieter({
        schluessel,
        modell: einstellungen.claudeModell || CLAUDE_VOREINSTELLUNG
      });
    default:
      return null;
  }
}

/**
 * Liest JSON aus einer Modellantwort.
 *
 * Modelle halten sich nicht zuverlaessig daran, nur JSON zu schicken: mal
 * steht ein Satz davor, mal liegt alles in einem ```json-Block. Statt das
 * dem Modell immer wieder zu erklaeren, wird es hier ausgepackt — und wenn
 * gar nichts zu finden ist, kommt null zurueck statt eines Absturzes.
 */
export function leseJsonAntwort<T>(antwort: string): T | null {
  const ohneZaun = antwort.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  const versuche = [ohneZaun, ausschnittZwischen(ohneZaun, '{', '}'), ausschnittZwischen(ohneZaun, '[', ']')];
  for (const versuch of versuche) {
    if (!versuch) continue;
    try {
      return JSON.parse(versuch) as T;
    } catch {
      // Naechster Versuch.
    }
  }
  return null;
}

/** Der Teil vom ersten Zeichen bis zum letzten, beide eingeschlossen. */
function ausschnittZwischen(text: string, auf: string, zu: string): string | null {
  const anfang = text.indexOf(auf);
  const ende = text.lastIndexOf(zu);
  if (anfang < 0 || ende <= anfang) return null;
  return text.slice(anfang, ende + 1);
}
