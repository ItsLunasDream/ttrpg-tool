import { build } from 'esbuild';

/**
 * Die Tests laufen gegen ein gebuendeltes Abbild der geprueften Module, im
 * selben Format wie der Hauptprozess. So wird das getestet, was auch
 * ausgeliefert wird, statt einer zweiten, per ts-Loader anders uebersetzten
 * Fassung.
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
