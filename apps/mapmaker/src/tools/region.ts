/**
 * Regionen und Grenzen.
 *
 * Klicken setzt Eckpunkte, Rechtsklick oder Enter schließt ab — wie beim
 * Polygon und beim Wandwerkzeug. Beim Abschließen entstehen Fläche, Grenze und
 * Name *zusammen*: als ein Undo-Schritt und als eine Objektgruppe. Ohne die
 * Klammer läge im Verlauf zweimal etwas, und ein Rückgängig nähme nur den
 * Namen zurück.
 */

import { Graphics } from 'pixi.js';
import { AddObjects, CompositeCommand, SetObjectGroup } from '@/model/commands';
import { canHoldObjects, nextZ } from '@/model/document';
import { snapPoint } from '@/model/grid';
import { translatePoints } from '@/model/geometry';
import { polygonCentroid } from '@/model/polygonCentroid';
import { makeId } from '@/model/ids';
import type { MapObject, ShapeObject, TextObject } from '@/model/types';
import type { Tool, ToolContext, ToolPointerEvent } from './types';
import { t } from '@/i18n';

export class RegionTool implements Tool {
  readonly cursor = 'crosshair';

  private pending = false;
  /** Weltkoordinaten; der letzte Punkt läuft dem Zeiger nach. */
  private points: number[] = [];
  private preview = new Graphics();
  private attached = false;

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button === 2) {
      if (this.pending) {
        this.points.length -= 2;
        this.pending = false;
        this.commit(ctx);
      }
      return;
    }
    if (e.button !== 0) return;
    if (!canHoldObjects(ctx.doc, ctx.state.activeLayerId)) return;

    const p = this.place(ctx, e);
    if (!this.pending) {
      this.pending = true;
      this.points = [p.x, p.y];
    }
    this.points.push(p.x, p.y);
    this.attach(ctx);
  }

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.pending) return;
    const p = this.place(ctx, e);
    this.points[this.points.length - 2] = p.x;
    this.points[this.points.length - 1] = p.y;
    this.drawPreview(ctx);
  }

  onKeyDown(e: KeyboardEvent, ctx: ToolContext): boolean {
    if (!this.pending) return false;
    if (e.key === 'Enter') {
      this.points.length -= 2;
      this.pending = false;
      this.commit(ctx);
      return true;
    }
    if (e.key === 'Escape') {
      this.pending = false;
      this.points = [];
      this.detach(ctx);
      return true;
    }
    if (e.key === 'Backspace' && this.points.length > 4) {
      this.points.splice(this.points.length - 4, 2);
      this.drawPreview(ctx);
      return true;
    }
    return false;
  }

  deactivate(ctx: ToolContext): void {
    this.pending = false;
    this.points = [];
    this.detach(ctx);
  }

  // -------------------------------------------------------------------------

  private place(ctx: ToolContext, e: ToolPointerEvent): { x: number; y: number } {
    return e.ctrl ? e.world : snapPoint(ctx.doc.grid, e.world);
  }

  private commit(ctx: ToolContext): void {
    const pts = this.points;
    // Unter drei Ecken gibt es keine Fläche.
    if (pts.length < 6) {
      this.points = [];
      this.detach(ctx);
      return;
    }

    const s = ctx.state.region;
    const layerId = ctx.state.activeLayerId;
    const ox = pts[0];
    const oy = pts[1];
    const local = translatePoints(pts, -ox, -oy);

    const flaeche: ShapeObject = {
      id: makeId('obj'),
      kind: 'shape',
      layerId,
      shape: 'polygon',
      x: ox,
      y: oy,
      rotation: 0,
      opacity: 1,
      z: nextZ(ctx.doc, layerId),
      locked: false,
      points: local,
      closed: true,
      blend: 'normal',
      stroke: { color: s.borderColor, width: s.borderWidth, alpha: 1, dash: [...s.dash] },
      fill: { color: s.fillColor, alpha: s.fillAlpha, gradient: null, pattern: null },
    };

    const objekte: MapObject[] = [flaeche];

    if (s.withLabel) {
      const mitte = polygonCentroid(pts);
      if (mitte) {
        const label: TextObject = {
          id: makeId('obj'),
          kind: 'text',
          layerId,
          x: mitte.x,
          y: mitte.y,
          rotation: 0,
          opacity: 1,
          z: nextZ(ctx.doc, layerId) + 1,
          locked: false,
          text: t('region.defaultName'),
          fontFamily: 'Georgia, serif',
          fontSize: s.labelSize,
          bold: false,
          italic: false,
          color: s.labelColor,
          align: 'center',
          letterSpacing: 4,
          lineHeight: 1.2,
          strokeColor: 0x1a1208,
          strokeWidth: Math.max(2, s.labelSize * 0.06),
        };
        objekte.push(label);
      }
    }

    const gruppe = makeId('grp');
    ctx.exec(
      new CompositeCommand(
        [
          new AddObjects(objekte, t('cmd.region')),
          new SetObjectGroup(
            objekte.map((o) => o.id),
            gruppe,
            t('cmd.region'),
          ),
        ],
        t('cmd.region'),
      ),
    );
    ctx.state.setSelection(objekte.map((o) => o.id));

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

  private drawPreview(ctx: ToolContext): void {
    const s = ctx.state.region;
    const zoom = ctx.renderer.camera.zoom;
    const g = this.preview.clear();
    if (this.points.length < 4) return;

    g.poly(this.points, true).fill({ color: s.fillColor, alpha: s.fillAlpha });
    g.poly(this.points, true).stroke({
      width: Math.max(1, s.borderWidth),
      color: s.borderColor,
      alpha: 0.9,
    });
    // Gesetzte Ecken sichtbar machen, der mitlaufende Punkt bleibt aus.
    const r = Math.max(2, 4 / zoom);
    for (let i = 0; i < this.points.length - 2; i += 2) {
      g.circle(this.points[i], this.points[i + 1], r).fill({ color: s.borderColor });
    }
  }
}
