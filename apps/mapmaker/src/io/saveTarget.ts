/**
 * Zielort zum Speichern — merkt sich die zuletzt geschriebene Datei.
 *
 * Der Browser darf nicht einfach ins Dateisystem schreiben. Die File System
 * Access API erlaubt es, wenn der Benutzer die Datei einmal ausgewählt hat:
 * das dabei entstehende Handle bleibt gültig und lässt sich wiederverwenden.
 * Genau daraus besteht Quicksave — ohne Handle bliebe nur, bei jedem Speichern
 * eine neue Datei in den Download-Ordner zu legen.
 *
 * Es gibt die API nur in Chromium. Firefox und Safari behalten deshalb das
 * Herunterladen als Rückfalllösung; dort ist Quicksave nicht verfügbar und die
 * Oberfläche sagt das auch, statt einen Knopf anzubieten, der etwas anderes tut
 * als er verspricht.
 *
 * **Die Tauri-Hülle (Desktop-Build) ist ein dritter Fall, kein Sonderfall der
 * ersten beiden.** Ihr eigenes WebView bringt die File System Access API gar
 * nicht erst mit — `window.showSaveFilePicker` bleibt dort `undefined`, genau
 * wie in Firefox. Ohne eigenen Zweig wäre der Desktop-Build also aufs
 * Herunterladen zurückgefallen, obwohl er echten Dateizugriff hat und genau
 * deswegen gebaut wurde (siehe BACKLOG.md). Der native Ersatz kommt über die
 * Plugins `@tauri-apps/plugin-dialog` (Dateidialog) und `@tauri-apps/plugin-fs`
 * (Lesen/Schreiben) — beide werden nur unter Tauri überhaupt importiert, ein
 * Browser-Build lädt diesen Code nie.
 *
 * Ein Ziel ist deshalb intern eins von zwei Dingen: ein `FileSystemFileHandle`
 * oder ein Tauri-Pfad. Nach außen ändert sich dadurch nichts — `hasSaveTarget`,
 * `saveTargetName` und die anderen Abfragen kennen beide Fälle nicht getrennt.
 */

import { isTauri } from '@tauri-apps/api/core';
import { recentFiles } from './recentFiles';

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{ description?: string; accept: Record<string, string[]> }>;
}

interface OpenFilePickerOptions extends SaveFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
}

declare global {
  interface Window {
    showSaveFilePicker?: (opts?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    showOpenFilePicker?: (opts?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
  }
}

type Target =
  | { kind: 'fsa'; handle: FileSystemFileHandle }
  | { kind: 'tauri'; path: string; name: string };

/** Vom Benutzer gewähltes Ziel; überlebt den Reload nicht. */
let target: Target | null = null;

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

/**
 * Gibt es einen nativen Dateidialog — entweder die File System Access API
 * im Browser, oder die Tauri-Hülle? Für die Oberfläche zählt nur das: „gibt
 * es einen Dialog, der ein Ziel merkt" — nicht, welcher der beiden es ist.
 *
 * `isTauri()` (`@tauri-apps/api/core`) ist ein reiner `globalThis`-Test ohne
 * eigene Anfrage ans Backend — synchron und gefahrlos auch im Browser-Build
 * statisch eingebunden, anders als die Plugin-Aufrufe weiter unten, die erst
 * bei tatsächlichem Gebrauch nachgeladen werden.
 */
export function canPickSaveTarget(): boolean {
  return isFileSystemAccessSupported() || isTauri();
}

/** Gibt es ein Ziel, das Quicksave überschreiben kann? */
export function hasSaveTarget(): boolean {
  return target !== null;
}

/** Name der gemerkten Datei — für Knopf-Tooltip und Statusmeldung. */
export function saveTargetName(): string | null {
  if (!target) return null;
  return target.kind === 'fsa' ? target.handle.name : target.name;
}

export function forgetSaveTarget(): void {
  target = null;
}

/**
 * Übernimmt ein anderswoher stammendes Handle als Ziel.
 *
 * Gebraucht für die zuletzt geöffneten Karten: wer eine Datei aus der Liste
 * öffnet, erwartet, dass Strg+S danach dorthin zurückschreibt und nicht in den
 * Download-Ordner.
 *
 * Nur für den Browser-Zweig — „zuletzt geöffnet" gibt es unter Tauri in
 * dieser Fassung noch nicht (siehe BACKLOG.md); dort bleibt die Liste leer,
 * genau wie heute schon in Firefox und Safari.
 */
export function adoptSaveTarget(next: FileSystemFileHandle): void {
  target = { kind: 'fsa', handle: next };
  void recentFiles.remember(next);
}

/**
 * MIME-Typ für die Projektdatei im Dateidialog.
 *
 * Eigener Typ statt `application/zip`, obwohl die Datei technisch ein ZIP ist:
 * Chromium gruppiert den Dialog nach MIME-Typ, und unter „ZIP-Archiv" taucht
 * `.ttmap` in manchen Fassungen gar nicht auf — die Datei war dann nur über
 * „Alle Dateien" zu finden. Mit einem eigenen Typ filtert der Dialog nach der
 * Endung, und genau das ist gemeint.
 *
 * Der Typ steht nur im Dialog. Geschrieben wird weiter ein ZIP, und der
 * Download-Blob trägt weiter `application/zip` — daran hängt, was das System
 * mit der Datei anfängt.
 */
export const TTMAP_MIME = 'application/x-ttmap';

/**
 * Fragt nach einem Ziel und merkt es sich.
 * Gibt `false` zurück, wenn der Benutzer abgebrochen hat oder es keinen
 * nativen Dialog gibt.
 */
export async function pickSaveTarget(
  suggestedName: string,
  extension: string,
  description: string,
): Promise<boolean> {
  if (isTauri()) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const path = await save({
      title: description,
      defaultPath: suggestedName,
      filters: [{ name: description, extensions: [extension] }],
    });
    if (!path) return false; // Abbruch im Dialog.
    const { basename } = await import('@tauri-apps/api/path');
    target = { kind: 'tauri', path, name: await basename(path) };
    // „Zuletzt geöffnet" bleibt unter Tauri vorerst leer, siehe oben.
    return true;
  }

  if (!window.showSaveFilePicker) return false;
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description, accept: { [TTMAP_MIME]: [`.${extension}`] } }],
    });
    target = { kind: 'fsa', handle };
    // Eine Datei, in die gespeichert wurde, ist die zuletzt benutzte Karte —
    // sonst stünde sie erst nach dem nächsten Öffnen in der Liste.
    void recentFiles.remember(handle);
    return true;
  } catch (err) {
    // Abbruch im Dialog ist kein Fehler, sondern eine Antwort.
    if (err instanceof DOMException && err.name === 'AbortError') return false;
    throw err;
  }
}

