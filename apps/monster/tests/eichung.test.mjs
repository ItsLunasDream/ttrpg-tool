/**
 * Die Eichung: rechnet die Pruefung, was sie soll?
 *
 * Gegen Monster, deren Grad nicht von ihr selbst stammt. Ohne das ist die
 * Pruefung eine Behauptung — sie saehe genauso ueberzeugend aus, wenn sie
 * falsch waere.
 *
 * ZUM ANSPRUCH DIESER TESTS: die Eichmonster sind die Musterbloecke aus
 * derselben Quelle wie die Richtwerte, also absichtlich auf der Kurve. Sie
 * fangen Rechenfehler. Ob die Rechnung auch bei gewachsenen Monstern trifft,
 * die um die Kurve herumstreuen, sagen erst die Monster des SRD — die stehen
 * noch aus (siehe src/shared/eichung.ts).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

test('jedes Eichmonster trifft seinen eigenen Grad', () => {
  const daneben = [];
  for (const monster of T.EICHMONSTER) {
    const befund = T.pruefe(monster.werte, monster.cr);
    if (befund.cr !== monster.cr) {
      daneben.push(`${monster.name}: erwartet CR ${monster.cr}, gerechnet CR ${befund.cr}`);
    }
  }
  assert.deepEqual(daneben, [], daneben.join(' | '));
});

test('und keines bekommt dabei einen Vorschlag', () => {
  // Ein Musterblock, an dem die Pruefung etwas auszusetzen hat, ist ein
  // Zeichen, dass die Spannen zu eng sind.
  const gemeckert = [];
  for (const monster of T.EICHMONSTER) {
    const befund = T.pruefe(monster.werte, monster.cr);
    if (befund.vorschlaege.length > 0) {
      gemeckert.push(`${monster.name}: ${befund.vorschlaege.map((v) => v.grund).join(',')}`);
    }
  }
  assert.deepEqual(gemeckert, [], gemeckert.join(' | '));
});

test('gegen einen falschen Grad gehalten, faellt es auf', () => {
  /*
   * Die Gegenprobe zum Test darueber: eine Pruefung, die immer „passt"
   * sagt, bestuende ihn auch. Jedes Eichmonster wird deshalb gegen einen
   * deutlich anderen Grad gehalten, und dann MUSS sie anschlagen.
   */
  for (const monster of T.EICHMONSTER) {
    const falsch = monster.cr === '15' ? '1' : '15';
    const befund = T.pruefe(monster.werte, falsch);
    assert.notEqual(befund.urteil, 'passt', `${monster.name} gegen CR ${falsch} durchgewunken`);
  }
});

test('die Abweichung bleibt bei allen unter einem halben Grad', () => {
  // Genauer als das braucht niemand; ungenauer waere es keine Pruefung mehr.
  for (const monster of T.EICHMONSTER) {
    const befund = T.pruefe(monster.werte, monster.cr);
    const ziel = T.richtwert(monster.cr);
    const abstand = Math.abs(befund.wert - ziel.wert);
    assert.ok(abstand < 0.5, `${monster.name}: ${abstand.toFixed(2)} Grad daneben`);
  }
});

test('ein Monster auf jedem Grad der Tabelle trifft sich selbst', () => {
  /*
   * Die Eichmonster decken sieben Grade ab. Dieser Test geht die ganze
   * Tabelle durch: wer die Richtwerte eines Grades nimmt, muss diesen Grad
   * herausbekommen. Faengt Fehler an den Raendern — bei CR 0 und CR 30, wo
   * nicht mehr zwischen zwei Eintraegen vermittelt werden kann.
   */
  const daneben = [];
  for (const eintrag of T.RICHTWERTE) {
    const werte = {
      tp: eintrag.tp,
      rk: eintrag.rk,
      schadenProRunde: eintrag.schadenProRunde,
      angriffsbonus: eintrag.bonus
    };
    const befund = T.pruefe(werte, eintrag.cr);
    if (befund.cr !== eintrag.cr) daneben.push(`CR ${eintrag.cr} → ${befund.cr}`);
  }
  assert.deepEqual(daneben, [], daneben.join(', '));
});
