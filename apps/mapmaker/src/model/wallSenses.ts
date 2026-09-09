/**
 * Was eine Wand sperrt — Bewegung, Sicht, Licht, Schall.
 *
 * **Warum getrennt.** Bisher gab es nur vier Wandtypen, und alles, was sich
 * damit nicht sagen ließ, musste in Foundry von Hand nachgestellt werden: die
 * Fensterbank, die Licht hält aber Sicht lässt; die Schallschutztür; die
 * unsichtbare Absperrung. Foundry führt diese vier Kanäle ohnehin getrennt —
 * hier stehen sie jetzt auch getrennt.
 *
 * Die vier Typen bleiben als Voreinstellung: sie decken den Normalfall ab, und
 * wer nichts einstellt, bekommt genau das Verhalten von vorher. Erst wenn eine
 * Wand `senses` trägt, weicht sie davon ab.
 */

import type { Wall, WallSenses, WallType } from './types';

export const WALL_SENSES: Array<keyof WallSenses> = ['move', 'sight', 'light', 'sound'];

/**
 * Voreinstellung je Typ.
 *
 * `invisible` sperrt nichts: die Wand ist im Editor sichtbar, geht aber nicht in
 * den Export — sie markiert Gelände. Das war schon vorher so und bleibt so.
 */
export const PRESET_SENSES: Record<WallType, WallSenses> = {
  normal: { move: true, sight: true, light: true, sound: true },
  // Ein Fenster hält auf, wer hindurchgehen will, und lässt sehen und leuchten.
  window: { move: true, sight: false, light: false, sound: true },
  // Ätherisch: man sieht nichts hindurch, geht aber durch.
  ethereal: { move: false, sight: true, light: true, sound: true },
  invisible: { move: false, sight: false, light: false, sound: false },
};

/** Die geltenden Sperren einer Wand. */
export function sensesOf(wall: Pick<Wall, 'type' | 'senses'>): WallSenses {
  return wall.senses ?? PRESET_SENSES[wall.type] ?? PRESET_SENSES.normal;
}

/** Entspricht die Wand noch genau ihrer Typ-Voreinstellung? */
export function isPresetSenses(wall: Pick<Wall, 'type' | 'senses'>): boolean {
  if (!wall.senses) return true;
  const preset = PRESET_SENSES[wall.type] ?? PRESET_SENSES.normal;
  return WALL_SENSES.every((k) => wall.senses![k] === preset[k]);
}

/** Sperrt die Wand überhaupt etwas? */
export function blocksAnything(wall: Pick<Wall, 'type' | 'senses'>): boolean {
  const s = sensesOf(wall);
  return WALL_SENSES.some((k) => s[k]);
}

/**
 * Wohin die Wand im Universal-VTT gehört.
 *
 * Das Format kennt zwei Töpfe und sonst nichts. Alles, was Sicht hält, ist eine
 * Sichtlinie; was Sicht durchlässt, aber sonst etwas aufhält, ist eine
 * Objekt-Sichtlinie — das ist der Topf, den die Importer für Terrain benutzen.
 * Was gar nichts hält, gehört in keinen: es in die Datei zu schreiben hieße,
 * in Foundry eine Wand zu bauen, die dort niemand haben will.
 */
export type UvttBucket = 'line_of_sight' | 'objects_line_of_sight' | 'none';

export function uvttBucket(wall: Pick<Wall, 'type' | 'senses'>): UvttBucket {
  // Der Typ „unsichtbar" bleibt draußen, auch wenn jemand ihm Sperren gibt:
  // er ist die ausdrückliche Ansage „nur im Editor".
  if (wall.type === 'invisible') return 'none';
  const s = sensesOf(wall);
  if (s.sight) return 'line_of_sight';
  if (s.move || s.light || s.sound) return 'objects_line_of_sight';
  return 'none';
}
