/**
 * Die Ziffern auf den Flaechen.
 *
 * Jede Flaeche bekommt ihre Zahl als kleines Schild, das flach auf ihr
 * aufliegt. Eine einzige Textur ueber den ganzen Koerper waere der
 * naheliegende Weg, braeuchte aber je Geometrie eine passende Abwicklung —
 * die three.js fuer den Trapezoeder nicht mitbringt.
 *
 * Stattdessen liegen die Ziffern als Kacheln in einem Atlas, und die Schilder
 * eines Wuerfels stecken in einer Geometrie. So kostet ein Wuerfel einen
 * Zeichenaufruf fuer den Koerper und einen fuer seine Ziffern, gleich wie
 * viele Flaechen er hat.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  Vector3
} from 'three';
import type { Flaeche } from './koerper';

/**
 * Alle Ziffern eines Wuerfels in einem Bild.
 *
 * Der erste Anlauf gab jeder Flaeche ein eigenes Schild mit eigener Textur.
 * Zwanzig Wuerfel mit je zwanzig Flaechen waren dann vierhundert Objekte und
 * vierhundert Zeichenaufrufe je Bild — der Wurf kam nicht mehr zum Ende.
 *
 * Jetzt liegen die Ziffern als Kacheln in einer Textur, und die Schilder
 * eines Wuerfels stecken in einer einzigen Geometrie: ein Zeichenaufruf je
 * Wuerfel statt einer je Flaeche.
 */
export class ZiffernAtlas {
  readonly textur: CanvasTexture;
  /** Wie viele Kacheln je Zeile und Spalte. */
  private readonly raster: number;

  constructor(seiten: number, farbe: string) {
    this.raster = Math.ceil(Math.sqrt(seiten));
    const kante = this.raster * KACHEL;

    const leinwand = document.createElement('canvas');
    leinwand.width = kante;
    leinwand.height = kante;
    const stift = leinwand.getContext('2d');
    if (!stift) throw new Error('kein 2D-Kontext fuer die Ziffern');

    stift.clearRect(0, 0, kante, kante);
    stift.fillStyle = farbe;
    stift.textAlign = 'center';
    stift.textBaseline = 'middle';

    for (let ziffer = 1; ziffer <= seiten; ziffer++) {
      const feld = ziffer - 1;
      const x = (feld % this.raster) * KACHEL;
      const y = Math.floor(feld / this.raster) * KACHEL;
      stift.font = `700 ${ziffer >= 10 ? KACHEL * 0.5 : KACHEL * 0.62}px system-ui, sans-serif`;
      stift.fillText(String(ziffer), x + KACHEL / 2, y + KACHEL / 2);

      // Sechs und Neun bekommen einen Strich, sonst sind sie auf einem
      // Wuerfel nicht auseinanderzuhalten — echte Wuerfel haben ihn deshalb
      // auch.
      if (ziffer === 6 || ziffer === 9) {
        const breite = KACHEL * 0.28;
        stift.fillRect(x + (KACHEL - breite) / 2, y + KACHEL * 0.76, breite, KACHEL * 0.05);
      }
    }

    this.textur = new CanvasTexture(leinwand);
    this.textur.needsUpdate = true;
  }

  /** Die Ecken einer Kachel in Texturkoordinaten: links, unten, rechts, oben. */
  kachel(ziffer: number): [number, number, number, number] {
    const feld = ziffer - 1;
    const spalte = feld % this.raster;
    // Texturkoordinaten zaehlen von unten, das Bild von oben.
    const zeile = this.raster - 1 - Math.floor(feld / this.raster);
    const schritt = 1 / this.raster;
    return [spalte * schritt, zeile * schritt, (spalte + 1) * schritt, (zeile + 1) * schritt];
  }

  freigeben(): void {
    this.textur.dispose();
  }
}

/** Kantenlaenge einer Ziffernkachel in Bildpunkten. */
const KACHEL = 128;

/**
 * Die Ziffern eines Wuerfels als eine einzige Geometrie.
 *
 * Je Flaeche zwei Dreiecke, an ihre Mitte gesetzt und in ihre Richtung
 * gedreht. Die Drehung wird beim Bauen auf die Eckpunkte gerechnet, damit
 * hinterher nichts mehr je Flaeche zu tun ist.
 */
export function ziffernGeometrie(
  flaechen: readonly Flaeche[],
  ziffern: readonly number[],
  atlas: ZiffernAtlas,
  groesse: number
): BufferGeometry {
  const punkte: number[] = [];
  const uvs: number[] = [];
  const halb = groesse / 2;

  for (const [nummer, flaeche] of flaechen.entries()) {
    const normale = flaeche.normale.clone().normalize();
    const drehung = ausrichtung(normale);
    // Ein Hauch ueber der Flaeche, sonst streiten Ziffer und Koerper um
    // dieselbe Tiefe und die Ziffer flackert.
    const mitte = flaeche.mitte.clone().addScaledVector(normale, 0.012);

    const ecke = (x: number, y: number) =>
      new Vector3(x, y, 0).applyQuaternion(drehung).add(mitte);
    const a = ecke(-halb, -halb);
    const b = ecke(halb, -halb);
    const c = ecke(halb, halb);
    const d = ecke(-halb, halb);

    for (const p of [a, b, c, a, c, d]) punkte.push(p.x, p.y, p.z);

    const [u0, v0, u1, v1] = atlas.kachel(ziffern[nummer]);
    uvs.push(u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1);
  }

  const geometrie = new BufferGeometry();
  geometrie.setAttribute('position', new BufferAttribute(new Float32Array(punkte), 3));
  geometrie.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  return geometrie;
}

/** Das Material, mit dem die Zifferngeometrie gezeichnet wird. */
export function ziffernMaterial(atlas: ZiffernAtlas): MeshBasicMaterial {
  return new MeshBasicMaterial({
    map: atlas.textur,
    transparent: true,
    side: DoubleSide,
    // Ohne das verschwindet die Ziffer je nach Blickwinkel im Koerper.
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2
  });
}

/**
 * Die Drehung, die eine Ziffer flach auf die Flaeche legt und aufrecht stellt.
 *
 * `setFromUnitVectors` allein legt nur die Richtung fest und laesst die
 * Drehung um die eigene Achse offen — jede Ziffer kippte dann um einen
 * beliebigen Winkel. Deshalb wird die Drehung aus drei Achsen aufgebaut.
 */
export function ausrichtung(normale: Vector3): Quaternion {
  const oben = new Vector3(0, 1, 0);
  // Bei einer Flaeche, die selbst nach oben zeigt, taugt die Y-Achse nicht als
  // Bezug: das Kreuzprodukt waere null. Dann wird die Z-Achse genommen.
  const bezug = Math.abs(normale.dot(oben)) > 0.95 ? new Vector3(0, 0, 1) : oben;
  const rechts = new Vector3().crossVectors(bezug, normale).normalize();
  const hoch = new Vector3().crossVectors(normale, rechts).normalize();
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(rechts, hoch, normale));
}
