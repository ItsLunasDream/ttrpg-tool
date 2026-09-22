/**
 * Die gemeinsamen Umgebungen.
 *
 * Die Pruefungen des Monster Creators laufen weiter dort und decken die
 * Auswahl nach Thema und Bewegung ab. Hier steht, was das Paket selbst
 * zusagt — vor allem der Teil, den es vorher nirgends gab: dass jede
 * Umgebung eine Regel hat, die am Tisch wirkt, und nicht bloss Stimmung.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const U = require('../dist/tests/entry.cjs');

test('jede Umgebung hat einen eindeutigen Namen in beiden Sprachen', () => {
  const ids = U.UMGEBUNGEN.map((u) => u.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const u of U.UMGEBUNGEN) {
    assert.ok(u.name.de.length > 0, u.id);
    assert.ok(u.name.en.length > 0, u.id);
    assert.notEqual(u.name.de, u.name.en, `${u.id}: nur eine Sprache eingetragen?`);
  }
});

test('jede Umgebung sagt, was man sieht', () => {
  for (const u of U.UMGEBUNGEN) {
    assert.ok(u.anblick.length >= 3, `${u.id}: nur ${u.anblick.length} Anblicke`);
    for (const zeile of u.anblick) {
      assert.ok(zeile.de.length > 10 && zeile.en.length > 10, u.id);
    }
  }
});

test('jede Umgebung hat mindestens eine Regel, die am Tisch wirkt', () => {
  for (const u of U.UMGEBUNGEN) {
    assert.ok(u.regeln.length >= 2, `${u.id}: nur ${u.regeln.length} Regeln`);
  }
});

test('die Regeln nennen Zahlen, nicht nur Stimmung', () => {
  /*
   * Der Grund fuer das ganze Paket. „Neblig" ist Deko; „Sicht hoechstens
   * 30 Fuss" ist eine Regel. Mindestens eine Regel je Umgebung muss eine
   * Zahl im Satz tragen.
   */
  const zahl = /\d/;
  for (const u of U.UMGEBUNGEN) {
    const mitZahl = u.regeln.filter((r) => zahl.test(r.wirkung.de) && zahl.test(r.wirkung.en));
    assert.ok(mitZahl.length >= 1, `${u.id}: keine Regel mit Zahl`);
  }
});

test('wo ein Wert steht, steht er auch im Satz', () => {
  // Sonst laufen die Zahl zum Rechnen und die Zahl zum Lesen auseinander.
  for (const u of U.UMGEBUNGEN) {
    for (const r of u.regeln) {
      if (r.wert === undefined) continue;
      assert.ok(
        r.wirkung.de.includes(String(r.wert)) || r.wirkung.en.includes(String(r.wert)),
        `${u.id}/${r.id}: Wert ${r.wert} steht in keinem Satz`
      );
    }
  }
});

test('wer schwimmt, landet nicht in der Wueste', () => {
  const rng = () => 0.5;
  for (const u of U.UMGEBUNGEN) {
    assert.equal(U.passtZurBewegung(u, { schwimmt: true }), u.wasser, u.id);
    assert.equal(U.passtZurBewegung(u, { graebt: true }), u.grabbar, u.id);
  }
  const nass = U.waehleUmgebung('bestie', { schwimmt: true }, rng);
  assert.equal(nass.wasser, true);
});

test('zu jedem Thema gibt es mehrere Umgebungen', () => {
  const themen = new Set(U.UMGEBUNGEN.flatMap((u) => u.themen ?? []));
  for (const thema of themen) {
    const passend = U.UMGEBUNGEN.filter((u) => U.passtZumThema(u, thema));
    assert.ok(passend.length >= 3, `${thema}: nur ${passend.length}`);
  }
});

test('die Auswahl findet immer etwas, auch bei unbekanntem Thema', () => {
  const u = U.waehleUmgebung('gibtesnicht', { schwimmt: true, graebt: true }, () => 0);
  assert.ok(u && u.id);
});

test('Anblick und Regeln kommen als Saetze in beiden Sprachen', () => {
  const wald = U.umgebungNach('wald');
  assert.ok(U.anblickzeilen(wald, 'de').every((z) => typeof z === 'string' && z.length > 0));
  assert.notDeepEqual(U.regelzeilen(wald, 'de'), U.regelzeilen(wald, 'en'));
});

test('jede Umgebung hat ein eigenes Zeichen und eine Farbe fuer die Kachel', () => {
  const zeichen = U.UMGEBUNGEN.map((u) => u.zeichen);
  assert.equal(new Set(zeichen).size, zeichen.length);
  for (const u of U.UMGEBUNGEN) {
    assert.ok(u.zeichen.length >= 1, u.id);
    assert.match(u.farbe, /^#[0-9a-f]{6}$/, u.id);
  }
});
