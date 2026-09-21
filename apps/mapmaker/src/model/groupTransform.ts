/**
 * Mehrere Objekte gemeinsam drehen und skalieren.
 *
 * Das ist etwas anderes, als jedes Objekt für sich zu transformieren: die
 * *Lage* der Objekte zueinander muss mitgehen. Beim Drehen wandert jeder
 * Mittelpunkt auf einer Kreisbahn um den Gruppenmittelpunkt, beim Skalieren
 * rücken die Mittelpunkte auseinander oder zusammen — und obendrein ändert
 * sich jedes Objekt selbst.
 *
 * **Warum ungleichmäßiges Skalieren nur bei ungedrehten Gruppen geht:** eine
 * Fläche, die um 30° gedreht ist, und die man in x doppelt so breit zieht,
 * wird *geschert*. Scherung lässt sich in unserem Modell nicht ausdrücken —
 * ein Prop hat scaleX und scaleY in seinem *eigenen* Bezugssystem, keine
 * Matrix. Statt still etwas Falsches zu rechnen, fällt der Fall hier auf
 * gleichmäßiges Skalieren zurück. Das ist der ehrliche Kompromiss, und beim
 * häufigen Fall — ein paar ungedrehte Objekte zusammen kleiner ziehen —
 * kostet er nichts.
 */

import { MIN_SCALE, scalePatch } from './scaleObject';
import type { MapObject } from './types';

export interface Point {
  x: number;
  y: number;
}

/** Wie stark eine Drehung von null abweichen darf, um noch als „ungedreht" zu gelten. */
const ROTATION_EPSILON = 1e-3;

/** Darf diese Auswahl ungleichmäßig skaliert werden? */
export function allowsNonUniformScale(objects: MapObject[]): boolean {
  return objects.every((o) => Math.abs(o.rotation) < ROTATION_EPSILON);
}

/**
 * Patches, um eine Gruppe um `delta` (Bogenmaß) um `center` zu drehen.
 *
 * Jedes Objekt dreht sich um denselben Betrag *und* wandert auf seiner
 * Kreisbahn mit. Ohne den zweiten Teil drehten sich die Objekte an Ort und
 * Stelle, und die Gruppe behielte ihre Form nicht.
 */
export function rotateGroupPatch(
  objects: MapObject[],
  center: Point,
  delta: number,
): Map<string, Record<string, unknown>> {
  const cos = Math.cos(delta);
  const sin = Math.sin(delta);
  const out = new Map<string, Record<string, unknown>>();

  for (const obj of objects) {
    const dx = obj.x - center.x;
    const dy = obj.y - center.y;
    out.set(obj.id, {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
      rotation: obj.rotation + delta,
    });
  }
  return out;
}

/**
 * Patches, um eine Gruppe um `center` zu skalieren.
 *
 * `objects` sind die *Ausgangszustände*, nicht die laufend veränderten: sonst
 * wüchse der Faktor bei jedem Mausschritt auf den bereits skalierten Zustand
 * auf, und aus einem Ziehen um das Doppelte würde das Zwanzigfache. Derselbe
 * Fehler ist beim Skalieren einzelner Objekte schon einmal passiert.
 */
export function scaleGroupPatch(
  objects: MapObject[],
  center: Point,
  faktorX: number,
  faktorY: number,
): Map<string, Record<string, unknown>> {
  // Genauso klemmen wie `scalePatch`, damit Lage und Größe denselben Faktor
  // sehen — sonst rückten die Objekte weiter zusammen, als sie schrumpfen.
  let fx = Math.max(MIN_SCALE, faktorX);
  let fy = Math.max(MIN_SCALE, faktorY);
  if (!allowsNonUniformScale(objects)) {
    const f = (fx + fy) / 2;
    fx = f;
    fy = f;
  }

  const out = new Map<string, Record<string, unknown>>();
  for (const obj of objects) {
    const patch = scalePatch(obj, fx, fy);
    if (!patch) continue;
    out.set(obj.id, {
      ...patch,
      x: center.x + (obj.x - center.x) * fx,
      y: center.y + (obj.y - center.y) * fy,
    });
  }
  return out;
}

/**
 * Patch, um ein *einzelnes* Objekt um seine Mitte zu drehen.
 *
 * Gedreht wird in der Anzeige um den Ursprung `x`/`y` des Objekts. Bei einem
 * Prop oder einem Bild ist das auch die Mitte; bei einer Zeichnung ist es der
 * erste Punkt — beim Terrain-Pinsel die Kante am Anfang des Striches. Eine so
 * gemalte Fläche drehte sich deshalb um ihre obere linke Ecke und wanderte
 * dabei quer über die Karte.
 *
 * `local` ist der Abstand der Mitte vom Ursprung im *eigenen* Bezugssystem des
 * Objekts, also unabhängig von der Drehung. Die Weltmitte ist
 * `x/y + R(rotation) · local`; soll sie beim Drehen stehenbleiben, muss der
 * Ursprung um denselben Betrag zurückweichen.
 *
 * Das heilt auch Karten, die es schon gibt: der Ursprung der abgelegten
 * Flächen bleibt, wo er ist, gedreht wird trotzdem um die Mitte.
 */
export function rotateAroundCenterPatch(
  local: Point,
  center: Point,
  rotation: number,
): Record<string, unknown> {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    rotation,
    x: center.x - (local.x * cos - local.y * sin),
    y: center.y - (local.x * sin + local.y * cos),
  };
}
