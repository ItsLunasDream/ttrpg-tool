/**
 * Erfahrungspunkte, Budgets und der Uebungsbonus — die Zahlen, an denen
 * sich eine Begegnung messen laesst.
 *
 * WOHER DIE ZAHLEN KOMMEN
 * =======================
 * Aus dem SRD 5.2.1, Abschnitt „Gameplay Toolbox" (Budget) und
 * „Monsters" (Erfahrungspunkte, Uebungsbonus). Jede Zahl steht in beiden
 * Sprachfassungen des Dokuments und wurde gegen beide gelesen — das ist
 * die Pruefung, die der Zwischenschritt ueber ein PDF sonst nicht hat.
 *
 * Zwei Stellen, an denen die Textauslese aus dem PDF Leerzeichen in die
 * Zahlen geschoben hat („11, 50 0"), sind deshalb aufgefallen und hier
 * richtig eingetragen: HG 14 gibt 11.500 EP, und Stufe 17 hat bei hoher
 * Schwierigkeit 11.700 EP Budget.
 *
 * Plattformfrei: nur Daten und reine Funktionen (Regel 4).
 */
import type { Paar } from './namensnennung';

/** Die drei Schwierigkeiten, die das Regelwerk kennt. */
export const SCHWIERIGKEITEN = ['niedrig', 'mittel', 'hoch'] as const;
export type Schwierigkeit = (typeof SCHWIERIGKEITEN)[number];

export const SCHWIERIGKEIT_NAME: Record<Schwierigkeit, Paar> = {
  niedrig: { de: 'Niedrig', en: 'Low' },
  mittel: { de: 'Mittel', en: 'Moderate' },
  hoch: { de: 'Hoch', en: 'High' }
};

/**
 * Was die drei Stufen bedeuten, sinngemaess nach dem Regelwerk.
 *
 * Bewusst KEINE woertliche Uebernahme: die Beschreibungen im Dokument
 * sind mehrere Saetze lang und gehoeren ins Nachschlagewerk, nicht in
 * eine Marke neben einer Zahl. Hier steht die Kurzform, die an einer
 * Begegnung Platz hat.
 */
export const SCHWIERIGKEIT_KURZ: Record<Schwierigkeit, Paar> = {
  niedrig: {
    de: 'Ein, zwei brenzlige Momente, aber kein Toter.',
    en: 'One or two scary moments, but no casualties.'
  },
  mittel: {
    de: 'Ohne Heilung kann es übel ausgehen; ein Tod ist möglich.',
    en: 'Without healing this can go badly; a death is possible.'
  },
  hoch: {
    de: 'Kann tödlich enden. Braucht Taktik und etwas Glück.',
    en: 'Can be lethal. Takes tactics and some luck.'
  }
};

/**
 * Erfahrungspunkte nach Herausforderungsgrad.
 *
 * Der Grad steht als Text, weil „1/4" einer ist. Grad 0 gibt laut
 * Dokument „0 oder 10" — hier steht 10, und der Sonderfall daneben:
 * eine Null waere in jeder Rechnung unsichtbar, und ein Kaefer, der
 * nichts zaehlt, ist als Begegnung auch nichts.
 */
export const EP_NACH_GRAD: Readonly<Record<string, number>> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000
};

/**
 * Grad 0 gibt laut Dokument „0 oder 10" Erfahrungspunkte.
 *
 * Welche der beiden Zahlen gilt, entscheidet der Tisch. Fuer eine
 * Begegnungsrechnung ist 10 die brauchbarere: mit 0 zaehlten zehn
 * Ratten so viel wie keine.
 */
export const GRAD_NULL_ALTERNATIVE = 0;

/**
 * EP-Budget pro Charakter, nach Gruppenstufe und gewuenschter
 * Schwierigkeit. Mit der Zahl der Figuren multiplizieren.
 */
export const BUDGET_JE_CHARAKTER: Readonly<
  Record<number, Readonly<Record<Schwierigkeit, number>>>
> = {
  1: { niedrig: 50, mittel: 75, hoch: 100 },
  2: { niedrig: 100, mittel: 150, hoch: 200 },
  3: { niedrig: 150, mittel: 225, hoch: 400 },
  4: { niedrig: 250, mittel: 375, hoch: 500 },
  5: { niedrig: 500, mittel: 750, hoch: 1100 },
  6: { niedrig: 600, mittel: 1000, hoch: 1400 },
  7: { niedrig: 750, mittel: 1300, hoch: 1700 },
  8: { niedrig: 1000, mittel: 1700, hoch: 2100 },
  9: { niedrig: 1300, mittel: 2000, hoch: 2600 },
  10: { niedrig: 1600, mittel: 2300, hoch: 3100 },
  11: { niedrig: 1900, mittel: 2900, hoch: 4100 },
  12: { niedrig: 2200, mittel: 3700, hoch: 4700 },
  13: { niedrig: 2600, mittel: 4200, hoch: 5400 },
  14: { niedrig: 2900, mittel: 4900, hoch: 6200 },
  15: { niedrig: 3300, mittel: 5400, hoch: 7800 },
  16: { niedrig: 3800, mittel: 6100, hoch: 9800 },
  17: { niedrig: 4500, mittel: 7200, hoch: 11700 },
  18: { niedrig: 5000, mittel: 8700, hoch: 14200 },
  19: { niedrig: 5500, mittel: 10700, hoch: 17200 },
  20: { niedrig: 6400, mittel: 13200, hoch: 22000 }
};

