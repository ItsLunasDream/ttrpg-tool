import { describe, expect, it } from 'vitest';
import {
  MAX_VERSIONS,
  documentFromVersion,
  historyFrom,
  packProject,
  unpackProject,
} from '@/io/project';
import { createDocument } from '@/model/document';
import type { MapDocument } from '@/model/types';

/** Karte mit erkennbarem Namen, damit sich Fassungen unterscheiden lassen. */
function karte(name: string): MapDocument {
  const doc = createDocument(10, 10, name);
  doc.meta.name = name;
  return doc;
}

/** Speichern über eine vorhandene Datei — so, wie es die Oberfläche tut. */
function ueberschreiben(vorhanden: Uint8Array, doc: MapDocument): Uint8Array {
  return packProject(doc, new Map(), undefined, new Map(), historyFrom(vorhanden));
}

describe('Fassungen im Archiv', () => {
  it('legt beim Überschreiben den bisherigen Stand als Fassung ab', () => {
    const erst = packProject(karte('Erster Stand'));
    const zweit = ueberschreiben(erst, karte('Zweiter Stand'));

    const { bundle } = unpackProject(zweit);
    expect(bundle.doc.meta.name).toBe('Zweiter Stand');
    expect(bundle.versions).toHaveLength(1);
    expect(documentFromVersion(bundle.versions[0].data).doc.meta.name).toBe('Erster Stand');
  });

  it('reiht weitere Fassungen davor, neueste zuerst', () => {
    let datei = packProject(karte('A'));
    datei = ueberschreiben(datei, karte('B'));
    datei = ueberschreiben(datei, karte('C'));

    const { bundle } = unpackProject(datei);
    expect(bundle.doc.meta.name).toBe('C');
    const namen = bundle.versions.map((v) => documentFromVersion(v.data).doc.meta.name);
    expect(namen).toEqual(['B', 'A']);
  });

  it('behält höchstens MAX_VERSIONS Fassungen', () => {
    let datei = packProject(karte('Stand 0'));
    for (let i = 1; i <= MAX_VERSIONS + 3; i++) {
      datei = ueberschreiben(datei, karte(`Stand ${i}`));
    }
    const { bundle } = unpackProject(datei);
    expect(bundle.versions).toHaveLength(MAX_VERSIONS);
    // Die ältesten fallen hinten heraus, nicht die neuesten.
    const namen = bundle.versions.map((v) => documentFromVersion(v.data).doc.meta.name);
    expect(namen[0]).toBe(`Stand ${MAX_VERSIONS + 2}`);
  });

  it('trägt die Fassungen auch ins Manifest ein', () => {
    const datei = ueberschreiben(packProject(karte('A')), karte('B'));
    const { bundle } = unpackProject(datei);
    expect(bundle.manifest.versions).toHaveLength(1);
    expect(bundle.manifest.versions![0].file).toBe(bundle.versions[0].file);
    // Der Zeitstempel ist lesbares ISO, nicht der Dateiname.
    expect(bundle.versions[0].savedAt).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/);
  });

  it('kommt ohne Vorgeschichte aus', () => {
    const { bundle } = unpackProject(packProject(karte('Allein')));
    expect(bundle.versions).toEqual([]);
  });

  it('liest ein altes Archiv ohne versions/ anstandslos', () => {
    // packProject ohne History erzeugt genau so eines.
    const alt = packProject(karte('Alte Datei'));
    expect(() => unpackProject(alt)).not.toThrow();
    expect(unpackProject(alt).bundle.versions).toEqual([]);
  });

  it('gibt bei unlesbaren Daten keine Vorgeschichte statt zu werfen', () => {
    // Speichern darf nicht daran scheitern, dass die alte Datei kaputt war.
    expect(historyFrom(new Uint8Array([1, 2, 3, 4]))).toEqual([]);
  });

  it('behält Assets und Fassungen nebeneinander', () => {
    const bild = new Uint8Array([1, 2, 3]);
    const erst = packProject(karte('A'), new Map([['bild.png', bild]]));
    const zweit = packProject(
      karte('B'),
      new Map([['bild.png', bild]]),
      undefined,
      new Map(),
      historyFrom(erst),
    );
    const { bundle } = unpackProject(zweit);
    expect(bundle.assets.get('bild.png')).toEqual(bild);
    expect(bundle.versions).toHaveLength(1);
  });
});
