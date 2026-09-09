/**
 * Speicherziel unter der Tauri-Hülle.
 *
 * Die echten Plugins (`@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`)
 * lassen sich hier nicht laufen lassen — es gibt kein Tauri-Backend im
 * Testlauf, genau wie `indexedDB` in `recentFiles.test.ts` nicht wirklich
 * anläuft. Geprüft wird deshalb nicht das Plugin, sondern die Verzweigung in
 * `saveTarget.ts` selbst: dass unter Tauri der native Dialog gerufen wird
 * statt der File-System-Access-API, dass ein Abbruch `false`/`null` liefert
 * statt zu werfen, und dass nur Projektdateien zum neuen Speicherziel werden.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const isTauriMock = vi.fn(() => true);
const saveMock = vi.fn();
const openMock = vi.fn();
const readFileMock = vi.fn();
const writeFileMock = vi.fn();
const basenameMock = vi.fn(async (p: string) => p.split(/[/\\]/).pop() ?? p);

vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => isTauriMock() }));
vi.mock('@tauri-apps/plugin-dialog', () => ({
  save: (...a: unknown[]) => saveMock(...a),
  open: (...a: unknown[]) => openMock(...a),
}));
vi.mock('@tauri-apps/plugin-fs', () => ({
  readFile: (...a: unknown[]) => readFileMock(...a),
  writeFile: (...a: unknown[]) => writeFileMock(...a),
}));
vi.mock('@tauri-apps/api/path', () => ({ basename: (...a: [string]) => basenameMock(...a) }));

let mod: typeof import('@/io/saveTarget');

beforeEach(async () => {
  vi.resetModules();
  isTauriMock.mockReturnValue(true);
  saveMock.mockReset();
  openMock.mockReset();
  readFileMock.mockReset();
  writeFileMock.mockReset();
  basenameMock.mockClear();
  mod = await import('@/io/saveTarget');
});

afterEach(() => {
  mod.forgetSaveTarget();
});

describe('Speicherziel unter Tauri', () => {
  it('erkennt die Hülle als nativen Dialog, auch ohne File System Access API', () => {
    expect(mod.canPickSaveTarget()).toBe(true);
  });

  it('meldet keinen nativen Dialog, wenn weder Tauri noch FSA da sind', () => {
    isTauriMock.mockReturnValue(false);
    expect(mod.canPickSaveTarget()).toBe(false);
  });

  it('bricht ohne Fehler ab, wenn der Speichern-Dialog ohne Pfad zurückkommt', async () => {
    saveMock.mockResolvedValue(null);
    const ok = await mod.pickSaveTarget('karte', 'ttmap', 'Karte');
    expect(ok).toBe(false);
    expect(mod.hasSaveTarget()).toBe(false);
  });

  it('merkt sich den gewählten Pfad und ruft den Dialog mit der Endung als Filter', async () => {
    saveMock.mockResolvedValue('/pfad/zur/karte.ttmap');
    const ok = await mod.pickSaveTarget('karte', 'ttmap', 'Karte');
    expect(ok).toBe(true);
    expect(mod.hasSaveTarget()).toBe(true);
    expect(mod.saveTargetName()).toBe('karte.ttmap');
    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultPath: 'karte',
        filters: [{ name: 'Karte', extensions: ['ttmap'] }],
      }),
    );
  });

  it('schreibt über das fs-Plugin, nicht über die File System Access API', async () => {
    saveMock.mockResolvedValue('/pfad/karte.ttmap');
    await mod.pickSaveTarget('karte', 'ttmap', 'Karte');
    const bytes = new Uint8Array([1, 2, 3]);
    await mod.writeToSaveTarget(bytes);
    expect(writeFileMock).toHaveBeenCalledWith('/pfad/karte.ttmap', bytes);
  });

  it('liest über das fs-Plugin zurück', async () => {
    saveMock.mockResolvedValue('/pfad/karte.ttmap');
    await mod.pickSaveTarget('karte', 'ttmap', 'Karte');
    readFileMock.mockResolvedValue(new Uint8Array([9, 9]));
    const gelesen = await mod.readSaveTarget();
    expect(readFileMock).toHaveBeenCalledWith('/pfad/karte.ttmap');
    expect(gelesen).toEqual(new Uint8Array([9, 9]));
  });

  it('macht aus einer geöffneten .ttmap ein neues Speicherziel', async () => {
    openMock.mockResolvedValue('/pfad/karte.ttmap');
    readFileMock.mockResolvedValue(new Uint8Array([1]));
    const datei = await mod.pickOpenTarget('ttmap');
    expect(datei?.name).toBe('karte.ttmap');
    expect(mod.hasSaveTarget()).toBe(true);
  });

  /**
   * Der eigentliche Grund für die Fallunterscheidung: eine importierte .uvtt
   * zu überschreiben wäre fast nie gewollt — sie kann das Projekt gar nicht
   * fassen. Dieselbe Regel gilt schon im Browser-Zweig (siehe dort).
   */
  it('macht aus einer geöffneten .uvtt kein Speicherziel', async () => {
    openMock.mockResolvedValue('/pfad/fremd.uvtt');
    readFileMock.mockResolvedValue(new Uint8Array([1]));
    const datei = await mod.pickOpenTarget('ttmap');
    expect(datei?.name).toBe('fremd.uvtt');
    expect(mod.hasSaveTarget()).toBe(false);
  });

  it('bricht das Öffnen ohne Fehler ab, wenn kein Pfad gewählt wurde', async () => {
    openMock.mockResolvedValue(null);
    const datei = await mod.pickOpenTarget('ttmap');
    expect(datei).toBeNull();
    expect(readFileMock).not.toHaveBeenCalled();
  });
});
