/**
 * Belegungsraster und Umriss-Verfolgung für die Generatoren.
 *
 * Alle Generatoren arbeiten zuerst auf einem Booleschen Raster — welches Feld
 * ist begehbar, welches nicht — und leiten daraus am Ende Umrisse ab. Das
 * trennt die Frage „wie sieht der Grundriss aus" sauber von „wie wird daraus
 * Geometrie".
 */

export class CellGrid {
  readonly cols: number;
  readonly rows: number;
  private cells: Uint8Array;

  constructor(cols: number, rows: number, fill = 0) {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Uint8Array(cols * rows);
    if (fill) this.cells.fill(fill);
  }

  get(c: number, r: number): number {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return 0;
    return this.cells[r * this.cols + c];
  }

  set(c: number, r: number, v: number): void {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return;
    this.cells[r * this.cols + c] = v;
  }

  filled(c: number, r: number): boolean {
    return this.get(c, r) !== 0;
  }

  /** Rechteck setzen; Ränder werden abgeschnitten statt zu werfen. */
  fillRect(c0: number, r0: number, w: number, h: number, v = 1): void {
    for (let r = r0; r < r0 + h; r++) {
      for (let c = c0; c < c0 + w; c++) this.set(c, r, v);
    }
  }

  count(): number {
    let n = 0;
    for (let i = 0; i < this.cells.length; i++) if (this.cells[i]) n++;
    return n;
  }

  clone(): CellGrid {
    const g = new CellGrid(this.cols, this.rows);
    g.cells.set(this.cells);
    return g;
  }

  /** Belegte Nachbarn im 8er-Umfeld; außerhalb zählt als belegt oder frei. */
  neighbours(c: number, r: number, outsideFilled: boolean): number {
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dc === 0 && dr === 0) continue;
        const x = c + dc;
        const y = r + dr;
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) {
          if (outsideFilled) n++;
        } else if (this.cells[y * this.cols + x]) {
          n++;
        }
      }
    }
    return n;
  }
}

/**
 * Zusammenhängende Bereiche belegter Felder, größter zuerst.
 *
 * Cellular Automata erzeugen regelmäßig kleine abgetrennte Inseln. Für eine
 * Höhle ist nur der größte Bereich brauchbar — der Rest wäre für Spielfiguren
 * unerreichbar.
 */
export function regions(grid: CellGrid): Array<Array<[number, number]>> {
  const gesehen = new Uint8Array(grid.cols * grid.rows);
  const out: Array<Array<[number, number]>> = [];

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (!grid.filled(c, r) || gesehen[r * grid.cols + c]) continue;
      const bereich: Array<[number, number]> = [];
      const stapel: Array<[number, number]> = [[c, r]];
      gesehen[r * grid.cols + c] = 1;
      while (stapel.length > 0) {
        const [x, y] = stapel.pop()!;
        bereich.push([x, y]);
        // Nur 4er-Nachbarschaft: diagonal berührende Felder gelten nicht als
        // verbunden, weil man dort nicht hindurchgehen kann.
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= grid.cols || ny >= grid.rows) continue;
          if (!grid.filled(nx, ny) || gesehen[ny * grid.cols + nx]) continue;
          gesehen[ny * grid.cols + nx] = 1;
          stapel.push([nx, ny]);
        }
      }
      out.push(bereich);
    }
  }
  out.sort((a, b) => b.length - a.length);
  return out;
}

/** Behält nur den größten zusammenhängenden Bereich. */
export function keepLargestRegion(grid: CellGrid): CellGrid {
  const alle = regions(grid);
  const out = new CellGrid(grid.cols, grid.rows);
  if (alle.length === 0) return out;
  for (const [c, r] of alle[0]) out.set(c, r, 1);
  return out;
}

type Punkt = [number, number];

/**
 * Umrisse belegter Bereiche als geschlossene Ringe in Rasterkoordinaten.
 *
 * Statt des klassischen Marching-Squares-Automaten werden die Kanten zwischen
 * belegtem und freiem Feld gesammelt und aneinandergehängt. Das ist kürzer,
 * kommt ohne Sonderfälle für mehrdeutige Zellen aus und liefert dieselben
 * achsenparallelen Ringe.
 *
 * Die Umlaufrichtung ist einheitlich: Außenkanten im Uhrzeigersinn, Löcher
 * gegen den Uhrzeigersinn. Dadurch schließen sich die Ketten von selbst.
 */
