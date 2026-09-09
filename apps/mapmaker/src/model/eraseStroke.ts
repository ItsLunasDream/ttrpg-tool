/**
 * Radiergummi für Zeichnungen.
 *
 * Bisher ließ sich nur ein ganzes Objekt löschen. Wer eine Wandlinie um eine
 * Handbreit kürzen wollte, musste sie neu zeichnen.
 *
 * Gerechnet wird auf dem Linienzug, nicht auf Pixeln: ein Strich ist im Modell
 * eine Punktfolge, und ein Radiergummi schneidet daraus Stücke heraus. Aus
 * einem Strich können dabei mehrere werden — genau das ist der Fall, den ein
 * naives „Punkte im Kreis wegwerfen" falsch macht: es zöge die Lücke einfach
 * zu und ließe eine Gerade quer durch das Radierte stehen.
 *
 * Der Schnitt liegt exakt auf dem Kreisrand (Strecke-Kreis-Schnitt), nicht auf
 * dem nächsten Stützpunkt. Sonst hinge das Ergebnis davon ab, wie fein jemand
 * gezeichnet hat.
 */

/** Punkte, die auf weniger als das auseinanderliegen, gelten als derselbe. */
const EPSILON = 1e-6;

/**
 * Schneidet einen Kreis aus einem Linienzug.
 *
 * Alles in **lokalen** Koordinaten des Objekts — der Aufrufer rechnet Zeiger
 * und Radius vorher um. Zurück kommen die übrig gebliebenen Züge, jeder für
 * sich offen: was einmal aufgeschnitten ist, ist kein Ring mehr.
 *
 * Leeres Ergebnis heißt: vollständig wegradiert.
 */
export function eraseCircle(
  points: number[],
  closed: boolean,
  cx: number,
  cy: number,
  radius: number,
): number[][] {
  const n = points.length / 2;
  if (n < 2 || radius <= 0) return points.length >= 4 ? [[...points]] : [];

  const runs: number[][] = [];
  let current: number[] = [];

  const setze = (x: number, y: number) => {
    const lx = current[current.length - 2];
    const ly = current[current.length - 1];
    if (current.length === 0 || Math.hypot(lx - x, ly - y) > EPSILON) current.push(x, y);
  };
  const abschliessen = () => {
    if (current.length >= 4) runs.push(current);
    current = [];
  };

  const segmente = closed ? n : n - 1;
  for (let i = 0; i < segmente; i++) {
    const j = (i + 1) % n;
    const ax = points[i * 2];
    const ay = points[i * 2 + 1];
    const bx = points[j * 2];
    const by = points[j * 2 + 1];

    const innen = innenIntervall(ax, ay, bx, by, cx, cy, radius);

    if (!innen) {
      setze(ax, ay);
      setze(bx, by);
      continue;
    }

    const [s, e] = innen;
    if (s <= 0 && e >= 1) {
      // Das ganze Segment liegt im Kreis: hier reißt der Zug ab.
      abschliessen();
      continue;
    }
    if (s > 0) {
      setze(ax, ay);
      setze(ax + (bx - ax) * s, ay + (by - ay) * s);
    }
    abschliessen();
    if (e < 1) {
      setze(ax + (bx - ax) * e, ay + (by - ay) * e);
      setze(bx, by);
    }
  }
  abschliessen();

  return closed ? ringSchliessen(runs, points) : runs;
}

/**
 * Bei einem Ring gehören erster und letzter Zug zusammen.
 *
 * Der Rundgang beginnt an einem willkürlichen Stützpunkt. Liegt der nicht im
 * Radierten, entstehen dort zwei Enden, die in Wahrheit eines sind — sichtbar
 * als Naht mitten im übrig gebliebenen Bogen.
 */
function ringSchliessen(runs: number[][], points: number[]): number[][] {
  if (runs.length < 2) return runs;
  const erster = runs[0];
  const letzter = runs[runs.length - 1];
  const startX = points[0];
  const startY = points[1];

  const beginntAmStart = Math.hypot(erster[0] - startX, erster[1] - startY) <= EPSILON;
  const endetAmStart =
    Math.hypot(letzter[letzter.length - 2] - startX, letzter[letzter.length - 1] - startY) <=
    EPSILON;
  if (!beginntAmStart || !endetAmStart) return runs;

  // Den letzten Zug vorn anhängen, ohne den doppelten Punkt.
  runs[0] = [...letzter.slice(0, -2), ...erster];
  runs.pop();
  return runs;
}

/**
 * Der Abschnitt der Strecke, der im Kreis liegt — als Parameterintervall.
 *
 * `null` heißt: die Strecke berührt den Kreis nicht. Das Intervall ist auf
 * [0,1] beschnitten; ein leeres Ergebnis wird als `null` gemeldet.
 */
function innenIntervall(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  r: number,
): [number, number] | null {
  const dx = bx - ax;
  const dy = by - ay;
  const fx = ax - cx;
  const fy = ay - cy;

  const A = dx * dx + dy * dy;
  if (A < EPSILON) {
    // Entartetes Segment: entweder ganz drin oder ganz draußen.
    return fx * fx + fy * fy <= r * r ? [0, 1] : null;
  }

  const B = 2 * (fx * dx + fy * dy);
  const C = fx * fx + fy * fy - r * r;
  const disc = B * B - 4 * A * C;
  if (disc <= 0) return null;

  const wurzel = Math.sqrt(disc);
  const t1 = (-B - wurzel) / (2 * A);
  const t2 = (-B + wurzel) / (2 * A);

  const s = Math.max(0, Math.min(1, t1));
  const e = Math.max(0, Math.min(1, t2));
  if (t2 <= 0 || t1 >= 1 || e - s <= EPSILON) return null;
  return [s, e];
}
