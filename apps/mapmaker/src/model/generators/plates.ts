/**
 * Weltkarte aus tektonischen Platten statt aus Rauschen.
 *
 * Das fraktale Rauschen ergibt weiche, überall gleich aussehende Küsten. Eine
 * Plattenkarte sieht anders aus, und zwar auf eine Weise, die man von echten
 * Karten kennt: Landmassen mit geraderen Rändern, und **Gebirge dort, wo zwei
 * Platten aneinanderstoßen** — nicht zufällig verteilt, sondern als Kette
 * entlang einer Naht.
 *
 * Genau das ist der Grund für diese Variante. Ein zweites Rauschen mit anderen
 * Werten wäre keine Alternative gewesen, sondern dasselbe in anderer Frequenz.
 *
 * Gerechnet wird über die *zwei* nächsten Platten je Feld: die nähere gibt die
 * Grundhöhe, der Abstandsunterschied zur zweiten sagt, wie nah die Naht ist.
 * Mit nur einer nächsten Platte gäbe es Stufen an den Grenzen statt Gebirge.
 */

import type { Rng } from '../rng';

export interface Plate {
  x: number;
  y: number;
  /** Kontinentalplatte (Land) oder ozeanische Platte? */
  land: boolean;
  /** Grundhöhe der Platte, 0 bis 1. */
  base: number;
}

export interface PlateOptions {
  cols: number;
  rows: number;
  /** Anzahl Platten. Wenige = große Kontinente. */
  count: number;
  /** Anteil Kontinentalplatten, 0 bis 1. */
  landShare: number;
  /** Breite der Nahtzone in Feldern — darüber wächst das Gebirge. */
  ridgeWidth: number;
  /** Wie hoch sich die Naht zweier Landplatten auftürmt. */
  ridgeHeight: number;
}

export function defaultPlateOptions(cols: number, rows: number): PlateOptions {
  return {
    cols,
    rows,
    // Faustregel: rund eine Platte je 380 Felder. Bei 64×44 sind das sieben —
    // wenige große Kontinente statt einer Flickendecke.
    count: Math.max(4, Math.round((cols * rows) / 380)),
    landShare: 0.45,
    ridgeWidth: Math.max(3, Math.round(Math.min(cols, rows) / 9)),
    ridgeHeight: 0.34,
  };
}

/**
 * Plattenmittelpunkte streuen.
 *
 * Bewusst nicht ganz zufällig: die Punkte werden über ein grobes Gitter
 * verteilt und darin verschoben. Rein zufällige Punkte klumpen — es entstünden
 * ein paar winzige Platten neben einer riesigen, und die Karte sähe nach
 * Zufall aus statt nach Tektonik.
 */
export function makePlates(rng: Rng, opts: PlateOptions): Plate[] {
  const spalten = Math.max(1, Math.round(Math.sqrt(opts.count * (opts.cols / opts.rows))));
  const zeilen = Math.max(1, Math.ceil(opts.count / spalten));
  const zellBreite = opts.cols / spalten;
  const zellHoehe = opts.rows / zeilen;

  const plates: Plate[] = [];
  for (let zr = 0; zr < zeilen; zr++) {
    for (let zc = 0; zc < spalten && plates.length < opts.count; zc++) {
      const land = rng.next() < opts.landShare;
      plates.push({
        x: (zc + rng.range(0.2, 0.8)) * zellBreite,
        y: (zr + rng.range(0.2, 0.8)) * zellHoehe,
        land,
        // Landplatten liegen deutlich über, ozeanische deutlich unter der
        // Meereshöhe. Dazwischen bliebe sonst alles Strand.
        base: land ? rng.range(0.52, 0.7) : rng.range(0.12, 0.3),
      });
    }
  }
  return plates;
}

/** Die zwei nächsten Platten zu einem Feld, mit ihren Abständen. */
function nearestTwo(
  plates: Plate[],
  c: number,
  r: number,
): { erste: Plate; d1: number; d2: number } {
  let erste = plates[0];
  let d1 = Infinity;
  let d2 = Infinity;
  for (const p of plates) {
    const d = Math.hypot(p.x - c, p.y - r);
    if (d < d1) {
      d2 = d1;
      d1 = d;
      erste = p;
    } else if (d < d2) {
      d2 = d;
    }
  }
  return { erste, d1, d2: Number.isFinite(d2) ? d2 : d1 };
}

/**
 * Höhenfeld aus den Platten.
 *
 * `jitter` verschiebt die Abfrage je Feld ein wenig — ohne das wären die
 * Plattengrenzen mathematisch gerade Linien, und das sieht nach Kristall aus,
 * nicht nach Landkarte. Der Wert kommt von außen, damit dieselbe Rechnung mit
 * demselben Rauschen wie der Rest des Generators arbeitet.
 */
export function plateField(
  plates: Plate[],
  opts: PlateOptions,
  jitter: (c: number, r: number) => { dx: number; dy: number } = () => ({ dx: 0, dy: 0 }),
): Float32Array {
  const out = new Float32Array(opts.cols * opts.rows);

  for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      const versatz = jitter(c, r);
      const { erste, d1, d2 } = nearestTwo(plates, c + versatz.dx, r + versatz.dy);

      // 1 direkt auf der Naht, 0 weit davon entfernt.
      const naht = Math.max(0, 1 - (d2 - d1) / opts.ridgeWidth);
      let h = erste.base;

      if (erste.land) {
        // Auf Land türmt sich die Naht auf — quadratisch, damit das Gebirge
        // einen Kamm bekommt und nicht ein Plateau.
        h += naht * naht * opts.ridgeHeight;
      } else {
        // Im Ozean sinkt sie leicht ab: ein Graben, kein Rücken. Ein Rücken
        // würde stellenweise über die Meereshöhe stoßen und Inselketten
        // erzeugen, wo keine gemeint sind.
        h -= naht * naht * opts.ridgeHeight * 0.25;
      }

      out[r * opts.cols + c] = h < 0 ? 0 : h > 1 ? 1 : h;
    }
  }
  return out;
}
