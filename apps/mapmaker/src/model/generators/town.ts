/**
 * Stadt- und Dorf-Generator.
 *
 * Anders als beim Dungeon ist hier der Zwischenraum das Wichtige: Gebäude sind
 * geschlossene Blöcke, begangen wird die Straße dazwischen. Der Grundriss
 * entsteht deshalb umgekehrt — erst das Straßennetz, dann die Häuser in die
 * verbleibenden Blöcke.
 *
 * Das Teilen selbst steht in `cityPlan.ts` und arbeitet in Polygonen, nicht in
 * Rechtecken: Straßen laufen deshalb nicht alle parallel, Blöcke sind schief,
 * und ein Teil bleibt als Platz frei. Hier steht, was die Form ausmacht — wo
 * der Ort aufhört, wo Wasser ist, wo Ausfallstraßen und Tore sitzen — und wie
 * aus dem Plan Flächen, Wände und Türen werden.
 *
 * Die Häuser bekommen eigene Wandringe: in Foundry soll man nicht durch eine
 * Hauswand sehen, und Plätze bleiben frei begehbar.
 */

import { Rng } from '../rng';
import { strokeBand } from '../geometry';
import {
  centroid,
  cityPlan,
  clipHalf,
  convexHull,
  imPoly,
  orient,
  polyArea,
  type CityHouse,
  type Poly,
} from './cityPlan';
import { CellGrid } from './grid';
import { assignBuildingKinds, HOUSE_KIND } from './buildingKinds';
import { emptyResult, type BaseOptions, type GeneratedMap } from './types';

/**
 * Grundform der Siedlung.
 *
 * `grid` ist der gewachsene Ort am Straßenkreuz, `round` die ummauerte Stadt
 * mit sternförmigen Hauptstraßen, `river` das Dorf an einem Ufer. Mehr Formen
 * wären schnell beliebig; diese drei decken ab, was auf einer Karte vorkommt.
 */
export type TownShape = 'grid' | 'round' | 'river';
export const TOWN_SHAPES: TownShape[] = ['grid', 'round', 'river'];

/** Womit der Rand um die Siedlung gefüllt wird. */
export type TownSurround = 'none' | 'meadow' | 'forest' | 'water';
export const TOWN_SURROUNDS: TownSurround[] = ['none', 'meadow', 'forest', 'water'];

export interface TownOptions extends BaseOptions {
  /** Angestrebte Zahl Gebäude. Klein = Dorf, groß = Stadt. */
  buildingCount: number;
  buildingMin: number;
  buildingMax: number;
  /** Straßenbreite in Tiles. */
  streetWidth: number;
  /** Marktplatz in der Mitte. */
  market: boolean;
  /** Umlaufende Stadtmauer mit Toren. */
  cityWall: boolean;
  decorate: boolean;
  shape: TownShape;
  /**
   * Freier Rand um die Siedlung, in Tiles.
   *
   * Ohne Rand endet der Ort an der Bildkante, als wäre er abgeschnitten. Mit
   * Rand liegt er *in* einer Landschaft — und die lässt sich füllen.
   */
  margin: number;
  surround: TownSurround;
}

export function defaultTownOptions(): Omit<TownOptions, 'seed' | 'tileSize'> {
  return {
    cols: 64,
    rows: 48,
    buildingCount: 60,
    buildingMin: 3,
    buildingMax: 6,
    streetWidth: 3,
    market: true,
    cityWall: false,
    decorate: true,
    shape: 'grid',
    // Schmal: der Ort soll die Karte füllen. Mit vier Feldern Rand und einer
    // zusätzlich geschrumpften Ortsfläche nahm der Rand ein Viertel des Bildes
    // ein; so ist es rund ein Zehntel.
    margin: 1,
    surround: 'meadow',
  };
}

