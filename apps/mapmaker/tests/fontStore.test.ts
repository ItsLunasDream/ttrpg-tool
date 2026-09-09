import { beforeEach, describe, expect, it } from 'vitest';
import {
  familyFor,
  hasFont,
  importFont,
  importedFonts,
  isFontFile,
  resetFonts,
  restoreFonts,
  usedFonts,
} from '@/assets/fontStore';
import { packProject, unpackProject } from '@/io/project';
import { createDocument } from '@/model/document';
import type { MapDocument, TextObject } from '@/model/types';

/** Ein paar Bytes, die als Datei durchgehen — geladen wird ohne DOM ohnehin nicht. */
const BYTES = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);

function docMitText(family: string): MapDocument {
  const doc = createDocument(10, 10, 'x');
  const layer = Object.values(doc.layers).find((l) => !l.isGroup && !l.id.startsWith('__'))!;
  const text: TextObject = {
    id: 't1',
    kind: 'text',
    layerId: layer.id,
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    z: 0,
    locked: false,
    text: 'Bucht',
    fontFamily: family,
    fontSize: 32,
    bold: false,
    italic: false,
    color: 0xffffff,
    align: 'left',
    letterSpacing: 0,
    lineHeight: 1.2,
    strokeColor: null,
    strokeWidth: 0,
  };
  doc.objects.t1 = text;
  return doc;
}

beforeEach(() => resetFonts());

describe('Schriftdateien erkennen', () => {
  it('nimmt die üblichen Endungen', () => {
    for (const n of ['a.ttf', 'b.OTF', 'c.woff', 'd.woff2']) expect(isFontFile(n)).toBe(true);
  });

  it('weist andere Dateien ab', () => {
    for (const n of ['a.png', 'b.json', 'c.ttmap', 'd']) expect(isFontFile(n)).toBe(false);
  });
});

describe('Familienname', () => {
  it('macht aus dem Dateinamen einen lesbaren Namen', () => {
    expect(familyFor('Cinzel-Regular.ttf')).toBe('Cinzel Regular');
    expect(familyFor('IM_FELL_English.otf')).toBe('IM FELL English');
  });

  it('lässt den Pfad davor weg', () => {
    expect(familyFor('schriften/alt/Uncial.woff2')).toBe('Uncial');
  });

  /** Der Name landet im Dokument — dieselbe Datei muss immer dieselbe Familie ergeben. */
  it('ist für dieselbe Datei stabil', () => {
    expect(familyFor('Cinzel-Regular.ttf')).toBe(familyFor('Cinzel-Regular.ttf'));
  });

  it('fällt bei leerem Namen auf einen Ersatz zurück', () => {
    expect(familyFor('.ttf')).toBe('Importierte Schrift');
  });
});

describe('Schriften ablegen', () => {
  it('legt eine Schrift ab und findet sie wieder', async () => {
    const f = await importFont('Cinzel-Regular.ttf', BYTES);
    expect(f?.family).toBe('Cinzel Regular');
    expect(hasFont('Cinzel Regular')).toBe(true);
    expect(importedFonts()).toHaveLength(1);
  });

  it('übergeht eine Datei, die keine Schrift ist', async () => {
    expect(await importFont('bild.png', BYTES)).toBeNull();
    expect(importedFonts()).toHaveLength(0);
  });

  /**
   * Sonst könnte das Öffnen einer Projektdatei eine gleichnamige Schrift aus
   * der laufenden Sitzung still ersetzen.
   */
  it('ersetzt eine gleichnamige Schrift nicht', async () => {
    await importFont('Cinzel-Regular.ttf', BYTES);
    const zweite = await importFont('Cinzel-Regular.woff2', new Uint8Array([9, 9]));
    expect(zweite?.bytes).toEqual(BYTES);
    expect(importedFonts()).toHaveLength(1);
  });

  it('behält die Dateiendung im Archivnamen', async () => {
    const f = await importFont('Uncial.woff2', BYTES);
    expect(f?.filename).toBe('Uncial.woff2');
  });
});

describe('Nur benutzte Schriften', () => {
  it('nimmt die Schrift mit, die ein Text nennt', async () => {
    await importFont('Cinzel-Regular.ttf', BYTES);
    const map = usedFonts(docMitText('Cinzel Regular'));
    expect([...map.keys()]).toEqual(['Cinzel Regular.ttf']);
  });

  it('lässt eine geladene, aber unbenutzte Schrift weg', async () => {
    await importFont('Cinzel-Regular.ttf', BYTES);
    expect(usedFonts(docMitText('Georgia, serif')).size).toBe(0);
  });
});

describe('Schriften in der Projektdatei', () => {
  it('gehen durch Packen und Entpacken hindurch', async () => {
    await importFont('Cinzel-Regular.ttf', BYTES);
    const doc = docMitText('Cinzel Regular');
    const archiv = packProject(doc, new Map(), undefined, usedFonts(doc));
    const { bundle } = unpackProject(archiv);

    expect([...bundle.fonts.keys()]).toEqual(['Cinzel Regular.ttf']);
    expect(bundle.fonts.get('Cinzel Regular.ttf')).toEqual(BYTES);
    expect(bundle.manifest.fonts).toEqual(['Cinzel Regular.ttf']);
  });

  it('werden beim Öffnen wieder angemeldet', async () => {
    await importFont('Cinzel-Regular.ttf', BYTES);
    const doc = docMitText('Cinzel Regular');
    const archiv = packProject(doc, new Map(), undefined, usedFonts(doc));
    resetFonts();
    expect(hasFont('Cinzel Regular')).toBe(false);

    const { bundle } = unpackProject(archiv);
    await restoreFonts(bundle.fonts);
    expect(hasFont('Cinzel Regular')).toBe(true);
  });

  /** Ältere Archive kennen `fonts/` nicht und müssen trotzdem laden. */
  it('ein Archiv ohne Schriften lädt mit leerer Liste', () => {
    const archiv = packProject(createDocument(5, 5, 'x'));
    const { bundle } = unpackProject(archiv);
    expect(bundle.fonts.size).toBe(0);
  });
});
