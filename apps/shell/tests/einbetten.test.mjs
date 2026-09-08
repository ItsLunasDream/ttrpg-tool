import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const shellDist = join(hier, '..', 'dist', 'main');

/**
 * Die Huelle rechnet den Weg zu den Dateien einer eingebetteten Anwendung aus
 * ihrem eigenen Verzeichnis aus (`appDistDir` in src/main/apps.ts). Das ist
 * eine Annahme ueber die Ordnerstruktur, und Annahmen ueber Ordner altern
 * schlecht: verschiebt jemand etwas, faellt es sonst erst beim Klick auf die
 * Kachel auf, als leere Flaeche ohne Fehlermeldung.
 *
 * Der Test bildet dieselbe Rechnung nach, statt die Funktion zu importieren:
 * sie haengt an `__dirname` des Buendels, das es hier nicht gibt.
 */
function appDistDir(id) {
  return join(shellDist, '..', '..', '..', id, 'dist', 'main');
}

test('die Huelle findet den Hauptprozess des Backstory Creators', () => {
  const dir = appDistDir('backstory');
  assert.ok(
    existsSync(join(dir, 'preload.js')),
    `kein preload.js unter ${dir} — wurde apps/backstory gebaut, oder hat sich die Ordnerstruktur geaendert?`
  );
});

test('die Huelle findet die Oberflaeche des Backstory Creators', () => {
  const datei = join(appDistDir('backstory'), '..', 'renderer', 'index.html');
  assert.ok(existsSync(datei), `keine index.html unter ${datei}`);
});
