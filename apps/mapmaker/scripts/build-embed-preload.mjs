import { build } from 'esbuild';

/**
 * Buendelt das Preload fuer die Sprachkopplung mit der Huelle (siehe
 * src/embed/preload.ts) getrennt vom Vite-Build der Oberflaeche: ein Preload
 * laeuft im Node-Kontext von Electron, nicht im Browser-Bundle.
 */
await build({
  entryPoints: ['src/embed/preload.ts'],
  outfile: 'dist-embed/preload.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true,
  external: ['electron']
});

console.log('embed-preload gebaut');
