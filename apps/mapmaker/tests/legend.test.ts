import { describe, expect, it } from 'vitest';
import {
  buildLegendObjects,
  collectLegendEntries,
  legendKey,
  resolveLegendEntries,
  type LegendEntry,
} from '@/model/legend';
import { createDocument, makeHeightMap } from '@/model/document';
import { PaintBiome, SetHeightMap } from '@/model/commands';
import { BIOMES, type MapDocument, type MapObject, type PropObject } from '@/model/types';

const propName = (id: string) => ({ w_mountain: 'Gebirge', w_town: 'Ortschaft' })[id] ?? null;
const biomeName = (id: string) => id;

function docMitAllem(): { doc: MapDocument; layerId: string } {
  const doc = createDocument(10, 8, 'x');
  const layerId = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!.id;
  return { doc, layerId };
}

function setzeProp(doc: MapDocument, layerId: string, propId: string, n: number): void {
  for (let i = 0; i < n; i++) {
    const o: PropObject = {
      id: `p${propId}${i}`,
      kind: 'prop',
      layerId,
      x: i * 10,
      y: 0,
      rotation: 0,
      opacity: 1,
      z: i,
      locked: false,
      propId,
      scaleX: 1,
      scaleY: 1,
      tint: null,
      flipX: false,
      flipY: false,
      seed: 1,
    };
    doc.objects[o.id] = o;
  }
}

describe('Legende sammeln', () => {
  it('eine leere Karte ergibt keine Einträge', () => {
    const { doc } = docMitAllem();
    expect(collectLegendEntries(doc, propName, biomeName)).toEqual([]);
  });

  /** Nur *benutzte* Biome: eine Legende mit allen zehn erklärt nichts. */
  it('nimmt nur gemalte Biome auf', () => {
    const { doc, layerId } = docMitAllem();
    new SetHeightMap(layerId, makeHeightMap(10, 8, 1)).do(doc);
    new PaintBiome(layerId, new Map([[3, 4], [4, 4], [9, 7]])).do(doc);

    const e = collectLegendEntries(doc, propName, biomeName);
    expect(e.map((x) => x.label)).toEqual([BIOMES[3].id, BIOMES[6].id]);
  });

  /** In der Reihenfolge der Liste, damit dieselbe Karte gleich aussieht. */
  it('sortiert Biome nach der Liste, nicht nach dem Malen', () => {
    const { doc, layerId } = docMitAllem();
    new SetHeightMap(layerId, makeHeightMap(10, 8, 1)).do(doc);
    new PaintBiome(layerId, new Map([[0, 9]])).do(doc);
    new PaintBiome(layerId, new Map([[1, 2]])).do(doc);

    const e = collectLegendEntries(doc, propName, biomeName);
    expect(e.map((x) => x.key)).toEqual(['2', '9']);
  });

  it('nimmt benutzte Props auf, häufigste zuerst', () => {
    const { doc, layerId } = docMitAllem();
    setzeProp(doc, layerId, 'w_town', 2);
    setzeProp(doc, layerId, 'w_mountain', 5);

    const e = collectLegendEntries(doc, propName, biomeName);
    expect(e.map((x) => x.key)).toEqual(['w_mountain', 'w_town']);
  });

  /** Ein Prop, dessen Bibliothek es nicht mehr gibt, darf keine leere Zeile geben. */
  it('übergeht Props ohne Namen', () => {
    const { doc, layerId } = docMitAllem();
    setzeProp(doc, layerId, 'gibtsnicht', 3);
    expect(collectLegendEntries(doc, propName, biomeName)).toEqual([]);
  });

  it('zählt dasselbe Prop nur einmal', () => {
    const { doc, layerId } = docMitAllem();
    setzeProp(doc, layerId, 'w_town', 7);
    expect(collectLegendEntries(doc, propName, biomeName)).toHaveLength(1);
  });
});

