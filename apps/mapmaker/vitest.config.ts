/**
 * Vitest-Einstellungen.
 *
 * Eigene Datei, damit die Vite-Konfiguration bleibt, was sie ist: der Bauplan
 * für die Anwendung. Nötig wurde sie, als `e2e/` dazukam — Vitest sammelt von
 * sich aus jede `*.spec.ts` ein, und die Playwright-Prüfungen sind keine
 * Modelltests: sie brauchen einen Browser und scheitern hier sofort.
 *
 * Die Modelltests liegen alle unter `tests/`, und genau die läuft Vitest.
 */

import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
