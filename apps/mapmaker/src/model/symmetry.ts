/**
 * Symmetrie und Kacheln beim Setzen.
 *
 * Zwei verwandte Wünsche, dieselbe Maschine: was gesetzt wird, soll zugleich
 * gespiegelt erscheinen — für einen symmetrischen Tempel, eine Achse durch eine
 * Halle — oder über den Kartenrand hinaus fortgesetzt, damit die Karte sich
 * nahtlos kachelt.
 *
 * **Warum eine Funktion und kein Werkzeugmodus.** Gespiegelt werden soll bei
 * jedem Werkzeug, das Objekte anlegt: Props, Pinsel, Zeichnung, Baustein. Jedes
 * davon einzeln umzubauen hieße, dieselbe Überlegung viermal zu schreiben — und
 * beim fünften Werkzeug wäre sie vergessen. Hier entstehen aus einem Objekt die
 * Kopien, und die Werkzeuge hängen sie an denselben Befehl. Damit bleibt es
 * *ein* Rückgängig-Schritt, was es für den Benutzer auch ist.
 *
 * Gespiegelte Objekte sind ganz gewöhnliche Objekte. Sie bleiben nicht mit dem
 * Original verbunden: eine lebende Verknüpfung wäre eine zweite Hierarchie
 * neben Gruppen und Ebenen, und wer die Spiegelung nachträglich lösen will,
 * hätte am Ende doch einzelne Objekte.
 */

import { makeId } from './ids';
import { mapPixelSize } from './grid';
import type { MapDocument, MapObject } from './types';

export interface SymmetrySettings {
  /** An einer senkrechten Achse spiegeln — links/rechts. */
  vertical: boolean;
  /** An einer waagerechten Achse spiegeln — oben/unten. */
  horizontal: boolean;
  /**
   * Lage der Achsen in Weltpixeln; `null` heißt Kartenmitte.
   *
   * Die Mitte ist fast immer gemeint, und sie verschiebt sich mit, wenn die
   * Karte wächst. Eine feste Zahl gäbe es nur, wenn jemand sie ausdrücklich
   * setzt.
   */
  axisX: number | null;
  axisY: number | null;
  /** Über den Kartenrand hinaus fortsetzen, damit die Karte kachelt. */
  tile: boolean;
}

export function defaultSymmetry(): SymmetrySettings {
  return { vertical: false, horizontal: false, axisX: null, axisY: null, tile: false };
}

export const symmetryActive = (s: SymmetrySettings): boolean =>
  s.vertical || s.horizontal || s.tile;

/** Die geltenden Achsen; ohne eigene Angabe die Kartenmitte. */
export function axesOf(doc: MapDocument, s: SymmetrySettings): { x: number; y: number } {
  const size = mapPixelSize(doc.grid, doc.size);
  return {
    x: s.axisX ?? size.width / 2,
    y: s.axisY ?? size.height / 2,
  };
}

/**
 * Ein Objekt an einer Achse spiegeln.
 *
 * Die Drehung muss mitgespiegelt werden, sonst zeigt ein gespiegelter Karren in
 * dieselbe Richtung wie das Original und die Symmetrie ist nur halb da. An
 * einer Senkrechten wird aus dem Winkel π − w, an einer Waagerechten −w.
 *
 * Text wird *nicht* umgedreht: Spiegelschrift ist keine Beschriftung. Er
 * wandert nur an seinen Platz.
 */
function spiegle(obj: MapObject, achse: 'x' | 'y', wert: number): MapObject {
  const kopie = structuredClone(obj) as MapObject;
  kopie.id = makeId(obj.kind);

  if (achse === 'x') {
    kopie.x = 2 * wert - obj.x;
    if (obj.kind !== 'text') kopie.rotation = Math.PI - obj.rotation;
  } else {
    kopie.y = 2 * wert - obj.y;
    if (obj.kind !== 'text') kopie.rotation = -obj.rotation;
  }

  if (kopie.kind === 'prop') {
    // Das Bild selbst umdrehen; ohne das wäre eine Tür rechts herum eine Tür
    // links herum mit falschem Anschlag.
    if (achse === 'x') kopie.flipX = !kopie.flipX;
    else kopie.flipY = !kopie.flipY;
  }

  if (kopie.kind === 'shape') {
    // Die Punkte liegen lokal zum Ankerpunkt — gespiegelt wird um die eigene
    // Null, die Verschiebung steckt schon in x/y.
    const pts = [...kopie.points];
    for (let i = 0; i < pts.length; i += 2) {
      if (achse === 'x') pts[i] = -pts[i];
      else pts[i + 1] = -pts[i + 1];
    }
    kopie.points = pts;
  }

  return kopie;
}

/** Ein Objekt um einen Betrag verschieben. */
function verschiebe(obj: MapObject, dx: number, dy: number): MapObject {
  const kopie = structuredClone(obj) as MapObject;
  kopie.id = makeId(obj.kind);
  kopie.x += dx;
  kopie.y += dy;
  return kopie;
}

/**
 * Die Kopien zu einem gesetzten Objekt — ohne das Original.
 *
 * Bei beiden Achsen entstehen drei: die beiden Spiegelungen und die Spiegelung
 * der Spiegelung. Ohne die vierte Ecke wäre eine vierfache Symmetrie an einer
 * Stelle offen, und genau das fällt auf.
 *
 * Das Kacheln arbeitet auf allem, was danach dasteht: eine Kopie am linken Rand
 * gehört ebenso auf die andere Seite wie das Original. Verschoben wird nur, was
 * nah genug am Rand liegt — sonst läge die Kopie weit außerhalb der Karte und
 * wäre nur Ballast in der Datei.
 */
export function symmetryCopies(
  doc: MapDocument,
  objects: MapObject[],
  s: SymmetrySettings,
): MapObject[] {
  if (!symmetryActive(s) || objects.length === 0) return [];
  const achsen = axesOf(doc, s);
  const out: MapObject[] = [];

  for (const obj of objects) {
    const gespiegelt: MapObject[] = [];
    if (s.vertical) gespiegelt.push(spiegle(obj, 'x', achsen.x));
    if (s.horizontal) gespiegelt.push(spiegle(obj, 'y', achsen.y));
    if (s.vertical && s.horizontal) {
      gespiegelt.push(spiegle(spiegle(obj, 'x', achsen.x), 'y', achsen.y));
    }
    out.push(...gespiegelt);
  }

  if (s.tile) {
    const size = mapPixelSize(doc.grid, doc.size);
    // Ein Feld Spielraum: was einen Fingerbreit vom Rand entfernt liegt, gehört
    // auch auf die andere Seite — ein Prop ragt über seinen Ankerpunkt hinaus.
    const rand = doc.grid.tileSize;
    for (const obj of [...objects, ...out]) {
      const dx = obj.x < rand ? size.width : obj.x > size.width - rand ? -size.width : 0;
      const dy = obj.y < rand ? size.height : obj.y > size.height - rand ? -size.height : 0;
      if (dx !== 0) out.push(verschiebe(obj, dx, 0));
      if (dy !== 0) out.push(verschiebe(obj, 0, dy));
      if (dx !== 0 && dy !== 0) out.push(verschiebe(obj, dx, dy));
    }
  }

  return out;
}
