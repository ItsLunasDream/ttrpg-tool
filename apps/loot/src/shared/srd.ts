/**
 * Tabellen aus dem SRD 5.2.1, eingebaut und schreibgeschuetzt.
 *
 * Das SRD hat keine Schatztabellen nach Herausforderungsgrad (die stehen im
 * Spielleiterhandbuch, nicht im SRD). Was es hat, ist die Tabelle
 * „Trinkets" / „Requisiten" — ausdruecklich auch fuer die Spielleitung
 * gedacht, „um die Taschen einer Kreatur zu fuellen". Sie steht hier wie
 * eine eigene Tabelle: wuerfelbar, per Verweis erreichbar, als Kopie
 * veraenderbar — aber nicht an ihrem Platz, damit sie beim naechsten
 * Update nicht mit fremdem Text ueberschrieben wird.
 *
 * Anders als eigene Tabellen ist sie zweisprachig: der Text kommt aus den
 * beiden offiziellen Fassungen, nicht aus einer Uebersetzung.
 */
import { TAND, TAND_TITEL } from '@suite/srd/tand';
import type { Gespeichert } from './ablage';

export const SRD_PRAEFIX = 'srd-';

export function istSrd(id: string): boolean {
  return id.startsWith(SRD_PRAEFIX);
}

export function srdTabellen(sprache: 'de' | 'en'): Gespeichert[] {
  return [
    {
      id: `${SRD_PRAEFIX}trinkets`,
      name: TAND_TITEL[sprache],
      wuerfel: '1d100',
      eintraege: TAND.map((paar, i) => ({ text: paar[sprache], von: i + 1, bis: i + 1 })),
      notiz: '',
      geaendert: ''
    }
  ];
}
