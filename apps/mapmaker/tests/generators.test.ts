import { describe, expect, it } from 'vitest';
import {
  GENERATOR_IDS,
  buildGeneratorCommands,
  defaultGeneratorParams,
  runGenerator,
  type GeneratorId,
} from '@/model/generators';
import { generateWorld, defaultWorldOptions } from '@/model/generators/world';
import { generateDungeon, defaultDungeonOptions, platziereRaeume, type Raum } from '@/model/generators/dungeon';
import { createDocument } from '@/model/document';
import { ueberlappen } from '@/model/generators/cityPlan';
import { Rng } from '@/model/rng';
import type { GeneratedMap } from '@/model/generators/types';

/**
 * Liegt eine Tür (ein Feld breites Wandsegment) auf dem Rand eines Raums?
 *
 * Türen sind immer genau ein Feld breit und achsenparallel — entweder
 * senkrecht (x0 === x1) oder waagerecht (y0 === y1). Berührt heißt: die Tür
 * liegt auf einer der vier Raumkanten, innerhalb ihrer Ausdehnung.
 */
function tuerBeruehrtRaum(bounds: [number, number, number, number], raum: Raum, tile: number): boolean {
  const [x0, y0, x1, y1] = bounds.map((v) => v / tile);
  const { c, r, w, h } = raum;
  if (x0 === x1) {
    // Senkrechte Tür: an der linken oder rechten Raumkante, innerhalb der Höhe.
    if (x0 !== c && x0 !== c + w) return false;
    return Math.min(y0, y1) >= r && Math.max(y0, y1) <= r + h;
  }
  if (y0 === y1) {
    if (y0 !== r && y0 !== r + h) return false;
    return Math.min(x0, x1) >= c && Math.max(x0, x1) <= c + w;
  }
  return false;
}

/** Punkt in konvexem Polygon — für den Mauertest. */
function imKonvexen(poly: number[], x: number, y: number): boolean {
  const n = poly.length / 2;
  let positiv = 0;
  let negativ = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const kreuz =
      (poly[j * 2] - poly[i * 2]) * (y - poly[i * 2 + 1]) -
      (poly[j * 2 + 1] - poly[i * 2 + 1]) * (x - poly[i * 2]);
    if (kreuz > 1e-6) positiv++;
    if (kreuz < -1e-6) negativ++;
  }
  return positiv === 0 || negativ === 0;
}

const TILE = 100;
const params = defaultGeneratorParams();

const lauf = (id: GeneratorId, seed = 1234): GeneratedMap =>
  runGenerator(id, params, seed, TILE);

describe('Generatoren allgemein', () => {
  it('liefern für jeden bekannten Typ ein Ergebnis', () => {
    for (const id of GENERATOR_IDS) {
      const r = lauf(id);
      expect(r.size.cols).toBeGreaterThan(0);
      expect(r.size.rows).toBeGreaterThan(0);
      // Jeder Generator muss irgendetwas erzeugen, sonst wirkt er kaputt.
      const inhalt = r.floors.length + r.walls.length + r.props.length;
      expect(inhalt, id).toBeGreaterThan(0);
    }
  });

  it('sind reproduzierbar: gleicher Seed, gleiches Ergebnis', () => {
    for (const id of GENERATOR_IDS) {
      expect(JSON.stringify(lauf(id, 42)), id).toBe(JSON.stringify(lauf(id, 42)));
    }
  });

  it('liefern bei anderem Seed ein anderes Ergebnis', () => {
    for (const id of GENERATOR_IDS) {
      expect(JSON.stringify(lauf(id, 1)), id).not.toBe(JSON.stringify(lauf(id, 2)));
    }
  });

  it('erzeugen nur endliche Koordinaten', () => {
    for (const id of GENERATOR_IDS) {
      const r = lauf(id);
      const zahlen = [
        ...r.floors.flatMap((f) => f.points),
        ...r.walls.flatMap((w) => w.points),
        ...r.doors.flatMap((d) => d.bounds),
        ...r.props.flatMap((p) => [p.x, p.y, p.scale, p.rotation]),
        ...r.lights.flatMap((l) => [l.x, l.y, l.range]),
      ];
      expect(zahlen.every((n) => Number.isFinite(n)), id).toBe(true);
    }
  });

  it('erzeugen nur geschlossene Flächen mit mindestens drei Ecken', () => {
    for (const id of GENERATOR_IDS) {
      for (const f of lauf(id).floors) {
        expect(f.points.length % 2, id).toBe(0);
        expect(f.points.length, id).toBeGreaterThanOrEqual(6);
      }
    }
  });
});

