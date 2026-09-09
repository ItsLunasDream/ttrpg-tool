/**
 * Der Polygon-Grundriss.
 *
 * Geprüft wird, was den Plan brauchbar macht und was man ihm nicht ansieht:
 * dass Blöcke einander nicht überlappen, dass kein Haus aus seinem Block
 * herausragt — und dass die Straßen *nicht* alle in dieselbe Richtung laufen.
 * Der letzte Punkt ist der Grund, aus dem es dieses Modul überhaupt gibt.
 */

import { describe, expect, it } from 'vitest';
import { Rng } from '@/model/rng';
import {
  bebauen,
  cityPlan,
  clipHalf,
  convexHull,
  imPoly,
  orient,
  polyArea,
  subdivide,
  ueberlappen,
  type CityPlanOptions,
  type Poly,
} from '@/model/generators/cityPlan';

const rechteck = (w: number, h: number): Poly => orient([0, 0, w, 0, w, h, 0, h]);

const opts: CityPlanOptions = {
  streetWidth: 3,
  buildingMin: 3,
  buildingMax: 6,
  buildingDepth: 3,
  plazaChance: 0.1,
  wildChance: 0.25,
  radialCuts: 0,
  maxDepth: 10,
};

describe('Polygonwerkzeug', () => {
  it('schneidet an einer Halbebene ab', () => {
    const halb = clipHalf(rechteck(10, 10), 1, 0, 4);
    expect(polyArea(halb)).toBeCloseTo(40, 5);
    for (let i = 0; i < halb.length; i += 2) expect(halb[i]).toBeLessThanOrEqual(4.0001);
  });

  it('liefert nichts, wenn die Halbebene alles wegnimmt', () => {
    expect(clipHalf(rechteck(10, 10), 1, 0, -1)).toHaveLength(0);
  });

  it('macht aus verwackelten Radien eine konvexe Hülle', () => {
    const rng = new Rng(5);
    const roh: number[] = [];
    for (let i = 0; i < 16; i++) {
      const w = (i / 16) * Math.PI * 2;
      const r = 10 * rng.range(0.7, 1);
      roh.push(Math.cos(w) * r, Math.sin(w) * r);
    }
    const hull = orient(convexHull(roh));
    const n = hull.length / 2;
    for (let i = 0; i < n; i++) {
      const a = i;
      const b = (i + 1) % n;
      const c = (i + 2) % n;
      const kreuz =
        (hull[b * 2] - hull[a * 2]) * (hull[c * 2 + 1] - hull[b * 2 + 1]) -
        (hull[b * 2 + 1] - hull[a * 2 + 1]) * (hull[c * 2] - hull[b * 2]);
      expect(kreuz).toBeGreaterThanOrEqual(-1e-9);
    }
  });
});

