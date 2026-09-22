/**
 * Der Weg vom erzeugten Monster bis zur Datei.
 *
 * Das Umwandeln selbst ist in packages/foundry geprueft, auch gegen echte
 * Exporte. Hier geht es um die Zuordnung: landet UNSER Feld im richtigen
 * dortigen, und uebersteht ein wirklich gewuerfeltes Monster den Weg.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { alsFoundryDatei, alsFoundryEingabe, erzeugeMonster } = require('../dist/tests/entry.cjs');

function fester(start = 7) {
  let n = start;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

test('ein gewuerfeltes Monster kommt heil durch', () => {
  for (const cr of ['1/4', '1', '5', '12', '20']) {
    const monster = erzeugeMonster({ cr }, 'en', fester(cr.length * 13));
    const eingabe = alsFoundryEingabe(monster);

    assert.equal(eingabe.name, monster.name);
    assert.equal(eingabe.tp, monster.werte.tp);
    assert.equal(eingabe.rk, monster.werte.rk);
    assert.equal(eingabe.hauptattribut, monster.hauptattribut);
    assert.equal(eingabe.angriffe.length, monster.angriffe.length);
    assert.equal(eingabe.faehigkeiten.length, monster.faehigkeiten.length);

    // Die Wesensart muss eine sein, die dnd5e kennt — ein deutsches Thema
    // dort waere ein rot angestrichenes Feld.
    assert.match(
      eingabe.artEnglisch,
      /^(undead|beast|construct|aberration|elemental|fiend|fey|dragon|humanoid|plant)$/,
      `Grad ${cr}: ${eingabe.artEnglisch}`
    );

    // Und die Schadensarten ebenso: englisch, klein, keine Kennung.
    for (const angriff of eingabe.angriffe) {
      assert.match(angriff.schadensart, /^[a-z]+$/, `Grad ${cr}: ${angriff.schadensart}`);
    }
  }
});

test('die Datei traegt den Namen, den Foundry selbst vergaebe', () => {
  const monster = erzeugeMonster({ cr: '5' }, 'en', fester());
  const datei = alsFoundryDatei(monster, fester());
  assert.match(datei.name, /^fvtt-Actor-[a-z0-9-]+-[A-Za-z0-9]{16}\.json$/, datei.name);
});

test('der Inhalt ist lesbares JSON und endet mit einem Zeilenumbruch', () => {
  const monster = erzeugeMonster({ cr: '5' }, 'en', fester());
  const datei = alsFoundryDatei(monster, fester());
  assert.ok(datei.inhalt.endsWith('\n'));
  const gelesen = JSON.parse(datei.inhalt);
  assert.equal(gelesen.type, 'npc');
  assert.equal(gelesen.name, monster.name);
  assert.equal(gelesen.system.attributes.hp.max, monster.werte.tp);
});

test('die Angriffe heissen auf Englisch, nicht mit ihrer Kennung', () => {
  const monster = erzeugeMonster({ cr: '8' }, 'en', fester(3));
  const eingabe = alsFoundryEingabe(monster);
  for (const angriff of eingabe.angriffe) {
    // Eine Kennung waere kleingeschrieben und ohne Leerzeichen; die Namen
    // der Waffentabelle beginnen gross.
    assert.match(angriff.name, /^[A-Z]/, `sieht nach Kennung aus: ${angriff.name}`);
  }
});
