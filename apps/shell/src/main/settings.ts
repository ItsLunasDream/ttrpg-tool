/**
 * Die Einstellungen der Huelle.
 *
 * Bewusst getrennt von denen der eingebetteten Anwendungen: die haben ihre
 * eigenen, und die gehoeren ihnen. Hier steht nur, was den Rahmen selbst
 * betrifft.
 *
 * Wie beim Fensterzustand eine schlichte JSON-Datei ohne Abhaengigkeit.
 * Beim *Lesen* werden Fehler geschluckt: eine kaputte Datei fuehrt zu den
 * Vorgaben, nicht zu einem Start, der abbricht. Beim *Schreiben* nicht — wer
 * eine Einstellung umstellt und sie nach dem Neustart nicht wiederfindet,
 * soll das gleich erfahren und nicht erst dann.
 */
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { VORGABE_THEMA, themaMit } from '@suite/farben';
import { dirname } from 'node:path';
import { istAnbieterId, KI_VOREINSTELLUNGEN, type KiEinstellungen } from '@suite/ki/einstellungen';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from '../shared/i18n';
import { gueltigeGroesse, VORGABE_GROESSE } from '../shared/apps';

export interface ShellSettings {
  language: Language;
  /**
   * Die KI-Anbindung — fuer die ganze Sammlung, nicht je Werkzeug.
   *
   * Anders als die Sprache, die jedes Werkzeug fuer sich fuehrt: ein
   * Sprachmodell ist etwas, das man einmal einrichtet und dann ueberall
   * benutzt. Wer den Schluessel in jedem Werkzeug neu eintippen muesste,
   * tippt ihn zweimal falsch.
   */
  ki: KiEinstellungen;
  /**
   * Der API-Schluessel, mit dem Schluesselbund des Systems verschluesselt.
   * Erreicht die Oberflaeche nie — sie erfaehrt nur, ob einer da ist.
   */
  claudeSchluessel: string;
  /**
   * Welche Einfuehrungen schon gesehen wurden — Werkzeug-Kennungen, dazu
   * 'suite' fuer das Willkommen der Sammlung.
   *
   * Steht hier und nicht im Browserspeicher der Oberflaeche: wer die
   * Anwendung neu installiert oder den Datenordner mitnimmt, soll nicht
   * wieder von vorn begruesst werden — und wer sie zuruecksetzen will, findet
   * sie in einer Datei, die er kennt.
   */
  einfuehrungGesehen: string[];
  /**
   * Das Farbthema der ganzen Sammlung.
   *
   * Wie die KI und anders als die Sprache: ein Fenster in zwei Farben waere
   * keine Wahl, sondern ein Fehler. Die Kennung steht in `@suite/farben`;
   * hier steht nur, welche gerade gilt.
   */
  thema: string;
  /**
   * Die Groesse der ganzen Oberflaeche in Prozent, eine der Stufen aus
   * `GROESSEN` (#61). Gilt wie das Thema fuer das ganze Fenster: Huelle und
   * alle Werkzeuge.
   */
  groesse: number;
}

export const DEFAULT_SETTINGS: ShellSettings = {
  language: DEFAULT_LANGUAGE,
  ki: KI_VOREINSTELLUNGEN,
  claudeSchluessel: '',
  einfuehrungGesehen: [],
  thema: VORGABE_THEMA,
  groesse: VORGABE_GROESSE
};

