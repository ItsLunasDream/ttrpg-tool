/**
 * Eintraege zwischen Sammlungen weitergeben (docs/austausch.md, Stufe 1).
 *
 * Der zweite der beiden Saetze aus dem Konzept. Den ersten, „gib mir deine
 * Eintraege", beantwortet schon `@suite/eintraege` fuer die Suche. Hier
 * steht der Rest:
 *
 *     „Gib mir DIESEN Eintrag, ganz."   -> eine Sendung
 *     „Nimm diesen Eintrag an."         -> Empfang, mit Rueckfrage bei
 *                                          gleicher Kennung
 *
 * Ein Werkzeug, das mitmacht, beantwortet beides (`Teilnehmer`). Die Huelle
 * vermittelt; sie weiss ueber ein Werkzeug nur, DASS es mitmacht.
 *
 * **Markdown als Transportform.** Jede Sendung traegt den Text, den das
 * Werkzeug ohnehin auf die Platte schreibt. Ein Paket ist eine Markdown-
 * Datei, die man aufmachen und lesen kann; die Verwaltung steht in
 * HTML-Kommentaren, die jede Vorschau ausblendet. Bilder reisen mit, als
 * Base64 in einem solchen Kommentar.
 *
 * **Nichts ueberschreibt stillschweigend.** Gibt es die Kennung beim
 * Empfaenger schon, wird gefragt: uebernehmen, daneben legen oder
 * verwerfen. Daneben legen ist die Vorgabe.
 *
 * Plattformfrei: nur Daten und reine Funktionen. Lesen und Schreiben auf
 * der Platte tut jedes Werkzeug in seinem Hauptprozess.
 */

/** Ein Bild, das mit einem Eintrag reist. */
export interface Bild {
  /** Wie der Eintrag darauf verweist, etwa `assets/1234.png`. */
  readonly name: string;
  readonly mime: string;
  /** Der Inhalt als Base64. */
  readonly daten: string;
}

/** Ein Eintrag auf der Reise. */
export interface Sendung {
  /** Das Werkzeug, in das er gehoert (`monster`, `backstory`, …). */
  readonly werkzeug: string;
  /** Eindeutig innerhalb des Werkzeugs, wie in `@suite/eintraege`. */
  readonly kennung: string;
  readonly name: string;
  /** Was es ist, in der Sprache des Absenders: „Monster", „Notiz". */
  readonly art: string;
  /**
   * Das Markdown, wie das Werkzeug es ablegt — oder `null` fuer einen
   * Verweis: eine offizielle Regel reist nicht, sie wird genannt.
   */
  readonly inhalt: string | null;
  readonly bilder: readonly Bild[];
  /**
   * Was das Werkzeug beim Empfang sonst noch braucht und nicht im Inhalt
   * steht — der Story Creator etwa die Beschriftung des Notiztyps. Nur
   * Zeichenketten, damit das Paket lesbar bleibt.
   */
  readonly zusatz?: Readonly<Record<string, string>>;
}

export interface Paket {
  readonly version: 1;
  /** ISO-Zeit. */
  readonly erstellt: string;
  readonly sendungen: readonly Sendung[];
}

/**
 * Was mit einer Sendung geschieht, deren Kennung es schon gibt.
 *
 * - `uebernehmen`: die vorhandene Fassung wird ersetzt.
 * - `daneben`: die Sendung bekommt eine freie Kennung und liegt neben der
 *   vorhandenen. Die Vorgabe: nichts geht verloren.
 * - `verwerfen`: die Sendung wird nicht angenommen.
 */
export type Modus = 'uebernehmen' | 'daneben' | 'verwerfen';
export const VORGABE_MODUS: Modus = 'daneben';

/** Was ein Werkzeug nach dem Annehmen meldet. */
export interface Empfang {
  readonly ok: boolean;
  /** Unter welcher Kennung die Sendung jetzt liegt. */
  readonly kennung?: string;
  /** Warum nicht, in der Sprache der Sammlung. */
  readonly grund?: string;
}

/** Ein Ort innerhalb eines Werkzeugs, an den etwas gehen kann: eine Kampagne. */
export interface Ziel {
  readonly id: string;
  readonly name: string;
}

/**
 * Was ein Werkzeug fuer den Austausch beantwortet.
 *
 * Alles von der Platte, nicht aus der Oberflaeche: angenommen wird auch,
 * wenn das Werkzeug gerade zu ist. Beim naechsten Oeffnen ist der Eintrag
 * da.
 */
