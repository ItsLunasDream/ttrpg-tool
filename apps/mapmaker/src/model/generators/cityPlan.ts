/**
 * Stadtgrundriss aus konvexen Blöcken.
 *
 * **Warum nicht achsenparallel.** Der erste Anlauf teilte ein Rechteck immer
 * waagerecht oder senkrecht. Das Ergebnis war zwar bei jedem Startwert anders
 * geschnitten, sah aber immer gleich aus: ein Gitter aus parallelen Straßen.
 * Eine Stadt, die so aussieht, ist am Reißbrett entstanden — die wenigsten sind
 * das.
 *
 * Hier wird deshalb in Polygonen gerechnet statt in Rechtecken. Eine Fläche
 * wird von einer Geraden in zwei Teile geschnitten, dazwischen bleibt ein
 * Streifen: die Straße. Die Richtung der Geraden folgt meist der längeren Achse
 * der Fläche — daher gibt es weiterhin Züge paralleler Straßen, wie es sie in
 * jeder Stadt gibt —, weicht aber jedes Mal etwas davon ab und ab und zu ganz.
 * Weil alle Schnitte Halbebenen sind, bleibt jeder Block konvex; das macht
 * alles Weitere einfach: Punkt-in-Block, Häuser an den Kanten, Überlappung.
 *
 * Nicht jeder Block wird bebaut. Ein Teil bleibt Platz — nicht nur in der
 * Mitte, sondern wo es sich ergibt. Plätze sind das, was einen Stadtplan
 * unverwechselbar macht; ein Raster aus lauter bebauten Blöcken ist es nicht.
 */

import { Rng } from '../rng';

/** Polygon als flache Koordinatenliste in Feldern. */
export type Poly = number[];

export interface CityBlock {
  poly: Poly;
  /** Wie oft geteilt wurde, bis dieser Block übrig blieb. */
  depth: number;
  /** Unbebaut — ein Platz. */
  plaza: boolean;
}

export interface CityHouse {
  points: Poly;
  /** Die Kante zur Straße. */
  door: [number, number, number, number];
}

export interface CityPlan {
  streets: Poly[];
  blocks: CityBlock[];
  houses: CityHouse[];
}

export interface CityPlanOptions {
  /** Straßenbreite auf Teilungstiefe 0. Tiefer wird sie schmaler. */
  streetWidth: number;
  /** Kantenlänge eines Hauses an der Straße. */
  buildingMin: number;
  buildingMax: number;
  /** Tiefe eines Hauses von der Straße aus. */
  buildingDepth: number;
  /** Wie oft ein Block unbebaut bleibt. */
  plazaChance: number;
  /** Wie oft ein Schnitt eine ganz freie Richtung nimmt. */
  wildChance: number;
  /**
   * Wie viele der ersten Schnitte durch die Mitte gehen.
   *
   * Damit wird aus derselben Maschine die runde Stadt: Straßen, die sternförmig
   * von der Mitte ausgehen, und dazwischen Blöcke, die wie Tortenstücke
   * anfangen und dann normal weitergeteilt werden.
   */
  radialCuts: number;
  maxDepth: number;
  /** Darf hier gebaut werden? Für Wasser, Ortsrand und dergleichen. */
  erlaubt?: (poly: Poly) => boolean;
}

// --- Polygonwerkzeug -------------------------------------------------------
// Alles hier setzt konvexe, positiv orientierte Polygone voraus. Das ist keine
// Einschränkung, sondern die Zusage der Teilung: eine Halbebene schneidet aus
// einem konvexen Polygon wieder ein konvexes.

/** Doppelte vorzeichenbehaftete Fläche. Positiv = die erwartete Umlaufrichtung. */
export function polyArea2(p: Poly): number {
  let a = 0;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    a += p[j] * p[i + 1] - p[i] * p[j + 1];
  }
  return a;
}

export function polyArea(p: Poly): number {
  return Math.abs(polyArea2(p)) / 2;
}

