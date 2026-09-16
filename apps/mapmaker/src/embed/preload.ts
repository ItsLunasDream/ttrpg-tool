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
 * Die Daumentasten der Maus und Alt+Pfeil, an die Huelle gemeldet.
 *
 * Hier und nicht in der Oberflaeche: das Preload sieht dasselbe Dokument,
 * braucht dafuer aber keine Zeile im Anwendungscode — die Taste hat mit dem
 * Werkzeug nichts zu tun, sie gehoert der Huelle.
 *
 * Gehoert wird auf DREI Mausereignisse, nicht auf eines. `button` 3 ist
 * zurueck, 4 ist vorwaerts; welches der drei Ereignisse eine Seitentaste
 * ausloest, haengt am System, und auf dem Windows-Geraet kam mit `mouseup`
 * allein in einem eingebetteten Werkzeug nichts an. Mehrfach zu melden
 * schadet nicht: der Hauptprozess hat eine Sperrfrist und macht daraus
 * einen Schritt.
 *
 * Alt und Pfeil geht denselben Weg. In der Huelle allein zu lauschen reicht
 * nicht — liegt ein Werkzeug vorn, ist das hier ein anderes Dokument, und
 * die Tastatur kommt dort an und nicht drueben.
 *
 * Die Art des Ereignisses geht mit. Sie kostet nichts und beantwortet im
 * Zweifel die Frage, die man sonst nur raten kann: WAS ist angekommen.
 *
 * Von Hand getippt statt ueber `window`: dieselbe Datei wird zweimal
 * geprueft, einmal mit DOM-Typen und einmal ohne.
 */
const verlaufsDokument = globalThis as unknown as {
  addEventListener(
    art: string,
    hoerer: (ereignis: { readonly button?: number; readonly key?: string; readonly altKey?: boolean }) => void,
    erfassen: boolean
  ): void;
};

function meldeVerlaufsTaste(richtung: 'zurueck' | 'vorwaerts', art: string): void {
  ipcRenderer.send('huelle:verlauf-taste', richtung, art);
}

for (const art of ['mouseup', 'auxclick', 'pointerup']) {
  verlaufsDokument.addEventListener(
    art,
    (ereignis) => {
      if (ereignis.button === 3) meldeVerlaufsTaste('zurueck', art);
      else if (ereignis.button === 4) meldeVerlaufsTaste('vorwaerts', art);
    },
    true
  );
}

verlaufsDokument.addEventListener(
  'keydown',
  (ereignis) => {
    if (!ereignis.altKey) return;
    if (ereignis.key === 'ArrowLeft') meldeVerlaufsTaste('zurueck', 'alt-pfeil');
    else if (ereignis.key === 'ArrowRight') meldeVerlaufsTaste('vorwaerts', 'alt-pfeil');
  },
  true
);
