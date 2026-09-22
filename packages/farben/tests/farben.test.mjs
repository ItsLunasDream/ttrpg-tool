import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  ROLLEN,
  THEMEN,
  VORGABE_THEMA,
  alsCssText,
  cssName,
  helligkeit,
  kanaele,
  kontrast,
  text,
  themaMit
} = require('../dist/tests/entry.cjs');

test('jedes Thema besetzt jede Rolle, und keine bleibt leer', () => {
  for (const thema of THEMEN) {
    for (const rolle of ROLLEN) {
      const farbe = thema.farben[rolle];
      assert.ok(farbe, `${thema.id}: ${rolle} fehlt`);
      assert.match(farbe, /^#[0-9a-f]{6}$/i, `${thema.id}.${rolle}: ${farbe}`);
    }
    // Und keine Rolle zu viel: eine Farbe, die kein Werkzeug kennt, wird
    // gepflegt und nie benutzt.
    assert.deepEqual(
      Object.keys(thema.farben).sort(),
      [...ROLLEN].sort(),
      `${thema.id} hat andere Rollen als die Liste`
    );
  }
});

test('die Kennungen sind eindeutig und die Vorgabe gibt es', () => {
  const ids = THEMEN.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, ids.join(', '));
  assert.ok(
    THEMEN.some((t) => t.id === VORGABE_THEMA),
    `${VORGABE_THEMA} steht nicht in der Liste`
  );
});

test('jedes Thema hat einen Namen in beiden Sprachen', () => {
  for (const thema of THEMEN) {
    assert.ok(text(thema.name, 'de').trim(), thema.id);
    assert.ok(text(thema.name, 'en').trim(), thema.id);
  }
});

test('es gibt beides: dunkle Themen und helle', () => {
  // Der Schwerpunkt liegt auf dunkel, aber der helle Modus muss abgedeckt
  // sein — das war der Punkt an der ganzen Sache.
  const dunkel = THEMEN.filter((t) => !t.hell).length;
  const hell = THEMEN.filter((t) => t.hell).length;
  assert.ok(dunkel >= 3, `nur ${dunkel} dunkle`);
  assert.ok(hell >= 1, `nur ${hell} helle`);
  assert.ok(dunkel > hell, 'der Schwerpunkt soll dunkel bleiben');
});

test('die Angabe „hell" passt zur Grundfarbe', () => {
  // Sie wird nicht geraten, sondern steht im Thema — also muss sie stimmen.
  // Steht sie falsch, zeichnet das System Bildlaufleisten in der falschen
  // Richtung, und das sieht aus wie ein Fehler.
  for (const thema of THEMEN) {
    const grund = helligkeit(thema.farben.grund);
    assert.equal(grund > 0.4, thema.hell, `${thema.id}: hell=${thema.hell}, Grund ${grund}`);
  }
});

test('Lesetext ist auf jedem Grund lesbar (WCAG AA, 4.5)', () => {
  const zuWenig = [];
  for (const thema of THEMEN) {
    for (const grund of ['grund', 'grundHoch', 'grundTief']) {
      const wert = kontrast(thema.farben.text, thema.farben[grund]);
      if (wert < 4.5) zuWenig.push(`${thema.id}: text auf ${grund} = ${wert.toFixed(2)}`);
    }
  }
  assert.deepEqual(zuWenig, [], zuWenig.join(' / '));
});

test('leiser Text bleibt lesbar (WCAG AA fuer Grosses, 3.0)', () => {
  // Hinweise und Zweitzeilen duerfen zurueckstehen, aber nicht verschwinden.
  const zuWenig = [];
  for (const thema of THEMEN) {
    for (const grund of ['grund', 'grundHoch']) {
      const wert = kontrast(thema.farben.textLeise, thema.farben[grund]);
      if (wert < 3) zuWenig.push(`${thema.id}: textLeise auf ${grund} = ${wert.toFixed(2)}`);
    }
  }
  assert.deepEqual(zuWenig, [], zuWenig.join(' / '));
});

