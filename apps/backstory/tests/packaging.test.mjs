import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

/**
 * Waechter fuer zwei Eintraege in der electron-builder-Konfiguration, die es
 * nur wegen des Workspace-Aufbaus gibt. Beide stehen in package.json, und
 * JSON traegt keine Kommentare — deshalb steht die Begruendung hier, dort wo
 * sie auch geprueft wird.
 */

const require = createRequire(import.meta.url);
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

/**
 * Seit dem Umzug in den Workspace liegt electron im node_modules der Wurzel,
 * nicht mehr neben der Anwendung. electron-builder sucht dort und bricht mit
 * „Cannot compute electron version" ab, deshalb steht die Fassung fest in der
 * Konfiguration.
 *
 * Genau das ist die Gefahr: die feste Zahl weiss nichts davon, wenn die
 * Abhaengigkeit spaeter hochgezogen wird. Ohne diesen Test liefe die
 * Anwendung in Entwicklung und Tests gegen die neue Fassung, das ausgelieferte
 * Paket aber weiter gegen die alte — und niemand saehe es. Schlaegt dieser
 * Test fehl, ist die Antwort, beide Stellen anzugleichen, nicht ihn zu
 * lockern.
 */
test('festgeschriebene Electron-Fassung passt zur installierten', async () => {
  const pinned = packageJson.build?.electronVersion;
  assert.ok(pinned, 'build.electronVersion fehlt in package.json');

  const installed = require('electron/package.json').version;
  assert.equal(
    pinned,
    installed,
    `build.electronVersion (${pinned}) und installiertes electron (${installed}) laufen auseinander: ` +
      'das Paket wuerde gegen eine andere Fassung gebaut als die, gegen die getestet wird'
  );
});

/**
 * electron-builder ruft sonst ein eigenes `npm install` im Anwendungsordner
 * auf. Unter npm-Workspaces deutet das den ganzen Baum um und raeumt einen
 * Grossteil des node_modules an der Wurzel ab. Der Schritt wird nicht
 * gebraucht: esbuild buendelt Haupt- und Preload-Prozess vollstaendig, im
 * Paket landet kein node_modules, und native Module gibt es keine.
 *
 * Kaeme jemals eine Abhaengigkeit mit nativem Anteil dazu, muesste diese
 * Entscheidung neu getroffen werden.
 */
test('npmRebuild bleibt abgeschaltet', () => {
  assert.equal(
    packageJson.build?.npmRebuild,
    false,
    'npmRebuild muss false bleiben, sonst raeumt electron-builder das node_modules der Wurzel ab'
  );
});
