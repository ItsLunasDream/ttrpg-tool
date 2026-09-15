import { Marked, marked } from 'marked';
import TurndownService from 'turndown';
import { maskWikiLinks, wikiLinkText } from '../../shared/wikilinks';
import { breiteAusAttributen, istAnteil } from '../../shared/bildbreite';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  // Voreinstellung waere '* * *'. Dann saehe eine Trennlinie nach jedem
  // Speichern anders aus als vorher in der Datei.
  hr: '---'
});

/**
 * Turndown maskiert Markdown-Sonderzeichen im Fliesstext. Ein Wiki-Link darf
 * davon nichts abbekommen: aus `[[Haus_am_See]]` wuerde sonst
 * `[[Haus\_am\_See]]`, und beim naechsten Laden waere es kein Link mehr,
 * ohne Ruecklink und ohne dass Umbenennen ihn noch faende.
 *
 * Maskiert wird deshalb der Text ohne die Links, danach kommen sie
 * unveraendert zurueck. Sie stueckweise um die Links herum zu maskieren
 * waere falsch: Turndowns Regeln haengen am Zeilenanfang, und ein Stueck
 * mitten in der Zeile faengt fuer sie eine neue an.
 */
const escapeText = turndown.escape.bind(turndown);

/**
 * Fussnoten kennt der Editor nicht, sie bleiben blosser Text. Ohne Schutz
 * machte die Maskierung aus `[^1]` ein `\[^1\]`, und in Obsidian waere die
 * Fussnote danach keine mehr. Sie wird deshalb wie ein Wiki-Link beiseite
 * gelegt und unveraendert zurueckgesetzt.
 *
 * Erfasst wird der Verweis `[^kennung]` und die einleitende Marke einer
 * Fussnote `[^kennung]:`. Leerraum in der Kennung ist ausgeschlossen, sonst
 * verschluckte das Muster gewoehnliche Klammern im Satz.
 */
const FOOTNOTE_PATTERN = /\[\^[^\]\s]+\]/g;
const FOOTNOTE_OPEN = '\uE002';
const FOOTNOTE_CLOSE = '\uE003';
const FOOTNOTE_MASK = /\uE002(\d+)\uE003/g;

function maskFootnotes(text: string): { masked: string; restore: (value: string) => string } {
  const found: string[] = [];
  const masked = text.replace(FOOTNOTE_PATTERN, (whole) => {
    found.push(whole);
    return `${FOOTNOTE_OPEN}${found.length - 1}${FOOTNOTE_CLOSE}`;
  });
  return {
    masked,
    restore: (value) =>
      value.replace(FOOTNOTE_MASK, (whole, index: string) => found[Number(index)] ?? whole)
  };
}

turndown.escape = (text: string) => {
  const footnotes = maskFootnotes(text);
  const { masked, restore } = maskWikiLinks(footnotes.masked);
  // Turndown maskiert die spitze Klammer nicht. Steht sie im Text, waere sie
  // in der Datei wieder HTML, und beim naechsten Laden wuerde der Editor das
  // Element samt Inhalt verwerfen: der Verlust waere nur aufgeschoben.
  // Bilder mit Breite gehen nicht hier durch, die haben eine eigene Regel.
  return footnotes.restore(restore(escapeText(masked).replace(/<(?=[A-Za-z/!?])/g, '\\<')));
};

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
    if (!href) return false;

    // Markdown verlinkt auch eine blosse E-Mail-Adresse, dann steht die
    // Adresse im Text und mailto: davor im Verweis. Und es kodiert
    // Sonderzeichen im Verweis, waehrend im Text die Adresse steht, wie sie
    // getippt wurde.
    // Die kodierte Fassung zaehlt nur ohne Leerraum: sonst wuerde aus einem
    // Verweis mit Leerzeichen eine blosse Adresse, die beim naechsten Laden
    // am Leerzeichen abbricht.
    const encoded = /\s/.test(text) ? null : encodeUri(text);
    if (href !== text && href !== `mailto:${text}` && href !== encoded) return false;

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
  filter: (node) =>
    node.nodeName === 'IMG' &&
    breiteAusAttributen(
      (node as HTMLImageElement).getAttribute('width'),
      (node as HTMLImageElement).getAttribute('style')
    ) !== null,
  replacement: (_content, node) => {
    const image = node as HTMLImageElement;
    const alt = image.getAttribute('alt') ?? '';
    const breite = breiteAusAttributen(image.getAttribute('width'), image.getAttribute('style'));
    const masse = istAnteil(breite ?? '') ? `style="width: ${breite}"` : `width="${breite}"`;
    return `<img src="${image.getAttribute('src') ?? ''}" alt="${alt}" ${masse}>`;
  }
});

