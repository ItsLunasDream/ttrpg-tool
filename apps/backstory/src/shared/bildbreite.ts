/**
 * Die Breite eines Bildes im Fliesstext.
 *
 * Zwei Formen sind erlaubt: Bildpunkte ("300") und Anteil der Textbreite
 * ("50%"). Beide stehen im selben Attribut am Bild, und deshalb wird hier an
 * einer Stelle entschieden, was gueltig ist und wie es geschrieben wird —
 * verstreute Regeln haetten frueher oder spaeter eine Zahl dort erwartet, wo
 * ein Anteil steht.
 *
 * Plattformfrei: kein node:*, kein electron, keine Browser-Globals.
 */

/** Unter 20 Bildpunkten ist nichts mehr zu erkennen. */
export const BREITE_MIN = 20;
/** Mehr als das ist breiter als jeder Bildschirm, auf dem gelesen wird. */
export const BREITE_MAX = 4000;

/**
 * Liest eine getippte Breite. Gibt die geschriebene Form zurueck, oder null,
 * wenn daraus nichts wird — dann bleibt die Breite, wie sie war, statt ein
 * kaputtes Attribut in die Notiz zu schreiben.
 */
export function leseBreite(eingabe: string): string | null {
  const text = eingabe.trim().replace(',', '.');
  if (text === '') return null;

  const prozent = text.endsWith('%');
  const zahl = Number(prozent ? text.slice(0, -1).trim() : text.replace(/px$/i, '').trim());
  if (!Number.isFinite(zahl)) return null;

  const gerundet = Math.round(zahl);
  if (prozent) return gerundet >= 1 && gerundet <= 100 ? `${gerundet}%` : null;
  return gerundet >= BREITE_MIN && gerundet <= BREITE_MAX ? String(gerundet) : null;
}

/** Ob die Breite ein Anteil der Textbreite ist. */
export function istAnteil(breite: string): boolean {
  return breite.trim().endsWith('%');
}

/**
 * Wie die Breite am Bild steht.
 *
 * Bildpunkte als `width`, Anteile als Stilangabe: das Attribut `width` nimmt
 * in HTML5 nur ganze Zahlen, ein Prozentwert darin waere ungueltig und im
 * gedruckten PDF nicht verlaesslich.
 */
export function breiteAlsAttribute(breite: string | null): { width?: string; style?: string } {
  if (!breite) return {};
  return istAnteil(breite) ? { style: `width: ${breite}` } : { width: breite };
}

/** Holt die Breite aus einem Bild zurueck, egal in welcher der beiden Formen. */
export function breiteAusAttributen(width: string | null, style: string | null): string | null {
  if (width) return leseBreite(width);

  const treffer = /(?:^|;)\s*width\s*:\s*([^;]+)/i.exec(style ?? '');
  return treffer ? leseBreite(treffer[1]) : null;
}
