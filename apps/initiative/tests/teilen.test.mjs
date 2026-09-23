import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { leererKampf, neuerTeilnehmer, neuerKoerper, beginne, teileKampf, stufe, leseBotschaft, wendeAn, setzeBesitz } = entry;

function kampf() {
  const held = { ...neuerTeilnehmer('Thorin', true), initiative: 15, koerper: [{ ...neuerKoerper('', 30), hp: 22 }] };
  const ork = { ...neuerTeilnehmer('Ork'), initiative: 12, koerper: [{ ...neuerKoerper('', 15), hp: 6 }] };
  return setzeBesitz({ ...leererKampf(), name: 'Waldlager', teilnehmer: [ork, held] }, held.id, 'Anna');
}

test('die geteilte Ansicht zeigt Spieler genau und Gegner nur grob', () => {
  const k = kampf();
  const sicht = teileKampf(k);
  assert.deepEqual(sicht.teilnehmer.map((t) => t.name), ['Thorin', 'Ork']);
  const [held, ork] = sicht.teilnehmer;
  assert.equal(held.koerper[0].hp, 22);
  assert.equal(held.gehoert, 'Anna');
  assert.equal(ork.koerper[0].hp, undefined);
  assert.equal(ork.koerper[0].hpMax, undefined);
  assert.equal(ork.koerper[0].stufe, 'schwer');
  assert.doesNotMatch(JSON.stringify(ork), /"hp"|"hpMax"|"notiz"|"initiative"/);
  const laufend = teileKampf(beginne(k));
  assert.equal(laufend.teilnehmer.find((t) => t.amZug)?.name, 'Thorin');
});

test('die Stufen', () => {
  assert.equal(stufe(15, 15), 'unverletzt');
  assert.equal(stufe(10, 15), 'angeschlagen');
  assert.equal(stufe(7, 15), 'schwer');
  assert.equal(stufe(0, 15), 'kampfunfaehig');
});

test('eine Person aendert ihre eigene Figur, nicht die eines anderen und keinen Gegner', () => {
  const k = kampf();
  const held = k.teilnehmer.find((t) => t.name === 'Thorin');
  const ork = k.teilnehmer.find((t) => t.name === 'Ork');
  const hp = { art: 'hp', teilnehmerId: held.id, koerperId: held.koerper[0].id, hp: 18 };
  assert.equal(wendeAn(k, hp, 'Anna').teilnehmer.find((t) => t.id === held.id).koerper[0].hp, 18);
  assert.equal(wendeAn(k, hp, 'Ben'), null);
  assert.equal(wendeAn(k, { ...hp, teilnehmerId: ork.id, koerperId: ork.koerper[0].id }, 'Anna'), null);
  const mitZustand = wendeAn(k, { art: 'zustand-dazu', teilnehmerId: held.id, name: 'Liegend', runden: null }, 'Anna');
  const z = mitZustand.teilnehmer.find((t) => t.id === held.id).zustaende[0];
  assert.equal(z.name, 'Liegend');
  const ohne = wendeAn(mitZustand, { art: 'zustand-weg', teilnehmerId: held.id, zustandId: z.id }, 'Anna');
  assert.equal(ohne.teilnehmer.find((t) => t.id === held.id).zustaende.length, 0);
});

test('Botschaften aus dem Raum werden streng gelesen', () => {
  assert.deepEqual(leseBotschaft('{"art":"ende"}'), { art: 'ende' });
  assert.equal(leseBotschaft('{"art":"aenderung","aenderung":{"art":"hp","teilnehmerId":"a","koerperId":"b","hp":"viel"}}'), null);
  assert.equal(leseBotschaft('{"art":"loesche"}'), null);
  assert.equal(leseBotschaft('kein json'), null);
  const b = leseBotschaft('{"art":"aenderung","aenderung":{"art":"zustand-dazu","teilnehmerId":"a","name":" Vergiftet ","runden":3}}');
  assert.deepEqual(b.aenderung, { art: 'zustand-dazu', teilnehmerId: 'a', name: 'Vergiftet', runden: 3 });
});
