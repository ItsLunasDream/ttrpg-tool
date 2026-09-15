import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { harmloserPfad, ohneWurzel } = entry;

test('Pfade, die aus dem Ordner herausfuehren, werden abgelehnt', () => {
  // Ein Archiv, das beim Entpacken ausserhalb seines Ordners schreibt, ist
  // die klassische Luecke an dieser Stelle.
  for (const pfad of [
    '../woanders.md',
    'notes/../../weg.md',
    '/etc/passwd',
    'C:/Windows/system.ini',
    'notes\\heimlich.md',
    '',
    './x.md'
  ]) {
    assert.equal(harmloserPfad(pfad), false, `"${pfad}" haette abgelehnt werden muessen`);
  }
});

test('gewoehnliche Pfade bleiben erlaubt', () => {
  for (const pfad of ['campaign.json', 'notes/mira.md', 'assets/bild.png', 'history/mira/2026-01-01.md']) {
    assert.equal(harmloserPfad(pfad), true, `"${pfad}" haette durchgehen muessen`);
  }
});

test('der Kampagnenordner im Archiv wird abgeschaelt', () => {
  assert.equal(ohneWurzel(['abc-123/campaign.json', 'abc-123/notes/a.md']), 'abc-123/');
  // Liegt campaign.json schon oben, gibt es nichts abzuschaelen.
  assert.equal(ohneWurzel(['campaign.json', 'notes/a.md']), '');
  // Mehrere Ordner nebeneinander: dann ist keiner DER Kampagnenordner.
  assert.equal(ohneWurzel(['eins/campaign.json', 'zwei/campaign.json']), '');
});
