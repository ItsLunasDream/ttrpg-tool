/**
 * Werkzeugwechsel.
 *
 * Der Test steht hier, weil genau daran einmal der ganze Editor hing: ein
 * `deactivate`, das den Store anfasst, rief über die Subscription wieder
 * `setTool` — und weil `activeId` erst *nach* dem Abräumen gesetzt wurde, sah
 * der zweite Aufruf noch das alte Werkzeug und rief erneut. Ergebnis war ein
 * `RangeError`, der Manager blieb auf `select` stehen, und jeder Klick auf die
 * Karte wählte nur noch aus, statt zu platzieren.
 *
 * Der Renderer ist ein Doppel: geprüft wird das Umschalten, nicht das Zeichnen.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { ToolManager } from '@/tools/manager';
import { useEditor } from '@/model/store';
import { createDocument } from '@/model/document';
import type { MapRenderer } from '@/engine/renderer';

function rendererDouble(): MapRenderer {
  const canvas = {
    style: {} as CSSStyleDeclaration,
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    parentElement: null,
  };
  return {
    app: { canvas, renderer: {}, ticker: { started: false, start() {}, stop() {} } },
    camera: { zoom: 1, screenToWorld: (x: number, y: number) => ({ x, y }) },
    textMetrics: new Map(),
    addOverlay() {},
    removeOverlay() {},
  } as unknown as MapRenderer;
}

function frischerManager(): ToolManager {
  useEditor.getState().loadDocument(createDocument(10, 10));
  useEditor.setState({ tool: 'select', editingPathId: null });
  return new ToolManager(rendererDouble(), {} as HTMLElement);
}

let abmelden: Array<() => void> = [];
afterEach(() => {
  for (const fn of abmelden) fn();
  abmelden = [];
  useEditor.setState({ tool: 'select', editingPathId: null });
});

describe('ToolManager.setTool', () => {
  it('schaltet um, wenn der Store das Werkzeug wechselt', () => {
    const manager = frischerManager();
    abmelden.push(useEditor.subscribe((s) => manager.syncTool(s.tool)));

    useEditor.getState().setTool('prop');
    expect(manager.tool).toBe('prop');
  });

  it('läuft sich nicht tot, wenn deactivate den Store anfasst', () => {
    const manager = frischerManager();
    abmelden.push(useEditor.subscribe((s) => manager.syncTool(s.tool)));

    // Eine offene Pfadbearbeitung: genau die räumt das Auswahl-Werkzeug beim
    // Wechsel weg — über den Store, und damit über die Subscription zurück.
    useEditor.setState({ editingPathId: 'irgendein-objekt' });

    expect(() => useEditor.getState().setTool('wall')).not.toThrow();
    expect(manager.tool).toBe('wall');
    // Aufgeräumt wurde trotzdem.
    expect(useEditor.getState().editingPathId).toBeNull();
  });

  it('bleibt heil, wenn ein Abnehmer mitten im Wechsel umschalten will', () => {
    const manager = frischerManager();
    abmelden.push(useEditor.subscribe((s) => manager.syncTool(s.tool)));
    // Ein Abnehmer, der auf jede Änderung hin selbst umschaltet — das ist der
    // Weg, auf dem ein deactivate den Manager mitten im Abräumen wieder
    // beträte. Der Wächter weist ihn dort ab; *nach* dem Wechsel darf er
    // umschalten, das ist eine gewöhnliche Anfrage.
    const stoerenfried = useEditor.subscribe(() => manager.setTool('draw'));

    useEditor.setState({ editingPathId: 'irgendein-objekt' });
    expect(() => useEditor.getState().setTool('wall')).not.toThrow();

    // Ohne ihn ist der Manager nicht verklemmt: der nächste Wechsel greift,
    // der Wächter steht also wieder offen.
    stoerenfried();
    useEditor.getState().setTool('light');
    expect(manager.tool).toBe('light');
  });

  it('ignoriert den Wechsel auf das bereits aktive Werkzeug', () => {
    const manager = frischerManager();
    manager.setTool('prop');
    manager.setTool('prop');
    expect(manager.tool).toBe('prop');
  });

  it('erreicht jedes Werkzeug der Leiste', () => {
    const manager = frischerManager();
    abmelden.push(useEditor.subscribe((s) => manager.syncTool(s.tool)));

    for (const tool of [
      'prop', 'brush', 'draw', 'text', 'terrain', 'wall', 'room',
      'door', 'window', 'light', 'note', 'height', 'region', 'measure',
      'stamp', 'pan', 'select',
    ] as const) {
      useEditor.getState().setTool(tool);
      expect(manager.tool).toBe(tool);
    }
  });
});
