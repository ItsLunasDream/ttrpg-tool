/** Die Bruecke zwischen Oberflaeche und Hauptprozess. */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Notiz } from '../shared/notizen';

export interface ExportErgebnis {
  readonly ok: boolean;
  /** Bei Erfolg eine kurze Bilanz, sonst der Grund fuer das Scheitern. */
  readonly text: string;
  /** Wie viele Notizen angelegt wurden. */
  readonly angelegt: number;
}

const api = {
  /**
   * Legt den Entwurf als Notizen in der offenen Kampagne an.
   *
   * Auf Knopfdruck und nicht von selbst: „Entwurf hier, Wahrheit dort" —
   * was nicht uebernommen wurde, hat im Archiv nichts verloren.
   */
  export: (notizen: readonly Notiz[]) =>
    ipcRenderer.invoke(kanal('export'), notizen) as Promise<ExportErgebnis>
};

export type InspirationApi = typeof api;

contextBridge.exposeInMainWorld('inspiration', api);

/** Sprachkopplung mit der Huelle — nur dieser eine Kanal. */
contextBridge.exposeInMainWorld('ttrpgToolsSprache', {
  gewechselt: (language: string) => ipcRenderer.send(kanal('sprache:gewechselt'), language),
  onGesetzt: (callback: (language: string) => void) => {
    const hoerer = (_e: unknown, language: string) => callback(language);
    ipcRenderer.on(kanal('sprache:gesetzt'), hoerer);
    return () => ipcRenderer.off(kanal('sprache:gesetzt'), hoerer);
  }
});
