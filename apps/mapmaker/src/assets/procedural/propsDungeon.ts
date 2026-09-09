/**
 * Prozedurale Props: Dungeon, Beute und Siedlungsteile.
 *
 * Was hier steht, kommt mit einfachen Formen aus. Motive, die von Handarbeit
 * leben — ein Marktstand, ein Pferd von oben —, sind bewusst nicht dabei; sie
 * gehören in den Asset-Import.
 */

import type { PropDef } from '../propTypes';
import { def } from './defineProp';
import {
  PALETTE,
  bevel,
  blob,
  blocks,
  contactShadow,
  jitterColor,
  offset,
  shade,
  shaded,
  strokes,
  spread,
  fabric,
} from './draw';

// ---------------------------------------------------------------------------
// Dungeon
// ---------------------------------------------------------------------------

export const dungeonProps: PropDef[] = [
  def('altar', 'Altar', 'dungeon', { w: 100, h: 90 }, ['altar', 'tempel', 'ritual'], (g, rng) => {
    const c = jitterColor(PALETTE.stone, rng, 0.08);
    contactShadow(g, 44, 32, 3, 4);
    // Sockel, darüber die überstehende Deckplatte: der Absatz macht aus dem
    // Klotz einen Altar.
    g.rect(-40, -27, 78, 54).fill({ color: shade(c, -0.3) });
    g.rect(-45, -32, 84, 60).fill({ color: c });
    blocks(g, rng, -45, -32, 84, 60, c, 3, 2);
    g.rect(-45, -32, 84, 60).stroke({ width: 1.8, color: shade(c, -0.45) });
    bevel(g, -45, -32, 84, 60, c, 0.22);
    // Opferrinne, die bis zur Kante läuft — das macht ihn als Altar lesbar.
    g.rect(-28, -16, 50, 5).fill({ color: shade(c, -0.4), alpha: 0.85 });
    g.rect(-5, -16, 5, 40).fill({ color: shade(c, -0.4), alpha: 0.85 });
    g.rect(-5, 20, 5, 8).fill({ color: shade(c, -0.5), alpha: 0.9 });
    // Kerzen an den Ecken, Schale in der Mitte.
    for (const [x, y] of [[-33, -22], [27, -22], [-33, 18], [27, 18]]) {
      g.circle(x, y, 3.4).fill({ color: 0xe8e1cc });
      g.circle(x, y, 1.4).fill({ color: PALETTE.fire, alpha: 0.9 });
    }
    g.circle(-2.5, 2, 9).fill({ color: shade(c, -0.42) });
    g.circle(-2.5, 2, 7).fill({ color: 0x2a1a12 });
    if (rng.bool(0.55)) {
      g.poly(offset(blob(rng, 6, 0.35, 12, 0.8), -2.5, 2)).fill({ color: 0x6e1b1b, alpha: 0.65 });
      g.poly(offset(blob(rng, 3, 0.4, 10, 0.9), -3, 24)).fill({ color: 0x6e1b1b, alpha: 0.5 });
    }
    strokes(g, rng, rng.int(4, 7), 34, 9, shade(c, -0.35), 1, 0.35);
  }),

  def('sarcophagus', 'Sarkophag', 'dungeon', { w: 74, h: 132 }, ['sarg', 'grab', 'krypta'], (g, rng) => {
    const c = jitterColor(PALETTE.stoneLight, rng, 0.08);
    contactShadow(g, 32, 62, 3, 4);
    // Trog, darauf der etwas kleinere Deckel — der Spalt dazwischen ist das,
    // was einen Sarkophag von einem Steinblock unterscheidet.
    g.poly([-30, -62, 30, -62, 35, -20, 33, 60, -33, 60, -35, -20]).fill({ color: shade(c, -0.3) });
    const deckel = [-27, -59, 27, -59, 31, -20, 29, 56, -29, 56, -31, -20];
    g.poly(deckel).fill({ color: c });
    g.poly(deckel).stroke({ width: 1.6, color: shade(c, -0.45), alpha: 0.8 });
    // Gestalt im Relief: Kopf, Schultern, über der Brust gefaltete Arme.
    g.circle(0, -40, 10).fill({ color: shade(c, 0.14) });
    g.circle(0, -40, 10).stroke({ width: 1, color: shade(c, -0.3), alpha: 0.6 });
    g.poly([-15, -28, 15, -28, 12, 44, -12, 44]).fill({ color: shade(c, 0.08) });
    g.poly([-15, -28, 15, -28, 12, 44, -12, 44]).stroke({ width: 1, color: shade(c, -0.32), alpha: 0.55 });
    for (const s of [-1, 1]) {
      g.poly([s * 13, -24, s * 4, -6, s * 3, 6, s * 12, -4]).fill({ color: shade(c, -0.06) });
    }
    // Inschriftband am Fußende.
    g.rect(-18, 46, 36, 8).fill({ color: shade(c, -0.2), alpha: 0.7 });
    for (let i = 0; i < 5; i++) {
      g.rect(-15 + i * 6.5, 48, rng.range(2, 4.5), 4).fill({ color: shade(c, -0.45), alpha: 0.7 });
    }
    strokes(g, rng, rng.int(3, 6), 28, 9, shade(c, -0.35), 1, 0.3);
  }),

  def('gravestone', 'Grabstein', 'dungeon', { w: 56, h: 76 }, ['grab', 'stein', 'friedhof'], (g, rng) => {
    const c = jitterColor(PALETTE.stone, rng, 0.12);
    const neigung = rng.range(-0.16, 0.16);
    const dx = Math.sin(neigung) * 14;
    contactShadow(g, 22, 8, 2, 24, 0.35);
    // Etwas Gras am Fuß — der Stein steckt im Boden, er liegt nicht darauf.
    for (let i = 0; i < 7; i++) {
      const x = rng.range(-20, 20);
      g.moveTo(x, 26)
        .lineTo(x + rng.range(-3, 3), 26 - rng.range(4, 9))
        .stroke({ width: 1.3, color: shade(PALETTE.grass, rng.range(-0.2, 0.1)), alpha: 0.75 });
    }
    const korpus = [-18 + dx, -26, 18 + dx, -26, 20, 24, -20, 24];
    g.poly(korpus).fill({ color: c });
    g.ellipse(dx, -26, 18, 12).fill({ color: c });
    // Verwitterung: hellere Kante oben, Flecken, ein Riss.
    g.ellipse(dx - 3, -29, 12, 7).fill({ color: shade(c, 0.2), alpha: 0.5 });
    for (let i = 0; i < rng.int(2, 5); i++) {
      g.poly(
        offset(
          blob(rng, rng.range(2.5, 5), 0.4, 10, 0.7),
          rng.range(-14, 14) + dx * 0.5,
          rng.range(-18, 18),
        ),
      ).fill({ color: shade(c, rng.bool() ? -0.2 : 0.16), alpha: 0.4 });
    }
    if (rng.bool(0.6)) {
      const rx = rng.range(-10, 10) + dx * 0.5;
      g.moveTo(rx, -20)
        .lineTo(rx + rng.range(-4, 4), -6)
        .lineTo(rx + rng.range(-6, 6), 12)
        .stroke({ width: 1.2, color: shade(c, -0.45), alpha: 0.6 });
    }
    // Eingemeißeltes Zeichen und Schriftzeilen.
    g.circle(dx * 0.7, -22, 5).stroke({ width: 1.4, color: shade(c, -0.42), alpha: 0.7 });
    for (let i = 0; i < rng.int(2, 4); i++) {
      const b = rng.range(8, 13);
      g.rect(-b / 2 + dx * 0.6, -8 + i * 9, b, 2.2).fill({ color: shade(c, -0.38), alpha: 0.65 });
    }
    g.poly(korpus).stroke({ width: 1.4, color: shade(c, -0.45), alpha: 0.6 });
  }),

  def('statue', 'Statue', 'dungeon', 84, ['statue', 'figur', 'tempel'], (g, rng) => {
    const c = jitterColor(PALETTE.stoneLight, rng, 0.08);
    contactShadow(g, 34, 34, 2, 3);
    // Zwei Sockelstufen statt einer Scheibe.
    g.circle(0, 0, 34).fill({ color: shade(c, -0.32) });
    g.circle(0, 0, 34).stroke({ width: 1.4, color: shade(c, -0.5), alpha: 0.7 });
    g.circle(0, 0, 27).fill({ color: shade(c, -0.16) });
    g.circle(0, 0, 27).stroke({ width: 1, color: shade(c, -0.45), alpha: 0.5 });
    // Von oben: Umhang, Schultern, Kopf, ein erhobener und zwei hängende Arme.
    g.poly(blob(rng, 18, 0.14, 18, 1.15)).fill({ color: shade(c, -0.05) });
    for (const s of [-1, 1]) {
      g.roundRect(s * 13 - 4, -4, 8, 20, 4).fill({ color: shade(c, 0.04) });
    }
    g.roundRect(-4, -26, 8, 20, 4).fill({ color: shade(c, -0.14), alpha: 0.5 });
    g.roundRect(-3, -25, 6, 18, 3).fill({ color: shade(c, 0.12) });
    g.ellipse(0, 2, 14, 10).fill({ color: shade(c, 0.06) });
    g.circle(0, -7, 8.5).fill({ color: shade(c, 0.22) });
    g.circle(-2.5, -9.5, 4).fill({ color: shade(c, 0.35), alpha: 0.6 });
    strokes(g, rng, rng.int(4, 7), 24, 7, shade(c, -0.38), 1, 0.3);
  }),

  def('gear', 'Zahnrad', 'dungeon', 70, ['zahnrad', 'mechanik', 'maschine'], (g, rng) => {
    const c = jitterColor(PALETTE.metalDark, rng, 0.12);
    const zaehne = rng.int(8, 12);
    const r = 28;
    const pts: number[] = [];
    for (let i = 0; i < zaehne * 4; i++) {
      const a = (i / (zaehne * 4)) * Math.PI * 2;
      // Vier Stützpunkte je Zahn ergeben die Rechteckform statt eines Sterns.
      const stufe = i % 4;
      const rr = stufe === 1 || stufe === 2 ? r : r * 0.8;
      pts.push(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    shaded(g, pts, c, { shadow: 2.5, highlight: 0.2, outline: 0.5 });
    g.circle(0, 0, 9).fill({ color: 0x1e1c1a });
    g.circle(0, 0, 14).stroke({ width: 2, color: shade(c, -0.3), alpha: 0.7 });
  }),

  def('beartrap', 'Bärenfalle', 'dungeon', 56, ['falle', 'baerenfalle', 'gefahr'], (g, rng) => {
    const c = jitterColor(PALETTE.metal, rng, 0.1);
    g.circle(1, 1.5, 15).fill({ color: 0x000000, alpha: 0.22 });
    g.circle(0, 0, 15).stroke({ width: 3, color: shade(c, -0.2) });
    g.circle(0, 0, 9).fill({ color: shade(c, -0.45), alpha: 0.6 });
    // Zähne als Dreiecke am Rand.
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const ix = Math.cos(a) * 13;
      const iy = Math.sin(a) * 13;
      const ox = Math.cos(a + 0.13) * 6;
      const oy = Math.sin(a + 0.13) * 6;
      const ox2 = Math.cos(a - 0.13) * 6;
      const oy2 = Math.sin(a - 0.13) * 6;
      g.poly([ix, iy, ox, oy, ox2, oy2]).fill({ color: c });
    }
    g.moveTo(-15, 0).lineTo(-26, rng.range(-6, 6)).stroke({ width: 2, color: shade(c, -0.3) });
  }),

  def('trapdoor', 'Falltür', 'struktur', 90, ['falltuer', 'luke', 'geheim'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    g.rect(-34, -34, 68, 68).fill({ color: 0x1a1614 });
    g.rect(-31, -31, 62, 62).fill({ color: c });
    for (let i = 0; i < 4; i++) {
      g.rect(-31, -31 + i * 15.5, 62, 1.4).fill({ color: shade(c, -0.35), alpha: 0.7 });
    }
    // Beschläge und Ring.
    for (const s of [-1, 1]) {
      g.rect(-31, s * 22 - 3, 62, 6).fill({ color: PALETTE.metalDark, alpha: 0.9 });
    }
    g.circle(0, 0, 8).stroke({ width: 3, color: PALETTE.metal });
    strokes(g, rng, rng.int(4, 8), 26, 9, shade(c, -0.3), 1, 0.35);
  }),

  def('ladder', 'Leiter', 'struktur', { w: 44, h: 120 }, ['leiter', 'aufstieg'], (g, rng) => {
    const c = jitterColor(PALETTE.woodLight, rng, 0.1);
    for (const s of [-1, 1]) {
      g.rect(s * 14 - 3, -56, 6, 112).fill({ color: c });
      g.rect(s * 14 - 3, -56, 6, 112).stroke({ width: 1, color: shade(c, -0.35), alpha: 0.6 });
    }
    const sprossen = 7;
    for (let i = 0; i < sprossen; i++) {
      const y = -46 + (i * 92) / (sprossen - 1);
      g.rect(-14, y - 2.5, 28, 5).fill({ color: shade(c, -0.12) });
    }
  }),

  def('stairs_spiral', 'Wendeltreppe', 'struktur', 100, ['treppe', 'wendel', 'aufstieg'], (g, rng) => {
    const c = jitterColor(PALETTE.stone, rng, 0.08);
    g.circle(2, 2, 44).fill({ color: 0x000000, alpha: 0.22 });
    g.circle(0, 0, 44).fill({ color: shade(c, -0.3) });
    const stufen = 12;
    const start = rng.range(0, Math.PI * 2);
    for (let i = 0; i < stufen; i++) {
      const a0 = start + (i / stufen) * Math.PI * 2;
      const a1 = start + ((i + 1) / stufen) * Math.PI * 2;
      g.poly([
        Math.cos(a0) * 11, Math.sin(a0) * 11,
        Math.cos(a0) * 43, Math.sin(a0) * 43,
        Math.cos(a1) * 43, Math.sin(a1) * 43,
        Math.cos(a1) * 11, Math.sin(a1) * 11,
      ]).fill({ color: shade(c, (i / stufen) * 0.35 - 0.05) });
      g.moveTo(Math.cos(a0) * 11, Math.sin(a0) * 11)
        .lineTo(Math.cos(a0) * 43, Math.sin(a0) * 43)
        .stroke({ width: 1.2, color: shade(c, -0.45), alpha: 0.6 });
    }
    g.circle(0, 0, 11).fill({ color: shade(c, 0.1) });
  }),

  def('pit', 'Grube', 'struktur', 110, ['grube', 'loch', 'falle'], (g, rng) => {
    const pts = blob(rng, 44, 0.14, 22, rng.range(0.85, 1));
    g.poly(pts).fill({ color: 0x0d0b0a });
    // Heller Rand innen: sonst wirkt das Loch wie ein aufgemalter Fleck.
    g.poly(pts).stroke({ width: 4, color: shade(PALETTE.earthDark, -0.2), alpha: 0.9 });
    g.poly(offset(blob(rng, 34, 0.18, 20, 0.9), rng.range(-4, 4), rng.range(-4, 4))).fill({
      color: 0x000000,
      alpha: 0.7,
    });
    strokes(g, rng, rng.int(5, 9), 46, 8, shade(PALETTE.earth, -0.15), 1.2, 0.4);
  }),

  def('mirror', 'Spiegel', 'moebel', { w: 50, h: 84 }, ['spiegel', 'moebel'], (g, rng) => {
    const rahmen = jitterColor(PALETTE.woodDark, rng, 0.12);
    g.rect(-19, -36, 40, 74).fill({ color: 0x000000, alpha: 0.22 });
    g.rect(-21, -38, 40, 74).fill({ color: rahmen });
    g.rect(-16, -33, 30, 64).fill({ color: 0x7f95a3 });
    // Schräger Glanz macht die Fläche als Glas lesbar.
    g.poly([-16, 10, -16, -6, 6, -33, 14, -33]).fill({ color: 0xd8e6ee, alpha: 0.45 });
    g.rect(-21, -38, 40, 74).stroke({ width: 1.2, color: shade(rahmen, -0.4), alpha: 0.7 });
  }),
];

// ---------------------------------------------------------------------------
// Beute und Kleinkram
// ---------------------------------------------------------------------------

export const lootProps: PropDef[] = [
  def('coins', 'Münzen', 'deko', 54, ['gold', 'muenzen', 'schatz'], (g, rng) => {
    for (let i = 0; i < rng.int(9, 18); i++) {
      const x = spread(rng, 9);
      const y = spread(rng, 8);
      const c = jitterColor(0xd8ad3c, rng, 0.14);
      g.ellipse(x + 0.8, y + 0.8, 4.5, 3.6).fill({ color: 0x000000, alpha: 0.22 });
      g.ellipse(x, y, 4.5, 3.6).fill({ color: c });
      g.ellipse(x - 1, y - 0.8, 2, 1.5).fill({ color: shade(c, 0.35), alpha: 0.8 });
    }
  }),

  def('gems', 'Edelsteine', 'deko', 54, ['edelstein', 'schatz', 'kristall'], (g, rng) => {
    const farben = [0x4aa3c0, 0xc04a6a, 0x5ac06a, 0x8a5ac0, 0xd8c23c];
    for (let i = 0; i < rng.int(3, 6); i++) {
      const x = spread(rng, 9);
      const y = spread(rng, 8);
      const r = rng.range(4, 7);
      const c = jitterColor(rng.pick(farben), rng, 0.1);
      // Facettierter Umriss statt Kreis — sonst sind es Murmeln.
      const a0 = rng.range(0, Math.PI * 2);
      const pts: number[] = [];
      for (let k = 0; k < 6; k++) {
        const a = a0 + (k / 6) * Math.PI * 2;
        pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85);
      }
      g.poly(pts).fill({ color: c });
      g.poly([x, y - r * 0.8, x + r * 0.7, y, x, y + r * 0.3]).fill({
        color: shade(c, 0.4),
        alpha: 0.75,
      });
    }
  }),

  def('scroll', 'Schriftrolle', 'deko', { w: 60, h: 34 }, ['rolle', 'brief', 'karte'], (g, rng) => {
    const c = jitterColor(0xdcd0b0, rng, 0.07);
    g.rect(-24, -8, 48, 17).fill({ color: 0x000000, alpha: 0.2 });
    g.rect(-26, -10, 48, 17).fill({ color: c });
    for (const s of [-1, 1]) {
      g.ellipse(s * 24 - 2, -1.5, 4, 9).fill({ color: shade(c, -0.18) });
    }
    for (let i = 0; i < rng.int(2, 4); i++) {
      g.moveTo(-18, -5 + i * 4.5)
        .lineTo(rng.range(4, 16), -5 + i * 4.5)
        .stroke({ width: 0.9, color: 0x6b5a42, alpha: 0.6 });
    }
  }),

  def('books', 'Bücher', 'deko', 48, ['buch', 'wissen', 'bibliothek'], (g, rng) => {
    const farben = [0x7a3b34, 0x35563f, 0x2f4560, 0x6b5326];
    for (let i = 0; i < rng.int(2, 4); i++) {
      const x = rng.range(-8, 8);
      const y = -6 + i * 5;
      const w = rng.range(16, 22);
      const h = rng.range(11, 15);
      const c = jitterColor(rng.pick(farben), rng, 0.1);
      g.rect(x - w / 2 + 1, y - h / 2 + 1, w, h).fill({ color: 0x000000, alpha: 0.2 });
      g.rect(x - w / 2, y - h / 2, w, h).fill({ color: c });
      g.rect(x - w / 2, y - h / 2, 3.5, h).fill({ color: shade(c, -0.3) });
      g.rect(x - w / 2 + 4, y - h / 2 + 1.5, w - 5.5, h - 3).fill({ color: 0xd8cdb4, alpha: 0.55 });
    }
  }),

  def('bedroll', 'Schlafsack', 'moebel', { w: 66, h: 110 }, ['schlafsack', 'lager', 'rast'], (g, rng) => {
    const c = jitterColor(PALETTE.cloth, rng, 0.14);
    contactShadow(g, 24, 48, 2, 3);
    // Ausgerollte Decke mit Falten, umgeschlagenem Kopfende und aufgerolltem
    // Fußende — ein flaches Rechteck sähe aus wie ein Teppichstreifen.
    fabric(g, rng, -24, -48, 46, 94, c, 6);
    g.roundRect(-24, -48, 46, 94, 3).stroke({ width: 1.6, color: shade(c, -0.45) });
    g.roundRect(-24, -48, 46, 20, 3).fill({ color: shade(c, 0.24) });
    g.moveTo(-24, -28).lineTo(22, -28).stroke({ width: 1.4, color: shade(c, -0.35), alpha: 0.8 });
    // Zusammengerolltes Fußende: drei Wülste.
    for (let i = 0; i < 3; i++) {
      g.roundRect(-24, 30 + i * 5, 46, 6, 3).fill({ color: shade(c, i % 2 ? -0.12 : 0.08) });
      g.roundRect(-24, 30 + i * 5, 46, 6, 3).stroke({ width: 0.9, color: shade(c, -0.4), alpha: 0.7 });
    }
    // Ein Kissen aus zusammengelegtem Zeug.
    g.roundRect(-16, -44, 30, 14, 5).fill({ color: shade(c, 0.34) });
    g.roundRect(-16, -44, 30, 14, 5).stroke({ width: 1, color: shade(c, -0.25), alpha: 0.7 });
    strokes(g, rng, rng.int(3, 6), 18, 12, shade(c, -0.28), 1, 0.3);
  }),

  def('weapons', 'Waffen', 'deko', { w: 100, h: 60 }, ['waffe', 'schwert', 'speer'], (g, rng) => {
    const metall = jitterColor(PALETTE.metal, rng, 0.08);
    const griff = jitterColor(PALETTE.woodDark, rng, 0.12);
    contactShadow(g, 34, 20, 2, 3, 0.24);
    const n = rng.int(2, 3);
    for (let i = 0; i < n; i++) {
      const a = rng.range(-0.5, 0.5) + (i - 1) * 0.4;
      const len = rng.range(32, 42);
      const cx = rng.range(-8, 8);
      const cy = rng.range(-7, 7);
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const spitze = [cx + dx * len * 0.65, cy + dy * len * 0.65];
      const knauf = [cx - dx * len * 0.35, cy - dy * len * 0.35];
      const px = -dy;
      const py = dx;
      // Klinge als Form mit Spitze und Mittelgrat statt als dicker Strich.
      const b = 2.6;
      g.poly([
        spitze[0], spitze[1],
        cx + px * b, cy + py * b,
        knauf[0] + px * b * 0.7, knauf[1] + py * b * 0.7,
        knauf[0] - px * b * 0.7, knauf[1] - py * b * 0.7,
        cx - px * b, cy - py * b,
      ]).fill({ color: metall });
      g.moveTo(knauf[0], knauf[1]).lineTo(spitze[0], spitze[1])
        .stroke({ width: 1, color: shade(metall, 0.4), alpha: 0.8 });
      g.poly([
        spitze[0], spitze[1],
        cx + px * b, cy + py * b,
        knauf[0] + px * b * 0.7, knauf[1] + py * b * 0.7,
        knauf[0] - px * b * 0.7, knauf[1] - py * b * 0.7,
        cx - px * b, cy - py * b,
      ]).stroke({ width: 1, color: shade(metall, -0.5), alpha: 0.8 });
      // Parierstange, Griff, Knauf.
      const px0 = knauf[0] + dx * len * 0.16;
      const py0 = knauf[1] + dy * len * 0.16;
      g.moveTo(px0 + px * 6, py0 + py * 6).lineTo(px0 - px * 6, py0 - py * 6)
        .stroke({ width: 3, color: shade(metall, -0.3), cap: 'round' });
      g.moveTo(knauf[0], knauf[1]).lineTo(px0, py0)
        .stroke({ width: 3.4, color: griff, cap: 'round' });
      g.circle(knauf[0], knauf[1], 2.6).fill({ color: shade(metall, -0.15) });
      g.circle(knauf[0] - 0.6, knauf[1] - 0.6, 1.2).fill({ color: 0xffffff, alpha: 0.4 });
    }
  }),

  def('shield', 'Schild', 'deko', 56, ['schild', 'ruestung', 'wappen'], (g, rng) => {
    const c = jitterColor(rng.pick([0x6a3f38, 0x35563f, 0x2f4560]), rng, 0.1);
    const rand = jitterColor(PALETTE.metal, rng, 0.08);
    const pts = [-20, -22, 20, -22, 20, 6, 0, 24, -20, 6];
    g.poly(offset(pts, 2, 2)).fill({ color: 0x000000, alpha: 0.22 });
    g.poly(pts).fill({ color: rand });
    g.poly([-15, -17, 15, -17, 15, 4, 0, 18, -15, 4]).fill({ color: c });
    g.circle(0, -3, 5).fill({ color: rand });
    g.poly(pts).stroke({ width: 1.4, color: shade(rand, -0.4), alpha: 0.7 });
  }),

  def('pottery', 'Krüge', 'moebel', 60, ['krug', 'amphore', 'tonware'], (g, rng) => {
    contactShadow(g, 22, 20, 2, 2.5);
    for (let i = 0; i < rng.int(2, 4); i++) {
      const x = rng.range(-11, 11);
      const y = rng.range(-9, 9);
      const r = rng.range(7, 11);
      const c = jitterColor(0x9c6a45, rng, 0.14);
      // Von oben: Bauch, Schulter, Halsöffnung — und zwei Henkel, die den
      // Krug erst als Krug lesbar machen.
      for (const s2 of [-1, 1]) {
        g.ellipse(x + s2 * r * 0.95, y, r * 0.3, r * 0.42).fill({ color: shade(c, -0.2) });
      }
      g.circle(x, y, r).fill({ color: c });
      g.circle(x, y, r).stroke({ width: 1.2, color: shade(c, -0.5) });
      g.circle(x, y, r * 0.72).fill({ color: shade(c, 0.12) });
      g.circle(x, y, r * 0.44).fill({ color: shade(c, -0.45) });
      g.circle(x, y, r * 0.32).fill({ color: 0x241a12 });
      // Drehrillen und ein Glanzlicht.
      for (let k = 1; k <= 2; k++) {
        g.circle(x, y, r * (0.55 + k * 0.15))
          .stroke({ width: 0.7, color: shade(c, -0.25), alpha: 0.45 });
      }
      g.arc(x, y, r * 0.85, Math.PI * 1.05, Math.PI * 1.55)
        .stroke({ width: 2, color: 0xffffff, alpha: 0.22 });
      if (rng.bool(0.4)) {
        // Bemalung: ein umlaufendes Band.
        g.circle(x, y, r * 0.86)
          .stroke({ width: 1.6, color: shade(c, -0.55), alpha: 0.65 });
      }
    }
  }),
];

