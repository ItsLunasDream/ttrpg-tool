/**
 * Die dreizehn Schadensarten von D&D 5e.
 *
 * Bisher standen sie als freie Zweisprach-Paare in den Themen. Das reichte,
 * solange nur eine Zeile im Statblock daran hing. Jetzt haengen drei Dinge
 * daran — der Angriff, die Resistenzen und die Immunitaeten —, und die
 * muessen dieselbe Sprache sprechen: eine Resistenz gegen „Feuer" und ein
 * Angriff mit „fire" sind sonst zwei Dinge, die zufaellig gleich aussehen.
 *
 * Deshalb: eine Kennung je Art, und ueberall wird die Kennung benutzt.
 */

import type { Paar, Sprache } from './tabellen';
import { text } from './tabellen';

export type SchadensartId =
  | 'hieb'
  | 'stich'
  | 'wucht'
  | 'feuer'
  | 'kaelte'
  | 'blitz'
  | 'donner'
  | 'saeure'
  | 'gift'
  | 'nekrotisch'
  | 'strahlend'
  | 'psychisch'
  | 'energie';

export interface Schadensart {
  readonly id: SchadensartId;
  readonly name: Paar;
  /**
   * Koerperlich, also Hieb, Stich und Wucht.
   *
   * Der Unterschied ist nicht kosmetisch: Resistenz gegen koerperlichen
   * Schaden trifft fast jede Gruppe, Resistenz gegen Strahlen nur die mit
   * einem Kleriker. Die Pruefung gewichtet das deshalb verschieden.
   */
  readonly koerperlich: boolean;
}

export const SCHADENSARTEN: readonly Schadensart[] = [
  { id: 'hieb', name: { de: 'Hieb', en: 'slashing' }, koerperlich: true },
  { id: 'stich', name: { de: 'Stich', en: 'piercing' }, koerperlich: true },
  { id: 'wucht', name: { de: 'Wucht', en: 'bludgeoning' }, koerperlich: true },
  { id: 'feuer', name: { de: 'Feuer', en: 'fire' }, koerperlich: false },
  { id: 'kaelte', name: { de: 'Kälte', en: 'cold' }, koerperlich: false },
  { id: 'blitz', name: { de: 'Blitz', en: 'lightning' }, koerperlich: false },
  { id: 'donner', name: { de: 'Donner', en: 'thunder' }, koerperlich: false },
  { id: 'saeure', name: { de: 'Säure', en: 'acid' }, koerperlich: false },
  { id: 'gift', name: { de: 'Gift', en: 'poison' }, koerperlich: false },
  { id: 'nekrotisch', name: { de: 'nekrotisch', en: 'necrotic' }, koerperlich: false },
  { id: 'strahlend', name: { de: 'strahlend', en: 'radiant' }, koerperlich: false },
  { id: 'psychisch', name: { de: 'psychisch', en: 'psychic' }, koerperlich: false },
  { id: 'energie', name: { de: 'Energie', en: 'force' }, koerperlich: false }
];

export function schadensart(id: string): Schadensart | undefined {
  return SCHADENSARTEN.find((art) => art.id === id);
}

/** Der Name einer Schadensart, mit der Kennung als Rueckfall. */
export function schadensartName(id: string, sprache: Sprache): string {
  const gefunden = schadensart(id);
  return gefunden ? text(gefunden.name, sprache) : id;
}
