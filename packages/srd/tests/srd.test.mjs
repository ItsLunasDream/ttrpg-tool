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
