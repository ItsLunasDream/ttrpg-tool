/**
 * Frei belegbare Tastenkürzel.
 *
 * Die Belegung lebt in drei Dingen zugleich: im Speicher des Browsers, im
 * Nachschlagewerk des Werkzeug-Managers und in der Anzeige der Leiste. Ob die
 * drei zusammenpassen, sieht kein Modelltest — dort drückt niemand eine Taste.
 */

import { expect, test } from '@playwright/test';
import { oeffneEditor, werkzeug, zustand } from './harness';

test('eine umbelegte Taste greift sofort, die alte nicht mehr', async ({ page }) => {
  await oeffneEditor(page);
  await page.evaluate(() => localStorage.removeItem('ttrpg-map-editor.keys'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.T?.canvas(), null, { timeout: 30_000 });
  await page.waitForTimeout(400);

  // Vorgabe: W ist die Wand.
  await page.evaluate(() => window.T.canvas()?.focus());
  await page.keyboard.press('w');
  expect(await zustand(page, (s) => s.tool)).toBe('wall');

  // In der Hilfe umbelegen: Zelle anklicken, neue Taste drücken.
  await page.getByRole('button', { name: /Help|Hilfe/ }).first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const zeile = [...document.querySelectorAll('.key-columns tr')].find((r) =>
      /^(Wall|Wand)$/.test(r.querySelector('th')!.textContent!.trim()),
    )!;
    const btn = zeile.querySelector('button') as HTMLButtonElement;
    btn.focus();
    btn.click();
  });
  await page.waitForTimeout(150);
  expect(await page.$$eval('.key-cell.recording', (b) => b.length)).toBe(1);
  await page.keyboard.press('q');
  await page.waitForTimeout(200);

  // Gesichert, und die Leiste zeigt es.
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('ttrpg-map-editor.keys')!).bindings['tool.wall'],
    ),
  ).toBe('q');

  await page.getByRole('button', { name: /Close|Schließen/ }).last().click();
  await page.waitForTimeout(250);

  await werkzeug(page, 'select');
  await page.evaluate(() => window.T.canvas()?.focus());
  await page.keyboard.press('w');
  await page.waitForTimeout(120);
  expect(await zustand(page, (s) => s.tool), 'W ist frei geworden').toBe('select');

  await page.keyboard.press('q');
  await page.waitForTimeout(120);
  expect(await zustand(page, (s) => s.tool)).toBe('wall');

  // Aufräumen, damit der nächste Lauf mit der Vorgabe startet.
  await page.evaluate(() => localStorage.removeItem('ttrpg-map-editor.keys'));
});

test('Strg+Z bleibt Rückgängig, auch über die Tabelle nachgeschlagen', async ({ page }) => {
  await oeffneEditor(page);
  await page.evaluate(() => {
    const T = window.T;
    const d = T.doc();
    const layer = d.rootLayers.find((id) => !d.layers[id].isGroup && !id.startsWith('__'))!;
    T.state().exec(
      new T.cmds.AddObjects(
        [
          {
            id: 'x1',
            layerId: layer,
            kind: 'shape',
            shape: 'line',
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            z: 1,
            locked: false,
            points: [0, 0, 50, 0],
            stroke: { color: 0xffffff, width: 2, alpha: 1, dash: [] },
            fill: null,
            closed: false,
            blend: 'normal',
          },
        ] as never,
        'Probe',
      ),
    );
  });
  expect(await zustand(page, (s) => Object.keys(s.doc.objects).length)).toBe(1);

  await page.evaluate(() => window.T.canvas()?.focus());
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(200);
  expect(await zustand(page, (s) => Object.keys(s.doc.objects).length)).toBe(0);

  await page.keyboard.press('Control+y');
  await page.waitForTimeout(200);
  expect(await zustand(page, (s) => Object.keys(s.doc.objects).length)).toBe(1);
});
