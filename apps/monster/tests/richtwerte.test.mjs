/**
 * Die Richtwerte-Tabelle.
 *
 * Sie ist abgeschrieben, also wird geprueft, dass beim Abschreiben nichts
 * verrutscht ist — und dass die Hilfsfunktionen darauf sich so verhalten,
 * wie die Pruefung es annimmt.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

test('die Tabelle geht von CR 0 bis CR 30', () => {
  assert.equal(T.RICHTWERTE.length, 34);
  assert.equal(T.RICHTWERTE[0].cr, '0');
  assert.equal(T.RICHTWERTE.at(-1).cr, '30');
  for (const gebrochen of ['1/8', '1/4', '1/2']) {
    assert.ok(T.richtwert(gebrochen), `${gebrochen} fehlt`);
  }
});

test('alles waechst mit dem Grad, nichts springt zurueck', () => {
  // Faengt einen Zahlendreher beim Abschreiben: eine einzige vertauschte
  // Ziffer bricht die Monotonie fast immer.
  let vorher = T.RICHTWERTE[0];
  for (const eintrag of T.RICHTWERTE.slice(1)) {
    assert.ok(eintrag.wert > vorher.wert, `Grad ${eintrag.cr}`);
    assert.ok(eintrag.tp > vorher.tp, `TP bei ${eintrag.cr}`);
    assert.ok(eintrag.schadenProRunde > vorher.schadenProRunde, `Schaden bei ${eintrag.cr}`);
    assert.ok(eintrag.rk >= vorher.rk, `RK bei ${eintrag.cr}`);
    assert.ok(eintrag.bonus >= vorher.bonus, `Bonus bei ${eintrag.cr}`);
    vorher = eintrag;
  }
});

test('die Trefferpunkt-Spanne schliesst den Mittelwert ein', () => {
  for (const eintrag of T.RICHTWERTE) {
    assert.ok(eintrag.tpVon <= eintrag.tp && eintrag.tp <= eintrag.tpBis, `CR ${eintrag.cr}`);
  }
});

test('einzelne Werte stimmen mit der Quelle ueberein', () => {
  // Stichproben quer durch die Tabelle. Wenn jemand sie neu einliest, faellt
  // hier auf, dass es eine andere Tabelle ist.
  assert.equal(T.richtwert('1').tp, 33);
  assert.equal(T.richtwert('5').schadenProRunde, 35);
  assert.equal(T.richtwert('8').tp, 136);
  assert.equal(T.richtwert('20').rk, 21);
  assert.equal(T.richtwert('30').tp, 666);
});

test('naechsterCr trifft den naechstgelegenen Grad', () => {
  assert.equal(T.naechsterCr(33, (e) => e.tp).cr, '1');
  assert.equal(T.naechsterCr(300, (e) => e.tp).cr, '20');
  // Weit ueber der Tabelle: der hoechste Grad, nicht undefined.
  assert.equal(T.naechsterCr(99999, (e) => e.tp).cr, '30');
});

test('stetigerCr vermittelt zwischen zwei Graden', () => {
  // Genau auf einem Eintrag: der Wert dieses Eintrags.
  assert.equal(T.stetigerCr(33, (e) => e.tp), 1);
  // Dazwischen: etwas dazwischen.
  const dazwischen = T.stetigerCr(39, (e) => e.tp);
  assert.ok(dazwischen > 1 && dazwischen < 2, `${dazwischen}`);
  // Unterhalb der Tabelle wird nicht extrapoliert.
  assert.equal(T.stetigerCr(1, (e) => e.tp), 0);
});
