/**
 * Wände aus gezeichneter Geometrie ableiten.
 *
 * Gedacht als *Vorschlag*, nicht als Endergebnis: was hier entsteht, sind
 * normale Wandzüge, die man anschließend anfasst, verschiebt und mit Türen
 * versieht. Ein Generator, dessen Ergebnis man nicht korrigieren kann, ist im
 * Kartenbau wertlos.
 */

import { t } from '@/i18n';
import { douglasPeucker } from './geometry';
import { flattenLayers, isEffectivelyVisible } from './document';
import { makeId } from './ids';
import { isSystemLayer, type MapDocument, type ShapeObject, type Wall, type WallType } from './types';

export interface DeriveOptions {
  /** Nur Flächen mit Füllung heranziehen — offene Striche sind meist Deko. */
  filledOnly: boolean;
  /** Vereinfachungstoleranz in Weltpixeln. */
  tolerance: number;
  type: WallType;
  /** Nur diese Layer betrachten; leer heißt: alle sichtbaren. */
  layerIds?: string[];
}

export function defaultDeriveOptions(doc: MapDocument): DeriveOptions {
  return {
    filledOnly: true,
    // Ein Zehntel Tile: fein genug für Türnischen, grob genug gegen Zitterpunkte.
    tolerance: doc.grid.tileSize * 0.1,
    type: 'normal',
  };
}

/** Kandidaten, aus denen sich Wände ableiten lassen. */
export function derivableShapes(doc: MapDocument, options: DeriveOptions): ShapeObject[] {
  const allowed = options.layerIds?.length
    ? new Set(options.layerIds)
    : new Set(
        flattenLayers(doc)
          .filter((l) => !l.isGroup && !isSystemLayer(l.id) && isEffectivelyVisible(doc, l.id))
          .map((l) => l.id),
      );

  const out: ShapeObject[] = [];
  for (const id in doc.objects) {
    const o = doc.objects[id];
    if (o.kind !== 'shape') continue;
    if (!allowed.has(o.layerId)) continue;
    if (options.filledOnly && !o.fill) continue;
    if (o.shape === 'line') continue;
    out.push(o);
  }
  return out;
}

/** Umriss einer Form in Weltkoordinaten, geschlossen. */
export function outlineOf(shape: ShapeObject): number[] {
  const pts = shape.points;
  const cos = Math.cos(shape.rotation);
  const sin = Math.sin(shape.rotation);
  const toWorld = (x: number, y: number): [number, number] => [
    shape.x + x * cos - y * sin,
    shape.y + x * sin + y * cos,
  ];

  let local: number[];
  switch (shape.shape) {
    case 'rect': {
      const [x0, y0, x1, y1] = pts;
      local = [x0, y0, x1, y0, x1, y1, x0, y1];
      break;
    }
    case 'ellipse': {
      const [x0, y0, x1, y1] = pts;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const rx = Math.abs(x1 - x0) / 2;
      const ry = Math.abs(y1 - y0) / 2;
      // Segmentzahl an den Umfang koppeln: kleine Ellipsen brauchen keine 64 Punkte.
      const steps = Math.max(12, Math.min(64, Math.round((rx + ry) / 6)));
      local = [];
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        local.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
      }
      break;
    }
    default:
      local = [...pts];
      break;
  }

  const world: number[] = [];
  for (let i = 0; i < local.length; i += 2) {
    const [wx, wy] = toWorld(local[i], local[i + 1]);
    world.push(wx, wy);
  }
  return world;
}

/**
 * Erzeugt Wandzüge aus den passenden Formen des Dokuments.
 *
 * Ellipsen werden bewusst nicht vereinfacht — Douglas-Peucker macht aus einem
 * Kreis sonst ein Vieleck mit sichtbaren Kanten.
 */
export function deriveWalls(doc: MapDocument, options: DeriveOptions): Wall[] {
  const walls: Wall[] = [];
  for (const shape of derivableShapes(doc, options)) {
    const outline = outlineOf(shape);
    if (outline.length < 6) continue;

    const points =
      shape.shape === 'ellipse' ? outline : douglasPeucker(outline, options.tolerance);
    if (points.length < 6) continue;

    walls.push({
      id: makeId('wall'),
      points,
      type: options.type,
      closed: true,
    });
  }
  return walls;
}

/** Kurze Zusammenfassung für die Rückmeldung im Panel. */
export function describeDerivation(walls: Wall[]): string {
  if (walls.length === 0) return t('wall.derivedNone');
  const points = walls.reduce((sum, w) => sum + w.points.length / 2, 0);
  return t('wall.derivedCount', { walls: walls.length, points });
}
