/**
 * Das Gewicht und die Eichung.
 *
 * Die Eichung ist der eigentliche Test des Werkzeugs: die Punktwerte sind
 * geschaetzt, und ob sie taugen, zeigt sich nur daran, ob die bekannten
 * Zustaende in der richtigen Reihenfolge herauskommen.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/* ---------- Die Wirkungen selbst ---------- */

test('jede Wirkung hat eine Kennung, die nur einmal vorkommt', () => {
  const kennungen = T.WIRKUNGEN.map((w) => w.id);
  assert.equal(new Set(kennungen).size, kennungen.length);
});

test('Debuffs wiegen positiv, Buffs negativ', () => {
  for (const w of T.WIRKUNGEN) {
    if (w.richtung === 'buff') assert.ok(w.punkte < 0, `${w.id}: ${w.punkte}`);
    else assert.ok(w.punkte > 0, `${w.id}: ${w.punkte}`);
  }
});

test('schwerere Wirkungen wiegen im Schnitt mehr', () => {
  const mittel = (schwere) => {
    const treffer = T.WIRKUNGEN.filter((w) => w.schwere === schwere && w.richtung !== 'buff');
    return treffer.reduce((s, w) => s + w.punkte, 0) / treffer.length;
  };
  assert.ok(mittel('leicht') < mittel('mittel'), 'leicht ist nicht leichter als mittel');
  assert.ok(mittel('mittel') < mittel('schwer'), 'mittel ist nicht leichter als schwer');
  assert.ok(mittel('schwer') < mittel('toedlich'), 'schwer ist nicht leichter als toedlich');
});

test('zu jeder Schwere gibt es Debuffs, sonst bleiben Stufen leer', () => {
  for (const schwere of T.SCHWEREN) {
    assert.ok(T.wirkungenFuer(schwere, ['debuff']).length > 0, schwere);
  }
});

/* ---------- Die Eichung ---------- */

test('die bekannten Zustaende kommen in der richtigen Reihenfolge heraus', () => {
  /*
   * Der Test, an dem die Punktwerte haengen. Gelaehmt muss schwerer wiegen
   * als vergiftet, bewusstlos schwerer als gelaehmt. Kommt etwas anderes
   * heraus, taugen die Zahlen nicht — und das faellt hier auf statt am
   * Tisch.
   */
  const gewogen = T.EICHZUSTAENDE.map((z) => ({
    name: z.name,
    rang: z.rang,
    gewicht: T.eichgewicht(z)
  }));

  const daneben = [];
  for (const a of gewogen) {
    for (const b of gewogen) {
      if (a.rang < b.rang && a.gewicht >= b.gewicht) {
        daneben.push(`${a.name} (${a.gewicht}) sollte leichter sein als ${b.name} (${b.gewicht})`);
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} Paare in falscher Reihenfolge`);
});

test('bewusstlos ist der schwerste bekannte Zustand', () => {
  const schwerster = [...T.EICHZUSTAENDE].sort((a, b) => T.eichgewicht(b) - T.eichgewicht(a))[0];
  assert.equal(schwerster.id, 'bewusstlos');
});

test('der Vergleich findet den naechstgelegenen bekannten Zustand', () => {
  const gelaehmt = T.EICHZUSTAENDE.find((z) => z.id === 'gelaehmt');
  assert.equal(T.naechsterVergleich(T.eichgewicht(gelaehmt)).id, 'gelaehmt');
});

test('Erschoepfung waechst ueber ihre Stufen', () => {
  const eins = T.eichgewicht(T.EICHZUSTAENDE.find((z) => z.id === 'erschoepfung-1'));
  const drei = T.eichgewicht(T.EICHZUSTAENDE.find((z) => z.id === 'erschoepfung-3'));
  const fuenf = T.eichgewicht(T.EICHZUSTAENDE.find((z) => z.id === 'erschoepfung-5'));
  assert.ok(eins < drei && drei < fuenf, `${eins} / ${drei} / ${fuenf}`);
});

/* ---------- Die Pruefung ---------- */

test('ein Zustand, dessen Stufe nichts bringt, gilt als kaputt', () => {
  const befund = T.pruefe(
    [
      { nummer: 1, wirkungen: ['nachteil-wahrnehmung'] },
      { nummer: 2, wirkungen: [] }
    ],
    'laestig'
  );
  assert.equal(befund.urteil, 'kaputt');
  assert.deepEqual(befund.flacheStufen, [2]);
});

test('dieselbe Wirkung zweimal gilt als kaputt', () => {
  const befund = T.pruefe(
    [
      { nummer: 1, wirkungen: ['nachteil-wahrnehmung'] },
      { nummer: 2, wirkungen: ['nachteil-wahrnehmung'] }
    ],
    'laestig'
  );
  assert.equal(befund.urteil, 'kaputt');
  assert.deepEqual(befund.doppelte, ['nachteil-wahrnehmung']);
});

test('ein grosser Sprung wird gemeldet, ohne als Fehler zu gelten', () => {
  const befund = T.pruefe(
    [
      { nummer: 1, wirkungen: ['nachteil-wahrnehmung'] },
      { nummer: 2, wirkungen: ['bewusstlos'] }
    ],
    'toedlich'
  );
  assert.deepEqual(befund.spruenge, [2]);
  assert.notEqual(befund.urteil, 'kaputt');
});

test('auf „laestig" gestellt und schwer geworden heisst: zu schwer', () => {
  const befund = T.pruefe([{ nummer: 1, wirkungen: ['bewusstlos', 'gelaehmt'] }], 'laestig');
  assert.equal(befund.urteil, 'zu schwer');
});

test('die Kurve zeigt das Gewicht je Stufe, kumulativ', () => {
  const befund = T.pruefe(
    [
      { nummer: 1, wirkungen: ['nachteil-wahrnehmung'] },
      { nummer: 2, wirkungen: ['bewegung-halbiert'] }
    ],
    'ernst'
  );
  assert.deepEqual(befund.kurve, [1, 3]);
});

test('ein Buff senkt das Gewicht', () => {
  const ohne = T.gesamtgewicht([{ nummer: 1, wirkungen: ['bewegung-halbiert'] }]);
  const mit = T.gesamtgewicht([{ nummer: 1, wirkungen: ['bewegung-halbiert', 'vorteil-eine-sache'] }]);
  assert.ok(mit < ohne, `${mit} nicht kleiner als ${ohne}`);
});
