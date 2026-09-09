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
   * Die Content-Security-Policy, unter der diese Anwendung laufen soll.
   *
   * Sie steht hier und nicht in der index.html, weil dieselbe gebaute Seite
   * auch unter Tauri und im Browser laeuft. Tauri leitet seine Aufrufe an den
   * nativen Teil ueber eigene Protokolle, die eine hier passende Richtlinie
   * abweisen wuerde — und ein Tauri-Build laesst sich in dieser Umgebung nicht
   * pruefen. Die Huelle setzt sie deshalb selbst, fuer ihre Sitzung, und die
   * anderen Wege bleiben unberuehrt.
   */
  readonly csp: string;
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

/**
 * Was der Karteneditor braucht — und nicht mehr.
 *
 * Jede Lockerung ist einzeln begruendet. Eine Richtlinie, die man ohne Grund
 * weit macht, ist keine. Geprueft wurde sie gegen die laufende Anwendung:
 * Buehne, Prop-Vorschauen, Bildimport.
 */
const CSP = [
  "default-src 'self'",
  // Kein 'unsafe-eval': Pixi baut seine Shader zur Laufzeit mit `new Function`
  // zusammen und faende hier ein Verbot vor. Deshalb laedt engine/renderer.ts
  // 'pixi.js/unsafe-eval', das dieselbe Arbeit ohne Codeerzeugung erledigt.
  "script-src 'self'",
  // Pixi und React setzen Stilangaben zur Laufzeit, teils als eingespritzte
  // <style>-Bloecke.
  "style-src 'self' 'unsafe-inline'",
  // blob: fuer importierte Bilder (URL.createObjectURL in
  // assets/importStore.ts), data: fuer die gebackenen Prop-Texturen.
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' data: blob:",
  // Pixi startet Arbeiter fuer das Laden von Bildern.
  "worker-src 'self' blob:",
  // Braucht die Anwendung beides nicht, und beides sind bekannte Einfallstore.
  "object-src 'none'",
  "base-uri 'none'"
].join('; ');

export function mountMapmaker(options: MapmakerEmbedOptions): MapmakerEmbed {
  return {
    csp: CSP,
    indexFile: options.devServerUrl ? null : path.join(options.distDir, 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    preloadPath: null,
    flush: () => Promise.resolve()
  };
}
