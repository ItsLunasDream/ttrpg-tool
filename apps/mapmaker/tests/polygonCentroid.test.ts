import { describe, expect, it } from 'vitest';
import { polygonCentroid } from '@/model/polygonCentroid';

describe('Polygon-Schwerpunkt', () => {
  it('ein Quadrat hat seinen Schwerpunkt in der Mitte', () => {
    const c = polygonCentroid([0, 0, 100, 0, 100, 100, 0, 100])!;
    expect(c.x).toBeCloseTo(50, 6);
    expect(c.y).toBeCloseTo(50, 6);
  });

  it('ein Dreieck hat ihn im Mittel seiner Ecken', () => {
    const c = polygonCentroid([0, 0, 90, 0, 0, 60])!;
    expect(c.x).toBeCloseTo(30, 6);
    expect(c.y).toBeCloseTo(20, 6);
  });

  /**
   * Der eigentliche Grund für die Flächengewichtung: der Mittelwert der Ecken
   * wandert dorthin, wo *viele* Punkte liegen. Hier hat die linke Kante viele
   * dicht beieinanderliegende Punkte — der Schwerpunkt darf davon nicht nach
   * links gezogen werden.
   */
  it('viele Punkte auf einer Kante ziehen ihn nicht dorthin', () => {
    const punkte: number[] = [];
    for (let i = 0; i <= 20; i++) punkte.push(0, (i / 20) * 100);
    punkte.push(100, 100, 100, 0);

    const c = polygonCentroid(punkte)!;
    expect(c.x).toBeCloseTo(50, 3);

    // Zum Vergleich: das Eckenmittel läge deutlich weiter links.
    let sx = 0;
    for (let i = 0; i < punkte.length; i += 2) sx += punkte[i];
    expect(sx / (punkte.length / 2)).toBeLessThan(30);
  });

  it('die Umlaufrichtung ändert nichts', () => {
    const a = polygonCentroid([0, 0, 100, 0, 100, 60, 0, 60])!;
    const b = polygonCentroid([0, 60, 100, 60, 100, 0, 0, 0])!;
    expect(a.x).toBeCloseTo(b.x, 6);
    expect(a.y).toBeCloseTo(b.y, 6);
  });

  /** Alle Punkte auf einer Linie: die Fläche ist null, es bleibt das Mittel. */
  it('fällt bei entarteten Polygonen auf das Eckenmittel zurück', () => {
    const c = polygonCentroid([0, 0, 50, 0, 100, 0])!;
    expect(c.x).toBeCloseTo(50, 6);
    expect(c.y).toBeCloseTo(0, 6);
  });

  it('kommt mit zwei Punkten und mit einem zurecht', () => {
    expect(polygonCentroid([10, 20, 30, 40])).toEqual({ x: 20, y: 30 });
    expect(polygonCentroid([7, 9])).toEqual({ x: 7, y: 9 });
  });

  it('ohne Punkte gibt es keinen Schwerpunkt', () => {
    expect(polygonCentroid([])).toBeNull();
  });
});
