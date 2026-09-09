/**
 * Gebäudearten für den Stadt/Dorf-Generator.
 *
 * Vorher waren Häuser anonyme Rechtecke: eine Wandkontur, eine Tür, eine
 * zufällige Dachfarbe, kein einziges Möbel dahinter — sichtbar wurde das erst
 * beim Hineinzoomen, aber dann sofort. Genau wie bei den Dungeon-Raumthemen
 * (`roomThemes.ts`) macht die *Kombination* aus Möbeln ein Gebäude erzählbar,
 * nicht ein einzelnes Requisit: Amboss und Esse sind eine Schmiede, Krug und
 * runder Tisch ein Gasthaus.
 *
 * Anders als bei Dungeon-Räumen gibt es hier keinen Korridor-Graphen, entlang
 * dessen sich Nachbarschaft vergeben ließe — ein Ort ist kein Gang von Raum zu
 * Raum, sondern eine Fläche voller gleichwertiger Grundstücke. Die Zuteilung
 * arbeitet deshalb anders: die größten Gebäude zuerst (ein Rathaus passt nicht
 * in eine Kate), gewichtet gewürfelt, mit einer Obergrenze je Art, die mit der
 * Ortsgröße wächst — eine Schmiede reicht auch für dreihundert Häuser genau
 * einmal, ein Gasthaus darf sich wiederholen.
 */

import type { Rng } from '../rng';

export interface BuildingKind {
  id: string;
  /** Schlüssel im Wörterbuch; die Namen sind Oberfläche. */
  nameKey: string;
  /** Gewicht unter den Kandidaten, die für ein Gebäude in Frage kommen. */
  weight: number;
  /** Mindestgrundfläche in Feldern — ein Rathaus braucht mehr als eine Kate. */
  minArea: number;
  /** Wie oft diese Art in einem Ort mit `buildingCount` Häusern höchstens vorkommt. */
  max: (buildingCount: number) => number;
  /** Möbel im Inneren. */
  interior: string[];
  /** Ein einzelnes, größeres Requisit direkt an der Tür — das eigentliche Schild. */
  sign: string;
  /** Licht am Feierabend, 0–1. */
  lit: number;
}

/** Gewöhnliches Wohnhaus — die Grundmenge, kein Sonderfall. */
export const HOUSE_KIND: BuildingKind = {
  id: 'house',
  nameKey: 'building.house',
  weight: 0,
  minArea: 0,
  max: () => Infinity,
  interior: ['bed', 'table_rect', 'chair', 'chest'],
  sign: '',
  lit: 0.2,
};

/**
 * Besondere Gebäude, nach Gewicht — Gasthaus und Kramladen kommen mehrfach
 * vor, Schmiede, Tempel, Rathaus und Mühle je Ort nur einmal.
 */
export const BUILDING_KINDS: BuildingKind[] = [
  {
    id: 'tavern',
    nameKey: 'building.tavern',
    weight: 3,
    minArea: 8,
    max: (n) => Math.max(1, Math.round(n / 15)),
    interior: ['table_round', 'dining_set', 'barrel', 'bench'],
    sign: 'barrel',
    lit: 0.8,
  },
  {
    id: 'store',
    nameKey: 'building.store',
    weight: 3,
    minArea: 6,
    max: (n) => Math.max(1, Math.round(n / 12)),
    interior: ['market_stall', 'sacks', 'pottery', 'crate'],
    sign: 'market_stall',
    lit: 0.4,
  },
  {
    id: 'blacksmith',
    nameKey: 'building.blacksmith',
    weight: 2,
    minArea: 6,
    max: () => 1,
    interior: ['forge', 'anvil', 'weapon_rack'],
    sign: 'anvil',
    lit: 0.6,
  },
  {
    id: 'stable',
    nameKey: 'building.stable',
    weight: 1,
    minArea: 8,
    max: (n) => Math.max(1, Math.round(n / 25)),
    interior: ['hay', 'trough', 'fence'],
    sign: 'trough',
    lit: 0.1,
  },
  {
    id: 'temple',
    nameKey: 'building.temple',
    weight: 1,
    minArea: 10,
    max: () => 1,
    interior: ['altar', 'candelabra', 'lectern'],
    sign: 'statue',
    lit: 0.7,
  },
  {
    id: 'townhall',
    nameKey: 'building.townhall',
    weight: 1,
    minArea: 12,
    max: () => 1,
    interior: ['lectern', 'bench', 'map_table'],
    sign: 'banner',
    lit: 0.5,
  },
  {
    id: 'mill',
    nameKey: 'building.mill',
    weight: 1,
    minArea: 8,
    max: () => 1,
    interior: ['grindstone', 'sacks', 'barrel'],
    sign: 'grindstone',
    lit: 0.1,
  },
];

/**
 * Vergibt jedem Gebäude eine Art, aus seiner Grundfläche.
 *
 * `flaechen[i]` ist die Grundfläche des i-ten Hauses, in Feldern. Zurück
 * kommt eine Art je Haus, in derselben Reihenfolge — die meisten bleiben
 * `HOUSE_KIND`.
 *
 * Wie viele besondere Gebäude ein Ort verträgt, hängt nicht von einer festen
 * Zahl ab, sondern von seiner Größe: ungefähr ein Sechstel der Häuser, nie
 * mehr, als die einzelnen Obergrenzen (`max`) erlauben. Vergeben wird von der
 * größten Grundfläche zur kleinsten, denn ein Rathaus braucht Platz, den eine
 * Kate nicht hat — bei kleinen Häusern zuerst zu würfeln bliebe meist ergebnislos.
 */
export function assignBuildingKinds(rng: Rng, flaechen: number[]): BuildingKind[] {
  const n = flaechen.length;
  const ergebnis: BuildingKind[] = flaechen.map(() => HOUSE_KIND);
  if (n < 3) return ergebnis;

  const reihenfolge = flaechen.map((_, i) => i).sort((a, b) => flaechen[b] - flaechen[a]);
  const zaehler = new Map<string, number>();
  let slots = Math.max(1, Math.round(n * 0.18));

  for (const i of reihenfolge) {
    if (slots <= 0) break;
    const kandidaten = BUILDING_KINDS.filter(
      (k) => flaechen[i] >= k.minArea && (zaehler.get(k.id) ?? 0) < k.max(n),
    );
    if (kandidaten.length === 0) continue;

    const gesamt = kandidaten.reduce((sum, k) => sum + k.weight, 0);
    let r = rng.range(0, gesamt);
    let gewaehlt = kandidaten[kandidaten.length - 1];
    for (const k of kandidaten) {
      if (r < k.weight) {
        gewaehlt = k;
        break;
      }
      r -= k.weight;
    }

    ergebnis[i] = gewaehlt;
    zaehler.set(gewaehlt.id, (zaehler.get(gewaehlt.id) ?? 0) + 1);
    slots--;
  }

  return ergebnis;
}
