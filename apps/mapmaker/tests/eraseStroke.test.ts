/**
 * Radiergummi auf Linienzügen.
 *
 * Die Fälle, die zählen: mitten hinein (aus einem Strich werden zwei), am Ende
 * (der Strich wird kürzer), ganz weg, gar nicht getroffen — und der Ring, bei
 * dem der willkürliche Startpunkt sonst eine Naht hinterlässt.
 */

import { describe, expect, it } from 'vitest';
import { eraseCircle } from '@/model/eraseStroke';

/** Waagerechte Linie von (0,0) nach (100,0). */
const linie = [0, 0, 100, 0];

describe('eraseCircle', () => {
  it('schneidet mitten hinein und macht zwei Züge daraus', () => {
    const runs = eraseCircle(linie, false, 50, 0, 10);
    expect(runs).toHaveLength(2);
    expect(runs[0]).toEqual([0, 0, 40, 0]);
    expect(runs[1]).toEqual([60, 0, 100, 0]);
  });

  it('schneidet genau am Kreisrand, nicht am nächsten Stützpunkt', () => {
    // Der Zug hat Stützpunkte alle 25 Einheiten; der Schnitt muss trotzdem
    // bei 43 und 57 liegen.
    const fein = [0, 0, 25, 0, 50, 0, 75, 0, 100, 0];
    const runs = eraseCircle(fein, false, 50, 0, 7);
    expect(runs[0].slice(-2)).toEqual([43, 0]);
    expect(runs[1].slice(0, 2)).toEqual([57, 0]);
  });

  it('kürzt am Ende, ohne den Zug zu teilen', () => {
    const runs = eraseCircle(linie, false, 100, 0, 30);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toEqual([0, 0, 70, 0]);
  });

  it('kürzt am Anfang', () => {
    const runs = eraseCircle(linie, false, 0, 0, 30);
    expect(runs).toEqual([[30, 0, 100, 0]]);
  });

  it('radiert ganz weg', () => {
    expect(eraseCircle(linie, false, 50, 0, 200)).toEqual([]);
  });

  it('lässt den Zug in Ruhe, wenn der Kreis daneben liegt', () => {
    expect(eraseCircle(linie, false, 50, 500, 10)).toEqual([[0, 0, 100, 0]]);
  });

  it('lässt einen Rest, der zu kurz für einen Zug wäre, ganz weg', () => {
    // Übrig bliebe rechts ein Stück von unter einem Punktabstand — ein Zug aus
    // einem Punkt ist keine Linie.
    const runs = eraseCircle(linie, false, 50, 0, 50);
    expect(runs).toEqual([]);
  });

  it('trifft mehrere Stellen in einem Zug nacheinander', () => {
    const lang = [0, 0, 200, 0];
    const einmal = eraseCircle(lang, false, 50, 0, 10);
    const zweimal = einmal.flatMap((run) => eraseCircle(run, false, 150, 0, 10));
    expect(zweimal).toHaveLength(3);
    expect(zweimal.map((r) => [r[0], r[r.length - 2]])).toEqual([
      [0, 40],
      [60, 140],
      [160, 200],
    ]);
  });

  describe('geschlossene Formen', () => {
    /** Quadrat mit Ecken (0,0), (100,0), (100,100), (0,100). */
    const quadrat = [0, 0, 100, 0, 100, 100, 0, 100];

    it('macht aus dem Ring einen offenen Zug ohne Naht am Startpunkt', () => {
      // Radiert wird an der rechten Kante — der Startpunkt (0,0) bleibt stehen
      // und darf den Rest nicht in zwei Züge zerlegen.
      const runs = eraseCircle(quadrat, true, 100, 50, 20);
      expect(runs).toHaveLength(1);
      // Der Zug beginnt hinter dem Schnitt, läuft in Umlaufrichtung über den
      // Startpunkt hinweg und endet davor — eine durchgehende Linie, keine
      // zwei Stücke mit Naht bei (0,0).
      expect(runs[0].slice(0, 2)).toEqual([100, 70]);
      expect(runs[0].slice(-2)).toEqual([100, 30]);
      expect(runs[0]).toContain(0);
    });

    it('zerlegt ihn in zwei Züge, wenn an zwei Stellen radiert wird', () => {
      const einmal = eraseCircle(quadrat, true, 100, 50, 20);
      const zweimal = einmal.flatMap((run) => eraseCircle(run, false, 0, 50, 20));
      expect(zweimal).toHaveLength(2);
    });

    it('radiert ihn auch ganz weg', () => {
      expect(eraseCircle(quadrat, true, 50, 50, 500)).toEqual([]);
    });
  });

  it('kommt mit entarteten Eingaben zurecht', () => {
    expect(eraseCircle([], false, 0, 0, 10)).toEqual([]);
    expect(eraseCircle([5, 5], false, 0, 0, 10)).toEqual([]);
    expect(eraseCircle(linie, false, 50, 0, 0)).toEqual([[0, 0, 100, 0]]);
  });
});
