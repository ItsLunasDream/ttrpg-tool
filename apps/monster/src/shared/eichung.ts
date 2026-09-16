/**
 * Eichdaten: Monster, deren Grad feststeht.
 *
 * Eine Pruefung, die falsch rechnet, ist schlimmer als keine — sie gibt
 * Sicherheit, wo keine ist. Deshalb wird sie gegen Monster gerechnet, deren
 * CR nicht von ihr selbst stammt.
 *
 * WAS DIESE DATEN SIND, UND WAS NICHT
 * ===================================
 * Es sind die sieben allgemeinen Musterbloecke aus derselben CC-BY-Quelle
 * wie die Richtwerte (Namensnennung siehe richtwerte.ts). Sie sind vom
 * Verfasser *auf* die Richtwerte gebaut. Damit pruefen sie, ob die Rechnung
 * die Tabelle richtig anwendet — sie pruefen NICHT, wie sie sich bei
 * gewachsenen Monstern schlaegt, die um die Tabelle herumstreuen.
 *
 * Die eigentliche Eichung an den Monstern des SRD steht noch aus; sie
 * braucht deren Werte, und die waren beim Bauen von hier aus nicht
 * erreichbar. Bis dahin ist der Anspruch dieser Datei bescheiden und sagt
 * das auch: sie faengt Rechenfehler, nicht Denkfehler.
 */

import type { Werte } from './pruefung';

export interface Eichmonster {
  readonly name: string;
  readonly cr: string;
  readonly werte: Werte;
}

export const EICHMONSTER: readonly Eichmonster[] = [
  { name: 'Minion', cr: '1/8', werte: { tp: 9, rk: 11, schadenProRunde: 4, angriffsbonus: 3 } },
  { name: 'Soldier', cr: '1/2', werte: { tp: 22, rk: 12, schadenProRunde: 8, angriffsbonus: 4 } },
  { name: 'Brute', cr: '2', werte: { tp: 45, rk: 13, schadenProRunde: 18, angriffsbonus: 5 } },
  { name: 'Specialist', cr: '4', werte: { tp: 84, rk: 14, schadenProRunde: 28, angriffsbonus: 6 } },
  { name: 'Myrmidon', cr: '7', werte: { tp: 130, rk: 15, schadenProRunde: 51, angriffsbonus: 7 } },
  { name: 'Sentinel', cr: '11', werte: { tp: 165, rk: 17, schadenProRunde: 72, angriffsbonus: 9 } },
  { name: 'Champion', cr: '15', werte: { tp: 212, rk: 19, schadenProRunde: 96, angriffsbonus: 11 } }
];
