/**
 * Bruecke zwischen Huellen-Oberflaeche und Hauptprozess.
 *
 * Nur benannte Funktionen werden freigegeben, kein durchgereichtes
 * `ipcRenderer`. Sonst koennte jede Zeile im Renderer jeden Kanal aufrufen —
 * auch die der eingebetteten Anwendungen.
 */
import { contextBridge, ipcRenderer } from 'electron';
import type { ShellSettings } from '../main/settings';

const api = {
  /**
   * Zurueck und vorwaerts. Der Befehl kommt aus dem Hauptprozess: die
   * Daumentasten der Maus erreichen die Oberflaeche der Huelle nicht, wenn
   * gerade eine eingebettete Anwendung den Fokus hat.
   */
  verlauf: {
    /** Bringt ein Werkzeug an eine Stelle zurueck, die der Verlauf kennt. */
    springe: (id: string, ort: string | null): Promise<boolean> =>
      ipcRenderer.invoke('verlauf:springe', id, ort),
    /** Ein Werkzeug meldet, wo es gerade steht. */
    beiOrt: (fn: (id: string, ort: string | null) => void): (() => void) => {
      const hoerer = (_e: unknown, id: string, ort: string | null) => fn(id, ort);
      ipcRenderer.on('verlauf:ort', hoerer);
      return () => {
        ipcRenderer.off('verlauf:ort', hoerer);
      };
    },
    beiBefehl: (fn: (richtung: 'zurueck' | 'vorwaerts') => void): (() => void) => {
      const hoerer = (_e: unknown, richtung: 'zurueck' | 'vorwaerts') => fn(richtung);
      ipcRenderer.on('verlauf:befehl', hoerer);
      return () => {
        ipcRenderer.off('verlauf:befehl', hoerer);
      };
    }
  },
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
    plattform: () => ipcRenderer.invoke('app:plattform') as Promise<string>,
    /**
     * Holt eine Anwendung nach vorn und montiert sie beim ersten Mal.
     *
     * Antwortet mit `false`, wenn die Huelle sie noch nicht einbetten kann.
     * Die Oberflaeche zeigt dann weiter ihre Platzhalterflaeche.
     */
    /**
     * Holt ein Werkzeug nach vorn. Antwortet mit dem Zustand, nicht mit
     * „ging / ging nicht": ein Werkzeug, das es noch nicht gibt, und eines,
     * dessen Dateien fehlen, brauchen verschiedene Antworten auf dem Schirm.
     */
    /**
     * `fruehestensMs` haelt die Ansicht so lange zurueck.
     *
     * Gebraucht fuer den Uebergang aus dem Startmenue: dort waechst das
     * Symbol ueber den Schirm, und die Ansicht darf sich nicht mitten hinein
     * schieben. Montiert wird trotzdem sofort — die Zeit geht also nicht
     * verloren, sie wird nur nicht vorzeitig sichtbar.
     */
    zeigen: (id: string, fruehestensMs = 0) =>
      ipcRenderer.invoke('app:zeigen', id, fruehestensMs) as Promise<
        import('../main/index').ZeigenErgebnis
      >,
    /** Zurueck ins Startmenue. Die Anwendungen bleiben geladen. */
    startmenue: () => ipcRenderer.invoke('app:startmenue') as Promise<void>,
    /**
     * Meldet, dass ein Dialog der Huelle auf- oder zugeht. Die vorn liegende
     * Anwendung tritt so lange zurueck, sonst deckt sie ihn zu.
     */
    dialog: (offen: boolean) => ipcRenderer.invoke('app:dialog', offen) as Promise<void>,
    /**
     * Meldet, dass der Hauptprozess beim Start schon ein Werkzeug geoeffnet
     * hat (TTRPG_TOOLS_START_APP). Die Oberflaeche zeigt sonst ihr
     * Startmenue, waehrend dahinter bereits eine Anwendung liegt.
     *
     * Liefert eine Funktion zum Abmelden zurueck.
     */
    beiStartMitWerkzeug: (fn: (id: string) => void): (() => void) => {
      const hoerer = (_e: unknown, id: string) => fn(id);
      ipcRenderer.on('app:gestartet-mit', hoerer);
      return () => {
        ipcRenderer.off('app:gestartet-mit', hoerer);
      };
    },
    /**
     * Meldet, dass sich in einer anderen Anwendung etwas getan hat.
     *
     * Liefert die ID der Anwendung, in der es geschah — die Oberflaeche laesst
     * daraufhin eine Farbe ueber deren Symbol wischen. Abmelden ueber die
     * zurueckgegebene Funktion.
     */
    beiEreignis: (fn: (id: string) => void): (() => void) => {
      const hoerer = (_e: unknown, id: string) => fn(id);
      ipcRenderer.on('app:ereignis', hoerer);
      return () => {
        ipcRenderer.off('app:ereignis', hoerer);
      };
    },
    /** Oeffnet eine http(s)-Adresse im Browser des Systems. */
    oeffneExtern: (adresse: string) =>
      ipcRenderer.invoke('app:oeffne-extern', adresse) as Promise<void>
  },
  bewegung: {
    /**
     * Meldet dem Hauptprozess, ob das System weniger Bewegung wuenscht.
     *
     * `prefers-reduced-motion` ist nur in einer Darstellung zu beantworten;
     * der Hauptprozess braucht die Auskunft aber fuer die Einfahrt der
     * eingebetteten Ansichten, die er selbst treibt. Deshalb dieser Weg
     * hinaus statt einer Abfrage hinein.
     */
    reduziert: (reduziert: boolean) => ipcRenderer.send('bewegung:reduziert', reduziert)
  },
  symbole: {
    /**
     * Eigene Symbole, als data:-URL je Kennung des Werkzeugs. Fehlt eines,
     * steht es nicht darin, und die Oberflaeche nimmt das eingebaute.
     */
    lesen: () => ipcRenderer.invoke('symbole:lesen') as Promise<Record<string, string>>,
    /** Oeffnet den Ordner im Dateimanager. Liefert seinen Pfad zurueck. */
    ordnerOeffnen: () => ipcRenderer.invoke('symbole:ordner') as Promise<string>
  },
  ki: {
    /**
     * Bereitschaft der KI. `beschreibung` traegt bei Erfolg das Modell, sonst
     * den Grund — bereits in der eingestellten Sprache.
     */
    status: () =>
      ipcRenderer.invoke('ki:status') as Promise<{
        anbieter: string;
        bereit: boolean;
        beschreibung: string;
        hatSchluessel: boolean;
      }>,
    /**
     * Legt den API-Schluessel ab. Ein leerer Text entfernt ihn.
     *
     * Zurueck kommt er nie. Scheitert das Verschluesseln, weil das System
     * keinen Schluesselbund bietet, wirft der Aufruf — im Klartext abzulegen
     * waere schlechter, als es zu lassen.
     */
    setzeSchluessel: (schluessel: string) =>
      ipcRenderer.invoke('ki:schluessel-setzen', schluessel) as Promise<boolean>
  },
  einstellungen: {
    lesen: () => ipcRenderer.invoke('einstellungen:lesen') as Promise<ShellSettings>,
    /**
     * Schreibt und liefert den bereinigten Stand zurueck, der danach gilt.
     *
     * Teilstuecke sind erlaubt und die Regel: was nicht mitkommt, bleibt
     * stehen. Der API-Schluessel laesst sich hierueber nicht setzen — dafuer
     * gibt es `ki.setzeSchluessel`, und gelesen wird er nie.
     */
    schreiben: (neu: Partial<ShellSettings>) =>
      ipcRenderer.invoke('einstellungen:schreiben', neu) as Promise<ShellSettings>,
    /**
     * Die Sprache wurde von aussen geaendert — nicht ueber den
     * Einstellungen-Dialog dieses Fensters, sondern ueber das Sprachmenue
     * einer eingebetteten Anwendung oder eine andere Sitzung. Ohne diesen
     * Kanal wüsste die Titelleiste nichts von der Änderung.
     *
     * Liefert eine Funktion zum Abmelden zurueck.
     */
    beiSprachwechselVonAussen: (fn: (language: ShellSettings['language']) => void): (() => void) => {
      const hoerer = (_e: unknown, language: ShellSettings['language']) => fn(language);
      ipcRenderer.on('einstellungen:sprache-extern', hoerer);
      return () => {
        ipcRenderer.off('einstellungen:sprache-extern', hoerer);
      };
    }
  }
};

export type ShellApi = typeof api;

contextBridge.exposeInMainWorld('shell', api);
