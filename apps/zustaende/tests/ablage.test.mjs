/**
 * Ablage, Suche und die KI-Antworten.
 *
 * Der Kopf der Datei ist die Schnittstelle zum Initiative Tracker: er muss
 * Zeichen, Farbe und Stufenzahl tragen, damit der Tracker einen eigenen
 * Zustand anzeigen kann, ohne den Leib zu lesen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function wuerfelgeber(saat) {
  let z = saat >>> 0;
  const zieh = () => {
    z = (z * 1664525 + 1013904223) >>> 0;
    return z / 4294967296;
  };
  for (let i = 0; i < 5; i += 1) zieh();
  return zieh;
}

function beispiel(teil = {}) {
  const z = T.erzeugeZustand({ themaId: 'kaelte', artId: 'umgebung', stufen: 5 }, 'de', wuerfelgeber(3));
  return { ...z, id: 'klammfrost', geaendert: '2026-09-17T10:00:00.000Z', ...teil };
}

/* ---------- Die Datei ---------- */

test('der Kopf traegt alles, was der Tracker braucht', () => {
  const kopf = T.liesKopf(T.alsMarkdown(beispiel(), 'de'));
  for (const feld of ['id', 'name', 'art', 'thema', 'haerte', 'stufen', 'gewicht', 'zeichen', 'farbe', 'dauer']) {
    assert.ok(kopf[feld] !== undefined, `${feld} fehlt`);
  }
});

test('der Leib nennt jede Stufe mit ihrer Nummer', () => {
  const md = T.alsMarkdown(beispiel(), 'de');
  for (let nummer = 1; nummer <= 5; nummer += 1) {
    assert.ok(md.includes(`${nummer}. `), `Stufe ${nummer} fehlt`);
  }
});

test('das Gewicht steht nie ohne seinen Vergleich da', () => {
  // „Wiegt 43" sagt niemandem etwas.
  const md = T.alsMarkdown(beispiel(), 'de');
  assert.match(md, /Gewicht: \d+ — etwa so viel wie .+\./);
});

test('ein Segen bekommt keinen Eichvergleich', () => {
  /*
   * Die Eichzustaende sind samt und sonders Fluesche. „So viel wie
   * Erschoepfung 1" neben einem Zustand, der GIBT, vergleicht zwei Dinge,
   * die nichts miteinander zu tun haben — und genau so stand es in der
   * Oberflaeche.
   */
  const segen = T.erzeugeZustand(
    { themaId: 'licht', artId: 'segen', wirkrichtung: 'buff', stufen: 3 },
    'de',
    wuerfelgeber(9)
  );
  assert.ok(T.gesamtgewicht(segen.stufen) < 0, 'der Testzustand ist gar kein Segen');

  const md = T.alsMarkdown({ ...segen, id: 'segen', geaendert: '2026-09-17T10:00:00.000Z' }, 'de');
  assert.match(md, /kein Vergleich/);
  assert.doesNotMatch(md, /etwa so viel wie/);

  // Ein Fluch behaelt seinen Vergleich.
  assert.match(T.alsMarkdown(beispiel(), 'de'), /etwa so viel wie/);
});

test('und mit dem Satz, was es NICHT bedeutet', () => {
  const md = T.alsMarkdown(beispiel(), 'de');
  assert.ok(md.includes('wie oft man ihn bekommt'), 'der einschraenkende Satz fehlt');
});

test('ein Zustand ohne Stufen bekommt keine Stufenliste', () => {
  const md = T.alsMarkdown(beispiel({ stufen: [{ nummer: 1, wirkungen: ['bewegung-halbiert'] }] }), 'de');
  assert.ok(!md.includes('## Stufen'));
  assert.ok(md.includes('**Wirkung**'));
});

test('ohne Ausloeser steht keine Ausloeser-Zeile da', () => {
  const md = T.alsMarkdown(beispiel({ ausloeser: '' }), 'de');
  assert.ok(!md.includes('Ausgelöst'));
});