export function traceOutlines(grid: CellGrid): number[][] {
  // Kante als Paar von Gitterpunkten (Ecken, nicht Zellen).
  const kanten = new Map<string, Punkt[]>();
  const key = (p: Punkt) => `${p[0]},${p[1]}`;

  /**
   * An einem Gitterpunkt können *zwei* Kanten beginnen — genau dann, wenn
   * sich dort zwei Bereiche über Eck berühren:
   *
   *     █ ·
   *     · █
   *
   * Solange hier eine einfache Zuordnung Punkt → Kante stand, überschrieb die
   * zweite Kante die erste. Die Verfolgung lief dann in eine Sackgasse, der
   * Ring blieb *offen*, und beim Füllen zog das Polygon eine gerade Sehne quer
   * durch die Form. Auf der Weltkarte war das ein schnurgerader Schnitt durch
   * einen halben Kontinent — sichtbar erst, als die Biome flächig geschachtelt
   * gezeichnet wurden und die Masken groß genug für solche Berührungen waren.
   */
  const add = (a: Punkt, b: Punkt) => {
    const k = key(a);
    const liste = kanten.get(k);
    if (liste) liste.push(b);
    else kanten.set(k, [b]);
  };

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (!grid.filled(c, r)) continue;
      if (!grid.filled(c, r - 1)) add([c, r], [c + 1, r]);
      if (!grid.filled(c + 1, r)) add([c + 1, r], [c + 1, r + 1]);
      if (!grid.filled(c, r + 1)) add([c + 1, r + 1], [c, r + 1]);
      if (!grid.filled(c - 1, r)) add([c, r + 1], [c, r]);
    }
  }

  /**
   * Welche Kante an einer Gabelung?
   *
   * Die schärfste Rechtskurve. Außenkanten laufen hier im Uhrzeigersinn; wer
   * an der Berührstelle so scharf wie möglich abbiegt, bleibt am eigenen
   * Bereich und schneidet nicht in den Nachbarn hinüber. Genau das trennt die
   * beiden über Eck liegenden Flecken in zwei Ringe, statt eine Acht zu
   * zeichnen.
   *
   * (Bildschirmkoordinaten, y zeigt nach unten: ein positives Kreuzprodukt
   * ist die Rechtskurve.)
   */
  const waehle = (von: Punkt, liste: Punkt[], ein: Punkt | null): number => {
    if (liste.length === 1 || !ein) return 0;
    let best = 0;
    let bestWert = -1;
    for (let i = 0; i < liste.length; i++) {
      const rx = liste[i][0] - von[0];
      const ry = liste[i][1] - von[1];
      const kreuz = ein[0] * ry - ein[1] * rx;
      const punkt = ein[0] * rx + ein[1] * ry;
      const wert = kreuz > 0 ? 3 : kreuz === 0 && punkt > 0 ? 2 : punkt < 0 ? 0 : 1;
      if (wert > bestWert) {
        bestWert = wert;
        best = i;
      }
    }
    return best;
  };

  const ringe: number[][] = [];
  while (kanten.size > 0) {
    const startKey = kanten.keys().next().value as string;
    const [sx, sy] = startKey.split(',').map(Number);
    const ring: number[] = [];
    let aktuell: Punkt = [sx, sy];
    let ein: Punkt | null = null;

    for (;;) {
      const liste = kanten.get(key(aktuell));
      if (!liste || liste.length === 0) break;
      const i = waehle(aktuell, liste, ein);
      const naechster = liste[i];
      liste.splice(i, 1);
      if (liste.length === 0) kanten.delete(key(aktuell));
      ring.push(aktuell[0], aktuell[1]);
      ein = [naechster[0] - aktuell[0], naechster[1] - aktuell[1]];
      aktuell = naechster;
      if (aktuell[0] === sx && aktuell[1] === sy) break;
    }
    // Ein Ring braucht mindestens drei Ecken, um eine Fläche zu umschließen.
    if (ring.length >= 6) ringe.push(collinearGeglaettet(ring));
  }
  return ringe;
}

/**
 * Punkte auf gerader Strecke entfernen.
 *
 * Ohne das hätte jede Zellkante einen eigenen Stützpunkt — ein Wandzug über
 * zwanzig Felder käme auf zwanzig überflüssige Ecken, und in Foundry wäre
 * jede davon ein eigenes Wandsegment.
 */
function collinearGeglaettet(ring: number[]): number[] {
  const n = ring.length / 2;
  if (n < 3) return ring;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const px = ring[((i - 1 + n) % n) * 2];
    const py = ring[((i - 1 + n) % n) * 2 + 1];
    const cx = ring[i * 2];
    const cy = ring[i * 2 + 1];
    const nx = ring[((i + 1) % n) * 2];
    const ny = ring[((i + 1) % n) * 2 + 1];
    const kreuz = (cx - px) * (ny - cy) - (cy - py) * (nx - cx);
    if (kreuz !== 0) out.push(cx, cy);
  }
  return out.length >= 6 ? out : ring;
}
