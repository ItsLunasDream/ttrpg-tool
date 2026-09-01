import { build } from 'esbuild';

/**
 * Haupt- und Preload-Prozess werden vollstaendig gebuendelt. Nur `electron`
 * selbst bleibt aussen vor, das liefert die Laufzeit.
 *
 * Wichtig fuer die Paketierung: dadurch braucht die fertige Anwendung kein
 * node_modules-Verzeichnis mehr. Frueher wurden Abhaengigkeiten zur Laufzeit
 * nachgeladen, und eine davon fehlte im asar-Paket.
 */
const shared = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true,
  external: ['electron']
};

await build({ ...shared, entryPoints: ['src/main/index.ts'], outfile: 'dist/main/index.js' });
await build({ ...shared, entryPoints: ['src/preload/index.ts'], outfile: 'dist/main/preload.js' });

console.log('main + preload gebaut');
