/**
 * Beschriftungen, die an einem Objekt hängen.
 *
 * Der Anschluss wirkt nicht im Modell, sondern in dem Moment, in dem das
 * Werkzeug die Menge der angefassten Objekte zusammenstellt. Genau das kann
 * kein Modelltest sehen: dort gäbe es niemanden, der zieht.
 */

import { expect, test } from '@playwright/test';
import { oeffneEditor, waehleProp, werkzeug, zeiger } from './harness';

/** Legt eine Zeichnung und eine daran hängende Beschriftung an. */
async function aufbau(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const T = window.T;
    const s = T.state();
    const d = T.doc();
    const layer = d.rootLayers.find((id) => !d.layers[id].isGroup && !id.startsWith('__'))!;
    s.exec(
      new T.cmds.AddObjects(
        [
          {
            id: 'stadt',
            layerId: layer,
            kind: 'shape',
            shape: 'rect',
            x: 400,
            y: 300,
            rotation: 0,
            opacity: 1,
            z: 1,
            locked: false,
            points: [-50, -50, 50, -50, 50, 50, -50, 50],
            stroke: { color: 0xffffff, width: 3, alpha: 1, dash: [] },
            fill: { color: 0x884422, alpha: 1 },
            closed: true,
            blend: 'normal',
          },
          {
            id: 'lbl',
            layerId: layer,
            kind: 'text',
            x: 400,
            y: 220,
            rotation: 0,
            opacity: 1,
            z: 9,
            locked: false,
            text: 'Falkenstein',
            fontFamily: 'serif',
            fontSize: 20,
            bold: false,
            italic: false,
            color: 0xffffff,
            align: 'center',
            letterSpacing: 0,
            lineHeight: 1.2,
            strokeColor: null,
            strokeWidth: 0,
            anchorId: 'stadt',
          },
        ] as never,
        'Aufbau',
      ),
    );
    // T.ptr rechnet in Bildschirmkoordinaten — den Blick auf die Zeichnung
    // richten, sonst trifft der Klick ins Leere.
    T.look(400, 300, 1);
  });
  await page.waitForTimeout(300);
  return page.evaluate(() => {
    const r = window.T.canvas()!.getBoundingClientRect();
    return { x: Math.round(r.width / 2), y: Math.round(r.height / 2) };
  });
}

const orte = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const d = window.T.doc();
    return Object.fromEntries(
      Object.values(d.objects).map((o) => [o.id, [Math.round(o.x), Math.round(o.y)]]),
    );
  });

test('eine angeheftete Beschriftung wandert mit ihrem Objekt und geht mit ihm', async ({ page }) => {
  await oeffneEditor(page);
  await waehleProp(page);
  const mitte = await aufbau(page);

  expect(await orte(page)).toEqual({ stadt: [400, 300], lbl: [400, 220] });

  // Nur die Zeichnung auswählen und ziehen.
  await werkzeug(page, 'select');
  await page.evaluate(() => window.T.state().setSelection(['stadt']));
  await page.waitForTimeout(120);
  await zeiger(page, 'pointerdown', mitte.x, mitte.y, { button: 0, buttons: 1 });
  await zeiger(page, 'pointermove', mitte.x + 120, mitte.y + 80, { buttons: 1 });
  await zeiger(page, 'pointerup', mitte.x + 120, mitte.y + 80, { button: 0, buttons: 0 });
  await page.waitForTimeout(200);

  // Beide um denselben Betrag — die Beschriftung war nicht ausgewählt.
  expect(await orte(page)).toEqual({ stadt: [520, 380], lbl: [520, 300] });

  // Und beides in *einem* Schritt zurück.
  await page.evaluate(() => window.T.state().undo());
  await page.waitForTimeout(200);
  expect(await orte(page)).toEqual({ stadt: [400, 300], lbl: [400, 220] });

  // Löschen nimmt die Beschriftung mit: ein Name ohne das Benannte ist nichts.
  await page.evaluate(() => window.T.state().setSelection(['stadt']));
  await page.evaluate(() => window.T.canvas()?.focus());
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  expect(await orte(page)).toEqual({});
});
