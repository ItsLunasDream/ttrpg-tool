/**
 * Nachgereichte Props: Einrichtung, Dungeon, Natur, Hof und Beiwerk.
 *
 * Eigene Datei, weil die Sammlung sonst niemand mehr überblickt — und weil sie
 * durchweg mit den Materialhelfern aus `draw.ts` gebaut ist. Wer hier eine
 * neue Zeichnung anfängt, hat die drei Fragen aus jenem Kopfkommentar zu
 * beantworten: Woraus ist das Ding, wie sieht es *von oben* aus, und steht es
 * auf dem Boden?
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
  legs,
  offset,
  planks,
  shade,
  strokes,
} from './draw';

// ---------------------------------------------------------------------------
// Einrichtung
// ---------------------------------------------------------------------------

export const extraFurniture: PropDef[] = [
  def('desk', 'Schreibtisch', 'moebel', { w: 150, h: 76 }, ['tisch', 'schreiben', 'studier'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    contactShadow(g, 62, 32, 3, 4);
    legs(g, 62, 30, 8, c);
    planks(g, rng, -64, -32, 128, 64, c, 4);
    g.rect(-64, -32, 128, 64).stroke({ width: 2.2, color: shade(c, -0.45) });
    bevel(g, -64, -32, 128, 64, c, 0.22);
    // Was darauf liegt, macht den Schreibtisch aus: Pergament, Tintenfass,
    // Feder, eine Kerze.
    g.rect(-40, -20, 34, 26).fill({ color: 0xe6ddc4 });
    g.rect(-40, -20, 34, 26).stroke({ width: 0.8, color: 0xbfb391, alpha: 0.9 });
    for (let i = 0; i < 4; i++) {
      g.rect(-36, -16 + i * 5, rng.range(14, 26), 1.4).fill({ color: 0x5a4a34, alpha: 0.7 });
    }
    g.circle(6, -14, 5).fill({ color: PALETTE.metalDark });
    g.circle(6, -14, 3).fill({ color: 0x141a2a });
    g.moveTo(9, -18).lineTo(24, -28).stroke({ width: 2, color: 0xf2eee0 });
    g.circle(30, 8, 4.5).fill({ color: 0xe8e1cc });
    g.circle(30, 8, 1.8).fill({ color: PALETTE.fire });
    g.roundRect(-6, 10, 30, 14, 2).fill({ color: shade(c, -0.22) });
  }),

  def('stool', 'Hocker', 'moebel', 34, ['hocker', 'sitz', 'taverne'], (g, rng) => {
    const c = jitterColor(PALETTE.woodLight, rng, 0.12);
    contactShadow(g, 13, 13, 1.5, 2);
    for (let i = 0; i < 3; i++) {
      const a = rng.range(0, 1) + (i / 3) * Math.PI * 2;
      g.circle(Math.cos(a) * 13, Math.sin(a) * 13, 3.4).fill({ color: shade(c, -0.4) });
    }
    g.circle(0, 0, 13).fill({ color: c });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 3, Math.sin(a) * 3)
        .lineTo(Math.cos(a) * 12, Math.sin(a) * 12)
        .stroke({ width: 0.9, color: shade(c, -0.3), alpha: 0.5 });
    }
    g.circle(0, 0, 13).stroke({ width: 1.6, color: shade(c, -0.45) });
    g.arc(0, 0, 10, Math.PI * 1.1, Math.PI * 1.7).stroke({ width: 2, color: 0xffffff, alpha: 0.15 });
  }),

  def('bench', 'Bank', 'moebel', { w: 160, h: 40 }, ['bank', 'sitz', 'halle'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    contactShadow(g, 68, 17, 2.5, 3);
    for (const x of [-58, 0, 58]) g.rect(x - 5, 13, 10, 6).fill({ color: shade(c, -0.4) });
    planks(g, rng, -68, -16, 136, 32, c, 2);
    g.rect(-68, -16, 136, 32).stroke({ width: 2, color: shade(c, -0.45) });
    bevel(g, -68, -16, 136, 32, c, 0.24);
  }),

  def('wardrobe', 'Schrank', 'moebel', { w: 94, h: 52 }, ['schrank', 'kleider', 'moebel'], (g, rng) => {
    const c = jitterColor(PALETTE.woodDark, rng, 0.1);
    contactShadow(g, 44, 22, 2.5, 3);
    planks(g, rng, -44, -22, 88, 44, c, 3, true);
    // Von oben sieht man den Korpus und die Kante der beiden Türen.
    g.rect(-44, 12, 88, 10).fill({ color: shade(c, 0.16) });
    g.moveTo(0, 12).lineTo(0, 22).stroke({ width: 1.6, color: shade(c, -0.5) });
    for (const x of [-5, 5]) g.circle(x, 17, 1.8).fill({ color: 0xd9b64a });
    g.rect(-44, -22, 88, 44).stroke({ width: 2.2, color: shade(c, -0.5) });
    bevel(g, -44, -22, 88, 44, c, 0.2);
  }),

  def('shelf_crates', 'Lagerregal', 'moebel', { w: 134, h: 48 }, ['regal', 'lager', 'kiste'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    contactShadow(g, 64, 21, 2.5, 3);
    g.rect(-64, -21, 128, 42).fill({ color: holz });
    g.rect(-64, -21, 128, 42).stroke({ width: 2, color: shade(holz, -0.45) });
    // Fächer, in denen Kisten und Säcke stehen.
    for (let i = 0; i < 4; i++) {
      const x = -60 + i * 31;
      g.rect(x, -17, 27, 34).fill({ color: shade(holz, -0.28) });
      const art = rng.int(0, 2);
      if (art === 0) {
        const c = jitterColor(PALETTE.woodLight, rng, 0.12);
        g.rect(x + 3, -13, 21, 26).fill({ color: c });
        grain(g, rng, x + 3, -13, 21, 26, shade(c, -0.3), 3, true, 0.3);
        g.rect(x + 3, -13, 21, 26).stroke({ width: 1, color: shade(c, -0.45) });
      } else if (art === 1) {
        g.poly(offset(blob(rng, 11, 0.2, 14, 1.1), x + 13.5, 0)).fill({ color: 0xbfae86 });
        g.poly(offset(blob(rng, 11, 0.2, 14, 1.1), x + 13.5, 0))
          .stroke({ width: 1, color: 0x8e8060, alpha: 0.8 });
      } else {
        for (const [dx, dy] of [[7, -6], [17, -4], [12, 7]]) {
          g.circle(x + dx, dy, 5).fill({ color: jitterColor(PALETTE.wood, rng, 0.14) });
          g.circle(x + dx, dy, 2).fill({ color: shade(PALETTE.woodDark, -0.2) });
        }
      }
    }
  }),

  def('dining_set', 'Gedeck', 'moebel', 60, ['teller', 'essen', 'gedeck'], (g, rng) => {
    const holz = jitterColor(PALETTE.wood, rng, 0.08);
    contactShadow(g, 24, 24, 1.5, 2);
    g.circle(0, 0, 24).fill({ color: holz });
    g.circle(0, 0, 24).stroke({ width: 1.4, color: shade(holz, -0.4), alpha: 0.7 });
    // Teller mit Rand, Becher, Besteck, ein Laib Brot.
    g.circle(-2, 0, 12).fill({ color: 0xd9d2c2 });
    g.circle(-2, 0, 12).stroke({ width: 1.2, color: 0xa9a08c });
    g.circle(-2, 0, 8).fill({ color: 0xc4bba7 });
    g.circle(-2, 0, 4).fill({ color: shade(0x8a5a34, rng.range(-0.1, 0.1)), alpha: 0.9 });
    g.circle(14, -12, 5).fill({ color: PALETTE.metal });
    g.circle(14, -12, 3.4).fill({ color: 0x53331f });
    g.moveTo(-19, -9).lineTo(-15, 9).stroke({ width: 1.8, color: PALETTE.metal });
    g.ellipse(13, 11, 7, 5).fill({ color: 0xc79a5c });
    g.moveTo(8, 11).lineTo(18, 11).stroke({ width: 1, color: 0x8f6a38, alpha: 0.8 });
  }),

  def('crib', 'Wiege', 'moebel', { w: 56, h: 78 }, ['wiege', 'kind', 'haus'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodLight, rng, 0.1);
    contactShadow(g, 26, 36, 2, 3);
    g.roundRect(-26, -36, 52, 72, 10).fill({ color: holz });
    g.roundRect(-26, -36, 52, 72, 10).stroke({ width: 2, color: shade(holz, -0.45) });
    // Sprossen an den Längsseiten.
    for (let i = 0; i < 6; i++) {
      const y = -28 + i * 11;
      for (const x of [-24, 21]) g.rect(x, y, 3, 8).fill({ color: shade(holz, -0.3) });
    }
    g.roundRect(-19, -29, 38, 58, 7).fill({ color: shade(holz, -0.25) });
    fabric(g, rng, -18, -6, 36, 33, jitterColor(0xcfd8e0, rng, 0.06), 3);
    g.roundRect(-14, -26, 28, 18, 6).fill({ color: 0xf2eee2 });
  }),

  def('lectern', 'Lesepult', 'moebel', 48, ['pult', 'buch', 'bibliothek'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    contactShadow(g, 18, 18, 2, 2.5);
    g.circle(0, 6, 15).fill({ color: shade(holz, -0.3) });
    g.circle(0, 6, 15).stroke({ width: 1.4, color: shade(holz, -0.5), alpha: 0.7 });
    g.roundRect(-19, -18, 38, 26, 2).fill({ color: holz });
    g.roundRect(-19, -18, 38, 26, 2).stroke({ width: 1.6, color: shade(holz, -0.5) });
    grain(g, rng, -19, -18, 38, 26, shade(holz, -0.3), 4, false, 0.3);
    // Aufgeschlagenes Buch mit Bundsteg in der Mitte.
    g.roundRect(-16, -15, 32, 20, 1.5).fill({ color: 0xe8e0c8 });
    g.rect(-1.2, -15, 2.4, 20).fill({ color: 0xb9ad8e });
    for (let i = 0; i < 4; i++) {
      g.rect(-14, -12 + i * 4.5, rng.range(6, 11), 1.2).fill({ color: 0x6a5a42, alpha: 0.7 });
      g.rect(3, -12 + i * 4.5, rng.range(6, 11), 1.2).fill({ color: 0x6a5a42, alpha: 0.7 });
    }
  }),
];

// ---------------------------------------------------------------------------
// Dungeon
// ---------------------------------------------------------------------------

export const extraDungeon: PropDef[] = [
  def('chains', 'Ketten', 'dungeon', { w: 62, h: 92 }, ['kette', 'fessel', 'kerker'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.1);
    for (const sx of [-1, 1]) {
      const x0 = sx * rng.range(12, 20);
      // Wandring, aus dem die Kette hängt.
      g.circle(x0, -30, 5).stroke({ width: 2.4, color: shade(c, 0.1) });
      let x = x0;
      let y = -25;
      for (let i = 0; i < 8; i++) {
        x += rng.range(-2.5, 2.5);
        y += rng.range(5, 8);
        g.ellipse(x, y, 3.2, 4.4).stroke({ width: 1.8, color: shade(c, i % 2 ? 0.15 : -0.05) });
      }
      // Offene Fessel am Ende.
      g.arc(x, y + 7, 5, 0.4, Math.PI * 1.7).stroke({ width: 2.6, color: shade(c, 0.2) });
    }
  }),

  def('lever', 'Hebel', 'dungeon', 44, ['hebel', 'mechanik', 'schalter'], (g, rng) => {
    const stein = jitterColor(PALETTE.stone, rng, 0.08);
    contactShadow(g, 16, 12, 1.5, 2);
    g.roundRect(-16, -11, 32, 22, 3).fill({ color: stein });
    blocks(g, rng, -16, -11, 32, 22, stein, 2, 1);
    g.roundRect(-16, -11, 32, 22, 3).stroke({ width: 1.6, color: shade(stein, -0.45) });
    // Der Hebel selbst, aus der Platte heraus zur Seite gelegt.
    const winkel = rng.range(-0.6, 0.6);
    g.circle(0, 0, 4).fill({ color: PALETTE.metalDark });
    g.moveTo(0, 0)
      .lineTo(Math.sin(winkel) * 15, -Math.cos(winkel) * 15)
      .stroke({ width: 4, color: PALETTE.metal });
    g.circle(Math.sin(winkel) * 16, -Math.cos(winkel) * 16, 3.6)
      .fill({ color: jitterColor(PALETTE.wood, rng, 0.1) });
  }),

  def('pressure_plate', 'Druckplatte', 'dungeon', 70, ['falle', 'platte', 'mechanik'], (g, rng) => {
    const stein = jitterColor(PALETTE.stone, rng, 0.06);
    g.rect(-30, -30, 60, 60).fill({ color: shade(stein, -0.35) });
    // Der umlaufende Spalt ist das ganze Motiv: eine Platte, die tiefer liegt.
    g.rect(-26, -26, 52, 52).fill({ color: shade(stein, -0.6) });
    g.rect(-24, -24, 48, 48).fill({ color: stein });
    blocks(g, rng, -24, -24, 48, 48, stein, 2, 2);
    g.rect(-24, -24, 48, 48).stroke({ width: 1.4, color: shade(stein, -0.45), alpha: 0.8 });
    bevel(g, -24, -24, 48, 48, stein, 0.2);
    strokes(g, rng, rng.int(3, 6), 20, 7, shade(stein, -0.3), 1, 0.35);
  }),

  def('spike_pit', 'Spießgrube', 'dungeon', 100, ['falle', 'grube', 'spiess'], (g, rng) => {
    const stein = jitterColor(PALETTE.stoneDark, rng, 0.08);
    g.rect(-44, -44, 88, 88).fill({ color: stein });
    g.rect(-38, -38, 76, 76).fill({ color: 0x14100e });
    // Spieße aus dem Dunkel: hell an der Spitze, damit sie lesbar sind.
    for (let i = 0; i < 14; i++) {
      const x = rng.range(-33, 33);
      const y = rng.range(-33, 33);
      const h = rng.range(9, 15);
      g.poly([x - 3.2, y + h / 2, x, y - h / 2, x + 3.2, y + h / 2])
        .fill({ color: shade(PALETTE.metal, rng.range(-0.25, 0.1)) });
      g.moveTo(x, y - h / 2).lineTo(x - 1, y + h / 4)
        .stroke({ width: 1, color: 0xffffff, alpha: 0.35 });
    }
    g.rect(-44, -44, 88, 88).stroke({ width: 2, color: shade(stein, -0.4) });
  }),

  def('skull_pile', 'Schädelhaufen', 'dungeon', 78, ['schaedel', 'knochen', 'krypta'], (g, rng) => {
    contactShadow(g, 30, 24, 2, 3);
    const n = rng.int(7, 11);
    for (let i = 0; i < n; i++) {
      const x = rng.range(-26, 26);
      const y = rng.range(-20, 20);
      const r = rng.range(6, 9.5);
      const c = shade(PALETTE.bone, rng.range(-0.18, 0.08));
      g.ellipse(x, y, r, r * 0.92).fill({ color: c });
      g.ellipse(x, y + r * 0.55, r * 0.6, r * 0.35).fill({ color: shade(c, -0.12) });
      for (const s of [-1, 1]) {
        g.ellipse(x + s * r * 0.36, y - r * 0.1, r * 0.24, r * 0.28)
          .fill({ color: 0x2a241c, alpha: 0.85 });
      }
      g.ellipse(x, y + r * 0.42, r * 0.16, r * 0.2).fill({ color: 0x2a241c, alpha: 0.7 });
    }
    strokes(g, rng, rng.int(4, 8), 30, 9, shade(PALETTE.bone, -0.3), 1.4, 0.5);
  }),

  def('portcullis', 'Fallgitter', 'dungeon', { w: 120, h: 38 }, ['gitter', 'tor', 'burg'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.08);
    const stein = jitterColor(PALETTE.stone, rng, 0.06);
    g.rect(-58, -16, 116, 32).fill({ color: shade(stein, -0.4) });
    for (let i = 0; i < 9; i++) {
      const x = -52 + i * 13;
      g.rect(x - 2.5, -14, 5, 28).fill({ color: c });
      g.rect(x - 2.5, -14, 5, 9).fill({ color: shade(c, 0.28), alpha: 0.6 });
      // Zugespitztes unteres Ende.
      g.poly([x - 2.5, 14, x, 19, x + 2.5, 14]).fill({ color: shade(c, -0.15) });
    }
    for (const y of [-9, 6]) band(g, -56, y, 112, 5, c, 8);
    g.rect(-58, -16, 116, 32).stroke({ width: 2, color: shade(stein, -0.5) });
  }),

  def('torture_rack', 'Streckbank', 'dungeon', { w: 132, h: 64 }, ['folter', 'kerker', 'bank'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    contactShadow(g, 56, 26, 3, 4);
    legs(g, 54, 24, 8, holz);
    planks(g, rng, -56, -26, 112, 52, holz, 3);
    g.rect(-56, -26, 112, 52).stroke({ width: 2.2, color: shade(holz, -0.5) });
    // Zwei Walzen mit Kurbeln an den Enden, dazwischen die Seile.
    for (const sx of [-1, 1]) {
      g.roundRect(sx > 0 ? 36 : -48, -22, 12, 44, 3).fill({ color: shade(holz, 0.14) });
      g.roundRect(sx > 0 ? 36 : -48, -22, 12, 44, 3)
        .stroke({ width: 1.2, color: shade(holz, -0.45) });
      g.circle(sx * 52, 0, 5).fill({ color: PALETTE.metalDark });
      g.moveTo(sx * 52, 0).lineTo(sx * 60, -8).stroke({ width: 3, color: PALETTE.metal });
    }
    for (const y of [-14, 14]) {
      g.moveTo(-34, y).lineTo(34, y).stroke({ width: 2, color: 0xd8ceb2, alpha: 0.85 });
      for (const sx of [-1, 1]) g.circle(sx * 30, y, 3.4).stroke({ width: 1.6, color: 0xd8ceb2 });
    }
    if (rng.bool(0.4)) {
      g.poly(offset(blob(rng, 5, 0.4, 12, 0.8), rng.range(-20, 20), rng.range(-10, 10)))
        .fill({ color: 0x6e1b1b, alpha: 0.55 });
    }
  }),
];

// ---------------------------------------------------------------------------
// Natur
// ---------------------------------------------------------------------------

export const extraNature: PropDef[] = [
  def('tree_willow', 'Trauerweide', 'baum', 150, ['baum', 'weide', 'wasser'], (g, rng) => {
    contactShadow(g, 58, 54, 4, 6, 0.34);
    const c = jitterColor(0x8fae5c, rng, 0.1);
    // Herabhängende Zweige: viele lange, schmale Blätterschleier statt einer Krone.
    for (let i = 0; i < 26; i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(14, 56);
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d * 0.92;
      g.ellipse(x, y, rng.range(5, 11), rng.range(12, 22))
        .fill({ color: shade(c, rng.range(-0.22, 0.16)), alpha: 0.88 });
    }
    g.circle(0, 0, 13).fill({ color: PALETTE.woodDark });
    g.circle(0, 0, 9).fill({ color: shade(PALETTE.wood, -0.1) });
    strokes(g, rng, 8, 9, 5, shade(PALETTE.woodDark, -0.3), 1, 0.5);
  }),

  def('tree_palm', 'Palme', 'baum', { w: 128, h: 122 }, ['baum', 'palme', 'insel'], (g, rng) => {
    contactShadow(g, 22, 20, 5, 7, 0.3);
    const c = jitterColor(0x5f8f47, rng, 0.1);
    const wedel = rng.int(7, 9);
    const phase = rng.range(0, Math.PI * 2);
    for (let i = 0; i < wedel; i++) {
      const a = phase + (i / wedel) * Math.PI * 2;
      const len = rng.range(38, 54);
      const br = rng.range(7, 11);
      // Ein Wedel: schmal am Stamm, breit außen, mit Mittelrippe.
      g.poly([
        Math.cos(a) * 8, Math.sin(a) * 8,
        Math.cos(a + 0.16) * len, Math.sin(a + 0.16) * len,
        Math.cos(a) * (len + br), Math.sin(a) * (len + br),
        Math.cos(a - 0.16) * len, Math.sin(a - 0.16) * len,
      ]).fill({ color: shade(c, rng.range(-0.2, 0.16)) });
      g.moveTo(Math.cos(a) * 8, Math.sin(a) * 8)
        .lineTo(Math.cos(a) * (len + br * 0.6), Math.sin(a) * (len + br * 0.6))
        .stroke({ width: 1.2, color: shade(c, -0.35), alpha: 0.7 });
    }
    // Kokosnüsse unter der Krone.
    for (let i = 0; i < rng.int(2, 4); i++) {
      const a = rng.range(0, Math.PI * 2);
      g.circle(Math.cos(a) * 11, Math.sin(a) * 11, 3.6).fill({ color: 0x6b4a2a });
    }
    g.circle(0, 0, 9).fill({ color: shade(PALETTE.wood, -0.15) });
    g.circle(-1, -1, 5).fill({ color: shade(PALETTE.woodLight, 0.05) });
  }),

  def('cactus', 'Kaktus', 'pflanze', 60, ['kaktus', 'wueste', 'pflanze'], (g, rng) => {
    contactShadow(g, 12, 12, 2, 3);
    const c = jitterColor(0x4e7a4a, rng, 0.1);
    g.circle(0, 0, 11).fill({ color: c });
    g.circle(-2, -2, 7).fill({ color: shade(c, 0.18), alpha: 0.7 });
    // Arme als kürzere Kugeln daneben — von oben sieht man genau das.
    for (let i = 0; i < rng.int(1, 3); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(12, 17);
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(5, 7.5)).fill({ color: shade(c, -0.1) });
    }
    // Stacheln: kurze helle Striche rundum.
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 10, Math.sin(a) * 10)
        .lineTo(Math.cos(a) * 14, Math.sin(a) * 14)
        .stroke({ width: 1, color: 0xe4e0c0, alpha: 0.75 });
    }
    if (rng.bool(0.3)) g.circle(rng.range(-6, 6), rng.range(-6, 6), 2.6).fill({ color: 0xd9576a });
  }),

  def('berry_bush', 'Beerenstrauch', 'pflanze', 62, ['strauch', 'beere', 'busch'], (g, rng) => {
    contactShadow(g, 24, 22, 2, 3);
    const c = jitterColor(PALETTE.leaf, rng, 0.12);
    for (let i = 0; i < 5; i++) {
      g.poly(offset(blob(rng, rng.range(11, 17), 0.28, 14), rng.range(-9, 9), rng.range(-9, 9)))
        .fill({ color: shade(c, rng.range(-0.18, 0.14)) });
    }
    const beere = rng.bool() ? 0xa3243a : 0x2f3f7a;
    for (let i = 0; i < rng.int(7, 13); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 18;
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(1.8, 2.8))
        .fill({ color: shade(beere, rng.range(-0.15, 0.15)) });
    }
    strokes(g, rng, 6, 16, 6, shade(c, -0.35), 1, 0.45);
  }),

  def('flower_patch', 'Blumenwiese', 'pflanze', 102, ['blume', 'wiese', 'gras'], (g, rng) => {
    const c = jitterColor(PALETTE.grass, rng, 0.1);
    g.poly(blob(rng, 38, 0.24, 20)).fill({ color: c, alpha: 0.5 });
    strokes(g, rng, 26, 36, 9, shade(c, -0.25), 1.2, 0.55);
    const farben = [0xe8d24a, 0xd9576a, 0xe4e0e8, 0x9a6fc4];
    for (let i = 0; i < rng.int(12, 20); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 34;
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      const f = farben[rng.int(0, farben.length - 1)];
      // Fünf Blütenblätter und ein Auge — das liest sich auch bei drei Pixeln.
      for (let k = 0; k < 5; k++) {
        const ba = (k / 5) * Math.PI * 2 + rng.range(0, 1);
        g.circle(x + Math.cos(ba) * 2.2, y + Math.sin(ba) * 2.2, 1.7).fill({ color: f });
      }
      g.circle(x, y, 1.3).fill({ color: 0xf0d878 });
    }
  }),

  def('rock_arch', 'Felsbogen', 'stein', { w: 120, h: 100 }, ['fels', 'bogen', 'stein'], (g, rng) => {
    const c = jitterColor(PALETTE.stone, rng, 0.1);
    contactShadow(g, 54, 34, 3, 5);
    // Zwei Pfeiler, dazwischen der Bogen — von oben ein Ring mit dickeren Enden.
    for (const sx of [-1, 1]) {
      g.poly(offset(blob(rng, 20, 0.26, 16, 0.9), sx * 34, 0)).fill({ color: c });
      g.poly(offset(blob(rng, 13, 0.3, 14, 0.9), sx * 34, -3))
        .fill({ color: shade(c, 0.16), alpha: 0.8 });
    }
    g.roundRect(-34, -13, 68, 26, 12).fill({ color: shade(c, -0.14) });
    g.roundRect(-24, -7, 48, 14, 7).fill({ color: 0x000000, alpha: 0.45 });
    strokes(g, rng, 10, 46, 10, shade(c, -0.35), 1.2, 0.4);
  }),

  def('snow_drift', 'Schneewehe', 'boden', { w: 130, h: 110 }, ['schnee', 'winter', 'boden'], (g, rng) => {
    const c = jitterColor(0xe8edf2, rng, 0.04);
    for (let i = 0; i < 4; i++) {
      g.poly(offset(blob(rng, rng.range(26, 44), 0.3, 20, 0.7), rng.range(-8, 8), rng.range(-6, 6)))
        .fill({ color: shade(c, -0.03 * i), alpha: 0.9 });
    }
    // Windkanten: helle Grate, blaue Schattenseite.
    for (let i = 0; i < 5; i++) {
      const y = rng.range(-22, 22);
      g.moveTo(-38, y)
        .quadraticCurveTo(0, y + rng.range(-8, 8), 38, y + rng.range(-4, 4))
        .stroke({ width: rng.range(1.4, 3), color: 0xc3d2e2, alpha: 0.55 });
    }
    g.poly(blob(rng, 20, 0.3, 16, 0.6)).fill({ color: 0xffffff, alpha: 0.5 });
  }),

  def('ice_floe', 'Eisscholle', 'boden', { w: 114, h: 100 }, ['eis', 'scholle', 'wasser'], (g, rng) => {
    const c = jitterColor(0xcfe2ec, rng, 0.05);
    const pts = blob(rng, 40, 0.3, 11, 0.85);
    g.poly(pts).fill({ color: 0x7fa8c0, alpha: 0.5 });
    g.poly(pts).fill({ color: c });
    g.poly(pts).stroke({ width: 1.6, color: 0xf2f8fb, alpha: 0.8 });
    // Risse vom Rand zur Mitte, wie sie beim Brechen entstehen.
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      g.moveTo(Math.cos(a) * 36, Math.sin(a) * 30)
        .lineTo(Math.cos(a) * 14 + rng.range(-6, 6), Math.sin(a) * 12 + rng.range(-6, 6))
        .lineTo(rng.range(-6, 6), rng.range(-6, 6))
        .stroke({ width: 1.2, color: 0x8fb3c8, alpha: 0.7 });
    }
    g.poly(offset(blob(rng, 14, 0.3, 12, 0.8), -6, -6)).fill({ color: 0xffffff, alpha: 0.45 });
  }),
];

// ---------------------------------------------------------------------------
// Hof und Handwerk
// ---------------------------------------------------------------------------

export const extraYard: PropDef[] = [
  def('cookfire', 'Kochstelle', 'struktur', 80, ['feuer', 'kochen', 'lager'], (g, rng) => {
    // Steinring, Glut, Dreibein mit Kessel darüber.
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + rng.range(-0.12, 0.12);
      const d = 26;
      g.poly(offset(blob(rng, rng.range(5, 7.5), 0.3, 10), Math.cos(a) * d, Math.sin(a) * d))
        .fill({ color: jitterColor(PALETTE.stone, rng, 0.14) });
    }
    g.circle(0, 0, 21).fill({ color: 0x2a1c14 });
    for (let i = 0; i < 9; i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = Math.sqrt(rng.next()) * 16;
      g.circle(Math.cos(a) * d, Math.sin(a) * d, rng.range(2, 4.5))
        .fill({ color: shade(PALETTE.fire, rng.range(-0.35, 0.1)), alpha: 0.9 });
    }
    for (let i = 0; i < 3; i++) {
      const a = rng.range(0, 1) + (i / 3) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 30, Math.sin(a) * 30)
        .lineTo(0, 0)
        .stroke({ width: 2.4, color: PALETTE.woodDark });
    }
    g.circle(0, 0, 9).fill({ color: PALETTE.metalDark });
    g.circle(0, 0, 7).fill({ color: 0x1b1410 });
    g.arc(0, 0, 9, Math.PI * 1.1, Math.PI * 1.7).stroke({ width: 1.6, color: PALETTE.metal });
  }),

  def('plough', 'Pflug', 'struktur', { w: 92, h: 68 }, ['pflug', 'acker', 'bauernhof'], (g, rng) => {
    const holz = jitterColor(PALETTE.wood, rng, 0.1);
    contactShadow(g, 34, 22, 2.5, 3);
    g.poly([-40, 6, 10, -8, 34, -2, 34, 6, 8, 10, -38, 20]).fill({ color: holz });
    g.poly([-40, 6, 10, -8, 34, -2, 34, 6, 8, 10, -38, 20])
      .stroke({ width: 1.6, color: shade(holz, -0.45) });
    grain(g, rng, -38, -6, 70, 24, shade(holz, -0.3), 5, false, 0.3);
    // Schar aus blankem Metall und die beiden Sterzen.
    g.poly([28, -8, 44, 2, 28, 12]).fill({ color: PALETTE.metal });
    g.poly([28, -8, 44, 2, 28, 12]).stroke({ width: 1.2, color: PALETTE.metalDark });
    for (const y of [-14, 16]) {
      g.moveTo(-34, y > 0 ? 16 : 4).lineTo(-40, y).stroke({ width: 3.4, color: shade(holz, -0.2) });
    }
    g.circle(-12, 24, 8).stroke({ width: 3, color: shade(holz, -0.35) });
  }),

  def('beehive', 'Bienenstock', 'struktur', { w: 54, h: 52 }, ['biene', 'korb', 'hof'], (g, rng) => {
    const c = jitterColor(0xc9a15a, rng, 0.1);
    contactShadow(g, 17, 17, 2, 2.5);
    // Strohkorb: konzentrische Wülste, von oben Ringe.
    for (let i = 4; i >= 0; i--) {
      const r = 6 + i * 3;
      g.circle(0, 0, r).fill({ color: shade(c, i % 2 ? -0.1 : 0.06) });
      g.circle(0, 0, r).stroke({ width: 0.9, color: shade(c, -0.35), alpha: 0.6 });
    }
    g.circle(0, 0, 18).stroke({ width: 1.6, color: shade(c, -0.45) });
    g.rect(-4, 15, 8, 4).fill({ color: 0x3a2c18 });
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(19, 26);
      g.circle(Math.cos(a) * d, Math.sin(a) * d, 1.5).fill({ color: 0xe8c84a });
    }
  }),

  def('woodpile', 'Holzstapel', 'struktur', { w: 114, h: 54 }, ['holz', 'scheit', 'stapel'], (g, rng) => {
    contactShadow(g, 48, 24, 2.5, 3);
    // Scheite mit sichtbarer Stirnfläche und Jahresringen.
    for (let reihe = 0; reihe < 3; reihe++) {
      for (let i = 0; i < 7; i++) {
        const x = -42 + i * 14 + (reihe % 2) * 6 + rng.range(-1.5, 1.5);
        const y = -16 + reihe * 15 + rng.range(-1.5, 1.5);
        const r = rng.range(5.5, 7.5);
        const c = jitterColor(PALETTE.woodLight, rng, 0.12);
        g.circle(x, y, r).fill({ color: c });
        g.circle(x, y, r).stroke({ width: 1, color: shade(c, -0.45) });
        g.circle(x, y, r * 0.62).stroke({ width: 0.8, color: shade(c, -0.25), alpha: 0.7 });
        g.circle(x, y, r * 0.28).stroke({ width: 0.8, color: shade(c, -0.3), alpha: 0.6 });
        if (rng.bool(0.35)) {
          g.moveTo(x, y).lineTo(x + rng.range(-r, r), y + rng.range(-r, r))
            .stroke({ width: 0.9, color: shade(c, -0.4), alpha: 0.6 });
        }
      }
    }
  }),

  def('grindstone', 'Schleifstein', 'struktur', 56, ['schleifen', 'stein', 'werkstatt'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    const stein = jitterColor(PALETTE.stoneDark, rng, 0.08);
    contactShadow(g, 22, 20, 2, 3);
    g.roundRect(-22, 6, 44, 12, 3).fill({ color: holz });
    g.roundRect(-22, 6, 44, 12, 3).stroke({ width: 1.4, color: shade(holz, -0.45) });
    for (const sx of [-1, 1]) g.rect(sx * 16 - 2.5, -14, 5, 22).fill({ color: shade(holz, 0.1) });
    g.circle(0, -4, 17).fill({ color: stein });
    g.circle(0, -4, 17).stroke({ width: 1.6, color: shade(stein, -0.4) });
    g.circle(0, -4, 12).stroke({ width: 1, color: shade(stein, 0.2), alpha: 0.5 });
    g.circle(0, -4, 4).fill({ color: PALETTE.metalDark });
    g.moveTo(0, -4).lineTo(14, -16).stroke({ width: 3, color: PALETTE.metal });
    g.circle(15, -17, 3).fill({ color: shade(holz, 0.15) });
  }),

  def('washing_line', 'Wäscheleine', 'struktur', { w: 166, h: 60 }, ['waesche', 'leine', 'hof'], (g, rng) => {
    for (const sx of [-1, 1]) {
      g.rect(sx * 60 - 2, -18, 4, 36).fill({ color: PALETTE.woodDark });
      g.moveTo(sx * 60, -18).lineTo(sx * 52, -10)
        .stroke({ width: 2, color: shade(PALETTE.woodDark, 0.1) });
    }
    g.moveTo(-60, -10).quadraticCurveTo(0, -2, 60, -10)
      .stroke({ width: 1.4, color: 0xd8ceb2, alpha: 0.9 });
    // Aufgehängte Stücke, jedes mit Falten.
    const farben = [0xd8d2c2, 0x8fa8c4, 0xb8785a, 0x9aa87c];
    for (let i = 0; i < rng.int(4, 6); i++) {
      const x = -46 + i * rng.range(19, 24);
      const w = rng.range(14, 22);
      const h = rng.range(18, 30);
      const y = -8 + Math.abs(x) * -0.06 + 4;
      fabric(g, rng, x - w / 2, y, w, h, shade(farben[i % farben.length], rng.range(-0.1, 0.1)), 3);
      g.rect(x - w / 2, y, w, h).stroke({ width: 0.8, color: 0x000000, alpha: 0.2 });
      for (const cx of [x - w / 2 + 2, x + w / 2 - 2]) {
        g.rect(cx - 1, y - 3, 2, 5).fill({ color: PALETTE.woodLight });
      }
    }
  }),

  def('mooring_post', 'Poller', 'struktur', { w: 42, h: 58 }, ['hafen', 'poller', 'anleger'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.12);
    contactShadow(g, 8, 8, 1.5, 2);
    g.circle(0, 0, 8).fill({ color: holz });
    g.circle(0, 0, 8).stroke({ width: 1.4, color: shade(holz, -0.45) });
    g.circle(-1.2, -1.2, 5).fill({ color: shade(holz, 0.16) });
    // Aufgeschossenes Tau um den Pfosten. Es bleibt bewusst innerhalb der
    // angegebenen Größe — ein Tau, das über den eigenen Rahmen hinausläuft,
    // wird im Bild abgeschnitten und sieht aus wie eine Spirale.
    for (let i = 0; i < 3; i++) {
      g.circle(0, 0, 10 + i * 2.4)
        .stroke({ width: 2, color: shade(0xbfa87c, rng.range(-0.12, 0.12)) });
    }
    const a = rng.range(0, Math.PI * 2);
    g.moveTo(Math.cos(a) * 17, Math.sin(a) * 17)
      .quadraticCurveTo(Math.cos(a) * 18, Math.sin(a) * 18 + 3, Math.cos(a) * 19, Math.sin(a) * 19)
      .stroke({ width: 2, color: 0xbfa87c });
  }),
];

// ---------------------------------------------------------------------------
// Beiwerk
// ---------------------------------------------------------------------------

export const extraDecor: PropDef[] = [
  def('lantern', 'Laterne', 'deko', 40, ['licht', 'laterne', 'lampe'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.1);
    contactShadow(g, 11, 11, 1.5, 2);
    // Warmer Schein zuerst, damit alles darüber liegt.
    for (let i = 3; i >= 1; i--) {
      g.circle(0, 0, 11 + i * 3).fill({ color: PALETTE.fire, alpha: 0.07 * i });
    }
    g.roundRect(-10, -10, 20, 20, 3).fill({ color: c });
    g.roundRect(-7.5, -7.5, 15, 15, 2).fill({ color: 0xf6d68a });
    g.roundRect(-7.5, -7.5, 15, 15, 2).stroke({ width: 1.2, color: shade(c, 0.2) });
    g.circle(0, 0, 3.4).fill({ color: 0xfff3c4 });
    for (const s of [-1, 1]) g.rect(s * 8.5 - 1, -10, 2, 20).fill({ color: shade(c, 0.15) });
    g.arc(0, -11, 5, Math.PI, Math.PI * 2).stroke({ width: 1.8, color: shade(c, 0.25) });
  }),

  def('map_table', 'Kartentisch', 'moebel', { w: 136, h: 90 }, ['karte', 'tisch', 'plan'], (g, rng) => {
    const holz = jitterColor(PALETTE.wood, rng, 0.1);
    contactShadow(g, 58, 38, 3, 4);
    legs(g, 56, 36, 9, holz);
    planks(g, rng, -58, -38, 116, 76, holz, 4);
    g.rect(-58, -38, 116, 76).stroke({ width: 2.2, color: shade(holz, -0.45) });
    // Aufgerollte Karte mit Küstenlinie und ein paar Marken darauf.
    g.rect(-44, -28, 84, 56).fill({ color: 0xe4d9b4 });
    g.rect(-44, -28, 84, 56).stroke({ width: 1, color: 0xbdb08a });
    g.poly([-40, 10, -24, 2, -8, 8, 6, -2, 22, 4, 36, -6, 36, 26, -40, 26])
      .fill({ color: 0x9db486, alpha: 0.75 });
    g.moveTo(-40, 10).lineTo(-24, 2).lineTo(-8, 8).lineTo(6, -2).lineTo(22, 4).lineTo(36, -6)
      .stroke({ width: 1.2, color: 0x6d7f5c, alpha: 0.9 });
    for (let i = 0; i < rng.int(2, 4); i++) {
      g.circle(rng.range(-34, 30), rng.range(-20, 20), 2.6)
        .fill({ color: rng.bool() ? 0xa8342c : 0x2c4e8a });
    }
    g.circle(-32, -20, 6).stroke({ width: 1, color: 0x8a7f5c, alpha: 0.8 });
    for (const sx of [-1, 1]) {
      g.roundRect(sx * 44 - 4, -28, 8, 56, 4).fill({ color: shade(0xe4d9b4, -0.16) });
    }
  }),

  def('lute', 'Laute', 'deko', { w: 80, h: 34 }, ['laute', 'musik', 'barde'], (g, rng) => {
    const holz = jitterColor(0xa9793f, rng, 0.1);
    contactShadow(g, 20, 14, 2, 2.5);
    g.ellipse(-14, 0, 18, 15).fill({ color: holz });
    g.ellipse(-14, 0, 18, 15).stroke({ width: 1.4, color: shade(holz, -0.45) });
    g.ellipse(-16, -3, 11, 8).fill({ color: shade(holz, 0.16), alpha: 0.6 });
    g.circle(-8, 0, 4.5).fill({ color: 0x2a1c10 });
    g.circle(-8, 0, 4.5).stroke({ width: 1, color: shade(holz, -0.3) });
    g.rect(0, -4, 30, 8).fill({ color: shade(holz, -0.25) });
    g.roundRect(28, -6, 12, 12, 2).fill({ color: shade(holz, -0.4) });
    for (const y of [-3, 3]) {
      for (const x of [31, 36]) g.circle(x, y, 1.4).fill({ color: 0xe8dcc0 });
    }
    for (let i = 0; i < 4; i++) {
      const y = -3 + i * 2;
      g.moveTo(-26, y * 0.7).lineTo(30, y).stroke({ width: 0.7, color: 0xf0e6cc, alpha: 0.85 });
    }
  }),

  def('potion_shelf', 'Trankregal', 'deko', { w: 100, h: 40 }, ['trank', 'regal', 'alchemie'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    contactShadow(g, 48, 17, 2, 3);
    g.rect(-48, -16, 96, 32).fill({ color: holz });
    g.rect(-48, -16, 96, 32).stroke({ width: 1.8, color: shade(holz, -0.5) });
    g.rect(-46, -1, 92, 2).fill({ color: shade(holz, -0.4), alpha: 0.8 });
    const farben = [0x4fa3c4, 0x9a5ec4, 0x5cb45c, 0xd2a03c, 0xc4485c];
    for (let reihe = 0; reihe < 2; reihe++) {
      for (let i = 0; i < 7; i++) {
        const x = -42 + i * 13 + rng.range(-1.5, 1.5);
        const y = reihe === 0 ? -8 : 8;
        const f = farben[rng.int(0, farben.length - 1)];
        g.roundRect(x - 3.4, y - 5, 6.8, 10, 2).fill({ color: f, alpha: 0.9 });
        g.roundRect(x - 3.4, y - 5, 6.8, 5, 2).fill({ color: shade(f, 0.3), alpha: 0.5 });
        g.rect(x - 1.4, y - 8, 2.8, 3).fill({ color: 0xd8c8a0 });
        g.moveTo(x - 2, y - 3).lineTo(x - 2, y + 3)
          .stroke({ width: 1, color: 0xffffff, alpha: 0.4 });
      }
    }
  }),

  def('bird_nest', 'Nest', 'deko', 36, ['nest', 'vogel', 'ei'], (g, rng) => {
    contactShadow(g, 13, 12, 1.5, 2);
    const c = jitterColor(0x8a6a3c, rng, 0.12);
    g.circle(0, 0, 15).fill({ color: shade(c, -0.2) });
    for (let i = 0; i < 22; i++) {
      const a = rng.range(0, Math.PI * 2);
      const r = rng.range(8, 15);
      g.arc(0, 0, r, a, a + rng.range(0.5, 1.4))
        .stroke({ width: rng.range(1, 1.8), color: shade(c, rng.range(-0.25, 0.2)), alpha: 0.9 });
    }
    g.circle(0, 0, 8).fill({ color: 0x2f2416 });
    for (let i = 0; i < rng.int(2, 4); i++) {
      const a = (i / 3) * Math.PI * 2 + rng.range(0, 1);
      g.ellipse(Math.cos(a) * 3.5, Math.sin(a) * 3, 3, 3.8)
        .fill({ color: rng.bool() ? 0xdce4d8 : 0xc8d8e0 });
    }
  }),

  def('hourglass', 'Sanduhr', 'deko', 30, ['sanduhr', 'zeit', 'uhr'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    contactShadow(g, 10, 10, 1.5, 2);
    for (const y of [-11, 7]) {
      g.roundRect(-11, y, 22, 5, 2).fill({ color: holz });
      g.roundRect(-11, y, 22, 5, 2).stroke({ width: 1, color: shade(holz, -0.45) });
    }
    for (const sx of [-1, 1]) g.rect(sx * 9 - 1, -8, 2, 15).fill({ color: shade(holz, 0.1) });
    // Von oben blickt man in die obere Kammer: Glasring, Sand, Loch.
    g.circle(0, 0, 8).fill({ color: 0xcfe0e8, alpha: 0.55 });
    g.circle(0, 0, 8).stroke({ width: 1.2, color: 0xeef6fa, alpha: 0.8 });
    g.circle(0, 0, 6).fill({ color: jitterColor(0xd8b878, rng, 0.08) });
    g.circle(0, 0, 1.8).fill({ color: 0x6a5230 });
    g.arc(0, 0, 6.5, Math.PI * 1.1, Math.PI * 1.6).stroke({ width: 1.6, color: 0xffffff, alpha: 0.4 });
  }),
];

// ---------------------------------------------------------------------------
// Weltkarte
// ---------------------------------------------------------------------------

export const extraWorld: PropDef[] = [
  def('w_monastery', 'Kloster', 'welt', 80, ['kloster', 'abtei', 'welt'], (g, rng) => {
    const c = jitterColor(PALETTE.stoneLight, rng, 0.08);
    g.rect(-28, -20, 44, 34).fill({ color: c });
    g.rect(-28, -20, 44, 34).stroke({ width: 1.4, color: shade(c, -0.45) });
    // Kreuzgang: Innenhof mit umlaufendem Gang.
    g.rect(-21, -13, 30, 20).fill({ color: shade(PALETTE.grass, 0.05) });
    g.rect(-21, -13, 30, 20).stroke({ width: 1, color: shade(c, -0.35), alpha: 0.7 });
    // Kirche mit Turm an der Seite.
    g.rect(14, -26, 16, 46).fill({ color: shade(c, 0.08) });
    g.rect(14, -26, 16, 46).stroke({ width: 1.4, color: shade(c, -0.45) });
    g.rect(18, -34, 8, 10).fill({ color: shade(c, 0.18) });
    g.moveTo(22, -38).lineTo(22, -30).moveTo(19, -35).lineTo(25, -35)
      .stroke({ width: 1.6, color: 0xd9b64a });
    strokes(g, rng, 4, 26, 7, shade(c, -0.3), 1, 0.35);
  }),

  def('w_windmill', 'Windmühle', 'welt', 70, ['muehle', 'wind', 'welt'], (g, rng) => {
    const c = jitterColor(PALETTE.stoneLight, rng, 0.08);
    const phase = rng.range(0, Math.PI / 2);
    // Flügel zuerst: der Turm liegt darüber.
    for (let i = 0; i < 4; i++) {
      const a = phase + (i / 4) * Math.PI * 2;
      g.poly([
        Math.cos(a) * 6, Math.sin(a) * 6,
        Math.cos(a + 0.14) * 30, Math.sin(a + 0.14) * 30,
        Math.cos(a - 0.14) * 30, Math.sin(a - 0.14) * 30,
      ]).fill({ color: 0xe0d8c0, alpha: 0.92 });
      g.moveTo(0, 0).lineTo(Math.cos(a) * 30, Math.sin(a) * 30)
        .stroke({ width: 1.6, color: PALETTE.woodDark });
    }
    g.circle(0, 0, 11).fill({ color: c });
    g.circle(0, 0, 11).stroke({ width: 1.4, color: shade(c, -0.45) });
    g.circle(0, 0, 7).fill({ color: shade(c, -0.2) });
    g.circle(0, 0, 2.5).fill({ color: PALETTE.woodDark });
  }),

  def('w_crossroads', 'Wegkreuz', 'welt', 60, ['weg', 'kreuzung', 'welt'], (g, rng) => {
    const weg = jitterColor(0xbca77c, rng, 0.08);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      g.poly([dx * 4 - dy * 4, dy * 4 - dx * 4, dx * 28 - dy * 5, dy * 28 - dx * 5,
        dx * 28 + dy * 5, dy * 28 + dx * 5, dx * 4 + dy * 4, dy * 4 + dx * 4])
        .fill({ color: weg });
    }
    g.circle(0, 0, 9).fill({ color: weg });
    g.circle(0, 0, 9).stroke({ width: 1, color: shade(weg, -0.3), alpha: 0.6 });
    // Wegweiser in der Mitte.
    g.rect(-1.6, -14, 3.2, 16).fill({ color: PALETTE.woodDark });
    for (let i = 0; i < rng.int(2, 3); i++) {
      const s = rng.bool() ? 1 : -1;
      const y = -12 + i * 5;
      g.poly([s * 1.6, y, s * 12, y, s * 15, y + 2, s * 12, y + 4, s * 1.6, y + 4])
        .fill({ color: shade(PALETTE.woodLight, 0.05) });
    }
  }),

  def('w_shipwreck', 'Wrack', 'welt', { w: 92, h: 84 }, ['wrack', 'schiff', 'welt'], (g, rng) => {
    const holz = jitterColor(PALETTE.woodDark, rng, 0.1);
    // Gebrochener Rumpf, halb versunken: die Bruchkante ist das Motiv.
    g.poly([-38, 2, -20, -14, 6, -16, 18, -6, 10, 12, -16, 18]).fill({ color: holz });
    g.poly([-38, 2, -20, -14, 6, -16, 18, -6, 10, 12, -16, 18])
      .stroke({ width: 1.6, color: shade(holz, -0.45) });
    for (let i = 0; i < 5; i++) {
      g.moveTo(-32 + i * 11, -12).lineTo(-28 + i * 11, 14)
        .stroke({ width: 1.4, color: shade(holz, -0.3), alpha: 0.7 });
    }
    // Abgebrochener Mast mit Fetzen von Segel.
    g.moveTo(-4, -8).lineTo(30, -26).stroke({ width: 3.4, color: shade(holz, 0.1) });
    g.poly([16, -18, 30, -26, 34, -18, 22, -12]).fill({ color: 0xd8d2c2, alpha: 0.75 });
    for (let i = 0; i < rng.int(3, 6); i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(24, 38);
      g.rect(Math.cos(a) * d, Math.sin(a) * d, rng.range(4, 9), 2.4)
        .fill({ color: shade(holz, 0.05), alpha: 0.85 });
    }
    g.arc(0, 6, 34, 0.2, Math.PI - 0.2).stroke({ width: 1.6, color: 0x9fc4d8, alpha: 0.5 });
  }),

  def('w_pass', 'Pass', 'welt', { w: 134, h: 74 }, ['pass', 'gebirge', 'welt'], (g, rng) => {
    const c = jitterColor(PALETTE.stone, rng, 0.1);
    // Zwei Gebirgsstöcke mit einer Lücke dazwischen — genau das ist ein Pass.
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const x = sx * (22 + i * 12) + rng.range(-3, 3);
        const h = rng.range(20, 32);
        g.poly([x - 16, 22, x, 22 - h, x + 16, 22])
          .fill({ color: shade(c, rng.range(-0.15, 0.05)) });
        g.poly([x - 5, 22 - h * 0.55, x, 22 - h, x + 5, 22 - h * 0.55])
          .fill({ color: 0xeef2f4, alpha: 0.9 });
        g.moveTo(x - 16, 22).lineTo(x, 22 - h).lineTo(x + 16, 22)
          .stroke({ width: 1.2, color: shade(c, -0.45), alpha: 0.7 });
      }
    }
    // Der Weg *durch* die Lücke ist das Motiv, nicht die Berge: er wird
    // deshalb breit, hell und mit deutlicher Krümmung gezogen.
    const weg = jitterColor(0xd8c49a, rng, 0.06);
    const k1 = rng.range(-9, 9);
    const k2 = rng.range(-9, 9);
    const bahn = (breite: number, farbe: number, alpha: number) => {
      g.moveTo(-4 + k1, 30)
        .quadraticCurveTo(k1 * 1.6, 12, 0, 0)
        .quadraticCurveTo(k2 * 1.6, -12, 4 + k2, -28)
        .stroke({ width: breite, color: farbe, alpha });
    };
    bahn(9, shade(weg, -0.35), 0.5);
    bahn(6.5, weg, 1);
    bahn(1.6, shade(weg, 0.25), 0.45);
  }),
];

export const extraProps: PropDef[] = [
  ...extraFurniture,
  ...extraDungeon,
  ...extraNature,
  ...extraYard,
  ...extraDecor,
  ...extraWorld,
];