describe('Teilung in Blöcke', () => {
  it('legt Blöcke nebeneinander, nie übereinander', () => {
    for (const seed of [1, 2, 3, 8, 21]) {
      const { blocks } = subdivide(rechteck(80, 60), new Rng(seed), opts);
      expect(blocks.length).toBeGreaterThan(4);
      for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
          expect(ueberlappen(blocks[i].poly, blocks[j].poly), `${seed}: ${i}/${j}`).toBe(false);
        }
      }
    }
  });

  it('hält jeden Block in der Ausgangsfläche', () => {
    const flaeche = rechteck(80, 60);
    const { blocks } = subdivide(flaeche, new Rng(4), opts);
    for (const b of blocks) {
      for (let i = 0; i < b.poly.length; i += 2) {
        expect(imPoly(flaeche, b.poly[i], b.poly[i + 1], -1e-6)).toBe(true);
      }
    }
  });

  /**
   * Der eigentliche Zweck des Moduls: ein Grundriss, der nicht aus lauter
   * parallelen Straßen besteht. Gemessen an der Richtung der Straßenkanten,
   * in zwölf Fächer sortiert.
   */
  it('legt Straßen in verschiedene Richtungen', () => {
    for (const seed of [1, 5, 9]) {
      const { streets } = subdivide(rechteck(120, 90), new Rng(seed), opts);
      const faecher = new Set<number>();
      for (const st of streets) {
        const n = st.length / 2;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const dx = st[j * 2] - st[i * 2];
          const dy = st[j * 2 + 1] - st[i * 2 + 1];
          if (Math.hypot(dx, dy) < 3) continue;
          const w = ((Math.atan2(dy, dx) % Math.PI) + Math.PI) % Math.PI;
          faecher.add(Math.floor((w / Math.PI) * 12));
        }
      }
      expect(faecher.size, `Startwert ${seed}`).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('Bebauung eines Blocks', () => {
  it('hält jedes Haus im Block und keins im anderen', () => {
    for (const seed of [1, 2, 7]) {
      const block = orient([0, 0, 30, 0, 34, 22, 4, 20]);
      const haeuser = bebauen(block, new Rng(seed), opts);
      expect(haeuser.length).toBeGreaterThan(4);
      for (const h of haeuser) {
        for (let i = 0; i < h.points.length; i += 2) {
          expect(imPoly(block, h.points[i], h.points[i + 1], -0.05)).toBe(true);
        }
      }
      for (let i = 0; i < haeuser.length; i++) {
        for (let j = i + 1; j < haeuser.length; j++) {
          expect(ueberlappen(haeuser[i].points, haeuser[j].points)).toBe(false);
        }
      }
    }
  });

  it('setzt die Tür auf eine Hauskante', () => {
    const block = orient([0, 0, 30, 0, 34, 22, 4, 20]);
    for (const h of bebauen(block, new Rng(3), opts)) {
      const aufKante = (px: number, py: number) => {
        const n = h.points.length / 2;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const ax = h.points[i * 2];
          const ay = h.points[i * 2 + 1];
          const dx = h.points[j * 2] - ax;
          const dy = h.points[j * 2 + 1] - ay;
          const len = Math.hypot(dx, dy) || 1;
          const abstand = Math.abs(dx * (py - ay) - dy * (px - ax)) / len;
          if (abstand < 1e-6) return true;
        }
        return false;
      };
      expect(aufKante(h.door[0], h.door[1])).toBe(true);
      expect(aufKante(h.door[2], h.door[3])).toBe(true);
    }
  });

  /**
   * Ein langer Keil ist kein Haus. Solange jeder zu schmale Block als ein
   * Gebäude durchging, lagen auf dem Plan zwanzig Felder lange Dreiecke.
   */
  it('macht aus einem langen Keil kein einzelnes Gebäude', () => {
    const keil = orient([0, 0, 40, 0, 40, 5, 0, 1]);
    for (const h of bebauen(keil, new Rng(2), opts)) {
      let x0 = Infinity;
      let x1 = -Infinity;
      for (let i = 0; i < h.points.length; i += 2) {
        x0 = Math.min(x0, h.points[i]);
        x1 = Math.max(x1, h.points[i]);
      }
      expect(x1 - x0).toBeLessThanOrEqual(opts.buildingMax + 1);
    }
  });
});

describe('Ganzer Plan', () => {
  it('ist reproduzierbar und bei anderem Startwert anders', () => {
    const a = JSON.stringify(cityPlan(rechteck(80, 60), 5, opts));
    expect(JSON.stringify(cityPlan(rechteck(80, 60), 5, opts))).toBe(a);
    expect(JSON.stringify(cityPlan(rechteck(80, 60), 6, opts))).not.toBe(a);
  });

  it('lässt Plätze frei, nicht nur in der Mitte', () => {
    let plaetze = 0;
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      plaetze += cityPlan(rechteck(120, 90), seed, opts).blocks.filter((b) => b.plaza).length;
    }
    expect(plaetze).toBeGreaterThan(0);
  });

  it('baut nichts, wo es nicht darf', () => {
    const plan = cityPlan(rechteck(80, 60), 3, {
      ...opts,
      // Die rechte Hälfte ist gesperrt.
      erlaubt: (poly) => {
        for (let i = 0; i < poly.length; i += 2) if (poly[i] > 40) return false;
        return true;
      },
    });
    expect(plan.houses.length).toBeGreaterThan(4);
    for (const h of plan.houses) {
      for (let i = 0; i < h.points.length; i += 2) expect(h.points[i]).toBeLessThanOrEqual(40);
    }
  });
});
