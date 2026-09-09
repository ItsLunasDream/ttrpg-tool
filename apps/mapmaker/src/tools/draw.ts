/**
 * Zeichenwerkzeug: Freihand, Linie, Rechteck, Ellipse, Polygon.
 *
 * Während des Zugs läuft eine Vorschau im Overlay; erst beim Loslassen entsteht
 * ein Objekt. So erzeugt ein Strich genau einen Undo-Schritt und der Renderer
 * muss nicht bei jeder Mausbewegung ein Modellobjekt neu aufbauen.
 */

import { Graphics } from 'pixi.js';
import { AddObjects } from '@/model/commands';
import { symmetryCopies } from '@/model/symmetry';
import { canHoldObjects } from '@/model/document';
import { snapPoint } from '@/model/grid';
import { dropDensePoints, hasExtent, smoothStroke, translatePoints } from '@/model/geometry';
import type { DrawSettings } from '@/model/toolSettings';
import { createShape } from './factory';
import type { Tool, ToolContext, ToolPointerEvent } from './types';
import { t } from '@/i18n';

export class DrawTool implements Tool {
  readonly cursor = 'crosshair';

  private drawing = false;
  /** Rohpunkte in Weltkoordinaten. */
  private points: number[] = [];
  private preview = new Graphics();
  private attached = false;
  /** Polygon wird über mehrere Klicks gebaut und ist deshalb ein Sonderfall. */
  private polygonPending = false;

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button === 2) {
      // Rechtsklick schließt das laufende Polygon ab — wie beim Wandwerkzeug.
      // Enter tut dasselbe, aber die Hand liegt beim Zeichnen an der Maus.
      if (this.polygonPending) {
        // Der mitlaufende Vorschaupunkt gehört nicht zum Ergebnis.
        this.points.length -= 2;
        this.polygonPending = false;
        this.commit(ctx);
      }
      return;
    }
    if (e.button !== 0) return;
    if (!canHoldObjects(ctx.doc, ctx.state.activeLayerId)) return;

    const s = ctx.state.draw;
    const p = this.place(ctx, e);

    if (s.shape === 'polygon') {
      if (!this.polygonPending) {
        this.polygonPending = true;
        this.points = [p.x, p.y];
      } else {
        // Den mitlaufenden Punkt auf die getippte Stelle ziehen — beim Tippen
        // auf einem Tablett kommt vorher kein pointermove, und er hinge sonst
        // noch auf dem vorigen Punkt. Siehe `tools/wall.ts`, dort dasselbe.
        this.points[this.points.length - 2] = p.x;
        this.points[this.points.length - 1] = p.y;
      }
      this.points.push(p.x, p.y);
      this.attach(ctx);
      return;
    }

    this.drawing = true;
    this.points = [p.x, p.y];
    if (s.shape !== 'freehand') this.points.push(p.x, p.y);
    this.attach(ctx);
  }

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    const s = ctx.state.draw;

    if (this.polygonPending) {
      // Letzter Punkt folgt dem Zeiger, bis der nächste Klick ihn festnagelt.
      const p = this.place(ctx, e);
      this.points[this.points.length - 2] = p.x;
      this.points[this.points.length - 1] = p.y;
      this.drawPreview(ctx, s, true);
      return;
    }

    if (!this.drawing) return;
    const p = this.place(ctx, e);

    if (s.shape === 'freehand') {
      this.points.push(p.x, p.y);
    } else {
      let x = p.x;
      let y = p.y;
      // Shift zwingt Rechteck und Ellipse ins Quadrat, Linien auf 45°-Schritte.
      if (e.shift) {
        const x0 = this.points[0];
        const y0 = this.points[1];
        if (s.shape === 'line') {
          const a = Math.round(Math.atan2(y - y0, x - x0) / (Math.PI / 4)) * (Math.PI / 4);
          const len = Math.hypot(x - x0, y - y0);
          x = x0 + Math.cos(a) * len;
          y = y0 + Math.sin(a) * len;
        } else {
          const size = Math.max(Math.abs(x - x0), Math.abs(y - y0));
          x = x0 + Math.sign(x - x0) * size;
          y = y0 + Math.sign(y - y0) * size;
        }
      }
      this.points[2] = x;
      this.points[3] = y;
    }
    this.drawPreview(ctx, s, false);
  }

  onPointerUp(_e: ToolPointerEvent, ctx: ToolContext): void {
    if (this.polygonPending || !this.drawing) return;
    this.drawing = false;
    this.commit(ctx);
  }

  onKeyDown(e: KeyboardEvent, ctx: ToolContext): boolean {
    if (!this.polygonPending) return false;

    if (e.key === 'Enter') {
      // Der mitlaufende Vorschaupunkt gehört nicht zum Ergebnis.
      this.points.length -= 2;
      this.polygonPending = false;
      this.commit(ctx);
      return true;
    }
    if (e.key === 'Escape') {
      this.polygonPending = false;
      this.points = [];
      this.detach(ctx);
      return true;
    }
    if (e.key === 'Backspace' && this.points.length > 4) {
      this.points.splice(this.points.length - 4, 2);
      this.drawPreview(ctx, ctx.state.draw, true);
      return true;
    }
    return false;
  }

  deactivate(ctx: ToolContext): void {
    this.drawing = false;
    this.polygonPending = false;
    this.points = [];
    this.detach(ctx);
  }

  // -------------------------------------------------------------------------

  private place(ctx: ToolContext, e: ToolPointerEvent): { x: number; y: number } {
    // Freihand darf nie fangen — sonst entstehen Treppen statt Kurven.
    if (e.ctrl || ctx.state.draw.shape === 'freehand') return e.world;
    return snapPoint(ctx.doc.grid, e.world);
  }

  private commit(ctx: ToolContext): void {
    const s = ctx.state.draw;
    let pts = this.points;

    if (s.shape === 'freehand') pts = smoothStroke(pts, s.smoothing);
    // Polygone entstehen aus einzelnen Klicks und haben dasselbe Problem wie
    // Wandzüge: ohne Zeigerbewegung dazwischen liegen die Punkte aufeinander.
    if (s.shape === 'polygon') pts = dropDensePoints(pts, 0.5);
    if (pts.length < 4 || !hasExtent(pts)) {
      this.points = [];
      this.detach(ctx);
      return;
    }

    // Der Ursprung liegt auf dem ersten Punkt; gespeichert wird relativ dazu,
    // damit sich das Objekt später um seine eigene Mitte drehen lässt.
    const ox = pts[0];
    const oy = pts[1];
    const local = translatePoints(pts, -ox, -oy);
    const closed = s.shape === 'polygon' || (s.shape === 'freehand' && !!s.useFill);

    const obj = createShape(ctx.doc, ctx.state.activeLayerId, s, ox, oy, local, closed);
    const kopien = symmetryCopies(ctx.doc, [obj], ctx.state.symmetry);
    ctx.exec(new AddObjects([obj, ...kopien], t('cmd.draw')));
    ctx.state.setSelection([obj.id]);

    this.points = [];
    this.detach(ctx);
  }

  private attach(ctx: ToolContext): void {
    if (!this.attached) {
      ctx.renderer.addOverlay(this.preview);
      this.attached = true;
    }
  }

  private detach(ctx: ToolContext): void {
    this.preview.clear();
    if (this.attached) {
      ctx.renderer.removeOverlay(this.preview);
      this.attached = false;
    }
  }

  private drawPreview(ctx: ToolContext, s: DrawSettings, polygon: boolean): void {
    const g = this.preview;
    const pts = this.points;
    g.clear();
    if (pts.length < 4) return;

    switch (s.shape) {
      case 'rect': {
        const [x0, y0, x1, y1] = pts;
        g.rect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
        break;
      }
      case 'ellipse': {
        const [x0, y0, x1, y1] = pts;
        g.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2);
        break;
      }
      case 'line':
        g.moveTo(pts[0], pts[1]).lineTo(pts[2], pts[3]);
        break;
      default:
        g.poly(pts, polygon || s.shape === 'polygon');
        break;
    }

    if (s.useFill && s.shape !== 'line') g.fill({ color: s.fillColor, alpha: s.fillAlpha * 0.8 });
    if (s.useStroke) {
      g.stroke({
        width: s.strokeWidth,
        color: s.strokeColor,
        alpha: s.strokeAlpha,
        cap: 'round',
        join: 'round',
      });
    }

    // Stützpunkte beim Polygon sichtbar machen, sonst klickt man blind.
    if (polygon) {
      const r = 3 / ctx.renderer.camera.zoom;
      for (let i = 0; i < pts.length - 2; i += 2) {
        g.circle(pts[i], pts[i + 1], r).fill({ color: 0x4da3ff, alpha: 0.9 });
      }
    }
  }
}
