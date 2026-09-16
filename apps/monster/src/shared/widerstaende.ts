/**
 * Resistenzen, Immunitaeten und Verwundbarkeiten.
 *
 * Zwei Dinge sind hier wichtig, und beide sind Entscheidungen, keine Regeln
 * aus einem Buch:
 *
 * 1. **Sie sind nicht Pflicht.** Ein Bestiarium, in dem jedes Wesen gegen
 *    drei Dinge resistent und gegen zwei immun ist, ist langweilig — und es
 *    nimmt den wenigen Monstern, bei denen es zaehlt, die Wirkung. Deshalb
 *    haengt hier alles an Chancen, und die meisten Monster bekommen nichts.
 * 2. **Sie zaehlen fuer den Grad.** Resistenz gegen koerperlichen Schaden
 *    verlaengert jeden Kampf, weil sie fast jeden Angriff der Gruppe trifft.
 *    Die Pruefung rechnet das ueber die wirksamen Trefferpunkte mit.
 *
 * Verwundbarkeit ist der Gegenfall und kommt selten vor: sie verkuerzt den
 * Kampf und macht das Monster schwaecher, als der Grad sagt.
 */

import { SCHADENSARTEN, schadensart, type SchadensartId } from './schadensarten';
import type { Thema } from './tabellen';

export interface Widerstaende {
  readonly resistenzen: readonly SchadensartId[];
  readonly immunitaeten: readonly SchadensartId[];
  readonly verwundbarkeiten: readonly SchadensartId[];
}

export const KEINE_WIDERSTAENDE: Widerstaende = {
  resistenzen: [],
  immunitaeten: [],
  verwundbarkeiten: []
};

/**
 * Was zu einer Art von Wesen passt.
 *
 * `immun` sind die Arten, die dem Wesen naturgemaess nichts anhaben — ein
 * Untoter nimmt kein Gift, ein Konstrukt wird nicht vergiftet. `resistent`
 * ist weicher gemeint. `verwundbar` ist die Schwachstelle, und sie ist der
 * Grund, warum die Gruppe ueberhaupt Fackeln mitnimmt.
 */
interface Neigung {
  readonly immun: readonly SchadensartId[];
  readonly resistent: readonly SchadensartId[];
  readonly verwundbar: readonly SchadensartId[];
}

const NEIGUNG: Record<string, Neigung> = {
  untot: { immun: ['gift'], resistent: ['nekrotisch', 'kaelte'], verwundbar: ['strahlend'] },
  bestie: { immun: [], resistent: [], verwundbar: [] },
  konstrukt: { immun: ['gift', 'psychisch'], resistent: ['wucht', 'stich', 'hieb'], verwundbar: ['blitz'] },
  aberration: { immun: [], resistent: ['psychisch'], verwundbar: ['strahlend'] },
  elementar: { immun: ['gift'], resistent: ['feuer', 'kaelte', 'blitz', 'donner'], verwundbar: [] },
  unhold: { immun: ['feuer'], resistent: ['kaelte', 'nekrotisch'], verwundbar: ['strahlend'] },
  fee: { immun: [], resistent: ['psychisch'], verwundbar: ['energie'] },
  drache: { immun: [], resistent: ['feuer', 'kaelte', 'blitz', 'saeure', 'gift'], verwundbar: [] },
  humanoid: { immun: [], resistent: [], verwundbar: [] },
  pflanze: { immun: [], resistent: ['stich'], verwundbar: ['feuer'] }
};

/**
 * Wie wahrscheinlich ueberhaupt etwas dabei ist.
 *
 * Mit dem Grad steigend: ein Wolf auf Grad 1/4 hat nichts, ein Erzunhold auf
 * Grad 20 hat mehrere. Die Zahlen sind eine eigene Einschaetzung, keine
 * Vorgabe aus einer Quelle — sie stehen hier an einer Stelle, damit man sie
 * drehen kann, ohne den Erzeuger zu lesen.
 */
function chance(crWert: number, grund: number): number {
  const ausGrad = Math.min(0.35, crWert / 60);
  return Math.min(0.9, grund + ausGrad);
}

