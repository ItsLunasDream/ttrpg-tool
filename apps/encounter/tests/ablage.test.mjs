import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

const BEGEGNUNG = {
  id: 'hoehlenkampf',
  name: 'Höhlenkampf',
  gegner: [
    { monsterId: 'frostwaechter', name: 'Frostwächter', anzahl: 3 },
    { monsterId: 'ghul', name: 'Ghul', anzahl: 1 }
  ],
  umgebungId: 'hoehle',
  notiz: 'Die Brücke bricht in Runde 3.',
  geaendert: '2026-09-22T09:00:00.000Z'
};

test('eine Begegnung uebersteht Schreiben und Lesen', () => {
  const zurueck = T.leseBegegnung(T.alsMarkdown(BEGEGNUNG), 'ersatz');
  assert.equal(zurueck.name, 'Höhlenkampf');
  assert.equal(zurueck.umgebungId, 'hoehle');
  assert.equal(zurueck.notiz, 'Die Brücke bricht in Runde 3.');
  assert.deepEqual(
    zurueck.gegner.map((g) => `${g.anzahl}x${g.monsterId}`),
    ['3xfrostwaechter', '1xghul']
  );
});

test('die Gegner stehen als JSON im Kopf, nicht als Liste im Leib', () => {
  // Der Leib wird beim Speichern neu erzeugt; stuenden die Daten dort,
  // machte jede Textaenderung sie kaputt.
  const text = T.alsMarkdown(BEGEGNUNG);
  const kopf = text.split('---')[1];
  assert.match(kopf, /gegner: \[/);
});

test('die Gegnerliste steht trotzdem lesbar im Leib', () => {
  const text = T.alsMarkdown(BEGEGNUNG);
  assert.match(text, /- 3× Frostwächter/);
});

test('eine kaputte Datei wird nicht abgelehnt', () => {
  // Am Spieltisch ist eine halbe Begegnung brauchbar, eine Fehlermeldung
  // nicht.
  const zurueck = T.leseBegegnung('kein Kopf, nur Text', 'hinterhalt');
  assert.equal(zurueck.id, 'hinterhalt');
  assert.equal(zurueck.name, 'hinterhalt');
  assert.deepEqual(zurueck.gegner, []);
});

test('ein Gegner ohne Anzahl zaehlt als einer', () => {
  const zurueck = T.leseBegegnung(
    '---\nid: x\nname: X\ngegner: [{"monsterId":"wolf","name":"Wolf"}]\n---\n',
    'x'
  );
  assert.equal(zurueck.gegner[0].anzahl, 1);
});

test('eine unsinnige Anzahl loescht den Gegner nicht', () => {
  // Sonst verschwaende ein Tippfehler stillschweigend eine Zeile.
  const zurueck = T.leseBegegnung(
    '---\nid: x\nname: X\ngegner: [{"monsterId":"wolf","name":"Wolf","anzahl":0}]\n---\n',
    'x'
  );
  assert.equal(zurueck.gegner.length, 1);
  assert.equal(zurueck.gegner[0].anzahl, 1);
});

test('der Name eines Gegners steht mit in der Datei', () => {
  // Damit ein geloeschtes Monster sichtbar fehlt statt als leere Zeile
  // dazustehen.
  const text = T.alsMarkdown(BEGEGNUNG);
  assert.match(text, /Frostwächter/);
});

test('gezaehlt werden Wesen, nicht Sorten', () => {
  assert.equal(T.gegnerzahl(BEGEGNUNG.gegner), 4);
});

test('zwei gleichnamige Begegnungen ueberschreiben einander nicht', () => {
  assert.equal(T.freieKennung('hinterhalt', []), 'hinterhalt');
  assert.equal(T.freieKennung('hinterhalt', ['hinterhalt']), 'hinterhalt-2');
  assert.equal(T.freieKennung('hinterhalt', ['hinterhalt', 'hinterhalt-2']), 'hinterhalt-3');
});

test('eine Notiz mit einer weiteren Ueberschrift dahinter bleibt ganz', () => {
  const mit = { ...BEGEGNUNG, notiz: 'Zeile eins\n\nZeile zwei' };
  assert.equal(T.leseBegegnung(T.alsMarkdown(mit), 'x').notiz, 'Zeile eins\n\nZeile zwei');
});

test('eine leere Begegnung laesst sich anlegen', () => {
  const neu = T.leereBegegnung('Hinterhalt am Fluss', '2026-01-01T00:00:00.000Z');
  assert.equal(neu.id, 'hinterhalt-am-fluss');
  assert.deepEqual(neu.gegner, []);
  assert.equal(T.leseBegegnung(T.alsMarkdown(neu), 'x').name, 'Hinterhalt am Fluss');
});

test('die Suche findet ueber die Gegnernamen', () => {
  const eintraege = [T.alsEintrag(BEGEGNUNG), T.alsEintrag({ ...BEGEGNUNG, id: 'b2', name: 'Lager', gegner: [] })];
  assert.deepEqual(T.finde(eintraege, 'ghul').map((e) => e.id), ['hoehlenkampf']);
  assert.equal(T.finde(eintraege, 'kaelte').length, 0);
});

test('Umlaute stoeren die Suche nicht', () => {
  const eintraege = [T.alsEintrag(BEGEGNUNG)];
  assert.equal(T.finde(eintraege, 'hohlenkampf').length, 1);
  assert.equal(T.finde(eintraege, 'FROSTWÄCHTER').length, 1);
});

test('sortiert wird nach zuletzt geaendert, wenn nichts anderes gesagt ist', () => {
  const alt = T.alsEintrag({ ...BEGEGNUNG, id: 'alt', geaendert: '2020-01-01T00:00:00.000Z' });
  const neu = T.alsEintrag({ ...BEGEGNUNG, id: 'neu', geaendert: '2026-01-01T00:00:00.000Z' });
  assert.deepEqual(T.finde([alt, neu], '').map((e) => e.id), ['neu', 'alt']);
});

test('ohne Namen bekommt eine Begegnung die kleinste freie Nummer', () => {
  assert.equal(T.naechsterName([]), 'Encounter_1');
  assert.equal(T.naechsterName(['Encounter_1', 'Hinterhalt']), 'Encounter_2');
  // Eine Luecke wird gefuellt, gross und klein zaehlen gleich.
  assert.equal(T.naechsterName(['encounter_1', 'Encounter_3']), 'Encounter_2');
});
