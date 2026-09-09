/**
 * Die Einfahrt einer eingebetteten Ansicht.
 *
 * Beim Wechsel des Werkzeugs soll die Ansicht nicht schlagartig dastehen,
 * sondern kurz hereinfahren. Ein Einblenden waere die naheliegende Wahl und
 * ist nicht moeglich: eine `WebContentsView` hat keine Opazitaet — sie kann
 * nur `setBounds`, `setVisible`, `setBackgroundColor` und `setBorderRadius`
 * (nachgesehen in electron.d.ts). Ein Ortswechsel ist alles, was bleibt.
 *
 * Dass sich das gleichmaessig treiben laesst, ist gemessen, nicht angenommen:
 * `scripts/proto-view-slide.cjs` faehrt die Ansicht und nimmt dabei den
 * Bildschirm auf. 13 Bilder in 220 ms, Abstand p50 16,5 ms, und die Kante der
 * Ansicht liegt im Foto genau dort, wo `setBounds` sie hingesetzt hat.
 */
import type { WebContentsView } from 'electron';
import { DAUER, bezier } from '@suite/motion';

export interface Flaeche {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Wie weit rechts die Ansicht startet.
 *
 * Bewusst ein kleiner Weg und nicht die volle Breite: eine Flaeche, die von
 * ganz aussen hereinfaehrt, braucht bei 220 ms eine sehr hohe Geschwindigkeit
 * und sieht nach Effekt aus. Ein kurzer Schub liest sich als „das ist jetzt
 * da", ohne dass jemand darauf wartet.
 */
const WEG = 48;

const kurve = bezier('standard');

/** Laeuft gerade eine Fahrt, wird sie beim naechsten Bild abgebrochen. */
let laufendeFahrt: { abgebrochen: boolean } | null = null;

/** Bricht eine laufende Fahrt ab. Vor jedem Wechsel aufzurufen. */
export function brichFahrtAb(): void {
  if (laufendeFahrt) laufendeFahrt.abgebrochen = true;
  laufendeFahrt = null;
}

/**
 * Faehrt die Ansicht von rechts an ihren Platz.
 *
 * Bei `reduziert` faellt die Bewegung weg und die Ansicht steht sofort — die
 * Systemeinstellung „weniger Bewegung" gilt auch fuer das, was der
 * Hauptprozess selbst treibt, nicht nur fuer CSS.
 *
 * Der Hauptprozess hat kein `requestAnimationFrame`; die Bilder haengen an
 * einem Zeitgeber. Der Fortschritt wird deshalb aus der Uhr gerechnet und
 * nicht aus der Zahl der Bilder: bleibt ein Bild aus, springt die Ansicht
 * weiter, statt die Fahrt zu verlaengern.
 */
export function fahreEin(sicht: WebContentsView, ziel: Flaeche, reduziert: boolean): void {
  brichFahrtAb();
  if (reduziert) {
    sicht.setBounds(ziel);
    return;
  }

  const marke = { abgebrochen: false };
  laufendeFahrt = marke;

  const start = Date.now();
  sicht.setBounds({ ...ziel, x: ziel.x + WEG });

  const schritt = () => {
    if (marke.abgebrochen) return;
    // Die Ansicht kann waehrend der Fahrt geschlossen worden sein.
    if (sicht.webContents.isDestroyed()) return;
    const anteil = Math.min(1, (Date.now() - start) / DAUER.ortswechsel);
    sicht.setBounds({ ...ziel, x: Math.round(ziel.x + WEG * (1 - kurve(anteil))) });
    if (anteil >= 1) {
      if (laufendeFahrt === marke) laufendeFahrt = null;
      return;
    }
    setTimeout(schritt, 16);
  };
  setTimeout(schritt, 16);
}
