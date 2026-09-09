/**
 * Lineale und Hilfslinien.
 *
 * Alles hier hängt an einem Zeiger: aus dem Lineal ziehen, die Linie wieder
 * anfassen, sie von der Karte schieben. Ein Modelltest sieht davon nichts —
 * dort gibt es kein Lineal, an dem man ziehen könnte.
 */

import { expect, test } from '@playwright/test';
import { oeffneEditor, werkzeug, zeiger, zustand } from './harness';

const linien = (page: import('@playwright/test').Page) =>
  zustand(page, (s) => s.doc.guides ?? []);

test('aus dem Lineal gezogen entsteht eine Hilfslinie, und sie lässt sich zurücknehmen', async ({
  page,
}) => {
  await oeffneEditor(page);
  expect(await page.$$eval('.ruler', (e) => e.length), 'ohne Lineale keine Streifen').toBe(0);

  await page.evaluate(() => window.T.state().setRulers(true));
  await page.waitForTimeout(300);
  expect(await page.$$eval('.ruler', (e) => e.length)).toBe(2);

  // Aus dem oberen Lineal nach unten: das gibt eine waagerechte Linie.
  const oben = (await page.locator('.ruler-top').boundingBox())!;
  await page.mouse.move(oben.x + 300, oben.y + 9);
  await page.mouse.down();
  await page.mouse.move(oben.x + 300, oben.y + 250, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  expect((await linien(page)).map((g) => g.axis)).toEqual(['y']);

  // Aus dem linken Lineal nach rechts: eine senkrechte.
  const links = (await page.locator('.ruler-left').boundingBox())!;
  await page.mouse.move(links.x + 9, links.y + 300);
  await page.mouse.down();
  await page.mouse.move(links.x + 420, links.y + 300, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  expect((await linien(page)).map((g) => g.axis).sort()).toEqual(['x', 'y']);

  // Das Ziehen ist *ein* Rückgängig-Schritt, nicht einer je Zwischenschritt.
  await page.evaluate(() => window.T.state().undo());
  await page.waitForTimeout(200);
  expect(await linien(page)).toHaveLength(1);
});

test('eine Hilfslinie lässt sich anfassen, verschieben und von der Karte werfen', async ({
  page,
}) => {
  await oeffneEditor(page);
  await page.evaluate(() => {
    const T = window.T;
    T.state().setRulers(true);
    T.look(400, 300, 1);
    T.state().exec(new T.cmds.SetGuides([{ id: 'g1', axis: 'x', pos: 400 }], 'Aufbau'));
  });
  await page.waitForTimeout(300);
  const mitte = await page.evaluate(() => {
    const r = window.T.canvas()!.getBoundingClientRect();
    return { x: Math.round(r.width / 2), y: Math.round(r.height / 2) };
  });

  await werkzeug(page, 'select');
  await zeiger(page, 'pointerdown', mitte.x, mitte.y, { button: 0, buttons: 1 });
  await zeiger(page, 'pointermove', mitte.x + 90, mitte.y, { buttons: 1 });
  await zeiger(page, 'pointerup', mitte.x + 90, mitte.y, { button: 0, buttons: 0 });
  await page.waitForTimeout(200);
  expect((await linien(page))[0].pos).toBeCloseTo(490, 0);

  // Weit nach links, über den Kartenrand hinaus: dann ist sie weg.
  await zeiger(page, 'pointerdown', mitte.x + 90, mitte.y, { button: 0, buttons: 1 });
  await zeiger(page, 'pointermove', mitte.x - 900, mitte.y, { buttons: 1 });
  await zeiger(page, 'pointerup', mitte.x - 900, mitte.y, { button: 0, buttons: 0 });
  await page.waitForTimeout(200);
  expect(await linien(page)).toHaveLength(0);
});

test('ein verschobenes Objekt fängt an der Hilfslinie', async ({ page }) => {
  await oeffneEditor(page);
  await page.evaluate(() => {
    const T = window.T;
    const d = T.doc();
    const layer = d.rootLayers.find((id) => !d.layers[id].isGroup && !id.startsWith('__'))!;
    T.state().setRulers(true);
    T.look(400, 300, 1);
    T.state().exec(new T.cmds.SetGuides([{ id: 'g1', axis: 'x', pos: 400 }], 'Aufbau'));
    T.state().exec(
      new T.cmds.AddObjects(
        [
          {
            id: 'box',
            layerId: layer,
            kind: 'shape',
            shape: 'rect',
            x: 700,
            y: 300,
            rotation: 0,
            opacity: 1,
            z: 1,
            locked: false,
            points: [-30, -30, 30, -30, 30, 30, -30, 30],
            stroke: { color: 0xffffff, width: 3, alpha: 1, dash: [] },
            fill: { color: 0x884422, alpha: 1 },
            closed: true,
            blend: 'normal',
          },
        ] as never,
        'Aufbau',
      ),
    );
    T.state().setSelection(['box']);
  });
  await page.waitForTimeout(300);
  const mitte = await page.evaluate(() => {
    const r = window.T.canvas()!.getBoundingClientRect();
    return { x: Math.round(r.width / 2), y: Math.round(r.height / 2) };
  });

  await werkzeug(page, 'select');
  // Die Kiste sitzt 300 Bildschirmpixel rechts der Mitte; vier Pixel neben der
  // Linie abgesetzt muss sie darauf springen.
  await zeiger(page, 'pointerdown', mitte.x + 300, mitte.y, { button: 0, buttons: 1 });
  await zeiger(page, 'pointermove', mitte.x + 4, mitte.y, { buttons: 1 });
  await zeiger(page, 'pointerup', mitte.x + 4, mitte.y, { button: 0, buttons: 0 });
  await page.waitForTimeout(200);
  expect(await zustand(page, (s) => s.doc.objects.box.x)).toBe(400);
});
