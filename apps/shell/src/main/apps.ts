/**
 * Das Einbetten der Anwendungen.
 *
 * Jede Anwendung bringt eine Montage-Schnittstelle mit (Konvention 7). Die
 * Huelle ruft sie auf, bekommt Preload und Oberflaeche zurueck und haengt eine
 * Ansicht ins Fenster. Der Code der Anwendung bleibt dabei unveraendert: sie
 * merkt nicht, dass sie in einer Huelle laeuft.
 *
 * Wie verschieden die Anwendungen darunter gebaut sind, sieht man an den zwei
 * bisherigen: der Backstory Creator bringt einen ganzen Hauptprozess mit,
 * Speicherort und knapp vierzig IPC-Kanaele; der Karteneditor ist eine reine
 * Web-Anwendung ohne Preload, die ueber die File System Access API speichert.
 * Fuer die Huelle sind beide dasselbe — eine Ansicht, die sie laedt, zeigt und
 * versteckt.
 *
 * Der Import geht quer ueber die Anwendungsgrenze, mit relativem Pfad. Das
 * ist Absicht und die einzige erlaubte Richtung: die Huelle darf in eine
 * Anwendung hineingreifen, eine Anwendung nie in die Huelle und nie in eine
 * andere Anwendung. Sonst waeren sie nicht mehr einzeln lauffaehig, und genau
 * das sollen sie bleiben.
 */
import { join } from 'node:path';
import { app, session as electronSession, WebContentsView, shell } from 'electron';
import type { BaseWindow } from 'electron';
import type { WebContents } from 'electron';
import {
  mountBackstory,
  registerAssetScheme as registerBackstoryScheme
} from '../../../backstory/src/main/embed';
import { mountMapmaker } from '../../../mapmaker/src/embed';
import type { Language } from '../shared/i18n';

export interface MontierteApp {
  readonly id: string;
  readonly sicht: WebContentsView;
  /**
   * Laedt die Oberflaeche der Anwendung in ihre Ansicht — und noch einmal,
   * wenn es beim ersten Mal nicht ging.
   *
   * Getrennt vom Montieren, und das ist keine Kosmetik. Beim Montieren
   * entstehen Dinge, die es *einmal* geben darf: die IPC-Kanaele der
   * Anwendung und ihr eigenes Protokoll. Solange beides am Laden hing, riss
   * ein Ladefehler die ganze Montage mit — und der naechste Versuch scheiterte
   * dann nicht mehr an der fehlenden Datei, sondern an
   * „Failed to register protocol". Ein Werkzeug, das einmal nicht hochkam,
   * blieb bis zum Neustart der Huelle kaputt, selbst nachdem die fehlenden
   * Dateien gebaut waren.
   */
  nachladen(): Promise<void>;
  /**
   * Ob die Oberflaeche schon drin ist.
   *
   * Die Huelle darf nur nachladen, wenn noch nichts geladen ist: ein erneutes
   * Laden wirft den Zustand der Anwendung weg — offene Notiz, Auswahl,
   * Bildlauf. Beim Wechsel hin und her waere jedes Mal alles zurueckgesetzt.
   */
  istGeladen(): boolean;
  /** Sichert Ungespeichertes und wartet darauf. */
  flush(): Promise<void>;
  /**
   * Fragt vor dem Schliessen nach Ungespeichertem und antwortet, ob
   * geschlossen werden darf.
   *
   * Fehlt bei Anwendungen, die nichts zu verlieren haben — die Huelle wertet
   * ein fehlendes `darfSchliessen` als „ja". `flush` reicht dafuer nicht: es
   * schreibt kommentarlos, und wer den Autosave ausschaltet, will gefragt
   * werden.
   */
  darfSchliessen?(elternfenster: BaseWindow): Promise<boolean>;
  /**
   * Setzt die Sprache dieser Anwendung von aussen — fehlt, wenn eine
   * Anwendung das (noch) nicht unterstuetzt. Die Huelle ruft das bei jeder
   * offenen Anwendung ausser der meldenden auf, wenn irgendwo umgestellt
   * wird.
   */
  setLanguage?(language: Language): Promise<void>;
}

/** Was die Huelle jeder Anwendung beim Montieren mitgibt. */
export interface MontageHaken {
  /** Die Sprache der Sammlung, mit der die Anwendung beginnen soll. */
  readonly language: Language;
  /**
   * Wird gerufen, wenn *in dieser Anwendung* die Sprache umgestellt wurde —
   * ueber ihr eigenes Sprachmenue, nicht durch ein `setLanguage` von aussen.
   */
  readonly onLanguageChange: (language: Language) => void;
}

