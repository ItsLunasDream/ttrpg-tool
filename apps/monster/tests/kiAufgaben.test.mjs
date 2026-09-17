/**
 * Die KI-Anbindung.
 *
 * Der Kern ist nicht das Fragen, sondern was mit der Antwort passiert: die
 * Zahlen der KI werden nachgerechnet und nachgezogen, die eines Menschen
 * nicht. Und geaendert wird es nicht stillschweigend.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

test('die Systemanweisung gibt es zweisprachig und verlangt JSON', () => {
  for (const sprache of ['de', 'en']) {
    const a = T.systemAnweisung(sprache);
    assert.match(a, /JSON/);
    assert.ok(a.includes(String(T.MAX_ZEICHEN)));
  }
  assert.notEqual(T.systemAnweisung('de'), T.systemAnweisung('en'));
});

test('jede Aufgabe nennt ihre Schluessel in der Anfrage', () => {
  for (const aufgabe of T.KI_AUFGABEN) {
    const text = T.anweisung({ aufgabe, cr: '5' }, 'de');
    for (const feld of T.FELDER[aufgabe]) {
      assert.ok(text.includes(feld), `${aufgabe}: ${feld} fehlt`);
    }
  }
});

test('beim ganzen Monster gehen die Richtwerte mit', () => {
  /*
   * Nicht, weil die Antwort daran gebunden waere — sie wird ohnehin
   * nachgerechnet. Sondern damit sie nicht um den Faktor drei danebenliegt:
   * dann muesste so stark nachgezogen werden, dass vom Entwurf des Modells
   * nichts uebrig bliebe.
   */
  const text = T.anweisung({ aufgabe: 'monster', cr: '8' }, 'de');
  const ziel = T.richtwert('8');
  assert.ok(text.includes(String(ziel.tp)), 'Trefferpunkte fehlen');
  assert.ok(text.includes(String(ziel.schadenProRunde)), 'Schaden fehlt');
  // Die gewuenschte Zahl der Faehigkeiten haengt jetzt am Grad: auf Grad 8
  // sind es vier, nicht pauschal drei.
  assert.ok(/Liefere 4 Fähigkeiten/.test(text), 'die Zahl der Faehigkeiten fehlt');
  assert.ok(text.includes('kategorie'), 'der Abschnitt je Faehigkeit fehlt');
});

test('eine kaputte Antwort liefert nichts, statt zu werfen', () => {
  for (const muell of [null, 'nein', 42, {}, { name: '' }, { faehigkeiten: 'viele' }]) {
    assert.doesNotThrow(() => T.uebernehmbar('monster', muell));
  }
  assert.equal(T.uebernehmbar('monster', { beschreibung: 'ohne Namen' }), null);
});

test('zu viele Faehigkeiten werden abgeschnitten', () => {
  const roh = T.uebernehmbar('monster', {
    name: 'Testbrocken',
    faehigkeiten: Array.from({ length: 14 }, (_, i) => ({ name: `F${i}`, text: 'tut etwas' }))
  });
  // Acht ist die Obergrenze — so viele traegt auch ein Endgegner auf Grad 30.
  assert.equal(roh.faehigkeiten.length, 8);
});

test('ein erfundener Abschnitt wird zu „passiv"', () => {
  // Modelle schreiben hier gern „trait" oder „special".
  const roh = T.uebernehmbar('monster', {
    name: 'Testbrocken',
    faehigkeiten: [
      { name: 'A', text: 'x', kategorie: 'reaktion' },
      { name: 'B', text: 'x', kategorie: 'special' },
      { name: 'C', text: 'x' }
    ]
  });
  assert.deepEqual(roh.faehigkeiten.map((f) => f.kategorie), ['reaktion', 'passiv', 'passiv']);
});

test('die KI darf keine legendaeren Aktionen vergeben', () => {
  // Darueber entscheidet der Schalter, nicht das Modell.
  const roh = T.uebernehmbar('monster', {
    name: 'Testbrocken',
    faehigkeiten: [{ name: 'A', text: 'x', kategorie: 'legendaer' }]
  });
  assert.equal(roh.faehigkeiten[0].kategorie, 'passiv');
});

test('der eigene Wunsch steht ganz oben in der Anweisung', () => {
  const text = T.anweisung({ aufgabe: 'monster', cr: '5', wunsch: 'ein Sumpfhexer' }, 'de');
  assert.ok(text.startsWith('Gewünscht ist: ein Sumpfhexer'), text.slice(0, 60));
});

test('ohne Wunsch steht nichts davon in der Anweisung', () => {
  const text = T.anweisung({ aufgabe: 'monster', cr: '5' }, 'de');
  assert.ok(!text.includes('Gewünscht'));
});

test('zu lange Texte werden gekuerzt', () => {
  const roh = T.uebernehmbar('monster', { name: 'x'.repeat(5000) });
  assert.ok(roh.name.length <= T.MAX_ZEICHEN);
});

test('Zahlen der KI werden auf den Grad gezogen', () => {
  // Ein Modell, das viel zu hoch greift.
  const nachgezogen = T.zieheKiNach({ tp: 400, rk: 22, schadenProRunde: 130, angriffsbonus: 15 }, '5');
  assert.equal(nachgezogen.berichtigt, true);
  assert.equal(T.pruefe(nachgezogen.werte, '5').urteil, 'passt');
});

test('und was schon passt, bleibt unangetastet', () => {
  // Sonst kaeme aus jeder KI-Antwort dasselbe Monster.
  const ziel = T.richtwert('5');
  const eigen = { tp: 105, rk: 16, schadenProRunde: 33, angriffsbonus: 7 };
  const nachgezogen = T.zieheKiNach(eigen, '5');
  assert.equal(nachgezogen.berichtigt, false);
  assert.deepEqual(nachgezogen.werte, { ...eigen, legendaer: undefined });
  void ziel;
});

test('fehlende Zahlen kommen aus den Richtwerten', () => {
  // Ein Modell, das die Ruestungsklasse vergisst, soll nicht das ganze
  // Monster verhindern.
  const nachgezogen = T.zieheKiNach({ tp: 95 }, '5');
  const ziel = T.richtwert('5');
  assert.equal(nachgezogen.werte.rk, ziel.rk);
  assert.equal(nachgezogen.werte.angriffsbonus, ziel.bonus);
});

test('der Vorschlag der KI bleibt erhalten', () => {
  /*
   * Fuer den Knopf „zurueck zum Vorschlag" — vielleicht war die Abweichung
   * ja Absicht. Und fuer die Meldung, WAS sich um wie viel geaendert hat:
   * stillschweigend nachzuziehen waere bequem und falsch.
   */
  const roh = { tp: 400, rk: 22, schadenProRunde: 130, angriffsbonus: 15 };
  const nachgezogen = T.zieheKiNach(roh, '5');
  assert.equal(nachgezogen.vorschlagDerKi.tp, 400);
  assert.equal(nachgezogen.befundVorher.urteil, 'zu stark');
  assert.notEqual(nachgezogen.werte.tp, 400);
});
