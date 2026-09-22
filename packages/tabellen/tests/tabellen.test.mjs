import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/** Ein Zufall, der der Reihe nach vorgegebene Werte liefert. */
const folge = (...werte) => {
  let i = 0;
  return () => werte[Math.min(i++, werte.length - 1)];
};

const TASCHENKRAM = {
  id: 't1',
  name: 'Taschenkram',
  eintraege: [{ text: 'Ein Kamm aus Knochen' }, { text: 'Drei Spielsteine' }]
};

test('ohne Spannen ist jeder Eintrag gleich wahrscheinlich', () => {
  assert.equal(T.waehle(TASCHENKRAM, folge(0)).eintrag.text, 'Ein Kamm aus Knochen');
  assert.equal(T.waehle(TASCHENKRAM, folge(0.99)).eintrag.text, 'Drei Spielsteine');
});

test('mit Spannen entscheidet der Wuerfel der Tabelle', () => {
  const bande = {
    id: 'b',
    name: 'Bande',
    wuerfel: '1d6',
    eintraege: [
      { von: 1, bis: 3, text: 'Kupfer' },
      { von: 4, bis: 5, text: 'Silber' },
      { von: 6, text: 'Gold' }
    ]
  };
  // 1d6: rng 0 -> 1, rng 0.99 -> 6
  assert.equal(T.waehle(bande, folge(0)).eintrag.text, 'Kupfer');
  assert.equal(T.waehle(bande, folge(0.99)).eintrag.text, 'Gold');
  assert.equal(T.waehle(bande, folge(0.99)).wurf, 6);
});

test('ein Loch in der Tabelle faengt der naechstkleinere Eintrag auf', () => {
  // Eine lueckenhafte Tabelle ist ein Versehen beim Schreiben und soll am
  // Tisch trotzdem etwas ausspucken, statt gar nichts.
  const loch = {
    id: 'l',
    name: 'Loch',
    wuerfel: '1d6',
    eintraege: [{ von: 1, bis: 2, text: 'A' }, { von: 5, bis: 6, text: 'B' }]
  };
  assert.equal(T.waehle(loch, folge(0.5)).eintrag.text, 'A'); // Wurf 4
});

test('Wuerfel im Text werden ausgerechnet, mit Faktor', () => {
  // 2d6 bei rng 0 -> 1+1 = 2, mal zehn.
  assert.equal(T.setzeWuerfel('2d6 × 10 Kupfer', folge(0)), '20 Kupfer');
  assert.equal(T.setzeWuerfel('1d4 Pfeile', folge(0)), '1 Pfeile');
});

test('was kein Wuerfelausdruck ist, bleibt stehen', () => {
  assert.equal(T.setzeWuerfel('Ein Kamm aus Knochen', folge(0)), 'Ein Kamm aus Knochen');
});

test('ein Verweis wird durch das Ergebnis der anderen Tabelle ersetzt', () => {
  const bande = {
    id: 'b',
    name: 'Bande',
    eintraege: [{ text: 'In der Tasche: [Taschenkram]' }]
  };
  const ergebnis = T.wuerfle(bande, [bande, TASCHENKRAM], folge(0));
  assert.equal(ergebnis.text, 'In der Tasche: Ein Kamm aus Knochen');
  assert.equal(ergebnis.teile.length, 1);
  assert.equal(ergebnis.teile[0].tabelle, 'Taschenkram');
});

test('ein Verweis ins Leere bricht nichts ab', () => {
  // Eine Tabelle wird umbenannt, der Verweis bleibt stehen. Am Tisch ist ein
  // unvollstaendiges Ergebnis brauchbar, eine Fehlermeldung nicht.
  const bande = { id: 'b', name: 'Bande', eintraege: [{ text: 'Gold und [Gibtsnicht]' }] };
  const ergebnis = T.wuerfle(bande, [bande], folge(0));
  assert.match(ergebnis.text, /Gold und \[Gibtsnicht\]/);
  assert.equal(ergebnis.teile[0].fehler, 'fehlt');
});

test('ein Kreis haengt nicht, sondern bricht sichtbar ab', () => {
  const a = { id: 'a', name: 'A', eintraege: [{ text: 'a[B]' }] };
  const b = { id: 'b', name: 'B', eintraege: [{ text: 'b[A]' }] };
  const ergebnis = T.wuerfle(a, [a, b], folge(0));
  // Kein Absturz, kein Haenger — und irgendwo steht, dass abgebrochen wurde.
  const tief = JSON.stringify(ergebnis);
  assert.match(tief, /zu-tief/);
});

test('die Verschachtelung geht nicht tiefer als der Deckel', () => {
  const a = { id: 'a', name: 'A', eintraege: [{ text: '[A]' }] };
  let ebenen = 0;
  let knoten = T.wuerfle(a, [a], folge(0));
  while (knoten.teile.length > 0) {
    ebenen += 1;
    knoten = knoten.teile[0];
  }
  assert.ok(ebenen <= T.TIEFE_DECKEL, `${ebenen} Ebenen`);
});

test('Gross- und Kleinschreibung und Umlaute stoeren beim Verweis nicht', () => {
  const ziel = { id: 'z', name: 'Kälte', eintraege: [{ text: 'Frost' }] };
  const quelle = { id: 'q', name: 'Q', eintraege: [{ text: '[kälte]' }] };
  assert.equal(T.wuerfle(quelle, [quelle, ziel], folge(0)).text, 'Frost');
  assert.equal(T.finde([ziel], 'KAELTE'.toLowerCase()), null);
  assert.equal(T.finde([ziel], 'Kälte'), ziel);
});

test('lose Enden lassen sich vor dem Wuerfeln finden', () => {
  const a = { id: 'a', name: 'A', eintraege: [{ text: '[B]' }, { text: '[Weg]' }] };
  const b = { id: 'b', name: 'B', eintraege: [{ text: 'x' }] };
  const lose = T.loseEnden([a, b]);
  assert.equal(lose.length, 1);
  assert.equal(lose[0].verweis, 'Weg');
});

test('eine leere Tabelle liefert nichts, statt zu werfen', () => {
  const leer = { id: 'l', name: 'Leer', eintraege: [] };
  assert.equal(T.wuerfle(leer, [leer], folge(0)).text, '');
});
