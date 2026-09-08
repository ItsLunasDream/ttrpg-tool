import { build } from 'esbuild';

/**
 * Gleiche Buendelung wie der Hauptprozess (CommonJS), damit die Tests genau
 * das Format pruefen, das spaeter ausgeliefert wird. Ein ESM-Bundle wuerde
 * dynamische require-Aufrufe der ZIP-Bibliothek nicht ueberstehen und damit
 * einen Fehler melden, den es im Produktivbundle nicht gibt.
 */
await build({
  entryPoints: ['tests/entry.ts'],
  outfile: 'dist/tests/entry.cjs',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true
});
