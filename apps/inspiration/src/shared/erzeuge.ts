/**
 * Aus den Tabellen wird ein Entwurf.
 *
 * Reine Funktionen mit uebergebenem Zufallsgeber, wie im NPC Creator. Nur so
 * laesst sich pruefen, was man sonst nur hoffen kann: dass zweimal
 * Wuerfeln zweierlei ergibt, dass ein festgehaltener Baustein wirklich stehen
 * bleibt und dass ein Zuschnitt die Auswahl verengt, ohne sie leerzuraeumen.
 *
 * Der Entwurf traegt fertige Texte, keine Verweise in die Tabellen — jedes
 * Feld soll von Hand aenderbar sein, und ein selbst geschriebener Satz hat
 * in keiner Tabelle eine Stelle. Der Preis dafuer ist derselbe wie dort: ein
 * fertiger Entwurf wechselt die Sprache nicht mit. Das ist die richtige
 * Seite des Tauschs, denn sonst uebersetzte man eigene Arbeit weg.
 */
import { AUSLOESER, BETROFFENE, FRISTEN, KOMPLIKATIONEN } from './haken';
import {
  FRAKTION_ART,
  FRAKTION_FORM,
  FRAKTION_MITTEL,
  FRAKTION_SCHWAECHE,
  FRAKTION_ZIEL,
  FRAKTION_ZUSATZ
} from './fraktionen';
import { HEBEL, MAKEL, ROLLEN, RUFNAMEN, TRIEBFEDERN } from './figuren';
import { NAME_ERSTE, NAME_ZWEITE, ORT_ART, ORT_KARTE, ORT_MERKMAL, ORT_ZUSTAND } from './orte';
import { VERBINDUNGEN, fuelle } from './verbindungen';
import { SCHRITTE, ZEITMARKEN, type Schritt } from './zeitstrahl';
import {
  MENGEN,
  passend,
  text,
  type Eintrag,
  type Paar,
  type Sprache,
  type Zuschnitt
} from './tabellen';

/** Die sechs Bausteine. Jeder einzeln erzeugbar und einzeln festhaltbar. */
export const BAUSTEINE = [
  'aufhaenger',
  'fraktionen',
  'figuren',
  'orte',
  'verbindungen',
  'zeitstrahl'
] as const;
export type Baustein = (typeof BAUSTEINE)[number];

export interface Aufhaenger {
  readonly ausloeser: string;
  readonly betroffene: string;
  readonly komplikation: string;
  /** Leer, wenn die Sache keine Uhr hat — und das ist oft das Unangenehmere. */
  readonly frist: string;
}

export interface Fraktion {
  readonly name: string;
  readonly art: string;
  readonly ziel: string;
  readonly mittel: string;
  readonly schwaeche: string;
}

export interface EntwurfsFigur {
  readonly name: string;
  readonly rolle: string;
  readonly triebfeder: string;
  readonly hebel: string;
  readonly makel: string;
}

export interface Ort {
  readonly name: string;
  readonly art: string;
  readonly merkmal: string;
  readonly zustand: string;
  /** Ein Satz darueber, was auf einer Karte davon stehen wuerde. */
  readonly karte: string;
}

export interface Verbindung {
  /** Stellen in `figuren`. Fuer das Geflecht, das spaeter gezeichnet wird. */
  readonly a: number;
  readonly b: number;
  readonly muster: string;
  /** Wie A auf B sieht, mit eingesetzten Namen. */
  readonly hin: string;
  readonly zurueck: string;
}

export interface Zeitpunkt {
  readonly marke: string;
  readonly was: string;
}

export interface Entwurf {
  readonly aufhaenger: Aufhaenger;
  readonly fraktionen: readonly Fraktion[];
  readonly figuren: readonly EntwurfsFigur[];
  readonly orte: readonly Ort[];
  readonly verbindungen: readonly Verbindung[];
  readonly zeitstrahl: readonly Zeitpunkt[];
}

/** Wie oft ein Aufhaenger eine Frist bekommt. */
export const FRIST_CHANCE = 0.6;

