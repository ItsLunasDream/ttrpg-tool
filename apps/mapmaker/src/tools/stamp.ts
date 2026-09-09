/**
 * Bausteine setzen.
 *
 * Zeigt die ganze Anordnung halbtransparent am Zeiger — bei einem einzelnen
 * Prop ist blindes Setzen noch zu verschmerzen, bei einer Sitzecke aus zwölf
 * Objekten nicht mehr: ohne Vorschau ist vor dem Klick nicht zu sehen, ob sie
 * überhaupt in den Raum passt.
 *
 * Die Vorschau zeigt Props mit ihrer echten Textur; Zeichnungen und Texte
 * bekommen nur ihren Umriss. Sie hier zweitmalig zu rendern hieße, den
 * Renderer nachzubauen — und für „passt das hin?" genügt der Umriss.
 */

import { Container, Graphics, Sprite } from 'pixi.js';
import { AddObjects } from '@/model/commands';
import { symmetryCopies } from '@/model/symmetry';
import { canHoldObjects, nextZ } from '@/model/document';
import { snapPoint } from '@/model/grid';
import { instantiateStamp, type Stamp } from '@/model/stamps';
import { getStamp } from '@/assets/stampStore';
import { getPropTexture, variantFor } from '@/engine/propTextures';
import { tileScale } from '@/engine/hitTest';
import { getProp } from '@/assets/library';
import { t } from '@/i18n';
import type { Tool, ToolContext, ToolPointerEvent } from './types';

export class StampTool implements Tool {
  readonly cursor = 'crosshair';

