import { describe, expect, it } from 'vitest';
import {
  allowsNonUniformScale,
  rotateAroundCenterPatch,
  rotateGroupPatch,
  scaleGroupPatch,
} from '@/model/groupTransform';
import { localCenterOffset, objectCenter } from '@/engine/hitTest';
import type { MapObject, PropObject, ShapeObject } from '@/model/types';

function prop(over: Partial<PropObject> = {}): PropObject {
  return {
    id: 'p1',
    kind: 'prop',
    layerId: 'l',
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    z: 0,
    locked: false,
    propId: 'stone_small',
    scaleX: 1,
    scaleY: 1,
    tint: null,
    flipX: false,
    flipY: false,
    seed: 1,
    ...over,
  };
}

const MITTE = { x: 100, y: 100 };

describe('Gruppe drehen', () => {
  it('dreht jedes Objekt und führt es auf seiner Kreisbahn mit', () => {
    const objekte: MapObject[] = [prop({ id: 'a', x: 200, y: 100 })];
    const patches = rotateGroupPatch(objekte, MITTE, Math.PI / 2);
    const p = patches.get('a')!;
    expect(p.x as number).toBeCloseTo(100, 6);
    expect(p.y as number).toBeCloseTo(200, 6);
    expect(p.rotation as number).toBeCloseTo(Math.PI / 2, 6);
  });

  it('ein Objekt im Mittelpunkt bleibt liegen und dreht sich nur', () => {
    const patches = rotateGroupPatch([prop({ id: 'a', x: 100, y: 100 })], MITTE, 0.7);
    const p = patches.get('a')!;
    expect(p.x as number).toBeCloseTo(100, 6);
    expect(p.y as number).toBeCloseTo(100, 6);
    expect(p.rotation as number).toBeCloseTo(0.7, 6);
  });

  it('die Abstände zueinander bleiben erhalten', () => {
    const a = prop({ id: 'a', x: 60, y: 100 });
    const b = prop({ id: 'b', x: 140, y: 100 });
    const patches = rotateGroupPatch([a, b], MITTE, 1.1);
    const pa = patches.get('a')!;
    const pb = patches.get('b')!;
    const d = Math.hypot((pa.x as number) - (pb.x as number), (pa.y as number) - (pb.y as number));
    expect(d).toBeCloseTo(80, 6);
  });

  it('eine volle Umdrehung führt zurück an den Anfang', () => {
    const patches = rotateGroupPatch([prop({ id: 'a', x: 175, y: 40 })], MITTE, Math.PI * 2);
    const p = patches.get('a')!;
    expect(p.x as number).toBeCloseTo(175, 6);
    expect(p.y as number).toBeCloseTo(40, 6);
  });
});

