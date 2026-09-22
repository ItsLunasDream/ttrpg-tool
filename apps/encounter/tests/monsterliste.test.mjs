import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

const DATEI = [
  '---',
  'id: bounty-hounter',
  'name: Bounty Hounter',
  'cr: "5"',
  'thema: untot',
  'rolle: jaeger',
  'tp: 90',
  'rk: 15',
  'geaendert: 2026-09-22T09:00:00.000Z',
  '---',
  '',
  '# Bounty Hounter',
  ''
].join('\n');

test('ein Monster wird aus dem Kopf gelesen', () => {
  const karte = T.alsMonsterkarte(DATEI, 'ersatz');
  assert.equal(karte.id, 'bounty-hounter');
  assert.equal(karte.name, 'Bounty Hounter');
  assert.equal(karte.cr, '5');
  assert.equal(karte.tp, 90);
  assert.equal(karte.rk, 15);
});

test('ein Bruchgrad bleibt Text', () => {
  // „1/4" ist ein gueltiger Herausforderungsgrad und keine Zahl.
  const karte = T.alsMonsterkarte(DATEI.replace('cr: "5"', 'cr: "1/4"'), 'x');
  assert.equal(karte.cr, '1/4');
});

test('fehlende Zahlen werden null, nicht NaN', () => {
  const karte = T.alsMonsterkarte('---\nid: x\nname: X\n---\n', 'x');
  assert.equal(karte.tp, 0);
  assert.equal(karte.rk, 0);
});

test('eine Datei ohne Kopf faellt auf den Dateinamen zurueck', () => {
  const karte = T.alsMonsterkarte('nur Text', 'wolf');
  assert.equal(karte.id, 'wolf');
  assert.equal(karte.name, 'wolf');
});

test('die Suche findet ueber Name, Thema, Rolle und Grad', () => {
  const liste = [T.alsMonsterkarte(DATEI, 'x')];
  assert.equal(T.findeMonster(liste, 'bounty').length, 1);
  assert.equal(T.findeMonster(liste, 'untot').length, 1);
  assert.equal(T.findeMonster(liste, 'cr 5').length, 1);
  assert.equal(T.findeMonster(liste, 'drache').length, 0);
});

test('alle Worte muessen vorkommen', () => {
  const liste = [T.alsMonsterkarte(DATEI, 'x')];
  assert.equal(T.findeMonster(liste, 'bounty untot').length, 1);
  assert.equal(T.findeMonster(liste, 'bounty drache').length, 0);
});

test('Umlaute stoeren nicht', () => {
  const jaeger = T.alsMonsterkarte(DATEI.replace('name: Bounty Hounter', 'name: Jäger'), 'x');
  assert.equal(T.findeMonster([jaeger], 'jager').length, 1);
});

test('die Liste kommt alphabetisch', () => {
  const a = T.alsMonsterkarte(DATEI.replace('name: Bounty Hounter', 'name: Zebra'), 'a');
  const b = T.alsMonsterkarte(DATEI.replace('name: Bounty Hounter', 'name: Adler'), 'b');
  assert.deepEqual(T.findeMonster([a, b], '').map((m) => m.name), ['Adler', 'Zebra']);
});
