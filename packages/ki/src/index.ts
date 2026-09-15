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
import { ClaudeAnbieter } from './claude';
import { CLAUDE_VOREINSTELLUNG, type KiEinstellungen } from './einstellungen';
import { OllamaAnbieter } from './ollama';
import { OffenerAnbieter } from './offen';
import type { KiAnbieter } from './anbieter';

export { KiFehler } from './anbieter';
export type { KiAnbieter, KiAnfrage, KiNachricht, KiSchluessel, KiWerte, KiZustand } from './anbieter';
export { OllamaAnbieter } from './ollama';
export { ClaudeAnbieter } from './claude';
export { OffenerAnbieter, baueUrl, leseStrom } from './offen';
export {
  CLAUDE_VOREINSTELLUNG,
  istAnbieterId,
  KI_VOREINSTELLUNGEN
} from './einstellungen';
export type { KiAnbieterId, KiEinstellungen } from './einstellungen';

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
    case 'offen':
      return new OffenerAnbieter({
        adresse: einstellungen.offenAdresse,
        modell: einstellungen.offenModell,
        schluessel
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
