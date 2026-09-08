/**
 * Die Namen der IPC-Kanaele dieser Anwendung tragen ein Praefix.
 *
 * Allein waere das ueberfluessig — es gaebe nur diese eine Anwendung im
 * Prozess. In der Huelle laufen aber mehrere Anwendungen im selben
 * Hauptprozess, und `ipcMain.handle` ist global: zwei Anwendungen mit einem
 * Kanal namens „settings:get" wuerden sich nicht ergaenzen, sondern die
 * zweite Registrierung wuerde mit einem Fehler abbrechen. Schlimmer noch
 * waere der Fall, in dem es durchgeht und die falsche Anwendung antwortet.
 *
 * Deshalb bekommt jeder Kanal das Praefix, und zwar an genau zwei Stellen:
 * beim Registrieren im Hauptprozess und beim Aufrufen im Preload. Die
 * Aufrufer nennen weiter die kurzen Namen.
 */

export const CHANNEL_PREFIX = 'backstory:';

/** Macht aus dem kurzen Namen den vollen Kanalnamen. */
export function channel(name: string): string {
  return `${CHANNEL_PREFIX}${name}`;
}
