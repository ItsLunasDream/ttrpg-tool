/**
 * Bruecke zwischen Huellen-Oberflaeche und Hauptprozess.
 *
 * Nur benannte Funktionen werden freigegeben, kein durchgereichtes
 * `ipcRenderer`. Sonst koennte jede Zeile im Renderer jeden Kanal aufrufen —
 * auch die der eingebetteten Anwendungen.
 */
import { contextBridge, ipcRenderer } from 'electron';
import type { ShellSettings } from '../main/settings';

const api = {
  fenster: {
    minimieren: () => ipcRenderer.invoke('fenster:minimieren') as Promise<void>,
    maximierenUmschalten: () => ipcRenderer.invoke('fenster:maximieren-umschalten') as Promise<boolean>,
    schliessen: () => ipcRenderer.invoke('fenster:schliessen') as Promise<void>,
    istMaximiert: () => ipcRenderer.invoke('fenster:ist-maximiert') as Promise<boolean>,
    /**
     * Meldet Maximieren und Wiederherstellen, auch wenn es ueber den
     * Fensterrahmen des Systems ausgeloest wurde (Doppelklick, Tastenkuerzel,
     * Anschnappen am Bildschirmrand). Ohne diese Meldung zeigte der Knopf in
     * der Titelleiste dann das falsche Symbol.
     *
     * Liefert eine Funktion zum Abmelden zurueck.
     */
    beiZustandswechsel: (fn: (zustand: { maximiert: boolean }) => void): (() => void) => {
      const hoerer = (_e: unknown, zustand: { maximiert: boolean }) => fn(zustand);
      ipcRenderer.on('fenster:zustand', hoerer);
      // Bewusst mit Block: `ipcRenderer.off` liefert den IpcRenderer zurueck,
      // und React erwartet von einer Aufraeumfunktion nichts als undefined.
      return () => {
        ipcRenderer.off('fenster:zustand', hoerer);
      };
    }
  },
  app: {
    version: () => ipcRenderer.invoke('app:version') as Promise<string>,
    plattform: () => ipcRenderer.invoke('app:plattform') as Promise<string>,
    /**
     * Holt eine Anwendung nach vorn und montiert sie beim ersten Mal.
     *
     * Antwortet mit `false`, wenn die Huelle sie noch nicht einbetten kann.
     * Die Oberflaeche zeigt dann weiter ihre Platzhalterflaeche.
     */
    zeigen: (id: string) => ipcRenderer.invoke('app:zeigen', id) as Promise<boolean>,
    /** Zurueck ins Startmenue. Die Anwendungen bleiben geladen. */
    startmenue: () => ipcRenderer.invoke('app:startmenue') as Promise<void>,
    /**
     * Meldet, dass ein Dialog der Huelle auf- oder zugeht. Die vorn liegende
     * Anwendung tritt so lange zurueck, sonst deckt sie ihn zu.
     */
    dialog: (offen: boolean) => ipcRenderer.invoke('app:dialog', offen) as Promise<void>,
    /**
     * Meldet, dass der Hauptprozess beim Start schon ein Werkzeug geoeffnet
     * hat (TTRPG_TOOLS_START_APP). Die Oberflaeche zeigt sonst ihr
     * Startmenue, waehrend dahinter bereits eine Anwendung liegt.
     *
     * Liefert eine Funktion zum Abmelden zurueck.
     */
    beiStartMitWerkzeug: (fn: (id: string) => void): (() => void) => {
      const hoerer = (_e: unknown, id: string) => fn(id);
      ipcRenderer.on('app:gestartet-mit', hoerer);
      return () => {
        ipcRenderer.off('app:gestartet-mit', hoerer);
      };
    },
    /** Oeffnet eine http(s)-Adresse im Browser des Systems. */
    oeffneExtern: (adresse: string) =>
      ipcRenderer.invoke('app:oeffne-extern', adresse) as Promise<void>
  },
  einstellungen: {
    lesen: () => ipcRenderer.invoke('einstellungen:lesen') as Promise<ShellSettings>,
    /** Schreibt und liefert den bereinigten Stand zurueck, der danach gilt. */
    schreiben: (neu: ShellSettings) =>
      ipcRenderer.invoke('einstellungen:schreiben', neu) as Promise<ShellSettings>,
    /**
     * Die Sprache wurde von aussen geaendert — nicht ueber den
     * Einstellungen-Dialog dieses Fensters, sondern ueber das Sprachmenue
     * einer eingebetteten Anwendung oder eine andere Sitzung. Ohne diesen
     * Kanal wüsste die Titelleiste nichts von der Änderung.
     *
     * Liefert eine Funktion zum Abmelden zurueck.
     */
    beiSprachwechselVonAussen: (fn: (language: ShellSettings['language']) => void): (() => void) => {
      const hoerer = (_e: unknown, language: ShellSettings['language']) => fn(language);
      ipcRenderer.on('einstellungen:sprache-extern', hoerer);
      return () => {
        ipcRenderer.off('einstellungen:sprache-extern', hoerer);
      };
    }
  }
};

export type ShellApi = typeof api;

contextBridge.exposeInMainWorld('shell', api);
