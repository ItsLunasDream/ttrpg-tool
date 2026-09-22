/**
 * Das Einbetten der Anwendungen.
 *
 * Jede Anwendung bringt eine Montage-Schnittstelle mit (Konvention 7). Die
 * Huelle ruft sie auf, bekommt Preload und Oberflaeche zurueck und haengt eine
 * Ansicht ins Fenster. Der Code der Anwendung bleibt dabei unveraendert: sie
 * merkt nicht, dass sie in einer Huelle laeuft.
 *
 * Wie verschieden die Anwendungen darunter gebaut sind, sieht man an den zwei
 * bisherigen: der Story Creator bringt einen ganzen Hauptprozess mit,
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
  registerAssetScheme as registerBackstoryScheme,
  type BackstoryEmbed
} from '../../../backstory/src/main/embed';
import { mountMapmaker } from '../../../mapmaker/src/embed';
import {
  mountInitiative,
  registriereBildSchema as registriereInitiativeSchema
} from '../../../initiative/src/main/embed';
import { mountDice } from '../../../dice/src/main/embed';
import { mountNpc } from '../../../npc/src/main/embed';
import { mountInspiration } from '../../../inspiration/src/main/embed';
import { mountMonster } from '../../../monster/src/main/embed';
import { mountZustaende } from '../../../zustaende/src/main/embed';
import type { KiQuelle } from './ki';
import type { Language } from '../shared/i18n';
import type { Werkzeugeinstellungen, Wert } from '@suite/einstellungen';

export interface MontierteApp {
  readonly id: string;
  readonly sicht: WebContentsView;
  /**
   * Beginnt eine leere Karte unter diesem Namen. Nur der Karteneditor kann
   * das; alle anderen lassen es weg.
   */
  neueKarte?(name: string, notizen?: readonly { title: string; text: string }[]): void;
  /**
   * Bringt die Anwendung an eine Stelle zurueck, die der Verlauf kennt.
   * Werkzeuge ohne eigene Stellen lassen das weg.
   */
  springeZuOrt?(ort: string | null): void;
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
  /**
   * Sagt der Anwendung, dass sich die KI-Einstellung der Sammlung geaendert
   * hat — fehlt bei Anwendungen ohne KI.
   *
   * Die Huelle ruft das bei jeder offenen Anwendung auf. Ohne diese Meldung
   * fragen sie den Zustand nur einmal beim Laden ab, und wer die KI umstellt,
   * saehe davon nichts.
   */
  meldeKiWechsel?(): void;
  /**
   * Was dieses Werkzeug an eigenen Einstellungen hat, damit die Huelle es in
   * ihrem Dialog zeigen kann.
   *
   * Warum nicht einfach ein eigener Dialog im Werkzeug? Weil es dann zwei
   * Stellen gaebe, an denen man Einstellungen sucht, und man immer in der
   * falschen zuerst nachsieht. Das Werkzeug beschreibt, WAS es gibt, die
   * Huelle malt es — das Feldschema steht in @suite/einstellungen.
   *
   * Fehlt bei Werkzeugen ohne eigene Einstellungen.
   */
  werkzeugEinstellungen?(): Promise<Werkzeugeinstellungen | null>;
  /**
   * Nimmt einen geaenderten Wert entgegen und liefert den Stand danach.
   *
   * Der Stand danach ist nicht die Eingabe: das Werkzeug darf Werte
   * zurechtruecken, und ein Schalter kann andere Felder sperren. Die Huelle
   * zeigt, was zurueckkommt.
   */
  setzeWerkzeugEinstellung?(feldId: string, wert: Wert): Promise<Werkzeugeinstellungen | null>;
  /** Loest einen Knopf aus (Ordner waehlen, Wort entfernen, ...). */
  werkzeugBefehl?(befehlId: string, wert?: string): Promise<Werkzeugeinstellungen | null>;
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
  /**
   * Wird gerufen, wenn sich in einer anderen Anwendung etwas getan hat.
   *
   * Nicht die Anwendung, in der man gerade steht, meldet etwas ueber sich —
   * sie meldet, dass anderswo etwas dazugekommen ist. Der NPC Creator legt
   * eine Figur im Story Creator an und meldet „backstory"; die Huelle
   * laesst daraufhin eine Farbe ueber dessen Symbol wischen.
   *
   * Die Animation gehoert bewusst in die Huelle und nicht in die Anwendung:
   * sie soll ueberall gleich aussehen, gleich wer sie ausloest.
   */
  readonly onEreignis?: (appId: string) => void;
  /**
   * Beginnt im Karteneditor eine leere Karte unter diesem Namen.
   *
   * Steht hier und nicht als Draht zwischen den beiden Anwendungen: die
   * Inspirationshilfe kennt den Karteneditor nicht, und er kennt sie nicht.
   * Die Huelle holt ihn nach vorn und stellt den Namen zu, sobald er steht.
   */
  readonly oeffneKarte?: (
    name: string,
    notizen: readonly { title: string; text: string }[]
  ) => Promise<boolean>;
  /**
   * Die KI-Anbindung der Sammlung.
   *
   * Eingerichtet wird sie einmal in der Huelle; die Werkzeuge bekommen sie
   * durchgereicht, statt jedes eine eigene zu fuehren. Eine Funktion und kein
   * Schnappschuss: wer sie umstellt, soll das im naechsten Klick merken.
   */
  readonly kiQuelle?: KiQuelle;
  /**
   * Die Anwendung meldet, wo sie gerade steht — im Story Creator die
   * offene Notiz. Der Verlauf der Huelle merkt sich das, damit zurueck nicht
   * nur das Werkzeug trifft, sondern die Stelle darin.
   */
  readonly onOrt?: (ort: string | null) => void;
}

