import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { BrowserWindow } from 'electron';
import { marked } from 'marked';
import { findNoteType } from '../shared/noteTypes';
import type { Note, NoteTypeDef } from '../shared/types';
import type { ExportLabels } from './markdownExport';

/** Absoluter Dateipfad als URL, damit das Druckfenster Bilder laden kann. */
function fileUrl(absolutePath: string): string {
  return pathToFileURL(path.resolve(absolutePath)).href;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PRINT_STYLE = `
  :root { color-scheme: light; }
  body {
    background: #fff;
    color: #1b1720;
    font: 11pt/1.6 Georgia, 'Times New Roman', serif;
    margin: 0;
  }
  .note { page-break-after: always; }
  .note:last-child { page-break-after: auto; }
  h1 { font-size: 20pt; margin: 0 0 4pt; }
  h2 { font-size: 15pt; margin: 16pt 0 4pt; }
  h3 { font-size: 13pt; margin: 12pt 0 4pt; }
  .note__type { color: #6b6478; font-style: italic; margin: 0 0 12pt; }
  .profile { border-left: 2pt solid #c4a35a; margin: 0 0 14pt; padding: 2pt 0 2pt 10pt; }
  .profile div { margin: 0 0 2pt; }
  .profile dt { color: #6b6478; display: inline; font-weight: bold; }
  .profile dd { display: inline; margin: 0; }
  .portrait { max-height: 70mm; max-width: 60mm; float: right; margin: 0 0 10pt 12pt; }
  img { max-width: 100%; }
  blockquote { border-left: 2pt solid #ddd; color: #4a4453; margin-left: 0; padding-left: 10pt; }
  pre { background: #f4f2f7; padding: 6pt; white-space: pre-wrap; }
  hr { border: none; border-top: 1pt solid #ddd; margin: 14pt 0; }
  .section { margin-top: 14pt; }
  .section h2 { border-bottom: 1pt solid #e2dfe8; font-size: 12pt; padding-bottom: 2pt; }
  ul { margin: 0; padding-left: 16pt; }
`;

export interface PdfContext {
  types: NoteTypeDef[];
  allNotes: Note[];
  labels: ExportLabels;
  /** Uebersetzt einen relativen Bildverweis in einen absoluten Dateipfad. */
  resolveAsset: (relativePath: string) => string;
}

/** Eine Notiz als HTML-Abschnitt fuer den Druck. */
function renderNote(note: Note, context: PdfContext): string {
  const def = findNoteType(context.types, note.type);
  const parts: string[] = ['<article class="note">'];

  const portrait = def.fields.find((field) => field.type === 'image' && note.fields[field.key]?.trim());
  if (portrait) {
    parts.push(`<img class="portrait" src="${fileUrl(context.resolveAsset(note.fields[portrait.key]))}" alt="">`);
  }

  parts.push(`<h1>${escapeHtml(note.title)}</h1>`);
  parts.push(`<p class="note__type">${escapeHtml(def.label)}</p>`);

  const filled = def.fields.filter((field) => field.type !== 'image' && note.fields[field.key]?.trim());
  if (filled.length || note.aliases.length || note.tags.length) {
    parts.push('<dl class="profile">');
    for (const field of filled) {
      parts.push(`<div><dt>${escapeHtml(field.label)}:</dt> <dd>${escapeHtml(note.fields[field.key])}</dd></div>`);
    }
    if (note.aliases.length) {
      parts.push(`<div><dt>${escapeHtml(context.labels.aliases)}:</dt> <dd>${escapeHtml(note.aliases.join(', '))}</dd></div>`);
    }
    if (note.tags.length) {
      parts.push(`<div><dt>${escapeHtml(context.labels.tags)}:</dt> <dd>${escapeHtml(note.tags.join(', '))}</dd></div>`);
    }
    parts.push('</dl>');
  }

  // Wiki-Links werden zu ihrem Anzeigetext: im PDF ist nichts klickbar.
  const body = note.body
    .replace(/\[\[([^[\]|]+)(?:\|([^[\]]*))?\]\]/g, (_whole, target: string, label?: string) => label || target)
    .replace(/!\[([^\]]*)\]\((assets\/[^)\s]+)\)/g, (_whole, alt: string, target: string) =>
      `![${alt}](${fileUrl(context.resolveAsset(target))})`
    );
  parts.push(marked.parse(body, { async: false }) as string);

  const byId = new Map(context.allNotes.map((entry) => [entry.id, entry]));
  const relations = note.relations.filter((relation) => byId.has(relation.targetId));
  if (relations.length) {
    parts.push(`<div class="section"><h2>${escapeHtml(context.labels.relations)}</h2><ul>`);
    for (const relation of relations) {
      const target = byId.get(relation.targetId)!;
      const type = relation.type.trim() ? `<strong>${escapeHtml(relation.type.trim())}</strong> ` : '';
      const comment = relation.note.trim() ? ` — ${escapeHtml(relation.note.trim())}` : '';
      parts.push(`<li>${type}${escapeHtml(target.title)}${comment}</li>`);
    }
    parts.push('</ul></div>');
  }

  parts.push('</article>');
  return parts.join('\n');
}

/**
 * Rendert Notizen in einem unsichtbaren Fenster und schreibt das Ergebnis als
 * PDF. Das Fenster laedt eine temporaere Datei, damit Bilder mit absoluten
 * Pfaden geladen werden koennen.
 */
export async function exportNotesToPdf(notes: Note[], context: PdfContext, targetFile: string): Promise<void> {
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><style>${PRINT_STYLE}</style></head>
<body>${notes.map((note) => renderNote(note, context)).join('\n')}</body></html>`;

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'backstory-pdf-'));
  const tempFile = path.join(tempDir, `${randomUUID()}.html`);
  await fs.writeFile(tempFile, html, 'utf8');

  const window = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });

  try {
    await window.loadFile(tempFile);
    const data = await window.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 0.8, bottom: 0.8, left: 0.8, right: 0.8 }
    });
    await fs.writeFile(targetFile, data);
  } finally {
    window.destroy();
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
