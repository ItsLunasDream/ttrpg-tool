/**
 * Ein Paket bleibt in der Sammlung ein Paket.
 *
 * Aus dem Gebrauch: „Wenn man ein Status Effect Package zur Collection
 * schickt soll es auch in der Collection als zusammenhängendes Packet sein.
 * Sonst sind die einzelnen Bestandteile an unterschiedlichen Stellen."
 *
 * Der Grund, warum man ein Paket wuerfelt, ist die Abstimmung untereinander
 * — die war nach dem Speichern nicht mehr zu sehen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function eintrag(name, paket) {
  return {
    id: name.toLowerCase(),
    name,
    dauerId: 'runden',
    artId: 'fluch',
    themaId: 'kaelte',
    haerteId: 'mittel',
    stufen: 3,
    gewicht: 12,
    zeichen: '◈',
    farbe: '#7a8ca8',
    geaendert: '',
    paketId: paket ? T.paketId(paket) : '',
    paketName: paket ?? ''
  };
}

test('ohne Paket bleibt jeder Eintrag eine eigene Kachel', () => {
  const gruppen = T.gruppiere([eintrag('Frost'), eintrag('Hunger')]);
  assert.equal(gruppen.length, 2);
  assert.ok(gruppen.every((g) => g.art === 'einzeln'));
});

test('die Zustaende eines Pakets stehen in einer Kachel', () => {
  const gruppen = T.gruppiere([
    eintrag('Kälte', 'Arktis'),
    eintrag('Schneeblindheit', 'Arktis'),
    eintrag('Hunger', 'Arktis')
  ]);
  assert.equal(gruppen.length, 1);
  assert.equal(gruppen[0].art, 'paket');
  assert.equal(gruppen[0].name, 'Arktis');
  assert.deepEqual(gruppen[0].eintraege.map((e) => e.name), [
    'Kälte',
    'Schneeblindheit',
    'Hunger'
  ]);
});

test('zwei Pakete bleiben zwei Kacheln, auch wenn sie sich abwechseln', () => {
  const gruppen = T.gruppiere([
    eintrag('Kälte', 'Arktis'),
    eintrag('Glut', 'Wüste'),
    eintrag('Hunger', 'Arktis'),
    eintrag('Durst', 'Wüste')
  ]);
  assert.equal(gruppen.length, 2);
  assert.deepEqual(gruppen.map((g) => g.name), ['Arktis', 'Wüste']);
  assert.equal(gruppen[0].eintraege.length, 2);
});

test('ein Paket steht dort, wo sein erster Zustand stuende', () => {
  // Sonst spraengen die Kacheln beim Tippen im Suchfeld hin und her.
  const gruppen = T.gruppiere([
    eintrag('Allein'),
    eintrag('Kälte', 'Arktis'),
    eintrag('Danach'),
    eintrag('Hunger', 'Arktis')
  ]);
  assert.deepEqual(
    gruppen.map((g) => (g.art === 'paket' ? g.name : g.eintrag.name)),
    ['Allein', 'Arktis', 'Danach']
  );
});

test('ein Paket mit nur noch einem Zustand ist keines mehr', () => {
  /*
   * Zwei Faelle auf einmal: wer die anderen drei geloescht hat, und wer
   * gesucht hat und nur einen Treffer im Paket hat. Beide Male waere eine
   * Kachel zum Aufklappen nur im Weg.
   */
  const gruppen = T.gruppiere([eintrag('Kälte', 'Arktis')]);
  assert.equal(gruppen.length, 1);
  assert.equal(gruppen[0].art, 'einzeln');
  assert.equal(gruppen[0].eintrag.name, 'Kälte');
});

test('die Paketkennung kann nicht mit der eines Zustands zusammenfallen', () => {
  // Sonst buendelte ein Zustand namens „Arktis" versehentlich mit dem Paket.
  assert.ok(T.paketId('Arktis').startsWith('paket-'));
  assert.notEqual(T.paketId('Arktis'), 'arktis');
  assert.equal(T.paketId('Arktis'), T.paketId('arktis'));
});

test('der Paketname wird mitgesucht', () => {
  const treffer = T.passt(eintrag('Kälte', 'Arktis'), { text: 'arktis' }, 'de');
  assert.equal(treffer, true);
  assert.equal(T.passt(eintrag('Kälte'), { text: 'arktis' }, 'de'), false);
});
