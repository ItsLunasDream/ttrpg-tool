/**
 * Die Buehne mit den fallenden Koerpern.
 *
 * Sie zeigt, was `wirf()` schon ausgerechnet hat: die Bahn liegt fertig vor,
 * bevor das erste Bild gezeichnet wird. Ruckelt die Darstellung, wird die
 * Bewegung ungleichmaessig — falsch wird sie nie, und die Zahl oben stimmt
 * auch dann.
 *
 * Der Boden ist unsichtbar. Die Wuerfel fallen vor den Hintergrund der
 * Anwendung, ohne Tisch und ohne Schatten einer sichtbaren Flaeche.
 */
import { useEffect, useRef, useState } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import type { Art } from '../../shared/formen';
import { zahlenFarbe, type Einstellungen } from '../../shared/einstellungen';
import { baueMaterial } from './material';
import { abgeleseneFlaeche, koerperVorrat, wirf, TISCH, type GeworfenerWuerfel } from './wurf';
import { ziffernSchilder } from './ziffern';

export interface Einwurf {
  readonly art: Art;
  readonly augen: number;
  readonly hoechst?: boolean;
  readonly tiefst?: boolean;
}

/** Wo ein Effekt auf dem Bild sitzt, in Prozent der Leinwand. */
interface Effektsitz {
  readonly nummer: number;
  readonly links: number;
  readonly oben: number;
  readonly art: 'hoechst' | 'tiefst';
}

interface Props {
  /** Die Wuerfel dieses Wurfs. Eine neue Liste startet einen neuen Wurf. */
  readonly einwuerfe: readonly Einwurf[];
  readonly einstellungen: Einstellungen;
  /** Zaehlt hoch, sobald neu geworfen werden soll. */
  readonly wurfNummer: number;
  onFertig?: () => void;
}

/** Wie gross die Ziffern auf den Flaechen sind, je Art. */
function zifferGroesse(art: Art): number {
  return art === 'd20' ? 0.42 : art === 'd12' ? 0.5 : 0.62;
}

