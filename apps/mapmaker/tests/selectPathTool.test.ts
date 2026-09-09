/**
 * Pfadbearbeitung über das Auswahl-Werkzeug.
 *
 * Die Rechnung dahinter steht in `tests/pathEdit.test.ts`; hier geht es um die
 * Bedienung: welche Geste welchen Befehl auslöst, und ob ein Zug sauber
 * geklammert wird. Genau daran hing der Fehler, der den Editor lahmlegte —
 * Werkzeuge gehören geprüft, nicht nur ihre Mathematik.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getLanguage, setLanguage } from '@/i18n';
import { SelectTool } from '@/tools/select';
import { createDocument } from '@/model/document';
import { useEditor } from '@/model/store';
import type { MapDocument, ShapeObject } from '@/model/types';
import { pointerEvent, toolHarness } from './toolContext';

/** Karte mit einem Dreieck bei (100,100), Kantenlänge 200. */
function karteMitFlaeche(): MapDocument {
  const doc = createDocument(20, 20);
  doc.grid.tileSize = 100;
  doc.grid.snap = 'none';
  const flaeche: ShapeObject = {
    id: 'flaeche',
    kind: 'shape',
    layerId: doc.rootLayers[0],
    x: 100,
    y: 100,
    rotation: 0,
    opacity: 1,
    z: 0,
    locked: false,
    shape: 'polygon',
    points: [0, 0, 200, 0, 200, 200],
    closed: true,
    blend: 'normal',
    stroke: { color: 0, width: 2, alpha: 1, dash: [] },
    fill: null,
  };
  doc.objects[flaeche.id] = flaeche;
  return doc;
}

function punkte(doc: MapDocument): number[] {
  const o = doc.objects['flaeche'];
  return o.kind === 'shape' ? o.points : [];
}

function starteBearbeitung(doc: MapDocument) {
  const h = toolHarness(doc);
  useEditor.setState({ selection: ['flaeche'], editingPathId: 'flaeche' });
  return h;
}

// Befehlsnamen sind übersetzte Oberfläche. Ohne feste Sprache prüfte der Test
// das, was die Umgebung gerade vorgibt — unter Vitest Englisch.
const vorher = getLanguage();
beforeAll(() => setLanguage('de'));
afterAll(() => setLanguage(vorher));

beforeEach(() => {
  useEditor.setState({ tool: 'select', editingPathId: null, selection: [] });
});

describe('Doppelklick', () => {
  it('öffnet die Stützpunkte einer Zeichnung', () => {
    const h = toolHarness(karteMitFlaeche());
    new SelectTool().onDoubleClick?.(pointerEvent(150, 150), h.ctx);
    expect(useEditor.getState().editingPathId).toBe('flaeche');
    expect(useEditor.getState().selection).toEqual(['flaeche']);
  });

  it('lässt ein gesperrtes Objekt in Ruhe', () => {
    const doc = karteMitFlaeche();
    doc.objects['flaeche'].locked = true;
    const h = toolHarness(doc);
    new SelectTool().onDoubleClick?.(pointerEvent(150, 150), h.ctx);
    expect(useEditor.getState().editingPathId).toBeNull();
  });
});

