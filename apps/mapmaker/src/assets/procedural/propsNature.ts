/**
 * Prozedurale Props: Natur, Wasser und Überreste.
 *
 * Alles hier lebt von Variation — Blätter, Wellen, Knochen. Genau dafür taugt
 * der prozedurale Weg: hundert Streuungen sehen nach hundert Streuungen aus.
 * Motive, die von Handarbeit leben (ein Marktstand, ein Pferd von oben), sind
 * über den Asset-Import besser aufgehoben.
 */

import type { PropDef } from '../propTypes';
import { def } from './defineProp';
import { PALETTE, blob, jitterColor, offset, scalePts, shade, shaded, strokes,
  spread,
} from './draw';

// ---------------------------------------------------------------------------
// Natur
// ---------------------------------------------------------------------------

export const natureProps: PropDef[] = [
  def('leaves', 'Laub', 'boden', 80, ['blaetter', 'laub', 'herbst', 'boden'], (g, rng) => {
    const herbst = [0x8a6a2f, 0xa8792e, 0x7c4a22, 0x5f6b2c];
    for (let i = 0; i < rng.int(14, 24); i++) {
      const x = spread(rng, 16);
      const y = spread(rng, 16);
      const r = rng.range(3, 6.5);
      const a = rng.range(0, Math.PI * 2);
      // Blatt als gestauchter Blob mit Mittelrippe.
      const pts = offset(blob(rng, r, 0.2, 9, 0.45), x, y);
      const c = jitterColor(rng.pick(herbst), rng, 0.14);
      g.poly(pts).fill({ color: c, alpha: rng.range(0.75, 1) });
      g.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r * 0.45)
        .lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.45)
        .stroke({ width: 0.8, color: shade(c, -0.3), alpha: 0.5 });
    }
  }),

  def('vines', 'Ranken', 'pflanze', { w: 112, h: 110 }, ['ranken', 'efeu', 'kletter'], (g, rng) => {
    const c = jitterColor(PALETTE.leafDark, rng, 0.12);
    const stems = rng.int(2, 4);
    for (let s = 0; s < stems; s++) {
      let x = rng.range(-30, 30);
      let y = -40;
      let dir = Math.PI / 2 + rng.range(-0.4, 0.4);
      const steps = rng.int(6, 10);
      for (let i = 0; i < steps; i++) {
        const len = rng.range(7, 11);
        // Im Rahmen halten: eine Ranke, die hinausläuft, wird beim Backen der
        // Textur abgeschnitten.
        let nx = Math.max(-46, Math.min(46, x + Math.cos(dir) * len));
        let ny = Math.max(-46, Math.min(46, y + Math.sin(dir) * len));
        if (nx !== x + Math.cos(dir) * len || ny !== y + Math.sin(dir) * len) {
          dir += Math.PI * rng.range(0.4, 0.7);
        }
        g.moveTo(x, y).lineTo(nx, ny).stroke({ width: 2, color: c, alpha: 0.9, cap: 'round' });
        // Blätter wechselseitig ansetzen, sonst wirkt die Ranke wie ein Draht.
        const seite = i % 2 === 0 ? 1 : -1;
        const bx = nx + Math.cos(dir + (seite * Math.PI) / 2) * 4;
        const by = ny + Math.sin(dir + (seite * Math.PI) / 2) * 4;
        g.poly(offset(blob(rng, rng.range(3.5, 5.5), 0.25, 9, 0.7), bx, by)).fill({
          color: jitterColor(PALETTE.leaf, rng, 0.16),
        });
        x = nx;
        y = ny;
        dir += rng.range(-0.45, 0.45);
      }
    }
  }),

  def('hay', 'Heu', 'boden', 76, ['heu', 'stroh', 'scheune'], (g, rng) => {
    const c = 0xc9a94e;
    for (let i = 0; i < rng.int(26, 42); i++) {
      const x = spread(rng, 14);
      const y = spread(rng, 11);
      const a = rng.range(0, Math.PI);
      const len = rng.range(7, 15);
      g.moveTo(x - Math.cos(a) * len * 0.5, y - Math.sin(a) * len * 0.5)
        .lineTo(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5)
        .stroke({ width: rng.range(0.9, 1.8), color: jitterColor(c, rng, 0.18), alpha: 0.85 });
    }
  }),

  def('haystack', 'Heuhaufen', 'struktur', { w: 98, h: 96 }, ['heu', 'haufen', 'bauernhof'], (g, rng) => {
    const c = jitterColor(0xc2a04a, rng, 0.1);
    const pts = blob(rng, 40, 0.1, 22, rng.range(0.9, 1));
    shaded(g, pts, c, { shadow: 3, highlight: 0.28, outline: 0.4 });
    strokes(g, rng, rng.int(18, 28), 34, 12, shade(c, -0.3), 1, 0.45);
  }),

  def('reeds', 'Schilf', 'pflanze', 70, ['schilf', 'ufer', 'sumpf', 'wasser'], (g, rng) => {
    for (let i = 0; i < rng.int(8, 14); i++) {
      const x = rng.range(-24, 24);
      const h = rng.range(20, 34);
      const bend = rng.range(-7, 7);
      const c = jitterColor(0x7a8f4a, rng, 0.16);
      g.moveTo(x, 26)
        .quadraticCurveTo(x + bend * 0.5, 26 - h * 0.6, x + bend, 26 - h)
        .stroke({ width: 1.6, color: c, alpha: 0.9, cap: 'round' });
      // Kolben nur bei manchen Halmen — sonst sieht es aus wie eine Reihe Streichhölzer.
      if (rng.bool(0.45)) {
        g.ellipse(x + bend, 26 - h - 2, 2, 5).fill({ color: 0x6b4a2a });
      }
    }
  }),

  def('lilypads', 'Seerosen', 'pflanze', { w: 104, h: 112 }, ['seerose', 'wasser', 'teich'], (g, rng) => {
    for (let i = 0; i < rng.int(3, 6); i++) {
      const x = spread(rng, 16);
      const y = spread(rng, 16);
      const r = rng.range(8, 15);
      const c = jitterColor(0x4e7a3a, rng, 0.14);
      const pts = offset(blob(rng, r, 0.12, 18), x, y);
      g.poly(pts).fill({ color: c });
      // Der Einschnitt macht das Blatt als Seerose erkennbar.
      const a = rng.range(0, Math.PI * 2);
      g.moveTo(x, y)
        .lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
        .stroke({ width: 2, color: shade(c, -0.45), alpha: 0.8 });
      if (rng.bool(0.3)) {
        g.circle(x + rng.range(-4, 4), y + rng.range(-4, 4), 3).fill({ color: 0xe8dcc0 });
      }
    }
  }),

  def('tree_fallen', 'Umgefallener Baum', 'baum', { w: 156, h: 148 }, ['baum', 'stamm', 'umgefallen'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    const len = rng.range(120, 145);
    const r = rng.range(9, 13);
    g.rect(-len / 2 + 3, -r + 3, len, r * 2).fill({ color: 0x000000, alpha: 0.22 });
    g.rect(-len / 2, -r, len, r * 2).fill({ color: c });
    g.rect(-len / 2, -r, len, r * 0.7).fill({ color: shade(c, 0.22), alpha: 0.6 });
    // Bruchstelle und Jahresringe an einem Ende.
    g.ellipse(-len / 2, 0, r * 0.5, r).fill({ color: shade(c, 0.3) });
    for (let i = 1; i <= 3; i++) {
      g.ellipse(-len / 2, 0, r * 0.5 * (i / 4), r * (i / 4)).stroke({
        width: 0.8,
        color: shade(c, -0.3),
        alpha: 0.6,
      });
    }
    strokes(g, rng, rng.int(5, 9), len * 0.4, len * 0.12, shade(c, -0.3), 1, 0.4);
    // Ein paar Äste, damit es nicht wie ein Balken aussieht.
    for (let i = 0; i < rng.int(2, 4); i++) {
      const x = rng.range(-len / 2 + 15, len / 2 - 10);
      const dir = rng.bool() ? -1 : 1;
      g.moveTo(x, r * dir * 0.6)
        .lineTo(x + rng.range(-12, 12), r * dir + dir * rng.range(10, 20))
        .stroke({ width: 3, color: shade(c, -0.15), cap: 'round' });
    }
  }),

  def('tree_uprooted', 'Entwurzelter Baum', 'baum', 120, ['baum', 'wurzel', 'umgefallen'], (g, rng) => {
    const c = jitterColor(PALETTE.woodDark, rng, 0.12);
    const erde = jitterColor(PALETTE.earthDark, rng, 0.14);
    // Wurzelteller: Erdscheibe mit herausstehenden Wurzeln.
    const pts = blob(rng, 34, 0.2, 20, rng.range(0.85, 1));
    shaded(g, pts, erde, { shadow: 3, highlight: 0.18, outline: 0.4 });
    for (let i = 0; i < rng.int(7, 12); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(20, 34);
      const len = rng.range(8, 18);
      g.moveTo(Math.cos(a) * d * 0.6, Math.sin(a) * d * 0.6)
        .lineTo(Math.cos(a) * (d + len), Math.sin(a) * (d + len))
        .stroke({ width: rng.range(1.5, 3.5), color: c, alpha: 0.9, cap: 'round' });
    }
    g.circle(0, 0, 11).fill({ color: shade(c, 0.2) });
  }),
];