export function Buehne3d({ einwuerfe, einstellungen, wurfNummer, onFertig }: Props) {
  const halter = useRef<HTMLDivElement>(null);
  const fertigRef = useRef(onFertig);
  fertigRef.current = onFertig;
  /**
   * Wo Glitzer und Streifen liegen.
   *
   * Erst wenn die Wuerfel liegen: waehrend des Falls wuerden die Effekte
   * mitwandern, und ein Glitzern an einem Wuerfel, der noch rollt, sagt
   * nichts. Gerechnet wird die Bildschirmlage aus der Endlage — anders als in
   * der flachen Darstellung, wo der Effekt einfach im Wuerfel steckt.
   */
  const [effekte, setEffekte] = useState<Effektsitz[]>([]);

  useEffect(() => {
    const knoten = halter.current;
    if (!knoten || einwuerfe.length === 0) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // Ohne Grafikbeschleunigung faellt die Anwendung eine Ebene hoeher auf
      // die flache Darstellung zurueck; hier bleibt nur, nichts zu tun.
      return;
    }

    const breite = knoten.clientWidth || 640;
    const hoehe = knoten.clientHeight || 360;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(breite, hoehe);
    knoten.appendChild(renderer.domElement);

    const szene = new Scene();
    // Die Kamera wird erst aufgestellt, wenn der Wurf feststeht: ihre
    // Entfernung haengt davon ab, wie weit die Wuerfel tatsaechlich rollen.
    const FELD = 40;
    const kamera = new PerspectiveCamera(FELD, breite / hoehe, 0.1, 200);

    szene.add(new AmbientLight(0xffffff, 0.7));
    const licht = new DirectionalLight(0xffffff, 1.15);
    licht.position.set(5, 12, 8);
    szene.add(licht);

    const vorrat = koerperVorrat();
    const material = baueMaterial(einstellungen.muster, einstellungen.farbe);
    const schrift = zahlenFarbe(einstellungen.farbe);

    const geworfen: GeworfenerWuerfel[] = wirf(einwuerfe, vorrat);

    /*
     * Wie weit die Kamera weg muss.
     *
     * Nicht der ganze Wurfbereich, sondern nur der Teil, den dieser Wurf
     * wirklich benutzt: bei sechs Wuerfeln blieb sonst zwei Drittel des
     * Bildes leer, und die Ziffern waren zu klein zum Lesen. Gesucht wird ueber
     * die ganze Bahn und nicht nur ueber die Endlagen, sonst wandern Wuerfel
     * waehrend des Falls aus dem Bild.
     */
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const wuerfel of geworfen) {
      for (const lage of wuerfel.bahn) {
        minX = Math.min(minX, lage.position.x);
        maxX = Math.max(maxX, lage.position.x);
        minZ = Math.min(minZ, lage.position.z);
        maxZ = Math.max(maxZ, lage.position.z);
      }
    }
    // Um die Mitte der Wuerfel, nicht um den Ursprung: der Wurf faellt selten
    // symmetrisch, und auf den Ursprung ausgerichtet lagen die Wuerfel am
    // linken Rand halb ausserhalb des Bildes.
    const mitteX = (minX + maxX) / 2;
    const mitteZ = (minZ + maxZ) / 2;
    const benutzt = Math.max(1.6, (maxX - minX) / 2, (maxZ - minZ) / 2);
    const bereich = Math.min(benutzt + 1.1, TISCH * 1.55);

    /*
     * Wie weit die Kamera weg muss, damit dieser Bereich hineinpasst.
     *
     * Eine feste Entfernung passt nur zu einem Seitenverhaeltnis. Steht das
     * Fenster hochkant, ist der waagerechte Sichtwinkel enger als der
     * senkrechte, und die Wuerfel am Rand liegen ausserhalb des Bildes —
     * genau das war zu sehen. Massgeblich ist deshalb der engere der beiden.
     */
    const halbSenkrecht = ((FELD / 2) * Math.PI) / 180;
    const halbWaagerecht = Math.atan(Math.tan(halbSenkrecht) * (breite / hoehe));
    const enger = Math.min(halbSenkrecht, halbWaagerecht);
    const abstand = bereich / Math.tan(enger);
    kamera.position.set(mitteX, abstand * 0.82, mitteZ + abstand * 0.57);
    kamera.lookAt(mitteX, 0, mitteZ);
    const netze: Mesh[] = geworfen.map((wuerfel) => {
      const koerper = vorrat(wuerfel.art);
      const netz = new Mesh(koerper.geometrie, material);
      if (wuerfel.ziffern.length > 0) {
        netz.add(
          ziffernSchilder(koerper.flaechen, wuerfel.ziffern, schrift, zifferGroesse(wuerfel.art))
        );
      }
      szene.add(netz);
      return netz;
    });

    // Messpunkte fuer die Rauchtests: wie lange der Wurf wirklich dauert und
    // wie viele Bilder dafuer gebraucht wurden. Im Fenster sichtbar, damit ein
    // Testskript es abfragen kann, ohne die Zeit von aussen zu schaetzen.
    const begonnen = performance.now();
    (window as unknown as { __wurf3d?: unknown }).__wurf3d = { laeuft: true };

    let laeuft = true;
    let bild = 0;
    let gemeldet = false;
    const laenge = Math.max(...geworfen.map((w) => w.bahn.length));

    /**
     * Wie viele Simulationsschritte je Bild gezeigt werden.
     *
     * In Echtzeit abgespielt dauerte ein Wurf aus zwoelf Wuerfeln ueber neun
     * Sekunden — so lange wartet niemand auf ein Ergebnis. Bei kurzen Bahnen
     * bleibt es bei einem Schritt je Bild und damit bei der Geschwindigkeit
     * der Simulation; nur lange Bahnen werden gerafft, und zwar so weit, dass
     * die Anzeige die Hoechstdauer nicht ueberschreitet.
     */
    const HOECHSTDAUER = 2.6;
    const proBild = Math.max(1, Math.ceil(laenge / (HOECHSTDAUER * 60)));

    const zeichne = () => {
      if (!laeuft) return;
      // Die Bahn wird abgespielt, nicht gerechnet: ein Schritt je Bild. Bei
      // 60 Bildern je Sekunde stimmt das mit der Schrittweite der Simulation
      // ueberein.
      const schritt = Math.min(bild * proBild, laenge - 1);
      for (const [nummer, netz] of netze.entries()) {
        const bahn = geworfen[nummer].bahn;
        const lage = bahn[Math.min(schritt, bahn.length - 1)];
        netz.position.copy(lage.position);
        netz.quaternion.copy(lage.drehung);
      }
      renderer.render(szene, kamera);

      if (schritt >= laenge - 1 && !gemeldet) {
        gemeldet = true;
        /*
         * Was auf den liegenden Koerpern steht, aus der Szene abgelesen.
         *
         * Nicht die Zahlen, die `wuerfle()` gezogen hat — die stehen ohnehin
         * schon im Rechenweg, und sie zu vergleichen pruefte nichts. Hier wird
         * derselbe Weg gegangen wie ein Auge: welche Flaeche liegt oben, und
         * welche Ziffer traegt sie. Stimmt die Umnummerierung nicht, faellt es
         * genau hier auf.
         */
        const abgelesen = geworfen.map((wuerfel) => {
          if (wuerfel.ziffern.length === 0) return wuerfel.augen;
          const koerper = vorrat(wuerfel.art);
          return wuerfel.ziffern[
            abgeleseneFlaeche(koerper, wuerfel.art, wuerfel.endlage.drehung)
          ];
        });

        (window as unknown as { __wurf3d?: unknown }).__wurf3d = {
          laeuft: false,
          ms: Math.round(performance.now() - begonnen),
          bilder: bild,
          schritte: laenge,
          proBild,
          abgelesen
        };
        setEffekte(
          geworfen.flatMap((wuerfel, nummer) => {
            const einwurf = einwuerfe[nummer];
            const welche = einwurf.hoechst ? 'hoechst' : einwurf.tiefst ? 'tiefst' : null;
            if (!welche) return [];
            const ort = wuerfel.endlage.position.clone().project(kamera);
            return [
              {
                nummer,
                // project() liefert -1 bis 1 mit dem Ursprung in der Mitte
                // und y nach oben; die Seite rechnet in Prozent von links
                // oben.
                links: (ort.x * 0.5 + 0.5) * 100,
                oben: (-ort.y * 0.5 + 0.5) * 100,
                art: welche
              }
            ];
          })
        );
        fertigRef.current?.();
      }
      bild++;
      // Nach dem Ende wird nicht weitergerechnet: die Koerper liegen, und ein
      // Bildtakt, der nichts mehr aendert, kostet nur Strom.
      if (bild * proBild < laenge) requestAnimationFrame(zeichne);
    };
    requestAnimationFrame(zeichne);

    return () => {
      laeuft = false;
      // three.js gibt Puffer nicht von selbst frei, und die Huelle laesst
      // geoeffnete Werkzeuge im Hintergrund haengen — was hier liegen bleibt,
      // bleibt bis zum Schliessen der Anwendung liegen.
      // three.js gibt Puffer nicht von selbst frei, und die Huelle laesst
      // geoeffnete Werkzeuge im Hintergrund haengen — was hier liegen bleibt,
      // bleibt bis zum Schliessen der Anwendung liegen. Die Geometrien der
      // Koerper gehoeren dem Vorrat und werden geteilt; freigegeben wird nur,
      // was diese Szene selbst angelegt hat: die Ziffernschilder.
      for (const netz of netze) {
        netz.traverse((teil) => {
          if (!(teil instanceof Mesh) || teil === netz) return;
          const stoffe = Array.isArray(teil.material) ? teil.material : [teil.material];
          for (const stoff of stoffe) {
            const karte = (stoff as { map?: { dispose(): void } }).map;
            karte?.dispose();
            stoff.dispose();
          }
          teil.geometry.dispose();
        });
        szene.remove(netz);
      }
      material.dispose();
      if (material.map) material.map.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // wurfNummer steht bewusst in der Liste: ein neuer Wurf baut die Szene neu
    // auf. Die Koerper selbst kommen aus dem Vorrat und werden geteilt.
  }, [einwuerfe, einstellungen, wurfNummer]);

  // Die Effekte liegen als eigene Elemente ueber der Leinwand und nicht in der
  // Szene: als Lichter oder Nebel gerechnet kosteten sie bei jedem Bild, hier
  // kosten sie nichts, solange sie fehlen.
  return (
    <div className="buehne3d" ref={halter} aria-hidden="true">
      {effekte.map((effekt) =>
        effekt.art === 'hoechst' ? (
          <span
            key={effekt.nummer}
            className="glitzer glitzer--frei"
            style={{ left: `${effekt.links}%`, top: `${effekt.oben}%` }}
          >
            <span className="glitzer__funke" style={{ left: '10%', top: '15%' }} />
            <span className="glitzer__funke" style={{ left: '80%', top: '10%', animationDelay: '120ms' }} />
            <span className="glitzer__funke" style={{ left: '88%', top: '62%', animationDelay: '260ms' }} />
            <span className="glitzer__funke" style={{ left: '16%', top: '74%', animationDelay: '190ms' }} />
            <span className="glitzer__funke" style={{ left: '50%', top: '-4%', animationDelay: '330ms' }} />
          </span>
        ) : (
          <span
            key={effekt.nummer}
            className="streifen streifen--frei"
            style={{ left: `${effekt.links}%`, top: `${effekt.oben}%` }}
          >
            <span className="streifen__linie" />
            <span className="streifen__linie" />
            <span className="streifen__linie" />
            <span className="streifen__linie" />
          </span>
        )
      )}
    </div>
  );
}

/** Ob die Grafikbeschleunigung ueberhaupt zur Verfuegung steht. */
export function kannDreiD(): boolean {
  try {
    const probe = document.createElement('canvas');
    return Boolean(
      probe.getContext('webgl2') ?? probe.getContext('webgl')
    );
  } catch {
    return false;
  }
}
