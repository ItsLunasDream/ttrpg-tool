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
 *
 * Ueber Zeilengrenzen geht ein Link nicht: sonst verschluckte eine offene
 * Klammer alles bis zur naechsten schliessenden, samt Absaetzen dazwischen.
 */
export const WIKI_LINK_PATTERN = /\[\[([^[\]|\\\n]+?)(?:(\\?\|)([^[\]\n]*?))?\]\]/g;

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

/**
 * Steht die Stelle mitten in einem fertigen `[[Link]]`?
 *
 * Gebraucht wird das beim Tippen: wer den Cursor in einen bestehenden Verweis
 * setzt, sieht links von sich ein `[[` ohne `]]` und sieht damit aus wie
 * jemand, der gerade einen neuen Verweis anfaengt. Ohne diese Pruefung
 * schlaegt die Vorschlagsliste einen halben Titel vor, legt ihn als neue
 * Notiz an und haengt ein zweites `]]` an einen Verweis, der schon eines hat.
 *
 * Die Raender zaehlen nicht dazu: direkt vor dem `[[` und direkt hinter dem
 * `]]` steht man ausserhalb und darf dort einen neuen Verweis beginnen.
 */
export function insideWikiLink(text: string, offset: number): boolean {
  return findWikiLinks(text).some((link) => offset > link.from && offset < link.to);
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

 */
export const LINK_RESERVED_PATTERN = /[[\]|\\]/;

export function hasLinkReservedChars(name: string): boolean {
  return LINK_RESERVED_PATTERN.test(name);
}

/** Ersetzt jeden `[[Link]]` durch seinen Anzeigetext, fuer Klartext und Druck. */
export function wikiLinkText(markdown: string): string {
  return markdown.replace(new RegExp(WIKI_LINK_PATTERN.source, 'g'), (_whole, target: string, _separator, label?: string) =>
    (label ?? '').trim() || target
  );
}

/**
 * Platzhalter fuer einen maskierten Wiki-Link. Die Zeichen stammen aus dem
 * Bereich fuer private Verwendung und kommen in gewoehnlichem Text nicht vor.
 */
const MASK_OPEN = '\uE000';
const MASK_CLOSE = '\uE001';
const MASK_PATTERN = /\uE000(\d+)\uE001/g;

export interface MaskedWikiLinks {
  /** Der Text mit Platzhaltern anstelle der Links. */
  masked: string;
  /** Setzt die Links wieder ein, wahlweise durch `map` geschickt. */
  restore: (text: string, map?: (link: string) => string) => string;
}

/** Steht die Fundstelle mitten in einer Adresse? */
function insideUrl(text: string, index: number): boolean {
  // Bis zum letzten Leerraum oder zur naechsten runden Klammer: damit greift
  // es in der Adresse eines ausgeschriebenen Verweises [Text](Adresse), aber
  // nicht mehr hinter dessen Ende.
  const token = /([^\s()]+)$/.exec(text.slice(0, index))?.[1] ?? '';
  return /^(?:[A-Za-z][A-Za-z0-9+.-]*:\/\/|www\.)/.test(token);
}

/**
 * Ersetzt Wiki-Links durch Platzhalter.
 *
 * Gebraucht wird das an beiden Enden der Umwandlung: beim Laden, damit der
 * Markdown-Leser aus `[[Der *Turm*]]` keinen kursiven Text macht und den Link
 * dabei in Stuecke schneidet; beim Speichern, damit die Maskierung von
 * Sonderzeichen den Link nicht zerlegt.
 */
export function maskWikiLinks(text: string): MaskedWikiLinks {
  const links: string[] = [];

  const masked = text.replace(new RegExp(WIKI_LINK_PATTERN.source, 'g'), (whole, ...rest) => {
    // Doppelte Klammern koennen auch in einer Adresse stehen. Dort sind sie
    // kein Link, und ein Platzhalter darin landete im Verweis selbst.
    const index = rest[rest.length - 2] as number;
    if (insideUrl(text, index)) return whole;

    links.push(whole);
    return `${MASK_OPEN}${links.length - 1}${MASK_CLOSE}`;
  });

  return {
    masked,
    restore: (value, map = (link) => link) =>
      value.replace(MASK_PATTERN, (whole, index: string) => {
        const link = links[Number(index)];
        return link === undefined ? whole : map(link);
      })
  };
}
