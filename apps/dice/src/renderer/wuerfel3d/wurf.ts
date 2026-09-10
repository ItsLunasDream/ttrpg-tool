/**
 * Der Wurf: Wuerfel fallen, kommen zur Ruhe, und oben liegt das Ergebnis.
 *
 * Das Ergebnis kommt weiterhin aus `wuerfle()` — der reinen Funktion mit
 * eigenem Zufallsgeber, gegen die die Modultests laufen. Die Physik
 * entscheiden zu lassen, was gewuerfelt wurde, machte die Verteilung von der
 * Simulation abhaengig, und ob die fair ist, weiss niemand.
 *
 * Der Weg stattdessen:
 *   1. Die Zahlen stehen fest.
 *   2. Die Physik laeuft vorwaerts, bis alles liegt.
 *   3. Fuer jeden Wuerfel wird abgelesen, welche Flaeche oben liegt.
 *   4. Die Beschriftung wird so umnummeriert, dass dort die gewuerfelte Zahl
 *      steht.
 *
 * Schritt 4 ist der Kniff: nicht der Koerper wird gedreht, sondern die
 * Zuordnung der Ziffern. Sichtbar ist das nicht, solange die Umnummerierung
 * die Regel der gegenueberliegenden Flaechen einhaelt — und genau das prueft
 * `pruefeBeschriftung`.
 *
 * Simuliert wird im Voraus, nicht im Bildtakt: die Endlagen stehen fest,
 * bevor das erste Bild gezeichnet wird. Dann stimmt der Wurf auch dann, wenn
 * die Darstellung ruckelt.
 */
import { Quaternion, Vector3 } from 'three';
import {
  Body,
  ConvexPolyhedron,
  ContactMaterial,
  Material,
  Plane,
  Sphere,
  Vec3,
  World
} from 'cannon-es';
import type { Art } from '../../shared/formen';
import { SEITEN } from '../../shared/formen';
import { ordneZiffernZu, pruefeBeschriftung } from '../../shared/beschriftung';
import { baueKoerper, gegenueberliegende, type Koerper } from './koerper';

/** Wie gross ein Schritt der Simulation ist. */
export const SCHRITT = 1 / 60;
/** Ab wann ein Koerper als liegend gilt. */
const RUHE = 0.05;
/**
 * Wie lange hoechstens simuliert wird.
 *
 * 600 Schritte sind zehn simulierte Sekunden. Gemessen liegen ein Wuerfel
 * nach 120 Schritten, zwanzig nach 191 und hundert nach 384; die Grenze
 * faengt also den Fall ab, dass etwas klemmt — und sie deckelt zugleich die
 * Rechenzeit, denn simuliert wird im Voraus und der Renderer steht solange.
 * Mit 900 Schritten dauerte ein ungluecklicher Wurf aus hundert Wuerfeln
 * siebeneinhalb Sekunden.
 *
 * Wird die Grenze erreicht, ohne dass alles liegt, steht der Wurf trotzdem:
 * die Zahl stimmt, weil sie ohnehin vorher feststeht und die Beschriftung
 * auf die abgelesene Flaeche gedreht wird. Nur kann ein Wuerfel dann noch
 * schief stehen.
 */
const MAX_SCHRITTE = 600;

/**
 * Die Halbbreite des Bereichs, in dem die Wuerfel landen duerfen.
 *
 * Waechst mit der Anzahl, und das ist keine Feinheit: bei fester Breite von
 * 4,2 passten hundert Wuerfel nicht nebeneinander. Sie stapelten sich, der
 * Haufen zitterte, und der Wurf kam ueberhaupt nicht mehr zur Ruhe — bei
 * fuenfzig dauerte allein das Rechnen 16 Sekunden.
 *
 * Die Wurzel, weil die Flaeche quadratisch waechst: doppelt so viele Wuerfel
 * brauchen die anderthalbfache Kante.
 *
 * Die Kamera in Buehne3d richtet sich nach dem Bereich, den ein Wurf
 * tatsaechlich benutzt, und zieht deshalb von selbst mit.
 */
export function tischFuer(anzahl: number): number {
  return Math.max(4.2, Math.sqrt(anzahl) * 1.15);
}

