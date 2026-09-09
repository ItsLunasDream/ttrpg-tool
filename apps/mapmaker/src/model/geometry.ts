/**
 * Polylinien-Werkzeuge.
 *
 * Punktlisten sind durchgehend flach ([x0,y0,x1,y1,…]) — das spart bei
 * Freihandstrichen mit tausenden Punkten die Objekt-Allokationen.
 *
 * Douglas-Peucker wird zweimal gebraucht: beim Zeichnen, um Freihandstriche zu
 * entschlacken, und später beim Ableiten von Wänden aus Raumkonturen.
 */

export interface Vec {
  x: number;
  y: number;
}

/** Quadrierter Abstand eines Punktes zur Strecke a–b. */
export function pointSegmentDistanceSq(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return (px - cx) ** 2 + (py - cy) ** 2;
}

/**
 * Douglas-Peucker: entfernt Punkte, die weniger als `tolerance` von der
 * vereinfachten Linie abweichen. Iterativ statt rekursiv, damit sehr lange
 * Striche nicht den Aufrufstapel sprengen.
 */
export function douglasPeucker(points: number[], tolerance: number): number[] {
  const n = points.length / 2;
  if (n < 3 || tolerance <= 0) return [...points];

  const tolSq = tolerance * tolerance;
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;

  const stack: Array<[number, number]> = [[0, n - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    if (last - first < 2) continue;

    let maxDist = -1;
    let index = -1;
    const ax = points[first * 2];
    const ay = points[first * 2 + 1];
    const bx = points[last * 2];
    const by = points[last * 2 + 1];

    for (let i = first + 1; i < last; i++) {
      const d = pointSegmentDistanceSq(points[i * 2], points[i * 2 + 1], ax, ay, bx, by);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }

    if (maxDist > tolSq && index > 0) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    if (keep[i]) out.push(points[i * 2], points[i * 2 + 1]);
  }
  return out;
}

/**
 * Chaikin-Glättung: ersetzt jede Ecke durch zwei Punkte auf ein Viertel bzw.
 * drei Viertel der Strecke. Runde Kurven ohne Spline-Mathematik.
 */
export function chaikin(points: number[], iterations = 1, closed = false): number[] {
  let current = points;
  for (let it = 0; it < iterations; it++) {
    const n = current.length / 2;
    if (n < 3) return current;

    const out: number[] = [];
    if (!closed) out.push(current[0], current[1]);

    const segments = closed ? n : n - 1;
    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % n;
      const ax = current[i * 2];
      const ay = current[i * 2 + 1];
      const bx = current[j * 2];
      const by = current[j * 2 + 1];
      out.push(ax + (bx - ax) * 0.25, ay + (by - ay) * 0.25);
      out.push(ax + (bx - ax) * 0.75, ay + (by - ay) * 0.75);
    }

    if (!closed) out.push(current[current.length - 2], current[current.length - 1]);
    current = out;
  }
  return current;
}

/** Wirft Punkte weg, die dichter als `minDistance` beieinander liegen. */
export function dropDensePoints(points: number[], minDistance: number): number[] {
  const n = points.length / 2;
  if (n < 2) return [...points];
  const minSq = minDistance * minDistance;

  const out = [points[0], points[1]];
  let lastX = points[0];
  let lastY = points[1];
  for (let i = 1; i < n - 1; i++) {
    const x = points[i * 2];
    const y = points[i * 2 + 1];
    if ((x - lastX) ** 2 + (y - lastY) ** 2 >= minSq) {
      out.push(x, y);
      lastX = x;
      lastY = y;
    }
  }
  out.push(points[(n - 1) * 2], points[(n - 1) * 2 + 1]);
  return out;
}

/**
 * Freihandstrich aufbereiten: erst ausdünnen, dann vereinfachen, dann runden.
 * `strength` 0 lässt die Rohpunkte stehen, 1 glättet kräftig.
 */
