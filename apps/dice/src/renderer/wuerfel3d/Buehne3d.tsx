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
  BufferGeometry,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import type { Art } from '../../shared/formen';
import { SEITEN } from '../../shared/formen';
import { zahlenFarbe, type Einstellungen } from '../../shared/einstellungen';
import { baueMaterial } from './material';
import { abgeleseneFlaeche, koerperVorrat, tischFuer, wirf, type GeworfenerWuerfel } from './wurf';
import { ZiffernAtlas, ziffernGeometrie, ziffernMaterial } from './ziffern';

export interface Einwurf {
  readonly art: Art;
  readonly augen: number;
  readonly hoechst?: boolean;
  readonly tiefst?: boolean;
  /** Ob dieser Wuerfel abgezogen statt dazugezaehlt wird. */
  readonly abzug?: boolean;
}

/**
 * Was nach dem Wurf ueber einem Wuerfel steht, in Prozent der Leinwand.
 *
 * Die Augenzahl steht in jedem Fall dabei. Auf den Koerpern selbst ist sie
 * zwar zu lesen, aber nur, wenn man den richtigen Blickwinkel erwischt — bei
 * zwanzig Wuerfeln sucht man sonst. Und die Kugeln, die d100 und den eigenen
 * Wuerfel darstellen, tragen ueberhaupt keine Beschriftung.
 */
interface Marke {
  readonly nummer: number;
  readonly links: number;
  readonly oben: number;
  readonly augen: number;
  /**
   * Ob die Zahl abgezogen wird.
   *
   * In der flachen Darstellung sitzt dafuer ein Zeichen in der Ecke des
   * Wuerfels. Auf einem Koerper gibt es keine Ecke, an der es haften koennte,
   * und ohne Hinweis las sich ein Wurf wie „3d20 - 2d4" auf dem Tisch als
   * lauter Zahlen, die man zusammenzaehlt.
   */
  readonly abzug: boolean;
  readonly art: 'hoechst' | 'tiefst' | 'schlicht';
}

interface Props {
  /**
   * Die Wuerfel dieses Wurfs. Eine neue Liste startet einen neuen Wurf.
   *
   * Die Liste allein ist der Ausloeser, und das ist wichtig: zuerst gab es
   * daneben eine Wurfnummer, die beim Klick hochzaehlte. Der Wurf selbst
   * steht aber erst nach der Anzeigeverzoegerung fest, also lief die Szene
   * zweimal — einmal mit dem alten Ergebnis, einmal mit dem neuen. Die
   * Wuerfel fielen sichtbar zweimal.
   */
  readonly einwuerfe: readonly Einwurf[];
  readonly einstellungen: Einstellungen;
  /** Ob gerade gewuerfelt wird. Raeumt die Marken des vorigen Wurfs weg. */
  readonly rollt: boolean;
}

/** Wie gross die Ziffern auf den Flaechen sind, je Art. */
function zifferGroesse(art: Art): number {
  return art === 'd20' ? 0.42 : art === 'd12' ? 0.5 : 0.62;
}

