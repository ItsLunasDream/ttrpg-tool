/**
 * Die themeneigenen Wirkungen und die konkreten Zahlen.
 *
 * Zwei Dinge sind hier zu pruefen, und beide waren vorher kaputt oder gar
 * nicht da:
 *
 *   1. Ein Thema muss eigene Wirkungen haben, sonst unterscheiden sich zwei
 *      Zustaende nur im Namen. Und eine themengebundene Wirkung darf NIE in
 *      einem fremden Thema landen — sonst brennt jemand an einem Zustand
 *      aus Kaelte.
 *   2. Die Texte muessen Zahlen nennen. „Weniger Schaden" ist keine Wirkung,
 *      sondern eine Absicht.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/*
 * Der Wuerfelgeber braucht seinen Anlauf.
 *
 * Der erste Wurf dieses Generators haengt fast linear an der Saat; ohne die
 * fuenf Leerwuerfe liefern alle Saaten dasselbe Ergebnis, und der Test
 * prueft dann genau einen Fall statt vierzig.
 */
function wuerfelgeber(saat) {
  let wert = saat;
  const naechster = () => {
    wert = (wert * 1103515245 + 12345) % 2147483648;
    return wert / 2147483648;
  };
  for (let i = 0; i < 5; i += 1) naechster();
  return naechster;
}

/* ---------- Die Themen und ihre eigenen Wirkungen ---------- */

test('jedes Thema hat eigene Wirkungen, nicht nur allgemeine', () => {
  for (const thema of T.THEMEN) {
    const eigene = T.eigeneWirkungen(thema.id);
    assert.ok(eigene.length >= 3, `${thema.id}: nur ${eigene.length} eigene Wirkungen`);
  }
});

test('die eigenen Wirkungen eines Themas verteilen sich ueber die Schweren', () => {
  // Alle drei auf „leicht" hiesse: ab Stufe 3 ist das Thema wieder beliebig.
  for (const thema of T.THEMEN) {
    const schweren = new Set(T.eigeneWirkungen(thema.id).map((w) => w.schwere));
    assert.ok(schweren.size >= 2, `${thema.id}: alle eigenen Wirkungen sind ${[...schweren]}`);
  }
});

test('jedes Thema hat auf jeder Schwere eine eigene Wirkung ohne Schadensrichtung', () => {
  /*
   * Der Fall, der beim ersten Durchlauf durchgerutscht ist.
   *
   * Ein Zustand zieht nur dann aus den Schadenswirkungen, wenn er
   * ausdruecklich auf Schaden steht. Ein Feuerzustand, der das nicht tut,
   * hatte deshalb auf Stufe 1 und 3 nichts Eigenes und fiel auf „Nachteil
   * auf Wahrnehmung" zurueck — also genau auf das, was die themeneigenen
   * Wirkungen abstellen sollten.
   */
  for (const thema of T.THEMEN) {
    const schweren = new Set(
      T.eigeneWirkungen(thema.id)
        .filter((w) => w.richtung === 'debuff')
        .map((w) => w.schwere)
    );
    for (const noetig of ['leicht', 'mittel', 'schwer']) {
      assert.ok(schweren.has(noetig), `${thema.id}: keine eigene Wirkung auf ${noetig}`);
    }
  }
});

test('eine themengebundene Wirkung nennt nur Themen, die es gibt', () => {
  const bekannt = new Set(T.THEMEN.map((t) => t.id));
  for (const w of T.WIRKUNGEN) {
    for (const id of w.themen ?? []) {
      assert.ok(bekannt.has(id), `${w.id}: unbekanntes Thema ${id}`);
    }
  }
});

test('ohne Thema gibt es nur die allgemeinen Wirkungen', () => {
  for (const schwere of T.SCHWEREN) {
    for (const w of T.wirkungenFuer(schwere, ['debuff', 'buff', 'schaden'])) {
      assert.equal(w.themen, undefined, `${w.id} kam ohne sein Thema durch`);
    }
  }
});

test('ein erzeugter Zustand traegt keine Wirkung aus einem fremden Thema', () => {
  for (const thema of T.THEMEN) {
    for (const stufen of [1, 3, 5]) {
      for (let saat = 1; saat <= 5; saat += 1) {
        const zustand = T.erzeugeZustand({ themaId: thema.id, stufen }, 'de', wuerfelgeber(saat));
        for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) {
          const w = T.wirkung(id);
          assert.ok(w, `${id} gibt es nicht`);
          assert.ok(
            T.passtZumThema(w, thema.id),
            `${thema.id}/${saat}: ${id} gehoert zu ${w.themen}`
          );
        }
      }
    }
  }
});

