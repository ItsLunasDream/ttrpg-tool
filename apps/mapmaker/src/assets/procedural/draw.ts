/**
 * Zeichenhelfer für prozedurale Props.
 *
 * Alles wird um (0,0) zentriert gezeichnet. Der Renderer backt jede Variante
 * einmal in eine Textur und setzt danach nur noch Sprites — das hält auch
 * zwanzigtausend Pinsel-Props in einem einzigen Batch.
 */

import type { Graphics } from 'pixi.js';
import type { Rng } from '@/model/rng';

// ---------------------------------------------------------------------------
// Farben
// ---------------------------------------------------------------------------

/** Verschiebt eine Farbe Richtung Schwarz (<0) oder Weiß (>0). */
export function shade(color: number, amount: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (t - c) * p) & 0xff;
  return (mix(r) << 16) | (mix(g) << 8) | mix(b);
}

/** Leichte, zufällige Farbabweichung — verhindert den Stempel-Look. */
export function jitterColor(color: number, rng: Rng, amount = 0.08): number {
  return shade(color, rng.range(-amount, amount));
}

export const PALETTE = {
  stoneLight: 0x9aa0a6,
  stone: 0x7c8288,
  stoneDark: 0x565b60,
  earth: 0x6b5a45,
  earthDark: 0x4a3d2f,
  woodLight: 0xa87f4f,
  wood: 0x8a6636,
  woodDark: 0x5d4425,
  leafLight: 0x6f9a4a,
  leaf: 0x557a35,
  leafDark: 0x3c5a24,
  pine: 0x47703c,
  pineDark: 0x2f4d28,
  grass: 0x7fa352,
  water: 0x4a7f9c,
  metal: 0x8d939a,
  metalDark: 0x5a6068,
  cloth: 0x9c4b3c,
  bone: 0xded6c2,
  fire: 0xf0a33c,
} as const;

// ---------------------------------------------------------------------------
// Formen
// ---------------------------------------------------------------------------

/**
 * Organisches, geschlossenes Polygon. Der Radius wird aus drei überlagerten
 * Sinuswellen moduliert — das ergibt weiche, natürlich wirkende Umrisse,
 * anders als rein zufällige Radien, die zackig aussehen.
 */
export function blob(
  rng: Rng,
  radius: number,
  wobble = 0.18,
  count = 22,
  squash = 1,
): number[] {
  const p1 = rng.range(0, Math.PI * 2);
  const p2 = rng.range(0, Math.PI * 2);
  const p3 = rng.range(0, Math.PI * 2);
  const a1 = rng.range(0.5, 1) * wobble;
  const a2 = rng.range(0.3, 0.7) * wobble;
  const a3 = rng.range(0.15, 0.4) * wobble;

  const pts: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r =
      radius * (1 + a1 * Math.sin(2 * a + p1) + a2 * Math.sin(3 * a + p2) + a3 * Math.sin(5 * a + p3));
    pts.push(Math.cos(a) * r, Math.sin(a) * r * squash);
  }
  return pts;
}

