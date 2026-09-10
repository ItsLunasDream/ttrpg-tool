/** Die Bruecke zwischen Oberflaeche und Hauptprozess. */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Einstellungen } from '../shared/einstellungen';

const api = {
  einstellungen: {
    lesen: () => ipcRenderer.invoke(kanal('einstellungen:lesen')) as Promise<Einstellungen>,
    schreiben: (neu: Einstellungen) =>
      ipcRenderer.invoke(kanal('einstellungen:schreiben'), neu) as Promise<Einstellungen>
  }
};

export type DiceApi = typeof api;

contextBridge.exposeInMainWorld('dice', api);

/** Sprachkopplung mit der Huelle — nur dieser eine Kanal. */
contextBridge.exposeInMainWorld('ttrpgToolsSprache', {
  gewechselt: (language: string) => ipcRenderer.send(kanal('sprache:gewechselt'), language),
  onGesetzt: (callback: (language: string) => void) => {
    const hoerer = (_e: unknown, language: string) => callback(language);
    ipcRenderer.on(kanal('sprache:gesetzt'), hoerer);
    return () => ipcRenderer.off(kanal('sprache:gesetzt'), hoerer);
  }
});
