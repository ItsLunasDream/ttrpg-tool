import { describe, expect, it } from 'vitest';
import {
  hasEditablePointCount,
  insertPoint,
  minPoints,
  movePoint,
  pathNodes,
  pickNode,
  removePoint,
} from '@/model/pathEdit';
import type { ShapeObject } from '@/model/types';

function shape(patch: Partial<ShapeObject> = {}): ShapeObject {
  return {
    id: 's',
    kind: 'shape',
    layerId: 'l',
    x: 100,
    y: 100,
    rotation: 0,
    opacity: 1,
    z: 0,
    locked: false,
    shape: 'polygon',
    points: [0, 0, 100, 0, 100, 100],
    closed: true,
    blend: 'normal',
    stroke: { color: 0, width: 2, alpha: 1, dash: [] },
    fill: null,
    ...patch,
  };
}

describe('pathNodes', () => {
  it('rechnet die lokalen Punkte auf Weltkoordinaten um', () => {
    expect(pathNodes(shape()).map((n) => [n.x, n.y])).toEqual([
      [100, 100],
      [200, 100],
      [200, 200],
    ]);
  });

  it('dreht sie mit dem Objekt mit', () => {
    const gedreht = shape({ x: 0, y: 0, rotation: Math.PI / 2, points: [10, 0] });
    const [node] = pathNodes(gedreht);
    expect(node.x).toBeCloseTo(0);
    expect(node.y).toBeCloseTo(10);
  });
});

describe('pickNode', () => {
  it('findet den Punkt unter dem Zeiger', () => {
    expect(pickNode(shape(), 202, 101, 9)?.index).toBe(1);
  });

  it('greift nicht über die Toleranz hinaus', () => {
    expect(pickNode(shape(), 260, 100, 9)).toBeNull();
  });
});

describe('movePoint', () => {
  it('setzt den Punkt auf die Weltkoordinate', () => {
    const punkte = movePoint(shape(), 1, 300, 150)!;
    expect(punkte).toEqual([0, 0, 200, 50, 100, 100]);
  });

  it('rechnet die Drehung heraus', () => {
    // Objekt um 90° gedreht: die Weltkoordinate (0, 10) ist lokal (10, 0).
    const gedreht = shape({ x: 0, y: 0, rotation: Math.PI / 2, points: [0, 0] });
    const punkte = movePoint(gedreht, 0, 0, 10)!;
    expect(punkte[0]).toBeCloseTo(10);
    expect(punkte[1]).toBeCloseTo(0);
  });

  it('gibt null bei einem Punkt, den es nicht gibt', () => {
    expect(movePoint(shape(), 7, 0, 0)).toBeNull();
  });

  it('lässt das Objekt unangetastet', () => {
    const obj = shape();
    const vorher = [...obj.points];
    movePoint(obj, 0, 500, 500);
    expect(obj.points).toEqual(vorher);
  });
});

describe('insertPoint', () => {
  it('setzt einen Punkt mitten auf die getroffene Kante', () => {
    // Kante 0 läuft von (100,100) nach (200,100) in Weltkoordinaten.
    const ergebnis = insertPoint(shape(), 150, 101, 9)!;
    expect(ergebnis.index).toBe(1);
    expect(ergebnis.points).toEqual([0, 0, 50, 0, 100, 0, 100, 100]);
  });

  it('kennt bei geschlossenen Formen auch die Kante zurück zum Anfang', () => {
    // Von (200,200) zurück nach (100,100): die Mitte liegt bei (150,150).
    const ergebnis = insertPoint(shape(), 150, 150, 9)!;
    expect(ergebnis.index).toBe(3);
    expect(ergebnis.points.slice(-2)).toEqual([50, 50]);
  });

  it('lässt eine offene Form dort in Ruhe', () => {
    expect(insertPoint(shape({ closed: false }), 150, 150, 9)).toBeNull();
  });

  it('greift nicht neben der Form', () => {
    // (150, 175) ist lokal (50, 75) und liegt gut 17 px von der Schlusskante
    // entfernt — die läuft diagonal, nicht waagerecht.
    expect(insertPoint(shape(), 150, 175, 9)).toBeNull();
  });

  it('fasst Rechteck und Ellipse nicht an', () => {
    const rechteck = shape({ shape: 'rect', points: [0, 0, 100, 100], closed: true });
    expect(insertPoint(rechteck, 150, 100, 9)).toBeNull();
    expect(hasEditablePointCount('rect')).toBe(false);
    expect(hasEditablePointCount('ellipse')).toBe(false);
  });
});

describe('removePoint', () => {
  it('nimmt den Punkt heraus', () => {
    expect(removePoint(shape({ points: [0, 0, 10, 0, 10, 10, 0, 10] }), 1)).toEqual([
      0, 0, 10, 10, 0, 10,
    ]);
  });

  it('verweigert den letzten Punkt, den die Form noch braucht', () => {
    // Ein Dreieck ohne dritte Ecke wäre keine Fläche mehr.
    expect(removePoint(shape(), 0)).toBeNull();
    expect(minPoints('polygon')).toBe(3);
  });

  it('lässt einem Linienzug seine zwei Punkte', () => {
    const linie = shape({ shape: 'line', points: [0, 0, 10, 0], closed: false });
    expect(removePoint(linie, 0)).toBeNull();
    expect(removePoint(shape({ shape: 'line', points: [0, 0, 10, 0, 20, 0] }), 0)).toEqual([
      10, 0, 20, 0,
    ]);
  });

  it('fasst Rechteck und Ellipse nicht an', () => {
    const ellipse = shape({ shape: 'ellipse', points: [0, 0, 50, 50] });
    expect(removePoint(ellipse, 0)).toBeNull();
  });
});
