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

const BOOT_TIMEOUT_MS = 15_000;

// --user-data-dir setzt app.getPath('userData') direkt und funktioniert auf
// allen Plattformen gleich. Ueber HOME zu gehen waere je nach System anders.
const userDataDir = await mkdtemp(path.join(tmpdir(), 'backstory-pkg-'));
const output = [];

const child = spawn(binary, [`--user-data-dir=${userDataDir}`, '--no-sandbox', '--enable-logging'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

child.stdout.on('data', (chunk) => output.push(String(chunk)));
child.stderr.on('data', (chunk) => output.push(String(chunk)));

let exitedEarly = null;
child.once('exit', (code) => {
  exitedEarly = code;
});

await new Promise((resolve) => setTimeout(resolve, BOOT_TIMEOUT_MS));
if (exitedEarly === null) {
  child.kill();
  await new Promise((resolve) => child.once('exit', resolve));
}

const log = output.join('');
const problems = [];

const missing = log.match(/Cannot find module[^\n\r]*/g);
if (missing) problems.push(`Fehlendes Modul im Paket:\n  ${[...new Set(missing)].join('\n  ')}`);
if (/A JavaScript error occurred in the main process/.test(log)) problems.push('Hauptprozess ist abgestürzt');
if (/Uncaught Exception/.test(log)) problems.push('Unbehandelte Ausnahme im Hauptprozess');
if (exitedEarly !== null && exitedEarly !== 0) problems.push(`Anwendung hat sich vorzeitig mit Code ${exitedEarly} beendet`);

// Der Hauptprozess legt beim Start das Vault-Verzeichnis an. Das passiert
// nach allen Modul-Importen, ist also der Beleg, dass er durchgelaufen ist.
// settings.json taugt nicht als Merkmal: die entsteht erst, wenn eine
// Einstellung geaendert wird.
try {
  const entries = await readdir(userDataDir);
  if (!entries.includes('vault')) {
    problems.push(`Vault-Verzeichnis fehlt, gefunden: ${entries.join(', ') || '(leer)'}`);
  }
} catch (error) {
  problems.push(`Datenverzeichnis nicht lesbar: ${error.message}`);
}

if (problems.length) {
  console.error('PAKET FEHLERHAFT\n- ' + problems.join('\n- '));
  await writeFile(path.join(process.cwd(), 'package-verify.log'), log || '(keine Ausgabe)');
  console.error('Vollständiges Log in package-verify.log');
} else {
  console.log('PAKET OK');
}

await rm(userDataDir, { recursive: true, force: true });
process.exit(problems.length ? 1 : 0);
