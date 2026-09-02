/**
 * Wiki-Links werden im Markdown als [[Titel]] oder [[Titel|Anzeigetext]]
 * gespeichert. Sie bleiben damit im Klartext lesbar und in anderen
 * Markdown-Werkzeugen (z.B. Obsidian) nutzbar.
 *
 * Die stabile Identitaet haengt nicht am Text: beim Umbenennen einer Notiz
 * werden alle Vorkommen in der Kampagne mitgezogen (siehe vault.renameNote).
 * Beziehungen im Beziehungs-Panel referenzieren ohnehin die Notiz-ID.
 */
export const WIKI_LINK_PATTERN = /\[\[([^[\]|]+?)(?:\|([^[\]]*?))?\]\]/g;

export interface WikiLinkMatch {
  /** Zieltitel bzw. Alias, so wie er im Text steht. */
  target: string;
  /** Angezeigter Text, faellt auf den Zieltitel zurueck. */
  label: string;
  from: number;
  to: number;
}

export function findWikiLinks(text: string): WikiLinkMatch[] {
  const matches: WikiLinkMatch[] = [];
  const pattern = new RegExp(WIKI_LINK_PATTERN.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const target = match[1].trim();
    if (!target) continue;
    matches.push({
      target,
      label: (match[2] ?? '').trim() || target,
      from: match.index,
      to: match.index + match[0].length
    });
  }
  return matches;
}

/** Vergleichsform fuer Titel und Aliase: Gross-/Kleinschreibung und Randabstand egal. */
export function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('de-DE');
}

/** Ersetzt in einem Text alle Links auf `oldTitle` durch `newTitle`, Anzeigetexte bleiben erhalten. */
export function rewriteWikiLinks(text: string, oldTitle: string, newTitle: string): string {
  const wanted = normalizeName(oldTitle);
  return text.replace(new RegExp(WIKI_LINK_PATTERN.source, 'g'), (whole, target: string, label?: string) => {
    if (normalizeName(target) !== wanted) return whole;
    return label === undefined ? `[[${newTitle}]]` : `[[${newTitle}|${label}]]`;
  });
}

/**
 * Zeichen, die im Link-Format eine Bedeutung haben. Stuenden sie in einem
 * Titel oder Alias, liesse sich die Notiz nicht mehr eindeutig verlinken:
 * aus `[[Mira|Falke]]` wuerde ein Link auf `Mira` mit Anzeigetext `Falke`,
 * und ein `]]` im Titel wuerde den Link vorzeitig beenden.
 */
export const LINK_RESERVED_PATTERN = /[[\]|]/;

export function hasLinkReservedChars(name: string): boolean {
  return LINK_RESERVED_PATTERN.test(name);
}