/**
 * Die Häuser bestimmen ihre Größe, nicht die Fläche.
 *
 * Der Ort füllt immer die Karte — nur so bleibt der Rand schmal. Die gewünschte
 * Hauszahl wird deshalb über den *Maßstab* getroffen: kleine Häuser und schmale
 * Gassen für eine Stadt, große Höfe und breite Wege für ein Dorf. Gesucht wird
 * binär, weil die Zahl mit dem Maßstab fällt; fünf Anläufe genügen.
 */
const MASSSTAEBE = Array.from({ length: 22 }, (_, i) => 0.55 * 1.11 ** i);

export function generateTown(opts: TownOptions): GeneratedMap {
  const ziel = Math.max(1, opts.buildingCount);
  const versuche = new Map<number, { map: GeneratedMap; gebaut: number }>();
  const bauen = (i: number) => {
    const da = versuche.get(i);
    if (da) return da;
    const neu = ortBauen(opts, MASSSTAEBE[i], ziel);
    versuche.set(i, neu);
    return neu;
  };

  // Der größte Maßstab, der noch genug Häuser trägt.
  let lo = 0;
  let hi = MASSSTAEBE.length - 1;
  let best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (bauen(mid).gebaut >= ziel) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return bauen(best).map;
}

/** Radius eines Rechtecks in Richtung `w`, von der Mitte aus. */
function radiusRechteck(w: number, a: number, b: number): number {
  const c = Math.abs(Math.cos(w));
  const s = Math.abs(Math.sin(w));
  return Math.min(c < 1e-6 ? Infinity : a / c, s < 1e-6 ? Infinity : b / s);
}

/** Radius einer Ellipse in Richtung `w`. */
function radiusEllipse(w: number, a: number, b: number): number {
  return 1 / Math.hypot(Math.cos(w) / a, Math.sin(w) / b);
}

/**
 * Wo trifft ein Strahl aus `(cx,cy)` das konvexe Polygon, und wie liegt dort
 * die Kante? Für Tore: das Tor muss *in* der Mauer liegen, nicht quer dazu.
 */
function strahlAufPoly(
  poly: number[],
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): { x: number; y: number; ex: number; ey: number } | null {
  const n = poly.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = poly[i * 2];
    const ay = poly[i * 2 + 1];
    const ex = poly[j * 2] - ax;
    const ey = poly[j * 2 + 1] - ay;
    const nenner = dx * ey - dy * ex;
    if (Math.abs(nenner) < 1e-9) continue;
    const t = ((ax - cx) * ey - (ay - cy) * ex) / nenner;
    const u = ((ax - cx) * dy - (ay - cy) * dx) / nenner;
    if (t <= 0 || u < 0 || u > 1) continue;
    const len = Math.hypot(ex, ey) || 1;
    return { x: cx + dx * t, y: cy + dy * t, ex: ex / len, ey: ey / len };
  }
  return null;
}

/** Wo trifft ein Strahl aus `(cx,cy)` das Rechteck? */
function strahlAufRechteck(
  cx: number,
  cy: number,
  dx: number,
  dy: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): [number, number] {
  let t = Infinity;
  if (dx > 1e-9) t = Math.min(t, (x1 - cx) / dx);
  if (dx < -1e-9) t = Math.min(t, (x0 - cx) / dx);
  if (dy > 1e-9) t = Math.min(t, (y1 - cy) / dy);
  if (dy < -1e-9) t = Math.min(t, (y0 - cy) / dy);
  return [cx + dx * t, cy + dy * t];
}

