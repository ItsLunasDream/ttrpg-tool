import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function wuerfelgeber(saat = 1) {
  let zustand = saat >>> 0;
  return () => {
    zustand += 0x6d2b79f5;
    let x = zustand;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const ENTWURF = T.erzeugeEntwurf(
  { ...T.STANDARD_ZUSCHNITT, umfang: 'kampagne' },
  'de',
  wuerfelgeber(5)
);

test('jede Figur bekommt einen Punkt, und keiner faellt aus dem Rahmen', () => {
  const geflecht = T.berechneGeflecht(ENTWURF.figuren, ENTWURF.verbindungen);
  assert.equal(geflecht.knoten.length, ENTWURF.figuren.length);
  for (const knoten of geflecht.knoten) {
    assert.ok(Number.isFinite(knoten.x) && Number.isFinite(knoten.y), knoten.name);
    assert.ok(knoten.x >= 0 && knoten.x <= geflecht.breite, `${knoten.name}: x=${knoten.x}`);
    assert.ok(knoten.y >= 0 && knoten.y <= geflecht.hoehe, `${knoten.name}: y=${knoten.y}`);
  }
});

test('die Punkte liegen auf einem Kreis, der erste oben', () => {
  const geflecht = T.berechneGeflecht(ENTWURF.figuren, ENTWURF.verbindungen);
  const mitteX = geflecht.breite / 2;
  const mitteY = geflecht.hoehe / 2;
  const abstand = (k) => Math.hypot(k.x - mitteX, k.y - mitteY);
  const erster = abstand(geflecht.knoten[0]);
  for (const knoten of geflecht.knoten) {
    assert.ok(Math.abs(abstand(knoten) - erster) < 0.001, knoten.name);
  }
  // Oben heisst: gleiche x-Mitte, kleineres y.
  assert.ok(Math.abs(geflecht.knoten[0].x - mitteX) < 0.001);
  assert.ok(geflecht.knoten[0].y < mitteY);
});

test('die Linien enden am Rand der Punkte, nicht in ihrer Mitte', () => {
  // Sonst verschwindet die Pfeilspitze unter dem Punkt — und mit ihr die
  // Richtung, die bei diesen Beziehungen der ganze Witz ist.
  const geflecht = T.berechneGeflecht(ENTWURF.figuren, ENTWURF.verbindungen);
  for (const kante of geflecht.kanten) {
    const a = geflecht.knoten[kante.von];
    const b = geflecht.knoten[kante.nach];
    const anfang = Math.hypot(kante.x1 - a.x, kante.y1 - a.y);
    const ende = Math.hypot(kante.x2 - b.x, kante.y2 - b.y);
    assert.ok(Math.abs(anfang - T.KNOTEN_RADIUS) < 0.001, `Anfang ${anfang}`);
    assert.ok(ende >= T.KNOTEN_RADIUS, `Ende ${ende}`);
  }
});

test('jede Verbindung wird gezeichnet und traegt ihren Namen', () => {
  const geflecht = T.berechneGeflecht(ENTWURF.figuren, ENTWURF.verbindungen);
  assert.equal(geflecht.kanten.length, ENTWURF.verbindungen.length);
  for (const [i, kante] of geflecht.kanten.entries()) {
    assert.equal(kante.muster, ENTWURF.verbindungen[i].muster);
  }
});

test('eine Verbindung ins Leere wird weggelassen, statt ins Nichts zu zeigen', () => {
  const kaputt = [...ENTWURF.verbindungen, { a: 0, b: 99, muster: 'X', hin: '', zurueck: '' }];
  const geflecht = T.berechneGeflecht(ENTWURF.figuren, kaputt);
  assert.equal(geflecht.kanten.length, ENTWURF.verbindungen.length);
});

test('ohne Figuren gibt es ein leeres Bild und keinen Absturz', () => {
  const leer = T.berechneGeflecht([], []);
  assert.deepEqual(leer.knoten, []);
  assert.deepEqual(leer.kanten, []);
});

test('eine einzelne Figur steht in der Mitte', () => {
  const geflecht = T.berechneGeflecht([ENTWURF.figuren[0]], []);
  assert.equal(geflecht.knoten[0].x, geflecht.breite / 2);
  assert.equal(geflecht.knoten[0].y, geflecht.hoehe / 2);
});

test('dasselbe Geflecht ergibt dasselbe Bild', () => {
  // Kein Zufall im Layout: wer zweimal hinsieht, soll nicht suchen muessen.
  assert.deepEqual(
    T.berechneGeflecht(ENTWURF.figuren, ENTWURF.verbindungen),
    T.berechneGeflecht(ENTWURF.figuren, ENTWURF.verbindungen)
  );
});

test('die Namen stehen aussen und wechseln die Seite mit dem Punkt', () => {
  const geflecht = T.berechneGeflecht(ENTWURF.figuren, ENTWURF.verbindungen);
  for (const knoten of geflecht.knoten) {
    const wo = T.beschriftung(knoten, geflecht);
    const nachAussen = Math.hypot(wo.x - geflecht.breite / 2, wo.y - geflecht.hoehe / 2);
    const punkt = Math.hypot(knoten.x - geflecht.breite / 2, knoten.y - geflecht.hoehe / 2);
    assert.ok(nachAussen >= punkt - 1, `${knoten.name} steht nach innen`);
    if (knoten.x > geflecht.breite / 2 + 12) assert.equal(wo.anker, 'start');
    if (knoten.x < geflecht.breite / 2 - 12) assert.equal(wo.anker, 'end');
  }
});

test('eine Figur aus der Kampagne ist im Bild als solche erkennbar', () => {
  const figuren = [
    { ...ENTWURF.figuren[0], vorhanden: true },
    ENTWURF.figuren[1]
  ];
  const geflecht = T.berechneGeflecht(figuren, []);
  assert.equal(geflecht.knoten[0].vorhanden, true);
  assert.equal(geflecht.knoten[1].vorhanden, false);
});
