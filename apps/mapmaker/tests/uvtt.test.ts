import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getLanguage, setLanguage } from '@/i18n';
import {
  UVTT_FORMAT,
  applyExportCleanup,
  buildUvtt,
  checkConsistency,
  isCleanupEmpty,
  planExportCleanup,
  fromUvttColor,
  parseUvtt,
  serializeUvtt,
  toUvttColor,
  type UvttFile,
} from '@/io/uvtt';
import { createDocument } from '@/model/document';
import type { MapDocument } from '@/model/types';

const IMAGE = 'AAAA';

function docWithVtt(tileSize = 100): MapDocument {
  const doc = createDocument(40, 30, 'Krypta');
  doc.grid.tileSize = tileSize;
  doc.vtt.walls = [
    // Rechteckiger Raum, geschlossen.
    {
      id: 'w1',
      points: [0, 0, 500, 0, 500, 400, 0, 400],
      type: 'normal',
      closed: true,
    },
    // Schräge Wand, offen.
    { id: 'w2', points: [600, 100, 850, 350], type: 'normal', closed: false },
    // Fenster gehört in objects_line_of_sight.
    { id: 'w3', points: [900, 0, 900, 200], type: 'window', closed: false },
    // Unsichtbare Wände sind reine Editor-Hilfen und dürfen nicht exportiert werden.
    { id: 'w4', points: [0, 900, 300, 900], type: 'invisible', closed: false },
  ];
  doc.vtt.portals = [
    { id: 'p1', bounds: [200, 0, 300, 0], closed: true, freestanding: false },
    { id: 'p2', bounds: [500, 150, 500, 250], closed: false, freestanding: true },
  ];
  doc.vtt.lights = [
    { id: 'l1', x: 250, y: 200, range: 4.5, intensity: 1, color: 0xffcc88, alpha: 1, shadows: true },
    { id: 'l2', x: 700, y: 300, range: 2, intensity: 0.5, color: 0x5588ff, alpha: 0.5, shadows: false },
  ];
  doc.vtt.ambientLight = 0x203040;
  doc.vtt.ambientAlpha = 0.75;
  return doc;
}

describe('Farbformat', () => {
  it('schreibt AARRGGBB — Alpha zuerst', () => {
    expect(toUvttColor(0xffcc88, 1)).toBe('ffffcc88');
    expect(toUvttColor(0x000000, 1)).toBe('ff000000');
    expect(toUvttColor(0xffffff, 0)).toBe('00ffffff');
  });

  it('überlebt die Verarbeitung des Foundry-Importers', () => {
    // moo-man/FVTT-DD-Import macht: "#" + color.substring(2)
    // Bei RRGGBBAA käme aus einem warmen ffcc88 ein violettes cc88ff.
    const written = toUvttColor(0xffcc88, 1);
    expect('#' + written.substring(2)).toBe('#ffcc88');
  });

  it('liest acht Stellen als AARRGGBB', () => {
    expect(fromUvttColor('80ffcc88')).toEqual({ color: 0xffcc88, alpha: 128 / 255 });
  });

  it('liest sechs Stellen als RGB mit vollem Alpha', () => {
    expect(fromUvttColor('ffcc88')).toEqual({ color: 0xffcc88, alpha: 1 });
  });

  it('verträgt Raute und Großschreibung', () => {
    expect(fromUvttColor('#FFCC88').color).toBe(0xffcc88);
  });

  it('fällt bei Unsinn auf Weiß zurück, statt zu werfen', () => {
    expect(fromUvttColor('quatsch')).toEqual({ color: 0xffffff, alpha: 1 });
    expect(fromUvttColor('')).toEqual({ color: 0xffffff, alpha: 1 });
  });

  it('ist für Farbe und Alpha umkehrbar', () => {
    for (const color of [0x000000, 0xffffff, 0x123456, 0xffcc88]) {
      expect(fromUvttColor(toUvttColor(color, 1)).color).toBe(color);
    }
  });
});

