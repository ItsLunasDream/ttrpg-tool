import { describe, expect, it } from 'vitest';
import { align, distribute, type Item } from '@/model/align';

const kasten = (id: string, x: number, y: number, w = 10, h = 10): Item => ({
  id,
  bounds: { minX: x, minY: y, maxX: x + w, maxY: y + h },
});

describe('align', () => {
  it('schiebt alle an die linke Kante der gemeinsamen Hülle', () => {
    const d = align([kasten('a', 0, 0), kasten('b', 50, 20)], 'left');
    expect(d.get('b')).toEqual({ dx: -50, dy: 0 });
    // Das äußerste Objekt bleibt stehen und taucht gar nicht erst auf.
    expect(d.has('a')).toBe(false);
  });

  it('richtet an der rechten Kante aus', () => {
    const d = align([kasten('a', 0, 0), kasten('b', 50, 0)], 'right');
    expect(d.get('a')).toEqual({ dx: 50, dy: 0 });
  });

  it('zentriert waagerecht auf die Mitte der Hülle', () => {
    const d = align([kasten('a', 0, 0), kasten('b', 100, 0)], 'centerX');
    // Hülle 0..110, Mitte 55. Beide Mittelpunkte bei 5 bzw. 105.
    expect(d.get('a')).toEqual({ dx: 50, dy: 0 });
    expect(d.get('b')).toEqual({ dx: -50, dy: 0 });
  });

  it('richtet senkrecht aus, ohne waagerecht zu verschieben', () => {
    const d = align([kasten('a', 0, 0), kasten('b', 30, 40)], 'top');
    expect(d.get('b')).toEqual({ dx: 0, dy: -40 });
  });

  it('tut bei weniger als zwei Objekten nichts', () => {
    expect(align([kasten('a', 0, 0)], 'left').size).toBe(0);
    expect(align([], 'left').size).toBe(0);
  });

  it('berücksichtigt unterschiedliche Größen', () => {
    const d = align([kasten('a', 0, 0, 10, 10), kasten('b', 20, 0, 40, 10)], 'right');
    // b endet bei 60, a soll dort auch enden.
    expect(d.get('a')).toEqual({ dx: 50, dy: 0 });
  });
});

describe('distribute', () => {
  it('setzt gleiche Abstände zwischen den Mittelpunkten', () => {
    const d = distribute(
      [kasten('a', 0, 0), kasten('b', 10, 0), kasten('c', 100, 0)],
      'horizontal',
    );
    // Mittelpunkte 5, 15, 105 -> b soll auf 55.
    expect(d.get('b')).toEqual({ dx: 40, dy: 0 });
    expect(d.has('a')).toBe(false);
    expect(d.has('c')).toBe(false);
  });

  it('arbeitet unabhängig von der Reihenfolge in der Auswahl', () => {
    const vor = distribute([kasten('a', 0, 0), kasten('b', 10, 0), kasten('c', 100, 0)], 'horizontal');
    const rueck = distribute([kasten('c', 100, 0), kasten('b', 10, 0), kasten('a', 0, 0)], 'horizontal');
    expect(rueck.get('b')).toEqual(vor.get('b'));
  });

  it('verteilt senkrecht', () => {
    const d = distribute(
      [kasten('a', 0, 0), kasten('b', 0, 5), kasten('c', 0, 100)],
      'vertical',
    );
    expect(d.get('b')).toEqual({ dx: 0, dy: 45 });
  });

  it('tut bei weniger als drei Objekten nichts', () => {
    expect(distribute([kasten('a', 0, 0), kasten('b', 50, 0)], 'horizontal').size).toBe(0);
  });

  it('lässt bereits gleichmäßig Verteilte in Ruhe', () => {
    const d = distribute(
      [kasten('a', 0, 0), kasten('b', 50, 0), kasten('c', 100, 0)],
      'horizontal',
    );
    expect(d.size).toBe(0);
  });
});
