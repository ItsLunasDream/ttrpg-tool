import { findNoteType } from '../shared/noteTypes';
import { findWikiLinks, normalizeName } from '../shared/wikilinks';
import type { Note, NoteTypeDef } from '../shared/types';

export interface ExportLabels {
  type: string;
  relations: string;
  mentionedBy: string;
  aliases: string;
  tags: string;
  yes: string;
  no: string;
}

/** Ein Ankreuzfeld als Ja oder Nein statt als Rohwert. */
export function formatFieldValue(type: string, value: string, labels: ExportLabels): string {
  if (type === 'checkbox') return value ? labels.yes : labels.no;
  return value;
}

/**
 * Gibt eine Notiz als eigenstaendiges, lesbares Markdown aus. Anders als die
 * Speicherdatei enthaelt es keinen YAML-Kopf, sondern einen ausgeschriebenen
 * Steckbrief, dazu Beziehungen und Erwaehnungen.
 *
 * Wiki-Links bleiben als [[Name]] stehen: in einem Ordner voller exportierter
 * Notizen sind sie in Obsidian weiterhin klickbar.
 */
export function renderNoteMarkdown(
  note: Note,
  types: NoteTypeDef[],
  allNotes: Note[],
  labels: ExportLabels
): string {
  const def = findNoteType(types, note.type);
  const parts: string[] = [`# ${note.title}`, '', `*${def.label}*`, ''];

  // Ein nicht gesetztes Ankreuzfeld ist eine Aussage und gehoert mit in den
  // Export, ein leeres Textfeld nicht.
  const filled = def.fields.filter((field) => note.fields[field.key]?.trim() || field.type === 'checkbox');
  if (filled.length) {
    for (const field of filled) {
      const value = note.fields[field.key];
      parts.push(
        field.type === 'image'
          ? `- **${field.label}:** ![](${value})`
          : `- **${field.label}:** ${formatFieldValue(field.type, value, labels)}`
      );
    }
    parts.push('');
  }

  if (note.aliases.length) parts.push(`- **${labels.aliases}:** ${note.aliases.join(', ')}`, '');
  if (note.tags.length) parts.push(`- **${labels.tags}:** ${note.tags.join(', ')}`, '');

  parts.push('---', '');
  parts.push(note.body.trim() || '');
  parts.push('');

  const byId = new Map(allNotes.map((entry) => [entry.id, entry]));
  const relations = note.relations.filter((relation) => byId.has(relation.targetId));
  if (relations.length) {
    parts.push('---', '', `## ${labels.relations}`, '');
    for (const relation of relations) {
      const target = byId.get(relation.targetId)!;
      const type = relation.type.trim() ? `**${relation.type.trim()}** ` : '';
      const comment = relation.note.trim() ? ` — ${relation.note.trim()}` : '';
      parts.push(`- ${type}[[${target.title}]]${comment}`);
    }
    parts.push('');
  }

  const mentions = mentionedBy(note, allNotes);
  if (mentions.length) {
    parts.push('---', '', `## ${labels.mentionedBy}`, '');
    for (const source of mentions) parts.push(`- [[${source.title}]]`);
    parts.push('');
  }

  return `${parts.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

function mentionedBy(note: Note, allNotes: Note[]): Note[] {
  const names = new Set([note.title, ...note.aliases].map(normalizeName));
  return allNotes.filter(
    (candidate) =>
      candidate.id !== note.id &&
      findWikiLinks(candidate.body).some((link) => names.has(normalizeName(link.target)))
  );
}

/** Bilder, auf die eine Notiz verweist, als relative Pfade wie assets/x.png. */
export function referencedAssets(note: Note, types: NoteTypeDef[]): string[] {
  const found = new Set<string>();

  for (const match of note.body.matchAll(/!\[[^\]]*\]\((assets\/[^)\s]+)\)/g)) {
    found.add(match[1]);
  }
  for (const field of findNoteType(types, note.type).fields) {
    const value = note.fields[field.key];
    if (field.type === 'image' && value?.startsWith('assets/')) found.add(value);
  }

  return [...found];
}

/** Dateiname aus einem Notiztitel, ohne Zeichen, die Dateisysteme stoeren. */
export function toFileName(title: string, taken: Iterable<string> = []): string {
  const base =
    title
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || 'Notiz';

  // Ohne Ruecksicht auf Gross- und Kleinschreibung: auf Windows und macOS
  // ueberschrieb „bo.md" still „Bo.md" (Testbericht).
  const used = new Set([...taken].map((name) => name.toLowerCase()));
  if (!used.has(`${base}.md`.toLowerCase())) return `${base}.md`;

  let counter = 2;
  while (used.has(`${base} ${counter}.md`.toLowerCase())) counter += 1;
  return `${base} ${counter}.md`;
}

/**
 * Ein Kopf mit dem echten Titel als Alias, wenn der Dateiname davon abweicht.
 *
 * „Wer ist Bo?" wird zu „Wer ist Bo.md", und `[[Wer ist Bo?]]` war in
 * Obsidian dann tot (Testbericht). Obsidian loest Links auch ueber
 * `aliases` im Kopf auf.
 */
export function aliasKopf(title: string, fileName: string): string {
  if (`${title}.md` === fileName) return '';
  return `---\naliases:\n  - ${JSON.stringify(title)}\n---\n\n`;
}
