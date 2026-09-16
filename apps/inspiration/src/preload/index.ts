/** Die Bruecke zwischen Oberflaeche und Hauptprozess. */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Frage, RohEntwurf } from '../shared/kiAufgaben';
import type { KampagnenFigur } from '../main/embed';
import type { Notiz } from '../shared/notizen';
import type { Sprache } from '../shared/tabellen';

export interface KiErgebnis {
  readonly ok: boolean;
  readonly wert: Record<string, string> | readonly string[] | RohEntwurf | null;
  /** Bei Misserfolg der Schluessel der Meldung, sonst leer. */
  readonly grund: string;
}

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
    ipcRenderer.invoke(kanal('export'), notizen) as Promise<ExportErgebnis>,

  /**
   * Die Figuren, die es in der offenen Kampagne schon gibt.
   *
   * Darueber kommen auch die des NPC Creators herein: was dort gewuerfelt und
   * uebernommen wurde, liegt anschliessend als Notiz in derselben Kampagne.
   */
  figuren: () => ipcRenderer.invoke(kanal('figuren')) as Promise<readonly KampagnenFigur[]>,

  /**
   * Der Karteneditor.
   *
   * `da` sagt, ob es den Weg ueberhaupt gibt; `anlegen` holt den Editor nach
   * vorn und beginnt dort eine leere Karte unter diesem Namen.
   */
  karte: {
    da: () => ipcRenderer.invoke(kanal('karte:da')) as Promise<boolean>,
    anlegen: (name: string, notizen: readonly { title: string; text: string }[] = []) =>
      ipcRenderer.invoke(kanal('karte'), name, notizen) as Promise<boolean>
  },

  /**
   * Die KI.
   *
   * Eingerichtet wird sie in der Huelle, nicht hier. Ist keine da, sagt `da`
   * das, und die Oberflaeche zeigt die Knoepfe gar nicht erst.
   *
   * Die Anfrage geht vom Hauptprozess aus. Die Oberflaeche bekommt keinen
   * Netzzugriff und den API-Schluessel nie zu sehen.
   */
  ki: {
    da: () => ipcRenderer.invoke(kanal('ki:da')) as Promise<boolean>,
    beiWechsel: (callback: () => void): (() => void) => {
      const hoerer = () => callback();
      ipcRenderer.on(kanal('ki:gewechselt'), hoerer);
      return () => ipcRenderer.off(kanal('ki:gewechselt'), hoerer);
    },
    frage: (frage: Frage, sprache: Sprache) =>
      ipcRenderer.invoke(kanal('ki:frage'), frage, sprache) as Promise<KiErgebnis>
  }
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

/*
 * Die Daumentasten der Maus, an die Huelle gemeldet.
 *
 * Hier und nicht in der Oberflaeche: das Preload sieht dasselbe Dokument,
 * braucht dafuer aber keine Zeile im Anwendungscode — die Taste hat mit dem
 * Werkzeug nichts zu tun, sie gehoert der Huelle.
 *
 * `button` 3 ist zurueck, 4 ist vorwaerts; so kommen die Seitentasten in
 * jedem Chromium an (nachgemessen mit echten Tastenereignissen). Der Weg
 * ueber `app-command` am Fenster reicht nicht: unter Windows greift Chromium
 * sie in der Ansicht selbst ab, und dann erfaehrt das Fenster nie davon.
 *
 * In der Erfassungsphase, damit ein `stopPropagation` der Oberflaeche sie
 * nicht verschluckt. Laeuft das Werkzeug allein, hoert niemand zu und die
 * Meldung verpufft.
 *
 * Von Hand getippt statt ueber `window`: dieselbe Datei wird zweimal
 * geprueft, einmal mit DOM-Typen und einmal ohne. `window` scheiterte im
 * zweiten Durchlauf.
 */
const dokument = globalThis as unknown as {
  addEventListener(
    art: 'mouseup',
    hoerer: (ereignis: { readonly button: number }) => void,
    erfassen: boolean
  ): void;
};

dokument.addEventListener(
  'mouseup',
  (ereignis) => {
    if (ereignis.button === 3) ipcRenderer.send('huelle:verlauf-taste', 'zurueck');
    else if (ereignis.button === 4) ipcRenderer.send('huelle:verlauf-taste', 'vorwaerts');
  },
  true
);
