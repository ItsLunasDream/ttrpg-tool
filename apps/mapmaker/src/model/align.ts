/**
 * Objekte ausrichten und verteilen.
 *
 * Rechnet mit Hüllen, nicht mit Ankerpunkten: bei einer Zeichnung liegt der
 * Ursprung dort, wo der Strich begann, und zwei Formen an ihren Ursprüngen
 * auszurichten ergäbe sichtbaren Versatz. Zurück kommt je Objekt ein
 * Verschiebe-Delta, das der Aufrufer auf x/y addiert.
 */

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type AlignMode =
  | 'left'
  | 'centerX'
  | 'right'
  | 'top'
  | 'centerY'
  | 'bottom';

export type DistributeMode = 'horizontal' | 'vertical';

export interface Item {
  id: string;
  bounds: Bounds;
}

export type Deltas = Map<string, { dx: number; dy: number }>;

/**
 * Ausrichten an der gemeinsamen Hülle.
 *
 * Bezug ist die Hülle aller Objekte, nicht das zuerst gewählte: welches das
 * war, sieht man der Auswahl nicht an, und das Ergebnis wäre nicht vorhersagbar.
 */
export function align(items: Item[], mode: AlignMode): Deltas {
  const out: Deltas = new Map();
  if (items.length < 2) return out;

  const minX = Math.min(...items.map((i) => i.bounds.minX));
  const maxX = Math.max(...items.map((i) => i.bounds.maxX));
  const minY = Math.min(...items.map((i) => i.bounds.minY));
  const maxY = Math.max(...items.map((i) => i.bounds.maxY));
  const mitteX = (minX + maxX) / 2;
  const mitteY = (minY + maxY) / 2;

  for (const item of items) {
    const b = item.bounds;
    let dx = 0;
    let dy = 0;
    switch (mode) {
      case 'left':
        dx = minX - b.minX;
        break;
      case 'right':
        dx = maxX - b.maxX;
        break;
      case 'centerX':
        dx = mitteX - (b.minX + b.maxX) / 2;
        break;
      case 'top':
        dy = minY - b.minY;
        break;
      case 'bottom':
        dy = maxY - b.maxY;
        break;
      case 'centerY':
        dy = mitteY - (b.minY + b.maxY) / 2;
        break;
    }
    if (dx !== 0 || dy !== 0) out.set(item.id, { dx, dy });
  }
  return out;
}

/**
 * Gleiche Abstände zwischen den Mittelpunkten.
 *
 * Die beiden äußeren Objekte bleiben stehen — sie spannen die Strecke auf.
 * Verteilt wird nach Mittelpunkten und nicht nach Lücken: bei unterschiedlich
 * großen Objekten wirkt das ruhiger, und es ist das, was Zeichenprogramme
 * unter „verteilen" verstehen.
 */
export function distribute(items: Item[], mode: DistributeMode): Deltas {
  const out: Deltas = new Map();
  // Unter drei Objekten gibt es nichts zu verteilen: die äußeren bleiben stehen.
  if (items.length < 3) return out;

  const waagerecht = mode === 'horizontal';
  const mitte = (b: Bounds) => (waagerecht ? (b.minX + b.maxX) / 2 : (b.minY + b.maxY) / 2);

  const sortiert = [...items].sort((a, b) => mitte(a.bounds) - mitte(b.bounds));
  const erste = mitte(sortiert[0].bounds);
  const letzte = mitte(sortiert[sortiert.length - 1].bounds);
  const schritt = (letzte - erste) / (sortiert.length - 1);

  for (let i = 1; i < sortiert.length - 1; i++) {
    const ziel = erste + schritt * i;
    const delta = ziel - mitte(sortiert[i].bounds);
    if (delta === 0) continue;
    out.set(sortiert[i].id, waagerecht ? { dx: delta, dy: 0 } : { dx: 0, dy: delta });
  }
  return out;
}