test('der Kopf ueberlebt den Rundlauf', () => {
  const vorher = beispiel();
  const eintrag = T.alsEintrag(T.alsMarkdown(vorher, 'de'), 'rueckfall');
  assert.equal(eintrag.name, vorher.name);
  assert.equal(eintrag.themaId, 'kaelte');
  assert.equal(eintrag.stufen, 5);
  assert.equal(eintrag.zeichen, vorher.zeichen);
});

test('ein Name mit Sonderzeichen bleibt heil', () => {
  const md = T.alsMarkdown(beispiel({ name: 'Klamm: der „Frost"' }), 'de');
  assert.equal(T.alsEintrag(md, 'x').name, 'Klamm: der „Frost"');
});

test('aus einem Namen wird eine brauchbare Dateikennung', () => {
  assert.equal(T.zuId('Klammfrost'), 'klammfrost');
  assert.equal(T.zuId('Der lange Fall'), 'der-lange-fall');
  assert.equal(T.zuId('Grüße & Küsse'), 'gruesse-kuesse');
  assert.equal(T.zuId('***'), 'zustand');
});

/* ---------- Die Suche ---------- */

function eintrag(teil) {
  return {
    id: 'x', name: 'Namenlos', artId: 'umgebung', themaId: 'kaelte', haerteId: 'ernst',
    stufen: 5, gewicht: 12, zeichen: '❄', farbe: '#6aa9e9',
    geaendert: '2026-09-17T10:00:00.000Z', ...teil
  };
}

const SAMMLUNG = [
  eintrag({ id: 'a', name: 'Klammfrost', themaId: 'kaelte', artId: 'umgebung', stufen: 5, gewicht: 12 }),
  eintrag({ id: 'b', name: 'Sonnenstich', themaId: 'hitze', artId: 'umgebung', stufen: 3, gewicht: 6 }),
  eintrag({ id: 'c', name: 'Schwarzbrand', themaId: 'faeulnis', artId: 'krankheit', stufen: 3, gewicht: 20 }),
  eintrag({ id: 'd', name: 'Zählzwang', themaId: 'wahnsinn', artId: 'fluch', stufen: 1, gewicht: 4 })
];

const namen = (anfrage, nach = 'name') => T.finde(SAMMLUNG, anfrage, nach, 'de').map((e) => e.name);

test('ein Wort findet Name, Art und Thema', () => {
  assert.deepEqual(namen({ text: 'klamm' }), ['Klammfrost']);
  assert.deepEqual(namen({ text: 'fluch' }), ['Zählzwang']);
  assert.deepEqual(namen({ text: 'hitze' }), ['Sonnenstich']);
});

test('„3 stufen" sucht die Stufenzahl', () => {
  assert.deepEqual(namen({ text: '3 stufen' }), ['Schwarzbrand', 'Sonnenstich']);
});

test('eine Zahl ohne das Wort „Stufen" sucht nichts Besonderes', () => {
  // Sonst wuerde „5" jeden Zustand mit Gewicht 5 UND fuenf Stufen finden,
  // und niemand wuesste, was gemeint war.
  assert.deepEqual(namen({ text: '3' }), []);
});

test('zwei Woerter heissen UND', () => {
  assert.deepEqual(namen({ text: 'umgebung kaelte' }), ['Klammfrost']);
});

test('die Filterleiste schneidet zusaetzlich zu', () => {
  assert.deepEqual(namen({ text: '', artId: 'umgebung' }), ['Klammfrost', 'Sonnenstich']);
});

test('nach Gewicht sortiert steigt es', () => {
  assert.deepEqual(namen({ text: '' }, 'gewicht'), ['Zählzwang', 'Sonnenstich', 'Klammfrost', 'Schwarzbrand']);
});

test('ein Segen mit negativem Gewicht sortiert nach seinem Betrag', () => {
  const liste = [eintrag({ name: 'Segen', gewicht: -18 }), eintrag({ name: 'Fluch', gewicht: 4 })];
  assert.deepEqual(T.sortiere(liste, 'gewicht').map((e) => e.name), ['Fluch', 'Segen']);
});