export interface Teilnehmer {
  readonly werkzeug: string;
  /** Der ganze Eintrag, oder `null`, wenn es ihn nicht gibt. */
  gib(datenordner: string, kennung: string): Promise<Sendung | null>;
  /**
   * Wohin etwas gehen kann, wenn das Werkzeug mehrere Orte hat (die
   * Kampagnen im Story Creator). Fehlt, wenn es nur einen gibt.
   */
  ziele?(datenordner: string): Promise<readonly Ziel[]>;
  /** Ob es diesen Eintrag im Ziel schon gibt. */
  gibtEs(datenordner: string, sendung: Sendung, ziel?: string): Promise<boolean>;
  nimmAn(datenordner: string, sendung: Sendung, modus: Modus, ziel?: string): Promise<Empfang>;
}

/* ------------------------------------------------------------------------ */
/* Das Paket als Datei                                                      */
/* ------------------------------------------------------------------------ */

export const PAKET_ENDUNG = '.ttrpg.md';
/** Groesser nimmt der Empfang nicht an: ein Paket ist fuer den Tisch, nicht fuer eine Sicherung. */
export const MAX_PAKET_BYTES = 64 * 1024 * 1024;

const MARKE = '<!-- ttrpg:';
const MARKE_ZEILE = /^<!-- ttrpg:(paket|eintrag|bild|ende)(?: (.*?))?(?: -->)?$/;
/** Eine Zeile im Inhalt, die wie eine Marke aussieht, bekommt einen Rueckstrich mehr. */
const WIE_MARKE = /^\\*<!-- ttrpg:/;

export class PaketFehler extends Error {}

function escape(zeile: string): string {
  return WIE_MARKE.test(zeile) ? `\\${zeile}` : zeile;
}

function unescape(zeile: string): string {
  return /^\\+<!-- ttrpg:/.test(zeile) ? zeile.slice(1) : zeile;
}

/** Base64 in Zeilen zu 76 Zeichen, damit ein Editor die Datei noch oeffnet. */
function umbrechen(daten: string): string[] {
  const zeilen: string[] = [];
  for (let i = 0; i < daten.length; i += 76) zeilen.push(daten.slice(i, i + 76));
  return zeilen;
}

export function alsPaket(paket: Paket): string {
  const zeilen = [
    '# TTRPG-Tools',
    '',
    `${MARKE}paket ${JSON.stringify({ version: paket.version, erstellt: paket.erstellt })} -->`,
    ''
  ];
  for (const s of paket.sendungen) {
    const kopf: Record<string, unknown> = {
      werkzeug: s.werkzeug,
      kennung: s.kennung,
      name: s.name,
      art: s.art
    };
    if (s.inhalt === null) kopf.verweis = true;
    if (s.zusatz && Object.keys(s.zusatz).length > 0) kopf.zusatz = s.zusatz;
    zeilen.push(`${MARKE}eintrag ${JSON.stringify(kopf)} -->`);
    if (s.inhalt !== null) zeilen.push(...s.inhalt.split('\n').map(escape));
    for (const bild of s.bilder) {
      zeilen.push(`${MARKE}bild ${JSON.stringify({ name: bild.name, mime: bild.mime })}`);
      zeilen.push(...umbrechen(bild.daten));
      zeilen.push('-->');
    }
    zeilen.push(`${MARKE}ende -->`, '');
  }
  return zeilen.join('\n');
}

function json(text: string | undefined, wo: string): Record<string, unknown> {
  try {
    const wert = JSON.parse(text ?? '') as unknown;
    if (typeof wert === 'object' && wert !== null && !Array.isArray(wert)) return wert as Record<string, unknown>;
  } catch {
    // unten
  }
  throw new PaketFehler(`Unlesbare Angabe (${wo})`);
}

function zeichenkette(wert: unknown, wo: string): string {
  if (typeof wert !== 'string' || !wert) throw new PaketFehler(`Fehlende Angabe: ${wo}`);
  return wert;
}

/**
 * Liest ein Paket. Wirft `PaketFehler`, wenn die Datei keines ist oder
 * mittendrin abbricht — ein halbes Paket anzunehmen waere schlimmer als
 * keines.
 */
