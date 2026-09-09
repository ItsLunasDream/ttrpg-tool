/**
 * Text entlang eines Pfades anordnen.
 *
 * Reine Mathematik: hinein gehen der Pfad und die Vorschubbreiten der Zeichen,
 * heraus kommt je Zeichen eine Position und ein Winkel. Wie breit ein Zeichen
 * ist, kann das Modell nicht wissen — das misst der Renderer und reicht es
 * hier hinein. Dieselbe Trennung wie bei den Textmaßen für die Trefferprüfung.
 */

export interface GlyphPlacement {
  index: number;
  x: number;
  y: number;
  /** Tangentenwinkel im Bogenmaß. */
  angle: number;
}

/** Länge je Teilstück und Gesamtlänge eines Linienzugs. */
function arcLengths(points: number[]): { cumulative: number[]; total: number } {
  const cumulative = [0];
  let total = 0;
  for (let i = 2; i < points.length; i += 2) {
    total += Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]);
    cumulative.push(total);
  }
  return { cumulative, total };
}

/** Punkt und Tangente an einer Bogenlänge. */
function at(points: number[], cumulative: number[], distance: number): { x: number; y: number; angle: number } {
  const n = cumulative.length;
  // Vor dem Anfang und hinter dem Ende wird das erste bzw. letzte Stück
  // verlängert — sonst stauchten sich zu lange Texte am Pfadende zusammen.
  let i = 1;
  while (i < n - 1 && cumulative[i] < distance) i++;
  const l0 = cumulative[i - 1];
  const l1 = cumulative[i];
  const t = l1 - l0 === 0 ? 0 : (distance - l0) / (l1 - l0);

  const ax = points[(i - 1) * 2];
  const ay = points[(i - 1) * 2 + 1];
  const bx = points[i * 2];
  const by = points[i * 2 + 1];
  return {
    x: ax + (bx - ax) * t,
    y: ay + (by - ay) * t,
    angle: Math.atan2(by - ay, bx - ax),
  };
}

/**
 * Zeichen auf dem Pfad verteilen.
 *
 * Jedes Zeichen sitzt auf seiner *Mitte*; `advances` sind die Vorschubbreiten
 * in Reihenfolge. `align` bestimmt, wo der Text auf dem Pfad beginnt.
 */
export function layoutOnPath(
  points: number[],
  advances: number[],
  letterSpacing: number,
  align: 'left' | 'center' | 'right' = 'center',
): GlyphPlacement[] {
  if (points.length < 4 || advances.length === 0) return [];
  const { cumulative, total } = arcLengths(points);
  if (total <= 0) return [];

  const breite =
    advances.reduce((a, b) => a + b, 0) + letterSpacing * Math.max(0, advances.length - 1);

  let cursor = 0;
  if (align === 'center') cursor = (total - breite) / 2;
  else if (align === 'right') cursor = total - breite;

  const out: GlyphPlacement[] = [];
  for (let i = 0; i < advances.length; i++) {
    const mitte = cursor + advances[i] / 2;
    const p = at(points, cumulative, mitte);
    out.push({ index: i, x: p.x, y: p.y, angle: p.angle });
    cursor += advances[i] + letterSpacing;
  }
  return out;
}

/**
 * Kreisbogen als Pfad für eine gegebene Textbreite.
 *
 * `curvature` von -1 bis 1: 0 ergibt eine Gerade, positive Werte wölben nach
 * oben, negative nach unten. Damit lässt sich eine Beschriftung über eine
 * Bucht oder ein Gebirge legen, ohne einen Pfad zeichnen zu müssen.
 */
export function arcPath(width: number, curvature: number, segments = 32): number[] {
  const halb = width / 2;
  if (Math.abs(curvature) < 0.01) return [-halb, 0, halb, 0];

  // Stichhöhe aus der Wölbung; daraus Radius und Öffnungswinkel des Bogens.
  const sagitta = curvature * halb;
  const radius = (halb * halb + sagitta * sagitta) / (2 * Math.abs(sagitta));
  const halbwinkel = Math.asin(Math.min(1, halb / radius));
  const richtung = Math.sign(sagitta);

  const punkte: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = -halbwinkel + (i / segments) * halbwinkel * 2;
    punkte.push(
      Math.sin(a) * radius,
      richtung * (radius * Math.cos(a) - radius * Math.cos(halbwinkel)) * -1,
    );
  }
  return punkte;
}
