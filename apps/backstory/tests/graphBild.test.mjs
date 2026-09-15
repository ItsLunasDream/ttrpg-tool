import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { zeichneGraph, DEFAULT_NOTE_TYPES } = entry;

function notiz(overrides) {
  return {
    id: 'n',
    schemaVersion: 1,
    type: 'note',
    title: 'Eins',
    aliases: [],
    tags: [],
    fields: {},
    relations: [],
    body: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}

test('ein Netz aus einer Notiz ist kein Netz', () => {
  assert.equal(zeichneGraph([notiz({ id: 'a' })], DEFAULT_NOTE_TYPES), '');
  assert.equal(zeichneGraph([], DEFAULT_NOTE_TYPES), '');
});

test('verbundene Notizen ergeben Linien und beschriftete Punkte', () => {
  const mira = notiz({ id: 'mira', title: 'Mira' });
  const toran = notiz({ id: 'toran', title: 'Toran', body: 'Er schuldet [[Mira]] Gold.' });

  const svg = zeichneGraph([mira, toran], DEFAULT_NOTE_TYPES);
  assert.match(svg, /^<svg/);
  assert.equal((svg.match(/<circle /g) ?? []).length, 2);
  assert.equal((svg.match(/<line /g) ?? []).length, 1);
  assert.match(svg, /Mira/);
  assert.match(svg, /Toran/);
});

test('spitze Klammern im Titel landen nicht als Markup im Bild', () => {
  const eins = notiz({ id: 'a', title: '<script>böse</script>' });
  const zwei = notiz({ id: 'b', title: 'Zwei', body: 'Siehe [[<script>böse</script>]].' });

  const svg = zeichneGraph([eins, zwei], DEFAULT_NOTE_TYPES);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;script&gt;/);
});

test('die Punkte tragen die Farbe ihres Notiztyps', () => {
  // Ohne Farbe ist im Ausdruck nicht zu sehen, was Figur und was Ort ist —
  // gestrichelt gegen durchgezogen trennt nur Erwaehnung und Beziehung.
  const mira = notiz({ id: 'mira', title: 'Mira', type: 'character' });
  const hafen = notiz({ id: 'hafen', title: 'Hafen', type: 'location', body: 'Dort wohnt [[Mira]].' });

  const svg = zeichneGraph([mira, hafen], DEFAULT_NOTE_TYPES);
  const farben = [...svg.matchAll(/<circle[^>]*fill="([^"]+)"/g)].map((treffer) => treffer[1]);
  assert.equal(farben.length, 2);
  assert.notEqual(farben[0], farben[1], 'beide Typen bekommen dieselbe Farbe');
  for (const farbe of farben) assert.match(farbe, /^#[0-9a-f]{6}$/i);
});

test('von Hand gesetzte Stellen werden in das Bild eingepasst', () => {
  /*
   * Die Stellen kommen aus dem Graphen der Anwendung und sind in dessen
   * Flaeche gemessen. Roh uebernommen lag das Netz im PDF halb ausserhalb —
   * im gemeldeten Bild war es unten abgeschnitten.
   */
  const a = notiz({ id: 'a', title: 'Aaa' });
  const b = notiz({ id: 'b', title: 'Bbb', body: 'Siehe [[Aaa]].' });
  const c = notiz({ id: 'c', title: 'Ccc', body: 'Auch [[Aaa]].' });

  const svg = zeichneGraph([a, b, c], DEFAULT_NOTE_TYPES, {
    a: { x: 40, y: 30 },
    b: { x: 2400, y: 1800 },
    c: { x: 1200, y: 900 }
  });

  const zahlen = (name) =>
    [...svg.matchAll(new RegExp(`${name}="([-0-9.]+)"`, 'g'))].map((treffer) => Number(treffer[1]));
  const xs = zahlen('cx');
  const ys = zahlen('cy');
  assert.equal(xs.length, 3);
  for (const x of xs) assert.ok(x >= 0 && x <= 1000, `x ausserhalb: ${x}`);
  // Auch die Beschriftung unter dem untersten Punkt muss noch aufs Blatt.
  for (const y of ys) assert.ok(y >= 0 && y <= 700 - 25, `y ausserhalb: ${y}`);
});