/**
 * Öffnet über die Picker-API und merkt die Datei als Ziel, damit Quicksave
 * danach genau diese Datei überschreibt.
 *
 * Gibt `null` bei Abbruch und `undefined`, wenn es keinen nativen Dialog gibt
 * — dann muss der Aufrufer auf den Dateidialog zurückfallen.
 */
export async function pickOpenTarget(extension: string): Promise<File | null | undefined> {
  if (isTauri()) {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const { readFile } = await import('@tauri-apps/plugin-fs');
    const { basename } = await import('@tauri-apps/api/path');
    const path = await open({
      multiple: false,
      filters: [
        {
          name: 'Karte',
          extensions: [extension, 'uvtt', 'dd2vtt', 'df2vtt'],
        },
      ],
    });
    if (!path) return null; // Abbruch im Dialog.
    const bytes = await readFile(path);
    const name = await basename(path);
    const file = new File([bytes as unknown as BlobPart], name);
    // Nur Projektdateien werden zum Speicherziel: eine importierte .uvtt zu
    // überschreiben wäre fast nie gewollt, sie kann das Projekt gar nicht fassen.
    target = name.toLowerCase().endsWith(`.${extension}`) ? { kind: 'tauri', path, name } : null;
    return file;
  }

  if (!window.showOpenFilePicker) return undefined;
  try {
    const [picked] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          accept: {
            [TTMAP_MIME]: [`.${extension}`],
            'application/json': ['.uvtt', '.dd2vtt', '.df2vtt'],
          },
        },
      ],
    });
    const file = await picked.getFile();
    // Nur Projektdateien werden zum Speicherziel: eine importierte .uvtt zu
    // überschreiben wäre fast nie gewollt, sie kann das Projekt gar nicht fassen.
    target = file.name.toLowerCase().endsWith(`.${extension}`) ? { kind: 'fsa', handle: picked } : null;
    // Nur Projektdateien in die Liste: eine importierte .uvtt wieder zu öffnen
    // hieße, sie noch einmal zu importieren, nicht die Karte fortzusetzen.
    if (target) void recentFiles.remember(picked);
    return file;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
}

/**
 * Liest die gemerkte Datei, bevor sie überschrieben wird.
 *
 * Gebraucht für die Fassungen im Archiv: der bisherige Stand steht nur noch
 * dort. Null heißt „nichts zu holen" — kein Ziel, oder die Datei ist inzwischen
 * verschwunden. Beides ist kein Grund, das Speichern abzubrechen.
 */
export async function readSaveTarget(): Promise<Uint8Array | null> {
  if (!target) return null;
  try {
    if (target.kind === 'tauri') {
      const { readFile } = await import('@tauri-apps/plugin-fs');
      return await readFile(target.path);
    }
    const file = await target.handle.getFile();
    return new Uint8Array(await file.arrayBuffer());
  } catch {
    return null;
  }
}

/** Schreibt in das gemerkte Ziel. Wirft, wenn keins gesetzt ist. */
export async function writeToSaveTarget(bytes: Uint8Array): Promise<void> {
  if (!target) throw new Error('Kein Speicherziel gesetzt');
  if (target.kind === 'tauri') {
    const { writeFile } = await import('@tauri-apps/plugin-fs');
    await writeFile(target.path, bytes);
    return;
  }
  const stream = await target.handle.createWritable();
  try {
    await stream.write(bytes as unknown as BufferSource);
  } finally {
    // Ohne close() bleibt die Datei bei manchen Browsern leer oder gesperrt.
    await stream.close();
  }
}
