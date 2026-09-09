/**
 * Weltkarten-Generator.
 *
 * Diese Tests prüfen nicht das Höhenfeld, sondern das *gezeichnete Ergebnis* —
 * und zwar aus dem Grund, aus dem der Fehler überhaupt auffiel: gemeldet wurde
 * „Bäume mitten im Wasser". Das Höhenfeld war dabei nie falsch. Falsch war der
 * Weg vom Feld zum Bild: die Küste wird geglättet, Glättung zieht die Kontur
 * nach innen, und die Zelle, auf der der Baum stand, lag danach im Meer.
 *
 * Ein Test gegen `biomAn` hätte das nicht gesehen. Also wird hier gegen die
 * Landfläche geprüft, die tatsächlich gemalt wird.
 */

import { describe, expect, it } from 'vitest';
import { generateWorld, defaultWorldOptions, type WorldOptions } from '@/model/generators/world';
import type { GeneratedMap } from '@/model/generators/types';

const TILE = 100;
/** Die Landlage: geschachtelt gezeichnet, umfasst sie alles außer dem Meer. */
const LAND_FARBE = 0xd6c08a;
const SEEZEICHEN = new Set(['w_ship', 'w_seamonster', 'w_whirlpool']);
/** Kompass und Maßstabsleiste sind Beschriftung, keine Landschaft. */
const BEIWERK = new Set(['w_compass', 'w_scalebar']);

function welt(over: Partial<WorldOptions> = {}): GeneratedMap {
  return generateWorld({ ...defaultWorldOptions(), seed: 1, tileSize: TILE, ...over });
}

/** Ungerade Kreuzungszahl heißt innen — mit XOR über alle Ringe, damit Löcher (Binnenseen) zählen. */
function imLand(karte: GeneratedMap, x: number, y: number): boolean {
  let drin = false;
  for (const f of karte.floors) {
    if (f.color !== LAND_FARBE) continue;
    const p = f.points;
    const n = p.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const yi = p[i * 2 + 1];
      const yj = p[j * 2 + 1];
      if (yi > y === yj > y) continue;
      const x0 = p[i * 2];
      const x1 = p[j * 2];
      if (x < x0 + ((y - yi) / (yj - yi)) * (x1 - x0)) drin = !drin;
    }
  }
  return drin;
}

describe('Weltkarte', () => {
  it('setzt kein Landzeichen ins Wasser', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const karte = welt({ seed });
      for (const p of karte.props) {
        if (SEEZEICHEN.has(p.propId) || BEIWERK.has(p.propId)) continue;
        expect(imLand(karte, p.x, p.y), `Seed ${seed}: ${p.propId} bei ${p.x / TILE}/${p.y / TILE}`).toBe(true);
      }
    }
  });

  it('setzt Seezeichen umgekehrt nur aufs Wasser — und sparsam', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const karte = welt({ seed });
      const see = karte.props.filter((p) => SEEZEICHEN.has(p.propId));
      expect(see.length).toBeLessThanOrEqual(4);
      for (const p of see) {
        expect(imLand(karte, p.x, p.y), `Seed ${seed}: ${p.propId} an Land`).toBe(false);
      }
    }
  });

  /**
   * Der Fehler, der die geraden Schnitte quer über den Kontinent machte, saß
   * in `traceOutlines` und nicht hier — aber gesehen hat man ihn nur auf der
   * Weltkarte. Deshalb steht die Wache dort, wo sie aufgefallen wäre.
   */
  it('zeichnet keine Sehnen quer durch die Landmasse', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const karte = welt({ seed });
      for (const f of karte.floors) {
        const n = f.points.length / 2;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const d = Math.hypot(f.points[j * 2] - f.points[i * 2], f.points[j * 2 + 1] - f.points[i * 2 + 1]);
          // Zwölf Tiles ist großzügig: die längste ehrliche Kante ist der
          // Kartenrand des Ozeans, die Sehnen waren doppelt so lang.
          expect(d / TILE, `Seed ${seed}, Farbe ${f.color.toString(16)}`).toBeLessThan(12);
        }
      }
    }
  });

  it('setzt so viele Siedlungen wie verlangt und verbindet sie', () => {
    const karte = welt({ settlements: 6, roads: true, decorate: false });
    const orte = karte.props.filter((p) => ['w_city', 'w_town', 'w_castle'].includes(p.propId));
    expect(orte).toHaveLength(6);
    // Genau eine Hauptstadt.
    expect(orte.filter((p) => p.propId === 'w_city')).toHaveLength(1);
    // Ein Minimalgerüst über sechs Knoten hat fünf Kanten; jede ist eine Fläche.
    const wege = karte.floors.filter((f) => f.color === 0xbca77c);
    expect(wege.length).toBeGreaterThanOrEqual(4);
  });

  it('lässt Siedlungen und Straßen weg, wenn sie abgeschaltet sind', () => {
    const karte = welt({ settlements: 0, roads: false, decorate: false });
    expect(karte.props.filter((p) => p.propId === 'w_city')).toHaveLength(0);
    expect(karte.floors.filter((f) => f.color === 0xbca77c)).toHaveLength(0);
  });

  it('streut ohne Ausstattung nur Kompass und Maßstab', () => {
    const karte = welt({ decorate: false, settlements: 0, cartouche: true });
    expect(karte.props.map((p) => p.propId).sort()).toEqual(['w_compass', 'w_scalebar']);
  });
});
