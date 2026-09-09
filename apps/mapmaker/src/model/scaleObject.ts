/**
 * Objekte skalieren.
 *
 * Was „größer machen" heißt, hängt von der Art ab: ein Prop bekommt einen
 * Skalierfaktor, eine Zeichnung muss ihre Punkte mitziehen, und bei Text ist
 * es die Schriftgröße. Ohne diese Fallunterscheidung ließe sich am Canvas nur
 * ein Teil der Objekte anfassen.
 *
 * Zurück kommt ein Patch, kein verändertes Objekt — so wandert das Ergebnis
 * unverändert in einen PatchObjects-Befehl und bleibt rückgängig zu machen.
 */

import type { MapObject } from './types';

/** Kleinster erlaubter Faktor; darunter verschwindet das Objekt unerreichbar. */
export const MIN_SCALE = 0.02;

export function scalePatch(
  obj: MapObject,
  faktorX: number,
  faktorY: number,
): Record<string, unknown> | null {
  const fx = Math.max(MIN_SCALE, faktorX);
  const fy = Math.max(MIN_SCALE, faktorY);

  switch (obj.kind) {
    case 'prop':
      return { scaleX: obj.scaleX * fx, scaleY: obj.scaleY * fy };
    case 'shape': {
      const punkte = new Array<number>(obj.points.length);
      for (let i = 0; i < obj.points.length; i += 2) {
        punkte[i] = obj.points[i] * fx;
        punkte[i + 1] = obj.points[i + 1] * fy;
      }
      // Die Strichstärke mitzuskalieren wirkt richtiger, als sie stehen zu
      // lassen — sonst wird aus einem kräftigen Rahmen beim Verkleinern ein
      // Klotz.
      const stroke = obj.stroke
        ? { ...obj.stroke, width: obj.stroke.width * Math.abs((fx + fy) / 2) }
        : null;
      return { points: punkte, stroke };
    }
    case 'text': {
      // Text kennt keine getrennten Achsen; der Mittelwert hält ihn lesbar.
      const f = (Math.abs(fx) + Math.abs(fy)) / 2;
      return { fontSize: Math.max(1, obj.fontSize * f) };
    }
  }
}
