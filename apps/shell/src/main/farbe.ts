/**
 * Das Farbthema in die Ansichten bringen — die der Huelle eingeschlossen.
 *
 * Der naheliegende Weg waere, jedem Werkzeug ein paar Zeilen mitzugeben, die
 * die Farben am Wurzelelement setzen. Das waeren neun Kopien derselben
 * Schleife — genau die Sorte Doppelung, gegen die `packages/farben`
 * ueberhaupt angetreten ist.
 *
 * Stattdessen spritzt die Huelle eine Regel in jede Ansicht. Sie besitzt die
 * Ansichten ohnehin, und das Thema gilt fuer das ganze Fenster. Ein Werkzeug
 * muss davon nichts wissen: seine styles.css leitet ihre eigenen Namen schon
 * aus den Rollen ab und hat fuer jede einen Rueckfall.
 *
 * ZWEI DINGE, die ich erst im Rauchtest gelernt habe und die den Aufbau
 * dieser Datei erklaeren:
 *
 * 1. `insertCSS` auf einer Ansicht, die noch nichts geladen hat, loest sein
 *    Versprechen NIE ein. Ein `await` davor haelt den ganzen Start an — die
 *    Anwendung kam gar nicht mehr bis zum Fenster.
 * 2. Eingespritztes CSS ueberlebt eine Navigation nicht. Einmal vor dem
 *    Laden zu faerben waere also auch dann nutzlos, wenn es ginge.
 *
 * Deshalb: an `dom-ready` haengen und bei jedem Laden neu einspritzen.
 *
 * Die Groesse der Oberflaeche (#61) geht denselben Weg: sie gilt wie das
 * Thema fuer alle Ansichten, und dieselbe Liste der lebenden Ansichten
 * erreicht sie. Sie wird ebenfalls bei jedem Laden neu gesetzt; Chromium
 * merkt sich den Zoom zwar je Herkunft, aber darauf zu bauen hiesse, dass
 * ein Werkzeug von einem Entwicklungsserver anders aussieht als gepackt.
 */
import type { WebContents } from 'electron';
import { alsCssText, themaMit, VORGABE_THEMA } from '@suite/farben';

/** Was gerade gilt. Neue Ansichten bekommen genau das. */
let aktuell = VORGABE_THEMA;
/** Die Groesse der Oberflaeche in Prozent. */
let groesse = 100;

/** Welcher eingefuegte Block zu welcher Ansicht gehoert. */
const eingefuegt = new WeakMap<WebContents, string>();
/** Welche Ansichten schon an `dom-ready` haengen. */
const beobachtet = new WeakSet<WebContents>();
/** Die lebenden Ansichten, damit ein Wechsel alle erreicht. */
const ansichten = new Set<WebContents>();

function regel(themaId: string): string {
  const thema = themaMit(themaId);
  /*
   * `:root` und nicht `html`: dieselbe Stelle, an der die Werkzeuge ihre
   * eigenen Namen ableiten. Gleiche Spezifitaet, spaeter eingefuegt — damit
   * gewinnt diese Regel.
   *
   * `color-scheme` muss mit: daran haengt, wie das System Bildlaufleisten
   * und Auswahlfelder zeichnet. Ein helles Thema mit dunklen Leisten sieht
   * aus wie ein Fehler.
   */
  return `:root {\n${alsCssText(thema)}\ncolor-scheme: ${thema.hell ? 'light' : 'dark'};\n}`;
}

function zoome(webContents: WebContents): void {
  if (webContents.isDestroyed()) return;
  try {
    webContents.setZoomFactor(groesse / 100);
  } catch {
    // Wie beim Einspritzen: beim naechsten `dom-ready` klappt es.
  }
}

async function spritzeEin(webContents: WebContents): Promise<void> {
  if (webContents.isDestroyed()) return;
  zoome(webContents);
  try {
    const alt = eingefuegt.get(webContents);
    // Die alte Regel muss weg, sonst stapeln sich sieben Themen uebereinander
    // und welches gewinnt, waere Zufall.
    if (alt) await webContents.removeInsertedCSS(alt);
    eingefuegt.set(webContents, await webContents.insertCSS(regel(aktuell)));
  } catch {
    // Eine Ansicht, die gerade navigiert oder schon weg ist. Beim naechsten
    // `dom-ready` klappt es, und bis dahin gilt der Rueckfall aus der
    // styles.css des Werkzeugs.
  }
}

/**
 * Faerbt diese Ansicht — jetzt und nach jedem weiteren Laden.
 *
 * Darf vor dem ersten Laden gerufen werden: dann passiert zunaechst nichts,
 * und `dom-ready` holt es nach.
 */
export function beobachteFarbe(webContents: WebContents): void {
  if (webContents.isDestroyed()) return;
  ansichten.add(webContents);
  if (!beobachtet.has(webContents)) {
    beobachtet.add(webContents);
    // Eingespritztes CSS ueberlebt eine Navigation nicht — deshalb bei
    // JEDEM Laden neu, nicht nur beim ersten.
    webContents.on('dom-ready', () => {
      // Der Schluessel gehoert zur alten Seite und ist mit ihr weg.
      eingefuegt.delete(webContents);
      void spritzeEin(webContents);
    });
    webContents.once('destroyed', () => ansichten.delete(webContents));
  }
  // Steht schon etwas, gleich faerben: `dom-ready` kam dann vor diesem Aufruf.
  if (!webContents.isLoading()) void spritzeEin(webContents);
}

/** Setzt das Thema fuer alle beobachteten Ansichten. */
export async function setzeThema(themaId: string): Promise<void> {
  aktuell = themaMit(themaId).id;
  for (const webContents of ansichten) {
    if (webContents.isDestroyed()) ansichten.delete(webContents);
    else await spritzeEin(webContents);
  }
}

/** Setzt die Groesse fuer alle beobachteten Ansichten, in Prozent. */
export function setzeGroesse(prozent: number): void {
  groesse = prozent;
  for (const webContents of ansichten) {
    if (webContents.isDestroyed()) ansichten.delete(webContents);
    else zoome(webContents);
  }
}

/** Die Groesse, die gerade gilt, in Prozent. */
export function gewaehlteGroesse(): number {
  return groesse;
}

/** Was gerade gilt — fuer eine Ansicht, die erst noch dazukommt. */
export function gewaehltesThema(): string {
  return aktuell;
}
