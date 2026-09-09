/**
 * Radiergummi für Zeichnungen.
 *
 * Schneidet Stücke aus Strichen heraus, statt ganze Objekte zu löschen. Aus
 * einem Zug können dabei mehrere werden; die Rechnung dafür steht in
 * `model/eraseStroke.ts`, hier steht die Bedienung.
 *
 * **Woran der Radiergummi nicht geht, und warum.** An Rechtecken und Ellipsen:
 * sie sind über zwei gegenüberliegende Ecken beschrieben, nicht über einen
 * Linienzug — ein angeschnittenes Rechteck wäre keines mehr. Und an Flächen
 * ohne Strich: übrig bliebe ein offener Zug ohne Füllung, also nichts
 * Sichtbares. Beides sagt die Statuszeile, statt still nichts zu tun.
 *
 * Ein Strich ist ein Rückgängig-Schritt. Die einzelnen Häppchen verschmelzen
 * über den `mergeKey` des Befehls.
 */

import { Graphics } from 'pixi.js';
import { EraseStrokes } from '@/model/commands';
import { isObjectEditable } from '@/model/document';
import { eraseCircle } from '@/model/eraseStroke';
import { makeId } from '@/model/ids';
import { worldAABB } from '@/engine/hitTest';
import { t } from '@/i18n';
import type { MapObject, ObjectId, ShapeObject } from '@/model/types';
import type { Tool, ToolContext, ToolPointerEvent } from './types';

/** Punktweise gleich? Zwei Züge mit gleicher Länge sind noch nicht derselbe. */
function gleichePunkte(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > 1e-6) return false;
  }
  return true;
}

/** Formen, die als Linienzug beschrieben sind — nur die lassen sich schneiden. */
function istZug(obj: MapObject): obj is ShapeObject {
  return obj.kind === 'shape' && obj.shape !== 'rect' && obj.shape !== 'ellipse';
}

export class EraseTool implements Tool {
  readonly cursor = 'crosshair';

  private radiert = false;
  /** Zuletzt radierte Stelle — der Weg dazwischen wird abgelaufen. */
  private letzte: { x: number; y: number } | null = null;
  /** Stand vor dem *ganzen* Strich, je Objekt einmal festgehalten. */
  private davor = new Map<ObjectId, MapObject>();
  /** Ergebnis je angefasstem Objekt; fehlt es hier, ist es weg. */
  private ergebnis = new Map<ObjectId, MapObject>();
  /**
   * Was dieser Strich selbst hervorgebracht hat.
   *
   * Solche Stücke gehören *nicht* in den Ausgangsstand: sie gab es vor dem
   * Strich nicht, und ein Rückgängig, das sie wiederherstellt, ließe Bruchteile
   * einer Linie stehen, die längst wieder ganz ist.
   */
  private erzeugt = new Set<ObjectId>();
  private gemeldet = false;

  private preview = new Graphics();
  private attached = false;

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button !== 0) return;
    this.radiert = true;
    this.davor.clear();
    this.ergebnis.clear();
    this.erzeugt.clear();
    this.gemeldet = false;
    this.letzte = null;
    ctx.beginTransaction();
    this.wegAblaufen(ctx, e);
    this.zeichneVorschau(ctx, e);
  }

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    this.zeichneVorschau(ctx, e);
    if (this.radiert) this.wegAblaufen(ctx, e);
  }

  onPointerUp(_e: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.radiert) return;
    this.radiert = false;
    this.letzte = null;
    ctx.endTransaction();
  }

  deactivate(ctx: ToolContext): void {
    if (this.radiert) {
      this.radiert = false;
      ctx.endTransaction();
    }
    this.detach(ctx);
  }

  // -------------------------------------------------------------------------

  private radius(ctx: ToolContext): number {
    return ctx.state.erase.radius;
  }