describe('Gruppe skalieren', () => {
  it('rückt die Objekte auseinander und vergrößert sie', () => {
    const patches = scaleGroupPatch([prop({ id: 'a', x: 150, y: 100 })], MITTE, 2, 2);
    const p = patches.get('a')!;
    expect(p.x as number).toBeCloseTo(200, 6);
    expect(p.y as number).toBeCloseTo(100, 6);
    expect(p.scaleX as number).toBeCloseTo(2, 6);
    expect(p.scaleY as number).toBeCloseTo(2, 6);
  });

  it('skaliert x und y getrennt, solange nichts gedreht ist', () => {
    const patches = scaleGroupPatch([prop({ id: 'a', x: 150, y: 150 })], MITTE, 2, 3);
    const p = patches.get('a')!;
    expect(p.x as number).toBeCloseTo(200, 6);
    expect(p.y as number).toBeCloseTo(250, 6);
    expect(p.scaleX as number).toBeCloseTo(2, 6);
    expect(p.scaleY as number).toBeCloseTo(3, 6);
  });

  /**
   * Der eigentliche Grund für `allowsNonUniformScale`: ein gedrehtes Objekt
   * ungleich zu skalieren hieße, es zu scheren — und Scherung kann das Modell
   * nicht ausdrücken. Statt still etwas Falsches zu rechnen, wird gemittelt.
   */
  it('fällt auf gleichmäßig zurück, sobald ein Mitglied gedreht ist', () => {
    const objekte = [prop({ id: 'a', x: 150, y: 150, rotation: 0.5 })];
    expect(allowsNonUniformScale(objekte)).toBe(false);
    const p = scaleGroupPatch(objekte, MITTE, 2, 4)!.get('a')!;
    expect(p.scaleX as number).toBeCloseTo(3, 6);
    expect(p.scaleY as number).toBeCloseTo(3, 6);
    // Auch die Lage folgt dem gemittelten Faktor, sonst zerfiele die Gruppe.
    expect(p.x as number).toBeCloseTo(250, 6);
    expect(p.y as number).toBeCloseTo(250, 6);
  });

  it('ungedrehte Mitglieder erlauben ungleichmäßiges Skalieren', () => {
    expect(allowsNonUniformScale([prop({ id: 'a' }), prop({ id: 'b' })])).toBe(true);
  });

  /**
   * Lage und Größe müssen denselben geklemmten Faktor sehen. Täten sie es
   * nicht, rückten die Objekte weiter zusammen, als sie schrumpfen — die
   * Gruppe fiele beim Verkleinern in sich zusammen.
   */
  it('Lage und Größe benutzen denselben Mindestfaktor', () => {
    const p = scaleGroupPatch([prop({ id: 'a', x: 200, y: 100 })], MITTE, 0, 0)!.get('a')!;
    expect(p.scaleX as number).toBeCloseTo(0.02, 6);
    expect(p.x as number).toBeCloseTo(100 + 100 * 0.02, 6);
  });

  it('Formen ziehen ihre Punkte mit', () => {
    const form: MapObject = {
      id: 's',
      kind: 'shape',
      layerId: 'l',
      x: 150,
      y: 100,
      rotation: 0,
      opacity: 1,
      z: 0,
      locked: false,
      shape: 'rect',
      points: [0, 0, 40, 20],
      closed: true,
      blend: 'normal',
      stroke: null,
      fill: null,
    };
    const p = scaleGroupPatch([form], MITTE, 2, 2)!.get('s')!;
    expect(p.points).toEqual([0, 0, 80, 40]);
    expect(p.x as number).toBeCloseTo(200, 6);
  });
});

describe('ein einzelnes Objekt um seine Mitte drehen', () => {
  /*
   * Aus dem Gebrauch: eine mit dem Terrain-Pinsel gemalte Flaeche drehte sich
   * um die Ecke, an der der Strich begann, und wanderte dabei quer ueber die
   * Karte. Grund war, dass beim Drehen nur `rotation` gesetzt wurde — in der
   * Anzeige dreht das um den Ursprung, und der liegt bei einer Zeichnung am
   * Anfang des Striches, nicht in der Mitte.
   */
  function flaeche(over: Partial<ShapeObject> = {}): ShapeObject {
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
      points: [0, 0, 40, 0, 40, 20, 0, 20],
      closed: true,
      blend: 'normal',
      stroke: null,
      fill: null,
      ...over,
    };
  }

  it('die Mitte bleibt stehen, der Ursprung weicht zurueck', () => {
    const f = flaeche();
    const mitte = objectCenter({} as never, f);
    expect(mitte).toEqual({ x: 120, y: 110 });

    const p = rotateAroundCenterPatch(localCenterOffset(f), mitte, Math.PI / 2);
    // Gedreht wird um 90 Grad: der lokale Versatz (20|10) zeigt danach nach
    // unten, der Ursprung muss also nach rechts oben wandern.
    expect(p.x as number).toBeCloseTo(130, 6);
    expect(p.y as number).toBeCloseTo(90, 6);

    const gedreht = flaeche({ ...(p as Partial<ShapeObject>) });
    expect(objectCenter({} as never, gedreht).x).toBeCloseTo(mitte.x, 6);
    expect(objectCenter({} as never, gedreht).y).toBeCloseTo(mitte.y, 6);
  });

  it('eine volle Umdrehung laesst das Objekt, wo es war', () => {
    const f = flaeche({ x: -37, y: 12 });
    const mitte = objectCenter({} as never, f);
    const p = rotateAroundCenterPatch(localCenterOffset(f), mitte, Math.PI * 2);
    expect(p.x as number).toBeCloseTo(f.x, 6);
    expect(p.y as number).toBeCloseTo(f.y, 6);
  });

  it('bei einem Prop aendert sich nur die Drehung', () => {
    const p1 = prop({ x: 50, y: 70 });
    const mitte = objectCenter({} as never, p1);
    const p = rotateAroundCenterPatch(localCenterOffset(p1), mitte, 1.234);
    expect(p.x as number).toBeCloseTo(50, 6);
    expect(p.y as number).toBeCloseTo(70, 6);
    expect(p.rotation).toBe(1.234);
  });
});
