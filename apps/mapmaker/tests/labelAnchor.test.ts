/**
 * Beschriftungen, die an einem Objekt hängen.
 *
 * Der Anschluss ist bewusst *keine* Renderer-Sache: er wirkt, indem die
 * Beschriftung in die Menge der angefassten Objekte rutscht. Geprüft wird
 * deshalb genau das — und die Fälle, in denen die Erweiterung sich selbst in
 * den Fuß schießen könnte: Selbstbezug und Ringe.
 */

import { describe, expect, it } from 'vitest';
import { createDocument, defaultTargetLayer } from '@/model/document';
import {
  anchorTarget,
  anchoredLabels,
  canAnchor,
  isAnchoredLabel,
  withAnchoredLabels,
} from '@/model/labelAnchor';
import type { MapDocument, ShapeObject, TextObject } from '@/model/types';

function karte(): { doc: MapDocument; layer: string } {
  const doc = createDocument();
  return { doc, layer: defaultTargetLayer(doc)! };
}

function text(doc: MapDocument, layer: string, id: string, anchorId?: string): TextObject {
  const o: TextObject = {
    id,
    layerId: layer,
    kind: 'text',
    x: 10,
    y: 10,
    rotation: 0,
    opacity: 1,
    z: 1,
    locked: false,
    text: id,
    fontFamily: 'serif',
    fontSize: 16,
    bold: false,
    italic: false,
    color: 0,
    align: 'center',
    letterSpacing: 0,
    lineHeight: 1.2,
    strokeColor: null,
    strokeWidth: 0,
    ...(anchorId ? { anchorId } : {}),
  };
  doc.objects[id] = o;
  return o;
}

function form(doc: MapDocument, layer: string, id: string): ShapeObject {
  const o: ShapeObject = {
    id,
    layerId: layer,
    kind: 'shape',
    shape: 'line',
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    z: 0,
    locked: false,
    points: [0, 0, 10, 0],
    stroke: { color: 0xffffff, width: 2, alpha: 1, dash: [] },
    fill: null,
    closed: false,
    blend: 'normal',
  };
  doc.objects[id] = o;
  return o;
}

describe('Anschluss einer Beschriftung', () => {
  it('erkennt eine angeheftete Beschriftung', () => {
    const { doc, layer } = karte();
    form(doc, layer, 'stadt');
    expect(isAnchoredLabel(text(doc, layer, 'frei'))).toBe(false);
    expect(isAnchoredLabel(text(doc, layer, 'name', 'stadt'))).toBe(true);
  });

  it('findet das Bezugsobjekt und meldet, wenn es fehlt', () => {
    const { doc, layer } = karte();
    const stadt = form(doc, layer, 'stadt');
    const name = text(doc, layer, 'name', 'stadt');
    expect(anchorTarget(doc, name)).toBe(stadt);
    delete doc.objects.stadt;
    expect(anchorTarget(doc, name)).toBeNull();
  });

  it('nimmt die Beschriftung mit, wenn das Objekt angefasst wird', () => {
    const { doc, layer } = karte();
    form(doc, layer, 'stadt');
    text(doc, layer, 'name', 'stadt');
    text(doc, layer, 'anderswo');
    expect(withAnchoredLabels(doc, ['stadt']).sort()).toEqual(['name', 'stadt']);
    // Umgekehrt nicht: die Beschriftung allein zieht die Stadt nicht mit.
    expect(withAnchoredLabels(doc, ['name'])).toEqual(['name']);
  });

  it('nimmt auch eine Beschriftung an der Beschriftung mit', () => {
    const { doc, layer } = karte();
    form(doc, layer, 'stadt');
    text(doc, layer, 'name', 'stadt');
    text(doc, layer, 'zusatz', 'name');
    expect(withAnchoredLabels(doc, ['stadt']).sort()).toEqual(['name', 'stadt', 'zusatz']);
  });

  /**
   * Ein Ring kann nur über eine von Hand veränderte Datei hereinkommen — aber
   * dann darf die Suche nicht endlos laufen.
   */
  it('läuft bei einem Ring nicht endlos', () => {
    const { doc, layer } = karte();
    text(doc, layer, 'a', 'b');
    text(doc, layer, 'b', 'a');
    expect(anchoredLabels(doc, ['a']).sort()).toEqual(['b']);
    expect(withAnchoredLabels(doc, ['a']).sort()).toEqual(['a', 'b']);
  });

  it('verbietet Selbstbezug und Ringe beim Anheften', () => {
    const { doc, layer } = karte();
    form(doc, layer, 'stadt');
    text(doc, layer, 'name', 'stadt');
    text(doc, layer, 'zusatz', 'name');

    expect(canAnchor(doc, 'name', 'name')).toBe(false);
    // „name" an „zusatz" hängen hieße: zusatz hängt an name hängt an zusatz.
    expect(canAnchor(doc, 'name', 'zusatz')).toBe(false);
    expect(canAnchor(doc, 'name', 'stadt')).toBe(true);
  });

  it('lässt nur Text anheften', () => {
    const { doc, layer } = karte();
    form(doc, layer, 'a');
    form(doc, layer, 'b');
    expect(canAnchor(doc, 'a', 'b')).toBe(false);
  });
});
