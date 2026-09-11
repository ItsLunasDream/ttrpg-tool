import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  APPS,
  DEFAULT_LANGUAGE,
  LANGUAGES,
  MESSAGE_KEYS,
  STATUS_KEY,
  descriptionKey,
  nameKey,
  translate
} = require('../dist/tests/entry.cjs');

test('die Huelle startet auf Englisch', () => {
  assert.equal(DEFAULT_LANGUAGE, 'en');
});

test('jeder englische Schluessel hat eine deutsche Entsprechung', () => {
  // Fehlt ein Schluessel im Deutschen, faellt translate auf Englisch zurueck
  // und der Text sieht uebersetzt aus, ohne es zu sein. Genau das soll hier
  // auffallen — auch jetzt schon, wo die Huelle noch gar nicht umschalten
  // kann.
  const fehlend = [];
  for (const key of MESSAGE_KEYS) {
    if (translate('en', key) === translate('de', key) && !GLEICH_ERLAUBT.has(key)) {
      fehlend.push(key);
    }
  }
  assert.deepEqual(fehlend, [], `ohne deutsche Fassung: ${fehlend.join(', ')}`);
});

// Wenige Texte sind in beiden Sprachen gleich, das ist kein Fehler.
const GLEICH_ERLAUBT = new Set([
  // Eigennamen der Werkzeuge, die in beiden Sprachen gleich heissen.
  'app.backstory.name',
  'app.initiative.name',
  'app.npc.name'
]);

test('jede App hat Namen und Beschreibung in beiden Sprachen', () => {
  for (const app of APPS) {
    for (const sprache of LANGUAGES) {
      const name = translate(sprache.id, nameKey(app.id));
      const beschreibung = translate(sprache.id, descriptionKey(app.id));
      assert.notEqual(name, nameKey(app.id), `${app.id}: kein Name in ${sprache.id}`);
      assert.notEqual(
        beschreibung,
        descriptionKey(app.id),
        `${app.id}: keine Beschreibung in ${sprache.id}`
      );
    }
  }
});

test('jeder Zustand hat eine Marke in beiden Sprachen', () => {
  for (const status of Object.keys(STATUS_KEY)) {
    for (const sprache of LANGUAGES) {
      const marke = translate(sprache.id, STATUS_KEY[status]);
      assert.notEqual(marke, STATUS_KEY[status], `${status} ohne Text in ${sprache.id}`);
    }
  }
});

test('die Fassung wird in den Text eingesetzt', () => {
  assert.match(translate('en', 'menu.version', { version: '0.1.0' }), /0\.1\.0/);
  assert.match(translate('de', 'menu.version', { version: '0.1.0' }), /0\.1\.0/);
});
