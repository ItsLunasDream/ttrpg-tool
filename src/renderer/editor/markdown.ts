import { marked } from 'marked';
import TurndownService from 'turndown';
import { wikiLinkText } from '../../shared/wikilinks';

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
//
// Nur die doppelten Klammern werden entmaskiert. Eine einzelne gehoert zur
// Markdown-Syntax und muss maskiert bleiben, sonst zerlegt etwa eine Adresse
// mit Klammer darin den Link, in dem sie steht.
const escapeText = turndown.escape.bind(turndown);
turndown.escape = (text: string) =>
  escapeText(text)
    .replace(/\\\[\\\[/g, '[[')
    .replace(/\\\]\\\]/g, ']]');

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

/**
 * Zellinhalt als Markdown, einzeilig. Reiner Text waere einfacher, wuerde aber
 * Fettes, Kursives und Links in der Zelle verschlucken.
 *
 * Jeder Senkrechtstrich wird maskiert, sonst waere er ein Spaltenwechsel.
 * Ein Ausnehmen bereits maskierter waere falsch: Turndown hat literale
 * Backslashes an dieser Stelle schon verdoppelt, ein `\` vor dem Strich
 * gehoert also zum Text und schuetzt ihn nicht.
 */
function cellText(cell: Element): string {
  const inner = (cell as HTMLElement).innerHTML ?? '';
  return turndown
    .turndown(inner)
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
  filter: (node) => {
    if (node.nodeName !== 'A') return false;
    const href = (node as HTMLAnchorElement).getAttribute('href');
    const text = node.textContent ?? '';
    // Markdown verlinkt auch eine blosse E-Mail-Adresse, dann steht die
    // Adresse im Text und mailto: davor im Verweis.
    if (!href || (href !== text && href !== `mailto:${text}`)) return false;

    // Muss im Text etwas maskiert werden, taugt die blosse Schreibweise
    // nicht: aus mira_x@example.org wuerde mira\_x@example.org, und die
    // automatische Erkennung faende nur den Rest hinter der Maskierung.
    // Dann uebernimmt Turndowns eigene Regel und schreibt [Text](Adresse).
    return turndown.escape(text) === text;
  },
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

/**
 * Zeilen, die nur aus Leerzeichen bestehen (in Listen und Zitaten auch hinter
 * dem Zeichen `>`), werden geleert. Sie aendern an der Darstellung nichts,
 * lassen die Datei aber bei jedem Speichern anders aussehen.
 *
 * Zeilen mit Text bleiben unangetastet: zwei Leerzeichen am Ende sind in
 * Markdown ein harter Umbruch und kein Rest.
 */
function tidyBlankLines(markdown: string): string {
  let open: string | null = null;

  return markdown
    .split('\n')
    .map((line) => {
      const fence = FENCE_LINE.exec(line);
      if (fence) {
        const marker = fence[2];
        // Ein Zaun schliesst nur, wenn er dasselbe Zeichen benutzt und
        // mindestens so lang ist. Sonst darf ein laengerer Zaun einen
        // kuerzeren enthalten.
        if (open === null) open = marker;
        else if (marker[0] === open[0] && marker.length >= open.length) open = null;
      }

      // In einem Codeblock sind Leerzeichen Inhalt, nicht Rest.
      return open !== null || fence ? line : line.replace(/^([\t >]*?)[ \t]+$/, '$1');
    })
    .join('\n');
}

/** Zaun eines Codeblocks, auch eingerueckt und in einem Zitat. */
const FENCE_LINE = /^(\s*(?:>\s?)*)(`{3,}|~{3,})/;

export function htmlToMarkdown(html: string, toRelative?: (url: string) => string | null): string {
  const markdown = tidyBlankLines(turndown.turndown(html)).trim();
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
  return wikiLinkText(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s{0,3}([-*_])\s*\1\s*\1[-*_\s]*$/gm, '')
    .replace(/(\*\*|__|\*|_|~~)/g, '')
    .split('\n')
    .map(stripTableRow)
    .join('\n')
    // Zuletzt, damit die Trenner der Tabelle vorher noch von maskierten
    // Strichen im Text zu unterscheiden waren.
    .replace(/\\\|/g, '|');
}

const TABLE_ROW = /^\s*\|(.*)\|\s*$/;
/** Eine Trennzeile besteht nur aus Strichen, Doppelpunkten und Trennern. */
const TABLE_RULE = /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/;

/**
 * Macht aus einer Tabellenzeile lesbaren Text. Die Trennzeile faellt ganz weg.
 *
 * Sie wird an ihrer Stelle erkannt, nicht an ihrer Form: eine Datenzeile kann
 * genauso aussehen. Nach Markdown steht die Trennzeile unmittelbar unter der
 * Kopfzeile, also unter der ersten Zeile einer Tabelle.
 */
function stripTableRow(line: string, index: number, lines: string[]): string {
  const row = TABLE_ROW.exec(line);
  if (!row) return line;

  const isSecondRow = index > 0 && TABLE_ROW.test(lines[index - 1]) && !TABLE_ROW.test(lines[index - 2] ?? '');
  if (isSecondRow && TABLE_RULE.test(line)) return '';

  return row[1].replace(/(?<!\\)\|/g, ' ');
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
