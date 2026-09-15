/**
 * Die Form eines Notiz-Pins und was sich davon anklicken laesst.
 *
 * Der Fehler dahinter: `pickNote` mass den Abstand zu `x`/`y`, und das ist
 * die SPITZE des Pins. Der Kopf — der sichtbare Teil mit dem Symbol — liegt
 * bei der Vorgabegroesse rund vierzig Einheiten darueber, die Toleranz war
 * sechzehn. Damit war keine Notiz mehr zu oeffnen, und das Notiz-Werkzeug
 * legte bei jedem Versuch eine neue an.
 */
import { describe, it, expect } from 'vitest';
import { createDocument } from '@/model/document';
import { abstandZurNotiz, notenForm } from '@/model/noteShape';
import { pickNote } from '@/tools/vttPick';
import type { MapDocument, MapNote } from '@/model/types';

function mitNotiz(teil: Partial<MapNote> = {}): MapDocument {
  const doc = createDocument();
  doc.vtt.notes.push({
    id: 'note1',
    x: 320,
    y: 320,
    title: 'Hafen',
    text: 'Etwas Text',
    icon: 'marker',
    size: 1,
    color: 0xffcc88,
    playerVisible: false,
    ...teil,
  });
  return doc;
}

describe('notenForm', () => {
  it('der Kopf steht ueber der Spitze', () => {
    const doc = mitNotiz();
    const form = notenForm(doc.vtt.notes[0], doc.grid.tileSize);
    expect(form.spitzeY).toBe(320);
    expect(form.kopfY).toBeLessThan(form.spitzeY - form.r);
    expect(form.kopfX).toBe(320);
  });

  it('eine groessere Notiz hat einen groesseren Kopf', () => {
    const klein = mitNotiz({ size: 1 });
    const gross = mitNotiz({ size: 3 });
    const a = notenForm(klein.vtt.notes[0], klein.grid.tileSize);
    const b = notenForm(gross.vtt.notes[0], gross.grid.tileSize);
    expect(b.r).toBeGreaterThan(a.r);
  });
});

describe('abstandZurNotiz', () => {
  it('in der Kopfmitte ist der Abstand null', () => {
    const doc = mitNotiz();
    const form = notenForm(doc.vtt.notes[0], doc.grid.tileSize);
    expect(abstandZurNotiz(form, form.kopfX, form.kopfY)).toBe(0);
  });

  it('an der Spitze ebenfalls', () => {
    const doc = mitNotiz();
    const form = notenForm(doc.vtt.notes[0], doc.grid.tileSize);
    expect(abstandZurNotiz(form, form.spitzeX, form.spitzeY)).toBe(0);
  });

  it('daneben waechst er mit der Entfernung', () => {
    const doc = mitNotiz();
    const form = notenForm(doc.vtt.notes[0], doc.grid.tileSize);
    const nah = abstandZurNotiz(form, form.kopfX + form.r + 5, form.kopfY);
    const fern = abstandZurNotiz(form, form.kopfX + form.r + 50, form.kopfY);
    expect(nah).toBeCloseTo(5, 5);
    expect(fern).toBeGreaterThan(nah);
  });
});

describe('pickNote', () => {
  /*
   * Der eigentliche Fehler. Ein Klick mitten auf das Symbol des Pins — die
   * Stelle, die jeder trifft — fand vorher nichts.
   */
  it('ein Klick auf den Kopf trifft die Notiz', () => {
    const doc = mitNotiz();
    const form = notenForm(doc.vtt.notes[0], doc.grid.tileSize);
    expect(pickNote(doc, { x: form.kopfX, y: form.kopfY }, 16)?.id).toBe('note1');
  });

  it('ein Klick auf die Spitze auch', () => {
    const doc = mitNotiz();
    expect(pickNote(doc, { x: 320, y: 320 }, 16)?.id).toBe('note1');
  });

  it('und einer auf den Stiel dazwischen', () => {
    const doc = mitNotiz();
    const form = notenForm(doc.vtt.notes[0], doc.grid.tileSize);
    const mitte = (form.kopfY + form.spitzeY) / 2;
    expect(pickNote(doc, { x: 320, y: mitte }, 16)?.id).toBe('note1');
  });

  it('weit daneben trifft nichts', () => {
    const doc = mitNotiz();
    expect(pickNote(doc, { x: 320 + 400, y: 320 }, 16)).toBeNull();
    // Unterhalb der Spitze liegt kein Pin mehr.
    expect(pickNote(doc, { x: 320, y: 320 + 200 }, 16)).toBeNull();
  });

  it('bei zwei Notizen gewinnt die naehere', () => {
    const doc = mitNotiz();
    doc.vtt.notes.push({ ...doc.vtt.notes[0], id: 'note2', x: 320 + 90 });
    const form = notenForm(doc.vtt.notes[1], doc.grid.tileSize);
    expect(pickNote(doc, { x: form.kopfX, y: form.kopfY }, 16)?.id).toBe('note2');
  });
});
