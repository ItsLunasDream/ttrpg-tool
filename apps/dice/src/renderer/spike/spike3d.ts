/**
 * Vorversuch fuer die 3D-Wuerfel — kein Teil der Oberflaeche.
 *
 * Er beantwortet die Fragen, die vor dem Bauen geklaert sein muessen, und
 * zwar dort, wo sie zaehlen: in der gepackten Anwendung unter file://, in die
 * Huelle eingebettet. Im Browser waere jede Antwort wertlos, weil dort weder
 * die CSP noch der Ladeweg dieselben sind.
 *
 * Gemessen wird:
 *   - laeuft WebGL ueberhaupt, und laeuft three.js unter dieser CSP
 *   - kommen Wuerfel zur Ruhe, und wie lange rechnet die Physik dafuer
 *   - kommt eine Kugel zur Ruhe (sie rollt sonst endlos)
 *   - wie viele Bilder je Sekunde bei 1, 20 und 100 Koerpern
 *
 * Wird ueber `window.__spike3d` aufgerufen. Der Import steht bewusst fest im
 * Buendel: nur so misst `npm run build` die Groesse, die three.js wirklich
 * kostet.
 */
import * as THREE from 'three';
import { World, Body, Box, Sphere, Plane, Vec3, Material, ContactMaterial } from 'cannon-es';

export interface Messung {
  readonly webgl: boolean;
  readonly fehler?: string;
  /** Schritte, bis alle Koerper ruhen — oder -1, wenn sie es nie tun. */
  readonly schritteBisRuhe: number;
  readonly msSimulation: number;
  readonly kugelRuht: boolean;
  readonly kugelSchritte: number;
  readonly bilderProSekunde: number;
  readonly msJeBild: number;
}

const SCHRITT = 1 / 60;
/** Wann ein Koerper als liegend gilt. */
const RUHE = 0.05;
const MAX_SCHRITTE = 900; // 15 Sekunden simulierte Zeit

function welt(): World {
  const w = new World({ gravity: new Vec3(0, -9.82 * 3, 0) });
  // Koerper, die kaum noch etwas tun, werden schlafen gelegt. Ohne das
  // zittert ein Haufen aus hundert Wuerfeln endlos weiter und kommt nie zur
  // Ruhe — im ersten Versuch nicht einmal nach fuenfzehn simulierten
  // Sekunden.
  w.allowSleep = true;
  // Dreifache Schwerkraft: bei echter Erdbeschleunigung und Wuerfeln von
  // wenigen Zentimetern wirkt der Fall zaeh wie unter Wasser.
  const stoff = new Material('wuerfel');
  const boden = new Material('boden');
  w.addContactMaterial(new ContactMaterial(stoff, boden, { friction: 0.4, restitution: 0.35 }));
  w.addContactMaterial(new ContactMaterial(stoff, stoff, { friction: 0.3, restitution: 0.25 }));

  const flaeche = new Body({ mass: 0, shape: new Plane(), material: boden });
  flaeche.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  w.addBody(flaeche);
  return w;
}

/** Laest `anzahl` Wuerfel fallen und zaehlt, bis alle liegen. */
function falleWuerfel(anzahl: number): { schritte: number; ms: number; koerper: Body[] } {
  const w = welt();
  const stoff = w.contactmaterials[0].materials[0];
  const koerper: Body[] = [];
  for (let i = 0; i < anzahl; i++) {
    const b = new Body({
      mass: 1,
      shape: new Box(new Vec3(0.5, 0.5, 0.5)),
      material: stoff,
      position: new Vec3((i % 7) - 3, 3 + Math.floor(i / 7) * 1.6, ((i * 7) % 5) - 2),
      angularVelocity: new Vec3(6, 4, 8),
      velocity: new Vec3(0, -2, 0),
      // Ohne Daempfung zittern liegende Koerper endlos weiter.
      linearDamping: 0.06,
      angularDamping: 0.12,
      allowSleep: true,
      sleepSpeedLimit: 0.2,
      sleepTimeLimit: 0.3
    });
    w.addBody(b);
    koerper.push(b);
  }

  const start = performance.now();
  let schritte = -1;
  for (let i = 0; i < MAX_SCHRITTE; i++) {
    w.step(SCHRITT);
    const ruhig = koerper.every(
      (b) => b.sleepState === 2 || (b.velocity.length() < RUHE && b.angularVelocity.length() < RUHE)
    );
    if (ruhig) {
      schritte = i;
      break;
    }
  }
  return { schritte, ms: performance.now() - start, koerper };
}

