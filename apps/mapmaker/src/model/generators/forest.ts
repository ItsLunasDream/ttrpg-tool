/**
 * Wald-Generator: Poisson-Disk-Sampling mit Dichtemaske.
 *
 * Reiner Zufall streut Bäume in Klumpen und lässt kahle Löcher — beides sieht
 * falsch aus. Poisson-Disk hält einen Mindestabstand ein und ergibt die
 * gleichmäßig-unregelmäßige Verteilung, die ein Wald von oben hat.
 *
 * Umgesetzt als Bridson-Verfahren: um einen bestehenden Punkt werden Kandidaten
 * im Ring zwischen r und 2r gewürfelt; wer weit genug von allen anderen liegt,
 * wird übernommen und selbst zum Ausgangspunkt.
 */

import { Rng } from '../rng';
import { strokeBand } from '../geometry';
import { emptyResult, type BaseOptions, type GeneratedMap } from './types';

export interface ForestOptions extends BaseOptions {
  /** Mindestabstand der Bäume in Tiles. */
  spacing: number;
  /** Anteil Nadelbäume. */
  pineShare: number;
  /** Anzahl Lichtungen. */
  clearings: number;
  /** Pfad durch den Wald legen. */
  path: boolean;
  /** Unterholz: Büsche, Farn, Pilze. */
  undergrowth: boolean;
  /**
   * Gewässer im Wald.
   *
   * Beides zugleich wäre auf einer Battlemap selten sinnvoll — ein Waldstück
   * von 40×30 Feldern hat entweder einen Tümpel oder einen Bach.
   */
  water: 'none' | 'pond' | 'stream';
  /** Anteil Felsbrocken, 0–1. */
  rocks: number;
  /** Anzahl Hügelkuppen. */
  hills: number;
}

export function defaultForestOptions(): Omit<ForestOptions, 'seed' | 'tileSize'> {
  return {
    cols: 40,
    rows: 30,
    spacing: 1.6,
    pineShare: 0.4,
    clearings: 3,
    path: true,
    undergrowth: true,
    water: 'none',
    rocks: 0.15,
    hills: 0,
  };
}

/**
 * Unregelmäßiger runder Umriss.
 *
 * Ein exakter Kreis sieht gebaut aus; ein Tümpel und eine Hügelkuppe haben
 * beide eine Rundung, die *ungefähr* rund ist. Der Radius schwankt darum je
 * Winkel, und die Schwankung ist über den Umlauf zusammenhängend — sonst
 * entstünde ein Zackenstern statt einer Kuppe.
 */
function blob(rng: Rng, cx: number, cy: number, r: number, unruhe = 0.28, ecken = 18): number[] {
  // Ein Wert je Ecke, danach mit den Nachbarn verschliffen.
  const roh = Array.from({ length: ecken }, () => 1 + rng.range(-unruhe, unruhe));
  const glatt = roh.map((_, i) => {
    const a = roh[(i - 1 + ecken) % ecken];
    const b = roh[i];
    const c = roh[(i + 1) % ecken];
    return (a + 2 * b + c) / 4;
  });
  const out: number[] = [];
  for (let i = 0; i < ecken; i++) {
    const w = (i / ecken) * Math.PI * 2;
    out.push(cx + Math.cos(w) * r * glatt[i], cy + Math.sin(w) * r * glatt[i]);
  }
  return out;
}

interface Punkt {
  x: number;
  y: number;
}

/** Bridson-Sampling auf einer Fläche in Tile-Einheiten. */
function poisson(rng: Rng, cols: number, rows: number, r: number, versuche = 24): Punkt[] {
  const zellgroesse = r / Math.SQRT2;
  const gc = Math.ceil(cols / zellgroesse);
  const gr = Math.ceil(rows / zellgroesse);
  const raster = new Int32Array(gc * gr).fill(-1);
  const punkte: Punkt[] = [];
  const aktiv: number[] = [];

  const eintragen = (p: Punkt) => {
    const i = punkte.length;
    punkte.push(p);
    aktiv.push(i);
    const cx = Math.floor(p.x / zellgroesse);
    const cy = Math.floor(p.y / zellgroesse);
    if (cx >= 0 && cy >= 0 && cx < gc && cy < gr) raster[cy * gc + cx] = i;
  };

  const passt = (p: Punkt): boolean => {
    if (p.x < 0 || p.y < 0 || p.x >= cols || p.y >= rows) return false;
    const cx = Math.floor(p.x / zellgroesse);
    const cy = Math.floor(p.y / zellgroesse);
    for (let y = Math.max(0, cy - 2); y <= Math.min(gr - 1, cy + 2); y++) {
      for (let x = Math.max(0, cx - 2); x <= Math.min(gc - 1, cx + 2); x++) {
        const i = raster[y * gc + x];
        if (i < 0) continue;
        const q = punkte[i];
        if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 < r * r) return false;
      }
    }
    return true;
  };

  eintragen({ x: rng.range(0, cols), y: rng.range(0, rows) });

  while (aktiv.length > 0) {
    const k = rng.int(0, aktiv.length - 1);
    const basis = punkte[aktiv[k]];
    let gefunden = false;
    for (let i = 0; i < versuche; i++) {
      const a = rng.range(0, Math.PI * 2);
      const d = rng.range(r, 2 * r);
      const kandidat = { x: basis.x + Math.cos(a) * d, y: basis.y + Math.sin(a) * d };
      if (!passt(kandidat)) continue;
      eintragen(kandidat);
      gefunden = true;
      break;
    }
    // Kein Platz mehr um diesen Punkt — er scheidet aus der aktiven Liste aus.
    if (!gefunden) aktiv.splice(k, 1);
  }
  return punkte;
}

