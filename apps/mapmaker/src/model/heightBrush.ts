/**
 * Der Höhen-Pinsel als reine Rechnung.
 *
 * Herein gehen Höhenfeld, Mittelpunkt und Einstellungen, heraus kommt eine
 * Karte von Feldindex auf neuen Wert — genau das, was `PaintHeight` als
 * Änderung erwartet. Kein Pixi, kein Zeiger: so lässt sich prüfen, dass
 * Anheben wirklich anhebt und Glätten wirklich ausgleicht.
 *
 * Der Abfall zum Rand ist quadratisch (`(1 - d²)²`) und nicht linear. Linear
 * hinterlässt an der Pinselgrenze eine sichtbare Kante, weil die *Steigung*
 * dort springt; mit dem quadratischen Abfall geht der Rand sauber auf null.
 */

import type { HeightMap } from './types';
import type { HeightMode } from './toolSettings';

export interface HeightBrush {
  mode: HeightMode;
  /** Beim Modus `biome`: welches Biom gemalt wird (1-basiert, 0 = löschen). */
  biome?: number;
  /** Radius in Feldern. */
  radius: number;
  /** Wirkung im Mittelpunkt, 0 bis 1. */
  strength: number;
  /** Zielhöhe beim Einebnen. */
  target: number;
}

/**
 * Höhenänderung eines *einzelnen* Abdrucks bei voller Stärke.
 *
 * Klein, weil ein Zug viele Abdrücke setzt: bei einem Abstand von einem
 * Drittel Radius bekommt jede Stützstelle rund ein Dutzend davon ab. Mit einem
 * größeren Wert schoss schon der erste Strich auf Gipfelhöhe, und der Pinsel
 * ließ sich nicht dosieren.
 */
const RATE = 0.05;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Mittelwert der vorhandenen Nachbarn eines Feldes, das Feld selbst mitgezählt. */
function neighbourMean(map: HeightMap, x: number, y: number): number {
  let summe = 0;
  let anzahl = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= map.cols || ny >= map.rows) continue;
      summe += map.data[ny * map.cols + nx];
      anzahl++;
    }
  }
  return anzahl === 0 ? 0 : summe / anzahl;
}

/**
 * Ein Biom-Abdruck.
 *
 * Getrennt von `stampHeight`, weil Biome nicht anteilig gemischt werden: eine
 * Stützstelle gehört zu einem Biom oder nicht. Der weiche Abfall des Pinsels
 * wird darum zu einer Schwelle — was mehr als zur Hälfte im Pinsel liegt,
 * bekommt das Biom.
 */
export function stampBiome(
  map: HeightMap,
  cx: number,
  cy: number,
  radius: number,
  biome: number,
): Map<number, number> {
  const out = new Map<number, number>();
  const r = Math.max(0.5, radius);
  const minX = Math.max(0, Math.floor(cx - r));
  const maxX = Math.min(map.cols - 1, Math.ceil(cx + r));
  const minY = Math.max(0, Math.floor(cy - r));
  const maxY = Math.min(map.rows - 1, Math.ceil(cy + r));
  const bestand = map.biome;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > r) continue;
      const i = y * map.cols + x;
      if ((bestand?.[i] ?? 0) === biome) continue;
      out.set(i, biome);
    }
  }
  return out;
}

/**
 * Ein Pinselabdruck.
 *
 * `cx`/`cy` sind Feldkoordinaten, ruhig gebrochen — beim Ziehen liegt der
 * Zeiger zwischen den Feldern, und auf ganze Zahlen zu runden ergäbe einen
 * hüpfenden Pinsel.
 */
export function stampHeight(
  map: HeightMap,
  cx: number,
  cy: number,
  brush: HeightBrush,
): Map<number, number> {
  const out = new Map<number, number>();
  const r = Math.max(0.5, brush.radius);
  const minX = Math.max(0, Math.floor(cx - r));
  const maxX = Math.min(map.cols - 1, Math.ceil(cx + r));
  const minY = Math.max(0, Math.floor(cy - r));
  const maxY = Math.min(map.rows - 1, Math.ceil(cy + r));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r;
      if (d >= 1) continue;
      const abfall = (1 - d * d) ** 2;
      const w = brush.strength * abfall;
      if (w <= 0) continue;

      const i = y * map.cols + x;
      const alt = map.data[i];
      let neu = alt;

      switch (brush.mode) {
        case 'raise':
          neu = alt + w * RATE;
          break;
        case 'lower':
          neu = alt - w * RATE;
          break;
        case 'smooth':
          // Anteilig zum Nachbarmittel ziehen, nicht darauf setzen: sonst
          // wäre ein einziger Abdruck bereits flach.
          neu = alt + (neighbourMean(map, x, y) - alt) * w;
          break;
        case 'flatten':
          neu = alt + (brush.target - alt) * w;
          break;
      }

      neu = clamp01(neu);
      if (neu !== alt) out.set(i, neu);
    }
  }
  return out;
}

/**
 * Abdrücke entlang einer Strecke, damit ein schneller Zug keine Lücken lässt.
 *
 * Der Abstand ist ein Drittel Radius: dichter kostet nur Rechenzeit, weiter
 * hinterlässt eine Perlenkette statt eines Strichs.
 *
 * **`map` wird verändert** und muss darum eine Arbeitskopie sein, nicht das
 * Feld im Dokument. Zwei Gründe: die Abdrücke müssen einander sehen — sonst
 * glättete ein Zug immer nur gegen den Anfangszustand —, und das Dokument darf
 * nur über einen Befehl geändert werden, sonst merkt sich `PaintHeight` beim
 * Rückgängigmachen bereits veränderte Werte als „vorher".
 */
export function stampHeightLine(
  map: HeightMap,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  brush: HeightBrush,
): Map<number, number> {
  const abstand = Math.max(0.25, brush.radius / 3);
  const laenge = Math.hypot(x1 - x0, y1 - y0);
  const schritte = Math.max(1, Math.ceil(laenge / abstand));

  const out = new Map<number, number>();
  for (let i = 1; i <= schritte; i++) {
    const t = i / schritte;
    const teil = stampHeight(map, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, brush);
    for (const [index, wert] of teil) {
      map.data[index] = wert;
      out.set(index, wert);
    }
  }
  return out;
}
