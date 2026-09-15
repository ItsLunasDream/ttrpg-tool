/**
 * Hauptprozess der Huelle.
 *
 * Aufbau: ein rahmenloses `BaseWindow`. Darin liegt zuunterst die Ansicht mit
 * der Huelle selbst (Titelleiste, Startmenue, Schiene). Sie belegt das ganze
 * Fenster. Sobald ein Werkzeug eingebettet wird, kommt dessen Ansicht
 * *darueber* und laesst oben und links genau so viel frei, wie Titelleiste und
 * Schiene brauchen — die Huelle schaut also als L-Form darunter hervor.
 *
 * Warum so und nicht die Huelle in mehreren Ansichten: eine Ansicht ist immer
 * ein Rechteck. Eine L-Form liesse sich nur aus zwei Ansichten bauen, die dann
 * zwei getrennte Dokumente waeren und ihren Zustand ueber IPC abgleichen
 * muessten. Eine Ansicht, teilweise verdeckt, ist der einfachere Weg zum
 * gleichen Bild.
 *
 * In diesem Bauabschnitt wird noch keine Anwendung eingebettet; die Huelle
 * steht fuer sich. Die Aufteilung ist aber schon so angelegt, dass das
 * Einbetten spaeter nichts daran umstellt.
 */
import { app, BaseWindow, WebContentsView, ipcMain, screen, shell, type IpcMainInvokeEvent } from 'electron';
/**
 * Startzeit messen, wenn TTRPG_TOOLS_STARTZEIT gesetzt ist.
 *
 * Gebaut, weil die Frage „warum dauert der Start so lange?\" von einem
 * Windows-Rechner kam und hier keiner steht. Geraten haette ich dabei mit
 * hoher Wahrscheinlichkeit daneben: hier unter Linux vergehen bis zum
 * Startmenue rund eine halbe Sekunde, und davon entfaellt fast nichts auf
 * den eigenen Code.
 *
 * Kostet im Normalfall nichts: ohne die Variable wird nur eine Zahl
 * abgelegt und nie wieder angesehen.
 */
const START_GEMESSEN = Boolean(process.env.TTRPG_TOOLS_STARTZEIT);
const startBeginn = Date.now() - Math.round(process.uptime() * 1000);
const startMarken: [string, number][] = [];

function startMarke(was: string): void {
  if (!START_GEMESSEN) return;
  startMarken.push([was, Date.now()]);
}

function startBericht(): void {
  if (!START_GEMESSEN || startMarken.length === 0) return;
  console.log('[shell] Startzeit:');
  let vorher = startBeginn;
  for (const [was, zeit] of startMarken) {
    console.log(`  ${String(zeit - vorher).padStart(6)} ms   ${was}`);
    vorher = zeit;
  }
  console.log(`  ${String(Date.now() - startBeginn).padStart(6)} ms   GESAMT`);
}
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { berechneAppFlaeche } from '../shared/apps';
import { mountApp, registerSchemes, type MontageHaken, type MontierteApp } from './apps';
import { brichFahrtAb, fahreEin } from './fahrt';
import {
  DEFAULT_SETTINGS,
  ohneSchluessel,
  readSettings,
  writeSettings,
  type ShellSettings
} from './settings';
import { anbieterAus, entschluessle, verschluessle } from './ki';
import {
  leseSymbole,
  mitgelieferterOrdner,
  richteSymbolOrdnerEin,
  symbolOrdner
} from './symbole';
import { findeKiUebernahme } from './kiUebernahme';
import { translate } from '../shared/i18n';
import type { Language } from '../shared/i18n';
import {
  readWindowState,
  writeWindowState,
  writeWindowStateSync,
  MIN_WIDTH,
  MIN_HEIGHT,
  type WindowState
} from './windowState';

const devServerUrl = process.env.SHELL_DEV_SERVER_URL;

// Muss vor app.whenReady stehen: danach nimmt Electron keine Schemata mehr
// an, und die eingebetteten Anwendungen koennten ihre Bilder nicht liefern.
registerSchemes();

let fenster: BaseWindow | null = null;
let huelle: WebContentsView | null = null;
/**
 * Die bereits geoeffneten Anwendungen, nach ID.
 *
 * Sie bleiben geladen, wenn man wegwechselt, und werden nur unsichtbar
 * gestellt. Das ist der Grund, warum ein Wechsel nichts verliert: eine
 * halb getippte Notiz, die Scrollposition, ein offener Dialog stehen beim
 * Zurueckkommen noch da. Der Preis ist Arbeitsspeicher — gemessen rund
 * 130 MB je zusaetzlich geoeffneter Anwendung.
 */
const offen = new Map<string, MontierteApp>();
/**
 * Welche Anwendung gerade vorn liegt, oder `null` im Startmenue.
 *
 * Gebraucht, weil die Huelle sie zwischendurch verdecken muss: ihre Dialoge
 * liegen in *ihrer* Ansicht, und die liegt unter den Anwendungen. Ohne das
 * zeitweilige Verbergen stuende ein geoeffneter Dialog im DOM, waere aber
 * hinter der Anwendung nicht zu sehen.
 */