describe('Stützpunkte anfassen', () => {
  it('verschiebt den angefassten Punkt und klammert den Zug', () => {
    const h = starteBearbeitung(karteMitFlaeche());
    const werkzeug = new SelectTool();

    werkzeug.onPointerDown(pointerEvent(100, 100), h.ctx);
    expect(h.transaktionen.begonnen).toBe(1);

    werkzeug.onPointerMove(pointerEvent(60, 40), h.ctx);
    werkzeug.onPointerUp(pointerEvent(60, 40), h.ctx);

    // Weltpunkt (60,40) ist beim Anker (100,100) lokal (-40,-60).
    expect(punkte(h.doc).slice(0, 2)).toEqual([-40, -60]);
    expect(h.transaktionen.beendet).toBe(1);
    expect(h.labels).toContain('Stützpunkt verschieben');
  });

  it('fügt auf einer Kante einen Punkt ein und zieht ihn gleich weiter', () => {
    const h = starteBearbeitung(karteMitFlaeche());
    const werkzeug = new SelectTool();

    // Mitte der ersten Kante: Welt (200,100).
    werkzeug.onPointerDown(pointerEvent(200, 100), h.ctx);
    expect(punkte(h.doc)).toHaveLength(8);
    expect(h.labels).toContain('Stützpunkt einfügen');

    werkzeug.onPointerMove(pointerEvent(200, 40), h.ctx);
    werkzeug.onPointerUp(pointerEvent(200, 40), h.ctx);
    expect(punkte(h.doc).slice(2, 4)).toEqual([100, -60]);
  });

  it('entfernt einen Punkt mit Alt+Klick', () => {
    const doc = karteMitFlaeche();
    // Vier Ecken, damit noch eine Fläche übrig bleibt.
    (doc.objects['flaeche'] as ShapeObject).points = [0, 0, 200, 0, 200, 200, 0, 200];
    const h = starteBearbeitung(doc);

    new SelectTool().onPointerDown(pointerEvent(300, 100, { alt: true }), h.ctx);
    expect(punkte(h.doc)).toEqual([0, 0, 200, 200, 0, 200]);
    expect(h.labels).toContain('Stützpunkt entfernen');
  });

  it('weist den letzten Punkt ab, den die Form noch braucht', () => {
    const h = starteBearbeitung(karteMitFlaeche());
    new SelectTool().onPointerDown(pointerEvent(100, 100, { alt: true }), h.ctx);

    expect(punkte(h.doc)).toHaveLength(6);
    expect(h.labels).toEqual([]);
    expect(useEditor.getState().statusMessage).toMatch(/Punkte|points/i);
  });

  it('beendet die Bearbeitung bei einem Klick daneben', () => {
    const h = starteBearbeitung(karteMitFlaeche());
    new SelectTool().onPointerDown(pointerEvent(1500, 1500), h.ctx);
    expect(useEditor.getState().editingPathId).toBeNull();
  });

  it('beendet sie auch mit Escape', () => {
    const h = starteBearbeitung(karteMitFlaeche());
    const werkzeug = new SelectTool();
    // KeyboardEvent gibt es im Node-Lauf nicht; das Werkzeug liest nur `key`.
    const verbraucht = werkzeug.onKeyDown?.({ key: 'Escape' } as KeyboardEvent, h.ctx);
    expect(verbraucht).toBe(true);
    expect(useEditor.getState().editingPathId).toBeNull();
  });

  it('gibt die Bearbeitung auf, wenn etwas anderes ausgewählt wird', () => {
    starteBearbeitung(karteMitFlaeche());
    useEditor.getState().setSelection(['etwas-anderes']);
    expect(useEditor.getState().editingPathId).toBeNull();
  });
});

describe('Gesperrte Ebene', () => {
  it('lässt eine bestehende Auswahl nicht mehr ziehen', () => {
    const doc = karteMitFlaeche();
    const h = toolHarness(doc);
    // Auswahl entsteht, *dann* wird gesperrt — der Weg, auf dem das Schloss
    // vorher wirkungslos war.
    useEditor.setState({ selection: ['flaeche'] });
    doc.layers[doc.objects['flaeche'].layerId].locked = true;

    const werkzeug = new SelectTool();
    werkzeug.onPointerDown(pointerEvent(150, 150), h.ctx);
    werkzeug.onPointerMove(pointerEvent(400, 400), h.ctx);
    werkzeug.onPointerUp(pointerEvent(400, 400), h.ctx);

    expect(h.doc.objects['flaeche'].x).toBe(100);
    expect(h.doc.objects['flaeche'].y).toBe(100);
  });

  it('öffnet die Stützpunkte einer Zeichnung auf ihr nicht', () => {
    const doc = karteMitFlaeche();
    const h = toolHarness(doc);
    doc.layers[doc.objects['flaeche'].layerId].locked = true;

    new SelectTool().onDoubleClick?.(pointerEvent(150, 150), h.ctx);
    expect(useEditor.getState().editingPathId).toBeNull();
  });

  it('bricht eine laufende Pfadbearbeitung ab, wenn die Ebene gesperrt wird', () => {
    const doc = karteMitFlaeche();
    const h = starteBearbeitung(doc);
    doc.layers[doc.objects['flaeche'].layerId].locked = true;

    new SelectTool().onPointerDown(pointerEvent(100, 100), h.ctx);

    expect(useEditor.getState().editingPathId).toBeNull();
    expect(punkte(h.doc)).toEqual([0, 0, 200, 0, 200, 200]);
  });
});