/** Sternförmiges Polygon — Basis für Nadelbäume von oben. */
export function star(rng: Rng, outer: number, inner: number, spikes: number): number[] {
  const phase = rng.range(0, Math.PI * 2);
  const pts: number[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = phase + (i / (spikes * 2)) * Math.PI * 2;
    const r = (i % 2 === 0 ? outer : inner) * rng.range(0.88, 1.12);
    pts.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  return pts;
}

/** Verschiebt ein Punktarray. */
export function offset(pts: number[], dx: number, dy: number): number[] {
  const out = new Array<number>(pts.length);
  for (let i = 0; i < pts.length; i += 2) {
    out[i] = pts[i] + dx;
    out[i + 1] = pts[i + 1] + dy;
  }
  return out;
}

/**
 * Zeichnet eine Form mit Schlagschatten, Grundfarbe und Glanzlicht.
 * Das ist der Look, der prozedurale Props von flachen Farbklecksen unterscheidet.
 */
export function shaded(
  g: Graphics,
  pts: number[],
  color: number,
  opts: { shadow?: number; highlight?: number; outline?: number } = {},
): void {
  const shadowDist = opts.shadow ?? 2;
  if (shadowDist > 0) {
    g.poly(offset(pts, shadowDist, shadowDist)).fill({ color: 0x000000, alpha: 0.22 });
  }
  g.poly(pts).fill({ color });
  if (opts.highlight !== undefined && opts.highlight > 0) {
    g.poly(offset(scalePts(pts, 0.72), -shadowDist * 0.8, -shadowDist * 0.8)).fill({
      color: shade(color, opts.highlight),
      alpha: 0.55,
    });
  }
  if (opts.outline !== undefined) {
    g.poly(pts).stroke({ width: 1.5, color: shade(color, -0.45), alpha: opts.outline });
  }
}

export function scalePts(pts: number[], factor: number): number[] {
  const out = new Array<number>(pts.length);
  for (let i = 0; i < pts.length; i++) out[i] = pts[i] * factor;
  return out;
}

/** Ein paar kurze Striche als Textur — Maserung, Risse, Grashalme. */
export function strokes(
  g: Graphics,
  rng: Rng,
  count: number,
  spread: number,
  length: number,
  color: number,
  width = 1.2,
  alpha = 0.4,
): void {
  for (let i = 0; i < count; i++) {
    const a = rng.range(0, Math.PI * 2);
    const d = Math.sqrt(rng.next()) * spread;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const dir = rng.range(0, Math.PI * 2);
    const len = length * rng.range(0.6, 1.4);
    g.moveTo(x, y)
      .lineTo(x + Math.cos(dir) * len, y + Math.sin(dir) * len)
      .stroke({ width, color, alpha });
  }
}

// ---------------------------------------------------------------------------
// Material und Aufsicht
// ---------------------------------------------------------------------------
//
// Was ein Prop von einem Farbklecks unterscheidet, ist nicht die Umrissform —
// die stimmt meist schon —, sondern drei Dinge, die von Hand jedes Mal neu
// getippt würden und darum hier stehen:
//
// 1. **Material**: Holz hat Maserung und Fugen, Stoff hat Falten, Metall hat
//    Nieten. Ohne das sieht eine Kiste aus wie ein braunes Quadrat.
// 2. **Aufsicht**: die Karte wird von oben gesehen. Ein Stuhl ist keine
//    Scheibe, sondern Sitzfläche, Lehne und vier Beine, die darunter
//    hervorschauen.
// 3. **Bodenkontakt**: ein weicher Schatten darunter setzt das Ding auf den
//    Boden. Pixi kann keinen Weichzeichner, also übereinandergelegte Ellipsen
//    mit fallender Deckkraft — der Unterschied ist erstaunlich groß.

/**
 * Weicher Bodenschatten.
 *
 * Vier Ellipsen statt einer: eine einzelne harte Ellipse liest sich wie ein
 * zweites Objekt unter dem Prop, gestapelte wie ein Verlauf.
 *
 * Die Ringe wachsen bewusst nach *innen*, nicht nach außen. Der erste Entwurf
 * legte sie außen herum — und weil die Textur genau auf `def.size`
 * zugeschnitten wird, schnitt der Rahmen den weichen Rand glatt ab: statt
 * eines Schattens lag ein Rechteck mit sichtbarer Kante unter dem Prop. Wer
 * hier etwas ändert, prüfe `tests/propLibrary.test.ts` — dort steht die
 * Grenze.
 */
export function contactShadow(
  g: Graphics,
  rx: number,
  ry: number,
  dx = 2,
  dy = 3,
  alpha = 0.3,
): void {
  for (let i = 0; i < 4; i++) {
    const f = 1 - i * 0.13;
    g.ellipse(dx * (1 - i * 0.25), dy * (1 - i * 0.25), rx * f, ry * f)
      .fill({ color: 0x000000, alpha: alpha * 0.3 });
  }
}

/** Maserung: kurze, fast parallele Striche innerhalb eines Rechtecks. */
export function grain(
  g: Graphics,
  rng: Rng,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  count = 6,
  vertical = false,
  alpha = 0.25,
): void {
  for (let i = 0; i < count; i++) {
    if (vertical) {
      const gx = x + rng.range(0.08, 0.92) * w;
      const y0 = y + rng.range(0, 0.35) * h;
      g.moveTo(gx, y0)
        .lineTo(gx + rng.range(-1, 1), y0 + rng.range(0.35, 0.75) * h)
        .stroke({ width: rng.range(0.6, 1.3), color, alpha });
    } else {
      const gy = y + rng.range(0.08, 0.92) * h;
      const x0 = x + rng.range(0, 0.35) * w;
      g.moveTo(x0, gy)
        .lineTo(x0 + rng.range(0.35, 0.75) * w, gy + rng.range(-1, 1))
        .stroke({ width: rng.range(0.6, 1.3), color, alpha });
    }
  }
}

/**
 * Bretter mit Fuge, je Brett leicht anders getönt.
 *
 * Der Ton je Brett ist das Entscheidende: gleichmäßig eingefärbte Bretter mit
 * Trennlinie sehen aus wie ein Gitter über einer Fläche, unterschiedlich
 * getönte wie Holz.
 */
export function planks(
  g: Graphics,
  rng: Rng,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  count = 4,
  vertical = false,
): void {
  const n = Math.max(1, count);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const c = shade(color, rng.range(-0.09, 0.09));
    if (vertical) {
      const bw = w / n;
      g.rect(x + t * w, y, bw, h).fill({ color: c });
      grain(g, rng, x + t * w, y, bw, h, shade(color, -0.3), 2, true, 0.22);
      if (i > 0) {
        g.moveTo(x + t * w, y).lineTo(x + t * w, y + h)
          .stroke({ width: 1, color: shade(color, -0.42), alpha: 0.7 });
      }
    } else {
      const bh = h / n;
      g.rect(x, y + t * h, w, bh).fill({ color: c });
      grain(g, rng, x, y + t * h, w, bh, shade(color, -0.3), 2, false, 0.22);
      if (i > 0) {
        g.moveTo(x, y + t * h).lineTo(x + w, y + t * h)
          .stroke({ width: 1, color: shade(color, -0.42), alpha: 0.7 });
      }
    }
  }
}

