/**
 * Gesperrte Ebenen.
 *
 * Das Schloss galt lange nur für neue Klicks: man konnte in eine gesperrte
 * Ebene malen — und die Objekte danach nicht mehr anfassen, weil dieselbe
 * Ebene sie schützte.
 */

import { expect, test } from '@playwright/test';
import { bestand, oeffneEditor, tippen, waehleProp, werkzeug } from './harness';

test('eine gesperrte Ebene nimmt nichts auf und gibt nichts her', async ({ page }) => {
  await oeffneEditor(page);
  await waehleProp(page);

  await werkzeug(page, 'prop');
  await tippen(page, 700, 500);
  expect((await bestand(page)).objekte).toBe(1);

  // Alles auswählen, dann die Ebene sperren — die Reihenfolge ist der Punkt.
  await page.evaluate(() => {
    const s = window.T.state();
    s.setSelection(Object.keys(window.T.doc().objects));
    s.setTool('select');
    s.exec(new window.T.cmds.PatchLayer(s.activeLayerId, { locked: true }));
  });
  await page.waitForTimeout(150);

  await page.evaluate(() => window.T.canvas()?.focus());
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  expect((await bestand(page)).objekte).toBe(1);

  await werkzeug(page, 'prop');
  await tippen(page, 900, 600);
  expect((await bestand(page)).objekte).toBe(1);
  expect(await page.evaluate(() => window.T.state().statusMessage)).toBeTruthy();

  // Entsperrt greift beides wieder.
  await page.evaluate(() => {
    const s = window.T.state();
    s.exec(new window.T.cmds.PatchLayer(s.activeLayerId, { locked: false }));
  });
  await tippen(page, 900, 600);
  expect((await bestand(page)).objekte).toBe(2);
});
