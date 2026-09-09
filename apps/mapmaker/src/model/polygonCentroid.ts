/**
 * Schwerpunkt eines Polygons.
 *
 * Für die Beschriftung einer Region gebraucht. Nicht der Mittelwert der
 * Eckpunkte: der wandert dorthin, wo *viele* Punkte liegen — bei einer Küste
 * mit hundert kleinen Buchten und drei geraden Landkanten säße die
 * Beschriftung in der Bucht statt in der Mitte des Landes.
 *
 * Stattdessen der flächengewichtete Schwerpunkt. Fällt die Fläche auf null
 * zusammen (alle Punkte auf einer Linie), bleibt nur der Mittelwert übrig.
 */

export interface Point {
  x: number;
  y: number;
}

export function polygonCentroid(points: number[]): Point | null {
  const n = points.length / 2;
  if (n < 1) return null;
  if (n < 3) {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < points.length; i += 2) {
      sx += points[i];
      sy += points[i + 1];
    }
    return { x: sx / n, y: sy / n };
  }

  let flaeche2 = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const x0 = points[i * 2];
    const y0 = points[i * 2 + 1];
    const x1 = points[j * 2];
    const y1 = points[j * 2 + 1];
    const kreuz = x0 * y1 - x1 * y0;
    flaeche2 += kreuz;
    cx += (x0 + x1) * kreuz;
    cy += (y0 + y1) * kreuz;
  }

  if (Math.abs(flaeche2) < 1e-9) {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < points.length; i += 2) {
      sx += points[i];
      sy += points[i + 1];
    }
    return { x: sx / n, y: sy / n };
  }

  return { x: cx / (3 * flaeche2), y: cy / (3 * flaeche2) };
}
