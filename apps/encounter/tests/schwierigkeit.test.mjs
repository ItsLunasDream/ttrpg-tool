/**
 * Das Verhaeltnis zwischen Begegnung und Gruppe.
 *
 * Die wichtigste Pruefung hier ist die, die nichts rechnet: dass ein
 * fehlender Grad sichtbar bleibt und nicht stillschweigend als Null in
 * die Summe geht.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const S = require('../dist/tests/entry.cjs');

test('ein Bruch ist ein Bruch, keine Eins', () => {
  assert.equal(S.gradAlsZahl('1/4'), 0.25);
  assert.equal(S.gradAlsZahl('1/2'), 0.5);
  assert.equal(S.gradAlsZahl('1 / 8'), 0.125);
});

test('ganze Grade und die Null', () => {
  assert.equal(S.gradAlsZahl('5'), 5);
  assert.equal(S.gradAlsZahl('0'), 0);
  assert.equal(S.gradAlsZahl(' 12 '), 12);
});

test('was sich nicht lesen laesst, ist null und nicht null Grad', () => {
  assert.equal(S.gradAlsZahl(''), null);
  assert.equal(S.gradAlsZahl('?'), null);
  assert.equal(S.gradAlsZahl('1/0'), null);
  assert.equal(S.gradAlsZahl('-3'), null);
});

test('die Anzahl geht in die Summe ein', () => {
  const summe = S.gradsumme([
    { anzahl: 4, grad: '1/4' },
    { anzahl: 1, grad: '5' }
  ]);
  assert.equal(summe.summe, 6);
  assert.equal(summe.ohneGrad, 0);
});

test('ein Gegner ohne Grad faellt nicht unter den Tisch, sondern wird gezaehlt', () => {
  const summe = S.gradsumme([
    { anzahl: 2, grad: '3' },
    { anzahl: 1, grad: '' }
  ]);
  assert.equal(summe.summe, 6);
  assert.equal(summe.ohneGrad, 1);
});

test('eine Anzahl unter eins zaehlt als eines', () => {
  assert.equal(S.gradsumme([{ anzahl: 0, grad: '2' }]).summe, 2);
});

test('die Gruppenstaerke nennt Spanne, nicht Durchschnitt', () => {
  const staerke = S.gruppenstaerke([
    { anzahl: 3, stufe: 4 },
    { anzahl: 1, stufe: 6 }
  ]);
  assert.equal(staerke.figuren, 4);
  assert.equal(staerke.kleinsteStufe, 4);
  assert.equal(staerke.groessteStufe, 6);
});

test('ohne eingetragene Gruppe gibt es keine Staerke', () => {
  assert.equal(S.gruppenstaerke([]), null);
  assert.equal(S.gruppenstaerke([{ anzahl: 0, stufe: 5 }]), null);
});

test('die Schreibweise der Gruppe wird gelesen', () => {
  assert.deepEqual(S.leseGruppe('4x5'), [{ anzahl: 4, stufe: 5 }]);
  assert.deepEqual(S.leseGruppe('3 x 4, 1×6'), [
    { anzahl: 3, stufe: 4 },
    { anzahl: 1, stufe: 6 }
  ]);
});

test('eine nackte Zahl wird NICHT geraten', () => {
  assert.deepEqual(S.leseGruppe('4'), []);
  assert.deepEqual(S.leseGruppe('vier Figuren'), []);
});

test('Lesen und Schreiben sind zueinander passend', () => {
  const zeile = '3x4, 1x6';
  assert.equal(S.schreibeGruppe(S.leseGruppe(zeile)), zeile);
});
