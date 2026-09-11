/**
 * Eigene Bilder als Symbole der Werkzeuge.
 *
 * Die eingebauten Symbole sind Vektoren im Quelltext und damit Platzhalter.
 * Wer eigene will, legt sie in einen Ordner; fehlt dort eines, gilt weiter
 * das eingebaute. Ein Symbol ist kein Grund fuer eine Fehlermeldung.
 *
 * Der Ordner liegt im Datenordner der Huelle und nicht im Programmordner:
 * dort ist er nach der Installation beschreibbar und ueberlebt ein Update.
 *
 * Ausgeliefert werden die Bilder als data:-URL ueber die Bruecke. Ein eigenes
 * Protokoll waere der andere Weg und hier zu viel: es sind fuenf kleine
 * Dateien, die einmal beim Start gelesen werden, und `img-src` laesst `data:`
 * ohnehin zu.
 */
import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';

/** Der Ordnername im Datenordner. Taucht in der Oberflaeche auf. */
export const SYMBOL_ORDNER = 'symbole';

/**
 * Was als Bild durchgeht.
 *
 * SVG ist bewusst NICHT dabei. Eine SVG-Datei kann Skripte enthalten, und
 * auch wenn sie in einem `img` nicht laufen, ist das eine Tuer, die man fuer
 * ein Symbol nicht aufmachen muss. Die vier Rasterformate decken alles ab,
 * was aus einem Zeichenprogramm kommt.
 */
const FORMATE: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

/**
 * Wie gross eine Symboldatei hoechstens sein darf.
 *
 * Zwei Megabyte sind fuer ein Symbol reichlich — ein PNG mit 256 Kantenlaenge
 * liegt bei wenigen zehn Kilobyte. Die Grenze steht gegen den Fall, dass
 * jemand versehentlich ein Foto hineinlegt: als data:-URL wandert die Datei
 * durch die Bruecke und in den Speicher der Oberflaeche.
 */
const MAX_BYTES = 2 * 1024 * 1024;

const LIESMICH = [
  'Eigene Symbole für die Werkzeuge',
  '================================',
  '',
  'Leg hier ein Bild je Werkzeug ab. Der Dateiname ist die Kennung:',
  '',
  '  backstory.png     Backstory Creator',
  '  mapmaker.png      Karteneditor',
  '  initiative.png    Initiative Tracker',
  '  dice.png          Würfel',
  '  npc.png           NPC Creator',
  '',
  'Erlaubt sind .png, .jpg, .webp und .gif, höchstens 2 MB je Datei.',
  'Quadratisch und mindestens 128 Pixel Kantenlänge sieht am besten aus:',
  'dasselbe Bild steht groß im Startmenü und klein in der Schiene.',
  '',
  'Fehlt eine Datei, gilt das eingebaute Symbol. Dasselbe gilt, wenn sich',
  'ein Bild nicht lesen lässt — dann passiert einfach nichts.',
  '',
  'Nach dem Ändern: in den Einstellungen auf „Symbole neu laden".',
  ''
].join('\n');

export function symbolOrdner(datenordner: string): string {
  return join(datenordner, SYMBOL_ORDNER);
}

/**
 * Der mitgelieferte Ordner im Programm.
 *
 * Hier liegen die Bilder, die mit der Sammlung ausgeliefert werden — sie
 * gelten fuer alle, die sie installieren. Der Ordner im Datenordner sticht
 * sie: wer eigene Bilder hinlegt, will die sehen und nicht die
 * mitgelieferten.
 *
 * Im Paket liegt er unter `resources/symbole` (electron-builder legt ihn
 * ueber `extraResources` dorthin), im Arbeitsverzeichnis neben dem
 * Quelltext der Huelle.
 */
export function mitgelieferterOrdner(gepackt: boolean, resourcesPath: string): string {
  return gepackt
    ? join(resourcesPath, SYMBOL_ORDNER)
    : join(__dirname, '..', '..', SYMBOL_ORDNER);
}

/**
 * Legt den Ordner an und schreibt einmal eine Liesmich hinein.
 *
 * Beides nur, wenn es noch nicht da ist: wer die Liesmich geloescht hat,
 * wollte sie los sein und soll sie nicht bei jedem Start wiederfinden.
 */
export async function richteSymbolOrdnerEin(datenordner: string): Promise<void> {
  const ordner = symbolOrdner(datenordner);
  await mkdir(ordner, { recursive: true });
  const liesmich = join(ordner, 'LIESMICH.txt');
  try {
    await access(liesmich);
  } catch {
    await writeFile(liesmich, LIESMICH, 'utf8');
  }
}

/**
 * Liest die vorhandenen Symbole als data:-URLs, nach Kennung.
 *
 * Fehler jeder Art fuehren dazu, dass ein Symbol fehlt — nicht dazu, dass der
 * Aufruf scheitert. Gibt es den Ordner nicht, kommt eine leere Sammlung
 * zurueck.
 */
export async function leseSymbole(
  datenordner: string,
  mitgeliefert?: string
): Promise<Record<string, string>> {
  /*
   * Zuerst die mitgelieferten, dann die eigenen.
   *
   * Die Reihenfolge ist die Regel: was spaeter kommt, gewinnt. Wer ein
   * eigenes Bild hinlegt, sticht damit das mitgelieferte — und wer es wieder
   * entfernt, bekommt das mitgelieferte zurueck, ohne etwas einstellen zu
   * muessen.
   */
  const gefunden: Record<string, string> = {};
  if (mitgeliefert) Object.assign(gefunden, await ausOrdner(mitgeliefert));
  Object.assign(gefunden, await ausOrdner(symbolOrdner(datenordner)));
  return gefunden;
}

/** Liest einen einzelnen Ordner. Fehlt er, kommt eine leere Sammlung zurueck. */
async function ausOrdner(ordner: string): Promise<Record<string, string>> {
  let dateien: string[];
  try {
    dateien = await readdir(ordner);
  } catch {
    return {};
  }

  const gefunden: Record<string, string> = {};
  for (const datei of dateien) {
    const endung = extname(datei).toLowerCase();
    const typ = FORMATE[endung];
    if (!typ) continue;

    const id = basename(datei, extname(datei));
    // Erst gewinnt: bei backstory.png und backstory.webp waere sonst nicht
    // vorhersehbar, welches gilt.
    if (gefunden[id]) continue;

    try {
      const inhalt = await readFile(join(ordner, datei));
      if (inhalt.length > MAX_BYTES) {
        console.log(`[shell] Symbol ${datei} ist zu gross (${inhalt.length} Bytes), uebersprungen`);
        continue;
      }
      gefunden[id] = `data:${typ};base64,${inhalt.toString('base64')}`;
    } catch (fehler) {
      console.log(`[shell] Symbol ${datei} liess sich nicht lesen:`, fehler);
    }
  }
  return gefunden;
}
