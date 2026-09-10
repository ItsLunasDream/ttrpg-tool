import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import net from 'node:net';

const PORT = 5273;

/**
 * Auf welcher Adresse gewartet wird.
 *
 * Beide, und das ist unter Windows kein Luxus: dort loest `localhost` haeufig
 * zuerst auf ::1 auf. Vite lauschte dann nur dort, die Pruefung fragte
 * 127.0.0.1, und der Start brach mit „Dev-Server nicht erreichbar" ab,
 * waehrend Vite im selben Fenster meldete, es sei bereit.
 */
const ADRESSEN = ['127.0.0.1', '::1'];
const children = [];

function run(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
  children.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function portOpen(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

/** Die erste Adresse, auf der der Server antwortet — oder null. */
async function erreichbareAdresse(port) {
  for (const host of ADRESSEN) {
    if (await portOpen(port, host)) return host;
  }
  return null;
}

run('npm', ['run', 'build:main']).on('exit', async (code) => {
  if (code !== 0) shutdown(code ?? 1);

  // Fest auf IPv4 binden, damit die Pruefung unten und die Adresse, die
  // Electron spaeter laedt, dieselbe Stelle meinen.
  run('npx', ['vite', '--host', '127.0.0.1']);

  for (let attempt = 0; attempt < 60; attempt++) {
    const host = await erreichbareAdresse(PORT);
    if (host) {
      // Eckige Klammern gehoeren um eine IPv6-Adresse in einer URL.
      const adresse = host.includes(':') ? `[${host}]` : host;
      run('npx', ['electron', '.'], {
        env: { ...process.env, SHELL_DEV_SERVER_URL: `http://${adresse}:${PORT}` }
      }).on('exit', (electronCode) => shutdown(electronCode ?? 0));
      return;
    }
    await sleep(500);
  }

  console.error(
    `Vite-Dev-Server auf Port ${PORT} nicht erreichbar (versucht: ${ADRESSEN.join(', ')}).\n` +
      'Laeuft auf dem Port schon etwas anderes? `strictPort` laesst Vite dann nicht ausweichen.'
  );
  shutdown(1);
});
