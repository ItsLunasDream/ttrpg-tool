/**
 * Die Montage-Schnittstelle des Status Effect Creators (Konvention 7).
 *
 * Die Huelle ruft `mountZustaende` und bekommt zurueck, was sie zum Anzeigen
 * braucht. Kein eigenstaendiger Hauptprozess.
 *
 * Eine EIGENE ABLAGE: ein Ordner `zustaende` im Datenordner, eine
 * Markdown-Datei je Zustand. Grund ist der Initiative Tracker — er soll
 * eigene Zustaende anzeigen koennen, ohne dass es einen Kanal zwischen den
 * beiden Werkzeugen gibt. Derselbe Ordner ist die billigste Kopplung, die es
 * gibt, und sie ueberlebt, wenn eines der beiden umgebaut wird.
 *
 * Ein Zustand gehoert dabei keiner Kampagne: er ist Handwerkszeug, das ueber
 * Kampagnen hinweg gilt.
 */
import path from 'node:path';
import os from 'node:os';
import { mkdir, mkdtemp, readFile, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import type { WebContents } from 'electron';
import { baueAnbieter, KiFehler, leseJsonAntwort } from '@suite/ki';
import type { KiEinstellungen } from '@suite/ki/einstellungen';
import { kanal } from '../shared/kanaele';
import { alsEintrag, alsMarkdown, zuId, type Abgelegt, type Eintrag } from '../shared/ablage';
import type { Eintrag as SuchEintrag } from '@suite/eintraege';
import { anweisung, systemAnweisung, uebernehmbar, type Frage } from '../shared/kiAufgaben';
import type { Sprache } from '../shared/tabellen';

export type KiQuelle = () => { einstellungen: KiEinstellungen; schluessel: string };

export interface KiErgebnis<T> {
  readonly ok: boolean;
  readonly wert: T | null;
  /** Ein Textschluessel, kein fertiger Satz — die Oberflaeche uebersetzt. */
  readonly grund: string;
}

export interface ZustaendeEmbedOptions {
  readonly distDir: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
  /** Wohin die Zustaende gehoeren. Ueblicherweise der Datenordner der Huelle. */
  readonly datenordner: string;
  readonly kiQuelle?: KiQuelle;
  /** Legt eine Notiz im Story Creator an. Fehlt sie, meldet der Export es ehrlich. */
  readonly anlegen?: (titel: string, markdown: string) => Promise<{ ok: boolean; text: string }>;
}

export interface ZustaendeEmbed {
  readonly preloadPath: string;
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly csp: string;
  /** Wo die Zustaende liegen. Der Initiative Tracker wird denselben Pfad lesen. */
  readonly ordner: string;
  flush(): Promise<void>;
  setLanguage(webContents: WebContents, language: string): Promise<void>;
  meldeKiWechsel(webContents: WebContents): void;
  /**
   * Zeigt einen Eintrag, den die Suche der Huelle gefunden hat.
   *
   * Antwortet `false`, wenn die Ansicht weg ist. Ob es den Eintrag noch
   * gibt, entscheidet die Oberflaeche — sie hat die Liste.
   */
  zeigeEintrag(webContents: WebContents, kennung: string): Promise<boolean>;
}

/**
 * Die Richtlinie. Alles aus den eigenen Dateien.
 *
 * `connect-src 'self'` bleibt zu, auch mit KI: die Anfrage geht vom
 * Hauptprozess aus, nicht von der Oberflaeche. Der Schluessel erreicht den
 * Renderer nie.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'"
].join('; ');

/** Der Ordnername im Datenordner. Taucht in der Oberflaeche auf. */
export const ORDNER_NAME = 'zustaende';

/**
 * Was dieses Werkzeug abgelegt hat, fuer die Suche der Huelle.
 *
 * Liest direkt von der Platte, ohne geladene Ansicht: die Suche soll auch
 * Zustaende finden, die man in dieser Sitzung noch nicht offen hatte.
 */
export async function leseEintraege(datenordner: string): Promise<SuchEintrag[]> {
  /*
   * ZWEIMAL der Name, und das ist kein Tippfehler — siehe `mountZustaende`
   * unten: die Huelle gibt dem Werkzeug `<userData>/zustaende`, und die
   * Ablage legt darin noch einen Ordner an.
   *
   * Hier stand lange nur einer, und damit las die Suche den Elternordner
   * und fand keinen einzigen echten Zustand.
   */
  const ordner = path.join(datenordner, ORDNER_NAME, ORDNER_NAME);
  let dateien: string[];
  try {
    dateien = await readdir(ordner);
  } catch {
    return [];
  }
  const heraus: SuchEintrag[] = [];
  for (const name of dateien) {
    if (!name.endsWith('.md')) continue;
    try {
      const eintrag = alsEintrag(await readFile(path.join(ordner, name), 'utf8'), name.slice(0, -3));
      heraus.push({
        werkzeug: 'zustaende',
        kennung: eintrag.id,
        name: eintrag.name,
        art: 'Zustand',
        // Der Paketname gehoert dazu: wer ein Paket gewuerfelt hat, sucht
        // oft danach und nicht nach dem einzelnen Zustand darin.
        stichworte: [eintrag.artId, eintrag.themaId, eintrag.haerteId, eintrag.paketName]
          .filter(Boolean)
          .join(' ')
      });
    } catch {
      // Eine kaputte Datei nimmt nicht die ganze Suche mit.
    }
  }
  return heraus;
}

export async function mountZustaende(options: ZustaendeEmbedOptions): Promise<ZustaendeEmbed> {
  const ordner = path.join(options.datenordner, ORDNER_NAME);
  await mkdir(ordner, { recursive: true });

  const datei = (id: string) => path.join(ordner, `${id}.md`);

  /* ---------- Ablage ---------- */

  /**
   * Die Liste, ohne die Leiber zu lesen.
   *
   * Gelesen werden muss die Datei trotzdem — der Kopf steht darin. Bei ein
   * paar hundert Zustaenden ist das nichts; bei deutlich mehr braeuchte es
   * einen Index, und dann faellt es hier auf.
   */
  ipcMain.removeHandler(kanal('liste'));
  ipcMain.handle(kanal('liste'), async (): Promise<Eintrag[]> => {
    let dateien: string[];
    try {
      dateien = await readdir(ordner);
    } catch {
      return [];
    }
    const heraus: Eintrag[] = [];
    for (const name of dateien) {
      if (!name.endsWith('.md')) continue;
      try {
        const inhalt = await readFile(path.join(ordner, name), 'utf8');
        heraus.push(alsEintrag(inhalt, name.slice(0, -3)));
      } catch {
        // Eine kaputte Datei nimmt nicht die ganze Sammlung mit.
      }
    }
    return heraus;
  });

  ipcMain.removeHandler(kanal('lesen'));
  ipcMain.handle(kanal('lesen'), async (_e, id: string): Promise<string | null> => {
    try {
      return await readFile(datei(zuId(id)), 'utf8');
    } catch {
      return null;
    }
  });

  ipcMain.removeHandler(kanal('speichern'));
  ipcMain.handle(
    kanal('speichern'),
    async (_e, zustand: Abgelegt, sprache: Sprache): Promise<{ ok: boolean; id: string; text: string }> => {
      const id = zuId(zustand.id || zustand.name);
      try {
        await writeFile(
          datei(id),
          alsMarkdown({ ...zustand, id, geaendert: new Date().toISOString() }, sprache),
          'utf8'
        );
        return { ok: true, id, text: '' };
      } catch (fehler) {
        return { ok: false, id, text: String(fehler instanceof Error ? fehler.message : fehler) };
      }
    }
  );

  ipcMain.removeHandler(kanal('loeschen'));
  ipcMain.handle(kanal('loeschen'), async (_e, id: string): Promise<boolean> => {
    try {
      await unlink(datei(zuId(id)));
      return true;
    } catch {
      return false;
    }
  });

  /* ---------- Die Karte zum Vorlesen ---------- */

  /**
   * Aus dem HTML der Karte wird ein PDF.
   *
   * Derselbe Weg wie beim PDF-Export des Story Creators: ein unsichtbares
   * Fenster laedt eine temporaere Datei und druckt sie. Eine temporaere
   * Datei und keine `data:`-Adresse, weil letztere bei laengeren Dokumenten
   * abgeschnitten wird.
   *
   * Der Renderer schickt nur das HTML — er baut es aus `karte.ts`, und
   * derselbe Text steht auf dem Schirm. Zwei Wege zu demselben Blatt waeren
   * zwei Blaetter, die irgendwann auseinanderlaufen.
   */
  ipcMain.removeHandler(kanal('karte'));
  ipcMain.handle(
    kanal('karte'),
    async (_e, html: string, vorschlag: string): Promise<{ ok: boolean; pfad: string; text: string }> => {
      const ziel = await dialog.showSaveDialog({
        defaultPath: `${vorschlag || 'karte'}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      });
      if (ziel.canceled || !ziel.filePath) return { ok: false, pfad: '', text: '' };

      const ordner = await mkdtemp(path.join(os.tmpdir(), 'zustand-karte-'));
      const quelle = path.join(ordner, 'karte.html');
      const fenster = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
      });

      try {
        await writeFile(quelle, html, 'utf8');
        await fenster.loadFile(quelle);
        const daten = await fenster.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });
        await writeFile(ziel.filePath, daten);
        return { ok: true, pfad: ziel.filePath, text: '' };
      } catch (fehler) {
        return {
          ok: false,
          pfad: '',
          text: String(fehler instanceof Error ? fehler.message : fehler)
        };
      } finally {
        fenster.destroy();
        await rm(ordner, { recursive: true, force: true });
      }
    }
  );

  /** Die fertige Karte im System oeffnen. Ein PDF, das niemand findet, ist keins. */
  ipcMain.removeHandler(kanal('karte:zeigen'));
  ipcMain.handle(kanal('karte:zeigen'), async (_e, pfad: string): Promise<boolean> => {
    if (!pfad) return false;
    shell.showItemInFolder(pfad);
    return true;
  });

  /* ---------- Export in den Story Creator ---------- */

  ipcMain.removeHandler(kanal('export'));
  ipcMain.handle(kanal('export'), async (_e, titel: string, markdown: string) => {
    if (!options.anlegen) return { ok: false, text: 'Der Story Creator ist nicht verfügbar.' };
    try {
      return await options.anlegen(titel, markdown);
    } catch (fehler) {
      return { ok: false, text: String(fehler instanceof Error ? fehler.message : fehler) };
    }
  });

  /*
   * Eine Datei fuer Foundry wegschreiben.
   *
   * Derselbe kurze Handler wie im Monster Creator. Ihn zu teilen hiesse, ein
   * Paket mit `electron` darin anzulegen, und Regel 4 haelt packages/ davon
   * frei — fuenfzehn Zeilen doppelt sind billiger als eine gebrochene Regel.
   */
  ipcMain.removeHandler(kanal('foundry'));
  ipcMain.handle(kanal('foundry'), async (ereignis, vorschlag: string, inhalt: string) => {
    try {
      const fenster = BrowserWindow.fromWebContents(ereignis.sender);
      const frage = { defaultPath: vorschlag, filters: [{ name: 'JSON', extensions: ['json'] }] };
      const ergebnis = fenster
        ? await dialog.showSaveDialog(fenster, frage)
        : await dialog.showSaveDialog(frage);
      if (ergebnis.canceled || !ergebnis.filePath) return { ok: false, text: '' };
      await writeFile(ergebnis.filePath, inhalt, 'utf8');
      return { ok: true, text: ergebnis.filePath };
    } catch (fehler) {
      return { ok: false, text: String(fehler instanceof Error ? fehler.message : fehler) };
    }
  });

  /* ---------- KI ---------- */

  const anbieter = () => {
    if (!options.kiQuelle) return null;
    const quelle = options.kiQuelle();
    return baueAnbieter(quelle.einstellungen, quelle.schluessel);
  };

  ipcMain.removeHandler(kanal('ki:da'));
  ipcMain.handle(kanal('ki:da'), () => anbieter() !== null);

  ipcMain.removeHandler(kanal('ki:frage'));
  ipcMain.handle(
    kanal('ki:frage'),
    async (_e, frage: Frage, sprache: Sprache): Promise<KiErgebnis<unknown>> => {
      const gewaehlt = anbieter();
      if (!gewaehlt) return { ok: false, wert: null, grund: 'fehler.kiKeinAnbieter' };
      try {
        const antwort = await gewaehlt.frage(
          {
            system: systemAnweisung(sprache),
            nachrichten: [{ rolle: 'user', inhalt: anweisung(frage, sprache) }]
          },
          // Teiltexte interessieren nicht: es kommt ein kurzes JSON, und ein
          // halb geschriebenes kann die Oberflaeche nicht anzeigen.
          () => {}
        );
        const gelesen = leseJsonAntwort(antwort);
        if (gelesen === null) return { ok: false, wert: null, grund: 'fehler.kiKeinJson' };
        const wert = uebernehmbar(frage.aufgabe, gelesen);
        if (wert === null) return { ok: false, wert: null, grund: 'fehler.kiKeinJson' };
        return { ok: true, wert, grund: '' };
      } catch (fehler) {
        if (fehler instanceof KiFehler) return { ok: false, wert: null, grund: fehler.schluessel };
        return { ok: false, wert: null, grund: 'error.aiOther' };
      }
    }
  );

  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
  ipcMain.on(kanal('sprache:gewechselt'), (_event, language: string) => {
    options.onLanguageChange?.(language);
  });

  return {
    zeigeEintrag: async (webContents, kennung) => {
      if (webContents.isDestroyed()) return false;
      webContents.send(kanal('suche:zeigen'), kennung);
      return true;
    },
    preloadPath: path.join(options.distDir, 'preload.js'),
    indexFile: options.devServerUrl
      ? null
      : path.join(options.distDir, '..', 'renderer', 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    csp: CSP,
    ordner,
    flush: async () => {
      // Gespeichert wird beim Klick, nicht beim Schliessen: ein Zustand ist
      // ein Dokument, kein Sitzungszustand.
    },
    setLanguage: async (webContents, language) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('sprache:gesetzt'), language);
    },
    meldeKiWechsel: (webContents) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('ki:gewechselt'));
    }
  };
}
