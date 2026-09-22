/**
 * Hausregeln: selbst geschrieben, neben den offiziellen.
 *
 * Eine Hausregel ist eine Markdown-Datei mit einem kurzen Kopf:
 *
 *   ---
 *   name: Kritische Treffer
 *   bezug: regel/critical-hit
 *   geaendert: 2026-09-22T18:00:00.000Z
 *   ---
 *   Bei uns wird der Schaden maximiert statt doppelt gewuerfelt.
 *
 * `bezug` ist die Kennung der offiziellen Regel, die sie aendert, oder
 * leer. Steht er, traegt die offizielle Regel eine Marke — sonst liest man
 * am Spielabend die offizielle und vergisst, dass am eigenen Tisch etwas
 * anderes gilt (docs/nachschlagewerk.md).
 *
 * Nicht uebersetzt: was die Spielleitung schreibt, kommt so zurueck.
 *
 * Plattformfrei, damit die Tests ohne Electron laufen.
 */

export interface Hausregel {
  readonly id: string;
  readonly name: string;
  /** Die Kennung der offiziellen Regel (`zustand/prone`), oder leer. */
  readonly bezug: string;
  readonly text: string;
  readonly geaendert: string;
}

export function zuId(name: string): string {
  const sauber = name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sauber || 'hausregel';
}

/** Eine Kennung, die noch nicht vergeben ist: „kritisch", „kritisch-2", … */
export function freieKennung(wunsch: string, vergeben: Iterable<string>): string {
  const belegt = new Set(vergeben);
  if (!belegt.has(wunsch)) return wunsch;
  let n = 2;
  while (belegt.has(`${wunsch}-${n}`)) n += 1;
  return `${wunsch}-${n}`;
}

/** Ein Wert im Kopf, so geschrieben, dass ein Doppelpunkt ihn nicht zerreisst. */
function kopfwert(wert: string): string {
  return /[:#"'\n]|^\s|\s$/.test(wert) ? JSON.stringify(wert.replace(/\n/g, ' ')) : wert;
}

export function alsMarkdown(regel: Hausregel): string {
  return [
    '---',
    `name: ${kopfwert(regel.name)}`,
    `bezug: ${kopfwert(regel.bezug)}`,
    `geaendert: ${regel.geaendert}`,
    '---',
    regel.text.trim(),
    ''
  ].join('\n');
}

export function leseHausregel(inhalt: string, ersatzId: string): Hausregel {
  const treffer = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(inhalt);
  const kopf: Record<string, string> = {};
  if (treffer) {
    for (const zeile of treffer[1].split(/\r?\n/)) {
      const stelle = zeile.indexOf(':');
      if (stelle <= 0) continue;
      let wert = zeile.slice(stelle + 1).trim();
      if (wert.startsWith('"')) {
        try {
          wert = JSON.parse(wert) as string;
        } catch {
          wert = wert.replace(/^"|"$/g, '');
        }
      }
      kopf[zeile.slice(0, stelle).trim()] = wert;
    }
  }
  const text = (treffer ? treffer[2] : inhalt).trim();
  return {
    id: ersatzId,
    name: kopf.name || ersatzId,
    bezug: kopf.bezug ?? '',
    text,
    geaendert: kopf.geaendert ?? ''
  };
}

/**
 * Die Verweise `[[Name]]` in einer Hausregel.
 *
 * Anders als im offiziellen Text darf hier geschrieben werden: die Hausregel
 * gehoert dem Tisch. Also dieselbe Schreibweise wie im Story Creator.
 */
export type Hausstueck = string | { readonly verweis: string };

export function zerlege(text: string): Hausstueck[] {
  const stuecke: Hausstueck[] = [];
  let stand = 0;
  for (const treffer of text.matchAll(/\[\[([^\]\n]{1,80})\]\]/g)) {
    const von = treffer.index ?? 0;
    if (von > stand) stuecke.push(text.slice(stand, von));
    stuecke.push({ verweis: treffer[1].trim() });
    stand = von + treffer[0].length;
  }
  if (stand < text.length) stuecke.push(text.slice(stand));
  return stuecke;
}
