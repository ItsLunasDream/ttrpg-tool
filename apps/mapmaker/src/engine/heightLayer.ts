/**
 * Darstellung einer Höhen-Rasterebene.
 *
 * Aus dem Höhenfeld wird eine Textur: je Feld ein Pixel, eingefärbt nach einer
 * Farbrampe und aufgehellt oder abgedunkelt nach der Hangneigung. Die Textur
 * liegt danach als *ein* Sprite über der Karte — ein Raster aus zwanzigtausend
 * Rechtecken wäre in Pixi zwanzigtausend Zeichenbefehle.
 *
 * Weich interpoliert wird von der Grafikkarte: die Textur wird linear
 * gefiltert und über die ganze Karte gezogen. Deshalb reicht ein Wert je Feld,
 * obwohl die Karte in Pixeln viel feiner ist — Küsten und Hänge sehen dadurch
 * nicht nach Treppen aus.
 *
 * Die Schattierung ist der Grund, warum das Ergebnis wie eine Landkarte
 * aussieht und nicht wie ein Farbverlauf: sie kommt aus der Steigung zwischen
 * benachbarten Feldern, mit Licht von Nordwesten wie auf gedruckten Karten.
 */

import { Container, Sprite, Texture } from 'pixi.js';
import { BIOMES, SEA_LEVEL, type HeightMap } from '@/model/types';

/**
 * Wie fein die Textur gegenüber den Stützstellen abgetastet wird.
 *
 * Mit einem Pixel je Stützstelle fällt die Farbentscheidung genau auf den
 * Stützstellen, und dazwischen mischt die Grafikkarte *fertige Farben*. Beides
 * ist falsch herum: die Küstenlinie verschmiert zu einem breiten Streifen, und
 * eine Biomkante springt in einer ganzen Stützstelle um.
 *
 * Mit mehreren Pixeln je Stützstelle entstehen Zwischenstellen, und dort wird
 * erst die Höhe und die Biom-Zugehörigkeit gemischt und *danach* eingefärbt.
 * Die Küste wird eine Linie, die Biomkante läuft über die Zwischenpixel aus.
 *
 * Drei und nicht zwei: gemessen auf einer 150x150-Karte kostet ein Bild mit
 * neuer Textur 0,5 ms ohne, 2,0 ms bei zweifacher und 3,4 ms bei dreifacher
 * Abtastung — bei einem Budget von 16 ms ist der Unterschied bezahlbar, und
 * an der Küste sieht man ihn. Über drei hinaus nicht mehr.
 */
const OVERSAMPLE = 3;

/**
 * Stützstellen der Farbrampe: Höhe und Farbe.
 *
 * Zwischen den Stellen wird interpoliert. Der Sprung an der Meereshöhe ist
 * bewusst *kein* weicher Übergang — eine Küste ist eine Linie, kein Verlauf,
 * und ohne die harte Kante zerfließt die Karte.
 */
const RAMP: Array<[number, number]> = [
  [0.0, 0x1d3b5c],
  [0.25, 0x2f6086],
  [SEA_LEVEL - 0.001, 0x4b87ad],
  [SEA_LEVEL, 0xd8c9a0],
  [SEA_LEVEL + 0.04, 0x9db56a],
  [0.58, 0x6f9a52],
  [0.7, 0x4f7a42],
  [0.8, 0x8a7f68],
  [0.9, 0xa89c88],
  [1.0, 0xf2f0ec],
];

function rampColor(h: number): [number, number, number] {
  const v = h < 0 ? 0 : h > 1 ? 1 : h;
  let i = 1;
  while (i < RAMP.length - 1 && RAMP[i][0] < v) i++;
  const [h0, c0] = RAMP[i - 1];
  const [h1, c1] = RAMP[i];
  const t = h1 - h0 <= 0 ? 0 : (v - h0) / (h1 - h0);

  const mix = (a: number, b: number, schicht: number) => {
    const av = (a >> schicht) & 0xff;
    const bv = (b >> schicht) & 0xff;
    return av + (bv - av) * t;
  };
  return [mix(c0, c1, 16), mix(c0, c1, 8), mix(c0, c1, 0)];
}

/**
 * Baut die Pixeldaten der Ebene.
 *
 * Eigene Funktion und nicht Teil der Klasse, damit sich die Einfärbung ohne
 * Canvas prüfen lässt — die Farbrampe ist das, woran man einen Fehler sieht,
 * und ein Test dafür braucht kein DOM.
 */
