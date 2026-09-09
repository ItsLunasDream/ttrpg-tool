import { describe, expect, it } from 'vitest';
import { CellGrid, keepLargestRegion, regions, traceOutlines } from '@/model/generators/grid';

/** Ring als Menge von Ecken, damit der Startpunkt egal ist. */
function ecken(ring: number[]): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < ring.length; i += 2) s.add(`${ring[i]},${ring[i + 1]}`);
  return s;
}

describe('CellGrid', () => {
  it('liest außerhalb liegende Felder als leer', () => {
    const g = new CellGrid(3, 3, 1);
    expect(g.filled(0, 0)).toBe(true);
    expect(g.filled(-1, 0)).toBe(false);
    expect(g.filled(3, 0)).toBe(false);
  });

  it('schneidet fillRect am Rand ab, statt zu werfen', () => {
    const g = new CellGrid(4, 4);
    g.fillRect(2, 2, 10, 10);
    expect(g.count()).toBe(4);
  });

  it('zählt Nachbarn und behandelt das Außen wie eingestellt', () => {
    const g = new CellGrid(3, 3);
    expect(g.neighbours(0, 0, true)).toBe(5);
    expect(g.neighbours(0, 0, false)).toBe(0);
    g.fillRect(0, 0, 3, 3);
    expect(g.neighbours(1, 1, false)).toBe(8);
  });
});

describe('regions', () => {
  it('trennt zwei nicht verbundene Flächen', () => {
    const g = new CellGrid(7, 3);
    g.fillRect(0, 0, 2, 3);
    g.fillRect(5, 0, 2, 3);
    const r = regions(g);
    expect(r).toHaveLength(2);
    expect(r[0]).toHaveLength(6);
  });

  it('zählt diagonal berührende Felder nicht als verbunden', () => {
    const g = new CellGrid(2, 2);
    g.set(0, 0, 1);
    g.set(1, 1, 1);
    expect(regions(g)).toHaveLength(2);
  });

  it('behält nur den größten Bereich', () => {
    const g = new CellGrid(7, 3);
    g.fillRect(0, 0, 3, 3);
    g.fillRect(6, 0, 1, 1);
    const k = keepLargestRegion(g);
    expect(k.count()).toBe(9);
    expect(k.filled(6, 0)).toBe(false);
  });
});

describe('traceOutlines', () => {
  it('umschließt ein Rechteck mit vier Ecken', () => {
    const g = new CellGrid(6, 6);
    g.fillRect(1, 1, 3, 2);
    const ringe = traceOutlines(g);
    expect(ringe).toHaveLength(1);
    expect(ringe[0]).toHaveLength(8);
    expect(ecken(ringe[0])).toEqual(new Set(['1,1', '4,1', '4,3', '1,3']));
  });

  it('liefert je Fläche einen Ring', () => {
    const g = new CellGrid(9, 3);
    g.fillRect(0, 0, 2, 2);
    g.fillRect(6, 0, 2, 2);
    expect(traceOutlines(g)).toHaveLength(2);
  });

  it('findet auch den Rand eines Lochs', () => {
    const g = new CellGrid(7, 7);
    g.fillRect(1, 1, 5, 5);
    g.set(3, 3, 0);
    const ringe = traceOutlines(g);
    expect(ringe).toHaveLength(2);
    const klein = ringe.find((r) => r.length === 8 && ecken(r).has('3,3'));
    expect(klein).toBeDefined();
  });

  it('lässt keine Zwischenpunkte auf geraden Kanten stehen', () => {
    const g = new CellGrid(12, 4);
    g.fillRect(0, 0, 10, 2);
    const ringe = traceOutlines(g);
    // Ein 10x2-Block hat vier Ecken, nicht vierundzwanzig.
    expect(ringe[0]).toHaveLength(8);
  });

  it('gibt bei leerem Raster nichts zurück', () => {
    expect(traceOutlines(new CellGrid(5, 5))).toEqual([]);
  });

  /**
   * Zwei Bereiche, die sich nur über Eck berühren:
   *
   *     █ ·
   *     · █
   *
   * An der Berührecke beginnen *zwei* Umrisskanten. Solange die Verfolgung je
   * Gitterpunkt nur eine Kante kannte, überschrieb die zweite die erste; die
   * Kette lief in eine Sackgasse und der Ring blieb offen. Gefüllt zog das
   * Polygon dann eine gerade Sehne quer durch die Form — auf der Weltkarte ein
   * schnurgerader Schnitt durch einen halben Kontinent.
   */
  it('trennt zwei über Eck liegende Flecken in zwei geschlossene Ringe', () => {
    const g = new CellGrid(4, 4);
    g.set(1, 1, 1);
    g.set(2, 2, 1);
    const ringe = traceOutlines(g);
    expect(ringe).toHaveLength(2);
    // Jeder Ring umschließt genau ein Feld: vier Ecken.
    for (const ring of ringe) expect(ring).toHaveLength(8);
  });

  /**
   * Dieselbe Falle im Großen: eine Diagonaltreppe berührt sich an jeder Stufe
   * über Eck. Hier zeigte sich, ob die Wahl an der Gabelung stimmt oder ob die
   * Verfolgung von einem Fleck in den nächsten hinüberspringt.
   */
  it('hält auch bei einer Diagonaltreppe jeden Ring geschlossen', () => {
    const g = new CellGrid(10, 10);
    for (let i = 1; i < 9; i++) g.set(i, i, 1);
    const ringe = traceOutlines(g);
    expect(ringe).toHaveLength(8);
    for (const ring of ringe) expect(ring).toHaveLength(8);
  });

  it('behält bei einer L-Form alle sechs Ecken', () => {
    const g = new CellGrid(6, 6);
    g.fillRect(1, 1, 3, 1);
    g.fillRect(1, 2, 1, 2);
    const ringe = traceOutlines(g);
    expect(ringe).toHaveLength(1);
    expect(ringe[0]).toHaveLength(12);
  });
});
