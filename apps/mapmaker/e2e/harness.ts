/**
 * Griffe für die End-to-End-Prüfungen.
 *
 * Alles läuft über `window.T` (`src/devHarness.ts`). Das ist Absicht: der
 * Canvas hat keine Knöpfe, die Playwright anklicken könnte, und die
 * interessante Größe ist die Weltkoordinate, nicht das DOM-Element.
 */

import type { Page } from '@playwright/test';
import type { DevHarness } from '../src/devHarness';
import type { EditorState } from '../src/model/store';
import type { MapDocument, ToolIdLike } from './types';

declare global {
  interface Window {
    T: DevHarness;
  }
}

/** Wartet, bis die Bühne steht — vorher gibt es keinen Canvas zu bedienen. */
export async function oeffneEditor(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.T?.canvas(), null, { timeout: 30_000 });
  // Die erste Einpassung läuft über einen Frame; ohne sie stimmen die
  // Weltkoordinaten der Klicks noch nicht.
  await page.waitForTimeout(600);
}

export async function werkzeug(page: Page, id: ToolIdLike): Promise<void> {
  await page.evaluate((t) => window.T.state().setTool(t as never), id);
  await page.waitForTimeout(80);
}

export async function aktivesWerkzeug(page: Page): Promise<string> {
  return page.evaluate(() => window.T.state().tool);
}

export async function zeiger(
  page: Page,
  typ: 'pointerdown' | 'pointermove' | 'pointerup',
  x: number,
  y: number,
  opts: Record<string, unknown> = {},
): Promise<void> {
  await page.evaluate(
    ([t, x, y, o]) => window.T.ptr(t as string, x as number, y as number, o as Record<string, unknown>),
    [typ, x, y, opts] as const,
  );
}

/** Ein Klick ohne vorherige Bewegung — auf einem Tablett der Normalfall. */
export async function tippen(page: Page, x: number, y: number, taste = 0): Promise<void> {
  await zeiger(page, 'pointerdown', x, y, { button: taste, buttons: taste === 2 ? 2 : 1 });
  await zeiger(page, 'pointerup', x, y, { button: taste, buttons: 0 });
  await page.waitForTimeout(60);
}

/** Ziehen mit Zwischenbewegung — der Mausfall. */
export async function ziehen(
  page: Page,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Promise<void> {
  await zeiger(page, 'pointerdown', x0, y0, { button: 0, buttons: 1 });
  await zeiger(page, 'pointermove', (x0 + x1) / 2, (y0 + y1) / 2, { buttons: 1 });
  await zeiger(page, 'pointermove', x1, y1, { buttons: 1 });
  await zeiger(page, 'pointerup', x1, y1, { button: 0, buttons: 0 });
  await page.waitForTimeout(60);
}

export interface Bestand {
  objekte: number;
  waende: number;
  fenster: number;
  tueren: number;
  lichter: number;
  notizen: number;
  layer: number;
}

/** Zählt, was auf der Karte steht — die Prüfgröße fast aller Fälle. */
export async function bestand(page: Page): Promise<Bestand> {
  return page.evaluate(() => {
    const d = window.T.doc() as MapDocument;
    return {
      objekte: Object.keys(d.objects).length,
      waende: d.vtt.walls.filter((w) => w.type !== 'window').length,
      fenster: d.vtt.walls.filter((w) => w.type === 'window').length,
      tueren: d.vtt.portals.length,
      lichter: d.vtt.lights.length,
      notizen: d.vtt.notes.length,
      layer: Object.keys(d.layers).length,
    };
  });
}

export async function zustand<T>(page: Page, lies: (s: EditorState) => T): Promise<T> {
  return page.evaluate(`(${lies.toString()})(window.T.state())`) as Promise<T>;
}

/** Erstes Prop in der Palette wählen — Voraussetzung für Prop und Pinsel. */
export async function waehleProp(page: Page): Promise<void> {
  await page.locator('.prop-card').first().click();
  await page.waitForTimeout(200);
}