/**
 * Aufgabenlisten (`- [x] erledigt`).
 *
 * Der Markdown-Leser baut daraus ein Ankreuzfeld mitten im Listenpunkt. Der
 * Editor kennt dort keines und wirft es weg: aus der Aufgabenliste wurde beim
 * naechsten Speichern eine gewoehnliche Liste, der Haken war fort. TipTap
 * erwartet die Angabe stattdessen als Attribut, `data-type="taskList"` an der
 * Liste und `data-checked` am Punkt.
 *
 * Ob eine Liste eine Aufgabenliste ist, weiss `list` nicht: es bekommt nur den
 * fertigen Rumpf. Deshalb setzt `listitem` eine Marke davor, die `list` liest
 * und wieder entfernt. Verschachtelte Listen sind dabei schon gerendert und
 * haben ihre eigenen Marken bereits abgeraeumt.
 */
const TASK_MARK = '\uE004';

const taskListRenderer = {
  listitem(text: string, task: boolean, checked: boolean): string {
    if (!task) return `<li>${text}</li>\n`;
    // Das Ankreuzfeld steht schon im Text; an seine Stelle tritt das Attribut.
    return `${TASK_MARK}<li data-type="taskItem" data-checked="${checked}">${text.replace(/^<input[^>]*>\s?/, '')}</li>\n`;
  },
  list(body: string, ordered: boolean, start: number | ''): string {
    if (body.includes(TASK_MARK)) {
      return `<ul data-type="taskList">\n${body.split(TASK_MARK).join('')}</ul>\n`;
    }
    const tag = ordered ? 'ol' : 'ul';
    const startAttribute = ordered && start !== '' && start !== 1 ? ` start="${start}"` : '';
    return `<${tag}${startAttribute}>\n${body}</${tag}>\n`;
  }
};

/**
 * Umgekehrter Weg: aus dem Listenpunkt des Editors wird wieder `- [x] Text`.
 * Ohne diese Regel bliebe nur der Text uebrig, das Ankreuzfeld des Editors
 * steckt in einem `label`, das Turndown leer laesst.
 */
turndown.addRule('taskItem', {
  filter: (node) => node.nodeName === 'LI' && (node as HTMLElement).hasAttribute('data-checked'),
  replacement: (content, node) => {
    const checked = (node as HTMLElement).getAttribute('data-checked') === 'true';
    const text = content
      .replace(/^\n+/, '')
      .replace(/\n+$/, '\n')
      .replace(/\n/gm, '\n    ');
    return `- [${checked ? 'x' : ' '}] ${text}${node.nextSibling && !/\n$/.test(text) ? '\n' : ''}`;
  }
});

marked.setOptions({ gfm: true, breaks: false });
marked.use({ renderer: taskListRenderer });

/**
 * Zweiter Leser fuer eingefuegten Text: er gibt rohes HTML als Text aus,
 * statt es durchzureichen.
 */
const plainMarked = new Marked({ gfm: true, breaks: false });
plainMarked.use({
  renderer: {
    ...taskListRenderer,
    html: (token: string | { raw?: string; text?: string }) =>
      escapeHtml(typeof token === 'string' ? token : token.raw ?? token.text ?? '')
  }
});

/**
 * Bildverweise stehen im Markdown relativ als assets/x.png. Das haelt die
 * Dateien portabel, etwa fuer Obsidian. Zum Anzeigen im Editor muessen sie in
 * eine ladbare URL uebersetzt werden, beim Speichern wieder zurueck.
 */
export type AssetResolver = (relativePath: string) => string;

