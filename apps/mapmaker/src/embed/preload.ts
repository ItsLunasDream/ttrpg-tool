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

/**
 * Eine neue Karte, angestossen von aussen.
 *
 * Die Inspirationshilfe erzeugt Orte; zu einem davon soll man hier eine
 * leere Karte beginnen koennen, ohne den Namen abzutippen. Mehr geht bewusst
 * nicht ueber diese Bruecke: eine Karte aus Text zu zeichnen hiesse, das
 * Datenmodell dieser Anwendung von aussen zu bedienen — ein Projekt fuer
 * sich, kein Knopf (siehe docs/inspirationshilfe.md).
 */
contextBridge.exposeInMainWorld('ttrpgToolsKarte', {
  onNeu: (
    callback: (name: string, notizen?: { title: string; text: string }[]) => void
  ): (() => void) => {
    const listener = (
      _event: unknown,
      name: string,
      notizen?: { title: string; text: string }[]
    ) => callback(name, notizen);
    ipcRenderer.on(`${PREFIX}neue-karte`, listener);
    return () => {
      ipcRenderer.off(`${PREFIX}neue-karte`, listener);
    };
  }
});

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
