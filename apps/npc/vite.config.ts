import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  // Ohne relative Basis verweist das gebaute index.html absolut auf /assets/
  // und laedt unter file:// nichts — genau daran ist der Karteneditor beim
  // Einbetten zuerst gescheitert.
  base: './',
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  // Nicht 5173 oder 5273: die belegen Story Creator und Huelle.
  server: { port: 5473, strictPort: true }
});
