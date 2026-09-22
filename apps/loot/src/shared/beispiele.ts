/**
 * Drei kleine Beispieltabellen fuer den ersten Start.
 *
 * Die bewusste Ausnahme von der Regel dieses Werkzeugs („die Tabellen
 * schreibt die Spielleitung, sie werden nicht uebersetzt"): ein leeres
 * Werkzeug beim ersten Start ist eine hohe Huerde, und an drei Beispielen
 * sieht man Spannen, Wuerfel im Text und Verweise auf einen Blick. Angelegt
 * werden sie einmal, in der Sprache, die beim ersten Start eingestellt ist —
 * danach gehoeren sie der Spielleitung wie jede andere Tabelle, und wer sie
 * loescht, bekommt sie nicht wieder.
 *
 * Die Verweise zeigen auf die Namen derselben Sprache; deshalb steht jede
 * Sprache als eigener, vollstaendiger Satz da.
 */
import type { Gespeichert } from './ablage';

type Satz = readonly Gespeichert[];

const DE: Satz = [
  {
    id: 'taschenkram',
    name: 'Taschenkram',
    ohneZuruecklegen: true,
    eintraege: [
      { text: 'Ein Kamm aus Knochen, zwei Zinken fehlen' },
      { text: 'Drei Spielsteine, einer davon gefälscht' },
      { text: 'Ein Brief an „Mira", nie abgeschickt' },
      { text: 'Ein Beutel getrockneter Pflaumen' },
      { text: 'Ein Holzamulett in Form eines Fisches' },
      { text: 'Ein stumpfer Dietrich' },
      { text: 'Eine Schuldnerliste mit 1d4 + 1 Namen' },
      { text: 'Ein halber Laib Brot, noch essbar' }
    ],
    notiz: 'Beispieltabelle. Darf geändert oder gelöscht werden.',
    geaendert: ''
  },
  {
    id: 'etwas-glaenzendes',
    name: 'Etwas Glänzendes',
    wuerfel: '1d6',
    eintraege: [
      { text: 'Ein Silberring mit Kratzern (10 GM)', von: 1, bis: 2 },
      { text: 'Eine vergoldete Gürtelschnalle (25 GM)', von: 3, bis: 4 },
      { text: 'Ein kleiner Rubin (50 GM)', von: 5 },
      { text: 'Ein Heiltrank in einer Feldflasche', von: 6 }
    ],
    notiz: 'Beispieltabelle. Darf geändert oder gelöscht werden.',
    geaendert: ''
  },
  {
    id: 'beute-einer-raeuberbande',
    name: 'Beute einer Räuberbande',
    wuerfel: '1d6',
    eintraege: [
      { text: '2d6 × 10 Kupfermünzen', von: 1, bis: 3 },
      { text: '[Taschenkram] und 1d6 Silbermünzen', von: 4, bis: 5 },
      { text: '[Etwas Glänzendes] und 1d4 × 10 Silbermünzen', von: 6 }
    ],
    notiz: 'Beispieltabelle. Zeigt Spannen, Würfel im Text und Verweise in eckigen Klammern.',
    geaendert: ''
  }
];

const EN: Satz = [
  {
    id: 'pocket-junk',
    name: 'Pocket Junk',
    ohneZuruecklegen: true,
    eintraege: [
      { text: 'A bone comb missing two teeth' },
      { text: 'Three game pieces, one of them loaded' },
      { text: 'A letter to “Mira”, never sent' },
      { text: 'A pouch of dried plums' },
      { text: 'A wooden amulet shaped like a fish' },
      { text: 'A blunt lockpick' },
      { text: 'A list of debtors with 1d4 + 1 names' },
      { text: 'Half a loaf of bread, still edible' }
    ],
    notiz: 'Example table. Change or delete it as you like.',
    geaendert: ''
  },
  {
    id: 'something-shiny',
    name: 'Something Shiny',
    wuerfel: '1d6',
    eintraege: [
      { text: 'A scratched silver ring (10 gp)', von: 1, bis: 2 },
      { text: 'A gilded belt buckle (25 gp)', von: 3, bis: 4 },
      { text: 'A small ruby (50 gp)', von: 5 },
      { text: 'A potion of healing in a waterskin', von: 6 }
    ],
    notiz: 'Example table. Change or delete it as you like.',
    geaendert: ''
  },
  {
    id: 'bandit-loot',
    name: 'Bandit Loot',
    wuerfel: '1d6',
    eintraege: [
      { text: '2d6 × 10 copper pieces', von: 1, bis: 3 },
      { text: '[Pocket Junk] and 1d6 silver pieces', von: 4, bis: 5 },
      { text: '[Something Shiny] and 1d4 × 10 silver pieces', von: 6 }
    ],
    notiz: 'Example table. Shows ranges, dice in the text and references in square brackets.',
    geaendert: ''
  }
];

export function beispiele(sprache: string): Satz {
  return sprache === 'de' ? DE : EN;
}
