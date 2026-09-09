/**
 * Minimales Preload nur fuer die Sprachkopplung mit der Huelle.
 *
 * Der Karteneditor kommt sonst ohne Preload aus (siehe index.ts) — sein
 * Speichern laeuft ueber die File System Access API, nicht ueber IPC. Dieses
 * eine Preload existiert ausschliesslich, damit die Huelle ihm von aussen
 * eine Sprache setzen und umgekehrt erfahren kann, wenn er selbst umgestellt
 * wird. Eigenstaendig (Browser, Tauri) wird es nie geladen, dort bleibt der
 * Karteneditor bei seiner eigenen, lokal gespeicherten Sprache.
 */
import { contextBridge, ipcRenderer } from 'electron';

const PREFIX = 'mapmaker:';

contextBridge.exposeInMainWorld('ttrpgToolsSprache', {
  /** Meldet der Huelle, dass hier die Sprache gewechselt wurde. */
  gewechselt: (language: string) => ipcRenderer.send(`${PREFIX}sprache-gewechselt`, language),
  /**
   * Die Huelle setzt die Sprache von aussen. Liefert eine Funktion zum
   * Abmelden zurueck.
   */
  onGesetzt: (callback: (language: string) => void): (() => void) => {
    const listener = (_event: unknown, language: string) => callback(language);
    ipcRenderer.on(`${PREFIX}sprache-setzen`, listener);
    return () => {
      ipcRenderer.off(`${PREFIX}sprache-setzen`, listener);
    };
  }
});
