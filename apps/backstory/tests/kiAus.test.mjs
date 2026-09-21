/**
 * Der Assistent verschwindet, wenn die KI aus ist — nicht, wenn sie nur noch
 * nicht eingerichtet ist.
 *
 * Aus dem Gebrauch: „Im Story Creator rechts das Assistant-Fenster
 * verstecken, wenn KI ausgeschaltet ist." Der Unterschied ist der ganze
 * Punkt: wer keinen Schluessel hinterlegt hat, braucht den Assistenten
 * weiter, dort steht die Anleitung zum Einrichten.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function zustand(teil = {}) {
  return {
    provider: 'claude',
    ready: true,
    detail: '',
    hasKey: true,
    managedByShell: true,
    ...teil
  };
}

test('abgeschaltete KI: der Assistent geht weg', () => {
  assert.equal(T.kiAbgeschaltet(zustand({ provider: 'none', ready: false, hasKey: false })), true);
});

test('gewaehlter Anbieter ohne Schluessel: der Assistent bleibt', () => {
  // Sonst blendet man dem Neuling genau die Stelle aus, an der er den
  // Schluessel eintraegt.
  assert.equal(T.kiAbgeschaltet(zustand({ ready: false, hasKey: false })), false);
  assert.equal(T.kiAbgeschaltet(zustand({ provider: 'ollama', ready: false })), false);
});

test('kein Zustand heisst nicht „aus", sondern „noch nicht gefragt"', () => {
  // Waehrend des Starts und nach einer gescheiterten Abfrage steht hier null.
  // Der Assistent wegen einer Stoerung verschwinden zu lassen waere das
  // schlechtere von beidem.
  assert.equal(T.kiAbgeschaltet(null), false);
});

test('eingerichtete KI: der Assistent bleibt', () => {
  assert.equal(T.kiAbgeschaltet(zustand()), false);
});