test('die Bedeutungsfarben heben sich vom Grund ab (3.0)', () => {
  // Betonung, Gefahr, Gut, Fest und die Verweise stehen auf Flaechen und
  // in Knoepfen — dafuer gilt die Schwelle fuer Bedienteile.
  const zuWenig = [];
  for (const thema of THEMEN) {
    for (const rolle of ['betont', 'gefahr', 'gut', 'fest', 'verweis', 'verweisFehlt']) {
      for (const grund of ['grund', 'grundHoch']) {
        const wert = kontrast(thema.farben[rolle], thema.farben[grund]);
        if (wert < 3) zuWenig.push(`${thema.id}: ${rolle} auf ${grund} = ${wert.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(zuWenig, [], zuWenig.join(' / '));
});

test('der Rand hebt sich vom Grund ab, ohne zu schreien', () => {
  for (const thema of THEMEN) {
    const wert = kontrast(thema.farben.rand, thema.farben.grund);
    assert.ok(wert > 1.15, `${thema.id}: Rand kaum zu sehen (${wert.toFixed(2)})`);
    assert.ok(wert < 6, `${thema.id}: Rand schreit (${wert.toFixed(2)})`);
  }
});

test('die betonte Flaeche traegt noch Lesetext', () => {
  // `betontLeise` liegt hinter Hervorhebungen, und darauf steht Text.
  const zuWenig = [];
  for (const thema of THEMEN) {
    const wert = kontrast(thema.farben.text, thema.farben.betontLeise);
    if (wert < 4.5) zuWenig.push(`${thema.id}: ${wert.toFixed(2)}`);
  }
  assert.deepEqual(zuWenig, [], zuWenig.join(' / '));
});

test('die drei Grundhelligkeiten sind unterscheidbar', () => {
  // Sonst waere die Schichtung nicht zu sehen und man koennte sie sparen.
  for (const thema of THEMEN) {
    const hoch = helligkeit(thema.farben.grundHoch);
    const mitte = helligkeit(thema.farben.grund);
    const tief = helligkeit(thema.farben.grundTief);
    assert.ok(hoch > mitte, `${thema.id}: grundHoch nicht heller als grund`);
    assert.ok(mitte > tief, `${thema.id}: grund nicht heller als grundTief`);
  }
});

test('aus einer Rolle wird ein CSS-Name mit Bindestrichen', () => {
  assert.equal(cssName('grund'), '--f-grund');
  assert.equal(cssName('grundHoch'), '--f-grund-hoch');
  assert.equal(cssName('verweisFehlt'), '--f-verweis-fehlt');
});

test('alsCssText nennt jede Rolle genau einmal', () => {
  const css = alsCssText(themaMit('nacht'));
  for (const rolle of ROLLEN) {
    const name = cssName(rolle);
    const treffer = css.split('\n').filter((zeile) => zeile.startsWith(`${name}:`));
    assert.equal(treffer.length, 1, `${name}: ${treffer.length}×`);
  }
  // Und nichts darum herum: wer es setzt, entscheidet wo.
  assert.ok(!css.includes('{'), css.slice(0, 60));
});

test('ein unbekanntes Thema faellt auf die Vorgabe zurueck', () => {
  // Eine Einstellungsdatei aus einer aelteren Fassung darf die Oberflaeche
  // nicht farblos lassen.
  assert.equal(themaMit('gibtesnicht').id, THEMEN[0].id);
  assert.equal(themaMit('').id, THEMEN[0].id);
});

test('kanaele und Kontrast rechnen nach WCAG', () => {
  assert.deepEqual(kanaele('#ffffff'), [255, 255, 255]);
  assert.deepEqual(kanaele('#000000'), [0, 0, 0]);
  assert.equal(kanaele('rot'), null);
  // Schwarz auf Weiss ist der Hoechstwert, 21.
  assert.equal(Math.round(kontrast('#000000', '#ffffff')), 21);
  assert.equal(kontrast('#123456', '#123456'), 1);
  assert.equal(kontrast('rot', '#ffffff'), null);
});
