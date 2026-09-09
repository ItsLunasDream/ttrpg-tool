/**
 * Gesperrte Ebenen.
 *
 * Das Sperren war nur halb umgesetzt: `defaultTargetLayer` und
 * `isObjectEditable` beachteten es, `canHoldObjects` nicht — man konnte in
 * einen gesperrten Layer malen und die Objekte danach nicht mehr anfassen,
 * weil derselbe Layer sie schützte. Und eine Auswahl, die vor dem Sperren
 * entstanden war, ließ sich weiter ziehen und löschen.
 */

import { describe, expect, it } from 'vitest';
import {
  canHoldObjects,
  createDocument,
  defaultTargetLayer,
  isObjectEditable,
  makeLayer,
} from '@/model/document';
import type { MapDocument, MapObject } from '@/model/types';

function karte(): MapDocument {
  const doc = createDocument(10, 10);
  const objekt: MapObject = {
    id: 'o1',
    kind: 'prop',
    layerId: doc.rootLayers[0],
    x: 0, y: 0, rotation: 0, opacity: 1, z: 0, locked: false, groupId: null,
    propId: 'stuhl', scaleX: 1, scaleY: 1, tint: null, flipX: false, flipY: false, seed: 1,
  };
  doc.objects[objekt.id] = objekt;
  return doc;
}

describe('canHoldObjects', () => {
  it('lässt einen gewöhnlichen Objekt-Layer zu', () => {
    const doc = karte();
    expect(canHoldObjects(doc, doc.rootLayers[0])).toBe(true);
  });

  it('weist einen gesperrten Layer ab', () => {
    const doc = karte();
    doc.layers[doc.rootLayers[0]].locked = true;
    expect(canHoldObjects(doc, doc.rootLayers[0])).toBe(false);
  });

  it('weist ihn auch ab, wenn erst die Gruppe darüber gesperrt ist', () => {
    const doc = karte();
    const gruppe = makeLayer('Gebäude', { isGroup: true });
    const kind = doc.layers[doc.rootLayers[0]];
    gruppe.children = [kind.id];
    gruppe.locked = true;
    kind.parentId = gruppe.id;
    doc.layers[gruppe.id] = gruppe;
    doc.rootLayers[0] = gruppe.id;

    expect(canHoldObjects(doc, kind.id)).toBe(false);
  });

  it('weist Gruppen, Systemebenen und Höhenebenen weiter ab', () => {
    const doc = karte();
    const gruppe = makeLayer('Gruppe', { isGroup: true });
    const hoehe = makeLayer('Höhen', { kind: 'height' });
    doc.layers[gruppe.id] = gruppe;
    doc.layers[hoehe.id] = hoehe;
    expect(canHoldObjects(doc, gruppe.id)).toBe(false);
    expect(canHoldObjects(doc, hoehe.id)).toBe(false);
    expect(canHoldObjects(doc, 'gibt-es-nicht')).toBe(false);
  });

  it('zieht mit `isObjectEditable` an einem Strang', () => {
    // Beide Fragen hängen zusammen: wo nichts hinein darf, darf auch nichts
    // heraus. Genau das Auseinanderlaufen war der Fehler.
    const doc = karte();
    const layer = doc.rootLayers[0];
    expect(canHoldObjects(doc, layer)).toBe(isObjectEditable(doc, 'o1'));

    doc.layers[layer].locked = true;
    expect(canHoldObjects(doc, layer)).toBe(isObjectEditable(doc, 'o1'));
  });
});

describe('defaultTargetLayer', () => {
  it('überspringt gesperrte Ebenen', () => {
    const doc = createDocument(10, 10);
    const oberste = doc.rootLayers.filter((id) => canHoldObjects(doc, id));
    for (const id of oberste.slice(0, oberste.length - 1)) doc.layers[id].locked = true;
    const ziel = defaultTargetLayer(doc);
    expect(ziel).not.toBeNull();
    expect(doc.layers[ziel!].locked).toBe(false);
  });

  it('gibt null, wenn alles gesperrt ist', () => {
    const doc = createDocument(10, 10);
    for (const id of Object.keys(doc.layers)) doc.layers[id].locked = true;
    expect(defaultTargetLayer(doc)).toBeNull();
  });
});
