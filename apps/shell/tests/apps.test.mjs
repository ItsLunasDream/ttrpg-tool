import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { APPS, CHROME, STATUS_KEY, findApp, istWaehlbar, berechneAppFlaeche } =
  require('../dist/tests/entry.cjs');

test('jede App hat eine eindeutige ID', () => {
  const ids = APPS.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, 'doppelte IDs wuerden IPC-Kanaele kollidieren lassen');
});

test('IDs taugen als Praefix fuer Kanaele und Dateinamen', () => {
  // Dieselbe Zeichenmenge wie Regel 3 der Konventionen: die IDs landen in
  // Kanalnamen und spaeter in Pfaden.
  for (const app of APPS) {
    assert.match(app.id, /^[A-Za-z0-9_-]+$/, `ungueltige ID: ${app.id}`);
  }
});

test('jede App hat einen bekannten Zustand', () => {
  for (const app of APPS) {
    assert.ok(
      ['bereit', 'vorbereitet', 'geplant'].includes(app.status),
      `${app.id} hat Zustand ${app.status}`
    );
  }
});

test('findApp findet und liefert sonst undefined', () => {
  assert.equal(findApp('backstory')?.id, 'backstory');
  assert.equal(findApp('gibt-es-nicht'), undefined);
});

test('die Anwendungsflaeche laesst genau Titelleiste und Schiene frei', () => {
  const flaeche = berechneAppFlaeche(1280, 860);
  assert.deepEqual(flaeche, {
    x: CHROME.schieneBreite,
    y: CHROME.titelleisteHoehe,
    width: 1280 - CHROME.schieneBreite,
    height: 860 - CHROME.titelleisteHoehe
  });
});

test('die Anwendungsflaeche wird nie negativ', () => {
  // Waehrend eines Fensterwechsels kann kurz eine Groesse von 0 durchlaufen.
  const flaeche = berechneAppFlaeche(0, 0);
  assert.equal(flaeche.width, 0);
  assert.equal(flaeche.height, 0);
});

test('nur geplante Werkzeuge sind gesperrt', () => {
  assert.equal(istWaehlbar('bereit'), true);
  assert.equal(istWaehlbar('vorbereitet'), true, 'in Arbeit heisst anklickbar, nur noch nicht eingebettet');
  assert.equal(istWaehlbar('geplant'), false);
});

test('jeder Zustand hat einen Textschluessel fuer die Kachel', () => {
  for (const app of APPS) {
    assert.ok(STATUS_KEY[app.status], `kein Schluessel fuer ${app.status}`);
  }
});
