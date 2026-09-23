/**
 * Notizen an einer Stelle im Regeltext.
 *
 * WORAN EINE NOTIZ HAENGT (docs/nachschlagewerk.md, „Notizen am Text"):
 * nicht an Zeichen 214 bis 263 — das verrutscht, sobald der Text einmal neu
 * erfasst wird —, sondern an
 *
 *   1. dem Eintrag, der Sprachfassung und dem Block darin,
 *   2. dem ausgewaehlten Text selbst,
 *   3. dem wievielten Vorkommen dieses Textes im Block.
 *
 * Findet sich der Text nicht mehr, ist die Notiz nicht weg: sie steht oben
 * am Eintrag mit dem Vermerk, dass ihre Stelle verschwunden ist.
 *
 * Plattformfrei, damit die Tests ohne Electron laufen.
 */

export interface Notiz {
  readonly id: string;
  /** Die Kennung des Eintrags (`zustand/prone`). */
  readonly regel: string;
  readonly sprache: 'de' | 'en';
  /** Der Block im Eintrag, gezaehlt ab null. */
  readonly block: number;
  /** Der ausgewaehlte Text. */
  readonly stelle: string;
  /** Das wievielte Vorkommen von `stelle` im Block, ab null. */
  readonly vorkommen: number;
  readonly text: string;
  readonly geaendert: string;
}

/** Wo das n-te Vorkommen steht, oder -1. */
export function nteStelle(text: string, gesucht: string, n: number): number {
  if (!gesucht) return -1;
  let ab = 0;
  for (let i = 0; ; i += 1) {
    const stelle = text.indexOf(gesucht, ab);
    if (stelle < 0) return -1;
    if (i === n) return stelle;
    ab = stelle + 1;
  }
}

/** Das wievielte Vorkommen an `offset` beginnt — fuer das Anlegen. */
export function vorkommenBei(text: string, gesucht: string, offset: number): number {
  let n = 0;
  let ab = 0;
  for (;;) {
    const stelle = text.indexOf(gesucht, ab);
    if (stelle < 0 || stelle >= offset) return n;
    n += 1;
    ab = stelle + 1;
  }
}

export type Markstueck = string | { readonly text: string; readonly notiz: Notiz };

/**
 * Zerlegt einen Text in Stuecke, und die Stellen, an denen Notizen haengen,
 * werden zu Marken. `versatz` ist, wie weit dieser Text im Block hinten
 * steht (bei einem Unterpunkt: hinter dem fetten Kopf). Ueberlappende
 * Stellen: die frueher beginnende gewinnt, die andere haengt oben.
 */
export function markiere(
  text: string,
  blocktext: string,
  versatz: number,
  notizen: readonly Notiz[]
): Markstueck[] {
  const stellen = notizen
    .map((notiz) => ({ notiz, von: nteStelle(blocktext, notiz.stelle, notiz.vorkommen) - versatz }))
    .filter((s) => s.von >= 0 && s.von + s.notiz.stelle.length <= text.length)
    .sort((a, b) => a.von - b.von);
  const stuecke: Markstueck[] = [];
  let stand = 0;
  for (const { notiz, von } of stellen) {
    if (von < stand) continue;
    if (von > stand) stuecke.push(text.slice(stand, von));
    stuecke.push({ text: text.slice(von, von + notiz.stelle.length), notiz });
    stand = von + notiz.stelle.length;
  }
  if (stand < text.length) stuecke.push(text.slice(stand));
  return stuecke;
}

/** Ob eine Notiz ihre Stelle noch findet. */
export function findetStelle(notiz: Notiz, blocktext: string | undefined): boolean {
  return blocktext !== undefined && nteStelle(blocktext, notiz.stelle, notiz.vorkommen) >= 0;
}

/** Die Notizen aus der Datei; was nicht passt, faellt heraus statt zu werfen. */
export function leseNotizen(inhalt: string): Notiz[] {
  try {
    const roh = JSON.parse(inhalt) as unknown;
    if (!Array.isArray(roh)) return [];
    return roh.filter(
      (n): n is Notiz =>
        typeof n === 'object' &&
        n !== null &&
        typeof (n as Notiz).id === 'string' &&
        typeof (n as Notiz).regel === 'string' &&
        typeof (n as Notiz).stelle === 'string' &&
        typeof (n as Notiz).text === 'string'
    );
  } catch {
    return [];
  }
}
