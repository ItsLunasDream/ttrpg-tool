/**
 * Wiki-Links werden im Markdown als [[Titel]] oder [[Titel|Anzeigetext]]
 * gespeichert. Sie bleiben damit im Klartext lesbar und in anderen
 * Markdown-Werkzeugen (z.B. Obsidian) nutzbar.
 *
 * Die stabile Identitaet haengt nicht am Text: beim Umbenennen einer Notiz
 * werden alle Vorkommen in der Kampagne mitgezogen (siehe vault.renameNote).
 * Beziehungen im Beziehungs-Panel referenzieren ohnehin die Notiz-ID.
 */
/**
 * Gruppen: Zieltitel, Trennzeichen, Anzeigetext.
 *
 * Das Trennzeichen wird mitgefangen, weil es in einer Tabellenzelle als `\|`
 * maskiert sein muss: ein bloßer Strich waere dort ein Spaltenwechsel und
 * zerrisse die Zeile. Beim Umbenennen wird es deshalb unveraendert
 * uebernommen statt neu gesetzt.
 *
 * Der Zieltitel darf keinen Backslash enthalten, sonst schluckte er die
 * Maskierung. Titel mit Backslash sind ohnehin nicht erlaubt, siehe
 * LINK_RESERVED_PATTERN.
 */
export const WIKI_LINK_PATTERN = /\[\[([^[\]|\\]+?)(?:(\\?\|)([^[\]]*?))?\]\]/g;

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
      label: (match[3] ?? '').trim() || target,
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

/**
 * Ersetzt in einem Text alle Links auf `oldTitle` durch `newTitle`.
 * Anzeigetext und Trennzeichen bleiben, wie sie waren.
 */
export function rewriteWikiLinks(text: string, oldTitle: string, newTitle: string): string {
  const wanted = normalizeName(oldTitle);
  return text.replace(
    new RegExp(WIKI_LINK_PATTERN.source, 'g'),
    (whole, target: string, separator: string | undefined, label: string | undefined) => {
      if (normalizeName(target) !== wanted) return whole;
      return separator === undefined ? `[[${newTitle}]]` : `[[${newTitle}${separator}${label}]]`;
    }
  );
}

/**
 * Zeichen, die im Link-Format eine Bedeutung haben. Stuenden sie in einem
 * Titel oder Alias, liesse sich die Notiz nicht mehr eindeutig verlinken:
 * aus `[[Mira|Falke]]` wuerde ein Link auf `Mira` mit Anzeigetext `Falke`,
 * und ein `]]` im Titel wuerde den Link vorzeitig beenden. Der Backslash ist
 * mit dabei, weil er in einer Tabellenzelle den Strich maskiert.
 *
 * Stern und Backtick sind Markdown-Syntax: aus `[[Der *Turm*]]` macht der
 * Editor beim Laden kursiven Text, und der Link ueberlebt das Speichern
 * nicht. Ein Titel damit waere ein Titel, auf den niemand verlinken kann.
 */
export const LINK_RESERVED_PATTERN = /[[\]|\\*`]/;

export function hasLinkReservedChars(name: string): boolean {
  return LINK_RESERVED_PATTERN.test(name);
}

/** Ersetzt jeden `[[Link]]` durch seinen Anzeigetext, fuer Klartext und Druck. */
export function wikiLinkText(markdown: string): string {
  return markdown.replace(new RegExp(WIKI_LINK_PATTERN.source, 'g'), (_whole, target: string, _separator, label?: string) =>
    (label ?? '').trim() || target
  );
}