/** Dreht die Umlaufrichtung um, wenn nötig. */
export function orient(p: Poly): Poly {
  if (polyArea2(p) >= 0) return p;
  const out: Poly = [];
  for (let i = p.length - 2; i >= 0; i -= 2) out.push(p[i], p[i + 1]);
  return out;
}

export function centroid(p: Poly): [number, number] {
  const a2 = polyArea2(p);
  if (Math.abs(a2) < 1e-9) {
    let x = 0;
    let y = 0;
    for (let i = 0; i < p.length; i += 2) {
      x += p[i];
      y += p[i + 1];
    }
    const n = p.length / 2 || 1;
    return [x / n, y / n];
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const f = p[j] * p[i + 1] - p[i] * p[j + 1];
    cx += (p[j] + p[i]) * f;
    cy += (p[j + 1] + p[i + 1]) * f;
  }
  return [cx / (3 * a2), cy / (3 * a2)];
}

/**
 * Schneidet ein Polygon an einer Halbebene ab: behalten wird `n·p <= c`.
 *
 * Sutherland–Hodgman. Für konvexe Polygone genügt das eine Kante nach der
 * anderen, es entstehen nie mehrere Teile.
 */
export function clipHalf(p: Poly, nx: number, ny: number, c: number): Poly {
  const out: Poly = [];
  const n = p.length / 2;
  if (n < 3) return out;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = p[i * 2];
    const ay = p[i * 2 + 1];
    const bx = p[j * 2];
    const by = p[j * 2 + 1];
    const da = nx * ax + ny * ay - c;
    const db = nx * bx + ny * by - c;
    if (da <= 0) out.push(ax, ay);
    if (da <= 0 !== db <= 0) {
      const t = da / (da - db);
      out.push(ax + (bx - ax) * t, ay + (by - ay) * t);
    }
  }
  return out.length >= 6 ? out : [];
}

/**
 * Konvexe Hülle einer Punktwolke (Andrew, monotone Kette).
 *
 * Der Ortsumriss wird aus verwackelten Radien gebaut. Ohne Hülle wäre er
 * gelegentlich leicht einwärts gebeult, und dann stimmte die Zusage nicht mehr,
 * auf der hier alles beruht: dass jeder Schnitt an einer Halbebene wieder ein
 * konvexes Stück ergibt.
 */
export function convexHull(pts: Poly): Poly {
  const n = pts.length / 2;
  if (n < 3) return pts.slice();
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) =>
    pts[a * 2] === pts[b * 2] ? pts[a * 2 + 1] - pts[b * 2 + 1] : pts[a * 2] - pts[b * 2],
  );
  const kreuz = (o: number, a: number, b: number) =>
    (pts[a * 2] - pts[o * 2]) * (pts[b * 2 + 1] - pts[o * 2 + 1]) -
    (pts[a * 2 + 1] - pts[o * 2 + 1]) * (pts[b * 2] - pts[o * 2]);

  const kette = (reihe: number[]) => {
    const st: number[] = [];
    for (const i of reihe) {
      while (st.length >= 2 && kreuz(st[st.length - 2], st[st.length - 1], i) <= 0) st.pop();
      st.push(i);
    }
    st.pop();
    return st;
  };
  const hull = [...kette(idx), ...kette([...idx].reverse())];
  const out: Poly = [];
  for (const i of hull) out.push(pts[i * 2], pts[i * 2 + 1]);
  return out.length >= 6 ? out : pts.slice();
}

/** Ausdehnung des Polygons in einer Richtung. */
function spanne(p: Poly, dx: number, dy: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < p.length; i += 2) {
    const d = p[i] * dx + p[i + 1] * dy;
    if (d < lo) lo = d;
    if (d > hi) hi = d;
  }
  return [lo, hi];
}

