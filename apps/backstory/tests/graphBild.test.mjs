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
