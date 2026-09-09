/**
 * Sprachwahl und Textersetzung fuer alle Anwendungen der Sammlung.
 *
 * Das Paket bringt den Mechanismus, nicht die Texte: welche Sprachen es gibt,
 * welche voreingestellt ist, wie ein Text zu einem Schluessel gefunden wird
 * und wie Platzhalter ersetzt werden. Die Texte selbst gehoeren zu der
 * Anwendung, die sie anzeigt — ein geteiltes Woerterbuch ueber alle Programme
 * hinweg waere schnell ein Sammelsurium aus Begriffen, die anderswo nicht
 * passen.
 *
 * Plattformfrei nach Regel 4 der Konventionen: kein node:*, kein electron,
 * keine Browser-Globals.
 */

export type Language = 'en' | 'de';

export const LANGUAGES: readonly { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' }
];

/**
 * Die Sprache, in der jedes Programm der Sammlung startet, solange nichts
 * anderes eingestellt ist.
 *
 * Englisch, weil die Programme veroeffentlicht werden und die meisten
 * Menschen, die sie finden, kein Deutsch lesen. Wer Deutsch will, stellt es
 * einmal in den Einstellungen um; die Wahl wird gespeichert. Eine bereits
 * getroffene Wahl aendert diese Konstante nicht — sie gilt nur dort, wo noch
 * keine steht.
 */
export const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'de';
}

/** Werte, die in Platzhalter der Form {name} eingesetzt werden. */
export type MessageParams = Record<string, string | number>;

/**
 * Ersetzt Platzhalter der Form {name} durch die uebergebenen Werte.
 *
 * Ein Platzhalter, fuer den nichts uebergeben wurde, bleibt unveraendert
 * stehen. Das ist Absicht: „{count} Woerter" faellt beim Lesen sofort auf,
 * ein stillschweigend geloeschter Platzhalter („ Woerter") nicht.
 */
export function fillPlaceholders(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (ganz, name: string) =>
    name in params ? String(params[name]) : ganz
  );
}

/**
 * Baut eine Uebersetzungsfunktion ueber einem Woerterbuch.
 *
 * `leitsprache` ist die Sprache, die alle Schluessel vollstaendig enthaelt.
 * Fehlt ein Schluessel in der gewaehlten Sprache, wird ihr Text benutzt, und
 * fehlt er auch dort, der Schluessel selbst — damit in der Oberflaeche nie
 * eine leere Stelle steht, sondern schlimmstenfalls etwas erkennbar Falsches.
 */
export function createTranslator<K extends string>(
  woerterbuch: Record<Language, Partial<Record<K, string>>>,
  leitsprache: Language = DEFAULT_LANGUAGE
): (sprache: Language, schluessel: K, params?: MessageParams) => string {
  return (sprache, schluessel, params) => {
    const text =
      woerterbuch[sprache]?.[schluessel] ?? woerterbuch[leitsprache]?.[schluessel] ?? schluessel;
    return fillPlaceholders(text, params);
  };
}
