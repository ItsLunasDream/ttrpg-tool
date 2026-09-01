import { build } from 'esbuild';

const shared = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true,
  external: ['electron']
};

await build({
  ...shared,
  entryPoints: ['src/main/index.ts'],
  outfile: 'dist/main/index.js',
  // Node built-ins and native-ish deps stay external so they load from node_modules
  packages: 'external'
});

await build({
  ...shared,
  entryPoints: ['src/preload/index.ts'],
  outfile: 'dist/main/preload.js'
});

console.log('main + preload gebaut');
