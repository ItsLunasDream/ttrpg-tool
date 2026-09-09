/**
 * End-to-End-Prüfung im echten Browser.
 *
 * **Warum es die geben muss.** Der Editor lebt am Canvas: Werkzeuge, Zeiger,
 * Renderer. Drei der Fehler, die am 01.09.2026 gefunden wurden, konnte keine
 * Modellprüfung sehen — ein Werkzeugwechsel, der sich über den Store totlief;
 * ein Fenster-Werkzeug, das Türen umschaltete; eine Wand aus zwei identischen
 * Punkten beim Tippen ohne Zeigerbewegung. Sie alle zeigen sich erst, wenn
 * jemand wirklich klickt.
 *
 * Bedient wird über `window.T` aus `src/devHarness.ts` — dasselbe Hilfsmittel,
 * das auch von Hand benutzt wird. Synthetische Klicks über `T.ptr()` statt
 * Playwrights `mouse`: der Canvas hat keine anfassbaren Elemente, und die
 * Weltkoordinaten sind das, worum es geht.
 *
 * **Browser:** normalerweise `npx playwright install chromium`. Wo bereits ein
 * Chromium liegt (Container, CI-Image), zeigt `PLAYWRIGHT_CHROMIUM_PATH`
 * darauf — sonst sucht Playwright eine Fassung, die es dort nicht gibt.
 */

import { defineConfig, devices } from '@playwright/test';

const chromiumPfad = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: './e2e',
  // Der Editor baut eine WebGL-Bühne auf; das dauert länger als ein Formular.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // Ein Arbeiter: alle Läufe teilen sich einen Dev-Server, und die Prüfungen
  // fassen denselben Zustand an.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    ...(chromiumPfad ? { launchOptions: { executablePath: chromiumPfad } } : {}),
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
