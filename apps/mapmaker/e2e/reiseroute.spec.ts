/**
 * Einstellungen wirken auf die Auswahl, nicht nur auf das Nächste.
 *
 * Gemeldet an der Reiseroute: den Tagesmarsch nach dem Ziehen zu verstellen
 * änderte nichts an der Route, sondern nur an der Vorgabe für die nächste. Es
 * steckten *zwei* Fehler darin, und nur zusammen sieht man sie:
 *
 *   1. Das Panel schrieb die Änderung gar nicht auf das ausgewählte Objekt.
 *   2. Selbst mit der Änderung zeichnete der Renderer nicht neu — sein
 *      Schlüssel für „muss neu gebaut werden" kannte die Routenangaben nicht.
 *
 * Ein Modelltest hätte den zweiten nie gesehen. Deshalb wird hier auch das
 * *Bild* verglichen.
 */

import { expect, test } from '@playwright/test';
import { oeffneEditor, tippen, werkzeug, zeiger, zustand } from './harness';

/** Stellt den Tagesmarsch-Regler und lässt den Renderer ein paar Bilder laufen. */
async function tagesmarsch(page: import('@playwright/test').Page, wert: number) {
  await page.evaluate((val) => {
    const zeile = [...document.querySelectorAll('.side.right .row')].find((x) =>
      /Per day|Tagesmarsch/i.test(x.textContent ?? ''),
    )!;
    const input = zeile.querySelector('input[type=range]') as HTMLInputElement;
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      String(val),
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, wert);
  await page.waitForTimeout(250);
  await page.evaluate(() => window.T.pump(4));
  await page.waitForTimeout(150);
}

const routen = (page: import('@playwright/test').Page) =>
  zustand(page, (s) =>
    Object.values(s.doc.objects)
      .filter((o) => o.kind === 'shape' && !!o.route)
      .map((o) => (o as { route?: { perDay: number } }).route),
  );

test('der Tagesmarsch einer ausgewählten Route lässt sich ändern', async ({ page }) => {
  await oeffneEditor(page);

  await werkzeug(page, 'route');
  await tippen(page, 150, 400);
  await zeiger(page, 'pointermove', 900, 400);
  await tippen(page, 900, 400);
  await tippen(page, 900, 400, 2);
  await page.waitForTimeout(250);
  expect(await routen(page)).toEqual([{ perDay: 40, marks: true }]);

  // Mit dem Auswahl-Werkzeug muss zu sehen sein, was die Route ausmacht —
  // ohne erst auf das Reiserouten-Werkzeug zurückzuwechseln.
  await werkzeug(page, 'select');
  await page.waitForTimeout(200);
  const regler = await page.$$eval('.side.right .row', (es) =>
    es.map((e) => e.textContent ?? '').filter((x) => /Per day|Tagesmarsch/i.test(x)),
  );
  expect(regler.length, 'der Tagesmarsch-Regler ist mit „Auswahl" zu sehen').toBe(1);

  await tagesmarsch(page, 77);
  expect(await routen(page)).toEqual([{ perDay: 77, marks: true }]);

  // Und zurücknehmen lässt es sich auch.
  await page.evaluate(() => window.T.state().undo());
  await page.waitForTimeout(200);
  expect(await routen(page)).toEqual([{ perDay: 40, marks: true }]);
});

test('die Tagesmarken werden dabei wirklich neu gezeichnet', async ({ page }) => {
  await oeffneEditor(page);

  await werkzeug(page, 'route');
  await tippen(page, 150, 400);
  await zeiger(page, 'pointermove', 900, 400);
  await tippen(page, 900, 400);
  await tippen(page, 900, 400, 2);
  await page.waitForTimeout(250);
  await werkzeug(page, 'select');
  await page.waitForTimeout(200);

  await tagesmarsch(page, 8);
  const dicht = await page.locator('.canvas-host canvas').screenshot();
  await tagesmarsch(page, 200);
  const spaerlich = await page.locator('.canvas-host canvas').screenshot();

  // Bei acht Kilometern am Tag stehen viele Marken auf der Strecke, bei
  // zweihundert kaum eine. Sieht das Bild gleich aus, hat der Renderer den
  // alten Zug behalten.
  expect(Buffer.compare(dicht, spaerlich)).not.toBe(0);
});
