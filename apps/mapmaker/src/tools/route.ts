/**
 * Reiserouten zeichnen.
 *
 * Klick für Klick wie das Wandwerkzeug, Rechtsklick oder Enter schließt ab.
 * Ein eigenes Werkzeug und keine Einstellung im Zeichnen-Panel: eine Route
 * ist nicht eine Linie mit anderem Strich, sondern eine Linie mit einer
 * *Frage* daran — wie lange man unterwegs ist. Die Antwort steht nach dem
 * Abschließen in der Statuszeile.
 *
 * Herauskommt eine gewöhnliche Zeichnung mit `route`-Angabe; sie lässt sich
 * danach mit dem Auswahl-Werkzeug an den Stützpunkten nachbessern, und die
 * Marken wandern mit.
 */

import { Graphics } from 'pixi.js';
import { AddObjects } from '@/model/commands';
import { canHoldObjects, nextZ } from '@/model/document';
import { gridDistance, snapPoint } from '@/model/grid';
import { makeId } from '@/model/ids';
import {
  dayLengthInPixels,
  markLength,
  routeDays,
  routeDistance,
  routeMarks,
} from '@/model/routeMarks';
import { translatePoints } from '@/model/geometry';
import { t } from '@/i18n';
import type { ShapeObject } from '@/model/types';
import type { Tool, ToolContext, ToolPointerEvent } from './types';

export class RouteTool implements Tool {
  readonly cursor = 'crosshair';

  private points: number[] = [];
  private zeichnet = false;
  private preview = new Graphics();
  private attached = false;

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button === 2) {
      if (this.zeichnet) {
        // Der mitlaufende Punkt gehört nicht zum Ergebnis.
        this.points.length -= 2;
        this.abschliessen(ctx);
      }
      return;
    }
    if (e.button !== 0) return;

    if (!canHoldObjects(ctx.doc, ctx.state.activeLayerId)) {
      ctx.state.setStatusMessage(t('status.layerLocked'));
      return;
    }

    const p = this.punkt(ctx, e);
    if (!this.zeichnet) {
      this.zeichnet = true;
      this.points = [p.x, p.y];
      this.anhaengen(ctx);
    } else {
      // Wie beim Wandwerkzeug: ohne pointermove — auf einem Tablett der
      // Normalfall — hinge der mitlaufende Punkt noch auf dem vorigen.
      this.points[this.points.length - 2] = p.x;
      this.points[this.points.length - 1] = p.y;
    }
    this.points.push(p.x, p.y);
    this.zeichneVorschau(ctx);
  }

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.zeichnet) return;
    const p = this.punkt(ctx, e);
    this.points[this.points.length - 2] = p.x;
    this.points[this.points.length - 1] = p.y;
    this.zeichneVorschau(ctx);
  }

  onKeyDown(e: KeyboardEvent, ctx: ToolContext): boolean {
    if (!this.zeichnet) return false;
    if (e.key === 'Enter') {
      this.points.length -= 2;
      this.abschliessen(ctx);
      return true;
    }
    if (e.key === 'Escape') {
      this.zuruecksetzen(ctx);
      return true;
    }
    if (e.key === 'Backspace' && this.points.length > 4) {
      this.points.splice(this.points.length - 4, 2);
      this.zeichneVorschau(ctx);
      return true;
    }
    return false;
  }

  deactivate(ctx: ToolContext): void {
    this.zuruecksetzen(ctx);
  }

  // -------------------------------------------------------------------------

  private punkt(ctx: ToolContext, e: ToolPointerEvent): { x: number; y: number } {
    // Auf einer Weltkarte liegt ein Weg selten auf Feldgrenzen; Strg schaltet
    // das Fangen ganz ab, sonst fängt die Feldmitte.
    return e.ctrl ? e.world : snapPoint(ctx.doc.grid, e.world, 'tile');
  }

  private abschliessen(ctx: ToolContext): void {
    const pts = [...this.points];
    this.zuruecksetzen(ctx);
    if (pts.length < 4) return;

    const s = ctx.state.route;
    const layerId = ctx.state.activeLayerId;
    const ox = pts[0];
    const oy = pts[1];

    const objekt: ShapeObject = {
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
      points: translatePoints(pts, -ox, -oy),
      closed: false,
      blend: 'normal',
      stroke: {
        color: s.color,
        width: s.width,
        alpha: 1,
        // Gestrichelt, weil eine Reiseroute keine Grenze und keine Straße ist;
        // die zeichnet der Generator durchgezogen.
        dash: [14, 10],
      },
      fill: null,
      route: { perDay: s.perDay, marks: s.marks },
    };

    ctx.exec(new AddObjects([objekt], t('cmd.route')));
    ctx.state.setSelection([objekt.id]);

    // Die Antwort auf die Frage, für die man eine Route zeichnet.
    const grid = ctx.doc.grid;
    const einheit = gridDistance(grid).unit;
    const strecke = Math.round(routeDistance(pts, grid));
    const tage = routeDays(pts, grid, s.perDay);
    ctx.state.setStatusMessage(
      tage === 1
        ? t('route.summaryOne', { distance: strecke, unit: einheit })
        : t('route.summary', { distance: strecke, unit: einheit, days: tage }),
    );
  }

  private zeichneVorschau(ctx: ToolContext): void {
    const g = this.preview.clear();
    if (this.points.length < 4) return;

    const zoom = ctx.renderer.camera.zoom;
    const s = ctx.state.route;

    g.moveTo(this.points[0], this.points[1]);
    for (let i = 2; i < this.points.length; i += 2) g.lineTo(this.points[i], this.points[i + 1]);
    g.stroke({ width: Math.max(1, s.width), color: s.color, alpha: 0.85, cap: 'round' });

    // Die Marken schon während des Zeichnens: die Frage „reicht ein Tag bis
    // dorthin?" stellt sich beim Ziehen, nicht danach.
    if (s.marks) {
      const abstand = dayLengthInPixels(ctx.doc.grid, s.perDay);
      const laenge = markLength(abstand, s.width);
      for (const mark of routeMarks(this.points, abstand)) {
        const nx = -Math.sin(mark.angle) * laenge;
        const ny = Math.cos(mark.angle) * laenge;
        g.moveTo(mark.x - nx, mark.y - ny).lineTo(mark.x + nx, mark.y + ny);
      }
      g.stroke({ width: Math.max(1, s.width * 0.9), color: s.color, alpha: 0.85, cap: 'round' });
    }

    void zoom;
  }

  private anhaengen(ctx: ToolContext): void {
    if (!this.attached) {
      ctx.renderer.addOverlay(this.preview);
      this.attached = true;
    }
  }

  private zuruecksetzen(ctx: ToolContext): void {
    this.zeichnet = false;
    this.points = [];
    this.preview.clear();
    if (this.attached) {
      ctx.renderer.removeOverlay(this.preview);
      this.attached = false;
    }
  }
}
