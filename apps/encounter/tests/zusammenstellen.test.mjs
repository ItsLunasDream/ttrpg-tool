/**
 * Eine Begegnung zu einem Ziel zusammenstellen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/** Ein fester Zufall, damit die Tests nicht vom Glueck abhaengen. */
function zufall(start = 42) {
  let x = start;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

const srd = T.srdKarten('de');

test('Grad als Ziel heisst: so viele EP wie ein Monster dieses Grades', () => {
  assert.equal(T.zielAusGrad('5'), 1800);
  assert.equal(T.naechsterGrad(1800), '5');
  assert.equal(T.naechsterGrad(1750), '5');
});

test('mit vorgegebener Anzahl kommen genau so viele Gegner, nah am Ziel', () => {
  const v = T.stelleZusammen({ zielEp: 1800, anzahl: 4, vorrat: srd, pflicht: [] }, zufall());
  assert.equal(v.gegner.reduce((s, g) => s + g.anzahl, 0), 4);
  assert.ok(T.abweichung(v.ep, 1800) <= 0.05, `${v.ep} EP`);
});

test('ohne Anzahl trifft es das Ziel ebenfalls, aus hoechstens drei Arten', () => {
  const v = T.stelleZusammen({ zielEp: 5900, anzahl: null, vorrat: srd, pflicht: [] }, zufall(7));
  assert.ok(v.gegner.length >= 1 && v.gegner.length <= 3);
  assert.ok(T.abweichung(v.ep, 5900) <= 0.05, `${v.ep} EP`);
});

test('Pflichtmonster stehen im Ergebnis und zaehlen mit', () => {
  const oger = srd.find((k) => k.id === 'srd:ogre');
  const v = T.stelleZusammen(
    { zielEp: 1800, anzahl: 3, vorrat: srd, pflicht: [{ karte: oger, anzahl: 1 }] },
    zufall(3)
  );
  assert.ok(v.gegner.some((g) => g.karte.id === 'srd:ogre'));
  assert.equal(v.gegner.reduce((s, g) => s + g.anzahl, 0), 3);
});

test('nur aus dem Vorrat, den man zulaesst', () => {
  const eigen = T.eigeneKarten([
    { id: 'wicht', name: 'Wicht', cr: '1', tp: 20, rk: 12, ge: 12, themaId: '', rolleId: '' }
  ]);
  const v = T.stelleZusammen({ zielEp: 800, anzahl: null, vorrat: eigen, pflicht: [] }, zufall());
  assert.deepEqual(v.gegner.map((g) => [g.karte.id, g.anzahl]), [['wicht', 4]]);
});

test('ohne passende Monster gibt es keinen Vorschlag, statt eines falschen', () => {
  assert.equal(T.stelleZusammen({ zielEp: 10, anzahl: null, vorrat: [], pflicht: [] }), null);
});

test('zwei Klicks, zwei Vorschlaege: unter gleich guten wird gelost', () => {
  const a = T.stelleZusammen({ zielEp: 2300, anzahl: null, vorrat: srd, pflicht: [] }, zufall(1));
  const b = T.stelleZusammen({ zielEp: 2300, anzahl: null, vorrat: srd, pflicht: [] }, zufall(99));
  const kurz = (v) => v.gegner.map((g) => g.karte.id + g.anzahl).join();
  assert.notEqual(kurz(a), kurz(b));
});
