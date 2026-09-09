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
import { Vault, readSettings, writeSettings } from './vault';
import { registerIpc } from './ipc';
import { handleAssetProtocol, registerAssetScheme } from './assetProtocol';
import { findeUebernahme } from './uebernahme';
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
  /**
   * Sitzung, in der die Anwendung laeuft. Die Huelle gibt jeder Anwendung eine
   * eigene; ohne Angabe gilt die Standardsitzung, wie beim eigenstaendigen
   * Start.
   */
  readonly partition?: string;
  /**
   * Die Sprache, mit der diese Anwendung beim Montieren beginnen soll — die
   * der Sammlung, nicht zwingend die zuletzt hier selbst gespeicherte. Weicht
   * sie von der gespeicherten ab, wird sie uebernommen und geschrieben.
   *
   * Ohne Angabe gilt, was in den eigenen Einstellungen steht — der
   * eigenstaendige Start setzt sie nicht.
   */
  readonly language?: AppSettings['language'];
  /**
   * Wird gerufen, wenn in dieser Anwendung die Sprache umgestellt wird.
   *
   * Die Huelle fuehrt die Sprache fuer die ganze Sammlung; ohne diese Meldung
   * wuesste sie von einer Aenderung hier nichts, und die Werkzeuge liefen
   * auseinander.
   */
  readonly onLanguageChange?: (language: AppSettings['language']) => void;
  /**
   * Speicherorte, die uebernommen werden, wenn diese Anwendung hier zum
   * ersten Mal laeuft und selbst noch keinen hat.
   *
   * Gedacht fuer den Umzug in die Huelle: dort bekommt jede Anwendung ihren
   * eigenen Datenordner, und der ist ein anderer als der des eigenstaendigen
   * Programms. Ohne diesen Weg stuende die Person beim ersten Start vor einer
   * leeren Sammlung — ihre Kampagnen liegen noch da, nur woanders, und nichts
   * auf dem Schirm sagt ihr das.
   *
   * Der erste Eintrag, der wirklich Kampagnen enthaelt, gewinnt. Uebernommen
   * wird nur der *Pfad*: nichts wird kopiert, nichts verschoben, nichts
   * ueberschrieben. Wer die Trennung will, stellt den Ordner in den
   * Einstellungen wieder um.
   */
  readonly uebernahmeKandidaten?: readonly string[];
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
  /**
   * Setzt die Sprache von aussen und schreibt sie in die Einstellungen dieser
   * Anwendung — sie soll auch beim naechsten eigenstaendigen Start gelten.
   *
   * Loest `onLanguageChange` bewusst *nicht* aus: die Aenderung kam ja von
   * dort, und die Meldung liefe im Kreis.
   */
  setLanguage(webContents: WebContents, language: AppSettings['language']): Promise<void>;
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
  const uebernommen = await findeUebernahme(settingsFile, options.uebernahmeKandidaten);
  let settings = await readSettings(settingsFile, uebernommen ?? defaultRoot);
  if (uebernommen) {
    // Festschreiben, damit die Uebernahme genau einmal passiert. Beim
    // naechsten Start gilt die Datei, und wer den Ordner inzwischen
    // umgestellt hat, bekommt nicht den alten zurueck.
    settings = await writeSettings(settingsFile, settings);
    console.log(`[backstory] Vorhandenen Speicherort uebernommen: ${uebernommen}`);
  }
  if (options.language && options.language !== settings.language) {
    settings = await writeSettings(settingsFile, { ...settings, language: options.language });
  }

  const vault = new Vault(settings.vaultRoot);
  vault.setHistoryOptions({
    enabled: settings.historyEnabled,
    maxVersions: settings.historyMaxVersions
  });
  await vault.init();
  handleAssetProtocol(vault, options.partition);

  const kontext = { vault, settingsFile, settings, onLanguageChange: options.onLanguageChange };
  registerIpc(kontext);

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
    flush: (webContents, timeoutMs = 3000) => flushWebContents(webContents, timeoutMs),
    setLanguage: async (webContents, language) => {
      if (kontext.settings.language === language) return;
      kontext.settings = await writeSettings(settingsFile, { ...kontext.settings, language });
      if (!webContents.isDestroyed()) {
        webContents.send(channel('app:sprache'), language);
      }
    }
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
