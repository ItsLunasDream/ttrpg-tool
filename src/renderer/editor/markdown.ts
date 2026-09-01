import { marked } from 'marked';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
});

// Turndown maskiert Markdown-Sonderzeichen im Fliesstext. Ohne diese
// Korrektur wuerde aus [[Name]] beim Speichern \[\[Name\]\] und der
// Wiki-Link waere beim naechsten Laden kaputt.
const escapeText = turndown.escape.bind(turndown);
turndown.escape = (text: string) => escapeText(text).replace(/\\([[\]])/g, '$1');

marked.setOptions({ gfm: true, breaks: false });

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html).trim();
}

/**
 * Entfernt Markdown-Syntax und laesst nur den lesbaren Text uebrig.
 * Wiki-Links werden auf ihren Anzeigetext reduziert.
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[\[([^[\]|]+)(?:\|([^[\]]*))?\]\]/g, (_whole, target: string, label?: string) => label || target)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s{0,3}([-*_])\s*\1\s*\1[-*_\s]*$/gm, '')
    .replace(/(\*\*|__|\*|_|~~)/g, '');
}

/** Zaehlt Woerter im Markdown-Rumpf, ohne Syntax mitzuzaehlen. */
export function countWords(markdown: string): number {
  const words = stripMarkdown(markdown).match(/[\p{L}\p{N}'\u2019-]+/gu);
  return words ? words.length : 0;
}

/**
 * Erste Zeilen einer Notiz als Klartext, fuer die Kurzinfo-Karte.
 * Bricht an einer Wortgrenze ab und haengt ein Auslassungszeichen an.
 */
export function textPreview(markdown: string, maxChars = 220): string {
  const plain = stripMarkdown(markdown).replace(/\s+/g, ' ').trim();
  if (plain.length <= maxChars) return plain;

  const cut = plain.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()} …`;
}
