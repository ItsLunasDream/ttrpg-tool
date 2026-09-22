/**
 * Die Schnittstelle, ueber die eine Huelle diese Anwendung einbettet.
 *
 * Der Story Creator laeuft auf zwei Wegen: allein, mit `src/main/index.ts`
 * als eigenem Hauptprozess, und eingebettet, wo die Huelle den Hauptprozess
 * stellt und diese Datei aufruft. Beide Wege benutzen denselben Code — was
 * hier passiert, passiert dort genauso, nur dass die Huelle das Fenster und
 * die Ansicht mitbringt.
 *
 * Diese Datei ist der einzige Zugang von aussen. Sie kapselt drei Dinge, die
 * sonst jeder Aufrufer selbst richtig hinbekommen muesste: die Reihenfolge
 * (Einstellungen lesen, Vault oeffnen, Protokoll anmelden, IPC
 * registrieren), die Pfade zu Preload und Oberflaeche, und das Sichern
 * ungespeicherter Aenderungen vor dem Schliessen.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { dialog, ipcMain, shell } from 'electron';
import type { BaseWindow } from 'electron';
import type { IpcMainEvent, WebContents } from 'electron';
import { Vault, readSettings, writeSettings } from './vault';
import { registerIpc } from './ipc';
import { handleAssetProtocol, registerAssetScheme } from './assetProtocol';
import { findeUebernahme } from './uebernahme';
import { channel } from '../shared/channels';
import { richteRechtschreibungEin, setzePruefsprache } from './rechtschreibung';
import {
  baueBeschreibung,
  frageNachOrdner,
  fuehreBefehlAus,
  setzeWert,
  type Umgebung as EinstellungsUmgebung
} from './werkzeugeinstellungen';
import type { KiQuelle } from './ai';
import type { AppSettings } from '../shared/types';
import type { Werkzeugeinstellungen, Wert } from '@suite/einstellungen';

export { registerAssetScheme };
export { CHANNEL_PREFIX } from '../shared/channels';

export interface BackstoryEmbedOptions {
  /**
   * Verzeichnis, in dem `settings.json` liegt und unter dem der Speicherort
   * angelegt wird, wenn in den Einstellungen keiner steht.
   *
   * Wird uebergeben und nicht selbst bei `app.getPath('userData')` erfragt:
   * die Huelle entscheidet, wo ihre Anwendungen ablegen, nicht die Anwendung.
   */
  readonly userDataDir: string;
  /** Gesetzt, wenn die Oberflaeche vom Entwicklungsserver kommen soll. */
  readonly devServerUrl?: string;
  /**
   * Verzeichnis des gebuendelten Hauptprozesses dieser Anwendung. Daneben
   * liegt `preload.js`, eine Ebene darueber die gebaute Oberflaeche.
   *
   * Muss angegeben werden, wenn diese Datei in ein anderes Buendel wandert —
   * und genau das passiert beim Einbetten: `__dirname` zeigt dann auf das
   * Verzeichnis der Huelle, nicht auf das dieser Anwendung, und die Ansicht
   * bliebe leer. Ohne Angabe gilt `__dirname`, was fuer den eigenstaendigen
   * Start richtig ist.
   */
  readonly distDir?: string;
  /**
   * Sitzung, in der die Anwendung laeuft. Die Huelle gibt jeder Anwendung eine
   * eigene; ohne Angabe gilt die Standardsitzung, wie beim eigenstaendigen
   * Start.
   */
  readonly partition?: string;
  /**
   * Die Sprache, mit der diese Anwendung beim Montieren beginnen soll — die
   * der Sammlung, nicht zwingend die zuletzt hier selbst gespeicherte. Weicht
   * sie von der gespeicherten ab, wird sie uebernommen und geschrieben.
   *
   * Ohne Angabe gilt, was in den eigenen Einstellungen steht — der
   * eigenstaendige Start setzt sie nicht.
   */
  readonly language?: AppSettings['language'];
  /**
   * Wird gerufen, wenn in dieser Anwendung die Sprache umgestellt wird.
   *
   * Die Huelle fuehrt die Sprache fuer die ganze Sammlung; ohne diese Meldung
   * wuesste sie von einer Aenderung hier nichts, und die Werkzeuge liefen
   * auseinander.
   */
  readonly onLanguageChange?: (language: AppSettings['language']) => void;
  /**
   * Speicherorte, die uebernommen werden, wenn diese Anwendung hier zum
   * ersten Mal laeuft und selbst noch keinen hat.
   *
   * Gedacht fuer den Umzug in die Huelle: dort bekommt jede Anwendung ihren
   * eigenen Datenordner, und der ist ein anderer als der des eigenstaendigen
   * Programms. Ohne diesen Weg stuende die Person beim ersten Start vor einer
   * leeren Sammlung — ihre Kampagnen liegen noch da, nur woanders, und nichts
   * auf dem Schirm sagt ihr das.
   *
   * Der erste Eintrag, der wirklich Kampagnen enthaelt, gewinnt. Uebernommen
   * wird nur der *Pfad*: nichts wird kopiert, nichts verschoben, nichts
   * ueberschrieben. Wer die Trennung will, stellt den Ordner in den
   * Einstellungen wieder um.
   */
  readonly uebernahmeKandidaten?: readonly string[];
  /**
   * Woher die KI-Anbindung kommt, wenn nicht aus den eigenen Einstellungen.
   *
   * In der Huelle wird die KI einmal fuer die ganze Sammlung eingerichtet.
   * Ist das gesetzt, gilt sie hier statt der eigenen, und der Abschnitt in
   * den Einstellungen dieser Anwendung verschwindet — zwei Stellen fuer
   * dieselbe Sache waeren eine zu viel, und wer in der falschen einstellt,
   * sucht den Fehler lange.
   *
   * Eine Funktion und kein Schnappschuss: wer die KI in der Huelle umstellt,
   * soll das im naechsten Klick merken.
   */
  readonly kiQuelle?: KiQuelle;
  /**
   * Ob eine Huelle diese Anwendung einbettet.
   *
   * Entscheidet ueber den eigenen Einstellungen-Dialog: in der Huelle stehen
   * die Einstellungen in DEREN Dialog, und ein zweiter hier waere die
   * zweite Stelle, an der man dasselbe sucht. Allein gestartet gibt es keine
   * Huelle, dann bleibt der eigene Dialog der einzige Weg.
   */
  readonly inHuelle?: boolean;
}

