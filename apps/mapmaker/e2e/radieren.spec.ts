/**
 * Radiergummi im Browser.
 *
 * Der interessante Teil ist nicht die Geometrie — die steht im Modelltest —,
 * sondern dass ein Strich über die Karte wirklich schneidet und danach als
 * *ein* Rückgängig-Schritt zurückgeht.
 */

import { expect, test } from '@playwright/test';
import { oeffneEditor, werkzeug, zeiger, ziehen } from './harness';

const striche = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    Object.values(window.T.doc().objects)
      .filter((o) => o.kind === 'shape')
      .map((o) => (o as { points: number[] }).points.length),
  );

test('ein Radierstrich zerlegt eine Linie und geht in einem Schritt zurück', async ({ page }) => {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  await oeffneEditor(page);

  // Eine lange Linie zeichnen.
  await werkzeug(page, 'draw');
  await page.evaluate(() => window.T.state().patchDraw({ shape: 'line' }));
  await ziehen(page, 300, 500, 1100, 500);
  expect(await striche(page)).toHaveLength(1);

  // Mittendrin radieren.
  await werkzeug(page, 'erase');
  await zeiger(page, 'pointerdown', 700, 500, { button: 0, buttons: 1 });
  await zeiger(page, 'pointermove', 720, 500, { buttons: 1 });
  await zeiger(page, 'pointerup', 720, 500, { button: 0, buttons: 0 });
  await page.waitForTimeout(150);

  expect(await striche(page)).toHaveLength(2);

  // Ein einziges Rückgängig führt die Linie zurück.
  await page.evaluate(() => window.T.state().undo());
  await page.waitForTimeout(150);
  expect(await striche(page)).toHaveLength(1);

  expect(fehler).toEqual([]);
});
