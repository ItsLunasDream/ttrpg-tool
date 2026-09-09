/**
 * Eigenheiten der drei Importer.
 *
 * Die Werte hier sind am Quelltext der Importer nachgelesen (siehe
 * `io/vttTargets.ts`). Der Test hält fest, was daraus folgt — vor allem den
 * teuren Punkt: dieselben acht Stellen bedeuten in Owlbear Rodeo etwas anderes
 * als in Foundry und Roll20.
 */

import { describe, expect, it } from 'vitest';
import { createDocument } from '@/model/document';
import { buildUvtt, fromUvttColor, parseUvtt, toUvttColor } from '@/io/uvtt';
import { TARGET_TRAITS, VTT_TARGETS, targetWarnings } from '@/io/vttTargets';
import { setLanguage } from '@/i18n';
import type { MapDocument } from '@/model/types';

function mitLicht(intensity: number, color = 0xffcc88): MapDocument {
  const doc = createDocument();
  doc.vtt.lights = [
    {
      id: 'l1',
      x: 100,
      y: 100,
      range: 4,
      intensity,
      color,
      alpha: 1,
      shadows: true,
    },
  ];
  return doc;
}

describe('Farbreihenfolge', () => {
  it('schreibt AARRGGBB für Foundry und Roll20', () => {
    expect(toUvttColor(0xffcc88, 1, 'argb')).toBe('ffffcc88');
  });

  /**
   * Owlbear Rodeos `normalizeHexColor` behält bei acht Stellen die *ersten
   * sechs*. Aus AARRGGBB würde dort `ffffcc` — ein blasses Gelb statt des
   * warmen Orange.
   */
  it('schreibt RRGGBBAA für Owlbear Rodeo', () => {
    expect(toUvttColor(0xffcc88, 1, 'rgba')).toBe('ffcc88ff');
    // Und genau das ist der Punkt: die ersten sechs Stellen sind die Farbe.
    expect(toUvttColor(0xffcc88, 1, 'rgba').slice(0, 6)).toBe('ffcc88');
    expect(toUvttColor(0xffcc88, 1, 'argb').slice(0, 6)).not.toBe('ffcc88');
  });

  it('liest in beiden Reihenfolgen wieder heraus, was hineinging', () => {
    for (const order of ['argb', 'rgba'] as const) {
      const text = toUvttColor(0x3366aa, 0.5, order);
      const back = fromUvttColor(text, order);
      expect(back.color, order).toBe(0x3366aa);
      expect(back.alpha, order).toBeCloseTo(0.5, 2);
    }
  });

  it('setzt die Farbe entsprechend in die Datei', () => {
    const doc = mitLicht(1);
    expect(buildUvtt(doc, { image: '', pixelsPerGrid: 100 }).lights[0].color).toBe('ffffcc88');
    expect(
      buildUvtt(doc, { image: '', pixelsPerGrid: 100, target: 'owlbear' }).lights[0].color,
    ).toBe('ffcc88ff');
  });

  /**
   * Die Gegenprobe nach dem Export muss mit derselben Reihenfolge lesen —
   * sonst prüft sie etwas anderes, als in der Datei steht.
   */
  it('liest den eigenen Owlbear-Export richtig zurück', () => {
    const doc = mitLicht(1);
    const file = buildUvtt(doc, { image: '', pixelsPerGrid: 100, target: 'owlbear' });
    const zurueck = parseUvtt(JSON.stringify(file), doc.grid.tileSize, 'rgba');
    expect(zurueck.vtt.lights[0].color).toBe(0xffcc88);
    // Mit der falschen Annahme käme etwas anderes heraus — das ist der Fehler,
    // gegen den die Reihenfolge im Reader steht.
    expect(parseUvtt(JSON.stringify(file), doc.grid.tileSize).vtt.lights[0].color).not.toBe(
      0xffcc88,
    );
  });
});

describe('Hinweise zum Zielsystem', () => {
  it('meldet für Owlbear Rodeo, dass Fenster zu Wänden werden', () => {
    setLanguage('de');
    const doc = createDocument();
    doc.vtt.walls = [
      { id: 'w1', points: [0, 0, 100, 0], type: 'window', closed: false },
      { id: 'w2', points: [0, 0, 100, 0], type: 'normal', closed: false },
    ];
    expect(targetWarnings(doc, 'owlbear').join(' ')).toContain('Wände');
    expect(targetWarnings(doc, 'foundry')).toEqual([]);
  });

  it('schweigt, wenn es auf dieser Karte gar keine Fenster gibt', () => {
    const doc = createDocument();
    doc.vtt.walls = [{ id: 'w1', points: [0, 0, 100, 0], type: 'normal', closed: false }];
    expect(targetWarnings(doc, 'owlbear')).toEqual([]);
  });

  it('meldet für Roll20 eine Lichtstärke außerhalb von 0,5 bis 3', () => {
    setLanguage('de');
    expect(targetWarnings(mitLicht(5), 'roll20').some((w) => w.includes('stutzt'))).toBe(true);
    expect(targetWarnings(mitLicht(1), 'roll20').some((w) => w.includes('stutzt'))).toBe(false);
    // Foundry stutzt nicht.
    expect(targetWarnings(mitLicht(5), 'foundry')).toEqual([]);
  });

  it('weist bei Roll20 auf den Maßstab aus dem Kartenbild hin, sobald es Lichter gibt', () => {
    setLanguage('de');
    expect(targetWarnings(mitLicht(1), 'roll20').some((w) => w.includes('px pro Feld'))).toBe(true);
    expect(targetWarnings(createDocument(), 'roll20')).toEqual([]);
  });
});

describe('Eigenschaften der Ziele', () => {
  it('kennt jedes Ziel', () => {
    for (const v of VTT_TARGETS) expect(TARGET_TRAITS[v]).toBeDefined();
  });

  it('hält fest, dass nur Owlbear Rodeo die Farben andersherum liest', () => {
    expect(TARGET_TRAITS.foundry.colorOrder).toBe('argb');
    expect(TARGET_TRAITS.roll20.colorOrder).toBe('argb');
    expect(TARGET_TRAITS.owlbear.colorOrder).toBe('rgba');
  });
});
