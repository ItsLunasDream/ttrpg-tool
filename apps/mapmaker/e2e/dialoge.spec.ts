/**
 * Esc schließt Dialoge.
 *
 * Das ist nicht nur Bequemlichkeit, sondern der Ort eines feinen Fehlers: der
 * Notiz-Dialog hängt immer im Baum und zeigt meist nichts. Solange er trotzdem
 * auf Esc hörte, schloss *er* sich als Erster, löste ein Neuzeichnen aus — und
 * der wirklich offene Dialog verlor seinen Zuhörer mitten im Tastenereignis.
 * Der zweite Fall unten fällt genau darauf herein, wenn man es rückgängig macht.
 */

import { expect, test } from '@playwright/test';
import { oeffneEditor, tippen, werkzeug } from './harness';

const offen = (page: import('@playwright/test').Page) =>
  page.$$eval('.modal', (es) => es.map((e) => e.querySelector('h3')?.textContent ?? '?'));

test('Esc schließt Hilfe, Generator und Notiz', async ({ page }) => {
  await oeffneEditor(page);

  await page.getByRole('button', { name: /Help|Hilfe/ }).first().click();
  await page.waitForTimeout(300);
  expect(await offen(page)).toHaveLength(1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  expect(await offen(page)).toHaveLength(0);

  await page.getByRole('button', { name: /Generate|Erzeug/ }).first().click();
  await page.waitForTimeout(300);
  expect(await offen(page)).toHaveLength(1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  expect(await offen(page)).toHaveLength(0);

  await werkzeug(page, 'note');
  await tippen(page, 400, 300);
  await page.waitForTimeout(350);
  expect(await offen(page)).toHaveLength(1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  expect(await offen(page)).toHaveLength(0);
});

test('Esc räumt die Auswahl, wenn kein Dialog offen ist', async ({ page }) => {
  await oeffneEditor(page);
  await page.evaluate(() => {
    const T = window.T;
    const d = T.doc();
    const layer = d.rootLayers.find((id) => !d.layers[id].isGroup && !id.startsWith('__'))!;
    T.state().exec(
      new T.cmds.AddObjects(
        [
          {
            id: 'x',
            layerId: layer,
            kind: 'shape',
            shape: 'line',
            x: 100,
            y: 100,
            rotation: 0,
            opacity: 1,
            z: 1,
            locked: false,
            points: [0, 0, 40, 0],
            stroke: { color: 0xffffff, width: 2, alpha: 1, dash: [] },
            fill: null,
            closed: false,
            blend: 'normal',
          },
        ] as never,
        'Aufbau',
      ),
    );
    T.state().setSelection(['x']);
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => window.T.canvas()?.focus());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.T.state().selection)).toEqual([]);
});
