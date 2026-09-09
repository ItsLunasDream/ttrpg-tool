import { describe, expect, it } from 'vitest';
import {
  applyTemplateToFreshDocument,
  firstObjectLayer,
  layersFromTemplate,
  templateFromDocument,
} from '@/model/layerTemplates';
import { AddLayer, CompositeCommand } from '@/model/commands';
import { createDocument, flattenLayers, makeLayer } from '@/model/document';
import { SYSTEM_GRID, SYSTEM_VTT } from '@/model/types';

/** Karte mit einer Gruppe, in der zwei Ebenen stecken. */
function docMitGruppe() {
  const doc = createDocument(10, 10);
  const gruppe = makeLayer('Gebäude', { isGroup: true });
  const innen = makeLayer('Innen', { parentId: gruppe.id });
  const dach = makeLayer('Dach', { parentId: gruppe.id, visible: false, opacity: 0.5 });
  gruppe.children = [innen.id, dach.id];
  doc.layers[gruppe.id] = gruppe;
  doc.layers[innen.id] = innen;
  doc.layers[dach.id] = dach;
  doc.rootLayers.splice(1, 0, gruppe.id);
  return doc;
}

describe('templateFromDocument', () => {
  it('nimmt die Benutzerebenen auf, aber keine Systemebenen', () => {
    const tpl = templateFromDocument('Standard', createDocument(10, 10));
    expect(tpl.layers).toHaveLength(4);
    expect(tpl.layers.every((l) => l.parent === -1)).toBe(true);
  });

  it('behält Verschachtelung als Index in derselben Liste', () => {
    const tpl = templateFromDocument('Haus', docMitGruppe());
    const gruppe = tpl.layers.findIndex((l) => l.name === 'Gebäude');
    const innen = tpl.layers.find((l) => l.name === 'Innen')!;
    const dach = tpl.layers.find((l) => l.name === 'Dach')!;
    expect(gruppe).toBeGreaterThanOrEqual(0);
    expect(innen.parent).toBe(gruppe);
    expect(dach.parent).toBe(gruppe);
    // Eltern stehen vor ihren Kindern, sonst ließe sich nicht der Reihe nach bauen.
    expect(gruppe).toBeLessThan(tpl.layers.indexOf(innen));
  });

  it('übernimmt Sichtbarkeit, Deckkraft und Mischmodus', () => {
    const tpl = templateFromDocument('Haus', docMitGruppe());
    const dach = tpl.layers.find((l) => l.name === 'Dach')!;
    expect(dach.visible).toBe(false);
    expect(dach.opacity).toBe(0.5);
  });
});

describe('layersFromTemplate', () => {
  it('gibt bei jedem Aufruf frische Kennungen', () => {
    const tpl = templateFromDocument('Standard', createDocument(10, 10));
    const a = layersFromTemplate(tpl);
    const b = layersFromTemplate(tpl);
    const ids = new Set([...a.layers, ...b.layers].map((l) => l.id));
    expect(ids.size).toBe(a.layers.length + b.layers.length);
  });

  it('lässt die Kinderlisten leer — die füllt AddLayer', () => {
    const gebaut = layersFromTemplate(templateFromDocument('Haus', docMitGruppe()));
    const gruppe = gebaut.layers.find((l) => l.isGroup)!;
    expect(gruppe.children).toEqual([]);
    // Der Elternverweis steht trotzdem schon.
    expect(gebaut.layers.filter((l) => l.parentId === gruppe.id)).toHaveLength(2);
  });

  it('nennt nur die Wurzelebenen als rootIds', () => {
    const gebaut = layersFromTemplate(templateFromDocument('Haus', docMitGruppe()));
    expect(gebaut.rootIds).toHaveLength(5);
  });

  it('firstObjectLayer überspringt Gruppen', () => {
    const tpl = templateFromDocument('Nur Gruppe', docMitGruppe());
    const nurGruppe = { ...tpl, layers: tpl.layers.filter((l) => l.isGroup || l.name === 'Innen') };
    const gebaut = layersFromTemplate(nurGruppe);
    const erste = firstObjectLayer(gebaut);
    expect(gebaut.layers.find((l) => l.id === erste)!.isGroup).toBe(false);
  });
});

describe('Anwenden über AddLayer', () => {
  it('hängt die Ebenen an die vorhandene Karte an, mit richtiger Verschachtelung', () => {
    const quelle = docMitGruppe();
    const tpl = templateFromDocument('Haus', quelle);

    const ziel = createDocument(10, 10);
    const vorher = ziel.rootLayers.length;
    const gebaut = layersFromTemplate(tpl);
    new CompositeCommand(gebaut.layers.map((l) => new AddLayer(l))).do(ziel);

    expect(ziel.rootLayers.length).toBe(vorher + gebaut.rootIds.length);
    const gruppe = gebaut.layers.find((l) => l.isGroup)!;
    // Jedes Kind steht genau einmal in der Gruppe — nicht doppelt.
    expect(ziel.layers[gruppe.id].children).toHaveLength(2);
  });

  it('macht das Anwenden vollständig rückgängig', () => {
    const tpl = templateFromDocument('Haus', docMitGruppe());
    const ziel = createDocument(10, 10);
    const vorher = flattenLayers(ziel).map((l) => l.id);

    const cmd = new CompositeCommand(
      layersFromTemplate(tpl).layers.map((l) => new AddLayer(l)),
    );
    cmd.do(ziel);
    cmd.undo(ziel);

    expect(flattenLayers(ziel).map((l) => l.id)).toEqual(vorher);
  });
});

describe('applyTemplateToFreshDocument', () => {
  it('ersetzt die Standardebenen und behält die Systemebenen', () => {
    const tpl = templateFromDocument('Haus', docMitGruppe());
    const doc = applyTemplateToFreshDocument(createDocument(10, 10), tpl);

    expect(doc.layers[SYSTEM_GRID]).toBeDefined();
    expect(doc.layers[SYSTEM_VTT]).toBeDefined();
    // Standardebenen sind weg: übrig bleiben Vorlage plus zwei Systemebenen.
    expect(Object.keys(doc.layers)).toHaveLength(tpl.layers.length + 2);
    expect(doc.rootLayers.at(-1)).toBe(SYSTEM_VTT);
  });

  it('trägt die Kinder genau einmal in ihre Gruppe ein', () => {
    const tpl = templateFromDocument('Haus', docMitGruppe());
    const doc = applyTemplateToFreshDocument(createDocument(10, 10), tpl);
    const gruppe = Object.values(doc.layers).find((l) => l.isGroup)!;
    expect(gruppe.children).toHaveLength(2);
    expect(flattenLayers(doc).filter((l) => l.name === 'Innen')).toHaveLength(1);
  });

  it('lässt eine Karte in Ruhe, wenn die Vorlage leer ist', () => {
    const doc = createDocument(10, 10);
    const vorher = [...doc.rootLayers];
    applyTemplateToFreshDocument(doc, { id: 'x', name: 'leer', layers: [] });
    expect(doc.rootLayers).toEqual(vorher);
  });
});
