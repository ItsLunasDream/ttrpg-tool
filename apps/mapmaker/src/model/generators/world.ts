/**
 * Weltkarten-Generator.
 *
 * Höhe und Feuchte kommen aus fraktalem Simplex-Noise, das Biom aus beidem —
 * grob nach Whittaker: was warm und feucht ist, wird Wald, was warm und trocken
 * ist, Wüste, und was hoch liegt, Fels und Schnee. Die Küstenlinie fällt dabei
 * von selbst ab, sie ist die Grenze zwischen Land und Wasser.
 *
 * Wichtig: Universal VTT beschreibt nur Quadratraster mit Sichtlinien. Für eine
 * Weltkarte ist der Bild-Export der Hauptweg — hier entstehen deshalb keine
 * Wände, sondern nur Flächen und Signaturen.
 */

import { createNoise2D } from 'simplex-noise';
import { Rng } from '../rng';
import { chaikin, douglasPeucker, strokeBand } from '../geometry';
import { CellGrid, traceOutlines } from './grid';
import { defaultPlateOptions, makePlates, plateField } from './plates';
import { pathField, tracePath } from './path';
import { emptyResult, type BaseOptions, type GeneratedMap } from './types';

export interface WorldOptions extends BaseOptions {
  /** Anteil Wasser, 0–1. Höher = mehr Meer. */
  seaLevel: number;
  /** Größe der Landformen; klein = zerklüftet, groß = weite Kontinente. */
  scale: number;
  /** Fraktale Lagen. Mehr = mehr Kleinformen. */
  octaves: number;
  /** Anzahl Flüsse. */
  rivers: number;
  /** Signaturen für Gebirge, Wald, Siedlungen streuen. */
  decorate: boolean;
  /** Wie viele benannte Siedlungen gesetzt werden; 0 schaltet sie ab. */
  settlements: number;
  /** Straßen zwischen den Siedlungen ziehen. */
  roads: boolean;
  /** Kompassrose und Maßstabsleiste setzen. */
  cartouche: boolean;
  /**
   * Woraus die Landmassen entstehen.
   *
   * `noise` ist fraktales Rauschen: weiche, überall gleich aussehende Küsten.
   * `plates` legt tektonische Platten darüber — geradere Ränder und Gebirge
   * *entlang der Nähte* statt zufällig verstreut. Ein zweites Rauschen mit
   * anderen Werten wäre keine Alternative gewesen, sondern dasselbe in anderer
   * Frequenz.
   */
  variant: 'noise' | 'plates';
  /** Nur bei `plates`: Anteil Kontinentalplatten, 0 bis 1. */
  landShare: number;
  /**
   * Auf Hexfelder umstellen.
   *
   * Für Weltkarten das übliche Raster: eine Hexkante ist in jede Richtung
   * gleich weit, und Reiseweiten stimmen damit auch schräg. Auf einer
   * Battlemap ginge das nicht — Universal VTT beschreibt nur Quadrate.
   */
  hexGrid: boolean;
}

export function defaultWorldOptions(): Omit<WorldOptions, 'seed' | 'tileSize'> {
  return {
    cols: 64,
    rows: 44,
    seaLevel: 0.42,
    scale: 0.055,
    octaves: 5,
    rivers: 5,
    settlements: 7,
    roads: true,
    decorate: true,
    cartouche: true,
    hexGrid: true,
    variant: 'noise',
    landShare: 0.45,
  };
}

type Biom = 'ocean' | 'shallow' | 'beach' | 'desert' | 'grass' | 'forest' | 'rock' | 'snow';

const FARBE: Record<Biom, number> = {
  ocean: 0x2c4c6b,
  shallow: 0x3f6f92,
  beach: 0xd6c08a,
  desert: 0xd3b877,
  grass: 0x8a9c5a,
  forest: 0x4f6b3c,
  rock: 0x8a8175,
  snow: 0xe4e6e6,
};

/** Reihenfolge beim Zeichnen: von unten nach oben, damit Küsten sauber liegen. */
const BIOM_ORDER: Biom[] = ['ocean', 'shallow', 'beach', 'desert', 'grass', 'forest', 'rock', 'snow'];

