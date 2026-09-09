/**
 * Vorgaben für neu gesetzte Props.
 *
 * Der Wert dieser Tests liegt weniger im Rechnen — es wird nichts gerechnet —
 * als in der Zusage: ein frisch gestarteter Editor setzt Props unverändert.
 * Stünde in `defaultProp()` versehentlich eine Größe von 2, bekäme jede neue
 * Karte doppelt so große Props, ohne dass jemand etwas eingestellt hätte, und
 * auffallen würde es erst beim Vergleich mit einer alten Karte.
 */

import { describe, expect, it } from 'vitest';
import { defaultProp } from '@/model/toolSettings';
import { createProp } from '@/tools/factory';
import { createDocument } from '@/model/document';

describe('Prop-Vorgaben', () => {
  it('sind ab Werk neutral', () => {
    const p = defaultProp();
    expect(p.scale).toBe(1);
    expect(p.tint).toBeNull();
    expect(p.opacity).toBe(1);
    expect(p.flipX).toBe(false);
    expect(p.flipY).toBe(false);
    // Die Zufallsdrehung war schon vorher aus und soll es bleiben.
    expect(p.randomRotation).toBe(false);
  });

  /**
   * Ein neutral vorbelegtes Prop muss Feld für Feld dasselbe ergeben wie eines
   * ganz ohne Vorgaben — sonst hätte das neue Panel den alten Weg verändert,
   * ohne dass jemand daran gedreht hat.
   */
  it('ändern ein Prop nicht, solange sie neutral sind', () => {
    const doc = createDocument(10, 10);
    const layer = doc.rootLayers[0];
    const s = defaultProp();

    const ohne = createProp(doc, layer, 'stone_small', 100, 200, { seed: 7 });
    const mit = createProp(doc, layer, 'stone_small', 100, 200, {
      seed: 7,
      scaleX: s.scale,
      scaleY: s.scale,
      tint: s.tint,
      opacity: s.opacity,
      flipX: s.flipX,
      flipY: s.flipY,
    });

    // Die Kennung wird gewürfelt und darf sich unterscheiden.
    expect({ ...mit, id: '' }).toEqual({ ...ohne, id: '' });
  });

  it('reichen Größe, Farbe, Deckkraft und Spiegelung durch', () => {
    const doc = createDocument(10, 10);
    const layer = doc.rootLayers[0];
    const obj = createProp(doc, layer, 'stone_small', 0, 0, {
      scaleX: 2.5,
      scaleY: 2.5,
      tint: 0xff4488,
      opacity: 0.6,
      flipX: true,
      flipY: false,
    });

    expect(obj.scaleX).toBe(2.5);
    expect(obj.scaleY).toBe(2.5);
    expect(obj.tint).toBe(0xff4488);
    expect(obj.opacity).toBe(0.6);
    expect(obj.flipX).toBe(true);
    expect(obj.flipY).toBe(false);
  });
});
