/**
 * Die Suche in der eigenen Sammlung.
 *
 * Dieselbe Regel wie in den anderen Werkzeugen, und dieselbe wie in
 * `@suite/eintraege`: Umlaute und Grossschreibung stoeren nicht, alle Worte
 * muessen vorkommen. Gesucht wird auch in den Gegnernamen — wer eine
 * Begegnung sucht, weiss oft nur noch, wer darin vorkam.
 */
import type { Eintrag } from './ablage';

export function schluessel(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');
}

function heuhaufen(eintrag: Eintrag): string {
  return schluessel([eintrag.name, ...eintrag.gegnernamen].join(' '));
}

export function passt(eintrag: Eintrag, suche: string): boolean {
  const worte = schluessel(suche).split(/\s+/).filter(Boolean);
  if (worte.length === 0) return true;
  const stroh = heuhaufen(eintrag);
  return worte.every((wort) => stroh.includes(wort));
}

export type Sortierung = 'geaendert' | 'name' | 'gegner';

export function finde(
  eintraege: readonly Eintrag[],
  suche: string,
  sortierung: Sortierung = 'geaendert'
): Eintrag[] {
  const getroffen = eintraege.filter((eintrag) => passt(eintrag, suche));
  return [...getroffen].sort((a, b) => {
    if (sortierung === 'name') return a.name.localeCompare(b.name, 'de');
    if (sortierung === 'gegner') return b.gegnerzahl - a.gegnerzahl;
    // „Zuletzt geaendert" zuerst: das ist fast immer das Gesuchte.
    return b.geaendert.localeCompare(a.geaendert);
  });
}
