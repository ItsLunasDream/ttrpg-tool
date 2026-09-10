/**
 * Die Koerper der Wuerfel und ihre Flaechen.
 *
 * Zwei Dinge werden hier gebaut: die Geometrie zum Zeichnen und die Liste der
 * Flaechen mit ihren Normalen. Die Flaechenliste ist der eigentliche Zweck —
 * ohne sie liesse sich nach dem Wurf nicht ablesen, welche Seite oben liegt.
 *
 * d100 und der eigene Wuerfel sind Kugeln ohne Beschriftung. Fuer 37 Seiten
 * gibt es keinen Koerper, fuer 100 auch nicht, und eine Kugel sagt ehrlich,
 * dass hier nichts abgelesen wird — passend zur flachen Darstellung, wo
 * beide ein Kreis sind.
 */
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  Vector3
} from 'three';
import type { Art } from '../../shared/formen';

export interface Flaeche {
  /** Die Richtung, in die die Flaeche zeigt, im Koerpersystem. */
  readonly normale: Vector3;
  /** Die Dreiecke der Geometrie, die zu dieser Flaeche gehoeren. */
  readonly dreiecke: readonly number[];
  /** Die Mitte der Flaeche — dort sitzt spaeter die Ziffer. */
  readonly mitte: Vector3;
}

export interface Koerper {
  readonly geometrie: BufferGeometry;
  /** Leer bei den Kugeln: dort gibt es nichts abzulesen. */
  readonly flaechen: readonly Flaeche[];
  /** Die Ecken, aus denen die Physik ihre konvexe Huelle baut. */
  readonly ecken: readonly Vector3[];
  readonly istKugel: boolean;
}

/**
 * Wie aehnlich zwei Normalen sein muessen, um dieselbe Flaeche zu sein.
 *
 * 0.99 entspricht etwa acht Grad. Der Wert ist nicht beliebig: die drei
 * Dreiecke einer Fuenfeckflaeche des Dodekaeders haben minimal verschiedene
 * Normalen, und ein Vergleich auf drei Nachkommastellen machte daraus
 * siebzehn Flaechen statt zwoelf.
 */
const GLEICHE_RICHTUNG = 0.99;

/**
 * Die Dreiecke einer Geometrie zu Flaechen buendeln.
 *
 * Indizierte Geometrien werden zuerst aufgeloest. Ohne das zaehlt man
 * Eckpunkte statt Dreiecke: die BoxGeometry hat 24 Eckpunkte und 12
 * Dreiecke, und die Rechnung ergab sechs Flaechen aus acht Dreiecken.
 */
export function flaechenVon(geometrie: BufferGeometry): Flaeche[] {
  const flach = geometrie.index ? geometrie.toNonIndexed() : geometrie;
  const punkte = flach.getAttribute('position');
  const anzahl = punkte.count / 3;

  const gruppen: { normale: Vector3; dreiecke: number[]; punkte: Vector3[] }[] = [];
  for (let dreieck = 0; dreieck < anzahl; dreieck++) {
    const a = new Vector3().fromBufferAttribute(punkte, dreieck * 3);
    const b = new Vector3().fromBufferAttribute(punkte, dreieck * 3 + 1);
    const c = new Vector3().fromBufferAttribute(punkte, dreieck * 3 + 2);
    const normale = new Vector3()
      .subVectors(b, a)
      .cross(new Vector3().subVectors(c, a))
      .normalize();

    const treffer = gruppen.find((gruppe) => gruppe.normale.dot(normale) > GLEICHE_RICHTUNG);
    if (treffer) {
      treffer.dreiecke.push(dreieck);
      treffer.punkte.push(a, b, c);
    } else {
      gruppen.push({ normale, dreiecke: [dreieck], punkte: [a, b, c] });
    }
  }

  return gruppen.map((gruppe) => ({
    normale: gruppe.normale,
    dreiecke: gruppe.dreiecke,
    mitte: gruppe.punkte
      .reduce((summe, punkt) => summe.add(punkt), new Vector3())
      .divideScalar(gruppe.punkte.length)
  }));
}

/**
 * Der pentagonale Trapezoeder — der d10.
 *
 * Zehn Drachenflaechen, zwei Spitzen, dazwischen ein Zickzack aus zehn
 * Ecken. Three.js bringt ihn nicht mit, also wird er aus Punkten gebaut:
 * zwei Ringe zu fuenf Ecken, gegeneinander versetzt, und je eine Spitze oben
 * und unten.
 *
 * Jede Flaeche ist ein Viereck aus zwei Dreiecken. Die Reihenfolge der
 * Eckpunkte muss gegen den Uhrzeigersinn laufen, von aussen gesehen — sonst
 * zeigt die Normale nach innen und der Koerper waere von aussen unsichtbar.
 */
