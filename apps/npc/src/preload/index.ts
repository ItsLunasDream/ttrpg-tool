/** Die Bruecke zwischen Oberflaeche und Hauptprozess. */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Feld, Figur, Wuensche } from '../shared/erzeuge';
import type { Sprache } from '../shared/tabellen';


/** Was bei einer KI-Anfrage herauskommt. Ein Fehler ist kein Absturz. */
export interface KiErgebnis<T> {
  readonly ok: boolean;
  readonly wert: T | null;
  /** Bei Misserfolg der Schluessel der Meldung, sonst leer. */
  readonly grund: string;
}

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
    ipcRenderer.invoke(kanal('export'), titel, markdown) as Promise<ExportErgebnis>,

  /**
   * Die KI.
   *
   * Eingerichtet wird sie in der Huelle, nicht hier. Ist keine da, sagt `da`
   * das, und die Oberflaeche zeigt die Knoepfe gar nicht erst — ausgegraute
   * Knoepfe fuer etwas, das man hier ohnehin nicht einschalten kann, waeren
   * eine Einladung zum Suchen.
   *
   * Die Anfrage geht vom Hauptprozess aus. Die Oberflaeche bekommt keinen
   * Netzzugriff und den API-Schluessel nie zu sehen.
   */
  ki: {
    da: () => ipcRenderer.invoke(kanal('ki:da')) as Promise<boolean>,
    feld: (feld: Feld, figur: Figur, wuensche: Wuensche, sprache: Sprache) =>
      ipcRenderer.invoke(kanal('ki:feld'), feld, figur, wuensche, sprache) as Promise<
        KiErgebnis<string>
      >,
    figur: (figur: Figur | null, festgehalten: Feld[], wuensche: Wuensche, sprache: Sprache) =>
      ipcRenderer.invoke(kanal('ki:figur'), figur, festgehalten, wuensche, sprache) as Promise<
        KiErgebnis<Partial<Record<Feld, string>>>
      >
  }
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
