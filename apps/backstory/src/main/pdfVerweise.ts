/**
 * Verweise im gedruckten PDF.
 *
 * Steht fuer sich, damit es sich ohne Druckfenster pruefen laesst: pdfExport
 * selbst zieht Electron herein und laeuft nur im Hauptprozess.
 */
import { normalizeName, WIKI_LINK_PATTERN } from '../shared/wikilinks';
import type { Note } from '../shared/types';

/**
 * Sprungziel einer Notiz.
 *
 * Aus der Kennung gebaut und nicht aus dem Titel: zwei Notizen duerfen
 * denselben Titel tragen, ein Anker muss aber eindeutig sein.
 */
export function anker(note: Pick<Note, 'id'>): string {
  return `notiz-${note.id}`;
}

/** Die Notizen des Dokuments, nach Titel und Alias nachschlagbar. */
export function nachNamen(notes: Note[]): Map<string, Note> {
  const karte = new Map<string, Note>();
  for (const note of notes) {
    for (const name of [note.title, ...note.aliases]) karte.set(normalizeName(name), note);
  }
  return karte;
}

/**
 * Wiki-Links werden zu Sprungzielen, wenn die gemeinte Notiz mit im Export
 * ist. Ist sie es nicht, bleibt nur ihr Anzeigetext stehen — ein Sprung ins
 * Leere ist schlimmer als kein Sprung.
 */
export function verlinkeImDokument(markdown: string, enthalten: Map<string, Note>): string {
  return markdown.replace(
    new RegExp(WIKI_LINK_PATTERN.source, 'g'),
    (_ganz, ziel: string, _trenner: string | undefined, text?: string) => {
      const gemeint = enthalten.get(normalizeName(ziel));
      const beschriftung = (text ?? '').trim() || ziel;
      return gemeint ? `[${beschriftung}](#${anker(gemeint)})` : beschriftung;
    }
  );
}
