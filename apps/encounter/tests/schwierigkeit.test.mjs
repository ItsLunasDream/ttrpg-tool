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

test('die Punktsumme rechnet die Anzahl ein', () => {
  // Vier Monster mit Grad 1/4 sind 4 x 50 = 200 EP.
  const summe = S.punktsumme([{ anzahl: 4, grad: '1/4' }]);
  assert.equal(summe.summe, 200);
  assert.equal(summe.ohnePunkte, 0);
});

test('ein Grad ausserhalb der Tabelle faellt auf, statt als Null zu zaehlen', () => {
  const summe = S.punktsumme([
    { anzahl: 1, grad: '5' },
    { anzahl: 1, grad: '99' }
  ]);
  assert.equal(summe.summe, 1800);
  assert.equal(summe.ohnePunkte, 1);
});

test('die Einordnung kommt aus dem Regelwerk', () => {
  const gruppe = [{ anzahl: 4, stufe: 1 }];
  // Budget: niedrig 200, mittel 300, hoch 400.
  assert.equal(S.ordneEin([{ anzahl: 1, grad: '1/4' }], gruppe), 'darunter'); // 50
  assert.equal(S.ordneEin([{ anzahl: 1, grad: '1' }], gruppe), 'niedrig'); // 200
  assert.equal(S.ordneEin([{ anzahl: 3, grad: '1/2' }], gruppe), 'mittel'); // 300
  assert.equal(S.ordneEin([{ anzahl: 2, grad: '1' }], gruppe), 'hoch'); // 400
});

test('ein erreichtes Budget zaehlt schon dazu, nicht erst ein ueberschrittenes', () => {
  // Genau 400 EP gegen ein hohes Budget von 400 ist „hoch". Das ist eine
  // Entscheidung an der Kante, und sie steht hier fest, damit sie nicht
  // beim naechsten Anfassen umkippt.
  const gruppe = [{ anzahl: 4, stufe: 1 }];
  assert.equal(S.ordneEin([{ anzahl: 2, grad: '1' }], gruppe), 'hoch');
  // Und das Anderthalbfache davon ist die letzte Zahl, die noch „hoch"
  // heisst; darueber sagt das Regelwerk nichts mehr.
  assert.equal(S.ordneEin([{ anzahl: 3, grad: '1' }], gruppe), 'hoch'); // 600
  assert.equal(S.ordneEin([{ anzahl: 1, grad: '3' }], gruppe), 'darueber'); // 700
});

test('lauter unbekannte Grade geben KEINE Einordnung, nicht „unter niedrig"', () => {
  // Der Fall, der sonst gelogen waere: eine Begegnung aus selbstgebauten
  // Monstern ohne Grad saehe aus wie eine harmlose.
  const gruppe = [{ anzahl: 4, stufe: 5 }];
  assert.equal(S.ordneEin([{ anzahl: 3, grad: '' }], gruppe), null);
  assert.equal(S.ordneEin([{ anzahl: 3, grad: '99' }], gruppe), null);
});

test('ein einziger bekannter Grad reicht fuer eine Einordnung', () => {
  const gruppe = [{ anzahl: 4, stufe: 5 }];
  assert.ok(S.ordneEin([{ anzahl: 1, grad: '5' }, { anzahl: 1, grad: '' }], gruppe));
});

test('ohne Gruppe gibt es keine Einordnung', () => {
  assert.equal(S.ordneEin([{ anzahl: 1, grad: '5' }], []), null);
});