export function lesePaket(text: string): Paket {
  const zeilen = text.replace(/\r\n/g, '\n').split('\n');
  let kopf: Record<string, unknown> | null = null;
  const sendungen: Sendung[] = [];
  let i = 0;
  while (i < zeilen.length) {
    const treffer = MARKE_ZEILE.exec(zeilen[i]);
    if (!treffer) {
      i += 1;
      continue;
    }
    const [, art, angabe] = treffer;
    if (art === 'paket') {
      kopf = json(angabe, 'Paket');
      i += 1;
      continue;
    }
    if (art !== 'eintrag') throw new PaketFehler(`Unerwartete Marke „${art}" in Zeile ${i + 1}`);
    const k = json(angabe, `Zeile ${i + 1}`);
    i += 1;
    const inhalt: string[] = [];
    const bilder: Bild[] = [];
    let fertig = false;
    while (i < zeilen.length) {
      const m = MARKE_ZEILE.exec(zeilen[i]);
      if (m?.[1] === 'ende') {
        fertig = true;
        i += 1;
        break;
      }
      if (m?.[1] === 'bild') {
        const b = json(m[2], `Bild in Zeile ${i + 1}`);
        i += 1;
        const daten: string[] = [];
        while (i < zeilen.length && zeilen[i] !== '-->') daten.push(zeilen[i++].trim());
        if (i >= zeilen.length) throw new PaketFehler('Ein Bild bricht ab');
        i += 1;
        const d = daten.join('');
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(d)) throw new PaketFehler('Ein Bild ist kein Base64');
        bilder.push({ name: zeichenkette(b.name, 'Bildname'), mime: zeichenkette(b.mime, 'Bildart'), daten: d });
        continue;
      }
      if (m) throw new PaketFehler(`Unerwartete Marke „${m[1]}" in Zeile ${i + 1}`);
      if (bilder.length > 0) {
        // Nach den Bildern kommt nur noch das Ende.
        if (zeilen[i].trim()) throw new PaketFehler(`Text nach den Bildern in Zeile ${i + 1}`);
        i += 1;
        continue;
      }
      inhalt.push(unescape(zeilen[i]));
      i += 1;
    }
    if (!fertig) throw new PaketFehler('Das Paket bricht mitten in einem Eintrag ab');
    const zusatz =
      typeof k.zusatz === 'object' && k.zusatz !== null
        ? Object.fromEntries(
            Object.entries(k.zusatz as Record<string, unknown>).filter(
              (e): e is [string, string] => typeof e[1] === 'string'
            )
          )
        : undefined;
    sendungen.push({
      werkzeug: zeichenkette(k.werkzeug, 'Werkzeug'),
      kennung: zeichenkette(k.kennung, 'Kennung'),
      name: zeichenkette(k.name, 'Name'),
      art: typeof k.art === 'string' ? k.art : '',
      inhalt: k.verweis === true ? null : inhalt.join('\n'),
      bilder,
      ...(zusatz ? { zusatz } : {})
    });
  }
  if (!kopf) throw new PaketFehler('Keine Paketdatei');
  if (kopf.version !== 1) throw new PaketFehler(`Unbekannte Fassung ${String(kopf.version)}`);
  return {
    version: 1,
    erstellt: typeof kopf.erstellt === 'string' ? kopf.erstellt : '',
    sendungen
  };
}

/* ------------------------------------------------------------------------ */
/* Hilfen fuer die Werkzeuge                                                */
/* ------------------------------------------------------------------------ */

/** Eine Kennung, die noch nicht vergeben ist: „ghul", „ghul-2", … */
export function freieKennung(wunsch: string, vergeben: Iterable<string>): string {
  const belegt = new Set(vergeben);
  if (!belegt.has(wunsch)) return wunsch;
  let n = 2;
  while (belegt.has(`${wunsch}-${n}`)) n += 1;
  return `${wunsch}-${n}`;
}

/**
 * Setzt einen Wert im YAML-Kopf (`---` … `---`) einer Markdown-Datei.
 *
 * Fuer „daneben legen": die Sendung bekommt eine neue Kennung, und die
 * steht bei Monstern im Kopf. Bewusst nur fuer einfache `schluessel: wert`-
 * Zeilen, wie die Werkzeuge sie selbst schreiben. Fehlt der Schluessel,
 * kommt er ans Ende des Kopfes; fehlt der Kopf, bleibt der Text, wie er ist.
 */
export function setzeKopfwert(markdown: string, schluessel: string, wert: string): string {
  const treffer = /^(---\r?\n)([\s\S]*?)(\r?\n---)/.exec(markdown);
  if (!treffer) return markdown;
  const geschrieben = /[:#"'\n]|^\s|\s$/.test(wert) ? JSON.stringify(wert) : wert;
  const zeilen = treffer[2].split(/\r?\n/);
  const stelle = zeilen.findIndex((z) => z.startsWith(`${schluessel}:`));
  if (stelle >= 0) zeilen[stelle] = `${schluessel}: ${geschrieben}`;
  else zeilen.push(`${schluessel}: ${geschrieben}`);
  return treffer[1] + zeilen.join('\n') + markdown.slice(treffer[1].length + treffer[2].length);
}

/** Die Bildverweise (`](assets/x.png)`) in einem Markdown-Text. */
export function bildverweise(markdown: string, ordner = 'assets'): string[] {
  const muster = new RegExp(`\\]\\((${ordner}/[^)\\s]+)\\)`, 'g');
  return [...new Set([...markdown.matchAll(muster)].map((m) => m[1]))];
}

/** Die Bildart aus der Endung. Nur, was die Werkzeuge ohnehin annehmen. */
export function mimeVon(name: string): string {
  const endung = name.toLowerCase().split('.').pop() ?? '';
  return (
    { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' }[
      endung
    ] ?? 'application/octet-stream'
  );
}

export * from './raum';
