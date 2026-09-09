import { beforeEach, describe, expect, it } from 'vitest';
import {
  AddLayer,
  AddObjects,
  AddVttItems,
  CompositeCommand,
  SetObjectGroup,
  GroupLayers,
  History,
  MergeLayerDown,
  MoveLayer,
  MoveObjectsToLayer,
  PatchGrid,
  PatchLayer,
  PatchObjects,
  RemoveLayer,
  RemoveObjects,
  ReorderObjects,
  ResizeMap,
  SetFilters,
  newGroupLayer,
  newObjectLayer,
} from '@/model/commands';
import { createDocument, expandToGroups, flattenLayers, objectsOfLayer } from '@/model/document';
import { SYSTEM_GRID, SYSTEM_VTT, type MapDocument, type PropObject } from '@/model/types';

function prop(id: string, layerId: string, x = 0, y = 0): PropObject {
  return {
    id, kind: 'prop', layerId, propId: 'stone_small', x, y,
    rotation: 0, scaleX: 1, scaleY: 1, tint: null, flipX: false, flipY: false,
    opacity: 1, z: 0, locked: false, seed: 1,
  };
}

/** Tiefer Vergleichsabzug, um „undo stellt exakt wieder her" zu prüfen. */
function snapshot(doc: MapDocument): string {
  return JSON.stringify(doc);
}

let doc: MapDocument;
let history: History;
let userLayers: string[];

beforeEach(() => {
  doc = createDocument(20, 15);
  history = new History();
  userLayers = doc.rootLayers.filter((id) => id !== SYSTEM_GRID && id !== SYSTEM_VTT);
});

describe('Dokument-Grundgerüst', () => {
  it('legt vier Benutzerebenen plus Grid und VTT an', () => {
    expect(userLayers).toHaveLength(4);
    expect(doc.rootLayers).toContain(SYSTEM_GRID);
    expect(doc.rootLayers).toContain(SYSTEM_VTT);
  });

  it('schließt die VTT-Ebene vom Export aus', () => {
    expect(doc.layers[SYSTEM_VTT].includeInExport).toBe(false);
  });
});

describe('Undo stellt den Ausgangszustand wieder her', () => {
  const roundtrip = (make: () => Parameters<History['exec']>[1]) => {
    const before = snapshot(doc);
    history.exec(doc, make());
    expect(snapshot(doc)).not.toBe(before);
    history.undo(doc);
    // meta.modified ändert sich absichtlich mit jedem Befehl.
    const after = JSON.parse(snapshot(doc)) as MapDocument;
    const expected = JSON.parse(before) as MapDocument;
    after.meta.modified = expected.meta.modified;
    expect(after).toEqual(expected);
  };

  it('für AddObjects', () => roundtrip(() => new AddObjects([prop('a', userLayers[0])])));

  it('für RemoveObjects', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0]), prop('b', userLayers[0])]));
    roundtrip(() => new RemoveObjects(['a']));
  });

  it('für PatchObjects', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0], 10, 20)]));
    roundtrip(() => new PatchObjects({ a: { x: 99, rotation: 1.5, tint: 0xff0000 } }));
  });

  it('für ReorderObjects', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0]), prop('b', userLayers[0])]));
    roundtrip(() => new ReorderObjects(['a'], true));
  });

  it('für MoveObjectsToLayer', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0])]));
    roundtrip(() => new MoveObjectsToLayer(['a'], userLayers[2]));
  });

  it('für AddLayer', () => roundtrip(() => new AddLayer(newObjectLayer('Neu'))));

  it('für PatchLayer', () =>
    roundtrip(() => new PatchLayer(userLayers[1], { visible: false, opacity: 0.3 })));

  it('für MoveLayer', () => roundtrip(() => new MoveLayer(userLayers[0], null, 3)));

  it('für ResizeMap', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0], 100, 100)]));
    roundtrip(() => new ResizeMap(40, 30, 'center'));
  });

  it('für PatchGrid', () => roundtrip(() => new PatchGrid({ type: 'hexPointy', tileSize: 70 })));

  it('für RemoveLayer samt Inhalt', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[1]), prop('b', userLayers[1])]));
    roundtrip(() => new RemoveLayer(userLayers[1]));
  });

  it('für MergeLayerDown', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[1]), prop('b', userLayers[0])]));
    roundtrip(() => new MergeLayerDown(userLayers[1]));
  });

  it('für GroupLayers', () =>
    roundtrip(() => new GroupLayers([userLayers[0], userLayers[1]], newGroupLayer('G'))));
});

