/**
 * Die Vergroesserung des Notiztextes.
 *
 * In Prozent, damit die Anzeige oben rechts genau das zeigen kann, was
 * eingestellt ist. Gilt nur fuer das Editorfeld — Seitenleisten, Kopfzeilen
 * und Dialoge bleiben, wie sie sind; fuer die Groesse der ganzen Oberflaeche
 * ist ein eigener Punkt vorgesehen.
 *
 * Plattformfrei: kein node:*, kein electron, keine Browser-Globals.
 */

export const ZOOM_MIN = 20;
export const ZOOM_MAX = 500;
export const ZOOM_NORMAL = 100;

/**
 * Die Stufen, die ein Schritt nimmt. Wie im Browser ungleichmaessig: unten
 * fein, oben grob — von 400 auf 410 sieht niemand einen Unterschied.
 */
export const ZOOM_STUFEN = [20, 25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500];

export function begrenzeZoom(wert: number): number {
  if (!Number.isFinite(wert)) return ZOOM_NORMAL;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(wert)));
}

/**
 * Die naechste Stufe in eine Richtung. Steht der Wert zwischen zwei Stufen,
 * etwa weil er von Hand gesetzt wurde, geht es zur naechsten in dieser
 * Richtung weiter.
 */
export function naechsteZoomstufe(aktuell: number, richtung: 1 | -1): number {
  const wert = begrenzeZoom(aktuell);
  if (richtung > 0) return ZOOM_STUFEN.find((stufe) => stufe > wert) ?? ZOOM_MAX;
  return [...ZOOM_STUFEN].reverse().find((stufe) => stufe < wert) ?? ZOOM_MIN;
}
