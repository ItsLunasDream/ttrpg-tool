import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {
  systemAnweisung,
  feldAnweisung,
  figurAnweisung,
  uebernehmbareFelder,
  uebernehmbarerWert,
  MAX_ZEICHEN,
  STANDARD_WUENSCHE,
  SPEZIES
} = entry;

const FIGUR = {
  name: 'Mara Talg',
  spezies: 'Zwergin',
  beruf: 'Köhlerin',
  aussehen: 'riecht nach kaltem Rauch',
  motivation: 'will den Bruder freikaufen',
  geheimnis: 'weiß, wem die Kohle wirklich gehört',
  eigenheit: ''
};

// --- Die Anweisung ----------------------------------------------------------

test('die Anweisung steht in der Sprache, in der gearbeitet wird', () => {
  assert.match(systemAnweisung('de'), /Pen-and-Paper/);
  assert.match(systemAnweisung('en'), /role-playing/);
  assert.doesNotMatch(systemAnweisung('en'), /Regeln:/);
});

test('die Laengenbegrenzung steht in der Anweisung und nicht nur im Code', () => {
  // Sonst kuerzt erst das Auswerten, und dann steht ein abgeschnittener Satz
  // im Feld statt eines kurzen.
  assert.match(systemAnweisung('de'), new RegExp(String(MAX_ZEICHEN)));
  assert.match(systemAnweisung('en'), new RegExp(String(MAX_ZEICHEN)));
});

test('die KI wird nicht auf die Tabellen festgelegt', () => {
  // Die ausdrueckliche Entscheidung: die Tabellen sind der Weg ohne KI, die
  // KI schlaegt frei vor. Waere sie an die Eintraege gebunden, waere sie ein
  // langsamer und teurer Wuerfel.
  const alle = [
    systemAnweisung('de'),
    systemAnweisung('en'),
    feldAnweisung('beruf', FIGUR, STANDARD_WUENSCHE, 'de'),
    figurAnweisung(null, [], STANDARD_WUENSCHE, 'de')
  ].join('\n');
  assert.doesNotMatch(alle, /wähle aus|choose from|aus dieser Liste|from this list/i);
});

test('beim Feldvorschlag geht die uebrige Figur als Umgebung mit', () => {
  // Ein Geheimnis soll zu der Figur passen, die schon dasteht.
  const anweisung = feldAnweisung('geheimnis', FIGUR, STANDARD_WUENSCHE, 'de');
  assert.match(anweisung, /Mara Talg/);
  assert.match(anweisung, /Köhlerin/);
  // Das gefragte Feld selbst nicht: es soll ersetzt werden, nicht bestaetigt.
  assert.doesNotMatch(anweisung, /wem die Kohle wirklich gehört/);
});

test('leere Felder stehen nicht als leere Zeilen in der Anweisung', () => {
  const anweisung = feldAnweisung('beruf', FIGUR, STANDARD_WUENSCHE, 'de');
  assert.doesNotMatch(anweisung, /Eigenheit:\s*$/m);
});

test('bei der Eigenheit wird ausdruecklich gebremst', () => {
  // Bei den Tabellen sorgt die Wahrscheinlichkeit dafuer, dass die meisten
  // Figuren keine Marotte haben. Hier muss es dastehen, sonst wird jede Figur
  // zur Karikatur.
  const anweisung = feldAnweisung('eigenheit', FIGUR, STANDARD_WUENSCHE, 'de');
  assert.match(anweisung, /Kleinigkeit|keine Schrulle/);
});

test('die Vorgaben gehen mit', () => {
  const wuensche = { archetyp: 'wache', klang: 'weiblich', spezies: 0 };
  const anweisung = figurAnweisung(null, [], wuensche, 'de');
  assert.match(anweisung, /weiblich/);
  assert.match(anweisung, new RegExp(SPEZIES[0].de));
  assert.match(anweisung, /Richtung:/);
});

test('festgehaltene Felder stehen als gesetzt in der Anweisung', () => {
  // Sonst waere das Schloss beim KI-Knopf wirkungslos, und das faellt erst
  // auf, wenn der gute Name weg ist.
  const anweisung = figurAnweisung(FIGUR, ['name', 'spezies'], STANDARD_WUENSCHE, 'de');
  assert.match(anweisung, /steht fest/);
  assert.match(anweisung, /Mara Talg/);
  // Und werden nicht mehr gefragt.
  assert.doesNotMatch(anweisung, /"name": "…"/);
  assert.match(anweisung, /"beruf": "…"/);
});

test('ein festgehaltenes, aber leeres Feld gilt nicht als gesetzt', () => {
  // Die Eigenheit ist meistens leer. "Das steht fest: Eigenheit: " waere eine
  // Vorgabe ohne Inhalt und wuerde das Feld dauerhaft leer halten.
  const anweisung = figurAnweisung(FIGUR, ['eigenheit'], STANDARD_WUENSCHE, 'de');
  assert.match(anweisung, /"eigenheit": "…"/);
});

// --- Das Auswerten ----------------------------------------------------------

test('bekannte Felder werden uebernommen, unbekannte fallen weg', () => {
  const gelesen = uebernehmbareFelder({ beruf: 'Salzhändlerin', unfug: 'weg damit', stufe: 5 });
  assert.deepEqual(gelesen, { beruf: 'Salzhändlerin' });
});

test('zu lange Werte werden gekuerzt', () => {
  // Ein Modell, das sich nicht an die Abmachung haelt, darf die Figur nicht
  // unlesbar machen.
  const lang = 'x'.repeat(MAX_ZEICHEN + 200);
  assert.equal(uebernehmbareFelder({ beruf: lang }).beruf.length, MAX_ZEICHEN);
});

test('Zeilenumbrueche werden zu Leerzeichen', () => {
  // Die Felder sind einzeilige Eingaben. Ein Umbruch darin waere unsichtbar
  // und trotzdem im Export.
  assert.equal(uebernehmbareFelder({ beruf: 'Wache\n  am Tor' }).beruf, 'Wache am Tor');
});

test('leer zaehlt nur bei der Eigenheit als Antwort', () => {
  // Bei ihr ist leer der Normalfall, bei allen anderen ist es keine Antwort.
  assert.deepEqual(uebernehmbareFelder({ eigenheit: '' }), { eigenheit: '' });
  assert.deepEqual(uebernehmbareFelder({ beruf: '   ' }), {});
});

test('was kein Text ist, zaehlt nicht', () => {
  assert.deepEqual(uebernehmbareFelder({ beruf: 42, name: null, spezies: ['a'] }), {});
  assert.deepEqual(uebernehmbareFelder(null), {});
  assert.deepEqual(uebernehmbareFelder('kaputt'), {});
});

test('ein einzelner Wert wird genauso behandelt', () => {
  assert.equal(uebernehmbarerWert({ wert: '  Fährfrau  ' }), 'Fährfrau');
  assert.equal(uebernehmbarerWert({ wert: 'y'.repeat(500) }).length, MAX_ZEICHEN);
  assert.equal(uebernehmbarerWert({ falsch: 'da' }), null);
  assert.equal(uebernehmbarerWert(null), null);
});