/** Der kleinste Wurfbereich — fuer die Kamera als obere Schranke. */
export const TISCH = 4.2;

export interface Lage {
  readonly position: Vector3;
  readonly drehung: Quaternion;
}

export interface GeworfenerWuerfel {
  readonly art: Art;
  readonly augen: number;
  /** Die Ziffern je Flaeche, passend zur Endlage. Leer bei den Kugeln. */
  readonly ziffern: readonly number[];
  /** Die Bahn: eine Lage je Schritt, zum Abspielen. */
  readonly bahn: readonly Lage[];
  readonly endlage: Lage;
}

/**
 * Die Welt, in die geworfen wird.
 *
 * Der Boden ist unsichtbar — die Wuerfel fallen vor den Hintergrund der
 * Anwendung, ohne Tisch. Waende braucht es trotzdem, sonst rollen sie aus dem
 * Bild.
 */
function baueWelt(tisch: number): { welt: World; stoff: Material } {
  // Dreifache Schwerkraft: bei echter Erdbeschleunigung und Wuerfeln von
  // wenigen Zentimetern wirkt der Fall zaeh wie unter Wasser.
  const welt = new World({ gravity: new Vec3(0, -9.82 * 3, 0) });
  // Koerper, die kaum noch etwas tun, werden schlafen gelegt. Ohne das
  // zittert ein Haufen endlos weiter und kommt nie zur Ruhe — im Vorversuch
  // nicht einmal nach fuenfzehn simulierten Sekunden.
  welt.allowSleep = true;

  const stoff = new Material('wuerfel');
  const rand = new Material('rand');
  welt.addContactMaterial(new ContactMaterial(stoff, rand, { friction: 0.4, restitution: 0.3 }));
  welt.addContactMaterial(new ContactMaterial(stoff, stoff, { friction: 0.3, restitution: 0.2 }));

  const boden = new Body({ mass: 0, shape: new Plane(), material: rand });
  boden.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  welt.addBody(boden);

  // Vier senkrechte Waende, ebenfalls unsichtbar.
  const waende: [Vec3, number][] = [
    [new Vec3(-tisch, 0, 0), Math.PI / 2],
    [new Vec3(tisch, 0, 0), -Math.PI / 2],
    [new Vec3(0, 0, -tisch), 0],
    [new Vec3(0, 0, tisch), Math.PI]
  ];
  for (const [ort, winkel] of waende) {
    const wand = new Body({ mass: 0, shape: new Plane(), material: rand });
    wand.position.copy(ort);
    wand.quaternion.setFromEuler(0, winkel, 0);
    welt.addBody(wand);
  }

  return { welt, stoff };
}

/** Die Physikform eines Koerpers: konvexe Huelle, oder Kugel. */
function formVon(koerper: Koerper): ConvexPolyhedron | Sphere {
  if (koerper.istKugel) return new Sphere(0.9);

  // Die Huelle wird aus denselben Punkten gebaut wie die Darstellung. Aus
  // anderen gebaut fiele der Wuerfel anders, als er aussieht.
  const punkte = koerper.ecken.map((ecke) => new Vec3(ecke.x, ecke.y, ecke.z));
  const flaechen = huellenFlaechen(koerper.ecken);
  return new ConvexPolyhedron({ vertices: punkte, faces: flaechen });
}

/**
 * Die Flaechen der konvexen Huelle aus einer Punktwolke.
 *
 * cannon-es will die Flaechen als Listen von Punktindizes und rechnet sie
 * nicht selbst aus. Fuer die wenigen Punkte hier genuegt der einfache Weg:
 * jedes Dreieck aus drei Punkten pruefen, ob alle uebrigen Punkte auf
 * derselben Seite liegen. Das ist O(n^4), bei hoechstens zwanzig Punkten aber
 * eine Sache von Mikrosekunden — und es laeuft einmal je Wuerfelart, nicht je
 * Wurf.
 */
