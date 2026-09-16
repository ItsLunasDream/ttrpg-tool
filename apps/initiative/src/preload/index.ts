/**
 * Die Bruecke zwischen Oberflaeche und Hauptprozess.
 *
 * Nur diese Funktionen sind aus dem Renderer erreichbar — kein `fs`, kein
 * `path`, kein `require`.
 */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Begegnung, Kampf } from '../shared/types';

const api = {
  begegnungen: {
    liste: () => ipcRenderer.invoke(kanal('begegnungen:liste')) as Promise<Begegnung[]>,
    lesen: (id: string) => ipcRenderer.invoke(kanal('begegnungen:lesen'), id) as Promise<Begegnung>,
    speichern: (begegnung: Begegnung) =>
      ipcRenderer.invoke(kanal('begegnungen:speichern'), begegnung) as Promise<Begegnung>,
    loeschen: (id: string) => ipcRenderer.invoke(kanal('begegnungen:loeschen'), id) as Promise<void>
  },
  kampf: {
    lesen: () => ipcRenderer.invoke(kanal('kampf:lesen')) as Promise<Kampf | null>,
    schreiben: (kampf: Kampf) => ipcRenderer.invoke(kanal('kampf:schreiben'), kampf) as Promise<void>
  },
  bild: {
    waehlen: () => ipcRenderer.invoke(kanal('bild:waehlen')) as Promise<string | null>
  }
};

export type InitiativeApi = typeof api;

contextBridge.exposeInMainWorld('initiative', api);

/**
 * Sprachkopplung mit der Huelle — dieselbe Bruecke wie beim Karteneditor.
 * Nur dieser eine Kanal, kein Zugriff auf sonst etwas.
 */
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
