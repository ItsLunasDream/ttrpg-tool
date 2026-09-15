/**
 * Die Form eines Notiz-Pins.
 *
 * Ein Pin ist ein Tropfen: die Spitze sitzt auf dem Punkt, der Kopf steht
 * darueber. `x`/`y` einer Notiz ist die SPITZE — das ist die Stelle, die
 * gemeint ist, und der Kopf haengt nur daran.
 *
 * Diese Rechnung steht hier und nicht im Renderer, weil zwei Stellen sie
 * brauchen: gezeichnet wird der Tropfen, angeklickt wird er auch. Standen
 * sie getrennt, liefen sie auseinander — und genau das war ein Fehler: die
 * Trefferpruefung mass den Abstand zur Spitze, waehrend der Kopf gut zwei
 * Toleranzen darueber lag. Damit liess sich keine Notiz mehr anklicken, und
 * das Notiz-Werkzeug legte bei jedem Versuch eine neue an.
 *
 * Im Modell und nicht in der Engine, weil hier nur Zahlen stehen: kein Pixi,
 * kein React, pruefbar ohne Bild.
 */

import type { MapNote } from './types';

/**
 * Abstand Kopfmitte zur Spitze, in Kopfradien.
 *
 * 1.6 ist gezeichnet und nicht gerechnet: darunter sieht der Tropfen wie ein
 * Kreis mit Delle aus, darueber wie eine Nadel.
 */
export const TIP_DISTANCE = 1.6;

/** Die kleinste Gesamthoehe eines Pins in Weltmass. Sonst verschwindet er. */
const MIN_HOEHE = 8;

export interface NotenForm {
  /** Mittelpunkt des Kopfes. */
  readonly kopfX: number;
  readonly kopfY: number;
  /** Radius des Kopfes. */
  readonly r: number;
  /** Die Spitze — dieselben Werte wie `note.x`/`note.y`. */
  readonly spitzeX: number;
  readonly spitzeY: number;
}

/** Wo Kopf und Spitze eines Pins liegen. */
export function notenForm(note: MapNote, tileSize: number): NotenForm {
  const hoehe = Math.max(MIN_HOEHE, note.size * tileSize);
  const r = hoehe / (1 + TIP_DISTANCE);
  return {
    kopfX: note.x,
    kopfY: note.y - TIP_DISTANCE * r,
    r,
    spitzeX: note.x,
    spitzeY: note.y
  };
}

/**
 * Abstand eines Punktes zur Pin-Flaeche. Innerhalb ist er 0.
 *
 * Genaehert aus zwei Teilen: dem Kopfkreis und der Strecke von der Kopfmitte
 * zur Spitze. Das ist etwas grosszuegiger als der echte Tropfen — bei einer
 * Trefferpruefung ist das die richtige Richtung.
 */
export function abstandZurNotiz(form: NotenForm, x: number, y: number): number {
  const zumKopf = Math.hypot(x - form.kopfX, y - form.kopfY) - form.r;
  if (zumKopf <= 0) return 0;

  // Strecke Kopfmitte → Spitze. Sie steht senkrecht, aber die allgemeine
  // Rechnung kostet nichts und haelt auch, wenn der Pin einmal kippen darf.
  const dx = form.spitzeX - form.kopfX;
  const dy = form.spitzeY - form.kopfY;
  const laengeQ = dx * dx + dy * dy;
  let t = laengeQ === 0 ? 0 : ((x - form.kopfX) * dx + (y - form.kopfY) * dy) / laengeQ;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const zumStiel = Math.hypot(x - (form.kopfX + t * dx), y - (form.kopfY + t * dy));

  return Math.min(zumKopf, zumStiel);
}
