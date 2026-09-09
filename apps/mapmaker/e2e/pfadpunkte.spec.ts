/**
 * Verschobene Stützpunkte werden neu gezeichnet.
 *
 * Der Renderer baut einen Knoten nur neu, wenn sein Schlüssel sich ändert. Bei
 * Zeichnungen stand darin nur die *Anzahl* der Punkte — ein verschobener Punkt
 * blieb im Bild also stehen, wo er war, obwohl das Modell längst den neuen Ort
 * kannte. Kein Modelltest sieht das: dort stimmt alles.
 */

import { expect, test } from '@playwright/test';
import { oeffneEditor } from './harness';

test('ein verschobener Stützpunkt landet auch im Bild', async ({ page }) => {
  await oeffneEditor(page);
  await page.evaluate(() => {
    const T = window.T;
    const d = T.doc();
    const layer = d.rootLayers.find((id) => !d.layers[id].isGroup && !id.startsWith('__'))!;
    T.look(400, 300, 1);
    T.state().exec(
      new T.cmds.AddObjects(
        [
          {
            id: 'ln',
            layerId: layer,
            kind: 'shape',
            shape: 'polygon',
            x: 400,
            y: 300,
            rotation: 0,
            opacity: 1,
            z: 1,
            locked: false,
            points: [-100, 0, 0, -80, 100, 0],
            stroke: { color: 0xffcc00, width: 6, alpha: 1, dash: [] },
            fill: null,
            closed: false,
            blend: 'normal',
          },
        ] as never,
        'Aufbau',
      ),
    );
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.T.pump(3));
  const vorher = await page.locator('.canvas-host canvas').screenshot();

  // Nur *ein* Punkt wandert; die Anzahl bleibt gleich — genau der Fall, den
  // der alte Schlüssel nicht bemerkte.
  await page.evaluate(() => {
    const zeichnung = window.T.doc().objects.ln as { points: number[] };
    const pts = [...zeichnung.points];
    pts[3] = -300;
    window.T
      .state()
      .exec(new window.T.cmds.PatchObjects(new Map([['ln', { points: pts }]]), 'Punkt'));
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.T.pump(3));
  const nachher = await page.locator('.canvas-host canvas').screenshot();

  expect(Buffer.compare(vorher, nachher)).not.toBe(0);
});
