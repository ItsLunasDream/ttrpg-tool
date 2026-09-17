/**
 * Die Wirkungen: was ein Zustand auf einer Stufe TUT.
 *
 * Das ist die Bauteilliste des ganzen Werkzeugs. Eine Stufe ist keine
 * Erfindung, sondern eine Wirkung aus dieser Liste — deshalb kommen die
 * Tabellen ohne KI aus und deshalb laesst sich ein Zustand ueberhaupt
 * wiegen.
 *
 * ZWEI DINGE, die jede Zeile hier traegt:
 *
 *   `schwere`  in welcher Stufe sie vorkommen darf. Aufsteigend, damit ein
 *              Zustand auf Stufe 4 nicht harmloser ist als auf Stufe 2.
 *   `punkte`   wie schwer sie wiegt, wenn sie anliegt.
 *
 * Zu den Punkten steht das Noetige in `gewicht.ts`: sie messen NICHT, ob
 * ein Zustand fuer eine Kampagne zu hart ist. Das haengt daran, wie oft man
 * ihn bekommt, und das weiss nur der Tisch.
 *
 * Plattformfrei, wie alles unter `shared`.
 */

import type { Paar } from './tabellen';

/** Wie schwer eine Wirkung ist. Die Reihenfolge ist die Rangfolge. */
export const SCHWEREN = ['leicht', 'mittel', 'schwer', 'toedlich'] as const;
export type Schwere = (typeof SCHWEREN)[number];

/** Wohin eine Wirkung zielt. Zwei Wirkungen derselben Spur greifen dasselbe an. */
export type Spur =
  | 'sinne'
  | 'bewegung'
  | 'angriff'
  | 'verteidigung'
  | 'handlung'
  | 'geist'
  | 'koerper'
  | 'schaden';

/** Buff oder Debuff. Ein Segen wirkt in die andere Richtung. */
export type Richtung = 'debuff' | 'buff' | 'schaden';

export interface Wirkung {
  readonly id: string;
  readonly text: Paar;
  readonly schwere: Schwere;
  readonly spur: Spur;
  readonly richtung: Richtung;
  /**
   * Das Gewicht dieser Wirkung.
   *
   * Eine eigene Einschaetzung, keine Zahl aus einem Regelwerk — dort gibt es
   * sie nicht. Geprueft wird sie ueber die Eichung: wenn „gelaehmt" damit
   * schwerer wiegt als „vergiftet", taugt die Rangfolge; wenn nicht, taugen
   * die Zahlen nicht. Siehe `eichung.ts`.
   *
   * Ein Buff hat einen negativen Wert: er macht den Zustand leichter.
   */
  readonly punkte: number;
  /** Zu welchen Themen sie besonders passt. Leer heisst: zu allen. */
  readonly themen?: readonly string[];
}

