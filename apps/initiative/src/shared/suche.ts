/**
 * Begegnungen wiederfinden.
 *
 * **Warum die Teilnehmer mitgesucht werden.** Wer eine Begegnung sucht, weiss
 * oft nicht mehr, wie sie hiess — wohl aber, wer darin vorkam: „der Kampf mit
 * den Ghulen". Eine Suche nur ueber den Namen der Begegnung fuehrt dann ins
 * Leere, obwohl die Antwort in der Datei steht.
 *
 * Gesucht wird ohne Ruecksicht auf Gross- und Kleinschreibung und in Worten,
 * nicht als eine Zeichenkette: „ghul wald" findet die Begegnung „Waldlager",
 * in der ein Ghul steht. Das ist die Art Suche, die man am Tisch tippt.
 */

import type { Begegnung } from './types';

export type Sortierung = 'name' | 'groesse';

/** Kleinschreibung und Umlaute vereinheitlichen, damit „Bär" auf „bar" passt. */
function schluessel(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');
}

/** Alles, worin gesucht wird: der Name der Begegnung und jeder Teilnehmer. */
export function heuhaufen(begegnung: Begegnung): string {
  return schluessel([begegnung.name, ...begegnung.teilnehmer.map((t) => t.name)].join(' '));
}

export function passt(begegnung: Begegnung, suche: string): boolean {
  const worte = schluessel(suche).split(/\s+/).filter(Boolean);
  if (worte.length === 0) return true;
  const stroh = heuhaufen(begegnung);
  // Alle Worte muessen vorkommen, nicht irgendeines: sonst wird die Liste mit
  // jedem getippten Wort laenger statt kuerzer.
  return worte.every((wort) => stroh.includes(wort));
}

/**
 * Wo der Treffer sass — fuer die Kachel.
 *
 * Wer nach „ghul" sucht und eine Begegnung „Waldlager" angezeigt bekommt,
 * will wissen, warum. Die Kachel nennt dann die Teilnehmer, auf die es passte.
 */
export function treffendeTeilnehmer(begegnung: Begegnung, suche: string): string[] {
  const worte = schluessel(suche).split(/\s+/).filter(Boolean);
  if (worte.length === 0) return [];
  return begegnung.teilnehmer
    .filter((teilnehmer) => worte.some((wort) => schluessel(teilnehmer.name).includes(wort)))
    .map((teilnehmer) => teilnehmer.name);
}

export function finde(
  begegnungen: readonly Begegnung[],
  suche: string,
  sortierung: Sortierung = 'name'
): Begegnung[] {
  const gefunden = begegnungen.filter((begegnung) => passt(begegnung, suche));
  return [...gefunden].sort((a, b) =>
    sortierung === 'groesse'
      ? b.teilnehmer.length - a.teilnehmer.length || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name)
  );
}
