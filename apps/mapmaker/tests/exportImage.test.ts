import { describe, expect, it } from 'vitest';
import { exportSize, safeFilename, tileCount } from '@/io/exportImage';
import { createDocument } from '@/model/document';

describe('tileCount', () => {
  it('zählt angebrochene Kacheln mit', () => {
    // Die Kachelkante ist 2048; 2049 px sind zwei Kacheln, nicht eine.
    expect(tileCount({ width: 2048, height: 2048 })).toBe(1);
    expect(tileCount({ width: 2049, height: 2048 })).toBe(2);
    expect(tileCount({ width: 2049, height: 2049 })).toBe(4);
  });

  it('ist bei leerer Fläche null', () => {
    expect(tileCount({ width: 0, height: 100 })).toBe(0);
    expect(tileCount({ width: -5, height: 100 })).toBe(0);
  });

  it('passt zur Größe eines echten Exports', () => {
    const doc = createDocument(150, 150);
    const size = exportSize(doc, 100);
    // 15 000 × 15 000 px, also 8 × 8 Kacheln.
    expect(size.width).toBe(15000);
    expect(tileCount(size)).toBe(64);
  });
});

describe('safeFilename', () => {
  it('hängt die Endung an und ersetzt Unbrauchbares', () => {
    expect(safeFilename('Krypta / Ebene 2', 'png')).toMatch(/\.png$/);
    expect(safeFilename('Krypta / Ebene 2', 'png')).not.toMatch(/\//);
  });
});
