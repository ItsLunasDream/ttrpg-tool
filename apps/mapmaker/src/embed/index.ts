/**
 * Die Schnittstelle, ueber die eine Huelle diese Anwendung einbettet
 * (Konvention 7 der Wurzel).
 *
 * Sie faellt viel kleiner aus als die des Backstory Creators, und das hat
 * einen Grund: der Karteneditor ist eine reine Web-Anwendung. Er hat keinen
 * Hauptprozess, keine IPC-Kanaele und kein Preload — was er speichert, legt
 * er ueber die File System Access API und den Browserspeicher ab. Zu
 * montieren gibt es hier also nichts; die Huelle muss nur wissen, wo seine
 * Oberflaeche liegt und unter welchem Namen seine Daten stehen sollen.
 *
 * Dass es die Datei trotzdem gibt, ist Absicht: die Huelle soll ihre
 * Anwendungen gleich behandeln und nicht fuer jede einen Sonderfall kennen.
 * Bekommt der Karteneditor eines Tages doch einen nativen Anteil, waechst er
 * hier hinein, ohne dass die Huelle sich aendert.
 *
 * Kein `electron`-Import: diese Datei wird in das Buendel der Huelle
 * uebernommen, gehoert aber weiter zu einer Anwendung, die auch im Browser
 * und unter Tauri laeuft.
 */
import path from 'node:path';

export interface MapmakerEmbedOptions {
  /**
   * Verzeichnis mit der gebauten Oberflaeche (das `dist` dieser Anwendung).
   *
   * Wird uebergeben und nicht aus `__dirname` abgeleitet: beim Einbetten
   * wandert dieser Code in das Buendel der Huelle, die Dateien der Anwendung
   * aber nicht.
   */
  readonly distDir: string;
  /** Gesetzt, wenn die Oberflaeche vom Entwicklungsserver kommen soll. */
  readonly devServerUrl?: string;
}

export interface MapmakerEmbed {
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  /**
   * Diese Anwendung braucht kein Preload.
   *
   * Steht ausdruecklich hier und nicht als Schweigen: die Huelle soll den
   * Unterschied ablesen koennen, statt ihn zu wissen.
   */
  readonly preloadPath: null;
  /**
   * Nichts zu sichern vor dem Schliessen.
   *
   * Der Karteneditor schreibt selbst und laufend — was er noch nicht
   * geschrieben hat, kann eine Huelle ihm auch nicht abnehmen. Die Methode
   * gibt es, damit die Huelle alle Anwendungen gleich behandeln kann.
   */
  flush(): Promise<void>;
}

export function mountMapmaker(options: MapmakerEmbedOptions): MapmakerEmbed {
  return {
    indexFile: options.devServerUrl ? null : path.join(options.distDir, 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    preloadPath: null,
    flush: () => Promise.resolve()
  };
}
