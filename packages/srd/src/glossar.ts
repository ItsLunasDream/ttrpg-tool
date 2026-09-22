/**
 * Das Regelglossar des SRD 5.2.1, alle Eintraege, woertlich und in beiden
 * Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/glossar_erzeugen.py) und wird nicht von
 * Hand gepflegt. Welcher englische Eintrag welcher deutsche ist, steht in
 * werkzeug/glossar_paare.json und wird von werkzeug/glossar_pruefen.py
 * gegen Aufbau, Wuerfel, SG und Verweise geprueft. Drei offensichtliche
 * Satzfehler des Originals sind korrigiert; welche, steht in
 * werkzeug/glossar_lesen.py (KORREKTUREN).
 */
import type { Paar } from './namensnennung';

export type Glossarblock =
  | { readonly typ: 'absatz' | 'punkt' | 'stichpunkt'; readonly text: Paar }
  | {
      readonly typ: 'tabelle';
      readonly titel: Paar;
      readonly kopf: { readonly de: readonly string[]; readonly en: readonly string[] };
      readonly reihen: {
        readonly de: readonly (readonly string[])[];
        readonly en: readonly (readonly string[])[];
      };
    }
  | {
      readonly typ: 'liste';
      readonly titel: Paar;
      readonly eintraege: { readonly de: readonly string[]; readonly en: readonly string[] };
    };

export interface Glossareintrag {
  /** Aus dem englischen Namen: „difficult-terrain". */
  readonly id: string;
  readonly name: Paar;
  /** Das Schlagwort hinter dem Namen: zustand, aktion, gefahr, haltung, wirkungsbereich. */
  readonly tag: string | null;
  readonly bloecke: readonly Glossarblock[];
  /** Die Kennungen der Eintraege, auf die „See also" zeigt. */
  readonly verweise: readonly string[];
}

