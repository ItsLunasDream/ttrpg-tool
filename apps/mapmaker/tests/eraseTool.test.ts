/**
 * Radiergummi-Werkzeug.
 *
 * Die Rechnung steht in `tests/eraseStroke.test.ts`; hier geht es darum, was
 * ein Radierstrich am Dokument tut — und was er in Ruhe lässt.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { EraseTool } from '@/tools/erase';
import { createDocument } from '@/model/document';
import { getLanguage, setLanguage } from '@/i18n';
import { useEditor } from '@/model/store';
import type { MapDocument, ShapeObject } from '@/model/types';
import { pointerEvent, toolHarness } from './toolContext';

const vorher = getLanguage();
beforeAll(() => setLanguage('de'));
afterAll(() => setLanguage(vorher));

function strich(id: string, patch: Partial<ShapeObject> = {}): ShapeObject {
  return {
    id,
    kind: 'shape',
    layerId: 'egal',
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    z: 0,
    locked: false,
    groupId: null,
    shape: 'freehand',
    points: [0, 0, 400, 0],
    closed: false,
    blend: 'normal',
    stroke: { color: 0, width: 4, alpha: 1, dash: [] },
    fill: null,
    ...patch,
  };
}

function karteMit(...objekte: ShapeObject[]): MapDocument {
  const doc = createDocument(20, 20);
  doc.grid.tileSize = 100;
  for (const o of objekte) doc.objects[o.id] = { ...o, layerId: doc.rootLayers[0] };
  return doc;
}

function formen(doc: MapDocument): ShapeObject[] {
  return Object.values(doc.objects).filter((o): o is ShapeObject => o.kind === 'shape');
}

beforeEach(() => {
  useEditor.setState({ erase: { radius: 25 }, statusMessage: null });
});

describe('EraseTool', () => {
  it('zerlegt einen Strich, der mittig getroffen wird, in zwei', () => {
    const h = toolHarness(karteMit(strich('s')));
    const werkzeug = new EraseTool();

    werkzeug.onPointerDown(pointerEvent(200, 0), h.ctx);
    werkzeug.onPointerUp(pointerEvent(200, 0), h.ctx);

    const teile = formen(h.doc);
    expect(teile).toHaveLength(2);
    expect(teile.map((o) => o.points).sort((a, b) => a[0] - b[0])).toEqual([
      [0, 0, 175, 0],
      [225, 0, 400, 0],
    ]);
    // Der erste Teil behält die Kennung des Originals.
    expect(teile.some((o) => o.id === 's')).toBe(true);
  });

  it('macht einen ganzen Strich zu einem Rückgängig-Schritt', () => {
    const h = toolHarness(karteMit(strich('s')));
    const werkzeug = new EraseTool();

    werkzeug.onPointerDown(pointerEvent(100, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(200, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(300, 0), h.ctx);
    werkzeug.onPointerUp(pointerEvent(300, 0), h.ctx);

    // Mehrere Befehle, aber alle mit demselben mergeKey — die History fasst
    // sie zusammen, sobald sie geklammert ausgeführt werden.
    expect(h.befehle.every((c) => c.mergeKey === 'erase')).toBe(true);
    expect(h.transaktionen).toEqual({ begonnen: 1, beendet: 1 });
  });

  it('nimmt einen Strich ganz weg, wenn nichts übrig bleibt', () => {
    const h = toolHarness(karteMit(strich('s', { points: [0, 0, 20, 0] })));
    const werkzeug = new EraseTool();

    werkzeug.onPointerDown(pointerEvent(10, 0), h.ctx);
    werkzeug.onPointerUp(pointerEvent(10, 0), h.ctx);

    expect(formen(h.doc)).toHaveLength(0);
  });

  it('lässt Rechteck und Ellipse in Ruhe und sagt, warum', () => {
    const h = toolHarness(
      karteMit(strich('r', { shape: 'rect', points: [0, 0, 200, 200], closed: true })),
    );
    new EraseTool().onPointerDown(pointerEvent(100, 100), h.ctx);

    expect(formen(h.doc)[0].points).toEqual([0, 0, 200, 200]);
    expect(useEditor.getState().statusMessage).toMatch(/Rechtecke/);
  });

  it('lässt eine Fläche ohne Strich in Ruhe — übrig bliebe nichts Sichtbares', () => {
    const flaeche = strich('f', {
      shape: 'polygon',
      points: [0, 0, 200, 0, 200, 200],
      closed: true,
      stroke: null,
      fill: { color: 0x336699, alpha: 1, gradient: null, pattern: null },
    });
    const h = toolHarness(karteMit(flaeche));
    new EraseTool().onPointerDown(pointerEvent(100, 10), h.ctx);

    expect(formen(h.doc)[0].points).toEqual([0, 0, 200, 0, 200, 200]);
    expect(h.befehle).toEqual([]);
  });

  it('fasst nichts an, was auf einer gesperrten Ebene liegt', () => {
    const doc = karteMit(strich('s'));
    doc.layers[doc.rootLayers[0]].locked = true;
    const h = toolHarness(doc);

    new EraseTool().onPointerDown(pointerEvent(200, 0), h.ctx);
    expect(formen(h.doc)[0].points).toEqual([0, 0, 400, 0]);
  });

  it('rechnet die Drehung des Objekts heraus', () => {
    // Um 90° gedrehter Strich: er läuft in der Welt nach unten, nicht nach
    // rechts. Der Radierpunkt muss dort treffen, wo der Strich *liegt*.
    const h = toolHarness(karteMit(strich('s', { rotation: Math.PI / 2 })));
    new EraseTool().onPointerDown(pointerEvent(0, 200), h.ctx);

    const teile = formen(h.doc);
    expect(teile).toHaveLength(2);
    expect(teile[0].points).toEqual([0, 0, 175, 0]);
  });
});

describe('EraseStrokes im Verlauf', () => {
  it('führt ein Rückgängig auch für Objekte zurück, die der Strich erst später trifft', () => {
    // Der Strich beginnt auf dem einen Zug und wandert auf den zweiten. Der
    // verschmolzene Befehl muss beide Ausgangsstände tragen — sonst löscht das
    // Rückgängig den zweiten, statt ihn wiederherzustellen.
    const doc = karteMit(strich('a'), strich('b', { y: 300 }));
    const h = toolHarness(doc);
    const werkzeug = new EraseTool();

    werkzeug.onPointerDown(pointerEvent(200, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(200, 300), h.ctx);
    werkzeug.onPointerUp(pointerEvent(200, 300), h.ctx);

    expect(formen(h.doc)).toHaveLength(4);

    // Alle Befehle des Strichs in einen zusammenfassen, wie es die History
    // über den mergeKey tut, und dann zurücknehmen.
    const [erster, ...weitere] = h.befehle;
    for (const cmd of weitere) erster.absorb?.(cmd);
    erster.undo(h.doc);

    const zurueck = formen(h.doc);
    expect(zurueck).toHaveLength(2);
    expect(zurueck.map((o) => o.points)).toEqual([
      [0, 0, 400, 0],
      [0, 0, 400, 0],
    ]);
  });
});

describe('Weg zwischen zwei Zeigerereignissen', () => {
  it('radiert durchgehend statt nur an den gemeldeten Stellen', () => {
    // Zwei Ereignisse, 300 Einheiten auseinander, Radius 25: ohne das Ablaufen
    // des Weges blieben dazwischen Inseln stehen.
    const h = toolHarness(karteMit(strich('s', { points: [0, 0, 600, 0] })));
    const werkzeug = new EraseTool();

    werkzeug.onPointerDown(pointerEvent(150, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(450, 0), h.ctx);
    werkzeug.onPointerUp(pointerEvent(450, 0), h.ctx);

    // Nach dem Startpunkt sortiert: die Reihenfolge im Dokument hängt daran,
    // welches Stück die Kennung des Originals behält.
    const teile = formen(h.doc)
      .map((o) => o.points)
      .sort((a, b) => a[0] - b[0]);
    expect(teile).toEqual([
      [0, 0, 125, 0],
      [475, 0, 600, 0],
    ]);
  });
});
