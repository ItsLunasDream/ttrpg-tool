/**
 * Der SRD-Bestand.
 *
 * Die Pruefungen hier tun zwei Dinge. Sie halten die Zahlen fest, damit
 * ein Vertipper beim naechsten Anfassen auffaellt — und sie pruefen die
 * Stellen, an denen die Auslese aus dem PDF Unsinn gebaut haben koennte:
 * Leerzeichen in Zahlen, abgeschnittene Absaetze, ein Eintrag, der in
 * den naechsten hineinlaeuft.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const S = require('../dist/tests/entry.cjs');

test('die Namensnennung ist woertlich und nennt die Fassung', () => {
  assert.equal(S.SRD_FASSUNG, '5.2.1');
  assert.match(S.NAMENSNENNUNG.en, /^This work includes material from the System Reference Document 5\.2\.1/);
  assert.match(S.NAMENSNENNUNG.de, /^Dieses Werk enthält Material aus dem Systemreferenzdokument 5\.2\.1/);
  assert.match(S.NAMENSNENNUNG.en, /creativecommons\.org\/licenses\/by\/4\.0\/legalcode\.$/);
  // Die deutsche Fassung verweist auf die deutsche Lizenzfassung.
  assert.match(S.NAMENSNENNUNG.de, /legalcode\.de\)\.$/);
});

test('es gibt fuenfzehn Zustaende, alle mit Namen in beiden Sprachen', () => {
  assert.equal(S.ZUSTAENDE.length, 15);
  for (const zustand of S.ZUSTAENDE) {
    assert.ok(zustand.name.de.length > 2, zustand.id);
    assert.ok(zustand.name.en.length > 2, zustand.id);
    assert.ok(zustand.text.de.length > 60, zustand.id);
    assert.ok(zustand.text.en.length > 60, zustand.id);
  }
});

test('jede Kennung kommt nur einmal vor', () => {
  const ids = S.ZUSTAENDE.map((z) => z.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('beide Fassungen haben gleich viele Absaetze', () => {
  // Faellt eine Uebersetzung auseinander oder laeuft ein Eintrag in den
  // naechsten, stimmt diese Zahl als Erstes nicht mehr.
  for (const zustand of S.ZUSTAENDE) {
    const de = zustand.text.de.split('\n\n').length;
    const en = zustand.text.en.split('\n\n').length;
    assert.equal(de, en, `${zustand.id}: ${de} gegen ${en}`);
  }
});

test('kein Zustand traegt Text des naechsten Glossareintrags', () => {
  // Der Fehler, der beim Auslesen zuerst passiert ist: die deutsche
  // Fassung lief in „Linie (Wirkungsbereich)" hinein.
  for (const zustand of S.ZUSTAENDE) {
    assert.ok(!/\((Wirkungsbereich|Aktion|Haltung|Gefahr)\)/.test(zustand.text.de), zustand.id);
    assert.ok(!/\[(Area of Effect|Action|Attitude|Hazard)\]/.test(zustand.text.en), zustand.id);
  }
});

test('kein Zustand traegt Reste der Seitenkoepfe', () => {
  for (const zustand of S.ZUSTAENDE) {
    assert.ok(!/System Reference Document/.test(zustand.text.en), zustand.id);
    assert.ok(!/Systemreferenzdokument/.test(zustand.text.de), zustand.id);
  }
});

test('Bewusstlos nennt die beiden anderen Zustaende, die daran haengen', () => {
  const z = S.zustandNach('unconscious');
  assert.match(z.text.en, /Incapacitated and Prone/);
  assert.match(z.text.de, /Kampfunfähig und Liegend/);
});

test('die Erfahrungspunkte je Grad stimmen an den Eckpunkten', () => {
  assert.equal(S.epFuerGrad('1/8'), 25);
  assert.equal(S.epFuerGrad('1/4'), 50);
  assert.equal(S.epFuerGrad('1'), 200);
  assert.equal(S.epFuerGrad('5'), 1800);
  // Die Stelle, an der die PDF-Auslese „11, 50 0" gelesen hat.
  assert.equal(S.epFuerGrad('14'), 11500);
  assert.equal(S.epFuerGrad('30'), 155000);
});

test('die Tabelle hat alle vierunddreissig Grade', () => {
  assert.equal(Object.keys(S.EP_NACH_GRAD).length, 34);
});

test('ein unbekannter Grad ist null und nicht null Punkte', () => {
  assert.equal(S.epFuerGrad('35'), null);
  assert.equal(S.epFuerGrad(''), null);
  assert.equal(S.epFuerGrad('??'), null);
});

test('der Uebungsbonus folgt den Spannen', () => {
  assert.equal(S.uebungsbonus('0'), 2);
  assert.equal(S.uebungsbonus('1/4'), 2);
  assert.equal(S.uebungsbonus('4'), 2);
  assert.equal(S.uebungsbonus('5'), 3);
  assert.equal(S.uebungsbonus('16'), 5);
  assert.equal(S.uebungsbonus('17'), 6);
  assert.equal(S.uebungsbonus('30'), 9);
  assert.equal(S.uebungsbonus('31'), null);
});

test('das Budget ist Stufe mal Figuren', () => {
  // Beispiel 1 aus dem Dokument: vier Charaktere der Stufe 1, niedrig.
  assert.equal(S.budget([{ anzahl: 4, stufe: 1 }], 'niedrig'), 200);
  // Beispiel 2: fuenf Charaktere der Stufe 3, mittel.
  assert.equal(S.budget([{ anzahl: 5, stufe: 3 }], 'mittel'), 1125);
  // Beispiel 3: sechs Charaktere der Stufe 15, hoch.
  assert.equal(S.budget([{ anzahl: 6, stufe: 15 }], 'hoch'), 46800);
});

test('die Stelle mit dem Leerzeichen im PDF: Stufe 17, hoch', () => {
  assert.equal(S.budget([{ anzahl: 1, stufe: 17 }], 'hoch'), 11700);
});

test('gemischte Stufen werden je Zeile gerechnet', () => {
  const gemischt = S.budget([{ anzahl: 3, stufe: 4 }, { anzahl: 1, stufe: 6 }], 'mittel');
  assert.equal(gemischt, 375 * 3 + 1000);
});

test('eine Stufe ausserhalb der Tabelle wird nicht erfunden', () => {
  assert.equal(S.budget([{ anzahl: 4, stufe: 21 }], 'mittel'), null);
  assert.equal(S.budget([{ anzahl: 4, stufe: 0 }], 'mittel'), null);
  assert.equal(S.budget([], 'mittel'), null);
});

test('die Einordnung liest von unten', () => {
  const gruppe = [{ anzahl: 4, stufe: 5 }];
  // niedrig 2000, mittel 3000, hoch 4400
  assert.equal(S.einordnung(1999, gruppe), 'darunter');
  assert.equal(S.einordnung(2000, gruppe), 'niedrig');
  assert.equal(S.einordnung(2999, gruppe), 'niedrig');
  assert.equal(S.einordnung(3000, gruppe), 'mittel');
  assert.equal(S.einordnung(4400, gruppe), 'hoch');
});

test('weit ueber dem hohen Budget ist eine eigene Antwort, nicht „hoch"', () => {
  const gruppe = [{ anzahl: 4, stufe: 5 }];
  const hoch = S.budget(gruppe, 'hoch');
  assert.equal(S.einordnung(hoch * S.DARUEBER_AB, gruppe), 'hoch');
  assert.equal(S.einordnung(hoch * S.DARUEBER_AB + 1, gruppe), 'darueber');
});

test('ohne Gruppe gibt es keine Einordnung', () => {
  assert.equal(S.einordnung(1000, []), null);
});

test('die Monster: 331, jedes in beiden Sprachen, eindeutig', () => {
  assert.equal(S.SRD_MONSTER.length, 331);
  const ids = S.SRD_MONSTER.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const m of S.SRD_MONSTER) {
    assert.ok(m.name.de && m.name.en, m.id);
    assert.equal(m.attribute.length, 6, m.id);
    assert.ok(m.rk >= 5 && m.rk <= 25, `${m.id} RK ${m.rk}`);
    assert.ok(m.tp >= 1, m.id);
    assert.ok(S.KREATURENTYPEN[m.typ], `${m.id} Typ ${m.typ}`);
  }
});

test('die Erfahrungspunkte eines Monsters passen zu seinem Grad', () => {
  // Eine Gegenprobe der Auslese: EP und HG stehen in derselben Zeile, die
  // Tabelle der EP je Grad kommt aus einem anderen Kapitel.
  //
  // Zwei bekannte Abweichungen, beide so im Dokument selbst:
  // - Grad 0 gibt 0 EP bei Wesen ohne Angriff (das Regelwerk sagt „0 oder 10").
  // - Der Archmage steht mit 8.000 EP da, die Tabelle nennt fuer Grad 12
  //   8.400 — in beiden Sprachfassungen gleich. Uebernommen wird, was im
  //   Wertekasten steht; dieser Test haelt fest, dass es der einzige Fall ist.
  const falsch = S.SRD_MONSTER.filter(
    (m) => S.epFuerGrad(m.hg) !== m.ep && !(m.hg === '0' && m.ep === 0)
  ).map((m) => `${m.id}: HG ${m.hg}, ${m.ep} EP`);
  assert.deepEqual(falsch, ['archmage: HG 12, 8000 EP']);
});

test('legendaere Monster haben einen Abschnitt dafuer, die anderen nicht', () => {
  for (const m of S.SRD_MONSTER) {
    assert.equal(m.legendaer, m.abschnitte.some((a) => a.id === 'legendaer'), m.id);
  }
  assert.ok(S.SRD_MONSTER.filter((m) => m.legendaer).length > 20);
});

test('kein Wertekasten traegt Reste der Auslese', () => {
  for (const m of S.SRD_MONSTER) {
    for (const a of m.abschnitte) {
      for (const e of a.eintraege) {
        for (const t of [e.name.de, e.name.en, e.text.de, e.text.en]) {
          assert.ok(!/­|System Reference Document|Systemreferenzdokument/.test(t), `${m.id}: ${t.slice(0, 50)}`);
        }
        assert.ok(e.name.de && e.name.en, `${m.id}: Eintrag ohne Namen`);
      }
    }
  }
});

test('das Glossar: 155 Eintraege, jeder in beiden Sprachen', () => {
  assert.equal(S.GLOSSAR.length, 155);
  const ids = new Set(S.GLOSSAR.map((e) => e.id));
  assert.equal(ids.size, 155);
  for (const e of S.GLOSSAR) {
    assert.ok(e.name.de && e.name.en, e.id);
    assert.ok(e.bloecke.length > 0, e.id);
    for (const v of e.verweise) assert.ok(ids.has(v), `${e.id} verweist auf ${v}`);
  }
});

test('Tabellen im Glossar haben gleich viele Spalten in jeder Reihe, in beiden Sprachen', () => {
  for (const e of S.GLOSSAR) {
    for (const b of e.bloecke) {
      if (b.typ !== 'tabelle') continue;
      for (const sprache of ['de', 'en']) {
        for (const reihe of b.reihen[sprache]) assert.equal(reihe.length, b.kopf[sprache].length, e.id);
      }
      assert.equal(b.reihen.de.length, b.reihen.en.length, e.id);
    }
  }
});

test('im Glossar steht der Zustand Blind so wie in den Zustaenden', () => {
  const blind = S.GLOSSAR.find((e) => e.id === 'blinded');
  assert.equal(blind.name.de, 'Blind');
  assert.equal(blind.tag, 'zustand');
  const zustand = S.ZUSTAENDE.find((z) => z.id === 'blinded');
  assert.ok(zustand.text.en.includes(blind.bloecke[1].text.en.slice(0, 30)));
});

test('jeder Verweisbegriff steht in beiden Sprachen, die laengsten zuerst', () => {
  for (const sprache of ['de', 'en']) {
    const formen = S.verweisformen(sprache);
    assert.ok(formen.length >= 70, `${sprache}: ${formen.length}`);
    for (let i = 1; i < formen.length; i += 1) {
      assert.ok(formen[i - 1].form.length >= formen[i].form.length);
    }
  }
  const de = S.verweisformen('de').map((f) => f.form);
  assert.ok(de.includes('Liegend') && de.includes('schwieriges Gelände') && de.includes('Spurt‑Aktion'));
});

test('der Wert magischer Gegenstaende folgt der Tabelle des SRD', () => {
  assert.equal(S.gegenstandswert('common'), 100);
  assert.equal(S.gegenstandswert('common', { verbrauch: true }), 50);
  // Das Beispiel aus dem Dokument: +1 Armor (Plate Armor) = 4.000 + 1.500.
  assert.equal(S.gegenstandswert('rare', { grundpreis: 1500 }), 5500);
  // Schriftrolle: doppelte Herstellungskosten, Grad 3 = 2 x 150.
  assert.equal(S.gegenstandswert('uncommon', { schriftrolleGrad: 3 }), 300);
  assert.deepEqual(S.SELTENHEITEN.map((s) => S.SELTENHEIT_NAME[s].de), [
    'Gewöhnlich', 'Ungewöhnlich', 'Selten', 'Sehr selten', 'Legendär'
  ]);
});

test('die Requisiten-Tabelle hat hundert Paare, ohne Reste aus dem Satz', () => {
  assert.equal(S.TAND.length, 100);
  for (const [i, paar] of S.TAND.entries()) {
    for (const text of [paar.de, paar.en]) {
      assert.ok(text.length > 5, `${i + 1}: zu kurz`);
      assert.doesNotMatch(text, /­|\s{2}|^\d|Trinket|Requisite/, `${i + 1}: ${text}`);
    }
  }
  assert.equal(S.TAND[0].en, 'A mummified goblin hand');
  assert.equal(S.TAND[99].de, 'Metallene Urne mit der Asche eines Helden');
});

test('die magischen Gegenstaende: alle 258, gepaart, mit gleicher Tabellenform in beiden Sprachen', () => {
  const G = S.MAGISCHE_GEGENSTAENDE;
  assert.equal(G.length, 258);
  assert.equal(new Set(G.map((g) => g.id)).size, 258);
  const nach = Object.fromEntries(G.map((g) => [g.id, g]));
  assert.equal(nach['bag-of-holding'].name.de, 'Nimmervoller Beutel');
  const krabbe = nach['apparatus-of-the-crab'];
  for (const sprache of ['de', 'en']) {
    const t = krabbe.bloecke[sprache].find((b) => b.typ === 'tabelle');
    assert.equal(t.kopf.length, 3, sprache);
    assert.equal(t.reihen.length, 10, sprache);
  }
  for (const g of G) {
    const form = (s) => g.bloecke[s].filter((b) => b.typ === 'tabelle').map((b) => `${b.kopf.length}x${b.reihen.length}`);
    assert.deepEqual(form('de'), form('en'), g.id);
    assert.ok(g.bloecke.de.length > 0 && g.bloecke.en.length > 0, g.id);
    assert.doesNotMatch(JSON.stringify(g), /­/, g.id);
  }
});

test('die Bloecke der Gegenstaende stehen in beiden Sprachen in derselben Folge', () => {
  for (const g of S.MAGISCHE_GEGENSTAENDE) {
    assert.deepEqual(g.bloecke.de.map((b) => b.typ), g.bloecke.en.map((b) => b.typ), g.id);
  }
  const figur = S.MAGISCHE_GEGENSTAENDE.find((g) => g.id === 'figurine-of-wondrous-power');
  const i = figur.bloecke.en.findIndex((b) => b.typ === 'punkt' && b.text.startsWith('Golden Lions'));
  assert.match(figur.bloecke.de[i].text, /^Goldene Löwen/);
});
