/**
 * Die Schnittstelle, ueber die eine Huelle diese Anwendung einbettet
 * (Konvention 7 der Wurzel).
 *
 * Sie faellt kleiner aus als die des Backstory Creators, und das hat einen
 * Grund: der Karteneditor ist eine reine Web-Anwendung. Er hat keinen
 * eigenen Hauptprozess — was er speichert, legt er ueber die File System
 * Access API und den Browserspeicher ab. Ein Preload gibt es trotzdem, aber
 * nur fuer einen einzigen Zweck: die Sprachkopplung mit der Huelle (siehe
 * preload.ts). Fuer alles andere bleibt diese Anwendung ohne Bruecke zum
 * Hauptprozess.
 *
 * Dass es diese Datei trotzdem gibt, ist Absicht: die Huelle soll ihre
 * Anwendungen gleich behandeln und nicht fuer jede einen Sonderfall kennen.
 * Bekommt der Karteneditor eines Tages einen groesseren nativen Anteil,
 * waechst er hier hinein, ohne dass die Huelle sich aendert.
 *
 * Diese Datei selbst laeuft ausschliesslich im Hauptprozess der Huelle — sie
 * wird dort importiert (`apps/shell/src/main/apps.ts`), nicht in das Bundle
 * der Oberflaeche. Der `electron`-Import unten ist deshalb unproblematisch:
 * er zieht nichts in den Browser-Code dieser Anwendung, nur `ipcRenderer` in
 * preload.ts laeuft im Renderer-Prozess.
 */
import path from 'node:path';
import { ipcMain, type WebContents } from 'electron';
import type { Language } from '../i18n/strings';

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
  /**
   * Die Sprache, mit der diese Anwendung beim Montieren beginnen soll — die
   * der Sammlung, nicht die zuletzt vom Karteneditor selbst gespeicherte.
   * Ohne diese Angabe koennten zwei Werkzeuge nach einem Neustart mit
   * unterschiedlichen Sprachen dastehen, obwohl zuletzt eine gemeinsame Wahl
   * getroffen wurde.
   */
  readonly language: Language;
  /**
   * Wird gerufen, wenn *in dieser Anwendung* die Sprache umgestellt wird —
   * ueber ihr eigenes Sprachmenue, nicht durch `setLanguage` von aussen.
   * Die Huelle reicht das an die anderen Werkzeuge weiter.
   */
  readonly onLanguageChange?: (language: Language) => void;
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
   * Preload nur fuer die Sprachkopplung — siehe preload.ts. Anders als beim
   * Backstory Creator nicht `null`: diese eine Bruecke gibt es jetzt.
   */
  readonly preloadPath: string;
  /**
   * Nichts zu sichern vor dem Schliessen.
   *
   * Der Karteneditor schreibt selbst und laufend — was er noch nicht
   * geschrieben hat, kann eine Huelle ihm auch nicht abnehmen. Die Methode
   * gibt es, damit die Huelle alle Anwendungen gleich behandeln kann.
   */
  flush(): Promise<void>;
  /**
   * Setzt die Sprache von aussen, ueber die Preload-Bruecke.
   *
   * Loest `onLanguageChange` bewusst *nicht* aus: die Aenderung kam ja von
   * dort (oder von der Huelle selbst), und die Meldung liefe im Kreis.
   */
  setLanguage(webContents: WebContents, language: Language): Promise<void>;
  /**
   * Beginnt hier eine leere Karte unter diesem Namen.
   *
   * Fuer den Knopf „Karte anlegen" in der Inspirationshilfe. Der Karteneditor
   * fragt selbst nach, wenn auf der offenen Karte schon etwas steht — von
   * aussen wird nichts weggeworfen.
   */
  neueKarte(webContents: WebContents, name: string): void;
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

const PREFIX = 'mapmaker:';

export function mountMapmaker(options: MapmakerEmbedOptions): MapmakerEmbed {
  // Meldet, wenn im Karteneditor selbst umgestellt wurde (ueber sein eigenes
  // Sprachmenue). Nur einmal angemeldet: pro Prozess montiert die Huelle
  // diese Anwendung hoechstens einmal.
  ipcMain.on(`${PREFIX}sprache-gewechselt`, (_event, language: string) => {
    if (language === 'de' || language === 'en') options.onLanguageChange?.(language);
  });

  return {
    csp: CSP,
    indexFile: options.devServerUrl ? null : path.join(options.distDir, 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    // Das Preload liegt in einem eigenen Ordner neben dist/, nicht darin:
    // `vite build` leert dist/ bei jedem Lauf komplett (emptyOutDir), das
    // getrennt gebuendelte Preload waere sonst weg.
    preloadPath: path.join(options.distDir, '..', 'dist-embed', 'preload.js'),
    flush: () => Promise.resolve(),
    neueKarte: (webContents, name) => {
      if (!webContents.isDestroyed()) webContents.send(`${PREFIX}neue-karte`, name);
    },
    setLanguage: (webContents, language) => {
      if (!webContents.isDestroyed()) {
        webContents.send(`${PREFIX}sprache-setzen`, language);
      }
      return Promise.resolve();
    }
  };
}