describe('Objekte', () => {
  it('behalten beim Layerwechsel ihre Position', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0], 42, 84)]));
    history.exec(doc, new MoveObjectsToLayer(['a'], userLayers[3]));
    expect(doc.objects.a.layerId).toBe(userLayers[3]);
    expect(doc.objects.a.x).toBe(42);
    expect(doc.objects.a.y).toBe(84);
  });

  it('werden beim Löschen ihres Layers mitentfernt und kommen mit zurück', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[1]), prop('b', userLayers[0])]));
    history.exec(doc, new RemoveLayer(userLayers[1]));
    expect(doc.objects.a).toBeUndefined();
    expect(doc.objects.b).toBeDefined();
    history.undo(doc);
    expect(doc.objects.a).toBeDefined();
    expect(doc.objects.a.layerId).toBe(userLayers[1]);
  });

  it('landen beim Zusammenführen im darunterliegenden Layer', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[1]), prop('b', userLayers[1])]));
    history.exec(doc, new MergeLayerDown(userLayers[1]));
    expect(doc.layers[userLayers[1]]).toBeUndefined();
    expect(objectsOfLayer(doc, userLayers[0]).map((o) => o.id).sort()).toEqual(['a', 'b']);
  });

  it('werden von ReorderObjects nach vorn bzw. hinten sortiert', () => {
    history.exec(doc, new AddObjects([
      { ...prop('a', userLayers[0]), z: 1 },
      { ...prop('b', userLayers[0]), z: 2 },
      { ...prop('c', userLayers[0]), z: 3 },
    ]));
    history.exec(doc, new ReorderObjects(['a'], true));
    expect(objectsOfLayer(doc, userLayers[0]).at(-1)!.id).toBe('a');
    history.exec(doc, new ReorderObjects(['a'], false));
    expect(objectsOfLayer(doc, userLayers[0])[0].id).toBe('a');
  });
});

describe('Layer-Stapel', () => {
  it('klappt Gruppen in der Renderreihenfolge auf', () => {
    const group = newGroupLayer('G');
    history.exec(doc, new GroupLayers([userLayers[0], userLayers[1]], group));
    const flat = flattenLayers(doc).map((l) => l.id);
    expect(flat).toContain(group.id);
    // Gruppenkinder stehen direkt hinter der Gruppe.
    const gi = flat.indexOf(group.id);
    expect(flat.slice(gi + 1, gi + 3).sort()).toEqual([userLayers[0], userLayers[1]].sort());
  });

  it('verweigert das Verschieben einer Gruppe in sich selbst', () => {
    const group = newGroupLayer('G');
    history.exec(doc, new GroupLayers([userLayers[0]], group));
    const before = snapshot(doc);
    history.exec(doc, new MoveLayer(group.id, group.id, 0));
    const after = JSON.parse(snapshot(doc)) as MapDocument;
    const expected = JSON.parse(before) as MapDocument;
    after.meta.modified = expected.meta.modified;
    expect(after).toEqual(expected);
  });

  it('lässt Systemebenen nicht löschen', () => {
    history.exec(doc, new RemoveLayer(SYSTEM_GRID));
    expect(doc.layers[SYSTEM_GRID]).toBeDefined();
    expect(doc.rootLayers).toContain(SYSTEM_GRID);
  });

  it('erlaubt Systemebenen im Stapel zu verschieben', () => {
    history.exec(doc, new MoveLayer(SYSTEM_GRID, null, 0));
    expect(doc.rootLayers[0]).toBe(SYSTEM_GRID);
  });
});

