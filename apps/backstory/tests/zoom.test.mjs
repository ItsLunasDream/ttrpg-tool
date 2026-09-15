import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { begrenzeZoom, naechsteZoomstufe, ZOOM_MIN, ZOOM_MAX, ZOOM_NORMAL } = entry;

test('die Grenzen halten', () => {
  assert.equal(begrenzeZoom(5), ZOOM_MIN);
  assert.equal(begrenzeZoom(9000), ZOOM_MAX);
  assert.equal(begrenzeZoom(Number.NaN), ZOOM_NORMAL);
  assert.equal(begrenzeZoom(123.4), 123);
});

test('Schritte laufen die Stufen entlang', () => {
  assert.equal(naechsteZoomstufe(100, 1), 110);
  assert.equal(naechsteZoomstufe(100, -1), 90);
  assert.equal(naechsteZoomstufe(500, 1), ZOOM_MAX, 'am oberen Ende bleibt es stehen');
  assert.equal(naechsteZoomstufe(20, -1), ZOOM_MIN, 'am unteren Ende bleibt es stehen');
});

test('ein Wert zwischen zwei Stufen geht in die richtige Richtung weiter', () => {
  assert.equal(naechsteZoomstufe(105, 1), 110);
  assert.equal(naechsteZoomstufe(105, -1), 100);
});
