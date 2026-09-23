import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const A = require('../dist/tests/entry.cjs');

test('Nachrichten ueberstehen die Leitung, Fremdes wird verworfen', () => {
  const chat = { typ: 'chat', von: 'a', an: null, text: 'Hallo', zeit: '2026-09-23T05:00:00Z' };
  assert.deepEqual(A.leseNachricht(A.kodiere(chat).trim()), chat);
  const dm = { ...chat, an: 'b' };
  assert.deepEqual(A.leseNachricht(JSON.stringify(dm)), dm);
  assert.equal(A.leseNachricht('kein json'), null);
  assert.equal(A.leseNachricht(JSON.stringify({ typ: 'chat', von: 'a', an: 5, text: 'x', zeit: 'z' })), null);
  assert.equal(A.leseNachricht(JSON.stringify({ typ: 'loesche-alles' })), null);
  assert.equal(A.leseNachricht(JSON.stringify({ ...chat, text: 'x'.repeat(A.MAX_CHAT + 1) })), null);
});

test('Ankuendigungen werden gelesen, kaputte nicht', () => {
  const a = { typ: 'ttrpg-raum', version: 1, raum: 'Freitagsrunde', gastgeber: 'Anna', port: 51234, geschuetzt: true };
  assert.deepEqual(A.leseAnkuendigung(JSON.stringify(a)), a);
  assert.equal(A.leseAnkuendigung(JSON.stringify({ ...a, port: 70000 })), null);
  assert.equal(A.leseAnkuendigung('???'), null);
});

test('der Zeilenleser setzt Stuecke zusammen und bricht bei zu langen Zeilen ab', () => {
  const leser = new A.Zeilenleser(20);
  assert.deepEqual(leser.schiebe('{"a":1}\n{"b"'), ['{"a":1}']);
  assert.deepEqual(leser.schiebe(':2}\n\n'), ['{"b":2}']);
  assert.throws(() => leser.schiebe('x'.repeat(30)), /zu lang/);
});

test('Namen im Raum sind eindeutig, ohne eigenen gibt es einen Gastnamen', () => {
  assert.equal(A.eindeutigerName('Anna', ['Ben']), 'Anna');
  assert.equal(A.eindeutigerName('anna', ['Anna', 'Anna (2)']), 'anna (3)');
  assert.equal(A.eindeutigerName('   ', []), 'Gast');
  assert.equal(A.gastname(3), 'Gast 3');
  assert.equal(A.gastname(3, 'en'), 'Guest 3');
});
