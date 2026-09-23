/**
 * Das Kapitel Ausruestung des SRD 5.2.1: Muenzen, Waffen mit Eigenschaften
 * und Meisterschaften, Ruestung, Werkzeug, Abenteuerausruestung, Reittiere
 * und Fahrzeuge, Lebenshaltung, Dienste, magische Gegenstaende im
 * Allgemeinen und das Herstellen. Woertlich und in beiden Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/ausruestung_lesen.py und
 * werkzeug/ausruestung_erzeugen.py) und wird nicht von Hand gepflegt.
 * Gepaart ueber Abschnitt, Preis, Tabellenform und die Zahlen im Text; der
 * Rest steht von Hand in werkzeug/ausruestung_paare.json, gegen Abschnitt,
 * Preis und Tabellenform geprueft. Die Eintraege stehen in der Folge des
 * Kapitels.
 */
import type { Paar } from './namensnennung';
import type { Gegenstandsblock } from './magische-gegenstaende';

export type Ausruestungsblock = Gegenstandsblock;

export interface Ausruestung {
  /** Aus dem englischen Namen: „alchemist-s-fire-50-gp". */
  readonly id: string;
  readonly name: Paar;
  /** Der Abschnitt des Kapitels: „Weapons" / „Waffen". */
  readonly abschnitt: Paar;
  /** Ein Infokasten („Selling Equipment"), kein Eintrag des Fliesstexts. */
  readonly kasten?: true;
  readonly bloecke: { readonly de: readonly Ausruestungsblock[]; readonly en: readonly Ausruestungsblock[] };
}