describe('buildUvtt', () => {
  it('gibt Koordinaten in Grid-Einheiten aus, nicht in Pixeln', () => {
    const file = buildUvtt(docWithVtt(100), { image: IMAGE, pixelsPerGrid: 100 });
    // 500 Weltpixel bei 100 px/Tile sind 5 Grid-Einheiten.
    expect(file.line_of_sight[0][1]).toEqual({ x: 5, y: 0 });
    expect(file.lights[0].position).toEqual({ x: 2.5, y: 2 });
  });

  it('rechnet unabhängig von der Bild-Auflösung auf die Tile-Größe um', () => {
    // Tile-Größe 80 im Dokument, Bild mit 160 px/Tile: die Grid-Koordinaten
    // dürfen sich davon nicht beeinflussen lassen.
    const file = buildUvtt(docWithVtt(80), { image: IMAGE, pixelsPerGrid: 160 });
    expect(file.line_of_sight[0][1]).toEqual({ x: 6.25, y: 0 });
    expect(file.resolution.pixels_per_grid).toBe(160);
  });

  it('schließt geschlossene Wandzüge wieder zum Anfangspunkt', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    const room = file.line_of_sight[0];
    expect(room).toHaveLength(5);
    expect(room[4]).toEqual(room[0]);
  });

  it('trennt Fenster in objects_line_of_sight', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    expect(file.line_of_sight).toHaveLength(2);
    expect(file.objects_line_of_sight).toHaveLength(1);
    expect(file.objects_line_of_sight[0][0]).toEqual({ x: 9, y: 0 });
  });

  it('lässt unsichtbare Wände weg', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    const alle = [...file.line_of_sight, ...file.objects_line_of_sight].flat();
    expect(alle.some((p) => p.y === 9)).toBe(false);
  });

  it('gibt portals.rotation im Bogenmaß an', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    // p1 verläuft waagerecht, p2 senkrecht nach unten.
    expect(file.portals[0].rotation).toBeCloseTo(0, 5);
    expect(file.portals[1].rotation).toBeCloseTo(Math.PI / 2, 5);
    // Nicht in Grad: 90 wäre der klassische Fehlgriff.
    expect(file.portals[1].rotation).toBeLessThan(2);
  });

  it('setzt die Türposition auf die Mitte der Öffnung', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    expect(file.portals[0].position).toEqual({ x: 2.5, y: 0 });
    expect(file.portals[0].bounds).toHaveLength(2);
  });

  it('überträgt Türzustände', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    expect(file.portals[0]).toMatchObject({ closed: true, freestanding: false });
    expect(file.portals[1]).toMatchObject({ closed: false, freestanding: true });
  });

  it('gibt die Kartengröße in Tiles an', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    expect(file.resolution.map_size).toEqual({ x: 40, y: 30 });
    expect(file.resolution.map_origin).toEqual({ x: 0, y: 0 });
    expect(file.format).toBe(UVTT_FORMAT);
  });

  it('behält Lichtreichweiten in Tiles', () => {
    const file = buildUvtt(docWithVtt(), { image: IMAGE, pixelsPerGrid: 100 });
    // Foundry rechnet dim = range * Feldgröße — Pixel wären hier grob falsch.
    expect(file.lights[0].range).toBe(4.5);
  });

  it('nimmt das Bild unverändert auf', () => {
    const file = buildUvtt(docWithVtt(), { image: 'ABCDEF', pixelsPerGrid: 100 });
    expect(file.image).toBe('ABCDEF');
  });
});

