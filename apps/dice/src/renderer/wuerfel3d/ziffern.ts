/**
 * Die Ziffern auf den Flaechen.
 *
 * Jede Flaeche bekommt ihre Zahl als kleines Schild, das flach auf ihr
 * aufliegt. Der naheliegende Weg waere eine einzige Textur ueber den ganzen
 * Koerper, aber dafuer braeuchte jede Geometrie eine passende Abwicklung —
 * die three.js fuer den Trapezoeder nicht mitbringt und die von Hand zu legen
 * viel Arbeit fuer wenig Gewinn waere.
 *
 * Stattdessen: je Flaeche eine kleine Ebene, an ihre Mitte gesetzt und in
 * ihre Richtung gedreht, mit der Ziffer als Textur. Das kostet ein Objekt je
 * Flaeche, also bis zu zwanzig je Wuerfel, aber sie hängen als Kinder am
 * Koerper und bewegen sich ohne eigene Rechnung mit.
 */
import {
  CanvasTexture,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3
} from 'three';
import type { Flaeche } from './koerper';

/** Kantenlaenge der Ziffernbilder. Genug fuer scharfe Kanten bei 72 Punkten. */
const BILD = 128;

/**
 * Ein Ziffernbild.
 *
 * Die 6 und die 9 bekommen einen Strich darunter — auf einem Wuerfel sind sie
 * sonst nicht auseinanderzuhalten, und genau dafuer haben echte Wuerfel ihn
 * auch.
 */
export function zifferTextur(ziffer: number, farbe: string): CanvasTexture {
  const leinwand = document.createElement('canvas');
  leinwand.width = BILD;
  leinwand.height = BILD;
  const stift = leinwand.getContext('2d');
  if (!stift) throw new Error('kein 2D-Kontext fuer die Ziffer');

  stift.clearRect(0, 0, BILD, BILD);
  stift.fillStyle = farbe;
  stift.textAlign = 'center';
  stift.textBaseline = 'middle';
  stift.font = `700 ${ziffer >= 10 ? 62 : 76}px system-ui, sans-serif`;
  stift.fillText(String(ziffer), BILD / 2, BILD / 2);

  if (ziffer === 6 || ziffer === 9) {
    const breite = 34;
    stift.fillRect((BILD - breite) / 2, BILD / 2 + 34, breite, 6);
  }

  const textur = new CanvasTexture(leinwand);
  textur.needsUpdate = true;
  return textur;
}

/**
 * Die Schilder fuer alle Flaechen eines Koerpers.
 *
 * `ziffern[i]` gehoert zu `flaechen[i]`. Die Zuordnung kommt von aussen, weil
 * sie sich nach dem Wurf aendert: die Flaeche, die oben liegt, bekommt die
 * gewuerfelte Zahl.
 */
export function ziffernSchilder(
  flaechen: readonly Flaeche[],
  ziffern: readonly number[],
  farbe: string,
  groesse: number
): Group {
  const gruppe = new Group();
  const form = new PlaneGeometry(groesse, groesse);

  for (const [nummer, flaeche] of flaechen.entries()) {
    const stoff = new MeshBasicMaterial({
      map: zifferTextur(ziffern[nummer], farbe),
      transparent: true,
      side: DoubleSide,
      // Ohne das verschwindet die Ziffer je nach Blickwinkel im Koerper.
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2
    });
    const schild = new Mesh(form, stoff);

    // Die Ebene zeigt von Haus aus nach +z; sie wird in die Richtung der
    // Flaeche gedreht und dabei aufrecht gestellt.
    schild.quaternion.copy(ausrichtung(flaeche.normale.clone().normalize()));
    // Ein Hauch ueber der Flaeche, sonst streiten Ziffer und Koerper um
    // dieselbe Tiefe und die Ziffer flackert.
    schild.position.copy(flaeche.mitte).addScaledVector(flaeche.normale, 0.012);
    gruppe.add(schild);
  }

  return gruppe;
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