export interface BackstoryEmbed {
  /** Preload-Skript, das die Ansicht laden muss. */
  readonly preloadPath: string;
  /** Datei der Oberflaeche, oder `null`, wenn stattdessen `devServerUrl` gilt. */
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly settings: AppSettings;
  readonly vault: Vault;
  /**
   * Die Einstellungen, wie sie JETZT sind.
   *
   * `settings` daneben ist ein Schnappschuss vom Montagezeitpunkt und
   * veraltet, sobald jemand die Kampagne wechselt. Wer wissen will, woran
   * gerade gearbeitet wird — etwa der NPC Creator, der seine Figur irgendwo
   * ablegen muss —, braucht den aktuellen Stand.
   */
  aktuelleEinstellungen(): AppSettings;
  /**
   * Gibt der Oberflaeche Gelegenheit, Ungespeichertes zu sichern, und wartet
   * darauf — laengstens `timeoutMs`.
   *
   * Ueber `beforeunload` geht das nicht: Electron bricht damit das Schliessen
   * ab, ohne einen Dialog zu zeigen, und das Fenster liesse sich nicht mehr
   * schliessen. Antwortet die Oberflaeche gar nicht, laeuft die Frist ab und
   * es geht trotzdem weiter — ein Fenster, das sich nicht schliessen laesst,
   * waere schlimmer als eine verlorene Sekunde Tipparbeit.
   */
  flush(webContents: WebContents, timeoutMs?: number): Promise<void>;
  /**
   * Fragt vor dem Schliessen nach Ungespeichertem und zeigt noetigenfalls den
   * Dialog.
   *
   * Antwortet `true`, wenn geschlossen werden darf, und `false`, wenn die
   * Person abgebrochen hat.
   *
   * Das ist der Nachfolger von `flush` fuer den Schliessen-Fall: `flush`
   * schreibt kommentarlos, und genau das soll bei ausgeschaltetem Autosave
   * nicht mehr passieren. Wer die Einstellung ausschaltet, will gefragt
   * werden — nicht ueberstimmt.
   */
  darfSchliessen(webContents: WebContents, elternfenster?: BaseWindow): Promise<boolean>;
  /**
   * Setzt die Sprache von aussen und schreibt sie in die Einstellungen dieser
   * Anwendung — sie soll auch beim naechsten eigenstaendigen Start gelten.
   *
   * Loest `onLanguageChange` bewusst *nicht* aus: die Aenderung kam ja von
   * dort, und die Meldung liefe im Kreis.
   */
  setLanguage(webContents: WebContents, language: AppSettings['language']): Promise<void>;
  /**
   * Sagt der Oberflaeche, dass im Speicherort etwas dazugekommen ist, das
   * nicht von ihr stammt.
   *
   * Gebraucht, seit der NPC Creator Figuren hier ablegt. Die Notiz landet auf
   * der Platte, aber die offene Liste hat ihren Stand vom Oeffnen — und beim
   * Zurueckwechseln wird die Ansicht bewusst nicht neu geladen, das wuerfe
   * den Zustand weg. Ohne diese Meldung sieht es aus, als waere gar nichts
   * angelegt worden.
   *
   * Nur die Liste wird neu geholt, nicht die offene Notiz: wer gerade
   * schreibt, soll seinen Text behalten.
   */
  meldeFremdeAenderung(webContents: WebContents): void;
  /**
   * Sagt der Oberflaeche, dass sich die KI-Einstellung der Sammlung geaendert
   * hat.
   *
   * Ohne das fragt sie den Zustand nur einmal beim Laden ab: wer die KI in
   * der Huelle abschaltet, saehe den Assistenten weiter, bis zufaellig etwas
   * anderes ein Neuzeichnen ausloest.
   */
  meldeKiWechsel(webContents: WebContents): void;

