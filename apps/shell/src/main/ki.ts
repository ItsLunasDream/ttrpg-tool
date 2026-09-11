/**
 * Die KI-Anbindung der Sammlung.
 *
 * Eingerichtet wird sie einmal, in der Huelle, und alle Werkzeuge benutzen
 * dieselbe. Das Gegenmodell — jedes Werkzeug mit eigenem Anbieter und eigenem
 * Schluessel — waere fuer die Person, die es einrichtet, dieselbe Arbeit
 * mehrfach, und zwei Werkzeuge liefen auf unterschiedlichen Modellen, ohne
 * dass es jemandem auffiele.
 *
 * Wie man mit einem Modell spricht, steht in @suite/ki. Hier steht nur, was
 * `electron` braucht: der Schluesselbund und die Uebernahme aus einer
 * Anwendung, die die Einstellung frueher selbst gefuehrt hat.
 */
import { safeStorage } from 'electron';
import { baueAnbieter, type KiAnbieter } from '@suite/ki';
import type { KiEinstellungen } from '@suite/ki/einstellungen';
import type { ShellSettings } from './settings';

/**
 * Der Schluessel wird mit dem Schluesselbund des Betriebssystems
 * verschluesselt, wo das moeglich ist. Steht das nicht zur Verfuegung, wird
 * gar nicht erst gespeichert: ein Schluessel im Klartext in einer
 * Einstellungsdatei waere schlechter als keiner.
 *
 * `null` heisst also "nicht speicherbar", `''` heisst "nichts zu speichern".
 */
export function verschluessle(wert: string): string | null {
  if (!wert) return '';
  if (!safeStorage.isEncryptionAvailable()) return null;
  return safeStorage.encryptString(wert).toString('base64');
}

export function entschluessle(abgelegt: string): string {
  if (!abgelegt) return '';
  try {
    return safeStorage.decryptString(Buffer.from(abgelegt, 'base64'));
  } catch {
    // Ein Schluessel, der sich nicht mehr entschluesseln laesst — anderes
    // Konto, neu aufgesetztes System —, ist so gut wie keiner. Die
    // Bereitschaftspruefung sagt dann, dass keiner hinterlegt ist.
    return '';
  }
}

/** Baut den eingestellten Anbieter, oder `null`, wenn keiner eingerichtet ist. */
export function anbieterAus(einstellungen: ShellSettings): KiAnbieter | null {
  return baueAnbieter(einstellungen.ki, entschluessle(einstellungen.claudeSchluessel));
}

/**
 * Was ein Werkzeug braucht, um selbst zu fragen.
 *
 * Absichtlich eine Funktion und kein Schnappschuss: wer die KI in den
 * Einstellungen umstellt, soll das im naechsten Klick merken und nicht erst
 * nach einem Neustart.
 */
export type KiQuelle = () => { einstellungen: KiEinstellungen; schluessel: string };
