/**
 * Was beim Anlegen einer neuen Begegnung verlorenginge.
 *
 * Der Knopf „Neue Begegnung" wirft den jetzigen Kampf weg. Meistens ist das
 * gewollt und eine Rueckfrage nur laestig — deshalb fragt das Werkzeug nur
 * dort, wo wirklich etwas auf dem Spiel steht, und sagt auch, was.
 */

import type { Begegnung, Kampf, Teilnehmer } from './types';

/** Woran die Rueckfrage haengt. Leer heisst: einfach anlegen, ohne zu fragen. */
export interface Warnung {
  /** Der Kampf laeuft noch. */
  readonly laeuft: boolean;
  /** Die aktuelle Aufstellung steht so nicht auf der Platte. */
  readonly ungespeichert: boolean;
}

export function nichtsZuVerlieren(warnung: Warnung): boolean {
  return !warnung.laeuft && !warnung.ungespeichert;
}

/**
 * Die Aufstellung, wie sie gespeichert wuerde.
 *
 * Verglichen wird nicht der laufende Kampf mit der Datei — der laufende hat
 * Schaden und Zustaende, die Datei ist eine Vorlage. Verglichen wird, was
 * beim Speichern herauskaeme, mit dem, was gespeichert ist. Sonst meldete
 * das Werkzeug „ungespeichert", sobald jemand einmal Schaden eingetragen
 * hat, und die Rueckfrage waere nach zwei Runden nur noch Rauschen.
 */
export function alsVorlage(teilnehmer: readonly Teilnehmer[]): string {
  return JSON.stringify(
    teilnehmer.map((eintrag) => ({
      name: eintrag.name,
      initiative: eintrag.initiative,
      feinwert: eintrag.feinwert,
      istSpieler: eintrag.istSpieler,
      istTerrain: eintrag.istTerrain,
      koerper: eintrag.koerper.map((koerper) => ({ marke: koerper.marke, hpMax: koerper.hpMax }))
    }))
  );
}

export function pruefeVerlust(kampf: Kampf, begegnungen: readonly Begegnung[]): Warnung {
  // Ein leerer Tracker hat nichts zu verlieren, auch wenn er formal „laeuft".
  if (kampf.teilnehmer.length === 0) return { laeuft: false, ungespeichert: false };

  const gespeichert = kampf.begegnungId
    ? begegnungen.find((begegnung) => begegnung.id === kampf.begegnungId)
    : undefined;

  return {
    laeuft: kampf.laeuft,
    ungespeichert: !gespeichert || alsVorlage(gespeichert.teilnehmer) !== alsVorlage(kampf.teilnehmer)
  };
}

/**
 * Wohin eine Begegnung beim Speichern geht, und ob dort schon eine andere
 * liegt.
 *
 * - Gleicher Name wie geladen: dieselbe Datei, ohne Frage.
 * - Neuer Name: eine neue Datei („Speichern unter"); die alte bleibt.
 * - Liegt unter der neuen Kennung schon eine andere Begegnung, wird
 *   gefragt, statt sie still zu ersetzen (Testbericht: Datenverlust).
 */
export function speicherZiel(
  name: string,
  kampf: Pick<Kampf, 'begegnungId' | 'name'>,
  begegnungen: readonly Begegnung[],
  zuId: (name: string) => string
): { readonly id: string; readonly kollision: Begegnung | null } {
  if (kampf.begegnungId && name.trim() === kampf.name.trim()) return { id: kampf.begegnungId, kollision: null };
  const id = zuId(name);
  const vorhanden = begegnungen.find((b) => b.id === id) ?? null;
  return { id, kollision: vorhanden && vorhanden.id !== kampf.begegnungId ? vorhanden : null };
}