function ortBauen(
  opts: TownOptions,
  massstab: number,
  ziel: number,
): { map: GeneratedMap; gebaut: number } {
  const rng = new Rng(opts.seed);
  const ergebnis = emptyResult(opts.cols, opts.rows);
  const s = opts.tileSize;

  const hausMin = Math.max(2, Math.round(opts.buildingMin * massstab));
  const hausMax = Math.max(hausMin + 1, Math.round(opts.buildingMax * massstab));
  // Tiefer als breit sähe ein Haus aus wie ein Turm; flacher als zwei Felder
  // wäre es ein Gang.
  const hausTiefe = Math.max(2, Math.round(((hausMin + hausMax) / 2) * 0.62));
  // Straßen wachsen mit, aber gedämpft: in einer Stadt aus dreihundert Häusern
  // sollen die Gassen eng sein, im Dorf der Weg trotzdem befahrbar.
  const strassenBreite = Math.max(2, opts.streetWidth * Math.min(1.3, Math.max(0.8, massstab)));

  const rand = (opts.cityWall ? 3 : 1) + Math.max(0, Math.round(opts.margin));
  const flaecheW = opts.cols - rand * 2;
  const flaecheH = opts.rows - rand * 2;
  const mx = rand + flaecheW / 2;
  const my = rand + flaecheH / 2;

  const flaeche = (points: number[], color: number) => {
    ergebnis.floors.push({ points: points.map((v) => v * s), color });
  };

  // --- Rand ----------------------------------------------------------------
  /**
   * Die Landschaft, in der der Ort liegt — zuerst und über die *ganze* Karte.
   * Der Ortsgrund wird gleich darübergelegt; nur den Ring zu füllen ließe in
   * der Mitte ein Loch, das bei runden Formen sichtbar wäre.
   */
  if (opts.margin > 0 && opts.surround !== 'none') {
    const grund = { meadow: 0x5f7043, forest: 0x40522f, water: 0x3d6b7d }[opts.surround];
    flaeche([0, 0, opts.cols, 0, opts.cols, opts.rows, 0, opts.rows], grund);
  }

  // --- Umriss --------------------------------------------------------------
  /**
   * Kein Rechteck und kein Kreis, sondern beides verwackelt.
   *
   * Ein Ort mit gerader Kante sieht gestanzt aus. Die Radien werden deshalb
   * einzeln verkürzt und das Ergebnis zur konvexen Hülle zusammengefasst —
   * unregelmäßig, aber konvex, worauf die Teilung angewiesen ist.
   */
  const ecken = opts.shape === 'round' ? 18 : 13;
  const rohPunkte: number[] = [];
  for (let i = 0; i < ecken; i++) {
    const w = (i / ecken) * Math.PI * 2 + rng.range(-0.07, 0.07);
    const rMax =
      opts.shape === 'round'
        ? radiusEllipse(w, flaecheW / 2, flaecheH / 2)
        : radiusRechteck(w, flaecheW / 2, flaecheH / 2);
    // Nur leicht verkürzt: der Rand um den Ort soll rund ein Zehntel der
    // Karte ausmachen, nicht ein Viertel.
    const f = opts.shape === 'round' ? rng.range(0.94, 1) : rng.range(0.94, 1);
    rohPunkte.push(mx + Math.cos(w) * rMax * f, my + Math.sin(w) * rMax * f);
  }
  const outline = orient(convexHull(rohPunkte));
  // Der Ortsgrund zuerst: Wasser, Pflaster und Häuser kommen darüber. Lag er
  // hinter dem Flussabschnitt, deckte er den Fluss innerhalb des Ortes wieder
  // zu — sichtbar blieb er nur draußen auf der Wiese.
  flaeche(outline, 0x6d6252);

  const strasse = new CellGrid(opts.cols, opts.rows);
  const gesperrt = new CellGrid(opts.cols, opts.rows);

  /** Ein konvexes Polygon in eine Maske rastern. */
  const rastern = (poly: Poly, maske: CellGrid) => {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < poly.length; i += 2) {
      x0 = Math.min(x0, poly[i]);
      x1 = Math.max(x1, poly[i]);
      y0 = Math.min(y0, poly[i + 1]);
      y1 = Math.max(y1, poly[i + 1]);
    }
    for (let r = Math.floor(y0); r <= Math.ceil(y1); r++) {
      for (let c = Math.floor(x0); c <= Math.ceil(x1); c++) {
        if (imPoly(poly, c + 0.5, r + 0.5, -0.6)) maske.set(c, r, 1);
      }
    }
  };

  /** Ein Band als Fläche zeichnen und in eine Maske rastern. */
  const bandMalen = (punkte: number[], breite: number, color: number, maske: CellGrid) => {
    ergebnis.floors.push({
      points: strokeBand(
        punkte.map((v) => v * s),
        (breite / 2) * s,
      ),
      color,
    });
    const halb = breite / 2;
    for (let i = 0; i + 3 < punkte.length; i += 2) {
      const ax = punkte[i];
      const ay = punkte[i + 1];
      const bx = punkte[i + 2];
      const by = punkte[i + 3];
      const schritte = Math.ceil(Math.hypot(bx - ax, by - ay) * 2) + 1;
      for (let k = 0; k <= schritte; k++) {
        const x = ax + ((bx - ax) * k) / schritte;
        const y = ay + ((by - ay) * k) / schritte;
        for (let dr = -Math.ceil(halb); dr <= Math.ceil(halb); dr++) {
          for (let dc = -Math.ceil(halb); dc <= Math.ceil(halb); dc++) {
            if (dc * dc + dr * dr > halb * halb) continue;
            maske.set(Math.round(x) + dc, Math.round(y) + dr, 1);
          }
        }
      }
    }
  };

  // --- Wasser --------------------------------------------------------------
  /**
   * Der Fluss teilt den Ort, bevor irgendetwas anderes geschieht.
   *
   * Er läuft schräg, nicht senkrecht — schon das bricht die Parallelität des
   * ganzen Grundrisses. Geschnitten wird an einer *geraden* Mittellinie, damit
   * beide Ufer konvex bleiben; gezeichnet wird darum herum leicht mäandernd,
   * mit Spiel genug, dass das Wasser im Schnittband bleibt.
   */
  const teilflaechen: Poly[] = [];

  if (opts.shape === 'river') {
    const lauf = Math.PI / 2 + rng.range(-0.55, 0.55);
    const dx = Math.cos(lauf);
    const dy = Math.sin(lauf);
    const nx = -dy;
    const ny = dx;
    /**
     * Der Fluss liegt nicht zwangsläufig mittig — aber Schnitt und Zeichnung
     * müssen denselben Versatz kennen. Solange der Versatz nur in `mitte`
     * steckte, lagen Ufer und Brücken um bis zu acht Felder *neben* dem Wasser.
     */
    const versatz = rng.range(-flaecheW * 0.14, flaecheW * 0.14);
    const ox = mx + nx * versatz;
    const oy = my + ny * versatz;
    const mitte = ox * nx + oy * ny;
    const wasser = rng.range(2.6, 4.4);
    const ufer = Math.max(2, strassenBreite * 0.8);
    const halb = wasser / 2 + ufer;

    // Mittellinie über die ganze Karte hinaus, damit der Fluss nicht im Bild
    // anfängt.
    const laenge = opts.cols + opts.rows;
    const mittelLinie: number[] = [];
    for (let t = -laenge / 2; t <= laenge / 2; t += 4) {
      const seit = rng.range(-1, 1);
      mittelLinie.push(ox + dx * t + nx * seit, oy + dy * t + ny * seit);
    }

    // Ufer als Pflaster: der Streifen zwischen Wasser und Bauland.
    const karte = [0, 0, opts.cols, 0, opts.cols, opts.rows, 0, opts.rows];
    for (const seite of [-1, 1]) {
      const streifen = clipHalf(
        clipHalf(orient(karte), nx * seite, ny * seite, (mitte + halb * seite) * seite),
        -nx * seite,
        -ny * seite,
        -(mitte + (wasser / 2) * seite) * seite,
      );
      if (streifen.length >= 6) {
        flaeche(streifen, 0x8b8175);
        rastern(streifen, strasse);
      }
    }

    bandMalen(mittelLinie, wasser, 0x3d6b7d, gesperrt);
    // Etwas Uferluft in der Maske, damit kein Haus die Böschung berührt.
    bandMalen(mittelLinie, wasser + 1.4, 0x3d6b7d, gesperrt);

    const links = clipHalf(outline, nx, ny, mitte - halb);
    const rechts = clipHalf(outline, -nx, -ny, -(mitte + halb));
    for (const teil of [links, rechts]) if (polyArea(teil) > 4) teilflaechen.push(teil);

    // Brücken — ohne sie wären die Ufer zwei Orte.
    const bruecken = rng.int(1, 2);
    for (let i = 0; i < bruecken; i++) {
      const t = (i + 1) / (bruecken + 1) + rng.range(-0.12, 0.12);
      const pos = ox * dx + oy * dy + (t - 0.5) * flaecheH;
      const bruecke = clipHalf(
        clipHalf(
          clipHalf(clipHalf(orient(karte), dx, dy, pos + strassenBreite / 2), -dx, -dy, -(pos - strassenBreite / 2)),
          nx,
          ny,
          mitte + halb + 1,
        ),
        -nx,
        -ny,
        -(mitte - halb - 1),
      );
      if (bruecke.length >= 6) {
        flaeche(bruecke, 0x8b8175);
        rastern(bruecke, strasse);
        // Über dem Wasser ist die Brücke begehbar.
        for (let r = 0; r < opts.rows; r++)
          for (let c = 0; c < opts.cols; c++)
            if (imPoly(bruecke, c + 0.5, r + 0.5, -0.6)) gesperrt.set(c, r, 0);
      }
    }
  } else {
    teilflaechen.push(outline);
  }

  // --- Grundriss -----------------------------------------------------------
  /** Steht ein Polygon auf trockenem Bauland? */
  const erlaubt = (poly: Poly) => {
    for (let i = 0; i < poly.length; i += 2) {
      if (gesperrt.filled(Math.floor(poly[i]), Math.floor(poly[i + 1]))) return false;
    }
    const [cx, cy] = centroid(poly);
    return !gesperrt.filled(Math.floor(cx), Math.floor(cy));
  };

  const planOpts = {
    streetWidth: strassenBreite,
    buildingMin: hausMin,
    buildingMax: hausMax,
    buildingDepth: hausTiefe,
    plazaChance: 0.07,
    wildChance: opts.shape === 'round' ? 0.16 : 0.24,
    // Sternförmige Hauptstraßen machen die runde Stadt aus; anderswo kommen sie
    // gelegentlich auch vor — genau das nimmt dem Raster die Regelmäßigkeit.
    radialCuts: opts.shape === 'round' ? rng.int(2, 4) : rng.bool(0.3) ? 1 : 0,
    maxDepth: 12,
    erlaubt,
  };

  const strassen: Poly[] = [];
  const plaetze: Poly[] = [];
  const bloecke: Poly[] = [];
  let haeuser: CityHouse[] = [];
  teilflaechen.forEach((teil, i) => {
    const plan = cityPlan(teil, opts.seed + i * 5407, planOpts);
    strassen.push(...plan.streets);
    for (const b of plan.blocks) {
      bloecke.push(b.poly);
      if (b.plaza) plaetze.push(b.poly);
    }
    haeuser.push(...plan.houses);
  });

  // --- Marktplatz ----------------------------------------------------------
  /**
   * Der Markt ist ein Block, kein aufgemaltes Rechteck.
   *
   * Genommen wird der mittigste Block, der groß genug für einen Platz ist; die
   * Häuser darin fallen weg. Ein eigenes Rechteck darüberzulegen ging schief —
   * es passte zu keiner Straße und schnitt quer durch die Bebauung.
   */
  let markt: Poly | null = null;
  if (opts.market) {
    let beste = Infinity;
    for (const b of bloecke) {
      if (polyArea(b) < hausMax * hausMax * 0.8) continue;
      const [cx, cy] = centroid(b);
      const d = (cx - mx) ** 2 + (cy - my) ** 2;
      if (d < beste) {
        beste = d;
        markt = b;
      }
    }
    if (markt) {
      const m = markt;
      if (!plaetze.includes(m)) plaetze.push(m);
      haeuser = haeuser.filter((h) => {
        const [cx, cy] = centroid(h.points);
        return !imPoly(m, cx, cy, 0);
      });
    }
  }

  // --- Häuser auf die Zielzahl bringen -------------------------------------
  const gebaut = haeuser.length;
  if (gebaut > ziel) {
    // Gleichmäßig ausdünnen statt hinten abschneiden: sonst fehlte dem Ort ein
    // ganzes Viertel statt hier und da ein Haus.
    const behalten: CityHouse[] = [];
    let akku = 0;
    for (const h of haeuser) {
      akku += ziel;
      if (akku >= gebaut) {
        akku -= gebaut;
        behalten.push(h);
      }
    }
    haeuser = behalten;
  }

  /**
   * Gebäudearten statt anonymer Rechtecke.
   *
   * Ohne Thema (kein `opts.decorate`) bleibt jedes Haus `HOUSE_KIND` ohne
   * Möbel — derselbe Hauptschalter wie beim Dungeon: „ob überhaupt etwas
   * hineinkommt", nicht „was".
   */
  const arten = opts.decorate
    ? assignBuildingKinds(
        rng,
        haeuser.map((h) => polyArea(h.points)),
      )
    : haeuser.map(() => HOUSE_KIND);

  // --- Zeichnen ------------------------------------------------------------
  for (const st of strassen) {
    flaeche(st, 0x8b8175);
    rastern(st, strasse);
  }
  for (const p of plaetze) {
    flaeche(p, p === markt ? 0x958a7c : 0x8f857a);
    rastern(p, strasse);
  }

  /**
   * Ausfallstraßen dort, wo eine Straße den Ortsrand erreicht.
   *
   * Ohne sie endet jede Straße an der Bebauung, und ein Ort ohne Weg hinaus
   * sieht aus wie ein Modell. Genommen werden die äußersten Straßenenden, aber
   * nur, wenn sie weit genug auseinanderliegen.
   */
  const ausfaelle: number[] = [];
  const enden: Array<{ x: number; y: number; w: number }> = [];
  for (const st of strassen) {
    for (let i = 0; i < st.length; i += 2) {
      if (imPoly(outline, st[i], st[i + 1], 0.6)) continue;
      enden.push({ x: st[i], y: st[i + 1], w: Math.atan2(st[i + 1] - my, st[i] - mx) });
    }
  }
  enden.sort((a, b) => Math.hypot(b.x - mx, b.y - my) - Math.hypot(a.x - mx, a.y - my));
  for (const e of enden) {
    if (ausfaelle.length >= 5) break;
    const zuNah = ausfaelle.some(
      (w) => Math.abs(((e.w - w + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.7,
    );
    if (zuNah) continue;
    ausfaelle.push(e.w);
    const [zx, zy] = strahlAufRechteck(mx, my, Math.cos(e.w), Math.sin(e.w), 0, 0, opts.cols, opts.rows);
    bandMalen([e.x, e.y, zx, zy], strassenBreite, 0x8b8175, strasse);
  }

  /**
   * Ein Requisit innerhalb eines Hauses platzieren.
   *
   * Häuser sind nicht immer Rechtecke — ein gedrungener Block *wird* zum Haus
   * (siehe `bebauen` in `cityPlan.ts`) und kann mehr als vier Ecken haben.
   * Deshalb `imPoly` statt Grenzen aus Breite/Tiefe zu raten; ein paar
   * Anläufe genügen, ein Möbelstück, das partout nicht hineinpasst, entfällt
   * einfach — ein Haus ohne jedes Möbel bliebe trotzdem kein Rechteck ohne
   * Tür, denn die hat es so oder so.
   */
  const moebelImHaus = (h: CityHouse, propId: string) => {
    const [cx, cy] = centroid(h.points);
    const streuung = Math.sqrt(polyArea(h.points)) * 0.28;
    for (let versuch = 0; versuch < 6; versuch++) {
      const x = cx + rng.range(-streuung, streuung);
      const y = cy + rng.range(-streuung, streuung);
      if (!imPoly(h.points, x, y, 0.25)) continue;
      ergebnis.props.push({
        propId,
        x: x * s,
        y: y * s,
        scale: rng.range(0.8, 1.1),
        rotation: rng.bool() ? 0 : Math.PI / 2,
      });
      return;
    }
  };

  const gazetteer: Array<{ x: number; y: number; nameKey: string }> = [];

  haeuser.forEach((h, i) => {
    const art = arten[i];
    flaeche(h.points, rng.pick([0x7a6247, 0x6f5a44, 0x83694c]));
    ergebnis.walls.push({ points: h.points.map((v) => v * s), closed: true });
    ergebnis.doors.push({
      bounds: [h.door[0] * s, h.door[1] * s, h.door[2] * s, h.door[3] * s],
    });

    if (!opts.decorate) return;

    for (const propId of art.interior) {
      if (art !== HOUSE_KIND || rng.bool(0.6)) moebelImHaus(h, propId);
    }

    if (art.sign) {
      // Das Requisit an der Tür, ein Stück nach draußen versetzt — nach
      // innen stünde es im Weg, mitten in der Tür wäre es keine Tür mehr.
      const dx = h.door[2] - h.door[0];
      const dy = h.door[3] - h.door[1];
      const dmx = (h.door[0] + h.door[2]) / 2;
      const dmy = (h.door[1] + h.door[3]) / 2;
      const [hcx, hcy] = centroid(h.points);
      let nx = -dy;
      let ny = dx;
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
      // Die Normale, die von der Hausmitte weg zeigt, ist draußen.
      if ((dmx - hcx) * nx + (dmy - hcy) * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      const sx = dmx + nx * 0.9;
      const sy = dmy + ny * 0.9;
      ergebnis.props.push({
        propId: art.sign,
        x: sx * s,
        y: sy * s,
        scale: rng.range(0.9, 1.1),
        rotation: Math.atan2(dy, dx),
      });
    }

    if (rng.bool(art.lit)) {
      const [cx, cy] = centroid(h.points);
      ergebnis.lights.push({ x: cx * s, y: cy * s, range: 4 });
    }

    if (art !== HOUSE_KIND) {
      const [cx, cy] = centroid(h.points);
      gazetteer.push({ x: cx * s, y: cy * s, nameKey: art.nameKey });
    }
  });

  if (gazetteer.length > 0) {
    // Lesereihenfolge: im Uhrzeigersinn um die Ortsmitte, wie ein Rundgang —
    // nicht die zufällige Reihenfolge, in der die Grundstücke entstanden.
    gazetteer.sort((a, b) => Math.atan2(a.y - my * s, a.x - mx * s) - Math.atan2(b.y - my * s, b.x - mx * s));
    gazetteer.forEach((g, i) => ergebnis.notes.push({ x: g.x, y: g.y, nameKey: g.nameKey, index: i + 1 }));
  }

  // --- Stadtmauer ----------------------------------------------------------
  /**
   * Die Mauer folgt dem Ort, nicht der Bildkante.
   *
   * Als Rechteck um die ganze Karte umschloss sie bei einer runden Stadt zur
   * Hälfte Wiese — eine Mauer, die nichts schützt. Genommen wird deshalb der
   * Ortsumriss, ein Stück nach außen geschoben; die Tore sitzen dort, wo die
   * Ausfallstraßen ihn durchstoßen, und liegen *in* der Mauer.
   */
  if (opts.cityWall) {
    const luft = 1.5;
    const mauer: number[] = [];
    for (let i = 0; i < outline.length; i += 2) {
      const vx = outline[i] - mx;
      const vy = outline[i + 1] - my;
      const len = Math.hypot(vx, vy) || 1;
      mauer.push(outline[i] + (vx / len) * luft, outline[i + 1] + (vy / len) * luft);
    }
    ergebnis.walls.push({ points: mauer.map((v) => v * s), closed: true });
    for (const w of ausfaelle) {
      const tor = strahlAufPoly(mauer, mx, my, Math.cos(w), Math.sin(w));
      if (!tor) continue;
      ergebnis.doors.push({
        bounds: [
          (tor.x - tor.ex) * s,
          (tor.y - tor.ey) * s,
          (tor.x + tor.ex) * s,
          (tor.y + tor.ey) * s,
        ],
      });
    }
  }

  // --- Ausstattung ---------------------------------------------------------
  if (opts.decorate) {
    for (const p of plaetze) {
      const [cx, cy] = centroid(p);
      const n = p === markt ? rng.int(3, 6) : rng.int(1, 3);
      for (let i = 0; i < n; i++) {
        const winkel = rng.range(0, Math.PI * 2);
        const weite = Math.sqrt(polyArea(p)) * rng.range(0.1, 0.3);
        const px = cx + Math.cos(winkel) * weite;
        const py = cy + Math.sin(winkel) * weite;
        if (!imPoly(p, px, py, 0.5)) continue;
        ergebnis.props.push({
          propId: rng.pick(['cart', 'crate', 'barrel', 'pottery', 'haystack']),
          x: px * s,
          y: py * s,
          scale: rng.range(0.85, 1.15),
          rotation: rng.bool() ? 0 : Math.PI / 2,
        });
      }
      if (p === markt) {
        ergebnis.props.push({ propId: 'well', x: cx * s, y: cy * s, scale: 1, rotation: 0 });
        ergebnis.lights.push({ x: cx * s, y: cy * s, range: 6 });
      }
    }

    // Kleinkram an den Straßen, aus der Maske gezogen.
    const strassenFelder: Array<[number, number]> = [];
    for (let r = 0; r < opts.rows; r++)
      for (let c = 0; c < opts.cols; c++)
        if (strasse.filled(c, r) && imPoly(outline, c + 0.5, r + 0.5, 0)) strassenFelder.push([c, r]);
    if (strassenFelder.length > 0) {
      const n = Math.min(28, Math.max(4, Math.round(strassenFelder.length / 30)));
      for (let i = 0; i < n; i++) {
        const [c, r] = rng.pick(strassenFelder);
        ergebnis.props.push({
          propId: rng.pick(['barrel', 'crate', 'fence', 'signpost', 'hay']),
          x: (c + rng.range(0, 1)) * s,
          y: (r + rng.range(0, 1)) * s,
          scale: rng.range(0.8, 1.1),
          rotation: rng.bool() ? 0 : Math.PI / 2,
        });
      }
    }
  }

  /**
   * Den Rand bepflanzen — erst hier, ganz am Ende.
   *
   * Die Bäume müssen wissen, wo Häuser und Straßen stehen, sonst wächst ein
   * Wald mitten auf dem Marktplatz. Gestreut wird nur außerhalb des Umrisses.
   */
  if (opts.margin > 0 && opts.surround !== 'none' && opts.surround !== 'water') {
    const belegt = new CellGrid(opts.cols, opts.rows);
    for (const h of haeuser) rastern(h.points, belegt);

    const dicht = opts.surround === 'forest' ? 0.5 : 0.12;
    const sorten =
      opts.surround === 'forest'
        ? ['tree_pine', 'tree_deciduous', 'tree_deciduous', 'bush', 'stone_medium']
        : ['grass_tuft', 'bush', 'flowers', 'haystack', 'stone_small'];

    for (let r = 0; r < opts.rows; r++) {
      for (let c = 0; c < opts.cols; c++) {
        if (imPoly(outline, c + 0.5, r + 0.5, 0)) continue;
        if (strasse.filled(c, r) || belegt.filled(c, r) || gesperrt.filled(c, r)) continue;
        if (!rng.bool(dicht)) continue;
        ergebnis.props.push({
          propId: rng.pick(sorten),
          x: (c + rng.range(0.15, 0.85)) * s,
          y: (r + rng.range(0.15, 0.85)) * s,
          scale: rng.range(0.75, 1.25),
          rotation: rng.range(0, Math.PI * 2),
        });
      }
    }
  }

  return { map: ergebnis, gebaut };
}