export const GLOSSAR: readonly Glossareintrag[] = [
 {
  "id": "ability-check",
  "name": {
   "de": "Attributswurf",
   "en": "Ability Check"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Attributswurf ist eine W20‑Prüfung, die den Einsatz von einem der sechs Attribute (oder einer bestimmten Fertigkeit, die mit einem Attribut assoziiert ist) repräsentiert, um eine Herausforderung zu überwinden. Siehe auch „Die Spielregeln“ („W20‑Prüfungen“ und „Übung“).",
     "en": "An ability check is a D20 Test that represents using one of the six abilities—or a specific skill associated with an ability—to overcome a challenge. See also “Playing the Game” (“D20 Tests” and “Proficiency”)."
    }
   }
  ],
  "verweise": [
   "proficiency"
  ]
 },
 {
  "id": "ability-score-and-modifier",
  "name": {
   "de": "Attributswert und -modifikator",
   "en": "Ability Score and Modifier"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur hat sechs Attributswerte mit entsprechenden Modifikatoren: Stärke, Geschicklichkeit, Konstitution, Intelligenz, Weisheit und Charisma. Füge den Modifikator hinzu, wenn du eine W20-Prüfung mit dem jeweiligen Attribut ausführst oder von einer Regel aufgefordert wirst, ihn hinzuzufügen. Siehe auch „Die Spielregeln“ („Die sechs Attribute“).",
     "en": "A creature has six ability scores—Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma—each of which has a corresponding modifier. Add the modifier when you make a D20 Test with the corresponding ability or when a rule asks you to do so. See also “Playing the Game” (“The Six Abilities”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "action",
  "name": {
   "de": "Aktion",
   "en": "Action"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "In deinem Zug kannst du eine Aktion ausführen. Wähle aus, ob du eine der Aktionen unten oder eine der besonderen Aktionen ausführst, die deine Merkmale dir gewähren. Siehe auch „Die Spielregeln“ („Aktionen“). Diese Aktionen sind anderswo in diesem Glossar definiert:",
     "en": "On your turn, you can take one action. Choose which action to take from those below or from the special actions provided by your features. See also “Playing the Game” (“Actions”). These actions are defined elsewhere in this glossary:"
    }
   },
   {
    "typ": "liste",
    "titel": {
     "de": "",
     "en": ""
    },
    "eintraege": {
     "de": [
      "Angriff",
      "Ausweichen",
      "Beeinflussen",
      "Helfen",
      "Magie wirken",
      "Rückzug",
      "Spurt",
      "Studieren",
      "Suchen",
      "Verstecken",
      "Verwenden",
      "Vorbereiten"
     ],
     "en": [
      "Attack",
      "Dash",
      "Disengage",
      "Dodge",
      "Help",
      "Hide",
      "Influence",
      "Magic",
      "Ready",
      "Search",
      "Study",
      "Utilize"
     ]
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "advantage",
  "name": {
   "de": "Vorteil",
   "en": "Advantage"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du bei einer W20‑Prüfung im Vorteil bist, würfle mit zwei W20 und verwende das höhere Ergebnis. Für einen Würfelwurf kann nur jeweils ein Vorteil gelten. Vorteil und Nachteil, die für denselben Wurf gelten, heben einander auf. Siehe auch „Die Spielregeln“ („W20‑Prüfungen“).",
     "en": "If you have Advantage on a D20 Test, roll two d20s, and use the higher roll. A roll can’t be affected by more than one Advantage, and Advantage and Disadvantage on the same roll cancel each other. See also “Playing the Game” (“D20 Tests”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "adventure",
  "name": {
   "de": "Abenteuer",
   "en": "Adventure"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Abenteuer ist eine Serie von Begegnungen. Aus den beim Durchspielen erlebten Geschehnissen entwickelt sich eine Geschichte. Siehe auch „Begegnung“.",
     "en": "An adventure is a series of encounters. A story emerges through playing them. See also “Encounter.”"
    }
   }
  ],
  "verweise": [
   "encounter"
  ]
 },
 {
  "id": "alignment",
  "name": {
   "de": "Gesinnung",
   "en": "Alignment"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Die Gesinnung einer Kreatur beschreibt ihre grundsätzlichen ethischen Ansichten und Ideale. Sie ist eine Kombination aus zwei Faktoren: der moralischen Haltung (gut, böse, neutral) und der Einstellung zum Gesetz (rechtschaffen, chaotisch, neutral). Diese Faktoren erlauben neun mögliche Kombinationen, beispielsweise rechtschaffen gut oder neutral böse. Siehe auch „Charaktererstellung“ („Deinen Charakter erstellen“).",
     "en": "A creature’s alignment broadly describes its ethical attitudes and ideals. Alignment is a combination of two factors: one identifies morality (good, evil, or neutral), and the other describes attitudes toward order (lawful, chaotic, or neutral). These factors allow for nine possible combinations, such as Lawful Good and Neutral Evil. See also “Character Creation” (“Create Your Character”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "ally",
  "name": {
   "de": "Verbündeter",
   "en": "Ally"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur ist dein Verbündeter, wenn sie Mitglied deiner Abenteurergruppe oder dein Freund ist, im Kampf auf deiner Seite steht oder von den Regeln oder vom SL als dein Verbündeter bestimmt wurde.",
     "en": "A creature is your ally if it is a member of your adventuring party, your friend, on your side in combat, or a creature that the rules or the GM designates as your ally."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "area-of-effect",
  "name": {
   "de": "Wirkungsbereich",
   "en": "Area of Effect"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "In den Beschreibungen vieler Zauber und anderer Merkmale ist ein Wirkungsbereich angegeben, der üblicherweise eine von sechs Formen annimmt. Diese Formen sind ebenfalls in diesem Glossar definiert:",
     "en": "The descriptions of many spells and other features specify that they have an area of effect, which typically has one of six shapes. These shapes are defined elsewhere in this glossary:"
    }
   },
   {
    "typ": "liste",
    "titel": {
     "de": "",
     "en": ""
    },
    "eintraege": {
     "de": [
      "Ausströmung",
      "Kegel",
      "Kugel",
      "Linie",
      "Würfel",
      "Zylinder"
     ],
     "en": [
      "Cone",
      "Cube",
      "Cylinder",
      "Emanation",
      "Line",
      "Sphere"
     ]
    }
   },
   {
    "typ": "absatz",
    "text": {
     "de": "Jeder Wirkungsbereich hat einen Ursprungspunkt – jenen Ort, von dem der Effekt des Zaubers ausgeht. Die Regeln der jeweiligen Form legen fest, wo sich der Ursprungspunkt befindet. Wenn alle geraden Linien vom Ursprungspunkt zu einem bestimmten Ort im Wirkungsbereich blockiert sind, ist dieser Ort nicht im Wirkungsbereich enthalten. Ein Hindernis muss vollständige Deckung bieten, um eine Linie zu blockieren. Siehe auch „Deckung“. Platziert der Wirker eines Wirkungsbereichs diesen an einem Punkt, den er nicht sehen kann, und liegt zwischen ihm und diesem Punkt ein Hindernis wie eine Mauer, so wird der Ursprungspunkt des Wirkungsbereichs auf der dem Wirker zugewandten Seite des Hindernisses platziert.",
     "en": "An area of effect has a point of origin, a location from which the effect’s energy erupts. The rules for each shape specify how to position its point of origin. If all straight lines extending from the point of origin to a location in the area of effect are blocked, that location isn’t included in the area of effect. To block a line, an obstruction must provide Total Cover. See also “Cover.” If the creator of an area of effect places it at an unseen point and an obstruction—such as a wall— is between the creator and that point, the point of origin comes into being on the near side of the obstruction."
    }
   }
  ],
  "verweise": [
   "cover"
  ]
 },
 {
  "id": "armor-class",
  "name": {
   "de": "Rüstungsklasse",
   "en": "Armor Class"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Die Rüstungsklasse (RK) ist der Zielwert eines Angriffswurfs. Die RK repräsentiert, wie schwierig es ist, ein Ziel zu treffen. Deine Basis‑RK berechnet sich aus 10 plus deinem Geschicklichkeitsmodifikator. Wenn eine Regel dir eine andere Berechnung der Basis‑RK gibt, wählst du aus, welche Berechnung du nutzen willst. Du kannst nicht mehr als eine verwenden. Siehe auch „Angriffswurf“.",
     "en": "An Armor Class (AC) is the target number for an attack roll. AC represents how difficult it is to hit a target. Your base AC calculation is 10 plus your Dexterity modifier. If a rule gives you another base AC calculation, you choose which calculation to use; you can’t use more than one. See also “Attack Roll.”"
    }
   }
  ],
  "verweise": [
   "attack-roll"
  ]
 },
 {
  "id": "armor-training",
  "name": {
   "de": "Rüstungsvertrautheit",
   "en": "Armor Training"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Rüstungsvertrautheit erlaubt dir, Rüstung einer bestimmten Kategorie zu tragen, ohne die folgenden Nachteile zu erleiden: Wenn du leichte, mittelschwere oder schwere Rüstung trägst, mit der du nicht vertraut bist, so bist du bei jeder W20‑Prüfung im Nachteil, die Stärke oder Geschicklichkeit einbezieht, und du kannst keine Zauber wirken. Wenn du einen Schild führst, mit dem du nicht vertraut bist, kannst du seinen Rüstungsklassenbonus nicht nutzen. Siehe auch „Nachteil“ und „Ausrüstung“ („Rüstung“).",
     "en": "Armor training allows you to use armor of a certain category without the following drawbacks. If you wear Light, Medium, or Heavy armor and lack training with it, you have Disadvantage on any D20 Test that involves Strength or Dexterity, and you can’t cast spells. If you use a Shield and lack training with it, you don’t gain its AC bonus. See also “Disadvantage” and “Equipment” (“Armor”)."
    }
   }
  ],
  "verweise": [
   "disadvantage"
  ]
 },
 {
  "id": "attack",
  "name": {
   "de": "Angriff",
   "en": "Attack"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du die Angriffsaktion ausführst, kannst du einen Angriffswurf mit einer Waffe oder einem waffenlosen Angriff ausführen.",
     "en": "When you take the Attack action, you can make one attack roll with a weapon or an Unarmed Strike."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Waffen an- und ablegen: Wenn du einen Angriff ausführst, kannst du als Teil dieser Aktion eine Waffe an‑ oder ablegen. Tu dies entweder vor oder nach dem Angriff. Wenn du eine Waffe vor dem Angriff anlegst, musst du sie bei diesem Angriff nicht zwangsläufig verwenden. Zum Anlegen einer Waffe gehört es, sie aus einer Scheide zu ziehen oder sie aufzuheben. Zum Ablegen einer Waffe gehört es, sie in eine Scheide zu stecken, sie zu verstauen oder fallenzulassen.",
     "en": "Equipping and Unequipping Weapons. You can either equip or unequip one weapon when you make an attack as part of this action. You do so either before or after the attack. If you equip a weapon before an attack, you don’t need to use it for that attack. Equipping a weapon includes drawing it from a sheath or picking it up. Unequipping a weapon includes sheathing, stowing, or dropping it."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Bewegung zwischen Angriffen: Wenn du dich in deinem Zug bewegst und ein Merkmal wie Zusätzlicher Angriff hast, das dir mehr als einen Angriff als Teil der Angriffsaktion gewährt, kannst du die Bewegung teilweise oder ganz nutzen, um dich zwischen deinen Angriffen zu bewegen.",
     "en": "Moving between Attacks. If you move on your turn and have a feature, such as Extra Attack, that gives you more than one attack as part of the Attack action, you can use some or all of that movement to move between those attacks."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "attack-roll",
  "name": {
   "de": "Angriffswurf",
   "en": "Attack Roll"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Angriffswurf ist eine W20‑Prüfung, die einen Angriff mit einer Waffe, einen waffenlosen Angriff oder einen Zauberangriff repräsentiert. Siehe auch „Die Spielregeln“ („W20‑Prüfungen“).",
     "en": "An attack roll is a D20 Test that represents making an attack with a weapon, an Unarmed Strike, or a spell. See also “Playing the Game” (“D20 Tests”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "attitude",
  "name": {
   "de": "Haltung",
   "en": "Attitude"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Monster haben Spielercharakteren gegenüber eine anfängliche Haltung: Sie können ihnen gegenüber freundlich gesinnt, feindlich gesinnt oder gleichgültig sein. Siehe auch „Feindlich gesinnt“, „Freundlich gesinnt“, „Gleichgültig“ und „Beeinflussen“.",
     "en": "A monster has a starting attitude toward a player character: Friendly, Hostile, or Indifferent. See also “Friendly,” “Hostile,” “Indifferent,” and “Influence.”"
    }
   }
  ],
  "verweise": [
   "friendly",
   "hostile",
   "indifferent",
   "influence"
  ]
 },
 {
  "id": "attunement",
  "name": {
   "de": "Einstimmung",
   "en": "Attunement"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Manche magischen Gegenstände erfordern, dass eine bestimmte Bindung an sie hergestellt wird, ehe ihre magischen Eigenschaften genutzt werden können: Dies ist die sogenannte Einstimmung. Eine Kreatur kann auf höchstens drei magische Gegenstände zugleich eingestimmt sein. Siehe auch „Ausrüstung“ („Magische Gegenstände“).",
     "en": "Some magic items require a creature to form a bond—called Attunement—with them before the creature can use an item’s magical properties. A creature can have Attunement with no more than three magic items at a time. See also “Equipment” (“Magic Items”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "blinded",
  "name": {
   "de": "Blind",
   "en": "Blinded"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Blind hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Blinded condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Nicht sehfähig: Eine blinde Kreatur kann nicht sehen, und jeder Attributswurf, der Sicht erfordert, misslingt automatisch.",
     "en": "Can’t See. You can’t see and automatically fail any ability check that requires sight."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil, und deine Angriffswürfe sind im Nachteil.",
     "en": "Attacks Affected. Attack rolls against you have Advantage, and your attack rolls have Disadvantage."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "blindsight",
  "name": {
   "de": "Blindsicht",
   "en": "Blindsight"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Blindsicht erlaubt dir, auf eine bestimmte Reichweite zu sehen, ohne physische Sicht zu benötigen. Auf diese Reichweite kannst du auch bei Dunkelheit oder im Zustand Blind alles sehen, was sich nicht in vollständiger Deckung befindet. Du kannst sogar Kreaturen und Gegenstände mit dem Zustand Unsichtbar sehen.",
     "en": "If you have Blindsight, you can see within a specific range without relying on physical sight. Within that range, you can see anything that isn’t behind Total Cover even if you have the Blinded condition or are in Darkness. Moreover, in that range, you can see something that has the Invisible condition."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "bloodied",
  "name": {
   "de": "Blutig",
   "en": "Bloodied"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur ist blutig, solange sie höchstens die Hälfte ihrer Trefferpunkte hat.",
     "en": "A creature is Bloodied while it has half its Hit Points or fewer remaining."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "bonus-action",
  "name": {
   "de": "Bonusaktion",
   "en": "Bonus Action"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Bonusaktion ist eine besondere Aktion, die du im selben Zug ausführen kannst, in dem du auch eine Aktion ausführst. Du kannst höchstens eine Bonusaktion pro Zug ausführen, und dies nur dann, wenn eine Regel es ausdrücklich besagt. Siehe auch „Die Spielregeln“ („Aktionen“).",
     "en": "A Bonus Action is a special action that you can take on the same turn that you take an action. You can’t take more than one Bonus Action on a turn, and you have a Bonus Action to take only if a rule explicitly says so. See also “Playing the Game” (“Actions”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "breaking-objects",
  "name": {
   "de": "Gegenstände zerstören",
   "en": "Breaking Objects"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Gegenstände können durch Angriffe und manche Zauber beschädigt werden. Dabei gelten die Regeln unten. Wenn ein Gegenstand besonders empfindlich ist, kann der SL einer Kreatur gestatten, ihn mit der Angriffs ‑ oder Verwenden‑Aktion automatisch zu zerstören.",
     "en": "Objects can be harmed by attacks and by some spells, using the rules below. If an object is exceedingly fragile, the GM may allow a creature to break it automatically with the Attack or Utilize action."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Rüstungsklasse: In der Tabelle „Rüstungsklasse eines Gegenstands“ findest du RK-Vorschläge für verschiedene Materialien.",
     "en": "Armor Class. The Object Armor Class table suggests ACs for various substances."
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Rüstungsklasse eines Gegenstands",
     "en": "Object Armor Class"
    },
    "kopf": {
     "de": [
      "RK",
      "Material",
      "RK",
      "Material"
     ],
     "en": [
      "AC",
      "Substance",
      "AC",
      "Substance"
     ]
    },
    "reihen": {
     "de": [
      [
       "11",
       "Papier, Seil, Stoff",
       "19",
       "Eisen, Stahl"
      ],
      [
       "13",
       "Eis, Glas, Kristall",
       "21",
       "Mithral"
      ],
      [
       "15",
       "Holz",
       "23",
       "Adamant"
      ],
      [
       "17",
       "Stein",
       "",
       ""
      ]
     ],
     "en": [
      [
       "11",
       "Cloth, paper, rope",
       "19",
       "Iron, steel"
      ],
      [
       "13",
       "Crystal, glass, ice",
       "21",
       "Mithral"
      ],
      [
       "15",
       "Wood",
       "23",
       "Adamantine"
      ],
      [
       "17",
       "Stone",
       "",
       ""
      ]
     ]
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Trefferpunkte: Ein Gegenstand wird zerstört, wenn seine Trefferpunkte auf 0 sinken. In der Tabelle „Trefferpunkte eines Gegenstands“ findest du Vorschläge für die Trefferpunkte zerbrechlicher sowie stabiler Gegenstände von höchstens großer Größe. Wenn du die Trefferpunkte eines riesigen oder gigantischen Gegenstands nachverfolgen willst, unterteile den Gegenstand in Abschnitte von höchstens großer Größe und verfolge deren Trefferpunkte jeweils separat. Der SL bestimmt, ob das Zerstören eines Teils von einem Gegenstand den gesamten Gegenstand einstürzen lässt.",
     "en": "Hit Points. An object is destroyed when it has 0 Hit Points. The Object Hit Points table suggests Hit Points for fragile and resilient objects that are Large or smaller. To track Hit Points for a Huge or Gargantuan object, divide it into Large or smaller sections, and track each section’s Hit Points separately. The GM determines whether destroying part of an object causes the whole thing to collapse."
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Trefferpunkte eines Gegenstands",
     "en": "Object Hit Points"
    },
    "kopf": {
     "de": [
      "Größe",
      "Zerbrechlich",
      "Stabil"
     ],
     "en": [
      "Size",
      "Fragile",
      "Resilient"
     ]
    },
    "reihen": {
     "de": [
      [
       "Winzig (Flasche, Schloss)",
       "2 (1W4)",
       "5 (2W4)"
      ],
      [
       "Klein (Laute, Truhe)",
       "3 (1W6)",
       "10 (3W6)"
      ],
      [
       "Mittelgroß (Fass, Kronleuchter)",
       "4 (1W8)",
       "18 (4W8)"
      ],
      [
       "Groß (Esstisch, Karren)",
       "5 (1W10)",
       "27 (5W10)"
      ]
     ],
     "en": [
      [
       "Tiny (bottle, lock)",
       "2 (1d4)",
       "5 (2d4)"
      ],
      [
       "Small (chest, lute)",
       "3 (1d6)",
       "10 (3d6)"
      ],
      [
       "Medium (barrel, chandelier)",
       "4 (1d8)",
       "18 (4d8)"
      ],
      [
       "Large (cart, dining table)",
       "5 (1d10)",
       "27 (5d10)"
      ]
     ]
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Schadensarten und Gegenstände: Gegenstände sind immer gegen Gift und psychischen Schaden immun. Der SL könnte entscheiden, dass manche Schadensarten bei einem Gegenstand besonders effektiv oder ineffektiv sind. Beispielsweise eignet sich Wuchtschaden gut, um Gegenstände zu zerschmettern, jedoch schlecht, um etwas zu zerschneiden. Gegenstände aus Papier oder Stoff könnten anfällig für Feuerschaden sein.",
     "en": "Damage Types and Objects. Objects have Immunity to Poison and Psychic damage. The GM might decide that some damage types are more or less effective against an object. For example, Bludgeoning damage works well for smashing things but not for cutting. Paper or cloth objects might have Vulnerability to Fire damage."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Schadensschwellenwert: Große Gegenstände wie Burgmauern haben oft zusätzliche Widerstandskraft, die von einem Schadensschwellenwert repräsentiert wird. Siehe auch „Schadensschwellenwert“.",
     "en": "Damage Threshold. Big objects, such as castle walls, often have extra resilience represented by a damage threshold. See also “Damage Threshold.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Attributswerte: Gegenstände haben keine Attributswerte, es sei denn, eine Regel weist ihnen solche Werte zu. Ohne Attributswerte kann ein Gegenstand keine Attributswürfe ausführen, und er scheitert bei allen Rettungswürfen.",
     "en": "No Ability Scores. An object lacks ability scores unless a rule assigns scores to the object. Without ability scores, an object can’t make ability checks, and it fails all saving throws."
    }
   }
  ],
  "verweise": [
   "damage-threshold"
  ]
 },
 {
  "id": "bright-light",
  "name": {
   "de": "Helles Licht",
   "en": "Bright Light"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine normale Beleuchtung gilt als helles Licht. Siehe auch „Die Spielregeln“ („Erkundung“).",
     "en": "Bright Light is normal illumination. See also “Playing the Game” (“Exploration”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "burning",
  "name": {
   "de": "Brand",
   "en": "Burning"
  },
  "tag": "gefahr",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Brennende Kreaturen und Gegenstände erleiden zu Beginn jedes ihrer Züge 1W4 Feuerschaden. Du kannst dich als Aktion selbst löschen, indem du dir den Zustand Liegend gibst und dich auf dem Boden rollst. Das Feuer erlischt auch, wenn es erstickt oder durch Wasser gelöscht wird.",
     "en": "A burning creature or object takes 1d4 Fire damage at the start of each of its turns. As an action, you can extinguish fire on yourself by giving yourself the Prone condition and rolling on the ground. The fire also goes out if it is doused, submerged, or suffocated."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "burrow-speed",
  "name": {
   "de": "Grabbewegungsrate",
   "en": "Burrow Speed"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Kreaturen mit Grabbewegungsrate können ihre Bewegung ganz oder teilweise verwenden, um sich durch Sand, Erde, Schlamm oder Eis zu bewegen. Sie können sich nicht durch massives Gestein graben, sofern sie nicht über ein Merkmal verfügen, das ihnen dies gestattet. Siehe auch „Bewegungsrate“.",
     "en": "A creature that has a Burrow Speed can use that speed to move through sand, earth, mud, or ice. The creature can’t burrow through solid rock unless the creature has a trait that allows it to do so. See also “Speed.”"
    }
   }
  ],
  "verweise": [
   "speed"
  ]
 },
 {
  "id": "campaign",
  "name": {
   "de": "Kampagne",
   "en": "Campaign"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kampagne besteht aus einer Reihe einzelner Abenteuer. Siehe auch „Abenteuer“.",
     "en": "A campaign is a series of adventures. See also “Adventure.”"
    }
   }
  ],
  "verweise": [
   "adventure"
  ]
 },
 {
  "id": "cantrip",
  "name": {
   "de": "Zaubertrick",
   "en": "Cantrip"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Zaubertrick ist ein Zauber des 0. Grades, der gewirkt werden kann, ohne einen Zauberplatz zu verbrauchen. Siehe auch „Zauber“.",
     "en": "A cantrip is a level 0 spell, which is cast without a spell slot. See also “Spells.”"
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "carrying-capacity",
  "name": {
   "de": "Traglast",
   "en": "Carrying Capacity"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Deine Größe und dein Stärkewert bestimmen das maximale Gewicht in Kilogramm, das du tragen kannst, wie in der Tabelle „Traglast“ dargestellt. In der Tabelle ist außerdem aufgeführt, welches Gewicht du höchstens ziehen, anheben und schieben kannst. Wenn du ein Gewicht ziehst, anhebst oder schiebst, das deine Traglast überschreitet, beträgt deine Bewegungsrate höchstens 1,5 Meter.",
     "en": "Your size and Strength score determine the maximum weight in pounds that you can carry, as shown in the Carrying Capacity table. The table also shows the maximum weight you can drag, lift, or push. While dragging, lifting, or pushing weight in excess of the maximum weight you can carry, your Speed can be no more than 5 feet."
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Traglast",
     "en": "Carrying Capacity"
    },
    "kopf": {
     "de": [
      "Kreaturengröße",
      "Tragen",
      "Anheben/Schieben/Ziehen"
     ],
     "en": [
      "Creature Size",
      "Carry",
      "Drag/Lift/Push"
     ]
    },
    "reihen": {
     "de": [
      [
       "Winzig",
       "Stä. × 3,75 kg",
       "Stä. × 7,5 kg"
      ],
      [
       "Klein/Mittelgroß",
       "Stä. × 7,5 kg",
       "Stä. × 15 kg"
      ],
      [
       "Groß",
       "Stä. × 15 kg",
       "Stä. × 30 kg"
      ],
      [
       "Riesig",
       "Stä. × 30 kg",
       "Stä. × 60 kg"
      ],
      [
       "Gigantisch",
       "Stä. × 60 kg",
       "Stä. × 120 kg"
      ]
     ],
     "en": [
      [
       "Tiny",
       "Str. × 7.5 lb.",
       "Str. × 15 lb."
      ],
      [
       "Small/Medium",
       "Str. × 15 lb.",
       "Str. × 30 lb."
      ],
      [
       "Large",
       "Str. × 30 lb.",
       "Str. × 60 lb."
      ],
      [
       "Huge",
       "Str. × 60 lb.",
       "Str. × 120 lb."
      ],
      [
       "Gargantuan",
       "Str. × 120 lb.",
       "Str. × 240 lb."
      ]
     ]
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "challenge-rating",
  "name": {
   "de": "Herausforderungsgrad",
   "en": "Challenge Rating"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Der Herausforderungsgrad (HG) fasst zusammen, wie gefährlich ein Monster für eine Gruppe von vier Spielercharakteren ist. Vergleiche den HG des Monsters mit der Stufe der Charaktere. Ist der HG höher, so ist das Monster wahrscheinlich eine Bedrohung. Ist der HG niedriger, so ist das Monster wahrscheinlich keine große Bedrohung. Die Umstände und die Anzahl der Spielercharaktere haben erheblichen Einfluss darauf, wie gefährlich ein Monster im Spiel tatsächlich ist. Der Abschnitt „Werkzeugkasten fürs Spiel“ („Kampfbegegnungen“) enthält Ratschläge für den SL, wie der HG beim Planen möglicher Kampfbegegnungen zu verwenden ist. Siehe auch „Wertekasten“.",
     "en": "Challenge Rating (CR) summarizes the threat a monster poses to a group of four player characters. Compare a monster’s CR to the characters’ level. If the CR is higher, the monster is likely a danger. If the CR is lower, the monster likely poses little threat. But circumstances and the number of player characters can significantly alter how threatening a monster is in actual play. “Gameplay Toolbox” (“Combat Encounters”) provides guidance to the GM on using CR while planning potential combat encounters. See also “Stat Block.”"
    }
   }
  ],
  "verweise": [
   "stat-block"
  ]
 },
 {
  "id": "character-sheet",
  "name": {
   "de": "Charakterbogen",
   "en": "Character Sheet"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Charakterbogen ist ein Blatt Papier oder ein digitales Dokument, mit dem du die Daten deines Charakters nachverfolgst. Siehe auch „Charaktererstellung“.",
     "en": "A character sheet is a paper or digital record that you use to track your character’s information. See also “Character Creation.”"
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "charmed",
  "name": {
   "de": "Bezaubert",
   "en": "Charmed"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Bezaubert hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Charmed condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Kein Schaden am Zauberwirker: Du kannst den Zauberwirker weder angreifen noch als Ziel schädigender Fähigkeiten und magischer Effekte auswählen.",
     "en": "Can’t Harm the Charmer. You can’t attack the charmer or target the charmer with damaging abilities or magical effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Sozialer Vorteil: Der Zauberwirker ist bei Attributswürfen, die soziale Interaktionen mit dir betreffen, im Vorteil.",
     "en": "Social Advantage. The charmer has Advantage on any ability check to interact with you socially."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "climbing",
  "name": {
   "de": "Klettern",
   "en": "Climbing"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Beim Klettern kostet dich jeder Meter, den du zurücklegst, einen zusätzlichen Meter Bewegungsrate (zwei zusätzliche Meter in schwierigem Gelände). Du kannst diese zusätzlichen Kosten ignorieren, wenn du über eine Kletterbewegungsrate verfügst und sie beim Klettern verwendest. Nach Ermessen des SL kann das Klettern an rutschigen Oberflächen oder solchen mit wenigen Griffmöglichkeiten einen erfolgreichen SG‑15‑Stärkewurf (Athletik) erfordern.",
     "en": "While you’re climbing, each foot of movement costs 1 extra foot (2 extra feet in Difficult Terrain). You ignore this extra cost if you have a Climb Speed and use it to climb. At the GM’s option, climbing a slippery surface or one with few handholds might require a successful DC 15 Strength (Athletics) check."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "climb-speed",
  "name": {
   "de": "Kletterbewegungsrate",
   "en": "Climb Speed"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Du kannst eine Kletterbewegungsrate anstatt der normalen Bewegungsrate verwenden, um dich an vertikalen Oberflächen zu bewegen, ohne die zusätzliche Bewegung zu benötigen, die beim Klettern normalerweise anfällt. Siehe auch „Bewegungsrate“ und „Klettern“.",
     "en": "A Climb Speed can be used in place of Speed to traverse a vertical surface without expending the extra movement normally associated with climbing. See also “Climbing” and “Speed.”"
    }
   }
  ],
  "verweise": [
   "climbing",
   "speed"
  ]
 },
 {
  "id": "concentration",
  "name": {
   "de": "Konzentration",
   "en": "Concentration"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Manche Zauber und andere Effekte erfordern Konzentration, um aktiv zu bleiben. Dies ist in ihrer Beschreibung angegeben. Wenn der Wirker des Effekts seine Konzentration verliert, endet der Effekt. Hat der Effekt eine maximale Wirkungsdauer, so ist in der Beschreibung des Effekts angegeben, wie lange der Wirker sich auf ihn konzentrieren kann: „Bis zu 1 Minute“, „1 Stunde“ oder eine andere Dauer. Der Wirker kann seine Konzentration jederzeit beenden – dazu ist keine Aktion erforderlich. Folgende Faktoren stören oder beenden die Konzentration:",
     "en": "Some spells and other effects require Concentration to remain active, as specified in their descriptions. If the effect’s creator loses Concentration, the effect ends. If the effect has a maximum duration, the effect’s description specifies how long the creator can concentrate on it: up to 1 minute, 1 hour, or some other duration. The creator can end Concentration at any time (no action required). The following factors break Concentration."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Weiterer Effekt, der Konzentration erfordert: Du verlierst die Konzentration auf einen Effekt, sobald du einen Zauber oder einen sonstigen Effekt wirkst, der ebenfalls Konzentration erfordert.",
     "en": "Another Concentration Effect. You lose Concentration on an effect the moment you start casting a spell that requires Concentration or activate another effect that requires Concentration."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Schaden: Wenn du Schaden erleidest, musst du einen Konstitutionsrettungswurf bestehen, um die Konzentration aufrechtzuerhalten. Der SG beträgt 10 oder die Hälfte des erlittenen Schadens (abgerundet), je nachdem, welcher Wert höher ist. Er kann höchstens 30 betragen.",
     "en": "Damage. If you take damage, you must succeed on a Constitution saving throw to maintain Concentration. The DC equals 10 or half the damage taken (round down), whichever number is higher, up to a maximum DC of 30."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Kampfunfähig oder tot: Deine Konzentration endet, wenn du kampfunfähig wirst oder stirbst.",
     "en": "Incapacitated or Dead. Your Concentration ends if you have the Incapacitated condition or you die."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "condition",
  "name": {
   "de": "Zustand",
   "en": "Condition"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Zustand ist ein vorübergehender Spielstatus. In der Definition des Zustands ist angegeben, wie er auf die betroffene Kreatur wirkt. Verschiedene Regeln definieren, wie ein Zustand beendet werden kann. In diesem Glossar werden folgende Zustände definiert:",
     "en": "A condition is a temporary game state. The definition of a condition says how it affects its recipient, and various rules define how to end a condition. This glossary defines these conditions:"
    }
   },
   {
    "typ": "liste",
    "titel": {
     "de": "",
     "en": ""
    },
    "eintraege": {
     "de": [
      "Betäubt",
      "Bewusstlos",
      "Bezaubert",
      "Blind",
      "Erschöpft",
      "Festgesetzt",
      "Gelähmt",
      "Gepackt",
      "Kampfunfähig",
      "Liegend",
      "Taub",
      "Unsichtbar",
      "Verängstigt",
      "Vergiftet",
      "Versteinert"
     ],
     "en": [
      "Blinded",
      "Charmed",
      "Deafened",
      "Exhaustion",
      "Frightened",
      "Grappled",
      "Incapacitated",
      "Invisible",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Prone",
      "Restrained",
      "Stunned",
      "Unconscious"
     ]
    }
   },
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Zustand kann sich nicht auf sich selbst addieren: Entweder hat eine Kreatur einen bestimmten Zustand, oder sie hat ihn nicht. Die einzige Ausnahme dieser Regel ist der Zustand Erschöpft.",
     "en": "A condition doesn’t stack with itself; a recipient either has a condition or doesn’t. The Exhaustion condition is an exception to that rule."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "cone",
  "name": {
   "de": "Kegel",
   "en": "Cone"
  },
  "tag": "wirkungsbereich",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Kegel ist ein Wirkungsbereich, der von einem Ursprungspunkt in geraden Linien in einer Richtung nach Wahl des Wirkers ausgeht. Die Breite eines Kegels an einem beliebigen Punkt auf seiner Länge entspricht dem Abstand dieses Punkts vom Ursprungspunkt. Beispiel: Ein Kegel ist an einem Punkt auf seiner Länge, der 4,5 Meter vom Ursprungspunkt entfernt liegt, 4,5 Meter breit. Der Effekt, der den Kegel erzeugt, definiert dessen maximale Länge. Der Ursprungspunkt eines Kegels ist nicht im Wirkungsbereich enthalten, es sei denn, der Wirker beschließt dies.",
     "en": "A Cone is an area of effect that extends in straight lines from a point of origin in a direction its creator chooses. A Cone’s width at any point along its length is equal to that point’s distance from the point of origin. For example, a Cone is 15 feet wide at a point along its length that is 15 feet from the point of origin. The effect that creates a Cone specifies its maximum length. A Cone’s point of origin isn’t included in the area of effect unless its creator decides otherwise."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "cover",
  "name": {
   "de": "Deckung",
   "en": "Cover"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Deckung bietet einem Ziel dahinter ein gewisses Maß an Schutz. Es gibt drei Deckungsgrade, von denen jeder dem Ziel einen anderen Vorzug bietet: Teildeckung (Bonus von +2 auf RK und Geschicklichkeitsrettungswürfe), Dreivierteldeckung (Bonus von +5 auf RK und Geschicklichkeitsrettungswürfe) und vollständige Deckung (das Ziel kann nicht direkt anvisiert werden). Für ein Ziel hinter verschiedenen Deckungsgraden gilt nur der Grad, der den höchsten Schutz bietet. Siehe auch „Die Spielregeln“ („Kampf“).",
     "en": "Cover provides a degree of protection to a target behind it. There are three degrees of cover, each of which provides a different benefit to a target: Half Cover (+2 bonus to AC and Dexterity saving throws), Three-Quarters Cover (+5 bonus to AC and Dexterity saving throws), and Total Cover (can’t be targeted directly). If behind more than one degree of cover, a target benefits only from the most protective degree. See also “Playing the Game” (“Combat”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "crawling",
  "name": {
   "de": "Kriechen",
   "en": "Crawling"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du kriechst, kostet dich jeder Meter, den du zurücklegst, einen zusätzlichen Meter Bewegungsrate (zwei zusätzliche Meter in schwierigem Gelände). Siehe auch „Bewegungsrate“.",
     "en": "While you’re crawling, each foot of movement costs 1 extra foot (2 extra feet in Difficult Terrain). See also “Speed.”"
    }
   }
  ],
  "verweise": [
   "speed"
  ]
 },
 {
  "id": "creature",
  "name": {
   "de": "Kreatur",
   "en": "Creature"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Alle Wesen im Spiel einschließlich der Spielercharaktere sind Kreaturen. Siehe auch „Kreaturentyp“.",
     "en": "Any being in the game, including a player’s character, is a creature. See also “Creature Type.”"
    }
   }
  ],
  "verweise": [
   "creature-type"
  ]
 },
 {
  "id": "creature-type",
  "name": {
   "de": "Kreaturentyp",
   "en": "Creature Type"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Alle Kreaturen einschließlich der Spielercharaktere weisen in den Regeln ein Schlagwort auf, das ihren Kreaturentyp bezeichnet. Die meisten Spielercharaktere haben den Kreaturentyp Humanoide. Es gibt folgende Kreaturentypen im Spiel:",
     "en": "Every creature, including every player character, has a tag in the rules that identifies the type of creature it is. Most player characters are of the Humanoid type. These are the game’s creature types:"
    }
   },
   {
    "typ": "liste",
    "titel": {
     "de": "",
     "en": ""
    },
    "eintraege": {
     "de": [
      "Aberration",
      "Celestisch",
      "Drache",
      "Elementar",
      "Feenwesen",
      "Humanoide",
      "Konstrukt",
      "Monstrosität",
      "Pflanze",
      "Riese",
      "Schlick",
      "Tier",
      "Unhold",
      "Untoter"
     ],
     "en": [
      "Aberration",
      "Beast",
      "Celestial",
      "Construct",
      "Dragon",
      "Elemental",
      "Fey",
      "Fiend",
      "Giant",
      "Humanoid",
      "Monstrosity",
      "Ooze",
      "Plant",
      "Undead"
     ]
    }
   },
   {
    "typ": "absatz",
    "text": {
     "de": "Die Typen haben keine eigenen Regeln, doch manche Regeln im Spiel wirken bei unterschiedlichen Kreaturentypen verschieden.",
     "en": "The types don’t have rules themselves, but some rules in the game affect creatures of certain types in different ways."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "critical-hit",
  "name": {
   "de": "Kritischer Treffer",
   "en": "Critical Hit"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du beim W20‑Angriffswurf eine 20 würfelst, erzielst du einen kritischen Treffer, und der Angriff trifft unabhängig von etwaigen Modifikatoren und der RK des Ziels. Bei einem kritischen Treffer kannst du mit zusätzlichen Würfeln würfeln, um den Schaden zu bestimmen, den das Ziel durch den Angriff erleidet. Würfle zweimal mit allen Schadenswürfeln des Angriffs und addiere die Ergebnisse. Wende dann die relevanten Modifikatoren an. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "If you roll a 20 on the d20 for an attack roll, you score a Critical Hit, and the attack hits regardless of any modifiers or the target’s AC. A Critical Hit lets you roll extra dice for the attack’s damage against the target. Roll all of the attack’s damage dice twice and add them together. Then add any relevant modifiers. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "cube",
  "name": {
   "de": "Würfel",
   "en": "Cube"
  },
  "tag": "wirkungsbereich",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Würfel ist ein Wirkungsbereich, der in geraden Linien von einem Ursprungspunkt an einer beliebigen Stelle auf einer der Würfelseiten ausgeht. Der Effekt, der den Würfel erzeugt, definiert dessen Größe in Form seiner Kantenlänge. Der Ursprungspunkt eines Würfels ist nicht im Wirkungsbereich enthalten, es sei denn, der Wirker beschließt dies.",
     "en": "A Cube is an area of effect that extends in straight lines from a point of origin located anywhere on a face of the Cube. The effect that creates a Cube specifies its size, which is the length of each side. A Cube’s point of origin isn’t included in the area of effect unless its creator decides otherwise."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "curses",
  "name": {
   "de": "Flüche",
   "en": "Curses"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Durch manche Effekte im Spiel wird eine Kreatur oder ein Gegenstand verflucht. Der Effekt, der den Fluch bewirkt, definiert dessen Auswirkungen. Flüche können durch die Zauber Fluch brechen und Vollständige Genesung sowie andere magische Effekte entfernt werden, die ausdrücklich Flüche beenden.",
     "en": "Some game effects curse a creature or an object. The effect that confers a curse defines what the curse does. Curses can be removed by the Remove Curse and Greater Restoration spells or other magic that explicitly ends curses."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "cylinder",
  "name": {
   "de": "Zylinder",
   "en": "Cylinder"
  },
  "tag": "wirkungsbereich",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Zylinder ist ein Wirkungsbereich, der in geraden Linien von einem Ursprungspunkt in der Mitte einer der kreisförmigen Stirnseiten des Zylinders ausgeht. Der Effekt, der den Zylinder erzeugt, definiert den Radius der Zylinderbasis sowie die Höhe des Zylinders. Der Ursprungspunkt des Zylinders ist im Wirkungsbereich des Zaubers enthalten.",
     "en": "A Cylinder is an area of effect that extends in straight lines from a point of origin located at the center of the circular top or bottom of the Cylinder. The effect that creates a Cylinder specifies the radius of the Cylinder’s base and the Cylinder’s height. A Cylinder’s point of origin is included in the area of effect."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "d20-test",
  "name": {
   "de": "W20-Prüfung",
   "en": "D20 Test"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "W20‑Prüfungen umfassen die drei wichtigsten W20‑Würfe des Spiels: Attributswürfe, Angriffswürfe und Rettungswürfe. Wenn etwas im Spiel W20-Prüfungen beeinflusst, so gilt dies für alle drei Arten. Der SL bestimmt, ob eine W20‑Prüfung unter den gegebenen Umständen angebracht ist. Siehe auch „Die Spielregeln“ („W20‑Prüfungen“).",
     "en": "D20 Tests encompass the three main d20 rolls of the game: ability checks, attack rolls, and saving throws. If something in the game affects D20 Tests, it affects all three of these rolls. The GM determines whether a D20 Test is warranted in a given circumstance. See also “Playing the Game” (“D20 Tests”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "damage",
  "name": {
   "de": "Schaden",
   "en": "Damage"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Schaden repräsentiert Wirkungen, die eine Kreatur oder einen Gegenstand Trefferpunkte verlieren lassen.",
     "en": "Damage represents harm that causes a creature or an object to lose Hit Points."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "damage-roll",
  "name": {
   "de": "Schadenswurf",
   "en": "Damage Roll"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Schadenswurf ist ein Würfelwurf, der von relevanten Modifikatoren beeinflusst wird und einem Ziel Schaden zufügt. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "A damage roll is a die roll, adjusted by any applicable modifiers, that deals damage to a target. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "damage-threshold",
  "name": {
   "de": "Schadensschwellenwert",
   "en": "Damage Threshold"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Kreaturen und Gegenstände mit Schadensschwellenwert sind gegen alle Schadensarten immun, es sei denn, sie erleiden durch einen einzigen Angriff oder Effekt so viel Schaden, dass der Schadensschwellenwert erreicht oder überschritten wird. In diesem Fall erleiden sie den gesamten entsprechenden Schaden. Jeglicher Schaden, der den Schadensschwellenwert unterschreitet, gilt als oberflächlich und verringert keine Trefferpunkte. Beispiel: Wenn ein Gegenstand einen Schadensschwellenwert von 10 hat, erleidet er keinen Schaden, wenn ihm 9 Schaden zugefügt wird, da dieser Schaden den Schwellenwert nicht erreicht. Erleidet dieser Gegenstand 11 Schaden, so erleidet er diesen gesamten Schaden.",
     "en": "A creature or an object that has a damage threshold has Immunity to all damage unless it takes an amount of damage from a single attack or effect equal to or greater than its damage threshold, in which case it takes that entire instance of damage. Any damage that fails to meet or exceed the damage threshold is superficial and doesn’t reduce Hit Points. For example, if an object has a damage threshold of 10, the object takes no damage if 9 damage is dealt to it, since that damage fails to exceed the threshold. If the same object is dealt 11 damage, it takes all of that damage."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "damage-types",
  "name": {
   "de": "Schadensarten",
   "en": "Damage Types"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Angriffe und andere schädliche Effekte bewirken unterschiedliche Schadensarten. Die Schadensarten weisen zwar keine eigenen Regeln auf, doch es gibt andere Regeln wie die für Resistenzen, die auf Schadensarten basieren. Die Tabelle „Schadensarten“ bietet Beispiele, um dem SL zu helfen, neuen Effekten passende Schadensarten zuzuweisen.",
     "en": "Attacks and other harmful effects deal different types of damage. Damage types have no rules of their own, but other rules, such as Resistance, rely on the types. The Damage Types table offers examples to help a GM assign a type to a new effect."
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Schadensarten",
     "en": "Damage Types"
    },
    "kopf": {
     "de": [
      "Typ",
      "Beispiele"
     ],
     "en": [
      "Type",
      "Examples"
     ]
    },
    "reihen": {
     "de": [
      [
       "Blitz",
       "Elektrizität"
      ],
      [
       "Energie",
       "Reine magische Energie"
      ],
      [
       "Feuer",
       "Flammen, unerträgliche Hitze"
      ],
      [
       "Gift",
       "Gifte, toxische Gase"
      ],
      [
       "Gleißend",
       "Heilige Energie, sengende Strahlung"
      ],
      [
       "Hieb",
       "Klauen, schneidende Gegenstände"
      ],
      [
       "Kälte",
       "Eisexplosionen, gefrierendes Wasser"
      ],
      [
       "Nekrotisch",
       "Lebenszehrende Energie"
      ],
      [
       "Psychisch",
       "Bewusstseinsschädigende Energie"
      ],
      [
       "Säure",
       "Ätzende Flüssigkeiten, Verdauungssäfte"
      ],
      [
       "Schall",
       "Erschütternde Geräusche"
      ],
      [
       "Stich",
       "Reißzähne, Stichwaffen"
      ],
      [
       "Wucht",
       "Stumpfe Gegenstände, Stürze, Umschlingung"
      ]
     ],
     "en": [
      [
       "Acid",
       "Corrosive liquids, digestive enzymes"
      ],
      [
       "Bludgeoning",
       "Blunt objects, constriction, falling"
      ],
      [
       "Cold",
       "Freezing water, icy blasts"
      ],
      [
       "Fire",
       "Flames, unbearable heat"
      ],
      [
       "Force",
       "Pure magical energy"
      ],
      [
       "Lightning",
       "Electricity"
      ],
      [
       "Necrotic",
       "Life-draining energy"
      ],
      [
       "Piercing",
       "Fangs, puncturing objects"
      ],
      [
       "Poison",
       "Toxic gas, venom"
      ],
      [
       "Psychic",
       "Mind-rending energy"
      ],
      [
       "Radiant",
       "Holy energy, searing radiation"
      ],
      [
       "Slashing",
       "Claws, cutting objects"
      ],
      [
       "Thunder",
       "Concussive sound"
      ]
     ]
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "darkness",
  "name": {
   "de": "Dunkelheit",
   "en": "Darkness"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Dunkle Bereiche sind komplett verschleiert. Siehe auch „Komplett verschleiert“ und „Die Spielregeln“ („Erkundung“).",
     "en": "An area of Darkness is Heavily Obscured. See also “Heavily Obscured” and “Playing the Game” (“Exploration”)."
    }
   }
  ],
  "verweise": [
   "heavily-obscured"
  ]
 },
 {
  "id": "darkvision",
  "name": {
   "de": "Dunkelsicht",
   "en": "Darkvision"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du Dunkelsicht hast, kannst du auf die angegebene Reichweite bei dämmrigem Licht sehen wie bei hellem Licht und bei Dunkelheit wie bei dämmrigem Licht. Farben nimmst du bei Dunkelheit nur als Graustufen wahr. Siehe auch „Die Spielregeln“ („Erkundung“).",
     "en": "If you have Darkvision, you can see in Dim Light within a specified range as if it were Bright Light and in Darkness within that range as if it were Dim Light. You discern colors in that Darkness only as shades of gray. See also “Playing the Game” (“Exploration”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "dash",
  "name": {
   "de": "Spurt",
   "en": "Dash"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du die Spurt‑Aktion ausführst, erhältst du für diesen Zug zusätzliche Bewegung. Dieser Zuwachs entspricht der Höhe deiner Bewegungsrate einschließlich relevanter Modifikatoren. Beispiel: Bei einer Bewegungsrate von neun Metern kannst du dich mit einem Spurt insgesamt bis zu 18 Meter weit bewegen. Wird deine Bewegungsrate von neun Metern auf 4,5 Meter verringert, so kannst du dich mit einem Spurt bis zu neun Meter weit bewegen. Wenn du eine besondere Bewegungsrate wie eine Flugbewegungsrate oder eine Schwimmbewegungsrate hast, kannst du diese statt deiner normalen Bewegungsrate bei der Spurt‑Aktion verwenden. Du wählst bei jeder Spurt‑Aktion aus, welche Bewegungsrate du verwendest. Siehe auch „Bewegungsrate“.",
     "en": "When you take the Dash action, you gain extra movement for the current turn. The increase equals your Speed after applying any modifiers. With a Speed of 30 feet, for example, you can move up to 60 feet on your turn if you Dash. If your Speed of 30 feet is reduced to 15 feet, you can move up to 30 feet this turn if you Dash. If you have a special speed, such as a Fly Speed or Swim Speed, you can use that speed instead of your Speed when you take this action. You choose which speed to use each time you take it. See also “Speed.”"
    }
   }
  ],
  "verweise": [
   "speed"
  ]
 },
 {
  "id": "dead",
  "name": {
   "de": "Tot",
   "en": "Dead"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine tote Kreatur hat keine Trefferpunkte und kann auch keine zurückerhalten, sofern sie nicht zunächst durch Magie wie die Zauber Tote erwecken oder Wiederbeleben wiederbelebt wird. Wenn ein solcher Zauber gewirkt wird, weiß der Geist, wer ihn wirkt, und kann sich weigern. Der Geist einer toten Kreatur hat den Körper verlassen und sich auf die Äußeren Ebenen begeben. Um die Kreatur wiederzubeleben, muss der Geist zurückgerufen werden. Wenn die Kreatur ins Leben zurückkehrt, werden ihre aktuellen Trefferpunkte durch den wiederbelebenden Effekt bestimmt. Sofern nicht anders angegeben, wirken alle Zustände, magischen Krankheiten und Flüche auf die wiederbelebte Kreatur, die auch zum Zeitpunkt ihres Todes auf sie gewirkt haben, sofern die jeweiligen Wirkungsdauern noch nicht abgelaufen sind. Wenn die Kreatur mit Erschöpfungsstufen gestorben ist, kehrt sie mit einer Erschöpfungsstufe weniger ins Leben zurück. War die Kreatur auf mindestens einen magischen Gegenstand eingestimmt, so ist sie dies jetzt nicht mehr.",
     "en": "A dead creature has no Hit Points and can’t regain them unless it is first revived by magic such as the Raise Dead or Revivify spell. When such a spell is cast, the spirit knows who is casting it and can refuse. The spirit of a dead creature has left the body and departed for the Outer Planes, and reviving the creature requires calling the spirit back. If the creature returns to life, the revival effect determines the creature’s current Hit Points. Unless otherwise stated, the creature returns to life with any conditions, magical contagions, or curses that were affecting it at death if the durations of those effects are still ongoing. If the creature died with any Exhaustion levels, it returns with 1 fewer level. If the creature had Attunement to one or more magic items, it is no longer attuned to them."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "deafened",
  "name": {
   "de": "Taub",
   "en": "Deafened"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Taub hast, wirkt folgender Effekt auf dich:",
     "en": "While you have the Deafened condition, you experience the following effect."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Nicht hörfähig: Du kannst nicht hören, und jeder Attributswurf, der Hörvermögen erfordert, misslingt automatisch.",
     "en": "Can’t Hear. You can’t hear and automatically fail any ability check that requires hearing."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "death-saving-throw",
  "name": {
   "de": "Todesrettungswurf",
   "en": "Death Saving Throw"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn Spielercharakter seinen Zug mit 0 Trefferpunkten beginnt, muss er einen Todesrettungswurf ausführen. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "A player character must make a Death Saving Throw (also called a Death Save) if they start their turn with 0 Hit Points. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "dehydration",
  "name": {
   "de": "Dehydrierung",
   "en": "Dehydration"
  },
  "tag": "gefahr",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Kreaturen benötigen täglich eine gewisse Menge von Wasser je nach ihrer Größe, wie in der Tabelle „Täglicher Wasserbedarf“ dargestellt. Eine Kreatur, die weniger als die Hälfte der täglich erforderlichen Wassermenge trinkt, erhält am Ende des Tages eine Erschöpfungsstufe. Erschöpfung durch Dehydrierung kann nicht entfernt werden, ehe die Kreatur nicht die vollständige Tagesmenge an Wasser trinkt. Siehe auch „Erschöpfung“.",
     "en": "A creature requires an amount of water per day based on its size, as shown in the Water Needs per Day table. A creature that drinks less than half the required water for a day gains 1 Exhaustion level at the day’s end. Exhaustion caused by dehydration can’t be removed until the creature drinks the full amount of water required for a day. See also “Exhaustion.”"
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Täglicher Wasserbedarf",
     "en": "Water Needs per Day"
    },
    "kopf": {
     "de": [
      "Größe",
      "Wassermenge",
      "Größe",
      "Wassermenge"
     ],
     "en": [
      "Size",
      "Water",
      "Size",
      "Water"
     ]
    },
    "reihen": {
     "de": [
      [
       "Winzig",
       "1 Liter",
       "Groß",
       "16 Liter"
      ],
      [
       "Klein",
       "4 Liter",
       "Riesig",
       "64 Liter"
      ],
      [
       "Mittel",
       "4 Liter",
       "Gigantisch",
       "256 Liter"
      ]
     ],
     "en": [
      [
       "Tiny",
       "1/4 gallon",
       "Large",
       "4 gallons"
      ],
      [
       "Small",
       "1 gallon",
       "Huge",
       "16 gallons"
      ],
      [
       "Medium",
       "1 gallon",
       "Gargantuan",
       "64 gallons"
      ]
     ]
    }
   }
  ],
  "verweise": [
   "exhaustion"
  ]
 },
 {
  "id": "difficult-terrain",
  "name": {
   "de": "Schwieriges Gelände",
   "en": "Difficult Terrain"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn ein Bereich schwieriges Gelände ist, kostet jeder Meter Bewegung in diesem Bereich einen zusätzlichen Meter Bewegungsrate. Beispiel: Eine Bewegung von 1,5 Metern in schwierigem Gelände kostet drei Meter Bewegungsrate. Schwieriges Gelände ist nicht kumulativ. Entweder ist ein Bereich schwieriges Gelände, oder er ist es nicht. Ein Bereich ist schwieriges Gelände, wenn er einen der folgenden Faktoren oder etwas Ähnliches enthält:",
     "en": "If a space is Difficult Terrain, every foot of movement in that space costs 1 extra foot. For example, moving 5 feet through Difficult Terrain costs 10 feet of movement. Difficult Terrain isn’t cumulative; either a space is Difficult Terrain or it isn’t. A space is Difficult Terrain if the space contains any of the following or something similar:"
    }
   },
   {
    "typ": "liste",
    "titel": {
     "de": "",
     "en": ""
    },
    "eintraege": {
     "de": [
      "Dickicht, Eis, Schutt oder viel Schnee",
      "Flüssigkeit, die zwischen knöchel- und hüfthoch steht",
      "Ein Gefälle von mindestens 20 Grad",
      "Eine Kreatur, die weder von winziger Größe noch dein Verbündeter ist",
      "Möbel für Kreaturen von mindestens deiner Größenkategorie",
      "Eine schmale Öffnung, durch die Kreaturen passen, die eine Größenkategorie kleiner als du sind"
     ],
     "en": [
      "A creature that isn’t Tiny or your ally",
      "Furniture that is sized for creatures of your size or larger",
      "Heavy snow, ice, rubble, or undergrowth",
      "Liquid that’s between shin- and waist-deep",
      "A narrow opening sized for a creature one size smaller than you",
      "A slope of 20 degrees or more"
     ]
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "difficulty-class",
  "name": {
   "de": "Schwierigkeitsgrad",
   "en": "Difficulty Class"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Der Schwierigkeitsgrad (SG) ist der Zielwert für einen Attributswurf oder einen Rettungswurf. Siehe auch „Die Spielregeln“ („W20‑Prüfungen“).",
     "en": "A Difficulty Class (DC) is the target number for an ability check or a saving throw. See also “Playing the Game” (“D20 Tests”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "dim-light",
  "name": {
   "de": "Dämmriges Licht",
   "en": "Dim Light"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Bereich mit dämmrigem Licht ist leicht verschleiert. Siehe auch „Leicht verschleiert“ und „Die Spielregeln“ („Erkundung“).",
     "en": "An area with Dim Light is Lightly Obscured. See also “Lightly Obscured” and “Playing the Game” (“Exploration”)."
    }
   }
  ],
  "verweise": [
   "lightly-obscured"
  ]
 },
 {
  "id": "disadvantage",
  "name": {
   "de": "Nachteil",
   "en": "Disadvantage"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du bei einer W20‑Prüfung im Nachteil bist, würfle mit zwei W20 und verwende das niedrigere Ergebnis. Für einen Würfelwurf kann nur jeweils ein Nachteil gelten. Vorteil und Nachteil, die für denselben Wurf gelten, heben einander auf. Siehe auch „Die Spielregeln“ („W20‑Prüfungen“).",
     "en": "If you have Disadvantage on a D20 Test, roll two d20s and use the lower roll. A roll can’t be affected by more than one Disadvantage, and Advantage and Disadvantage on the same roll cancel each other. See also “Playing the Game” (“D20 Tests”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "disengage",
  "name": {
   "de": "Rückzug",
   "en": "Disengage"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du die Rückzug‑Aktion ausführst, provoziert deine Bewegung in diesem Zug keine Gelegenheitsangriffe.",
     "en": "If you take the Disengage action, your movement doesn’t provoke Opportunity Attacks for the rest of the current turn."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "dodge",
  "name": {
   "de": "Ausweichen",
   "en": "Dodge"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Die Ausweichaktion bietet dir die folgenden Vorzüge: Bis zum Beginn deines nächsten Zugs ist jeder Angriffswurf gegen dich im Nachteil, sofern du den Angreifer sehen kannst, und du bist bei Geschicklichkeitsrettungswürfen im Vorteil. Du verlierst diese Vorzüge, wenn du kampfunfähig bist oder deine Bewegungsrate 0 beträgt.",
     "en": "If you take the Dodge action, you gain the following benefits: until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage. You lose these benefits if you have the Incapacitated condition or if your Speed is 0."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "emanation",
  "name": {
   "de": "Ausströmung",
   "en": "Emanation"
  },
  "tag": "wirkungsbereich",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Ausströmung ist ein Wirkungsbereich, der von einer Kreatur oder einem Gegenstand in geraden Linien in alle Richtungen ausgeht. Der Effekt, der die Ausströmung erzeugt, definiert deren Wirkungsdistanz. Eine Ausströmung bewegt sich mit ihrem Ursprung (Kreatur oder Gegenstand), sofern sie kein unmittelbarer oder ortsfester Effekt ist. Der Ursprung ist nicht im Wirkungsbereich enthalten, es sei denn, der Wirker beschließt dies.",
     "en": "An Emanation is an area of effect that extends in straight lines from a creature or an object in all directions. The effect that creates an Emanation specifies the distance it extends. An Emanation moves with the creature or object that is its origin unless it is an instantaneous or a stationary effect. An Emanation’s origin (creature or object) isn’t included in the area of effect unless its creator decides otherwise."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "encounter",
  "name": {
   "de": "Begegnung",
   "en": "Encounter"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Begegnung ist eine Szene in einem Abenteuer, die Teil von mindestens einer der drei Säulen des Spiels ist: soziale Interaktion, Erkundung oder Kampf. Siehe auch „Die Spielregeln“ („Soziale Interaktion“, „Erkundung“ und „Kampf“).",
     "en": "An encounter is a scene in an adventure that is part of at least one of the game’s three pillars: social interaction, exploration, or combat. See also “Playing the Game” (“Social Interaction,” “Exploration,” and “Combat”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "enemy",
  "name": {
   "de": "Gegner",
   "en": "Enemy"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur ist dein Gegner, wenn sie im Kampf gegen dich kämpft, dir aktiv schaden will oder von den Regeln oder vom SL als dein Gegner bestimmt wurde.",
     "en": "A creature is your enemy if it fights against you in combat, actively works to harm you, or is designated as your enemy by the rules or GM."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "exhaustion",
  "name": {
   "de": "Erschöpfung",
   "en": "Exhaustion"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Erschöpft hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Exhaustion condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Erschöpfungsstufen: Dieser Zustand ist kumulativ. Wann immer er auf dich wirkt, erhältst du 1 Erschöpfungsstufe hinzu. Wenn du sechs Erschöpfungsstufen hast, stirbst du.",
     "en": "Exhaustion Levels. This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte W20-Prüfungen: Wenn du eine W20‑Prüfung ausführst, ist das Ergebnis um einen Betrag in doppelter Höhe deiner Erschöpfungsstufen verringert.",
     "en": "D20 Tests Affected. When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Verringerte Bewegungsrate: Deine Bewegungsrate ist um eine Anzahl von Metern in Höhe des 1,5‑Fachen deiner Erschöpfungsstufe verringert.",
     "en": "Speed Reduced. Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Erschöpfungsstufen entfernen: Wenn du eine lange Rast abschließt, wird eine deiner Erschöpfungsstufen entfernt. Sobald du keine Erschöpfungsstufen mehr hast, endet der Zustand.",
     "en": "Removing Exhaustion Levels. Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "experience-points",
  "name": {
   "de": "Erfahrungspunkte",
   "en": "Experience Points"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Charaktere verdienen Erfahrungspunkte (EP), wenn sie Herausforderungen meistern und Abenteuer abschließen. Die EP werden vom Spielleiter verliehen. Wenn die EP eines Charakters bestimmte Schwellenwerte erreichen, wird die Stufe des Charakters erhöht. Siehe auch „Stufenaufstiege“.",
     "en": "As they overcome challenges and complete adventures, characters earn Experience Points (XP), which are awarded by the Game Master. When a character’s XP total crosses certain thresholds, the character’s level increases. See also “Level Advancement.”"
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "expertise",
  "name": {
   "de": "Expertise",
   "en": "Expertise"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Expertise ist ein Merkmal, das deine Anwendung von Fertigkeiten verbessert, in denen du Übung hast. Wenn du einen Attributswurf mit einer Fertigkeit ausführst, in der du Übung und Expertise hast, ist dein Übungsbonus bei diesem Wurf verdoppelt, sofern der Bonus nicht schon durch ein anderes Merkmal verdoppelt wird. Wenn du Expertise erhältst, dann in einer Fertigkeit, in der du Übung hast. Du kannst nur einmal Expertise in einer Fertigkeit haben, in der du Übung hast. Siehe auch „Die Spielregeln“ („Übung“).",
     "en": "Expertise is a feature that enhances your use of a skill proficiency. When you make an ability check with a skill proficiency in which you have Expertise, your Proficiency Bonus is doubled for that check unless the bonus is doubled by another feature. If you gain Expertise, you gain it in one skill in which you have proficiency. You can’t have Expertise in the same skill proficiency more than once. See also “Playing the Game” (“Proficiency”)."
    }
   }
  ],
  "verweise": [
   "proficiency"
  ]
 },
 {
  "id": "falling",
  "name": {
   "de": "Sturz",
   "en": "Falling"
  },
  "tag": "gefahr",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Am Ende eines Sturzes erleidet eine Kreatur 1W6 Wuchtschaden pro drei Meter, die sie gestürzt ist (höchstens 20W6). Nach dem Sturz hat sie den Zustand Liegend, sofern sie den Schaden durch den Sturz nicht vermeiden konnte. Wenn eine Kreatur in Wasser oder eine andere Flüssigkeit stürzt, kann sie ihre Reaktion verwenden und einen SG‑15‑Geschicklichkeitswurf (Akrobatik) oder‑Stärkewurf (Athletik) ausführen, um mit dem Kopf oder den Füßen voran aufzukommen. Bei einem Erfolg wird der Fallschaden halbiert.",
     "en": "A creature that falls takes 1d6 Bludgeoning damage at the end of the fall for every 10 feet it fell, to a maximum of 20d6. When the creature lands, it has the Prone condition unless it avoids taking any damage from the fall. A creature that falls into water or another liquid can use its Reaction to make a DC 15 Strength (Athletics) or Dexterity (Acrobatics) check to hit the surface head or feet first. On a successful check, any damage resulting from the fall is halved."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "flying",
  "name": {
   "de": "Fliegen",
   "en": "Flying"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Verschiedene Effekte können eine Kreatur flugfähig machen. Wenn du im Flug einen der Zustände Kampfunfähig oder Liegend erhältst oder deine Flugbewegungsrate auf 0 sinkt, stürzt du ab. Du kannst unter diesen Umständen in der Luft bleiben, sofern du schweben kannst. Siehe auch „Flugbewegungsrate“ und „Stürzen“.",
     "en": "A variety of effects allow a creature to fly. While flying, you fall if you have the Incapacitated or Prone condition or your Fly Speed is reduced to 0. You can stay aloft in those circumstances if you can hover. See also “Falling” and “Fly Speed.”"
    }
   }
  ],
  "verweise": [
   "falling",
   "fly-speed"
  ]
 },
 {
  "id": "fly-speed",
  "name": {
   "de": "Flugbewegungsrate",
   "en": "Fly Speed"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Flugbewegungsrate kann verwendet werden, um sich durch die Luft zu bewegen. Mit einer Flugbewegungsrate kannst du in der Luft bleiben, bis du landest, abstürzt oder stirbst. Siehe auch „Bewegungsrate“ und „Fliegen“.",
     "en": "A Fly Speed can be used to travel through the air. While you have a Fly Speed, you can stay aloft until you land, fall, or die. See also “Flying” and “Speed.”"
    }
   }
  ],
  "verweise": [
   "flying",
   "speed"
  ]
 },
 {
  "id": "friendly",
  "name": {
   "de": "Freundlich gesinnt",
   "en": "Friendly"
  },
  "tag": "haltung",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine freundlich gesinnte Kreatur steht dir positiv gegenüber. Du bist bei Attributswürfen zum Beeinflussen von Kreaturen, die dir freundlich gesinnt sind, im Vorteil. Siehe auch „Beeinflussen“.",
     "en": "A Friendly creature views you favorably. You have Advantage on an ability check to influence a Friendly creature. See also “Influence.”"
    }
   }
  ],
  "verweise": [
   "influence"
  ]
 },
 {
  "id": "frightened",
  "name": {
   "de": "Verängstigt",
   "en": "Frightened"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Verängstigt hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Frightened condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Attributs- und Angriffswürfe: Du bist bei Attributs‑ und Angriffswürfen im Nachteil, solange du dich in der Sichtlinie der Quelle deiner Furcht befindest.",
     "en": "Ability Checks and Attacks Affected. You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Annäherung möglich: Du kannst dich nicht willentlich auf die Quelle deiner Furcht zubewegen.",
     "en": "Can’t Approach. You can’t willingly move closer to the source of fear."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "grappled",
  "name": {
   "de": "Gepackt",
   "en": "Grappled"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Gepackt hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Grappled condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.",
     "en": "Speed 0. Your Speed is 0 and can’t increase."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Du bist bei Angriffswürfen gegen alle Ziele außer der Kreatur, die dich gepackt hält, im Nachteil.",
     "en": "Attacks Affected. You have Disadvantage on attack rolls against any target other than the grappler."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beweglich: Die Kreatur, die dich gepackt hält, kann dich ziehen oder tragen, wenn sie sich bewegt. Allerdings kostet sie dies doppelt so viel Bewegung, sofern du nicht winzig oder um mindestens zwei Kategorien kleiner als sie bist.",
     "en": "Movable. The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "grappling",
  "name": {
   "de": "Gepackt halten",
   "en": "Grappling"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur kann eine andere Kreatur packen und festhalten. Charaktere tun dies üblicherweise im Rahmen eines waffenlosen Angriffs. Viele Monster haben besondere Angriffe, die ihnen gestatten, ihre Beute rasch zu packen. Wird eine Kreatur gepackt, so gelten die nachstehenden Regeln. Siehe auch „Gepackt“ und „Waffenloser Angriff“.",
     "en": "A creature can grapple another creature. Characters typically grapple by using an Unarmed Strike. Many monsters have special attacks that allow them to quickly grapple prey. However a grapple is initiated, it follows these rules. See also “Unarmed Strike” and “Grappled.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Zustand Gepackt: Wird eine Kreatur erfolgreich gepackt, so hat sie den Zustand Gepackt.",
     "en": "Grappled Condition. Successfully grappling a creature gives it the Grappled condition."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Eine gepackte Kreatur pro Hand: Eine Kreatur muss eine freie Hand haben, um eine andere Kreatur packen zu können. Manche Wertekästen und Spieleffekte gestatten einer Kreatur, ein Ziel mithilfe eines Tentakels, eines Mauls oder eines anderen Körperteils zu packen. Welchen Körperteil auch immer eine Kreatur einsetzt, sie kann damit nur jeweils eine Kreatur gepackt halten, und sie kann diesen Körperteil nicht verwenden, um auf eine andere Kreatur zu zielen, es sei denn, sie beendet zuvor den Haltegriff.",
     "en": "One Grapple per Hand. A creature must have a hand free to grapple another creature. Some stat blocks and game effects allow a creature to grapple using a tentacle, a maw, or another body part. Whatever part a grappler uses, it can grapple only one creature at a time with that part, and the grappler can’t use that part to target another creature unless it ends the grapple."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Den Zustand Gepackt beenden: Eine gepackte Kreatur kann ihre Aktion verwenden, um einen Stärkewurf (Athletik) oder Geschicklichkeitswurf (Akrobatik) gegen den Flucht‑SG des Haltegriffs auszuführen. Bei einem Erfolg endet der Zustand Gepackt. Der Zustand endet ebenfalls, wenn die Kreatur, die eine andere gepackt hält, kampfunfähig wird oder ihr Abstand zum gepackten Ziel die Reichweite des Haltegriffs überschreitet. Außerdem kann die Kreatur, die eine andere gepackt hält, das Ziel jederzeit loslassen (keine Aktion erforderlich).",
     "en": "Ending a Grapple. A Grappled creature can use its action to make a Strength (Athletics) or Dexterity (Acrobatics) check against the grapple’s escape DC, ending the condition on itself on a success. The condition also ends if the grappler has the Incapacitated condition or if the distance between the Grappled target and the grappler exceeds the grapple’s range. In addition, the grappler can release the target at any time (no action required)."
    }
   }
  ],
  "verweise": [
   "unarmed-strike",
   "grappled"
  ]
 },
 {
  "id": "hazard",
  "name": {
   "de": "Gefahr",
   "en": "Hazard"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Gefahren resultieren aus der Umgebung. Siehe auch „Brand“, „Dehydrierung“, „Erstickung“, „Sturz“ und „Unterernährung“.",
     "en": "A hazard is an environmental danger. See also “Burning,” “Dehydration,” “Falling,” “Malnutrition,” and “Suffocation.”"
    }
   }
  ],
  "verweise": [
   "burning",
   "dehydration",
   "falling",
   "malnutrition",
   "suffocation"
  ]
 },
 {
  "id": "healing",
  "name": {
   "de": "Heilung",
   "en": "Healing"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Heilung besteht darin, dass du Trefferpunkte zurückerhältst. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "Healing is how you regain Hit Points. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "heavily-obscured",
  "name": {
   "de": "Komplett verschleiert",
   "en": "Heavily Obscured"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "In komplett verschleierten Bereichen hast du den Zustand Blind. Siehe auch „Blind“, „Dunkelheit“ und „Die Spielregeln“ („Erkundung“).",
     "en": "You have the Blinded condition while trying to see something in a Heavily Obscured space. See also “Blinded,” “Darkness,” and “Playing the Game” (“Exploration”)."
    }
   }
  ],
  "verweise": [
   "blinded",
   "darkness"
  ]
 },
 {
  "id": "help",
  "name": {
   "de": "Helfen",
   "en": "Help"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du die Helfen‑Aktion ausführst, vollziehst du eine der folgenden Handlungen:",
     "en": "When you take the Help action, you do one of the following."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Einen Attributswurf unterstützen: Wähle eine deiner Übungen in einer Fertigkeit oder im Umgang mit Werkzeug sowie einen Verbündeten aus, der dir nahe genug ist, dass du ihn verbal oder physisch unterstützen kannst, wenn er einen Attributswurf ausführt. Der Verbündete ist bei seinem nächsten Attributswurf mit der ausgewählten Fertigkeit oder dem ausgewählten Werkzeug im Vorteil. Dieser Vorzug gilt nur, wenn der Verbündete ihn vor Beginn deines nächsten Zugs einsetzt. Der SL entscheidet, ob deine Hilfe möglich ist.",
     "en": "Assist an Ability Check. Choose one of your skill or tool proficiencies and one ally who is near enough for you to assist verbally or physically when they make an ability check. That ally has Advantage on the next ability check they make with the chosen skill or tool. This benefit expires if the ally doesn’t use it before the start of your next turn. The GM has final say on whether your assistance is possible."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Einen Angriffswurf unterstützen: Du lenkst einen Gegner im Abstand von bis zu 1,5 Metern von dir vorübergehend ab, sodass der nächste Angriffswurf eines deiner Verbündeten gegen ihn im Vorteil ist. Dieser Vorzug gilt nur, wenn der Verbündete ihn vor Beginn deines nächsten Zugs einsetzt.",
     "en": "Assist an Attack Roll. You momentarily distract an enemy within 5 feet of you, giving Advantage to the next attack roll by one of your allies against that enemy. This benefit expires at the start of your next turn."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "heroic-inspiration",
  "name": {
   "de": "Heldische Inspiration",
   "en": "Heroic Inspiration"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du als Spielercharakter Heldische Inspiration hast, kannst du sie verbrauchen, um mit einem Würfel sofort nach dem Wurf erneut zu würfeln. In diesem Fall musst du das neue Ergebnis verwenden. Verfügst du über Heldische Inspiration und erhältst dann noch weitere, so geht diese verloren, sofern du sie nicht an einen Spielercharakter weitergibst, der keine hat.",
     "en": "If you (a player character) have Heroic Inspiration, you can expend it to reroll any die immediately after rolling it, and you must use the new roll. If you gain Heroic Inspiration but already have it, it’s lost unless you give it to a player character who lacks it."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "hide",
  "name": {
   "de": "Verstecken",
   "en": "Hide"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Mit der Verstecken‑Aktion versuchst du dich zu verbergen. Dazu musst du einen SG‑15‑Geschicklichkeitswurf (Heimlichkeit) bestehen, während du entweder komplett verschleiert bist oder dich hinter Dreivierteldeckung oder vollständiger Deckung befindest. Außerdem darfst du dich nicht in der Sichtlinie von Gegnern befinden: Kannst du eine Kreatur sehen, so kannst du beurteilen, ob sie dich ebenfalls sehen kann. Bei einem Erfolg hast du den Zustand Unsichtbar, solange du versteckt bist. Notiere das Gesamtergebnis deines Wurfs – es dient als SG für Kreaturen, die versuchen, dich mit einem Weisheitswurf (Wahrnehmung) aufzuspüren. Du hörst sofort auf, versteckt zu sein, wenn eines der folgenden Ereignisse eintritt: Du machst ein Geräusch, das lauter als ein Flüstern ist, ein Gegner spürt dich auf, du führst einen Angriffswurf aus, oder du wirkst einen Zauber mit Verbalkomponente.",
     "en": "With the Hide action, you try to hide yourself. To do so, you must succeed on a DC 15 Dexterity (Stealth) check while you’re Heavily Obscured or behind Three-Quarters Cover or Total Cover, and you must be out of any enemy’s line of sight; if you can see a creature, you can discern whether it can see you. On a successful check, you have the Invisible condition while hidden. Make note of your check’s total, which is the DC for a creature to find you with a Wisdom (Perception) check. You stop being hidden immediately after any of the following occurs: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "high-jump",
  "name": {
   "de": "Hochsprung",
   "en": "High Jump"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Bei einem Hochsprung springst du eine Anzahl von Metern empor. Sie entspricht einem Drittel der Summe aus deinem Stärkemodifikator + 3, sofern du unmittelbar vor dem Sprung mindestens drei Meter zurückgelegt hast. Bei einem Hochsprung aus dem Stand kannst du nur halb so hoch springen. In beiden Fällen kostet dich jeder gesprungene Meter einen Meter deiner Bewegungsrate. Du kannst deine Arme während eines Sprungs um die Hälfte deiner Größe nach oben strecken. So kannst du mit den Händen eine Höhe erreichen, die deiner Sprunghöhe plus deiner 1,5‑fachen Körpergröße entspricht.",
     "en": "When you make a High Jump, you leap into the air a number of feet equal to 3 plus your Strength modifier (minimum of 0 feet) if you move at least 10 feet on foot immediately before the jump. When you make a standing High Jump, you can jump only half that distance. Either way, each foot of the jump costs a foot of movement. You can extend your arms half your height above yourself during the jump. Thus, you can reach a distance equal to the height of the jump plus 1 1/2 times your height."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "hit-point-dice",
  "name": {
   "de": "Trefferpunktewürfel",
   "en": "Hit Point Dice"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Trefferpunktewürfel oder kurz Trefferwürfel helfen, das Trefferpunktemaximum eines Spielercharakters zu ermitteln, wie unter „Charaktererstellung“ erläutert. Auch die meisten Monster haben Trefferwürfel. Kreaturen können während einer kurzen Rast Trefferwürfel verbrauchen, um Trefferpunkte zurückzuerhalten. Siehe auch „Kurze Rast“.",
     "en": "Hit Point Dice, or Hit Dice for short, help determine a player character’s Hit Point maximum, as explained in “Character Creation.” Most monsters also have Hit Dice. A creature can spend Hit Dice during a Short Rest to regain Hit Points. See also “Short Rest.”"
    }
   }
  ],
  "verweise": [
   "short-rest"
  ]
 },
 {
  "id": "hit-points",
  "name": {
   "de": "Trefferpunkte",
   "en": "Hit Points"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Trefferpunkte (TP) sind ein Maß dafür, wie schwierig es ist, eine Kreatur zu töten oder einen Gegenstand zu zerstören. Schaden verringert Trefferpunkte, Heilung stellt Trefferpunkte wieder her. Deine Trefferpunkte können dein Trefferpunktemaximum nicht überschreiten, und du kannst nicht weniger als 0 Trefferpunkte haben. Siehe auch „Gegenstände zerstören“ und „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "Hit Points (HP) are a measure of how difficult it is to kill or destroy a creature or an object. Damage reduces Hit Points, and healing restores them. You can’t have more Hit Points than your Hit Point maximum, and you can’t have less than 0. See also “Breaking Objects” and “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": [
   "breaking-objects"
  ]
 },
 {
  "id": "hostile",
  "name": {
   "de": "Feindlich gesinnt",
   "en": "Hostile"
  },
  "tag": "haltung",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine feindlich gesinnte Kreatur steht dir negativ gegenüber. Du bist bei Attributswürfen zum Beeinflussen von Kreaturen, die dir feindlich gesinnt sind, im Nachteil. Siehe auch „Beeinflussen“.",
     "en": "A Hostile creature views you unfavorably. You have Disadvantage on an ability check to influence a Hostile creature. See also “Influence.”"
    }
   }
  ],
  "verweise": [
   "influence"
  ]
 },
 {
  "id": "hover",
  "name": {
   "de": "Schweben",
   "en": "Hover"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Manche Kreaturen können schweben, wie in ihren Wertekästen vermerkt, und manche Zauber und andere Effekte gewähren die Fähigkeit zu schweben. Während des Flugs zu schweben verhindert, dass du unter bestimmten Umständen abstürzt. Siehe auch „Fliegen“.",
     "en": "Some creatures can hover, as noted in their stat blocks, and some spells and other effects grant the ability to hover. Hovering while flying prevents you from falling in certain circumstances. See also “Flying.”"
    }
   }
  ],
  "verweise": [
   "flying"
  ]
 },
 {
  "id": "illusions",
  "name": {
   "de": "Illusionen",
   "en": "Illusions"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Manche Zauber und anderen Effekte erzeugen magische Illusionen. Ein solcher Effekt definiert, was die Illusion tut und welche Sinne oder mentalen Bereiche sie täuscht. Wenn eine Illusion sich im Raum manifestiert, ist sie körperlos und hat kein Gewicht, doch sie wirkt von der Umgebung betroffen, als wäre sie real, sofern der hervorrufende Effekt nichts anderes angibt. Beispiel: Die visuelle Illusion einer Kreatur wirft Schatten und verursacht Reflexionen, und Wind scheint sie zu beeinflussen. Entsprechend erzeugt eine akustische Illusion bei passenden räumlichen Gegebenheiten Echos.",
     "en": "Spells and other effects sometimes create magical illusions. Such an effect defines what the illusion does and which senses or mental faculties it deceives. If an illusion manifests in space, the illusion is insubstantial and weightless, yet it seems to be affected by the environment as if the illusion were real unless the effect that created it specifies otherwise. For example, a visual illusion of a creature casts shadows and reflections, and wind appears to affect the illusory creature. Similarly, an audible illusion echoes in an echoey space."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "immunity",
  "name": {
   "de": "Immunität",
   "en": "Immunity"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du gegen eine Schadensart oder einen Zustand immun bist, kannst du davon in keiner Weise beeinflusst werden.",
     "en": "If you have Immunity to a damage type or a condition, it doesn’t affect you in any way."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "improvised-weapons",
  "name": {
   "de": "Improvisierte Waffen",
   "en": "Improvised Weapons"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine improvisierte Waffe ist ein Gegenstand, der behelfsmäßig als Waffe geführt wird, beispielsweise eine zerbrochene Flasche, ein Tischbein oder eine Bratpfanne. Auch einfache Waffen und Kriegswaffen gelten als improvisierte Waffen, wenn sie anders als vorgesehen verwendet werden. Wenn beispielsweise mit einer Fernkampfwaffe ein Nahkampfangriff ausgeführt oder eine Nahkampfwaffe ohne Wurfwaffe‑Eigenschaft geworfen wird, so zählt sie bei diesem Angriff als improvisierte Waffe. Für improvisierte Waffen gelten die nachstehenden Regeln.",
     "en": "An improvised weapon is an object wielded as a makeshift weapon, such as broken glass, a table leg, or a frying pan. A Simple or Martial weapon also counts as an improvised weapon if it’s wielded in a way contrary to its design; if you use a Ranged weapon to make a melee attack or throw a Melee weapon that lacks the Thrown property, the weapon counts as an improvised weapon. An improvised weapon follows the rules below."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Übung: Du fügst Angriffswürfen mit einer improvisierten Waffe nicht deinen Übungsbonus hinzu.",
     "en": "Proficiency. Don’t add your Proficiency Bonus to attack rolls with an improvised weapon."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Schaden: Bei einem Treffer bewirkt die Waffe 1W4 Schaden einer Art, die dem SL beim jeweiligen Gegenstand passend erscheint.",
     "en": "Damage. On a hit, the weapon deals 1d4 damage of a type the GM thinks is appropriate for the object."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Reichweite: Wird die Waffe geworfen, so liegt die Grundreichweite bei sechs Metern und die Maximalreichweite bei 18 Metern.",
     "en": "Range. If you throw the weapon, it has a normal range of 20 feet and a long range of 60 feet."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Waffenäquivalente: Wenn eine improvisierte Waffe an eine einfache Waffe oder eine Kriegswaffe erinnert, kann der SL bestimmen, dass sie wie diese Waffe funktioniert. In dem Fall gelten die Regeln dieser Waffe. Beispielsweise könnte der SL ein Tischbein als Knüppel behandeln.",
     "en": "Weapon Equivalents. If an improvised weapon resembles a Simple or Martial weapon, the GM may say it functions as that weapon and uses that weapon’s rules. For example, the GM could treat a table leg as a Club."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "incapacitated",
  "name": {
   "de": "Kampfunfähig",
   "en": "Incapacitated"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Kampfunfähig hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Incapacitated condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Inaktiv: Du kannst keine Aktionen, Bonusaktionen oder Reaktionen ausführen.",
     "en": "Inactive. You can’t take any action, Bonus Action, or Reaction."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Konzentration: Deine Konzentration ist unterbrochen.",
     "en": "No Concentration. Your Concentration is broken."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Stumm: Du kannst nicht sprechen.",
     "en": "Speechless. You can’t speak."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Überrascht: Wenn du beim Auswürfeln der Initiative kampfunfähig bist, so bist du bei diesem Wurf im Nachteil.",
     "en": "Surprised. If you’re Incapacitated when you roll Initiative, you have Disadvantage on the roll."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "indifferent",
  "name": {
   "de": "Gleichgültig",
   "en": "Indifferent"
  },
  "tag": "haltung",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn eine Kreatur dir gegenüber gleichgültig ist, hat sie kein Interesse daran, dir zu helfen oder dich zu beeinträchtigen. Gleichgültig ist die Standardhaltung von Monstern. Siehe auch „Beeinflussen“.",
     "en": "An Indifferent creature has no desire to help or hinder you. Indifferent is the default attitude of a monster. See also “Influence.”"
    }
   }
  ],
  "verweise": [
   "influence"
  ]
 },
 {
  "id": "influence",
  "name": {
   "de": "Beeinflussen",
   "en": "Influence"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Mit der Beeinflussen-Aktion kannst du ein Monster zu etwas drängen. Beschreibe oder stelle rollenspielerisch dar, wie du mit dem Monster kommunizierst. Versuchst du, es zu täuschen, einzuschüchtern, zu amüsieren oder zu überreden? Der SL bestimmt dann, ob das Monster bereitwillig, nicht bereitwillig oder zögerlich auf deine Interaktion reagiert. Daraus ergibt sich, ob ein Attributswurf erforderlich ist, wie unten erläutert.",
     "en": "With the Influence action, you urge a monster to do something. Describe or roleplay how you’re communicating with the monster. Are you trying to deceive, intimidate, amuse, or gently persuade? The GM then determines whether the monster feels willing, unwilling, or hesitant due to your interaction; this determination establishes whether an ability check is necessary, as explained below."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Bereitwillig: Wenn deine Beeinflussung mit den Interessen des Monsters übereinstimmt, ist kein Attributswurf erforderlich: Das Monster kommt deinen Wünschen auf seine Art nach.",
     "en": "Willing. If your urging aligns with the monster’s desires, no ability check is necessary; the monster fulfills your request in a way it prefers."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Nicht bereitwillig: Wenn deine Beeinflussung mit den Interessen oder der Gesinnung des Monsters in Konflikt steht, ist kein Attributswurf erforderlich: Das Monster kommt deinen Wünschen nicht nach.",
     "en": "Unwilling. If your urging is repugnant to the monster or counter to its alignment, no ability check is necessary; it doesn’t comply."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Zögerlich: Wenn du das Monster zu etwas bewegen willst, was es nicht unbedingt tun will, musst du einen Attributswurf ausführen, der von der Haltung des Monsters betroffen ist: Gleichgültig, freundlich gesinnt oder feindlich gesinnt, wie jeweils in diesem Glossar definiert. In der Tabelle „Attributswürfe zum Beeinflussen“ findest du Vorschläge, welcher Attributswurf je nach deiner Interaktion mit dem Monster auszuführen ist. Der SL wählt den Attributswurf aus. Dieser hat einen Standard‑SG in Höhe von 15 oder dem Intelligenzwert des Monsters, je nachdem, welcher Wert höher ist. Bei einem Erfolg tut das Monster, was du willst. Misslingt der Wurf, so musst du 24 Stunden (oder eine Dauer nach Vorgabe des SL) abwarten, ehe du erneut versuchen kannst, es auf diese Art zu beeinflussen.",
     "en": "Hesitant. If you urge the monster to do something that it is hesitant to do, you must make an ability check, which is affected by the monster’s attitude: Indifferent, Friendly, or Hostile, each of which is defined in this glossary. The Influence Checks table suggests which ability check to make based on how you’re interacting with the monster. The GM chooses the check, which has a default DC equal to 15 or the monster’s Intelligence score, whichever is higher. On a successful check, the monster does as urged. On a failed check, you must wait 24 hours (or a duration set by the GM) before urging it in the same way again."
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Attributswürfe zum Beeinflussen",
     "en": "Influence Checks"
    },
    "kopf": {
     "de": [
      "Attributswurf",
      "Interaktion"
     ],
     "en": [
      "Ability Check",
      "Interaction"
     ]
    },
    "reihen": {
     "de": [
      [
       "Charismawurf (Auftreten)",
       "Ein Monster amüsieren"
      ],
      [
       "Charismawurf (Einschüchtern)",
       "Ein Monster einschüchtern"
      ],
      [
       "Charismawurf (Täuschen)",
       "Ein Monster täuschen, das dich versteht"
      ],
      [
       "Charismawurf (Überzeugen)",
       "Ein Monster überzeugen, das dich versteht"
      ],
      [
       "Weisheitswurf (Mit Tieren umgehen)",
       "Ein Tier oder eine Monstrosität sanft überreden"
      ]
     ],
     "en": [
      [
       "Charisma (Deception)",
       "Deceiving a monster that understands you"
      ],
      [
       "Charisma (Intimidation)",
       "Intimidating a monster"
      ],
      [
       "Charisma (Performance)",
       "Amusing a monster"
      ],
      [
       "Charisma (Persuasion)",
       "Persuading a monster that understands you"
      ],
      [
       "Wisdom (Animal Handling)",
       "Gently coaxing a Beast or Monstrosity"
      ]
     ]
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "initiative",
  "name": {
   "de": "Initiative",
   "en": "Initiative"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Die Initiative bestimmt die Reihenfolge der Züge während eines Kampfs. In den Kampfregeln unter „Die Spielregeln“ wird erläutert, wie die Initiative ausgewürfelt wird. Manchmal könnte der SL bestimmen, dass die Kampfteilnehmer ihre Initiativewerte verwenden, anstatt die Initiative auszuwürfeln. Dein Initiativewert entspricht 10 plus deinem Geschicklichkeitsmodifikator. Wenn du bei Initiativewürfen im Vorteil bist, erhöhe deinen Initiativewert um 5. Wenn du bei Initiativewürfen im Nachteil bist, verringere deinen Initiativewert um 5. Siehe auch „Die Spielregeln“ („Kampf“).",
     "en": "Initiative determines the order of turns during combat. The combat rules in “Playing the Game” explain how to roll Initiative. Sometimes a GM might have combatants use their Initiative scores instead of rolling Initiative. Your Initiative score equals 10 plus your Dexterity modifier. If you have Advantage on Initiative rolls, increase your Initiative score by 5. If you have Disadvantage on those rolls, decrease that score by 5. See also “Playing the Game” (“Combat”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "invisible",
  "name": {
   "de": "Unsichtbar",
   "en": "Invisible"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Unsichtbar hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Invisible condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Überraschung: Wenn du beim Auswürfeln der Initiative unsichtbar bist, so bist du bei diesem Wurf im Vorteil.",
     "en": "Surprise. If you’re Invisible when you roll Initiative, you have Advantage on the roll."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Verborgen: Du bist nicht von Effekten betroffen, die erfordern, dass du gesehen wirst, sofern der Effektwirker keine Möglichkeiten hat, dich trotz deiner Unsichtbarkeit zu sehen. Ausrüstung, die du trägst oder hältst, ist ebenfalls verborgen.",
     "en": "Concealed. You aren’t affected by any effect that requires its target to be seen unless the effect’s creator can somehow see you. Any equipment you are wearing or carrying is also concealed."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Nachteil, und du bist bei deinen Angriffswürfen im Vorteil. Wenn eine Kreatur Möglichkeiten hat, dich trotz deiner Unsichtbarkeit zu sehen, erhältst du diesen Vorzug gegen diese Kreatur nicht.",
     "en": "Attacks Affected. Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don’t gain this benefit against that creature."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "jumping",
  "name": {
   "de": "Springen",
   "en": "Jumping"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Beim Springen kannst du entweder einen Hochsprung (vertikal) oder einen Weitsprung (horizontal) ausführen. Siehe auch „Hochsprung“ und „Weitsprung“.",
     "en": "When you jump, you make either a Long Jump (horizontal) or a High Jump (vertical). See also “Long Jump” and “High Jump.”"
    }
   }
  ],
  "verweise": [
   "long-jump",
   "high-jump"
  ]
 },
 {
  "id": "knocking-out-a-creature",
  "name": {
   "de": "Kreaturen in den Zustand Bewusstlos versetzen",
   "en": "Knocking Out a Creature"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du die Trefferpunkte einer Kreatur mit einem Nahkampfangriff auf 0 senken würdest, kannst du sie stattdessen auf 1 Trefferpunkt senken. In diesem Fall hat die Kreatur den Zustand Bewusstlos und beginnt eine kurze Rast. Die Kreatur bleibt bewusstlos, bis sie Trefferpunkte zurückerhält, oder bis ihr jemand mit einer Aktion und einem erfolgreichen SG‑10‑Weisheitswurf (Heilkunde) Erste Hilfe leistet.",
     "en": "When you would reduce a creature to 0 Hit Points with a melee attack, you can instead reduce the creature to 1 Hit Point. The creature then has the Unconscious condition and starts a Short Rest. The creature remains Unconscious until it regains any Hit Points or until someone uses an action to administer first aid to it, which requires a successful DC 10 Wisdom (Medicine) check."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "lightly-obscured",
  "name": {
   "de": "Leicht verschleiert",
   "en": "Lightly Obscured"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Du bist bei Weisheitswürfen (Wahrnehmung) im Nachteil, die du ausführst, um etwas in einem leicht verschleierten Bereich zu sehen. Siehe auch „Dämmriges Licht“ und „Die Spielregeln“ („Erkundung“).",
     "en": "You have Disadvantage on Wisdom (Perception) checks to see something in a Lightly Obscured space. See also “Dim Light” and “Playing the Game” (“Exploration”)."
    }
   }
  ],
  "verweise": [
   "dim-light"
  ]
 },
 {
  "id": "line",
  "name": {
   "de": "Linie",
   "en": "Line"
  },
  "tag": "wirkungsbereich",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Linie ist ein Wirkungsbereich, der in gerader Linie von einem Ursprungspunkt ausgeht. Länge und Breite dieses Wirkungsbereichs sind in der Beschreibung definiert. Der Effekt, der die Linie erzeugt, definiert ihre Länge und Breite. Der Ursprungspunkt einer Linie ist nicht im Wirkungsbereich enthalten, es sei denn, der Wirker beschließt dies.",
     "en": "A Line is an area of effect that extends from a point of origin in a straight path along its length and covers an area defined by its width. The effect that creates a Line specifies its length and width. A Line’s point of origin isn’t included in the area of effect unless its creator decides otherwise."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "long-jump",
  "name": {
   "de": "Weitsprung",
   "en": "Long Jump"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Bei einem Weitsprung springst du bis zu einer Anzahl von Metern, die einem Drittel deines Stärkewerts entspricht, sofern du unmittelbar vor dem Sprung mindestens drei Meter zurückgelegt hast. Bei einem Weitsprung aus dem Stand kannst du nur halb so weit springen. In beiden Fällen kostet dich jeder gesprungene Meter einen Meter deiner Bewegungsrate. Wenn du in schwierigem Gelände landest, musst du einen SG‑10‑Geschicklichkeitswurf (Akrobatik) bestehen, um auf den Füßen zu landen. Bei einem Misserfolg hast du den Zustand Liegend. Diese Weitsprung‑Regel geht davon aus, dass die Höhe des Sprungs keine Rolle spielt (wie bei einem Sprung über einen Fluss oder eine Felsspalte). Der SL kann einen erfolgreichen SG‑10‑Stärkewurf (Athletik) von dir verlangen, wenn du ein niedriges Hindernis wie eine Hecke oder eine niedrige Mauer (nicht höher als ein Viertel deiner Sprungdistanz) überwinden willst. Misslingt der Wurf, so kollidierst du mit dem Hindernis.",
     "en": "When you make a Long Jump, you leap horizontally a number of feet up to your Strength score if you move at least 10 feet immediately before the jump. When you make a standing Long Jump, you can leap only half that distance. Either way, each foot you jump costs a foot of movement. If you land in Difficult Terrain, you must succeed on a DC 10 Dexterity (Acrobatics) check or have the Prone condition. This Long Jump rule assumes that the height of the jump doesn’t matter, such as a jump across a stream or chasm. At your GM’s option, you must succeed on a DC 10 Strength (Athletics) check to clear a low obstacle (no taller than a quarter of the jump’s distance), such as a hedge or low wall. Otherwise, you hit the obstacle."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "long-rest",
  "name": {
   "de": "Lange Rast",
   "en": "Long Rest"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine lange Rast ist eine ausgedehnte Ruhepause von mindestens acht Stunden, die jeder Kreatur zur Verfügung steht. Während einer langen Rast schläfst du mindestens sechs Stunden lang und führst höchstens zwei Stunden lang leichte Aktivitäten wie Lesen, Reden, Essen oder Wache halten aus. Während du schläfst, hast du den Zustand Bewusstlos. Hast du eine lange Rast beendest, so musst du mindestens 16 Stunden warten, ehe du die nächste beginnst.",
     "en": "A Long Rest is a period of extended downtime—at least 8 hours—available to any creature. During a Long Rest, you sleep for at least 6 hours and perform no more than 2 hours of light activity, such as reading, talking, eating, or standing watch. During sleep, you have the Unconscious condition. After you finish a Long Rest, you must wait at least 16 hours before starting another one."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Vorzüge der Rast: Du musst mindestens einen Trefferpunkt haben, um eine lange Rast zu beginnen. Wenn du die Rast beendest, erhältst du die folgenden Vorzüge:",
     "en": "Benefits of the Rest. To start a Long Rest, you must have at least 1 Hit Point. When you finish the rest, you gain the following benefits:"
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Alle TP zurückerhalten: Du erhältst alle verlorenen Trefferpunkte und alle verbrauchten Trefferpunktewürfel zurück. Wenn dein Trefferpunktemaximum verringert wurde, ist es jetzt wieder normal.",
     "en": "Regain All HP. You regain all lost Hit Points and all spent Hit Point Dice. If your Hit Point maximum was reduced, it returns to normal."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Attributswerte wiederhergestellt: Wenn deine Attributswerte verringert waren, sind sie jetzt wieder normal.",
     "en": "Ability Scores Restored. If any of your ability scores were reduced, they return to normal."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Erschöpfung verringert: Wenn du Erschöpfungsstufen hattest, werden diese um eine Stufe verringert.",
     "en": "Exhaustion Reduced. If you have the Exhaustion condition, its level decreases by 1."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Besonderes Merkmal: Manche Merkmale werden durch eine lange Rast aufgeladen. Wenn du ein solches Merkmal hast, wird es wie in seiner Beschreibung angegeben aufgeladen.",
     "en": "Special Feature. Some features are recharged by a Long Rest. If you have such a feature, it recharges in the way specified in its description."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Die Rast unterbrechen: Eine lange Rast kann auf folgende Arten unterbrochen werden: • Initiative auswürfeln • Einen Zauber wirken, der kein Zaubertrick ist • Schaden erleiden • Eine Stunde lang gehen oder andere körperliche Anstrengungen unternehmen Wenn du vor der Unterbrechung mindestens eine Stunde lang gerastet hast, erhältst du die Vorzüge einer kurzen Rast. Siehe auch „Kurze Rast“. Du kannst die lange Rast unmittelbar nach der Unterbrechung fortsetzen. In diesem Fall ist pro Unterbrechung eine zusätzliche Stunde Rast erforderlich, um diese zu beenden.",
     "en": "Interrupting the Rest. A Long Rest is stopped by the following interruptions: • Rolling Initiative • Casting a spell other than a cantrip • Taking any damage • 1 hour of walking or other physical exertion If you rested at least 1 hour before the interruption, you gain the benefits of a Short Rest. See also “Short Rest.” You can resume a Long Rest immediately after an interruption. If you do so, the rest requires 1 additional hour per interruption to finish."
    }
   }
  ],
  "verweise": [
   "short-rest"
  ]
 },
 {
  "id": "magic",
  "name": {
   "de": "Magie",
   "en": "Magic"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du eine magische Aktion ausführst, wirkst du einen Zauber mit dem Zeitaufwand von einer Aktion oder verwendest ein Merkmal oder einen magischen Gegenstand, bei dem eine magische Aktion zum Aktivieren erforderlich ist. Wenn du einen Zauber wirkst, dessen Zeitaufwand mindestens eine Minute beträgt, musst du die magische Aktion in jedem Zug während des Zeitaufwands ausführen und währenddessen deine Konzentration aufrechterhalten. Wird deine Konzentration unterbrochen, so misslingt der Zauber. In diesem Fall wird der Zauberplatz nicht verbraucht. Siehe auch „Konzentration“.",
     "en": "When you take the Magic action, you cast a spell that has a casting time of an action or use a feature or magic item that requires a Magic action to be activated. If you cast a spell that has a casting time of 1 minute or longer, you must take the Magic action on each turn of that casting, and you must maintain Concentration while you do so. If your Concentration is broken, the spell fails, but you don’t expend a spell slot. See also “Concentration.”"
    }
   }
  ],
  "verweise": [
   "concentration"
  ]
 },
 {
  "id": "magical-effect",
  "name": {
   "de": "Magischer Effekt",
   "en": "Magical Effect"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Effekt ist magisch, wenn er durch einen Zauber, einen magischen Gegenstand oder ein Phänomen erzeugt wird, das durch eine Regel als magisch klassifiziert ist.",
     "en": "An effect is magical if it is created by a spell, a magic item, or a phenomenon that a rule labels as magical."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "malnutrition",
  "name": {
   "de": "Unterernährung",
   "en": "Malnutrition"
  },
  "tag": "gefahr",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Kreaturen benötigen täglich eine gewisse Menge von Nahrung je nach ihrer Größe, wie in der Tabelle „Täglicher Nahrungsbedarf“ dargestellt. Eine Kreatur, die weniger als die Hälfte der täglich erforderlichen Nahrungsmenge zu sich nimmt, muss einen SG‑10‑Konstitutionsrettungswurf bestehen, oder sie erhält am Ende des Tages eine Erschöpfungsstufe. Eine Kreatur, die fünf Tage lang nichts isst, erhält am Ende des fünften Tages automatisch eine Erschöpfungs stufe sowie am Ende jedes weiteren Tages ohne Nahrung eine zusätzliche Erschöpfungsstufe. Erschöpfung durch Unterernährung kann nicht entfernt werden, ehe die Kreatur nicht die vollständige Tagesmenge an Nahrung zu sich nimmt. Siehe auch „Erschöpfung“.",
     "en": "A creature needs an amount of food per day based on its size, as shown in the Food Needs per Day table. A creature that eats but consumes less than half the required food for a day must succeed on a DC 10 Constitution saving throw or gain 1 Exhaustion level at the day’s end. A creature that eats nothing for 5 days automatically gains 1 Exhaustion level at the end of the fifth day as well as an additional level at the end of each subsequent day without food. Exhaustion caused by malnutrition can’t be removed until the creature eats the full amount of food required for a day. See also “Exhaustion.”"
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Täglicher Nahrungsbedarf",
     "en": "Food Needs per Day"
    },
    "kopf": {
     "de": [
      "Größe",
      "Nahrung",
      "Größe",
      "Nahrung"
     ],
     "en": [
      "Size",
      "Food",
      "Size",
      "Food"
     ]
    },
    "reihen": {
     "de": [
      [
       "Winzig",
       "125 Gramm",
       "Groß",
       "2 Kilogramm"
      ],
      [
       "Klein",
       "500 Gramm",
       "Riesig",
       "8 Kilogramm"
      ],
      [
       "Mittel",
       "500 Gramm",
       "Gigantisch",
       "32 Kilogramm"
      ]
     ],
     "en": [
      [
       "Tiny",
       "1/4 pound",
       "Large",
       "4 pounds"
      ],
      [
       "Small",
       "1 pound",
       "Huge",
       "16 pounds"
      ],
      [
       "Medium",
       "1 pound",
       "Gargantuan",
       "64 pounds"
      ]
     ]
    }
   }
  ],
  "verweise": [
   "exhaustion"
  ]
 },
 {
  "id": "monster",
  "name": {
   "de": "Monster",
   "en": "Monster"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Monster ist eine vom SL kontrollierte Kreatur – auch dann, wenn die Kreatur wohlwollend ist. Siehe auch „Kreatur“ und „NSC“.",
     "en": "A monster is a creature controlled by the GM, even if the creature is benevolent. See also “Creature” and “NPC.”"
    }
   }
  ],
  "verweise": [
   "creature",
   "nonplayer-character"
  ]
 },
 {
  "id": "nonplayer-character",
  "name": {
   "de": "Nichtspielercharakter",
   "en": "Nonplayer Character"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Nichtspielercharakter (NSC) ist ein Monster, das einen Personennamen und eine eigene Persönlichkeit hat. Siehe auch „Monster“.",
     "en": "A nonplayer character (NPC) is a monster that has a personal name and a distinct personality. See also “Monster.”"
    }
   }
  ],
  "verweise": [
   "monster"
  ]
 },
 {
  "id": "object",
  "name": {
   "de": "Gegenstand",
   "en": "Object"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Gegenstand ist ein unbelebtes, klar abgrenzbares Ding. Zusammengesetzte Dinge wie Gebäude bestehen aus mehr als einem Gegenstand. Siehe auch „Gegenstände zerstören“.",
     "en": "An object is a nonliving, distinct thing. Composite things, like buildings, comprise more than one object. See also “Breaking Objects.”"
    }
   }
  ],
  "verweise": [
   "breaking-objects"
  ]
 },
 {
  "id": "occupied-space",
  "name": {
   "de": "Besetzter Bereich",
   "en": "Occupied Space"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Bereich ist besetzt, wenn sich eine Kreatur darin befindet oder er vollständig mit Gegenständen angefüllt ist.",
     "en": "A space is occupied if a creature is in it or if it is completely filled by objects."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "opportunity-attacks",
  "name": {
   "de": "Gelegenheitsangriffe",
   "en": "Opportunity Attacks"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn eine Kreatur, die du sehen kannst, mithilfe ihrer Aktion, ihrer Bonusaktion, ihrer Reaktion oder einer ihrer Bewegungsraten deine Reichweite verlässt, kannst du einen Gelegenheitsangriff ausführen. Nutze dazu eine Reaktion, um einen Nahkampfangriff mit einer Waffe oder einen waffenlosen Angriff gegen die provozierende Kreatur auszuführen. Der Angriff erfolgt unmittelbar, bevor die Kreatur deine Reichweite verlässt. Siehe auch „Die Spielregeln“ („Kampf“).",
     "en": "You can make an Opportunity Attack when a creature that you can see leaves your reach using its action, its Bonus Action, its Reaction, or one of its speeds. To make the Opportunity Attack, take a Reaction to make one melee attack with a weapon or an Unarmed Strike against the provoking creature. The attack occurs right before the creature leaves your reach. See also “Playing the Game” (“Combat”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "paralyzed",
  "name": {
   "de": "Gelähmt",
   "en": "Paralyzed"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Gelähmt hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Paralyzed condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Kampfunfähig: Du hast den Zustand Kampfunfähig.",
     "en": "Incapacitated. You have the Incapacitated condition."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.",
     "en": "Speed 0. Your Speed is 0 and can’t increase."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.",
     "en": "Saving Throws Affected. You automatically fail Strength and Dexterity saving throws."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.",
     "en": "Attacks Affected. Attack rolls against you have Advantage."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Automatische kritische Treffer: Jeder Angriffswurf, der dich trifft, ist ein kritischer Treffer, sofern der Angreifer sich im Abstand von bis zu 1,5 Metern von dir befindet.",
     "en": "Automatic Critical Hits. Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "passive-perception",
  "name": {
   "de": "Passive Wahrnehmung",
   "en": "Passive Perception"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Passive Wahrnehmung ist ein Wert, der für die allgemeine Aufmerksamkeit einer Kreatur ihrer Umgebung gegenüber steht. Der SL verwendet diesen Wert, um zu ermitteln, ob eine Kreatur etwas bemerkt, ohne dazu einen Weisheitswurf (Wahrnehmung) auszuführen. Die passive Wahrnehmung einer Kreatur entspricht 10 plus ihrem Bonus auf Weisheitswürfe (Wahrnehmung). Wenn die Kreatur bei solchen Würfen im Vorteil ist, erhöhe den Wert um 5. Wenn die Kreatur bei solchen Würfen im Nachteil ist, verringere den Wert um 5. Beispiel: Ein Charakter der 1. Stufe mit einem Weisheitswert von 15 und Übung in Wahrnehmung hat eine passive Wahrnehmung von 14 (10+2+2). Wenn dieser Charakter bei Weisheitswürfen (Wahrnehmung) im Vorteil ist, beträgt der Wert 19.",
     "en": "Passive Perception is a score that reflects a creature’s general awareness of its surroundings. The GM uses this score when determining whether a creature notices something without consciously making a Wisdom (Perception) check. A creature’s Passive Perception equals 10 plus the creature’s Wisdom (Perception) check bonus. If the creature has Advantage on such checks, increase the score by 5. If the creature has Disadvantage on them, decrease the score by 5. For example, a level 1 character with a Wisdom of 15 and proficiency in Perception has a Passive Perception of 14 (10 + 2 + 2). If that character has Advantage on Wisdom (Perception) checks, the score becomes 19."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "per-day",
  "name": {
   "de": "Pro Tag",
   "en": "Per Day"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn eine Regel besagt, dass du etwas eine bestimmte Anzahl von Malen pro Tag anwenden kannst, so bedeutet dies, dass du nach Verbrauch dieser Anzahl eine lange Rast beenden musst, um es erneut anwenden zu können.",
     "en": "If a rule says you can use something a certain number of times per day, that means you must finish a Long Rest to use it again after you run out of uses."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "petrified",
  "name": {
   "de": "Versteinert",
   "en": "Petrified"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Versteinert hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Petrified condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "In unbelebte Substanz verwandelt: Du wirst mit allen nichtmagischen Gegenständen, die du trägst oder hältst, in eine massive unbelebte Substanz (normalerweise Stein) verwandelt. Dein Gewicht erhöht sich auf das Zehnfache, und du hörst auf zu altern.",
     "en": "Turned to Inanimate Substance. You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Kampfunfähig: Du hast den Zustand Kampfunfähig.",
     "en": "Incapacitated. You have the Incapacitated condition."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.",
     "en": "Speed 0. Your Speed is 0 and can’t increase."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.",
     "en": "Attacks Affected. Attack rolls against you have Advantage."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.",
     "en": "Saving Throws Affected. You automatically fail Strength and Dexterity saving throws."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Resistenz gegen Schaden: Du bist gegen alle Schadensarten resistent.",
     "en": "Resist Damage. You have Resistance to all damage."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Immunität gegen Gift: Du bist gegen den Zustand Vergiftet immun.",
     "en": "Poison Immunity. You have Immunity to the Poisoned condition."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "player-character",
  "name": {
   "de": "Spielercharakter",
   "en": "Player Character"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Spielercharakter ist ein Charakter, der von einem Spieler kontrolliert wird. Siehe auch „Charaktererstellung“.",
     "en": "A player character is a character controlled by a player. See also “Character Creation.”"
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "poisoned",
  "name": {
   "de": "Vergiftet",
   "en": "Poisoned"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Vergiftet hast, wirkt folgender Effekt auf dich:",
     "en": "While you have the Poisoned condition, you experience the following effect."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Attributs- und Angriffswürfe: Du bist bei Angriffs‑ und Attributswürfen im Nachteil.",
     "en": "Ability Checks and Attacks Affected. You have Disadvantage on attack rolls and ability checks."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "possession",
  "name": {
   "de": "Besessenheit",
   "en": "Possession"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Manche Effekte bewirken, dass eine Kreatur von einem anderen Wesen besessen ist. Der Effekt der Inbesitznahme definiert, wie die Besessenheit funktioniert. Besessenheit kann durch den Zauber Schutz vor Gut und Böse verhindert und durch den Zauber Gutes und Böses bannen beendet werden.",
     "en": "Some effects cause a creature to be possessed by another creature or entity. A possessing effect defines how the possession operates. Possession can be prevented by the Protection from Evil and Good spell and ended by the Dispel Evil and Good spell."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "proficiency",
  "name": {
   "de": "Übung",
   "en": "Proficiency"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du Übung in etwas hast, kannst du jeder W20‑Prüfung, die du damit ausführst, deinen Übungsbonus hinzufügen. Eine Kreatur könnte Übung in einer Fertigkeit, einem Rettungswurf oder im Umgang mit einer Waffe oder einem Werkzeug haben. Siehe auch „Die Spielregeln“ („Übung“).",
     "en": "If you have proficiency with something, you can add your Proficiency Bonus to any D20 Test you make using that thing. A creature might have proficiency in a skill or saving throw or with a weapon or tool. See also “Playing the Game” (“Proficiency”)."
    }
   }
  ],
  "verweise": [
   "proficiency"
  ]
 },
 {
  "id": "prone",
  "name": {
   "de": "Liegend",
   "en": "Prone"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Liegend hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Prone condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Eingeschränkte Bewegung: Deine einzigen Bewegungsmöglichkeiten bestehen darin, entweder zu kriechen oder Bewegung in Höhe der Hälfte deiner Bewegungsrate (abgerundet) zu verbrauchen, um aufzustehen und den Zustand damit zu beenden. Wenn deine Bewegungsrate 0 beträgt, kannst du nicht aufstehen.",
     "en": "Restricted Movement. Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can’t right yourself."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Du bist bei Angriffswürfen im Nachteil. Angriffswürfe gegen dich sind im Vorteil, wenn der Angreifer sich im Abstand von bis zu 1,5 Metern von dir befindet. Anderenfalls sind Angriffswürfe gegen dich im Nachteil.",
     "en": "Attacks Affected. You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "reach",
  "name": {
   "de": "Nahkampfreichweite",
   "en": "Reach"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Kreaturen haben eine Reichweite von 1,5 Metern, sofern keine Regel etwas anderes besagt.",
     "en": "A creature has a reach of 5 feet unless a rule says otherwise."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "reaction",
  "name": {
   "de": "Reaktion",
   "en": "Reaction"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Reaktion ist eine besondere Aktion, die als Antwort auf einen in der Beschreibung der Reaktion definierten Auslöser erfolgt. Du kannst eine Reaktion auch während des Zugs einer anderen Kreatur ausführen. Wenn du sie in deinem Zug ausführst, kannst du dies auch dann tun, wenn du bereits eine Aktion, eine Bonusaktion oder beides ausgeführt hast. Wenn du eine Reaktion ausgeführt hast, kannst du bis zum Beginn deines nächsten Zugs keine weitere Reaktion ausführen. Der Gelegenheitsangriff ist eine Reaktion, die allen Kreaturen zur Verfügung steht. Siehe auch „Gelegenheitsangriffe“ und „Die Spielregeln“ („Aktionen“).",
     "en": "A Reaction is a special action taken in response to a trigger defined in the Reaction’s description. You can take a Reaction on another creature’s turn, and if you take it on your turn, you can do so even if you also take an action, a Bonus Action, or both. Once you take a Reaction, you can’t take another one until the start of your next turn. The Opportunity Attack is a Reaction available to all creatures. See also “Opportunity Attacks” and “Playing the Game” (“Actions”)."
    }
   }
  ],
  "verweise": [
   "opportunity-attacks"
  ]
 },
 {
  "id": "ready",
  "name": {
   "de": "Vorbereiten",
   "en": "Ready"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Du führst die Vorbereiten‑Aktion aus, um auf bestimmte Umstände zu warten, ehe du handelst. Dazu führst du in deinem Zug diese Aktion aus, die dich dann vor Beginn deines nächstes Zugs handeln lässt, indem du deine Reaktion ausführst. Zunächst musst du festlegen, welcher wahrnehmbare Umstand deine Reaktion auslösen soll. Dann legst du fest, welche Handlung du vollziehen willst, wenn der Umstand eintritt. Dies kann eine Aktion, aber auch eine Bewegung bis zum vollen Umfang deiner Bewegungsrate sein. Beispiel: „Wenn der Kultist die Falltür betritt, bediene ich den Hebel, der sie öffnet“. Oder: „Wenn der Zombie sich neben mich stellt, bewege ich mich weg.“ Wenn der Auslöser eintritt, kannst du entweder deine Reaktion unmittelbar danach ausführen oder den Auslöser ignorieren. Bereitest du einen Zauberspruch vor, so wirkst du ihn wie gewohnt (und verbrauchst dabei die erforderlichen Ressourcen), setzt seinen Effekt aber erst dann mit deiner Reaktion frei, wenn der Auslöser eintritt. Es können nur Zauber mit einem Zeitaufwand von einer Aktion vorbereitet werden, und das Aufrechterhalten ihrer Magie erfordert Konzentration, die du bis zum Beginn deines nächsten Zugs aufrechterhalten kannst. Wenn deine Konzentration unterbrochen wird, misslingt der Zauber.",
     "en": "You take the Ready action to wait for a particular circumstance before you act. To do so, you take this action on your turn, which lets you act by taking a Reaction before the start of your next turn. First, you decide what perceivable circumstance will trigger your Reaction. Then, you choose the action you will take in response to that trigger, or you choose to move up to your Speed in response to it. Examples include “If the cultist steps on the trapdoor, I’ll pull the lever that opens it,” and “If the zombie steps next to me, I move away.” When the trigger occurs, you can either take your Reaction right after the trigger finishes or ignore the trigger. When you Ready a spell, you cast it as normal (expending any resources used to cast it) but hold its energy, which you release with your Reaction when the trigger occurs. To be readied, a spell must have a casting time of an action, and holding on to the spell’s magic requires Concentration, which you can maintain up to the start of your next turn. If your Concentration is broken, the spell dissipates without taking effect."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "resistance",
  "name": {
   "de": "Resistenz",
   "en": "Resistance"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du gegen eine Schadensart resistent bist, ist der Schaden dieser Art gegen dich halbiert (abgerundet). Die Resistenz wird pro Instanz des Schadens nur einmal angewendet. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "If you have Resistance to a damage type, damage of that type is halved against you (round down). Resistance is applied only once to an instance of damage. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "restrained",
  "name": {
   "de": "Festgesetzt",
   "en": "Restrained"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Festgesetzt hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Restrained condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.",
     "en": "Speed 0. Your Speed is 0 and can’t increase."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil, und deine Angriffswürfe sind im Nachteil.",
     "en": "Attacks Affected. Attack rolls against you have Advantage, and your attack rolls have Disadvantage."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Rettungswürfe: Du bist bei Geschicklichkeitsrettungswürfen im Nachteil.",
     "en": "Saving Throws Affected. You have Disadvantage on Dexterity saving throws."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "ritual",
  "name": {
   "de": "Ritual",
   "en": "Ritual"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du einen Zauber vorbereitet hast, der als Ritual gekennzeichnet ist, kannst du diesen Zauber als Ritual wirken. Es dauert zehn Minuten länger als sonst, die Ritualversion eines Zaubers zu wirken. Außerdem wird kein Zauberplatz verbraucht, was bedeutet, dass die Ritualversion nicht auf höheren Graden gewirkt werden kann. Siehe auch „Zauber“.",
     "en": "If you have a spell prepared that has the Ritual tag, you can cast that spell as a Ritual. The Ritual version of a spell takes 10 minutes longer to cast than normal. It also doesn’t expend a spell slot, which means the ritual version of a spell can’t be cast at a higher level. See also “Spells.”"
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "round-down",
  "name": {
   "de": "Abrunden",
   "en": "Round Down"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn eine Zahl im Spiel multipliziert oder geteilt wird, rundest du das Ergebnis gegebenenfalls ab. Selbst bei Dezimalstellen größer als fünf wird abgerundet. Manche Regeln machen eine Ausnahme und besagen, dass du aufrunden sollst.",
     "en": "Whenever you divide or multiply a number in the game, round down if you end up with a fraction, even if the fraction is one-half or greater. Some rules make an exception and tell you to round up."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "save",
  "name": {
   "de": "RW",
   "en": "Save"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "„RW“ ist die Abkürzung von „Rettungswurf“. Siehe auch „Rettungswurf“.",
     "en": "Save is another name for a saving throw. See also “Saving Throw.”"
    }
   }
  ],
  "verweise": [
   "saving-throw"
  ]
 },
 {
  "id": "saving-throw",
  "name": {
   "de": "Rettungswurf",
   "en": "Saving Throw"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Rettungswurf (RW) repräsentiert den Versuch, Gefahren zu entgehen oder zu widerstehen. Normalerweise führst du nur dann einen Rettungswurf aus, wenn eine Regel dies erfordert. Du kannst beschließen, den Rettungswurf misslingen zu lassen, ohne zu würfeln. Das Ergebnis eines Rettungswurfs ist im Effekt beschrieben, der ihn stattfinden lässt. Wenn ein Ziel zu einem Rettungswurf gezwungen wird, den entsprechenden Attributswert jedoch nicht hat, misslingt der Rettungswurf automatisch. Siehe auch „Die Spielregeln“ („W20‑Prüfungen“).",
     "en": "A saving throw—also called a save—represents an attempt to avoid or resist a threat. You normally make a saving throw only when a rule requires you to do so, but you can decide to fail the save without rolling. The result of a save is detailed in the effect that allowed it. If a target is forced to make a save and lacks the ability score used by it, the target automatically fails. See also “Playing the Game” (“D20 Tests”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "search",
  "name": {
   "de": "Suchen",
   "en": "Search"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du die Suchen‑Aktion ausführst, führst du einen Weisheitswurf aus, um etwas zu finden oder zu erfahren, was nicht offenkundig ist. In der Tabelle „Suchen“ findest du Vorschläge, welche Fertigkeiten bei dieser Aktion gelten – je nachdem, was du finden willst.",
     "en": "When you take the Search action, you make a Wisdom check to discern something that isn’t obvious. The Search table suggests which skills are applicable when you take this action, depending on what you’re trying to detect."
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Suchen",
     "en": "Search"
    },
    "kopf": {
     "de": [
      "Fertigkeit",
      "Suche nach ..."
     ],
     "en": [
      "Skill",
      "Thing to Detect"
     ]
    },
    "reihen": {
     "de": [
      [
       "Heilkunde",
       "Krankheit oder Todesursache einer Kreatur"
      ],
      [
       "Motiv erkennen",
       "Geisteszustand einer Kreatur"
      ],
      [
       "Überlebenskunst",
       "Spuren oder Nahrung"
      ],
      [
       "Wahrnehmung",
       "Verborgene Kreatur/verborgener Gegenstand"
      ]
     ],
     "en": [
      [
       "Insight",
       "Creature’s state of mind"
      ],
      [
       "Medicine",
       "Creature’s ailment or cause of death"
      ],
      [
       "Perception",
       "Concealed creature or object"
      ],
      [
       "Survival",
       "Tracks or food"
      ]
     ]
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "shape-shifting",
  "name": {
   "de": "Gestaltwandeln",
   "en": "Shape-Shifting"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn ein Effekt dich verwandelt, beispielsweise Tiergestalt oder der Zauber Verwandlung, ist in der Beschreibung des Effekts angegeben, was mit dir geschieht. Sofern in der Beschreibung nicht anders angegeben, werden alle Effekte, die gerade auf dich wirken – Zustände, Zauber, Flüche und dergleichen – von einer Gestalt auf die andere übertragen. Wenn du stirbst, verwandelst du dich in deine wahre Gestalt zurück.",
     "en": "If an effect, such as Wild Shape or the Polymorph spell, lets you shape-shift, its description specifies what happens to you. Unless that description says otherwise, any ongoing effects on you—conditions, spells, curses, and the like—carry over from one form to the other. You revert to your true form if you die."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "short-rest",
  "name": {
   "de": "Kurze Rast",
   "en": "Short Rest"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine kurze Rast ist eine einstündige Ruhepause, während der eine Kreatur höchstens leichte Aktivitäten wie Lesen, Reden, Essen oder Wache halten ausführt. Du musst mindestens einen Treffer punkt haben, um eine kurze Rast zu beginnen.",
     "en": "A Short Rest is a 1-hour period of downtime, during which a creature does nothing more strenuous than reading, talking, eating, or standing watch. To start a Short Rest, you must have at least 1 Hit Point."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Vorzüge der Rast: Wenn du die Rast beendest, erhältst du die folgenden Vorzüge:",
     "en": "Benefits of the Rest. When you finish the rest, you gain the following benefits:"
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Trefferpunktewürfel verbrauchen: Du kannst mindestens einen deiner Trefferpunktewürfel verbrauchen, um Trefferpunkte zurückzuerhalten. Würfle mit jedem Trefferpunktewürfel, den du auf diese Art verbrauchst, und füge dem Ergebnis deinen Konstitutionsmodifikator hinzu. Du erhältst Trefferpunkte in der Höhe des Gesamtergebnisses zurück (mindestens 1). Du kannst nach jedem Wurf entscheiden, ob du einen weiteren Trefferpunktewürfel verbrauchen willst.",
     "en": "Spend Hit Point Dice. You can spend one or more of your Hit Point Dice to regain Hit Points. For each Hit Point Die you spend in this way, roll the die and add your Constitution modifier to it. You regain Hit Points equal to the total (minimum of 1 Hit Point). You can decide to spend an additional Hit Point Die after each roll."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Besonderes Merkmal: Manche Merkmale werden durch eine kurze Rast aufgeladen. Wenn du ein solches Merkmal hast, wird es wie in seiner Beschreibung angegeben aufgeladen.",
     "en": "Special Feature. Some features are recharged by a Short Rest. If you have such a feature, it recharges in the way specified in its description."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Die Rast unterbrechen: Eine kurze Rast kann auf folgende Arten unterbrochen werden: • Initiative auswürfeln • Einen Zauber wirken, der kein Zaubertrick ist • Schaden erleiden Eine unterbrochene kurze Rast gewährt keine Vorzüge.",
     "en": "Interrupting the Rest. A Short Rest is stopped by the following interruptions: • Rolling Initiative • Casting a spell other than a cantrip • Taking any damage An interrupted Short Rest confers no benefits."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "simultaneous-effects",
  "name": {
   "de": "Gleichzeitige Effekte",
   "en": "Simultaneous Effects"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn in einem Zug mehrere Dinge zugleich passieren, entscheidet die Person am Spieltisch, die gerade am Zug ist – Spieler oder SL –, in welcher Reihenfolge diese Dinge geschehen. Beispiel: Wenn zu Beginn des Zugs eines Spielercharakters zwei Effekte auftreten, entscheidet der Spieler, welcher Effekt sich zuerst ereignet.",
     "en": "If two or more things happen at the same time on a turn, the person at the game table—player or GM— whose turn it is decides the order in which those things happen. For example, if two effects occur at the start of a player character’s turn, the player decides which of the effects happens first."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "size",
  "name": {
   "de": "Größe",
   "en": "Size"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Kreaturen sowie Gegenstände gehören jeweils zu einer Größenkategorie: Winzig, Klein, Mittelgroß, Groß, Riesig oder Gigantisch. Die Größe einer Kreatur bestimmt, wie viel Platz die Kreatur im Kampf einnimmt. Die Größe eines Gegenstands beeinflusst seine Trefferpunkte. Siehe auch „Gegenstände zerstören“ und „Die Spielregeln“ („Kampf“).",
     "en": "A creature or an object belongs to a size category: Tiny, Small, Medium, Large, Huge, or Gargantuan. A creature’s size determines how much space the creature occupies in combat. An object’s size affects its Hit Points. See also “Breaking Objects” and “Playing the Game” (“Combat”)."
    }
   }
  ],
  "verweise": [
   "breaking-objects"
  ]
 },
 {
  "id": "skill",
  "name": {
   "de": "Fertigkeit",
   "en": "Skill"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Fertigkeit ist ein Spezialgebiet, das mit einem Attributswurf assoziiert ist. Wenn du Übung in einer Fertigkeit hast und einen Attributswurf ausführst, der mit dieser Fertigkeit assoziiert ist, kannst du dem Ergebnis deinen Übungsbonus hinzufügen. Siehe auch „Die Spielregeln“ („Übung“).",
     "en": "A skill is an area of specialization associated with an ability check. If you have proficiency in a skill, you can add your Proficiency Bonus when you make an ability check associated with that skill. See also “Playing the Game” (“Proficiency”)."
    }
   }
  ],
  "verweise": [
   "proficiency"
  ]
 },
 {
  "id": "speed",
  "name": {
   "de": "Bewegungsrate",
   "en": "Speed"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur hat eine Bewegungsrate. Diese ist die Strecke in Metern, die die Kreatur höchstens zurücklegen kann, wenn sie sich in ihrem Zug bewegt. Siehe auch „Fliegen“, „Klettern“, „Kriechen“, „Schwimmen“, „Springen“ und „Die Spielregeln“ („Kampf“).",
     "en": "A creature has a Speed, which is the distance in feet the creature can cover when it moves on its turn. See also “Climbing,” “Crawling,” “Flying,” “Jumping,” “Swimming” and “Playing the Game” (“Combat”)."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Besondere Bewegungsraten: Manche Kreaturen haben besondere Bewegungsraten wie eine Flug ‑, Grab‑, Kletter‑ oder Schwimmbewegungsrate, wie jeweils in diesem Glossar definiert. Wenn du mehrere Bewegungsraten hast, wähle eine aus, wenn du dich bewegst. Du kannst in deinem Zug zwischen deinen Bewegungsraten wechseln. Ziehe bei jedem Wechsel die Entfernung, die du bereits zurückgelegt hast, von der neuen Bewegungsrate ab. Das Ergebnis bestimmt, wie weit du dich noch bewegen kannst. Ist das Ergebnis 0 oder negativ, so kannst du dich im aktuellen Zug nicht mehr bewegen. Beispiel: Falls du über eine Bewegungsrate von neun Metern und eine Flugbewegungsrate von zwölf Metern verfügst, könntest du drei Meter weit fliegen, drei Meter weit gehen und dich dann wieder in die Luft erheben, um sechs Meter weit zu fliegen.",
     "en": "Special Speeds. Some creatures have special speeds, such as a Burrow Speed, Climb Speed, Fly Speed, or Swim Speed, each of which is defined in this glossary. If you have more than one speed, choose which one to use when you move; you can switch between the speeds during your move. Whenever you switch, subtract the distance already moved from the new speed. The result determines how much farther you can move. If the result is 0 or less, you can’t use the new speed during the current move. For example, if you have a Speed of 30 and a Fly Speed of 40, you could fly 10 feet, walk 10 feet, and leap into the air to fly 20 feet more."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Änderungen deiner Bewegungsraten: Wenn ein Effekt deine Bewegungsrate vorübergehend erhöht oder verringert, werden besondere Bewegungsraten für die gleiche Dauer um den gleichen Betrag erhöht oder verringert. Beispiel: Wenn deine Bewegungsrate auf 0 verringert ist und du eine Kletterbewegungsrate hast, wird diese ebenfalls auf 0 verringert. Wenn deine Bewegungsrate halbiert wird und du über eine Flugbewegungsrate verfügst, wird diese ebenfalls halbiert.",
     "en": "Changes to Your Speeds. If an effect increases or decreases your Speed for a time, any special speed you have increases or decreases by an equal amount for the same duration. For example, if your Speed is reduced to 0 and you have a Climb Speed, your Climb Speed is also reduced to 0. Similarly, if your Speed is halved and you have a Fly Speed, your Fly Speed is also halved."
    }
   }
  ],
  "verweise": [
   "climbing",
   "crawling",
   "flying",
   "jumping",
   "swimming"
  ]
 },
 {
  "id": "spell",
  "name": {
   "de": "Zauber",
   "en": "Spell"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Zauber ist ein magischer Effekt mit den unter „Zauber“ beschriebenen Eigenschaften.",
     "en": "A spell is a magical effect that has the characteristics described in “Spells.”"
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "spell-attack",
  "name": {
   "de": "Zauberangriff",
   "en": "Spell Attack"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Zauberangriff ist ein Angriffswurf, der im Rahmen eines Zaubers oder eines anderen magische Effekts ausgeführt wird. Siehe auch „Zauber“ („Zauber wirken“).",
     "en": "A spell attack is an attack roll made as part of a spell or another magical effect. See also “Spells” (“Casting Spells”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "spellcasting-focus",
  "name": {
   "de": "Zauberfokus",
   "en": "Spellcasting Focus"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Zauberfokus ist ein Gegenstand, den bestimmte Kreaturen anstelle der Materialkomponenten eines Zaubers verwenden können, sofern diese Materialien vom Zauber nicht verbraucht werden und keine Kosten für sie angegeben sind. Manche Klassen erlauben ihren Mitgliedern, bestimmte Arten von Zauberfokussen zu verwenden. Siehe auch „Zauber“ („Zauber wirken“).",
     "en": "A Spellcasting Focus is an object that certain creatures can use in place of a spell’s Material components if those materials aren’t consumed by the spell and don’t have a cost specified. Some classes allow its members to use certain types of Spellcasting Focuses. See also “Spells” (“Casting Spells”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "sphere",
  "name": {
   "de": "Kugel",
   "en": "Sphere"
  },
  "tag": "wirkungsbereich",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kugel ist ein Wirkungsbereich, der von einem Ursprungspunkt in geraden Linien in alle Richtungen ausgeht. Der Effekt, der die Kugel erzeugt, definiert die Wirkungsdistanz als Radius der Kugel. Der Ursprungspunkt der Kugel ist im Wirkungsbereich des Zaubers enthalten.",
     "en": "A Sphere is an area of effect that extends in straight lines from a point of origin outward in all directions. The effect that creates a Sphere specifies the distance it extends as the radius of the Sphere. A Sphere’s point of origin is included in the Sphere’s area of effect."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "stable",
  "name": {
   "de": "Stabil",
   "en": "Stable"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur ist stabil, wenn sie zwar 0 Trefferpunkte hat, aber keine Todesrettungswürfe ausführen muss. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "A creature is Stable if it has 0 Hit Points but isn’t required to make Death Saving Throws. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "stat-block",
  "name": {
   "de": "Wertekasten",
   "en": "Stat Block"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Wertekasten enthält die Spielwerte eines Monsters. Jeder Wertekasten enthält nach dem Namen des Monsters folgende Informationen:",
     "en": "A stat block contains the game statistics of a monster. Each stat block includes the following information presented after the monster’s name."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Größe: Die möglichen Größenkategorien lauten Winzig, Klein, Mittelgroß, Groß, Riesig und Gigantisch. Siehe auch „Größe“.",
     "en": "Size. A monster is Tiny, Small, Medium, Large, Huge, or Gargantuan. See also “Size.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Kreaturentyp: In diesem Eintrag ist die Kreaturenfamilie des Monsters angegeben, gegebenenfalls mit beschreibenden Bezeichnungen. Siehe auch „Kreaturentyp“.",
     "en": "Creature Type. This entry notes the family of beings a monster belongs to, along with any descriptive tags. See also “Creature Type.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Gesinnung: Die Gesinnung ist ein Vorschlag für das Monster. Der SL bestimmt seine tatsächliche Gesinnung. Siehe auch „Gesinnung“.",
     "en": "Alignment. An alignment is suggested for the monster, with the GM determining its actual alignment. See also “Alignment.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "RK, Initiative und TP: Diese Einträge nennen Rüstungsklasse, Initiative und Trefferpunkte des Monsters, jeweils unter „Die Spielregeln“ beschrieben. Hinter den Trefferpunkten sind die Trefferpunktewürfel des Monsters in Klammern angegeben, außerdem gegebenenfalls der Beitrag seiner Konstitution zu seinen Trefferpunkten. Nach dem Initiativemodifikator ist ein Initiativewert genannt. Manche Kreaturen, die auf magische Art erzeugt wurden, haben weder Trefferwürfel ‑ noch Initiativeinformationen.",
     "en": "AC, Initiative, and HP. These entries give the monster’s Armor Class, Initiative, and Hit Points, which are detailed in “Playing the Game.” In parentheses after the Hit Points, the monster’s Hit Point Dice are provided, along with the contribution of its Constitution, if any, to its Hit Points. Following the Initiative modifier is an Initiative score. Some creatures that are created by magic lack Hit Dice and Initiative information."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Bewegungsrate: Hier sind Bewegungsrate und vorhandene besondere Bewegungsraten des Monsters aufgeführt. Siehe auch „Flugbewegungsrate“, „Grabbewegungsrate“, „Kletterbewegungsrate“ und „Schwimmbewegungsrate“.",
     "en": "Speed. Here the monster’s Speed is provided, along with any special speeds. See also “Burrow Speed,” “Climb Speed,” “Fly Speed,” and “Swim Speed.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Attributswerte: Die Attributswerte, Modifikatoren und Rettungswurfmodifikatoren eines Monsters, jeweils unter „Die Spielregeln“ beschrieben, lassen sich einer Tabelle entnehmen.",
     "en": "Ability Scores. A table provides the monster’s ability scores, modifiers, and saving throw modifiers, all of which are detailed in “Playing the Game.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Fertigkeiten: Dieser Eintrag führt Fertigkeiten und vorhandene Übungen des Monsters auf. Siehe auch „Die Spielregeln“ („Übung“).",
     "en": "Skills. This entry lists the monster’s skill proficiencies, if any. See also “Playing the Game” (“Proficiency”)."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Resistenzen und Anfälligkeiten: Diese Einträge listen die vorhandenen Resistenzen und Anfälligkeiten des Monsters auf. Siehe auch „Resistenz“ und „Anfälligkeit“.",
     "en": "Resistances and Vulnerabilities. These entries list the monster’s Resistances and Vulnerabilities, if any. See also “Resistance” and “Vulnerability.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Immunitäten: In diesem Abschnitt sind die Schadens‑ und Zustandsimmunitäten eines Monsters angegeben, sofern vorhanden. Siehe auch „Immunität“.",
     "en": "Immunities. This section lists the monster’s damage and condition Immunities, if any. See also “Immunity.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Ausrüstung: Wenn das Monster über Ausrüstung verfügt, die weggegeben oder genommen werden kann, ist sie in diesem Eintrag aufgeführt.",
     "en": "Gear. If the monster has any equipment that can be given away or retrieved, it’s listed in this entry."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Sinne: Dieser Eintrag nennt die Spezialsinne des Monsters, beispielsweise Dunkelsicht, sowie seine passive Wahrnehmung. Siehe auch „Passive Wahrnehmung“.",
     "en": "Senses. This entry lists the monster’s special senses, such as Darkvision, and its Passive Perception. See also “Passive Perception.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Sprachen: In diesem Eintrag sind alle Sprachen aufgeführt, die das Monster kennt.",
     "en": "Languages. This entry lists any languages the monster knows."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "HG: Der Herausforderungsgrad fasst zusammen, wie groß die Bedrohung durch das Monster ist. Unter „Monster“ ist dieser Wert genauer beschrieben. Danach sind die Erfahrungspunkte, die Charaktere bei einem Sieg über das Monster erhalten, sowie der Übungsbonus des Monsters aufgeführt. Manche Kreaturen, die auf magische Art erzeugt wurden, haben keinen HG. Siehe auch „Herausforderungsgrad“ und „Erfahrungspunkte“.",
     "en": "CR. Challenge Rating summarizes the threat a monster poses and is detailed in “Monsters.” The Experience Points characters receive for defeating a monster and its Proficiency Bonus follow. Some creatures that are created by magic have no CR. See also “Challenge Rating” and “Experience Points.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Merkmale: Hierbei handelt es sich um Merkmale des Monsters, die entweder immer oder in bestimmte Situationen aktiv sind.",
     "en": "Traits. The monster’s traits, if any, are features that are active at all times or in certain situations."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Aktionen: Das Monster kann die hier aufgeführten Aktionen zusätzlich zu den in diesem Glossar beschriebenen ausführen. Siehe auch „Die Spielregeln“ („Aktionen“).",
     "en": "Actions. The monster can take these actions in addition to those detailed in this glossary. See also “Playing the Game” (“Actions”)."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Bonusaktionen: Wenn dem Monster Bonusaktionen zur Verfügung stehen, sind diese hier aufgeführt.",
     "en": "Bonus Actions. If the monster has Bonus Action options, they are listed in this section."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Reaktionen: Wenn das Monster besondere Reaktionen ausführen kann, sind diese hier aufgeführt.",
     "en": "Reactions. If the monster can take special Reactions, those are listed in this section."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Angriffsnotation: Der Eintrag zu einem Monsterangriff beginnt mit der Information, ob es sich um einen Nahkampf‑ oder einen Fernkampfangriff handelt, gefolgt vom Bonus des Angriffswurfs, den Reichweiten und der Wirkung eines Treffers. Ein Angriff wird jeweils gegen ein Ziel ausgeführt, sofern es in seinem Eintrag nicht anders vermerkt ist.",
     "en": "Attack Notation. The entry for a monster’s attack starts by identifying whether the attack is a melee or a ranged attack and then provides the attack roll’s bonus, its reach or range, and what happens on a hit. An attack is against one target unless its entry says otherwise."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Rettungswurf-Effektnotation: Wenn ein Effekt einen Rettungswurf erzwingt, werden im Eintrag des Effekts zunächst Art und SG des erforderlichen Rettungswurfs genannt, dann wird beschrieben, welche Kreaturen den Rettungswurf ausführen müssen und was geschieht, wenn sie den Rettungswurf bestehen oder dabei scheitern.",
     "en": "Saving Throw Effect Notation. If an effect forces a saving throw, the effect’s entry starts by identifying the kind of saving throw required and then provides the save’s DC, a description of which creatures must make the save, and what happens on a failed or a successful save."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Schadensnotation: Im Wertekasten werden für jede Schadensinstanz üblicherweise sowohl eine fixe Zahl als auch ein Würfelausdruck angegeben. Beispiel: Ein Angriff könnte bei einem Treffer 4 (1W4+2) Schaden bewirken. Der SL bestimmt, ob die fixe Zahl oder der Würfelausdruck in Klammern verwendet werden. Es wird nicht beides verwendet.",
     "en": "Damage Notation. A stat block usually provides both a static number and a die expression for each instance of damage. For example, an attack might deal 4 (1d4 + 2) damage on a hit. The GM determines whether you use the static number or the die expression in parentheses; you don’t use both."
    }
   }
  ],
  "verweise": [
   "size",
   "creature-type",
   "alignment",
   "burrow-speed",
   "climb-speed",
   "fly-speed",
   "swim-speed",
   "proficiency",
   "resistance",
   "vulnerability",
   "immunity",
   "passive-perception",
   "challenge-rating",
   "experience-points"
  ]
 },
 {
  "id": "study",
  "name": {
   "de": "Studieren",
   "en": "Study"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du die Studieren‑Aktion ausführst, führst du einen Intelligenzwurf aus, um deine Erinnerung, ein Buch, einen Hinweis oder eine andere Wissensquelle zu studieren und Erkenntnisse über wichtige Informationen zu erzielen. Die Tabelle „Wissensgebiete“ enthält Vorschläge, welche Fertigkeiten zu den verschiedenen Wissensgebieten passen.",
     "en": "When you take the Study action, you make an Intelligence check to study your memory, a book, a clue, or another source of knowledge and call to mind an important piece of information about it. The Areas of Knowledge table suggests which skills are applicable to various areas of knowledge."
    }
   },
   {
    "typ": "tabelle",
    "titel": {
     "de": "Wissensgebiete",
     "en": "Areas of Knowledge"
    },
    "kopf": {
     "de": [
      "Fertigkeit",
      "Gebiete"
     ],
     "en": [
      "Skill",
      "Areas"
     ]
    },
    "reihen": {
     "de": [
      [
       "Arkane Kunde",
       "Zauber, magische Gegenstände, mystische Symbole, magische Traditionen, Existenzebenen und bestimmte Kreaturen (Aberrationen, Elementare, Feenwesen, Konstrukte und Monstrositäten)"
      ],
      [
       "Geschichte",
       "Historische Ereignisse und Völker, vergangene Zivilisationen, Kriege und bestimmte Kreaturen (Riesen und Humanoiden)."
      ],
      [
       "Nachforschungen",
       "Fallen, Geheimschriften, Rätsel und Apparaturen"
      ],
      [
       "Naturkunde",
       "Gelände, Flora, Wetter und bestimmte Kreaturen (Drachen, Pflanzen, Schlicke, Tiere)"
      ],
      [
       "Religion",
       "Gottheiten, religiöse Hierarchien und Riten, heilige Symbole, Kulte und bestimmte Kreaturen (celestische Wesen, Unholde und Untote)"
      ]
     ],
     "en": [
      [
       "Arcana",
       "Spells, magic items, eldritch symbols, magical traditions, planes of existence, and certain creatures (Aberrations, Constructs, Elementals, Fey, and Monstrosities)"
      ],
      [
       "History",
       "Historic events and people, ancient civilizations, wars, and certain creatures (Giants and Humanoids)"
      ],
      [
       "Investigation",
       "Traps, ciphers, riddles, and gadgetry"
      ],
      [
       "Nature",
       "Terrain, flora, weather, and certain creatures (Beasts, Dragons, Oozes, and Plants)"
      ],
      [
       "Religion",
       "Deities, religious hierarchies and rites, holy symbols, cults, and certain creatures (Celestials, Fiends, and Undead)"
      ]
     ]
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "stunned",
  "name": {
   "de": "Betäubt",
   "en": "Stunned"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Betäubt hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Stunned condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Kampfunfähig: Du hast den Zustand Kampfunfähig.",
     "en": "Incapacitated. You have the Incapacitated condition."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.",
     "en": "Saving Throws Affected. You automatically fail Strength and Dexterity saving throws."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.",
     "en": "Attacks Affected. Attack rolls against you have Advantage."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "suffocation",
  "name": {
   "de": "Erstickung",
   "en": "Suffocation"
  },
  "tag": "gefahr",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur kann für eine Zeitspanne die Luft anhalten, die ihrem Konstitutionsmodifikator plus 1 in Minuten entspricht (mindestens 30 Sekunden). Danach setzt die Erstickung ein. Solange eine Kreatur keine Luft bekommt oder erstickt, erhält sie am Ende jedes ihrer Züge eine Erschöpfungsstufe. Sobald sie wieder atmen kann, werden alle Erschöpfungsstufen entfernt, die sie durch die Erstickung erhalten hat.",
     "en": "A creature can hold its breath for a number of minutes equal to 1 plus its Constitution modifier (minimum of 30 seconds) before suffocation begins. When a creature runs out of breath or is choking, it gains 1 Exhaustion level at the end of each of its turns. When a creature can breathe again, it removes all levels of Exhaustion it gained from suffocating."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "surprise",
  "name": {
   "de": "Überraschung",
   "en": "Surprise"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn eine Kreatur nicht mit einem Kampf gerechnet hat, wird sie überrascht und damit bei ihrem Initiativewurf im Nachteil. Siehe auch „Die Spielregeln“ („Kampf“).",
     "en": "If a creature is caught unawares by the start of combat, that creature is surprised, which causes it to have Disadvantage on its Initiative roll. See also “Playing the Game” (“Combat”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "swimming",
  "name": {
   "de": "Schwimmen",
   "en": "Swimming"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Beim Schwimmen kostet dich jeder Meter, den du zurücklegst, einen zusätzlichen Meter Bewegungsrate (zwei zusätzliche Meter in schwierigem Gelände). Du kannst diese zusätzlichen Kosten ignorieren, wenn du über eine Schwimmbewegungsrate verfügst und sie beim Schwimmen verwendest. Nach Ermessen des SL kann jede Strecke in rauem Gewässer einen erfolgreichen SG‑15‑Stärkewurf (Athletik) erfordern.",
     "en": "While you’re swimming, each foot of movement costs 1 extra foot (2 extra feet in Difficult Terrain). You ignore this extra cost if you have a Swim Speed and use it to swim. At the GM’s option, moving any distance in rough water might require a successful DC 15 Strength (Athletics) check."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "swim-speed",
  "name": {
   "de": "Schwimmbewegungsrate",
   "en": "Swim Speed"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Schwimmbewegungsrate kann verwendet werden, um zu schwimmen, ohne die zusätzliche Bewegung zu benötigen, die dabei normalerweise anfällt. Siehe auch „Bewegungsrate“ und „Schwimmen“.",
     "en": "A Swim Speed can be used to swim without expending the extra movement normally associated with swimming. See also “Swimming” and “Speed.”"
    }
   }
  ],
  "verweise": [
   "swimming",
   "speed"
  ]
 },
 {
  "id": "target",
  "name": {
   "de": "Ziel",
   "en": "Target"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ziel sind Kreaturen oder Gegenstände, gegen die sich ein Angriffswurf richtet, die zu einem Rettungswurf gezwungen oder für die Effekte eines Zaubers oder sonstigen Phänomens ausgewählt werden.",
     "en": "A target is the creature or object targeted by an attack roll, forced to make a saving throw by an effect, or selected to receive the effects of a spell or another phenomenon."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "telepathy",
  "name": {
   "de": "Telepathie",
   "en": "Telepathy"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Telepathie ist eine magische Fähigkeit, die Kreaturen gestattet, auf eine bestimmte Reichweite mental mit anderen Kreaturen zu kommunizieren. Sofern keine Regel etwas anderes besagt, muss die kontaktierte Kreatur keine Sprache mit dem Telepathen teilen, um die Kommunikation zu verstehen. Sie muss jedoch mindestens eine Sprache verstehen oder selbst telepathisch sein. Der Telepath braucht die kontaktierte Kreatur nicht zu sehen, und er kann den telepathischen Kontakt jederzeit herstellen oder beenden (keine Aktion erforderlich). Der telepathische Kontakt kann nicht begonnen werden oder bricht sofort ab, wenn der Telepath oder die andere Kreatur kampfunfähig wird. Der Kontakt bricht auch dann ab, wenn die kontaktierte Kreatur die Reichweite der Telepathie verlässt oder der Telepath eine andere Kreatur in Reichweite kontaktiert. Kreaturen ohne Telepathie können telepathische Nachrichten empfangen, jedoch selbst kein telepathisches Gespräch beginnen. Wenn ein telepathisches Gespräch beginnt, kann der Nicht‑Telepath mental mit dem Telepathen kommunizieren, bis die telepathische Verbindung endet.",
     "en": "Telepathy is a magical ability that allows a creature to communicate mentally with another creature within a specified range. Unless a rule states otherwise, the contacted creature doesn’t need to share a language with the telepath to understand this communication, but the contacted creature must be able to understand at least one language or be telepathic itself to understand. A telepath doesn’t need to see a contacted creature, and the telepath can start or end the telepathic contact at any time (no action required). Telepathic contact can’t be initiated and is immediately broken if either the telepath or the other creature has the Incapacitated condition. Telepathic contact is also broken if the contacted creature is no longer within the telepathy’s range or if the telepath contacts a different creature within range. A creature without telepathy can receive telepathic messages but can’t initiate a telepathic conversation. Once a telepathic conversation starts, the non-telepath can communicate mentally to the telepath until the telepathic connection ends."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "teleportation",
  "name": {
   "de": "Teleportation",
   "en": "Teleportation"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Teleportation ist eine besondere Art von magischem Transport. Wenn du dich teleportierst, verschwindest du und erscheinst unmittelbar irgendwo anders, ohne dich durch den Raum dazwischen bewegt zu haben. Dieser Transport verbraucht keine Bewegung, sofern nicht eine Regel etwas anderes besagt. Teleportation provoziert niemals Gelegenheitsangriffe. Wenn du dich teleportierst, wird jede Ausrüstung, die du trägst oder hältst, mit dir teleportiert. Berührst du während der Teleportation eine andere Kreatur, so wird diese Kreatur nicht mit dir teleportiert, sofern beim Teleportationseffekt nicht anders vermerkt. Wenn der Zielbereich der Teleportation von einer anderen Kreatur besetzt oder von einem massiven Hindernis blockiert ist, erscheinst du stattdessen im nächsten freien Bereich deiner Wahl. In der Beschreibung des Teleportationseffekts erfährst du, ob du den Zielort der Teleportation sehen können musst.",
     "en": "Teleportation is a special kind of magical transportation. If you teleport, you disappear and reappear elsewhere instantly, without moving through the intervening space. This transportation doesn’t expend movement unless a rule tells you otherwise, and teleportation never provokes Opportunity Attacks. When you teleport, all the equipment you’re wearing and carrying teleports with you. If you’re touching another creature when you teleport, that creature doesn’t teleport with you unless the teleportation effect says otherwise. If the destination space of your teleportation is occupied by another creature or blocked by a solid obstacle, you instead appear in the nearest unoccupied space of your choice. The description of a teleportation effect tells you if you must see the teleportation’s destination."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "temporary-hit-points",
  "name": {
   "de": "Temporäre Trefferpunkte",
   "en": "Temporary Hit Points"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Temporäre Trefferpunkte werden durch bestimmte Effekte gewährt. Sie fungieren als Puffer, um weniger echte Trefferpunkte zu verlieren. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "Temporary Hit Points are granted by certain effects and act as a buffer against losing real Hit Points. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "tremorsense",
  "name": {
   "de": "Erschütterungssinn",
   "en": "Tremorsense"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Kreatur mit Erschütterungssinn kennt den Ort von Kreaturen und bewegten Gegenständen innerhalb einer bestimmten Reichweite, sofern sie und die erkannten Ziele beide in Kontakt mit derselben Oberfläche (dem Boden, einer Wand, einer Decke) oder derselben Flüssigkeit sind. Erschütterungssinn kann keine Kreaturen oder Gegenstände in der Luft erspüren und zählt nicht als Form der Sicht.",
     "en": "A creature with Tremorsense can pinpoint the location of creatures and moving objects within a specific range, provided that the creature with Tremorsense and anything it is detecting are both in contact with the same surface (such as the ground, a wall, or a ceiling) or the same liquid. Tremorsense can’t detect creatures or objects in the air, and it doesn’t count as a form of sight."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "truesight",
  "name": {
   "de": "Wahrer Blick",
   "en": "Truesight"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du über Wahrer Blick verfügst, ist dein Sehvermögen auf eine bestimmte Reichweite verbessert. Auf diese Reichweite durchdringt deine Sicht Folgendes:",
     "en": "If you have Truesight, your vision is enhanced within a specified range. Within that range, your vision pierces through the following:"
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Dunkelheit: Du kannst in normaler sowie magischer Dunkelheit sehen.",
     "en": "Darkness. You can see in normal and magical Darkness."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Unsichtbarkeit: Du kannst Kreaturen und Gegenstände sehen, die den Zustand Unsichtbar haben.",
     "en": "Invisibility. You see creatures and objects that have the Invisible condition."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Visuelle Illusionen: Visuelle Illusionen erscheinen dir durchsichtig, und Rettungswürfe gegen sie bestehst du automatisch.",
     "en": "Visual Illusions. Visual illusions appear transparent to you, and you automatically succeed on saving throws against them."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Verwandlungen: Du erkennst die wahre Gestalt aller Kreaturen und Gegenstände, die du siehst und die durch Magie verwandelt wurden.",
     "en": "Transformations. You discern the true form of any creature or object you see that has been transformed by magic."
    }
   },
   {
    "typ": "stichpunkt",
    "text": {
     "de": "Ätherebene: Du kannst in die Ätherebene blicken.",
     "en": "Ethereal Plane. You see into the Ethereal Plane."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "unarmed-strike",
  "name": {
   "de": "Waffenloser Angriff",
   "en": "Unarmed Strike"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Anstatt einer Waffe kannst du als Nahkampfangriff auch einen Fausthieb, einen Tritt, einen Kopfstoß oder einen ähnlich kraftvollen Hieb einsetzen. Nach den Spielbegriffen ist dies ein waffenloser Angriff – ein Nahkampfangriff, bei dem du deinen Körper einsetzt, um einem Ziel im Abstand von bis zu 1,5 Metern von dir Schaden zuzufügen, um es zu packen oder zu stoßen. Wann immer du deinen waffenlosen Angriff einsetzt, wähle als Effekt eine der folgenden Optionen aus:",
     "en": "Instead of using a weapon to make a melee attack, you can use a punch, kick, headbutt, or similar forceful blow. In game terms, this is an Unarmed Strike—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you. Whenever you use your Unarmed Strike, choose one of the following options for its effect."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Schaden: Du führst einen Angriffswurf gegen das Ziel aus. Dein Bonus auf den Wurf entspricht deinem Stärkemodifikator plus deinem Übungsbonus. Bei einem Treffer erleidet das Ziel Wuchtschaden in Höhe von 1 plus deinem Stärkemodifikator.",
     "en": "Damage. You make an attack roll against the target. Your bonus to the roll equals your Strength modifier plus your Proficiency Bonus. On a hit, the target takes Bludgeoning damage equal to 1 plus your Strength modifier."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Packen: Das Ziel muss einen Stärke ‑ oder Geschicklichkeitsrettungswurf (nach seiner Wahl) bestehen, oder es wird gepackt. Der SG für den Rettungswurf und alle Befreiungsversuche entspricht 8 plus deinem Stärkemodifikator plus deinem Übungsbonus. Du kannst ein Ziel nur dann packen, wenn es um höchstens eine Kategorie größer als du ist und du eine Hand frei hast, um damit zuzupacken. Siehe auch „Gepackt halten“.",
     "en": "Grapple. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or it has the Grappled condition. The DC for the saving throw and any escape attempts equals 8 plus your Strength modifier and Proficiency Bonus. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it. See also “Grappling.”"
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Stoßen: Das Ziel muss einen Stärke ‑ oder Geschicklichkeitsrettungswurf (nach seiner Wahl) bestehen, anderenfalls stößt du es entweder 1,5 Meter von dir weg, oder du stößt es um, sodass es den Zustand Liegend hat. Der SG für den Rettungswurf entspricht 8 plus deinem Stärkemodifikator plus deinem Übungsbonus. Ein solcher Stoß ist nur dann möglich, wenn das Ziel um höchstens eine Kategorie größer als du ist.",
     "en": "Shove. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or you either push it 5 feet away or cause it to have the Prone condition. The DC for the saving throw equals 8 plus your Strength modifier and Proficiency Bonus. This shove is possible only if the target is no more than one size larger than you."
    }
   }
  ],
  "verweise": [
   "grappling"
  ]
 },
 {
  "id": "unconscious",
  "name": {
   "de": "Bewusstlos",
   "en": "Unconscious"
  },
  "tag": "zustand",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du den Zustand Bewusstlos hast, wirken folgende Effekte auf dich:",
     "en": "While you have the Unconscious condition, you experience the following effects."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Inert: Du hast die Zustände Kampfunfähig und Liegend, und du lässt fallen, was immer du gehalten hast. Wenn dieser Zustand endet, bist du weiterhin liegend.",
     "en": "Inert. You have the Incapacitated and Prone conditions, and you drop whatever you’re holding. When this condition ends, you remain Prone."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Keine Bewegungsrate: Deine Bewegungsrate beträgt 0 und kann nicht erhöht werden.",
     "en": "Speed 0. Your Speed is 0 and can’t increase."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Angriffe: Angriffswürfe gegen dich sind im Vorteil.",
     "en": "Attacks Affected. Attack rolls against you have Advantage."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Beeinträchtigte Rettungswürfe: Du scheiterst bei Stärke‑ und Geschicklichkeitsrettungswürfen automatisch.",
     "en": "Saving Throws Affected. You automatically fail Strength and Dexterity saving throws."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Automatische kritische Treffer: Jeder Angriffswurf, der dich trifft, ist ein kritischer Treffer, sofern der Angreifer sich im Abstand von bis zu 1,5 Metern von dir befindet.",
     "en": "Automatic Critical Hits. Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you."
    }
   },
   {
    "typ": "punkt",
    "text": {
     "de": "Ohne Bewusstsein: Du nimmst deine Umgebung nicht wahr.",
     "en": "Unaware. You’re unaware of your surroundings."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "unoccupied-space",
  "name": {
   "de": "Freier Bereich",
   "en": "Unoccupied Space"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Bereich ist frei, wenn sich keine Kreaturen darin aufhalten und er nicht vollständig mit Gegenständen angefüllt ist.",
     "en": "A space is unoccupied if no creatures are in it and it isn’t completely filled by objects."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "utilize",
  "name": {
   "de": "Verwenden",
   "en": "Utilize"
  },
  "tag": "aktion",
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Normalerweise interagierst du im Rahmen einer anderen Aktion mit Gegenständen – wenn du beispielsweise im Rahmen der Angriffsaktion das Schwert ziehst. Wenn eine Aktion erforderlich ist, um einen Gegenstand zu verwenden, führst du die Verwenden‑Aktion aus.",
     "en": "You normally interact with an object while doing something else, such as when you draw a sword as part of the Attack action. When an object requires an action for its use, you take the Utilize action."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "vulnerability",
  "name": {
   "de": "Anfälligkeit",
   "en": "Vulnerability"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Wenn du anfällig für eine Schadensart bist, ist der Schaden dieser Art gegen dich verdoppelt. Die Anfälligkeit wird pro Instanz des Schadens nur einmal angewendet. Siehe auch „Die Spielregeln“ („Schaden und Heilung“).",
     "en": "If you have Vulnerability to a damage type, damage of that type is doubled against you. Vulnerability is applied only once to an instance of damage. See also “Playing the Game” (“Damage and Healing”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "weapon",
  "name": {
   "de": "Waffe",
   "en": "Weapon"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Eine Waffe ist ein Gegenstand aus einer der Kategorien Einfache Waffe und Kriegswaffe. Siehe auch „Ausrüstung“ („Waffen“).",
     "en": "A weapon is an object that is in the Simple or Martial weapon category. See also “Equipment” (“Weapons”)."
    }
   }
  ],
  "verweise": []
 },
 {
  "id": "weapon-attack",
  "name": {
   "de": "Waffenangriff",
   "en": "Weapon Attack"
  },
  "tag": null,
  "bloecke": [
   {
    "typ": "absatz",
    "text": {
     "de": "Ein Waffenangriff ist ein Angriffswurf, der mit einer Waffe ausgeführt wird. Siehe auch „Waffe“.",
     "en": "A weapon attack is an attack roll made with a weapon. See also “Weapon.”"
    }
   }
  ],
  "verweise": [
   "weapon"
  ]
 }
] as readonly Glossareintrag[];
