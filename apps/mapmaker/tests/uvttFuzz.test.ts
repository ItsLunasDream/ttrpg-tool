/**
 * Zufallslauf über den Universal-VTT-Rundlauf.
 *
 * `uvtt.test.ts` prüft jede Regel des Formats einzeln — Bogenmaß, AARRGGBB,
 * Grid-Einheiten — und tut das an Hand kleiner, glatter Zahlen. Was dabei
 * nicht auffällt, ist die *Genauigkeit*: beim Schreiben wird durch die
 * Tile-Größe geteilt und auf sechs Nachkommastellen gerundet, beim Lesen
 * wieder multipliziert. Ob eine Wand danach noch dort liegt, wo sie lag,
 * entscheidet sich nicht an 100 oder 70, sondern an krummen Werten.
 *
 * Deshalb hier: viele Elemente, krumme Koordinaten, ungerade Tile-Größen —
 * und die Frage, wie weit das Ergebnis abweicht. Nicht „ist es gleich?",
 * sondern „um wie viel nicht?", denn eine Rundung auf sechs Stellen *muss*
 * abweichen. Die Schranke ist der Punkt: eine halbe Tausendstel eines
 * Weltpixels sieht niemand, ein halber Weltpixel schon.
 */

import { describe, expect, it } from 'vitest';
import { buildUvtt, parseUvtt, serializeUvtt } from '@/io/uvtt';
import { createDocument } from '@/model/document';
import { NOTE_ICONS, type LightSource, type MapNote, type Portal, type Wall } from '@/model/types';

function rng(seed: number) {
  let s = seed >>> 0;
  const next = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return {
    next,
    int: (a: number, b: number) => a + Math.floor(next() * (b - a + 1)),
    /** Krumme Koordinate — glatte Zahlen verstecken genau den Fehler, der hier gesucht wird. */
    koord: (max: number) => Math.round(next() * max * 1000) / 1000,
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
  };
}

/** Ein Dokument mit gewürfeltem VTT-Inhalt. */
function wuerfelDoc(seed: number, tileSize: number) {
  const r = rng(seed);
  const doc = createDocument(40, 30);
  doc.grid.tileSize = tileSize;
  const w = doc.size.cols * tileSize;
  const h = doc.size.rows * tileSize;

  const walls: Wall[] = [];
  for (let i = 0; i < r.int(5, 25); i++) {
    const punkte: number[] = [];
    for (let k = 0; k < r.int(2, 6); k++) punkte.push(r.koord(w), r.koord(h));
    walls.push({
      id: `w${i}`,
      points: punkte,
      type: r.pick(['normal', 'window'] as const),
      // Nur ab drei Punkten geschlossen. Bei zweien ergäbe „geschlossen"
      // dasselbe Segment zweimal — der Schreiber weigert sich zu Recht, und
      // der Rundlauf gäbe `closed: false` zurück. Siehe den eigenen Test dazu.
      closed: punkte.length >= 6 && r.next() < 0.4,
    });
  }

  /**
   * Zufällig fast zusammenfallende Enden auseinanderziehen.
   *
   * Der Leser erkennt einen Zug als geschlossen, wenn Anfang und Ende näher
   * als ein Hundertstel Tile beieinanderliegen — er muss das, weil fremde
   * Dateien nicht exakt schließen. Ein gewürfelter offener Zug, dessen Enden
   * zufällig so nah liegen, käme darum zu Recht als geschlossen zurück. Das
   * ist Verhalten des Formats, kein Fehler, und hat in diesem Test nichts
   * verloren.
   */
  for (const wall of walls) {
    if (wall.closed) continue;
    const n = wall.points.length;
    if (Math.hypot(wall.points[0] - wall.points[n - 2], wall.points[1] - wall.points[n - 1]) <
        tileSize * 0.05)
      wall.points[n - 2] += tileSize;
  }

  const portals: Portal[] = [];
  for (let i = 0; i < r.int(3, 15); i++)
    portals.push({
      id: `p${i}`,
      bounds: [r.koord(w), r.koord(h), r.koord(w), r.koord(h)],
      closed: r.next() < 0.5,
      freestanding: r.next() < 0.5,
    });

  const lights: LightSource[] = [];
  for (let i = 0; i < r.int(3, 15); i++)
    lights.push({
      id: `l${i}`,
      x: r.koord(w),
      y: r.koord(h),
      range: Math.round(r.next() * 12 * 100) / 100,
      intensity: 1,
      color: r.int(0, 0xffffff),
      alpha: r.int(0, 100) / 100,
      shadows: r.next() < 0.5,
    });

  const notes: MapNote[] = [];
  for (let i = 0; i < r.int(1, 8); i++)
    notes.push({
      id: `n${i}`,
      x: r.koord(w),
      y: r.koord(h),
      title: `Notiz ${i}`,
      text: 'Zeile eins\n\nZeile zwei',
      icon: r.pick(NOTE_ICONS),
      size: 1,
      color: r.int(0, 0xffffff),
      playerVisible: r.next() < 0.5,
    });

  doc.vtt = { ...doc.vtt, walls, portals, lights, notes };
  return doc;
}

