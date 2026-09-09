import { describe, expect, it } from 'vitest';
import {
  cellCorners,
  cellSize,
  cellToWorld,
  defaultGrid,
  mapPixelSize,
  snapPoint,
  snapRotation,
  worldToCell,
} from '@/model/grid';
import type { GridSettings } from '@/model/types';

const square = (): GridSettings => ({ ...defaultGrid(), type: 'square', tileSize: 100 });
const pointy = (): GridSettings => ({ ...defaultGrid(), type: 'hexPointy', tileSize: 100 });
const flat = (): GridSettings => ({ ...defaultGrid(), type: 'hexFlat', tileSize: 100 });

describe('Zellgeometrie', () => {
  it('Quadratzelle ist so groß wie die Tile-Größe', () => {
    expect(cellSize(square())).toEqual({ w: 100, h: 100 });
  });

  it('Hex-Zelle ist quer zur Ausrichtung tileSize breit', () => {
    // Konvention wie Foundry: tileSize misst zwischen zwei parallelen Kanten.
    expect(cellSize(pointy()).w).toBe(100);
    expect(cellSize(pointy()).h).toBeCloseTo(115.47, 2);
    expect(cellSize(flat()).h).toBe(100);
    expect(cellSize(flat()).w).toBeCloseTo(115.47, 2);
  });

  it('Quadrat-Zellmitte liegt bei einem halben Tile Versatz', () => {
    expect(cellToWorld(square(), { col: 0, row: 0 })).toEqual({ x: 50, y: 50 });
    expect(cellToWorld(square(), { col: 2, row: 3 })).toEqual({ x: 250, y: 350 });
  });

  it('versetzt ungerade Hex-Zeilen um eine halbe Zellbreite', () => {
    const g = pointy();
    const even = cellToWorld(g, { col: 0, row: 0 });
    const odd = cellToWorld(g, { col: 0, row: 1 });
    expect(odd.x - even.x).toBeCloseTo(50, 5);
  });

  it('hat sechs Ecken bei Hex und vier beim Quadrat', () => {
    expect(cellCorners(square(), { col: 0, row: 0 })).toHaveLength(4);
    expect(cellCorners(pointy(), { col: 0, row: 0 })).toHaveLength(6);
    expect(cellCorners(flat(), { col: 0, row: 0 })).toHaveLength(6);
  });
});

describe('worldToCell', () => {
  it('findet für Quadrate die Zelle unter dem Punkt', () => {
    const g = square();
    expect(worldToCell(g, { x: 0.1, y: 0.1 })).toEqual({ col: 0, row: 0 });
    expect(worldToCell(g, { x: 250, y: 350 })).toEqual({ col: 2, row: 3 });
    expect(worldToCell(g, { x: 99.9, y: 99.9 })).toEqual({ col: 0, row: 0 });
  });

  it('ist für alle Rastertypen die Umkehrung von cellToWorld', () => {
    for (const g of [square(), pointy(), flat()]) {
      for (const cell of [
        { col: 0, row: 0 },
        { col: 1, row: 1 },
        { col: 4, row: 7 },
        { col: 9, row: 2 },
      ]) {
        expect(worldToCell(g, cellToWorld(g, cell))).toEqual(cell);
      }
    }
  });

  it('ordnet Hex-Punkte der nächstgelegenen Mitte zu, nicht der Bounding-Box', () => {
    const g = pointy();
    // Ein Punkt knapp oberhalb der Zellmitte von (1,1) darf nicht in (1,0) fallen.
    const center = cellToWorld(g, { col: 1, row: 1 });
    expect(worldToCell(g, { x: center.x, y: center.y - 20 })).toEqual({ col: 1, row: 1 });
  });
});

describe('mapPixelSize', () => {
  it('multipliziert bei Quadraten schlicht durch', () => {
    expect(mapPixelSize(square(), { cols: 30, rows: 20 })).toEqual({ width: 3000, height: 2000 });
  });

  it('berücksichtigt bei Hex den Zeilenversatz und die Zellüberlappung', () => {
    const size = mapPixelSize(pointy(), { cols: 10, rows: 10 });
    // Versetzte Zeilen ragen eine halbe Zellbreite über.
    expect(size.width).toBeCloseTo(1050, 5);
    // Zeilen überlappen zu einem Viertel, sonst wäre die Höhe 10 * 115.47.
    expect(size.height).toBeLessThan(10 * cellSize(pointy()).h);
  });

  it('kollabiert den Hex-Überstand bei einer einzelnen Zeile nicht', () => {
    expect(mapPixelSize(pointy(), { cols: 5, rows: 1 }).width).toBe(500);
  });
});

describe('snapPoint', () => {
  it('lässt bei „none" den Punkt unverändert', () => {
    const p = { x: 123.4, y: 56.7 };
    expect(snapPoint({ ...square(), snap: 'none' }, p)).toEqual(p);
  });

  it('fängt auf die Zellmitte', () => {
    expect(snapPoint({ ...square(), snap: 'tile' }, { x: 123, y: 456 })).toEqual({ x: 150, y: 450 });
  });

  it('fängt auf halbe und viertel Tiles', () => {
    const half = snapPoint({ ...square(), snap: 'half' }, { x: 120, y: 120 });
    expect(half).toEqual({ x: 100, y: 100 });
    const quarter = snapPoint({ ...square(), snap: 'quarter' }, { x: 120, y: 120 });
    expect(quarter).toEqual({ x: 125, y: 125 });
  });

  it('fängt auf Eckpunkte — auch über Zellgrenzen hinweg', () => {
    const g = { ...square(), snap: 'corner' as const };
    expect(snapPoint(g, { x: 96, y: 104 })).toEqual({ x: 100, y: 100 });
    expect(snapPoint(g, { x: 4, y: 4 })).toEqual({ x: 0, y: 0 });
  });

  it('trifft bei Hex echte Zellecken', () => {
    const g = { ...pointy(), snap: 'corner' as const };
    const corners = cellCorners(g, { col: 1, row: 1 });
    const target = corners[2];
    const snapped = snapPoint(g, { x: target.x + 3, y: target.y - 3 });
    expect(snapped.x).toBeCloseTo(target.x, 5);
    expect(snapped.y).toBeCloseTo(target.y, 5);
  });

  it('berücksichtigt den Grid-Versatz', () => {
    const g = { ...square(), snap: 'tile' as const, offsetX: 20, offsetY: 10 };
    expect(snapPoint(g, { x: 123, y: 456 })).toEqual({ x: 170, y: 460 });
  });
});

describe('snapRotation', () => {
  it('lässt bei 0° frei drehen', () => {
    expect(snapRotation({ ...square(), rotationSnapDeg: 0 }, 1.234)).toBe(1.234);
  });

  it('rundet auf das eingestellte Raster', () => {
    const g = { ...square(), rotationSnapDeg: 45 };
    expect(snapRotation(g, (50 * Math.PI) / 180)).toBeCloseTo(Math.PI / 4, 10);
    expect(snapRotation(g, (10 * Math.PI) / 180)).toBeCloseTo(0, 10);
  });
});
