/**
 * Die Schnittstelle, ueber die eine Huelle diese Anwendung einbettet.
 *
 * Der Backstory Creator laeuft auf zwei Wegen: allein, mit `src/main/index.ts`
 * als eigenem Hauptprozess, und eingebettet, wo die Huelle den Hauptprozess
 * stellt und diese Datei aufruft. Beide Wege benutzen denselben Code — was
 * hier passiert, passiert dort genauso, nur dass die Huelle das Fenster und
 * die Ansicht mitbringt.
 *
 * Diese Datei ist der einzige Zugang von aussen. Sie kapselt drei Dinge, die
 * sonst jeder Aufrufer selbst richtig hinbekommen muesste: die Reihenfolge
 * (Einstellungen lesen, Vault oeffnen, Protokoll anmelden, IPC
 * registrieren), die Pfade zu Preload und Oberflaeche, und das Sichern
 * ungespeicherter Aenderungen vor dem Schliessen.
 */
import path from 'node:path';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { Vault, readSettings } from './vault';
import { registerIpc } from './ipc';
import { handleAssetProtocol, registerAssetScheme } from './assetProtocol';
import { channel } from '../shared/channels';
import type { AppSettings } from '../shared/types';

export { registerAssetScheme };
export { CHANNEL_PREFIX } from '../shared/channels';

export interface BackstoryEmbedOptions {
  /**
   * Verzeichnis, in dem `settings.json` liegt und unter dem der Speicherort
   * angelegt wird, wenn in den Einstellungen keiner steht.
   *
   * Wird uebergeben und nicht selbst bei `app.getPath('userData')` erfragt:
   * die Huelle entscheidet, wo ihre Anwendungen ablegen, nicht die Anwendung.
   */
  readonly userDataDir: string;
  /** Gesetzt, wenn die Oberflaeche vom Entwicklungsserver kommen soll. */
  readonly devServerUrl?: string;
  /**
   * Verzeichnis des gebuendelten Hauptprozesses dieser Anwendung. Daneben
   * liegt `preload.js`, eine Ebene darueber die gebaute Oberflaeche.
   *
   * Muss angegeben werden, wenn diese Datei in ein anderes Buendel wandert —
   * und genau das passiert beim Einbetten: `__dirname` zeigt dann auf das
   * Verzeichnis der Huelle, nicht auf das dieser Anwendung, und die Ansicht
   * bliebe leer. Ohne Angabe gilt `__dirname`, was fuer den eigenstaendigen
   * Start richtig ist.
   */
  readonly distDir?: string;
}

export interface BackstoryEmbed {
  /** Preload-Skript, das die Ansicht laden muss. */
  readonly preloadPath: string;
  /** Datei der Oberflaeche, oder `null`, wenn stattdessen `devServerUrl` gilt. */
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly settings: AppSettings;
  readonly vault: Vault;
  /**
   * Gibt der Oberflaeche Gelegenheit, Ungespeichertes zu sichern, und wartet
   * darauf — laengstens `timeoutMs`.
   *
   * Ueber `beforeunload` geht das nicht: Electron bricht damit das Schliessen
   * ab, ohne einen Dialog zu zeigen, und das Fenster liesse sich nicht mehr
   * schliessen. Antwortet die Oberflaeche gar nicht, laeuft die Frist ab und
   * es geht trotzdem weiter — ein Fenster, das sich nicht schliessen laesst,
   * waere schlimmer als eine verlorene Sekunde Tipparbeit.
   */
  flush(webContents: WebContents, timeoutMs?: number): Promise<void>;
}

/**
 * Richtet den Backstory Creator im laufenden Hauptprozess ein und liefert,
 * was die Huelle zum Anzeigen braucht.
 *
 * Muss nach `app.whenReady()` aufgerufen werden. `registerAssetScheme()`
 * dagegen muss *davor* laufen und wird deshalb getrennt exportiert.
 */
export async function mountBackstory(options: BackstoryEmbedOptions): Promise<BackstoryEmbed> {
  const settingsFile = path.join(options.userDataDir, 'settings.json');
  const defaultRoot = path.join(options.userDataDir, 'vault');
  const settings = await readSettings(settingsFile, defaultRoot);

  const vault = new Vault(settings.vaultRoot);
  vault.setHistoryOptions({
    enabled: settings.historyEnabled,
    maxVersions: settings.historyMaxVersions
  });
  await vault.init();
  handleAssetProtocol(vault);

  registerIpc({ vault, settingsFile, settings });

  const distDir = options.distDir ?? __dirname;

  return {
    // Das Preload liegt neben dem Hauptprozess, die Oberflaeche eine Ebene
    // darueber. Die Huelle laedt das Preload dieser Anwendung, nicht ihr
    // eigenes: sonst faende die Oberflaeche ihre Bruecke nicht.
    preloadPath: path.join(distDir, 'preload.js'),
    indexFile: options.devServerUrl ? null : path.join(distDir, '../renderer/index.html'),
    devServerUrl: options.devServerUrl ?? null,
    settings,
    vault,
    flush: (webContents, timeoutMs = 3000) => flushWebContents(webContents, timeoutMs)
  };
}

function flushWebContents(webContents: WebContents, timeoutMs: number): Promise<void> {
  if (webContents.isDestroyed()) return Promise.resolve();

  return new Promise((resolve) => {
    const fertig = () => {
      clearTimeout(frist);
      ipcMain.removeListener(channel('app:flushed'), fertig);
      resolve();
    };
    const frist = setTimeout(fertig, timeoutMs);
    ipcMain.once(channel('app:flushed'), fertig);
    webContents.send(channel('app:flush'));
  });
}
