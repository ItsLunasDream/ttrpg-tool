/** Ein Eintrag im Verlauf. */
import type { Auswahl, Wurf } from '../shared/pool';

export interface Eintrag {
  readonly id: number;
  readonly wurf: Wurf;
  /** Die Auswahl, aus der er entstand — zum Zurueckholen. */
  readonly auswahl: Auswahl;
  readonly modifikator: number;
  readonly eigeneSeiten: number;
}

/** Wie viele Wuerfe der Verlauf haelt. Danach faellt der aelteste heraus. */
export const VERLAUF_LAENGE = 40;