export function smoothStroke(points: number[], strength: number, closed = false): number[] {
  if (points.length < 6 || strength <= 0) return [...points];
  const thinned = dropDensePoints(points, 1 + strength * 3);
  const simplified = douglasPeucker(thinned, 0.5 + strength * 3.5);
  return chaikin(simplified, strength > 0.6 ? 2 : 1, closed);
}

export function polylineLength(points: number[]): number {
  let total = 0;
  for (let i = 2; i < points.length; i += 2) {
    total += Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]);
  }
  return total;
}

/** Achsenparallele Hülle einer Punktliste. */
export function boundsOf(points: number[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (points.length < 2) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    if (points[i] < minX) minX = points[i];
    if (points[i] > maxX) maxX = points[i];
    if (points[i + 1] < minY) minY = points[i + 1];
    if (points[i + 1] > maxY) maxY = points[i + 1];
  }
  return { minX, minY, maxX, maxY };
}

/**
 * Zerlegt einen Linienzug in die sichtbaren Stücke eines Strichmusters.
 *
 * Pixi kann keine gestrichelten Striche; `Stroke.dash` blieb deshalb wirkungslos
 * und gestrichelte Linien sahen durchgezogen aus. Hier wird das Muster über die
 * Bogenlänge abgetragen — über Segmentgrenzen hinweg, sonst begänne an jeder
 * Ecke ein neuer Strich und das Muster wirkte unruhig.
 *
 * `pattern` ist [Strich, Lücke, Strich, Lücke, …]. Leer oder unbrauchbar heißt:
 * ein einziges Stück, also durchgezogen.
 */
export function dashPolyline(points: number[], pattern: number[], closed = false): number[][] {
  const valid = pattern.filter((n) => n > 0);
  if (points.length < 4 || valid.length === 0) return points.length >= 4 ? [points] : [];

  const pts = closed ? [...points, points[0], points[1]] : points;
  const out: number[][] = [];
  let current: number[] = [];

  let index = 0; // Stelle im Muster
  let left = valid[0]; // Rest des aktuellen Musterabschnitts
  let on = true; // gerader Index = sichtbar

  for (let i = 0; i + 3 < pts.length; i += 2) {
    const ax = pts[i];
    const ay = pts[i + 1];
    const bx = pts[i + 2];
    const by = pts[i + 3];
    let segLen = Math.hypot(bx - ax, by - ay);
    if (segLen === 0) continue;

    const ux = (bx - ax) / segLen;
    const uy = (by - ay) / segLen;
    let px = ax;
    let py = ay;

    if (on && current.length === 0) current.push(px, py);

    while (segLen > 0) {
      const step = Math.min(left, segLen);
      const nx = px + ux * step;
      const ny = py + uy * step;

      if (on) current.push(nx, ny);

      px = nx;
      py = ny;
      segLen -= step;
      left -= step;

      if (left <= 1e-9) {
        // Musterabschnitt zu Ende: umschalten und das begonnene Stück ablegen.
        if (on && current.length >= 4) out.push(current);
        current = [];
        on = !on;
        index = (index + 1) % valid.length;
        left = valid[index];
        if (on) current.push(px, py);
      }
    }
  }

  if (on && current.length >= 4) out.push(current);
  return out;
}