describe('Legende bauen', () => {
  const opts = {
    layerId: 'l',
    x: 100,
    y: 50,
    rowHeight: 40,
    title: 'Legende',
    backgroundColor: 0x111111,
    backgroundAlpha: 0.8,
    borderColor: 0xffffff,
    textColor: 0xeeeeee,
    fontFamily: 'Georgia, serif',
  };

  it('legt Rahmen, Farbfeld, Prop und Beschriftungen an', () => {
    const { doc } = docMitAllem();
    const eintraege = [
      { kind: 'biome' as const, key: '2', color: 0x123456, label: 'Sumpf' },
      { kind: 'prop' as const, key: 'w_town', label: 'Ortschaft' },
    ];
    const { objects, groupId } = buildLegendObjects(doc, eintraege, opts);

    // Rahmen + Titel + (Feld + Text) + (Prop + Text)
    expect(objects).toHaveLength(6);
    expect(objects.filter((o) => o.kind === 'prop')).toHaveLength(1);
    expect(objects.filter((o) => o.kind === 'text')).toHaveLength(3);
    // Alles gehört zusammen, damit sich die Tafel als Ganzes anfassen lässt.
    for (const o of objects) expect(o.groupId).toBe(groupId);
  });

  it('der Rahmen liegt hinter den Einträgen', () => {
    const { doc } = docMitAllem();
    const { objects } = buildLegendObjects(
      doc,
      [{ kind: 'biome', key: '1', color: 1, label: 'a' }],
      opts,
    );
    const rahmen = objects[0];
    for (const o of objects.slice(1)) expect(o.z).toBeGreaterThan(rahmen.z);
  });

  it('wächst mit der Zahl der Einträge', () => {
    const { doc } = docMitAllem();
    const hoehe = (n: number) => {
      const e = Array.from({ length: n }, (_, i) => ({
        kind: 'biome' as const,
        key: String(i + 1),
        color: 0,
        label: 'x',
      }));
      const rahmen = buildLegendObjects(doc, e, opts).objects[0];
      if (rahmen.kind !== 'shape') throw new Error('kein Rahmen');
      return rahmen.points[3];
    };
    expect(hoehe(4) - hoehe(2)).toBeCloseTo(2 * opts.rowHeight, 6);
  });

  it('ohne Titel fällt die Kopfzeile weg', () => {
    const { doc } = docMitAllem();
    const e = [{ kind: 'biome' as const, key: '1', color: 0, label: 'a' }];
    const mit = buildLegendObjects(doc, e, opts).objects;
    const ohne = buildLegendObjects(doc, e, { ...opts, title: '  ' }).objects;
    expect(mit.filter((o) => o.kind === 'text')).toHaveLength(2);
    expect(ohne.filter((o) => o.kind === 'text')).toHaveLength(1);
  });

  it('die Zeilen stehen untereinander', () => {
    const { doc } = docMitAllem();
    const e = [
      { kind: 'biome' as const, key: '1', color: 0, label: 'a' },
      { kind: 'biome' as const, key: '2', color: 0, label: 'b' },
    ];
    const texte = buildLegendObjects(doc, e, e ? opts : opts)
      .objects.filter((o) => o.kind === 'text')
      .slice(1); // ohne den Titel
    expect(texte[1].y - texte[0].y).toBeCloseTo(opts.rowHeight, 6);
    expect(texte[0].x).toBeCloseTo(texte[1].x, 6);
  });
});

