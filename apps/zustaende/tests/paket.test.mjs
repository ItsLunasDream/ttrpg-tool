/**
 * Pakete und die Karte zum Vorlesen.
 *
 * Beim Paket geht es nicht ums Sparen von Klicks — vier Mal einzeln
 * wuerfeln waere genauso schnell. Es geht um die Abstimmung, und genau die
 * pruefen die Tests hier.
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

/* ---------- Pakete ---------- */

test('ein Paket liefert so viele Zustaende wie bestellt', () => {
  for (const anzahl of [2, 3, 4, 5, 6]) {
    const paket = T.erzeugePaket({ anzahl }, 'de', wuerfelgeber(4));
    assert.equal(paket.zustaende.length, anzahl);
  }
});

test('ein Paket enthaelt keinen Segen zwischen lauter Widrigkeiten', () => {
  for (let saat = 1; saat <= 20; saat += 1) {
    const paket = T.erzeugePaket({ anzahl: 5 }, 'de', wuerfelgeber(saat));
    for (const zustand of paket.zustaende) {
      assert.notEqual(zustand.artId, 'segen', `Saat ${saat}: ${zustand.name}`);
    }
  }
});

test('alle Zustaende eines Pakets teilen Thema und Haerte', () => {
  const paket = T.erzeugePaket({ themaId: 'kaelte', haerteId: 'ernst', anzahl: 4 }, 'de', wuerfelgeber(7));
  for (const zustand of paket.zustaende) {
    assert.equal(zustand.themaId, 'kaelte');
    assert.equal(zustand.haerteId, 'ernst');
  }
});

test('bei vier Zustaenden greift die Abstimmung vollstaendig', () => {
  /*
   * Der eigentliche Zweck des Pakets: es soll nicht dreimal derselbe
   * Nachteil angreifen. Bei vier Zustaenden reicht die Wirkungsliste dafuer
   * aus, und dann darf sich nichts wiederholen.
   */
  const daneben = [];
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 6; saat += 1) {
      const paket = T.erzeugePaket({ themaId: thema.id, anzahl: 4 }, 'de', wuerfelgeber(saat));
      const doppelt = T.ueberschneidung(paket);
      if (doppelt > 0) daneben.push(`${thema.id} Saat ${saat}: ${doppelt}`);
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} Pakete mit Wiederholung`);
});

test('jeder Zustand eines Pakets bleibt fuer sich heil', () => {
  // Die Abstimmung tauscht Wirkungen aus — dabei darf kein Verlauf kippen.
  const daneben = [];
  for (let saat = 1; saat <= 20; saat += 1) {
    const paket = T.erzeugePaket({ anzahl: 5 }, 'de', wuerfelgeber(saat));
    for (const zustand of paket.zustaende) {
      if (T.pruefeZustand(zustand).urteil === 'kaputt') daneben.push(`Saat ${saat}: ${zustand.name}`);
      if (!T.pruefeZustandsStimmigkeit(zustand).ok) daneben.push(`Saat ${saat}: ${zustand.name} unstimmig`);
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} kaputt`);
});

test('die Stufenzahl schwankt innerhalb eines Pakets', () => {
  // Vier Zustaende mit je fuenf Stufen sehen aus wie vier Mal dasselbe.
  let gesehen = new Set();
  for (let saat = 1; saat <= 10; saat += 1) {
    const paket = T.erzeugePaket({ anzahl: 5 }, 'de', wuerfelgeber(saat));
    for (const zustand of paket.zustaende) gesehen.add(zustand.stufen.length);
  }
  assert.ok(gesehen.size >= 2, `immer ${[...gesehen].join()} Stufen`);
});

test('ein Paket hat einen Namen, der nach Abschnitt klingt', () => {
  const namen = new Set();
  for (let saat = 1; saat <= 30; saat += 1) namen.add(T.bauePaketnamen('de', wuerfelgeber(saat)));
  assert.ok(namen.size >= 8, `nur ${namen.size} verschiedene aus 30`);
});

test('die Ueberschneidung zaehlt, was sich wiederholt', () => {
  const paket = {
    name: 'x',
    themaId: 'kaelte',
    haerteId: 'ernst',
    zustaende: [
      { stufen: [{ nummer: 1, wirkungen: ['blind'] }] },
      { stufen: [{ nummer: 1, wirkungen: ['blind', 'taub'] }] }
    ]
  };
  assert.equal(T.ueberschneidung(paket), 1);
});

/* ---------- Die Karte ---------- */

function beispiel(saat = 3) {
  return T.erzeugeZustand({ themaId: 'kaelte', artId: 'umgebung', stufen: 4 }, 'de', wuerfelgeber(saat));
}