let aktiveApp: string | null = null;
let zustandsDatei = '';
let einstellungsDatei = '';
/**
 * Die Einstellungen, wie sie zuletzt auf der Platte standen.
 *
 * Gebraucht, weil die KI-Quelle synchron antworten muss: die eingebetteten
 * Anwendungen fragen sie mitten im Bearbeiten einer Anfrage, und dort auf
 * eine Datei zu warten waere eine Verzoegerung ohne Gegenwert. Geschrieben
 * wird weiterhin ueber `writeSettings`; hier steht nur die Kopie.
 */
let gemerkteEinstellungen: ShellSettings = DEFAULT_SETTINGS;
/** Zeitgeber, der das Speichern der Fensterlage buendelt. */
let speicherZeitgeber: NodeJS.Timeout | null = null;
/** Wird gesetzt, sobald die Anwendungen ihr Ungespeichertes gesichert haben. */
let darfSchliessen = false;
/**
 * Ob das System weniger Bewegung wuenscht.
 *
 * Der Hauptprozess kann `prefers-reduced-motion` nicht selbst lesen — das ist
 * eine Frage an die Darstellung, nicht an das Betriebssystem, und es gibt
 * dafuer keine Electron-API. Die Oberflaeche der Huelle fragt es ueber
 * `matchMedia` ab und meldet es hierher, beim Start und bei jeder Aenderung.
 * Bis die erste Meldung da ist, wird animiert; das ist die haeufigere
 * Einstellung, und die Huelle traegt in dieser Zeit ohnehin nur ihr
 * Startmenue.
 */
let wenigerBewegung = false;

/**
 * Legt die Huellenansicht auf die volle Fenstergroesse.
 *
 * Auch wenn eine Anwendung eingebettet ist, bleibt die Huelle so gross: sie
 * wird dann nur groesstenteils verdeckt. Dadurch bleibt ihr Layout stabil,
 * statt bei jedem Wechsel neu umzubrechen.
 */
function legeHuelleAus(): void {
  if (!fenster || !huelle) return;
  // Eine laufende Fahrt setzt gleich wieder ihre eigenen Bounds. Wird das
  // Fenster waehrenddessen umgestellt, muss sie weichen — sonst zoege die
  // Fahrt die Ansicht auf die alte Groesse zurueck.
  brichFahrtAb();
  const { width, height } = fenster.getContentBounds();
  huelle.setBounds({ x: 0, y: 0, width, height });

  // Die Anwendungen liegen darueber und lassen Titelleiste und Schiene frei.
  // Auch die unsichtbaren werden mitgelegt: sonst stuenden sie beim naechsten
  // Hervorholen in der Groesse von vorletzter Woche da und muessten erst
  // umbrechen.
  const flaeche = berechneAppFlaeche(width, height);
  for (const montiert of offen.values()) {
    montiert.sicht.setBounds(flaeche);
  }
}

/**
 * Holt eine Anwendung nach vorn und laesst sie dabei einfahren.
 *
 * Die Fahrt gehoert zum Wechsel des Werkzeugs, nicht zu jedem
 * Sichtbarmachen: kommt eine Anwendung nach dem Schliessen eines Dialogs
 * zurueck, ist sie nicht *neu* da, und eine Bewegung waere dort nur Unruhe.
 */
function holeNachVorn(montiert: MontierteApp, mitFahrt: boolean): void {
  if (!fenster) return;
  legeHuelleAus();
  montiert.sicht.setVisible(true);
  if (mitFahrt) {
    const { width, height } = fenster.getContentBounds();
    fahreEin(montiert.sicht, berechneAppFlaeche(width, height), wenigerBewegung);
  }
  // Ohne das behielte die Huelle die Tastatur, und Tippen im Editor kaeme
  // nicht an.
  montiert.sicht.webContents.focus();
}

/**
 * Fragt jede offene Anwendung, ob geschlossen werden darf.
 *
 * Der Reihe nach und nicht nebenlaeufig: jede kann einen Dialog aufmachen,
 * und zwei gleichzeitig waeren nicht zu bedienen. Sagt eine nein, wird sofort
 * abgebrochen — die uebrigen werden dann gar nicht erst gefragt, sonst
 * beantwortete man Fragen zu einem Schliessen, das schon abgesagt ist.
 */
async function frageAlleVorDemSchliessen(): Promise<boolean> {
  for (const montiert of offen.values()) {
    if (!montiert.darfSchliessen) {
      await montiert.flush();
      continue;
    }
    // Die fragende Anwendung nach vorn holen, sonst zeigt der Dialog auf ein
    // Werkzeug, das gar nicht zu sehen ist.
    if (fenster && montiert.id !== aktiveApp) {
      verbergeAlle();
      aktiveApp = montiert.id;
      holeNachVorn(montiert, false);
    }
    if (!fenster) return true;
    if (!(await montiert.darfSchliessen(fenster))) return false;
  }
  return true;
}

function merkeFensterlage(): void {
  if (!fenster) return;
  if (speicherZeitgeber) clearTimeout(speicherZeitgeber);
  // Beim Ziehen feuert `resize` dutzendfach pro Sekunde. Ungebuendelt
  // schriebe das die Datei staendig neu.
  speicherZeitgeber = setTimeout(() => {
    const zustand = aktuelleLage();
    if (zustand) void writeWindowState(zustandsDatei, zustand);
  }, 400);
}