// ---------------------------------------------------------------------------
// Siedlung
// ---------------------------------------------------------------------------

export const settlementProps: PropDef[] = [
  def('fence', 'Zaun', 'struktur', { w: 120, h: 32 }, ['zaun', 'holz', 'hof'], (g, rng) => {
    const c = jitterColor(PALETTE.woodLight, rng, 0.12);
    const pfosten = 5;
    for (let i = 0; i < pfosten; i++) {
      const x = -52 + (i * 104) / (pfosten - 1);
      g.rect(x - 2.5, -12 + rng.range(-1.5, 1.5), 5, 26).fill({ color: c });
      g.rect(x - 2.5, -12, 5, 26).stroke({ width: 0.9, color: shade(c, -0.4), alpha: 0.5 });
    }
    for (const y of [-6, 5]) {
      g.rect(-54, y + rng.range(-1, 1), 108, 3.5).fill({ color: shade(c, -0.1) });
    }
  }),

  def('well', 'Brunnen', 'struktur', 84, ['brunnen', 'wasser', 'dorf'], (g, rng) => {
    const c = jitterColor(PALETTE.stone, rng, 0.1);
    g.circle(2, 3, 34).fill({ color: 0x000000, alpha: 0.24 });
    g.circle(0, 0, 34).fill({ color: c });
    g.circle(0, 0, 24).fill({ color: 0x14212a });
    g.circle(0, 0, 21).fill({ color: shade(PALETTE.water, -0.4), alpha: 0.9 });
    // Steine im Kranz einzeln andeuten.
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      g.moveTo(Math.cos(a) * 24, Math.sin(a) * 24)
        .lineTo(Math.cos(a) * 34, Math.sin(a) * 34)
        .stroke({ width: 1.2, color: shade(c, -0.4), alpha: 0.6 });
    }
    // Querbalken mit Seil.
    const holz = jitterColor(PALETTE.wood, rng, 0.1);
    g.rect(-38, -4, 76, 7).fill({ color: holz });
    g.circle(0, 0, 4).fill({ color: shade(holz, -0.35) });
  }),

  def('tent', 'Zelt', 'struktur', { w: 106, h: 100 }, ['zelt', 'lager', 'camp'], (g, rng) => {
    const c = jitterColor(0xa8926a, rng, 0.12);
    g.poly([-42, 40, 0, -42, 42, 40]).fill({ color: 0x000000, alpha: 0.22 });
    g.poly([-44, 38, 0, -44, 40, 38]).fill({ color: c });
    // Firstlinie und Eingangsschlitz.
    g.moveTo(0, -44).lineTo(0, 38).stroke({ width: 2, color: shade(c, -0.35), alpha: 0.8 });
    g.poly([-10, 38, 0, 2, 10, 38]).fill({ color: 0x2a241c, alpha: 0.85 });
    for (const s of [-1, 1]) {
      g.moveTo(s * 42, 38)
        .lineTo(s * 52, 44)
        .stroke({ width: 1.4, color: shade(c, -0.4), alpha: 0.7 });
    }
  }),

  def('signpost', 'Wegweiser', 'struktur', { w: 90, h: 62 }, ['schild', 'weg', 'wegweiser'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.12);
    g.circle(2, 2, 6).fill({ color: 0x000000, alpha: 0.24 });
    g.circle(0, 0, 5.5).fill({ color: shade(c, -0.2) });
    const bretter = rng.int(1, 3);
    for (let i = 0; i < bretter; i++) {
      const y = -6 - i * 12;
      const dir = rng.bool() ? 1 : -1;
      const w = rng.range(26, 36);
      const x = dir > 0 ? 3 : -3 - w;
      g.rect(x + 1.5, y + 1.5, w, 9).fill({ color: 0x000000, alpha: 0.2 });
      g.rect(x, y, w, 9).fill({ color: c });
      // Spitze am freien Ende zeigt die Richtung an.
      const tipX = dir > 0 ? x + w : x;
      g.poly([tipX, y - 1, tipX + dir * 6, y + 4.5, tipX, y + 10]).fill({ color: c });
      g.moveTo(x + 4, y + 4.5)
        .lineTo(x + w - 4, y + 4.5)
        .stroke({ width: 1, color: shade(c, -0.4), alpha: 0.5 });
    }
  }),

  def('cobblestone', 'Pflaster', 'boden', 110, ['pflaster', 'weg', 'strasse'], (g, rng) => {
    for (let i = 0; i < rng.int(22, 34); i++) {
      const x = rng.range(-46, 46);
      const y = rng.range(-46, 46);
      const r = rng.range(5, 9);
      const c = jitterColor(PALETTE.stone, rng, 0.16);
      g.poly(offset(blob(rng, r, 0.16, 8, rng.range(0.8, 1)), x, y)).fill({
        color: c,
        alpha: rng.range(0.8, 1),
      });
    }
  }),

  def('cart', 'Handkarren', 'struktur', { w: 110, h: 70 }, ['karren', 'wagen', 'markt'], (g, rng) => {
    const c = jitterColor(PALETTE.wood, rng, 0.1);
    g.rect(-38, -26, 76, 52).fill({ color: 0x000000, alpha: 0.2 });
    g.rect(-40, -28, 76, 52).fill({ color: c });
    for (let i = 0; i < 5; i++) {
      g.rect(-40, -28 + i * 11, 76, 1.4).fill({ color: shade(c, -0.35), alpha: 0.7 });
    }
    g.rect(-40, -28, 76, 52).stroke({ width: 1.4, color: shade(c, -0.45), alpha: 0.7 });
    // Räder seitlich, Deichsel nach vorn.
    for (const s of [-1, 1]) {
      g.ellipse(-14, s * 30, 13, 5).fill({ color: shade(c, -0.5) });
    }
    g.moveTo(36, 0).lineTo(52, 0).stroke({ width: 4, color: shade(c, -0.15), cap: 'round' });
  }),
];
