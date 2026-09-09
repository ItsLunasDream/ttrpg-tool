/**
 * Automatisches Speichern — die Entscheidung, nicht das Schreiben.
 *
 * Eine Projektdatei ist die Arbeit von Stunden, und bisher ging sie verloren,
 * wenn der Browser abstürzte. Seit es ein Dateiziel gibt (`io/saveTarget.ts`),
 * lässt sich still dorthin sichern.
 *
 * Warum die Entscheidung hier steht und nicht im Panel: sie hat vier
 * Bedingungen, von denen drei leicht zu vergessen sind, und keine davon
 * braucht einen Browser. So lässt sie sich prüfen, ohne alle zwei Minuten
 * zuzusehen.
 *
 * Ohne Dateiziel wird *nicht* gespeichert. Der Rückfall wäre ein Download, und
 * alle zwei Minuten eine neue Datei in den Download-Ordner zu legen, wäre
 * schlimmer als gar nichts.
 */

export interface AutoSaveState {
  enabled: boolean;
  /** Gibt es eine Datei, die überschrieben werden darf? */
  hasTarget: boolean;
  /**
   * Läuft gerade ein Zug — ein Pinselstrich, ein Ziehen?
   *
   * Mitten hinein zu schreiben führe zwar zu einer gültigen Datei, aber zu
   * einer, die einen halben Strich enthält. Und das Schreiben stockte
   * ausgerechnet dann, wenn die Hand in Bewegung ist.
   */
  inTransaction: boolean;
  /** Änderungszähler des Dokuments. */
  rev: number;
  /** Stand beim letzten erfolgreichen Speichern. */
  lastSavedRev: number;
  /** Zeitpunkt des letzten Versuchs, egal ob erfolgreich. */
  lastAttempt: number;
  now: number;
  intervalMs: number;
}

export function shouldAutoSave(s: AutoSaveState): boolean {
  if (!s.enabled || !s.hasTarget) return false;
  // Nichts geändert heißt nichts zu sichern — sonst schriebe eine offene,
  // unbenutzte Karte alle paar Minuten dieselben Bytes.
  if (s.rev === s.lastSavedRev) return false;
  if (s.inTransaction) return false;
  return s.now - s.lastAttempt >= s.intervalMs;
}

/** Erlaubte Abstände in Minuten. Kürzer als eine Minute ergibt keinen Sinn. */
export const AUTOSAVE_INTERVALS = [1, 2, 5, 10, 15] as const;

export const DEFAULT_AUTOSAVE_MINUTES = 3;

/**
 * Auf einen erlaubten Abstand bringen.
 *
 * Ein Wert aus einer älteren Fassung oder aus einer fremden Datei darf nicht
 * dazu führen, dass gar nicht mehr oder pausenlos gespeichert wird.
 */
export function clampInterval(minutes: number): number {
  if (!Number.isFinite(minutes)) return DEFAULT_AUTOSAVE_MINUTES;
  return Math.min(60, Math.max(1, Math.round(minutes)));
}
