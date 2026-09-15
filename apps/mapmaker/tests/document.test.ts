/**
 * Abfragen am Dokument.
 */
import { describe, it, expect } from 'vitest';
import { createDocument, hatInhalt } from '@/model/document';

describe('hatInhalt', () => {
  /*
   * Die Rueckfrage vor „Neu" haengt daran. Frueher fragte sie nur bei
   * Objekten: wer eine Notiz gesetzt oder eine Wand gezogen hatte, verlor sie
   * wortlos — auch wenn die Karte von aussen angestossen wurde, aus der
   * Inspirationshilfe.
   */
  it('eine frische Karte gilt als leer', () => {
    expect(hatInhalt(createDocument())).toBe(false);
  });

  it('eine Notiz allein zaehlt schon', () => {
    const doc = createDocument();
    doc.vtt.notes.push({
      id: 'n1',
      x: 10,
      y: 10,
      title: 'Eingang',
      text: 'Verschüttet.',
      icon: 'marker',
      size: 1,
      color: 0xffffff,
      playerVisible: false,
    });
    expect(hatInhalt(doc)).toBe(true);
  });

  it('eine Wand, ein Licht, eine Hilfslinie ebenso', () => {
    const mitWand = createDocument();
    mitWand.vtt.walls.push({ id: 'w1', a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, kind: 'wall' } as never);
    expect(hatInhalt(mitWand)).toBe(true);

    const mitLicht = createDocument();
    mitLicht.vtt.lights.push({ id: 'l1', x: 0, y: 0 } as never);
    expect(hatInhalt(mitLicht)).toBe(true);

    const mitLinie = createDocument();
    mitLinie.guides = [{ id: 'g1', axis: 'x', pos: 100 }];
    expect(hatInhalt(mitLinie)).toBe(true);
  });

  it('ein Name allein ist kein Inhalt', () => {
    // Eine frisch benannte, sonst leere Karte ist nichts, wofuer man
    // nachfragen muesste.
    const doc = createDocument();
    doc.meta.name = 'Rabenstein';
    expect(hatInhalt(doc)).toBe(false);
  });
});