/**
   * Läuft den Weg seit dem letzten Ereignis ab und radiert in festen Abständen.
   *
   * Ohne das radierte nur, wo der Zeiger *gemeldet* wurde. Bei einer schnellen
   * Bewegung liegen diese Stellen weit auseinander, und zwischen zwei Kreisen
   * bliebe ein Stück Strich stehen — sichtbar als Inselkette im Radierten.
   * Denselben Weg geht der Pinsel (`tools/brush.ts`), aus demselben Grund.
   */
  private wegAblaufen(ctx: ToolContext, e: ToolPointerEvent): void {
    const r = this.radius(ctx);
    const start = this.letzte;
    this.letzte = { x: e.world.x, y: e.world.y };

    if (!start) {
      this.schritt(ctx, e.world.x, e.world.y);
      return;
    }

    const dx = e.world.x - start.x;
    const dy = e.world.y - start.y;
    const dist = Math.hypot(dx, dy);
    // Halber Radius: die Kreise überlappen sich sicher, ohne dass ein langer
    // Zug in hunderte Schnitte zerfällt.
    const step = Math.max(2, r * 0.5);
    const schritte = Math.min(200, Math.ceil(dist / step));

    for (let i = 1; i <= schritte; i++) {
      const t = i / schritte;
      this.schritt(ctx, start.x + dx * t, start.y + dy * t);
    }
  }

  /** Ein Häppchen des Strichs: alles im Kreis wegschneiden. */
  private schritt(ctx: ToolContext, wx: number, wy: number): void {
    const r = this.radius(ctx);
    const betroffen: ShapeObject[] = [];
    let uebersprungen = false;

    for (const obj of Object.values(ctx.doc.objects)) {
      if (obj.kind !== 'shape') continue;
      if (!isObjectEditable(ctx.doc, obj.id)) continue;

      const box = worldAABB(ctx.doc, obj, ctx.renderer.textMetrics);
      if (wx + r < box.minX || wx - r > box.maxX || wy + r < box.minY || wy - r > box.maxY) {
        continue;
      }

      if (!istZug(obj) || !obj.stroke) {
        uebersprungen = true;
        continue;
      }
      betroffen.push(obj);
    }

    if (uebersprungen && !this.gemeldet) {
      ctx.state.setStatusMessage(t('status.eraseShapeOnly'));
      this.gemeldet = true;
    }
    if (betroffen.length === 0) return;

    let etwasGeschnitten = false;

    for (const obj of betroffen) {
      // Der Kreis liegt in Weltkoordinaten, die Punkte lokal und gedreht.
      const cos = Math.cos(obj.rotation);
      const sin = Math.sin(obj.rotation);
      const dx = wx - obj.x;
      const dy = wy - obj.y;
      const lokal = { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };

      const runs = eraseCircle(obj.points, obj.closed, lokal.x, lokal.y, r);
      // Nichts getroffen: ein einzelner Zug mit denselben Punkten. Nur ihre
      // *Anzahl* zu vergleichen reichte nicht — ein gekürztes Ende hat gleich
      // viele, und der Schnitt fiel unter den Tisch. Übrig blieben
      // Bruchstücke zwischen den Radierkreisen.
      if (runs.length === 1 && !obj.closed && gleichePunkte(runs[0], obj.points)) continue;
      etwasGeschnitten = true;

      if (!this.davor.has(obj.id) && !this.erzeugt.has(obj.id)) {
        this.davor.set(obj.id, structuredClone(obj));
      }

      if (runs.length === 0) {
        this.ergebnis.delete(obj.id);
        continue;
      }

      // Der erste Zug behält die Kennung — sonst verlöre die Auswahl ihr Ziel
      // und jeder Radierpunkt erzeugte ein neues Objekt.
      const [erster, ...weitere] = runs;
      this.ergebnis.set(obj.id, { ...structuredClone(obj), points: erster, closed: false, fill: null });
      for (const run of weitere) {
        const teil: ShapeObject = {
          ...structuredClone(obj),
          id: makeId('obj'),
          points: run,
          closed: false,
          fill: null,
        };
        this.ergebnis.set(teil.id, teil);
        this.erzeugt.add(teil.id);
      }
    }

    if (!etwasGeschnitten) return;

    // Der Befehl trägt immer den ganzen Strich: Ausgangsstand und aktuelles
    // Ergebnis. Beim Verschmelzen bleibt der Ausgangsstand stehen.
    ctx.exec(
      new EraseStrokes(
        [...this.davor.values()],
        [...this.ergebnis.values()],
        t('cmd.erase'),
        'erase',
      ),
    );
  }

  private zeichneVorschau(ctx: ToolContext, e: ToolPointerEvent): void {
    if (!this.attached) {
      ctx.renderer.addOverlay(this.preview);
      this.attached = true;
    }
    const r = this.radius(ctx);
    const zoom = ctx.renderer.camera.zoom;
    this.preview
      .clear()
      .circle(e.world.x, e.world.y, r)
      .fill({ color: 0xffffff, alpha: 0.08 })
      .circle(e.world.x, e.world.y, r)
      .stroke({ width: Math.max(1, 1.5 / zoom), color: 0xff8a8a, alpha: 0.9 });
    this.preview.visible = true;
  }

  private detach(ctx: ToolContext): void {
    if (this.attached) {
      ctx.renderer.removeOverlay(this.preview);
      this.attached = false;
    }
    this.preview.visible = false;
  }
}