export function generateForest(opts: ForestOptions): GeneratedMap {
  const rng = new Rng(opts.seed);
  const ergebnis = emptyResult(opts.cols, opts.rows);
  const s = opts.tileSize;

  // Waldboden als ganze Fläche.
  ergebnis.floors.push({
    points: [0, 0, opts.cols * s, 0, opts.cols * s, opts.rows * s, 0, opts.rows * s],
    color: 0x4c5c34,
  });

  // Lichtungen als kreisrunde Aussparungen.
  const lichtungen = Array.from({ length: opts.clearings }, () => ({
    x: rng.range(opts.cols * 0.15, opts.cols * 0.85),
    y: rng.range(opts.rows * 0.15, opts.rows * 0.85),
    r: rng.range(2.5, 5),
  }));

  // Pfad als Streckenzug von links nach rechts.
  const pfad: Punkt[] = [];
  if (opts.path) {
    let y = rng.range(opts.rows * 0.3, opts.rows * 0.7);
    for (let x = 0; x <= opts.cols; x += 2) {
      y = Math.max(2, Math.min(opts.rows - 2, y + rng.range(-1.2, 1.2)));
      pfad.push({ x, y });
    }
    // Aus der Mittellinie ein Band machen: die Linie selbst zu füllen ergäbe
    // ein entartetes Polygon ohne Fläche.
    const mittellinie = pfad.flatMap((p) => [p.x * s, p.y * s]);
    ergebnis.floors.push({ points: strokeBand(mittellinie, 0.9 * s), color: 0x8a7a5c });
  }

  /**
   * Hügelkuppen: hellere Flächen mit Felsen am Rand.
   *
   * Höhe lässt sich auf einer Battlemap nicht zeigen, nur andeuten — heller
   * Boden liest sich als Erhebung, und die Steine am Rand geben ihr eine
   * Kante. Sie kommen *vor* die Bäume, damit die darauf stehen können: ein
   * bewaldeter Hügel ist der Normalfall, ein kahler die Ausnahme.
   */
  const kuppen = Array.from({ length: Math.max(0, Math.round(opts.hills)) }, () => ({
    x: rng.range(opts.cols * 0.2, opts.cols * 0.8),
    y: rng.range(opts.rows * 0.2, opts.rows * 0.8),
    r: rng.range(3.5, 6.5),
  }));
  for (const k of kuppen) {
    ergebnis.floors.push({
      points: blob(rng, k.x * s, k.y * s, k.r * s, 0.22),
      color: 0x5c6b3c,
    });
    // Steine auf dem Rand, nicht darin: sie zeichnen die Kante nach.
    const n = Math.round(k.r * 2.2);
    for (let i = 0; i < n; i++) {
      const w = (i / n) * Math.PI * 2 + rng.range(-0.15, 0.15);
      const d = k.r * rng.range(0.82, 1.02);
      ergebnis.props.push({
        propId: rng.pick(['stone_medium', 'boulder_mossy', 'rock']),
        x: (k.x + Math.cos(w) * d) * s,
        y: (k.y + Math.sin(w) * d) * s,
        scale: rng.range(0.7, 1.2),
        rotation: rng.range(0, Math.PI * 2),
      });
    }
  }

  /**
   * Gewässer. Der Tümpel ist ein Blob, der Bach ein Band quer über die Karte.
   *
   * Beide werden als Fläche *und* als Verbotszone geführt: eine Wasserfläche,
   * auf der Bäume stehen, ist der Fehler, den man auf einer erzeugten Karte
   * sofort sieht.
   */
  const wasser: Array<(p: Punkt) => boolean> = [];
  if (opts.water === 'pond') {
    const cx = rng.range(opts.cols * 0.3, opts.cols * 0.7);
    const cy = rng.range(opts.rows * 0.3, opts.rows * 0.7);
    const r = rng.range(3.5, 6);
    ergebnis.floors.push({ points: blob(rng, cx * s, cy * s, r * s, 0.3), color: 0x3d6b7d });
    // Etwas Luft: der Blob ragt an manchen Stellen über r hinaus.
    wasser.push((p) => (p.x - cx) ** 2 + (p.y - cy) ** 2 < (r * 1.32) ** 2);
    // Schilf am Ufer.
    const n = Math.round(r * 3);
    for (let i = 0; i < n; i++) {
      const w = rng.range(0, Math.PI * 2);
      const d = r * rng.range(1.05, 1.28);
      ergebnis.props.push({
        propId: rng.pick(['grass_tuft', 'fern', 'flowers']),
        x: (cx + Math.cos(w) * d) * s,
        y: (cy + Math.sin(w) * d) * s,
        scale: rng.range(0.7, 1.1),
        rotation: rng.range(0, Math.PI * 2),
      });
    }
  } else if (opts.water === 'stream') {
    const bach: Punkt[] = [];
    let x = rng.range(opts.cols * 0.25, opts.cols * 0.75);
    for (let y = -1; y <= opts.rows + 1; y += 2) {
      x = Math.max(2, Math.min(opts.cols - 2, x + rng.range(-1.4, 1.4)));
      bach.push({ x, y });
    }
    const breite = rng.range(0.9, 1.6);
    ergebnis.floors.push({
      points: strokeBand(bach.flatMap((p) => [p.x * s, p.y * s]), breite * s),
      color: 0x3d6b7d,
    });
    const nah = (breite + 0.5) ** 2;
    wasser.push((p) => bach.some((q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 < nah));
  }

  const imWasser = (p: Punkt): boolean => wasser.some((f) => f(p));

  const inLichtung = (p: Punkt): boolean =>
    lichtungen.some((l) => (p.x - l.x) ** 2 + (p.y - l.y) ** 2 < l.r * l.r);

  const aufPfad = (p: Punkt): boolean =>
    pfad.some((q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 < 1.4 * 1.4);

  const freiHalten = (p: Punkt): boolean => inLichtung(p) || aufPfad(p) || imWasser(p);

  for (const p of poisson(rng, opts.cols, opts.rows, opts.spacing)) {
    if (freiHalten(p)) continue;
    const nadel = rng.next() < opts.pineShare;
    ergebnis.props.push({
      propId: nadel ? 'tree_pine' : 'tree_deciduous',
      x: p.x * s,
      y: p.y * s,
      scale: rng.range(0.8, 1.35),
      rotation: rng.range(0, Math.PI * 2),
    });
  }

  if (opts.undergrowth) {
    const streu = ['bush', 'fern', 'grass_tuft', 'mushrooms', 'stone_small', 'leaves', 'log'];
    // Dichter als die Bäume, aber mit demselben Verfahren — sonst klumpt es.
    for (const p of poisson(rng, opts.cols, opts.rows, opts.spacing * 0.55)) {
      // Auf dem Pfad wächst nichts; auf einer Lichtung nur vereinzelt Gras.
      if (aufPfad(p) || imWasser(p)) continue;
      if (inLichtung(p) && rng.bool(0.85)) continue;
      if (rng.bool(0.45)) continue;
      ergebnis.props.push({
        propId: rng.pick(streu),
        x: p.x * s,
        y: p.y * s,
        scale: rng.range(0.6, 1.15),
        rotation: rng.range(0, Math.PI * 2),
      });
    }
  }

  /**
   * Felsbrocken, gestreut wie die Bäume.
   *
   * Eigener Durchgang und nicht unter das Unterholz gemischt: Steine sollen
   * sich vom Anteil her getrennt regeln lassen, und ein Wald ohne Unterholz
   * darf trotzdem steinig sein.
   */
  if (opts.rocks > 0) {
    for (const p of poisson(rng, opts.cols, opts.rows, opts.spacing * 1.4)) {
      if (aufPfad(p) || imWasser(p)) continue;
      if (!rng.bool(opts.rocks)) continue;
      ergebnis.props.push({
        propId: rng.pick(['stone_medium', 'boulder_mossy', 'rock', 'rubble']),
        x: p.x * s,
        y: p.y * s,
        scale: rng.range(0.7, 1.3),
        rotation: rng.range(0, Math.PI * 2),
      });
    }
  }

  return ergebnis;
}