describe('ResizeMap', () => {
  it('verschiebt den Inhalt gemäß Anker', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0], 100, 100)]));
    // Von 20×15 auf 30×15 mit Anker rechts: der Inhalt rückt um 1000 px nach rechts.
    history.exec(doc, new ResizeMap(30, 15, 'right'));
    expect(doc.objects.a.x).toBe(1100);
    expect(doc.objects.a.y).toBe(100);
  });

  it('lässt den Inhalt bei Anker oben-links stehen', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0], 100, 100)]));
    history.exec(doc, new ResizeMap(40, 40, 'top-left'));
    expect(doc.objects.a).toMatchObject({ x: 100, y: 100 });
  });

  it('verschiebt auch Wände, Türen und Lichter', () => {
    doc.vtt.walls.push({ id: 'w', points: [0, 0, 100, 0], type: 'normal', closed: false });
    doc.vtt.portals.push({ id: 'p', bounds: [0, 0, 50, 0], closed: true, freestanding: false });
    doc.vtt.lights.push({ id: 'l', x: 10, y: 10, range: 3, intensity: 1, color: 0xffffff, alpha: 1, shadows: true });
    history.exec(doc, new ResizeMap(30, 15, 'right'));
    expect(doc.vtt.walls[0].points[0]).toBe(1000);
    expect(doc.vtt.portals[0].bounds[2]).toBe(1050);
    expect(doc.vtt.lights[0].x).toBe(1010);
  });
});

describe('History', () => {
  it('verschmilzt gleichartige Befehle innerhalb einer Transaktion', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0], 0, 0)]));
    history.beginTransaction();
    for (let i = 1; i <= 20; i++) {
      history.exec(doc, new PatchObjects({ a: { x: i * 10 } }, 'Verschieben', 'move'));
    }
    history.endTransaction();
    expect(doc.objects.a.x).toBe(200);
    // Ein Zug, ein Undo-Schritt.
    history.undo(doc);
    expect(doc.objects.a.x).toBe(0);
  });

  it('verschmilzt ohne Transaktion und ohne mergeKey nicht', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0], 0, 0)]));
    history.exec(doc, new PatchObjects({ a: { x: 50 } }));
    history.exec(doc, new PatchObjects({ a: { x: 90 } }));
    history.undo(doc);
    expect(doc.objects.a.x).toBe(50);
  });

  it('sammelt einen Pinselstrich zu einem Schritt', () => {
    history.beginTransaction();
    for (let i = 0; i < 30; i++) {
      history.exec(doc, new AddObjects([prop(`s${i}`, userLayers[0])], 'Pinselstrich', 'brush'));
    }
    history.endTransaction();
    expect(Object.keys(doc.objects)).toHaveLength(30);
    history.undo(doc);
    expect(Object.keys(doc.objects)).toHaveLength(0);
    history.redo(doc);
    expect(Object.keys(doc.objects)).toHaveLength(30);
  });

  it('verwirft den Redo-Stapel nach einem neuen Befehl', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0])]));
    history.undo(doc);
    expect(history.canRedo).toBe(true);
    history.exec(doc, new AddObjects([prop('b', userLayers[0])]));
    expect(history.canRedo).toBe(false);
  });

  it('meldet Beschriftungen für die Werkzeugleiste', () => {
    expect(history.canUndo).toBe(false);
    history.exec(doc, new AddObjects([prop('a', userLayers[0])], 'Prop platzieren'));
    expect(history.undoLabel).toBe('Prop platzieren');
    history.undo(doc);
    expect(history.redoLabel).toBe('Prop platzieren');
  });
});

describe('CompositeCommand', () => {
  it('macht aus mehreren Befehlen einen Undo-Schritt', () => {
    const vorher = snapshot(doc);
    const wall = { id: 'w1', points: [0, 0, 100, 0], type: 'normal' as const, closed: false };
    const cmd = new CompositeCommand([
      new AddObjects([prop('p1', userLayers[0])]),
      new AddVttItems('walls', [wall]),
    ]);

    history.exec(doc, cmd);
    expect(Object.keys(doc.objects)).toHaveLength(1);
    expect(doc.vtt.walls).toHaveLength(1);

    // Ein einziges Rückgängig muss beides zurücknehmen — vorher lagen hier
    // zwei Einträge im Verlauf und die Hälfte blieb stehen.
    history.undo(doc);
    expect(Object.keys(doc.objects)).toHaveLength(0);
    expect(doc.vtt.walls).toHaveLength(0);
    // meta.modified ändert sich absichtlich mit jedem Befehl.
    const nachher = JSON.parse(snapshot(doc)) as MapDocument;
    const erwartet = JSON.parse(vorher) as MapDocument;
    nachher.meta.modified = erwartet.meta.modified;
    expect(nachher).toEqual(erwartet);

    history.redo(doc);
    expect(Object.keys(doc.objects)).toHaveLength(1);
    expect(doc.vtt.walls).toHaveLength(1);
  });

  it('wickelt in umgekehrter Reihenfolge ab', () => {
    const reihenfolge: string[] = [];
    const merker = (name: string) => ({
      label: name,
      do: () => { reihenfolge.push('do ' + name); return []; },
      undo: () => { reihenfolge.push('undo ' + name); return []; },
    });

    const cmd = new CompositeCommand([merker('a'), merker('b')]);
    cmd.do(doc);
    cmd.undo(doc);
    expect(reihenfolge).toEqual(['do a', 'do b', 'undo b', 'undo a']);
  });

  it('übernimmt die Beschriftung des ersten Befehls, wenn keine angegeben ist', () => {
    const cmd = new CompositeCommand([new AddObjects([prop('p1', userLayers[0])], 'Prop setzen')]);
    expect(cmd.label).toBe('Prop setzen');
    expect(new CompositeCommand([], 'Eigen').label).toBe('Eigen');
  });
});