function waehle<T>(liste: readonly T[], rng: () => number): T {
  if (liste.length === 0) throw new Error('leere Liste');
  return liste[Math.min(liste.length - 1, Math.floor(rng() * liste.length))];
}

/**
 * Mehrere verschiedene Eintraege.
 *
 * Ohne „verschieden" stuenden bei drei Orten schon mal zwei gleiche
 * nebeneinander — bei vierzig Eintraegen ist das haeufiger, als man denkt
 * (Geburtstagsparadoxon), und es sieht nach einem Fehler aus, weil es einer
 * ist. Reicht die Liste nicht, wird wiederholt statt abgebrochen.
 */
function waehleMehrere<T>(liste: readonly T[], anzahl: number, rng: () => number): T[] {
  const uebrig = [...liste];
  const heraus: T[] = [];
  for (let i = 0; i < anzahl; i += 1) {
    if (uebrig.length === 0) heraus.push(waehle(liste, rng));
    else heraus.push(uebrig.splice(Math.floor(rng() * uebrig.length), 1)[0]);
  }
  return heraus;
}

function ausTabelle(liste: readonly Eintrag[], zuschnitt: Zuschnitt, sprache: Sprache, rng: () => number): string {
  return text(waehle(passend(liste, zuschnitt), rng), sprache);
}

function ausPaaren(liste: readonly Paar[], sprache: Sprache, rng: () => number): string {
  return text(waehle(liste, rng), sprache);
}

// --- Die einzelnen Bausteine ------------------------------------------------

export function erzeugeAufhaenger(zuschnitt: Zuschnitt, sprache: Sprache, rng: () => number): Aufhaenger {
  return {
    ausloeser: ausTabelle(AUSLOESER, zuschnitt, sprache, rng),
    betroffene: ausTabelle(BETROFFENE, zuschnitt, sprache, rng),
    komplikation: ausTabelle(KOMPLIKATIONEN, zuschnitt, sprache, rng),
    frist: rng() < FRIST_CHANCE ? ausTabelle(FRISTEN, zuschnitt, sprache, rng) : ''
  };
}

/** Ein Ortsname aus zwei Haelften: Rabenstein, Nebelhafen, Aschbrücke. */
export function erzeugeName(sprache: Sprache, rng: () => number): string {
  const erste = ausPaaren(NAME_ERSTE, sprache, rng);
  const zweite = ausPaaren(NAME_ZWEITE, sprache, rng);
  // Im Englischen trennt ein Apostroph-Name („King's") das Wort; sonst wird
  // zusammengeschrieben wie im Deutschen.
  const getrennt = erste.endsWith('’s');
  return getrennt ? `${erste} ${zweite}` : erste + zweite;
}

export function erzeugeFraktion(zuschnitt: Zuschnitt, sprache: Sprache, rng: () => number): Fraktion {
  return {
    name: `${ausPaaren(FRAKTION_FORM, sprache, rng)} ${ausPaaren(FRAKTION_ZUSATZ, sprache, rng)}`,
    art: ausTabelle(FRAKTION_ART, zuschnitt, sprache, rng),
    ziel: ausTabelle(FRAKTION_ZIEL, zuschnitt, sprache, rng),
    mittel: ausPaaren(FRAKTION_MITTEL, sprache, rng),
    schwaeche: ausPaaren(FRAKTION_SCHWAECHE, sprache, rng)
  };
}

export function erzeugeFigur(zuschnitt: Zuschnitt, sprache: Sprache, rng: () => number): EntwurfsFigur {
  return {
    name: `${waehle(RUFNAMEN, rng)} ${erzeugeName(sprache, rng)}`,
    rolle: ausTabelle(ROLLEN, zuschnitt, sprache, rng),
    triebfeder: ausTabelle(TRIEBFEDERN, zuschnitt, sprache, rng),
    hebel: ausPaaren(HEBEL, sprache, rng),
    makel: ausPaaren(MAKEL, sprache, rng)
  };
}