test('die Vorderseite nennt keine Regelwirkungen', () => {
  /*
   * Das ist die Seite, die man der Gruppe hinhaelt. Was die Figur spuert
   * gehoert darauf, „Nachteil auf Rettungswuerfe" nicht.
   */
  const zustand = beispiel();
  const vorn = T.vorderseite(zustand, 'de');
  for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) {
    assert.ok(!vorn.includes(T.wirkung(id).text.de), `${id} steht auf der Vorderseite`);
  }
  assert.ok(vorn.includes(zustand.kurzsatz), 'der Kurzsatz fehlt');
  assert.ok(vorn.includes(zustand.name), 'der Name fehlt');
});

test('die Vorderseite hat ein Kaestchen je Stufe zum Ankreuzen', () => {
  const zustand = beispiel();
  const treffer = T.vorderseite(zustand, 'de').match(/karte__kasten/g) ?? [];
  assert.equal(treffer.length, zustand.stufen.length);
});

test('die Rueckseite traegt die Regel', () => {
  const zustand = beispiel();
  const hinten = T.rueckseite(zustand, 'de');
  for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) {
    assert.ok(hinten.includes(T.wirkung(id).text.de), `${id} fehlt auf der Rueckseite`);
  }
  assert.ok(hinten.includes(zustand.verschlimmerung));
  assert.ok(hinten.includes(zustand.linderung));
});

test('ausformulierte Stufen ersetzen die Stichpunkte auf der Rueckseite', () => {
  const zustand = beispiel();
  const hinten = T.rueckseite(zustand, 'de', { 1: 'Die Kälte nimmt dir den Atem.' });
  assert.ok(hinten.includes('Die Kälte nimmt dir den Atem.'));
});

test('ein Bogen traegt jede Karte zweimal: vorn und hinten', () => {
  const paket = T.erzeugePaket({ anzahl: 3 }, 'de', wuerfelgeber(5));
  const html = T.bogen(paket.zustaende, 'de');
  // Gezaehlt wird das Klassenattribut, nicht das Wort: `karte--rueck` steht
  // auch im Stylesheet, und das haette den Test still danebenliegen lassen.
  assert.equal((html.match(/class="karte karte--vorn"/g) ?? []).length, 3);
  assert.equal((html.match(/class="karte karte--rueck"/g) ?? []).length, 3);
});

test('spitze Klammern im Namen landen nicht als HTML im Bogen', () => {
  // Ein Name kommt aus einer Datei, die von Hand geaendert werden darf.
  const zustand = { ...beispiel(), name: '<script>böse</script>' };
  const html = T.bogen([zustand], 'de');
  assert.ok(!html.includes('<script>böse'), 'ungepruefter Name im Dokument');
  assert.ok(html.includes('&lt;script&gt;'), 'der Name fehlt ganz');
});

test('der Bogen ist ein vollstaendiges Dokument', () => {
  const html = T.bogen([beispiel()], 'de');
  assert.ok(html.startsWith('<!doctype html>'));
  assert.ok(html.includes('<style>'), 'ohne Stil waere es ein Zettel');
  assert.ok(html.includes('@page'), 'die Seitengroesse fehlt');
});

test('die Stufen auf der Karte stehen nur einmal nummeriert da', () => {
  // „1. 1. Nachteil auf Wahrnehmung" stand im ersten Bild der Karte: die
  // Liste nummerierte selbst, und die Nummer stand zusaetzlich im Text.
  const html = T.bogen([beispiel()], 'de');
  assert.ok(html.includes('list-style: none'), 'die Liste nummeriert selbst mit');
});

test('zwei Zustaende eines Pakets heissen nie gleich', () => {
  /*
   * Auf einem Bild der Oberflaeche standen zwei Mal „Winterschlaf" in
   * einem Kaeltepaket. Das ist nicht nur unschoen: die Datei wird nach dem
   * Namen benannt, und „Alle in die Sammlung" haette den einen mit dem
   * anderen ueberschrieben.
   */
  const daneben = [];
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 10; saat += 1) {
      const paket = T.erzeugePaket({ themaId: thema.id, anzahl: 6 }, 'de', wuerfelgeber(saat));
      const namen = paket.zustaende.map((z) => z.name);
      if (new Set(namen).size !== namen.length) daneben.push(`${thema.id} Saat ${saat}: ${namen.join(', ')}`);
    }
  }
  assert.deepEqual(daneben.slice(0, 3), [], `${daneben.length} Pakete mit doppeltem Namen`);
});

test('und damit auch nie dieselbe Dateikennung', () => {
  for (let saat = 1; saat <= 20; saat += 1) {
    const paket = T.erzeugePaket({ anzahl: 6 }, 'de', wuerfelgeber(saat));
    const ids = paket.zustaende.map((z) => T.zuId(z.name));
    assert.equal(new Set(ids).size, ids.length, `Saat ${saat}: ${ids.join(', ')}`);
  }
});
