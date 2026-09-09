import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { LANGUAGES, DEFAULT_LANGUAGE, isLanguage, fillPlaceholders, createTranslator } =
  require('../dist/tests/entry.cjs');

test('Englisch ist die Voreinstellung', () => {
  // Die Programme werden veroeffentlicht. Wer sie findet, liest ueberwiegend
  // kein Deutsch.
  assert.equal(DEFAULT_LANGUAGE, 'en');
});

test('die Voreinstellung steht in der Sprachliste an erster Stelle', () => {
  assert.equal(LANGUAGES[0].id, DEFAULT_LANGUAGE);
});

test('jede Sprache in der Liste ist auch eine bekannte Sprache', () => {
  for (const sprache of LANGUAGES) {
    assert.ok(isLanguage(sprache.id), `${sprache.id} fehlt in isLanguage`);
    assert.ok(sprache.label.length > 0);
  }
});

test('isLanguage erkennt nur bekannte Sprachen', () => {
  assert.ok(isLanguage('en'));
  assert.ok(isLanguage('de'));
  assert.ok(!isLanguage('fr'));
  assert.ok(!isLanguage(undefined));
  assert.ok(!isLanguage(''));
});

test('Platzhalter werden ersetzt', () => {
  assert.equal(fillPlaceholders('{count} words', { count: 3 }), '3 words');
  assert.equal(fillPlaceholders('{a} und {b}', { a: 'x', b: 'y' }), 'x und y');
});

test('ein Platzhalter ohne Wert bleibt stehen', () => {
  // Sichtbar falsch ist besser als unsichtbar falsch: „ words" faellt
  // niemandem auf, „{count} words" sofort.
  assert.equal(fillPlaceholders('{count} words', {}), '{count} words');
  assert.equal(fillPlaceholders('{count} words'), '{count} words');
});

test('Text ohne Platzhalter bleibt unveraendert', () => {
  assert.equal(fillPlaceholders('Settings', { count: 3 }), 'Settings');
});

test('der Uebersetzer findet Texte in der gewaehlten Sprache', () => {
  const t = createTranslator({ en: { greet: 'Hello' }, de: { greet: 'Hallo' } });
  assert.equal(t('en', 'greet'), 'Hello');
  assert.equal(t('de', 'greet'), 'Hallo');
});

test('ein fehlender Text faellt auf die Leitsprache zurueck', () => {
  const t = createTranslator({ en: { greet: 'Hello' }, de: {} });
  assert.equal(t('de', 'greet'), 'Hello');
});

test('ein ueberall fehlender Text zeigt den Schluessel', () => {
  const t = createTranslator({ en: {}, de: {} });
  assert.equal(t('de', 'greet'), 'greet', 'eine leere Stelle in der Oberflaeche waere schlimmer');
});

test('der Uebersetzer ersetzt Platzhalter', () => {
  const t = createTranslator({ en: { words: '{count} words' }, de: { words: '{count} Wörter' } });
  assert.equal(t('de', 'words', { count: 7 }), '7 Wörter');
});

test('die Leitsprache laesst sich wechseln', () => {
  const t = createTranslator({ en: {}, de: { greet: 'Hallo' } }, 'de');
  assert.equal(t('en', 'greet'), 'Hallo');
});
