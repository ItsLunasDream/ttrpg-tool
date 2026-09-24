/**
 * Die Form, in der eine Begegnung von einem Werkzeug ins andere wandert.
 *
 * WARUM DAS HIER STEHT UND NICHT IN EINER DER BEIDEN ANWENDUNGEN
 * =============================================================
 * Der Encounter Creator stellt eine Begegnung zusammen, der Initiative
 * Tracker spielt sie. Die beiden kennen einander nicht — Anwendungen
 * haengen in dieser Sammlung nicht voneinander ab. Was sie brauchen, ist
 * eine gemeinsame Form, und die gehoert an eine dritte Stelle.
 *
 * Diese Form ist bewusst duenn. Sie traegt keine Teilnehmer des Trackers
 * und keine Gegner des Encounter Creators, sondern nur das, was beide
 * Seiten ohne Kenntnis der anderen verstehen: Namen, Zahlen, Saetze. Der
 * Tracker baut daraus seine eigenen Teilnehmer, mit seinen eigenen
 * Regeln. Haette der Encounter Creator sie fertig gebaut, muesste er das
 * Datenmodell des Trackers kennen — genau das, was hier nicht sein soll.
 *
 * Zurueck wandert nichts. Ein Kampf ist Sitzungszustand, keine Vorlage;
 * was am Tisch passiert, gehoert nicht in die gespeicherte Begegnung.
 */

/** Ein Gegner, so oft, wie er vorkommt. */
export interface UebergabeGegner {
  readonly name: string;
  /** Mindestens 1. Groesser heisst: eine Gruppe, im Tracker mit Marken. */
  readonly anzahl: number;
  readonly tp: number;
  readonly rk: number;
  /**
   * Der Zuschlag auf den Initiativewurf.
   *
   * Kommt aus der Geschicklichkeit des Monsters. Steht hier als fertige
   * Zahl, damit der Tracker nicht Attribute eines anderen Werkzeugs
   * auslegen muss.
   */
  readonly iniMod: number;
  /**
   * Der Statblock als Markdown, damit der Tracker ihn per Klick zeigen kann.
   * Fehlt er (altes Werkzeug, geloeschtes Monster), gibt es keinen Knopf.
   */
  readonly statblock?: string;
}

/**
 * Eine Regel der Umgebung, die am Tisch wirkt.
 *
 * Die andere Sorte — was man sieht — wandert als `beschreibung` mit. Sie
 * ist zum Vorlesen da und wird im Tracker keine Zeile in der Reihenfolge.
 */
export interface UebergabeRegel {
  readonly text: string;
  /** Die Zahl der Regel, wenn sie eine hat. */
  readonly wert: number | null;
}

export interface UebergabeUmgebung {
  readonly name: string;
  /** Was man sieht, als Saetze. Zum Vorlesen. */
  readonly beschreibung: readonly string[];
  /** Was wirkt. Wird im Tracker zu Terrain-Eintraegen. */
  readonly regeln: readonly UebergabeRegel[];
}

/** Eine Begegnung auf dem Weg in den Tracker. */
export interface Uebergabe {
  readonly name: string;
  /**
   * Die Kennung der gespeicherten Begegnung im Encounter Creator.
   *
   * Nur ein Verweis zurueck, damit ein zweiter Durchlauf nicht bei null
   * anfaengt. Der Tracker schreibt darueber nichts zurueck.
   */
  readonly quelle: string;
  readonly gegner: readonly UebergabeGegner[];
  readonly umgebung: UebergabeUmgebung | null;
}

/**
 * Die Marken einer Gruppe: „1\", „2\", „3\" — oder gar keine.
 *
 * Ein einzelnes Wesen bekommt keine Marke. „Wolf 1\", wo es nur einen Wolf
 * gibt, liest sich wie ein Versehen, und am Tisch sagt niemand die Eins
 * mit.
 */
export function marken(anzahl: number): readonly string[] {
  const wieviele = Math.max(1, Math.floor(anzahl));
  if (wieviele === 1) return [''];
  return Array.from({ length: wieviele }, (_, i) => String(i + 1));
}

/**
 * Der Zuschlag auf den Initiativewurf aus einem Attributwert.
 *
 * Die uebliche Rechnung: 10 und 11 geben null, je zwei Punkte darueber
 * oder darunter einen mehr oder weniger. Steht hier, weil der Encounter
 * Creator sie braucht, um `iniMod` zu fuellen, und sie sonst in zwei
 * Werkzeugen stuende.
 */
export function modifikator(attributwert: number): number {
  return Math.floor((attributwert - 10) / 2);
}

/** Wie viele Wesen insgesamt in den Tracker wandern. */
export function gesamtzahl(uebergabe: Uebergabe): number {
  return uebergabe.gegner.reduce((summe, g) => summe + Math.max(1, Math.floor(g.anzahl)), 0);
}