describe('Objektgruppen', () => {
  it('setzt und löst die Gruppenkennung', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0]), prop('b', userLayers[0])]));
    history.exec(doc, new SetObjectGroup(['a', 'b'], 'grp1'));
    expect(doc.objects['a'].groupId).toBe('grp1');
    expect(doc.objects['b'].groupId).toBe('grp1');

    history.undo(doc);
    // Vorher war gar keine Kennung gesetzt — undefined, nicht 'grp1'.
    expect(doc.objects['a'].groupId ?? null).toBeNull();

    history.redo(doc);
    expect(doc.objects['b'].groupId).toBe('grp1');
    history.exec(doc, new SetObjectGroup(['a', 'b'], null));
    expect(doc.objects['a'].groupId).toBeNull();
  });

  it('lässt Objekte in Ruhe, die es nicht gibt', () => {
    history.exec(doc, new AddObjects([prop('a', userLayers[0])]));
    expect(() => history.exec(doc, new SetObjectGroup(['a', 'gibtsnicht'], 'g'))).not.toThrow();
    expect(doc.objects['a'].groupId).toBe('g');
  });
});

describe('expandToGroups', () => {
  it('holt die ganze Gruppe zu einem Mitglied', () => {
    history.exec(doc, new AddObjects([
      prop('a', userLayers[0]), prop('b', userLayers[0]), prop('c', userLayers[0]),
    ]));
    history.exec(doc, new SetObjectGroup(['a', 'b'], 'g1'));
    expect(expandToGroups(doc, ['a']).sort()).toEqual(['a', 'b']);
    // Ein Objekt ohne Gruppe bleibt für sich.
    expect(expandToGroups(doc, ['c'])).toEqual(['c']);
    expect(expandToGroups(doc, ['a', 'c']).sort()).toEqual(['a', 'b', 'c']);
  });

  it('gibt bei unbekannten Ids nichts zurück', () => {
    expect(expandToGroups(doc, ['weg'])).toEqual([]);
  });
});

/**
 * Vier Fehler, die der Zufallslauf in `undoFuzz.test.ts` gefunden hat.
 *
 * Sie stehen hier noch einmal mit Namen, weil ein gewürfelter Fehlschlag zwar
 * beweist, *dass* etwas kaputt ist, aber nicht festhält, *was*. Fällt einer
 * davon zurück, soll die Meldung ihn benennen und nicht nur einen Startwert.
 *
 * Allen vieren ist dasselbe gemeinsam: der Schaden entsteht lautlos. Nichts
 * wirft, nichts sieht falsch aus — der Ebenenstapel ist danach nur nicht mehr
 * das, was er vorgibt zu sein, und man merkt es erst an der gespeicherten Datei.
 */
