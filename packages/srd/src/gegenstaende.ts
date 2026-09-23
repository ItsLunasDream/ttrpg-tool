/**
 * Seltenheit und Wert magischer Gegenstaende, aus dem SRD 5.2.1.
 *
 * Abgetippt aus zwei Tabellen, die klein genug sind, um sie gegen das PDF
 * zu lesen: „Magic Item Rarities and Values" / „Seltenheit und Wert
 * magischer Gegenstaende" (EN S. 206, DE S. 238) und „Spell Scroll Costs"
 * / „Kosten fuer Zauberschriftrollen". Die Namen der Seltenheiten stehen
 * so in beiden Fassungen.
 *
 * Eine Formel, die aus einer Wirkung eine Seltenheit macht, gibt es im
 * Regelwerk nicht. Die Seltenheit ist die Eingabe, der Wert fällt aus der
 * Tabelle ab.
 */
import type { Paar } from './namensnennung';

export const SELTENHEITEN = ['common', 'uncommon', 'rare', 'veryRare', 'legendary'] as const;
export type Seltenheit = (typeof SELTENHEITEN)[number];

export const SELTENHEIT_NAME: Record<Seltenheit, Paar> = {
  common: { de: 'Gewöhnlich', en: 'Common' },
  uncommon: { de: 'Ungewöhnlich', en: 'Uncommon' },
  rare: { de: 'Selten', en: 'Rare' },
  veryRare: { de: 'Sehr selten', en: 'Very Rare' },
  legendary: { de: 'Legendär', en: 'Legendary' }
};

/** Der Wert in Goldmuenzen. Artefakte sind unbezahlbar und stehen nicht hier. */
export const WERT_NACH_SELTENHEIT: Readonly<Record<Seltenheit, number>> = {
  common: 100,
  uncommon: 400,
  rare: 4000,
  veryRare: 40000,
  legendary: 200000
};

/** Was das Verfassen einer Schriftrolle kostet, je Zaubergrad (0 = Zaubertrick). */
export const SCHRIFTROLLE_KOSTEN: readonly number[] = [
  15, 25, 100, 150, 1000, 1500, 10000, 12500, 15000, 50000
];

/**
 * Der Wert eines Gegenstands.
 *
 * - Verbrauchsgegenstaende (Traenke, Munition …) kosten die Haelfte.
 * - Eine Zauberschriftrolle kostet das Doppelte ihrer Herstellung, nicht
 *   den Wert ihrer Seltenheit.
 * - Steckt ein gewoehnlicher Gegenstand darin (eine Waffe, eine Ruestung),
 *   kommt dessen Preis dazu: `grundpreis`.
 */
export function gegenstandswert(
  seltenheit: Seltenheit,
  art: { readonly verbrauch?: boolean; readonly schriftrolleGrad?: number; readonly grundpreis?: number } = {}
): number {
  if (art.schriftrolleGrad !== undefined) {
    const kosten = SCHRIFTROLLE_KOSTEN[art.schriftrolleGrad];
    return kosten === undefined ? 0 : kosten * 2;
  }
  const wert = WERT_NACH_SELTENHEIT[seltenheit] / (art.verbrauch ? 2 : 1);
  return wert + (art.grundpreis ?? 0);
}
