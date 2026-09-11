import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {
  erzeugeFigur,
  erzeugeFeld,
  alsMarkdown,
  FELDER,
  EIGENHEIT_CHANCE,
  STANDARD_WUENSCHE,
  WEIBLICH,
  MAENNLICH,
  NEUTRAL,
  SPEZIES,
  BERUFE,
  AUSSEHEN,
  MOTIVATIONEN,
  GEHEIMNISSE,
  EIGENHEITEN,
  ARCHETYPEN
} = entry;

/** Ein Zufallsgeber, der immer dieselbe Folge liefert. */
function festerZufall(saat = 1) {
  let zustand = saat;
  return () => {
    zustand = (zustand * 1103515245 + 12345) % 2147483648;
    return zustand / 2147483648;
  };
}

// --- Die Tabellen selbst ---------------------------------------------------

test('von jedem Namensklang gibt es mindestens hundert', () => {
  // Der Reiz des Werkzeugs haengt an der Auswahl: bei dreissig Namen erkennt
  // man den Generator nach einer Sitzung wieder.
  for (const [name, liste] of [
    ['weiblich', WEIBLICH],
    ['maennlich', MAENNLICH],
    ['neutral', NEUTRAL]
  ]) {
    assert.ok(liste.length >= 100, `${name}: nur ${liste.length} Namen`);
  }
});

test('keine Liste enthaelt etwas doppelt', () => {
  const listen = {
    weiblich: WEIBLICH,
    maennlich: MAENNLICH,
    neutral: NEUTRAL,
    berufe: BERUFE,
    aussehen: AUSSEHEN,
    motivationen: MOTIVATIONEN,
    geheimnisse: GEHEIMNISSE,
    eigenheiten: EIGENHEITEN,
    spezies: SPEZIES.map((art) => art.name)
  };
  for (const [name, liste] of Object.entries(listen)) {
    const einmalig = new Set(liste);
    assert.equal(einmalig.size, liste.length, `${name} hat Doppelungen`);
  }
});

test('die Spezies des Spielerhandbuchs sind alle dabei', () => {
  const namen = SPEZIES.map((art) => art.name);
  for (const art of [
    'Mensch', 'Elf', 'Zwerg', 'Halbling', 'Gnom',
    'Halbelf', 'Halbork', 'Drachenblütiger', 'Tiefling'
  ]) {
    assert.ok(namen.includes(art), `${art} fehlt`);
  }
  // Und daneben genug anderes, sonst stuende hinter der Theke nie ein Satyr.
  assert.ok(namen.length >= 40, `nur ${namen.length} Spezies`);
  for (const art of ['Fairy', 'Satyr', 'Golem']) {
    assert.ok(namen.includes(art), `${art} fehlt`);
  }
});

test('jeder Archetyp verweist auf Berufe, die es gibt', () => {
  for (const archetyp of ARCHETYPEN) {
    for (const beruf of archetyp.berufe) {
      assert.ok(BERUFE.includes(beruf), `${archetyp.id}: „${beruf}" steht nicht in den Berufen`);
    }
  }
});

// --- Der Erzeuger ----------------------------------------------------------

test('eine Figur hat alle Felder gefuellt, ausser der Eigenheit', () => {
  const figur = erzeugeFigur(STANDARD_WUENSCHE, festerZufall(3));
  for (const feld of FELDER) {
    if (feld === 'eigenheit') continue;
    assert.ok(figur[feld].length > 0, `${feld} ist leer`);
  }
});

