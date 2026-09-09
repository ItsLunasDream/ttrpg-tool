/**
 * Höhen-Pinsel für Rasterebenen.
 *
 * Anheben, absenken, glätten, einebnen — alles derselbe Pinsel, nur mit einem
 * anderen Modus. Alt kehrt um: aus Anheben wird Absenken und umgekehrt, wie
 * man es von Bildbearbeitungen kennt.
 *
 * Gerechnet wird auf einer *Arbeitskopie* des Höhenfelds, die beim Anfassen
 * entsteht. Direkt im Dokument zu malen ginge nicht: der Befehl merkt sich
 * beim ersten Ausführen die alten Werte, und die wären dann schon verändert.
 */

import { Graphics } from 'pixi.js';
import { PaintBiome, PaintHeight } from '@/model/commands';
import { heightMapOf } from '@/model/document';
import { stampBiome, stampHeightLine, type HeightBrush } from '@/model/heightBrush';
import type { HeightMap, LayerId } from '@/model/types';
import type { Tool, ToolContext, ToolPointerEvent } from './types';
import { t } from '@/i18n';

/**
 * Abstand der Wiederholungen beim Gedrückthalten.
 *
 * Sechzig Millisekunden sind nah genug an einem Bild, dass es fließend wirkt,
 * und weit genug auseinander, dass ein Halten von einer Sekunde nicht gleich
 * die volle Höhe erreicht: mit der Standardstärke braucht es so mehrere
 * Sekunden bis zum Anschlag, und das lässt sich noch dosieren.
 */
const REPEAT_MS = 60;

export class HeightTool implements Tool {
  readonly cursor = 'crosshair';

