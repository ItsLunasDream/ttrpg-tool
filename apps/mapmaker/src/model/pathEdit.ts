/**
 * Stützpunkte einer Zeichnung nachträglich bearbeiten.
 *
 * Beim Zeichnen entstehen die Punkte, danach war die Form bisher festgelegt —
 * wer eine Ecke daneben gesetzt hatte, musste neu zeichnen. Hier steht die
 * Rechnung dafür, die Oberfläche liegt im Auswahl-Werkzeug.
 *
 * **Die Punkte liegen lokal und gedreht.** `points` bezieht sich auf den
 * Ankerpunkt des Objekts und dreht sich mit `rotation` mit; ein Griff auf dem
 * Bildschirm steht dagegen in Weltkoordinaten. Jede Funktion hier rechnet an
 * genau dieser Grenze um — verstreut über die Werkzeuge wäre die Drehung
 * garantiert irgendwo vergessen worden.
 */

import type { ShapeObject } from './types';

export interface PathNode {
  index: number;
  x: number;
  y: number;
}

/**
 * Wie viele Punkte die Form mindestens braucht.
 *
 * Rechteck und Ellipse stehen bewusst auf genau zwei: sie sind über zwei
 * gegenüberliegende Ecken beschrieben, nicht über einen Linienzug. Ihre Ecken
 * lassen sich ziehen, aber weder vermehren noch entfernen — ein Rechteck mit
 * drei Punkten wäre nichts mehr.
 */
export function minPoints(shape: ShapeObject['shape']): number {
  switch (shape) {
    case 'rect':
    case 'ellipse':
      return 2;
    case 'polygon':
      return 3;
    default:
      return 2;
  }
}

/** Darf diese Form Punkte dazubekommen oder verlieren? */
export function hasEditablePointCount(shape: ShapeObject['shape']): boolean {
  return shape !== 'rect' && shape !== 'ellipse';
}

/** Lokaler Punkt → Weltkoordinate. */
function toWorld(obj: ShapeObject, px: number, py: number): { x: number; y: number } {
  const cos = Math.cos(obj.rotation);
  const sin = Math.sin(obj.rotation);
  return { x: obj.x + px * cos - py * sin, y: obj.y + px * sin + py * cos };
}

/** Weltkoordinate → lokaler Punkt. */
function toLocal(obj: ShapeObject, wx: number, wy: number): { x: number; y: number } {
  const cos = Math.cos(obj.rotation);
  const sin = Math.sin(obj.rotation);
  const dx = wx - obj.x;
  const dy = wy - obj.y;
  return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
}

/** Alle Stützpunkte in Weltkoordinaten — die Griffe auf dem Bildschirm. */
export function pathNodes(obj: ShapeObject): PathNode[] {
  const out: PathNode[] = [];
  for (let i = 0; i < obj.points.length; i += 2) {
    const p = toWorld(obj, obj.points[i], obj.points[i + 1]);
    out.push({ index: i / 2, x: p.x, y: p.y });
  }
  return out;
}

/** Nächster Stützpunkt innerhalb der Toleranz, oder null. */
export function pickNode(obj: ShapeObject, wx: number, wy: number, tolerance: number): PathNode | null {
  let best: PathNode | null = null;
  let bestDistSq = tolerance * tolerance;
  for (const node of pathNodes(obj)) {
    const d = (node.x - wx) ** 2 + (node.y - wy) ** 2;
    if (d < bestDistSq) {
      bestDistSq = d;
      best = node;
    }
  }
  return best;
}

/** Punkte mit einem verschobenen Stützpunkt; der Zielpunkt steht in Weltkoordinaten. */
export function movePoint(obj: ShapeObject, index: number, wx: number, wy: number): number[] | null {
  if (index < 0 || index * 2 + 1 >= obj.points.length) return null;
  const lokal = toLocal(obj, wx, wy);
  const punkte = [...obj.points];
  punkte[index * 2] = lokal.x;
  punkte[index * 2 + 1] = lokal.y;
  return punkte;
}

export interface Insertion {
  points: number[];
  /** Kennung des neuen Punktes — er lässt sich danach gleich weiterziehen. */
  index: number;
}

/**
 * Fügt einen Stützpunkt auf der nächstgelegenen Kante ein.
 *
 * Gemessen wird zur *Strecke*, nicht zu den Endpunkten: ein Klick mitten auf
 * eine lange Kante soll dort einen Punkt setzen und nicht am nächsten Eck.
 * Bei einer geschlossenen Form zählt die Kante vom letzten zum ersten Punkt
 * mit — sonst ließe sich genau dort nie etwas einfügen.
 */
export function insertPoint(
  obj: ShapeObject,
  wx: number,
  wy: number,
  tolerance: number,
): Insertion | null {
  if (!hasEditablePointCount(obj.shape)) return null;
  const anzahl = obj.points.length / 2;
  if (anzahl < 2) return null;

  const lokal = toLocal(obj, wx, wy);
  const kanten = obj.closed ? anzahl : anzahl - 1;

  let besteKante = -1;
  let besteDistSq = tolerance * tolerance;
  let besterPunkt = { x: 0, y: 0 };

  for (let i = 0; i < kanten; i++) {
    const j = (i + 1) % anzahl;
    const ax = obj.points[i * 2];
    const ay = obj.points[i * 2 + 1];
    const bx = obj.points[j * 2];
    const by = obj.points[j * 2 + 1];

    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let tt = lenSq === 0 ? 0 : ((lokal.x - ax) * dx + (lokal.y - ay) * dy) / lenSq;
    tt = tt < 0 ? 0 : tt > 1 ? 1 : tt;
    const fx = ax + tt * dx;
    const fy = ay + tt * dy;
    const d = (fx - lokal.x) ** 2 + (fy - lokal.y) ** 2;
    if (d < besteDistSq) {
      besteDistSq = d;
      besteKante = i;
      besterPunkt = { x: fx, y: fy };
    }
  }

  if (besteKante < 0) return null;
  const punkte = [...obj.points];
  punkte.splice((besteKante + 1) * 2, 0, besterPunkt.x, besterPunkt.y);
  return { points: punkte, index: besteKante + 1 };
}

/**
 * Entfernt einen Stützpunkt.
 *
 * Null heißt: geht nicht — entweder ist die Form nicht dafür gemacht, oder es
 * blieben zu wenige Punkte übrig. Ein Dreieck, dem man die dritte Ecke nimmt,
 * ist keine Fläche mehr, sondern ein unsichtbarer Strich.
 */
export function removePoint(obj: ShapeObject, index: number): number[] | null {
  if (!hasEditablePointCount(obj.shape)) return null;
  const anzahl = obj.points.length / 2;
  if (index < 0 || index >= anzahl) return null;
  if (anzahl - 1 < minPoints(obj.shape)) return null;
  const punkte = [...obj.points];
  punkte.splice(index * 2, 2);
  return punkte;
}
