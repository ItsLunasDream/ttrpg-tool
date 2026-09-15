/**
 * Das Geflecht als Bild: wer haengt mit wem zusammen.
 *
 * Eine Liste von Saetzen sagt, was zwischen zweien liegt; sie sagt nicht, wo
 * die Geschichte dicht ist und wer am Rand steht. Genau das ist der Grund
 * fuer diese Ansicht — sie ersetzt die Liste nicht, sie steht darueber.
 *
 * Nur Rechnen, kein Zeichnen: hier entstehen Koordinaten, das SVG baut die
 * Oberflaeche daraus. So laesst sich pruefen, was man am Bild nur erahnen
 * koennte — dass nichts aus dem Rahmen faellt, dass die Linien am Knotenrand
 * enden statt in seiner Mitte, und dass zwei gleiche Entwuerfe dasselbe Bild
 * ergeben.
 *
 * Kreislayout und keine Kraftsimulation. Ein Kreis ist bei fuenf bis acht
 * Figuren genauso lesbar, braucht keine Schleife pro Bild und ist
 * vorhersagbar: dieselbe Reihenfolge ergibt dieselbe Anordnung, und niemand
 * sucht nach dem Wurf die Figur, die eben noch links stand.
 */
import type { EntwurfsFigur, Verbindung } from './erzeuge';

export interface Knoten {
  /** Stelle in `figuren` — dieselbe Nummer, die die Verbindungen nennen. */
  readonly stelle: number;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  /** Ob die Figur aus der Kampagne stammt; das Bild zeichnet sie anders. */
  readonly vorhanden: boolean;
}

export interface Kante {
  readonly von: number;
  readonly nach: number;
  readonly muster: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  /** Mitte der Linie, fuer die Beschriftung. */
  readonly mx: number;
  readonly my: number;
}

export interface Geflecht {
  readonly breite: number;
  readonly hoehe: number;
  readonly knoten: readonly Knoten[];
  readonly kanten: readonly Kante[];
}

/** Halbmesser eines Knotenpunktes. Die Linien enden an seinem Rand. */
export const KNOTEN_RADIUS = 7;

/**
 * Wie viel Platz aussen frei bleibt.
 *
 * Nicht fuer die Punkte, sondern fuer die Namen daneben: der Punkt passt in
 * jeden Rahmen, sein Name steht sonst halb draussen.
 */
export const RAND = 64;

export function berechneGeflecht(
  figuren: readonly EntwurfsFigur[],
  verbindungen: readonly Verbindung[],
  breite = 520,
  hoehe = 340
): Geflecht {
  const mitteX = breite / 2;
  const mitteY = hoehe / 2;
  const radius = Math.max(20, Math.min(breite, hoehe) / 2 - RAND);

  const knoten: Knoten[] = figuren.map((figur, stelle) => {
    // Eine einzelne Figur steht in der Mitte statt irgendwo auf dem Kreis.
    if (figuren.length === 1) {
      return { stelle, name: figur.name, x: mitteX, y: mitteY, vorhanden: Boolean(figur.vorhanden) };
    }
    // Bei -90 Grad anfangen: die erste Figur steht oben, wo man sie sucht.
    const winkel = (-90 + (360 / figuren.length) * stelle) * (Math.PI / 180);
    return {
      stelle,
      name: figur.name,
      x: mitteX + Math.cos(winkel) * radius,
      y: mitteY + Math.sin(winkel) * radius,
      vorhanden: Boolean(figur.vorhanden)
    };
  });

  const kanten: Kante[] = [];
  for (const verbindung of verbindungen) {
    const a = knoten[verbindung.a];
    const b = knoten[verbindung.b];
    // Eine Verbindung auf eine Figur, die es nicht (mehr) gibt, wird nicht
    // gezeichnet. Im Entwurf kann das nach einem Wurf kurz vorkommen, und
    // eine Linie ins Nichts waere schlimmer als keine.
    if (!a || !b || a === b) continue;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const laenge = Math.hypot(dx, dy) || 1;
    // Am Knotenrand anfangen und enden — sonst verschwindet die Pfeilspitze
    // unter dem Punkt, und die Richtung ist weg. Die Richtung ist hier aber
    // der ganze Witz: A sieht B anders als B den A.
    const einheitX = dx / laenge;
    const einheitY = dy / laenge;
    const x1 = a.x + einheitX * KNOTEN_RADIUS;
    const y1 = a.y + einheitY * KNOTEN_RADIUS;
    const x2 = b.x - einheitX * (KNOTEN_RADIUS + 4);
    const y2 = b.y - einheitY * (KNOTEN_RADIUS + 4);

    kanten.push({
      von: verbindung.a,
      nach: verbindung.b,
      muster: verbindung.muster,
      x1,
      y1,
      x2,
      y2,
      mx: (x1 + x2) / 2,
      my: (y1 + y2) / 2
    });
  }

  return { breite, hoehe, knoten, kanten };
}

/**
 * Wo der Name eines Knotens steht.
 *
 * Aussen am Kreis, nie darin: der Name in der Mitte laege auf den Linien.
 * Die Ausrichtung haengt davon ab, auf welcher Seite der Knoten steht —
 * links vom Mittelpunkt endet der Text rechts, sonst faengt er links an.
 */
export function beschriftung(
  knoten: Knoten,
  geflecht: Geflecht
): { x: number; y: number; anker: 'start' | 'middle' | 'end' } {
  const dx = knoten.x - geflecht.breite / 2;
  const dy = knoten.y - geflecht.hoehe / 2;
  // Fast senkrecht ueber oder unter der Mitte: mittig setzen, sonst springt
  // der Text bei winzigen Unterschieden von links nach rechts.
  if (Math.abs(dx) < 12) {
    return { x: knoten.x, y: knoten.y + (dy < 0 ? -14 : 20), anker: 'middle' };
  }
  return {
    x: knoten.x + (dx > 0 ? 12 : -12),
    y: knoten.y + 4,
    anker: dx > 0 ? 'start' : 'end'
  };
}
