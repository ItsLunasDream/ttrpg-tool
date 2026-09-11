import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {
  erzeugeFigur,
  erzeugeFeld,
  namenliste,
  text,
  alsMarkdown,
  FELDER,
  EIGENHEIT_CHANCE,
  STANDARD_WUENSCHE,
  WEIBLICH,
  MAENNLICH,
  NEUTRAL,
  BEINAMEN,
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

/** Die Tabellen mit zweisprachigen Eintraegen. */
const PAARLISTEN = {
  berufe: BERUFE,
  aussehen: AUSSEHEN,
  motivationen: MOTIVATIONEN,
  geheimnisse: GEHEIMNISSE,
  eigenheiten: EIGENHEITEN,
  spezies: SPEZIES
};

test('keine Liste enthaelt etwas doppelt', () => {
  for (const [name, liste] of Object.entries({
    weiblich: WEIBLICH,
    maennlich: MAENNLICH,
    neutral: NEUTRAL
  })) {
    assert.equal(new Set(liste).size, liste.length, `${name} hat Doppelungen`);
  }
  for (const [name, liste] of Object.entries(PAARLISTEN)) {
    for (const sprache of ['de', 'en']) {
      const texte = liste.map((paar) => text(paar, sprache));
      assert.equal(new Set(texte).size, texte.length, `${name} (${sprache}) hat Doppelungen`);
    }
  }
});

test('jeder Eintrag steht in beiden Sprachen da', () => {
  // Fehlt eine Fassung, sieht die Oberflaeche uebersetzt aus, waehrend die
  // Inhalte es nicht sind — genau der Zustand, der behoben werden sollte.
  for (const [name, liste] of Object.entries({ ...PAARLISTEN, beinamen: BEINAMEN })) {
    for (const [nummer, paar] of liste.entries()) {
      assert.ok(paar.de && paar.de.length > 0, `${name} #${nummer}: kein Deutsch`);
      assert.ok(paar.en && paar.en.length > 0, `${name} #${nummer}: kein Englisch`);
    }
  }
});

test('gewuerfelt wird in der Sprache, in der gearbeitet wird', () => {
  // Die Figur traegt fertige Texte, damit man sie vor dem Export aendern
  // kann. Also muss schon beim Wuerfeln die richtige Sprache herauskommen —
  // nachtraeglich uebersetzen wuerde eigene Aenderungen ueberschreiben.
  const deutsche = new Set(BERUFE.map((beruf) => beruf.de));
  const englische = new Set(BERUFE.map((beruf) => beruf.en));

  const rngDe = festerZufall(23);
  for (let i = 0; i < 40; i++) {
    const figur = erzeugeFigur(STANDARD_WUENSCHE, 'de', rngDe);
    assert.ok(deutsche.has(figur.beruf), `${figur.beruf} ist nicht deutsch`);
  }
  const rngEn = festerZufall(23);
  for (let i = 0; i < 40; i++) {
    const figur = erzeugeFigur(STANDARD_WUENSCHE, 'en', rngEn);
    assert.ok(englische.has(figur.beruf), `${figur.beruf} ist nicht englisch`);
  }
});

test('derselbe Zufall ergibt in beiden Sprachen dieselbe Figur', () => {
  // Gleicher Wurf, gleiche Zeilen der Tabellen, nur andere Worte. Faellt das
  // auseinander, stimmt die Zuordnung in einer der beiden Fassungen nicht.
  const de = erzeugeFigur(STANDARD_WUENSCHE, 'de', festerZufall(41));
  const en = erzeugeFigur(STANDARD_WUENSCHE, 'en', festerZufall(41));

  const stelle = (liste, wert, sprache) =>
    liste.findIndex((paar) => text(paar, sprache) === wert);
  assert.equal(stelle(BERUFE, de.beruf, 'de'), stelle(BERUFE, en.beruf, 'en'));
  assert.equal(stelle(AUSSEHEN, de.aussehen, 'de'), stelle(AUSSEHEN, en.aussehen, 'en'));
  assert.equal(stelle(MOTIVATIONEN, de.motivation, 'de'), stelle(MOTIVATIONEN, en.motivation, 'en'));
  // Der Rufname bleibt derselbe — Mara heisst nirgends anders.
  assert.equal(de.name.split(' ')[0], en.name.split(' ')[0]);
});

test('die Spezies des Spielerhandbuchs sind alle dabei', () => {
  const namen = SPEZIES.map((art) => art.de);
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
  // Die Archetypen nennen Berufe ueber die deutsche Fassung — sie ist der
  // Schluessel im Innenleben. Ein Tippfehler faellt sonst erst auf, wenn die
  // Wache ploetzlich Baeckerin ist.
  const deutsche = new Set(BERUFE.map((beruf) => beruf.de));
  for (const archetyp of ARCHETYPEN) {
    for (const beruf of archetyp.berufe) {
      assert.ok(deutsche.has(beruf), `${archetyp.id}: „${beruf}" steht nicht in den Berufen`);
    }
  }
});

// --- Der Erzeuger ----------------------------------------------------------

test('eine Figur hat alle Felder gefuellt, ausser der Eigenheit', () => {
  const figur = erzeugeFigur(STANDARD_WUENSCHE, 'de', festerZufall(3));
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
    if (erzeugeFigur(STANDARD_WUENSCHE, 'de', rng).eigenheit !== '') mit++;
  }
  const anteil = mit / wuerfe;
  assert.ok(
    Math.abs(anteil - EIGENHEIT_CHANCE) < 0.04,
    `${(anteil * 100).toFixed(1)} Prozent statt ${EIGENHEIT_CHANCE * 100}`
  );
});

