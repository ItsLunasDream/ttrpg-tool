/**
 * Bibliothek der Bausteine.
 *
 * Liegt neben der Karte, nicht in ihr: ein gesetzter Baustein ist danach ein
 * Haufen gewöhnlicher Objekte und hängt an nichts mehr — die Karte braucht die
 * Vorlage also nie wieder. Und wer sich eine Sitzecke zusammenstellt, will sie
 * auf der *nächsten* Karte wiederhaben; im Dokument gespeichert wäre sie mit
 * genau der einen Karte weitergegeben worden.
 */

import type { Stamp } from '@/model/stamps';
import { createLocalLibrary } from './localLibrary';

const library = createLocalLibrary<Stamp>(
  'ttrpg-map-editor.stamps',
  1,
  // Ein Baustein ohne Objekte setzt nichts.
  (s) => Array.isArray(s.objects) && s.objects.length > 0,
);

export const onStampsChange = library.onChange;
export const allStamps = library.all;
export const getStamp = library.get;
export const addStamp = library.add;
export const removeStamp = library.remove;
export const resetStamps = library.reset;

export function renameStamp(id: string, name: string): void {
  library.patch(id, { name });
}