/**
 * Längste und kürzeste Ausdehnung, samt Richtung der längsten.
 *
 * Genähert über gleichmäßig verteilte Richtungen. Rotierende Schieblehren
 * wären exakt, aber für die Frage „welche Achse ist die lange?" reicht ein
 * Zwölftel-Kreis; der Schnitt wird ohnehin verwackelt.
 */
function masse(p: Poly): { laenge: number; breite: number; winkel: number } {
  let laenge = 0;
  let winkel = 0;
  let breite = Infinity;
  for (let k = 0; k < 12; k++) {
    const w = (k / 12) * Math.PI;
    const [lo, hi] = spanne(p, Math.cos(w), Math.sin(w));
    const d = hi - lo;
    if (d > laenge) {
      laenge = d;
      winkel = w;
    }
    if (d < breite) breite = d;
  }
  return { laenge, breite, winkel };
}

/** Liegt der Punkt im konvexen Polygon? `luft` schiebt die Kanten nach innen. */
export function imPoly(p: Poly, x: number, y: number, luft = 0): boolean {
  const n = p.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = p[j * 2] - p[i * 2];
    const dy = p[j * 2 + 1] - p[i * 2 + 1];
    const len = Math.hypot(dx, dy) || 1;
    const kreuz = (dx * (y - p[i * 2 + 1]) - dy * (x - p[i * 2])) / len;
    if (kreuz < luft) return false;
  }
  return true;
}

/** Überlappen zwei konvexe Polygone? Trennachsensatz. */
export function ueberlappen(a: Poly, b: Poly): boolean {
  for (const p of [a, b]) {
    const n = p.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = p[j * 2] - p[i * 2];
      const dy = p[j * 2 + 1] - p[i * 2 + 1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const [alo, ahi] = spanne(a, nx, ny);
      const [blo, bhi] = spanne(b, nx, ny);
      if (ahi <= blo + 1e-6 || bhi <= alo + 1e-6) return false;
    }
  }
  return true;
}

// --- Teilung ---------------------------------------------------------------

/** Straßenbreite auf einer Teilungstiefe: Hauptweg, Gasse, Hinterhof. */
const breiteAuf = (basis: number, tiefe: number) =>
  Math.max(1, basis * 0.7 ** tiefe);

/**
 * Teilt eine Fläche in konvexe Blöcke und liefert die Straßen dazwischen.
 */
export function subdivide(
  outline: Poly,
  rng: Rng,
  opts: CityPlanOptions,
): { blocks: CityBlock[]; streets: Poly[] } {
  const blocks: CityBlock[] = [];
  const streets: Poly[] = [];
  const [mx, my] = centroid(outline);
  const minBlock = opts.buildingDepth * 2 + 1;

  const teile = (poly: Poly, tiefe: number) => {
    if (poly.length < 6) return;
    const breite = breiteAuf(opts.streetWidth, tiefe);
    const m = masse(poly);
    if (
      tiefe >= opts.maxDepth ||
      m.breite < minBlock + breite ||
      m.laenge < minBlock * 2 + breite
    ) {
      blocks.push({ poly, depth: tiefe, plaza: false });
      return;
    }

    // Richtung, in der gemessen und geschnitten wird. Meist die lange Achse —
    // sonst zerfiele die Fläche in Streifen —, aber nie ganz genau.
    let achse: number;
    let durchMitte = false;
    if (tiefe < opts.radialCuts) {
      // Sternförmig: die Straße läuft durch die Mitte, gemessen wird quer dazu.
      achse = rng.range(0, Math.PI) + (tiefe * Math.PI) / Math.max(1, opts.radialCuts);
      durchMitte = true;
    } else if (tiefe >= 2 && rng.bool(opts.wildChance)) {
      // Ganz freie Richtungen erst weiter unten. Auf den obersten Ebenen läuft
      // ein Schnitt quer durch den ganzen Ort; einer davon in beliebiger
      // Richtung sieht nicht nach Straße aus, sondern nach Riss.
      achse = rng.range(0, Math.PI);
    } else {
      achse = m.winkel + rng.range(-0.3, 0.3);
    }

    const dx = Math.cos(achse);
    const dy = Math.sin(achse);
    const [lo, hi] = spanne(poly, dx, dy);
    const rand = minBlock + breite / 2;
    if (hi - lo < rand * 2) {
      blocks.push({ poly, depth: tiefe, plaza: false });
      return;
    }
    const mitteProj = mx * dx + my * dy;
    const pos = durchMitte
      ? Math.max(lo + rand, Math.min(hi - rand, mitteProj + rng.range(-1.5, 1.5)))
      : lo + rand + rng.range(0.25, 0.75) * (hi - lo - rand * 2);

    const a = clipHalf(poly, dx, dy, pos - breite / 2);
    const b = clipHalf(poly, -dx, -dy, -(pos + breite / 2));
    const strasse = clipHalf(clipHalf(poly, dx, dy, pos + breite / 2), -dx, -dy, -(pos - breite / 2));
    // Ein Schnitt, der nur einen Splitter abtrennt, ist keiner. Er entstünde
    // an einer schrägen Ecke und hinterließe einen Keil, in dem kein Haus mehr
    // Platz hat — auf dem Plan lauter dreieckige Scherben.
    if (a.length < 6 || b.length < 6 || masse(a).breite < 1.6 || masse(b).breite < 1.6) {
      blocks.push({ poly, depth: tiefe, plaza: false });
      return;
    }
    if (strasse.length >= 6) streets.push(strasse);
    teile(a, tiefe + 1);
    teile(b, tiefe + 1);
  };

  teile(orient(outline), 0);
  return { blocks, streets };
}