export function Buehne3d({ einwuerfe, einstellungen, rollt }: Props) {
  const halter = useRef<HTMLDivElement>(null);
  /**
   * Wo Glitzer und Streifen liegen.
   *
   * Erst wenn die Wuerfel liegen: waehrend des Falls wuerden die Effekte
   * mitwandern, und ein Glitzern an einem Wuerfel, der noch rollt, sagt
   * nichts. Gerechnet wird die Bildschirmlage aus der Endlage — anders als in
   * der flachen Darstellung, wo der Effekt einfach im Wuerfel steckt.
   */
  const [marken, setMarken] = useState<Marke[]>([]);

  /*
   * Die Marken des vorigen Wurfs verschwinden, sobald gerollt wird — nicht
   * erst, wenn die neuen Wuerfel liegen. Sonst schweben die Zahlen und
   * Effekte des letzten Wurfs sekundenlang ueber Wuerfeln, die schon wieder
   * durch die Luft fliegen.
   */
  useEffect(() => {
    if (rollt) setMarken([]);
  }, [rollt]);

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
    // Ein zweites, schwaecheres Licht von der anderen Seite. Ohne es bleibt
    // die abgewandte Haelfte jedes Koerpers flach, und beim Metall — das vom
    // Glanz lebt — sah man dort ueberhaupt nichts.
    const gegenlicht = new DirectionalLight(0xffffff, 0.5);
    gegenlicht.position.set(-6, 5, -7);
    szene.add(gegenlicht);

    const vorrat = koerperVorrat();
    const material = baueMaterial(einstellungen.muster, einstellungen.farbe);
    // Je Wuerfelart ein Atlas, geteilt ueber alle Wuerfel dieses Wurfs: die
    // zwanzig Ziffern eines d20 sind fuer alle d20 dieselben.
    const schrift = zahlenFarbe(einstellungen.farbe);
    const atlanten = new Map<Art, ZiffernAtlas>();
    const stoffe = new Map<Art, MeshBasicMaterial>();
    const zifferngeometrien: BufferGeometry[] = [];
    const atlasFuer = (art: Art) => {
      let atlas = atlanten.get(art);
      if (!atlas) {
        atlas = new ZiffernAtlas(SEITEN[art], schrift);
        atlanten.set(art, atlas);
        stoffe.set(art, ziffernMaterial(atlas));
      }
      return atlas;
    };

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
    const bereich = Math.min(benutzt + 1.1, tischFuer(einwuerfe.length) * 1.55);

    /*
     * Wie weit die Kamera weg muss, damit dieser Bereich hineinpasst.
     *
     * Eine feste Entfernung passt nur zu einem Seitenverhaeltnis. Steht das
     * Fenster hochkant, ist der waagerechte Sichtwinkel enger als der
     * senkrechte, und die Wuerfel am Rand liegen ausserhalb des Bildes —
     * genau das war zu sehen. Massgeblich ist deshalb der engere der beiden.
     */
    const stelleKameraAuf = (breiteJetzt: number, hoeheJetzt: number) => {
      const halbSenkrecht = ((FELD / 2) * Math.PI) / 180;
      const halbWaagerecht = Math.atan(Math.tan(halbSenkrecht) * (breiteJetzt / hoeheJetzt));
      const enger = Math.min(halbSenkrecht, halbWaagerecht);
      const abstand = bereich / Math.tan(enger);
      kamera.position.set(mitteX, abstand * 0.82, mitteZ + abstand * 0.57);
      kamera.lookAt(mitteX, 0, mitteZ);
    };
    stelleKameraAuf(breite, hoehe);
    const netze: Mesh[] = geworfen.map((wuerfel) => {
      const koerper = vorrat(wuerfel.art);
      const netz = new Mesh(koerper.geometrie, material);
      if (wuerfel.ziffern.length > 0) {
        const atlas = atlasFuer(wuerfel.art);
        const geometrie = ziffernGeometrie(
          koerper.flaechen,
          wuerfel.ziffern,
          atlas,
          zifferGroesse(wuerfel.art)
        );
        zifferngeometrien.push(geometrie);
        netz.add(new Mesh(geometrie, stoffe.get(wuerfel.art)));
      }
      szene.add(netz);
      return netz;
    });

    // Messpunkte fuer die Rauchtests: wie lange der Wurf wirklich dauert und
    // wie viele Bilder dafuer gebraucht wurden. Im Fenster sichtbar, damit ein
    // Testskript es abfragen kann, ohne die Zeit von aussen zu schaetzen.
    const begonnen = performance.now();
    const fenster = window as unknown as { __wurf3d?: unknown; __aufbauten?: number };
    // Zaehlt, wie oft die Szene aufgebaut wurde. Zwei Aufbauten je Wurf hiess
    // frueher: die Wuerfel fallen sichtbar zweimal.
    fenster.__aufbauten = (fenster.__aufbauten ?? 0) + 1;
    fenster.__wurf3d = { laeuft: true };

    /*
     * Auf Groessenaenderungen reagieren.
     *
     * Ohne das behaelt die Leinwand ihre Punktzahl und das Seitenverhaeltnis
     * der Kamera bleibt stehen: zieht man das Fenster auf einen Bildschirm
     * mit anderer Aufloesung, staucht das Bild die Wuerfel in die Breite. Die
     * Kamera muss ausserdem neu aufgestellt werden, weil ihre Entfernung vom
     * engeren der beiden Sichtwinkel abhaengt.
     */
    const passeAn = () => {
      const neueBreite = knoten.clientWidth || breite;
      const neueHoehe = knoten.clientHeight || hoehe;
      renderer.setSize(neueBreite, neueHoehe);
      kamera.aspect = neueBreite / neueHoehe;
      stelleKameraAuf(neueBreite, neueHoehe);
      kamera.updateProjectionMatrix();
      renderer.render(szene, kamera);
    };
    const beobachter = new ResizeObserver(passeAn);
    beobachter.observe(knoten);

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

        fenster.__wurf3d = {
          laeuft: false,
          ms: Math.round(performance.now() - begonnen),
          bilder: bild,
          schritte: laenge,
          proBild,
          abgelesen
        };
        setMarken(
          geworfen.map((wuerfel, nummer) => {
            const einwurf = einwuerfe[nummer];
            const ort = wuerfel.endlage.position.clone().project(kamera);
            return {
              nummer,
              // project() liefert -1 bis 1 mit dem Ursprung in der Mitte und y
              // nach oben; die Seite rechnet in Prozent von links oben.
              links: (ort.x * 0.5 + 0.5) * 100,
              oben: (-ort.y * 0.5 + 0.5) * 100,
              augen: wuerfel.augen,
              abzug: einwurf.abzug === true,
              art: einwurf.hoechst ? 'hoechst' : einwurf.tiefst ? 'tiefst' : 'schlicht'
            };
          })
        );
      }
      bild++;
      // Nach dem Ende wird nicht weitergerechnet: die Koerper liegen, und ein
      // Bildtakt, der nichts mehr aendert, kostet nur Strom.
      if (bild * proBild < laenge) requestAnimationFrame(zeichne);
    };
    requestAnimationFrame(zeichne);

    return () => {
      laeuft = false;
      beobachter.disconnect();
      // three.js gibt Puffer nicht von selbst frei, und die Huelle laesst
      // geoeffnete Werkzeuge im Hintergrund haengen — was hier liegen bleibt,
      // bleibt bis zum Schliessen der Anwendung liegen.
      // three.js gibt Puffer nicht von selbst frei, und die Huelle laesst
      // geoeffnete Werkzeuge im Hintergrund haengen — was hier liegen bleibt,
      // bleibt bis zum Schliessen der Anwendung liegen. Die Geometrien der
      // Koerper gehoeren dem Vorrat und werden geteilt; freigegeben wird nur,
      // was diese Szene selbst angelegt hat: die Ziffernschilder.
      // three.js gibt Puffer nicht von selbst frei, und die Huelle laesst
      // geoeffnete Werkzeuge im Hintergrund haengen — was hier liegen bleibt,
      // bleibt bis zum Schliessen der Anwendung liegen. Die Geometrien der
      // Koerper gehoeren dem Vorrat und werden ueber Wuerfe hinweg geteilt;
      // freigegeben wird, was diese Szene selbst angelegt hat.
      for (const netz of netze) {
        szene.remove(netz);
      }
      for (const geometrie of zifferngeometrien) geometrie.dispose();
      for (const stoff of stoffe.values()) stoff.dispose();
      for (const atlas of atlanten.values()) atlas.freigeben();
      atlanten.clear();
      stoffe.clear();
      material.dispose();
      if (material.map) material.map.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Nur diese beiden: `einwuerfe` ist bei jedem Wurf ein neues Feld und
    // damit der Ausloeser, `einstellungen` bringt Farbe und Muster mit. Eine
    // dritte Abhaengigkeit hatte die Szene zweimal je Wurf aufgebaut.
  }, [einwuerfe, einstellungen]);

  // Zahlen und Effekte liegen als eigene Elemente ueber der Leinwand und nicht
  // in der Szene: als Lichter oder Nebel gerechnet kosteten sie bei jedem
  // Bild, hier kosten sie nichts, solange sie fehlen.
  return (
    <div className="buehne3d" ref={halter}>
      {marken.map((marke) => (
        <span
          key={marke.nummer}
          className={`marke3d marke3d--${marke.art} ${marke.abzug ? 'marke3d--abzug' : ''}`}
          style={{ left: `${marke.links}%`, top: `${marke.oben}%` }}
        >
          {marke.art === 'hoechst' ? (
            <span className="glitzer glitzer--frei" aria-hidden="true">
              <span className="glitzer__funke" style={{ left: '10%', top: '15%' }} />
              <span className="glitzer__funke" style={{ left: '80%', top: '10%', animationDelay: '120ms' }} />
              <span className="glitzer__funke" style={{ left: '88%', top: '62%', animationDelay: '260ms' }} />
              <span className="glitzer__funke" style={{ left: '16%', top: '74%', animationDelay: '190ms' }} />
              <span className="glitzer__funke" style={{ left: '50%', top: '-4%', animationDelay: '330ms' }} />
            </span>
          ) : null}
          {marke.art === 'tiefst' ? (
            <span className="streifen streifen--frei" aria-hidden="true">
              <span className="streifen__linie" />
              <span className="streifen__linie" />
              <span className="streifen__linie" />
              <span className="streifen__linie" />
            </span>
          ) : null}
          {/* Das Minus steht am Zeichen und nicht als eigenes Element: „−7"
              liest sich als ein Wert, ein Zeichen daneben als zwei Dinge. */}
          <span className="marke3d__zahl">
            {marke.abzug ? '\u2212' : ''}
            {marke.augen}
          </span>
        </span>
      ))}
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
