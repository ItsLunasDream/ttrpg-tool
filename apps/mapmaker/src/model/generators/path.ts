/**
 * Günstigster Weg über ein Raster.
 *
 * Für Straßen auf der Weltkarte reicht kein Strich von Stadt zu Stadt: eine
 * Straße läuft ums Gebirge herum, nicht darüber, und sie geht nicht durchs
 * Meer. Das ist genau ein Kürzeste-Wege-Problem mit ortsabhängigen Kosten —
 * Dijkstra, kein A*, weil von einer Siedlung aus gleich mehrere Ziele
 * gefunden werden sollen und eine Heuristik pro Ziel eine andere wäre.
 *
 * Die Kostenfunktion sagt, was das *Betreten* einer Zelle kostet;
 * `Infinity` heißt unpassierbar. Diagonalen kosten das Wurzel-Zwei-fache,
 * sonst wären Treppenstufen billiger als der gerade Weg und jede Straße
 * liefe im Zickzack.
 */

/** Ergebnis eines Laufs: Kosten je Zelle und Vorgänger zum Zurückverfolgen. */
export interface PathField {
  cols: number;
  rows: number;
  dist: Float64Array;
  prev: Int32Array;
}

const NACHBARN: Array<[number, number, number]> = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

/**
 * Dijkstra von einer Startzelle aus über das ganze Raster.
 *
 * `enter(c, r)` gibt die Kosten fürs Betreten von (c, r) zurück. Der Start
 * selbst wird nicht bewertet — dort steht man schon.
 */
export function pathField(
  cols: number,
  rows: number,
  startC: number,
  startR: number,
  enter: (c: number, r: number) => number,
): PathField {
  const n = cols * rows;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const fertig = new Uint8Array(n);

  // Binärer Heap über Indizes; parallele Arrays statt Objekten, weil hier bei
  // großen Karten einige zehntausend Einträge durchlaufen.
  const hi: number[] = [];
  const hd: number[] = [];
  const tausch = (a: number, b: number) => {
    const i = hi[a]; hi[a] = hi[b]; hi[b] = i;
    const d = hd[a]; hd[a] = hd[b]; hd[b] = d;
  };
  const push = (i: number, d: number) => {
    hi.push(i);
    hd.push(d);
    let k = hi.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (hd[p] <= hd[k]) break;
      tausch(p, k);
      k = p;
    }
  };
  const pop = (): number => {
    const oben = hi[0];
    const li = hi.pop() as number;
    const ld = hd.pop() as number;
    if (hi.length > 0) {
      hi[0] = li;
      hd[0] = ld;
      let k = 0;
      for (;;) {
        const l = k * 2 + 1;
        const r = l + 1;
        let m = k;
        if (l < hd.length && hd[l] < hd[m]) m = l;
        if (r < hd.length && hd[r] < hd[m]) m = r;
        if (m === k) break;
        tausch(m, k);
        k = m;
      }
    }
    return oben;
  };

  const start = startR * cols + startC;
  dist[start] = 0;
  push(start, 0);

  while (hi.length > 0) {
    const i = pop();
    if (fertig[i]) continue;
    fertig[i] = 1;
    const c = i % cols;
    const r = (i - c) / cols;
    for (const [dc, dr, f] of NACHBARN) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const j = nr * cols + nc;
      if (fertig[j]) continue;
      const k = enter(nc, nr);
      if (!Number.isFinite(k)) continue;
      const neu = dist[i] + k * f;
      if (neu < dist[j]) {
        dist[j] = neu;
        prev[j] = i;
        push(j, neu);
      }
    }
  }

  return { cols, rows, dist, prev };
}

/**
 * Der Weg vom Start des Feldes bis zur Zielzelle, als Zellenliste.
 *
 * Leer, wenn das Ziel unerreichbar ist — das kommt vor und ist kein Fehler:
 * zwei Siedlungen können auf verschiedenen Inseln liegen.
 */
export function tracePath(feld: PathField, zielC: number, zielR: number): Array<[number, number]> {
  const start = zielR * feld.cols + zielC;
  if (!Number.isFinite(feld.dist[start])) return [];
  const out: Array<[number, number]> = [];
  let i = start;
  while (i >= 0) {
    const c = i % feld.cols;
    out.push([c, (i - c) / feld.cols]);
    i = feld.prev[i];
  }
  return out.reverse();
}
