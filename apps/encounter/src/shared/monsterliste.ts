/**
 * Die Monster aus der Sammlung des Monster Creators.
 *
 * DIE KOPPLUNG IST DER ORDNER, NICHT DER CODE.
 * ============================================
 * Der Monster Creator legt jedes Monster als Markdown mit YAML-Kopf ab.
 * Dieser Kopf ist die Schnittstelle: er steht so in `docs/monster.md` und
 * wird vom Initiative Tracker und von der Suche der Huelle genauso gelesen.
 *
 * Der Encounter Creator liest ihn hier selbst, statt eine Funktion aus
 * `apps/monster` zu importieren. Anwendungen haengen in dieser Sammlung
 * nicht voneinander ab — sie treffen sich ueber Dateien. Der Preis ist
 * dieser kleine Leser; der Gewinn ist, dass man den Monster Creator
 * umbauen kann, ohne dass hier etwas bricht, solange der Kopf bleibt.
 *
 * Gelesen werden nur die wenigen Felder, die eine Begegnung braucht. Was der
 * Monster Creator sonst noch in den Kopf schreibt, geht uns nichts an.
 */

/** Ein Monster, so wie eine Begegnung es braucht. */
export interface Monsterkarte {
  readonly id: string;
  readonly name: string;
  /** Der Herausforderungsgrad, als Text: „1/4" ist ein gueltiger Wert. */
  readonly cr: string;
  readonly tp: number;
  readonly rk: number;
  /**
   * Die Geschicklichkeit, roh.
   *
   * Nur dafuer da, den Zuschlag auf den Initiativewurf zu rechnen, wenn
   * die Begegnung in den Tracker wandert. Fehlt sie im Kopf, steht hier
   * 10 — das ergibt null Zuschlag, und null ist die ehrlichste Antwort
   * auf „steht nicht da".
   */
  readonly ge: number;
  /** Fuer die Suche in der Auswahlliste. */
  readonly themaId: string;
  readonly rolleId: string;
  /** Der Leib der Datei ohne Kopf: der Statblock, fuer den Tracker. */
  readonly statblock?: string;
}

/**
 * Den YAML-Kopf einer Datei lesen.
 *
 * Bewusst ein winziger Leser und kein YAML-Paket: der Kopf hat ein festes
 * Format, das wir selbst schreiben. Dieselbe Entscheidung wie in den
 * anderen Werkzeugen.
 */
function liesKopf(inhalt: string): Record<string, string> {
  const treffer = /^---\r?\n([\s\S]*?)\r?\n---/.exec(inhalt);
  if (!treffer) return {};
  const kopf: Record<string, string> = {};
  for (const zeile of treffer[1].split(/\r?\n/)) {
    const doppelpunkt = zeile.indexOf(':');
    if (doppelpunkt <= 0) continue;
    const schluessel = zeile.slice(0, doppelpunkt).trim();
    const wert = zeile.slice(doppelpunkt + 1).trim();
    kopf[schluessel] = wert.replace(/^["']|["']$/g, '');
  }
  return kopf;
}

/**
 * Ein Attributwert aus dem Kopf, mit 10 als Rueckfall.
 *
 * Nicht null: bei den anderen Zahlen ist null der ehrliche Rueckfall, bei
 * einem Attribut waere sie ein Wert wie jeder andere und ergaebe einen
 * Zuschlag von minus fuenf. Zehn heisst „durchschnittlich" und damit kein
 * Zuschlag.
 */
function attributwert(roh: string | undefined): number {
  if (roh === undefined || roh === '') return 10;
  const wert = Number(roh);
  return Number.isFinite(wert) ? wert : 10;
}

export function alsMonsterkarte(inhalt: string, rueckfallId: string): Monsterkarte {
  const kopf = liesKopf(inhalt);
  const zahl = (name: string) => {
    const wert = Number(kopf[name]);
    return Number.isFinite(wert) ? wert : 0;
  };
  return {
    id: kopf.id || rueckfallId,
    name: kopf.name || kopf.id || rueckfallId,
    cr: kopf.cr ?? '',
    tp: zahl('tp'),
    rk: zahl('rk'),
    ge: attributwert(kopf.ge),
    themaId: kopf.thema ?? '',
    rolleId: kopf.rolle ?? '',
    statblock: inhalt.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim()
  };
}

/** Kleinschreibung, Umlaute vereinheitlicht — wie in der uebrigen Suche. */
function schluessel(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');
}

/**
 * Die Monster, die zur Suche passen.
 *
 * Gesucht wird in Name, Thema, Rolle und Grad: „untot 5" ist die Art, wie
 * man am Tisch sucht. Alle Worte muessen vorkommen, nicht irgendeines —
 * sonst wird die Liste mit jedem getippten Wort laenger statt kuerzer.
 */
export function findeMonster(
  monster: readonly Monsterkarte[],
  suche: string
): Monsterkarte[] {
  const worte = schluessel(suche).split(/\s+/).filter(Boolean);
  const passend = monster.filter((einer) => {
    if (worte.length === 0) return true;
    const stroh = schluessel(
      [einer.name, einer.themaId, einer.rolleId, `cr ${einer.cr}`].join(' ')
    );
    return worte.every((wort) => stroh.includes(wort));
  });
  return passend.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}