  private painting = false;
  private layerId: LayerId | null = null;
  /** Arbeitskopie; siehe Kopfkommentar. */
  private scratch: HeightMap | null = null;
  private last = { x: 0, y: 0 };
  private preview = new Graphics();
  private attached = false;
  /**
   * Wiederholt den Abdruck, solange die Taste liegt.
   *
   * Ohne das wirkt der Pinsel nur, während sich der Zeiger bewegt — wer auf
   * eine Stelle drückt und wartet, sieht nach dem ersten Abdruck nichts mehr
   * passieren. Bei einem Pinsel, der anhebt, absenkt und glättet, ist das
   * Gegenteil erwartet: er soll wirken, wie eine Sprühdose wirkt.
   *
   * Ein Zeitgeber und kein Bild-Ticker: in einem nicht sichtbaren Tab steht
   * der Ticker still, und dann hinge auch das automatische Prüfen.
   */
  private repeat: ReturnType<typeof setInterval> | null = null;
  /** Letztes Zeigerereignis — der Wiederholer braucht Taste und Alt daraus. */
  private lastEvent: ToolPointerEvent | null = null;

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button !== 0 && e.button !== 2) return;

    const id = ctx.state.activeLayerId;
    const map = heightMapOf(ctx.doc, id);
    if (!map) {
      ctx.state.setStatusMessage(t('height.needLayer'));
      return;
    }

    this.painting = true;
    this.layerId = id;
    this.scratch = { ...map, data: [...map.data] };
    this.last = this.toField(ctx, e);
    this.lastEvent = e;
    this.attach(ctx);
    ctx.beginTransaction();
    this.stamp(ctx, e, this.last);
    this.startRepeat(ctx);
  }

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    const p = this.toField(ctx, e);
    this.drawPreview(ctx, e);
    if (!this.painting) return;
    this.lastEvent = e;
    this.stamp(ctx, e, p);
    this.last = p;
  }

  onPointerUp(_e: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.painting) return;
    this.stopRepeat();
    this.painting = false;
    this.scratch = null;
    this.lastEvent = null;
    ctx.endTransaction();
  }

  deactivate(ctx: ToolContext): void {
    this.stopRepeat();
    if (this.painting) ctx.endTransaction();
    this.painting = false;
    this.scratch = null;
    this.lastEvent = null;
    this.detach(ctx);
  }

  /**
   * Alle {@link REPEAT_MS} noch einmal auf dieselbe Stelle.
   *
   * `this.last` bleibt dabei stehen — `stampHeightLine` zieht also eine Linie
   * der Länge null, und das ist genau ein Abdruck an Ort und Stelle.
   */
  private startRepeat(ctx: ToolContext): void {
    this.stopRepeat();
    this.repeat = setInterval(() => {
      if (!this.painting || !this.lastEvent) {
        this.stopRepeat();
        return;
      }
      this.stamp(ctx, this.lastEvent, this.last);
    }, REPEAT_MS);
  }

  private stopRepeat(): void {
    if (this.repeat !== null) {
      clearInterval(this.repeat);
      this.repeat = null;
    }
  }

  // -------------------------------------------------------------------------

  /**
   * Weltkoordinate in Stützstellen-Koordinaten.
   *
   * Nicht in Felder: das Höhenfeld ist feiner aufgelöst als das Raster, und
   * der Pinsel rechnet auf Stützstellen.
   */
  private toField(ctx: ToolContext, e: ToolPointerEvent): { x: number; y: number } {
    const spt = this.scratch?.samplesPerTile ?? heightMapOf(ctx.doc, ctx.state.activeLayerId)?.samplesPerTile ?? 1;
    const tile = ctx.doc.grid.tileSize / spt;
    return { x: e.world.x / tile, y: e.world.y / tile };
  }

  private brushOf(ctx: ToolContext, e: ToolPointerEvent): HeightBrush {
    const s = ctx.state.height;
    // Rechtsklick und Alt kehren um — beim Anheben der häufigste Wunsch.
    const umkehren = e.button === 2 || e.alt;
    let mode = s.mode;
    if (umkehren) {
      if (mode === 'raise') mode = 'lower';
      else if (mode === 'lower') mode = 'raise';
    }
    // Der Radius steht im Panel in *Feldern*; der Pinsel rechnet auf
    // Stützstellen.
    const spt = this.scratch?.samplesPerTile ?? 1;
    // Beim Biom kehrt Alt nicht um, sondern löscht — das ist dort das
    // Gegenstück zum Absenken.
    const biome = umkehren ? 0 : s.biome;
    return { mode, radius: s.radius * spt, strength: s.strength, target: s.target, biome };
  }

  private stamp(ctx: ToolContext, e: ToolPointerEvent, p: { x: number; y: number }): void {
    if (!this.scratch || !this.layerId) return;
    const brush = this.brushOf(ctx, e);

    if (brush.mode === 'biome') {
      const werte = this.stampBiomeLine(p, brush);
      if (werte.size === 0) return;
      ctx.exec(
        new PaintBiome(this.layerId, werte, t('cmd.paintBiome'), `biome:${this.layerId}`),
      );
      return;
    }

    const werte = stampHeightLine(this.scratch, this.last.x, this.last.y, p.x, p.y, brush);
    if (werte.size === 0) return;
    ctx.exec(
      new PaintHeight(this.layerId, werte, t('cmd.paintHeight'), `height:${this.layerId}`),
    );
  }

  /** Biom-Abdrücke entlang der Strecke, damit ein schneller Zug nicht tupft. */
  private stampBiomeLine(p: { x: number; y: number }, brush: HeightBrush): Map<number, number> {
    const scratch = this.scratch!;
    if (!scratch.biome) scratch.biome = new Array<number>(scratch.data.length).fill(0);

    const abstand = Math.max(0.25, brush.radius / 3);
    const laenge = Math.hypot(p.x - this.last.x, p.y - this.last.y);
    const schritte = Math.max(1, Math.ceil(laenge / abstand));
    const out = new Map<number, number>();

    for (let i = 1; i <= schritte; i++) {
      const t2 = i / schritte;
      const teil = stampBiome(
        scratch,
        this.last.x + (p.x - this.last.x) * t2,
        this.last.y + (p.y - this.last.y) * t2,
        brush.radius,
        brush.biome ?? 0,
      );
      for (const [index, wert] of teil) {
        scratch.biome[index] = wert;
        out.set(index, wert);
      }
    }
    return out;
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

  /** Der Pinselkreis am Zeiger — ohne ihn malt man ins Blaue. */
  private drawPreview(ctx: ToolContext, e: ToolPointerEvent): void {
    this.attach(ctx);
    const r = ctx.state.height.radius * ctx.doc.grid.tileSize;
    const zoom = ctx.renderer.camera.zoom;
    this.preview
      .clear()
      .circle(e.world.x, e.world.y, r)
      .stroke({ width: Math.max(1, 1.5 / zoom), color: 0xffffff, alpha: 0.8 })
      .circle(e.world.x, e.world.y, r * 0.35)
      .stroke({ width: Math.max(0.8, 1 / zoom), color: 0xffffff, alpha: 0.35 });
  }
}
