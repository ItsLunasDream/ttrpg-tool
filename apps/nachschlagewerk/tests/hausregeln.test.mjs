/**
 * Hausregeln: als Datei hin und zurueck, und als Eintrag neben den offiziellen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const N = require('../dist/tests/entry.cjs');

const regel = {
  id: 'kritisch',
  name: 'Kritische Treffer: maximal',
  bezug: 'regel/critical-hit',
  text: 'Bei uns wird der Schaden maximiert.\n\nGilt auch fuer [[Liegend]].',
  geaendert: '2026-09-22T18:00:00.000Z'
};

test('eine Hausregel kommt aus der Datei zurueck, wie sie hineinging', () => {
  const zurueck = N.leseHausregel(N.alsMarkdown(regel), 'kritisch');
  assert.deepEqual(zurueck, regel);
});

test('ein Doppelpunkt im Namen zerreisst den Kopf nicht', () => {
  assert.match(N.alsMarkdown(regel), /^name: "Kritische Treffer: maximal"$/m);
});

test('Kennungen: lesbar und frei', () => {
  assert.equal(N.zuId('Kritische Treffer über alles'), 'kritische-treffer-ueber-alles');
  assert.equal(N.freieKennung('a', ['a', 'a-2']), 'a-3');
});

test('als Eintrag: Art Hausregel, der Bezug als Verweis, nicht uebersetzt', () => {
  const r = N.alsRegel(regel);
  assert.equal(r.id, 'hausregel/kritisch');
  assert.equal(r.art, 'hausregel');
  assert.deepEqual(r.verweise, ['regel/critical-hit']);
  assert.equal(r.name.de, r.name.en);
  assert.equal(r.bloecke.length, 2);
});

test('[[Verweise]] in Hausregeln werden erkannt', () => {
  const teile = N.zerlege('Siehe [[Liegend]] und [[Gibtsnicht]].');
  assert.deepEqual(teile, ['Siehe ', { verweis: 'Liegend' }, ' und ', { verweis: 'Gibtsnicht' }, '.']);
});

test('die Suche findet Hausregeln neben den offiziellen', () => {
  const alle = [N.alsRegel(regel), ...N.alleRegeln()];
  const treffer = N.finde(alle, 'maximiert', 'de');
  assert.equal(treffer[0].regel.id, 'hausregel/kritisch');
});
