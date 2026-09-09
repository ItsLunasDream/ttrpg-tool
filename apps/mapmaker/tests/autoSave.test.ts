import { describe, expect, it } from 'vitest';
import {
  AUTOSAVE_INTERVALS,
  DEFAULT_AUTOSAVE_MINUTES,
  clampInterval,
  shouldAutoSave,
  type AutoSaveState,
} from '@/io/autoSave';

/** Ein Zustand, in dem gespeichert werden *soll*; die Tests brechen je eine Bedingung. */
const faellig = (over: Partial<AutoSaveState> = {}): AutoSaveState => ({
  enabled: true,
  hasTarget: true,
  inTransaction: false,
  rev: 12,
  lastSavedRev: 7,
  lastAttempt: 0,
  now: 180_000,
  intervalMs: 180_000,
  ...over,
});

describe('Wann automatisch gespeichert wird', () => {
  it('wenn alles zusammenpasst', () => {
    expect(shouldAutoSave(faellig())).toBe(true);
  });

  it('nicht, wenn es abgeschaltet ist', () => {
    expect(shouldAutoSave(faellig({ enabled: false }))).toBe(false);
  });

  /**
   * Ohne Dateiziel bliebe nur der Download-Rückfall — alle paar Minuten eine
   * neue Datei im Download-Ordner wäre schlimmer als gar nichts.
   */
  it('nicht ohne Dateiziel', () => {
    expect(shouldAutoSave(faellig({ hasTarget: false }))).toBe(false);
  });

  /** Sonst schriebe eine offene, unbenutzte Karte immerzu dieselben Bytes. */
  it('nicht, wenn sich seit dem letzten Mal nichts geändert hat', () => {
    expect(shouldAutoSave(faellig({ rev: 7, lastSavedRev: 7 }))).toBe(false);
  });

  /**
   * Mitten in einen Pinselstrich zu schreiben ergäbe eine Datei mit einem
   * halben Strich — und das Schreiben stockte, während die Hand in Bewegung
   * ist.
   */
  it('nicht mitten in einem Zug', () => {
    expect(shouldAutoSave(faellig({ inTransaction: true }))).toBe(false);
  });

  it('nicht, bevor der Abstand um ist', () => {
    expect(shouldAutoSave(faellig({ now: 179_999 }))).toBe(false);
    expect(shouldAutoSave(faellig({ now: 180_000 }))).toBe(true);
  });

  it('auch nach einem Rückgängig, denn auch das ist eine Änderung', () => {
    // rev zählt bei jeder Dokumentänderung hoch, auch beim Rückgängigmachen.
    expect(shouldAutoSave(faellig({ rev: 20, lastSavedRev: 21 }))).toBe(true);
  });
});

describe('Abstand begrenzen', () => {
  it('lässt erlaubte Werte durch', () => {
    for (const m of AUTOSAVE_INTERVALS) expect(clampInterval(m)).toBe(m);
  });

  /** Ein Wert aus einer älteren Fassung darf nicht dazu führen, dass gar nicht
   * mehr oder pausenlos gespeichert wird. */
  it('fängt unsinnige Werte ab', () => {
    expect(clampInterval(0)).toBe(1);
    expect(clampInterval(-5)).toBe(1);
    expect(clampInterval(9999)).toBe(60);
    expect(clampInterval(Number.NaN)).toBe(DEFAULT_AUTOSAVE_MINUTES);
    expect(clampInterval(Number.POSITIVE_INFINITY)).toBe(DEFAULT_AUTOSAVE_MINUTES);
  });

  it('rundet auf ganze Minuten', () => {
    expect(clampInterval(2.4)).toBe(2);
    expect(clampInterval(2.6)).toBe(3);
  });
});
