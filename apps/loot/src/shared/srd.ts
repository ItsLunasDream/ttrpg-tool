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
 * Dazu kommen drei Tabellen aus dem Kapitel Ausruestung: Waffen, Ruestung
 * und Abenteurerausruestung, jeder Gegenstand mit seinem Preis, ohne
 * Wuerfel (jede Zeile gleich wahrscheinlich). Zwischenzeilen („Einfache
 * Nahkampfwaffen") zaehlen nicht mit.
 *
 * Anders als eigene Tabellen sind sie zweisprachig: der Text kommt aus den
 * beiden offiziellen Fassungen, nicht aus einer Uebersetzung.
 */
import { TAND, TAND_TITEL } from '@suite/srd/tand';
import { AUSRUESTUNG } from '@suite/srd/ausruestung';
import type { Gespeichert } from './ablage';

export const SRD_PRAEFIX = 'srd-';

export function istSrd(id: string): boolean {
  return id.startsWith(SRD_PRAEFIX);
}

/** Eintrag der Ausruestung und die Tabelle darin, die zur Beute taugt. */
const AUS_AUSRUESTUNG = [
  { id: 'weapons', kennung: 'waffen' },
  { id: 'armor', kennung: 'ruestung' },
  { id: 'adventuring-gear', kennung: 'abenteurerausruestung' }
] as const;

function ausruestungsTabelle(id: string, kennung: string, sprache: 'de' | 'en'): Gespeichert {
  const eintrag = AUSRUESTUNG.find((a) => a.id === id);
  const tabelle = eintrag?.bloecke[sprache].find((b) => b.typ === 'tabelle');
  if (!tabelle || tabelle.typ !== 'tabelle') throw new Error(`SRD-Tabelle fehlt: ${id}`);
  return {
    id: `${SRD_PRAEFIX}${kennung}`,
    name: tabelle.titel,
    eintraege: tabelle.reihen
      .filter((r) => r.slice(1).some(Boolean))
      .map((r) => ({ text: `${r[0].replace(/\s+/g, ' ')} (${r[r.length - 1]})` })),
    notiz: '',
    geaendert: ''
  };
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
    },
    ...AUS_AUSRUESTUNG.map((a) => ausruestungsTabelle(a.id, a.kennung, sprache))
  ];
}
