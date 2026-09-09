/**
 * Prueft vor jedem Bauen und Starten, ob `npm install` gelaufen ist.
 *
 * Anlass: nach einem `git pull`, der ein neues geteiltes Paket mitbringt,
 * fehlt dessen Verweis in node_modules — npm legt ihn erst beim naechsten
 * `npm install` an. Der Build scheitert dann an einer Wand aus
 * Rollup-Meldungen („failed to resolve import @suite/motion/motion.css") und
 * hunderten TypeScript-Fehlern („Cannot find module 'vitest'"), und keine
 * einzige davon nennt den eigentlichen Grund.
 *
 * Ohne Abhaengigkeiten geschrieben, mit Absicht: dieses Skript laeuft genau
 * dann, wenn moeglicherweise nichts installiert ist.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const nodeModules = join(wurzel, 'node_modules');

/**
 * Werkzeuge, ohne die kein Workspace baut. Nicht die vollstaendige Liste der
 * Abhaengigkeiten — nur die, an denen sich eine halbe Installation zuerst
 * zeigt.
 */
const WERKZEUGE = ['typescript', 'vite', 'vitest', 'electron', 'esbuild'];

const fehlend = [];

if (!existsSync(nodeModules)) {
  fehlend.push('node_modules (gar nicht vorhanden)');
} else {
  // Die geteilten Pakete: ihr Name steht in ihrer eigenen package.json, und
  // npm legt sie unter genau diesem Namen ab.
  for (const ordner of readdirSync(join(wurzel, 'packages'))) {
    const eigene = join(wurzel, 'packages', ordner, 'package.json');
    if (!existsSync(eigene)) continue;
    const { name } = JSON.parse(readFileSync(eigene, 'utf8'));
    if (!existsSync(join(nodeModules, ...name.split('/')))) fehlend.push(name);
  }
  for (const werkzeug of WERKZEUGE) {
    if (!existsSync(join(nodeModules, werkzeug))) fehlend.push(werkzeug);
  }
}

if (fehlend.length) {
  console.error(
    [
      '',
      'Die Installation ist nicht vollstaendig. Es fehlt in node_modules:',
      ...fehlend.map((n) => `  - ${n}`),
      '',
      'Das passiert nach einem `git pull`, der neue Pakete mitbringt: npm legt',
      'ihre Verweise erst beim naechsten Installieren an.',
      '',
      'Zu tun:  npm install',
      `         (im Projektordner ${wurzel})`,
      ''
    ].join('\n')
  );
  process.exit(1);
}
