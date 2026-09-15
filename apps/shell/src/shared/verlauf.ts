/**
 * Der Verlauf der besuchten Stellen, wie im Browser.
 *
 * Er merkt sich, WO man war, nicht was man geaendert hat: zurueck macht
 * nichts rueckgaengig, und Strg+Z bewegt den Verlauf nicht.
 *
 * Ein Eintrag ist zunaechst nur ein Werkzeug. Spaeter soll er auch die
 * Stelle innerhalb des Werkzeugs tragen — deshalb steht hier schon ein Feld
 * dafuer, und die Gleichheit fragt beides ab.
 *
 * Plattformfrei: kein node:*, kein electron, keine Browser-Globals.
 */

export interface Stelle {
  /** Kennung des Werkzeugs, oder null fuer das Startmenue. */
  readonly app: string | null;
  /** Wo innerhalb des Werkzeugs. Noch ungenutzt. */
  readonly ort?: string;
}

/**
 * Wie viele Schritte aufgehoben werden.
 *
 * Fuenfzig, wie es die Browser halten. Gemerkt werden nur Kennungen, das
 * kostet nichts; eine groessere Zahl waere trotzdem nicht benutzbar — nach
 * zehn Schritten weiss niemand mehr, wo er landet.
 */
export const VERLAUF_TIEFE = 50;

export interface Verlauf {
  readonly stellen: readonly Stelle[];
  /** Stelle, auf der man gerade steht. -1, solange der Verlauf leer ist. */
  readonly jetzt: number;
}

export const LEERER_VERLAUF: Verlauf = { stellen: [], jetzt: -1 };

export function gleicheStelle(a: Stelle | undefined, b: Stelle): boolean {
  return a !== undefined && a.app === b.app && (a.ort ?? null) === (b.ort ?? null);
}

/**
 * Einen Schritt anhaengen.
 *
 * Wie im Browser: nach mehreren Schritten zurueck wirft ein neuer Schritt
 * den Vorwaerts-Ast weg. Dieselbe Stelle noch einmal ergibt keinen zweiten
 * Eintrag — wer eine Notiz zweimal anklickt, will nicht zweimal zurueck
 * druecken.
 */
export function besuche(verlauf: Verlauf, stelle: Stelle): Verlauf {
  if (gleicheStelle(verlauf.stellen[verlauf.jetzt], stelle)) return verlauf;

  const behalten = verlauf.stellen.slice(0, verlauf.jetzt + 1);
  const stellen = [...behalten, stelle].slice(-VERLAUF_TIEFE);
  return { stellen, jetzt: stellen.length - 1 };
}

export function kannZurueck(verlauf: Verlauf): boolean {
  return verlauf.jetzt > 0;
}

export function kannVorwaerts(verlauf: Verlauf): boolean {
  return verlauf.jetzt >= 0 && verlauf.jetzt < verlauf.stellen.length - 1;
}

/** Einen Schritt zurueck. Am Anfang passiert nichts, kein Rundlauf. */
export function zurueck(verlauf: Verlauf): Verlauf {
  return kannZurueck(verlauf) ? { ...verlauf, jetzt: verlauf.jetzt - 1 } : verlauf;
}

/** Einen Schritt vorwaerts. Am Ende passiert nichts. */
export function vorwaerts(verlauf: Verlauf): Verlauf {
  return kannVorwaerts(verlauf) ? { ...verlauf, jetzt: verlauf.jetzt + 1 } : verlauf;
}

/** Wo man gerade steht, oder null. */
export function aktuelleStelle(verlauf: Verlauf): Stelle | null {
  return verlauf.stellen[verlauf.jetzt] ?? null;
}
