/**
 * Wo ein Monster lebt.
 *
 * Die Umgebungen selbst stehen nicht mehr hier, sondern in `@suite/umgebungen`
 * — sie werden auch vom Initiative Tracker und (spaeter) vom Encounter
 * Creator gebraucht, und drei Fassungen derselben Sache liefen frueher oder
 * spaeter auseinander.
 *
 * Was hier bleibt, ist die Anpassung an dieses Werkzeug: das Paket kennt die
 * `Bewegung` des Monster Creators nicht und soll sie nicht kennen. Es fragt
 * nur, ob geschwommen und ob gegraben wird; diese Uebersetzung steht hier.
 *
 * Die Umgebung wird weiterhin ZULETZT entschieden und richtet sich nach dem,
 * was schon feststeht:
 *
 *   1. das THEMA — ein Drache gehoert nicht in eine Kanalisation, ein
 *      Konstrukt nicht in einen Feenhain.
 *   2. die BEWEGUNG — wer schwimmt, braucht Wasser; wer graebt, braucht
 *      Boden, in den das geht.
 *
 * Aufgefallen war das an einem Bild der Oberflaeche: ein Elementar mit
 * Schwimmbewegung und „Amphibisch", eingetragen in der Wueste. Beides fuer
 * sich stimmte, zusammen ergab es keinen Sinn.
 */

import {
  passtZumThema,
  passtZurBewegung as passtZurFortbewegung,
  umgebungName,
  UMGEBUNGEN,
  waehleUmgebung,
  type Umgebung
} from '@suite/umgebungen';
import type { Bewegung } from './bewegung';

export { UMGEBUNGEN, passtZumThema, umgebungName };
export type { Umgebung };

function kann(bewegung: Bewegung, art: string): boolean {
  return bewegung.gangarten.some((gangart) => gangart.art === art);
}

/** Die Bewegung dieses Werkzeugs, wie das Paket sie versteht. */
function alsFortbewegung(bewegung: Bewegung) {
  return { schwimmt: kann(bewegung, 'schwimmen'), graebt: kann(bewegung, 'graben') };
}

export function passtZurBewegung(umgebung: Umgebung, bewegung: Bewegung): boolean {
  return passtZurFortbewegung(umgebung, alsFortbewegung(bewegung));
}

export function umgebungFuer(themaId: string, bewegung: Bewegung, rng: () => number): Umgebung {
  return waehleUmgebung(themaId, alsFortbewegung(bewegung), rng);
}
