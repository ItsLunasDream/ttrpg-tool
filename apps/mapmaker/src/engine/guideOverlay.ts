/**
 * Hilfslinien im Bild.
 *
 * Eigenes Overlay neben dem Grid und nicht als Objekte im Layer-Stapel: eine
 * Hilfslinie ist kein Karteninhalt. Sie geht nicht in den Bild-Export, sie hat
 * keine Ebene, keine Deckkraft und keinen Platz in der Sortierung — sie ist ein
 * Strich für das Auge dessen, der gerade arbeitet.
 *
 * Gezeichnet wird über den sichtbaren Ausschnitt hinaus, nicht über die
 * Kartenbreite: eine Hilfslinie ist unendlich lang, und sie soll auch dann noch
 * zu sehen sein, wenn der Blick neben der Karte steht.
 */

import { Graphics } from 'pixi.js';
import type { Guide } from '@/model/types';
import type { Camera } from './camera';

/** Farbe wie in Zeichenprogrammen: türkis, damit sie mit nichts verwechselt wird. */
const FARBE = 0x24c8db;

export class GuideOverlay {
  readonly view = new Graphics();

  private lastKey = '';

  update(guides: Guide[], camera: Camera, force = false): void {
    if (guides.length === 0) {
      if (this.view.visible) {
        this.view.visible = false;
        this.view.clear();
        this.lastKey = '';
      }
      return;
    }
    this.view.visible = true;

    const b = camera.visibleBounds(0);
    const key = [
      guides.map((g) => `${g.axis}${Math.round(g.pos * 10)}`).join(','),
      Math.round(b.minX),
      Math.round(b.minY),
      Math.round(b.maxX),
      Math.round(b.maxY),
      camera.zoom.toFixed(3),
    ].join('|');
    if (!force && key === this.lastKey) return;
    this.lastKey = key;

    this.view.clear();
    // Strichstärke gegen den Zoom: eine Hilfslinie ist ein Haar breit, egal wie
    // nah man herangeht.
    const breite = 1 / camera.zoom;
    for (const g of guides) {
      if (g.axis === 'x') {
        this.view.moveTo(g.pos, b.minY).lineTo(g.pos, b.maxY);
      } else {
        this.view.moveTo(b.minX, g.pos).lineTo(b.maxX, g.pos);
      }
    }
    this.view.stroke({ width: breite, color: FARBE, alpha: 0.85 });
  }

  destroy(): void {
    this.view.destroy();
  }
}