// --- Häuser ----------------------------------------------------------------

/**
 * Bebaut einen Block von seinen Kanten aus.
 *
 * Die Fassaden stehen an der Straße, dahinter bleibt Hof — so sieht ein Ort
 * aus, in dem jemand wohnt, und so passt ein Vielfaches dessen auf die Fläche,
 * was eine Streuung unterbringt. Ist der Block zu schmal für Haus und Hof, wird
 * er selbst zum Haus; das gibt die schiefen Eckhäuser, die einen Plan lebendig
 * machen.
 */
export function bebauen(block: Poly, rng: Rng, opts: CityPlanOptions): CityHouse[] {
  const out: CityHouse[] = [];
  const m = masse(block);
  if (m.breite < 1.4 || m.laenge < opts.buildingMin) return out;

  /**
   * Ein kleiner, gedrungener Block *ist* das Haus.
   *
   * Nur ein gedrungener: ein langer Keil als ein Gebäude ergäbe ein Dreieck
   * von zwanzig Feldern Länge — auf dem Plan sah das aus wie eine Scherbe, nicht
   * wie ein Haus. Geprüft wird beides, Größe und Fülle: ein Polygon, das seine
   * eigene Hülle kaum ausfüllt, ist spitz.
   */
  const gedrungen = polyArea(block) > m.laenge * m.breite * 0.6;
  if (gedrungen && m.laenge <= opts.buildingMax * 1.6 && m.breite <= opts.buildingMax * 1.6) {
    out.push({ points: block.slice(), door: kanteMitte(block, rng) });
    return out;
  }

  // Flache Blöcke werden flach bebaut, sonst passt gar nichts hinein.
  const tiefe = Math.min(opts.buildingDepth, Math.max(1.6, m.breite / 2 - 0.2));

  const n = block.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = block[i * 2];
    const ay = block[i * 2 + 1];
    const laenge = Math.hypot(block[j * 2] - ax, block[j * 2 + 1] - ay);
    if (laenge < opts.buildingMin) continue;
    const dx = (block[j * 2] - ax) / laenge;
    const dy = (block[j * 2 + 1] - ay) / laenge;
    // Innennormale: die Umlaufrichtung ist positiv, also liegt das Innere links.
    const nx = -dy;
    const ny = dx;

    let t = 0;
    let schutz = 0;
    while (t < laenge && schutz++ < 400) {
      const rest = laenge - t;
      if (rest < opts.buildingMin) break;
      const w = Math.min(rest, rng.int(opts.buildingMin, opts.buildingMax));
      // Etwas Spiel in der Tiefe: gleich tiefe Häuser sehen gestempelt aus.
      const d = tiefe * rng.range(0.9, 1.1);
      const p0x = ax + dx * t;
      const p0y = ay + dy * t;
      const p1x = ax + dx * (t + w);
      const p1y = ay + dy * (t + w);
      const haus = [
        p0x,
        p0y,
        p1x,
        p1y,
        p1x + nx * d,
        p1y + ny * d,
        p0x + nx * d,
        p0y + ny * d,
      ];
      const passt =
        imPoly(block, haus[4], haus[5], -0.01) &&
        imPoly(block, haus[6], haus[7], -0.01) &&
        !out.some((h) => ueberlappen(h.points, haus));
      if (passt) {
        const mx2 = (p0x + p1x) / 2;
        const my2 = (p0y + p1y) / 2;
        const halb = Math.min(w / 2, 0.6);
        out.push({
          points: haus,
          door: [mx2 - dx * halb, my2 - dy * halb, mx2 + dx * halb, my2 + dy * halb],
        });
        // Ab und zu eine Lücke: eine lückenlose Zeile ist eine Mauer.
        t += w + (rng.bool(0.08) ? rng.range(1, 2.5) : 0);
      } else {
        // In kleinen Schritten weiter, nicht um eine ganze Hausbreite: sonst
        // reißt an jeder Ecke, an der ein Haus nicht passte, eine Lücke von
        // drei Feldern auf, und aus der Zeile wird eine Streuung.
        t += 0.5;
      }
    }
  }
  return out;
}

