/**
 * Hilfslinien.
 *
 * Der Teil, der sich ohne Browser prüfen lässt: greifen, fangen, und die Frage,
 * wann eine Linie von der Karte gefallen ist. Das Ziehen selbst steht in
 * `e2e/hilfslinien.spec.ts` — dort gibt es einen Zeiger.
 */

import { describe, expect, it } from 'vitest';
import { createDocument } from '@/model/document';
import { guideAt, guideOnMap, guidesOf, snapToGuides } from '@/model/guides';
import type { Guide, MapDocument } from '@/model/types';

function karte(guides: Guide[]): MapDocument {
  const doc = createDocument();
  doc.guides = guides;
  return doc;
}

describe('Hilfslinien am Dokument', () => {
  it('liefert eine leere Liste, wenn eine ältere Karte das Feld nicht kennt', () => {
    const doc = createDocument();
    delete doc.guides;
    expect(guidesOf(doc)).toEqual([]);
  });
});

describe('Greifen', () => {
  const doc = karte([
    { id: 'a', axis: 'x', pos: 100 },
    { id: 'b', axis: 'y', pos: 300 },
  ]);

  it('findet die Linie unter dem Zeiger', () => {
    expect(guideAt(doc, { x: 102, y: 50 }, 5)?.id).toBe('a');
    expect(guideAt(doc, { x: 50, y: 297 }, 5)?.id).toBe('b');
  });

  it('greift nicht ins Leere', () => {
    expect(guideAt(doc, { x: 140, y: 140 }, 5)).toBeNull();
  });

  /** Die nähere gewinnt — sonst hinge es an der Reihenfolge in der Liste. */
  it('nimmt bei zwei nahen die nähere', () => {
    const eng = karte([
      { id: 'a', axis: 'x', pos: 100 },
      { id: 'b', axis: 'x', pos: 104 },
    ]);
    expect(guideAt(eng, { x: 103.6, y: 0 }, 5)?.id).toBe('b');
  });
});

describe('Fangen', () => {
  const doc = karte([
    { id: 'a', axis: 'x', pos: 100 },
    { id: 'b', axis: 'y', pos: 300 },
  ]);

  it('zieht den Punkt auf die Linie', () => {
    expect(snapToGuides(doc, { x: 104, y: 50 }, 6)).toEqual({ x: 100, y: 50 });
  });

  /** Beide Achsen getrennt: an einer Senkrechten hängen und in der Höhe frei. */
  it('fängt jede Achse für sich', () => {
    expect(snapToGuides(doc, { x: 103, y: 297 }, 6)).toEqual({ x: 100, y: 300 });
    expect(snapToGuides(doc, { x: 103, y: 50 }, 6)).toEqual({ x: 100, y: 50 });
  });

  it('lässt weit entfernte Punkte in Ruhe', () => {
    expect(snapToGuides(doc, { x: 200, y: 200 }, 6)).toEqual({ x: 200, y: 200 });
  });

  it('fängt gar nicht, wenn die Toleranz null ist', () => {
    expect(snapToGuides(doc, { x: 100.5, y: 50 }, 0)).toEqual({ x: 100.5, y: 50 });
  });
});

describe('Von der Karte gefallen', () => {
  const doc = createDocument();
  const tile = doc.grid.tileSize;

  it('erkennt Linien innerhalb und außerhalb', () => {
    expect(guideOnMap({ id: 'a', axis: 'x', pos: tile * 2 }, doc.size, tile)).toBe(true);
    expect(guideOnMap({ id: 'a', axis: 'x', pos: -1 }, doc.size, tile)).toBe(false);
    expect(
      guideOnMap({ id: 'a', axis: 'x', pos: (doc.size.cols + 1) * tile }, doc.size, tile),
    ).toBe(false);
  });

  /** Die Achse entscheidet, gegen welche Kante gemessen wird. */
  it('misst die waagerechte Linie an der Höhe', () => {
    expect(guideOnMap({ id: 'a', axis: 'y', pos: (doc.size.rows - 1) * tile }, doc.size, tile))
      .toBe(true);
    expect(guideOnMap({ id: 'a', axis: 'y', pos: (doc.size.rows + 1) * tile }, doc.size, tile))
      .toBe(false);
  });
});