/**
 * Meldet die eigenen Protokolle aller Anwendungen an.
 *
 * Muss vor `app.whenReady()` laufen — danach duerfen keine Schemata mehr
 * angemeldet werden, und der Backstory Creator koennte seine Bilder nicht
 * ausliefern. Deshalb steht das getrennt vom Montieren, das erst danach geht.
 */
export function registerSchemes(): void {
  registerBackstoryScheme();
}

/**
 * Wo die Dateien einer eingebetteten Anwendung liegen.
 *
 * `__dirname` hilft hier nicht: der *Code* der Anwendung ist beim Buendeln in
 * die Huelle gewandert, ihre *Dateien* — Preload, Oberflaeche, Bilder — sind
 * dort geblieben, wo sie gebaut wurden.
 *
 * Und sie liegen an zwei verschiedenen Orten, je nachdem, wie die Huelle
 * laeuft:
 *
 * - **Im Workspace** neben der Huelle, unter `apps/<id>/dist`.
 * - **Im gepackten Paket** unter `resources/apps/<id>/dist`. Dorthin legt sie
 *   electron-builder ueber `extraResources`. Bewusst nicht ins asar-Archiv:
 *   die Anwendungen bringen ihre eigenen Unterordner und Bilder mit, und was
 *   ausserhalb liegt, laesst sich mit gewoehnlichen Mitteln ansehen, wenn
 *   etwas fehlt.
 *
 * Ein Rauchtest prueft beide Faelle — den ersten beim Entwickeln, den zweiten
 * am fertigen Paket.
 */
export function appDistDir(id: string, ...weiter: string[]): string {
  const wurzel = app.isPackaged
    ? join(process.resourcesPath, 'apps', id, 'dist')
    : join(__dirname, '..', '..', '..', id, 'dist');
  return join(wurzel, ...weiter);
}

/**
 * Wo das *eigenstaendige* Programm einer Anwendung seine Daten haette.
 *
 * Electron leitet den Datenordner aus dem Namen der Anwendung ab, und der ist
 * eigenstaendig ein anderer als hier: die Huelle heisst „TTRPG-Tools", das
 * gepackte Einzelprogramm „Backstory Creator", und aus dem Workspace
 * gestartet gilt der Name aus seiner package.json. Alle drei liegen
 * nebeneinander im selben uebergeordneten Verzeichnis.
 *
 * Zurueckgegeben werden die Speicherorte, nicht die Datenordner: die
 * Uebernahme setzt den Speicherort, nicht die Einstellungen der anderen
 * Installation.
 */
function fruehereSpeicherorte(id: string): string[] {
  const namen: Record<string, string[]> = {
    // Gepackt und aus dem Workspace — beide Schreibweisen kommen vor.
    backstory: ['Backstory Creator', 'backstory-creator']
  };
  const daneben = app.getPath('appData');
  return (namen[id] ?? []).map((name) => join(daneben, name, 'vault'));
}

/** Wohin eine Anwendung ihre Daten legt. */
function datenordner(id: string): string {
  // Jede Anwendung bekommt einen eigenen Unterordner. Ein gemeinsamer waere
  // bequemer, aber zwei Anwendungen mit je einer settings.json wuerden sich
  // gegenseitig ueberschreiben.
  return join(app.getPath('userData'), id);
}

/**
 * Die Sitzung, in der eine Anwendung laeuft.
 *
 * Jede bekommt ihre eigene. Alle Ansichten laden ueber `file://`, und dort ist
 * der Ursprung fuer alle derselbe — ohne getrennte Sitzungen teilten sich die
 * Anwendungen also localStorage, IndexedDB und Zwischenspeicher. Der
 * Karteneditor legt dort seine Prop-Bibliothek, seine Tastenbelegung und die
 * zuletzt geoeffneten Karten ab; ein zweites Programm mit einem gleich
 * benannten Schluessel wuerde ihm hineinschreiben.
 *
 * `persist:` heisst, dass der Inhalt einen Neustart uebersteht. Ohne das waere
 * jede Einstellung nach dem Schliessen weg.
 */
function sitzung(id: string): string {
  return `persist:${id}`;
}

