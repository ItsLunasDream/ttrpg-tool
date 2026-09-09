/**
 * Fantasy-Props: Varianten vorhandener Gegenstände und neue Stücke.
 *
 * Zwei Sorten stehen hier bewusst nebeneinander. Zum einen *Varianten* — ein
 * offenes Fass, ein umgeworfener Stuhl, eine zerborstene Säule. Der Zufall in
 * `draw` verändert Farbe und Maserung, nicht aber den Zustand eines Dings; wer
 * eine geplünderte Kammer stellen will, braucht die kaputte Form als eigenes
 * Prop. Zum anderen Gegenstände, die es noch gar nicht gab und ohne die ein
 * Verlies leer wirkt: Amboss, Kessel, Runenkreis, Käfig.
 */

import type { PropDef } from '../propTypes';
import { def } from './defineProp';
import {
  PALETTE,
  band,
  bevel,
  blob,
  blocks,
  contactShadow,
  fabric,
  grain,
  jitterColor,
  scalePts,
  shade,
  shaded,
  star,
  strokes,
} from './draw';

// ---------------------------------------------------------------------------
// Varianten vorhandener Möbel und Behälter
// ---------------------------------------------------------------------------

export const variantProps: PropDef[] = [
  def('barrel_open', 'Fass offen', 'moebel', 56, ['fass', 'offen', 'lager'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    g.circle(2, 2.5, 24).fill({ color: 0x000000, alpha: 0.22 });
    g.circle(0, 0, 24).fill({ color: c });
    g.circle(0, 0, 24).stroke({ width: 2, color: shade(c, -0.4) });
    // Offen heißt: der Blick geht hinein. Dunkle Innenwand, Inhalt am Boden.
    g.circle(0, 0, 19).fill({ color: shade(c, -0.55) });
    g.circle(0, 0, 15).fill({ color: shade(c, -0.75) });
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(0, 11);
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(2.5, 4.5)).fill({
        color: jitterColor(0x9a8250, rng, 0.15),
      });
    }
    g.circle(0, 0, 21).stroke({ width: 2.5, color: PALETTE.metalDark, alpha: 0.8 });
  }),

  def('barrel_lying', 'Fass liegend', 'moebel', { w: 80, h: 50 }, ['fass', 'liegend', 'lager'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    g.roundRect(-36 + 2, -20 + 2.5, 72, 40, 12).fill({ color: 0x000000, alpha: 0.22 });
    g.roundRect(-36, -20, 72, 40, 12).fill({ color: c });
    g.roundRect(-36, -20, 72, 40, 12).stroke({ width: 2, color: shade(c, -0.4) });
    // Dauben längs, Reifen quer — so herum liegt ein Fass auf der Seite.
    for (let i = 1; i < 5; i++) {
      const y = -20 + (40 / 5) * i;
      g.moveTo(-34, y).lineTo(34, y).stroke({ width: 1, color: shade(c, -0.28), alpha: 0.55 });
    }
    for (const x of [-18, 18]) {
      g.moveTo(x, -19).lineTo(x, 19).stroke({ width: 3, color: PALETTE.metalDark, alpha: 0.85 });
    }
    g.ellipse(-33, 0, 5, 19).fill({ color: shade(c, 0.16) });
  }),

  def('barrels_stack', 'Fässer gestapelt', 'moebel', { w: 100, h: 80 }, ['fass', 'stapel', 'lager'], (g, rng) => {
    const zeichne = (x: number, y: number, r: number) => {
      const c = jitterColor(PALETTE.wood, rng, 0.12);
      g.circle(x + 2, y + 2.5, r).fill({ color: 0x000000, alpha: 0.22 });
      g.circle(x, y, r).fill({ color: c }).stroke({ width: 2, color: shade(c, -0.4) });
      g.circle(x, y, r * 0.7).stroke({ width: 2, color: PALETTE.metalDark, alpha: 0.8 });
      g.circle(x, y, r * 0.38).fill({ color: shade(c, 0.16) });
    };
    zeichne(-22, 14, 20);
    zeichne(20, 18, 18);
    zeichne(0, -18, 19);
  }),

  def('crate_open', 'Kiste offen', 'moebel', 60, ['kiste', 'offen', 'lager'], (g, rng) => {
    const c = jitterColor(PALETTE.woodLight, rng, 0.1);
    const s = 25;
    g.rect(-s + 2.5, -s + 3, s * 2, s * 2).fill({ color: 0x000000, alpha: 0.22 });
    g.rect(-s, -s, s * 2, s * 2).fill({ color: c }).stroke({ width: 2, color: shade(c, -0.4) });
    g.rect(-s + 5, -s + 5, s * 2 - 10, s * 2 - 10).fill({ color: shade(c, -0.6) });
    // Stroh und ein Bündel darin — sonst wäre die offene Kiste nur ein Rahmen.
    strokes(g, rng, 14, s * 0.7, 9, 0xbfa15e, 1.3, 0.75);
    g.roundRect(-9, -7, 18, 15, 2).fill({ color: jitterColor(0x8e7a52, rng, 0.12) });
    g.rect(-s, -s, s * 2, s * 2).stroke({ width: 3, color: shade(c, -0.35), alpha: 0.7 });
  }),

  def('chest_open', 'Truhe offen', 'moebel', 70, ['truhe', 'offen', 'schatz'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    // Der aufgeklappte Deckel steht hinter der Truhe, darum zuerst gezeichnet.
    g.roundRect(-32, -34, 62, 20, 3).fill({ color: shade(c, -0.25) });
    g.roundRect(-32, -34, 62, 20, 3).stroke({ width: 2, color: shade(c, -0.5) });
    g.roundRect(-30, -12, 60, 40, 3).fill({ color: 0x000000, alpha: 0.22 });
    g.roundRect(-32, -14, 62, 40, 3).fill({ color: c }).stroke({ width: 2, color: shade(c, -0.45) });
    g.roundRect(-26, -8, 50, 28, 2).fill({ color: shade(c, -0.65) });
    for (let i = 0; i < rng.int(5, 10); i++) {
      g.circle(rng.range(-22, 20), rng.range(-4, 16), rng.range(2, 3.6)).fill({
        color: rng.bool(0.7) ? 0xd9b64a : 0x9fd6e0,
      });
    }
    for (const x of [-22, 22]) {
      g.rect(x - 3, -14, 6, 40).fill({ color: PALETTE.metalDark, alpha: 0.85 });
    }
  }),

  def('chair_toppled', 'Stuhl umgeworfen', 'moebel', { w: 60, h: 44 }, ['stuhl', 'kaputt', 'kampf'], (g, rng) => {
    const c = jitterColor(PALETTE.woodLight, rng, 0.1);
    // Von oben liegt ein gekippter Stuhl schräg da, die Lehne daneben statt darüber.
    g.roundRect(-6, -14, 30, 28, 3).fill({ color: 0x000000, alpha: 0.2 });
    g.roundRect(-8, -16, 30, 28, 3).fill({ color: c }).stroke({ width: 1.8, color: shade(c, -0.4) });
    g.roundRect(-26, -10, 16, 22, 2).fill({ color: shade(c, -0.2) });
    g.roundRect(-26, -10, 16, 22, 2).stroke({ width: 1.4, color: shade(c, -0.45) });
    for (const [x, y] of [[18, -12], [18, 8]] as Array<[number, number]>) {
      g.rect(x, y, 12, 4).fill({ color: shade(c, -0.3) });
    }
    void rng;
  }),

  def('table_broken', 'Tisch zerbrochen', 'moebel', { w: 120, h: 80 }, ['tisch', 'kaputt', 'kampf'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.12);
    // Zwei Bruchstücke mit gezackter Kante dazwischen.
    g.poly([-56, -32, 4, -30, -6, 30, -54, 30]).fill({ color: c });
    g.poly([-56, -32, 4, -30, -6, 30, -54, 30]).stroke({ width: 2, color: shade(c, -0.42) });
    g.poly([12, -28, 54, -30, 56, 28, 2, 30]).fill({ color: shade(c, -0.08) });
    g.poly([12, -28, 54, -30, 56, 28, 2, 30]).stroke({ width: 2, color: shade(c, -0.42) });
    for (let i = 0; i < rng.int(3, 6); i++) {
      const x = rng.range(-6, 14);
      const y = rng.range(-26, 26);
      g.rect(x, y, rng.range(4, 10), rng.range(2, 4)).fill({ color: shade(c, -0.3) });
    }
  }),

  def('bookshelf_toppled', 'Regal umgestürzt', 'moebel', { w: 136, h: 74 }, ['regal', 'kaputt', 'buch'], (g, rng) => {
    const wood = jitterColor(PALETTE.woodDark, rng, 0.1);
    g.rect(-62, -26, 126, 50).fill({ color: 0x000000, alpha: 0.2 });
    g.rect(-64, -28, 126, 50).fill({ color: wood }).stroke({ width: 2, color: shade(wood, -0.4) });
    // Die Bücher liegen jetzt verstreut davor, nicht mehr im Fach.
    for (let i = 0; i < rng.int(8, 14); i++) {
      const x = rng.range(-60, 58);
      const y = rng.range(-22, 30);
      const w = rng.range(7, 13);
      const h = rng.range(4, 7);
      g.rect(x, y, w, h).fill({
        color: jitterColor([0x8a3b3b, 0x3b5a8a, 0x3b6b4a, 0x7a6a3b][i % 4], rng, 0.14),
      });
      g.rect(x, y, w, h).stroke({ width: 0.8, color: 0x2a2018, alpha: 0.6 });
    }
  }),

  def('rug_round', 'Teppich rund', 'deko', 110, ['teppich', 'rund', 'wohnen'], (g, rng) => {
    const c = jitterColor(0x7a3b3b, rng, 0.12);
    g.circle(0, 0, 48).fill({ color: c });
    g.circle(0, 0, 48).stroke({ width: 2, color: shade(c, -0.4) });
    g.circle(0, 0, 39).stroke({ width: 3, color: shade(c, 0.28), alpha: 0.7 });
    g.circle(0, 0, 22).fill({ color: shade(c, -0.2) });
    // Strahlen nach außen: Muster statt einfarbiger Scheibe.
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 24, Math.sin(a) * 24)
        .lineTo(Math.cos(a) * 37, Math.sin(a) * 37)
        .stroke({ width: 2.2, color: shade(c, 0.35), alpha: 0.6 });
    }
    // Fransen am Rand.
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 48, Math.sin(a) * 48)
        .lineTo(Math.cos(a) * 53, Math.sin(a) * 53)
        .stroke({ width: 1.2, color: shade(c, 0.4), alpha: 0.7 });
    }
  }),

  def('column_broken', 'Säule gebrochen', 'struktur', { w: 86, h: 90 }, ['saeule', 'ruine', 'kaputt'], (g, rng) => {
    const c = jitterColor(PALETTE.stone, rng, 0.1);
    g.circle(2, 2.5, 26).fill({ color: 0x000000, alpha: 0.22 });
    // Bruchkante statt runder Kappe: der Stumpf ist oben unregelmäßig.
    g.poly(blob(rng, 26, 0.16, 14)).fill({ color: c });
    g.poly(blob(rng, 26, 0.16, 14)).stroke({ width: 2, color: shade(c, -0.4) });
    g.poly(scalePts(blob(rng, 24, 0.2, 12), 0.72)).fill({ color: shade(c, -0.28) });
    strokes(g, rng, 5, 20, 12, shade(c, -0.45), 1.2, 0.5);
    // Ein paar Bruchstücke daneben.
    for (let i = 0; i < rng.int(2, 4); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(30, 40);
      g.poly(scalePts(blob(rng, rng.range(4, 7), 0.3, 8), 1)).fill({ color: shade(c, -0.12) });
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(3, 6)).fill({ color: shade(c, -0.1) });
    }
  }),

  def('statue_broken', 'Statue zerbrochen', 'dungeon', { w: 96, h: 80 }, ['statue', 'ruine', 'kaputt'], (g, rng) => {
    const c = jitterColor(0xb9b3a6, rng, 0.08);
    // Sockel steht, die Figur darauf ist bis zu den Beinen abgebrochen.
    g.rect(-24, 8, 48, 20).fill({ color: 0x000000, alpha: 0.2 });
    g.rect(-26, 4, 52, 22).fill({ color: shade(c, -0.2) });
    g.rect(-26, 4, 52, 22).stroke({ width: 2, color: shade(c, -0.45) });
    g.poly([-11, 4, -9, -14, 9, -16, 11, 4]).fill({ color: c });
    g.poly([-11, 4, -9, -14, 9, -16, 11, 4]).stroke({ width: 1.6, color: shade(c, -0.4) });
    // Die abgebrochene Hälfte liegt daneben.
    g.roundRect(rng.range(12, 18), rng.range(-30, -18), 28, 12, 5).fill({ color: shade(c, -0.06) });
    g.roundRect(rng.range(12, 18), rng.range(-30, -18), 28, 12, 5).stroke({
      width: 1.4,
      color: shade(c, -0.4),
    });
    strokes(g, rng, 4, 22, 10, shade(c, -0.4), 1, 0.4);
  }),

  def('tree_birch', 'Birke', 'baum', { w: 122, h: 118 }, ['baum', 'birke', 'wald'], (g, rng) => {
    // Hellere, kleinere Krone als der Laubbaum, dafür der helle Stamm.
    const krone = jitterColor(0x8ab04f, rng, 0.14);
    const pts = blob(rng, 44, 0.22, 20, rng.range(0.9, 1.1));
    shaded(g, pts, krone, { shadow: 4, highlight: 0.32, outline: 0.45 });
    g.poly(scalePts(pts, 0.6)).fill({ color: shade(krone, 0.22), alpha: 0.5 });
    g.circle(0, 0, 7).fill({ color: 0xe8e4d8 });
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      g.moveTo(Math.cos(a) * 3, Math.sin(a) * 3)
        .lineTo(Math.cos(a) * 6.5, Math.sin(a) * 6.5)
        .stroke({ width: 1.4, color: 0x3a352c, alpha: 0.8 });
    }
  }),

  def('tree_pine_slim', 'Nadelbaum schmal', 'baum', { w: 86, h: 84 }, ['baum', 'nadel', 'wald'], (g, rng) => {
    const c = jitterColor(PALETTE.pineDark, rng, 0.12);
    // Weniger, längere Spitzen als beim breiten Nadelbaum.
    const pts = star(rng, 34, 13, rng.int(7, 9));
    shaded(g, pts, c, { shadow: 3, highlight: 0.28, outline: 0.5 });
    g.poly(scalePts(pts, 0.55)).fill({ color: shade(c, 0.2), alpha: 0.55 });
    g.circle(0, 0, 4).fill({ color: shade(c, -0.5) });
  }),

  def('bush_flowering', 'Blühender Busch', 'pflanze', { w: 76, h: 78 }, ['busch', 'blume', 'garten'], (g, rng) => {
    const c = jitterColor(PALETTE.leaf, rng, 0.14);
    const pts = blob(rng, 26, 0.26, 18, rng.range(0.85, 1.15));
    shaded(g, pts, c, { shadow: 2.5, highlight: 0.28, outline: 0.45 });
    const bluete = [0xe8d15c, 0xd97fa8, 0xe0e0e8, 0xc98ae0][rng.int(0, 3)];
    for (let i = 0; i < rng.int(6, 12); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 20;
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(2, 3.4)).fill({ color: bluete });
    }
  }),

  def('mushrooms_glowing', 'Leuchtpilze', 'pflanze', { w: 78, h: 70 }, ['pilz', 'leucht', 'hoehle'], (g, rng) => {
    for (let i = 0; i < rng.int(4, 7); i++) {
      const x = rng.range(-20, 20);
      const y = rng.range(-16, 16);
      const r = rng.range(5, 9);
      g.circle(x, y, r * 2.1).fill({ color: 0x4fd6c0, alpha: 0.14 });
      g.moveTo(x - 1.6, y + r * 0.8).lineTo(x + 1.6, y + r * 0.8).lineTo(x + 1.1, y).lineTo(x - 1.1, y)
        .closePath().fill({ color: 0xd8d2c0 });
      g.ellipse(x, y, r, r * 0.72).fill({ color: 0x4fd6c0 });
      g.ellipse(x, y - r * 0.15, r * 0.6, r * 0.4).fill({ color: 0xaef2e6, alpha: 0.8 });
    }
  }),

  def('door_iron', 'Eisentür', 'struktur', { w: 90, h: 26 }, ['tuer', 'eisen', 'verlies'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.1);
    g.rect(-42, -10, 84, 20).fill({ color: c }).stroke({ width: 2, color: shade(c, -0.4) });
    for (const x of [-30, -10, 10, 30]) {
      g.rect(x - 3, -10, 6, 20).fill({ color: shade(c, 0.2) });
    }
    for (const x of [-36, 36]) {
      for (const y of [-6, 6]) g.circle(x, y, 2).fill({ color: shade(c, 0.4) });
    }
    g.circle(0, 0, 4).fill({ color: shade(c, -0.5) });
  }),

  def('door_barred', 'Gittertür', 'struktur', { w: 90, h: 26 }, ['tuer', 'gitter', 'zelle'], (g, rng) => {
    const c = jitterColor(PALETTE.metal, rng, 0.1);
    g.rect(-42, -10, 84, 20).stroke({ width: 3, color: shade(c, -0.35) });
    for (let i = 0; i < 7; i++) {
      const x = -36 + i * 12;
      g.moveTo(x, -10).lineTo(x, 10).stroke({ width: 3, color: c });
    }
    g.moveTo(-42, 0).lineTo(42, 0).stroke({ width: 2, color: shade(c, -0.2) });
  }),

  def('brazier_cold', 'Feuerschale kalt', 'dungeon', 54, ['feuer', 'schale', 'kalt'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.1);
    g.circle(2, 2.5, 22).fill({ color: 0x000000, alpha: 0.22 });
    g.circle(0, 0, 22).fill({ color: c }).stroke({ width: 2.4, color: shade(c, -0.4) });
    g.circle(0, 0, 16).fill({ color: shade(c, -0.55) });
    // Kalte Asche statt Glut — das ist der ganze Unterschied zur Feuerschale.
    for (let i = 0; i < rng.int(6, 11); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 13;
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(1.6, 3.4)).fill({
        color: jitterColor(0x8d8a84, rng, 0.2),
        alpha: 0.85,
      });
    }
  }),
];

