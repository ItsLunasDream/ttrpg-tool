/**
 * Die Kanaele zwischen Oberflaeche und Hauptprozess.
 *
 * Alles, was Dateien anfasst, laeuft hier — der Renderer bekommt keinen
 * Dateizugriff.
 */
import { BrowserWindow, dialog, ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Begegnung, Kampf } from '../shared/types';
import type { Ablage } from './ablage';

/** Bilddateien, die der Auswahldialog anbietet. */
const BILDTYPEN = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'];

function handle<A extends unknown[], R>(
  name: string,
  fn: (...args: A) => R | Promise<R>
): void {
  // Erst abmelden: in der Huelle kann dieselbe Anwendung nach einem
  // Fehlschlag ein zweites Mal montiert werden, und `ipcMain.handle` weist
  // einen zweiten Handler mit einem Fehler ab.
  ipcMain.removeHandler(kanal(name));
  ipcMain.handle(kanal(name), async (_event: IpcMainInvokeEvent, ...args: unknown[]) =>
    fn(...(args as A))
  );
}

export function registriereIpc(ablage: Ablage): void {
  handle<[], Begegnung[]>('begegnungen:liste', () => ablage.listeBegegnungen());
  handle<[string], Begegnung>('begegnungen:lesen', (id) => ablage.leseBegegnungMitId(id));
  handle<[Begegnung], Begegnung>('begegnungen:speichern', (begegnung) =>
    ablage.speichereBegegnung(begegnung)
  );
  handle<[string], void>('begegnungen:loeschen', (id) => ablage.loescheBegegnung(id));

  handle<[], Kampf | null>('kampf:lesen', () => ablage.leseKampf());
  handle<[Kampf], void>('kampf:schreiben', (kampf) => ablage.schreibeKampf(kampf));

  /**
   * Bild aussuchen und ablegen. Gibt den Dateinamen im eigenen Ordner
   * zurueck, oder `null`, wenn abgebrochen wurde.
   */
  handle<[], string | null>('bild:waehlen', async () => {
    const fenster = BrowserWindow.getFocusedWindow();
    const optionen: Electron.OpenDialogOptions = {
      properties: ['openFile'],
      filters: [{ name: 'Bilder', extensions: BILDTYPEN }]
    };
    const ergebnis = fenster
      ? await dialog.showOpenDialog(fenster, optionen)
      : await dialog.showOpenDialog(optionen);
    if (ergebnis.canceled || !ergebnis.filePaths[0]) return null;
    return ablage.legeBildAb(ergebnis.filePaths[0]);
  });
}

/** Meldet die Kanaele wieder ab. Fuer den Fall, dass die Anwendung geht. */
export function entferneIpc(): void {
  for (const name of [
    'begegnungen:liste',
    'begegnungen:lesen',
    'begegnungen:speichern',
    'begegnungen:loeschen',
    'kampf:lesen',
    'kampf:schreiben',
    'bild:waehlen'
  ]) {
    ipcMain.removeHandler(kanal(name));
  }
}
