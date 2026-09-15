/**
 * Einen vorhandenen Speicherort uebernehmen, wenn diese Anwendung an einem
 * Ort zum ersten Mal laeuft.
 *
 * Anlass ist der Umzug in die Huelle: dort bekommt jede Anwendung ihren
 * eigenen Datenordner, und der ist ein anderer als der des eigenstaendigen
 * Programms. Ohne diesen Weg steht eine Person, die den Story Creator
 * bisher einzeln benutzt hat, beim ersten Start vor einer leeren Sammlung —
 * ihre Kampagnen liegen noch da, nur woanders, und nichts auf dem Schirm sagt
 * ihr das.
 *
 * Getrennt von embed.ts, damit es ohne Electron pruefbar ist: hier steckt die
 * Entscheidung, ob fremde Daten uebernommen werden, und die will genau
 * geprueft sein.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Sucht unter `kandidaten` einen Speicherort, der uebernommen werden soll.
 *
 * Zwei Bedingungen, beide notwendig:
 *
 * 1. **Es gibt noch keine settings.json.** Existiert sie, hat die Person eine
 *    Wahl getroffen — und sei es, indem sie die Voreinstellung stehen liess.
 *    Die wird nicht hinter ihrem Ruecken geaendert.
 * 2. **Unter dem Kandidaten liegen wirklich Kampagnen.** Ein leerer Ordner aus
 *    einem Programmstart, bei dem nie etwas angelegt wurde, ist keine
 *    Uebernahme wert: er verlegte den Speicherort nur ohne Not aus dem eigenen
 *    Datenordner heraus.
 *
 * Uebernommen wird ausschliesslich der *Pfad*. Es wird nichts kopiert, nichts
 * verschoben und nichts ueberschrieben — beide Programme benutzen danach
 * denselben Ordner. Wer die Trennung will, stellt ihn in den Einstellungen um.
 */
export async function findeUebernahme(
  settingsFile: string,
  kandidaten: readonly string[] | undefined
): Promise<string | null> {
  if (!kandidaten?.length) return null;

  try {
    await fs.access(settingsFile);
    return null; // Schon eingerichtet, Finger weg.
  } catch {
    // Erster Start an diesem Ort — weiter.
  }

  for (const kandidat of kandidaten) {
    try {
      const inhalt = await fs.readdir(path.join(kandidat, 'campaigns'));
      if (inhalt.length > 0) return kandidat;
    } catch {
      // Gibt es nicht oder ist nicht lesbar — naechster.
    }
  }
  return null;
}
