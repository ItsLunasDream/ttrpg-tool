/**
 * Rueckgaengig im Tracker.
 *
 * Aus dem Gebrauch: „Wenn man ein Participant löscht soll hier ZURÜCK bzw.
 * STRG+Z das auch rückgängig machen." Geprueft wird am Modell, weil die
 * Frage dort entschieden wird — die Oberflaeche reicht nur durch.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

test('ohne Vorgeschichte geht weder zurueck noch vor', () => {
  const v = T.leererVerlauf();
  assert.equal(T.kannZurueck(v), false);
  assert.equal(T.kannVor(v), false);
  assert.equal(T.zurueck(v, 'a'), null);
  assert.equal(T.vor(v, 'a'), null);
});

test('ein Schritt zurueck holt den Stand davor', () => {
  const v = T.merke(T.leererVerlauf(), 'mit Wolf');
  assert.equal(T.kannZurueck(v), true);
  const schritt = T.zurueck(v, 'ohne Wolf');
  assert.equal(schritt.stand, 'mit Wolf');
  assert.equal(T.kannVor(schritt.verlauf), true);
});

test('zurueck und wieder vor ergibt denselben Stand', () => {
  const v = T.merke(T.leererVerlauf(), 'A');
  const zurueck = T.zurueck(v, 'B');
  const vor = T.vor(zurueck.verlauf, zurueck.stand);
  assert.equal(vor.stand, 'B');
  assert.equal(T.kannVor(vor.verlauf), false);
});

test('zwanzig Schritte hin und zurueck landen wieder am Anfang', () => {
  let verlauf = T.leererVerlauf();
  let stand = 0;
  for (let i = 1; i <= 20; i++) {
    verlauf = T.merke(verlauf, stand);
    stand = i;
  }
  for (let i = 0; i < 20; i++) {
    const schritt = T.zurueck(verlauf, stand);
    verlauf = schritt.verlauf;
    stand = schritt.stand;
  }
  assert.equal(stand, 0);
  assert.equal(T.kannZurueck(verlauf), false);

  for (let i = 0; i < 20; i++) {
    const schritt = T.vor(verlauf, stand);
    verlauf = schritt.verlauf;
    stand = schritt.stand;
  }
  assert.equal(stand, 20);
  assert.equal(T.kannVor(verlauf), false);
});

test('wer nach einem Zurueck etwas Neues tut, verlaesst den anderen Zweig', () => {
  // Sonst spraenge „vor" in einen Stand, der mit dem jetzigen nichts zu tun
  // hat.
  let verlauf = T.merke(T.leererVerlauf(), 'A');
  const schritt = T.zurueck(verlauf, 'B');
  assert.equal(T.kannVor(schritt.verlauf), true);
  verlauf = T.merke(schritt.verlauf, schritt.stand);
  assert.equal(T.kannVor(verlauf), false);
});

test('der Verlauf waechst nicht ueber seine Tiefe hinaus', () => {
  let verlauf = T.leererVerlauf();
  for (let i = 0; i < T.VERLAUF_TIEFE + 25; i++) verlauf = T.merke(verlauf, i);
  assert.equal(verlauf.vergangenheit.length, T.VERLAUF_TIEFE);
  // Die aeltesten fallen heraus, die juengsten bleiben.
  assert.equal(verlauf.vergangenheit[verlauf.vergangenheit.length - 1], T.VERLAUF_TIEFE + 24);
});

test('ein geloeschter Teilnehmer kommt vollstaendig zurueck', () => {
  // Der eigentliche Fall, mit echten Kampfdaten statt Buchstaben.
  const wolf = { ...T.neuerTeilnehmer('Wolf'), tp: 11, maxTp: 11 };
  const baer = T.neuerTeilnehmer('Bär');
  const mit = { ...T.leererKampf(), teilnehmer: [wolf, baer] };
  const ohne = T.entferneTeilnehmer(mit, wolf.id);
  assert.equal(ohne.teilnehmer.length, 1);

  const verlauf = T.merke(T.leererVerlauf(), mit);
  const schritt = T.zurueck(verlauf, ohne);
  assert.deepEqual(schritt.stand.teilnehmer.map((t) => t.name), ['Wolf', 'Bär']);
  assert.equal(schritt.stand.teilnehmer[0].tp, 11);
});
