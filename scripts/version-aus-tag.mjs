#!/usr/bin/env node
/**
 * Setzt die Fassung der ganzen Sammlung aus einem Release-Tag.
 *
 *   node scripts/version-aus-tag.mjs v1.0.2
 *   node scripts/version-aus-tag.mjs            (nimmt GITHUB_REF_NAME)
 *
 * Aus `v1.0.2` wird `1.0.2`, aus `v1.0.2-early-access` wird
 * `1.0.2-early-access`. Geschrieben wird in alle package.json (Wurzel,
 * apps/*, packages/*), in die Tauri-Konfiguration des Karteneditors und in
 * seine APP_VERSION — dieselben Stellen, die beim Anheben von Hand
 * angefasst werden.
 *
 * Gedacht fuer den Workflow bei einem Release: die Fassung im Repository
 * bleibt, wie sie ist; nur der Build traegt die Nummer des Tags. Ein Tag,
 * das keine Fassung ist, bricht laut ab, statt still eine falsche Nummer zu
 * bauen.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tag = (process.argv[2] ?? process.env.GITHUB_REF_NAME ?? '').trim();
const treffer = /^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(tag);
if (!treffer) {
  console.error(`Das Tag „${tag}" ist keine Fassung. Erwartet z. B. v1.0.2 oder v1.0.2-early-access.`);
  process.exit(1);
}
const fassung = treffer[1];

const dateien = [path.join(wurzel, 'package.json')];
for (const ordner of ['apps', 'packages']) {
  for (const name of readdirSync(path.join(wurzel, ordner))) {
    const datei = path.join(wurzel, ordner, name, 'package.json');
    if (existsSync(datei)) dateien.push(datei);
  }
}
const tauri = path.join(wurzel, 'apps', 'mapmaker', 'src-tauri', 'tauri.conf.json');
if (existsSync(tauri)) dateien.push(tauri);

let geaendert = 0;
for (const datei of dateien) {
  const text = readFileSync(datei, 'utf8');
  // Nur die erste "version" auf oberster Ebene: die steht in beiden Formaten oben.
  const neu = text.replace(/^(\s{2}"version":\s*")[^"]*(")/m, `$1${fassung}$2`);
  if (neu !== text) {
    writeFileSync(datei, neu);
    geaendert += 1;
  }
}

const projekt = path.join(wurzel, 'apps', 'mapmaker', 'src', 'io', 'project.ts');
if (existsSync(projekt)) {
  const text = readFileSync(projekt, 'utf8');
  const neu = text.replace(/const APP_VERSION = '[^']*';/, `const APP_VERSION = '${fassung}';`);
  if (neu !== text) {
    writeFileSync(projekt, neu);
    geaendert += 1;
  }
}

console.log(`Fassung ${fassung} gesetzt (${geaendert} Dateien).`);
