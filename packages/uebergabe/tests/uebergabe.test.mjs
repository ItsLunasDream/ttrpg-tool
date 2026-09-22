/**
 * Die gemeinsame Form fuer den Weg in den Tracker.
 *
 * Viel ist hier nicht zu pruefen — das Paket ist absichtlich duenn. Was
 * geprueft wird, sind die zwei Rechnungen, die sonst in zwei Werkzeugen
 * staenden und dort auseinanderlaufen koennten.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const U = require('../dist/tests/entry.cjs');

test('ein einzelnes Wesen bekommt keine Marke', () => {
  assert.deepEqual(U.marken(1), ['']);
  assert.deepEqual(U.marken(0), ['']);
  assert.deepEqual(U.marken(-3), ['']);
});

test('eine Gruppe wird durchnummeriert', () => {
  assert.deepEqual(U.marken(4), ['1', '2', '3', '4']);
});

test('Bruchzahlen werden abgerundet, nicht gerundet', () => {
  assert.deepEqual(U.marken(2.9), ['1', '2']);
});

test('der Modifikator folgt der ueblichen Rechnung', () => {
  assert.equal(U.modifikator(10), 0);
  assert.equal(U.modifikator(11), 0);
  assert.equal(U.modifikator(12), 1);
  assert.equal(U.modifikator(18), 4);
  assert.equal(U.modifikator(8), -1);
  assert.equal(U.modifikator(1), -5);
});

test('die Gesamtzahl zaehlt die Anzahl, nicht die Zeilen', () => {
  const uebergabe = {
    name: 'Hinterhalt',
    quelle: 'hinterhalt',
    gegner: [
      { name: 'Wolf', anzahl: 4, tp: 11, rk: 13, iniMod: 2 },
      { name: 'Anfuehrer', anzahl: 1, tp: 30, rk: 15, iniMod: 1 }
    ],
    umgebung: null
  };
  assert.equal(U.gesamtzahl(uebergabe), 5);
});

test('eine Anzahl unter eins zaehlt trotzdem als eines', () => {
  assert.equal(
    U.gesamtzahl({ name: '', quelle: '', gegner: [{ name: 'X', anzahl: 0, tp: 1, rk: 1, iniMod: 0 }], umgebung: null }),
    1
  );
});
