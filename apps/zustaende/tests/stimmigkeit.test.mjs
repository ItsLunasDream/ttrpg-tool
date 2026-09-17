/**
 * Die Stimmigkeitspruefung.
 *
 * Der Fall, der sie ausgeloest hat, stand im ersten Bild der Oberflaeche:
 * Dauer „bis zu deinem naechsten Zug", Linderung „eine Stunde in trockener
 * Kleidung senkt ihn um 1". Beides fuer sich richtig, zusammen Unsinn.
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

const GRUND = {
  dauerSkala: 'kurz',
  linderungSkala: 'kurz',
  verschlimmerungSkala: 'kurz',
  stufen: 3,
  artId: 'umgebung',
  mitOrt: true
};

/* ---------- Die Pruefung selbst ---------- */

test('der gemeldete Fall wird erkannt', () => {
  // „bis zu deinem naechsten Zug" plus „eine Stunde am Feuer".
  const befund = T.pruefeStimmigkeit({
    ...GRUND,
    dauerSkala: 'kampf',
    linderungSkala: 'kurz',
    verschlimmerungSkala: 'kampf',
    stufen: 1
  });
  assert.equal(befund.ok, false);
  assert.ok(befund.gruende.includes('linderungZuLangsam'));
});

test('eine Verschlimmerung, die nie zum Zug kaeme, wird erkannt', () => {
  const befund = T.pruefeStimmigkeit({
    ...GRUND,
    dauerSkala: 'kampf',
    linderungSkala: 'kampf',
    verschlimmerungSkala: 'lang',
    stufen: 1
  });
  assert.ok(befund.gruende.includes('verschlimmerungZuLangsam'));
});

test('mehrere Stufen im Kampftakt werden erkannt', () => {
  // Wer bis zum naechsten Zug anhaelt, kommt nie auf Stufe 3.
  const befund = T.pruefeStimmigkeit({
    ...GRUND,
    dauerSkala: 'kampf',
    linderungSkala: 'kampf',
    verschlimmerungSkala: 'kampf',
    stufen: 5
  });
  assert.ok(befund.gruende.includes('stufenOhneZeit'));
});

test('eine einzelne Stufe im Kampftakt ist in Ordnung', () => {
  const befund = T.pruefeStimmigkeit({
    dauerSkala: 'kampf',
    linderungSkala: 'kampf',
    verschlimmerungSkala: 'kampf',
    stufen: 1,
    artId: 'magie',
    mitOrt: false
  });
  assert.equal(befund.ok, true);
});

test('ein Ort an einem Fluch wird erkannt', () => {
  // „jedes Mal, wenn der Name auf dem Gletscher genannt wird" — ein Fluch
  // braucht keinen Gletscher.
  const befund = T.pruefeStimmigkeit({ ...GRUND, artId: 'fluch', mitOrt: true });
  assert.ok(befund.gruende.includes('ausloeserOhneUmgebung'));
});

test('derselbe Ort an einer Umgebung ist genau richtig', () => {
  const befund = T.pruefeStimmigkeit({ ...GRUND, artId: 'umgebung', mitOrt: true });
  assert.equal(befund.ok, true);
});

test('eine schnellere Linderung als die Dauer ist erlaubt', () => {
  // Wer tagelang krank ist und stuendlich Besserung findet, hat Glueck —
  // keinen Widerspruch.
  const befund = T.pruefeStimmigkeit({
    ...GRUND,
    dauerSkala: 'lang',
    linderungSkala: 'kurz',
    verschlimmerungSkala: 'kurz'
  });
  assert.equal(befund.ok, true);
});

/* ---------- Der Erzeuger baut nichts Unstimmiges ---------- */

test('KEIN erzeugter Zustand ist unstimmig', () => {
  /*
   * Eine Pruefung, die nur Fehler meldet, die das Werkzeug selbst gebaut
   * hat, ist eine Ausrede. Deshalb dieselbe Messlatte wie beim Monster
   * Creator: alles, was herauskommt, besteht die eigene Pruefung.
   */
  const daneben = [];
  for (const art of T.ARTEN) {
    for (const thema of T.THEMEN) {
      for (const stufen of [1, 3, 5]) {
        for (let saat = 1; saat <= 4; saat += 1) {
          const zustand = T.erzeugeZustand(
            { artId: art.id, themaId: thema.id, stufen },
            'de',
            wuerfelgeber(saat)
          );
          const befund = T.pruefeZustandsStimmigkeit(zustand);
          if (!befund.ok) {
            daneben.push(`${art.id}/${thema.id}/${stufen} Saat ${saat}: ${befund.gruende.join()}`);
          }
        }
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} unstimmig`);
});

test('ein Zustand mit fuenf Stufen bekommt nie eine Kampfdauer', () => {
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ stufen: 5 }, 'de', wuerfelgeber(saat));
    assert.notEqual(T.dauer(zustand.dauerId).zeitskala, 'kampf', `Saat ${saat}`);
  }
});

test('die Linderung folgt dem Takt der Dauer', () => {
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ stufen: 1 }, 'de', wuerfelgeber(saat));
    const dauerSkala = T.dauer(zustand.dauerId).zeitskala;
    assert.ok(
      T.skalaWert(zustand.linderungSkala) <= T.skalaWert(dauerSkala),
      `Saat ${saat}: ${zustand.linderungSkala} bei ${dauerSkala}`
    );
  }
});

test('im Kampf hilft eine Rettung, keine Stunde am Feuer', () => {
  const kampf = T.baueLinderung(T.THEMEN[0], 'kampf', 'de', wuerfelgeber(3));
  assert.match(kampf.text, /rettung/i);
  const kurz = T.baueLinderung(T.THEMEN[0], 'kurz', 'de', wuerfelgeber(3));
  assert.match(kurz.text, /Stunde/);
  const lang = T.baueLinderung(T.THEMEN[0], 'lang', 'de', wuerfelgeber(3));
  assert.match(lang.text, /Tag/);
});

test('nur die Umgebung haengt einen Ort an die Verschlimmerung', () => {
  const fluch = T.ARTEN.find((a) => a.id === 'fluch');
  const umgebung = T.ARTEN.find((a) => a.id === 'umgebung');
  const thema = T.THEMEN.find((t) => t.id === 'kaelte');
  const orte = thema.orte.map((o) => o.de);

  for (let saat = 1; saat <= 20; saat += 1) {
    const ohne = T.baueVerschlimmerung(fluch, thema, 'lang', 'de', wuerfelgeber(saat));
    assert.ok(!orte.some((ort) => ohne.text.includes(ort)), `Fluch Saat ${saat}: ${ohne.text}`);
  }
  let mitOrt = 0;
  for (let saat = 1; saat <= 20; saat += 1) {
    const mit = T.baueVerschlimmerung(umgebung, thema, 'lang', 'de', wuerfelgeber(saat));
    if (orte.some((ort) => mit.text.includes(ort))) mitOrt += 1;
  }
  assert.equal(mitOrt, 20, 'die Umgebung nennt nicht immer einen Ort');
});

test('nur Zustaende aus der Umgebung bekommen ueberhaupt einen Ausloeser', () => {
  for (const art of T.ARTEN.filter((a) => a.id !== 'umgebung')) {
    for (let saat = 1; saat <= 20; saat += 1) {
      const zustand = T.erzeugeZustand({ artId: art.id }, 'de', wuerfelgeber(saat));
      assert.equal(zustand.ausloeser, '', `${art.id} Saat ${saat}`);
    }
  }
});