/**
 * Meldet die eigenen Protokolle aller Anwendungen an.
 *
 * Muss vor `app.whenReady()` laufen — danach duerfen keine Schemata mehr
 * angemeldet werden, und der Story Creator koennte seine Bilder nicht
 * ausliefern. Deshalb steht das getrennt vom Montieren, das erst danach geht.
 */
export function registerSchemes(): void {
  registerBackstoryScheme();
  registriereInitiativeSchema();
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
 * gepackte Einzelprogramm „Story Creator", und aus dem Workspace
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
    backstory: ['Story Creator', 'backstory-creator']
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
  if (id === 'initiative') return montiereInitiative(id, haken);
  if (id === 'dice') return montiereDice(id, haken);
  if (id === 'npc') return montiereNpc(id, haken);
  if (id === 'inspiration') return montiereInspiration(id, haken);
  if (id === 'monster') return montiereMonster(id, haken);
  if (id === 'zustaende') return montiereZustaende(id, haken);
  return null;
}

async function montiereDice(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountDice({
    userDataDir: datenordner(id),
    distDir: appDistDir(id, 'main'),
    partition: sitzung(id),
    devServerUrl: process.env.DICE_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: (language) => haken.onLanguageChange(language as Language)
  });

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
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language)
  };
}

/**
 * Der NPC Creator.
 *
 * Er bekommt von der Huelle eine Funktion zum Anlegen — den Vault selbst
 * bekommt er nicht zu sehen. So bleibt die Kenntnis darueber, wo Notizen
 * liegen und welche Kampagne offen ist, an einer Stelle.
 */
/**
 * Der Notiztyp, unter dem ein Werkzeug seine Notiz anlegt.
 *
 * Nicht fest verdrahten: die Notiztypen gehoeren der Kampagne, und wer sie
 * umbaut, hat sie gar nicht mehr alle. `createNote` weist einen unbekannten
 * Typ mit `error.unknownNoteType` ab — genau das ist beim Monster Creator
 * passiert, der unter „creature" anlegte, das es in keiner Vorlage gibt.
 *
 * Deshalb: die Wunschliste der Reihe nach durchgehen und den ersten Typ
 * nehmen, den die Kampagne wirklich kennt. Bleibt keiner uebrig, den ersten
 * ueberhaupt — eine Kampagne ohne Notiztypen gibt es nicht.
 */
function passenderNotiztyp(kampagne: { noteTypes: { id: string }[] }, wuensche: readonly string[]): string {
  for (const wunsch of wuensche) {
    if (kampagne.noteTypes.some((typ) => typ.id === wunsch)) return wunsch;
  }
  return kampagne.noteTypes[0]?.id ?? 'note';
}

