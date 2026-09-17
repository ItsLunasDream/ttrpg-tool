/**
 * Die Suche in der Sammlung: EIN Feld statt dreier.
 *
 * Dasselbe Verhalten wie im Monster Creator, damit man es nicht zweimal
 * lernen muss: Woerter suchen Name, Art, Thema und Haerte, Zahlen das
 * Gewicht oder die Stufenzahl, und mehrere Woerter heissen UND.
 */

import type { Eintrag } from './ablage';
import { ARTEN, HAERTEN, THEMEN, text, type Sprache } from './tabellen';

export interface Anfrage {
  readonly text: string;
  readonly artId?: string;
  readonly themaId?: string;
}

/** „3 stufen" oder „stufen 3" — die Zahl, die als Stufenzahl gemeint ist. */
function stufenwunsch(woerter: readonly string[]): number | null {
  const sagtStufen = woerter.some((wort) => /^(stufen?|levels?)$/.test(wort));
  if (!sagtStufen) return null;
  for (const wort of woerter) {
    if (/^\d+$/.test(wort)) return Number(wort);
  }
  return null;
}

export function passt(eintrag: Eintrag, anfrage: Anfrage, sprache: Sprache): boolean {
  if (anfrage.artId && eintrag.artId !== anfrage.artId) return false;
  if (anfrage.themaId && eintrag.themaId !== anfrage.themaId) return false;

  const woerter = anfrage.text
    .toLowerCase()
    .split(/\s+/)
    .filter((wort) => wort !== '');
  if (woerter.length === 0) return true;

  const stufen = stufenwunsch(woerter);
  if (stufen !== null && eintrag.stufen !== stufen) return false;

  const art = ARTEN.find((a) => a.id === eintrag.artId);
  const thema = THEMEN.find((t) => t.id === eintrag.themaId);
  const haerte = HAERTEN.find((h) => h.id === eintrag.haerteId);
  const heuhaufen = [
    eintrag.name,
    eintrag.artId,
    eintrag.themaId,
    eintrag.haerteId,
    art ? text(art.name, sprache) : '',
    thema ? text(thema.name, sprache) : '',
    haerte ? text(haerte.name, sprache) : ''
  ]
    .join(' ')
    .toLowerCase();

  for (const wort of woerter) {
    // Was als Stufenzahl gelesen wurde, muss nicht auch im Text stehen.
    if (stufen !== null && (/^\d+$/.test(wort) || /^(stufen?|levels?)$/.test(wort))) continue;
    if (!heuhaufen.includes(wort)) return false;
  }
  return true;
}

export type Sortierung = 'gewicht' | 'name' | 'geaendert';

export function sortiere(eintraege: readonly Eintrag[], nach: Sortierung): Eintrag[] {
  const heraus = [...eintraege];
  heraus.sort((a, b) => {
    if (nach === 'name') return a.name.localeCompare(b.name);
    if (nach === 'geaendert') {
      const diff = b.geaendert.localeCompare(a.geaendert);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    }
    // Nach Betrag: ein Segen wiegt negativ und gehoert trotzdem nach oben,
    // wenn er viel gibt.
    const diff = Math.abs(a.gewicht) - Math.abs(b.gewicht);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
  return heraus;
}

export function finde(
  eintraege: readonly Eintrag[],
  anfrage: Anfrage,
  nach: Sortierung,
  sprache: Sprache
): Eintrag[] {
  return sortiere(
    eintraege.filter((eintrag) => passt(eintrag, anfrage, sprache)),
    nach
  );
}
