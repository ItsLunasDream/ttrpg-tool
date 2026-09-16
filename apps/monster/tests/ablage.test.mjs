/**
 * Ablage und Suche.
 *
 * Der Kopf der Datei ist die Schnittstelle zum Encounter Creator: er muss
 * alle Zahlen tragen, damit niemand den Statblock zerlegen muss, um an den
 * Grad zu kommen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function wuerfelgeber(saat) {
  let z = saat >>> 0;
  return () => {
    z = (z * 1664525 + 1013904223) >>> 0;
    return z / 4294967296;
  };
}

function beispiel(teil = {}) {
  const m = T.erzeugeMonster({ cr: '6', themaId: 'untot', rolleId: 'brecher' }, 'de', wuerfelgeber(3));
  return { ...m, id: 'gruftwandler', geaendert: '2026-09-16T10:00:00.000Z', ...teil };
}

test('der Kopf traegt alle Zahlen fuer eine Begegnungsrechnung', () => {
  const kopf = T.liesKopf(T.alsMarkdown(beispiel(), 'de'));
  for (const feld of ['cr', 'tp', 'rk', 'schaden_pro_runde', 'angriffsbonus', 'angriffe', 'thema', 'rolle']) {
    assert.ok(kopf[feld] !== undefined && kopf[feld] !== '', `${feld} fehlt im Kopf`);
  }
});

test('der Kopf laesst sich lesen, ohne den Leib anzufassen', () => {
  const m = beispiel();
  const eintrag = T.alsEintrag(T.alsMarkdown(m, 'de'), 'rueckfall');
  assert.equal(eintrag.name, m.name);
  assert.equal(eintrag.cr, '6');
  assert.equal(eintrag.themaId, 'untot');
  assert.equal(eintrag.tp, m.werte.tp);
});

test('ein Name mit Sonderzeichen ueberlebt den Kopf', () => {
  // Doppelpunkte und Anfuehrungszeichen bringen einen naiven YAML-Leser aus
  // dem Tritt — und Monsternamen enthalten so etwas.
  for (const name of ['Grab: der Wächter', 'Der "Alte"', 'Nebel, Erster seines Namens', 'Öd']) {
    const eintrag = T.alsEintrag(T.alsMarkdown(beispiel({ name }), 'de'), 'x');
    assert.equal(eintrag.name, name);
  }
});

test('ein fehlender Kopf macht nichts kaputt', () => {
  const eintrag = T.alsEintrag('# Nur eine Ueberschrift\n\nText.', 'notfall');
  assert.equal(eintrag.id, 'notfall');
  assert.equal(eintrag.name, 'notfall');
});

test('der Statblock nennt Mehrfachangriffe nur, wenn es welche gibt', () => {
  const einer = T.alsMarkdown(beispiel({ angriffe: 1 }), 'de');
  const mehrere = T.alsMarkdown(beispiel({ angriffe: 3 }), 'de');
  assert.ok(!einer.includes('Mehrfachangriff'));
  assert.ok(mehrere.includes('Mehrfachangriff'));
});

test('zuId macht aus jedem Namen eine brauchbare Kennung', () => {
  assert.equal(T.zuId('Grabwandler'), 'grabwandler');
  assert.equal(T.zuId('Der Öde Fürst'), 'der-oede-fuerst');
  assert.equal(T.zuId('!!!'), 'monster');
});

/* ---------- Die Suche ---------- */

const SAMMLUNG = [
  { id: 'a', name: 'Grabwandler', cr: '4', themaId: 'untot', rolleId: 'brecher', tp: 84, rk: 14, geaendert: '2026-09-01' },
  { id: 'b', name: 'Eisenkoloss', cr: '9', themaId: 'konstrukt', rolleId: 'verteidiger', tp: 145, rk: 17, geaendert: '2026-09-10' },
  { id: 'c', name: 'Knochenchor', cr: '4', themaId: 'untot', rolleId: 'schuetze', tp: 70, rk: 13, geaendert: '2026-09-05' },
  { id: 'd', name: 'Nebelkind', cr: '1/2', themaId: 'fee', rolleId: 'lauerer', tp: 20, rk: 12, geaendert: '2026-09-12' }
];

const finde = (text) => T.finde(SAMMLUNG, { text }, 'cr', 'de').map((e) => e.id);

test('ein Wort sucht im Namen', () => {
  assert.deepEqual(finde('koloss'), ['b']);
});

test('ein Wort sucht auch im Thema', () => {
  assert.deepEqual(finde('untot').sort(), ['a', 'c']);
});

test('eine Zahl sucht den Grad', () => {
  assert.deepEqual(finde('4').sort(), ['a', 'c']);
  assert.deepEqual(finde('cr 9'), ['b']);
  assert.deepEqual(finde('1/2'), ['d']);
});

test('eine Spanne sucht mehrere Grade', () => {
  assert.deepEqual(finde('3-9').sort(), ['a', 'b', 'c']);
});

test('Wort und Zahl zusammen verengen, statt zu erweitern', () => {
  // Der Kern: „untot 4" heisst Untote MIT Grad 4 — nicht alles Untote plus
  // alles auf Grad 4.
  assert.deepEqual(finde('untot 4').sort(), ['a', 'c']);
  assert.deepEqual(finde('untot 9'), []);
});

test('leere Eingabe liefert alles', () => {
  assert.equal(finde('').length, SAMMLUNG.length);
});

test('die Filterleiste verengt zusaetzlich', () => {
  const nurSchuetzen = T.finde(SAMMLUNG, { text: 'untot', rolleId: 'schuetze' }, 'cr', 'de');
  assert.deepEqual(nurSchuetzen.map((e) => e.id), ['c']);
});

test('gesucht wird in beiden Sprachen', () => {
  // Auf Englisch gesucht, deutsch angelegt: muss trotzdem gefunden werden.
  assert.deepEqual(T.finde(SAMMLUNG, { text: 'undead' }, 'cr', 'en').map((e) => e.id).sort(), ['a', 'c']);
});

test('sortiert wird nach Grad, Name oder Datum', () => {
  assert.deepEqual(T.sortiere(SAMMLUNG, 'cr').map((e) => e.cr), ['1/2', '4', '4', '9']);
  assert.deepEqual(T.sortiere(SAMMLUNG, 'name').map((e) => e.name[0]), ['E', 'G', 'K', 'N']);
  assert.deepEqual(T.sortiere(SAMMLUNG, 'geaendert').map((e) => e.id), ['d', 'b', 'c', 'a']);
});

test('bei gleichem Grad entscheidet der Name, damit nichts springt', () => {
  const nachCr = T.sortiere(SAMMLUNG, 'cr').filter((e) => e.cr === '4').map((e) => e.name);
  assert.deepEqual(nachCr, ['Grabwandler', 'Knochenchor']);
});
