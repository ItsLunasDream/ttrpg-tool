import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { verlinkteNotizen } = entry;

function notiz(overrides) {
  return {
    id: 'n1',
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

test('erwaehnte und verbundene Notizen zaehlen, jede nur einmal', () => {
  const mira = notiz({ id: 'mira', title: 'Mira', aliases: ['die Falkin'] });
  const toran = notiz({ id: 'toran', title: 'Toran' });
  const offen = notiz({
    id: 'offen',
    title: 'Offen',
    body: 'Er traf [[Mira]] und [[die Falkin]] wieder.',
    relations: [{ targetId: 'toran', label: 'Freund' }]
  });

  const verlinkt = verlinkteNotizen(offen, [mira, toran, offen]);
  assert.deepEqual(verlinkt.map((eintrag) => eintrag.id), ['mira', 'toran']);
});

test('die eigene Notiz zaehlt nicht mit', () => {
  const selbst = notiz({ id: 'selbst', title: 'Selbst', body: 'Siehe [[Selbst]].' });
  assert.equal(verlinkteNotizen(selbst, [selbst]).length, 0);
});

test('mehr als die Obergrenze wird abgeschnitten', () => {
  // Ohne die Grenze waechst die Anfrage mit der Kampagne und wird teuer,
  // ohne besser zu werden.
  const viele = Array.from({ length: 20 }, (_, i) => notiz({ id: `n${i}`, title: `Notiz ${i}` }));
  const offen = notiz({ id: 'offen', body: viele.map((n) => `[[${n.title}]]`).join(' ') });
  assert.equal(verlinkteNotizen(offen, [...viele, offen]).length, 12);
});
