/**
 * Grid-Mathematik für Quadrat- und Hex-Raster.
 *
 * Konvention wie in Foundry VTT:
 *   - hexPointy (spitze Ecke oben, Zeilen versetzt): tileSize = Breite der Zelle
 *   - hexFlat   (flache Kante oben, Spalten versetzt): tileSize = Höhe der Zelle
 * Damit entspricht tileSize immer der Distanz zwischen zwei parallelen Kanten,
 * und ein 5-Fuß-Tile ist in beiden Rastertypen gleich groß.
 */

import type { GridDistance, GridSettings, SnapMode } from './types';

export interface Point {
  x: number;
  y: number;
}

export interface Cell {
  col: number;
  row: number;
}

const SQRT3 = Math.sqrt(3);

/** Breite und Höhe einer einzelnen Zelle in Pixeln. */
export function cellSize(grid: GridSettings): { w: number; h: number } {
  const t = grid.tileSize;
  switch (grid.type) {
    case 'square':
      return { w: t, h: t };
    case 'hexPointy':
      return { w: t, h: (t * 2) / SQRT3 };
    case 'hexFlat':
      return { w: (t * 2) / SQRT3, h: t };
  }
}

/** Abstand zwischen benachbarten Zellmittelpunkten. */
export function cellStride(grid: GridSettings): { x: number; y: number } {
  const { w, h } = cellSize(grid);
  switch (grid.type) {
    case 'square':
      return { x: w, y: h };
    case 'hexPointy':
      return { x: w, y: h * 0.75 };
    case 'hexFlat':
      return { x: w * 0.75, y: h };
  }
}

/** Pixelmaße der gesamten Karte. */
export function mapPixelSize(
  grid: GridSettings,
  size: { cols: number; rows: number },
): { width: number; height: number } {
  const { w, h } = cellSize(grid);
  const stride = cellStride(grid);
  switch (grid.type) {
    case 'square':
      return { width: size.cols * w, height: size.rows * h };
    case 'hexPointy':
      // Versetzte Zeilen ragen um eine halbe Zellbreite über.
      return {
        width: size.cols * w + (size.rows > 1 ? w / 2 : 0),
        height: (size.rows - 1) * stride.y + h,
      };
    case 'hexFlat':
      return {
        width: (size.cols - 1) * stride.x + w,
        height: size.rows * h + (size.cols > 1 ? h / 2 : 0),
      };
  }
}

/** Mittelpunkt einer Zelle in Weltkoordinaten. */
export function cellToWorld(grid: GridSettings, cell: Cell): Point {
  const { w, h } = cellSize(grid);
  const stride = cellStride(grid);
  const ox = grid.offsetX;
  const oy = grid.offsetY;

  switch (grid.type) {
    case 'square':
      return { x: ox + (cell.col + 0.5) * w, y: oy + (cell.row + 0.5) * h };
    case 'hexPointy': {
      const shift = cell.row % 2 === 0 ? 0 : w / 2;
      return { x: ox + shift + (cell.col + 0.5) * w, y: oy + h / 2 + cell.row * stride.y };
    }
    case 'hexFlat': {
      const shift = cell.col % 2 === 0 ? 0 : h / 2;
      return { x: ox + w / 2 + cell.col * stride.x, y: oy + shift + (cell.row + 0.5) * h };
    }
  }
}

