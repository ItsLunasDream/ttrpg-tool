/**
 * Notizen am Text: verankert am Text und seinem Vorkommen, nicht an Zeichen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const N = require('../dist/tests/entry.cjs');

const block = 'Attacks Affected. Attack rolls against you have Advantage, and your attack rolls have Disadvantage.';
const notiz = (stelle, vorkommen) => ({
  id: 'n1', regel: 'zustand/blinded', sprache: 'en', block: 2, stelle, vorkommen, text: 'Bei uns anders', geaendert: ''
});

test('das wievielte Vorkommen wird richtig gezaehlt', () => {
  const zweites = block.lastIndexOf('attack rolls');
  assert.equal(N.vorkommenBei(block, 'attack rolls', zweites), 0);
  assert.equal(N.vorkommenBei(block.toLowerCase(), 'attack rolls', zweites), 1);
  assert.equal(N.nteStelle(block, 'have', 1), block.lastIndexOf('have'));
  assert.equal(N.nteStelle(block, 'gibtsnicht', 0), -1);
});

test('die Stelle wird im gezeigten Teil markiert, hinter dem fetten Kopf', () => {
  const rest = block.slice('Attacks Affected. '.length);
  const teile = N.markiere(rest, block, block.length - rest.length, [notiz('Disadvantage', 0)]);
  const marke = teile.find((t) => typeof t !== 'string');
  assert.equal(marke.text, 'Disadvantage');
  assert.equal(teile.map((t) => (typeof t === 'string' ? t : t.text)).join(''), rest);
});

test('verschwindet der Text, bleibt die Notiz — nur ohne Stelle', () => {
  assert.equal(N.findetStelle(notiz('Disadvantage', 0), block), true);
  assert.equal(N.findetStelle(notiz('Disadvantage', 0), block.replace('Disadvantage', 'Nachteil')), false);
  const teile = N.markiere(block, block, 0, [notiz('gibtsnicht', 0)]);
  assert.deepEqual(teile, [block]);
});

test('eine kaputte Datei wirft nicht, sie liefert nichts', () => {
  assert.deepEqual(N.leseNotizen('kein json'), []);
  assert.deepEqual(N.leseNotizen('[{"id":1}]'), []);
  assert.equal(N.leseNotizen(JSON.stringify([notiz('have', 0)])).length, 1);
});
