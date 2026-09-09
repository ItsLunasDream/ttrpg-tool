/** Erzeugt neue Modellobjekte mit sinnvollen Vorgaben. */

import { makeId } from '@/model/ids';
import { nextZ } from '@/model/document';
import type {
  LayerId,
  MapDocument,
  PropObject,
  ShapeObject,
  TextObject,
} from '@/model/types';
import type { DrawSettings, TextSettings } from '@/model/toolSettings';

export function createProp(
  doc: MapDocument,
  layerId: LayerId,
  propId: string,
  x: number,
  y: number,
  overrides: Partial<PropObject> = {},
): PropObject {
  return {
    id: makeId('obj'),
    kind: 'prop',
    layerId,
    propId,
    x,
    y,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    tint: null,
    flipX: false,
    flipY: false,
    opacity: 1,
    z: nextZ(doc, layerId),
    locked: false,
    seed: Math.floor(Math.random() * 0xffffff),
    ...overrides,
  };
}

export function createShape(
  doc: MapDocument,
  layerId: LayerId,
  settings: DrawSettings,
  x: number,
  y: number,
  points: number[],
  closed: boolean,
): ShapeObject {
  return {
    id: makeId('obj'),
    kind: 'shape',
    layerId,
    shape: settings.shape,
    x,
    y,
    rotation: 0,
    opacity: 1,
    z: nextZ(doc, layerId),
    locked: false,
    points,
    closed,
    blend: settings.blend,
    stroke: settings.useStroke
      ? {
          color: settings.strokeColor,
          width: settings.strokeWidth,
          alpha: settings.strokeAlpha,
          dash: settings.dash,
        }
      : null,
    fill: settings.useFill
      ? {
          color: settings.fillColor,
          alpha: settings.fillAlpha,
          gradient: settings.fillGradient
            ? {
                color: settings.fillColor2,
                angle: settings.fillAngle,
                type: settings.fillGradientType,
              }
            : null,
          pattern: settings.fillPattern
            ? {
                kind: settings.patternKind,
                size: settings.patternSize,
                color: settings.patternColor,
                alpha: settings.patternAlpha,
                angle: settings.patternAngle,
              }
            : null,
        }
      : null,
  };
}

export function createText(
  doc: MapDocument,
  layerId: LayerId,
  settings: TextSettings,
  x: number,
  y: number,
  text = '',
): TextObject {
  return {
    id: makeId('obj'),
    kind: 'text',
    layerId,
    x,
    y,
    rotation: 0,
    opacity: 1,
    z: nextZ(doc, layerId),
    locked: false,
    text,
    fontFamily: settings.fontFamily,
    fontSize: settings.fontSize,
    bold: settings.bold,
    italic: settings.italic,
    color: settings.color,
    align: settings.align,
    letterSpacing: settings.letterSpacing,
    lineHeight: settings.lineHeight,
    strokeColor: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    curvature: settings.curvature,
  };
}
