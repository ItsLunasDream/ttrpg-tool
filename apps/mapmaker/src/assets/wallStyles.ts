/**
 * Sichtbare Wandstücke zur VTT-Geometrie.
 *
 * Wände, Türen und Fenster beschreiben bisher nur, was Foundry bauen soll —
 * im Bild ist davon nichts zu sehen. Wer eine Karte auch als Bild exportieren
 * will, musste die Optik hinterher von Hand nachzeichnen.
 *
 * Ein Stil erzeugt eine ganz normale Zeichnung auf dem aktiven Layer: derselbe
 * Linienzug, nur gestrichen. Bewusst kein Prop — Props sind Texturen fester
 * Größe und müssten für eine beliebig lange Wand gekachelt werden. Ein
 * gestrichener Zug wächst einfach mit und bleibt hinterher normal bearbeitbar.
 */

import { makeId } from '@/model/ids';
import { nextZ } from '@/model/document';
import type { LayerId, MapDocument, PatternKind, ShapeObject } from '@/model/types';

export type WallStyleId = 'none' | 'stone' | 'brick' | 'wood' | 'cave' | 'ruin';

export interface WallStyle {
  id: WallStyleId;
  /** Schlüssel im Wörterbuch; die Namen sind Oberfläche. */
  nameKey: string;
  color: number;
  /** Strichstärke als Bruchteil der Tile-Größe — bleibt bei jedem Maßstab passend. */
  widthFactor: number;
  alpha: number;
  /** Strichmuster in Pixeln; leer heißt durchgezogen. */
  dash: number[];
  /**
   * Das Material selbst: Fugen, Dielenkanten, Bruchkanten.
   *
   * Ohne das war eine „Steinwand" nur ein grauer Balken — der Name versprach
   * ein Material, zu sehen war eine Farbe. Das Muster liegt über der
   * Grundfarbe, deren Kachelkante an der Tile-Größe hängt, damit Ziegel auf
   * einer groben und einer feinen Karte gleich groß wirken.
   */
  pattern?: {
    kind: PatternKind;
    /** Kachelkante als Bruchteil der Tile-Größe. */
    sizeFactor: number;
    color: number;
    alpha: number;
  };
}

export const WALL_STYLES: WallStyle[] = [
  {
    id: 'stone',
    nameKey: 'wallStyle.stone',
    color: 0x8a8478,
    widthFactor: 0.18,
    alpha: 1,
    dash: [],
    // Unregelmäßiges Mauerwerk: Ziegelverband, aber grob und dunkel verfugt.
    pattern: { kind: 'bricks', sizeFactor: 0.34, color: 0x4a463f, alpha: 0.55 },
  },
  {
    id: 'brick',
    nameKey: 'wallStyle.brick',
    color: 0x8c5a44,
    widthFactor: 0.15,
    alpha: 1,
    dash: [],
    pattern: { kind: 'bricks', sizeFactor: 0.22, color: 0xd8c6b0, alpha: 0.5 },
  },
  {
    id: 'wood',
    nameKey: 'wallStyle.wood',
    color: 0x6b4a2f,
    widthFactor: 0.13,
    alpha: 1,
    dash: [],
    // Dielen längs, nicht quer: eine Bretterwand ist eine Reihe von Brettern.
    pattern: { kind: 'planks', sizeFactor: 0.3, color: 0x3d2a1a, alpha: 0.55 },
  },
  {
    id: 'cave',
    nameKey: 'wallStyle.cave',
    color: 0x4a4640,
    widthFactor: 0.24,
    alpha: 1,
    dash: [],
    // Fels: Schraffur statt Verband — gewachsener Stein hat keine Fugen.
    pattern: { kind: 'hatch', sizeFactor: 0.2, color: 0x24221f, alpha: 0.45 },
  },
  {
    id: 'ruin',
    nameKey: 'wallStyle.ruin',
    // Ruine: unterbrochener Strich, damit eine verfallene Mauer als solche
    // lesbar ist — dazu dasselbe Mauerwerk wie beim Stein, nur blasser.
    color: 0x7d7568,
    widthFactor: 0.16,
    alpha: 0.85,
    dash: [26, 16],
    pattern: { kind: 'bricks', sizeFactor: 0.3, color: 0x45413a, alpha: 0.45 },
  },
];

export function getWallStyle(id: WallStyleId): WallStyle | null {
  return WALL_STYLES.find((s) => s.id === id) ?? null;
}

/**
 * Baut die sichtbare Zeichnung zu einem Linienzug.
 *
 * `points` sind Weltkoordinaten; gespeichert wird relativ zum ersten Punkt,
 * wie bei jeder anderen Zeichnung auch — sonst ließe sich das Ergebnis später
 * nicht um die eigene Mitte drehen.
 */
export function buildWallShape(
  doc: MapDocument,
  layerId: LayerId,
  styleId: WallStyleId,
  points: number[],
  closed: boolean,
): ShapeObject | null {
  const style = getWallStyle(styleId);
  if (!style || points.length < 4) return null;

  const ox = points[0];
  const oy = points[1];
  const local = new Array<number>(points.length);
  for (let i = 0; i < points.length; i += 2) {
    local[i] = points[i] - ox;
    local[i + 1] = points[i + 1] - oy;
  }

  return {
    id: makeId('obj'),
    kind: 'shape',
    layerId,
    // 'polygon' zeichnet den Zug als Linie und beachtet `closed` — genau das,
    // was ein Wandring braucht.
    shape: 'polygon',
    x: ox,
    y: oy,
    rotation: 0,
    opacity: 1,
    z: nextZ(doc, layerId),
    locked: false,
    points: local,
    closed,
    blend: 'normal',
    stroke: {
      color: style.color,
      width: doc.grid.tileSize * style.widthFactor,
      alpha: style.alpha,
      dash: style.dash,
      pattern: style.pattern
        ? {
            kind: style.pattern.kind,
            size: doc.grid.tileSize * style.pattern.sizeFactor,
            color: style.pattern.color,
            alpha: style.pattern.alpha,
            angle: 0,
          }
        : null,
    },
    fill: null,
  };
}
