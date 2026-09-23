/**
 * Eine Begegnung als Markdown mit YAML-Kopf.
 *
 * Dasselbe Muster wie bei Monstern, Zustaenden und den Begegnungen des
 * Trackers: eine Datei, die man in jedem Texteditor lesen und aendern kann.
 * Wer das Werkzeug nicht mehr benutzt, behaelt seine Begegnungen.
 *
 * EINE BEGEGNUNG IST EINE VORLAGE, KEIN SPIELSTAND.
 * =================================================
 * Der Tracker liest sie und schreibt nicht zurueck. Zwei Staende, die
 * auseinanderlaufen, sind am Tisch schlimmer als einer, der nach dem Kampf
 * eben nicht mehr stimmt. Wer dieselbe Begegnung ein zweites Mal spielt,
 * faengt bewusst wieder bei der Vorlage an.
 *
 * Siehe `docs/encounter.md`.
 */

/**
 * Ein Gegner in der Begegnung: ein Monster aus der Sammlung, mit Anzahl.
 *
 * Der Name steht mit in der Datei, obwohl die Kennung reichen wuerde.
 * **Damit ein geloeschtes Monster sichtbar fehlt.** Stuende nur die Kennung
 * da, zeigte die Begegnung nach dem Loeschen eine leere Zeile — und niemand
 * wuesste, was dort einmal stand. So steht wenigstens der Name da, mit dem
 * Hinweis, dass es ihn nicht mehr gibt.
 */
export interface Gegner {
  /** Die Kennung im Ordner des Monster Creators. */
  readonly monsterId: string;
  readonly name: string;
  readonly anzahl: number;
}

export interface Begegnung {
  readonly id: string;
  readonly name: string;
  readonly gegner: readonly Gegner[];
  /** Die Kennung aus `@suite/umgebungen`, oder leer. */
  readonly umgebungId: string;
  /** Freier Text: Taktik, Vorlesetext, was man sonst dazuschreiben will. */
  readonly notiz: string;
  /** ISO-Zeitpunkt. Fuers Sortieren nach „zuletzt". */
  readonly geaendert: string;
}

/** Was die Sammlung von einer Datei wissen muss, ohne sie ganz zu lesen. */
export interface Eintrag {
  readonly id: string;
  readonly name: string;
  readonly umgebungId: string;
  /** Wie viele Wesen insgesamt, nicht wie viele Sorten. */
  readonly gegnerzahl: number;
  /** Die Namen, fuer die Zeile unter der Ueberschrift und fuer die Suche. */
  readonly gegnernamen: readonly string[];
  readonly geaendert: string;
}

export const SCHEMA_VERSION = 1;

/**
 * Eine Kennung aus einem Namen.
 *
 * Dieselbe Regel wie in den anderen Werkzeugen. Eindeutig wird sie erst
 * durch `freieKennung` — Namen wiederholen sich, und zwei Begegnungen
 * „Hinterhalt" duerfen einander nicht ueberschreiben.
 */
export function zuId(name: string): string {
  const sauber = name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sauber || 'begegnung';
}

/**
 * Eine Kennung, die noch niemand hat.
 *
 * Dieselbe Funktion wie im Status Effect Creator, und aus demselben Grund:
 * dort hatten zwei gleichnamige Pakete dieselbe Kennung bekommen und
 * standen in der Sammlung als eines da. Hier waere es schlimmer — die
 * Datei wuerde ueberschrieben, und die aeltere Begegnung waere weg.
 */
export function freieKennung(wunsch: string, vergeben: Iterable<string>): string {
  const belegt = new Set(vergeben);
  if (!belegt.has(wunsch)) return wunsch;
  for (let n = 2; ; n += 1) {
    const versuch = `${wunsch}-${n}`;
    if (!belegt.has(versuch)) return versuch;
  }
}

/** YAML-sicher: Werte, die der Leser sonst falsch versteht, kommen in Anfuehrungszeichen. */
function alsYaml(wert: string): string {
  return /^[A-Za-z0-9äöüÄÖÜß ._-]*$/.test(wert) && wert.trim() === wert && wert !== ''
    ? wert
    : JSON.stringify(wert);
}

/** Wie viele Wesen insgesamt in der Begegnung stehen. */
export function gegnerzahl(gegner: readonly Gegner[]): number {
  return gegner.reduce((summe, einer) => summe + Math.max(0, einer.anzahl), 0);
}

/**
 * Die ganze Datei: Kopfzahlen als YAML, darunter die Begegnung zum Lesen.
 *
 * Die Gegner stehen als JSON-Zeile im Kopf, nicht als Liste im Leib —
 * genauso wie die Teilnehmer in den Begegnungen des Trackers. Der Leib ist
 * fuer Menschen, der Kopf fuer Maschinen, und beides zu mischen hiesse,
 * dass jede Textaenderung Daten kaputtmacht.
 */
export function alsMarkdown(begegnung: Begegnung): string {
  const kopf = [
    '---',
    `id: ${alsYaml(begegnung.id)}`,
    `name: ${alsYaml(begegnung.name)}`,
    `gegner: ${JSON.stringify(begegnung.gegner)}`,
    ...(begegnung.umgebungId ? [`umgebung: ${alsYaml(begegnung.umgebungId)}`] : []),
    `geaendert: ${begegnung.geaendert}`,
    `schemaVersion: ${SCHEMA_VERSION}`,
    '---',
    ''
  ];
  return [...kopf, ...leibzeilen(begegnung)].join('\n');
}