// ---------------------------------------------------------------------------
// Wasser und Küste
// ---------------------------------------------------------------------------

export const waterProps: PropDef[] = [
  def('ripples', 'Wellen', 'boden', { w: 118, h: 100 }, ['wasser', 'welle', 'see'], (g, rng) => {
    const c = shade(PALETTE.water, 0.35);
    for (let i = 0; i < rng.int(5, 9); i++) {
      const y = rng.range(-40, 40);
      const x = rng.range(-40, 10);
      const len = rng.range(20, 50);
      const amp = rng.range(2, 4.5);
      g.moveTo(x, y);
      for (let s = 1; s <= 8; s++) {
        const px = x + (len * s) / 8;
        g.lineTo(px, y + Math.sin((s / 8) * Math.PI * 2) * amp);
      }
      g.stroke({ width: rng.range(1.2, 2.2), color: c, alpha: rng.range(0.35, 0.7) });
    }
  }),

  def('seaweed', 'Seetang', 'pflanze', 80, ['tang', 'wasser', 'meer'], (g, rng) => {
    for (let i = 0; i < rng.int(4, 8); i++) {
      const x = rng.range(-26, 26);
      const h = rng.range(24, 40);
      const c = jitterColor(0x3f6b4a, rng, 0.18);
      let px = x;
      let py = 32;
      g.moveTo(px, py);
      const steps = 5;
      for (let s = 1; s <= steps; s++) {
        px = x + Math.sin((s / steps) * Math.PI * rng.range(1.5, 2.5)) * 8;
        py = 32 - (h * s) / steps;
        g.lineTo(px, py);
      }
      g.stroke({ width: rng.range(2, 3.5), color: c, alpha: 0.85, cap: 'round' });
    }
  }),

  def('shells', 'Muscheln', 'deko', 70, ['muschel', 'strand', 'meer'], (g, rng) => {
    for (let i = 0; i < rng.int(3, 6); i++) {
      const x = spread(rng, 12);
      const y = spread(rng, 12);
      const r = rng.range(4, 8);
      const c = jitterColor(0xe6d5bd, rng, 0.12);
      const a = rng.range(0, Math.PI * 2);
      g.ellipse(x + 1, y + 1, r, r * 0.85).fill({ color: 0x000000, alpha: 0.2 });
      g.ellipse(x, y, r, r * 0.85).fill({ color: c });
      // Rippen als Fächer vom Wirbel aus.
      for (let k = -2; k <= 2; k++) {
        g.moveTo(x, y)
          .lineTo(x + Math.cos(a + k * 0.35) * r, y + Math.sin(a + k * 0.35) * r * 0.85)
          .stroke({ width: 0.7, color: shade(c, -0.3), alpha: 0.7 });
      }
    }
  }),

  def('coral', 'Koralle', 'pflanze', 70, ['koralle', 'riff', 'meer'], (g, rng) => {
    const c = jitterColor(rng.pick([0xc0603f, 0xb8557a, 0xcf8a3c]), rng, 0.12);
    const branch = (x: number, y: number, dir: number, len: number, w: number, depth: number) => {
      const nx = x + Math.cos(dir) * len;
      const ny = y + Math.sin(dir) * len;
      g.moveTo(x, y).lineTo(nx, ny).stroke({ width: w, color: c, alpha: 0.95, cap: 'round' });
      if (depth >= 3) return;
      const zweige = rng.int(2, 3);
      for (let i = 0; i < zweige; i++) {
        branch(nx, ny, dir + rng.range(-0.8, 0.8), len * rng.range(0.55, 0.75), w * 0.7, depth + 1);
      }
    };
    branch(0, 30, -Math.PI / 2 + rng.range(-0.2, 0.2), rng.range(12, 18), 5, 0);
  }),

  def('driftwood', 'Treibholz', 'deko', { w: 100, h: 82 }, ['holz', 'strand', 'treibgut'], (g, rng) => {
    const c = jitterColor(0x9c8f7a, rng, 0.14);
    const len = rng.range(70, 95);
    g.moveTo(-len / 2, 2);
    for (let s = 1; s <= 6; s++) {
      g.lineTo(-len / 2 + (len * s) / 6, rng.range(-6, 6));
    }
    g.stroke({ width: rng.range(5, 8), color: c, alpha: 1, cap: 'round' });
    strokes(g, rng, rng.int(4, 7), len * 0.35, len * 0.15, shade(c, -0.25), 0.9, 0.5);
  }),
];

