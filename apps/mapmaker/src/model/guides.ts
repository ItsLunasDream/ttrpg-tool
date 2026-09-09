/**
 * Hilfslinien.
 *
 * Zwei Dinge unterscheiden sie von allem anderen auf der Karte: sie sind
 * unendlich lang, und sie werden nie exportiert. Beides folgt daraus, wozu sie
 * da sind — sie richten aus, sie sind kein Karteninhalt.
 *
 * Sie stehen im Dokument, nicht in der Ansicht: wer eine Karte an Hilfslinien
 * ausgerichtet hat, will sie beim nächsten Öffnen wiederhaben.
 */

import type { Guide, MapDocument } from './types';
import type { Point } from './grid';

export const guidesOf = (doc: MapDocument): Guide[] => doc.guides ?? [];

/**
 * Die Hilfslinie unter einem Punkt.
 *
 * `tolerance` ist in Weltpixeln und kommt vom Aufrufer aus der Bildschirm-
 * toleranz geteilt durch den Zoom: eine Linie soll sich bei jeder Vergrößerung
 * gleich leicht greifen lassen.
 */
export function guideAt(doc: MapDocument, p: Point, tolerance: number): Guide | null {
  let best: Guide | null = null;
  let bestDist = tolerance;
  for (const g of guidesOf(doc)) {
    const d = Math.abs((g.axis === 'x' ? p.x : p.y) - g.pos);
    if (d <= bestDist) {
      bestDist = d;
      best = g;
    }
  }
  return best;
}

/**
 * Fängt einen Punkt an den Hilfslinien.
 *
 * Wird *nach* dem Rasterfang angewandt und schlägt ihn: wer eine Hilfslinie
 * setzt, meint genau diese Stelle und nicht die nächste Rasterecke daneben.
 * Beide Achsen getrennt — ein Punkt kann an einer senkrechten Linie hängen und
 * in der Höhe frei bleiben.
 */
export function snapToGuides(doc: MapDocument, p: Point, tolerance: number): Point {
  if (tolerance <= 0) return { ...p };
  let x = p.x;
  let y = p.y;
  let bestX = tolerance;
  let bestY = tolerance;
  for (const g of guidesOf(doc)) {
    if (g.axis === 'x') {
      const d = Math.abs(p.x - g.pos);
      if (d <= bestX) {
        bestX = d;
        x = g.pos;
      }
    } else {
      const d = Math.abs(p.y - g.pos);
      if (d <= bestY) {
        bestY = d;
        y = g.pos;
      }
    }
  }
  return { x, y };
}

/** Liegt die Linie noch auf der Karte? Was daneben landet, wird gelöscht. */
export function guideOnMap(guide: Guide, size: { cols: number; rows: number }, tile: number): boolean {
  const max = guide.axis === 'x' ? size.cols * tile : size.rows * tile;
  return guide.pos >= 0 && guide.pos <= max;
}