function huellenFlaechen(ecken: readonly Vector3[]): number[][] {
  const flaechen: number[][] = [];
  const anzahl = ecken.length;

  for (let a = 0; a < anzahl; a++) {
    for (let b = a + 1; b < anzahl; b++) {
      for (let c = b + 1; c < anzahl; c++) {
        const normale = new Vector3()
          .subVectors(ecken[b], ecken[a])
          .cross(new Vector3().subVectors(ecken[c], ecken[a]));
        if (normale.lengthSq() < 1e-8) continue;
        normale.normalize();
        const abstand = normale.dot(ecken[a]);

        let davor = 0;
        let dahinter = 0;
        for (let p = 0; p < anzahl; p++) {
          const seite = normale.dot(ecken[p]) - abstand;
          if (seite > 1e-4) davor++;
          else if (seite < -1e-4) dahinter++;
        }
        if (davor > 0 && dahinter > 0) continue;

        // Alle Punkte auf der Flaeche einsammeln und im Kreis ordnen.
        const auf: number[] = [];
        for (let p = 0; p < anzahl; p++) {
          if (Math.abs(normale.dot(ecken[p]) - abstand) <= 1e-4) auf.push(p);
        }
        if (auf.length < 3) continue;
        if (flaechen.some((vorhanden) => gleicheMenge(vorhanden, auf))) continue;

        flaechen.push(ordneImKreis(auf, ecken, davor > 0 ? normale.negate() : normale));
      }
    }
  }
  return flaechen;
}

function gleicheMenge(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

/**
 * Die Punkte einer Flaeche gegen den Uhrzeigersinn ordnen, von aussen gesehen.
 *
 * cannon-es braucht diese Reihenfolge, um die Aussenseite zu erkennen. Ohne
 * sie zeigen Normalen nach innen und die Kollisionen gehen daneben.
 */
function ordneImKreis(
  indizes: number[],
  ecken: readonly Vector3[],
  normale: Vector3
): number[] {
  const mitte = indizes
    .reduce((summe, i) => summe.add(ecken[i]), new Vector3())
    .divideScalar(indizes.length);
  const achseX = new Vector3().subVectors(ecken[indizes[0]], mitte).normalize();
  const achseY = new Vector3().crossVectors(normale, achseX).normalize();

  return [...indizes].sort((links, rechts) => {
    const a = new Vector3().subVectors(ecken[links], mitte);
    const b = new Vector3().subVectors(ecken[rechts], mitte);
    return (
      Math.atan2(a.dot(achseY), a.dot(achseX)) - Math.atan2(b.dot(achseY), b.dot(achseX))
    );
  });
}

/**
 * Welche Flaeche zeigt in der Endlage nach oben?
 *
 * Die Normale jeder Flaeche wird mit der Drehung des Koerpers mitgedreht;
 * gesucht ist die, die am steilsten nach oben zeigt.
 */
export function obenLiegendeFlaeche(koerper: Koerper, drehung: Quaternion): number {
  const hoch = new Vector3(0, 1, 0);
  let beste = 0;
  let bester = -Infinity;
  for (const [nummer, flaeche] of koerper.flaechen.entries()) {
    const gedreht = flaeche.normale.clone().applyQuaternion(drehung);
    const wert = gedreht.dot(hoch);
    if (wert > bester) {
      bester = wert;
      beste = nummer;
    }
  }
  return beste;
}

/**
 * Die Flaeche, die man bei dieser Lage abliest.
 *
 * Beim d4 ist es die aufliegende: ein Tetraeder hat oben keine Flaeche,
 * sondern eine Spitze. Die Regel steht hier und nicht bei den Aufrufern —
 * sie wird beim Werfen und beim Nachpruefen gebraucht, und zweimal
 * hingeschrieben waere sie zweimal zu pflegen.
 */
export function abgeleseneFlaeche(koerper: Koerper, art: Art, drehung: Quaternion): number {
  const gedreht =
    art === 'd4'
      ? drehung.clone().multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI))
      : drehung;
  return obenLiegendeFlaeche(koerper, gedreht);
}

