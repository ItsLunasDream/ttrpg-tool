import { describe, expect, it } from 'vitest';
import { strToU8, zipSync } from 'fflate';
import { migrate, packProject, unpackProject } from '@/io/project';
import { AddObjects, History, PatchGrid } from '@/model/commands';
import { createDocument } from '@/model/document';
import { SCHEMA_VERSION, SYSTEM_GRID, SYSTEM_VTT, type MapDocument, type PropObject } from '@/model/types';
import { safeFilename, bytesToBase64, exportSize } from '@/io/exportImage';

function prop(id: string, layerId: string, x = 0, y = 0): PropObject {
  return {
    id, kind: 'prop', layerId, propId: 'stone_small', x, y,
    rotation: 0.5, scaleX: 1.3, scaleY: 1.3, tint: 0x445566, flipX: true, flipY: false,
    opacity: 0.8, z: 3, locked: false, seed: 4242,
  };
}

function populated(): MapDocument {
  const doc = createDocument(24, 18, 'Testkarte');
  const history = new History();
  const layer = doc.rootLayers.find((id) => id !== SYSTEM_GRID && id !== SYSTEM_VTT)!;
  history.exec(doc, new AddObjects([prop('a', layer, 120, 340), prop('b', layer, 500, 90)]));
  history.exec(doc, new PatchGrid({ type: 'hexPointy', tileSize: 80, opacity: 0.4 }));
  doc.vtt.walls.push({ id: 'w1', points: [0, 0, 100, 0, 100, 100], type: 'normal', closed: false });
  doc.vtt.portals.push({ id: 'p1', bounds: [100, 0, 100, 50], closed: true, freestanding: false });
  doc.vtt.lights.push({
    id: 'l1', x: 50, y: 50, range: 4.5, intensity: 0.8, color: 0xffcc88, alpha: 1, shadows: true,
  });
  return doc;
}

describe('.ttmap Roundtrip', () => {
  it('gibt nach Packen und Entpacken dasselbe Dokument zurück', () => {
    const doc = populated();
    const { bundle, report } = unpackProject(packProject(doc));
    expect(report.warnings).toEqual([]);
    expect(bundle.doc).toEqual(doc);
  });

  it('erhält Objektdetails bis in die Feinheiten', () => {
    const doc = populated();
    const { bundle } = unpackProject(packProject(doc));
    const a = bundle.doc.objects.a as PropObject;
    expect(a).toMatchObject({
      propId: 'stone_small', x: 120, y: 340, rotation: 0.5,
      scaleX: 1.3, tint: 0x445566, flipX: true, opacity: 0.8, seed: 4242,
    });
  });

  it('erhält Wände, Türen und Lichter', () => {
    const doc = populated();
    const { bundle } = unpackProject(packProject(doc));
    expect(bundle.doc.vtt.walls).toEqual(doc.vtt.walls);
    expect(bundle.doc.vtt.portals).toEqual(doc.vtt.portals);
    expect(bundle.doc.vtt.lights[0].range).toBe(4.5);
  });

  it('erhält den Layer-Stapel samt Systemebenen', () => {
    const doc = populated();
    const { bundle } = unpackProject(packProject(doc));
    expect(bundle.doc.rootLayers).toEqual(doc.rootLayers);
    expect(bundle.doc.layers[SYSTEM_VTT].includeInExport).toBe(false);
  });

  it('bettet Assets ein und gibt sie unverändert zurück', () => {
    const doc = createDocument();
    const assets = new Map([['baum.png', new Uint8Array([137, 80, 78, 71, 1, 2, 3])]]);
    const { bundle } = unpackProject(packProject(doc, assets));
    expect([...bundle.assets.keys()]).toEqual(['baum.png']);
    expect([...bundle.assets.get('baum.png')!]).toEqual([137, 80, 78, 71, 1, 2, 3]);
    expect(bundle.manifest.assets).toEqual(['baum.png']);
  });

  it('legt ein Vorschaubild ab, ohne es unter assets zu zählen', () => {
    const bytes = packProject(createDocument(), new Map(), new Uint8Array([1, 2, 3]));
    const { bundle } = unpackProject(bytes);
    expect(bundle.assets.size).toBe(0);
  });

  it('schreibt die aktuelle Schemaversion ins Manifest', () => {
    const { bundle } = unpackProject(packProject(createDocument()));
    expect(bundle.manifest.schemaVersion).toBe(SCHEMA_VERSION);
  });
});

