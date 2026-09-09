/**
 * Raumthemen für den Dungeon-Generator.
 *
 * Ein Dungeon, dessen Räume gleichmäßig mit Schutt und Knochen bestreut sind,
 * sieht aus wie ein Grundriss mit Rauschen darauf. Was einen Raum erzählbar
 * macht, ist die *Kombination*: ein langer Tisch mit Stühlen ist ein
 * Speisesaal, Fässer und Töpfe daneben sind die Küche dazu — und dass beides
 * nebeneinander liegt, ist die eigentliche Aussage.
 *
 * Deshalb zwei Dinge hier und nicht im Generator:
 *
 * 1. **Möbel haben Plätze, nicht Koordinaten.** Ein Tisch steht mittig,
 *    Stühle stehen um ihn herum, Regale und Fässer an der Wand, Kleinkram
 *    irgendwo. Zufällig verteilt sähe auch ein Speisesaal nach Lagerraum aus.
 * 2. **Räume kennen ihre Nachbarn.** Jede Raumart nennt, was gut neben ihr
 *    liegt; der Generator vergibt die Arten entlang des Korridor-Graphen und
 *    greift bevorzugt in diese Liste. So entsteht die Küche neben dem
 *    Speisesaal, statt dass beides zufällig über die Karte verstreut wird.
 */

import type { Rng } from '../rng';

export type DungeonTheme = 'none' | 'random' | 'plain' | 'castle' | 'temple' | 'crypt';

/** Themen, die sich auswählen lassen — 'none' und 'random' sind Sonderfälle. */
export const DUNGEON_THEMES: DungeonTheme[] = ['none', 'random', 'plain', 'castle', 'temple', 'crypt'];

export interface RoomKind {
  id: string;
  /** Schlüssel im Wörterbuch; die Namen sind Oberfläche. */
  nameKey: string;
  /** Ein großes Möbel in der Raummitte; leer heißt: keins. */
  center: string[];
  /** Was sich um das mittige Möbel gruppiert — Stühle um den Tisch. */
  around: string[];
  /** Was an der Wand steht. */
  walls: string[];
  /** Kleinkram, überall. */
  scatter: string[];
  /** Raumarten, die gut daneben liegen. */
  neighbours: string[];
  /** Fackel- oder Kerzenlicht in diesem Raum, 0–1. */
  lit: number;
}

/**
 * Alle Raumarten, nach Thema.
 *
 * `neighbours` verweist nur innerhalb desselben Themas — eine Krypta neben
 * einer Schlossküche wäre ein Zufall, kein Zusammenhang.
 */
