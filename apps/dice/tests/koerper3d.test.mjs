import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { baueKoerper, gegenueberliegende, ordneZiffernZu, pruefeBeschriftung, istBeschriftet, SEITEN } =
  entry;

const ARTEN = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

for (const art of ARTEN) {
  const seiten = SEITEN[art];

  test(`${art}: der Koerper hat ${seiten} Flaechen`, () => {
    const koerper = baueKoerper(art);
    assert.equal(
      koerper.flaechen.length,
      seiten,
      `${art} hat ${koerper.flaechen.length} Flaechen statt ${seiten}`
    );
  });

  test(`${art}: die Beschriftung haelt die Regeln ein`, () => {
    const koerper = baueKoerper(art);
    const gegen = gegenueberliegende(koerper.flaechen);
    const ziffern = ordneZiffernZu(seiten, gegen);
    const klagen = pruefeBeschriftung(seiten, ziffern, gegen);
    assert.deepEqual(klagen, [], klagen.join('; '));
  });
}

test('der d4 hat keine gegenueberliegenden Flaechen', () => {
  // Ein Tetraeder hat keine parallelen Flaechen. Waere das anders, stimmte
  // die Geometrie nicht — und die Beschriftung liefe in den falschen Zweig.
  const gegen = gegenueberliegende(baueKoerper('d4').flaechen);
  assert.deepEqual(gegen, [-1, -1, -1, -1]);
});

test('alle anderen Arten haben zu jeder Flaeche eine gegenueberliegende', () => {
  for (const art of ARTEN.filter((a) => a !== 'd4')) {
    const gegen = gegenueberliegende(baueKoerper(art).flaechen);
    assert.equal(gegen.includes(-1), false, `${art} hat eine Flaeche ohne Gegenstueck`);
  }
});

test('d100 und der eigene Wuerfel sind Kugeln ohne Beschriftung', () => {
  for (const art of ['d100', 'custom']) {
    const koerper = baueKoerper(art);
    assert.equal(koerper.istKugel, true, `${art} sollte eine Kugel sein`);
    assert.equal(koerper.flaechen.length, 0, `${art} sollte keine Flaechen tragen`);
    assert.equal(istBeschriftet(art), false);
  }
});

test('jeder Koerper liefert Ecken fuer die Physikhuelle', () => {
  for (const art of ARTEN) {
    const koerper = baueKoerper(art);
    assert.ok(koerper.ecken.length >= 4, `${art} hat nur ${koerper.ecken.length} Ecken`);
  }
});
