/**
 * Editor-Darstellung der VTT-Ebene: Wände, Türen, Lichter, Notizen.
 *
 * Diese Ebene wird niemals in den Bild-Export gerendert — sie beschreibt, was
 * Foundry aus der `.uvtt`-Datei aufbauen soll, nicht was auf der Karte zu sehen
 * ist. Der Export blendet den Container hart aus.
 */

import { Container, Graphics, Text } from 'pixi.js';
import type { MapDocument, MapNote, NoteIcon, WallType } from '@/model/types';
import { dashPolyline } from '@/model/geometry';
import type { Camera } from './camera';

/**
 * Abstand der Pin-Spitze vom Kopfmittelpunkt, in Kopfradien.
 *
 * Kleiner heißt gedrungener Tropfen, größer heißt spitzer. 1,6 ergibt eine
 * Form, die auch bei kleinem Zoom noch als Pin zu erkennen ist.
 */
const TIP_DISTANCE = 1.6;

/** Kreis als Punktliste — für den gestrichelten Ring, den Graphics nicht kann. */
function circlePoints(cx: number, cy: number, r: number, segments: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}

const WALL_COLORS: Record<WallType, number> = {
  normal: 0xff4d4d,
  invisible: 0x8a8a8a,
  ethereal: 0x9b6bff,
  window: 0x4dd2ff,
};

const PORTAL_COLOR = 0xffc23d;
const PORTAL_OPEN_COLOR = 0x6bd66b;
const LIGHT_COLOR = 0xffd98a;

/**
 * Zeichen für die Pins.
 *
 * Bewusst Schriftzeichen statt Bilder: die Notiz-Symbole müssen hier nur
 * unterscheidbar sein, nicht hübsch — in Foundry stehen ohnehin dessen eigene
 * Icons (siehe io/foundryNotes.ts). Ein Zeichen kostet keine Textur.
 */
const NOTE_GLYPHS: Record<NoteIcon, string> = {
  marker: '\u2691',
  info: 'i',
  danger: '!',
  treasure: '\u25c6',
  door: '\u25a1',
  secret: '?',
  combat: '\u2694',
  quest: '\u2605',
};

export class VttOverlay {
  readonly view = new Container();

  private gfx = new Graphics();
  /** Zeichen und Titel je Notiz, nach Kennung abgelegt und wiederverwendet. */
  private noteTexts = new Map<string, { glyph: Text; title: Text }>();
  private labelHost = new Container();
  private dirty = true;
  private lastZoom = -1;

  constructor() {
    this.view.addChild(this.gfx);
    this.view.addChild(this.labelHost);
    this.view.label = 'vtt-overlay';
  }

  invalidate(): void {
    this.dirty = true;
  }

  update(doc: MapDocument, camera: Camera): void {
    // Strichstärken sind zoomkompensiert, darum bei Zoomänderung neu zeichnen.
    if (!this.dirty && Math.abs(camera.zoom - this.lastZoom) < 1e-4) return;
    this.dirty = false;
    this.lastZoom = camera.zoom;

    const g = this.gfx;
    g.clear();

    const lw = Math.max(1.2, 3 / camera.zoom);
    const dot = Math.max(2, 5 / camera.zoom);

    for (const wall of doc.vtt.walls) {
      if (wall.points.length < 4) continue;
      g.moveTo(wall.points[0], wall.points[1]);
      for (let i = 2; i < wall.points.length; i += 2) g.lineTo(wall.points[i], wall.points[i + 1]);
      if (wall.closed) g.closePath();
      g.stroke({
        width: lw,
        color: WALL_COLORS[wall.type],
        alpha: wall.type === 'invisible' ? 0.6 : 0.9,
        cap: 'round',
        join: 'round',
      });

      // Stützpunkte sichtbar machen, sonst kann man Wandzüge nicht nachziehen.
      for (let i = 0; i < wall.points.length; i += 2) {
        g.circle(wall.points[i], wall.points[i + 1], dot * 0.6).fill({
          color: WALL_COLORS[wall.type],
          alpha: 0.8,
        });
      }
    }

    for (const portal of doc.vtt.portals) {
      const [x0, y0, x1, y1] = portal.bounds;
      const color = portal.closed ? PORTAL_COLOR : PORTAL_OPEN_COLOR;
      g.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: lw * 1.6, color, alpha: 0.95, cap: 'round' });