async function montiereNpc(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountNpc({
    distDir: appDistDir(id, 'main'),
    devServerUrl: process.env.NPC_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: (language) => haken.onLanguageChange(language as Language),
    // Auch hier die KI der Sammlung. Der NPC Creator hat keine eigene Ablage
    // und soll auch keine eigene Einstellung bekommen.
    kiQuelle: haken.kiQuelle,
    anlegen: async (titel: string, markdown: string) => {
      if (!backstoryEmbed) {
        return {
          ok: false,
          text: 'Öffne den Story Creator einmal, dann weiß die Sammlung, wohin.'
        };
      }
      const kampagnen = await backstoryEmbed.vault.listCampaigns();
      if (kampagnen.length === 0) {
        return { ok: false, text: 'Es gibt noch keine Kampagne, in die die Figur passt.' };
      }
      // Die Kampagne, an der gerade gearbeitet wird. Der Story Creator
      // merkt sie sich in seinen Einstellungen; abgefragt wird der aktuelle
      // Stand und nicht der Schnappschuss vom Montagezeitpunkt, sonst landete
      // die Figur nach einem Kampagnenwechsel in der falschen Sammlung.
      //
      // Eine Auswahl im NPC Creator waere ein zweites Verzeichnis derselben
      // Dinge — und wer eine Figur wirft, denkt gerade nicht an Ablageorte.
      const letzte = backstoryEmbed.aktuelleEinstellungen().lastCampaignId;
      const kampagne = kampagnen.find((eintrag) => eintrag.id === letzte) ?? kampagnen[0];

      const typ = passenderNotiztyp(kampagne, ['character', 'note']);
      const notiz = await backstoryEmbed.vault.createNote(kampagne.id, typ, titel);
      await backstoryEmbed.vault.saveNote(kampagne.id, { ...notiz, body: markdown });

      // Dem Story Creator sagen, dass etwas dazugekommen ist. Ohne das
      // liegt die Notiz zwar auf der Platte, seine offene Liste zeigt sie
      // aber nicht — und es sieht aus, als waere der Export ins Leere
      // gelaufen.
      if (backstorySicht && !backstorySicht.webContents.isDestroyed()) {
        backstoryEmbed.meldeFremdeAenderung(backstorySicht.webContents);
      }
      haken.onEreignis?.('backstory');
      return { ok: true, text: `${titel} → ${kampagne.name}` };
    }
  });

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
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language)    ,
    // Die KI wird in der Huelle eingerichtet; dieses Werkzeug muss es
    // erfahren, sonst fragt es den Zustand nur beim Laden ab.
    meldeKiWechsel: () => eingebettet.meldeKiWechsel(sicht.webContents as WebContents)
  };
}

/**
 * Die Inspirationshilfe.
 *
 * Wie der NPC Creator bekommt sie eine Funktion zum Anlegen und sieht den
 * Vault nie. Der Unterschied: hier kommen mehrere Notizen auf einmal, mit
 * Wiki-Verweisen untereinander. Sie muessen deshalb alle in dieselbe
 * Kampagne, und die wird einmal zu Beginn bestimmt — nicht je Notiz, sonst
 * koennte ein Kampagnenwechsel mitten im Anlegen das Geflecht zerreissen.
 */
