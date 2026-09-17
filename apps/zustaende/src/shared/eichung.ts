/**
 * Die Eichung: taugen die Punktwerte?
 *
 * In `wirkungen.ts` steht neben jeder Wirkung eine Zahl. Diese Zahlen sind
 * geschaetzt — es gibt kein Regelwerk, das sie vorgibt. Geschaetzte Werte
 * sind ein Anfang und keine Grundlage, und deshalb gehoert zu ihnen ein
 * Schritt, der sie pruefbar macht.
 *
 * DAS VERFAHREN: die bekannten Zustaende des Regelwerks werden aus denselben
 * Wirkungen zusammengesetzt und durchgerechnet. Kommt eine Rangfolge heraus,
 * die jeder am Tisch im Gefuehl hat — gelaehmt ist schlimmer als vergiftet,
 * bewusstlos ist das Schlimmste —, taugen die Werte. Kommt etwas anderes
 * heraus, taugen sie nicht, und das faellt hier auf statt am Tisch.
 *
 * WAS HIER NICHT STEHT, und das ist wichtig:
 *
 * Kein Text aus einem Regelwerk. Was unten steht, ist die mechanische
 * Zerlegung eines bekannten Zustands in unsere eigenen Bausteine — „gelaehmt
 * heisst: handlungsunfaehig, kann sich nicht bewegen, Angriffe dagegen haben
 * Vorteil". Das sind unsere Worte und unsere Wirkungskennungen, keine
 * Uebernahme fremder Formulierungen.
 *
 * ZUR EHRLICHKEIT: die Zerlegung stammt aus dem Gedaechtnis der
 * Regelmechanik, nicht aus einer nachgeschlagenen Quelle. Sie ist deshalb
 * ein Plausibilitaetsmassstab und kein Beleg. Wer das Werkzeug ernst nimmt,
 * sollte die Zerlegung einmal gegen das SRD gegenlesen, bevor die Zahlen als
 * gesichert gelten. Dasselbe gilt fuer die Eichung des Monster Creators, und
 * dort steht es ebenso dabei.
 */

import type { Stufe } from './gewicht';
import { gesamtgewicht } from './gewicht';

export interface Eichzustand {
  readonly id: string;
  readonly name: string;
  /** Die Stufen, in unseren eigenen Bausteinen. */
  readonly stufen: readonly Stufe[];
  /**
   * Wo er in der Rangfolge stehen sollte.
   *
   * Nicht die erwartete Punktzahl — die waere geraten. Nur die Ordnung, und
   * die hat jeder am Tisch im Gefuehl.
   *
   * Gleicher Rang heisst ausdruecklich „etwa gleich schwer". Wo sich zwei
   * Zustaende nicht klar ordnen lassen, wird hier nichts behauptet.
   */
  readonly rang: number;
}

export const EICHZUSTAENDE: readonly Eichzustand[] = [
  {
    id: 'vergiftet',
    name: 'Vergiftet',
    rang: 1,
    // Nachteil auf Angriffe und Faehigkeitswuerfe.
    stufen: [{ nummer: 1, wirkungen: ['nachteil-angriffe', 'nachteil-eine-fertigkeit'] }]
  },
  {
    id: 'taub',
    name: 'Taub',
    rang: 0,
    stufen: [{ nummer: 1, wirkungen: ['taub'] }]
  },
  {
    id: 'blind',
    name: 'Blind',
    rang: 2,
    // Sieht nichts, Angriffe im Nachteil, Angriffe dagegen im Vorteil.
    stufen: [{ nummer: 1, wirkungen: ['blind', 'nachteil-angriffe', 'angriffe-gegen-dich-vorteil'] }]
  },
  {
    /*
     * Derselbe Rang wie „blind", und das ist kein Versehen.
     *
     * Beide geben Nachteil auf eigene Angriffe und Vorteil fuer Angriffe
     * dagegen; der eine kann sich nicht bewegen, der andere sieht nichts.
     * Welcher schlimmer ist, haengt an der Lage — eine Rangfolge dazwischen
     * waere meine Meinung und nicht der Massstab, gegen den hier geeicht
     * wird. Der erste Anlauf hatte sie, und prompt fiel die Eichung ueber
     * eine Behauptung statt ueber eine Zahl.
     */
    id: 'festgehalten',
    name: 'Festgehalten',
    rang: 2,
    stufen: [
      { nummer: 1, wirkungen: ['festgehalten', 'nachteil-angriffe', 'angriffe-gegen-dich-vorteil'] }
    ]
  },
  {
    id: 'handlungsunfaehig',
    name: 'Handlungsunfähig',
    rang: 3,
    stufen: [{ nummer: 1, wirkungen: ['handlungsunfaehig', 'keine-reaktion'] }]
  },
  {
    id: 'gelaehmt',
    name: 'Gelähmt',
    rang: 4,
    // Handlungsunfaehig, bewegungslos, Angriffe dagegen im Vorteil.
    stufen: [
      {
        nummer: 1,
        wirkungen: ['gelaehmt', 'handlungsunfaehig', 'festgehalten', 'angriffe-gegen-dich-vorteil']
      }
    ]
  },
  {
    id: 'bewusstlos',
    name: 'Bewusstlos',
    rang: 5,
    stufen: [
      {
        nummer: 1,
        wirkungen: [
          'bewusstlos',
          'gelaehmt',
          'handlungsunfaehig',
          'festgehalten',
          'angriffe-gegen-dich-vorteil'
        ]
      }
    ]
  },
  {
    id: 'erschoepfung-1',
    name: 'Erschöpfung 1',
    rang: 0,
    stufen: [{ nummer: 1, wirkungen: ['nachteil-eine-fertigkeit'] }]
  },
  {
    id: 'erschoepfung-3',
    name: 'Erschöpfung 3',
    rang: 2,
    stufen: [
      { nummer: 1, wirkungen: ['nachteil-eine-fertigkeit'] },
      { nummer: 2, wirkungen: ['bewegung-halbiert'] },
      { nummer: 3, wirkungen: ['nachteil-angriffe'] }
    ]
  },
  {
    id: 'erschoepfung-5',
    name: 'Erschöpfung 5',
    rang: 3,
    stufen: [
      { nummer: 1, wirkungen: ['nachteil-eine-fertigkeit'] },
      { nummer: 2, wirkungen: ['bewegung-halbiert'] },
      { nummer: 3, wirkungen: ['nachteil-angriffe'] },
      { nummer: 4, wirkungen: ['hoechst-tp-gesenkt'] },
      { nummer: 5, wirkungen: ['bewegung-minus-fuenf', 'keine-reaktion'] }
    ]
  }
];

/** Das Gewicht eines Eichzustands. */
export function eichgewicht(zustand: Eichzustand): number {
  return gesamtgewicht(zustand.stufen);
}

/**
 * Der Vergleich, den die Oberflaeche zeigt.
 *
 * „Wiegt 14" sagt niemandem etwas. „Wiegt so viel wie fuenf Stufen
 * Erschoepfung" sagt jedem alles. Gesucht wird der Eichzustand mit dem
 * kleinsten Abstand.
 */
export function naechsterVergleich(gewicht: number): Eichzustand {
  return [...EICHZUSTAENDE].sort(
    (a, b) => Math.abs(eichgewicht(a) - gewicht) - Math.abs(eichgewicht(b) - gewicht)
  )[0];
}
