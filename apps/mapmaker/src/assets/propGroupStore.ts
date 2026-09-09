/**
 * Selbst benannte Prop-Gruppen.
 *
 * Liegen neben der Bibliothek, nicht in ihr: eine Gruppe ist eine eigene
 * Sammlung aus vorhandenen Props (eingebaut oder importiert), keine neue
 * Kategorie und kein neues Prop. Gespeichert wie Bausteine und
 * Ebenen-Vorlagen — lokal, nicht in der Karte, denn wer sich „Taverne"
 * zusammenstellt, will sie auf der nächsten Karte wiederhaben.
 *
 * Anders als die feste Kategorie (`PropCategory`, ein Prop gehört zu genau
 * einer) darf ein Prop in beliebig vielen Gruppen stecken — die Kerze passt
 * zu „Taverne" und zu „Beleuchtung".
 */

import { makeId } from '@/model/ids';
import type { PropGroup } from './propGroups';
import { createLocalLibrary } from './localLibrary';

const library = createLocalLibrary<PropGroup>(
  'ttrpg-map-editor.propGroups',
  1,
  (g) => typeof g.name === 'string' && Array.isArray(g.propIds),
);

export const onPropGroupsChange = library.onChange;
export const allPropGroups = library.all;
export const getPropGroup = library.get;
export const removePropGroup = library.remove;
export const resetPropGroups = library.reset;

export function renamePropGroup(id: string, name: string): void {
  library.patch(id, { name });
}

/** Legt eine leere Gruppe an. Speichert nicht dauerhaft, wenn der Speicher voll ist — die Gruppe bleibt trotzdem benutzbar. */
export function createPropGroup(name: string): PropGroup {
  const group: PropGroup = { id: makeId('propgroup'), name, propIds: [] };
  library.add(group);
  return group;
}

/**
 * Nimmt ein Prop in eine Gruppe auf oder wieder heraus.
 *
 * Kein Fehler, wenn die Gruppe inzwischen gelöscht wurde — der Aufrufer (die
 * Palette im Zuordnungsmodus) muss dann nicht selbst nachsehen.
 */
export function setPropGroupMembership(groupId: string, propId: string, member: boolean): void {
  const g = library.get(groupId);
  if (!g) return;
  const drin = g.propIds.includes(propId);
  if (member === drin) return;
  const propIds = member ? [...g.propIds, propId] : g.propIds.filter((id) => id !== propId);
  library.patch(groupId, { propIds });
}

/** In welchen Gruppen steckt dieses Prop? */
export function groupsForProp(propId: string): PropGroup[] {
  return library.all().filter((g) => g.propIds.includes(propId));
}
