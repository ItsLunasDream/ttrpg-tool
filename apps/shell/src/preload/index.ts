/**
 * Bruecke zwischen Huellen-Oberflaeche und Hauptprozess.
 *
 * Nur benannte Funktionen werden freigegeben, kein durchgereichtes
 * `ipcRenderer`. Sonst koennte jede Zeile im Renderer jeden Kanal aufrufen —
 * auch die der eingebetteten Anwendungen.
 */
import { contextBridge, ipcRenderer } from 'electron';

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
    plattform: () => ipcRenderer.invoke('app:plattform') as Promise<string>
  }
};

export type ShellApi = typeof api;

contextBridge.exposeInMainWorld('shell', api);