describe('Signaturen in der Legende', () => {
  const opts = {
    layerId: 'l',
    x: 0,
    y: 0,
    rowHeight: 40,
    title: '',
    backgroundColor: 0,
    backgroundAlpha: 1,
    borderColor: 0,
    textColor: 0,
    fontFamily: 'serif',
  };

  /**
   * Ohne die Größenangabe stünden die Signaturen in ihrer Originalgröße
   * nebeneinander — ein Gebirge ist doppelt so breit wie ein Dorf, und die
   * Zeilen verlören jede Ordnung.
   */
  it('bringt verschieden große Props auf dieselbe Kastengröße', () => {
    const doc = createDocument(10, 8, 'x');
    doc.grid.tileSize = 100;
    const groessen: Record<string, { w: number; h: number }> = {
      gross: { w: 120, h: 80 },
      klein: { w: 40, h: 40 },
    };
    const { objects } = buildLegendObjects(
      doc,
      [
        { kind: 'prop', key: 'gross', label: 'a' },
        { kind: 'prop', key: 'klein', label: 'b' },
      ],
      opts,
      (id) => groessen[id] ?? null,
    );
    const props = objects.filter((o) => o.kind === 'prop');
    const kante = (o: (typeof props)[number], id: string) =>
      o.kind === 'prop' ? o.scaleX * Math.max(groessen[id].w, groessen[id].h) : 0;
    expect(kante(props[0], 'gross')).toBeCloseTo(kante(props[1], 'klein'), 6);
  });

  it('rechnet die Rasterweite heraus', () => {
    const fein = createDocument(10, 8, 'x');
    fein.grid.tileSize = 50;
    const grob = createDocument(10, 8, 'x');
    grob.grid.tileSize = 200;
    const bauen = (d: typeof fein) =>
      buildLegendObjects(d, [{ kind: 'prop', key: 'p', label: 'a' }], opts, () => ({ w: 100, h: 100 }))
        .objects.find((o) => o.kind === 'prop')!;
    const a = bauen(fein);
    const b = bauen(grob);
    if (a.kind !== 'prop' || b.kind !== 'prop') throw new Error('kein Prop');
    // Kleinere Felder heißen kleinerer Renderer-Faktor, also größerer Wert hier.
    expect(a.scaleX).toBeCloseTo(b.scaleX * 4, 6);
  });

  it('ohne Größenangabe bleibt ein brauchbarer Ersatzwert', () => {
    const doc = createDocument(10, 8, 'x');
    const prop = buildLegendObjects(doc, [{ kind: 'prop', key: 'p', label: 'a' }], opts)
      .objects.find((o) => o.kind === 'prop')!;
    if (prop.kind !== 'prop') throw new Error('kein Prop');
    expect(prop.scaleX).toBeGreaterThan(0);
  });
});

/**
 * Manueller Modus: Einträge abwählen, eigene aufnehmen.
 *
 * Der interessante Teil ist nicht das Filtern, sondern die *Reihenfolge* und
 * was passiert, wenn sich beides überschneidet — ein von Hand aufgenommener
 * Eintrag, der später doch auf der Karte auftaucht, darf nicht zweimal
 * dastehen.
 */
