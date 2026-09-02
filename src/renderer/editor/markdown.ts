import { marked } from 'marked';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  // Voreinstellung waere '* * *'. Dann saehe eine Trennlinie nach jedem
  // Speichern anders aus als vorher in der Datei.
  hr: '---'
});

// Turndown maskiert Markdown-Sonderzeichen im Fliesstext. Ohne diese
// Korrektur wuerde aus [[Name]] beim Speichern \[\[Name\]\] und der
// Wiki-Link waere beim naechsten Laden kaputt.
const escapeText = turndown.escape.bind(turndown);
turndown.escape = (text: string) => escapeText(text).replace(/\\([[\]])/g, '$1');

/**
 * Turndown kennt Durchstreichen nicht und wuerde die Auszeichnung ersatzlos
 * fallen lassen. Die Werkzeugleiste bietet sie an, sie muss also auch in der
 * Datei ankommen.
 */
turndown.addRule('strikethrough', {
  filter: (node) => ['S', 'DEL', 'STRIKE'].includes(node.nodeName),
  replacement: (content) => (content.trim() ? `~~${content}~~` : content)
});

/**
 * Turndown kennt keine Tabellen und wuerde alle Zellen zu einer einzigen
 * Textwurst zusammenziehen. Markdown-Tabellen sind rechteckig und brauchen
 * eine Kopfzeile, also wird beides hergestellt: fehlende Zellen werden
 * aufgefuellt, eine fehlende Kopfzeile durch eine leere ersetzt.
 */
turndown.addRule('table', {
  filter: (node) => node.nodeName === 'TABLE',
  replacement: (_content, node) => {
    const rowNodes = collect(node, 'TR');
    const rows = rowNodes.map((row) => collect(row, 'TH', 'TD'));
    if (rows.length === 0) return '';

    const columns = Math.max(...rows.map((row) => row.length));
    const pad = (row: string[]) => Array.from({ length: columns }, (_unused, index) => row[index] ?? '');
    const texts = rows.map((cells) => cells.map(cellText));

    // Nur wenn die erste Zeile Kopfzellen enthaelt, ist sie eine Kopfzeile.
    const firstIsHeader = collect(rowNodes[0], 'TH').length > 0;
    const head = firstIsHeader ? pad(texts[0]) : pad([]);
    const body = firstIsHeader ? texts.slice(1) : texts;

    const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
    return [
      '',
      '',
      line(head),
      line(Array.from({ length: columns }, () => '---')),
      ...body.map((row) => line(pad(row))),
      '',
      ''
    ].join('\n');
  }
});

/**
 * Nachfahren mit dem gesuchten Namen, in Dokumentreihenfolge. Turndown laeuft
 * im Test gegen eine schlanke DOM-Nachbildung ohne querySelectorAll, deshalb
 * von Hand.
 */
function collect(node: Node, ...names: string[]): Element[] {
  const found: Element[] = [];
  for (const child of Array.from(node.childNodes)) {
    if (names.includes(child.nodeName)) found.push(child as Element);
    else found.push(...collect(child, ...names));
  }
  return found;
}

/** Zellinhalt einzeilig, mit maskierten Zeichen, die die Tabelle sonst zerlegen. */
function cellText(cell: Element): string {
  return (cell.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\|/g, '\\|');
}

/**
 * Steht im Text nur die nackte Adresse, macht Markdown daraus automatisch
 * einen Link. Ohne diese Regel schriebe Turndown ihn als
 * [https://x](https://x) zurueck und der Text saehe nach dem Speichern
 * anders aus als vorher.
 */
turndown.addRule('bareLink', {
  filter: (node) =>
    node.nodeName === 'A' &&
    Boolean((node as HTMLAnchorElement).getAttribute('href')) &&
    (node as HTMLAnchorElement).getAttribute('href') === node.textContent,
  replacement: (content) => content
});

/**
 * Bilder mit gesetzter Breite bleiben als HTML stehen. Markdown kann keine
 * Groesse ausdruecken, inline-HTML ist aber gueltiges Markdown und wird auch
 * von Obsidian dargestellt.
 */
turndown.addRule('imageWithWidth', {
  filter: (node) => node.nodeName === 'IMG' && Boolean((node as HTMLImageElement).getAttribute('width')),
  replacement: (_content, node) => {
    const image = node as HTMLImageElement;
    const alt = image.getAttribute('alt') ?? '';
    return `<img src="${image.getAttribute('src') ?? ''}" alt="${alt}" width="${image.getAttribute('width')}">`;
  }
});

marked.setOptions({ gfm: true, breaks: false });

/**
 * Bildverweise stehen im Markdown relativ als assets/x.png. Das haelt die
 * Dateien portabel, etwa fuer Obsidian. Zum Anzeigen im Editor muessen sie in
 * eine ladbare URL uebersetzt werden, beim Speichern wieder zurueck.
 */
export type AssetResolver = (relativePath: string) => string;

const ASSET_MARKDOWN = /(!\[[^\]]*\]\()(assets\/[^)\s]+)(\))/g;
const ASSET_HTML = /(<img[^>]*\ssrc=")(assets\/[^"]+)(")/g;

export function markdownToHtml(markdown: string, resolveAsset?: AssetResolver): string {
  const replace = (text: string, pattern: RegExp) =>
    text.replace(pattern, (_whole, prefix: string, target: string, suffix: string) =>
      `${prefix}${resolveAsset!(target)}${suffix}`
    );

  const prepared = resolveAsset ? replace(replace(markdown, ASSET_MARKDOWN), ASSET_HTML) : markdown;

  return marked.parse(prepared, { async: false }) as string;
}

export function htmlToMarkdown(html: string, toRelative?: (url: string) => string | null): string {
  const markdown = turndown.turndown(html).trim();
  if (!toRelative) return markdown;

  const back = (text: string, pattern: RegExp) =>
    text.replace(pattern, (whole, prefix: string, url: string, suffix: string) => {
      const relative = toRelative(url);
      return relative ? `${prefix}${relative}${suffix}` : whole;
    });

  return back(back(markdown, /(!\[[^\]]*\]\()([^)\s]+)(\))/g), /(<img[^>]*\ssrc=")([^"]+)(")/g);
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
    // Tabellen: die Trennzeile ganz weg, sonst nur die Striche.
    .replace(/^\s*\|[\s|:-]*\|\s*$/gm, '')
    .replace(/^\s*\|(.*)\|\s*$/gm, (_whole, row: string) => row.replace(/(?<!\\)\|/g, ' '))
    .replace(/\\\|/g, '|')
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
