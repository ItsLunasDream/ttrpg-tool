/**
 * Kamera: Pan und Zoom.
 *
 * Die Kamera hält die Wahrheit über den Bildausschnitt. Werkzeuge rechnen
 * Mauskoordinaten hierüber in Weltkoordinaten um — kein Werkzeug fasst die
 * Pixi-Transformation direkt an.
 */

import type { Container } from 'pixi.js';
import type { Point } from '@/model/grid';

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 8;

export class Camera {
  /** Weltkoordinate, die im Zentrum des Viewports liegt. */
  x = 0;
  y = 0;
  zoom = 1;

  private viewW = 1;
  private viewH = 1;

  setViewport(width: number, height: number): void {
    this.viewW = Math.max(1, width);
    this.viewH = Math.max(1, height);
  }

  get viewportWidth(): number {
    return this.viewW;
  }
  get viewportHeight(): number {
    return this.viewH;
  }

  screenToWorld(sx: number, sy: number): Point {
    return {
      x: (sx - this.viewW / 2) / this.zoom + this.x,
      y: (sy - this.viewH / 2) / this.zoom + this.y,
    };
  }

  worldToScreen(wx: number, wy: number): Point {
    return {
      x: (wx - this.x) * this.zoom + this.viewW / 2,
      y: (wy - this.y) * this.zoom + this.viewH / 2,
    };
  }

  /** Verschiebt die Kamera um einen Bildschirm-Delta (Drag). */
  panByScreen(dx: number, dy: number): void {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
  }

  /**
   * Zoomt so, dass der Weltpunkt unter (sx, sy) dort bleibt — das ist der
   * Unterschied zwischen „zoomt zum Mauszeiger" und „zoomt irgendwohin".
   */
  zoomAt(sx: number, sy: number, factor: number): void {
    const before = this.screenToWorld(sx, sy);
    this.zoom = clamp(this.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    const after = this.screenToWorld(sx, sy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  setZoom(zoom: number): void {
    this.zoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  }

  /** Rückt die ganze Karte ins Bild, mit etwas Rand. */
  fit(width: number, height: number, padding = 40): void {
    const zx = (this.viewW - padding * 2) / Math.max(1, width);
    const zy = (this.viewH - padding * 2) / Math.max(1, height);
    this.setZoom(Math.min(zx, zy));
    this.x = width / 2;
    this.y = height / 2;
  }

  /** Sichtbarer Weltbereich — Grundlage fürs Culling. */
  visibleBounds(margin = 0): { minX: number; minY: number; maxX: number; maxY: number } {
    const halfW = this.viewW / 2 / this.zoom + margin;
    const halfH = this.viewH / 2 / this.zoom + margin;
    return {
      minX: this.x - halfW,
      minY: this.y - halfH,
      maxX: this.x + halfW,
      maxY: this.y + halfH,
    };
  }

  /** Überträgt den Kamerazustand auf den Welt-Container. */
  applyTo(world: Container): void {
    world.scale.set(this.zoom);
    world.position.set(
      this.viewW / 2 - this.x * this.zoom,
      this.viewH / 2 - this.y * this.zoom,
    );
  }
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}
