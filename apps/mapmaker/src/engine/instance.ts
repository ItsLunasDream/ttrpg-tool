/**
 * Zugriff auf den laufenden Renderer außerhalb von React.
 *
 * Es gibt genau eine Editor-Bühne; ein Context-Provider wäre hier nur Zeremonie.
 */

import type { MapRenderer } from './renderer';

let instance: MapRenderer | null = null;
const listeners = new Set<(r: MapRenderer | null) => void>();

export function setRenderer(r: MapRenderer | null): void {
  instance = r;
  // Im Dev-Build am Fenster hängen, damit man in der Konsole an Kamera und
  // Bühne kommt. Im Produktionsbuild fällt das weg.
  if (import.meta.env.DEV) {
    (globalThis as Record<string, unknown>).__mapRenderer = r;
  }
  for (const fn of listeners) fn(r);
}

export function getRenderer(): MapRenderer | null {
  return instance;
}

export function onRendererChange(fn: (r: MapRenderer | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