/** Ein Stück der längsten Kante als Tür. */
function kanteMitte(p: Poly, rng: Rng): [number, number, number, number] {
  const n = p.length / 2;
  let best = 0;
  let bestLen = -1;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const l = Math.hypot(p[j * 2] - p[i * 2], p[j * 2 + 1] - p[i * 2 + 1]);
    if (l > bestLen) {
      bestLen = l;
      best = i;
    }
  }
  const j = (best + 1) % n;
  const dx = (p[j * 2] - p[best * 2]) / (bestLen || 1);
  const dy = (p[j * 2 + 1] - p[best * 2 + 1]) / (bestLen || 1);
  const t = bestLen * rng.range(0.3, 0.7);
  const cx = p[best * 2] + dx * t;
  const cy = p[best * 2 + 1] + dy * t;
  const halb = Math.min(bestLen / 2, 0.6);
  return [cx - dx * halb, cy - dy * halb, cx + dx * halb, cy + dy * halb];
}

// --- Der ganze Plan --------------------------------------------------------

/**
 * Teilt die Umrissfläche und bebaut sie.
 *
 * `erlaubt` entscheidet, was stehen bleibt — Wasser, Ortsrand, Marktplatz kennt
 * nur der Aufrufer. Geprüft wird vor der Auswahl der Plätze, damit ein Block,
 * der ohnehin wegfällt, nicht auch noch als Platz gezählt wird.
 */
export function cityPlan(outline: Poly, seed: number, opts: CityPlanOptions): CityPlan {
  const rng = new Rng(seed);
  const { blocks, streets } = subdivide(outline, rng, opts);

  const brauchbar = blocks.filter(
    (b) => polyArea(b.poly) > 1 && (!opts.erlaubt || opts.erlaubt(b.poly)),
  );
  for (const b of brauchbar) b.plaza = rng.bool(opts.plazaChance);

  const houses: CityHouse[] = [];
  for (const b of brauchbar) {
    if (b.plaza) continue;
    for (const h of bebauen(b.poly, rng, opts)) {
      if (!opts.erlaubt || opts.erlaubt(h.points)) houses.push(h);
    }
  }
  return { streets, blocks: brauchbar, houses };
}
