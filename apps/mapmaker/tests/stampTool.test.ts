/**
 * Baustein-Werkzeug.
 *
 * Geprüft wird die Bedienung: was ein Klick auslöst, wenn ein Baustein gewählt
 * ist — und was er *nicht* auslöst, wenn keiner gewählt ist oder der Layer
 * nichts aufnimmt. Die Rechnung dahinter steht in `tests/stamps.test.ts`.
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { StampTool } from '@/tools/stamp';
import { addStamp, resetStamps } from '@/assets/stampStore';
import { createStamp } from '@/model/stamps';
import { createDocument } from '@/model/document';
import { getLanguage, setLanguage } from '@/i18n';
import { useEditor } from '@/model/store';
import type { MapDocument, MapObject } from '@/model/types';
import { pointerEvent, toolHarness } from './toolContext';

const vorher = getLanguage();
beforeAll(() => setLanguage('de'));
afterAll(() => setLanguage(vorher));
afterEach(() => {
  resetStamps();
  useEditor.setState({ activeStampId: null, statusMessage: null });
});

function prop(id: string, x: number, y: number): MapObject {
  return {
    id, kind: 'prop', layerId: 'egal', x, y, rotation: 0, opacity: 1, z: 0,
    locked: false, groupId: null, propId: 'stuhl', scaleX: 1, scaleY: 1,
    tint: null, flipX: false, flipY: false, seed: 7,
  };
}

/** Karte mit einem gesicherten Baustein aus zwei Props. */
function vorbereitet(): { doc: MapDocument; stampId: string } {
  const doc = createDocument(20, 20);
  doc.grid.tileSize = 100;
  doc.grid.snap = 'none';
  const stamp = createStamp('Sitzecke', [prop('a', 0, 0), prop('b', 200, 0)], 100);
  addStamp(stamp);
  return { doc, stampId: stamp.id };
}

describe('StampTool', () => {
  it('setzt die ganze Anordnung als einen Befehl', () => {
    const { doc, stampId } = vorbereitet();
    const h = toolHarness(doc);
    useEditor.setState({ activeStampId: stampId });

    new StampTool().onPointerDown(pointerEvent(500, 500), h.ctx);

    expect(Object.keys(h.doc.objects)).toHaveLength(2);
    expect(h.befehle).toHaveLength(1);
    expect(h.labels).toEqual(['Baustein setzen']);
  });

  it('legt die Objekte auf den aktiven Layer und wählt sie aus', () => {
    const { doc, stampId } = vorbereitet();
    const h = toolHarness(doc);
    useEditor.setState({ activeStampId: stampId });

    new StampTool().onPointerDown(pointerEvent(500, 500), h.ctx);

    const aktiv = useEditor.getState().activeLayerId;
    expect(Object.values(h.doc.objects).every((o) => o.layerId === aktiv)).toBe(true);
    expect(useEditor.getState().selection).toHaveLength(2);
  });

  it('tut ohne gewählten Baustein nichts und sagt es', () => {
    const { doc } = vorbereitet();
    const h = toolHarness(doc);
    useEditor.setState({ activeStampId: null });

    new StampTool().onPointerDown(pointerEvent(500, 500), h.ctx);

    expect(h.befehle).toEqual([]);
    expect(useEditor.getState().statusMessage).toMatch(/Baustein/);
  });

  it('setzt nichts auf einen Layer, der keine Objekte aufnimmt', () => {
    const { doc, stampId } = vorbereitet();
    const h = toolHarness(doc);
    const gesperrt = doc.rootLayers[0];
    doc.layers[gesperrt].locked = true;
    useEditor.setState({ activeStampId: stampId, activeLayerId: gesperrt });

    new StampTool().onPointerDown(pointerEvent(500, 500), h.ctx);

    expect(h.befehle).toEqual([]);
    expect(useEditor.getState().statusMessage).toBeTruthy();
  });

  it('reagiert nicht auf die rechte Maustaste', () => {
    const { doc, stampId } = vorbereitet();
    const h = toolHarness(doc);
    useEditor.setState({ activeStampId: stampId });

    new StampTool().onPointerDown(pointerEvent(500, 500, { button: 2, buttons: 2 }), h.ctx);
    expect(h.befehle).toEqual([]);
  });

  it('überlebt einen Baustein, der inzwischen gelöscht wurde', () => {
    const { doc, stampId } = vorbereitet();
    const h = toolHarness(doc);
    useEditor.setState({ activeStampId: stampId });
    resetStamps();

    expect(() => new StampTool().onPointerDown(pointerEvent(500, 500), h.ctx)).not.toThrow();
    expect(h.befehle).toEqual([]);
  });
});