/** Nieten entlang einer Strecke — für Beschläge und Bänder. */
export function rivets(
  g: Graphics,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  count: number,
  radius = 1.4,
  color = 0xd8dde3,
): void {
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    g.circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, radius).fill({ color, alpha: 0.85 });
    g.circle(x0 + (x1 - x0) * t - 0.4, y0 + (y1 - y0) * t - 0.4, radius * 0.5)
      .fill({ color: 0xffffff, alpha: 0.5 });
  }
}

/** Metallbeschlag mit Nieten; waagerecht oder senkrecht. */
export function band(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number = PALETTE.metalDark,
  nieten = 2,
): void {
  g.rect(x, y, w, h).fill({ color });
  g.rect(x, y, w, Math.max(1, h * 0.32)).fill({ color: shade(color, 0.3), alpha: 0.6 });
  if (nieten > 0) {
    if (w > h) rivets(g, x + h, y + h / 2, x + w - h, y + h / 2, nieten, Math.min(1.6, h * 0.3));
    else rivets(g, x + w / 2, y + w, x + w / 2, y + h - w, nieten, Math.min(1.6, w * 0.3));
  }
}

/**
 * Glanzkante oben links, Schattenkante unten rechts.
 *
 * Zwei Striche, die aus einer Fläche einen Körper machen — ohne sie bleibt
 * jedes Rechteck ein Aufkleber.
 */
