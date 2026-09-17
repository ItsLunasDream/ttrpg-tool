/**
 * Der Erzeuger.
 *
 * Der Anspruch ist derselbe wie beim Monster Creator: was hier herauskommt,
 * muss die eigene Pruefung bestehen. Ein Werkzeug, das an seinen eigenen
 * Ergebnissen herummeckert, glaubt einem niemand.
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
  // Warmlaufen: der erste Wurf haengt fast linear von der Saat ab.
  for (let i = 0; i < 5; i += 1) zieh();
  return zieh;
}

test('JEDER erzeugte Zustand besteht die eigene Pruefung', () => {
  const daneben = [];
  for (const art of T.ARTEN) {
    for (const thema of T.THEMEN) {
      for (const haerte of T.HAERTEN) {
        for (const stufen of [1, 3, 5]) {
          for (let saat = 1; saat <= 3; saat += 1) {
            const zustand = T.erzeugeZustand(
              { artId: art.id, themaId: thema.id, haerteId: haerte.id, stufen },
              'de',
              wuerfelgeber(saat)
            );
            const befund = T.pruefeZustand(zustand);
            if (befund.urteil === 'kaputt') {
              daneben.push(
                `${art.id}/${thema.id}/${haerte.id}/${stufen} Saat ${saat}: ${befund.flacheStufen.join()} ${befund.doppelte.join()}`
              );
            }
          }
        }
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} kaputt`);
});

test('jede Stufe wird schlimmer als die davor', () => {
  for (const haerte of T.HAERTEN) {
    for (let saat = 1; saat <= 20; saat += 1) {
      const zustand = T.erzeugeZustand({ haerteId: haerte.id, stufen: 5 }, 'de', wuerfelgeber(saat));
      const befund = T.pruefeZustand(zustand);
      assert.deepEqual(befund.flacheStufen, [], `${haerte.id} Saat ${saat}`);
      // Auf dem Betrag: ein Segen waechst ins Negative und wird dabei
      // staerker, nicht schwaecher.
      for (let i = 1; i < befund.kurve.length; i += 1) {
        assert.ok(
          Math.abs(befund.kurve[i]) > Math.abs(befund.kurve[i - 1]),
          `${haerte.id} Saat ${saat} Stufe ${i + 1}`
        );
      }
    }
  }
});

test('keine Wirkung kommt zweimal vor', () => {
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ stufen: 5 }, 'de', wuerfelgeber(saat));
    const alle = zustand.stufen.flatMap((s) => s.wirkungen);
    assert.equal(new Set(alle).size, alle.length, `Saat ${saat}`);
  }
});

test('die erste Stufe macht nicht gleich handlungsunfaehig', () => {
  // Ein Zustand, der auf Stufe 1 schon alles nimmt, hat keine Stufen,
  // sondern einen Schalter.
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ haerteId: 'toedlich', stufen: 5 }, 'de', wuerfelgeber(saat));
    for (const id of zustand.stufen[0].wirkungen) {
      assert.notEqual(T.wirkung(id).schwere, 'toedlich', `Saat ${saat}`);
    }
  }
});

test('die Haerte deckelt, wie schlimm es wird', () => {
  for (let saat = 1; saat <= 30; saat += 1) {
    const laestig = T.erzeugeZustand({ haerteId: 'laestig', stufen: 3 }, 'de', wuerfelgeber(saat));
    const toedlich = T.erzeugeZustand({ haerteId: 'toedlich', stufen: 3 }, 'de', wuerfelgeber(saat));
    // Verglichen wird der Betrag: ein Segen wiegt negativ und ist trotzdem
    // schwer.
    const leicht = T.betragVon(T.gesamtgewicht(laestig.stufen));
    const schwer = T.betragVon(T.gesamtgewicht(toedlich.stufen));
    assert.ok(leicht < schwer, `Saat ${saat}: ${leicht} / ${schwer}`);
  }
});

test('ein Zustand ohne Stufen hat genau eine', () => {
  const zustand = T.erzeugeZustand({ stufen: 1 }, 'de', wuerfelgeber(4));
  assert.equal(zustand.stufen.length, 1);
});

test('„gemischt" liefert wirklich beides', () => {
  let mitBeidem = 0;
  for (let saat = 1; saat <= 30; saat += 1) {
    const zustand = T.erzeugeZustand(
      { wirkrichtung: 'gemischt', stufen: 4 },
      'de',
      wuerfelgeber(saat)
    );
    const richtungen = new Set(
      zustand.stufen.flatMap((s) => s.wirkungen).map((id) => T.wirkung(id).richtung)
    );
    if (richtungen.has('buff') && richtungen.has('debuff')) mitBeidem += 1;
  }
  assert.ok(mitBeidem >= 25, `nur ${mitBeidem} von 30 haben beides`);
});

test('„buff" liefert keine Debuffs', () => {
  for (let saat = 1; saat <= 30; saat += 1) {
    const zustand = T.erzeugeZustand({ wirkrichtung: 'buff', stufen: 3 }, 'de', wuerfelgeber(saat));
    for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) {
      assert.equal(T.wirkung(id).richtung, 'buff', `Saat ${saat}`);
    }
  }
});

test('das Thema faerbt ab, ohne alles zu bestimmen', () => {
  // Kaelte greift eher Bewegung und Koerper an. Nicht immer — dann waere die
  // Liste zu kurz —, aber oefter als der Zufall.
  const kaelte = new Set();
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ themaId: 'kaelte', stufen: 4 }, 'de', wuerfelgeber(saat));
    for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) kaelte.add(T.wirkung(id).spur);
  }
  assert.ok(kaelte.has('bewegung') || kaelte.has('koerper'), 'keine passende Spur dabei');
});

test('die Namen wiederholen sich nicht bei jedem Wurf', () => {
  for (const thema of T.THEMEN) {
    const namen = new Set();
    for (let saat = 1; saat <= 60; saat += 1) namen.add(T.baueNamen(thema, 'de', wuerfelgeber(saat)));
    assert.ok(namen.size >= 25, `${thema.id}: nur ${namen.size} aus 60`);
  }
});

test('der Kurzsatz ist ein Satz und kein Absatz', () => {
  for (const thema of T.THEMEN) {
    const satz = T.baueKurzsatz(thema, 'de', wuerfelgeber(9));
    assert.ok(satz.endsWith('.'), satz);
    assert.ok(satz.length < 90, `zu lang: ${satz}`);
  }
});

test('der Kurzsatz sieht nach fuenfzig Wuerfen nicht immer gleich aus', () => {
  const saetze = new Set();
  for (let saat = 1; saat <= 50; saat += 1) {
    saetze.add(T.baueKurzsatz(T.THEMEN[0], 'de', wuerfelgeber(saat)));
  }
  assert.ok(saetze.size >= 20, `nur ${saetze.size} verschiedene aus 50`);
});

test('ein Ausloeser ist die Ausnahme, ausser bei der Art Umgebung', () => {
  const zaehle = (artId) => {
    let mit = 0;
    for (let saat = 1; saat <= 40; saat += 1) {
      const zustand = T.erzeugeZustand({ artId }, 'de', wuerfelgeber(saat));
      if (zustand.ausloeser !== '') mit += 1;
    }
    return mit;
  };
  assert.ok(zaehle('umgebung') > 28, `Umgebung nur ${zaehle('umgebung')} von 40`);
  assert.ok(zaehle('fluch') < 20, `Fluch schon ${zaehle('fluch')} von 40`);
});

test('ein Segen ist von sich aus ein Buff', () => {
  const zustand = T.erzeugeZustand({ artId: 'segen' }, 'de', wuerfelgeber(3));
  assert.equal(zustand.wirkrichtung, 'buff');
});

test('jeder Zustand bekommt ein Zeichen und eine Farbe fuer den Tracker', () => {
  for (let saat = 1; saat <= 20; saat += 1) {
    const zustand = T.erzeugeZustand({}, 'de', wuerfelgeber(saat));
    assert.ok(zustand.zeichen.length > 0);
    assert.match(zustand.farbe, /^#[0-9a-f]{6}$/i);
  }
});

test('nachwuerfeln laesst den Rest stehen', () => {
  const vorher = T.erzeugeZustand({ themaId: 'kaelte', stufen: 3 }, 'de', wuerfelgeber(5));
  // Ueber mehrere Saaten: derselbe Name kann zufaellig noch einmal fallen.
  const namen = new Set();
  for (let saat = 1; saat <= 10; saat += 1) {
    namen.add(T.wuerfleNeu(vorher, 'name', 'de', wuerfelgeber(saat)).name);
  }
  assert.ok(namen.size > 1, 'der Name aendert sich nie');
  const nachher = T.wuerfleNeu(vorher, 'name', 'de', wuerfelgeber(6));
  assert.equal(nachher.kurzsatz, vorher.kurzsatz);
  assert.deepEqual(nachher.stufen, vorher.stufen);
});

test('neu gewuerfelte Stufen behalten ihre Anzahl und bleiben heil', () => {
  const vorher = T.erzeugeZustand({ stufen: 5 }, 'de', wuerfelgeber(5));
  for (let saat = 1; saat <= 20; saat += 1) {
    const nachher = T.wuerfleNeu(vorher, 'stufen', 'de', wuerfelgeber(saat));
    assert.equal(nachher.stufen.length, 5, `Saat ${saat}`);
    assert.notEqual(T.pruefeZustand(nachher).urteil, 'kaputt', `Saat ${saat}`);
  }
});
