/**
 * Datentypen des Initiative Trackers.
 *
 * Systemneutral: die Regeln stecken nicht hier drin. Ein Eintrag hat einen
 * Initiativewert, Trefferpunkte und Zustaende — was diese Zahlen bedeuten und
 * wie man sie ermittelt, entscheidet der Tisch. D&D-Bequemlichkeiten (Wurf
 * mit Modifikator) kommen als Zugabe obendrauf, nicht als Voraussetzung.
 */

/** Fassung des Dateiformats (Konvention 2). */
export const SCHEMA_VERSION = 1;

/**
 * Ein Mitglied einer Gruppe — oder der einzige „Koerper\" eines gewoehnlichen
 * Eintrags.
 *
 * Gruppen sind der Grund, warum Trefferpunkte nicht direkt am Eintrag haengen:
 * sechs Goblins wuerfeln *eine* Initiative, haben aber sechs getrennte
 * Trefferpunktesaetze. Ein Eintrag mit genau einem Mitglied ist der
 * Normalfall und sieht in der Oberflaeche aus wie eine einzelne Kreatur.
 */
export interface Koerper {
  readonly id: string;
  /** Zusatz zum Namen des Eintrags, etwa „1\", „2\" — leer beim Einzelwesen. */
  readonly marke: string;
  readonly hp: number;
  readonly hpMax: number;
  /** Zeitweilige Trefferpunkte. Werden vor den echten abgezogen. */
  readonly tempHp: number;
  /** Von Hand ausgetragen, ohne den Eintrag zu loeschen. */
  readonly raus: boolean;
}

/**
 * Ein Zustand mit Rundenzaehler.
 *
 * `rundenRest === null` heisst „laeuft, bis jemand ihn wegnimmt\" — nicht
 * jeder Zustand hat eine Dauer, und eine erfundene waere schlimmer als keine.
 */
export interface Zustand {
  readonly id: string;
  readonly name: string;
  readonly rundenRest: number | null;
}

export interface Teilnehmer {
  readonly id: string;
  readonly name: string;
  readonly initiative: number;
  /**
   * Entscheidet Gleichstaende. In D&D ist das die Geschicklichkeit; hier
   * heisst es neutral „Feinwert\", weil das Werkzeug kein System vorschreibt.
   */
  readonly feinwert: number;
  /** Spielerfiguren stehen im Kampf anders da: sie werden nicht ausgewuerfelt. */
  readonly istSpieler: boolean;
  readonly koerper: readonly Koerper[];
  readonly zustaende: readonly Zustand[];
  /** Dateiname im Bildordner des Trackers, oder null. */
  readonly bild: string | null;
  readonly notiz: string;
}

/** Der laufende Kampf. Sitzungszustand, kein Dokument. */
export interface Kampf {
  readonly schemaVersion: number;
  readonly begegnungId: string | null;
  readonly name: string;
  readonly teilnehmer: readonly Teilnehmer[];
  /** Index in der sortierten Reihenfolge, oder -1, wenn noch nicht begonnen. */
  readonly amZug: number;
  readonly runde: number;
  /** Ob der Kampf laeuft. Vorher lassen sich Werte in Ruhe eintragen. */
  readonly laeuft: boolean;
}

/** Eine gespeicherte Begegnung: Markdown mit YAML-Kopf (Konvention 1). */
export interface Begegnung {
  readonly schemaVersion: number;
  readonly id: string;
  readonly name: string;
  readonly teilnehmer: readonly Teilnehmer[];
  /** Der Rumpf des Dokuments: Taktik, Notizen, was der Tisch braucht. */
  readonly taktik: string;
}