export const WIRKUNGEN: readonly Wirkung[] = [
  /* ---------- leicht ---------- */
  { id: 'nachteil-wahrnehmung', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1,
    text: { de: 'Nachteil auf Wahrnehmung', en: 'Disadvantage on Perception checks' } },
  { id: 'nachteil-eine-fertigkeit', schwere: 'leicht', spur: 'geist', richtung: 'debuff', punkte: 1,
    text: { de: 'Nachteil auf eine Fertigkeit deiner Wahl', en: 'Disadvantage on one skill of your choice' } },
  { id: 'bewegung-minus-fuenf', schwere: 'leicht', spur: 'bewegung', richtung: 'debuff', punkte: 1,
    text: { de: 'Bewegungsrate um 5 Fuß gesenkt', en: 'Speed reduced by 5 feet' } },
  { id: 'lautlos-unmoeglich', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1,
    text: { de: 'Du kannst dich nicht heimlich bewegen', en: 'You cannot move stealthily' } },
  { id: 'minus-eins-rettung', schwere: 'leicht', spur: 'verteidigung', richtung: 'debuff', punkte: 1,
    text: { de: '−1 auf Rettungswürfe', en: '−1 to saving throws' } },
  { id: 'nachteil-konzentration', schwere: 'leicht', spur: 'geist', richtung: 'debuff', punkte: 1,
    text: { de: 'Nachteil auf Würfe, um Konzentration zu halten', en: 'Disadvantage on checks to maintain concentration' } },
  { id: 'kein-langer-blick', schwere: 'leicht', spur: 'sinne', richtung: 'debuff', punkte: 1,
    text: { de: 'Du siehst weiter als 30 Fuß nur verschwommen', en: 'Everything beyond 30 feet is blurred' } },
  { id: 'unruhiger-schlaf', schwere: 'leicht', spur: 'koerper', richtung: 'debuff', punkte: 1,
    text: { de: 'Eine Rast erholt dich nur halb', en: 'A rest restores only half as much' } },

  /* ---------- mittel ---------- */
  { id: 'bewegung-halbiert', schwere: 'mittel', spur: 'bewegung', richtung: 'debuff', punkte: 2,
    text: { de: 'Bewegungsrate halbiert', en: 'Speed halved' } },
  { id: 'nachteil-rettungen', schwere: 'mittel', spur: 'verteidigung', richtung: 'debuff', punkte: 2,
    text: { de: 'Nachteil auf Rettungswürfe', en: 'Disadvantage on saving throws' } },
  { id: 'keine-reaktion', schwere: 'mittel', spur: 'handlung', richtung: 'debuff', punkte: 2,
    text: { de: 'Du kannst keine Reaktion nutzen', en: 'You cannot take reactions' } },
  { id: 'nachteil-geschick', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 2,
    text: { de: 'Nachteil auf Geschicklichkeitsproben', en: 'Disadvantage on Dexterity checks' } },
  { id: 'nachteil-staerke', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 2,
    text: { de: 'Nachteil auf Stärkeproben', en: 'Disadvantage on Strength checks' } },
  { id: 'kein-vorteil', schwere: 'mittel', spur: 'angriff', richtung: 'debuff', punkte: 2,
    text: { de: 'Du kannst keinen Vorteil auf Angriffe erhalten', en: 'You cannot gain advantage on attacks' } },
  { id: 'hoechst-tp-gesenkt', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 3,
    text: { de: 'Deine Trefferpunkte-Höchstgrenze sinkt', en: 'Your hit point maximum drops' } },
  { id: 'angriffe-gegen-dich-vorteil', schwere: 'mittel', spur: 'verteidigung', richtung: 'debuff', punkte: 3,
    text: { de: 'Angriffe gegen dich haben Vorteil', en: 'Attacks against you have advantage' } },
  { id: 'keine-heilung', schwere: 'mittel', spur: 'koerper', richtung: 'debuff', punkte: 3,
    text: { de: 'Heilung wirkt bei dir nur halb', en: 'Healing restores only half as much to you' } },

  /* ---------- schwer ---------- */
  { id: 'nachteil-angriffe', schwere: 'schwer', spur: 'angriff', richtung: 'debuff', punkte: 3,
    text: { de: 'Nachteil auf alle Angriffswürfe', en: 'Disadvantage on all attack rolls' } },
  { id: 'keine-bonusaktion', schwere: 'schwer', spur: 'handlung', richtung: 'debuff', punkte: 3,
    text: { de: 'Du kannst keine Bonusaktion nutzen', en: 'You cannot take bonus actions' } },
  { id: 'blind', schwere: 'schwer', spur: 'sinne', richtung: 'debuff', punkte: 4,
    text: { de: 'Du bist blind', en: 'You are blinded' } },
  { id: 'taub', schwere: 'schwer', spur: 'sinne', richtung: 'debuff', punkte: 3,
    text: { de: 'Du bist taub', en: 'You are deafened' } },
  { id: 'festgehalten', schwere: 'schwer', spur: 'bewegung', richtung: 'debuff', punkte: 4,
    text: { de: 'Du bist festgehalten', en: 'You are restrained' } },
  { id: 'keine-zauber', schwere: 'schwer', spur: 'geist', richtung: 'debuff', punkte: 4,
    text: { de: 'Du kannst nicht zaubern', en: 'You cannot cast spells' } },
  { id: 'verwirrt', schwere: 'schwer', spur: 'geist', richtung: 'debuff', punkte: 4,
    text: { de: 'Du greifst zu Beginn deines Zuges das nächste Wesen an', en: 'At the start of your turn you attack the nearest creature' } },
  { id: 'erschoepfung', schwere: 'schwer', spur: 'koerper', richtung: 'debuff', punkte: 4,
    text: { de: 'Eine Stufe Erschöpfung dazu', en: 'One level of exhaustion' } },

  /* ---------- toedlich ---------- */
  /*
   * Neun, nicht sechs.
   *
   * Die Eichung hat das aufgedeckt: mit sechs wog „handlungsunfaehig"
   * weniger als „blind", und das ist falsch herum. Wer blind ist, kaempft
   * schlecht; wer handlungsunfaehig ist, kaempft gar nicht. Eine ganze Runde
   * zu verlieren wiegt schwerer als jeder Nachteil auf einen Wurf.
   */
  { id: 'handlungsunfaehig', schwere: 'toedlich', spur: 'handlung', richtung: 'debuff', punkte: 9,
    text: { de: 'Du bist handlungsunfähig', en: 'You are incapacitated' } },
  { id: 'gelaehmt', schwere: 'toedlich', spur: 'handlung', richtung: 'debuff', punkte: 8,
    text: { de: 'Du bist gelähmt', en: 'You are paralysed' } },
  { id: 'bewusstlos', schwere: 'toedlich', spur: 'handlung', richtung: 'debuff', punkte: 10,
    text: { de: 'Du bist bewusstlos', en: 'You are unconscious' } },
  { id: 'sterbend', schwere: 'toedlich', spur: 'koerper', richtung: 'debuff', punkte: 10,
    text: { de: 'Du fällst auf 0 Trefferpunkte', en: 'You drop to 0 hit points' } },
  { id: 'tod-nach-frist', schwere: 'toedlich', spur: 'koerper', richtung: 'debuff', punkte: 12,
    text: { de: 'Ohne Hilfe stirbst du nach der nächsten Frist', en: 'Without help you die at the end of the next interval' } },

  /* ---------- Schaden ueber Zeit ---------- */
  { id: 'schaden-klein', schwere: 'leicht', spur: 'schaden', richtung: 'schaden', punkte: 1,
    text: { de: 'Du nimmst je Frist wenig Schaden', en: 'You take a little damage each interval' } },
  { id: 'schaden-mittel', schwere: 'mittel', spur: 'schaden', richtung: 'schaden', punkte: 2,
    text: { de: 'Du nimmst je Frist spürbar Schaden', en: 'You take noticeable damage each interval' } },
  { id: 'schaden-gross', schwere: 'schwer', spur: 'schaden', richtung: 'schaden', punkte: 4,
    text: { de: 'Du nimmst je Frist viel Schaden', en: 'You take heavy damage each interval' } },

  /* ---------- Buffs: die Gegenrichtung ---------- */
  { id: 'vorteil-eine-sache', schwere: 'leicht', spur: 'geist', richtung: 'buff', punkte: -1,
    text: { de: 'Vorteil auf eine Sache deiner Wahl', en: 'Advantage on one thing of your choice' } },
  { id: 'bewegung-plus-zehn', schwere: 'leicht', spur: 'bewegung', richtung: 'buff', punkte: -1,
    text: { de: 'Bewegungsrate um 10 Fuß erhöht', en: 'Speed increased by 10 feet' } },
  { id: 'widerstand-eine-art', schwere: 'mittel', spur: 'verteidigung', richtung: 'buff', punkte: -2,
    text: { de: 'Resistenz gegen eine Schadensart', en: 'Resistance to one damage type' } },
  { id: 'plus-eins-angriffe', schwere: 'mittel', spur: 'angriff', richtung: 'buff', punkte: -2,
    text: { de: '+1 auf Angriffswürfe', en: '+1 to attack rolls' } },
  { id: 'vorteil-rettungen', schwere: 'schwer', spur: 'verteidigung', richtung: 'buff', punkte: -3,
    text: { de: 'Vorteil auf Rettungswürfe', en: 'Advantage on saving throws' } },
  { id: 'zusatzangriff', schwere: 'schwer', spur: 'angriff', richtung: 'buff', punkte: -4,
    text: { de: 'Ein zusätzlicher Angriff, wenn du angreifst', en: 'One extra attack when you take the Attack action' } },
  { id: 'nicht-unter-null', schwere: 'toedlich', spur: 'koerper', richtung: 'buff', punkte: -5,
    text: { de: 'Du fällst nicht unter 1 Trefferpunkt', en: 'You do not drop below 1 hit point' } }
];

export function wirkung(id: string): Wirkung | undefined {
  return WIRKUNGEN.find((w) => w.id === id);
}

/** Wie schwer eine Schwere ist, als Zahl. Zum Sortieren und Vergleichen. */
export function schwereWert(schwere: Schwere): number {
  return SCHWEREN.indexOf(schwere);
}

/**
 * Die Wirkungen einer Schwere und Richtung.
 *
 * `richtung` ist hier kein einzelner Wert, sondern eine Liste: „gemischt"
 * zieht aus Buffs UND Debuffs, und genau das ist der Fall, den Tabellen gut
 * koennen und der sich von Hand ungern aufschreibt.
 */
export function wirkungenFuer(
  schwere: Schwere,
  richtungen: readonly Richtung[],
  spuren?: readonly Spur[]
): Wirkung[] {
  return WIRKUNGEN.filter(
    (w) =>
      w.schwere === schwere &&
      richtungen.includes(w.richtung) &&
      (!spuren || spuren.length === 0 || spuren.includes(w.spur))
  );
}
