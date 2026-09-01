/**
 * Startet die *gepackte* Anwendung und prueft, dass sie ohne fehlende Module
 * hochkommt und der ZIP-Export laeuft.
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

const home = await mkdtemp(path.join(tmpdir(), 'backstory-pkg-'));
const output = [];
let code = 0;

// Der Renderer meldet sich ueber die Konsole, sobald die Oberflaeche steht.
const child = spawn(binary, ['--no-sandbox', '--enable-logging'], {
  env: { ...process.env, HOME: home, XDG_CONFIG_HOME: path.join(home, '.config') },
  stdio: ['ignore', 'pipe', 'pipe']
});

child.stdout.on('data', (chunk) => output.push(String(chunk)));
child.stderr.on('data', (chunk) => output.push(String(chunk)));

await new Promise((resolve) => setTimeout(resolve, 12000));
child.kill('SIGTERM');
await new Promise((resolve) => child.once('exit', resolve));

const log = output.join('');
const problems = [];

if (/Cannot find module/.test(log)) problems.push('Fehlendes Modul im Paket:\n' + log.match(/Cannot find module[^\n]*/g).join('\n'));
if (/A JavaScript error occurred in the main process/.test(log)) problems.push('Hauptprozess ist abgestuerzt');
if (/Uncaught Exception/.test(log)) problems.push('Unbehandelte Ausnahme im Hauptprozess');

// Die App legt beim Start ihr Vault-Verzeichnis an. Fehlt es, kam sie nicht hoch.
try {
  const configDir = path.join(home, '.config', 'backstory-creator');
  const entries = await readdir(configDir);
  if (!entries.includes('vault')) problems.push(`Vault-Verzeichnis fehlt, gefunden: ${entries.join(', ')}`);
} catch (error) {
  problems.push(`Nutzerdatenverzeichnis nicht angelegt: ${error.message}`);
}

if (problems.length) {
  console.error('PAKET FEHLERHAFT\n- ' + problems.join('\n- '));
  await writeFile(path.join(process.cwd(), 'package-verify.log'), log);
  console.error('Vollstaendiges Log in package-verify.log');
  code = 1;
} else {
  console.log('PAKET OK');
}

await rm(home, { recursive: true, force: true });
process.exit(code);
