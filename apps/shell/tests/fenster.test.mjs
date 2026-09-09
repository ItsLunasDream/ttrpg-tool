import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const {
  sanitize,
  isVisibleOnSomeDisplay,
  readWindowState,
  writeWindowState,
  DEFAULT_STATE,
  MIN_WIDTH,
  MIN_HEIGHT
} = require('../dist/tests/entry.cjs');

const VOLLBILD = [{ x: 0, y: 0, width: 1920, height: 1080 }];

test('sanitize faengt Unsinn aus der Datei ab', () => {
  assert.deepEqual(sanitize(null), { ...DEFAULT_STATE });
  assert.deepEqual(sanitize('kaputt'), { ...DEFAULT_STATE });

  const winzig = sanitize({ width: 10, height: 10 });
  assert.equal(winzig.width, MIN_WIDTH, 'zu schmal wird auf das Minimum gehoben');
  assert.equal(winzig.height, MIN_HEIGHT, 'zu niedrig wird auf das Minimum gehoben');

  // NaN und Infinity kommen aus kaputten Dateien und wuerden Electron beim
  // Setzen der Fenstergroesse werfen lassen.
  const kaputteZahlen = sanitize({ x: NaN, y: Infinity, width: NaN, height: 900 });
  assert.equal(kaputteZahlen.x, undefined);
  assert.equal(kaputteZahlen.y, undefined);
  assert.equal(kaputteZahlen.width, DEFAULT_STATE.width);
  assert.equal(kaputteZahlen.height, 900);

  assert.equal(sanitize({ maximized: 'ja' }).maximized, false, 'nur echtes true zaehlt');
});

test('ein Fenster auf dem Bildschirm gilt als sichtbar', () => {
  assert.equal(
    isVisibleOnSomeDisplay({ x: 100, y: 100, width: 1280, height: 860, maximized: false }, VOLLBILD),
    true
  );
});

test('ein Fenster auf einem abgezogenen zweiten Bildschirm gilt als unsichtbar', () => {
  // Genau der Fall, um den es geht: gespeichert wurde die Lage auf einem
  // zweiten Monitor bei x=2000, beim naechsten Start haengt der nicht mehr dran.
  assert.equal(
    isVisibleOnSomeDisplay({ x: 2400, y: 300, width: 1280, height: 860, maximized: false }, VOLLBILD),
    false
  );
});

test('ein leicht ueber den Rand geschobenes Fenster behaelt seine Lage', () => {
  assert.equal(
    isVisibleOnSomeDisplay({ x: 1800, y: 100, width: 1280, height: 860, maximized: false }, VOLLBILD),
    true,
    'ein greifbares Stueck genuegt, sonst springt das Fenster grundlos zurueck'
  );
});

test('ein nur mit einem Zipfel sichtbares Fenster gilt als unsichtbar', () => {
  assert.equal(
    isVisibleOnSomeDisplay({ x: 1900, y: 1040, width: 1280, height: 860, maximized: false }, VOLLBILD),
    false,
    '20 mal 40 Pixel reichen nicht zum Anfassen'
  );
});

test('ohne bekannte Bildschirme wird die Lage nicht verworfen', () => {
  assert.equal(
    isVisibleOnSomeDisplay({ x: 100, y: 100, width: 1280, height: 860, maximized: false }, []),
    true,
    'eine leere Bildschirmliste ist keine Auskunft, sondern das Fehlen einer Auskunft'
  );
});

test('eine fehlende Datei liefert die Standardlage', async () => {
  const zustand = await readWindowState(join(tmpdir(), 'gibt-es-nicht-4711', 'fenster.json'), VOLLBILD);
  assert.deepEqual(zustand, { ...DEFAULT_STATE });
});

test('geschrieben und wieder gelesen kommt dasselbe heraus', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'shell-test-'));
  try {
    const datei = join(ordner, 'fenster.json');
    const original = { x: 120, y: 80, width: 1400, height: 900, maximized: true };
    await writeWindowState(datei, original);
    assert.deepEqual(await readWindowState(datei, VOLLBILD), original);
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
});

test('eine kaputte Datei wirft nicht, sondern faellt auf den Standard zurueck', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'shell-test-'));
  try {
    const datei = join(ordner, 'fenster.json');
    await writeFile(datei, '{ das ist kein JSON', 'utf8');
    assert.deepEqual(await readWindowState(datei, VOLLBILD), { ...DEFAULT_STATE });
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
});

test('eine unerreichbare Lage verliert die Position, behaelt aber die Groesse', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'shell-test-'));
  try {
    const datei = join(ordner, 'fenster.json');
    await writeWindowState(datei, { x: 3000, y: 200, width: 1400, height: 900, maximized: false });
    const zustand = await readWindowState(datei, VOLLBILD);
    assert.equal(zustand.x, undefined);
    assert.equal(zustand.y, undefined);
    assert.equal(zustand.width, 1400, 'die Groesse ist ja nicht das Problem gewesen');
    assert.equal(zustand.height, 900);
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
});

test('Schreiben an einen unmoeglichen Ort wirft nicht', async () => {
  // Ein nicht gemerkter Fensterplatz darf den Start nicht verhindern. Hier
  // steht eine Datei da, wo ein Verzeichnis sein muesste (ENOTDIR).
  const ordner = await mkdtemp(join(tmpdir(), 'shell-test-'));
  try {
    const blockade = join(ordner, 'blockade');
    await writeFile(blockade, 'keine Datei-Ablage', 'utf8');
    await writeWindowState(join(blockade, 'fenster.json'), { ...DEFAULT_STATE });
  } finally {
    await rm(ordner, { recursive: true, force: true });
  }
});
