import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { readSettings, writeSettings, sanitizeSettings, DEFAULT_SETTINGS } =
  require('../dist/tests/entry.cjs');

test('die Vorgabe ist die voreingestellte Sprache', () => {
  assert.equal(DEFAULT_SETTINGS.language, 'en');
});

test('sanitizeSettings faengt Unsinn ab', () => {
  assert.deepEqual(sanitizeSettings(null), { ...DEFAULT_SETTINGS });
  assert.deepEqual(sanitizeSettings('kaputt'), { ...DEFAULT_SETTINGS });
  // Eine Sprache, die es nicht gibt, faellt auf die Vorgabe zurueck, statt
  // die Oberflaeche mit lauter rohen Schluesseln zu fuellen.
  assert.deepEqual(sanitizeSettings({ language: 'fr' }), { ...DEFAULT_SETTINGS });
  assert.deepEqual(sanitizeSettings({ language: 'de' }), { language: 'de' });
});

test('unbekannte Felder werden nicht mitgeschleppt', () => {
  // Sonst wuechse die Datei mit jedem Umbau um Reste, die niemand mehr liest.
  assert.deepEqual(sanitizeSettings({ language: 'de', altlast: 42 }), { language: 'de' });
});

test('eine fehlende Datei liefert die Vorgaben', async () => {
  const gelesen = await readSettings(join(tmpdir(), 'gibt-es-nicht-4711', 'einstellungen.json'));
  assert.deepEqual(gelesen, { ...DEFAULT_SETTINGS });
});

test('geschrieben und wieder gelesen kommt dasselbe heraus', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'shell-einst-'));
  try {
    const datei = join(ordner, 'einstellungen.json');
    await writeSettings(datei, { language: 'de' });
    assert.deepEqual(await readSettings(datei), { language: 'de' });
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
});

test('eine kaputte Datei wirft nicht, sondern faellt auf die Vorgaben zurueck', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'shell-einst-'));
  try {
    const datei = join(ordner, 'einstellungen.json');
    await writeFile(datei, '{ das ist kein JSON', 'utf8');
    assert.deepEqual(await readSettings(datei), { ...DEFAULT_SETTINGS });
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
});

test('Schreiben an einen unmoeglichen Ort wirft — und wird nicht verschluckt', async () => {
  // Anders als beim Fensterzustand: wer eine Einstellung umstellt und sie
  // nach dem Neustart nicht wiederfindet, soll das gleich erfahren.
  const ordner = await mkdtemp(join(tmpdir(), 'shell-einst-'));
  try {
    const blockade = join(ordner, 'blockade');
    await writeFile(blockade, 'keine Datei-Ablage', 'utf8');
    await assert.rejects(() => writeSettings(join(blockade, 'einstellungen.json'), { language: 'de' }));
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
});
