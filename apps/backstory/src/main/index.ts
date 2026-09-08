/**
 * Hauptprozess des eigenstaendigen Backstory Creators.
 *
 * Das Einrichten selbst — Einstellungen, Speicherort, Protokoll, IPC — steht
 * nicht hier, sondern in `embed.ts`, und wird von der Huelle genauso
 * aufgerufen. Diese Datei kuemmert sich nur um das, was es allein zusaetzlich
 * gibt: ein eigenes Fenster, die Einzelinstanz-Sperre und das Beenden.
 */
import { app, BrowserWindow, shell } from 'electron';
import { mountBackstory, registerAssetScheme, type BackstoryEmbed } from './embed';

const devServerUrl = process.env.VITE_DEV_SERVER_URL;

// Muss vor app.whenReady stehen, sonst darf das Schema keine Bilder liefern.
registerAssetScheme();

/**
 * Nur eine Instanz. Zwei Fenster auf demselben Speicherort wuerden sich
 * gegenseitig ueberschreiben: das eine haelt eine Notiz noch im alten Stand,
 * der Autosave schreibt ihn spaeter ueber die Aenderungen des anderen.
 * Ein zweiter Start holt stattdessen das vorhandene Fenster nach vorn.
 */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [window] = BrowserWindow.getAllWindows();
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.focus();
  });
}

async function createWindow(embed: BackstoryEmbed): Promise<void> {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#16141c',
    title: 'Backstory Creator',
    webPreferences: {
      preload: embed.preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Vor dem Schliessen dem Renderer Zeit geben, Ungespeichertes zu sichern.
  // Das Warten selbst steckt in embed.flush, damit die Huelle es genauso
  // macht.
  let mayClose = false;
  window.on('close', (event) => {
    if (mayClose || window.webContents.isDestroyed()) return;
    event.preventDefault();
    void embed.flush(window.webContents).then(() => {
      mayClose = true;
      window.close();
    });
  });

  // Externe Links gehoeren in den Systembrowser, nicht in ein App-Fenster.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) void shell.openExternal(url);
    return { action: 'deny' };
  });

  // Dasselbe fuer Links, die das Fenster selbst wegnavigieren wuerden. Ohne
  // das laege auf der fremden Seite dieselbe Bruecke zum Dateisystem wie auf
  // der eigenen: die Voreinstellungen des Fensters, und damit das Preload,
  // gelten fuer alles, was darin geladen wird.
  window.webContents.on('will-navigate', (event, url) => {
    // Einzige erlaubte Navigation ist der Entwicklungsserver, der sich beim
    // Neuaufbau selbst neu laedt. Die gepackte Anwendung laedt ihre Seite
    // ueber loadFile und navigiert von sich aus nie wieder.
    if (embed.devServerUrl && url.startsWith(embed.devServerUrl)) return;

    event.preventDefault();
    const target = new URL(url);
    if (target.protocol === 'http:' || target.protocol === 'https:') void shell.openExternal(target.href);
  });

  try {
    if (embed.devServerUrl) {
      await window.loadURL(embed.devServerUrl);
      window.webContents.openDevTools({ mode: 'detach' });
    } else {
      await window.loadFile(embed.indexFile!);
    }
  } catch (error) {
    // Ein Reload waehrend des Ladens bricht die Navigation ab. Das ist kein Fehler,
    // der die App beenden sollte.
    if (!String(error).includes('ERR_ABORTED')) throw error;
  }
}

void app.whenReady().then(async () => {
  // Die zweite Instanz beendet sich gleich wieder, sie soll den Speicherort
  // gar nicht erst anfassen.
  if (!gotLock) return;

  const embed = await mountBackstory({
    userDataDir: app.getPath('userData'),
    devServerUrl
  });

  await createWindow(embed);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow(embed);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