export const ROOM_KINDS: Record<Exclude<DungeonTheme, 'none' | 'random'>, RoomKind[]> = {
  plain: [
    {
      id: 'storage',
      nameKey: 'room.storage',
      center: [],
      around: [],
      walls: ['crate', 'barrel', 'hay'],
      scatter: ['pottery', 'rubble'],
      neighbours: ['storage', 'rubbleRoom'],
      lit: 0.35,
    },
    {
      id: 'rubbleRoom',
      nameKey: 'room.rubble',
      center: [],
      around: [],
      walls: ['rubble', 'stone_medium'],
      scatter: ['rubble', 'bones', 'web', 'stone_small'],
      neighbours: ['rubbleRoom', 'storage', 'empty'],
      lit: 0.15,
    },
    {
      id: 'empty',
      nameKey: 'room.empty',
      center: [],
      around: [],
      walls: [],
      scatter: ['rubble', 'web'],
      neighbours: ['rubbleRoom', 'storage'],
      lit: 0.25,
    },
  ],

  castle: [
    {
      id: 'hall',
      nameKey: 'room.hall',
      center: ['table_rect'],
      around: ['chair'],
      walls: ['barrel', 'column'],
      scatter: ['pottery', 'rug'],
      // Die Küche gehört an den Saal — der Fall, um den es geht.
      neighbours: ['kitchen', 'pantry', 'throne'],
      lit: 0.9,
    },
    {
      id: 'kitchen',
      nameKey: 'room.kitchen',
      center: ['table_round'],
      around: ['barrel'],
      walls: ['crate', 'barrel', 'pottery'],
      scatter: ['pottery', 'hay'],
      neighbours: ['hall', 'pantry'],
      lit: 0.8,
    },
    {
      id: 'pantry',
      nameKey: 'room.pantry',
      center: [],
      around: [],
      walls: ['crate', 'barrel', 'hay', 'chest'],
      scatter: ['pottery'],
      neighbours: ['kitchen', 'hall'],
      lit: 0.4,
    },
    {
      id: 'bedchamber',
      nameKey: 'room.bedchamber',
      center: ['bed'],
      around: ['chest'],
      walls: ['chest', 'mirror'],
      scatter: ['rug'],
      neighbours: ['bedchamber', 'guard'],
      lit: 0.7,
    },
    {
      id: 'guard',
      nameKey: 'room.guard',
      center: ['table_round'],
      around: ['chair'],
      walls: ['weapons', 'shield', 'crate'],
      scatter: ['bedroll'],
      neighbours: ['bedchamber', 'armoury', 'hall'],
      lit: 0.8,
    },
    {
      id: 'armoury',
      nameKey: 'room.armoury',
      center: [],
      around: [],
      walls: ['weapons', 'shield', 'crate', 'chest'],
      scatter: [],
      neighbours: ['guard'],
      lit: 0.5,
    },
    {
      id: 'throne',
      nameKey: 'room.throne',
      center: ['statue'],
      around: ['column'],
      walls: ['column', 'brazier'],
      scatter: ['rug'],
      neighbours: ['hall', 'guard'],
      lit: 1,
    },
  ],

  temple: [
    {
      id: 'sanctum',
      nameKey: 'room.sanctum',
      center: ['altar'],
      around: ['brazier', 'column'],
      walls: ['column', 'statue'],
      scatter: ['rug', 'coins'],
      neighbours: ['vestry', 'library', 'shrine'],
      lit: 1,
    },
    {
      id: 'library',
      nameKey: 'room.library',
      center: ['table_rect'],
      around: ['chair'],
      walls: ['bookshelf', 'bookshelf', 'chest'],
      scatter: ['books', 'scroll'],
      neighbours: ['sanctum', 'cell'],
      lit: 0.85,
    },
    {
      id: 'cell',
      nameKey: 'room.cell',
      center: [],
      around: [],
      walls: ['bedroll', 'chest'],
      scatter: ['books'],
      neighbours: ['cell', 'library', 'vestry'],
      lit: 0.4,
    },
    {
      id: 'vestry',
      nameKey: 'room.vestry',
      center: ['well'],
      around: ['brazier'],
      walls: ['chest', 'statue'],
      scatter: ['pottery'],
      neighbours: ['sanctum', 'cell'],
      lit: 0.7,
    },
    {
      id: 'shrine',
      nameKey: 'room.shrine',
      center: ['statue'],
      around: ['brazier'],
      walls: ['column'],
      scatter: ['coins', 'rug'],
      neighbours: ['sanctum'],
      lit: 0.9,
    },
  ],

  crypt: [
    {
      id: 'tomb',
      nameKey: 'room.tomb',
      center: ['sarcophagus'],
      around: ['brazier'],
      walls: ['gravestone', 'column'],
      scatter: ['bones', 'skull', 'web'],
      neighbours: ['ossuary', 'tomb', 'offering'],
      lit: 0.35,
    },
    {
      id: 'ossuary',
      nameKey: 'room.ossuary',
      center: [],
      around: [],
      walls: ['gravestone', 'bones'],
      scatter: ['bones', 'skull', 'skeleton', 'web'],
      neighbours: ['tomb', 'ossuary'],
      lit: 0.2,
    },
    {
      id: 'offering',
      nameKey: 'room.offering',
      center: ['altar'],
      around: ['brazier'],
      walls: ['statue', 'column'],
      scatter: ['coins', 'skull', 'blood_pool'],
      neighbours: ['tomb', 'ossuary'],
      lit: 0.6,
    },
  ],
};

/** Alle Raumarten quer über alle Themen — für 'random'. */
function alleArten(): RoomKind[] {
  return Object.values(ROOM_KINDS).flat();
}

export function roomKindsFor(theme: DungeonTheme): RoomKind[] {
  if (theme === 'none') return [];
  if (theme === 'random') return alleArten();
  return ROOM_KINDS[theme];
}

/**
 * Vergibt Raumarten entlang der Nachbarschaft.
 *
 * `parent[i]` ist der Raum, an den Raum `i` beim Bau des Korridor-Graphen
 * angeschlossen wurde; -1 heißt: Wurzel. Die Reihenfolge muss so sein, dass
 * jeder Elternraum vor seinem Kind drankommt — dann steht dessen Art schon
 * fest, wenn das Kind sie braucht.
 *
 * Mit `treue` lässt sich einstellen, wie streng die Nachbarschaft genommen
 * wird. Ganz ohne Ausreißer bekäme man Ketten aus lauter Küchen; ganz ohne
 * Bindung wieder Zufall.
 */
export function assignRoomKinds(
  rng: Rng,
  parent: number[],
  arten: RoomKind[],
  treue = 0.75,
): RoomKind[] {
  if (arten.length === 0) return [];
  const nachId = new Map(arten.map((a) => [a.id, a]));
  const out: RoomKind[] = [];

  for (let i = 0; i < parent.length; i++) {
    const p = parent[i];
    const eltern = p >= 0 ? out[p] : undefined;
    if (eltern && rng.bool(treue)) {
      // Nur Nachbarn, die es im gewählten Thema überhaupt gibt.
      const moeglich = eltern.neighbours.map((id) => nachId.get(id)).filter((a): a is RoomKind => !!a);
      if (moeglich.length > 0) {
        out.push(rng.pick(moeglich));
        continue;
      }
    }
    out.push(rng.pick(arten));
  }
  return out;
}
