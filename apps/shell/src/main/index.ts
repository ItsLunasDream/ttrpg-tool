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
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { berechneAppFlaeche } from '../shared/apps';
import { mountApp, registerSchemes, type MontierteApp } from './apps';
import { readSettings, writeSettings, type ShellSettings } from './settings';
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
/** Zeitgeber, der das Speichern der Fensterlage buendelt. */
let speicherZeitgeber: NodeJS.Timeout | null = null;
/** Wird gesetzt, sobald die Anwendungen ihr Ungespeichertes gesichert haben. */
let darfSchliessen = false;

/**
 * Legt die Huellenansicht auf die volle Fenstergroesse.
 *
 * Auch wenn eine Anwendung eingebettet ist, bleibt die Huelle so gross: sie
 * wird dann nur groesstenteils verdeckt. Dadurch bleibt ihr Layout stabil,
 * statt bei jedem Wechsel neu umzubrechen.
 */
function legeHuelleAus(): void {
  if (!fenster || !huelle) return;
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
    void Promise.all([...offen.values()].map((montiert) => montiert.flush())).then(() => {
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

  const montiert = await mountApp(id);
  if (!montiert) {
    console.error(`[shell] Unbekanntes Werkzeug in TTRPG_TOOLS_START_APP: ${id}`);
    return;
  }
  offen.set(id, montiert);
  aktiveApp = id;
  fenster.contentView.addChildView(montiert.sicht);
  legeHuelleAus();
  montiert.sicht.setVisible(true);
  montiert.sicht.webContents.focus();
  huelle?.webContents.send('app:gestartet-mit', id);
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

  handle('einstellungen:lesen', () => readSettings(einstellungsDatei));
  /**
   * Schreibt die Einstellungen und gibt zurueck, was danach gilt.
   *
   * Die Antwort ist nicht die Eingabe: `writeSettings` raeumt ungueltige
   * Werte weg, und die Oberflaeche soll den bereinigten Stand anzeigen statt
   * eines, den es so nicht gibt.
   */
  handle('einstellungen:schreiben', async (_event, neu: ShellSettings) => {
    await writeSettings(einstellungsDatei, neu);
    return readSettings(einstellungsDatei);
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
  handle('app:zeigen', async (_event, id: string) => {
    if (!fenster) return false;

    verbergeAlle();
    aktiveApp = id;

    let montiert = offen.get(id);
    if (!montiert) {
      montiert = (await mountApp(id)) ?? undefined;
      if (!montiert) return false;
      offen.set(id, montiert);
      fenster.contentView.addChildView(montiert.sicht);
    }

    // Nach dem Wechsel neu auslegen: das Fenster kann seit dem letzten Mal
    // eine andere Groesse haben.
    legeHuelleAus();
    montiert.sicht.setVisible(true);
    // Ohne das behielte die Huelle die Tastatur, und Tippen im Editor kaeme
    // nicht an.
    montiert.sicht.webContents.focus();
    return true;
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
    legeHuelleAus();
    montiert.sicht.setVisible(true);
    montiert.sicht.webContents.focus();
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

app.whenReady().then(async () => {
  einstellungsDatei = join(app.getPath('userData'), 'einstellungen.json');
  // Einmal anlegen, wenn es sie noch nicht gibt. Zwei Gruende: wer nachsehen
  // will, was sich einstellen laesst, findet die Datei, statt raten zu
  // muessen — und sie ist der Beleg dafuer, dass der Hauptprozess bis hierher
  // gekommen ist. Die Pruefung des gepackten Pakets wartet darauf.
  await writeSettings(einstellungsDatei, await readSettings(einstellungsDatei));
  registriereKanaele();
  await erzeugeFenster();
  app.on('activate', () => {
    if (!fenster) void erzeugeFenster();
  });
});
