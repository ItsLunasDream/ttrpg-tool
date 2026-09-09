/**
 * Reiserouten mit Tagesmarken.
 *
 * Auf einer Weltkarte ist die häufigste Zeichnung ein Weg mit der Frage „wie
 * lange braucht man?". Bisher war das eine Linie und Kopfrechnen.
 *
 * Gerechnet wird über die **Bogenlänge**, nicht über die Stützpunkte: eine
 * Route aus drei langen Geraden hat genauso viele Tagesmarken wie dieselbe
 * Strecke aus dreißig kurzen. Die Marken sitzen deshalb *auf* den Segmenten,
 * nicht an ihren Enden, und tragen die Richtung des Weges an dieser Stelle —
 * ein Querstrich soll quer zum Weg stehen.
 */

import { gridDistance } from './grid';
import type { GridSettings } from './types';

export interface RouteMark {
  x: number;
  y: number;
  /** Richtung des Weges an dieser Stelle, im Bogenmaß. */
  angle: number;
  /** Der wievielte Tag hier endet, beginnend bei 1. */
  day: number;
}

/**
 * Wie weit ein Tagesmarsch in Weltpixeln ist.
 *
 * Die Route rechnet in Spielweltdistanz („40 km am Tag"), gezeichnet wird in
 * Weltpixeln. Dazwischen steht das Raster: `perTile` sagt, wie weit ein Feld
 * ist, `tileSize`, wie breit es gezeichnet wird.
 */
export function dayLengthInPixels(grid: GridSettings, perDay: number): number {
  const d = gridDistance(grid);
  if (!(perDay > 0) || !(d.perTile > 0)) return 0;
  return (perDay / d.perTile) * grid.tileSize;
}

/** Gesamtlänge des Weges in Spielweltdistanz — für „340 km, 8 Tage". */
export function routeDistance(points: number[], grid: GridSettings): number {
  const d = gridDistance(grid);
  return (laenge(points) / grid.tileSize) * d.perTile;
}

/** Wie viele Tage der Weg dauert, angebrochene mitgezählt. */
export function routeDays(points: number[], grid: GridSettings, perDay: number): number {
  const proTag = dayLengthInPixels(grid, perDay);
  if (proTag <= 0) return 0;
  return Math.ceil(laenge(points) / proTag);
}

/**
 * Setzt Marken in festen Abständen entlang des Weges.
 *
 * Am Anfang steht keine Marke — dort beginnt der erste Tag, er endet erst nach
 * einem Tagesmarsch. Endet der Weg genau auf einer Marke, steht sie dort;
 * darüber hinaus wird nichts gesetzt.
 *
 * `limit` deckelt die Zahl: eine Route über eine Weltkarte mit einem
 * Tagesmarsch von einem Pixel ergäbe sonst hunderttausend Querstriche und
 * einen stehenden Browser.
 */
export function routeMarks(points: number[], spacing: number, limit = 500): RouteMark[] {
  const marks: RouteMark[] = [];
  if (!(spacing > 0) || points.length < 4) return marks;

  let bisher = 0;
  let naechste = spacing;
  let tag = 1;

  for (let i = 0; i + 3 < points.length && marks.length < limit; i += 2) {
    const ax = points[i];
    const ay = points[i + 1];
    const bx = points[i + 2];
    const by = points[i + 3];
    const dx = bx - ax;
    const dy = by - ay;
    const segment = Math.hypot(dx, dy);
    if (segment <= 0) continue;

    const winkel = Math.atan2(dy, dx);
    while (naechste <= bisher + segment && marks.length < limit) {
      const t = (naechste - bisher) / segment;
      marks.push({ x: ax + dx * t, y: ay + dy * t, angle: winkel, day: tag });
      tag++;
      naechste += spacing;
    }
    bisher += segment;
  }

  return marks;
}

function laenge(points: number[]): number {
  let summe = 0;
  for (let i = 0; i + 3 < points.length; i += 2) {
    summe += Math.hypot(points[i + 2] - points[i], points[i + 3] - points[i + 1]);
  }
  return summe;
}

/**
 * Länge eines Tagesstrichs.
 *
 * **Nicht an der Strichstärke, sondern am Tagesmarsch.** Auf einer Weltkarte
 * ist ein Tag hunderte Weltpixel weit und die Route ein dünner Strich; ein
 * Querstrich von der zweieinhalbfachen Strichstärke wäre dort ein Haar und
 * beim Herauszoomen gar nichts mehr. Am Abstand gemessen bleibt er sichtbar,
 * egal wie groß die Karte ist — und die Strichstärke bildet die Untergrenze,
 * damit er auf einer Battlemap nicht verschwindet.
 */
export function markLength(spacing: number, strokeWidth: number): number {
  return Math.max(strokeWidth * 2.5, 6, spacing * 0.03);
}
