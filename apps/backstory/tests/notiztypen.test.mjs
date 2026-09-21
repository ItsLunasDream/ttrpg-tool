import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { NOTIZTYP_VORLAGEN, vorlageNotiztypen, factoryFieldKey, DEFAULT_NOTE_TYPES, beispieltext } = entry;

test('beide Sprachen haben dieselben Typen und Feldschluessel', () => {
  // Nur die Beschriftungen unterscheiden sich. Sonst faende eine Notiz ihre
  // Werte nicht wieder, wenn die Kampagne in der anderen Sprache angelegt
  // wurde.
  const schluessel = (typen) =>
    typen.map((typ) => [typ.id, typ.fields.map((feld) => feld.key)]);
  assert.deepEqual(schluessel(NOTIZTYP_VORLAGEN.de), schluessel(NOTIZTYP_VORLAGEN.en));
});

test('die Beschriftungen unterscheiden sich tatsaechlich', () => {
  assert.equal(vorlageNotiztypen('de')[0].label, 'Charakter');
  assert.equal(vorlageNotiztypen('en')[0].label, 'Character');
});

test('eine unbekannte Sprache faellt auf die Voreinstellung zurueck', () => {
  assert.deepEqual(vorlageNotiztypen('fr'), vorlageNotiztypen('en'));
});

test('Werksschluessel werden in beiden Sprachen gefunden', () => {
  // Wer ein Werksfeld entfernt und spaeter wieder anlegt, soll seine Werte
  // wiedersehen — egal in welcher Sprache die Kampagne entstanden ist.
  assert.equal(factoryFieldKey('character', 'Klasse'), 'class');
  assert.equal(factoryFieldKey('character', 'Class'), 'class');
  assert.equal(factoryFieldKey('character', 'Größe'), 'height');
  assert.equal(factoryFieldKey('character', 'Height'), 'height');
  assert.equal(factoryFieldKey('character', 'gibt es nicht'), undefined);
});

test('die deutsche Vorlage bleibt der Rueckfallwert fuer alte Kampagnen', () => {
  assert.deepEqual(DEFAULT_NOTE_TYPES, NOTIZTYP_VORLAGEN.de);
});

test('der Beispieltext folgt der Sprache, die eigene Beschriftung nicht', () => {
  /*
   * Aus dem Gebrauch: „Die Vorschlagstext bei Profile ‚z.B. 132' bei Age oder
   * ‚z.B. sie/ihr' bei Pronouns auf Englisch." Die Notiztypen gehoeren der
   * Kampagne und folgen bewusst keinem Sprachwechsel — ein Beispieltext ist
   * aber kein Inhalt, sondern ein Hinweis.
   */
  assert.equal(beispieltext('character', 'age', 'z.B. 132', 'en'), 'e.g. 132');
  assert.equal(beispieltext('character', 'pronouns', 'z.B. sie/ihr', 'en'), 'e.g. she/her');
  assert.equal(beispieltext('character', 'age', 'e.g. 132', 'de'), 'z.B. 132');
});

test('ein selbst geschriebener Beispieltext bleibt stehen', () => {
  // Sonst ueberschriebe der Sprachwechsel, was die Autorin eingetragen hat.
  assert.equal(beispieltext('character', 'age', 'in Jahren, Elfen zaehlen anders', 'en'),
    'in Jahren, Elfen zaehlen anders');
});

test('ein Feld ohne Vorlage behaelt, was dort steht', () => {
  assert.equal(beispieltext('character', 'lieblingsfarbe', 'z.B. blau', 'en'), 'z.B. blau');
  assert.equal(beispieltext('character', 'lieblingsfarbe', undefined, 'en'), '');
});
