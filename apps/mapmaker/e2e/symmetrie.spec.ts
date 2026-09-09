/**
 * Symmetrie beim Setzen.
 *
 * Die Geometrie steht in `tests/symmetry.test.ts`. Hier geht es um die
 * Verdrahtung: dass ein Klick vier Objekte ergibt und *ein* Rückgängig sie alle
 * nimmt — für den Benutzer war es ein Setzen.
 */

import { expect, test } from '@playwright/test';
import { bestand, oeffneEditor, tippen, waehleProp, werkzeug } from './harness';

test('mit beiden Achsen wird aus einem Klick ein Viererzug', async ({ page }) => {
  await oeffneEditor(page);
  await waehleProp(page);
  await werkzeug(page, 'prop');

  await page.evaluate(() =>
    window.T.state().patchSymmetry({ vertical: true, horizontal: true, axisX: 900, axisY: 700 }),
  );
  await page.waitForTimeout(120);

  await tippen(page, 250, 180);
  await page.waitForTimeout(200);
  expect((await bestand(page)).objekte).toBe(4);

  const orte = await page.evaluate(() =>
    Object.values(window.T.doc().objects)
      .map((o) => `${Math.round(o.x)},${Math.round(o.y)}`)
      .sort(),
  );
  // Um (900, 700) gespiegelt: die x-Werte ergänzen sich zu 1800, die y zu 1400.
  const xs = orte.map((o) => Number(o.split(',')[0]));
  const ys = orte.map((o) => Number(o.split(',')[1]));
  expect(Math.min(...xs) + Math.max(...xs)).toBe(1800);
  expect(Math.min(...ys) + Math.max(...ys)).toBe(1400);

  await page.evaluate(() => window.T.state().undo());
  await page.waitForTimeout(200);
  expect((await bestand(page)).objekte).toBe(0);
});

test('ohne Symmetrie bleibt es bei einem', async ({ page }) => {
  await oeffneEditor(page);
  await waehleProp(page);
  await werkzeug(page, 'prop');
  await tippen(page, 250, 180);
  await page.waitForTimeout(200);
  expect((await bestand(page)).objekte).toBe(1);
});