/** Erzwingt gueltige Werte, egal was in der Datei stand. */
export function sanitizeSettings(roh: unknown): ShellSettings {
  if (typeof roh !== 'object' || roh === null) return { ...DEFAULT_SETTINGS };
  const wert = roh as Record<string, unknown>;
  return {
    language: isLanguage(wert.language) ? wert.language : DEFAULT_SETTINGS.language,
    ki: sanitizeKi(wert.ki),
    claudeSchluessel: typeof wert.claudeSchluessel === 'string' ? wert.claudeSchluessel : '',
    /*
     * Ueber `themaMit` und nicht roh uebernommen: eine Datei aus einer
     * aelteren Fassung, oder eine von Hand geaenderte, koennte eine Kennung
     * nennen, die es nicht gibt. `themaMit` faellt dann auf die Vorgabe
     * zurueck — besser als eine Oberflaeche ohne Farben.
     */
    thema: themaMit(typeof wert.thema === 'string' ? wert.thema : '').id,
    groesse: gueltigeGroesse(wert.groesse),
    // Nur Zeichenketten, und jede nur einmal: die Liste waechst sonst bei
    // jedem Start um denselben Eintrag.
    einfuehrungGesehen: Array.isArray(wert.einfuehrungGesehen)
      ? [...new Set(wert.einfuehrungGesehen.filter((id): id is string => typeof id === 'string'))]
      : []
  };
}

/**
 * Ein unbekannter Anbieter faellt auf 'none' zurueck, nicht auf den ersten in
 * der Liste: eine Datei aus einer neueren Fassung soll die KI abschalten und
 * nicht stillschweigend etwas anderes ansprechen, als dort stand.
 */
function sanitizeKi(roh: unknown): KiEinstellungen {
  if (typeof roh !== 'object' || roh === null) return { ...KI_VOREINSTELLUNGEN };
  const wert = roh as Record<string, unknown>;
  const text = (name: string, vorgabe: string) =>
    typeof wert[name] === 'string' && (wert[name] as string).trim() ? (wert[name] as string) : vorgabe;

  return {
    anbieter: istAnbieterId(wert.anbieter) ? wert.anbieter : 'none',
    ollamaAdresse: text('ollamaAdresse', KI_VOREINSTELLUNGEN.ollamaAdresse),
    ollamaModell: text('ollamaModell', KI_VOREINSTELLUNGEN.ollamaModell),
    claudeModell: text('claudeModell', KI_VOREINSTELLUNGEN.claudeModell),
    offenAdresse: text('offenAdresse', KI_VOREINSTELLUNGEN.offenAdresse),
    offenModell: text('offenModell', KI_VOREINSTELLUNGEN.offenModell)
  };
}

export async function readSettings(datei: string): Promise<ShellSettings> {
  try {
    return sanitizeSettings(JSON.parse(await readFile(datei, 'utf8')));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Schreibvorgaenge laufen nacheinander, nie nebeneinander.
 *
 * Wer in den Einstellungen tippt, loest je Zeichen einen Schreibvorgang aus.
 * Zwei davon gleichzeitig hinterliessen eine halb beschriebene Datei — beim
 * naechsten Start gilt dann die Voreinstellung, und niemand kaeme auf die
 * Idee, dort zu suchen. Ein Rauchtest hat genau das getroffen.
 */
let schreibKette: Promise<unknown> = Promise.resolve();

export async function writeSettings(datei: string, einstellungen: ShellSettings): Promise<void> {
  const sauber = sanitizeSettings(einstellungen);

  schreibKette = schreibKette.then(async () => {
    await mkdir(dirname(datei), { recursive: true });
    // Erst daneben schreiben, dann umbenennen: ein Umbenennen ist im
    // Dateisystem ein Schritt. Bricht der Strom mitten im Schreiben ab,
    // steht die alte Datei noch da statt einer halben neuen.
    const daneben = `${datei}.neu`;
    await writeFile(daneben, JSON.stringify(sauber, null, 2), 'utf8');
    await rename(daneben, datei);
  }, () => undefined);

  await schreibKette;
}

/**
 * Die Einstellungen, wie die Oberflaeche sie sehen darf.
 *
 * Der verschluesselte API-Schluessel bleibt im Hauptprozess. Er waere in der
 * Oberflaeche zwar immer noch verschluesselt, aber er hat dort schlicht
 * nichts zu suchen: sie muss nur wissen, *ob* einer da ist, und das sagt ihr
 * die Bereitschaftspruefung.
 */
export function ohneSchluessel(einstellungen: ShellSettings): ShellSettings {
  return { ...einstellungen, claudeSchluessel: '' };
}
