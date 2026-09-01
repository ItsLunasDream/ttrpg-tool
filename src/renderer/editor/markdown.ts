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

/** Zaehlt Woerter im Markdown-Rumpf, ohne Syntax mitzuzaehlen. */
export function countWords(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[\[([^[\]|]+)(?:\|([^[\]]*))?\]\]/g, (_whole, target: string, label?: string) => label || target)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ');

  const words = plain.match(/[\p{L}\p{N}'’-]+/gu);
  return words ? words.length : 0;
}
