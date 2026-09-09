/**
 * Sperren einer Wand: Bewegung, Sicht, Licht, Schall.
 *
 * Zwei Zusagen stehen hier auf dem Spiel. Erstens: an bestehenden Karten ändert
 * sich nichts — die vier Typen verhalten sich im Export genau wie vorher.
 * Zweitens: was das Format nicht fassen kann, geht nicht verloren, sondern in
 * das Makro.
 */

import { describe, expect, it } from 'vitest';
import { createDocument } from '@/model/document';
import { makeId } from '@/model/ids';
import { buildUvtt } from '@/io/uvtt';
import { buildFoundryWalls, buildFoundryWallsMacro, needsFoundryWallMacro } from '@/io/foundryWalls';
import {
  PRESET_SENSES,
  blocksAnything,
  isPresetSenses,
  sensesOf,
  uvttBucket,
} from '@/model/wallSenses';
import type { MapDocument, Wall, WallSenses, WallType } from '@/model/types';

const wand = (type: WallType, senses?: WallSenses, points = [0, 0, 100, 0]): Wall => ({
  id: makeId('wall'),
  points,
  type,
  closed: false,
  ...(senses ? { senses } : {}),
});

function karte(walls: Wall[]): MapDocument {
  const doc = createDocument();
  doc.vtt.walls = walls;
  return doc;
}

describe('Voreinstellungen der Wandtypen', () => {
  it('nimmt die Voreinstellung, solange nichts eingestellt ist', () => {
    expect(sensesOf(wand('normal'))).toEqual(PRESET_SENSES.normal);
    expect(sensesOf(wand('window'))).toEqual(PRESET_SENSES.window);
  });

  it('erkennt eine Wand, die noch auf ihrer Voreinstellung steht', () => {
    expect(isPresetSenses(wand('window'))).toBe(true);
    expect(isPresetSenses(wand('window', { ...PRESET_SENSES.window }))).toBe(true);
    expect(isPresetSenses(wand('window', { ...PRESET_SENSES.window, light: true }))).toBe(false);
  });

  it('sagt, ob eine Wand überhaupt etwas aufhält', () => {
    expect(blocksAnything(wand('normal'))).toBe(true);
    expect(
      blocksAnything(wand('normal', { move: false, sight: false, light: false, sound: false })),
    ).toBe(false);
  });
});

describe('Einsortieren in das Universal-VTT', () => {
  /**
   * Der Punkt, an dem eine Änderung teuer würde: die vier Typen müssen im
   * Export bleiben, wo sie waren, sonst sähe jede bestehende Karte in Foundry
   * anders aus als vorher.
   */
  it('sortiert die vier Typen wie bisher ein', () => {
    expect(uvttBucket(wand('normal'))).toBe('line_of_sight');
    expect(uvttBucket(wand('ethereal'))).toBe('line_of_sight');
    expect(uvttBucket(wand('window'))).toBe('objects_line_of_sight');
    expect(uvttBucket(wand('invisible'))).toBe('none');
  });

  it('lässt eine Wand draußen, die nichts aufhält', () => {
    expect(
      uvttBucket(wand('normal', { move: false, sight: false, light: false, sound: false })),
    ).toBe('none');
  });

  it('macht aus einer lichtdichten Fensterbank eine Objekt-Sichtlinie', () => {
    // Sicht geht durch, Licht nicht: für das Format ist das eine Objektlinie.
    expect(uvttBucket(wand('normal', { move: true, sight: false, light: true, sound: false })))
      .toBe('objects_line_of_sight');
  });

  it('schreibt die Töpfe entsprechend in die Datei', () => {
    const doc = karte([
      wand('normal'),
      wand('window'),
      wand('invisible'),
      wand('normal', { move: false, sight: false, light: false, sound: false }),
    ]);
    const file = buildUvtt(doc, { image: '', pixelsPerGrid: 100 });
    expect(file.line_of_sight).toHaveLength(1);
    expect(file.objects_line_of_sight).toHaveLength(1);
  });
});

describe('Makro für die feinen Sperren', () => {
  it('bleibt leer, solange keine Wand abweicht', () => {
    const doc = karte([wand('normal'), wand('window'), wand('ethereal')]);
    expect(needsFoundryWallMacro(doc)).toBe(false);
    expect(buildFoundryWalls(doc)).toEqual([]);
  });

  it('nimmt nur die abweichenden Wände auf', () => {
    const doc = karte([
      wand('normal'),
      wand('normal', { move: true, sight: false, light: true, sound: false }, [0, 0, 200, 0]),
    ]);
    expect(needsFoundryWallMacro(doc)).toBe(true);
    const segmente = buildFoundryWalls(doc);
    expect(segmente).toHaveLength(1);
    expect(segmente[0]).toMatchObject({ move: 20, sight: 0, light: 20, sound: 0 });
  });

  it('lässt aus, was gar nicht exportiert wird', () => {
    // Eine unsichtbare Wand gibt es in Foundry nicht — es gäbe nichts zu setzen.
    const doc = karte([wand('invisible', { move: true, sight: true, light: true, sound: true })]);
    expect(buildFoundryWalls(doc)).toEqual([]);
  });

  it('rechnet in Grid-Einheiten und zerlegt den Zug in Teilstücke', () => {
    const doc = createDocument();
    const tile = doc.grid.tileSize;
    doc.vtt.walls = [
      wand('normal', { move: true, sight: false, light: false, sound: false }, [
        0, 0, tile, 0, tile, tile,
      ]),
    ];
    const segmente = buildFoundryWalls(doc);
    expect(segmente.map((s) => s.c)).toEqual([
      [0, 0, 1, 0],
      [1, 0, 1, 1],
    ]);
  });

  it('schließt einen geschlossenen Zug', () => {
    const doc = createDocument();
    const tile = doc.grid.tileSize;
    doc.vtt.walls = [
      {
        id: 'w',
        points: [0, 0, tile, 0, tile, tile],
        type: 'normal',
        closed: true,
        senses: { move: true, sight: false, light: false, sound: false },
      },
    ];
    // Drei Punkte, geschlossen: drei Teilstücke, das letzte zurück zum Anfang.
    const segmente = buildFoundryWalls(doc);
    expect(segmente).toHaveLength(3);
    expect(segmente[2].c).toEqual([1, 1, 0, 0]);
  });

  it('erzeugt ein Makro, das die Daten als JSON trägt', () => {
    const doc = karte([wand('normal', { move: true, sight: false, light: false, sound: false })]);
    const text = buildFoundryWallsMacro(doc);
    expect(text).toContain('const SPERREN =');
    expect(text).toContain('updateEmbeddedDocuments');
    // Kein Skript-Ende aus den Daten heraus.
    expect(text).not.toContain('</script');
  });
});