// ---------------------------------------------------------------------------
// Neue Fantasy-Stücke
// ---------------------------------------------------------------------------

export const fantasyProps: PropDef[] = [
  def('rune_circle', 'Runenkreis', 'dungeon', 130, ['magie', 'rune', 'kreis'], (g, rng) => {
    const c = 0x7b6ce0;
    g.circle(0, 0, 56).stroke({ width: 2.5, color: c, alpha: 0.85 });
    g.circle(0, 0, 46).stroke({ width: 1.5, color: c, alpha: 0.6 });
    g.circle(0, 0, 28).stroke({ width: 2, color: c, alpha: 0.8 });
    // Pentagramm im Innenkreis: fünf Punkte, jeder mit dem übernächsten verbunden.
    const ecken: Array<[number, number]> = [];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      ecken.push([Math.cos(a) * 28, Math.sin(a) * 28]);
    }
    for (let i = 0; i < 5; i++) {
      const [x0, y0] = ecken[i];
      const [x1, y1] = ecken[(i + 2) % 5];
      g.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: 2, color: c, alpha: 0.9 });
    }
    // Runen als kurze Striche im Ring zwischen den Kreisen.
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = 51;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      for (let k = 0; k < rng.int(2, 4); k++) {
        const d = rng.range(0, Math.PI * 2);
        g.moveTo(x, y)
          .lineTo(x + Math.cos(d) * 3.5, y + Math.sin(d) * 3.5)
          .stroke({ width: 1.3, color: c, alpha: 0.75 });
      }
    }
  }),

  def('crystals', 'Kristalle', 'stein', 80, ['kristall', 'hoehle', 'magie'], (g, rng) => {
    const c = [0x7fd6e8, 0xc98ae0, 0x8ae0a0, 0xe0c07f][rng.int(0, 3)];
    // Ein Büschel aus vielen Spitzen unterschiedlicher Größe. Zwei einzelne
    // Zacken sahen aus wie kleine Nadelbäume — erst die Gruppe liest sich als
    // Kristall, und erst die dunkle Gegenfacette als Kristall statt Dreieck.
    const spitzen: Array<[number, number, number, number]> = [];
    for (let i = 0; i < rng.int(6, 9); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 20;
      spitzen.push([Math.cos(a) * d, Math.sin(a) * d + 6, rng.range(14, 32), rng.range(6, 11)]);
    }
    // Große zuerst, damit die kleinen davor stehen.
    spitzen.sort((a, b) => b[2] - a[2]);
    for (const [x, y, h, w] of spitzen) {
      g.poly([x - w, y, x - w * 0.35, y - h, x + w * 0.35, y - h * 0.92, x + w, y, x, y + w * 0.55])
        .fill({ color: c });
      g.poly([x + w * 0.35, y - h * 0.92, x + w, y, x, y + w * 0.55, x, y - h * 0.5]).fill({
        color: shade(c, -0.32),
      });
      g.poly([x - w, y, x - w * 0.35, y - h, x, y - h * 0.5, x, y + w * 0.55]).fill({
        color: shade(c, 0.4),
      });
      g.poly([x - w, y, x - w * 0.35, y - h, x + w * 0.35, y - h * 0.92, x + w, y, x, y + w * 0.55])
        .stroke({ width: 1.3, color: shade(c, -0.5), alpha: 0.85 });
    }
  }),

  def('anvil', 'Amboss', 'moebel', { w: 92, h: 50 }, ['amboss', 'schmiede', 'handwerk'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.08);
    /**
     * Von oben ist ein Amboss an drei Dingen zu erkennen: dem spitz
     * zulaufenden Horn, der geraden Bahn und dem eckigen Absatz hinten. Ein
     * abgerundetes Rechteck allein war nur ein grauer Klotz.
     */
    const umriss = [
      -44, 0, -30, -9, -12, -13, 22, -15, 38, -13, 38, 13, 22, 15, -12, 13, -30, 9,
    ];
    g.poly(umriss.map((v, i) => (i % 2 === 0 ? v + 2 : v + 2.5))).fill({
      color: 0x000000,
      alpha: 0.24,
    });
    g.poly(umriss).fill({ color: c });
    g.poly(umriss).stroke({ width: 2.2, color: shade(c, -0.5) });
    // Bahn als hellere Fläche, mit Kante zum Horn hin.
    g.roundRect(-8, -9, 42, 18, 2).fill({ color: shade(c, 0.28) });
    g.moveTo(-8, -9).lineTo(-8, 9).stroke({ width: 1.6, color: shade(c, -0.4), alpha: 0.8 });
    // Das runde Loch im Absatz — das Kennzeichen schlechthin.
    g.circle(28, 0, 3.5).fill({ color: shade(c, -0.6) });
    strokes(g, rng, 4, 16, 8, shade(c, -0.35), 1, 0.4);
  }),

  def('forge', 'Esse', 'moebel', 80, ['schmiede', 'feuer', 'handwerk'], (g, rng) => {
    const stein = jitterColor(PALETTE.stone, rng, 0.1);
    g.rect(-32, -30, 64, 62).fill({ color: 0x000000, alpha: 0.22 });
    g.rect(-34, -32, 64, 62).fill({ color: stein }).stroke({ width: 2, color: shade(stein, -0.42) });
    g.rect(-24, -22, 44, 42).fill({ color: 0x2a1c14 });
    // Glut mit Farbverlauf nach innen.
    g.ellipse(-2, -1, 17, 15).fill({ color: 0x8a2f14 });
    g.ellipse(-2, -1, 12, 10).fill({ color: 0xd0641e });
    g.ellipse(-2, -1, 6, 5).fill({ color: 0xf5c451 });
    for (let i = 0; i < rng.int(3, 7); i++) {
      g.circle(rng.range(-18, 14), rng.range(-16, 14), rng.range(1, 2.2)).fill({
        color: 0xffd98a,
        alpha: 0.85,
      });
    }
  }),

  def('cauldron', 'Kessel', 'moebel', { w: 68, h: 60 }, ['kessel', 'hexe', 'kueche'], (g, rng) => {
    const c = jitterColor(0x3a3a40, rng, 0.1);
    g.circle(2, 2.5, 25).fill({ color: 0x000000, alpha: 0.24 });
    g.circle(0, 0, 25).fill({ color: c }).stroke({ width: 2.4, color: shade(c, -0.45) });
    g.circle(0, 0, 19).fill({ color: shade(c, -0.6) });
    const brei = [0x5aa05a, 0x7b6ce0, 0x9a3b3b][rng.int(0, 2)];
    g.circle(0, 0, 16).fill({ color: brei });
    // Blasen an der Oberfläche.
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 12;
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(1.8, 3.6)).fill({
        color: shade(brei, 0.4),
        alpha: 0.9,
      });
    }
    // Henkel links und rechts.
    for (const dir of [-1, 1]) {
      g.circle(dir * 27, 0, 5).stroke({ width: 2.4, color: shade(c, 0.15) });
    }
  }),

  def('alchemy_table', 'Alchemietisch', 'moebel', { w: 140, h: 70 }, ['alchemie', 'labor', 'magie'], (g, rng) => {
    const c = jitterColor(PALETTE.woodDark, rng, 0.1);
    g.roundRect(-66, -28, 134, 60, 3).fill({ color: 0x000000, alpha: 0.22 });
    g.roundRect(-68, -30, 134, 60, 3).fill({ color: c }).stroke({ width: 2.4, color: shade(c, -0.42) });
    const farben = [0x5aa05a, 0x7b6ce0, 0xd06a4a, 0x4fbfd6, 0xd9b64a];
    for (let i = 0; i < rng.int(4, 7); i++) {
      const x = rng.range(-58, 54);
      const y = rng.range(-20, 18);
      const r = rng.range(4, 7);
      // Kolben: bauchiger Körper mit kurzem Hals.
      g.circle(x, y, r).fill({ color: 0xd8dee0, alpha: 0.85 });
      g.circle(x, y + r * 0.3, r * 0.7).fill({ color: farben[rng.int(0, farben.length - 1)] });
      g.rect(x - 1.4, y - r - 4, 2.8, 5).fill({ color: 0xd8dee0, alpha: 0.85 });
      g.circle(x, y, r).stroke({ width: 1, color: 0x8a9096, alpha: 0.8 });
    }
    g.roundRect(-64, -26, 24, 18, 2).fill({ color: jitterColor(0x8a6a3b, rng, 0.12) });
  }),

  def('weapon_rack', 'Waffenständer', 'moebel', { w: 110, h: 98 }, ['waffe', 'staender', 'wache'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    g.rect(-50, 6, 100, 18).fill({ color: 0x000000, alpha: 0.2 });
    g.rect(-52, 4, 100, 18).fill({ color: holz }).stroke({ width: 2, color: shade(holz, -0.42) });

    // Die Waffen müssen groß genug sein, um bei 100 px je Feld noch als
    // Schwert, Axt und Speer auseinanderzugehen — dünne Striche taten das nicht.
    const stiel = (x: number, oben: number) => {
      g.rect(x - 2.5, oben, 5, 22 - oben).fill({ color: 0x6d5533 });
      g.rect(x - 2.5, oben, 5, 22 - oben).stroke({ width: 1, color: 0x40301c, alpha: 0.8 });
    };
    const positionen = [-36, -12, 12, 34];
    for (let i = 0; i < positionen.length; i++) {
      const x = positionen[i] + rng.range(-2, 2);
      const art = (i + rng.int(0, 2)) % 3;
      if (art === 0) {
        // Schwert: breite Klinge, Parierstange, Knauf.
        stiel(x, -4);
        g.poly([x - 5, -6, x + 5, -6, x + 4, -30, x, -36, x - 4, -30]).fill({ color: PALETTE.metal });
        g.poly([x - 5, -6, x + 5, -6, x + 4, -30, x, -36, x - 4, -30]).stroke({
          width: 1.2,
          color: shade(PALETTE.metal, -0.45),
        });
        g.rect(x - 10, -8, 20, 4).fill({ color: 0xb59a4a });
        g.circle(x, 20, 3.5).fill({ color: 0xb59a4a });
      } else if (art === 1) {
        // Axt: großer Blattkopf an einer Seite.
        stiel(x, -30);
        g.moveTo(x + 2, -30)
          .quadraticCurveTo(x + 20, -24, x + 15, -8)
          .lineTo(x + 2, -12)
          .closePath()
          .fill({ color: PALETTE.metal });
        g.moveTo(x + 2, -30)
          .quadraticCurveTo(x + 20, -24, x + 15, -8)
          .lineTo(x + 2, -12)
          .closePath()
          .stroke({ width: 1.2, color: shade(PALETTE.metal, -0.45) });
      } else {
        // Speer: langer Schaft, schmale lange Spitze.
        stiel(x, -34);
        g.poly([x - 4, -32, x, -46, x + 4, -32]).fill({ color: PALETTE.metal });
        g.poly([x - 4, -32, x, -46, x + 4, -32]).stroke({
          width: 1.1,
          color: shade(PALETTE.metal, -0.45),
        });
      }
    }
  }),

  def('armour_stand', 'Rüstungsständer', 'moebel', 70, ['ruestung', 'staender', 'wache'], (g, rng) => {
    const m = jitterColor(PALETTE.metal, rng, 0.08);
    g.circle(2, 2.5, 30).fill({ color: 0x000000, alpha: 0.2 });
    const holz = shade(PALETTE.woodDark, 0);
    g.circle(0, 4, 28).fill({ color: holz });
    g.circle(0, 4, 28).stroke({ width: 2, color: shade(holz, -0.4) });

    // Von oben: zwei Schulterstücke und dazwischen der Helm. Damit das nicht
    // als Klecks liest, braucht der Helm einen Kamm und einen Sehschlitz.
    for (const dir of [-1, 1]) {
      g.ellipse(dir * 19, 6, 11, 15).fill({ color: m });
      g.ellipse(dir * 19, 6, 11, 15).stroke({ width: 1.6, color: shade(m, -0.45) });
      for (let i = 0; i < 3; i++) {
        g.ellipse(dir * 19, 0 + i * 6, 10 - i, 3).stroke({
          width: 1,
          color: shade(m, -0.3),
          alpha: 0.7,
        });
      }
    }
    g.circle(0, 0, 14).fill({ color: shade(m, 0.2) });
    g.circle(0, 0, 14).stroke({ width: 2, color: shade(m, -0.45) });
    g.rect(-2, -14, 4, 28).fill({ color: shade(m, 0.4) });
    g.rect(-11, -3, 22, 5).fill({ color: shade(m, -0.65) });
  }),

  def('cage', 'Käfig', 'dungeon', 80, ['kaefig', 'gefangen', 'verlies'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.08);
    g.circle(2, 2.5, 33).fill({ color: 0x000000, alpha: 0.24 });
    g.circle(0, 0, 33).fill({ color: 0x1d1813, alpha: 0.55 });
    g.circle(0, 0, 33).stroke({ width: 3, color: c });
    g.circle(0, 0, 22).stroke({ width: 2, color: c, alpha: 0.8 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 6, Math.sin(a) * 6)
        .lineTo(Math.cos(a) * 33, Math.sin(a) * 33)
        .stroke({ width: 2.4, color: c });
    }
    g.circle(0, 0, 6).fill({ color: shade(c, 0.2) });
    void rng;
  }),

  def('throne', 'Thron', 'moebel', { w: 80, h: 118 }, ['thron', 'sitz', 'halle'], (g, rng) => {
    const stein = jitterColor(0x6a6258, rng, 0.1);
    const stoff = jitterColor(0x7a2f3a, rng, 0.12);
    contactShadow(g, 34, 44, 2.5, 3);
    // Von oben: hohe Lehne oben, Sitzkissen unten, Armlehnen links und rechts.
    g.roundRect(-34, -44, 66, 84, 4).fill({ color: stein });
    blocks(g, rng, -34, -44, 66, 84, stein, 2, 4);
    g.roundRect(-34, -44, 66, 84, 4).stroke({ width: 2.4, color: shade(stein, -0.45) });
    bevel(g, -34, -44, 66, 84, stein, 0.24);
    // Rückenpolster mit Knopfheftung — das macht den Thron aus.
    fabric(g, rng, -24, -38, 46, 30, stoff, 3);
    g.rect(-24, -38, 46, 30).stroke({ width: 1.4, color: shade(stoff, -0.4) });
    for (const kx of [-14, 0, 14]) {
      for (const ky of [-30, -18]) {
        g.circle(kx, ky, 1.8).fill({ color: 0xd9b64a, alpha: 0.9 });
      }
    }
    // Sitzkissen, etwas heller und mit Kordel am Rand.
    fabric(g, rng, -24, -4, 46, 34, shade(stoff, 0.14), 3);
    g.roundRect(-24, -4, 46, 34, 2).stroke({ width: 2, color: 0xc7a24a, alpha: 0.85 });
    // Armlehnen mit geschnitztem Abschluss.
    for (const x of [-32, 24]) {
      g.roundRect(x, -8, 10, 42, 4).fill({ color: shade(stein, 0.16) });
      g.roundRect(x, -8, 10, 42, 4).stroke({ width: 1.4, color: shade(stein, -0.45) });
      g.circle(x + 5, 30, 4).fill({ color: shade(stein, 0.28) });
      g.circle(x + 5, 30, 2).fill({ color: 0xd9b64a, alpha: 0.8 });
    }
    // Krone über der Lehne.
    g.poly([-14, -44, -10, -54, -5, -46, 0, -58, 5, -46, 10, -54, 14, -44])
      .fill({ color: 0xd9b64a });
    g.poly([-14, -44, -10, -54, -5, -46, 0, -58, 5, -46, 10, -54, 14, -44])
      .stroke({ width: 1.2, color: 0x8a6c20, alpha: 0.9 });
    strokes(g, rng, rng.int(3, 6), 30, 8, shade(stein, -0.3), 1, 0.3);
  }),

  def('fireplace', 'Kamin', 'struktur', { w: 112, h: 60 }, ['kamin', 'feuer', 'wohnen'], (g, rng) => {
    const stein = jitterColor(PALETTE.stone, rng, 0.1);
    g.rect(-52, -26, 106, 52).fill({ color: stein }).stroke({ width: 2.4, color: shade(stein, -0.42) });
    g.rect(-34, -14, 70, 34).fill({ color: 0x241c16 });
    for (let i = 0; i < rng.int(3, 5); i++) {
      const x = rng.range(-24, 18);
      g.rect(x, rng.range(2, 12), rng.range(10, 20), 5).fill({
        color: jitterColor(PALETTE.woodDark, rng, 0.12),
      });
    }
    g.ellipse(0, 2, 22, 11).fill({ color: 0xd0641e, alpha: 0.85 });
    g.ellipse(0, 2, 13, 7).fill({ color: 0xf5c451 });
    // Sichtbare Quader in der Front.
    for (let i = 0; i < 5; i++) {
      const x = -52 + i * 21;
      g.moveTo(x, -26).lineTo(x, -14).stroke({ width: 1.2, color: shade(stein, -0.35), alpha: 0.6 });
    }
  }),

  def('candelabra', 'Kerzenleuchter', 'deko', 50, ['kerze', 'licht', 'halle'], (g, rng) => {
    const m = jitterColor(0xb59a4a, rng, 0.1);
    g.circle(2, 2.5, 18).fill({ color: 0x000000, alpha: 0.2 });
    g.circle(0, 0, 18).fill({ color: shade(m, -0.35) });
    g.circle(0, 0, 18).stroke({ width: 1.6, color: shade(m, -0.55) });
    const n = rng.int(3, 5);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * 11;
      const y = Math.sin(a) * 11;
      g.circle(x, y, 4.5).fill({ color: 0xf0ead6 });
      g.circle(x, y, 4.5).stroke({ width: 1, color: shade(m, -0.4) });
      g.circle(x, y, 2).fill({ color: 0xf5c451 });
      g.circle(x, y, 6.5).fill({ color: 0xffd98a, alpha: 0.18 });
    }
    g.circle(0, 0, 5).fill({ color: m });
  }),

  def('wall_torch', 'Wandfackel', 'deko', { w: 40, h: 56 }, ['fackel', 'licht', 'wand'], (g, rng) => {
    const halter = jitterColor(PALETTE.metalDark, rng, 0.1);
    g.rect(-4, 4, 8, 12).fill({ color: halter });
    g.circle(0, 0, 7).stroke({ width: 2.4, color: halter });
    g.circle(0, -2, 9).fill({ color: 0xd0641e, alpha: 0.55 });
    g.circle(0, -3, 5.5).fill({ color: 0xf5c451 });
    g.circle(0, -14, 14).fill({ color: 0xffd98a, alpha: 0.16 });
    void rng;
  }),

  def('banner', 'Wandbanner', 'deko', { w: 50, h: 90 }, ['banner', 'wappen', 'halle'], (g, rng) => {
    const c = jitterColor([0x7a2f3a, 0x2f4a7a, 0x2f6b45, 0x6b5a2f][rng.int(0, 3)], rng, 0.12);
    g.rect(-22, -40, 44, 4).fill({ color: 0x6d5533 });
    // Unten in zwei Zipfel auslaufend — daran erkennt man ein Banner.
    g.poly([-20, -36, 20, -36, 20, 32, 0, 22, -20, 32]).fill({ color: c });
    g.poly([-20, -36, 20, -36, 20, 32, 0, 22, -20, 32]).stroke({
      width: 1.6,
      color: shade(c, -0.45),
    });
    g.circle(0, -6, 11).fill({ color: shade(c, 0.3), alpha: 0.85 });
    g.circle(0, -6, 6).fill({ color: 0xd9b64a });
  }),

  def('tapestry', 'Wandteppich', 'deko', { w: 90, h: 72 }, ['teppich', 'wand', 'halle'], (g, rng) => {
    const c = jitterColor([0x5a3b6b, 0x3b5a6b, 0x6b4a3b][rng.int(0, 2)], rng, 0.12);
    g.rect(-40, -30, 80, 60).fill({ color: c }).stroke({ width: 2, color: shade(c, -0.45) });
    g.rect(-34, -24, 68, 48).stroke({ width: 2, color: shade(c, 0.35), alpha: 0.7 });
    for (let i = 0; i < rng.int(3, 6); i++) {
      const x = rng.range(-28, 22);
      const y = rng.range(-18, 14);
      g.circle(x, y, rng.range(4, 8)).fill({ color: shade(c, 0.25), alpha: 0.6 });
    }
    for (let i = 0; i < 14; i++) {
      const x = -40 + (i * 80) / 13;
      g.moveTo(x, 30).lineTo(x, 35).stroke({ width: 1.2, color: shade(c, 0.4), alpha: 0.75 });
    }
  }),

  def('market_stall', 'Marktstand', 'struktur', { w: 130, h: 100 }, ['markt', 'stand', 'stadt'], (g, rng) => {
    const holz = jitterColor(PALETTE.wood, rng, 0.1);
    const tuch = jitterColor([0xc4553f, 0x3f7ac4, 0x4fa05a][rng.int(0, 2)], rng, 0.12);
    g.roundRect(-58, -14, 118, 56, 3).fill({ color: 0x000000, alpha: 0.2 });
    g.roundRect(-60, -16, 118, 56, 3).fill({ color: holz });
    g.roundRect(-60, -16, 118, 56, 3).stroke({ width: 2.4, color: shade(holz, -0.42) });
    // Gestreifte Plane über dem Stand.
    for (let i = 0; i < 8; i++) {
      const x = -60 + i * 15;
      g.rect(x, -44, 15, 28).fill({ color: i % 2 === 0 ? tuch : shade(tuch, 0.4) });
    }
    g.rect(-60, -44, 118, 28).stroke({ width: 2, color: shade(tuch, -0.45) });
    for (let i = 0; i < rng.int(4, 8); i++) {
      g.circle(rng.range(-52, 48), rng.range(-8, 32), rng.range(3, 6)).fill({
        color: jitterColor([0xd06a2e, 0x8ab04f, 0xd9b64a][rng.int(0, 2)], rng, 0.15),
      });
    }
  }),

  def('sacks', 'Säcke', 'moebel', { w: 78, h: 70 }, ['sack', 'lager', 'vorrat'], (g, rng) => {
    contactShadow(g, 30, 26, 2, 3);
    const n = rng.int(2, 4);
    for (let i = 0; i < n; i++) {
      const x = rng.range(-14, 14);
      const y = rng.range(-12, 12);
      const c = jitterColor(0xa89468, rng, 0.12);
      const r = rng.range(12, 16);
      const pts = blob(rng, r, 0.16, 14, rng.range(0.85, 1.1));
      const verschoben = pts.map((v, k) => (k % 2 === 0 ? v + x : v + y));
      g.poly(verschoben).fill({ color: c });
      g.poly(verschoben).stroke({ width: 1.4, color: shade(c, -0.45) });
      // Grobes Gewebe: gekreuzte Striche, die den Sack als Leinen lesbar machen.
      for (let k = 0; k < 5; k++) {
        const gy = y - r * 0.7 + (k / 4) * r * 1.4;
        g.moveTo(x - r * 0.7, gy)
          .lineTo(x + r * 0.7, gy)
          .stroke({ width: 0.7, color: shade(c, -0.25), alpha: 0.45 });
      }
      for (let k = 0; k < 4; k++) {
        const gx = x - r * 0.6 + (k / 3) * r * 1.2;
        g.moveTo(gx, y - r * 0.65)
          .lineTo(gx, y + r * 0.65)
          .stroke({ width: 0.7, color: shade(c, -0.25), alpha: 0.35 });
      }
      g.poly(verschoben.map((v, k) => (k % 2 === 0 ? x + (v - x) * 0.55 - 2 : y + (v - y) * 0.55 - 2)))
        .fill({ color: shade(c, 0.2), alpha: 0.4 });
      // Abgebundener Hals mit ausgefranstem Zipfel.
      g.circle(x, y - r * 0.75, 3.5).fill({ color: shade(c, -0.15) });
      g.moveTo(x - 4.5, y - r * 0.75)
        .lineTo(x + 4.5, y - r * 0.75)
        .stroke({ width: 1.6, color: shade(c, -0.55) });
      for (let k = 0; k < 3; k++) {
        g.moveTo(x + rng.range(-3, 3), y - r * 0.8)
          .lineTo(x + rng.range(-5, 5), y - r * 0.8 - rng.range(3, 6))
          .stroke({ width: 1, color: shade(c, 0.15), alpha: 0.8 });
      }
    }
  }),

  def('rowboat', 'Ruderboot', 'struktur', { w: 130, h: 64 }, ['boot', 'wasser', 'ufer'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    g.poly([-60, 0, -34, -20, 34, -20, 60, 0, 34, 20, -34, 20]).fill({ color: 0x000000, alpha: 0.2 });
    g.poly([-62, -2, -36, -22, 36, -22, 62, -2, 36, 18, -36, 18]).fill({ color: c });
    g.poly([-62, -2, -36, -22, 36, -22, 62, -2, 36, 18, -36, 18]).stroke({
      width: 2.2,
      color: shade(c, -0.45),
    });
    g.poly([-50, -2, -30, -15, 30, -15, 50, -2, 30, 11, -30, 11]).fill({ color: shade(c, -0.45) });
    // Zwei Ruderbänke quer.
    for (const x of [-16, 16]) {
      g.rect(x - 3, -15, 6, 26).fill({ color: shade(c, 0.15) });
    }
    // Riemen, die über den Rand hängen.
    for (const dir of [-1, 1]) {
      g.moveTo(0, dir * 8).lineTo(rng.range(-30, 30), dir * 30).stroke({ width: 3, color: shade(c, -0.2) });
    }
  }),

  def('anchor', 'Anker', 'deko', { w: 70, h: 76 }, ['anker', 'schiff', 'hafen'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.1);
    g.moveTo(0, -28).lineTo(0, 22).stroke({ width: 5, color: c });
    g.moveTo(-16, -18).lineTo(16, -18).stroke({ width: 4, color: c });
    g.circle(0, -30, 6).stroke({ width: 4, color: c });
    // Die beiden Flunken als Bogen mit Spitzen.
    g.moveTo(-24, 6).quadraticCurveTo(-20, 26, 0, 28).quadraticCurveTo(20, 26, 24, 6)
      .stroke({ width: 4.5, color: c });
    g.poly([-24, 6, -30, 12, -18, 14]).fill({ color: c });
    g.poly([24, 6, 30, 12, 18, 14]).fill({ color: c });
    void rng;
  }),

  def('fishing_net', 'Netz', 'deko', 90, ['netz', 'fischer', 'hafen'], (g, rng) => {
    const c = jitterColor(0xa89468, rng, 0.1);
    const r = 38;
    // Zwei gedrehte Scharen kurzer Linien ergeben ein Maschenwerk.
    for (const winkel of [Math.PI / 4, -Math.PI / 4]) {
      for (let i = -5; i <= 5; i++) {
        const d = i * 8;
        const nx = Math.cos(winkel + Math.PI / 2) * d;
        const ny = Math.sin(winkel + Math.PI / 2) * d;
        const len = Math.sqrt(Math.max(0, r * r - d * d));
        g.moveTo(nx - Math.cos(winkel) * len, ny - Math.sin(winkel) * len)
          .lineTo(nx + Math.cos(winkel) * len, ny + Math.sin(winkel) * len)
          .stroke({ width: 1.4, color: c, alpha: 0.85 });
      }
    }
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * r;
      g.circle(Math.cos(a) * d, Math.sin(a) * d, 3).fill({ color: 0x8a6a3b });
    }
  }),

  def('giant_mushroom', 'Riesenpilz', 'pflanze', 104, ['pilz', 'riese', 'hoehle'], (g, rng) => {
    const hut = jitterColor([0xa03b3b, 0x8a6ab0, 0xb08d4a][rng.int(0, 2)], rng, 0.12);
    const pts = blob(rng, 40, 0.14, 20, rng.range(0.9, 1.05));
    shaded(g, pts, hut, { shadow: 5, highlight: 0.3, outline: 0.5 });
    for (let i = 0; i < rng.int(5, 9); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 30;
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(3.5, 7)).fill({
        color: 0xf0ead6,
        alpha: 0.85,
      });
    }
    g.circle(0, 0, 9).fill({ color: 0xd8d2c0 });
  }),

  def('thorns', 'Dornengestrüpp', 'pflanze', 100, ['dorn', 'ranke', 'hindernis'], (g, rng) => {
    const c = jitterColor(0x4a4030, rng, 0.12);
    for (let i = 0; i < rng.int(5, 9); i++) {
      let x = rng.range(-22, 22);
      let y = rng.range(-22, 22);
      let d = rng.range(0, Math.PI * 2);
      for (let k = 0; k < rng.int(4, 8); k++) {
        const len = rng.range(6, 11);
        // In den Ring zurückholen, statt ins Unendliche zu wachsen: eine Ranke,
        // die über den Rahmen hinausläuft, wird abgeschnitten.
        let nx = x + Math.cos(d) * len;
        let ny = y + Math.sin(d) * len;
        const weit = Math.hypot(nx, ny);
        if (weit > 42) {
          nx = (nx / weit) * 42;
          ny = (ny / weit) * 42;
          d += Math.PI * rng.range(0.4, 0.7);
        }
        g.moveTo(x, y).lineTo(nx, ny).stroke({ width: 1.8, color: c, alpha: 0.9 });
        // Dornen als kurze Stacheln quer zur Ranke.
        const q = d + Math.PI / 2;
        g.moveTo((x + nx) / 2, (y + ny) / 2)
          .lineTo((x + nx) / 2 + Math.cos(q) * 4, (y + ny) / 2 + Math.sin(q) * 4)
          .stroke({ width: 1.2, color: c, alpha: 0.85 });
        x = nx;
        y = ny;
        d += rng.range(-0.8, 0.8);
      }
    }
  }),

  def('roots', 'Wurzelwerk', 'boden', { w: 138, h: 134 }, ['wurzel', 'baum', 'boden'], (g, rng) => {
    const c = jitterColor(PALETTE.woodDark, rng, 0.12);
    const walk = (x: number, y: number, d: number, len: number, w: number, tiefe: number) => {
      let cx = x;
      let cy = y;
      for (let i = 0; i < 5; i++) {
        const nx = cx + Math.cos(d) * len * 0.2;
        const ny = cy + Math.sin(d) * len * 0.2;
        g.moveTo(cx, cy).lineTo(nx, ny).stroke({ width: w, color: c, alpha: 0.85, cap: 'round' });
        if (tiefe < 2 && rng.bool(0.4)) {
          walk(nx, ny, d + rng.range(-1, 1), len * 0.6, w * 0.6, tiefe + 1);
        }
        cx = nx;
        cy = ny;
        d += rng.range(-0.3, 0.3);
      }
    };
    for (let i = 0; i < rng.int(3, 5); i++) {
      // Die Länge ist die Summe über fünf Schritte à 20 %, plus Abzweige —
      // deshalb deutlich kleiner als der halbe Rahmen.
      walk(0, 0, (i / 4) * Math.PI * 2 + rng.range(-0.5, 0.5), rng.range(28, 42), 4, 0);
    }
    g.circle(0, 0, 7).fill({ color: shade(c, -0.2) });
  }),

  def('lava_crack', 'Lavariss', 'boden', 120, ['lava', 'riss', 'feuer'], (g, rng) => {
    let cx = rng.range(-32, -18);
    let cy = rng.range(-12, 12);
    let d = rng.range(-0.4, 0.4);
    const punkte: Array<[number, number]> = [[cx, cy]];
    for (let i = 0; i < 12; i++) {
      cx += Math.cos(d) * rng.range(4.5, 8);
      cy += Math.sin(d) * rng.range(4.5, 8);
      // Der Riss darf mäandern, aber nicht aus dem Rahmen laufen.
      cx = Math.max(-52, Math.min(52, cx));
      cy = Math.max(-52, Math.min(52, cy));
      punkte.push([cx, cy]);
      d += rng.range(-0.5, 0.5);
    }
    // Drei Lagen von außen nach innen: Schwelen, Glut, Kern.
    const lage = (breite: number, farbe: number, alpha: number) => {
      g.moveTo(punkte[0][0], punkte[0][1]);
      for (const [x, y] of punkte.slice(1)) g.lineTo(x, y);
      g.stroke({ width: breite, color: farbe, alpha, cap: 'round', join: 'round' });
    };
    lage(11, 0x3a1c10, 0.9);
    lage(7, 0xd0641e, 0.95);
    lage(3, 0xf5c451, 1);
  }),

  def('ice_spikes', 'Eiszapfen', 'stein', { w: 88, h: 80 }, ['eis', 'frost', 'hoehle'], (g, rng) => {
    const c = 0xbcd4e0;
    for (let i = 0; i < rng.int(4, 7); i++) {
      const x = rng.range(-28, 28);
      const y = rng.range(-24, 24);
      const r = rng.range(5, 10);
      g.circle(x, y, r * 1.6).fill({ color: c, alpha: 0.16 });
      g.circle(x, y, r).fill({ color: c, alpha: 0.85 });
      g.circle(x - r * 0.25, y - r * 0.25, r * 0.5).fill({ color: 0xe8f4fa, alpha: 0.9 });
      g.circle(x, y, r).stroke({ width: 1.2, color: 0x6f96a8, alpha: 0.7 });
    }
  }),

  def('web_sac', 'Spinnennest', 'dungeon', 70, ['spinne', 'netz', 'ei'], (g, rng) => {
    g.circle(0, 0, 30).fill({ color: 0xd8d4c8, alpha: 0.28 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.moveTo(0, 0).lineTo(Math.cos(a) * 30, Math.sin(a) * 30).stroke({
        width: 1,
        color: 0xe0dcd0,
        alpha: 0.6,
      });
    }
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 15;
      const r = rng.range(6, 10);
      g.ellipse(Math.cos(a) * d, Math.sin(a) * d, r, r * 0.8).fill({ color: 0xe8e2d0 });
      g.ellipse(Math.cos(a) * d, Math.sin(a) * d, r, r * 0.8).stroke({
        width: 1.2,
        color: 0x9a9384,
        alpha: 0.8,
      });
    }
  }),

  def('gallows', 'Galgen', 'struktur', { w: 90, h: 90 }, ['galgen', 'richtplatz', 'stadt'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    g.rect(-38, 26, 76, 12).fill({ color: shade(holz, -0.2) });
    g.rect(-34, -40, 12, 70).fill({ color: holz }).stroke({ width: 1.8, color: shade(holz, -0.45) });
    g.rect(-34, -42, 66, 12).fill({ color: holz }).stroke({ width: 1.8, color: shade(holz, -0.45) });
    // Strebe schräg in die Ecke, sonst sieht der Galgen aus wie ein Türrahmen.
    g.poly([-22, -30, -22, -20, -8, -30]).fill({ color: shade(holz, -0.15) });
    g.moveTo(20, -30).lineTo(20, -6).stroke({ width: 2, color: 0xc4b393 });
    g.circle(20, -2, 5).stroke({ width: 2, color: 0xc4b393 });
    void rng;
  }),

  def('grave_cross', 'Grabkreuz', 'deko', 50, ['grab', 'kreuz', 'friedhof'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.12);
    const neig = rng.range(-0.18, 0.18);
    const sx = Math.sin(neig);
    const sy = Math.cos(neig);
    g.moveTo(-sx * -20, -sy * -20).lineTo(-sx * 22, -sy * 22).stroke({ width: 5, color: holz });
    g.moveTo(-sy * -12 - sx * 6, sx * -12 - sy * 6)
      .lineTo(-sy * 12 - sx * 6, sx * 12 - sy * 6)
      .stroke({ width: 4.5, color: holz });
    g.ellipse(0, 18, 16, 7).fill({ color: 0x5a4d3a, alpha: 0.5 });
  }),

  def('trough', 'Trog', 'moebel', { w: 100, h: 44 }, ['trog', 'wasser', 'stall'], (g, rng) => {
    const c = jitterColor(PALETTE.woodDark, rng, 0.1);
    contactShadow(g, 47, 20, 2, 3);
    // Ausgehöhlter Stamm: dicke Wandung außen, Wasser innen, Reifen darum.
    g.roundRect(-48, -20, 94, 38, 6).fill({ color: c });
    grain(g, rng, -48, -20, 94, 38, shade(c, -0.3), 7, false, 0.3);
    g.roundRect(-48, -20, 94, 38, 6).stroke({ width: 2.4, color: shade(c, -0.5) });
    g.roundRect(-42, -14, 82, 26, 4).fill({ color: shade(c, -0.35) });
    g.roundRect(-40, -12, 78, 22, 3).fill({ color: PALETTE.water, alpha: 0.8 });
    // Spiegelung und ein paar Wellen, damit es nach Wasser aussieht.
    g.roundRect(-38, -10, 30, 6, 3).fill({ color: 0xffffff, alpha: 0.18 });
    for (let i = 0; i < rng.int(2, 4); i++) {
      const y = rng.range(-6, 6);
      g.moveTo(-32, y)
        .quadraticCurveTo(0, y - 3, 30, y)
        .stroke({ width: 1.2, color: shade(PALETTE.water, 0.4), alpha: 0.65 });
    }
    for (const x of [-30, 26]) band(g, x, -20, 6, 38, PALETTE.metalDark, 3);
    if (rng.bool(0.4)) {
      // Etwas Grünzeug am Rand: der Trog steht draußen.
      for (let i = 0; i < 5; i++) {
        const gx = rng.range(-44, 42);
        g.moveTo(gx, 18)
          .lineTo(gx + rng.range(-2, 2), 18 - rng.range(3, 7))
          .stroke({ width: 1.2, color: shade(PALETTE.grass, rng.range(-0.2, 0.1)), alpha: 0.8 });
      }
    }
  }),

  def('obelisk', 'Obelisk', 'dungeon', { w: 72, h: 74 }, ['obelisk', 'stein', 'kult'], (g, rng) => {
    const c = jitterColor(0x4a4650, rng, 0.1);
    contactShadow(g, 24, 24, 2.5, 3);
    // Sockelstufe, darauf der sich verjüngende Schaft — von oben zwei
    // Quadrate ineinander, und die Spitze als heller Kern.
    g.rect(-24, -24, 48, 48).fill({ color: shade(c, -0.28) });
    g.rect(-24, -24, 48, 48).stroke({ width: 2, color: shade(c, -0.55) });
    g.rect(-18, -18, 36, 36).fill({ color: c });
    g.poly([-18, -18, 18, -18, 12, -12, -12, -12]).fill({ color: shade(c, 0.22) });
    g.poly([18, -18, 18, 18, 12, 12, 12, -12]).fill({ color: shade(c, 0.12) });
    g.poly([-18, 18, 18, 18, 12, 12, -12, 12]).fill({ color: shade(c, -0.2) });
    g.rect(-18, -18, 36, 36).stroke({ width: 2, color: shade(c, -0.55) });
    g.rect(-12, -12, 24, 24).fill({ color: shade(c, 0.06) });
    // Eingemeißelte Zeichen, zeilenweise statt zufällig verstreut — Schrift
    // sieht anders aus als Kratzer.
    for (let zeile = 0; zeile < 4; zeile++) {
      const y = -9 + zeile * 6;
      for (let i = 0; i < rng.int(2, 4); i++) {
        const x = -8 + i * 5.5 + rng.range(-0.8, 0.8);
        g.moveTo(x, y)
          .lineTo(x + rng.range(-1.5, 1.5), y + 3.5)
          .stroke({ width: 1.3, color: 0x9b8ae0, alpha: 0.85 });
      }
    }
    g.rect(-12, -12, 24, 24).stroke({ width: 1.2, color: shade(c, -0.4), alpha: 0.7 });
  }),

  def('portal_arch', 'Torbogen', 'struktur', { w: 114, h: 60 }, ['portal', 'tor', 'magie'], (g, rng) => {
    const stein = jitterColor(PALETTE.stone, rng, 0.1);
    for (const dir of [-1, 1]) {
      g.rect(dir * 44 - 12, -26, 24, 52).fill({ color: stein });
      g.rect(dir * 44 - 12, -26, 24, 52).stroke({ width: 2, color: shade(stein, -0.42) });
    }
    // Das Feld dazwischen: schimmernd, nicht durchsichtig.
    g.rect(-32, -22, 64, 44).fill({ color: 0x6f5ad0, alpha: 0.5 });
    for (let i = 0; i < rng.int(3, 6); i++) {
      const y = rng.range(-20, 20);
      g.moveTo(-30, y).quadraticCurveTo(0, y + rng.range(-6, 6), 30, y).stroke({
        width: 1.6,
        color: 0xb7a8ff,
        alpha: 0.7,
      });
    }
    g.rect(-32, -22, 64, 44).stroke({ width: 1.6, color: 0xb7a8ff, alpha: 0.8 });
  }),
];
