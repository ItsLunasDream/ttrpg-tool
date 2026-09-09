import { describe, expect, it } from 'vitest';
import { defaultPlateOptions, makePlates, plateField, type PlateOptions } from '@/model/generators/plates';
import { Rng } from '@/model/rng';

const opts = (over: Partial<PlateOptions> = {}): PlateOptions => ({
  ...defaultPlateOptions(40, 30),
  ...over,
});

describe('Platten streuen', () => {
  it('legt die gewünschte Anzahl an', () => {
    const o = opts({ count: 9 });
    expect(makePlates(new Rng(1), o)).toHaveLength(9);
  });

  it('liegt vollständig innerhalb der Karte', () => {
    const o = opts({ count: 12 });
    for (const p of makePlates(new Rng(7), o)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(o.cols);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(o.rows);
    }
  });

  it('derselbe Seed ergibt dieselben Platten', () => {
    const o = opts();
    expect(makePlates(new Rng(42), o)).toEqual(makePlates(new Rng(42), o));
  });

  it('ein anderer Seed ergibt andere', () => {
    const o = opts();
    expect(makePlates(new Rng(1), o)).not.toEqual(makePlates(new Rng(2), o));
  });

  /**
   * Rein zufällige Punkte klumpen — es entstünden ein paar winzige Platten
   * neben einer riesigen. Über ein grobes Gitter verteilt bleibt ein
   * Mindestabstand übrig.
   */
  it('klumpen nicht', () => {
    const o = opts({ count: 12 });
    const platten = makePlates(new Rng(3), o);
    let kleinster = Infinity;
    for (let i = 0; i < platten.length; i++) {
      for (let k = i + 1; k < platten.length; k++) {
        kleinster = Math.min(kleinster, Math.hypot(platten[i].x - platten[k].x, platten[i].y - platten[k].y));
      }
    }
    // Ein Gitterfeld ist rund 10×10 groß; die Punkte sitzen darin bei 0,2–0,8.
    expect(kleinster).toBeGreaterThan(2);
  });

  it('Landplatten liegen höher als ozeanische', () => {
    const platten = makePlates(new Rng(5), opts({ count: 20, landShare: 0.5 }));
    const land = platten.filter((p) => p.land);
    const meer = platten.filter((p) => !p.land);
    if (land.length === 0 || meer.length === 0) return;
    expect(Math.min(...land.map((p) => p.base))).toBeGreaterThan(Math.max(...meer.map((p) => p.base)));
  });
});

describe('Höhenfeld aus Platten', () => {
  it('hat für jedes Feld einen Wert zwischen 0 und 1', () => {
    const o = opts({ count: 8 });
    const feld = plateField(makePlates(new Rng(11), o), o);
    expect(feld).toHaveLength(o.cols * o.rows);
    for (const v of feld) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  /**
   * Der eigentliche Zweck der Variante: an der Naht zweier Landplatten türmt
   * sich Gebirge auf. Ohne das wäre es nur ein Flickenteppich aus Höhenstufen.
   */
  it('türmt sich an der Naht zweier Landplatten auf', () => {
    const o = opts({ cols: 41, rows: 11, count: 2, ridgeWidth: 8, ridgeHeight: 0.3 });
    const platten = [
      { x: 5, y: 5, land: true, base: 0.6 },
      { x: 35, y: 5, land: true, base: 0.6 },
    ];
    const feld = plateField(platten, o);
    const bei = (c: number) => feld[5 * o.cols + c];
    // Genau in der Mitte liegt die Naht.
    expect(bei(20)).toBeGreaterThan(bei(5) + 0.2);
    expect(bei(20)).toBeGreaterThan(bei(35) + 0.2);
  });

  /**
   * Im Ozean darf die Naht *nicht* aufragen: ein Rücken stieße stellenweise
   * über die Meereshöhe und erzeugte Inselketten, wo keine gemeint sind.
   */
  it('senkt die Naht zweier ozeanischer Platten ab', () => {
    const o = opts({ cols: 41, rows: 11, count: 2, ridgeWidth: 8, ridgeHeight: 0.3 });
    const platten = [
      { x: 5, y: 5, land: false, base: 0.25 },
      { x: 35, y: 5, land: false, base: 0.25 },
    ];
    const feld = plateField(platten, o);
    expect(feld[5 * o.cols + 20]).toBeLessThan(feld[5 * o.cols + 5]);
  });

  it('weit von jeder Naht bleibt die Grundhöhe der Platte stehen', () => {
    const o = opts({ cols: 41, rows: 11, count: 2, ridgeWidth: 3, ridgeHeight: 0.3 });
    const platten = [
      { x: 5, y: 5, land: true, base: 0.6 },
      { x: 35, y: 5, land: true, base: 0.6 },
    ];
    const feld = plateField(platten, o);
    expect(feld[5 * o.cols + 5]).toBeCloseTo(0.6, 5);
  });

  /** Ohne Ausfransen wären die Grenzen mathematisch gerade Linien. */
  it('das Ausfransen verschiebt die Naht', () => {
    const o = opts({ cols: 41, rows: 11, count: 2, ridgeWidth: 8, ridgeHeight: 0.3 });
    const platten = [
      { x: 5, y: 5, land: true, base: 0.6 },
      { x: 35, y: 5, land: true, base: 0.6 },
    ];
    const glatt = plateField(platten, o);
    const rau = plateField(platten, o, (c) => ({ dx: Math.sin(c) * 4, dy: 0 }));
    expect([...rau]).not.toEqual([...glatt]);
  });

  it('die Standardwerte richten sich nach der Kartengröße', () => {
    expect(defaultPlateOptions(64, 44).count).toBeGreaterThan(defaultPlateOptions(20, 15).count);
    expect(defaultPlateOptions(20, 15).count).toBeGreaterThanOrEqual(4);
  });
});
