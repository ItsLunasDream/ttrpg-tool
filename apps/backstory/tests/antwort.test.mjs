import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { leseAntwort, leseStuecke } = entry;

test('fett, kursiv und Code werden erkannt', () => {
  assert.deepEqual(leseStuecke('Ein **fettes** und *kursives* Wort'), [
    { art: 'text', text: 'Ein ' },
    { art: 'fett', text: 'fettes' },
    { art: 'text', text: ' und ' },
    { art: 'kursiv', text: 'kursives' },
    { art: 'text', text: ' Wort' }
  ]);
  assert.deepEqual(leseStuecke('Ruf `wuerfle()` auf'), [
    { art: 'text', text: 'Ruf ' },
    { art: 'code', text: 'wuerfle()' },
    { art: 'text', text: ' auf' }
  ]);
});

test('halbe Auszeichnung bleibt Text', () => {
  // Die Antwort trifft stueckweise ein. Ein noch offenes `**` darf weder
  // flackern noch den Rest der Zeile verschlucken.
  assert.deepEqual(leseStuecke('Ein **fettes'), [{ art: 'text', text: 'Ein **fettes' }]);
  assert.deepEqual(leseStuecke('2 * 3 * 4'), [{ art: 'text', text: '2 * 3 * 4' }]);
});

test('Stichpunkte werden zu einer Liste zusammengefasst', () => {
  const bausteine = leseAntwort('Drei Sachen:\n\n- eins\n- zwei\n- drei');
  assert.equal(bausteine.length, 2);
  assert.equal(bausteine[0].art, 'absatz');
  assert.equal(bausteine[1].art, 'liste');
  assert.equal(bausteine[1].nummeriert, false);
  assert.equal(bausteine[1].punkte.length, 3);
});

test('nummerierte und einfache Listen bleiben getrennt', () => {
  const bausteine = leseAntwort('- eins\n1. zwei');
  assert.deepEqual(bausteine.map((baustein) => baustein.nummeriert), [false, true]);
});

test('Ueberschriften verlieren ihre Rauten', () => {
  const [baustein] = leseAntwort('## Aufbau');
  assert.equal(baustein.art, 'ueberschrift');
  assert.equal(baustein.stufe, 2);
  assert.deepEqual(baustein.stuecke, [{ art: 'text', text: 'Aufbau' }]);
});

test('ein noch offener Codeblock wird trotzdem gezeigt', () => {
  const [baustein] = leseAntwort('```\nconst x = 1;');
  assert.equal(baustein.art, 'code');
  assert.equal(baustein.text, 'const x = 1;');
});

test('gewoehnlicher Text bleibt ein Absatz mit seinen Zeilenumbruechen', () => {
  const bausteine = leseAntwort('Erste Zeile\nZweite Zeile');
  assert.equal(bausteine.length, 1);
  assert.deepEqual(bausteine[0].stuecke, [{ art: 'text', text: 'Erste Zeile\nZweite Zeile' }]);
});

test('Unterstriche in Namen bleiben stehen', () => {
  assert.deepEqual(leseStuecke('Das Feld feld_name_zwei'), [{ art: 'text', text: 'Das Feld feld_name_zwei' }]);
});

test('ein Sprachmodell kann kein Markup einschleusen', () => {
  // Die Stuecke tragen nur Text. Was die Oberflaeche daraus baut, sind
  // Elemente — ein <script> bleibt unter allen Umstaenden Text.
  const [baustein] = leseAntwort('<script>alert(1)</script>');
  assert.equal(baustein.art, 'absatz');
  assert.deepEqual(baustein.stuecke, [{ art: 'text', text: '<script>alert(1)</script>' }]);
});