/** Stellt alle eingebetteten Anwendungen unsichtbar. */
function verbergeAlle(): void {
  for (const montiert of offen.values()) {
    montiert.sicht.setVisible(false);
  }
}

/**
 * Was eine Anwendung beim Montieren braucht: die aktuelle Sammlungssprache,
 * und einen Weg, eine eigene Aenderung zu melden.
 *
 * `herkunft` ist die ID der Anwendung selbst — kommt eine Aenderung von dort
 * zurueck, muss sie nicht noch einmal informiert werden.
 */
/**
 * Sagt allen offenen Werkzeugen, dass sich die KI-Einstellung geaendert hat.
 *
 * Auch dem, in dem gerade gearbeitet wird: anders als bei der Sprache gibt es
 * hier keine "Ursprungs"-Anwendung, die schon Bescheid wuesste — eingestellt
 * wird die KI immer in der Huelle.
 */
/** Die Anwendung meldet, wo sie steht. Die Oberflaeche fuehrt den Verlauf. */
function meldeOrt(appId: string, ort: string | null): void {
  huelle?.webContents.send('verlauf:ort', appId, ort);
}

/** Zurueck oder vorwaerts an die Oberflaeche der Huelle. */
function meldeVerlauf(richtung: 'zurueck' | 'vorwaerts'): void {
  huelle?.webContents.send('verlauf:befehl', richtung);
}

function meldeKiWechsel(): void {
  for (const montiert of offen.values()) montiert.meldeKiWechsel?.();
}

/**
 * Ein Kartenname, der auf den Karteneditor wartet.
 *
 * Die Inspirationshilfe stoesst „Karte anlegen" an; der Karteneditor muss
 * dafuer erst montiert, geladen und sichtbar sein. Bis dahin liegt der Name
 * hier. Zugestellt wird er am Ende von `app:zeigen` — und danach vergessen,
 * damit der naechste Wechsel von Hand nicht noch einmal eine leere Karte
 * beginnt.
 */
let wartendeKarte: { name: string; notizen: readonly { title: string; text: string }[] } | null =
  null;

/**
 * Holt den Karteneditor nach vorn und beginnt dort eine leere Karte.
 *
 * Der Wechsel laeuft ueber die Oberflaeche der Huelle und nicht am
 * Hauptprozess vorbei: nur sie kennt ihren Verlauf, ihre Schiene und die
 * Animation. Ohne das saehe man die Ansicht wechseln, waehrend die Schiene
 * weiter das alte Werkzeug markiert.
 */
async function oeffneKarteImEditor(
  name: string,
  notizen: readonly { title: string; text: string }[] = []
): Promise<boolean> {
  const sauber = name.trim();
  if (!sauber || !huelle) return false;
  wartendeKarte = { name: sauber, notizen };
  huelle.webContents.send('app:oeffne', 'mapmaker');

  // Steht er schon vorn, kommt kein Wechsel mehr — dann jetzt zustellen.
  if (aktiveApp === 'mapmaker') {
    const montiert = offen.get('mapmaker');
    if (montiert?.neueKarte && montiert.istGeladen()) {
      montiert.neueKarte(sauber, notizen);
      wartendeKarte = null;
    }
  }
  return true;
}

function montageHaken(herkunft: string, sprache: Language): MontageHaken {
  return {
    language: sprache,
    onLanguageChange: (language) => void aktualisiereSammlungssprache(language, herkunft),
    // Meldet der Oberflaeche, dass sich in einer ANDEREN Anwendung etwas
    // getan hat. Die Huelle laesst dann eine Farbe ueber deren Symbol
    // wischen — einheitlich fuer alle Werkzeuge, gleich wer es ausloest.
    onEreignis: (appId) => huelle?.webContents.send('app:ereignis', appId),
    onOrt: (ort) => meldeOrt(herkunft, ort),
    // Die KI wird einmal in der Huelle eingerichtet und hier durchgereicht.
    // Bei jedem Aufruf frisch gelesen: wer sie umstellt, soll das im
    // naechsten Klick merken und nicht erst nach einem Neustart.
    kiQuelle: () => ({
      einstellungen: gemerkteEinstellungen.ki,
      schluessel: entschluessle(gemerkteEinstellungen.claudeSchluessel)
    }),
    oeffneKarte: oeffneKarteImEditor
  };
}

/**
 * Die eine Stelle, an der die Sprache der Sammlung geaendert wird.
 *
 * Gerufen wird sie aus zwei Richtungen: wenn jemand sie in den Einstellungen
 * der Huelle umstellt, und wenn eine der eingebetteten Anwendungen sie ueber
 * ihr eigenes Sprachmenue umstellt. Beide Richtungen laufen hier zusammen und
 * fuehren zu demselben Ergebnis — genau das war die Anforderung: eine
 * Aenderung an irgendeiner Stelle soll ueberall ankommen.
 *
 * `herkunft` bekommt die Aenderung nicht noch einmal geschickt: sie weiss es
 * ja schon, sie hat sie ausgeloest. Fuer die Huelle selbst (Aenderung im
 * Einstellungen-Dialog) ist das `null` — dort gibt es keine `offen`-Anwendung,
 * die sich selbst meldet.
 */