/* ---------- Die KI ---------- */

test('eine Antwort ohne Stufen wird beanstandet', () => {
  const befund = T.pruefeKiAntwort({ name: 'X', kurzsatz: '', stufen: [], verschlimmerung: '', linderung: '' });
  assert.equal(befund.ok, false);
  assert.ok(befund.gruende.includes('kiFehler.keineStufen'));
});

test('eine Luecke in der Nummerierung wird beanstandet', () => {
  const befund = T.pruefeKiAntwort({
    name: 'X', kurzsatz: '', verschlimmerung: '', linderung: '',
    stufen: [{ nummer: 1, text: 'a' }, { nummer: 3, text: 'b' }]
  });
  assert.ok(befund.gruende.includes('kiFehler.stufenLuecke'));
});

test('dieselbe Stufe zweimal wird beanstandet', () => {
  const befund = T.pruefeKiAntwort({
    name: 'X', kurzsatz: '', verschlimmerung: '', linderung: '',
    stufen: [{ nummer: 1, text: 'Nachteil auf Angriffe' }, { nummer: 2, text: 'nachteil auf angriffe' }]
  });
  assert.ok(befund.gruende.includes('kiFehler.stufeDoppelt'));
});

test('ein Absatz statt eines Stichpunkts wird beanstandet', () => {
  const befund = T.pruefeKiAntwort({
    name: 'X', kurzsatz: '', verschlimmerung: '', linderung: '',
    stufen: [{ nummer: 1, text: 'x'.repeat(200) }]
  });
  assert.ok(befund.gruende.includes('kiFehler.zuLang'));
});

test('eine saubere Antwort geht durch', () => {
  const befund = T.pruefeKiAntwort({
    name: 'X', kurzsatz: '', verschlimmerung: '', linderung: '',
    stufen: [{ nummer: 1, text: 'Nachteil auf Wahrnehmung' }, { nummer: 2, text: 'Bewegungsrate halbiert' }]
  });
  assert.equal(befund.ok, true);
  assert.deepEqual(befund.gruende, []);
});

test('was die KI auslaesst, fuellen die Tabellen auf', () => {
  const entwurf = T.erzeugeZustand({ themaId: 'kaelte' }, 'de', wuerfelgeber(2));
  const { zustand } = T.zieheKiNach(
    { name: 'Eisatem', kurzsatz: '', stufen: [], verschlimmerung: '', linderung: '' },
    entwurf
  );
  assert.equal(zustand.name, 'Eisatem');
  assert.equal(zustand.kurzsatz, entwurf.kurzsatz, 'der Kurzsatz wurde nicht aufgefuellt');
  assert.equal(zustand.linderung, entwurf.linderung);
});

test('der eigene Wunsch steht ganz oben in der Anweisung', () => {
  const text = T.anweisung({ aufgabe: 'zustand', wunsch: 'eine Zeitkrankheit' }, 'de');
  assert.ok(text.startsWith('Gewünscht ist: eine Zeitkrankheit'), text.slice(0, 50));
});

test('die Anweisung zeigt, wie kurz eine Stufe sein soll', () => {
  const text = T.anweisung({ aufgabe: 'zustand', stufen: 3 }, 'de');
  assert.ok(text.includes('So kurz sollen die Stufen sein'), 'die Beispiele fehlen');
  assert.ok(text.includes('schlimmer als die davor'), 'die Regel fehlt');
});

test('das geschaetzte Gewicht erkennt bekannte Wirkungen wieder', () => {
  const wenig = T.geschaetztesGewicht([{ nummer: 1, text: 'Nachteil auf Wahrnehmung' }], 'de');
  const viel = T.geschaetztesGewicht([{ nummer: 1, text: 'Du bist bewusstlos' }], 'de');
  assert.ok(viel > wenig, `${viel} nicht groesser als ${wenig}`);
});

test('unbekannter Text zaehlt als eine leichte Wirkung', () => {
  assert.equal(T.geschaetztesGewicht([{ nummer: 1, text: 'Dir wird komisch zumute' }], 'de'), 1);
});