// ---------------------------------------------------------------------------
// Überreste
// ---------------------------------------------------------------------------

export const remainsProps: PropDef[] = [
  def('skull', 'Schädel', 'deko', 40, ['schaedel', 'knochen', 'tod'], (g, rng) => {
    const c = jitterColor(PALETTE.bone, rng, 0.06);
    g.ellipse(1.5, 2, 13, 12).fill({ color: 0x000000, alpha: 0.24 });
    g.ellipse(0, 0, 13, 12).fill({ color: c });
    // Kiefer als schmalerer Fortsatz unten.
    g.ellipse(0, 10, 8, 5).fill({ color: shade(c, -0.08) });
    g.ellipse(-5, -2, 3.4, 4).fill({ color: 0x2a2622 });
    g.ellipse(5, -2, 3.4, 4).fill({ color: 0x2a2622 });
    g.poly([0, 3, -2.2, 7, 2.2, 7]).fill({ color: 0x2a2622 });
    g.ellipse(0, 0, 13, 12).stroke({ width: 1, color: shade(c, -0.35), alpha: 0.5 });
  }),

  def('skull_animal', 'Tierschädel', 'deko', { w: 56, h: 44 }, ['schaedel', 'tier', 'knochen'], (g, rng) => {
    const c = jitterColor(PALETTE.bone, rng, 0.06);
    g.ellipse(1.5, 2, 12, 9).fill({ color: 0x000000, alpha: 0.22 });
    // Langgezogener Schädel mit Hörnern — als Ziege oder Rind lesbar.
    g.poly([-12, -6, 4, -9, 14, 0, 4, 9, -12, 6]).fill({ color: c });
    g.ellipse(-6, -3, 3, 3.4).fill({ color: 0x2a2622 });
    g.ellipse(-6, 3, 3, 3.4).fill({ color: 0x2a2622 });
    for (const s of [-1, 1]) {
      g.moveTo(-8, 6 * s)
        .quadraticCurveTo(-20, 12 * s, -14, 19 * s)
        .stroke({ width: 3, color: shade(c, -0.12), cap: 'round' });
    }
  }),

  def('skeleton', 'Skelett', 'deko', { w: 110, h: 70 }, ['skelett', 'knochen', 'leiche', 'tod'], (g, rng) => {
    const c = jitterColor(PALETTE.bone, rng, 0.05);
    const knochen = (x1: number, y1: number, x2: number, y2: number, w = 3.2) => {
      g.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: w, color: c, alpha: 1, cap: 'round' });
    };
    // Liegend, leicht verdreht — ein exakt symmetrisches Skelett wirkt gestellt.
    const tilt = rng.range(-0.25, 0.25);
    g.ellipse(-38, tilt * 10, 9, 8).fill({ color: c });
    knochen(-28, tilt * 8, 18, tilt * -6, 4);
    for (let i = 0; i < 5; i++) {
      const x = -24 + i * 8;
      const y = tilt * (8 - i * 3);
      g.moveTo(x, y - 9).quadraticCurveTo(x + 3, y, x, y + 9).stroke({ width: 1.8, color: c });
    }
    knochen(-22, tilt * 6, -34, 22);
    knochen(-20, tilt * 4, -30, -20);
    knochen(18, tilt * -6, 36, 16);
    knochen(18, tilt * -6, 38, -12);
    strokes(g, rng, rng.int(2, 5), 30, 6, shade(c, -0.3), 1, 0.3);
  }),

  def('corpse', 'Gefallener', 'deko', { w: 110, h: 70 }, ['leiche', 'koerper', 'kampf', 'tod'], (g, rng) => {
    const stoff = jitterColor(PALETTE.cloth, rng, 0.16);
    const haut = 0xb08d6a;
    // Blut zuerst, damit die Gestalt darauf liegt.
    g.poly(blob(rng, 30, 0.35, 18, 0.6)).fill({ color: 0x6e1b1b, alpha: 0.55 });
    const pts = blob(rng, 26, 0.18, 18, 0.45);
    shaded(g, pts, stoff, { shadow: 2.5, highlight: 0.18, outline: 0.4 });
    g.circle(-30, rng.range(-6, 6), 8).fill({ color: haut });
    g.moveTo(20, -4).lineTo(38, rng.range(-14, 4)).stroke({ width: 5, color: stoff, cap: 'round' });
    g.moveTo(20, 6).lineTo(36, rng.range(-2, 16)).stroke({ width: 5, color: stoff, cap: 'round' });
  }),

  def('blood_pool', 'Blutlache', 'boden', { w: 122, h: 110 }, ['blut', 'lache', 'kampf'], (g, rng) => {
    const c = 0x6e1b1b;
    const pts = blob(rng, 40, 0.28, 22, rng.range(0.65, 1));
    g.poly(pts).fill({ color: c, alpha: 0.78 });
    g.poly(scalePts(pts, 0.7)).fill({ color: shade(c, -0.2), alpha: 0.5 });
    // Auslaufende Finger am Rand: eine reine Ellipse wirkt wie ein Teppich.
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(34, 50);
      g.poly(offset(blob(rng, rng.range(4, 9), 0.3, 10, 0.7), Math.cos(a) * d, Math.sin(a) * d)).fill({
        color: c,
        alpha: 0.6,
      });
    }
  }),

  def('eggs', 'Eier', 'deko', 54, ['ei', 'nest', 'tier'], (g, rng) => {
    // Nest als Ring aus Strichen, damit die Eier nicht in der Luft liegen.
    const nest = jitterColor(PALETTE.woodDark, rng, 0.15);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 16, Math.sin(a) * 13)
        .lineTo(Math.cos(a + 0.6) * 21, Math.sin(a + 0.6) * 17)
        .stroke({ width: 1.6, color: nest, alpha: 0.8 });
    }
    for (let i = 0; i < rng.int(2, 4); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(0, 7);
      const c = jitterColor(0xe0dccb, rng, 0.1);
      g.ellipse(Math.cos(a) * d + 1, Math.sin(a) * d + 1, 6, 7.5).fill({ color: 0x000000, alpha: 0.2 });
      g.ellipse(Math.cos(a) * d, Math.sin(a) * d, 6, 7.5).fill({ color: c });
      g.ellipse(Math.cos(a) * d - 1.5, Math.sin(a) * d - 2, 2.4, 3).fill({
        color: shade(c, 0.3),
        alpha: 0.7,
      });
    }
  }),
];