export function erzeugeOrt(zuschnitt: Zuschnitt, sprache: Sprache, rng: () => number): Ort {
  return {
    name: erzeugeName(sprache, rng),
    art: ausTabelle(ORT_ART, zuschnitt, sprache, rng),
    merkmal: ausTabelle(ORT_MERKMAL, zuschnitt, sprache, rng),
    zustand: ausTabelle(ORT_ZUSTAND, zuschnitt, sprache, rng),
    karte: ausPaaren(ORT_KARTE, sprache, rng)
  };
}

/**
 * Eine Verbindung zwischen zwei bestimmten Figuren.
 *
 * Die Namen werden hier eingesetzt und nicht erst beim Anzeigen. Wer eine
 * Figur danach umbenennt, sieht den alten Namen stehen — das ist der Preis
 * dafuer, dass jede Zeile fuer sich bearbeitbar ist, und derselbe Tausch wie
 * bei allen anderen Feldern.
 */
export function erzeugeVerbindung(
  a: number,
  b: number,
  figuren: readonly EntwurfsFigur[],
  zuschnitt: Zuschnitt,
  sprache: Sprache,
  rng: () => number
): Verbindung {
  const muster = waehle(passend(VERBINDUNGEN, zuschnitt), rng);
  const nameA = figuren[a]?.name ?? '?';
  const nameB = figuren[b]?.name ?? '?';
  return {
    a,
    b,
    muster: text(muster, sprache),
    hin: fuelle(text(muster.hin, sprache), nameA, nameB),
    zurueck: fuelle(text(muster.zurueck, sprache), nameA, nameB)
  };
}

/**
 * Wer mit wem.
 *
 * Eine Verbindung weniger als Figuren, entlang einer gemischten Reihe. So
 * haengt jede Figur an mindestens einer anderen und niemand steht allein —
 * bei rein zufaelligen Paaren gibt es regelmaessig eine Figur, die mit
 * niemandem zu tun hat, und die ist am Tisch nutzlos.
 */
export function erzeugeVerbindungen(
  figuren: readonly EntwurfsFigur[],
  zuschnitt: Zuschnitt,
  sprache: Sprache,
  rng: () => number
): Verbindung[] {
  if (figuren.length < 2) return [];
  const reihe = figuren.map((_, i) => i);
  for (let i = reihe.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [reihe[i], reihe[j]] = [reihe[j], reihe[i]];
  }
  const heraus: Verbindung[] = [];
  for (let i = 0; i + 1 < reihe.length; i += 1) {
    heraus.push(erzeugeVerbindung(reihe[i], reihe[i + 1], figuren, zuschnitt, sprache, rng));
  }
  return heraus;
}

/**
 * Was passiert, wenn niemand eingreift.
 *
 * Je Zeitmarke ein Schritt, und die Wucht steigt mit: das erste Drittel aus
 * Stufe 1, das letzte aus Stufe 3.
 */
export function erzeugeZeitstrahl(zuschnitt: Zuschnitt, sprache: Sprache, rng: () => number): Zeitpunkt[] {
  const marken = ZEITMARKEN[zuschnitt.umfang];
  const anzahl = Math.min(MENGEN[zuschnitt.umfang].schritte, marken.length);
  const moeglich = passend(SCHRITTE, zuschnitt) as readonly Schritt[];

  const genutzt = new Set<string>();
  const heraus: Zeitpunkt[] = [];
  for (let i = 0; i < anzahl; i += 1) {
    const anteil = anzahl === 1 ? 1 : i / (anzahl - 1);
    const stufe = anteil < 0.34 ? 1 : anteil < 0.75 ? 2 : 3;
    // Reicht eine Stufe nach dem Zuschnitt nicht, wird auf alle Schritte
    // dieser Stufe ausgewichen, und erst danach auf irgendeinen. Lieber ein
    // Schritt, der nicht ganz zur Region passt, als zweimal derselbe.
    const inStufe = moeglich.filter((s) => s.stufe === stufe && !genutzt.has(s.de));
    const alle = SCHRITTE.filter((s) => s.stufe === stufe && !genutzt.has(s.de));
    const quelle = inStufe.length > 0 ? inStufe : alle.length > 0 ? alle : SCHRITTE;
    const gewaehlt = waehle(quelle, rng);
    genutzt.add(gewaehlt.de);
    heraus.push({ marke: text(marken[i], sprache), was: text(gewaehlt, sprache) });
  }
  return heraus;
}

