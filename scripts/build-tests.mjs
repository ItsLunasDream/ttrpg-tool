import { build } from 'esbuild';

await build({
  entryPoints: ['tests/entry.ts'],
  outfile: 'dist/tests/entry.mjs',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true
});
