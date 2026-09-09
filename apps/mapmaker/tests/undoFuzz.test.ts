/**
 * Zufallslauf über die Befehlsschicht.
 *
 * Die Einzeltests in `commands.test.ts` prüfen jeden Befehl für sich — und
 * finden damit nur, woran beim Schreiben gedacht wurde. Fehler beim
 * Rückgängigmachen sitzen aber fast nie in einem Befehl allein, sondern in
 * seiner Nachbarschaft: eine Ebene löschen, nachdem Objekte hineingeschoben
 * wurden; die Karte verkleinern, nachdem etwas an den Rand gezogen wurde;
 * zwei Befehle, die über `mergeKey` verschmelzen und dann gemeinsam zurück
 * müssen. Solche Ketten kann man nicht alle aufschreiben, aber würfeln.
 *
 * Geprüft wird nicht das Ergebnis, sondern die Invariante:
 *
 * - alles rückgängig ergibt **exakt** den Anfangszustand,
 * - alles wiederholen ergibt **exakt** den Zustand davor.
 *
 * Das ist die Zusage, auf der Undo/Redo beruht, und sie gilt für jeden Befehl,
 * ohne dass der Test ihn einzeln kennen muss. Der Zufall ist gesät: schlägt
 * ein Lauf fehl, nennt die Meldung den Startwert, und derselbe Lauf lässt sich
 * wiederholen.
 */

import { describe, expect, it } from 'vitest';
import {
  AddLayer,
  AddObjects,
  AddVttItems,
  CompositeCommand,
  GroupLayers,
  History,
  MergeLayerDown,
  MoveLayer,
  MoveObjectsToLayer,
  PaintBiome,
  PaintHeight,
  PatchGrid,
  PatchLayer,
  PatchObjects,
  PatchVttEnvironment,
  PatchVttItems,
  RemoveLayer,
  RemoveObjects,
  RemoveVttItems,
  RenameMap,
  ReorderObjects,
  ReplaceVtt,
  ResizeMap,
  SetBackground,
  SetFilters,
  SetHeightMap,
  SetObjectGroup,
  newGroupLayer,
  newObjectLayer,
  type Command,
} from '@/model/commands';
import { createDocument, makeHeightMap } from '@/model/document';
import { BIOMES, SYSTEM_GRID, SYSTEM_VTT, type MapDocument, type MapObject } from '@/model/types';

/**
 * Gesäter Zufall — derselbe Startwert ergibt denselben Lauf.
 *
 * Ein eigener kleiner Generator und nicht `Math.random`: ein Fehlschlag, den
 * man nicht wiederholen kann, ist nur ein Gerücht.
 */
function rng(seed: number) {
  let s = seed >>> 0;
  const next = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return {
    next,
    int: (a: number, b: number) => a + Math.floor(next() * (b - a + 1)),
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
  };
}

/**
 * Vergleichsabzug, der nur den *Inhalt* vergleicht.
 *
 * Zwei Dinge müssen dabei heraus:
 *
 * - `meta`, weil `touchModified` bei jedem Befehl einen neuen Zeitstempel
 *   schreibt — der unterscheidet sich zwangsläufig.
 * - die Reihenfolge der Schlüssel in `layers` und `objects`. Das sind Records,
 *   und in welcher Reihenfolge ein Eintrag darin eingefügt wurde, ist keine
 *   Aussage über das Dokument: nach Löschen und Wiederherstellen steht ein
 *   Layer eben hinten statt vorn. Was zählt, ist `rootLayers` und `children` —
 *   und die werden hier normal verglichen.
 */
