/**
 * Bibliothek der Ebenen-Vorlagen.
 *
 * Wie die Bausteine neben der Karte und nicht in ihr: welchen Stapel jemand
 * gewohnheitsmäßig anlegt, ist eine Angewohnheit des Benutzers und keine
 * Eigenschaft einer einzelnen Karte.
 */

import type { LayerTemplate } from '@/model/layerTemplates';
import { createLocalLibrary } from './localLibrary';

const library = createLocalLibrary<LayerTemplate>(
  'ttrpg-map-editor.layerTemplates',
  1,
  // Eine Vorlage ohne Ebenen legt nichts an.
  (v) => Array.isArray(v.layers) && v.layers.length > 0,
);

export const onLayerTemplatesChange = library.onChange;
export const allLayerTemplates = library.all;
export const getLayerTemplate = library.get;
export const addLayerTemplate = library.add;
export const removeLayerTemplate = library.remove;
export const resetLayerTemplates = library.reset;

export function renameLayerTemplate(id: string, name: string): void {
  library.patch(id, { name });
}
