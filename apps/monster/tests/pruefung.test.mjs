/**
 * Die Pruefung.
 *
 * Der Kern des Werkzeugs. Was hier falsch rechnet, gibt Sicherheit, wo keine
 * ist — und das ist schlimmer, als gar nicht zu pruefen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/** Ein Monster, das genau auf den Richtwerten eines Grades sitzt. */
function aufKurs(cr) {
  const r = T.richtwert(cr);
  return { tp: r.tp, rk: r.rk, schadenProRunde: r.schadenProRunde, angriffsbonus: r.bonus };
}

test('ein Monster auf den Richtwerten trifft seinen Grad', () => {
  for (const cr of ['1/4', '1', '5', '10', '17', '25']) {
    const befund = T.pruefe(aufKurs(cr), cr);
    assert.equal(befund.cr, cr, `CR ${cr} ergab ${befund.cr}`);
    assert.equal(befund.urteil, 'passt', `CR ${cr}`);
    assert.equal(befund.vorschlaege.length, 0, `CR ${cr} hat Vorschlaege, obwohl es passt`);
  }
});

test('zu viele Trefferpunkte heben den Verteidigungs-CR, nicht den Angriffs-CR', () => {
  const werte = { ...aufKurs('5'), tp: 300 };
  const befund = T.pruefe(werte, '5');
  assert.ok(Number(befund.verteidigung.cr) > 5, `Verteidigung blieb bei ${befund.verteidigung.cr}`);
  assert.equal(befund.angriff.cr, '5');
  assert.equal(befund.urteil, 'zu stark');
});

test('zu viel Schaden hebt den Angriffs-CR', () => {
  const werte = { ...aufKurs('5'), schadenProRunde: 90 };
  const befund = T.pruefe(werte, '5');
  assert.ok(Number(befund.angriff.cr) > 5, `Angriff blieb bei ${befund.angriff.cr}`);
  assert.equal(befund.verteidigung.cr, '5');
});

test('die beiden Haelften werden getrennt ausgewiesen', () => {
  /*
   * Der Fall, wegen dem es das Werkzeug gibt: ein Monster, das im Mittel
   * passt und trotzdem kaputt ist — es steckt wie ein schwaecheres ein und
   * teilt wie ein staerkeres aus. Der Mittelwert allein verschweigt das.
   */
  const befund = T.pruefe({ tp: 60, rk: 15, schadenProRunde: 70, angriffsbonus: 7 }, '5');
  assert.notEqual(befund.verteidigung.cr, befund.angriff.cr);
  assert.ok(!befund.verteidigung.passt || !befund.angriff.passt);
  assert.ok(befund.vorschlaege.length > 0);
});

test('die Vorschlaege nennen Feld, Ist und Soll', () => {
  const befund = T.pruefe({ ...aufKurs('5'), schadenProRunde: 90 }, '5');
  const schaden = befund.vorschlaege.find((v) => v.feld === 'schadenProRunde');
  assert.ok(schaden, 'kein Vorschlag zum Schaden');
  assert.equal(schaden.von, 90);
  assert.ok(schaden.auf < 90, 'der Vorschlag senkt nicht');
  assert.equal(schaden.grund, 'schadenZuHoch');
});

test('der Vorschlag zieht auf den Rand der Spanne, nicht auf die Mitte', () => {
  // Wer 300 Trefferpunkte wollte, ist mit dem oberen Rand zufriedener als
  // mit dem Mittelwert.
  const ziel = T.richtwert('5');
  const befund = T.pruefe({ ...aufKurs('5'), tp: 300 }, '5');
  const tp = befund.vorschlaege.find((v) => v.feld === 'tp');
  assert.equal(tp.auf, ziel.tpBis);
});

test('Ruestungsklasse und Angriffsbonus kommen nur zur Sprache, wenn sie weit danebenliegen', () => {
  const knapp = T.pruefe({ ...aufKurs('5'), rk: 17 }, '5');
  assert.ok(!knapp.vorschlaege.some((v) => v.feld === 'rk'), 'meckert schon bei zwei Punkten');
  const weit = T.pruefe({ ...aufKurs('5'), rk: 25 }, '5');
  assert.ok(weit.vorschlaege.some((v) => v.feld === 'rk'), 'schweigt bei zehn Punkten');
});

test('Resistenzen erhoehen die wirksamen Trefferpunkte, aber gedeckelt', () => {
  const ohne = T.pruefe(aufKurs('5'), '5');
  const mit = T.pruefe({ ...aufKurs('5'), resistenzen: 3 }, '5');
  assert.ok(mit.verteidigung.gemessen > ohne.verteidigung.gemessen);

  // Der Deckel: irgendwann trifft die Gruppe eben anders.
  const viele = T.pruefe({ ...aufKurs('5'), immunitaeten: 12 }, '5');
  const ziel = T.richtwert('5');
  assert.ok(viele.verteidigung.gemessen <= ziel.tp * 1.5 + 1, `${viele.verteidigung.gemessen}`);
});

test('legendaere Aktionen zaehlen als Faktor auf der Angriffsseite', () => {
  const ohne = T.pruefe(aufKurs('10'), '10');
  const mit = T.pruefe({ ...aufKurs('10'), legendaer: true }, '10');
  assert.ok(mit.angriff.gemessen > ohne.angriff.gemessen);
  assert.equal(mit.verteidigung.gemessen, ohne.verteidigung.gemessen);
});

test('zieheNach bringt ein zu starkes Monster auf den Ziel-CR', () => {
  const kaputt = { tp: 400, rk: 20, schadenProRunde: 120, angriffsbonus: 14 };
  const gezogen = T.zieheNach(kaputt, '5');
  const danach = T.pruefe(gezogen, '5');
  assert.equal(danach.urteil, 'passt', `nach dem Nachziehen: ${danach.cr}`);
});

test('zieheNach laesst stehen, was schon passt', () => {
  // Sonst kaeme aus jeder KI-Antwort dasselbe Monster mit denselben Zahlen.
  const eigen = { ...T.richtwert('5'), tp: 105, rk: 16, schadenProRunde: 33, angriffsbonus: 7 };
  const werte = { tp: eigen.tp, rk: eigen.rk, schadenProRunde: eigen.schadenProRunde, angriffsbonus: eigen.angriffsbonus };
  const gezogen = T.zieheNach(werte, '5');
  assert.deepEqual(gezogen, werte);
});

test('ein unbekannter Grad legt die Pruefung nicht lahm', () => {
  const befund = T.pruefe(aufKurs('5'), 'Katzenkoenig');
  assert.ok(befund.cr, 'kein Befund');
});
