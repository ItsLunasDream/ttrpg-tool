import { describe, expect, it } from 'vitest';
import { PaintBiome, PaintHeight, SetHeightMap } from '@/model/commands';
import { createDocument, heightMapOf, isHeightLayer, makeHeightMap, canHoldObjects } from '@/model/document';
import { migrate, packProject, unpackProject } from '@/io/project';
import { defaultFilters } from '@/model/filters';
import { stampBiome, stampHeight, stampHeightLine } from '@/model/heightBrush';
import { heightPixels } from '@/engine/heightLayer';
import { BIOMES, SEA_LEVEL, type HeightMap, type MapDocument } from '@/model/types';

function feld(cols = 9, rows = 9, start = 0.3): HeightMap {
  return { cols, rows, samplesPerTile: 1, data: new Array<number>(cols * rows).fill(start) };
}

const at = (m: HeightMap, x: number, y: number) => m.data[y * m.cols + x];

describe('Höhen-Pinsel', () => {
  it('hebt in der Mitte am stärksten an', () => {
    const m = feld();
    const werte = stampHeight(m, 4.5, 4.5, { mode: 'raise', radius: 3, strength: 1, target: 0.5 });
    const mitte = werte.get(4 * 9 + 4)!;
    const rand = werte.get(4 * 9 + 6)!;
    expect(mitte).toBeGreaterThan(rand);
    expect(rand).toBeGreaterThan(0.3);
  });

  /**
   * Der quadratische Abfall soll am Rand sauber auf null gehen. Täte er das
   * nicht, bliebe an der Pinselgrenze eine sichtbare Kante stehen.
   */
  it('wirkt außerhalb des Radius gar nicht', () => {
    const m = feld(21, 21);
    const werte = stampHeight(m, 10.5, 10.5, { mode: 'raise', radius: 3, strength: 1, target: 0.5 });
    for (const index of werte.keys()) {
      const x = index % 21;
      const y = Math.floor(index / 21);
      expect(Math.hypot(x + 0.5 - 10.5, y + 0.5 - 10.5)).toBeLessThan(3);
    }
  });

  it('senkt ab, wenn der Modus es sagt', () => {
    const m = feld();
    const werte = stampHeight(m, 4.5, 4.5, { mode: 'lower', radius: 3, strength: 1, target: 0.5 });
    expect(werte.get(4 * 9 + 4)!).toBeLessThan(0.3);
  });

  it('bleibt zwischen 0 und 1', () => {
    const hoch = feld(5, 5, 0.98);
    const w1 = stampHeight(hoch, 2.5, 2.5, { mode: 'raise', radius: 3, strength: 1, target: 0.5 });
    for (const v of w1.values()) expect(v).toBeLessThanOrEqual(1);

    const tief = feld(5, 5, 0.02);
    const w2 = stampHeight(tief, 2.5, 2.5, { mode: 'lower', radius: 3, strength: 1, target: 0.5 });
    for (const v of w2.values()) expect(v).toBeGreaterThanOrEqual(0);
  });

  it('ebnet auf die Zielhöhe zu ein', () => {
    const m = feld(5, 5, 0.2);
    const werte = stampHeight(m, 2.5, 2.5, { mode: 'flatten', radius: 3, strength: 1, target: 0.8 });
    const mitte = werte.get(2 * 5 + 2)!;
    expect(mitte).toBeGreaterThan(0.2);
    expect(mitte).toBeLessThanOrEqual(0.8);
  });

  it('glätten macht aus einer Spitze eine Kuppe', () => {
    const m = feld(9, 9, 0.2);
    m.data[4 * 9 + 4] = 1;
    const vorher = at(m, 4, 4);
    const werte = stampHeightLine(m, 4.5, 4.5, 4.5, 4.5, {
      mode: 'smooth',
      radius: 3,
      strength: 1,
      target: 0.5,
    });
    expect(werte.get(4 * 9 + 4)!).toBeLessThan(vorher);
    // Die Nachbarn steigen dabei an — Masse wird verteilt, nicht abgetragen.
    expect(at(m, 4, 5)).toBeGreaterThan(0.2);
  });

  it('ein Strich lässt keine Lücken', () => {
    const m = feld(31, 9, 0.2);
    stampHeightLine(m, 2, 4.5, 28, 4.5, { mode: 'raise', radius: 2, strength: 1, target: 0.5 });
    for (let x = 3; x < 27; x++) {
      expect(at(m, x, 4)).toBeGreaterThan(0.2);
    }
  });

  /**
   * Die Abdrücke eines Zuges müssen einander sehen; sonst glättete ein langer
   * Zug immer nur gegen den Anfangszustand.
   */
  it('spätere Abdrücke bauen auf früheren auf', () => {
    const m = feld(9, 9, 0.2);
    stampHeightLine(m, 4.5, 4.5, 4.5, 4.5, { mode: 'raise', radius: 3, strength: 0.5, target: 0.5 });
    const nachEins = at(m, 4, 4);
    stampHeightLine(m, 4.5, 4.5, 4.5, 4.5, { mode: 'raise', radius: 3, strength: 0.5, target: 0.5 });
    expect(at(m, 4, 4)).toBeGreaterThan(nachEins);
  });
});