/** Ein Eintrag aus einer Liste, ohne Wiederholung. */
function ziehOhneWiederholung(
  liste: readonly SchadensartId[],
  vergeben: Set<string>,
  rng: () => number
): SchadensartId | null {
  const uebrig = liste.filter((id) => !vergeben.has(id));
  if (uebrig.length === 0) return null;
  const gewaehlt = uebrig[Math.floor(rng() * uebrig.length)];
  vergeben.add(gewaehlt);
  return gewaehlt;
}

/**
 * Die Widerstaende eines Monsters.
 *
 * Eine Schadensart kann nur EINS sein: was immun macht, ist nicht zusaetzlich
 * resistent, und was verwundbar macht, ist nicht immun. Das klingt
 * selbstverstaendlich und ist der haeufigste Fehler in Homebrew-Statblocks.
 */
export function widerstaendeFuer(
  thema: Thema,
  crWert: number,
  rng: () => number
): Widerstaende {
  const neigung = NEIGUNG[thema.id] ?? { immun: [], resistent: [], verwundbar: [] };
  const vergeben = new Set<string>();

  const immunitaeten: SchadensartId[] = [];
  const resistenzen: SchadensartId[] = [];
  const verwundbarkeiten: SchadensartId[] = [];

  // Immunitaeten zuerst: sie sind das Staerkste und sollen die knapperen
  // Arten bekommen, bevor die Resistenzen sie wegnehmen.
  if (neigung.immun.length > 0 && rng() < chance(crWert, 0.2)) {
    const gewaehlt = ziehOhneWiederholung(neigung.immun, vergeben, rng);
    if (gewaehlt) immunitaeten.push(gewaehlt);
    // Eine zweite nur bei hohen Graden, und auch dort nicht immer.
    if (crWert >= 10 && rng() < 0.4) {
      const zweite = ziehOhneWiederholung(neigung.immun, vergeben, rng);
      if (zweite) immunitaeten.push(zweite);
    }
  }

  if (neigung.resistent.length > 0 && rng() < chance(crWert, 0.25)) {
    const gewaehlt = ziehOhneWiederholung(neigung.resistent, vergeben, rng);
    if (gewaehlt) resistenzen.push(gewaehlt);
    if (crWert >= 8 && rng() < 0.45) {
      const zweite = ziehOhneWiederholung(neigung.resistent, vergeben, rng);
      if (zweite) resistenzen.push(zweite);
    }
  }

  // Verwundbarkeit ist selten und wird mit dem Grad NICHT haeufiger: ein
  // Erzunhold mit einer offenen Flanke ist die Ausnahme, nicht die Regel.
  if (neigung.verwundbar.length > 0 && rng() < 0.15) {
    const gewaehlt = ziehOhneWiederholung(neigung.verwundbar, vergeben, rng);
    if (gewaehlt) verwundbarkeiten.push(gewaehlt);
  }

  return { resistenzen, immunitaeten, verwundbarkeiten };
}

/**
 * Wie stark die Widerstaende fuer den Grad zaehlen.
 *
 * Eine Resistenz gegen koerperlichen Schaden wiegt schwerer als eine gegen
 * Strahlen: fast jede Gruppe schlaegt mit etwas Koerperlichem zu, aber nur
 * die mit Kleriker macht Strahlenschaden. Der Faktor ist eine eigene
 * Entscheidung und bewusst grob — er soll die Richtung stimmen lassen, nicht
 * eine Genauigkeit vortaeuschen, die es hier nicht gibt.
 *
 * Herausgegeben wird die Zahl, mit der die Pruefung rechnet: eine gewichtete
 * Anzahl, keine gezaehlte.
 */
export function gewicht(arten: readonly SchadensartId[]): number {
  return arten.reduce((summe, id) => summe + (schadensart(id)?.koerperlich ? 2 : 1), 0);
}

/**
 * Verwundbarkeiten als negative Resistenzen.
 *
 * Wer gegen etwas verwundbar ist, nimmt doppelten Schaden davon und haelt
 * entsprechend kuerzer durch. Dieselbe Gewichtung, andere Richtung.
 */
export function gewichtVerwundbar(arten: readonly SchadensartId[]): number {
  return -gewicht(arten);
}

/** Alle Schadensarten, in der Reihenfolge der Tabelle. Fuer die Oberflaeche. */
export const ALLE_SCHADENSARTEN: readonly SchadensartId[] = SCHADENSARTEN.map((art) => art.id);
