/**
 * Jedes Werkzeug setzt, was es verspricht.
 *
 * Der Anlass: nach einem Fehler im Werkzeugwechsel ließ sich gar nichts mehr
 * platzieren — jeder Klick wählte nur aus. Aufgefallen ist das erst bei der
 * Benutzung, weil im Modell alles stimmte und die Werkzeugleiste sogar das
 * richtige Werkzeug anzeigte. Genau diese Lücke schließt diese Datei.
 */

import { expect, test } from '@playwright/test';
import {
  aktivesWerkzeug,
  bestand,
  oeffneEditor,
  tippen,
  waehleProp,
  werkzeug,
  zeiger,
  ziehen,
} from './harness';

test.beforeEach(async ({ page }) => {
  await oeffneEditor(page);
});

test('der Werkzeugwechsel greift durch bis zum Manager', async ({ page }) => {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(String(e)));

  // Reihum durch alle Werkzeuge und zurück: der Fehler zeigte sich beim
  // *ersten* Wechsel weg von der Auswahl.
  for (const id of [
    'prop', 'brush', 'draw', 'text', 'terrain', 'wall', 'room', 'door',
    'window', 'light', 'note', 'height', 'region', 'measure', 'stamp',
    'pan', 'select',
  ]) {
    await werkzeug(page, id);
    expect(await aktivesWerkzeug(page)).toBe(id);
  }

  expect(fehler).toEqual([]);
});

test('Prop, Zeichnung, Wand, Tür, Licht und Notiz landen auf der Karte', async ({ page }) => {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await waehleProp(page);

  await werkzeug(page, 'prop');
  await tippen(page, 700, 500);
  expect((await bestand(page)).objekte).toBe(1);

  await werkzeug(page, 'draw');
  await ziehen(page, 300, 400, 420, 500);
  expect((await bestand(page)).objekte).toBe(2);

  await werkzeug(page, 'wall');
  await tippen(page, 200, 200);
  await zeiger(page, 'pointermove', 400, 200);
  await tippen(page, 400, 200);
  await tippen(page, 400, 200, 2);
  expect((await bestand(page)).waende).toBe(1);

  await werkzeug(page, 'door');
  await ziehen(page, 250, 200, 320, 200);
  expect((await bestand(page)).tueren).toBe(1);

  await werkzeug(page, 'light');
  await tippen(page, 800, 400);
  expect((await bestand(page)).lichter).toBe(1);

  await werkzeug(page, 'note');
  await tippen(page, 850, 700);
  expect((await bestand(page)).notizen).toBe(1);

  expect(fehler).toEqual([]);
});

test('Tippen ohne Zeigerbewegung ergibt eine richtige Wand, keine ohne Länge', async ({ page }) => {
  // Auf einem Tablett schickt ein Tippen kein pointermove. Vorher blieb der
  // mitlaufende Punkt auf dem vorigen liegen: heraus kam ein Zug aus zwei
  // identischen Punkten, in Foundry nichts, das man anfassen kann.
  await werkzeug(page, 'wall');
  await tippen(page, 200, 200);
  await tippen(page, 500, 200);
  await tippen(page, 500, 200, 2);

  const waende = await page.evaluate(() => window.T.doc().vtt.walls.map((w) => w.points));
  expect(waende).toHaveLength(1);
  const [x0, y0, x1, y1] = waende[0];
  expect(Math.hypot(x1 - x0, y1 - y0)).toBeGreaterThan(1);
});

test('das Fenster-Werkzeug fasst eine Tür daneben nicht an', async ({ page }) => {
  await werkzeug(page, 'wall');
  await tippen(page, 200, 300);
  await zeiger(page, 'pointermove', 700, 300);
  await tippen(page, 700, 300);
  await tippen(page, 700, 300, 2);

  await werkzeug(page, 'door');
  await ziehen(page, 250, 300, 320, 300);
  const tuerVorher = await page.evaluate(() => window.T.doc().vtt.portals[0].closed);

  // Mit dem Fenster-Werkzeug *auf* der Tür beginnen — vorher schaltete das
  // die Tür um, statt ein Fenster anzufangen. Der Zug startet in der Türmitte,
  // also weit innerhalb der Fangreichweite.
  await werkzeug(page, 'window');
  await ziehen(page, 285, 300, 420, 300);

  const nachher = await bestand(page);
  expect(nachher.fenster).toBe(1);
  expect(nachher.tueren).toBe(1);
  expect(await page.evaluate(() => window.T.doc().vtt.portals[0].closed)).toBe(tuerVorher);

  // Und der Rechtsklick löscht die Tür nicht, sondern das Fenster darunter.
  await tippen(page, 285, 300, 2);
  expect((await bestand(page)).tueren).toBe(1);
});
