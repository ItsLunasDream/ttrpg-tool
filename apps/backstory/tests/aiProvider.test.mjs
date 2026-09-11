import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { istAnbieterId } = entry;

/**
 * AiProviderId steht in shared/types.ts noch einmal ausgeschrieben, statt aus
 * @suite/ki zu kommen: dieses Modul liest auch die Oberflaeche, und ein
 * Import aus dem KI-Paket zoege dessen Abhaengigkeiten in das Buendel des
 * Renderers.
 *
 * Doppelte Listen laufen auseinander, wenn niemand hinsieht. Also sieht
 * dieser Test hin. TypeScript kann das nicht: die eine Liste kennt es zur
 * Uebersetzungszeit, die andere liegt als Funktion vor.
 */
const AUS_SHARED_TYPES = ['none', 'ollama', 'claude'];

test('jeder Wert aus AiProviderId ist im KI-Paket bekannt', () => {
  for (const wert of AUS_SHARED_TYPES) {
    assert.equal(istAnbieterId(wert), true, `${wert} fehlt in @suite/ki`);
  }
});

test('und das KI-Paket kennt keinen Anbieter, den AiProviderId nicht hat', () => {
  // Ein neuer Anbieter im Paket, den die Einstellungen nicht anbieten, waere
  // eingebaut und unerreichbar.
  for (const fremd of ['openai', 'gemini', 'mistral', 'lmstudio']) {
    assert.equal(
      istAnbieterId(fremd),
      AUS_SHARED_TYPES.includes(fremd),
      `${fremd} steht nur auf einer der beiden Listen`
    );
  }
});
