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

test('eine gemalte Terrain-Fläche ist überall gleich deckend', async ({ page }) => {
  await oeffneEditor(page);
  await werkzeug(page, 'terrain');

  // Gezeichnet wird in Canvas-Koordinaten — so, wie ein Zeiger es taete.
  const messung = await page.evaluate<Messung>(() => {
    const T = window.T;
    T.state().patchTerrain({ color: 0xff0000, alpha: 0.5, width: 60, smoothing: 0 });
    T.pump(1);

    const c = T.canvas()!;
    const mx = Math.round(c.clientWidth / 2);
    const my = Math.round(c.clientHeight / 2);

    // Ein Strich, der sich in der Mitte selbst kreuzt: hin und wieder zurueck
    // ueber die eigene Spur. Genau das tut, wer eine Flaeche ausmalt.
    T.stroke([
      [mx - 150, my - 80],
      [mx, my],
      [mx + 150, my + 80],
      [mx + 150, my - 80],
      [mx, my],
      [mx - 150, my + 80],
    ]);
    T.pump(3);

    // Die Kreuzung liegt in der Mitte; eine einzelne Lage auf halbem Weg nach
    // aussen entlang des ersten Schenkels.
    const [kreuzung, einzeln] = T.probe([
      [mx, my],
      [mx - 75, my - 40],
    ]);
    return { einzeln, kreuzung };
  });

  // Rot ist gesetzt; beide Stellen müssen dieselbe Farbe zeigen. Ein kleiner
  // Spielraum bleibt für die Kantenglättung.
  expect(messung.einzeln[0]).toBeGreaterThan(40);
  expect(Math.abs(messung.kreuzung[0] - messung.einzeln[0])).toBeLessThanOrEqual(6);
  expect(Math.abs(messung.kreuzung[1] - messung.einzeln[1])).toBeLessThanOrEqual(6);
});