describe('Legende von Hand zusammenstellen', () => {
  const gefunden: LegendEntry[] = [
    { kind: 'biome', key: '3', color: 0x112233, label: 'Wald' },
    { kind: 'prop', key: 'w_mountain', label: 'Gebirge' },
  ];
  const info = (kind: 'biome' | 'prop', key: string) =>
    ({ label: `${kind}-${key}`, color: kind === 'biome' ? 0xabcdef : undefined });

  it('lässt ohne Einstellungen alles wie gehabt', () => {
    const e = resolveLegendEntries(gefunden, [], [], info);
    expect(e.map((x) => x.label)).toEqual(['Wald', 'Gebirge']);
    expect(e.some((x) => x.extra)).toBe(false);
  });

  it('nimmt Abgewähltes heraus', () => {
    const e = resolveLegendEntries(gefunden, ['prop:w_mountain'], [], info);
    expect(e.map((x) => x.label)).toEqual(['Wald']);
  });

  it('hängt Handeinträge hinten an und kennzeichnet sie', () => {
    const e = resolveLegendEntries(gefunden, [], [{ kind: 'prop', key: 'w_town' }], info);
    expect(e).toHaveLength(3);
    // Hinten, weil `buildLegendObjects` die Trennlinie an dieser Naht zieht.
    expect(e[2].extra).toBe(true);
    expect(e[0].extra).toBeUndefined();
    expect(e[1].extra).toBeUndefined();
  });

  /**
   * Der Fall, um den es wirklich geht: erst von Hand aufgenommen, dann doch
   * auf die Karte gemalt. Zweimal dieselbe Zeile erklärt nichts.
   */
  it('lässt einen Handeintrag weg, der inzwischen auf der Karte steht', () => {
    const e = resolveLegendEntries(gefunden, [], [{ kind: 'prop', key: 'w_mountain' }], info);
    expect(e).toHaveLength(2);
    expect(e.filter((x) => x.key === 'w_mountain')).toHaveLength(1);
  });

  it('nimmt denselben Handeintrag nicht doppelt auf', () => {
    const e = resolveLegendEntries(
      gefunden,
      [],
      [{ kind: 'prop', key: 'w_town' }, { kind: 'prop', key: 'w_town' }],
      info,
    );
    expect(e.filter((x) => x.key === 'w_town')).toHaveLength(1);
  });

  it('überspringt Handeinträge, zu denen es nichts gibt', () => {
    const e = resolveLegendEntries(gefunden, [], [{ kind: 'prop', key: 'gibtsnicht' }], () => null);
    expect(e).toHaveLength(2);
  });

  /** Biom und Prop mit gleicher Kennung dürfen sich nicht verwechseln. */
  it('unterscheidet Biom und Prop mit demselben Schlüssel', () => {
    expect(legendKey({ kind: 'biome', key: '3' })).not.toBe(legendKey({ kind: 'prop', key: '3' }));
    const e = resolveLegendEntries(
      [{ kind: 'biome', key: '3', label: 'Wald' }],
      ['prop:3'],
      [],
      info,
    );
    expect(e).toHaveLength(1);
  });

  /**
   * Die Trennlinie im Aufbau: mit Handeinträgen wird die Tafel höher, und die
   * zusätzliche Zeile ist eine Linie, kein Farbfeld.
   */
  it('zieht im Aufbau eine Trennlinie vor den Handeinträgen', () => {
    const { doc, layerId } = docMitAllem();
    const opts = {
      layerId, x: 0, y: 0, rowHeight: 40, title: 'Legende',
      backgroundColor: 0, backgroundAlpha: 1, borderColor: 0xffffff,
      textColor: 0xffffff, fontFamily: 'serif',
    };
    const ohne = buildLegendObjects(doc, gefunden, opts);
    const mit = buildLegendObjects(
      doc,
      resolveLegendEntries(gefunden, [], [{ kind: 'prop', key: 'w_town' }], info),
      opts,
    );

    const linien = (r: { objects: MapObject[] }) =>
      r.objects.filter((o) => o.kind === 'shape' && o.shape === 'line').length;
    expect(linien(ohne)).toBe(0);
    expect(linien(mit)).toBe(1);

    // Der Rahmen wächst um die Zeile *und* um die Trennlinie.
    const rahmen = (r: { objects: MapObject[] }) => {
      const rect = r.objects.find((o) => o.kind === 'shape' && o.shape === 'rect');
      return rect && rect.kind === 'shape' ? rect.points[3] : 0;
    };
    expect(rahmen(mit)).toBeGreaterThan(rahmen(ohne) + 40);
  });

  /** Nur Handeinträge: dann gibt es nichts zu trennen. */
  it('zieht keine Trennlinie, wenn alles von Hand ist', () => {
    const { doc, layerId } = docMitAllem();
    const nurExtra = resolveLegendEntries([], [], [{ kind: 'prop', key: 'w_town' }], info);
    const r = buildLegendObjects(doc, nurExtra, {
      layerId, x: 0, y: 0, rowHeight: 40, title: '',
      backgroundColor: 0, backgroundAlpha: 1, borderColor: 0xffffff,
      textColor: 0xffffff, fontFamily: 'serif',
    });
    expect(r.objects.filter((o) => o.kind === 'shape' && o.shape === 'line')).toHaveLength(0);
  });
});
