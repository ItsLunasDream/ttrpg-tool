/**
 * Der Weg vom erzeugten Zustand bis zur Datei.
 *
 * Das Umwandeln selbst ist in packages/foundry geprueft, auch gegen einen
 * echten Export. Hier geht es um die Zuordnung: werden aus unseren
 * Wirkungskennungen wirklich Saetze, und uebersteht ein gewuerfelter Zustand
 * den Weg.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { alsFoundryDatei, alsFoundryEingabe, erzeugeZustand } = require('../dist/tests/entry.cjs');

function fester(start = 5) {
  let n = start;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

test('aus Wirkungskennungen werden Saetze, keine Kennungen', () => {
  for (const saat of [1, 9, 42, 77]) {
    const zustand = erzeugeZustand({}, 'en', fester(saat));
    const eingabe = alsFoundryEingabe(zustand, 'en');

    assert.equal(eingabe.name, zustand.name);
    assert.equal(eingabe.stufen.length, zustand.stufen.length);

    for (const stufe of eingabe.stufen) {
      for (const satz of stufe.wirkungen) {
        // Eine unaufgeloeste Kennung waere kleingeschrieben und ohne
        // Leerzeichen — etwa „nachteil-angriff".
        assert.ok(
          /\s/.test(satz) || /[A-Z]/.test(satz),
          `sieht nach Kennung aus (Saat ${saat}): ${satz}`
        );
      }
    }
  }
});

test('die Datei traegt den Namen, den Foundry selbst vergaebe', () => {
  const zustand = erzeugeZustand({}, 'en', fester());
  const datei = alsFoundryDatei(zustand, 'en', fester());
  assert.match(datei.name, /^fvtt-Item-[a-z0-9-]+-[A-Za-z0-9]{16}\.json$/, datei.name);
});

test('der Inhalt ist lesbares JSON und traegt die Regel im Text', () => {
  const zustand = erzeugeZustand({}, 'en', fester(3));
  const datei = alsFoundryDatei(zustand, 'en', fester());
  assert.ok(datei.inhalt.endsWith('\n'));

  const gelesen = JSON.parse(datei.inhalt);
  assert.equal(gelesen.type, 'feat');
  assert.equal(gelesen.name, zustand.name);

  const html = gelesen.system.description.value;
  assert.ok(html.includes(zustand.dauer), `Dauer fehlt: ${html}`);
  // Jede Wirkung jeder Stufe muss im Text stehen — sonst waere in Foundry
  // eine Regel verschwunden, ohne dass es jemand merkt.
  for (const stufe of alsFoundryEingabe(zustand, 'en').stufen) {
    for (const satz of stufe.wirkungen) {
      assert.ok(html.includes(satz), `fehlt im Text: ${satz}`);
    }
  }
});

test('die Sprache schlaegt bis in die Datei durch', () => {
  const zustand = erzeugeZustand({}, 'de', fester(11));
  const deutsch = alsFoundryEingabe(zustand, 'de');
  const englisch = alsFoundryEingabe(zustand, 'en');
  const flach = (e) => e.stufen.flatMap((s) => s.wirkungen).join(' | ');
  assert.notEqual(flach(deutsch), flach(englisch), flach(deutsch));
});
