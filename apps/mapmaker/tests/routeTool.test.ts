/**
 * Reiserouten-Werkzeug.
 *
 * Die Rechnung steht in `tests/routeMarks.test.ts`; hier geht es um den Weg
 * vom Klick zum Objekt — und um die Antwort, für die man eine Route zeichnet.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { RouteTool } from '@/tools/route';
import { createDocument } from '@/model/document';
import { getLanguage, setLanguage } from '@/i18n';
import { useEditor } from '@/model/store';
import type { MapDocument, ShapeObject } from '@/model/types';
import { pointerEvent, toolHarness } from './toolContext';

const vorher = getLanguage();
beforeAll(() => setLanguage('de'));
afterAll(() => setLanguage(vorher));

/** Karte: ein Feld = 100 px = 10 km. */
function karte(): MapDocument {
  const doc = createDocument(30, 30);
  doc.grid.tileSize = 100;
  doc.grid.snap = 'none';
  doc.grid.distance = { perTile: 10, unit: 'km', metric: 'euclidean' };
  return doc;
}

const RECHTS = { button: 2, buttons: 2 };

function routen(doc: MapDocument): ShapeObject[] {
  return Object.values(doc.objects).filter(
    (o): o is ShapeObject => o.kind === 'shape' && !!o.route,
  );
}

beforeEach(() => {
  useEditor.setState({
    route: { perDay: 40, marks: true, color: 0x8b3a2f, width: 6 },
    statusMessage: null,
  });
});

describe('RouteTool', () => {
  it('legt aus drei Klicks eine Route an', () => {
    const h = toolHarness(karte());
    const werkzeug = new RouteTool();

    werkzeug.onPointerDown(pointerEvent(0, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(500, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(500, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(500, 400), h.ctx);
    werkzeug.onPointerDown(pointerEvent(500, 400), h.ctx);
    werkzeug.onPointerDown(pointerEvent(500, 400, RECHTS), h.ctx);

    const alle = routen(h.doc);
    expect(alle).toHaveLength(1);
    // Punkte liegen relativ zum ersten — der Anker der Zeichnung.
    expect(alle[0].points).toEqual([0, 0, 500, 0, 500, 400]);
    expect(alle[0].route).toEqual({ perDay: 40, marks: true });
    expect(alle[0].closed).toBe(false);
    expect(h.labels).toEqual(['Reiseroute zeichnen']);
  });

  it('nennt Strecke und Tage in der Statuszeile', () => {
    const h = toolHarness(karte());
    const werkzeug = new RouteTool();

    // 1000 px = 10 Felder = 100 km; bei 40 km am Tag sind das drei Tage.
    werkzeug.onPointerDown(pointerEvent(0, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(1000, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(1000, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(1000, 0, RECHTS), h.ctx);

    expect(useEditor.getState().statusMessage).toBe('Route: 100 km, 3 Tagesmärsche.');
  });

  it('kennt die Einzahl', () => {
    const h = toolHarness(karte());
    const werkzeug = new RouteTool();
    werkzeug.onPointerDown(pointerEvent(0, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(300, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(300, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(300, 0, RECHTS), h.ctx);

    expect(useEditor.getState().statusMessage).toMatch(/ein Tagesmarsch/);
  });

  it('nimmt mit der Rücktaste den letzten Punkt zurück', () => {
    const h = toolHarness(karte());
    const werkzeug = new RouteTool();

    werkzeug.onPointerDown(pointerEvent(0, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(500, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(500, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(500, 400), h.ctx);
    werkzeug.onPointerDown(pointerEvent(500, 400), h.ctx);
    werkzeug.onKeyDown?.({ key: 'Backspace' } as KeyboardEvent, h.ctx);
    werkzeug.onKeyDown?.({ key: 'Enter' } as KeyboardEvent, h.ctx);

    expect(routen(h.doc)[0].points).toEqual([0, 0, 500, 0]);
  });

  it('bricht mit Esc ab, ohne etwas anzulegen', () => {
    const h = toolHarness(karte());
    const werkzeug = new RouteTool();

    werkzeug.onPointerDown(pointerEvent(0, 0), h.ctx);
    werkzeug.onPointerMove(pointerEvent(500, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(500, 0), h.ctx);
    werkzeug.onKeyDown?.({ key: 'Escape' } as KeyboardEvent, h.ctx);

    expect(routen(h.doc)).toEqual([]);
    expect(h.befehle).toEqual([]);
  });

  it('legt aus einem einzelnen Klick nichts an', () => {
    const h = toolHarness(karte());
    const werkzeug = new RouteTool();
    werkzeug.onPointerDown(pointerEvent(0, 0), h.ctx);
    werkzeug.onPointerDown(pointerEvent(0, 0, RECHTS), h.ctx);
    expect(routen(h.doc)).toEqual([]);
  });

  it('zeichnet nicht auf eine gesperrte Ebene', () => {
    const doc = karte();
    doc.layers[doc.rootLayers[0]].locked = true;
    const h = toolHarness(doc);
    useEditor.setState({ activeLayerId: doc.rootLayers[0] });

    new RouteTool().onPointerDown(pointerEvent(0, 0), h.ctx);
    expect(h.befehle).toEqual([]);
    expect(useEditor.getState().statusMessage).toBeTruthy();
  });
});
