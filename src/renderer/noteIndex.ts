import { findWikiLinks, normalizeName } from '../shared/wikilinks';
import { noteTypeDef } from '../shared/noteTypes';
import type { Note, NoteType, SearchHit, SnippetMatch } from '../shared/types';

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

/**
 * Alle Fundstellen eines Suchbegriffs, ohne Ruecksicht auf Gross- und
 * Kleinschreibung. Wird sowohl fuer die Trefferliste als auch fuer die
 * Hervorhebung im Editor benutzt.
 */
export function findOccurrences(haystack: string, needle: string): SnippetMatch[] {
  if (!needle) return [];

  // Kleinschreibung kann in Sonderfaellen die Laenge aendern (etwa das
  // tuerkische I). Dann waeren die Positionen verschoben, also lieber
  // Gross- und Kleinschreibung beachten als falsch markieren.
  const lowerHaystack = haystack.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const safe = lowerHaystack.length === haystack.length && lowerNeedle.length === needle.length;
  const source = safe ? lowerHaystack : haystack;
  const target = safe ? lowerNeedle : needle;

  const matches: SnippetMatch[] = [];
  let position = source.indexOf(target);
  while (position !== -1) {
    matches.push({ from: position, to: position + target.length });
    position = source.indexOf(target, position + target.length);
  }
  return matches;
}

/** Volltextsuche ueber Titel, Aliase, Tags, Felder und Rumpf. */
export function searchNotes(index: NoteIndex, query: string): SearchHit[] {
  const needle = query.trim();
  if (!needle) return [];

  return index.notes.flatMap((note) => {
    const hit = matchNote(note, needle);
    return hit ? [hit] : [];
  });
}

function matchNote(note: Note, needle: string): SearchHit | null {
  const base = { noteId: note.id, title: note.title, type: note.type };

  const inTitle = findOccurrences(note.title, needle);
  if (inTitle.length) {
    return { ...base, field: 'title', label: null, snippet: note.title, matches: inTitle, bodyMatches: 0 };
  }

  for (const alias of note.aliases) {
    const matches = findOccurrences(alias, needle);
    if (matches.length) {
      return { ...base, field: 'alias', label: 'Alias', snippet: alias, matches, bodyMatches: 0 };
    }
  }

  for (const tag of note.tags) {
    const matches = findOccurrences(tag, needle);
    if (matches.length) {
      return { ...base, field: 'tag', label: 'Tag', snippet: tag, matches, bodyMatches: 0 };
    }
  }

  for (const [key, value] of Object.entries(note.fields)) {
    const matches = findOccurrences(value, needle);
    if (matches.length) {
      return { ...base, field: 'field', label: fieldLabel(note.type, key), snippet: value, matches, bodyMatches: 0 };
    }
  }

  const inBody = findOccurrences(note.body, needle);
  if (inBody.length) {
    const first = inBody[0];
    const snippet = contextAround(note.body, first.from, first.to);
    // Der Ausschnitt ist gekuerzt und normalisiert, die Positionen muessen
    // deshalb darin neu gesucht werden.
    return {
      ...base,
      field: 'body',
      label: null,
      snippet,
      matches: findOccurrences(snippet, needle),
      bodyMatches: inBody.length
    };
  }

  return null;
}

function fieldLabel(type: NoteType, key: string): string {
  return noteTypeDef(type).fields.find((field) => field.key === key)?.label ?? key;
}

