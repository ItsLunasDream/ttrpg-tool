/**
 * Höhle und Insel — dieselbe Technik, einmal als Hohlraum, einmal als Fläche.
 *
 * Cellular Automata: ein verrauschtes Raster wird mehrfach geglättet, indem
 * jedes Feld den Zustand seiner Mehrheit annimmt. Aus Rauschen werden dabei
 * rundliche, zusammenhängende Kammern — der Effekt, den man von Höhlen kennt.
 *
 * Der Unterschied zwischen beidem ist, was am Rand liegt: bei der Höhle ist
 * das Außen Fels (die Kammer wächst nach innen), bei der Insel ist das Außen
 * Wasser (die Landmasse endet vorher).
 */

import { Rng } from '../rng';
import { chaikin, douglasPeucker } from '../geometry';
import { CellGrid, keepLargestRegion, traceOutlines } from './grid';
import { emptyResult, type BaseOptions, type GeneratedMap } from './types';

export interface CaveOptions extends BaseOptions {
  /** Anteil anfangs gefüllter Felder. Höher = engere Höhle. */
  density: number;
  /** Glättungsdurchgänge. Mehr = rundere Kammern. */
  smoothing: number;
  /** Stalagmiten und Steine streuen. */
  decorate: boolean;
}

export interface IslandOptions extends BaseOptions {
  density: number;
  smoothing: number;
  /** Wie stark die Küste ausfranst: 0 = glatt, 1 = viele Buchten. */
  roughness: number;
  /** Bewuchs im Inselinneren. */
  decorate: boolean;
}

export function defaultCaveOptions(): Omit<CaveOptions, 'seed' | 'tileSize'> {
  return { cols: 46, rows: 32, density: 0.45, smoothing: 4, decorate: true };
}

export function defaultIslandOptions(): Omit<IslandOptions, 'seed' | 'tileSize'> {
  return { cols: 46, rows: 36, density: 0.52, smoothing: 4, roughness: 0.4, decorate: true };
}

/**
 * Rauschen erzeugen und glätten.
 *
 * `randabstand` hält einen Rahmen frei bzw. voll — ohne ihn läuft die Fläche
 * über den Kartenrand hinaus und der Umriss wird dort abgeschnitten.
 */
function automat(
  rng: Rng,
  cols: number,
  rows: number,
  density: number,
  runden: number,
  randVoll: boolean,
  maske?: (c: number, r: number) => number | null,
): CellGrid {
  let grid = new CellGrid(cols, rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const erzwungen = maske?.(c, r);
      if (erzwungen !== null && erzwungen !== undefined) {
        grid.set(c, r, erzwungen);
        continue;
      }
      grid.set(c, r, rng.next() < density ? 1 : 0);
    }
  }

  for (let i = 0; i < runden; i++) {
    const naechste = new CellGrid(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const erzwungen = maske?.(c, r);
        if (erzwungen !== null && erzwungen !== undefined) {
          naechste.set(c, r, erzwungen);
          continue;
        }
        const n = grid.neighbours(c, r, randVoll);
        // Die klassische 4/5-Regel: fünf oder mehr belegte Nachbarn füllen,
        // drei oder weniger leeren. Dazwischen bleibt es, wie es war.
        if (n > 4) naechste.set(c, r, 1);
        else if (n < 4) naechste.set(c, r, 0);
        else naechste.set(c, r, grid.get(c, r));
      }
    }
    grid = naechste;
  }
  return grid;
}

/**
 * Rasterring in Weltpunkte, weichgezeichnet und danach ausgedünnt.
 *
 * Chaikin verdoppelt bei jedem Durchgang die Punktzahl — ein Höhlenumriss käme
 * so auf mehrere hundert Stützpunkte, und in Foundry wäre jeder davon ein
 * eigenes Wandsegment. Douglas-Peucker nimmt hinterher heraus, was die Form
 * nicht braucht; die weiche Linie bleibt, die Segmentzahl fällt deutlich.
 */