  /**
   * Haengt die Rechtschreibpruefung an eine Ansicht: Sprache setzen und das
   * angestrichene Wort an die Oberflaeche weiterreichen. Beide Wege — die
   * eigenstaendige Anwendung und die Huelle — rufen das nach dem Anlegen
   * ihrer Ansicht.
   */
  richteRechtschreibungEin(webContents: WebContents): void;

  /**
   * Meldet der Huelle, welche Notiz gerade offen ist, und nimmt einen
   * Sprung aus deren Verlauf entgegen. Die eigenstaendige Anwendung ruft das
   * nicht — dort gibt es keinen Verlauf ueber Werkzeuge hinweg.
   */
  beobachteVerlauf(webContents: WebContents, beiOrt: (ort: string | null) => void): () => void;
  springeZuOrt(webContents: WebContents, ort: string | null): void;

  /**
   * Die eigenen Einstellungen, beschrieben fuer den Dialog der Huelle.
   *
   * Der eigene Dialog bleibt fuer den eigenstaendigen Start; eingebettet
   * waere er die zweite Stelle, an der man dasselbe sucht.
   */
  werkzeugEinstellungen(webContents: WebContents): Promise<Werkzeugeinstellungen>;
  setzeWerkzeugEinstellung(
    webContents: WebContents,
    feldId: string,
    wert: Wert
  ): Promise<Werkzeugeinstellungen>;
  werkzeugBefehl(
    webContents: WebContents,
    befehlId: string,
    wert?: string
  ): Promise<Werkzeugeinstellungen>;
}

/**
 * Richtet den Story Creator im laufenden Hauptprozess ein und liefert,
 * was die Huelle zum Anzeigen braucht.
 *
 * Muss nach `app.whenReady()` aufgerufen werden. `registerAssetScheme()`
 * dagegen muss *davor* laufen und wird deshalb getrennt exportiert.
 */
