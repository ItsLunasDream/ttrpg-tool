/**
 * Terrain bei geringer Deckkraft: eine Fläche, kein Stapel.
 *
 * Aus dem Gebrauch: „Wenn man bei Terrain die Opacity herunterstellt sieht man
 * die überlagernden Schichten, die man beim Zeichnen hatte." Der Pinsel legt
 * zwar nur *ein* Polygon an, aber das überschlägt sich, wo der Strich sich
 * selbst kreuzt oder enger biegt als der Pinsel breit ist. Ein solches Polygon
 * wird in Dreiecke zerlegt, die einander überlappen — und überlappende
 * Dreiecke werden zweimal gefüllt.
 *
 * Gemessen wird deshalb am Bild, nicht am Modell: die Farbe an einer Stelle
 * mit einer Lage gegen die Farbe an der Kreuzung. Sind sie verschieden, ist es
 * kein durchgehender Boden.
 */
import { expect, test } from '@playwright/test';
import { oeffneEditor, werkzeug } from './harness';

/** Weltpunkt → Bildpunkt im Ausschnitt, den `T.shot` liefert. */
interface Messung {
  einzeln: [number, number, number, number];
  kreuzung: [number, number, number, number];
}

// Der Fehler steht noch: an der Kreuzung ist das Rot um rund 27 Stufen
// kraeftiger als auf einer einzelnen Lage. Die Pruefung bleibt als
// Nachstellung stehen, bis entschieden ist, wie sie behoben wird — die drei
// moeglichen Wege stehen im BACKLOG.
test.fixme('eine gemalte Terrain-Fläche ist überall gleich deckend', async ({ page }) => {
  await oeffneEditor(page);
  await werkzeug(page, 'terrain');

  // Zeichnen und Bild ablegen — in einem eigenen Schritt, damit zwischen
  // Playwright und der Seite kein langes Versprechen haengt.
  await page.evaluate(() => {
    const T = window.T;
    T.state().patchTerrain({ color: 0xff0000, alpha: 0.5, width: 60, smoothing: 0 });
    T.look(0, 0, 1);
    T.pump(2);
    // Ein Strich, der sich selbst kreuzt: hin und wieder zurueck ueber die
    // eigene Spur. Genau das tut, wer eine Flaeche ausmalt.
    T.stroke([
      [-150, -80],
      [0, 0],
      [150, 80],
      [150, -80],
      [0, 0],
      [-150, 80],
    ]);
    T.pump(3);
  });
  await page.waitForTimeout(300);

  const messung = await page.evaluate<Messung>(() => {
    // Die Weltmitte (0|0) ist die Kreuzung; auf halbem Weg nach aussen liegt
    // eine einzelne Lage.
    const [kreuzung, einzeln] = window.T.probe([
      [0, 0],
      [100, 53],
    ]);
    return { einzeln, kreuzung };
  });

  // Rot ist gesetzt; beide Stellen müssen dieselbe Farbe zeigen. Ein kleiner
  // Spielraum bleibt für die Kantenglättung.
  expect(messung.einzeln[0]).toBeGreaterThan(40);
  expect(Math.abs(messung.kreuzung[0] - messung.einzeln[0])).toBeLessThanOrEqual(6);
  expect(Math.abs(messung.kreuzung[1] - messung.einzeln[1])).toBeLessThanOrEqual(6);
});
