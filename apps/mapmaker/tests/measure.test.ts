/**
 * Abstände auf dem Raster.
 *
 * Der Grund für eigene Tests: die Zahl, die das Messwerkzeug anzeigt, lässt
 * sich am Bildschirm nicht nachprüfen — man sieht eine Linie und glaubt ihr.
 * Falsch wäre sie erst am Spieltisch aufgefallen, beim Streit darüber, ob die
 * Figur noch reicht.
 */

import { describe, expect, it } from 'vitest';
import {
  cellToWorld,
  defaultGrid,
  formatDistance,
  hexDistance,
  measureTiles,
} from '@/model/grid';
import type { GridSettings } from '@/model/types';

const quadrat = (metric: 'chebyshev' | 'alternating' | 'euclidean' | 'manhattan'): GridSettings => ({
  ...defaultGrid(),
  distance: { perTile: 1.5, unit: 'm', metric },
});

/** Mitte der Zelle — so misst auch das Werkzeug, wenn gefangen wird. */
const mitte = (grid: GridSettings, col: number, row: number) => cellToWorld(grid, { col, row });

describe('Quadratraster', () => {
  it('zählt gerade Wege in jeder Metrik gleich', () => {
    for (const m of ['chebyshev', 'alternating', 'euclidean', 'manhattan'] as const) {
      const g = quadrat(m);
      expect(measureTiles(g, mitte(g, 0, 0), mitte(g, 4, 0)), m).toBeCloseTo(4);
    }
  });

  /**
   * Die Diagonale ist der ganze Unterschied zwischen den Metriken, und zwar
   * genau der, um den am Spieltisch gestritten wird.
   */
  it('zählt die Diagonale je nach Metrik verschieden', () => {
    const vier = (m: Parameters<typeof quadrat>[0]) => {
      const g = quadrat(m);
      return measureTiles(g, mitte(g, 0, 0), mitte(g, 4, 4));
    };
    expect(vier('chebyshev')).toBe(4);
    // 5-10-5: die zweite, vierte … Diagonale zählt doppelt.
    expect(vier('alternating')).toBe(6);
    expect(vier('manhattan')).toBe(8);
    expect(vier('euclidean')).toBeCloseTo(Math.sqrt(32), 5);
  });

  it('misst rückwärts genauso weit wie vorwärts', () => {
    const g = quadrat('alternating');
    const a = mitte(g, 7, 2);
    const b = mitte(g, 1, 5);
    expect(measureTiles(g, a, b)).toBe(measureTiles(g, b, a));
  });

  it('misst innerhalb einer Zelle null Felder', () => {
    const g = quadrat('chebyshev');
    expect(measureTiles(g, { x: 10, y: 10 }, { x: 80, y: 80 })).toBe(0);
  });
});

describe('Hexraster', () => {
  const pointy: GridSettings = { ...defaultGrid(), type: 'hexPointy' };
  const flat: GridSettings = { ...defaultGrid(), type: 'hexFlat' };

  /**
   * Der Sinn eines Hexrasters: alle sechs Nachbarn sind gleich weit. Wäre die
   * Umrechnung in Achsenkoordinaten falsch, käme hier für manche Richtungen 2
   * heraus — und niemand würde es bemerken, außer beim Nachzählen.
   */
  it('macht alle sechs Nachbarn gleich weit', () => {
    for (const grid of [pointy, flat]) {
      for (const start of [
        { col: 4, row: 4 },
        { col: 5, row: 5 },
        { col: 4, row: 5 },
        { col: 5, row: 4 },
      ]) {
        const mitteWelt = cellToWorld(grid, start);
        const nachbarn = new Set<string>();
        // Alle Zellen im Umfeld einsammeln, die geometrisch anliegen.
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const c = { col: start.col + dc, row: start.row + dr };
            if (c.col === start.col && c.row === start.row) continue;
            const p = cellToWorld(grid, c);
            const abstand = Math.hypot(p.x - mitteWelt.x, p.y - mitteWelt.y);
            // Nachbarn liegen genau eine Kantenweite entfernt.
            if (abstand < grid.tileSize * 1.05) nachbarn.add(`${c.col},${c.row}`);
          }
        }
        expect(nachbarn.size, `${grid.type} bei ${start.col}/${start.row}`).toBe(6);
        for (const key of nachbarn) {
          const [col, row] = key.split(',').map(Number);
          expect(hexDistance(grid, start, { col, row }), `${grid.type} ${key}`).toBe(1);
        }
      }
    }
  });

  it('zählt eine gerade Reihe hoch', () => {
    for (let n = 0; n <= 6; n++) {
      expect(hexDistance(pointy, { col: 0, row: 0 }, { col: n, row: 0 })).toBe(n);
      expect(hexDistance(flat, { col: 0, row: 0 }, { col: 0, row: n })).toBe(n);
    }
  });

  it('lässt die Metrik-Einstellung außer Acht — im Hex gibt es keine Diagonale', () => {
    const a = { ...pointy, distance: { perTile: 1.5, unit: 'm', metric: 'euclidean' as const } };
    const b = { ...pointy, distance: { perTile: 1.5, unit: 'm', metric: 'chebyshev' as const } };
    const p = cellToWorld(pointy, { col: 1, row: 1 });
    const q = cellToWorld(pointy, { col: 5, row: 4 });
    expect(measureTiles(a, p, q)).toBe(measureTiles(b, p, q));
  });
});

describe('Beschriftung', () => {
  it('nennt Felder und Spielweltdistanz', () => {
    const g = quadrat('chebyshev');
    expect(formatDistance(g, 4)).toBe('4 ▦ · 6 m');
    expect(formatDistance(g, 3)).toBe('3 ▦ · 4.5 m');
  });

  it('zeigt auf einer Hexkarte kein Quadrat', () => {
    const g: GridSettings = { ...defaultGrid(), type: 'hexPointy' };
    expect(formatDistance(g, 2)).toBe('2 ⬡ · 3 m');
  });

  it('folgt einem geänderten Maßstab', () => {
    const g: GridSettings = { ...defaultGrid(), distance: { perTile: 20, unit: 'km', metric: 'chebyshev' } };
    expect(formatDistance(g, 7)).toBe('7 ▦ · 140 km');
  });

  it('rundet krumme Werte auf eine Nachkommastelle', () => {
    const g = quadrat('euclidean');
    expect(formatDistance(g, Math.SQRT2)).toBe('1.4 ▦ · 2.1 m');
  });
});
