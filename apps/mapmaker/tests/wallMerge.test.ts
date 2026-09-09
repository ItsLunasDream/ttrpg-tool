import { describe, expect, it } from 'vitest';
import { mergeWalls } from '@/model/wallMerge';
import type { Wall } from '@/model/types';

const wand = (id: string, points: number[], patch: Partial<Wall> = {}): Wall => ({
  id,
  points,
  type: 'normal',
  closed: false,
  ...patch,
});

describe('mergeWalls', () => {
  it('hängt zwei Züge aneinander, die sich an den Enden berühren', () => {
    const { merged, removedIds } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('b', [100, 0, 100, 100]),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].points).toEqual([0, 0, 100, 0, 100, 100]);
    expect(removedIds.sort()).toEqual(['a', 'b']);
  });

  it('dreht einen Zug um, wenn er verkehrt herum anschließt', () => {
    const { merged } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      // Endet dort, wo a endet — muss umgedreht angehängt werden.
      wand('b', [100, 100, 100, 0]),
    ]);
    expect(merged[0].points).toEqual([0, 0, 100, 0, 100, 100]);
  });

  it('hängt auch vorn an', () => {
    const { merged } = mergeWalls([
      wand('a', [100, 0, 200, 0]),
      wand('b', [0, 0, 100, 0]),
    ]);
    expect(merged[0].points).toEqual([0, 0, 100, 0, 200, 0]);
  });

  it('führt eine Kette aus mehreren Zügen zusammen', () => {
    const { merged, removedIds } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('c', [200, 0, 300, 0]),
      wand('b', [100, 0, 200, 0]),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].points).toEqual([0, 0, 100, 0, 200, 0, 300, 0]);
    expect(removedIds).toHaveLength(3);
  });

  it('schließt einen Ring und lässt den doppelten Punkt weg', () => {
    const { merged } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('b', [100, 0, 100, 100]),
      wand('c', [100, 100, 0, 100]),
      wand('d', [0, 100, 0, 0]),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].closed).toBe(true);
    // Vier Ecken, nicht fünf — der Schlusspunkt wäre eine Kante der Länge null.
    expect(merged[0].points).toEqual([0, 0, 100, 0, 100, 100, 0, 100]);
  });

  it('lässt einen einzelnen Zug in Ruhe', () => {
    const { merged, removedIds } = mergeWalls([wand('a', [0, 0, 100, 0])]);
    expect(merged).toEqual([]);
    expect(removedIds).toEqual([]);
  });

  it('lässt Züge in Ruhe, die sich gar nicht berühren', () => {
    const { merged } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('b', [500, 500, 600, 500]),
    ]);
    expect(merged).toEqual([]);
  });

  it('führt verschiedene Wandarten nicht zusammen', () => {
    // Eine Mauer und ein Fenster sehen in Foundry verschieden aus.
    const { merged } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('b', [100, 0, 200, 0], { type: 'window' }),
    ]);
    expect(merged).toEqual([]);
  });

  it('fasst geschlossene Züge nicht an — die haben keine Enden', () => {
    const { merged } = mergeWalls([
      wand('ring', [0, 0, 100, 0, 100, 100], { closed: true }),
      wand('b', [0, 0, -100, 0]),
    ]);
    expect(merged).toEqual([]);
  });

  it('verzeiht einen Rundungsfehler von einem Pixel', () => {
    const { merged } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('b', [100.8, 0, 200, 0]),
    ]);
    expect(merged).toHaveLength(1);
    // Der Anschlusspunkt der Kette bleibt der des ersten Zuges.
    expect(merged[0].points).toEqual([0, 0, 100, 0, 200, 0]);
  });

  it('führt zwei getrennte Ketten getrennt zusammen', () => {
    const { merged } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('b', [100, 0, 200, 0]),
      wand('c', [500, 0, 600, 0]),
      wand('d', [600, 0, 700, 0]),
    ]);
    expect(merged).toHaveLength(2);
    expect(merged.map((w) => w.points.length)).toEqual([6, 6]);
  });

  it('gibt den zusammengeführten Zügen frische Kennungen', () => {
    const { merged, removedIds } = mergeWalls([
      wand('a', [0, 0, 100, 0]),
      wand('b', [100, 0, 200, 0]),
    ]);
    expect(removedIds).not.toContain(merged[0].id);
  });
});
