import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import entry from '../dist/tests/entry.cjs';

const { findeUebernahme } = entry;

/** Baut einen Speicherort mit oder ohne Kampagne darin. */
function speicherort(wurzel, name, mitKampagne) {
  const ort = path.join(wurzel, name, 'vault');
  mkdirSync(path.join(ort, 'campaigns'), { recursive: true });
  if (mitKampagne) {
    mkdirSync(path.join(ort, 'campaigns', 'k1'), { recursive: true });
    writeFileSync(path.join(ort, 'campaigns', 'k1', 'campaign.md'), '---\nid: k1\n---\n');
  }
  return ort;
}

function neuerOrdner() {
  return mkdtempSync(path.join(tmpdir(), 'ueb-test-'));
}

test('uebernimmt einen Speicherort mit Kampagnen', async () => {
  const wurzel = neuerOrdner();
  const alt = speicherort(wurzel, 'backstory-creator', true);
  const settings = path.join(wurzel, 'huelle', 'settings.json');
  assert.equal(await findeUebernahme(settings, [alt]), alt);
});

// Sonst verlegte ein Programmstart, bei dem nie etwas angelegt wurde, den
// Speicherort ohne Not aus dem eigenen Datenordner heraus.
test('uebernimmt keinen leeren Speicherort', async () => {
  const wurzel = neuerOrdner();
  const leer = speicherort(wurzel, 'backstory-creator', false);
  const settings = path.join(wurzel, 'huelle', 'settings.json');
  assert.equal(await findeUebernahme(settings, [leer]), null);
});

// Die wichtigste Grenze: wer schon einmal hier war, hat eine Wahl getroffen —
// und sei es, indem er die Voreinstellung stehen liess.
test('ruehrt eine bestehende Einrichtung nicht an', async () => {
  const wurzel = neuerOrdner();
  const alt = speicherort(wurzel, 'backstory-creator', true);
  const settings = path.join(wurzel, 'huelle', 'settings.json');
  mkdirSync(path.dirname(settings), { recursive: true });
  writeFileSync(settings, JSON.stringify({ vaultRoot: '/woanders' }));
  assert.equal(await findeUebernahme(settings, [alt]), null);
});

test('nimmt den ersten Kandidaten, der etwas enthaelt', async () => {
  const wurzel = neuerOrdner();
  const leer = speicherort(wurzel, 'leer-vorn', false);
  const voll = speicherort(wurzel, 'voll-hinten', true);
  const settings = path.join(wurzel, 'huelle', 'settings.json');
  assert.equal(await findeUebernahme(settings, [leer, voll]), voll);
});

test('ohne Kandidaten und bei fehlenden Ordnern passiert nichts', async () => {
  const wurzel = neuerOrdner();
  const settings = path.join(wurzel, 'huelle', 'settings.json');
  assert.equal(await findeUebernahme(settings, undefined), null);
  assert.equal(await findeUebernahme(settings, []), null);
  assert.equal(await findeUebernahme(settings, [path.join(wurzel, 'gibt-es-nicht')]), null);
});