/**
 * Dieselben Zusagen über viele Seeds statt über einen.
 *
 * Ein einzelner Seed prüft eine einzige Form. Der Fehler, der die geraden
 * Schnitte quer über die Weltkarte machte, saß in der Umriss-Verfolgung und
 * trat nur auf, wenn sich zwei Bereiche über Eck berühren — eine
 * Zellanordnung, die bei einem festen Seed einfach nicht vorkam. Deshalb hier
 * eine Runde über viele Seeds, mit denselben Zusagen und einer zusätzlichen:
 * eine Kante darf nicht quer durch die Karte laufen. Genau so sieht ein
 * offener Ring aus, nachdem er gefüllt wurde.
 */
describe('Generatoren über viele Seeds', () => {
  const SEEDS = 25;

  it('liefern immer endliche Koordinaten und geschlossene Flächen', () => {
    for (const id of GENERATOR_IDS) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = lauf(id, seed);
        for (const f of r.floors) {
          expect(f.points.length % 2, `${id}/${seed}`).toBe(0);
          expect(f.points.length, `${id}/${seed}`).toBeGreaterThanOrEqual(6);
          expect(f.points.every(Number.isFinite), `${id}/${seed}`).toBe(true);
        }
        for (const w of r.walls) {
          expect(w.points.length, `${id}/${seed}`).toBeGreaterThanOrEqual(4);
          expect(w.points.every(Number.isFinite), `${id}/${seed}`).toBe(true);
        }
        for (const p of r.props) {
          expect(Number.isFinite(p.x) && Number.isFinite(p.y), `${id}/${seed}`).toBe(true);
          expect(p.scale, `${id}/${seed}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('ziehen keine Kante quer über die halbe Karte', () => {
    for (const id of GENERATOR_IDS) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = lauf(id, seed);
        // Der Kartenrand selbst ist eine ehrliche lange Kante; alles darüber
        // hinaus ist keine.
        const grenze = Math.max(r.size.cols, r.size.rows) * TILE;
        for (const f of r.floors) {
          const n = f.points.length / 2;
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const d = Math.hypot(
              f.points[j * 2] - f.points[i * 2],
              f.points[j * 2 + 1] - f.points[i * 2 + 1],
            );
            expect(d, `${id}/${seed}, Farbe ${f.color.toString(16)}`).toBeLessThanOrEqual(grenze);
          }
        }
      }
    }
  });

  it('bleiben innerhalb der Karte', () => {
    for (const id of GENERATOR_IDS) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const r = lauf(id, seed);
        const breite = r.size.cols * TILE;
        const hoehe = r.size.rows * TILE;
        // Etwas Luft: Strichbreiten und Prop-Hälften ragen zulässig heraus.
        const luft = 3 * TILE;
        for (const f of r.floors) {
          for (let i = 0; i < f.points.length; i += 2) {
            expect(f.points[i], `${id}/${seed}`).toBeGreaterThanOrEqual(-luft);
            expect(f.points[i], `${id}/${seed}`).toBeLessThanOrEqual(breite + luft);
            expect(f.points[i + 1], `${id}/${seed}`).toBeGreaterThanOrEqual(-luft);
            expect(f.points[i + 1], `${id}/${seed}`).toBeLessThanOrEqual(hoehe + luft);
          }
        }
      }
    }
  });
});

describe('Dungeon', () => {
  it('erzeugt Räume, Wände und Türen', () => {
    const r = lauf('dungeon');
    expect(r.walls.length).toBeGreaterThan(0);
    expect(r.doors.length).toBeGreaterThan(0);
  });

  it('hält alles innerhalb der Karte', () => {
    const r = lauf('dungeon');
    const max = { x: params.dungeon.cols * TILE, y: params.dungeon.rows * TILE };
    for (const w of r.walls) {
      for (let i = 0; i < w.points.length; i += 2) {
        expect(w.points[i]).toBeGreaterThanOrEqual(0);
        expect(w.points[i]).toBeLessThanOrEqual(max.x);
        expect(w.points[i + 1]).toBeGreaterThanOrEqual(0);
        expect(w.points[i + 1]).toBeLessThanOrEqual(max.y);
      }
    }
  });

  it('macht ohne Türwahrscheinlichkeit auch keine Türen', () => {
    const ohne = runGenerator(
      'dungeon',
      { ...params, dungeon: { ...params.dungeon, doorChance: 0 } },
      7,
      TILE,
    );
    expect(ohne.doors).toHaveLength(0);
    expect(ohne.walls.length).toBeGreaterThan(0);
  });

  it('erzeugt ohne Ausstattung keine Props und Lichter', () => {
    const kahl = runGenerator(
      'dungeon',
      { ...params, dungeon: { ...params.dungeon, decorate: false } },
      7,
      TILE,
    );
    expect(kahl.props).toHaveLength(0);
    expect(kahl.lights).toHaveLength(0);
  });

  /**
   * Der eigentliche Fehler: `doorChance` würfelte für jeden Durchgang
   * *einzeln*. Ein Raum mit nur einer Verbindungszelle landete damit bei
   * jedem vierten Anlauf (Standard 75 %) ganz ohne Tür — begehbar blieb er,
   * weil die Wandlücke rein aus dem Grundriss entsteht, aber ohne Tür-Objekt
   * sieht die Lücke in Foundry aus wie ein Loch. Über viele Seeds, damit ein
   * einzelner glücklicher Wurf den Fehler nicht verdeckt.
   */
  it('lässt keinen Raum ganz ohne Tür', () => {
    // Ein Durchgang je Seite genügt schon: prüft die Häufung am Ehesten.
    const opts = { ...params.dungeon, roomCount: 10, doorChance: 0.75 };
    for (let seed = 1; seed <= 40; seed++) {
      const r = runGenerator('dungeon', { ...params, dungeon: opts }, seed, TILE);
      const { raeume } = platziereRaeume(new Rng(seed), { ...opts, seed, tileSize: TILE });

      for (const raum of raeume) {
        const beruehrt = r.doors.some((d) => tuerBeruehrtRaum(d.bounds, raum, TILE));
        expect(beruehrt, `Seed ${seed}, Raum ${JSON.stringify(raum)}`).toBe(true);
      }
    }
  });

  /** Kein Zufallstreffer: bei doorChance 1 muss jeder Durchgang eine Tür bekommen. */
  it('setzt bei Türwahrscheinlichkeit 1 auf jedem Durchgang eine Tür', () => {
    const voll = runGenerator(
      'dungeon',
      { ...params, dungeon: { ...params.dungeon, roomCount: 10, doorChance: 1 } },
      3,
      TILE,
    );
    expect(voll.doors.length).toBeGreaterThan(0);
  });

  describe('Raumschlüssel', () => {
    it('legt für jeden Raum genau eine nummerierte Notiz an', () => {
      const opts = { ...params.dungeon, roomCount: 10, roomKey: true };
      const r = runGenerator('dungeon', { ...params, dungeon: opts }, 3, TILE);
      const { raeume } = platziereRaeume(new Rng(3), { ...opts, seed: 3, tileSize: TILE });

      expect(r.notes).toHaveLength(raeume.length);
      // Fortlaufend ab 1, jede Nummer genau einmal — sonst wäre es kein Schlüssel.
      const indices = r.notes.map((n) => n.index).sort((a, b) => a - b);
      expect(indices).toEqual(raeume.map((_, i) => i + 1));
      for (const n of r.notes) expect(n.nameKey.startsWith('room.')).toBe(true);
    });

    it('lässt den Schlüssel weg, wenn abgeschaltet', () => {
      const aus = runGenerator(
        'dungeon',
        { ...params, dungeon: { ...params.dungeon, roomCount: 10, roomKey: false } },
        3,
        TILE,
      );
      expect(aus.notes).toHaveLength(0);
    });

    it('lässt den Schlüssel ohne Raumthema weg', () => {
      const ohneThema = runGenerator(
        'dungeon',
        { ...params, dungeon: { ...params.dungeon, roomCount: 10, roomKey: true, theme: 'none' } },
        3,
        TILE,
      );
      expect(ohneThema.notes).toHaveLength(0);
    });

    it('landet als GM-only-Notiz im Dokument, mit Nummer und Raumname im Titel', () => {
      const doc = createDocument(params.dungeon.cols, params.dungeon.rows);
      const layer = doc.rootLayers.find((l) => !doc.layers[l].isGroup) as string;
      const r = runGenerator(
        'dungeon',
        { ...params, dungeon: { ...params.dungeon, roomCount: 10, roomKey: true } },
        3,
        TILE,
      );
      for (const cmd of buildGeneratorCommands(doc, r, layer, layer, 'Test')) cmd.do(doc);

      expect(doc.vtt.notes.length).toBe(r.notes.length);
      for (const notiz of doc.vtt.notes) {
        expect(notiz.playerVisible).toBe(false);
        expect(notiz.title).toMatch(/^\d+\. .+/);
        expect(notiz.text.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Höhle', () => {
  it('hält die Stützpunktzahl in Grenzen', () => {
    // Chaikin verdoppelt je Durchgang; ohne Ausdünnen käme jeder Umriss auf
    // mehrere hundert Punkte und damit auf ebenso viele Wandsegmente in Foundry.
    for (const w of lauf('cave').walls) {
      expect(w.points.length / 2).toBeLessThan(160);
    }
    for (const f of lauf('island').floors) {
      expect(f.points.length / 2).toBeLessThan(160);
    }
  });

  it('liefert genau einen zusammenhängenden Hohlraum', () => {
    const r = lauf('cave');
    // Ein Außenring, dazu höchstens ein paar Säulen als Löcher.
    expect(r.walls.length).toBeGreaterThanOrEqual(1);
    expect(r.floors.length).toBe(r.walls.length);
  });
});

describe('Wald', () => {
  it('setzt Bäume mit Mindestabstand', () => {
    const r = lauf('forest');
    const baeume = r.props.filter((p) => p.propId.startsWith('tree_'));
    expect(baeume.length).toBeGreaterThan(10);

    const minAbstand = params.forest.spacing * TILE;
    for (let i = 0; i < baeume.length; i++) {
      for (let j = i + 1; j < baeume.length; j++) {
        const d = Math.hypot(baeume[i].x - baeume[j].x, baeume[i].y - baeume[j].y);
        // Kleine Toleranz für Rundung; das Verfahren garantiert den Abstand.
        expect(d).toBeGreaterThan(minAbstand - 1);
      }
    }
  });

  it('legt ohne Pfad-Option keinen Pfad an', () => {
    const mit = lauf('forest');
    const ohne = runGenerator(
      'forest',
      { ...params, forest: { ...params.forest, path: false } },
      1234,
      TILE,
    );
    expect(ohne.floors.length).toBeLessThan(mit.floors.length);
  });
});

describe('Stadt', () => {
  it('erzeugt Gebäude mit Wandring und je einer Tür', () => {
    const r = lauf('town');
    expect(r.walls.length).toBeGreaterThan(3);
    // Ohne Stadtmauer gibt es genau so viele Türen wie Gebäude.
    expect(r.doors.length).toBe(r.walls.length);
  });

  it('umschließt den Ort mit Stadtmauer und setzt Tore', () => {
    const mit = runGenerator(
      'town',
      { ...params, town: { ...params.town, cityWall: true } },
      1234,
      TILE,
    );
    // Die Mauer folgt dem Ortsumriss, nicht der Bildkante — sie ist der mit
    // Abstand größte Ring, und *jedes* Haus liegt darin. Vorher lag sie als
    // Rechteck um die ganze Karte und umschloss zur Hälfte Wiese.
    const breite = (w: { points: number[] }) => {
      const xs = w.points.filter((_, i) => i % 2 === 0);
      return Math.max(...xs) - Math.min(...xs);
    };
    const sortiert = [...mit.walls].sort((a, b) => breite(b) - breite(a));
    const mauer = sortiert[0];
    expect(breite(mauer)).toBeGreaterThan(breite(sortiert[1]) * 3);

    for (const haus of sortiert.slice(1)) {
      for (let i = 0; i < haus.points.length; i += 2) {
        expect(imKonvexen(mauer.points, haus.points[i], haus.points[i + 1])).toBe(true);
      }
    }

    // Mehr Türen als Gebäude: jedes Haus eine, dazu die Tore.
    expect(mit.doors.length).toBeGreaterThan(mit.walls.length - 1);
  });

  /**
   * Häuser sind seit dem Polygon-Grundriss nicht mehr achsenparallel; ein
   * Kastentest hielte schräg nebeneinanderstehende Reihenhäuser für
   * überlappend. Geprüft wird deshalb mit dem Trennachsensatz.
   */
  it('lässt Gebäude einander nicht überlappen', () => {
    for (const seed of [1234, 7, 42]) {
      const r = lauf('town', seed);
      for (let i = 0; i < r.walls.length; i++) {
        for (let j = i + 1; j < r.walls.length; j++) {
          expect(
            ueberlappen(r.walls[i].points, r.walls[j].points),
            `${seed}: ${i}/${j}`,
          ).toBe(false);
        }
      }
    }
  });

  describe('Gebäudearten', () => {
    /** Einmalige Arten dürfen je Ort höchstens einmal vorkommen. */
    const EINMALIG = ['building.blacksmith', 'building.temple', 'building.townhall', 'building.mill'];

    it('legt für besondere Gebäude eine durchnummerierte Gazetteer-Notiz an', () => {
      for (const seed of [1234, 7, 42, 99]) {
        const r = lauf('town', seed);
        expect(r.notes.length, `Seed ${seed}`).toBeGreaterThan(0);
        expect(r.notes.length, `Seed ${seed}`).toBeLessThanOrEqual(r.walls.length);

        const indices = r.notes.map((n) => n.index).sort((a, b) => a - b);
        expect(indices, `Seed ${seed}`).toEqual(r.notes.map((_, i) => i + 1));

        for (const n of r.notes) {
          expect(n.nameKey.startsWith('building.'), `Seed ${seed}`).toBe(true);
          // Nur besondere Gebäude bekommen eine Notiz — ein Wohnhaus ist keine
          // Sehenswürdigkeit.
          expect(n.nameKey, `Seed ${seed}`).not.toBe('building.house');
        }
      }
    });

    it('lässt einmalige Gebäudearten nicht doppelt entstehen', () => {
      for (const seed of [1234, 7, 42, 99, 1, 2, 3, 4, 5]) {
        const r = lauf('town', seed);
        for (const key of EINMALIG) {
          const anzahl = r.notes.filter((n) => n.nameKey === key).length;
          expect(anzahl, `Seed ${seed}, ${key}`).toBeLessThanOrEqual(1);
        }
      }
    });

    /**
     * Ohne Ausstattung bleibt zwar der Ortsrand bepflanzt (das hängt nur an
     * `margin`/`surround`, nicht an `decorate`) — aber kein einziges Möbel
     * steht mehr in einem Haus, und keine Gazetteer-Notiz entsteht.
     */
    it('erzeugt ohne Ausstattung weder Hausmöbel noch Gazetteer-Notizen', () => {
      const kahl = runGenerator(
        'town',
        { ...params, town: { ...params.town, decorate: false } },
        7,
        TILE,
      );
      expect(kahl.notes).toHaveLength(0);
      expect(kahl.lights).toHaveLength(0);
      const hausMoebel = ['bed', 'forge', 'anvil', 'altar', 'market_stall', 'dining_set'];
      for (const p of kahl.props) expect(hausMoebel).not.toContain(p.propId);
    });

    it('landet als GM-only-Notiz im Dokument, mit Nummer und Gebäudename im Titel', () => {
      const doc = createDocument(params.town.cols, params.town.rows);
      const layer = doc.rootLayers.find((l) => !doc.layers[l].isGroup) as string;
      const r = lauf('town', 1234);
      for (const cmd of buildGeneratorCommands(doc, r, layer, layer, 'Test')) cmd.do(doc);

      expect(doc.vtt.notes.length).toBe(r.notes.length);
      for (const notiz of doc.vtt.notes) {
        expect(notiz.playerVisible).toBe(false);
        expect(notiz.title).toMatch(/^\d+\. .+/);
      }
    });
  });
});

describe('Insel', () => {
  it('erzeugt Strand- und Grünfläche, aber keine Wände', () => {
    const r = lauf('island');
    expect(r.floors.length).toBeGreaterThanOrEqual(2);
    // Eine Insel hat keine Sichtblocker — der Rand ist Wasser, keine Wand.
    expect(r.walls).toHaveLength(0);
  });

  it('hält die Landmasse vom Kartenrand weg', () => {
    const r = lauf('island');
    const s = TILE;
    for (const f of r.floors) {
      for (let i = 0; i < f.points.length; i += 2) {
        expect(f.points[i]).toBeGreaterThan(0);
        expect(f.points[i + 1]).toBeGreaterThan(0);
        expect(f.points[i]).toBeLessThan(params.island.cols * s);
        expect(f.points[i + 1]).toBeLessThan(params.island.rows * s);
      }
    }
  });
});

describe('Weltkarte und Raster', () => {
  it('schlägt Hexfelder vor', () => {
    const r = generateWorld({ ...defaultWorldOptions(), seed: 5, tileSize: 100, cols: 20, rows: 16 });
    expect(r.gridType).toBe('hexPointy');
  });

  it('lässt das Raster in Ruhe, wenn man es abschaltet', () => {
    const r = generateWorld({
      ...defaultWorldOptions(),
      hexGrid: false,
      seed: 5,
      tileSize: 100,
      cols: 20,
      rows: 16,
    });
    expect(r.gridType).toBeUndefined();
  });

  /** Battlemap-Generatoren dürfen das Raster nicht anfassen: UVTT kennt nur Quadrate. */
  it('die Battlemap-Generatoren schlagen kein anderes Raster vor', () => {
    const dungeon = generateDungeon({ ...defaultDungeonOptions(), seed: 3, tileSize: 100 });
    expect(dungeon.gridType).toBeUndefined();
  });

  it('das Raster wird als eigener Befehl gesetzt', () => {
    const doc = createDocument(20, 16, 'x');
    const layer = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
    const r = generateWorld({ ...defaultWorldOptions(), seed: 5, tileSize: 100, cols: 20, rows: 16 });

    expect(doc.grid.type).toBe('square');
    for (const cmd of buildGeneratorCommands(doc, r, layer, layer, 'Welt')) cmd.do(doc);
    expect(doc.grid.type).toBe('hexPointy');
  });
});

/**
 * Die Reihenfolge, in der ein Ergebnis auf der Karte landet.
 *
 * Der Dialog reicht zweimal dieselbe Ebene herein — für Böden und für Props.
 * Solange `nextZ` dafür zweimal getrennt und vor dem Einfügen bestimmt wurde,
 * überlappten die z-Bereiche, und die zuerst gesetzten Props lagen *unter* den
 * Böden. Sichtbar wurde es an der Feuerstelle einer Waldlichtung: sie
 * verschwand ganz, und es sah aus, als fehlte sie im Generator.
 */
describe('Einfügen ins Dokument', () => {
  const einfuegen = (id: GeneratorId) => {
    const doc = createDocument(30, 30);
    const layer = doc.rootLayers.find((l) => !doc.layers[l].isGroup) as string;
    const ergebnis = lauf(id, 5);
    for (const cmd of buildGeneratorCommands(doc, ergebnis, layer, layer, 'Test')) cmd.do(doc);
    return Object.values(doc.objects);
  };

  it('legt jedes Prop über jede Bodenfläche derselben Ebene', () => {
    for (const id of GENERATOR_IDS) {
      const objekte = einfuegen(id);
      const boeden = objekte.filter((o) => o.kind === 'shape');
      const props = objekte.filter((o) => o.kind === 'prop');
      if (boeden.length === 0 || props.length === 0) continue;
      const hoechsterBoden = Math.max(...boeden.map((o) => o.z));
      const niedrigstesProp = Math.min(...props.map((o) => o.z));
      expect(niedrigstesProp, id).toBeGreaterThan(hoechsterBoden);
    }
  });

  it('vergibt jede z-Stufe nur einmal', () => {
    for (const id of GENERATOR_IDS) {
      const z = einfuegen(id).map((o) => o.z);
      expect(new Set(z).size, id).toBe(z.length);
    }
  });
});