test('festgehaltene Felder bleiben beim Nachwuerfeln stehen', () => {
  const rng = festerZufall(5);
  const erste = erzeugeFigur(STANDARD_WUENSCHE, 'de', rng);
  const zweite = erzeugeFigur(STANDARD_WUENSCHE, 'de', rng, ['name', 'spezies'], erste);
  assert.equal(zweite.name, erste.name);
  assert.equal(zweite.spezies, erste.spezies);
});

test('ein von Hand geschriebener Text ueberlebt, wenn das Feld festgehalten ist', () => {
  // Genau dafuer traegt die Figur Texte und keine Verweise: ein selbst
  // geschriebener Satz hat in keiner Tabelle eine Stelle.
  const rng = festerZufall(29);
  const erste = erzeugeFigur(STANDARD_WUENSCHE, 'de', rng);
  const eigen = { ...erste, motivation: 'will den Krug zurück, den der Bruder verkauft hat' };
  const zweite = erzeugeFigur(STANDARD_WUENSCHE, 'de', rng, ['motivation'], eigen);
  assert.equal(zweite.motivation, eigen.motivation);
  assert.notEqual(zweite.beruf, undefined);
});

test('eine vorgegebene Spezies wird eingehalten', () => {
  const satyr = SPEZIES.findIndex((art) => art.de === 'Satyr');
  const rng = festerZufall(7);
  for (let i = 0; i < 50; i++) {
    assert.equal(erzeugeFigur({ ...STANDARD_WUENSCHE, spezies: satyr }, 'de', rng).spezies, 'Satyr');
    assert.equal(erzeugeFigur({ ...STANDARD_WUENSCHE, spezies: satyr }, 'en', rng).spezies, 'Satyr');
  }
});

test('ein Archetyp schraenkt den Beruf ein, sonst nichts', () => {
  const wache = ARCHETYPEN.find((a) => a.id === 'wache');
  const rng = festerZufall(9);
  const gesehen = new Set();
  for (let i = 0; i < 60; i++) {
    const figur = erzeugeFigur({ ...STANDARD_WUENSCHE, archetyp: 'wache' }, 'de', rng);
    assert.ok(wache.berufe.includes(figur.beruf), `${figur.beruf} passt nicht zur Wache`);
    gesehen.add(figur.spezies);
  }
  // Die Spezies bleibt frei — sonst saehe jede Wache gleich aus.
  assert.ok(gesehen.size > 3, `nur ${gesehen.size} verschiedene Spezies bei 60 Wachen`);
});

test('ein vorgegebener Namensklang wird eingehalten', () => {
  const rng = festerZufall(13);
  for (let i = 0; i < 40; i++) {
    const figur = erzeugeFigur({ ...STANDARD_WUENSCHE, klang: 'weiblich' }, 'de', rng);
    const rufname = figur.name.split(' ')[0];
    assert.ok(WEIBLICH.includes(rufname), `${rufname} steht nicht in der weiblichen Liste`);
  }
});

test('seltene Spezies bleiben selten', () => {
  // Ueber alle Eintraege gleichverteilt waere jeder zweite Passant ein Golem.
  const rng = festerZufall(17);
  let alltag = 0;
  const wuerfe = 2000;
  for (let i = 0; i < wuerfe; i++) {
    const spezies = erzeugeFigur(STANDARD_WUENSCHE, 'de', rng).spezies;
    if (SPEZIES.some((art) => art.de === spezies && art.haeufig)) alltag++;
  }
  const anteil = alltag / wuerfe;
  assert.ok(anteil > 0.65, `nur ${(anteil * 100).toFixed(0)} Prozent alltaegliche Spezies`);
});

test('der Markdown-Text laesst leere Felder weg und spricht beide Sprachen', () => {
  const grund = erzeugeFigur(STANDARD_WUENSCHE, 'de', festerZufall(31));
  const ohne = alsMarkdown({ ...grund, eigenheit: '' }, 'de');
  assert.ok(!ohne.includes('Eigenheit'), 'eine leere Zeile sagt weniger als keine');
  const mit = alsMarkdown({ ...grund, eigenheit: EIGENHEITEN[0].de }, 'de');
  assert.ok(mit.includes('Eigenheit'));
  assert.ok(mit.includes(EIGENHEITEN[0].de));

  // Die Beschriftungen wechseln mit, die Texte stehen so da, wie sie sind —
  // sie koennten von Hand geschrieben sein.
  const englisch = alsMarkdown({ ...grund, eigenheit: EIGENHEITEN[0].en }, 'en');
  assert.ok(englisch.includes('Quirk'));
  assert.ok(englisch.includes(EIGENHEITEN[0].en));
});
