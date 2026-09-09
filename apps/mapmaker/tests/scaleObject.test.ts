import { describe, expect, it } from 'vitest';
import { scalePatch } from '@/model/scaleObject';
import type { MapObject } from '@/model/types';

const basis = { layerId: 'l', x: 0, y: 0, rotation: 0, opacity: 1, z: 0, locked: false };

const prop = (): MapObject => ({
  ...basis, id: 'p', kind: 'prop', propId: 'x', scaleX: 2, scaleY: 3,
  tint: null, flipX: false, flipY: false, seed: 1,
});

const shape = (): MapObject => ({
  ...basis, id: 's', kind: 'shape', shape: 'polygon', points: [0, 0, 10, 20], closed: true,
  blend: 'normal', stroke: { color: 0, width: 4, alpha: 1, dash: [] }, fill: null,
});

const text = (): MapObject => ({
  ...basis, id: 't', kind: 'text', text: 'a', fontFamily: 'x', fontSize: 20,
  bold: false, italic: false, color: 0, align: 'left', letterSpacing: 0,
  lineHeight: 1.2, strokeColor: null, strokeWidth: 0,
});

describe('scalePatch', () => {
  it('multipliziert beim Prop den vorhandenen Faktor', () => {
    expect(scalePatch(prop(), 2, 0.5)).toEqual({ scaleX: 4, scaleY: 1.5 });
  });

  it('zieht bei einer Zeichnung die Punkte mit', () => {
    const p = scalePatch(shape(), 2, 3) as { points: number[]; stroke: { width: number } };
    expect(p.points).toEqual([0, 0, 20, 60]);
    // Strichstärke wächst mit dem Mittel beider Achsen.
    expect(p.stroke.width).toBe(10);
  });

  it('lässt eine Zeichnung ohne Strich in Ruhe', () => {
    const ohne = shape();
    if (ohne.kind === 'shape') ohne.stroke = null;
    const p = scalePatch(ohne, 2, 2) as { stroke: unknown };
    expect(p.stroke).toBeNull();
  });

  it('ändert bei Text die Schriftgröße', () => {
    expect(scalePatch(text(), 2, 2)).toEqual({ fontSize: 40 });
    // Ungleiche Achsen: der Mittelwert hält den Text lesbar.
    expect(scalePatch(text(), 1, 3)).toEqual({ fontSize: 40 });
  });

  it('fängt Faktoren ab, die das Objekt unerreichbar klein machen', () => {
    const p = scalePatch(prop(), 0, -5) as { scaleX: number; scaleY: number };
    expect(p.scaleX).toBeGreaterThan(0);
    expect(p.scaleY).toBeGreaterThan(0);
  });

  it('lässt die Schriftgröße nie unter 1 fallen', () => {
    const p = scalePatch(text(), 0.001, 0.001) as { fontSize: number };
    expect(p.fontSize).toBeGreaterThanOrEqual(1);
  });
});