/** Zelle, in der ein Weltpunkt liegt. */
export function worldToCell(grid: GridSettings, p: Point): Cell {
  const { w, h } = cellSize(grid);
  const stride = cellStride(grid);
  const x = p.x - grid.offsetX;
  const y = p.y - grid.offsetY;

  if (grid.type === 'square') {
    return { col: Math.floor(x / w), row: Math.floor(y / h) };
  }

  // Für Hex ist die Bounding-Box-Zuordnung an den Zellrändern falsch. Deshalb
  // werden die drei plausiblen Kandidaten geprüft und der nächstgelegene
  // Mittelpunkt gewinnt — robust und für unsere Zellzahlen schnell genug.
  const approxRow =
    grid.type === 'hexPointy' ? Math.round((y - h / 2) / stride.y) : Math.floor(y / h);
  const approxCol =
    grid.type === 'hexPointy' ? Math.floor(x / w) : Math.round((x - w / 2) / stride.x);

  let best: Cell = { col: approxCol, row: approxRow };
  let bestDist = Infinity;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const cand = { col: approxCol + dc, row: approxRow + dr };
      const c = cellToWorld(grid, cand);
      const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = cand;
      }
    }
  }
  return best;
}

/** Die sechs Eckpunkte einer Hex-Zelle bzw. die vier einer Quadrat-Zelle. */
export function cellCorners(grid: GridSettings, cell: Cell): Point[] {
  const c = cellToWorld(grid, cell);
  const { w, h } = cellSize(grid);

  if (grid.type === 'square') {
    return [
      { x: c.x - w / 2, y: c.y - h / 2 },
      { x: c.x + w / 2, y: c.y - h / 2 },
      { x: c.x + w / 2, y: c.y + h / 2 },
      { x: c.x - w / 2, y: c.y + h / 2 },
    ];
  }

  // Startwinkel unterscheidet spitze von flacher Ausrichtung.
  const start = grid.type === 'hexPointy' ? -Math.PI / 2 : 0;
  const r = grid.type === 'hexPointy' ? h / 2 : w / 2;
  const pts: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const a = start + (i * Math.PI) / 3;
    pts.push({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
  }
  return pts;
}

/** Fängt einen Weltpunkt gemäß Snap-Modus. */
export function snapPoint(grid: GridSettings, p: Point, mode?: SnapMode): Point {
  const m = mode ?? grid.snap;
  if (m === 'none') return { ...p };

  if (m === 'corner') {
    const cell = worldToCell(grid, p);
    let best: Point = p;
    let bestDist = Infinity;
    // Auch die Ecken der Nachbarzellen prüfen, sonst schnappt es am Rand daneben.
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        for (const corner of cellCorners(grid, { col: cell.col + dc, row: cell.row + dr })) {
          const d = (corner.x - p.x) ** 2 + (corner.y - p.y) ** 2;
          if (d < bestDist) {
            bestDist = d;
            best = corner;
          }
        }
      }
    }
    return best;
  }

  const center = cellToWorld(grid, worldToCell(grid, p));
  if (m === 'tile') return center;

  // Halbe und viertel Schritte: zwischen Zellmittelpunkt und Rohposition
  // auf ein feineres Untergitter runden.
  const div = m === 'half' ? 2 : 4;
  const { w, h } = cellSize(grid);
  const stepX = w / div;
  const stepY = h / div;
  return {
    x: center.x + Math.round((p.x - center.x) / stepX) * stepX,
    y: center.y + Math.round((p.y - center.y) / stepY) * stepY,
  };
}

/** Fängt einen Winkel (Bogenmaß) auf das eingestellte Rotationsraster. */
export function snapRotation(grid: GridSettings, radians: number): number {
  if (!grid.rotationSnapDeg) return radians;
  const step = (grid.rotationSnapDeg * Math.PI) / 180;
  return Math.round(radians / step) * step;
}

export function defaultGrid(): GridSettings {
  return {
    type: 'square',
    tileSize: 100,
    visible: true,
    color: 0x000000,
    opacity: 0.3,
    lineWidth: 1,
    offsetX: 0,
    offsetY: 0,
    snap: 'none',
    rotationSnapDeg: 0,
    // Anderthalb Meter je Feld: das Fünf-Fuß-Quadrat, wie es die deutschen
    // Regelwerke schreiben.
    distance: { perTile: 1.5, unit: 'm', metric: 'chebyshev' },
  };
}