export async function mountBackstory(options: BackstoryEmbedOptions): Promise<BackstoryEmbed> {
  const settingsFile = path.join(options.userDataDir, 'settings.json');
  const defaultRoot = path.join(options.userDataDir, 'vault');
  const uebernommen = await findeUebernahme(settingsFile, options.uebernahmeKandidaten);
  let settings = await readSettings(settingsFile, uebernommen ?? defaultRoot);
  if (uebernommen) {
    // Festschreiben, damit die Uebernahme genau einmal passiert. Beim
    // naechsten Start gilt die Datei, und wer den Ordner inzwischen
    // umgestellt hat, bekommt nicht den alten zurueck.
    settings = await writeSettings(settingsFile, settings);
    console.log(`[backstory] Vorhandenen Speicherort uebernommen: ${uebernommen}`);
  }
  if (options.language && options.language !== settings.language) {
    settings = await writeSettings(settingsFile, { ...settings, language: options.language });
  }

  const vault = new Vault(settings.vaultRoot);
  vault.setHistoryOptions({
    enabled: settings.historyEnabled,
    maxVersions: settings.historyMaxVersions
  });
  await vault.init();
  handleAssetProtocol(vault, options.partition);

  const kontext = {
    vault,
    settingsFile,
    settings,
    onLanguageChange: options.onLanguageChange,
    kiQuelle: options.kiQuelle,
    inHuelle: Boolean(options.inHuelle)
  };
  registerIpc(kontext);

  const distDir = options.distDir ?? __dirname;

  /*
   * Was der Einstellungs-Abschnitt in der Huelle braucht.
   *
   * Jede Aenderung von dort meldet sich anschliessend bei der Oberflaeche:
   * sie haelt die Einstellungen im Speicher, und ohne die Meldung schriebe
   * sie weiter mit der alten Wartezeit und zeigte den alten Ordner. Die
   * Sprache geht ueber ihren eigenen Kanal, den es dafuer schon gibt.
   */
  const umgebungFuer = (webContents: WebContents | null): EinstellungsUmgebung => ({
    einstellungen: () => kontext.settings,
    sitzung: () => (webContents && !webContents.isDestroyed() ? webContents.session : null),
    schreibe: async (teil) => {
      const vorherigeSprache = kontext.settings.language;
      // Der Speicherort wird hier bewusst nicht mitgeschrieben: er haengt am
      // Vault und geht ueber `waehleSpeicherort`.
      kontext.settings = await writeSettings(settingsFile, {
        ...kontext.settings,
        ...teil,
        vaultRoot: kontext.settings.vaultRoot
      });
      vault.setHistoryOptions({
        enabled: kontext.settings.historyEnabled,
        maxVersions: kontext.settings.historyMaxVersions
      });
      if (kontext.settings.language !== vorherigeSprache) {
        if (webContents && !webContents.isDestroyed()) {
          // Die Pruefung muss mitwandern, sonst streicht sie den halben Text an.
          setzePruefsprache(webContents.session, kontext.settings.language);
          webContents.send(channel('app:sprache'), kontext.settings.language);
        }
        /*
         * Und die Huelle erfaehrt es genauso wie bei einer Umstellung im
         * Werkzeug selbst: eine Aenderung an irgendeiner Stelle soll ueberall
         * ankommen, das war die Anforderung. Im Kreis laeuft das nicht — die
         * Huelle schickt die Meldung an alle offenen Werkzeuge AUSSER dem
         * meldenden zurueck.
         *
         * Weggelassen hatte ich das erst mit der Begruendung „die Huelle hat
         * ja umgestellt". Falsch: umgestellt wurde die Sprache DIESES
         * Werkzeugs, und die Kopplung an die uebrigen haengt genau hier.
         */
        options.onLanguageChange?.(kontext.settings.language);
      }
      meldeEinstellungen(webContents);
      return kontext.settings;
    },
    waehleSpeicherort: async () => {
      const ordner = await frageNachOrdner(webContents);
      if (!ordner) return null;
      vault.setRoot(ordner);
      await vault.init();
      // Die zuletzt offene Kampagne gehoert zum alten Ordner. Sie stehen zu
      // lassen hiesse, beim naechsten Start eine Kampagne zu suchen, die es
      // hier nicht gibt.
      kontext.settings = await writeSettings(settingsFile, {
        ...kontext.settings,
        vaultRoot: ordner,
        lastCampaignId: null
      });
      meldeEinstellungen(webContents);
      // Die Oberflaeche haelt Kampagnen und Notizen im Speicher; nach einem
      // Ortswechsel stimmt davon nichts mehr.
      if (webContents && !webContents.isDestroyed()) {
        webContents.send(channel('app:speicherort'), ordner);
      }
      return kontext.settings;
    },
    zeigeSpeicherort: async () => {
      await fs.mkdir(vault.vaultRoot, { recursive: true });
      await shell.openPath(vault.vaultRoot);
    }
  });

  function meldeEinstellungen(webContents: WebContents | null): void {
    if (webContents && !webContents.isDestroyed()) {
      webContents.send(channel('app:einstellungen'), kontext.settings);
    }
  }

  return {
    // Das Preload liegt neben dem Hauptprozess, die Oberflaeche eine Ebene
    // darueber. Die Huelle laedt das Preload dieser Anwendung, nicht ihr
    // eigenes: sonst faende die Oberflaeche ihre Bruecke nicht.
    preloadPath: path.join(distDir, 'preload.js'),
    indexFile: options.devServerUrl ? null : path.join(distDir, '../renderer/index.html'),
    devServerUrl: options.devServerUrl ?? null,
    settings,
    vault,
    aktuelleEinstellungen: () => kontext.settings,
    flush: (webContents, timeoutMs = 3000) => flushWebContents(webContents, timeoutMs),
    darfSchliessen: (webContents, elternfenster) =>
      frageVorDemSchliessen(webContents, kontext.settings.language, elternfenster),
    meldeFremdeAenderung: (webContents) => {
      if (!webContents.isDestroyed()) webContents.send(channel('app:fremde-aenderung'));
    },
    meldeKiWechsel: (webContents) => {
      if (!webContents.isDestroyed()) webContents.send(channel('app:ki-gewechselt'));
    },
    richteRechtschreibungEin: (webContents) => {
      richteRechtschreibungEin(webContents, kontext.settings.language);
    },
    beobachteVerlauf: (webContents, beiOrt) => {
      const hoerer = (ereignis: IpcMainEvent, ort: string | null) => {
        // Nur die eigene Ansicht: in der Huelle laufen mehrere Anwendungen
        // im selben Hauptprozess, und der Kanal ist global.
        if (ereignis.sender === webContents) beiOrt(ort);
      };
      ipcMain.on(channel('app:verlauf-melde'), hoerer);
      return () => ipcMain.off(channel('app:verlauf-melde'), hoerer);
    },
    springeZuOrt: (webContents, ort) => {
      if (!webContents.isDestroyed()) webContents.send(channel('app:verlauf-springe'), ort);
    },
    werkzeugEinstellungen: (webContents) => baueBeschreibung(umgebungFuer(webContents)),
    setzeWerkzeugEinstellung: (webContents, feldId, wert) =>
      setzeWert(umgebungFuer(webContents), feldId, wert),
    werkzeugBefehl: (webContents, befehlId, wert) =>
      fuehreBefehlAus(umgebungFuer(webContents), befehlId, wert),
    setLanguage: async (webContents, language) => {
      if (kontext.settings.language === language) return;
      kontext.settings = await writeSettings(settingsFile, { ...kontext.settings, language });
      if (!webContents.isDestroyed()) {
        // Die Pruefung muss mitwandern, sonst streicht sie den halben Text an.
        setzePruefsprache(webContents.session, language);
        webContents.send(channel('app:sprache'), language);
      }
    }
  };
}