test('ein Zustand mit mehreren Stufen greift auf die eigenen Wirkungen zurueck', () => {
  /*
   * Der eigentliche Punkt der Uebung: wenn ein Zustand aus Feuer nie eine
   * Feuerwirkung bekommt, war die ganze Liste umsonst. Verlangt wird nicht
   * jedes Mal — Gegenpole und Buffs ziehen aus dem allgemeinen Vorrat —,
   * aber der Regelfall muss es sein.
   */
  for (const thema of T.THEMEN) {
    let mitEigener = 0;
    for (let saat = 1; saat <= 20; saat += 1) {
      const zustand = T.erzeugeZustand({ themaId: thema.id, stufen: 3 }, 'de', wuerfelgeber(saat));
      const ids = zustand.stufen.flatMap((s) => s.wirkungen);
      if (ids.some((id) => T.wirkung(id)?.themen !== undefined)) mitEigener += 1;
    }
    assert.ok(mitEigener >= 15, `${thema.id}: nur ${mitEigener} von 20 mit eigener Wirkung`);
  }
});

/* ---------- Die Zahlen in den Texten ---------- */

test('jede Schadenswirkung nennt einen Wuerfel', () => {
  const deutsch = /\d+W\d+/;
  const englisch = /\d+d\d+/;
  for (const w of T.WIRKUNGEN.filter((w) => w.richtung === 'schaden')) {
    assert.match(w.text.de, deutsch, `${w.id} (de)`);
    assert.match(w.text.en, englisch, `${w.id} (en)`);
  }
});

test('kein Wirkungstext bleibt im Ungefaehren', () => {
  /*
   * Die Woerter, die vorher in der Liste standen und nichts sagten. „Wenig
   * Schaden" ist am Tisch eine Rueckfrage, keine Wirkung.
   */
  const vage = [
    /\bwenig\b/i,
    /\bviel\b/i,
    /\bspürbar\b/i,
    /\bein bisschen\b/i,
    /\ba little\b/i,
    /\bheavy damage\b/i,
    /\bnoticeable\b/i,
    /\bsome damage\b/i
  ];
  for (const w of T.WIRKUNGEN) {
    for (const muster of vage) {
      assert.doesNotMatch(w.text.de, muster, `${w.id} (de): ${muster}`);
      assert.doesNotMatch(w.text.en, muster, `${w.id} (en): ${muster}`);
    }
  }
});

test('ein Rettungswurf im Text nennt auch seinen Schwierigkeitsgrad', () => {
  for (const w of T.WIRKUNGEN) {
    if (/rettung/i.test(w.text.de)) {
      assert.match(w.text.de, /SG \d+|rettungswürfe/i, `${w.id} (de)`);
    }
    if (/\bsave\b/i.test(w.text.en)) {
      assert.match(w.text.en, /DC \d+/, `${w.id} (en)`);
    }
  }
});

test('beide Sprachen sind gefuellt und enden ohne Punkt', () => {
  // Der Punkt kommt aus der Darstellung, sonst steht er auf der Karte doppelt.
  for (const w of T.WIRKUNGEN) {
    assert.ok(w.text.de.trim().length > 0, `${w.id} (de)`);
    assert.ok(w.text.en.trim().length > 0, `${w.id} (en)`);
    assert.ok(!w.text.de.endsWith('.'), `${w.id} (de) endet auf einen Punkt`);
    assert.ok(!w.text.en.endsWith('.'), `${w.id} (en) endet auf einen Punkt`);
  }
});

/* ---------- Das Paket darf das Thema nicht aushebeln ---------- */

test('der Ersatz im Paket bleibt beim Thema des Zustands', () => {
  for (let saat = 1; saat <= 20; saat += 1) {
    const paket = T.erzeugePaket({ anzahl: 4, stufen: 3 }, 'de', wuerfelgeber(saat));
    for (const zustand of paket.zustaende) {
      for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) {
        const w = T.wirkung(id);
        assert.ok(
          T.passtZumThema(w, zustand.themaId),
          `Saat ${saat}: ${zustand.name} (${zustand.themaId}) traegt ${id}`
        );
      }
    }
  }
});
