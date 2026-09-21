/**
 * Rueckgaengig und Wiederherstellen fuer den Tracker.
 *
 * **Warum ganze Staende und keine Einzelschritte.** Ein Kampf ist klein: ein
 * Dutzend Teilnehmer mit Zahlen daran. Jeden Schritt als eigene Umkehrung zu
 * beschreiben — „Teilnehmer wieder einfuegen, und zwar an Stelle vier, mit
 * seinen Zustaenden" — waere viel Arbeit und eine Fehlerquelle je Aktion. Ein
 * Abzug des ganzen Standes ist eine Zeile und kann nichts vergessen.
 *
 * **Warum das hier steht und nicht in der Oberflaeche.** Reine Funktionen
 * ohne React: so laesst sich am Modell pruefen, dass zwanzig Schritte
 * zurueck und zwanzig vor wieder denselben Kampf ergeben.
 */

export interface Verlauf<T> {
  /** Aeltere Staende, der juengste zuletzt. */
  readonly vergangenheit: readonly T[];
  /** Zurueckgenommene Staende, der zuletzt zurueckgenommene zuletzt. */
  readonly zukunft: readonly T[];
}

export function leererVerlauf<T>(): Verlauf<T> {
  return { vergangenheit: [], zukunft: [] };
}

/**
 * Wie weit zurueck.
 *
 * Fuenfzig Schritte decken einen ganzen Kampfabend ab; darueber hinaus sucht
 * ohnehin niemand mehr, und der Speicher bleibt beschaulich.
 */
export const VERLAUF_TIEFE = 50;

/**
 * Einen Stand merken, bevor er ersetzt wird.
 *
 * Die Zukunft wird dabei geleert: wer nach einem Zurueck etwas Neues tut,
 * hat den anderen Zweig verlassen. Alles andere fuehrte zu einem Verlauf, in
 * dem „vor" irgendwohin springt.
 */
export function merke<T>(verlauf: Verlauf<T>, vorher: T): Verlauf<T> {
  const voll = [...verlauf.vergangenheit, vorher];
  return {
    vergangenheit: voll.length > VERLAUF_TIEFE ? voll.slice(voll.length - VERLAUF_TIEFE) : voll,
    zukunft: []
  };
}

export function kannZurueck<T>(verlauf: Verlauf<T>): boolean {
  return verlauf.vergangenheit.length > 0;
}

export function kannVor<T>(verlauf: Verlauf<T>): boolean {
  return verlauf.zukunft.length > 0;
}

export interface Schritt<T> {
  readonly verlauf: Verlauf<T>;
  readonly stand: T;
}

/** Einen Schritt zurueck. `null`, wenn es nichts zurueckzunehmen gibt. */
export function zurueck<T>(verlauf: Verlauf<T>, jetzt: T): Schritt<T> | null {
  if (verlauf.vergangenheit.length === 0) return null;
  const stand = verlauf.vergangenheit[verlauf.vergangenheit.length - 1];
  return {
    stand,
    verlauf: {
      vergangenheit: verlauf.vergangenheit.slice(0, -1),
      zukunft: [...verlauf.zukunft, jetzt]
    }
  };
}

/** Einen Schritt vor. `null`, wenn nichts zurueckgenommen wurde. */
export function vor<T>(verlauf: Verlauf<T>, jetzt: T): Schritt<T> | null {
  if (verlauf.zukunft.length === 0) return null;
  const stand = verlauf.zukunft[verlauf.zukunft.length - 1];
  return {
    stand,
    verlauf: {
      vergangenheit: [...verlauf.vergangenheit, jetzt],
      zukunft: verlauf.zukunft.slice(0, -1)
    }
  };
}
