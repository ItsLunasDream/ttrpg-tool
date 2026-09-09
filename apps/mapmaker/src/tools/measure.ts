/**
 * Messwerkzeug.
 *
 * Klicken setzt Wegpunkte, Rechtsklick oder Enter schließt ab — dieselbe Geste
 * wie beim Polygon und beim Wandwerkzeug, damit man sie nicht neu lernen muss.
 *
 * Zwei Entscheidungen, die nicht offensichtlich sind:
 *
 * 1. **Gemessen wird von Feldmitte zu Feldmitte**, nicht von Klick zu Klick.
 *    Eine Rastermetrik zählt Felder; zwei Punkte innerhalb desselben Feldes
 *    sind null Felder weit auseinander, und alles andere wäre eine Zahl, die
 *    am Spieltisch nicht gilt. Strg misst frei, für alles Ungerasterte.
 * 2. **Die Messung bleibt stehen, bis die nächste beginnt.** Sie verschwinden
 *    zu lassen, sobald man die Maus hebt, hieße, das Ergebnis im selben
 *    Moment wegzunehmen, in dem man es ablesen will.
 *
 * Das Ergebnis ist kein Dokumentobjekt: eine Messung wird nicht gespeichert,
 * nicht exportiert und steht nicht im Verlauf. Sie ist eine Frage, keine
 * Änderung.
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { formatDistance, measureTiles, snapPoint, type Point } from '@/model/grid';
import { t } from '@/i18n';
import type { Tool, ToolContext, ToolPointerEvent } from './types';

const LINIE = 0xf2c14e;
const SCHATTEN = 0x1a1208;

export class MeasureTool implements Tool {
  readonly cursor = 'crosshair';

  /** Gesetzte Wegpunkte; der letzte läuft beim Ziehen dem Zeiger nach. */
  private punkte: Point[] = [];
  private laeuft = false;
  private lagen = new Container();
  private linien = new Graphics();
  private beschriftung = new Container();
  private attached = false;

  constructor() {
    this.lagen.addChild(this.linien);
    this.lagen.addChild(this.beschriftung);
  }

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button === 2) {
      if (this.laeuft) this.abschliessen(ctx);
      return;
    }
    if (e.button !== 0) return;

    const p = this.fangen(ctx, e);
    if (!this.laeuft) {
      // Eine neue Messung ersetzt die alte — zwei nebeneinander wären nur
      // dann nützlich, wenn man sie vergleichen wollte, und dafür gibt es
      // die Wegpunkte.
      this.punkte = [p, p];
      this.laeuft = true;
    } else {
      this.punkte.push(p);
    }
    this.attach(ctx);
    this.zeichnen(ctx);
  }

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.laeuft) return;
    this.punkte[this.punkte.length - 1] = this.fangen(ctx, e);
    this.zeichnen(ctx);
  }

  onKeyDown(e: KeyboardEvent, ctx: ToolContext): boolean {
    if (e.key === 'Escape') {
      // Erst die laufende Messung beenden, beim zweiten Escape das Ergebnis
      // wegräumen. Sonst wäre die eben abgelesene Zahl beim kleinsten
      // Fehlgriff weg.
      if (this.laeuft) this.abschliessen(ctx);
      else this.leeren(ctx);
      return true;
    }
    if (!this.laeuft) return false;
    if (e.key === 'Enter') {
      this.abschliessen(ctx);
      return true;
    }
    if (e.key === 'Backspace' && this.punkte.length > 2) {
      this.punkte.splice(this.punkte.length - 2, 1);
      this.zeichnen(ctx);
      return true;
    }
    return false;
  }

  deactivate(ctx: ToolContext): void {
    this.laeuft = false;
    this.leeren(ctx);
  }

  // -------------------------------------------------------------------------

  private fangen(ctx: ToolContext, e: ToolPointerEvent): Point {
    // Strg misst frei — für Abstände, die sich nicht ans Raster halten.
    return e.ctrl ? { ...e.world } : snapPoint(ctx.doc.grid, e.world, 'tile');
  }

  private abschliessen(ctx: ToolContext): void {
    this.laeuft = false;
    // Der mitlaufende Punkt sitzt beim Abschließen dort, wo der Zeiger steht;
    // er ist Teil der Messung und bleibt stehen.
    this.zeichnen(ctx);
  }

  private leeren(ctx: ToolContext): void {
    this.punkte = [];
    this.linien.clear();
    this.beschriftung.removeChildren().forEach((k) => k.destroy());
    if (this.attached) {
      ctx.renderer.removeOverlay(this.lagen);
      this.attached = false;
    }
    ctx.state.setStatusMessage('');
  }

  private attach(ctx: ToolContext): void {
    if (!this.attached) {
      ctx.renderer.addOverlay(this.lagen);
      this.attached = true;
    }
  }

  private zeichnen(ctx: ToolContext): void {
    const grid = ctx.doc.grid;
    const zoom = ctx.renderer.camera.zoom;
    const g = this.linien.clear();
    this.beschriftung.removeChildren().forEach((k) => k.destroy());
    if (this.punkte.length < 2) return;

    // Strichstärken gegen den Zoom rechnen: eine Messlinie soll bei jeder
    // Vergrößerung gleich dick aussehen.
    const breit = Math.max(0.6, 3 / zoom);
    const punktR = Math.max(1.5, 5 / zoom);

    const bahn: number[] = [];
    for (const p of this.punkte) bahn.push(p.x, p.y);
    g.poly(bahn, false).stroke({ width: breit * 2, color: SCHATTEN, alpha: 0.55 });
    g.poly(bahn, false).stroke({ width: breit, color: LINIE });

    let gesamt = 0;
    for (let i = 1; i < this.punkte.length; i++) {
      const a = this.punkte[i - 1];
      const b = this.punkte[i];
      const felder = measureTiles(grid, a, b);
      gesamt += felder;
      // Teilstrecken nur beschriften, wenn es mehrere gibt — sonst stünde
      // dieselbe Zahl zweimal da.
      if (this.punkte.length > 2 && felder > 0) {
        this.text(formatDistance(grid, felder), (a.x + b.x) / 2, (a.y + b.y) / 2, zoom, 0.75);
      }
    }

    for (const p of this.punkte) {
      g.circle(p.x, p.y, punktR).fill({ color: LINIE });
      g.circle(p.x, p.y, punktR).stroke({ width: breit * 0.5, color: SCHATTEN, alpha: 0.7 });
    }

    const letzte = this.punkte[this.punkte.length - 1];
    const beschriftung = formatDistance(grid, gesamt);
    this.text(beschriftung, letzte.x, letzte.y - punktR * 3, zoom, 1);
    // Auch in die Statuszeile: dort sucht man Zahlen, und beim Ziehen liegt
    // die Hand über der Beschriftung auf der Karte.
    ctx.state.setStatusMessage(t('measure.status', { value: beschriftung }));
  }

  private text(inhalt: string, x: number, y: number, zoom: number, groesse: number): void {
    const style = new TextStyle({
      fontFamily: 'system-ui, sans-serif',
      // Gegen den Zoom skaliert, damit die Schrift lesbar groß bleibt.
      fontSize: 15 * groesse,
      fill: LINIE,
      stroke: { color: SCHATTEN, width: 4 * groesse },
      fontWeight: '600',
    });
    const knoten = new Text({ text: inhalt, style });
    knoten.anchor.set(0.5, 1);
    knoten.position.set(x, y);
    knoten.scale.set(1 / zoom);
    this.beschriftung.addChild(knoten);
  }
}
