/**
 * Verschmelzen im Verlauf.
 *
 * Befehle mit gleichem `mergeKey` gehen zusammen, damit ein Reglerzug ein
 * Undo-Schritt bleibt. Der Schlüssel allein sagt aber nicht, dass zwei Befehle
 * auch zusammenpassen: derselbe Schlüssel kann eine andere Ebene, eine andere
 * Art oder ein anderes Ziel meinen. `absorb` lehnt dann ab — und die History
 * muss den Befehl in dem Fall behalten.
 *
 * Tat sie nicht: sie warf ihn weg, obwohl seine Wirkung schon im Dokument
 * stand. Rückgängig kam nie wieder daran. Gefunden hat es der Zufallslauf,
 * hier steht der Fall beim Namen.
 */

import { describe, expect, it } from 'vitest';
import { History, PatchVttItems, SetFilters } from '@/model/commands';
import { createDocument } from '@/model/document';
import { defaultFilters } from '@/model/filters';
import type { MapDocument } from '@/model/types';

function karte(): MapDocument {
  const doc = createDocument(10, 10);
  doc.vtt.walls = [{ id: 'w1', points: [0, 0, 100, 0], type: 'normal', closed: false }];
  doc.vtt.lights = [
    { id: 'l1', x: 50, y: 50, range: 3, intensity: 1, color: 0xffffff, alpha: 1, shadows: true },
  ];
  return doc;
}

describe('History.exec', () => {
  it('behält einen Befehl, den absorb ablehnt (andere Ebene)', () => {
    const doc = karte();
    const history = new History(50);
    const layer = doc.rootLayers[0];
    const hell = { ...defaultFilters(), brightness: 1.5 };
    const dunkel = { ...defaultFilters(), brightness: 0.5 };

    // Gleicher Schlüssel, verschiedene Ziele: Karte und Ebene.
    history.beginTransaction();
    history.exec(doc, new SetFilters(null, hell, 'Filter', 'filters'));
    history.exec(doc, new SetFilters(layer, dunkel, 'Filter', 'filters'));
    history.endTransaction();

    expect(doc.filters?.brightness).toBe(1.5);
    expect(doc.layers[layer].filters?.brightness).toBe(0.5);

    history.undo(doc);
    expect(doc.layers[layer].filters).toBeUndefined();
    expect(doc.filters?.brightness).toBe(1.5);

    history.undo(doc);
    expect(doc.filters).toBeUndefined();
    expect(history.canUndo).toBe(false);
  });

  it('behält einen Befehl, den absorb ablehnt (andere VTT-Art)', () => {
    const doc = karte();
    const history = new History(50);

    history.beginTransaction();
    history.exec(doc, new PatchVttItems('walls', new Map([['w1', { closed: true }]]), 'x', 'vtt'));
    history.exec(doc, new PatchVttItems('lights', new Map([['l1', { range: 9 }]]), 'x', 'vtt'));
    history.endTransaction();

    expect(doc.vtt.walls[0].closed).toBe(true);
    expect(doc.vtt.lights[0].range).toBe(9);

    history.undo(doc);
    expect(doc.vtt.lights[0].range).toBe(3);
    expect(doc.vtt.walls[0].closed).toBe(true);

    history.undo(doc);
    expect(doc.vtt.walls[0].closed).toBe(false);
  });

  it('verschmilzt weiterhin, was zusammengehört', () => {
    const doc = karte();
    const history = new History(50);

    history.beginTransaction();
    history.exec(doc, new PatchVttItems('lights', new Map([['l1', { range: 5 }]]), 'x', 'vtt'));
    history.exec(doc, new PatchVttItems('lights', new Map([['l1', { range: 7 }]]), 'x', 'vtt'));
    history.exec(doc, new PatchVttItems('lights', new Map([['l1', { range: 9 }]]), 'x', 'vtt'));
    history.endTransaction();

    expect(doc.vtt.lights[0].range).toBe(9);
    // Ein Zug, ein Schritt: ein einziges Rückgängig führt zum Ausgangswert.
    history.undo(doc);
    expect(doc.vtt.lights[0].range).toBe(3);
    expect(history.canUndo).toBe(false);
  });

  it('macht ein abgelehntes Verschmelzen auch wiederholbar', () => {
    const doc = karte();
    const history = new History(50);
    const hell = { ...defaultFilters(), brightness: 1.5 };

    history.beginTransaction();
    history.exec(doc, new SetFilters(null, hell, 'Filter', 'filters'));
    history.exec(doc, new PatchVttItems('walls', new Map([['w1', { closed: true }]]), 'x', 'filters'));
    history.endTransaction();

    history.undo(doc);
    history.undo(doc);
    history.redo(doc);
    history.redo(doc);

    expect(doc.filters?.brightness).toBe(1.5);
    expect(doc.vtt.walls[0].closed).toBe(true);
  });
});
