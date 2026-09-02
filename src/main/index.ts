import path from 'node:path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { Vault, readSettings } from './vault';
import { registerIpc } from './ipc';
import { handleAssetProtocol, registerAssetScheme } from './assetProtocol';

const devServerUrl = process.env.VITE_DEV_SERVER_URL;

// Muss vor app.whenReady stehen, sonst darf das Schema keine Bilder liefern.
registerAssetScheme();

async function createWindow(): Promise<void> {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#16141c',
    title: 'Backstory Creator',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Vor dem Schliessen dem Renderer Zeit geben, Ungespeichertes zu sichern.
  // Ueber beforeunload geht das nicht: Electron bricht damit das Schliessen
  // ab, ohne einen Dialog zu zeigen, und das Fenster liesse sich nicht mehr
  // schliessen.
  let mayClose = false;
  window.on('close', (event) => {
    if (mayClose || window.webContents.isDestroyed()) return;
    event.preventDefault();

    const finish = () => {
      clearTimeout(timer);
      ipcMain.removeListener('app:flushed', finish);
      mayClose = true;
      window.close();
    };

    // Sicherheitsnetz: antwortet der Renderer nicht, wird trotzdem geschlossen.
    const timer = setTimeout(finish, 3000);
    ipcMain.once('app:flushed', finish);
    window.webContents.send('app:flush');
  });

  // Externe Links gehoeren in den Systembrowser, nicht in ein App-Fenster.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) void shell.openExternal(url);
    return { action: 'deny' };
  });

  try {
    if (devServerUrl) {
      await window.loadURL(devServerUrl);
      window.webContents.openDevTools({ mode: 'detach' });
    } else {
      await window.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  } catch (error) {
    // Ein Reload waehrend des Ladens bricht die Navigation ab. Das ist kein Fehler,
    // der die App beenden sollte.
    if (!String(error).includes('ERR_ABORTED')) throw error;
  }
}

void app.whenReady().then(async () => {
  const settingsFile = path.join(app.getPath('userData'), 'settings.json');
  const defaultRoot = path.join(app.getPath('userData'), 'vault');
  const settings = await readSettings(settingsFile, defaultRoot);

  const vault = new Vault(settings.vaultRoot);
  vault.setHistoryOptions({ enabled: settings.historyEnabled, maxVersions: settings.historyMaxVersions });
  await vault.init();
  handleAssetProtocol(vault);

  registerIpc({ vault, settingsFile, settings });

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
