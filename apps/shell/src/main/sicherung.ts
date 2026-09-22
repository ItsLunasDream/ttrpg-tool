/**
 * Die Sicherung der ganzen Sammlung: ein ZIP aus dem Datenverzeichnis.
 *
 * WAS hineingehoert, entscheidet `../shared/sicherung.ts` — plattformfrei
 * und geprueft. Hier steht nur das Laufen durch die Ordner und das Packen.
 *
 * Ohne `archiver`: das Paket liegt im Story Creator, und die Huelle soll
 * sich nicht an dessen Abhaengigkeiten haengen. `fflate` reicht und ist
 * ohnehin schon da — es packt aus dem Speicher, was hier kein Nachteil
 * ist: die Sammlung besteht aus Textdateien und ein paar Bildern.
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { zipSync, type Zippable } from 'fflate';
import {
  EINSTELLUNGSDATEI,
  einstellungenOhneSchluessel,
  gehoertInSicherung,
  ordnerLohnt
} from '../shared/sicherung';

export interface Sicherungsbericht {
  readonly dateien: number;
  /** Groesse der fertigen Datei in Bytes. */
  readonly groesse: number;
}

/**
 * Sammelt rekursiv, was in die Sicherung gehoert.
 *
 * Gibt Pfade relativ zum Datenverzeichnis zurueck, immer mit `/` getrennt.
 * Unter Windows liefert `path.join` Backslashes, und `gehoertInSicherung`
 * soll den Sonderfall nicht ein zweites Mal kennen muessen.
 */
async function sammle(wurzel: string, unter = ''): Promise<string[]> {
  let eintraege;
  try {
    eintraege = await readdir(path.join(wurzel, unter), { withFileTypes: true });
  } catch {
    // Ein Ordner, der zwischen Auflisten und Lesen verschwindet. Kein Grund,
    // die ganze Sicherung abzubrechen.
    return [];
  }

  const gefunden: string[] = [];
  for (const eintrag of eintraege) {
    const relativ = unter ? `${unter}/${eintrag.name}` : eintrag.name;
    // Ordner und Dateien werden verschieden gefragt: in einen Ordner, der
    // als Ganzes nicht hineingehoert, kann trotzdem eine einzelne Datei
    // gehoeren. Siehe `ordnerLohnt`.
    if (eintrag.isDirectory()) {
      if (ordnerLohnt(relativ)) gefunden.push(...(await sammle(wurzel, relativ)));
    } else if (eintrag.isFile() && gehoertInSicherung(relativ)) {
      gefunden.push(relativ);
    }
  }
  return gefunden;
}

/**
 * Schreibt eine Sicherung des Datenverzeichnisses nach `ziel`.
 *
 * Der API-Schluessel wird dabei aus den Einstellungen entfernt — er liegt
 * mit dem Schluesselbund DIESES Rechners verschluesselt da und waere
 * anderswo ohnehin wertlos. Eine Sicherung ist der letzte Ort, an dem ein
 * Zugangsschluessel etwas verloren hat.
 */
export async function schreibeSicherung(
  datenordner: string,
  ziel: string
): Promise<Sicherungsbericht> {
  const pfade = await sammle(datenordner);

  const inhalt: Zippable = {};
  for (const relativ of pfade) {
    const voll = path.join(datenordner, ...relativ.split('/'));
    try {
      // Sehr grosse Dateien auslassen: die Sammlung besteht aus Text und
      // Bildern. Was groesser als 64 MB ist, gehoert da nicht hin und wuerde
      // die Sicherung unbrauchbar machen, statt sie zu retten.
      const angaben = await stat(voll);
      if (angaben.size > 64 * 1024 * 1024) continue;

      if (relativ === EINSTELLUNGSDATEI) {
        inhalt[relativ] = new TextEncoder().encode(
          einstellungenOhneSchluessel(await readFile(voll, 'utf8'))
        );
      } else {
        inhalt[relativ] = new Uint8Array(await readFile(voll));
      }
    } catch {
      // Eine Datei, die gerade ersetzt wird. Weiter — eine Sicherung ohne
      // eine Datei ist besser als gar keine.
    }
  }

  const gepackt = zipSync(inhalt, { level: 6 });
  await writeFile(ziel, gepackt);
  return { dateien: Object.keys(inhalt).length, groesse: gepackt.byteLength };
}