      // Quermarke in der Mitte: unterscheidet Tür von Wand auf den ersten Blick.
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * dot * 1.8;
      const ny = (dx / len) * dot * 1.8;
      g.moveTo(mx - nx, my - ny).lineTo(mx + nx, my + ny).stroke({ width: lw, color, alpha: 0.9 });
    }

    for (const light of doc.vtt.lights) {
      const radius = light.range * doc.grid.tileSize;
      g.circle(light.x, light.y, radius).fill({ color: light.color, alpha: 0.1 });
      g.circle(light.x, light.y, radius).stroke({
        width: Math.max(1, 1.5 / camera.zoom),
        color: light.color,
        alpha: 0.55,
      });
      g.circle(light.x, light.y, dot).fill({ color: LIGHT_COLOR });
      g.circle(light.x, light.y, dot).stroke({
        width: Math.max(0.8, 1.2 / camera.zoom),
        color: 0x000000,
        alpha: 0.6,
      });
    }

    this.drawNotes(doc, camera);
  }

  /**
   * Notiz-Pins: Tropfen mit Zeichen im Kopf, Titel darunter.
   *
   * Die Spitze sitzt auf dem gespeicherten Punkt, der Kopf darüber — so zeigt
   * der Pin auf seinen Ort, statt ihn zu verdecken. Die Seiten laufen als
   * Tangenten von der Spitze an den Kopf; ohne das bekäme der Tropfen einen
   * Knick an der Schulter.
   *
   * Zeichen und Titel sind Text-Objekte und werden wiederverwendet. Der Rest
   * der Ebene ist ein einziges Graphics, das jedes Mal neu gezeichnet wird —
   * bei Text wäre das je Bild eine neue Textur.
   */
  private drawNotes(doc: MapDocument, camera: Camera): void {
    const g = this.gfx;
    const lebend = new Set<string>();

    for (const note of doc.vtt.notes) {
      lebend.add(note.id);

      // `size` ist die Gesamthöhe des Pins in Tiles.
      const hoehe = Math.max(8, note.size * doc.grid.tileSize);
      const r = hoehe / (1 + TIP_DISTANCE);
      const d = TIP_DISTANCE * r;
      const cy = note.y - d;
      // Berührpunkte der Tangenten von der Spitze an den Kopf.
      const psi = Math.acos(Math.min(1, r / d));
      const start = Math.PI / 2 + psi;
      const ende = Math.PI / 2 - psi + Math.PI * 2;

      const kontur = () => {
        g.moveTo(note.x + Math.cos(start) * r, cy + Math.sin(start) * r);
        g.arc(note.x, cy, r, start, ende);
        g.lineTo(note.x, note.y);
        g.closePath();
      };

      kontur();
      g.fill({ color: note.color, alpha: 0.95 });
      kontur();
      g.stroke({ width: Math.max(1, 2 / camera.zoom), color: 0x1a1208, alpha: 0.9 });

      // Nur für die Spielleitung: gestrichelter Ring um den Kopf. Ein bloß
      // blasserer Pin wäre kein Unterschied, den man auf der Karte bemerkt.
      if (!note.playerVisible) {
        const ring = circlePoints(note.x, cy, r * 1.28, 48);
        for (const stueck of dashPolyline(ring, [r * 0.5, r * 0.35], true)) {
          g.moveTo(stueck[0], stueck[1]);
          for (let i = 2; i < stueck.length; i += 2) g.lineTo(stueck[i], stueck[i + 1]);
          g.stroke({ width: Math.max(1, 1.8 / camera.zoom), color: note.color, alpha: 0.85 });
        }
      }

      this.updateNoteText(note, r, cy);
    }

    for (const [id, texte] of this.noteTexts) {
      if (!lebend.has(id)) {
        texte.glyph.destroy();
        texte.title.destroy();
        this.noteTexts.delete(id);
      }
    }
  }

  private updateNoteText(note: MapNote, r: number, cy: number): void {
    let texte = this.noteTexts.get(note.id);
    if (!texte) {
      const glyph = new Text({ text: '', resolution: 2 });
      glyph.anchor.set(0.5);
      const title = new Text({ text: '', resolution: 2 });
      title.anchor.set(0.5, 0);
      texte = { glyph, title };
      this.noteTexts.set(note.id, texte);
      this.labelHost.addChild(glyph, title);
    }

    const zeichen = NOTE_GLYPHS[note.icon] ?? NOTE_GLYPHS.marker;
    if (texte.glyph.text !== zeichen) texte.glyph.text = zeichen;
    texte.glyph.style = {
      fontFamily: 'Georgia, serif',
      fontSize: r * 1.1,
      fill: 0x1a1208,
    };
    texte.glyph.position.set(note.x, cy);

    const titel = note.title.trim();
    texte.title.visible = titel.length > 0;
    if (titel.length > 0) {
      if (texte.title.text !== titel) texte.title.text = titel;
      texte.title.style = {
        fontFamily: 'Georgia, serif',
        fontSize: r * 0.75,
        fill: note.color,
        align: 'center',
        stroke: { color: 0x1a1208, width: r * 0.22, join: 'round' },
      };
      // Unter der Spitze, damit er den Pin nicht überdeckt.
      texte.title.position.set(note.x, note.y + r * 0.25);
    }
  }

  destroy(): void {
    this.noteTexts.clear();
    this.view.destroy({ children: true });
  }
}
