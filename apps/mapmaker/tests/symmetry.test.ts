/**
 * Spiegeln und Kacheln.
 *
 * Die Fälle, an denen es leise schiefgeht: eine mitgespiegelte Drehung, die
 * vergessene vierte Ecke bei zwei Achsen, und Spiegelschrift.
 */

import { describe, expect, it } from 'vitest';
import { createDocument, defaultTargetLayer } from '@/model/document';
import { mapPixelSize } from '@/model/grid';
import { axesOf, defaultSymmetry, symmetryActive, symmetryCopies } from '@/model/symmetry';
import type { MapDocument, MapObject, PropObject, ShapeObject, TextObject } from '@/model/types';

const doc = (): MapDocument => createDocument();

function prop(d: MapDocument, x: number, y: number, rotation = 0): PropObject {
  return {
    id: 'p1',
    layerId: defaultTargetLayer(d)!,
    kind: 'prop',
    x,
    y,
    rotation,
    opacity: 1,
    z: 1,
    locked: false,
    propId: 'barrel',
    scaleX: 1,
    scaleY: 1,
    tint: null,
    flipX: false,
    flipY: false,
    seed: 1,
  };
}

function form(d: MapDocument, x: number, y: number): ShapeObject {
  return {
    id: 's1',
    layerId: defaultTargetLayer(d)!,
    kind: 'shape',
    shape: 'line',
    x,
    y,
    rotation: 0,
    opacity: 1,
    z: 1,
    locked: false,
    points: [0, 0, 40, 10],
    stroke: { color: 0xffffff, width: 2, alpha: 1, dash: [] },
    fill: null,
    closed: false,
    blend: 'normal',
  };
}

function text(d: MapDocument, x: number, y: number, rotation = 0.5): TextObject {
  return {
    id: 't1',
    layerId: defaultTargetLayer(d)!,
    kind: 'text',
    x,
    y,
    rotation,
    opacity: 1,
    z: 1,
    locked: false,
    text: 'Halle',
    fontFamily: 'serif',
    fontSize: 16,
    bold: false,
    italic: false,
    color: 0,
    align: 'center',
    letterSpacing: 0,
    lineHeight: 1.2,
    strokeColor: null,
    strokeWidth: 0,
  };
}

describe('Wann überhaupt gespiegelt wird', () => {
  it('tut ohne Einstellung nichts', () => {
    const d = doc();
    expect(symmetryActive(defaultSymmetry())).toBe(false);
    expect(symmetryCopies(d, [prop(d, 100, 100)], defaultSymmetry())).toEqual([]);
  });

  it('nimmt ohne eigene Achse die Kartenmitte', () => {
    const d = doc();
    const size = mapPixelSize(d.grid, d.size);
    expect(axesOf(d, defaultSymmetry())).toEqual({ x: size.width / 2, y: size.height / 2 });
    expect(axesOf(d, { ...defaultSymmetry(), axisX: 250 }).x).toBe(250);
  });
});

describe('Spiegeln', () => {
  it('setzt die Kopie gegenüber der Achse', () => {
    const d = doc();
    const kopien = symmetryCopies(d, [prop(d, 100, 300)], {
      ...defaultSymmetry(),
      vertical: true,
      axisX: 500,
    });
    expect(kopien).toHaveLength(1);
    expect(kopien[0].x).toBe(900);
    expect(kopien[0].y).toBe(300);
  });

  /**
   * Ohne mitgespiegelte Drehung zeigt der gespiegelte Karren in dieselbe
   * Richtung wie das Original — die Symmetrie ist dann nur halb da.
   */
  it('spiegelt die Drehung mit', () => {
    const d = doc();
    const senkrecht = symmetryCopies(d, [prop(d, 100, 300, 0.4)], {
      ...defaultSymmetry(),
      vertical: true,
      axisX: 500,
    });
    expect(senkrecht[0].rotation).toBeCloseTo(Math.PI - 0.4, 6);

    const waagerecht = symmetryCopies(d, [prop(d, 100, 300, 0.4)], {
      ...defaultSymmetry(),
      horizontal: true,
      axisY: 500,
    });
    expect(waagerecht[0].rotation).toBeCloseTo(-0.4, 6);
  });

  it('dreht das Prop-Bild um', () => {
    const d = doc();
    const k = symmetryCopies(d, [prop(d, 100, 300)], {
      ...defaultSymmetry(),
      vertical: true,
      axisX: 500,
    })[0] as PropObject;
    expect(k.flipX).toBe(true);
    expect(k.flipY).toBe(false);
  });

  it('spiegelt die Punkte einer Zeichnung um ihren eigenen Ursprung', () => {
    const d = doc();
    const k = symmetryCopies(d, [form(d, 100, 300)], {
      ...defaultSymmetry(),
      vertical: true,
      axisX: 500,
    })[0] as ShapeObject;
    expect(k.points).toEqual([-0, 0, -40, 10]);
  });

  /** Spiegelschrift ist keine Beschriftung: der Text wandert nur. */
  it('dreht Text nicht um', () => {
    const d = doc();
    const k = symmetryCopies(d, [text(d, 100, 300)], {
      ...defaultSymmetry(),
      vertical: true,
      axisX: 500,
    })[0];
    expect(k.x).toBe(900);
    expect(k.rotation).toBe(0.5);
  });

  /**
   * Bei zwei Achsen fehlt sonst die vierte Ecke — und genau die fällt auf.
   */
  it('liefert bei zwei Achsen drei Kopien', () => {
    const d = doc();
    const kopien = symmetryCopies(d, [prop(d, 100, 200)], {
      ...defaultSymmetry(),
      vertical: true,
      horizontal: true,
      axisX: 500,
      axisY: 400,
    });
    expect(kopien.map((k) => [k.x, k.y]).sort()).toEqual(
      [
        [900, 200],
        [100, 600],
        [900, 600],
      ].sort(),
    );
  });

  it('gibt jeder Kopie eine eigene Kennung', () => {
    const d = doc();
    const kopien = symmetryCopies(d, [prop(d, 100, 200)], {
      ...defaultSymmetry(),
      vertical: true,
      horizontal: true,
    });
    const ids = new Set<string>(['p1', ...kopien.map((k: MapObject) => k.id)]);
    expect(ids.size).toBe(kopien.length + 1);
  });
});

describe('Kacheln', () => {
  it('setzt eine Kopie am gegenüberliegenden Rand', () => {
    const d = doc();
    const size = mapPixelSize(d.grid, d.size);
    const kopien = symmetryCopies(d, [prop(d, 10, 400)], { ...defaultSymmetry(), tile: true });
    expect(kopien).toHaveLength(1);
    expect(kopien[0].x).toBeCloseTo(10 + size.width, 6);
  });

  it('setzt in der Ecke drei Kopien', () => {
    const d = doc();
    const kopien = symmetryCopies(d, [prop(d, 10, 10)], { ...defaultSymmetry(), tile: true });
    expect(kopien).toHaveLength(3);
  });

  it('lässt die Mitte in Ruhe', () => {
    const d = doc();
    const size = mapPixelSize(d.grid, d.size);
    expect(
      symmetryCopies(d, [prop(d, size.width / 2, size.height / 2)], {
        ...defaultSymmetry(),
        tile: true,
      }),
    ).toEqual([]);
  });
});