/** Der größte Abstand, den ein Punkt beim Rundlauf zurückgelegt hat. */
function groessteAbweichung(a: number[], b: number[]): number {
  let max = 0;
  for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i] - b[i]));
  return max;
}

describe('Zufallslauf über den UVTT-Rundlauf', () => {
  // Auch ungerade Tile-Größen: 70 und 128 sind verbreitet, 63 ist der Fall,
  // bei dem sich eine Division nicht mehr glatt zurückrechnen lässt.
  const groessen = [50, 63, 70, 100, 128];
  const seeds = [1, 42, 777, 2024, 31337];

  for (const tile of groessen) {
    it(`hält bei Tile-Größe ${tile} alle Geometrie im Rundlauf`, () => {
      for (const seed of seeds) {
        const doc = wuerfelDoc(seed, tile);
        const datei = serializeUvtt(buildUvtt(doc, { image: '', pixelsPerGrid: tile }));
        const zurueck = parseUvtt(datei, tile);

        expect(zurueck.warnings).toEqual([]);
        expect(zurueck.vtt.walls).toHaveLength(doc.vtt.walls.length);
        expect(zurueck.vtt.portals).toHaveLength(doc.vtt.portals.length);
        expect(zurueck.vtt.lights).toHaveLength(doc.vtt.lights.length);

        // Die Reihenfolge *muss* sich ändern: das Format hat zwei getrennte
        // Listen, `line_of_sight` und `objects_line_of_sight`. Fenster wandern
        // beim Schreiben in die zweite und kommen beim Lesen darum hinter
        // allen normalen Wänden zurück. Das ist kein Verlust, aber es ist der
        // Grund, warum hier nicht Index gegen Index verglichen werden kann.
        const erwartet = [
          ...doc.vtt.walls.filter((w) => w.type !== 'window'),
          ...doc.vtt.walls.filter((w) => w.type === 'window'),
        ];

        for (let i = 0; i < erwartet.length; i++) {
          const vor = erwartet[i];
          const nach = zurueck.vtt.walls[i];
          expect(nach.type).toBe(vor.type);
          expect(nach.closed).toBe(vor.closed);
          // Ein geschlossener Zug bekommt beim Schreiben den Anfangspunkt
          // angehängt und beim Lesen wieder abgenommen — die Punktzahl muss
          // trotzdem stimmen.
          expect(nach.points).toHaveLength(vor.points.length);
          expect(groessteAbweichung(vor.points, nach.points)).toBeLessThan(0.001);
        }

        for (let i = 0; i < doc.vtt.portals.length; i++) {
          const vor = doc.vtt.portals[i];
          const nach = zurueck.vtt.portals[i];
          expect(nach.closed).toBe(vor.closed);
          expect(nach.freestanding).toBe(vor.freestanding);
          expect(groessteAbweichung([...vor.bounds], [...nach.bounds])).toBeLessThan(0.001);
        }

        for (let i = 0; i < doc.vtt.lights.length; i++) {
          const vor = doc.vtt.lights[i];
          const nach = zurueck.vtt.lights[i];
          // Farbe und Alpha gehen durch acht Hex-Stellen — die müssen exakt
          // zurückkommen, da wird nichts gerundet.
          expect(nach.color).toBe(vor.color);
          expect(Math.abs(nach.alpha - vor.alpha)).toBeLessThan(0.004);
          expect(Math.abs(nach.x - vor.x)).toBeLessThan(0.001);
          expect(Math.abs(nach.y - vor.y)).toBeLessThan(0.001);
          expect(Math.abs(nach.range - vor.range)).toBeLessThan(0.001);
          expect(nach.shadows).toBe(vor.shadows);
        }
      }
    });
  }

  /**
   * Der Sonderfall, den der Zufallslauf zutage gefördert hat.
   *
   * Ein Zug aus zwei Punkten lässt sich nicht schließen: das ergäbe dasselbe
   * Segment zweimal. Schreiber und Leser sind sich darin einig, und der
   * Rundlauf macht aus `closed: true` darum `closed: false`. Aus dem
   * Wandwerkzeug kommt so ein Zug nicht — es schließt erst ab drei Punkten —,
   * aber wer die Datei von Hand baut, soll sich darauf verlassen können.
   */
  it('gibt einen Zweipunkt-Zug offen zurück, auch wenn er geschlossen hieß', () => {
    const doc = createDocument(10, 10);
    doc.vtt = {
      ...doc.vtt,
      walls: [
        { id: 'w', points: [100, 100, 400, 400], type: 'normal', closed: true },
        { id: 'w2', points: [100, 100, 400, 100, 400, 400], type: 'normal', closed: true },
      ],
    };
    const zurueck = parseUvtt(
      serializeUvtt(buildUvtt(doc, { image: '', pixelsPerGrid: 100 })),
      100,
    );
    expect(zurueck.vtt.walls[0].points).toEqual([100, 100, 400, 400]);
    expect(zurueck.vtt.walls[0].closed).toBe(false);
    // Ab drei Punkten bleibt „geschlossen" erhalten, und der doppelte Punkt
    // wird beim Lesen wieder abgenommen.
    expect(zurueck.vtt.walls[1].closed).toBe(true);
    expect(zurueck.vtt.walls[1].points).toEqual([100, 100, 400, 100, 400, 400]);
  });

  /**
   * Notizen kennt das Format nicht; sie werden als unbekanntes Feld
   * mitgeschrieben, damit beim Weitergeben der Datei nichts verlorengeht.
   * Genau deshalb ist der eigene Reader die einzige Stelle, die das prüft.
   */
  it('bringt Notizen unverändert durch die Datei', () => {
    const doc = wuerfelDoc(99, 70);
    // Sicherstellen, dass überhaupt welche dabei sind.
    expect(doc.vtt.notes.length).toBeGreaterThan(0);
    const zurueck = parseUvtt(
      serializeUvtt(buildUvtt(doc, { image: '', pixelsPerGrid: 70 })),
      70,
    );
    expect(zurueck.vtt.notes).toHaveLength(doc.vtt.notes.length);
    for (let i = 0; i < doc.vtt.notes.length; i++) {
      const vor = doc.vtt.notes[i];
      const nach = zurueck.vtt.notes[i];
      expect(nach.title).toBe(vor.title);
      expect(nach.text).toBe(vor.text);
      expect(nach.icon).toBe(vor.icon);
      expect(nach.color).toBe(vor.color);
      expect(nach.playerVisible).toBe(vor.playerVisible);
      expect(Math.abs(nach.x - vor.x)).toBeLessThan(0.001);
      expect(Math.abs(nach.y - vor.y)).toBeLessThan(0.001);
    }
  });

  /**
   * Wird die Datei mit einer *anderen* Tile-Größe gelesen, als sie
   * geschrieben wurde, skaliert alles mit. Das ist der Fall beim Öffnen einer
   * gekauften Karte: deren Grid-Einheiten sind dieselben, die eigene
   * Tile-Größe ist es nicht.
   */
  it('skaliert beim Lesen auf die eigene Tile-Größe', () => {
    const doc = wuerfelDoc(7, 100);
    const datei = serializeUvtt(buildUvtt(doc, { image: '', pixelsPerGrid: 100 }));
    const zurueck = parseUvtt(datei, 50);

    const erwartet = [
      ...doc.vtt.walls.filter((w) => w.type !== 'window'),
      ...doc.vtt.walls.filter((w) => w.type === 'window'),
    ];
    for (let i = 0; i < erwartet.length; i++) {
      const halbiert = erwartet[i].points.map((v) => v / 2);
      expect(groessteAbweichung(halbiert, zurueck.vtt.walls[i].points)).toBeLessThan(0.001);
    }
    for (let i = 0; i < doc.vtt.lights.length; i++) {
      // Die Reichweite steht in Tiles und darf gerade *nicht* mitskalieren.
      expect(Math.abs(zurueck.vtt.lights[i].range - doc.vtt.lights[i].range)).toBeLessThan(0.001);
    }
  });
});