export interface Rect {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Schneidet die Strecke das achsenparallele Rechteck oder liegt sie darin?
 *
 * Nach Liang-Barsky: die Strecke wird als `a + t·d` betrachtet und `t` an den
 * vier Kanten beschnitten. Bleibt ein Intervall übrig, gibt es einen Schnitt.
 *
 * Für die Gummiband-Auswahl von Wandzügen gebraucht. Nur die Hülle zu prüfen
 * griffe dort zu weit: bei einer langen schrägen Wand ist die Hülle riesig,
 * und ein Rahmen weitab der Wand würde sie mitnehmen.
 */
export function segmentIntersectsRect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rect: Rect,
): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  let t0 = 0;
  let t1 = 1;

  // Je Kante: p ist die Richtung, q der Abstand zur Kante.
  const edges: Array<[number, number]> = [
    [-dx, ax - rect.minX],
    [dx, rect.maxX - ax],
    [-dy, ay - rect.minY],
    [dy, rect.maxY - ay],
  ];

  for (const [p, q] of edges) {
    if (p === 0) {
      // Parallel zur Kante: liegt sie außerhalb, kann es keinen Schnitt geben.
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return true;
}

/**
 * Hat der Linienzug überhaupt Ausdehnung?
 *
 * Zwei Punkte auf derselben Stelle sind keine Linie. Sie entstehen leichter,
 * als man denkt: zwischen zwei Klicks *ohne* Zeigerbewegung — auf einem Tablett
 * der Normalfall, weil ein Tippen kein `pointermove` schickt — bleibt der
 * mitlaufende Punkt auf dem vorigen liegen. Herauskommt eine Wand ohne Länge,
 * die in Foundry nichts ist, das man anfassen kann, und die die Prüfung vor dem
 * Export als zwei freie Enden meldet.
 */
export function hasExtent(points: number[], epsilon = 0.5): boolean {
  const minSq = epsilon * epsilon;
  for (let i = 2; i < points.length; i += 2) {
    const dx = points[i] - points[0];
    const dy = points[i + 1] - points[1];
    if (dx * dx + dy * dy >= minSq) return true;
  }
  return false;
}

/**
 * Berührt der Kreis das achsenparallele Rechteck?
 *
 * Über den nächstgelegenen Punkt des Rechtecks: jede Achse für sich auf das
 * Intervall beschneiden, dann den Abstand zum Mittelpunkt messen. Liegt der
 * Mittelpunkt innerhalb, ist der nächstgelegene Punkt er selbst — ein Kreis
 * ganz im Rechteck zählt also mit.
 *
 * Für die Export-Prüfung gebraucht: ein Licht *neben* der Karte, das noch
 * hineinleuchtet, ist kein Fehler. Der Mittelpunkt allein sagt darüber nichts.
 */
export function circleIntersectsRect(
  cx: number,
  cy: number,
  radius: number,
  rect: Rect,
): boolean {
  const nx = cx < rect.minX ? rect.minX : cx > rect.maxX ? rect.maxX : cx;
  const ny = cy < rect.minY ? rect.minY : cy > rect.maxY ? rect.maxY : cy;
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Geschlossenes Band um eine Mittellinie.
 *
 * Hin auf der einen Seite, zurück auf der anderen — daraus wird ein Polygon mit
 * echter Fläche. Einen Linienzug einfach zu füllen ergäbe ein entartetes
 * Polygon ohne Inhalt.
 *
 * `taper` verjüngt zum Anfang hin: für einen Fluss richtig, für einen
 * gemalten Weg nicht. 0 heißt gleichbleibende Breite.
 */
export function strokeBand(points: number[], halfWidth: number, taper = 0): number[] {
  const n = points.length / 2;
  if (n < 2 || halfWidth <= 0) return points;

  const oben: number[] = [];
  const unten: number[] = [];
  for (let i = 0; i < n; i++) {
    // Richtung aus den Nachbarpunkten: an den Enden fällt der fehlende Nachbar
    // auf den Punkt selbst zurück.
    const a = Math.max(0, i - 1);
    const b = Math.min(n - 1, i + 1);
    const dx = points[b * 2] - points[a * 2];
    const dy = points[b * 2 + 1] - points[a * 2 + 1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const w = halfWidth * (1 - taper + taper * (i / Math.max(1, n - 1)));
    oben.push(points[i * 2] + nx * w, points[i * 2 + 1] + ny * w);
    unten.unshift(points[i * 2] - nx * w, points[i * 2 + 1] - ny * w);
  }
  return [...oben, ...unten];
}

/** Verschiebt alle Punkte, ohne die Eingabe zu verändern. */
export function translatePoints(points: number[], dx: number, dy: number): number[] {
  const out = new Array<number>(points.length);
  for (let i = 0; i < points.length; i += 2) {
    out[i] = points[i] + dx;
    out[i + 1] = points[i + 1] + dy;
  }
  return out;
}
