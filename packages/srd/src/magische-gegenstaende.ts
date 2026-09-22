/**
 * Die magischen Gegenstaende des SRD 5.2.1, alle 258, woertlich und in
 * beiden Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/gegenstaende_text.py und
 * werkzeug/gegenstaende_erzeugen.py) und wird nicht von Hand gepflegt.
 * Welcher englische Gegenstand welcher deutsche ist, steht zum Teil in
 * werkzeug/gegenstaende_paare.json (von Hand, gegen Kategorie, Seltenheit
 * und Einstimmung geprueft). Die Bloecke stehen je Sprache, in derselben
 * Folge: Block i der einen Sprache ist Block i der anderen.
 */
import type { Paar } from './namensnennung';
import type { Seltenheit } from './gegenstaende';

export type Gegenstandsblock =
  | { readonly typ: 'absatz' | 'punkt' | 'stichpunkt'; readonly text: string }
  | {
      readonly typ: 'tabelle';
      readonly titel: string;
      readonly kopf: readonly string[];
      readonly reihen: readonly (readonly string[])[];
    }
  | { readonly typ: 'liste'; readonly titel: string; readonly eintraege: readonly string[] };

export type Gegenstandskategorie =
  | 'wundersam'
  | 'ruestung'
  | 'waffe'
  | 'trank'
  | 'ring'
  | 'zepter'
  | 'schriftrolle'
  | 'stab'
  | 'zauberstab';

export interface MagischerGegenstand {
  /** Aus dem englischen Namen: „bag-of-holding". */
  readonly id: string;
  readonly name: Paar;
  /** Die Zeile unter dem Namen, wie gedruckt: „Wondrous Item, Rare (Requires Attunement)". */
  readonly kopfzeile: Paar;
  readonly kategorie: Gegenstandskategorie;
  /** Mehrere bei „+1, +2 oder +3"; 'varies' und 'artifact' wie gedruckt. */
  readonly seltenheiten: readonly (Seltenheit | 'varies' | 'artifact')[];
  readonly einstimmung: boolean;
  readonly bloecke: { readonly de: readonly Gegenstandsblock[]; readonly en: readonly Gegenstandsblock[] };
}

export const MAGISCHE_GEGENSTAENDE: readonly MagischerGegenstand[] = [
 {
  "id": "adamantine-armor",
  "name": {
   "de": "Adamantrüstung",
   "en": "Adamantine Armor"
  },
  "kopfzeile": {
   "de": "Rüstung (beliebige mittelschwere oder schwere Rüstung außer Fellrüstung), ungewöhnlich",
   "en": "Armor (Any Medium or Heavy, Except Hide Armor), Uncommon"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Rüstung ist mit Adamant verstärkt, einem der härtesten Materialien, die es gibt. Wenn du sie trägst, wird jeder kritische Treffer gegen dich zu einem normalen Treffer."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This suit of armor is reinforced with adamantine, one of the hardest substances in existence. While you’re wearing it, any Critical Hit against you becomes a normal hit."
    }
   ]
  }
 },
 {
  "id": "ammunition-1-2-or-3",
  "name": {
   "de": "Geschoss +1, +2 oder +3",
   "en": "Ammunition, +1, +2, or +3"
  },
  "kopfzeile": {
   "de": "Waffe (beliebiges Geschoss), ungewöhnlich (+1), selten (+2) oder sehr selten (+3)",
   "en": "Weapon (Any Ammunition), Uncommon (+1), Rare (+2), or Very Rare (+3)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "uncommon",
   "rare",
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du hast einen Bonus auf Angriffs‑ und Schadenswürfe, die du mit diesem magischen Geschoss ausführst. Der Bonus hängt von der Seltenheit des Geschosses ab. Sobald es ein Ziel trifft, ist das Geschoss nicht mehr magisch. Das Geschoss wird üblicherweise in Mengen von zehn oder zwanzig Stück gefunden oder verkauft. Zehn Stück dieses Geschosses entsprechen dem Wert eines Tranks derselben Seltenheit."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have a bonus to attack rolls and damage rolls made with this piece of magic ammunition. The bonus is determined by the rarity of the ammunition. Once it hits a target, the ammunition is no longer magical. This ammunition is typically found or sold in quantities of ten or twenty pieces. Ten pieces of this ammunition are equivalent in value to a potion of the same rarity."
    }
   ]
  }
 },
 {
  "id": "ammunition-of-slaying",
  "name": {
   "de": "Geschoss des Tötens",
   "en": "Ammunition of Slaying"
  },
  "kopfzeile": {
   "de": "Waffe (beliebiges Geschoss), sehr selten",
   "en": "Weapon (Any Ammunition), Very Rare"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses magische Geschoss soll Kreaturen eines bestimmten Typs töten, den der SL auswählt oder zufällig bestimmt, indem er anhand der Tabelle unten würfelt. Wenn eine Kreatur dieses Typs Schaden durch das Geschoss erleidet, führt sie einen SG‑17‑Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie zusätzlich 6W10 Energieschaden, anderenfalls die Hälfte. Wenn das Geschoss einer Kreatur diesen zusätzlichen Schaden zugefügt hat, wird es nichtmagisch."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Kreaturentyp"
     ],
     "reihen": [
      [
       "1–10",
       "Aberrationen"
      ],
      [
       "11–15",
       "Celestische Wesen"
      ],
      [
       "16–25",
       "Drachen"
      ],
      [
       "26–35",
       "Elementare"
      ],
      [
       "36–45",
       "Feenwesen"
      ],
      [
       "46–50",
       "Humanoide"
      ],
      [
       "51–55",
       "Konstrukte"
      ],
      [
       "56–60",
       "Monstrositäten"
      ],
      [
       "61–65",
       "Pflanzen"
      ],
      [
       "66–70",
       "Riesen"
      ],
      [
       "71–75",
       "Schlicke"
      ],
      [
       "76–80",
       "Tiere"
      ],
      [
       "81–90",
       "Unholde"
      ],
      [
       "91–100",
       "Untote"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This magic ammunition is meant to slay creatures of a particular type, which the GM chooses or determines randomly by rolling on the table below. If a creature of that type takes damage from the ammunition, the creature makes a DC 17 Constitution saving throw, taking an extra 6d10 Force damage on a failed save or half as much extra damage on a successful one. After dealing its extra damage to a creature, the ammunition becomes nonmagical."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Creature Type"
     ],
     "reihen": [
      [
       "01–10",
       "Aberrations"
      ],
      [
       "11–15",
       "Beasts"
      ],
      [
       "16–20",
       "Celestials"
      ],
      [
       "21–25",
       "Constructs"
      ],
      [
       "26–35",
       "Dragons"
      ],
      [
       "36–45",
       "Elementals"
      ],
      [
       "46–50",
       "Humanoids"
      ],
      [
       "51–60",
       "Fey"
      ],
      [
       "61–70",
       "Fiends"
      ],
      [
       "71–75",
       "Giants"
      ],
      [
       "76–80",
       "Monstrosities"
      ],
      [
       "81–85",
       "Oozes"
      ],
      [
       "86–90",
       "Plants"
      ],
      [
       "91–00",
       "Undead"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "amulet-of-health",
  "name": {
   "de": "Amulett der Gesundheit",
   "en": "Amulet of Health"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Amulett trägst, beträgt dein Konstitutionswert 19. Beträgt dein Konstitutionswert ohnehin mindestens 19, so hat es keinen Effekt auf dich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Your Constitution is 19 while you wear this amulet. It has no effect on you if your Constitution is 19 or higher without it."
    }
   ]
  }
 },
 {
  "id": "amulet-of-proof-against-detection-and-location",
  "name": {
   "de": "Amulett des Schutzes gegen Ortung und Ausspähung",
   "en": "Amulet of Proof against Detection and Location"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Amulett trägst, kannst du weder zum Ziel von Erkenntniszaubern noch durch magische Ausspähungssensoren wahrgenommen werden, sofern du es nicht gestattest."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this amulet, you can’t be targeted by Divination spells or perceived through magical scrying sensors unless you allow it."
    }
   ]
  }
 },
 {
  "id": "amulet-of-the-planes",
  "name": {
   "de": "Amulett der Ebenen",
   "en": "Amulet of the Planes"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Very Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Amulett trägst, kannst du eine magische Aktion ausführen, um einen Ort auf einer anderen Existenzebene zu benennen, mit dem du vertraut bist. Führe dann einen SG‑15‑Intelligenzwurf (Arkane Kunde) aus. Bei einem Erfolg wirkst du den Zauber Ebenenwechsel. Misslingt der Wurf, so gelangst du mit allen Kreaturen und Gegenständen im Abstand von bis zu 4,5 Metern von dir an einen zufälligen Zielort, der mit 1W100 anhand der folgenden Tabelle ermittelt wird:"
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Ziel"
     ],
     "reihen": [
      [
       "1–60",
       "Zufälliger Ort auf der Ebene, die du nennst"
      ],
      [
       "61–70",
       "Zufälliger Ort auf einer Inneren Ebene, ermittelt durch Würfeln mit 1W6. 1: Ebene der Luft, 2: Ebene der Erde, 3: Ebene des Feuers, 4: Ebene des Wassers, 5: Feenwildnis, 6: Schattensaum"
      ],
      [
       "71–80",
       "Zufälliger Ort auf einer Äußeren Ebene, ermittelt durch Würfeln mit 1W8. 1: Arborea, 2: Arcadia, 3: Bestienlande, 4: Bytopia, 5: Elysium, 6: Mechanus, 7: Berg Celestia, 8: Ysgard"
      ],
      [
       "81–90",
       "Zufälliger Ort auf einer Äußeren Ebene, ermittelt durch Würfeln mit 1W8. 1: Abyss, 2: Acheron, 3: Carceri, 4: Gehenna, 5: Hades, 6: Limbus, 7: Neun Höllen, 8: Pandämonium"
      ],
      [
       "91–100",
       "Zufälliger Ort auf der Astralebene"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this amulet, you can take a Magic action to name a location that you are familiar with on another plane of existence. Then make a DC 15 Intelligence (Arcana) check. On a successful check, you cast Plane Shift. On a failed check, you and each creature and object within 15 feet of you travel to a random destination determined by rolling 1d100 and consulting the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Destination"
     ],
     "reihen": [
      [
       "01–60",
       "Random location on the plane you named"
      ],
      [
       "61–70",
       "Random location on an Inner Plane determined by rolling 1d6: on a 1, the Plane of Air; on a 2, the Plane of Earth; on a 3, the Plane of Fire; on a 4, the Plane of Water; on a 5, the Feywild; on a 6, the Shadowfell"
      ],
      [
       "71–80",
       "Random location on an Outer Plane determined by rolling 1d8: on a 1, Arborea; on a 2, Arcadia; on a 3, the Beastlands; on a 4, Bytopia; on a 5, Elysium; on a 6, Mechanus; on a 7, Mount Celestia; on an 8, Ysgard"
      ],
      [
       "81–90",
       "Random location on an Outer Plane determined by rolling 1d8: on a 1, the Abyss; on a 2, Acheron; on a 3, Carceri; on a 4, Gehenna; on a 5, Hades; on a 6, Limbo; on a 7, the Nine Hells; on an 8, Pandemonium"
      ],
      [
       "91–00",
       "Random location on the Astral Plane"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "animated-shield",
  "name": {
   "de": "Belebter Schild",
   "en": "Animated Shield"
  },
  "kopfzeile": {
   "de": "Rüstung (Schild), sehr selten (erfordert Einstimmung)",
   "en": "Armor (Shield), Very Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Schild hältst, du kannst eine Bonusaktion ausführen, um ihn zu beleben. Der Schild springt in die Luft und schwebt in deinem Bereich. Er schützt dich, als würdest du ihn führen, wobei du die Hände frei hast. Der Schild bleibt belebt, bis eine Minute vergangen ist, bis du eine Bonusaktion ausführst, um den Effekt zu beenden, bis du kampfunfähig wirst oder bis du stirbst. Dann fällt der Schild zu Boden oder in deine Hand, falls du eine Hand frei hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this Shield, you can take a Bonus Action to cause it to animate. The Shield leaps into the air and hovers in your space to protect you as if you were wielding it, leaving your hands free. The Shield remains animate for 1 minute, until you take a Bonus Action to end this effect, or until you die or have the Incapacitated condition, at which point the Shield falls to the ground or into your hand if you have one free."
    }
   ]
  }
 },
 {
  "id": "apparatus-of-the-crab",
  "name": {
   "de": "Apparat der Krabbe",
   "en": "Apparatus of the Crab"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Gegenstand scheint zunächst ein versiegeltes Eisenfass zu sein, das 250 Kilogramm wiegt. Das Fass hat einen versteckten Haken, der mit einem erfolgreichen SG‑20‑Intelligenzwurf (Nachforschungen) gefunden werden kann. Wird der Haken gelöst, so öffnet sich eine Luke am Ende des Fasses, durch die zwei Kreaturen von höchstens mittelgroßer Größe ins Innere kriechen können. Am anderen Ende des Fassinneren befinden sich zehn Hebel in mittlerer Stellung. Sie können nach oben und nach unten bewegt werden. Wenn bestimmte Hebel bewegt werden, verwandelt sich der Apparat in einen Riesenhummer. Der Apparat der Krabbe ist ein großer Gegenstand mit den folgenden Werten: RK 20, 200 TP, Bewegungs rate neun Meter, Schwimmbewegungsrate neun Meter (oder jeweils 0 Meter, wenn die Beine nicht ausgefahren sind), gegen Giftschaden und psychischen Schaden immun. Um als Fahrzeug verwendet zu werden, benötigt der Apparat einen Piloten. Wenn die Luke des Apparats geschlossen ist, ist er luft ‑ und wasserdicht. Der Innenraum enthält genug Atemluft für zehn Stunden (geteilt durch die Anzahl atmender Kreaturen im Apparat). Der Apparat schwimmt auf dem Wasser. Er kann bis auf 270 Meter Tiefe tauchen. In größeren Tiefen erleidet das Fahrzeug durch den Druck 2W6 Wuchtschaden pro Minute. Eine Kreatur im Apparat kann als Verwenden‑Aktion bis zu zwei Hebel nach oben oder unten bewegen. Nach jedem Bedienen kehren die Hebel in ihre neutrale Position zurück. Jeder Hebel funktioniert, von links nach rechts gelesen, wie in der Tabelle „Hebel des Apparats der Krabbe“ angegeben."
    },
    {
     "typ": "tabelle",
     "titel": "Hebel des Apparats der Krabbe",
     "kopf": [
      "Hebel",
      "Oben",
      "Unten"
     ],
     "reihen": [
      [
       "1",
       "Beine werden ausgefahren – der Apparat kann gehen und schwimmen.",
       "Beine werden eingefahren – Bewegungsrate und Schwimmbewegungsrate des Apparats sind 0, und er kann keine Boni auf die Bewegungsrate nutzen."
      ],
      [
       "2",
       "Vorderer Fensterladen öffnet sich.",
       "Vorderer Fensterladen schließt sich."
      ],
      [
       "3",
       "Seitliche Fensterläden öffnen sich (zwei pro Seite).",
       "Seitliche Fensterläden schließen sich (zwei pro Seite)."
      ],
      [
       "4",
       "Vorne werden zwei Greifscheren ausgefahren.",
       "Die Greifscheren werden eingefahren."
      ],
      [
       "5",
       "Jede ausgefahrene Greifschere führt den folgenden Nahkampfangriff aus: +8 auf Treffer, Reichweite 1,5 m. Treffer: 7 (2W6) Wuchtschaden.",
       "Jede ausgefahrene Greifschere führt den folgenden Nahkampfangriff aus: +8 auf Treffer, Reichweite 1,5 m. Treffer: Das Ziel wird gepackt (Flucht-SG 15)."
      ],
      [
       "6",
       "Der Apparat bewegt sich gehend oder schwimmend vorwärts, sofern seine Beine ausgefahren sind.",
       "Der Apparat bewegt sich gehend oder schwimmend rückwärts, sofern seine Beine ausgefahren sind."
      ],
      [
       "7",
       "Der Apparat dreht sich um 90 Grad gegen den Uhrzeigersinn, sofern seine Beine ausgefahren sind.",
       "Der Apparat dreht sich um 90 Grad im Uhrzeigersinn, sofern seine Beine ausgefahren sind."
      ],
      [
       "8",
       "Augenartige Vorrichtungen spenden im Radius von neun Metern helles Licht und im Radius von weiteren neun Metern dämmriges Licht.",
       "Das Licht erlischt."
      ],
      [
       "9",
       "Der Apparat sinkt um bis zu sechs Meter, wenn er sich in Flüssigkeit befindet.",
       "Der Apparat steigt um bis zu sechs Meter, wenn er sich in Flüssigkeit befindet."
      ],
      [
       "10",
       "Die hintere Luke entriegelt und öffnet sich.",
       "Die hintere Luke schließt und verriegelt sich."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This item first appears to be a sealed iron barrel weighing 500 pounds. The barrel has a hidden catch, which can be found with a successful DC 20 Intelligence (Investigation) check. Releasing the catch unlocks a hatch at one end of the barrel, allowing two Medium or smaller creatures to crawl inside. Ten levers are set in a row at the far end, each in a neutral position, able to move up or down. When certain levers are used, the apparatus transforms to resemble a giant lobster. The Apparatus of the Crab is a Large object with the following statistics: AC 20; HP 200; Speed 30 ft., Swim 30 ft. (or 0 ft. for both if the legs aren’t extended); Immunity to Poison and Psychic damage. To be used as a vehicle, the apparatus requires one pilot. While the apparatus’s hatch is closed, the compartment is airtight and watertight. The compartment holds enough air for 10 hours of breathing, divided by the number of breathing creatures inside. The apparatus floats on water. It can also go underwater to a depth of 900 feet. Below that, the vehicle takes 2d6 Bludgeoning damage each minute from pressure. A creature in the compartment can take a Utilize action to move as many as two of the apparatus’s levers up or down. After each use, a lever goes back to its neutral position. Each lever, from left to right, functions as shown in the Apparatus of the Crab Levers table."
    },
    {
     "typ": "tabelle",
     "titel": "Apparatus of the Crab Levers",
     "kopf": [
      "Lever",
      "Up",
      "Down"
     ],
     "reihen": [
      [
       "1",
       "Legs extend, allowing the apparatus to walk and swim.",
       "Legs retract, reducing the apparatus’s Speed and Swim Speed to 0 and making it unable to benefit from bonuses to speed."
      ],
      [
       "2",
       "Forward window shutter opens.",
       "Forward window shutter closes."
      ],
      [
       "3",
       "Side window shutters open (two per side).",
       "Side window shutters close (two per side)."
      ],
      [
       "4",
       "Two claws extend from the front side of the apparatus.",
       "The claws retract."
      ],
      [
       "5",
       "Each extended claw makes the following melee attack: +8 to hit, reach 5 ft. Hit: 7 (2d6) Bludgeoning damage.",
       "Each extended claw makes the following melee attack: +8 to hit, reach 5 ft. Hit: The target has the Grappled condition (escape DC 15)."
      ],
      [
       "6",
       "The apparatus walks or swims forward provided its legs are extended.",
       "The apparatus walks or swims backward provided its legs are extended."
      ],
      [
       "7",
       "The apparatus turns 90 degrees counterclockwise provided its legs are extended.",
       "The apparatus turns 90 degrees clockwise provided its legs are extended."
      ],
      [
       "8",
       "Eyelike fixtures emit Bright Light in a 30-foot radius and Dim Light for an additional 30 feet.",
       "The light turns off."
      ],
      [
       "9",
       "The apparatus sinks up to 20 feet if it’s in liquid.",
       "The apparatus rises up to 20 feet if it’s in liquid."
      ],
      [
       "10",
       "The rear hatch unseals and opens.",
       "The rear hatch closes and seals."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "armor-1-2-or-3",
  "name": {
   "de": "Rüstung +1, +2 oder +3",
   "en": "Armor, +1, +2, or +3"
  },
  "kopfzeile": {
   "de": "Rüstung (beliebige leichte, mittelschwere oder schwere Rüstung), selten (+1), sehr selten (+2) oder legendär (+3)",
   "en": "Armor (Any Light, Medium, or Heavy), Rare (+1), Very Rare (+2), or Legendary (+3)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "rare",
   "veryRare",
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, hast du einen Bonus auf deine Rüstungsklasse. Der Bonus wird durch ihre Seltenheit bestimmt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have a bonus to Armor Class while wearing this armor. The bonus is determined by its rarity."
    }
   ]
  }
 },
 {
  "id": "armor-of-invulnerability",
  "name": {
   "de": "Rüstung der Unverwundbarkeit",
   "en": "Armor of Invulnerability"
  },
  "kopfzeile": {
   "de": "Rüstung (Ritterrüstung), legendär (erfordert Einstimmung)",
   "en": "Armor (Plate Armor), Legendary (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, bist du gegen Hieb ‑, Stich‑ und Wuchtschaden resistent."
    },
    {
     "typ": "punkt",
     "text": "Metallpanzer: Du kannst eine magische Aktion ausführen, um gegen Hieb ‑, Stich‑ und Wuchtschaden immun zu werden. Die Immunität bleibt bestehen, bis zehn Minuten vergangen sind oder du die Rüstung nicht mehr trägst. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have Resistance to Bludgeoning, Piercing, and Slashing damage while you wear this armor."
    },
    {
     "typ": "punkt",
     "text": "Metal Shell. You can take a Magic action to give yourself Immunity to Bludgeoning, Piercing, and Slashing damage for 10 minutes or until you are no longer wearing the armor. Once this property is used, it can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "armor-of-resistance",
  "name": {
   "de": "Rüstung der Resistenz",
   "en": "Armor of Resistance"
  },
  "kopfzeile": {
   "de": "Rüstung (beliebige leichte, mittelschwere oder schwere Rüstung), selten (erfordert Einstimmung)",
   "en": "Armor (Any Light, Medium, or Heavy), Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, bist du gegen eine Schadensart resistent. Der SL wählt die Schadensart aus oder bestimmt sie zufällig, indem er anhand der folgenden Tabelle würfelt:"
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W10",
      "Schadensart"
     ],
     "reihen": [
      [
       "1",
       "Blitz"
      ],
      [
       "2",
       "Energie"
      ],
      [
       "3",
       "Feuer"
      ],
      [
       "4",
       "Gift"
      ],
      [
       "5",
       "Gleißend"
      ],
      [
       "6",
       "Kälte"
      ],
      [
       "7",
       "Nekrotisch"
      ],
      [
       "8",
       "Psychisch"
      ],
      [
       "9",
       "Säure"
      ],
      [
       "10",
       "Schall"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have Resistance to one type of damage while you wear this armor. The GM chooses the type or determines it randomly by rolling on the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d10",
      "Damage Type"
     ],
     "reihen": [
      [
       "1",
       "Acid"
      ],
      [
       "2",
       "Cold"
      ],
      [
       "3",
       "Fire"
      ],
      [
       "4",
       "Force"
      ],
      [
       "5",
       "Lightning"
      ],
      [
       "6",
       "Necrotic"
      ],
      [
       "7",
       "Poison"
      ],
      [
       "8",
       "Psychic"
      ],
      [
       "9",
       "Radiant"
      ],
      [
       "10",
       "Thunder"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "armor-of-vulnerability",
  "name": {
   "de": "Rüstung der Verwundbarkeit",
   "en": "Armor of Vulnerability"
  },
  "kopfzeile": {
   "de": "Rüstung (beliebige leichte, mittelschwere oder schwere Rüstung), selten (erfordert Einstimmung)",
   "en": "Armor (Any Light, Medium, or Heavy), Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, bist du gegen eine der folgenden Schadensarten resistent: Hieb ‑, Stich‑ oder Wuchtschaden. Der SL wählt die Schadensart aus oder bestimmt sie zufällig."
    },
    {
     "typ": "punkt",
     "text": "Fluch: Diese Rüstung ist verflucht. Dies wird erst offenbar, wenn der Zauber Identifizieren auf sie gewirkt wird oder du dich auf sie einstimmst. Durch Einstimmen auf die Rüstung wirst du verflucht, bis der Zauber Fluch brechen oder ähnliche Magie auf dich gewirkt wird. Das Ablegen der Rüstung beendet den Fluch nicht. Solange du verflucht bist, bist du anfällig für zwei der drei Schadensarten, die mit dieser Rüstung verknüpft sind (nicht für diejenige, gegen die sie resistent macht)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this armor, you have Resistance to one of the following damage types: Bludgeoning, Piercing, or Slashing. The GM chooses the type or determines it randomly."
    },
    {
     "typ": "punkt",
     "text": "Curse. This armor is cursed, a fact that is revealed only when the Identify spell is cast on the armor or you attune to it. Attuning to the armor curses you until you are targeted by a Remove Curse spell or similar magic; removing the armor fails to end the curse. While cursed, you have Vulnerability to two of the three damage types associated with the armor (not the one to which it grants Resistance)."
    }
   ]
  }
 },
 {
  "id": "arrow-catching-shield",
  "name": {
   "de": "Pfeilfangender Schild",
   "en": "Arrow-Catching Shield"
  },
  "kopfzeile": {
   "de": "Rüstung (Schild), selten (erfordert Einstimmung)",
   "en": "Armor (Shield), Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Schild trägst, hast du gegen Fernkampfangriffswürfe einen Bonus von +2 auf deine Rüstungsklasse. Dieser Bonus des Schildes wirkt zusätzlich zu seinem normalen Bonus auf die RK. Wenn ein Angreifer einen Fernkampfangriff gegen ein Ziel im Abstand von bis zu 1,5 Metern von dir ausführt, kannst du eine Reaktion ausführen, um selbst das Ziel zu werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +2 bonus to Armor Class against ranged attack rolls while you wield this Shield. This bonus is in addition to the Shield’s normal bonus to AC. Whenever an attacker makes a ranged attack roll against a target within 5 feet of you, you can take a Reaction to become the target of the attack instead."
    }
   ]
  }
 },
 {
  "id": "bag-of-beans",
  "name": {
   "de": "Bohnenbeutel",
   "en": "Bag of Beans"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser schwere Stoffbeutel enthält 3W4 getrocknete Bohnen, wenn er gefunden wird. Er wiegt 250 Gramm, unabhängig davon, wie viele Bohnen er enthält. Wenn er keine Bohnen mehr enthält, wird er zu einem nichtmagischen Gegenstand. Wenn du mindestens eine Bohne aus dem Sack wirfst, explodiert sie in einer Kugel mit einem Radius von drei Metern um sich. Alle geworfenen Bohnen werden bei der Explosion zerstört, und jede Kreatur in der Kugel (dich eingeschlossen) führt einen SG‑15‑Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 5W4 Energieschaden, anderenfalls die Hälfte. Wenn du eine Bohne aus dem Beutel nimmst, in Erde oder Sand einpflanzt und bewässerst, verschwindet die Bohne eine Minute nach dem Pflanzen und bringt an der Stelle, wo sie gepflanzt wurde, einen Effekt hervor. Der SL kann einen Effekt anhand der folgenden Tabelle auswählen oder zufällig bestimmen."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Effekt"
     ],
     "reihen": [
      [
       "1",
       "5W4 Pilze sprießen. Wenn eine Kreatur einen Pilz isst, würfle mit einem beliebigen Würfel. Bei einem ungeraden Ergebnis muss die Kreatur einen SG-15-Konstitutionsrettungswurf bestehen, oder sie erleidet 5W6 Giftschaden und ist eine Stunde lang vergiftet. Bei einem geraden Ergebnis erhält sie eine Stunde lang 5W6 temporäre Trefferpunkte."
      ],
      [
       "2–10",
       "Ein Geysir bricht aus und speit 1W4 Minuten lang Wasser, Bier, Mayonnaise, Tee, Essig, Wein oder Öl (nach Wahl des SL) neun Meter hoch in die Luft."
      ],
      [
       "11–20",
       "Ein Baumhirte sprießt. Würfle mit einem beliebigen Würfel. Bei einem ungeraden Ergebnis ist der Baumhirte chaotisch böse. Bei einem geraden Ergebnis ist der Baumhirte chaotisch gut."
      ],
      [
       "21–30",
       "Eine belebte, aber unbewegliche Steinstatue in deiner Gestalt erhebt sich und spricht verbale Drohungen gegen dich aus. Wenn du dich von der Statue entfernst und andere sich ihr nähern, beschreibt sie dich als den schlimmsten Schurken und weist die Neuankömmlinge an, dich zu finden und anzugreifen. Wenn du dich auf derselben Existenzebene wie die Statue befindest, weiß sie, wo du bist. Die Statue wird nach 24 Stunden unbelebt."
      ],
      [
       "31–40",
       "Ein Lagerfeuer mit grünen Flammen erscheint und brennt, bis 24 Stunden vergangen sind oder es gelöscht wird."
      ],
      [
       "41–50",
       "Drei Kreischerpilze sprießen."
      ],
      [
       "51–60",
       "1W4+4 hellrosa Kröten entstehen. Wenn eine Kröte berührt wird, verwandelt sie sich in ein Monster nach Wahl des SL von höchstens großer Größe, das entsprechend seiner Gesinnung und Natur handelt. Das Monster existiert eine Minute lang und verschwindet dann in einer hellrosa Rauchwolke."
      ],
      [
       "61–70",
       "Ein hungriger Landhai gräbt sich an die Oberfläche und greift an."
      ],
      [
       "71–80",
       "Ein Obstbaum wächst. Er trägt 1W10+20 Früchte, von denen 1W8 wie zufällig ermittelte Tränke wirken. Der Baum verschwindet nach einer Stunde. Gepflückte Früchte bleiben zurück und behalten etwaige Magie 30 Tage lang."
      ],
      [
       "81–90",
       "Ein Nest mit 1W4+3 regenbogenfarbigen Eiern erscheint. Jede Kreatur, die ein Ei isst, führt einen SG20Konstitutionsrettungswurf aus. Bei einem erfolgreichen Rettungswurf wird ihr niedrigster Attributswert dauerhaft um 1 erhöht (zwischen mehreren gleich niedrigen Werten wird zufällig ausgewählt). Misslingt der Wurf, so erleidet die Kreatur 10W6 Energieschaden durch eine innere Explosion."
      ],
      [
       "91–95",
       "Eine Pyramide mit einem Quadrat von 18 Metern Kantenlänge als Basis bricht aus dem Boden hervor. In ihr befindet sich eine Grabkammer mit einer Mumie, einem Mumienfürsten oder einem anderen Untoten nach Wahl des SL. Der Sarkophag in der Grabkammer enthält Schätze nach Wahl des SL."
      ],
      [
       "96–100",
       "Eine riesige Bohnenranke sprießt aus dem Boden und wächst auf eine Höhe heran, die der SL bestimmt. Das obere Ende führt an einen Ort nach Wahl des SL, beispielsweise zu einer herrlichen Aussicht, zum Schloss eines Wolkenriesen oder auf eine andere Existenzebene."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This heavy cloth bag contains 3d4 dry beans when found. The bag weighs half a pound regardless of how many beans it contains and becomes a nonmagical item when it no longer contains any beans. If you dump one or more beans out of the bag, they explode in a 10-foot-radius Sphere centered on them. All the dumped beans are destroyed in the explosion, and each creature in the Sphere, including you, makes a DC 15 Dexterity saving throw, taking 5d4 Force damage on a failed save or half as much damage on a successful one. If you remove a bean from the bag, plant it in dirt or sand, and then water it, the bean disappears as it produces an effect 1 minute later from the ground where it was planted. The GM can choose an effect from the following table or determine it randomly."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Effect"
     ],
     "reihen": [
      [
       "01",
       "5d4 toadstools sprout. If a creature eats a toadstool, roll any die. On an odd roll, the eater must succeed on a DC 15 Constitution saving throw or take 5d6 Poison damage and have the Poisoned condition for 1 hour. On an even roll, the eater gains 5d6 Temporary Hit Points for 1 hour."
      ],
      [
       "02–10",
       "A geyser erupts and spouts water, beer, mayonnaise, tea, vinegar, wine, or oil (GM’s choice) 30 feet into the air for 1d4 minutes."
      ],
      [
       "11–20",
       "A Treant sprouts. Roll any die. On an odd roll, the treant is Chaotic Evil. On an even roll, the treant is Chaotic Good."
      ],
      [
       "21–30",
       "An animate but immobile stone statue in your likeness rises and makes verbal threats against you. If you leave it and others come near, it describes you as the most heinous of villains and directs the newcomers to find and attack you. If you are on the same plane of existence as the statue, it knows where you are. The statue becomes inanimate after 24 hours."
      ],
      [
       "31–40",
       "A campfire with green flames springs forth and burns for 24 hours or until it is extinguished."
      ],
      [
       "41–50",
       "Three Shrieker Fungi sprout."
      ],
      [
       "51–60",
       "1d4 + 4 bright-pink toads crawl forth. Whenever a toad is touched, it transforms into a Large or smaller monster of the GM’s choice that acts in accordance with its alignment and nature. The monster remains for 1 minute, then disappears in a puff of bright-pink smoke."
      ],
      [
       "61–70",
       "A hungry Bulette burrows up and attacks."
      ],
      [
       "71–80",
       "A fruit tree grows. It has 1d10 + 20 fruit, 1d8 of which act as randomly determined potions. The tree vanishes after 1 hour. Picked fruit remains, retaining any magic for 30 days."
      ],
      [
       "81–90",
       "A nest of 1d4 + 3 rainbow-colored eggs springs up. Any creature that eats an egg makes a DC 20 Constitution saving throw. On a successful save, a creature permanently increases its lowest ability score by 1, randomly choosing among equally low scores. On a failed save, the creature takes 10d6 Force damage from an internal explosion."
      ],
      [
       "91–95",
       "A pyramid with a 60-foot-square base bursts upward. Inside is a burial chamber containing a Mummy, a Mummy Lord, or some other Undead of the GM’s choice. Its sarcophagus contains treasure of the GM’s choice."
      ],
      [
       "96–00",
       "A giant beanstalk sprouts, growing to a height of the GM’s choice. The top leads where the GM chooses, such as to a great view, a cloud giant’s castle, or another plane of existence."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "bag-of-devouring",
  "name": {
   "de": "Fraßbeutel",
   "en": "Bag of Devouring"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Beutel sieht wie ein Nimmervoller Beutel aus, ist jedoch das Maul einer gigantischen extradimensionalen Kreatur. Das Maul kann geschlossen werden, indem der Beutel auf links gedreht wird. Die zugehörige extradimensionale Kreatur spürt, was in den Beutel gelegt wird. Tierisches oder pflanzliches Material, das sich vollständig im Beutel befindet, wird verschlungen und ist für immer verloren. Wenn eine lebendige Kreatur teilweise in den Beutel gelangt (beispielsweise wenn jemand in den Beutel greift), wird sie mit 50‑prozentiger Wahrscheinlichkeit in den Beutel gezogen. Eine Kreatur im Beutel kann eine Aktion ausführen, um zu entkommen zu versuchen. Dies gelingt ihr mit einem erfolgreichen SG‑15‑Stärkewurf (Athletik). Eine andere Kreatur kann eine Aktion ausführen, um in den Beutel zu greifen und zu versuchen, die Kreatur im Inneren herauszuziehen. Dies gelingt ihr mit einem erfolgreichen SG‑20‑Stärkewurf (Athletik), sofern sie nicht ebenfalls in den Beutel gezogen wird. Jede Kreatur, die ihren Zug im Inneren des Beutels beginnt, wird verschlungen und ihr Körper wird zerstört. Im Beutel können unbelebte Gegenstände mit einem Volumen von bis zu 28 Litern aufbewahrt werden. Allerdings verschluckt der Beutel einmal am Tag alle Gegenstände in seinem Inneren und spuckt sie auf einer anderen Existenzebene wieder aus. Der SL bestimmt den Zeitpunkt und die Ebene. Wird der Beutel durchbohrt oder zerrissen, so wird er zerstört, und alles, was sich darin befindet, wird an einen zufälligen Ort auf der Astralebene transportiert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This bag resembles a Bag of Holding but is a feeding orifice for a gigantic extradimensional creature. Turning the bag inside out closes the orifice. The extradimensional creature attached to the bag can sense whatever is placed inside the bag. Animal or vegetable matter placed wholly in the bag is devoured and lost forever. When part of a living creature is placed in the bag, as happens when someone reaches inside it, there is a 50 percent chance that the creature is pulled inside the bag. A creature inside the bag can take an action to try to escape, doing so with a successful DC 15 Strength (Athletics) check. Another creature can take an action to reach into the bag to pull a creature out, doing so with a successful DC 20 Strength (Athletics) check, provided the puller isn’t pulled inside the bag first. Any creature that starts its turn inside the bag is devoured, its body destroyed. Inanimate objects can be stored in the bag, which can hold a cubic foot of such material. However, once each day, the bag swallows any objects inside it and spits them out into another plane of existence. The GM determines the time and plane. If the bag is pierced or torn, it is destroyed, and anything contained within it is transported to a random location on the Astral Plane."
    }
   ]
  }
 },
 {
  "id": "bag-of-holding",
  "name": {
   "de": "Nimmervoller Beutel",
   "en": "Bag of Holding"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Beutel hat einen Innenraum, der erheblich größer ist als seine Außenmaße: Seine Öffnung hat einen Durchmesser von etwa 60 Zentimetern, und er ist 120 Zentimeter tief. Der Beutel kann bis zu 250 Kilogramm Gewicht und bis zu 1.800 Liter Volumen fassen. Er wiegt unabhängig von seinem Inhalt 2,5 Kilogramm. Es erfordert eine Verwenden‑Aktion, einen Gegenstand aus dem Beutel zu holen. Wird der Beutel überfüllt, durchbohrt oder zerrissen, so ist er zerstört, und sein Inhalt wird auf der Astralebene verstreut. Wenn der Beutel auf links gedreht wird, fällt sein gesamter Inhalt unbeschädigt heraus. Der Beutel muss wieder auf rechts gedreht werden, damit er erneut verwendet werden kann. Der Beutel enthält genug Atemluft für zehn Minuten (geteilt durch die Anzahl atmender Kreaturen darin). Wenn ein Nimmervoller Beutel in den extradimensionalen Raum eines Praktischen Rucksacks, eines Tragbaren Lochs oder eines ähnlichen Gegenstands gelangt, zerstört dies sofort beide Gegenstände, und ein Tor in die Astralebene öffnet sich. Das Tor erscheint dort, wo der eine Gegenstand in den anderen gelangt ist. Jede Kreatur innerhalb einer Kugel mit einem Radius von drei Metern um das Tor wird hindurchgezogen und gelangt an einen zufälligen Ort auf der Astralebene. Dann schließt sich das Tor. Das Tor funktioniert in eine Richtung und kann nicht wieder geöffnet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This bag has an interior space considerably larger than its outside dimensions—roughly 2 feet square and 4 feet deep on the inside. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. The bag weighs 5 pounds, regardless of its contents. Retrieving an item from the bag requires a Utilize action. If the bag is overloaded, pierced, or torn, it is destroyed, and its contents are scattered in the Astral Plane. If the bag is turned inside out, its contents spill forth unharmed, but the bag must be put right before it can be used again. The bag holds enough air for 10 minutes of breathing, divided by the number of breathing creatures inside. Placing a Bag of Holding inside an extradimensional space created by a Handy Haversack, Portable Hole, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within a 10-foot-radius Sphere centered on the gate is sucked through it to a random location on the Astral Plane. The gate then closes. The gate is one-way and can’t be reopened."
    }
   ]
  }
 },
 {
  "id": "bag-of-tricks",
  "name": {
   "de": "Trickbeutel",
   "en": "Bag of Tricks"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Beutel aus beigefarbenem, grauem oder rostfarbenem Stoff scheint leer zu sein. Ein Griff in den Beutel offenbart jedoch einen kleinen flauschigen Gegenstand. Du kannst eine magische Aktion ausführen, um diesen Gegenstand aus dem Beutel zu ziehen und bis zu sechs Meter weit zu werfen. Wenn der Gegenstand landet, verwandelt er sich in eine Kreatur, die du anhand der Tabelle für die Farbe des Beutels ermittelst. Den Wertekasten der Kreatur findest du unter „Monster“. Die Kreatur verschwindet im nächsten Morgengrauen, oder wenn ihre Trefferpunkte auf 0 sinken. Sie ist dir und deinen Verbündeten freundlich gesinnt und handelt bei deinem Initiativewert unmittelbar nach dir. Du kannst eine Bonusaktion ausführen, um der Kreatur zu befehlen, wie sie sich im nächsten Zug bewegt und welche Aktion sie ausführt (beispielsweise einen Gegner angreifen). Wenn die Kreatur keine Befehle erhält, handelt sie, wie es ihrer Natur entspricht. Wurden drei flauschige Gegenstände aus dem Beutel gezogen, so kann der Beutel erst ab dem nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "tabelle",
     "titel": "Grauer Trickbeutel",
     "kopf": [
      "1W8",
      "Kreatur"
     ],
     "reihen": [
      [
       "1",
       "Wiesel"
      ],
      [
       "2",
       "Riesenratte"
      ],
      [
       "3",
       "Dachs"
      ],
      [
       "4",
       "Eber"
      ],
      [
       "5",
       "Panther"
      ],
      [
       "6",
       "Riesendachs"
      ],
      [
       "7",
       "Schreckenswolf"
      ],
      [
       "8",
       "Riesenelch"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Rostfarbener Trickbeutel",
     "kopf": [
      "1W8",
      "Kreatur"
     ],
     "reihen": [
      [
       "1",
       "Ratte"
      ],
      [
       "2",
       "Eule"
      ],
      [
       "3",
       "Dogge"
      ],
      [
       "4",
       "Ziege"
      ],
      [
       "5",
       "Riesenziege"
      ],
      [
       "6",
       "Rieseneber"
      ],
      [
       "7",
       "Löwe"
      ],
      [
       "8",
       "Braunbär"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Beigefarbener Trickbeutel",
     "kopf": [
      "1W8",
      "Kreatur"
     ],
     "reihen": [
      [
       "1",
       "Schakal"
      ],
      [
       "2",
       "Menschenaffe"
      ],
      [
       "3",
       "Pavian"
      ],
      [
       "4",
       "Axtschnabel"
      ],
      [
       "5",
       "Schwarzbär"
      ],
      [
       "6",
       "Riesenwiesel"
      ],
      [
       "7",
       "Riesenhyäne"
      ],
      [
       "8",
       "Tiger"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This bag made from gray, rust, or tan cloth appears empty. Reaching inside the bag, however, reveals the presence of a small, fuzzy object. You can take a Magic action to pull the fuzzy object from the bag and throw it up to 20 feet. When the object lands, it transforms into a creature you determine by rolling on the table that corresponds to the bag’s color. See “Monsters” for the creature’s stat block. The creature vanishes at the next dawn or when it is reduced to 0 Hit Points. The creature is Friendly to you and your allies, and it acts immediately after you on your Initiative count. You can take a Bonus Action to command how the creature moves and what action it takes on its next turn, such as attacking an enemy. In the absence of such orders, the creature acts in a fashion appropriate to its nature. Once three fuzzy objects have been pulled from the bag, the bag can’t be used again until the next dawn."
    },
    {
     "typ": "tabelle",
     "titel": "Gray Bag of Tricks",
     "kopf": [
      "1d8",
      "Creature"
     ],
     "reihen": [
      [
       "1",
       "Weasel"
      ],
      [
       "2",
       "Giant Rat"
      ],
      [
       "3",
       "Badger"
      ],
      [
       "4",
       "Boar"
      ],
      [
       "5",
       "Panther"
      ],
      [
       "6",
       "Giant Badger"
      ],
      [
       "7",
       "Dire Wolf"
      ],
      [
       "8",
       "Giant Elk"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Rust Bag of Tricks",
     "kopf": [
      "1d8",
      "Creature"
     ],
     "reihen": [
      [
       "1",
       "Rat"
      ],
      [
       "2",
       "Owl"
      ],
      [
       "3",
       "Mastiff"
      ],
      [
       "4",
       "Goat"
      ],
      [
       "5",
       "Giant Goat"
      ],
      [
       "6",
       "Giant Boar"
      ],
      [
       "7",
       "Lion"
      ],
      [
       "8",
       "Brown Bear"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Tan Bag of Tricks",
     "kopf": [
      "1d8",
      "Creature"
     ],
     "reihen": [
      [
       "1",
       "Jackal"
      ],
      [
       "2",
       "Ape"
      ],
      [
       "3",
       "Baboon"
      ],
      [
       "4",
       "Axe Beak"
      ],
      [
       "5",
       "Black Bear"
      ],
      [
       "6",
       "Giant Weasel"
      ],
      [
       "7",
       "Giant Hyena"
      ],
      [
       "8",
       "Tiger"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "bead-of-force",
  "name": {
   "de": "Perle der Kraft",
   "en": "Bead of Force"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese kleine schwarze Kugel hat einen Durchmesser von etwa zwei Zentimetern und wiegt rund 30 Gramm. Normalerweise werden 1W4+4 Perlen der Kraft auf einmal gefunden. Du kannst eine magische Aktion ausführen, um eine Perle bis zu 18 Meter weit zu werfen. Wenn sie auftrifft, explodiert sie in einer Kugel mit einem Radius von drei Metern und wird dabei zerstört. Jede Kreatur in der Kugel muss einen SG‑15‑Geschicklichkeitsrettungswurf bestehen, oder sie erleidet 5W4 Energieschaden. Dann wird der Bereich eine Minute lang von einer Kugel aus transparenter Energie umschlossen. Jede Kreatur, deren Rettungswurf misslungen ist und die sich vollständig im betroffenen Bereich befindet, ist in der Kugel gefangen. Jede Kreatur, deren Rettungswurf erfolgreich war oder die sich nur teilweise im Bereich der Kugel befindet, wird von deren Zentrum weggestoßen, bis sie sich außerhalb der Kugel befindet. Nur Atemluft kann die Kugel passieren. Für Angriffe und andere Effekte ist sie undurchdringlich. Eine gefangene Kreatur kann eine Verwenden‑Aktion ausführen, um sich gegen die Kugelwand zu lehnen und die Kugel so um bis zur halben Bewegungsrate der Kreatur zu bewegen. Die Kugel kann aufgehoben werden. Dank ihrer Magie wiegt sie unabhängig vom Gewicht der Kreaturen darin nur 0,5 Kilogramm."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This small black sphere measures 3/4 of an inch in diameter and weighs an ounce. Typically, 1d4 + 4 Beads of Force are found together. You can take a Magic action to throw the bead up to 60 feet. The bead explodes in a 10-foot-radius Sphere on impact and is destroyed. Each creature in the Sphere must succeed on a DC 15 Dexterity saving throw or take 5d4 Force damage. A sphere of transparent force then encloses the area for 1 minute. Any creature that failed the save and is completely within the area is trapped inside this sphere. Creatures that succeeded on the save or are partially within the area are pushed away from the center of the sphere until they are no longer inside it. Only breathable air can pass through the sphere’s wall. No attack or other effect can pass through. An enclosed creature can take a Utilize action to push against the sphere’s wall, moving the sphere up to half the creature’s Speed. The sphere can be picked up, and its magic causes it to weigh only 1 pound, regardless of the weight of creatures inside."
    }
   ]
  }
 },
 {
  "id": "bead-of-nourishment",
  "name": {
   "de": "Perle der Ernährung",
   "en": "Bead of Nourishment"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, gewöhnlich",
   "en": "Wondrous Item, Common"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "common"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese geschmacksneutrale gallertartige Perle löst sich auf der Zunge auf und liefert so viel Nahrung wie eine Tagesration."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This flavorless, gelatinous bead dissolves on your tongue and provides as much nourishment as 1 day of Rations."
    }
   ]
  }
 },
 {
  "id": "belt-of-dwarvenkind",
  "name": {
   "de": "Zwergischer Gürtel",
   "en": "Belt of Dwarvenkind"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Gürtel trägst, erhältst du die folgenden Vorzüge:"
    },
    {
     "typ": "stichpunkt",
     "text": "Zähigkeit: Dein Konstitutionswert wird um 2 erhöht (auf höchstens 20)."
    },
    {
     "typ": "stichpunkt",
     "text": "Zwergenfreund: Du bist bei Charismawürfen (Überzeugen) im Vorteil, die erfolgen, um mit Zwergen und Duergar zu interagieren."
    },
    {
     "typ": "stichpunkt",
     "text": "Zwergisch: Du sprichst Zwergisch. Wenn du auf den Gürtel eingestimmt bist, besteht außerdem täglich im Morgengrauen eine Chance von 50 Prozent, dass dir ein Vollbart wächst (sofern dies möglich ist) oder dass dein Bart dichter wird, falls du schon einen hast. Falls du kein Zwerg oder Duergar bist, erhältst du folgende zusätzliche Vorzüge, wenn du den Gürtel trägst:"
    },
    {
     "typ": "stichpunkt",
     "text": "Dunkelsicht: Du hast Dunkelsicht mit einer Reichweite von 18 Metern."
    },
    {
     "typ": "stichpunkt",
     "text": "Unempfindlichkeit: Du bist gegen Giftschaden resistent. Außerdem bist du bei Rettungswürfen zum Vermeiden oder Beenden des Zustands Vergiftet im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this belt, you gain the following benefits:"
    },
    {
     "typ": "stichpunkt",
     "text": "Dwarvish. You know Dwarvish."
    },
    {
     "typ": "stichpunkt",
     "text": "Friend of Dwarvenkind. You have Advantage on Charisma (Persuasion) checks made to interact with dwarves and duergar."
    },
    {
     "typ": "stichpunkt",
     "text": "Toughness. Your Constitution increases by 2, to a maximum of 20. In addition, while attuned to the belt, you have a 50 percent chance each day at dawn of growing a full beard if you can grow one, or a thicker beard if you already have one. If you aren’t a dwarf or duergar, you gain the following additional benefits while wearing the belt:"
    },
    {
     "typ": "stichpunkt",
     "text": "Darkvision. You have Darkvision with a range of 60 feet."
    },
    {
     "typ": "stichpunkt",
     "text": "Resilience. You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition."
    }
   ]
  }
 },
 {
  "id": "belt-of-giant-strength",
  "name": {
   "de": "Gürtel der Riesenstärke",
   "en": "Belt of Giant Strength"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, Seltenheit variiert (erfordert Einstimmung)",
   "en": "Wondrous Item, Rarity Varies (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "varies"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Gürtel trägst, ändert sich dein Stärkewert auf einen vom Gürtel bestimmten Wert. Der Wert hängt von der Riesenart ab (siehe Tabelle unten). Der Gegenstand hat keine Wirkung auf dich, wenn deine Stärke bereits mindestens dem Wert des Gürtels entspricht."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Gürtel",
      "Stä.",
      "Seltenheit"
     ],
     "reihen": [
      [
       "Gürtel der Riesenstärke (Hügel)",
       "21",
       "Selten"
      ],
      [
       "Gürtel der Riesenstärke (Frost oder Stein)",
       "23",
       "Sehr selten"
      ],
      [
       "Gürtel der Riesenstärke (Feuer)",
       "25",
       "Sehr selten"
      ],
      [
       "Gürtel der Riesenstärke (Wolken)",
       "27",
       "Legendär"
      ],
      [
       "Gürtel der Riesenstärke (Sturm)",
       "29",
       "Legendär"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this belt, your Strength changes to a score granted by the belt. The type of giant determines the score (see the table below). The item has no effect on you if your Strength without the belt is equal to or greater than the belt’s score."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Belt",
      "Str.",
      "Rarity"
     ],
     "reihen": [
      [
       "Belt of Giant Strength (hill)",
       "21",
       "Rare"
      ],
      [
       "Belt of Giant Strength (frost or stone)",
       "23",
       "Very Rare"
      ],
      [
       "Belt of Giant Strength (fire)",
       "25",
       "Very Rare"
      ],
      [
       "Belt of Giant Strength (cloud)",
       "27",
       "Legendary"
      ],
      [
       "Belt of Giant Strength (storm)",
       "29",
       "Legendary"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "berserker-axe",
  "name": {
   "de": "Berserkeraxt",
   "en": "Berserker Axe"
  },
  "kopfzeile": {
   "de": "Waffe (Hellebarde, Streitaxt oder Zweihandaxt), selten (erfordert Einstimmung)",
   "en": "Weapon (Battleaxe, Greataxe, or Halberd), Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Wenn du auf diese Waffe eingestimmt bist, wird dein Trefferpunktemaximum außerdem für jede Stufe, die du erreicht hast, um 1 erhöht."
    },
    {
     "typ": "punkt",
     "text": "Fluch: Diese Waffe ist verflucht, und wenn du dich auf sie einstimmst, ergreift der Fluch auch dich. Solange du verflucht bist, bist du nicht bereit, dich von der Waffe zu trennen. Du behältst sie stets in Reichweite. Außerdem bist du bei Angriffswürfen mit anderen Waffen als dieser im Nachteil. Wann immer eine andere Kreatur dir Schaden zufügt, während du diese Waffe besitzt, musst du einen SG‑15‑Weisheitsrettungswurf bestehen, oder du wirst rasend. Dieser rasende Zustand endet, wenn du deinen Zug beginnst und sich im Abstand von bis zu 18 Metern von dir keine anderen Kreaturen befinden, die du hören oder sehen kannst. Wenn du rasend bist, betrachtest du die Kreatur, die dir am nächsten ist und die du hören oder sehen kannst, als deinen Gegner. Wenn mehrere Kreaturen in Frage kommen, wähle zufällig eine aus. Du musst dich der Kreatur in jedem deiner Züge so weit wie möglich nähern, die Angriffsaktion ausführen und dabei auf die Kreatur zielen. Kommst du der Kreatur nicht nahe genug, um sie mit der Waffe anzugreifen, so endet dein Zug, nachdem du deine gesamte verfügbare Bewegung verbraucht hast. Wenn die Kreatur stirbt oder du sie nicht mehr hören oder sehen kannst, wird die Kreatur, die dir jetzt am nächsten ist und die du hören oder sehen kannst, zu deinem neuen Ziel."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. In addition, while you are attuned to this weapon, your Hit Point maximum increases by 1 for each level you have attained."
    },
    {
     "typ": "punkt",
     "text": "Curse. This weapon is cursed, and becoming attuned to it extends the curse to you. As long as you remain cursed, you are unwilling to part with the weapon, keeping it within reach at all times. You also have Disadvantage on attack rolls with weapons other than this one. Whenever another creature damages you while the weapon is in your possession, you must succeed on a DC 15 Wisdom saving throw or go berserk. This berserk state ends when you start your turn and there are no creatures within 60 feet of you that you can see or hear. While berserk, you regard the creature nearest to you that you can see or hear as your enemy. If there are multiple possible creatures, choose one at random. On each of your turns, you must move as close to the creature as possible and take the Attack action, targeting the creature. If you’re unable to get close enough to the creature to attack it with the weapon, your turn ends after you’ve used up all your available movement. If the creature dies or can no longer be seen or heard by you, the next nearest creature that you can see or hear becomes your new target."
    }
   ]
  }
 },
 {
  "id": "boots-of-elvenkind",
  "name": {
   "de": "Stiefel der Elfen",
   "en": "Boots of Elvenkind"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Stiefel trägst, sind deine Schritte unabhängig vom Untergrund geräuschlos. Außerdem bist du bei Geschicklichkeitswürfen (Heimlichkeit) im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear these boots, your steps make no sound, regardless of the surface you are moving across. You also have Advantage on Dexterity (Stealth) checks."
    }
   ]
  }
 },
 {
  "id": "boots-of-levitation",
  "name": {
   "de": "Stiefel des Schwebens",
   "en": "Boots of Levitation"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Stiefel trägst, kannst du Schweben auf dich selbst wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear these boots, you can cast Levitate on yourself."
    }
   ]
  }
 },
 {
  "id": "boots-of-speed",
  "name": {
   "de": "Stiefel der Geschwindigkeit",
   "en": "Boots of Speed"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Stiefel trägst, du kannst eine Bonusaktion ausführen, um ihre Hacken gegeneinanderzuschlagen. In diesem Fall verdoppeln die Stiefel deine Bewegungsrate, und jede Kreatur, die einen Gelegenheitsangriff gegen dich ausführt, ist beim Angriffswurf im Nachteil. Du kannst den Effekt beenden, indem du die Hacken erneut gegeneinanderschlägst. Wenn du die Eigenschaft der Stiefel zehn Minuten lang verwendet hast, steht die Magie erst wieder zur Verfügung, nachdem du eine lange Rast beendet hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear these boots, you can take a Bonus Action to click the boots’ heels together. If you do, the boots double your Speed, and any creature that makes an Opportunity Attack against you has Disadvantage on the attack roll. If you click your heels together again, you end the effect. When you’ve used the boots’ property for a total of 10 minutes, the magic ceases to function for you until you finish a Long Rest."
    }
   ]
  }
 },
 {
  "id": "boots-of-striding-and-springing",
  "name": {
   "de": "Stiefel des Schreitens und Springens",
   "en": "Boots of Striding and Springing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Stiefel trägst, hast du eine Bewegungsrate von neun Metern (sofern sie nicht ohnehin darüber liegt), die nicht von Gewicht über deine Traglast hinaus oder durch schwere Rüstung verringert wird. Du kannst in jedem deiner Züge einmal bis zu neun Meter weit springen und dabei nur drei Meter Bewegung verbrauchen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear these boots, your Speed becomes 30 feet unless your Speed is higher, and your Speed isn’t reduced by you carrying weight in excess of your carrying capacity or wearing Heavy Armor. Once on each of your turns, you can jump up to 30 feet by spending only 10 feet of movement."
    }
   ]
  }
 },
 {
  "id": "boots-of-the-winterlands",
  "name": {
   "de": "Stiefel der Winterlande",
   "en": "Boots of the Winterlands"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Pelzstiefel sind bequem und warm. Wenn du sie trägst, erhältst du die folgenden Vorzüge:"
    },
    {
     "typ": "punkt",
     "text": "Kälteresistenz: Du bist gegen Kälteschaden resistent und kannst Temperaturen von −18 Grad Celsius und darunter ohne zusätzlichen Schutz ertragen."
    },
    {
     "typ": "punkt",
     "text": "Winterschreiter: Du ignorierst schwieriges Gelände, das durch Eis oder Schnee verursacht wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These furred boots are snug and feel warm. While wearing them, you gain the following benefits."
    },
    {
     "typ": "punkt",
     "text": "Cold Resistance. You have Resistance to Cold damage and can tolerate temperatures of 0 degrees Fahrenheit or lower without any additional protection."
    },
    {
     "typ": "punkt",
     "text": "Winter Strider. You ignore Difficult Terrain created by ice or snow."
    }
   ]
  }
 },
 {
  "id": "bowl-of-commanding-water-elementals",
  "name": {
   "de": "Schale der Wasserelementar-Herrschaft",
   "en": "Bowl of Commanding Water Elementals"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn diese Schüssel mit Wasser gefüllt ist und du dich im Abstand von bis zu 1,5 Metern davon befindest, kannst du eine magische Aktion ausführen, um einen Wasserelementar herbeizurufen. Der Elementar erscheint in einem freien Bereich so nahe wie möglich bei der Schüssel. Er versteht deine Sprachen, gehorcht deinen Befehlen und ist bei deinem Initiativewert unmittelbar nach dir am Zug. Der Elementar verschwindet, wenn eine Stunde vergangen ist, er stirbt oder du ihn als Bonusaktion verwirfst. Wurde die Schale verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden. Die Schale misst ungefähr 30 Zentimeter im Durchmesser und ist halb so tief. Sie fasst etwa zwölf Liter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While this bowl is filled with water and you are within 5 feet of it, you can take a Magic action to summon a Water Elemental. The elemental appears in an unoccupied space as close to the bowl as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The bowl can’t be used this way again until the next dawn. The bowl is about 1 foot in diameter and half as deep. It holds about 3 gallons."
    }
   ]
  }
 },
 {
  "id": "bracers-of-archery",
  "name": {
   "de": "Armschienen des Bogenschützen",
   "en": "Bracers of Archery"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Armschienen trägst, hast du Übung im Umgang mit Lang ‑ und Kurzbögen und erhältst einen Bonus von +2 auf Schadenswürfe mit solchen Waffen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing these bracers, you have proficiency with the Longbow and Shortbow, and you gain a +2 bonus to damage rolls made with such weapons."
    }
   ]
  }
 },
 {
  "id": "bracers-of-defense",
  "name": {
   "de": "Armschienen der Verteidigung",
   "en": "Bracers of Defense"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Armschienen trägst, erhältst du einen Bonus von +2 auf deine Rüstungsklasse, sofern du keine Rüstung trägst und keinen Schild verwendest."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing these bracers, you gain a +2 bonus to Armor Class if you are wearing no armor and using no Shield."
    }
   ]
  }
 },
 {
  "id": "brazier-of-commanding-fire-elementals",
  "name": {
   "de": "Feuerschale der Feuerelementar-Herrschaft",
   "en": "Brazier of Commanding Fire Elementals"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dich im Abstand von bis zu 1,5 Metern von dieser Feuerschale befindest, kannst du eine magische Aktion ausführen, um einen Feuerelementar herbeizurufen. Der Elementar erscheint in einem freien Bereich so nahe wie möglich bei der Feuerschale. Er versteht deine Sprachen, gehorcht deinen Befehlen und ist bei deinem Initiativewert unmittelbar nach dir am Zug. Der Elementar verschwindet, wenn eine Stunde vergangen ist, er stirbt oder du ihn als Bonusaktion verwirfst. Wurde die Feuerschale verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you are within 5 feet of this brazier, you can take a Magic action to summon a Fire Elemental. The elemental appears in an unoccupied space as close to the brazier as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The brazier can’t be used this way again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "brooch-of-shielding",
  "name": {
   "de": "Brosche des Abschirmens",
   "en": "Brooch of Shielding"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Brosche trägst, bist du gegen Energieschaden resistent und gegen Schaden durch den Zauber Magisches Geschoss immun."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this brooch, you have Resistance to Force damage, and you have Immunity to damage from the Magic Missile spell."
    }
   ]
  }
 },
 {
  "id": "broom-of-flying",
  "name": {
   "de": "Flugbesen",
   "en": "Broom of Flying"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser hölzerne Besen funktioniert wie ein normaler Besen, bis du dich rittlings daraufsetzt und eine magische Aktion ausführst. Dann beginnt er zu schweben, und du kannst auf ihm durch die Lüfte fliegen. Die Flugbewegungsrate des Besens beträgt 15 Meter. Er kann bis zu 200 Kilogramm tragen. Allerdings sinkt seine Flugbewegungsrate auf neun Meter, wenn er mehr als 100 Kilogramm trägt. Der Besen hört auf zu schweben, wenn du landest oder nicht mehr auf ihm reitest. Du kannst als magische Aktion den Besen ohne Passagier zu einem Ziel im Abstand von bis zu 1,6 Kilometern von dir schicken. Dazu musst du einen Ort nennen, mit dem du vertraut bist. Der Besen kommt zu dir zurück, wenn du eine magische Aktion ausführst, ein Befehlswort aussprichst und der Besen sich weiterhin im Abstand von bis zu 1,6 Kilometern von dir befindet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wooden broom functions like a mundane broom until you stand astride it and take a Magic action to make it hover beneath you, at which time it can be ridden in the air. It has a Fly Speed of 50 feet. It can carry up to 400 pounds, but its Fly Speed becomes 30 feet while carrying over 200 pounds. The broom stops hovering when you land or when you’re no longer riding it. As a Magic action, you can send the broom to travel alone to a destination within 1 mile of you if you name the location and are familiar with it. The broom comes back to you when you take a Magic action and use a command word if the broom is still within 1 mile of you."
    }
   ]
  }
 },
 {
  "id": "candle-of-invocation",
  "name": {
   "de": "Kerze der Anrufung",
   "en": "Candle of Invocation"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Very Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Die Magie dieser Kerze wird aktiviert, indem die Kerze angezündet wird. Dies erfordert eine magische Aktion. Wenn die Kerze vier Stunden lang gebrannt hat, ist sie zerstört. Du kannst sie vorher ausblasen, um sie später wieder zu verwenden. Ziehe die Brenndauer in Minutenschritten von der Gesamtbrenndauer ab. Wenn die Kerze brennt, spendet sie in einem Radius von neun Metern dämmriges Licht. Wenn du dich in diesem Licht befindest, bist du bei W20‑Prüfungen im Vorteil. Außerdem können Kleriker und Druiden, die sich in diesem Licht befinden, vorbereitete Zauber des 1. Grades wirken, ohne Zauberplätze zu verbrauchen. Alternativ kannst du den Zauber Tor wirken, wenn du die Kerze zum ersten Mal anzündest. Dabei wird die Kerze zerstört. Das vom Zauber erzeugte Portal führt zu einer Äußeren Ebene, die der SL auswählt oder durch Würfeln anhand der folgenden Tabelle bestimmt."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Äußere Ebene"
     ],
     "reihen": [
      [
       "1–5",
       "Abyss"
      ],
      [
       "6–10",
       "Acheron"
      ],
      [
       "11–17",
       "Arborea"
      ],
      [
       "18–25",
       "Arcadia"
      ],
      [
       "26–33",
       "Berg Celestia"
      ],
      [
       "34–41",
       "Bestienlande"
      ],
      [
       "42–49",
       "Bytopia"
      ],
      [
       "50–54",
       "Carceri"
      ],
      [
       "55–62",
       "Elysium"
      ],
      [
       "63–67",
       "Gehenna"
      ],
      [
       "68–72",
       "Hades"
      ],
      [
       "73–77",
       "Limbus"
      ],
      [
       "78–85",
       "Mechanus"
      ],
      [
       "86–90",
       "Neun Höllen"
      ],
      [
       "91–95",
       "Pandämonium"
      ],
      [
       "96–100",
       "Ysgard"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This candle’s magic is activated when the candle is lit, which requires a Magic action. After burning for 4 hours, the candle is destroyed. You can snuff it out early for use at a later time. Deduct the time it burned in increments of 1 minute from its total burn time. While lit, the candle sheds Dim Light in a 30-foot radius. While you are within that light, you have Advantage on D20 Tests. In addition, a Cleric or Druid in the light can cast level 1 spells they have prepared without expending spell slots. Alternatively, when you light the candle for the first time, you can cast Gate with it. Doing so destroys the candle. The portal created by the spell links to a particular Outer Plane chosen by the GM or determined by rolling on the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Outer Plane"
     ],
     "reihen": [
      [
       "01–05",
       "Abyss"
      ],
      [
       "06–10",
       "Acheron"
      ],
      [
       "11–17",
       "Arborea"
      ],
      [
       "18–25",
       "Arcadia"
      ],
      [
       "26–33",
       "Beastlands"
      ],
      [
       "34–41",
       "Bytopia"
      ],
      [
       "42–46",
       "Carceri"
      ],
      [
       "47–54",
       "Elysium"
      ],
      [
       "55–59",
       "Gehenna"
      ],
      [
       "60–64",
       "Hades"
      ],
      [
       "65–69",
       "Limbo"
      ],
      [
       "70–77",
       "Mechanus"
      ],
      [
       "78–85",
       "Mount Celestia"
      ],
      [
       "86–90",
       "Nine Hells"
      ],
      [
       "91–95",
       "Pandemonium"
      ],
      [
       "96–00",
       "Ysgard"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "cape-of-the-mountebank",
  "name": {
   "de": "Umhang des Scharlatans",
   "en": "Cape of the Mountebank"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Umhang riecht leicht nach Schwefel. Wenn du ihn trägst, kannst du ihn verwenden, um als magische Aktion den Zauber Dimensionstür zu wirken. Diese Eigenschaft kann erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden. Wenn du dich mit diesem Zauber teleportierst, hinterlässt du eine Rauchwolke. Der Bereich, den du verlassen hast, ist bis zum Ende deines nächsten Zugs durch den Rauch leicht verschleiert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This cape smells faintly of brimstone. While wearing it, you can use it to cast Dimension Door as a Magic action. This property can’t be used again until the next dawn. When you teleport with that spell, you leave behind a cloud of smoke. The space you left is Lightly Obscured by that smoke until the end of your next turn."
    }
   ]
  }
 },
 {
  "id": "carpet-of-flying",
  "name": {
   "de": "Fliegender Teppich",
   "en": "Carpet of Flying"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst diesen Teppich schweben und fliegen lassen, indem du eine magische Aktion ausführst und das Befehlswort des Teppichs aussprichst. Er folgt deinen Anweisungen, solange du dich im Abstand von bis zu neun Metern von ihm befindest. Es gibt vier Größen des Fliegenden Teppichs. Der SL wählt die Größe aus oder bestimmt sie zufällig, indem er anhand der folgenden Tabelle würfelt: Ein Teppich kann das Doppelte der in der Tabelle angegebenen Traglast befördern. Seine Flugbewegungsrate ist jedoch halbiert, wenn die angegebene Traglast überschritten wird."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Größe",
      "Traglast",
      "Flugbewegungsrate"
     ],
     "reihen": [
      [
       "1–20",
       "0,9 m × 1,5 m",
       "100 kg",
       "24 m"
      ],
      [
       "21–55",
       "1,2 m × 1,8 m",
       "200 kg",
       "18 m"
      ],
      [
       "56–80",
       "1,5 m × 2,1 m",
       "300 kg",
       "12 m"
      ],
      [
       "81–100",
       "1,8 m × 2,7 m",
       "400 kg",
       "9 m"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can make this carpet hover and fly by taking a Magic action and using the carpet’s command word. It moves according to your directions if you are within 30 feet of it. Four sizes of Carpet of Flying exist. The GM chooses the size of a given carpet or determines it randomly by rolling on the following table. A carpet can carry up to twice the weight shown on the table, but its Fly Speed is halved if it carries more than its normal capacity."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Size",
      "Capacity",
      "Fly Speed"
     ],
     "reihen": [
      [
       "01–20",
       "3 ft. × 5 ft.",
       "200 lb.",
       "80 feet"
      ],
      [
       "21–55",
       "4 ft. × 6 ft.",
       "400 lb.",
       "60 feet"
      ],
      [
       "56–80",
       "5 ft. × 7 ft.",
       "600 lb.",
       "40 feet"
      ],
      [
       "81–00",
       "6 ft. × 9 ft.",
       "800 lb.",
       "30 feet"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "censer-of-controlling-air-elementals",
  "name": {
   "de": "Rauchfass der Luftelementar-Herrschaft",
   "en": "Censer of Controlling Air Elementals"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Rauchfass sanft schwingst, kannst du eine magische Aktion ausführen, um einen Luftelementar herbeizurufen. Der Elementar erscheint in einem freien Bereich so nahe wie möglich beim Rauchfass. Er versteht deine Sprachen, gehorcht deinen Befehlen und ist bei deinem Initiativewert unmittelbar nach dir am Zug. Der Elementar verschwindet, wenn eine Stunde vergangen ist, er stirbt oder du ihn als Bonusaktion verwirfst. Wurde das Rauchfass verwendet, so kann es erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While gently swinging this censer, you can take a Magic action to summon an Air Elemental. The elemental appears in an unoccupied space as close to the censer as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The censer can’t be used this way again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "chime-of-opening",
  "name": {
   "de": "Glocke des Öffnens",
   "en": "Chime of Opening"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses hohle Metallrohr ist etwa 30 Zentimeter lang und wiegt 0,5 Kilogramm. Du kannst als magische Aktion die Glocke läuten, um den Zauber Klopfen zu wirken. Das übliche Klopfgeräusch des Zaubers wird durch den klaren Ton der Glocke ersetzt, der bis zu 90 Meter weit zu hören ist. Die Glocke kann zehn Mal verwendet werden. Nach dem zehnten Mal springt sie und wird unbrauchbar."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This hollow metal tube measures about 1 foot long and weighs 1 pound. As a Magic action, you can strike the chime to cast Knock. The spell’s customary knocking sound is replaced by the clear, ringing tone of the chime, which is audible out to 300 feet. The chime can be used 10 times. After the tenth time, it cracks and becomes useless."
    }
   ]
  }
 },
 {
  "id": "circlet-of-blasting",
  "name": {
   "de": "Diadem des Versengens",
   "en": "Circlet of Blasting"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Diadem trägst, kannst du damit den Zauber Sengender Strahl (+5 auf Treffer) wirken. Danach kannst du diesen Zauber erst ab dem nächsten Morgengrauen erneut mit dem Diadem wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this circlet, you can cast Scorching Ray with it (+5 to hit). The circlet can’t cast this spell again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "cloak-of-arachnida",
  "name": {
   "de": "Umhang der Spinnentiere",
   "en": "Cloak of Arachnida"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Very Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser feine Umhang ist aus schwarzer Seide gewoben und mit zarten, silbrig glänzenden Fäden durchwirkt. Wenn du ihn trägst, erhältst du die folgenden Vorzüge:"
    },
    {
     "typ": "punkt",
     "text": "Giftresistenz: Du bist gegen Giftschaden resistent."
    },
    {
     "typ": "punkt",
     "text": "Spinnenklettern: Du hast eine Kletterbewegungsrate in Höhe deiner Bewegungsrate und kannst dich in alle Richtungen, über senkrechte Oberflächen sowie an Decken entlang bewegen, wobei du die Hände frei hast."
    },
    {
     "typ": "punkt",
     "text": "Spinnennetz: Du kannst den Zauber Spinnennetz (Rettungswurf‑SG 13) wirken. Das durch den Zauber erzeugte Netz füllt einen Bereich, der doppelt so groß wie der übliche ist. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Spinnenschritt: Du kannst in keinerlei Netzen gefangen werden und bewegst dich durch Netze, als wären sie schwieriges Gelände."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This fine garment is made of black silk interwoven with faint, silvery threads. While wearing it, you gain the following benefits."
    },
    {
     "typ": "punkt",
     "text": "Poison Resistance. You have Resistance to Poison damage."
    },
    {
     "typ": "punkt",
     "text": "Spider Climb. You have a Climb Speed equal to your Speed and can move up, down, and across vertical surfaces and along ceilings, while leaving your hands free."
    },
    {
     "typ": "punkt",
     "text": "Spider Walk. You can’t be caught in webs of any sort and can move through webs as if they were Difficult Terrain."
    },
    {
     "typ": "punkt",
     "text": "Web. You can cast Web (save DC 13). The web created by the spell fills twice its normal area. Once used, this property can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "cloak-of-displacement",
  "name": {
   "de": "Umhang der Verlagerung",
   "en": "Cloak of Displacement"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Umhang trägst, projiziert er auf magische Art eine Illusion, die dich in der Nähe deines eigentlichen Standorts erscheinen lässt. Dadurch sind Kreaturen bei Angriffswürfen gegen dich im Nachteil. Wenn du Schaden erleidest, kannst du diese Eigenschaft erst zu Beginn deines nächsten Zugs erneut verwenden. Diese Eigenschaft wird unterdrückt, solange deine Bewegungsrate 0 beträgt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear this cloak, it magically projects an illusion that makes you appear to be standing in a place near your actual location, causing any creature to have Disadvantage on attack rolls against you. If you take damage, the property ceases to function until the start of your next turn. This property is suppressed while your Speed is 0."
    }
   ]
  }
 },
 {
  "id": "cloak-of-elvenkind",
  "name": {
   "de": "Umhang der Elfen",
   "en": "Cloak of Elvenkind"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Umhang trägst, sind Weisheitswürfe (Wahrnehmung), die ausgeführt werden, um dich wahrzunehmen, im Nachteil, und du bist bei Geschicklichkeitswürfen (Heimlichkeit) im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear this cloak, Wisdom (Perception) checks made to perceive you have Disadvantage, and you have Advantage on Dexterity (Stealth) checks."
    }
   ]
  }
 },
 {
  "id": "cloak-of-invisibility",
  "name": {
   "de": "Umhang der Unsichtbarkeit",
   "en": "Cloak of Invisibility"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung)",
   "en": "Wondrous Item, Legendary (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Umhang hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du den Umhang trägst, kannst du eine magische Aktion ausführen, um dir die Kapuze über den Kopf zu ziehen, eine Ladung zu verbrauchen und dich eine Stunde lang unsichtbar zu machen. Der Effekt endet vorzeitig, wenn du die Kapuze abnimmst (keine Aktion erforderlich) oder den Umhang ablegst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This cloak has 3 charges and regains 1d3 expended charges daily at dawn. While wearing the cloak, you can take a Magic action to pull its hood over your head and expend 1 charge to give yourself the Invisible condition for 1 hour. The effect ends early if you pull the hood down (no action required) or cease wearing the cloak."
    }
   ]
  }
 },
 {
  "id": "cloak-of-protection",
  "name": {
   "de": "Umhang des Schutzes",
   "en": "Cloak of Protection"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Umhang trägst, erhältst du einen Bonus von +1 auf deine Rüstungsklasse und deine Rettungswürfe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to Armor Class and saving throws while you wear this cloak."
    }
   ]
  }
 },
 {
  "id": "cloak-of-the-bat",
  "name": {
   "de": "Umhang der Fledermaus",
   "en": "Cloak of the Bat"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Umhang trägst, bist du bei Geschicklichkeitswürfen (Heimlichkeit) im Vorteil. In Bereichen mit dämmrigem Licht oder Dunkelheit kannst du die Säume ergreifen und den Umhang verwenden, um eine Flugbewegungsrate von zwölf Metern zu erhalten. Wenn dir die Säume entgleiten, während du auf diese Weise fliegst, oder wenn du dich nicht mehr in dämmrigem Licht oder in Dunkelheit befindest, verlierst du die Flugbewegungsrate. Wenn du den Umhang in Bereichen mit dämmrigem Licht oder Dunkelheit trägst, kannst du Verwandlung auf dich selbst wirken und die Gestalt einer Fledermaus annehmen. In dieser Gestalt behältst du deine Werte für Intelligenz, Weisheit und Charisma bei. Wurde der Umhang verwendet, so kann er erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this cloak, you have Advantage on Dexterity (Stealth) checks. In an area of Dim Light or Darkness, you can grip the edges of the cloak and use it to gain a Fly Speed of 40 feet. If you ever fail to grip the cloak’s edges while flying in this way, or if you are no longer in Dim Light or Darkness, you lose this Fly Speed. While wearing the cloak in an area of Dim Light or Darkness, you can cast Polymorph on yourself, shape-shifting into a Bat. While in that form, you retain your Intelligence, Wisdom, and Charisma scores. The cloak can’t be used this way again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "cloak-of-the-manta-ray",
  "name": {
   "de": "Umhang des Mantarochens",
   "en": "Cloak of the Manta Ray"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Umhang trägst, kannst du unter Wasser atmen und hast eine Schwimmbewegungsrate von 18 Metern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this cloak, you can breathe underwater, and you have a Swim Speed of 60 feet."
    }
   ]
  }
 },
 {
  "id": "crystal-ball",
  "name": {
   "de": "Kristallkugel",
   "en": "Crystal Ball"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Very Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Kristallkugel berührst, kannst du Ausspähung (Rettungswurf‑SG 17) damit wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While touching this crystal orb, you can cast Scrying (save DC 17) with it."
    }
   ]
  }
 },
 {
  "id": "crystal-ball-of-mind-reading",
  "name": {
   "de": "Kristallkugel des Gedankenlesens",
   "en": "Crystal Ball of Mind Reading"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung)",
   "en": "Wondrous Item, Legendary (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Kristallkugel berührst, kannst du Ausspähung (Rettungswurf‑SG 17) damit wirken. Außerdem kannst du den Zauber Gedanken wahrnehmen (Rettungswurf‑SG 17) auf Kreaturen im Abstand von bis zu neun Metern vom Sensor des Zaubers wirken, die du sehen kannst. Du brauchst dich nicht auf den Zauber Gedanken wahrnehmen zu konzentrieren, um ihn während seiner Wirkungsdauer aufrechtzuerhalten. Er endet jedoch, wenn der Zauber Ausspähung endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While touching this crystal orb, you can cast Scrying (save DC 17) with it. In addition, you can cast Detect Thoughts (save DC 17) targeting creatures you can see within 30 feet of the spell’s sensor. You don’t need to concentrate on this Detect Thoughts spell to maintain it during its duration, but it ends if the Scrying spell ends."
    }
   ]
  }
 },
 {
  "id": "crystal-ball-of-telepathy",
  "name": {
   "de": "Kristallkugel der Telepathie",
   "en": "Crystal Ball of Telepathy"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung)",
   "en": "Wondrous Item, Legendary (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Kristallkugel berührst, kannst du Ausspähung (Rettungswurf‑SG 17) damit wirken. Außerdem kannst du telepathisch mit Kreaturen im Abstand von bis zu neun Metern vom Sensor des Zaubers kommunizieren, die du sehen kannst. Du kannst auf eine dieser Kreaturen auch den Zauber Einflüsterung (Rettungswurf‑SG 17) durch den Sensor wirken. Du brauchst dich nicht auf den Zauber Einflüsterung zu konzentrieren, um ihn während seiner Wirkungsdauer aufrechtzuerhalten. Er endet jedoch, wenn der Zauber Ausspähung endet. Du kannst Einflüsterung erst ab dem nächsten Morgengrauen erneut auf diese Art verwenden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While touching this crystal orb, you can cast Scrying (save DC 17) with it. In addition, you can communicate telepathically with creatures you can see within 30 feet of the spell’s sensor. You can also cast Suggestion (save DC 17) through the sensor on one of those creatures. You don’t need to concentrate on this Suggestion to maintain it during its duration, but it ends if Scrying ends. You can’t cast Suggestion in this way again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "crystal-ball-of-true-seeing",
  "name": {
   "de": "Kristallkugel des Wahren Blicks",
   "en": "Crystal Ball of True Seeing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung)",
   "en": "Wondrous Item, Legendary (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Kristallkugel berührst, kannst du Ausspähung (Rettungswurf‑SG 17) damit wirken. Außerdem hast du Wahrer Blick mit einer Reichweite von 36 Metern um den Sensor des Zaubers."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While touching this crystal orb, you can cast Scrying (save DC 17) with it. In addition, you have Truesight with a range of 120 feet centered on the spell’s sensor."
    }
   ]
  }
 },
 {
  "id": "cube-of-force",
  "name": {
   "de": "Würfel der Kraft",
   "en": "Cube of Force"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Würfel hat eine Kantenlänge von etwa 2,5 Zentimetern. Jede Würfelseite weist eine eindeutige Markierung auf. Du kannst auf jede dieser Seiten drücken, die erforderliche Anzahl von Ladungen verbrauchen und so den jeweiligen Zauber (Rettungswurf‑SG 17) wirken, wie in der Tabelle „Seiten des Würfels der Kraft“ dargestellt. Der Würfel hat zunächst zehn Ladungen. Er erhält täglich im Morgengrauen 1W6 verbrauchte Ladungen zurück."
    },
    {
     "typ": "tabelle",
     "titel": "Seiten des Würfels der Kraft",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Magierrüstung",
       "1"
      ],
      [
       "Schild",
       "1"
      ],
      [
       "Winzige Hütte",
       "3"
      ],
      [
       "Privates Heiligtum",
       "4"
      ],
      [
       "Unverwüstliche Sphäre",
       "4"
      ],
      [
       "Energiewand",
       "5"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This cube is about an inch across. Each face has a distinct marking on it. You can press one of those faces, expend the number of charges required for it, and thereby cast the spell associated with it (save DC 17), as shown in the Cube of Force Faces table. The cube starts with 10 charges, and it regains 1d6 expended charges daily at dawn."
    },
    {
     "typ": "tabelle",
     "titel": "Cube of Force Faces",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Mage Armor",
       "1"
      ],
      [
       "Shield",
       "1"
      ],
      [
       "Tiny Hut",
       "3"
      ],
      [
       "Private Sanctum",
       "4"
      ],
      [
       "Resilient Sphere",
       "4"
      ],
      [
       "Wall of Force",
       "5"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "cubic-gate",
  "name": {
   "de": "Würfel der Ebenen",
   "en": "Cubic Gate"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Würfel hat eine Kantenlänge von 7,5 Zentimetern und strahlt spürbare magische Energie aus. Die sechs Seiten des Würfels sind jeweils mit einer bestimmten Existenzebene verbunden. Eine davon ist die materielle Ebene. Die anderen Seiten sind mit Ebenen verbunden, die der SL bestimmt. Der Würfel hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Du kannst als magische Aktion eine der Ladungen verbrauchen, um einen der folgenden Zauber mit dem Würfel zu wirken."
    },
    {
     "typ": "punkt",
     "text": "Ebenenwechsel: Wenn du zweimal auf eine Seite des Würfels drückst, wirkst du Ebenenwechsel und transportierst die Ziele auf die Existenzebene, die mit der Würfelseite verbunden ist."
    },
    {
     "typ": "punkt",
     "text": "Tor: Wenn du auf eine Seite des Würfels drückst, kannst du Tor wirken und ein Portal zu der Existenzebene öffnen, die mit der Würfelseite verbunden ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This cube is 3 inches across and radiates palpable magical energy. The six sides of the cube are each keyed to a different plane of existence, one of which is the Material Plane. The other sides are linked to planes determined by the GM. The cube has 3 charges and regains 1d3 expended charges daily at dawn. As a Magic action, you can expend 1 of the cube’s charges to cast one of the following spells using the cube."
    },
    {
     "typ": "punkt",
     "text": "Gate. Pressing one side of the cube, you cast Gate, opening a portal to the plane of existence keyed to that side."
    },
    {
     "typ": "punkt",
     "text": "Plane Shift. Pressing one side of the cube twice, you cast Plane Shift, transporting the targets to the plane of existence keyed to that side."
    }
   ]
  }
 },
 {
  "id": "dagger-of-venom",
  "name": {
   "de": "Dolch des Gifts",
   "en": "Dagger of Venom"
  },
  "kopfzeile": {
   "de": "Waffe (Dolch), selten",
   "en": "Weapon (Dagger), Rare"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Du kannst eine Bonusaktion ausführen, um die Klinge auf magische Art mit Gift zu überziehen. Das Gift bleibt wirksam, bis eine Minute vergangen ist oder eine Kreatur mit dieser Waffe getroffen wird. Diese Kreatur muss einen SG‑15‑Konstitutionsrettungswurf bestehen, oder sie erleidet 2W10 Giftschaden und ist eine Minute lang vergiftet. Wurde die Waffe verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. You can take a Bonus Action to magically coat the blade with poison. The poison remains for 1 minute or until an attack using this weapon hits a creature. That creature must succeed on a DC 15 Constitution saving throw or take 2d10 Poison damage and have the Poisoned condition for 1 minute. The weapon can’t be used this way again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "dancing-sword",
  "name": {
   "de": "Tanzendes Schwert",
   "en": "Dancing Sword"
  },
  "kopfzeile": {
   "de": "Waffe (Krummsäbel, Kurzschwert, Langschwert, Rapier oder Zweihandschwert), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Greatsword, Longsword, Rapier, Scimitar, or Shortsword), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst eine Bonusaktion ausführen, um diese magische Waffe in die Luft zu werfen. In diesem Fall beginnt sie zu schweben, fliegt bis zu neun Meter weit und greift eine Kreatur deiner Wahl im Abstand von bis zu 1,5 Metern von sich an. Die Waffe verwendet deinen Angriffswurf und fügt Schadenswürfen deinen Attributsmodifikator hinzu. Solange die Waffe schwebt, kannst du eine Bonusaktion ausführen, um sie bis zu neun Meter weit an einen anderen Ort im Abstand von bis zu neun Metern von dir fliegen zu lassen. Als Teil derselben Bonusaktion kannst du die Waffe eine Kreatur im Abstand von bis zu 1,5 Metern von sich angreifen lassen. Wenn die schwebende Waffe viermal angegriffen hat, fliegt sie zu dir und versucht, in deine Hand zurückzukehren. Falls du keine Hand frei hast, fällt die Waffe in deinem Bereich zu Boden. Falls die Waffe keinen freien Weg zu dir finden kann, bewegt sie sich so weit wie möglich in deine Richtung und fällt dann zu Boden. Sie hört auch auf zu schweben, wenn du sie ergreifst oder dich weiter als neun Meter von ihr entfernst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can take a Bonus Action to toss this magic weapon into the air. When you do so, the weapon begins to hover, flies up to 30 feet, and attacks one creature of your choice within 5 feet of itself. The weapon uses your attack roll and adds your ability modifier to damage rolls. While the weapon hovers, you can take a Bonus Action to cause it to fly up to 30 feet to another spot within 30 feet of you. As part of the same Bonus Action, you can cause the weapon to attack one creature within 5 feet of the weapon. After the hovering weapon attacks for the fourth time, it flies back to you and tries to return to your hand. If you have no hand free, the weapon falls to the ground in your space. If the weapon has no unobstructed path to you, it moves as close to you as it can and then falls to the ground. It also ceases to hover if you grasp it or are more than 30 feet away from it."
    }
   ]
  }
 },
 {
  "id": "decanter-of-endless-water",
  "name": {
   "de": "Karaffe des Endlosen Wassers",
   "en": "Decanter of Endless Water"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn diese verkorkte Karaffe geschüttelt wird, schwappt es darin, als enthielte sie Wasser. Die Karaffe wiegt ein Kilogramm. Du kannst eine magische Aktion ausführen, um den Stopfen zu entfernen und eines von drei Befehlswörtern auszusprechen. Daraufhin fließt eine bestimmte Menge von Süß ‑ oder Salzwasser (nach deiner Wahl) aus der Karaffe. Das Wasser hört zu Beginn deines nächsten Zugs auf zu fließen. Wähle eines der folgenden Befehlswörter aus:"
    },
    {
     "typ": "stichpunkt",
     "text": "Spritzer: Die Karaffe erzeugt vier Liter Wasser."
    },
    {
     "typ": "stichpunkt",
     "text": "Springbrunnen: Die Karaffe erzeugt 20 Liter Wasser."
    },
    {
     "typ": "stichpunkt",
     "text": "Geysir: Die Karaffe erzeugt 120 Liter Wasser, das in einer neun Meter langen und 30 Zentimeter breiten Linie herausschießt. Wenn du die Karaffe hältst, kannst du mit dem Geysir in eine bestimmte Richtung zielen (keine Aktion erforderlich). Eine Kreatur deiner Wahl in der Linie muss einen SG‑13‑Stärkerettungswurf bestehen, oder sie erleidet 1W4 Wuchtschaden, wird umgestoßen und hat den Zustand Liegend. Du kannst statt auf eine Kreatur auch auf einen Gegenstand zielen, der nicht getragen oder gehalten wird und der nicht mehr als 100 Kilogramm wiegt. Der Gegenstand wird vom Geysir umgestoßen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This stoppered flask sloshes when shaken, as if it contains water. The decanter weighs 2 pounds. You can take a Magic action to remove the stopper and issue one of three command words, whereupon an amount of fresh water or salt water (your choice) pours out of the flask. The water stops pouring out at the start of your next turn. Choose from the following command words:"
    },
    {
     "typ": "stichpunkt",
     "text": "Splash. The decanter produces 1 gallon of water."
    },
    {
     "typ": "stichpunkt",
     "text": "Fountain. The decanter produces 5 gallons of water."
    },
    {
     "typ": "stichpunkt",
     "text": "Geyser. The decanter produces 30 gallons of water that gushes forth in a Line 30 feet long and 1 foot wide. If you’re holding the decanter, you can aim the geyser in one direction (no action required). One creature of your choice in the Line must succeed on a DC 13 Strength saving throw or take 1d4 Bludgeoning damage and have the Prone condition. Instead of a creature, you can target one object in the Line that isn’t being worn or carried and that weighs no more than 200 pounds. The object is knocked over by the geyser."
    }
   ]
  }
 },
 {
  "id": "deck-of-illusions",
  "name": {
   "de": "Karten der Illusionen",
   "en": "Deck of Illusions"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Schatulle enthält einen Satz Karten. Ein vollständiger Satz besteht aus 34 Karten. Davon stellen 32 bestimmte Kreaturen dar, und zwei haben eine spiegelnde Oberfläche. Wenn die Karten als Teil eines Schatzes gefunden werden, fehlen in der Regel 1W20‑1 Karten. Die Magie des Kartensatzes funktioniert nur, wenn die Karten zufällig gezogen werden. Du kannst eine magische Aktion ausführen, um eine zufällige Karte aus dem Stapel zu ziehen und an einem Punkt im Abstand von bis zu neun Metern von dir zu Boden zu werfen. Über dieser Karte manifestiert sich die Illusion einer Kreatur, welche durch Würfeln anhand der Tabelle „Karten der Illusionen“ ermittelt wird. Die Illusion bleibt bestehen, bis sie gebannt wird. Sie sieht aus und verhält sich wie eine echte Kreatur dieses Typs, kann allerdings keinen Schaden bewirken. Befindest du dich im Abstand von bis zu 36 Metern von der Kreatur und kannst sie sehen, so kannst du eine magische Aktion ausführen, um sie an einen anderen Ort im Abstand von bis zu neun Metern von ihrer Karte zu bewegen. Physische Interaktionen mit der Kreatur enttarnen sie als illusionär, da Gegenstände sie durchdringen. Eine Kreatur kann eine Studieren‑Aktion ausführen, um die illusionäre Kreatur visuell zu inspizieren. Sie erkennt sie als Illusion, wenn sie einen SG‑15‑Intelligenzwurf (Nachforschungen) besteht. Die Illusion bleibt bestehen, bis sie gebannt (mit dem Zauber Magie bannen oder einem ähnlichen Effekt) oder ihre Karte bewegt wird. Mit der Illusion verschwindet auch das Bild auf der entsprechenden Karte, und diese kann nicht erneut verwendet werden."
    },
    {
     "typ": "tabelle",
     "titel": "Karten der Illusionen",
     "kopf": [
      "1W100",
      "Illusion*"
     ],
     "reihen": [
      [
       "1–3",
       "Assassine"
      ],
      [
       "4–6",
       "Ausgewachsener roter Drache"
      ],
      [
       "7–9",
       "Banditenhauptmann"
      ],
      [
       "10–12",
       "Basilisk"
      ],
      [
       "13–15",
       "Berserker"
      ],
      [
       "16–18",
       "Druide"
      ],
      [
       "19–21",
       "Eisengolem"
      ],
      [
       "22–24",
       "Erinnye"
      ],
      [
       "25–27",
       "Erzmagier"
      ],
      [
       "28–30",
       "Ettin"
      ],
      [
       "31–33",
       "Feuerriese"
      ],
      [
       "34–36",
       "Frostriese"
      ],
      [
       "37–39",
       "Gnollkrieger"
      ],
      [
       "40–42",
       "Goblinkrieger"
      ],
      [
       "43–45",
       "Grottenschratkrieger"
      ],
      [
       "46–48",
       "Hobgoblin-Krieger"
      ],
      [
       "49–51",
       "Hügelriese"
      ],
      [
       "52–54",
       "Inkubus"
      ],
      [
       "55–57",
       "Koboldkrieger"
      ],
      [
       "58–60",
       "Lich"
      ],
      [
       "61–63",
       "Medusa"
      ],
      [
       "64–66",
       "Nachtvettel"
      ],
      [
       "67–69",
       "Oger"
      ],
      [
       "70–72",
       "Oni"
      ],
      [
       "73–75",
       "Priester"
      ],
      [
       "76–78",
       "Ritter"
      ],
      [
       "79–81",
       "Sukkubus"
      ],
      [
       "82–84",
       "Troll"
      ],
      [
       "85–87",
       "Veteranenkrieger"
      ],
      [
       "88–90",
       "Wächternaga"
      ],
      [
       "91–93",
       "Wolkenriese"
      ],
      [
       "94–96",
       "Wyvern"
      ],
      [
       "97–100",
       "Der Kartenzieher"
      ],
      [
       "*Wertekästen findest du im",
       "für diese Kreaturen (außer dem Kartenzieher) Monsterhandbuch."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This box contains a set of cards. A full deck has 34 cards: 32 depicting specific creatures and two with a mirrored surface. A deck found as treasure is usually missing 1d20 − 1 cards. The magic of the deck functions only if its cards are drawn at random. You can take a Magic action to draw a card at random from the deck and throw it to the ground at a point within 30 feet of yourself. An illusion of a creature, determined by rolling on the Deck of Illusions table, forms over the thrown card and remains until dispelled. The illusory creature created by the card looks and behaves like a real creature of its kind, except that it can do no harm. While you are within 120 feet of the illusory creature and can see it, you can take a Magic action to move it anywhere within 30 feet of its card. Any physical interaction with the illusory creature reveals it to be false, because objects pass through it. A creature that takes a Study action to visually inspect the illusory creature identifies it as an illusion with a successful DC 15 Intelligence (Investigation) check. The illusion lasts until its card is moved or the illusion is dispelled (using a Dispel Magic spell or a similar effect). When the illusion ends, the image on its card disappears, and that card can’t be used again."
    },
    {
     "typ": "tabelle",
     "titel": "Deck of Illusions",
     "kopf": [
      "1d100",
      "Illusion*"
     ],
     "reihen": [
      [
       "01–03",
       "Adult Red Dragon"
      ],
      [
       "04–06",
       "Archmage"
      ],
      [
       "07–09",
       "Assassin"
      ],
      [
       "10–12",
       "Bandit Captain"
      ],
      [
       "13–15",
       "Basilisk"
      ],
      [
       "16–18",
       "Berserker"
      ],
      [
       "19–21",
       "Bugbear Warrior"
      ],
      [
       "22–24",
       "Cloud Giant"
      ],
      [
       "25–27",
       "Druid"
      ],
      [
       "28–30",
       "Erinyes"
      ],
      [
       "31–33",
       "Ettin"
      ],
      [
       "34–36",
       "Fire Giant"
      ],
      [
       "37–39",
       "Frost Giant"
      ],
      [
       "40–42",
       "Gnoll Warrior"
      ],
      [
       "43–45",
       "Goblin Warrior"
      ],
      [
       "46–48",
       "Guardian Naga"
      ],
      [
       "49–51",
       "Hill Giant"
      ],
      [
       "52–54",
       "Hobgoblin Warrior"
      ],
      [
       "55–57",
       "Incubus"
      ],
      [
       "58–60",
       "Iron Golem"
      ],
      [
       "61–63",
       "Knight"
      ],
      [
       "64–66",
       "Kobold Warrior"
      ],
      [
       "67–69",
       "Lich"
      ],
      [
       "70–72",
       "Medusa"
      ],
      [
       "73–75",
       "Night Hag"
      ],
      [
       "76–78",
       "Ogre"
      ],
      [
       "79–81",
       "Oni"
      ],
      [
       "82–84",
       "Priest"
      ],
      [
       "85–87",
       "Succubus"
      ],
      [
       "88–90",
       "Troll"
      ],
      [
       "91–93",
       "Veteran Warrior"
      ],
      [
       "94–96",
       "Wyvern"
      ],
      [
       "97–00",
       "The card drawer"
      ],
      [
       "*Stat blocks “Monsters.”",
       "for these creatures (except the card drawer) appear in"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "defender",
  "name": {
   "de": "Verteidiger",
   "en": "Defender"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige Nahkampfwaffe), legendär (erfordert Einstimmung)",
   "en": "Weapon (Any Melee Weapon), Legendary (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +3 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Beim ersten Angriff mit der Waffe in jedem deiner Züge kannst du einen Teil oder den gesamten Bonus der Waffe auf deine Rüstungsklasse übertragen, statt ihn in dem Zug für Angriffe zu verwenden. Beispiel: Du könntest den Bonus für deine Angriffs ‑ und Schadenswürfe auf +1 verringern und einen Bonus von +2 auf deine Rüstungsklasse erhalten. Die angepassten Boni bleiben bis zum Beginn deines nächsten Zugs bestehen. Du musst die Waffe allerdings in der Hand halten, um einen Bonus auf deine RK zu erhalten."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. The first time you attack with the weapon on each of your turns, you can transfer some or all of the weapon’s bonus to your Armor Class. For example, you could reduce the bonus to your attack rolls and damage rolls to +1 and gain a +2 bonus to Armor Class. The adjusted bonuses remain in effect until the start of your next turn, although you must hold the weapon to gain a bonus to AC from it."
    }
   ]
  }
 },
 {
  "id": "demon-armor",
  "name": {
   "de": "Dämonenrüstung",
   "en": "Demon Armor"
  },
  "kopfzeile": {
   "de": "Rüstung (beliebige leichte, mittelschwere oder schwere Rüstung), sehr selten (erfordert Einstimmung)",
   "en": "Armor (Any Light, Medium, or Heavy), Very Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, erhältst du einen Bonus von +1 auf deine Rüstungsklasse, und du kannst Abyssisch verstehen und sprechen. Außerdem sorgen die klauenbewehrten Panzerhandschuhe der Rüstung dafür, dass deine waffenlosen Angriffe 1W8 Hiebschaden anstatt den üblichen Wuchtschaden bewirken, und du erhältst einen Bonus von +1 auf die Angriffs ‑ und Schadenswürfe deiner waffenlosen Angriffe."
    },
    {
     "typ": "punkt",
     "text": "Fluch: Wenn du diese verfluchte Rüstung angelegt hast, kannst du sie erst wieder ablegen, wenn du das Ziel des Zaubers Fluch brechen oder ähnlicher Magie wirst. Wenn du die Rüstung trägst, bist du bei Angriffswürfen gegen Dämonen sowie bei Rettungswürfen gegen ihre Zauber und Spezialfähigkeiten im Nachteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this armor, you gain a +1 bonus to Armor Class, and you know Abyssal. In addition, the armor’s clawed gauntlets allow your Unarmed Strikes to deal 1d8 Slashing damage instead of the usual Bludgeoning damage, and you gain a +1 bonus to the attack and damage rolls of your Unarmed Strikes."
    },
    {
     "typ": "punkt",
     "text": "Curse. Once you don this cursed armor, you can’t doff it unless you are targeted by a Remove Curse spell or similar magic. While wearing the armor, you have Disadvantage on attack rolls against demons and on saving throws against their spells and special abilities."
    }
   ]
  }
 },
 {
  "id": "dimensional-shackles",
  "name": {
   "de": "Dimensionsfesseln",
   "en": "Dimensional Shackles"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst diese Fesseln als Verwenden‑Aktion einer kampfunfähigen Kreatur anlegen. Die Fesseln passen sich an kleine bis große Kreaturen an. Sie verhindern außerdem, dass die gefesselte Kreatur irgendeine Form von extradimensionaler Bewegung nutzen kann. Dazu gehören Teleportation und Reisen in eine andere Existenzebene. Die Fesseln hindern die Kreatur nicht daran, ein interdimensionales Portal zu durchqueren. Du und jede Kreatur, die du beim Anlegen der Fesseln bestimmst, könnt sie mit der Verwenden‑Aktion entfernen. Die gefesselte Kreatur kann alle 30 Tage einmal einen SG‑30‑Stärkewurf (Athletik) ausführen. Bei einem Erfolg befreit sie sich und zerstört die Fesseln."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can take a Utilize action to place these shackles on a creature that has the Incapacitated condition. The shackles adjust to fit a creature of Small to Large size. The shackles prevent a creature bound by them from using any method of extradimensional movement, including teleportation or travel to a different plane of existence. They don’t prevent the creature from passing through an interdimensional portal. You and any creature you designate when you use the shackles can take a Utilize action to remove them. Once every 30 days, the bound creature can make a DC 30 Strength (Athletics) check. On a successful check, the creature breaks free and destroys the shackles."
    }
   ]
  }
 },
 {
  "id": "dragon-orb",
  "name": {
   "de": "Kugel der Drachen",
   "en": "Dragon Orb"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, Artefakt (erfordert Einstimmung)",
   "en": "Wondrous Item, Artifact (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "artifact"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kugel ist eine geätzte Kristallkugel mit einem Durchmesser von rund 25 Zentimetern. Wenn sie verwendet wird, wächst ihr Durchmesser auf rund 50 Zentimeter an, und in ihrem Inneren beginnt ein Nebel zu wirbeln. Wenn du auf eine Kugel eingestimmt bist, kannst du eine magische Aktion ausführen, um in die Tiefen der Kugel zu blicken. Du musst dann einen SG‑15‑Charismarettungswurf ausführen. Bei einem erfolgreichen Rettungswurf kontrollierst du die Kugel, solange du auf sie eingestimmt bist. Misslingt der Wurf, so bist du von der Kugel bezaubert, solange du auf sie eingestimmt bist. Solange du auf diese Art bezaubert bist, kannst du deine Einstimmung auf die Kugel nicht freiwillig beenden, und die Kugel wirkt beliebig oft Einflüsterung (Rettungswurf‑SG 18) auf dich und stachelt dich an, ihre bösen Ziele zu verfolgen. Die Drachenessenz in der Kugel kann viele verschiedene Ziele haben: Auslöschung einer bestimmten Gesellschaft oder Organisation, Freiheit von der Kugel, Mehrung des Leids in der Welt, von Tiamats Gefolgschaft oder ein Ziel nach Wahl des SL."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Die Kugel hat sieben Ladungen und erhält täglich im Morgengrauen 1W4+3 verbrauchte Ladungen zurück. Wenn du die Kugel kontrollierst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken. In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Ausspähung (Rettungswurf-SG 18)",
       "3"
      ],
      [
       "Magie entdecken",
       "0"
      ],
      [
       "Tageslicht",
       "1"
      ],
      [
       "Todesschutz",
       "2"
      ],
      [
       "Wunden heilen (Version des 9. Grades)",
       "4"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Drachen herbeirufen: Wenn du die Kugel kontrollierst, kannst du eine magische Aktion ausführen, damit die Kugel einen telepathischen Ruf 65 Kilometer weit in alle Richtungen aussendet. Chromatische Drachen in Reichweite fühlen sich genötigt, so schnell wie möglich und auf direktem Wege zur Kugel zu kommen. Auf Drachengottheiten wie Tiamat wirkt dieser Ruf nicht. Chromatische Drachen, die von der Kugel angezogen werden, können dir feindlich gesinnt sein, weil du sie genötigt hast. Wurde diese Eigenschaft verwendet, so kann sie erst eine Stunde später erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Eine Kugel zerstören: Eine Kugel der Drachen besitzt eine RK von 20 und wird zerstört, wenn sie Schaden durch eine Waffe +3 oder den Zauber Auflösung erleidet. Ansonsten ist sie unzerstörbar."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An orb is an etched crystal globe about 10 inches in diameter. When used, it grows to about 20 inches in diameter, and mist swirls inside it. While attuned to an orb, you can take a Magic action to peer into the orb’s depths. You must then make a DC 15 Charisma saving throw. On a successful save, you control the orb for as long as you remain attuned to it. On a failed save, the orb imposes the Charmed condition on you for as long as you remain attuned to it. While you are Charmed by the orb, you can’t voluntarily end your Attunement to it, and the orb casts Suggestion on you at will (save DC 18), urging you to work toward the evil ends it desires. The dragon essence within the orb might want many things: the annihilation of a particular society or organization, freedom from the orb, to spread suffering in the world, to advance the worship of Tiamat, or something else the GM decides."
    },
    {
     "typ": "punkt",
     "text": "Spells. The orb has 7 charges and regains 1d4 + 3 expended charges daily at dawn. If you control the orb, you can cast one of the spells on the following table from it. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Cure Wounds (level 9 version)",
       "4"
      ],
      [
       "Daylight",
       "1"
      ],
      [
       "Death Ward",
       "2"
      ],
      [
       "Detect Magic",
       "0"
      ],
      [
       "Scrying (save DC 18)",
       "3"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Call Dragons. While you control the orb, you can take a Magic action to cause the orb to issue a telepathic call that extends in all directions for 40 miles. Chromatic dragons in range feel compelled to come to the orb as soon as possible by the most direct route. Dragon deities such as Tiamat are unaffected by this call. Chromatic dragons drawn to the orb might be Hostile toward you for compelling them against their will. Once you have used this property, it can’t be used again for 1 hour."
    },
    {
     "typ": "punkt",
     "text": "Destroying an Orb. A Dragon Orb has AC 20 and is destroyed if it takes damage from a +3 Weapon or a Disintegrate spell. Nothing else can harm it."
    }
   ]
  }
 },
 {
  "id": "dragon-scale-mail",
  "name": {
   "de": "Drachenschuppenpanzer",
   "en": "Dragon Scale Mail"
  },
  "kopfzeile": {
   "de": "Rüstung (Schuppenpanzer), sehr selten (erfordert Einstimmung)",
   "en": "Armor (Scale Mail), Very Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Drachenschuppenpanzer besteht aus den Schuppen einer bestimmten Drachenart. Manchmal sammeln Drachen ihre abgeworfenen Schuppen und schenken sie Humanoiden. In anderen Fällen machen Jäger die Haut eines toten Drachen sorgsam haltbar. Unabhängig von ihrer Herkunft sind Drachenschuppenpanzer extrem wertvoll. Wenn du diese Rüstung trägst, erhältst du einen Bonus von +1 auf deine RK, bist bei Rettungswürfen gegen die Odemwaffen von Drachen im Vorteil und gegen eine Schadensart resistent. Die Schadensart hängt von der Drachenart ab, von der die Schuppen stammen (siehe Tabelle). Außerdem kannst du dich als magische Aktion konzentrieren und die Entfernung und Richtung des nächsten Drachen im Abstand von bis zu 48 Kilometern von dir erspüren, dessen Art zu den Drachenschuppen deines Panzers passt. Diese Aktion kann erst ab dem nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Drache",
      "Resistenz"
     ],
     "reihen": [
      [
       "Blau",
       "Blitz"
      ],
      [
       "Bronze",
       "Blitz"
      ],
      [
       "Gold",
       "Feuer"
      ],
      [
       "Grün",
       "Gift"
      ],
      [
       "Kupfer",
       "Säure"
      ],
      [
       "Messing",
       "Feuer"
      ],
      [
       "Rot",
       "Feuer"
      ],
      [
       "Schwarz",
       "Säure"
      ],
      [
       "Silber",
       "Kälte"
      ],
      [
       "Weiß",
       "Kälte"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Dragon Scale Mail is made of the scales of one kind of dragon. Sometimes dragons collect their cast-off scales and gift them. Other times, hunters carefully preserve the hide of a dead dragon. In either case, Dragon Scale Mail is highly valued. While wearing this armor, you gain a +1 bonus to Armor Class, you have Advantage on saving throws against the breath weapons of Dragons, and you have Resistance to one damage type determined by the kind of dragon that provided the scales (see the accompanying table). Additionally, you can focus your senses as a Magic action to discern the distance and direction to the closest dragon within 30 miles of yourself that is of the same type as the armor. This action can’t be used again until the next dawn."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Dragon",
      "Resistance"
     ],
     "reihen": [
      [
       "Black",
       "Acid"
      ],
      [
       "Blue",
       "Lightning"
      ],
      [
       "Brass",
       "Fire"
      ],
      [
       "Bronze",
       "Lightning"
      ],
      [
       "Copper",
       "Acid"
      ],
      [
       "Gold",
       "Fire"
      ],
      [
       "Green",
       "Poison"
      ],
      [
       "Red",
       "Fire"
      ],
      [
       "Silver",
       "Cold"
      ],
      [
       "White",
       "Cold"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "dragon-slayer",
  "name": {
   "de": "Drachentöter",
   "en": "Dragon Slayer"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige einfache Waffe oder Kriegswaffe), selten",
   "en": "Weapon (Any Simple or Martial), Rare"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Die Waffe bewirkt zusätzlich 3W6 Schaden nach Art der Waffe, wenn das Ziel ein Drache ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. The weapon deals an extra 3d6 damage of the weapon’s type if the target is a Dragon."
    }
   ]
  }
 },
 {
  "id": "dust-of-disappearance",
  "name": {
   "de": "Staub des Verschwindens",
   "en": "Dust of Disappearance"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses Pulver ähnelt feinem Sand. Es ist ausreichend für einen Einsatz. Wenn du eine Verwenden‑Aktion ausführst, um den Staub in die Luft zu werfen, seid du und alle Kreaturen und Gegenstände innerhalb einer Ausströmung von drei Metern, die von dir ausgeht, 2W4 Minuten lang unsichtbar. Die Dauer gilt für alle Ziele gleichermaßen. Der Staub wird verbraucht, wenn seine Magie wirkt. Wenn eine betroffene Kreatur einen Angriffswurf ausführt, der Schaden bewirkt, oder wenn sie einen Zauber wirkt, endet der Zustand Unsichtbar bei ihr sofort."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This powder resembles fine sand. There is enough of it for one use. When you take a Utilize action to throw the dust into the air, you and each creature and object within a 10-foot Emanation originating from you have the Invisible condition for 2d4 minutes. The duration is the same for all subjects, and the dust is consumed when its magic takes effect. Immediately after an affected creature makes an attack roll, deals damage, or casts a spell, the Invisible condition ends for that creature."
    }
   ]
  }
 },
 {
  "id": "dust-of-dryness",
  "name": {
   "de": "Staub der Trockenheit",
   "en": "Dust of Dryness"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses kleine Paket enthält 1W6+4 Prisen Staub. Du kannst als Verwenden‑Aktion eine Prise des Staubs auf Wasser streuen und dadurch einen Wasserwürfel von bis zu 4,5 Metern in ein murmelgroßes Kügelchen verwandeln, das beim bestäubten Bereich schwebt oder liegt. Das Gewicht des Kügelchens ist vernachlässigbar. Eine Kreatur kann die Verwenden‑Aktion ausführen und das Kügelchen kraftvoll gegen eine harte Oberfläche werfen, damit es zerspringt und das absorbierte Wasser wieder freisetzt. Dadurch wird das Kügelchen zerstört und seine Magie beendet. Du kannst als Verwenden‑Aktion eine Prise des Staubs auf einen Elementar im Abstand von bis zu 1,5 Metern von dir streuen, der überwiegend aus Wasser besteht (wie ein Wasserelementar). Der bestäubte Elementar führt einen SG‑13‑Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet er 10W6 nekrotischen Schaden, anderenfalls die Hälfte."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This small packet contains 1d6 + 4 pinches of dust. As a Utilize action, you can sprinkle a pinch of the dust over water, turning up to a 15-foot Cube of water into one marble-sized pellet, which floats or rests near where the dust was sprinkled. The pellet’s weight is negligible. A creature can take a Utilize action to smash the pellet against a hard surface, causing the pellet to shatter and release the water the dust absorbed. Doing so destroys the pellet and ends its magic. As a Utilize action, you can sprinkle a pinch of the dust on an Elemental within 5 feet of yourself that is composed mostly of water (such as a Water Elemental). Such a creature exposed to a pinch of the dust makes a DC 13 Constitution saving throw, taking 10d6 Necrotic damage on a failed save or half as much damage on a successful one."
    }
   ]
  }
 },
 {
  "id": "dust-of-sneezing-and-choking",
  "name": {
   "de": "Staub des Niesens und Erstickens",
   "en": "Dust of Sneezing and Choking"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses Pulver wird in einem kleinen Behälter gefunden und sieht wie Staub des Verschwindens aus. Auch der Zauber Identifizieren identifiziert es als solchen. Es ist ausreichend für einen Einsatz. Du kannst den Staub als Verwenden‑Aktion in die Luft werfen und dich selbst sowie jede Kreatur innerhalb einer Ausströmung von neun Metern, die von dir ausgeht, zu einem SG‑15‑Konstitutionsrettungswurf zwingen. Elementare, Konstrukte, Pflanzen, Schlicke und Untote bestehen den Rettungswurf automatisch. Misslingt der Wurf, so beginnt die Kreatur unkontrolliert zu niesen und zu ersticken, und sie ist kampfunfähig. Sie wiederholt den Rettungswurf am Ende jedes ihrer Züge. Bei einem Erfolg endet der Effekt bei ihr. Der Effekt endet auch bei jeder Kreatur, auf die der Zauber Schwache Genesung gewirkt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Found in a small container, this powder resembles Dust of Disappearance, and Identify reveals it to be such. There is enough of it for one use. As a Utilize action, you can throw the dust into the air, forcing yourself and every creature in a 30-foot Emanation originating from you to make a DC 15 Constitution saving throw. Constructs, Elementals, Oozes, Plants, and Undead succeed on the save automatically. On a failed save, a creature begins sneezing uncontrollably; it has the Incapacitated condition and is suffocating. The creature repeats the save at the end of each of its turns, ending the effect on itself on a success. The effect also ends on any creature targeted by a Lesser Restoration spell."
    }
   ]
  }
 },
 {
  "id": "dwarven-plate",
  "name": {
   "de": "Zwergische Ritterrüstung",
   "en": "Dwarven Plate"
  },
  "kopfzeile": {
   "de": "Rüstung (Plattenpanzer oder Ritterrüstung), sehr selten",
   "en": "Armor (Half Plate Armor or Plate Armor), Very Rare"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, erhältst du einen Bonus von +2 auf deine Rüstungsklasse. Wenn ein Effekt dich gegen deinen Willen über den Boden bewegt, kannst du außerdem eine Reaktion ausführen, um die Entfernung dieser Bewegung um bis zu drei Meter zu verringern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this armor, you gain a +2 bonus to Armor Class. In addition, if an effect moves you against your will along the ground, you can take a Reaction to reduce the distance you are moved by up to 10 feet."
    }
   ]
  }
 },
 {
  "id": "dwarven-thrower",
  "name": {
   "de": "Zwergischer Wurfhammer",
   "en": "Dwarven Thrower"
  },
  "kopfzeile": {
   "de": "Waffe (Kriegshammer), sehr selten (erfordert Einstimmung durch einen Zwerg oder eine Kreatur, die auf einen Zwergischen Gürtel eingestimmt ist)",
   "en": "Weapon (Warhammer), Very Rare (Requires Attunement by a Dwarf or a Creature Attuned to a Belt of Dwarvenkind)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +3 auf Angriffs‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Sie ist eine Wurfwaffe mit einer Grundreichweite von sechs Metern und einer Maximalreichweite von 18 Metern. Wenn du mit ihr bei einem Fernkampfangriff triffst, bewirkt sie zusätzlich 1W8 Energieschaden (2W8 Energieschaden, wenn das Ziel ein Riese ist). Sofort nach dem Angriff fliegt die Waffe zurück in deine Hand."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. It has the Thrown property with a normal range of 20 feet and a long range of 60 feet. When you hit with a ranged attack using this weapon, it deals an extra 1d8 Force damage, or an extra 2d8 Force damage if the target is a Giant. Immediately after hitting or missing, the weapon flies back to your hand."
    }
   ]
  }
 },
 {
  "id": "efficient-quiver",
  "name": {
   "de": "Effizienter Köcher",
   "en": "Efficient Quiver"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Köcher hat drei Fächer, die jeweils mit einem extradimensionalen Raum verbunden sind. So kann der Köcher zahlreiche Gegenstände fassen, ohne jemals mehr als ein Kilogramm zu wiegen. Das kürzeste Fach fasst bis zu 60 Pfeile, Bolzen oder ähnliche Gegenstände. Ins mittlere Fach passen bis zu 18 Wurfspeere oder ähnliche Gegenstände. Das längste Fach bietet genug Platz für sechs lange Gegenstände wie Bögen, Kampfstäbe oder Speere. Du kannst einen Gegenstand wie aus einem normalen Köcher oder einer normalen Scheide aus dem Köcher herausziehen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each of the quiver’s three compartments connects to an extradimensional space that allows the quiver to hold numerous items while never weighing more than 2 pounds. The shortest compartment can hold up to 60 Arrows, Bolts, or similar objects. The midsize compartment holds up to 18 Javelins or similar objects. The longest compartment holds up to 6 long objects, such as bows, Quarterstaffs, or Spears. You can draw any item the quiver contains as if doing so from a regular quiver or scabbard."
    }
   ]
  }
 },
 {
  "id": "efreeti-bottle",
  "name": {
   "de": "Ifrit-Flasche",
   "en": "Efreeti Bottle"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine magische Aktion ausführst, um den Stopfen dieser bemalten Messingflasche zu entfernen, entströmt ihr eine dichte Rauchwolke. Am Ende deines Zugs verschwindet der Rauch in einer harmlosen Stichflamme, und in einem freien Bereich im Abstand von bis zu neun Metern von dir erscheint ein Ifrit. Wenn die Flasche erstmals geöffnet wird, würfelt der SL anhand der folgenden Tabelle, um zu ermitteln, was geschieht."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W10",
      "Effekt"
     ],
     "reihen": [
      [
       "1",
       "Der Ifrit greift dich an. Nach fünf Kampfrunden verschwindet er, und die Flasche verliert ihre Magie."
      ],
      [
       "2–9",
       "Der Ifrit versteht deine Sprachen und gehorcht deinen Befehlen eine Stunde lang. Danach kehrt er in die Flasche zurück, die einen neuen Stopfen erhält. Der Stopfen kann 24 Stunden lang nicht entfernt werden. Wenn die Flasche die nächsten zwei Male geöffnet wird, tritt derselbe Effekt auf. Wenn die Flasche ein viertes Mal geöffnet wird, entflieht der Ifrit, und die Flasche verliert ihre Magie."
      ],
      [
       "10",
       "Der Ifrit versteht deine Sprachen und kann einmal den Zauber Wunsch für dich wirken. Wenn er den Wunsch gewährt hat oder eine Stunde vergangen ist, verschwindet er, und die Flasche verliert ihre Magie."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you take a Magic action to remove the stopper of this painted brass bottle, a cloud of thick smoke flows out of it. At the end of your turn, the smoke disappears with a flash of harmless fire, and an Efreeti appears in an unoccupied space within 30 feet of you. The first time the bottle is opened, the GM rolls on the following table to determine what happens."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d10",
      "Effect"
     ],
     "reihen": [
      [
       "1",
       "The efreeti attacks you. After fighting for 5 rounds, the efreeti disappears, and the bottle loses its magic."
      ],
      [
       "2–9",
       "The efreeti understands your languages and obeys your commands for 1 hour, after which it returns to the bottle, and a new stopper contains it. The stopper can’t be removed for 24 hours. The next two times the bottle is opened, the same effect occurs. If the bottle is opened a fourth time, the efreeti escapes and disappears, and the bottle loses its magic."
      ],
      [
       "10",
       "The efreeti understands your languages and can cast Wish once for you. It disappears when it grants the wish or after 1 hour, and the bottle loses its magic."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "elemental-gem",
  "name": {
   "de": "Elementarer Edelstein",
   "en": "Elemental Gem"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Edelstein enthält eine Spur von Elementarenergie. Wenn du eine Verwenden‑Aktion ausführst, um den Edelstein zu zerbrechen, wird ein Elementar beschworen (Wertekasten siehe „Monster“), und der Edelstein ist nicht mehr magisch. Der Elementar erscheint in einem freien Bereich so nahe wie möglich beim zerbrochenen Edelstein. Er versteht deine Sprachen, gehorcht deinen Befehlen und ist bei deinem Initiativewert unmittelbar nach dir am Zug. Der Elementar verschwindet, wenn eine Stunde vergangen ist, er stirbt oder du ihn als Bonusaktion verwirfst. Die Art des Edelsteins bestimmt den Elementar, wie in der folgenden Tabelle dargestellt:"
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Edelstein",
      "Beschworener Elementar"
     ],
     "reihen": [
      [
       "Blauer Saphir",
       "Luftelementar"
      ],
      [
       "Gelber Diamant",
       "Erdelementar"
      ],
      [
       "Roter Korund",
       "Feuerelementar"
      ],
      [
       "Smaragd",
       "Wasserelementar"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This gem contains a mote of elemental energy. When you take a Utilize action to break the gem, an elemental is summoned (see “Monsters” for its stat block), and the gem ceases to be magical. The elemental appears in an unoccupied space as close to the broken gem as possible, understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The type of gem determines the elemental, as shown in the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Gem",
      "Summoned Elemental"
     ],
     "reihen": [
      [
       "Blue sapphire",
       "Air Elemental"
      ],
      [
       "Emerald",
       "Water Elemental"
      ],
      [
       "Red corundum",
       "Fire Elemental"
      ],
      [
       "Yellow diamond",
       "Earth Elemental"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "elixir-of-health",
  "name": {
   "de": "Elixier der Gesundheit",
   "en": "Elixir of Health"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, wirst du von allen magischen Krankheiten geheilt. Außerdem enden die folgenden Zustände bei dir: Blind, Gelähmt, Taub und Vergiftet. In der klaren roten Flüssigkeit wirbeln kleine Lichtbläschen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you are cured of all magical contagions. In addition, the following conditions end on you: Blinded, Deafened, Paralyzed, and Poisoned. The clear, red liquid has tiny bubbles of light in it."
    }
   ]
  }
 },
 {
  "id": "elven-chain",
  "name": {
   "de": "Elfenrüstung",
   "en": "Elven Chain"
  },
  "kopfzeile": {
   "de": "Rüstung (Kettenhemd oder Kettenpanzer), selten",
   "en": "Armor (Chain Mail or Chain Shirt), Rare"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, erhältst du einen Bonus von +1 auf deine Rüstungsklasse. Außerdem bist du vertraut mit dieser Rüstung, auch wenn du keine Vertrautheit mit mittelschweren oder schweren Rüstungen hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to Armor Class while you wear this armor. You are considered trained with this armor even if you lack training with Medium or Heavy armor."
    }
   ]
  }
 },
 {
  "id": "energy-bow",
  "name": {
   "de": "Energiebogen",
   "en": "Energy Bow"
  },
  "kopfzeile": {
   "de": "Waffe (Kurzbogen oder Langbogen), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Longbow or Shortbow), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs‑ und Schadenswürfe mit dieser magischen Waffe, die keine Bogensehne aufweist. Wann immer du den Arm zurückziehst, als würdest du den Bogen spannen, erscheint ein schussbereit angelegter Pfeil aus goldener Energie. Ein Pfeil dieser Waffe bewirkt bei einem Treffer Energie‑ statt Stichschaden. Wenn er sein Ziel getroffen oder verfehlt hat, verschwindet er. Ehe der Pfeil verschwindet, spendet er in einem Radius von sechs Metern helles Licht und in einem Radius von weiteren sechs Metern dämmriges Licht. Diese Waffe hat folgende zusätzliche Eigenschaften:"
    },
    {
     "typ": "punkt",
     "text": "Energieleiter: Du kannst als magische Aktion mit dieser Waffe eine Serie von Energiepfeilen auf eine Wand im Abstand von bis zu 18 Metern von dir schießen. Die Pfeile werden zu leuchtenden Sprossen, die eine bis zu 18 Meter lange magische Leiter an der Wand bilden. Die Leiter bleibt eine Minute lang bestehen und verschwindet dann."
    },
    {
     "typ": "punkt",
     "text": "Pfeil des Festsetzens: Wann immer du mit dieser Waffe einen Fernkampfangriff gegen eine Kreatur ausführst, kannst du versuchen, das Ziel festzusetzen, statt ihm Schaden zuzufügen. Wenn der Pfeil trifft, muss das Ziel einen SG‑15‑Stärkerettungswurf bestehen, oder es ist eine Minute lang festgesetzt. Als Aktion kann eine vom Pfeil festgesetzte Kreatur einen SG‑20‑Stärkewurf (Athletik) ausführen, um sich zu befreien. Bei einem Erfolg endet der Effekt bei ihr."
    },
    {
     "typ": "punkt",
     "text": "Pfeil des Transports: Du kannst als magische Aktion einen Energiepfeil von dieser Waffe auf ein Ziel im Abstand von bis zu 18 Metern von dir schießen, das du sehen kannst. Das Ziel kann entweder eine bereitwillige Kreatur von höchstens mittelgroßer Größe oder ein Gegenstand sein, der nicht getragen oder gehalten wird, sofern er klein genug ist, um in einen Würfel von 1,5 Metern Kantenlänge zu passen. Der Pfeil teleportiert das Ziel in einen freien Bereich im Abstand von bis zu drei Metern von dir, den du sehen kannst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon, which has no string. Each time you pull your arm back in a firing motion, a magical arrow made of golden energy appears nocked and ready to fire. An arrow produced by this weapon deals Force damage instead of Piercing damage on a hit, and it disappears after it hits or misses its target. Until it disappears, the arrow emits Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. This weapon has the following additional properties."
    },
    {
     "typ": "punkt",
     "text": "Arrow of Restraint. Whenever you use this weapon to make a ranged attack against a creature, you can try to restrain the target instead of dealing damage to it. If the arrow hits, the target must succeed on a DC 15 Strength saving throw or have the Restrained condition for 1 minute. As an action, a creature Restrained by an arrow can make a DC 20 Strength (Athletics) check to try to break the restraint, ending the effect on itself on a successful check."
    },
    {
     "typ": "punkt",
     "text": "Arrow of Transport. As a Magic action, you can fire one energy arrow from this weapon at a target you can see within 60 feet of yourself. The target can be either a willing Medium or smaller creature or an object that isn’t being worn or carried, provided the object is small enough to fit inside a 5-foot Cube. The arrow teleports the target to an unoccupied space you can see within 10 feet of you."
    },
    {
     "typ": "punkt",
     "text": "Energy Ladder. As a Magic action, you can loose a flurry of energy arrows from this weapon at a wall up to 60 feet away from yourself. The arrows become glowing rungs that stick out of the wall, forming a magical ladder up to 60 feet long on the wall. This ladder lasts for 1 minute before disappearing."
    }
   ]
  }
 },
 {
  "id": "eversmoking-bottle",
  "name": {
   "de": "Rauchflasche",
   "en": "Eversmoking Bottle"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst als magische Aktion diese Flasche öffnen oder verschließen. Öffnest du sie, so entsteigt ihr dichter Rauch. Dieser bildet eine Wolke in einer Ausströmung von 18 Metern, die von der Flasche ausgeht. Der Bereich im Rauch ist komplett verschleiert. Mit jeder Minute, die die Flasche geöffnet bleibt, wird die Größe der Ausströmung um drei Meter auf höchstens 36 Meter erhöht. Durch Schließen der Flasche wird die Wolke fixiert, bis sie sich nach zehn Minuten auflöst. Ein starker Wind (wie durch den Zauber Windstoß) löst die Wolke nach einer Minute auf."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Magic action, you can open or close this bottle. Opening the bottle causes thick smoke to billow out, forming a cloud that fills a 60-foot Emanation originating from the bottle. The area within the smoke is Heavily Obscured. Each minute the bottle remains open, the size of the Emanation increases by 10 feet until it reaches its maximum size of 120 feet. Closing the bottle causes the cloud to become fixed in place until it disperses after 10 minutes. A strong wind (such as that created by the Gust of Wind spell) disperses the cloud after 1 minute."
    }
   ]
  }
 },
 {
  "id": "eyes-of-charming",
  "name": {
   "de": "Augen der Bezauberung",
   "en": "Eyes of Charming"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Kristallgläser können als Brille getragen werden. Sie haben drei Ladungen. Wenn du sie trägst, kannst du mindestens eine Ladung verbrauchen, um Person bezaubern (Rettungswurf‑SG 13) zu wirken. Mit einer Ladung wirkst du den Zauber auf dem 1. Grad. Du kannst den Zaubergrad mit jeder weitere Ladung, die du verbrauchst, um eins erhöhen. Die Gläser erhalten täglich im Morgengrauen alle verbrauchten Ladungen zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These crystal lenses fit over the eyes. They have 3 charges. While wearing them, you can expend 1 or more charges to cast Charm Person (save DC 13). For 1 charge, you cast the level 1 version of the spell. You increase the spell’s level by one for each additional charge you expend. The lenses regain all expended charges daily at dawn."
    }
   ]
  }
 },
 {
  "id": "eyes-of-minute-seeing",
  "name": {
   "de": "Augen des Präzisen Sehens",
   "en": "Eyes of Minute Seeing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Kristallgläser können als Brille getragen werden. Wenn du sie trägst, ist deine Sicht auf eine Reichweite von 30 Zentimetern erheblich verbessert. Du hast Dunkelsicht mit dieser Reichweite und bist bei Intelligenzwürfen (Nachforschungen) zum Untersuchen von etwas innerhalb dieser Reichweite im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These crystal lenses fit over the eyes. While wearing them, your vision improves significantly out to a range of 1 foot, granting you Darkvision within that range and Advantage on Intelligence (Investigation) checks made to examine something within that range."
    }
   ]
  }
 },
 {
  "id": "eyes-of-the-eagle",
  "name": {
   "de": "Augen des Adlers",
   "en": "Eyes of the Eagle"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Kristallgläser können als Brille getragen werden. Wenn du sie trägst, bist du bei Weisheitswürfen (Wahrnehmung) im Vorteil, die Sicht erfordern. Bei klaren Sichtverhältnissen kannst du Details selbst bei extrem weit entfernten Kreaturen und Gegenständen erkennen, sofern diese mindestens 60 Zentimeter groß sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These crystal lenses fit over the eyes. While wearing them, you have Advantage on Wisdom (Perception) checks that rely on sight. In conditions of clear visibility, you can make out details of even extremely distant creatures and objects as small as 2 feet across."
    }
   ]
  }
 },
 {
  "id": "feather-token",
  "name": {
   "de": "Federfigur",
   "en": "Feather Token"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, Seltenheit variiert",
   "en": "Wondrous Item, Rarity Varies"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "varies"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Gegenstand sieht wie eine Feder aus. Es gibt verschiedene Federfiguren, die jeweils einen eigenen einmaligen Effekt haben. Der SL wählt die Art der Feder aus oder bestimmt sie zufällig, indem er anhand der Tabelle „Federn“ würfelt. Die Art der Feder bestimmt ihre Seltenheit."
    },
    {
     "typ": "punkt",
     "text": "Anker (ungewöhnlich): Du kannst eine magische Aktion ausführen, um ein Boot oder ein Schiff mit der Feder zu berühren. In den nächsten 24 Stunden kann das Gefährt durch nichts und niemanden bewegt werden. Wenn die Feder das Gefährt erneut berührt, endet der Effekt, und die Feder verschwindet."
    },
    {
     "typ": "punkt",
     "text": "Baum (ungewöhnlich): Diese Feder kannst du nur im Freien verwenden. Du kannst eine magische Aktion ausführen, um einen freien Bereich auf dem Boden mit ihr zu berühren. Dann verschwindet die Feder, und an ihrer Stelle erscheint eine nichtmagische Eiche. Der Baum ist 18 Meter hoch. Sein Stamm hat einen Durchmesser von 1,5 Metern, und die Krone erreicht einen Durchmesser von sechs Metern."
    },
    {
     "typ": "punkt",
     "text": "Fächer (ungewöhnlich): Wenn du dich auf einem Boot oder Schiff befindest, kannst du eine magische Aktion ausführen und die Feder bis zu drei Meter hoch in die Luft werfen. Die Feder verschwindet, und an ihrer Stelle erscheint ein riesiger Fächer. Dieser schwebt und erzeugt einen starken Wind, welcher die Segel des Schiffs füllt und dessen Bewegungsrate acht Stunden lang um acht Kilometer pro Stunde erhöht. Du kannst den Fächer als magische Aktion verwerfen."
    },
    {
     "typ": "punkt",
     "text": "Peitsche (selten): Du kannst eine magische Aktion ausführen, um die Feder an eine Stelle im Abstand von bis zu drei Metern von dir zu werfen. Dann verschwindet die Feder, und an ihrer Stelle erscheint eine schwebende Peitsche. Du kannst als Bonusaktion einen Nahkampf‑Zauberangriff gegen eine Kreatur im Abstand von bis zu drei Metern von der Peitsche ausführen. Der Angriffsbonus beträgt +9. Bei einem Treffer erleidet das Ziel 1W6+5 Energieschaden. Du kannst die Peitsche als Bonusaktion bis zu sechs Meter weit fliegen lassen und einen weiteren Angriff gegen eine Kreatur im Abstand von bis zu drei Metern von der Peitsche ausführen. Die Peitsche verschwindet, wenn eine Stunde vergangen ist, wenn du die Peitsche mit einer magischen Aktion verwirfst, oder wenn du stirbst oder kampfunfähig wirst."
    },
    {
     "typ": "punkt",
     "text": "Schwanenboot (selten): Du kannst eine magische Aktion ausführen und ein Gewässer von mindestens 18 Metern Durchmesser mit der Feder berühren. Daraufhin verschwindet die Feder, und an ihrer Stelle erscheint ein 15 Meter langes, sechs Meter breites Boot in Schwanenform. Das Boot bewegt sich von alleine und hat eine Bewegungsrate von 9,6 Kilometern pro Stunde. Während du dich im Boot befindest, kannst du eine magische Aktion ausführen und das Boot fahren oder um bis zu 90 Grad drehen lassen. Das Boot ist 24 Stunden lang vorhanden, dann verschwindet es. Du kannst das Boot als magische Aktion verwerfen."
    },
    {
     "typ": "punkt",
     "text": "Vogel (selten): Du kannst eine magische Aktion ausführen, um die Feder 1,5 Meter hoch in die Luft zu werfen. Dann verschwindet sie, und an ihrer Stelle erscheint ein riesiger bunter Vogel. Er hat die Spielwerte eines Rochs, kann jedoch nicht angreifen. Der Vogel gehorcht deinen einfachen Befehlen und kann bis zu 250 Kilogramm tragen, ohne dass seine Flugbewegungsrate (25 Kilometer pro Stunde, maximal 230 Kilometer pro Tag bei einer einstündigen Rast alle drei Stunden) verringert wird. Bei halbierter Flugbewegungsrate kann er bis zu 500 Kilogramm tragen. Wenn der Vogel seine maximale Entfernung für einen Tag zurückgelegt hat oder wenn seine Trefferpunkte auf 0 sinken, verschwindet er. Du kannst den Vogel als magische Aktion verwerfen."
    },
    {
     "typ": "tabelle",
     "titel": "Federfigur",
     "kopf": [
      "1W100",
      "Marke",
      "Seltenheit"
     ],
     "reihen": [
      [
       "1–20",
       "Anker",
       "Ungewöhnlich"
      ],
      [
       "21–45",
       "Baum",
       "Ungewöhnlich"
      ],
      [
       "46–60",
       "Fächer",
       "Ungewöhnlich"
      ],
      [
       "61–70",
       "Peitsche",
       "Selten"
      ],
      [
       "71–85",
       "Schwanenboot",
       "Selten"
      ],
      [
       "86–100",
       "Vogel",
       "Selten"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This object looks like a feather. Different types of feather tokens exist, each with a different single-use effect. The GM chooses the kind of token or determines it randomly by rolling on the Feather Tokens table. The type of token determines its rarity."
    },
    {
     "typ": "punkt",
     "text": "Anchor (Uncommon). You can take a Magic action to touch the token to a boat or ship. For the next 24 hours, the vessel can’t be moved by any means. Touching the token to the vessel again ends the effect. When the effect ends, the token disappears."
    },
    {
     "typ": "punkt",
     "text": "Bird (Rare). You can take a Magic action to toss the token 5 feet into the air. The token disappears and an enormous, multicolored bird takes its place. The bird has the statistics of a Roc, but it can’t attack. It obeys your simple commands and can carry up to 500 pounds while flying at its maximum speed (16 miles per hour for a maximum of 144 miles per day, with a 1-hour rest for every 3 hours of flying) or 1,000 pounds at half that speed. The bird disappears after flying its maximum distance for a day or if it drops to 0 Hit Points. You can dismiss the bird as a Magic action."
    },
    {
     "typ": "punkt",
     "text": "Fan (Uncommon). If you are on a boat or ship, you can take a Magic action to toss the token up to 10 feet in the air. The token disappears, and a giant flapping fan takes its place. The fan floats and creates a strong wind. This wind can fill the sails of one ship, increasing its speed by 5 miles per hour for 8 hours. You can dismiss the fan as a Magic action."
    },
    {
     "typ": "punkt",
     "text": "Swan Boat (Rare). You can take a Magic action to touch the token to a body of water at least 60 feet in diameter. The token disappears, and a 50-footlong, 20-foot-wide boat shaped like a swan takes its place. The boat is self-propelled and moves across water at a speed of 6 miles per hour. You can take a Magic action while on the boat to command it to move or to turn up to 90 degrees. The boat remains for 24 hours and then disappears. You can dismiss the boat as a Magic action."
    },
    {
     "typ": "punkt",
     "text": "Tree (Uncommon). You must be outdoors to use this token. You can take a Magic action to touch it to an unoccupied space on the ground. The token disappears, and in its place a nonmagical oak tree springs into existence. The tree is 60 feet tall and has a 5-foot-diameter trunk, and its branches at the top spread out in a 20-foot radius."
    },
    {
     "typ": "punkt",
     "text": "Whip (Rare). You can take a Magic action to throw the token to a point within 10 feet of yourself. The token disappears, and a floating whip takes its place. You can then take a Bonus Action to make a melee spell attack against a creature within 10 feet of the whip, with an attack bonus of +9. On a hit, the target takes 1d6 + 5 Force damage. As a Bonus Action, you can direct the whip to fly up to 20 feet and repeat the attack against a creature within 10 feet of the whip. The whip disappears after 1 hour, when you take a Magic action to dismiss it, or when you die or have the Incapacitated condition."
    },
    {
     "typ": "tabelle",
     "titel": "Feather Tokens",
     "kopf": [
      "1d100",
      "Token",
      "Rarity"
     ],
     "reihen": [
      [
       "01–20",
       "Anchor",
       "Uncommon"
      ],
      [
       "21–35",
       "Bird",
       "Rare"
      ],
      [
       "36–50",
       "Fan",
       "Uncommon"
      ],
      [
       "51–65",
       "Swan boat",
       "Rare"
      ],
      [
       "66–90",
       "Tree",
       "Uncommon"
      ],
      [
       "91–00",
       "Whip",
       "Rare"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "figurine-of-wondrous-power",
  "name": {
   "de": "Figur der wundersamen Kraft",
   "en": "Figurine of Wondrous Power"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, Seltenheit variiert",
   "en": "Wondrous Item, Rarity Varies"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "varies"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Figur der wundersamen Kraft ist eine Statuette, die klein genug ist, um in eine Tasche zu passen. Wenn du eine magische Aktion ausführst, um die Figur auf einen Punkt auf dem Boden im Abstand von bis zu 18 Metern von dir zu werfen, wird die Figur zu einer lebendigen Kreatur, wie in der jeweiligen Beschreibung unten angegeben. Wenn der Bereich, an der die Kreatur erscheinen würde, von anderen Kreaturen oder Gegenständen besetzt ist oder nicht genügend Platz für die Kreatur bietet, wird die Figur nicht zu einer Kreatur. Die Kreatur ist dir und deinen Verbündeten gegenüber freundlich gesinnt. Sie versteht deine Sprachen, gehorcht deinen Befehlen und ist bei deinem Initiativewert unmittelbar nach dir am Zug. Wenn du keine Befehle erteilst, verteidigt die Kreatur sich, führt aber keine anderen Aktionen aus. Die Kreatur existiert für eine für jede Figur spezifische Wirkungsdauer. Am Ende der jeweiligen Dauer wird die Kreatur wieder zur Figur. Sie wird vorzeitig wieder zur Figur, wenn die Trefferpunkte der Kreaturenform auf 0 sinken oder du eine magische Aktion ausführst, während du die Kreatur berührst, damit sie wieder zur Figur wird. Wenn die Kreatur wieder zur Figur geworden ist, kann diese Eigenschaft erst nach der jeweils angegebenen Dauer erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Bronze-Greif (selten): Dies ist die Bronzestatue eines wilden Greifs. Sie kann bis zu sechs Stunden lang zu einem Greif werden. Wenn sie verwendet wurde, kann sie erst nach fünf Tagen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Ebenholz-Fliege (selten): Diese Statuette aus Ebenholz ist wie eine Stechfliege geschnitzt. Sie kann bis zu zwölf Stunden lang zu einer Riesenfliege (siehe begleitender Wertekasten) werden und als Reittier dienen. Wenn sie verwendet wurde, kann sie erst nach zwei Tagen erneut verwendet werden."
    },
    {
     "typ": "liste",
     "titel": "Riesenfliege",
     "eintraege": [
      "Großes Tier, gesinnungslos",
      "RK 11 Initiative +1 (11)",
      "TP 19 (3W10+3)",
      "Bewegungsrate 9 m, Fliegen 18 m MOD RW MOD RW MOD RW",
      "Stä 14 +2 +2 GeS 13 +1 +1 Kon 13 +1 +1",
      "Int 2 −4 −4 WeI 10 +0 +0 Cha 3 −4 −4",
      "Sinne Dunkelsicht 18 m, Passive Wahrnehmung 10",
      "Sprachen −",
      "HG 0 (EP 0; ÜB +2)"
     ]
    },
    {
     "typ": "punkt",
     "text": "Goldene Löwen (selten): Diese Goldstatuetten zweier Löwen werden immer als Paar erschaffen. Du kannst die Figuren einzeln oder gemeinsam verwenden. Jede kann für bis zu eine Stunde zu einem Löwen werden. Wenn ein Löwe verwendet wurde, kann er erst nach sieben Tagen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Elfenbein-Ziegen (selten): Diese Ziegenstatuetten aus Elfenbein werden immer zu dritt erschaffen. Jede Ziege sieht einzigartig aus und hat spezielle Eigenschaften. Die Eigenschaften sind:"
    },
    {
     "typ": "stichpunkt",
     "text": "Ziege des Schreckens: Diese Figur kann bis zu drei Stunden lang zu einer Riesenziege werden. Die Ziege kann nicht angreifen, aber du kannst ihre Hörner abnehmen (ohne ihr zu schaden) und als Waffen verwenden. Ein Horn wird zu einer Lanze +1, das andere zu einem Langschwert +2. Es erfordert eine magische Aktion, ein Horn abzunehmen. Die Waffen verschwinden und werden wieder zu Hörnern, wenn die Ziege wieder zu einer Figur wird. Wenn du auf der Ziege reitest, muss jede feindlich gesinnte Kreatur, die ihren Zug innerhalb einer Ausströmung von neun Metern beginnt, die von der Ziege ausgeht, einen SG‑15‑Weisheitsrettungswurf bestehen, oder sie ist verängstigt, bis eine Minute vergangen ist, du nicht mehr auf der Ziege reitest oder diese wieder zur Figur wird. Die verängstigte Kreatur wiederholt den Rettungswurf am Ende jedes ihrer Züge. Bei einem Erfolg endet der Effekt bei ihr. Bei einem Erfolg ist die Kreatur in den nächsten 24 Stunden gegen diesen Effekt immun. Wenn die Figur verwendet wurde, kann sie erst nach 15 Tagen erneut verwendet werden."
    },
    {
     "typ": "stichpunkt",
     "text": "Ziege des Reisens: Diese Figur kann zu einer großen Ziege mit den Spielwerten eines Reitpferds werden. Sie hat 24 Ladungen, und für jede angebrochene Stunde in Ziegengestalt wird eine Ladung verbraucht. Solange die Figur Ladungen hat, kannst du sie beliebig oft verwenden. Sind ihre Ladungen verbraucht, so wird sie wieder zur Figur und kann erst nach sieben Tagen erneut verwendet werden. Sie erhält dann alle Ladungen zurück."
    },
    {
     "typ": "stichpunkt",
     "text": "Ziege der Mühsal: Diese Figur kann bis zu drei Stunden lang zu einer Riesenziege werden. Wenn sie verwendet wurde, kann sie erst nach 30 Tagen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Marmor-Elefant (selten): Diese Marmorstatuette sieht wie ein trompetender Elefant aus. Sie kann bis zu 24 Stunden lang zu einem Elefanten werden. Wenn sie verwendet wurde, kann sie erst nach sieben Tagen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Obsidian-Pferd (sehr selten): Dieses polierte Obsidian‑Pferd kann bis zu 24 Stunden lang zu einem Nachtmahr werden. Der Nachtmahr kämpft nur, um sich zu verteidigen. Wenn sie verwendet wurde, kann sie erst nach fünf Tagen erneut verwendet werden. Wann immer du die Figur verwendest, besteht ein Risiko von zehn Prozent, dass der Nachtmahr deine Befehle ignoriert – auch den Befehl, wieder zur Figur zu werden. Wenn du auf den Nachtmahr aufsitzt, während er deine Befehle ignoriert, werdet du und der Nachtmahr sofort an einen zufälligen Ort auf der Ebene Hades transportiert, wo der Nachtmahr sich wieder in eine Figur verwandelt."
    },
    {
     "typ": "punkt",
     "text": "Onyx-Hund (selten): Diese Onyx‑Statuette kann bis zu sechs Stunden lang zu einer Dogge werden. Die Dogge hat einen Intelligenzwert von 8 und kann die Gemeinsprache sprechen. Sie hat außerdem Blindsicht mit einer Reichweite von 18 Metern. Wenn sie verwendet wurde, kann sie erst nach sieben Tagen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Serpentin-Eule (selten): Diese Serpentin‑Statuette einer Eule kann bis zu acht Stunden lang zu einer Rieseneule werden. Solange du dich auf derselben Existenzebene wie die Eule befindest, kann sie auf unbegrenzte Reichweite telepathisch mit dir kommunizieren. Wenn sie verwendet wurde, kann sie erst nach zwei Tagen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Silberrabe (ungewöhnlich): Diese silberne Statuette eines Raben kann bis zu zwölf Stunden lang zu einem Raben werden. Wenn sie verwendet wurde, kann sie erst nach zwei Tagen erneut verwendet werden. In ihrer Rabenform gewährt die Figur dir die Fähigkeit, Tierbote auf sie zu wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Figurine of Wondrous Power is a statuette small enough to fit in a pocket. If you take a Magic action to throw the figurine to a point on the ground within 60 feet of yourself, the figurine becomes a living creature specified in the figurine’s description below. If the space where the creature would appear is occupied by other creatures or objects, or if there isn’t enough space for the creature, the figurine doesn’t become a creature. The creature is Friendly to you and your allies. It understands your languages, obeys your commands, and takes its turn immediately after you on your Initiative count. If you issue no commands, the creature defends itself but takes no other actions. The creature exists for a duration specific to each figurine. At the end of the duration, the creature reverts to its figurine form. It reverts to a figurine early if its creature form drops to 0 Hit Points or if you take a Magic action while touching the creature to make it revert to figurine form. When the creature becomes a figurine again, its property can’t be used again until a certain amount of time has passed, as specified in the figurine’s description."
    },
    {
     "typ": "punkt",
     "text": "Bronze Griffon (Rare). This bronze statuette is of a griffon rampant. It can become a Griffon for up to 6 hours. Once it has been used, it can’t be used again until 5 days have passed."
    },
    {
     "typ": "punkt",
     "text": "Ebony Fly (Rare). This ebony statuette, carved in the likeness of a horsefly, can become a Giant Fly (see the accompanying stat block) for up to 12 hours and can be ridden as a mount. Once it has been used, it can’t be used again until 2 days have passed."
    },
    {
     "typ": "liste",
     "titel": "Giant Fly",
     "eintraege": [
      "Large Beast, Unaligned",
      "AC 11 Initiative +1 (11)",
      "HP 19 (3d10 + 3)",
      "Speed 30 ft., Fly 60 ft. MOD SAVE MOD SAVE MOD SAVE",
      "Str 14 +2 +2 Dex 13 +1 +1 Con 13 +1 +1",
      "Int 2 −4 −4 WIS 10 +0 +0 Cha 3 −4 −4",
      "Senses Darkvision 60 ft., Passive Perception 10",
      "Languages None",
      "CR 0 (XP 0; PB +2)"
     ]
    },
    {
     "typ": "punkt",
     "text": "Golden Lions (Rare). These gold statuettes of lions are always created in pairs. You can use one figurine or both simultaneously. Each can become a Lion for up to 1 hour. Once a lion has been used, it can’t be used again until 7 days have passed."
    },
    {
     "typ": "punkt",
     "text": "Ivory Goats (Rare). These ivory statuettes of goats are always created in sets of three. Each goat looks unique and functions differently from the others. Their properties are as follows:"
    },
    {
     "typ": "stichpunkt",
     "text": "Goat of Terror. This figurine can become a Giant Goat for up to 3 hours. The goat can’t attack, but you can (harmlessly) remove its horns and use them as weapons. One horn becomes a +1 Lance, and the other becomes a +2 Longsword. Removing a horn requires a Magic action, and the weapons disappear and the horns return when the goat reverts to figurine form. While you ride the goat, any Hostile creature that starts its turn within a 30-foot Emanation originating from the goat must succeed on a DC 15 Wisdom saving throw or have the Frightened condition for 1 minute, until you are no longer riding the goat, or until the goat reverts to figurine form. The Frightened creature repeats the save at the end of each of its turns, ending the effect on itself on a success. Once it succeeds on the save, a creature is immune to this effect for the next 24 hours. Once the figurine has been used, it can’t be used again until 15 days have passed."
    },
    {
     "typ": "stichpunkt",
     "text": "Goat of Traveling. This figurine can become a Large goat with the same statistics as a Riding Horse. It has 24 charges, and each hour or portion thereof it spends in goat form costs 1 charge. While it has charges, you can use it as often as you wish. When it runs out of charges, it reverts to a figurine and can’t be used again until 7 days have passed, when it regains all expended charges."
    },
    {
     "typ": "stichpunkt",
     "text": "Goat of Travail. This figurine can become a Giant Goat for up to 3 hours. Once it has been used, it can’t be used again until 30 days have passed."
    },
    {
     "typ": "punkt",
     "text": "Marble Elephant (Rare). This marble statuette resembles a trumpeting elephant. It can become an Elephant for up to 24 hours. Once it has been used, it can’t be used again until 7 days have passed."
    },
    {
     "typ": "punkt",
     "text": "Obsidian Steed (Very Rare). This polished obsidian horse can become a Nightmare for up to 24 hours. The nightmare fights only to defend itself. Once it has been used, it can’t be used again until 5 days have passed. The figurine has a 10 percent chance each time you use it to ignore your orders, including a command to revert to figurine form. If you mount the nightmare while it is ignoring your orders, you and the nightmare are instantly transported to a random location on the plane of Hades, where the nightmare reverts to figurine form."
    },
    {
     "typ": "punkt",
     "text": "Onyx Dog (Rare). This onyx statuette of a dog can become a Mastiff for up to 6 hours. The mastiff has an Intelligence of 8 and can speak Common. It also has Blindsight with a range of 60 feet. Once it has been used, it can’t be used again until 7 days have passed."
    },
    {
     "typ": "punkt",
     "text": "Serpentine Owl (Rare). This serpentine statuette of an owl can become a Giant Owl for up to 8 hours. The owl can communicate telepathically with you at any range if you and it are on the same plane of existence. Once it has been used, it can’t be used again until 2 days have passed."
    },
    {
     "typ": "punkt",
     "text": "Silver Raven (Uncommon). This silver statuette of a raven can become a Raven for up to 12 hours. Once it has been used, it can’t be used again until 2 days have passed. While in raven form, the figurine grants you the ability to cast Animal Messenger on it."
    }
   ]
  }
 },
 {
  "id": "flame-tongue",
  "name": {
   "de": "Flammenzunge",
   "en": "Flame Tongue"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige Nahkampfwaffe), selten (erfordert Einstimmung)",
   "en": "Weapon (Any Melee Weapon), Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese magische Waffe hältst, kannst du eine Bonusaktion ausführen und ein Befehlswort aussprechen, damit der Teil der Waffe, der Schaden bewirkt, von Flammen umhüllt wird. Diese Flammen spenden in einem Radius von zwölf Metern helles Licht und in einem Radius von weiteren zwölf Metern dämmriges Licht. Wenn die Waffe in Flammen steht, bewirkt sie bei einem Treffer zusätzlich 2W6 Feuerschaden. Die Flammen lodern, bis du eine Bonusaktion ausführst, um den Befehl noch einmal auszusprechen, oder bis du die Waffe fallen lässt, wegsteckst oder verstaust."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this magic weapon, you can take a Bonus Action and use a command word to cause flames to engulf the damage-dealing part of the weapon. These flames shed Bright Light in a 40foot radius and Dim Light for an additional 40 feet. While the weapon is ablaze, it deals an extra 2d6 Fire damage on a hit. The flames last until you take a Bonus Action to issue the command again or until you drop, stow, or sheathe the weapon."
    }
   ]
  }
 },
 {
  "id": "folding-boat",
  "name": {
   "de": "Faltboot",
   "en": "Folding Boat"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Gegenstand sieht zunächst aus wie eine 30 Zentimeter lange, 15 Zentimeter breite und 15 Zentimeter hohe Holzkiste. Die Kiste wiegt zwei Kilogramm und schwimmt auf Wasser. Sie kann geöffnet werden, um Gegenstände darin zu verstauen. Es gibt außerdem drei Befehlswörter, die auszusprechen jeweils eine magische Aktion erfordert:"
    },
    {
     "typ": "stichpunkt",
     "text": "Erstes Befehlswort: Die Kiste entfaltet sich zu einem Ruderboot."
    },
    {
     "typ": "stichpunkt",
     "text": "Zweites Befehlswort: Die Kiste entfaltet sich zu einem Kielboot."
    },
    {
     "typ": "stichpunkt",
     "text": "Drittes Befehlswort: Das Faltboot faltet sich wieder zu einer Kiste zusammen, sofern sich keine Kreaturen an Bord befinden. Alle Gegenstände im Boot, die nicht in die Kiste passen, bleiben außerhalb der Kiste zurück. Alle Gegenstände im Boot, die in die Kiste passen, verbleiben in der Kiste. Wenn die Kiste zu einem Boot wird, wiegt sie so viel wie ein normales Boot dieser Größe, und alles, was in der Kiste verstaut wurde, liegt im Boot. Unter „Ausrüstung“ findest du die Spielwerte für das Ruderboot und das Kielboot. Wenn die Trefferpunkte eines der Boote auf 0 sinken, wird das Faltboot zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This object appears as a wooden box that measures 12 inches long, 6 inches wide, and 6 inches deep. It weighs 4 pounds and floats. It can be opened to store items inside. This item also has three command words, each requiring a Magic action to use:"
    },
    {
     "typ": "stichpunkt",
     "text": "First Command Word. The box unfolds into a Rowboat."
    },
    {
     "typ": "stichpunkt",
     "text": "Second Command Word. The box unfolds into a Keelboat."
    },
    {
     "typ": "stichpunkt",
     "text": "Third Command Word. The Folding Boat folds back into a box if no creatures are aboard. Any objects in the vessel that can’t fit inside the box remain outside the box as it folds. Any objects in the vessel that can fit inside the box do so. When the box becomes a vessel, its weight becomes that of a normal vessel its size, and anything that was stored in the box remains in the boat. Statistics for the Rowboat and Keelboat appear in “Equipment.” If either vessel is reduced to 0 Hit Points, the Folding Boat is destroyed."
    }
   ]
  }
 },
 {
  "id": "frost-brand",
  "name": {
   "de": "Frostbrand",
   "en": "Frost Brand"
  },
  "kopfzeile": {
   "de": "Waffe (Glefe, Krummsäbel, Kurzschwert, Langschwert, Rapier oder Zweihandschwert), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Glaive, Greatsword, Longsword, Rapier, Scimitar, or Shortsword), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du bei einem Angriffswurf mit dieser magischen Waffe triffst, erleidet das Ziel zusätzlich 1W6 Kälteschaden. Außerdem bist du gegen Feuerschaden resistent, wenn du die Waffe hältst. Bei eisigen Temperaturen spendet die Waffe im Radius von drei Metern helles Licht und im Radius von weiteren drei Metern dämmriges Licht. Wenn du diese Waffe ziehst, kannst du alle nichtmagischen Flammen im Abstand von bis zu neun Metern von dir löschen. Wurde diese Eigenschaft verwendet, so kann sie erst nach einer Stunde erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you hit with an attack roll using this magic weapon, the target takes an extra 1d6 Cold damage. In addition, while you hold the weapon, you have Resistance to Fire damage. In freezing temperatures, the weapon sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. When you draw this weapon, you can extinguish all nonmagical flames within 30 feet of yourself. Once used, this property can’t be used again for 1 hour."
    }
   ]
  }
 },
 {
  "id": "gauntlets-of-ogre-power",
  "name": {
   "de": "Panzerhandschuhe der Ogerkraft",
   "en": "Gauntlets of Ogre Power"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Panzerhandschuhe trägst, beträgt dein Stärkewert 19. Falls dein Stärkewert ohnehin mindestens 19 beträgt, haben die Panzerhandschuhe keine Wirkung auf dich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Your Strength is 19 while you wear these gauntlets. They have no effect on you if your Strength is 19 or higher without them."
    }
   ]
  }
 },
 {
  "id": "gem-of-brightness",
  "name": {
   "de": "Edelstein der Helligkeit",
   "en": "Gem of Brightness"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Edelstein hat 50 Ladungen. Wenn du ihn hältst, kannst du eine magische Aktion ausführen und eines von drei Befehlswörtern aussprechen, um einen der folgenden Effekte zu bewirken:"
    },
    {
     "typ": "stichpunkt",
     "text": "Erstes Befehlswort: Der Edelstein spendet in einem Radius von neun Metern helles Licht und in einem Radius von weiteren neun Metern dämmriges Licht. Dieser Effekt verbraucht keine Ladung. Er hält an, bis du eine Bonusaktion ausführst, um das Befehlswort erneut auszusprechen, oder bis du einen anderen Effekt des Edelsteins verwendest."
    },
    {
     "typ": "stichpunkt",
     "text": "Zweites Befehlswort: Du verbrauchst eine Ladung, damit der Edelstein einen blendenden Lichtstrahl auf eine Kreatur im Abstand von bis zu 18 Metern von dir schießt, die du sehen kannst. Die Kreatur muss einen SG‑15‑Konstitutionsrettungswurf bestehen, oder sie ist eine Minute lang blind. Sie wiederholt den Rettungswurf am Ende jedes ihrer Züge. Bei einem Erfolg endet der Effekt bei ihr."
    },
    {
     "typ": "stichpunkt",
     "text": "Drittes Befehlswort: Du verbrauchst fünf Ladungen, damit der Edelstein in einem Kegel von neun Metern intensives Licht spendet. Jede Kreatur im Kegel führt einen Rettungswurf aus, als wäre sie Ziel des Lichtstrahls vom zweiten Befehlswort. Wenn alle Ladungen verbraucht wurden, wird der Edelstein zu einem nichtmagischen Juwel im Wert von 50 GM."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This prism has 50 charges. While you are holding it, you can take a Magic action and use one of three command words to cause one of the following effects:"
    },
    {
     "typ": "stichpunkt",
     "text": "First Command Word. The gem sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. This effect doesn’t expend a charge. It lasts until you take a Bonus Action to repeat the command word or until you use another function of the gem."
    },
    {
     "typ": "stichpunkt",
     "text": "Second Command Word. You expend 1 charge and cause the gem to fire a brilliant beam of light at one creature you can see within 60 feet of yourself. The creature must succeed on a DC 15 Constitution saving throw or have the Blinded condition for 1 minute. The creature repeats the save at the end of each of its turns, ending the effect on itself on a success."
    },
    {
     "typ": "stichpunkt",
     "text": "Third Command Word. You expend 5 charges and cause the gem to flare with intense light in a 30foot Cone. Each creature in the Cone makes a saving throw as if struck by the beam created with the second command word. When all of the gem’s charges are expended, the gem becomes a nonmagical jewel worth 50 GP."
    }
   ]
  }
 },
 {
  "id": "gem-of-seeing",
  "name": {
   "de": "Edelstein des Sehens",
   "en": "Gem of Seeing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Edelstein hat drei Ladungen. Du kannst als magische Aktion eine Ladung verbrauchen. In den nächsten zehn Minuten hast du Wahrer Blick mit einer Reichweite von 36 Metern, wenn du durch den Edelstein blickst. Der Edelstein erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This gem has 3 charges. As a Magic action, you can expend 1 charge. For the next 10 minutes, you have Truesight out to 120 feet when you peer through the gem. The gem regains 1d3 expended charges daily at dawn."
    }
   ]
  }
 },
 {
  "id": "giant-slayer",
  "name": {
   "de": "Riesentöter",
   "en": "Giant Slayer"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige einfache Waffe oder Kriegswaffe), selten",
   "en": "Weapon (Any Simple or Martial), Rare"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Wenn du mit ihr einen Riesen triffst, erleidet er zusätzlich 2W6 Schaden nach Art der Waffe. Außerdem muss er einen SG‑15‑Stärkerettungswurf bestehen, oder er wird umgestoßen und hat den Zustand Liegend."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. When you hit a Giant with this weapon, the Giant takes an extra 2d6 damage of the weapon’s type and must succeed on a DC 15 Strength saving throw or have the Prone condition."
    }
   ]
  }
 },
 {
  "id": "glamoured-studded-leather",
  "name": {
   "de": "Verzaubertes Beschlagenes Leder",
   "en": "Glamoured Studded Leather"
  },
  "kopfzeile": {
   "de": "Rüstung (beschlagene Lederrüstung), selten",
   "en": "Armor (Studded Leather Armor), Rare"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, erhältst du einen Bonus von +1 auf deine Rüstungsklasse. Du kannst außerdem eine Bonusaktion ausführen, damit die Rüstung das Aussehen normaler Kleidung oder einer anderen Rüstung annimmt. Du bestimmst das Aussehen einschließlich Farbe, Stil und Zubehör, doch die Rüstung behält ihre normale Masse und ihr Gewicht bei. Das illusionäre Erscheinungsbild bleibt bestehen, bis du diese Eigenschaft erneut verwendest oder die Rüstung ablegst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this armor, you gain a +1 bonus to Armor Class. You can also take a Bonus Action to cause the armor to assume the appearance of a normal set of clothing or some other kind of armor. You decide what it looks like—including color, style, and accessories—but the armor retains its normal bulk and weight. The illusory appearance lasts until you use this property again or doff the armor."
    }
   ]
  }
 },
 {
  "id": "gloves-of-missile-snaring",
  "name": {
   "de": "Handschuhe des Geschossfangens",
   "en": "Gloves of Missile Snaring"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Handschuhe trägst und von einem Angriffswurf getroffen wirst, der mit einer Fernkampf‑ oder einer Wurfwaffe ausgeführt wurde, kannst du eine Reaktion ausführen und den Schaden um 1W10 plus deinen Geschicklichkeitsmodifikator verringern, sofern du eine freie Hand hast. Wenn du den Schaden auf 0 verringerst, fängst du das Geschoss oder die Waffe auf, sofern diese klein genug sind, um in deine Hand zu passen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you’re hit by an attack roll made with a Ranged or Thrown weapon while wearing these gloves, you can take a Reaction to reduce the damage by 1d10 plus your Dexterity modifier if you have a free hand. If you reduce the damage to 0, you can catch the ammunition or weapon if it is small enough for you to hold in that hand."
    }
   ]
  }
 },
 {
  "id": "gloves-of-swimming-and-climbing",
  "name": {
   "de": "Handschuhe des Schwimmens und Kletterns",
   "en": "Gloves of Swimming and Climbing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Handschuhe trägst, hast du eine Kletterbewegungsrate und eine Schwimmbewegungsrate in Höhe deiner Bewegungsrate sowie einen Bonus von +5 auf Stärkewürfe (Athletik), die du ausführst, um zu klettern oder zu schwimmen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing these gloves, you have a Climb Speed and a Swim Speed equal to your Speed, and you gain a +5 bonus to Strength (Athletics) checks made to climb or swim."
    }
   ]
  }
 },
 {
  "id": "gloves-of-thievery",
  "name": {
   "de": "Handschuhe des Diebstahls",
   "en": "Gloves of Thievery"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Handschuhe sind beim Tragen nicht spürbar. Wenn du sie trägst, hast du einen Bonus von +5 auf Geschicklichkeitswürfe (Fingerfertigkeit)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These gloves are imperceptible while worn. While wearing them, you gain a +5 bonus to Dexterity (Sleight of Hand) checks."
    }
   ]
  }
 },
 {
  "id": "goggles-of-night",
  "name": {
   "de": "Nachtbrille",
   "en": "Goggles of Night"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese dunkle Brille gibt dir Dunkelsicht auf bis zu 18 Meter. Hast du bereits Dunkelsicht, so erhöht diese Brille deine Sichtweite um 18 Meter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing these dark lenses, you have Darkvision out to 60 feet. If you already have Darkvision, wearing the goggles increases its range by 60 feet."
    }
   ]
  }
 },
 {
  "id": "hammer-of-thunderbolts",
  "name": {
   "de": "Hammer des Blitzschlags",
   "en": "Hammer of Thunderbolts"
  },
  "kopfzeile": {
   "de": "Waffe (Kriegshammer oder Zweihandhammer), legendär (erfordert Einstimmung)",
   "en": "Weapon (Maul or Warhammer), Legendary (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Die Waffe hat fünf Ladungen. Du kannst eine Ladung verbrauchen und einen Fernkampfangriff mit der Waffe ausführen. Dabei wirfst du sie, als wäre sie eine Wurfwaffe mit einer Grundreichweite von sechs Metern und einer Maximalreichweite von 18 Metern. Wenn der Angriff trifft, entfesselt die Waffe einen Donnerschlag, der bis zu 90 Meter weit zu hören ist. Das Ziel und alle Kreaturen im Abstand von bis zu neun Metern von ihm (außer dir) müssen einen SG‑17‑Konstitutionsrettungswurf bestehen, oder sie sind bis zum Ende deines nächsten Zugs betäubt. Sofort nach dem Angriff fliegt die Waffe zurück in deine Hand. Die Waffe erhält täglich im Morgengrauen 1W4+1 verbrauchte Ladungen zurück."
    },
    {
     "typ": "punkt",
     "text": "Verderben der Riesen: Wenn du auf die Waffe eingestimmt bist und entweder einen Gürtel der Riesenstärke oder Panzerhandschuhe der Ogerkraft trägst (und auch auf diese Gegenstände eingestimmt bist), erhältst du die folgenden Vorzüge:"
    },
    {
     "typ": "stichpunkt",
     "text": "Macht der Riesen: Der Stärkewert‑Bonus durch den Gürtel der Riesenstärke oder die Panzerhandschuhe der Ogerkraft wird um 4 erhöht (auf höchstens 30)."
    },
    {
     "typ": "stichpunkt",
     "text": "Verderben der Riesen: Wenn du bei einem Angriffswurf mit dieser Waffe gegen einen Riesen eine 20 würfelst, muss der Riese einen SG‑17‑Konstitutionsrettungswurf bestehen, oder er stirbt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. The weapon has 5 charges. You can expend 1 charge and make a ranged attack with the weapon, hurling it as if it had the Thrown property with a normal range of 20 feet and a long range of 60 feet. If the attack hits, the weapon unleashes a thunderclap audible out to 300 feet. The target and every creature within 30 feet of it other than you must succeed on a DC 17 Constitution saving throw or have the Stunned condition until the end of your next turn. Immediately after hitting or missing, the weapon flies back to your hand. The weapon regains 1d4 + 1 expended charges daily at dawn."
    },
    {
     "typ": "punkt",
     "text": "Giant’s Bane. While you are attuned to the weapon and wearing either a Belt of Giant Strength or Gauntlets of Ogre Power to which you are also attuned, you gain the following benefits:"
    },
    {
     "typ": "stichpunkt",
     "text": "Giants’ Bane. When you roll a 20 on the d20 for an attack roll made with this weapon against a Giant, the creature must succeed on a DC 17 Constitution saving throw or die."
    },
    {
     "typ": "stichpunkt",
     "text": "Might of Giants. The Strength score bestowed by your Belt of Giant Strength or Gauntlets of Ogre Power increases by 4, to a maximum of 30."
    }
   ]
  }
 },
 {
  "id": "handy-haversack",
  "name": {
   "de": "Praktischer Rucksack",
   "en": "Handy Haversack"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Rucksack hat eine mittlere Tasche und zwei Seitentaschen, die alle einen extradimensionalen Raum enthalten. Jede Seitentasche kann bis zu 100 Kilogramm Material mit einem Volumen von bis zu 700 Litern aufnehmen. Die mittlere Tasche kann bis zu 250 Kilogramm Material mit einem Volumen von bis zu 1.800 Litern aufnehmen. Der Rucksack wiegt unabhängig von seinem Inhalt immer 2,5 Kilogramm. Es erfordert eine Verwenden‑Aktion oder eine Bonusaktion (nach deiner Wahl), einen Gegenstand aus dem Rucksack zu holen. Wenn du in den Rucksack greifst, um einen bestimmten Gegenstand herauszuholen, liegt dieser auf magische Weise immer obenauf. Wird eine der Taschen überladen, durchbohrt oder zerrissen, so reißt der Rucksack und ist zerstört. Wenn der Rucksack zerstört wird, geht sein Inhalt für immer verloren. Nur Artefakte erscheinen an einem zufälligen Ort wieder. Wenn der Rucksack auf links gedreht wird, fällt sein gesamter Inhalt unbeschädigt heraus. Der Rucksack muss wieder auf rechts gedreht werden, damit er erneut verwendet werden kann. Jede Tasche des Rucksacks enthält genug Atemluft für zehn Minuten (geteilt durch die Anzahl atmender Kreaturen darin). Wenn der Rucksack in den extradimensionalen Raum eines Nimmervollen Beutels, eines Tragbaren Lochs oder eines ähnlichen Gegenstands gelangt, werden beide Gegenstände sofort zerstört, und ein Tor zur Astralebene öffnet sich. Das Tor erscheint dort, wo der eine Gegenstand in den anderen gelangt ist. Alle Kreaturen, die sich im Abstand von bis zu drei Metern vom Tor befinden und nicht über vollständige Deckung verfügen, werden hineingezogen und an einen zufälligen Ort auf der Astralebene transportiert. Dann schließt sich das Tor. Das Tor funktioniert nur in eine Richtung und kann nicht wieder geöffnet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This backpack has a central pouch and two side pouches, each of which is an extradimensional space. Each side pouch can hold up to 200 pounds of material, not exceeding a volume of 25 cubic feet. The central pouch can hold up to 500 pounds of material, not exceeding a volume of 64 cubic feet. The haversack always weighs 5 pounds, regardless of its contents. Retrieving an item from the haversack requires a Utilize action or a Bonus Action (your choice). When you reach into the haversack for a specific item, the item is always magically on top. If any of its pouches is overloaded, pierced, or torn, the haversack ruptures and is destroyed. If the haversack is destroyed, its contents are lost forever, although an Artifact always turns up again somewhere. If the haversack is turned inside out, its contents spill forth unharmed, and the haversack must be put right before it can be used again. Each pouch of the haversack holds enough air for 10 minutes of breathing, divided by the number of breathing creatures inside. Placing the haversack inside an extradimensional space created by a Bag of Holding, Portable Hole, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within 10 feet of the gate and not behind Total Cover is sucked through it and deposited in a random location on the Astral Plane. The gate then closes. The gate is one-way only and can’t be reopened."
    }
   ]
  }
 },
 {
  "id": "hat-of-disguise",
  "name": {
   "de": "Hut der Verkleidung",
   "en": "Hat of Disguise"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Hut trägst, kannst du den Zauber Selbstverkleidung wirken. Der Zauber endet, wenn der Hut abgesetzt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this hat, you can cast the Disguise Self spell. The spell ends if the hat is removed."
    }
   ]
  }
 },
 {
  "id": "hat-of-many-spells",
  "name": {
   "de": "Hut der Vielen Zauber",
   "en": "Hat of Many Spells"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung durch einen Magier)",
   "en": "Wondrous Item, Very Rare (Requires Attunement by a Wizard)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser spitze Hut hat die folgenden Eigenschaften:"
    },
    {
     "typ": "punkt",
     "text": "Zauberfokus: Wenn du den Hut hältst, kannst du ihn als Zauberfokus für deine Magierzauber verwenden. Jeder Zauber, den du mit dem Hut wirkst, hat eine besondere Gestenkomponente: Du musst in den Hut greifen und den Zauber „herausziehen“."
    },
    {
     "typ": "punkt",
     "text": "Unbekannter Zauber: Wenn du den Hut hältst, kannst du versuchen, einen Zauber des mindestens 1. Grades zu wirken, den du nicht kennst. Der Zauber muss in der Zauberliste des Magiers enthalten sein. Er muss einen Grad aufweisen, den du wirken kannst, und er darf keine Materialkomponenten haben, die mehr als 1.000 GM kosten. Wenn du einen Zauber ausgewählt hast, musst du einen Zauberplatz verbrauchen, dessen Grad dem des Zaubers entspricht. Führe dann einen Intelligenzwurf (Arkane Kunde) aus (SG 10 plus Zaubergrad), um zu ermitteln, ob du den Zauber wirkst. Bei einem Erfolg wirkst du den Zauber mit dem normalen Zeitaufwand, und du kannst diese Eigenschaft erst erneut verwenden, wenn du eine kurze oder lange Rast beendet hast. Misslingt der Wurf, so misslingt auch der Zauber, und stattdessen tritt ein zufälliger Effekt auf, der durch Würfeln anhand der folgenden Tabelle ermittelt wird. Jeder Zauber, den du mit dem Hut wirkst, verwendet deinen Zauberrettungswurf‑SG und deinen Zauberangriffsbonus."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Effekt"
     ],
     "reihen": [
      [
       "1–50",
       "Du wirkst einen zufälligen Zauber, der durch Würfeln mit 1W10 ermittelt wird. 1: Vergrößern/Verkleinern (Vergrößern-Effekt), 2: Vergrößern/Verkleinern (Verkleinern-Effekt), 3: Feenfeuer, 4: Feuerball, 5: Windstoß, 6: Unsichtbarkeit (auf dich gewirkt), 7: Blitz, 8: Macht der Vorstellungskraft, 9: Verwandlung, 10: Stinkende Wolke."
      ],
      [
       "51–55",
       "Du bist bis zum Ende deines nächsten Zugs betäubt und glaubst, dass soeben etwas Überwältigendes geschehen ist."
      ],
      [
       "56–60",
       "Ein harmloser Schmetterlingsschwarm füllt einen Würfel mit drei Metern Kantenlänge im Abstand von bis zu neun Metern von dir. Der Schwarm löst sich nach einer Minute auf."
      ],
      [
       "61–65",
       "Du ziehst einen nichtmagischen Gegenstand aus dem Hut. Würfle mit 1W4, um den Gegenstand zu ermitteln. 1: Phiole mit Säure, 2: Flasche mit Alchemistenfeuer, 3: Brechstange, 4: Brennende Fackel."
      ],
      [
       "66–70",
       "Du erleidest einen Anfall von „magischer Krankheit“ und bist eine Stunde lang vergiftet."
      ],
      [
       "71–75",
       "Du bist bis zum Ende deines nächsten Zugs versteinert."
      ],
      [
       "76–80",
       "Du ziehst einen nichtmagischen Gegenstand aus dem Hut. Würfle mit 1W4, um den Gegenstand zu ermitteln. 1: Dolch, 2: Seil mit Enterhaken an einem Ende, 3: Tasche mit Krähenfüßen, 4: Edelstein im Wert von 50 GM."
      ],
      [
       "81–85",
       "Eine Kreatur erscheint in einem freien Bereich so nahe wie möglich bei dir. Sie steht nicht unter deiner Kontrolle und handelt, wie sie es normalerweise tun würde. Die Kreatur verschwindet, wenn eine Stunde vergangen ist oder wenn ihre Trefferpunkte auf 0 sinken. Würfle mit 1W4, um die Kreatur zu ermitteln. 1: Kamel, 2: Würgeschlange, 3: Elefant, 4: Maultier."
      ],
      [
       "86–90",
       "Ein feindlich gesinnter Fledermausschwarm fliegt aus dem Hut, besetzt deinen Bereich und greift dich an."
      ],
      [
       "91–95",
       "Ein vertikales Zweiwegeportal mit drei Metern Durchmesser zu einer anderen Existenzebene öffnet sich in einem freien Bereich im Abstand von bis zu neun Metern von dir und bleibt bis zum Ende deines nächsten Zugs offen. Der SL bestimmt, wohin es führt."
      ],
      [
       "96–100",
       "Du ziehst einen magischen Gegenstand aus dem Hut. Würfle mit 1W6, um die Seltenheit des Gegenstands zu ermitteln. 1–3: Gewöhnlich, 4–5: Ungewöhnlich, 6: Selten. Der SL wählt den Gegenstand aus, der nach einer Stunde verschwindet, sofern er bis dahin nicht verbraucht oder zerstört wurde."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This pointed hat has the following properties."
    },
    {
     "typ": "punkt",
     "text": "Spellcasting Focus. While holding the hat, you can use it as a Spellcasting Focus for your Wizard spells. Any spell you cast using the hat gains a special Somatic component: you must reach into the hat and “pull” the spell out of it."
    },
    {
     "typ": "punkt",
     "text": "Unknown Spell. While holding the hat, you can try to cast a level 1+ spell you don’t know. The spell must be on the Wizard spell list, it must be of a level you can cast, and it can’t have Material components costing more than 1,000 GP. Once you decide on the spell, you must expend a spell slot of the spell’s level. Then, to determine whether you cast the spell, make an Intelligence (Arcana) check (DC 10 plus the spell’s level). On a successful check, you cast the spell using its normal casting time, and you can’t use this property again until you finish a Short or Long Rest. On a failed check, you fail to cast the spell and a random effect occurs instead, determined by rolling on the following table. Any spell you cast from the hat uses your spell save DC and spell attack bonus."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Effect"
     ],
     "reihen": [
      [
       "01–50",
       "You cast a random spell determined by rolling 1d10: on a 1, Enlarge/Reduce (enlarge effect); on a 2, Enlarge/Reduce (reduce effect); on a 3, Faerie Fire; on a 4, Fireball; on a 5, Gust of Wind; on a 6, Invisibility (cast on yourself); on a 7, Lightning Bolt; on an 8, Phantasmal Force; on a 9, Polymorph; on a 10, Stinking Cloud."
      ],
      [
       "51–55",
       "You have the Stunned condition until the end of your next turn, believing something awesome just happened."
      ],
      [
       "56–60",
       "A harmless swarm of butterflies fills a 10-foot Cube within 30 feet of yourself. The swarm disperses after 1 minute."
      ],
      [
       "61–65",
       "You pull a nonmagical object out of the hat. Roll 1d4 to determine the object: on a 1, a vial of Acid; on a 2, a flask of Alchemist’s Fire; on a 3, a Crowbar; on a 4, a lit Torch."
      ],
      [
       "66–70",
       "You suffer a bout of “magic sickness” and have the Poisoned condition for 1 hour."
      ],
      [
       "71–75",
       "You have the Petrified condition until the end of your next turn."
      ],
      [
       "76–80",
       "You pull a nonmagical object out of the hat. Roll 1d4 to determine the object: on a 1, a Dagger; on a 2, a Rope with a Grappling Hook tied to one end; on a 3, a bag of Caltrops; on a 4, a gem worth 50 GP."
      ],
      [
       "81–85",
       "A creature appears in an unoccupied space as close to you as possible. The creature isn’t under your control and acts as it normally would, and it disappears after 1 hour or when it drops to 0 Hit Points. Roll 1d4 to determine the creature: on a 1, a Camel; on a 2, a Constrictor Snake; on a 3, an Elephant; on a 4, a Mule."
      ],
      [
       "86–90",
       "A Hostile Swarm of Bats flies out of the hat, occupies your space, and attacks you."
      ],
      [
       "91–95",
       "A vertical, 10-foot-diameter, two-way portal to another plane of existence opens in an unoccupied space within 30 feet of you and remains open until the end of your next turn. The GM determines where it leads."
      ],
      [
       "96–00",
       "You pull a magic item out of the hat. Roll 1d6 to determine the item’s rarity: on a 1–3, Common; on a 4–5, Uncommon; on a 6, Rare. The GM chooses the item, which disappears after 1 hour if it’s not consumed or destroyed before then."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "headband-of-intellect",
  "name": {
   "de": "Stirnband der Intelligenz",
   "en": "Headband of Intellect"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Stirnband trägst, beträgt dein Intelligenzwert 19. Beträgt dein Intelligenzwert ohnehin mindestens 19, so hat es keinen Effekt auf dich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Your Intelligence is 19 while you wear this headband. It has no effect on you if your Intelligence is 19 or higher without it."
    }
   ]
  }
 },
 {
  "id": "helm-of-brilliance",
  "name": {
   "de": "Helm der Pracht",
   "en": "Helm of Brilliance"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Very Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Helm ist mit 1W10 Diamanten, 2W10 Rubinen, 3W10 Feueropalen und 4W10 Opalen besetzt. Wenn ein Edelstein herausgebrochen wird, zerfällt er zu Staub. Wenn alle Edelsteine entfernt oder zerstört wurden, verliert der Helm seine Magie. Wenn du den Helm trägst, erhältst du die folgenden Vorzüge:"
    },
    {
     "typ": "punkt",
     "text": "Diamantlicht: Solange der Helm mindestens einen Diamanten hat, erzeugt er eine Ausströmung von neun Metern. Wenn sich in diesem Bereich mindestens ein Untoter befindet, herrscht dämmriges Licht in der Ausströmung. Untote, die ihren Zug in dem Bereich beginnen, erleiden 1W6 gleißenden Schaden."
    },
    {
     "typ": "punkt",
     "text": "Feueropal-Flammen: Solange der Helm mindestens einen Feueropal hat, kannst du eine magische Aktion ausführen und eine Waffe, die du hältst, in Flammen aufgehen lassen. Die Flammen spenden in einem Radius von drei Metern helles Licht und in einem Radius von weiteren drei Metern dämmriges Licht. Die Flammen sind für dich und deine Waffe harmlos. Wenn du bei einem Angriff mit der brennenden Waffe triffst, erleidet das Ziel zusätzlich 1W6 Feuerschaden. Die Flammen bleiben bestehen, bis du eine Bonusaktion ausführst, um sie zu löschen, oder bis du die Waffe wegsteckst oder fallen lässt."
    },
    {
     "typ": "punkt",
     "text": "Feuerschaden erleiden: Würfle mit 1W20, wenn du den Helm trägst und Feuerschaden erleidest, nachdem dir ein Rettungswurf gegen einen Zauber misslungen ist. Wenn du eine 1 würfelst, gibt der Helm Lichtstrahlen von seinen verbleibenden Edelsteinen ab und wird dann zerstört. Jede Kreatur innerhalb einer Ausströmung von 18 Metern, die von dir ausgeht, muss einen SG‑17‑Geschicklichkeitsrettungswurf bestehen, oder sie wird von einem Strahl getroffen. Dabei erleidet sie so viel gleißenden Schaden, wie Edelsteine am Helm verbleiben."
    },
    {
     "typ": "punkt",
     "text": "Rubin-Resistenz: Solange der Helm mindestens einen Rubin hat, bist du gegen Feuerschaden resistent."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Du kannst einen der folgenden Zauber (Rettungswurf‑SG 18) wirken und als Komponente einen Edelstein des Helms vom angegebenen Typ verwenden: Feuerball (Feueropal), Feuerwand (Rubin), Regenbogenspiel (Diamant) oder Tageslicht (Opal). Der Edelstein wird zerstört, wenn der Zauber gewirkt wird, und verschwindet vom Helm."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This helm is set with 1d10 diamonds, 2d10 rubies, 3d10 fire opals, and 4d10 opals. Any gem pried from the helm crumbles to dust. When all the gems are removed or destroyed, the helm loses its magic. You gain the following benefits while wearing the helm."
    },
    {
     "typ": "punkt",
     "text": "Diamond Light. As long as it has at least one diamond, the helm emits a 30-foot Emanation. When at least one Undead is within that area, the Emanation is filled with Dim Light. Any Undead that starts its turn in that area takes 1d6 Radiant damage."
    },
    {
     "typ": "punkt",
     "text": "Fire Opal Flames. As long as the helm has at least one fire opal, you can take a Magic action to cause one weapon you are holding to burst into flames. The flames emit Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. The flames are harmless to you and the weapon. When you hit with an attack using the blazing weapon, the target takes an extra 1d6 Fire damage. The flames last until you take a Bonus Action to extinguish them or until you drop or stow the weapon."
    },
    {
     "typ": "punkt",
     "text": "Ruby Resistance. As long as the helm has at least one ruby, you have Resistance to Fire damage."
    },
    {
     "typ": "punkt",
     "text": "Spells. You can cast one of the following spells (save DC 18), using one of the helm’s gems of the specified type as a component: Daylight (opal), Fireball (fire opal), Prismatic Spray (diamond), or Wall of Fire (ruby). The gem is destroyed when the spell is cast and disappears from the helm."
    },
    {
     "typ": "punkt",
     "text": "Taking Fire Damage. Roll 1d20 if you are wearing the helm and take Fire damage as a result of failing a saving throw against a spell. On a roll of 1, the helm emits beams of light from its remaining gems and is then destroyed. Each creature within a 60foot Emanation originating from you must succeed on a DC 17 Dexterity saving throw or be struck by a beam, taking Radiant damage equal to the number of gems in the helm."
    }
   ]
  }
 },
 {
  "id": "helm-of-comprehending-languages",
  "name": {
   "de": "Helm des Sprachenverstehens",
   "en": "Helm of Comprehending Languages"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Helm trägst, kannst du den Zauber Sprachen verstehen damit wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this helm, you can cast Comprehend Languages from it."
    }
   ]
  }
 },
 {
  "id": "helm-of-telepathy",
  "name": {
   "de": "Helm der Telepathie",
   "en": "Helm of Telepathy"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Helm trägst, verfügst du über Telepathie mit einer Reichweite von neun Metern, und du kannst die Zauber Gedanken wahrnehmen und Einflüsterung (Rettungswurf‑SG 13) mit dem Helm wirken. Wurde einer der Zauber mit dem Helm gewirkt, so kann dieser Zauber erst ab dem nächsten Morgengrauen erneut mit ihm gewirkt werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this helm, you have telepathy with a range of 30 feet, and you can cast Detect Thoughts or Suggestion (save DC 13) from the helm. Once either spell is cast from the helm, that spell can’t be cast from it again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "helm-of-teleportation",
  "name": {
   "de": "Helm der Teleportation",
   "en": "Helm of Teleportation"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Helm hat drei Ladungen. Wenn du ihn trägst, kannst du eine Ladung verbrauchen, um den Zauber Teleportieren damit zu wirken. Der Helm erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This helm has 3 charges. While wearing it, you can expend 1 charge to cast Teleport from it. The helm regains 1d3 expended charges daily at dawn."
    }
   ]
  }
 },
 {
  "id": "holy-avenger",
  "name": {
   "de": "Heiliger Rächer",
   "en": "Holy Avenger"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige einfache Waffe oder Kriegswaffe), legendär (erfordert Einstimmung durch einen Paladin)",
   "en": "Weapon (Any Simple or Martial), Legendary (Requires Attunement by a Paladin)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +3 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Triffst du einen Unhold oder Untoten damit, so erleidet diese Kreatur zusätzlich 2W10 gleißenden Schaden. Wenn du die gezogene Waffe hältst, erzeugt sie eine Ausströmung von drei Metern, die von dir ausgeht. Du und alle verbündeten Kreaturen innerhalb der Ausströmung seid bei Rettungs würfen gegen Zauber und andere magische Effekte im Vorteil. Wenn du mindestens 17 Stufen als Paladin hast, erhöht sich die Größe der Ausströmung auf neun Meter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. When you hit a Fiend or an Undead with it, that creature takes an extra 2d10 Radiant damage. While you hold the drawn weapon, it creates a 10-foot Emanation originating from you. You and all creatures Friendly to you in the Emanation have Advantage on saving throws against spells and other magical effects. If you have 17 or more levels in the Paladin class, the size of the Emanation increases to 30 feet."
    }
   ]
  }
 },
 {
  "id": "horn-of-blasting",
  "name": {
   "de": "Horn der Sprengung",
   "en": "Horn of Blasting"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst eine magische Aktion ausführen, um ins Horn zu stoßen. Daraufhin gibt dieses in einem Kegel von neun Metern einen Donnerknall von sich, der bis zu 180 Meter weit zu hören ist. Jede Kreatur im Kegel führt einen SG‑15‑Konstitutions rettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 5W8 Schallschaden und ist eine Minute lang taub. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur nur halb so viel Schaden. Gegenstände aus Glas oder Kristall im Kegel, die nicht getragen oder gehalten werden, erleiden 10W8 Schallschaden. Wann immer die Magie des Horns verwendet wird, besteht ein Risiko von 20 Prozent, dass das Horn explodiert. Die Explosion fügt dem Hornbläser 10W6 Energieschaden zu und zerstört das Horn."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can take a Magic action to blow the horn, which emits a thunderous blast in a 30-foot Cone that is audible out to 600 feet. Each creature in the Cone makes a DC 15 Constitution saving throw. On a failed save, a creature takes 5d8 Thunder damage and has the Deafened condition for 1 minute. On a successful save, a creature takes half as much damage only. Glass or crystal objects in the Cone that aren’t being worn or carried take 10d8 Thunder damage. Each use of the horn’s magic has a 20 percent chance of causing the horn to explode. The explosion deals 10d6 Force damage to the user and destroys the horn."
    }
   ]
  }
 },
 {
  "id": "horn-of-valhalla",
  "name": {
   "de": "Horn von Walhalla",
   "en": "Horn of Valhalla"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (Silber oder Messing), sehr selten (Bronze) oder legendär (Eisen)",
   "en": "Wondrous Item, Rare (Silver or Brass), Very Rare (Bronze), or Legendary (Iron)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare",
   "veryRare",
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst eine magische Aktion ausführen, um ins Horn zu stoßen. Daraufhin erscheinen Geisterkrieger von der Ebene Ysgard in freien Bereichen im Abstand von bis zu 18 Metern von dir. Jeder Geist verwendet den Wertekasten des Berserkers und kehrt nach Ysgard zurück, wenn eine Stunde vergangen ist oder wenn seine Trefferpunkte auf 0 sinken. Die Geister sehen wie lebendige, atmende Krieger aus. Sie sind gegen die Zustände Bezaubert und Verängstigt immun. Wenn das Horn verwendet wurde, kann es erst nach sieben Tagen erneut verwendet werden. Es sind vier Arten des Horns von Walhalla bekannt, die jeweils aus einem anderen Metall bestehen. Die Art des Horns bestimmt, wie viele Geister es beschwört und welche Voraussetzung zu seiner Verwendung erfüllt sein muss. Der SL wählt die Art des Horns aus oder bestimmt sie zufällig, indem er anhand der folgenden Tabelle würfelt. Wenn du in das Horn stößt, ohne dass die Voraussetzung erfüllt ist, greifen die beschworenen Geister dich an. Wenn die Voraussetzung erfüllt ist, sind sie dir und deinen Verbündeten gegenüber freundlich gesinnt und gehorchen deinen Befehlen."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Hornart",
      "Geister",
      "Voraussetzung"
     ],
     "reihen": [
      [
       "1–40",
       "Silber",
       "2",
       "−"
      ],
      [
       "41–75",
       "Messing",
       "3",
       "Übung im Umgang mit allen einfachen Waffen"
      ],
      [
       "76–90",
       "Bronze",
       "4",
       "Vertrautheit mit allen mittelschweren Rüstungen"
      ],
      [
       "91–100",
       "Eisen",
       "5",
       "Übung im Umgang mit allen Kriegswaffen"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can take a Magic action to blow this horn. In response, warrior spirits from the plane of Ysgard appear in unoccupied spaces within 60 feet of you. Each spirit uses the Berserker stat block and returns to Ysgard after 1 hour or when it drops to 0 Hit Points. The spirits look like living, breathing warriors, and they have Immunity to the Charmed and Frightened conditions. Once you use the horn, it can’t be used again until 7 days have passed. Four types of Horn of Valhalla are known to exist, each made of a different metal. The horn’s type determines how many spirits it summons, as well as the requirement for its use. The GM chooses the horn’s type or determines it randomly by rolling on the following table. If you blow the horn without meeting its requirement, the summoned spirits attack you. If you meet the requirement, they are Friendly to you and your allies and follow your commands."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Horn Type",
      "Spirits",
      "Requirement"
     ],
     "reihen": [
      [
       "01–40",
       "Silver",
       "2",
       "None"
      ],
      [
       "41–75",
       "Brass",
       "3",
       "Proficiency with all Simple weapons"
      ],
      [
       "76–90",
       "Bronze",
       "4",
       "Training with all Medium armor"
      ],
      [
       "91–00",
       "Iron",
       "5",
       "Proficiency with all Martial weapons"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "horseshoes-of-a-zephyr",
  "name": {
   "de": "Hufeisen des Zephyrs",
   "en": "Horseshoes of a Zephyr"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Hufeisen sind in Vierersätzen zu finden. Du kannst als magische Aktion den Huf eines Pferds oder einer ähnlichen Kreatur mit einem der Hufeisen berühren, woraufhin dieses sich mit dem Huf verbindet. Das Entfernen eines Hufeisens erfordert ebenfalls eine magische Aktion. Wenn alle vier Hufeisen an den Hufen eines Pferds oder einer ähnlichen Kreatur befestigt sind, schwebt die Kreatur zehn Zentimeter über dem Boden und kann sich dabei normal bewegen. Dieser Effekt erlaubt der Kreatur, flüssige oder instabile Oberflächen wie Wasser oder Lava zu überqueren oder über ihnen zu stehen. Die Kreatur hinterlässt keine Spuren und ignoriert schwieriges Gelände. Außerdem kann sie bis zu zwölf Stunden täglich reisen, ohne Erschöpfungsstufen wegen längerem Reisen zu erhalten."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These horseshoes come in a set of four. As a Magic action, you can touch one of the horseshoes to the hoof of a horse or similar creature, whereupon the horseshoe affixes itself to the hoof. Removing a horseshoe also takes a Magic action. While all four shoes are affixed to the hooves of a horse or similar creature, they allow the creature to move normally while floating 4 inches above a surface. This effect means the creature can cross or stand above nonsolid or unstable surfaces, such as water or lava. The creature leaves no tracks and ignores Difficult Terrain. In addition, the creature can travel for up to 12 hours a day without gaining Exhaustion levels from extended travel."
    }
   ]
  }
 },
 {
  "id": "horseshoes-of-speed",
  "name": {
   "de": "Hufeisen der Geschwindigkeit",
   "en": "Horseshoes of Speed"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Hufeisen sind in Vierersätzen zu finden. Du kannst als magische Aktion den Huf eines Pferds oder einer ähnlichen Kreatur mit einem der Hufeisen berühren, woraufhin dieses sich mit dem Huf verbindet. Das Entfernen eines Hufeisens erfordert ebenfalls eine magische Aktion. Wenn alle vier Hufeisen an den Hufen derselben Kreatur befestigt sind, ist deren Bewegungsrate um neun Meter erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These horseshoes come in a set of four. As a Magic action, you can touch one of the horseshoes to the hoof of a horse or similar creature, whereupon the horseshoe affixes itself to the hoof. Removing a horseshoe also takes a Magic action. While all four horseshoes are attached to the same creature, its Speed is increased by 30 feet."
    }
   ]
  }
 },
 {
  "id": "immovable-rod",
  "name": {
   "de": "Unbewegliches Zepter",
   "en": "Immovable Rod"
  },
  "kopfzeile": {
   "de": "Zepter, ungewöhnlich",
   "en": "Rod, Uncommon"
  },
  "kategorie": "zepter",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses eiserne Zepter hat an einem Ende einen Knopf. Diesen Knopf kannst du mit der Verwenden‑Aktion drücken, woraufhin das Zepter magisch fixiert wird. Das Zepter bewegt sich nicht, selbst wenn es dabei der Schwerkraft trotzt, bis der Knopf mit einer weiteren Verwenden‑Aktion erneut gedrückt wird. Das Zepter kann bis zu 4.000 Kilogramm Gewicht tragen. Bei noch mehr Gewicht wird das Zepter deaktiviert und fällt zu Boden. Eine Kreatur kann eine Verwenden‑Aktion und einen SG‑30‑Stärkewurf (Athletik) ausführen. Bei einem Erfolg bewegt sich das fixierte Zepter um bis zu drei Meter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This iron rod has a button on one end. You can take a Utilize action to press the button, which causes the rod to become magically fixed in place. Until you or another creature takes a Utilize action to push the button again, the rod doesn’t move, even if it defies gravity. The rod can hold up to 8,000 pounds of weight. More weight causes the rod to deactivate and fall. A creature can take a Utilize action to make a DC 30 Strength (Athletics) check, moving the fixed rod up to 10 feet on a successful check."
    }
   ]
  }
 },
 {
  "id": "instant-fortress",
  "name": {
   "de": "Flotte Festung",
   "en": "Instant Fortress"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst als magische Aktion diese 2,5 Zentimeter große Adamant‑Statuette auf den Boden stellen und mithilfe eines Befehlsworts rasch zu einem quadratischen Turm aus Adamant wachsen lassen. Wenn du das Befehlswort wiederholst, nimmt der Turm wieder seine Statuettenform an, sofern er leer ist. Jede Kreatur im Bereich, in dem der Turm erscheint, wird in einen freien Bereich neben dem Turm geschoben. Gegenstände im Bereich, die nicht getragen oder gehalten werden, werden ebenfalls aus dem Turm geschoben. Die Seiten des Turms sind jeweils sechs Meter breit. Der Turm ist neun Meter hoch, hat Schießscharten in alle Richtungen und eine Zinnenkrone auf dem Dach. Das Innere des Turms ist in zwei Etagen unterteilt, die über eine Leiter, Treppe oder Rampe (nach deiner Wahl) verbunden sind. Diese Leiter, Treppe oder Rampe endet an einer Falltür, die aufs Dach führt. Wenn der Turm entsteht, hat er eine einzige Tür auf Bodenniveau, die in deine Richtung weist. Die Tür öffnet sich nur auf deinen Befehl hin, den du als Bonusaktion erteilen kannst. Sie ist immun gegen den Zauber Klopfen und ähnliche Magie. Der Turm wird auf magische Weise stabilisiert, sodass er nicht umkippen kann. Dach, Tür und Wände besitzen jeweils eine RK von 20, 100 Trefferpunkte und sind gegen Hieb‑, Stich‑ und Wuchtschaden (außer solchem durch Belagerungsausrüstung) immun und gegen alle anderen Schadensarten resistent. Wenn der Turm wieder seine Statuettenform annimmt, werden Schäden an ihm dadurch nicht repariert. Nur der Zauber Wunsch kann den Turm reparieren (diese Verwendung des Zaubers gilt als Replikat eines Zaubers des höchstens 8. Grades). Wann immer der Zauber Wunsch auf den Turm gewirkt wird, erhält dieser all seine Trefferpunkte zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Magic action, you can place this 1-inch adamantine statuette on the ground and, using a command word, cause it to grow rapidly into a square adamantine tower. Repeating the command word causes the tower to revert to statuette form, which works only if the tower is empty. Each creature in the area where the tower appears is pushed to an unoccupied space outside but next to the tower. Objects in the area that aren’t being worn or carried are also pushed clear of the tower. The tower is 20 feet on a side and 30 feet high, with arrow slits on all sides and a battlement atop it. Its interior is divided into two floors, with a ladder, staircase, or ramp (your choice) connecting them. This ladder, staircase, or ramp ends at a trapdoor leading to the roof. When created, the tower has a single door at ground level on the side facing you. The door opens only at your command, which you can issue as a Bonus Action. It is immune to the Knock spell and similar magic. Magic prevents the tower from being tipped over. The roof, the door, and the walls each have AC 20; HP 100; Immunity to Bludgeoning, Piercing, and Slashing damage except that which is dealt by siege equipment; and Resistance to all other damage. Shrinking the tower back down to statuette form doesn’t repair damage to the tower. Only a Wish spell can repair the tower (this use of the spell counts as replicating a spell of level 8 or lower). Each casting of Wish causes the tower to regain all its Hit Points."
    }
   ]
  }
 },
 {
  "id": "ioun-stone",
  "name": {
   "de": "Ioun-Stein",
   "en": "Ioun Stone"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, Seltenheit variiert (erfordert Einstimmung)",
   "en": "Wondrous Item, Rarity Varies (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "varies"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ioun-Steine sind etwa murmelgroß und tragen ihren Namen in Anlehnung an Ioun, Göttin des Wissens und der Prophezeiungen, die in einigen Welten verehrt wird. Es gibt viele Arten von Ioun-Steinen mit jeweils eigenen Kombinationen aus Form und Farbe. Wenn du eine magische Aktion ausführst, um einen Ioun-Stein in die Luft zu werfen, umkreist der Stein deinen Kopf im Abstand von 1W3 × 0,3 Metern und gewährt dir seinen Vorzug. Es können bis zu drei Ioun-Steine gleichzeitig deinen Kopf umkreisen. Jeder Ioun-Stein, der deinen Kopf umkreist, gilt als Gegenstand, den du trägst. Der kreisende Stein vermeidet Kontakt mit anderen Kreaturen und Gegenständen. Er kreist so, dass er Kollisionen sowie allen Versuchen anderer Kreaturen ausweicht, ihn anzugreifen oder zu fangen. Du kannst als Verwenden‑Aktion beliebig viele Ioun-Steine, die deinen Kopf umkreisen, ergreifen und verstauen. Wenn deine Einstimmung auf einen Ioun-Stein endet, während der Stein deinen Kopf umkreist, fällt er zu Boden, als hättest du ihn fallengelassen. Die Art des Steins bestimmt seine Seltenheit und seine Effekte."
    },
    {
     "typ": "punkt",
     "text": "Absorption (sehr selten): Wenn dieser blasslilafarbene elliptische Stein deinen Kopf umkreist, kannst du eine Reaktion ausführen und einen Zauber des höchstens 4. Grades aufheben, der von einer Kreatur gewirkt wird, die du sehen kannst. Ein aufgehobener Zauber hat keinen Effekt, und alle Ressourcen, die zum Wirken verwendet wurden, sind vergeudet. Wenn der Stein insgesamt 20 Zaubergrade aufgehoben hat, brennt er aus, wird mattgrau und verliert seine Magie."
    },
    {
     "typ": "punkt",
     "text": "Agilität (sehr selten): Wenn diese tiefrote Kugel deinen Kopf umkreist, ist dein Geschicklichkeitswert um 2 erhöht (auf höchstens 20)."
    },
    {
     "typ": "punkt",
     "text": "Erkenntnis (sehr selten): Wenn diese leuchtend blaue Kugel deinen Kopf umkreist, ist dein Weisheitswert um 2 erhöht (auf höchstens 20)."
    },
    {
     "typ": "punkt",
     "text": "Ernährung (selten): Wenn dieser farblose spindelförmige Stein deinen Kopf umkreist, musst du weder essen noch trinken."
    },
    {
     "typ": "punkt",
     "text": "Führungskraft (sehr selten): Wenn diese rosa und grün marmorierte Kugel deinen Kopf umkreist, ist dein Charismawert um 2 erhöht (auf höchstens 20)."
    },
    {
     "typ": "punkt",
     "text": "Höhere Absorption (legendär): Wenn dieser lila und grün marmorierte elliptische Stein deinen Kopf umkreist, kannst du eine Reaktion ausführen und einen Zauber des höchstens 8. Grades aufheben, der von einer Kreatur gewirkt wird, die du sehen kannst. Ein aufgehobener Zauber hat keinen Effekt, und alle Ressourcen, die zum Wirken verwendet wurden, sind vergeudet. Wenn der Stein insgesamt 20 Zaubergrade aufgehoben hat, brennt er aus, wird mattgrau und verliert seine Magie."
    },
    {
     "typ": "punkt",
     "text": "Meisterschaft (legendär): Wenn dieses blassgrüne Prisma deinen Kopf umkreist, ist dein Übungsbonus um 1 erhöht."
    },
    {
     "typ": "punkt",
     "text": "Regeneration (legendär): Am Ende jeder Stunde, die dieser perlweiße spindelförmige Stein deinen Kopf umkreist hat, erhältst du 15 Trefferpunkte zurück, sofern du mindestens 1 Trefferpunkt hast."
    },
    {
     "typ": "punkt",
     "text": "Reserve (selten): Dieses leuchtend violette Prisma speichert Zauber, die in es hineingewirkt werden, sodass du sie später verwenden kannst. Der Stein kann jeweils bis zu vier Zaubergrade aufnehmen. Wenn er gefunden wird, enthält er 1W4 Zaubergrade in Form von Zaubern nach Wahl des SL. Jede Kreatur kann einen Zauber des 1. bis 4. Grades in den Stein wirken. Dazu muss sie den Stein berühren, während sie den Zauber wirkt. Der Zauber hat dann keinen Effekt, sondern wird im Stein gespeichert. Wenn der Stein den Zauber nicht aufnehmen kann, wird der Zauber wirkungslos verbraucht. Der beim Wirken verwendete Zaubergrad bestimmt, wie viel Platz der Zauber im Stein verbraucht. Wenn dieser Stein deinen Kopf umkreist, kannst du einen beliebigen der darin gespeicherten Zauber wirken. Der Zauber verwendet den Zaubergrad, den Zauberrettungswurf‑SG, den Zauberangriffsbonus und das Attribut zum Zauberwirken des ursprünglichen Zauberwirkers, wird aber in jeder anderen Form behandelt, als hättest du ihn gewirkt. Danach ist er nicht mehr im Stein gespeichert und gibt seinen Platz frei."
    },
    {
     "typ": "punkt",
     "text": "Stärke (sehr selten): Wenn dieser hellblaue rautenförmige Stein deinen Kopf umkreist, ist dein Stärkewert um 2 erhöht (auf höchstens 20)."
    },
    {
     "typ": "punkt",
     "text": "Schutz (selten): Wenn dieses altrosafarbene Prisma deinen Kopf umkreist, erhältst du einen Bonus von +1 auf deine Rüstungsklasse."
    },
    {
     "typ": "punkt",
     "text": "Standhaftigkeit (sehr selten): Wenn dieser rosafarbene rautenförmige Stein deinen Kopf umkreist, ist dein Konstitutionswert um 2 erhöht (auf höchstens 20)."
    },
    {
     "typ": "punkt",
     "text": "Verstand (sehr selten): Wenn diese scharlachrot und blau marmorierte Kugel deinen Kopf umkreist, ist dein Intelligenzwert um 2 erhöht (auf höchstens 20)."
    },
    {
     "typ": "punkt",
     "text": "Wahrnehmung (selten): Wenn dieser dunkelblaue rhombenförmige Stein deinen Kopf umkreist, bist du bei Initiativewürfen und bei Weisheitswürfen (Wahrnehmung) im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Roughly marble sized, Ioun Stones are named after Ioun, a god of knowledge and prophecy revered on some worlds. Many types of Ioun Stones exist, each type a distinct combination of shape and color. When you take a Magic action to toss an Ioun Stone into the air, the stone orbits your head at a distance of 1d3 feet, conferring its benefit to you while doing so. You can have up to three Ioun Stones orbiting your head at the same time. Each Ioun Stone orbiting your head is considered to be an object you are wearing. The orbiting stone avoids contact with other creatures and objects, adjusting its orbit to avoid collisions and thwarting all attempts by other creatures to attack or snatch it. As a Utilize action, you can seize and stow any number of Ioun Stones orbiting your head. If your Attunement to an Ioun Stone ends while it’s orbiting your head, the stone falls as though you had dropped it. The type of stone determines its rarity and effects."
    },
    {
     "typ": "punkt",
     "text": "Absorption (Very Rare). While this pale lavender ellipsoid orbits your head, you can take a Reaction to cancel a spell of level 4 or lower cast by a creature you can see. A canceled spell has no effect, and any resources used to cast it are wasted. Once the stone has canceled 20 levels of spells, it burns out, turns dull gray, and loses its magic."
    },
    {
     "typ": "punkt",
     "text": "Agility (Very Rare). Your Dexterity increases by 2, to a maximum of 20, while this deep-red sphere orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Awareness (Rare). While this dark-blue rhomboid orbits your head, you have Advantage on Initiative rolls and Wisdom (Perception) checks."
    },
    {
     "typ": "punkt",
     "text": "Fortitude (Very Rare). Your Constitution increases by 2, to a maximum of 20, while this pink rhomboid orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Greater Absorption (Legendary). While this marbled lavender and green ellipsoid orbits your head, you can take a Reaction to cancel a spell of level 8 or lower cast by a creature you can see. A canceled spell has no effect, and any resources used to cast it are wasted. Once the stone has canceled 20 levels of spells, it burns out, turns dull gray, and loses its magic."
    },
    {
     "typ": "punkt",
     "text": "Insight (Very Rare). Your Wisdom increases by 2, to a maximum of 20, while this incandescent blue sphere orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Intellect (Very Rare). Your Intelligence increases by 2, to a maximum of 20, while this marbled scarlet and blue sphere orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Leadership (Very Rare). Your Charisma increases by 2, to a maximum of 20, while this marbled pink and green sphere orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Mastery (Legendary). Your Proficiency Bonus increases by 1 while this pale green prism orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Protection (Rare). You gain a +1 bonus to Armor Class while this dusty-rose prism orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Regeneration (Legendary). You regain 15 Hit Points at the end of each hour this pearly white spindle orbits your head if you have at least 1 Hit Point."
    },
    {
     "typ": "punkt",
     "text": "Reserve (Rare). This vibrant purple prism stores spells cast into it, holding them until you use them. The stone can store up to 4 levels of spells at a time. When found, it contains 1d4 levels of stored spells chosen by the GM. Any creature can cast a spell of level 1 through 4 into the stone by touching it as the spell is cast. The spell has no effect, other than to be stored in the stone. If the stone can’t hold the spell, the spell is expended without effect. The level of the slot used to cast the spell determines how much space it uses. While this stone orbits your head, you can cast any spell stored in it. The spell uses the slot level, spell save DC, spell attack bonus, and spellcasting ability of the original caster but is otherwise treated as if you cast the spell. The spell cast from the stone is no longer stored in it, freeing up space."
    },
    {
     "typ": "punkt",
     "text": "Strength (Very Rare). Your Strength increases by 2, to a maximum of 20, while this pale blue rhomboid orbits your head."
    },
    {
     "typ": "punkt",
     "text": "Sustenance (Rare). You don’t need to eat or drink while this clear spindle orbits your head."
    }
   ]
  }
 },
 {
  "id": "iron-bands",
  "name": {
   "de": "Eisenbänder",
   "en": "Iron Bands"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese rostige Eisenkugel hat einen Durchmesser von 7,5 Zentimetern und wiegt 0,5 Kilogramm. Du kannst eine magische Aktion ausführen, um die Kugel auf eine Kreatur von höchstens riesiger Größe im Abstand von bis zu 18 Metern von dir zu werfen, die du sehen kannst. Während die Kugel in der Luft ist, öffnet sie sich zu einem Gewirr aus Metallbändern. Führe einen Fernkampfangriff aus, bei dem der Angriffsbonus deinem Geschicklichkeitsmodifikator plus deinem Übungsbonus entspricht. Bei einem Treffer ist das Ziel festgesetzt, bis du eine Bonusaktion ausführst, um ihre Freilassung zu befehlen. Dies oder ein fehlgeschlagener Angriff führt dazu, dass die Bänder sich wieder zu einer Kugel zusammenziehen. Eine Kreatur, die die Eisenbänder berühren kann (auch die festgesetzte), kann eine Aktion und einen SG‑20‑Stärkewurf (Athletik) ausführen, um die Bänder zu sprengen. Bei einem Erfolg wird der Gegenstand zerstört, und die festgesetzte Kreatur wird befreit. Misslingt der Wurf, so misslingen automatisch alle weiteren Versuche der Kreatur in den nächsten 24 Stunden. Wurden die Bänder verwendet, so können sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This rusty iron sphere measures 3 inches in diameter and weighs 1 pound. You can take a Magic action to throw the sphere at a Huge or smaller creature you can see within 60 feet of yourself. As the sphere moves through the air, it opens into a tangle of metal bands. Make a ranged attack roll with an attack bonus equal to your Dexterity modifier plus your Proficiency Bonus. On a hit, the target has the Restrained condition until you take a Bonus Action to issue a command that releases it. Doing so or missing with the attack causes the bands to contract and become a sphere once more. A creature that can touch the bands, including the one Restrained, can take an action to make a DC 20 Strength (Athletics) check to break the iron bands. On a successful check, the item is destroyed, and the Restrained creature is freed. On a failed check, any further attempts made by that creature automatically fail until 24 hours have elapsed. Once the bands are used, they can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "iron-flask",
  "name": {
   "de": "Eiserne Flasche",
   "en": "Iron Flask"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese eiserne Flasche mit Messingstopfen hältst, kannst du eine magische Aktion ausführen, um auf eine Kreatur im Abstand von bis zu 18 Metern von dir zu zielen, die du sehen kannst. Ist die Flasche leer, und das Ziel stammt von einer anderen Existenzebene als deiner aktuellen, so muss es einen SG‑17‑Weisheitsrettungswurf bestehen, oder es wird in der Flasche gefangen. Wenn das Ziel bereits in der Flasche gefangen wurde, ist es bei dem Rettungswurf im Vorteil. Wenn die Kreatur in der Flasche gefangen ist, bleibt sie darin, bis sie wieder freigelassen wird. Die Flasche kann jeweils nur eine Kreatur gleichzeitig aufnehmen. Eine in der Flasche gefangene Kreatur muss weder atmen, essen oder trinken, noch altert sie. Du kannst eine magische Aktion ausführen, um den Stopfen der Flasche zu entfernen und die Kreatur freizulassen. Diese gehorcht eine Stunde lang deinen Befehlen, die sie auch dann versteht, wenn sie die Sprache nicht kennt, in der sie erteilt werden. Wenn du ihr keine Befehle gibst oder ihr einen Befehl erteilst, der sie wahrscheinlich töten würde, verteidigt sie sich, führt aber ansonsten keine Aktionen aus. Am Ende der Wirkungsdauer verhält sich die Kreatur so, wie es ihrer normalen Veranlagung und Gesinnung entspricht. Der Zauber Identifizieren offenbart, dass die Flasche eine Kreatur enthält. Um welchen Kreaturentyp es sich handelt, ist nur durch Öffnen der Flasche zu erfahren. Eine gerade entdeckte Eiserne Flasche kann bereits eine vom SL gewählte oder zufällig bestimmte Kreatur enthalten."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this brass-stoppered iron flask, you can take a Magic action to target a creature that you can see within 60 feet of yourself. If the flask is empty and the target is native to a plane of existence other than the one you’re on, the target must succeed on a DC 17 Wisdom saving throw or be trapped in the flask. If the target has been trapped by the flask before, it has Advantage on the save. Once trapped, a creature remains in the flask until released. The flask can hold only one creature at a time. A creature trapped in the flask doesn’t age and doesn’t need to breathe, eat, or drink. You can take a Magic action to remove the flask’s stopper and release the creature in the flask. The creature then obeys your commands for 1 hour, understanding those commands even if it doesn’t know the language in which the commands are given. If you issue no commands or give the creature a command that is likely to result in its death or imprisonment, it defends itself but otherwise takes no actions. At the end of the duration, the creature acts in accordance with its normal disposition and alignment. An Identify spell reveals if the flask contains a creature, but the only way to determine the type of creature is to open the flask. A newly discovered Iron Flask might already contain a creature chosen by the GM."
    }
   ]
  }
 },
 {
  "id": "javelin-of-lightning",
  "name": {
   "de": "Wurfspeer des Blitzes",
   "en": "Javelin of Lightning"
  },
  "kopfzeile": {
   "de": "Waffe (Wurfspeer), ungewöhnlich",
   "en": "Weapon (Javelin), Uncommon"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wann immer du einen Angriffswurf mit dieser magischen Waffe ausführst, der trifft, kannst du ihn Blitzschaden statt Stichschaden bewirken lassen."
    },
    {
     "typ": "punkt",
     "text": "Blitz: Wenn du diese Waffe auf ein Ziel im Abstand von bis zu 36 Metern von dir wirfst, brauchst du keinen Fernkampfangriffswurf auszuführen und kannst die Waffe stattdessen in einen Blitz verwandeln. Dieser Blitz bildet eine 1,5 Meter breite Line zwischen dir und dem Ziel. Das Ziel und alle weiteren Kreaturen in der Line (außer dir) führen einen SG‑13‑Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleiden sie 4W6 Blitzschaden, anderenfalls die Hälfte. Unmittelbar nach Bewirken dieses Schadens erscheint die Waffe wieder in deiner Hand. Diese Eigenschaft kann erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each time you make an attack roll with this magic weapon and hit, you can have it deal Lightning damage instead of Piercing damage."
    },
    {
     "typ": "punkt",
     "text": "Lightning Bolt. When you throw this weapon at a target no farther than 120 feet from you, you can forgo making a ranged attack roll and instead turn the weapon into a bolt of lightning. This bolt forms a 5-foot-wide Line between you and the target. The target and each other creature in the Line (excluding you) makes a DC 13 Dexterity saving throw, taking 4d6 Lightning damage on a failed save or half as much damage on a successful one. Immediately after dealing this damage, the weapon reappears in your hand. This property can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "lantern-of-revealing",
  "name": {
   "de": "Laterne der Enttarnung",
   "en": "Lantern of Revealing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn diese abdeckbare Laterne verwendet wird, brennt sie mit 0,5 Litern Öl sechs Stunden lang. Sie spendet im Radius von neun Metern helles Licht und im Radius von weiteren neun Metern dämmriges Licht. Unsichtbare Kreaturen und Gegenstände sind sichtbar, solange sie sich im hellen Licht der Laterne befinden. Du kannst mit einer Verwenden-Aktion die Abdeckung senken und das Licht auf dämmriges Licht in einem Radius von 1,5 Metern verringern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While lit, this hooded lantern burns for 6 hours on 1 pint of oil, shedding Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. Invisible creatures and objects are visible as long as they are in the lantern’s Bright Light. You can take a Utilize action to lower the hood, reducing the lantern’s light to Dim Light in a 5-foot radius."
    }
   ]
  }
 },
 {
  "id": "luck-blade",
  "name": {
   "de": "Glücksklinge",
   "en": "Luck Blade"
  },
  "kopfzeile": {
   "de": "Waffe (Glefe, Krummsäbel, Kurzschwert, Langschwert, Rapier, Sichel oder Zweihandschwert), legendär (erfordert Einstimmung)",
   "en": "Weapon (Glaive, Greatsword, Longsword, Rapier, Scimitar, Sickle, or Shortsword), Legendary (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Wenn du diese Waffe mit dir führst, erhältst du einen Bonus von +1 auf Rettungswürfe."
    },
    {
     "typ": "punkt",
     "text": "Glück: Wenn du diese Waffe mit dir führst, kannst du ihr Glück anrufen (keine Aktion erforderlich), um eine misslungene W20‑Prüfung zu wiederholen, sofern du nicht kampfunfähig bist. Diesen zweiten Wurf musst du verwenden. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Wunsch: Die Waffe hat 1W3 Ladungen. Wenn du sie hältst, kannst du eine Ladung verbrauchen und den Zauber Wunsch mit ihr wirken. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden. Die Waffe verliert diese Eigenschaft, wenn sie keine Ladungen mehr hat."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. While the weapon is on your person, you also gain a +1 bonus to saving throws."
    },
    {
     "typ": "punkt",
     "text": "Luck. If the weapon is on your person, you can call on its luck (no action required) to reroll one failed D20 Test if you don’t have the Incapacitated condition. You must use the second roll. Once used, this property can’t be used again until the next dawn."
    },
    {
     "typ": "punkt",
     "text": "Wish. The weapon has 1d3 charges. While holding it, you can expend 1 charge and cast Wish from it. Once used, this property can’t be used again until the next dawn. The weapon loses this property if it has no charges."
    }
   ]
  }
 },
 {
  "id": "mace-of-disruption",
  "name": {
   "de": "Streitkolben des Zusammenbruchs",
   "en": "Mace of Disruption"
  },
  "kopfzeile": {
   "de": "Waffe (Streitkolben), selten (erfordert Einstimmung)",
   "en": "Weapon (Mace), Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du mit dieser magischen Waffe einen Unhold oder Untoten triffst, erleidet diese Kreatur zusätzlich 2W6 gleißenden Schaden. Wenn das Ziel nach Erleiden dieses Schadens nicht mehr als 25 Trefferpunkte hat, muss es einen SG‑15‑Weisheitsrettungswurf bestehen, oder es wird zerstört. Bei einem erfolgreichen Rettungswurf ist die Kreatur bis zum Ende deines nächsten Zugs verängstigt."
    },
    {
     "typ": "punkt",
     "text": "Licht: Wenn du diese Waffe hältst, spendet sie in einem Radius von sechs Metern helles Licht und in einem Radius von weiteren sechs Metern dämmriges Licht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you hit a Fiend or an Undead with this magic weapon, that creature takes an extra 2d6 Radiant damage. If the target has 25 Hit Points or fewer after taking this damage, it must succeed on a DC 15 Wisdom saving throw or be destroyed. On a successful save, the creature has the Frightened condition until the end of your next turn."
    },
    {
     "typ": "punkt",
     "text": "Light. While you hold this weapon, it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet."
    }
   ]
  }
 },
 {
  "id": "mace-of-smiting",
  "name": {
   "de": "Streitkolben des Niederstreckens",
   "en": "Mace of Smiting"
  },
  "kopfzeile": {
   "de": "Waffe (Streitkolben), selten",
   "en": "Weapon (Mace), Rare"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +1 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Der Bonus erhöht sich auf +3, wenn du mit der Waffe ein Konstrukt angreifst. Würfelst du bei einem Angriffswurf mit dieser Waffe eine 20, so erleidet das Ziel zusätzlich 7 Wuchtschaden (oder 14 Wuchtschaden, wenn es ein Konstrukt ist). Wenn ein Konstrukt nach Erleiden dieses Schadens nicht mehr als 25 Trefferpunkte hat, wird es zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to attack rolls and damage rolls made with this magic weapon. The bonus increases to +3 when you use the weapon to attack a Construct. When you roll a 20 on an attack roll made with this weapon, the target takes an extra 7 Bludgeoning damage, or 14 Bludgeoning damage if it’s a Construct. If a Construct has 25 Hit Points or fewer after taking this damage, it is destroyed."
    }
   ]
  }
 },
 {
  "id": "mace-of-terror",
  "name": {
   "de": "Streitkolben des Terrors",
   "en": "Mace of Terror"
  },
  "kopfzeile": {
   "de": "Waffe (Streitkolben), selten (erfordert Einstimmung)",
   "en": "Weapon (Mace), Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese magische Waffe hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du die Waffe hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen, um eine Woge des Schreckens zu entfesseln. Jede Kreatur deiner Wahl im Abstand von bis zu neun Metern von dir muss einen SG‑15‑Weisheitsrettungswurf bestehen, oder sie ist eine Minute lang verängstigt. Eine auf diese Weise verängstigte Kreatur muss ihre Züge darauf verwenden, sich so weit wie möglich von dir zu entfernen, und sie kann keine Gelegenheitsangriffe ausführen. Als Aktion kann sie nur die Spurt‑Aktion ausführen oder versuchen, sich von einem Effekt zu befreien, der sie in ihrer Bewegung einschränkt. Kann die Kreatur sich nirgendwohin bewegen, so kann sie eine Ausweichaktion ausführen. Die Kreatur wiederholt den Rettungswurf am Ende jedes ihrer Züge. Bei einem Erfolg endet der Effekt bei ihr."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This magic weapon has 3 charges and regains 1d3 expended charges daily at dawn. While holding the weapon, you can take a Magic action and expend 1 charge to release a wave of terror from it. Each creature of your choice within 30 feet of you must succeed on a DC 15 Wisdom saving throw or have the Frightened condition for 1 minute. While Frightened in this way, a creature must spend its turns trying to move as far away from you as it can, and it can’t make Opportunity Attacks. For its action, it can use only the Dash action or try to escape from an effect that prevents it from moving. If it has nowhere it can move, the creature can take the Dodge action. At the end of each of its turns, a creature repeats the save, ending the effect on itself on a success."
    }
   ]
  }
 },
 {
  "id": "mantle-of-spell-resistance",
  "name": {
   "de": "Mantel der Zauberresistenz",
   "en": "Mantle of Spell Resistance"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Mantel trägst, bist du bei Rettungswürfen gegen Zauber im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have Advantage on saving throws against spells while you wear this cloak."
    }
   ]
  }
 },
 {
  "id": "manual-of-bodily-health",
  "name": {
   "de": "Handbuch der Körperlichen Gesundheit",
   "en": "Manual of Bodily Health"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses magisch aufgeladene Buch enthält Gesundheits ‑ und Ernährungstipps. Wenn innerhalb von maximal sechs Tagen 48 Stunden damit verbringst, den Inhalt des Buchs zu studieren und seine Anleitungen zu befolgen, wird dein Konstitutionswert um 2 erhöht (auf höchstens 30). Danach verliert das Handbuch seine Magie. Es erhält sie jedoch nach einem Jahrhundert zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This book contains health and nutrition tips, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book’s contents and practicing its guidelines, your Constitution increases by 2, to a maximum of 30. The manual then loses its magic but regains it in a century."
    }
   ]
  }
 },
 {
  "id": "manual-of-gainful-exercise",
  "name": {
   "de": "Handbuch der Körperlichen Ertüchtigung",
   "en": "Manual of Gainful Exercise"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses magisch aufgeladene Buch beschreibt Übungen zur körperlichen Ertüchtigung. Wenn innerhalb von maximal sechs Tagen 48 Stunden damit verbringst, den Inhalt des Buchs zu studieren und seine Anleitungen zu befolgen, wird dein Stärkewert um 2 erhöht (auf höchstens 30). Danach verliert das Handbuch seine Magie. Es erhält sie jedoch nach einem Jahrhundert zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This book describes fitness exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book’s contents and practicing its guidelines, your Strength increases by 2, to a maximum of 30. The manual then loses its magic but regains it in a century."
    }
   ]
  }
 },
 {
  "id": "manual-of-golems",
  "name": {
   "de": "Handbuch der Golems",
   "en": "Manual of Golems"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Foliant enthält die notwendigen Informationen und Beschwörungsformeln, um einen Golem eines bestimmten Typs zu erschaffen. Der SL wählt die Schadensart aus oder bestimmt sie zufällig, indem er anhand der entsprechenden Tabelle würfelt. Um das Handbuch entziffern und verwenden zu können, musst du ein Zauberwirker sein und über mindestens zwei Zauberplätze des 5. Grades verfügen. Eine Kreatur, die das Handbuch der Golems nicht verwenden kann und es dennoch zu lesen versucht, erleidet 6W6 psychischen Schaden. Um einen Golem zu erschaffen, benötigst du die in der Tabelle angegebene Zeit. Dabei arbeitest du ohne Unterbrechung genau nach der Anleitung im Handbuch und ruhst dich maximal acht Stunden pro Tag aus. Du musst außerdem die angegebenen Kosten für die Materialien bezahlen. Sobald der Golem fertiggestellt ist, wird das Buch von mystischen Flammen verschlungen. Der Golem erwacht zum Leben, wenn die Asche des Handbuchs auf ihn gestreut wird. Den Wertekasten des Golems findest du unter „Monster“. Der Golem steht unter deiner Kontrolle, versteht deine Befehle und gehorcht ihnen."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W20",
      "Golem",
      "Zeit",
      "Kosten"
     ],
     "reihen": [
      [
       "1",
       "Eisengolem",
       "120 Tage",
       "100.000 GM"
      ],
      [
       "2–13",
       "Fleischgolem",
       "60 Tage",
       "50.000 GM"
      ],
      [
       "14–18",
       "Lehmgolem",
       "30 Tage",
       "65.000 GM"
      ],
      [
       "19–20",
       "Steingolem",
       "90 Tage",
       "80.000 GM"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This tome contains information and incantations necessary to make a particular type of golem. The GM chooses the type or determines it randomly by rolling on the accompanying table. To decipher and use the manual, you must be a spellcaster with at least two level 5 spell slots. A creature that can’t use a Manual of Golems and attempts to read it takes 6d6 Psychic damage. To create a golem, you must spend the time shown on the table, working without interruption with the manual at hand and resting no more than 8 hours per day. You must also pay the specified cost to purchase supplies. Once you finish creating the golem, the book is consumed in eldritch flames. The golem becomes animate when the ashes of the manual are sprinkled on it. See “Monsters” for the golem’s stat block. The golem is under your control, and it understands and obeys your commands."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d20",
      "Golem",
      "Time",
      "Cost"
     ],
     "reihen": [
      [
       "1–5",
       "Clay Golem",
       "30 days",
       "65,000 GP"
      ],
      [
       "6–17",
       "Flesh Golem",
       "60 days",
       "50,000 GP"
      ],
      [
       "18",
       "Iron Golem",
       "120 days",
       "100,000 GP"
      ],
      [
       "19–20",
       "Stone Golem",
       "90 days",
       "80,000 GP"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "manual-of-quickness-of-action",
  "name": {
   "de": "Handbuch des Schnellen Handelns",
   "en": "Manual of Quickness of Action"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses magisch aufgeladene Buch enthält Koordinations ‑ und Balanceübungen. Wenn du innerhalb von maximal sechs Tagen 48 Stunden damit verbringst, den Inhalt des Buchs zu studieren und seine Anleitungen zu befolgen, wird dein Geschicklichkeitswert um 2 erhöht (auf höchstens 30). Danach verliert das Handbuch seine Magie. Es erhält sie jedoch nach einem Jahrhundert zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This book contains coordination and balance exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book’s contents and practicing its guidelines, your Dexterity increases by 2, to a maximum of 30. The manual then loses its magic but regains it in a century."
    }
   ]
  }
 },
 {
  "id": "marvelous-pigments",
  "name": {
   "de": "Wunderfarben",
   "en": "Marvelous Pigments"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses fein gearbeitete Holzkästchen enthält 1W4 Farbtöpfe und einen Pinsel (es wiegt insgesamt 0,5 Kilogramm). Wenn du den Pinsel verwendest und einen Farbtopf verbrauchst, kannst du beliebig viele dreidimensionale Gegenstände und Geländemerk male (wie Mauern, Türen, Bäume, Blumen, Waffen, Spinnweben und Gruben) malen, sofern diese Elemente alle in einen Würfel von sechs Metern Kantenlänge passen. Der Vorgang dauert zehn Minuten (unabhängig davon, wie viele Elemente du malst). Während dieser Dauer musst du dich im Würfel aufhalten und konzentrieren. Wenn deine Konzentration unterbrochen wird oder du den Würfel verlässt, ehe die Arbeit getan ist, verschwinden alle gemalten Elemente, und der Farbtopf ist vergeudet. Ist die Arbeit getan, so werden alle gemalten Gegenstände und Geländemerkmale real. Wenn du also eine Tür an eine Wand malst, erschaffst du eine echte Tür, die geöffnet werden kann und in den Bereich auf der anderen Seite der Wand führt. Malst du eine Grube, so erschaffst du eine echte Grube, die sich allerdings mit ihrer vollständigen Tiefe innerhalb des Würfels von sechs Metern Kantenlänge befinden muss. Kein Gegenstand, der mit einem Farbtopf erschaffen wird, kann einen Wert von mehr als 25 GM haben, und der Gesamtwert aller mit einem Farbtopf erschaffenen Gegenstände kann 500 GM nicht überschreiten. Malst du Gegenstände von größerem Wert (wie einen großen Haufen Goldmünzen), so sehen sie zwar echt aus, doch eine nähere Untersuchung enthüllt, dass sie aus einem wertlosen Material wie Kleister oder Keks bestehen. Wenn du eine Energieform wie Feuer oder Blitze malst, verflüchtigt sich die Energie sofort nach der Fertigstellung des Bildes, ohne Schaden zu bewirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This fine wooden box contains 1d4 pots of pigment and a brush (weighing 1 pound in total). Using the brush and expending 1 pot of pigment, you can paint any number of three-dimensional objects and terrain features (such as walls, doors, trees, flowers, weapons, webs, and pits), provided these elements are all confined to a 20-foot Cube. The effort takes 10 minutes (regardless of the number of elements you create), during which time you must remain in the Cube, and requires Concentration. If your Concentration is broken or you leave the Cube before the work is done, all the painted elements vanish, and the pot of pigment is wasted. When the work is done, all the painted objects and terrain features become real. Thus, painting a door on a wall creates an actual door, which can be opened to whatever is beyond. Painting a pit creates a real pit, the entire depth of which must lie within the 20-foot Cube. No object created by a pot of pigment can have a value greater than 25 GP, and the total value of all objects created by a pot of pigment can’t exceed 500 GP. If you paint objects of greater value (such as a large pile of gold), they look authentic, but close inspection reveals they’re made from paste, cookies, or some other worthless material. If you paint a form of energy such as fire or lightning, the energy dissipates as soon as you complete the painting, doing no harm."
    }
   ]
  }
 },
 {
  "id": "medallion-of-thoughts",
  "name": {
   "de": "Medaillon der Gedanken",
   "en": "Medallion of Thoughts"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Das Medaillon hat fünf Ladungen. Wenn du es trägst, kannst du eine Ladung verbrauchen, um den Zauber Gedanken wahrnehmen (Rettungswurf‑SG 13) damit zu wirken. Das Medaillon erhält täglich im Morgengrauen 1W4 verbrauchte Ladungen zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The medallion has 5 charges. While wearing it, you can expend 1 charge to cast Detect Thoughts (save DC 13) from it. The medallion regains 1d4 expended charges daily at dawn."
    }
   ]
  }
 },
 {
  "id": "mirror-of-life-trapping",
  "name": {
   "de": "Seelenspiegel",
   "en": "Mirror of Life Trapping"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn man diesen 1,2 Meter hohen, 60 Zentimeter breiten Spiegel indirekt betrachtet, sind blasse Abbilder von Kreaturen darin zu erkennen. Der Spiegel wiegt 25 Kilogramm, besitzt eine RK von 11, 10 TP, ist anfällig für Wuchtschaden und gegen Gift‑ und psychischen Schaden immun. Sinken seine Trefferpunkte auf 0, so zerspringt er und ist zerstört. Wenn der Spiegel an einer senkrechten Oberfläche hängt und du dich im Abstand von bis zu 1,5 Metern von ihm befindest, kannst du eine magische Aktion ausführen und ein Befehlswort aussprechen, um ihn zu aktivieren. Er bleibt aktiviert, bis du eine magische Aktion ausführst und das Befehlswort wiederholst, um ihn zu deaktivieren. Jede Kreatur außer dir, die sich im Abstand von bis zu neun Metern vom aktivierten Spiegel befindet und ihr Spiegelbild darin sieht, muss einen SG‑15‑Charismarettungswurf bestehen. Misslingt der Wurf, so wird sie mit allem, was sie trägt oder hält, in einer der zwölf extradimensionalen Zellen des Spiegels gefangen. Eine Kreatur, die um die Natur des Spiegels weiß, ist beim Rettungswurf im Vorteil, und Konstrukte bestehen den Rettungswurf automatisch. Eine extradimensionale Zelle ist eine unendliche Weite, die mit dichtem Nebel gefüllt ist. Dieser verringert die Sichtweite auf drei Meter. In den Zellen des Spiegels gefangene Kreaturen altern nicht und müssen nicht essen, trinken oder schlafen. Eine gefangene Kreatur kann mithilfe von Magie entkommen, die Ebenenreisen erlaubt. Anderenfalls ist die Kreatur in der Zelle gefangen, bis sie befreit wird. Wenn der Spiegel eine Kreatur einfängt, während seine zwölf Zellen bereits besetzt sind, gibt der Spiegel eine zufällige gefangene Kreatur frei, um den neuen Gefangenen aufnehmen zu können. Eine befreite Kreatur erscheint in einem freien Bereich in Sichtweite des Spiegels, ist jedoch von ihm abgewandt. Wenn der Spiegel zerstört wird, werden alle Kreaturen daraus befreit und erscheinen in freien Bereichen in seiner Nähe. Wenn du dich im Abstand von bis zu 1,5 Meter vom Spiegel befindest, kannst du eine magische Aktion ausführen und den Namen einer gefangenen Kreatur aussprechen oder eine bestimmte Zellnummer nennen. Die benannte oder in der angegebenen Zelle gefangene Kreatur erscheint als Abbild auf der Oberfläche des Spiegels. Die Kreatur und du könnt dann kommunizieren. Du kannst auch eine magische Aktion ausführen und ein zweites Befehlswort aussprechen, um eine gefangene Kreatur zu befreien. Die befreite Kreatur erscheint mit ihrem Besitz im dem Spiegel nächsten freien Bereich und ist vom Spiegel abgewandt. Wenn der Spiegel in den extradimensionalen Raum eines Nimmervollen Beutels, eines Tragbaren Lochs oder eines ähnlichen Gegenstands gelangt, werden beide Gegenstände sofort zerstört, und ein Tor zur Astralebene öffnet sich. Das Tor erscheint dort, wo der eine Gegenstand in den anderen gelangt ist. Alle Kreaturen, die sich im Abstand von bis zu drei Metern vom Tor befinden und nicht über vollständige Deckung verfügen, werden hineingezogen und an einen zufälligen Ort auf der Astralebene transportiert. Dann schließt sich das Tor. Das Tor funktioniert nur in eine Richtung und kann nicht wieder geöffnet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When this 4-foot-tall, 2-foot-wide mirror is viewed indirectly, its surface shows faint images of creatures. The mirror weighs 50 pounds, and it has AC 11, HP 10, Immunity to Poison and Psychic damage, and Vulnerability to Bludgeoning damage. It shatters and is destroyed when reduced to 0 Hit Points. If the mirror is hanging on a vertical surface and you are within 5 feet of it, you can take a Magic action and use a command word to activate it. It remains activated until you take a Magic action and repeat the command word to deactivate it. Any creature other than you that sees its reflection in the activated mirror while within 30 feet of the mirror must succeed on a DC 15 Charisma saving throw or be trapped, along with anything it is wearing or carrying, in one of the mirror’s twelve extradimensional cells. A creature that knows the mirror’s nature makes the save with Advantage, and Constructs succeed on the save automatically. An extradimensional cell is an infinite expanse filled with thick fog that reduces visibility to 10 feet. Creatures trapped in the mirror’s cells don’t age, and they don’t need to eat, drink, or sleep. A creature trapped within a cell can escape using magic that permits planar travel. Otherwise, the creature is confined to the cell until freed. If the mirror traps a creature but its twelve extradimensional cells are already occupied, the mirror frees one trapped creature at random to accommodate the new prisoner. A freed creature appears in an unoccupied space within sight of the mirror but facing away from it. If the mirror is shattered, all creatures it contains are freed and appear in unoccupied spaces near it. While within 5 feet of the mirror, you can take a Magic action to name one creature trapped in it or call out a particular cell by number. The creature named or contained in the named cell appears as an image on the mirror’s surface. You and the creature can then communicate. In a similar way, you can take a Magic action and use a second command word to free one creature trapped in the mirror. The freed creature appears, along with its possessions, in the unoccupied space nearest to the mirror and facing away from it. Placing the mirror inside an extradimensional space created by a Bag of Holding, Portable Hole, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within 10 feet of the gate and not behind Total Cover is sucked through it to a random location on the Astral Plane. The gate then closes. The gate is one-way only and can’t be reopened."
    }
   ]
  }
 },
 {
  "id": "mithral-armor",
  "name": {
   "de": "Mithralrüstung",
   "en": "Mithral Armor"
  },
  "kopfzeile": {
   "de": "Rüstung (beliebige mittelschwere oder schwere Rüstung außer Fellrüstung), ungewöhnlich",
   "en": "Armor (Any Medium or Heavy, Except Hide Armor), Uncommon"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mithral ist ein leichtes, flexibles Metall. Rüstungen aus diesem Material können unter normaler Kleidung getragen werden. Wenn die Rüstung normalerweise einen Nachteil bei Geschicklichkeitswürfen (Heimlichkeit) bedeutet oder eine Stärkevoraussetzung hat, gilt bei ihrer Version aus Mithral keines von beidem."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Mithral is a light, flexible metal. Armor made of this substance can be worn under normal clothes. If the armor normally imposes Disadvantage on Dexterity (Stealth) checks or has a Strength requirement, the mithral version of the armor doesn’t."
    }
   ]
  }
 },
 {
  "id": "mysterious-deck",
  "name": {
   "de": "Mysteriöse Karten",
   "en": "Mysterious Deck"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Satz Karten ist meist in einer Schatulle oder einem Beutel zu finden. Die Karten sind aus Elfenbein oder Pergament gefertigt. Die meisten (75 Prozent) dieser Kartensätze haben 13 Karten, und einige haben 22. Verwende die entsprechende Spalte der Tabelle „Mysteriöse Karten“, wenn du die gezogenen Karten zufällig bestimmst. Zunächst musst du ansagen, wie viele Karten du ziehen möchtest. Dann ziehst du diese Anzahl zufällig. Karten, die über die angesagte Anzahl hinaus gezogen werden, haben keinen Effekt. Anderenfalls wirkt die Magie einer Karte, sobald diese gezogen wurde. Zwischen dem Ziehen jeder Karte darf nicht mehr als eine Stunde vergehen. Wenn du weniger als die angesagte Anzahl von Karten ziehst, fliegen die übrigen Karten von selbst aus dem Stapel und entfalten ihre Effekte gleichzeitig. Sobald eine Karte gezogen wurde, verschwindet sie. Sofern es sich nicht um den Narren oder den Hofnarren handelt, erscheint die Karte wieder im Ziehstapel, sodass dieselbe Karte zweimal gezogen werden kann. (Wenn sich der Narr oder der Hofnarr nicht mehr im Stapel befinden, jedoch als Würfelergebnis auftauchen, würfle erneut anhand der Tabelle.)"
    },
    {
     "typ": "tabelle",
     "titel": "Mysteriöse Karten",
     "kopf": [
      "1W100 (Stapel mit 13 Karten)",
      "1W100 (Stapel mit 22 Karten)",
      "Karte"
     ],
     "reihen": [
      [
       "−",
       "1–5",
       "Balance"
      ],
      [
       "−",
       "6–10",
       "Edelstein"
      ],
      [
       "1–8",
       "11–14",
       "Euryale"
      ],
      [
       "9–16",
       "15–18",
       "Flammen"
      ],
      [
       "17–24",
       "19–23",
       "Hofnarr"
      ],
      [
       "−",
       "24–28",
       "Komet"
      ],
      [
       "−",
       "29–32",
       "Krallen"
      ],
      [
       "25–28",
       "33–36",
       "Leere"
      ],
      [
       "29–36",
       "37–41",
       "Mond"
      ],
      [
       "−",
       "42–45",
       "Narr"
      ],
      [
       "−",
       "46–49",
       "Rätsel"
      ],
      [
       "37–44",
       "50–54",
       "Ritter"
      ],
      [
       "45–52",
       "55–58",
       "Ruin"
      ],
      [
       "−",
       "59–63",
       "Schicksale"
      ],
      [
       "53–60",
       "64–68",
       "Schlüssel"
      ],
      [
       "61–68",
       "69–72",
       "Schurke"
      ],
      [
       "69–76",
       "73–77",
       "Sonne"
      ],
      [
       "77–84",
       "78–82",
       "Stern"
      ],
      [
       "82–92",
       "83–87",
       "Thron"
      ],
      [
       "93–100",
       "88–91",
       "Totenschädel"
      ],
      [
       "−",
       "92–95",
       "Turm"
      ],
      [
       "−",
       "96–100",
       "Weiser"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "Die Effekte der Karten sind nachfolgend beschrieben."
    },
    {
     "typ": "punkt",
     "text": "Balance: Du kannst einen deiner Attributswerte um 2 erhöhen (auf höchstens 22), sofern du einen anderen Attributswert um 2 verringerst. Du kannst keinen Attributswert verringern, der höchstens 5 beträgt. Alternativ kannst du beschließen, deine Attributswerte nicht zu verändern. In diesem Fall hat die Karte keinen Effekt."
    },
    {
     "typ": "punkt",
     "text": "Edelstein: Zu deinen Füßen erscheinen 25 Schmuckstücke im Wert von jeweils 2.000 GM oder 50 Edelsteine im Wert von jeweils 1.000 GM."
    },
    {
     "typ": "punkt",
     "text": "Euryale: Das medusenähnliche Antlitz auf dieser Karte verflucht dich. Du erhältst einen Malus von −2 auf Rettungswürfe, solange du auf diese Weise verflucht bist. Nur ein Gott oder die Magie der Karte „Schicksale“ kann diesen Fluch aufheben."
    },
    {
     "typ": "punkt",
     "text": "Flammen: Ein mächtiger Teufel wird dein Feind. Der Teufel trachtet nach deinem Untergang und martert dich. Er genießt dein Leiden, bevor er schließlich versucht, dich zu töten. Diese Feindschaft dauert an, bis du stirbst oder der Teufel tot ist."
    },
    {
     "typ": "punkt",
     "text": "Hofnarr: Du bist in den nächsten 72 Stunden bei W20‑Prüfungen im Vorteil, oder du kannst zwei Karten mehr als die von dir angesagte Anzahl ziehen."
    },
    {
     "typ": "punkt",
     "text": "Komet: Wenn du das nächste Mal gegen mindestens eine feindlich gesinnte Kreatur kämpfst, kannst du eine davon als deinen Feind auswählen, wenn du die Initiative auswürfelst. Verringerst du in diesem Kampf die Trefferpunkte deines Feindes auf 0, so bist du ein Jahr lang bei Todesrettungswürfen im Vorteil. Wenn jemand anders die Trefferpunkte deines Feindes auf 0 verringert oder du keinen Feind auswählst, hat diese Karte keinen Effekt."
    },
    {
     "typ": "punkt",
     "text": "Krallen: Jeder magische Gegenstand, den du trägst oder mitführst, zerfällt. Artefakte in deinem Besitz verschwinden stattdessen."
    },
    {
     "typ": "punkt",
     "text": "Leere: Deine Seele wird deinem Körper entrissen, in einen Gegenstand gesperrt und an einem Ort verborgen, den der SL bestimmt. Mindestens ein mächtiges Wesen bewacht den Ort. Solange deine Seele auf diese Art gefangen ist, verharrt dein Körper reglos, altert nicht und braucht weder Wasser und Nahrung noch Luft. Der Zauber Wunsch kann deine Seele zwar nicht in deinen Körper zurückbringen, doch er kann enthüllen, an welchem Ort sich der Gegenstand mit deiner Seele befindet. Du ziehst keine weiteren Karten."
    },
    {
     "typ": "punkt",
     "text": "Mond: Du erhältst die Fähigkeit, 1W3‑mal den Zauber Wunsch zu wirken."
    },
    {
     "typ": "punkt",
     "text": "Narr: Du bist in den nächsten 72 Stunden bei W20‑Prüfungen im Nachteil. Ziehe eine weitere Karte (die aktuelle zählt nicht als einer deiner angesagten Züge)."
    },
    {
     "typ": "punkt",
     "text": "Rätsel: Dein Intelligenz ‑ oder dein Weisheitswert wird dauerhaft um 1W4+1 verringert (Minimum: 1). Du kannst eine Karte mehr als die von dir angesagte Anzahl ziehen."
    },
    {
     "typ": "punkt",
     "text": "Ritter: Ein Ritter erscheint auf magische Art in einem freien Bereich deiner Wahl im Abstand von bis zu neun Metern von dir und tritt in deine Dienste. Der Ritter hat dieselbe Gesinnung wie du und dient dir treu bis zum Tod, da er euch vom Schicksal verbunden glaubt. Arbeite mit deinem SL einen Namen und eine Hintergrundgeschichte für diesen NSC aus. Der SL kann nach Wunsch einen anderen Wertekasten verwenden, um den Ritter darzustellen."
    },
    {
     "typ": "punkt",
     "text": "Ruin: Du verlierst außer magischen Gegenständen alles, was du bei dir trägst oder besitzt. Bewegliches Eigentum verschwindet. Geschäfte, Gebäude und Grundstücke, die du besitzt, gehen auf eine Weise verloren, die die Realität am wenigsten verändert. Eigentumsnachweise für etwas, was du durch diese Karte verlierst, verschwinden ebenfalls."
    },
    {
     "typ": "punkt",
     "text": "Schicksale: Die Realität gerät aus den Fugen und wird neu zusammengesetzt. Du kannst ein Ereignis vermeiden oder löschen, als wäre es niemals passiert. Du kannst die Magie der Karte sofort nach dem Ziehen nutzen oder zu jedem anderen Zeitpunkt, ehe du stirbst."
    },
    {
     "typ": "punkt",
     "text": "Schlüssel: Eine seltene oder seltenere magische Waffe erscheint in deinen Händen. Du hast Übung im Umgang mit ihr. Der SL wählt die Waffe aus."
    },
    {
     "typ": "punkt",
     "text": "Schurke: Ein NSC nach Wahl des SL wird dir gegenüber feindlich gesinnt. Du weißt nicht, wer dieser NSC ist, bis er oder jemand anders dies enthüllt. Diese feindliche Einstellung des NSC kann nur durch den Zauber Wunsch oder durch göttliche Intervention beendet werden."
    },
    {
     "typ": "punkt",
     "text": "Sonne: Ein magischer Gegenstand (nach Wahl des SL) erscheint bei dir. Außerdem erhältst du täglich im Morgengrauen 10 temporäre Trefferpunkte, bis du stirbst."
    },
    {
     "typ": "punkt",
     "text": "Stern: Erhöhe einen deiner Attributswerte um 2 (auf höchstens 24)."
    },
    {
     "typ": "punkt",
     "text": "Thron: Du erhältst Übung und Expertise in Geschichte, Motiv erkennen, Einschüchtern oder Überzeugen (nach deiner Wahl). Außerdem erhältst du die Besitzrechte an einem kleinen Bergfried irgendwo auf der Welt. Allerdings beherbergt dieser aktuell mindestens ein Monster, das besiegt oder vertrieben werden muss, damit du den Bergfried beanspruchen kannst."
    },
    {
     "typ": "punkt",
     "text": "Totenschädel: Ein Avatar des Todes (siehe begleitender Wertekasten) erscheint in einem freien Bereich so nahe wie möglich bei dir. Er erscheint als geisterhaftes Skelett in zerrissener schwarzer Robe, das eine Sense schwingt und seine Angriffe nur auf dich richtet. Der Avatar verschwindet, wenn seine Trefferpunkte auf 0 sinken oder du stirbst. Wenn einer deiner Verbündeten dem Avatar Schaden zufügt, beschwört dieser Verbündete einen weiteren Avatar des Todes. Der neue Avatar erscheint in einem freien Bereich so nahe wie möglich beim Verbündeten und richtet seine Angriffe nur auf den Verbündeten. Du und deine Verbündeten könnt infolge der Kartenziehung nur jeweils einen Avatar herbeirufen. Eine Kreatur, die von einem Avatar getötet wird, kann nicht wiederbelebt werden."
    },
    {
     "typ": "punkt",
     "text": "Turm: Du verschwindest und wirst in einem scheintoten Zustand in einer extradimensionalen Sphäre eingekerkert. Was du trägst und mit dir führst, verschwindet mit dir. Nur Artefakte bleiben in dem Bereich zurück, den du verlässt. Du bist gefangen, bis du gefunden und aus der Sphäre befreit wirst. Erkenntnismagie kann dich nicht aufspüren. Der Zauber Wunsch kann allerdings enthüllen, wo du eingekerkert bist. Du ziehst keine weiteren Karten."
    },
    {
     "typ": "punkt",
     "text": "Weiser: Du kannst zu einem beliebigen Zeitpunkt innerhalb eines Jahres nach dem Ziehen dieser Karte meditieren und dabei eine Frage stellen. Eine innere Stimme gibt dir eine wahrheitsgemäße Antwort auf diese Frage."
    },
    {
     "typ": "liste",
     "titel": "Avatar des Todes",
     "eintraege": [
      "Mittelgroßer Untoter, neutral böse",
      "RK 20 Initiative +3 (13)",
      "TP Hälfte des TP-Maximums des Beschwörers",
      "Bewegungsrate 18 m, Fliegen 18 m (Schweben) MOD RW MOD RW MOD RW",
      "Stä 16 +3 +3 GeS 16 +3 +3 Kon 16 +3 +3",
      "Int 16 +3 +3 WeI 16 +3 +3 Cha 16 +3 +3",
      "Immunitäten Bewusstlos, Bezaubert, Erschöpft, Gelähmt, Gift, Nekrotisch, Verängstigt, Vergiftet, Versteinert",
      "Sinne Wahrer Blick 18 m, Passive Wahrnehmung 13",
      "Sprachen Alle Sprachen, die sein Beschwörer kennt",
      "HG − (EP 0; ÜB wie der seines Beschwörers) Merkmale",
      "Körperlose Bewegung: Der Avatar kann sich durch andere Kreaturen und Gegenstände bewegen, als wären sie schwieriges Gelände. Er erleidet 5 (1W10) Energieschaden, wenn er den Zug in einem Gegenstand beendet. Aktionen",
      "Mehrfachangriff: Der Avatar führt eine Anzahl von Sense-schwingen-Angriffen in Höhe der Hälfte des Übungsbonus (aufgerundet) des Beschwörers aus.",
      "Sense schwingen: Nahkampfangriffswurf: Automatischer Treffer, Reichweite 1,5 m. Treffer: 7 (1W8+3) Hiebschaden plus 4 (1W8) nekrotischer Schaden."
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Usually found in a box or pouch, this deck contains a number of cards made of ivory or vellum. Most (75 percent) of these decks have thirteen cards, but some have twenty-two. Use the appropriate column of the Mysterious Deck table when randomly determining cards drawn from the deck. Before you draw a card, you must declare how many cards you intend to draw and then draw them randomly. Any cards drawn in excess of this number have no effect. Otherwise, as soon as you draw a card from the deck, its magic takes effect. You must draw each card no more than 1 hour after the previous draw. If you fail to draw the chosen number, the remaining number of cards fly from the deck on their own and take effect all at once. Once a card is drawn, it disappears. Unless the card is the Fool or Jester, the card reappears in the deck, making it possible to draw the same card twice. (Once the Fool or Jester has left the deck, reroll on the table if that card comes up again.)"
    },
    {
     "typ": "tabelle",
     "titel": "Mysterious Deck",
     "kopf": [
      "1d100 (13-Card Deck)",
      "1d100 (22-Card Deck)",
      "Card"
     ],
     "reihen": [
      [
       "—",
       "01–05",
       "Balance"
      ],
      [
       "—",
       "06–10",
       "Comet"
      ],
      [
       "—",
       "11–14",
       "Donjon"
      ],
      [
       "01–08",
       "15–18",
       "Euryale"
      ],
      [
       "—",
       "19–23",
       "Fates"
      ],
      [
       "09–16",
       "24–27",
       "Flames"
      ],
      [
       "—",
       "28–31",
       "Fool"
      ],
      [
       "—",
       "32–36",
       "Gem"
      ],
      [
       "17–24",
       "37–41",
       "Jester"
      ],
      [
       "25–32",
       "42–46",
       "Key"
      ],
      [
       "33–40",
       "47–51",
       "Knight"
      ],
      [
       "41–48",
       "52–56",
       "Moon"
      ],
      [
       "—",
       "57–60",
       "Puzzle"
      ],
      [
       "49–56",
       "61–64",
       "Rogue"
      ],
      [
       "57–64",
       "65–68",
       "Ruin"
      ],
      [
       "—",
       "69–73",
       "Sage"
      ],
      [
       "65–72",
       "74–77",
       "Skull"
      ],
      [
       "73–80",
       "78–82",
       "Star"
      ],
      [
       "81–88",
       "83–87",
       "Sun"
      ],
      [
       "—",
       "88–91",
       "Talons"
      ],
      [
       "89–96",
       "92–96",
       "Throne"
      ],
      [
       "97–00",
       "97–00",
       "Void"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "Each card’s effect is described below."
    },
    {
     "typ": "punkt",
     "text": "Balance. You can increase one of your ability scores by 2, to a maximum of 22, provided you also decrease another one of your ability scores by 2. You can’t decrease an ability that has a score of 5 or lower. Alternatively, you can choose not to adjust your ability scores, in which case this card has no effect."
    },
    {
     "typ": "punkt",
     "text": "Comet. The next time you enter combat against one or more Hostile creatures, you can select one of them as your foe when you roll Initiative. If you reduce your foe to 0 Hit Points during that combat, you have Advantage on Death Saving Throws for 1 year. If someone else reduces your chosen foe to 0 Hit Points or you don’t choose a foe, this card has no effect."
    },
    {
     "typ": "punkt",
     "text": "Donjon. You disappear and become entombed in a state of suspended animation in an extradimensional sphere. Everything you’re wearing and carrying disappears with you except for Artifacts, which stay behind in the space you occupied when you disappeared. You remain imprisoned until you are found and removed from the sphere. You can’t be located by any Divination magic, but a Wish spell can reveal the location of your prison. You draw no more cards."
    },
    {
     "typ": "punkt",
     "text": "Euryale. The card’s medusa-like visage curses you. You take a −2 penalty to saving throws while cursed in this way. Only a god or the magic of the Fates card can end this curse."
    },
    {
     "typ": "punkt",
     "text": "Fates. Reality’s fabric unravels and spins anew, allowing you to avoid or erase one event as if it never happened. You can use the card’s magic as soon as you draw the card or at any other time before you die."
    },
    {
     "typ": "punkt",
     "text": "Flames. A powerful devil becomes your enemy. The devil seeks your ruin and torments you, savoring your suffering before attempting to slay you. This enmity lasts until either you or the devil dies."
    },
    {
     "typ": "punkt",
     "text": "Fool. You have Disadvantage on D20 Tests for the next 72 hours. Draw another card; this draw doesn’t count as one of your declared draws."
    },
    {
     "typ": "punkt",
     "text": "Gem. Twenty-five pieces of jewelry worth 2,000 GP each or fifty gems worth 1,000 GP each appear at your feet."
    },
    {
     "typ": "punkt",
     "text": "Jester. You have Advantage on D20 Tests for the next 72 hours, or you can draw two additional cards beyond your declared draws."
    },
    {
     "typ": "punkt",
     "text": "Key. A Rare or rarer magic weapon with which you are proficient appears on your person. The GM chooses the weapon."
    },
    {
     "typ": "punkt",
     "text": "Knight. You gain the service of a Knight, who magically appears in an unoccupied space you choose within 30 feet of yourself. The knight has the same alignment as you and serves you loyally until death, believing the two of you have been drawn together by fate. Work with your GM to create a name and backstory for this NPC. The GM can use a different stat block to represent the knight, as desired."
    },
    {
     "typ": "punkt",
     "text": "Moon. You gain the ability to cast Wish 1d3 times."
    },
    {
     "typ": "punkt",
     "text": "Puzzle. Permanently reduce your Intelligence or Wisdom by 1d4 + 1 (to a minimum score of 1). You can draw one additional card beyond your declared draws."
    },
    {
     "typ": "punkt",
     "text": "Rogue. An NPC of the GM’s choice becomes Hostile toward you. You don’t know the identity of this NPC until they or someone else reveals it. Nothing less than a Wish spell or divine intervention can end the NPC’s hostility toward you."
    },
    {
     "typ": "punkt",
     "text": "Ruin. All forms of wealth that you carry or own, other than magic items, are lost to you. Portable property vanishes. Businesses, buildings, and land you own are lost in a way that alters reality the least. Any documentation that proves you should own something lost to this card also disappears."
    },
    {
     "typ": "punkt",
     "text": "Sage. At any time you choose within one year of drawing this card, you can ask a question in meditation and mentally receive a truthful answer to that question."
    },
    {
     "typ": "punkt",
     "text": "Skull. An Avatar of Death (see the accompanying stat block) appears in an unoccupied space as close to you as possible. The avatar targets only you with its attacks, appearing as a ghostly skeleton clad in a tattered black robe and carrying a spectral scythe. The avatar disappears when it drops to 0 Hit Points or you die. If an ally of yours deals damage to the avatar, that ally summons another Avatar of Death. The new avatar appears in an unoccupied space as close to that ally as possible and targets only that ally with its attacks. You and your allies can each summon only one avatar as a consequence of this draw. A creature slain by an avatar can’t be restored to life."
    },
    {
     "typ": "punkt",
     "text": "Star. Increase one of your ability scores by 2, to a maximum of 24."
    },
    {
     "typ": "punkt",
     "text": "Sun. A magic item (chosen by the GM) appears on your person. In addition, you gain 10 Temporary Hit Points daily at dawn until you die."
    },
    {
     "typ": "punkt",
     "text": "Talons. Every magic item you wear or carry disintegrates. Artifacts in your possession vanish instead."
    },
    {
     "typ": "punkt",
     "text": "Throne. You gain proficiency and Expertise in your choice of History, Insight, Intimidation, or Persuasion. In addition, you gain rightful ownership of a small keep somewhere in the world. However, the keep is currently home to one or more monsters, which must be cleared out before you can claim the keep as yours."
    },
    {
     "typ": "punkt",
     "text": "Void. Your soul is drawn from your body and contained in an object in a place of the GM’s choice. One or more powerful beings guard the place. While your soul is trapped in this way, your body is inert, ceases aging, and requires no food, air, or water. A Wish spell can’t return your soul to your body, but the spell reveals the location of the object that holds your soul. You draw no more cards."
    },
    {
     "typ": "liste",
     "titel": "Avatar of Death",
     "eintraege": [
      "Medium Undead, Neutral evil",
      "AC 20 Initiative +3 (13)",
      "HP Half the HP maximum of its summoner",
      "Speed 60 ft., Fly 60 ft. (hover) MOD SAVE MOD SAVE MOD SAVE",
      "Str 16 +3 +3 Dex 16 +3 +3 Con 16 +3 +3",
      "Int 16 +3 +3 WIS 16 +3 +3 Cha 16 +3 +3",
      "Immunities Necrotic, Poison; Charmed, Exhaustion, Frightened, Paralyzed, Petrified, Poisoned, Unconscious",
      "Senses Truesight 60 ft., Passive Perception 13",
      "Languages All languages known to its summoner",
      "CR None (XP 0; PB equals its summoner’s) Traits",
      "Incorporeal Movement. The avatar can move through other creatures and objects as if they were Difficult Terrain. It takes 5 (1d10) Force damage if it ends its turn inside an object. Actions",
      "Multiattack. The avatar makes a number of Reaping Scythe attacks equal to half the summoner’s Proficiency Bonus (rounded up).",
      "Reaping Scythe. Melee Attack Roll: Automatic hit, reach 5 ft. Hit: 7 (1d8 + 3) Slashing damage plus 4 (1d8) Necrotic damage."
     ]
    }
   ]
  }
 },
 {
  "id": "necklace-of-adaptation",
  "name": {
   "de": "Halskette der Anpassung",
   "en": "Necklace of Adaptation"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Halskette trägst, kannst du in jeder Umgebung normal atmen, und du bist bei Rettungswürfen zum Vermeiden oder Beenden des Zustands Vergiftet im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this necklace, you can breathe normally in any environment, and you have Advantage on saving throws made to avoid or end the Poisoned condition."
    }
   ]
  }
 },
 {
  "id": "necklace-of-fireballs",
  "name": {
   "de": "Halskette der Feuerbälle",
   "en": "Necklace of Fireballs"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An dieser Kette hängen 1W6+3 Perlen. Du kannst eine magische Aktion ausführen, um eine Perle abzunehmen und bis zu 18 Meter weit zu werfen. Am Ende ihrer Flugbahn explodiert die Perle wie beim Feuerball des 3. Grades (Rettungswurf‑SG 15). Du kannst auch mehrere Perlen oder sogar die ganze Kette auf einmal werfen. In diesem Fall wird der Schaden des Feuerballs für jede Perle nach der ersten um 1W6 erhöht (auf höchstens 12W6)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This necklace has 1d6 + 3 beads hanging from it. You can take a Magic action to detach a bead and throw it up to 60 feet away. When it reaches the end of its trajectory, the bead detonates as a level 3 Fireball (save DC 15). You can hurl multiple beads, or even the whole necklace, at one time. When you do so, increase the damage of the Fireball by 1d6 for each bead after the first (maximum 12d6)."
    }
   ]
  }
 },
 {
  "id": "necklace-of-prayer-beads",
  "name": {
   "de": "Halskette der Gebetsperlen",
   "en": "Necklace of Prayer Beads"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung durch einen Druiden, Kleriker oder Paladin)",
   "en": "Wondrous Item, Rare (Requires Attunement by a Cleric, Druid, or Paladin)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Halskette hat 1W4+2 magische Perlen aus Aquamarin, schwarzen Perlen oder Topas. Außerdem befinden sich auch nichtmagische Perlen aus Bernstein, Blutstein, Citrin, Jade, Koralle, Perle oder Quarz an der Kette. Wenn eine magische Perle von der Halskette entfernt wird, verliert die Perle ihre Magie. Es gibt sechs verschiedene magische Perlentypen. Der SL wählt die Art jeder Perle an der Halskette aus oder bestimmt sie zufällig, indem er anhand der Tabelle unten würfelt. Eine Halskette kann mehr als eine Perle desselben Typs haben. Um eine der Perlen zu verwenden, musst du die Halskette tragen. Jede Perle enthält einen Zauber, den du als Bonusaktion mit ihr wirken kannst (mit deinem Zauberrettungswurf‑SG, wenn ein Rettungswurf nötig ist). Wurde der Zauber einer magischen Perle gewirkt, so kann diese Perle erst ab dem nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W20",
      "Perle",
      "Zauber"
     ],
     "reihen": [
      [
       "1",
       "Perle der Beschwörung",
       "Hüter des Glaubens"
      ],
      [
       "2–5",
       "Perle der Gunst",
       "Vollständige Genesung"
      ],
      [
       "6–11",
       "Perle des Heilens",
       "Wunden heilen (Version des 2. Grades)"
      ],
      [
       "12–13",
       "Perle des Niederstreckens",
       "Strahlendes Niederstrecken"
      ],
      [
       "14–19",
       "Perle des Segens",
       "Segnen"
      ],
      [
       "20",
       "Perle des Windwandelns",
       "Windwandeln"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This necklace has 1d4 + 2 magic beads made from aquamarine, black pearl, or topaz. It also has many nonmagical beads made from stones such as amber, bloodstone, citrine, coral, jade, pearl, or quartz. If a magic bead is removed from the necklace, that bead loses its magic. Six types of magic beads exist. The GM decides the type of each bead on the necklace or determines it randomly by rolling on the table below. A necklace can have more than one bead of the same type. To use one, you must be wearing the necklace. Each bead contains a spell that you can cast from it as a Bonus Action (using your spell save DC if a save is necessary). Once a magic bead’s spell is cast, that bead can’t be used again until the next dawn."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d20",
      "Bead",
      "Spell"
     ],
     "reihen": [
      [
       "1–6",
       "Bead of Blessing",
       "Bless"
      ],
      [
       "7–12",
       "Bead of Curing",
       "Cure Wounds (level 2 version)"
      ],
      [
       "13–16",
       "Bead of Favor",
       "Greater Restoration"
      ],
      [
       "17–18",
       "Bead of Smiting",
       "Shining Smite"
      ],
      [
       "19",
       "Bead of Summons",
       "Guardian of Faith"
      ],
      [
       "20",
       "Bead of Wind Walking",
       "Wind Walk"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "nine-lives-stealer",
  "name": {
   "de": "Dieb der Neun Leben",
   "en": "Nine Lives Stealer"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige einfache Waffe oder Kriegswaffe), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Any Simple or Martial), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +2 auf Angriffs ‑ und Schadenswürfe mit dieser magischen Waffe."
    },
    {
     "typ": "punkt",
     "text": "Lebensentzug: Die Waffe hat 1W8+1 Ladungen. Wenn du mit ihr eine Kreatur angreifst, die weniger als 100 Trefferpunkte hat, und beim Angriffswurf eine 20 würfelst, muss die Kreatur einen SG‑15‑Konstitutionsrettungswurf bestehen, oder sie stirbt sofort, da das Schwert ihr die Lebenskraft entreißt. Konstrukte und Untote bestehen den Rettungswurf automatisch. Wenn die Kreatur getötet wird, verliert die Waffe eine Ladung. Hat sie keine Ladungen mehr, so verliert sie diese Eigenschaft."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +2 bonus to attack rolls and damage rolls made with this magic weapon."
    },
    {
     "typ": "punkt",
     "text": "Life Stealing. The weapon has 1d8 + 1 charges. When you attack a creature that has fewer than 100 Hit Points with this weapon and roll a 20 on the d20 for the attack roll, the creature must succeed on a DC 15 Constitution saving throw or be slain instantly as the sword tears its life force from its body. Constructs and Undead succeed on the save automatically. The weapon loses 1 charge if the creature is slain. When the weapon has no charges remaining, it loses this property."
    }
   ]
  }
 },
 {
  "id": "oathbow",
  "name": {
   "de": "Schwurbogen",
   "en": "Oathbow"
  },
  "kopfzeile": {
   "de": "Waffe (Kurzbogen oder Langbogen), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Longbow or Shortbow), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du einen Pfeil in diesen Bogen einlegst, flüstert dieser auf Elfisch: „Meinen Gegnern einen raschen Tod!“ Verwendest du diese Waffe, um einen Fernkampfangriff auszuführen, so kannst du die folgenden Befehlswörter aussprechen oder singen: „Einen raschen Tod Euch, die Ihr mir Unrecht tatet.“ Das Ziel deines Angriffs wird bis zum Morgengrauen sieben Tage später – oder bis es stirbt – zu deinem Erzfeind. Du kannst nur einen solchen Erzfeind gleichzeitig haben. Stirbt dein Erzfeind, so kannst du erst ab dem nächsten Morgengrauen einen neuen wählen. Wenn du mit dieser Waffe einen Fernkampfangriff gegen deinen Erzfeind ausführst, bist du beim Wurf im Vorteil. Außerdem kann dein Ziel weder von Teildeckung noch von Dreivierteldeckung profitieren, und du bist auf Maximalreichweite nicht im Nachteil. Wenn der Angriff trifft, erleidet dein Erzfeind zusätzlich 3W6 Stichschaden. Solange dein Erzfeind lebt, bist du bei Angriffswürfen mit allen anderen Waffen im Nachteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you nock an arrow on this bow, it whispers in Elvish, “Swift defeat to my enemies.” When you use this weapon to make a ranged attack, you can utter or sign the following command words: “Swift death to you who have wronged me.” The target of your attack becomes your sworn enemy until it dies or until dawn 7 days later. You can have only one such sworn enemy at a time. When your sworn enemy dies, you can choose a new one after the next dawn. When you make a ranged attack roll with this weapon against your sworn enemy, you have Advantage on the roll. In addition, your target gains no benefit from Half Cover or Three-Quarters Cover, and you suffer no Disadvantage due to long range. If the attack hits, your sworn enemy takes an extra 3d6 Piercing damage. While your sworn enemy lives, you have Disadvantage on attack rolls with all other weapons."
    }
   ]
  }
 },
 {
  "id": "oil-of-etherealness",
  "name": {
   "de": "Öl der Körperlosigkeit",
   "en": "Oil of Etherealness"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit einer Phiole dieses Öls lässt sich eine Kreatur von höchstens mittelgroßer Größe samt Ausrüstung bedecken (bei größeren Kreaturen ist eine zusätzliche Phiole erforderlich). Das Auftragen des Öls dauert zehn Minuten. Die betroffene Kreatur erhält dann eine Stunde lang den Effekt des Zaubers Körperlosigkeit. An der Außenseite des Behälters bilden sich Tropfen dieses trübgrauen Öls, die sich schnell verflüchtigen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One vial of this oil can cover one Medium or smaller creature, along with the equipment it’s wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Etherealness spell for 1 hour. Beads of this cloudy, gray oil form on the outside of its container and quickly evaporate."
    }
   ]
  }
 },
 {
  "id": "oil-of-sharpness",
  "name": {
   "de": "Öl der Schärfe",
   "en": "Oil of Sharpness"
  },
  "kopfzeile": {
   "de": "Trank, sehr selten",
   "en": "Potion, Very Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit einer Phiole dieses Öls kann man eine Nahkampfwaffe oder zwanzig Geschosse überziehen (jedoch nur Geschosse und Nahkampfwaffen, die nichtmagisch sind und Hieb ‑ oder Stichschaden bewirken). Das Auftragen des Öls dauert eine Minute. Dann dringt das Öl auf magische Art ein und macht die Waffe zu einer Waffe +3 oder die Geschosse zu Geschossen +3. In diesem klaren, geleeartigen Öl glitzern winzige, extrem dünne Silbersplitter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One vial of this oil can coat one Melee weapon or twenty pieces of ammunition, but only ammunition and Melee weapons that are nonmagical and deal Slashing or Piercing damage are affected. Applying the oil takes 1 minute, after which the oil magically seeps into whatever it coats, turning the coated weapon into a +3 Weapon or the coated ammunition into +3 Ammunition. This clear, gelatinous oil sparkles with tiny, ultrathin silver shards."
    }
   ]
  }
 },
 {
  "id": "oil-of-slipperiness",
  "name": {
   "de": "Öl der Glätte",
   "en": "Oil of Slipperiness"
  },
  "kopfzeile": {
   "de": "Trank, ungewöhnlich",
   "en": "Potion, Uncommon"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Mit einer Phiole dieses Öls lässt sich eine Kreatur von höchstens mittelgroßer Größe samt Ausrüstung bedecken (bei größeren Kreaturen ist eine zusätzliche Phiole erforderlich). Das Auftragen des Öls dauert zehn Minuten. Die vom Öl bedeckte Kreatur erhält dann acht Stunden lang den Effekt des Zaubers Bewegungsfreiheit. Alternativ kann das Öl als magische Aktion auf den Boden gegossen werden, wo es ein Quadrat mit drei Metern Kantenlänge bedeckt. In diesem Bereich erzeugt es acht Stunden lang den Effekt des Zaubers Schmieren. Diese schwarze klebrige Salbe wirkt im Gefäß sehr schwer und zäh, verteilt sich aber rasch, wenn sie ausgegossen wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One vial of this oil can cover one Medium or smaller creature, along with the equipment it’s wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Freedom of Movement spell for 8 hours. Alternatively, the oil can be poured on the ground as a Magic action, where it covers a 10-foot square, duplicating the effect of the Grease spell in that area for 8 hours. This sticky, black unguent is thick and heavy, but it flows quickly when poured."
    }
   ]
  }
 },
 {
  "id": "pearl-of-power",
  "name": {
   "de": "Perle der Macht",
   "en": "Pearl of Power"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung durch einen Zauberwirker)",
   "en": "Wondrous Item, Uncommon (Requires Attunement by a Spellcaster)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Perle mit dir führst, kannst du eine magische Aktion ausführen, um einen verbrauchten Zauberplatz des höchstens 3. Grades zurückzuerhalten. Wurde die Perle verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While this pearl is on your person, you can take a Magic action to regain one expended spell slot of level 3 or lower. Once you use the pearl, it can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "periapt-of-health",
  "name": {
   "de": "Anhänger der Gesundheit",
   "en": "Periapt of Health"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Anhänger trägst, kannst du eine magische Aktion ausführen, um 2W4+2 Trefferpunkte zurückzuerhalten. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden. Außerdem bist du bei Rettungswürfen zum Vermeiden oder Beenden des Zustands Vergiftet im Vorteil, solange du diesen Anhänger trägst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this pendant, you can take a Magic action to regain 2d4 + 2 Hit Points. Once used, this property can’t be used again until the next dawn. In addition, you have Advantage on saving throws to avoid or end the Poisoned condition while you wear this pendant."
    }
   ]
  }
 },
 {
  "id": "periapt-of-proof-against-poison",
  "name": {
   "de": "Anhänger des Giftschutzes",
   "en": "Periapt of Proof against Poison"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An dieser feinen Silberkette hängt ein schwarzer Edelsteinanhänger im Brillantschliff. Solange du ihn trägst, bist du gegen den Zustand Vergiftet sowie gegen Giftschaden immun."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This delicate silver chain has a brilliant-cut black gem pendant. While you wear it, you have Immunity to the Poisoned condition and Poison damage."
    }
   ]
  }
 },
 {
  "id": "periapt-of-wound-closure",
  "name": {
   "de": "Anhänger der Wundheilung",
   "en": "Periapt of Wound Closure"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Anhänger trägst, erhältst du die folgenden Vorzüge:"
    },
    {
     "typ": "punkt",
     "text": "Lebenserhaltung: Wann immer du einen Todesrettungswurf ausführst, kannst du ein Ergebnis von höchstens 9 in eine 10 verwandeln und einen misslungenen Wurf zu einem erfolgreichen machen."
    },
    {
     "typ": "punkt",
     "text": "Natürlicher Heilungsschub: Wann immer du mit einem Trefferpunktewürfel würfelst, um Trefferpunkte zurückzuerhalten, verdoppelst du die Anzahl von Trefferpunkten, die er wiederherstellt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this pendant, you gain the following benefits."
    },
    {
     "typ": "punkt",
     "text": "Life Preservation. Whenever you make a Death Saving Throw, you can change a roll of 9 or lower to a 10, turning a failed save into a successful one."
    },
    {
     "typ": "punkt",
     "text": "Natural Healing Boost. Whenever you roll a Hit Point Die to regain Hit Points, double the number of Hit Points it restores."
    }
   ]
  }
 },
 {
  "id": "philter-of-love",
  "name": {
   "de": "Liebestrank",
   "en": "Philter of Love"
  },
  "kopfzeile": {
   "de": "Trank, ungewöhnlich",
   "en": "Potion, Uncommon"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, bist du von der nächsten Kreatur, die du innerhalb von zehn Minuten nach dem Trinken siehst, eine Stunde lang bezaubert. Die rosafarbene sprudelnde Flüssigkeit enthält eine Blase in Herzform, die leicht übersehen wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The next time you see a creature within 10 minutes after drinking this philter, you are charmed by that creature and have the Charmed condition for 1 hour. This rose-hued, effervescent liquid contains one easy-to-miss bubble shaped like a heart."
    }
   ]
  }
 },
 {
  "id": "pipes-of-haunting",
  "name": {
   "de": "Flöte des Unheimlichen",
   "en": "Pipes of Haunting"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Flöte hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Du kannst eine magische Aktion ausführen und eine Ladung verbrauchen, um ihr eine unheimliche, fesselnde Melodie zu entlocken. Jede Kreatur deiner Wahl im Abstand von bis zu neun Metern von dir muss einen SG‑15‑Weisheitsrettungswurf bestehen, oder sie ist eine Minute lang verängstigt. Eine Kreatur, deren Rettungswurf misslingt, wiederholt ihn am Ende jedes ihrer Züge. Bei einem Erfolg endet der Effekt bei ihr. Wenn der eine Kreatur ihren Rettungswurf besteht, ist sie 24 Stunden lang gegen den Effekt der Flöte immun."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These pipes have 3 charges and regain 1d3 expended charges daily at dawn. You can take a Magic action to play them and expend 1 charge to create an eerie, spellbinding tune. Each creature of your choice within 30 feet of you must succeed on a DC 15 Wisdom saving throw or have the Frightened condition for 1 minute. A creature that fails the save repeats it at the end of each of its turns, ending the effect on itself on a success. A creature that succeeds on its save is immune to the effect of these pipes for 24 hours."
    }
   ]
  }
 },
 {
  "id": "pipes-of-the-sewers",
  "name": {
   "de": "Flöte des Rattenfängers",
   "en": "Pipes of the Sewers"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn diese Flöte sind mit dir führst, sind gewöhnliche Ratten und Riesenratten dir gegenüber gleichgültig und greifen dich nicht an, sofern du sie nicht bedrohst oder ihnen Schaden zufügst. Die Flöte hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du die Flöte als magische Aktion spielst, kannst du mit einer Bonusaktion eine bis drei Ladungen verbrauchen. Mit jeder davon kannst du einen Rattenschwarm herbeirufen, sofern sich im Abstand von bis zu 800 Metern von dir genügend Ratten befinden (dies wird vom SL bestimmt). Sind nicht genügend Ratten für einen Schwarm vorhanden, so ist die Ladung vergeudet. Herbeigerufene Schwärme bewegen sich so direkt wie möglich auf die Musik zu, stehen jedoch ansonsten nicht unter deiner Kontrolle. Wann immer ein Rattenschwarm, der nicht unter der Kontrolle einer anderen Kreatur steht, sich dir auf bis zu neun Meter nähert, während du die Flöte spielst, führt der Schwarm einen SG‑15‑Weisheitsrettungswurf aus. Bei einem erfolgreichen Rettungswurf verhält der Schwarm sich normal und kann in den nächsten 24 Stunden nicht von der Musik der Flöte beeinflusst werden. Misslingt der Wurf, so wird der Schwarm von der Musik beeinflusst. Er ist dir und deinen Verbündeten gegenüber freundlich gesinnt, solange du in jeder Runde als magische Aktion auf der Flöte spielst. Ein freundlich gesinnter Schwarm gehorcht deinen Befehlen. Wenn du einem freundlich gesinnten Schwarm keine Befehle erteilst, verteidigt er sich, führt aber ansonsten keine Aktionen aus. Wenn ein freundlich gesinnter Schwarm seinen Zug mehr als neun Meter entfernt von dir beginnt, endet deine Kontrolle über ihn. Er verhält sich dann normal und kann die nächsten 24 Stunden lang nicht von der Musik der Flöte beeinflusst werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While these pipes are on your person, ordinary rats and giant rats are Indifferent toward you and won’t attack you unless you threaten or harm them. The pipes have 3 charges and regain 1d3 expended charges daily at dawn. If you play the pipes as a Magic action, you can take a Bonus Action to expend 1 to 3 charges, calling forth one Swarm of Rats with each expended charge if enough rats are within half a mile of you to be called in this fashion (as determined by the GM). If there aren’t enough rats to form a swarm, the charge is wasted. Called swarms move toward the music by the shortest available route but aren’t under your control otherwise. Whenever a Swarm of Rats that isn’t under another creature’s control comes within 30 feet of you while you are playing the pipes, the swarm makes a DC 15 Wisdom saving throw. On a successful save, the swarm behaves as it normally would and can’t be swayed by the pipes’ music for the next 24 hours. On a failed save, the swarm is swayed by the pipes’ music and becomes Friendly to you and your allies for as long as you continue to play the pipes each round as a Magic action. A Friendly swarm obeys your commands. If you issue no commands to a Friendly swarm, it defends itself but otherwise takes no actions. If a Friendly swarm starts its turn more than 30 feet away from you, your control over that swarm ends, and the swarm behaves as it normally would and can’t be swayed by the pipes’ music for the next 24 hours."
    }
   ]
  }
 },
 {
  "id": "plate-armor-of-etherealness",
  "name": {
   "de": "Ritterrüstung der Körperlosigkeit",
   "en": "Plate Armor of Etherealness"
  },
  "kopfzeile": {
   "de": "Rüstung (Plattenpanzer oder Ritterrüstung), legendär (erfordert Einstimmung)",
   "en": "Armor (Half Plate Armor or Plate Armor), Legendary (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese Rüstung trägst, kannst du eine magische Aktion ausführen und ein Befehlswort aussprechen, um den Effekt des Zaubers Körperlosigkeit zu erhalten. The Zauber endet sofort, wenn du die Rüstung ablegst oder eine magische Aktion ausführst, um das Befehlswort zu wiederholen. Diese Eigenschaft der Rüstung kann erst ab dem nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you’re wearing this armor, you can take a Magic action and use a command word to gain the effect of the Etherealness spell. The spell ends immediately if you remove the armor or take a Magic action to repeat the command word. This property of the armor can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "portable-hole",
  "name": {
   "de": "Tragbares Loch",
   "en": "Portable Hole"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses feine schwarze Tuch ist seidenweich und auf die Größe eines Taschentuchs zusammengefaltet. Ausgebreitet ist es ein kreisrund und hat einen Durchmesser von 1,8 Metern. Du kannst eine magische Aktion ausführen, um das Tragbare Loch zu entfalten und auf oder an einer festen Oberfläche zu platzieren. Daraufhin erzeugt das Tragbare Loch ein drei Meter tiefes extradimensionales Loch. Der zylindrische Raum im Inneren des Lochs befindet sich auf einer anderen Existenzebene. Das Loch kann also nicht dazu verwendet werden, Durchgänge zu öffnen. Eine Kreatur innerhalb eines offenen Tragbaren Lochs kann dieses verlassen, indem sie hinausklettert. Du kannst eine magische Aktion ausführen und ein Tragbares Loch schließen, indem du das Tuch an den Rändern greifst und zusammenfaltest. Wenn der Stoff gefaltet wird, schließt sich das Loch, und Kreaturen oder Gegenstände darin bleiben im extradimensionalen Raum. Das Loch wiegt unabhängig von seinem Inhalt praktisch nichts. Wenn das Loch zusammengefaltet ist, kann eine Kreatur im Inneren des extradimensionalen Raums als Aktion einen SG‑10‑Stärkewurf (Athletik) ausführen. Bei einem Erfolg verlässt die Kreatur das Tragbare Loch und erscheint im Abstand von bis zu 1,5 Metern außerhalb davon. Ein geschlossenes Tragbares Loch enthält genug Atemluft für eine Stunde (geteilt durch die Anzahl atmender Kreaturen darin). Wenn ein Tragbares Loch in den extradimensionalen Raum eines Nimmervollen Beutels, eines Praktischen Rucksacks oder eines ähnlichen Gegenstands gelangt, zerstört dies sofort beide Gegenstände, und ein Tor in die Astralebene öffnet sich. Das Tor erscheint dort, wo der eine Gegenstand in den anderen gelangt ist. Alle Kreaturen, die sich im Abstand von bis zu drei Metern vom Tor befinden und nicht über vollständige Deckung verfügen, werden hineingezogen und an einen zufälligen Ort auf der Astralebene transportiert. Dann schließt sich das Tor. Das Tor funktioniert nur in eine Richtung und kann nicht wieder geöffnet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This fine black cloth, soft as silk, is folded up to the dimensions of a handkerchief. It unfolds into a circular sheet 6 feet in diameter. You can take a Magic action to unfold a Portable Hole and place it on or against a solid surface, whereupon the Portable Hole creates an extradimensional hole 10 feet deep. The cylindrical space within the hole exists on a different plane of existence, so it can’t be used to create open passages. Any creature inside an open Portable Hole can exit the hole by climbing out of it. You can take a Magic action to close a Portable Hole by taking hold of the edges of the cloth and folding it up. Folding the cloth closes the hole, and any creatures or objects within remain in the extradimensional space. No matter what’s in it, the hole weighs next to nothing. If the hole is folded up, a creature within the hole’s extradimensional space can take an action to make a DC 10 Strength (Athletics) check. On a successful check, the creature forces its way out and appears within 5 feet of the Portable Hole. A closed Portable Hole holds enough air for 1 hour of breathing, divided by the number of breathing creatures inside. Placing a Portable Hole inside an extradimensional space created by a Bag of Holding, Handy Haversack, or similar item instantly destroys both items and opens a gate to the Astral Plane. The gate originates where the one item was placed inside the other. Any creature within 10 feet of the gate and not behind Total Cover is sucked through it and deposited in a random location on the Astral Plane. The gate then closes. The gate is one-way only and can’t be reopened."
    }
   ]
  }
 },
 {
  "id": "potion-of-animal-friendship",
  "name": {
   "de": "Trank der Tierfreundschaft",
   "en": "Potion of Animal Friendship"
  },
  "kopfzeile": {
   "de": "Trank, ungewöhnlich",
   "en": "Potion, Uncommon"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, kannst du den Zauber Tierfreundschaft (Rettungswurf‑SG 13) des 3. Grades wirken. Wird dieser schlammfarbene Trank geschüttelt, so werden kleine Stücke sichtbar: eine Fischschuppe, eine Kolibrifeder, eine Katzenkralle oder ein Eichhörnchenhaar."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you can cast the level 3 version of the Animal Friendship spell (save DC 13). Agitating this potion’s muddy liquid brings little bits into view: a fish scale, a hummingbird feather, a cat claw, or a squirrel hair."
    }
   ]
  }
 },
 {
  "id": "potion-of-clairvoyance",
  "name": {
   "de": "Trank des Hellsehens",
   "en": "Potion of Clairvoyance"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du den Effekt des Zaubers Hellsehen (keine Konzentration erforderlich). In diesem gelblichen Trank schwimmt ein Augapfel. Er verschwindet jedoch, sobald der Trank geöffnet wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain the effect of the Clairvoyance spell (no Concentration required). An eyeball bobs in this potion’s yellowish liquid but vanishes when the potion is opened."
    }
   ]
  }
 },
 {
  "id": "potion-of-climbing",
  "name": {
   "de": "Trank des Kletterns",
   "en": "Potion of Climbing"
  },
  "kopfzeile": {
   "de": "Trank, gewöhnlich",
   "en": "Potion, Common"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "common"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du eine Stunde lang eine Kletterbewegungsrate in Höhe deiner Bewegungsrate. Während dieser Zeit bist du bei Stärkewürfen (Athletik) im Vorteil, die du zum Klettern ausführst. Dieser Trank weist braune, silberne und graue Schichten auf und sieht wie mehrere Schichten von Stein aus. Die Schichten vermischen sich nicht, wenn der Trank geschüttelt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain a Climb Speed equal to your Speed for 1 hour. During this time, you have Advantage on Strength (Athletics) checks to climb. This potion is separated into brown, silver, and gray layers resembling bands of stone. Shaking the bottle fails to mix the colors."
    }
   ]
  }
 },
 {
  "id": "potion-of-diminution",
  "name": {
   "de": "Trank der Verkleinerung",
   "en": "Potion of Diminution"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du 1W4 Stunden lang den Verkleinern‑Effekt des Zaubers Vergrößern/Verkleinern (keine Konzentration erforderlich). Das rote Zentrum dieses Tranks zieht sich zu einem winzigen Kern zusammen und dehnt sich dann wieder aus, bis die gesamte sonst klare Flüssigkeit rot wird. Das Pulsieren wird nicht unterbrochen, wenn der Trank geschüttelt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain the “reduce” effect of the Enlarge/Reduce spell for 1d4 hours (no Concentration required). The red in the potion’s liquid continuously contracts to a tiny bead and then expands to color the clear liquid around it. Shaking the bottle fails to interrupt this process."
    }
   ]
  }
 },
 {
  "id": "potion-of-flying",
  "name": {
   "de": "Trank des Fliegens",
   "en": "Potion of Flying"
  },
  "kopfzeile": {
   "de": "Trank, sehr selten",
   "en": "Potion, Very Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du eine Stunde lang eine Flugbewegungsrate in Höhe von deiner Bewegungsrate und kannst schweben. Wenn du bei Ende der Wirkung noch in der Luft bist, fällst du zu Boden, sofern du keine anderen Möglichkeiten hast, zu fliegen oder zu schweben. Die klare Flüssigkeit dieses Tranks schwebt im oberen Teil seines Gefäßes. Wolkige weiße Unreinheiten treiben darin."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain a Fly Speed equal to your Speed for 1 hour and can hover. If you’re in the air when the potion wears off, you fall unless you have some other means of staying aloft. This potion’s clear liquid floats at the top of its container and has cloudy white impurities drifting in it."
    }
   ]
  }
 },
 {
  "id": "potion-of-gaseous-form",
  "name": {
   "de": "Trank der Gasförmigen Gestalt",
   "en": "Potion of Gaseous Form"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du den Effekt des Zaubers Gasförmige Gestalt (keine Konzentration erforderlich), bis eine Stunde vergangen ist oder du den Effekt als Bonusaktion beendest. Der Behälter dieses Tranks scheint mit einem Nebel gefüllt zu sein, der sich wie Wasser ausgießen lässt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain the effect of the Gaseous Form spell for 1 hour (no Concentration required) or until you end the effect as a Bonus Action. This potion’s container seems to hold fog that moves and pours like water."
    }
   ]
  }
 },
 {
  "id": "potion-of-giant-strength",
  "name": {
   "de": "Trank der Riesenstärke",
   "en": "Potion of Giant Strength"
  },
  "kopfzeile": {
   "de": "Trank, Seltenheit variiert",
   "en": "Potion, Rarity Varies"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "varies"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, ist dein Stärkewert eine Stunde lang verändert. Der Wert hängt von der Riesenart ab (siehe Tabelle unten). Der Trank hat keinen Effekt, wenn deine Stärke bereits gleich oder größer als dieser Wert ist. In dieser durchsichtigen Flüssigkeit treibt ein Lichtsplitter, der an den Fingernagel eines Riesen erinnert."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Trank",
      "Stä.",
      "Seltenheit"
     ],
     "reihen": [
      [
       "Trank der Riesenstärke (Hügel)",
       "21",
       "Ungewöhnlich"
      ],
      [
       "Trank der Riesenstärke (Frost oder Stein)",
       "23",
       "Selten"
      ],
      [
       "Trank der Riesenstärke (Feuer)",
       "25",
       "Selten"
      ],
      [
       "Trank der Riesenstärke (Wolken)",
       "27",
       "Sehr selten"
      ],
      [
       "Trank der Riesenstärke (Sturm)",
       "29",
       "Legendär"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, your Strength score changes for 1 hour. The type of giant determines the score (see the table below). The potion has no effect on you if your Strength is equal to or greater than that score. This potion’s transparent liquid has floating in it a sliver of light resembling a giant’s fingernail."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Potion",
      "Str.",
      "Rarity"
     ],
     "reihen": [
      [
       "Potion of Giant Strength (hill)",
       "21",
       "Uncommon"
      ],
      [
       "Potion of Giant Strength (frost or stone)",
       "23",
       "Rare"
      ],
      [
       "Potion of Giant Strength (fire)",
       "25",
       "Rare"
      ],
      [
       "Potion of Giant Strength (cloud)",
       "27",
       "Very Rare"
      ],
      [
       "Potion of Giant Strength (storm)",
       "29",
       "Legendary"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "potion-of-growth",
  "name": {
   "de": "Trank des Wachstums",
   "en": "Potion of Growth"
  },
  "kopfzeile": {
   "de": "Trank, ungewöhnlich",
   "en": "Potion, Uncommon"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du zehn Minuten lang den Vergrößern‑Effekt des Zaubers Vergrößern/Verkleinern (keine Konzentration erforderlich). Das winzige rote Zentrum dieses Tranks expandiert, bis die gesamte sonst klare Flüssigkeit rot wird, und zieht sich dann wieder zusammen. Das Pulsieren wird nicht unterbrochen, wenn der Trank geschüttelt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain the “enlarge” effect of the Enlarge/Reduce spell for 10 minutes (no Concentration required). The red in the potion’s liquid continuously expands from a tiny bead to color the clear liquid around it and then contracts. Shaking the bottle fails to interrupt this process."
    }
   ]
  }
 },
 {
  "id": "potion-of-heroism",
  "name": {
   "de": "Trank des Heldenmuts",
   "en": "Potion of Heroism"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du eine Stunde lang 10 temporäre Trefferpunkte. Für dieselbe Dauer wirkt der Effekt des Zaubers Segnen auf dich (keine Konzentration erforderlich). Die blaue Flüssigkeit brodelt und dampft, als würde sie kochen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain 10 Temporary Hit Points that last for 1 hour. For the same duration, you are under the effect of the Bless spell (no Concentration required). This potion’s blue liquid bubbles and steams as if boiling."
    }
   ]
  }
 },
 {
  "id": "potion-of-invisibility",
  "name": {
   "de": "Trank der Unsichtbarkeit",
   "en": "Potion of Invisibility"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Der Behälter für diesen Trank sieht leer aus, fühlt sich aber an, als wäre Flüssigkeit darin. Wenn du diesen Trank zu dir nimmst, bist du eine Stunde lang unsichtbar. Der Effekt endet vorzeitig, wenn du einen Angriffswurf ausführst, Schaden bewirkst oder einen Zauber wirkst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This potion’s container looks empty but feels as though it holds liquid. When you drink the potion, you have the Invisible condition for 1 hour. The effect ends early if you make an attack roll, deal damage, or cast a spell."
    }
   ]
  }
 },
 {
  "id": "potion-of-invulnerability",
  "name": {
   "de": "Trank der Unverwundbarkeit",
   "en": "Potion of Invulnerability"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank trinkst, bist du eine Minute lang gegen alle Schadensarten resistent. Diese sirupartige Flüssigkeit sieht wie flüssiges Eisen aus."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For 1 minute after you drink this potion, you have Resistance to all damage. This potion’s syrupy liquid looks like liquefied iron."
    }
   ]
  }
 },
 {
  "id": "potion-of-longevity",
  "name": {
   "de": "Trank der Langlebigkeit",
   "en": "Potion of Longevity"
  },
  "kopfzeile": {
   "de": "Trank, sehr selten",
   "en": "Potion, Very Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, wird dein physisches Alter um 1W6+6 Jahre verringert (Minimum: 13 Jahre). Wann immer du anschließend einen weiteren Trank der Langlebigkeit zu dir nimmst, besteht ein kumulatives Risiko von zehn Prozent, dass du stattdessen um 1W6+6 Jahre alterst. In dieser bernsteinfarbenen Flüssigkeit treibt ein winziges Herz, das unwahrscheinlicherweise schlägt. Diese Zutat verschwindet, wenn der Trank geöffnet wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you subsequently drink a Potion of Longevity, there is 10 percent cumulative chance that you instead age by 1d6 + 6 years. Suspended in this amber liquid is a tiny heart that, against all reason, is still beating. These ingredients vanish when the potion is opened."
    }
   ]
  }
 },
 {
  "id": "potion-of-mind-reading",
  "name": {
   "de": "Trank des Gedankenlesens",
   "en": "Potion of Mind Reading"
  },
  "kopfzeile": {
   "de": "Trank, selten",
   "en": "Potion, Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du zehn Minuten lang den Effekt des Zaubers Gedanken wahrnehmen (Rettungswurf‑SG 13, keine Konzentration erforderlich). In dieser zähen violetten Flüssigkeit treibt eine ovale rosafarbene Wolke."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain the effect of the Detect Thoughts spell (save DC 13) for 10 minutes (no Concentration required). This potion’s dense, purple liquid has an ovoid cloud of pink floating in it."
    }
   ]
  }
 },
 {
  "id": "potion-of-poison",
  "name": {
   "de": "Trank des Gifts",
   "en": "Potion of Poison"
  },
  "kopfzeile": {
   "de": "Trank, ungewöhnlich",
   "en": "Potion, Uncommon"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses Gebräu riecht, schmeckt und sieht wie ein Heiltrank oder ein anderer vorteilhafter Trank aus. Allerdings ist es ein durch Illusionsmagie getarntes Gift. Der Zauber Identifizieren offenbart die wahre Natur des Tranks. Wenn du diesen Trank zu dir nimmst, erleidest du 4W6 Giftschaden und musst einen SG‑13‑Konstitutionsrettungswurf bestehen, oder du bist eine Stunde lang vergiftet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This concoction looks, smells, and tastes like a Potion of Healing or another beneficial potion. However, it is actually poison masked by illusion magic. Identify reveals its true nature. If you drink this potion, you take 4d6 Poison damage and must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 hour."
    }
   ]
  }
 },
 {
  "id": "potion-of-resistance",
  "name": {
   "de": "Trank der Resistenz",
   "en": "Potion of Resistance"
  },
  "kopfzeile": {
   "de": "Trank, ungewöhnlich",
   "en": "Potion, Uncommon"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, bist du eine Stunde lang gegen eine Schadensart resistent. Der SL wählt die Schadensart aus oder bestimmt sie zufällig, indem er anhand der folgenden Tabelle würfelt:"
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W10",
      "Schadensart"
     ],
     "reihen": [
      [
       "1",
       "Blitz"
      ],
      [
       "2",
       "Energie"
      ],
      [
       "3",
       "Feuer"
      ],
      [
       "4",
       "Gift"
      ],
      [
       "5",
       "Gleißend"
      ],
      [
       "6",
       "Kälte"
      ],
      [
       "7",
       "Nekrotisch"
      ],
      [
       "8",
       "Psychisch"
      ],
      [
       "9",
       "Säure"
      ],
      [
       "10",
       "Schall"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you have Resistance to one type of damage for 1 hour. The GM chooses the type or determines it randomly by rolling on the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d10",
      "Damage Type"
     ],
     "reihen": [
      [
       "1",
       "Acid"
      ],
      [
       "2",
       "Cold"
      ],
      [
       "3",
       "Fire"
      ],
      [
       "4",
       "Force"
      ],
      [
       "5",
       "Lightning"
      ],
      [
       "6",
       "Necrotic"
      ],
      [
       "7",
       "Poison"
      ],
      [
       "8",
       "Psychic"
      ],
      [
       "9",
       "Radiant"
      ],
      [
       "10",
       "Thunder"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "potion-of-speed",
  "name": {
   "de": "Trank der Geschwindigkeit",
   "en": "Potion of Speed"
  },
  "kopfzeile": {
   "de": "Trank, sehr selten",
   "en": "Potion, Very Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du eine Minute lang den Effekt des Zaubers Hast (keine Konzentration erforderlich), ohne die Welle der Lethargie zu erleiden, die nach Abklingen des Effekts üblicherweise auftritt. In dieser gelben Flüssigkeit wirbeln schwarze Streifen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, you gain the effect of the Haste spell for 1 minute (no Concentration required) without suffering the wave of lethargy that typically occurs when the effect ends. This potion’s yellow fluid is streaked with black and swirls on its own."
    }
   ]
  }
 },
 {
  "id": "potion-of-vitality",
  "name": {
   "de": "Trank der Vitalität",
   "en": "Potion of Vitality"
  },
  "kopfzeile": {
   "de": "Trank, sehr selten",
   "en": "Potion, Very Rare"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, werden alle Erschöpfungsstufen entfernt, die du hast, und der Zustand Vergiftet endet. In den nächsten 24 Stunden erhältst du für jeden Trefferpunktewürfel, den du verbrauchst, die höchstmögliche Anzahl von Trefferpunkten zurück. In dieser karminroten Flüssigkeit pulsiert ein schwaches Licht wie ein Herzschlag."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you drink this potion, it removes any Exhaustion levels you have and ends the Poisoned condition on you. For the next 24 hours, you regain the maximum number of Hit Points for any Hit Point Die you spend. This potion’s crimson liquid regularly pulses with dull light, calling to mind a heartbeat."
    }
   ]
  }
 },
 {
  "id": "potion-of-water-breathing",
  "name": {
   "de": "Trank der Wasseratmung",
   "en": "Potion of Water Breathing"
  },
  "kopfzeile": {
   "de": "Trank, ungewöhnlich",
   "en": "Potion, Uncommon"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, kannst du 24 Stunden lang unter Wasser atmen. Diese wolkige grüne Flüssigkeit riecht nach Meer, und es treibt eine quallenförmige Blase darin."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can breathe underwater for 24 hours after drinking this potion. This potion’s cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it."
    }
   ]
  }
 },
 {
  "id": "potions-of-healing",
  "name": {
   "de": "Heiltränke",
   "en": "Potions of Healing"
  },
  "kopfzeile": {
   "de": "Trank, Seltenheit variiert",
   "en": "Potion, Rarity Varies"
  },
  "kategorie": "trank",
  "seltenheiten": [
   "varies"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Trank zu dir nimmst, erhältst du Trefferpunkte zurück. Die Anzahl der wiederhergestellten Trefferpunkte hängt von der Seltenheit des Tranks ab, wie in der nachstehenden Tabelle aufgeführt. Unabhängig von ihrer Stärke bestehen Heiltränke aus roter Flüssigkeit, die schimmert, wenn sie bewegt wird."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Trank",
      "Zurückerhaltene TP",
      "Seltenheit"
     ],
     "reihen": [
      [
       "Heiltrank",
       "2W4+2",
       "Gewöhnlich"
      ],
      [
       "Trank der Mächtigen Heilung",
       "4W4+4",
       "Ungewöhnlich"
      ],
      [
       "Trank der Überlegenen Heilung",
       "8W4+8",
       "Selten"
      ],
      [
       "Trank der Höchsten Heilung",
       "10W4+20",
       "Sehr selten"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You regain Hit Points when you drink this potion. The number of Hit Points depends on the potion’s rarity, as shown in the table below. Whatever its potency, the potion’s red liquid glimmers when agitated."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Potion",
      "HP Regained",
      "Rarity"
     ],
     "reihen": [
      [
       "Potion of Healing",
       "2d4 + 2",
       "Common"
      ],
      [
       "Potion of Healing (greater)",
       "4d4 + 4",
       "Uncommon"
      ],
      [
       "Potion of Healing (superior)",
       "8d4 + 8",
       "Rare"
      ],
      [
       "Potion of Healing (supreme)",
       "10d4 + 20",
       "Very Rare"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "quarterstaff-of-the-acrobat",
  "name": {
   "de": "Kampfstab des Akrobaten",
   "en": "Quarterstaff of the Acrobat"
  },
  "kopfzeile": {
   "de": "Waffe (Kampfstab), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Quarterstaff), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du hast einen Bonus von +2 auf Angriffs ‑ und Schadenswürfe mit dieser magischen Waffe. Wenn du die Waffe hältst, kannst du sie entweder als Bonusaktion oder nach deinem Initiativewurf in einem Radius von bis zu drei Metern grünes Licht spenden lassen, oder du kannst das Licht als Bonusaktion löschen. Du kannst außerdem eine Bonusaktion ausführen, um die Form der Waffe zu verändern: Du kannst sie zu einem 15 Zentimeter langen Zepter (zur einfachen Aufbewahrung), zu einer drei Meter langen Stange oder wieder zum Kampfstab werden lassen. Die Waffe kann nicht größer werden, als es der Platz um sie herum erlaubt. In bestimmten Formen hat die Waffe folgende zusätzliche Eigenschaften:"
    },
    {
     "typ": "punkt",
     "text": "Akrobatische Hilfe (nur als Kampfstab und als Drei-Meter-Stange): Wenn du diese Waffe hältst, bist du bei Geschicklichkeitswürfen (Akrobatik) im Vorteil."
    },
    {
     "typ": "punkt",
     "text": "Angriffsabwehr (nur als Kampfstab): Wenn du von einem Angriff getroffen wirst, während du die Waffe hältst, kannst du eine Reaktion ausführen und die Waffe um dich herumwirbeln lassen. Dadurch erhältst du einen Bonus von +5 auf deine Rüstungsklasse gegen den auslösenden Angriff, sodass dieser möglicherweise misslingt. Du kannst diese Eigenschaft erst nach einer kurzen oder langen Rast erneut verwenden."
    },
    {
     "typ": "punkt",
     "text": "Fernkampfwaffe (nur als Kampfstab): Diese Waffe ist eine Wurfwaffe mit einer Grundreichweite von neun Metern und einer Maximalreichweite von 36 Metern. Sofort nach einem Fernkampfangriff mit der Waffe fliegt diese zurück in deine Hand."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have a +2 bonus to attack rolls and damage rolls made with this magic weapon. While holding this weapon, you can cause it to emit green Dim Light out to 10 feet, either as a Bonus Action or after you roll Initiative, or you can extinguish the light as a Bonus Action. While holding this weapon, you can take a Bonus Action to alter its form, turning it into a 6-inch rod (for ease of storage) or a 10-foot pole, or reverting it a Quarterstaff; the weapon will elongate only as far as the surrounding space allows. In certain forms, the weapon has the following additional properties."
    },
    {
     "typ": "punkt",
     "text": "Acrobatic Assist (Quarterstaff and 10-Foot Pole Forms Only). While holding this weapon, you have Advantage on Dexterity (Acrobatics) checks."
    },
    {
     "typ": "punkt",
     "text": "Attack Deflection (Quarterstaff Form Only). When you are hit by an attack while holding the weapon, you can take a Reaction to twirl the weapon around you, gaining a +5 bonus to your Armor Class against the triggering attack, potentially causing the attack to miss you. You can’t use this property again until you finish a Short or Long Rest."
    },
    {
     "typ": "punkt",
     "text": "Ranged Weapon (Quarterstaff Form Only). This weapon has the Thrown property with a normal range of 30 feet and a long range of 120 feet. Immediately after you make a ranged attack with the weapon, it flies back to your hand."
    }
   ]
  }
 },
 {
  "id": "ring-of-animal-influence",
  "name": {
   "de": "Ring des Tierumgangs",
   "en": "Ring of Animal Influence"
  },
  "kopfzeile": {
   "de": "Ring, selten",
   "en": "Ring, Rare"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Ring hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du den Ring trägst, kannst du eine Ladung verbrauchen, um einen der folgenden Zauber (Rettungswurf‑SG 13) damit zu wirken: • Tierfreundschaft • Furcht (wirkt nur auf Tiere) • Mit Tieren sprechen"
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This ring has 3 charges, and it regains 1d3 expended charges daily at dawn. While wearing the ring, you can expend 1 charge to cast one of the following spells (save DC 13) from it: • Animal Friendship • Fear (affects Beasts only) • Speak with Animals"
    }
   ]
  }
 },
 {
  "id": "ring-of-djinni-summoning",
  "name": {
   "de": "Ring der Dschinni-Beschwörung",
   "en": "Ring of Djinni Summoning"
  },
  "kopfzeile": {
   "de": "Ring, legendär (erfordert Einstimmung)",
   "en": "Ring, Legendary (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kannst du eine magische Aktion ausführen, um einen bestimmten Dschinni von der Elementarebene der Luft herbeizurufen. Der Dschinni erscheint in einem freien Bereich deiner Wahl im Abstand von bis zu 36 Metern von dir. Er bleibt, bis eine Stunde vergangen ist, bis seine Trefferpunkte auf 0 sinken oder deine Konzentration unterbrochen wird. Der beschworene Dschinni ist dir und deinen Verbündeten gegenüber freundlich gesinnt und gehorcht deinen Befehlen. Wenn du keine Befehle erteilst, verteidigt sich der Dschinni gegen Angreifer, führt aber keine anderen Aktionen aus. Nachdem der Dschinni verschwunden ist, kann er 24 Stunden lang nicht erneut gerufen werden. Wenn der Dschinni stirbt, wird der Ring nichtmagisch. Ringe der Dschinni-Beschwörung werden oft vom Dschinni geschaffen, den sie herbeirufen, und Sterblichen als Zeichen von Freundschaft oder Wertschätzung überreicht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you can take a Magic action to summon a particular Djinni from the Elemental Plane of Air. The djinni appears in an unoccupied space you choose within 120 feet of yourself. It remains as long as you maintain Concentration, to a maximum of 1 hour, or until it drops to 0 Hit Points. While summoned, the djinni is Friendly to you and your allies, and it obeys your commands. If you fail to command it, the djinni defends itself against attackers but takes no other actions. After the djinni departs, it can’t be summoned again for 24 hours, and the ring becomes nonmagical if the djinni dies. Rings of Djinni Summoning are often created by the djinn they summon and given to mortals as gifts of friendship or tokens of esteem."
    }
   ]
  }
 },
 {
  "id": "ring-of-elemental-command",
  "name": {
   "de": "Ring der Elementar-Herrschaft",
   "en": "Ring of Elemental Command"
  },
  "kopfzeile": {
   "de": "Ring, legendär (erfordert Einstimmung)",
   "en": "Ring, Legendary (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jeder Ring der Elementar-Herrschaft ist mit einer der vier Elementarebenen verbunden. Der SL wählt die verbundene Ebene aus oder bestimmt sie zufällig. Beispiel: Ein Ring der Luftelementar-Herrschaft ist mit der Elementarebene der Luft verbunden. Jeder Ring der Elementar-Herrschaft hat die folgenden beiden Eigenschaften:"
    },
    {
     "typ": "stichpunkt",
     "text": "Elementares Verderben: Wenn du den Ring trägst, bist du bei Angriffswürfen gegen Elementare im Vorteil, und die Elementare sind bei Angriffswürfen gegen dich im Nachteil."
    },
    {
     "typ": "stichpunkt",
     "text": "Elementarer Zwang: Wenn du den Ring trägst, kannst du eine magische Aktion ausführen und versuchen, dir einen Elementar im Abstand von bis zu 18 Metern von dir, den du sehen kannst, gefügig zu machen. Der Elementar führt einen SG‑18‑Weisheitsrettungswurf aus. Misslingt der Wurf, so ist der Elementar bis zum Beginn deines nächsten Zugs bezaubert, und du bestimmst seine Bewegung und seine Aktion im nächsten Zug."
    },
    {
     "typ": "punkt",
     "text": "Elementarer Fokus: Wenn du den Ring trägst, profitierst du von zusätzlichen Eigenschaften je nach Elementarebene, die mit dem Ring verbunden ist:"
    },
    {
     "typ": "stichpunkt",
     "text": "Erde: Du beherrscht Terral und bist gegen Säureschaden resistent. Gelände aus Geröll, Steinen oder Erde zählt für dich nicht als schwieriges Gelände. Außerdem kannst du dich durch massive Erde und durch Stein bewegen wie durch schwieriges Gelände. Dabei bringst du das Material, durch das du dich bewegst, nicht in Unordnung. Wenn du deinen Zug in massiver Erde oder in Stein beendest, wirst du in den nächsten freien Bereich verschoben, den du zuletzt besetzt hast."
    },
    {
     "typ": "stichpunkt",
     "text": "Feuer: Du beherrscht Ignal und bist gegen Feuerschaden immun."
    },
    {
     "typ": "stichpunkt",
     "text": "Luft: Du beherrscht Aural, bist gegen Blitzschaden resistent, hast eine Flugbewegungsrate in Höhe deiner Bewegungsrate und kannst schweben."
    },
    {
     "typ": "stichpunkt",
     "text": "Wasser: Du beherrscht Aqual, hast eine Schwimmbewegungsrate von 18 Metern und kannst unter Wasser atmen."
    },
    {
     "typ": "punkt",
     "text": "Zauberwirken: Der Ring hat fünf Ladungen und erhält täglich im Morgengrauen 1W4+1 verbrauchte Ladungen zurück. Wenn du diesen Ring trägst, kannst du einen Zauber damit wirken. Wähle den Zauber aus der Liste verfügbarer Zauber je nach Elementarebene aus, mit welcher der Ring verbunden ist, wie in der nachfolgenden Tabelle dargestellt. In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken. Der Zauber hat den Rettungswurf‑SG 18."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Ebene",
      "Zauber (Ladungen)"
     ],
     "reihen": [
      [
       "Erde",
       "Erdbeben (5 Ladungen), Stein formen (2 Ladungen), Steinhaut (3 Ladungen), Steinwand (3 Ladungen)"
      ],
      [
       "Feuer",
       "Brennende Hände (1 Ladung), Feuerball (2 Ladungen), Feuersturm (4 Ladungen), Feuerwand (3 Ladungen)"
      ],
      [
       "Luft",
       "Federfall (0 Ladungen), Kettenblitz (3 Ladungen), Windstoß (2 Ladungen), Windwall (1 Ladung)"
      ],
      [
       "Wasser",
       "Eissturm (2 Ladungen), Eiswand (3 Ladungen), Tsunami (5 Ladungen), Wasser erschaffen oder zerstören (1 Ladung), Wasserwandeln (2 Ladungen)"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each Ring of Elemental Command is linked to one of the four Elemental Planes. The GM chooses or randomly determines the linked plane. For example, a Ring of Elemental Command (air) is linked to the Elemental Plane of Air. Every Ring of Elemental Command has the following two properties:"
    },
    {
     "typ": "stichpunkt",
     "text": "Elemental Bane. While wearing the ring, you have Advantage on attack rolls against Elementals and they have Disadvantage on attack rolls against you."
    },
    {
     "typ": "stichpunkt",
     "text": "Elemental Compulsion. While wearing the ring, you can take a Magic action to try to compel an Elemental you see within 60 feet of yourself. The Elemental makes a DC 18 Wisdom saving throw. On a failed save, the Elemental has the Charmed condition until the start your next turn, and you determine what it does with its move and action on its next turn."
    },
    {
     "typ": "punkt",
     "text": "Elemental Focus. While wearing the ring, you benefit from additional properties corresponding to the ring’s linked Elemental Plane:"
    },
    {
     "typ": "stichpunkt",
     "text": "Air. You know Auran, you have Resistance to Lightning damage, and you have a Fly Speed equal to your Speed and can hover."
    },
    {
     "typ": "stichpunkt",
     "text": "Earth. You know Terran, and you have Resistance to Acid damage. Terrain composed of rubble, rocks, or dirt isn’t Difficult Terrain for you. In addition, you can move through solid earth or rock as if those areas were Difficult Terrain without disturbing the matter through which you pass. If you end your turn in solid earth or rock, you are shunted out to the nearest unoccupied space you last occupied."
    },
    {
     "typ": "stichpunkt",
     "text": "Fire. You know Ignan, and you have Immunity to Fire damage."
    },
    {
     "typ": "stichpunkt",
     "text": "Water. You know Aquan, you gain a Swim Speed of 60 feet, and you can breathe underwater."
    },
    {
     "typ": "punkt",
     "text": "Spellcasting. The ring has 5 charges and regains 1d4 + 1 expended charges daily at dawn. While wearing the ring, you can cast a spell from it. Choose the spell from the list of available spells based on the Elemental Plane the ring is linked to, as shown in the following table. The table indicates how many charges you must expend to cast the spell, which has a save DC of 18."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Plane",
      "Spells (Charges)"
     ],
     "reihen": [
      [
       "Air",
       "Chain Lightning (3 charges), Feather Fall (0 charges), Gust of Wind (2 charges), Wind Wall (1 charge)"
      ],
      [
       "Earth",
       "Earthquake (5 charges), Stone Shape (2 charges), Stoneskin (3 charges), Wall of Stone (3 charges)"
      ],
      [
       "Fire",
       "Burning Hands (1 charge), Fireball (2 charges), Fire Storm (4 charges), Wall of Fire (3 charges)"
      ],
      [
       "Water",
       "Create or Destroy Water (1 charge), Ice Storm (2 charges), Tsunami (5 charges), Wall of Ice (3 charges), Water Walk (2 charges)"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "ring-of-evasion",
  "name": {
   "de": "Ring des Ausweichens",
   "en": "Ring of Evasion"
  },
  "kopfzeile": {
   "de": "Ring, selten (erfordert Einstimmung)",
   "en": "Ring, Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Ring hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du den Ring trägst und bei einem Geschicklichkeitsrettungswurf scheiterst, kannst du eine Reaktion ausführen und eine Ladung verbrauchen, um den Rettungswurf stattdessen zu bestehen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This ring has 3 charges, and it regains 1d3 expended charges daily at dawn. When you fail a Dexterity saving throw while wearing the ring, you can take a Reaction to expend 1 charge to succeed on that save instead."
    }
   ]
  }
 },
 {
  "id": "ring-of-feather-falling",
  "name": {
   "de": "Ring des Federfalls",
   "en": "Ring of Feather Falling"
  },
  "kopfzeile": {
   "de": "Ring, selten (erfordert Einstimmung)",
   "en": "Ring, Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du fällst, während du diesen Ring trägst, sinkst du mit einer Geschwindigkeit von 18 Metern pro Runde und erleidest keinen Fallschaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you fall while wearing this ring, you descend 60 feet per round and take no damage from falling."
    }
   ]
  }
 },
 {
  "id": "ring-of-free-action",
  "name": {
   "de": "Ring der Bewegungsfreiheit",
   "en": "Ring of Free Action"
  },
  "kopfzeile": {
   "de": "Ring, selten (erfordert Einstimmung)",
   "en": "Ring, Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kostet dich schwieriges Gelände keine zusätzliche Bewegung. Außerdem kann weder mit Magie eine deiner Bewegungsraten eingeschränkt werden, noch kannst du magisch gelähmt oder festgesetzt werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear this ring, Difficult Terrain doesn’t cost you extra movement. In addition, magic can neither reduce any of your Speeds nor cause you to have the Paralyzed or Restrained condition."
    }
   ]
  }
 },
 {
  "id": "ring-of-invisibility",
  "name": {
   "de": "Ring der Unsichtbarkeit",
   "en": "Ring of Invisibility"
  },
  "kopfzeile": {
   "de": "Ring, legendär (erfordert Einstimmung)",
   "en": "Ring, Legendary (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kannst du eine magische Aktion ausführen, um dich selbst unsichtbar zu machen. Du bleibst unsichtbar, bis der Ring entfernt wird oder du eine Bonusaktion ausführst, um wieder sichtbar zu werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you can take a Magic action to give yourself the Invisible condition. You remain Invisible until the ring is removed or until you take a Bonus Action to become visible again."
    }
   ]
  }
 },
 {
  "id": "ring-of-jumping",
  "name": {
   "de": "Ring des Springens",
   "en": "Ring of Jumping"
  },
  "kopfzeile": {
   "de": "Ring, ungewöhnlich (erfordert Einstimmung)",
   "en": "Ring, Uncommon (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kannst du den Zauber Springen damit wirken, jedoch nur auf dich selbst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you can cast Jump from it, but can target only yourself when you do so."
    }
   ]
  }
 },
 {
  "id": "ring-of-mind-shielding",
  "name": {
   "de": "Ring der Gedankenabschirmung",
   "en": "Ring of Mind Shielding"
  },
  "kopfzeile": {
   "de": "Ring, ungewöhnlich (erfordert Einstimmung)",
   "en": "Ring, Uncommon (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, bist du gegen Magie immun, die anderen Kreaturen ermöglicht, deine Gedanken zu lesen, zu erkennen, ob du die Wahrheit sagst, oder deine Gesinnung oder deinen Kreaturentyp zu erfahren. Kreaturen können nur telepathisch mit dir kommunizieren, wenn du es erlaubst. Du kannst eine magische Aktion ausführen und bewirken, dass der Ring nicht wahrnehmbar ist, bis du ihn mit einer weiteren magischen Aktion wieder wahrnehmbar machst, bis du ihn entfernst oder bis du stirbst. Wenn du stirbst, während du den Ring trägst, geht deine Seele in den Ring über, sofern sich in diesem noch keine Seele befindet. Deine Seele kann im Ring bleiben oder ins Jenseits reisen. Solange sie sich im Ring befindet, kannst du telepathisch mit jeder Kreatur kommunizieren, die ihn trägt. Der Träger kann diese telepathische Kommunikation nicht unterdrücken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you are immune to magic that allows other creatures to read your thoughts, determine whether you are lying, know your alignment, or know your creature type. Creatures can telepathically communicate with you only if you allow it. You can take a Magic action to cause the ring to become imperceptible until you take another Magic action to make it perceptible, until you remove the ring, or until you die. If you die while wearing the ring, your soul enters it, unless it already houses a soul. You can remain in the ring or depart for the afterlife. As long as your soul is in the ring, you can telepathically communicate with any creature wearing it. A wearer can’t prevent this telepathic communication."
    }
   ]
  }
 },
 {
  "id": "ring-of-protection",
  "name": {
   "de": "Ring des Schutzes",
   "en": "Ring of Protection"
  },
  "kopfzeile": {
   "de": "Ring, selten (erfordert Einstimmung)",
   "en": "Ring, Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, erhältst du einen Bonus von +1 auf deine Rüstungsklasse und auf deine Rettungswürfe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +1 bonus to Armor Class and saving throws while wearing this ring."
    }
   ]
  }
 },
 {
  "id": "ring-of-regeneration",
  "name": {
   "de": "Ring der Regeneration",
   "en": "Ring of Regeneration"
  },
  "kopfzeile": {
   "de": "Ring, sehr selten (erfordert Einstimmung)",
   "en": "Ring, Very Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, erhältst du alle zehn Minuten 1W6 Trefferpunkte zurück, sofern du mindestens 1 Trefferpunkt hast. Wenn du einen Körperteil verlierst, lässt der Ring ihn nachwachsen, sodass er nach 1W6+1 Tagen wieder voll einsatzfähig ist, sofern du während der gesamten Zeit mindestens 1 Trefferpunkt hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you regain 1d6 Hit Points every 10 minutes if you have at least 1 Hit Point. If you lose a body part, the ring causes the missing part to regrow and return to full functionality after 1d6 + 1 days if you have at least 1 Hit Point the whole time."
    }
   ]
  }
 },
 {
  "id": "ring-of-resistance",
  "name": {
   "de": "Ring der Resistenz",
   "en": "Ring of Resistance"
  },
  "kopfzeile": {
   "de": "Ring, selten",
   "en": "Ring, Rare"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, bist du gegen eine Schadensart resistent. Der Edelstein am Ring (vom SL ausgewählt oder durch Würfeln anhand der folgenden Tabelle zufällig bestimmt) gibt die Schadensart an."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W10",
      "Schadensart",
      "Edelstein"
     ],
     "reihen": [
      [
       "1",
       "Blitz",
       "Citrin"
      ],
      [
       "2",
       "Energie",
       "Saphir"
      ],
      [
       "3",
       "Feuer",
       "Granat"
      ],
      [
       "4",
       "Gift",
       "Amethyst"
      ],
      [
       "5",
       "Gleißend",
       "Topas"
      ],
      [
       "6",
       "Kälte",
       "Turmalin"
      ],
      [
       "7",
       "Nekrotisch",
       "Gagat"
      ],
      [
       "8",
       "Psychisch",
       "Jade"
      ],
      [
       "9",
       "Säure",
       "Perle"
      ],
      [
       "10",
       "Schall",
       "Spinell"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have Resistance to one damage type while wearing this ring. The gemstone in the ring indicates the type, which the GM chooses or determines randomly by rolling on the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d10",
      "Damage Type",
      "Gemstone"
     ],
     "reihen": [
      [
       "1",
       "Acid",
       "Pearl"
      ],
      [
       "2",
       "Cold",
       "Tourmaline"
      ],
      [
       "3",
       "Fire",
       "Garnet"
      ],
      [
       "4",
       "Force",
       "Sapphire"
      ],
      [
       "5",
       "Lightning",
       "Citrine"
      ],
      [
       "6",
       "Necrotic",
       "Jet"
      ],
      [
       "7",
       "Poison",
       "Amethyst"
      ],
      [
       "8",
       "Psychic",
       "Jade"
      ],
      [
       "9",
       "Radiant",
       "Topaz"
      ],
      [
       "10",
       "Thunder",
       "Spinel"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "ring-of-shooting-stars",
  "name": {
   "de": "Ring der Sternschnuppen",
   "en": "Ring of Shooting Stars"
  },
  "kopfzeile": {
   "de": "Ring, sehr selten (erfordert Einstimmung)",
   "en": "Ring, Very Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst den Zauber Licht oder den Zauber Tanzende Lichter mit dem Ring wirken. Der Ring hat sechs Ladungen und erhält täglich im Morgengrauen 1W6 verbrauchte Ladungen zurück. Du kannst seine Ladungen verbrauchen, um die folgenden Eigenschaften zu verwenden:"
    },
    {
     "typ": "punkt",
     "text": "Feenfeuer: Du kannst eine Ladung verbrauchen, um den Zauber Feenfeuer mit dem Ring zu wirken."
    },
    {
     "typ": "punkt",
     "text": "Kugelblitze: Du kannst als magische Aktion zwei Ladungen verbrauchen, um bis zu vier Kugelblitze mit einem Durchmesser von einem Meter mit dem Ring zu wirken. Jeder Kugelblitz erscheint in einem freien Bereich im Abstand von bis zu 36 Metern von dir, den du sehen kannst. Die Kugelblitze bleiben bestehen, bis eine Minute vergangen ist oder deine Konzentration unterbrochen wird. Jeder Kugelblitz spendet in einem Radius von neun Metern dämmriges Licht. Als Bonusaktion kannst du jeden Kugelblitz bis zu neun Meter weit bewegen. Die Kugelblitze können sich jedoch nicht weiter als 36 Meter von dir entfernen. Wenn ein Kugelblitz sich einer anderen Kreatur als dir, die sich nicht hinter vollständiger Deckung befindet, erstmals auf bis zu 1,5 Meter nähert, entlädt er seine Blitzenergie auf die Kreatur und verschwindet dann. Die Kreatur führt einen SG‑15‑Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur Blitzschaden je nach Anzahl der erzeugten Kugelblitze, wie in der nachstehenden Tabelle dargestellt. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur halb so viel Schaden."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Anzahl der Kugelblitze",
      "Blitzschaden"
     ],
     "reihen": [
      [
       "1",
       "4W12"
      ],
      [
       "2",
       "5W4"
      ],
      [
       "3",
       "2W6"
      ],
      [
       "4",
       "2W4"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Sternschnuppen: Du kannst als magische Aktion eine bis drei Ladungen verbrauchen. Für jede verbrauchte Ladung verschießt der Ring einen Lichtfunken an einen Punkt im Abstand von bis zu 18 Metern von dir, den du sehen kannst. Auf jede Kreatur innerhalb eines Würfels mit einer Kantenlänge von 4,5 Metern, der von diesem Punkt ausgeht, regnen Funken herab, und die Kreaturen führen einen SG‑15‑Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die jeweilige Kreatur 5W4 gleißenden Schaden, anderenfalls die Hälfte."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can cast Dancing Lights or Light from the ring. The ring has 6 charges and regains 1d6 expended charges daily at dawn. You can expend its charges to use the properties below."
    },
    {
     "typ": "punkt",
     "text": "Faerie Fire. You can expend 1 charge to cast Faerie Fire from the ring."
    },
    {
     "typ": "punkt",
     "text": "Lightning Spheres. You can expend 2 charges as a Magic action to create up to four 3-foot-diameter spheres of lightning. Each sphere appears in an unoccupied space you can see within 120 feet of yourself. The spheres last as long as you maintain Concentration, up to 1 minute. Each sphere sheds Dim Light in a 30-foot radius. As a Bonus Action, you can move each sphere up to 30 feet, but no farther than 120 feet away from yourself. The first time the sphere comes within 5 feet of a creature other than you that isn’t behind Total Cover, the sphere discharges lightning at that creature and disappears. That creature makes a DC 15 Dexterity saving throw. On a failed save, the creature takes Lightning damage based on the number of spheres you created, as shown in the following table. On a successful save, the creature takes half as much damage."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Number of Spheres",
      "Lightning Damage"
     ],
     "reihen": [
      [
       "1",
       "4d12"
      ],
      [
       "2",
       "5d4"
      ],
      [
       "3",
       "2d6"
      ],
      [
       "4",
       "2d4"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Shooting Stars. You can expend 1 to 3 charges as a Magic action. For every charge you expend, you launch a glowing mote of light from the ring at a point you can see within 60 feet of yourself. Each creature in a 15-foot Cube originating from that point is showered in sparks and makes a DC 15 Dexterity saving throw, taking 5d4 Radiant damage on a failed save or half as much damage on a successful one."
    }
   ]
  }
 },
 {
  "id": "ring-of-spell-storing",
  "name": {
   "de": "Ring des Zauberspeichers",
   "en": "Ring of Spell Storing"
  },
  "kopfzeile": {
   "de": "Ring, selten (erfordert Einstimmung)",
   "en": "Ring, Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Ring speichert Zauber, die in ihn gewirkt werden, bis der eingestimmte Träger des Rings sie verwendet. Der Ring kann Zauber von bis zu fünf Zaubergraden aufnehmen. Wenn er gefunden wird, enthält er 1W6‑1 Zaubergrade in Form von Zaubern, die der SL bestimmt. Jede Kreatur kann einen Zauber des 1. bis 5. Grades in den Ring wirken. Dazu muss sie den Ring berühren, während sie den Zauber wirkt. Der Zauber hat dann keinen Effekt, sondern wird im Ring gespeichert. Wenn der Ring den Zauber nicht aufnehmen kann, ist der Zauber vergeudet. Der beim Wirken verwendete Zaubergrad bestimmt, wie viel Platz der Zauber im Ring verbraucht. Wenn du diesen Ring trägst, kannst du einen beliebigen der darin gespeicherten Zauber wirken. Der Zauber verwendet den Zaubergrad, den Zauberrettungswurf‑SG, den Zauberangriffsbonus und das Attribut zum Zauberwirken des ursprünglichen Zauberwirkers, wird aber in jeder anderen Form behandelt, als hättest du ihn gewirkt. Der aus dem Ring gewirkte Zauber ist dann nicht mehr im Ring gespeichert und gibt seinen Platz frei."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This ring stores spells cast into it, holding them until the attuned wearer uses them. The ring can store up to 5 levels worth of spells at a time. When found, it contains 1d6 − 1 levels of stored spells chosen by the GM. Any creature can cast a spell of level 1 through 5 into the ring by touching the ring as the spell is cast. The spell has no effect other than to be stored in the ring. If the ring can’t hold the spell, the spell is expended without effect. The level of the slot used to cast the spell determines how much space it uses. While wearing this ring, you can cast any spell stored in it. The spell uses the slot level, spell save DC, spell attack bonus, and spellcasting ability of the original caster but is otherwise treated as if you cast the spell. The spell cast from the ring is no longer stored in it, freeing up space."
    }
   ]
  }
 },
 {
  "id": "ring-of-spell-turning",
  "name": {
   "de": "Ring des Zauberwendens",
   "en": "Ring of Spell Turning"
  },
  "kopfzeile": {
   "de": "Ring, legendär (erfordert Einstimmung)",
   "en": "Ring, Legendary (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, bist du bei Rettungswürfen gegen Zauber im Vorteil. Bestehst du einen Rettungswurf gegen Zauber des höchstens 7. Grades, so hat der Zauber keinen Effekt auf dich. Wenn mit diesem Zauber nur auf dich gezielt wurde und er keinen Wirkungsbereich hat, kannst du eine Reaktion ausführen, um den Zauber auf seinen Zauberwirker zurückzulenken. Der Zauberwirker muss einen Rettungswurf gegen den Zauber ausführen und dabei seinen eigenen Zauberrettungswurf‑SG verwenden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you have Advantage on saving throws against spells. If you succeed on the save for a spell of level 7 or lower, the spell has no effect on you. If that spell targeted only you and didn’t create an area of effect, you can take a Reaction to deflect the spell back at the spell’s caster; the caster must make a saving throw against the spell using their own spell save DC."
    }
   ]
  }
 },
 {
  "id": "ring-of-swimming",
  "name": {
   "de": "Ring des Schwimmens",
   "en": "Ring of Swimming"
  },
  "kopfzeile": {
   "de": "Ring, ungewöhnlich",
   "en": "Ring, Uncommon"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, hast du eine Schwimmbewegungsrate von zwölf Metern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have a Swim Speed of 40 feet while wearing this ring."
    }
   ]
  }
 },
 {
  "id": "ring-of-telekinesis",
  "name": {
   "de": "Ring der Telekinese",
   "en": "Ring of Telekinesis"
  },
  "kopfzeile": {
   "de": "Ring, sehr selten (erfordert Einstimmung)",
   "en": "Ring, Very Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kannst du Telekinese mit ihm wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you can cast Telekinesis from it."
    }
   ]
  }
 },
 {
  "id": "ring-of-the-ram",
  "name": {
   "de": "Ring des Widders",
   "en": "Ring of the Ram"
  },
  "kopfzeile": {
   "de": "Ring, selten (erfordert Einstimmung)",
   "en": "Ring, Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Ring hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du diesen Ring trägst, kannst du eine magische Aktion ausführen und bis zu drei Ladungen verbrauchen, um einen Fernkampf‑Zauberangriff gegen eine Kreatur im Abstand von bis zu 18 Metern von dir auszuführen, die du sehen kannst. Der Ring erzeugt einen geisterhaften Widderkopf, der einen Angriffswurf mit einem Bonus von +7 ausführt. Bei einem Treffer erleidet das Ziel für jede verbrauchte Ladung 2W10 Energieschaden und wird 1,5 Meter weit von dir weggestoßen. Alternativ kannst du als magische Aktion bis zu drei Ladungen des Rings verbrauchen und versuchen, einen nichtmagischen Gegenstand im Abstand von bis zu 18 Metern von dir zu zerstören, den du sehen kannst und der weder getragen noch gehalten wird. Der Ring führt für jede verbrauchte Ladung einen Stärkewurf mit einem Bonus von +5 aus."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This ring has 3 charges and regains 1d3 expended charges daily at dawn. While wearing the ring, you can take a Magic action to expend 1 to 3 charges to make a ranged spell attack against one creature you can see within 60 feet of yourself. The ring produces a spectral ram’s head and makes its attack roll with a +7 bonus. On a hit, for each charge you spend, the target takes 2d10 Force damage and is pushed 5 feet away from you. Alternatively, you can expend 1 to 3 of the ring’s charges as a Magic action to try to break a nonmagical object you can see within 60 feet of yourself that isn’t being worn or carried. The ring makes a Strength check with a +5 bonus for each charge you spend."
    }
   ]
  }
 },
 {
  "id": "ring-of-three-wishes",
  "name": {
   "de": "Ring der Drei Wünsche",
   "en": "Ring of Three Wishes"
  },
  "kopfzeile": {
   "de": "Ring, legendär",
   "en": "Ring, Legendary"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kannst du eine seiner drei Ladungen verbrauchen, um den Zauber Wunsch damit zu wirken. Hast du die letzte Ladung verbraucht, so wird der Ring nichtmagisch."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you can expend 1 of its 3 charges to cast Wish from it. The ring becomes nonmagical when you use the last charge."
    }
   ]
  }
 },
 {
  "id": "ring-of-warmth",
  "name": {
   "de": "Ring der Wärme",
   "en": "Ring of Warmth"
  },
  "kopfzeile": {
   "de": "Ring, ungewöhnlich (erfordert Einstimmung)",
   "en": "Ring, Uncommon (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst und Kälteschaden erleidest, verringert der Ring diesen Schaden um 2W8. Außerdem erleidest du mit allem, was du trägst und hältst, durch Temperaturen von −18 Grad Celsius und darunter keinen Schaden, wenn du den Ring trägst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "If you take Cold damage while wearing this ring, the ring reduces the damage you take by 2d8. In addition, while wearing this ring, you and everything you wear and carry are unharmed by temperatures of 0 degrees Fahrenheit or lower."
    }
   ]
  }
 },
 {
  "id": "ring-of-water-walking",
  "name": {
   "de": "Ring des Wasserwandelns",
   "en": "Ring of Water Walking"
  },
  "kopfzeile": {
   "de": "Ring, ungewöhnlich",
   "en": "Ring, Uncommon"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kannst du damit Wasserwandeln auf dich selbst wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you cast Water Walk from it, targeting only yourself."
    }
   ]
  }
 },
 {
  "id": "ring-of-x-ray-vision",
  "name": {
   "de": "Ring der Durchsicht",
   "en": "Ring of X-ray Vision"
  },
  "kopfzeile": {
   "de": "Ring, selten (erfordert Einstimmung)",
   "en": "Ring, Rare (Requires Attunement)"
  },
  "kategorie": "ring",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Ring trägst, kannst du eine magische Aktion ausführen, um eine Minute lang Durchsicht mit einer Reichweite von neun Metern zu erhalten. Für dich wirken feste Gegenstände innerhalb dieses Radius durchsichtig, und Licht kann durch sie hindurchdringen. Die Durchsicht durchdringt 30 Zentimeter Stein, 2,5 Zentimeter gewöhnliches Metall oder einen Meter Holz oder Erde. Dickere Substanzen oder auch eine dünne Bleischicht blockieren die Sicht. Wann immer du den Ring erneut verwendest, ehe du eine lange Rast abgeschlossen hast, musst du einen SG‑15‑Konstitutionsrettungswurf bestehen, oder du erhältst eine Erschöpfungsstufe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this ring, you can take a Magic action to gain X-ray vision with a range of 30 feet for 1 minute. To you, solid objects within that radius appear transparent and don’t prevent light from passing through them. The vision can penetrate 1 foot of stone, 1 inch of common metal, or up to 3 feet of wood or dirt. Thicker substances or a thin sheet of lead block the vision. Whenever you use the ring again before taking a Long Rest, you must succeed on a DC 15 Constitution saving throw or gain 1 Exhaustion level."
    }
   ]
  }
 },
 {
  "id": "robe-of-eyes",
  "name": {
   "de": "Robe der Augen",
   "en": "Robe of Eyes"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Robe ist mit augenartigen Mustern verziert. Wenn du diese Robe trägst, erhältst du die folgenden Vorzüge:"
    },
    {
     "typ": "stichpunkt",
     "text": "Rundumsicht: Du bist bei Weisheitswürfen (Wahrnehmung) im Vorteil, die Sicht erfordern."
    },
    {
     "typ": "stichpunkt",
     "text": "Spezialsinne: Du hast Dunkelsicht und Wahrer Blick, jeweils mit einer Reichweite von 36 Metern."
    },
    {
     "typ": "punkt",
     "text": "Nachteile: Wird der Zauber Licht auf die Robe gewirkt oder der Zauber Tageslicht im Abstand von bis zu 1,5 Metern von der Robe gewirkt, so bist du eine Minute lang blind. Am Ende jedes deiner Züge führst du einen Konstitutionsrettungswurf (SG 11 bei Licht, SG 15 bei Tageslicht) aus. Bei einem Erfolg endet die Blindheit bei dir."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This robe is adorned with eyelike patterns. While you wear the robe, you gain the following benefits:"
    },
    {
     "typ": "stichpunkt",
     "text": "All-Around Vision. The robe gives you Advantage on Wisdom (Perception) checks that rely on sight."
    },
    {
     "typ": "stichpunkt",
     "text": "Special Senses. You have Darkvision and Truesight, both with a range of 120 feet."
    },
    {
     "typ": "punkt",
     "text": "Drawbacks. A Light spell cast on the robe or a Daylight spell cast within 5 feet of the robe gives you the Blinded condition for 1 minute. At the end of each of your turns, you make a Constitution saving throw (DC 11 for Light or DC 15 for Daylight), ending the condition on yourself on a success."
    }
   ]
  }
 },
 {
  "id": "robe-of-scintillating-colors",
  "name": {
   "de": "Robe der Schillernden Farben",
   "en": "Robe of Scintillating Colors"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Very Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Robe hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du sie trägst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen. Daraufhin zeigt die Robe bis zum Ende deines nächsten Zugs ein wechselndes Muster aus schillernden Farben. Während dieser Dauer spendet die Robe in einem Radius von neun Metern helles Licht und in einem Radius von weiteren neun Metern dämmriges Licht. Kreaturen, die dich sehen können, sind bei Angriffswürfen gegen dich im Nachteil. Jede Kreatur im hellen Licht, die dich sehen kann, wenn der Effekt der Robe aktiviert wird, muss einen SG‑15‑Weisheitsrettungswurf bestehen, oder sie ist betäubt, bis der Effekt endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This robe has 3 charges, and it regains 1d3 expended charges daily at dawn. While you wear it, you can take a Magic action and expend 1 charge to cause the garment to display a shifting pattern of dazzling hues until the end of your next turn. During this time, the robe sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet, and creatures that can see you have Disadvantage on attack rolls against you. Any creature in the Bright Light that can see you when the robe’s power is activated must succeed on a DC 15 Wisdom saving throw or have the Stunned condition until the effect ends."
    }
   ]
  }
 },
 {
  "id": "robe-of-stars",
  "name": {
   "de": "Robe der Sterne",
   "en": "Robe of Stars"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Very Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese schwarze oder dunkelblaue Robe ist mit kleinen weißen oder silbernen Sternen bestickt. Wenn du sie trägst, erhältst du einen Bonus von +1 auf deine Rettungswürfe. Sechs Sterne im oberen Bereich der Vorderseite sind besonders groß. Wenn du die Robe trägst, kannst du eine magische Aktion ausführen und einen dieser Sterne verbrauchen, um den Zauber Magisches Geschoss des 5. Grades zu wirken. In jeder Abenddämmerung erhält die Robe 1W6 verbrauchte Sterne zurück. Wenn du die Robe trägst, kannst du eine magische Aktion ausführen und dich mit allem, was du trägst oder hältst, auf die Astralebene begeben. Du bleibst auf der Astralebene, bis du erneut eine magische Aktion ausführst, um zu deiner Ausgangsebene zurückzukehren. Dort erscheinst du in dem Bereich, in dem du dich zuletzt befunden hast. Falls dieser nicht mehr frei ist, erscheinst du im nächstgelegenen freien Bereich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This black or dark-blue robe is embroidered with small white or silver stars. You gain a +1 bonus to saving throws while you wear it. Six stars, located on the robe’s upper-front portion, are particularly large. While wearing this robe, you can take a Magic action to remove one of the stars and expend it to cast the level 5 version of Magic Missile. Daily at dusk, 1d6 removed stars reappear on the robe. While you wear the robe, you can take a Magic action to enter the Astral Plane along with everything you are wearing and carrying. You remain there until you take a Magic action to return to the plane you were on. You reappear in the last space you occupied or, if that space is occupied, the nearest unoccupied space."
    }
   ]
  }
 },
 {
  "id": "robe-of-the-archmagi",
  "name": {
   "de": "Robe der Erzmagier",
   "en": "Robe of the Archmagi"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung durch einen Hexenmeister, Magier oder Zauberer)",
   "en": "Wondrous Item, Legendary (Requires Attunement by a Sorcerer, Warlock, or Wizard)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses elegante Gewand ist aus exquisitem Stoff gefertigt und mit Runen verziert. Wenn du die Robe trägst, erhältst du folgende Vorzüge:"
    },
    {
     "typ": "punkt",
     "text": "Kriegsmagier: Dein Zauberrettungswurf‑SG und dein Zauberangriffsbonus werden jeweils um 2 erhöht."
    },
    {
     "typ": "punkt",
     "text": "Magieresistenz: Du bist bei Rettungswürfen gegen Zauber und andere magische Effekte im Vorteil."
    },
    {
     "typ": "punkt",
     "text": "Rüstung: Wenn du keine Rüstung trägst, beträgt deine Basis‑Rüstungsklasse 15 plus deinen Geschicklichkeitsmodifikator."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This elegant garment is made from exquisite cloth and adorned with runes. You gain these benefits while wearing the robe."
    },
    {
     "typ": "punkt",
     "text": "Armor. If you aren’t wearing armor, your base Armor Class is 15 plus your Dexterity modifier."
    },
    {
     "typ": "punkt",
     "text": "Magic Resistance. You have Advantage on saving throws against spells and other magical effects."
    },
    {
     "typ": "punkt",
     "text": "War Mage. Your spell save DC and spell attack bonus each increase by 2."
    }
   ]
  }
 },
 {
  "id": "robe-of-useful-items",
  "name": {
   "de": "Robe der Nützlichen Dinge",
   "en": "Robe of Useful Items"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Robe ist mit Flicken in verschiedenen Formen und Farben bedeckt. Wenn du die Robe trägst, kannst du eine magische Aktion ausführen, um einen der Flicken abzureißen. Dieser wird dann zu dem, was er darstellt (Gegenstand oder Kreatur). Wenn der letzte Flicken entfernt wurde, ist die Robe ein gewöhnliches Kleidungsstück. Die Robe hat jeweils zwei der folgenden Flicken: • Blendlaterne (gefüllt und angezündet) • Dolch • Sack • Seil (aufgeschossen) • Spiegel • Stange Außerdem hat die Robe noch 4W4 weitere Flicken. Der SL wählt sie aus oder bestimmt sie zufällig, indem er anhand der folgenden Tabelle würfelt:"
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Flicken"
     ],
     "reihen": [
      [
       "1–8",
       "Beutel mit 100 GM"
      ],
      [
       "9–15",
       "Silberne Truhe (30 Zentimeter lang, 15 Zentimeter breit und hoch) im Wert von 500 GM"
      ],
      [
       "16–22",
       "Eisentür (bis zu drei Meter hoch und breit, auf einer Seite deiner Wahl verriegelt), die du in eine Öffnung in Reichweite stellen kannst – sie passt sich von selbst an die Öffnung an und befestigt sich dort"
      ],
      [
       "23–30",
       "10 Edelsteine im Wert von jeweils 100 GM"
      ],
      [
       "31–44",
       "Holzleiter (sieben Meter lang)"
      ],
      [
       "45–51",
       "Reitpferd mit Sattel"
      ],
      [
       "52–59",
       "Offene Grube (Würfel mit drei Metern Kantenlänge), die du im Abstand von bis zu drei Metern von dir auf dem Boden platzieren kannst"
      ],
      [
       "60–68",
       "4 Heiltränke"
      ],
      [
       "69–75",
       "Ruderboot (3,6 Meter lang)"
      ],
      [
       "76–83",
       "Zauberschriftrolle mit einem Zauber des 1., 2. oder 3. Grades (nach deiner Wahl)"
      ],
      [
       "84–90",
       "2 Doggen"
      ],
      [
       "91–96",
       "Fenster (0,6 Meter mal 1,2 Meter, bis zu 0,6 Meter dick), das du an einer senkrechen Oberfläche in Reichweite platzieren kannst"
      ],
      [
       "97–100",
       "Tragbarer Rammbock"
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This robe has cloth patches of various shapes and colors covering it. While wearing the robe, you can take a Magic action to detach one of the patches, causing it to become the object or creature it represents. Once the last patch is removed, the robe becomes an ordinary garment. The robe has two of each of the following patches: • Bullseye Lantern (filled and lit) • Dagger • Mirror • Pole • Rope (coiled) • Sack In addition, the robe has 4d4 other patches. The GM chooses the patches or determines them randomly by rolling on the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Patch"
     ],
     "reihen": [
      [
       "01–08",
       "Bag of 100 GP"
      ],
      [
       "09–15",
       "Silver coffer (1 foot long, 6 inches wide and deep) worth 500 GP"
      ],
      [
       "16–22",
       "Iron door (up to 10 feet wide and 10 feet high, barred on one side of your choice), which you can place in an opening you can reach; it conforms to fit the opening, attaching and hinging itself"
      ],
      [
       "23–30",
       "10 gems worth 100 GP each"
      ],
      [
       "31–44",
       "Wooden ladder (24 feet long)"
      ],
      [
       "45–51",
       "Riding Horse with a Riding Saddle"
      ],
      [
       "52–59",
       "Open pit (a 10-foot Cube), which you can place on the ground within 10 feet of yourself"
      ],
      [
       "60–68",
       "4 Potions of Healing"
      ],
      [
       "69–75",
       "Rowboat (12 feet long)"
      ],
      [
       "76–83",
       "Spell Scroll containing one spell of level 1, 2, or 3 (your choice)"
      ],
      [
       "84–90",
       "2 Mastiffs"
      ],
      [
       "91–96",
       "Window (2 feet by 4 feet, up to 2 feet deep), which you can place on a vertical surface you can reach"
      ],
      [
       "97–00",
       "Portable Ram"
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "rod-of-absorption",
  "name": {
   "de": "Zepter der Absorption",
   "en": "Rod of Absorption"
  },
  "kopfzeile": {
   "de": "Zepter, sehr selten (erfordert Einstimmung)",
   "en": "Rod, Very Rare (Requires Attunement)"
  },
  "kategorie": "zepter",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Zepter hältst, kannst du eine Reaktion ausführen, um einen Zauber zu absorbieren, der nur auf dich zielt und keinen Wirkungsbereich erzeugt. Der Effekt des absorbierten Zaubers wird aufgehoben, und die Energie des Zaubers – nicht aber der Zauber selbst – wird im Zepter gespeichert. Die Energie entspricht dem Grad, mit dem der Zauber gewirkt wurde. Ein aufgehobener Zauber verflüchtigt sich ohne Effekt, und alle Ressourcen, die zum Wirken verwendet wurden, sind vergeudet. Das Zepter kann im Verlauf seiner Existenz insgesamt bis zu 50 Zauberenergiegrade aufnehmen. Nach 50 Zauberenergiegraden kann es keine Energie mehr aufnehmen. Wenn du das Ziel eines Zaubers bist, den das Zepter nicht speichern kann, hat das Zepter keinen Effekt auf diesen Zauber. Wenn du auf das Zepter eingestimmt bist, weißt du, wie viele Zauberenergiegrade es seit seiner Erschaffung absorbiert hat und wie viele aktuell in ihm gespeichert sind. Wenn du ein Zauberwirker bist und das Zepter hältst, kannst du im Zepter gespeicherte Energie in Zauberplätze umwandeln, um Zauber zu wirken, die du vorbereitet hast oder kennst. Du kannst nur Zauberplätze bis zur Gradzahl deiner eigenen Zauberplätze und höchstens des 5. Grades erzeugen. Die gespeicherten Grade verwendest du statt deiner Zauberplätze. Ansonsten wirkst du die Zauber wie gewohnt. Beispiel: Du kannst drei im Zepter gespeicherte Zauberenergiegrade als Zauberplatz des 3. Grades verwenden. Wenn das Zepter gefunden wird, sind in ihm normalerweise 1W10 Zauberenergiegrade gespeichert. Kann das Zepter keine weitere Zauberenergie aufnehmen und hat keine Energie mehr in sich gespeichert, so wird es nichtmagisch."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this rod, you can take a Reaction to absorb a spell that is targeting only you and doesn’t create an area of effect. The absorbed spell’s effect is canceled, and the spell’s energy—not the spell itself—is stored in the rod. The energy has the same level as the spell when it was cast. A canceled spell dissipates with no effect, and any resources used to cast it are wasted. The rod can absorb and store up to 50 levels of energy over the course of its existence. Once the rod absorbs 50 levels of energy, it can’t absorb more. If you are targeted by a spell that the rod can’t store, the rod has no effect on that spell. When you become attuned to the rod, you know how many levels of energy the rod has absorbed over the course of its existence and how many levels of spell energy it currently has stored. If you are a spellcaster holding the rod, you can convert energy stored in it into spell slots to cast spells you have prepared or know. You can create spell slots only of a level equal to or lower than your own spell slots, up to a maximum of level 5. You use the stored levels in place of your slots but otherwise cast the spell as normal. For example, you can use 3 levels stored in the rod as a level 3 spell slot. A newly found rod typically has 1d10 levels of spell energy stored in it. A rod that can no longer absorb spell energy and has no energy remaining becomes nonmagical."
    }
   ]
  }
 },
 {
  "id": "rod-of-alertness",
  "name": {
   "de": "Zepter der Wachsamkeit",
   "en": "Rod of Alertness"
  },
  "kopfzeile": {
   "de": "Zepter, sehr selten (erfordert Einstimmung)",
   "en": "Rod, Very Rare (Requires Attunement)"
  },
  "kategorie": "zepter",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses Zepter hat die folgenden Eigenschaften:"
    },
    {
     "typ": "punkt",
     "text": "Wachsamkeit: Wenn du das Zepter hältst, bist du bei Weisheitswürfen (Wahrnehmung) und Initiativewürfen im Vorteil."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Wenn du das Zepter hältst, kannst du die folgenden Zauber damit wirken: • Gutes und Böses entdecken • Magie entdecken • Gift und Krankheit entdecken • Unsichtbares sehen Schützende Aura: Du kannst das Heft des Zepters als magische Aktion in den Boden rammen, woraufhin der Kopf des Zepters in einem Radius von 18 Metern helles Licht und in einem Radius von weiteren 18 Metern dämmriges Licht spendet. Im hellen Licht erhaltet du und deine Verbündeten einen Bonus von +1 auf die Rüstungsklasse und auf Rettungswürfe, und ihr könnt die Position von unsichtbaren feindlich gesinnten Kreaturen spüren, die sich ebenfalls in diesem hellen Licht befinden. Der Kopf des Zepters hört auf zu leuchten und der Effekt endet, wenn zehn Minuten vergangen sind oder wenn eine Kreatur eine magische Aktion ausführt, um das Zepter aus dem Boden zu ziehen. Wurde diese Eigenschaft verwendet, so kann sie erst im nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This rod has the following properties."
    },
    {
     "typ": "punkt",
     "text": "Alertness. While holding the rod, you have Advantage on Wisdom (Perception) checks and on Initiative rolls."
    },
    {
     "typ": "punkt",
     "text": "Spells. While holding the rod, you can cast the following spells from it: • Detect Evil and Good • Detect Magic • Detect Poison and Disease • See Invisibility Protective Aura. As a Magic action, you can plant the haft end of the rod in the ground, whereupon the rod’s head sheds Bright Light in a 60-foot radius and Dim Light for an additional 60 feet. While in that Bright Light, you and your allies gain a +1 bonus to Armor Class and saving throws and can sense the location of any Invisible creature that is also in the Bright Light. The rod’s head stops glowing and the effect ends after 10 minutes or when a creature takes a Magic action to pull the rod from the ground. Once used, this property can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "rod-of-lordly-might",
  "name": {
   "de": "Zepter der Herrschaftlichen Macht",
   "en": "Rod of Lordly Might"
  },
  "kopfzeile": {
   "de": "Zepter, legendär (erfordert Einstimmung)",
   "en": "Rod, Legendary (Requires Attunement)"
  },
  "kategorie": "zepter",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses Zepter hat einen verbreiterten Kopf und kann als magischer Streitkolben verwendet werden. Dieser gewährt einen Bonus von +3 auf Angriffs‑ und Schadenswürfe, die mit ihm ausgeführt werden. Das Zepter trägt sechs Knöpfe im Heft, die ihm verschiedene Eigenschaften verleihen. Es hat außerdem drei weitere Eigenschaften, die unten aufgeführt sind."
    },
    {
     "typ": "punkt",
     "text": "Knöpfe: Du kannst als Bonusaktion einen der folgenden Knöpfe drücken. Der Effekt eines Knopfs hält an, bis du einen anderen Knopf drückst (oder denselben Knopf erneut, wodurch das Zepter wieder seine normale Gestalt annimmt):"
    },
    {
     "typ": "stichpunkt",
     "text": "Knopf 1: Aus dem Ende gegenüber dem verbreiterten Zepterkopf wächst eine feurige Klinge. Die Flammen spenden in einem Radius von zwölf Metern helles Licht und in einem Radius von weiteren zwölf Metern dämmriges Licht. Die Klinge funktioniert als magisches Lang ‑ oder Kurzschwert (nach deiner Wahl) und bewirkt bei einem Treffer zusätzlich 2W6 Feuerschaden."
    },
    {
     "typ": "stichpunkt",
     "text": "Knopf 2: Der verbreiterte Kopf des Zepters wird schmaler, und zwei halbmondförmige Klingen erscheinen. Das Zepter verwandelt sich in eine magische Streitaxt mit einem Bonus von +3 auf Angriffs ‑ und Schadenswürfe, die du mit ihr ausführst."
    },
    {
     "typ": "stichpunkt",
     "text": "Knopf 3: Der verbreiterte Kopf des Zepters wird schmaler, eine Speerspitze erscheint am oberen Ende, und der Griff verlängert sich zu einem 1,8 Meter langen Heft. Das Zepter verwandelt sich in einen magischen Speer mit einem Bonus von +3 auf Angriffs ‑ und Schadenswürfe, die du mit ihm ausführst."
    },
    {
     "typ": "stichpunkt",
     "text": "Knopf 4: Das Zepter verwandelt sich in eine bis zu 15 Meter (nach deiner Wahl) lange Kletterstange, wobei die Knöpfe des Zepters in Reichweite bleiben. In Oberflächen, die hart wie Granit sind, wird die Stange mithilfe eines Dorns am unteren Ende und dreier Haken am oberen Ende verankert. Alle 30 Zentimeter erscheinen 7,5 Zentimeter breite waagerechte Sprossen, sodass eine Leiter entsteht. Die Stange kann bis zu 2.000 Kilogramm Last tragen. Wird sie mit mehr Gewicht belastet oder kann sie sich nicht solide verankern, so nimmt sie wieder ihre normale Form an."
    },
    {
     "typ": "stichpunkt",
     "text": "Knopf 5: Das Zepter verwandelt sich in einen tragbaren Rammbock. Dieser gewährt dem Anwender einen Bonus von +10 auf Stärkewürfe (Athletik), die ausgeführt werden, um Türen, Barrikaden und andere Barrieren zu durchbrechen."
    },
    {
     "typ": "stichpunkt",
     "text": "Knopf 6: Das Zepter nimmt seine normale Form an und weist zum magnetischen Norden. (Wenn diese Funktion des Zepters an einem Ort verwendet wird, der keinen magnetischen Norden hat, geschieht nichts.) Außerdem vermittelt es dir, wie weit du dich unter oder über dem Boden befindest."
    },
    {
     "typ": "punkt",
     "text": "Lähmen: Wenn du eine Kreatur bei einem Nahkampfangriff mit diesem Zepter triffst, kannst du sie zu einem SG‑17‑Konstitutionsrettungswurf zwingen. Misslingt der Wurf, so ist das Ziel eine Minute lang gelähmt. Das Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Effekt bei ihm. Wurde diese Eigenschaft verwendet, so kann sie erst im nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Leben entziehen: Wenn du eine Kreatur bei einem Nahkampfangriff mit diesem Zepter triffst, kannst du sie zu einem SG‑17‑Konstitutionsrettungswurf zwingen. Misslingt der Wurf, so erleidet das Ziel zusätzlich 4W6 nekrotischen Schaden, und du erhältst eine Anzahl von Trefferpunkten in Höhe der Hälfte des nekrotischen Schadens zurück. Wurde diese Eigenschaft verwendet, so kann sie erst im nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Terrorisieren: Wenn du das Zepter hältst, kannst du eine magische Aktion ausführen, um jede Kreatur im Abstand von bis zu neun Metern von dir, die du sehen kannst, zu einem SG‑17‑Weisheitsrettungswurf zu zwingen. Misslingt der Wurf, so ist das Ziel eine Minute lang verängstigt. Ein verängstigtes Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Effekt bei ihm. Wurde diese Eigenschaft verwendet, so kann sie erst im nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This rod has a flanged head, and it functions as a magic Mace that grants a +3 bonus to attack rolls and damage rolls made with it. The rod has properties associated with six different buttons that are set in a row along the haft. It has three other properties as well, detailed below."
    },
    {
     "typ": "punkt",
     "text": "Buttons. You can press one of the following buttons as a Bonus Action; a button’s effect lasts until you push a different button or until you push the same button again, which causes the rod to revert to its normal form:"
    },
    {
     "typ": "stichpunkt",
     "text": "Button 1. A fiery blade sprouts from the end opposite the rod’s flanged head. The flames shed Bright Light in a 40-foot radius and Dim Light for an additional 40 feet, and the blade functions as a magic Longsword or Shortsword (your choice) that deals an extra 2d6 Fire damage on a hit."
    },
    {
     "typ": "stichpunkt",
     "text": "Button 2. The rod’s flanged head folds down and two crescent-shaped blades spring out, transforming the rod into a magic Battleaxe that grants a +3 bonus to attack rolls and damage rolls made with it."
    },
    {
     "typ": "stichpunkt",
     "text": "Button 3. The rod’s flanged head folds down, a spear point springs from the rod’s tip, and the rod’s handle lengthens into a 6-foot haft, transforming the rod into a magic Spear that grants a +3 bonus to attack rolls and damage rolls made with it."
    },
    {
     "typ": "stichpunkt",
     "text": "Button 4. The rod transforms into a climbing pole up to 50 feet long (you specify the length), though the rod’s buttons remain within your reach. In surfaces as hard as granite, a spike at the bottom and three hooks at the top anchor the pole. Horizontal bars 3 inches long fold out from the sides, 1 foot apart, forming a ladder. The pole can bear up to 4,000 pounds. More weight or lack of solid anchoring causes the rod to revert to its normal form."
    },
    {
     "typ": "stichpunkt",
     "text": "Button 5. The rod transforms into a handheld battering ram and grants its user a +10 bonus to Strength (Athletics) checks made to break through doors, barricades, and other barriers."
    },
    {
     "typ": "stichpunkt",
     "text": "Button 6. The rod assumes or remains in its normal form and indicates magnetic north. (Nothing happens if this function of the rod is used in a location that has no magnetic north.) The rod also gives you knowledge of your approximate depth beneath the ground or your height above it."
    },
    {
     "typ": "punkt",
     "text": "Drain Life. When you hit a creature with a melee attack using the rod, you can force the target to make a DC 17 Constitution saving throw. On a failed save, the target takes an extra 4d6 Necrotic damage, and you regain a number of Hit Points equal to half that Necrotic damage. Once used, this property can’t be used again until the next dawn."
    },
    {
     "typ": "punkt",
     "text": "Paralyze. When you hit a creature with a melee attack using the rod, you can force the target to make a DC 17 Constitution saving throw. On a failed save, the target has the Paralyzed condition for 1 minute. The target repeats the save at the end of each of its turns, ending the effect on a success. Once used, this property can’t be used again until the next dawn."
    },
    {
     "typ": "punkt",
     "text": "Terrify. While holding the rod, you can take a Magic action to force each creature you can see within 30 feet of yourself to make a DC 17 Wisdom saving throw. On a failed save, a target has the Frightened condition for 1 minute. A Frightened target repeats the save at the end of each of its turns, ending the effect on itself on a success. Once used, this property can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "rod-of-resurrection",
  "name": {
   "de": "Zepter der Auferstehung",
   "en": "Rod of Resurrection"
  },
  "kopfzeile": {
   "de": "Zepter, legendär (erfordert Einstimmung)",
   "en": "Rod, Legendary (Requires Attunement)"
  },
  "kategorie": "zepter",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Das Zepter hat fünf Ladungen. Wenn du es hältst, kannst du einen der folgenden Zauber damit wirken: Heilung (verbraucht eine Ladung) oder Auferstehung (verbraucht fünf Ladungen). Das Zepter erhält täglich im Morgengrauen eine verbrauchte Ladung zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 verschwindet das Zepter in einem harmlosen gleißenden Ausbruch."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The rod has 5 charges. While you hold it, you can cast one of the following spells from it: Heal (expends 1 charge) or Resurrection (expends 5 charges). The rod regains 1 expended charge daily at dawn. If you expend the last charge, roll 1d20. On a 1, the rod disappears in a harmless burst of radiance."
    }
   ]
  }
 },
 {
  "id": "rod-of-rulership",
  "name": {
   "de": "Zepter der Herrschaft",
   "en": "Rod of Rulership"
  },
  "kopfzeile": {
   "de": "Zepter, selten (erfordert Einstimmung)",
   "en": "Rod, Rare (Requires Attunement)"
  },
  "kategorie": "zepter",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst eine magische Aktion ausführen, um das Zepter zu präsentieren und von jeder Kreatur deiner Wahl im Abstand von bis zu 36 Metern von dir, die du sehen kannst, Gehorsam zu verlangen. Jedes Ziel muss einen SG‑15‑Weisheitsrettungswurf bestehen, oder es ist acht Stunden lang bezaubert. Eine auf diese Art bezauberte Kreatur sieht dich als ihren vertrauenswürdigen Anführer. Wenn ihr von dir oder deinen Verbündeten Schaden zugefügt wird oder sie einen Befehl erhält, der ihrer Natur widerspricht, endet die Bezauberung bei ihr. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can take a Magic action to present the rod and command obedience from each creature of your choice that you can see within 120 feet of yourself. Each target must succeed on a DC 15 Wisdom saving throw or have the Charmed condition for 8 hours. While Charmed in this way, the creature regards you as its trusted leader. If harmed by you or your allies or commanded to do something contrary to its nature, a target ceases to be Charmed in this way. Once used, this property can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "rod-of-security",
  "name": {
   "de": "Zepter der Sicherheit",
   "en": "Rod of Security"
  },
  "kopfzeile": {
   "de": "Zepter, sehr selten",
   "en": "Rod, Very Rare"
  },
  "kategorie": "zepter",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du dieses Zepter hältst, kannst du eine magische Aktion ausführen, um es zu aktivieren. Das Zepter transportiert dann dich und bis zu 199 bereitwillige Kreaturen, die du sehen kannst, sofort auf eine Halbebene. Du bestimmst, welche Form die Halbebene hat. Sie könnte ein ruhiger Garten, eine quirlige Taverne, ein weitläufiger Palast, eine Tropeninsel, ein herrlicher Jahrmarkt oder was immer dir einfällt sein. Unabhängig von ihrer Art gibt es auf der Halbebene genügend Wasser und Nahrung für ihre Besucher, und die Umgebung kann diesen keinen Schaden zufügen. Ansonsten kann alles, womit interagiert werden kann, nur dort existieren. Beispiel: Wird dort eine Blume in einem Garten gepflückt, so verschwindet sie, sobald sie die Halbebene verlässt. Für jede auf der Halbebene verbrachte Stunde erhält ein Besucher Trefferpunkte zurück, als hätte er 1 Trefferpunktewürfel verbraucht. Außerdem altern Kreaturen dort nicht, obwohl die Zeit normal vergeht. Besucher können bis zu 200 Tage geteilt durch die Anzahl der anwesenden Kreaturen (abgerundet) auf der Halbebene verbringen. Wenn die Zeit abläuft oder du eine magische Aktion ausführst, um den Effekt zu beenden, gelangen alle Besucher wieder in den Bereich, die sie bei Aktivieren des Zepters besetzt hatten, oder in den nächstgelegenen freien Bereich. Wurde diese Eigenschaft verwendet, so kann sie erst nach zehn Tagen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this rod, you can take a Magic action to activate it. The rod then instantly transports you and up to 199 other willing creatures you can see to a demiplane. You choose the form the demiplane takes. It could be a tranquil garden, a cheery tavern, an immense palace, a tropical island, a fantastic carnival, or whatever else you can imagine. Regardless of its nature, the demiplane contains enough water and food to sustain its visitors, and the demiplane’s environment can’t harm its occupants. Everything else that can be interacted with there can exist only there. For example, a flower picked from a garden there disappears if it is taken outside the demiplane. For each hour spent in the demiplane, a visitor regains Hit Points as if it had spent 1 Hit Point Die. Also, creatures don’t age while there, although time passes normally. Visitors can remain there for up to 200 days divided by the number of creatures present (round down). When the time runs out or you take a Magic action to end the effect, all visitors reappear in the location they occupied when you activated the rod or an unoccupied space nearest that location. Once used, this property can’t be used again until 10 days have passed."
    }
   ]
  }
 },
 {
  "id": "rope-of-climbing",
  "name": {
   "de": "Seil des Kletterns",
   "en": "Rope of Climbing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses 18 Meter lange Seil kann bis zu 1.500 Kilogramm tragen. Wenn du ein Ende des Seils hältst, kannst du eine magische Aktion ausführen, dem anderen Seilende zu befehlen, sich zu beleben und auf ein Ziel deiner Wahl im Radius der Seillänge zuzubewegen. Wenn du ihm in deinem Zug den Befehl gibst, bewegt sich jenes Seilende drei Meter weit. In jedem deiner nächsten Züge bewegt es sich jeweils weitere drei Meter weit, bis es sein Ziel erreicht oder du ihm anzuhalten befiehlst. Du kannst dem Seil auch befehlen, sich sicher an einem Gegenstand zu befestigen oder wieder zu lösen, sich zu ver‑ oder zu entknoten oder sich aufzurollen, damit du es tragen kannst. Wenn du dem Seil befiehlst, sich zu verknoten, erscheinen große Knoten in Abständen von 30 Zentimetern im Seil. Verknotet ist das Seil nur 15 Meter lang, und du bist bei Attributswürfen im Vorteil, die du ausführst, um an ihm hochzuklettern. Das Seil besitzt eine RK von 20, 20 TP und ist gegen Gift‑ und psychischen Schaden immun. Es erhält alle fünf Minuten 1 Trefferpunkt zurück, sofern es mindestens 1 Trefferpunkt hat. Wenn die Trefferpunkte des Seils auf 0 sinken, ist das Seil zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This 60-foot length of rope can hold up to 3,000 pounds. While holding one end of the rope, you can take a Magic action to command the other end of the rope to animate and move toward a destination you choose, up to the rope’s length away from you. That end moves 10 feet on your turn when you first command it and 10 feet at the start of each of your subsequent turns until reaching its destination or until you tell it to stop. You can also tell the rope to fasten itself securely to an object or to unfasten itself, to knot or unknot itself, or to coil itself for carrying. If you tell the rope to knot, large knots appear at 1-foot intervals along the rope. While knotted, the rope shortens to a 50-foot length and grants Advantage on ability checks made to climb using the rope. The rope has AC 20, HP 20, and Immunity to Poison and Psychic damage. It regains 1 Hit Point every 5 minutes as long as it has at least 1 Hit Point. If the rope drops to 0 Hit Points, it is destroyed."
    }
   ]
  }
 },
 {
  "id": "rope-of-entanglement",
  "name": {
   "de": "Fesselseil",
   "en": "Rope of Entanglement"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses Seil ist neun Meter lang. Wenn du ein Ende des Seils hältst, kannst du eine magische Aktion ausführen, um dem anderen Seilende zu befehlen, auf eine Kreatur im Abstand von bis zu sechs Metern von dir, die du sehen kannst, zuzuschießen und sie zu fesseln. Das Ziel muss einen SG‑15‑Geschicklichkeitsrettungswurf bestehen, oder wird festgesetzt. Du kannst das Ziel freigeben, indem du dein Seilende loslässt (dann rollt das Seil sich im Bereich des Ziels auf) oder eine Bonusaktion verwendest, um den Befehl zu wiederholen (dann rollt das Seil sich in deiner Hand auf). Ein vom Seil festgesetztes Ziel kann mit einer Aktion nach seiner Wahl entweder einen SG‑15‑Stärkewurf (Athletik) oder einen SG‑15‑Geschicklichkeitswurf (Akrobatik) ausführen. Bei einem Erfolg ist das Ziel nicht mehr vom Seil festgesetzt. Falls du das Seil in diesem Moment noch immer hältst, kannst du eine Reaktion ausführen, um ihm zu befehlen, sich in deiner Hand aufzurollen. Anderenfalls rollt es sich im Bereich des Ziels auf. Das Seil besitzt eine RK von 20, 20 TP und ist gegen Gift‑ und psychischen Schaden immun. Es erhält alle fünf Minuten 1 Trefferpunkt zurück, sofern es mindestens 1 Trefferpunkt hat. Wenn die Trefferpunkte des Seils auf 0 sinken, ist das Seil zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This rope is 30 feet long. While holding one end of the rope, you can take a Magic action to command the other end to dart forward and entangle one creature you can see within 20 feet of yourself. The target must succeed on a DC 15 Dexterity saving throw or have the Restrained condition. You can release the target by letting go of your end of the rope (causing the rope to coil up in the target’s space) or by using a Bonus Action to repeat the command (causing the rope to coil up in your hand). A target Restrained by the rope can take an action to make its choice of a DC 15 Strength (Athletics) or Dexterity (Acrobatics) check. On a successful check, the target is no longer Restrained by the rope. If you’re still holding onto the rope when a target escapes from it, you can take a Reaction to command the rope to coil up in your hand; otherwise, the rope coils up in the target’s space. The rope has AC 20, HP 20, and Immunity to Poison and Psychic damage. It regains 1 Hit Point every 5 minutes as long as it has at least 1 Hit Point. If the rope drops to 0 Hit Points, it is destroyed."
    }
   ]
  }
 },
 {
  "id": "scarab-of-protection",
  "name": {
   "de": "Skarabäus des Schutzes",
   "en": "Scarab of Protection"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung)",
   "en": "Wondrous Item, Legendary (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses käferförmige Medaillon gewährt dir drei Vorzüge, solange du es mit dir führst:"
    },
    {
     "typ": "punkt",
     "text": "Erhaltung: Der Skarabäus hat zwölf Ladungen. Wenn du bei einem Rettungswurf gegen einen Nekromantiezauber oder einen schädlichen Effekt von einem Untoten scheiterst, kannst du deine Reaktion ausführen und eine Ladung verbrauchen, um den Misserfolg zu einem Erfolg zu machen. Wenn die letzte Ladung des Skarabäus verbraucht wurde, zerfällt er zu Staub und ist damit zerstört."
    },
    {
     "typ": "punkt",
     "text": "Verteidigung: Du erhältst einen Bonus von +1 auf deine Rüstungsklasse."
    },
    {
     "typ": "punkt",
     "text": "Zauberresistenz: Du bist bei Rettungswürfen gegen Zauber im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This beetle-shaped medallion provides three benefits while it is on your person."
    },
    {
     "typ": "punkt",
     "text": "Defense. You gain a +1 bonus to Armor Class."
    },
    {
     "typ": "punkt",
     "text": "Preservation. The scarab has 12 charges. If you fail a saving throw against a Necromancy spell or a harmful effect originating from an Undead, you can take a Reaction to expend 1 charge and turn the failed save into a successful one. The scarab crumbles into powder and is destroyed when its last charge is expended."
    },
    {
     "typ": "punkt",
     "text": "Spell Resistance. You have Advantage on saving throws against spells."
    }
   ]
  }
 },
 {
  "id": "scimitar-of-speed",
  "name": {
   "de": "Krummsäbel der Geschwindigkeit",
   "en": "Scimitar of Speed"
  },
  "kopfzeile": {
   "de": "Waffe (Krummsäbel), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Scimitar), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +2 auf Angriffs‑ und Schadenswürfe mit dieser magischen Waffe. Außerdem kannst du in jedem Zug einen Angriff mit ihr als Bonusaktion ausführen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +2 bonus to attack rolls and damage rolls made with this magic weapon. In addition, you can make one attack with it as a Bonus Action on each of your turns."
    }
   ]
  }
 },
 {
  "id": "sending-stones",
  "name": {
   "de": "Steine der Verständigung",
   "en": "Sending Stones"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Steine der Verständigung gibt es in Paaren, die einander gleichen, sodass ihre Zusammengehörigkeit gut erkennbar ist. Wenn du einen der Steine berührst, kannst du den Zauber Verständigung damit wirken. Das Ziel ist der Träger des anderen Steins. Wenn der andere Stein keinen Träger hat, erfährst du dies, sobald du den Stein berührst, sodass du den Zauber nicht wirkst. Wurde mit einem der Steine Verständigung gewirkt, so können die Steine erst ab dem nächsten Morgengrauen erneut verwendet werden. Wird ein Stein des Paars zerstört, so wird der andere nichtmagisch."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Sending Stones come in pairs, with each stone carved to match the other so the pairing is easily recognized. While you touch one stone, you can cast Sending from it. The target is the bearer of the other stone. If no creature bears the other stone, you know that fact as soon as you use the stone, and you don’t cast the spell. Once Sending is cast using either stone, the stones can’t be used again until the next dawn. If one of the stones in a pair is destroyed, the other one becomes nonmagical."
    }
   ]
  }
 },
 {
  "id": "sentinel-shield",
  "name": {
   "de": "Wächterschild",
   "en": "Sentinel Shield"
  },
  "kopfzeile": {
   "de": "Rüstung (Schild), ungewöhnlich",
   "en": "Armor (Shield), Uncommon"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Schild hältst, bist du bei Initiativewürfen und Weisheitswürfen (Wahrnehmung) im Vorteil. Der Schild trägt ein Auge als Symbol."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this Shield, you have Advantage on Initiative rolls and Wisdom (Perception) checks. The Shield is emblazoned with a symbol of an eye."
    }
   ]
  }
 },
 {
  "id": "shield-1-2-or-3",
  "name": {
   "de": "Schild +1, +2 oder +3",
   "en": "Shield, +1, +2, or +3"
  },
  "kopfzeile": {
   "de": "Rüstung (Schild), ungewöhnlich (+1), selten (+2) oder sehr selten (+3)",
   "en": "Armor (Shield), Uncommon (+1), Rare (+2), or Very Rare (+3)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "uncommon",
   "rare",
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Schild hältst, hast du zuzüglich zu dessen normalem Bonus noch einen weiteren Bonus auf deine Rüstungsklasse, die von der Seltenheit des Schildes abhängt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this Shield, you have a bonus to Armor Class determined by the Shield’s rarity, in addition to the Shield’s normal bonus to AC."
    }
   ]
  }
 },
 {
  "id": "shield-of-missile-attraction",
  "name": {
   "de": "Schild der Geschossanziehung",
   "en": "Shield of Missile Attraction"
  },
  "kopfzeile": {
   "de": "Rüstung (Schild), selten (erfordert Einstimmung)",
   "en": "Armor (Shield), Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Schild hältst, bist du gegen Schaden durch Fernkampfwaffenangriffe resistent."
    },
    {
     "typ": "punkt",
     "text": "Fluch: Dieser Schild ist verflucht. Durch Einstimmen auf ihn wirst du verflucht, bis der Zauber Fluch brechen oder ähnlicher Magie auf dich gewirkt wird. Das Ablegen des Schildes beendet den Fluch nicht. Wann immer ein Fernkampfwaffenangriff auf eine Kreatur im Abstand von bis zu drei Metern von dir ausgeführt wird, bewirkt der Fluch, dass du stattdessen zum Ziel wirst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this Shield, you have Resistance to damage from attacks made with Ranged weapons."
    },
    {
     "typ": "punkt",
     "text": "Curse. This Shield is cursed. Attuning to it curses you until you are targeted by a Remove Curse spell or similar magic. Removing the Shield fails to end the curse on you. Whenever an attack with a Ranged weapon targets a creature within 10 feet of you, the curse causes you to become the target instead."
    }
   ]
  }
 },
 {
  "id": "shield-of-the-cavalier",
  "name": {
   "de": "Schild des Kavaliers",
   "en": "Shield of the Cavalier"
  },
  "kopfzeile": {
   "de": "Rüstung (Schild), sehr selten (erfordert Einstimmung)",
   "en": "Armor (Shield), Very Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Schild hältst, erhältst du einen Bonus von +2 auf deine Rüstungsklasse. Dieser Bonus des Schildes wirkt zusätzlich zu seinem normalen Bonus auf die RK. Der Schild hat folgende zusätzliche Eigenschaften, die du verwenden kannst, wenn du ihn hältst:"
    },
    {
     "typ": "punkt",
     "text": "Kraftvoller Stoß: Wenn du die Angriffsaktion ausführst, kannst du einen der Angriffswürfe mit dem Schild gegen ein Ziel im Abstand von bis zu 1,5 Metern von dir ausführen. Wende deinen Übungsbonus und deinen Stärkemodifikator auf den Angriffswurf an. Bei einem Treffer fügt der Schild dem Ziel Energieschaden in Höhe von 2W6+2 plus deinem Stärkemodifikator zu. Wenn das Ziel eine Kreatur ist, kannst du es bis zu drei Meter weit direkt von dir wegstoßen. Wenn die Kreatur höchstens deine Größenkategorie hat, kannst du es außerdem umstoßen, sodass es den Zustand Liegend hat."
    },
    {
     "typ": "punkt",
     "text": "Schützende Barriere: Wenn du oder ein Verbündeter im Abstand von bis zu 1,5 Metern von dir, den du sehen kannst, Ziel eines Angriffs ist oder einen Rettungswurf gegen einen Wirkungsbereich ausführt, kannst du den Schild verwenden, um eine unbewegliche Ausströmung von 1,5 Metern zu erzeugen, die von dir ausgeht. Wenn die Ausströmung erscheint, werden alle Kreaturen oder Gegenstände, die sich nur teilweise darin befinden, in die nächstgelegenen freien Bereiche außerhalb davon geschoben. Der auslösende Angriff oder Wirkungsbereich hat keinen Effekt auf Kreaturen und Gegenstände innerhalb der Ausströmung. Diese bleibt bestehen, bis eine Minute vergangen ist oder deine Konzentration unterbrochen wird. Nichts kann in die Ausströmung hinein ‑ oder aus ihr hinausgelangen. Kreaturen und Gegenstände darin können weder durch Angriffe noch durch Effekte von außerhalb Schaden erleiden. Gleichermaßen können Kreaturen in der Ausströmung keinen Schaden außerhalb davon bewirken. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this Shield, you have a +2 bonus to Armor Class. This bonus is in addition to the Shield’s normal bonus to AC. The Shield has the following additional properties that you can use while holding it."
    },
    {
     "typ": "punkt",
     "text": "Forceful Bash. When you take the Attack action, you can make one of the attack rolls using the Shield against a target within 5 feet of yourself. Apply your Proficiency Bonus and Strength modifier to the attack roll. On a hit, the Shield deals Force damage to the target equal to 2d6 + 2 plus your Strength modifier, and if the target is a creature, you can push it up to 10 feet directly away from yourself. If the creature is your size or smaller, you can also knock it down, giving it the Prone condition."
    },
    {
     "typ": "punkt",
     "text": "Protective Field. As a Reaction, when you or an ally you can see within 5 feet of you is targeted by an attack or makes a saving throw against an area of effect, you can use the Shield to create an immobile 5-foot Emanation originating from you. When the Emanation appears, any creatures or objects not fully contained within it are pushed into the nearest unoccupied spaces outside it. The attack or area of effect that triggered the Reaction has no effect on creatures and objects inside the Emanation, which lasts as long as you maintain Concentration, up to 1 minute. Nothing can pass into or out of the Emanation. A creature or object inside the Emanation can’t be damaged by attacks or effects originating from outside, nor can a creature inside the Emanation damage anything outside it. Once this property is used, it can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "slippers-of-spider-climbing",
  "name": {
   "de": "Schuhe des Spinnenkletterns",
   "en": "Slippers of Spider Climbing"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diese leichten Schuhe trägst, kannst du dich über senkrechte Oberflächen sowie an Decken entlang bewegen, wobei du die Hände frei hast. Du hast eine Kletterbewegungsrate in Höhe deiner Bewegungsrate. Allerdings erlauben die Schuhe es dir nicht, dich normal auf rutschigen (beispielsweise mit Eis oder Öl bedeckten) Oberflächen zu bewegen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you wear these light shoes, you can move up, down, and across vertical surfaces and along ceilings, while leaving your hands free. You have a Climb Speed equal to your Speed. However, the slippers don’t allow you to move this way on a slippery surface, such as one covered by ice or oil."
    }
   ]
  }
 },
 {
  "id": "sovereign-glue",
  "name": {
   "de": "Ewiger Leim",
   "en": "Sovereign Glue"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese zähflüssige weiße Substanz kann zwei Gegenstände dauerhaft miteinander verkleben. Sie muss in einem Behälter aufbewahrt werden, der innen mit Öl der Glätte bestrichen wurde. Wenn ein Behälter mit Ewigem Leim gefunden wird, enthält er (1W6+1) × 30 Milliliter Leim. 30 Milliliter Leim reichen aus, um ein Quadrat mit 0,3 Metern Kantenlänge zu bedecken. Es erfordert eine Verwenden‑Aktion, 30 Milliliter Ewigen Leim anzuwenden. Der Leim bindet nach einer Minute ab. Danach kann die Klebeverbindung nur mit Universellem Lösungsmittel, mit Öl der Körperlosigkeit oder mit dem Zauber Wunsch gelöst werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This viscous, milky-white substance can form a permanent adhesive bond between any two objects. It must be stored in a jar or flask that has been coated inside with Oil of Slipperiness. When found, a container contains 1d6 + 1 ounces. One ounce of the glue can cover a 1-foot square surface. Applying an ounce of Sovereign Glue takes a Utilize action, and the applied glue takes 1 minute to set. Once it has done so, the bond it creates can be broken only by the application of Universal Solvent or Oil of Etherealness, or with a Wish spell."
    }
   ]
  }
 },
 {
  "id": "spell-scroll",
  "name": {
   "de": "Zauberschriftrolle",
   "en": "Spell Scroll"
  },
  "kopfzeile": {
   "de": "Schriftrolle, Seltenheit variiert",
   "en": "Scroll, Rarity Varies"
  },
  "kategorie": "schriftrolle",
  "seltenheiten": [
   "varies"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Zauberschriftrolle trägt die Worte eines einzelnen Zaubers in mystischen Zeichen. Wenn sich der Zauber auf deiner Zauberliste befindet, kannst du die Schriftrolle verlesen und den Zauber wirken, ohne Materialkomponenten zu benötigen. Anderenfalls ist die Schriftrolle für dich unleserlich. Wird der Zauber gewirkt, indem die Schriftrolle verlesen wird, so ist der normale Zeitaufwand zum Wirken erforderlich. Sobald der Zauber gewirkt wurde, zerfällt die Schriftrolle zu Staub. Wird das Wirken des Zaubers unterbrochen, so ist die Schriftrolle nicht vergeudet. Wenn sich der Zauber auf deiner Zauberliste befindet, jedoch einen höheren Grad aufweist, als du normalerweise wirken kannst, musst du einen Attributswurf mit deinem Attribut zum Zauberwirken bestehen, um den Zauber erfolgreich zu wirken. Der SG beträgt 10 plus Grad des Zaubers. Misslingt der Wurf, so verschwindet der Zauber ohne weiteren Effekt von der Schriftrolle. Der Grad des Zaubers auf der Schriftrolle bestimmt den Rettungswurf‑SG und den Angriffsbonus des Zaubers sowie die Seltenheit der Schriftrolle wie in der folgenden Tabelle gezeigt."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zaubergrad",
      "Seltenheit",
      "Rettungswurf-SG",
      "Angriffsbonus"
     ],
     "reihen": [
      [
       "Zaubertrick",
       "Gewöhnlich",
       "13",
       "+5"
      ],
      [
       "1",
       "Gewöhnlich",
       "13",
       "+5"
      ],
      [
       "2",
       "Ungewöhnlich",
       "13",
       "+5"
      ],
      [
       "3",
       "Ungewöhnlich",
       "15",
       "+7"
      ],
      [
       "4",
       "Selten",
       "15",
       "+7"
      ],
      [
       "5",
       "Selten",
       "17",
       "+9"
      ],
      [
       "6",
       "Sehr selten",
       "17",
       "+9"
      ],
      [
       "7",
       "Sehr selten",
       "18",
       "+10"
      ],
      [
       "8",
       "Sehr selten",
       "18",
       "+10"
      ],
      [
       "9",
       "Legendär",
       "19",
       "+11"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Eine Schriftrolle in ein Zauberbuch kopieren: Ein Magierzauber auf einer Zauberschriftrolle kann in ein Zauberbuch kopiert werden. Dazu muss der kopierende Charakter einen Intelligenzwurf (Arkane Kunde) bestehen, wobei der SG gleich 10 plus Zaubergrad ist. Bei einem Erfolg wird der Zauber kopiert. Unabhängig davon, ob der Wurf gelingt, wird die Zauberschriftrolle zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Spell Scroll bears the words of a single spell, written in a mystical cipher. If the spell is on your spell list, you can read the scroll and cast its spell without Material components. Otherwise, the scroll is unintelligible. Casting the spell by reading the scroll requires the spell’s normal casting time. Once the spell is cast, the scroll crumbles to dust. If the casting is interrupted, the scroll isn’t lost. If the spell is on your spell list but of a higher level than you can normally cast, you make an ability check using your spellcasting ability to determine whether you cast the spell. The DC equals 10 plus the spell’s level. On a failed check, the spell disappears from the scroll with no other effect. The level of the spell on the scroll determines the spell’s saving throw DC and attack bonus, as well as the scroll’s rarity, as shown in the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell Level",
      "Rarity",
      "Save DC",
      "Attack Bonus"
     ],
     "reihen": [
      [
       "Cantrip",
       "Common",
       "13",
       "+5"
      ],
      [
       "1",
       "Common",
       "13",
       "+5"
      ],
      [
       "2",
       "Uncommon",
       "13",
       "+5"
      ],
      [
       "3",
       "Uncommon",
       "15",
       "+7"
      ],
      [
       "4",
       "Rare",
       "15",
       "+7"
      ],
      [
       "5",
       "Rare",
       "17",
       "+9"
      ],
      [
       "6",
       "Very Rare",
       "17",
       "+9"
      ],
      [
       "7",
       "Very Rare",
       "18",
       "+10"
      ],
      [
       "8",
       "Very Rare",
       "18",
       "+10"
      ],
      [
       "9",
       "Legendary",
       "19",
       "+11"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Copying a Scroll into a Spellbook. A Wizard spell on a Spell Scroll can be copied into a spellbook. When a spell is copied in this way, the copier must succeed on an Intelligence (Arcana) check with a DC equal to 10 plus the spell’s level. On a successful check, the spell is copied. Whether the check succeeds or fails, the Spell Scroll is destroyed."
    }
   ]
  }
 },
 {
  "id": "spellguard-shield",
  "name": {
   "de": "Zauberabwehrschild",
   "en": "Spellguard Shield"
  },
  "kopfzeile": {
   "de": "Rüstung (Schild), sehr selten (erfordert Einstimmung)",
   "en": "Armor (Shield), Very Rare (Requires Attunement)"
  },
  "kategorie": "ruestung",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Schild hältst, bist du bei Rettungswürfen gegen Zauber und andere magische Effekte im Vorteil, und Zauberangriffswürfe gegen dich sind im Nachteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this Shield, you have Advantage on saving throws against spells and other magical effects, and spell attack rolls have Disadvantage against you."
    }
   ]
  }
 },
 {
  "id": "sphere-of-annihilation",
  "name": {
   "de": "Kugel der Auslöschung",
   "en": "Sphere of Annihilation"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese schwarze Kugel hat einen Durchmesser von 0,6 Metern. Sie ist ein Loch im Multiversum, das im Raum schwebt und durch ein umgebendes magisches Feld stabilisiert wird. Die Kugel löscht alle Materie aus, die sie durchdringt oder die von ihr durchdrungen wird. Die einzige Ausnahme sind Artefakte. Sofern sie nicht anfällig für Schaden durch eine Kugel der Auslöschung sind, passieren sie die Kugel, ohne Schaden zu nehmen. Alles andere, was von der Kugel berührt, jedoch nicht vollständig von ihr umschlossen und damit ausgelöscht wird, erleidet 8W10 Energieschaden."
    },
    {
     "typ": "punkt",
     "text": "Die Kugel kontrollieren: Eine Kugel der Auslöschung ist ortsfest, bis jemand die Kontrolle über sie übernimmt. Wenn du dich im Abstand von bis zu 18 Metern von einer solchen Kugel befindest, kannst du eine magische Aktion und einen SG‑25‑Intelligenzwurf (Arkane Kunde) ausführen. Bei einem Erfolg kontrollierst du die Kugel bis zum Beginn deines nächsten Zugs. Wenn sie unter der Kontrolle einer anderen Kreatur stand, verliert diese die Kontrolle über die Kugel. Misslingt der Wurf, so bewegt die Kugel sich drei Meter weit in gerader Linie auf dich zu. Wenn du die Kugel kontrollierst, kannst du eine Bonusaktion ausführen, um sie in eine Richtung deiner Wahl zu bewegen. Dabei kann sie eine Strecke in Höhe des 1,5‑Fachen deines Intelligenzmodifikators in Metern (mindestens 1,5 Meter) zurücklegen. Eine Kreatur, in deren Bereich die Kugel gelangt, muss einen SG‑19‑Geschicklichkeitsrettungswurf bestehen, oder sie wird von der Kugel berührt und erleidet 8W10 Energieschaden. Wenn die Trefferpunkte der Kreatur durch diesen Schaden auf 0 sinken, wird die Kreatur ausgelöscht. Ihre Habseligkeiten bleiben zurück, jedoch keinerlei sterbliche Überreste."
    },
    {
     "typ": "punkt",
     "text": "Interaktionen mit der Kugel: Wenn die Sphäre ein Ebenenportal (wie das durch den Zauber Tor) oder einen extradimensionalen Raum (wie den in einem Tragbaren Loch) berührt, entscheidet der SL mithilfe der folgenden Tabelle, was passiert."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W100",
      "Ergebnis"
     ],
     "reihen": [
      [
       "1–50",
       "Die Kugel wird zerstört."
      ],
      [
       "51–85",
       "Die Kugel bewegt sich durch das Portal oder in den extradimensionalen Raum."
      ],
      [
       "86–100",
       "Ein Riss im Raum transportiert die Kugel sowie alle Kreaturen und Gegenstände im Abstand von bis zu 54 Metern von ihr auf eine zufällige Existenzebene."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This 2-foot-diameter black sphere is a hole in the multiverse, hovering in space and stabilized by a magical field surrounding it. The sphere obliterates all matter it passes through and all matter that passes through it. Artifacts are the exception. Unless an Artifact is susceptible to damage from a Sphere of Annihilation, it passes through the sphere unscathed. Anything else that touches the sphere but isn’t wholly engulfed and obliterated by it takes 8d10 Force damage."
    },
    {
     "typ": "punkt",
     "text": "Controlling the Sphere. A Sphere of Annihilation is stationary until someone takes control of it. If you are within 60 feet of a sphere, you can take a Magic action to make a DC 25 Intelligence (Arcana) check. On a successful check, you control the sphere until the start of your next turn, and if it was under another creature’s control, that creature loses control of the sphere. On a failed check, the sphere moves 10 feet toward you in a straight line. While in control of the sphere, you can take a Bonus Action to cause it to move in one direction of your choice, up to a number of feet equal to 5 times your Intelligence modifier (minimum 5 feet). Any creature whose space the sphere enters must succeed on a DC 19 Dexterity saving throw or be touched by it, taking 8d10 Force damage. A creature reduced to 0 Hit Points by this damage is obliterated, leaving its possessions behind but no other physical remains."
    },
    {
     "typ": "punkt",
     "text": "Sphere Interactions. If the sphere comes into contact with a planar portal (such as that created by the Gate spell) or an extradimensional space (such as that within a Portable Hole), the GM determines randomly what happens using the following table."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d100",
      "Result"
     ],
     "reihen": [
      [
       "01–50",
       "The sphere is destroyed."
      ],
      [
       "51–85",
       "The sphere moves through the portal or into the extradimensional space."
      ],
      [
       "86–00",
       "A spatial rift sends the sphere and each creature and object within 180 feet of the sphere to a random plane of existence."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "staff-of-charming",
  "name": {
   "de": "Stab der Bezauberung",
   "en": "Staff of Charming"
  },
  "kopfzeile": {
   "de": "Stab, selten (erfordert Einstimmung durch einen Barden, Druiden, Hexenmeister, Kleriker, Magier oder Zauberer)",
   "en": "Staff, Rare (Requires Attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab hat zehn Ladungen. Wenn du den Stab hältst, kannst du beliebige seiner Eigenschaften verwenden:"
    },
    {
     "typ": "stichpunkt",
     "text": "Verzauberung reflektieren: Wenn du einen Rettungs wurf gegen Verzauberungsmagie bestehst, die nur auf dich zielt, kannst du eine Reaktion ausführen und eine Ladung verbrauchen, um den Zauber auf seinen Zauberwirker zu richten, als hättest du den Zauber gewirkt."
    },
    {
     "typ": "stichpunkt",
     "text": "Verzauberung widerstehen: Wenn du bei einem Rettungswurf gegen einen Verzauberungszauber scheiterst, der nur auf dich zielt, kannst du den misslungenen Wurf zu einem erfolgreichen machen. Wurde diese Eigenschaft des Stabs verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "stichpunkt",
     "text": "Zauber wirken: Du kannst eine Ladung verbrauchen, um einen der Zauber Befehl, Person bezaubern oder Sprachen verstehen mit ihm zu wirken (verwende deinen Zauberrettungswurf‑SG)."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 1W8+2 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Stab zu Staub und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff has 10 charges. While holding the staff, you can use any of its properties:"
    },
    {
     "typ": "stichpunkt",
     "text": "Cast Spell. You can expend 1 of the staff’s charges to cast Charm Person, Command, or Comprehend Languages from it using your spell save DC."
    },
    {
     "typ": "stichpunkt",
     "text": "Reflect Enchantment. If you succeed on a saving throw against an Enchantment spell that targets only you, you can take a Reaction to expend 1 charge from the staff and turn the spell back on its caster as if you had cast the spell."
    },
    {
     "typ": "stichpunkt",
     "text": "Resist Enchantment. If you fail a saving throw against an Enchantment spell that targets only you, you can turn your failed save into a successful one. You can’t use this property of the staff again until the next dawn."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 1d8 + 2 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff crumbles to dust and is destroyed."
    }
   ]
  }
 },
 {
  "id": "staff-of-fire",
  "name": {
   "de": "Stab des Feuers",
   "en": "Staff of Fire"
  },
  "kopfzeile": {
   "de": "Stab, sehr selten (erfordert Einstimmung durch einen Druiden, Hexenmeister, Magier oder Zauberer)",
   "en": "Staff, Very Rare (Requires Attunement by a Druid, Sorcerer, Warlock, or Wizard)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Stab hältst, bist du gegen Feuerschaden resistent."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Der Stab hat zehn Ladungen. Wenn du ihn hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (verwende deinen Zauberrettungswurf‑SG). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Brennende Hände",
       "1"
      ],
      [
       "Feuerball",
       "3"
      ],
      [
       "Feuerwand",
       "4"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 1W6+4 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Stab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have Resistance to Fire damage while you hold this staff."
    },
    {
     "typ": "punkt",
     "text": "Spells. The staff has 10 charges. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Burning Hands",
       "1"
      ],
      [
       "Fireball",
       "3"
      ],
      [
       "Wall of Fire",
       "4"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff crumbles into cinders and is destroyed."
    }
   ]
  }
 },
 {
  "id": "staff-of-frost",
  "name": {
   "de": "Stab des Frosts",
   "en": "Staff of Frost"
  },
  "kopfzeile": {
   "de": "Stab, sehr selten (erfordert Einstimmung durch einen Druiden, Hexenmeister, Magier oder Zauberer)",
   "en": "Staff, Very Rare (Requires Attunement by a Druid, Sorcerer, Warlock, or Wizard)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Stab hältst, bist du gegen Kälteschaden resistent."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Der Stab hat zehn Ladungen. Wenn du ihn hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (verwende deinen Zauberrettungswurf‑SG). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Eissturm",
       "4"
      ],
      [
       "Eiswand",
       "4"
      ],
      [
       "Kältekegel",
       "5"
      ],
      [
       "Nebelwolke",
       "1"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 1W6+4 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 wird der Stab zu Wasser und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have Resistance to Cold damage while you hold this staff."
    },
    {
     "typ": "punkt",
     "text": "Spells. The staff has 10 charges. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Cone of Cold",
       "5"
      ],
      [
       "Fog Cloud",
       "1"
      ],
      [
       "Ice Storm",
       "4"
      ],
      [
       "Wall of Ice",
       "4"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff turns to water and is destroyed."
    }
   ]
  }
 },
 {
  "id": "staff-of-healing",
  "name": {
   "de": "Stab der Heilung",
   "en": "Staff of Healing"
  },
  "kopfzeile": {
   "de": "Stab, selten (erfordert Einstimmung durch einen Barden, Druiden oder Kleriker)",
   "en": "Staff, Rare (Requires Attunement by a Bard, Cleric, or Druid)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab hat zehn Ladungen. Wenn du ihn hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (verwende deinen Zauberwirken‑Attributsmodifikator). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Massen-Wunden heilen",
       "5"
      ],
      [
       "Schwache Genesung",
       "2"
      ],
      [
       "Wunden heilen",
       "1 Ladung pro Zaubergrad (max. 4 bei einem Zauber des 4. Grades)"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 1W6+4 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 verschwindet der Stab mit einem Lichtblitz und ist für immer verloren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff has 10 charges. While holding the staff, you can cast one of the spells on the following table from it, using your spellcasting ability modifier. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Cure Wounds",
       "1 charge per spell level (maximum 4 for a level 4 spell)"
      ],
      [
       "Lesser Restoration",
       "2"
      ],
      [
       "Mass Cure Wounds",
       "5"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff vanishes in a flash of light, lost forever."
    }
   ]
  }
 },
 {
  "id": "staff-of-power",
  "name": {
   "de": "Stab der Macht",
   "en": "Staff of Power"
  },
  "kopfzeile": {
   "de": "Stab, sehr selten (erfordert Einstimmung durch einen Hexenmeister, Magier oder Zauberer)",
   "en": "Staff, Very Rare (Requires Attunement by a Sorcerer, Warlock, or Wizard)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab hat 20 Ladungen und kann als magischer Kampfstab geführt werden. Dieser gewährt einen Bonus von +2 auf Angriffs ‑ und Schadenswürfe, die mit ihm ausgeführt werden. Wenn du ihn hältst, erhältst du einen Bonus von +2 auf deine Rüstungsklasse, Rettungswürfe und Zauberangriffswürfe."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Wenn du den Stab hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (verwende deinen Zauberrettungswurf‑SG). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Blitz (Version des 5. Grades)",
       "5"
      ],
      [
       "Energiewand",
       "5"
      ],
      [
       "Feuerball (Version des 5. Grades)",
       "5"
      ],
      [
       "Kältekegel",
       "5"
      ],
      [
       "Kugel der Unverwundbarkeit",
       "6"
      ],
      [
       "Magisches Geschoss",
       "1"
      ],
      [
       "Monster festhalten",
       "5"
      ],
      [
       "Schwächestrahl",
       "1"
      ],
      [
       "Schweben",
       "2"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 2W8+4 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 behält der Stab seinen Bonus von +2 auf Angriffs ‑ und Schadenswürfe, verliert jedoch all seine anderen Eigenschaften. Bei einer 20 erhält der Stab 1W8+2 Ladungen zurück."
    },
    {
     "typ": "punkt",
     "text": "Vergeltungsschlag: Du kannst eine magische Aktion ausführen, um den Stab über dem Knie oder an einer stabilen Oberfläche zu zerbrechen. Der Stab wird zerstört und setzt seine Magie in einer Explosion frei. Diese füllt eine Ausströmung von neun Metern, die von dort ausgeht, wo der Stab zerstört wurde. Du hast eine Chance von 50 Prozent, sofort auf eine zufällige Existenzebene transportiert zu werden und der Explosion zu entkommen. Wenn du den Effekt nicht vermeiden kannst, erleidest du Energieschaden in Höhe von 16 × Anzahl der Ladungen des Stabs. Jede andere Kreatur im Bereich führt einen SG‑17‑Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur Energieschaden in Höhe von 4 × Anzahl der Ladungen des Stabs. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur halb so viel Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff has 20 charges and can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. While holding it, you gain a +2 bonus to Armor Class, saving throws, and spell attack rolls."
    },
    {
     "typ": "punkt",
     "text": "Spells. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Cone of Cold",
       "5"
      ],
      [
       "Fireball (level 5 version)",
       "5"
      ],
      [
       "Globe of Invulnerability",
       "6"
      ],
      [
       "Hold Monster",
       "5"
      ],
      [
       "Levitate",
       "2"
      ],
      [
       "Lightning Bolt (level 5 version)",
       "5"
      ],
      [
       "Magic Missile",
       "1"
      ],
      [
       "Ray of Enfeeblement",
       "1"
      ],
      [
       "Wall of Force",
       "5"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 2d8 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff retains its +2 bonus to attack rolls and damage rolls but loses all other properties. On a 20, the staff regains 1d8 + 2 charges."
    },
    {
     "typ": "punkt",
     "text": "Retributive Strike. You can take a Magic action to break the staff over your knee or against a solid surface. The staff is destroyed and releases its magic in an explosion that fills a 30-foot Emanation originating from itself. You have a 50 percent chance to instantly travel to a random plane of existence, avoiding the explosion. If you fail to avoid the effect, you take Force damage equal to 16 times the number of charges in the staff. Each other creature in the area makes a DC 17 Dexterity saving throw. On a failed save, a creature takes Force damage equal to 4 times the number of charges in the staff. On a successful save, a creature takes half as much damage."
    }
   ]
  }
 },
 {
  "id": "staff-of-striking",
  "name": {
   "de": "Stab des Schlagens",
   "en": "Staff of Striking"
  },
  "kopfzeile": {
   "de": "Stab, sehr selten (erfordert Einstimmung)",
   "en": "Staff, Very Rare (Requires Attunement)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab kann als magischer Kampfstab geführt werden. Der Kampfstab gewährt einen Bonus von +3 auf Angriffs ‑ und Schadenswürfe, die mit ihm ausgeführt werden. Der Stab hat zehn Ladungen. Wenn du bei einem Nahkampfangriff mit ihm triffst, kannst du bis zu drei Ladungen verbrauchen. Das Ziel erleidet für jede verbrauchte Ladung zusätzlich 1W6 Energieschaden."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 1W6+4 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 wird der Stab zu einem nichtmagischen Kampfstab."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff can be wielded as a magic Quarterstaff that grants a +3 bonus to attack rolls and damage rolls made with it. The staff has 10 charges. When you hit with a melee attack using it, you can expend up to 3 charges. For each charge you expend, the target takes an extra 1d6 Force damage."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff becomes a nonmagical Quarterstaff."
    }
   ]
  }
 },
 {
  "id": "staff-of-swarming-insects",
  "name": {
   "de": "Stab der Insektenschwärme",
   "en": "Staff of Swarming Insects"
  },
  "kopfzeile": {
   "de": "Stab, selten (erfordert Einstimmung durch einen Barden, Druiden, Hexenmeister, Kleriker, Magier oder Zauberer)",
   "en": "Staff, Rare (Requires Attunement by a Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab hat zehn Ladungen."
    },
    {
     "typ": "punkt",
     "text": "Insektenschwarm: Wenn du den Stab hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen, um in einer Ausströmung von neun Metern, die von dir ausgeht, einen Schwarm harmloser Insekten freizusetzen. Die Insekten verweilen zehn Minuten lang und bewirken, dass der Bereich für alle Kreaturen außer dir komplett verschleiert ist. Ein starker Wind (wie durch den Zauber Windstoß) löst den Schwarm auf und beendet den Effekt."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Wenn du den Stab hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (verwende deinen Zauberrettungswurf‑SG und deinen Zauberangriff-Modifikator). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Insektenplage",
       "5"
      ],
      [
       "Rieseninsekt",
       "4"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 1W6+4 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 frisst ein Insektenschwarm den Stab auf, zerstört ihn damit und verschwindet dann."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff has 10 charges."
    },
    {
     "typ": "punkt",
     "text": "Insect Cloud. While holding the staff, you can take a Magic action and expend 1 charge to cause a swarm of harmless flying insects to fill a 30foot Emanation originating from you. The insects remain for 10 minutes, making the area Heavily Obscured for creatures other than you. A strong wind (like that created by Gust of Wind) disperses the swarm and ends the effect."
    },
    {
     "typ": "punkt",
     "text": "Spells. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC and spell attack modifier. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Giant Insect",
       "4"
      ],
      [
       "Insect Plague",
       "5"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, a swarm of insects consumes and destroys the staff, then disperses."
    }
   ]
  }
 },
 {
  "id": "staff-of-the-magi",
  "name": {
   "de": "Stab der Magier",
   "en": "Staff of the Magi"
  },
  "kopfzeile": {
   "de": "Stab, legendär (erfordert Einstimmung durch einen Hexenmeister, Magier oder Zauberer)",
   "en": "Staff, Legendary (Requires Attunement by a Sorcerer, Warlock, or Wizard)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab hat 50 Ladungen und kann als magischer Kampfstab geführt werden. Dieser gewährt einen Bonus von +2 auf Angriffs ‑ und Schadenswürfe, die mit ihm ausgeführt werden. Wenn du ihn hältst, erhältst du einen Bonus von +2 auf Zauberangriffswürfe."
    },
    {
     "typ": "punkt",
     "text": "Zauberabsorption: Wenn du den Stab hältst, bist du bei Rettungswürfen gegen Zauber im Vorteil. Außerdem kannst du eine Reaktion ausführen, wenn eine andere Kreatur einen Zauber wirkt, der nur auf dich zielt. Wenn du dies tust, absorbiert der Stab die Magie des Zaubers. Der Zauber hat dann keinen Effekt, und der Stab erhält Ladungen in Höhe des Zaubergrades hinzu. Wenn jedoch die Gesamtzahl der Ladungen des Stabs dadurch auf mehr als 50 steigt, explodiert der Stab, als hättest du seinen Vergeltungsschlag (siehe unten) aktiviert."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Wenn du den Stab hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (verwende deinen Zauberrettungswurf‑SG). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Arkanes Schloss",
       "0"
      ],
      [
       "Blitz (Version des 7. Grades)",
       "7"
      ],
      [
       "Ebenenwechsel",
       "7"
      ],
      [
       "Eissturm",
       "4"
      ],
      [
       "Elementar beschwören",
       "7"
      ],
      [
       "Feuerball (Version des 7. Grades)",
       "7"
      ],
      [
       "Feuerwand",
       "4"
      ],
      [
       "Flammenkugel",
       "2"
      ],
      [
       "Klopfen",
       "2"
      ],
      [
       "Licht",
       "0"
      ],
      [
       "Magie bannen",
       "3"
      ],
      [
       "Magie entdecken",
       "0"
      ],
      [
       "Magierhand",
       "0"
      ],
      [
       "Schutz vor Gut und Böse",
       "0"
      ],
      [
       "Spinnennetz",
       "2"
      ],
      [
       "Telekinese",
       "5"
      ],
      [
       "Unsichtbarkeit",
       "2"
      ],
      [
       "Vergrößern/Verkleinern",
       "0"
      ],
      [
       "Wände passieren",
       "5"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 4W6+2 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 20 erhält der Stab 1W12+1 Ladungen zurück."
    },
    {
     "typ": "punkt",
     "text": "Vergeltungsschlag: Du kannst eine magische Aktion ausführen, um den Stab über dem Knie oder an einer stabilen Oberfläche zu zerbrechen. Der Stab wird zerstört und setzt seine Magie in einer Explosion frei. Diese füllt eine Ausströmung von neun Metern, die von dort ausgeht, wo der Stab zerstört wurde. Du hast eine Chance von 50 Prozent, sofort auf eine zufällige Existenzebene transportiert zu werden und der Explosion zu entkommen. Wenn du den Effekt nicht vermeiden kannst, erleidest du Energieschaden in Höhe von 16 × Anzahl der Ladungen des Stabs. Jede andere Kreatur im Bereich führt einen SG‑17‑Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur Energieschaden in Höhe von 6 × Anzahl der Ladungen des Stabs. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur halb so viel Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff has 50 charges and can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. While you hold it, you gain a +2 bonus to spell attack rolls."
    },
    {
     "typ": "punkt",
     "text": "Spell Absorption. While holding the staff, you have Advantage on saving throws against spells. In addition, you can take a Reaction when another creature casts a spell that targets only you. If you do, the staff absorbs the magic of the spell, canceling its effect and gaining a number of charges equal to the absorbed spell’s level. However, if doing so brings the staff’s total number of charges above 50, the staff explodes as if you activated its Retributive Strike (see below)."
    },
    {
     "typ": "punkt",
     "text": "Spells. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Arcane Lock",
       "0"
      ],
      [
       "Conjure Elemental",
       "7"
      ],
      [
       "Detect Magic",
       "0"
      ],
      [
       "Dispel Magic",
       "3"
      ],
      [
       "Enlarge/Reduce",
       "0"
      ],
      [
       "Fireball (level 7 version)",
       "7"
      ],
      [
       "Flaming Sphere",
       "2"
      ],
      [
       "Ice Storm",
       "4"
      ],
      [
       "Invisibility",
       "2"
      ],
      [
       "Knock",
       "2"
      ],
      [
       "Light",
       "0"
      ],
      [
       "Lightning Bolt (level 7 version)",
       "7"
      ],
      [
       "Mage Hand",
       "0"
      ],
      [
       "Passwall",
       "5"
      ],
      [
       "Plane Shift",
       "7"
      ],
      [
       "Protection from Evil and Good",
       "0"
      ],
      [
       "Telekinesis",
       "5"
      ],
      [
       "Wall of Fire",
       "4"
      ],
      [
       "Web",
       "2"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 4d6 + 2 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 20, the staff regains 1d12 + 1 charges."
    },
    {
     "typ": "punkt",
     "text": "Retributive Strike. You can take a Magic action to break the staff over your knee or against a solid surface. The staff is destroyed and releases its magic in an explosion that fills a 30-foot Emanation originating from itself. You have a 50 percent chance to instantly travel to a random plane of existence, avoiding the explosion. If you fail to avoid the effect, you take Force damage equal to 16 times the number of charges in the staff. Each other creature in the area makes a DC 17 Dexterity saving throw. On a failed save, a creature takes Force damage equal to 6 times the number of charges in the staff. On a successful save, a creature takes half as much damage."
    }
   ]
  }
 },
 {
  "id": "staff-of-the-python",
  "name": {
   "de": "Stab der Python",
   "en": "Staff of the Python"
  },
  "kopfzeile": {
   "de": "Stab, ungewöhnlich (erfordert Einstimmung)",
   "en": "Staff, Uncommon (Requires Attunement)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst als magische Aktion diesen Stab werfen, sodass er in einem freien Bereich im Abstand von bis zu drei Metern von dir landet und dort zu einer Riesenwürgeschlange wird. Die Schlange steht unter deiner Kontrolle und ist bei deinem Initiativewert unmittelbar nach dir am Zug. In deinem Zug kannst du die Schlange mental befehligen (keine Aktion erforderlich), sofern sie sich im Abstand von bis zu 18 Metern von dir befindet und du nicht kampfunfähig bist. Du entscheidest, welche Aktion die Schlange im Zug ausführt und wohin sie sich bewegt. Alternativ kannst du einen allgemeinen Befehl erteilen, um sie beispielsweise deine Feinde angreifen oder einen Ort bewachen zu lassen. Wenn du ihr keine Befehle erteilst, verteidigt sie sich. Als Bonusaktion kannst du der Schlange befehlen, sich in ihrem aktuellen Bereich wieder in Stabform zu verwandeln. Du kannst die Eigenschaft des Stabs erst nach einer Stunde erneut verwenden. Wenn die Trefferpunkte der Schlange auf 0 sinken, stirbt sie und nimmt wieder ihre Stabform an, woraufhin der Stab zerbricht und zerstört ist. Wenn die Schlange ihre Stabform annimmt, bevor sie alle Trefferpunkte verliert, erhält der Stab alle Trefferpunkte zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As a Magic action, you can throw this staff so that it lands in an unoccupied space within 10 feet of you, causing the staff to become a Giant Constrictor Snake in that space. The snake is under your control and shares your Initiative count, taking its turn immediately after yours. On your turn, you can mentally command the snake (no action required) if it is within 60 feet of you and you don’t have the Incapacitated condition. You decide what action the snake takes and where it moves during its turn, or you can issue it a general command, such as to attack your enemies or guard a location. Absent commands from you, the snake defends itself. As a Bonus Action, you can command the snake to revert to staff form in its current space, and you can’t use the staff’s property again for 1 hour. If the snake is reduced to 0 Hit Points, it dies and reverts to its staff form; the staff then shatters and is destroyed. If the snake reverts to staff form before losing all its Hit Points, it regains all of them."
    }
   ]
  }
 },
 {
  "id": "staff-of-the-woodlands",
  "name": {
   "de": "Stab der Waldlande",
   "en": "Staff of the Woodlands"
  },
  "kopfzeile": {
   "de": "Stab, selten (erfordert Einstimmung durch einen Druiden)",
   "en": "Staff, Rare (Requires Attunement by a Druid)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab hat sechs Ladungen und kann als magischer Kampfstab geführt werden. Dieser gewährt einen Bonus von +2 auf Angriffs ‑ und Schadenswürfe, die mit ihm ausgeführt werden. Wenn du ihn hältst, erhältst du einen Bonus von +2 auf Zauberangriffswürfe."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Wenn du den Stab hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (verwende deinen Zauberrettungswurf‑SG). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Dornenwand",
       "6"
      ],
      [
       "Erwecken",
       "5"
      ],
      [
       "Mit Pflanzen sprechen",
       "3"
      ],
      [
       "Mit Tieren sprechen",
       "1"
      ],
      [
       "Rindenhaut",
       "2"
      ],
      [
       "Spurloses Gehen",
       "2"
      ],
      [
       "Tiere oder Pflanzen aufspüren",
       "2"
      ],
      [
       "Tierfreundschaft",
       "1"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Baumform: Du kannst eine magische Aktion ausführen, um ein Ende des Stabs in einem freien Bereich in den Erdboden einzupflanzen, und eine Ladung verbrauchen, um den Stab in einen gesunden Baum zu verwandeln. Der Baum ist 18 Meter hoch. Sein Stamm hat einen Durchmesser von 1,5 Metern, und die Krone erreicht einen Durchmesser von sechs Metern. Der Baum wirkt gewöhnlich, strahlt jedoch eine schwache Aura von Verwandlungsmagie aus, die mit dem Zauber Magie entdecken aufgespürt werden kann. Wenn du den Baum berührst und eine magische Aktion ausführst, verwandelst du den Stab wieder in seine normale Form. Kreaturen auf dem Baum stürzen ab, wenn der Baum wieder zu einem Stab wird."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Stab erhält täglich im Morgengrauen 1W6 verbrauchte Ladungen zurück. Wenn du die letzte Ladung verbraucht hast, würfle mit 1W20. Bei einer 1 verliert der Stab seine Eigenschaften und wird zu einem nichtmagischen Kampfstab."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff has 6 charges and can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. While holding it, you have a +2 bonus to spell attack rolls."
    },
    {
     "typ": "punkt",
     "text": "Spells. While holding the staff, you can cast one of the spells on the following table from it, using your spell save DC. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Animal Friendship",
       "1"
      ],
      [
       "Awaken",
       "5"
      ],
      [
       "Barkskin",
       "2"
      ],
      [
       "Locate Animals or Plants",
       "2"
      ],
      [
       "Pass without Trace",
       "2"
      ],
      [
       "Speak with Animals",
       "1"
      ],
      [
       "Speak with Plants",
       "3"
      ],
      [
       "Wall of Thorns",
       "6"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Tree Form. You can take a Magic action to plant one end of the staff in earth in an unoccupied space and expend 1 charge to transform the staff into a healthy tree. The tree is 60 feet tall and has a 5-foot-diameter trunk, and its branches at the top spread out in a 20-foot radius. The tree appears ordinary but radiates a faint aura of Transmutation magic that can be discerned with the Detect Magic spell. While touching the tree and using a Magic action, you return the staff to its normal form. Any creature in the tree falls when the tree reverts to a staff."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The staff regains 1d6 expended charges daily at dawn. If you expend the last charge, roll 1d20. On a 1, the staff loses its properties and becomes a nonmagical Quarterstaff."
    }
   ]
  }
 },
 {
  "id": "staff-of-thunder-and-lightning",
  "name": {
   "de": "Stab des Blitzes und Donners",
   "en": "Staff of Thunder and Lightning"
  },
  "kopfzeile": {
   "de": "Stab, sehr selten (erfordert Einstimmung)",
   "en": "Staff, Very Rare (Requires Attunement)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab kann als magischer Kampfstab geführt werden. Der Kampfstab gewährt einen Bonus von +2 auf Angriffs ‑ und Schadenswürfe, die mit ihm ausgeführt werden. Außerdem hat er die folgenden zusätzlichen Eigenschaften. Wurde eine dieser Eigenschaften verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    },
    {
     "typ": "punkt",
     "text": "Blitz: Wenn du bei einem Nahkampfangriff mit dem Stab triffst, kannst du dem Ziel zusätzlich 2W6 Blitzschaden zufügen (keine Aktion erforderlich)."
    },
    {
     "typ": "punkt",
     "text": "Donner: Wenn du bei einem Nahkampfangriff mit dem Stab triffst, gibt er einen Donnerknall von sich, der bis zu 90 Meter weit zu hören ist (keine Aktion erforderlich). Das getroffene Ziel muss einen SG‑17‑Konstitutionsrettungswurf bestehen, oder es ist bis zum Ende deines nächsten Zugs betäubt."
    },
    {
     "typ": "punkt",
     "text": "Blitz und Donner: Unmittelbar nachdem du bei einem Nahkampfangriff mit dem Stab getroffen hast, kannst du eine Bonusaktion ausführen, um die Eigenschaften Blitz und Donner (siehe oben) zugleich zu verwenden. Dabei verbrauchst du nicht die tägliche Verwendung der Eigenschaften, sondern nur die Verwendung dieser Eigenschaft."
    },
    {
     "typ": "punkt",
     "text": "Blitzschlag: Du kannst eine magische Aktion ausführen und einen Blitzschlag entfesseln, der sich von der Spitze des Stabs in einer 1,5 Meter breiten, 36 Meter langen Linie ausbreitet. Jede Kreatur in dieser Line führt einen SG‑17‑Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 9W6 Blitzschaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Donnerschlag: Du kannst eine magische Aktion ausführen, damit der Stab einen Donnerschlag von sich gibt, der bis zu 180 Meter weit zu hören ist. Jede Kreatur in einer Ausströmung von 18 Metern, die von dir ausgeht, führt einen SG‑17‑Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 2W6 Schallschaden und ist eine Minute lang taub. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur nur halb so viel Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff can be wielded as a magic Quarterstaff that grants a +2 bonus to attack rolls and damage rolls made with it. It also has the following additional properties. Once one of these properties is used, it can’t be used again until the next dawn."
    },
    {
     "typ": "punkt",
     "text": "Lightning. When you hit with a melee attack using the staff, you can cause the target to take an extra 2d6 Lightning damage (no action required)."
    },
    {
     "typ": "punkt",
     "text": "Thunder. When you hit with a melee attack using the staff, you can cause the staff to emit a crack of thunder audible out to 300 feet (no action required). The target you hit must succeed on a DC 17 Constitution saving throw or have the Stunned condition until the end of your next turn."
    },
    {
     "typ": "punkt",
     "text": "Thunder and Lightning. Immediately after you hit with a melee attack using the staff, you can take a Bonus Action to use the Lightning and Thunder properties (see above) at the same time. Doing so doesn’t expend the daily use of those properties, only the use of this one."
    },
    {
     "typ": "punkt",
     "text": "Lightning Strike. You can take a Magic action to cause a bolt of lightning to leap from the staff’s tip in a Line that is 5 feet wide and 120 feet long. Each creature in that Line makes a DC 17 Dexterity saving throw, taking 9d6 Lightning damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Thunderclap. You can take a Magic action to cause the staff to produce a thunderclap audible out to 600 feet. Every creature within a 60-foot Emanation originating from you makes a DC 17 Constitution saving throw. On a failed save, a creature takes 2d6 Thunder damage and has the Deafened condition for 1 minute. On a successful save, a creature takes half as much damage only."
    }
   ]
  }
 },
 {
  "id": "staff-of-withering",
  "name": {
   "de": "Stab der Verkümmerung",
   "en": "Staff of Withering"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung)",
   "en": "Staff, Rare (Requires Attunement)"
  },
  "kategorie": "stab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Stab hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Er kann als magischer Kampfstab verwendet werden. Bei einem Treffer bewirkt er Schaden als normaler Kampfstab, und du kannst eine Ladung verbrauchen, um zusätzlich 2W10 nekrotischen Schaden zu bewirken und das Ziel zu einem SG‑15‑Konstitutionsrettungswurf zu zwingen. Misslingt der Wurf, so ist das Ziel eine Stunde lang bei allen Attributs ‑ und Rettungswürfen im Nachteil, die Stärke oder Konstitution verwenden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This staff has 3 charges and regains 1d3 expended charges daily at dawn. The staff can be wielded as a magic Quarterstaff. On a hit, it deals damage as a normal Quarterstaff, and you can expend 1 charge to deal an extra 2d10 Necrotic damage to the target and force it to make a DC 15 Constitution saving throw. On a failed save, the target has Disadvantage for 1 hour on any ability check or saving throw that uses Strength or Constitution."
    }
   ]
  }
 },
 {
  "id": "stone-of-controlling-earth-elementals",
  "name": {
   "de": "Stein der Erdelementar-Herrschaft",
   "en": "Stone of Controlling Earth Elementals"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten",
   "en": "Wondrous Item, Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du mit diesem 2,5 Kilogramm schweren Stein den Boden berührst, kannst du eine magische Aktion ausführen, um einen Erdelementar herbeizurufen. Dieser erscheint in einem freien Bereich deiner Wahl im Abstand von bis zu neun Metern von dir, gehorcht deinen Befehlen und ist bei deinem Initiativewert unmittelbar nach dir am Zug. Der Elementar verschwindet, wenn eine Stunde vergangen ist, er stirbt oder du ihn als Bonusaktion verwirfst. Der Stein kann erst ab dem nächsten Morgengrauen erneut auf diese Weise verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While touching this 5-pound stone to the ground, you can take a Magic action to summon an Earth Elemental. The elemental appears in an unoccupied space you choose within 30 feet of yourself, obeys your commands, and takes its turn immediately after you on your Initiative count. The elemental disappears after 1 hour, when it dies, or when you dismiss it as a Bonus Action. The stone can’t be used this way again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "stone-of-good-luck-luckstone",
  "name": {
   "de": "Stein des Glücks (Glücksstein)",
   "en": "Stone of Good Luck (Luckstone)"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen polierten Achat mit dir führst, erhältst du einen Bonus von +1 auf Attributs ‑ und Rettungswürfe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While this polished agate is on your person, you gain a +1 bonus to ability checks and saving throws."
    }
   ]
  }
 },
 {
  "id": "sun-blade",
  "name": {
   "de": "Sonnenklinge",
   "en": "Sun Blade"
  },
  "kopfzeile": {
   "de": "Waffe (Langschwert), selten (erfordert Einstimmung)",
   "en": "Weapon (Longsword), Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Gegenstand sieht wie ein Schwertgriff aus."
    },
    {
     "typ": "punkt",
     "text": "Klinge des Gleißens: Wenn du den Griff hältst, kannst du eine Bonusaktion ausführen, um eine Klinge aus purem Gleißen erscheinen oder wieder verschwinden zu lassen. Solange die Klinge existiert, funktioniert diese magische Waffe als Langschwert mit der Eigenschaft Finesse. Wenn du Übung im Umgang mit Lang‑ oder Kurzschwertern hast, so hast du auch Übung im Umgang mit der Sonnenklinge. Du erhältst einen Bonus von +2 auf Angriffs ‑ und Schadenswürfe mit dieser Waffe, die gleißenden Schaden statt Hiebschaden bewirkt. Wenn du einen Untoten damit triffst, erleidet das Ziel zusätzlich 1W8 gleißenden Schaden."
    },
    {
     "typ": "punkt",
     "text": "Sonnenlicht: Die leuchtende Schwertklinge spendet in einem Radius von 4,5 Metern helles Licht und in einem Radius von weiteren 4,5 Metern dämmriges Licht. Das Licht ist Sonnenlicht. Solange die Klinge existiert, kannst du eine magische Aktion ausführen, um den Radius des hellen Lichts und des dämmrigen Lichts um jeweils 1,5 Meter zu vergrößern (auf höchstens neun Meter) oder zu verkleinern (auf mindestens drei Meter)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This item appears to be a sword hilt."
    },
    {
     "typ": "punkt",
     "text": "Blade of Radiance. While grasping the hilt, you can take a Bonus Action to cause a blade of pure radiance to spring into existence or make the blade disappear. While the blade exists, this magic weapon functions as a Longsword with the Finesse property. If you are proficient with Longswords or Shortswords, you are proficient with the Sun Blade. You gain a +2 bonus to attack rolls and damage rolls made with this weapon, which deals Radiant damage instead of Slashing damage. When you hit an Undead with it, that target takes an extra 1d8 Radiant damage."
    },
    {
     "typ": "punkt",
     "text": "Sunlight. The sword’s luminous blade emits Bright Light in a 15-foot radius and Dim Light for an additional 15 feet. The light is sunlight. While the blade persists, you can take a Magic action to expand or reduce its radius of Bright Light and Dim Light by 5 feet each, to a maximum of 30 feet each or a minimum of 10 feet each."
    }
   ]
  }
 },
 {
  "id": "sword-of-life-stealing",
  "name": {
   "de": "Schwert des Lebensentzugs",
   "en": "Sword of Life Stealing"
  },
  "kopfzeile": {
   "de": "Waffe (Glefe, Krummsäbel, Kurzschwert, Langschwert, Rapier oder Zweihandschwert), selten (erfordert Einstimmung)",
   "en": "Weapon (Glaive, Greatsword, Longsword, Rapier, Scimitar, or Shortsword), Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du eine Kreatur mit dieser magischen Waffe angreifst und beim Angriffswurf eine 20 würfelst, erleidet das Ziel zusätzlich 15 nekrotischen Schaden, sofern es kein Konstrukt und kein Untoter ist, und du erhältst temporäre Trefferpunkte in Höhe des bewirkten nekrotischen Schadens."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you attack a creature with this magic weapon and roll a 20 on the d20 for the attack roll, that target takes an extra 15 Necrotic damage if it isn’t a Construct or an Undead, and you gain Temporary Hit Points equal to the amount of Necrotic damage taken."
    }
   ]
  }
 },
 {
  "id": "sword-of-sharpness",
  "name": {
   "de": "Schwert der Schärfe",
   "en": "Sword of Sharpness"
  },
  "kopfzeile": {
   "de": "Waffe (Glefe, Krummsäbel, Langschwert oder Zweihandschwert), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Glaive, Greatsword, Longsword, or Scimitar), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du mit dieser magischen Waffe einen Gegenstand angreifst und triffst, maximierst du die Waffenschadenswürfel gegen das Ziel. Wenn du eine Kreatur mit dieser Waffe angreifst und beim Angriffswurf eine 20 würfelst, erleidet das Ziel zusätzlich 14 Hiebschaden und erhält eine Erschöpfungsstufe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you attack an object with this magic weapon and hit, maximize your weapon damage dice against the target. When you attack a creature with this weapon and roll a 20 on the d20 for the attack roll, that target takes an extra 14 Slashing damage and gains 1 Exhaustion level."
    }
   ]
  }
 },
 {
  "id": "sword-of-wounding",
  "name": {
   "de": "Schwert der Verwundung",
   "en": "Sword of Wounding"
  },
  "kopfzeile": {
   "de": "Waffe (Glefe, Krummsäbel, Kurzschwert, Langschwert, Rapier oder Zweihandschwert), selten (erfordert Einstimmung)",
   "en": "Weapon (Glaive, Greatsword, Longsword, Rapier, Scimitar, or Shortsword), Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du mit dieser magischen Waffe eine Kreatur angreifst und triffst, erleidet das Ziel zusätzlich 2W6 nekrotischen Schaden und muss einen SG‑15‑Konstitutionsrettungswurf bestehen, oder es kann eine Stunde lang keine Trefferpunkte zurückerhalten. Das Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Effekt bei ihm."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "When you hit a creature with an attack using this magic weapon, the target takes an extra 2d6 Necrotic damage and must succeed on a DC 15 Constitution saving throw or be unable to regain Hit Points for 1 hour. The target repeats the save at the end of each of its turns, ending the effect on itself on a success."
    }
   ]
  }
 },
 {
  "id": "talisman-of-pure-good",
  "name": {
   "de": "Talisman des Reinen Guten",
   "en": "Talisman of Pure Good"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung durch einen Kleriker oder Paladin)",
   "en": "Wondrous Item, Legendary (Requires Attunement by a Cleric or Paladin)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Talisman ist ein mächtiges Symbol des Guten. Unholde und Untote, die ihn berühren, erleiden 8W6 gleißenden Schaden. Solange sie den Talisman tragen oder halten, erleiden sie den Schaden am Ende jedes ihrer Züge erneut."
    },
    {
     "typ": "punkt",
     "text": "Heiliges Symbol: Du kannst den Talisman als heiliges Symbol verwenden. Wenn du ihn trägst oder hältst, erhältst du einen Bonus von +2 auf Zauberangriffswürfe."
    },
    {
     "typ": "punkt",
     "text": "Reiner Tadel: Der Talisman hat sieben Ladungen. Wenn du den Talisman trägst oder hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen, um auf eine Kreatur auf dem Boden im Abstand von bis zu 36 Metern von dir zu zielen, die du sehen kannst. Unter dem Ziel öffnet sich ein feuriger Erdspalt, und das Ziel führt einen SG‑20‑Geschicklichkeitsrettungswurf aus. Wenn das Ziel ein Unhold oder ein Untoter ist, so ist es beim Rettungswurf im Nachteil. Misslingt der Wurf, so fällt das Ziel in den Spalt, wird zerstört und hinterlässt keinerlei Überreste. Bei einem erfolgreichen Rettungswurf stürzt das Ziel nicht in den Spalt, erleidet durch das Martyrium jedoch 4W6 psychischen Schaden. In jedem Fall schließt sich der Spalt danach und hinterlässt seinerseits keine Spuren. Wenn du die letzte Ladung verbraucht hast, löst sich der Talisman in goldene Lichtfunken auf und ist zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This talisman is a mighty symbol of goodness. A Fiend or an Undead that touches the talisman takes 8d6 Radiant damage and takes the damage again each time it ends its turn holding or carrying the talisman."
    },
    {
     "typ": "punkt",
     "text": "Holy Symbol. You can use the talisman as a Holy Symbol. You gain a +2 bonus to spell attack rolls while you wear or hold it."
    },
    {
     "typ": "punkt",
     "text": "Pure Rebuke. The talisman has 7 charges. While wearing or holding the talisman, you can take a Magic action to expend 1 charge and target one creature you can see on the ground within 120 feet of yourself. A flaming fissure opens under the target, and the target makes a DC 20 Dexterity saving throw. If the target is a Fiend or an Undead, it has Disadvantage on the save. On a failed save, the target falls into the fissure and is destroyed, leaving no remains. On a successful save, the target isn’t cast into the fissure but takes 4d6 Psychic damage from the ordeal. In either case, the fissure then closes, leaving no trace of its existence. When you expend the last charge, the talisman disperses into motes of golden light and is destroyed."
    }
   ]
  }
 },
 {
  "id": "talisman-of-the-sphere",
  "name": {
   "de": "Talisman des Nichts",
   "en": "Talisman of the Sphere"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung)",
   "en": "Wondrous Item, Legendary (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Talisman trägst oder hältst, bist du bei allen Intelligenzwürfen (Arkane Kunde) im Vorteil, die du ausführst, um eine Kugel der Auslöschung zu kontrollieren. Wenn du außerdem zu Beginn deines Zugs eine Kugel der Auslöschung kontrollierst, kannst du eine magische Aktion ausführen und sie um drei Meter plus eine Anzahl von Metern in Höhe des Dreifachen deines Intelligenzmodifikators zu bewegen. Diese Bewegung muss nicht in gerader Linie verlaufen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding or wearing this talisman, you have Advantage on any Intelligence (Arcana) check you make to control a Sphere of Annihilation. In addition, when you start your turn in control of a Sphere of Annihilation, you can take a Magic action to move it 10 feet plus a number of additional feet equal to 10 times your Intelligence modifier. This movement doesn’t have to be in a straight line."
    }
   ]
  }
 },
 {
  "id": "talisman-of-ultimate-evil",
  "name": {
   "de": "Talisman des Absolut Bösen",
   "en": "Talisman of Ultimate Evil"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär (erfordert Einstimmung)",
   "en": "Wondrous Item, Legendary (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Gegenstand ist das Symbol des reuelosen Bösen. Kreaturen außer Unholden und Untoten, die ihn berühren, erleiden 8W6 nekrotischen Schaden. Solange sie den Talisman tragen oder halten, erleiden sie den Schaden am Ende jedes ihrer Züge erneut."
    },
    {
     "typ": "punkt",
     "text": "Absolutes Ende: Der Talisman hat sechs Ladungen. Wenn du den Talisman trägst oder hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen, um auf eine Kreatur auf dem Boden im Abstand von bis zu 36 Metern von dir zu zielen, die du sehen kannst. Unter dem Ziel öffnet sich ein feuriger Erdspalt, und das Ziel führt einen SG‑20‑Geschicklichkeitsrettungswurf aus. Wenn das Ziel ein celestisches Wesen ist, so ist es beim Rettungswurf im Nachteil. Misslingt der Wurf, so fällt das Ziel in den Spalt, wird zerstört und hinterlässt keinerlei Überreste. Bei einem erfolgreichen Rettungswurf stürzt das Ziel nicht in den Spalt, erleidet durch das Martyrium jedoch 4W6 psychischen Schaden. In jedem Fall schließt sich der Spalt danach und hinterlässt seinerseits keine Spuren. Wenn du die letzte Ladung verbraucht hast, löst sich der Talisman in übelriechenden Schleim auf und ist zerstört."
    },
    {
     "typ": "punkt",
     "text": "Heiliges Symbol: Du kannst den Talisman als heiliges Symbol verwenden. Wenn du ihn trägst oder hältst, erhältst du einen Bonus von +2 auf Zauberangriffswürfe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This item symbolizes unrepentant evil. A creature that isn’t a Fiend or an Undead that touches the talisman takes 8d6 Necrotic damage and takes the damage again each time it ends its turn holding or carrying the talisman."
    },
    {
     "typ": "punkt",
     "text": "Holy Symbol. You can use the talisman as a Holy Symbol. You gain a +2 bonus to spell attack rolls while you wear or hold it."
    },
    {
     "typ": "punkt",
     "text": "Ultimate End. The talisman has 6 charges. While wearing or holding the talisman, you can take a Magic action to expend 1 charge and target one creature you can see on the ground within 120 feet of yourself. A flaming fissure opens under the target, and the target makes a DC 20 Dexterity saving throw. If the target is a Celestial, it has Disadvantage on the save. On a failed save, the target falls into the fissure and is destroyed, leaving no remains. On a successful save, the target isn’t cast into the fissure but takes 4d6 Psychic damage from the ordeal. In either case, the fissure then closes, leaving no trace of its existence. When you expend the last charge, the talisman dissolves into foul-smelling slime and is destroyed."
    }
   ]
  }
 },
 {
  "id": "thunderous-greatclub",
  "name": {
   "de": "Donnernder Zweihandknüppel",
   "en": "Thunderous Greatclub"
  },
  "kopfzeile": {
   "de": "Waffe (Zweihandknüppel), sehr selten (erfordert Einstimmung)",
   "en": "Weapon (Greatclub), Very Rare (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du auf diese magische Waffe eingestimmt bist, steigt dein Stärkewert auf 20, sofern er nicht ohnehin 20 oder mehr beträgt. Die Waffe fügt jeder Kreatur, die sie trifft, zusätzlich 1W8 Schallschaden zu. Gegenständen, die nicht getragen oder gehalten werden, fügt sie zusätzlich 3W8 Schallschaden zu. Sie hat folgende zusätzliche Eigenschaften:"
    },
    {
     "typ": "punkt",
     "text": "Donnerschlag: Du kannst als magische Aktion die Waffe gegen eine harte Oberfläche schlagen, um einen Donnerknall zu erzeugen, der bis zu 90 Meter weit zu hören ist. Außerdem erzeugst du einen Kegel von neun Metern aus donnernder Energie. Jede Kreatur im Kegel muss einen SG‑15‑Stärkerettungswurf bestehen, oder sie wird umgestoßen und hat den Zustand Liegend. Nichtmagische Gegenstände im Kegel, die nicht getragen oder gehalten werden, erleiden 3W8 Schallschaden."
    },
    {
     "typ": "punkt",
     "text": "Erdbeben: Du kannst als magische Aktion die Waffe auf den Boden schlagen, um im Radius von 15 Metern um den Aufschlagpunkt eine intensive seismische Störung zu erzeugen. In diesem Bereich erleiden Gebäude mit Bodenkontakt 50 Wuchtschaden, und jede Kreatur auf dem Boden muss einen SG‑20‑Geschicklichkeitsrettungswurf bestehen, oder sie wird umgestoßen und hat den Zustand Liegend. Wenn die Kreatur sich gerade konzentriert, muss sie einen SG‑20‑Konstitutionsrettungswurf bestehen oder ihre Konzentration wird unterbrochen. Außerdem kannst du bewirken, dass sich an einem beliebigen Ort im Bereich ein neun Meter tiefer, drei Meter breiter Erdspalt öffnet. Jede Kreatur auf einer Stelle, an der sich der Spalt öffnet, muss einen SG‑20‑Geschicklichkeitsrettungswurf ausführen. Misslingt der Wurf, so stürzt sie in den Spalt. Bei einem Erfolg bewegt sich die Kreatur mit dem Rand des Spalts. Alle Gebäude auf Stellen, an denen der Spalt sich öffnet, brechen zusammen und stürzen in den Spalt. Wurde diese Eigenschaft verwendet, so kann sie erst ab dem nächsten Morgengrauen erneut verwendet werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While you are attuned to this magic weapon, your Strength is 20 unless your Strength is already equal to or greater than that score. The weapon deals an extra 1d8 Thunder damage to any creature it hits and an extra 3d8 Thunder damage to objects it hits that aren’t being worn or carried. The weapon has the following additional properties."
    },
    {
     "typ": "punkt",
     "text": "Clap of Thunder. As a Magic action, you can strike the weapon against a hard surface to create a loud clap of thunder audible out to 300 feet. You also create a 30-foot Cone of thunderous energy. Each creature in the Cone must succeed on a DC 15 Strength saving throw or have the Prone condition. Nonmagical objects in the Cone that aren’t being worn or carried take 3d8 Thunder damage."
    },
    {
     "typ": "punkt",
     "text": "Earthquake. As a Magic action, you can strike the weapon against the ground to create an intense seismic disturbance in a 50-foot-radius circle centered on the point of impact. Structures in contact with the ground in that area take 50 Bludgeoning damage, and each creature on the ground in that area must succeed on a DC 20 Dexterity saving throw or have the Prone condition. If that creature is also concentrating, it must succeed on a DC 20 Constitution saving throw, or its Concentration is broken. In addition, you can cause a 30-foot-deep, 10-foot-wide fissure to open up on the ground anywhere in the area. Any creature on a spot where the fissure opens must make a DC 20 Dexterity saving throw, falling into the fissure on a failed save or moving with the fissure’s edge on a successful one. Any structure on a spot where the fissure opens collapses into the fissure. Once you use this property, it can’t be used again until the next dawn."
    }
   ]
  }
 },
 {
  "id": "tome-of-clear-thought",
  "name": {
   "de": "Leitfaden des Klaren Denkens",
   "en": "Tome of Clear Thought"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses magisch aufgeladene Buch enthält Gedächtnis‑ und Logikübungen. Wenn du innerhalb von maximal sechs Tagen 48 Stunden damit verbringst, den Inhalt des Buchs zu studieren und seine Anleitungen zu befolgen, wird dein Intelligenzwert um 2 erhöht (auf höchstens 30). Danach verliert das Handbuch seine Magie. Es erhält sie jedoch nach einem Jahrhundert zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This book contains memory and logic exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book’s contents and practicing its guidelines, your Intelligence increases by 2, to a maximum of 30. The manual then loses its magic but regains it in a century."
    }
   ]
  }
 },
 {
  "id": "tome-of-leadership-and-influence",
  "name": {
   "de": "Leitfaden der Führungskraft und der Einflussnahme",
   "en": "Tome of Leadership and Influence"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses magisch aufgeladene Buch enthält Anleitungen zum Beeinflussen und Bezaubern anderer. Wenn du innerhalb von maximal sechs Tagen 48 Stunden damit verbringst, den Inhalt des Buchs zu studieren und seine Anleitungen zu befolgen, wird dein Charismawert um 2 erhöht (auf höchstens 30). Danach verliert das Handbuch seine Magie. Es erhält sie jedoch nach einem Jahrhundert zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This book contains guidelines for influencing and charming others, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book’s contents and practicing its guidelines, your Charisma increases by 2, to a maximum of 30. The manual then loses its magic but regains it in a century."
    }
   ]
  }
 },
 {
  "id": "tome-of-understanding",
  "name": {
   "de": "Leitfaden des Verständnisses",
   "en": "Tome of Understanding"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, sehr selten",
   "en": "Wondrous Item, Very Rare"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses magisch aufgeladene Buch enthält Intuitions‑ und Verständnisübungen. Wenn du innerhalb von maximal sechs Tagen 48 Stunden damit verbringst, den Inhalt des Buchs zu studieren und seine Anleitungen zu befolgen, wird dein Weisheitswert um 2 erhöht (auf höchstens 30). Das Handbuch verliert dann seine Magie, erhält sie jedoch nach einem Jahrhundert zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This book contains intuition and insight exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book’s contents and practicing its guidelines, your Wisdom increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century."
    }
   ]
  }
 },
 {
  "id": "trident-of-fish-command",
  "name": {
   "de": "Dreizack der Fischherrschaft",
   "en": "Trident of Fish Command"
  },
  "kopfzeile": {
   "de": "Waffe (Dreizack), ungewöhnlich (erfordert Einstimmung)",
   "en": "Weapon (Trident), Uncommon (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese magische Waffe hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du sie trägst, kannst du eine Ladung verbrauchen, um Tier beherrschen (Rettungswurf‑SG 15) mit der Waffe auf ein Tier zu wirken, das über eine Schwimmbewegungsrate verfügt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This magic weapon has 3 charges, and it regains 1d3 expended charges daily at dawn. While you carry it, you can expend 1 charge to cast Dominate Beast (save DC 15) from it on a Beast that has a Swim Speed."
    }
   ]
  }
 },
 {
  "id": "universal-solvent",
  "name": {
   "de": "Universelles Lösungsmittel",
   "en": "Universal Solvent"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses Fläschchen enthält eine milchige Flüssigkeit, die stark nach Alkohol riecht. Wenn ein Fläschchen mit universellem Lösungsmittel gefunden wird, enthält es (1W6+1) × 30 Milliliter Lösungsmittel. Du kannst als Verwenden‑Aktion mindestens 30 Milliliter Lösungsmittel aus dem Fläschchen auf eine Oberfläche in Reichweite gießen. Diese Menge löst auf einem Quadrat mit bis zu 30 Zentimetern Kantenlänge sofort jedes Klebemittel auf, die sie berührt, auch Ewigen Leim."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This tube holds milky liquid with a strong alcohol smell. When found, a tube contains 1d6 + 1 ounces. You can take a Utilize action to pour 1 or more ounces of solvent from the tube onto a surface within reach. Each ounce instantly dissolves up to 1 square foot of adhesive it touches, including Sovereign Glue."
    }
   ]
  }
 },
 {
  "id": "vicious-weapon",
  "name": {
   "de": "Bösartige Waffe",
   "en": "Vicious Weapon"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige einfache Waffe oder Kriegswaffe), selten",
   "en": "Weapon (Any Simple or Martial), Rare"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese magische Waffe fügt jeder Kreatur, die sie trifft, zusätzlich 2W6 Schaden zu. Dieser zusätzliche Schaden ist von derselben Art wie der normale Schaden der Waffe."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This magic weapon deals an extra 2d6 damage to any creature it hits. This extra damage is of the same type as the weapon’s normal damage."
    }
   ]
  }
 },
 {
  "id": "vorpal-sword",
  "name": {
   "de": "Henkersschwert",
   "en": "Vorpal Sword"
  },
  "kopfzeile": {
   "de": "Waffe (Glefe, Krummsäbel, Langschwert oder Zweihandschwert), legendär (erfordert Einstimmung)",
   "en": "Weapon (Glaive, Greatsword, Longsword, or Scimitar), Legendary (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst einen Bonus von +3 auf Angriffs ‑ und Schadenswürfe, die du mit dieser magischen Waffe ausführst. Außerdem ignoriert die Waffe Resistenz gegen Hiebschaden. Wenn du mit dieser Waffe eine Kreatur angreifst, die mindestens einen Kopf hat, und beim Angriffswurf eine 20 würfelst, schlägst du der Kreatur einen Kopf ab. Die Kreatur stirbt, wenn sie ohne den verlorenen Kopf nicht leben kann. Kreaturen sind gegen diesen Effekt immun, wenn sie immun gegen Hiebschaden sind, wenn sie keinen Kopf haben oder brauchen oder wenn der SL entscheidet, dass sie zu groß sind, als dass ihr Kopf mit dieser Waffe abgeschlagen werden könnte. Solche Kreaturen erleiden stattdessen zusätzlich 30 Hiebschaden durch den Treffer. Eine Kreatur mit Legendärer Resistenz kann eine tägliche Anwendung dieses Merkmals verbrauchen, um den Kopfverlust zu vermeiden und stattdessen den zusätzlichen Schaden zu erleiden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain a +3 bonus to attack rolls and damage rolls made with this magic weapon. In addition, the weapon ignores Resistance to Slashing damage. When you use this weapon to attack a creature that has at least one head and roll a 20 on the d20 for the attack roll, you cut off one of the creature’s heads. The creature dies if it can’t survive without the lost head. A creature is immune to this effect if it has Immunity to Slashing damage, if it doesn’t have or need a head, or if the GM decides that the creature is too big for its head to be cut off with this weapon. Such a creature instead takes an extra 30 Slashing damage from the hit. If the creature has Legendary Resistance, it can expend one daily use of that trait to avoid losing its head, taking the extra damage instead."
    }
   ]
  }
 },
 {
  "id": "wand-of-binding",
  "name": {
   "de": "Zauberstab der Bindung",
   "en": "Wand of Binding"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung)",
   "en": "Wand, Rare (Requires Attunement)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Wenn du den Zauberstab hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (Rettungswurf‑SG 17). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Monster festhalten",
       "5"
      ],
      [
       "Person festhalten",
       "2"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges."
    },
    {
     "typ": "punkt",
     "text": "Spells. While holding the wand, you can cast one of the spells (save DC 17) on the following table from it. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Hold Monster",
       "5"
      ],
      [
       "Hold Person",
       "2"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-enemy-detection",
  "name": {
   "de": "Zauberstab der Feindeslokalisierung",
   "en": "Wand of Enemy Detection"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung)",
   "en": "Wand, Rare (Requires Attunement)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen. Nun weißt du eine Minute lang, in welcher Richtung sich die nächste dir feindlich gesinnte Kreatur im Abstand von bis zu 18 Metern befindet, jedoch nicht, welchen Abstand sie zu dir hat. Der Zauberstab kann die Anwesenheit von ätherischen, unsichtbaren, verkleideten oder versteckten feindlichen Kreaturen genauso erkennen wie die von offen sichtbaren. Der Effekt endet, wenn du den Zauberstab nicht mehr hältst."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can take a Magic action to expend 1 charge. For 1 minute, you know the direction of the nearest creature Hostile to you within 60 feet, but not its distance from you. The wand can sense the presence of Hostile creatures that are Invisible, ethereal, disguised, or hidden, as well as those in plain sight. The effect ends if you stop holding the wand."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-fear",
  "name": {
   "de": "Zauberstab der Angst",
   "en": "Wand of Fear"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung)",
   "en": "Wand, Rare (Requires Attunement)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen."
    },
    {
     "typ": "punkt",
     "text": "Zauber: Wenn du den Zauberstab hältst, kannst du einen der Zauber der nachstehenden Tabelle damit wirken (Rettungswurf‑SG 15). In der Tabelle ist angegeben, wie viele Ladungen du verbrauchen musst, um den Zauber zu wirken."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Zauber",
      "Ladungskosten"
     ],
     "reihen": [
      [
       "Befehl (nur „Fliehen“ oder „Hinlegen“)",
       "1"
      ],
      [
       "Furcht (18 m, Kegel)",
       "3"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges."
    },
    {
     "typ": "punkt",
     "text": "Spells. While holding the wand, you can cast one of the spells (save DC 15) on the following table from it. The table indicates how many charges you must expend to cast the spell."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Spell",
      "Charge Cost"
     ],
     "reihen": [
      [
       "Command (“flee” or “grovel” only)",
       "1"
      ],
      [
       "Fear (60-foot Cone)",
       "3"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-fireballs",
  "name": {
   "de": "Zauberstab der Feuerbälle",
   "en": "Wand of Fireballs"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung durch einen Zauberwirker)",
   "en": "Wand, Rare (Requires Attunement by a Spellcaster)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du bis zu drei Ladungen verbrauchen, um den Zauber Feuerball (Rettungswurf‑SG 15) damit zu wirken. Mit einer Ladung wirkst du den Zauber auf dem 3. Grad. Du kannst den Zaubergrad mit jeder weitere Ladung, die du verbrauchst, um eins erhöhen."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can expend no more than 3 charges to cast Fireball (save DC 15) from it. For 1 charge, you cast the level 3 version of the spell. You can increase the spell’s level by 1 for each additional charge you expend."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-lightning-bolts",
  "name": {
   "de": "Zauberstab der Blitzschläge",
   "en": "Wand of Lightning Bolts"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung durch einen Zauberwirker)",
   "en": "Wand, Rare (Requires Attunement by a Spellcaster)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du bis zu drei Ladungen verbrauchen, um den Zauber Blitz (Rettungswurf‑SG 15) damit zu wirken. Mit einer Ladung wirkst du den Zauber auf dem 3. Grad. Du kannst den Zaubergrad mit jeder weitere Ladung, die du verbrauchst, um eins erhöhen."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can expend no more than 3 charges to cast Lightning Bolt (save DC 15) from it. For 1 charge, you cast the level 3 version of the spell. You can increase the spell’s level by 1 for each additional charge you expend."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-magic-detection",
  "name": {
   "de": "Zauberstab der Magieerkennung",
   "en": "Wand of Magic Detection"
  },
  "kopfzeile": {
   "de": "Zauberstab, ungewöhnlich",
   "en": "Wand, Uncommon"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat drei Ladungen. Wenn du ihn hältst, kannst du eine Ladung verbrauchen, um den Zauber Magie entdecken damit zu wirken. Der Zauberstab erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 3 charges. While holding it, you can expend 1 charge to cast Detect Magic from it. The wand regains 1d3 expended charges daily at dawn."
    }
   ]
  }
 },
 {
  "id": "wand-of-magic-missiles",
  "name": {
   "de": "Zauberstab der Magischen Geschosse",
   "en": "Wand of Magic Missiles"
  },
  "kopfzeile": {
   "de": "Zauberstab, ungewöhnlich",
   "en": "Wand, Uncommon"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du bis zu drei Ladungen verbrauchen, um den Zauber Magisches Geschoss damit zu wirken. Mit einer Ladung wirkst du den Zauber auf dem 1. Grad. Du kannst den Zaubergrad mit jeder weitere Ladung, die du verbrauchst, um eins erhöhen."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can expend no more than 3 charges to cast Magic Missile from it. For 1 charge, you cast the level 1 version of the spell. You can increase the spell’s level by 1 for each additional charge you expend."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-paralysis",
  "name": {
   "de": "Zauberstab der Paralyse",
   "en": "Wand of Paralysis"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung durch einen Zauberwirker)",
   "en": "Wand, Rare (Requires Attunement by a Spellcaster)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen, um von seiner Spitze einen dünnen blauen Strahl auf eine Kreatur im Abstand von bis zu 18 Metern von dir abzufeuern, die du sehen kannst. Das Ziel muss einen SG‑15‑Konstitutionsrettungswurf bestehen, oder es ist eine Minute lang gelähmt. Das Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Effekt bei ihm."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can take a Magic action to expend 1 charge to cause a thin blue ray to streak from the tip toward a creature you can see within 60 feet of yourself. The target must succeed on a DC 15 Constitution saving throw or have the Paralyzed condition for 1 minute. At the end of each of the target’s turns, it repeats the save, ending the effect on itself on a success."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-polymorph",
  "name": {
   "de": "Zauberstab der Verwandlung",
   "en": "Wand of Polymorph"
  },
  "kopfzeile": {
   "de": "Zauberstab, sehr selten (erfordert Einstimmung durch einen Zauberwirker)",
   "en": "Wand, Very Rare (Requires Attunement by a Spellcaster)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du eine Ladung verbrauchen, um den Zauber Verwandlung (Rettungswurf‑SG 15) damit zu wirken."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can expend 1 charge to cast Polymorph (save DC 15) from it."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-secrets",
  "name": {
   "de": "Zauberstab der Geheimnisse",
   "en": "Wand of Secrets"
  },
  "kopfzeile": {
   "de": "Zauberstab, ungewöhnlich",
   "en": "Wand, Uncommon"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat drei Ladungen und erhält täglich im Morgengrauen 1W3 verbrauchte Ladungen zurück. Wenn du ihn hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen. Falls sich im Abstand von bis zu 18 Metern von dir eine Geheimtür oder eine Falle befindet, pulsiert der Zauberstab und zeigt auf die, die dir am nächsten ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 3 charges and regains 1d3 expended charges daily at dawn. While holding it, you can take a Magic action to expend 1 charge, and if a secret door or trap is within 60 feet of you, the wand pulses and points at the one nearest to you."
    }
   ]
  }
 },
 {
  "id": "wand-of-the-war-mage-1-2-or-3",
  "name": {
   "de": "Zauberstab des Kriegsmagiers +1, +2 oder +3",
   "en": "Wand of the War Mage, +1, +2, or +3"
  },
  "kopfzeile": {
   "de": "Zauberstab, ungewöhnlich (+1), selten (+2) oder sehr selten (+3) (erfordert Einstimmung durch einen Zauberwirker)",
   "en": "Wand, Uncommon (+1), Rare (+2), or Very Rare (+3) (Requires Attunement by a Spellcaster)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "uncommon",
   "rare",
   "veryRare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Während du diesen Zauberstab hältst, erhältst du einen Bonus auf Zauberangriffswürfe, der von der Seltenheit des Zauberstabs abhängt. Außerdem ignorierst du Teildeckung, wenn du einen Zauberangriffswurf ausführst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this wand, you gain a bonus to spell attack rolls determined by the wand’s rarity. In addition, you ignore Half Cover when making a spell attack roll."
    }
   ]
  }
 },
 {
  "id": "wand-of-web",
  "name": {
   "de": "Zauberstab des Netzes",
   "en": "Wand of Web"
  },
  "kopfzeile": {
   "de": "Zauberstab, ungewöhnlich (erfordert Einstimmung durch einen Zauberwirker)",
   "en": "Wand, Uncommon (Requires Attunement by a Spellcaster)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du eine Ladung verbrauchen, um den Zauber Spinnennetz (Rettungswurf‑SG 13) damit zu wirken."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Asche und ist damit zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can expend 1 charge to cast Web (save DC 13) from it."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into ashes and is destroyed."
    }
   ]
  }
 },
 {
  "id": "wand-of-wonder",
  "name": {
   "de": "Zauberstab des Wunders",
   "en": "Wand of Wonder"
  },
  "kopfzeile": {
   "de": "Zauberstab, selten (erfordert Einstimmung)",
   "en": "Wand, Rare (Requires Attunement)"
  },
  "kategorie": "zauberstab",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauberstab hat sieben Ladungen. Wenn du ihn hältst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen, während du auf einen Punkt im Abstand von bis zu 36 Metern von dir zielst. Dieser Punkt wird zum Ursprung eines Zaubers oder eines anderen magischen Effekts, der durch Würfeln anhand der Tabelle „Zauberstab des Wunders: Effekte“ ermittelt wird. Mit dem Zauberstab gewirkte Zauber haben den Rettungswurf‑SG 15. Beträgt die maximale Reichweite des Zaubers normalerweise weniger als 36 Meter, so wird sie zu 36 Metern, wenn der Zauber mit dem Zauberstab gewirkt wird. Wenn ein Effekt mehrere mögliche Ziele hat, bestimmt der SL zufällig, welches von ihnen betroffen ist."
    },
    {
     "typ": "punkt",
     "text": "Ladungen zurückerhalten: Der Zauberstab erhält täglich im Morgengrauen 1W6+1 verbrauchte Ladungen zurück. Wenn du die letzte Ladung des Zauberstabs verbraucht hast, würfle mit 1W20. Bei einer 1 zerfällt der Zauberstab zu Staub und ist damit zerstört."
    },
    {
     "typ": "tabelle",
     "titel": "Zauberstab des Wunders: Effekte",
     "kopf": [
      "1W100",
      "Effekt"
     ],
     "reihen": [
      [
       "1–20",
       "Du wirkst einen Zauber, der vom ausgewählten Punkt ausgeht. Würfle mit 1W10, um den Zauber zu ermitteln. 1–2: Dunkelheit, 3–4: Feenfeuer, 5–6: Feuerball, 7–8: Verlangsamen, 9–10: Stinkende Wolke."
      ],
      [
       "21–25",
       "Am ausgewählten Ursprungspunkt geschieht nichts. Stattdessen bist du bis zum Beginn deines nächsten Zugs betäubt und glaubst, dass soeben etwas Überwältigendes geschehen ist."
      ],
      [
       "26–30",
       "Du wirkst den Zauber Windstoß. Die Linie des Zaubers erstreckt sich von dir zum ausgewählten Ursprungspunkt."
      ],
      [
       "31–35",
       "Am ausgewählten Ursprungspunkt geschieht nichts. Stattdessen erleidest du 1W6 psychischen Schaden."
      ],
      [
       "36–40",
       "Starker Regen fällt eine Minute lang in einem 36 Meter hohen Zylinder mit einem Radius von 18 Metern um den ausgewählten Ursprungspunkt. Während dieser Dauer ist der Wirkungsbereich leicht verschleiert."
      ],
      [
       "41–45",
       "Eine Wolke aus 600 übergroßen Schmetterlingen füllt einen 18 Meter hohen Zylinder mit einem Radius von neun Metern um den ausgewählten Ursprungspunkt. Die Schmetterlinge bleiben zehn Minuten lang erhalten. Während dieser Dauer ist der Wirkungsbereich komplett verschleiert."
      ],
      [
       "46–50",
       "Du wirkst den Zauber Blitz. Die Linie des Zaubers erstreckt sich von dir zum ausgewählten Ursprungspunkt."
      ],
      [
       "51–55",
       "Die dem ausgewählten Ursprungspunkt nächste Kreatur wird vergrößert, als hättest du den Zauber Vergrößern/Verkleinern auf sie gewirkt. Wenn das Ziel ein anderes ist als du und es nicht vom Zauber betroffen werden kann, wirst stattdessen du zum Ziel."
      ],
      [
       "56–60",
       "Eine auf magische Art entstandene Kreatur erscheint in einem freien Bereich so nahe wie möglich beim ausgewählten Ursprungspunkt. Sie steht nicht unter deiner Kontrolle und handelt, wie sie es normalerweise tun würde. Die Kreatur verschwindet, wenn eine Stunde vergangen ist oder wenn ihre Trefferpunkte auf 0 sinken. Würfle mit 1W4, um zu ermitteln, welche Kreatur erscheint. 1: ein Nashorn erscheint, 2: ein Elefant erscheint, 3–4: eine Ratte erscheint."
      ],
      [
       "61–64",
       "Gras bedeckt einen Kreis mit einem Radius von 18 Metern auf dem Boden, dessen Mittelpunkt so nahe wie möglich beim ausgewählten Ursprungspunkt liegt. Wenn dort bereits Gras wächst, nimmt dieses eine Minute lang die zehnfache Größe an."
      ],
      [
       "65–68",
       "Ein Gegenstand, den der SL auswählt, verschwindet in die Ätherebene. Der Gegenstand muss sich im Abstand von bis zu 36 Metern vom ausgewählten Ursprungspunkt befinden. Er darf weder getragen noch gehalten werden und in keiner Abmessung größer als drei Meter sein. Wenn sich keine solchen Gegenstände in Reichweite befinden, geschieht nichts."
      ],
      [
       "69–72",
       "Am ausgewählten Ursprungspunkt geschieht nichts. Stattdessen schrumpfst du, als hättest du den Zauber Vergrößern/Verkleinern auf dich selbst gewirkt, und bleibst eine Minute lang verkleinert."
      ],
      [
       "73–77",
       "Blätter wachsen aus der Kreatur, die dem ausgewählten Ursprungspunkt am nächsten ist. Werden die Blätter nicht abgepflückt, so werden sie nach 24 Stunden braun und fallen ab."
      ],
      [
       "78–82",
       "Am ausgewählten Ursprungspunkt geschieht nichts. Stattdessen geht bunt schimmerndes Licht in einer Ausströmung von neun Metern von dir aus. Jede Kreatur in diesem Bereich muss einen SG-15-Konstitutionsrettungswurf bestehen, oder sie ist eine Minute lang blind. Sie wiederholt den Rettungswurf am Ende jedes ihrer Züge. Bei einem Erfolg endet der Effekt bei ihr."
      ],
      [
       "83–87",
       "Am ausgewählten Ursprungspunkt geschieht nichts. Stattdessen wirkst du Unsichtbarkeit auf dich selbst."
      ],
      [
       "88–92",
       "Am ausgewählten Ursprungspunkt geschieht nichts. Stattdessen schießen 1W4 × 10 Edelsteine im Wert von jeweils 1 GM in einer neun Meter langen, 1,5 Meter breiten Linie von der Spitze des Zauberstabs zum ausgewählten Ursprungspunkt. Jeder Edelstein bewirkt 1 Wuchtschaden. Der Gesamtschaden durch die Edelsteine wird gleichmäßig auf alle Kreaturen in der Linie verteilt."
      ],
      [
       "93–97",
       "Du wirkst den Zauber Verwandlung und zielst auf die Kreatur, die dem ausgewählten Ursprungspunkt am nächsten ist. Würfle mit 1W4, um die neue Gestalt des Ziels zu ermitteln. 1: Schwarzbär, 2: Riesenwespe, 3–4: Frosch."
      ],
      [
       "98–100",
       "Die Kreatur, die dem ausgewählten Ursprungspunkt am nächsten ist, führt einen SG-15-Konstitutionsrettungswurf aus. Misslingt der Wurf, so ist die Kreatur festgesetzt und beginnt zu versteinern. Solange sie auf diese Art festgesetzt ist, wiederholt die Kreatur den Rettungswurf am Ende ihres nächsten Zugs. Bei einem erfolgreichen Rettungswurf endet der Effekt. Misslingt der Wurf, so ist die Kreatur nicht mehr festgesetzt, sondern versteinert. Die Versteinerung bleibt bestehen, bis die Kreatur vom Zauber Vollständige Genesung oder ähnlicher Magie befreit wird."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This wand has 7 charges. While holding it, you can take a Magic action to expend 1 charge while choosing a point within 120 feet of yourself. That location becomes the point of origin of a spell or other magical effect determined by rolling on the Wand of Wonder Effects table. Spells cast from the wand have a save DC of 15. If a spell’s maximum range is normally less than 120 feet, it becomes 120 feet when cast from the wand. If an effect has multiple possible subjects, the GM determines randomly which among them are affected."
    },
    {
     "typ": "punkt",
     "text": "Regaining Charges. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand’s last charge, roll 1d20. On a 1, the wand crumbles into dust and is destroyed."
    },
    {
     "typ": "tabelle",
     "titel": "Wand of Wonder Effects",
     "kopf": [
      "1d100",
      "Effect"
     ],
     "reihen": [
      [
       "01–20",
       "You cast a spell originating from the chosen point. Roll 1d10 to determine the spell: on a 1–2, Darkness; on a 3–4, Faerie Fire; on a 5–6, Fireball; on a 7–8, Slow; on a 9–10, Stinking Cloud."
      ],
      [
       "21–25",
       "Nothing happens at the chosen point of origin. Instead, you have the Stunned condition until the start of your next turn, believing something awesome just happened."
      ],
      [
       "26–30",
       "You cast Gust of Wind. The Line created by the spell extends from you to the chosen point of origin."
      ],
      [
       "31–35",
       "Nothing happens at the chosen point of origin. Instead, you take 1d6 Psychic damage."
      ],
      [
       "36–40",
       "Heavy rain falls for 1 minute in a 120-foothigh, 60-foot-radius Cylinder centered on the chosen point of origin. During that time, the area of effect is Lightly Obscured."
      ],
      [
       "41–45",
       "A cloud of 600 oversized butterflies fills a 60-foot-high, 30-foot-radius Cylinder centered on the chosen point of origin. The butterflies remain for 10 minutes, during which time the area of effect is Heavily Obscured."
      ],
      [
       "46–50",
       "You cast Lightning Bolt. The Line created by the spell extends from you to the chosen point of origin."
      ],
      [
       "51–55",
       "The creature closest to the chosen point of origin is enlarged as if you had cast Enlarge/Reduce on it. If the target isn’t you and can’t be affected by that spell, you become the target instead."
      ],
      [
       "56–60",
       "A magically formed creature appears in an unoccupied space as close to the chosen point of origin as possible. The creature isn’t under your control, acts as it normally would, and disappears after 1 hour or when it drops to 0 Hit Points. Roll 1d4 to determine which creature appears. On a 1, a Rhinoceros appears; on a 2, an Elephant appears; and on a 3–4, a Rat appears."
      ],
      [
       "61–64",
       "Grass covers a 60-foot-radius circle of ground, with the center of that circle as close to the chosen point of origin as possible. Grass that’s already there grows to ten times its normal size and remains overgrown for 1 minute."
      ],
      [
       "65–68",
       "An object of the GM’s choice disappears into the Ethereal Plane. The object must be neither worn nor carried, within 120 feet of the chosen point of origin, and no larger than 10 feet in any dimension. If there are no such objects in range, nothing happens."
      ],
      [
       "69–72",
       "Nothing happens at the chosen point of origin. Instead, you shrink as if you had cast Enlarge/Reduce on yourself and remain in that state for 1 minute."
      ],
      [
       "73–77",
       "Leaves grow from the creature nearest to the chosen point of origin. Unless they are picked off, the leaves turn brown and fall off after 24 hours."
      ],
      [
       "78–82",
       "Nothing happens at the chosen point of origin. Instead, a burst of colorful, shimmering light extends from you in a 30-foot Emanation. Each creature in the area must succeed on a DC 15 Constitution saving throw or have the Blinded condition for 1 minute. A creature repeats the save at the end of each of its turns, ending the effect on itself on a success."
      ],
      [
       "83–87",
       "Nothing happens at the chosen point of origin. Instead, you cast Invisibility on yourself."
      ],
      [
       "88–92",
       "Nothing happens at the chosen point of origin. Instead, a stream of 1d4 × 10 gems, each worth 1 GP, shoots from the wand’s tip in a Line 30 feet long and 5 feet wide toward the chosen point of origin. Each gem deals 1 Bludgeoning damage, and the total damage of the gems is divided equally among all creatures in the Line."
      ],
      [
       "93–97",
       "You cast Polymorph, targeting the creature closest to the chosen point of origin. Roll 1d4 to determine the target’s new form. On a 1, the new form is a Black Bear; on a 2, the new form is a Giant Wasp; on a 3–4, the new form is a Frog."
      ],
      [
       "98–00",
       "The creature closest to the chosen point of origin makes a DC 15 Constitution saving throw. On a failed save, the creature has the Restrained condition and begins to turn to stone. While Restrained in this way, the creature repeats the save at the end of its next turn. On a successful save, the effect ends. On a failed save, the creature has the Petrified condition instead of the Restrained condition. The petrification lasts until the creature is freed by the Greater Restoration spell or similar magic."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "weapon-1-2-or-3",
  "name": {
   "de": "Waffe +1, +2 oder +3",
   "en": "Weapon, +1, +2, or +3"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige einfache Waffe oder Kriegswaffe), ungewöhnlich (+1), selten (+2) oder sehr selten (+3)",
   "en": "Weapon (Any Simple or Martial), Uncommon (+1), Rare (+2), or Very Rare (+3)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "uncommon",
   "rare",
   "veryRare"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du hast einen Bonus auf Angriffs ‑ und Schadenswürfe mit dieser magischen Waffe. Der Bonus hängt von der Seltenheit der Waffe ab."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You have a bonus to attack rolls and damage rolls made with this magic weapon. The bonus is determined by the weapon’s rarity."
    }
   ]
  }
 },
 {
  "id": "weapon-of-warning",
  "name": {
   "de": "Waffe der Warnung",
   "en": "Weapon of Warning"
  },
  "kopfzeile": {
   "de": "Waffe (beliebige einfache Waffe oder Kriegswaffe), ungewöhnlich (erfordert Einstimmung)",
   "en": "Weapon (Any Simple or Martial), Uncommon (Requires Attunement)"
  },
  "kategorie": "waffe",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn sich diese Waffe in deiner Reichweite befindet und du auf sie eingestimmt bist, erhaltet du und deine Verbündeten im Abstand von bis zu neun Metern von dir die folgenden Vorzüge:"
    },
    {
     "typ": "punkt",
     "text": "Alarm: Die Waffe weckt auf magische Art jede betroffene Kreatur, die auf natürliche Art schläft, sobald es zu einem Kampf kommt. Dieser Vorzug weckt keine Kreaturen, die auf magische Art zum Einschlafen gebracht wurden."
    },
    {
     "typ": "punkt",
     "text": "Übernatürliche Bereitschaft: Betroffene Kreaturen sind bei ihren Initiativewürfen im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As long as this weapon is within your reach and you are attuned to it, you and allies within 30 feet of you gain the following benefits."
    },
    {
     "typ": "punkt",
     "text": "Alarm. The weapon magically awakens each subject who is sleeping naturally when combat begins. This benefit doesn’t wake a subject from magically induced sleep."
    },
    {
     "typ": "punkt",
     "text": "Supernatural Readiness. Each subject has Advantage on its Initiative rolls."
    }
   ]
  }
 },
 {
  "id": "well-of-many-worlds",
  "name": {
   "de": "Brunnen der Vielen Welten",
   "en": "Well of Many Worlds"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, legendär",
   "en": "Wondrous Item, Legendary"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "legendary"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieses feine schwarze Tuch ist seidenweich und auf die Größe eines Taschentuchs zusammengefaltet. Ausgebreitet ist es ein kreisrund und hat einen Durchmesser von 1,8 Metern. Du kannst eine magische Aktion ausführen, um den Brunnen der Vielen Welten zu entfalten und auf einer festen Oberfläche zu platzieren. Dort bildet er ein rundes Zweiwegeportal mit einem Durchmesser von drei Metern, das in eine andere Welt oder auf eine andere Existenzebene führt. Jedes Mal, wenn mit dem Gegenstand ein Portal geöffnet wird, entscheidet der SL, wohin es führt. Das Portal bleibt geöffnet, bis eine Kreatur im Abstand von bis zu 1,5 Metern von ihm eine magische Aktion ausführt, um es zu schließen, indem sie das Tuch an den Rändern greift und zusammenfaltet. Hat der Brunnen der Vielen Welten ein Portal geöffnet, so kann er dies erst nach 1W8 Stunden erneut tun."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This fine black cloth, soft as silk, is folded up to the dimensions of a handkerchief. It unfolds into a circular sheet 6 feet in diameter. You can take a Magic action to unfold the Well of Many Worlds and place it on a solid surface, whereupon it forms a two-way, 6-foot-diameter, circular portal to another world or plane of existence. Each time the item opens a portal, the GM decides where it leads. The portal remains open until a creature within 5 feet of it takes a Magic action to close it by taking hold of the edges of the cloth and folding it up. Once the Well of Many Worlds has opened a portal, it can’t do so again for 1d8 hours."
    }
   ]
  }
 },
 {
  "id": "wind-fan",
  "name": {
   "de": "Windfächer",
   "en": "Wind Fan"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich",
   "en": "Wondrous Item, Uncommon"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": false,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Fächer hältst, kannst du den Zauber Windstoß (Rettungswurf‑SG 13) damit wirken. Bei jeder folgenden Verwendung des Fächers vor dem nächsten Morgengrauen besteht ein kumulatives Risiko von 20 Prozent, dass er nicht funktioniert, sondern in nutzlose, nichtmagische Fetzen zerfällt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While holding this fan, you can cast Gust of Wind (save DC 13) from it. Each subsequent time the fan is used before the next dawn, it has a cumulative 20 percent chance of not working; if the fan fails to work, it tears into useless, nonmagical tatters."
    }
   ]
  }
 },
 {
  "id": "winged-boots",
  "name": {
   "de": "Geflügelte Stiefel",
   "en": "Winged Boots"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, ungewöhnlich (erfordert Einstimmung)",
   "en": "Wondrous Item, Uncommon (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "uncommon"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Diese Stiefel haben vier Ladungen und erhalten täglich im Morgengrauen 1W4 verbrauchte Ladungen zurück. Wenn du die Stiefel trägst, kannst du eine magische Aktion ausführen und eine Ladung verbrauchen, um eine Stunde lang über eine Flugbewegungsrate von neun Metern zu verfügen. Fliegst du, wenn die Wirkungsdauer abläuft, so sinkst du um neun Meter pro Runde, bis du landest."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "These boots have 4 charges and regain 1d4 expended charges daily at dawn. While wearing the boots, you can take a Magic action to expend 1 charge, gaining a Fly Speed of 30 feet for 1 hour. If you are flying when the duration expires, you descend at a rate of 30 feet per round until you land."
    }
   ]
  }
 },
 {
  "id": "wings-of-flying",
  "name": {
   "de": "Zauberflügel",
   "en": "Wings of Flying"
  },
  "kopfzeile": {
   "de": "Wundersamer Gegenstand, selten (erfordert Einstimmung)",
   "en": "Wondrous Item, Rare (Requires Attunement)"
  },
  "kategorie": "wundersam",
  "seltenheiten": [
   "rare"
  ],
  "einstimmung": true,
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du diesen Mantel trägst, kannst du eine magische Aktion ausführen, um den Mantel in ein Flügelpaar auf deinem Rücken zu verwandeln. Diese Flügel bleiben erhalten, bis eine Stunde vergangen ist oder du den Effekt als magische Aktion vorzeitig beendest. Die Flügel verleihen dir eine Flugbewegungsrate von 18 Metern. Befindest du dich in der Luft, wenn die Flügel verschwinden, so stürzt du ab. Wenn die Flügel verschwunden sind, kannst du sie erst nach 1W12 Stunden erneut verwenden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "While wearing this cloak, you can take a Magic action to turn the cloak into a pair of wings on your back. The wings lasts for 1 hour or until you end the effect early as a Magic action. The wings give you a Fly Speed of 60 feet. If you are aloft when the wings disappear, you fall. When the wings disappear, you can’t use them again for 1d12 hours."
    }
   ]
  }
 }
];
