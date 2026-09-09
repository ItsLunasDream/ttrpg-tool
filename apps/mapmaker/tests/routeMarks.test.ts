/**
 * Tagesmarken auf Reiserouten.
 *
 * Der Kern ist die Bogenlänge: gleich lange Wege bekommen gleich viele
 * Marken, egal aus wie vielen Stützpunkten sie bestehen.
 */

import { describe, expect, it } from 'vitest';
import {
  dayLengthInPixels,
  markLength,
  routeDays,
  routeDistance,
  routeMarks,
} from '@/model/routeMarks';
import { createDocument } from '@/model/document';
import type { GridSettings } from '@/model/types';

/** Raster: ein Feld = 100 px = 10 km. */
function raster(patch: Partial<GridSettings> = {}): GridSettings {
  const g = createDocument(10, 10).grid;
  return { ...g, tileSize: 100, distance: { perTile: 10, unit: 'km', metric: 'euclidean' }, ...patch };
}

describe('dayLengthInPixels', () => {
  it('rechnet Spielweltdistanz in Weltpixel um', () => {
    // 40 km am Tag, 10 km je Feld, 100 px je Feld → 400 px.
    expect(dayLengthInPixels(raster(), 40)).toBe(400);
  });

  it('folgt einer anderen Feldgröße', () => {
    expect(dayLengthInPixels(raster({ tileSize: 50 }), 40)).toBe(200);
  });

  it('gibt 0 bei unbrauchbaren Angaben, statt zu teilen', () => {
    expect(dayLengthInPixels(raster(), 0)).toBe(0);
    expect(dayLengthInPixels(raster(), -5)).toBe(0);
  });
});

describe('routeMarks', () => {
  const gerade = [0, 0, 1000, 0];

  it('setzt Marken in festen Abständen, aber keine am Anfang', () => {
    const marks = routeMarks(gerade, 400);
    expect(marks.map((m) => m.x)).toEqual([400, 800]);
    expect(marks.map((m) => m.day)).toEqual([1, 2]);
  });

  it('zählt über Stützpunkte hinweg, nicht je Segment', () => {
    // Derselbe Weg, einmal aus zwei und einmal aus elf Punkten.
    const fein: number[] = [];
    for (let x = 0; x <= 1000; x += 100) fein.push(x, 0);
    expect(routeMarks(fein, 400).map((m) => m.x)).toEqual(routeMarks(gerade, 400).map((m) => m.x));
  });

  it('trägt die Richtung des Weges an der Marke', () => {
    // Erst nach rechts, dann nach unten: die zweite Marke steht im Knick.
    const knick = [0, 0, 300, 0, 300, 900];
    const marks = routeMarks(knick, 400);
    expect(marks[0].angle).toBeCloseTo(Math.PI / 2);
    expect(marks[0].x).toBe(300);
    expect(marks[0].y).toBe(100);
  });

  it('setzt eine Marke, die genau auf das Ende fällt', () => {
    expect(routeMarks([0, 0, 800, 0], 400)).toHaveLength(2);
  });

  it('setzt keine über das Ende hinaus', () => {
    expect(routeMarks([0, 0, 799, 0], 400)).toHaveLength(1);
  });

  it('deckelt die Zahl der Marken', () => {
    // Ein Tagesmarsch von einem Pixel auf einer Weltkarte ergäbe sonst
    // hunderttausend Querstriche.
    expect(routeMarks([0, 0, 100000, 0], 1, 500)).toHaveLength(500);
  });

  it('kommt mit entarteten Eingaben zurecht', () => {
    expect(routeMarks([], 400)).toEqual([]);
    expect(routeMarks([0, 0], 400)).toEqual([]);
    expect(routeMarks(gerade, 0)).toEqual([]);
    expect(routeMarks([0, 0, 0, 0, 500, 0], 400).map((m) => m.x)).toEqual([400]);
  });
});

describe('routeDistance und routeDays', () => {
  it('gibt die Länge in Spielweltdistanz', () => {
    // 1000 px = 10 Felder = 100 km.
    expect(routeDistance([0, 0, 1000, 0], raster())).toBe(100);
  });

  it('zählt angebrochene Tage mit', () => {
    // 100 km bei 40 km am Tag sind zweieinhalb — also drei Tage unterwegs.
    expect(routeDays([0, 0, 1000, 0], raster(), 40)).toBe(3);
    expect(routeDays([0, 0, 800, 0], raster(), 40)).toBe(2);
  });

  it('meldet 0 Tage statt Unendlich, wenn nichts angegeben ist', () => {
    expect(routeDays([0, 0, 1000, 0], raster(), 0)).toBe(0);
  });
});

describe('markLength', () => {
  it('richtet sich nach dem Tagesmarsch, nicht nach der Strichstärke', () => {
    // Weltkarte: ein Tag sind 2000 px, der Strich ist 3 px dünn.
    expect(markLength(2000, 3)).toBe(60);
  });

  it('fällt nie unter das Maß des Strichs', () => {
    // Battlemap: ein Tag wäre kürzer als der Strich dick ist.
    expect(markLength(50, 10)).toBe(25);
  });

  it('hat eine Untergrenze, damit sie überhaupt zu sehen ist', () => {
    expect(markLength(10, 1)).toBe(6);
  });
});