export function bevel(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  strength = 0.28,
): void {
  g.moveTo(x + 1, y + h - 1).lineTo(x + 1, y + 1).lineTo(x + w - 1, y + 1)
    .stroke({ width: 1.6, color: shade(color, strength), alpha: 0.75 });
  g.moveTo(x + w - 1, y + 1).lineTo(x + w - 1, y + h - 1).lineTo(x + 1, y + h - 1)
    .stroke({ width: 1.6, color: shade(color, -strength), alpha: 0.7 });
}

/** Stoff mit Falten: Grundfläche, ein paar Faltenlinien, ein Glanz. */
export function fabric(
  g: Graphics,
  rng: Rng,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  falten = 4,
): void {
  g.rect(x, y, w, h).fill({ color });
  for (let i = 0; i < falten; i++) {
    const fy = y + ((i + 0.7) / falten) * h + rng.range(-2, 2);
    g.moveTo(x + rng.range(0.02, 0.15) * w, fy)
      .quadraticCurveTo(x + w / 2, fy + rng.range(-3, 3), x + rng.range(0.85, 0.98) * w, fy)
      .stroke({ width: rng.range(0.8, 1.6), color: shade(color, -0.25), alpha: 0.55 });
  }
  g.rect(x + w * 0.06, y + h * 0.05, w * 0.3, h * 0.12)
    .fill({ color: shade(color, 0.3), alpha: 0.28 });
}

/**
 * Beine eines Möbels, wie sie in der Aufsicht unter der Platte hervorschauen.
 *
 * Sie liegen *hinter* der Platte, also zuerst zeichnen. Genau daran erkennt
 * man von oben einen Tisch — sonst ist es eine Platte auf dem Boden.
 */
export function legs(
  g: Graphics,
  halbBreite: number,
  halbHoehe: number,
  dicke: number,
  color: number,
): void {
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      g.roundRect(
        sx * halbBreite - (sx > 0 ? 0 : dicke),
        sy * halbHoehe - (sy > 0 ? 0 : dicke),
        dicke,
        dicke,
        dicke * 0.3,
      ).fill({ color: shade(color, -0.35) });
    }
  }
}

/**
 * Steinquader in einem Rechteck — versetzt wie echtes Mauerwerk.
 *
 * Ohne Versatz sieht es aus wie kariertes Papier; erst der halbe Versatz je
 * Reihe liest sich als gemauert.
 */
export function blocks(
  g: Graphics,
  rng: Rng,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  cols = 3,
  rows = 2,
): void {
  const bh = h / rows;
  for (let r = 0; r < rows; r++) {
    const versatz = r % 2 === 0 ? 0 : w / cols / 2;
    for (let c = -1; c <= cols; c++) {
      const bx = x + c * (w / cols) + versatz;
      const bw = w / cols;
      const x0 = Math.max(x, bx);
      const x1 = Math.min(x + w, bx + bw);
      if (x1 - x0 < 1) continue;
      g.rect(x0 + 0.5, y + r * bh + 0.5, x1 - x0 - 1, bh - 1)
        .fill({ color: shade(color, rng.range(-0.07, 0.07)) });
    }
  }
}

/**
 * Gaußsche Streuung mit Grenze.
 *
 * `rng.gaussian()` ist unbegrenzt: bei einem von hundert Seeds landet ein
 * Kiesel drei Sigma weit draußen, und weil die Textur genau auf `def.size`
 * zugeschnitten wird, ragte er über den Rahmen und wurde abgeschnitten — oder
 * die Größe musste dem Ausreißer folgen, und das Prop bekam einen breiten
 * leeren Rand. Beides ist unschön; die Grenze löst beides.
 */
export function spread(rng: Rng, sigma: number, limit = 2.1): number {
  const g = rng.gaussian();
  return Math.max(-limit, Math.min(limit, g)) * sigma;
}
