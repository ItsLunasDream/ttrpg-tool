import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  // Ohne relative Basis verweist das gebaute index.html absolut auf /assets/
  // und laedt unter file:// nichts. Genau daran scheiterte der Karteneditor
  // im Prototyp.
  base: './',
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  // Nicht 5173: der Story Creator belegt den Port, und in der Entwicklung
  // laufen beide gleichzeitig.
  server: { port: 5273, strictPort: true }
});
