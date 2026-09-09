/**
 * Rückgängig und Wiederholen über einen ganzen Arbeitsgang.
 *
 * Die Modellprüfung würfelt Befehlsketten; hier geht es um den Weg, den ein
 * Benutzer nimmt — mit Werkzeugen, Klammern und einem Renderer dazwischen.
 */

import { expect, test } from '@playwright/test';
import { bestand, oeffneEditor, tippen, waehleProp, werkzeug, zeiger, ziehen } from './harness';

test('alles zurück und alles wieder vor führt zum selben Bestand', async ({ page }) => {
  await oeffneEditor(page);
  await waehleProp(page);

  await werkzeug(page, 'prop');
  await tippen(page, 600, 400);
  await werkzeug(page, 'brush');
  await ziehen(page, 500, 600, 620, 660);
  await werkzeug(page, 'draw');
  await ziehen(page, 300, 400, 420, 500);
  await werkzeug(page, 'wall');
  await tippen(page, 200, 200);
  await zeiger(page, 'pointermove', 400, 200);
  await tippen(page, 400, 200);
  await tippen(page, 400, 200, 2);
  await werkzeug(page, 'light');
  await tippen(page, 800, 400);

  const voll = await bestand(page);
  expect(voll.objekte).toBeGreaterThan(3);

  await page.evaluate(() => {
    for (let i = 0; i < 50; i++) window.T.state().undo();
  });
  await page.waitForTimeout(200);
  const leer = await bestand(page);
  expect(leer.objekte).toBe(0);
  expect(leer.waende).toBe(0);
  expect(leer.lichter).toBe(0);

  await page.evaluate(() => {
    for (let i = 0; i < 50; i++) window.T.state().redo();
  });
  await page.waitForTimeout(200);
  expect(await bestand(page)).toEqual(voll);
});

test('der Renderer hält seine Sprites im Takt mit dem Dokument', async ({ page }) => {
  await oeffneEditor(page);
  await waehleProp(page);
  await werkzeug(page, 'prop');
  for (const [x, y] of [[500, 400], [600, 450], [700, 500]]) await tippen(page, x, y);

  const sprites = async () => {
    await page.evaluate(() => window.T.pump(2));
    return page.evaluate(() => window.T.sprites().length);
  };
  expect(await sprites()).toBe(3);

  // Ebene samt Inhalt löschen, während die Objekte ausgewählt sind.
  await page.evaluate(() => {
    const s = window.T.state();
    s.setSelection(Object.keys(window.T.doc().objects));
    s.exec(new window.T.cmds.RemoveLayer(s.activeLayerId));
  });
  await page.waitForTimeout(150);
  expect(await sprites()).toBe(0);

  await page.evaluate(() => window.T.state().undo());
  await page.waitForTimeout(150);
  expect(await sprites()).toBe(3);
});
