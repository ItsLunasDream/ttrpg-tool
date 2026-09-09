/**
 * Bauhelfer für prozedurale Props.
 *
 * Steht eigens, damit die Prop-Sammlungen nach Themen auf mehrere Dateien
 * verteilt werden können, ohne sich gegenseitig zu importieren.
 */

import type { Graphics } from 'pixi.js';
import type { Rng } from '@/model/rng';
import type { PropDef } from '../propTypes';

export type Draw = (g: Graphics, rng: Rng) => void;

export function def(
  id: string,
  name: string,
  category: PropDef['category'],
  size: number | { w: number; h: number },
  tags: string[],
  draw: Draw,
  variants = 8,
): PropDef {
  return {
    id,
    name,
    category,
    tags,
    source: 'builtin',
    size: typeof size === 'number' ? { w: size, h: size } : size,
    tintable: true,
    variants,
    draw,
  };
}
