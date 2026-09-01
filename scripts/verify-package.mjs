/**
 * Startet die *gepackte* Anwendung und prueft, dass sie ohne fehlende Module
 * hochkommt und ihr Datenverzeichnis anlegt.
 *
 * Der Rauchtest in scripts/smoke.cjs laeuft gegen die ungepackte App und
 * konnte deshalb nicht sehen, dass eine Abhaengigkeit im asar-Paket fehlte.
 */
import { spawn } from 'node:child_process';
import { mkdtemp, rm, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const binary = process.argv[2];
if (!binary) {
  console.error('Aufruf: node scripts/verify-package.mjs <pfad-zur-anwendung>');
  process.exit(1);
}

const BOOT_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 250;
/** Windows gibt Dateien erst kurz nach dem Beenden frei. */
const RELEASE_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --user-data-dir setzt app.getPath('userData') direkt und funktioniert auf
// allen Plattformen gleich. Ueber HOME zu gehen waere je nach System anders.
const userDataDir = await mkdtemp(path.join(tmpdir(), 'backstory-pkg-'));

// NODE_OPTIONS lehnen gepackte Electron-Anwendungen ab. Ist die Variable in
// der Umgebung gesetzt, wuerde die Pruefung daran scheitern statt am Paket.
const { NODE_OPTIONS: _ignored, ...env } = process.env;

const output = [];
const child = spawn(binary, [`--user-data-dir=${userDataDir}`, '--no-sandbox', '--enable-logging'], {
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});

child.stdout.on('data', (chunk) => output.push(String(chunk)));
child.stderr.on('data', (chunk) => output.push(String(chunk)));

let exitCode = null;
let spawnError = null;
child.once('exit', (code) => {
  exitCode = code;
});
child.once('error', (error) => {
  spawnError = error;
});

/**
 * Der Hauptprozess legt beim Start das Vault-Verzeichnis an, und zwar nach
 * allen Modul-Importen. Es ist damit der Beleg dafuer, dass er durchgelaufen
 * ist. Statt einer festen Wartezeit wird darauf gewartet, das ist auf
 * langsamen Rechnern zuverlaessiger und im Normalfall schneller.
 */
async function waitForBoot() {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (spawnError || exitCode !== null) return false;
    try {
      if ((await readdir(userDataDir)).includes('vault')) return true;
    } catch {
      // Verzeichnis noch nicht lesbar, weiter warten.
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return false;
}

const booted = await waitForBoot();

if (exitCode === null && !spawnError) {
  child.kill();
  await new Promise((resolve) => child.once('exit', resolve));
  await sleep(RELEASE_DELAY_MS);
}

const log = output.join('');
const problems = [];

if (spawnError) problems.push(`Anwendung ließ sich nicht starten: ${spawnError.message}`);

const missing = log.match(/Cannot find module[^\n\r]*/g);
if (missing) problems.push(`Fehlendes Modul im Paket:\n  ${[...new Set(missing)].join('\n  ')}`);
if (/A JavaScript error occurred in the main process/.test(log)) problems.push('Hauptprozess ist abgestürzt');
if (/Uncaught Exception/.test(log)) problems.push('Unbehandelte Ausnahme im Hauptprozess');
if (!spawnError && exitCode !== null && exitCode !== 0) {
  problems.push(`Anwendung hat sich vorzeitig mit Code ${exitCode} beendet`);
}
if (!booted && !spawnError) {
  let found = '(nicht lesbar)';
  try {
    found = (await readdir(userDataDir)).join(', ') || '(leer)';
  } catch {
    // Meldung unten reicht.
  }
  problems.push(`Vault-Verzeichnis nicht innerhalb von ${BOOT_TIMEOUT_MS / 1000} s angelegt, gefunden: ${found}`);
}

if (problems.length) {
  console.error('PAKET FEHLERHAFT\n- ' + problems.join('\n- '));
  await writeFile(path.join(process.cwd(), 'package-verify.log'), log || '(keine Ausgabe)');
  console.error('Vollständiges Log in package-verify.log');
} else {
  console.log('PAKET OK');
}

// Aufraeumen ist Kuer, nicht Pflicht: ein noch gesperrtes Temp-Verzeichnis
// darf das Ergebnis der Pruefung nicht kippen.
try {
  await rm(userDataDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
} catch (error) {
  console.warn(`Temp-Verzeichnis konnte nicht gelöscht werden, wird ignoriert: ${error.message}`);
}

process.exit(problems.length ? 1 : 0);