function ringZuWelt(ring: number[], tile: number, glatt: number): number[] {
  const welt = ring.map((v) => v * tile);
  if (glatt <= 0) return welt;
  const weich = chaikin(welt, glatt, true);
  const duenn = douglasPeucker(weich, tile * 0.12);
  // Unter drei Ecken wäre es keine Fläche mehr — dann lieber die dichte Fassung.
  return duenn.length >= 6 ? duenn : weich;
}

export function generateCave(opts: CaveOptions): GeneratedMap {
  const rng = new Rng(opts.seed);
  const ergebnis = emptyResult(opts.cols, opts.rows);

  // Außen ist Fels: der Rand wird als belegt gezählt, damit die Kammer sich
  // von der Kante löst, statt am Bildrand abgeschnitten zu werden.
  const rand = (c: number, r: number) =>
    c < 2 || r < 2 || c >= opts.cols - 2 || r >= opts.rows - 2 ? 0 : null;

  const roh = automat(rng, opts.cols, opts.rows, 1 - opts.density, opts.smoothing, true, rand);
  const hohl = keepLargestRegion(roh);
  if (hohl.count() === 0) return ergebnis;

  const s = opts.tileSize;
  for (const ring of traceOutlines(hohl)) {
    const punkte = ringZuWelt(ring, s, 4);
    ergebnis.walls.push({ points: punkte, closed: true });
    ergebnis.floors.push({ points: punkte, color: 0x453f38 });
  }

  if (opts.decorate) {
    const streu = ['stone_small', 'stone_medium', 'rubble', 'mushrooms', 'boulder_mossy'];
    const felder: Array<[number, number]> = [];
    for (let r = 0; r < opts.rows; r++) {
      for (let c = 0; c < opts.cols; c++) if (hohl.filled(c, r)) felder.push([c, r]);
    }
    const anzahl = Math.floor(felder.length * 0.05);
    for (let i = 0; i < anzahl; i++) {
      const [c, r] = rng.pick(felder);
      ergebnis.props.push({
        propId: rng.pick(streu),
        x: (c + rng.range(0.2, 0.8)) * s,
        y: (r + rng.range(0.2, 0.8)) * s,
        scale: rng.range(0.6, 1.3),
        rotation: rng.range(0, Math.PI * 2),
      });
    }
  }

  return ergebnis;
}

