/**
 * Die vier Muster als Material.
 *
 * Die Verlaeufe der flachen Darstellung lassen sich nicht uebernehmen — dort
 * sind es SVG-Verlaeufe, hier braucht es Oberflaechen mit Licht. Die Wirkung
 * soll dieselbe sein: schlicht, Metall, Marmor, Sternenhimmel, und alle vier
 * leiten sich aus der einen gewaehlten Farbe ab. Sonst waere die freie
 * Farbwahl nur beim schlichten Muster wirksam.
 */
import { CanvasTexture, Color, MeshStandardMaterial, RepeatWrapping } from 'three';
import type { Muster } from '../../shared/einstellungen';

/** Kantenlaenge der gemalten Texturen. */
const BILD = 256;

function leinwand(): { flaeche: HTMLCanvasElement; stift: CanvasRenderingContext2D } {
  const flaeche = document.createElement('canvas');
  flaeche.width = BILD;
  flaeche.height = BILD;
  const stift = flaeche.getContext('2d');
  if (!stift) throw new Error('kein 2D-Kontext fuer das Muster');
  return { flaeche, stift };
}

/** Adern fuer den Marmor, gemalt statt gerechnet. */
function marmorTextur(farbe: string): CanvasTexture {
  const { flaeche, stift } = leinwand();
  stift.fillStyle = farbe;
  stift.fillRect(0, 0, BILD, BILD);

  stift.strokeStyle = 'rgba(255,255,255,0.42)';
  stift.lineCap = 'round';
  // Feste Adern statt zufaelliger: bei zwanzig Wuerfeln waeren zwanzig
  // verschiedene Maserungen unruhig, und gerechnet wuerde bei jedem Wurf neu.
  const adern: [number, number, number, number, number, number, number][] = [
    [10, 150, 80, 110, 150, 170, 4],
    [60, 30, 120, 90, 200, 60, 2],
    [30, 220, 110, 180, 210, 230, 2.5],
    [140, 10, 190, 80, 250, 40, 1.5]
  ];
  for (const [x1, y1, cx, cy, x2, y2, breite] of adern) {
    stift.lineWidth = breite;
    stift.beginPath();
    stift.moveTo(x1, y1);
    stift.quadraticCurveTo(cx, cy, x2, y2);
    stift.stroke();
  }

  const textur = new CanvasTexture(flaeche);
  textur.wrapS = RepeatWrapping;
  textur.wrapT = RepeatWrapping;
  return textur;
}

/**
 * Sterne fuer den Sternenhimmel, auf dunklem Grund.
 *
 * Der Grund ist dunkel und die gewaehlte Farbe liegt nur als Schimmer darin.
 * Ein erster Anlauf ging von der Farbe aus und wurde erst am Rand dunkel; auf
 * den Koerpern blieb davon ein flaechiges Hellblau ohne erkennbaren Himmel,
 * weil jede Flaeche nur einen kleinen Ausschnitt der Textur zeigt.
 */
function sternenTextur(farbe: string): CanvasTexture {
  const { flaeche, stift } = leinwand();
  stift.fillStyle = '#05060a';
  stift.fillRect(0, 0, BILD, BILD);

  // Ein paar farbige Schwaden, damit die gewaehlte Farbe sichtbar bleibt.
  for (const [x, y, r] of [
    [70, 80, 90],
    [190, 170, 110],
    [40, 210, 70]
  ] as [number, number, number][]) {
    const schwade = stift.createRadialGradient(x, y, 2, x, y, r);
    schwade.addColorStop(0, farbe);
    schwade.addColorStop(1, 'transparent');
    stift.globalAlpha = 0.5;
    stift.fillStyle = schwade;
    stift.fillRect(0, 0, BILD, BILD);
  }
  stift.globalAlpha = 1;

  // Mehr und kleinere Sterne als zuerst: eine Wuerfelflaeche zeigt nur einen
  // Ausschnitt, und bei acht Sternen auf der ganzen Textur traf sie oft
  // keinen einzigen.
  stift.fillStyle = '#ffffff';
  const sterne: [number, number, number][] = [];
  // Feste Stellen aus einer einfachen Folge statt Zufall: die Textur wird bei
  // jedem Farbwechsel neu gemalt, und ein wanderndes Sternbild waere unruhig.
  let zahl = 7;
  for (let i = 0; i < 60; i++) {
    zahl = (zahl * 1103515245 + 12345) % 2147483648;
    const x = (zahl / 2147483648) * BILD;
    zahl = (zahl * 1103515245 + 12345) % 2147483648;
    const y = (zahl / 2147483648) * BILD;
    zahl = (zahl * 1103515245 + 12345) % 2147483648;
    sterne.push([x, y, 0.8 + (zahl / 2147483648) * 1.8]);
  }
  for (const [x, y, r] of sterne) {
    stift.beginPath();
    stift.arc(x, y, r, 0, Math.PI * 2);
    stift.fill();
  }

  const textur = new CanvasTexture(flaeche);
  textur.wrapS = RepeatWrapping;
  textur.wrapT = RepeatWrapping;
  return textur;
}

/**
 * Das Material fuer ein Muster.
 *
 * Wird je Kombination aus Farbe und Muster einmal gebaut und geteilt: bei
 * hundert Wuerfeln waeren hundert eigene hundertmal derselbe Speicher.
 */
export function baueMaterial(muster: Muster, farbe: string): MeshStandardMaterial {
  const grund = new Color(farbe);

  if (muster === 'metall') {
    return new MeshStandardMaterial({
      color: grund,
      /*
       * Halber Metallanteil, nicht voller.
       *
       * Echtes Metall zeigt fast nur, was es spiegelt. Die Szene hat aber
       * keine Umgebung zum Spiegeln, nur zwei Lichter — mit 0.85 wurde selbst
       * ein helles Blau zu dunklem Grau, und von der gewaehlten Farbe blieb
       * nichts uebrig. Bei 0.45 bleibt die Farbe stehen und der Glanz kommt
       * vom Licht.
       */
      metalness: 0.45,
      roughness: 0.18,
      flatShading: true
    });
  }

  if (muster === 'marmor') {
    return new MeshStandardMaterial({
      map: marmorTextur(farbe),
      metalness: 0.05,
      roughness: 0.35,
      flatShading: true
    });
  }

  if (muster === 'sternenhimmel') {
    const himmel = sternenTextur(farbe);
    return new MeshStandardMaterial({
      map: himmel,
      metalness: 0.15,
      roughness: 0.6,
      // Dieselbe Textur als Eigenleuchten: die Sterne sollen auch dort hell
      // sein, wo kein Licht hinfaellt. Ein eigenes zweites Bild dafuer waere
      // dasselbe Bild ein zweites Mal.
      emissiveMap: himmel,
      emissive: new Color('#5b6ea8'),
      flatShading: true
    });
  }

  return new MeshStandardMaterial({
    color: grund,
    metalness: 0.1,
    roughness: 0.45,
    flatShading: true
  });
}
