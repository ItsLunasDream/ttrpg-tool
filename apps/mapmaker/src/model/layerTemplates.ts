/**
 * Ebenen-Vorlagen: ein Layer-Stapel, einmal eingerichtet und danach für jede
 * neue Karte wiederverwendbar.
 *
 * Gespeichert wird die *Anordnung*, nicht der Inhalt: Namen, Verschachtelung,
 * Sichtbarkeit, Deckkraft, Mischmodus. Objekte gehören nicht dazu — dafür gibt
 * es Bausteine und Karten-Vorlagen.
 *
 * Die Systemebenen (Grid, VTT) stehen in keiner Vorlage. Sie werden von
 * `createDocument` angelegt, haben feste Kennungen und können nicht doppelt
 * vorkommen; eine Vorlage, die sie mitbrächte, würde beim Anwenden entweder
 * die vorhandenen überschreiben oder eine zweite, tote Kopie erzeugen.
 *
 * Verschachtelung steckt als *Index* in derselben Liste, nicht als Kennung:
 * Kennungen werden beim Anwenden neu vergeben, und eine Vorlage, die alte
 * Kennungen mitschleppt, ließe sich kein zweites Mal auf dieselbe Karte
 * anwenden.
 */

import { makeLayer } from './document';
import { makeId } from './ids';
import { SYSTEM_GRID, SYSTEM_VTT, type BlendMode, type Layer, type LayerId, type MapDocument } from './types';

export interface TemplateLayer {
  name: string;
  isGroup: boolean;
  /** Index des Elternteils in derselben Liste; -1 heißt Wurzelebene. */
  parent: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blend: BlendMode;
  includeInExport: boolean;
}

export interface LayerTemplate {
  id: string;
  name: string;
  /** Von unten nach oben; Eltern stehen immer vor ihren Kindern. */
  layers: TemplateLayer[];
}

function isSystem(id: LayerId): boolean {
  return id === SYSTEM_GRID || id === SYSTEM_VTT;
}

/**
 * Nimmt den Stapel einer Karte als Vorlage auf.
 *
 * Höhenebenen werden als gewöhnliche Objektebenen übernommen: ihr Inhalt ist
 * ein Zahlenfeld, das ohne Kartengröße keinen Sinn ergibt, und eine leere
 * Höhenebene wäre in der neuen Karte nur eine Falle.
 */
export function templateFromDocument(name: string, doc: MapDocument): LayerTemplate {
  const layers: TemplateLayer[] = [];
  const indexOf = new Map<LayerId, number>();

  const besuche = (ids: LayerId[], parent: number) => {
    for (const id of ids) {
      const layer = doc.layers[id];
      if (!layer || isSystem(id)) continue;
      const eigener = layers.length;
      indexOf.set(id, eigener);
      layers.push({
        name: layer.name,
        isGroup: layer.isGroup,
        parent,
        visible: layer.visible,
        locked: layer.locked,
        opacity: layer.opacity,
        blend: layer.blend,
        includeInExport: layer.includeInExport,
      });
      if (layer.isGroup) besuche(layer.children, eigener);
    }
  };

  besuche(doc.rootLayers, -1);
  return { id: makeId('ltpl'), name, layers };
}

export interface BuiltLayers {
  /** Fertige Layer, Eltern vor Kindern — in dieser Reihenfolge einzufügen. */
  layers: Layer[];
  /** Kennungen der Wurzelebenen, von unten nach oben. */
  rootIds: LayerId[];
}

/**
 * Baut aus einer Vorlage frische Layer.
 *
 * Frische Kennungen bei jedem Aufruf: dieselbe Vorlage lässt sich damit
 * zweimal auf dieselbe Karte anwenden, ohne dass sich zwei Layer eine Kennung
 * teilen.
 *
 * Die `children` der Gruppen bleiben **leer**. Wer die Layer über `AddLayer`
 * einfügt, bekommt sie von dort eingetragen; sie hier schon zu füllen ergäbe
 * jedes Kind zweimal. Der Weg über ein frisches Dokument trägt sie selbst ein.
 */
export function layersFromTemplate(template: LayerTemplate): BuiltLayers {
  const gebaut: Layer[] = [];
  const rootIds: LayerId[] = [];

  for (const vorlage of template.layers) {
    const eltern = vorlage.parent >= 0 ? gebaut[vorlage.parent] : null;
    const layer = makeLayer(vorlage.name, {
      isGroup: vorlage.isGroup,
      parentId: eltern?.id ?? null,
      visible: vorlage.visible,
      locked: vorlage.locked,
      opacity: vorlage.opacity,
      blend: vorlage.blend,
      includeInExport: vorlage.includeInExport,
    });
    gebaut.push(layer);
    if (!eltern) rootIds.push(layer.id);
  }

  return { layers: gebaut, rootIds };
}

/**
 * Setzt die Benutzerebenen einer Karte auf die Vorlage.
 *
 * Für den Weg „Neu mit Vorlage": das Dokument ist frisch, seine vier
 * Standardebenen sind leer, und sie stehen zu lassen hieße, dem Benutzer die
 * Arbeit zu lassen, die ihm die Vorlage abnehmen soll. Objekte gibt es in einer
 * frischen Karte nicht — deshalb ist hier nichts zu retten und nichts zu
 * fragen.
 *
 * Die Systemebenen bleiben, wo sie sind: ganz oben, in ihrer Reihenfolge.
 */
export function applyTemplateToFreshDocument(
  doc: MapDocument,
  template: LayerTemplate,
): MapDocument {
  const { layers, rootIds } = layersFromTemplate(template);
  if (layers.length === 0) return doc;

  const system = doc.rootLayers.filter(isSystem);
  const neue: Record<LayerId, Layer> = {};
  for (const id of system) neue[id] = doc.layers[id];
  for (const layer of layers) {
    neue[layer.id] = layer;
    if (layer.parentId) neue[layer.parentId].children.push(layer.id);
  }

  doc.layers = neue;
  doc.rootLayers = [...rootIds, ...system];
  return doc;
}

/** Erste Ebene, die Objekte aufnehmen kann — als aktive Ebene nach dem Anwenden. */
export function firstObjectLayer(built: BuiltLayers): LayerId | null {
  return built.layers.find((l) => !l.isGroup)?.id ?? null;
}