describe('Roundtrip: schreiben, lesen, vergleichen', () => {
  it('liefert Wände, Türen und Lichter unverändert zurück', () => {
    const doc = docWithVtt(100);
    const text = serializeUvtt(buildUvtt(doc, { image: IMAGE, pixelsPerGrid: 100 }));
    const back = parseUvtt(text, doc.grid.tileSize);

    // Unsichtbare Wände sind absichtlich verloren, der Rest muss stimmen.
    expect(back.vtt.walls).toHaveLength(3);
    expect(back.vtt.portals).toHaveLength(2);
    expect(back.vtt.lights).toHaveLength(2);
    expect(back.size).toEqual({ cols: 40, rows: 30 });
  });

  it('stellt Wandpunkte in Weltpixeln wieder her', () => {
    const doc = docWithVtt(100);
    const back = parseUvtt(serializeUvtt(buildUvtt(doc, { image: IMAGE, pixelsPerGrid: 100 })), 100);
    const room = back.vtt.walls[0];
    expect(room.closed).toBe(true);
    // Der Schlusspunkt wurde beim Lesen wieder entfernt.
    expect(room.points).toEqual([0, 0, 500, 0, 500, 400, 0, 400]);
  });

  it('erkennt Fenster wieder als Fenster', () => {
    const doc = docWithVtt(100);
    const back = parseUvtt(serializeUvtt(buildUvtt(doc, { image: IMAGE, pixelsPerGrid: 100 })), 100);
    expect(back.vtt.walls.filter((w) => w.type === 'window')).toHaveLength(1);
  });

  it('stellt Lichtfarben und Reichweiten wieder her', () => {
    const doc = docWithVtt(100);
    const back = parseUvtt(serializeUvtt(buildUvtt(doc, { image: IMAGE, pixelsPerGrid: 100 })), 100);
    expect(back.vtt.lights[0]).toMatchObject({
      x: 250, y: 200, range: 4.5, color: 0xffcc88, shadows: true,
    });
    expect(back.vtt.lights[1].color).toBe(0x5588ff);
    expect(back.vtt.lights[1].alpha).toBeCloseTo(0.5, 2);
  });

  it('stellt das Umgebungslicht wieder her', () => {
    const doc = docWithVtt(100);
    const back = parseUvtt(serializeUvtt(buildUvtt(doc, { image: IMAGE, pixelsPerGrid: 100 })), 100);
    expect(back.vtt.ambientLight).toBe(0x203040);
    expect(back.vtt.ambientAlpha).toBeCloseTo(0.75, 2);
  });

  it('funktioniert auch bei ungerader Tile-Größe', () => {
    const doc = docWithVtt(70);
    const back = parseUvtt(serializeUvtt(buildUvtt(doc, { image: IMAGE, pixelsPerGrid: 140 })), 70);
    // 600/70 lässt sich nicht endlich darstellen; der Rundungsfehler muss
    // weit unter einem Pixel bleiben, exakt kann er nicht sein.
    const expected = [600, 100, 850, 350];
    back.vtt.walls[1].points.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 3));
    expect(back.vtt.lights[0].x).toBeCloseTo(250, 3);
  });

  it('erhält Türgeometrie', () => {
    const doc = docWithVtt(100);
    const back = parseUvtt(serializeUvtt(buildUvtt(doc, { image: IMAGE, pixelsPerGrid: 100 })), 100);
    expect(back.vtt.portals[0].bounds).toEqual([200, 0, 300, 0]);
    expect(back.vtt.portals[1].closed).toBe(false);
    expect(back.vtt.portals[1].freestanding).toBe(true);
  });
});