/** Uebungsbonus nach Herausforderungsgrad. Spannen, wie im Dokument. */
export const UEBUNGSBONUS: readonly {
  readonly von: number;
  readonly bis: number;
  readonly bonus: number;
}[] = [
  { von: 0, bis: 4, bonus: 2 },
  { von: 5, bis: 8, bonus: 3 },
  { von: 9, bis: 12, bonus: 4 },
  { von: 13, bis: 16, bonus: 5 },
  { von: 17, bis: 20, bonus: 6 },
  { von: 21, bis: 24, bonus: 7 },
  { von: 25, bis: 28, bonus: 8 },
  { von: 29, bis: 30, bonus: 9 }
];

/** Der Grad als Zahl: „1/4" ist ein Viertel. `null`, wenn unlesbar. */
export function gradAlsZahl(grad: string): number | null {
  const roh = grad.trim();
  if (!roh) return null;
  const bruch = /^(\d+)\s*\/\s*(\d+)$/.exec(roh);
  if (bruch) {
    const nenner = Number(bruch[2]);
    return nenner === 0 ? null : Number(bruch[1]) / nenner;
  }
  const zahl = Number(roh);
  return Number.isFinite(zahl) && zahl >= 0 ? zahl : null;
}

/**
 * Die Erfahrungspunkte eines Grades.
 *
 * `null` fuer einen Grad, den die Tabelle nicht kennt — und nicht null
 * Punkte. Ein selbstgebautes Monster mit Grad 35 gibt es; zu tun, als
 * waere es nichts wert, waere die schlechtere Antwort.
 */
export function epFuerGrad(grad: string): number | null {
  const schluessel = grad.trim();
  if (schluessel in EP_NACH_GRAD) return EP_NACH_GRAD[schluessel];
  // „1.0" oder „01" meinen denselben Grad wie „1".
  const zahl = gradAlsZahl(schluessel);
  if (zahl === null) return null;
  if (Number.isInteger(zahl) && String(zahl) in EP_NACH_GRAD) {
    return EP_NACH_GRAD[String(zahl)];
  }
  return null;
}

export function uebungsbonus(grad: string): number | null {
  const zahl = gradAlsZahl(grad);
  if (zahl === null) return null;
  const spanne = UEBUNGSBONUS.find((s) => zahl >= s.von && zahl <= s.bis);
  return spanne ? spanne.bonus : null;
}

/** Eine Zeile der Gruppe: so viele Figuren auf dieser Stufe. */
export interface Gruppenzeile {
  readonly anzahl: number;
  readonly stufe: number;
}

/**
 * Das Budget einer Gruppe fuer eine Schwierigkeit.
 *
 * Das Regelwerk rechnet mit EINER Gruppenstufe mal der Zahl der
 * Figuren. Bei gemischten Stufen steht dort nichts — hier wird je Zeile
 * gerechnet und summiert. Das ist eine Auslegung und keine Regel, aber
 * die naheliegende: eine Figur auf Stufe 6 bringt mehr mit als eine auf
 * Stufe 4, und genau das bildet die Summe ab.
 *
 * `null`, wenn die Gruppe leer ist oder eine Stufe ausserhalb von 1 bis
 * 20 liegt. Die Tabelle endet dort, und weiterzurechnen hiesse, sie zu
 * erfinden.
 */
export function budget(
  gruppe: readonly Gruppenzeile[],
  schwierigkeit: Schwierigkeit
): number | null {
  const zeilen = gruppe.filter((zeile) => zeile.anzahl > 0);
  if (zeilen.length === 0) return null;
  let summe = 0;
  for (const zeile of zeilen) {
    const je = BUDGET_JE_CHARAKTER[zeile.stufe];
    if (!je) return null;
    summe += je[schwierigkeit] * zeile.anzahl;
  }
  return summe;
}

/** Wie eine Begegnung im Verhaeltnis zu den drei Budgets steht. */
export type Einordnung = Schwierigkeit | 'darunter' | 'darueber';

/**
 * Ab wann eine Begegnung nicht mehr „hoch" heisst, sondern „darueber".
 *
 * ACHTUNG: DIESE ZAHL STEHT NICHT IM REGELWERK. Das Dokument kennt drei
 * Budgets und hoert bei „hoch" auf; was darueber liegt, laesst es offen.
 * Eine Begegnung mit dem Dreifachen des hohen Budgets aber weiter
 * „hoch" zu nennen waere eine Untertreibung, die am Tisch teuer wird —
 * also eine eigene Antwort, und diese Grenze ist gesetzt und nicht
 * abgeleitet. Wer sie anders will, aendert sie hier.
 */
export const DARUEBER_AB = 1.5;

/**
 * Die Einordnung einer Begegnung.
 *
 * Gelesen wird von unten: was das Budget fuer „niedrig" nicht erreicht,
 * ist darunter; was weit ueber dem fuer „hoch" liegt, ist darueber.
 */
export function einordnung(
  epSumme: number,
  gruppe: readonly Gruppenzeile[]
): Einordnung | null {
  const niedrig = budget(gruppe, 'niedrig');
  const mittel = budget(gruppe, 'mittel');
  const hoch = budget(gruppe, 'hoch');
  if (niedrig === null || mittel === null || hoch === null) return null;
  if (epSumme < niedrig) return 'darunter';
  if (epSumme < mittel) return 'niedrig';
  if (epSumme < hoch) return 'mittel';
  if (epSumme <= hoch * DARUEBER_AB) return 'hoch';
  return 'darueber';
}

export const EINORDNUNG_NAME: Record<Einordnung, Paar> = {
  darunter: { de: 'Unter niedrig', en: 'Below low' },
  niedrig: SCHWIERIGKEIT_NAME.niedrig,
  mittel: SCHWIERIGKEIT_NAME.mittel,
  hoch: SCHWIERIGKEIT_NAME.hoch,
  darueber: { de: 'Über hoch', en: 'Above high' }
};