/**
 * Beschriftungen des Schliessen-Dialogs.
 *
 * Nicht ueber das i18n-Modul der Oberflaeche: das laeuft im Renderer, und
 * dieser Dialog ist ein Fenster des Betriebssystems. Vier Zeilen doppelt zu
 * fuehren ist billiger, als den Hauptprozess an die Textverwaltung der
 * Oberflaeche zu haengen.
 */
interface Dialogtexte {
  readonly titel: string;
  readonly frage: (anzahl: number) => string;
  readonly hinweis: string;
  readonly speichern: string;
  readonly verwerfen: string;
  readonly abbrechen: string;
}

const DIALOGTEXTE: Record<'de' | 'en', Dialogtexte> = {
  de: {
    titel: 'Nicht gespeicherte Änderungen',
    frage: (anzahl: number) =>
      anzahl === 1
        ? 'Eine Notiz hat ungespeicherte Änderungen.'
        : `${anzahl} Notizen haben ungespeicherte Änderungen.`,
    hinweis: 'Ohne Speichern gehen sie verloren.',
    speichern: 'Speichern',
    verwerfen: 'Nicht speichern',
    abbrechen: 'Abbrechen'
  },
  en: {
    titel: 'Unsaved changes',
    frage: (anzahl: number) =>
      anzahl === 1 ? 'One note has unsaved changes.' : `${anzahl} notes have unsaved changes.`,
    hinweis: 'They will be lost unless you save.',
    speichern: 'Save',
    verwerfen: "Don't save",
    abbrechen: 'Cancel'
  }
};