describe('Lesen fremder Dateien', () => {
  const minimal = (over: Partial<UvttFile> = {}): UvttFile => ({
    format: 0.3,
    resolution: { map_origin: { x: 0, y: 0 }, map_size: { x: 10, y: 8 }, pixels_per_grid: 100 },
    line_of_sight: [],
    objects_line_of_sight: [],
    portals: [],
    environment: { baked_lighting: true, ambient_light: 'ffffffff' },
    lights: [],
    image: '',
    ...over,
  });

  it('weist Dateien ohne resolution zurück', () => {
    expect(() => parseUvtt(JSON.stringify({ format: 0.3 }), 100)).toThrow(/resolution/);
  });

  it('weist kaputtes JSON zurück', () => {
    expect(() => parseUvtt('{ nein', 100)).toThrow(/JSON/);
  });

  it('verschiebt den Inhalt bei einem map_origin ungleich null und warnt', () => {
    const file = minimal({
      resolution: { map_origin: { x: 2, y: 1 }, map_size: { x: 10, y: 8 }, pixels_per_grid: 100 },
      line_of_sight: [[{ x: 3, y: 2 }, { x: 4, y: 2 }]],
    });
    const back = parseUvtt(JSON.stringify(file), 100);
    expect(back.vtt.walls[0].points).toEqual([100, 100, 200, 100]);
    expect(back.warnings.join(' ')).toMatch(/map_origin/);
  });

  it('überspringt Türen ohne zwei Punkte statt abzustürzen', () => {
    const file = minimal({
      portals: [{ position: { x: 0, y: 0 }, bounds: [{ x: 0, y: 0 }], rotation: 0, closed: true, freestanding: false }],
    });
    const back = parseUvtt(JSON.stringify(file), 100);
    expect(back.vtt.portals).toHaveLength(0);
    expect(back.warnings.join(' ')).toMatch(/Tür/);
  });

  it('erkennt einen zum Anfang zurücklaufenden Zug als geschlossen', () => {
    const file = minimal({
      line_of_sight: [[{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 0 }]],
    });
    const back = parseUvtt(JSON.stringify(file), 100);
    expect(back.vtt.walls[0].closed).toBe(true);
    expect(back.vtt.walls[0].points).toEqual([0, 0, 200, 0, 200, 200]);
  });

  it('warnt bei neuerem Format, liest aber weiter', () => {
    const back = parseUvtt(JSON.stringify(minimal({ format: 9 })), 100);
    expect(back.warnings.join(' ')).toMatch(/Format 9/);
    expect(back.size).toEqual({ cols: 10, rows: 8 });
  });

  it('kommt mit fehlenden Abschnitten zurecht', () => {
    const back = parseUvtt(
      JSON.stringify({ resolution: { map_size: { x: 4, y: 4 }, pixels_per_grid: 50 } }),
      100,
    );
    expect(back.vtt.walls).toEqual([]);
    expect(back.vtt.lights).toEqual([]);
    expect(back.size).toEqual({ cols: 4, rows: 4 });
  });

  it('meldet ein vorhandenes Bild', () => {
    expect(parseUvtt(JSON.stringify(minimal({ image: 'XYZ' })), 100).image).toBe('XYZ');
    expect(parseUvtt(JSON.stringify(minimal({ image: '' })), 100).image).toBeNull();
  });
});

describe('checkConsistency', () => {
  // Die Meldungen laufen über i18n. Ohne feste Sprache prüfte der Test das,
  // was die Umgebung gerade vorgibt — unter Vitest Englisch, und die deutschen
  // Erwartungen unten schlugen fehl.
  const before = getLanguage();
  beforeAll(() => setLanguage('de'));
  afterAll(() => setLanguage(before));

  it('ist bei einer normalen Quadratkarte still', () => {
    expect(checkConsistency(createDocument(20, 20), 100)).toEqual([]);
  });

  it('weist auf Hex-Raster hin', () => {
    const doc = createDocument(20, 20);
    doc.grid.type = 'hexPointy';
    expect(checkConsistency(doc, 100).join(' ')).toMatch(/Hex/);
  });

  it('weist auf einen Grid-Versatz hin', () => {
    const doc = createDocument(20, 20);
    doc.grid.offsetX = 25;
    expect(checkConsistency(doc, 100).join(' ')).toMatch(/Versatz/);
  });
});