export function trapezoeder(): { geometrie: BufferGeometry; ecken: Vector3[] } {
  const RADIUS = 1;
  /**
   * Wie weit die beiden Ringe von der Mitte nach oben und unten stehen.
   *
   * Der Wert bestimmt ueber die Formel unten zugleich die Hoehe der Spitzen,
   * beide haengen fest zusammen. 0.1056 ergibt einen Koerper, der so hoch ist
   * wie breit — wie ein echter d10. Mit 0.14 stand er zu spitz da und sah aus
   * wie eine Doppelpyramide.
   */
  const RING = 0.1056;
  /**
   * Die Hoehe der Spitzen — berechnet, nicht gewaehlt.
   *
   * Eine Drachenflaeche besteht aus vier Punkten, und vier Punkte liegen nur
   * dann in einer Ebene, wenn die Masse zusammenpassen. Im ersten Versuch
   * waren sie frei geraten, die Flaechen dadurch leicht gewoelbt, und beim
   * Buendeln der Dreiecke kamen fuenf Flaechen heraus statt zehn: je zwei
   * Haelften eines Drachens galten als zwei verschiedene Richtungen, und
   * benachbarte verschmolzen.
   *
   * Setzt man die Bedingung an, dass Spitze, zwei Ringpunkte oben und einer
   * unten koplanar sind, ergibt sich das Verhaeltnis 5 + 2·sqrt(5) zur
   * Ringhoehe — unabhaengig vom Radius. Numerisch geprueft: 9.4721.
   */
  const SPITZE = RING * (5 + 2 * Math.sqrt(5));

  const oben = new Vector3(0, SPITZE, 0);
  const unten = new Vector3(0, -SPITZE, 0);
  const ringOben: Vector3[] = [];
  const ringUnten: Vector3[] = [];
  for (let i = 0; i < 5; i++) {
    const winkel = (i / 5) * Math.PI * 2;
    ringOben.push(new Vector3(Math.cos(winkel) * RADIUS, RING, Math.sin(winkel) * RADIUS));
    const versetzt = winkel + Math.PI / 5;
    ringUnten.push(new Vector3(Math.cos(versetzt) * RADIUS, -RING, Math.sin(versetzt) * RADIUS));
  }

  const punkte: number[] = [];
  const dreieck = (a: Vector3, b: Vector3, c: Vector3) => {
    punkte.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };

  for (let i = 0; i < 5; i++) {
    const naechster = (i + 1) % 5;
    // Obere Drachenflaeche: Spitze, Ringpunkt oben, Ringpunkt unten dazwischen,
    // naechster Ringpunkt oben. Gegen den Uhrzeigersinn von aussen gesehen,
    // sonst zeigt die Normale nach innen.
    dreieck(oben, ringUnten[i], ringOben[i]);
    dreieck(oben, ringOben[naechster], ringUnten[i]);
    // Untere Drachenflaeche, um eine halbe Teilung versetzt. Die Umlaufrichtung
    // ist gegenueber der oberen gespiegelt: mit derselben zeigten die Normalen
    // der unteren Flaechen nach oben, sie fielen mit den oberen zusammen, und
    // aus zehn Flaechen wurden fuenf.
    dreieck(unten, ringUnten[i], ringOben[naechster]);
    dreieck(unten, ringOben[naechster], ringUnten[naechster]);
  }

  const geometrie = new BufferGeometry();
  geometrie.setAttribute('position', new BufferAttribute(new Float32Array(punkte), 3));
  geometrie.computeVertexNormals();
  return { geometrie, ecken: [oben, unten, ...ringOben, ...ringUnten] };
}

/** Die Ecken einer Geometrie, ohne Dopplungen — Grundlage der Physikhuelle. */
export function eckenVon(geometrie: BufferGeometry): Vector3[] {
  const flach = geometrie.index ? geometrie.toNonIndexed() : geometrie;
  const punkte = flach.getAttribute('position');
  const ecken: Vector3[] = [];
  for (let i = 0; i < punkte.count; i++) {
    const punkt = new Vector3().fromBufferAttribute(punkte, i);
    if (!ecken.some((vorhanden) => vorhanden.distanceTo(punkt) < 0.0001)) ecken.push(punkt);
  }
  return ecken;
}

/**
 * Fuer jede Flaeche die gegenueberliegende, oder -1.
 *
 * Gegenueber heisst: die Normale zeigt genau in die andere Richtung. Beim
 * Tetraeder gibt es das nicht, dort steht ueberall -1 — und genau deshalb
 * kann der d4 die Regel der Wuerfelbeschriftung nicht erfuellen.
 */
export function gegenueberliegende(flaechen: readonly Flaeche[]): number[] {
  return flaechen.map((flaeche) => {
    const gesucht = flaeche.normale.clone().negate();
    return flaechen.findIndex((andere) => andere.normale.dot(gesucht) > GLEICHE_RICHTUNG);
  });
}

export function baueKoerper(art: Art): Koerper {
  if (art === 'd100' || art === 'custom') {
    const geometrie = new SphereGeometry(0.9, 24, 16);
    return { geometrie, flaechen: [], ecken: [], istKugel: true };
  }

  if (art === 'd10') {
    const { geometrie, ecken } = trapezoeder();
    return { geometrie, flaechen: flaechenVon(geometrie), ecken, istKugel: false };
  }

  const geometrie =
    art === 'd4'
      ? new TetrahedronGeometry(1.1)
      : art === 'd6'
        ? new BoxGeometry(1.3, 1.3, 1.3)
        : art === 'd8'
          ? new OctahedronGeometry(1.1)
          : art === 'd12'
            ? new DodecahedronGeometry(1.05)
            : new IcosahedronGeometry(1);

  return {
    geometrie,
    flaechen: flaechenVon(geometrie),
    ecken: eckenVon(geometrie),
    istKugel: false
  };
}
