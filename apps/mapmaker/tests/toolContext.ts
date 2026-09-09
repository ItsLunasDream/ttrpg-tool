/**
 * Doppel für Werkzeug-Tests.
 *
 * Werkzeuge waren bisher nur im Browser zu prüfen, und genau dort sind zwei
 * Fehler durchgerutscht, die keine Modellprüfung sehen konnte: ein
 * Werkzeugwechsel, der sich totlief, und ein Fenster-Werkzeug, das Türen
 * anfasste. Ein `ToolContext` ist aber nur ein Objekt aus Zugriffen — mit einem
 * Doppel dafür lassen sich Werkzeuge ganz gewöhnlich testen.
 *
 * Der Renderer ist so weit ausgefüllt, wie die Werkzeuge ihn anfassen:
 * Overlays anhängen, Zoom lesen, Textmaße nachschlagen. Gezeichnet wird nichts.
 */

import { createDocument } from '@/model/document';
import { useEditor } from '@/model/store';
import type { Command } from '@/model/commands';
import type { MapDocument } from '@/model/types';
import type { MapRenderer } from '@/engine/renderer';
import type { ToolContext, ToolPointerEvent } from '@/tools/types';

export interface ToolHarness {
  ctx: ToolContext;
  doc: MapDocument;
  /** Alle ausgeführten Befehle, in der Reihenfolge ihrer Ausführung. */
  befehle: Command[];
  /** Namen der ausgeführten Befehle — meist die aussagekräftigere Prüfung. */
  labels: string[];
  transaktionen: { begonnen: number; beendet: number };
}

export function rendererDouble(zoom = 1): MapRenderer {
  const canvas = {
    style: {} as CSSStyleDeclaration,
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    parentElement: null,
  };
  return {
    app: { canvas, renderer: {}, ticker: { started: false, start() {}, stop() {} } },
    camera: {
      zoom,
      screenToWorld: (x: number, y: number) => ({ x, y }),
      worldToScreen: (x: number, y: number) => ({ x, y }),
    },
    textMetrics: new Map(),
    addOverlay() {},
    removeOverlay() {},
  } as unknown as MapRenderer;
}

/**
 * Baut einen Kontext um ein Dokument.
 *
 * Die Befehle werden *ausgeführt* und nicht nur gesammelt: ein Werkzeug, das
 * den falschen Befehl schickt, fällt am Ergebnis am deutlichsten auf.
 */
export function toolHarness(doc: MapDocument = createDocument(20, 20)): ToolHarness {
  const befehle: Command[] = [];
  const labels: string[] = [];
  const transaktionen = { begonnen: 0, beendet: 0 };

  // Der Store trägt die Werkzeugeinstellungen und die Auswahl; das Dokument
  // hängt hier daneben, damit ein Test es frei aufbauen kann.
  useEditor.getState().loadDocument(doc);

  const ctx: ToolContext = {
    renderer: rendererDouble(),
    get doc() {
      return doc;
    },
    get state() {
      return useEditor.getState();
    },
    exec(cmd) {
      befehle.push(cmd);
      labels.push(cmd.label);
      cmd.do(doc);
    },
    beginTransaction() {
      transaktionen.begonnen++;
    },
    endTransaction() {
      transaktionen.beendet++;
    },
    requestRender() {},
  };

  return { ctx, doc, befehle, labels, transaktionen };
}

/** Zeigerereignis mit sinnvollen Vorgaben; Weltkoordinaten sind der Punkt. */
export function pointerEvent(
  x: number,
  y: number,
  patch: Partial<ToolPointerEvent> = {},
): ToolPointerEvent {
  return {
    world: { x, y },
    screen: { x, y },
    deltaScreen: { x: 0, y: 0 },
    button: 0,
    buttons: 1,
    shift: false,
    ctrl: false,
    alt: false,
    pressure: 0.5,
    preventDefault() {},
    ...patch,
  };
}