describe('Bereinigung vor dem Export', () => {
  /** Leere Karte, 10 × 10 Felder à 100 px — also 1000 × 1000 Weltpixel. */
  function leer(): MapDocument {
    const doc = createDocument(10, 10);
    doc.grid.tileSize = 100;
    doc.vtt.walls = [];
    doc.vtt.portals = [];
    doc.vtt.lights = [];
    return doc;
  }

  const wand = (id: string, points: number[], type: 'normal' | 'invisible' = 'normal') => ({
    id,
    points,
    type,
    closed: false,
  });

  describe('Türen', () => {
    it('lässt eine freistehende Tür in Ruhe, auch ohne Wand weit und breit', () => {
      const doc = leer();
      doc.vtt.portals = [
        { id: 'p', bounds: [500, 500, 600, 500], closed: true, freestanding: true },
      ];
      expect(planExportCleanup(doc).orphanDoors).toEqual([]);
    });

    it('meldet eine angehängte Tür, deren Wand fehlt', () => {
      const doc = leer();
      doc.vtt.portals = [
        { id: 'p', bounds: [500, 500, 600, 500], closed: true, freestanding: false },
      ];
      expect(planExportCleanup(doc).orphanDoors.map((d) => d.id)).toEqual(['p']);
    });

    it('markiert sie freistehend, statt sie zu löschen', () => {
      const doc = leer();
      doc.vtt.portals = [
        { id: 'p', bounds: [500, 500, 600, 500], closed: true, freestanding: false },
      ];
      const out = applyExportCleanup(doc.vtt, planExportCleanup(doc));
      expect(out.portals).toHaveLength(1);
      expect(out.portals[0].freestanding).toBe(true);
    });

    it('lässt eine Tür in Ruhe, die auf ihrer Wand sitzt', () => {
      const doc = leer();
      doc.vtt.walls = [wand('w', [0, 500, 1000, 500])];
      doc.vtt.portals = [
        { id: 'p', bounds: [400, 500, 500, 500], closed: true, freestanding: false },
      ];
      expect(planExportCleanup(doc).orphanDoors).toEqual([]);
    });

    it('meldet eine Tür nicht, die über das Wandende hinausragt', () => {
      // Beim Ziehen wird auf die Wandrichtung projiziert, ohne am Wandende zu
      // stoppen. Würde die Prüfung beide Türenden verlangen, wären solche
      // völlig gesunden Türen ständig „verwaist".
      const doc = leer();
      doc.vtt.walls = [wand('w', [0, 500, 500, 500])];
      doc.vtt.portals = [
        { id: 'p', bounds: [450, 500, 550, 500], closed: true, freestanding: false },
      ];
      expect(planExportCleanup(doc).orphanDoors).toEqual([]);
    });

    it('zählt unsichtbare Wände nicht — die werden gar nicht exportiert', () => {
      const doc = leer();
      doc.vtt.walls = [wand('w', [0, 500, 1000, 500], 'invisible')];
      doc.vtt.portals = [
        { id: 'p', bounds: [400, 500, 500, 500], closed: true, freestanding: false },
      ];
      expect(planExportCleanup(doc).orphanDoors.map((d) => d.id)).toEqual(['p']);
    });
  });

  describe('Wandenden', () => {
    it('ist bei einem geschlossenen Ring still', () => {
      const doc = leer();
      doc.vtt.walls = [
        { id: 'w', points: [0, 0, 500, 0, 500, 500, 0, 500], type: 'normal', closed: true },
      ];
      expect(planExportCleanup(doc).danglingWallEnds).toEqual([]);
    });

    it('meldet beide Enden einer einzeln stehenden Wand', () => {
      const doc = leer();
      doc.vtt.walls = [wand('w', [100, 100, 400, 100])];
      const enden = planExportCleanup(doc).danglingWallEnds;
      expect(enden).toHaveLength(2);
      expect(enden.map((e) => [e.x, e.y])).toEqual([
        [100, 100],
        [400, 100],
      ]);
    });

    it('lässt einen T-Stoß mitten auf einer Wand gelten', () => {
      // Wand b endet nicht an einem Stützpunkt von a, sondern mittendrin. In
      // Foundry leckt dort nichts, also ist es kein freies Ende.
      const doc = leer();
      doc.vtt.walls = [wand('a', [0, 0, 600, 0]), wand('b', [300, 0, 300, 400])];
      const enden = planExportCleanup(doc).danglingWallEnds;
      expect(enden.map((e) => [e.x, e.y])).toEqual([
        [0, 0],
        [600, 0],
        [300, 400],
      ]);
    });

    it('lässt ein Ende gelten, das an einer Tür sitzt', () => {
      // Wer die Wand für eine Tür auftrennt, hat dort keine Lücke, sondern in
      // Foundry ein Türsegment.
      const doc = leer();
      doc.vtt.walls = [wand('a', [0, 0, 300, 0]), wand('b', [400, 0, 700, 0])];
      doc.vtt.portals = [
        { id: 'p', bounds: [300, 0, 400, 0], closed: true, freestanding: false },
      ];
      const enden = planExportCleanup(doc).danglingWallEnds;
      expect(enden.map((e) => [e.x, e.y])).toEqual([
        [0, 0],
        [700, 0],
      ]);
    });

    it('verändert die Wände nicht — gemeldet ist nicht repariert', () => {
      const doc = leer();
      doc.vtt.walls = [wand('w', [100, 100, 400, 100])];
      const out = applyExportCleanup(doc.vtt, planExportCleanup(doc));
      expect(out.walls).toEqual(doc.vtt.walls);
    });
  });

  describe('Lichter', () => {
    const licht = (id: string, x: number, y: number, range: number) => ({
      id,
      x,
      y,
      range,
      intensity: 1,
      color: 0xffcc88,
      alpha: 1,
      shadows: true,
    });

    it('behält ein Licht außerhalb der Karte, das hineinleuchtet', () => {
      const doc = leer();
      doc.vtt.lights = [licht('l', -200, 500, 3)];
      expect(planExportCleanup(doc).uselessLights).toEqual([]);
    });

    it('entfernt ein Licht, dessen Kreis die Karte nicht erreicht', () => {
      const doc = leer();
      doc.vtt.lights = [licht('nah', -200, 500, 3), licht('fern', -500, 500, 1)];
      const plan = planExportCleanup(doc);
      expect(plan.uselessLights.map((l) => l.id)).toEqual(['fern']);
      expect(applyExportCleanup(doc.vtt, plan).lights.map((l) => l.id)).toEqual(['nah']);
    });

    it('behält ein Licht innerhalb der Karte auch ohne Reichweite', () => {
      const doc = leer();
      doc.vtt.lights = [licht('l', 500, 500, 0)];
      expect(planExportCleanup(doc).uselessLights).toEqual([]);
    });
  });

  it('ist auf einer sauberen Karte still', () => {
    const doc = leer();
    doc.vtt.walls = [
      { id: 'w', points: [0, 0, 500, 0, 500, 500, 0, 500], type: 'normal', closed: true },
    ];
    doc.vtt.portals = [
      { id: 'p', bounds: [100, 0, 200, 0], closed: true, freestanding: false },
    ];
    doc.vtt.lights = [
      { id: 'l', x: 250, y: 250, range: 3, intensity: 1, color: 0xffcc88, alpha: 1, shadows: true },
    ];
    expect(isCleanupEmpty(planExportCleanup(doc))).toBe(true);
  });

  it('rührt das Dokument nicht an', () => {
    const doc = leer();
    doc.vtt.walls = [wand('w', [100, 100, 400, 100])];
    doc.vtt.portals = [
      { id: 'p', bounds: [800, 800, 900, 800], closed: true, freestanding: false },
    ];
    doc.vtt.lights = [
      { id: 'l', x: -900, y: 500, range: 1, intensity: 1, color: 0xffffff, alpha: 1, shadows: false },
    ];
    const vorher = JSON.parse(JSON.stringify(doc.vtt));
    const out = applyExportCleanup(doc.vtt, planExportCleanup(doc));
    expect(doc.vtt).toEqual(vorher);
    // …und die Kopie trägt tatsächlich die Änderungen.
    expect(out.portals[0].freestanding).toBe(true);
    expect(out.lights).toEqual([]);
  });
});
