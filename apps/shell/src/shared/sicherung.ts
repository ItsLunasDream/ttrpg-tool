/**
 * Was in eine Sicherung der ganzen Sammlung gehoert — und was nicht.
 *
 * Bisher sicherte nur der Story Creator, und auch nur seine Kampagne.
 * Begegnungen, Monster, Zustaende, Karten, eigene Symbole und die
 * Einstellungen blieben aussen vor. Wer den Rechner wechselt, verliert
 * genau das, was er am laengsten gesammelt hat.
 *
 * Diese Datei entscheidet nur, sie packt nicht: kein `node:*`, kein
 * `electron`. Dadurch laesst sich die Entscheidung pruefen, ohne eine Datei
 * anzulegen — und die Entscheidung ist der Teil, bei dem ein Fehler weh tut.
 */

/**
 * Ordner, die im Datenverzeichnis liegen, aber niemandem fehlen.
 *
 * Alles davon legt Chromium oder Electron beim Laufen an und beim naechsten
 * Start wieder. In der Sicherung waeren sie nicht nur nutzlos, sondern
 * schaedlich: sie machen sie um ein Vielfaches groesser und koennen beim
 * Zurueckspielen auf einem anderen Rechner Aerger machen.
 */
const WEGWERF = [
  'Cache',
  'Code Cache',
  'GPUCache',
  'DawnCache',
  'DawnGraphiteCache',
  'DawnWebGPUCache',
  'ShaderCache',
  'GrShaderCache',
  'blob_storage',
  'Crashpad',
  'component_crx_cache',
  'Dictionaries',
  'Local Storage',
  'Session Storage',
  'Service Worker',
  'IndexedDB',
  'Network',
  'logs'
];

/** Dateinamen, die nichts in einer Sicherung verloren haben. */
const WEGWERF_DATEIEN = ['.DS_Store', 'Thumbs.db', 'SingletonLock', 'SingletonCookie'];

/**
 * Ob ein Pfad in die Sicherung gehoert.
 *
 * `pfad` ist relativ zum Datenverzeichnis, mit `/` getrennt — auch unter
 * Windows. Der Aufrufer wandelt um; hier soll nicht zweimal derselbe
 * Sonderfall stehen.
 */
export function gehoertInSicherung(pfad: string): boolean {
  const teile = pfad.split('/').filter(Boolean);
  if (teile.length === 0) return false;

  for (const teil of teile) {
    if (WEGWERF.includes(teil)) return false;
    if (WEGWERF_DATEIEN.includes(teil)) return false;
    // Halb geschriebene Dateien aus dem atomaren Schreiben. Sie leben
    // Millisekunden; eine davon in der Sicherung waere ein Stand, den es
    // nie gab.
    if (teil.endsWith('.neu')) return false;
    if (teil.endsWith('.log')) return false;
  }

  /*
   * Die Sitzungsordner der eingebetteten Werkzeuge (`Partitions/…`).
   *
   * Darin liegt Browserzustand, kein Inhalt: was ein Werkzeug wirklich
   * ablegt, schreibt es als Datei in seinen eigenen Ordner. Eine Ausnahme
   * gibt es trotzdem — die eigenen Woerter der Rechtschreibpruefung haengen
   * an der Sitzung. Die sind der Sicherung wert.
   */
  if (teile[0] === 'Partitions') {
    return teile.some((teil) => teil === 'Custom Dictionary.txt');
  }

  return true;
}

/**
 * Ob es sich lohnt, in einen Ordner hineinzusteigen.
 *
 * Getrennt von `gehoertInSicherung`, und das ist kein Feinschliff: die
 * Sitzungsordner (`Partitions/…`) sind als GANZES nicht in der Sicherung,
 * aber eine Datei darin schon — das eigene Woerterbuch. Wer den Ordner an
 * derselben Frage misst wie eine Datei, weist ihn ab, bevor er hineinsieht,
 * und das Woerterbuch ist weg. Genau das ist hier passiert.
 */
export function ordnerLohnt(pfad: string): boolean {
  const teile = pfad.split('/').filter(Boolean);
  if (teile.length === 0) return false;
  // Wegwerfordner bleiben wegwerfordner, egal wo sie liegen.
  return !teile.some((teil) => WEGWERF.includes(teil) || teil.endsWith('.neu'));
}

/** Wie die Einstellungsdatei der Huelle heisst. */
export const EINSTELLUNGSDATEI = 'einstellungen.json';

/**
 * Die Einstellungen ohne den API-Schluessel — als TEXT, nicht als Objekt.
 *
 * Heisst nicht `ohneSchluessel`, obwohl das der schoenere Name waere: den
 * gibt es schon in `main/settings.ts` fuer den Weg an die Oberflaeche. Zwei
 * gleich benannte Ausfuhren werden beim Buendeln der Tests stillschweigend
 * zu einer, und dann prueft ein Test die falsche Funktion — genau das ist
 * hier passiert.
 *
 * Der Schluessel liegt mit dem Schluesselbund DIESES Rechners
 * verschluesselt in der Datei. Auf einem anderen Rechner liesse er sich
 * ohnehin nicht mehr aufmachen — er waere also totes Gewicht. Und eine
 * Sicherung, die irgendwo liegt oder verschickt wird, ist der letzte Ort,
 * an dem ein Zugangsschluessel etwas verloren hat, auch ein verschluesselter.
 *
 * Kommt der Text nicht durch `JSON.parse`, geht er unveraendert durch:
 * lieber eine Datei zu viel gesichert als eine kaputte Sicherung, die
 * stillschweigend eine Einstellung verliert. Eine solche Datei enthaelt
 * dann auch keinen brauchbaren Schluessel.
 */
export function einstellungenOhneSchluessel(inhalt: string): string {
  let gelesen: unknown;
  try {
    gelesen = JSON.parse(inhalt);
  } catch {
    return inhalt;
  }
  if (typeof gelesen !== 'object' || gelesen === null) return inhalt;
  const kopie = { ...(gelesen as Record<string, unknown>) };
  if (!('claudeSchluessel' in kopie)) return inhalt;
  kopie.claudeSchluessel = '';
  return `${JSON.stringify(kopie, null, 2)}\n`;
}

/**
 * Der vorgeschlagene Dateiname einer Sicherung.
 *
 * Mit Datum, weil man selten genau eine hat. Die Stunde gehoert dazu: wer
 * an einem Nachmittag zweimal sichert, will nicht raten muessen, welche die
 * neuere ist.
 */
export function sicherungsname(jetzt: Date): string {
  const zwei = (zahl: number) => String(zahl).padStart(2, '0');
  const datum = `${jetzt.getFullYear()}-${zwei(jetzt.getMonth() + 1)}-${zwei(jetzt.getDate())}`;
  const zeit = `${zwei(jetzt.getHours())}${zwei(jetzt.getMinutes())}`;
  return `lore-sicherung-${datum}-${zeit}.zip`;
}