describe('Ebenen: was der Zufallslauf gefunden hat', () => {
  /** Ein Verweis darf im ganzen Stapel genau einmal vorkommen. */
  function verweise(d: MapDocument): Map<string, number> {
    const n = new Map<string, number>();
    const zaehle = (ids: string[]) => ids.forEach((i) => n.set(i, (n.get(i) ?? 0) + 1));
    zaehle(d.rootLayers);
    for (const l of Object.values(d.layers)) zaehle(l.children);
    return n;
  }

  /**
   * Abzug ohne `meta`.
   *
   * `snapshot` oben nimmt das ganze Dokument, und `touchModified` schreibt bei
   * jedem Befehl einen neuen Zeitstempel. Für „hat sich etwas geändert?"
   * stört das nicht, für „ist es exakt dasselbe?" schon: die beiden Abzüge
   * liegen dann mal in derselben Millisekunde und mal nicht, und der Test
   * schlüge zufällig fehl.
   */
  function inhalt(d: MapDocument): string {
    const { meta: _meta, ...rest } = d;
    return JSON.stringify(rest);
  }

  /** Alles, was von der Wurzel aus erreichbar ist. */
  function erreichbar(d: MapDocument): Set<string> {
    const raus = new Set<string>();
    const lauf = (ids: string[]) => {
      for (const i of ids) {
        if (raus.has(i)) continue;
        raus.add(i);
        const l = d.layers[i];
        if (l) lauf(l.children);
      }
    };
    lauf(d.rootLayers);
    return raus;
  }

  it('nimmt dieselbe Ebene nur einmal in eine neue Gruppe', () => {
    const ziel = userLayers[0];
    history.exec(doc, new GroupLayers([ziel, ziel], newGroupLayer('G')));
    expect(verweise(doc).get(ziel)).toBe(1);

    history.undo(doc);
    expect(verweise(doc).get(ziel)).toBe(1);
    expect(doc.rootLayers).toEqual(userLayers.concat([SYSTEM_GRID, SYSTEM_VTT]));
  });

  it('gruppiert eine Ebene nicht mit ihrer eigenen Gruppe', () => {
    const gruppe = newGroupLayer('Außen');
    history.exec(doc, new GroupLayers([userLayers[0], userLayers[1]], gruppe));
    // Jetzt Kind *und* Gruppe zusammen gruppieren: das Kind kommt von allein
    // mit, es zusätzlich zu nehmen hängte die neue Gruppe unter ihr eigenes Kind.
    history.exec(doc, new GroupLayers([gruppe.id, userLayers[0]], newGroupLayer('Innen')));

    const da = erreichbar(doc);
    for (const id of Object.keys(doc.layers)) expect(da.has(id)).toBe(true);
    for (const [, n] of verweise(doc)) expect(n).toBe(1);
  });

  it('macht beim Rückgängig nichts, wenn das Verschieben abgelehnt wurde', () => {
    const gruppe = newGroupLayer('G');
    history.exec(doc, new GroupLayers([userLayers[0]], gruppe));
    const vorher = inhalt(doc);

    // Eine Gruppe in ihren eigenen Nachfahren zu ziehen wird abgelehnt —
    // sichtbar passiert nichts, der Befehl steht aber trotzdem im Verlauf.
    history.exec(doc, new MoveLayer(gruppe.id, userLayers[0], 0));
    expect(inhalt(doc)).toBe(vorher);

    history.undo(doc);
    expect(inhalt(doc)).toBe(vorher);
    expect(verweise(doc).get(gruppe.id)).toBe(1);
  });

  it('macht beim Rückgängig nichts, wenn eine Systemebene nicht gelöscht wurde', () => {
    const vorher = inhalt(doc);
    history.exec(doc, new RemoveLayer(SYSTEM_GRID));
    expect(inhalt(doc)).toBe(vorher);

    history.undo(doc);
    expect(inhalt(doc)).toBe(vorher);
    expect(verweise(doc).get(SYSTEM_GRID)).toBe(1);
  });

  it('stellt „gar keine Filter" wieder her und nicht „Filter: keine"', () => {
    expect('filters' in doc).toBe(false);
    history.exec(doc, new SetFilters(null, { ...KEINE_FILTER, blur: 4 }));
    expect(doc.filters?.blur).toBe(4);

    history.undo(doc);
    // Gleichbedeutend wäre `null` auch — aber dann stünde in jeder
    // gespeicherten Datei ein Feld, das der Benutzer nie angefasst hat.
    expect(doc.filters).toBeUndefined();
  });
});

const KEINE_FILTER = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  hue: 0,
  tint: null,
  tintAmount: 0,
  blur: 0,
  grain: 0,
  vignette: 0,
};