async function montiereInspiration(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountInspiration({
    distDir: appDistDir(id, 'main'),
    devServerUrl: process.env.INSPIRATION_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: (language) => haken.onLanguageChange(language as Language),
    // Die KI der Sammlung, wie im NPC Creator. Ein eigener Zugang je Werkzeug
    // waere eine zweite Stelle, an der derselbe Schluessel liegt.
    kiQuelle: haken.kiQuelle,
    /**
     * Wer in der offenen Kampagne schon steht.
     *
     * Damit kommen auch die Figuren des NPC Creators herein: der legt sie als
     * Notiz in derselben Kampagne ab. Ein eigener Draht zwischen den beiden
     * Werkzeugen waere der falsche Weg — sie sollen einzeln lauffaehig
     * bleiben, und die Kampagne ist ohnehin die Stelle, an der die Wahrheit
     * liegt.
     */
    // Der Weg zum Karteneditor. Nicht direkt: die Huelle holt ihn nach vorn.
    karteAnlegen: haken.oeffneKarte,
    figuren: async () => {
      if (!backstoryEmbed) return [];
      const kampagnen = await backstoryEmbed.vault.listCampaigns();
      if (kampagnen.length === 0) return [];
      const letzte = backstoryEmbed.aktuelleEinstellungen().lastCampaignId;
      const kampagne = kampagnen.find((eintrag) => eintrag.id === letzte) ?? kampagnen[0];
      const notizen = await backstoryEmbed.vault.listNotes(kampagne.id);
      return notizen
        .filter((notiz) => notiz.type === 'character')
        .map((notiz) => ({
          titel: notiz.title,
          // Die erste Zeile mit Inhalt, ohne Auszeichnung — sie steht in der
          // Auswahlliste und soll die Figur wiedererkennbar machen, nicht die
          // ganze Notiz zeigen.
          kurz: (notiz.body ?? '')
            .split('\n')
            .map((zeile) => zeile.replace(/[*_#>`[\]]/g, '').trim())
            .find((zeile) => zeile.length > 0)
            ?.slice(0, 90) ?? ''
        }));
    },
    anlegen: async (notizen) => {
      if (!backstoryEmbed) {
        return {
          ok: false,
          text: 'Öffne den Story Creator einmal, dann weiß die Sammlung, wohin.',
          angelegt: 0
        };
      }
      if (notizen.length === 0) {
        return { ok: false, text: 'Es gibt nichts zu übernehmen.', angelegt: 0 };
      }
      const kampagnen = await backstoryEmbed.vault.listCampaigns();
      if (kampagnen.length === 0) {
        return { ok: false, text: 'Es gibt noch keine Kampagne, in die das passt.', angelegt: 0 };
      }
      const letzte = backstoryEmbed.aktuelleEinstellungen().lastCampaignId;
      const kampagne = kampagnen.find((eintrag) => eintrag.id === letzte) ?? kampagnen[0];

      let angelegt = 0;
      try {
        for (const notiz of notizen) {
          const neu = await backstoryEmbed.vault.createNote(kampagne.id, notiz.typ, notiz.titel);
          await backstoryEmbed.vault.saveNote(kampagne.id, { ...neu, body: notiz.markdown });
          angelegt += 1;
        }
      } catch (fehler) {
        // Was schon liegt, bleibt liegen: die Haelfte eines Geflechts ist
        // immer noch mehr wert als nichts, und geloescht wird hier nichts,
        // was der Nutzer nicht selbst geloescht hat.
        const grund = fehler instanceof Error ? fehler.message : String(fehler);
        return { ok: false, text: `${grund} (${angelegt} angelegt)`, angelegt };
      }

      // Dem Story Creator sagen, dass etwas dazugekommen ist. Ohne das
      // liegen die Notizen zwar auf der Platte, seine offene Liste zeigt sie
      // aber nicht.
      if (backstorySicht && !backstorySicht.webContents.isDestroyed()) {
        backstoryEmbed.meldeFremdeAenderung(backstorySicht.webContents);
      }
      haken.onEreignis?.('backstory');
      return { ok: true, text: kampagne.name, angelegt };
    }
  });

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
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language),
    meldeKiWechsel: () => eingebettet.meldeKiWechsel(sicht.webContents as WebContents)
  };
}

async function montiereInitiative(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountInitiative({
    userDataDir: datenordner(id),
    // Der Tracker buendelt seinen Hauptprozessteil nach dist/main, die
    // Oberflaeche nach dist/renderer — wie der Story Creator.
    distDir: appDistDir(id, 'main'),
    partition: sitzung(id),
    devServerUrl: process.env.INITIATIVE_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: (language) => haken.onLanguageChange(language as Language)
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
      // Wie beim Karteneditor: der Tracker liest seine Sprache aus dem
      // eigenen Browserspeicher, bevor die Huelle ihm etwas sagen kann.
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language)
  };
}

/**
 * Der Vault des Story Creators, sobald er montiert ist.
 *
 * Der NPC Creator legt seine Figuren dort ab, kennt den Vault aber nicht und
 * soll ihn auch nicht kennen: die Huelle reicht den Zugriff durch. Ist der
 * Story Creator nie geoeffnet worden, steht hier null — und der Export
 * sagt das ehrlich, statt stumm ins Leere zu schreiben.
 */
let backstoryEmbed: BackstoryEmbed | null = null;
/**
 * Die Ansicht des Story Creators, solange er montiert ist.
 *
 * Gebraucht, um ihm zu sagen, dass hinter seinem Ruecken eine Notiz
 * dazugekommen ist. Der Embed allein reicht dafuer nicht: `send` braucht die
 * webContents, und die gehoeren zur Ansicht.
 */
let backstorySicht: WebContentsView | null = null;

async function montiereBackstory(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountBackstory({
    userDataDir: datenordner(id),
    distDir: appDistDir(id, 'main'),
    partition: sitzung(id),
    devServerUrl: process.env.BACKSTORY_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: haken.onLanguageChange,
    // Wer den Story Creator bisher einzeln benutzt hat, soll seine
    // Kampagnen hier wiederfinden und nicht vor einer leeren Sammlung stehen.
    uebernahmeKandidaten: fruehereSpeicherorte(id),
    // In der Huelle wird die KI einmal fuer alle eingerichtet. Der eigene
    // Abschnitt in den Einstellungen dieser Anwendung verschwindet dadurch.
    kiQuelle: haken.kiQuelle,
    // Die Huelle fuehrt die Einstellungen; der eigene Dialog faellt weg.
    inHuelle: true
  });

  // Fuer den NPC Creator: er legt Figuren hier ab, ohne den Vault zu kennen.
  backstoryEmbed = eingebettet;

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
  // Rechtsklick auf ein angestrichenes Wort soll auch hier Vorschlaege
  // bringen, nicht nur in der eigenstaendigen Anwendung.
  eingebettet.richteRechtschreibungEin(sicht.webContents);
  // Welche Notiz offen ist, gehoert in den Verlauf der Huelle.
  if (haken.onOrt) eingebettet.beobachteVerlauf(sicht.webContents, haken.onOrt);
  // Damit der NPC Creator ihm sagen kann, dass eine Figur dazugekommen ist.
  backstorySicht = sicht;

  let geladen = false;
  return {
    id,
    sicht,
    springeZuOrt: (ort) => eingebettet.springeZuOrt(sicht.webContents as WebContents, ort),
    nachladen: async () => {
      await lade(sicht, eingebettet);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(sicht.webContents as WebContents),
    darfSchliessen: (elternfenster) =>
      eingebettet.darfSchliessen(sicht.webContents as WebContents, elternfenster),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language)    ,
    // Die KI wird in der Huelle eingerichtet; dieses Werkzeug muss es
    // erfahren, sonst fragt es den Zustand nur beim Laden ab.
    meldeKiWechsel: () => eingebettet.meldeKiWechsel(sicht.webContents as WebContents),
    // Seine eigenen Einstellungen stehen im Dialog der Huelle, nicht in einem
    // zweiten Dialog im Werkzeug.
    werkzeugEinstellungen: () => eingebettet.werkzeugEinstellungen(sicht.webContents as WebContents),
    setzeWerkzeugEinstellung: (feldId, wert) =>
      eingebettet.setzeWerkzeugEinstellung(sicht.webContents as WebContents, feldId, wert),
    werkzeugBefehl: (befehlId, wert) =>
      eingebettet.werkzeugBefehl(sicht.webContents as WebContents, befehlId, wert)
  };
}

async function montiereMapmaker(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = mountMapmaker({
    // Der Karteneditor hat keinen Hauptprozess; sein Vite-Build liegt direkt
    // in dist/, nicht in dist/renderer/ wie beim Story Creator.
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
      // beim Story Creator gibt es hier keine gemeinsam gelesene
      // Einstellungsdatei. Dieser Aufruf gleicht das nach jedem Laden an.
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language),
    // Eine leere Karte unter einem gegebenen Namen — angestossen aus der
    // Inspirationshilfe, ueber die Huelle. Mehr geht bewusst nicht: eine
    // Karte aus Text zu zeichnen hiesse, sein Datenmodell von aussen zu
    // bedienen (siehe docs/inspirationshilfe.md).
    neueKarte: (name: string, notizen = []) =>
      eingebettet.neueKarte(sicht.webContents as WebContents, name, [...notizen])
  };
}

/**
 * Der Monster Creator.
 *
 * Er bekommt einen eigenen Datenordner, und das ist die Stelle, an der der
 * Encounter Creator spaeter ansetzt: dieselben Dateien, kein Kanal zwischen
 * den beiden Werkzeugen. Deshalb liegt der Ordner unter dem Datenordner
 * DIESES Werkzeugs und nicht irgendwo im Sitzungszustand.
 */
async function montiereMonster(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountMonster({
    distDir: appDistDir(id, 'main'),
    devServerUrl: process.env.MONSTER_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: (language) => haken.onLanguageChange(language as Language),
    datenordner: datenordner(id),
    // Die KI der Sammlung, wie ueberall. Ein eigener Zugang je Werkzeug waere
    // eine zweite Stelle, an der derselbe Schluessel liegt.
    kiQuelle: haken.kiQuelle,
    anlegen: async (titel, markdown) => {
      if (!backstoryEmbed) {
        return { ok: false, text: 'Öffne den Story Creator einmal, dann weiß die Sammlung, wohin.' };
      }
      const kampagnen = await backstoryEmbed.vault.listCampaigns();
      if (kampagnen.length === 0) {
        return { ok: false, text: 'Es gibt noch keine Kampagne, in die das passt.' };
      }
      const letzte = backstoryEmbed.aktuelleEinstellungen().lastCampaignId;
      const kampagne = kampagnen.find((eintrag) => eintrag.id === letzte) ?? kampagnen[0];
      // „creature" gibt es in keiner Vorlage — ein Monster ist hier eine
      // Figur, und notfalls eine freie Notiz.
      const typ = passenderNotiztyp(kampagne, ['creature', 'character', 'note']);
      const notiz = await backstoryEmbed.vault.createNote(kampagne.id, typ, titel);
      await backstoryEmbed.vault.saveNote(kampagne.id, { ...notiz, body: markdown });

      // Dem Story Creator sagen, dass etwas dazugekommen ist — sonst liegt
      // die Notiz auf der Platte und seine offene Liste zeigt sie nicht.
      if (backstorySicht && !backstorySicht.webContents.isDestroyed()) {
        backstoryEmbed.meldeFremdeAenderung(backstorySicht.webContents);
      }
      haken.onEreignis?.('backstory');
      return { ok: true, text: `${titel} → ${kampagne.name}` };
    }
  });

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
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language),
    meldeKiWechsel: () => eingebettet.meldeKiWechsel(sicht.webContents as WebContents)
  };
}