export function generateIsland(opts: IslandOptions): GeneratedMap {
  const rng = new Rng(opts.seed);
  const ergebnis = emptyResult(opts.cols, opts.rows);

  const mx = (opts.cols - 1) / 2;
  const my = (opts.rows - 1) / 2;

  /**
   * Radiale Maske: zur Mitte hin Land, zum Rand hin Wasser. Ohne sie ergäbe
   * der Automat eine über die ganze Karte verteilte Fleckenlandschaft statt
   * einer Insel.
   *
   * `roughness` verschiebt die Grenze pro Feld etwas — daraus entstehen die
   * Buchten und Landzungen.
   */
  const maske = (c: number, r: number): number | null => {
    const dx = (c - mx) / mx;
    const dy = (r - my) / my;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0.92) return 0; // Rand immer Wasser.
    if (d < 0.25) return 1; // Kern immer Land.
    return null;
  };

  const dichteFuer = (c: number, r: number) => {
    const dx = (c - mx) / mx;
    const dy = (r - my) / my;
    const d = Math.sqrt(dx * dx + dy * dy);
    // Von innen nach außen fallende Landwahrscheinlichkeit.
    return Math.max(0, Math.min(1, (0.92 - d) / 0.67));
  };

  let grid = new CellGrid(opts.cols, opts.rows);
  for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      const fest = maske(c, r);
      if (fest !== null) {
        grid.set(c, r, fest);
        continue;
      }
      const p = dichteFuer(c, r) * (1 - opts.roughness * 0.5) + opts.density * opts.roughness * 0.5;
      grid.set(c, r, rng.next() < p ? 1 : 0);
    }
  }

  for (let i = 0; i < opts.smoothing; i++) {
    const naechste = new CellGrid(opts.cols, opts.rows);
    for (let r = 0; r < opts.rows; r++) {
      for (let c = 0; c < opts.cols; c++) {
        const fest = maske(c, r);
        if (fest !== null) {
          naechste.set(c, r, fest);
          continue;
        }
        const n = grid.neighbours(c, r, false);
        if (n > 4) naechste.set(c, r, 1);
        else if (n < 4) naechste.set(c, r, 0);
        else naechste.set(c, r, grid.get(c, r));
      }
    }
    grid = naechste;
  }

  const land = keepLargestRegion(grid);
  if (land.count() === 0) return ergebnis;

  const s = opts.tileSize;
  const ringe = traceOutlines(land);
  for (const ring of ringe) {
    const punkte = ringZuWelt(ring, s, 4);
    // Strand als etwas größerer Umriss darunter, dann die Grasfläche.
    ergebnis.floors.push({ points: punkte, color: 0xc9b183 });
  }
  // Zweite, geschrumpfte Lage: das Grün liegt innerhalb des Strands.
  const innen = erodiere(land, 2);
  for (const ring of traceOutlines(innen)) {
    ergebnis.floors.push({ points: ringZuWelt(ring, s, 4), color: 0x6f8a4a });
  }

  if (opts.decorate) {
    const felder: Array<[number, number]> = [];
    for (let r = 0; r < opts.rows; r++) {
      for (let c = 0; c < opts.cols; c++) if (innen.filled(c, r)) felder.push([c, r]);
    }
    const streu = ['bush', 'tree_deciduous', 'grass_tuft', 'stone_small', 'flowers'];
    const anzahl = Math.floor(felder.length * 0.08);
    for (let i = 0; i < anzahl && felder.length > 0; i++) {
      const [c, r] = rng.pick(felder);
      ergebnis.props.push({
        propId: rng.pick(streu),
        x: (c + rng.range(0.2, 0.8)) * s,
        y: (r + rng.range(0.2, 0.8)) * s,
        scale: rng.range(0.7, 1.3),
        rotation: rng.range(0, Math.PI * 2),
      });
    }
    // Strandgut am Übergang.
    const saum: Array<[number, number]> = [];
    for (let r = 0; r < opts.rows; r++) {
      for (let c = 0; c < opts.cols; c++) {
        if (land.filled(c, r) && !innen.filled(c, r)) saum.push([c, r]);
      }
    }
    for (let i = 0; i < Math.floor(saum.length * 0.06) && saum.length > 0; i++) {
      const [c, r] = rng.pick(saum);
      ergebnis.props.push({
        propId: rng.pick(['shells', 'driftwood', 'seaweed']),
        x: (c + rng.range(0.2, 0.8)) * s,
        y: (r + rng.range(0.2, 0.8)) * s,
        scale: rng.range(0.7, 1.2),
        rotation: rng.range(0, Math.PI * 2),
      });
    }
  }

  return ergebnis;
}

/** Schrumpft eine Fläche um n Felder — für den Übergang Strand/Grün. */
function erodiere(grid: CellGrid, n: number): CellGrid {
  let aktuell = grid;
  for (let i = 0; i < n; i++) {
    const naechste = new CellGrid(grid.cols, grid.rows);
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        if (!aktuell.filled(c, r)) continue;
        const alleDa =
          aktuell.filled(c - 1, r) &&
          aktuell.filled(c + 1, r) &&
          aktuell.filled(c, r - 1) &&
          aktuell.filled(c, r + 1);
        if (alleDa) naechste.set(c, r, 1);
      }
    }
    aktuell = naechste;
  }
  return aktuell;
}