function leibzeilen(begegnung: Begegnung): string[] {
  const zeilen = [`# ${begegnung.name}`, ''];
  if (begegnung.gegner.length > 0) {
    zeilen.push('## Gegner', '');
    for (const einer of begegnung.gegner) {
      zeilen.push(`- ${einer.anzahl}× ${einer.name}`);
    }
    zeilen.push('');
  }
  const notiz = begegnung.notiz.trim();
  if (notiz) zeilen.push('## Notiz', '', notiz, '');
  return zeilen;
}

/**
 * Liest eine Begegnung.
 *
 * Nachsichtig: fehlt etwas oder ist es kaputt, wird es durch einen
 * sinnvollen Wert ersetzt, statt die Datei abzulehnen. Eine Begegnung, die
 * sich wegen eines Tippfehlers im Kopf gar nicht mehr oeffnen laesst, waere
 * am Spieltisch das Schlimmste, was passieren kann — dieselbe Haltung wie
 * im Tracker.
 */
export function leseBegegnung(text: string, ersatzId: string): Begegnung {
  const treffer = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  const kopfText = treffer ? treffer[1] : '';
  const leib = treffer ? treffer[2] : text;

  const kopf = new Map<string, unknown>();
  for (const zeile of kopfText.split(/\r?\n/)) {
    const doppelpunkt = zeile.indexOf(':');
    if (doppelpunkt <= 0) continue;
    const schluessel = zeile.slice(0, doppelpunkt).trim();
    const rest = zeile.slice(doppelpunkt + 1).trim();
    try {
      kopf.set(schluessel, JSON.parse(rest));
    } catch {
      // Von Hand geaenderte Werte stehen oft ohne Anfuehrungszeichen da.
      kopf.set(schluessel, rest.replace(/^["']|["']$/g, ''));
    }
  }

  const id = typeof kopf.get('id') === 'string' && kopf.get('id') ? String(kopf.get('id')) : ersatzId;
  return {
    id,
    name: typeof kopf.get('name') === 'string' && kopf.get('name') ? String(kopf.get('name')) : id,
    gegner: leseGegner(kopf.get('gegner')),
    umgebungId: typeof kopf.get('umgebung') === 'string' ? String(kopf.get('umgebung')) : '',
    notiz: leseNotiz(leib),
    geaendert:
      typeof kopf.get('geaendert') === 'string' ? String(kopf.get('geaendert')) : ''
  };
}

function leseGegner(roh: unknown): Gegner[] {
  if (!Array.isArray(roh)) return [];
  return roh
    .map((eintrag) => {
      const e = (eintrag ?? {}) as Record<string, unknown>;
      const anzahl = typeof e.anzahl === 'number' && Number.isFinite(e.anzahl) ? e.anzahl : 1;
      return {
        monsterId: typeof e.monsterId === 'string' ? e.monsterId : '',
        name: typeof e.name === 'string' ? e.name : '',
        // Null oder negativ ergibt keinen Gegner, aber die Zeile soll nicht
        // verschwinden — sonst loescht ein Tippfehler stillschweigend etwas.
        anzahl: Math.max(1, Math.round(anzahl))
      };
    })
    .filter((einer) => einer.monsterId || einer.name);
}

/**
 * Den Notizteil aus dem Leib holen.
 *
 * Nur der Abschnitt `## Notiz`: der Rest des Leibes wird beim Speichern aus
 * den Kopfzahlen neu erzeugt, und was dort von Hand hineingeschrieben
 * wurde, ginge beim naechsten Speichern ohnehin verloren. Die Notiz ist die
 * eine Stelle, an der freier Text bleibt.
 */
function leseNotiz(leib: string): string {
  const treffer = /^##\s+Notiz\s*$/m.exec(leib);
  if (!treffer) return '';
  const ab = leib.slice(treffer.index + treffer[0].length);
  const naechste = /^##\s+/m.exec(ab);
  return (naechste ? ab.slice(0, naechste.index) : ab).trim();
}

/** Was die Sammlung braucht, aus einer gelesenen Begegnung. */
export function alsEintrag(begegnung: Begegnung): Eintrag {
  return {
    id: begegnung.id,
    name: begegnung.name,
    umgebungId: begegnung.umgebungId,
    gegnerzahl: gegnerzahl(begegnung.gegner),
    gegnernamen: begegnung.gegner.map((einer) => einer.name),
    geaendert: begegnung.geaendert
  };
}

/** Eine leere Begegnung, wie sie beim Anlegen aussieht. */
export function leereBegegnung(name: string, jetzt: string): Begegnung {
  return {
    id: zuId(name),
    name,
    gegner: [],
    umgebungId: '',
    notiz: '',
    geaendert: jetzt
  };
}

/**
 * Ein Name fuer eine Begegnung, der man keinen gegeben hat.
 *
 * Beim Anlegen nach einem Namen zu fragen war eine Huerde vor dem
 * eigentlichen Tun (Rueckmeldung: „Man soll neuen Encountern nicht direkt
 * Namen geben muessen"). Also: „Encounter_1", „Encounter_2", … — die
 * kleinste Nummer, die noch frei ist. Gross und klein zaehlen gleich,
 * damit „encounter_1" nicht neben „Encounter_1" entsteht.
 */
export function naechsterName(vorhandene: readonly string[], basis = 'Encounter'): string {
  const vergeben = new Set(vorhandene.map((name) => name.trim().toLowerCase()));
  let nummer = 1;
  while (vergeben.has(`${basis}_${nummer}`.toLowerCase())) nummer += 1;
  return `${basis}_${nummer}`;
}
