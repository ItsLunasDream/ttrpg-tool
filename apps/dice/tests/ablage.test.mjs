/**
 * Die Einstellungen des Wuerfels landen heil auf der Platte.
 *
 * Aus einem roten Rauchtest: „Unexpected non-whitespace character after JSON
 * at position 170 (line 11 column 1)". Die Datei ist 169 Zeichen in zehn
 * Zeilen lang — es stand also ein vollstaendiger Stand darin und dahinter
 * noch etwas.
 *
 * **Diese Pruefungen sind kein Waechter gegen jenen Fehler.** Sie laufen
 * auch mit dem alten, ungeschuetzten Schreiben durch; nachstellen liess er
 * sich nicht. Was sie festhalten, ist das Verhalten, auf das der Umbau
 * setzt: gleichzeitige Aenderungen hinterlassen einen vollstaendigen Stand,
 * und der letzte gewinnt. Mit echten Dateien, nicht mit Attrappen — die
 * Frage stellt sich im Dateisystem, nicht in der Rechnung.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function frischerOrdner() {
  return mkdtempSync(path.join(tmpdir(), 'wuerfel-ablage-'));
}

test('was geschrieben wurde, laesst sich wieder lesen', async () => {
  const ablage = new T.Ablage(frischerOrdner());
  await ablage.init();
  const gesetzt = await ablage.schreiben({ ...T.STANDARD, farbe: '#e0af68' });
  assert.equal(gesetzt.farbe, '#e0af68');
  assert.equal((await ablage.lesen()).farbe, '#e0af68');
});

test('viele Schreibvorgaenge auf einmal hinterlassen gueltiges JSON', async () => {
  const ordner = frischerOrdner();
  const ablage = new T.Ablage(ordner);
  await ablage.init();

  const farben = Array.from({ length: 20 }, (_, i) => `#${String(i).padStart(2, '0')}af68`);
  await Promise.all(farben.map((farbe) => ablage.schreiben({ ...T.STANDARD, farbe })));

  const roh = readFileSync(path.join(ordner, 'einstellungen.json'), 'utf8');
  // Nicht bloss „laesst sich lesen": `lesen` faengt Fehler ab und liefert
  // den Standard. Hier soll die Datei selbst heil sein.
  const gelesen = JSON.parse(roh);
  assert.ok(farben.includes(gelesen.farbe), `unerwartete Farbe: ${gelesen.farbe}`);
  assert.equal(roh.trimEnd().endsWith('}'), true, roh.slice(0, 200));
});

test('ein langer und ein kurzer Stand hinterlassen keinen Rest', async () => {
  // Verschieden lange Staende: ein kurzer ueber einem langen darf keinen
  // Schwanz stehenlassen. Genau diese Form hatte die kaputte Datei.
  const ordner = frischerOrdner();
  const ablage = new T.Ablage(ordner);
  await ablage.init();

  await Promise.all([
    ablage.schreiben({ ...T.STANDARD, eigeneSeiten: 100, farbe: '#aabbcc' }),
    ablage.schreiben({ ...T.STANDARD, eigeneSeiten: 3, farbe: '#abc123' })
  ]);
  const roh = readFileSync(path.join(ordner, 'einstellungen.json'), 'utf8');
  assert.doesNotThrow(() => JSON.parse(roh), roh.slice(0, 300));
  assert.equal(roh.split('{').length - 1, 1, `mehr als ein Stand in der Datei:\n${roh}`);
});
