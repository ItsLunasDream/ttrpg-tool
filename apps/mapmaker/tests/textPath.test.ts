import { describe, expect, it } from 'vitest';
import { arcPath, layoutOnPath } from '@/model/textPath';

describe('layoutOnPath', () => {
  const gerade = [0, 0, 100, 0];

  it('setzt Zeichen auf ihre Mitte, mittig zum Pfad', () => {
    // Drei Zeichen zu je 10 = 30 breit auf 100 Länge -> Start bei 35.
    const p = layoutOnPath(gerade, [10, 10, 10], 0, 'center');
    expect(p).toHaveLength(3);
    expect(p[0].x).toBeCloseTo(40);
    expect(p[1].x).toBeCloseTo(50);
    expect(p[2].x).toBeCloseTo(60);
    expect(p[0].y).toBeCloseTo(0);
  });

  it('beginnt bei linker Ausrichtung am Pfadanfang', () => {
    const p = layoutOnPath(gerade, [10, 10], 0, 'left');
    expect(p[0].x).toBeCloseTo(5);
  });

  it('endet bei rechter Ausrichtung am Pfadende', () => {
    const p = layoutOnPath(gerade, [10, 10], 0, 'right');
    expect(p[1].x).toBeCloseTo(95);
  });

  it('berücksichtigt den Zeichenabstand', () => {
    const ohne = layoutOnPath(gerade, [10, 10], 0, 'left');
    const mit = layoutOnPath(gerade, [10, 10], 6, 'left');
    expect(mit[1].x - ohne[1].x).toBeCloseTo(6);
  });

  it('folgt einem Knick mit passendem Winkel', () => {
    // Erst nach rechts, dann nach unten.
    const p = layoutOnPath([0, 0, 50, 0, 50, 50], [10, 10, 10, 10], 0, 'left');
    expect(p[0].angle).toBeCloseTo(0);
    expect(p[p.length - 1].angle).toBeCloseTo(0);
  });

  it('läuft über das Pfadende hinaus, statt zu stauchen', () => {
    // Text breiter als der Pfad: die Zeichen behalten ihren Abstand.
    const p = layoutOnPath(gerade, [50, 50, 50], 0, 'left');
    expect(p[2].x - p[1].x).toBeCloseTo(50);
  });

  it('kommt mit leeren Eingaben zurecht', () => {
    expect(layoutOnPath([], [10], 0)).toEqual([]);
    expect(layoutOnPath(gerade, [], 0)).toEqual([]);
    expect(layoutOnPath([5, 5, 5, 5], [10], 0)).toEqual([]);
  });
});

describe('arcPath', () => {
  it('liefert bei Wölbung null eine Gerade', () => {
    expect(arcPath(100, 0)).toEqual([-50, 0, 50, 0]);
  });

  it('spannt den Bogen über die volle Breite', () => {
    const p = arcPath(100, 0.5, 16);
    expect(p[0]).toBeCloseTo(-50, 0);
    expect(p[p.length - 2]).toBeCloseTo(50, 0);
  });

  it('wölbt je nach Vorzeichen nach oben oder unten', () => {
    const mitteOben = arcPath(100, 0.5, 16)[17];
    const mitteUnten = arcPath(100, -0.5, 16)[17];
    expect(Math.sign(mitteOben)).toBe(-Math.sign(mitteUnten));
  });

  it('endet auf gleicher Höhe wie es beginnt', () => {
    const p = arcPath(100, 0.6, 20);
    expect(p[1]).toBeCloseTo(p[p.length - 1], 5);
  });
});
