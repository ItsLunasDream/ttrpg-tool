/**
 * Zeigt alle Koerper nebeneinander — nur zum Ansehen, kein Teil der
 * Oberflaeche.
 *
 * Geometrie und Beschriftung lassen sich in Zahlen pruefen (das tun die
 * Modultests), aber ob eine Ziffer schief steht, im Koerper versinkt oder auf
 * dem Kopf haengt, sieht man nur im Bild.
 */
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import { ARTEN, SEITEN } from '../../shared/formen';
import { ordneZiffernZu } from '../../shared/beschriftung';
import { baueKoerper, gegenueberliegende } from '../wuerfel3d/koerper';
import { ziffernSchilder } from '../wuerfel3d/ziffern';

export function schau(breite = 1200, hoehe = 220): string {
  const leinwand = document.createElement('canvas');
  leinwand.width = breite;
  leinwand.height = hoehe;
  leinwand.id = 'schau3d';
  document.body.appendChild(leinwand);

  const renderer = new WebGLRenderer({ canvas: leinwand, antialias: true, alpha: true });
  const szene = new Scene();
  const kamera = new PerspectiveCamera(30, breite / hoehe, 0.1, 100);
  kamera.position.set(0, 0.9, 10.5);
  kamera.lookAt(0, 0, 0);
  szene.add(new AmbientLight(0xffffff, 0.75));
  const licht = new DirectionalLight(0xffffff, 1.2);
  licht.position.set(3, 8, 7);
  szene.add(licht);

  const abstand = 2.4;
  ARTEN.forEach((art, nummer) => {
    const koerper = baueKoerper(art);
    const netz = new Mesh(
      koerper.geometrie,
      new MeshStandardMaterial({ color: 0x7aa2f7, roughness: 0.4, metalness: 0.15, flatShading: true })
    );
    netz.position.x = (nummer - (ARTEN.length - 1) / 2) * abstand;
    netz.rotation.set(0.35, nummer * 0.4, 0.12);

    if (koerper.flaechen.length > 0) {
      const gegen = gegenueberliegende(koerper.flaechen);
      const ziffern = ordneZiffernZu(SEITEN[art], gegen);
      netz.add(ziffernSchilder(koerper.flaechen, ziffern, '#101319', art === 'd20' ? 0.5 : 0.7));
    }
    szene.add(netz);
  });

  renderer.render(szene, kamera);
  return leinwand.toDataURL('image/png');
}
