import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const L = require('../dist/tests/entry.cjs');

test('Zeilen mit und ohne Spanne werden zu Eintraegen', () => {
  const e = L.alsEintraege('1-3: 2d6 × 10 Kupfer\n\n4: [Taschenkram]\n5–6: Rubin\nNur Text\n  ');
  assert.deepEqual(e, [
    { text: '2d6 × 10 Kupfer', von: 1, bis: 3 },
    { text: '[Taschenkram]', von: 4, bis: 4 },
    { text: 'Rubin', von: 5, bis: 6 },
    { text: 'Nur Text' }
  ]);
  assert.equal(L.alsZeilen(e), '1-3: 2d6 × 10 Kupfer\n4: [Taschenkram]\n5-6: Rubin\nNur Text');
});

test('eine vertauschte Spanne wird gerade gerueckt', () => {
  assert.deepEqual(L.alsEintraege('6-4: X'), [{ text: 'X', von: 4, bis: 6 }]);
});

test('eine Tabelle kommt aus der Datei zurueck, wie sie hineinging', () => {
  const t = {
    id: 'bande',
    name: 'Beute: Räuber "Rotbart"',
    wuerfel: '1W6',
    ohneZuruecklegen: true,
    eintraege: [{ text: 'Kupfer', von: 1, bis: 3 }, { text: '[Taschenkram]', von: 4, bis: 6 }],
    notiz: 'Zweite Zeile\nmit Umbruch',
    geaendert: '2026-09-22T20:00:00.000Z'
  };
  const zurueck = L.leseTabelle(L.alsMarkdown(t), 'bande');
  assert.deepEqual(zurueck, t);
});

test('eine von Hand geschriebene Datei ohne Kopf wird gelesen', () => {
  const t = L.leseTabelle('Ein paar Worte davor\n\n- Apfel\n* Birne\n\n## Notiz\n\nHallo', 'obst');
  assert.equal(t.name, 'obst');
  assert.deepEqual(t.eintraege, [{ text: 'Apfel' }, { text: 'Birne' }]);
  assert.equal(t.notiz, 'Hallo');
  assert.equal(t.ohneZuruecklegen, false);
});

test('Namen und Kennungen', () => {
  assert.equal(L.zuId('Beute einer Räuberbande'), 'beute-einer-raeuberbande');
  assert.equal(L.freieKennung('a', ['a', 'a-2']), 'a-3');
  assert.equal(L.naechsterName('Tabelle', ['Tabelle_1', 'tabelle_2']), 'Tabelle_3');
});

test('die Pruefung findet Luecken, Doppelte und Werte ausserhalb des Wuerfels', () => {
  const t = {
    id: 'x',
    name: 'X',
    wuerfel: '1d6',
    eintraege: [
      { text: 'a', von: 1, bis: 2 },
      { text: 'b', von: 2, bis: 3 },
      { text: 'c', von: 6, bis: 7 }
    ]
  };
  const arten = L.pruefe(t, [t]).map((b) => b.art + (b.von ? `${b.von}-${b.bis}` : b.zahl ?? ''));
  assert.deepEqual(arten, ['luecke4-5', 'doppelt2', 'ausserhalb7']);
});

test('die Pruefung meldet Wuerfel ohne Spannen, Spannen ohne Wuerfel und Unlesbares', () => {
  const art = (t) => L.pruefe({ id: 'x', name: 'X', ...t }, []).map((b) => b.art);
  assert.deepEqual(art({ wuerfel: '1d4', eintraege: [{ text: 'a' }] }), ['wuerfel-ohne-spannen']);
  assert.deepEqual(art({ eintraege: [{ text: 'a', von: 1, bis: 1 }] }), ['spannen-ohne-wuerfel']);
  assert.deepEqual(art({ wuerfel: 'viele', eintraege: [{ text: 'a' }] }), ['wuerfel-unlesbar']);
  assert.deepEqual(art({ wuerfel: '1W2', eintraege: [{ text: 'a', von: 1 }, { text: 'b', von: 2 }] }), []);
});

test('die Pruefung findet lose Verweise und den Verweis auf sich selbst', () => {
  const kram = { id: 'kram', name: 'Taschenkram', eintraege: [{ text: 'Kamm' }] };
  const t = { id: 't', name: 'Bande', eintraege: [{ text: '[taschenkram] und [Gibtsnicht]' }, { text: '[Bande]' }] };
  assert.deepEqual(
    L.pruefe(t, [kram, t]).map((b) => b.art),
    ['verweis-fehlt', 'verweis-selbst']
  );
});

test('riesige Spannen und Wuerfel legen die Pruefung nicht lahm', () => {
  const t = { id: 'x', name: 'X', wuerfel: '1d6', eintraege: [{ text: 'a', von: 1, bis: 100000000 }] };
  const beginn = Date.now();
  L.pruefe(t, []);
  L.pruefe({ ...t, wuerfel: '1d100000000' }, []);
  assert.ok(Date.now() - beginn < 500);
});

test('die Beispieltabellen verweisen in jeder Sprache nur auf vorhandene Tabellen und sind formal sauber', () => {
  for (const sprache of ['de', 'en']) {
    const satz = L.beispiele(sprache);
    assert.equal(satz.length, 3);
    for (const t of satz) assert.deepEqual(L.pruefe(t, satz), [], `${sprache}: ${t.name}`);
    assert.deepEqual(L.loseEnden(satz), []);
    // Und sie wuerfeln ohne offene Klammern und ohne ungewuerfelte Wuerfel.
    for (let i = 0; i < 50; i += 1) {
      const text = L.wuerfle(satz[2], satz, Math.random).text;
      assert.doesNotMatch(text, /\[|\d+[dW]\d+/, text);
    }
  }
});

test('die Beispiele beider Sprachen tragen dieselben Spannen und Wuerfel', () => {
  const de = L.beispiele('de');
  const en = L.beispiele('en');
  for (let i = 0; i < de.length; i += 1) {
    assert.equal(de[i].wuerfel, en[i].wuerfel);
    assert.equal(Boolean(de[i].ohneZuruecklegen), Boolean(en[i].ohneZuruecklegen));
    assert.deepEqual(
      de[i].eintraege.map((e) => [e.von, e.bis]),
      en[i].eintraege.map((e) => [e.von, e.bis])
    );
  }
});