  private ghost = new Container();
  private attached = false;
  /** Woraus die Vorschau gebaut wurde — Baustein, Drehung und Rastermaßstab. */
  private ghostKey = '';

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    const stamp = this.activeStamp(ctx);
    if (!stamp) {
      this.detach(ctx);
      return;
    }
    this.updateGhost(ctx, stamp, e);
  }

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button !== 0) return;

    const stamp = this.activeStamp(ctx);
    if (!stamp) {
      ctx.state.setStatusMessage(t('status.needStamp'));
      return;
    }

    const layerId = ctx.state.activeLayerId;
    if (!canHoldObjects(ctx.doc, layerId)) {
      ctx.state.setStatusMessage(t('status.layerLocked'));
      return;
    }

    const p = this.pointFor(ctx, e);
    const objects = instantiateStamp(stamp, {
      x: p.x,
      y: p.y,
      layerId,
      tileSize: ctx.doc.grid.tileSize,
      z: nextZ(ctx.doc, layerId),
      rotation: (ctx.state.stamp.rotation * Math.PI) / 180,
    });

    // Ein Klick, ein Undo-Schritt: alle Objekte gehen in einen Befehl — die
    // Spiegelungen und Kachelkopien eingeschlossen.
    const kopien = symmetryCopies(ctx.doc, objects, ctx.state.symmetry);
    ctx.exec(new AddObjects([...objects, ...kopien], t('cmd.placeStamp')));
    ctx.state.setSelection(objects.map((o) => o.id));
  }

  deactivate(ctx: ToolContext): void {
    this.detach(ctx);
  }

  // -------------------------------------------------------------------------

  private activeStamp(ctx: ToolContext): Stamp | null {
    const id = ctx.state.activeStampId;
    return id ? getStamp(id) : null;
  }

  private pointFor(ctx: ToolContext, e: ToolPointerEvent) {
    return e.ctrl ? e.world : snapPoint(ctx.doc.grid, e.world);
  }

  private updateGhost(ctx: ToolContext, stamp: Stamp, e: ToolPointerEvent): void {
    const winkel = (ctx.state.stamp.rotation * Math.PI) / 180;
    const k = stamp.tileSize > 0 ? ctx.doc.grid.tileSize / stamp.tileSize : 1;
    const key = `${stamp.id}#${winkel.toFixed(3)}#${k.toFixed(3)}`;
    if (key !== this.ghostKey) {
      this.buildGhost(ctx, stamp, winkel, k);
      this.ghostKey = key;
    }

    if (!this.attached) {
      ctx.renderer.addOverlay(this.ghost);
      this.attached = true;
    }
    const p = this.pointFor(ctx, e);
    this.ghost.position.set(p.x, p.y);
    this.ghost.visible = true;
  }

  private buildGhost(ctx: ToolContext, stamp: Stamp, winkel: number, k: number): void {
    this.ghost.removeChildren();
    this.ghost.alpha = 0.6;

    const cos = Math.cos(winkel);
    const sin = Math.sin(winkel);
    const umrisse = new Graphics();
    let hatUmrisse = false;
    const skala = tileScale(ctx.doc);

    for (const obj of stamp.objects) {
      // Dieselbe Rechnung wie beim Setzen, sonst zeigte die Vorschau anderswohin.
      const x = obj.x * k;
      const y = obj.y * k;
      const wx = x * cos - y * sin;
      const wy = x * sin + y * cos;

      if (obj.kind === 'prop') {
        const variante = variantFor(obj.propId, obj.seed);
        const tex = getPropTexture(ctx.renderer.app.renderer, obj.propId, variante);
        if (!tex) continue;
        const sprite = new Sprite(tex);
        sprite.anchor.set(0.5);
        sprite.position.set(wx, wy);
        sprite.rotation = obj.rotation + winkel;
        sprite.scale.set(
          (obj.flipX ? -1 : 1) * obj.scaleX * skala,
          (obj.flipY ? -1 : 1) * obj.scaleY * skala,
        );
        if (obj.tint !== null) sprite.tint = obj.tint;
        sprite.alpha = obj.opacity;
        this.ghost.addChild(sprite);
        continue;
      }

      // Zeichnung und Text: nur die Hülle, mittig um den Ankerpunkt.
      const { hw, hh } = this.roughHalfExtents(obj, k, skala);
      umrisse
        .rect(wx - hw, wy - hh, hw * 2, hh * 2)
        .stroke({ width: 1.5 / ctx.renderer.camera.zoom, color: 0x8ab4ff, alpha: 0.9 });
      hatUmrisse = true;
    }

    if (hatUmrisse) this.ghost.addChild(umrisse);
  }

  /** Grobe Halbmaße für den Umriss; genau genug, um Platz abzuschätzen. */
  private roughHalfExtents(
    obj: Stamp['objects'][number],
    k: number,
    skala: number,
  ): { hw: number; hh: number } {
    if (obj.kind === 'shape') {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < obj.points.length; i += 2) {
        minX = Math.min(minX, obj.points[i]);
        maxX = Math.max(maxX, obj.points[i]);
        minY = Math.min(minY, obj.points[i + 1]);
        maxY = Math.max(maxY, obj.points[i + 1]);
      }
      if (!Number.isFinite(minX)) return { hw: 0, hh: 0 };
      return { hw: ((maxX - minX) / 2) * k, hh: ((maxY - minY) / 2) * k };
    }
    if (obj.kind === 'text') {
      const zeilen = obj.text.split('\n');
      const laengste = zeilen.reduce((a, l) => Math.max(a, l.length), 1);
      return {
        hw: (laengste * obj.fontSize * 0.52 * k) / 2,
        hh: (zeilen.length * obj.fontSize * obj.lineHeight * k) / 2,
      };
    }
    const def = getProp(obj.propId);
    return {
      hw: ((def?.size.w ?? 100) * Math.abs(obj.scaleX) * skala) / 2,
      hh: ((def?.size.h ?? 100) * Math.abs(obj.scaleY) * skala) / 2,
    };
  }

  private detach(ctx: ToolContext): void {
    if (this.attached) {
      ctx.renderer.removeOverlay(this.ghost);
      this.attached = false;
    }
    this.ghost.visible = false;
  }
}