/** Fragt den Renderer, welche Notizen ungespeichert sind. */
function frageUngespeicherte(webContents: WebContents, timeoutMs: number): Promise<string[]> {
  if (webContents.isDestroyed()) return Promise.resolve([]);
  return new Promise((resolve) => {
    const antwort = (_event: unknown, titel: string[]) => {
      clearTimeout(frist);
      resolve(Array.isArray(titel) ? titel : []);
    };
    // Antwortet die Oberflaeche nicht, wird geschlossen. Ein Fenster, das sich
    // nicht mehr schliessen laesst, waere schlimmer als der Verlust — und
    // dass sie nicht antwortet, heisst meistens, dass sie haengt.
    const frist = setTimeout(() => {
      ipcMain.removeListener(channel('app:ungespeichert'), antwort);
      resolve([]);
    }, timeoutMs);
    ipcMain.once(channel('app:ungespeichert'), antwort);
    webContents.send(channel('app:frage-ungespeichert'));
  });
}

/** Laesst den Renderer alles Ungespeicherte schreiben und wartet darauf. */
function speichereAlles(webContents: WebContents, timeoutMs: number): Promise<void> {
  if (webContents.isDestroyed()) return Promise.resolve();
  return new Promise((resolve) => {
    const fertig = () => {
      clearTimeout(frist);
      ipcMain.removeListener(channel('app:alles-gespeichert'), fertig);
      resolve();
    };
    const frist = setTimeout(fertig, timeoutMs);
    ipcMain.once(channel('app:alles-gespeichert'), fertig);
    webContents.send(channel('app:speichere-alles'));
  });
}

/**
 * Der Ablauf beim Schliessen: fragen, gegebenenfalls den Dialog zeigen,
 * antworten, ob geschlossen werden darf.
 *
 * Der Dialog ist ein nativer und kein HTML-Dialog. Zwei Gruende: eingebettet
 * in der Huelle liegt die Anwendung *vor* der Huelle, ein Dialog in einer der
 * beiden Ansichten waere je nach Lage verdeckt — und ein Fenster des Systems
 * haelt das Schliessen wirklich auf, waehrend eine Seite im Renderer bloss
 * darum bitten kann.
 */
async function frageVorDemSchliessen(
  webContents: WebContents,
  sprache: AppSettings['language'],
  elternfenster: BaseWindow | undefined
): Promise<boolean> {
  const ungespeichert = await frageUngespeicherte(webContents, 3000);
  if (ungespeichert.length === 0) {
    // Nichts offen — aber die Oberflaeche bekommt trotzdem ihr `flush`: bei
    // eingeschaltetem Autosave sichert sie dort den letzten Tastendruck.
    await flushWebContents(webContents, 3000);
    return true;
  }

  const texte = DIALOGTEXTE[sprache === 'de' ? 'de' : 'en'];
  // Hoechstens fuenf Titel: bei zwanzig offenen Notizen wuerde der Dialog
  // sonst laenger als der Bildschirm.
  const liste = ungespeichert.slice(0, 5).join('\n');
  const rest = ungespeichert.length > 5 ? `\n… (+${ungespeichert.length - 5})` : '';

  const { response } = await (elternfenster
    ? dialog.showMessageBox(elternfenster, bauDialog(texte, ungespeichert.length, liste + rest))
    : dialog.showMessageBox(bauDialog(texte, ungespeichert.length, liste + rest)));

  if (response === 2) return false; // Abbrechen
  if (response === 0) await speichereAlles(webContents, 10_000); // Speichern
  return true; // Speichern oder Verwerfen
}

function bauDialog(
  texte: Dialogtexte,
  anzahl: number,
  liste: string
): Electron.MessageBoxOptions {
  return {
    type: 'warning',
    title: texte.titel,
    message: texte.frage(anzahl),
    detail: `${liste}\n\n${texte.hinweis}`,
    // Reihenfolge ist die Antwortnummer. „Speichern" vorn, weil es das
    // Gemeinte ist; „Abbrechen" als Fluchtweg auf Escape.
    buttons: [texte.speichern, texte.verwerfen, texte.abbrechen],
    defaultId: 0,
    cancelId: 2,
    noLink: true
  };
}

function flushWebContents(webContents: WebContents, timeoutMs: number): Promise<void> {
  if (webContents.isDestroyed()) return Promise.resolve();

  return new Promise((resolve) => {
    const fertig = () => {
      clearTimeout(frist);
      ipcMain.removeListener(channel('app:flushed'), fertig);
      resolve();
    };
    const frist = setTimeout(fertig, timeoutMs);
    ipcMain.once(channel('app:flushed'), fertig);
    webContents.send(channel('app:flush'));
  });
}
