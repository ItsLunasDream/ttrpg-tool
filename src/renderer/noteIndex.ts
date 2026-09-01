import { findWikiLinks, normalizeName } from '../shared/wikilinks';
import type { Note, NoteType, SearchHit } from '../shared/types';

export interface NoteIndex {
  notes: Note[];
  byId: Map<string, Note>;
  /** Titel und Aliase, jeweils normalisiert, auf die Notiz. */
  byName: Map<string, Note>;
  /** Namen, die von mehreren Notizen beansprucht werden. */
  ambiguous: Set<string>;
  tags: string[];
}

export function buildIndex(notes: Note[]): NoteIndex {
  const byId = new Map<string, Note>();
  const byName = new Map<string, Note>();
  const ambiguous = new Set<string>();
  const tags = new Set<string>();

  for (const note of notes) {
    byId.set(note.id, note);
    for (const tag of note.tags) tags.add(tag);

    for (const name of [note.title, ...note.aliases]) {
      const key = normalizeName(name);
      if (!key) continue;
      if (byName.has(key) && byName.get(key)!.id !== note.id) ambiguous.add(key);
      else byName.set(key, note);
    }
  }

  return { notes, byId, byName, ambiguous, tags: [...tags].sort((a, b) => a.localeCompare(b, 'de-DE')) };
}

export function resolveLink(index: NoteIndex, target: string): Note | null {
  return index.byName.get(normalizeName(target)) ?? null;
}

export interface Backlink {
  note: Note;
  /** Kontextzeile, in der der Link steht. */
  context: string;
}

/** Notizen, die per [[Link]] auf `noteId` zeigen. */
export function backlinksFor(index: NoteIndex, noteId: string): Backlink[] {
  const target = index.byId.get(noteId);
  if (!target) return [];

  const names = new Set([target.title, ...target.aliases].map(normalizeName));
  const results: Backlink[] = [];

  for (const note of index.notes) {
    if (note.id === noteId) continue;
    const hit = findWikiLinks(note.body).find((link) => names.has(normalizeName(link.target)));
    if (!hit) continue;
    results.push({ note, context: contextAround(note.body, hit.from, hit.to) });
  }

  return results.sort((a, b) => a.note.title.localeCompare(b.note.title, 'de-DE'));
}

function contextAround(text: string, from: number, to: number, padding = 60): string {
  const start = Math.max(0, from - padding);
  const end = Math.min(text.length, to + padding);
  const prefix = start > 0 ? '… ' : '';
  const suffix = end < text.length ? ' …' : '';
  return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${suffix}`;
}

/** Links, die auf keine existierende Notiz zeigen. */
export function unresolvedLinks(index: NoteIndex, note: Note): string[] {
  const seen = new Map<string, string>();
  for (const link of findWikiLinks(note.body)) {
    const key = normalizeName(link.target);
    if (!index.byName.has(key)) seen.set(key, link.target);
  }
  return [...seen.values()];
}

export interface SearchFilters {
  query: string;
  type: NoteType | 'all';
  tag: string | null;
}

export function filterNotes(index: NoteIndex, filters: SearchFilters): Note[] {
  const query = filters.query.trim().toLocaleLowerCase('de-DE');

  return index.notes.filter((note) => {
    if (filters.type !== 'all' && note.type !== filters.type) return false;
    if (filters.tag && !note.tags.includes(filters.tag)) return false;
    if (!query) return true;
    return matchNote(note, query) !== null;
  });
}

/** Volltextsuche ueber Titel, Aliase, Tags, Felder und Rumpf. */
export function searchNotes(index: NoteIndex, query: string): SearchHit[] {
  const needle = query.trim().toLocaleLowerCase('de-DE');
  if (!needle) return [];

  return index.notes.flatMap((note) => {
    const hit = matchNote(note, needle);
    return hit ? [hit] : [];
  });
}

function matchNote(note: Note, needle: string): SearchHit | null {
  const base = { noteId: note.id, title: note.title, type: note.type };

  if (note.title.toLocaleLowerCase('de-DE').includes(needle)) {
    return { ...base, field: 'title', snippet: note.title };
  }

  const alias = note.aliases.find((entry) => entry.toLocaleLowerCase('de-DE').includes(needle));
  if (alias) return { ...base, field: 'alias', snippet: `Alias: ${alias}` };

  const tag = note.tags.find((entry) => entry.toLocaleLowerCase('de-DE').includes(needle));
  if (tag) return { ...base, field: 'tag', snippet: `Tag: ${tag}` };

  for (const [key, value] of Object.entries(note.fields)) {
    if (value.toLocaleLowerCase('de-DE').includes(needle)) {
      return { ...base, field: 'field', snippet: `${key}: ${value}` };
    }
  }

  const position = note.body.toLocaleLowerCase('de-DE').indexOf(needle);
  if (position !== -1) {
    return { ...base, field: 'body', snippet: contextAround(note.body, position, position + needle.length) };
  }

  return null;
}
