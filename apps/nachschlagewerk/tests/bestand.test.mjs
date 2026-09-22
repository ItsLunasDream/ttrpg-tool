/**
 * Der Bestand und die Suche des Nachschlagewerks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const N = require('../dist/tests/entry.cjs');

test('der Bestand traegt alle fuenfzehn Zustaende', () => {
  const zustaende = N.alleRegeln().filter((r) => r.art === 'zustand');
  assert.equal(zustaende.length, 15);
});

test('jede Kennung ist eindeutig und traegt ihre Art', () => {
  const ids = N.alleRegeln().map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => id.startsWith('zustand/')));
});

test('ein Eintrag laesst sich ueber seine Kennung holen', () => {
  assert.equal(N.regelNach('zustand/prone').name.de, 'Liegend');
  assert.equal(N.regelNach('zustand/gibtsnicht'), undefined);
});

test('der Einleitungssatz hat keinen Unterpunkt', () => {
  const teile = N.absaetze(N.regelNach('zustand/blinded').text.en);
  assert.equal(teile[0].kopf, null);
  assert.match(teile[0].rest, /^While you have the Blinded condition/);
});

test('die Unterpunkte werden in beiden Sprachen erkannt', () => {
  const en = N.absaetze(N.regelNach('zustand/blinded').text.en);
  const de = N.absaetze(N.regelNach('zustand/blinded').text.de);
  assert.equal(en[1].kopf, 'Can’t See.');
  assert.equal(de[1].kopf, 'Nicht sehfähig:');
  assert.equal(en.length, de.length);
});

test('der Name findet, und zwar zuerst', () => {
  const treffer = N.finde(N.alleRegeln(), 'prone', 'en');
  assert.equal(treffer[0].regel.id, 'zustand/prone');
});

test('gesucht wird in beiden Sprachen, gezeigt in einer', () => {
  // Wer auf Deutsch steht und den englischen Begriff tippt, findet ihn.
  const treffer = N.finde(N.alleRegeln(), 'prone', 'de');
  assert.equal(treffer[0].regel.id, 'zustand/prone');
  assert.equal(treffer[0].regel.name.de, 'Liegend');
});

test('Umlaute werden nicht zum Hindernis', () => {
  assert.equal(N.finde(N.alleRegeln(), 'gelahmt', 'de')[0].regel.id, 'zustand/paralyzed');
  assert.equal(N.finde(N.alleRegeln(), 'gelähmt', 'de')[0].regel.id, 'zustand/paralyzed');
});

test('gesucht wird auch im Text, und die Fundstelle steht dabei', () => {
  // „Critical Hit" steht in keinem Namen, aber in Paralyzed und Unconscious.
  const treffer = N.finde(N.alleRegeln(), 'critical hit', 'en');
  const ids = treffer.map((t) => t.regel.id);
  assert.ok(ids.includes('zustand/paralyzed'));
  assert.ok(ids.includes('zustand/unconscious'));
  assert.ok(treffer.every((t) => t.stelle && /critical hit/i.test(t.stelle)));
});

test('der gerade Apostroph findet den typografischen', () => {
  const treffer = N.finde(N.alleRegeln(), "can't see", 'en');
  assert.ok(treffer.some((t) => t.regel.id === 'zustand/blinded'));
});

test('alle Worte muessen vorkommen', () => {
  assert.equal(N.finde(N.alleRegeln(), 'prone drache', 'en').length, 0);
});

test('eine leere Suche zeigt alles', () => {
  assert.equal(N.finde(N.alleRegeln(), '   ', 'de').length, N.alleRegeln().length);
});