/** Dasselbe mit einer Kugel: sie rollt ohne Rollreibung endlos. */
function falleKugel(): { ruht: boolean; schritte: number } {
  const w = welt();
  const stoff = w.contactmaterials[0].materials[0];
  const b = new Body({
    mass: 1,
    shape: new Sphere(0.6),
    material: stoff,
    position: new Vec3(0, 3, 0),
    velocity: new Vec3(2.5, -1, 1.5),
    angularVelocity: new Vec3(3, 2, 4),
    linearDamping: 0.45,
    allowSleep: true,
    sleepSpeedLimit: 0.2,
    sleepTimeLimit: 0.3,
    // Rollreibung gibt es in cannon-es nicht; die Daempfung der Drehung
    // muss die Arbeit tun, sonst rollt die Kugel bis zum Bildrand.
    angularDamping: 0.9
  });
  w.addBody(b);
  for (let i = 0; i < MAX_SCHRITTE; i++) {
    w.step(SCHRITT);
    if (b.sleepState === 2 || (b.velocity.length() < RUHE && b.angularVelocity.length() < RUHE)) {
      return { ruht: true, schritte: i };
    }
  }
  return { ruht: false, schritte: -1 };
}

export async function spike3d(anzahl: number): Promise<Messung> {
  const leer: Messung = {
    webgl: false,
    schritteBisRuhe: -1,
    msSimulation: 0,
    kugelRuht: false,
    kugelSchritte: -1,
    bilderProSekunde: 0,
    msJeBild: 0
  };

  let renderer: THREE.WebGLRenderer;
  const leinwand = document.createElement('canvas');
  leinwand.width = 640;
  leinwand.height = 360;
  leinwand.id = 'spike3d';
  document.body.appendChild(leinwand);
  try {
    renderer = new THREE.WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true });
  } catch (fehler) {
    return { ...leer, fehler: String(fehler) };
  }

  const szene = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(45, 640 / 360, 0.1, 100);
  kamera.position.set(0, 8, 10);
  kamera.lookAt(0, 0, 0);
  szene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const licht = new THREE.DirectionalLight(0xffffff, 1.1);
  licht.position.set(4, 10, 6);
  szene.add(licht);

  const { schritte, ms, koerper } = falleWuerfel(anzahl);
  const kugel = falleKugel();

  // Eine Geometrie und ein Material fuer alle: hundert eigene waeren hundertmal
  // derselbe Speicher.
  const form = new THREE.BoxGeometry(1, 1, 1);
  const stoff = new THREE.MeshStandardMaterial({ color: 0x7aa2f7, roughness: 0.45, metalness: 0.1 });
  const netze = koerper.map(() => {
    const m = new THREE.Mesh(form, stoff);
    szene.add(m);
    return m;
  });

  // Bildrate messen: die Koerper werden je Bild aus der Simulation gestellt,
  // so wie es spaeter auch laeuft.
  const welt2 = welt();
  const abstaende: number[] = [];
  await new Promise<void>((fertig) => {
    let vorher = performance.now();
    let bild = 0;
    const zeichne = () => {
      welt2.step(SCHRITT);
      for (const [i, netz] of netze.entries()) {
        const b = koerper[i];
        netz.position.set(b.position.x, b.position.y, b.position.z);
        netz.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
      }
      renderer.render(szene, kamera);
      const jetzt = performance.now();
      abstaende.push(jetzt - vorher);
      vorher = jetzt;
      if (++bild < 90) requestAnimationFrame(zeichne);
      else fertig();
    };
    requestAnimationFrame(zeichne);
  });

  // Die ersten Bilder enthalten das Aufwaermen der Grafik und verzerren den
  // Schnitt; sie fliegen raus.
  const gemessen = abstaende.slice(20).sort((a, b) => a - b);
  const median = gemessen[Math.floor(gemessen.length / 2)] || 0;

  form.dispose();
  stoff.dispose();
  renderer.dispose();
  leinwand.remove();

  return {
    webgl: true,
    schritteBisRuhe: schritte,
    msSimulation: Math.round(ms * 10) / 10,
    kugelRuht: kugel.ruht,
    kugelSchritte: kugel.schritte,
    msJeBild: Math.round(median * 10) / 10,
    bilderProSekunde: median > 0 ? Math.round(1000 / median) : 0
  };
}
