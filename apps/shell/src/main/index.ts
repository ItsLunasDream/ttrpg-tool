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
import {
  readWindowState,
  writeWindowState,
  writeWindowStateSync,
  MIN_WIDTH,
  MIN_HEIGHT,
  type WindowState
} from './windowState';

const devServerUrl = process.env.SHELL_DEV_SERVER_URL;

let fenster: BaseWindow | null = null;
let huelle: WebContentsView | null = null;
let zustandsDatei = '';
/** Zeitgeber, der das Speichern der Fensterlage buendelt. */
let speicherZeitgeber: NodeJS.Timeout | null = null;

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
  fenster.on('close', () => {
    if (speicherZeitgeber) clearTimeout(speicherZeitgeber);
    const zustand = aktuelleLage();
    if (zustand) writeWindowStateSync(zustandsDatei, zustand);
  });

  fenster.on('closed', () => {
    fenster = null;
    huelle = null;
    if (process.platform !== 'darwin') app.quit();
  });

  if (zustand.maximized) fenster.maximize();
  fenster.show();
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
  handle('app:plattform', () => process.platform);
}

app.whenReady().then(async () => {
  registriereKanaele();
  await erzeugeFenster();
  app.on('activate', () => {
    if (!fenster) void erzeugeFenster();
  });
});