export function heightPixels(
  map: HeightMap,
  relief = 1,
  ziel?: Uint8ClampedArray,
  vonZeile = 0,
  bisZeile = map.rows - 1,
  oversample = OVERSAMPLE,
): Uint8ClampedArray<ArrayBuffer> {
  const { cols, rows, data } = map;
  const biome = map.biome;
  const k = Math.max(1, Math.round(oversample));
  const breite = cols * k;
  const hoehe = rows * k;
  const out =
    (ziel as Uint8ClampedArray<ArrayBuffer>) ??
    new Uint8ClampedArray(new ArrayBuffer(breite * hoehe * 4));

  /**
   * Höhe an einer *gebrochenen* Stützstellen-Koordinate, bilinear.
   *
   * Wird nur noch für die Nachbarn der Schattierung gebraucht; die Höhe des
   * Pixels selbst fällt in der Schleife zusammen mit den Biom-Gewichten an.
   */
  const hAt = (x: number, y: number): number => {
    const cx = x < 0 ? 0 : x > cols - 1 ? cols - 1 : x;
    const cy = y < 0 ? 0 : y > rows - 1 ? rows - 1 : y;
    const x0 = Math.floor(cx);
    const y0 = Math.floor(cy);
    const x1 = x0 + 1 > cols - 1 ? cols - 1 : x0 + 1;
    const y1 = y0 + 1 > rows - 1 ? rows - 1 : y0 + 1;
    const fx = cx - x0;
    const fy = cy - y0;
    const a = data[y0 * cols + x0];
    const b = data[y0 * cols + x1];
    const c = data[y1 * cols + x0];
    const d = data[y1 * cols + x1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };

  // Einmal angelegt und je Pixel wiederbenutzt: in der Schleife etwas zu
  // erzeugen kostet auf der größten Karte hunderttausend kurzlebige Objekte.
  const misch: [number, number, number] = [0, 0, 0];
  const mische = (id: number, w: number, grund: [number, number, number]): void => {
    if (w <= 0) return;
    if (id > 0) {
      const c = BIOMES[id - 1].color;
      misch[0] += ((c >> 16) & 0xff) * w;
      misch[1] += ((c >> 8) & 0xff) * w;
      misch[2] += (c & 0xff) * w;
    } else {
      misch[0] += grund[0] * w;
      misch[1] += grund[1] * w;
      misch[2] += grund[2] * w;
    }
  };

  // Zeilenbereich in Stützstellen; gezeichnet wird in Ausgabezeilen.
  const y0 = Math.max(0, vonZeile) * k;
  const y1 = Math.min(rows - 1, bisZeile) * k + k - 1;

  for (let oy = y0; oy <= y1; oy++) {
    const sy = (oy + 0.5) / k - 0.5;
    const cy = sy < 0 ? 0 : sy > rows - 1 ? rows - 1 : sy;
    const iy0 = Math.floor(cy);
    const iy1 = iy0 + 1 > rows - 1 ? rows - 1 : iy0 + 1;
    const fy = cy - iy0;

    for (let ox = 0; ox < breite; ox++) {
      const sx = (ox + 0.5) / k - 0.5;
      const cx = sx < 0 ? 0 : sx > cols - 1 ? cols - 1 : sx;
      const ix0 = Math.floor(cx);
      const ix1 = ix0 + 1 > cols - 1 ? cols - 1 : ix0 + 1;
      const fx = cx - ix0;

      // Die vier umliegenden Stützstellen und ihre Anteile an diesem Pixel.
      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;
      const i00 = iy0 * cols + ix0;
      const i10 = iy0 * cols + ix1;
      const i01 = iy1 * cols + ix0;
      const i11 = iy1 * cols + ix1;

      const h = data[i00] * w00 + data[i10] * w10 + data[i01] * w01 + data[i11] * w11;

      let r: number;
      let g: number;
      let b: number;
      const b00 = biome ? biome[i00] : 0;
      if (!biome || (b00 === biome[i10] && b00 === biome[i01] && b00 === biome[i11])) {
        // Alle vier Nachbarn gehören zum selben Biom (oder zu keinem) — der
        // Normalfall, überall außer auf der Kante selbst.
        if (b00 > 0) {
          const c = BIOMES[b00 - 1].color;
          r = (c >> 16) & 0xff;
          g = (c >> 8) & 0xff;
          b = c & 0xff;
        } else {
          [r, g, b] = rampColor(h);
        }
      } else {
        /**
         * Auf der Kante bringt jede Stützstelle ihre Farbe mit ihrem Anteil
         * ein, „kein Biom" die Höhenfarbe. Das ist der Grund, warum die Kante
         * nicht mehr als Treppe erscheint: sie läuft über die Zwischenpixel
         * aus, statt in einer ganzen Stützstelle umzuspringen.
         */
        const grund = rampColor(h);
        misch[0] = 0;
        misch[1] = 0;
        misch[2] = 0;
        mische(b00, w00, grund);
        mische(biome[i10], w10, grund);
        mische(biome[i01], w01, grund);
        mische(biome[i11], w11, grund);
        [r, g, b] = misch;
      }

      // Schattierung nur an Land: auf dem Wasser gäbe die Steigung des
      // Meeresbodens ein Muster, das dort nichts zu suchen hat.
      if (h >= SEA_LEVEL && relief > 0) {
        const neigung = hAt(sx - 1, sy) - hAt(sx + 1, sy) + (hAt(sx, sy - 1) - hAt(sx, sy + 1));
        const f = 1 + neigung * 4 * relief;
        const kf = f < 0.55 ? 0.55 : f > 1.5 ? 1.5 : f;
        r *= kf;
        g *= kf;
        b *= kf;
      }

      const p = (oy * breite + ox) * 4;
      out[p] = r;
      out[p + 1] = g;
      out[p + 2] = b;
      out[p + 3] = 255;
    }
  }
  return out;
}

/** Ein Sprite über der Karte, dessen Textur aus dem Höhenfeld kommt. */
export class HeightLayerView {
  readonly view = new Container();

  private sprite = new Sprite();
  private canvas: HTMLCanvasElement | null = null;
  private bild: ImageData | null = null;
  private groesse = { cols: 0, rows: 0 };

  constructor() {
    this.view.addChild(this.sprite);
    this.view.label = 'height-layer';
  }

  /**
   * Frischt die Textur auf und spannt sie über die Karte.
   *
   * `vonZeile`/`bisZeile` grenzen ein, was neu eingefärbt wird. Die Pixel
   * bleiben zwischen den Aufrufen liegen; nur die genannten Zeilen werden
   * überschrieben. Über das ganze Feld zu laufen kostete auf der größten Karte
   * mehr als die Hälfte des Bildbudgets, obwohl ein Abdruck nur ein paar
   * Zeilen anfasst.
   */
  update(
    map: HeightMap,
    width: number,
    height: number,
    relief: number,
    vonZeile = 0,
    bisZeile = map.rows - 1,
  ): void {
    if (typeof document === 'undefined') return;
    if (map.cols < 1 || map.rows < 1) return;

    // Die Textur ist feiner als das Höhenfeld — siehe OVERSAMPLE.
    const k = OVERSAMPLE;
    const texturBreite = map.cols * k;
    const texturHoehe = map.rows * k;

    let alles = false;
    if (!this.canvas || this.groesse.cols !== map.cols || this.groesse.rows !== map.rows) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = texturBreite;
      this.canvas.height = texturHoehe;
      this.groesse = { cols: map.cols, rows: map.rows };
      this.bild = new ImageData(texturBreite, texturHoehe);
      // Neue Größe heißt neue Textur; die alte gibt ihren Speicher frei.
      this.sprite.texture?.destroy(true);
      this.sprite.texture = Texture.from(this.canvas);
      alles = true;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx || !this.bild) return;

    // Eine Zeile Rand: die Schattierung eines Feldes liest seine Nachbarn,
    // also ändert sich auch die Zeile über und unter dem Abdruck.
    const y0 = alles ? 0 : Math.max(0, vonZeile - 1);
    const y1 = alles ? map.rows - 1 : Math.min(map.rows - 1, bisZeile + 1);
    heightPixels(map, relief, this.bild.data as unknown as Uint8ClampedArray, y0, y1);

    ctx.putImageData(this.bild, 0, 0, 0, y0 * k, texturBreite, (y1 - y0 + 1) * k);
    this.sprite.texture.source.update();

    this.sprite.width = width;
    this.sprite.height = height;
    this.sprite.position.set(0, 0);
  }

  destroy(): void {
    this.sprite.texture?.destroy(true);
    this.view.destroy({ children: true });
  }
}
