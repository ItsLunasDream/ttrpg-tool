/**
 * Die Suche in der Sammlung.
 *
 * Ein Feld fuer alles — das ist bequem und genau deshalb heikel: „untot 4"
 * muss Untote MIT Grad 4 finden und nicht alles Untote plus alles auf Grad 4.
 * Diese Datei haelt das fest, weil man es beim Umbauen leicht kaputt macht.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/** Ein Eintrag, wie ihn `alsEintrag` aus einer Datei liest. */
function eintrag(teil) {
  return {
    id: 'x',
    name: 'Namenlos',
    cr: '4',
    themaId: 'untot',
    rolleId: 'brecher',
    tp: 100,
    rk: 15,
    geaendert: '2026-09-16T10:00:00.000Z',
    ...teil
  };
}

const SAMMLUNG = [
  eintrag({ id: 'a', name: 'Gruftwandler', cr: '4', themaId: 'untot', rolleId: 'brecher' }),
  eintrag({ id: 'b', name: 'Knochenbogner', cr: '2', themaId: 'untot', rolleId: 'schuetze' }),
  eintrag({ id: 'c', name: 'Aschekrieger', cr: '4', themaId: 'daemonisch', rolleId: 'brecher' }),
  eintrag({ id: 'd', name: 'Zwielichtklinge', cr: '1/2', themaId: 'feenhaft', rolleId: 'lauerer' })
];

function namen(anfrage, nach = 'name', sprache = 'de') {
  return T.finde(SAMMLUNG, anfrage, nach, sprache).map((e) => e.name);
}

test('ein Grad allein findet alle Monster dieses Grades', () => {
  assert.deepEqual(namen({ text: '4' }), ['Aschekrieger', 'Gruftwandler']);
});

test('cr davor aendert nichts, mit und ohne Leerzeichen', () => {
  assert.deepEqual(namen({ text: 'cr4' }), ['Aschekrieger', 'Gruftwandler']);
  assert.deepEqual(namen({ text: 'cr 4' }), ['Aschekrieger', 'Gruftwandler']);
});

test('ein Bruchgrad wird als Bruch gelesen', () => {
  assert.deepEqual(namen({ text: '1/2' }), ['Zwielichtklinge']);
});

test('eine Spanne nimmt die Raender mit', () => {
  assert.deepEqual(namen({ text: '2-4' }), ['Aschekrieger', 'Gruftwandler', 'Knochenbogner']);
});

test('Wort und Grad zusammen heisst UND, nicht ODER', () => {
  // Der Fall, um den es geht: nicht alle Untoten und nicht alles auf Grad 4.
  assert.deepEqual(namen({ text: 'untot 4' }), ['Gruftwandler']);
});

test('der Name findet auch als Teilstueck', () => {
  assert.deepEqual(namen({ text: 'klinge' }), ['Zwielichtklinge']);
});

test('die Rolle ist durchsuchbar', () => {
  assert.deepEqual(namen({ text: 'schuetze' }), ['Knochenbogner']);
});

test('auf Englisch gesucht findet deutsch angelegte Monster', () => {
  // Die Kennung steht immer mit im Heuhaufen, deshalb greift die Suche in
  // beiden Sprachen.
  const treffer = T.finde(SAMMLUNG, { text: 'undead' }, 'name', 'en').map((e) => e.name);
  assert.deepEqual(treffer, ['Gruftwandler', 'Knochenbogner']);
});

test('die Filterleiste schneidet zusaetzlich zu, nicht stattdessen', () => {
  assert.deepEqual(namen({ text: '4', themaId: 'untot' }), ['Gruftwandler']);
  assert.deepEqual(namen({ text: '', rolleId: 'brecher' }), ['Aschekrieger', 'Gruftwandler']);
});

test('ein Wort ohne Treffer liefert nichts', () => {
  assert.deepEqual(namen({ text: 'drachen' }), []);
});

test('leerer Text liefert alles', () => {
  assert.equal(namen({ text: '   ' }).length, SAMMLUNG.length);
});

test('nach Grad sortiert steigt es, bei Gleichstand entscheidet der Name', () => {
  assert.deepEqual(namen({ text: '' }, 'cr'), [
    'Zwielichtklinge',
    'Knochenbogner',
    'Aschekrieger',
    'Gruftwandler'
  ]);
});

test('nach Aenderung sortiert steht das Neueste oben', () => {
  const liste = [
    eintrag({ name: 'Alt', geaendert: '2026-01-01T00:00:00.000Z' }),
    eintrag({ name: 'Neu', geaendert: '2026-09-01T00:00:00.000Z' })
  ];
  assert.deepEqual(
    T.sortiere(liste, 'geaendert').map((e) => e.name),
    ['Neu', 'Alt']
  );
});

test('sortieren laesst die Vorlage in Ruhe', () => {
  const vorher = SAMMLUNG.map((e) => e.name);
  T.sortiere(SAMMLUNG, 'cr');
  assert.deepEqual(
    SAMMLUNG.map((e) => e.name),
    vorher
  );
});

test('gradAus liest nur den ersten Gradwunsch', () => {
  assert.deepEqual(T.gradAus(['untot', '4']), { von: 4, bis: 4 });
  assert.equal(T.gradAus(['untot', 'brecher']), null);
});

test('cr allein ist noch keine Suche', () => {
  // Zwischenstand beim Tippen von „cr 4": die Liste darf nicht leer springen.
  assert.equal(namen({ text: 'cr' }).length, SAMMLUNG.length);
  assert.equal(namen({ text: 'cr ' }).length, SAMMLUNG.length);
});