async function montiereZustaende(id: string, haken: MontageHaken): Promise<MontierteApp> {
  const eingebettet = await mountZustaende({
    distDir: appDistDir(id, 'main'),
    devServerUrl: process.env.ZUSTAENDE_DEV_SERVER_URL,
    language: haken.language,
    onLanguageChange: (language) => haken.onLanguageChange(language as Language),
    datenordner: datenordner(id),
    // Die KI der Sammlung, wie ueberall. Ein eigener Zugang je Werkzeug waere
    // eine zweite Stelle, an der derselbe Schluessel liegt.
    kiQuelle: haken.kiQuelle,
    anlegen: async (titel, markdown) => {
      if (!backstoryEmbed) {
        return { ok: false, text: 'Öffne den Story Creator einmal, dann weiß die Sammlung, wohin.' };
      }
      const kampagnen = await backstoryEmbed.vault.listCampaigns();
      if (kampagnen.length === 0) {
        return { ok: false, text: 'Es gibt noch keine Kampagne, in die das passt.' };
      }
      const letzte = backstoryEmbed.aktuelleEinstellungen().lastCampaignId;
      const kampagne = kampagnen.find((eintrag) => eintrag.id === letzte) ?? kampagnen[0];
      // Ein Zustand ist keine Figur und kein Ort — er ist eine Notiz.
      const typ = passenderNotiztyp(kampagne, ['note', 'event']);
      const notiz = await backstoryEmbed.vault.createNote(kampagne.id, typ, titel);
      await backstoryEmbed.vault.saveNote(kampagne.id, { ...notiz, body: markdown });

      // Dem Story Creator sagen, dass etwas dazugekommen ist — sonst liegt
      // die Notiz auf der Platte und seine offene Liste zeigt sie nicht.
      if (backstorySicht && !backstorySicht.webContents.isDestroyed()) {
        backstoryEmbed.meldeFremdeAenderung(backstorySicht.webContents);
      }
      haken.onEreignis?.('backstory');
      return { ok: true, text: `${titel} → ${kampagne.name}` };
    }
  });

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
      await eingebettet.setLanguage(sicht.webContents as WebContents, haken.language);
      geladen = true;
    },
    istGeladen: () => geladen,
    flush: () => eingebettet.flush(),
    setLanguage: (language) => eingebettet.setLanguage(sicht.webContents as WebContents, language),
    meldeKiWechsel: () => eingebettet.meldeKiWechsel(sicht.webContents as WebContents)
  };
}