/**
 * Nummeriert die Ziffern so um, dass auf der gewuenschten Flaeche das
 * Ergebnis steht.
 *
 * Getauscht wird paarweise: die Ziffer der Zielflaeche mit der gewuerfelten,
 * und dazu die beiden gegenueberliegenden. Nur so bleibt die Regel erhalten,
 * dass sich gegenueberliegende Flaechen zur Seitenzahl plus eins ergaenzen —
 * ein einfacher Tausch zweier Ziffern wuerde sie zerreissen, und der Wuerfel
 * saehe bei genauem Hinsehen falsch aus.
 *
 * Beim d4 gibt es keine Gegenstuecke; dort genuegt der einfache Tausch. Und
 * gelesen wird bei ihm die untere Flaeche, nicht die obere.
 */
export function setzeErgebnisAufFlaeche(
  ziffern: readonly number[],
  gegenueber: readonly number[],
  flaeche: number,
  ergebnis: number
): number[] {
  const neu = [...ziffern];
  if (neu[flaeche] === ergebnis) return neu;

  const andere = neu.indexOf(ergebnis);
  if (andere < 0) throw new Error(`${ergebnis} kommt in der Beschriftung nicht vor`);

  const tausche = (a: number, b: number) => {
    const merk = neu[a];
    neu[a] = neu[b];
    neu[b] = merk;
  };

  tausche(flaeche, andere);
  const gegenZiel = gegenueber[flaeche];
  const gegenAndere = gegenueber[andere];
  if (gegenZiel >= 0 && gegenAndere >= 0 && gegenZiel !== andere) {
    tausche(gegenZiel, gegenAndere);
  }
  return neu;
}

interface Einwurf {
  readonly art: Art;
  readonly augen: number;
}

/**
 * Wirft die Wuerfel und liefert Bahn und Ergebnis.
 *
 * `koerperVon` wird durchgereicht, damit die Koerper einmal gebaut und
 * wiederverwendet werden koennen — bei zwanzig Wuerfeln waeren zwanzig
 * eigene Geometrien zwanzigmal dieselbe Rechnung.
 */
