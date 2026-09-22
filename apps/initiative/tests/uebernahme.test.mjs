/**
 * Eine Begegnung aus dem Encounter Creator wird zu Teilnehmern.
 *
 * Die Pruefungen hier halten die Entscheidungen fest, die man beim
 * Draufschauen nicht sieht: dass nicht gewuerfelt wird, dass jede Regel
 * der Umgebung ein eigener Eintrag ist und dass das, was man nur sieht,
 * gerade KEIN Eintrag wird.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const I = require('../dist/tests/entry.cjs');

/** Vorhersagbare Kennungen, damit sich das Ergebnis festnageln laesst. */
function zaehler() {
  let n = 0;
  return () => `k${(n += 1)}`;
}

const HINTERHALT = {
  name: 'Hinterhalt am Fluss',
  quelle: 'hinterhalt-am-fluss',
  gegner: [
    { name: 'Wolf', anzahl: 3, tp: 11, rk: 13, iniMod: 2 },
    { name: 'Anführer', anzahl: 1, tp: 39, rk: 15, iniMod: 1 }
  ],
  umgebung: {
    name: 'Wald',
    beschreibung: ['Moos dämpft jeden Schritt.', 'Zwischen den Stämmen steht Nebel.'],
    regeln: [
      { text: 'Das Unterholz begrenzt die Sicht auf 30 Fuß.', wert: 30 },
      { text: 'Wurzelwerk ist schwieriges Gelände.', wert: null }
    ]
  }
};

test('eine Gruppe bekommt einen Eintrag mit mehreren Koerpern', () => {
  const teilnehmer = I.alsTeilnehmer(HINTERHALT, zaehler());
  const wolf = teilnehmer.find((t) => t.name === 'Wolf');
  assert.equal(wolf.koerper.length, 3);
  assert.deepEqual(
    wolf.koerper.map((k) => k.marke),
    ['1', '2', '3']
  );
  assert.ok(wolf.koerper.every((k) => k.hp === 11 && k.hpMax === 11));
});

test('ein einzelnes Wesen bleibt ohne Marke', () => {
  const teilnehmer = I.alsTeilnehmer(HINTERHALT, zaehler());
  const chef = teilnehmer.find((t) => t.name === 'Anführer');
  assert.equal(chef.koerper.length, 1);
  assert.equal(chef.koerper[0].marke, '');
});

test('die Initiative wird NICHT gewuerfelt, der Zuschlag steht im Feinwert', () => {
  const teilnehmer = I.alsTeilnehmer(HINTERHALT, zaehler());
  const wolf = teilnehmer.find((t) => t.name === 'Wolf');
  assert.equal(wolf.initiative, 0);
  assert.equal(wolf.feinwert, 2);
});

test('die Ruestungsklasse landet in der Notiz', () => {
  const teilnehmer = I.alsTeilnehmer(HINTERHALT, zaehler());
  assert.equal(teilnehmer.find((t) => t.name === 'Wolf').notiz, 'RK 13');
});

test('jede Regel der Umgebung wird ein eigener Terrain-Eintrag', () => {
  const terrain = I.alsTeilnehmer(HINTERHALT, zaehler()).filter((t) => t.istTerrain);
  assert.equal(terrain.length, 2);
  assert.ok(terrain.every((t) => t.name.startsWith('Wald: ')));
  assert.ok(terrain.every((t) => t.initiative === I.TERRAIN_INITIATIVE));
  assert.ok(terrain.every((t) => t.koerper.length === 0));
});

test('die Regel steht im Namen, wo der Tracker sie immer zeigt', () => {
  const terrain = I.alsTeilnehmer(HINTERHALT, zaehler()).filter((t) => t.istTerrain);
  // Die Zahl steckt im Satz; die Notiz bleibt leer, weil der Tracker sie
  // ohnehin erst beim Aufklappen zeigt.
  assert.equal(terrain[0].name, 'Wald: Das Unterholz begrenzt die Sicht auf 30 Fuß.');
  assert.equal(terrain[1].name, 'Wald: Wurzelwerk ist schwieriges Gelände.');
  assert.ok(terrain.every((t) => t.notiz === ''));
});

test('was man nur sieht, wird kein Eintrag in der Reihenfolge', () => {
  const teilnehmer = I.alsTeilnehmer(HINTERHALT, zaehler());
  assert.ok(!teilnehmer.some((t) => t.name.includes('Moos')));
  assert.ok(!teilnehmer.some((t) => t.notiz.includes('Moos')));
  assert.ok(!teilnehmer.some((t) => t.name.includes('Moos')));
});

test('ohne Umgebung entsteht kein Terrain', () => {
  const ohne = { ...HINTERHALT, umgebung: null };
  assert.equal(I.alsTeilnehmer(ohne, zaehler()).filter((t) => t.istTerrain).length, 0);
  assert.equal(I.alsTaktik(ohne), '');
});

test('die Taktik traegt, was man sieht', () => {
  const taktik = I.alsTaktik(HINTERHALT);
  assert.match(taktik, /^## Wald/);
  assert.match(taktik, /Moos dämpft jeden Schritt\./);
  // Und gerade nicht die Regeln: die stehen als Terrain in der Reihenfolge.
  assert.ok(!taktik.includes('Unterholz'));
});

test('jede Kennung kommt nur einmal vor', () => {
  const teilnehmer = I.alsTeilnehmer(HINTERHALT, zaehler());
  const ids = [...teilnehmer.map((t) => t.id), ...teilnehmer.flatMap((t) => t.koerper.map((k) => k.id))];
  assert.equal(new Set(ids).size, ids.length);
});