export const AUSRUESTUNG: readonly Ausruestung[] = [
 {
  "id": "coins",
  "name": {
   "de": "Münzen",
   "en": "Coins"
  },
  "abschnitt": {
   "de": "Münzen",
   "en": "Coins"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Charaktere finden bei ihren Abenteuern oft Münzen, die sie in Läden, Gasthäusern und anderen Geschäften ausgeben können. Münzen gibt es in unterschiedlichen Nennwerten, die auf dem Wert ihres Materials beruhen. In der Tabelle „Münzwerte“ sind die Münzen und ihr jeweiliger Wert im Verhältnis zur Goldmünze aufgeführt, der wichtigsten Münze des Spiels. Beispiel: 100 Kupfermünzen haben den Wert von 1 Goldmünze. Eine Münze wiegt acht bis zehn Gramm. Fünfzig Münzen wiegen daher etwa ein halbes Kilo."
    },
    {
     "typ": "tabelle",
     "titel": "Münzwerte",
     "kopf": [
      "Münze",
      "Wert in GM"
     ],
     "reihen": [
      [
       "Kupfermünze (KM)",
       "1/100"
      ],
      [
       "Silbermünze (SM)",
       "1/10"
      ],
      [
       "Elektrummünze (EM)",
       "1/2"
      ],
      [
       "Goldmünze (GM)",
       "1"
      ],
      [
       "Platinmünze (PM)",
       "10"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Characters often find coins on their adventures and can spend those coins in shops, inns, and other businesses. Coins come in different denominations based on the relative worth of their material. The Coin Values table lists coins and how much they’re worth relative to the Gold Piece, which is the game’s main coin. For example, 100 Copper Pieces are worth 1 Gold Piece. A coin weighs about a third of an ounce, so fifty coins weigh a pound."
    },
    {
     "typ": "tabelle",
     "titel": "Coin Values",
     "kopf": [
      "Coin",
      "Value in GP"
     ],
     "reihen": [
      [
       "Copper Piece (CP)",
       "1/100"
      ],
      [
       "Silver Piece (SP)",
       "1/10"
      ],
      [
       "Electrum Piece (EP)",
       "1/2"
      ],
      [
       "Gold Piece (GP)",
       "1"
      ],
      [
       "Platinum Piece (PP)",
       "10"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "weapons",
  "name": {
   "de": "Waffen",
   "en": "Weapons"
  },
  "abschnitt": {
   "de": "Waffen",
   "en": "Weapons"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In der Tabelle „Waffen“ in diesem Abschnitt sind die wichtigsten Waffen des Spiels aufgeführt. Außerdem sind Kosten und Gewicht der Waffen sowie folgende Details angegeben:"
    },
    {
     "typ": "stichpunkt",
     "text": "Kategorie: Jede Waffe gehört zu einer von zwei Kategorien: Einfache Waffe oder Kriegswaffe. Übung im Umgang mit Waffen ist üblicherweise mit einer dieser Kategorien verknüpft. So kannst du beispielsweise Übung im Umgang mit einfachen Waffen haben."
    },
    {
     "typ": "stichpunkt",
     "text": "Nahkampf oder Fernkampf: Eine Waffe wird entweder als Nahkampf ‑ oder Fernkampfwaffe eingestuft. Mit Nahkampfwaffen werden Gegner im Abstand von bis zu 1,5 Metern angegriffen. Fernkampfwaffen dienen zum Angreifen von weiter entfernten Zielen."
    },
    {
     "typ": "stichpunkt",
     "text": "Schaden: In der Tabelle wird die Schadensmenge, die eine Waffe bei einem Treffer bewirkt, sowie die Schadensart genannt."
    },
    {
     "typ": "stichpunkt",
     "text": "Eigenschaften: Alle Eigenschaften einer Waffe sind in der Spalte „Eigenschaften“ aufgeführt. Die Eigenschaften werden im Abschnitt „Eigenschaften“ beschrieben."
    },
    {
     "typ": "stichpunkt",
     "text": "Beherrschung: Jede Waffe hat eine Meisterschaftseigenschaft, die im Abschnitt „Meisterschaftseigenschaft“ beschrieben ist. Um diese Eigenschaft zu verwenden, musst du über ein Merkmal verfügen, das die Verwendung zulässt."
    },
    {
     "typ": "tabelle",
     "titel": "Waffen",
     "kopf": [
      "Name",
      "Schaden",
      "Eigenschaften",
      "Beherrschung",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Einfache Nahkampfwaffen",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Beil",
       "1W6 Hieb",
       "Leicht, Wurfwaffe (Reichweite 6/18)",
       "Plagen",
       "1 kg",
       "5 GM"
      ],
      [
       "Dolch",
       "1W4 Stich",
       "Finesse, Leicht, Wurfwaffe (Reichweite 6/18)",
       "Einkerben",
       "0,5 kg",
       "2 GM"
      ],
      [
       "Kampfstab",
       "1W6 Wucht",
       "Vielseitig (1W8)",
       "Umstoßen",
       "2 kg",
       "2 SM"
      ],
      [
       "Knüppel",
       "1W4 Wucht",
       "Leicht",
       "Verlangsamen",
       "1 kg",
       "1 SM"
      ],
      [
       "Leichter Hammer",
       "1W4 Wucht",
       "Leicht, Wurfwaffe (Reichweite 6/18)",
       "Einkerben",
       "1 kg",
       "2 GM"
      ],
      [
       "Sichel",
       "1W4 Hieb",
       "Leicht",
       "Einkerben",
       "1 kg",
       "1 GM"
      ],
      [
       "Speer",
       "1W6 Stich",
       "Vielseitig (1W8), Wurfwaffe (Reichweite 6/18)",
       "Auslaugen",
       "1,5 kg",
       "1 GM"
      ],
      [
       "Streitkolben",
       "1W6 Wucht",
       "−",
       "Auslaugen",
       "2 kg",
       "5 GM"
      ],
      [
       "Wurfspeer",
       "1W6 Stich",
       "Wurfwaffe (Reichweite 9/36)",
       "Verlangsamen",
       "1 kg",
       "5 SM"
      ],
      [
       "Zweihandknüppel",
       "1W8 Wucht",
       "Zweihändig",
       "Stoßen",
       "5 kg",
       "2 SM"
      ],
      [
       "Einfache Fernkampfwaffen",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Kurzbogen",
       "1W6 Stich",
       "Geschosse (Reichweite 24/96, Pfeil), Zweihändig",
       "Plagen",
       "1 kg",
       "25 GM"
      ],
      [
       "Leichte Armbrust",
       "1W8 Stich",
       "Geschosse (Reichweite 24/96, Bolzen), Laden, Zweihändig",
       "Verlangsamen",
       "2,5 kg",
       "25 GM"
      ],
      [
       "Schleuder",
       "1W4 Wucht",
       "Geschosse (Reichweite 9/36, Kugel)",
       "Verlangsamen",
       "−",
       "1 SM"
      ],
      [
       "Wurfpfeil",
       "1W4 Stich",
       "Finesse, Wurfwaffe (Reichweite 6/18)",
       "Plagen",
       "125 g",
       "5 KM"
      ],
      [
       "Nahkampf-Kriegswaffen",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Dreizack",
       "1W8 Stich",
       "Vielseitig (1W10), Wurfwaffe (Reichweite 6/18)",
       "Umstoßen",
       "2 kg",
       "5 GM"
      ],
      [
       "Flegel",
       "1W8 Wucht",
       "−",
       "Auslaugen",
       "1 kg",
       "10 GM"
      ],
      [
       "Glefe",
       "1W10 Hieb",
       "Schwer, Weitreichend, Zweihändig",
       "Streifen",
       "3 kg",
       "20 GM"
      ],
      [
       "Hellebarde",
       "1W10 Hieb",
       "Schwer, Weitreichend, Zweihändig",
       "Spalten",
       "3 kg",
       "20 GM"
      ],
      [
       "Kriegshammer",
       "1W8 Wucht",
       "Vielseitig (1W10)",
       "Stoßen",
       "2,5 kg",
       "15 GM"
      ],
      [
       "Kriegspicke",
       "1W8 Stich",
       "Vielseitig (1W10)",
       "Auslaugen",
       "1 kg",
       "5 GM"
      ],
      [
       "Krummsäbel",
       "1W6 Hieb",
       "Finesse, Leicht",
       "Einkerben",
       "1,5 kg",
       "25 GM"
      ],
      [
       "Kurzschwert",
       "1W6 Stich",
       "Finesse, Leicht",
       "Plagen",
       "1 kg",
       "10 GM"
      ],
      [
       "Langschwert",
       "1W8 Hieb",
       "Vielseitig (1W10)",
       "Auslaugen",
       "1,5 kg",
       "15 GM"
      ],
      [
       "Lanze",
       "1W10 Stich",
       "Schwer, Weitreichend, Zweihändig (sofern nicht beritten)",
       "Umstoßen",
       "3 kg",
       "10 GM"
      ],
      [
       "Morgenstern",
       "1W8 Stich",
       "−",
       "Auslaugen",
       "2 kg",
       "15 GM"
      ],
      [
       "Peitsche",
       "1W4 Hieb",
       "Finesse, Weitreichend",
       "Verlangsamen",
       "1,5 kg",
       "2 GM"
      ],
      [
       "Pike",
       "1W10 Stich",
       "Schwer, Weitreichend, Zweihändig",
       "Stoßen",
       "9 kg",
       "5 GM"
      ],
      [
       "Rapier",
       "1W8 Stich",
       "Finesse",
       "Plagen",
       "1 kg",
       "25 GM"
      ],
      [
       "Streitaxt",
       "1W8 Hieb",
       "Vielseitig (1W10)",
       "Umstoßen",
       "2 kg",
       "10 GM"
      ],
      [
       "Zweihandaxt",
       "1W12 Hieb",
       "Schwer, Zweihändig",
       "Spalten",
       "3,5 kg",
       "30 GM"
      ],
      [
       "Zweihandhammer",
       "2W6 Wucht",
       "Schwer, Zweihändig",
       "Umstoßen",
       "5 kg",
       "10 GM"
      ],
      [
       "Zweihandschwert",
       "2W6 Hieb",
       "Schwer, Zweihändig",
       "Streifen",
       "3 kg",
       "50 GM"
      ],
      [
       "Fernkampf-Kriegswaffen",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Blasrohr",
       "1 Stich",
       "Geschosse (Reichweite 7,5/30, Blasrohrpfeil), Laden",
       "Plagen",
       "0,5 kg",
       "10 GM"
      ],
      [
       "Handarmbrust",
       "1W6 Stich",
       "Geschosse (Reichweite 9/36, Bolzen), Leicht, Laden",
       "Plagen",
       "1,5 kg",
       "75 GM"
      ],
      [
       "Langbogen",
       "1W8 Stich",
       "Geschosse (Reichweite 45/180, Pfeil), Schwer, Zweihändig",
       "Verlangsamen",
       "1 kg",
       "50 GM"
      ],
      [
       "Muskete",
       "1W12 Stich",
       "Geschosse (Reichweite 12/36, Kugel), Laden, Zweihändig",
       "Verlangsamen",
       "5 kg",
       "500 GM"
      ],
      [
       "Pistole",
       "1W10 Stich",
       "Geschosse (Reichweite 9/27, Kugel), Laden",
       "Plagen",
       "1,5 kg",
       "250 GM"
      ],
      [
       "Schwere Armbrust",
       "1W10 Stich",
       "Geschosse (Reichweite 30/120, Bolzen), Laden, Schwer, Zweihändig",
       "Stoßen",
       "9 kg",
       "50 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The Weapons table in this section shows the game’s main weapons. The table lists the cost and weight of each weapon, as well as the following details:"
    },
    {
     "typ": "stichpunkt",
     "text": "Category. Every weapon falls into a category: Simple or Martial. Weapon proficiencies are usually tied to one of these categories. For example, you might have proficiency with Simple weapons."
    },
    {
     "typ": "stichpunkt",
     "text": "Melee or Ranged. A weapon is classified as either Melee or Ranged. A Melee weapon is used to attack a target within 5 feet, whereas a Ranged weapon is used to attack at a greater distance."
    },
    {
     "typ": "stichpunkt",
     "text": "Damage. The table lists the amount of damage a weapon deals when an attacker hits with it as well as the type of that damage."
    },
    {
     "typ": "stichpunkt",
     "text": "Properties. Any properties a weapon has are listed in the Properties column. Each property is defined in the “Properties” section."
    },
    {
     "typ": "stichpunkt",
     "text": "Mastery. Each weapon has a mastery property, which is defined in the “Mastery Properties” section. To use that property, you must have a feature that lets you use it."
    },
    {
     "typ": "tabelle",
     "titel": "Weapons",
     "kopf": [
      "Name",
      "Damage",
      "Properties",
      "Mastery",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Simple Melee Weapons",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Club",
       "1d4 Bludgeoning",
       "Light",
       "Slow",
       "2 lb.",
       "1 SP"
      ],
      [
       "Dagger",
       "1d4 Piercing",
       "Finesse, Light, Thrown (Range 20/60)",
       "Nick",
       "1 lb.",
       "2 GP"
      ],
      [
       "Greatclub",
       "1d8 Bludgeoning",
       "Two-Handed",
       "Push",
       "10 lb.",
       "2 SP"
      ],
      [
       "Handaxe",
       "1d6 Slashing",
       "Light, Thrown (Range 20/60)",
       "Vex",
       "2 lb.",
       "5 GP"
      ],
      [
       "Javelin",
       "1d6 Piercing",
       "Thrown (Range 30/120)",
       "Slow",
       "2 lb.",
       "5 SP"
      ],
      [
       "Light Hammer",
       "1d4 Bludgeoning",
       "Light, Thrown (Range 20/60)",
       "Nick",
       "2 lb.",
       "2 GP"
      ],
      [
       "Mace",
       "1d6 Bludgeoning",
       "—",
       "Sap",
       "4 lb.",
       "5 GP"
      ],
      [
       "Quarterstaff",
       "1d6 Bludgeoning",
       "Versatile (1d8)",
       "Topple",
       "4 lb.",
       "2 SP"
      ],
      [
       "Sickle",
       "1d4 Slashing",
       "Light",
       "Nick",
       "2 lb.",
       "1 GP"
      ],
      [
       "Spear",
       "1d6 Piercing",
       "Thrown (Range 20/60), Versatile (1d8)",
       "Sap",
       "3 lb.",
       "1 GP"
      ],
      [
       "Simple Ranged Weapons",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Dart",
       "1d4 Piercing",
       "Finesse, Thrown (Range 20/60)",
       "Vex",
       "1/4 lb.",
       "5 CP"
      ],
      [
       "Light Crossbow",
       "1d8 Piercing",
       "Ammunition (Range 80/320; Bolt), Loading, Two-Handed",
       "Slow",
       "5 lb.",
       "25 GP"
      ],
      [
       "Shortbow",
       "1d6 Piercing",
       "Ammunition (Range 80/320; Arrow), Two-Handed",
       "Vex",
       "2 lb.",
       "25 GP"
      ],
      [
       "Sling",
       "1d4 Bludgeoning",
       "Ammunition (Range 30/120; Bullet)",
       "Slow",
       "—",
       "1 SP"
      ],
      [
       "Martial Melee Weapons",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Battleaxe",
       "1d8 Slashing",
       "Versatile (1d10)",
       "Topple",
       "4 lb.",
       "10 GP"
      ],
      [
       "Flail",
       "1d8 Bludgeoning",
       "—",
       "Sap",
       "2 lb.",
       "10 GP"
      ],
      [
       "Glaive",
       "1d10 Slashing",
       "Heavy, Reach, Two-Handed",
       "Graze",
       "6 lb.",
       "20 GP"
      ],
      [
       "Greataxe",
       "1d12 Slashing",
       "Heavy, Two-Handed",
       "Cleave",
       "7 lb.",
       "30 GP"
      ],
      [
       "Greatsword",
       "2d6 Slashing",
       "Heavy, Two-Handed",
       "Graze",
       "6 lb.",
       "50 GP"
      ],
      [
       "Halberd",
       "1d10 Slashing",
       "Heavy, Reach, Two-Handed",
       "Cleave",
       "6 lb.",
       "20 GP"
      ],
      [
       "Lance",
       "1d10 Piercing",
       "Heavy, Reach, Two-Handed (unless mounted)",
       "Topple",
       "6 lb.",
       "10 GP"
      ],
      [
       "Longsword",
       "1d8 Slashing",
       "Versatile (1d10)",
       "Sap",
       "3 lb.",
       "15 GP"
      ],
      [
       "Maul",
       "2d6 Bludgeoning",
       "Heavy, Two-Handed",
       "Topple",
       "10 lb.",
       "10 GP"
      ],
      [
       "Morningstar",
       "1d8 Piercing",
       "—",
       "Sap",
       "4 lb.",
       "15 GP"
      ],
      [
       "Pike",
       "1d10 Piercing",
       "Heavy, Reach, Two-Handed",
       "Push",
       "18 lb.",
       "5 GP"
      ],
      [
       "Rapier",
       "1d8 Piercing",
       "Finesse",
       "Vex",
       "2 lb.",
       "25 GP"
      ],
      [
       "Scimitar",
       "1d6 Slashing",
       "Finesse, Light",
       "Nick",
       "3 lb.",
       "25 GP"
      ],
      [
       "Shortsword",
       "1d6 Piercing",
       "Finesse, Light",
       "Vex",
       "2 lb.",
       "10 GP"
      ],
      [
       "Trident",
       "1d8 Piercing",
       "Thrown (Range 20/60), Versatile (1d10)",
       "Topple",
       "4 lb.",
       "5 GP"
      ],
      [
       "Warhammer",
       "1d8 Bludgeoning",
       "Versatile (1d10)",
       "Push",
       "5 lb.",
       "15 GP"
      ],
      [
       "War Pick",
       "1d8 Piercing",
       "Versatile (1d10)",
       "Sap",
       "2 lb.",
       "5 GP"
      ],
      [
       "Whip",
       "1d4 Slashing",
       "Finesse, Reach",
       "Slow",
       "3 lb.",
       "2 GP"
      ],
      [
       "Martial Ranged Weapons",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Blowgun",
       "1 Piercing",
       "Ammunition (Range 25/100; Needle), Loading",
       "Vex",
       "1 lb.",
       "10 GP"
      ],
      [
       "Hand Crossbow",
       "1d6 Piercing",
       "Ammunition (Range 30/120; Bolt), Light, Loading",
       "Vex",
       "3 lb.",
       "75 GP"
      ],
      [
       "Heavy Crossbow",
       "1d10 Piercing",
       "Ammunition (Range 100/400; Bolt), Heavy, Loading, Two-Handed",
       "Push",
       "18 lb.",
       "50 GP"
      ],
      [
       "Longbow",
       "1d8 Piercing",
       "Ammunition (Range 150/600; Arrow), Heavy, Two-Handed",
       "Slow",
       "2 lb.",
       "50 GP"
      ],
      [
       "Musket",
       "1d12 Piercing",
       "Ammunition (Range 40/120; Bullet), Loading, Two-Handed",
       "Slow",
       "10 lb.",
       "500 GP"
      ],
      [
       "Pistol",
       "1d10 Piercing",
       "Ammunition (Range 30/90; Bullet), Loading",
       "Vex",
       "3 lb.",
       "250 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "selling-equipment",
  "name": {
   "de": "Ausrüstung verkaufen",
   "en": "Selling Equipment"
  },
  "abschnitt": {
   "de": "Waffen",
   "en": "Weapons"
  },
  "kasten": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ausrüstung kann für die Hälfte ihrer Kosten verkauft werden. Handelsgüter und Wertgegenstände wie Edelsteine und Kunstgegenstände können auf Marktplätzen hingegen für ihren vollen Wert verkauft werden. Unter „Magische Gegenstände“ findest du Preise für magische Gegenstände."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Equipment fetches half its cost when sold. In contrast, trade goods and valuables—like gems and art objects—retain their full value in the marketplace. “Magic Items” has prices for magic items."
    }
   ]
  }
 },
 {
  "id": "weapon-proficiency",
  "name": {
   "de": "Übung im Umgang mit Waffen",
   "en": "Weapon Proficiency"
  },
  "abschnitt": {
   "de": "Waffen",
   "en": "Weapons"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jeder kann eine Waffe führen, doch du musst Übung im Umgang mit ihr haben, um Angriffswürfen mit dieser Waffe deinen Übungsbonus hinzufügen zu können. Die Merkmale eines Spielercharakters können Übung im Umgang mit Waffen umfassen. Monster haben Übung im Umgang mit allen Waffen, die in ihrem Wertekasten aufgeführt sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Anyone can wield a weapon, but you must have proficiency with it to add your Proficiency Bonus to an attack roll you make with it. A player character’s features can provide weapon proficiencies. A monster is proficient with any weapon in its stat block."
    }
   ]
  }
 },
 {
  "id": "properties",
  "name": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Im Folgenden werden die Eigenschaften in der Spalte „Eigenschaften“ der Tabelle „Waffen“ erklärt:"
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Here are definitions of the properties in the Properties column of the Weapons table."
    }
   ]
  }
 },
 {
  "id": "ammunition",
  "name": {
   "de": "Geschosse",
   "en": "Ammunition"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst Waffen mit der Eigenschaft Geschosse nur für Fernkampfangriffe verwenden, wenn du über entsprechende Geschosse verfügst. Die Art der erforderlichen Geschosse ist jeweils bei der Reichweite der Waffe angegeben. Jeder Angriff verbraucht ein Geschoss. Es ist Teil des Angriffs, die Waffe mit Geschossen zu laden (bei Einhandwaffen muss dazu eine Hand frei sein). Nach einem Kampf kannst du eine Minute damit verbringen, die Hälfte der Geschosse (abgerundet) zu bergen, die du im Kampf verbraucht hast. Der Rest geht verloren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can use a weapon that has the Ammunition property to make a ranged attack only if you have ammunition to fire from it. The type of ammunition required is specified with the weapon’s range. Each attack expends one piece of ammunition. Drawing the ammunition is part of the attack (you need a free hand to load a one-handed weapon). After a fight, you can spend 1 minute to recover half the ammunition (round down) you used in the fight; the rest is lost."
    }
   ]
  }
 },
 {
  "id": "finesse",
  "name": {
   "de": "Finesse",
   "en": "Finesse"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du mit Finesse‑Waffen angreifst, hast du bei Angriffs ‑ und Schadenswürfen die Wahl zwischen deinem Stärke‑ und deinem Geschicklichkeitsmodifikator. Du musst allerdings bei beiden Würfen denselben Modifikator verwenden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When making an attack with a Finesse weapon, use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls."
    }
   ]
  }
 },
 {
  "id": "heavy",
  "name": {
   "de": "Schwer",
   "en": "Heavy"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du bist bei Angriffswürfen mit schweren Waffen im Nachteil, wenn du bei Nahkampfwaffen einen Stärkewert von weniger als 13 und bei Fernkampfwaffen einen Geschicklichkeitswert von weniger als 13 hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have Disadvantage on attack rolls with a Heavy weapon if it’s a Melee weapon and your Strength score isn’t at least 13 or if it’s a Ranged weapon and your Dexterity score isn’t at least 13."
    }
   ]
  }
 },
 {
  "id": "light",
  "name": {
   "de": "Leicht",
   "en": "Light"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du in deinem Zug die Angriffsaktion ausführst und mit einer leichten Waffe angreifst, kannst du später im selben Zug als Bonusaktion einen zusätzlichen Angriff ausführen. Dieser zusätzliche Angriff muss mit einer anderen leichten Waffe ausgeführt werden, und du kannst dem Schaden des zusätzlichen Angriffs nicht deinen Attributsmodifikator hinzufügen, sofern dieser Modifikator nicht negativ ist. Beispiel: Du kannst mit einem Kurzschwert in der einen Hand und einem Dolch in der anderen angreifen, indem du die Angriffsaktion und eine Bonusaktion ausführst. Du fügst dem Schadenswurf der Bonusaktion jedoch nicht deinen Stärke ‑ oder Geschicklichkeitsmodifikator hinzu, sofern dieser Modifikator nicht negativ ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn. That extra attack must be made with a different Light weapon, and you don’t add your ability modifier to the extra attack’s damage unless that modifier is negative. For example, you can attack with a Shortsword in one hand and a Dagger in the other using the Attack action and a Bonus Action, but you don’t add your Strength or Dexterity modifier to the damage roll of the Bonus Action unless that modifier is negative."
    }
   ]
  }
 },
 {
  "id": "loading",
  "name": {
   "de": "Laden",
   "en": "Loading"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst mit einer Aktion, Bonusaktion oder Reaktion immer nur ein Geschoss aus einer Waffe mit der Eigenschaft Laden abfeuern, egal, wie viele Angriffe dir zur Verfügung stehen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can fire only one piece of ammunition from a Loading weapon when you use an action, a Bonus Action, or a Reaction to fire it, regardless of the number of attacks you can normally make."
    }
   ]
  }
 },
 {
  "id": "range",
  "name": {
   "de": "Fernkampfreichweite",
   "en": "Range"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Die Reichweite von Fernkampfwaffen ist nach den Eigenschaften Geschosse oder Wurfwaffe aufgeführt. Sie umfasst zwei Werte: Der erste ist die Grundreichweite der Waffe in Metern, der zweite die Maximalreichweite. Wenn du ein Ziel außerhalb der Grundreichweite angreifst, bist du beim Angriffswurf im Nachteil. Du kannst keine Ziele außerhalb der Maximalreichweite angreifen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Range weapon has a range in parentheses after the Ammunition or Thrown property. The range lists two numbers. The first is the weapon’s normal range in feet, and the second is the weapon’s long range. When attacking a target beyond normal range, you have Disadvantage on the attack roll. You can’t attack a target beyond the long range."
    }
   ]
  }
 },
 {
  "id": "reach",
  "name": {
   "de": "Nahkampfreichweite",
   "en": "Reach"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Bei Waffen mit der Eigenschaft Weitreichend ist die normale Angriffsreichweite um 1,5 Meter erhöht. Dies gilt auch bei Gelegenheitsangriffen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Reach weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for Opportunity Attacks with it."
    }
   ]
  }
 },
 {
  "id": "thrown",
  "name": {
   "de": "Wurfwaffe",
   "en": "Thrown"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Waffen mit der Eigenschaft Wurfwaffe können geworfen werden, um Fernkampfangriffe auszuführen, und sie können als Teil des Angriffs gezogen werden. Wenn es sich um eine Nahkampfwaffe handelt, die du wirfst, verwendest du bei Angriffs ‑ und Schadenswürfen den gleichen Attributsmodifikator wie bei Nahkampfangriffen mit der Waffe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If a weapon has the Thrown property, you can throw the weapon to make a ranged attack, and you can draw that weapon as part of the attack. If the weapon is a Melee weapon, use the same ability modifier for the attack and damage rolls that you use for a melee attack with that weapon."
    }
   ]
  }
 },
 {
  "id": "two-handed",
  "name": {
   "de": "Zweihändig",
   "en": "Two-Handed"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Waffen mit der Eigenschaft Zweihändig müssen mit zwei Händen geführt werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Two-Handed weapon requires two hands when you attack with it."
    }
   ]
  }
 },
 {
  "id": "versatile",
  "name": {
   "de": "Vielseitig",
   "en": "Versatile"
  },
  "abschnitt": {
   "de": "Eigenschaften",
   "en": "Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Waffen mit der Eigenschaft Vielseitig können mit einer Hand oder mit zwei Händen geführt werden. Mit der Eigenschaft wird ein Schadenswert in Klammern genannt. Diesen Schaden bewirkt die Waffe, wenn sie mit zwei Händen geführt wird, um einen Nahkampfangriff auszuführen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Versatile weapon can be used with one or two hands. A damage value in parentheses appears with the property. The weapon deals that damage when used with two hands to make a melee attack."
    }
   ]
  }
 },
 {
  "id": "mastery-properties",
  "name": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jede Waffe hat eine Meisterschaftseigenschaft. Diese ist nur für Charaktere mit einem Merkmal wie Waffenbeherrschung verfügbar, das den Zugriff auf die Meisterschaftseigenschaft erlaubt. Die Meisterschaftseigenschaften sind nachfolgend beschrieben."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each weapon has a mastery property, which is usable only by a character who has a feature, such as Weapon Mastery, that unlocks the property for the character. The properties are defined below."
    }
   ]
  }
 },
 {
  "id": "improvised-weapons",
  "name": {
   "de": "Improvisierte Waffen",
   "en": "Improvised Weapons"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "kasten": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du einen Gegenstand – ein Tischbein, eine Bratpfanne, eine Flasche – als provisorische Waffe verwendest, lies den Abschnitt „Improvisierte Waffen“ unter „Regelglossar“. Sieh dir diese Regeln auch an, wenn du eine Waffe auf ungewöhnliche Art verwendest, beispielsweise einen Nahkampfangriff mit einer Fernkampfwaffe ausführst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you use an object—such as a table leg, frying pan, or bottle—as a makeshift weapon, see “Improvised Weapons” in “Rules Glossary.” Also see those rules if you wield a weapon in an unusual way, such as using a Ranged weapon to make a melee attack."
    }
   ]
  }
 },
 {
  "id": "cleave",
  "name": {
   "de": "Spalten",
   "en": "Cleave"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Kreatur mit einem Nahkampfangriffswurf triffst, den du mit dieser Waffe ausführst, kannst du mit der Waffe einen weiteren Nahkampfangriff auf eine zweite Kreatur im Abstand von bis zu 1,5 Metern von der ersten ausführen, sofern die zweite sich ebenfalls in Reichweite befindet. Bei einem Treffer erleidet die Kreatur den Waffenschaden. Du fügst dem Schaden jedoch nicht deinen Attributsmodifikator hinzu, sofern dieser Modifikator nicht negativ ist. Du kannst diesen zusätzlichen Angriff nur einmal pro Zug ausführen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon’s damage, but don’t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn."
    }
   ]
  }
 },
 {
  "id": "graze",
  "name": {
   "de": "Streifen",
   "en": "Graze"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn dein Angriffswurf mit dieser Waffe eine Kreatur verfehlt, kannst du der Kreatur Schaden in Höhe des Attributsmodifikators zufügen, den du für den Angriffswurf verwendet hast. Die Schadensart entspricht der Waffe. Der Schaden kann nur durch Erhöhen des Attributsmodifikators erhöht werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier."
    }
   ]
  }
 },
 {
  "id": "nick",
  "name": {
   "de": "Einkerben",
   "en": "Nick"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du den zusätzlichen Angriff der Eigenschaft Leicht ausführst, kannst du dies als Teil der Angriffsaktion statt als Bonusaktion tun. Du kannst diesen zusätzlichen Angriff nur einmal pro Zug ausführen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn."
    }
   ]
  }
 },
 {
  "id": "push",
  "name": {
   "de": "Stoßen",
   "en": "Push"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Kreatur mit dieser Waffe triffst, kannst du sie bis zu drei Meter weit in gerader Linie von dir wegstoßen, sofern sie von höchstens großer Größe ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller."
    }
   ]
  }
 },
 {
  "id": "sap",
  "name": {
   "de": "Auslaugen",
   "en": "Sap"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Kreatur mit dieser Waffe triffst, ist diese Kreatur bei ihrem nächsten Angriffswurf vor Beginn deines nächsten Zugs im Nachteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn."
    }
   ]
  }
 },
 {
  "id": "slow",
  "name": {
   "de": "Verlangsamen",
   "en": "Slow"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Kreatur mit dieser Waffe triffst und ihr Schaden zufügst, kannst du ihre Bewegungsrate bis zum Beginn deines nächsten Zugs um drei Meter verringern. Wird die Kreatur mehrfach von Waffen mit dieser Eigenschaft getroffen, so wird ihre Bewegungsrate dennoch nur um drei Meter verringert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn’t exceed 10 feet."
    }
   ]
  }
 },
 {
  "id": "topple",
  "name": {
   "de": "Umstoßen",
   "en": "Topple"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Kreatur mit dieser Waffe triffst, kannst du sie zu einem Konstitutionsrettungswurf (SG 8 plus Attributsmodifikator für den Angriffswurf plus dein Übungsbonus) zwingen. Misslingt der Wurf, so wird die Kreatur umgestoßen und hat den Zustand Liegend."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the Prone condition."
    }
   ]
  }
 },
 {
  "id": "vex",
  "name": {
   "de": "Plagen",
   "en": "Vex"
  },
  "abschnitt": {
   "de": "Meisterschaftseigenschaft",
   "en": "Mastery Properties"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Kreatur mit dieser Waffe triffst und ihr Schaden zufügst, bist du beim nächsten Angriffswurf gegen diese Kreatur vor Ende deines nächsten Zugs im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn."
    }
   ]
  }
 },
 {
  "id": "armor",
  "name": {
   "de": "Rüstung",
   "en": "Armor"
  },
  "abschnitt": {
   "de": "Rüstung",
   "en": "Armor"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In der Tabelle „Rüstung“ sind die wichtigsten Rüstungen des Spiels aufgeführt. Dazu sind Kosten und Gewicht der Rüstungen sowie folgende Details enthalten:"
    },
    {
     "typ": "stichpunkt",
     "text": "Kategorie: Jede Rüstung gehört zu einer von drei Kategorien: Leicht, Mittelschwer oder Schwer. Die Kategorie bestimmt, wie lange es dauert, die Rüstung an ‑ oder abzulegen (wie in der Tabelle gezeigt)."
    },
    {
     "typ": "stichpunkt",
     "text": "Rüstungsklasse (RK): Die Spalte „Rüstungsklasse“ der Tabelle verrät dir deine Basis‑RK, wenn du einen bestimmten Rüstungstyp trägst. Trägst du beispielsweise eine Lederrüstung, so entspricht deine Basis‑RK 11 plus deinem Geschicklichkeitsmodifikator. Trägst du hingegen einen Kettenpanzer, so ist deine Basis‑RK 16."
    },
    {
     "typ": "stichpunkt",
     "text": "Stärke: Wenn in der Tabelle in der Spalte „Stärke“ ein Stärkewert für eine Rüstung angegeben ist, verringert die Rüstung die Bewegungsrate des Trägers um drei Meter, es sei denn, der Stärkewert des Trägers entspricht mindestens dem aufgeführten."
    },
    {
     "typ": "stichpunkt",
     "text": "Heimlichkeit: Wenn in der Tabelle in der Spalte „Heimlichkeit“ der Begriff „Nachteil“ aufgeführt ist, so ist der Träger bei Geschicklichkeitswürfen (Heimlichkeit) im Nachteil."
    },
    {
     "typ": "tabelle",
     "titel": "Rüstung",
     "kopf": [
      "Rüstung",
      "Rüstungsklasse (RK)",
      "Stärke",
      "Heimlichkeit",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Leichte Rüstung (1 Minute zum An- oder Ablegen)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Gepolsterte Rüstung",
       "11 + GES-Modifikator",
       "−",
       "Nachteil",
       "4 kg",
       "5 GM"
      ],
      [
       "Lederrüstung",
       "11 + GES-Modifikator",
       "−",
       "−",
       "5 kg",
       "10 GM"
      ],
      [
       "Beschlagene Lederrüstung",
       "12 + GES-Modifikator",
       "−",
       "−",
       "6,5 kg",
       "45 GM"
      ],
      [
       "Mittelschwere Rüstung (5 Minuten zum An- und 1 Minute zum Ablegen)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Fellrüstung",
       "12 + GES-Modifikator (max. 2)",
       "−",
       "−",
       "6 kg",
       "10 GM"
      ],
      [
       "Kettenhemd",
       "13 + GES-Modifikator (max. 2)",
       "−",
       "−",
       "10 kg",
       "50 GM"
      ],
      [
       "Schuppenpanzer",
       "14 + GES-Modifikator (max. 2)",
       "−",
       "Nachteil",
       "22,5 kg",
       "50 GM"
      ],
      [
       "Brustplatte",
       "14 + GES-Modifikator (max. 2)",
       "−",
       "−",
       "10 kg",
       "400 GM"
      ],
      [
       "Plattenpanzer",
       "15 + GES-Modifikator (max. 2)",
       "−",
       "Nachteil",
       "20 kg",
       "750 GM"
      ],
      [
       "Schwere Rüstung (10 Minuten zum An- und 5 Minuten zum Ablegen)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Ringpanzer",
       "14",
       "−",
       "Nachteil",
       "20 kg",
       "30 GM"
      ],
      [
       "Kettenpanzer",
       "16",
       "Stä. 13",
       "Nachteil",
       "27,5 kg",
       "75 GM"
      ],
      [
       "Schienenpanzer",
       "17",
       "Stä. 15",
       "Nachteil",
       "30 kg",
       "200 GM"
      ],
      [
       "Ritterrüstung",
       "18",
       "Stä. 15",
       "Nachteil",
       "32,5 kg",
       "1.500 GM"
      ],
      [
       "Schild (Verwenden-Aktion zum An- oder Ablegen)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Schild",
       "+2",
       "−",
       "−",
       "3 kg",
       "10 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The Armor table lists the game’s main armor. The table includes the cost and weight of armor, as well as the following details:"
    },
    {
     "typ": "stichpunkt",
     "text": "Category. Every type of armor falls into a category: Light, Medium, or Heavy. The category determines how long it takes to don or doff the armor (as shown in the table)."
    },
    {
     "typ": "stichpunkt",
     "text": "Armor Class (AC). The table’s Armor Class column tells you what your base AC is when you wear a type of armor. For example, if you wear Leather Armor, your base AC is 11 plus your Dexterity modifier, whereas your AC is 16 in Chain Mail."
    },
    {
     "typ": "stichpunkt",
     "text": "Strength. If the table shows a Strength score in the Strength column for an armor type, that armor reduces the wearer’s speed by 10 feet unless the wearer has a Strength score equal to or higher than the listed score."
    },
    {
     "typ": "stichpunkt",
     "text": "Stealth. If the table shows “Disadvantage” in the Stealth column for an armor type, the wearer has Disadvantage on Dexterity (Stealth) checks."
    },
    {
     "typ": "tabelle",
     "titel": "Armor",
     "kopf": [
      "Armor",
      "Armor Class (AC)",
      "Strength",
      "Stealth",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Light Armor (1 Minute to Don or Doff)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Padded Armor",
       "11 + Dex modifier",
       "—",
       "Disadvantage",
       "8 lb.",
       "5 GP"
      ],
      [
       "Leather Armor",
       "11 + Dex modifier",
       "—",
       "—",
       "10 lb.",
       "10 GP"
      ],
      [
       "Studded Leather Armor",
       "12 + Dex modifier",
       "—",
       "—",
       "13 lb.",
       "45 GP"
      ],
      [
       "Medium Armor (5 Minutes to Don and 1 Minute to Doff)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Hide Armor",
       "12 + Dex modifier (max 2)",
       "—",
       "—",
       "12 lb.",
       "10 GP"
      ],
      [
       "Chain Shirt",
       "13 + Dex modifier (max 2)",
       "—",
       "—",
       "20 lb.",
       "50 GP"
      ],
      [
       "Scale Mail",
       "14 + Dex modifier (max 2)",
       "—",
       "Disadvantage",
       "45 lb.",
       "50 GP"
      ],
      [
       "Breastplate",
       "14 + Dex modifier (max 2)",
       "—",
       "—",
       "20 lb.",
       "400 GP"
      ],
      [
       "Half Plate Armor",
       "15 + Dex modifier (max 2)",
       "—",
       "Disadvantage",
       "40 lb.",
       "750 GP"
      ],
      [
       "Heavy Armor (10 Minutes to Don and 5 Minutes to Doff)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Ring Mail",
       "14",
       "—",
       "Disadvantage",
       "40 lb.",
       "30 GP"
      ],
      [
       "Chain Mail",
       "16",
       "Str 13",
       "Disadvantage",
       "55 lb.",
       "75 GP"
      ],
      [
       "Splint Armor",
       "17",
       "Str 15",
       "Disadvantage",
       "60 lb.",
       "200 GP"
      ],
      [
       "Plate Armor",
       "18",
       "Str 15",
       "Disadvantage",
       "65 lb.",
       "1,500 GP"
      ],
      [
       "Shield (Utilize Action to Don or Doff)",
       "",
       "",
       "",
       "",
       ""
      ],
      [
       "Shield",
       "+2",
       "—",
       "—",
       "6 lb.",
       "10 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "armor-training",
  "name": {
   "de": "Rüstungsvertrautheit",
   "en": "Armor Training"
  },
  "abschnitt": {
   "de": "Rüstung",
   "en": "Armor"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jeder kann eine Rüstung tragen oder einen Schild halten. Es bedarf jedoch Vertrautheit, um diese Ausrüstungsgegenstände effektiv zu verwenden. Dies ist unten erläutert. Die Klasse und andere Merkmale eines Charakters bestimmen seine Rüstungsvertrautheit. Monster sind mit allen Rüstungen vertraut, die in ihrem Wertekasten aufgeführt sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Anyone can don armor or hold a Shield, but only those with training can use them effectively, as explained below. A character’s class and other features determine the character’s armor training. A monster has training with any armor in its stat block."
    }
   ]
  }
 },
 {
  "id": "light-medium-or-heavy-armor",
  "name": {
   "de": "Leichte, mittelschwere und schwere Rüstung",
   "en": "Light, Medium, or Heavy Armor"
  },
  "abschnitt": {
   "de": "Rüstung",
   "en": "Armor"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du leichte, mittelschwere oder schwere Rüstung trägst, mit der du nicht vertraut bist, so bist du bei jeder W20‑Prüfung im Nachteil, die Stärke oder Geschicklichkeit einbezieht, und du kannst keine Zauber wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you wear Light, Medium, or Heavy armor and lack training with it, you have Disadvantage on any D20 Test that involves Strength or Dexterity, and you can’t cast spells."
    }
   ]
  }
 },
 {
  "id": "shield",
  "name": {
   "de": "Schild",
   "en": "Shield"
  },
  "abschnitt": {
   "de": "Rüstung",
   "en": "Armor"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst den Vorzug Rüstungsklasse eines Schildes nur dann, wenn du mit dem Schild vertraut bist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain the Armor Class benefit of a Shield only if you have training with it."
    }
   ]
  }
 },
 {
  "id": "one-at-a-time",
  "name": {
   "de": "Jeweils nur eine Rüstung",
   "en": "One at a Time"
  },
  "abschnitt": {
   "de": "Rüstung",
   "en": "Armor"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur kann jeweils nur eine Rüstung und nur einen Schild tragen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature can wear only one suit of armor at a time and wield only one Shield at a time."
    }
   ]
  }
 },
 {
  "id": "tools",
  "name": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Werkzeug hilft dir, besondere Attributswürfe auszuführen, bestimmte Gegenstände herzustellen oder beides. In der Beschreibung des Werkzeugs sind Kosten, Gewicht sowie folgende Einträge enthalten:"
    },
    {
     "typ": "stichpunkt",
     "text": "Attribut: Dieser Eintrag führt die Attribute auf, die verwendet werden, wenn mit diesem Werkzeug ein Attributswurf ausgeführt wird."
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Dieser Eintrag führt auf, was du mit dem Werkzeug tun kannst, wenn du die Verwenden‑Aktion ausführst. Mit jeder Verwenden‑Aktion kannst du eines dieser Dinge tun. Außerdem ist hier der SG für die Aktion angegeben."
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Dieser Eintrag führt gegebenenfalls auf, was du mit dem Werkzeug herstellen kannst. Die Regeln zum Herstellen findest du unter „Nichtmagische Gegenstände herstellen“, „Heiltränke brauen“ und „Zauberschriftrollen verfassen“ weiter hinten unter „Ausrüstung“."
    },
    {
     "typ": "stichpunkt",
     "text": "Varianten: Dieser Eintrag erscheint, wenn das Werkzeug Varianten hat. In diesem Fall sind die Varianten aufgeführt. Jede Variante erfordert separate Übung."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A tool helps you make specialized ability checks, craft certain items, or both. A tool’s description includes the tool’s cost and weight, as well as the following entries:"
    },
    {
     "typ": "stichpunkt",
     "text": "Ability. This entry lists the ability to use when making an ability check with the tool."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize. This entry lists things you can do with the tool when you take the Utilize action. You can do one of those things each time you take the action. This entry also provides the DC for the action."
    },
    {
     "typ": "stichpunkt",
     "text": "Craft. This entry lists what, if anything, you can craft with the tool. For crafting rules, see “Crafting Nonmagical Items,” “Brewing Potions of Healing,” and “Scribing Spell Scrolls” later in “Equipment.”"
    },
    {
     "typ": "stichpunkt",
     "text": "Variants. This entry appears if the tool has variants, which are listed. Each requires a separate proficiency."
    }
   ]
  }
 },
 {
  "id": "tool-proficiency",
  "name": {
   "de": "Übung im Umgang mit Werkzeug",
   "en": "Tool Proficiency"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du Übung im Umgang mit einem Werkzeug hast, fügst du jedem Attributswurf, der dieses Werkzeug verwendet, deinen Übungsbonus hinzu. Wenn du in einer Fertigkeit geübt bist, die bei diesem Wurf verwendet wird, ist der Wurf außerdem noch im Vorteil. Deine Merkmale könnten dir Übung im Umgang mit einem Werkzeug verleihen. Monster haben Übung im Umgang mit allen Werkzeugen, die in ihrem Wertekasten aufgeführt sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you have proficiency with a tool, add your Proficiency Bonus to any ability check you make that uses the tool. If you have proficiency in a skill that’s used with that check, you have Advantage on the check too. Your features might give you proficiency with a tool. A monster has proficiency with any tool in its stat block."
    }
   ]
  }
 },
 {
  "id": "artisan-s-tools",
  "name": {
   "de": "Handwerkszeug",
   "en": "Artisan’s Tools"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Handwerkszeug ist dazu da, bestimmte Gegenstände im Rahmen eines Handwerks herzustellen. Jedes dieser Werkzeuge erfordert separate Übung."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Artisan’s Tools are each focused on crafting items and pursuing a trade. Each of these tools requires a separate proficiency."
    }
   ]
  }
 },
 {
  "id": "alchemist-s-supplies-50-gp",
  "name": {
   "de": "Alchemistenausrüstung (50 GM)",
   "en": "Alchemist’s Supplies (50 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Intelligenz"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 4 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Eine Substanz identifizieren (SG 15) oder ein Feuer entfachen (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Alchemistenfeuer, Materialkomponentenbeutel, Öl, Papier, Parfüm, Säure"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Intelligence"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 8 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Identify a substance (DC 15), or start a fire (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Acid, Alchemist’s Fire, Component Pouch, Oil, Paper, Perfume"
    }
   ]
  }
 },
 {
  "id": "brewer-s-supplies-20-gp",
  "name": {
   "de": "Brauereizubehör (20 GM)",
   "en": "Brewer’s Supplies (20 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Intelligenz"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 4,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Ein vergiftetes Getränk erkennen (SG 15) oder Alkohol identifizieren (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Gegengift"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Intelligence"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 9 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Detect poisoned drink (DC 15), or identify alcohol (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Antitoxin"
    }
   ]
  }
 },
 {
  "id": "calligrapher-s-supplies-10-gp",
  "name": {
   "de": "Kalligrafiewerkzeug (10 GM)",
   "en": "Calligrapher’s Supplies (10 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Ästhetischen und fälschungssicheren Text notieren (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Tinte, Zauberschriftrolle"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Write text with impressive flourishes that guard against forgery (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Ink, Spell Scroll"
    }
   ]
  }
 },
 {
  "id": "carpenter-s-tools-8-gp",
  "name": {
   "de": "Schreinerwerkzeug (8 GM)",
   "en": "Carpenter’s Tools (8 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Stärke"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 3 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Eine Tür oder einen Behälter versiegeln oder aufbrechen (SG 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Kampfstab, Knüppel, Zweihandknüppel, Fackel, Fass, Leiter, Stange, tragbarer Rammbock, Truhe"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Strength"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 6 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Seal or pry open a door or container (DC 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Club, Greatclub, Quarterstaff, Barrel, Chest, Ladder, Pole, Portable Ram, Torch"
    }
   ]
  }
 },
 {
  "id": "cartographer-s-tools-15-gp",
  "name": {
   "de": "Kartografenwerkzeug (15 GM)",
   "en": "Cartographer’s Tools (15 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Weisheit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 3 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Die Karte eines kleinen Gebiets zeichnen (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Karte"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Wisdom"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 6 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Draft a map of a small area (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Map"
    }
   ]
  }
 },
 {
  "id": "cobbler-s-tools-5-gp",
  "name": {
   "de": "Schusterwerkzeug (5 GM)",
   "en": "Cobbler’s Tools (5 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Schuhe bearbeiten, sodass der nächste Geschicklichkeitswurf (Akrobatik) des Trägers im Vorteil ist (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Kletterausrüstung"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Modify footwear to give Advantage on the wearer’s next Dexterity (Acrobatics) check (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Climber’s Kit"
    }
   ]
  }
 },
 {
  "id": "cook-s-utensils-1-gp",
  "name": {
   "de": "Kochutensilien (1 GM)",
   "en": "Cook’s Utensils (1 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Weisheit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 4 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Geschmack von Nahrung verbessern (SG 10), verdorbene oder vergiftete Nahrung erkennen (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Rationen"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Wisdom"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 8 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Improve food’s flavor (DC 10), or detect spoiled or poisoned food (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Rations"
    }
   ]
  }
 },
 {
  "id": "glassblower-s-tools-30-gp",
  "name": {
   "de": "Glasbläserwerkzeug (30 GM)",
   "en": "Glassblower’s Tools (30 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Intelligenz"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Bestimmen, was ein Glasbehälter in den letzten 24 Stunden enthalten hat (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Fernrohr, Glasflasche, Lupe, Phiole"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Intelligence"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Discern what a glass object held in the past 24 hours (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Glass Bottle, Magnifying Glass, Spyglass, Vial"
    }
   ]
  }
 },
 {
  "id": "jeweler-s-tools-25-gp",
  "name": {
   "de": "Juwelierwerkzeug (25 GM)",
   "en": "Jeweler’s Tools (25 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Intelligenz"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 1 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Den Wert eines Edelsteins bestimmen (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Arkaner Fokus, Heiliges Symbol"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Intelligence"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 2 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Discern a gem’s value (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Arcane Focus, Holy Symbol"
    }
   ]
  }
 },
 {
  "id": "leatherworker-s-tools-5-gp",
  "name": {
   "de": "Ledererwerkzeug (5 GM)",
   "en": "Leatherworker’s Tools (5 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Einem Ledergegenstand Verzierungen hinzufügen (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Peitsche, Schleuder, Fellrüstung, beschlagene Lederrüstung, Lederrüstung, Armbrustbolzen-Beutel, Beutel, Karten- oder Schriftrollenbehälter, Köcher, Pergament, Rucksack, Trinkschlauch"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Add a design to a leather item (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Sling, Whip, Hide Armor, Leather Armor, Studded Leather Armor, Backpack, Crossbow Bolt Case, Map or Scroll Case, Parchment, Pouch, Quiver, Waterskin"
    }
   ]
  }
 },
 {
  "id": "mason-s-tools-10-gp",
  "name": {
   "de": "Maurerwerkzeug (10 GM)",
   "en": "Mason’s Tools (10 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Stärke"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 4 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Einen Stein mit einem Symbol oder einem Loch versehen (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Flaschenzug"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Strength"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 8 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Chisel a symbol or hole in stone (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Block and Tackle"
    }
   ]
  }
 },
 {
  "id": "painter-s-supplies-10-gp",
  "name": {
   "de": "Malutensilien (10 GM)",
   "en": "Painter’s Supplies (10 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Weisheit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Ein erkennbares Bild von etwas anfertigen, was du gesehen hast (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Druidischer Fokus, Heiliges Symbol"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Wisdom"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Paint a recognizable image of something you’ve seen (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Druidic Focus, Holy Symbol"
    }
   ]
  }
 },
 {
  "id": "potter-s-tools-10-gp",
  "name": {
   "de": "Töpferwerkzeug (10 GM)",
   "en": "Potter’s Tools (10 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Intelligenz"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 1,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Bestimmen, was ein Keramikbehälter in den letzten 24 Stunden enthalten hat (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Krug, Lampe"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Intelligence"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 3 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Discern what a ceramic object held in the past 24 hours (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Jug, Lamp"
    }
   ]
  }
 },
 {
  "id": "smith-s-tools-20-gp",
  "name": {
   "de": "Schmiedewerkzeug (20 GM)",
   "en": "Smith’s Tools (20 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Stärke"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 4 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Eine Tür oder einen Behälter aufbrechen (SG 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Jede Nahkampfwaffe (außer Kampfstab, Knüppel, Peitsche und Zweihandknüppel), mittelschwere Rüstung (außer Fellrüstung), schwere Rüstung, Brechstange, Eimer, Eisenstachel, Eisentopf, Enterhaken, Feuerwaffenmunition, Kette, Krähenfüße, Metallkügelchen, Schleudermunition"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Strength"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 8 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Pry open a door or container (DC 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Any Melee weapon (except Club, Greatclub, Quarterstaff, and Whip), Medium armor (except Hide), Heavy armor, Ball Bearings, Bucket, Caltrops, Chain, Crowbar, Firearm Bullets, Grappling Hook, Iron Pot, Iron Spikes, Sling Bullets"
    }
   ]
  }
 },
 {
  "id": "tinker-s-tools-50-gp",
  "name": {
   "de": "Tüftlerwerkzeug (50 GM)",
   "en": "Tinker’s Tools (50 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Einen winzigen Gegenstand aus Abfällen herstellen, der nach einer Minute zerfällt (SG 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Muskete, Pistole, Glocke, abdeckbare Laterne, Blendlaterne, Flasche, Handschellen, Jagdfalle, Schaufel, Schloss, Signalpfeife, Spiegel, Zunderkästchen"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 10 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Assemble a Tiny item composed of scrap, which falls apart in 1 minute (DC 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Musket, Pistol, Bell, Bullseye Lantern, Flask, Hooded Lantern, Hunting Trap, Lock, Manacles, Mirror, Shovel, Signal Whistle, Tinderbox"
    }
   ]
  }
 },
 {
  "id": "weaver-s-tools-1-gp",
  "name": {
   "de": "Weberwerkzeug (1 GM)",
   "en": "Weaver’s Tools (1 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Einen Riss in Kleidung flicken (SG 10) oder eine winzige Näharbeit anfertigen (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Gepolsterte Rüstung, feine Kleidung, Decke, Netz, Korb, Reisekleidung, Robe, Sack, Seil, Schlafsack, Schnur, Zelt"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Mend a tear in clothing (DC 10), or sew a Tiny design (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Padded Armor, Basket, Bedroll, Blanket, Fine Clothes, Net, Robe, Rope, Sack, String, Tent, Traveler’s Clothes"
    }
   ]
  }
 },
 {
  "id": "woodcarver-s-tools-1-gp",
  "name": {
   "de": "Holzschnitzwerkzeug (1 GM)",
   "en": "Woodcarver’s Tools (1 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Muster in Holz schnitzen (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Fernkampfwaffen (außer Muskete, Pistole und Schleuder), Kampfstab, Knüppel, Zweihandknüppel, Arkaner Fokus, Blasrohrpfeile, Bolzen, Druidischer Fokus, Pfeile, Tintenfüller"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Carve a pattern in wood (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Club, Greatclub, Quarterstaff, Ranged weapons (except Pistol, Musket, and Sling), Arcane Focus, Arrows, Bolts, Druidic Focus, Ink Pen, Needles"
    }
   ]
  }
 },
 {
  "id": "disguise-kit-25-gp",
  "name": {
   "de": "Verkleidungsausrüstung (25 GM)",
   "en": "Disguise Kit (25 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Charisma"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 1,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Schminke auftragen (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Kostüm"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Charisma"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 3 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Apply makeup (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Costume"
    }
   ]
  }
 },
 {
  "id": "forgery-kit-15-gp",
  "name": {
   "de": "Fälscherausrüstung (15 GM)",
   "en": "Forgery Kit (15 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 2,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Höchstens zehn Wörter in der Handschrift eines anderen verfassen (SG 15) oder ein Wachssiegel duplizieren (SG 20)"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 5 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Mimic 10 or fewer words of someone else’s handwriting (DC 15), or duplicate a wax seal (DC 20)"
    }
   ]
  }
 },
 {
  "id": "gaming-set-varies",
  "name": {
   "de": "Spielset (Preis variiert)",
   "en": "Gaming Set (Varies)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Weisheit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: −"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Bestimmen, ob jemand mogelt (SG 10), oder das Spiel gewinnen (SG 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Varianten: Drachenschach (1 GM), Drei-Drachen-Ante (1 GM), Spielkarten (5 SM), Würfel (1 SM)"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Wisdom"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: —"
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Discern whether someone is cheating (DC 10), or win the game (DC 20)"
    },
    {
     "typ": "stichpunkt",
     "text": "Variants: Dice (1 SP), dragonchess (1 GP), playing cards (5 SP), three-dragon ante (1 GP)"
    }
   ]
  }
 },
 {
  "id": "herbalism-kit-5-gp",
  "name": {
   "de": "Kräuterkundeausrüstung (5 GM)",
   "en": "Herbalism Kit (5 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Intelligenz"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 1,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Eine Pflanze identifizieren (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Gegengift, Heilerausrüstung, Heiltrank, Kerze"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Intelligence"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 3 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Identify a plant (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Antitoxin, Candle, Healer’s Kit, Potion of Healing"
    }
   ]
  }
 },
 {
  "id": "musical-instrument-varies",
  "name": {
   "de": "Musikinstrument (Preis variiert)",
   "en": "Musical Instrument (Varies)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Charisma"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: Variiert"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Eine bekannte Melodie spielen (SG 10) oder eine Melodie improvisieren (SG 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Varianten: Dudelsack (30 GM, 3 kg), Flöte (2 GM, 0,5 kg), Gambe (30 GM, 0,5 kg), Hackbrett (25 GM, 5 kg), Horn (3 GM, 1 kg), Laute (35 GM, 1 kg), Leier (30 GM, 1 kg), Panflöte (12 GM, 1 kg), Schalmei (2 GM, 0,5 kg), Trommel (6 GM, 1,5 kg)"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Charisma"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: Varies"
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Play a known tune (DC 10), or improvise a song (DC 15)"
    },
    {
     "typ": "stichpunkt",
     "text": "Variants: Bagpipes (30 GP, 6 lb.), drum (6 GP, 3 lb.), dulcimer (25 GP, 10 lb.), flute (2 GP, 1 lb.), horn (3 GP, 2 lb.), lute (35 GP, 2 lb.), lyre (30 GP, 2 lb.), pan flute (12 GP, 2 lb.), shawm (2 GP, 1 lb.), viol (30 GP, 1 lb.)"
    }
   ]
  }
 },
 {
  "id": "navigator-s-tools-25-gp",
  "name": {
   "de": "Navigationswerkzeug (25 GM)",
   "en": "Navigator’s Tools (25 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Weisheit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 1 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Einen Kurs festlegen (SG 10) oder die Position durch Sternbeobachtung bestimmen (SG 15)"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Wisdom"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 2 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Plot a course (DC 10), or determine position by stargazing (DC 15)"
    }
   ]
  }
 },
 {
  "id": "poisoner-s-kit-50-gp",
  "name": {
   "de": "Giftmischerausrüstung (50 GM)",
   "en": "Poisoner’s Kit (50 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Intelligenz"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 1 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Einen vergifteten Gegenstand erkennen (SG 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Herstellen: Einfaches Gift"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Intelligence"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 2 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Detect a poisoned object (DC 10)"
    },
    {
     "typ": "stichpunkt",
     "text": "Craft: Basic Poison"
    }
   ]
  }
 },
 {
  "id": "thieves-tools-25-gp",
  "name": {
   "de": "Diebeswerkzeug (25 GM)",
   "en": "Thieves’ Tools (25 GP)"
  },
  "abschnitt": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "bloecke": {
   "de": [
    {
     "typ": "stichpunkt",
     "text": "Attribut: Geschicklichkeit"
    },
    {
     "typ": "stichpunkt",
     "text": "Gewicht: 0,5 kg"
    },
    {
     "typ": "stichpunkt",
     "text": "Verwenden: Ein Schloss knacken (SG 15) oder eine Falle entschärfen (SG 15)"
    }
   ],
   "en": [
    {
     "typ": "stichpunkt",
     "text": "Ability: Dexterity"
    },
    {
     "typ": "stichpunkt",
     "text": "Weight: 1 lb."
    },
    {
     "typ": "stichpunkt",
     "text": "Utilize: Pick a lock (DC 15), or disarm a trap (DC 15)"
    }
   ]
  }
 },
 {
  "id": "adventuring-gear",
  "name": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Die Tabelle „Abenteurerausrüstung“ in diesem Abschnitt enthält Ausrüstung, die Abenteurern nützlich sein kann. Die Gegenstände werden im Folgenden in alphabetischer Reihenfolge beschrieben. Der Preis eines Gegenstands ist hinter seinem Namen aufgeführt."
    },
    {
     "typ": "tabelle",
     "titel": "Abenteurerausrüstung",
     "kopf": [
      "Gegenstand",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Abdeckbare Laterne",
       "1 kg",
       "5 GM"
      ],
      [
       "Alchemistenfeuer",
       "0,5 kg",
       "50 GM"
      ],
      [
       "Arkaner Fokus",
       "Variiert",
       "Variiert"
      ],
      [
       "Behälter (Armbrustbolzen)",
       "0,5 kg",
       "1 GM"
      ],
      [
       "Behälter (Karte oder Schriftrolle)",
       "0,5 kg",
       "1 GM"
      ],
      [
       "Beutel",
       "0,5 kg",
       "5 SM"
      ],
      [
       "Blendlaterne",
       "1 kg",
       "10 GM"
      ],
      [
       "Brechstange",
       "2,5 kg",
       "2 GM"
      ],
      [
       "Buch",
       "2,5 kg",
       "25 GM"
      ],
      [
       "Decke",
       "1,5 kg",
       "5 SM"
      ],
      [
       "Diplomatenausrüstung",
       "19,5 kg",
       "39 GM"
      ],
      [
       "Druidischer Fokus",
       "Variiert",
       "Variiert"
      ],
      [
       "Eimer",
       "1 kg",
       "5 KM"
      ],
      [
       "Einbrecherausrüstung",
       "21 kg",
       "16 GM"
      ],
      [
       "Entdeckerausrüstung",
       "27,5 kg",
       "10 GM"
      ],
      [
       "Enterhaken",
       "2 kg",
       "2 GM"
      ],
      [
       "Fackel",
       "0,5 kg",
       "1 KM"
      ],
      [
       "Fass",
       "35 kg",
       "2 GM"
      ],
      [
       "Fernrohr",
       "0,5 kg 1.000",
       "GM"
      ],
      [
       "Flasche (Glas)",
       "1 kg",
       "2 GM"
      ],
      [
       "Flaschenzug",
       "2,5 kg",
       "1 GM"
      ],
      [
       "Flasche",
       "0,5 kg",
       "2 KM"
      ],
      [
       "Gegengift",
       "−",
       "50 GM"
      ],
      [
       "Gelehrtenausrüstung",
       "11 kg",
       "40 GM"
      ],
      [
       "Geschosse",
       "Variiert",
       "Variiert"
      ],
      [
       "Gewölbeforscherausrüstung",
       "27,5 kg",
       "12 GM"
      ],
      [
       "Gift (einfach)",
       "−",
       "100 GM"
      ],
      [
       "Glocke",
       "−",
       "1 GM"
      ],
      [
       "Handschellen",
       "3 kg",
       "2 GM"
      ],
      [
       "Heilerausrüstung",
       "1,5 kg",
       "5 GM"
      ],
      [
       "Heiliges Symbol",
       "Variiert",
       "Variiert"
      ],
      [
       "Heiltrank",
       "0,25 kg",
       "50 GM"
      ],
      [
       "Jagdfalle",
       "12,5 kg",
       "5 GM"
      ],
      [
       "Karte",
       "−",
       "1 GM"
      ],
      [
       "Kerze",
       "−",
       "1 KM"
      ],
      [
       "Kette",
       "5 kg",
       "5 GM"
      ],
      [
       "Kleidung, fein",
       "3 kg",
       "15 GM"
      ],
      [
       "Kleidung, Reise",
       "2 kg",
       "2 GM"
      ],
      [
       "Kletterausrüstung",
       "6 kg",
       "25 GM"
      ],
      [
       "Köcher",
       "0,5 kg",
       "1 GM"
      ],
      [
       "Korb",
       "1 kg",
       "4 SM"
      ],
      [
       "Kostüm",
       "2 kg",
       "5 GM"
      ],
      [
       "Krähenfüße",
       "1 kg",
       "1 GM"
      ],
      [
       "Krug",
       "2 kg",
       "2 KM"
      ],
      [
       "Lampe",
       "0,5 kg",
       "5 SM"
      ],
      [
       "Leiter",
       "12,5 kg",
       "1 SM"
      ],
      [
       "Lupe",
       "−",
       "100 GM"
      ],
      [
       "Materialkomponentenbeutel",
       "1 kg",
       "25 GM"
      ],
      [
       "Metallkügelchen",
       "1 kg",
       "1 GM"
      ],
      [
       "Netz",
       "1,5 kg",
       "1 GM"
      ],
      [
       "Öl",
       "0,5 kg",
       "1 SM"
      ],
      [
       "Papier",
       "−",
       "2 SM"
      ],
      [
       "Parfüm",
       "−",
       "5 GM"
      ],
      [
       "Pergament",
       "−",
       "1 SM"
      ],
      [
       "Phiole",
       "−",
       "1 GM"
      ],
      [
       "Priesterausrüstung",
       "14,5 kg",
       "33 GM"
      ],
      [
       "Rammbock (tragbar)",
       "17,5 kg",
       "4 GM"
      ],
      [
       "Rationen",
       "1 kg",
       "5 SM"
      ],
      [
       "Robe",
       "2 kg",
       "1 GM"
      ],
      [
       "Rucksack",
       "2,5 kg",
       "2 GM"
      ],
      [
       "Sack",
       "0,25 kg",
       "1 KM"
      ],
      [
       "Säure",
       "0,5 kg",
       "25 GM"
      ],
      [
       "Schaufel",
       "2,5 kg",
       "2 GM"
      ],
      [
       "Schlafsack",
       "3,5 kg",
       "1 GM"
      ],
      [
       "Schloss",
       "0,5 kg",
       "10 GM"
      ],
      [
       "Schnur",
       "−",
       "1 SM"
      ],
      [
       "Seil",
       "2,5 kg",
       "1 GM"
      ],
      [
       "Signalpfeife",
       "−",
       "5 KM"
      ],
      [
       "Spiegel",
       "0,25 kg",
       "5 GM"
      ],
      [
       "Stachel, Eisen",
       "2,5 kg",
       "1 GM"
      ],
      [
       "Stange",
       "3,5 kg",
       "5 KM"
      ],
      [
       "Tintenfüller",
       "−",
       "2 KM"
      ],
      [
       "Tinte",
       "−",
       "10 GM"
      ],
      [
       "Topf, Eisen",
       "5 kg",
       "2 GM"
      ],
      [
       "Trinkschlauch",
       "2,5 kg (voll)",
       "2 SM"
      ],
      [
       "Truhe",
       "12,5 kg",
       "5 GM"
      ],
      [
       "UnterhaltungskünstlerAusrüstung",
       "29,25 kg",
       "40 GM"
      ],
      [
       "Weihwasser",
       "0,5 kg",
       "25 GM"
      ],
      [
       "Zauberschriftrolle (1. Grad)",
       "−",
       "50 GM"
      ],
      [
       "Zauberschriftrolle (Zaubertrick)",
       "−",
       "30 GM"
      ],
      [
       "Zelt",
       "10 kg",
       "2 GM"
      ],
      [
       "Zunderkästchen",
       "0,5 kg",
       "5 SM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The Adventuring Gear table in this section includes gear that adventurers often find useful. These items are described here in alphabetical order, with an item’s price appearing after its name."
    },
    {
     "typ": "tabelle",
     "titel": "Adventuring Gear",
     "kopf": [
      "Item",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Acid",
       "1 lb.",
       "25 GP"
      ],
      [
       "Alchemist’s Fire",
       "1 lb.",
       "50 GP"
      ],
      [
       "Ammunition",
       "Varies",
       "Varies"
      ],
      [
       "Antitoxin",
       "—",
       "50 GP"
      ],
      [
       "Arcane Focus",
       "Varies",
       "Varies"
      ],
      [
       "Backpack",
       "5 lb.",
       "2 GP"
      ],
      [
       "Ball Bearings",
       "2 lb.",
       "1 GP"
      ],
      [
       "Barrel",
       "70 lb.",
       "2 GP"
      ],
      [
       "Basket",
       "2 lb.",
       "4 SP"
      ],
      [
       "Bedroll",
       "7 lb.",
       "1 GP"
      ],
      [
       "Bell",
       "—",
       "1 GP"
      ],
      [
       "Blanket",
       "3 lb.",
       "5 SP"
      ],
      [
       "Block and Tackle",
       "5 lb.",
       "1 GP"
      ],
      [
       "Book",
       "5 lb.",
       "25 GP"
      ],
      [
       "Bottle, Glass",
       "2 lb.",
       "2 GP"
      ],
      [
       "Bucket",
       "2 lb.",
       "5 CP"
      ],
      [
       "Burglar’s Pack",
       "42 lb.",
       "16 GP"
      ],
      [
       "Caltrops",
       "2 lb.",
       "1 GP"
      ],
      [
       "Candle",
       "—",
       "1 CP"
      ],
      [
       "Case, Crossbow Bolt",
       "1 lb.",
       "1 GP"
      ],
      [
       "Case, Map or Scroll",
       "1 lb.",
       "1 GP"
      ],
      [
       "Chain",
       "10 lb.",
       "5 GP"
      ],
      [
       "Chest",
       "25 lb.",
       "5 GP"
      ],
      [
       "Climber’s Kit",
       "12 lb.",
       "25 GP"
      ],
      [
       "Clothes, Fine",
       "6 lb.",
       "15 GP"
      ],
      [
       "Clothes, Traveler’s",
       "4 lb.",
       "2 GP"
      ],
      [
       "Component Pouch",
       "2 lb.",
       "25 GP"
      ],
      [
       "Costume",
       "4 lb.",
       "5 GP"
      ],
      [
       "Crowbar",
       "5 lb.",
       "2 GP"
      ],
      [
       "Diplomat’s Pack",
       "39 lb.",
       "39 GP"
      ],
      [
       "Druidic Focus",
       "Varies",
       "Varies"
      ],
      [
       "Dungeoneer’s Pack",
       "55 lb.",
       "12 GP"
      ],
      [
       "Entertainer’s Pack",
       "58½ lb.",
       "40 GP"
      ],
      [
       "Explorer’s Pack",
       "55 lb.",
       "10 GP"
      ],
      [
       "Flask",
       "1 lb.",
       "2 CP"
      ],
      [
       "Grappling Hook",
       "4 lb.",
       "2 GP"
      ],
      [
       "Healer’s Kit",
       "3 lb.",
       "5 GP"
      ],
      [
       "Holy Symbol",
       "Varies",
       "Varies"
      ],
      [
       "Holy Water",
       "1 lb.",
       "25 GP"
      ],
      [
       "Hunting Trap",
       "25 lb.",
       "5 GP"
      ],
      [
       "Ink",
       "—",
       "10 GP"
      ],
      [
       "Ink Pen",
       "—",
       "2 CP"
      ],
      [
       "Jug",
       "4 lb.",
       "2 CP"
      ],
      [
       "Ladder",
       "25 lb.",
       "1 SP"
      ],
      [
       "Lamp",
       "1 lb.",
       "5 SP"
      ],
      [
       "Lantern, Bullseye",
       "2 lb.",
       "10 GP"
      ],
      [
       "Lantern, Hooded",
       "2 lb.",
       "5 GP"
      ],
      [
       "Lock",
       "1 lb.",
       "10 GP"
      ],
      [
       "Magnifying Glass",
       "—",
       "100 GP"
      ],
      [
       "Manacles",
       "6 lb.",
       "2 GP"
      ],
      [
       "Map",
       "—",
       "1 GP"
      ],
      [
       "Mirror",
       "1/2 lb.",
       "5 GP"
      ],
      [
       "Net",
       "3 lb.",
       "1 GP"
      ],
      [
       "Oil",
       "1 lb.",
       "1 SP"
      ],
      [
       "Paper",
       "—",
       "2 SP"
      ],
      [
       "Parchment",
       "—",
       "1 SP"
      ],
      [
       "Perfume",
       "—",
       "5 GP"
      ],
      [
       "Poison, Basic",
       "—",
       "100 GP"
      ],
      [
       "Pole",
       "7 lb.",
       "5 CP"
      ],
      [
       "Pot, Iron",
       "10 lb.",
       "2 GP"
      ],
      [
       "Potion of Healing",
       "1/2 lb.",
       "50 GP"
      ],
      [
       "Pouch",
       "1 lb.",
       "5 SP"
      ],
      [
       "Priest’s Pack",
       "29 lb.",
       "33 GP"
      ],
      [
       "Quiver",
       "1 lb.",
       "1 GP"
      ],
      [
       "Ram, Portable",
       "35 lb.",
       "4 GP"
      ],
      [
       "Rations",
       "2 lb.",
       "5 SP"
      ],
      [
       "Robe",
       "4 lb.",
       "1 GP"
      ],
      [
       "Rope",
       "5 lb.",
       "1 GP"
      ],
      [
       "Sack",
       "1/2 lb.",
       "1 CP"
      ],
      [
       "Scholar’s Pack",
       "22 lb.",
       "40 GP"
      ],
      [
       "Shovel",
       "5 lb.",
       "2 GP"
      ],
      [
       "Signal Whistle",
       "—",
       "5 CP"
      ],
      [
       "Spell Scroll (Cantrip)",
       "—",
       "30 GP"
      ],
      [
       "Spell Scroll (Level 1)",
       "—",
       "50 GP"
      ],
      [
       "Spikes, Iron",
       "5 lb.",
       "1 GP"
      ],
      [
       "Spyglass",
       "1 lb.",
       "1,000 GP"
      ],
      [
       "String",
       "—",
       "1 SP"
      ],
      [
       "Tent",
       "20 lb.",
       "2 GP"
      ],
      [
       "Tinderbox",
       "1 lb.",
       "5 SP"
      ],
      [
       "Torch",
       "1 lb.",
       "1 CP"
      ],
      [
       "Vial",
       "—",
       "1 GP"
      ],
      [
       "Waterskin",
       "5 lb. (full)",
       "2 SP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "acid-25-gp",
  "name": {
   "de": "Säure (25 GM)",
   "en": "Acid (25 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du die Angriffsaktion ausführst, kannst du einen deiner Angriffe dadurch ersetzen, dass du eine Phiole mit Säure wirfst. Wähle ein Ziel (Kreatur oder Gegenstand) im Abstand von bis zu sechs Metern von dir aus, das du sehen kannst. Das Ziel muss einen Geschicklichkeitsrettungswurf (SG 8 plus dein Geschicklichkeitsmodifikator plus dein Übungsbonus) bestehen, oder es erleidet 2W6 Säureschaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you take the Attack action, you can replace one of your attacks with throwing a vial of Acid. Target one creature or object you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or take 2d6 Acid damage."
    }
   ]
  }
 },
 {
  "id": "alchemist-s-fire-50-gp",
  "name": {
   "de": "Alchemistenfeuer (50 GM)",
   "en": "Alchemist’s Fire (50 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du die Angriffsaktion ausführst, kannst du einen deiner Angriffe dadurch ersetzen, dass du eine Flasche mit Alchemistenfeuer wirfst. Wähle ein Ziel (Kreatur oder Gegenstand) im Abstand von bis zu sechs Metern von dir aus, das du sehen kannst. Das Ziel muss einen Geschicklichkeitsrettungswurf (SG 8 plus dein Geschicklichkeitsmodifikator plus dein Übungsbonus) bestehen, oder es erleidet 1W4 Feuerschaden und beginnt zu brennen (siehe „Regelglossar“)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you take the Attack action, you can replace one of your attacks with throwing a flask of Alchemist’s Fire. Target one creature or object you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or take 1d4 Fire damage and start burning (see “Rules Glossary”)."
    }
   ]
  }
 },
 {
  "id": "ammunition-varies",
  "name": {
   "de": "Geschosse (Preis variiert)",
   "en": "Ammunition (Varies)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Geschosse werden für Waffen mit der Eigenschaft Geschosse benötigt. Die jeweils erforderliche Art der Geschosse ist in der Waffenbeschreibung angegeben. In der Tabelle „Geschosse“ sind die verschiedenen Arten sowie die Mengen aufgeführt, die du beim Kauf erhältst. Außerdem ist der Gegenstand genannt, der üblicherweise zur Aufbewahrung der Geschosse verwendet wird (er muss separat erworben werden)."
    },
    {
     "typ": "tabelle",
     "titel": "Geschosse",
     "kopf": [
      "Typ",
      "Anzahl",
      "Aufbewahrung",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Bolzen",
       "20",
       "Behälter",
       "0,75 kg",
       "1 GM"
      ],
      [
       "Munition (Feuerwaffe)",
       "10",
       "Beutel",
       "1 kg",
       "3 GM"
      ],
      [
       "Munition (Schleuder)",
       "20",
       "Beutel",
       "0,75 kg",
       "4 KM"
      ],
      [
       "Pfeile (Blasrohr)",
       "50",
       "Beutel",
       "0,5 kg",
       "1 GM"
      ],
      [
       "Pfeile",
       "20",
       "Köcher",
       "0,5 kg",
       "1 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Ammunition is required by a weapon that has the Ammunition property. A weapon’s description specifies the type of ammunition used by the weapon. The Ammunition table lists the different types and the amount you get when you buy them. The table also lists the item that is typically used to store each type; storage must be bought separately."
    },
    {
     "typ": "tabelle",
     "titel": "Ammunition",
     "kopf": [
      "Type",
      "Amount",
      "Storage",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Arrows",
       "20",
       "Quiver",
       "1 lb.",
       "1 GP"
      ],
      [
       "Bolts",
       "20",
       "Case",
       "1½ lb.",
       "1 GP"
      ],
      [
       "Bullets, Firearm",
       "10",
       "Pouch",
       "2 lb.",
       "3 GP"
      ],
      [
       "Bullets, Sling",
       "20",
       "Pouch",
       "1½ lb.",
       "4 CP"
      ],
      [
       "Needles",
       "50",
       "Pouch",
       "1 lb.",
       "1 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "antitoxin-50-gp",
  "name": {
   "de": "Gegengift (50 GM)",
   "en": "Antitoxin (50 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Bonusaktion kannst du eine Phiole mit Gegengift zu dir nehmen, damit deine Rettungswürfe zum Vermeiden oder Beenden des Zustands Vergiftet eine Stunde lang im Vorteil sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Bonus Action, you can drink a vial of Antitoxin to gain Advantage on saving throws to avoid or end the Poisoned condition for 1 hour."
    }
   ]
  }
 },
 {
  "id": "arcane-focus-varies",
  "name": {
   "de": "Arkaner Fokus (Preis variiert)",
   "en": "Arcane Focus (Varies)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Arkaner Fokus hat eine der Formen, die in der Tabelle „Arkane Fokusse“ aufgeführt sind. Er ist mit Juwelen besetzt oder mit Schnitzereien versehen, um arkane Magie zu kanalisieren. Hexenmeister, Magier und Zauberer können diese Gegenstände als Zauberfokus verwenden."
    },
    {
     "typ": "tabelle",
     "titel": "Arkane Fokusse",
     "kopf": [
      "Fokus",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Kristall",
       "0,5 kg",
       "10 GM"
      ],
      [
       "Kugel",
       "1,5 kg",
       "20 GM"
      ],
      [
       "Rute",
       "1 kg",
       "10 GM"
      ],
      [
       "Stab (auch Kampfstab)",
       "2 kg",
       "5 GM"
      ],
      [
       "Zauberstab",
       "0,5 kg",
       "10 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An Arcane Focus takes one of the forms in the Arcane Focuses table and is bejeweled or carved to channel arcane magic. A Sorcerer, Warlock, or Wizard can use such an item as a Spellcasting Focus."
    },
    {
     "typ": "tabelle",
     "titel": "Arcane Focuses",
     "kopf": [
      "Focus",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Crystal",
       "1 lb.",
       "10 GP"
      ],
      [
       "Orb",
       "3 lb.",
       "20 GP"
      ],
      [
       "Rod",
       "2 lb.",
       "10 GP"
      ],
      [
       "Staff (also a Quarterstaff)",
       "4 lb.",
       "5 GP"
      ],
      [
       "Wand",
       "1 lb.",
       "10 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "backpack-2-gp",
  "name": {
   "de": "Rucksack (2 GM)",
   "en": "Backpack (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Rucksack fasst bis zu 15 Kilogramm in einem Volumen von 28 Litern. Kann auch als Satteltasche dienen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Backpack holds up to 30 pounds within 1 cubic foot. It can also serve as a saddlebag."
    }
   ]
  }
 },
 {
  "id": "ball-bearings-1-gp",
  "name": {
   "de": "Metallkügelchen (1 GM)",
   "en": "Ball Bearings (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Verwenden‑Aktion kannst du Metallkügelchen aus ihrem Beutel schütten. Sie verteilen sich und bedecken einen 1 Quadratmeter großen ebenen Bereich im Abstand von bis zu drei Metern von dir. Eine Kreatur, die diesen Bereich erstmals in einem Zug betritt, muss einen SG‑10‑Geschicklichkeitsrettungswurf bestehen, oder sie stürzt und hat den Zustand Liegend. Es dauert zehn Minuten, die Metallkügelchen wieder einzusammeln."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Utilize action, you can spill Ball Bearings from their pouch. They spread to cover a level, 10-footsquare area within 10 feet of yourself. A creature that enters this area for the first time on a turn must succeed on a DC 10 Dexterity saving throw or have the Prone condition. It takes 10 minutes to recover the Ball Bearings."
    }
   ]
  }
 },
 {
  "id": "barrel-2-gp",
  "name": {
   "de": "Fass (2 GM)",
   "en": "Barrel (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Fass bietet ein Volumen von 112 Litern und kann Flüssigkeiten oder trockene Güter fassen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Barrel holds up to 40 gallons of liquid or up to 4 cubic feet of dry goods."
    }
   ]
  }
 },
 {
  "id": "basket-4-sp",
  "name": {
   "de": "Korb (4 SM)",
   "en": "Basket (4 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Korb fasst bis zu 20 Kilogramm in einem Volumen von 56 Litern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Basket holds up to 40 pounds within 2 cubic feet."
    }
   ]
  }
 },
 {
  "id": "bedroll-1-gp",
  "name": {
   "de": "Schlafsack (1 GM)",
   "en": "Bedroll (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem Schlafsack kann eine kleine oder mittelgroße Kreatur schlafen. Im Schlafsack bestehst du Rettungswürfe gegen extreme Kälte (siehe „Werkzeugkasten fürs Spiel“) automatisch."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Bedroll sleeps one Small or Medium creature. While in a Bedroll, you automatically succeed on saving throws against extreme cold (see “Gameplay Toolbox”)."
    }
   ]
  }
 },
 {
  "id": "bell-1-gp",
  "name": {
   "de": "Glocke (1 GM)",
   "en": "Bell (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn eine Glocke mit der Verwenden‑Aktion geläutet wird, ist ihr Läuten bis zu 18 Meter weit zu hören."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When rung as a Utilize action, a Bell produces a sound that can be heard up to 60 feet away."
    }
   ]
  }
 },
 {
  "id": "blanket-5-sp",
  "name": {
   "de": "Decke (5 SM)",
   "en": "Blanket (5 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In eine Decke gewickelt bist du bei Rettungswürfen gegen extreme Kälte (siehe „Werkzeugkasten fürs Spiel“) im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wrapped in a blanket, you have Advantage on saving throws against extreme cold (see “Gameplay Toolbox”)."
    }
   ]
  }
 },
 {
  "id": "block-and-tackle-1-gp",
  "name": {
   "de": "Flaschenzug (1 GM)",
   "en": "Block and Tackle (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit einem Flaschenzug kannst du das Vierfache des Gewichts anheben, das du auf normale Weise heben könntest."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Block and Tackle allows you to hoist up to four times the weight you can normally lift."
    }
   ]
  }
 },
 {
  "id": "book-25-gp",
  "name": {
   "de": "Buch (25 GM)",
   "en": "Book (25 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Buch enthält Belletristik oder Sachtexte. Wenn du ein korrektes Sachbuch zu einem Thema liest, erhältst du einen Bonus von +5 auf Intelligenzwürfe (Arkane Kunde, Geschichte, Naturkunde oder Religion) zu diesem Thema."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Book contains fiction or nonfiction. If you consult an accurate nonfiction Book about its topic, you gain a +5 bonus to Intelligence (Arcana, History, Nature, or Religion) checks you make about that topic."
    }
   ]
  }
 },
 {
  "id": "bottle-glass-2-gp",
  "name": {
   "de": "Flasche, Glas (2 GM)",
   "en": "Bottle, Glass (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Glasflasche fasst bis zu 0,75 Liter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Glass Bottle holds up to 11/2 pints."
    }
   ]
  }
 },
 {
  "id": "bucket-5-cp",
  "name": {
   "de": "Eimer (5 KM)",
   "en": "Bucket (5 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Eimer fasst bis zu 14 Liter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Bucket holds up to half a cubic foot of contents."
    }
   ]
  }
 },
 {
  "id": "burglar-s-pack-16-gp",
  "name": {
   "de": "Einbrecherausrüstung (16 GM)",
   "en": "Burglar’s Pack (16 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Einbrecherausrüstung enthält folgende Gegenstände: Abdeckbare Laterne, Brechstange, Glocke, zehn Kerzen, Metallkügelchen, sieben Flaschen Öl, Rucksack, Seil, fünf Tagesrationen, Trinkschlauch und Zunderkästchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Burglar’s Pack contains the following items: Backpack, Ball Bearings, Bell, 10 Candles, Crowbar, Hooded Lantern, 7 flasks of Oil, 5 days of Rations, Rope, Tinderbox, and Waterskin."
    }
   ]
  }
 },
 {
  "id": "caltrops-1-gp",
  "name": {
   "de": "Krähenfüße (1 GM)",
   "en": "Caltrops (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Verwenden‑Aktion kannst du Krähenfüße aus ihrem Beutel nehmen und in einem Bereich von 2,3 Quadratmetern im Abstand von bis zu 1,5 Metern von dir auslegen. Eine Kreatur, die diesen Bereich erstmals in einem Zug betritt, muss einen SG‑15‑Geschicklichkeitsrettungswurf bestehen, oder sie erleidet 1 Stichschaden, und ihre Bewegungsrate ist bis zum Beginn ihres nächsten Zugs auf 0 verringert. Es dauert zehn Minuten, die Krähenfüße wieder einzusammeln."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Utilize action, you can spread Caltrops from their bag to cover a 5-foot-square area within 5 feet of yourself. A creature that enters this area for the first time on a turn must succeed on a DC 15 Dexterity saving throw or take 1 Piercing damage and have its Speed reduced to 0 until the start of its next turn. It takes 10 minutes to recover the Caltrops."
    }
   ]
  }
 },
 {
  "id": "candle-1-cp",
  "name": {
   "de": "Kerze (1 KM)",
   "en": "Candle (1 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine brennende Kerze spendet eine Stunde lang in einem Radius von 1,5 Metern helles Licht und in einem Radius von weiteren 1,5 Metern dämmriges Licht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For 1 hour, a lit Candle sheds Bright Light in a 5-foot radius and Dim Light for an additional 5 feet."
    }
   ]
  }
 },
 {
  "id": "case-crossbow-bolt-1-gp",
  "name": {
   "de": "Behälter, Armbrustbolzen (1 GM)",
   "en": "Case, Crossbow Bolt (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Behälter für Armbrustbolzen fasst bis zu 20 Bolzen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Crossbow Bolt Case holds up to 20 Bolts."
    }
   ]
  }
 },
 {
  "id": "case-map-or-scroll-1-gp",
  "name": {
   "de": "Behälter, Karten oder Schriftrollen (1 GM)",
   "en": "Case, Map or Scroll (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Karten ‑ oder Schriftrollenbehälter fasst bis zu zehn Papierbögen oder fünf Pergamentbögen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Map or Scroll Case holds up to 10 sheets of paper or 5 sheets of parchment."
    }
   ]
  }
 },
 {
  "id": "chain-5-gp",
  "name": {
   "de": "Kette (5 GM)",
   "en": "Chain (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Verwenden‑Aktion kannst du eine Kette um eine nicht bereitwillige Kreatur im Abstand von bis zu 1,5 Metern von dir schlingen, die gepackt, kampfunfähig oder festgesetzt ist, sofern du einen SG‑13‑Stärkewurf (Athletik) bestehst. Werden die Beine der Kreatur gefesselt, so ist die Kreatur festgesetzt, bis sie entkommt. Um die Kette abzustreifen, muss die Kreatur als Aktion einen SG‑18‑Geschicklichkeitswurf (Akrobatik) bestehen. Die Kette zu sprengen erfordert einen erfolgreichen SG‑20‑Stärkewurf (Athletik) als Aktion."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Utilize action, you can wrap a Chain around an unwilling creature within 5 feet of yourself that has the Grappled, Incapacitated, or Restrained condition if you succeed on a DC 13 Strength (Athletics) check. If the creature’s legs are bound, the creature has the Restrained condition until it escapes. Escaping the Chain requires the creature to make a successful DC 18 Dexterity (Acrobatics) check as an action. Bursting the Chain requires a successful DC 20 Strength (Athletics) check as an action."
    }
   ]
  }
 },
 {
  "id": "chest-5-gp",
  "name": {
   "de": "Truhe (5 GM)",
   "en": "Chest (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Truhe bietet ein Volumen von 324 Litern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Chest holds up to 12 cubic feet of contents."
    }
   ]
  }
 },
 {
  "id": "climber-s-kit-25-gp",
  "name": {
   "de": "Kletterausrüstung (25 GM)",
   "en": "Climber’s Kit (25 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Zur Kletterausrüstung gehören Gurtzeug, Handschuhe, Kletterhaken und Steigeisen. Als Verwenden‑Aktion kannst du dich mit der Kletterausrüstung durch Verankern sichern, um vom Ankerpunkt nicht tiefer als 7,5 Meter stürzen zu können. In diesem Fall kannst du dich höchstens 7,5 Meter weit bewegen, ohne den Anker als Bonusaktion zu lösen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Climber’s Kit includes boot tips, gloves, pitons, and a harness. As a Utilize action, you can use the Climber’s Kit to anchor yourself; when you do, you can’t fall more than 25 feet from the anchor point, and you can’t move more than 25 feet from there without undoing the anchor as a Bonus Action."
    }
   ]
  }
 },
 {
  "id": "clothes-fine-15-gp",
  "name": {
   "de": "Kleidung, fein (15 GM)",
   "en": "Clothes, Fine (15 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Feine Kleidung besteht aus teuren Stoffen und ist mit kunstvollen Details verziert. Manche Veranstaltungen und Orte können nur in feiner Kleidung besucht werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Fine Clothes are made of expensive fabrics and adorned with expertly crafted details. Some events and locations admit only people wearing these clothes."
    }
   ]
  }
 },
 {
  "id": "clothes-traveler-s-2-gp",
  "name": {
   "de": "Kleidung, Reise (2 GM)",
   "en": "Clothes, Traveler’s (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Reisekleidung besteht aus belastbarem Material und eignet sich zum Reisen durch verschiedene Umgebungen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Traveler’s Clothes are resilient garments designed for travel in various environments."
    }
   ]
  }
 },
 {
  "id": "component-pouch-25-gp",
  "name": {
   "de": "Materialkomponentenbeutel (25 GM)",
   "en": "Component Pouch (25 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Materialkomponentenbeutel ist wasserdicht und so unterteilt, dass er alle kostenlosen Materialkomponenten deiner Zauber aufnehmen kann."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Component Pouch is watertight and filled with compartments that hold all the free Material components of your spells."
    }
   ]
  }
 },
 {
  "id": "costume-5-gp",
  "name": {
   "de": "Kostüm (5 GM)",
   "en": "Costume (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du ein Kostüm trägst, bist du bei allen Attributswürfen im Vorteil, die du ausführst, um dich als die entsprechende Person oder Art von Person zu tarnen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing a Costume, you have Advantage on any ability check you make to impersonate the person or type of person it represents."
    }
   ]
  }
 },
 {
  "id": "crowbar-2-gp",
  "name": {
   "de": "Brechstange (2 GM)",
   "en": "Crowbar (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Brechstange verwendest, bist du bei Stärkewürfen im Vorteil, bei denen sich die Hebelwirkung der Brechstange anwenden lässt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Using a Crowbar gives you Advantage on Strength checks where the Crowbar’s leverage can be applied."
    }
   ]
  }
 },
 {
  "id": "diplomat-s-pack-39-gp",
  "name": {
   "de": "Diplomatenausrüstung (39 GM)",
   "en": "Diplomat’s Pack (39 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Diplomatenausrüstung enthält folgende Gegenstände: zwei Karten ‑ oder Schriftrollenbehälter, feine Kleidung, Lampe, vier Flaschen Öl, fünf Bögen Papier, Parfüm, fünf Bögen Pergament, Tinte, fünf Tintenfüller, Truhe und Zunderkästchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Diplomat’s Pack contains the following items: Chest, Fine Clothes, Ink, 5 Ink Pens, Lamp, 2 Map or Scroll Cases, 4 flasks of Oil, 5 sheets of Paper, 5 sheets of Parchment, Perfume, and Tinderbox."
    }
   ]
  }
 },
 {
  "id": "druidic-focus-varies",
  "name": {
   "de": "Druidischer Fokus (Preis variiert)",
   "en": "Druidic Focus (Varies)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Druidischer Fokus hat eine der Formen, die in der Tabelle „Druidische Fokusse“ aufgeführt sind. Er ist mit Schnitzereien, Bändern oder Malereien versehen, um Urmagie zu kanalisieren. Ein Druide oder Waldläufer kann einen solchen Gegenstand als Zauberfokus verwenden."
    },
    {
     "typ": "tabelle",
     "titel": "Druidische Fokusse",
     "kopf": [
      "Fokus",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Holzstab (auch Kampfstab)",
       "2 kg",
       "5 GM"
      ],
      [
       "Mistelzweig",
       "−",
       "1 GM"
      ],
      [
       "Zauberstab aus Eibe",
       "0,5 kg",
       "10 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Druidic Focus takes one of the forms in the Druidic Focuses table and is carved, tied with ribbon, or painted to channel primal magic. A Druid or Ranger can use such an object as a Spellcasting Focus."
    },
    {
     "typ": "tabelle",
     "titel": "Druidic Focuses",
     "kopf": [
      "Focus",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Sprig of mistletoe",
       "—",
       "1 GP"
      ],
      [
       "Wooden staff (also a Quarterstaff)",
       "4 lb.",
       "5 GP"
      ],
      [
       "Yew wand",
       "1 lb.",
       "10 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "dungeoneer-s-pack-12-gp",
  "name": {
   "de": "Gewölbeforscherausrüstung (12 GM)",
   "en": "Dungeoneer’s Pack (12 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Gewölbeforscherausrüstung enthält folgende Gegenstände: Brechstange, zehn Fackeln, Krähenfüße, zwei Flaschen Öl, Rucksack, Seil, zehn Tagesrationen, Trinkschlauch und Zunderkästchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Dungeoneer’s Pack contains the following items: Backpack, Caltrops, Crowbar, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches, and Waterskin."
    }
   ]
  }
 },
 {
  "id": "entertainer-s-pack-40-gp",
  "name": {
   "de": "Unterhaltungskünstler-Ausrüstung (40 GM)",
   "en": "Entertainer’s Pack (40 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Unterhaltungskünstler‑Ausrüstung enthält folgende Gegenstände: Blendlaterne, Glocke, drei Kostüme, acht Flaschen Öl, Rucksack, Schlafsack, Spiegel, neun Tagesrationen, Trinkschlauch und Zunderkästchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An Entertainer’s Pack contains the following items: Backpack, Bedroll, Bell, Bullseye Lantern, 3 Costumes, Mirror, 8 flasks of Oil, 9 days of Rations, Tinderbox, and Waterskin."
    }
   ]
  }
 },
 {
  "id": "explorer-s-pack-10-gp",
  "name": {
   "de": "Entdeckerausrüstung (10 GM)",
   "en": "Explorer’s Pack (10 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Entdeckerausrüstung enthält folgende Gegenstände: zehn Fackeln, zwei Flaschen Öl, Rucksack, Schlafsack, Seil, zehn Tagesrationen, Trinkschlauch und Zunderkästchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An Explorer’s Pack contains the following items: Backpack, Bedroll, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches, and Waterskin."
    }
   ]
  }
 },
 {
  "id": "flask-2-cp",
  "name": {
   "de": "Flasche (2 KM)",
   "en": "Flask (2 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Flasche fasst bis zu 0,5 Liter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Flask holds up to 1 pint."
    }
   ]
  }
 },
 {
  "id": "grappling-hook-2-gp",
  "name": {
   "de": "Enterhaken (2 GM)",
   "en": "Grappling Hook (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Verwenden‑Aktion kannst du den Enterhaken nach einer Reling, einem Sims oder einem anderen geeigneten Gegenstand im Abstand von bis zu 15 Metern von dir werfen. Er greift, wenn du einen SG‑13‑Geschicklichkeitswurf (Akrobatik) bestehst. Wenn du ein Seil am Haken befestigt hast, kannst du daran hochklettern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Utilize action, you can throw the Grappling Hook at a railing, a ledge, or another catch within 50 feet of yourself, and the hook catches on if you succeed on a DC 13 Dexterity (Acrobatics) check. If you tied a Rope to the hook, you can then climb it."
    }
   ]
  }
 },
 {
  "id": "healer-s-kit-5-gp",
  "name": {
   "de": "Heilerausrüstung (5 GM)",
   "en": "Healer’s Kit (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Heilerausrüstung reicht für zehn Anwendungen. Als Verwenden‑Aktion kannst du eine der Anwendungen verbrauchen, um eine bewusstlose Kreatur mit 0 Trefferpunkten zu stabilisieren, ohne dass du dazu einen Weisheitswurf (Heilkunde) ausführen musst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Healer’s Kit has ten uses. As a Utilize action, you can expend one of its uses to stabilize an Unconscious creature that has 0 Hit Points without needing to make a Wisdom (Medicine) check."
    }
   ]
  }
 },
 {
  "id": "holy-symbol-varies",
  "name": {
   "de": "Heiliges Symbol (Preis variiert)",
   "en": "Holy Symbol (Varies)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein heiliges Symbol hat eine der Formen, die in der Tabelle „Heilige Symbole“ aufgeführt sind. Es ist mit Juwelen besetzt oder mit Malereien versehen, um göttliche Magie zu kanalisieren. Kleriker und Paladine können ein heiliges Symbol als Zauberfokus verwenden. In der Tabelle ist angegeben, ob ein heiliges Symbol gehalten oder getragen werden oder sich auf Stoff (wie ein Wappenrock oder Banner) oder einem Schild befinden muss."
    },
    {
     "typ": "tabelle",
     "titel": "Heilige Symbole",
     "kopf": [
      "Symbol",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Amulett (getragen oder gehalten)",
       "0,5 kg",
       "5 GM"
      ],
      [
       "Emblem (auf Stoff oder Schild)",
       "−",
       "5 GM"
      ],
      [
       "Reliquie (gehalten)",
       "1 kg",
       "5 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Holy Symbol takes one of the forms in the Holy Symbol table and is bejeweled or painted to channel divine magic. A Cleric or Paladin can use a Holy Symbol as a Spellcasting Focus. The table indicates whether a Holy Symbol needs to be held, worn, or borne on fabric (such as a tabard or banner) or a Shield."
    },
    {
     "typ": "tabelle",
     "titel": "Holy Symbols",
     "kopf": [
      "Symbol",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Amulet (worn or held)",
       "1 lb.",
       "5 GP"
      ],
      [
       "Emblem (borne on fabric or a Shield)",
       "—",
       "5 GP"
      ],
      [
       "Reliquary (held)",
       "2 lb.",
       "5 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "holy-water-25-gp",
  "name": {
   "de": "Weihwasser (25 GM)",
   "en": "Holy Water (25 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du die Angriffsaktion ausführst, kannst du einen deiner Angriffe dadurch ersetzen, dass du eine Flasche mit Weihwasser wirfst. Ziele auf eine Kreatur im Abstand von bis zu sechs Metern von dir, die du sehen kannst. Wenn das Ziel ein Unhold oder ein Untoter ist, muss es einen Geschicklichkeitsrettungswurf (SG 8 plus dein Geschicklichkeitsmodifikator plus dein Übungsbonus) bestehen, oder es erleidet 2W8 gleißenden Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you take the Attack action, you can replace one of your attacks with throwing a flask of Holy Water. Target one creature you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or take 2d8 Radiant damage if it is a Fiend or an Undead."
    }
   ]
  }
 },
 {
  "id": "hunting-trap-5-gp",
  "name": {
   "de": "Jagdfalle (5 GM)",
   "en": "Hunting Trap (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Verwenden‑Aktion kannst du eine Jagdfalle stellen – einen gezahnten Stahlring, der zuschnappt, wenn eine Kreatur auf die Druckplatte in der Mitte tritt. Die Falle ist mit einer schweren Kette an einem Fixpunkt wie einem Baum oder einem in den Boden gerammten Pfahl befestigt. Eine Kreatur, die auf die Platte tritt, muss einen SG‑13‑Geschicklichkeitsrettungswurf bestehen, oder sie erleidet 1W4 Stichschaden, und ihre Bewegungsrate ist bis zum Beginn ihres nächsten Zugs auf 0 verringert. Anschließend ist die Bewegung der Kreatur durch die Länge der Kette (üblicherweise ein Meter) begrenzt, bis die Kreatur sich aus der Falle befreien kann. Eine Kreatur kann ihre Aktion verwenden, um einen SG‑13‑Stärkewurf (Athletik) auszuführen. Bei einem Erfolg befreit es sich selbst oder eine andere Kreatur in Reichweite aus der Falle. Jeder misslungene Wurf fügt der Kreatur in der Falle 1 Stichschaden zu."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Utilize action, you can set a Hunting Trap, which is a sawtooth steel ring that snaps shut when a creature steps on a pressure plate in the center. The trap is affixed by a heavy chain to an immobile object, such as a tree or a spike driven into the ground. A creature that steps on the plate must succeed on a DC 13 Dexterity saving throw or take 1d4 Piercing damage and have its Speed reduced to 0 until the start of its next turn. Thereafter, until the creature breaks free of the trap, its movement is limited by the length of the chain (typically 3 feet). A creature can use its action to make a DC 13 Strength (Athletics) check, freeing itself or another creature within its reach on a success. Each failed check deals 1 Piercing damage to the trapped creature."
    }
   ]
  }
 },
 {
  "id": "ink-10-gp",
  "name": {
   "de": "Tinte (10 GM)",
   "en": "Ink (10 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Tinte gibt es in Flaschen zu je 30 ml (ausreichend für etwa 500 Seiten)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Ink comes in a 1-ounce bottle, which provides enough ink to write about 500 pages."
    }
   ]
  }
 },
 {
  "id": "ink-pen-2-cp",
  "name": {
   "de": "Tintenfüller (2 KM)",
   "en": "Ink Pen (2 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Um mit Tinte zu schreiben oder zu zeichnen, ist ein Tintenfüller erforderlich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Using Ink, an Ink Pen is used to write or draw."
    }
   ]
  }
 },
 {
  "id": "jug-2-cp",
  "name": {
   "de": "Krug (2 KM)",
   "en": "Jug (2 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Krug fasst bis zu 4 Liter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Jug holds up to 1 gallon."
    }
   ]
  }
 },
 {
  "id": "ladder-1-sp",
  "name": {
   "de": "Leiter (1 SM)",
   "en": "Ladder (1 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Leiter ist drei Meter lang. Du musst klettern, um dich an ihr hinauf ‑ oder hinabzubewegen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Ladder is 10 feet tall. You must climb to move up or down it."
    }
   ]
  }
 },
 {
  "id": "lamp-5-sp",
  "name": {
   "de": "Lampe (5 SM)",
   "en": "Lamp (5 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Lampe brennt mit Öl und spendet in einem Radius von 4,5 Metern helles Licht und in einem Radius von weiteren neun Metern dämmriges Licht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Lamp burns Oil as fuel to cast Bright Light in a 15foot radius and Dim Light for an additional 30 feet."
    }
   ]
  }
 },
 {
  "id": "lantern-bullseye-10-gp",
  "name": {
   "de": "Blendlaterne (10 GM)",
   "en": "Lantern, Bullseye (10 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Blendlaterne spendet in einem Kegel von 18 Metern helles Licht und in weiteren 18 Metern dämmriges Licht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Bullseye Lantern burns Oil as fuel to cast Bright Light in a 60-foot Cone and Dim Light for an additional 60 feet."
    }
   ]
  }
 },
 {
  "id": "lantern-hooded-5-gp",
  "name": {
   "de": "Laterne, abdeckbar (5 GM)",
   "en": "Lantern, Hooded (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine abdeckbare Laterne spendet in einem Radius von neun Metern helles Licht und in einem Radius von weiteren neun Metern dämmriges Licht. Als Bonusaktion kannst du die Haube entweder absenken und so das Licht auf dämmriges Licht in einem Radius von 1,5 Metern verringern, oder du kannst die Haube wieder anheben."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Hooded Lantern burns Oil as fuel to cast Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. As a Bonus Action, you can lower the hood, reducing the light to Dim Light in a 5-foot radius, or raise it again."
    }
   ]
  }
 },
 {
  "id": "lock-10-gp",
  "name": {
   "de": "Schloss (10 GM)",
   "en": "Lock (10 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Zu einem Schloss gehört ein Schlüssel. Ohne den Schlüssel kann eine Kreatur versuchen, das Schloss mit Diebeswerkzeug und einem erfolgreichen SG‑15‑Geschicklichkeitswurf (Fingerfertigkeit) zu knacken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Lock comes with a key. Without the key, a creature can use Thieves’ Tools to pick this Lock with a successful DC 15 Dexterity (Sleight of Hand) check."
    }
   ]
  }
 },
 {
  "id": "magnifying-glass-100-gp",
  "name": {
   "de": "Lupe (100 GM)",
   "en": "Magnifying Glass (100 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit einer Lupe bist du bei allen Attributswürfen zum Einschätzen oder Untersuchen kleiner oder detailreicher Gegenstände im Vorteil. Wenn du mit einer Lupe ein Feuer entfachen willst, benötigst du Sonnenlicht oder vergleichbar helles Licht zum Bündeln, Zunder zum Anzünden und etwa fünf Minuten Zeit."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Magnifying Glass grants Advantage on any ability check made to appraise or inspect a highly detailed item. Lighting a fire with a Magnifying Glass requires light as bright as sunlight to focus, tinder to ignite, and about 5 minutes for the fire to ignite."
    }
   ]
  }
 },
 {
  "id": "manacles-2-gp",
  "name": {
   "de": "Handschellen (2 GM)",
   "en": "Manacles (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Verwenden‑Aktion kannst du mit Handschellen eine nicht bereitwillige, kleine oder mittelgroße Kreatur im Abstand von bis zu 1,5 Metern von dir fesseln, die gepackt, kampfunfähig oder festgesetzt ist, sofern du einen SG‑13‑Geschicklichkeitswurf (Fingerfertigkeit) bestehst. Eine auf diese Art gefesselte Kreatur ist bei Angriffswürfen im Nachteil. Außerdem ist sie festgesetzt, sofern die Handschellen an einem fixierten Gegenstand wie einer Kette oder einem Haken befestigt sind. Aus den Handschellen zu entkommen erfordert einen erfolgreichen SG‑20‑Geschicklichkeitswurf (Fingerfertigkeit) als Aktion. Die Handschellen zu sprengen erfordert einen erfolgreichen SG‑25‑Stärkewurf (Athletik) als Aktion. Zu jedem Paar Handschellen gehört ein Schlüssel. Ohne den Schlüssel kann eine Kreatur versuchen, das Schloss der Handschellen mit Diebeswerkzeug und einem erfolgreichen SG‑15‑Geschicklichkeitswurf (Fingerfertigkeit) zu knacken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Utilize action, you can use Manacles to bind an unwilling Small or Medium creature within 5 feet of yourself that has the Grappled, Incapacitated, or Restrained condition if you succeed on a DC 13 Dexterity (Sleight of Hand) check. While bound, a creature has Disadvantage on attack rolls, and the creature is Restrained if the Manacles are attached to a chain or hook that is fixed in place. Escaping the Manacles requires a successful DC 20 Dexterity (Sleight of Hand) check as an action. Bursting them requires a successful DC 25 Strength (Athletics) check as an action. Each set of Manacles comes with a key. Without the key, a creature can use Thieves’ Tools to pick the Manacles’ lock with a successful DC 15 Dexterity (Sleight of Hand) check."
    }
   ]
  }
 },
 {
  "id": "map-1-gp",
  "name": {
   "de": "Karte (1 GM)",
   "en": "Map (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine korrekte Karte konsultierst, hast du einen Bonus von +5 auf Weisheitswürfe (Überlebenskunst), die du ausführst, um dich im auf der Karte dargestellten Gebiet zurechtzufinden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you consult an accurate Map, you gain a +5 bonus to Wisdom (Survival) checks you make to find your way in the place represented on it."
    }
   ]
  }
 },
 {
  "id": "mirror-5-gp",
  "name": {
   "de": "Spiegel (5 GM)",
   "en": "Mirror (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein stählerner Handspiegel ist nicht nur zu kosmetischen Zwecken nützlich, sondern auch zum Spähen um Ecken und zum Übermitteln von Lichtsignalen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A handheld steel Mirror is useful for personal cosmetics but also for peeking around corners and reflecting light as a signal."
    }
   ]
  }
 },
 {
  "id": "net-1-gp",
  "name": {
   "de": "Netz (1 GM)",
   "en": "Net (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du die Angriffsaktion ausführst, kannst du einen deiner Angriffe dadurch ersetzen, dass du ein Netz wirfst. Ziele auf eine Kreatur im Abstand von bis zu 4,5 Metern von dir, die du sehen kannst. Das Ziel muss einen Geschicklichkeitsrettungswurf (SG 8 plus dein Geschicklichkeitsmodifikator plus dein Übungsbonus) bestehen, oder es ist festgesetzt, bis es entkommt. Es besteht den Rettungswurf automatisch, wenn es von mindestens riesiger Größe ist. Zum Entkommen muss das Ziel eine Aktion ausführen und einen SG‑10‑Stärkewurf (Athletik) bestehen. Alternativ kann eine andere Kreatur im Abstand von bis zu 1,5 Metern vom Ziel auf die gleiche Weise versuchen, das festgesetzte Ziel zu befreien. Durch Zerstören des Netzes (RK 10, 5 TP, Immunität gegen Gift‑, psychischen und Wuchtschaden) wird das Ziel ebenfalls befreit, und der Effekt endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you take the Attack action, you can replace one of your attacks with throwing a Net. Target a creature you can see within 15 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or have the Restrained condition until it escapes. The target succeeds automatically if it is Huge or larger. To escape, the target or a creature within 5 feet of it must take an action to make a DC 10 Strength (Athletics) check, freeing the Restrained creature on a success. Destroying the Net (AC 10; 5 HP; Immunity to Bludgeoning, Poison, and Psychic damage) also frees the target, ending the effect."
    }
   ]
  }
 },
 {
  "id": "oil-1-sp",
  "name": {
   "de": "Öl (1 SM)",
   "en": "Oil (1 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst eine Kreatur, einen Gegenstand oder einen Bereich mit Öl bedecken oder das Öl als Brennstoff verwenden wie unten beschrieben."
    },
    {
     "typ": "punkt",
     "text": "Eine Kreatur oder einen Gegenstand bedecken: Wenn du die Angriffsaktion ausführst, kannst du einen deiner Angriffe dadurch ersetzen, dass du eine Flasche Öl wirfst. Wähle ein Ziel (Kreatur oder Gegenstand) im Abstand von bis zu sechs Metern von dir aus. Das Ziel muss einen Geschicklichkeitsrettungswurf (SG 8 plus dein Geschicklichkeits modifikator plus dein Übungsbonus) bestehen, oder es wird mit Öl bedeckt. Wenn das Ziel Feuerschaden erleidet, bevor das Öl (nach einer Minute) getrocknet ist, bewirkt das brennende Öl zusätzlich 5 Feuerschaden."
    },
    {
     "typ": "punkt",
     "text": "Einen Bereich bedecken: Als Verwenden‑Aktion kannst du eine Ölflasche auf ebenem Boden ausgießen. Das Öl bedeckt einen Bereich von 2,3 Quadratmetern im Abstand von bis zu 1,5 Metern von dir. Wenn das Öl angezündet wird, brennt es bis zum Ende des Zugs zwei Runden nach dem Entzünden (oder zwölf Sekunden lang) und fügt jeder Kreatur, die den Bereich betritt oder ihren Zug darin beendet, 5 Feuerschaden zu. Eine Kreatur kann diesen Schaden nur einmal pro Zug erleiden."
    },
    {
     "typ": "punkt",
     "text": "Brennstoff: Öl dient als Brennstoff für Lampen und Laternen. Eine Flasche Öl brennt sechs Stunden lang in einer Lampe oder Laterne. Diese Brenndauer muss nicht am Stück erfolgen. Das brennende Öl kann (als Verwenden‑Aktion) gelöscht und später erneut entzündet werden, bis es insgesamt sechs Stunden lang gebrannt hat."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can douse a creature, object, or space with Oil or use it as fuel, as detailed below."
    },
    {
     "typ": "punkt",
     "text": "Dousing a Creature or an Object. When you take the Attack action, you can replace one of your attacks with throwing an Oil flask. Target one creature or object within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or be covered in oil. If the target takes Fire damage before the oil dries (after 1 minute), the target takes an extra 5 Fire damage from burning oil."
    },
    {
     "typ": "punkt",
     "text": "Dousing a Space. You can take the Utilize action to pour an Oil flask on level ground to cover a 5-foot-square area within 5 feet of yourself. If lit, the oil burns until the end of the turn 2 rounds from when the oil was lit (or 12 seconds) and deals 5 Fire damage to any creature that enters the area or ends its turn there. A creature can take this damage only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Fuel. Oil serves as fuel for Lamps and Lanterns. Once lit, a flask of Oil burns for 6 hours in a Lamp or Lantern. That duration doesn’t need to be consecutive; you can extinguish the burning Oil (as a Utilize action) and rekindle it again until it has burned for a total of 6 hours."
    }
   ]
  }
 },
 {
  "id": "paper-2-sp",
  "name": {
   "de": "Papier (2 SM)",
   "en": "Paper (2 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Bogen Papier bietet Platz für etwa 250 handgeschriebene Wörter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One sheet of Paper can hold about 250 handwritten words."
    }
   ]
  }
 },
 {
  "id": "parchment-1-sp",
  "name": {
   "de": "Pergament (1 SM)",
   "en": "Parchment (1 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Bogen Pergament bietet Platz für etwa 250 handgeschriebene Wörter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One sheet of Parchment can hold about 250 handwritten words."
    }
   ]
  }
 },
 {
  "id": "perfume-5-gp",
  "name": {
   "de": "Parfüm (5 GM)",
   "en": "Perfume (5 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Parfüm gibt es in Phiolen zu je 120 ml. Wenn du dich parfümierst, bist du eine Stunde lang bei Charismawürfen (Überzeugen) zum Beeinflussen von Humanoiden im Vorteil, die sich im Abstand von bis zu 1,5 Metern von dir befinden und dir gegenüber gleichgültig sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Perfume comes in a 4-ounce vial. For 1 hour after applying Perfume to yourself, you have Advantage on Charisma (Persuasion) checks made to influence an Indifferent Humanoid within 5 feet of yourself."
    }
   ]
  }
 },
 {
  "id": "poison-basic-100-gp",
  "name": {
   "de": "Gift, einfach (100 GM)",
   "en": "Poison, Basic (100 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Bonusaktion kannst du mit einer Phiole einfachen Gifts eine Waffe oder bis zu drei Geschosse behandeln. Eine Kreatur, die durch die vergiftete Waffe oder ein vergiftetes Geschoss Hieb ‑ oder Stichschaden erleidet, erleidet zusätzlich 1W4 Giftschaden. Wenn das Gift aufgetragen wurde, bleibt es wirksam, bis eine Minute vergangen ist oder sein Schaden bewirkt wurde, je nachdem, was zuerst eintritt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Bonus Action, you can use a vial of Basic Poison to coat one weapon or up to three pieces of ammunition. A creature that takes Piercing or Slashing damage from the poisoned weapon or ammunition takes an extra 1d4 Poison damage. Once applied, the poison retains potency for 1 minute or until its damage is dealt, whichever comes first."
    }
   ]
  }
 },
 {
  "id": "pole-5-cp",
  "name": {
   "de": "Stange (5 KM)",
   "en": "Pole (5 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Stange ist drei Meter lang. Du kannst sie verwenden, um etwas zu berühren, das bis zu drei Meter weit entfernt ist. Wenn du im Rahmen eines Hoch‑ oder Weitsprungs einen Stärkewurf (Athletik) ausführen musst und beim Springen die Stange verwenden kannst, bist du beim Wurf im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Pole is 10 feet long. You can use it to touch something up to 10 feet away. If you must make a Strength (Athletics) check as part of a High or Long Jump, you can use the Pole to vault, giving yourself Advantage on the check."
    }
   ]
  }
 },
 {
  "id": "pot-iron-2-gp",
  "name": {
   "de": "Topf, Eisen (2 GM)",
   "en": "Pot, Iron (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Eisentopf fasst bis zu 4 Liter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An Iron Pot holds up to 1 gallon."
    }
   ]
  }
 },
 {
  "id": "potion-of-healing-50-gp",
  "name": {
   "de": "Heiltrank (50 GM)",
   "en": "Potion of Healing (50 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Trank ist ein magischer Gegenstand. Als Bonusaktion kannst du ihn zu dir nehmen oder einer anderen Kreatur im Abstand von bis zu 1,5 Metern von dir verabreichen. Eine Kreatur, die die magische rote Flüssigkeit in dieser Phiole trinkt, erhält 2W4+2 Trefferpunkte zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This potion is a magic item. As a Bonus Action, you can drink it or administer it to another creature within 5 feet of yourself. The creature that drinks the magical red fluid in this vial regains 2d4 + 2 Hit Points."
    }
   ]
  }
 },
 {
  "id": "pouch-5-sp",
  "name": {
   "de": "Beutel (5 SM)",
   "en": "Pouch (5 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Beutel fasst bis zu drei Kilogramm in einem Volumen von 5,6 Litern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Pouch holds up to 6 pounds within one-fifth of a cubic foot."
    }
   ]
  }
 },
 {
  "id": "priest-s-pack-33-gp",
  "name": {
   "de": "Priesterausrüstung (33 GM)",
   "en": "Priest’s Pack (33 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Priesterausrüstung enthält folgende Gegenstände: Decke, Lampe, Rucksack, Robe, sieben Tagesrationen, Weihwasser und Zunderkästchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Priest’s Pack contains the following items: Backpack, Blanket, Holy Water, Lamp, 7 days of Rations, Robe, and Tinderbox."
    }
   ]
  }
 },
 {
  "id": "quiver-1-gp",
  "name": {
   "de": "Köcher (1 GM)",
   "en": "Quiver (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Köcher fasst bis zu 20 Pfeile."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Quiver holds up to 20 Arrows."
    }
   ]
  }
 },
 {
  "id": "ram-portable-4-gp",
  "name": {
   "de": "Rammbock, tragbar (4 GM)",
   "en": "Ram, Portable (4 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit einem tragbaren Rammbock kannst du Türen aufbrechen. Dabei erhältst du einen Bonus von +4 auf den Stärkewurf. Wenn ein anderer Charakter dir hilft, den Rammbock zu verwenden, bist du bei diesem Wurf im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can use a Portable Ram to break down doors. When doing so, you gain a +4 bonus to the Strength check. One other character can help you use the ram, giving you Advantage on this check."
    }
   ]
  }
 },
 {
  "id": "rations-5-sp",
  "name": {
   "de": "Rationen (5 SM)",
   "en": "Rations (5 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Rationen enthalten reisetaugliche Nahrung wie Trockenfleisch, Trockenfrüchte, Zwieback und Nüsse. Nahrungsmangel führt zu Risiken, die unter „Unterernährung“ unter „Regelglossar“ aufgeführt sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Rations consist of travel-ready food, including jerky, dried fruit, hardtack, and nuts. See “Malnutrition” in “Rules Glossary” for the risks of not eating."
    }
   ]
  }
 },
 {
  "id": "robe-1-gp",
  "name": {
   "de": "Robe (1 GM)",
   "en": "Robe (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Robe hat eine berufliche oder zeremonielle Bedeutung. Manche Veranstaltungen und Orte können nur in Roben von bestimmter Farbe oder mit bestimmten Symbolen besucht werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Robe has vocational or ceremonial significance. Some events and locations admit only people wearing a Robe bearing certain colors or symbols."
    }
   ]
  }
 },
 {
  "id": "rope-1-gp",
  "name": {
   "de": "Seil (1 GM)",
   "en": "Rope (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Verwenden‑Aktion kannst du mit einem erfolgreichen SG‑10‑Geschicklichkeitswurf (Fingerfertigkeit) einen Knoten in ein Seil knüpfen. Das Seil kann mit einem erfolgreichen SG‑20‑Stärkewurf (Athletik) zerrissen werden. Du kannst eine Kreatur, die nicht bereitwillig ist, nur dann mit dem Seil fesseln, wenn die Kreatur gepackt, kampfunfähig oder festgesetzt ist. Werden die Beine der Kreatur gefesselt, so ist die Kreatur festgesetzt, bis sie entkommt. Um das Seil abzustreifen, muss die Kreatur als Aktion einen SG‑15‑Geschicklichkeitswurf (Akrobatik) bestehen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Utilize action, you can tie a knot with Rope if you succeed on a DC 10 Dexterity (Sleight of Hand) check. The Rope can be burst with a successful DC 20 Strength (Athletics) check. You can bind an unwilling creature with the Rope only if the creature has the Grappled, Incapacitated, or Restrained condition. If the creature’s legs are bound, the creature has the Restrained condition until it escapes. Escaping the Rope requires the creature to make a successful DC 15 Dexterity (Acrobatics) check as an action."
    }
   ]
  }
 },
 {
  "id": "sack-1-cp",
  "name": {
   "de": "Sack (1 KM)",
   "en": "Sack (1 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Sack fasst bis zu 15 Kilogramm in einem Volumen von 28 Litern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Sack holds up to 30 pounds within 1 cubic foot."
    }
   ]
  }
 },
 {
  "id": "scholar-s-pack-40-gp",
  "name": {
   "de": "Gelehrtenausrüstung (40 GM)",
   "en": "Scholar’s Pack (40 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Gelehrtenausrüstung enthält folgende Gegenstände: Buch, Lampe, zehn Flaschen Öl, zehn Bögen Pergament, Rucksack, Tinte, Tintenfüller und Zunderkästchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Scholar’s Pack contains the following items: Backpack, Book, Ink, Ink Pen, Lamp, 10 flasks of Oil, 10 sheets of Parchment, and Tinderbox."
    }
   ]
  }
 },
 {
  "id": "shovel-2-gp",
  "name": {
   "de": "Schaufel (2 GM)",
   "en": "Shovel (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit der Schaufel kannst du in einer Stunde Arbeit ein Loch von 1,5 Metern Kantenlänge in die Erde (oder vergleichbares Material) graben."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Working for 1 hour, you can use a Shovel to dig a hole that is 5 feet on each side in soil or similar material."
    }
   ]
  }
 },
 {
  "id": "signal-whistle-5-cp",
  "name": {
   "de": "Signalpfeife (5 KM)",
   "en": "Signal Whistle (5 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn eine Signalpfeife mit der Verwenden‑Aktion geblasen wird, erzeugt sie einen Ton, der 180 Meter weit zu hören ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When blown as a Utilize action, a Signal Whistle produces a sound that can be heard up to 600 feet away."
    }
   ]
  }
 },
 {
  "id": "spell-scroll-cantrip-30-gp-level-1-50-gp",
  "name": {
   "de": "Zauberschriftrolle (Zaubertrick: 30 GM, 1. Grad: 50 GM)",
   "en": "Spell Scroll (Cantrip, 30 GP; Level 1, 50 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Zauberschriftrolle (Zaubertrick) oder Zauberschriftrolle (1. Grad) ist ein magischer Gegenstand mit den Worten eines Zaubertricks beziehungsweise Zaubers des 1. Grades nach Wahl des Schöpfers der Schriftrolle. Wenn sich der Zauber in der Liste deiner Klasse befindet, kannst du die Schriftrolle lesen und den Zauber mit normalem Zeitaufwand wirken, ohne Materialkomponenten zu benötigen. Wenn der Zauber einen Rettungs ‑ oder Angriffswurf erfordert, beträgt der Zauberrettungswurf‑SG 13 und der Angriffsbonus +5. Die Schriftrolle löst sich auf, wenn der Zauber gewirkt wurde."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Spell Scroll (Cantrip) or Spell Scroll (Level 1) is a magic item that bears the words of a cantrip or level 1 spell, respectively, determined by the scroll’s creator. If the spell is on your class’s spell list, you can read the scroll and cast the spell using its normal casting time and without providing any Material components. If the spell requires a saving throw or an attack roll, the spell save DC is 13, and the attack bonus is +5. The scroll disintegrates when the casting is completed."
    }
   ]
  }
 },
 {
  "id": "spikes-iron-1-gp",
  "name": {
   "de": "Stachel, Eisen (1 GM)",
   "en": "Spikes, Iron (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eisenstachel gibt es in Bündeln zu je zehn Stück. Als Verwenden‑Aktion kannst du einen Eisenstachel mit einem stumpfen Gegenstand wie einem leichten Hammer in Holz, Erde oder ähnliches Material treiben. So kannst du eine Tür verrammeln, oder du kannst ein Seil oder eine Kette am Stachel befestigen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Iron Spikes come in bundles of ten. As a Utilize action, you can use a blunt object, such as a Light Hammer, to hammer a spike into wood, earth, or a similar material. You can do so to jam a door shut or to then tie a Rope or Chain to the Spike."
    }
   ]
  }
 },
 {
  "id": "spyglass-1-000-gp",
  "name": {
   "de": "Fernrohr (1.000 GM)",
   "en": "Spyglass (1,000 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Durch ein Fernrohr erscheint alles doppelt so groß."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Objects viewed through a Spyglass are magnified to twice their size."
    }
   ]
  }
 },
 {
  "id": "string-1-sp",
  "name": {
   "de": "Schnur (1 SM)",
   "en": "String (1 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Stück Schnur misst drei Meter. Du kannst als Verwenden‑Aktion einen Knoten in die Schnur knüpfen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "String is 10 feet long. You can tie a knot in it as a Utilize action."
    }
   ]
  }
 },
 {
  "id": "tent-2-gp",
  "name": {
   "de": "Zelt (2 GM)",
   "en": "Tent (2 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem Zelt können bis zu zwei kleine oder mittelgroße Kreaturen schlafen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Tent sleeps up to two Small or Medium creatures."
    }
   ]
  }
 },
 {
  "id": "tinderbox-5-sp",
  "name": {
   "de": "Zunderkästchen (5 SM)",
   "en": "Tinderbox (5 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Zunderkästchen ist ein kleiner Behälter mit Feuerstahl, Feuerstein und Zunder (meist ein ölgetränktes Stoffstück), um ein Feuer zu entfachen. Soll damit eine Fackel, eine Kerze, eine Lampe, eine Laterne oder ein anderer Gegenstand mit freiliegendem Brennstoff entzündet werden, so ist dafür eine Bonusaktion erforderlich. Das Entfachen jedes anderen Feuers dauert eine Minute."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Tinderbox is a small container holding flint, fire steel, and tinder (usually dry cloth soaked in light oil) used to kindle a fire. Using it to light a Candle, Lamp, Lantern, or Torch—or anything else with exposed fuel—takes a Bonus Action. Lighting any other fire takes 1 minute."
    }
   ]
  }
 },
 {
  "id": "torch-1-cp",
  "name": {
   "de": "Fackel (1 KM)",
   "en": "Torch (1 CP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Fackel brennt eine Stunde lang. Sie spendet in einem Radius von sechs Metern helles Licht und in einem Radius von weiteren sechs Metern dämmriges Licht. Mithilfe der Angriffsaktion kannst du mit der Fackel angreifen, wobei du sie als einfache Nahkampfwaffe verwendest. Bei einem Treffer erleidet das Ziel 1 Feuerschaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Torch burns for 1 hour, casting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. When you take the Attack action, you can attack with the Torch, using it as a Simple Melee weapon. On a hit, the target takes 1 Fire damage."
    }
   ]
  }
 },
 {
  "id": "vial-1-gp",
  "name": {
   "de": "Phiole (1 GM)",
   "en": "Vial (1 GP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Phiole fasst bis zu 120 Milliliter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Vial holds up to 4 ounces."
    }
   ]
  }
 },
 {
  "id": "waterskin-2-sp",
  "name": {
   "de": "Trinkschlauch (2 SM)",
   "en": "Waterskin (2 SP)"
  },
  "abschnitt": {
   "de": "Abenteurerausrüstung",
   "en": "Adventuring Gear"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Trinkschlauch fasst bis zu zwei Liter. Wenn du nicht genügend Wasser trinkst, riskierst du Dehydrierung (siehe „Regelglossar“)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Waterskin holds up to 4 pints. If you don’t drink sufficient water, you risk dehydration (see “Rules Glossary”)."
    }
   ]
  }
 },
 {
  "id": "mounts-and-vehicles",
  "name": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit einem Reittier kannst du schneller durch die Wildnis gelangen. Sein Hauptzweck besteht allerdings darin, Ausrüstung zu tragen, die dich sonst verlangsamen würde. In der Tabelle „Reittiere und andere Tiere“ sind Bewegungsraten und Traglast‑Grundwerte der Tiere aufgeführt. Die Wertekästen der Tiere findest du unter „Monster“."
    },
    {
     "typ": "tabelle",
     "titel": "Reittiere und andere Tiere",
     "kopf": [
      "Gegenstand",
      "Traglast",
      "Kosten"
     ],
     "reihen": [
      [
       "Dogge",
       "97,5 kg",
       "25 GM"
      ],
      [
       "Elefant",
       "660 kg",
       "200 GM"
      ],
      [
       "Kamel",
       "225 kg",
       "50 GM"
      ],
      [
       "Maultier",
       "210 kg",
       "8 GM"
      ],
      [
       "Pony",
       "112,5 kg",
       "30 GM"
      ],
      [
       "Reitpferd",
       "240 kg",
       "75 GM"
      ],
      [
       "Streitross",
       "270 kg",
       "400 GM"
      ],
      [
       "Zugpferd",
       "270 kg",
       "50 GM"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Sattel und Zaumzeug, Geschirr und Fuhrwerke",
     "kopf": [
      "Gegenstand",
      "Gewicht",
      "Kosten"
     ],
     "reihen": [
      [
       "Futter (pro Tag)",
       "5 kg",
       "5 KM"
      ],
      [
       "Karren",
       "100 kg",
       "15 GM"
      ],
      [
       "Kutsche",
       "300 kg",
       "100 GM"
      ],
      [
       "Sattel",
       "",
       ""
      ],
      [
       "Exotischer Sattel",
       "20 kg",
       "60 GM"
      ],
      [
       "Militärsattel",
       "15 kg",
       "20 GM"
      ],
      [
       "Reitsattel",
       "12,5 kg",
       "10 GM"
      ],
      [
       "Schlitten",
       "150 kg",
       "20 GM"
      ],
      [
       "Stallmiete (pro Tag)",
       "−",
       "5 SM"
      ],
      [
       "Streitwagen",
       "50 kg",
       "250 GM"
      ],
      [
       "Wagen",
       "200 kg",
       "35 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A mount can help you move more quickly through the wilderness, but its primary purpose is to carry gear that would otherwise slow you down. The Mounts and Other Animals table shows each animal’s carrying capacity. See “Monsters” for the animals’ stat blocks."
    },
    {
     "typ": "tabelle",
     "titel": "Mounts and Other Animals",
     "kopf": [
      "Item",
      "Carrying Capacity",
      "Cost"
     ],
     "reihen": [
      [
       "Camel",
       "450 lb.",
       "50 GP"
      ],
      [
       "Elephant",
       "1,320 lb.",
       "200 GP"
      ],
      [
       "Horse, Draft",
       "540 lb.",
       "50 GP"
      ],
      [
       "Horse, Riding",
       "480 lb.",
       "75 GP"
      ],
      [
       "Mastiff",
       "195 lb.",
       "25 GP"
      ],
      [
       "Mule",
       "420 lb.",
       "8 GP"
      ],
      [
       "Pony",
       "225 lb.",
       "30 GP"
      ],
      [
       "Warhorse",
       "540 lb.",
       "400 GP"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Tack, Harness, and Drawn Vehicles",
     "kopf": [
      "Item",
      "Weight",
      "Cost"
     ],
     "reihen": [
      [
       "Carriage",
       "600 lb.",
       "100 GP"
      ],
      [
       "Cart",
       "200 lb.",
       "15 GP"
      ],
      [
       "Chariot",
       "100 lb.",
       "250 GP"
      ],
      [
       "Feed per day",
       "10 lb.",
       "5 CP"
      ],
      [
       "Saddle",
       "",
       ""
      ],
      [
       "Exotic",
       "40 lb.",
       "60 GP"
      ],
      [
       "Military",
       "30 lb.",
       "20 GP"
      ],
      [
       "Riding",
       "25 lb.",
       "10 GP"
      ],
      [
       "Sled",
       "300 lb.",
       "20 GP"
      ],
      [
       "Stabling per day",
       "—",
       "5 SP"
      ],
      [
       "Wagon",
       "400 lb.",
       "35 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "mounts-and-cargo",
  "name": {
   "de": "Reittiere und Lasten",
   "en": "Mounts and Cargo"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Als Zugtier einer Kutsche, eines Karrens, Streitwagens, Schlittens oder Wagens kann ein Tier höchstens das Fünffache seiner Grundtraglast ziehen. Wenn mehrere Tiere dasselbe Fahrzeug ziehen, wird ihre Traglast addiert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An animal pulling a carriage, cart, chariot, sled, or wagon can move weight up to five times its base carrying capacity, including the weight of the vehicle. If multiple animals pull the same vehicle, add their carrying capacities together."
    }
   ]
  }
 },
 {
  "id": "barding",
  "name": {
   "de": "Rossharnisch",
   "en": "Barding"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Rossharnisch ist eine Rüstung für Reittiere. Alle in der Tabelle „Rüstung“ unter „Ausrüstung“ aufgeführten Rüstungen sind auch als Rossharnische erhältlich. Sie kosten viermal so viel wie die normalen Versionen und wiegen doppelt so viel."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Barding is armor designed for a mount. Any type of armor on the Armor table in “Equipment” can be purchased as barding. The cost is four times the normal cost, and it weighs twice as much."
    }
   ]
  }
 },
 {
  "id": "saddles",
  "name": {
   "de": "Sättel",
   "en": "Saddles"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Zu einem Sattel gehört Zaumzeug und jede sonstige Ausrüstung, die zum Verwenden des Sattels erforderlich ist. Mit einem Militärsattel bist du bei allen Attributswürfen im Vorteil, die du ausführst, um dich auf dem Reittier zu halten. Bei Wasserreittieren oder fliegenden Reittieren sind exotische Sättel erforderlich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A saddle comes with a bit, a bridle, reins, and any other equipment needed to use the saddle. A Military Saddle gives Advantage on any ability check you make to remain mounted. An Exotic Saddle is required for riding an aquatic or a flying mount."
    }
   ]
  }
 },
 {
  "id": "large-vehicles",
  "name": {
   "de": "Große Fahrzeuge",
   "en": "Large Vehicles"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In der Tabelle „Luft- und Wasserfahrzeuge“ findest du Spielwerte für verschiedene Arten von großen Fahrzeugen. Es gelten folgende Anmerkungen:"
    },
    {
     "typ": "tabelle",
     "titel": "Luft- und Wasserfahrzeuge",
     "kopf": [
      "Schiff",
      "Bewegungsrate",
      "Besatzung",
      "Passagiere",
      "Fracht (Tonnen)",
      "RK",
      "TP",
      "Schadensschwellenwert",
      "Kosten"
     ],
     "reihen": [
      [
       "Galeere",
       "6,4 km/h",
       "80",
       "−",
       "150",
       "15",
       "500",
       "20",
       "30.000 GM"
      ],
      [
       "Kielboot",
       "1,6 km/h",
       "1",
       "6",
       "1/2",
       "15",
       "100",
       "10",
       "3.000 GM"
      ],
      [
       "Kriegsschiff",
       "4 km/h",
       "60",
       "60",
       "200",
       "15",
       "500",
       "20",
       "25.000 GM"
      ],
      [
       "Langschiff",
       "4,8 km/h",
       "40",
       "150",
       "10",
       "15",
       "300",
       "15",
       "10.000 GM"
      ],
      [
       "Luftschiff",
       "12,8 km/h",
       "10",
       "20",
       "1",
       "13",
       "300",
       "−",
       "40.000 GM"
      ],
      [
       "Ruderboot",
       "2,4 km/h",
       "1",
       "3",
       "−",
       "11",
       "50",
       "−",
       "50 GM"
      ],
      [
       "Segelschiff",
       "3,2 km/h",
       "20",
       "20",
       "100",
       "15",
       "300",
       "15",
       "10.000 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The Airborne and Waterborne Vehicles table provides statistics for various types of large vehicles. The following notes apply."
    },
    {
     "typ": "tabelle",
     "titel": "Airborne and Waterborne Vehicles",
     "kopf": [
      "Ship",
      "Speed",
      "Crew",
      "Passengers",
      "Cargo (Tons)",
      "AC",
      "HP",
      "Damage Threshold",
      "Cost"
     ],
     "reihen": [
      [
       "Airship",
       "8 mph",
       "10",
       "20",
       "1",
       "13",
       "300",
       "—",
       "40,000 GP"
      ],
      [
       "Galley",
       "4 mph",
       "80",
       "—",
       "150",
       "15",
       "500",
       "20",
       "30,000 GP"
      ],
      [
       "Keelboat",
       "1 mph",
       "1",
       "6",
       "1/2",
       "15",
       "100",
       "10",
       "3,000 GP"
      ],
      [
       "Longship",
       "3 mph",
       "40",
       "150",
       "10",
       "15",
       "300",
       "15",
       "10,000 GP"
      ],
      [
       "Rowboat",
       "1½ mph",
       "1",
       "3",
       "—",
       "11",
       "50",
       "—",
       "50 GP"
      ],
      [
       "Sailing Ship",
       "2 mph",
       "20",
       "20",
       "100",
       "15",
       "300",
       "15",
       "10,000 GP"
      ],
      [
       "Warship",
       "2½ mph",
       "60",
       "60",
       "200",
       "15",
       "500",
       "20",
       "25,000 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "speed",
  "name": {
   "de": "Bewegungsrate",
   "en": "Speed"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Schiff, das gegen starken Wind ansegelt, hat nur seine halbe Bewegungsrate. Bei Flaute können Segelschiffe sich nicht unter Segel fortbewegen und müssen gerudert werden. Auf Seen und Flüssen werden Kiel‑ und Ruderboote verwendet. Wenn du stromabwärts fährst, fügst du der Bewegungsrate des Fahrzeugs die Strömungsgeschwindigkeit (üblicherweise 4,8 Kilometer pro Stunde) hinzu. Mit Kiel‑ und Ruderbooten kannst du nicht gegen starke Strömungen anrudern, aber sie können von Zugtieren am Ufer stromaufwärts gezogen werden. Ein Ruderboot kann getragen werden und wiegt 50 Kilogramm."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A ship sailing against a strong wind moves at half speed. In a dead calm (no wind), waterborne ships can’t move under sail and must be rowed. Keelboats and Rowboats are used on lakes and rivers. If going downstream, add the speed of the current (typically 3 miles per hour) to the speed of the vehicle. These vehicles can’t be rowed against any significant current, but they can be pulled upstream by draft animals on the shores. A Rowboat can be carried and weighs 100 pounds."
    }
   ]
  }
 },
 {
  "id": "crew",
  "name": {
   "de": "Besatzung",
   "en": "Crew"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Schiffe, die größer als Kiel ‑ und Ruderboote sind, benötigen eine Besatzung aus fachkundigen Mietlingen (siehe „Mietlinge“ weiter hinten unter „Ausrüstung“), um verwendet werden zu können. Deren jeweils erforderliche Mindestanzahl hängt von der Art des Schiffs ab, wie in der Tabelle dargestellt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A ship larger than a Keelboat or Rowboat needs a crew of skilled hirelings (see “Hirelings” later in “Equipment”) to function. The minimum number of skilled hirelings needed to crew a ship depends on the type of ship, as shown in the table."
    }
   ]
  }
 },
 {
  "id": "passengers",
  "name": {
   "de": "Passagiere",
   "en": "Passengers"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In der Tabelle ist die Anzahl von kleinen und mittelgroßen Passagieren aufgeführt, die mithilfe von Hängematten auf einem Schiff unterkommen können. Schiffe mit Privatkabinen können nur ein Fünftel der Passagiere befördern. Ein Passagier zahlt normalerweise 5 SM pro Tag für eine Hängematte. Die Preise variieren jedoch von Schiff zu Schiff. Eine kleine Privatkabine kostet normalerweise 2 GM pro Tag."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The table lists the number of Small and Medium passengers the ship can accommodate using hammocks. A ship outfitted with private accommodations can carry one-fifth as many passengers. A passenger usually pays 5 SP per day for a hammock, but prices can vary from ship to ship. A small private cabin usually costs 2 GP per day."
    }
   ]
  }
 },
 {
  "id": "damage-threshold",
  "name": {
   "de": "Schadensschwellenwert",
   "en": "Damage Threshold"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn ein Fahrzeug einen Schadensschwellenwert (siehe „Regelglossar“) hat, ist dieser in der Tabelle angegeben."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If a vehicle has a damage threshold (see “Rules Glossary”), it’s noted in the table."
    }
   ]
  }
 },
 {
  "id": "ship-repair",
  "name": {
   "de": "Schiffsreparatur",
   "en": "Ship Repair"
  },
  "abschnitt": {
   "de": "Reittiere und Fahrzeuge",
   "en": "Mounts and Vehicles"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein beschädigtes Schiff kann repariert werden, wenn es in einem Hafen liegt. Jeder zu reparierende Trefferpunkt erfordert einen Tag und kostet 20 GM für Material und Arbeitskraft. Wenn die Reparatur an einem Ort ausgeführt wird, an dem es reichlich Material und fachkundige Arbeiter gibt, beispielsweise in einer städtischen Werft, sind Reparaturdauer und ‑ kosten halbiert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Repairs to a damaged ship can be made while the vessel is berthed. Repairing 1 Hit Point of damage requires 1 day and costs 20 GP for materials and labor. If the repairs are made in a location where supplies and skilled labor are abundant, such as a city shipyard, the repair time and cost are halved."
    }
   ]
  }
 },
 {
  "id": "lifestyle-expenses",
  "name": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Lebenshaltungskosten sind die Kosten, die für das Dasein in einer Fantasy‑Welt anfallen. Sie umfassen Unterbringung, Nahrung, Ausrüstungspflege und andere alltägliche Erfordernisse. Zu Beginn jeder Woche oder jedes Monats (nach Wahl des SL) wählst du einen der Lebensstile unten aus – Jämmerlich, Ärmlich, Schlecht, Einfach, Komfortabel, Wohlhabend oder Edel – und zahlst den entsprechenden Preis. Ein Lebensstil hat an sich keine Konsequenzen, doch der SL kann ihn berücksichtigen, wenn er Risiken oder den Eindruck deines Charakters auf andere bestimmt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Lifestyle expenses summarize the cost of living in a fantasy world. They cover lodging, food, equipment maintenance, and other necessities. At the start of each week or month (GM’s choice), choose a lifestyle below—Wretched, Squalid, Poor, Modest, Comfortable, Wealthy, or Aristocratic—and pay the price to sustain that lifestyle. Lifestyles have no inherent consequences, but the GM might take them into account when determining risks or how others perceive your character."
    }
   ]
  }
 },
 {
  "id": "wretched-free",
  "name": {
   "de": "Jämmerlich (gratis)",
   "en": "Wretched (Free)"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du überlebst durch Zufall und Mildtätigkeit. Oft bist du Naturgefahren ausgesetzt, weil du draußen schläfst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You survive via chance and charity. You’re often exposed to natural dangers as a result of sleeping outside."
    }
   ]
  }
 },
 {
  "id": "squalid-1-sp-per-day",
  "name": {
   "de": "Ärmlich (1 SM pro Tag)",
   "en": "Squalid (1 SP per Day)"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du gibst das Minimum für deine grundlegendsten Bedürfnisse aus. Dabei könntest du ungesunden Bedingungen und Gelegenheitsverbrechern ausgesetzt sein."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You spend the bare minimum for your necessities. You might be exposed to unhealthy conditions and opportunistic criminals."
    }
   ]
  }
 },
 {
  "id": "poor-2-sp-per-day",
  "name": {
   "de": "Schlecht (2 SM pro Tag)",
   "en": "Poor (2 SP per Day)"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kümmerst dich sparsam um deine Bedürfnisse."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You spend frugally for your necessities."
    }
   ]
  }
 },
 {
  "id": "modest-1-gp-per-day",
  "name": {
   "de": "Einfach (1 GM pro Tag)",
   "en": "Modest (1 GP per Day)"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du leistest dir einen durchschnittlichen Lebensstil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You support yourself at an average level."
    }
   ]
  }
 },
 {
  "id": "comfortable-2-gp-per-day",
  "name": {
   "de": "Komfortabel (2 GM pro Tag)",
   "en": "Comfortable (2 GP per Day)"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst problemlos für dich aufkommen und leistest dir den einen oder anderen Luxus."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You spend modestly for your necessities and enjoy a few luxuries."
    }
   ]
  }
 },
 {
  "id": "wealthy-4-gp-per-day",
  "name": {
   "de": "Wohlhabend (4 GM pro Tag)",
   "en": "Wealthy (4 GP per Day)"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du bist an die feineren Seiten des Lebens gewöhnt und hast möglicherweise Bedienstete."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You’re accustomed to the finer things in life and might have servants."
    }
   ]
  }
 },
 {
  "id": "aristocratic-10-gp-per-day",
  "name": {
   "de": "Edel (10 GM pro Tag)",
   "en": "Aristocratic (10 GP per Day)"
  },
  "abschnitt": {
   "de": "Lebenshaltungskosten",
   "en": "Lifestyle Expenses"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du zahlst für das Beste und hast wahrscheinlich Personal, das deinen üppigen Lebensstil ermöglicht. Andere bemerken deinen Reichtum und könnten darauf dringen, dass du ihn teilst – auf legale oder andere Weise."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You pay for the best and might have a staff that supports your lifestyle. Others notice your wealth and might encourage you to share it, either legally or otherwise."
    }
   ]
  }
 },
 {
  "id": "food-drink-and-lodging",
  "name": {
   "de": "Essen, Trinken und Unterkunft",
   "en": "Food, Drink, and Lodging"
  },
  "abschnitt": {
   "de": "Essen, Trinken und Unterkunft",
   "en": "Food, Drink, and Lodging"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In der Tabelle „Essen, Trinken und Unterkunft“ sind die Preise von Unterkünften pro Nacht sowie von Nahrungsmitteln aufgeführt. Die Kosten für Unterkunft und Verpflegung sind in deinen Lebenshaltungskosten enthalten."
    },
    {
     "typ": "tabelle",
     "titel": "Essen, Trinken und Unterkunft",
     "kopf": [
      "Gegenstand",
      "Kosten"
     ],
     "reihen": [
      [
       "Bier (Humpen)",
       "4 KM"
      ],
      [
       "Brot (Laib)",
       "2 KM"
      ],
      [
       "Gasthaus (pro Nacht)",
       ""
      ],
      [
       "Ärmlich",
       "7 KM"
      ],
      [
       "Schlecht",
       "1 SM"
      ],
      [
       "Einfach",
       "5 SM"
      ],
      [
       "Komfortabel",
       "8 SM"
      ],
      [
       "Wohlhabend",
       "2 GM"
      ],
      [
       "Edel",
       "4 GM"
      ],
      [
       "Käse (Ecke)",
       "1 SM"
      ],
      [
       "Mahlzeit",
       ""
      ],
      [
       "Ärmlich",
       "1 KM"
      ],
      [
       "Schlecht",
       "2 KM"
      ],
      [
       "Einfach",
       "1 SM"
      ],
      [
       "Komfortabel",
       "2 SM"
      ],
      [
       "Wohlhabend",
       "3 SM"
      ],
      [
       "Edel",
       "6 SM"
      ],
      [
       "Wein (Flasche)",
       ""
      ],
      [
       "Gemeinsprache",
       "2 SM"
      ],
      [
       "Fein",
       "10 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The Food, Drink, and Lodging table gives prices for food and a single night’s lodging. Prices for daily lodging and meals are included in your lifestyle’s expenses."
    },
    {
     "typ": "tabelle",
     "titel": "Food, Drink, and Lodging",
     "kopf": [
      "Item",
      "Cost"
     ],
     "reihen": [
      [
       "Ale (mug)",
       "4 CP"
      ],
      [
       "Bread (loaf)",
       "2 CP"
      ],
      [
       "Cheese (wedge)",
       "1 SP"
      ],
      [
       "Inn Stay per Day",
       ""
      ],
      [
       "Squalid",
       "7 CP"
      ],
      [
       "Poor",
       "1 SP"
      ],
      [
       "Modest",
       "5 SP"
      ],
      [
       "Comfortable",
       "8 SP"
      ],
      [
       "Wealthy",
       "2 GP"
      ],
      [
       "Aristocratic",
       "4 GP"
      ],
      [
       "Meal",
       ""
      ],
      [
       "Squalid",
       "1 CP"
      ],
      [
       "Poor",
       "2 CP"
      ],
      [
       "Modest",
       "1 SP"
      ],
      [
       "Comfortable",
       "2 SP"
      ],
      [
       "Wealthy",
       "3 SP"
      ],
      [
       "Aristocratic",
       "6 SP"
      ],
      [
       "Wine (bottle)",
       ""
      ],
      [
       "Common",
       "2 SP"
      ],
      [
       "Fine",
       "10 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "hirelings",
  "name": {
   "de": "Mietlinge",
   "en": "Hirelings"
  },
  "abschnitt": {
   "de": "Mietlinge",
   "en": "Hirelings"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wer angeheuert wird, um eine Aufgabe auszuführen, die Übung im Umgang mit Waffen, Werkzeugen oder Fertigkeiten erfordert, ist ein fachkundiger Mietling. Dazu gehören Söldner, Handwerker, Schreiber und so weiter. Die in der Tabelle „Mietlinge“ aufgeführten Preise sind Mindestpreise – manche Spezialisten verlangen mehr. Mietlinge ohne Fachkunde werden für Arbeiten angeheuert, die keine besonderen Kenntnisse erfordern. Dazu gehören Arbeiter und Gepäckträger."
    },
    {
     "typ": "tabelle",
     "titel": "Mietlinge",
     "kopf": [
      "Dienstleistung",
      "Kosten"
     ],
     "reihen": [
      [
       "Fachkundiger Mietling",
       "2 GM pro Tag"
      ],
      [
       "Mietling ohne Fachkunde",
       "2 SM pro Tag"
      ],
      [
       "Bote",
       "2 KM pro 1,6 km"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Skilled hirelings include anyone hired to perform a service that involves a proficiency (including weapon, tool, or skill): a mercenary, an artisan, a scribe, or the like. The pay shown on the Hirelings table is a minimum; some expert hirelings require more pay. Untrained hirelings are hired for work that requires no particular proficiencies; they include laborers and porters."
    },
    {
     "typ": "tabelle",
     "titel": "Hirelings",
     "kopf": [
      "Service",
      "Cost"
     ],
     "reihen": [
      [
       "Skilled hireling",
       "2 GP per day"
      ],
      [
       "Untrained hireling",
       "2 SP per day"
      ],
      [
       "Messenger",
       "2 CP per mile"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "spellcasting",
  "name": {
   "de": "Zauberwirken",
   "en": "Spellcasting"
  },
  "abschnitt": {
   "de": "Zauberwirken",
   "en": "Spellcasting"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In den meisten Siedlungen gibt es Personen, die bereit sind, gegen Bezahlung Zauber zu wirken. Wenn ein Zauber teure Komponenten hat, füge die Kosten für diese Komponenten den in der Tabelle „Zauberwirken‑Dienstleistungen“ aufgeführten Kosten hinzu. Je höher der Grad des gewünschten Zaubers ist, desto schwieriger ist es, jemanden zu finden, der ihn wirken kann."
    },
    {
     "typ": "tabelle",
     "titel": "Zauberwirken-Dienstleistungen",
     "kopf": [
      "Zaubergrad",
      "Verfügbarkeit",
      "Kosten"
     ],
     "reihen": [
      [
       "Zaubertrick",
       "Dorf, Kleinstadt oder Stadt",
       "30 GM"
      ],
      [
       "1",
       "Dorf, Kleinstadt oder Stadt",
       "50 GM"
      ],
      [
       "2",
       "Dorf, Kleinstadt oder Stadt",
       "200 GM"
      ],
      [
       "3",
       "Nur Kleinstadt oder Stadt",
       "300 GM"
      ],
      [
       "4–5",
       "Nur Kleinstadt oder Stadt",
       "2.000 GM"
      ],
      [
       "6–8",
       "Nur Stadt",
       "20.000 GM"
      ],
      [
       "9",
       "Nur Stadt",
       "100.000 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Most settlements contain individuals who are willing to cast spells in exchange for payment. If a spell has expensive components, add the cost of those components to the cost listed in the Spellcasting Services table. The higher the level of a desired spell, the harder it is to find someone to cast it."
    },
    {
     "typ": "tabelle",
     "titel": "Spellcasting Services",
     "kopf": [
      "Spell Level",
      "Availability",
      "Cost"
     ],
     "reihen": [
      [
       "Cantrip",
       "Village, town, or city",
       "30 GP"
      ],
      [
       "1",
       "Village, town, or city",
       "50 GP"
      ],
      [
       "2",
       "Village, town, or city",
       "200 GP"
      ],
      [
       "3",
       "Town or city only",
       "300 GP"
      ],
      [
       "4–5",
       "Town or city only",
       "2,000 GP"
      ],
      [
       "6–8",
       "City only",
       "20,000 GP"
      ],
      [
       "9",
       "City only",
       "100,000 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "magic-items",
  "name": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In jedem Abenteuer gibt es möglicherweise – nicht garantiert – magische Gegenstände zu finden. Unter „Magische Gegenstände“ weiter hinten in diesem Dokument werden Hunderte magische Gegenstände beschrieben. Im Folgenden erfährst du, was du über den Umgang mit magischen Gegenständen wissen musst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Adventures hold the promise—but not a guarantee—of finding magic items. Hundreds of magic items are detailed in “Magic Items” later in this document. Here’s what you need to know about using magic items."
    }
   ]
  }
 },
 {
  "id": "identifying-a-magic-item",
  "name": {
   "de": "Einen magischen Gegenstand identifizieren",
   "en": "Identifying a Magic Item"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Manche magischen Gegenstände sind nicht von ihren nichtmagischen Gegenstücken zu unterscheiden. Andere sind auf den ersten Blick als magisch zu erkennen. Wenn du einen magischen Gegenstand in die Hand nimmst, bemerkst du, dass er außergewöhnlich ist, jedoch erfährst du seine magischen Eigenschaften nicht automatisch. Der Zauber Identifizieren ist die schnellste Methode, die Eigenschaften eines Gegenstands zu enthüllen. Alternativ kannst du dich bei einer kurzen Rast auf einen magischen Gegenstand konzentrieren, während du physischen Kontakt mit ihm hast. Am Ende der Rast sind dir seine Eigenschaften und deren Verwendung (jedoch keine Flüche, die er möglicherweise trägt) bekannt. Manchmal trägt ein magischer Gegenstand Hinweise auf seine Eigenschaften. Das Befehlswort zum Aktivieren eines Rings könnte in seine Innenseite graviert sein, oder der Ring ist mit Federmustern geschmückt, um darauf hinzuweisen, dass es sich um einen Ring des Federfalls handelt. Auch das Tragen eines Gegenstands sowie das Experimentieren damit kann Hinweise auf seine Eigenschaften liefern. Tränke sind ein Sonderfall: Hier genügt eine kleine Geschmacksprobe, um die Wirkung eines Tranks zu erkennen. Mit anderen Gegenständen muss möglicherweise mehr experimentiert werden. Beispiel: Wenn dein Charakter einen Ring des Schwimmens anlegt, könnte der SL sagen: „Deine Bewegungen fühlen sich eigenartig flüssig an.“ Vielleicht springst du nun in einen Fluss, um zu erfahren, was geschieht. Der SL könnte dann anmerken, dass du unerwartet gut schwimmst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Some magic items are indistinguishable from their nonmagical counterparts, while others are conspicuously magical. Handling a magic item is enough to give you a sense that it is extraordinary, but learning a magic item’s properties isn’t automatic. The Identify spell is the fastest way to reveal an item’s properties. Alternatively, you can focus on one magic item during a Short Rest while being in physical contact with the item. At the end of the rest, you learn its properties and how to use them (but not any curse the item might bear). Sometimes a magic item carries a clue to its properties. The command word to activate a ring might be etched inside the band, or a feathered design might hint that it’s a Ring of Feather Falling. Wearing or experimenting with an item can also offer hints about its properties. In the specific case of Potions, a little taste is enough to tell the taster what a potion does. Other items might require more experimentation. For example, if your character puts on a Ring of Swimming, the GM might say, “Your movement feels strangely fluid.” Perhaps you then dive into a river to see what happens. The GM would then say you swim unexpectedly well."
    }
   ]
  }
 },
 {
  "id": "attunement",
  "name": {
   "de": "Einstimmung",
   "en": "Attunement"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Manche magischen Gegenstände erfordern, dass eine bestimmte Bindung an sie hergestellt wird, ehe ihre magischen Eigenschaften genutzt werden können: Dies ist die sogenannte Einstimmung. Ohne Einstimmung auf einen Gegenstand, der Einstimmung erfordert, sind nur dessen nichtmagische Vorzüge verfügbar, sofern in der Beschreibung nicht anders angegeben. Beispielsweise bietet ein magischer Schild, der Einstimmung erfordert, einer nicht eingestimmten Kreatur die Vorzüge eines normalen Schilds, jedoch keine seiner magischen Eigenschaften."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Some magic items require a creature to form a bond—called Attunement—with them before the creature can use an item’s magical properties. Without becoming attuned to an item that requires Attunement, you gain only its nonmagical benefits unless its description states otherwise. For example, a magic Shield that requires Attunement provides the benefits of a normal Shield if you aren’t attuned to it, but none of its magical properties."
    }
   ]
  }
 },
 {
  "id": "attune-during-a-short-rest",
  "name": {
   "de": "Einstimmen während einer kurzen Rast",
   "en": "Attune during a Short Rest"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Zum Einstimmen auf einen Gegenstand musst du eine kurze Rast mit dem Gegenstand verbringen und dich ausschließlich auf ihn konzentrieren, während du in physischem Kontakt mit ihm bist. Die kurze Rast kann nicht dieselbe sein wie die, in der du die Eigenschaften des Gegenstands erfahren hast. Die Konzentration auf den Gegenstand kann bei einer Waffe aus Training, bei einem Zauberstab aus Meditation oder aus einer sonstigen jeweils passenden Aktivität bestehen. Wenn die kurze Rast unterbrochen wird, misslingt die Einstimmung. Anderenfalls bist du am Ende der kurzen Rast auf den magischen Gegenstand eingestimmt und kannst auf all seine magischen Fähigkeiten zugreifen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Attuning to an item requires you to spend a Short Rest focused on only that item while being in physical contact with it (this can’t be the same Short Rest used to learn the item’s properties). This focus can take the form of weapon practice (for a Weapon), meditation (for a Wand), or some other appropriate activity. If the Short Rest is interrupted, the Attunement attempt fails. Otherwise, at the end of the Short Rest, you’re attuned to the magic item and can access its full magical capabilities."
    }
   ]
  }
 },
 {
  "id": "no-more-than-three-items",
  "name": {
   "de": "Höchstens drei Gegenstände",
   "en": "No More Than Three Items"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst auf höchstens drei magische Gegenstände zugleich eingestimmt sein. Jeder Versuch, sich auf einen vierten Gegenstand einzustimmen, misslingt: Du musst zuerst deine Einstimmung auf einen der drei Gegenstände beenden. Außerdem kannst du dich auf höchstens ein Exemplar eines Gegenstands einstimmen. Es ist dir beispielsweise nicht möglich, dich auf jeweils mehr als einen Ring des Schutzes einzustimmen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can be attuned to no more than three magic items at a time. Any attempt to attune to a fourth item fails; you must end your Attunement to an item first. Additionally, you can’t attune to more than one copy of an item. For example, you can’t attune to more than one Ring of Protection at a time."
    }
   ]
  }
 },
 {
  "id": "ending-attunement",
  "name": {
   "de": "Einstimmung beenden",
   "en": "Ending Attunement"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Deine Einstimmung auf einen Gegenstand endet, wenn du die Voraussetzungen für die Einstimmung nicht mehr erfüllst, wenn der Gegenstand mindestens 24 Stunden lang weiter als 30 Meter von dir entfernt ist, wenn du stirbst oder wenn sich eine andere Kreatur auf den Gegenstand einstimmt. Sofern der Gegenstand nicht verflucht ist, kannst du die Einstimmung auch freiwillig beenden, indem du eine weitere kurze Rast damit verbringst, dich auf den Gegenstand zu konzentrieren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Your Attunement to an item ends if you no longer satisfy the prerequisites for Attunement, if the item has been more than 100 feet away for at least 24 hours, if you die, or if another creature attunes to the item. You can also voluntarily end Attunement by spending another Short Rest focused on the item unless the item is cursed."
    }
   ]
  }
 },
 {
  "id": "wearing-and-wielding-items",
  "name": {
   "de": "Gegenstände tragen und führen",
   "en": "Wearing and Wielding Items"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Zum Nutzen seiner Eigenschaften muss ein magischer Gegenstand möglicherweise getragen oder geführt werden. Wenn er getragen werden muss, dann muss dies auf die vorgesehene Weise geschehen: Stiefel gehören an die Füße, Handschuhe an die Hände, Hüte und Helme auf den Kopf, Ringe an die Finger. Eine magische Rüstung muss angelegt, ein Schild an den Arm geschnallt, ein Umhang um die Schultern gelegt werden. Eine Waffe muss gehalten werden. Die meisten magischen Gegenstände, die getragen werden sollen, passen unabhängig von Größe und Körperbau zu jeder Kreatur. Magische Kleidungsstücke können beispielsweise problemlos angepasst werden oder tun dies sogar auf magische Art selbst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Using a magic item’s properties might mean wearing or wielding it. A magic item meant to be worn must be donned in the intended fashion: boots go on feet, gloves on hands, hats and helmets on a head, and rings on a finger. Magic armor must be donned, a Shield strapped to the arm, a cloak fastened about the shoulders. A weapon must be held. In most cases, a magic item that’s meant to be worn can fit a creature regardless of size or build. Magic garments are made to be easily adjustable, or they magically adjust themselves to the wearer."
    }
   ]
  }
 },
 {
  "id": "multiple-items-of-the-same-kind",
  "name": {
   "de": "Mehrere gleichartige Gegenstände",
   "en": "Multiple Items of the Same Kind"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von bestimmten magischen Gegenständen kannst du jeweils höchstens einen tragen. Normalerweise kannst du nur ein Paar Schuhe, ein Paar Handschuhe oder Panzerhandschuhe, ein Paar Armschienen, eine Rüstung, eine Kopfbedeckung und einen Umhang tragen. Der SL könnte Ausnahmen machen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can’t wear more than one of certain magic items. You can’t normally wear more than one pair of footwear, one pair of gloves or gauntlets, one pair of bracers, one suit of armor, one item of headwear, or one cloak. The GM might make exceptions."
    }
   ]
  }
 },
 {
  "id": "paired-items",
  "name": {
   "de": "Paarweise Gegenstände",
   "en": "Paired Items"
  },
  "abschnitt": {
   "de": "Magische Gegenstände",
   "en": "Magic Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Paarweise Gegenstände wie Stiefel, Armschienen, Panzerhandschuhe und Handschuhe gewähren ihre Vorzüge nur dann, wenn beide Teile des Paars getragen werden. Wenn ein Charakter beispielsweise an einem Fuß einen Stiefel des Schreitens und Springens und am anderen einen Stiefel der Elfen trägt, erhält er von keinem einen Vorzug."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Items that come in pairs—such as boots, bracers, gauntlets, and gloves—impart their benefits only if both items of the pair are worn. For example, a character wearing a Boot of Striding and Springing on one foot and a Boot of Elvenkind on the other foot gains no benefit from either."
    }
   ]
  }
 },
 {
  "id": "crafting-nonmagical-items",
  "name": {
   "de": "Nichtmagische Gegenstände herstellen",
   "en": "Crafting Nonmagical Items"
  },
  "abschnitt": {
   "de": "Nichtmagische Gegenstände herstellen",
   "en": "Crafting Nonmagical Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Zum Herstellen von nichtmagischen Gegenständen brauchst du Werkzeuge, Rohmaterial und Zeit wie jeweils unten beschrieben. Wenn du die Voraussetzungen erfüllst, stellst du den Gegenstand her und kannst ihn verwenden oder zum normalen Preis verkaufen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "To craft a nonmagical item, you need tools, raw materials, and time, each of which is detailed below. If you meet the requirements, you make the item, and you can use it or sell it at its normal price."
    }
   ]
  }
 },
 {
  "id": "crafting-nonmagical-items-tools",
  "name": {
   "de": "Werkzeug",
   "en": "Tools"
  },
  "abschnitt": {
   "de": "Nichtmagische Gegenstände herstellen",
   "en": "Crafting Nonmagical Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Im Abschnitt „Werkzeug“ unter „Ausrüstung“ ist aufgeführt, welches Werkzeug zum Herstellen bestimmter Gegenstände erforderlich ist. Der SL legt fest, welches Werkzeug für nicht aufgeführte Gegenstände erforderlich sind. Du musst das erforderliche Werkzeug verwenden und Übung im Umgang damit haben, um den Gegenstand herzustellen. Wer dir hilft, muss ebenfalls Übung damit haben."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The “Tools” section of “Equipment” lists which tools are required to make certain items. The GM assigns required tools for items not listed there. You must use the required tool to make an item and have proficiency with that tool. Anyone who helps you must also have proficiency with it."
    }
   ]
  }
 },
 {
  "id": "raw-materials",
  "name": {
   "de": "Rohmaterial",
   "en": "Raw Materials"
  },
  "abschnitt": {
   "de": "Nichtmagische Gegenstände herstellen",
   "en": "Crafting Nonmagical Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Um einen Gegenstand herzustellen, brauchst du Rohmaterial im Wert seines halben Kaufpreises (abgerundet). Beispiel: Du brauchst Rohmaterial im Wert von 750 GM, um eine Ritterrüstung herzustellen, da sie einen Kaufpreis von 1.500 GM hat. Der SL bestimmt, ob passende Rohmaterialien verfügbar sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "To make an item, you need raw materials worth half its purchase cost (round down). For example, you need 750 GP of raw materials to make Plate Armor, which sells for 1,500 GP. The GM determines whether appropriate raw materials are available."
    }
   ]
  }
 },
 {
  "id": "time",
  "name": {
   "de": "Zeit",
   "en": "Time"
  },
  "abschnitt": {
   "de": "Nichtmagische Gegenstände herstellen",
   "en": "Crafting Nonmagical Items"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Um zu bestimmen, wie viele Tage (bei einer täglichen Arbeitszeit von acht Stunden) das Herstellen eines Gegenstands dauert, teilst du seinen Kaufpreis in GM durch zehn (runde angebrochene Tage auf). Beispiel: Du brauchst fünf Tage, um eine schwere Armbrust herzustellen, da sie einen Kaufpreis von 50 GM hat. Wenn es mehrere Tage dauert, einen Gegenstand herzustellen, muss es sich nicht um aufeinanderfolgende Tage handeln. Charaktere können zusammenarbeiten, um die Herstellungszeit zu verkürzen. Teile die zum Herstellen erforderliche Zeit durch die Anzahl von Charakteren, die am Gegenstand arbeiten. Normalerweise kann dir nur jeweils ein anderer Charakter helfen, doch der SL gestattet möglicherweise mehr Helfer."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "To determine how many days (working 8 hours a day) it takes to make an item, divide its purchase cost in GP by 10 (round a fraction up to a day). For example, you need 5 days to make a Heavy Crossbow, which sells for 50 GP. If an item requires multiple days, the days needn’t be consecutive. Characters can combine their efforts to shorten the crafting time. Divide the time needed to create an item by the number of characters working on it. Normally, only one other character can assist you, but the GM might allow more assistants."
    }
   ]
  }
 },
 {
  "id": "brewing-potions-of-healing",
  "name": {
   "de": "Heiltränke brauen",
   "en": "Brewing Potions of Healing"
  },
  "abschnitt": {
   "de": "Heiltränke brauen",
   "en": "Brewing Potions of Healing"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Charakter, der Übung im Umgang mit der Kräuterkundeausrüstung hat, kann einen Heiltrank herstellen. Dazu braucht er die Ausrüstung, Rohmaterial im Wert von 25 GM und einen Tag (acht Stunden Arbeit)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A character who has proficiency with the Herbalism Kit can create a Potion of Healing. Doing so requires using that kit and 25 GP of raw material over the course of 1 day (8 hours of work)."
    }
   ]
  }
 },
 {
  "id": "scribing-spell-scrolls",
  "name": {
   "de": "Zauberschriftrollen verfassen",
   "en": "Scribing Spell Scrolls"
  },
  "abschnitt": {
   "de": "Zauberschriftrollen verfassen",
   "en": "Scribing Spell Scrolls"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Zauberwirker kann einen Zauber auf eine Schriftrolle übertragen und so anhand der unten beschriebenen Regeln eine Zauberschriftrolle herstellen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A spellcaster can transfer a spell to a scroll and create a Spell Scroll, using the rules below."
    }
   ]
  }
 },
 {
  "id": "time-and-cost",
  "name": {
   "de": "Zeit und Kosten",
   "en": "Time and Cost"
  },
  "abschnitt": {
   "de": "Zauberschriftrollen verfassen",
   "en": "Scribing Spell Scrolls"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Das Verfassen einer Zauberschriftrolle kostet Zeit und Geld je nach Grad des Zaubers, wie in der Tabelle „Kosten für Zauberschriftrollen“ aufgeführt. Für jeden Tag, den das Verfassen dauert, musst du acht Stunden Arbeit verrichten. Wenn eine Schriftrolle mehrere Tage erfordert, müssen diese Tage nicht aufeinanderfolgen."
    },
    {
     "typ": "tabelle",
     "titel": "Kosten für Zauberschriftrollen",
     "kopf": [
      "Zaubergrad",
      "Zeit",
      "Kosten"
     ],
     "reihen": [
      [
       "Zaubertrick",
       "1 Tag",
       "15 GM"
      ],
      [
       "1",
       "1 Tag",
       "25 GM"
      ],
      [
       "2",
       "3 Tage",
       "100 GM"
      ],
      [
       "3",
       "5 Tage",
       "150 GM"
      ],
      [
       "4",
       "10 Tage",
       "1.000 GM"
      ],
      [
       "5",
       "25 Tage",
       "1.500 GM"
      ],
      [
       "6",
       "40 Tage",
       "10.000 GM"
      ],
      [
       "7",
       "50 Tage",
       "12.500 GM"
      ],
      [
       "8",
       "60 Tage",
       "15.000 GM"
      ],
      [
       "9",
       "120 Tage",
       "50.000 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Scribing a scroll takes an amount of time and money based on the level of the spell, as shown in the Spell Scroll Costs table. For each day of inscription, you must work for 8 hours. If a scroll requires multiple days, those days needn’t be consecutive."
    },
    {
     "typ": "tabelle",
     "titel": "Spell Scroll Costs",
     "kopf": [
      "Spell Level",
      "Time",
      "Cost"
     ],
     "reihen": [
      [
       "Cantrip",
       "1 day",
       "15 GP"
      ],
      [
       "1",
       "1 day",
       "25 GP"
      ],
      [
       "2",
       "3 days",
       "100 GP"
      ],
      [
       "3",
       "5 days",
       "150 GP"
      ],
      [
       "4",
       "10 days",
       "1,000 GP"
      ],
      [
       "5",
       "25 days",
       "1,500 GP"
      ],
      [
       "6",
       "40 days",
       "10,000 GP"
      ],
      [
       "7",
       "50 days",
       "12,500 GP"
      ],
      [
       "8",
       "60 days",
       "15,000 GP"
      ],
      [
       "9",
       "120 days",
       "50,000 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "prerequisites-for-the-scribe",
  "name": {
   "de": "Voraussetzungen für den Verfasser",
   "en": "Prerequisites for the Scribe"
  },
  "abschnitt": {
   "de": "Zauberschriftrollen verfassen",
   "en": "Scribing Spell Scrolls"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Zum Verfassen einer Zauberschriftrolle benötigst du entweder Übung in der Fertigkeit Arkane Kunde oder im Umgang mit Kalligrafiewerkzeug, und du musst den Zauber an jedem Tag des Verfassens vorbereitet haben. Außerdem musst du alle Material komponenten verfügbar haben, die für den Zauber erforderlich sind. Wenn der Zauber seine Materialkomponenten verbraucht, geschieht dies erst beim Fertigstellen der Schriftrolle. Der Zauber der Schriftrolle verwendet deinen Zauberrettungswurf‑SG und deinen Zauberangriffsbonus."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "To scribe a scroll, you must have proficiency in the Arcana skill or with Calligrapher’s Supplies and have the spell prepared on each day of the inscription. You must also have at hand any Material components required by the spell; if the spell consumes its Material components, they are consumed only when you complete the scroll. The scroll’s spell uses your spell save DC and spell attack bonus."
    }
   ]
  }
 },
 {
  "id": "cantrips",
  "name": {
   "de": "Zaubertricks",
   "en": "Cantrips"
  },
  "abschnitt": {
   "de": "Zauberschriftrollen verfassen",
   "en": "Scribing Spell Scrolls"
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn es sich beim verfassten Zauber um einen Zaubertrick handelt, funktioniert die Version auf der Schriftrolle so, als hätte der Zauberwirker deine Stufe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If the scribed spell is a cantrip, the version on the scroll works as if the caster were your level."
    }
   ]
  }
 },
 {
  "id": "casting-in-armor",
  "name": {
   "de": "Zaubern in Rüstung",
   "en": "Casting in Armor"
  },
  "abschnitt": {
   "de": "Zauberschriftrollen verfassen",
   "en": "Scribing Spell Scrolls"
  },
  "kasten": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du benötigst Vertrautheit mit der Rüstung, die du trägst, wenn du einen Zauber wirkst. Anderenfalls schränkt die Rüstung dich zum Zauberwirken zu sehr ein."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You must have training with any armor you are wearing to cast spells while wearing it. You are otherwise too hampered by the armor for spellcasting."
    }
   ]
  }
 }
];