test('Eigenheiten sind die Ausnahme, nicht die Regel', () => {
  // Der wichtigste Test des Werkzeugs. Haette jede Figur eine Marotte, waere
  // keine mehr besonders — nach drei Begegnungen saesse eine Parade von
  // Karikaturen am Tisch.
  const rng = festerZufall(11);
  let mit = 0;
  const wuerfe = 4000;
  for (let i = 0; i < wuerfe; i++) {
    if (erzeugeFigur(STANDARD_WUENSCHE, rng).eigenheit !== '') mit++;
  }
  const anteil = mit / wuerfe;
  assert.ok(
    Math.abs(anteil - EIGENHEIT_CHANCE) < 0.04,
    `${(anteil * 100).toFixed(1)} Prozent statt ${EIGENHEIT_CHANCE * 100}`
  );
});

test('festgehaltene Felder bleiben beim Nachwuerfeln stehen', () => {
  const rng = festerZufall(5);
  const erste = erzeugeFigur(STANDARD_WUENSCHE, rng);
  const zweite = erzeugeFigur(STANDARD_WUENSCHE, rng, ['name', 'spezies'], erste);
  assert.equal(zweite.name, erste.name);
  assert.equal(zweite.spezies, erste.spezies);
});

test('eine vorgegebene Spezies wird eingehalten', () => {
  const rng = festerZufall(7);
  for (let i = 0; i < 50; i++) {
    const figur = erzeugeFigur({ ...STANDARD_WUENSCHE, spezies: 'Satyr' }, rng);
    assert.equal(figur.spezies, 'Satyr');
  }
});

test('ein Archetyp schraenkt den Beruf ein, sonst nichts', () => {
  const wache = ARCHETYPEN.find((a) => a.id === 'wache');
  const rng = festerZufall(9);
  const gesehen = new Set();
  for (let i = 0; i < 60; i++) {
    const figur = erzeugeFigur({ ...STANDARD_WUENSCHE, archetyp: 'wache' }, rng);
    assert.ok(wache.berufe.includes(figur.beruf), `${figur.beruf} passt nicht zur Wache`);
    gesehen.add(figur.spezies);
  }
  // Die Spezies bleibt frei — sonst saehe jede Wache gleich aus.
  assert.ok(gesehen.size > 3, `nur ${gesehen.size} verschiedene Spezies bei 60 Wachen`);
});

test('ein vorgegebener Namensklang wird eingehalten', () => {
  const rng = festerZufall(13);
  for (let i = 0; i < 40; i++) {
    const name = erzeugeFeld('name', { ...STANDARD_WUENSCHE, klang: 'weiblich' }, rng);
    const rufname = name.split(' ')[0];
    assert.ok(WEIBLICH.includes(rufname), `${rufname} steht nicht in der weiblichen Liste`);
  }
});

test('seltene Spezies bleiben selten', () => {
  // Ueber alle Eintraege gleichverteilt waere jeder zweite Passant ein Golem.
  const rng = festerZufall(17);
  const haeufige = new Set(SPEZIES.filter((a) => a.haeufig).map((a) => a.name));
  let alltag = 0;
  const wuerfe = 2000;
  for (let i = 0; i < wuerfe; i++) {
    if (haeufige.has(erzeugeFigur(STANDARD_WUENSCHE, rng).spezies)) alltag++;
  }
  const anteil = alltag / wuerfe;
  assert.ok(anteil > 0.65, `nur ${(anteil * 100).toFixed(0)} Prozent alltaegliche Spezies`);
});

test('der Markdown-Text laesst leere Felder weg', () => {
  const ohne = alsMarkdown({
    name: 'Mara', spezies: 'Mensch', beruf: 'Wirtin',
    aussehen: 'eine Narbe', motivation: 'will weg', geheimnis: 'kann lesen',
    eigenheit: ''
  });
  assert.ok(!ohne.includes('Eigenheit'), 'eine leere Zeile sagt weniger als keine');
  const mit = alsMarkdown({
    name: 'Mara', spezies: 'Mensch', beruf: 'Wirtin',
    aussehen: 'eine Narbe', motivation: 'will weg', geheimnis: 'kann lesen',
    eigenheit: 'duzt sofort jeden'
  });
  assert.ok(mit.includes('duzt sofort jeden'));
});
