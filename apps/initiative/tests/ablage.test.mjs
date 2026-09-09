import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import entry from '../dist/tests/entry.cjs';

const { Ablage, neuerTeilnehmer } = entry;

function neueAblage() {
  const wurzel = mkdtempSync(path.join(tmpdir(), 'abl-'));
  return { wurzel, ablage: new Ablage(wurzel) };
}

// Der Bildname kommt aus einer Begegnungsdatei, und die kann von Hand
// geaendert worden sein. Ohne diese Pruefung waere `../../etc/passwd` ein
// gueltiger „Bildname" — und das Protokoll liefe damit ins Dateisystem.
test('bildPfad weist alles ab, was nicht wie ein abgelegtes Bild aussieht', () => {
  const { ablage } = neueAblage();
  for (const boese of [
    '../../etc/passwd',
    '..%2F..%2Fetc',
    '/etc/passwd',
    'a'.repeat(16) + '.png/../../x',
    'kurz.png',
    'GROSSBUCHSTABEN0.png',
    '0123456789abcdef.averylongextension',
    '0123456789abcdef',
    ''
  ]) {
    assert.equal(ablage.bildPfad(boese), null, `haette abgewiesen werden muessen: ${boese}`);
  }
});

test('bildPfad nimmt an, was legeBildAb vergeben wuerde', () => {
  const { ablage, wurzel } = neueAblage();
  const pfad = ablage.bildPfad('0123456789abcdef.png');
  assert.equal(pfad, path.join(wurzel, 'bilder', '0123456789abcdef.png'));
});

test('legeBildAb kopiert und benennt nach dem Inhalt', async () => {
  const { ablage, wurzel } = neueAblage();
  await ablage.init();
  const quelle = path.join(wurzel, 'Bild mit Leerzeichen & Umlaut ä.png');
  writeFileSync(quelle, 'inhalt-a');
  const name = await ablage.legeBildAb(quelle);
  assert.match(name, /^[a-f0-9]{16}\.png$/, `unerwarteter Name: ${name}`);
  assert.ok(existsSync(path.join(wurzel, 'bilder', name)), 'die Kopie muss liegen');
  assert.equal(readFileSync(path.join(wurzel, 'bilder', name), 'utf8'), 'inhalt-a');
});

// Zweimal dasselbe Bild soll einmal daliegen — sonst waechst der Ordner bei
// jedem Einfuegen.
test('dasselbe Bild zweimal ergibt eine Datei', async () => {
  const { ablage, wurzel } = neueAblage();
  await ablage.init();
  const a = path.join(wurzel, 'a.png');
  const b = path.join(wurzel, 'b.png');
  writeFileSync(a, 'gleicher inhalt');
  writeFileSync(b, 'gleicher inhalt');
  assert.equal(await ablage.legeBildAb(a), await ablage.legeBildAb(b));
});

test('Begegnungen werden geschrieben, gelesen und gelistet', async () => {
  const { ablage } = neueAblage();
  await ablage.init();
  await ablage.speichereBegegnung({
    schemaVersion: 1,
    id: 'hoehle',
    name: 'Höhle',
    teilnehmer: [neuerTeilnehmer('Goblin')],
    taktik: 'Von hinten.'
  });
  const gelesen = await ablage.leseBegegnungMitId('hoehle');
  assert.equal(gelesen.name, 'Höhle');
  assert.equal(gelesen.taktik, 'Von hinten.');
  const liste = await ablage.listeBegegnungen();
  assert.equal(liste.length, 1);
});

// Eine kaputte Datei darf die Liste nicht kippen — die uebrigen Begegnungen
// soll man trotzdem oeffnen koennen.
test('eine unlesbare Datei kippt die Liste nicht', async () => {
  const { ablage, wurzel } = neueAblage();
  await ablage.init();
  await ablage.speichereBegegnung({
    schemaVersion: 1, id: 'gut', name: 'Gut', teilnehmer: [], taktik: ''
  });
  // Ein Verzeichnis mit .md-Endung: readFile scheitert daran.
  mkdirSync(path.join(wurzel, 'begegnungen', 'kaputt.md'));
  const liste = await ablage.listeBegegnungen();
  assert.equal(liste.length, 1);
  assert.equal(liste[0].id, 'gut');
});

test('eine ungueltige ID kommt nicht in einen Pfad', async () => {
  const { ablage } = neueAblage();
  await ablage.init();
  await assert.rejects(() => ablage.leseBegegnungMitId('../../etc/passwd'));
  await assert.rejects(() =>
    ablage.speichereBegegnung({ schemaVersion: 1, id: '../weg', name: 'X', teilnehmer: [], taktik: '' })
  );
});

test('der laufende Kampf ueberlebt Schreiben und Lesen', async () => {
  const { ablage } = neueAblage();
  await ablage.init();
  assert.equal(await ablage.leseKampf(), null, 'ohne Datei kommt null');
  const kampf = {
    schemaVersion: 1, begegnungId: null, name: 'Test',
    teilnehmer: [neuerTeilnehmer('A')], amZug: 0, runde: 2, laeuft: true
  };
  await ablage.schreibeKampf(kampf);
  const gelesen = await ablage.leseKampf();
  assert.equal(gelesen.runde, 2);
  assert.equal(gelesen.teilnehmer[0].name, 'A');
});

test('eine kaputte Kampfdatei liefert null statt eines Absturzes', async () => {
  const { ablage, wurzel } = neueAblage();
  await ablage.init();
  writeFileSync(path.join(wurzel, 'kampf.json'), '{kaputt');
  assert.equal(await ablage.leseKampf(), null);
});

test('verwaiste Bilder sind die, die niemand mehr benutzt', async () => {
  const { ablage, wurzel } = neueAblage();
  await ablage.init();
  const quelle = path.join(wurzel, 'x.png');
  writeFileSync(quelle, 'benutzt');
  const benutzt = await ablage.legeBildAb(quelle);
  writeFileSync(path.join(wurzel, 'y.png'), 'verwaist');
  const verwaist = await ablage.legeBildAb(path.join(wurzel, 'y.png'));

  await ablage.speichereBegegnung({
    schemaVersion: 1, id: 'a', name: 'A',
    teilnehmer: [{ ...neuerTeilnehmer('Mit Bild'), bild: benutzt }],
    taktik: ''
  });
  assert.deepEqual(await ablage.verwaisteBilder(), [verwaist]);
});
