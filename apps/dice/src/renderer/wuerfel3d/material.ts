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

/** Sterne fuer den Sternenhimmel, auf dunklem Grund. */
function sternenTextur(farbe: string): CanvasTexture {
  const { flaeche, stift } = leinwand();
  const verlauf = stift.createRadialGradient(BILD / 2, BILD * 0.42, 10, BILD / 2, BILD / 2, BILD * 0.7);
  verlauf.addColorStop(0, farbe);
  verlauf.addColorStop(1, '#05060a');
  stift.fillStyle = verlauf;
  stift.fillRect(0, 0, BILD, BILD);

  stift.fillStyle = 'rgba(255,255,255,0.92)';
  const sterne: [number, number, number][] = [
    [60, 70, 3.2], [150, 55, 2.2], [200, 120, 2.8], [90, 150, 2],
    [130, 190, 2.6], [45, 200, 1.8], [215, 205, 2.2], [175, 90, 1.6]
  ];
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
      // Metall lebt vom Glanzlicht, nicht von einer Zeichnung: hoher
      // Metallanteil, wenig Rauheit.
      metalness: 0.85,
      roughness: 0.22,
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
    return new MeshStandardMaterial({
      map: sternenTextur(farbe),
      metalness: 0.2,
      roughness: 0.5,
      // Die Sterne sollen leuchten und nicht vom Licht abhaengen.
      emissiveMap: sternenTextur(farbe),
      emissive: new Color('#222634'),
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