function snapshot(doc: MapDocument): string {
  const sortiert = (o: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  const { meta: _meta, layers, objects, heightMaps, ...rest } = doc;
  return JSON.stringify({
    ...rest,
    layers: sortiert(layers),
    objects: sortiert(objects),
    // Ein leeres Feld und ein fehlendes Feld sind dasselbe: `SetHeightMap`
    // legt den Behälter an und nimmt ihn beim Zurücknehmen nicht wieder weg.
    heightMaps: heightMaps && Object.keys(heightMaps).length ? sortiert(heightMaps) : null,
  });
}

/** Ebenen, die Objekte aufnehmen dürfen (also keine Gruppen, kein System). */
function objectLayers(doc: MapDocument): string[] {
  return Object.values(doc.layers)
    .filter((l) => !l.isGroup && l.id !== SYSTEM_GRID && l.id !== SYSTEM_VTT && l.kind !== 'height')
    .map((l) => l.id);
}

function removableLayers(doc: MapDocument): string[] {
  return Object.keys(doc.layers).filter((id) => id !== SYSTEM_GRID && id !== SYSTEM_VTT);
}

let zaehler = 0;
const id = (p: string) => `${p}_${(zaehler++).toString(36)}`;

function prop(layerId: string, r: ReturnType<typeof rng>): MapObject {
  return {
    id: id('obj'),
    kind: 'prop',
    layerId,
    propId: 'stone_small',
    x: r.int(0, 900),
    y: r.int(0, 600),
    rotation: r.int(0, 359),
    scaleX: 1,
    scaleY: 1,
    tint: null,
    flipX: false,
    flipY: false,
    opacity: 1,
    z: r.int(0, 50),
    locked: false,
    seed: r.int(1, 9999),
  };
}

/**
 * Ein zufälliger, auf den *aktuellen* Zustand passender Befehl.
 *
 * Gibt `null` zurück, wenn die gewürfelte Art gerade nicht anwendbar ist —
 * etwa Objekte löschen, wenn keine da sind. Das ist kein Fehlschlag, sondern
 * der Normalfall am Anfang eines Laufs.
 */
function wuerfelBefehl(doc: MapDocument, r: ReturnType<typeof rng>): Command | null {
  const objIds = Object.keys(doc.objects);
  const layerIds = objectLayers(doc);
  const hoehenLayer = Object.keys(doc.heightMaps ?? {});
  const art = r.int(0, 19);

  switch (art) {
    case 0:
    case 1: {
      const n = r.int(1, 4);
      const layer = r.pick(layerIds);
      return new AddObjects(Array.from({ length: n }, () => prop(layer, r)));
    }
    case 2: {
      if (!objIds.length) return null;
      return new RemoveObjects([r.pick(objIds), r.pick(objIds)]);
    }
    case 3: {
      if (!objIds.length) return null;
      const patches = new Map<string, Record<string, number>>();
      for (let i = 0; i < r.int(1, 3); i++)
        patches.set(r.pick(objIds), { x: r.int(0, 900), y: r.int(0, 600) });
      // Der `mergeKey` ist Absicht: verschmolzene Befehle müssen gemeinsam
      // zurück, und genau da war die Gefahr, dass etwas liegen bleibt.
      return new PatchObjects(patches, 'fuzz', r.next() < 0.5 ? 'fuzz-move' : undefined);
    }
    case 4: {
      if (!objIds.length) return null;
      return new ReorderObjects([r.pick(objIds)], r.next() < 0.5);
    }
    case 5: {
      if (!objIds.length) return null;
      return new MoveObjectsToLayer([r.pick(objIds)], r.pick(layerIds));
    }
    case 6: {
      if (objIds.length < 2) return null;
      return new SetObjectGroup([r.pick(objIds), r.pick(objIds)], r.next() < 0.5 ? id('grp') : null);
    }
    case 7:
      return new AddLayer(r.next() < 0.25 ? newGroupLayer('Fuzz') : newObjectLayer('Fuzz'));
    case 8: {
      const weg = removableLayers(doc);
      if (weg.length < 2) return null;
      return new RemoveLayer(r.pick(weg));
    }
    case 9: {
      const alle = removableLayers(doc);
      if (!alle.length) return null;
      return new PatchLayer(r.pick(alle), {
        visible: r.next() < 0.5,
        opacity: r.int(0, 100) / 100,
        locked: r.next() < 0.3,
      });
    }
    case 10: {
      const alle = removableLayers(doc);
      const gruppen = alle.filter((l) => doc.layers[l].isGroup);
      if (!alle.length) return null;
      return new MoveLayer(
        r.pick(alle),
        gruppen.length && r.next() < 0.5 ? r.pick(gruppen) : null,
        r.int(0, 3),
      );
    }
    case 11: {
      const alle = removableLayers(doc).filter((l) => !doc.layers[l].isGroup);
      if (alle.length < 2) return null;
      return new GroupLayers([r.pick(alle), r.pick(alle)], newGroupLayer('Fuzz-Gruppe'));
    }
    case 12: {
      const alle = objectLayers(doc);
      if (alle.length < 2) return null;
      return new MergeLayerDown(r.pick(alle));
    }
    case 13: {
      const w = r.next();
      if (w < 0.34) return new PatchGrid({ tileSize: r.int(32, 128), visible: r.next() < 0.5 });
      if (w < 0.67) return new SetBackground(r.int(0, 0xffffff));
      /**
       * Filter, global und je Ebene. Die gehören hier hinein, weil sie das
       * Feld sind, das beim Speichern schon einmal still verlorenging — was
       * einmal durchgerutscht ist, wird zweimal geprüft.
       */
      const alle = removableLayers(doc);
      return new SetFilters(
        r.next() < 0.5 || !alle.length ? null : r.pick(alle),
        r.next() < 0.25
          ? null
          : {
              brightness: r.int(50, 150) / 100,
              contrast: 1,
              saturation: r.int(0, 200) / 100,
              hue: r.int(0, 359),
              tint: r.next() < 0.5 ? null : r.int(0, 0xffffff),
              tintAmount: r.int(0, 100) / 100,
              blur: r.int(0, 8),
              grain: 0,
              vignette: r.int(0, 100) / 100,
            },
        'fuzz',
        r.next() < 0.5 ? 'fuzz-filter' : undefined,
      );
    }
    case 14:
      // Verkleinern schiebt Objekte und schneidet ab — der Befehl mit dem
      // meisten Zustand, den er sich merken muss.
      return new ResizeMap(r.int(5, 40), r.int(5, 30), r.pick(['top-left', 'center'] as const));
    case 15: {
      if (r.next() < 0.34)
        return new AddVttItems('walls', [
          {
            id: id('wall'),
            points: [r.int(0, 900), r.int(0, 600), r.int(0, 900), r.int(0, 600)],
            type: 'normal',
            closed: false,
          },
        ]);
      if (r.next() < 0.5)
        return new AddVttItems('lights', [
          {
            id: id('light'),
            x: r.int(0, 900),
            y: r.int(0, 600),
            range: r.int(1, 8),
            intensity: 1,
            color: 0xffcc88,
            alpha: 1,
            shadows: true,
          },
        ]);
      return new AddVttItems('notes', [
        {
          id: id('note'),
          x: r.int(0, 900),
          y: r.int(0, 600),
          title: 'Fuzz',
          text: 'Text',
          icon: 'marker',
          size: 1,
          color: 0xffffff,
          playerVisible: false,
        },
      ]);
    }
    case 16: {
      const w = doc.vtt.walls;
      const l = doc.vtt.lights;
      if (r.next() < 0.5 && w.length)
        return r.next() < 0.5
          ? new RemoveVttItems({ walls: [r.pick(w).id] })
          : new PatchVttItems('walls', new Map([[r.pick(w).id, { closed: true }]]));
      if (l.length)
        return new PatchVttItems(
          'lights',
          new Map([[r.pick(l).id, { range: r.int(1, 9) }]]),
          'fuzz',
          'fuzz-light',
        );
      return null;
    }
    case 17: {
      // Umgebung und Kartenname: kleine Befehle, die trotzdem Zustand tragen.
      return r.next() < 0.5
        ? new PatchVttEnvironment({
            ambientLight: r.int(0, 0xffffff),
            ambientAlpha: r.next(),
            bakedLighting: r.next() < 0.5,
          })
        : new RenameMap(`Karte ${r.int(1, 999)}`);
    }
    case 18: {
      // Die ganze VTT-Ebene ersetzen — der Weg, den der UVTT-Import nimmt.
      return new ReplaceVtt({
        walls: [
          {
            id: `fuzzw${r.int(1, 99999)}`,
            points: [r.int(0, 500), r.int(0, 500), r.int(0, 500), r.int(0, 500)],
            type: 'normal',
            closed: false,
          },
        ],
        portals: [],
        lights: [],
        notes: [],
        ambientLight: 0xffffff,
        ambientAlpha: 1,
        bakedLighting: false,
      });
    }
    default: {
      // Rasterebenen: anlegen, malen, Biome setzen, wieder wegnehmen.
      if (!hoehenLayer.length || r.next() < 0.25) {
        const l = newObjectLayer('Fuzz-Raster');
        l.kind = 'height';
        return new CompositeCommand(
          [new AddLayer(l), new SetHeightMap(l.id, makeHeightMap(doc.size.cols, doc.size.rows, 2))],
          'fuzz-raster',
        );
      }
      const lid = r.pick(hoehenLayer);
      const map = doc.heightMaps![lid];
      const felder = map.cols * map.rows;
      const werte = new Map<number, number>();
      for (let i = 0; i < r.int(1, 12); i++) werte.set(r.int(0, felder - 1), r.next());
      if (r.next() < 0.3) {
        const biome = new Map<number, number>();
        for (const k of werte.keys()) biome.set(k, r.int(0, BIOMES.length));
        return new PaintBiome(lid, biome, 'fuzz', 'fuzz-biome');
      }
      return new PaintHeight(lid, werte, 'fuzz', 'fuzz-height');
    }
  }
}

/** Ein Lauf: würfeln, alles zurück, alles wieder vorwärts. */
function lauf(seed: number, runden: number) {
  const r = rng(seed);
  const doc = createDocument(30, 20, 'Fuzz');
  const history = new History(runden * 4);

  const anfang = snapshot(doc);
  let angewandt = 0;

  for (let i = 0; i < runden; i++) {
    // Gelegentlich klammern — ein Zug, ein Pinselstrich. Innerhalb der
    // Klammer verschmelzen gleichartige Befehle, und das ist der Fall, den
    // ein Test ohne Klammer nie erreicht.
    const klammer = r.next() < 0.2;
    if (klammer) history.beginTransaction();
    for (let k = 0; k < (klammer ? r.int(2, 5) : 1); k++) {
      const cmd = wuerfelBefehl(doc, r);
      if (cmd) {
        history.exec(doc, cmd);
        angewandt++;
      }
    }
    if (klammer) history.endTransaction();
  }

  const ende = snapshot(doc);

  let zurueck = 0;
  while (history.canUndo) {
    history.undo(doc);
    zurueck++;
  }
  const wiederAnfang = snapshot(doc);

  while (history.canRedo) history.redo(doc);
  const wiederEnde = snapshot(doc);

  return { anfang, ende, wiederAnfang, wiederEnde, angewandt, zurueck };
}

describe('Zufallslauf über die Befehlsschicht', () => {
  // Feste Startwerte statt Zufall im Test selbst: ein Test, der mal
  // durchläuft und mal nicht, wird ignoriert statt untersucht.
  const seeds = [1, 7, 42, 99, 314, 555, 777, 2024, 2718, 4711, 8888, 31337, 60613, 161803, 424242];

  for (const seed of seeds) {
    it(`stellt bei Startwert ${seed} den Anfangszustand exakt wieder her`, () => {
      const e = lauf(seed, 120);
      expect(e.angewandt).toBeGreaterThan(60);
      expect(e.zurueck).toBeGreaterThan(0);
      expect(e.wiederAnfang).toBe(e.anfang);
    });

    it(`stellt bei Startwert ${seed} den Endzustand exakt wieder her`, () => {
      const e = lauf(seed, 120);
      expect(e.ende).not.toBe(e.anfang);
      expect(e.wiederEnde).toBe(e.ende);
    });
  }

  /**
   * Die Undo-Tiefe ist begrenzt. Wird sie überschritten, fallen die ältesten
   * Schritte weg — dann führt der Rückweg *nicht* mehr an den Anfang, und das
   * ist Absicht. Der Weg vorwärts muss trotzdem stimmen.
   */
  it('verliert bei erreichter Undo-Grenze nur die ältesten Schritte', () => {
    const r = rng(4711);
    const doc = createDocument(30, 20, 'Fuzz');
    const history = new History(20);
    for (let i = 0; i < 80; i++) {
      const cmd = wuerfelBefehl(doc, r);
      if (cmd) history.exec(doc, cmd);
    }
    const ende = snapshot(doc);

    let n = 0;
    while (history.canUndo) {
      history.undo(doc);
      n++;
    }
    expect(n).toBeLessThanOrEqual(20);

    while (history.canRedo) history.redo(doc);
    expect(snapshot(doc)).toBe(ende);
  });
});
