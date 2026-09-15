/**
 * Welche Notizen als Kontext an den Assistenten gehen.
 *
 * Steht in shared, weil es zwei Seiten wissen muessen: der Hauptprozess
 * schickt sie, und die Oberflaeche sagt daneben, wie viele es sind. Zwei
 * Rechnungen an zwei Orten nennten frueher oder spaeter verschiedene Zahlen,
 * und dann stuende neben dem Kaestchen eine Zahl, die nicht stimmt.
 *
 * Plattformfrei: kein node:*, kein electron.
 */
import type { Note } from './types';
import { findWikiLinks, normalizeName } from './wikilinks';

/**
 * Hoechstens so viele. Ohne diese Grenze waechst die Anfrage mit der
 * Kampagne und wird teuer, ohne besser zu werden.
 */
export const KONTEXT_HOECHSTENS = 12;

/** Verlinkt heisst: im Text erwaehnt oder ueber eine Beziehung verbunden. */
export function verlinkteNotizen(note: Note, notes: Note[], hoechstens = KONTEXT_HOECHSTENS): Note[] {
  const nachName = new Map<string, Note>();
  for (const eintrag of notes) {
    for (const name of [eintrag.title, ...eintrag.aliases]) nachName.set(normalizeName(name), eintrag);
  }

  const verlinkt = new Map<string, Note>();
  for (const link of findWikiLinks(note.body)) {
    const ziel = nachName.get(normalizeName(link.target));
    if (ziel && ziel.id !== note.id) verlinkt.set(ziel.id, ziel);
  }
  for (const beziehung of note.relations) {
    const ziel = notes.find((eintrag) => eintrag.id === beziehung.targetId);
    if (ziel && ziel.id !== note.id) verlinkt.set(ziel.id, ziel);
  }

  return [...verlinkt.values()].slice(0, hoechstens);
}