// --- Der ganze Entwurf ------------------------------------------------------

export const LEERER_ENTWURF: Entwurf = {
  aufhaenger: { ausloeser: '', betroffene: '', komplikation: '', frist: '' },
  fraktionen: [],
  figuren: [],
  orte: [],
  verbindungen: [],
  zeitstrahl: []
};

/**
 * Alles auf einmal.
 *
 * `festgehalten` nennt die Bausteine, die aus `vorher` uebernommen werden —
 * das Schloss je Baustein, wie im NPC Creator. Verbindungen haengen an den
 * Figuren: wer die Figuren neu wuerfelt und die Verbindungen festhaelt,
 * bekommt seine Verbindungen zurueck, soweit die Stellen noch besetzt sind.
 */
export function erzeugeEntwurf(
  zuschnitt: Zuschnitt,
  sprache: Sprache,
  rng: () => number,
  festgehalten: readonly Baustein[] = [],
  vorher: Entwurf | null = null
): Entwurf {
  const behalten = new Set(festgehalten);
  const halte = (baustein: Baustein) => behalten.has(baustein) && vorher !== null;
  const menge = MENGEN[zuschnitt.umfang];

  const aufhaenger = halte('aufhaenger')
    ? vorher!.aufhaenger
    : erzeugeAufhaenger(zuschnitt, sprache, rng);

  const fraktionen = halte('fraktionen')
    ? vorher!.fraktionen
    : Array.from({ length: menge.fraktionen }, () => erzeugeFraktion(zuschnitt, sprache, rng));

  const figuren = halte('figuren')
    ? vorher!.figuren
    : Array.from({ length: menge.figuren }, () => erzeugeFigur(zuschnitt, sprache, rng));

  const orte = halte('orte')
    ? vorher!.orte
    : waehleMehrere(
        Array.from({ length: Math.max(menge.orte * 2, 8) }, () => erzeugeOrt(zuschnitt, sprache, rng)),
        menge.orte,
        rng
      );

  const verbindungen = halte('verbindungen')
    ? vorher!.verbindungen.filter((v) => v.a < figuren.length && v.b < figuren.length)
    : erzeugeVerbindungen(figuren, zuschnitt, sprache, rng);

  const zeitstrahl = halte('zeitstrahl')
    ? vorher!.zeitstrahl
    : erzeugeZeitstrahl(zuschnitt, sprache, rng);

  return { aufhaenger, fraktionen, figuren, orte, verbindungen, zeitstrahl };
}

/**
 * Wie viele verschiedene Ergebnisse in den Tabellen stecken.
 *
 * Steht in der Oberflaeche unter dem Wuerfelknopf. Das ist keine Spielerei:
 * der Vorwurf an solche Werkzeuge ist, dass nach dem fuenften Wurf alles
 * gleich aussieht, und diese Zahl ist die Antwort darauf — nachrechenbar aus
 * den Tabellen selbst, nicht behauptet.
 */
export function moeglichkeiten(): {
  aufhaenger: number;
  fraktionen: number;
  figuren: number;
  orte: number;
  verbindungen: number;
} {
  return {
    aufhaenger: AUSLOESER.length * BETROFFENE.length * KOMPLIKATIONEN.length * (FRISTEN.length + 1),
    fraktionen:
      FRAKTION_FORM.length *
      FRAKTION_ZUSATZ.length *
      FRAKTION_ART.length *
      FRAKTION_ZIEL.length *
      FRAKTION_MITTEL.length *
      FRAKTION_SCHWAECHE.length,
    figuren:
      RUFNAMEN.length *
      NAME_ERSTE.length *
      NAME_ZWEITE.length *
      ROLLEN.length *
      TRIEBFEDERN.length *
      HEBEL.length *
      MAKEL.length,
    orte:
      NAME_ERSTE.length *
      NAME_ZWEITE.length *
      ORT_ART.length *
      ORT_MERKMAL.length *
      ORT_ZUSTAND.length *
      ORT_KARTE.length,
    verbindungen: VERBINDUNGEN.length
  };
}
