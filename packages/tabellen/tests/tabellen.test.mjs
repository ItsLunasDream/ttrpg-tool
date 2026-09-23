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
  assert.match(tief, /kreis|zu-tief/);
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

test('ohne Zuruecklegen kommt in einer Reihe kein Eintrag doppelt, bis alle dran waren', () => {
  const gaeste = {
    id: 'g',
    name: 'Gaeste',
    ohneZuruecklegen: true,
    eintraege: [{ text: 'A' }, { text: 'B' }, { text: 'C' }]
  };
  // Der Zufall liefert immer 0: mit Zuruecklegen waere das dreimal A.
  const reihe = T.wuerfleReihe(gaeste, [gaeste], 4, () => 0).map((e) => e.text);
  assert.deepEqual(reihe.slice(0, 3).sort(), ['A', 'B', 'C']);
  assert.equal(reihe.length, 4, 'erschoepft beginnt die Tabelle von vorn');
});

test('mit Zuruecklegen darf sich eine Reihe wiederholen', () => {
  const reihe = T.wuerfleReihe(TASCHENKRAM, [TASCHENKRAM], 3, () => 0).map((e) => e.text);
  assert.deepEqual(reihe, ['Ein Kamm aus Knochen', 'Ein Kamm aus Knochen', 'Ein Kamm aus Knochen']);
});

test('ohne Zuruecklegen gilt auch fuer verwiesene Tabellen', () => {
  const kram = { ...TASCHENKRAM, ohneZuruecklegen: true };
  const bande = { id: 'b', name: 'Bande', eintraege: [{ text: '[Taschenkram]' }] };
  const reihe = T.wuerfleReihe(bande, [bande, kram], 2, () => 0).map((e) => e.text);
  assert.deepEqual(reihe.sort(), ['Drei Spielsteine', 'Ein Kamm aus Knochen']);
});

test('ohne Zuruecklegen haelt die Gewichtung der Spannen', () => {
  const t = {
    id: 'w',
    name: 'W',
    wuerfel: '1d4',
    ohneZuruecklegen: true,
    eintraege: [{ text: 'X', von: 1, bis: 3 }, { text: 'Y', von: 4 }, { text: 'Z', von: 5, bis: 6 }]
  };
  // Erster Wurf trifft Y (Wuerfel 4), danach bleiben X (3) und Z (2): 0,5 * 5 = 2,5 < 3 -> X.
  const reihe = T.wuerfleReihe(t, [t], 2, T && ((werte) => { let i = 0; return () => werte[i++]; })([0.75, 0.5])).map((e) => e.text);
  assert.deepEqual(reihe, ['Y', 'X']);
});

test('die deutsche Schreibweise 2W6 wird gewuerfelt wie 2d6', () => {
  assert.equal(T.setzeWuerfel('2W6 Silber', () => 0), '2 Silber');
  const t = { id: 'w', name: 'W', wuerfel: '1W4', eintraege: [{ text: 'A', von: 1, bis: 2 }, { text: 'B', von: 3, bis: 4 }] };
  assert.equal(T.wuerfle(t, [t], () => 0.99).text, 'B');
  // Ein Wort mit w bleibt ein Wort.
  assert.equal(T.setzeWuerfel('Schwert', () => 0), 'Schwert');
});

// --- Testbericht: Kreise, Explosionen, Wuerfel in Verweisen, Maskieren ---

function zaehler(werte) {
  let i = 0;
  return () => werte[i++ % werte.length];
}

test('ein Kreis A -> B -> A wird erkannt und bleibt schnell', () => {
  const a = { id: 'a', name: 'A', eintraege: [{ text: '[B] [B] [B] [B]' }] };
  const b = { id: 'b', name: 'B', eintraege: [{ text: '[A] [A] [A] [A]' }] };
  const start = Date.now();
  const e = T.wuerfle(a, [a, b], Math.random);
  assert.ok(Date.now() - start < 500, 'kein Haenger');
  assert.equal(e.teile.length, 4);
  assert.ok(e.teile[0].teile.every((t) => t.fehler === 'kreis'));
});

test('eine Explosion wird beim Budget abgeschnitten und vermerkt', () => {
  const boom = { id: 'boom', name: 'Boom', eintraege: [{ text: '[Leaf] [Leaf] [Leaf] [Leaf] [Leaf] [Leaf]' }] };
  const leaf = { id: 'leaf', name: 'Leaf', eintraege: [{ text: 'x' }] };
  const wurzel = { id: 'w', name: 'W', eintraege: [{ text: Array(80).fill('[Boom]').join(' ') }] };
  const e = T.wuerfle(wurzel, [wurzel, boom, leaf], Math.random);
  const alle = [];
  const sammle = (x) => { alle.push(x); x.teile.forEach(sammle); };
  sammle(e);
  assert.ok(alle.length <= T.WURF_DECKEL + 200);
  assert.ok(alle.some((x) => x.fehler === 'zu-viel'));
});

test('Wuerfel im Verweisnamen bleiben stehen, eingesetzte Ergebnisse werden nicht erneut gewuerfelt', () => {
  const trinkets = { id: 't', name: 'd100 Trinkets', eintraege: [{ text: 'a 2d4 thing' }] };
  const ring = { id: 'r', name: 'R', eintraege: [{ text: 'see [d100 Trinkets] and 1d4 gold' }] };
  const e = T.wuerfle(ring, [ring, trinkets], zaehler([0.5]));
  assert.equal(e.teile[0].fehler, undefined);
  assert.match(e.text, /^see a \d thing and [1-4] gold$/);
});

test('mit Backslash maskiert bleibt Text woertlich; woertlich() maskiert Namen', () => {
  const t = { id: 'x', name: 'X', eintraege: [{ text: '\\[kein Verweis\\] und 2\\d4' }] };
  assert.equal(T.wuerfle(t, [t], Math.random).text, '[kein Verweis] und 2d4');
  const name = T.woertlich('Ring of 2d4 Wishes [rare]');
  const u = { id: 'u', name: 'U', eintraege: [{ text: name }] };
  assert.equal(T.wuerfle(u, [u], Math.random).text, 'Ring of 2d4 Wishes [rare]');
});

test('ohne Zuruecklegen behaelt die Verteilung des Wuerfels', () => {
  const eintraege = [];
  for (let z = 2; z <= 12; z += 1) eintraege.push({ text: String(z), von: z, bis: z });
  const t = { id: 'z', name: 'Z', wuerfel: '2d6', eintraege, ohneZuruecklegen: true };
  let sieben = 0;
  let zwei = 0;
  for (let i = 0; i < 3000; i += 1) {
    const gezogen = new Map([['z', new Set([0])]]); // die 2 ist gezogen
    const w = T.waehle(t, Math.random, gezogen.get('z'));
    if (w.eintrag.text === '7') sieben += 1;
    if (w.eintrag.text === '3') zwei += 1;
  }
  assert.ok(sieben > zwei * 2, `7 (${sieben}) bleibt deutlich haeufiger als 3 (${zwei})`);
});
