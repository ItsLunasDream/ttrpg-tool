/**
 * Begegnungen wiederfinden.
 *
 * Aus der Planung: gesucht wird „nach Namen (Vom Combat und Participants)".
 * Beides gehoert geprueft, und besonders der zweite Teil — den vergisst man
 * sonst und merkt es erst am Tisch.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function begegnung(name, ...namen) {
  return {
    schemaVersion: 1,
    id: name.toLowerCase(),
    name,
    taktik: '',
    teilnehmer: namen.map((n) => T.neuerTeilnehmer(n))
  };
}

const sammlung = [
  begegnung('Waldlager', 'Ghul', 'Bär'),
  begegnung('Hafenkneipe', 'Schmuggler', 'Wirtin'),
  begegnung('Gruft', 'Ghul', 'Skelett')
];

test('ohne Suchwort kommt alles', () => {
  assert.equal(T.finde(sammlung, '').length, 3);
  assert.equal(T.finde(sammlung, '   ').length, 3);
});

test('der Name der Begegnung wird gefunden', () => {
  assert.deepEqual(T.finde(sammlung, 'hafen').map((b) => b.name), ['Hafenkneipe']);
});

test('der Name eines Teilnehmers wird auch gefunden', () => {
  // Der eigentliche Punkt: wer die Begegnung sucht, weiss oft nur noch, wer
  // darin vorkam.
  assert.deepEqual(T.finde(sammlung, 'ghul').map((b) => b.name), ['Gruft', 'Waldlager']);
});

test('Gross- und Kleinschreibung und Umlaute sind egal', () => {
  assert.equal(T.finde(sammlung, 'BÄR').length, 1);
  assert.equal(T.finde(sammlung, 'bar').length, 1);
});

test('mehrere Worte grenzen ein, statt die Liste zu verlaengern', () => {
  // „ghul gruft" darf nicht beide Ghul-Begegnungen liefern.
  assert.deepEqual(T.finde(sammlung, 'ghul gruft').map((b) => b.name), ['Gruft']);
  assert.equal(T.finde(sammlung, 'ghul wirtin').length, 0);
});

test('ein Wort darf ueber Begegnung und Teilnehmer verteilt passen', () => {
  assert.deepEqual(T.finde(sammlung, 'wald ghul').map((b) => b.name), ['Waldlager']);
});

test('sortiert wird nach Namen oder nach Groesse', () => {
  const gross = begegnung('Schlacht', 'a', 'b', 'c', 'd');
  const alle = [...sammlung, gross];
  assert.equal(T.finde(alle, '', 'groesse')[0].name, 'Schlacht');
  assert.deepEqual(
    T.finde(alle, '', 'name').map((b) => b.name),
    ['Gruft', 'Hafenkneipe', 'Schlacht', 'Waldlager']
  );
});

test('die Kachel kann sagen, welcher Teilnehmer gepasst hat', () => {
  assert.deepEqual(T.treffendeTeilnehmer(sammlung[0], 'ghul'), ['Ghul']);
  assert.deepEqual(T.treffendeTeilnehmer(sammlung[0], 'wald'), []);
});