/**
 * Legt die Content-Security-Policy einer Anwendung ueber ihre Sitzung.
 *
 * Als Kopfzeile und nicht als <meta> im HTML, weil dieselbe gebaute Seite auch
 * ausserhalb der Huelle laeuft — der Karteneditor etwa unter Tauri, dessen
 * Aufrufe an den nativen Teil ueber eigene Protokolle gehen. Was hier gilt,
 * gilt damit nur hier.
 *
 * Ohne Richtlinie darf eine Seite Code von ueberall nachladen und Text als
 * Code ausfuehren. In einer Huelle mit Dateizugriff waere das der Weg, auf dem
 * eine praeparierte Kartendatei fremden Code mit den Rechten der Anwendung
 * laufen liesse.
 */
function setzeCsp(partition: string, richtlinie: string): void {
  electronSession.fromPartition(partition).webRequest.onHeadersReceived((details, weiter) => {
    weiter({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [richtlinie]
      }
    });
  });
}

/** Gemeinsame Absicherung fuer jede eingebettete Ansicht. */
function sichereAb(sicht: WebContentsView, devServerUrl: string | null): void {
  // Externe Links gehoeren in den Systembrowser. Ohne das laege auf einer
  // fremden Seite dieselbe Bruecke zum Dateisystem wie auf der eigenen.
  sicht.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  sicht.webContents.on('will-navigate', (event, url) => {
    if (devServerUrl && url.startsWith(devServerUrl)) return;
    event.preventDefault();
    const ziel = new URL(url);
    if (ziel.protocol === 'http:' || ziel.protocol === 'https:') void shell.openExternal(ziel.href);
  });
}

/** Laedt in eine Ansicht, was die Montage-Schnittstelle angegeben hat. */
async function lade(
  sicht: WebContentsView,
  quelle: { devServerUrl: string | null; indexFile: string | null }
): Promise<void> {
  if (quelle.devServerUrl) await sicht.webContents.loadURL(quelle.devServerUrl);
  else await sicht.webContents.loadFile(quelle.indexFile!);
}

/**
 * Baut die Ansicht einer Anwendung und laedt sie.
 *
 * Gibt `null` zurueck, wenn die Huelle die Anwendung noch nicht einbetten
 * kann. Die Oberflaeche zeigt dann ihre Platzhalterflaeche — besser als ein
 * Fehler fuer etwas, das erklaertermassen noch nicht fertig ist.
 */
export async function mountApp(id: string, haken: MontageHaken): Promise<MontierteApp | null> {
  if (id === 'backstory') return montiereBackstory(id, haken);
  if (id === 'mapmaker') return montiereMapmaker(id, haken);
  return null;
}

async function montiereBackstory(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountBackstory({
    userDataDir: datenordner(id),
    distDir: appDistDir(id, 'main'),
    partition: sitzung(id),
    devServerUrl: process.env.BACKSTORY_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: haken.onLanguageChange,
    // Wer den Backstory Creator bisher einzeln benutzt hat, soll seine
    // Kampagnen hier wiederfinden und nicht vor einer leeren Sammlung stehen.
    uebernahmeKandidaten: fruehereSpeicherorte(id)
  });

  const sicht = new WebContentsView({
    webPreferences: {
      preload: eingebettet.preloadPath,
      partition: sitzung(id),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  sichereAb(sicht, eingebettet.devServerUrl);

  let geladen = false;
  return {
    id,
    sicht,
    nachladen: async () => {
      await lade(sicht, eingebettet);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(sicht.webContents as WebContents),
    darfSchliessen: (elternfenster) =>
      eingebettet.darfSchliessen(sicht.webContents as WebContents, elternfenster),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language)
  };
}

async function montiereMapmaker(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = mountMapmaker({
    // Der Karteneditor hat keinen Hauptprozess; sein Vite-Build liegt direkt
    // in dist/, nicht in dist/renderer/ wie beim Backstory Creator.
    distDir: appDistDir(id),
    devServerUrl: process.env.MAPMAKER_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: haken.onLanguageChange
  });

  // Vor dem Laden: die Kopfzeile muss stehen, bevor die erste Antwort kommt.
  setzeCsp(sitzung(id), eingebettet.csp);

  const sicht = new WebContentsView({
    webPreferences: {
      preload: eingebettet.preloadPath,
      partition: sitzung(id),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  sichereAb(sicht, eingebettet.devServerUrl);

  let geladen = false;
  return {
    id,
    sicht,
    nachladen: async () => {
      await lade(sicht, eingebettet);
      // Der Karteneditor liest seine Sprache beim Start aus seinem eigenen
      // Browserspeicher, bevor die Huelle ihm etwas sagen kann — anders als
      // beim Backstory Creator gibt es hier keine gemeinsam gelesene
      // Einstellungsdatei. Dieser Aufruf gleicht das nach jedem Laden an.
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language)
  };
}
