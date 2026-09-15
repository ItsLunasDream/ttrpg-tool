import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { leseBreite, breiteAlsAttribute, breiteAusAttributen } = entry;

test('Bildpunkte und Anteile werden beide gelesen', () => {
  assert.equal(leseBreite('300'), '300');
  assert.equal(leseBreite(' 300px '), '300');
  assert.equal(leseBreite('50%'), '50%');
  assert.equal(leseBreite('50 %'), '50%');
});

test('Unsinn ergibt keine Breite', () => {
  // Dann bleibt die Breite, wie sie war, statt ein kaputtes Attribut in die
  // Notiz zu schreiben.
  for (const eingabe of ['', '   ', 'breit', '0', '5', '9999', '0%', '150%', '-20']) {
    assert.equal(leseBreite(eingabe), null, `"${eingabe}" haette keine Breite ergeben duerfen`);
  }
});

test('Anteile stehen als Stilangabe, Bildpunkte als Attribut', () => {
  // Das Attribut width nimmt in HTML5 nur ganze Zahlen. Ein Prozentwert
  // darin waere ungueltig und im gedruckten PDF nicht verlaesslich.
  assert.deepEqual(breiteAlsAttribute('300'), { width: '300' });
  assert.deepEqual(breiteAlsAttribute('50%'), { style: 'width: 50%' });
  assert.deepEqual(breiteAlsAttribute(null), {});
});

test('beide Formen werden aus dem Bild zurueckgelesen', () => {
  assert.equal(breiteAusAttributen('300', null), '300');
  assert.equal(breiteAusAttributen(null, 'width: 50%'), '50%');
  assert.equal(breiteAusAttributen(null, 'float: right; width: 40%; margin: 0'), '40%');
  assert.equal(breiteAusAttributen(null, 'float: right'), null);
  assert.equal(breiteAusAttributen(null, null), null);
});