describe('Rasterebene im Dokument', () => {
  function docMitRaster(): { doc: MapDocument; id: string } {
    const doc = createDocument(10, 8, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    new SetHeightMap(id, makeHeightMap(10, 8, 1)).do(doc);
    return { doc, id };
  }

  it('anlegen macht aus dem Layer eine Rasterebene', () => {
    const { doc, id } = docMitRaster();
    expect(isHeightLayer(doc, id)).toBe(true);
    expect(heightMapOf(doc, id)?.data).toHaveLength(80);
  });

  /** Eine Rasterebene nimmt keine Objekte auf — sonst lägen Props unter der Textur. */
  it('nimmt keine Objekte auf', () => {
    const { doc, id } = docMitRaster();
    expect(canHoldObjects(doc, id)).toBe(false);
  });

  it('entfernen macht sie wieder zur Objektebene', () => {
    const { doc, id } = docMitRaster();
    const cmd = new SetHeightMap(id, null);
    cmd.do(doc);
    expect(isHeightLayer(doc, id)).toBe(false);
    expect(canHoldObjects(doc, id)).toBe(true);
    cmd.undo(doc);
    expect(isHeightLayer(doc, id)).toBe(true);
    expect(heightMapOf(doc, id)?.data).toHaveLength(80);
  });

  /**
   * Die Stützstellen sind feiner als das Raster — mit einer je Feld sah jede
   * Küste treppig aus.
   */
  it('legt mehrere Stützstellen je Feld an', () => {
    const m = makeHeightMap(10, 8, 2);
    expect(m.cols).toBe(20);
    expect(m.rows).toBe(16);
    expect(m.samplesPerTile).toBe(2);
    expect(m.data).toHaveLength(320);
  });

  it('eine frische Ebene liegt unter der Meereshöhe', () => {
    const { doc, id } = docMitRaster();
    for (const v of heightMapOf(doc, id)!.data) expect(v).toBeLessThan(SEA_LEVEL);
  });

  it('malen und rückgängig machen', () => {
    const { doc, id } = docMitRaster();
    const vorher = [...heightMapOf(doc, id)!.data];
    const cmd = new PaintHeight(id, new Map([[5, 0.9]]));
    cmd.do(doc);
    expect(heightMapOf(doc, id)!.data[5]).toBe(0.9);
    cmd.undo(doc);
    expect(heightMapOf(doc, id)!.data).toEqual(vorher);
  });

  /**
   * Beim Verschmelzen muss der *ältere* Ausgangswert gewinnen — sonst führte
   * ein Rückgängig nur bis zum vorletzten Abdruck zurück.
   */
  it('verschmolzene Abdrücke gehen bis zum Anfang zurück', () => {
    const { doc, id } = docMitRaster();
    const start = heightMapOf(doc, id)!.data[5];

    const erste = new PaintHeight(id, new Map([[5, 0.6]]), 'x', 'm');
    erste.do(doc);
    const zweite = new PaintHeight(id, new Map([[5, 0.9]]), 'x', 'm');
    zweite.do(doc);
    erste.absorb(zweite);

    erste.undo(doc);
    expect(heightMapOf(doc, id)!.data[5]).toBeCloseTo(start, 9);
  });

  it('ein Befehl auf eine Ebene ohne Höhenfeld tut nichts', () => {
    const doc = createDocument(5, 5, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    expect(new PaintHeight(id, new Map([[0, 1]])).do(doc)).toEqual([]);
  });
});

describe('Einfärbung', () => {
  it('Wasser ist blau, Gipfel sind hell', () => {
    const m: HeightMap = { cols: 2, rows: 1, samplesPerTile: 1, data: [0.05, 1] };
    const px = heightPixels(m, 0, undefined, 0, m.rows - 1, 1);
    const [r0, , b0] = [px[0], px[1], px[2]];
    const [r1, g1, b1] = [px[4], px[5], px[6]];
    expect(b0).toBeGreaterThan(r0);
    expect(r1).toBeGreaterThan(200);
    expect(g1).toBeGreaterThan(200);
    expect(b1).toBeGreaterThan(200);
  });

  /**
   * Der Sprung an der Meereshöhe ist Absicht: eine Küste ist eine Linie, kein
   * Verlauf. Ohne die harte Kante zerfließt die Karte.
   */
  it('an der Meereshöhe springt die Farbe', () => {
    const m: HeightMap = { cols: 2, rows: 1, samplesPerTile: 1, data: [SEA_LEVEL - 0.002, SEA_LEVEL] };
    const px = heightPixels(m, 0, undefined, 0, m.rows - 1, 1);
    const unterschied =
      Math.abs(px[0] - px[4]) + Math.abs(px[1] - px[5]) + Math.abs(px[2] - px[6]);
    expect(unterschied).toBeGreaterThan(100);
  });

  it('liefert für jedes Feld vier Werte mit voller Deckkraft', () => {
    const px = heightPixels(
      { cols: 3, rows: 2, samplesPerTile: 1, data: new Array(6).fill(0.5) },
      1,
      undefined,
      0,
      1,
      1,
    );
    expect(px).toHaveLength(24);
    for (let i = 3; i < px.length; i += 4) expect(px[i]).toBe(255);
  });
});


describe('Rasterebene in der Projektdatei', () => {
  it('das Höhenfeld übersteht Speichern und Laden', () => {
    const doc = createDocument(6, 4, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    new SetHeightMap(id, makeHeightMap(6, 4, 2)).do(doc);
    new PaintHeight(id, new Map([[7, 0.87]])).do(doc);

    const { bundle } = unpackProject(packProject(doc));
    const zurueck = bundle.doc.heightMaps?.[id];
    expect(zurueck?.data).toEqual(doc.heightMaps![id].data);
    expect(zurueck?.samplesPerTile).toBe(2);
    expect(bundle.doc.layers[id].kind).toBe('height');
  });

  /**
   * `migrate` baut das Dokument Feld für Feld auf. Die Filter über der ganzen
   * Karte standen dort nicht — sie gingen bei jedem Speichern verloren, ohne
   * dass es auffiel. Der Test hält die Stelle jetzt fest.
   */
  it('die Filter über der ganzen Karte gehen nicht verloren', () => {
    const doc = createDocument(4, 4, 'x');
    doc.filters = { ...defaultFilters(), saturation: 0.3, tint: 0x3355ff, tintAmount: 0.4 };
    const { bundle } = unpackProject(packProject(doc));
    expect(bundle.doc.filters?.saturation).toBe(0.3);
    expect(bundle.doc.filters?.tintAmount).toBe(0.4);
  });

  it('ein Höhenfeld ohne passenden Layer wird verworfen', () => {
    const doc = createDocument(4, 4, 'x') as unknown as Record<string, unknown>;
    doc.heightMaps = { gibtsnicht: makeHeightMap(4, 4, 1) };
    const bericht = { warnings: [] as string[] };
    const zurueck = migrate(JSON.parse(JSON.stringify(doc)), bericht);
    expect(zurueck.heightMaps).toEqual({});
    expect(bericht.warnings).toHaveLength(1);
  });

  it('ein Höhenfeld mit falscher Länge wird verworfen', () => {
    const doc = createDocument(4, 4, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    const kaputt = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
    kaputt.heightMaps = { [id]: { cols: 8, rows: 8, samplesPerTile: 2, data: [0.1, 0.2] } };
    const zurueck = migrate(kaputt, { warnings: [] });
    expect(zurueck.heightMaps).toEqual({});
  });

  /** Ältere Dateien kennen die Auflösung nicht; damals war es eine je Feld. */
  it('ein Feld ohne Auflösungsangabe bekommt eine je Feld', () => {
    const doc = createDocument(4, 4, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    const alt = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
    alt.heightMaps = { [id]: { cols: 4, rows: 4, data: new Array(16).fill(0.3) } };
    const zurueck = migrate(alt, { warnings: [] });
    expect(zurueck.heightMaps?.[id].samplesPerTile).toBe(1);
  });
});


describe('Biome', () => {
  /**
   * Biome werden nicht anteilig gemischt — eine Stützstelle gehört zu einem
   * Biom oder nicht. Der weiche Abfall des Höhenpinsels wird darum hier zu
   * einer Schwelle.
   */
  it('färbt alles im Radius voll ein, nichts darüber hinaus', () => {
    const m = feld(21, 21);
    const werte = stampBiome(m, 10.5, 10.5, 4, 3);
    for (const [index, wert] of werte) {
      expect(wert).toBe(3);
      const x = index % 21;
      const y = Math.floor(index / 21);
      expect(Math.hypot(x + 0.5 - 10.5, y + 0.5 - 10.5)).toBeLessThanOrEqual(4);
    }
    // Die Mitte selbst ist dabei.
    expect(werte.get(10 * 21 + 10)).toBe(3);
  });

  it('meldet nichts, wo das Biom schon stimmt', () => {
    const m = feld(9, 9);
    m.biome = new Array(81).fill(3);
    expect(stampBiome(m, 4.5, 4.5, 3, 3).size).toBe(0);
  });

  it('Biom 0 nimmt ein gemaltes wieder weg', () => {
    const m = feld(9, 9);
    m.biome = new Array(81).fill(5);
    const werte = stampBiome(m, 4.5, 4.5, 2, 0);
    expect(werte.size).toBeGreaterThan(0);
    for (const wert of werte.values()) expect(wert).toBe(0);
  });

  it('malen und rückgängig machen', () => {
    const doc = createDocument(6, 4, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    new SetHeightMap(id, makeHeightMap(6, 4, 1)).do(doc);

    const cmd = new PaintBiome(id, new Map([[3, 4]]));
    cmd.do(doc);
    expect(doc.heightMaps![id].biome![3]).toBe(4);
    cmd.undo(doc);
    expect(doc.heightMaps![id].biome![3]).toBe(0);
  });

  /** Das Biomfeld entsteht erst, wenn wirklich eines gemalt wird. */
  it('eine frische Rasterebene hat gar kein Biomfeld', () => {
    const doc = createDocument(6, 4, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    new SetHeightMap(id, makeHeightMap(6, 4, 1)).do(doc);
    expect(doc.heightMaps![id].biome).toBeUndefined();
  });

  it('ein gemaltes Biom ersetzt die Höhenfarbe', () => {
    const m: HeightMap = { cols: 2, rows: 1, samplesPerTile: 1, data: [0.9, 0.9] };
    m.biome = [0, 7];
    const px = heightPixels(m, 0, undefined, 0, m.rows - 1, 1);
    const wueste = BIOMES[6];
    expect(px[4]).toBe((wueste.color >> 16) & 0xff);
    expect(px[5]).toBe((wueste.color >> 8) & 0xff);
    expect(px[6]).toBe(wueste.color & 0xff);
    // Das Feld ohne Biom bleibt bei der Höhenfarbe — hier Fels/Schnee.
    expect(px[0]).not.toBe(px[4]);
  });

  it('Biome überstehen Speichern und Laden', () => {
    const doc = createDocument(6, 4, 'x');
    const id = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    new SetHeightMap(id, makeHeightMap(6, 4, 1)).do(doc);
    new PaintBiome(id, new Map([[2, 6]])).do(doc);
    const { bundle } = unpackProject(packProject(doc));
    expect(bundle.doc.heightMaps?.[id].biome?.[2]).toBe(6);
  });
});


describe('Feinere Abtastung beim Einfärben', () => {
  /**
   * Mit einem Pixel je Stützstelle war jede Biomkante eine Treppe mit einer
   * Stufe je Stützstelle, und die Küste verschmierte, weil die Grafikkarte
   * *nach* dem Einfärben interpoliert. Darum wird feiner abgetastet.
   */
  it('liefert je Stützstelle mehrere Pixel', () => {
    const m: HeightMap = { cols: 4, rows: 3, samplesPerTile: 1, data: new Array(12).fill(0.5) };
    expect(heightPixels(m, 0, undefined, 0, 2, 3)).toHaveLength(4 * 3 * 9 * 4);
    expect(heightPixels(m, 0, undefined, 0, 2, 1)).toHaveLength(4 * 3 * 4);
  });

  /**
   * Der eigentliche Zweck: zwischen zwei Stützstellen unterschiedlicher Höhe
   * entstehen Zwischenwerte, und die Farbentscheidung fällt darauf — die
   * Küstenlinie wird dadurch eine Linie statt eines weichen Streifens.
   */
  it('mischt die Höhe zwischen den Stützstellen', () => {
    const m: HeightMap = { cols: 2, rows: 1, samplesPerTile: 1, data: [0, 1] };
    const px = heightPixels(m, 0, undefined, 0, 0, 5);
    // Zehn Pixel für zwei Stützstellen; die mittleren liegen dazwischen.
    const helligkeit = (i: number) => px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2];
    expect(helligkeit(0)).toBeLessThan(helligkeit(5));
    expect(helligkeit(5)).toBeLessThan(helligkeit(9));
  });

  /**
   * Der zweite Zweck: an einer Biomkante bringt jede der vier umliegenden
   * Stützstellen ihre Farbe anteilig ein. Ohne das springt die Farbe in einer
   * ganzen Stützstelle um — die Treppe, wegen der es die feinere Abtastung
   * überhaupt gibt. Feiner abzutasten allein genügt dafür nicht: nimmt man
   * die Farbe der nächsten Stützstelle, bleibt die Stufe gleich groß.
   */
  it('mischt Biome an der Kante', () => {
    const m: HeightMap = { cols: 2, rows: 1, samplesPerTile: 1, data: [0.9, 0.9] };
    m.biome = [3, 7];
    const px = heightPixels(m, 0, undefined, 0, 0, 4);
    const rot = (i: number) => px[i * 4];
    const links = (BIOMES[2].color >> 16) & 0xff;
    const rechts = (BIOMES[6].color >> 16) & 0xff;
    expect(links).not.toBe(rechts);
    // Acht Pixel, außen die reinen Farben, innen ein Übergang.
    expect(rot(0)).toBe(links);
    expect(rot(7)).toBe(rechts);
    const zwischen = [rot(2), rot(3), rot(4), rot(5)];
    for (const w of zwischen) {
      expect(w).toBeGreaterThan(Math.min(links, rechts));
      expect(w).toBeLessThan(Math.max(links, rechts));
    }
    // ... und der läuft monoton von der einen zur anderen Farbe.
    const richtung = links < rechts ? 1 : -1;
    for (let i = 1; i < zwischen.length; i++)
      expect((zwischen[i] - zwischen[i - 1]) * richtung).toBeGreaterThan(0);
  });

  /**
   * Wo kein Biom liegt, mischt die Kante gegen die Höhenfarbe — sonst hätte
   * jedes gemalte Biom einen harten Rand gegen das Gelände.
   */
  it('mischt ein Biom gegen die Höhenfarbe aus', () => {
    const m: HeightMap = { cols: 2, rows: 1, samplesPerTile: 1, data: [0.9, 0.9] };
    m.biome = [0, 7];
    const px = heightPixels(m, 0, undefined, 0, 0, 4);
    const rot = (i: number) => px[i * 4];
    expect(rot(0)).toBe(Math.round(heightPixels(m, 0, undefined, 0, 0, 1)[0]));
    expect(rot(7)).toBe((BIOMES[6].color >> 16) & 0xff);
    expect(rot(4)).not.toBe(rot(0));
    expect(rot(4)).not.toBe(rot(7));
  });
});
