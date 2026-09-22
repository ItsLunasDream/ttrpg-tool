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

test('der Bestand ist das ganze Glossar und alle magischen Gegenstaende', () => {
  assert.equal(N.alleRegeln().filter((r) => r.art !== 'gegenstand').length, 155);
  assert.equal(N.alleRegeln().filter((r) => r.art === 'gegenstand').length, 258);
});

test('ein Gegenstand traegt seine Kopfzeile und Tabellen in beiden Sprachen', () => {
  const krabbe = N.regelNach('gegenstand/apparatus-of-the-crab');
  assert.equal(krabbe.name.de, 'Apparat der Krabbe');
  assert.match(krabbe.unterzeile.en, /^Wondrous Item, Legendary/);
  const tabelle = krabbe.bloecke.find((b) => b.typ === 'tabelle');
  assert.deepEqual(tabelle.kopf.de, ['Hebel', 'Oben', 'Unten']);
  assert.equal(tabelle.reihen.en.length, 10);
  // Gefunden wird er auch ueber seinen Text.
  assert.match(krabbe.text.de, /Greifschere/);
});

test('jede Kennung ist eindeutig und traegt ihre Art', () => {
  const ids = N.alleRegeln().map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(N.alleRegeln().every((r) => r.id.startsWith(`${r.art}/`)));
  assert.ok(N.alleRegeln().some((r) => r.art === 'aktion'));
});

test('Verweise zeigen auf Eintraege, die es gibt', () => {
  for (const r of N.alleRegeln()) {
    for (const v of r.verweise) assert.ok(N.regelNach(v), `${r.id} -> ${v}`);
  }
  assert.ok(N.regelNach('regel/hit-point-dice').verweise.includes('regel/short-rest'));
});

test('Listenpunkte fuehren zu ihrem Eintrag, auch wo der Name abweicht', () => {
  assert.equal(N.regelMitNamen('Blind', 'de').id, 'zustand/blinded');
  assert.equal(N.regelMitNamen('Magie wirken', 'de').id, 'aktion/magic');
  assert.equal(N.regelMitNamen('Erschöpft', 'de').id, 'zustand/exhaustion');
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
  // „Critical Hit" ist ein eigener Eintrag und steht zuerst; im Text steht
  // es ausserdem in Paralyzed und Unconscious, dort mit Fundstelle.
  const treffer = N.finde(N.alleRegeln(), 'critical hit', 'en');
  const ids = treffer.map((t) => t.regel.id);
  assert.equal(ids[0], 'regel/critical-hit');
  assert.ok(ids.includes('zustand/paralyzed'));
  assert.ok(ids.includes('zustand/unconscious'));
  assert.ok(treffer.slice(1).every((t) => t.stelle && /critical hit/i.test(t.stelle)));
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

test('Verweise im Text: kuratiert, nur das erste Mal, nie auf sich selbst', () => {
  const gesehen = new Set();
  const teile = N.verlinke(
    'You have the Prone condition in Difficult Terrain. Prone again.',
    'en',
    'blinded',
    gesehen
  );
  const ziele = teile.filter((t) => typeof t !== 'string').map((t) => [t.text, t.ziel]);
  assert.deepEqual(ziele, [
    ['Prone', 'prone'],
    ['Difficult Terrain', 'difficult-terrain']
  ]);
  // Der Text bleibt Zeichen fuer Zeichen derselbe.
  assert.equal(teile.map((t) => (typeof t === 'string' ? t : t.text)).join(''),
    'You have the Prone condition in Difficult Terrain. Prone again.');
  // Nie auf den eigenen Eintrag.
  const selbst = N.verlinke('the Prone condition', 'en', 'prone', new Set());
  assert.ok(selbst.every((t) => typeof t === 'string'));
  // Nicht mitten im Wort, und Aktionen nur als Aktion.
  const wort = N.verlinke('Proneness. Help me. Take the Help action.', 'en', 'x', new Set());
  assert.deepEqual(wort.filter((t) => typeof t !== 'string').map((t) => t.text), ['Help action']);
  const de = N.verlinke('Ein Bereich ist schwieriges Gelände; nutze die Spurt‑Aktion.', 'de', 'x', new Set());
  assert.deepEqual(de.filter((t) => typeof t !== 'string').map((t) => t.ziel), ['difficult-terrain', 'dash']);
});
