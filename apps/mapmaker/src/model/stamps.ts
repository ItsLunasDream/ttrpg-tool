/**
 * Bausteine: eine Anordnung mehrerer Objekte, einmal zusammengestellt und
 * danach als ein Stück setzbar — eine Sitzecke, ein Altarraum, ein Marktstand.
 *
 * Der Baustein hält *vollständige* Objekte, nicht nur Verweise: Farbe, Drehung,
 * Skalierung und der Seed einer prozeduralen Variante gehören zur Anordnung
 * dazu. Ein Marktstand, dessen Fässer beim nächsten Setzen anders aussehen,
 * wäre nicht derselbe Baustein.
 *
 * `id` und `layerId` der gespeicherten Objekte sind bedeutungslos — beim Setzen
 * werden sie neu vergeben. Die Koordinaten liegen relativ zum Ankerpunkt, der
 * Mitte der Hülle: gesetzt wird unter dem Zeiger, und das soll die Mitte der
 * Anordnung sein, nicht das erste zufällig ausgewählte Objekt.
 *
 * Bausteine gehören zum Benutzer, nicht zur Karte. Eine gesetzte Sitzecke ist
 * danach ein Haufen gewöhnlicher Objekte und hängt an nichts mehr; das
 * Dokument braucht den Baustein also nie wieder. Gespeichert wird er darum
 * neben der Karte (`assets/stampStore.ts`), nicht in ihr.
 */

import { makeId } from './ids';
import { scalePatch } from './scaleObject';
import type { MapObject } from './types';

export interface Stamp {
  id: string;
  name: string;
  /** Objekte relativ zum Ankerpunkt, aufsteigend nach z. */
  objects: MapObject[];
  /**
   * Tile-Größe der Karte, aus der der Baustein stammt.
   *
   * Gebraucht, weil Weltpixel für sich nichts aussagen: dieselben 300 px sind
   * auf einer 100er-Karte drei Felder und auf einer 70er gut vier. Beim Setzen
   * auf eine anders gerasterte Karte wird darüber umgerechnet.
   */
  tileSize: number;
  /** Grobe Hüllmaße in Weltpixeln der Ursprungskarte, für die Anzeige. */
  width: number;
  height: number;
}

export interface StampBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Grobe Hülle einer Anordnung.
 *
 * Props zählen als ihr Ankerpunkt: ihre wahre Größe steht in der
 * Prop-Bibliothek, und die gehört nicht ins Modell. Für den Ankerpunkt genügt
 * das — er soll in der Mitte der *Anordnung* liegen, nicht in der Mitte der
 * äußersten Pixel.
 */
export function stampBounds(objects: MapObject[]): StampBounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const merke = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  for (const obj of objects) {
    merke(obj.x, obj.y);
    if (obj.kind !== 'shape') continue;
    // Die Punkte liegen relativ zum Anker und drehen sich mit dem Objekt.
    const cos = Math.cos(obj.rotation);
    const sin = Math.sin(obj.rotation);
    for (let i = 0; i < obj.points.length; i += 2) {
      const px = obj.points[i];
      const py = obj.points[i + 1];
      merke(obj.x + px * cos - py * sin, obj.y + px * sin + py * cos);
    }
  }

  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

/**
 * Baustein aus einer Auswahl.
 *
 * Die Objekte werden geklont und auf den Ankerpunkt bezogen; das Original
 * bleibt unberührt. Die z-Reihenfolge wird beibehalten, aber neu von 0 an
 * durchgezählt: welche Zahlen die Karte gerade vergeben hat, ist für den
 * Baustein ohne Belang — nur, was über was liegt.
 */
export function createStamp(name: string, objects: MapObject[], tileSize: number): Stamp {
  const sortiert = [...objects].sort((a, b) => a.z - b.z);
  const box = stampBounds(sortiert);
  const cx = box ? (box.minX + box.maxX) / 2 : 0;
  const cy = box ? (box.minY + box.maxY) / 2 : 0;

  return {
    id: makeId('stamp'),
    name,
    objects: sortiert.map((obj, i) => ({
      ...structuredClone(obj),
      x: obj.x - cx,
      y: obj.y - cy,
      z: i,
    })),
    tileSize,
    width: box ? box.maxX - box.minX : 0,
    height: box ? box.maxY - box.minY : 0,
  };
}

export interface PlaceOptions {
  /** Zielpunkt in Weltkoordinaten — dort liegt die Mitte der Anordnung. */
  x: number;
  y: number;
  layerId: string;
  /** Tile-Größe der Zielkarte. */
  tileSize: number;
  /** z des untersten Objekts; die übrigen zählen von dort aufwärts. */
  z: number;
  /** Drehung der ganzen Anordnung im Bogenmaß. */
  rotation?: number;
}

/**
 * Setzt einen Baustein: fertige Objekte mit frischen Kennungen.
 *
 * Rein — der Baustein selbst wird nicht angefasst und lässt sich beliebig oft
 * setzen.
 *
 * **Props werden beim Rastermaßstab bewusst ausgelassen.** Sie werden schon
 * beim Zeichnen mit der Tile-Größe skaliert (`tileScale`); sie hier noch einmal
 * zu strecken machte sie doppelt so groß wie gewollt. Zeichnungen und Text
 * dagegen stehen in Weltpixeln und müssen mitwachsen, sonst zerfällt die
 * Anordnung auf einer anders gerasterten Karte.
 */
export function instantiateStamp(stamp: Stamp, opts: PlaceOptions): MapObject[] {
  const k = stamp.tileSize > 0 ? opts.tileSize / stamp.tileSize : 1;
  const winkel = opts.rotation ?? 0;
  const cos = Math.cos(winkel);
  const sin = Math.sin(winkel);

  return stamp.objects.map((obj, i) => {
    const kopie = structuredClone(obj) as MapObject;
    // Erst der Rastermaßstab, dann die Drehung um die Mitte.
    const x = obj.x * k;
    const y = obj.y * k;

    const patch = k !== 1 && kopie.kind !== 'prop' ? scalePatch(kopie, k, k) : null;

    return {
      ...kopie,
      ...(patch ?? {}),
      id: makeId('obj'),
      layerId: opts.layerId,
      x: opts.x + x * cos - y * sin,
      y: opts.y + x * sin + y * cos,
      rotation: obj.rotation + winkel,
      z: opts.z + i,
      // Eine Gruppe des Bausteins wäre eine Vermutung: wer eine Sitzecke setzt,
      // will die Stühle danach oft einzeln rücken. Zusammenfassen kann man sie
      // mit dem Auswahl-Werkzeug jederzeit.
      groupId: null,
    } as MapObject;
  });
}
