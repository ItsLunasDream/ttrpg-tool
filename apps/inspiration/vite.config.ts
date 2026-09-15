import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  // Relative Basis, sonst laedt das gebaute index.html unter file:// nichts.
  base: './',
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  // 5173 Backstory, 5273 Huelle, 5473 NPC — hier die naechste freie.
  server: { port: 5573, strictPort: true }
});
