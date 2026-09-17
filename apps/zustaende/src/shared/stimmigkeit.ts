/**
 * Die Stimmigkeitspruefung: passen die Teile eines Zustands zueinander?
 *
 * Das Gewicht in `gewicht.ts` beantwortet EINE Frage — wie schwer wiegt er.
 * Diese Datei beantwortet eine andere, und sie ist am Tisch die
 * peinlichere: ergibt das, was da steht, ueberhaupt Sinn?
 *
 * Der Fall, der das ausgeloest hat, stand im ersten Bild der Oberflaeche:
 *
 *   Dauer:     bis zu deinem naechsten Zug
 *   Besser:    eine Stunde in trockener Kleidung senkt ihn um 1
 *
 * Beides fuer sich ist richtig, zusammen ist es Unsinn — der Zustand ist
 * laengst vorbei, wenn die Stunde anfaengt. Beim Schreiben faellt das
 * niemandem auf, am Tisch sofort.
 *
 * Und der zweite, im selben Bild:
 *
 *   Art:       Fluch
 *   Schlimmer: jedes Mal, wenn der Name auf dem Gletscher genannt wird
 *
 * Der Ausloeser des Fluchs („wenn der Name genannt wird") war an einen Ort
 * geklebt, der zur Umgebung gehoert. Ein Fluch braucht keinen Gletscher.
 *
 * WAS HIER GEPRUEFT WIRD, ist ausschliesslich das Verhaeltnis der Teile
 * zueinander — kein Geschmack, keine Balance. Jede Meldung laesst sich auf
 * einen Satz bringen, der mit „das kann nicht beides gelten" anfaengt.
 */

import { skalaWert, type Zeitskala } from './tabellen';

/** Was an einem Zustand nicht zusammenpasst. */
export type Stimmigkeitsgrund =
  /** Die Linderung braucht laenger, als der Zustand ueberhaupt anhaelt. */
  | 'linderungZuLangsam'
  /** Die Verschlimmerung ebenso: sie kaeme nie zum Zug. */
  | 'verschlimmerungZuLangsam'
  /** Mehrere Stufen, aber der Zustand ist vorbei, bevor die zweite kommt. */
  | 'stufenOhneZeit'
  /** Ein Ort als Ausloeser, obwohl der Zustand nicht von der Umgebung kommt. */
  | 'ausloeserOhneUmgebung';

export interface Stimmigkeitsbefund {
  readonly ok: boolean;
  readonly gruende: readonly Stimmigkeitsgrund[];
}

/** Was die Pruefung braucht. Bewusst nur Skalen und Zahlen, keine Texte. */
export interface Stimmigkeitsangaben {
  readonly dauerSkala: Zeitskala;
  readonly linderungSkala: Zeitskala;
  readonly verschlimmerungSkala: Zeitskala;
  readonly stufen: number;
  readonly artId: string;
  /** Ob ein Ort als Ausloeser dransteht. */
  readonly mitOrt: boolean;
}

/**
 * Wie viele Stufen ein Takt ueberhaupt hergibt.
 *
 * Im Kampf bleibt keine Zeit, sich hochzuarbeiten: wer bis zum naechsten Zug
 * anhaelt, kommt nie auf Stufe 3. Eine Stufe ist dort das Aeusserste, und
 * das ist keine willkuerliche Grenze, sondern das, was die Dauer hergibt.
 */
const STUFEN_JE_SKALA: Record<Zeitskala, number> = { kampf: 1, kurz: 10, lang: 10 };

export function pruefeStimmigkeit(angaben: Stimmigkeitsangaben): Stimmigkeitsbefund {
  const gruende: Stimmigkeitsgrund[] = [];
  const dauer = skalaWert(angaben.dauerSkala);

  /*
   * Die Linderung darf nicht laenger brauchen als der Zustand dauert.
   *
   * Gleicher Takt ist in Ordnung: „eine Stunde" gelindert durch „eine
   * Stunde am Feuer" ist knapp, aber sinnvoll — man kommt gerade so hin.
   * Ein Takt darueber ist es nicht mehr.
   */
  if (skalaWert(angaben.linderungSkala) > dauer) gruende.push('linderungZuLangsam');
  if (skalaWert(angaben.verschlimmerungSkala) > dauer) gruende.push('verschlimmerungZuLangsam');

  if (angaben.stufen > STUFEN_JE_SKALA[angaben.dauerSkala]) gruende.push('stufenOhneZeit');

  // Ein Ort gehoert zur Umgebung. Ein Fluch braucht keinen Gletscher.
  if (angaben.mitOrt && angaben.artId !== 'umgebung') gruende.push('ausloeserOhneUmgebung');

  return { ok: gruende.length === 0, gruende };
}

/**
 * Welche Dauern zu einem Zustand mit so vielen Stufen passen.
 *
 * Der Erzeuger fragt das, bevor er wuerfelt — eine Pruefung, die einen
 * Fehler nur meldet, den das Werkzeug selbst gebaut hat, ist eine
 * Ausrede.
 */
export function skalenFuerStufen(stufen: number): Zeitskala[] {
  return (Object.keys(STUFEN_JE_SKALA) as Zeitskala[]).filter(
    (skala) => stufen <= STUFEN_JE_SKALA[skala]
  );
}
