import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import net from 'node:net';

const PORT = 5173;
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

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.on('connect', () => { socket.end(); resolve(true); });
    socket.on('error', () => resolve(false));
  });
}

run('npm', ['run', 'build:main']).on('exit', async (code) => {
  if (code !== 0) shutdown(code ?? 1);

  run('npx', ['vite']);

  for (let attempt = 0; attempt < 60; attempt++) {
    if (await portOpen(PORT)) {
      run('npx', ['electron', '.'], { env: { ...process.env, VITE_DEV_SERVER_URL: `http://localhost:${PORT}` } })
        .on('exit', (electronCode) => shutdown(electronCode ?? 0));
      return;
    }
    await sleep(500);
  }

  console.error(`Vite-Dev-Server auf Port ${PORT} nicht erreichbar.`);
  shutdown(1);
});