const ASSET_MARKDOWN = /(!\[[^\]]*\]\()(assets\/[^)\s]+)(\))/g;
const ASSET_HTML = /(<img[^>]*\ssrc=")(assets\/[^"]+)(")/g;

export function markdownToHtml(markdown: string, resolveAsset?: AssetResolver): string {
  return toHtml(markdown, resolveAsset, (text) => marked.parse(text, { async: false }) as string);
}

/**
 * Wie `markdownToHtml`, aber rohes HTML im Text bleibt Text.
 *
 * Fuer Eingefuegtes aus der Zwischenablage: was dort steht, hat niemand als
 * HTML gemeint, und der Editor wuerde ein unbekanntes Element samt Inhalt
 * verwerfen. In den eigenen Dateien ist inline-HTML dagegen erlaubt, dort
 * steht die Breite eines Bildes so.
 */
export function pastedMarkdownToHtml(markdown: string, resolveAsset?: AssetResolver): string {
  return toHtml(markdown, resolveAsset, (text) => plainMarked.parse(text, { async: false }) as string);
}

function toHtml(markdown: string, resolveAsset: AssetResolver | undefined, parse: (text: string) => string): string {
  const replace = (text: string, pattern: RegExp) =>
    text.replace(pattern, (_whole, prefix: string, target: string, suffix: string) =>
      `${prefix}${resolveAsset!(target)}${suffix}`
    );

  const prepared = resolveAsset ? replace(replace(markdown, ASSET_MARKDOWN), ASSET_HTML) : markdown;

  // Ohne diesen Schutz macht der Markdown-Leser aus [[Der *Turm*]] kursiven
  // Text und schneidet den Link dabei in Stuecke. Zurueck kaeme er dann nicht
  // mehr als Link.
  const { masked, restore } = maskWikiLinks(prepared);

  // Beim Zuruecksetzen faellt die Maskierung des Senkrechtstrichs weg: in
  // einer Tabellenzelle muss sie in der Datei stehen, im Dokument gehoert
  // dort der blosse Strich hin. Beim Speichern wird sie neu gesetzt.
  return restore(parse(masked), (link) => escapeHtml(link.replace(/\\\|/g, '|')));
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
  return loeseMaskierung(
    schuetzeMaskierte(wikiLinkText(markdown))
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
      .replace(/\\\|/g, '|')
  );
}

/**
 * Platzhalter fuer ein maskiertes Sonderzeichen, aus dem Bereich fuer private
 * Verwendung. In gewoehnlichem Text kommt er nicht vor.
 */
const MASKE_AUF = '\uE010';
const MASKE_ZU = '\uE011';

/**
 * Bringt maskierte Sonderzeichen in Sicherheit, bevor die Syntax entfernt wird.
 *
 * Beim Speichern maskiert der Markdown-Schreiber alles, was sonst eine
 * Bedeutung haette: aus einem Stern im Satz wird `\*`. Liess man die
 * Maskierung stehen, blieb der Backslash in der Kurzinfo sichtbar; loeste man
 * sie vorher auf, fiel der Stern gleich darauf den Regeln fuer Auszeichnung
 * zum Opfer. Beides war zu sehen.
 *
 * Der Strich bleibt bewusst maskiert: er trennt weiter unten die
 * Tabellenspalten, und ein Strich im Text waere davon sonst nicht mehr zu
 * unterscheiden.
 */
function schuetzeMaskierte(text: string): string {
  return text.replace(
    /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{}~])/g,
    (_ganz, zeichen: string) => `${MASKE_AUF}${zeichen.codePointAt(0)}${MASKE_ZU}`
  );
}

function loeseMaskierung(text: string): string {
  return text.replace(/\uE010(\d+)\uE011/g, (_ganz, code: string) =>
    String.fromCodePoint(Number(code))
  );
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

/** Zeichen, die in HTML eine Bedeutung haben. Fuer zurueckgesetzte Wiki-Links. */
export function escapeHtml(text: string): string {
  // Auch die Anfuehrungszeichen: ein zurueckgesetzter Link kann in einem
  // Attribut landen, etwa im alt eines Bildes, und wuerde es sonst aufbrechen.
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** encodeURI, ohne bei ungueltigen Zeichenfolgen zu werfen. */
function encodeUri(text: string): string {
  try {
    return encodeURI(text);
  } catch {
    return text;
  }
}