describe('Fehlerfälle beim Laden', () => {
  it('weist Daten zurück, die kein ZIP sind', () => {
    expect(() => unpackProject(new Uint8Array([1, 2, 3, 4]))).toThrow(/kein gültiges/);
  });

  it('weist ein Archiv ohne scene.json zurück', () => {
    const zip = zipSync({ 'manifest.json': strToU8('{}') });
    expect(() => unpackProject(zip)).toThrow(/scene\.json/);
  });

  it('weist beschädigtes JSON zurück', () => {
    const zip = zipSync({ 'scene.json': strToU8('{ kaputt') });
    expect(() => unpackProject(zip)).toThrow(/beschädigt/);
  });

  it('kommt ohne manifest.json aus und warnt nicht grundlos', () => {
    const doc = createDocument();
    const zip = zipSync({ 'scene.json': strToU8(JSON.stringify(doc)) });
    const { bundle } = unpackProject(zip);
    expect(bundle.doc.meta.name).toBe(doc.meta.name);
  });
});

describe('migrate', () => {
  it('füllt fehlende Felder aus einem frischen Dokument auf', () => {
    const report = { warnings: [] as string[] };
    const doc = migrate({ size: { cols: 12, rows: 9 } }, report);
    expect(doc.size).toEqual({ cols: 12, rows: 9 });
    expect(doc.grid.tileSize).toBeGreaterThan(0);
    expect(doc.vtt.walls).toEqual([]);
    expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('rettet Objekte, deren Layer fehlt, statt sie zu verlieren', () => {
    const base = createDocument();
    const raw = JSON.parse(JSON.stringify(base)) as MapDocument;
    raw.objects = { x: prop('x', 'gibt_es_nicht') };
    const report = { warnings: [] as string[] };
    const doc = migrate(raw, report);
    expect(doc.objects.x).toBeDefined();
    expect(doc.layers[doc.objects.x.layerId]).toBeDefined();
    expect(report.warnings.join(' ')).toMatch(/fehlende Layer/);
  });

  it('entfernt Stapelverweise auf gelöschte Layer', () => {
    const base = createDocument();
    const raw = JSON.parse(JSON.stringify(base)) as MapDocument;
    raw.rootLayers = [...raw.rootLayers, 'geist'];
    const doc = migrate(raw, { warnings: [] });
    expect(doc.rootLayers).not.toContain('geist');
  });

  it('warnt bei Dateien aus einer neueren Version, öffnet sie aber', () => {
    const raw = { ...createDocument(), schemaVersion: SCHEMA_VERSION + 5 };
    const report = { warnings: [] as string[] };
    const doc = migrate(raw, report);
    expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
    expect(report.warnings.join(' ')).toMatch(/neueren Version/);
  });

  it('lehnt ab, was gar kein Objekt ist', () => {
    expect(() => migrate('nein', { warnings: [] })).toThrow();
    expect(() => migrate(null, { warnings: [] })).toThrow();
  });
});

describe('Export-Hilfen', () => {
  it('rechnet die Ausgabegröße aus Tiles und px/Tile aus', () => {
    const doc = createDocument(30, 20);
    expect(exportSize(doc, 100)).toMatchObject({ width: 3000, height: 2000 });
    expect(exportSize(doc, 50)).toMatchObject({ width: 1500, height: 1000 });
  });

  it('meldet zu große Karten statt still ein leeres Bild zu liefern', () => {
    const doc = createDocument(300, 300);
    const info = exportSize(doc, 200);
    expect(info.tooLarge).toBe(true);
    expect(info.reason).toBeTruthy();
  });

  it('säubert Dateinamen und behält Bindestriche', () => {
    expect(safeFilename('Burg Falkenstein', 'webp')).toBe('Burg_Falkenstein.webp');
    expect(safeFilename('Burg-Falkenstein', 'webp')).toBe('Burg-Falkenstein.webp');
    expect(safeFilename('a/b:c*d', 'png')).toBe('a_b_c_d.png');
    expect(safeFilename('   ', 'png')).toBe('karte.png');
  });

  it('kodiert auch große Puffer nach base64', () => {
    // In Blöcken kodiert — am Stück würde das den Aufrufstapel sprengen.
    const bytes = new Uint8Array(300_000).map((_, i) => i % 256);
    const b64 = bytesToBase64(bytes);
    expect(b64.length).toBeGreaterThan(390_000);
    expect(atob(b64.slice(0, 8)).charCodeAt(0)).toBe(0);
  });
});