async function aktualisiereSammlungssprache(language: Language, herkunft: string | null): Promise<void> {
  const aktuell = await readSettings(einstellungsDatei);
  if (aktuell.language === language) return;
  gemerkteEinstellungen = { ...aktuell, language };
  await writeSettings(einstellungsDatei, gemerkteEinstellungen);

  // Die Oberflaeche der Huelle selbst (Titelleiste, Startmenue, Schiene, die
  // Einstellungen, falls sie gerade offen sind) muss ebenfalls nachziehen.
  huelle?.webContents.send('einstellungen:sprache-extern', language);

  for (const [id, montiert] of offen) {
    if (id === herkunft) continue;
    void montiert.setLanguage?.(language);
  }
}

/** Die Lage, wie sie gemerkt werden soll — oder `null`, wenn kein Fenster da ist. */
function aktuelleLage(): WindowState | null {
  if (!fenster) return null;
  const maximized = fenster.isMaximized();
  // Im maximierten Zustand die normale Groesse behalten, sonst startet das
  // Fenster nach dem Wiederherstellen bildschirmfuellend "klein".
  const bounds = maximized ? fenster.getNormalBounds() : fenster.getBounds();
  return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, maximized };
}

async function erzeugeFenster(): Promise<void> {
  zustandsDatei = join(app.getPath('userData'), 'fenster.json');
  const zustand = await readWindowState(
    zustandsDatei,
    screen.getAllDisplays().map((d) => d.workArea)
  );

  fenster = new BaseWindow({
    x: zustand.x,
    y: zustand.y,
    width: zustand.width,
    height: zustand.height,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    frame: false,
    backgroundColor: '#14161c',
    show: false,
    title: 'TTRPG-Tools'
  });

  huelle = new WebContentsView({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  /*
   * Die Daumentasten der Maus.
   *
   * Unter Windows meldet das Fenster sie als `app-command`, unabhaengig
   * davon, welche Ansicht gerade den Fokus hat — genau das wird hier
   * gebraucht, denn meistens liegt eine eingebettete Anwendung vorn.
   *
   * Unter Linux und macOS gibt es dieses Ereignis nicht. Dort greift bisher
   * nur Alt und Pfeiltaste, solange die Huelle den Fokus hat; die Tasten in
   * den eingebetteten Anwendungen muessen dort einzeln weitergereicht
   * werden. Ausgeliefert wird Windows.
   */
  fenster.on('app-command', (_ereignis: unknown, befehl: string) => {
    if (befehl === 'browser-backward') meldeVerlauf('zurueck');
    else if (befehl === 'browser-forward') meldeVerlauf('vorwaerts');
  });

  fenster.contentView.addChildView(huelle);
  legeHuelleAus();

  // Die Huelle laedt nur ihr eigenes Dokument. Alles andere — ein Link in
  // einem Text, ein umgeleiteter Aufruf — verlaesst die Anwendung und gehoert
  // in den Browser des Systems, nicht in dieses Fenster.
  huelle.webContents.on('will-navigate', (event, url) => {
    if (devServerUrl && url.startsWith(devServerUrl)) return;
    event.preventDefault();
    const ziel = new URL(url);
    if (ziel.protocol === 'http:' || ziel.protocol === 'https:') void shell.openExternal(ziel.href);
  });
  huelle.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (devServerUrl) {
    await huelle.webContents.loadURL(devServerUrl);
  } else {
    await huelle.webContents.loadFile(join(__dirname, '../renderer/index.html'));
  }

  fenster.on('resize', () => {
    legeHuelleAus();
    merkeFensterlage();
  });
  fenster.on('move', merkeFensterlage);
  fenster.on('maximize', () => {
    merkeFensterlage();
    huelle?.webContents.send('fenster:zustand', { maximiert: true });
  });
  fenster.on('unmaximize', () => {
    merkeFensterlage();
    huelle?.webContents.send('fenster:zustand', { maximiert: false });
  });
  // `window-all-closed` feuert fuer BrowserWindow. Diese Huelle benutzt ein
  // BaseWindow, deshalb wird das Beenden hier von Hand ausgeloest — sonst
  // laeuft der Prozess nach dem Schliessen unsichtbar weiter.
  // Beim Schliessen ein letztes Mal, und zwar blockierend: ein noch
  // ausstehender Zeitgeber kaeme nach dem Ende des Prozesses nicht mehr zum
  // Zug. Ohne das ginge die Lage verloren, wenn jemand das Fenster zieht und
  // sofort schliesst — oder es nie bewegt und trotzdem eine Lage erwartet.
  fenster.on('close', (event: Electron.Event) => {
    if (speicherZeitgeber) clearTimeout(speicherZeitgeber);
    const zustand = aktuelleLage();
    if (zustand) writeWindowStateSync(zustandsDatei, zustand);

    // Den eingebetteten Anwendungen Gelegenheit geben, Ungespeichertes zu
    // sichern. Das geht nur asynchron, das Schliessen wird deshalb einmal
    // aufgehalten und danach wiederholt. `darfSchliessen` verhindert, dass
    // sich das im Kreis dreht.
    if (darfSchliessen || offen.size === 0) return;
    event.preventDefault();
    void frageAlleVorDemSchliessen().then((erlaubt) => {
      // Abgebrochen: das Fenster bleibt offen, und `darfSchliessen` bleibt
      // falsch, damit der naechste Versuch wieder fragt.
      if (!erlaubt) return;
      darfSchliessen = true;
      fenster?.close();
    });
  });

  fenster.on('closed', () => {
    fenster = null;
    huelle = null;
    if (process.platform !== 'darwin') app.quit();
  });

  if (zustand.maximized) fenster.maximize();
  fenster.show();

  await starteMitWerkzeug();
}

/**
 * Zeile, mit der die Startfolge meldet, dass das vorgeoeffnete Werkzeug steht.
 * Wird von apps/shell/scripts/verify-package.mjs gelesen — wer sie aendert,
 * aendert sie dort mit.
 */
const BEREIT_MARKE = '[shell] bereit-mit';

/**
 * Oeffnet beim Start gleich ein Werkzeug, wenn TTRPG_TOOLS_START_APP eine ID
 * nennt.
 *
 * Gedacht fuer zweierlei: eine Verknuepfung, die direkt in einem bestimmten
 * Werkzeug landet — und die Pruefung des gepackten Pakets, die sonst nur
 * feststellen koennte, dass die Huelle hochkommt. Ob die Anwendungen darin
 * *auch* laden, haengt an Pfaden, die im Paket anders sind als im Workspace;
 * ohne diesen Weg klickt dort niemand auf eine Kachel, und ein falscher Pfad
 * zeigte sich erst der Person, die das Paket benutzt.
 */
async function starteMitWerkzeug(): Promise<void> {
  const id = process.env.TTRPG_TOOLS_START_APP;
  if (!id || !fenster) return;

  const einstellungen = await readSettings(einstellungsDatei);
  const montiert = await mountApp(id, montageHaken(id, einstellungen.language));
  if (!montiert) {
    console.error(`[shell] Unbekanntes Werkzeug in TTRPG_TOOLS_START_APP: ${id}`);
    return;
  }
  await montiert.nachladen();
  offen.set(id, montiert);
  aktiveApp = id;
  fenster.contentView.addChildView(montiert.sicht);
  // Ohne Fahrt: hier wird nicht gewechselt, hier faengt alles an. Eine
  // Bewegung beim allerersten Bild sieht nach Ladehemmung aus.
  holeNachVorn(montiert, false);
  huelle?.webContents.send('app:gestartet-mit', id);
  // Erst hier ist das Werkzeug wirklich geladen und sichtbar — `mountApp`
  // wartet auf `loadFile`. Die Pruefung des gepackten Pakets beendet den
  // Prozess, sobald sie ihr Signal sieht; nimmt sie ein frueheres (die
  // Einstellungsdatei, spaeter der Speicherort des Werkzeugs), trifft sie
  // mitten ins Laden, und `loadFile` bricht mit ERR_FAILED ab. Zweimal
  // dieselbe Falle, beim zweiten Mal nur eine Stufe spaeter. Ein Signal muss
  // *nach* dem stehen, was es bezeugt.
  console.log(`${BEREIT_MARKE} ${id}`);
}

/**
 * Die Fassung dieser Anwendung.
 *
 * Nicht `app.getVersion()`: das liefert ausserhalb eines gepackten Pakets die
 * Fassung von Electron, nicht die eigene — in der Entwicklung stand deshalb
 * „Fassung 33.4.11" im Startmenue. Gelesen wird die package.json, die
 * electron-builder ohnehin mit ins Paket legt.
 */
function eigeneFassung(): string {
  try {
    const datei = join(__dirname, '..', '..', 'package.json');
    const inhalt = JSON.parse(readFileSync(datei, 'utf8')) as { version?: string };
    return inhalt.version ?? app.getVersion();
  } catch {
    return app.getVersion();
  }
}

/** Registriert einen Kanal und faengt Fehler ab, statt sie zum Renderer zu werfen. */
function handle<T>(kanal: string, fn: (event: IpcMainInvokeEvent, ...args: any[]) => T | Promise<T>): void {
  ipcMain.handle(kanal, async (event, ...args) => fn(event, ...args));
}

/**
 * Was aus `app:zeigen` zurueckkommt.
 *
 * Bewusst kein `boolean` mehr: „falsch" beantwortete zwei ganz verschiedene
 * Fragen — „dieses Werkzeug gibt es noch nicht" und „es ist kaputt" — und
 * die Oberflaeche zeigte fuer beide denselben Platzhalter.
 */
export type ZeigenErgebnis =
  | { zustand: 'offen' }
  | { zustand: 'nicht-einbettbar' }
  | { zustand: 'fehler'; grund: 'dateien-fehlen' | 'sonst'; detail: string };

/** Uebersetzt einen Montagefehler in etwas, das die Oberflaeche zeigen kann. */
function fehlerErgebnis(fehler: unknown): ZeigenErgebnis {
  const text = fehler instanceof Error ? fehler.message : String(fehler);
  console.error('[shell] Werkzeug liess sich nicht montieren:', fehler);
  // ERR_FILE_NOT_FOUND heisst hier immer dasselbe: die Anwendung wurde nicht
  // gebaut. Das ist der eine Fall, zu dem sich etwas Hilfreiches sagen laesst.
  const dateienFehlen = text.includes('ERR_FILE_NOT_FOUND') || text.includes('ENOENT');
  return { zustand: 'fehler', grund: dateienFehlen ? 'dateien-fehlen' : 'sonst', detail: text };
}

function registriereKanaele(): void {
  handle('fenster:minimieren', () => {
    fenster?.minimize();
  });
  handle('fenster:maximieren-umschalten', () => {
    if (!fenster) return false;
    if (fenster.isMaximized()) fenster.unmaximize();
    else fenster.maximize();
    return fenster.isMaximized();
  });
  handle('fenster:schliessen', () => {
    fenster?.close();
  });
  handle('fenster:ist-maximiert', () => fenster?.isMaximized() ?? false);
  handle('app:version', () => eigeneFassung());

  handle('einstellungen:lesen', async () => ohneSchluessel(await readSettings(einstellungsDatei)));

  /**
   * Eigene Symbole, als data:-URL je Kennung.
   *
   * Bei jedem Aufruf frisch von der Platte: wer ein Bild austauscht, drueckt
   * in den Einstellungen auf "neu laden" und will es dann auch sehen.
   */
  handle('symbole:lesen', () =>
    leseSymbole(
      app.getPath('userData'),
      // Die mitgelieferten zuerst, die eigenen stechen sie.
      mitgelieferterOrdner(app.isPackaged, process.resourcesPath)
    )
  );

  /** Oeffnet den Symbolordner im Dateimanager des Systems. */
  handle('symbole:ordner', async () => {
    const ordner = symbolOrdner(app.getPath('userData'));
    // Anlegen, falls ihn jemand geloescht hat — sonst oeffnet sich nichts
    // und es sieht aus, als sei der Knopf kaputt.
    await richteSymbolOrdnerEin(app.getPath('userData'));
    await shell.openPath(ordner);
    return ordner;
  });
  /**
   * Schreibt die Einstellungen und gibt zurueck, was danach gilt.
   *
   * Die Antwort ist nicht die Eingabe: `writeSettings` raeumt ungueltige
   * Werte weg, und die Oberflaeche soll den bereinigten Stand anzeigen statt
   * eines, den es so nicht gibt.
   */
  handle('einstellungen:schreiben', async (_event, neu: Partial<ShellSettings>) => {
    const vorher = await readSettings(einstellungsDatei);
    // Zusammengefuehrt, nicht ersetzt: die Oberflaeche schickt nur, was sie
    // geaendert hat. Wuerde das als ganze Einstellungsdatei gelten, raeumte
    // ein Sprachwechsel die KI-Einstellung weg.
    //
    // Der Schluessel kommt dabei immer aus dem Bestand, nie aus der
    // Oberflaeche: sie bekommt ihn nicht zu sehen und wuerde ihn sonst mit
    // einem leeren Feld ueberschreiben.
    await writeSettings(einstellungsDatei, {
      ...vorher,
      ...neu,
      claudeSchluessel: vorher.claudeSchluessel
    });
    const aktualisiert = await readSettings(einstellungsDatei);
    gemerkteEinstellungen = aktualisiert;
    // Die Werkzeuge fragen den KI-Zustand nur beim Laden ab. Aendert sich die
    // Einstellung hier, muessen sie es erfahren — sonst sieht man den
    // Assistenten weiter, obwohl die KI aus ist, und die Knoepfe im NPC
    // Creator fehlen, obwohl sie an ist.
    if (JSON.stringify(aktualisiert.ki) !== JSON.stringify(vorher.ki)) meldeKiWechsel();
    // Die Sprache hier zu aendern ist der Weg ueber den Einstellungen-Dialog
    // der Huelle; es gibt keine "Ursprungs"-Anwendung, die schon Bescheid
    // weiss, deshalb bekommen alle offenen Anwendungen die Meldung.
    if (aktualisiert.language !== vorher.language) {
      for (const montiert of offen.values()) void montiert.setLanguage?.(aktualisiert.language);
    }
    return ohneSchluessel(aktualisiert);
  });

  /**
   * Bereitschaft der KI.
   *
   * Der Grund wird hier uebersetzt, wo die eingestellte Sprache bekannt ist —
   * die Anbieter liefern Schluessel, keine fertigen Texte.
   */
  handle('ki:status', async () => {
    const einstellungen = await readSettings(einstellungsDatei);
    // Nicht bloss "es steht etwas in der Datei", sondern "es laesst sich
    // auch aufmachen". Ein Block aus einem anderen Konto oder von einem neu
    // aufgesetzten System ist so gut wie keiner, und die Oberflaeche soll
    // nicht "Ein Schluessel ist hinterlegt" neben "Kein API-Schluessel
    // hinterlegt" stellen.
    const hatSchluessel = Boolean(entschluessle(einstellungen.claudeSchluessel));
    const anbieter = anbieterAus(einstellungen);
    if (!anbieter) return { anbieter: 'none', bereit: false, beschreibung: '', hatSchluessel };

    const zustand = await anbieter.pruefe();
    return {
      anbieter: anbieter.id,
      bereit: zustand.bereit,
      beschreibung: zustand.bereit
        ? zustand.beschreibung
        : translate(einstellungen.language, zustand.schluessel, zustand.werte),
      hatSchluessel
    };
  });

  /** Der Schluessel wird verschluesselt abgelegt und nie zurueckgegeben. */
  handle('ki:schluessel-setzen', async (_event, schluessel: string) => {
    const verschluesselt = verschluessle(schluessel.trim());
    if (verschluesselt === null) {
      // Lieber gar nicht speichern als im Klartext. Die Oberflaeche sagt das
      // weiter, statt so zu tun, als waere es gelungen.
      throw new Error('KEIN_SCHLUESSELBUND');
    }
    const vorher = await readSettings(einstellungsDatei);
    gemerkteEinstellungen = { ...vorher, claudeSchluessel: verschluesselt };
    await writeSettings(einstellungsDatei, gemerkteEinstellungen);
    // Ein Schluessel, der dazukommt oder wegfaellt, entscheidet genauso
    // darueber, ob die KI benutzbar ist, wie der Anbieter selbst.
    meldeKiWechsel();
    return Boolean(verschluesselt);
  });

  /**
   * Zeigt eine Anwendung an und montiert sie beim ersten Mal.
   *
   * Antwortet mit `true`, wenn eine Ansicht davorliegt, und mit `false`, wenn
   * die Huelle diese Anwendung noch nicht einbetten kann. Die Oberflaeche
   * zeigt dann ihre Platzhalterflaeche weiter — sie muss dafuer wissen, ob
   * hinter ihr etwas liegt, sonst schriebe sie ihren Text unter eine
   * laufende Anwendung.
   */
  /**
   * Bringt ein Werkzeug an eine Stelle zurueck, die der Verlauf kennt.
   *
   * Nur, wenn es schon montiert ist: ein Sprung in eine Anwendung, die noch
   * gar nicht laeuft, kaeme vor ihrem ersten Zeichnen an und ginge ins
   * Leere. Die Oberflaeche zeigt sie erst, dann kommt der Sprung.
   */
  handle('verlauf:springe', async (_event, id: string, ort: string | null): Promise<boolean> => {
    const montiert = offen.get(id);
    if (!montiert?.springeZuOrt) return false;
    montiert.springeZuOrt(ort);
    return true;
  });

  handle('app:zeigen', async (_event, id: string, fruehestensMs = 0): Promise<ZeigenErgebnis> => {
    if (!fenster) return { zustand: 'nicht-einbettbar' };
    const begonnen = Date.now();

    verbergeAlle();
    aktiveApp = id;

    let montiert = offen.get(id);
    if (!montiert) {
      const einstellungen = await readSettings(einstellungsDatei);
      try {
        montiert = (await mountApp(id, montageHaken(id, einstellungen.language))) ?? undefined;
      } catch (fehler) {
        aktiveApp = null;
        return fehlerErgebnis(fehler);
      }
      if (!montiert) return { zustand: 'nicht-einbettbar' };
      // Auch eine Anwendung, deren Oberflaeche gleich nicht laedt, bleibt hier
      // stehen. Ihre Kanaele und ihr Protokoll sind angemeldet, und beides
      // laesst sich nicht ein zweites Mal anmelden — sie noch einmal zu
      // montieren scheiterte an „Failed to register protocol", und das
      // Werkzeug waere bis zum Neustart der Huelle unbrauchbar, selbst wenn
      // die fehlenden Dateien inzwischen da sind.
      offen.set(id, montiert);
      fenster.contentView.addChildView(montiert.sicht);
    }

    try {
      // Nur laden, wenn noch nichts drin ist: beim ersten Mal, oder beim
      // zweiten Versuch nach einem Fehlschlag. Bei jedem Wechsel neu zu laden
      // waere bequemer zu schreiben und falsch — es wuerfe den Zustand der
      // Anwendung weg, offene Notiz und Auswahl mitsamt. Der Rauchtest der
      // Huelle prueft genau das.
      if (!montiert.istGeladen()) await montiert.nachladen();
    } catch (fehler) {
      // Der haeufigste Grund ist banal: die Anwendung wurde nie gebaut, ihre
      // index.html gibt es nicht. Frueher warf dieser Kanal die Ablehnung bis
      // in die Oberflaeche durch, wo sie niemand auffing — die Flaeche blieb
      // beim Platzhalter stehen, und der behauptete obendrein, das Einbetten
      // sei noch gar nicht gebaut. Wer das sah, suchte den Fehler an der
      // falschen Stelle. Jetzt kommt heraus, *was* fehlt.
      montiert.sicht.setVisible(false);
      aktiveApp = null;
      return fehlerErgebnis(fehler);
    }

    /*
     * Nicht vor der Zeit hervorkommen.
     *
     * Beim Wechsel aus dem Startmenue waechst in der Huelle das Symbol ueber
     * den Schirm. Schoebe sich die Ansicht mitten hinein, sieht es aus, als
     * haette jemand die Animation abgeschnitten. Montiert und geladen wurde
     * waehrenddessen — gewartet wird nur auf den Rest.
     */
    const rest = fruehestensMs - (Date.now() - begonnen);
    if (rest > 0) await new Promise((fertig) => setTimeout(fertig, rest));

    // `holeNachVorn` legt vorher neu aus: das Fenster kann seit dem letzten
    // Mal eine andere Groesse haben.
    holeNachVorn(montiert, true);

    // Wartet ein Kartenname auf genau dieses Werkzeug, wird er jetzt
    // zugestellt — erst hier ist es geladen und kann darauf antworten.
    if (wartendeKarte && montiert.neueKarte) {
      montiert.neueKarte(wartendeKarte.name, wartendeKarte.notizen);
      wartendeKarte = null;
    }
    return { zustand: 'offen' };
  });

  /** Zurueck ins Startmenue: alle Anwendungen bleiben geladen, aber unsichtbar. */
  handle('app:startmenue', () => {
    verbergeAlle();
    aktiveApp = null;
    huelle?.webContents.focus();
  });

  /**
   * Meldet, dass ein Dialog der Huelle auf- oder zugeht.
   *
   * Solange einer offen ist, tritt die vorn liegende Anwendung zurueck —
   * sonst deckt sie den Dialog zu. Beim Schliessen kommt sie zurueck.
   */
  handle('app:dialog', (_event, offenerDialog: boolean) => {
    if (offenerDialog) {
      verbergeAlle();
      huelle?.webContents.focus();
      return;
    }
    const montiert = aktiveApp ? offen.get(aktiveApp) : undefined;
    if (!montiert) return;
    holeNachVorn(montiert, false);
  });

  /**
   * Die Oberflaeche meldet, ob das System weniger Bewegung wuenscht.
   *
   * Sie ist die einzige Stelle, die das beantworten kann: `matchMedia` gibt
   * es nur in einer Darstellung. Der Hauptprozess braucht die Auskunft fuer
   * die Einfahrt der Ansichten, die er selbst treibt.
   */
  ipcMain.on('bewegung:reduziert', (_event, reduziert: boolean) => {
    wenigerBewegung = Boolean(reduziert);
    if (wenigerBewegung) brichFahrtAb();
  });
  handle('app:plattform', () => process.platform);
  /**
   * Oeffnet eine Adresse im Browser des Systems.
   *
   * Nur http und https: `shell.openExternal` startet sonst, was auch immer das
   * System mit dem Schema verbindet — bei `file:` waere das der Dateimanager,
   * bei exotischeren Schemata Schlimmeres.
   */
  handle('app:oeffne-extern', (_event, adresse: string) => {
    if (adresse.startsWith('http://') || adresse.startsWith('https://')) {
      void shell.openExternal(adresse);
    }
  });
}

/*
 * Ein Auffangnetz im Hauptprozess.
 *
 * Ein Fehler, den niemand faengt, beendet den Prozess — und mit ihm die
 * ganze Sammlung, samt allem, was in den anderen Werkzeugen offen ist. Das
 * ist der Bericht "beim Anlegen einer Notiz stuerzt alles ab": was genau
 * schiefging, stand nirgends, weil das Fenster mit der Meldung verschwand.
 *
 * Hier wird nichts repariert. Der Fehler landet in der Konsole und in der
 * Protokolldatei des Systems, und die Anwendung bleibt stehen, damit die
 * Person speichern kann, was sie offen hat.
 */
process.on('uncaughtException', (fehler) => {
  console.error('[shell] Unbehandelter Fehler im Hauptprozess:', fehler);
});

process.on('unhandledRejection', (grund) => {
  console.error('[shell] Unbehandelte Ablehnung im Hauptprozess:', grund);
});

app.whenReady().then(async () => {
  startMarke('Electron bereit');
  einstellungsDatei = join(app.getPath('userData'), 'einstellungen.json');
  const gelesen = await readSettings(einstellungsDatei);

  // Wer die KI frueher im Story Creator eingerichtet hat, soll sie nicht
  // neu eintippen muessen — ein API-Schluessel ist nichts, was man eben
  // nachschlaegt. Passiert genau einmal: danach steht hier etwas, und die
  // Uebernahme greift nicht mehr.
  const uebernommen = await findeKiUebernahme(
    gelesen,
    join(app.getPath('userData'), 'backstory', 'settings.json')
  );
  if (uebernommen) console.log('[shell] KI-Einstellung aus dem Story Creator uebernommen');

  // Einmal anlegen, wenn es sie noch nicht gibt. Zwei Gruende: wer nachsehen
  // will, was sich einstellen laesst, findet die Datei, statt raten zu
  // muessen — und sie ist der Beleg dafuer, dass der Hauptprozess bis hierher
  // gekommen ist. Die Pruefung des gepackten Pakets wartet darauf.
  gemerkteEinstellungen = { ...gelesen, ...uebernommen };
  await writeSettings(einstellungsDatei, gemerkteEinstellungen);

  // Den Symbolordner gleich anlegen, samt Liesmich. Wer eigene Bilder
  // einsetzen will, soll den Ordner vorfinden und nicht raten muessen, wie
  // er heisst.
  await richteSymbolOrdnerEin(app.getPath('userData'));
  startMarke('Einstellungen gelesen und geschrieben');
  registriereKanaele();
  startMarke('Kanaele angemeldet');
  await erzeugeFenster();
  startMarke('Fenster steht');
  startBericht();
  app.on('activate', () => {
    if (!fenster) void erzeugeFenster();
  });
});
