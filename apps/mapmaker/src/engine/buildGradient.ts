/**
 * Baut aus der Verlaufsangabe des Modells einen Pixi-Gradienten.
 *
 * Getrennt vom Renderer, damit die Umrechnung von Winkel auf Start- und
 * Endpunkt an einer Stelle steht.
 */

import { FillGradient } from 'pixi.js';
import type { Fill } from '@/model/types';

export function buildGradient(fill: Fill): FillGradient | null {
  const g = fill.gradient;
  if (!g) return null;

  const stops = [
    { offset: 0, color: fill.color },
    { offset: 1, color: g.color },
  ];

  if (g.type === 'radial') {
    // Lokaler Raum: (0,0) bis (1,1) ist die Hülle der Form. Damit passt sich
    // der Verlauf jeder Größe an, ohne dass die Form ihn kennen muss.
    return new FillGradient({
      type: 'radial',
      center: { x: 0.5, y: 0.5 },
      innerRadius: 0,
      outerCenter: { x: 0.5, y: 0.5 },
      outerRadius: 0.7,
      colorStops: stops,
      textureSpace: 'local',
    });
  }

  // Winkel auf Start- und Endpunkt im Einheitsquadrat abbilden. Der Versatz um
  // 0,5 hält den Verlauf mittig, egal wie er gedreht ist.
  const rad = (g.angle * Math.PI) / 180;
  const dx = Math.cos(rad) / 2;
  const dy = Math.sin(rad) / 2;
  return new FillGradient({
    type: 'linear',
    start: { x: 0.5 - dx, y: 0.5 - dy },
    end: { x: 0.5 + dx, y: 0.5 + dy },
    colorStops: stops,
    textureSpace: 'local',
  });
}