/** Maßstab eines Rasters; fehlt er in einer älteren Datei, gilt die Vorgabe. */
export function gridDistance(grid: GridSettings): GridDistance {
  return grid.distance ?? { perTile: 1.5, unit: 'm', metric: 'chebyshev' };
}

// ---------------------------------------------------------------------------
// Messen
// ---------------------------------------------------------------------------

/**
 * Achsenkoordinaten einer Hex-Zelle.
 *
 * Die Versatzkoordinaten aus `worldToCell` taugen nicht zum Rechnen: zwei
 * Zellen mit gleichem Zeilenabstand liegen je nach Zeilenparität verschieden
 * weit auseinander. In Achsenkoordinaten ist der Abstand eine Formel.
 *
 * `cellToWorld` verschiebt ungerade Zeilen (hexPointy) bzw. ungerade Spalten
 * (hexFlat) — das ist „odd-r" und „odd-q", und danach richten sich die
 * Umrechnungen hier.
 */
function axial(grid: GridSettings, cell: Cell): { q: number; r: number } {
  if (grid.type === 'hexPointy') {
    return { q: cell.col - (cell.row - (cell.row & 1)) / 2, r: cell.row };
  }
  return { q: cell.col, r: cell.row - (cell.col - (cell.col & 1)) / 2 };
}

/** Abstand zweier Hex-Zellen in Feldern. */
export function hexDistance(grid: GridSettings, a: Cell, b: Cell): number {
  const p = axial(grid, a);
  const q = axial(grid, b);
  return (Math.abs(p.q - q.q) + Math.abs(p.q + p.r - q.q - q.r) + Math.abs(p.r - q.r)) / 2;
}

/**
 * Abstand zweier Weltpunkte in Feldern.
 *
 * Im Hexraster zählt immer der Hexabstand — dort ist jeder Nachbar gleich
 * weit, und genau deshalb benutzt man es. Im Quadratraster entscheidet die
 * eingestellte Metrik, und `euclidean` misst nicht in Feldern, sondern mit
 * dem Lineal: es ist die einzige Metrik, die keine ganzen Zahlen liefert.
 */
export function measureTiles(grid: GridSettings, a: Point, b: Point): number {
  if (grid.type !== 'square') {
    return hexDistance(grid, worldToCell(grid, a), worldToCell(grid, b));
  }

  const metrik = gridDistance(grid).metric;
  if (metrik === 'euclidean') {
    return Math.hypot(b.x - a.x, b.y - a.y) / grid.tileSize;
  }

  const ca = worldToCell(grid, a);
  const cb = worldToCell(grid, b);
  const dc = Math.abs(cb.col - ca.col);
  const dr = Math.abs(cb.row - ca.row);
  const gerade = Math.max(dc, dr);
  const schraeg = Math.min(dc, dr);
  switch (metrik) {
    case 'chebyshev':
      return gerade;
    case 'manhattan':
      return dc + dr;
    case 'alternating':
      // Jede zweite Diagonale zählt doppelt — die 5-10-5-Regel.
      return gerade + Math.floor(schraeg / 2);
  }
}

/**
 * Beschriftung einer Strecke: Felder und Spielweltdistanz.
 *
 * Das Zeichen für „Feld" richtet sich nach dem Raster — auf einer Hexkarte ein
 * Quadrat zu zeigen, wäre eine kleine Lüge, die genau denen auffällt, die
 * bewusst Hex gewählt haben. Ein Wort statt eines Zeichens verböte sich: die
 * Beschriftung steht auf der Karte, und dort ist wenig Platz.
 */
export function formatDistance(grid: GridSettings, felder: number): string {
  const d = gridDistance(grid);
  const einheiten = felder * d.perTile;
  const runden = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const zeichen = grid.type === 'square' ? '▦' : '⬡';
  return `${runden(felder)} ${zeichen} · ${runden(einheiten)} ${d.unit}`;
}
