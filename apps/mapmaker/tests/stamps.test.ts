import { describe, expect, it } from 'vitest';
import { createStamp, instantiateStamp, stampBounds } from '@/model/stamps';
import type { MapObject } from '@/model/types';

const basis = {
  layerId: 'alt',
  rotation: 0,
  opacity: 1,
  locked: false,
  groupId: null,
};

const prop = (id: string, x: number, y: number, z = 0): MapObject => ({
  ...basis,
  id,
  kind: 'prop',
  propId: 'stuhl',
  x,
  y,
  z,
  scaleX: 1,
  scaleY: 1,
  tint: null,
  flipX: false,
  flipY: false,
  seed: 4242,
});

const shape = (id: string, x: number, y: number, points: number[]): MapObject => ({
  ...basis,
  id,
  kind: 'shape',
  x,
  y,
  z: 0,
  shape: 'polygon',
  points,
  closed: true,
  blend: 'normal',
  stroke: { color: 0, width: 4, alpha: 1, dash: [] },
  fill: null,
});

describe('stampBounds', () => {
  it('zieht die Punkte einer Zeichnung mit ein', () => {
    const box = stampBounds([shape('s', 100, 100, [0, 0, 50, 20])]);
    expect(box).toEqual({ minX: 100, minY: 100, maxX: 150, maxY: 120 });
  });

  it('dreht die Punkte mit dem Objekt', () => {
    const gedreht = shape('s', 0, 0, [0, 0, 10, 0]);
    gedreht.rotation = Math.PI / 2;
    const box = stampBounds([gedreht])!;
    expect(box.maxY).toBeCloseTo(10);
    expect(box.maxX).toBeCloseTo(0);
  });

  it('gibt null ohne Objekte', () => {
    expect(stampBounds([])).toBeNull();
  });
});

describe('createStamp', () => {
  it('bezieht die Objekte auf die Mitte der Anordnung', () => {
    const stamp = createStamp('Sitzecke', [prop('a', 100, 100), prop('b', 300, 200)], 100);
    expect(stamp.objects.map((o) => [o.x, o.y])).toEqual([
      [-100, -50],
      [100, 50],
    ]);
    expect(stamp.width).toBe(200);
    expect(stamp.height).toBe(100);
  });

  it('behält die Reihenfolge und zählt z neu von 0 an', () => {
    const stamp = createStamp('x', [prop('oben', 0, 0, 900), prop('unten', 0, 0, 100)], 100);
    expect(stamp.objects.map((o) => o.id)).toEqual(['unten', 'oben']);
    expect(stamp.objects.map((o) => o.z)).toEqual([0, 1]);
  });

  it('lässt die Vorlage unangetastet', () => {
    const original = prop('a', 100, 100);
    const vorher = structuredClone(original);
    createStamp('x', [original], 100);
    expect(original).toEqual(vorher);
  });

  it('merkt sich die Tile-Größe der Ursprungskarte', () => {
    expect(createStamp('x', [prop('a', 0, 0)], 70).tileSize).toBe(70);
  });
});

describe('instantiateStamp', () => {
  const stamp = () => createStamp('Sitzecke', [prop('a', 0, 0), prop('b', 200, 0)], 100);

  it('setzt die Anordnung mittig unter den Zielpunkt', () => {
    const objekte = instantiateStamp(stamp(), {
      x: 500,
      y: 500,
      layerId: 'neu',
      tileSize: 100,
      z: 10,
    });
    expect(objekte.map((o) => [o.x, o.y])).toEqual([
      [400, 500],
      [600, 500],
    ]);
  });

  it('vergibt frische Kennungen und den Ziel-Layer', () => {
    const objekte = instantiateStamp(stamp(), {
      x: 0,
      y: 0,
      layerId: 'neu',
      tileSize: 100,
      z: 0,
    });
    expect(objekte.every((o) => o.layerId === 'neu')).toBe(true);
    expect(new Set(objekte.map((o) => o.id)).size).toBe(2);
    expect(objekte.some((o) => o.id === 'a' || o.id === 'b')).toBe(false);
  });

  it('zählt z vom übergebenen Wert aufwärts', () => {
    const objekte = instantiateStamp(stamp(), {
      x: 0,
      y: 0,
      layerId: 'l',
      tileSize: 100,
      z: 42,
    });
    expect(objekte.map((o) => o.z)).toEqual([42, 43]);
  });

  it('dreht die ganze Anordnung um den Zielpunkt', () => {
    const objekte = instantiateStamp(stamp(), {
      x: 0,
      y: 0,
      layerId: 'l',
      tileSize: 100,
      z: 0,
      rotation: Math.PI / 2,
    });
    // Aus (-100, 0) und (100, 0) wird (0, -100) und (0, 100).
    expect(objekte[0].x).toBeCloseTo(0);
    expect(objekte[0].y).toBeCloseTo(-100);
    expect(objekte[1].y).toBeCloseTo(100);
    // Und jedes Objekt dreht sich mit.
    expect(objekte[0].rotation).toBeCloseTo(Math.PI / 2);
  });

  it('rechnet die Abstände auf ein anderes Raster um', () => {
    const objekte = instantiateStamp(stamp(), {
      x: 0,
      y: 0,
      layerId: 'l',
      tileSize: 50,
      z: 0,
    });
    // Halbes Raster, halber Abstand — sonst zerfiele die Anordnung.
    expect(objekte.map((o) => o.x)).toEqual([-50, 50]);
  });

  it('lässt die Prop-Größe beim Rasterwechsel in Ruhe', () => {
    // Props werden schon beim Zeichnen mit der Tile-Größe skaliert; sie hier
    // noch einmal zu strecken machte sie doppelt so groß wie gewollt.
    const objekte = instantiateStamp(stamp(), {
      x: 0,
      y: 0,
      layerId: 'l',
      tileSize: 200,
      z: 0,
    });
    expect(objekte.every((o) => o.kind === 'prop' && o.scaleX === 1)).toBe(true);
  });

  it('zieht Zeichnungen beim Rasterwechsel mit', () => {
    const mitFlaeche = createStamp('Raum', [shape('s', 0, 0, [0, 0, 100, 0, 100, 100])], 100);
    const [objekt] = instantiateStamp(mitFlaeche, {
      x: 0,
      y: 0,
      layerId: 'l',
      tileSize: 200,
      z: 0,
    });
    expect(objekt.kind).toBe('shape');
    if (objekt.kind !== 'shape') return;
    expect(objekt.points).toEqual([0, 0, 200, 0, 200, 200]);
    expect(objekt.stroke?.width).toBe(8);
  });

  it('löst die Gruppenzugehörigkeit', () => {
    const gruppiert = prop('a', 0, 0);
    gruppiert.groupId = 'alte-gruppe';
    const [objekt] = instantiateStamp(createStamp('x', [gruppiert], 100), {
      x: 0,
      y: 0,
      layerId: 'l',
      tileSize: 100,
      z: 0,
    });
    expect(objekt.groupId).toBeNull();
  });

  it('lässt sich mehrfach setzen, ohne sich zu verbrauchen', () => {
    const s = stamp();
    const erst = instantiateStamp(s, { x: 0, y: 0, layerId: 'l', tileSize: 100, z: 0 });
    const dann = instantiateStamp(s, { x: 300, y: 0, layerId: 'l', tileSize: 100, z: 0 });
    expect(s.objects.map((o) => o.x)).toEqual([-100, 100]);
    expect(erst[0].x).toBe(-100);
    expect(dann[0].x).toBe(200);
  });
});
