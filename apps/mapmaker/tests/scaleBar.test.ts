/**
 * Maßstabsleiste, die mitrechnet.
 *
 * Der Kern ist die runde Zahl: eine Leiste, die „47,3 km" zeigt, ist kein
 * Maßstab. Die Breite richtet sich danach, nicht umgekehrt.
 */

import { describe, expect, it } from 'vitest';
import { buildScaleBar, niceDistance } from '@/model/scaleBar';
import { isDark } from '@/model/color';
import { createDocument } from '@/model/document';
import type { MapDocument, TextObject } from '@/model/types';

/** Karte: ein Feld = 100 px = 10 km. */
function karte(perTile = 10, unit = 'km'): MapDocument {
  const doc = createDocument(30, 30);
  doc.grid.tileSize = 100;
  doc.grid.distance = { perTile, unit, metric: 'euclidean' };
  return doc;
}

const opts = (doc: MapDocument, targetWidth = 500) => ({
  layerId: doc.rootLayers[0],
  x: 100,
  y: 200,
  targetWidth,
  height: 20,
  color: 0x000000,
  backgroundColor: 0xffffff,
  fontFamily: 'serif',
});

function texte(objekte: ReturnType<typeof buildScaleBar>['objects']): string[] {
  return objekte.filter((o): o is TextObject => o.kind === 'text').map((o) => o.text);
}

describe('niceDistance', () => {
  it('wählt die nächste Zahl aus der Reihe 1–2–5', () => {
    expect(niceDistance(47.3)).toBe(50);
    expect(niceDistance(23)).toBe(20);
    expect(niceDistance(13)).toBe(10);
    // Nach oben, nicht abwärts: eine Leiste bei 5 ließe hier ein Drittel leer.
    expect(niceDistance(7)).toBe(10);
    expect(niceDistance(1.7)).toBe(2);
  });

  it('kommt mit sehr kleinen und sehr großen Zahlen zurecht', () => {
    expect(niceDistance(0.037)).toBe(0.05);
    expect(niceDistance(6400)).toBe(5000);
  });

  it('gibt 0 statt Unsinn bei unbrauchbarer Eingabe', () => {
    expect(niceDistance(0)).toBe(0);
    expect(niceDistance(-5)).toBe(0);
    expect(niceDistance(Number.NaN)).toBe(0);
  });
});

describe('buildScaleBar', () => {
  it('rundet die Distanz und richtet die Breite danach', () => {
    // 500 px Wunsch = 5 Felder = 50 km — die Zahl passt schon.
    const bar = buildScaleBar(karte(), opts(karte(), 500));
    expect(bar.distance).toBe(50);
    expect(bar.width).toBe(500);
  });

  it('macht aus einer krummen Wunschbreite eine runde Zahl', () => {
    const doc = karte();
    // 473 px = 47,3 km → 50 km → 500 px. Die Zahl gewinnt, nicht die Breite.
    const bar = buildScaleBar(doc, opts(doc, 473));
    expect(bar.distance).toBe(50);
    expect(bar.width).toBe(500);
  });

  it('beschriftet Anfang, Mitte und Ende und nennt die Einheit einmal', () => {
    const doc = karte();
    const bar = buildScaleBar(doc, opts(doc, 500));
    expect(texte(bar.objects)).toEqual(['0', '25', '50 km']);
  });

  it('folgt einer anderen Einheit und Feldgröße', () => {
    const doc = karte(1.5, 'm');
    doc.grid.tileSize = 64;
    const bar = buildScaleBar(doc, opts(doc, 500));
    expect(texte(bar.objects).at(-1)).toMatch(/ m$/);
    // Breite passt zur gerundeten Distanz: Distanz / perTile * tileSize.
    expect(bar.width).toBeCloseTo((bar.distance / 1.5) * 64);
  });

  it('schreibt Nachkommastellen nur, wo sie gebraucht werden', () => {
    const doc = karte(1, 'km');
    // 500 px = 5 km → gerundet 5 km, Mitte 2,5.
    const bar = buildScaleBar(doc, opts(doc, 500));
    expect(texte(bar.objects)).toEqual(['0', '2,5', '5 km']);
  });

  it('legt vier Abschnitte an und fasst alles zu einer Gruppe', () => {
    const doc = karte();
    const bar = buildScaleBar(doc, opts(doc, 500));
    const rechtecke = bar.objects.filter((o) => o.kind === 'shape');
    expect(rechtecke).toHaveLength(4);
    expect(bar.objects.every((o) => o.groupId === bar.groupId)).toBe(true);
  });

  it('setzt alles auf den angegebenen Layer und stapelt es aufsteigend', () => {
    const doc = karte();
    const bar = buildScaleBar(doc, opts(doc, 500));
    expect(bar.objects.every((o) => o.layerId === doc.rootLayers[0])).toBe(true);
    const zs = bar.objects.map((o) => o.z);
    expect([...zs].sort((a, b) => a - b)).toEqual(zs);
  });
});

describe('isDark', () => {
  it('erkennt dunkle und helle Gründe', () => {
    expect(isDark(0x000000)).toBe(true);
    expect(isDark(0x37332e)).toBe(true); // der voreingestellte Kartengrund
    expect(isDark(0xf2e8d5)).toBe(false); // Pergament
    expect(isDark(0xffffff)).toBe(false);
  });

  it('richtet sich nach der wahrgenommenen Helligkeit, nicht nach der Summe', () => {
    // Reines Grün wirkt hell, reines Blau dunkel — obwohl beide denselben
    // Zahlenwert in ihrem Kanal haben.
    expect(isDark(0x00ff00)).toBe(false);
    expect(isDark(0x0000ff)).toBe(true);
  });
});
