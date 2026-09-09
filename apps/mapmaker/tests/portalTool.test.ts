/**
 * Tür- und Fenster-Werkzeug.
 *
 * Beide sind dasselbe Werkzeug mit verschiedener Art. Genau daran ist ein
 * Fehler entstanden: die Griffe auf *vorhandene* Elemente fragten immer nach
 * Türen, gleich welche Art gewählt war. In einer Hauswand mit Tür und Fenster
 * nebeneinander setzte das Fenster-Werkzeug damit kein Fenster, sondern
 * schaltete die Tür auf.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { PortalTool } from '@/tools/portal';
import { createDocument } from '@/model/document';
import { useEditor } from '@/model/store';
import type { MapDocument } from '@/model/types';
import { pointerEvent, toolHarness } from './toolContext';

/** Karte mit einer waagerechten Wand und einer Tür darin. */
function karteMitTuer(): MapDocument {
  const doc = createDocument(20, 20);
  doc.grid.tileSize = 100;
  doc.vtt.walls = [
    { id: 'w1', points: [0, 500, 1000, 500], type: 'normal', closed: false },
    { id: 'fenster', points: [1200, 500, 1400, 500], type: 'window', closed: false },
  ];
  doc.vtt.portals = [
    { id: 'tuer', bounds: [200, 500, 300, 500], closed: true, freestanding: false },
  ];
  return doc;
}

const RECHTS = { button: 2, buttons: 2 };

beforeEach(() => {
  useEditor.setState({ tool: 'select' });
});

describe('Fenster-Werkzeug', () => {
  it('schaltet keine Tür um, sondern beginnt ein Fenster', () => {
    const h = toolHarness(karteMitTuer());
    const fenster = new PortalTool('window');

    // Klick genau auf die vorhandene Tür.
    fenster.onPointerDown(pointerEvent(250, 500), h.ctx);

    expect(h.doc.vtt.portals[0].closed).toBe(true);
    expect(h.labels).toEqual([]);
  });

  it('setzt neben einer Tür ein Fenster statt sie anzufassen', () => {
    const h = toolHarness(karteMitTuer());
    const fenster = new PortalTool('window');

    fenster.onPointerDown(pointerEvent(400, 500), h.ctx);
    fenster.onPointerMove(pointerEvent(500, 500), h.ctx);
    fenster.onPointerUp(pointerEvent(500, 500), h.ctx);

    const fensterWaende = h.doc.vtt.walls.filter((w) => w.type === 'window');
    expect(fensterWaende).toHaveLength(2);
    expect(h.doc.vtt.portals[0].closed).toBe(true);
  });

  it('löscht mit Rechtsklick kein Tür, sondern nur ein Fenster', () => {
    const h = toolHarness(karteMitTuer());
    const fenster = new PortalTool('window');

    fenster.onPointerDown(pointerEvent(250, 500, RECHTS), h.ctx);
    expect(h.doc.vtt.portals).toHaveLength(1);

    fenster.onPointerDown(pointerEvent(1300, 500, RECHTS), h.ctx);
    expect(h.doc.vtt.walls.some((w) => w.id === 'fenster')).toBe(false);
  });
});

describe('Tür-Werkzeug', () => {
  it('schaltet eine vorhandene Tür zwischen offen und geschlossen', () => {
    const h = toolHarness(karteMitTuer());
    const tuer = new PortalTool('door');

    tuer.onPointerDown(pointerEvent(250, 500), h.ctx);
    expect(h.doc.vtt.portals[0].closed).toBe(false);

    tuer.onPointerDown(pointerEvent(250, 500), h.ctx);
    expect(h.doc.vtt.portals[0].closed).toBe(true);
  });

  it('löscht mit Rechtsklick die Tür unter dem Zeiger', () => {
    const h = toolHarness(karteMitTuer());
    new PortalTool('door').onPointerDown(pointerEvent(250, 500, RECHTS), h.ctx);
    expect(h.doc.vtt.portals).toHaveLength(0);
  });

  it('lässt ein Fenster in Ruhe', () => {
    const h = toolHarness(karteMitTuer());
    new PortalTool('door').onPointerDown(pointerEvent(1300, 500, RECHTS), h.ctx);
    expect(h.doc.vtt.walls.some((w) => w.id === 'fenster')).toBe(true);
  });

  it('setzt auf freier Fläche eine freistehende Tür', () => {
    const h = toolHarness(karteMitTuer());
    const tuer = new PortalTool('door');

    tuer.onPointerDown(pointerEvent(200, 2000), h.ctx);
    tuer.onPointerMove(pointerEvent(300, 2000), h.ctx);
    tuer.onPointerUp(pointerEvent(300, 2000), h.ctx);

    const neu = h.doc.vtt.portals.find((p) => p.id !== 'tuer');
    expect(neu?.freestanding).toBe(true);
  });

  it('setzt auf einer Wand eine angehängte Tür', () => {
    const h = toolHarness(karteMitTuer());
    const tuer = new PortalTool('door');

    tuer.onPointerDown(pointerEvent(600, 505), h.ctx);
    tuer.onPointerMove(pointerEvent(700, 505), h.ctx);
    tuer.onPointerUp(pointerEvent(700, 505), h.ctx);

    const neu = h.doc.vtt.portals.find((p) => p.id !== 'tuer');
    expect(neu?.freestanding).toBe(false);
  });
});