export function wirf(
  einwuerfe: readonly Einwurf[],
  koerperVon: (art: Art) => Koerper,
  zufall: () => number = Math.random
): GeworfenerWuerfel[] {
  const tisch = tischFuer(einwuerfe.length);
  const { welt, stoff } = baueWelt(tisch);
  const koerperListe = einwuerfe.map((e) => koerperVon(e.art));

  /*
   * Die Wuerfel kommen von der Seite hereingerollt, nicht von oben herab.
   *
   * Ein Fall aus der Hoehe sieht aus, als kippe man einen Becher aus; am
   * Tisch rollt man sie mit Schwung ueber die Flaeche. Sie starten deshalb
   * dicht ueber dem Boden an einer Kante und bekommen Geschwindigkeit quer
   * hinueber — so wie es die Wuerfel in Foundry und D&D Beyond tun.
   *
   * Die Seite wechselt von Wurf zu Wurf, sonst kaeme immer alles aus
   * derselben Ecke.
   */
  const ecke = Math.floor(zufall() * 4);
  const winkel = (ecke * Math.PI) / 2 + (zufall() - 0.5) * 0.5;
  const richtung = new Vec3(-Math.cos(winkel), 0, -Math.sin(winkel));
  const quer = new Vec3(-richtung.z, 0, richtung.x);
  const start = new Vec3(Math.cos(winkel) * tisch * 1.05, 0, Math.sin(winkel) * tisch * 1.05);

  const leiber = einwuerfe.map((_einwurf, nummer) => {
    const koerper = koerperListe[nummer];
    // Nebeneinander an der Startkante aufgereiht, in mehreren Reihen, wenn es
    // viele sind. Ein Haufen an einer Stelle wuerde sich gegenseitig
    // blockieren, statt loszurollen.
    const jeReihe = Math.max(3, Math.ceil(Math.sqrt(einwuerfe.length * 1.6)));
    const spalte = nummer % jeReihe;
    const reihe = Math.floor(nummer / jeReihe);
    const seitlich = (spalte - (jeReihe - 1) / 2) * 1.5;
    const tiefe = reihe * 1.5;

    const schwung = 9 + zufall() * 4;
    const leib = new Body({
      mass: 1,
      shape: formVon(koerper),
      material: stoff,
      position: new Vec3(
        start.x + quer.x * seitlich - richtung.x * tiefe,
        1.1 + (nummer % 3) * 0.35,
        start.z + quer.z * seitlich - richtung.z * tiefe
      ),
      velocity: new Vec3(
        richtung.x * schwung + (zufall() - 0.5) * 1.5,
        // Leicht nach oben: sonst schleifen sie ueber den Boden, statt einmal
        // aufzusetzen und weiterzurollen.
        1.5 + zufall(),
        richtung.z * schwung + (zufall() - 0.5) * 1.5
      ),
      // Die Drehung um die Querachse laesst sie in Fahrtrichtung ueberschlagen
      // — das ist es, was einen rollenden Wuerfel ausmacht.
      angularVelocity: new Vec3(
        quer.x * (12 + zufall() * 8) + (zufall() - 0.5) * 4,
        (zufall() - 0.5) * 6,
        quer.z * (12 + zufall() * 8) + (zufall() - 0.5) * 4
      ),
      // Ohne Daempfung zittern liegende Koerper endlos weiter; die Kugeln
      // rollen ohne die zweite Zeile bis an die Wand. Rollreibung kennt
      // cannon-es nicht, die Daempfung der Drehung muss die Arbeit tun.
      linearDamping: koerper.istKugel ? 0.45 : 0.06,
      angularDamping: koerper.istKugel ? 0.9 : 0.12,
      allowSleep: true,
      // Frueher einschlafen als im Vorversuch: ein Haufen aus fuenfzig
      // Wuerfeln setzt sich langsam, und bei 0.2 weckten sich die Koerper
      // gegenseitig immer wieder auf, bis die Zeitgrenze kam. 0.4 liegt weit
      // unter der Geschwindigkeit eines rollenden Wuerfels — der faellt mit
      // dem Zehnfachen.
      sleepSpeedLimit: 0.4,
      sleepTimeLimit: 0.2
    });
    welt.addBody(leib);
    return leib;
  });

  const bahnen: Lage[][] = leiber.map(() => []);
  for (let schritt = 0; schritt < MAX_SCHRITTE; schritt++) {
    welt.step(SCHRITT);
    for (const [nummer, leib] of leiber.entries()) {
      bahnen[nummer].push({
        position: new Vector3(leib.position.x, leib.position.y, leib.position.z),
        drehung: new Quaternion(
          leib.quaternion.x,
          leib.quaternion.y,
          leib.quaternion.z,
          leib.quaternion.w
        )
      });
    }
    const alleRuhig = leiber.every(
      (leib) =>
        leib.sleepState === Body.SLEEPING ||
        (leib.velocity.length() < RUHE && leib.angularVelocity.length() < RUHE)
    );
    if (alleRuhig) break;
  }

  return einwuerfe.map((einwurf, nummer) => {
    const koerper = koerperListe[nummer];
    const bahn = bahnen[nummer];
    const endlage = bahn[bahn.length - 1];

    if (koerper.flaechen.length === 0) {
      return { art: einwurf.art, augen: einwurf.augen, ziffern: [], bahn, endlage };
    }

    const gegen = gegenueberliegende(koerper.flaechen);
    const grund = ordneZiffernZu(SEITEN[einwurf.art], gegen);
    const gelesen = abgeleseneFlaeche(koerper, einwurf.art, endlage.drehung);
    const ziffern = setzeErgebnisAufFlaeche(grund, gegen, gelesen, einwurf.augen);

    return { art: einwurf.art, augen: einwurf.augen, ziffern, bahn, endlage };
  });
}

/** Baut die Koerper einmal je Art und gibt sie wieder aus. */
export function koerperVorrat(): (art: Art) => Koerper {
  const vorrat = new Map<Art, Koerper>();
  return (art) => {
    let koerper = vorrat.get(art);
    if (!koerper) {
      koerper = baueKoerper(art);
      vorrat.set(art, koerper);
    }
    return koerper;
  };
}

/** Nur fuer Tests: prueft eine umnummerierte Beschriftung auf ihre Regeln. */
export function pruefeUmnummerierung(
  seiten: number,
  ziffern: readonly number[],
  gegenueber: readonly number[]
): string[] {
  return pruefeBeschriftung(seiten, ziffern, gegenueber);
}