export function generateWorld(opts: WorldOptions): GeneratedMap {
  const rng = new Rng(opts.seed);
  const ergebnis = emptyResult(opts.cols, opts.rows);
  if (opts.hexGrid) ergebnis.gridType = 'hexPointy';
  const s = opts.tileSize;

  const hoeheNoise = createNoise2D(() => rng.next());
  const feuchteNoise = createNoise2D(() => rng.next());

  /** Fraktales Rauschen: mehrere Lagen mit halbierter Stärke und doppelter Frequenz. */
  const fbm = (noise: (x: number, y: number) => number, x: number, y: number): number => {
    let summe = 0;
    let amplitude = 1;
    let frequenz = 1;
    let norm = 0;
    for (let i = 0; i < opts.octaves; i++) {
      summe += noise(x * frequenz, y * frequenz) * amplitude;
      norm += amplitude;
      amplitude *= 0.5;
      frequenz *= 2;
    }
    return summe / norm;
  };

  const mx = (opts.cols - 1) / 2;
  const my = (opts.rows - 1) / 2;

  const hoehe = new Float32Array(opts.cols * opts.rows);
  const feuchte = new Float32Array(opts.cols * opts.rows);

  /**
   * Bei der Plattenvariante liefert die Tektonik die Grundhöhe; das Rauschen
   * bleibt trotzdem im Spiel, aber nur noch als Beimischung. Ganz ohne wären
   * die Flanken der Platten glatt wie Blech.
   */
  const plattenOpts = { ...defaultPlateOptions(opts.cols, opts.rows), landShare: opts.landShare };
  const platten =
    opts.variant === 'plates' ? makePlates(rng, plattenOpts) : [];
  const plattenHoehe =
    opts.variant === 'plates'
      ? plateField(platten, plattenOpts, (c, r) => ({
          // Die Naht mit demselben Rauschen ausfransen, mit dem auch der Rest
          // der Karte arbeitet — sonst wären die Grenzen gerade Linien.
          dx: fbm(hoeheNoise, c * opts.scale * 2, r * opts.scale * 2) * plattenOpts.ridgeWidth,
          dy: fbm(hoeheNoise, (c + 91) * opts.scale * 2, (r + 47) * opts.scale * 2) * plattenOpts.ridgeWidth,
        }))
      : null;

  for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      const rauschen = (fbm(hoeheNoise, c * opts.scale, r * opts.scale) + 1) / 2;
      const roh = plattenHoehe
        ? plattenHoehe[r * opts.cols + c] * 0.82 + rauschen * 0.18
        : rauschen;
      // Zum Rand hin absenken, sonst laufen Kontinente über die Kante hinaus
      // und die Karte wirkt angeschnitten statt gemeint.
      const dx = (c - mx) / mx;
      const dy = (r - my) / my;
      const rand = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const abfall = Math.max(0, 1 - Math.pow(rand, 3));
      hoehe[r * opts.cols + c] = roh * abfall;
      feuchte[r * opts.cols + c] = (fbm(feuchteNoise, c * opts.scale * 1.7, r * opts.scale * 1.7) + 1) / 2;
    }
  }

  const bei = (c: number, r: number) => hoehe[r * opts.cols + c] ?? 0;

  const biomAn = (c: number, r: number): Biom => {
    const h = bei(c, r);
    const f = feuchte[r * opts.cols + c];
    if (h < opts.seaLevel - 0.06) return 'ocean';
    if (h < opts.seaLevel) return 'shallow';
    if (h < opts.seaLevel + 0.03) return 'beach';
    if (h > 0.82) return 'snow';
    if (h > 0.68) return 'rock';
    if (f < 0.35) return 'desert';
    if (f > 0.58) return 'forest';
    return 'grass';
  };

  // --- Land, Wasser und Abstand --------------------------------------------
  /**
   * Wie weit ist eine Zelle vom Wasser entfernt?
   *
   * Das klingt nach Beiwerk und ist der Kern gleich zweier Fehler. Ein Baum
   * mitten im Meer entsteht *nicht* durch eine falsche Biomprüfung — die sagt
   * für eine Küstenzelle völlig richtig „Wald". Gezeichnet wird die Küste
   * danach aber geglättet, und Glättung zieht eine Kontur nach innen. Der Baum
   * steht dann auf einer Zelle, die es als Land nicht mehr gibt.
   *
   * Deshalb wird nicht mehr die Zelle gefragt, sondern ihr Abstand zum
   * Wasser: 0 im Wasser, 1 an der Küste, ab 2 liegt zwischen Prop und Meer
   * noch eine ganze Zelle — mehr, als die Glättung je wegnimmt. Dieselbe Zahl
   * sagt auch, wo sich siedeln lässt.
   */
  const wasserAbstand = new Int16Array(opts.cols * opts.rows).fill(-1);
  {
    const schlange: number[] = [];
    for (let i = 0; i < wasserAbstand.length; i++) {
      if (hoehe[i] < opts.seaLevel) {
        wasserAbstand[i] = 0;
        schlange.push(i);
      }
    }
    for (let k = 0; k < schlange.length; k++) {
      const i = schlange[k];
      const c = i % opts.cols;
      const r = (i - c) / opts.cols;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= opts.cols || nr >= opts.rows) continue;
        const j = nr * opts.cols + nc;
        if (wasserAbstand[j] !== -1) continue;
        wasserAbstand[j] = wasserAbstand[i] + 1;
        schlange.push(j);
      }
    }
    // Eine Karte ganz ohne Meer erreicht die Schleife nie; dort ist überall
    // Binnenland, und „unendlich weit vom Wasser" ist die richtige Antwort.
    for (let i = 0; i < wasserAbstand.length; i++) {
      if (wasserAbstand[i] === -1) wasserAbstand[i] = 999;
    }
  }
  const trocken = (c: number, r: number, mindestens = 2): boolean => {
    if (c < 0 || r < 0 || c >= opts.cols || r >= opts.rows) return false;
    return wasserAbstand[r * opts.cols + c] >= mindestens;
  };

  /** Zellen, durch die ein Fluss läuft — für Brücken, Standorte und Wegkosten. */
  const fluss = new CellGrid(opts.cols, opts.rows);

  // --- Flächen je Biom -----------------------------------------------------
  /**
   * Geschachtelt zeichnen, nicht als einzelne Flecken.
   *
   * Vorher bekam jedes Biom seinen eigenen Umriss, und jeder wurde für sich
   * geglättet. Glättung zieht eine Kontur aber nach innen — zwischen zwei
   * benachbarten Biomen klaffte danach eine Lücke, und durch die schaute der
   * Ozean. Auf der Karte sah das aus wie lose Farbschollen in dunklem Wasser,
   * mit harten Rändern dazwischen.
   *
   * Jetzt enthält jede Lage *alles ab* diesem Biom aufwärts: die Ozeanlage die
   * ganze Karte, die Strandlage alles Land, die Waldlage Wald und alles
   * Höhere. Jede Lage liegt damit vollständig auf der darunter, und was die
   * Glättung wegnimmt, gibt die Lage darunter frei — die Nachbarfarbe, nicht
   * das Meer. Der Preis ist Übermalung, und die kostet nichts.
   */
  const biomIndex = new Map(BIOM_ORDER.map((b, i) => [b, i]));
  for (let i = 0; i < BIOM_ORDER.length; i++) {
    const maske = new CellGrid(opts.cols, opts.rows);
    let anzahl = 0;
    for (let r = 0; r < opts.rows; r++) {
      for (let c = 0; c < opts.cols; c++) {
        if ((biomIndex.get(biomAn(c, r)) ?? 0) >= i) {
          maske.set(c, r, 1);
          anzahl++;
        }
      }
    }
    if (anzahl === 0) continue;

    for (const ring of traceOutlines(maske)) {
      // Winzige Flecken weglassen: sie machen die Karte unruhig und kosten
      // nur Stützpunkte.
      if (ring.length < 8) continue;
      const welt = chaikin(ring.map((v) => v * s), 3, true);
      const duenn = douglasPeucker(welt, s * 0.2);
      ergebnis.floors.push({
        points: duenn.length >= 6 ? duenn : welt,
        color: FARBE[BIOM_ORDER[i]],
      });
    }
  }

  // --- Flüsse --------------------------------------------------------------
  // Von einem hohen Punkt aus immer bergab, bis Wasser erreicht ist. Das ist
  // dieselbe Regel, nach der echte Flüsse laufen, und sie erzeugt von selbst
  // die typischen Mäander im Flachland.
  for (let i = 0; i < opts.rivers; i++) {
    let bestC = 0;
    let bestR = 0;
    let bestH = -1;
    for (let versuch = 0; versuch < 40; versuch++) {
      const c = rng.int(2, opts.cols - 3);
      const r = rng.int(2, opts.rows - 3);
      if (bei(c, r) > bestH) {
        bestH = bei(c, r);
        bestC = c;
        bestR = r;
      }
    }
    if (bestH < opts.seaLevel + 0.12) continue;

    const punkte: number[] = [];
    const zellen: Array<[number, number]> = [];
    let c = bestC;
    let r = bestR;
    for (let schritt = 0; schritt < opts.cols + opts.rows; schritt++) {
      // Ohne die kleine Unruhe läuft ein Fluss über einen gleichmäßigen Hang
      // schnurgerade — und nichts sieht auf einer Karte weniger nach Fluss aus
      // als eine Diagonale. Geglättet wird daraus ein Mäander.
      punkte.push((c + 0.5 + rng.range(-0.22, 0.22)) * s, (r + 0.5 + rng.range(-0.22, 0.22)) * s);
      zellen.push([c, r]);
      if (bei(c, r) < opts.seaLevel) break;
      let nc = c;
      let nr = r;
      let nh = bei(c, r);
      for (const [dc, dr] of [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1],
      ]) {
        const h = bei(c + dc, r + dr);
        if (c + dc < 0 || r + dr < 0 || c + dc >= opts.cols || r + dr >= opts.rows) continue;
        if (h < nh) {
          nh = h;
          nc = c + dc;
          nr = r + dr;
        }
      }
      // Senke ohne Abfluss: hier endet der Fluss in einem See.
      if (nc === c && nr === r) break;
      c = nc;
      r = nr;
    }

    if (punkte.length >= 8) {
      for (const [fc, fr] of zellen) fluss.set(fc, fr, 1);
      ergebnis.floors.push({
        // Zur Quelle hin schmaler: gleich breit von der Quelle bis zur Mündung
        // sähe ein Fluss aus wie ein Kanal.
        points: strokeBand(chaikin(punkte, 2, false), s * 0.16, 0.65),
        color: 0x3f6f92,
      });
    }
  }

  // --- Siedlungen und Straßen ----------------------------------------------
  /**
   * Siedlungen entstehen nicht dort, wo Platz ist, sondern dort, wo sich
   * leben lässt: am Wasser, im Flachen, nicht auf dem Gletscher. Genau das
   * bewertet die Punktzahl unten — und weil sonst alle am selben besten Fleck
   * klebten, wird anschließend mit Mindestabstand ausgewählt.
   *
   * Die Straßen fallen danach von selbst an: der günstigste Weg über das
   * Höhenfeld läuft ums Gebirge herum und sucht die Furt, statt quer durch
   * die Wand zu gehen. Verbunden wird als Minimalgerüst — jede Siedlung
   * hängt am Netz, aber nicht jede an jeder, sonst wäre die Karte ein
   * Spinnennetz.
   */
  interface Siedlung {
    c: number;
    r: number;
    propId: string;
  }
  const siedlungen: Siedlung[] = [];
  /**
   * Belegte Zellen, gemeinsam für Siedlungen und Streuzeichen. Getrennte
   * Raster wären die bequemere Lösung und die falsche: dann stünde irgendwann
   * ein Gebirge auf der Hauptstadt.
   */
  const gesetzt = new CellGrid(opts.cols, opts.rows);
  const setze = (propId: string, c: number, r: number, abstand: number, skala: number): boolean => {
    for (let dr = -abstand; dr <= abstand; dr++) {
      for (let dc = -abstand; dc <= abstand; dc++) {
        if (gesetzt.filled(c + dc, r + dr)) return false;
      }
    }
    gesetzt.set(c, r, 1);
    ergebnis.props.push({
      propId,
      x: (c + rng.range(0.3, 0.7)) * s,
      y: (r + rng.range(0.3, 0.7)) * s,
      scale: skala,
      rotation: 0,
    });
    return true;
  };

  if (opts.settlements > 0) {
    const kandidaten: Array<{ c: number; r: number; wert: number }> = [];
    for (let r = 2; r < opts.rows - 2; r++) {
      for (let c = 2; c < opts.cols - 2; c++) {
        const h = bei(c, r);
        // Nicht auf Fels und Schnee, nicht auf der Küstenkante.
        if (h < opts.seaLevel + 0.02 || h > 0.66) continue;
        if (!trocken(c, r, 2)) continue;
        // Gefälle im Umfeld: an einem Steilhang baut niemand eine Stadt.
        const steil =
          Math.abs(bei(c + 1, r) - bei(c - 1, r)) + Math.abs(bei(c, r + 1) - bei(c, r - 1));
        // Küste und Fluss sind die eigentlichen Standortfaktoren.
        const amMeer = 1 / (1 + Math.max(0, wasserAbstand[r * opts.cols + c] - 2));
        const amFluss = fluss.filled(c, r) || fluss.neighbours(c, r, false) > 0 ? 0.6 : 0;
        kandidaten.push({ c, r, wert: amMeer + amFluss - steil * 8 + rng.range(0, 0.3) });
      }
    }
    kandidaten.sort((a, b) => b.wert - a.wert);

    const mindest = Math.max(4, Math.round(Math.min(opts.cols, opts.rows) / 6));
    for (const k of kandidaten) {
      if (siedlungen.length >= opts.settlements) break;
      if (siedlungen.some((x) => Math.hypot(x.c - k.c, x.r - k.r) < mindest)) continue;
      siedlungen.push({ c: k.c, r: k.r, propId: 'w_town' });
    }
    // Die beste Lage wird zur Hauptstadt, jede vierte weitere zur Burg —
    // lauter gleich große Ortschaften geben keine Hierarchie her.
    siedlungen.forEach((x, i) => {
      x.propId = i === 0 ? 'w_city' : i % 4 === 1 ? 'w_castle' : 'w_town';
    });
    for (const x of siedlungen) setze(x.propId, x.c, x.r, 2, x.propId === 'w_city' ? 1.1 : 0.95);
  }

  if (opts.roads && siedlungen.length > 1) {
    /**
     * Kosten fürs Betreten einer Zelle. Wasser ist unpassierbar, Steigung
     * kostet quadratisch spürbar, Fels obendrauf — und ein Fluss kostet
     * einmalig, weil eine Furt Arbeit ist, aber kein Hindernis.
     */
    const kosten = (c: number, r: number): number => {
      const h = bei(c, r);
      if (h < opts.seaLevel) return Infinity;
      const steigung =
        Math.abs(bei(c + 1, r) - h) + Math.abs(bei(c, r + 1) - h) +
        Math.abs(bei(c - 1, r) - h) + Math.abs(bei(c, r - 1) - h);
      let k = 1 + steigung * 30;
      if (h > 0.68) k += 5;
      if (fluss.filled(c, r)) k += 7;
      // Über eine Ebene ist jeder Weg gleich teuer, und Dijkstra nimmt dann
      // die Gerade. Ein ortsfestes Rauschen — kein Würfeln, sonst zöge der
      // Weg nicht *durch* die günstige Senke, sondern zappelte — gibt der
      // Straße einen Grund, sich zu winden.
      k += (feuchteNoise(c * 0.22, r * 0.22) + 1) * 0.45;
      return k;
    };

    const felder = siedlungen.map((x) => pathField(opts.cols, opts.rows, x.c, x.r, kosten));
    const kostenZu = (von: number, zu: number): number =>
      felder[von].dist[siedlungen[zu].r * opts.cols + siedlungen[zu].c];

    // Prim: von der Hauptstadt aus wächst das Netz um die jeweils
    // billigste noch nicht angeschlossene Siedlung.
    const drin = new Set<number>([0]);
    const kanten: Array<[number, number]> = [];
    while (drin.size < siedlungen.length) {
      let bestVon = -1;
      let bestZu = -1;
      let best = Infinity;
      for (const a of drin) {
        for (let b = 0; b < siedlungen.length; b++) {
          if (drin.has(b)) continue;
          const d = kostenZu(a, b);
          if (d < best) {
            best = d;
            bestVon = a;
            bestZu = b;
          }
        }
      }
      // Unerreichbar: die übrigen liegen auf einer anderen Insel. Sie bleiben
      // ohne Straße, statt dass eine quer übers Meer gemalt wird.
      if (bestZu < 0 || !Number.isFinite(best)) break;
      drin.add(bestZu);
      kanten.push([bestVon, bestZu]);
    }

    const bruecken = new CellGrid(opts.cols, opts.rows);
    for (const [a, b] of kanten) {
      const weg = tracePath(felder[a], siedlungen[b].c, siedlungen[b].r);
      if (weg.length < 3) continue;
      const punkte: number[] = [];
      for (const [c, r] of weg) punkte.push((c + 0.5) * s, (r + 0.5) * s);
      ergebnis.floors.push({
        points: strokeBand(chaikin(punkte, 3, false), s * 0.07),
        color: 0xbca77c,
      });
      // Wo die Straße den Fluss quert, steht eine Brücke. Genau ein Zeichen
      // pro Übergang, sonst reihen sie sich entlang eines flachen Laufs.
      for (const [c, r] of weg) {
        if (!fluss.filled(c, r) || bruecken.filled(c, r)) continue;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) bruecken.set(c + dc, r + dr, 1);
        ergebnis.props.push({
          propId: 'w_bridge',
          x: (c + 0.5) * s,
          y: (r + 0.5) * s,
          scale: 0.75,
          rotation: 0,
        });
      }
    }
  }

  // --- Signaturen ----------------------------------------------------------
  if (opts.decorate) {
    for (let r = 1; r < opts.rows - 1; r++) {
      for (let c = 1; c < opts.cols - 1; c++) {
        // Der Grund für diese eine Zeile steht oben bei `wasserAbstand`: die
        // Biomprüfung allein setzt Bäume auf Küstenzellen, die nach dem
        // Glätten unter Wasser liegen.
        if (!trocken(c, r, 2)) continue;
        if (fluss.filled(c, r)) continue;

        const b = biomAn(c, r);
        if (b === 'snow' || b === 'rock') {
          if (rng.bool(0.3)) setze('w_mountain', c, r, 2, rng.range(0.8, 1.15));
        } else if (b === 'forest') {
          if (rng.bool(0.22)) setze('w_forest', c, r, 2, rng.range(0.8, 1.15));
        } else if (b === 'desert') {
          if (rng.bool(0.12)) setze('w_dunes', c, r, 3, rng.range(0.8, 1.15));
        } else if (b === 'grass') {
          // Ortschaften nur, solange die Siedlungen nicht ohnehin eigens
          // gesetzt werden — sonst stünde neben jeder Stadt noch eine.
          if (siedlungen.length === 0 && rng.bool(0.05)) {
            setze(rng.bool(0.25) ? 'w_city' : 'w_town', c, r, 4, rng.range(0.85, 1.1));
          } else if (rng.bool(0.08)) {
            setze('w_hills', c, r, 3, rng.range(0.8, 1.15));
          } else if (siedlungen.length > 0 && rng.bool(0.03)) {
            // Felder gehören ins Umland, nicht in die Wildnis.
            const nah = siedlungen.some((x) => Math.hypot(x.c - c, x.r - r) < 5);
            if (nah) setze('w_farm', c, r, 2, 0.8);
          }
        }
      }
    }

    /**
     * Und schließlich das Meer. Eine leere blaue Fläche sieht nach fehlenden
     * Daten aus; ein Segler und ein Ungeheuer machen daraus eine Seekarte.
     *
     * Anders als an Land wird hier *nicht* Zelle für Zelle gewürfelt: bei
     * einer Karte, die zur Hälfte aus Ozean besteht, kämen so je nach
     * Meeresanteil mal zwei und mal dreizehn Zeichen heraus — und dreizehn
     * Strudel sind kein Seeungeheuerkarten-Stil, sondern ein Fehler. Erst
     * sammeln, dann eine feste kleine Zahl ziehen.
     */
    const tiefsee: Array<[number, number]> = [];
    for (let r = 2; r < opts.rows - 2; r++) {
      for (let c = 2; c < opts.cols - 2; c++) {
        if (wasserAbstand[r * opts.cols + c] !== 0) continue;
        let tief = true;
        for (let dr = -2; dr <= 2 && tief; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (bei(c + dc, r + dr) >= opts.seaLevel) {
              tief = false;
              break;
            }
          }
        }
        if (tief) tiefsee.push([c, r]);
      }
    }
    // Ein Segler ist gewöhnlich, ein Ungeheuer selten, ein Strudel die
    // Ausnahme — in dieser Reihenfolge.
    const seezeichen = ['w_ship', 'w_ship', 'w_ship', 'w_seamonster', 'w_whirlpool'];
    let gezogen = 0;
    for (let versuch = 0; versuch < 60 && gezogen < 4 && tiefsee.length > 0; versuch++) {
      const [c, r] = rng.pick(tiefsee);
      if (setze(rng.pick(seezeichen), c, r, 6, rng.range(0.8, 1))) gezogen++;
    }
  }

  if (opts.cartouche) {
    ergebnis.props.push({
      propId: 'w_compass',
      x: (opts.cols - 4.5) * s,
      y: 4.5 * s,
      scale: 1,
      rotation: 0,
    });
    ergebnis.props.push({
      propId: 'w_scalebar',
      x: 6 * s,
      y: (opts.rows - 2.5) * s,
      scale: 1,
      rotation: 0,
    });
  }

  return ergebnis;
}

