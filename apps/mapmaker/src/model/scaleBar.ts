/**
 * Maßstabsleiste, die mitrechnet.
 *
 * Es gibt eine gezeichnete Leiste als Kartensignatur — die ist Dekoration: vier
 * Felder ohne Zahlen. Was auf einer Weltkarte fehlt, ist die Leiste, die sagt,
 * *wie weit* diese vier Felder sind. Die Angabe steckt längst im Raster
 * (`grid.distance.perTile`); hier wird sie zu einer Leiste mit Beschriftung.
 *
 * Herauskommen gewöhnliche Objekte, wie bei der Legende: Rechtecke und Texte,
 * gruppiert. Kein eigener Objekttyp und keine Sonderbehandlung im Renderer —
 * die Leiste lässt sich danach verschieben, umfärben und löschen wie alles
 * andere. Und wie die Legende wird sie *erzeugt* und nicht laufend nachgeführt:
 * wer die Zahlen von Hand ändert, soll sie nicht beim nächsten Rasterwechsel
 * verlieren.
 */

import { nextZ } from './document';
import { gridDistance } from './grid';
import { makeId } from './ids';
import type { MapDocument, MapObject } from './types';

/**
 * Rundet auf eine Zahl, die auf einer Karte steht.
 *
 * „47,3 km" ist kein Maßstab, „50 km" ist einer. Gewählt wird aus der Reihe
 * 1–2–5 mal Zehnerpotenz — dieselbe, nach der Lineale und Achsenbeschriftungen
 * eingeteilt sind, weil sich nur durch solche Zahlen im Kopf teilen lässt.
 *
 * Gerundet wird zur *nächsten* dieser Zahlen, nicht abwärts. Abwärts wäre die
 * Leiste nie breiter als gewünscht, dafür manchmal halb so breit: aus 47,3
 * würde 20, und zwei Drittel der Leiste blieben leer. Die Wunschbreite ist ein
 * Wunsch, die runde Zahl ist der Zweck.
 */
export function niceDistance(roh: number): number {
  if (!(roh > 0) || !Number.isFinite(roh)) return 0;
  const potenz = Math.pow(10, Math.floor(Math.log10(roh)));
  const rest = roh / potenz;
  const stufe = rest < 1.5 ? 1 : rest < 3 ? 2 : rest < 7 ? 5 : 10;
  return stufe * potenz;
}

export interface ScaleBarOptions {
  layerId: string;
  /** Linke obere Ecke der Leiste in Weltkoordinaten. */
  x: number;
  y: number;
  /**
   * Wunschbreite in Weltpixeln.
   *
   * Nur ein Wunsch: die tatsächliche Breite ergibt sich aus der gerundeten
   * Distanz. Eine Leiste, die exakt die Wunschbreite hätte, trüge dafür eine
   * krumme Zahl — und die Zahl ist der Zweck der Leiste.
   */
  targetWidth: number;
  /** Höhe des Balkens; die Beschriftung richtet sich danach. */
  height: number;
  color: number;
  backgroundColor: number;
  fontFamily: string;
}

export interface ScaleBar {
  objects: MapObject[];
  groupId: string;
  /** Gerundete Distanz, die die Leiste zeigt. */
  distance: number;
  /** Tatsächliche Breite in Weltpixeln. */
  width: number;
}

/**
 * Baut die Leiste für die Karte.
 *
 * Vier Abschnitte, abwechselnd gefüllt, mit Beschriftung an Anfang, Mitte und
 * Ende. Vier und nicht zehn: mehr Abschnitte machen die Leiste nicht genauer,
 * nur unruhiger — abgelesen wird ohnehin an den beschrifteten Stellen.
 */
export function buildScaleBar(doc: MapDocument, opts: ScaleBarOptions): ScaleBar {
  const d = gridDistance(doc.grid);
  const felder = 4;

  // Von der Wunschbreite zur runden Zahl und zurück.
  const wunschDistanz = (opts.targetWidth / doc.grid.tileSize) * d.perTile;
  const distanz = niceDistance(wunschDistanz);
  const breite = distanz > 0 ? (distanz / d.perTile) * doc.grid.tileSize : opts.targetWidth;

  const groupId = makeId('grp');
  const objects: MapObject[] = [];
  let z = nextZ(doc, opts.layerId);
  const h = opts.height;

  for (let i = 0; i < felder; i++) {
    objects.push({
      id: makeId('obj'),
      kind: 'shape',
      layerId: opts.layerId,
      shape: 'rect',
      x: opts.x + (i * breite) / felder,
      y: opts.y,
      rotation: 0,
      opacity: 1,
      z: z++,
      locked: false,
      points: [0, 0, breite / felder, h],
      closed: true,
      blend: 'normal',
      stroke: { color: opts.color, width: Math.max(1, h * 0.12), alpha: 1, dash: [] },
      // Abwechselnd gefüllt: so lässt sich auch zwischen den Beschriftungen
      // abzählen, ohne nachzumessen.
      fill: {
        color: i % 2 === 0 ? opts.color : opts.backgroundColor,
        alpha: 1,
        gradient: null,
        pattern: null,
      },
      groupId,
    });
  }

  const beschriftung = (wert: number, anteil: number): MapObject => ({
    id: makeId('obj'),
    kind: 'text',
    layerId: opts.layerId,
    x: opts.x + breite * anteil,
    // Über den Balken: unter ihm säße die Schrift bei einer Leiste am
    // Kartenrand schnell außerhalb.
    y: opts.y - h * 1.1,
    rotation: 0,
    opacity: 1,
    z: z++,
    locked: false,
    text: wert === distanz ? `${zahl(wert)} ${d.unit}` : zahl(wert),
    fontFamily: opts.fontFamily,
    fontSize: h * 1.4,
    bold: false,
    italic: false,
    color: opts.color,
    align: 'center',
    letterSpacing: 0,
    lineHeight: 1.2,
    strokeColor: null,
    strokeWidth: 0,
    groupId,
  });

  // Anfang, Mitte, Ende. Die Einheit steht nur am Ende — dreimal „km" ist
  // dreimal dieselbe Auskunft.
  objects.push(beschriftung(0, 0), beschriftung(distanz / 2, 0.5), beschriftung(distanz, 1));

  return { objects, groupId, distance: distanz, width: breite };
}

/** Zahl ohne unnötige Nachkommastellen: „2,5" bleibt, „50,0" wird „50". */
function zahl(wert: number): string {
  const gerundet = Math.round(wert * 100) / 100;
  return Number.isInteger(gerundet) ? String(gerundet) : String(gerundet).replace('.', ',');
}
