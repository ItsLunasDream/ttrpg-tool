/**
 * Alles, was neu ins Dokument gekommen ist, überlebt Speichern und Laden.
 *
 * `migrate` in `io/project.ts` baut das Dokument bewusst Feld für Feld auf,
 * damit eine fremde Datei nichts Unbekanntes einschleust. Der Preis ist, dass
 * ein vergessenes Feld *still* verschwindet — genau so gingen die Filter über
 * der ganzen Karte einmal bei jedem Speichern verloren.
 */

import { describe, expect, it } from 'vitest';
import { createDocument, defaultTargetLayer } from '@/model/document';
import { packProject, unpackProject } from '@/io/project';
import type { MapDocument } from '@/model/types';

function durchsArchiv(doc: MapDocument): MapDocument {
  const { bundle, report } = unpackProject(packProject(doc));
  expect(report.warnings).toEqual([]);
  return bundle.doc;
}

function bestueckt(): MapDocument {
  const doc = createDocument();
  const layer = defaultTargetLayer(doc)!;
  doc.guides = [
    { id: 'gx', axis: 'x', pos: 640 },
    { id: 'gy', axis: 'y', pos: 320 },
  ];
  doc.vtt.walls = [
    {
      id: 'w1',
      points: [0, 0, 100, 0],
      type: 'normal',
      closed: false,
      senses: { move: true, sight: false, light: true, sound: false },
    },
  ];
  doc.objects.stadt = {
    id: 'stadt',
    layerId: layer,
    kind: 'shape',
    shape: 'rect',
    x: 100,
    y: 100,
    rotation: 0,
    opacity: 1,
    z: 1,
    locked: false,
    points: [-10, -10, 10, -10, 10, 10, -10, 10],
    stroke: { color: 0xffffff, width: 2, alpha: 1, dash: [] },
    fill: null,
    closed: true,
    blend: 'normal',
    route: { perDay: 55, marks: true },
  };
  doc.objects.name = {
    id: 'name',
    layerId: layer,
    kind: 'text',
    x: 100,
    y: 60,
    rotation: 0,
    opacity: 1,
    z: 2,
    locked: false,
    text: 'Falkenstein',
    fontFamily: 'serif',
    fontSize: 18,
    bold: false,
    italic: false,
    color: 0xffffff,
    align: 'center',
    letterSpacing: 0,
    lineHeight: 1.2,
    strokeColor: null,
    strokeWidth: 0,
    anchorId: 'stadt',
  };
  return doc;
}

describe('Rundlauf durch die Projektdatei', () => {
  it('behält Hilfslinien', () => {
    const zurueck = durchsArchiv(bestueckt());
    expect(zurueck.guides).toEqual([
      { id: 'gx', axis: 'x', pos: 640 },
      { id: 'gy', axis: 'y', pos: 320 },
    ]);
  });

  it('behält die einzelnen Wandsperren', () => {
    const zurueck = durchsArchiv(bestueckt());
    expect(zurueck.vtt.walls[0].senses).toEqual({
      move: true,
      sight: false,
      light: true,
      sound: false,
    });
  });

  it('behält den Anschluss einer Beschriftung', () => {
    const zurueck = durchsArchiv(bestueckt());
    expect((zurueck.objects.name as { anchorId?: string }).anchorId).toBe('stadt');
  });

  it('behält die Angaben einer Reiseroute', () => {
    const zurueck = durchsArchiv(bestueckt());
    expect((zurueck.objects.stadt as { route?: unknown }).route).toEqual({
      perDay: 55,
      marks: true,
    });
  });

  it('wirft unbrauchbare Hilfslinien weg und meldet es', () => {
    const doc = bestueckt();
    // Was so nur über eine von Hand veränderte Datei hereinkäme.
    (doc.guides as unknown[]).push({ id: 'kaputt', axis: 'z', pos: 'weit' });
    const { bundle, report } = unpackProject(packProject(doc));
    expect(bundle.doc.guides).toHaveLength(2);
    expect(report.warnings.join(' ')).toContain('Hilfslinien');
  });

  it('kommt mit einer Karte ohne die neuen Felder zurecht', () => {
    const alt = createDocument();
    const zurueck = durchsArchiv(alt);
    expect(zurueck.guides ?? []).toEqual([]);
    expect(zurueck.objects).toEqual({});
  });
});
