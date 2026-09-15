import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { anker, nachNamen, verlinkeImDokument } = entry;

function notiz(id, title, aliases = []) {
  return { id, title, aliases };
}

test('Verweise auf mitexportierte Notizen werden zu Sprungzielen', () => {
  const enthalten = nachNamen([notiz('m1', 'Mira', ['die Falkin'])]);
  assert.equal(verlinkeImDokument('Er traf [[Mira]].', enthalten), 'Er traf [Mira](#notiz-m1).');
  // Auch ueber den Alias, und der Anzeigetext bleibt stehen.
  assert.equal(
    verlinkeImDokument('Er traf [[die Falkin|sie]].', enthalten),
    'Er traf [sie](#notiz-m1).'
  );
});

test('Verweise auf Notizen ausserhalb des Exports bleiben Text', () => {
  // Ein Sprung ins Leere ist schlimmer als kein Sprung.
  const enthalten = nachNamen([notiz('m1', 'Mira')]);
  assert.equal(verlinkeImDokument('Er traf [[Toran]].', enthalten), 'Er traf Toran.');
  assert.equal(verlinkeImDokument('Er traf [[Toran|ihn]].', enthalten), 'Er traf ihn.');
});

test('der Anker haengt an der Kennung, nicht am Titel', () => {
  // Zwei Notizen duerfen denselben Titel tragen.
  const eins = notiz('a', 'Hafen');
  const zwei = notiz('b', 'Hafen');
  assert.notEqual(anker(eins), anker(zwei));
});
