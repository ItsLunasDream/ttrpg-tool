/** Die Bruecke zwischen Oberflaeche und Hauptprozess. */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';


export interface ExportErgebnis {
  readonly ok: boolean;
  /** Der Titel der angelegten Notiz, oder der Grund fuer das Scheitern. */
  readonly text: string;
}

const api = {
  /**
   * Legt die Figur als Notiz im Backstory Creator an.
   *
   * Auf Knopfdruck und nicht von selbst: eine Figur, die man verwirft, soll
   * nicht schon im Archiv liegen.
   */
  export: (titel: string, markdown: string) =>
    ipcRenderer.invoke(kanal('export'), titel, markdown) as Promise<ExportErgebnis>
};

export type NpcApi = typeof api;

contextBridge.exposeInMainWorld('npc', api);

/** Sprachkopplung mit der Huelle — nur dieser eine Kanal. */
contextBridge.exposeInMainWorld('ttrpgToolsSprache', {
  gewechselt: (language: string) => ipcRenderer.send(kanal('sprache:gewechselt'), language),
  onGesetzt: (callback: (language: string) => void) => {
    const hoerer = (_e: unknown, language: string) => callback(language);
    ipcRenderer.on(kanal('sprache:gesetzt'), hoerer);
    return () => ipcRenderer.off(kanal('sprache:gesetzt'), hoerer);
  }
});
