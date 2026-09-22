/**
 * Die Zauber des SRD 5.2.1, alle 339, woertlich und in beiden Sprachen.
 *
 * DIESE DATEI IST ERZEUGT (werkzeug/zauber_lesen.py und
 * werkzeug/zauber_erzeugen.py) und wird nicht von Hand gepflegt. Gepaart
 * ueber Grad, Schule, Klassen, Komponenten, Konzentration, Ritual und die
 * Zahlen im Text; 25 Paare stehen von Hand in werkzeug/zauber_paare.json.
 * Die Bloecke stehen je Sprache in derselben Folge.
 */
import type { Paar } from './namensnennung';
import type { Gegenstandsblock } from './magische-gegenstaende';

export type Zauberblock = Gegenstandsblock;

export type Zauberschule =
  | 'bann'
  | 'beschwoerung'
  | 'erkenntnis'
  | 'verzauberung'
  | 'hervorrufung'
  | 'illusion'
  | 'nekromantie'
  | 'verwandlung';

export type Zauberklasse =
  | 'barde'
  | 'druide'
  | 'hexenmeister'
  | 'kleriker'
  | 'magier'
  | 'paladin'
  | 'waldlaeufer'
  | 'zauberer';

export interface Zaubereigenschaften {
  readonly zeit: string;
  readonly reichweite: string;
  readonly komponenten: string;
  readonly dauer: string;
}

export interface Zauber {
  /** Aus dem englischen Namen: „fireball". */
  readonly id: string;
  readonly name: Paar;
  /** Grad, Schule und Klassen, wie gedruckt: „Level 3 Evocation (Sorcerer, Wizard)". */
  readonly gradzeile: Paar;
  /** 0 fuer Zaubertricks. */
  readonly grad: number;
  readonly schule: Zauberschule;
  readonly klassen: readonly Zauberklasse[];
  readonly konzentration: boolean;
  readonly ritual: boolean;
  readonly eigenschaften: { readonly de: Zaubereigenschaften; readonly en: Zaubereigenschaften };
  readonly bloecke: { readonly de: readonly Zauberblock[]; readonly en: readonly Zauberblock[] };
}

export const ZAUBER: readonly Zauber[] = [
 {
  "id": "acid-arrow",
  "name": {
   "de": "Säurepfeil",
   "en": "Acid Arrow"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Magier)",
   "en": "Level 2 Evocation (Wizard)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (ein zerstoßenes Rhabarberblatt)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (powdered rhubarb leaf)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Auf ein Ziel in Reichweite schießt ein schimmernder grüner Pfeil, der in einem Sprühregen aus Säure explodiert. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 4W4 Säureschaden sowie 2W4 Säureschaden am Ende seines nächsten Zugs. Bei einem Misserfolg spritzt dennoch genügend Säure auf das Ziel, um ihm die Hälfte des anfänglichen Schadens zuzufügen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. werden anfänglicher sowie späterer Schaden jeweils um 1W4 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "acid-splash",
  "name": {
   "de": "Säurespritzer",
   "en": "Acid Splash"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Magier, Zauberer)",
   "en": "Evocation Cantrip (Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erzeugst an einem Punkt in Reichweite eine Säureblase, die in einer Kugel mit einem Radius von 1,5 Metern explodiert. Jede Kreatur in der Kugel muss einen Geschicklichkeitsrettungswurf bestehen, oder sie erleidet 1W6 Säureschaden."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W6 erhöht, wenn du die 5. (2W6), die 11. (3W6) und die 17. (4W6) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create an acidic bubble at a point within range, where it explodes in a 5-foot-radius Sphere. Each creature in that Sphere must succeed on a Dexterity saving throw or take 1d6 Acid damage."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
    }
   ]
  }
 },
 {
  "id": "aid",
  "name": {
   "de": "Beistand",
   "en": "Aid"
  },
  "gradzeile": {
   "de": "Bannzauber 2. Grades (Barde, Druide, Kleriker, Paladin, Waldläufer)",
   "en": "Level 2 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)"
  },
  "grad": 2,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein weißer Stoffstreifen)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a strip of white cloth)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle bis zu drei Kreaturen in Reichweite aus. Für die Wirkungsdauer werden Trefferpunktemaximum sowie aktuelle Trefferpunkte jedes Ziels um 5 erhöht."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. werden die Trefferpunkte jedes Ziels um jeweils 5 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose up to three creatures within range. Each target’s Hit Point maximum and current Hit Points increase by 5 for the duration."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Each target’s Hit Points increase by 5 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "alarm",
  "name": {
   "de": "Alarm",
   "en": "Alarm"
  },
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Magier, Waldläufer)",
   "en": "Level 1 Abjuration (Ranger, Wizard)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "magier",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (Glocke und Silberdraht)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a bell and silver wire)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst einen Alarm gegen Eindringen. Wähle eine Tür, ein Fenster oder einen Bereich in Reichweite aus, der nicht größer als ein Würfel mit sechs Metern Kantenlänge sein darf. Für die Wirkungsdauer warnt dich ein Alarm, wann immer eine Kreatur den geschützten Bereich berührt oder in ihn eindringt. Wenn du den Zauber wirkst, kannst du Kreaturen bestimmen, die den Alarm nicht auslösen. Außerdem wählst du aus, ob der Alarm akustisch oder mental erfolgt:"
    },
    {
     "typ": "stichpunkt",
     "text": "Akustischer Alarm: Der Alarm erzeugt im Abstand von bis zu 18 Metern vom geschützten Bereich zehn Sekunden lang das Geräusch einer Handglocke."
    },
    {
     "typ": "stichpunkt",
     "text": "Mentaler Alarm: Du wirst von einem mentalen Ping gewarnt, wenn du dich im Abstand von bis zu 1,6 Kilometern vom geschützten Bereich befindest. Dieser Ping weckt dich, wenn du schläfst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You set an alarm against intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot Cube. Until the spell ends, an alarm alerts you whenever a creature touches or enters the warded area. When you cast the spell, you can designate creatures that won’t set off the alarm. You also choose whether the alarm is audible or mental:"
    },
    {
     "typ": "stichpunkt",
     "text": "Audible Alarm. The alarm produces the sound of a handbell for 10 seconds within 60 feet of the warded area."
    },
    {
     "typ": "stichpunkt",
     "text": "Mental Alarm. You are alerted by a mental ping if you are within 1 mile of the warded area. This ping awakens you if you’re asleep."
    }
   ]
  }
 },
 {
  "id": "alter-self",
  "name": {
   "de": "Gestalt verändern",
   "en": "Alter Self"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Magier, Zauberer)",
   "en": "Level 2 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du veränderst deine physische Gestalt. Entscheide dich für eine der folgenden Optionen. Die Effekte bleiben für die Wirkungsdauer bestehen. Währenddessen kannst du eine magische Aktion ausführen, um die ausgewählte Option durch eine andere zu ersetzen."
    },
    {
     "typ": "punkt",
     "text": "Aquatische Anpassung: Dir wachsen Kiemen und Schwimmhäute. Du kannst unter Wasser atmen und erhältst eine Schwimmbewegungsrate in Höhe deiner Bewegungsrate."
    },
    {
     "typ": "punkt",
     "text": "Erscheinungsbild ändern: Du veränderst dein Erscheinungsbild. Du bestimmst, wie du aussiehst: Größe, Gewicht, Gesichtszüge, Stimme, Haarlänge, Haarfarbe und andere besondere Merkmale. Du kannst dich auch als Mitglied einer anderen Spezies ausgeben. Deine Spielwerte bleiben jedoch unverändert. Du kannst nicht als Kreatur einer anderen Größenkategorie erscheinen. Deine grundlegende Gestalt bleibt ebenfalls gleich, beispielsweise kannst du dich mit diesem Zauber nicht von einem Zweibeiner in einen Vierbeiner verwandeln. Für die Wirkungsdauer kannst du eine magische Aktion ausführen, um dein Erscheinungsbild erneut auf diese Art zu ändern."
    },
    {
     "typ": "punkt",
     "text": "Natürliche Waffen: Dir wachsen Klauen (Hieb), Fangzähne (Stich), Hörner (Stich) oder Hufe (Wucht). Verwendest du deinen waffenlosen Angriff, um mit diesen natürlichen Waffen Schaden zu bewirken, so bewirkt dieser Angriff 1W6 Schaden der in Klammern angegebenen Art statt des normalen Schadens deines waffenlosen Angriffs, und du verwendest für die Angriffs ‑ und Schadenswürfe deinen Zauberwirken-Attributsmodifikator statt Stärke."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You alter your physical form. Choose one of the following options. Its effects last for the duration, during which you can take a Magic action to replace the option you chose with a different one."
    },
    {
     "typ": "punkt",
     "text": "Aquatic Adaptation. You sprout gills and grow webs between your fingers. You can breathe underwater and gain a Swim Speed equal to your Speed."
    },
    {
     "typ": "punkt",
     "text": "Change Appearance. You alter your appearance. You decide what you look like, including your height, weight, facial features, sound of your voice, hair length, coloration, and other distinguishing characteristics. You can make yourself appear as a member of another species, though none of your statistics change. You can’t appear as a creature of a different size, and your basic shape stays the same; if you’re bipedal, you can’t use this spell to become quadrupedal, for instance. For the duration, you can take a Magic action to change your appearance in this way again."
    },
    {
     "typ": "punkt",
     "text": "Natural Weapons. You grow claws (Slashing), fangs (Piercing), horns (Piercing), or hooves (Bludgeoning). When you use your Unarmed Strike to deal damage with that new growth, it deals 1d6 damage of the type in parentheses instead of dealing the normal damage for your Unarmed Strike, and you use your spellcasting ability modifier for the attack and damage rolls rather than using Strength."
    }
   ]
  }
 },
 {
  "id": "animal-friendship",
  "name": {
   "de": "Tierfreundschaft",
   "en": "Animal Friendship"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde, Druide, Waldläufer)",
   "en": "Level 1 Enchantment (Bard, Druid, Ranger)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Happen Nahrung)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a morsel of food)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ziele auf ein Tier in Reichweite, das du sehen kannst. Das Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer bezaubert. Wenn du oder einer deiner Verbündeten dem Ziel Schaden zufügt, endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf ein weiteres Tier zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Target a Beast that you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. If you or one of your allies deals damage to the target, the spells ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional Beast for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "animal-messenger",
  "name": {
   "de": "Tierbote",
   "en": "Animal Messenger"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 2. Grades (Barde, Druide, Waldläufer)",
   "en": "Level 2 Enchantment (Bard, Druid, Ranger)"
  },
  "grad": 2,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Happen Nahrung)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a morsel of food)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein winziges Tier deiner Wahl in Reichweite, das du sehen kannst, muss einen Charismarettungswurf bestehen. Misslingt der Wurf, so muss das Ziel versuchen, in deinem Namen eine Botschaft zu überbringen (dies gelingt dem Ziel automatisch, sofern sein Herausforderungsgrad nicht gleich null ist). Bestimme einen Ort, an dem du schon einmal warst, und einen Empfänger, der einer allgemeinen Beschreibung wie „eine Person in Stadtwachenuniform“ oder „ein rothaariger Zwerg mit spitzem Hut“ entspricht. Dann kommunizierst du eine Botschaft mit bis zu 25 Worten. Das Tier reist für die Wirkungsdauer in Richtung Zielort, wobei es in 24 Stunden etwa 40 Kilometer zurücklegt – oder 80 Kilometer, wenn es fliegen kann. Am Zielort übermittelt das Tier der Kreatur, die du beschrieben hast, deine Botschaft und imitiert dabei deine Art der Kommunikation. Erreicht das Tier während der Wirkungsdauer sein Ziel nicht, so geht die Botschaft verloren, und das Tier kehrt an den Ort zurück, an dem du den Zauber gewirkt hast."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird die Wirkungsdauer des Zaubers um 48 Stunden erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Tiny Beast of your choice that you can see within range must succeed on a Charisma saving throw, or it attempts to deliver a message for you (if the target’s Challenge Rating isn’t 0, it automatically succeeds). You specify a location you have visited and a recipient who matches a general description, such as “a person dressed in the uniform of the town guard” or “a red-haired dwarf wearing a pointed hat.” You also communicate a message of up to twenty-five words. The Beast travels for the duration toward the specified location, covering about 25 miles per 24 hours or 50 miles if the Beast can fly. When the Beast arrives, it delivers your message to the creature that you described, mimicking your communication. If the Beast doesn’t reach its destination before the spell ends, the message is lost, and the Beast returns to where you cast the spell."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The spell’s duration increases by 48 hours for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "animal-shapes",
  "name": {
   "de": "Tierform",
   "en": "Animal Shapes"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 8. Grades (Druide)",
   "en": "Level 8 Transmutation (Druid)"
  },
  "grad": 8,
  "schule": "verwandlung",
  "klassen": [
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle eine beliebige Anzahl bereitwilliger Kreaturen in Reichweite aus, die du sehen kannst. Jedes Ziel verwandelt sich in ein Tier deiner Wahl von höchstens großer Größe mit einem Herausforderungs grad von höchstens 4. Du kannst für jedes Ziel eine andere Gestalt bestimmen. In deinen folgenden Zügen kannst du eine magische Aktion ausführen, um die Ziele erneut zu verwandeln. Die Spielwerte eines Ziels werden durch die Werte des jeweiligen Tieres ersetzt. Das Ziel behält jedoch seinen Kreaturentyp, seine Trefferpunkte sowie Trefferpunktewürfel, seine Gesinnung, seine Kommunikationsfähigkeit sowie seine Werte für Intelligenz, Weisheit und Charisma bei. Die Aktionen des Ziels sind durch die Anatomie der Tiergestalt begrenzt. Das Ziel kann keine Zauber wirken. Seine Ausrüstung verschmilzt mit der neuen Gestalt, und das Ziel kann seine Ausrüstung in dieser Gestalt nicht verwenden. Das Ziel erhält eine Anzahl von temporären Trefferpunkten, die der Anzahl von Trefferpunkten der neuen Gestalt entspricht. Nach der Wirkungsdauer dieses Zaubers verbleibende temporäre Trefferpunkte gehen verloren. Die Verwandlungsmagie hält für die Wirkungsdauer an, oder bis das Ziel sie als Bonusaktion beendet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose any number of willing creatures that you can see within range. Each target shape-shifts into a Large or smaller Beast of your choice that has a Challenge Rating of 4 or lower. You can choose a different form for each target. On later turns, you can take a Magic action to transform the targets again. A target’s game statistics are replaced by the chosen Beast’s statistics, but the target retains its creature type; Hit Points; Hit Point Dice; alignment; ability to communicate; and Intelligence, Wisdom, and Charisma scores. The target’s actions are limited by the Beast form’s anatomy, and it can’t cast spells. The target’s equipment melds into the new form, and the target can’t use any of that equipment while in that form. The target gains a number of Temporary Hit Points equal to the Hit Points of the first form into which it shape-shifts. These Temporary Hit Points vanish if any remain when the spell ends. The transformation lasts for the duration or until the target ends it as a Bonus Action."
    }
   ]
  }
 },
 {
  "id": "animate-dead",
  "name": {
   "de": "Tote beleben",
   "en": "Animate Dead"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 3. Grades (Kleriker, Magier)",
   "en": "Level 3 Necromancy (Cleric, Wizard)"
  },
  "grad": 3,
  "schule": "nekromantie",
  "klassen": [
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "3 Meter",
    "komponenten": "V, G, M (ein Tropfen Blut, ein Stück Fleisch und eine Prise Knochenstaub)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "10 feet",
    "komponenten": "V, S, M (a drop of blood, a piece of flesh, and a pinch of bone dust)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle einen Knochenhaufen oder die Leiche eines kleinen oder mittelgroßen Humanoiden in Reichweite aus. Das Ziel wird zu einer untoten Kreatur: zu einem Skelett, wenn du Knochen ausgewählt hast, oder zu einem Zombie, wenn du eine Leiche ausgewählt hast (jeweilige Wertekästen siehe „Monster“). Du kannst in jedem deiner Züge eine Bonusaktion ausführen, um jede Kreatur, die du mit diesem Zauber erschaffen hast und die sich im Abstand von bis zu 18 Metern von dir befindet, mental zu befehligen. Handelt es sich um mehrere Kreaturen, so kannst du beliebig viele von ihnen gleichzeitig befehligen, wobei jeweils der gleiche Befehl erteilt wird. Du entscheidest über die Aktion und die Bewegung der Kreatur in ihrem nächsten Zug. Alternativ kannst du einen allgemeinen Befehl erteilen, beispielsweise eine bestimmte Kammer oder einen Korridor zu bewachen. Wenn du keine Befehle erteilst, führt die Kreatur die Ausweichaktion aus und bewegt sich nur, um Schaden zu vermeiden. Sobald die Kreatur einen Befehl erhalten hat, führt sie ihn aus, bis die Aufgabe abgeschlossen ist. Die Kreatur steht 24 Stunden lang unter deiner Kontrolle. Danach folgt sie keinem deiner Befehle mehr. Um für weitere 24 Stunden die Kontrolle über die Kreatur zu behalten, musst du diesen Zauber erneut auf die Kreatur wirken, ehe die ersten 24 Stunden abgelaufen sind. In diesem Fall verlängerst du die Kontrolle über bis zu vier Kreaturen, die du mit diesem Zauber erschaffen hast, anstatt eine neue Kreatur zu erschaffen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. erschaffst du zwei zusätzliche untote Kreaturen oder verlängerst die Kontrolle über zwei zusätzliche untote Kreaturen. Du benötigst für jede Kreatur eine separate Leiche oder einen separaten Knochenhaufen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a pile of bones or a corpse of a Medium or Small Humanoid within range. The target becomes an Undead creature: a Skeleton if you chose bones or a Zombie if you chose a corpse (see “Monsters” for the stat blocks). On each of your turns, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 60 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a chamber or corridor. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow it until its task is complete. The creature is under your control for 24 hours, after which it stops obeying any command you’ve given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature again before the current 24-hour period ends. This use of the spell reasserts your control over up to four creatures you have animated with this spell rather than animating a new creature."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You animate or reassert control over two additional Undead creatures for each spell slot level above 3. Each of the creatures must come from a different corpse or pile of bones."
    }
   ]
  }
 },
 {
  "id": "animate-objects",
  "name": {
   "de": "Gegenstände beleben",
   "en": "Animate Objects"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 5. Grades (Barde, Magier, Zauberer)",
   "en": "Level 5 Transmutation (Bard, Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Auf deinen Befehl hin werden Gegenstände belebt. Wähle eine Anzahl nichtmagischer Gegenstände in Reichweite aus, die nicht getragen oder gehalten werden, nicht an einer Oberfläche fixiert und kleiner als gigantisch sind. Die maximale Anzahl von Gegenständen entspricht deinem Zauberwirken‑Attributsmodifikator. Dabei zählt ein Ziel von höchstens mittelgroßer Größe als ein Gegenstand, ein großes Ziel zählt als zwei Gegenstände, und ein riesiges Ziel zählt als drei Gegenstände. Jedes Ziel wird belebt, es erhält Beine und wird zu einem Konstrukt, das den Wertekasten eines belebten Gegenstands verwendet. Diese Kreatur steht unter deiner Kontrolle, bis der Zauber endet oder seine Trefferpunkte auf 0 sinken. Jede Kreatur, die du mit diesem Zauber erzeugst, ist mit dir und deinen Verbündeten verbündet. Im Kampf teilt sie deinen Initiativewert und ist unmittelbar nach dir am Zug. Bis der Zauber endet, kannst du als Bonusaktion jede Kreatur, die du mit diesem Zauber erschaffen hast und die sich im Abstand von bis zu 150 Metern von dir befindet, mental befehligen. Handelt es sich um mehrere Kreaturen, so kannst du beliebig viele von ihnen gleichzeitig befehligen, wobei jeweils der gleiche Befehl erteilt wird. Wenn du keine Befehle erteilst, führt die Kreatur die Ausweichaktion aus und bewegt sich nur, um Schaden zu vermeiden. Wenn die Trefferpunkte der Kreatur auf 0 sinken, nimmt sie wieder ihre Gegenstandgestalt an. Überschüssiger Schaden wird auf diese Form übertragen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird der Hiebschaden der Kreatur um 1W4 (höchstens mittelgroß), 1W6 (groß) oder 1W12 (riesig) erhöht."
    },
    {
     "typ": "liste",
     "titel": "Belebter Gegenstand",
     "eintraege": [
      "Konstrukt von höchstens riesiger Größe, gesinnungslos",
      "RK 15",
      "TP 10 (höchstens mittelgroß), 20 (groß), 40 (riesig)",
      "Bewegungsrate 9 m MOD RW MOD RW MOD RW",
      "Stä 16 +3 +3 GeS 10 +0 +0 Kon 10 +0 +0",
      "Int 3 −4 −4 WeI 3 −4 −4 Cha 1 −5 −5",
      "Immunitäten Gift, Psychisch; Bezaubert, Erschöpft, Gelähmt, Verängstigt, Vergiftet",
      "Sinne Blindsicht 9 m; Passive Wahrnehmung 6",
      "Sprachen Versteht die Sprachen, die du sprichst",
      "HG − (EP 0, ÜB entspricht deinem Übungsbonus)",
      "Aktionen",
      "Hieb: Nahkampfangriffswurf: Bonus in Höhe deines Zauberangriff-Modifikators, Reichweite 1,5 m. Treffer: Energieschaden in Höhe von 1W4+3 (höchstens mittelgroß), 2W6+3 + deinem Zauberwirken-Attributsmodifikator (groß) oder 2W12+3 + deinem Zauberwirken-Attributsmodifikator (riesig)."
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Objects animate at your command. Choose a number of nonmagical objects within range that aren’t being worn or carried, aren’t fixed to a surface, and aren’t Gargantuan. The maximum number of objects is equal to your spellcasting ability modifier; for this number, a Medium or smaller target counts as one object, a Large target counts as two, and a Huge target counts as three. Each target animates, sprouts legs, and becomes a Construct that uses the Animated Object stat block; this creature is under your control until the spell ends or until it is reduced to 0 Hit Points. Each creature you make with this spell is an ally to you and your allies. In combat, it shares your Initiative count and takes its turn immediately after yours. Until the spell ends, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 500 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to each one). If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. When the creature drops to 0 Hit Points, it reverts to its object form, and any remaining damage carries over to that form."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The creature’s Slam damage increases by 1d4 (Medium or smaller), 1d6 (Large), or 1d12 (Huge) for each spell slot level above 5."
    },
    {
     "typ": "liste",
     "titel": "Animated Object",
     "eintraege": [
      "Huge or Smaller Construct, Unaligned",
      "AC 15",
      "HP 10 (Medium or smaller), 20 (Large), 40 (Huge)",
      "Speed 30 ft. MOD SAVE MOD SAVE MOD SAVE",
      "Str 16 +3 +3 dex 10 +0 +0 con 10 +0 +0",
      "int 3 −4 −4 WiS 3 −4 −4 chA 1 −5 −5",
      "Immunities Poison, Psychic; Charmed, Exhaustion, Frightened, Paralyzed, Poisoned",
      "Senses Blindsight 30 ft.; Passive Perception 6",
      "Languages Understands the languages you know",
      "CR None (XP 0; PB equals your Proficiency Bonus)",
      "Actions",
      "Slam. Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: Force damage equal to 1d4 + 3 (Medium or smaller), 2d6 + 3 + your spellcasting ability modifier (Large), or 2d12 + 3 + your spellcasting ability modifier (Huge)."
     ]
    }
   ]
  }
 },
 {
  "id": "antilife-shell",
  "name": {
   "de": "Schutzhülle gegen Lebendes",
   "en": "Antilife Shell"
  },
  "gradzeile": {
   "de": "Bannzauber 5. Grades (Druide)",
   "en": "Level 5 Abjuration (Druid)"
  },
  "grad": 5,
  "schule": "bann",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer geht eine Aura in einer Ausströmung von drei Metern von dir aus. Die Aura verhindert, dass Kreaturen außer Konstrukten und Untoten sich hineinbewegen oder hineingreifen. Sie können jedoch Zauber hineinwirken und mit Fernkampfwaffen oder Waffen mit Reichweite durch die Barriere angreifen. Wenn du dich so bewegst, dass eine betroffene Kreatur die Barriere passieren muss, endet der Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An aura extends from you in a 10-foot Emanation for the duration. The aura prevents creatures other than Constructs and Undead from passing or reaching through it. An affected creature can cast spells or make attacks with Ranged or Reach weapons through the barrier. If you move so that an affected creature is forced to pass through the barrier, the spell ends."
    }
   ]
  }
 },
 {
  "id": "antimagic-field",
  "name": {
   "de": "Antimagisches Feld",
   "en": "Antimagic Field"
  },
  "gradzeile": {
   "de": "Bannzauber 8. Grades (Kleriker, Magier)",
   "en": "Level 8 Abjuration (Cleric, Wizard)"
  },
  "grad": 8,
  "schule": "bann",
  "klassen": [
   "kleriker",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (Eisenspäne)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (iron filings)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du wirst von einer antimagischen Aura in einer Ausströmung von drei Metern umgeben. Im Bereich der Aura kann niemand Zauber wirken, magische Aktionen ausführen oder andere magische Effekte erzeugen, und Ziele innerhalb der Aura können nicht von Zaubern, magischen Aktionen und Effekten betroffen werden. Magische Eigenschaften von magischen Gegenständen funktionieren innerhalb der Aura nicht und haben auf nichts darin eine Wirkung. Wirkungsbereiche von Zaubern oder anderer Magie können sich nicht in die Aura erstrecken. Niemand kann sich in die Aura oder aus ihr heraus teleportieren, und auch Ebenenreisen sind in der Aura blockiert. Portale schließen sich, solange sie sich innerhalb der Aura befinden. Bereits wirksame Zauber werden im Bereich unterdrückt, sofern sie nicht von Artefakten oder Gottheiten gewirkt wurden. Solange ein Effekt unterdrückt wird, wirkt er nicht. Die Zeit, in der er unterdrückt ist, wird dennoch von seiner Wirkungsdauer abgezogen. Magie bannen hat innerhalb der Aura keinen Effekt. Auren, die durch mehrere Antimagisches-Feld‑Zauber erzeugt wurden, heben einander nicht auf."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An aura of antimagic surrounds you in 10-foot Emanation. No one can cast spells, take Magic actions, or create other magical effects inside the aura, and those things can’t target or otherwise affect anything inside it. Magical properties of magic items don’t work inside the aura or on anything inside it. Areas of effect created by spells or other magic can’t extend into the aura, and no one can teleport into or out of it or use planar travel there. Portals close temporarily while in the aura. Ongoing spells, except those cast by an Artifact or a deity, are suppressed in the area. While an effect is suppressed, it doesn’t function, but the time it spends suppressed counts against its duration. Dispel Magic has no effect on the aura, and the auras created by different Antimagic Field spells don’t nullify each other."
    }
   ]
  }
 },
 {
  "id": "antipathy-sympathy",
  "name": {
   "de": "Antipathie/Sympathie",
   "en": "Antipathy/Sympathy"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 8. Grades (Barde, Druide, Magier)",
   "en": "Level 8 Enchantment (Bard, Druid, Wizard)"
  },
  "grad": 8,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (eine Mischung aus Essig und Honig)",
    "dauer": "10 Tage"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a mix of vinegar and honey)",
    "dauer": "10 days"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle beim Wirken des Zaubers aus, ob er Antipathie oder Sympathie erzeugen soll, und ziele auf eine Kreatur oder einen Gegenstand von höchstens riesiger Größe. Bestimme dann einen Kreaturentyp (beispielsweise rote Drachen, Goblins oder Vampire). Kreaturen der ausgewählten Art führen einen Weisheitsrettungswurf aus, wenn sie sich dem Ziel auf höchstens 36 Meter nähern. Deine Entscheidung (Antipathie oder Sympathie) bestimmt, was mit einer Kreatur geschieht, wenn der Rettungswurf misslingt:"
    },
    {
     "typ": "stichpunkt",
     "text": "Antipathie: Die Kreatur ist verängstigt. Die verängstigte Kreatur muss in ihren Zügen ihre Bewegung nutzen, um sich so weit wie möglich vom Ziel zu entfernen. Dabei nimmt sie die sicherste Route."
    },
    {
     "typ": "stichpunkt",
     "text": "Sympathie: Die Kreatur ist bezaubert. Die bezauberte Kreatur muss in ihren Zügen ihre Bewegung nutzen, um sich dem Ziel so weit wie möglich zu nähern. Dabei nimmt sie die sicherste Route. Befindet sich die Kreatur im Abstand von bis zu 1,5 Metern vom Ziel, so kann sie sich nicht freiwillig entfernen. Wenn das Ziel der bezauberten Kreatur Schaden zufügt, kann diese einen Weisheitsrettungswurf ausführen, um den Effekt wie unten beschrieben zu beenden."
    },
    {
     "typ": "punkt",
     "text": "Den Effekt beenden: Wenn die verängstigte oder bezauberte Kreatur ihren Zug weiter als 36 Meter vom Ziel entfernt beendet, führt sie einen Weisheitsrettungswurf aus. Bei einem erfolgreichen Rettungswurf endet der Effekt des Ziels auf die Kreatur. Nach einem erfolgreichen Rettungswurf ist eine Kreatur eine Minute lang gegen den Effekt immun. Danach kann er erneut auf sie gewirkt werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As you cast the spell, choose whether it creates antipathy or sympathy, and target one creature or object that is Huge or smaller. Then specify a kind of creature, such as red dragons, goblins, or vampires. A creature of the chosen kind makes a Wisdom saving throw when it comes within 120 feet of the target. Your choice of antipathy or sympathy determines what happens to a creature when it fails that save:"
    },
    {
     "typ": "stichpunkt",
     "text": "Antipathy. The creature has the Frightened condition. The Frightened creature must use its movement on its turns to get as far away as possible from the target, moving by the safest route."
    },
    {
     "typ": "stichpunkt",
     "text": "Sympathy. The creature has the Charmed condition. The Charmed creature must use its movement on its turns to get as close as possible to the target, moving by the safest route. If the creature is within 5 feet of the target, the creature can’t willingly move away. If the target damages the Charmed creature, that creature can make a Wisdom saving throw to end the effect, as described below."
    },
    {
     "typ": "punkt",
     "text": "Ending the Effect. If the Frightened or Charmed creature ends its turn more than 120 feet away from the target, the creature makes a Wisdom saving throw. On a successful save, the creature is no longer affected by the target. A creature that successfully saves against this effect is immune to it for 1 minute, after which it can be affected again."
    }
   ]
  }
 },
 {
  "id": "arcane-eye",
  "name": {
   "de": "Arkanes Auge",
   "en": "Arcane Eye"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 4. Grades (Magier)",
   "en": "Level 4 Divination (Wizard)"
  },
  "grad": 4,
  "schule": "erkenntnis",
  "klassen": [
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Stück Fledermausfell)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a bit of bat fur)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst ein unsichtbares und unverwundbares Auge in Reichweite, das für die Wirkungsdauer in der Luft schwebt. Es kann in jede Richtung blicken und übermittelt dir mental seine visuellen Informationen. Außerdem verfügt es über Dunkelsicht mit einer Reichweite von neun Metern. Als Bonusaktion kannst du das Auge bis zu neun Meter weit in eine beliebige Richtung bewegen. Außerdem kann es nicht durch massive Barrieren gelangen, jedoch Öffnungen mit mindestens 2,5 Zentimetern Durchmesser passieren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create an Invisible, invulnerable eye within range that hovers for the duration. You mentally receive visual information from the eye, which can see in every direction. It also has Darkvision with a range of 30 feet. As a Bonus Action, you can move the eye up to 30 feet in any direction. A solid barrier blocks the eye’s movement, but the eye can pass through an opening as small as 1 inch in diameter."
    }
   ]
  }
 },
 {
  "id": "arcane-hand",
  "name": {
   "de": "Arkane Hand",
   "en": "Arcane Hand"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 5. Grades (Magier, Zauberer)",
   "en": "Level 5 Evocation (Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (eine Eierschale und ein Handschuh)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (an eggshell and a glove)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst eine große Hand aus schimmernder magischer Energie in einem freien Bereich in Reichweite, den du sehen kannst. Die Hand bleibt für die Wirkungsdauer bestehen. Sie bewegt sich auf deinen Befehl und imitiert die Bewegungen deiner eigenen Hand. Die Hand ist ein Gegenstand und besitzt eine RK von 20. Ihre Trefferpunkte entsprechen deinem Trefferpunktemaximum. Wenn ihre Trefferpunkte auf 0 sinken, endet der Zauber. Die Hand besetzt ihren Bereich nicht. Nach dem Wirken des Zaubers sowie als Bonusaktion in deinen folgenden Zügen kannst du die Hand bis zu 18 Meter weit bewegen und einen der folgenden Effekte bewirken:"
    },
    {
     "typ": "stichpunkt",
     "text": "Blockierende Hand: Die Hand gewährt dir Teildeckung gegen Angriffe und andere Effekte, die von ihrem Bereich ausgehen oder ihn durchqueren. Außerdem zählt ihr Bereich für deine Gegner als schwieriges Gelände."
    },
    {
     "typ": "stichpunkt",
     "text": "Geballte Faust: Die Hand schlägt ein Ziel im Abstand von bis zu 1,5 Metern von ihr. Führe einen Nahkampf‑Zauberangriff aus. Bei einem Treffer erleidet das Ziel 5W8 Energieschaden."
    },
    {
     "typ": "stichpunkt",
     "text": "Greifende Hand: Die Hand versucht, eine Kreatur von höchstens riesiger Größe im Abstand von bis zu 1,5 Metern von ihr zu packen. Das Ziel muss einen Geschicklichkeitsrettungswurf bestehen, oder es wird gepackt (der Flucht‑SG entspricht deinem Zauberrettungswurf‑SG). Solange die Hand das Ziel gepackt hat, kannst du eine Bonusaktion ausführen, damit sie es zerquetscht. Dabei fügt sie ihm Wuchtschaden in Höhe von 4W6 plus deinem Zauberwirken‑Attributsmodifikator zu."
    },
    {
     "typ": "stichpunkt",
     "text": "Kraftvolle Hand: Die Hand versucht, eine Kreatur von höchstens riesiger Größe im Abstand von bis zu 1,5 Metern von ihr zu stoßen. Das Ziel muss einen Stärkerettungswurf bestehen, oder die Hand schiebt es bis zu 1,5 Meter plus 1,5‑mal deinen Zauberwirken-Attributsmodifikator (in Metern) weit in eine Richtung deiner Wahl. Die Hand bewegt sich mit dem Ziel und bleibt im Abstand von bis zu 1,5 Metern von ihm."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird der Schaden der geballten Faust um 2W8 und der Schaden der greifenden Hand um 2W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a Large hand of shimmering magical energy in an unoccupied space that you can see within range. The hand lasts for the duration, and it moves at your command, mimicking the movements of your own hand. The hand is an object that has AC 20 and Hit Points equal to your Hit Point maximum. If it drops to 0 Hit Points, the spell ends. The hand doesn’t occupy its space. When you cast the spell and as a Bonus Action on your later turns, you can move the hand up to 60 feet and then cause one of the following effects:"
    },
    {
     "typ": "stichpunkt",
     "text": "Clenched Fist. The hand strikes a target within 5 feet of it. Make a melee spell attack. On a hit, the target takes 5d8 Force damage."
    },
    {
     "typ": "stichpunkt",
     "text": "Forceful Hand. The hand attempts to push a Huge or smaller creature within 5 feet of it. The target must succeed on a Strength saving throw, or the hand pushes the target up to 5 feet plus a number of feet equal to five times your spellcasting ability modifier. The hand moves with the target, remaining within 5 feet of it."
    },
    {
     "typ": "stichpunkt",
     "text": "Grasping Hand. The hand attempts to grapple a Huge or smaller creature within 5 feet of it. The target must succeed on a Dexterity saving throw, or the target has the Grappled condition, with an escape DC equal to your spell save DC. While the hand grapples the target, you can take a Bonus Action to cause the hand to crush it, dealing Bludgeoning damage to the target equal to 4d6 plus your spellcasting ability modifier."
    },
    {
     "typ": "stichpunkt",
     "text": "Interposing Hand. The hand grants you Half Cover against attacks and other effects that originate from its space or that pass through it. In addition, its space counts as Difficult Terrain for your enemies."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage of the Clenched Fist increases by 2d8 and the damage of the Grasping Hand increases by 2d6 for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "arcane-lock",
  "name": {
   "de": "Arkanes Schloss",
   "en": "Arcane Lock"
  },
  "gradzeile": {
   "de": "Bannzauber 2. Grades (Magier)",
   "en": "Level 2 Abjuration (Wizard)"
  },
  "grad": 2,
  "schule": "bann",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Goldstaub im Wert von mindestens 25 GM, den der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (gold dust worth 25+ GP, which the spell consumes)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine geschlossene Tür, ein Fenster, ein Tor, einen Behälter oder eine Luke und verschließt diesen Gegenstand für die Wirkungsdauer auf magische Art. Dieses Schloss kann mit nichtmagischen Methoden nicht entfernt werden. Du und alle Kreaturen, die du beim Wirken des Zaubers bestimmst, könnt den Gegenstand trotz des Schlosses normal öffnen und schließen. Du kannst auch ein Kennwort festlegen, das diesen Gegenstand im Abstand von bis zu 1,5 Metern eine Minute lang öffnet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a closed door, window, gate, container, or hatch and magically lock it for the duration. This lock can’t be unlocked by any nonmagical means. You and any creatures you designate when you cast the spell can open and close the object despite the lock. You can also set a password that, when spoken within 5 feet of the object, unlocks it for 1 minute."
    }
   ]
  }
 },
 {
  "id": "arcane-sword",
  "name": {
   "de": "Arkanes Schwert",
   "en": "Arcane Sword"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 7. Grades (Barde, Magier)",
   "en": "Level 7 Evocation (Bard, Wizard)"
  },
  "grad": 7,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (ein Miniaturschwert im Wert von mindestens 250 GM)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (a miniature sword worth 250+ GP)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst ein geisterhaftes Schwert, das in Reichweite schwebt. Die Kugel bleibt für die Wirkungsdauer bestehen. Wenn das Schwert erscheint, kannst du einen Nahkampf‑Zauberangriff gegen ein Ziel im Abstand von bis zu 1,5 Metern vom Schwert ausführen. Bei einem Treffer erleidet das Ziel Energieschaden in Höhe von 4W12 plus deinem Zauberwirken‑Attributsmodifikator. In deinen folgenden Zügen kannst du das Schwert mit einer Bonusaktion bis zu neun Meter weit an einen Ort bewegen, den du sehen kannst, und den Angriff gegen dasselbe oder ein anderes Ziel wiederholen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a spectral sword that hovers within range. It lasts for the duration. When the sword appears, you make a melee spell attack against a target within 5 feet of the sword. On a hit, the target takes Force damage equal to 4d12 plus your spellcasting ability modifier. On your later turns, you can take a Bonus Action to move the sword up to 30 feet to a spot you can see and repeat the attack against the same target or a different one."
    }
   ]
  }
 },
 {
  "id": "arcanist-s-magic-aura",
  "name": {
   "de": "Magische Aura des Arkanisten",
   "en": "Arcanist’s Magic Aura"
  },
  "gradzeile": {
   "de": "Illusionszauber 2. Grades (Magier)",
   "en": "Level 2 Illusion (Wizard)"
  },
  "grad": 2,
  "schule": "illusion",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein kleines Quadrat aus Seide)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a small square of silk)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur oder einen Gegenstand, der nicht getragen oder gehalten wird, und platzierst eine Illusion auf dem Ziel. Eine Kreatur erhält den Effekt Maskierung, ein Gegenstand den Effekt Falsche Aura (beide Effekte siehe unten). Der Effekt bleibt für die Wirkungsdauer bestehen. Wenn du diesen Zauber 30 Tage lang täglich auf dasselbe Ziel wirkst, bleibt die Illusion bestehen, bis sie gebannt wird."
    },
    {
     "typ": "punkt",
     "text": "Maskierung (Kreatur): Wähle einen Kreaturentyp aus, der nicht dem tatsächlichen Typ des Ziels entspricht. Andere Zauber und magische Effekte behandeln das Ziel, als wäre es eine Kreatur des ausgewählten Typs."
    },
    {
     "typ": "punkt",
     "text": "Falsche Aura (Gegenstand): Du veränderst die Art, wie das Ziel für Zauber und magische Effekte wie Magie entdecken erscheint, die magische Auren entdecken. Du kannst einen nichtmagischen Gegenstand magisch, einen magischen Gegenstand nichtmagisch erscheinen lassen oder die magische Aura des Gegenstands so manipulieren, dass er einer Schule der Magie deiner Wahl anzugehören scheint."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "With a touch, you place an illusion on a willing creature or an object that isn’t being worn or carried. A creature gains the Mask effect below, and an object gains the False Aura effect below. The effect lasts for the duration. If you cast the spell on the same target every day for 30 days, the illusion lasts until dispelled."
    },
    {
     "typ": "punkt",
     "text": "Mask (Creature). Choose a creature type other than the target’s actual type. Spells and other magical effects treat the target as if it were a creature of the chosen type."
    },
    {
     "typ": "punkt",
     "text": "False Aura (Object). You change the way the target appears to spells and magical effects that detect magical auras, such as Detect Magic. You can make a nonmagical object appear magical, make a magic item appear nonmagical, or change the object’s aura so that it appears to belong to a school of magic you choose."
    }
   ]
  }
 },
 {
  "id": "astral-projection",
  "name": {
   "de": "Astrale Projektion",
   "en": "Astral Projection"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 9. Grades (Hexenmeister, Kleriker, Magier)",
   "en": "Level 9 Necromancy (Cleric, Warlock, Wizard)"
  },
  "grad": 9,
  "schule": "nekromantie",
  "klassen": [
   "hexenmeister",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "3 Meter",
    "komponenten": "V, G, M (für jedes Ziel des Zaubers einen Hyazinth im Wert von mindestens 1.000 GM und einen Silberbarren im Wert von mindestens 100 GM – der Zauber verbraucht jeweils beides)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "10 feet",
    "komponenten": "V, S, M (for each of the spell’s targets, one jacinth worth 1,000+ GP and one silver bar worth 100+ GP, all of which the spell consumes)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Durch diesen Zauber projizierst du deinen Astralkörper und die Astralkörper von bis zu acht bereitwilligen Kreaturen in Reichweite auf die Astralebene (wenn du dich bereits auf dieser Ebene befindest, endet der Zauber sofort). Der physische Körper jedes Ziels bleibt in scheintotem Zustand zurück. Er ist bewusstlos, benötigt weder Nahrung noch Luft und altert nicht. Die Astralgestalt jedes Ziels gleicht dem physischen Körper in fast jeder Hinsicht. Sie hat dessen Spielwerte und Habseligkeiten. Der Hauptunterschied ist eine Silberschnur, die zwischen den Schulterblättern der Astralgestalt entspringt. Die Schnur verblasst nach 30 Zentimetern und wird unsichtbar. Wird die Schnur durchtrennt – was nur geschieht, wenn ein Effekt dies explizit erwähnt –, so sterben sowohl physischer Körper als auch Astralgestalt des Ziels. Die Astralgestalt eines Ziels kann durch die Astralebene reisen. Sobald eine Astralgestalt diese Ebene verlässt, werden physischer Körper und Habseligkeiten des Ziels an der Silberschnur entlangtransportiert, sodass das Ziel auf der neuen Ebene wieder in seinen Körper gelangt. Schaden und sonstige Effekte, die auf die Astralgestalt des Ziels wirken, haben auf den physischen Körper keine Wirkung, sowie umgekehrt. Wenn die Trefferpunkte der Astralgestalt oder des physischen Körpers eines Ziels auf 0 sinken, endet der Zauber bei diesem Ziel. Der Zauber endet bei allen Zielen, wenn du ihn als magische Aktion verwirfst. Wenn der Zauber bei einem Ziel endet, das nicht tot ist, kehrt das Ziel in seinen physischen Körper zurück, und dessen scheintoter Zustand endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell ends instantly if you are already on that plane). Each target’s body is left behind in a state of suspended animation; it has the Unconscious condition, doesn’t need food or air, and doesn’t age. A target’s astral form resembles its body in almost every way, replicating its game statistics and possessions. The principal difference is the addition of a silvery cord that trails from between the shoulder blades of the astral form. The cord fades from view after 1 foot. If the cord is cut—which happens only when an effect states that it does so—the target’s body and astral form both die. A target’s astral form can travel through the Astral Plane. The moment an astral form leaves that plane, the target’s body and possessions travel along the silver cord, causing the target to re-enter its body on the new plane. Any damage or other effects that apply to an astral form have no effect on the target’s body and vice versa. If a target’s body or astral form drops to 0 Hit Points, the spell ends for that target. The spell ends for all the targets if you take a Magic action to dismiss it. When the spell ends for a target who isn’t dead, the target reappears in its body and exits the state of suspended animation."
    }
   ]
  }
 },
 {
  "id": "augury",
  "name": {
   "de": "Vorahnung",
   "en": "Augury"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 2. Grades (Druide, Kleriker, Magier)",
   "en": "Level 2 Divination (Cleric, Druid, Wizard)"
  },
  "grad": 2,
  "schule": "erkenntnis",
  "klassen": [
   "druide",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (besonders markierte Stöcke, Knochen, Karten oder andere Weissagungsgegenstände im Wert von mindestens 25 GM)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S, M (specially marked sticks, bones, cards, or other divinatory tokens worth 25+ GP)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst ein Omen von einem außerweltlichen Wesen zum Ergebnis eines Vorhabens, das innerhalb der nächsten 30 Minuten geplant ist. Der SL wählt das Omen aus der Tabelle „Omen“ aus."
    },
    {
     "typ": "tabelle",
     "titel": "Omen",
     "kopf": [
      "Omen",
      "Ergebnis des Vorhabens"
     ],
     "reihen": [
      [
       "Wohl",
       "Gut"
      ],
      [
       "Wehe",
       "Schlecht"
      ],
      [
       "Wohl und Wehe",
       "Gut und schlecht"
      ],
      [
       "Gleichgültig",
       "Weder gut noch schlecht"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "Der Zauber berücksichtigt keinerlei Umstände wie andere Zauber, die das Ergebnis ändern könnten. Wenn du den Zauber vor einer langen Rast häufiger als einmal wirkst, erhöht dies das Risiko, keine Antwort zu erhalten, mit jedem Wirken nach dem ersten um jeweils 25 Prozent."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You receive an omen from an otherworldly entity about the results of a course of action that you plan to take within the next 30 minutes. The GM chooses the omen from the Omens table."
    },
    {
     "typ": "tabelle",
     "titel": "Omens",
     "kopf": [
      "Omen",
      "For Results That Will Be …"
     ],
     "reihen": [
      [
       "Weal",
       "Good"
      ],
      [
       "Woe",
       "Bad"
      ],
      [
       "Weal and woe",
       "Good and bad"
      ],
      [
       "Indifference",
       "Neither good nor bad"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "The spell doesn’t account for circumstances, such as other spells, that might change the results. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer."
    }
   ]
  }
 },
 {
  "id": "aura-of-life",
  "name": {
   "de": "Aura des Lebens",
   "en": "Aura of Life"
  },
  "gradzeile": {
   "de": "Bannzauber 4. Grades (Kleriker, Paladin)",
   "en": "Level 4 Abjuration (Cleric, Paladin)"
  },
  "grad": 4,
  "schule": "bann",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer geht eine Aura in einer Ausströmung von neun Metern von dir aus. In der Aura seid du und deine Verbündeten gegen nekrotischen Schaden resistent, und eure Trefferpunktemaxima können nicht verringert werden. Wenn ein Verbündeter mit 0 Trefferpunkten seinen Zug in der Aura beginnt, erhält er 1 Trefferpunkt zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have Resistance to Necrotic damage, and your Hit Point maximums can’t be reduced. If an ally with 0 Hit Points starts its turn in the aura, that ally regains 1 Hit Point."
    }
   ]
  }
 },
 {
  "id": "awaken",
  "name": {
   "de": "Erwecken",
   "en": "Awaken"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 5. Grades (Barde, Druide)",
   "en": "Level 5 Transmutation (Bard, Druid)"
  },
  "grad": 5,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "8 Stunden",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Achat im Wert von mindestens 1.000 GM, den der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "8 hours",
    "reichweite": "Touch",
    "komponenten": "V, S, M (an agate worth 1,000+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verbringst den Zeitaufwand damit, magische Pfade in einen kostbaren Edelstein zu zeichnen, und berührst anschließend ein Ziel. Beim Ziel muss es sich um ein Tier, um eine Pflanzenkreatur mit einem Intelligenzwert von höchstens 3 oder um eine natürliche Pflanze handeln, die keine Kreatur ist. Das Ziel erhält einen Intelligenzwert von 10 sowie die Fähigkeit, eine dir bekannte Sprache zu sprechen. Wenn es sich um eine natürliche Pflanze handelt, wird diese zu einer Pflanzenkreatur, die ihre Wurzeln, Triebe, Ranken und Ähnliches bewegen kann und Sinne ähnlich denen eines Menschen hat. Dein SL wählt geeignete Spielwerte aus, beispielsweise die des erwachten Buschs oder des erwachten Baums im Monsterhandbuch. Die erweckte Kreatur ist bezaubert. Die Bezauberung endet nach 30 Tagen, oder wenn du oder deine Verbündeten der Kreatur Schaden zufügen. Wenn die Bezauberung endet, wählt die Kreatur ihre Haltung dir gegenüber aus."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You spend the casting time tracing magical pathways within a precious gemstone, and then touch the target. The target must be either a Beast or Plant creature with an Intelligence of 3 or less or a natural plant that isn’t a creature. The target gains an Intelligence of 10 and the ability to speak one language you know. If the target is a natural plant, it becomes a Plant creature and gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human’s. The GM chooses statistics appropriate for the awakened Plant, such as the statistics for the Awakened Shrub or Awakened Tree in “Monsters.” The awakened target has the Charmed condition for 30 days or until you or your allies deal damage to it. When that condition ends, the awakened creature chooses its attitude toward you."
    }
   ]
  }
 },
 {
  "id": "bane",
  "name": {
   "de": "Verderben",
   "en": "Bane"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde, Hexenmeister, Kleriker)",
   "en": "Level 1 Enchantment (Bard, Cleric, Warlock)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister",
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Tropfen Blut)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a drop of blood)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Bis zu drei Kreaturen deiner Wahl in Reichweite, die du sehen kannst, führen jeweils einen Charismarettungswurf aus. Wenn ein Ziel, dessen Rettungswurf misslingt, während der Wirkungsdauer einen Angriffs ‑ oder Rettungswurf ausführt, muss es 1W4 von seinem Angriffs ‑ oder Rettungswurf abziehen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Up to three creatures of your choice that you can see within range must each make a Charisma saving throw. Whenever a target that fails this save makes an attack roll or a saving throw before the spell ends, the target must subtract 1d4 from the attack roll or save."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "banishment",
  "name": {
   "de": "Verbannung",
   "en": "Banishment"
  },
  "gradzeile": {
   "de": "Bannzauber 4. Grades (Hexenmeister, Kleriker, Magier, Paladin, Zauberer)",
   "en": "Level 4 Abjuration (Cleric, Paladin, Sorcerer, Warlock, Wizard)"
  },
  "grad": 4,
  "schule": "bann",
  "klassen": [
   "hexenmeister",
   "kleriker",
   "magier",
   "paladin",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Pentakel)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a pentacle)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur in Reichweite, die du sehen kannst, muss einen Charismarettungswurf bestehen, oder sie wird für die Wirkungsdauer auf eine harmlose Halbebene transportiert. Solange das Ziel sich dort befindet, ist es kampfunfähig. Wenn der Zauber endet, erscheint das Ziel in dem Bereich, aus dem es wegteleportiert wurde, oder im nächstgelegenen freien Bereich wieder, falls der ursprüngliche inzwischen besetzt ist. Falls das Ziel eine Aberration, ein celestisches Wesen, ein Elementar, ein Feenwesen oder ein Unhold ist, kehrt es nicht zurück, sofern der Zauber eine Minute lang wirkt. Stattdessen gelangt es an einen zufälligen Ort auf einer Ebene (nach Wahl des SL), die mit seinem Kreaturentyp assoziiert ist."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature that you can see within range must succeed on a Charisma saving throw or be transported to a harmless demiplane for the duration. While there, the target has the Incapacitated condition. When the spell ends, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. If the target is an Aberration, a Celestial, an Elemental, a Fey, or a Fiend, the target doesn’t return if the spell lasts for 1 minute. The target is instead transported to a random location on a plane (GM’s choice) associated with its creature type."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "barkskin",
  "name": {
   "de": "Rindenhaut",
   "en": "Barkskin"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Druide, Waldläufer)",
   "en": "Level 2 Transmutation (Druid, Ranger)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Handvoll Rinde)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a handful of bark)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur. Für die Wirkungsdauer nimmt die Haut des Ziels ein rindenartiges Erscheinungsbild an, und das Ziel erhält eine Rüstungsklasse von 17, sofern seine RK niedriger ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature. Until the spell ends, the target’s skin assumes a bark-like appearance, and the target has an Armor Class of 17 if its AC is lower than that."
    }
   ]
  }
 },
 {
  "id": "beacon-of-hope",
  "name": {
   "de": "Leuchtfeuer der Hoffnung",
   "en": "Beacon of Hope"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Kleriker)",
   "en": "Level 3 Abjuration (Cleric)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle eine beliebige Anzahl von Kreaturen in Reichweite aus. Für die Wirkungsdauer ist jedes Ziel bei Weisheits‑ und Todesrettungswürfen im Vorteil und erhält bei jeder Heilung die höchstmögliche Anzahl von Trefferpunkten zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose any number of creatures within range. For the duration, each target has Advantage on Wisdom saving throws and Death Saving Throws and regains the maximum number of Hit Points possible from any healing."
    }
   ]
  }
 },
 {
  "id": "befuddlement",
  "name": {
   "de": "Wirrnis",
   "en": "Befuddlement"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 8. Grades (Barde, Druide, Hexenmeister, Magier)",
   "en": "Level 8 Enchantment (Bard, Druid, Warlock, Wizard)"
  },
  "grad": 8,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (ein Schlüsselring ohne Schlüssel)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (a key ring with no keys)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du attackierst den Verstand einer Kreatur in Reichweite, die du sehen kannst. Das Ziel führt einen Intelligenzrettungswurf aus. Misslingt der Wurf, so erleidet das Ziel 10W12 psychischen Schaden und kann weder Zauber wirken noch die magische Aktion ausführen. Nach jeweils 30 Tagen wiederholt das Ziel den Rettungswurf. Bei einem Erfolg endet der Effekt. Der Effekt kann auch durch die Zauber Heilung, Vollständige Genesung oder Wunsch beendet werden. Bei einem erfolgreichen Rettungswurf erleidet das Ziel nur halb so viel Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You blast the mind of a creature that you can see within range. The target makes an Intelligence saving throw. On a failed save, the target takes 10d12 Psychic damage and can’t cast spells or take the Magic action. At the end of every 30 days, the target repeats the save, ending the effect on a success. The effect can also be ended by the Greater Restoration, Heal, or Wish spell. On a successful save, the target takes half as much damage only."
    }
   ]
  }
 },
 {
  "id": "bestow-curse",
  "name": {
   "de": "Fluch",
   "en": "Bestow Curse"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 3. Grades (Barde, Kleriker, Magier)",
   "en": "Level 3 Necromancy (Bard, Cleric, Wizard)"
  },
  "grad": 3,
  "schule": "nekromantie",
  "klassen": [
   "barde",
   "kleriker",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur. Diese muss einen Weisheitsrettungswurf bestehen, oder sie ist für die Wirkungsdauer verflucht. Bis der Fluch endet, erleidet das Ziel einen der folgenden Effekte deiner Wahl: • Wähle ein Attribut aus. Das Ziel ist bei allen Attributs ‑ und Rettungswürfen mit diesem Attribut im Nachteil. • Das Ziel ist bei Angriffswürfen gegen dich im Nachteil. • Im Kampf muss das Ziel zu Beginn jedes seiner Züge einen Weisheitsrettungswurf bestehen, oder es ist gezwungen, die Ausweichaktion auszuführen. • Wenn du dem Ziel mit einem Angriffswurf oder einem Zauber Schaden zufügst, erleidet es zusätzlich 1W8 nekrotischen Schaden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Bei einem Zauberplatz des 4. Grades kannst du deine Konzentration auf diesen Zauber bis zu zehn Minuten lang aufrechterhalten. Bei einem Zauberplatz ab dem 5. Grad erfordert der Zauber keine Konzentration, und die Wirkungsdauer beträgt acht Stunden (Zauberplatzgrad 5–6) oder 24 Stunden (Zauberplatzgrad 7–8). Bei einem Zauberplatz des 9. Grades hält der Zauber an, bis er gebannt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature, which must succeed on a Wisdom saving throw or become cursed for the duration. Until the curse ends, the target suffers one of the following effects of your choice: • Choose one ability. The target has Disadvantage on ability checks and saving throws made with that ability. • The target has Disadvantage on attack rolls against you. • In combat, the target must succeed on a Wisdom saving throw at the start of each of its turns or be forced to take the Dodge action on that turn. • If you deal damage to the target with an attack roll or a spell, the target takes an extra 1d8 Necrotic damage."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. If you cast this spell using a level 4 spell slot, you can maintain Concentration on it for up to 10 minutes. If you use a level 5+ spell slot, the spell doesn’t require Concentration, and the duration becomes 8 hours (level 5–6 slot) or 24 hours (level 7–8 slot). If you use a level 9 spell slot, the spell lasts until dispelled."
    }
   ]
  }
 },
 {
  "id": "black-tentacles",
  "name": {
   "de": "Schwarze Tentakel",
   "en": "Black Tentacles"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Magier)",
   "en": "Level 4 Conjuration (Wizard)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (ein Tentakel)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (a tentacle)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein quadratischer Bodenbereich mit sechs Metern Kantenlänge in Reichweite, den du sehen kannst, wird von tiefschwarzen zuckenden Tentakeln erfüllt. Die Tentakel verwandeln diesen Bereich für die Wirkungsdauer in schwieriges Gelände. Jede Kreatur in diesem Bereich führt einen Stärkerettungswurf aus. Misslingt der Wurf, so erleidet sie 3W6 Wuchtschaden und ist festgesetzt, bis der Zauber endet. Auch Kreaturen, die sich in den Bereich begeben oder ihren Zug darin beenden, führen den Rettungswurf aus. Jede Kreatur führt den Rettungswurf nur einmal pro Zug aus. Eine festgesetzte Kreatur kann als Aktion einen Stärkewurf (Athletik) gegen deinen Zauberrettungswurf‑SG ausführen. Bei einem Erfolg endet der Zustand bei ihr."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in that area into Difficult Terrain. Each creature in that area makes a Strength saving throw. On a failed save, it takes 3d6 Bludgeoning damage, and it has the Restrained condition until the spell ends. A creature also makes that save if it enters the area or ends it turn there. A creature makes that save only once per turn. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC, ending the condition on itself on a success."
    }
   ]
  }
 },
 {
  "id": "blade-barrier",
  "name": {
   "de": "Klingenbarriere",
   "en": "Blade Barrier"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 6. Grades (Kleriker)",
   "en": "Level 6 Evocation (Cleric)"
  },
  "grad": 6,
  "schule": "hervorrufung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst eine Wand wirbelnder Klingen aus magischer Energie. Sie erscheint in Reichweite und bleibt für die Wirkungsdauer bestehen. Du erschaffst entweder eine gerade Wand, die bis zu 30 Meter lang ist, oder eine ringförmige Wand mit einem Radius von bis zu neun Metern. Sie ist in beiden Fällen sechs Meter hoch und 1,5 Meter dick. Die Wand bietet Dreivierteldeckung, und ihr Bereich stellt schwieriges Gelände dar. Jede Kreatur im Bereich der Wand führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 6W10 Energieschaden, anderenfalls die Hälfte. Auch Kreaturen, die sich in den Bereich der Wand begeben oder ihren Zug darin beenden, führen den Rettungswurf aus. Jede Kreatur führt den Rettungswurf nur einmal pro Zug aus."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a wall of whirling blades made of magical energy. The wall appears within range and lasts for the duration. You make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides Three-Quarters Cover, and its space is Difficult Terrain. Any creature in the wall’s space makes a Dexterity saving throw, taking 6d10 Force damage on a failed save or half as much damage on a successful one. A creature also makes that save if it enters the wall’s space or ends it turn there. A creature makes that save only once per turn."
    }
   ]
  }
 },
 {
  "id": "bless",
  "name": {
   "de": "Segnen",
   "en": "Bless"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Kleriker, Paladin)",
   "en": "Level 1 Enchantment (Cleric, Paladin)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein heiliges Symbol im Wert von mindestens 5 GM)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a Holy Symbol worth 5+ GP)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du segnest bis zu drei Kreaturen in Reichweite. Wann immer ein Ziel während der Wirkungsdauer einen Angriffs ‑ oder Rettungswurf ausführt, fügt es dem Ergebnis 1W4 hinzu."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You bless up to three creatures within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target adds 1d4 to the attack roll or save."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "blight",
  "name": {
   "de": "Dürre",
   "en": "Blight"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 4. Grades (Druide, Hexenmeister, Magier, Zauberer)",
   "en": "Level 4 Necromancy (Druid, Sorcerer, Warlock, Wizard)"
  },
  "grad": 4,
  "schule": "nekromantie",
  "klassen": [
   "druide",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur in Reichweite, die du sehen kannst, führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 8W8 nekrotischen Schaden, anderenfalls die Hälfte. Bei Pflanzenkreaturen misslingt der Rettungswurf automatisch. Ziele alternativ auf eine nichtmagische Pflanze, die keine Kreatur ist (beispielsweise Baum oder Strauch). Sie führt keinen Rettungswurf aus, sondern verdorrt und stirbt."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature that you can see within range makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save or half as much damage on a successful one. A Plant creature automatically fails the save. Alternatively, target a nonmagical plant that isn’t a creature, such as a tree or shrub. It doesn’t make a save; it simply withers and dies."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "blindness-deafness",
  "name": {
   "de": "Blindheit/Taubheit",
   "en": "Blindness/Deafness"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Barde, Kleriker, Magier, Zauberer)",
   "en": "Level 2 Transmutation (Bard, Cleric, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur in Reichweite, die du sehen kannst, muss einen Konstitutionsrettungswurf bestehen, oder sie ist für die Wirkungsdauer blind oder taub (nach deiner Wahl). Das Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature that you can see within range must succeed on a Constitution saving throw, or it has the Blinded or Deafened condition (your choice) for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "blink",
  "name": {
   "de": "Flimmern",
   "en": "Blink"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Magier, Zauberer)",
   "en": "Level 3 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Würfle während der Wirkungsdauer am Ende jedes deiner Züge mit 1W6. Bei einem Ergebnis von 4–6 verschwindest du von deiner aktuellen Existenzebene und erscheinst auf der Ätherebene (der Zauber endet sofort, wenn du dich bereits auf dieser Ebene befindest). Von der Ätherebene aus kannst du die Ebene, die du verlassen hast, wahrnehmen. Du siehst sie jedoch nur in Graustufen, und deine Sichtweite beträgt höchstens 18 Meter. Du kannst nur andere Kreaturen auf der Ätherebene beeinflussen oder von ihnen beeinflusst werden. Kreaturen auf der anderen Ebene können dich nicht wahrnehmen, es sei denn, eine Spezialfähigkeit erlaubt ihnen, Dinge auf der Ätherebene wahrzunehmen. Du kehrst zu Beginn deines nächsten Zugs – oder wenn der Zauber endet, während du dich auf der Ätherebene befindest – auf die andere Ebene zurück. Du kehrst in einen freien Bereich deiner Wahl, den du sehen kannst, im Abstand von bis zu drei Metern vom Bereich zurück, den du verlassen hast. Ist innerhalb dieser Reichweite kein freier Bereich vorhanden, so erscheinst du im nächstgelegenen freien Bereich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Roll 1d6 at the end of each of your turns for the duration. On a roll of 4–6, you vanish from your current plane of existence and appear in the Ethereal Plane (the spell ends instantly if you are already on that plane). While on the Ethereal Plane, you can perceive the plane you left, which is cast in shades of gray, but you can’t see anything there more than 60 feet away. You can affect and be affected only by other creatures on the Ethereal Plane, and creatures on the other plane can’t perceive you unless they have a special ability that lets them perceive things on the Ethereal Plane. You return to the other plane at the start of your next turn and when the spell ends if you are on the Ethereal Plane. You return to an unoccupied space of your choice that you can see within 10 feet of the space you left. If no unoccupied space is available within that range, you appear in the nearest unoccupied space."
    }
   ]
  }
 },
 {
  "id": "blur",
  "name": {
   "de": "Verschwimmen",
   "en": "Blur"
  },
  "gradzeile": {
   "de": "Illusionszauber 2. Grades (Magier, Zauberer)",
   "en": "Level 2 Illusion (Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "illusion",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dein Körper wird unscharf. Für die Wirkungsdauer sind Kreaturen bei Angriffswürfen gegen dich im Nachteil. Angreifer, die dich mit Blindsicht oder Wahrer Blick wahrnehmen, sind gegen diesen Effekt immun."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Your body becomes blurred. For the duration, any creature has Disadvantage on attack rolls against you. An attacker is immune to this effect if it perceives you with Blindsight or Truesight."
    }
   ]
  }
 },
 {
  "id": "burning-hands",
  "name": {
   "de": "Brennende Hände",
   "en": "Burning Hands"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Evocation (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt ein dünnes Flammenband. Jede Kreatur in einem Kegel von 4,5 Metern führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 3W6 Feuerschaden, anderenfalls die Hälfte. Brennbare Gegenstände im Kegel, die nicht getragen oder gehalten werden, beginnen zu brennen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A thin sheet of flames shoots forth from you. Each creature in a 15-foot Cone makes a Dexterity saving throw, taking 3d6 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the Cone that aren’t being worn or carried start burning."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "call-lightning",
  "name": {
   "de": "Blitze herbeirufen",
   "en": "Call Lightning"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 3. Grades (Druide)",
   "en": "Level 3 Conjuration (Druid)"
  },
  "grad": 3,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An einem Punkt in Reichweite über dir, den du sehen kannst, erscheint eine Sturmwolke. Sie hat die Form eines drei Meter hohen Zylinders mit einem Radius von 18 Metern. Wenn du den Zauber wirkst, wähle einen Punkt unter der Wolke aus, den du sehen kannst. Ein Blitz schlägt von der Wolke in diesen Punkt ein. Jede Kreatur im Abstand von bis zu 1,5 Metern um diesem Punkt führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 3W10 Blitzschaden, anderenfalls die Hälfte. Für die Wirkungsdauer kannst du eine magische Aktion verwenden, um einen weiteren Blitz dieser Art einschlagen zu lassen. Dabei kannst du denselben Punkt oder einen anderen als Ziel auswählen. Wenn du dich beim Wirken des Zaubers draußen aufhältst und ein Sturm herrscht, verleiht der Zauber dir Kontrolle über diesen Sturm, anstatt einen neuen zu erschaffen. Unter diesen Umständen wird der Schaden des Zaubers um 1W10 erhöht."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird der Schaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A storm cloud appears at a point within range that you can see above yourself. It takes the shape of a Cylinder that is 10 feet tall with a 60-foot radius. When you cast the spell, choose a point you can see under the cloud. A lightning bolt shoots from the cloud to that point. Each creature within 5 feet of that point makes a Dexterity saving throw, taking 3d10 Lightning damage on a failed save or half as much damage on a successful one. Until the spell ends, you can take a Magic action to call down lightning in that way again, targeting the same point or a different one. If you’re outdoors in a storm when you cast this spell, the spell gives you control over that storm instead of creating a new one. Under such conditions, the spell’s damage increases by 1d10."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "calm-emotions",
  "name": {
   "de": "Gefühle besänftigen",
   "en": "Calm Emotions"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 2. Grades (Barde, Kleriker)",
   "en": "Level 2 Enchantment (Bard, Cleric)"
  },
  "grad": 2,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jeder Humanoide innerhalb einer Kugel mit einem Radius von sechs Metern um einen Punkt deiner Wahl in Reichweite muss einen Charismarettungswurf bestehen, oder einer der folgenden Effekte wirkt auf ihn (wähle für jede Kreatur einen Effekt aus): • Die Kreatur ist für die Wirkungsdauer gegen die Zustände Bezaubert und Verängstigt immun. Wenn die Kreatur bereits bezaubert oder verängstigt war, werden diese Zustände für die Wirkungsdauer unterdrückt. • Die Kreatur wird Kreaturen deiner Wahl gegenüber gleichgültig, denen es feindlich gesinnt war. Diese Gleichgültigkeit endet, wenn das Ziel Schaden erleidet oder sieht, dass seine Verbündeten Schaden erleiden. Wenn der Zauber endet, wird die Haltung der Kreatur wieder normal."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each Humanoid in a 20-foot-radius Sphere centered on a point you choose within range must succeed on a Charisma saving throw or be affected by one of the following effects (choose for each creature): • The creature has Immunity to the Charmed and Frightened conditions until the spell ends. If the creature was already Charmed or Frightened, those conditions are suppressed for the duration. • The creature becomes Indifferent about creatures of your choice that it’s Hostile toward. This indifference ends if the target takes damage or witnesses its allies taking damage. When the spell ends, the creature’s attitude returns to normal."
    }
   ]
  }
 },
 {
  "id": "chain-lightning",
  "name": {
   "de": "Kettenblitz",
   "en": "Chain Lightning"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 6. Grades (Magier, Zauberer)",
   "en": "Level 6 Evocation (Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (drei Silbernadeln)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (three silver pins)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst einen Blitz auf ein Ziel in Reichweite, das du sehen kannst. Dann springen drei Blitze von diesem Ziel auf bis zu drei weitere Ziele deiner Wahl über, die sich im Abstand von bis zu neun Metern vom ersten Ziel befinden müssen. Beim Ziel kann es sich um eine Kreatur oder einen Gegenstand handeln. Es kann nur von einem der Blitze getroffen werden. Jedes Ziel führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet es 10W8 Blitzschaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. springt ein zusätzlicher Blitz vom ersten Ziel auf ein weiteres über."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You launch a lightning bolt toward a target you can see within range. Three bolts then leap from that target to as many as three other targets of your choice, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts. Each target makes a Dexterity saving throw, taking 10d8 Lightning damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. One additional bolt leaps from the first target to another target for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "charm-monster",
  "name": {
   "de": "Monster bezaubern",
   "en": "Charm Monster"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 4. Grades (Barde, Druide, Hexenmeister, Magier, Zauberer)",
   "en": "Level 4 Enchantment (Bard, Druid, Sorcerer, Warlock, Wizard)"
  },
  "grad": 4,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur in Reichweite, die du sehen kannst, führt einen Weisheitsrettungswurf aus. Dabei ist sie im Vorteil, wenn du oder deine Verbündeten gegen sie kämpfen. Misslingt der Wurf, so ist das Ziel bezaubert, bis der Zauber endet oder du oder deine Verbündeten ihm Schaden zufügen. Die bezauberte Kreatur ist dir freundlich gesinnt. Nach Ende des Zaubers weiß das Ziel, dass es von dir bezaubert wurde."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "charm-person",
  "name": {
   "de": "Person bezaubern",
   "en": "Charm Person"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde, Druide, Hexenmeister, Magier, Zauberer)",
   "en": "Level 1 Enchantment (Bard, Druid, Sorcerer, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Humanoide in Reichweite, den du sehen kannst, führt einen Weisheitsrettungswurf aus. Dabei ist er im Vorteil, wenn du oder deine Verbündeten gegen ihn kämpfen. Misslingt der Wurf, so ist das Ziel bezaubert, bis der Zauber endet oder du oder deine Verbündeten ihm Schaden zufügen. Die bezauberte Kreatur ist dir freundlich gesinnt. Nach Ende des Zaubers weiß das Ziel, dass es von dir bezaubert wurde."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One Humanoid you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "chill-touch",
  "name": {
   "de": "Kalte Hand",
   "en": "Chill Touch"
  },
  "gradzeile": {
   "de": "Zaubertrick der Nekromantie (Hexenmeister, Magier, Zauberer)",
   "en": "Necromancy Cantrip (Sorcerer, Warlock, Wizard)"
  },
  "grad": 0,
  "schule": "nekromantie",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kanalisierst Grabeskälte und führst einen Nahkampf‑Zauberangriff auf ein Ziel in Reichweite aus. Bei einem Treffer erleidet das Ziel 1W10 nekrotischen Schaden und kann bis zum Ende deines nächsten Zugs keine Trefferpunkte zurückerhalten."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W10 erhöht, wenn du die 5. (2W10), die 11. (3W10) und die 17. (4W10) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Channeling the chill of the grave, make a melee spell attack against a target within reach. On a hit, the target takes 1d10 Necrotic damage, and it can’t regain Hit Points until the end of your next turn."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
    }
   ]
  }
 },
 {
  "id": "chromatic-orb",
  "name": {
   "de": "Chromatische Kugel",
   "en": "Chromatic Orb"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Evocation (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (ein Diamant im Wert von mindestens 50 GM)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (a diamond worth 50+ GP)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst eine Energiekugel auf ein Ziel in Reichweite. Wähle für die Art der Kugel Blitz, Feuer, Gift, Kälte, Säure oder Schall aus und führe dann einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 3W8 Schaden der ausgewählten Art. Wenn du mit mindestens zwei der W8 dasselbe Ergebnis würfelst, springt die Kugel zu einem weiteren Ziel deiner Wahl im Abstand von bis zu neun Metern vom Ziel. Führe einen Angriffswurf gegen das neue Ziel sowie einen neuen Schadenswurf aus. Die Kugel kann nicht noch einmal springen, sofern du den Zauber nicht mit einem Zauberplatz ab dem 2. Grad wirkst."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W8 erhöht. Die Kugel kann höchstens so oft springen, wie es dem Grad des verbrauchten Zauberplatzes entspricht, und jede Kreatur kann nur einmal das Ziel dieses Zaubers sein."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You hurl an orb of energy at a target within range. Choose Acid, Cold, Fire, Lightning, Poison, or Thunder for the type of orb you create, and then make a ranged spell attack against the target. On a hit, the target takes 3d8 damage of the chosen type. If you roll the same number on two or more of the d8s, the orb leaps to a different target of your choice within 30 feet of the target. Make an attack roll against the new target, and make a new damage roll. The orb can’t leap again unless you cast the spell with a level 2+ spell slot."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1. The orb can leap a maximum number of times equal to the level of the slot expended, and a creature can be targeted only once by each casting of this spell."
    }
   ]
  }
 },
 {
  "id": "circle-of-death",
  "name": {
   "de": "Todeskreis",
   "en": "Circle of Death"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 6. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 6 Necromancy (Sorcerer, Warlock, Wizard)"
  },
  "grad": 6,
  "schule": "nekromantie",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (Pulver einer zerstoßenen schwarzen Perle im Wert von mindestens 500 GM)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (the powder of a crushed black pearl worth 500+ GP)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von einem Punkt deiner Wahl in Reichweite breitet sich negative Energie zu einer Kugel mit einem Radius von 18 Metern aus. Jede Kreatur in diesem Bereich führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 8W8 nekrotischen Schaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. wird der Schaden um 2W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Negative energy ripples out in a 60-foot-radius Sphere from a point you choose within range. Each creature in that area makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 2d8 for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "clairvoyance",
  "name": {
   "de": "Hellsehen",
   "en": "Clairvoyance"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 3. Grades (Barde, Kleriker, Magier, Zauberer)",
   "en": "Level 3 Divination (Bard, Cleric, Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "1,6 Kilometer",
    "komponenten": "V, G, M (ein Fokus im Wert von mindestens 100 GM – entweder ein juwelenbesetztes Horn zum Hören oder ein Glasauge zum Sehen)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "1 mile",
    "komponenten": "V, S, M (a focus worth 100+ GP, either a jeweled horn for hearing or a glass eye for seeing)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst an einem dir bekannten Ort (den du bereits gesehen oder besucht hast) oder an einem offensichtlichen Ort, der dir unbekannt ist (beispielsweise hinter einer Tür, einer Ecke oder in einem Hain), einen unsichtbaren Sensor in Reichweite. Der Sensor ist immateriell und unverwundbar. Er bleibt für die Wirkungsdauer bestehen. Wenn du den Zauber wirkst, wähle Hören oder Sehen aus. Du nimmst den ausgewählten Sinn durch den Sensor wahr, als würdest du dich in dessen Bereich befinden. Als Bonusaktion kannst du zwischen Hören und Sehen wechseln. Eine Kreatur, die den Sensor sehen kann (beispielsweise mit Wahrer Blick oder Unsichtbares sehen), sieht eine etwa faustgroße leuchtende Kugel."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create an Invisible sensor within range in a location familiar to you (a place you have visited or seen before) or in an obvious location that is unfamiliar to you (such as behind a door, around a corner, or in a grove of trees). The intangible, invulnerable sensor remains in place for the duration. When you cast the spell, choose seeing or hearing. You can use the chosen sense through the sensor as if you were in its space. As a Bonus Action, you can switch between seeing and hearing. A creature that sees the sensor (such as a creature benefiting from See Invisibility or Truesight) sees a luminous orb about the size of your fist."
    }
   ]
  }
 },
 {
  "id": "clone",
  "name": {
   "de": "Klon",
   "en": "Clone"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 8. Grades (Magier)",
   "en": "Level 8 Necromancy (Wizard)"
  },
  "grad": 8,
  "schule": "nekromantie",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Diamant im Wert von mindestens 1.000 GM, den der Zauber verbraucht, und ein verschließbares Gefäß im Wert von mindestens 2.000 GM, das groß genug ist, um die zu klonende Kreatur aufzunehmen)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a diamond worth 1,000+ GP, which the spell consumes, and a sealable vessel worth 2,000+ GP that is large enough to hold the creature being cloned)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur oder mindestens 16 Kubikzentimeter von ihrem Fleisch. Im Gefäß, das du für den Zauber verwendet hast, wächst ein regloses Duplikat der Kreatur. Es ist nach 120 Tagen ausgewachsen. Du bestimmst, ob es so alt wie die Kreatur oder jünger ist. Der Klon bleibt reglos und beliebig lange erhalten, sofern das Gefäß nicht geöffnet wird. Stirbt die ursprüngliche Kreatur, wenn der Klon ausgewachsen ist, so wird ihre Seele auf den Klon übertragen, sofern sie frei und bereitwillig ist. Der Klon ist körperlich mit dem Original identisch und besitzt dessen Persönlichkeit, seine Erinnerungen und Fähigkeiten, jedoch nicht seine Ausrüstung. Überreste der ursprünglichen Kreatur werden gegebenenfalls reglos und können nicht wiederbelebt werden, da sich die Seele der Kreatur anderswo befindet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature or at least 1 cubic inch of its flesh. An inert duplicate of that creature forms inside the vessel used in the spell’s casting and finishes growing after 120 days; you choose whether the finished clone is the same age as the creature or younger. The clone remains inert and endures indefinitely while its vessel remains undisturbed. If the original creature dies after the clone finishes forming, the creature’s soul transfers to the clone if the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original’s equipment. The creature’s original remains, if any, become inert and can’t be revived, since the creature’s soul is elsewhere."
    }
   ]
  }
 },
 {
  "id": "cloudkill",
  "name": {
   "de": "Todeswolke",
   "en": "Cloudkill"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 5. Grades (Magier, Zauberer)",
   "en": "Level 5 Conjuration (Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "beschwoerung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst eine Kugel aus gelbgrünem Nebel mit einem Radius von sechs Metern um einen Punkt in Reichweite. Der Nebel bleibt für die Wirkungsdauer bestehen, oder bis starker Wind (wie solcher durch Windstoß) ihn auflöst, wodurch der Zauber endet. Der Bereich der Kugel ist komplett verschleiert. Jede Kreatur in der Kugel führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 5W8 Giftschaden, anderenfalls die Hälfte. Eine Kreatur muss den Konstitutionsrettungswurf auch dann ausführen, wenn die Kugel sich in ihren Bereich bewegt, wenn die Kreatur die Kugel betritt oder wenn sie ihren Zug darin beendet. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen. Zu Beginn jedes deiner Züge bewegt sich die Kugel um drei Meter von dir weg."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a 20-foot-radius Sphere of yellow-green fog centered on a point within range. The fog lasts for the duration or until strong wind (such as the one created by Gust of Wind) disperses it, ending the spell. Its area is Heavily Obscured. Each creature in the Sphere makes a Constitution saving throw, taking 5d8 Poison damage on a failed save or half as much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when it enters the Sphere or ends its turn there. A creature makes this save only once per turn. The Sphere moves 10 feet away from you at the start of each of your turns."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "color-spray",
  "name": {
   "de": "Sprühende Farben",
   "en": "Color Spray"
  },
  "gradzeile": {
   "de": "Illusionszauber 1. Grades (Barde, Magier, Zauberer)",
   "en": "Level 1 Illusion (Bard, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine Prise bunter Sand)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a pinch of colorful sand)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du entfesselst schillernde bunte Lichter. Jede Kreatur in einem von dir ausgehenden Kegel von 4,5 Metern muss einen Konstitutionsrettungswurf bestehen, oder sie ist bis zum Ende deines nächsten Zugs blind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You launch a dazzling array of flashing, colorful light. Each creature in a 15-foot Cone originating from you must succeed on a Constitution saving throw or have the Blinded condition until the end of your next turn."
    }
   ]
  }
 },
 {
  "id": "command",
  "name": {
   "de": "Befehl",
   "en": "Command"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde, Kleriker, Paladin)",
   "en": "Level 1 Enchantment (Bard, Cleric, Paladin)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du gibst einer Kreatur in Reichweite, die du sehen kannst, einen ein Wort langen Befehl. Das Ziel muss einen Weisheitsrettungswurf bestehen oder den Befehl im nächsten Zug ausführen. Wähle den Befehl aus diesen Optionen aus:"
    },
    {
     "typ": "stichpunkt",
     "text": "Anhalten: Das Ziel bewegt sich in seinem Zug nicht und führt weder eine Aktion noch eine Bonusaktion aus."
    },
    {
     "typ": "stichpunkt",
     "text": "Fliehen: Das Ziel nutzt seinen Zug, um sich so schnell wie möglich von dir wegzubewegen."
    },
    {
     "typ": "stichpunkt",
     "text": "Herkommen: Das Ziel bewegt sich auf dem kürzesten Weg in deine Richtung und beendet seinen Zug, sobald es sich auf höchstens 1,5 Meter genähert hat."
    },
    {
     "typ": "stichpunkt",
     "text": "Hinlegen: Das Ziel nimmt den Zustand Liegend an und beendet dann seinen Zug."
    },
    {
     "typ": "stichpunkt",
     "text": "Loslassen: Das Ziel lässt fallen, was es gerade hält, und beendet seinen Zug."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du eine weitere Kreatur beeinflussen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. Choose the command from these options:"
    },
    {
     "typ": "stichpunkt",
     "text": "Approach. The target moves toward you by the shortest and most direct route, ending its turn if it moves within 5 feet of you."
    },
    {
     "typ": "stichpunkt",
     "text": "Drop. The target drops whatever it is holding and then ends its turn."
    },
    {
     "typ": "stichpunkt",
     "text": "Flee. The target spends its turn moving away from you by the fastest available means."
    },
    {
     "typ": "stichpunkt",
     "text": "Grovel. The target has the Prone condition and then ends its turn."
    },
    {
     "typ": "stichpunkt",
     "text": "Halt. On its turn, the target doesn’t move and takes no action or Bonus Action."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can affect one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "commune",
  "name": {
   "de": "Heiliges Gespräch",
   "en": "Commune"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 5. Grades (Kleriker)",
   "en": "Level 5 Divination (Cleric)"
  },
  "grad": 5,
  "schule": "erkenntnis",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (Weihrauch)",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S, M (incense)",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du nimmst mit einer Gottheit oder dem Stellvertreter einer Gottheit Kontakt auf und stellst bis zu drei Fragen, die mit Ja oder Nein beantwortet werden können. Du musst deine Fragen stellen, bevor der Zauber endet. Du erhältst auf jede Frage eine korrekte Antwort. Göttliche Wesen sind nicht unbedingt allwissend. Bezieht sich die Frage auf Informationen, die das Wissen der Gottheit übersteigen, könntest du als Antwort „Unklar“ erhalten. Falls eine Antwort mit nur einem Wort irreführend sein oder nicht dem Interesse der Gottheit entsprechen könnte, kann der SL stattdessen einen kurzen Satz als Antwort geben. Wenn du den Zauber vor einer langen Rast häufiger als einmal wirkst, erhöht dies das Risiko, keine Antwort zu erhalten, mit jedem Wirken nach dem ersten um jeweils 25 Prozent."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You contact a deity or a divine proxy and ask up to three questions that can be answered with yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question. Divine beings aren’t necessarily omniscient, so you might receive “unclear” as an answer if a question pertains to information that lies beyond the deity’s knowledge. In a case where a one-word answer could be misleading or contrary to the deity’s interests, the GM might offer a short phrase as an answer instead. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer."
    }
   ]
  }
 },
 {
  "id": "commune-with-nature",
  "name": {
   "de": "Einswerden mit der Natur",
   "en": "Commune with Nature"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 5. Grades (Druide, Waldläufer)",
   "en": "Level 5 Divination (Druid, Ranger)"
  },
  "grad": 5,
  "schule": "erkenntnis",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kommunizierst mit Naturgeistern und erlangst Wissen über deine Umgebung. Im Freien gewährt dir der Zauber Wissen über den Bereich im Abstand von bis zu 4,8 Kilometern von dir. In Höhlen und anderen natürlichen unterirdischen Umgebungen beträgt der Radius 90 Meter. Der Zauber funktioniert nicht in Gebieten, in denen die Natur durch Bauten ersetzt wurde, beispielsweise in Burgen und Siedlungen. Wähle drei der folgenden Optionen aus. Du erfährst diese Fakten, sofern sie zum Bereich des Zaubers gehören: • Orte von Siedlungen • Orte von Portalen oder anderen Existenzebenen • Ort einer Kreatur mit einem Herausforderungsgrad von mindestens 10 (nach Wahl des SL), die ein celestisches Wesen, ein Elementar, ein Feenwesen, ein Unhold oder ein Untoter ist • Die häufigste Art von Pflanze, Mineral oder Tier (nach deiner Wahl) • Orte von Gewässern Du könntest beispielsweise den Ort eines mächtigen Monsters im Bereich, den Ort von Gewässern sowie den Ort von Dörfern erfahren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You commune with nature spirits and gain knowledge of the surrounding area. In the outdoors, the spell gives you knowledge of the area within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. The spell doesn’t function where nature has been replaced by construction, such as in castles and settlements. Choose three of the following facts; you learn those facts as they pertain to the spell’s area: • Locations of settlements • Locations of portals to other planes of existence • Location of one Challenge Rating 10+ creature (GM’s choice) that is a Celestial, an Elemental, a Fey, a Fiend, or an Undead • The most prevalent kind of plant, mineral, or Beast (you choose which to learn) • Locations of bodies of water For example, you could determine the location of a powerful monster in the area, the locations of bodies of water, and the locations of any towns."
    }
   ]
  }
 },
 {
  "id": "comprehend-languages",
  "name": {
   "de": "Sprachen verstehen",
   "en": "Comprehend Languages"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 1. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 1 Divination (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (je eine Prise Ruß und Salz)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S, M (a pinch of soot and salt)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer verstehst du die wörtliche Bedeutung jeder Sprache, die du hörst oder liest. Außerdem verstehst du jede Schriftsprache, die du liest, sofern du die Oberfläche berührst, auf der die Worte geschrieben stehen. Eine Seite Text zu lesen dauert etwa eine Minute. Dieser Zauber entschlüsselt weder Symbole noch Geheimbotschaften."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you understand the literal meaning of any language that you hear or see signed. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn’t decode symbols or secret messages."
    }
   ]
  }
 },
 {
  "id": "compulsion",
  "name": {
   "de": "Zwang",
   "en": "Compulsion"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 4. Grades (Barde)",
   "en": "Level 4 Enchantment (Bard)"
  },
  "grad": 4,
  "schule": "verzauberung",
  "klassen": [
   "barde"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jede Kreatur deiner Wahl in Reichweite, die du sehen kannst, muss einen Weisheitsrettungswurf bestehen, oder sie ist bezaubert, bis der Zauber endet. Für die Wirkungsdauer kannst du eine Bonusaktion ausführen, um eine Richtung zu bestimmen, die horizontal von dir verläuft. Jedes bezauberte Ziel muss in seinem nächsten Zug so viel seiner Bewegungsrate wie möglich verwenden, um sich in diese Richtung zu bewegen. Dabei nimmt es die sicherste Route. Nachdem das Ziel sich auf diese Art bewegt hat, wiederholt es seinen Rettungswurf. Bei einem Erfolg endet der Zauber bei ihm."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each creature of your choice that you can see within range must succeed on a Wisdom saving throw or have the Charmed condition until the spell ends. For the duration, you can take a Bonus Action to designate a direction that is horizontal to you. Each Charmed target must use as much of its movement as possible to move in that direction on its next turn, taking the safest route. After moving in this way, a target repeats the save, ending the spell on itself on a success."
    }
   ]
  }
 },
 {
  "id": "cone-of-cold",
  "name": {
   "de": "Kältekegel",
   "en": "Cone of Cold"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 5. Grades (Druide, Magier, Zauberer)",
   "en": "Level 5 Evocation (Druid, Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein kleiner Kegel aus Kristall oder Glas)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a small crystal or glass cone)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du entfesselst einen Stoß eiskalter Luft. Jede Kreatur in einem Kegel von 18 Metern, der von dir ausgeht, führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 8W8 Kälteschaden, anderenfalls die Hälfte. Wird eine Kreatur durch diesen Zauber getötet, so wird sie zu einer gefrorenen Statue, bis sie auftaut."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You unleash a blast of cold air. Each creature in a 60-foot Cone originating from you makes a Constitution saving throw, taking 8d8 Cold damage on a failed save or half as much damage on a successful one. A creature killed by this spell becomes a frozen statue until it thaws."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "confusion",
  "name": {
   "de": "Verwirrung",
   "en": "Confusion"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 4. Grades (Barde, Druide, Magier, Zauberer)",
   "en": "Level 4 Enchantment (Bard, Druid, Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (drei Nussschalen)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (three nut shells)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jede Kreatur in einer Kugel mit einem Radius von drei Metern um einen Punkt deiner Wahl in Reichweite muss einen Weisheitsrettungswurf bestehen, oder sie kann weder Bonusaktionen noch Reaktionen ausführen und muss zu Beginn jedes ihrer Züge mit 1W10 würfeln, um anhand der nachstehenden Tabelle ihr Verhalten in diesem Zug zu ermitteln."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W10",
      "Verhalten im Zug"
     ],
     "reihen": [
      [
       "1",
       "Das Ziel führt keine Aktion aus und verwendet seine gesamte Bewegungsrate, um sich zu bewegen. Würfle die Richtung mit 1W4 aus: 1: Norden, 2: Osten, 3: Süden, 4: Westen."
      ],
      [
       "2–6",
       "Das Ziel bewegt sich nicht und führt keine Aktionen aus."
      ],
      [
       "7–8",
       "Das Ziel bewegt sich nicht. Es führt die Angriffsaktion aus, um einen Nahkampfangriff gegen eine zufällige Kreatur in Reichweite auszuführen. Wenn sich keine Kreaturen in Reichweite befinden, führt das Ziel keine Aktionen aus."
      ],
      [
       "9–10",
       "Das Ziel wählt sein Verhalten selbst aus."
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "Ein betroffenes Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Zauber bei diesem Ziel."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der Radius der Kugel um 1,5 Meter erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each creature in a 10-foot-radius Sphere centered on a point you choose within range must succeed on a Wisdom saving throw, or that target can’t take Bonus Actions or Reactions and must roll 1d10 at the start of each of its turns to determine its behavior for that turn, consulting the table below."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d10",
      "Behavior for the Turn"
     ],
     "reihen": [
      [
       "1",
       "The target doesn’t take an action, and it uses all its movement to move. Roll 1d4 for the direction: 1, north; 2, east; 3, south; or 4, west."
      ],
      [
       "2–6",
       "The target doesn’t move or take actions."
      ],
      [
       "7–8",
       "The target doesn’t move, and it takes the Attack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action."
      ],
      [
       "9–10",
       "The target chooses its behavior."
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The Sphere’s radius increases by 5 feet for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "conjure-animals",
  "name": {
   "de": "Tiere beschwören",
   "en": "Conjure Animals"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 3. Grades (Druide, Waldläufer)",
   "en": "Level 3 Conjuration (Druid, Ranger)"
  },
  "grad": 3,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst Naturgeister. Diese nehmen die Form eines großen Rudels geisterhafter, immaterieller Tiere in einem freien Bereich in Reichweite an, den du sehen kannst. Das Rudel bleibt für die Wirkungsdauer bestehen. Du wählst die Tierform der Geister aus, beispielsweise Wölfe, Schlangen oder Vögel. Du bist bei Stärkerettungswürfen im Vorteil, solange du dich im Abstand von bis zu 1,5 Metern vom Rudel befindest. Wenn du dich in deinem Zug bewegst, kannst du auch das Rudel um bis zu neun Meter in einen freien Bereich bewegen, den du sehen kannst. Wann immer das Rudel sich einer Kreatur, die du sehen kannst, auf höchstens drei Meter nähert, und wann immer eine Kreatur, die du sehen kannst, einen Bereich im Abstand von bis zu drei Metern vom Rudel betritt oder ihren Zug dort beendet, kannst du die Kreatur zu einem Geschicklichkeitsrettungswurf zwingen. Misslingt der Wurf, so erleidet die Kreatur 3W10 Hiebschaden. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird der Schaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure nature spirits that appear as a Large pack of spectral, intangible animals in an unoccupied space you can see within range. The pack lasts for the duration, and you choose the spirits’ animal form, such as wolves, serpents, or birds. You have Advantage on Strength saving throws while you’re within 5 feet of the pack, and when you move on your turn, you can also move the pack up to 30 feet to an unoccupied space you can see. Whenever the pack moves within 10 feet of a creature you can see and whenever a creature you can see enters a space within 10 feet of the pack or ends its turn there, you can force that creature to make a Dexterity saving throw. On a failed save, the creature takes 3d10 Slashing damage. A creature makes this save only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "conjure-celestial",
  "name": {
   "de": "Celestisches Wesen beschwören",
   "en": "Conjure Celestial"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 7. Grades (Kleriker)",
   "en": "Level 7 Conjuration (Cleric)"
  },
  "grad": 7,
  "schule": "beschwoerung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst einen Geist aus den Oberen Ebenen, der sich als Lichtsäule in einem zwölf Meter hohen Zylinder mit einem Radius von drei Metern um einen Punkt in Reichweite manifestiert. Wähle bei jeder Kreatur im Zylinder, die du sehen kannst, eine der folgenden Arten von Licht aus, von der sie beschienen wird:"
    },
    {
     "typ": "stichpunkt",
     "text": "Heilendes Licht: Das Ziel erhält Trefferpunkte in Höhe von 4W12 plus deinem Zauberwirken‑Attributsmodifikator zurück."
    },
    {
     "typ": "stichpunkt",
     "text": "Sengendes Licht: Das Ziel führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet es 6W12 gleißenden Schaden, anderenfalls die Hälfte. Für die Wirkungsdauer ist der Zylinder von hellem Licht erfüllt. Wenn du dich in deinem Zug bewegst, kannst du auch den Zylinder bis zu neun Meter weit bewegen. Wann immer der Zylinder sich in den Bereich einer Kreatur bewegt, die du sehen kannst, und wann immer eine Kreatur, die du sehen kannst, den Zylinder betritt oder ihren Zug dort beendet, kannst du sie in einer der Lichtarten baden. Eine Kreatur kann von diesem Zauber nur einmal pro Zug betroffen sein."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 7. werden Heilung und Schaden um 1W12 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a spirit from the Upper Planes, which manifests as a pillar of light in a 10-foot-radius, 40-foot-high Cylinder centered on a point within range. For each creature you can see in the Cylinder, choose which of these lights shines on it:"
    },
    {
     "typ": "stichpunkt",
     "text": "Healing Light. The target regains Hit Points equal to 4d12 plus your spellcasting ability modifier."
    },
    {
     "typ": "stichpunkt",
     "text": "Searing Light. The target makes a Dexterity saving throw, taking 6d12 Radiant damage on a failed save or half as much damage on a successful one. Until the spell ends, Bright Light fills the Cylinder, and when you move on your turn, you can also move the Cylinder up to 30 feet. Whenever the Cylinder moves into the space of a creature you can see and whenever a creature you can see enters the Cylinder or ends its turn there, you can bathe it in one of the lights. A creature can be affected by this spell only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The healing and damage increase by 1d12 for each spell slot level above 7."
    }
   ]
  }
 },
 {
  "id": "conjure-elemental",
  "name": {
   "de": "Elementar beschwören",
   "en": "Conjure Elemental"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 5. Grades (Druide, Magier)",
   "en": "Level 5 Conjuration (Druid, Wizard)"
  },
  "grad": 5,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst einen großen immateriellen Geist von den Elementarebenen, der in einem freien Bereich in Reichweite erscheint. Wähle das Element des Geistes aus, durch das seine Schadensart bestimmt wird: Erde (Schall), Feuer (Feuer), Luft (Blitz) oder Wasser (Kälte). Der Geist bleibt für die Wirkungsdauer bestehen. Wann immer eine Kreatur, die du sehen kannst, den Bereich des Geistes betritt oder ihren Zug im Abstand von bis zu 1,5 Metern vom Geist beginnt, kannst du die Kreatur zu einem Geschicklichkeitsrettungswurf zwingen, sofern der Geist keine Kreatur festgesetzt hat. Misslingt der Wurf, so erleidet das Ziel 8W8 Schaden je nach Art des Geists und ist festgesetzt, bis der Zauber endet. Das festgesetzte Ziel wiederholt den Rettungswurf zu Beginn jedes seiner Züge. Misslingt der Wurf, so erleidet das Ziel 4W8 Schaden je nach Art des Geists. Bei einem erfolgreichen Rettungswurf ist das Ziel nicht mehr vom Geist festgesetzt."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a Large, intangible spirit from the Elemental Planes that appears in an unoccupied space within range. Choose the spirit’s element, which determines its damage type: air (Lightning), earth (Thunder), fire (Fire), or water (Cold). The spirit lasts for the duration. Whenever a creature you can see enters the spirit’s space or starts its turn within 5 feet of the spirit, you can force that creature to make a Dexterity saving throw if the spirit has no creature Restrained. On failed save, the target takes 8d8 damage of the spirit’s type, and the target has the Restrained condition until the spell ends. At the start of each of its turns, the Restrained target repeats the save. On a failed save, the target takes 4d8 damage of the spirit’s type. On a successful save, the target isn’t Restrained by the spirit."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "conjure-fey",
  "name": {
   "de": "Feenwesen beschwören",
   "en": "Conjure Fey"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 6. Grades (Druide)",
   "en": "Level 6 Conjuration (Druid)"
  },
  "grad": 6,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst einen mittelgroßen Geist aus der Feenwildnis in einem freien Bereich in Reichweite, den du sehen kannst. Der Geist bleibt für die Wirkungsdauer bestehen und gleicht einem Feenwesen deiner Wahl. Wenn der Geist erscheint, kannst du einen Nahkampf‑Zauberangriff gegen eine Kreatur im Abstand von bis zu 1,5 Metern vom Geist ausführen. Bei einem Treffer erleidet das Ziel psychischen Schaden in Höhe von 3W12 plus deinem Zauberwirken-Attributsmodifikator. Außerdem ist das Ziel bis zum Beginn deines nächsten Zugs verängstigt. Dabei seid sowohl du als auch der Geist die Quelle seiner Angst. Als Bonusaktion in deinen folgenden Zügen kannst du den Geist in einen freien Bereich im Abstand von bis zu neun Metern von seinem ursprünglichen Bereich teleportieren, den du sehen kannst, und den Angriff gegen eine Kreatur im Abstand von bis zu 1,5 Metern vom Geist ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. wird der Schaden um 1W12 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a Medium spirit from the Feywild in an unoccupied space you can see within range. The spirit lasts for the duration, and it looks like a Fey creature of your choice. When the spirit appears, you can make one melee spell attack against a creature within 5 feet of it. On a hit, the target takes Psychic damage equal to 3d12 plus your spellcasting ability modifier, and the target has the Frightened condition until the start of your next turn, with both you and the spirit as the source of the fear. As a Bonus Action on your later turns, you can teleport the spirit to an unoccupied space you can see within 30 feet of the space it left and make the attack against a creature within 5 feet of it."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d12 for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "conjure-minor-elementals",
  "name": {
   "de": "Schwache Elementare beschwören",
   "en": "Conjure Minor Elementals"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Druide, Magier)",
   "en": "Level 4 Conjuration (Druid, Wizard)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst Geister von den Elementarebenen, die dich für die Wirkungsdauer in einer Ausströmung von 4,5 Metern umschwirren. Für die Wirkungsdauer bewirken all deine Angriffe zusätzlich 2W8 Schaden, wenn sie eine Kreatur innerhalb der Ausströmung treffen. Dieser Schaden ist Blitz‑, Feuer ‑, Kälte‑ oder Säureschaden (nach deiner Wahl, wenn du den Angriff ausführst). Außerdem ist der Boden innerhalb der Ausströmung schwieriges Gelände für deine Gegner."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure spirits from the Elemental Planes that flit around you in a 15-foot Emanation for the duration. Until the spell ends, any attack you make deals an extra 2d8 damage when you hit a creature in the Emanation. This damage is Acid, Cold, Fire, or Lightning (your choice when you make the attack). In addition, the ground in the Emanation is Difficult Terrain for your enemies."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "conjure-woodland-beings",
  "name": {
   "de": "Wesen des Waldes beschwören",
   "en": "Conjure Woodland Beings"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Druide, Waldläufer)",
   "en": "Level 4 Conjuration (Druid, Ranger)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst Naturgeister, die dich für die Wirkungsdauer in einer Ausströmung von drei Metern umschwirren. Wann immer die Ausströmung in den Bereich einer Kreatur gelangt, die du sehen kannst, und wann immer eine Kreatur, die du sehen kannst, die Ausströmung betritt oder ihren Zug dort beendet, kannst du die Kreatur zu einem Weisheitsrettungswurf zwingen. Misslingt der Wurf, so erleidet die Kreatur 5W8 Energieschaden, anderenfalls die Hälfte. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen. Außerdem kannst du für die Wirkungsdauer des Zaubers die Rückzug‑Aktion als Bonusaktion ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure nature spirits that flit around you in a 10-foot Emanation for the duration. Whenever the Emanation enters the space of a creature you can see and whenever a creature you can see enters the Emanation or ends its turn there, you can force that creature to make a Wisdom saving throw. The creature takes 5d8 Force damage on a failed save or half as much damage on a successful one. A creature makes this save only once per turn. In addition, you can take the Disengage action as a Bonus Action for the spell’s duration."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "contact-other-plane",
  "name": {
   "de": "Kontakt zu anderen Ebenen",
   "en": "Contact Other Plane"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 5. Grades (Hexenmeister, Magier)",
   "en": "Level 5 Divination (Warlock, Wizard)"
  },
  "grad": 5,
  "schule": "erkenntnis",
  "klassen": [
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du trittst mental mit einem Halbgott, dem Geist eines lange verstorbenen Weisen oder einem anderen kundigen Wesen von einer anderen Ebene in Kontakt. Der Kontakt zu dieser außerweltlichen Intelligenz kann deinen Verstand brechen. Wenn du diesen Zauber wirkst, führe einen SG‑15‑Intelligenzrettungswurf aus. Bei einem erfolgreichen Rettungswurf kannst du dem Wesen bis zu fünf Fragen stellen. Du musst deine Fragen stellen, bevor der Zauber endet. Der SL beantwortet jede Frage mit einem einzelnen Wort wie „Ja“, „Nein“, „Vielleicht“, „Niemals“, „Irrelevant“ oder „Unklar“ (wenn das Wesen die Antwort nicht kennt). Falls eine Antwort mit nur einem Wort irreführend wäre, kann der SL stattdessen einen kurzen Satz als Antwort geben. Misslingt der Wurf, so erleidest du 6W6 psychischen Schaden und bist kampfunfähig, bis du eine lange Rast beendest. Der Zauber Vollständige Genesung beendet diesen Effekt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You mentally contact a demigod, the spirit of a longdead sage, or some other knowledgeable entity from another plane. Contacting this otherworldly intelligence can break your mind. When you cast this spell, make a DC 15 Intelligence saving throw. On a successful save, you can ask the entity up to five questions. You must ask your questions before the spell ends. The GM answers each question with one word, such as “yes,” “no,” “maybe,” “never,” “irrelevant,” or “unclear” (if the entity doesn’t know the answer to the question). If a one-word answer would be misleading, the GM might instead offer a short phrase as an answer. On a failed save, you take 6d6 Psychic damage and have the Incapacitated condition until you finish a Long Rest. A Greater Restoration spell cast on you ends this effect."
    }
   ]
  }
 },
 {
  "id": "contagion",
  "name": {
   "de": "Ansteckung",
   "en": "Contagion"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 5. Grades (Druide, Kleriker)",
   "en": "Level 5 Necromancy (Cleric, Druid)"
  },
  "grad": 5,
  "schule": "nekromantie",
  "klassen": [
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "7 Tage"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "7 days"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Deine Berührung verursacht eine magische Krankheit. Das Ziel muss einen Konstitutionsrettungswurf bestehen, oder es erleidet 11W8 nekrotischen Schaden und ist vergiftet. Wähle außerdem ein Attribut aus, wenn du den Zauber wirkst. Das vergiftete Ziel ist bei Rettungswürfen mit dem ausgewählten Attribut im Nachteil. Das Ziel muss den Rettungswurf am Ende jedes seiner Züge wiederholen, bis es insgesamt drei Erfolge oder drei Misserfolge hatte. Bei drei Erfolgen endet der Zauber bei dem Ziel. Bei drei Misserfolgen wirkt der Zauber sieben Tage lang auf das Ziel. Wann immer das vergiftete Ziel einen Effekt erhält, der den Zustand Vergiftet beenden würde, muss es einen Konstitutionsrettungswurf bestehen, oder der Zustand Vergiftet endet nicht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Your touch inflicts a magical contagion. The target must succeed on a Constitution saving throw or take 11d8 Necrotic damage and have the Poisoned condition. Also, choose one ability when you cast the spell. While Poisoned, the target has Disadvantage on saving throws made with the chosen ability. The target must repeat the saving throw at the end of each of its turns until it gets three successes or failures. If the target succeeds on three of these saves, the spell ends on the target. If the target fails three of the saves, the spell lasts for 7 days on it. Whenever the Poisoned target receives an effect that would end the Poisoned condition, the target must succeed on a Constitution saving throw, or the Poisoned condition doesn’t end on it."
    }
   ]
  }
 },
 {
  "id": "contingency",
  "name": {
   "de": "Notfall",
   "en": "Contingency"
  },
  "gradzeile": {
   "de": "Bannzauber 6. Grades (Magier)",
   "en": "Level 6 Abjuration (Wizard)"
  },
  "grad": 6,
  "schule": "bann",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine mit Edelsteinen verzierte Statuette von dir im Wert von mindestens 1.500 GM)",
    "dauer": "10 Tage"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "Self",
    "komponenten": "V, S, M (a gem-encrusted statuette of yourself worth 1,500+ GP)",
    "dauer": "10 days"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle einen Zauber des höchstens 5. Grades aus, den du auf dich selbst wirken kannst und der einen Zeitaufwand von einer Aktion hat. Du wirkst diesen Zauber (auch Notfallzauber genannt) gemeinsam mit Notfall und verbrauchst Zauberplätze für beide. Der Notfallzauber tritt allerdings erst auf einen bestimmten Auslöser hin in Kraft. Diesen Auslöser beschreibst du, wenn du die beiden Zauber wirkst. Beispiel: Wirkst du Notfall gemeinsam mit Wasser atmen, so kannst du bestimmen, dass Wasser atmen in Kraft tritt, wenn du in Wasser oder einer ähnlichen Flüssigkeit untertauchst. Der Notfallzauber tritt sofort in Kraft, wenn der Auslöser das erste Mal auftritt – ob du willst oder nicht. Danach endet Notfall. Der Zauber wirkt nur auf dich, selbst wenn er normalerweise auch auf andere Ziele gewirkt werden könnte. Du kannst immer nur jeweils einen Notfall‑Zauber verwenden. Wirkst du diesen Zauber erneut, so endet der Effekt eines anderen Notfall‑Zaubers auf dich. Notfall endet auch dann, wenn du die Materialkomponente nicht mehr bei dir hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a spell of level 5 or lower that you can cast, that has a casting time of an action, and that can target you. You cast that spell—called the contingent spell—as part of casting Contingency, expending spell slots for both, but the contingent spell doesn’t come into effect. Instead, it takes effect when a certain trigger occurs. You describe that trigger when you cast the two spells. For example, a Contingency cast with Water Breathing might stipulate that Water Breathing comes into effect when you are engulfed in water or a similar liquid. The contingent spell takes effect immediately after the trigger occurs for the first time, whether or not you want it to, and then Contingency ends. The contingent spell takes effect only on you, even if it can normally target others. You can use only one Contingency spell at a time. If you cast this spell again, the effect of another Contingency spell on you ends. Also, Contingency ends on you if its material component is ever not on your person."
    }
   ]
  }
 },
 {
  "id": "continual-flame",
  "name": {
   "de": "Dauerhafte Flamme",
   "en": "Continual Flame"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Druide, Kleriker, Magier)",
   "en": "Level 2 Evocation (Cleric, Druid, Wizard)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Rubinstaub im Wert von mindestens 50 GM, den der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (ruby dust worth 50+ GP, which the spell consumes)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Flamme bricht aus einem Gegenstand hervor, den du berührst. Der Effekt spendet in einem Radius von sechs Metern helles Licht und in einem Radius von weiteren sechs Metern dämmriges Licht. Er wirkt wie eine normale Flamme, erzeugt jedoch keine Wärme und verbraucht keinen Brennstoff. Die Flamme kann verdeckt oder verborgen, aber nicht erstickt oder gelöscht werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A flame springs from an object that you touch. The effect casts Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. It looks like a regular flame, but it creates no heat and consumes no fuel. The flame can be covered or hidden but not smothered or quenched."
    }
   ]
  }
 },
 {
  "id": "control-water",
  "name": {
   "de": "Wasser kontrollieren",
   "en": "Control Water"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 4. Grades (Druide, Kleriker, Magier)",
   "en": "Level 4 Transmutation (Cleric, Druid, Wizard)"
  },
  "grad": 4,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "90 Meter",
    "komponenten": "V, G, M (eine Mischung aus Wasser und Staub)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "300 feet",
    "komponenten": "V, S, M (a mixture of water and dust)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer kontrollierst du jedes Gewässer in einem Bereich deiner Wahl, der einem Würfel mit bis zu 30 Metern Kantenlänge entspricht, und nutzt dabei einen der folgenden Effekte. Als magische Aktion in deinen folgenden Zügen kannst du den gleichen Effekt wiederholen oder einen anderen auswählen. Der Wasserspiegel bleibt erhöht, bis der Zauber endet oder du einen anderen Effekt auswählst. Wenn dieser Effekt eine Welle erzeugt, wiederholt sich diese zu Beginn deines nächsten Zugs, solange der Flut‑Effekt anhält."
    },
    {
     "typ": "punkt",
     "text": "Fluss umlenken: Du bewirkst, dass sich fließendes Wasser im Bereich in eine Richtung deiner Wahl bewegt, selbst wenn es dafür über Hindernisse, an Wänden empor oder in andere unwahrscheinliche Richtungen strömen muss. Das Wasser im Bereich bewegt sich nach deinen Vorgaben. Sobald es jedoch den Bereich des Zaubers verlässt, fließt es wieder je nach Gelände. Das Wasser strömt in die Richtung deiner Wahl, bis der Zauber endet oder du einen anderen Effekt auswählst."
    },
    {
     "typ": "punkt",
     "text": "Flut: Du lässt den Wasserspiegel aller stehenden Gewässer im Bereich um bis zu sechs Meter ansteigen. Wenn du einen Bereich in einem größeren Gewässer auswählst, erschaffst du stattdessen eine sechs Meter hohe Welle, die sich von einer Seite des Bereichs zum anderen bewegt und dann bricht. Alle Fahrzeuge von höchstens riesiger Größe im Weg der Welle werden mit ihr zur anderen Seite bewegt. Wenn ein solches Fahrzeug von der Welle getroffen wird, besteht eine Chance von 25 Prozent, dass es kentert."
    },
    {
     "typ": "punkt",
     "text": "Wasser teilen: Du teilst das Wasser im Bereich und erschaffst einen Graben, der sich durch den Wirkungsbereich zieht. Das Wasser ragt auf beiden Seiten wie eine Mauer auf. Der Graben bleibt bestehen, bis der Zauber endet oder du einen anderen Effekt auswählst. Anschließend füllt das Wasser im Verlauf der nächsten Runde langsam den Graben, bis der normale Wasserspiegel wiederhergestellt ist."
    },
    {
     "typ": "punkt",
     "text": "Wasserstrudel: Du erschaffst einen Wasserstrudel in der Mitte eines Bereichs von mindestens 15 mal 15 Metern und einer Tiefe von 7,5 Metern. Der Strudel bleibt bestehen, bis du einen anderen Effekt auswählst oder der Zauber endet. Er ist 7,5 Meter hoch, an der Basis 1,5 Meter breit und an der Spitze bis zu 15 Meter breit. Alle Kreaturen, die sich im Wasser im Abstand von bis zu 7,5 Metern um den Strudel befinden, werden drei Meter weit in seine Richtung gezogen. Wenn eine Kreatur in einem Zug erstmals in den Bereich des Strudels gelangt oder ihren Zug dort beendet, führt sie einen Stärkerettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 2W8 Wuchtschaden. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur halb so viel Schaden. Eine Kreatur kann nur dann vom Strudel wegschwimmen, wenn sie zunächst eine Aktion ausführt, um sich zu entfernen, und einen Stärkewurf (Athletik) gegen deinen Zauberrettungswurf‑SG besteht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, you control any water inside an area you choose that is a Cube up to 100 feet on a side, using one of the following effects. As a Magic action on your later turns, you can repeat the same effect or choose a different one."
    },
    {
     "typ": "punkt",
     "text": "Flood. You cause the water level of all standing water in the area to rise by as much as 20 feet. If you choose an area in a large body of water, you instead create a 20-foot tall wave that travels from one side of the area to the other and then crashes. Any Huge or smaller vehicles in the wave’s path are carried with it to the other side. Any Huge or smaller vehicles struck by the wave have a 25 percent chance of capsizing. The water level remains elevated until the spell ends or you choose a different effect. If this effect produced a wave, the wave repeats on the start of your next turn while the flood effect lasts."
    },
    {
     "typ": "punkt",
     "text": "Part Water. You part water in the area and create a trench. The trench extends across the spell’s area, and the separated water forms a wall to either side. The trench remains until the spell ends or you choose a different effect. The water then slowly fills in the trench over the course of the next round until the normal water level is restored."
    },
    {
     "typ": "punkt",
     "text": "Redirect Flow. You cause flowing water in the area to move in a direction you choose, even if the water has to flow over obstacles, up walls, or in other unlikely directions. The water in the area moves as you direct it, but once it moves beyond the spell’s area, it resumes its flow based on the terrain. The water continues to move in the direction you chose until the spell ends or you choose a different effect."
    },
    {
     "typ": "punkt",
     "text": "Whirlpool. You cause a whirlpool to form in the center of the area, which must be at least 50 feet square and 25 feet deep. The whirlpool lasts until you choose a different effect or the spell ends. The whirlpool is 5 feet wide at the base, up to 50 feet wide at the top, and 25 feet tall. Any creature in the water and within 25 feet of the whirlpool is pulled 10 feet toward it. When a creature enters the whirlpool for the first time on a turn or ends its turn there, it makes a Strength saving throw. On a failed save, the creature takes 2d8 Bludgeoning damage. On a successful save, the creature takes half as much damage. A creature can swim away from the whirlpool only if it first takes an action to pull away and succeeds on a Strength (Athletics) check against your spell save DC."
    }
   ]
  }
 },
 {
  "id": "control-weather",
  "name": {
   "de": "Wetterkontrolle",
   "en": "Control Weather"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 8. Grades (Druide, Kleriker, Magier)",
   "en": "Level 8 Transmutation (Cleric, Druid, Wizard)"
  },
  "grad": 8,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (brennender Weihrauch)",
    "dauer": "Konzentration, bis zu 8 Stunden"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "Self",
    "komponenten": "V, S, M (burning incense)",
    "dauer": "Concentration, up to 8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer kontrollierst du das Wetter im Abstand von bis zu acht Kilometern. Du musst dich im Freien befinden, wenn du diesen Zauber wirkst. Der Zauber endet vorzeitig, wenn du nach drinnen gehst. Wenn du den Zauber wirkst, änderst du die aktuellen Wetterbedingungen, die vom SL bestimmt werden. Du kannst Niederschlag, Temperatur und Wind beeinflussen. Es dauert 1W4 mal zehn Minuten, bis die neuen Bedingungen in Kraft treten. Danach kannst du die Bedingungen erneut ändern. Wenn der Zauber endet, normalisiert sich das Wetter allmählich. Finde zum Ändern des Wetters eine aktuelle Wetterbedingung in der folgenden Tabelle und ändere sie eine Stufe nach oben oder unten. Wenn du den Wind änderst, kannst du auch seine Richtung ändern."
    },
    {
     "typ": "tabelle",
     "titel": "Niederschlag",
     "kopf": [
      "Stufe",
      "Bedingung"
     ],
     "reihen": [
      [
       "1",
       "Wolkenlos"
      ],
      [
       "2",
       "Leicht bewölkt"
      ],
      [
       "3",
       "Bewölkt oder Bodennebel"
      ],
      [
       "4",
       "Regen, Hagel oder Schnee"
      ],
      [
       "5",
       "Starkregen, Hagelsturm oder Schneesturm"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Temperatur",
     "kopf": [
      "Temperatur Stufe",
      "Bedingung",
      "Wind Stufe",
      "Bedingung"
     ],
     "reihen": [
      [
       "1",
       "Extrem heiß",
       "1",
       "Flaute"
      ],
      [
       "2",
       "Heiß",
       "2",
       "Mäßiger Wind"
      ],
      [
       "3",
       "Warm",
       "3",
       "Starker Wind"
      ],
      [
       "4",
       "Kühl",
       "4",
       "Starke Böen"
      ],
      [
       "5",
       "Kalt",
       "5",
       "Sturm"
      ],
      [
       "6",
       "Eisig",
       "",
       ""
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell, and it ends early if you go indoors. When you cast the spell, you change the current weather conditions, which are determined by the GM. You can change precipitation, temperature, and wind. It takes 1d4 × 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal. When you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction."
    },
    {
     "typ": "tabelle",
     "titel": "Precipitation",
     "kopf": [
      "Stage",
      "Condition"
     ],
     "reihen": [
      [
       "1",
       "Clear"
      ],
      [
       "2",
       "Light clouds"
      ],
      [
       "3",
       "Overcast or ground fog"
      ],
      [
       "4",
       "Rain, hail, or snow"
      ],
      [
       "5",
       "Torrential rain, driving hail, or blizzard"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "Temperature",
     "kopf": [
      "Temperature Stage",
      "Condition",
      "Wind Stage",
      "Condition"
     ],
     "reihen": [
      [
       "1",
       "Heat wave",
       "1",
       "Calm"
      ],
      [
       "2",
       "Hot",
       "2",
       "Moderate wind"
      ],
      [
       "3",
       "Warm",
       "3",
       "Strong wind"
      ],
      [
       "4",
       "Cool",
       "4",
       "Gale"
      ],
      [
       "5",
       "Cold",
       "5",
       "Storm"
      ],
      [
       "6",
       "Freezing",
       "",
       ""
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "counterspell",
  "name": {
   "de": "Gegenzauber",
   "en": "Counterspell"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 3 Abjuration (Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Reaktion, die du ausführst, wenn du siehst, wie eine Kreatur im Abstand von bis zu 18 Metern von dir einen Zauber mit Gesten, Material- oder Verbalkomponenten wirkt",
    "reichweite": "18 Meter",
    "komponenten": "G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Reaction, which you take when you see a creature within 60 feet of yourself casting a spell with Verbal, Somatic, or Material components",
    "reichweite": "60 feet",
    "komponenten": "S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versuchst, eine Kreatur beim Wirken eines Zaubers zu unterbrechen. Die Kreatur führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so löst der Zauber sich ohne Effekt auf, und die Aktion, Bonusaktion oder Reaktion, mit der er gewirkt wurde, ist vergeudet. Wenn der Zauber mit einem Zauberplatz gewirkt wurde, so wird dieser nicht verbraucht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You attempt to interrupt a creature in the process of casting a spell. The creature makes a Constitution saving throw. On a failed save, the spell dissipates with no effect, and the action, Bonus Action, or Reaction used to cast it is wasted. If that spell was cast with a spell slot, the slot isn’t expended."
    }
   ]
  }
 },
 {
  "id": "create-food-and-water",
  "name": {
   "de": "Nahrung und Wasser erschaffen",
   "en": "Create Food and Water"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 3. Grades (Kleriker, Paladin)",
   "en": "Level 3 Conjuration (Cleric, Paladin)"
  },
  "grad": 3,
  "schule": "beschwoerung",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst 22,5 Kilogramm Nahrung und 120 Liter Wasser auf dem Boden oder in Behältern in Reichweite – nützlich, um den Gefahren von Unterernährung und Dehydrierung vorzubeugen. Die Nahrung sieht aus wie Essen deiner Wahl und ist schlicht, aber nahrhaft. Das Wasser ist sauber. Die Nahrung verdirbt innerhalb von 24 Stunden, wenn sie nicht gegessen wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create 45 pounds of food and 30 gallons of fresh water on the ground or in containers within range—both useful in fending off the hazards of malnutrition and dehydration. The food is bland but nourishing and looks like a food of your choice, and the water is clean. The food spoils after 24 hours if uneaten."
    }
   ]
  }
 },
 {
  "id": "create-or-destroy-water",
  "name": {
   "de": "Wasser erschaffen oder zerstören",
   "en": "Create or Destroy Water"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 1. Grades (Druide, Kleriker)",
   "en": "Level 1 Transmutation (Cleric, Druid)"
  },
  "grad": 1,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Mischung aus Wasser und Sand)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a mix of water and sand)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du führst eine der folgenden Handlungen aus:"
    },
    {
     "typ": "stichpunkt",
     "text": "Wasser erschaffen: Du erschaffst bis zu 40 Liter sauberes Wasser in einem offenen Behälter in Reichweite. Alternativ geht das Wasser als Regen in einem Würfel mit neun Metern Kantenlänge in Reichweite nieder und löscht dort offene Flammen."
    },
    {
     "typ": "stichpunkt",
     "text": "Wasser zerstören: Du zerstörst bis zu 40 Liter Wasser in einem offenen Behälter in Reichweite. Alternativ zerstörst du Nebel in einem Würfel mit neun Metern Kantenlänge in Reichweite."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du zusätzliche 40 Liter Wasser erschaffen oder zerstören oder die Kantenlänge des Würfels um 1,5 Meter erhöhen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You do one of the following:"
    },
    {
     "typ": "stichpunkt",
     "text": "Create Water. You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot Cube within range, extinguishing exposed flames there."
    },
    {
     "typ": "stichpunkt",
     "text": "Destroy Water. You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot Cube within range."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You create or destroy 10 additional gallons of water, or the size of the Cube increases by 5 feet, for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "create-undead",
  "name": {
   "de": "Untote erschaffen",
   "en": "Create Undead"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 6. Grades (Hexenmeister, Kleriker, Magier)",
   "en": "Level 6 Necromancy (Cleric, Warlock, Wizard)"
  },
  "grad": 6,
  "schule": "nekromantie",
  "klassen": [
   "hexenmeister",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "3 Meter",
    "komponenten": "V, G, M (je ein schwarzer Onyx im Wert von mindestens 150 GM für jeden Leichnam)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "10 feet",
    "komponenten": "V, S, M (one 150+ GP black onyx stone for each corpse)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst diesen Zauber nur nachts wirken. Wähle bis zu drei Leichen von Humanoiden kleiner oder mittelgroßer Größe in Reichweite aus. Jede Leiche wird zu einem Ghul unter deiner Kontrolle (den Wertekasten findest du unter „Monster“). Als Bonusaktion in jedem deiner Züge kannst du jede untote Kreatur, die du mit diesem Zauber erschaffen hast und die sich im Abstand von bis zu 36 Metern von dir befindet, mental befehligen. Handelt es sich um mehrere Kreaturen, so kannst du beliebig viele von ihnen gleichzeitig befehligen, wobei jeweils der gleiche Befehl erteilt wird. Du entscheidest über die Aktion und die Bewegung der Kreatur in ihrem nächsten Zug. Alternativ kannst du einen allgemeinen Befehl erteilen, beispielsweise einen bestimmten Ort zu bewachen. Wenn du keine Befehle erteilst, führt die Kreatur die Ausweichaktion aus und bewegt sich nur, um Schaden zu vermeiden. Sobald die Kreatur einen Befehl erhalten hat, führt sie ihn aus, bis die Aufgabe abgeschlossen ist. Die Kreatur steht 24 Stunden lang unter deiner Kontrolle. Danach folgt sie keinem deiner Befehle mehr. Um die Kontrolle über die Kreatur für weitere 24 Stunden zu behalten, musst du diesen Zauber erneut auf die Kreatur wirken, ehe die ersten 24 Stunden abgelaufen sind. In diesem Fall verlängerst du die Kontrolle über bis zu drei Kreaturen, die du mit diesem Zauber erschaffen hast, anstatt eine neue Kreatur zu erschaffen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Bei einem Zauberplatz des 7. Grades kannst du vier Ghule erschaffen oder wieder unter deine Kontrolle bringen. Bei einem Zauberplatz des 8. Grades kannst du fünf Ghule oder zwei Grule oder zwei Gruftschrecken erschaffen oder wieder unter deine Kontrolle bringen. Bei einem Zauberplatz des 9. Grades kannst du sechs Ghule oder drei Grule oder drei Gruftschrecken oder zwei Mumien erschaffen oder wieder unter deine Kontrolle bringen. Die jeweiligen Wertekästen findest du unter „Monster“."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can cast this spell only at night. Choose up to three corpses of Medium or Small Humanoids within range. Each one becomes a Ghoul under your control (see “Monsters” for its stat block). As a Bonus Action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to them). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a particular place. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow the order until its task is complete. The creature is under your control for 24 hours, after which it stops obeying any command you’ve given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell rather than animating new ones."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. If you use a level 7 spell slot, you can animate or reassert control over four Ghouls. If you use a level 8 spell slot, you can animate or reassert control over five Ghouls or two Ghasts or Wights. If you use a level 9 spell slot, you can animate or reassert control over six Ghouls, three Ghasts or Wights, or two Mummies. See “Monsters” for these stat blocks."
    }
   ]
  }
 },
 {
  "id": "creation",
  "name": {
   "de": "Erschaffung",
   "en": "Creation"
  },
  "gradzeile": {
   "de": "Illusionszauber 5. Grades (Magier, Zauberer)",
   "en": "Level 5 Illusion (Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "illusion",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Farbpinsel)",
    "dauer": "Besonders"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a paintbrush)",
    "dauer": "Special"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du ziehst Fäden aus Schattenmaterial aus dem Schattensaum und erschaffst einen Gegenstand in Reichweite. Es kann sich entweder um einen Gegenstand aus pflanzlichem Material (Textilien, Seil, Holz und dergleichen) oder um einen Gegenstand aus mineralischem Material (Stein, Kristall, Metall und dergleichen) handeln. Der Gegenstand darf nicht größer als ein Würfel mit 1,5 Metern Kantenlänge sein und muss aus einem Material bestehen sowie eine Form besitzen, die du bereits gesehen hast. Die Wirkungsdauer des Zaubers hängt vom Material des Gegenstands ab, wie in der Tabelle „Materialien“ dargestellt. Besteht der Gegenstand aus mehreren Materialien, so verwende die kürzeste Wirkungsdauer. Wenn ein mit diesem Zauber erschaffener Gegenstand als Materialkomponente für einen anderen Zauber verwendet wird, misslingt der andere Zauber."
    },
    {
     "typ": "tabelle",
     "titel": "Materialien",
     "kopf": [
      "Material",
      "Dauer"
     ],
     "reihen": [
      [
       "Pflanzliches Material",
       "24 Stunden"
      ],
      [
       "Stein oder Kristall",
       "12 Stunden"
      ],
      [
       "Edelmetalle",
       "1 Stunde"
      ],
      [
       "Edelsteine",
       "10 Minuten"
      ],
      [
       "Adamant oder Mithral",
       "1 Minute"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird der Würfel um 1,5 Meter vergrößert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You pull wisps of shadow material from the Shadowfell to create an object within range. It is either an object of vegetable matter (soft goods, rope, wood, and the like) or mineral matter (stone, crystal, metal, and the like). The object must be no larger than a 5-foot Cube, and the object must be of a form and material that you have seen. The spell’s duration depends on the object’s material, as shown in the Materials table. If the object is composed of multiple materials, use the shortest duration. Using any object created by this spell as another spell’s Material component causes the other spell to fail."
    },
    {
     "typ": "tabelle",
     "titel": "Materials",
     "kopf": [
      "Material",
      "Duration"
     ],
     "reihen": [
      [
       "Vegetable matter",
       "24 hours"
      ],
      [
       "Stone or crystal",
       "12 hours"
      ],
      [
       "Precious metals",
       "1 hour"
      ],
      [
       "Gems",
       "10 minutes"
      ],
      [
       "Adamantine or mithral",
       "1 minute"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The Cube increases by 5 feet for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "cure-wounds",
  "name": {
   "de": "Wunden heilen",
   "en": "Cure Wounds"
  },
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Barde, Druide, Kleriker, Paladin, Waldläufer)",
   "en": "Level 1 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur, die du berührst, erhält eine Anzahl von Trefferpunkten in Höhe von 2W8 plus deinem Zauberwirken-Attributsmodifikator zurück."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird die Heilung um 2W8 Trefferpunkte erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature you touch regains a number of Hit Points equal to 2d8 plus your spellcasting ability modifier."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The healing increases by 2d8 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "dancing-lights",
  "name": {
   "de": "Tanzende Lichter",
   "en": "Dancing Lights"
  },
  "gradzeile": {
   "de": "Zaubertrick der Illusion (Barde, Magier, Zauberer)",
   "en": "Illusion Cantrip (Bard, Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (etwas Phosphor)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a bit of phosphorus)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst bis zu vier Lichter in Fackelgröße in Reichweite erzeugen und als Fackeln, Laternen oder Leuchtkugeln erscheinen lassen, die für die Wirkungsdauer in der Luft schweben. Alternativ kannst du die vier Lichter zu einer leuchtenden, vage humanoiden Gestalt von mittelgroßer Größe kombinieren. Unabhängig von der Form spendet jedes Licht dämmriges Licht in einem Radius von drei Metern. Als Bonusaktion kannst du die Lichter bis zu 18 Meter weit in einen Bereich in Reichweite bewegen. Jedes Licht muss sich im Abstand von bis zu sechs Metern von einem anderen durch diesen Zauber erzeugten Licht befinden. Wenn ein Licht die Reichweite des Zaubers verlässt, erlischt es."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create up to four torch-size lights within range, making them appear as torches, lanterns, or glowing orbs that hover for the duration. Alternatively, you combine the four lights into one glowing Medium form that is vaguely humanlike. Whichever form you choose, each light sheds Dim Light in a 10foot radius. As a Bonus Action, you can move the lights up to 60 feet to a space within range. A light must be within 20 feet of another light created by this spell, and a light vanishes if it exceeds the spell’s range."
    }
   ]
  }
 },
 {
  "id": "darkness",
  "name": {
   "de": "Dunkelheit",
   "en": "Darkness"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 2 Evocation (Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, M (Fledermausfell und ein Kohlenstück)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, M (bat fur and a piece of coal)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer breitet sich magische Dunkelheit von einem Punkt in Reichweite zu einer Kugel mit einem Radius von 4,5 Metern aus. Sie kann weder mit Dunkelsicht durchdrungen noch durch nichtmagische Lichtquellen erhellt werden. Alternativ kannst du den Zauber auf einen Gegenstand wirken, der nicht getragen oder gehalten wird. In diesem Fall erfüllt die Dunkelheit eine Ausströmung von 4,5 Metern, die vom Gegenstand ausgeht. Wird der Gegenstand mit etwas Undurchsichtigem wie einer Schüssel oder einem Helm bedeckt, so wird die Dunkelheit blockiert. Wenn sich der Wirkungsbereich dieses Zaubers mit einem Bereich hellen oder dämmrigen Lichts überschneidet, das durch einen Zauber des höchstens 2. Grades erzeugt wurde, so wird der andere Zauber gebannt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, magical Darkness spreads from a point within range and fills a 15-foot-radius Sphere. Darkvision can’t see through it, and nonmagical light can’t illuminate it. Alternatively, you cast the spell on an object that isn’t being worn or carried, causing the Darkness to fill a 15-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the Darkness. If any of this spell’s area overlaps with an area of Bright Light or Dim Light created by a spell of level 2 or lower, that other spell is dispelled."
    }
   ]
  }
 },
 {
  "id": "darkvision",
  "name": {
   "de": "Dunkelsicht",
   "en": "Darkvision"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Druide, Magier, Waldläufer, Zauberer)",
   "en": "Level 2 Transmutation (Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine getrocknete Karotte)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a dried carrot)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer hat eine bereitwillige Kreatur, die du berührst, Dunkelsicht mit einer Reichweite von 45 Metern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, a willing creature you touch has Darkvision with a range of 150 feet."
    }
   ]
  }
 },
 {
  "id": "daylight",
  "name": {
   "de": "Tageslicht",
   "en": "Daylight"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 3. Grades (Druide, Kleriker, Paladin, Waldläufer, Zauberer)",
   "en": "Level 3 Evocation (Cleric, Druid, Paladin, Ranger, Sorcerer)"
  },
  "grad": 3,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer breitet sich Sonnenlicht von einem Punkt in Reichweite zu einer Kugel mit einem Radius von 18 Metern aus. Beim Bereich des Sonnenlichts handelt es sich um helles Licht. Er spendet im Radius von weiteren 18 Metern dämmriges Licht. Alternativ kannst du den Zauber auf einen Gegenstand wirken, der nicht getragen oder gehalten wird. In diesem Fall erfüllt das Sonnenlicht eine Ausströmung von 18 Metern, die vom Gegenstand ausgeht. Wird der Gegenstand mit etwas Undurchsichtigem wie einer Schüssel oder einem Helm bedeckt, so wird das Sonnenlicht blockiert. Wenn sich der Wirkungsbereich dieses Zaubers mit einem Bereich von Dunkelheit überschneidet, der durch einen Zauber des höchstens 3. Grades erzeugt wurde, so wird der andere Zauber gebannt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, sunlight spreads from a point within range and fills a 60-foot-radius Sphere. The sunlight’s area is Bright Light and sheds Dim Light for an additional 60 feet. Alternatively, you cast the spell on an object that isn’t being worn or carried, causing the sunlight to fill a 60-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the sunlight. If any of this spell’s area overlaps with an area of Darkness created by a spell of level 3 or lower, that other spell is dispelled."
    }
   ]
  }
 },
 {
  "id": "death-ward",
  "name": {
   "de": "Todesschutz",
   "en": "Death Ward"
  },
  "gradzeile": {
   "de": "Bannzauber 4. Grades (Kleriker, Paladin)",
   "en": "Level 4 Abjuration (Cleric, Paladin)"
  },
  "grad": 4,
  "schule": "bann",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur und verleihst ihr einen gewissen Schutz vor dem Tod. Wenn die Trefferpunkte des Ziels während der Wirkungsdauer erstmals auf 0 sinken würden, sinken sie stattdessen auf 1 Trefferpunkt, und der Zauber endet. Erleidet das Ziel während der Wirkungsdauer einen Effekt, der es sofort töten würde, ohne Schaden zu bewirken, so ist das Ziel nicht von diesem Effekt betroffen, und der Zauber endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points before the spell ends, the target instead drops to 1 Hit Point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantly without dealing damage, that effect is negated against the target, and the spell ends."
    }
   ]
  }
 },
 {
  "id": "delayed-blast-fireball",
  "name": {
   "de": "Spätzündender Feuerball",
   "en": "Delayed Blast Fireball"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 7. Grades (Magier, Zauberer)",
   "en": "Level 7 Evocation (Sorcerer, Wizard)"
  },
  "grad": 7,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (eine Kugel aus Fledermaus-Guano und Schwefel)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (a ball of bat guano and sulfur)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt einen gelben Lichtstrahl, der sich an einem Punkt deiner Wahl in Reichweite zu einer leuchtenden Perle verdichtet und für die Wirkungsdauer dort verweilt. Wenn der Zauber endet, explodiert die Perle, und jede Kreatur in einer Kugel mit einem Radius von sechs Metern um diesen Punkt führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur Feuerschaden in Höhe des gesamten angesammelten Schadens, anderenfalls die Hälfte. Der Grundschaden des Zaubers ist 12W6, und der Schaden wird um 1W6 erhöht, wann immer während der Wirkungsdauer einer deiner Züge endet. Wenn eine Kreatur während der Wirkungsdauer die leuchtende Perle berührt, führt die Kreatur einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so endet der Zauber, und die Perle explodiert. Bei einem erfolgreichen Rettungswurf kann die Kreatur die Perle bis zu zwölf Meter weit werfen. Gelangt die geworfene Perle in den Bereich einer Kreatur oder kollidiert sie mit einem festen Gegenstand, so endet der Zauber, und die Perle explodiert. Wenn die Perle explodiert, beginnen brennbare Gegenstände im Explosionsbereich, die nicht getragen oder gehalten werden, zu brennen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 7. wird der Grundschaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A beam of yellow light flashes from you, then condenses at a chosen point within range as a glowing bead for the duration. When the spell ends, the bead explodes, and each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw. A creature takes Fire damage equal to the total accumulated damage on a failed save or half as much damage on a successful one. The spell’s base damage is 12d6, and the damage increases by 1d6 whenever your turn ends and the spell hasn’t ended. If a creature touches the glowing bead before the spell ends, that creature makes a Dexterity saving throw. On a failed save, the spell ends, causing the bead to explode. On a successful save, the creature can throw the bead up to 40 feet. If the thrown bead enters a creature’s space or collides with a solid object, the spell ends, and the bead explodes. When the bead explodes, flammable objects in the explosion that aren’t being worn or carried start burning."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The base damage increases by 1d6 for each spell slot level above 7."
    }
   ]
  }
 },
 {
  "id": "demiplane",
  "name": {
   "de": "Halbebene",
   "en": "Demiplane"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 8. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 8 Conjuration (Sorcerer, Warlock, Wizard)"
  },
  "grad": 8,
  "schule": "beschwoerung",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "S",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst auf einer festen Oberfläche in Reichweite, die du sehen kannst, eine mittelgroße schattenhafte Tür. Diese Tür kann geöffnet und geschlossen werden. Sie führt zu einer Halbebene: einem leeren Raum mit neun Metern Kantenlänge aus Holz oder Stein (nach deiner Wahl). Wenn der Zauber endet, verschwindet die Tür, und alle Gegenstände in der Halbebene verbleiben dort. Auch Kreaturen bleiben darin, sofern sie nicht entscheiden, dass sie durch die Tür geschoben werden, wenn diese verschwindet. In diesem Fall gelangen sie in freie Bereiche, die dem Bereich der verschwundenen Tür am nächsten liegen, und sind liegend. Jedes Mal, wenn du diesen Zauber wirkst, kannst du entweder eine neue Halbebene erschaffen oder die schattenhafte Tür mit einer Halbebene verbinden, die du beim vorigen Wirken des Zaubers erschaffen hast. Sind dir außerdem Natur und Inhalt einer Halbebene bekannt, die von einer anderen Kreatur mit diesem Zauber erschaffen wurde, so kannst du die schattenhafte Tür stattdessen auch mit dieser Halbebene verbinden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a shadowy Medium door on a flat solid surface that you can see within range. This door can be opened and closed, and it leads to a demiplane that is an empty room 30 feet in each dimension, made of wood or stone (your choice). When the spell ends, the door vanishes, and any objects inside the demiplane remain there. Any creatures inside also remain unless they opt to be shunted through the door as it vanishes, landing with the Prone condition in the unoccupied spaces closest to the door’s former space. Each time you cast this spell, you can create a new demiplane or connect the shadowy door to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can connect the shadowy door to that demiplane instead."
    }
   ]
  }
 },
 {
  "id": "detect-evil-and-good",
  "name": {
   "de": "Gutes und Böses entdecken",
   "en": "Detect Evil and Good"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 1. Grades (Kleriker, Paladin)",
   "en": "Level 1 Divination (Cleric, Paladin)"
  },
  "grad": 1,
  "schule": "erkenntnis",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer spürst du, ob und wo genau sich Aberrationen, celestische Wesen, Elementare, Feenwesen, Unholde oder Untote im Abstand von bis zu neun Metern von dir befinden. Außerdem spürst du, ob und wo genau der Zauber Weihen in diesem Bereich aktiv ist. Der Zauber wird von 30 Zentimetern Stein, Erde oder Holz sowie von 2,5 Zentimetern Metall oder einer dünnen Bleischicht blockiert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you sense the location of any Aberration, Celestial, Elemental, Fey, Fiend, or Undead within 30 feet of yourself. You also sense whether the Hallow spell is active there and, if so, where. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
    }
   ]
  }
 },
 {
  "id": "detect-magic",
  "name": {
   "de": "Magie entdecken",
   "en": "Detect Magic"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 1. Grades (Barde, Druide, Hexenmeister, Kleriker, Magier, Paladin, Waldläufer, Zauberer)",
   "en": "Level 1 Divination (Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "kleriker",
   "magier",
   "paladin",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Während der Wirkungsdauer nimmst du magische Effekte im Abstand von bis zu neun Metern von dir wahr. Wenn du magische Effekte wahrnimmst, kannst du die magische Aktion ausführen, um rund um sichtbare Kreaturen und Gegenstände im Bereich, auf welche die Magie wirkt, eine schwache Aura zu sehen. Wurde der Effekt durch einen Zauber hervorgerufen, so erkennst du dessen Schule der Magie. Der Zauber wird von 30 Zentimetern Stein, Erde oder Holz sowie von 2,5 Zentimetern Metall oder einer dünnen Bleischicht blockiert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the Magic action to see a faint aura around any visible creature or object in the area that bears the magic, and if an effect was created by a spell, you learn the spell’s school of magic. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
    }
   ]
  }
 },
 {
  "id": "detect-poison-and-disease",
  "name": {
   "de": "Gift und Krankheit entdecken",
   "en": "Detect Poison and Disease"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 1. Grades (Druide, Kleriker, Paladin, Waldläufer)",
   "en": "Level 1 Divination (Cleric, Druid, Paladin, Ranger)"
  },
  "grad": 1,
  "schule": "erkenntnis",
  "klassen": [
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Eibenblatt)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S, M (a yew leaf)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer nimmst du die Position von Giften, giftigen Kreaturen und magischen Krankheiten im Abstand von bis zu neun Metern von dir wahr. Du erkennst auch die jeweilige Art des Gifts, der giftigen Kreatur oder der Ansteckung. Der Zauber wird von 30 Zentimetern Stein, Erde oder Holz sowie von 2,5 Zentimetern Metall oder einer dünnen Bleischicht blockiert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you sense the location of poisons, poisonous or venomous creatures, and magical contagions within 30 feet of yourself. You sense the kind of poison, creature, or contagion in each case. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
    }
   ]
  }
 },
 {
  "id": "detect-thoughts",
  "name": {
   "de": "Gedanken wahrnehmen",
   "en": "Detect Thoughts"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 2. Grades (Barde, Magier, Zauberer)",
   "en": "Level 2 Divination (Bard, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (1 Kupfermünze)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (1 Copper Piece)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du aktivierst einen der nachstehenden Effekte. Bis der Zauber endet, kannst du jeweils einen der Effekte als magische Aktion in deinen folgenden Zügen aktivieren."
    },
    {
     "typ": "punkt",
     "text": "Gedanken spüren: Du spürst Gedanken von Kreaturen im Abstand von bis zu neun Metern von dir, die Sprachen oder Telepathie beherrschen. Du kannst die Gedanken zwar nicht lesen, weißt aber, dass eine denkende Kreatur anwesend ist. Der Zauber wird von 30 Zentimetern Stein, Erde oder Holz sowie von 2,5 Zentimetern Metall oder einer dünnen Bleischicht blockiert."
    },
    {
     "typ": "punkt",
     "text": "Gedanken lesen: Ziele auf eine Kreatur im Abstand von bis zu neun Metern von dir, die du sehen kannst oder mit der Option Gedanken spüren entdeckt hast. Du erfährst, was die Kreatur im Augenblick am meisten beschäftigt. Wenn das Ziel weder Sprachen noch Telepathie beherrscht, erfährst du nichts. Als magische Aktion im nächsten Zug kannst du versuchen, tiefer in den Verstand des Ziels einzudringen. In diesem Fall führt das Ziel einen Weisheitsrettungswurf aus. Misslingt der Wurf, so erhältst du Einsicht in seine Beweggründe und Emotionen sowie in etwas, das seine Gedanken beherrscht (beispielsweise Sorgen, Liebe oder Hass) Bei einem erfolgreichen Rettungswurf endet der Zauber. In jedem Fall merkt das Ziel, dass du in seinen Verstand eindringst. Solange du deine Aufmerksamkeit auf seinen Verstand richtest, kann es als Aktion in seinem Zug einen Intelligenzwurf (Arkane Kunde) gegen deinen Zauberrettungswurf‑SG ausführen. Bei einem Erfolg endet der Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You activate one of the effects below. Until the spell ends, you can activate either effect as a Magic action on your later turns."
    },
    {
     "typ": "punkt",
     "text": "Sense Thoughts. You sense the presence of thoughts within 30 feet of yourself that belong to creatures that know languages or are telepathic. You don’t read the thoughts, but you know that a thinking creature is present. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
    },
    {
     "typ": "punkt",
     "text": "Read Thoughts. Target one creature you can see within 30 feet of yourself or one creature within 30 feet of yourself that you detected with the Sense Thoughts option. You learn what is most on the target’s mind right now. If the target doesn’t know any languages and isn’t telepathic, you learn nothing. As a Magic action on your next turn, you can try to probe deeper into the target’s mind. If you probe deeper, the target makes a Wisdom saving throw. On a failed save, you discern the target’s reasoning, emotions, and something that looms large in its mind (such as a worry, love, or hate). On a successful save, the spell ends. Either way, the target knows that you are probing into its mind, and until you shift your attention away from the target’s mind, the target can take an action on its turn to make an Intelligence (Arcana) check against your spell save DC, ending the spell on a success."
    }
   ]
  }
 },
 {
  "id": "dimension-door",
  "name": {
   "de": "Dimensionstür",
   "en": "Dimension Door"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 4 Conjuration (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "150 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "500 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du teleportierst dich an einen Ort in Reichweite. Dabei triffst du genau am gewünschten Punkt ein. Es kann sich um einen Zielort handeln, den du sehen oder dir vorstellen kannst oder den du beschreibst, indem du Entfernung und Richtung angibst (beispielsweise „60 Meter senkrecht nach unten“ oder „90 Meter nach Nordosten in einem 45‑Grad‑Winkel nach oben“). Du kannst zusätzlich eine bereitwillige Kreatur teleportieren. Diese muss sich im Abstand von bis zu 1,5 Metern von dir befinden, wenn du dich teleportierst. Sie gelangt in einen Bereich im Abstand von bis zu 1,5 Metern von deinem Zielbereich. Wenn mindestens einer von euch in einem Bereich eintreffen würde, der bereits vollständig von Gegenständen oder Kreaturen besetzt ist, erleidet ihr jeweils 4W6 Energieschaden, und die Teleportation misslingt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You teleport to a location within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as “200 feet straight downward” or “300 feet upward to the northwest at a 45-degree angle.” You can also teleport one willing creature. The creature must be within 5 feet of you when you teleport, and it teleports to a space within 5 feet of your destination space. If you, the other creature, or both would arrive in a space occupied by a creature or completely filled by one or more objects, you and any creature traveling with you each take 4d6 Force damage, and the teleportation fails."
    }
   ]
  }
 },
 {
  "id": "disguise-self",
  "name": {
   "de": "Selbstverkleidung",
   "en": "Disguise Self"
  },
  "gradzeile": {
   "de": "Illusionszauber 1. Grades (Barde, Magier, Zauberer)",
   "en": "Level 1 Illusion (Bard, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du veränderst dein Aussehen einschließlich Kleidung, Rüstung, Waffen und anderer Habseligkeiten, bis der Zauber endet oder du ihn mit einer Aktion beendest. Du kannst 30 Zentimeter größer oder kleiner sowie schwerer oder leichter erscheinen. Allerdings musst du eine Gestalt mit der gleichen Grundanordnung von Gliedmaßen annehmen. Abgesehen davon sind die Einzelheiten der Illusion dir überlassen. Einer genauen körperlichen Untersuchung halten die Veränderungen dieser Illusion nicht stand. Wenn du diesen Zauber beispielsweise nutzt, um dir einen Hut aufzusetzen, durchdringen Gegenstände diesen einfach. Will jemand den Hut berühren, so fühlt er dort nichts. Um deine Verkleidung als solche zu erkennen, muss eine Kreatur die Studieren‑Aktion ausführen, um dein Erscheinungsbild zu untersuchen, und einen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG bestehen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You make yourself—including your clothing, armor, weapons, and other belongings on your person— look different until the spell ends. You can seem 1 foot shorter or taller and can appear heavier or lighter. You must adopt a form that has the same basic arrangement of limbs as you have. Otherwise, the extent of the illusion is up to you. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing. To discern that you are disguised, a creature must take the Study action to inspect your appearance and succeed on an Intelligence (Investigation) check against your spell save DC."
    }
   ]
  }
 },
 {
  "id": "disintegrate",
  "name": {
   "de": "Auflösung",
   "en": "Disintegrate"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 6. Grades (Magier, Zauberer)",
   "en": "Level 6 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Magnetstein und Staub)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a lodestone and dust)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt einen dünnen grünen Strahl auf ein Ziel in Reichweite, das du sehen kannst. Das Ziel kann eine Kreatur, ein nichtmagischer Gegenstand oder eine Struktur aus magischer Energie sein, beispielsweise die Wand des Zaubers Energiewand. Eine Kreatur, die zum Ziel dieses Zaubers wird, führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet das Ziel 10W6+40 Energieschaden. Wenn seine Trefferpunkte durch diesen Schaden auf 0 sinken, zerfällt es mitsamt jeder nichtmagischen Ausrüstung, die es trägt oder hält, zu grauem Staub. Das Ziel kann nur durch die Zauber Wahre Auferstehung und Wunsch wiederbelebt werden. Nichtmagische Gegenstände von höchstens großer Größe sowie Strukturen aus magischer Energie werden von diesem Zauber automatisch aufgelöst. Wenn das Ziel von mindestens riesiger Größe ist, löst dieser Zauber einen Würfel mit drei Metern Kantenlänge davon auf."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. wird der Schaden um 3W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You launch a green ray at a target you can see within range. The target can be a creature, a nonmagical object, or a creation of magical force, such as the wall created by Wall of Force. A creature targeted by this spell makes a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 Force damage. If this damage reduces it to 0 Hit Points, it and everything nonmagical it is wearing and carrying are disintegrated into gray dust. The target can be revived only by a True Resurrection or a Wish spell. This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If such a target is Huge or larger, this spell disintegrates a 10-foot-Cube portion of it."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 3d6 for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "dispel-evil-and-good",
  "name": {
   "de": "Gutes und Böses bannen",
   "en": "Dispel Evil and Good"
  },
  "gradzeile": {
   "de": "Bannzauber 5. Grades (Kleriker, Paladin)",
   "en": "Level 5 Abjuration (Cleric, Paladin)"
  },
  "grad": 5,
  "schule": "bann",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (Silber- und Eisenpulver)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (powdered silver and iron)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer sind celestische Wesen, Elementare, Feenwesen, Unholde und Untote bei Angriffswürfen gegen dich im Nachteil. Du kannst den Zauber vorzeitig beenden, indem du einen der folgenden besonderen Effekte verwendest:"
    },
    {
     "typ": "punkt",
     "text": "Vertreiben: Als magische Aktion zielst du auf eine Kreatur im Abstand von bis zu 1,5 Metern von dir, die du sehen kannst und die einen der genannten Kreaturentypen hat. Das Ziel muss einen Charismarettungswurf bestehen, oder es wird auf seine Heimatebene verbannt, sofern es sich nicht bereits dort befindet. Untote werden in den Schattensaum und Feenwesen in die Feenwildnis verbannt, sofern sie sich nicht schon auf ihrer Heimatebene befinden."
    },
    {
     "typ": "punkt",
     "text": "Verzauberungsmagie brechen: Als magische Aktion berührst du eine Kreatur in Reichweite, die von mindestens einer solchen Kreatur bezaubert, verängstigt oder besessen ist. Das Ziel ist nun nicht mehr von solchen Kreaturen besessen, bezaubert oder verängstigt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, Celestials, Elementals, Fey, Fiends, and Undead have Disadvantage on attack rolls against you. You can end the spell early by using either of the following special functions."
    },
    {
     "typ": "punkt",
     "text": "Break Enchantment. As a Magic action, you touch a creature that is possessed by or has the Charmed or Frightened condition from one or more creatures of the types above. The target is no longer possessed, Charmed, or Frightened by such creatures."
    },
    {
     "typ": "punkt",
     "text": "Dismissal. As a Magic action, you target one creature you can see within 5 feet of you that has one of the creature types above. The target must succeed on a Charisma saving throw or be sent back to its home plane if it isn’t there already. If they aren’t on their home plane, Undead are sent to the Shadowfell, and Fey are sent to the Feywild."
    }
   ]
  }
 },
 {
  "id": "dispel-magic",
  "name": {
   "de": "Magie bannen",
   "en": "Dispel Magic"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Barde, Druide, Hexenmeister, Kleriker, Magier, Paladin, Waldläufer, Zauberer)",
   "en": "Level 3 Abjuration (Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "kleriker",
   "magier",
   "paladin",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle eine Kreatur, einen Gegenstand oder einen magischen Effekt in Reichweite aus. Jeder Zauber des höchstens 3. Grades, der aktuell auf das Ziel wirkt, wird beendet. Führe für jeden Zauber des mindestens 4. Grades, der auf das Ziel wirkt, einen Attributswurf mit deinem Attribut zum Zauberwirken (SG 10 plus Zaubergrad) aus. Bei einem Erfolg endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Du beendest automatisch einen Zauber, der auf das Ziel wirkt, wenn dessen Grad höchstens dem des Zauberplatzes entspricht, den du verwendest."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose one creature, object, or magical effect within range. Any ongoing spell of level 3 or lower on the target ends. For each ongoing spell of level 4 or higher on the target, make an ability check using your spellcasting ability (DC 10 plus that spell’s level). On a successful check, the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You automatically end a spell on the target if the spell’s level is equal to or less than the level of the spell slot you use."
    }
   ]
  }
 },
 {
  "id": "dissonant-whispers",
  "name": {
   "de": "Dissonantes Flüstern",
   "en": "Dissonant Whispers"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde)",
   "en": "Level 1 Enchantment (Bard)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur deiner Wahl in Reichweite, die du sehen kannst, hört im Geiste eine misstönende Melodie. Das Ziel führt einen Weisheitsrettungswurf aus. Misslingt der Wurf, so erleidet das Ziel 3W6 psychischen Schaden und muss sofort seine Reaktion verwenden, sofern verfügbar, um sich so weit wie möglich von dir zu entfernen. Dabei nimmt es die sicherste Route. Bei einem erfolgreichen Rettungswurf erleidet das Ziel nur halb so viel Schaden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature of your choice that you can see within range hears a discordant melody in its mind. The target makes a Wisdom saving throw. On a failed save, it takes 3d6 Psychic damage and must immediately use its Reaction, if available, to move as far away from you as it can, using the safest route. On a successful save, the target takes half as much damage only."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "divination",
  "name": {
   "de": "Weissagung",
   "en": "Divination"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 4. Grades (Druide, Kleriker, Magier)",
   "en": "Level 4 Divination (Cleric, Druid, Wizard)"
  },
  "grad": 4,
  "schule": "erkenntnis",
  "klassen": [
   "druide",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (Weihrauch im Wert von mindestens 25 GM, den der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S, M (incense worth 25+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber bringt dich mit einem Gott oder dem Diener eines Gottes in Kontakt. Du stellst eine Frage zu einem bestimmten Ziel, einem Ereignis oder einer Aktivität der kommenden sieben Tage. Der SL antwortet wahrheitsgemäß in Form eines kurzen Satzes oder eines kryptischen Reims. Der Zauber berücksichtigt keinerlei Umstände, die das Ergebnis ändern könnten, beispielsweise das Wirken anderer Zauber. Wenn du den Zauber vor einer langen Rast häufiger als einmal wirkst, erhöht dies das Risiko, keine Antwort zu erhalten, mit jedem Wirken nach dem ersten um jeweils 25 Prozent."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell puts you in contact with a god or a god’s servants. You ask one question about a specific goal, event, or activity to occur within 7 days. The GM offers a truthful reply, which might be a short phrase or cryptic rhyme. The spell doesn’t account for circumstances that might change the answer, such as the casting of other spells. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer."
    }
   ]
  }
 },
 {
  "id": "divine-favor",
  "name": {
   "de": "Göttliche Gunst",
   "en": "Divine Favor"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 1. Grades (Paladin)",
   "en": "Level 1 Transmutation (Paladin)"
  },
  "grad": 1,
  "schule": "verwandlung",
  "klassen": [
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer bewirkst du mit Angriffen, die du mit Waffen ausführst, bei jedem Treffer zusätzlich 1W4 gleißenden Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, your attacks with weapons deal an extra 1d4 Radiant damage on a hit."
    }
   ]
  }
 },
 {
  "id": "divine-smite",
  "name": {
   "de": "Göttliches Niederstrecken",
   "en": "Divine Smite"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Paladin)",
   "en": "Level 1 Evocation (Paladin)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion, die du sofort ausführst, wenn du ein Ziel mit einer Nahkampfwaffe oder einem waffenlosen Angriff getroffen hast",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Bonus Action, which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Das Ziel erleidet zusätzlich 2W8 gleißenden Schaden durch den Angriff. Der zusätzliche Schaden wird um 1W8 erhöht, wenn das Ziel ein Unhold oder ein Untoter ist."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The target takes an extra 2d8 Radiant damage from the attack. The damage increases by 1d8 if the target is a Fiend or an Undead."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "divine-word",
  "name": {
   "de": "Göttliches Wort",
   "en": "Divine Word"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 7. Grades (Kleriker)",
   "en": "Level 7 Evocation (Cleric)"
  },
  "grad": 7,
  "schule": "hervorrufung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "9 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "30 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du sprichst ein Wort, das von der Macht der Oberen Ebenen erfüllt ist. Jede Kreatur deiner Wahl in Reichweite führt einen Charismarettungswurf aus. Misslingt der Wurf, so erleidet ein Ziel mit höchstens 50 Trefferpunkten einen Effekt gemäß seiner aktuellen Trefferpunkte wie in der Tabelle „Effekte von Göttliches Wort“ gezeigt. Unabhängig von ihren Trefferpunkten werden Ziele, die celestische Wesen, Elementare, Feenwesen oder Unholde sind und deren Rettungswurf misslingt, auf ihre Heimatebene verbannt, sofern sie sich nicht bereits dort befinden. In den nächsten 24 Stunden können sie nur mit dem Zauber Wunsch auf deine aktuelle Ebene zurückkehren."
    },
    {
     "typ": "tabelle",
     "titel": "Effekte von Göttliches Wort",
     "kopf": [
      "Trefferpunkte",
      "Effekt"
     ],
     "reihen": [
      [
       "0–20",
       "Das Ziel stirbt."
      ],
      [
       "21–30",
       "Das Ziel ist eine Stunde lang betäubt, blind und taub."
      ],
      [
       "31–40",
       "Das Ziel ist zehn Minuten lang blind und taub."
      ],
      [
       "41–50",
       "Das Ziel ist eine Minute lang taub."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You utter a word imbued with power from the Upper Planes. Each creature of your choice in range makes a Charisma saving throw. On a failed save, a target that has 50 Hit Points or fewer suffers an effect based on its current Hit Points, as shown in the Divine Word Effects table. Regardless of its Hit Points, a Celestial, an Elemental, a Fey, or a Fiend target that fails its save is forced back to its plane of origin (if it isn’t there already) and can’t return to the current plane for 24 hours by any means short of a Wish spell."
    },
    {
     "typ": "tabelle",
     "titel": "Divine Word Effects",
     "kopf": [
      "Hit Points",
      "Effect"
     ],
     "reihen": [
      [
       "0–20",
       "The target dies."
      ],
      [
       "21–30",
       "The target has the Blinded, Deafened, and Stunned conditions for 1 hour."
      ],
      [
       "31–40",
       "The target has the Blinded and Deafened conditions for 10 minutes."
      ],
      [
       "41–50",
       "The target has the Deafened condition for 1 minute."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "dominate-beast",
  "name": {
   "de": "Tier beherrschen",
   "en": "Dominate Beast"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 4. Grades (Druide, Waldläufer, Zauberer)",
   "en": "Level 4 Enchantment (Druid, Ranger, Sorcerer)"
  },
  "grad": 4,
  "schule": "verzauberung",
  "klassen": [
   "druide",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Tier in Reichweite, das du sehen kannst, muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer bezaubert. Wenn du oder deine Verbündeten gegen das Ziel kämpfen, ist es beim Rettungswurf im Vorteil. Wann immer das Ziel Schaden erleidet, wiederholt es den Rettungswurf. Bei einem Erfolg endet der Zauber bei ihm. Du verfügst über eine telepathische Verbindung mit dem bezauberten Ziel, solange ihr euch auf derselben Existenzebene befindet. Diese Verbindung kannst du in deinem Zug nutzen, um dem Ziel Befehle zu erteilen (keine Aktion erforderlich), beispielsweise „Greife diese Kreatur an“, „Laufe dorthin“ oder „Hole diesen Gegenstand“. Das Ziel gehorcht in seinem Zug, so gut es kann. Wenn es den Befehl ausgeführt hat und keine weiteren Anweisungen von dir erhält, verhält es sich nach seinen Wünschen und versucht vor allem, sich zu schützen. Du kannst dem Ziel befehlen, eine Reaktion auszuführen, musst dazu allerdings selbst eine Reaktion ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Deine Konzentration kann länger andauern: bei einem Zauberplatz des 5. Grades bis zu zehn Minuten, bei einem Zauberplatz des 6. Grades bis zu einer Stunde und bei einem Zauberplatz ab dem 7. Grad bis zu acht Stunden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One Beast you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as “Attack that creature,” “Move over there,” or “Fetch that object.” The target does its best to obey on its turn. If it completes an order and doesn’t receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction but must take your own Reaction to do so."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 5 (up to 10 minutes), 6 (up to 1 hour), or 7+ (up to 8 hours)."
    }
   ]
  }
 },
 {
  "id": "dominate-monster",
  "name": {
   "de": "Monster beherrschen",
   "en": "Dominate Monster"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 8. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 8 Enchantment (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 8,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur deiner Wahl in Reichweite, die du sehen kannst, muss einen Weisheitsrettungswurf bestehen, oder sie ist für die Wirkungsdauer bezaubert. Wenn du oder deine Verbündeten gegen das Ziel kämpfen, ist es beim Rettungswurf im Vorteil. Wann immer das Ziel Schaden erleidet, wiederholt es den Rettungswurf. Bei einem Erfolg endet der Zauber bei ihm. Du verfügst über eine telepathische Verbindung mit dem bezauberten Ziel, solange ihr euch auf derselben Existenzebene befindet. Diese Verbindung kannst du in deinem Zug nutzen, um dem Ziel Befehle zu erteilen (keine Aktion erforderlich), beispielsweise „Greife diese Kreatur an“, „Laufe dorthin“ oder „Hole diesen Gegenstand“. Das Ziel gehorcht in seinem Zug, so gut es kann. Wenn es den Befehl ausgeführt hat und keine weiteren Anweisungen von dir erhält, verhält es sich nach seinen Wünschen und versucht vor allem, sich zu schützen. Du kannst dem Ziel befehlen, eine Reaktion auszuführen, musst dazu allerdings selbst eine Reaktion ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Deine Konzentration kann länger andauern: bei einem Zauberplatz des 9. Grades bis zu acht Stunden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as “Attack that creature,” “Move over there,” or “Fetch that object.” The target does its best to obey on its turn. If it completes an order and doesn’t receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction but must take your own Reaction to do so."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a level 9 spell slot (up to 8 hours)."
    }
   ]
  }
 },
 {
  "id": "dominate-person",
  "name": {
   "de": "Person beherrschen",
   "en": "Dominate Person"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 5. Grades (Barde, Magier, Zauberer)",
   "en": "Level 5 Enchantment (Bard, Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Humanoide deiner Wahl in Reichweite, den du sehen kannst, muss einen Weisheitsrettungswurf bestehen, oder er ist für die Wirkungsdauer bezaubert. Wenn du oder deine Verbündeten gegen das Ziel kämpfen, ist es beim Rettungswurf im Vorteil. Wann immer das Ziel Schaden erleidet, wiederholt es den Rettungswurf. Bei einem Erfolg endet der Zauber bei ihm. Du verfügst über eine telepathische Verbindung mit dem bezauberten Ziel, solange ihr euch auf derselben Existenzebene befindet. Diese Verbindung kannst du in deinem Zug nutzen, um dem Ziel Befehle zu erteilen (keine Aktion erforderlich), beispielsweise „Greife diese Kreatur an“, „Laufe dorthin“ oder „Hole diesen Gegenstand“. Das Ziel gehorcht in seinem Zug, so gut es kann. Wenn es den Befehl ausgeführt hat und keine weiteren Anweisungen von dir erhält, verhält es sich nach seinen Wünschen und versucht vor allem, sich zu schützen. Du kannst dem Ziel befehlen, eine Reaktion auszuführen, musst dazu allerdings selbst eine Reaktion ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Deine Konzentration kann länger andauern: bei einem Zauberplatz des 6. Grades bis zu zehn Minuten, bei einem Zauberplatz des 7. Grades bis zu einer Stunde und bei einem Zauberplatz ab dem 8. Grad bis zu acht Stunden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One Humanoid you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as “Attack that creature,” “Move over there,” or “Fetch that object.” The target does its best to obey on its turn. If it completes an order and doesn’t receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction but must take your own Reaction to do so."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 6 (up to 10 minutes), 7 (up to 1 hour), or 8+ (up to 8 hours)."
    }
   ]
  }
 },
 {
  "id": "dragon-s-breath",
  "name": {
   "de": "Drachenodem",
   "en": "Dragon’s Breath"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Magier, Zauberer)",
   "en": "Level 2 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine scharfe Pfefferschote)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a hot pepper)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur und wählst Blitz, Feuer, Gift, Kälte oder Säure aus. Bis der Zauber endet, kann das Ziel eine magische Aktion ausführen, um einen Kegel von 4,5 Metern auszuatmen. Jede Kreatur in diesem Bereich führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 3W6 Schaden der ausgewählten Art, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch one willing creature, and choose Acid, Cold, Fire, Lightning, or Poison. Until the spell ends, the target can take a Magic action to exhale a 15-foot Cone. Each creature in that area makes a Dexterity saving throw, taking 3d6 damage of the chosen type on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "dream",
  "name": {
   "de": "Traum",
   "en": "Dream"
  },
  "gradzeile": {
   "de": "Illusionszauber 5. Grades (Barde, Hexenmeister, Magier)",
   "en": "Level 5 Illusion (Bard, Warlock, Wizard)"
  },
  "grad": 5,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "Besonders",
    "komponenten": "V, G, M (eine Handvoll Sand)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "Special",
    "komponenten": "V, S, M (a handful of sand)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du zielst auf eine Kreatur, die du kennst und die sich auf derselben Existenzebene befindet wie du. Der Zauber versetzt dich selbst oder eine bereitwillige Kreatur, die du berührst, in eine Trance, um als Traumbote zu fungieren. In der Trance ist der Bote kampfunfähig und hat eine Bewegungsrate von 0. Wenn das Ziel schläft, erscheint der Bote in seinen Träumen und kann für die Wirkungsdauer des Zaubers mit ihm sprechen. Der Bote kann zudem die Umgebung des Traums gestalten und Landschaften, Gegenstände oder andere Bilder erschaffen. Der Bote kann die Trance und damit den Zauber jederzeit beenden. Das Ziel erinnert sich beim Aufwachen genau an den Traum. Ist das Ziel wach, wenn du den Zauber wirkst, so weiß der Bote dies und kann entweder die Trance (und den Zauber) beenden oder warten, bis das Ziel schläft, und dann in dessen Träumen erscheinen. Du kannst den Boten für das Ziel furchteinflößend erscheinen lassen. In diesem Fall kann der Bote eine Nachricht von höchstens zehn Worten übermitteln. Dann führt das Ziel einen Weisheitsrettungswurf aus. Misslingt der Wurf, so gewährt die Rast dem Ziel keine Vorzüge, und es erleidet beim Erwachen 3W6 psychischen Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You target a creature you know on the same plane of existence. You or a willing creature you touch enters a trance state to act as a dream messenger. While in the trance, the messenger is Incapacitated and has a Speed of 0. If the target is asleep, the messenger appears in the target’s dreams and can converse with the target as long as it remains asleep, through the spell’s duration. The messenger can also shape the dream’s environment, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the spell. The target recalls the dream perfectly upon waking. If the target is awake when you cast the spell, the messenger knows it and can either end the trance (and the spell) or wait for the target to sleep, at which point the messenger enters its dreams. You can make the messenger terrifying to the target. If you do so, the messenger can deliver a message of no more than ten words, and then the target makes a Wisdom saving throw. On a failed save, the target gains no benefit from its rest, and it takes 3d6 Psychic damage when it wakes up."
    }
   ]
  }
 },
 {
  "id": "druidcraft",
  "name": {
   "de": "Druidenkunst",
   "en": "Druidcraft"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verwandlung (Druide)",
   "en": "Transmutation Cantrip (Druid)"
  },
  "grad": 0,
  "schule": "verwandlung",
  "klassen": [
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du flüsterst den Geistern der Natur zu und erzeugst in Reichweite einen der folgenden magischen Effekte."
    },
    {
     "typ": "punkt",
     "text": "Wettersensor: Du erschaffst einen winzigen, harmlosen sensorischen Effekt, der das Wetter an deinem Aufenthaltsort in den nächsten 24 Stunden vorhersagt. Der Effekt kann sich als goldene Kugel für einen wolkenlosen Himmel, als Wolke für Regen, als Schneeflocken für Schnee oder dergleichen manifestieren. Dieser Effekt hält eine Runde lang an."
    },
    {
     "typ": "punkt",
     "text": "Erblühen: Du bewirkst, dass sofort eine Blume erblüht, sich eine Samenkapsel oder eine Blattknospe öffnet."
    },
    {
     "typ": "punkt",
     "text": "Sensorischer Effekt: Du erzeugst einen harmlosen sensorischen Effekt, beispielsweise fallende Blätter, geisterhafte tanzende Feenwesen, eine sanfte Brise, die Geräusche eines Tieres oder leichten Stinktiergeruch. Der Effekt muss in einen Würfel mit 1,5 Metern Kantenlänge passen."
    },
    {
     "typ": "punkt",
     "text": "Feuerspiel: Du entzündest oder löschst eine Kerze, eine Fackel oder ein Lagerfeuer."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Whispering to the spirits of nature, you create one of the following effects within range."
    },
    {
     "typ": "punkt",
     "text": "Weather Sensor. You create a Tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours. The effect might manifest as a golden orb for clear skies, a cloud for rain, falling snowflakes for snow, and so on. This effect persists for 1 round."
    },
    {
     "typ": "punkt",
     "text": "Bloom. You instantly make a flower blossom, a seed pod open, or a leaf bud bloom."
    },
    {
     "typ": "punkt",
     "text": "Sensory Effect. You create a harmless sensory effect, such as falling leaves, spectral dancing fairies, a gentle breeze, the sound of an animal, or the faint odor of skunk. The effect must fit in a 5-foot Cube."
    },
    {
     "typ": "punkt",
     "text": "Fire Play. You light or snuff out a candle, a torch, or a campfire."
    }
   ]
  }
 },
 {
  "id": "earthquake",
  "name": {
   "de": "Erdbeben",
   "en": "Earthquake"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 8. Grades (Druide, Kleriker, Zauberer)",
   "en": "Level 8 Transmutation (Cleric, Druid, Sorcerer)"
  },
  "grad": 8,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "150 Meter",
    "komponenten": "V, G, M (ein geborstener Stein)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "500 feet",
    "komponenten": "V, S, M (a fractured rock)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle einen Punkt in Reichweite auf dem Boden aus, den du sehen kannst. Für die Wirkungsdauer erschüttert ein gewaltiges Beben die Erde in einem Radius von 30 Metern um diesen Punkt. Der Boden dort ist schwieriges Gelände. Wenn du diesen Zauber wirkst, sowie am Ende jedes deiner Züge während der Wirkungsdauer, führt jede Kreatur auf dem Boden in dem Bereich einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so wird die Kreatur umgestoßen und hat den Zustand Liegend, und ihre Konzentration ist unterbrochen. Du kannst außerdem die folgenden Effekte bewirken."
    },
    {
     "typ": "punkt",
     "text": "Erdspalten: Am Ende des Zugs, in dem du den Zauber wirkst, öffnen sich insgesamt 1W6 Erdspalten im Wirkungsbereich. Du wählst die Orte der Erdspalten aus. Sie können sich nicht unter Gebäuden öffnen. Jede Erdspalte ist 1W10 mal drei Meter tief, drei Meter breit und erstreckt sich von einem Rand des Wirkungsbereichs zu einem anderen. Eine Kreatur, die sich im Bereich einer Erdspalte befindet, muss einen Geschicklichkeitsrettungswurf bestehen, oder sie fällt hinein. Ist der Rettungswurf erfolgreich, so bewegt die Kreatur sich mit dem Rand der Erdspalte, während sich diese öffnet."
    },
    {
     "typ": "punkt",
     "text": "Gebäude: Wenn du den Zauber wirkst, sowie am Ende jedes deiner Züge für die Wirkungsdauer, fügt das Beben allen Gebäuden, die den Boden im Wirkungsbereich berühren, 50 Wuchtschaden zu. Wenn die Trefferpunkte eines Gebäudes auf 0 sinken, stürzt das Gebäude ein. Jede Kreatur im Abstand von bis zur halben Höhe des Gebäudes führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 12W6 Wuchtschaden, wird umgestoßen und ist unter den Trümmern begraben. Sie muss einen SG‑20‑Stärkewurf (Athletik) als Aktion bestehen, um sich zu befreien. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur nur halb so viel Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point. The ground there is Difficult Terrain. When you cast this spell and at the end of each of your turns for the duration, each creature on the ground in the area makes a Dexterity saving throw. On a failed save, a creature has the Prone condition, and its Concentration is broken. You can also cause the effects below."
    },
    {
     "typ": "punkt",
     "text": "Fissures. A total of 1d6 fissures open in the spell’s area at the end of the turn you cast it. You choose the fissures’ locations, which can’t be under structures. Each fissure is 1d10 × 10 feet deep and 10 feet wide, and it extends from one edge of the spell’s area to another edge. A creature in the same space as a fissure must succeed on a Dexterity saving throw or fall in. A creature that successfully saves moves with the fissure’s edge as it opens."
    },
    {
     "typ": "punkt",
     "text": "Structures. The tremor deals 50 Bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the end of each of your turns until the spell ends. If a structure drops to 0 Hit Points, it collapses. A creature within a distance from a collapsing structure equal to half the structure’s height makes a Dexterity saving throw. On a failed save, the creature takes 12d6 Bludgeoning damage, has the Prone condition, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. On a successful save, the creature takes half as much damage only."
    }
   ]
  }
 },
 {
  "id": "eldritch-blast",
  "name": {
   "de": "Schauriger Strahl",
   "en": "Eldritch Blast"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Hexenmeister)",
   "en": "Evocation Cantrip (Warlock)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "hexenmeister"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst einen Strahl aus knisternder Energie. Führe einen Fernkampf‑Zauberangriff gegen eine Kreatur oder einen Gegenstand in Reichweite aus. Bei einem Treffer erleidet das Ziel 1W10 Energieschaden."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Zauber erzeugt mehr Strahlen, wenn du die 5. (zwei Strahlen), die 11. (drei Strahlen) und die 17. (vier Strahlen) Stufe erreichst. Du kannst die Strahlen alle auf dasselbe Ziel oder auf jeweils unterschiedliche Ziele lenken. Führe für jeden Strahl einen eigenen Angriffswurf aus."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You hurl a beam of crackling energy. Make a ranged spell attack against one creature or object in range. On a hit, the target takes 1d10 Force damage."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The spell creates two beams at level 5, three beams at level 11, and four beams at level 17. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam."
    }
   ]
  }
 },
 {
  "id": "elementalism",
  "name": {
   "de": "Elementalismus",
   "en": "Elementalism"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verwandlung (Druide, Magier, Zauberer)",
   "en": "Transmutation Cantrip (Druid, Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kontrollierst die Elemente und erzeugst in Reichweite einen der folgenden Effekte."
    },
    {
     "typ": "punkt",
     "text": "Element formen: Du lässt eine Menge von Erde, Sand, Feuer, Rauch, Nebel oder Wasser, die in einen Würfel mit 30 Zentimetern Kantenlänge passt, eine Stunde lang eine grobe Gestalt annehmen (beispielsweise die einer Kreatur)."
    },
    {
     "typ": "punkt",
     "text": "Erde anlocken: Du erzeugst eine dünne Staub‑ oder Sandschicht, die Oberflächen in einem Bereich von 2,3 Quadratmetern bedeckt, oder du lässt in einem Flecken Erde oder Sand ein einzelnes Wort in deiner Handschrift erscheinen."
    },
    {
     "typ": "punkt",
     "text": "Feuer anlocken: Du erzeugst in einem Würfel mit 1,5 Metern Kantenlänge eine dünne Wolke aus harmlosen Funken und farbigem duftendem Rauch. Du wählst Farbe und Duft aus. Die Funken können Kerzen, Fackeln und Lampen im Bereich entzünden. Der Duft des Rauchs bleibt eine Minute lang erhalten."
    },
    {
     "typ": "punkt",
     "text": "Luft anlocken: Du erzeugst in einem Würfel mit 1,5 Metern Kantenlänge einen Windstoß, der stark genug ist, um Stoff und Laub zu bewegen, Staub aufzuwirbeln und offene Türen und Fensterläden zu schließen. Türen und Fensterläden, die von jemandem oder etwas festgehalten werden, sind nicht betroffen."
    },
    {
     "typ": "punkt",
     "text": "Wasser anlocken: Du erzeugst in einem Würfel mit 1,5 Metern Kantenlänge kühlen Nebel, der Kreaturen und Gegenstände benetzt. Alternativ erzeugst du eine Tasse sauberen Wassers entweder in einem Behälter oder auf einer Oberfläche. Das Wasser ist nach einer Minute verdampft."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You exert control over the elements, creating one of the following effects within range."
    },
    {
     "typ": "punkt",
     "text": "Beckon Air. You create a breeze strong enough to ripple cloth, stir dust, rustle leaves, and close open doors and shutters, all in a 5-foot Cube. Doors and shutters being held open by someone or something aren’t affected."
    },
    {
     "typ": "punkt",
     "text": "Beckon Earth. You create a thin shroud of dust or sand that covers surfaces in a 5-foot-square area, or you cause a single word to appear in your handwriting in a patch of dirt or sand."
    },
    {
     "typ": "punkt",
     "text": "Beckon Fire. You create a thin cloud of harmless embers and colored, scented smoke in a 5-foot Cube. You choose the color and scent, and the embers can light candles, torches, or lamps in that area. The smoke’s scent lingers for 1 minute."
    },
    {
     "typ": "punkt",
     "text": "Beckon Water. You create a spray of cool mist that lightly dampens creatures and objects in a 5-foot Cube. Alternatively, you create 1 cup of clean water either in an open container or on a surface, and the water evaporates in 1 minute."
    },
    {
     "typ": "punkt",
     "text": "Sculpt Element. You cause dirt, sand, fire, smoke, mist, or water that can fit in a 1-foot Cube to assume a crude shape (such as that of a creature) for 1 hour."
    }
   ]
  }
 },
 {
  "id": "enhance-ability",
  "name": {
   "de": "Attribut verbessern",
   "en": "Enhance Ability"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Barde, Druide, Kleriker, Magier, Waldläufer, Zauberer)",
   "en": "Level 2 Transmutation (Bard, Cleric, Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (etwas Fell oder eine Feder)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (fur or a feather)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur und wählst Charisma, Geschicklichkeit, Intelligenz, Stärke oder Weisheit aus. Für die Wirkungsdauer ist das Ziel bei Attributswürfen mit dem ausgewählten Attribut im Vorteil."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. kannst du auf eine weitere Kreatur zielen. Du kannst für jedes Ziel ein anders Attribut bestimmen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature and choose Strength, Dexterity, Intelligence, Wisdom, or Charisma. For the duration, the target has Advantage on ability checks using the chosen ability."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2. You can choose a different ability for each target."
    }
   ]
  }
 },
 {
  "id": "enlarge-reduce",
  "name": {
   "de": "Vergrößern/Verkleinern",
   "en": "Enlarge/Reduce"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Barde, Druide, Magier, Zauberer)",
   "en": "Level 2 Transmutation (Bard, Druid, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Prise Eisenpulver)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a pinch of powdered iron)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer vergrößert oder verkleinert der Zauber ein Ziel (Kreatur oder Gegenstand) in Reichweite, das du sehen kannst (ausgewählter Effekt siehe unten). Ein Gegenstand als Ziel darf nicht getragen oder gehalten werden. Wenn das Ziel eine nicht bereitwillige Kreatur ist, kann es einen Konstitutionsrettungswurf ausführen. Bei einem erfolgreichen Rettungswurf hat der Zauber keine Wirkung. Alles, was eine Zielkreatur trägt oder hält, verändert mit ihr die Größe. Lässt sie einen Gegenstand fallen, so nimmt dieser sofort seine normale Größe an. Wurfwaffen und Geschosse nehmen ihre normale Größe an, sobald sie ein Ziel getroffen oder verfehlt haben."
    },
    {
     "typ": "punkt",
     "text": "Vergrößern: Die Größe des Ziels steigt um eine Kategorie, beispielsweise von Mittelgroß auf Groß. Das Ziel ist außerdem bei Stärkewürfen und Stärkerettungswürfen im Vorteil. Die Angriffe des Ziels mit seinen vergrößerten Waffen sowie seine waffenlosen Angriffe bewirken bei einem Treffer zusätzlich 1W4 Schaden."
    },
    {
     "typ": "punkt",
     "text": "Verkleinern: Die Größe des Ziels sinkt um eine Kategorie, beispielsweise von Mittelgroß auf Klein. Das Ziel ist außerdem bei Stärkewürfen und Stärkerettungswürfen im Nachteil. Die Angriffe des Ziels mit seinen verkleinerten Waffen sowie seine waffenlosen Angriffe bewirken bei einem Treffer 1W4 Schaden weniger (der Schaden kann jedoch nicht unter 1 verringert werden)."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, the spell enlarges or reduces a creature or an object you can see within range (see the chosen effect below). A targeted object must be neither worn nor carried. If the target is an unwilling creature, it can make a Constitution saving throw. On a successful save, the spell has no effect. Everything that a targeted creature is wearing and carrying changes size with it. Any item it drops returns to normal size at once. A thrown weapon or piece of ammunition returns to normal size immediately after it hits or misses a target."
    },
    {
     "typ": "punkt",
     "text": "Enlarge. The target’s size increases by one category—from Medium to Large, for example. The target also has Advantage on Strength checks and Strength saving throws. The target’s attacks with its enlarged weapons or Unarmed Strikes deal an extra 1d4 damage on a hit."
    },
    {
     "typ": "punkt",
     "text": "Reduce. The target’s size decreases by one category—from Medium to Small, for example. The target also has Disadvantage on Strength checks and Strength saving throws. The target’s attacks with its reduced weapons or Unarmed Strikes deal 1d4 less damage on a hit (this can’t reduce the damage below 1)."
    }
   ]
  }
 },
 {
  "id": "ensnaring-strike",
  "name": {
   "de": "Fesselnder Schlag",
   "en": "Ensnaring Strike"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Waldläufer)",
   "en": "Level 1 Conjuration (Ranger)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion, die du sofort ausführst, wenn du eine Kreatur mit einer Waffe getroffen hast",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Bonus Action, which you take immediately after hitting a creature with a weapon",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du das Ziel triffst, erscheinen greifende Ranken an ihm, und es führt einen Stärkerettungswurf aus. Kreaturen von mindestens großer Größe sind bei diesem Rettungswurf im Vorteil. Misslingt der Wurf, so ist das Ziel festgesetzt, bis der Zauber endet. Bei einem erfolgreichen Rettungswurf verwelken die Ranken, und der Zauber endet. Während das Ziel festgesetzt ist, erleidet es zu Beginn jedes seiner Züge 1W6 Stichschaden. Das Ziel oder eine Kreatur in seiner Reichweite kann mit einer Aktion einen Stärkewurf (Athletik) gegen deinen Zauberrettungswurf‑SG ausführen. Bei einem Erfolg endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As you hit the target, grasping vines appear on it, and it makes a Strength saving throw. A Large or larger creature has Advantage on this save. On a failed save, the target has the Restrained condition until the spell ends. On a successful save, the vines shrivel away, and the spell ends. While Restrained, the target takes 1d6 Piercing damage at the start of each of its turns. The target or a creature within reach of it can take an action to make a Strength (Athletics) check against your spell save DC. On a success, the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "entangle",
  "name": {
   "de": "Verstricken",
   "en": "Entangle"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Druide, Waldläufer)",
   "en": "Level 1 Conjuration (Druid, Ranger)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem quadratischen Bereich mit sechs Metern Kantenlänge in Reichweite wachsen greifende Pflanzen aus dem Boden. Diese Pflanzen verwandeln den Boden im Bereich für die Wirkungsdauer in schwieriges Gelände. Wenn der Zauber endet, verschwinden sie. Jede Kreatur außer dir, die sich in dem Bereich befindet, wenn du den Zauber wirkst, muss einen Stärkerettungswurf bestehen, oder sie ist festgesetzt, bis der Zauber endet. Eine festgesetzte Kreatur kann als Aktion einen Stärkewurf (Athletik) gegen deinen Zauberrettungswurf‑SG ausführen. Bei einem Erfolg befreit sie sich von den greifenden Pflanzen und ist nicht mehr von ihnen festgesetzt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Grasping plants sprout from the ground in a 20-foot square within range. For the duration, these plants turn the ground in the area into Difficult Terrain. They disappear when the spell ends. Each creature (other than you) in the area when you cast the spell must succeed on a Strength saving throw or have the Restrained condition until the spell ends. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC. On a success, it frees itself from the grasping plants and is no longer Restrained by them."
    }
   ]
  }
 },
 {
  "id": "enthrall",
  "name": {
   "de": "Fesseln",
   "en": "Enthrall"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 2. Grades (Barde, Hexenmeister)",
   "en": "Level 2 Enchantment (Bard, Warlock)"
  },
  "grad": 2,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du intonierst eine ablenkende Folge von Worten. Kreaturen deiner Wahl in Reichweite, die du sehen kannst, führen einen Weisheitsrettungswurf aus. Jede Kreatur, gegen die du oder deine Gefährten kämpfen, besteht diesen Rettungswurf automatisch. Misslingt der Wurf, so hat das Ziel einen Malus von −10 auf Weisheitswürfe (Wahrnehmung) sowie auf Passive Wahrnehmung, bis der Zauber endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You weave a distracting string of words, causing creatures of your choice that you can see within range to make a Wisdom saving throw. Any creature you or your companions are fighting automatically succeeds on this save. On a failed save, a target has a −10 penalty to Wisdom (Perception) checks and Passive Perception until the spell ends."
    }
   ]
  }
 },
 {
  "id": "etherealness",
  "name": {
   "de": "Ätherische Gestalten",
   "en": "Etherealness"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 7. Grades (Barde, Hexenmeister, Kleriker, Magier, Zauberer)",
   "en": "Level 7 Conjuration (Bard, Cleric, Sorcerer, Warlock, Wizard)"
  },
  "grad": 7,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "hexenmeister",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Bis zu 8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Up to 8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du betrittst den Grenzbereich der Ätherebene, an dem sie sich mit deiner aktuellen Ebene überschneidet. Für die Wirkungsdauer bleibst du in der Äthergrenze. Währenddessen kannst du dich in eine beliebige Richtung bewegen. Wenn du dich nach oben oder unten bewegst, kostet dich jeder Meter Bewegung zwei Meter deiner Bewegungsrate. Du kannst die Ebene, die du verlassen hast, in Graustufen wahrnehmen. Deine Sichtweite beträgt dabei 18 Meter. Während du dich auf der Ätherebene befindest, kannst du nur Kreaturen, Gegenstände und Effekte beeinflussen oder von ihnen beeinflusst werden, die sich ebenfalls dort befinden. Kreaturen, die sich nicht auf der Ätherebene befinden, können dich weder wahrnehmen noch mit dir interagieren, es sei denn, ein Merkmal erlaubt es ihnen. Wenn der Zauber endet, kehrst du auf die Ebene zurück, die du verlassen hast und erscheinst in dem Bereich, der deinem Bereich in der Äthergrenze entspricht. Erscheinst du in einem besetzten Bereich, so wirst du in den nächstliegenden freien Bereich geschoben und erleidest Energieschaden in sechsfacher Höhe der Anzahl an Metern, die du bewegt wurdest. Dieser Zauber endet sofort, wenn du dich beim Wirken bereits auf der Ätherebene oder einer Ebene befindest, die nicht an sie angrenzt (beispielsweise auf den Äußeren Ebenen)."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 7. kannst du auf bis zu drei bereitwillige Kreaturen (dich eingeschlossen) zielen. Die Kreaturen müssen sich im Abstand von bis zu drei Metern von dir befinden, wenn du diesen Zauber wirkst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You step into the border regions of the Ethereal Plane, where it overlaps with your current plane. You remain in the Border Ethereal for the duration. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can perceive the plane you left, which looks gray, and you can’t see anything there more than 60 feet away. While on the Ethereal Plane, you can affect and be affected only by creatures, objects, and effects on that plane. Creatures that aren’t on the Ethereal Plane can’t perceive or interact with you unless a feature gives them the ability to do so. When the spell ends, you return to the plane you left in the spot that corresponds to your space in the Border Ethereal. If you appear in an occupied space, you are shunted to the nearest unoccupied space and take Force damage equal to twice the number of feet you are moved. This spell ends instantly if you cast it while you are on the Ethereal Plane or a plane that doesn’t border it, such as one of the Outer Planes."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target up to three willing creatures (including yourself) for each spell slot level above 7. The creatures must be within 10 feet of you when you cast the spell."
    }
   ]
  }
 },
 {
  "id": "expeditious-retreat",
  "name": {
   "de": "Rascher Rückzug",
   "en": "Expeditious Retreat"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 1. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 1 Transmutation (Sorcerer, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "verwandlung",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du führst die Spurt‑Aktion aus, und bis der Zauber endet, kannst du sie erneut als Bonusaktion ausführen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You take the Dash action, and until the spell ends, you can take that action again as a Bonus Action."
    }
   ]
  }
 },
 {
  "id": "eyebite",
  "name": {
   "de": "Böser Blick",
   "en": "Eyebite"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 6. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 6 Necromancy (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 6,
  "schule": "nekromantie",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer werden deine Augen zu einer tiefschwarzen Leere. Eine Kreatur deiner Wahl im Abstand von bis zu 18 Metern von dir, die du sehen kannst, muss einen Weisheitsrettungswurf bestehen, oder sie erleidet für die Wirkungsdauer einen der folgenden Effekte deiner Wahl. Für die Wirkungsdauer kannst du in jedem deiner Züge eine magische Aktion ausführen, um eine andere Kreatur als Ziel auszuwählen. Du kannst jedoch keine Kreatur erneut als Ziel auswählen, die ihren Rettungswurf gegen den Zauber bestanden hat."
    },
    {
     "typ": "punkt",
     "text": "Krank: Das Ziel ist vergiftet."
    },
    {
     "typ": "punkt",
     "text": "Panik: Das Ziel ist verängstigt. Es muss in jedem seiner Züge die Spurt‑Aktion ausführen und sich auf dem sichersten und kürzesten Weg von dir entfernen. Wenn sich das Ziel in einen Bereich mindestens 18 Meter von dir entfernt bewegt hat, von dem aus es dich nicht sehen kann, endet dieser Effekt."
    },
    {
     "typ": "punkt",
     "text": "Schlaf: Das Ziel ist bewusstlos. Es erwacht, wenn es Schaden erleidet oder eine andere Kreatur eine Aktion ausführt, um es wachzurütteln."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, your eyes become an inky void. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected by one of the following effects of your choice for the duration. On each of your turns until the spell ends, you can take a Magic action to target another creature but can’t target a creature again if it has succeeded on a save against this casting of the spell."
    },
    {
     "typ": "punkt",
     "text": "Asleep. The target has the Unconscious condition. It wakes up if it takes any damage or if another creature takes an action to shake it awake."
    },
    {
     "typ": "punkt",
     "text": "Panicked. The target has the Frightened condition. On each of its turns, the Frightened target must take the Dash action and move away from you by the safest and shortest route available. If the target moves to a space at least 60 feet away from you where it can’t see you, this effect ends."
    },
    {
     "typ": "punkt",
     "text": "Sickened. The target has the Poisoned condition."
    }
   ]
  }
 },
 {
  "id": "fabricate",
  "name": {
   "de": "Verarbeitung",
   "en": "Fabricate"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 4. Grades (Magier)",
   "en": "Level 4 Transmutation (Wizard)"
  },
  "grad": 4,
  "schule": "verwandlung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du wandelst Rohmaterial in Erzeugnisse aus dem gleichen Material um. Du kannst beispielsweise aus einem Stück Baum eine Holzbrücke erschaffen, aus etwas Hanf ein Seil, aus Flachs oder Wolle Kleidung. Wähle Rohmaterial in Reichweite aus, das du sehen kannst. Du kannst einen Gegenstand von höchstens großer Größe herstellen, der in einen Würfel mit drei Metern Kantenlänge oder in acht verbundene Würfel mit jeweils 1,5 Metern Kantenlänge passt, sofern du über genügend Material verfügst. Wenn du mit Metall, Stein oder einem anderen Mineral arbeitest, kann der hergestellte Gegenstand von höchstens mittelgroßer Größe sein. Er muss in einen Würfel mit 1,5 Metern Kantenlänge passen. Die Qualität der mit dem Zauber erschaffenen Gegenstände hängt von der Qualität des Rohmaterials ab. Mit diesem Zauber können weder Kreaturen noch magische Gegenstände erschaffen werden. Du kannst zudem keine Gegenstände wie Schmuck, Waffen, Glas oder Rüstung erschaffen, die ein hohes Maß an Können erfordern, es sei denn, du hast Übung im Umgang mit dem passenden Handwerkszeug."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, or clothes from flax or wool. Choose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot Cube or eight connected 5-foot Cubes) given a sufficient quantity of material. If you’re working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium (contained within a 5-foot Cube). The quality of any fabricated objects is based on the quality of the raw materials. Creatures and magic items can’t be created by this spell. You also can’t use it to create items that require a high degree of skill—such as weapons and armor—unless you have proficiency with the type of Artisan’s Tools used to craft such objects."
    }
   ]
  }
 },
 {
  "id": "faerie-fire",
  "name": {
   "de": "Feenfeuer",
   "en": "Faerie Fire"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Barde, Druide)",
   "en": "Level 1 Evocation (Bard, Druid)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Gegenstände innerhalb eines Würfels mit sechs Metern Kantenlänge in Reichweite werden von blauem, grünem oder violettem Licht (nach deiner Wahl) umrahmt. Auch Kreaturen im Würfel werden umrahmt, es sei denn, sie bestehen einen Geschicklichkeitsrettungswurf. Betroffene Gegenstände und Kreaturen spenden für die Wirkungsdauer in einem Radius von drei Metern dämmriges Licht und profitieren nicht von Unsichtbarkeit. Angreifer sind bei Angriffswürfen gegen betroffene Kreaturen oder Gegenstände im Vorteil, sofern sie ihr Ziel sehen können."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Objects in a 20-foot Cube within range are outlined in blue, green, or violet light (your choice). Each creature in the Cube is also outlined if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed Dim Light in a 10-foot radius and can’t benefit from the Invisible condition. Attack rolls against an affected creature or object have Advantage if the attacker can see it."
    }
   ]
  }
 },
 {
  "id": "faithful-hound",
  "name": {
   "de": "Treuer Hund",
   "en": "Faithful Hound"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Magier)",
   "en": "Level 4 Conjuration (Wizard)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Silberpfeife)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a silver whistle)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst in einem freien Bereich in Reichweite, den du sehen kannst, einen geisterhaften Wachhund. Dieser bleibt für die Wirkungsdauer bestehen, oder bis ihr euch weiter als 90 Meter voneinander entfernt. Niemand außer dir kann den Hund sehen, und er ist immateriell und unverwundbar. Wenn sich ihm eine Kreatur von mindestens kleiner Größe auf höchstens neun Meter nähert, ohne zuvor das Kennwort zu sprechen, das du beim Wirken des Zaubers festgelegt hast, bellt der Hund laut. Der Hund hat Wahrer Blick mit einer Reichweite von neun Metern. Zu Beginn jedes deiner Züge versucht der Hund, einen Gegner im Abstand von bis zu 1,5 Metern von sich zu beißen. Der Gegner muss einen Geschicklichkeitsrettungswurf bestehen, oder er erleidet 4W8 Energieschaden. In deinen folgenden Zügen kannst du eine magische Aktion ausführen, um den Hund bis zu neun Meter weit zu bewegen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a phantom watchdog in an unoccupied space that you can see within range. The hound remains for the duration or until the two of you are more than 300 feet apart from each other. No one but you can see the hound, and it is intangible and invulnerable. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound has Truesight with a range of 30 feet. At the start of each of your turns, the hound attempts to bite one enemy within 5 feet of it. That enemy must succeed on a Dexterity saving throw or take 4d8 Force damage. On your later turns, you can take a Magic action to move the hound up to 30 feet."
    }
   ]
  }
 },
 {
  "id": "false-life",
  "name": {
   "de": "Falsches Leben",
   "en": "False Life"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Necromancy (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "nekromantie",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Tropfen Alkohol)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a drop of alcohol)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst 2W4+4 temporäre Trefferpunkte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. erhältst du 5 zusätzliche temporäre Trefferpunkte."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain 2d4 + 4 Temporary Hit Points."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You gain 5 additional Temporary Hit Points for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "fear",
  "name": {
   "de": "Furcht",
   "en": "Fear"
  },
  "gradzeile": {
   "de": "Illusionszauber 3. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 3 Illusion (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine weiße Feder)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a white feather)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jede Kreatur in einem Kegel von neun Metern muss einen Weisheitsrettungswurf bestehen, oder sie lässt fallen, was auch immer sie hält, und ist für die Wirkungsdauer verängstigt. Eine verängstigte Kreatur führt in jedem ihrer Züge die Spurt‑Aktion aus und entfernt sich auf dem sichersten Weg von dir, sofern möglich. Beendet eine Kreatur ihren Zug in einem Bereich, in dem du nicht in ihrer Sichtlinie bist, führt sie einen Weisheitsrettungswurf aus. Bei einem erfolgreichen Rettungswurf endet der Zauber bei der Kreatur."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each creature in a 30-foot Cone must succeed on a Wisdom saving throw or drop whatever it is holding and have the Frightened condition for the duration. A Frightened creature takes the Dash action and moves away from you by the safest route on each of its turns unless there is nowhere to move. If the creature ends its turn in a space where it doesn’t have line of sight to you, the creature makes a Wisdom saving throw. On a successful save, the spell ends on that creature."
    }
   ]
  }
 },
 {
  "id": "feather-fall",
  "name": {
   "de": "Federfall",
   "en": "Feather Fall"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 1. Grades (Barde, Magier, Zauberer)",
   "en": "Level 1 Transmutation (Bard, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Reaktion, die du ausführst, wenn du oder eine Kreatur im Abstand von bis zu 18 Metern von dir, die du sehen kannst, stürzt",
    "reichweite": "18 Meter",
    "komponenten": "V, M (eine kleine Feder oder Daune)",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Reaction, which you take when you or a creature you can see within 60 feet of you falls",
    "reichweite": "60 feet",
    "komponenten": "V, M (a small feather or piece of down)",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle bis zu fünf Kreaturen in Reichweite aus, die gerade stürzen. Ihre Fallgeschwindigkeit verlangsamt sich für die Wirkungsdauer auf 18 Meter pro Runde. Wenn eine Kreatur während der Wirkungsdauer landet, erleidet sie keinen Schaden durch den Sturz, und der Zauber endet bei dieser Kreatur."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose up to five falling creatures within range. A falling creature’s rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature."
    }
   ]
  }
 },
 {
  "id": "find-familiar",
  "name": {
   "de": "Vertrauten finden",
   "en": "Find Familiar"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Magier)",
   "en": "Level 1 Conjuration (Wizard)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde oder Ritual",
    "reichweite": "3 Meter",
    "komponenten": "V, G, M (brennender Weihrauch im Wert von mindestens 10 GM, den der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 hour or Ritual",
    "reichweite": "10 feet",
    "komponenten": "V, S, M (burning incense worth 10+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst die Dienste eines Vertrauten – eines Geistes, der eine Tiergestalt deiner Wahl annimmt: Eidechse, Eule, Falke, Fledermaus, Frosch, Katze, Oktopus, Rabe, Ratte, Spinne, Wiesel oder ein anderes Tier mit einem Herausforderungsgrad von 0. Der Vertraute erscheint in einem freien Bereich in Reichweite. Er hat die Spielwerte der gewählten Gestalt (siehe „Monster“), ist jedoch tatsächlich ein celestisches Wesen, ein Feenwesen oder ein Unhold (nach deiner Wahl) und kein Tier. Dein Vertrauter agiert unabhängig von dir, befolgt aber deine Befehle."
    },
    {
     "typ": "punkt",
     "text": "Telepathische Verbindung: Solange sich dein Vertrauter im Abstand von bis zu 30 Metern von dir befindet, kannst du telepathisch mit ihm kommunizieren. Zudem kannst du als Bonusaktion bis zum Beginn deines nächsten Zugs durch die Sinne des Vertrauten hören und sehen. Dabei kannst du auch etwaige Spezialsinne des Vertrauten nutzen. Wenn du einen Zauber mit Berührungsreichweite wirkst, kann dein Vertrauter die Berührung ausführen. Dazu muss er sich im Abstand von bis zu 30 Metern von dir befinden und die Berührung als Reaktion ausführen, wenn du den Zauber wirkst."
    },
    {
     "typ": "punkt",
     "text": "Kampf: Der Vertraute ist mit dir und deinen Verbündeten verbündet. Er würfelt seine eigene Initiative aus und handelt in seinem eigenen Zug. Ein Vertrauter kann nicht angreifen, jedoch andere Aktionen normal ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verschwinden des Vertrauten: Sinken die Trefferpunkte des Vertrauten auf 0, so verschwindet er. Er erscheint wieder, wenn du den Zauber erneut wirkst. Als magische Aktion kannst du den Vertrauten vorübergehend verwerfen und in eine Taschendimension schicken. Alternativ kannst du ihn für immer verwerfen. Wenn du deinen Vertrauten vorübergehend verworfen hast, kannst du ihn als magische Aktion in einem freien Bereich im Abstand von bis zu neun Metern von dir wieder erscheinen lassen. Wann immer die Trefferpunkte des Vertrauten auf 0 sinken oder der Vertraute in einer Taschendimension verschwindet, bleibt alles, was er getragen oder gehalten hat, in seinem Bereich liegen."
    },
    {
     "typ": "punkt",
     "text": "Nur ein Vertrauter: Du kannst nur jeweils einen Vertrauten haben. Wirkst du diesen Zauber, während du einen Vertrauten hast, so lässt du diesen stattdessen eine neue verfügbare Gestalt annehmen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain the service of a familiar, a spirit that takes an animal form you choose: Bat, Cat, Frog, Hawk, Lizard, Octopus, Owl, Rat, Raven, Spider, Weasel, or another Beast that has a Challenge Rating of 0. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form (see “Monsters”), though it is a Celestial, Fey, or Fiend (your choice) instead of a Beast. Your familiar acts independently of you, but it obeys your commands."
    },
    {
     "typ": "punkt",
     "text": "Telepathic Connection. While your familiar is within 100 feet of you, you can communicate with it telepathically. Additionally, as a Bonus Action, you can see through the familiar’s eyes and hear what it hears until the start of your next turn, gaining the benefits of any special senses it has. Finally, when you cast a spell with a range of touch, your familiar can deliver the touch. Your familiar must be within 100 feet of you, and it must take a Reaction to deliver the touch when you cast the spell."
    },
    {
     "typ": "punkt",
     "text": "Combat. The familiar is an ally to you and your allies. It rolls its own Initiative and acts on its own turn. A familiar can’t attack, but it can take other actions as normal."
    },
    {
     "typ": "punkt",
     "text": "Disappearance of the Familiar. When the familiar drops to 0 Hit Points, it disappears. It reappears after you cast this spell again. As a Magic action, you can temporarily dismiss the familiar to a pocket dimension. Alternatively, you can dismiss it forever. As a Magic action while it is temporarily dismissed, you can cause it to reappear in an unoccupied space within 30 feet of you. Whenever the familiar drops to 0 Hit Points or disappears into the pocket dimension, it leaves behind in its space anything it was wearing or carrying."
    },
    {
     "typ": "punkt",
     "text": "One Familiar Only. You can’t have more than one familiar at a time. If you cast this spell while you have a familiar, you instead cause it to adopt a new eligible form."
    }
   ]
  }
 },
 {
  "id": "find-steed",
  "name": {
   "de": "Reittier finden",
   "en": "Find Steed"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 2. Grades (Paladin)",
   "en": "Level 2 Conjuration (Paladin)"
  },
  "grad": 2,
  "schule": "beschwoerung",
  "klassen": [
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du rufst ein außerweltliches Wesen herbei, das sich als treues Reittier in einem freien Bereich deiner Wahl in Reichweite manifestiert. Es verwendet den Wertekasten eines außerweltlichen Reittieres. Wenn du bereits über ein Reittier durch diesen Zauber verfügst, wird dieses durch das neue ersetzt. Das Reittier sieht aus wie ein reittaugliches Tier deiner Wahl – beispielsweise ein Pferd, ein Kamel, ein Schreckenswolf oder ein Elch. Wann immer du diesen Zauber wirkst, wählst du den Kreaturentyp des Reittieres aus: celestisches Wesen, Feenwesen oder Unhold. Der Typ beeinflusst bestimmte Merkmale im Wertekasten."
    },
    {
     "typ": "punkt",
     "text": "Kampf: Das Reittier ist mit dir und deinen Verbündeten verbündet. Im Kampf nutzt es deinen Initiativewert und fungiert als kontrolliertes Reittier, während du es reitest (wie in den Regeln zu berittenem Kampf definiert). Wenn du kampfunfähig bist, ist das Reittier unmittelbar nach dir am Zug, agiert unabhängig und fokussiert sich darauf, dich zu beschützen."
    },
    {
     "typ": "punkt",
     "text": "Verschwinden des Reittieres: Das Reittier verschwindet, wenn seine Trefferpunkte auf 0 sinken oder wenn du stirbst. Wenn es verschwindet, hinterlässt es alles, was es getragen oder gehalten hat. Wenn du diesen Zauber erneut wirkst, entscheidest du, ob du erneut das verschwundene Reittier oder ein anderes herbeirufst."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Verwende den Zauberplatzgrad als Zaubergrad im Wertekasten."
    },
    {
     "typ": "liste",
     "titel": "Außerweltliches Reittier",
     "eintraege": [
      "Großes celestisches Wesen, Feenwesen oder Unhold (nach deiner Wahl), neutral",
      "RK 10 + 1 pro Zaubergrad",
      "TP 5 + 10 pro Zaubergrad (das Reittier verfügt über eine Anzahl von W10-Trefferwürfeln in Höhe des Zaubergrades)",
      "Bewegungsrate 18 m, Fliegen 18 m (erfordert einen Zauber des mindestens 4. Grades) MOD RW MOD RW MOD RW",
      "Stä 18 +4 +4 GeS 12 +1 +1 Kon 14 +2 +2",
      "Int 6 −2 −2 WeI 12 +1 +1 Cha 8 −1 −1",
      "Sinne Passive Wahrnehmung 11",
      "Sprachen Telepathie auf 1,6 Kilometer (nur mit dir)",
      "HG − (EP 0, ÜB entspricht deinem Übungsbonus)",
      "Merkmale",
      "Lebensbindung: Wenn du Trefferpunkte durch einen Zauber ab dem 1. Grad zurückerhältst, erhält das Reittier die gleiche Anzahl von Trefferpunkten zurück, sofern du dich im Abstand von bis zu 1,5 Metern von ihm befindest.",
      "Aktionen",
      "Außerweltlicher Hieb: Nahkampfangriffswurf: Bonus in Höhe deines Zauberangriff-Modifikators, Reichweite 1,5 m. Treffer: 1W8 plus Zaubergrad gleißender (celestisches Wesen), psychischer (Feenwesen) oder nekrotischer (Unhold) Schaden.",
      "Bonusaktionen",
      "Böses Starren (nur Unhold, wird nach langer Rast aufgeladen): Weisheitsrettungswurf: Der SG entspricht deinem Zauberrettungswurf-SG, eine Kreatur im Abstand von bis zu 18 Metern, die vom Reittier gesehen werden kann. Misserfolg: Das Ziel ist bis zum Ende deines nächsten Zugs verängstigt.",
      "Feenschritt (nur Feenwesen, wird nach langer Rast aufgeladen): Das Reittier teleportiert sich samt Reiter bis zu 18 Meter weit in einen freien Bereich deiner Wahl.",
      "Heilende Berührung (nur celestisches Wesen, wird nach langer Rast aufgeladen): Eine Kreatur im Abstand von bis zu 1,5 Metern vom Reittier erhält eine Anzahl von Trefferpunkten in Höhe von 2W8 plus Zaubergrad zurück."
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You summon an otherworldly being that appears as a loyal steed in an unoccupied space of your choice within range. This creature uses the Otherworldly Steed stat block. If you already have a steed from this spell, the steed is replaced by the new one. The steed resembles a Large, rideable animal of your choice, such as a horse, a camel, a dire wolf, or an elk. Whenever you cast the spell, choose the steed’s creature type—Celestial, Fey, or Fiend— which determines certain traits in the stat block."
    },
    {
     "typ": "punkt",
     "text": "Combat. The steed is an ally to you and your allies. In combat, it shares your Initiative count, and it functions as a controlled mount while you ride it (as defined in the rules on mounted combat). If you have the Incapacitated condition, the steed takes its turn immediately after yours and acts independently, focusing on protecting you."
    },
    {
     "typ": "punkt",
     "text": "Disappearance of the Steed. The steed disappears if it drops to 0 Hit Points or if you die. When it disappears, it leaves behind anything it was wearing or carrying. If you cast this spell again, you decide whether you summon the steed that disappeared or a different one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Use the spell slot’s level for the spell’s level in the stat block."
    },
    {
     "typ": "liste",
     "titel": "Otherworldly Steed",
     "eintraege": [
      "Large Celestial, Fey, or Fiend (Your Choice), Neutral",
      "AC 10 + 1 per spell level",
      "HP 5 + 10 per spell level (the steed has a number of Hit Dice [d10s] equal to the spell’s level)",
      "Speed 60 ft., Fly 60 ft. (requires level 4+ spell) MOD SAVE MOD SAVE MOD SAVE",
      "Str 18 +4 +4 dex 12 +1 +1 con 14 +2 +2",
      "int 6 −2 −2 WiS 12 +1 +1 chA 8 −1 −1",
      "Senses Passive Perception 11",
      "Languages Telepathy 1 mile (works only with you)",
      "CR None (XP 0; PB equals your Proficiency Bonus)",
      "Traits",
      "Life Bond. When you regain Hit Points from a level 1+ spell, the steed regains the same number of Hit Points if you’re within 5 feet of it.",
      "Actions",
      "Otherworldly Slam. Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: 1d8 plus the spell’s level of Radiant (Celestial), Psychic (Fey), or Necrotic (Fiend) damage.",
      "Bonus Actions",
      "Fell Glare (Fiend Only; Recharges after a Long Rest). Wisdom Saving Throw: DC equals your spell save DC, one creature within 60 feet the steed can see. Failure: The target has the Frightened condition until the end of your next turn.",
      "Fey Step (Fey Only; Recharges after a Long Rest). The steed teleports, along with its rider, to an unoccupied space of your choice up to 60 feet away from itself.",
      "Healing Touch (Celestial Only; Recharges after a Long Rest). One creature within 5 feet of the steed regains a number of Hit Points equal to 2d8 plus the spell’s level."
     ]
    }
   ]
  }
 },
 {
  "id": "find-the-path",
  "name": {
   "de": "Weg finden",
   "en": "Find the Path"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 6. Grades (Barde, Druide, Kleriker)",
   "en": "Level 6 Divination (Bard, Cleric, Druid)"
  },
  "grad": 6,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Satz Weissagungsgegenstände wie Karten oder Runen im Wert von mindestens 100 GM)",
    "dauer": "Konzentration, bis zu 1 Tag"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "Self",
    "komponenten": "V, S, M (a set of divination tools—such as cards or runes—worth 100+ GP)",
    "dauer": "Concentration, up to 1 day"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du spürst auf magische Art den direktesten physischen Weg zu einem Ort, den du nennst. Der Ort muss dir bekannt sein. Der Zauber misslingt, wenn du ein Ziel auf einer anderen Existenzebene, ein bewegtes Ziel (beispielsweise eine mobile Festung) oder ein unspezifisches Ziel (beispielsweise „Hort eines grünen Drachen“) nennst. Während der Wirkungsdauer weißt du, wie weit der Zielort entfernt ist und in welcher Richtung er liegt, sofern du dich auf derselben Existenzebene befindest. Wann immer du unterwegs eine Wahl zwischen verschiedenen Wegen hast, weißt du, welcher Weg der direkteste ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You magically sense the most direct physical route to a location you name. You must be familiar with the location, and the spell fails if you name a destination on another plane of existence, a moving destination (such as a mobile fortress), or an unspecific destination (such as “a green dragon’s lair”). For the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. Whenever you face a choice of paths along the way there, you know which path is the most direct."
    }
   ]
  }
 },
 {
  "id": "find-traps",
  "name": {
   "de": "Fallen finden",
   "en": "Find Traps"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 2. Grades (Druide, Kleriker, Waldläufer)",
   "en": "Level 2 Divination (Cleric, Druid, Ranger)"
  },
  "grad": 2,
  "schule": "erkenntnis",
  "klassen": [
   "druide",
   "kleriker",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erspürst alle Fallen, die sich in Reichweite und in deiner Sichtlinie befinden. Für diesen Zauber zählt jeder Gegenstand oder Mechanismus als Falle, der geschaffen wurde, um Schaden zu bewirken oder eine sonstige Gefahr darzustellen. Dazu zählen Zauber wie Alarm oder Glyphe des Schutzes oder mechanische Fallgruben, jedoch keine natürlichen Schwachstellen im Boden, keine instabilen Decken oder verborgene Senklöcher. Dieser Zauber enthüllt, dass eine Falle vorhanden ist, jedoch nicht, wo sie sich befindet. Du erfährst jedoch die allgemeine Art der Gefahr der Falle."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You sense any trap within range that is within line of sight. A trap, for the purpose of this spell, includes any object or mechanism that was created to cause damage or other danger. Thus, the spell would sense the Alarm or Glyph of Warding spell or a mechanical pit trap, but it wouldn’t reveal a natural weakness in the floor, an unstable ceiling, or a hidden sinkhole. This spell reveals that a trap is present but not its location. You do learn the general nature of the danger posed by a trap you sense."
    }
   ]
  }
 },
 {
  "id": "finger-of-death",
  "name": {
   "de": "Finger des Todes",
   "en": "Finger of Death"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 7. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 7 Necromancy (Sorcerer, Warlock, Wizard)"
  },
  "grad": 7,
  "schule": "nekromantie",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du entfesselst negative Energie auf eine Kreatur in Reichweite, die du sehen kannst. Das Ziel führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet das Ziel 7W8+30 nekrotischen Schaden, anderenfalls die Hälfte. Wenn ein Humanoide durch diesen Zauber getötet wird, steht er zu Beginn deines nächsten Zugs als Zombie (siehe „Monster“) wieder auf und folgt deinen verbalen Befehlen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You unleash negative energy toward a creature you can see within range. The target makes a Constitution saving throw, taking 7d8 + 30 Necrotic damage on a failed save or half as much damage on a successful one. A Humanoid killed by this spell rises at the start of your next turn as a Zombie (see “Monsters”) that follows your verbal orders."
    }
   ]
  }
 },
 {
  "id": "fire-bolt",
  "name": {
   "de": "Feuerpfeil",
   "en": "Fire Bolt"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Magier, Zauberer)",
   "en": "Evocation Cantrip (Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst einen Feuerfunken auf eine Kreatur oder einen Gegenstand in Reichweite. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 1W10 Feuerschaden. Der Zauber setzt brennbare Gegenstände in Brand, die er trifft und die nicht getragen oder gehalten werden."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W10 erhöht, wenn du die 5. (2W10), die 11. (3W10) und die 17. (4W10) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn’t being worn or carried."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
    }
   ]
  }
 },
 {
  "id": "fire-shield",
  "name": {
   "de": "Feuerschild",
   "en": "Fire Shield"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 4. Grades (Druide, Magier, Zauberer)",
   "en": "Level 4 Evocation (Druid, Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (etwas Phosphor oder ein Glühwürmchen)",
    "dauer": "10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a bit of phosphorus or a firefly)",
    "dauer": "10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer umgeben feine Flammen deinen Körper und spenden in einem Radius von drei Metern helles Licht und in einem Radius von weiteren drei Metern dämmriges Licht. Die Flammen verleihen dir einen Wärmeschild oder einen Kälteschild (nach deiner Wahl). Der Wärmeschild gewährt dir Resistenz gegen Kälteschaden, der Kälteschild Resistenz gegen Feuerschaden. Wann immer dich eine Kreatur im Abstand von bis zu 1,5 Metern von dir mit einem Nahkampfangriffswurf trifft, geht der Schild außerdem in Flammen auf. Der Angreifer erleidet 2W8 Feuerschaden durch einen Wärmeschild oder 2W8 Kälteschaden durch einen Kälteschild."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Wispy flames wreathe your body for the duration, shedding Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you Resistance to Cold damage, and the chill shield grants you Resistance to Fire damage. In addition, whenever a creature within 5 feet of you hits you with a melee attack roll, the shield erupts with flame. The attacker takes 2d8 Fire damage from a warm shield or 2d8 Cold damage from a chill shield."
    }
   ]
  }
 },
 {
  "id": "fire-storm",
  "name": {
   "de": "Feuersturm",
   "en": "Fire Storm"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 7. Grades (Druide, Kleriker, Zauberer)",
   "en": "Level 7 Evocation (Cleric, Druid, Sorcerer)"
  },
  "grad": 7,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "kleriker",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Feuersturm erscheint in Reichweite. Der Bereich des Sturms besteht aus bis zu zehn Würfeln mit drei Metern Kantenlänge, die du beliebig anordnest. Jeder Würfel muss an mindestens einen anderen angrenzen. Jede Kreatur im Bereich führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 7W10 Feuerschaden, anderenfalls die Hälfte. Brennbare Gegenstände im Bereich, die nicht getragen oder gehalten werden, beginnen zu brennen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A storm of fire appears within range. The area of the storm consists of up to ten 10-foot Cubes, which you arrange as you like. Each Cube must be contiguous with at least one other Cube. Each creature in the area makes a Dexterity saving throw, taking 7d10 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren’t being worn or carried start burning."
    }
   ]
  }
 },
 {
  "id": "fireball",
  "name": {
   "de": "Feuerball",
   "en": "Fireball"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 3. Grades (Magier, Zauberer)",
   "en": "Level 3 Evocation (Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (eine Kugel aus Fledermaus-Guano und Schwefel)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (a ball of bat guano and sulfur)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt einen hellen Lichtstrahl auf einen Punkt deiner Wahl in Reichweite, wo er unter dumpfem Grollen zu einer Flammenexplosion detoniert. Jede Kreatur in einer Kugel mit einem Radius von sechs Metern um diesen Punkt führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 8W6 Feuerschaden, anderenfalls die Hälfte. Brennbare Gegenstände im Bereich, die nicht getragen oder gehalten werden, beginnen zu brennen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren’t being worn or carried start burning."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "flame-blade",
  "name": {
   "de": "Flammenklinge",
   "en": "Flame Blade"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Druide, Zauberer)",
   "en": "Level 2 Evocation (Druid, Sorcerer)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Sumach-Blatt)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a sumac leaf)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst eine feurige Klinge in deiner freien Hand. Die Klinge ähnelt einem Krummsäbel und bleibt für die Wirkungsdauer bestehen. Wenn du die Klinge loslässt, verschwindet sie. Du kannst sie jedoch als Bonusaktion erneut beschwören. Du kannst als magische Aktion einen Nahkampf‑Zauberangriff mit der Flammenklinge ausführen. Bei einem Treffer erleidet das Ziel Feuerschaden in Höhe von 3W6 plus deinem Zauberwirken‑Attributsmodifikator. Die Flammenklinge spendet in einem Radius von drei Metern helles Licht und in einem Radius von weiteren drei Metern dämmriges Licht."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. If you let go of the blade, it disappears, but you can evoke it again as a Bonus Action. As a Magic action, you can make a melee spell attack with the fiery blade. On a hit, the target takes Fire damage equal to 3d6 plus your spellcasting ability modifier. The flaming blade sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "flame-strike",
  "name": {
   "de": "Flammenschlag",
   "en": "Flame Strike"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 5. Grades (Kleriker)",
   "en": "Level 5 Evocation (Cleric)"
  },
  "grad": 5,
  "schule": "hervorrufung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (eine Prise Schwefel)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a pinch of sulfur)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine vertikale Säule aus strahlendem Feuer fährt von oben herab. Jede Kreatur in einem zwölf Meter hohen Zylinder mit einem Radius von drei Metern um einen Punkt in Reichweite führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 5W6 Feuerschaden und 5W6 gleißenden Schaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. werden Feuerschaden und gleißender Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A vertical column of brilliant fire roars down from above. Each creature in a 10-foot-radius, 40-foothigh Cylinder centered on a point within range makes a Dexterity saving throw, taking 5d6 Fire damage and 5d6 Radiant damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The Fire damage and the Radiant damage increase by 1d6 for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "flaming-sphere",
  "name": {
   "de": "Flammenkugel",
   "en": "Flaming Sphere"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 2. Grades (Druide, Magier, Zauberer)",
   "en": "Level 2 Conjuration (Druid, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (eine Kugel aus Wachs)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a ball of wax)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erzeugst in einem freien Bereich in Reichweite auf dem Boden eine flammende Kugel mit einem Radius von 1,5 Metern. Die Kugel bleibt für die Wirkungsdauer bestehen. Jede Kreatur, die ihren Zug in im Abstand von bis zu 1,5 Metern um die Kugel beendet, führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 2W6 Feuerschaden, anderenfalls die Hälfte. Als Bonusaktion kannst du die Kugel bis zu neun Meter weit über den Boden rollen lassen. Wenn du die Kugel in den Bereich einer Kreatur bewegst, muss diese den Rettungswurf gegen die Kugel ausführen, und die Kugel beendet ihre Bewegung für diesen Zug. Bewegst du die Kugel, so kannst du sie über bis zu 1,5 Meter hohe Hindernisse dirigieren und über bis zu drei Meter breite Gruben springen lassen. Brennbare Gegenstände, die nicht getragen oder gehalten werden, beginnen zu brennen, wenn sie von der Kugel berührt werden. Die Kugel spendet in einem Radius von sechs Metern helles Licht sowie in einem Radius von weiteren sechs Metern dämmriges Licht."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a 5-foot-diameter sphere of fire in an unoccupied space on the ground within range. It lasts for the duration. Any creature that ends its turn within 5 feet of the sphere makes a Dexterity saving throw, taking 2d6 Fire damage on a failed save or half as much damage on a successful one. As a Bonus Action, you can move the sphere up to 30 feet, rolling it along the ground. If you move the sphere into a creature’s space, that creature makes the save against the sphere, and the sphere stops moving for the turn. When you move the sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet wide. Flammable objects that aren’t being worn or carried start burning if touched by the sphere, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "flesh-to-stone",
  "name": {
   "de": "Fleisch zu Stein",
   "en": "Flesh to Stone"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 6. Grades (Druide, Magier, Zauberer)",
   "en": "Level 6 Transmutation (Druid, Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (eine Schreckhahn-Feder)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a cockatrice feather)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versuchst, eine Kreatur in Reichweite, die du sehen kannst, in Stein zu verwandeln. Das Ziel führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so ist es für die Wirkungsdauer festgesetzt. Bei einem erfolgreichen Rettungswurf beträgt seine Bewegungsrate bis zum Beginn deines nächsten Zugs 0. Konstrukte bestehen den Rettungswurf automatisch. Eine festgesetzte Kreatur führt am Ende jedes ihrer Züge einen weiteren Konstitutionsrettungswurf aus. Bei drei erfolgreichen Rettungswürfen endet dieser Zauber. Bei drei Misserfolgen wird sie zu Stein und hat für die Wirkungsdauer den Zustand Versteinert. Die Erfolge und Misserfolge müssen nicht aufeinanderfolgen. Notiere einfach beide, bis das Ziel drei von einem hat. Wenn du dich für die gesamte Wirkungsdauer auf diesen Zauber konzentrierst, versteinert die Kreatur, bis der Effekt durch den Zauber Vollständige Genesung oder ähnliche Magie aufgehoben wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You attempt to turn one creature that you can see within range into stone. The target makes a Constitution saving throw. On a failed save, it has the Restrained condition for the duration. On a successful save, its Speed is 0 until the start of your next turn. Constructs automatically succeed on the save. A Restrained target makes another Constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails its saves three times, it is turned to stone and has the Petrified condition for the duration. The successes and failures needn’t be consecutive; keep track of both until the target collects three of a kind. If you maintain your Concentration on this spell for the entire possible duration, the target is Petrified until the condition is ended by Greater Restoration or similar magic."
    }
   ]
  }
 },
 {
  "id": "floating-disk",
  "name": {
   "de": "Schwebende Scheibe",
   "en": "Floating Disk"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Magier)",
   "en": "Level 1 Conjuration (Wizard)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Tropfen Quecksilber)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a drop of mercury)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber erschafft eine waagerechte runde Fläche aus Energie mit einem Durchmesser von 90 Zentimetern und einer Dicke von 2,5 Zentimetern. Sie schwebt in einem freien Bereich deiner Wahl in Reichweite, den du sehen kannst, 90 Zentimeter über dem Boden. Die Scheibe bleibt für die Wirkungsdauer bestehen und kann bis zu 250 Kilogramm tragen. Wenn sie mit mehr Gewicht belastet wird, endet der Zauber, und alles auf der Scheibe fällt zu Boden. Die Scheibe ist unbeweglich, solange du dich im Abstand von bis zu sechs Metern von ihr befindest. Entfernst du dich mehr als sechs Meter von ihr, so folgt dir die Scheibe, sodass sie im Abstand von bis zu sechs Metern von dir bleibt. Sie kann sich über unebenes Gelände, Treppen, Abhänge und dergleichen bewegen, jedoch keinen Höhenunterschied von mindestens drei Metern überwinden. Beispielsweise kann die Scheibe nicht über eine drei Meter tiefe Grube hinwegschweben oder eine solche Grube verlassen, falls sie darin erschaffen wurde. Wenn du dich um mehr als 30 Meter von der Scheibe entfernst (meist, weil sie sich nicht um ein Hindernis bewegen kann, um dir zu folgen), endet der Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell creates a circular, horizontal plane of force, 3 feet in diameter and 1 inch thick, that floats 3 feet above the ground in an unoccupied space of your choice that you can see within range. The disk remains for the duration and can hold up to 500 pounds. If more weight is placed on it, the spell ends, and everything on the disk falls to the ground. The disk is immobile while you are within 20 feet of it. If you move more than 20 feet away from it, the disk follows you so that it remains within 20 feet of you. It can move across uneven terrain, up or down stairs, slopes and the like, but it can’t cross an elevation change of 10 feet or more. For example, the disk can’t move across a 10-foot-deep pit, nor could it leave such a pit if it was created at the bottom. If you move more than 100 feet from the disk (typically because it can’t move around an obstacle to follow you), the spell ends."
    }
   ]
  }
 },
 {
  "id": "fly",
  "name": {
   "de": "Flug",
   "en": "Fly"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 3 Transmutation (Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Feder)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a feather)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur. Für die Wirkungsdauer erhält das Ziel eine Flugbewegungsrate von 18 Metern und kann schweben. Wenn der Zauber endet und das Ziel noch fliegt, stürzt es ab, sofern es den Sturz nicht verhindern kann."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature. For the duration, the target gains a Fly Speed of 60 feet and can hover. When the spell ends, the target falls if it is still aloft unless it can stop the fall."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "fog-cloud",
  "name": {
   "de": "Nebelwolke",
   "en": "Fog Cloud"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Druide, Magier, Waldläufer, Zauberer)",
   "en": "Level 1 Conjuration (Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst eine Kugel aus Nebel mit einem Radius von sechs Metern um einen Punkt in Reichweite. Der Bereich in der Kugel ist komplett verschleiert. Die Kugel bleibt für die Wirkungsdauer bestehen, oder bis starker Wind (wie solcher durch Windstoß) sie auflöst."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Radius des Nebels um sechs Meter erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a 20-foot-radius Sphere of fog centered on a point within range. The Sphere is Heavily Obscured. It lasts for the duration or until a strong wind (such as one created by Gust of Wind) disperses it."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The fog’s radius increases by 20 feet for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "forbiddance",
  "name": {
   "de": "Zutritt verwehren",
   "en": "Forbiddance"
  },
  "gradzeile": {
   "de": "Bannzauber 6. Grades (Kleriker)",
   "en": "Level 6 Abjuration (Cleric)"
  },
  "grad": 6,
  "schule": "bann",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten oder Ritual",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Rubinstaub im Wert von mindestens 1.000 GM)",
    "dauer": "1 Tag"
   },
   "en": {
    "zeit": "10 minutes or Ritual",
    "reichweite": "Touch",
    "komponenten": "V, S, M (ruby dust worth 1,000+ GP)",
    "dauer": "1 day"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst einen Schutz gegen magische Reisen, der einen Bereich von bis zu 3.700 Quadratmetern mit einer Höhe von bis zu neun Metern über dem Boden abdeckt. Für die Wirkungsdauer können sich Kreaturen weder in den Bereich teleportieren noch Portale wie durch den Zauber Tor verwenden, um in den Bereich zu gelangen. Der Zauber schützt den Bereich gegen Ebenenreisen und verhindert damit, dass Kreaturen aus der Astralebene, der Ätherebene, der Feenwildnis, dem Schattensaum oder mit dem Zauber Ebenenwechsel in den Bereich gelangen. Außerdem fügt der Zauber Kreaturentypen, die du beim Wirken bestimmst, Schaden zu. Wähle mindestens einen der folgenden Kreaturentypen aus: Aberrationen, celestische Wesen, Feenwesen, Unholde und Untote. Wenn eine Kreatur eines ausgewählten Typs den Bereich des Zaubers in einem Zug erstmals betritt oder ihren Zug darin beendet, erleidet sie 5W10 gleißenden oder nekrotischen Schaden (nach deiner Wahl beim Wirken des Zaubers). Du kannst ein Kennwort festlegen, wenn du den Zauber wirkst. Spricht eine Kreatur das Kennwort aus, wenn sie den Bereich betritt, so erleidet sie durch den Zauber keinen Schaden. Der Bereich des Zaubers kann sich nicht mit dem Bereich eines anderen Zaubers Zutritt verwehren überschneiden. Wenn du Zutritt verwehren 30 Tage lang am selben Ort wirkst, bleibt der Effekt bestehen, bis er gebannt wird. Die Materialkomponenten werden beim letzten Wirken verbraucht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. For the duration, creatures can’t teleport into the area or use portals, such as those created by the Gate spell, to enter the area. The spell proofs the area against planar travel, and therefore prevents creatures from accessing the area by way of the Astral Plane, the Ethereal Plane, the Feywild, the Shadowfell, or the Plane Shift spell. In addition, the spell damages types of creatures that you choose when you cast it. Choose one or more of the following: Aberrations, Celestials, Elementals, Fey, Fiends, and Undead. When a creature of a chosen type enters the spell’s area for the first time on a turn or ends its turn there, the creature takes 5d10 Radiant or Necrotic damage (your choice when you cast this spell). You can designate a password when you cast the spell. A creature that speaks the password as it enters the area takes no damage from the spell. The spell’s area can’t overlap with the area of another Forbiddance spell. If you cast Forbiddance every day for 30 days in the same location, the spell lasts until it is dispelled, and the Material components are consumed on the last casting."
    }
   ]
  }
 },
 {
  "id": "forcecage",
  "name": {
   "de": "Energiekäfig",
   "en": "Forcecage"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 7. Grades (Barde, Hexenmeister, Magier)",
   "en": "Level 7 Evocation (Bard, Warlock, Wizard)"
  },
  "grad": 7,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "30 Meter",
    "komponenten": "V, G, M (Rubinstaub im Wert von mindestens 1.500 GM, den der Zauber verbraucht)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "100 feet",
    "komponenten": "V, S, M (ruby dust worth 1,500+ GP, which the spell consumes)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Um einen Bereich deiner Wahl in Reichweite entsteht ein unbewegliches, unsichtbares würfelförmiges Gefängnis aus magischer Energie. Dabei kann es sich um einen Käfig oder um einen soliden Kasten handeln (nach deiner Wahl). In Käfigform kann das Gefängnis eine Seitenlänge von bis zu sechs Metern haben. Es besteht aus Stangen und Zwischenräumen von jeweils einem Zentimeter Durchmesser. In Kastenform kann das Gefängnis eine Seitenlänge von bis zu drei Metern haben. Es handelt sich um eine solide, für Materie undurchdringliche Barriere, die außerdem in den Bereich hinein oder aus ihm heraus gewirkte Zauber blockiert. Wenn du den Zauber wirkst, ist jede Kreatur gefangen, die sich vollständig im Bereich des Käfigs befindet. Kreaturen, die sich nur zum Teil im Bereich befinden oder zu groß sind, um komplett hineinzupassen, werden von der Mitte des Bereichs aus weggestoßen, bis sie sich vollständig außerhalb befinden. Eine Kreatur im Energiekäfig kann diesen nur auf magische Art verlassen. Wenn sie versucht, ihn mit Teleportation oder Ebenenreisen zu verlassen, muss sie einen Charismarettungswurf ausführen. Bei einem erfolgreichen Rettungswurf gelingt es ihr, den Käfig mit dieser Magie zu verlassen. Misslingt der Wurf, so verlässt die Kreatur den Käfig nicht, und der Zauber oder Effekt ist vergeudet. Der Käfig erstreckt sich auch auf die Ätherebene und blockiert damit Reisen über diese Ebene. Dieser Zauber kann durch Magie bannen nicht aufgehoben werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An immobile, Invisible, Cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage or a solid box, as you choose. A prison in the shape of a cage can be up to 20 feet on a side and is made from 1/2-inch diameter bars spaced 1/2 inch apart. A prison in the shape of a box can be up to 10 feet on a side, creating a solid barrier that prevents any matter from passing through it and blocking any spells cast into or out from the area. When you cast the spell, any creature that is completely inside the cage’s area is trapped. Creatures only partially within the area, or those too large to fit inside it, are pushed away from the center of the area until they are completely outside it. A creature inside the cage can’t leave it by nonmagical means. If the creature tries to use teleportation or interplanar travel to leave, it must first make a Charisma saving throw. On a successful save, the creature can use that magic to exit the cage. On a failed save, the creature doesn’t exit the cage and wastes the spell or effect. The cage also extends into the Ethereal Plane, blocking ethereal travel. This spell can’t be dispelled by Dispel Magic."
    }
   ]
  }
 },
 {
  "id": "foresight",
  "name": {
   "de": "Voraussicht",
   "en": "Foresight"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 9. Grades (Barde, Druide, Hexenmeister, Magier)",
   "en": "Level 9 Divination (Bard, Druid, Warlock, Wizard)"
  },
  "grad": 9,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Kolibrifeder)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a hummingbird feather)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur und verleihst ihr die eingeschränkte Fähigkeit, in die unmittelbare Zukunft zu blicken. Für die Wirkungsdauer ist das Ziel bei W20‑Prüfungen im Vorteil, und andere Kreaturen sind bei Angriffswürfen gegen das Ziel im Nachteil. Der Zauber endet vorzeitig, wenn du ihn erneut wirkst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target has Advantage on D20 Tests, and other creatures have Disadvantage on attack rolls against it. The spell ends early if you cast it again."
    }
   ]
  }
 },
 {
  "id": "freedom-of-movement",
  "name": {
   "de": "Bewegungsfreiheit",
   "en": "Freedom of Movement"
  },
  "gradzeile": {
   "de": "Bannzauber 4. Grades (Barde, Druide, Kleriker, Waldläufer)",
   "en": "Level 4 Abjuration (Bard, Cleric, Druid, Ranger)"
  },
  "grad": 4,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Lederriemen)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a leather strap)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur. Für die Wirkungsdauer ist die Bewegungsrate des Ziels auf schwierigem Gelände nicht eingeschränkt. Zudem können Zauber und andere magische Effekte weder seine Bewegungsrate verringern noch das Ziel lähmen oder festsetzen. Das Ziel hat ferner eine Schwimmbewegungsrate in Höhe seiner Bewegungsrate. Es kann außerdem 1,5 Meter seiner Bewegungsrate verbrauchen, um nichtmagischen Fesseln (beispielsweise Handschellen oder einer Kreatur, die es gepackt hält) automatisch zu entkommen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature. For the duration, the target’s movement is unaffected by Difficult Terrain, and spells and other magical effects can neither reduce the target’s Speed nor cause the target to have the Paralyzed or Restrained conditions. The target also has a Swim Speed equal to its Speed. In addition, the target can spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature imposing the Grappled condition on it."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "freezing-sphere",
  "name": {
   "de": "Frostsphäre",
   "en": "Freezing Sphere"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 6. Grades (Magier, Zauberer)",
   "en": "Level 6 Evocation (Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "90 Meter",
    "komponenten": "V, G, M (eine Miniatur-Kristallkugel)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "300 feet",
    "komponenten": "V, S, M (a miniature crystal sphere)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt eine eisige Kugel an einen Punkt deiner Wahl in Reichweite, wo sie zu einer Kugel mit einem Radius von 18 Metern explodiert. Jede Kreatur in diesem Bereich führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 10W6 Kälteschaden, anderenfalls die Hälfte. Wenn die Kugel ein Gewässer trifft, so gefriert dieses in einem quadratischen Bereich von neun Metern Kantenlänge bis in eine Tiefe von 15 Zentimetern. Das Eis bleibt eine Minute lang bestehen. Kreaturen, die an der Oberfläche des gefrorenen Wassers schwimmen, werden im Eis gefangen und sind festgesetzt. Eine gefangene Kreatur kann als Aktion einen Stärkewurf (Athletik) gegen deinen Zauberrettungswurf‑SG ausführen, um sich zu befreien. Du musst die Kugel nach dem Wirken des Zaubers nicht sofort verschießen. In diesem Fall erscheint eine kleine kühle Kugel von der Größe eines Schleudersteins in deiner Hand. Du oder eine Kreatur, der du die Kugel gibst, kann sie jederzeit bis zu zwölf Meter weit werfen oder mit einer Schleuder innerhalb ihrer Grundreichweite verschießen. Die Kugel zerbirst beim Aufprall und bewirkt den gleichen Effekt wie das normale Wirken des Zaubers. Du kannst die Kugel auch ablegen, ohne dass sie zerbirst. Ist sie nach einer Minute nicht zerborsten, so explodiert sie."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A frigid globe streaks from you to a point of your choice within range, where it explodes in a 60-foot-radius Sphere. Each creature in that area makes a Constitution saving throw, taking 10d6 Cold damage on failed save or half as much damage on a successful one. If the globe strikes a body of water, it freezes the water to a depth of 6 inches over an area 30 feet square. This ice lasts for 1 minute. Creatures that were swimming on the surface of frozen water are trapped in the ice and have the Restrained condition. A trapped creature can take an action to make a Strength (Athletics) check against your spell save DC to break free. You can refrain from firing the globe after completing the spell’s casting. If you do so, a globe about the size of a sling bullet, cool to the touch, appears in your hand. At any time, you or a creature you give the globe to can throw the globe (to a range of 40 feet) or hurl it with a sling (to the sling’s normal range). It shatters on impact, with the same effect as a normal casting of the spell. You can also set the globe down without shattering it. After 1 minute, if the globe hasn’t already shattered, it explodes."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "gaseous-form",
  "name": {
   "de": "Gasförmige Gestalt",
   "en": "Gaseous Form"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 3 Transmutation (Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Stück Gaze)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a bit of gauze)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer verwandelt sich eine bereitwillige Kreatur, die du berührst, mitsamt ihrer Ausrüstung in eine Nebelwolke. Der Zauber endet beim Ziel, wenn seine Trefferpunkte auf 0 sinken oder es den Zauber mithilfe einer magischen Aktion selbst beendet. In dieser Gestalt verfügt das Ziel als einzige Bewegungsrate über eine Flugbewegungsrate von drei Metern, und es kann schweben. Das Ziel kann den Bereich einer anderen Kreatur betreten und besetzen. Es ist gegen Hieb ‑, Stich‑ und Wuchtschaden resistent, gegen den Zustand Liegend immun und bei Stärke ‑, Geschicklichkeits‑ und Konstitutionsrettungswürfen im Vorteil. Es kann kleine Öffnungen passieren, behandelt jedoch Flüssigkeiten wie solide Oberflächen. Das Ziel kann weder sprechen noch mit Gegenständen interagieren. Es kann Gegenstände, die es getragen oder gehalten hat, nicht fallenlassen, verwenden oder anderweitig mit ihnen interagieren. Außerdem kann es weder angreifen noch Zauber wirken."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A willing creature you touch shape-shifts, along with everything it’s wearing and carrying, into a misty cloud for the duration. The spell ends on the target if it drops to 0 Hit Points or if it takes a Magic action to end the spell on itself. While in this form, the target’s only method of movement is a Fly Speed of 10 feet, and it can hover. The target can enter and occupy the space of another creature. The target has Resistance to Bludgeoning, Piercing, and Slashing damage; it has Immunity to the Prone condition; and it has Advantage on Strength, Dexterity, and Constitution saving throws. The target can pass through narrow openings, but it treats liquids as though they were solid surfaces. The target can’t talk or manipulate objects, and any objects it was carrying or holding can’t be dropped, used, or otherwise interacted with. Finally, the target can’t attack or cast spells."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "gate",
  "name": {
   "de": "Tor",
   "en": "Gate"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 9. Grades (Hexenmeister, Kleriker, Magier, Zauberer)",
   "en": "Level 9 Conjuration (Cleric, Sorcerer, Warlock, Wizard)"
  },
  "grad": 9,
  "schule": "beschwoerung",
  "klassen": [
   "hexenmeister",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Diamant im Wert von mindestens 5.000 GM)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a diamond worth 5,000+ GP)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst ein Portal, das einen freien Bereich in Reichweite, den du sehen kannst, mit einem bestimmten Ort auf einer anderen Existenzebene verbindet. Bei dem Portal handelt es sich um eine kreisrunde Öffnung mit einem Radius von 1,5 bis sechs Metern. Du kannst das Portal in eine beliebige Richtung ausrichten. Es bleibt für die Wirkungsdauer bestehen, und der Zielort ist durch das Portal hindurch sichtbar. Das Portal hat auf beiden Ebenen eine Vorder‑ und eine Rückseite. Reisen durch das Portal sind nur durch die Vorderseite möglich. Alles, was das Portal passiert, wird sofort auf die andere Ebene transportiert und erscheint in einem freien Bereich, der dem Portal am nächsten liegt. Gottheiten und andere Herrscher über die Ebenen können verhindern, dass sich Portale dieses Zaubers in ihrer Gegenwart oder in ihren Domänen öffnen. Wenn du diesen Zauber wirkst, kannst du den Namen einer bestimmten Kreatur aussprechen (Pseudonyme, Titel und Spitznamen funktionieren nicht). Befindet sich die Kreatur auf einer anderen Ebene als du, so öffnet sich das Portal neben ihr und transportiert sie in den nächstgelegenen freien Bereich auf deiner Seite des Portals. Du erlangst keine besondere Macht über die Kreatur und sie handelt nach Ermessen des SL. Sie kann verschwinden, dich angreifen oder dir helfen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration, and the portal’s destination is visible through it. The portal has a front and a back on each plane where it appears. Travel through the portal is possible only by moving through its front. Anything that does so is instantly transported to the other plane, appearing in the unoccupied space nearest to the portal. Deities and other planar rulers can prevent portals created by this spell from opening in their presence or anywhere within their domains. When you cast this spell, you can speak the name of a specific creature (a pseudonym, title, or nickname doesn’t work). If that creature is on a plane other than the one you are on, the portal opens next to the named creature and transports it to the nearest unoccupied space on your side of the portal. You gain no special power over the creature, and it is free to act as the GM deems appropriate. It might leave, attack you, or help you."
    }
   ]
  }
 },
 {
  "id": "geas",
  "name": {
   "de": "Geas",
   "en": "Geas"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 5. Grades (Barde, Druide, Kleriker, Magier, Paladin)",
   "en": "Level 5 Enchantment (Bard, Cleric, Druid, Paladin, Wizard)"
  },
  "grad": 5,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "magier",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "30 Tage"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "30 days"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erteilst einer Kreatur in Reichweite, die du sehen kannst, den verbalen Befehl, eine Aufgabe zu erfüllen oder eine bestimmte Aktion oder Handlungsrichtung deiner Wahl zu unterlassen. Das Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer bezaubert. Es besteht den Rettungswurf automatisch, wenn es deinen Befehl nicht verstehen kann. Die bezauberte Kreatur erleidet 5W10 psychischen Schaden, wenn sie sich deinem Befehl gegensätzlich verhält. Sie kann diesen Schaden höchstens einmal täglich erleiden. Du kannst einen beliebigen Befehl erteilen, jedoch keine Handlungen, die zum sicheren Tod führen würden. Erteilst du einen selbstmörderischen Befehl, so endet der Zauber. Auch die Zauber Fluch brechen, Vollständige Genesung oder Wunsch beenden den Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Bei einem Zauberplatz des 7. oder 8. Grades beträgt die Wirkungsdauer 365 Tage. Bei einem Zauberplatz des 9. Grades hält der Zauber an, bis er durch einen der oben genannten Zauber gebannt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You give a verbal command to a creature that you can see within range, ordering it to carry out some service or refrain from an action or a course of activity as you decide. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target automatically succeeds if it can’t understand your command. While Charmed, the creature takes 5d10 Psychic damage if it acts in a manner directly counter to your command. It takes this damage no more than once each day. You can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends. A Remove Curse, Greater Restoration, or Wish spell ends this spell."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. If you use a level 7 or 8 spell slot, the duration is 365 days. If you use a level 9 spell slot, the spell lasts until it is ended by one of the spells mentioned above."
    }
   ]
  }
 },
 {
  "id": "gentle-repose",
  "name": {
   "de": "Sanfte Ruhe",
   "en": "Gentle Repose"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 2. Grades (Kleriker, Magier, Paladin)",
   "en": "Level 2 Necromancy (Cleric, Paladin, Wizard)"
  },
  "grad": 2,
  "schule": "nekromantie",
  "klassen": [
   "kleriker",
   "magier",
   "paladin"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (2 Kupfermünzen, die der Zauber verbraucht)",
    "dauer": "10 Tage"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Touch",
    "komponenten": "V, S, M (2 Copper Pieces, which the spell consumes)",
    "dauer": "10 days"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst einen Leichnam oder andere sterbliche Überreste. Für die Wirkungsdauer ist das Ziel vor Verwesung geschützt und kann nicht untot werden. Der Zauber verlängert dadurch auch die Dauer, in der das Ziel wiederbelebt werden kann, da die Tage unter dem Einfluss dieses Zaubers bei Zaubern wie Tote erwecken nicht als verstrichene Zeit zählen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a corpse or other remains. For the duration, the target is protected from decay and can’t become Undead. The spell also effectively extends the time limit on raising the target from the dead, since days spent under the influence of this spell don’t count against the time limit of spells such as Raise Dead."
    }
   ]
  }
 },
 {
  "id": "giant-insect",
  "name": {
   "de": "Rieseninsekt",
   "en": "Giant Insect"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Druide)",
   "en": "Level 4 Conjuration (Druid)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du rufst einen Riesentausendfüßler, eine Riesenspinne oder eine Riesenwespe (nach deiner Wahl, wenn du den Zauber wirkst) herbei. Die Kreatur manifestiert sich in einem freien Bereich in Reichweite, den du sehen kannst, und verwendet den Wertekasten eines Rieseninsekts. Einige Details im Wertekasten werden von der ausgewählten Gestalt bestimmt. Die Kreatur verschwindet, wenn ihre Trefferpunkte auf 0 sinken oder der Zauber endet. Die Kreatur ist mit dir und deinen Verbündeten verbündet. Im Kampf nutzt sie deinen Initiativewert und ist direkt nach dir am Zug. Sie gehorcht deinen mündlichen Befehlen (keine Aktion deinerseits erforderlich). Befiehlst du ihr nichts, so führt sie die Ausweichaktion aus und nutzt ihre Bewegung, um Gefahren zu vermeiden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Verwende den Zauberplatzgrad als Zaubergrad im Wertekasten."
    },
    {
     "typ": "liste",
     "titel": "Rieseninsekt",
     "eintraege": [
      "Großes Tier, gesinnungslos",
      "RK 11 + Zaubergrad",
      "TP 30 + 10 für jeden Zaubergrad ab dem 4.",
      "Bewegungsrate 12 m, Klettern 12 m, Fliegen 12 m (nur Wespe) MOD RW MOD RW MOD RW",
      "Stä 17 +3 +3 GeS 13 +1 +1 Kon 15 +2 +2",
      "Int 4 −3 −3 WeI 14 +2 +2 Cha 3 −4 −4",
      "Sinne Dunkelsicht 18 m; Passive Wahrnehmung 12",
      "Sprachen Versteht die Sprachen, die du sprichst",
      "HG − (EP 0, ÜB entspricht deinem Übungsbonus)",
      "Merkmale",
      "Spinnenklettern: Das Insekt kann ohne Attributswürfe schwierige Oberflächen erklimmen und sich an Decken entlang bewegen.",
      "Aktionen",
      "Mehrfachangriff: Das Insekt führt eine Anzahl von Angriffen aus, die der Hälfte des Zaubergrads entspricht (abgerundet).",
      "Giftstich: Nahkampfangriffswurf: Bonus in Höhe deines Zauberangriff-Modifikators, Reichweite 3 m. Treffer: 1W6+3 plus Zaubergrad Stichschaden sowie 1W4 Giftschaden.",
      "Netzbolzen (nur Spinne): Fernkampfangriffswurf: Bonus in Höhe deines Zauberangriff-Modifikators, Reichweite 18 m. Treffer: 1W10+3 plus Zaubergrad Wuchtschaden, und die Bewegungsrate des Ziels ist bis zum Beginn seines nächsten Zugs auf 0 verringert.",
      "Bonusaktionen",
      "Giftspeien (nur Tausendfüßler): Konstitutionsrettungswurf: Dein Zauberrettungswurf-SG, eine Kreatur im Abstand von bis zu drei Metern, die vom Insekt gesehen werden kann. Misserfolg: Das Ziel ist bis zum Beginn des nächsten Zugs des Insekts vergiftet."
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You summon a giant centipede, spider, or wasp (chosen when you cast the spell). It manifests in an unoccupied space you can see within range and uses the Giant Insect stat block. The form you choose determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends. The creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don’t issue any, it takes the Dodge action and uses its movement to avoid danger."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Use the spell slot’s level for the spell’s level in the stat block."
    },
    {
     "typ": "liste",
     "titel": "Giant Insect",
     "eintraege": [
      "Large Beast, Unaligned",
      "AC 11 + the spell’s level",
      "HP 30 + 10 for each spell level above 4",
      "Speed 40 ft., Climb 40 ft., Fly 40 ft. (Wasp only) MOD SAVE MOD SAVE MOD SAVE",
      "Str 17 +3 +3 dex 13 +1 +1 con 15 +2 +2",
      "int 4 −3 −3 WiS 14 +2 +2 chA 3 −4 −4",
      "Senses Darkvision 60 ft.; Passive Perception 12",
      "Languages Understands the languages you know",
      "CR None (XP 0; PB equals your Proficiency Bonus)",
      "Traits",
      "Spider Climb. The insect can climb difficult surfaces, including along ceilings, without needing to make an ability check.",
      "Actions",
      "Multiattack. The insect makes a number of attacks equal to half this spell’s level (round down).",
      "Poison Jab. Melee Attack Roll: Bonus equals your spell attack modifier, reach 10 ft. Hit: 1d6 + 3 plus the spell’s level Piercing damage plus 1d4 Poison damage.",
      "Web Bolt (Spider Only). Ranged Attack Roll: Bonus equals your spell attack modifier, range 60 ft. Hit: 1d10 + 3 plus the spell’s level Bludgeoning damage, and the target’s Speed is reduced to 0 until the start of the insect’s next turn.",
      "Bonus Actions",
      "Venomous Spew (Centipede Only). Constitution Saving Throw: Your spell save DC, one creature the insect can see within 10 feet. Failure: The target has the Poisoned condition until the start of the insect’s next turn."
     ]
    }
   ]
  }
 },
 {
  "id": "glibness",
  "name": {
   "de": "Redegewandtheit",
   "en": "Glibness"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 8. Grades (Barde, Hexenmeister)",
   "en": "Level 8 Enchantment (Bard, Warlock)"
  },
  "grad": 8,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer kannst du das Ergebnis deiner Charismawürfe durch eine 15 ersetzen. Magie, die ermittelt, ob du die Wahrheit sagst, zeigt stets an, dass du die Wahrheit sagst – egal, was du in Wirklichkeit von dir gibst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful."
    }
   ]
  }
 },
 {
  "id": "globe-of-invulnerability",
  "name": {
   "de": "Kugel der Unverwundbarkeit",
   "en": "Globe of Invulnerability"
  },
  "gradzeile": {
   "de": "Bannzauber 6. Grades (Magier, Zauberer)",
   "en": "Level 6 Abjuration (Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "bann",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine Glasperle)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a glass bead)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einer Ausströmung von drei Metern erscheint für die Wirkungsdauer eine unbewegliche schimmernde Barriere um dich herum. Jeder Zauber des höchstens 5. Grades, der von außerhalb der Barriere gewirkt wird, hat keinen Effekt auf Kreaturen oder Gegenstände im Innern. Ein solcher Zauber kann Kreaturen und Gegenstände innerhalb der Barriere zum Ziel haben, hat jedoch keinen Effekt auf sie. Gleichermaßen ist der Bereich innerhalb der Barriere von Wirkungsbereichen solcher Zauber ausgeschlossen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. blockiert die Barriere einen Grad höhere Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An immobile, shimmering barrier appears in a 10foot Emanation around you and remains for the duration. Any spell of level 5 or lower cast from outside the barrier can’t affect anything within it. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them. Similarly, the area within the barrier is excluded from areas of effect created by such spells."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The barrier blocks spells of 1 level higher for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "glyph-of-warding",
  "name": {
   "de": "Glyphe des Schutzes",
   "en": "Glyph of Warding"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Barde, Kleriker, Magier)",
   "en": "Level 3 Abjuration (Bard, Cleric, Wizard)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "barde",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Diamantpulver im Wert von mindestens 200 GM, das der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt oder die Glyphe ausgelöst wird"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "Touch",
    "komponenten": "V, S, M (powdered diamond worth 200+ GP, which the spell consumes)",
    "dauer": "Until dispelled or triggered"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erzeugst eine Glyphe, die später einen magischen Effekt bewirkt. Diese Glyphe zeichnest du entweder auf eine Oberfläche (wie einen Tisch oder den Fußboden) oder in einen Gegenstand (wie ein Buch oder eine Truhe), der geschlossen werden kann, um die Glyphe zu verbergen. Die Glyphe kann höchstens in einem Radius von 1,5 Metern wirken. Wenn die Oberfläche oder der Gegenstand um mehr als drei Meter von der Stelle entfernt wird, an der du den Zauber gewirkt hast, wird die Glyphe zerstört, und der Zauber endet, ohne ausgelöst zu werden. Die Glyphe ist kaum wahrnehmbar. Es ist ein erfolgreicher Weisheitswurf (Wahrnehmung) gegen deinen Zauberrettungswurf‑SG erforderlich, um sie zu bemerken. Wenn du die Glyphe zeichnest, bestimmst du ihren Auslöser und legst fest, ob es sich um eine explosive Rune oder eine Zauberglyphe wie unten beschrieben handelt."
    },
    {
     "typ": "punkt",
     "text": "Auslöser bestimmen: Wenn du den Zauber wirkst, bestimmst du einen Auslöser für die Glyphe. Glyphen auf Oberflächen werden meist dadurch ausgelöst, dass jemand sie berührt oder betritt, einen Gegenstand bewegt, der die Glyphe verdeckt, oder einen Mindestabstand zur Glyphe unterschreitet. Glyphen in Gegenständen werden meist dadurch ausgelöst, dass jemand den Gegenstand öffnet oder die Glyphe sieht. Sobald die Glyphe ausgelöst wurde, endet der Zauber. Du kannst den Auslöser verfeinern, sodass die Glyphe nur von bestimmten Kreaturentypen ausgelöst wird (beispielsweise könnte die Glyphe nur auf Aberrationen wirken). Du kannst auch Bedingungen festlegen, unter denen die Glyphe nicht ausgelöst wird, beispielsweise wenn ein bestimmtes Kennwort ausgesprochen wird."
    },
    {
     "typ": "punkt",
     "text": "Explosive Rune: Wird die Glyphe ausgelöst, so explodiert ihre magische Energie in einer Kugel mit einem Radius von sechs Metern um sie. Jede Kreatur in diesem Bereich führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 5W8 Blitz‑, Feuer ‑, Kälte‑, Säure‑ oder Schallschaden (nach deiner Wahl beim Schreiben der Glyphe), anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Zauberglyphe: Beim Erschaffen der Glyphe kannst du einen vorbereiteten Zauber des höchstens 3. Grades wirken und in der Glyphe speichern. Der Zauber muss eine einzelne Kreatur oder einen Bereich zum Ziel haben. Wenn er auf diese Weise gewirkt wird, hat der Zauber keinen unmittelbaren Effekt. Er wirkt erst, wenn die Glyphe ausgelöst wird. Wenn der Zauber ein Ziel braucht, wird die Kreatur ausgewählt, welche die Glyphe auslöst. Wirkt der Zauber auf einen Bereich, so ist dieser auf die Kreatur zentriert. Wenn der Zauber feindlich gesinnte Kreaturen beschwört oder schädliche Gegenstände oder Fallen erschafft, erscheinen sie so nahe wie möglich beim Eindringling und greifen ihn an. Erfordert der Zauber Konzentration, so hält diese bis zum Ende der vollen Wirkungsdauer an."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird der Schaden einer explosiven Rune um 1W8 erhöht. In einer Zauberglyphe kannst du Zauber bis zum Grad des Zauberplatzes speichern, den du zum Wirken der Glyphe des Schutzes verwendet hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You inscribe a glyph that later unleashes a magical effect. You inscribe it either on a surface (such as a table or a section of floor) or within an object that can be closed (such as a book or chest) to conceal the glyph. The glyph can cover an area no larger than 10 feet in diameter. If the surface or object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered. The glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice. When you inscribe the glyph, you set its trigger and choose whether it’s an explosive rune or a spell glyph, as explained below."
    },
    {
     "typ": "punkt",
     "text": "Set the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph. Once a glyph is triggered, this spell ends. You can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don’t trigger the glyph, such as those who say a certain password."
    },
    {
     "typ": "punkt",
     "text": "Explosive Rune. When triggered, the glyph erupts with magical energy in a 20-foot-radius Sphere centered on the glyph. Each creature in the area makes a Dexterity saving throw. A creature takes 5d8 Acid, Cold, Fire, Lightning, or Thunder damage (your choice when you create the glyph) on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Spell Glyph. You can store a prepared spell of level 3 or lower in the glyph by casting it as part of creating the glyph. The spell must target a single creature or an area. The spell being stored has no immediate effect when cast in this way. When the glyph is triggered, the stored spell takes effect. If the spell has a target, it targets the creature that triggered the glyph. If the spell affects an area, the area is centered on that creature. If the spell summons Hostile creatures or creates harmful objects or traps, they appear as close as possible to the intruder and attack it. If the spell requires Concentration, it lasts until the end of its full duration."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage of an explosive rune increases by 1d8 for each spell slot level above 3. If you create a spell glyph, you can store any spell of up to the same level as the spell slot you use for the Glyph of Warding."
    }
   ]
  }
 },
 {
  "id": "goodberry",
  "name": {
   "de": "Gute Beeren",
   "en": "Goodberry"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Druide, Waldläufer)",
   "en": "Level 1 Conjuration (Druid, Ranger)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Mistelzweig)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a sprig of mistletoe)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In deiner Hand erscheinen zehn Beeren, die für die Wirkungsdauer von Magie erfüllt sind. Kreaturen können eine Bonusaktion ausführen, um eine Beere zu verzehren. Dadurch wird 1 Trefferpunkt wiederhergestellt, und die Beere bietet der Kreatur genügend Nahrung für einen Tag. Wenn der Zauber endet, verschwinden Beeren, die nicht verzehrt wurden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Ten berries appear in your hand and are infused with magic for the duration. A creature can take a Bonus Action to eat one berry. Eating a berry restores 1 Hit Point, and the berry provides enough nourishment to sustain a creature for one day. Uneaten berries disappear when the spell ends."
    }
   ]
  }
 },
 {
  "id": "grease",
  "name": {
   "de": "Schmieren",
   "en": "Grease"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Conjuration (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Stück Schweineschwarte oder Butter)",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a bit of pork rind or butter)",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem quadratischen Bereich mit drei Metern Kantenlänge um einen Punkt in Reichweite bedeckt nichtbrennbares Fett den Boden und macht ihn für die Wirkungsdauer zu schwierigem Gelände. Wenn das Schmierfett erscheint, muss jede Kreatur in diesem Bereich einen Geschicklichkeitsrettungswurf bestehen, oder sie rutscht aus und stürzt hin, sodass sie den Zustand Liegend hat. Auch Kreaturen, die den Bereich betreten oder ihren Zug darin beginnen, müssen diesen Rettungswurf bestehen, um nicht auszurutschen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Nonflammable grease covers the ground in a 10foot square centered on a point within range and turns it into Difficult Terrain for the duration. When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or have the Prone condition. A creature that enters the area or ends its turn there must also succeed on that save or fall Prone."
    }
   ]
  }
 },
 {
  "id": "greater-invisibility",
  "name": {
   "de": "Mächtige Unsichtbarkeit",
   "en": "Greater Invisibility"
  },
  "gradzeile": {
   "de": "Illusionszauber 4. Grades (Barde, Magier, Zauberer)",
   "en": "Level 4 Illusion (Bard, Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur, die du berührst, wird unsichtbar, bis der Zauber endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature you touch has the Invisible condition until the spell ends."
    }
   ]
  }
 },
 {
  "id": "greater-restoration",
  "name": {
   "de": "Vollständige Genesung",
   "en": "Greater Restoration"
  },
  "gradzeile": {
   "de": "Bannzauber 5. Grades (Barde, Druide, Kleriker, Paladin, Waldläufer)",
   "en": "Level 5 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)"
  },
  "grad": 5,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Diamantstaub im Wert von mindestens 100 GM, den der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (diamond dust worth 100+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur und hebst auf magische Art einen der folgenden Effekte bei ihr auf: • 1 Erschöpfungsstufe • Einen der Zustände Bezaubert oder Versteinert • Einen Fluch oder die Einstimmung des Ziels auf einen verfluchten magischen Gegenstand • Jegliche Verringerung eines der Attributswerte des Ziels • Jegliche Verringerung des Trefferpunktemaximums des Ziels"
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature and magically remove one of the following effects from it: • 1 Exhaustion level • The Charmed or Petrified condition • A curse, including the target’s Attunement to a cursed magic item • Any reduction to one of the target’s ability scores • Any reduction to the target’s Hit Point maximum"
    }
   ]
  }
 },
 {
  "id": "guardian-of-faith",
  "name": {
   "de": "Hüter des Glaubens",
   "en": "Guardian of Faith"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Kleriker)",
   "en": "Level 4 Conjuration (Cleric)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem freien Bereich in Reichweite, den du sehen kannst, erscheint ein großer geisterhafter Wächter und schwebt dort für die Wirkungsdauer. Der Wächter besetzt diesen Bereich und ist unverwundbar. Er erscheint in einer Gestalt, die deiner Gottheit oder deinem Pantheon entspricht. Ein Gegner, der sich in einem Zug erstmals in einen Bereich im Abstand von bis zu drei Metern vom Wächter bewegt oder den Zug dort beginnt, führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet er 20 gleißenden Schaden, anderenfalls die Hälfte. Wenn der Wächter insgesamt 60 Schaden bewirkt hat, verschwindet er."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Large spectral guardian appears and hovers for the duration in an unoccupied space that you can see within range. The guardian occupies that space and is invulnerable, and it appears in a form appropriate for your deity or pantheon. Any enemy that moves to a space within 10 feet of the guardian for the first time on a turn or starts its turn there makes a Dexterity saving throw, taking 20 Radiant damage on a failed save or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage."
    }
   ]
  }
 },
 {
  "id": "guards-and-wards",
  "name": {
   "de": "Wächter und Hüter",
   "en": "Guards and Wards"
  },
  "gradzeile": {
   "de": "Bannzauber 6. Grades (Barde, Magier)",
   "en": "Level 6 Abjuration (Bard, Wizard)"
  },
  "grad": 6,
  "schule": "bann",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Silberstab im Wert von mindestens 10 GM)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a silver rod worth 10+ GP)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst einen Schutz, der einen Bereich von bis zu 225 Quadratmetern auf dem Boden abdeckt. Der geschützte Bereich kann bis zu sechs Meter hoch sein. Du kannst ihn als Quadrat mit 15 Metern Kantenlänge, als hundert aneinandergrenzende Quadrate mit 1,5 Metern Kantenlänge oder als 25 aneinandergrenzende Quadrate mit drei Metern Kantenlänge formen. Wenn du diesen Zauber wirkst, kannst du Individuen bestimmen, die von seinen Effekten nicht betroffen sind. Du kannst auch ein Kennwort festlegen, das den Sprecher gegen die Effekte immunisiert, wenn es im Abstand von bis zu 1,5 Metern vom geschützten Bereich ausgesprochen wird. Der Zauber erzeugt im geschützten Bereich die unten genannten Effekte. Magie bannen hat keinen Effekt auf Wächter und Hüter selbst, aber jeder der folgenden Effekte kann gebannt werden. Werden alle vier Effekte gebannt, so endet Wächter und Hüter. Wenn du den Zauber 365 Tage lang täglich auf denselben Bereich wirkst, bleibt er wirksam, bis seine Effekte aufgelöst werden."
    },
    {
     "typ": "punkt",
     "text": "Korridore: Alle geschützten Korridore sind mit Nebel erfüllt und dadurch komplett verschleiert. Außerdem besteht an jeder Kreuzung oder Abzweigung eine Chance von 50 Prozent, dass eine Kreatur (außer dir selbst) glaubt, in die entgegengesetzte Richtung zu gehen."
    },
    {
     "typ": "punkt",
     "text": "Treppen: Alle Treppen im geschützten Bereich werden von der Decke bis zum Boden von Spinnennetzen blockiert, so wie beim Zauber Netz. Wenn die Fäden zerstört werden, wachsen sie für die Wirkungsdauer von Wächter und Hüter innerhalb von zehn Minuten nach."
    },
    {
     "typ": "punkt",
     "text": "Türen: Alle Türen im geschützten Bereich sind auf magische Art verschlossen, wie durch den Zauber Arkanes Schloss. Außerdem kannst du bis zu zehn Türen mit einer Illusion verbergen, sodass sie als normale Wand erscheinen."
    },
    {
     "typ": "punkt",
     "text": "Andere Zaubereffekte: Platziere einen der folgenden magischen Effekte im geschützten Bereich: • Tanzende Lichter in vier Korridoren mit einem einfachen Muster, das die Lichter für die Wirkungsdauer von Wächter und Hüter wiederholen • Magischer Mund an zwei Orten • Stinkende Wolke an zwei Orten (solange Wächter und Hüter wirkt, kehren die Dämpfe nach zehn Minuten zurück, wenn sie aufgelöst werden) • Windstoß in einem Korridor oder Raum (der Wind weht für die Wirkungsdauer kontinuierlich) • Einflüsterung in einem Würfel mit 1,5 Metern Kantenlänge. Jede Kreatur, die den Würfel betritt, erhält die Einflüsterung mental"
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a ward that protects up to 2,500 square feet of floor space. The warded area can be up to 20 feet tall, and you shape it as one 50-foot square, one hundred 5-foot squares that are contiguous, or twenty-five 10-foot squares that are contiguous. When you cast this spell, you can specify individuals that are unaffected by the spell’s effects. You can also specify a password that, when spoken aloud within 5 feet of the warded area, makes the speaker immune to its effects. The spell creates the effects below within the warded area. Dispel Magic has no effect on Guards and Wards itself, but each of the following effects can be dispelled. If all four are dispelled, Guards and Wards ends. If you cast the spell every day for 365 days on the same area, the spell thereafter lasts until all its effects are dispelled."
    },
    {
     "typ": "punkt",
     "text": "Corridors. Fog fills all the warded corridors, making them Heavily Obscured. In addition, at each intersection or branching passage offering a choice of direction, there is a 50 percent chance that a creature other than you believes it is going in the opposite direction from the one it chooses."
    },
    {
     "typ": "punkt",
     "text": "Doors. All doors in the warded area are magically locked, as if sealed by the Arcane Lock spell. In addition, you can cover up to ten doors with an illusion to make them appear as plain sections of wall."
    },
    {
     "typ": "punkt",
     "text": "Stairs. Webs fill all stairs in the warded area from top to bottom, as in the Web spell. These strands regrow in 10 minutes if they are destroyed while Guards and Wards lasts."
    },
    {
     "typ": "punkt",
     "text": "Other Spell Effect. Place one of the following magical effects within the warded area: • Dancing Lights in four corridors, with a simple program that the lights repeat as long as Guards and Wards lasts • Magic Mouth in two locations • Stinking Cloud in two locations (the vapors return within 10 minutes if dispersed while Guards and Wards lasts) • Gust of Wind in one corridor or room (the wind blows continuously while the spell lasts) • Suggestion in one 5-foot square; any creature that enters that square receives the suggestion mentally"
    }
   ]
  }
 },
 {
  "id": "guidance",
  "name": {
   "de": "Göttliche Führung",
   "en": "Guidance"
  },
  "gradzeile": {
   "de": "Zaubertrick der Erkenntnis (Druide, Kleriker)",
   "en": "Divination Cantrip (Cleric, Druid)"
  },
  "grad": 0,
  "schule": "erkenntnis",
  "klassen": [
   "druide",
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur und wählst eine Fertigkeit aus. Bis der Zauber endet, fügt die Kreatur jedem Attributswurf, der die ausgewählte Fertigkeit verwendet, 1W4 hinzu."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature and choose a skill. Until the spell ends, the creature adds 1d4 to any ability check using the chosen skill."
    }
   ]
  }
 },
 {
  "id": "guiding-bolt",
  "name": {
   "de": "Lenkendes Geschoss",
   "en": "Guiding Bolt"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Kleriker)",
   "en": "Level 1 Evocation (Cleric)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "1 Runde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "1 round"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst einen Lichtblitz auf eine Kreatur in Reichweite. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet es 4W6 gleißenden Schaden, und der nächste Angriffswurf, der vor dem Ende deines nächsten Zugs gegen es ausgeführt wird, ist im Vorteil."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You hurl a bolt of light toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 4d6 Radiant damage, and the next attack roll made against it before the end of your next turn has Advantage."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "gust-of-wind",
  "name": {
   "de": "Windstoß",
   "en": "Gust of Wind"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Druide, Magier, Waldläufer, Zauberer)",
   "en": "Level 2 Evocation (Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Hülsenfruchtsamen)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a legume seed)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer weht von dir ausgehend ein starker Wind in einer Linie mit 18 Metern Länge und drei Metern Breite in eine Richtung deiner Wahl. Jede Kreatur innerhalb der Linie muss einen Stärkerettungswurf bestehen, oder sie wird entlang der Linie 4,5 Meter weit von dir weggestoßen. Eine Kreatur, die ihren Zug innerhalb der Linie beendet, muss den Rettungswurf ebenfalls ausführen. Jede Kreatur innerhalb der Linie muss für jeden Meter, den sie sich auf dich zubewegt, zwei Meter ihrer Bewegungsrate verbrauchen. Der Windstoß zerstreut Gas und Dampf und löscht Kerzen und ähnliche ungeschützte Flammen in seinem Bereich. Geschützte Flammen wie die von Laternen flackern wild. Es besteht eine Chance von 50 Prozent, dass sie gelöscht werden. Für die Wirkungsdauer kannst du als Bonusaktion in deinen folgenden Zügen die Richtung ändern, in die der Wind weht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the duration. Each creature in the Line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction following the Line. A creature that ends its turn in the Line must make the same save. Any creature in the Line must spend 2 feet of movement for every 1 foot it moves when moving closer to you. The gust disperses gas or vapor, and it extinguishes candles and similar unprotected flames in the area. It causes protected flames, such as those of lanterns, to dance wildly and has a 50 percent chance to extinguish them. As a Bonus Action on your later turns, you can change the direction in which the Line blasts from you."
    }
   ]
  }
 },
 {
  "id": "hallow",
  "name": {
   "de": "Weihen",
   "en": "Hallow"
  },
  "gradzeile": {
   "de": "Bannzauber 5. Grades (Kleriker)",
   "en": "Level 5 Abjuration (Cleric)"
  },
  "grad": 5,
  "schule": "bann",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "24 Stunden",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Weihrauch im Wert von mindestens 1.000 GM, den der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "24 hours",
    "reichweite": "Touch",
    "komponenten": "V, S, M (incense worth 1,000+ GP, which the spell consumes)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst einen Punkt und erfüllst den Bereich um ihn herum mit heiliger oder unheiliger Macht. Der Bereich kann einen Radius von bis zu 18 Metern haben. Wenn dazu ein Bereich gehört, der bereits unter dem Effekt von Weihen steht, misslingt der Zauber. Im betroffenen Bereich wirken folgende Effekte."
    },
    {
     "typ": "punkt",
     "text": "Geheiligter Schutz: Wähle beliebige der folgenden Kreaturentypen aus: Aberration, celestisches Wesen, Elementar, Feenwesen, Unhold oder Untoter. Kreaturen des ausgewählten Typs können den Bereich nicht willentlich betreten, und Kreaturen innerhalb des Bereichs, die von solchen Wesen besessen, bezaubert oder verängstigt sind, sind innerhalb des Bereichs nicht von ihnen besessen, bezaubert oder verängstigt."
    },
    {
     "typ": "punkt",
     "text": "Zusätzlicher Effekt: Du bindest einen zusätzlichen Effekt aus der folgenden Liste an den Bereich:"
    },
    {
     "typ": "stichpunkt",
     "text": "Anfälligkeit: Kreaturen der von dir ausgewählten Typen sind anfällig für eine Schadensart deiner Wahl, solange sie sich im Bereich aufhalten."
    },
    {
     "typ": "stichpunkt",
     "text": "Dunkelheit: Dunkelheit erfüllt den Bereich. Weder natürliches noch magisches Licht durch Zauber eines niedrigeren Grades als dem dieses Zaubers kann den Bereich erhellen."
    },
    {
     "typ": "stichpunkt",
     "text": "Extradimensionale Interferenz: Kreaturen der von dir ausgewählten Typen können nicht mittels Teleportation oder auf extradimensionale oder interplanare Art in den Bereich oder aus ihm heraus gelangen."
    },
    {
     "typ": "stichpunkt",
     "text": "Friedliche Ruhe: Leichen innerhalb des Bereichs können nicht in Untote verwandelt werden."
    },
    {
     "typ": "stichpunkt",
     "text": "Furcht: Kreaturen der von dir ausgewählten Typen sind verängstigt, solange sie sich im Bereich aufhalten."
    },
    {
     "typ": "stichpunkt",
     "text": "Mut: Kreaturen der von dir ausgewählten Typen können nicht verängstigt werden, solange sie sich im Bereich aufhalten."
    },
    {
     "typ": "stichpunkt",
     "text": "Resistenz: Kreaturen der von dir ausgewählten Typen sind resistent gegen eine Schadensart deiner Wahl, solange sie sich im Bereich aufhalten."
    },
    {
     "typ": "stichpunkt",
     "text": "Stille: Geräusche können weder in den Bereich hinein‑ noch aus ihm herausdringen."
    },
    {
     "typ": "stichpunkt",
     "text": "Tageslicht: Helles Licht erfüllt den Bereich. Magische Dunkelheit durch Zauber eines niedrigeren Grades als dem dieses Zaubers kann den Bereich nicht verdunkeln."
    },
    {
     "typ": "stichpunkt",
     "text": "Zungen: Kreaturen der von dir ausgewählten Typen können mit allen anderen Kreaturen im Bereich kommunizieren, auch wenn sie keine gemeinsame Sprache sprechen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a point and infuse an area around it with holy or unholy power. The area can have a radius up to 60 feet, and the spell fails if the radius includes an area already under the effect of Hallow. The affected area has the following effects."
    },
    {
     "typ": "punkt",
     "text": "Hallowed Ward. Choose any of these creature types: Aberration, Celestial, Elemental, Fey, Fiend, or Undead. Creatures of the chosen types can’t willingly enter the area, and any creature that is possessed by or that has the Charmed or Frightened condition from such creatures isn’t possessed, Charmed, or Frightened by them while in the area."
    },
    {
     "typ": "punkt",
     "text": "Extra Effect. You bind an extra effect to the area from the list below:"
    },
    {
     "typ": "stichpunkt",
     "text": "Courage. Creatures of any types you choose can’t gain the Frightened condition while in the area."
    },
    {
     "typ": "stichpunkt",
     "text": "Darkness. Darkness fills the area. Normal light, as well as magical light created by spells of a level lower than this spell, can’t illuminate the area."
    },
    {
     "typ": "stichpunkt",
     "text": "Daylight. Bright light fills the area. Magical Darkness created by spells of a level lower than this spell can’t extinguish the light."
    },
    {
     "typ": "stichpunkt",
     "text": "Peaceful Rest. Dead bodies interred in the area can’t be turned into Undead."
    },
    {
     "typ": "stichpunkt",
     "text": "Extradimensional Interference. Creatures of any types you choose can’t enter or exit the area using teleportation or interplanar travel."
    },
    {
     "typ": "stichpunkt",
     "text": "Fear. Creatures of any types you choose have the Frightened condition while in the area."
    },
    {
     "typ": "stichpunkt",
     "text": "Resistance. Creatures of any types you choose have Resistance to one damage type of your choice while in the area."
    },
    {
     "typ": "stichpunkt",
     "text": "Silence. No sound can emanate from within the area, and no sound can reach into it."
    },
    {
     "typ": "stichpunkt",
     "text": "Tongues. Creatures of any types you choose can communicate with any other creature in the area even if they don’t share a common language."
    },
    {
     "typ": "stichpunkt",
     "text": "Vulnerability. Creatures of any types you choose have Vulnerability to one damage type of your choice while in the area."
    }
   ]
  }
 },
 {
  "id": "hallucinatory-terrain",
  "name": {
   "de": "Scheingelände",
   "en": "Hallucinatory Terrain"
  },
  "gradzeile": {
   "de": "Illusionszauber 4. Grades (Barde, Druide, Hexenmeister, Magier)",
   "en": "Level 4 Illusion (Bard, Druid, Warlock, Wizard)"
  },
  "grad": 4,
  "schule": "illusion",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "90 Meter",
    "komponenten": "V, G, M (ein Pilz)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "300 feet",
    "komponenten": "V, S, M (a mushroom)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du lässt natürliches Gelände innerhalb eines Würfels mit 45 Metern Kantenlänge wie ein anderes natürliches Gelände aussehen, klingen und riechen. Weite Felder oder eine Straße können so als Sumpf, Berg, Erdspalte oder anderes schwieriges oder unpassierbares Gelände erscheinen. Ein Tümpel kann wie eine grüne Wiese wirken, ein Steilhang wie ein sanftes Gefälle, ein Graben voller Felsbrocken wie eine breite Straße. Gebäude, Ausrüstung und Kreaturen im Bereich verändern sich nicht. Die ertastbaren Eigenschaften des Geländes bleiben unverändert, sodass Kreaturen, die den Bereich betreten, die Illusion wahrscheinlich als solche bemerken. Ist der Unterschied bei Berührung nicht offensichtlich, so kann eine Kreatur, welche die Illusion untersucht, die Studieren‑Aktion und einen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG ausführen, um sie zu durchschauen. Wenn eine Kreatur die Illusion als solche erkennt, sieht sie diese als ein dem eigentlichen Gelände überlagertes vages Bild."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You make natural terrain in a 150-foot Cube in range look, sound, and smell like another sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren’t changed. The tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to notice the illusion. If the difference isn’t obvious by touch, a creature examining the illusion can take the Study action to make an Intelligence (Investigation) check against your spell save DC to disbelieve it. If a creature discerns that the terrain is illusory, the creature sees a vague image superimposed on the real terrain."
    }
   ]
  }
 },
 {
  "id": "harm",
  "name": {
   "de": "Leid",
   "en": "Harm"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 6. Grades (Kleriker)",
   "en": "Level 6 Necromancy (Cleric)"
  },
  "grad": 6,
  "schule": "nekromantie",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du entfesselst virulente Magie auf eine Kreatur in Reichweite, die du sehen kannst. Das Ziel führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet es 14W6 nekrotischen Schaden, und sein Trefferpunktemaximum wird um den Betrag des erlittenen nekrotischen Schadens verringert. Bei einem erfolgreichen Rettungswurf erleidet das Ziel nur halb so viel Schaden. Dieser Zauber kann das Trefferpunktemaximum des Ziels nicht unter 1 verringern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You unleash virulent magic on a creature you can see within range. The target makes a Constitution saving throw. On a failed save, it takes 14d6 Necrotic damage, and its Hit Point maximum is reduced by an amount equal to the Necrotic damage it took. On a successful save, it takes half as much damage only. This spell can’t reduce a target’s Hit Point maximum below 1."
    }
   ]
  }
 },
 {
  "id": "haste",
  "name": {
   "de": "Hast",
   "en": "Haste"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Magier, Zauberer)",
   "en": "Level 3 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Span Süßholzwurzel)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a shaving of licorice root)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle eine bereitwillige Kreatur in Reichweite aus, die du sehen kannst. Für die Wirkungsdauer ist die Bewegungsrate des Ziels verdoppelt. Außerdem erhält das Ziel einen Bonus von +2 auf seine Rüstungsklasse, ist bei Geschicklichkeitsrettungswürfen im Vorteil und kann in jedem seiner Züge eine zusätzliche Aktion ausführen. Diese Aktion kann nur für Folgendes eingesetzt werden: Angriff (nur ein Angriff), Rückzug, Spurt, Verstecken, Verwenden. Wenn der Zauber endet, ist das Ziel bis zum Ende seines nächsten Zugs kampfunfähig und hat eine Bewegungsrate von 0, weil es von einer Welle der Lethargie ergriffen wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a willing creature that you can see within range. Until the spell ends, the target’s Speed is doubled, it gains a +2 bonus to Armor Class, it has Advantage on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used to take only the Attack (one attack only), Dash, Disengage, Hide, or Utilize action. When the spell ends, the target is Incapacitated and has a Speed of 0 until the end of its next turn, as a wave of lethargy washes over it."
    }
   ]
  }
 },
 {
  "id": "heal",
  "name": {
   "de": "Heilung",
   "en": "Heal"
  },
  "gradzeile": {
   "de": "Bannzauber 6. Grades (Druide, Kleriker)",
   "en": "Level 6 Abjuration (Cleric, Druid)"
  },
  "grad": 6,
  "schule": "bann",
  "klassen": [
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle eine Kreatur in Reichweite aus, die du sehen kannst. Positive Energie durchströmt das Ziel, das 70 Trefferpunkte zurückerhält. Außerdem beendet dieser Zauber die Zustände Blind, Taub und Vergiftet beim Ziel."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. wird die Heilung um 10 Trefferpunkte erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a creature that you can see within range. Positive energy washes through the target, restoring 70 Hit Points. This spell also ends the Blinded, Deafened, and Poisoned conditions on the target."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The healing increases by 10 for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "healing-word",
  "name": {
   "de": "Heilendes Wort",
   "en": "Healing Word"
  },
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Barde, Druide, Kleriker)",
   "en": "Level 1 Abjuration (Bard, Cleric, Druid)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur deiner Wahl in Reichweite, die du sehen kannst, erhält Trefferpunkte in Höhe von 2W4 plus deinem Zauberwirken‑Attributsmodifikator zurück."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird die Heilung um 2W4 Trefferpunkte erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature of your choice that you can see within range regains Hit Points equal to 2d4 plus your spellcasting ability modifier."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The healing increases by 2d4 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "heat-metal",
  "name": {
   "de": "Metall erhitzen",
   "en": "Heat Metal"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Barde, Druide)",
   "en": "Level 2 Transmutation (Bard, Druid)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Stück Eisen und eine Flamme)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a piece of iron and a flame)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle einen verarbeiteten Gegenstand aus Metall in Reichweite aus, den du sehen kannst – beispielsweise eine metallene Waffe oder eine schwere oder mittelschwere metallene Rüstung. Du lässt den Gegenstand glühend heiß werden. Wenn du den Zauber wirkst, erleiden alle Kreaturen in physischem Kontakt mit dem Gegenstand 2W8 Feuerschaden. Für die Wirkungsdauer kannst du in jedem deiner folgenden Züge eine Bonusaktion ausführen, um diesen Schaden erneut zu bewirken, sofern der Gegenstand sich in Reichweite befindet. Trägt eine Kreatur den Gegenstand oder hält ihn in der Hand, während sie den Schaden erleidet, so muss sie einen Konstitutionsrettungswurf bestehen, um den Gegenstand fallenzulassen, falls möglich. Wenn sie den Gegenstand nicht fallen lässt, ist sie bis zum Beginn deines nächsten Zugs bei Angriffs ‑ und Attributswürfen im Nachteil."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a manufactured metal object, such as a metal weapon or a suit of Heavy or Medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 Fire damage when you cast the spell. Until the spell ends, you can take a Bonus Action on each of your later turns to deal this damage again if the object is within range. If a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a Constitution saving throw or drop the object if it can. If it doesn’t drop the object, it has Disadvantage on attack rolls and ability checks until the start of your next turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "hellish-rebuke",
  "name": {
   "de": "Höllischer Tadel",
   "en": "Hellish Rebuke"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Hexenmeister)",
   "en": "Level 1 Evocation (Warlock)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "hexenmeister"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Reaktion, die du ausführst, wenn du Schaden durch eine Kreatur im Abstand von bis zu 18 Metern von dir erlitten hast, die du sehen kannst",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Reaction, which you take in response to taking damage from a creature that you can see within 60 feet of yourself",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Die Kreatur, die dir Schaden zugefügt hat, ist kurz von grünen Flammen umgeben. Sie führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 2W10 Feuerschaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The creature that damaged you is momentarily surrounded by green flames. It makes a Dexterity saving throw, taking 2d10 Fire damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "heroes-feast",
  "name": {
   "de": "Heldenmahl",
   "en": "Heroes’ Feast"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 6. Grades (Barde, Druide, Kleriker)",
   "en": "Level 6 Conjuration (Bard, Cleric, Druid)"
  },
  "grad": 6,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine mit Edelsteinen verzierte Schale im Wert von mindestens 1.000 GM, die der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "Self",
    "komponenten": "V, S, M (a gem-encrusted bowl worth 1,000+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst ein Festmahl, das auf einer Oberfläche in einem freien Würfel von drei Metern Kantenlänge neben dir erscheint. Der Verzehr des Festmahls dauert eine Stunde. Nach dieser Dauer verschwindet das Mahl, und die positiven Effekte treten in Kraft. Bis zu zwölf Kreaturen können am Festmahl teilnehmen. Eine Kreatur, die teilnimmt, erhält mehrere Vorzüge, die 24 Stunden lang anhalten: Sie ist gegen Giftschaden resistent und gegen die Zustände Verängstigt und Vergiftet immun. Zudem wird ihr Trefferpunktemaximum um 2W10 erhöht, und sie erhält die gleiche Anzahl von Trefferpunkten dazu."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a feast that appears on a surface in an unoccupied 10-foot Cube next to you. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don’t set in until this hour is over. Up to twelve creatures can partake of the feast. A creature that partakes gains several benefits, which last for 24 hours. The creature has Resistance to Poison damage, and it has Immunity to the Frightened and Poisoned conditions. Its Hit Point maximum also increases by 2d10, and it gains the same number of Hit Points."
    }
   ]
  }
 },
 {
  "id": "heroism",
  "name": {
   "de": "Heldenmut",
   "en": "Heroism"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde, Paladin)",
   "en": "Level 1 Enchantment (Bard, Paladin)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur und erfüllst sie mit Tapferkeit. Für die Wirkungsdauer ist die Kreatur gegen den Zustand Verängstigt immun und erhält zu Beginn jedes ihrer Züge temporäre Trefferpunkte in Höhe deines Zauberwirken‑Attributsmodifikators."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to the Frightened condition and gains Temporary Hit Points equal to your spellcasting ability modifier at the start of each of its turns."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "hex",
  "name": {
   "de": "Verwünschung",
   "en": "Hex"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Hexenmeister)",
   "en": "Level 1 Enchantment (Warlock)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "hexenmeister"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (versteinertes Auge eines Molchs)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (the petrified eye of a newt)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verfluchst eine Kreatur in Reichweite, die du sehen kannst. Für die Wirkungsdauer fügst du dem Ziel, wann immer du es mit einem Angriffswurf triffst, zusätzlich 1W6 nekrotischen Schaden zu. Wähle außerdem ein Attribut aus, wenn du den Zauber wirkst. Das Ziel ist bei allen entsprechenden Attributswürfen im Nachteil. Wenn die Trefferpunkte des Ziels auf 0 sinken, bevor der Zauber endet, kannst du in deinen folgenden Zügen eine Bonusaktion ausführen, um eine andere Kreatur zu verfluchen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Deine Konzentration kann länger andauern: bei einem Zauberplatz des 2. Grades bis zu vier Stunden, bei einem Zauberplatz des 3. und 4. Grades bis zu acht Stunden und bei einem Zauberplatz ab dem 5. Grad bis zu 24 Stunden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 2 (up to 4 hours), 3–4 (up to 8 hours), or 5+ (24 hours)."
    }
   ]
  }
 },
 {
  "id": "hideous-laughter",
  "name": {
   "de": "Fürchterlicher Lachanfall",
   "en": "Hideous Laughter"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde, Hexenmeister, Magier)",
   "en": "Level 1 Enchantment (Bard, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Torte und eine Feder)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a tart and a feather)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur deiner Wahl in Reichweite, die du sehen kannst, führt einen Weisheitsrettungswurf aus. Misslingt der Wurf, so hat sie für die Wirkungsdauer die Zustände Liegend sowie Kampfunfähig. Während dieser Dauer lacht sie unkontrollierbar, sofern sie lachen kann, und kann den Zustand Liegend bei sich nicht beenden. Am Ende jedes ihrer Züge und jedes Mal, wenn sie Schaden erleidet, führt die Kreatur einen weiteren Weisheitsrettungswurf aus. Dabei ist sie im Vorteil, wenn der Rettungswurf durch Schaden ausgelöst wurde. Bei einem erfolgreichen Rettungswurf endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature of your choice that you can see within range makes a Wisdom saving throw. On a failed save, it has the Prone and Incapacitated conditions for the duration. During that time, it laughs uncontrollably if it’s capable of laughter, and it can’t end the Prone condition on itself. At the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has Advantage on the save if the save is triggered by damage. On a successful save, the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "hold-monster",
  "name": {
   "de": "Monster festhalten",
   "en": "Hold Monster"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 5. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 5 Enchantment (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 5,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (ein gerades Stück Eisen)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (a straight piece of iron)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle eine Kreatur in Reichweite aus, die du sehen kannst. Das Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer gelähmt. Das Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "hold-person",
  "name": {
   "de": "Person festhalten",
   "en": "Hold Person"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 2. Grades (Barde, Druide, Hexenmeister, Kleriker, Magier, Zauberer)",
   "en": "Level 2 Enchantment (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein gerades Stück Eisen)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a straight piece of iron)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle einen Humanoiden in Reichweite aus, den du sehen kannst. Das Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer gelähmt. Das Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. kannst du auf einen weiteren Humanoiden zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a Humanoid that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional Humanoid for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "holy-aura",
  "name": {
   "de": "Heilige Aura",
   "en": "Holy Aura"
  },
  "gradzeile": {
   "de": "Bannzauber 8. Grades (Kleriker)",
   "en": "Level 8 Abjuration (Cleric)"
  },
  "grad": 8,
  "schule": "bann",
  "klassen": [
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine Reliquie im Wert von mindestens 1.000 GM)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a reliquary worth 1,000+ GP)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer geht eine Ausströmung von neun Metern von dir aus. In der Aura sind Kreaturen deiner Wahl bei allen Rettungswürfen im Vorteil, und andere Kreaturen sind bei Angriffswürfen gegen sie im Nachteil. Wenn außerdem ein Unhold oder ein Untoter eine betroffene Kreatur mit einem Nahkampfangriffswurf trifft, muss der Angreifer einen Konstitutionsrettungswurf bestehen, oder er ist bis zum Ende seines nächsten Zugs blind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you emit an aura in a 30-foot Emanation. While in the aura, creatures of your choice have Advantage on all saving throws, and other creatures have Disadvantage on attack rolls against them. In addition, when a Fiend or an Undead hits an affected creature with a melee attack roll, the attacker must succeed on a Constitution saving throw or have the Blinded condition until the end of its next turn."
    }
   ]
  }
 },
 {
  "id": "hunter-s-mark",
  "name": {
   "de": "Zeichen des Jägers",
   "en": "Hunter’s Mark"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 1. Grades (Waldläufer)",
   "en": "Level 1 Divination (Ranger)"
  },
  "grad": 1,
  "schule": "erkenntnis",
  "klassen": [
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "27 Meter",
    "komponenten": "V",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "90 feet",
    "komponenten": "V",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du markierst eine Kreatur in Reichweite, die du sehen kannst, auf magische Art als deine Beute. Für die Wirkungsdauer fügst du dem Ziel, wann immer du es mit einem Angriffswurf triffst, zusätzlich 1W6 Energieschaden zu. Außerdem bist du bei allen Weisheitswürfen (Überlebenskunst oder Wahrnehmung) im Vorteil, die du ausführst, um das Ziel zu finden. Wenn die Trefferpunkte des Ziels auf 0 sinken, bevor dieser Zauber endet, kannst du eine Bonusaktion ausführen, um das Zeichen auf eine andere Kreatur in Reichweite, die du sehen kannst, zu übertragen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Deine Konzentration kann länger andauern: bei einem Zauberplatz des 3. und 4. Grades bis zu acht Stunden und bei einem Zauberplatz ab dem 5. Grad bis zu 24 Stunden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new creature you can see within range."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 3–4 (up to 8 hours) or 5+ (up to 24 hours)."
    }
   ]
  }
 },
 {
  "id": "hypnotic-pattern",
  "name": {
   "de": "Hypnotisches Muster",
   "en": "Hypnotic Pattern"
  },
  "gradzeile": {
   "de": "Illusionszauber 3. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 3 Illusion (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (eine Prise Konfetti)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "S, M (a pinch of confetti)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst ein wirbelndes Muster aus Farben in einem Würfel mit neun Metern Kantenlänge in Reichweite. Das Muster erscheint für einen Moment und verschwindet dann. Jede Kreatur im Bereich, die das Muster sehen kann, muss einen Weisheitsrettungswurf bestehen, oder sie ist für die Wirkungsdauer bezaubert. Auf diese Art bezauberte Kreaturen sind kampfunfähig und haben eine Bewegungsrate von 0. Der Zauber endet bei einer betroffenen Kreatur, wenn sie Schaden erleidet oder jemand anders eine Aktion verwendet, um die Kreatur aus ihrer Starre zu rütteln."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a twisting pattern of colors in a 30-foot Cube within range. The pattern appears for a moment and vanishes. Each creature in the area who can see the pattern must succeed on a Wisdom saving throw or have the Charmed condition for the duration. While Charmed, the creature has the Incapacitated condition and a Speed of 0. The spell ends for an affected creature if it takes any damage or if someone else uses an action to shake the creature out of its stupor."
    }
   ]
  }
 },
 {
  "id": "ice-knife",
  "name": {
   "de": "Eismesser",
   "en": "Ice Knife"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Druide, Magier, Zauberer)",
   "en": "Level 1 Conjuration (Druid, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "G, M (ein Tropfen Wasser oder ein Stück Eis)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "S, M (a drop of water or a piece of ice)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erzeugst eine Eisscherbe und schleuderst sie auf eine Kreatur in Reichweite. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 1W10 Stichschaden. Nach dem Wurf explodiert die Scherbe, ob sie getroffen hat oder nicht. Das Ziel und jede Kreatur im Abstand von bis zu 1,5 Metern von ihm müssen einen Geschicklichkeitsrettungswurf bestehen, oder sie erleiden 2W6 Kälteschaden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Kälteschaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a shard of ice and fling it at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Piercing damage. Hit or miss, the shard then explodes. The target and each creature within 5 feet of it must succeed on a Dexterity saving throw or take 2d6 Cold damage."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The Cold damage increases by 1d6 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "ice-storm",
  "name": {
   "de": "Eissturm",
   "en": "Ice Storm"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 4. Grades (Druide, Magier, Zauberer)",
   "en": "Level 4 Evocation (Druid, Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "90 Meter",
    "komponenten": "V, G, M (ein Fausthandschuh)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "300 feet",
    "komponenten": "V, S, M (a mitten)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem zwölf Meter hohen Zylinder mit einem Radius von sechs Metern um einen Punkt in Reichweite fällt Hagel. Jede Kreatur im Zylinder führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 2W10 Wuchtschaden und 4W6 Kälteschaden, anderenfalls die Hälfte. Die Hagelkörner machen den Boden im Zylinder bis zum Ende deines nächsten Zugs zu schwierigem Gelände."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der Wuchtschaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Hail falls in a 20-foot-radius, 40-foot-high Cylinder centered on a point within range. Each creature in the Cylinder makes a Dexterity saving throw. A creature takes 2d10 Bludgeoning damage and 4d6 Cold damage on a failed save or half as much damage on a successful one. Hailstones turn ground in the Cylinder into Difficult Terrain until the end of your next turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The Bludgeoning damage increases by 1d10 for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "identify",
  "name": {
   "de": "Identifizieren",
   "en": "Identify"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 1. Grades (Barde, Magier)",
   "en": "Level 1 Divination (Bard, Wizard)"
  },
  "grad": 1,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Perle im Wert von mindestens 100 GM)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a pearl worth 100+ GP)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst einen Gegenstand, solange du den Zauber wirkst. Falls es sich um einen magischen Gegenstand handelt, erkennst du seine Eigenschaften und ihre Anwendung, und du weißt, ob er Einstimmung erfordert und wie viele Ladungen er besitzt, falls zutreffend. Du erfährst, ob aktuell Zauber auf den Gegenstand wirken, und wenn ja, welche. Falls der Gegenstand durch einen Zauber erzeugt wurde, erfährst du dessen Namen. Wenn du stattdessen beim Wirken des Zaubers eine Kreatur durchgehend berührst, erfährst du, von welchen Zaubern sie derzeit betroffen ist, falls zutreffend."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch an object throughout the spell’s casting. If the object is a magic item or some other magical object, you learn its properties and how to use them, whether it requires Attunement, and how many charges it has, if any. You learn whether any ongoing spells are affecting the item and what they are. If the item was created by a spell, you learn that spell’s name. If you instead touch a creature throughout the casting, you learn which ongoing spells, if any, are currently affecting it."
    }
   ]
  }
 },
 {
  "id": "illusory-script",
  "name": {
   "de": "Illusionsschrift",
   "en": "Illusory Script"
  },
  "gradzeile": {
   "de": "Illusionszauber 1. Grades (Barde, Hexenmeister, Magier)",
   "en": "Level 1 Illusion (Bard, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Berührung",
    "komponenten": "G, M (Tinte im Wert von mindestens 10 GM, die der Zauber verbraucht)",
    "dauer": "10 Tage"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Touch",
    "komponenten": "S, M (ink worth 10+ GP, which the spell consumes)",
    "dauer": "10 days"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schreibst auf Pergament, Papier oder ein anderes geeignetes Material und erfüllst die Schrift mit einer Illusion, die für die Wirkungsdauer bestehen bleibt. Für dich und alle Kreaturen, die du beim Wirken des Zaubers bestimmst, erscheint die Schrift ganz normal in deiner Handschrift und gibt den Inhalt wieder, den du niedergeschrieben hast. Für alle anderen erscheint eine unbekannte oder magische Schrift, die unverständlich ist. Alternativ kann die Illusion die Bedeutung der Nachricht, die Handschrift oder die Sprache verändern, in der die Nachricht verfasst ist. Die Sprache muss dir jedoch bekannt sein. Falls der Zauber gebannt wird, verschwinden sowohl die echte Schrift als auch die Illusion. Eine Kreatur mit Wahrer Blick kann die versteckte Nachricht lesen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You write on parchment, paper, or another suitable material and imbue it with an illusion that lasts for the duration. To you and any creatures you designate when you cast the spell, the writing appears normal, seems to be written in your hand, and conveys whatever meaning you intended when you wrote the text. To all others, the writing appears as if it were written in an unknown or magical script that is unintelligible. Alternatively, the illusion can alter the meaning, handwriting, and language of the text, though the language must be one you know. If the spell is dispelled, the original script and the illusion both disappear. A creature that has Truesight can read the hidden message."
    }
   ]
  }
 },
 {
  "id": "imprisonment",
  "name": {
   "de": "Einkerkerung",
   "en": "Imprisonment"
  },
  "gradzeile": {
   "de": "Bannzauber 9. Grades (Hexenmeister, Magier)",
   "en": "Level 9 Abjuration (Warlock, Wizard)"
  },
  "grad": 9,
  "schule": "bann",
  "klassen": [
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Statuette in Gestalt des Ziels im Wert von mindestens 5.000 GM)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a statuette of the target worth 5,000+ GP)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst magische Fesseln, um eine Kreatur in Reichweite festzusetzen, die du sehen kannst. Das Ziel muss einen Weisheitsrettungswurf ausführen. Bei einem erfolgreichen Rettungswurf ist das Ziel nicht betroffen, und es ist in den nächsten 24 Stunden gegen diesen Zauber immun. Misslingt der Wurf, so wird das Ziel eingesperrt. Ein eingesperrtes Ziel muss nicht atmen, essen und trinken, und es altert nicht. Erkenntniszauber können das Ziel weder orten noch wahrnehmen, und das Ziel kann sich nicht teleportieren. Bis der Zauber endet, ist das Ziel außerdem von einem der folgenden Effekte (nach deiner Wahl) betroffen:"
    },
    {
     "typ": "stichpunkt",
     "text": "Abgesichertes Gefängnis: Das Ziel ist in einer Halbebene gefangen, die gegen Teleportation und Ebenenreisen geschützt ist. Bei der Halbebene kann es sich um ein Labyrinth, einen Käfig, einen Turm oder Ähnliches nach deiner Wahl handeln."
    },
    {
     "typ": "stichpunkt",
     "text": "Anketten: Fest im Boden verankerte Ketten halten das Ziel fest. Das Ziel ist festgesetzt und kann auf keine Weise bewegt werden."
    },
    {
     "typ": "stichpunkt",
     "text": "Begräbnis: Das Ziel wird unter der Erde in einer hohlen Kugel aus magischer Energie begraben, die gerade groß genug für das Ziel ist. Nichts kann die Kugel durchdringen."
    },
    {
     "typ": "stichpunkt",
     "text": "Schlummer: Das Ziel ist bewusstlos und kann nicht geweckt werden."
    },
    {
     "typ": "stichpunkt",
     "text": "Winziges Gefängnis: Das Ziel nimmt eine Größe von 2,5 Zentimetern an und wird in einem unzerstörbaren Edelstein oder einem ähnlichen Gegenstand eingesperrt. Licht kann den Edelstein durchdringen. So kann das Ziel nach draußen blicken, und andere Kreaturen können hineinsehen. Ansonsten kann den Edelstein jedoch nichts durchdringen, auch nicht Teleportation oder Ebenenreisen."
    },
    {
     "typ": "punkt",
     "text": "Den Zauber beenden: Wenn du den Zauber wirkst, kannst du einen Auslöser festlegen, der ihn beendet. Der Auslöser kann so spezifisch oder komplex sein, wie du möchtest. Der SL muss jedoch bestätigen, dass sein Eintreten innerhalb der nächsten zehn Jahre wahrscheinlich ist. Es muss sich um eine beobachtbare Aktion handeln, beispielsweise eine bestimmte Opferung im Tempel deiner Gottheit, die Rettung deiner großen Liebe oder der Sieg über ein bestimmtes Monster. Der Zauber Magie bannen kann diesen Zauber nur beenden, wenn er mit einem Zauberplatz des 9. Grades entweder auf das Gefängnis oder auf die Komponente gewirkt wird, die beim Wirken dieses Zaubers verwendet wurde."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a magical restraint to hold a creature that you can see within range. The target must make a Wisdom saving throw. On a successful save, the target is unaffected, and it is immune to this spell for the next 24 hours. On a failed save, the target is imprisoned. While imprisoned, the target doesn’t need to breathe, eat, or drink, and it doesn’t age. Divination spells can’t locate or perceive the imprisoned target, and the target can’t teleport. Until the spell ends, the target is also affected by one of the following effects of your choice:"
    },
    {
     "typ": "stichpunkt",
     "text": "Burial. The target is entombed beneath the earth in a hollow globe of magical force that is just large enough to contain the target. Nothing can pass into or out of the globe."
    },
    {
     "typ": "stichpunkt",
     "text": "Chaining. Chains firmly rooted in the ground hold the target in place. The target has the Restrained condition and can’t be moved by any means."
    },
    {
     "typ": "stichpunkt",
     "text": "Hedged Prison. The target is trapped in a demiplane that is warded against teleportation and planar travel. The demiplane is your choice of a labyrinth, a cage, a tower, or the like."
    },
    {
     "typ": "stichpunkt",
     "text": "Minimus Containment. The target becomes 1 inch tall and is trapped inside an indestructible gemstone or a similar object. Light can pass through the gemstone (allowing the target to see out and other creatures to see in), but nothing else can pass through by any means."
    },
    {
     "typ": "stichpunkt",
     "text": "Slumber. The target has the Unconscious condition and can’t be awoken."
    },
    {
     "typ": "punkt",
     "text": "Ending the Spell. When you cast the spell, specify a trigger that will end it. The trigger can be as simple or as elaborate as you choose, but the GM must agree that it has a high likelihood of happening within the next decade. The trigger must be an observable action, such as someone making a particular offering at the temple of your god, saving your true love, or defeating a specific monster. A Dispel Magic spell can end the spell only if it is cast with a level 9 spell slot, targeting either the prison or the component used to create it."
    }
   ]
  }
 },
 {
  "id": "incendiary-cloud",
  "name": {
   "de": "Flammende Wolke",
   "en": "Incendiary Cloud"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 8. Grades (Druide, Magier, Zauberer)",
   "en": "Level 8 Conjuration (Druid, Sorcerer, Wizard)"
  },
  "grad": 8,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine wirbelnde Wolke aus Funken und Rauch erfüllt eine Kugel mit einem Radius von sechs Metern um einen Punkt in Reichweite. Der Bereich der Wolke ist komplett verschleiert. Die Wolke bleibt für die Wirkungsdauer bestehen, oder bis starker Wind (wie solcher durch Windstoß) sie auflöst. Wenn die Wolke erscheint, führt jede Kreatur darin einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 10W8 Feuerschaden, anderenfalls die Hälfte. Eine Kreatur muss den Konstitutionsrettungswurf auch dann ausführen, wenn die Kugel sich in ihren Bereich bewegt, wenn die Kreatur die Kugel betritt oder wenn sie ihren Zug darin beendet. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen. Zu Beginn jedes deiner Züge bewegt sich die Wolke um drei Meter in einer Richtung deiner Wahl von dir weg."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A swirling cloud of embers and smoke fills a 20-foot-radius Sphere centered on a point within range. The cloud’s area is Heavily Obscured. It lasts for the duration or until a strong wind (like that created by Gust of Wind) disperses it. When the cloud appears, each creature in it makes a Dexterity saving throw, taking 10d8 Fire damage on a failed save or half as much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when it enters the Sphere or ends its turn there. A creature makes this save only once per turn. The cloud moves 10 feet away from you in a direction you choose at the start of each of your turns."
    }
   ]
  }
 },
 {
  "id": "inflict-wounds",
  "name": {
   "de": "Wunden verursachen",
   "en": "Inflict Wounds"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 1. Grades (Kleriker)",
   "en": "Level 1 Necromancy (Cleric)"
  },
  "grad": 1,
  "schule": "nekromantie",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur, die du berührst, führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 2W10 nekrotischen Schaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature you touch makes a Constitution saving throw, taking 2d10 Necrotic damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "insect-plague",
  "name": {
   "de": "Insektenplage",
   "en": "Insect Plague"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 5. Grades (Druide, Kleriker, Zauberer)",
   "en": "Level 5 Conjuration (Cleric, Druid, Sorcerer)"
  },
  "grad": 5,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "kleriker",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "90 Meter",
    "komponenten": "V, G, M (eine Heuschrecke)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "300 feet",
    "komponenten": "V, S, M (a locust)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einer Kugel mit einem Radius von sechs Metern um einen Punkt deiner Wahl in Reichweite erscheint ein Heuschreckenschwarm. Die Kugel bleibt für die Wirkungsdauer bestehen. Ihr Bereich ist leicht verschleiert sowie schwieriges Gelände. Wenn der Schwarm erscheint, führt jede Kreatur darin einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 4W10 Stichschaden, anderenfalls die Hälfte. Wenn eine Kreatur den Bereich des Zaubers in einem Zug erstmals betritt oder ihren Zug darin beendet, führt sie diesen Rettungswurf ebenfalls aus. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird der Schaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Swarming locusts fill a 20-foot-radius Sphere centered on a point you choose within range. The Sphere remains for the duration, and its area is Lightly Obscured and Difficult Terrain. When the swarm appears, each creature in it makes a Constitution saving throw, taking 4d10 Piercing damage on a failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell’s area for the first time on a turn or ends its turn there. A creature makes this save only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "instant-summons",
  "name": {
   "de": "Sofortige Beschwörung",
   "en": "Instant Summons"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 6. Grades (Magier)",
   "en": "Level 6 Conjuration (Wizard)"
  },
  "grad": 6,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Saphir im Wert von mindestens 1.000 GM)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a sapphire worth 1,000+ GP)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst den Saphir, den du zum Wirken verwendest, sowie einen Gegenstand, der höchstens 4,5 Kilogramm wiegt und keine größere Abmessung als 1,8 Meter hat. Der Zauber hinterlässt eine unsichtbare Markierung am Gegenstand und schreibt den Namen des Gegenstands unsichtbar in den Saphir ein. Jedes Mal, wenn du diesen Zauber wirkst, musst du einen anderen Saphir verwenden. Danach kannst du eine magische Aktion ausführen, um den Namen des Gegenstands auszusprechen und den Saphir zu zerstören. Der Gegenstand erscheint unabhängig von seiner physischen oder planaren Entfernung sofort in deiner Hand, und der Zauber endet. Wenn eine andere Kreatur den Gegenstand hält oder trägt, wird er nicht transportiert, wenn der Saphir zerstört wird. Stattdessen erfährst du, wer die Kreatur ist, die ihn bei sich hat, und wo sie sich aktuell befindet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch the sapphire used in the casting and an object weighing 10 pounds or less whose longest dimension is 6 feet or less. The spell leaves an Invisible mark on that object and invisibly inscribes the object’s name on the sapphire. Each time you cast this spell, you must use a different sapphire. Thereafter, you can take a Magic action to speak the object’s name and crush the sapphire. The object instantly appears in your hand regardless of physical or planar distances, and the spell ends. If another creature is holding or carrying the object, crushing the sapphire doesn’t transport it, but instead you learn who that creature is and where that creature is currently located."
    }
   ]
  }
 },
 {
  "id": "invisibility",
  "name": {
   "de": "Unsichtbarkeit",
   "en": "Invisibility"
  },
  "gradzeile": {
   "de": "Illusionszauber 2. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 2 Illusion (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Wimper in Gummiarabikum)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (an eyelash in gum arabic)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur, die du berührst, wird unsichtbar, bis der Zauber endet. Der Zauber endet vorzeitig, sobald das Ziel einen Angriffswurf ausgeführt, Schaden bewirkt oder selbst einen Zauber gewirkt hat."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature you touch has the Invisible condition until the spell ends. The spell ends early immediately after the target makes an attack roll, deals damage, or casts a spell."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "irresistible-dance",
  "name": {
   "de": "Unwiderstehlicher Tanz",
   "en": "Irresistible Dance"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 6. Grades (Barde, Magier)",
   "en": "Level 6 Enchantment (Bard, Wizard)"
  },
  "grad": 6,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur in Reichweite, die du sehen kannst, muss einen Weisheitsrettungswurf ausführen. Bei einem erfolgreichen Rettungswurf tanzt das Ziel bis zum Ende seines nächsten Zugs albern an einer Stelle und verbraucht dafür seine gesamte Bewegungsrate. Misslingt der Wurf, so ist das Ziel für die Wirkungsdauer bezaubert. Solange es bezaubert ist, tanzt das Ziel albern an einer Stelle und benötigt dafür seine gesamte Bewegungsrate. Es ist bei Geschicklichkeitsrettungswürfen sowie bei Angriffswürfen im Nachteil, und andere Kreaturen sind bei Angriffswürfen gegen das Ziel im Vorteil. Das Ziel kann in jedem seiner Züge eine Aktion ausführen, um sich zu sammeln und den Rettungswurf zu wiederholen. Bei einem Erfolg endet der Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature that you can see within range must make a Wisdom saving throw. On a successful save, the target dances comically until the end of its next turn, during which it must spend all its movement to dance in place. On a failed save, the target has the Charmed condition for the duration. While Charmed, the target dances comically, must use all its movement to dance in place, and has Disadvantage on Dexterity saving throws and attack rolls, and other creatures have Advantage on attack rolls against it. On each of its turns, the target can take an action to collect itself and repeat the save, ending the spell on itself on a success."
    }
   ]
  }
 },
 {
  "id": "jump",
  "name": {
   "de": "Sprung",
   "en": "Jump"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 1. Grades (Druide, Magier, Waldläufer, Zauberer)",
   "en": "Level 1 Transmutation (Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Hinterbein einer Heuschrecke)",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a grasshopper’s hind leg)",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur. Für die Wirkungsdauer kann diese Kreatur in jedem ihrer Züge bis zu neun Meter weit springen, indem sie drei Meter ihrer Bewegungsrate verbraucht."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature. Once on each of its turns until the spell ends, that creature can jump up to 30 feet by spending 10 feet of movement."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "knock",
  "name": {
   "de": "Klopfen",
   "en": "Knock"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Barde, Magier, Zauberer)",
   "en": "Level 2 Transmutation (Bard, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle einen Gegenstand in Reichweite aus, den du sehen kannst. Es kann sich um eine Tür, eine Truhe, ein Paar Handschellen, ein Vorhängeschloss oder einen anderen Gegenstand handeln, der auf magische oder gewöhnliche Art verschlossen ist. Wenn das Ziel mit einem gewöhnlichen Schloss verschlossen, verriegelt oder verklemmt ist, wird es geöffnet, entriegelt oder gelöst. Wenn der Gegenstand mehrere Schlösser besitzt, wird nur eines davon geöffnet. Ist das Ziel durch den Zauber Arkanes Schloss verriegelt, so wird dieser Zauber zehn Minuten lang unterdrückt. In dieser Zeit kann das Ziel geöffnet und geschlossen werden. Wenn du den Zauber wirkst, gibt dein Ziel ein lautes Klopfgeräusch von sich, welches bis zu 90 Meter weit zu hören ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access. A target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred. If the object has multiple locks, only one of them is unlocked. If the target is held shut by Arcane Lock, that spell is suppressed for 10 minutes, during which time the target can be opened and closed. When you cast the spell, a loud knock, audible up to 300 feet away, emanates from the target."
    }
   ]
  }
 },
 {
  "id": "legend-lore",
  "name": {
   "de": "Sagenkunde",
   "en": "Legend Lore"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 5. Grades (Barde, Kleriker, Magier)",
   "en": "Level 5 Divination (Bard, Cleric, Wizard)"
  },
  "grad": 5,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (Weihrauch im Wert von mindestens 250 GM, den der Zauber verbraucht, und vier Stücke Elfenbein im Wert von jeweils mindestens 50 GM)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "Self",
    "komponenten": "V, S, M (incense worth 250+ GP, which the spell consumes, and four ivory strips worth 50+ GP each)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Nenne oder beschreibe eine berühmte Person, einen berühmten Ort oder einen berühmten Gegenstand. Der Zauber übermittelt dir mental eine Zusammenfassung der wichtigen Legenden über das Genannte wie vom SL beschrieben. Dabei kann es sich um wichtige Details, amüsante Enthüllungen oder sogar geheimes Wissen handeln. Je mehr Informationen du bereits kennst, desto präzisere und detailliertere Informationen erhältst du durch den Zauber. Die erhaltenen Informationen sind korrekt, können aber nach Ermessen des SL in bildlicher Sprache oder in Versform übermittelt werden. Wenn das Objekt deines Interesses eigentlich nicht berühmt ist, hörst du einige traurige Posaunentöne, und der Zauber misslingt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Name or describe a famous person, place, or object. The spell brings to your mind a brief summary of the significant lore about that famous thing, as described by the GM. The lore might consist of important details, amusing revelations, or even secret lore that has never been widely known. The more information you already know about the thing, the more precise and detailed the information you receive is. That information is accurate but might be couched in figurative language or poetry, as determined by the GM. If the famous thing you chose isn’t actually famous, you hear sad musical notes played on a trombone, and the spell fails."
    }
   ]
  }
 },
 {
  "id": "lesser-restoration",
  "name": {
   "de": "Schwache Genesung",
   "en": "Lesser Restoration"
  },
  "gradzeile": {
   "de": "Bannzauber 2. Grades (Barde, Druide, Kleriker, Paladin, Waldläufer)",
   "en": "Level 2 Abjuration (Bard, Cleric, Druid, Paladin, Ranger)"
  },
  "grad": 2,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur und beendest einen Zustand bei ihr: Blind, Gelähmt, Taub oder Vergiftet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature and end one condition on it: Blinded, Deafened, Paralyzed, or Poisoned."
    }
   ]
  }
 },
 {
  "id": "levitate",
  "name": {
   "de": "Schweben",
   "en": "Levitate"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Magier, Zauberer)",
   "en": "Level 2 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (eine Metallfeder)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a metal spring)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein Ziel – eine Kreatur oder ein loser Gegenstand – deiner Wahl in Reichweite, das du sehen kannst, steigt senkrecht sechs Meter empor und schwebt für die Wirkungsdauer in der Luft. Der Zauber kann Gegenstände mit einem Maximalgewicht von 250 Kilogramm anheben. Besteht eine nicht bereitwillige Kreatur einen Konstitutionsrettungswurf, so ist sie nicht betroffen. Das Ziel kann sich nur bewegen, indem es sich von festen Gegenständen oder Oberflächen wie Wänden oder Decken in Reichweite abstößt oder sich daran entlanghangelt. Dabei gilt die Kletterbewegungsrate. Während deines Zuges kannst du das Ziel um bis zu sechs Meter anheben oder absenken. Wenn du selbst das Ziel bist, kannst du dich im Rahmen deiner Bewegung anheben oder absenken. Anderenfalls kannst du das Ziel mit einer magischen Aktion bewegen. Dabei musst du die Reichweite des Zaubers einhalten. Wenn der Zauber endet und das Ziel noch schwebt, sinkt es sanft zu Boden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "One creature or loose object of your choice that you can see within range rises vertically up to 20 feet and remains suspended there for the duration. The spell can levitate an object that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected. The target can move only by pushing or pulling against a fixed object or surface within reach (such as a wall or a ceiling), which allows it to move as if it were climbing. You can change the target’s altitude by up to 20 feet in either direction on your turn. If you are the target, you can move up or down as part of your move. Otherwise, you can take a Magic action to move the target, which must remain within the spell’s range. When the spell ends, the target floats gently to the ground if it is still aloft."
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
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Barde, Kleriker, Magier, Zauberer)",
   "en": "Evocation Cantrip (Bard, Cleric, Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, M (ein Glühwürmchen oder phosphoreszierendes Moos)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, M (a firefly or phosphorescent moss)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst einen Gegenstand von höchstens großer Größe, der nicht von jemand anderem getragen oder gehalten wird. Für die Wirkungsdauer spendet dieser Gegenstand in einem Radius von sechs Metern helles Licht und in einem Radius von weiteren sechs Metern dämmriges Licht. Du kannst die Farbe des Lichts frei wählen. Wird der Gegenstand mit etwas Undurchsichtigem abgedeckt, so wird das Licht blockiert. Der Zauber endet vorzeitig, wenn du ihn erneut wirkst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch one Large or smaller object that isn’t being worn or carried by someone else. Until the spell ends, the object sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The light can be colored as you like. Covering the object with something opaque blocks the light. The spell ends if you cast it again."
    }
   ]
  }
 },
 {
  "id": "lightning-bolt",
  "name": {
   "de": "Blitz",
   "en": "Lightning Bolt"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 3. Grades (Magier, Zauberer)",
   "en": "Level 3 Evocation (Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Stück Fell und ein Kristallstab)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a bit of fur and a crystal rod)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst in einer 30 Meter langen und 1,5 Meter breiten Linie, die von dir ausgeht, einen Blitz in eine Richtung deiner Wahl. Jede Kreatur in der Linie führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 8W6 Blitzschaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A stroke of lightning forming a 100-foot-long, 5-foot-wide Line blasts out from you in a direction you choose. Each creature in the Line makes a Dexterity saving throw, taking 8d6 Lightning damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "locate-animals-or-plants",
  "name": {
   "de": "Tiere oder Pflanzen aufspüren",
   "en": "Locate Animals or Plants"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 2. Grades (Barde, Druide, Waldläufer)",
   "en": "Level 2 Divination (Bard, Druid, Ranger)"
  },
  "grad": 2,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (etwas Fell von einem Bluthund)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S, M (fur from a bloodhound)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Beschreibe oder nenne eine bestimmte Art von Tier, Pflanzenkreatur oder nichtmagischer Pflanze. Du erfährst, in welcher Entfernung und Richtung im Abstand von bis zu acht Kilometern sich die nächste Kreatur dieser Art befindet, sofern vorhanden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Describe or name a specific kind of Beast, Plant creature, or nonmagical plant. You learn the direction and distance to the closest creature or plant of that kind within 5 miles, if any are present."
    }
   ]
  }
 },
 {
  "id": "locate-creature",
  "name": {
   "de": "Kreatur aufspüren",
   "en": "Locate Creature"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 4. Grades (Barde, Druide, Kleriker, Magier, Paladin, Waldläufer)",
   "en": "Level 4 Divination (Bard, Cleric, Druid, Paladin, Ranger, Wizard)"
  },
  "grad": 4,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "magier",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (etwas Fell von einem Bluthund)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (fur from a bloodhound)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Beschreibe oder nenne eine Kreatur, mit der du vertraut bist. Sofern die Kreatur sich im Abstand von bis zu 300 Metern von dir befindet, spürst du, in welcher Richtung ihr Aufenthaltsort liegt. Bewegt sich die Kreatur, so weißt du, in welche Richtung. Der Zauber kann eine bestimmte dir bekannte Kreatur aufspüren oder die nächste Kreatur einer bestimmten Art – wie ein Mensch oder ein Einhorn –, sofern du eine solche Kreatur mindestens einmal aus höchstens neun Metern Entfernung gesehen hast. Hat die beschriebene oder genannte Kreatur eine andere Gestalt angenommen, beispielsweise durch die Zauber Fleisch zu Stein oder Verwandlung, so kann dieser Zauber die Kreatur nicht aufspüren. Der Zauber kann die Kreatur auch dann nicht aufspüren, wenn Blei den direkten Weg zwischen dir und ihr blockiert – egal, welche Dicke das Blei hat."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Describe or name a creature that is familiar to you. You sense the direction to the creature’s location if that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement. The spell can locate a specific creature known to you or the nearest creature of a specific kind (such as a human or a unicorn) if you have seen such a creature up close—within 30 feet—at least once. If the creature you described or named is in a different form, such as under the effects of a Flesh to Stone or Polymorph spell, this spell doesn’t locate the creature. This spell can’t locate a creature if any thickness of lead blocks a direct path between you and the creature."
    }
   ]
  }
 },
 {
  "id": "locate-object",
  "name": {
   "de": "Gegenstand aufspüren",
   "en": "Locate Object"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 2. Grades (Barde, Druide, Kleriker, Magier, Paladin, Waldläufer)",
   "en": "Level 2 Divination (Bard, Cleric, Druid, Paladin, Ranger, Wizard)"
  },
  "grad": 2,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "magier",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein gegabelter Zweig)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a forked twig)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Beschreibe oder nenne einen Gegenstand, mit dem du vertraut bist. Sofern der Gegenstand sich im Abstand von bis zu 300 Metern von dir befindet, spürst du, in welcher Richtung sein Aufenthaltsort liegt. Wenn sich der Gegenstand in Bewegung befindet, weißt du, in welche Richtung er bewegt wird. Der Zauber kann einen bestimmtem dir bekannten Gegenstand aufspüren, sofern du diesen mindestens einmal aus der Nähe – aus höchstens neun Metern Entfernung – gesehen hast. Alternativ kann der Zauber den nächstgelegenen Gegenstand einer bestimmten Art aufspüren, wie eine bestimmte Art von Kleidung, Möbel, Schmuck, Waffe oder Werkzeug. Dieser Zauber kann den Gegenstand nicht aufspüren, wenn Blei den direkten Weg zwischen dir und dem Gegenstand blockiert – egal, welche Dicke das Blei hat es hat."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Describe or name an object that is familiar to you. You sense the direction to the object’s location if that object is within 1,000 feet of you. If the object is in motion, you know the direction of its movement. The spell can locate a specific object known to you if you have seen it up close—within 30 feet—at least once. Alternatively, the spell can locate the nearest object of a particular kind, such as a certain kind of apparel, jewelry, furniture, tool, or weapon. This spell can’t locate an object if any thickness of lead blocks a direct path between you and the object."
    }
   ]
  }
 },
 {
  "id": "longstrider",
  "name": {
   "de": "Lange Schritte",
   "en": "Longstrider"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 1. Grades (Barde, Druide, Magier, Waldläufer)",
   "en": "Level 1 Transmutation (Bard, Druid, Ranger, Wizard)"
  },
  "grad": 1,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "magier",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Prise Erde)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a pinch of dirt)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur. Für die Wirkungsdauer ist die Bewegungsrate des Ziels um drei Meter erhöht."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature. The target’s Speed increases by 10 feet until the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "mage-armor",
  "name": {
   "de": "Magierrüstung",
   "en": "Mage Armor"
  },
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Abjuration (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Stück gehärtetes Leder)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a piece of cured leather)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur, die keine Rüstung trägt. Für die Wirkungsdauer erhält das Ziel eine Basis‑RK von 13 plus ihrem Geschicklichkeitsmodifikator. Der Zauber endet vorzeitig, wenn das Ziel eine Rüstung anlegt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature who isn’t wearing armor. Until the spell ends, the target’s base AC becomes 13 plus its Dexterity modifier. The spell ends early if the target dons armor."
    }
   ]
  }
 },
 {
  "id": "mage-hand",
  "name": {
   "de": "Magierhand",
   "en": "Mage Hand"
  },
  "gradzeile": {
   "de": "Zaubertrick der Beschwörung (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Conjuration Cantrip (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 0,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An einem Punkt deiner Wahl in Reichweite erscheint eine geisterhafte schwebende Hand. Sie bleibt für die Wirkungsdauer bestehen. Die Hand verschwindet, wenn sie weiter als neun Meter von dir entfernt ist oder du den Zauber erneut wirkst. Wenn du den Zauber wirkst, kannst du mithilfe der Hand mit Gegenständen interagieren, unverschlossene Türen oder Behälter öffnen, Gegenstände in einem Behälter verstauen oder daraus hervorholen oder den Inhalt einer Phiole ausgießen. In deinen folgenden Zügen kannst du die Hand als magische Aktion erneut auf diese Art kontrollieren. Als Teil dieser Aktion kannst du die Hand bis zu neun Meter weit bewegen. Die Hand kann nicht angreifen, keine magischen Gegenstände aktivieren und nicht mehr als fünf Kilogramm Gewicht tragen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again. When you cast the spell, you can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. As a Magic action on your later turns, you can control the hand thus again. As part of that action, you can move the hand up to 30 feet. The hand can’t attack, activate magic items, or carry more than 10 pounds."
    }
   ]
  }
 },
 {
  "id": "magic-circle",
  "name": {
   "de": "Schutzkreis",
   "en": "Magic Circle"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Hexenmeister, Kleriker, Magier, Paladin)",
   "en": "Level 3 Abjuration (Cleric, Paladin, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "hexenmeister",
   "kleriker",
   "magier",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "3 Meter",
    "komponenten": "V, G, M (Salz und Silberpulver im Wert von mindestens 100 GM, das der Zauber verbraucht)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "10 feet",
    "komponenten": "V, S, M (salt and powdered silver worth 100+ GP, which the spell consumes)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst einen sechs Meter hohen Zylinder aus magischer Energie mit einem Radius von drei Metern um einen Punkt auf dem Boden in Reichweite, den du sehen kannst. Wo der Zylinder den Boden oder eine andere Oberfläche schneidet, erscheinen leuchtende Runen. Wähle mindestens einen der folgenden Kreaturentypen aus: celestische Wesen, Elementare, Feenwesen, Unholde oder Untote. Der Kreis beeinflusst eine Kreatur des ausgewählten Typs wie folgt: • Die Kreatur kann den Zylinder nicht freiwillig auf nichtmagische Weise betreten. Versucht die Kreatur, Teleportation oder Ebenenreisen zu verwenden, so muss sie zuerst einen Charismarettungswurf bestehen. • Die Kreatur ist bei Angriffswürfen gegen Ziele innerhalb des Zylinders im Nachteil. • Ziele innerhalb des Zylinders können von der Kreatur nicht besessen, bezaubert oder verängstigt werden. Jedes Mal, wenn du diesen Zauber wirkst, kannst du seine Wirkung umkehren, sodass Kreaturen des ausgewählten Typs den Zylinder nicht verlassen können und Ziele außerhalb des Zylinders geschützt sind."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird die Wirkungsdauer um eine Stunde erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a 10-foot-radius, 20-foot-tall Cylinder of magical energy centered on a point on the ground that you can see within range. Glowing runes appear wherever the Cylinder intersects with the floor or other surface. Choose one or more of the following types of creatures: Celestials, Elementals, Fey, Fiends, or Undead. The circle affects a creature of the chosen type in the following ways: • The creature can’t willingly enter the Cylinder by nonmagical means. If the creature tries to use teleportation or interplanar travel to do so, it must first succeed on a Charisma saving throw. • The creature has Disadvantage on attack rolls against targets within the Cylinder. • Targets within the Cylinder can’t be possessed by or gain the Charmed or Frightened condition from the creature. Each time you cast this spell, you can cause its magic to operate in the reverse direction, preventing a creature of the specified type from leaving the Cylinder and protecting targets outside it."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The duration increases by 1 hour for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "magic-jar",
  "name": {
   "de": "Magisches Gefäß",
   "en": "Magic Jar"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 6. Grades (Magier)",
   "en": "Level 6 Necromancy (Wizard)"
  },
  "grad": 6,
  "schule": "nekromantie",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Edelstein, ein Kristall oder eine Reliquie im Wert von mindestens 500 GM)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "Self",
    "komponenten": "V, S, M (a gem, crystal, or reliquary worth 500+ GP)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dein Körper verfällt in einen katatonischen Zustand, während deine Seele ihn verlässt und in den Behälter eindringt, den du als Materialkomponente des Zaubers verwendest. Während sich deine Seele im Behälter befindet, nimmst du deine Umgebung wahr, als würdest du dich im Bereich des Behälters aufhalten. Du kannst dich weder bewegen noch Reaktionen ausführen. Als einzige mögliche Aktion kannst du deine Seele bis zu 30 Meter außerhalb des Behälters projizieren und entweder in deinen lebendigen Körper zurück kehren – und damit den Zauber beenden – oder versuchen, dich des Körpers eines Humanoiden zu bemächtigen. Du kannst versuchen, von einem beliebigen Humanoiden im Abstand von bis zu 30 Metern von dir, den du sehen kannst, Besitz zu ergreifen. Ausgenommen sind Kreaturen, die unter einem der Zauber Schutz vor Gut und Böse oder Schutzkreis stehen. Das Ziel führt einen Charismarettungswurf aus. Misslingt der Wurf, so besetzt deine Seele den Körper des Ziels, und seine Seele wird im Behälter gefangen. Bei einem erfolgreichen Rettungswurf widersteht das Ziel dir, und du kannst 24 Stunden lang keinen weiteren Versuch unternehmen. Sobald du vom Körper einer Kreatur Besitz ergriffen hast, kontrollierst du ihn. Deine Trefferpunkte und Trefferpunktewürfel, deine Werte für Geschicklichkeit, Konstitution und Stärke, deine Bewegungsrate sowie deine Sinne werden durch die der Kreatur ersetzt. Deine übrigen Spielwerte behältst du bei. Währenddessen kann die Seele der Kreatur die Umgebung um den Behälter mit ihren eigenen Sinnen wahrnehmen. Sie ist jedoch kampfunfähig und kann sich nicht bewegen. Während du von einem Körper Besitz ergriffen hast, kannst du als magische Aktion vom Wirtskörper zum Behälter zurückkehren, sofern sich dieser im Abstand von bis zu 30 Metern von dir befindet. Dadurch wird die Seele der Kreatur in ihren Körper zurückbefördert. Wenn der Wirtskörper stirbt, während du dich darin befindest, stirbt die Kreatur, und du führst einen Charismarettungswurf gegen deinen eigenen Zauberrettungswurf‑SG aus. Bei einem Erfolg kehrst du in den Behälter zurück, sofern er sich im Abstand von bis zu 30 Metern von dir befindet. Anderenfalls stirbst du. Wenn der Behälter zerstört wird oder der Zauber endet, kehrt deine Seele in deinen Körper zurück. Befindet sich dein Körper weiter als 30 Meter von dir entfernt oder ist er tot, so stirbst du. Befindet sich die Seele einer anderen Kreatur im Behälter, wenn er zerstört wird, so kehrt sie in ihren Körper zurück, sofern er lebendig ist und sich im Abstand von bis zu 30 Metern von ihr befindet. Anderenfalls stirbt die Kreatur. Wenn der Zauber endet, wird der Behälter zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell’s Material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container’s space. You can’t move or take Reactions. The only action you can take is to project your soul up to 100 feet out of the container, either returning to your living body (and ending the spell) or attempting to possess a Humanoid’s body. You can attempt to possess any Humanoid within 100 feet of you that you can see (creatures warded by a Protection from Evil and Good or Magic Circle spell can’t be possessed). The target makes a Charisma saving throw. On a failed save, your soul enters the target’s body, and the target’s soul becomes trapped in the container. On a successful save, the target resists your efforts to possess it, and you can’t attempt to possess it again for 24 hours. Once you possess a creature’s body, you control it. Your Hit Points, Hit Point Dice, Strength, Dexterity, Constitution, Speed, and senses are replaced by the creature’s. You otherwise keep your game statistics. Meanwhile, the possessed creature’s soul can perceive from the container using its own senses, but it can’t move and it is Incapacitated. While possessing a body, you can take a Magic action to return from the host body to the container if it is within 100 feet of you, returning the host creature’s soul to its body. If the host body dies while you’re in it, the creature dies, and you make a Charisma saving throw against your own spellcasting DC. On a success, you return to the container if it is within 100 feet of you. Otherwise, you die. If the container is destroyed or the spell ends, your soul returns to your body. If your body is more than 100 feet away from you or if your body is dead, you die. If another creature’s soul is in the container when it is destroyed, the creature’s soul returns to its body if the body is alive and within 100 feet. Otherwise, that creature dies. When the spell ends, the container is destroyed."
    }
   ]
  }
 },
 {
  "id": "magic-missile",
  "name": {
   "de": "Magisches Geschoss",
   "en": "Magic Missile"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Evocation (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst drei leuchtende Wurfpfeile aus magischer Energie. Jeder Wurfpfeil trifft eine Kreatur deiner Wahl in Reichweite, die du sehen kannst. Ein Wurfpfeil fügt seinem Ziel 1W4+1 Energieschaden zu. Die Wurfpfeile treffen alle gleichzeitig. Du kannst bestimmen, ob sie dieselbe oder verschiedene Kreaturen treffen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. erzeugt der Zauber einen weiteren Wurfpfeil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create three glowing darts of magical force. Each dart strikes a creature of your choice that you can see within range. A dart deals 1d4 + 1 Force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The spell creates one more dart for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "magic-mouth",
  "name": {
   "de": "Magischer Mund",
   "en": "Magic Mouth"
  },
  "gradzeile": {
   "de": "Illusionszauber 2. Grades (Barde, Magier)",
   "en": "Level 2 Illusion (Bard, Wizard)"
  },
  "grad": 2,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (Jadestaub im Wert von mindestens 10 GM, den der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (jade dust worth 10+ GP, which the spell consumes)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du implantierst eine Botschaft in einen Gegenstand in Reichweite. Diese Botschaft wird bei einer bestimmten Auslösebedingung ausgesprochen. Wähle einen Gegenstand aus, den du sehen kannst und der nicht von einer anderen Kreatur getragen oder gehalten wird. Sprich dann die Botschaft aus. Sie kann höchstens 25 Worte enthalten, jedoch über einen Zeitraum von bis zu zehn Minuten übermittelt werden. Lege zum Schluss den Umstand fest, unter dem der Zauber ausgelöst und deine Botschaft übermittelt wird. Wenn dieser Auslöser eintritt, erscheint ein magischer Mund auf dem Gegenstand und spricht die Botschaft mit deiner Stimme und deiner Sprachlautstärke. Verfügt der ausgewählte Gegenstand über einen Mund oder etwas, das wie ein Mund aussieht, beispielsweise den Mund einer Statue, so erscheint der magische Mund dort, sodass die Worte aus dem Mund des Gegenstands zu kommen scheinen. Wenn du diesen Zauber wirkst, kannst du entscheiden, ob er nach einmaligem Übermitteln der Botschaft endet oder aber bestehen bleibt und die Botschaft jeweils wiederholt wird, wenn die Auslösebedingung erneut erfüllt ist. Der Auslöser kann beliebig allgemein oder detailliert sein. Er muss jedoch auf sichtbaren und hörbaren Umständen basieren, die im Abstand von bis zu neun Metern um den Gegenstand auftreten. Beispielweise könntest du bestimmen, dass die Botschaft übermittelt wird, sobald eine Kreatur sich dem Gegenstand auf neun Meter nähert oder wenn im Abstand von bis zu neun Metern vom Gegenstand eine Silberglocke geläutet wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You implant a message within an object in range—a message that is uttered when a trigger condition is met. Choose an object that you can see and that isn’t being worn or carried by another creature. Then speak the message, which must be 25 words or fewer, though it can be delivered over as long as 10 minutes. Finally, determine the circumstance that will trigger the spell to deliver your message. When that trigger occurs, a magical mouth appears on the object and recites the message in your voice and at the same volume you spoke. If the object you chose has a mouth or something that looks like a mouth (for example, the mouth of a statue), the magical mouth appears there, so the words appear to come from the object’s mouth. When you cast this spell, you can have the spell end after it delivers its message, or it can remain and repeat its message whenever the trigger occurs. The trigger can be as general or as detailed as you like, though it must be based on visual or audible conditions that occur within 30 feet of the object. For example, you could instruct the mouth to speak when any creature moves within 30 feet of the object or when a silver bell rings within 30 feet of it."
    }
   ]
  }
 },
 {
  "id": "magic-weapon",
  "name": {
   "de": "Magische Waffe",
   "en": "Magic Weapon"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Magier, Paladin, Waldläufer, Zauberer)",
   "en": "Level 2 Transmutation (Paladin, Ranger, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "paladin",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine nichtmagische Waffe. Für die Wirkungsdauer ist diese Waffe eine magische Waffe mit einem Bonus von +1 auf Angriffs ‑ und Schadenswürfe. Der Zauber endet vorzeitig, wenn du ihn erneut wirkst."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Bei einem Zauberplatz des 3. bis 5. Grades wird der Bonus auf +2 erhöht. Bei einem Zauberplatz ab dem 6. Grad wird der Bonus auf +3 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. The spell ends early if you cast it again."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The bonus increases to +2 with a level 3–5 spell slot. The bonus increases to +3 with a level 6+ spell slot."
    }
   ]
  }
 },
 {
  "id": "magnificent-mansion",
  "name": {
   "de": "Herrliches Herrenhaus",
   "en": "Magnificent Mansion"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 7. Grades (Barde, Magier)",
   "en": "Level 7 Conjuration (Bard, Wizard)"
  },
  "grad": 7,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "90 Meter",
    "komponenten": "V, G, M (eine Miniatur-Tür im Wert von mindestens 15 GM)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "300 feet",
    "komponenten": "V, S, M (a miniature door worth 15+ GP)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst in Reichweite eine schimmernde Tür, die für die Wirkungsdauer bestehen bleibt. Sie ist 1,5 Meter breit und drei Meter hoch, und sie führt zu einem extradimensionalen Anwesen. Du und jede Kreatur, die du beim Wirken des Zaubers bestimmst, könnt das extradimensionale Anwesen betreten, solange die Tür geöffnet ist. Du kannst sie öffnen oder schließen (keine Aktion erforderlich), wenn du dich im Abstand von bis zu neun Metern davon befindest. Ist die Tür geschlossen, so ist sie nicht wahrnehmbar. Hinter der Tür liegt eine herrliche Eingangshalle mit zahlreichen Zimmern. Die Atmosphäre des Anwesens ist sauber, frisch und warm. Du kannst einen beliebigen Grundriss erstellen, der allerdings 50 zusammenhängende Würfel mit je drei Metern Kantenlänge nicht überschreiten kann. Das Anwesen ist nach deinen Wünschen eingerichtet und dekoriert. Es gibt ausreichend Nahrung, um bis zu 100 Personen ein Festmahl mit neun Gängen zu servieren. Möbel und andere Gegenstände, die durch diesen Zauber erschaffen wurden, lösen sich in Rauch auf, wenn sie aus dem Anwesen entfernt werden. 100 nahezu durchsichtige Diener nehmen sich der Wünsche aller Gäste an. Du bestimmst, wie die Diener aussehen und welche Kleidung sie tragen. Sie sind unverwundbar und gehorchen deinen Befehlen. Dabei können sie Aufgaben ausführen, die auch Menschen ausführen könnten. Sie können jedoch nicht angreifen oder Aktionen ausführen, die anderen Kreaturen direkten Schaden zufügen würden. Die Diener können Gegenstände holen und reinigen, Kleidung zusammenlegen, Feuer entfachen, Essen servieren, Wein einschenken und dergleichen. Sie können das Anwesen jedoch nicht verlassen. Wenn der Zauber endet, werden alle Kreaturen und Gegenstände aus dem extradimensionalen Bereich in die freien Bereiche ausgestoßen, die dem Eingang am nächsten liegen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a shimmering door in range that lasts for the duration. The door leads to an extradimensional dwelling and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the door remains open. You can open or close it (no action required) if you are within 30 feet of it. While closed, the door is imperceptible. Beyond the door is a magnificent foyer with numerous chambers beyond. The dwelling’s atmosphere is clean, fresh, and warm. You can create any floor plan you like for the dwelling, but it can’t exceed 50 contiguous 10-foot Cubes. The place is furnished and decorated as you choose. It contains sufficient food to serve a ninecourse banquet for up to 100 people. Furnishings and other objects created by this spell dissipate into smoke if removed from it. A staff of 100 near-transparent servants attends all who enter. You determine the appearance of these servants and their attire. They are invulnerable and obey your commands. Each servant can perform tasks that a human could perform, but they can’t attack or take any action that would directly harm another creature. Thus the servants can fetch things, clean, mend, fold clothes, light fires, serve food, pour wine, and so on. The servants can’t leave the dwelling. When the spell ends, any creatures or objects left inside the extradimensional space are expelled into the unoccupied spaces nearest to the entrance."
    }
   ]
  }
 },
 {
  "id": "major-image",
  "name": {
   "de": "Mächtiges Trugbild",
   "en": "Major Image"
  },
  "gradzeile": {
   "de": "Illusionszauber 3. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 3 Illusion (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (ein Stück Vlies)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a bit of fleece)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst das Abbild eines Gegenstands, einer Kreatur oder eines anderen sichtbaren Phänomens, das nicht größer als ein Würfel mit sechs Metern Kantenlänge sein darf. Das Abbild erscheint an einem Punkt in Reichweite und bleibt für die Wirkungsdauer bestehen. Es wirkt echt, einschließlich passender Geräusche, Gerüche und Temperaturen, kann jedoch weder Schaden noch Zustände bewirken. Wenn du dich in Reichweite der Illusion befindest, kannst du sie mit einer magischen Aktion an einen anderen Ort deiner Wahl in Reichweite bewegen. Dabei kannst du das Abbild so verändern, dass seine Bewegung natürlich erscheint. Beispiel: Wenn du das Abbild einer Kreatur erschaffst und bewegst, kannst du es so verändern, dass es zu laufen scheint. Außerdem kannst du die Illusion verschiedene Geräusche erzeugen oder sogar ein Gespräch führen lassen. Physische Interaktionen mit dem Abbild enttarnen es als Illusion, da Dinge es einfach durchdringen können. Eine Kreatur, die das Abbild mit der Studieren‑Aktion untersucht, kann mit einem erfolgreichen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG erkennen, dass es sich um eine Illusion handelt. In diesem Fall sieht sie das Abbild als durchscheinend und nimmt auch die anderen sensorischen Eigenschaften abgeschwächt wahr."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Bei einem Zauberplatz ab dem 4. Grad wirkt der Zauber, bis er gebannt wird, ohne dass er Konzentration erfordert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot Cube. The image appears at a spot that you can see within range and lasts for the duration. It seems real, including sounds, smells, and temperature appropriate to the thing depicted, but it can’t deal damage or cause conditions. If you are within range of the illusion, you can take a Magic action to cause the image to move to any other spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Similarly, you can cause the illusion to make different sounds at different times, even making it carry on a conversation, for example. Physical interaction with the image reveals it to be an illusion, for things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and its other sensory qualities become faint to the creature."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The spell lasts until dispelled, without requiring Concentration, if cast with a level 4+ spell slot."
    }
   ]
  }
 },
 {
  "id": "mass-cure-wounds",
  "name": {
   "de": "Massen-Wunden heilen",
   "en": "Mass Cure Wounds"
  },
  "gradzeile": {
   "de": "Bannzauber 5. Grades (Barde, Druide, Kleriker)",
   "en": "Level 5 Abjuration (Bard, Cleric, Druid)"
  },
  "grad": 5,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von einem Punkt deiner Wahl in Reichweite geht eine Woge heilender Energie aus. Wähle bis zu sechs Kreaturen innerhalb einer Kugel mit einem Radius von neun Metern um den Zielort aus. Jedes Ziel erhält Trefferpunkte in Höhe von 5W8 plus deinem Zauberwirken-Attributsmodifikator zurück."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 5. wird die Heilung um 1W8 Trefferpunkte erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A wave of healing energy washes out from a point you can see within range. Choose up to six creatures in a 30-foot-radius Sphere centered on that point. Each target regains Hit Points equal to 5d8 plus your spellcasting ability modifier."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The healing increases by 1d8 for each spell slot level above 5."
    }
   ]
  }
 },
 {
  "id": "mass-heal",
  "name": {
   "de": "Massen-Heilung",
   "en": "Mass Heal"
  },
  "gradzeile": {
   "de": "Bannzauber 9. Grades (Kleriker)",
   "en": "Level 9 Abjuration (Cleric)"
  },
  "grad": 9,
  "schule": "bann",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von dir strömt eine Flut aus heilender Energie zu Kreaturen um dich herum. Du kannst bis zu 700 Trefferpunkte wiederherstellen und nach deiner Wahl auf eine beliebige Anzahl von Kreaturen in Reichweite verteilen, die du sehen kannst. Von diesem Zauber geheilte Kreaturen werden außerdem von den Zuständen Blind, Taub und Vergiftet befreit."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A flood of healing energy flows from you into creatures around you. You restore up to 700 Hit Points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell also have the Blinded, Deafened, and Poisoned conditions removed from them."
    }
   ]
  }
 },
 {
  "id": "mass-healing-word",
  "name": {
   "de": "Massen-Heilendes Wort",
   "en": "Mass Healing Word"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Barde, Kleriker)",
   "en": "Level 3 Abjuration (Bard, Cleric)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "barde",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Bis zu sechs Kreaturen deiner Wahl in Reichweite, die du sehen kannst, erhalten Trefferpunkte in Höhe von 2W4 plus deinem Zauberwirken‑Attributsmodifikator zurück."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird die Heilung um 1W4 Trefferpunkte erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Up to six creatures of your choice that you can see within range regain Hit Points equal to 2d4 plus your spellcasting ability modifier."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The healing increases by 1d4 for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "mass-suggestion",
  "name": {
   "de": "Massen-Einfl üsterung",
   "en": "Mass Suggestion"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 6. Grades (Barde, Magier, Zauberer)",
   "en": "Level 6 Enchantment (Bard, Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, M (eine Schlangenzunge)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, M (a snake’s tongue)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schlägst bis zu zwölf Kreaturen in Reichweite, die du sehen kannst und die dich hören und verstehen können, mit höchstens 25 Worten eine Vorgehensweise vor. Der Vorschlag muss realistisch klingen und darf nichts enthalten, was den Zielen oder ihren Verbündeten Schaden zufügen würde. Du könntest beispielsweise sagen: „Geht ins Dorf an dieser Straße und helft den Leuten dort bis zum Sonnenuntergang bei der Ernte.“ Oder du könntest sagen: „Dies ist nicht die Zeit für Gewalt. Lasst Eure Waffen fallen und tanzt! Hört in einer Stunde wieder auf damit.“ Jedes Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer – oder bis du oder deine Verbündeten ihm Schaden zufügen – bezaubert. Jedes bezauberte Ziel führt den Vorschlag nach besten Kräften aus. Die vorgeschlagene Aktivität kann während der gesamten Wirkungsdauer fortgesetzt werden. Wenn sie jedoch in kürzerer Zeit abgeschlossen werden kann, endet der Zauber bei einem Ziel, sobald es die Aktivität ausgeführt hat."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Die Wirkungsdauer wird erhöht: bei einem Zauberplatzgrad von 7 auf 10 Tage, bei einem Zauberplatz grad von 8 auf 30 Tage und bei einem Zauberplatzgrad von 9 auf 366 Tage."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You suggest a course of activity—described in no more than 25 words—to twelve or fewer creatures you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to any of the targets or their allies. For example, you could say, “Walk to the village down that road, and help the villagers there harvest crops until sunset.” Or you could say, “Now is not the time for violence. Drop your weapons, and dance! Stop in an hour.” Each target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. Each Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for a target upon completing it."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The duration is longer with a spell slot of level 7 (10 days), 8 (30 days), or 9 (366 days)."
    }
   ]
  }
 },
 {
  "id": "maze",
  "name": {
   "de": "Irrgarten",
   "en": "Maze"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 8. Grades (Magier)",
   "en": "Level 8 Conjuration (Wizard)"
  },
  "grad": 8,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verbannst eine Kreatur in Reichweite, die du sehen kannst, auf eine labyrinthartige Halbebene. Sie bleibt für die Wirkungsdauer dort, oder bis sie dem Irrgarten entkommt. Das Ziel kann die Studieren‑Aktion ausführen, um zu entkommen zu versuchen. Dazu führt es einen SG‑20‑Intelligenzwurf (Nachforschungen) aus. Bei einem Erfolg entkommt es, und der Zauber endet. Wenn der Zauber endet, erscheint das Ziel in dem Bereich, aus dem es wegteleportiert wurde, oder im nächstgelegenen freien Bereich wieder, falls der ursprüngliche inzwischen besetzt ist."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze. The target can take a Study action to try to escape. When it does so, it makes a DC 20 Intelligence (Investigation) check. If it succeeds, it escapes, and the spell ends. When the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space."
    }
   ]
  }
 },
 {
  "id": "meld-into-stone",
  "name": {
   "de": "Mit Stein verschmelzen",
   "en": "Meld into Stone"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Druide, Kleriker, Waldläufer)",
   "en": "Level 3 Transmutation (Cleric, Druid, Ranger)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du betrittst einen steinernen Gegenstand oder eine Oberfläche von ausreichender Größe, um deinen Körper aufzunehmen, und verschmilzt für die Wirkungsdauer mitsamt deiner Ausrüstung mit dem Stein. Dazu musst du den Stein berühren. Deine Anwesenheit ist nicht erkennbar und kann nur auf magische Weise wahrgenommen werden. Während du mit dem Stein verschmolzen bist, kannst du nicht sehen, was außerhalb vor sich geht. Du bist zudem bei Weisheitswürfen (Wahrnehmung), um Geräusche von außen zu hören, im Nachteil. Du bemerkst, wie die Zeit vergeht, und kannst Zauber auf dich selbst wirken. Zudem kannst du 1,5 Meter deiner Bewegungsrate verwenden, um den Stein dort zu verlassen, wo du ihn betreten hast. Dadurch endet der Zauber. Ansonsten kannst du dich nicht bewegen. Geringer physischer Schaden am Stein verletzt dich nicht. Wenn er teilweise zerstört oder seine Form verändert wird, sodass du nicht mehr hineinpasst, wirst du ausgestoßen und erleidest 6W6 Energieschaden. Wird der Stein vollständig zerstört oder in eine andere Substanz verwandelt, so wirst du ausgestoßen und erleidest 50 Energieschaden. Wenn du ausgestoßen wirst, gelangst du in den freien Bereich, der deinem Eintrittspunkt am nächsten liegt, und hast den Zustand Liegend."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You step into a stone object or surface large enough to fully contain your body, merging yourself and your equipment with the stone for the duration. You must touch the stone to do so. Nothing of your presence remains visible or otherwise detectable by nonmagical senses. While merged with the stone, you can’t see what occurs outside it, and any Wisdom (Perception) checks you make to hear sounds outside it are made with Disadvantage. You remain aware of the passage of time and can cast spells on yourself while merged in the stone. You can use 5 feet of movement to leave the stone where you entered it, which ends the spell. You otherwise can’t move. Minor physical damage to the stone doesn’t harm you, but its partial destruction or a change in its shape (to the extent that you no longer fit within it) expels you and deals 6d6 Force damage to you. The stone’s complete destruction (or transmutation into a different substance) expels you and deals 50 Force damage to you. If expelled, you move into an unoccupied space closest to where you first entered and have the Prone condition."
    }
   ]
  }
 },
 {
  "id": "mending",
  "name": {
   "de": "Ausbessern",
   "en": "Mending"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verwandlung (Barde, Druide, Kleriker, Magier, Zauberer)",
   "en": "Transmutation Cantrip (Bard, Cleric, Druid, Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (zwei Magnetsteine)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "Touch",
    "komponenten": "V, S, M (two lodestones)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber repariert einen Gegenstand, den du berührst und der eine Bruchstelle oder einen Riss hat, beispielsweise ein kaputtes Kettenglied, einen zerbrochenen Schlüssel, einen zerrissenen Umhang oder einen lecken Weinschlauch. Wenn der Riss oder die Bruchstelle in keiner Abmessung größer als 30 Zentimeter ist, wird nicht mehr zu erkennen sein, dass der Gegenstand beschädigt war. Dieser Zauber kann magische Gegenstände physisch reparieren, deren Magie jedoch nicht wiederherstellen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no larger than 1 foot in any dimension, you mend it, leaving no trace of the former damage. This spell can physically repair a magic item, but it can’t restore magic to such an object."
    }
   ]
  }
 },
 {
  "id": "message",
  "name": {
   "de": "Botschaft",
   "en": "Message"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verwandlung (Barde, Druide, Magier, Zauberer)",
   "en": "Transmutation Cantrip (Bard, Druid, Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "G, M (ein Stück Kupferdraht)",
    "dauer": "1 Runde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "S, M (a copper wire)",
    "dauer": "1 round"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du deutest auf eine Kreatur in Reichweite und flüsterst eine Botschaft. Das Ziel (und nur dieses) hört die Botschaft und kann mit einem Flüstern antworten, das nur du hörst. Du kannst diesen Zauber durch massive Gegenstände hindurch wirken, wenn du mit dem Ziel vertraut bist und weißt, dass es sich hinter der Barriere befindet. Magische Stille, 30 Zentimeter Stein, Metall oder Holz sowie dünnes Bleiblech blockieren den Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You point toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear. You can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence; 1 foot of stone, metal, or wood; or a thin sheet of lead blocks the spell."
    }
   ]
  }
 },
 {
  "id": "meteor-swarm",
  "name": {
   "de": "Meteoritenschwarm",
   "en": "Meteor Swarm"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 9. Grades (Magier, Zauberer)",
   "en": "Level 9 Evocation (Sorcerer, Wizard)"
  },
  "grad": 9,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "1,6 Kilometer",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "1 mile",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An vier verschiedenen Punkten in Reichweite, die du sehen kannst, stürzen lodernde Feuerkugeln zu Boden. Alle Kreaturen in Kugeln mit einem Radius von zwölf Metern um diese Punkte müssen einen Geschicklichkeitsrettungswurf ausführen. Misslingt der Wurf, so erleidet die jeweilige Kreatur 20W6 Feuerschaden und 20W6 Wuchtschaden, anderenfalls die Hälfte. Kreaturen im Wirkungsbereich von mehr als einer Feuerkugel sind nur einmal betroffen. Nichtmagische Gegenstände im Bereich, die nicht getragen oder gehalten werden, erleiden den gleichen Schaden und fangen Feuer, sofern sie brennbar sind."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius Sphere centered on each of those points makes a Dexterity saving throw. A creature takes 20d6 Fire damage and 20d6 Bludgeoning damage on a failed save or half as much damage on a successful one. A creature in the area of more than one fiery Sphere is affected only once. A nonmagical object that isn’t being worn or carried also takes the damage if it’s in the spell’s area, and the object starts burning if it’s flammable."
    }
   ]
  }
 },
 {
  "id": "mind-blank",
  "name": {
   "de": "Gedankenleere",
   "en": "Mind Blank"
  },
  "gradzeile": {
   "de": "Bannzauber 8. Grades (Barde, Magier)",
   "en": "Level 8 Abjuration (Bard, Wizard)"
  },
  "grad": 8,
  "schule": "bann",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine bereitwillige Kreatur, die du berührst, ist für die Wirkungsdauer gegen psychischen Schaden und den Zustand Bezaubert immun. Das Ziel ist außerdem nicht von Effekten zum Erkennen seiner Gefühle und Gedanken, seiner Gesinnung sowie zum Bestimmen seines Aufenthaltsorts auf magische Art betroffen. Kein Zauber – auch nicht Wunsch – kann Informationen über das Ziel sammeln, es aus der Ferne beobachten oder seinen Verstand kontrollieren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, one willing creature you touch has Immunity to Psychic damage and the Charmed condition. The target is also unaffected by anything that would sense its emotions or alignment, read its thoughts, or magically detect its location, and no spell—not even Wish—can gather information about the target, observe it remotely, or control its mind."
    }
   ]
  }
 },
 {
  "id": "mind-spike",
  "name": {
   "de": "Gedankendorn",
   "en": "Mind Spike"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 2. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 2 Divination (Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "erkenntnis",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "S",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "S",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du treibst einer Kreatur in Reichweite, die du sehen kannst, einen desorientierenden Stachel psionischer Energie in den Geist. Das Ziel führt einen Weisheitsrettungswurf aus. Misslingt der Wurf, so erleidet es 3W8 psychischen Schaden, anderenfalls die Hälfte. Misslingt der Wurf, so kennst du außerdem stets den Aufenthaltsort des Ziels, bis der Zauber endet, sofern ihr euch beide auf derselben Existenzebene befindet. Solange du über dieses Wissen verfügst, kann das Ziel sich nicht vor dir verstecken, und wenn es unsichtbar ist, gibt ihm dieser Zustand gegen dich keine Vorzüge."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You drive a spike of psionic energy into the mind of one creature you can see within range. The target makes a Wisdom saving throw, taking 3d8 Psychic damage on a failed save or half as much damage on a successful one. On a failed save, you also always know the target’s location until the spell ends, but only while the two of you are on the same plane of existence. While you have this knowledge, the target can’t become hidden from you, and if it has the Invisible condition, it gains no benefit from that condition against you."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "minor-illusion",
  "name": {
   "de": "Einfache Illusion",
   "en": "Minor Illusion"
  },
  "gradzeile": {
   "de": "Zaubertrick der Illusion (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Illusion Cantrip (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 0,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "G, M (ein Stück Vlies)",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "S, M (a bit of fleece)",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst für die Wirkungsdauer ein Geräusch oder das Abbild eines Gegenstands in Reichweite. Die jeweiligen Effekte sind unten beschrieben. Die Illusion endet, wenn du diesen Zauber erneut wirkst. Eine Kreatur, die das Geräusch oder Abbild mit der Studieren‑Aktion untersucht, kann die Illusion mit einem erfolgreichen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG als solche erkennen. In diesem Fall wird die Illusion für sie weniger deutlich wahrnehmbar."
    },
    {
     "typ": "punkt",
     "text": "Geräusch: Die Lautstärke des Geräuschs kann so leise wie ein Flüstern oder so laut wie ein Schrei sein. Dies kann deine Stimme oder die einer anderen Person sein, aber auch Löwengebrüll, Trommeln oder ein anderes beliebiges Geräusch. Für die Wirkungsdauer kannst du einen durchgehenden Laut oder unterschiedliche kurze Laute erzeugen."
    },
    {
     "typ": "punkt",
     "text": "Bild: Das Abbild eines Gegenstands – beispielsweise ein Stuhl, schlammige Fußabdrücke oder eine Truhe – darf nicht größer als ein Würfel mit 1,5 Metern Kantenlänge sein. Es kann weder Geräusche noch Gerüche, Licht oder andere sensorische Effekte erzeugen. Physische Interaktionen mit dem Abbild enttarnen es als Illusion, da Dinge es einfach durchdringen können."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a sound or an image of an object within range that lasts for the duration. See the descriptions below for the effects of each. The illusion ends if you cast this spell again. If a creature takes a Study action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion becomes faint to the creature."
    },
    {
     "typ": "punkt",
     "text": "Sound. If you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else’s voice, a lion’s roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Image. If you create an image of an object—such as a chair, muddy footprints, or a small chest—it must be no larger than a 5-foot Cube. The image can’t create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, since things can pass through it."
    }
   ]
  }
 },
 {
  "id": "mirage-arcane",
  "name": {
   "de": "Arkane Spiegelung",
   "en": "Mirage Arcane"
  },
  "gradzeile": {
   "de": "Illusionszauber 7. Grades (Barde, Druide, Magier)",
   "en": "Level 7 Illusion (Bard, Druid, Wizard)"
  },
  "grad": 7,
  "schule": "illusion",
  "klassen": [
   "barde",
   "druide",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "Sicht",
    "komponenten": "V, G",
    "dauer": "10 Tage"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "Sight",
    "komponenten": "V, S",
    "dauer": "10 days"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du lässt Gelände in einem Bereich von 2,6 Quadratkilometern wie eine andere Art von Gelände aussehen, riechen und sich sogar anfühlen. Weite Felder oder eine Straße können somit wie ein Sumpf, ein Hügel, eine Erdspalte oder anderes unwegsames oder unpassierbares Gelände erscheinen. Ein Tümpel kann wie eine grüne Wiese wirken, ein Steilhang wie ein sanftes Gefälle, ein Graben voller Felsbrocken wie eine breite Straße. Du kannst auch das Erscheinungsbild von Gebäuden ändern oder sie dort platzieren, wo es keine gibt. Der Zauber kann keine Kreaturen verändern, verbergen oder hinzufügen. Die Illusion umfasst hörbare, visuelle, berührbare und olfaktorische Elemente, sodass sie sicheres Gelände in schwieriges verwandeln (und umgekehrt) oder anderweitig die Bewegung durch das Gebiet beeinträchtigen kann. Jeder Teil des illusionären Geländes wie ein Fels oder ein Zweig, der aus dem Bereich des Zaubers entfernt wird, verschwindet sofort. Kreaturen mit Wahrer Blick können die Illusion durchschauen und sehen das echte Gelände. Alle anderen Elemente der Illusion bleiben jedoch bestehen. Selbst wenn sich eine Kreatur der Illusion bewusst ist, kann sie physisch mit ihr interagieren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. Open fields or a road could be made to resemble a swamp, hill, crevasse, or some other rough or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Similarly, you can alter the appearance of structures or add them where none are present. The spell doesn’t disguise, conceal, or add creatures. The illusion includes audible, visual, tactile, and olfactory elements, so it can turn clear ground into Difficult Terrain (or vice versa) or otherwise impede movement through the area. Any piece of the illusory terrain (such as a rock or stick) that is removed from the spell’s area disappears immediately. Creatures with Truesight can see through the illusion to the terrain’s true form; however, all other elements of the illusion remain, so while the creature is aware of the illusion’s presence, the creature can still physically interact with the illusion."
    }
   ]
  }
 },
 {
  "id": "mirror-image",
  "name": {
   "de": "Spiegelbilder",
   "en": "Mirror Image"
  },
  "gradzeile": {
   "de": "Illusionszauber 2. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 2 Illusion (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In deinem Bereich erscheinen drei illusionäre Duplikate deiner selbst. Für die Wirkungsdauer bewegen sich die Duplikate mit dir und imitieren deine Aktionen sowie deine Position, sodass die reale Version unmöglich zu erkennen ist. Wann immer dich eine Kreatur während der Wirkungsdauer des Zaubers mit einem Angriffswurf trifft, würfle für jedes verbleibende Duplikat mit einem 1W6. Würfelst du jeweils mindestens eine 3, wird statt dir das entsprechende Duplikat getroffen und dabei zerstört. Die Duplikate ignorieren alle anderen Schadensquellen und Effekte. Wenn alle drei Duplikate zerstört wurden, endet der Zauber. Eine Kreatur ist von diesem Zauber nicht betroffen, wenn sie den Zustand Blind hat oder aber über Blindsicht oder Wahrer Blick verfügt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it’s impossible to track which image is real. Each time a creature hits you with an attack roll during the spell’s duration, roll a d6 for each of your remaining duplicates. If any of the d6s rolls a 3 or higher, one of the duplicates is hit instead of you, and the duplicate is destroyed. The duplicates otherwise ignore all other damage and effects. The spell ends when all three duplicates are destroyed. A creature is unaffected by this spell if it has the Blinded condition, Blindsight, or Truesight."
    }
   ]
  }
 },
 {
  "id": "mislead",
  "name": {
   "de": "Ablenkung",
   "en": "Mislead"
  },
  "gradzeile": {
   "de": "Illusionszauber 5. Grades (Barde, Hexenmeister, Magier)",
   "en": "Level 5 Illusion (Bard, Warlock, Wizard)"
  },
  "grad": 5,
  "schule": "illusion",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "S",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "S",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du wirst unsichtbar, und gleichzeitig erscheint in deinem Bereich ein illusionärer Doppelgänger von dir. Dieser bleibt für die Wirkungsdauer bestehen, doch deine Unsichtbarkeit endet, sobald du einen Angriffswurf ausführst, Schaden bewirkst oder einen Zauber wirkst. Als magische Aktion kannst du deinen illusionären Doppelgänger bis zu deiner doppelten Bewegungs rate bewegen und ihn gestikulieren, sprechen und auf eine beliebige Art handeln lassen. Er ist immateriell und unverwundbar. Du kannst durch seine Augen sehen und durch seine Ohren hören, als befändest du dich am selben Ort."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain the Invisible condition at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends immediately after you make an attack roll, deal damage, or cast a spell. As a Magic action, you can move the illusory double up to twice your Speed and make it gesture, speak, and behave in whatever way you choose. It is intangible and invulnerable. You can see through its eyes and hear through its ears as if you were located where it is."
    }
   ]
  }
 },
 {
  "id": "misty-step",
  "name": {
   "de": "Nebelschritt",
   "en": "Misty Step"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 2. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 2 Conjuration (Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "beschwoerung",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du bist kurz von einem silbrigen Nebel umgeben und teleportierst dich bis zu neun Meter weit in einen freien Bereich, den du sehen kannst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see."
    }
   ]
  }
 },
 {
  "id": "modify-memory",
  "name": {
   "de": "Erinnerung verändern",
   "en": "Modify Memory"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 5. Grades (Barde, Magier)",
   "en": "Level 5 Enchantment (Bard, Wizard)"
  },
  "grad": 5,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versuchst, die Erinnerungen einer anderen Kreatur umzuformen. Eine Kreatur in Reichweite, die du sehen kannst, führt einen Weisheitsrettungswurf aus. Wenn du gegen die Kreatur kämpfst, ist sie bei ihrem Rettungswurf im Vorteil. Misslingt der Wurf, so ist das Ziel für die Wirkungsdauer bezaubert. Ein auf diese Art bezaubertes Ziel ist außerdem kampfunfähig und sich seiner Umgebung nicht bewusst, es kann dich jedoch hören. Erleidet es Schaden oder wird es von einem anderen Zauber betroffen, so endet dieser Zauber, und die Erinnerungen bleiben unverändert. Während diese Bezauberung anhält, kannst du die Erinnerungen des Ziels an ein Ereignis der letzten 24 Stunden verändern, das maximal zehn Minuten gedauert hat. Du kannst sämtliche Erinnerungen an das Ereignis dauerhaft entfernen, dem Ziel ermöglichen, sich mit absoluter Klarheit an das Ereignis zu erinnern, seine Erinnerungen an die Details des Ereignisses verändern oder eine andere Erinnerung erschaffen. Du musst mit dem Ziel sprechen und beschreiben, wie seine Erinnerungen beeinflusst werden. Das Ziel muss deine Sprache sprechen, damit die veränderten Erinnerungen Fuß fassen können. Sein Verstand füllt etwaige Lücken in den von dir beschriebenen Details. Endet der Zauber, bevor du die veränderten Erinnerungen beschrieben hast, so werden die Erinnerungen der Kreatur nicht modifiziert. Anderenfalls setzen sich die neuen Erinnerungen fest, wenn der Zauber endet. Veränderte Erinnerungen beeinflussen nicht notwendigerweise das Verhalten der Kreatur – insbesondere dann nicht, wenn sie mit den natürlichen Neigungen, der Gesinnung oder dem Glauben der Kreatur im Widerspruch stehen. Eine unlogische veränderte Erinnerung, beispielsweise daran, wie gerne die Kreatur in Säure gebadet hat, wird als Albtraum abgetan. Der SL kann eine veränderte Erinnerung als zu unsinnig erklären, um die Kreatur signifikant zu beeinflussen. Die Zauber Fluch brechen oder Vollständige Genesung stellen die wahren Erinnerungen der Kreatur wieder her."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Du kannst die Erinnerung des Ziels an ein Ereignis verändern, das in den vergangenen sieben Tagen (6. Zauberplatzgrad), in den vergangenen 30 Tagen (7. Zauberplatzgrad), den vergangenen 365 Tagen (8. Zauberplatzgrad) oder zu einem beliebigen Zeitpunkt in der Vergangenheit der Kreatur (9. Zauberplatzgrad) stattgefunden hat."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You attempt to reshape another creature’s memories. One creature that you can see within range makes a Wisdom saving throw. If you are fighting the creature, it has Advantage on the save. On a failed save, the target has the Charmed condition for the duration. While Charmed in this way, the target also has the Incapacitated condition and is unaware of its surroundings, though it can hear you. If it takes any damage or is targeted by another spell, this spell ends, and no memories are modified. While this charm lasts, you can affect the target’s memory of an event that it experienced within the last 24 hours and that lasted no more than 10 minutes. You can permanently eliminate all memory of the event, allow the target to recall the event with perfect clarity, change its memory of the event’s details, or create a memory of some other event. You must speak to the target to describe how its memories are affected, and it must be able to understand your language for the modified memories to take root. Its mind fills in any gaps in the details of your description. If the spell ends before you finish describing the modified memories, the creature’s memory isn’t altered. Otherwise, the modified memories take hold when the spell ends. A modified memory doesn’t necessarily affect how a creature behaves, particularly if the memory contradicts the creature’s natural inclinations, alignment, or beliefs. An illogical modified memory, such as a false memory of how much the creature enjoyed swimming in acid, is dismissed as a bad dream. The GM might deem a modified memory too nonsensical to affect a creature. A Remove Curse or Greater Restoration spell cast on the target restores the creature’s true memory."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can alter the target’s memories of an event that took place up to 7 days ago (level 6 spell slot), 30 days ago (level 7 spell slot), 365 days ago (level 8 spell slot), or any time in the creature’s past (level 9 spell slot)."
    }
   ]
  }
 },
 {
  "id": "moonbeam",
  "name": {
   "de": "Mondstrahl",
   "en": "Moonbeam"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Druide)",
   "en": "Level 2 Evocation (Druid)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (Blatt einer Mondsamenpflanze)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a moonseed leaf)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem zwölf Meter hohen Zylinder mit einem Radius von bis zu 1,5 Metern um einen Punkt in Reichweite scheint ein silbriger Strahl fahlen Lichts herab. Für die Wirkungsdauer ist der Zylinder von dämmrigem Licht erfüllt, und du kannst in deinen folgenden Zügen eine magische Aktion ausführen, um den Zylinder bis zu 18 Meter weit zu bewegen. Wenn der Zylinder erscheint, führt jede Kreatur darin einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet eine Kreatur 2W10 gleißenden Schaden. Wenn ihre Gestalt gewandelt ist (beispielsweise infolge des Zaubers Verwandlung), nimmt sie außerdem ihre wahre Gestalt an und kann sich erst wieder verwandeln, wenn sie den Zylinder verlässt. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur nur halb so viel Schaden. Eine Kreatur führt diesen Rettungswurf auch dann aus, wenn der Bereich des Zaubers sich in ihren Bereich bewegt, wenn die Kreatur den Bereich des Zaubers betritt oder ihren Zug darin beendet. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range. Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the Cylinder up to 60 feet. When the Cylinder appears, each creature in it makes a Constitution saving throw. On a failed save, a creature takes 2d10 Radiant damage, and if the creature is shape-shifted (as a result of the Polymorph spell, for example), it reverts to its true form and can’t shape-shift until it leaves the Cylinder. On a successful save, a creature takes half as much damage only. A creature also makes this save when the spell’s area moves into its space and when it enters the spell’s area or ends its turn there. A creature makes this save only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "move-earth",
  "name": {
   "de": "Erde bewegen",
   "en": "Move Earth"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 6. Grades (Druide, Magier, Zauberer)",
   "en": "Level 6 Transmutation (Druid, Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (eine Miniaturschaufel)",
    "dauer": "Konzentration, bis zu 2 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a miniature shovel)",
    "dauer": "Concentration, up to 2 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle einen viereckigen Bereich des Geländes in Reichweite mit einer Seitenlänge von höchstens zwölf Metern aus. Für die Wirkungsdauer kannst du Erde, Lehm oder Sand in dem Bereich beliebig umformen. Du kannst den Bereich anheben oder absenken, einen Graben erschaffen oder zuschütten, eine Mauer errichten oder niederreißen oder eine Säule errichten. Das Ausmaß dieser Änderungen darf die Hälfte der größten Abmessung des Bereichs nicht überschreiten. Beeinflusst du beispielsweise einen Bereich mit einer Seitenlänge von zwölf Metern, so kannst du eine bis zu sechs Meter hohe Säule erschaffen, den Bereich um bis zu sechs Meter anheben oder absenken, einen Graben mit bis zu sechs Metern Tiefe ausheben und so weiter. Es dauert zehn Minuten, diese Änderungen zu bewirken. Da die Veränderung des Geländes langsam erfolgt, können Kreaturen im Bereich normalerweise nicht durch die Bodenbewegung gefangen oder verletzt werden. Nach jeweils zehn Minuten Konzentration auf den Zauber kannst du einen neuen Bereich in Reichweite auswählen und beeinflussen. Dieser Zauber kann weder Naturgestein noch Steingebäude beeinflussen. Felsen und Gebäude verschieben sich, um sich dem neuen Gelände anzupassen. Wenn deine Veränderung des Geländes ein Gebäude instabil macht, so stürzt es möglicherweise ein. Dieser Zauber hat keinen direkten Einfluss auf Pflanzenwachstum. Die bewegte Erde nimmt Pflanzen mit sich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area’s elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. The extent of any such changes can’t exceed half the area’s largest dimension. For example, if you affect a 40-foot square, you can create a pillar up to 20 feet high, raise or lower the square’s elevation by up to 20 feet, dig a trench up to 20 feet deep, and so on. It takes 10 minutes for these changes to complete. Because the terrain’s transformation occurs slowly, creatures in the area can’t usually be trapped or injured by the ground’s movement. At the end of every 10 minutes you spend concentrating on the spell, you can choose a new area of terrain to affect within range. This spell can’t manipulate natural stone or stone construction. Rocks and structures shift to accommodate the new terrain. If the way you shape the terrain would make a structure unstable, it might collapse. Similarly, this spell doesn’t directly affect plant growth. The moved earth carries any plants along with it."
    }
   ]
  }
 },
 {
  "id": "nondetection",
  "name": {
   "de": "Unauffindbarkeit",
   "en": "Nondetection"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Barde, Magier, Waldläufer)",
   "en": "Level 3 Abjuration (Bard, Ranger, Wizard)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "barde",
   "magier",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Prise Diamantstaub im Wert von mindestens 25 GM, den der Zauber verbraucht)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a pinch of diamond dust worth 25+ GP, which the spell consumes)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst ein Ziel, um es für die Wirkungsdauer vor Erkenntniszaubern zu verstecken. Das Ziel kann eine bereitwillige Kreatur, ein Ort oder ein Gegenstand sein. Es darf in keiner Abmessung größer als drei Meter sein. Es kann weder durch Erkenntniszauber noch durch magische Ausspähungssensoren wahrgenommen werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you hide a target that you touch from Divination spells. The target can be a willing creature, or it can be a place or an object no larger than 10 feet in any dimension. The target can’t be targeted by any Divination spell or perceived through magical scrying sensors."
    }
   ]
  }
 },
 {
  "id": "pass-without-trace",
  "name": {
   "de": "Spurloses Gehen",
   "en": "Pass without Trace"
  },
  "gradzeile": {
   "de": "Bannzauber 2. Grades (Druide, Waldläufer)",
   "en": "Level 2 Abjuration (Druid, Ranger)"
  },
  "grad": 2,
  "schule": "bann",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (Asche eines Mistelzweigs)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (ashes from burned mistletoe)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von dir geht für die Wirkungsdauer eine verhüllende Aura in einer Ausströmung von neun Metern aus. Du und jede Kreatur deiner Wahl habt in der Aura einen Bonus von +10 auf Geschicklichkeitswürfe (Heimlichkeit), und ihr hinterlasst keine Spuren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You radiate a concealing aura in a 30-foot Emanation for the duration. While in the aura, you and each creature you choose have a +10 bonus to Dexterity (Stealth) checks and leave no tracks."
    }
   ]
  }
 },
 {
  "id": "passwall",
  "name": {
   "de": "Wände passieren",
   "en": "Passwall"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 5. Grades (Magier)",
   "en": "Level 5 Transmutation (Wizard)"
  },
  "grad": 5,
  "schule": "verwandlung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Prise Sesamkörner)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a pinch of sesame seeds)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An einem Punkt in Reichweite auf einer Oberfläche aus Holz, Gips oder Stein (beispielsweise eine Mauer, eine Decke oder ein Fußboden), den du sehen kannst, erscheint ein Durchgang, der für die Wirkungsdauer bestehen bleibt. Du bestimmst die Ausmaße des Durchgangs: höchstens 1,5 Meter breit, 2,4 Meter hoch und sechs Meter tief. Der Durchgang macht das umgebende Gebäude nicht instabil. Wenn der Durchgang verschwindet, gelangen sämtliche Kreaturen und Gegenstände, die sich noch darin befinden, in den freien Bereich, der der Oberfläche, auf die der Zauber gewirkt wurde, am nächsten liegt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A passage appears at a point that you can see on a wooden, plaster, or stone surface (such as a wall, ceiling, or floor) within range and lasts for the duration. You choose the opening’s dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it. When the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell."
    }
   ]
  }
 },
 {
  "id": "phantasmal-force",
  "name": {
   "de": "Macht der Vorstellungskraft",
   "en": "Phantasmal Force"
  },
  "gradzeile": {
   "de": "Illusionszauber 2. Grades (Barde, Magier, Zauberer)",
   "en": "Level 2 Illusion (Bard, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Stück Vlies)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a bit of fleece)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versuchst, im Verstand einer Kreatur in Reichweite, die du sehen kannst, eine Illusion zu erschaffen. Das Ziel führt einen Intelligenzrettungswurf aus. Misslingt der Wurf, so erzeugst du ein geisterhaft sichtbares Phänomen, beispielsweise einen Gegenstand oder eine Kreatur. Das Phänomen kann nicht größer sein als ein Würfel mit drei Metern Kantenlänge. Es ist nur für die Wirkungsdauer und nur für das Ziel sichtbar. Das Phänomen umfasst auch Geräusche, Temperaturen und andere Stimuli. Das Ziel kann die Studieren‑Aktion ausführen, um das Phänomen mit einem Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG zu untersuchen. Bei einem Erfolg bemerkt das Ziel, dass es sich um eine Illusion handelt, und der Zauber endet. Solange das Ziel vom Zauber betroffen ist, behandelt es das Phänomen, als wäre dieses real. Unlogische Ergebnisse der Interaktion mit dem Phänomen rationalisiert es. Beispiel: Wenn das Ziel eine geisterhafte Brücke betreten will und den Absturz überlebt, so glaubt es weiterhin, die Brücke würde existieren, und sucht sich eine andere Erklärung für den Sturz. Das betroffene Ziel kann sogar Schaden durch das Phänomen erleiden, wenn dieses eine gefährliche Kreatur oder eine anderweitige Gefahr repräsentiert. Das Phänomen kann dem Ziel in jedem deiner Züge 2W8 psychischen Schaden zufügen, sofern das Ziel sich im Bereich des Phänomens oder im Abstand von bis zu 1,5 Metern von ihm aufhält. Das Ziel erlebt den Schaden als von einer Art, die zur Illusion passt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You attempt to craft an illusion in the mind of a creature you can see within range. The target makes an Intelligence saving throw. On a failed save, you create a phantasmal object, creature, or other phenomenon that is no larger than a 10-foot Cube and that is perceivable only to the target for the duration. The phantasm includes sound, temperature, and other stimuli. The target can take a Study action to examine the phantasm with an Intelligence (Investigation) check against your spell save DC. If the check succeeds, the target realizes that the phantasm is an illusion, and the spell ends. While affected by the spell, the target treats the phantasm as if it were real and rationalizes any illogical outcomes from interacting with it. For example, if the target steps through a phantasmal bridge and survives the fall, it believes the bridge exists and something else caused it to fall. An affected target can even take damage from the illusion if the phantasm represents a dangerous creature or hazard. On each of your turns, such a phantasm can deal 2d8 Psychic damage to the target if it is in the phantasm’s area or within 5 feet of the phantasm. The target perceives the damage as a type appropriate to the illusion."
    }
   ]
  }
 },
 {
  "id": "phantasmal-killer",
  "name": {
   "de": "Tödliches Phantom",
   "en": "Phantasmal Killer"
  },
  "gradzeile": {
   "de": "Illusionszauber 4. Grades (Barde, Magier)",
   "en": "Level 4 Illusion (Bard, Wizard)"
  },
  "grad": 4,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du zapfst die Alpträume einer Kreatur in Reichweite an, die du sehen kannst, und erschaffst eine Illusion ihrer tiefsten Ängste, die nur für diese Kreatur sichtbar ist. Das Ziel führt einen Weisheitsrettungswurf aus. Misslingt der Wurf, so erleidet das Ziel 4W10 psychischen Schaden und ist für die Wirkungsdauer bei Attributs ‑ und Angriffswürfen im Nachteil. Bei einem erfolgreichen Rettungswurf erleidet das Ziel halb so viel Schaden, und der Zauber endet. Für die Wirkungsdauer kann das Ziel am Ende jedes seiner Züge einen Weisheitsrettungswurf ausführen. Misslingt der Wurf, so erleidet es den psychischen Schaden erneut. Bei einem erfolgreichen Rettungswurf endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der Schaden um 1W10 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You tap into the nightmares of a creature you can see within range and create an illusion of its deepest fears, visible only to that creature. The target makes a Wisdom saving throw. On a failed save, the target takes 4d10 Psychic damage and has Disadvantage on ability checks and attack rolls for the duration. On a successful save, the target takes half as much damage, and the spell ends. For the duration, the target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes the Psychic damage again. On a successful save, the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "phantom-steed",
  "name": {
   "de": "Geisterross",
   "en": "Phantom Steed"
  },
  "gradzeile": {
   "de": "Illusionszauber 3. Grades (Magier)",
   "en": "Level 3 Illusion (Wizard)"
  },
  "grad": 3,
  "schule": "illusion",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem freien Bereich deiner Wahl in Reichweite, den du sehen kannst, erscheint eine große, quasi reale, pferdeartige Kreatur. Du bestimmst das Erscheinungsbild der Kreatur. Sie ist stets mit einem Sattel und Zaumzeug ausgerüstet. Durch diesen Zauber erschaffene Ausrüstung löst sich in Rauch auf, wenn sie weiter als drei Meter vom Ross entfernt wird. Für die Wirkungsdauer kann eine Kreatur deiner Wahl (auch du selbst) auf dem Ross reiten. Die Kreatur verwendet den Wertekasten eines Reitpferds (siehe „Monster“), verfügt jedoch über eine Bewegungsrate von 30 Metern und kann in einer Stunde 20,8 Kilometer zurücklegen. Wenn der Zauber endet, verblasst das Ross allmählich, und der Reiter hat eine Minute zum Absteigen Zeit. Wenn das Ross Schaden erleidet, endet der Zauber vorzeitig."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Large, quasi-real, horselike creature appears on the ground in an unoccupied space of your choice within range. You decide the creature’s appearance, and it is equipped with a saddle, bit, and bridle. Any of the equipment created by the spell vanishes in a puff of smoke if it is carried more than 10 feet away from the steed. For the duration, you or a creature you choose can ride the steed. The steed uses the Riding Horse stat block (see “Monsters”), except it has a Speed of 100 feet and can travel 13 miles in an hour. When the spell ends, the steed gradually fades, giving the rider 1 minute to dismount. The spell ends early if the steed takes any damage."
    }
   ]
  }
 },
 {
  "id": "planar-ally",
  "name": {
   "de": "Verbündeter aus den Ebenen",
   "en": "Planar Ally"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 6. Grades (Kleriker)",
   "en": "Level 6 Conjuration (Cleric)"
  },
  "grad": 6,
  "schule": "beschwoerung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erflehst den Beistand eines außerweltlichen Wesens. Dieses Wesen muss dir bekannt sein – eine Gottheit, ein Dämonenprinz oder ein anderes Wesen von kosmischer Macht. Es schickt ein ihm treu ergebenes celestisches Wesen, einen Elementar oder einen Unhold, um dir zu helfen. Diese Kreatur erscheint in einem freien Bereich in Reichweite. Kennst du den Namen einer bestimmten Kreatur, so kannst du ihn aussprechen, wenn du diesen Zauber wirkst, um diese Kreatur zu erbitten. Du könntest jedoch nach Wahl des SL trotzdem eine andere Kreatur erhalten. Wenn die Kreatur erscheint, ist sie nicht gezwungen, sich auf eine bestimmte Weise zu verhalten. Du kannst sie bitten, einen Dienst gegen Bezahlung auszuführen. Sie ist dazu jedoch nicht verpflichtet. Die Aufgabe kann einfach oder komplex sein, von „Fliege uns über den Abgrund!“ oder „Hilf uns im Kampf!“ bis zu „Spioniere unsere Feinde aus!“ oder „Beschütze uns, während wir in das Gewölbe vordringen!“. Du musst mit der Kreatur kommunizieren können, damit du um ihre Dienste feilschen kannst. Die Bezahlung kann auf verschiedene Arten erfolgen. Ein celestisches Wesen verlangt möglicherweise eine beträchtliche Spende von Gold oder magischen Gegenständen an einen verbündeten Tempel, während ein Unhold ein lebendiges Opfer oder einen Schatz erwartet. Manche Kreaturen erwarten für ihre Dienste, dass du im Gegenzug eine Mission für sie erfüllst. Eine Aufgabe, die in Minuten gemessen wird, erfordert eine Bezahlung von 100 GM pro Minute. Eine Aufgabe, die in Stunden gemessen wird, kostet 1.000 GM pro Stunde. Eine Aufgabe, die in Tagen gemessen wird (höchstens zehn Tage), erfordert 10.000 GM pro Tag. Der SL kann diese Bezahlung an die Umstände anpassen, unter denen du den Zauber wirkst. Steht die Aufgabe im Einklang mit dem Ethos der Kreatur, so kann die Bezahlung halbiert werden oder sogar entfallen. Ungefährliche Aufgaben erfordern meist nur die Hälfte der genannten Bezahlung, während besonders gefährliche Aufgaben eine größere Spende benötigen. Kreaturen nehmen selten Aufgaben an, die selbstmörderisch erscheinen. Wenn die Kreatur den Auftrag abgeschlossen hat oder die vereinbarte Dauer des Dienstes endet, erstattet die Kreatur dir Bericht, sofern möglich, und kehrt dann auf ihre Heimatebene zurück. Wenn du dich mit der Kreatur nicht auf einen Preis für ihren Dienst einigen kannst, kehrt sie sofort auf ihre Heimatebene zurück."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You beseech an otherworldly entity for aid. The being must be known to you: a god, a demon prince, or some other being of cosmic power. That entity sends a Celestial, an Elemental, or a Fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature’s name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway (GM’s choice). When the creature appears, it is under no compulsion to behave a particular way. You can ask it to perform a service in exchange for payment, but it isn’t obliged to do so. The requested task could range from simple (fly us across the chasm, or help us fight a battle) to complex (spy on our enemies, or protect us during our foray into the dungeon). You must be able to communicate with the creature to bargain for its services. Payment can take a variety of forms. A Celestial might require a sizable donation of gold or magic items to an allied temple, while a Fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you. A task that can be measured in minutes requires a payment worth 100 GP per minute. A task measured in hours requires 1,000 GP per hour. And a task measured in days (up to 10 days) requires 10,000 GP per day. The GM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature’s ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal. After the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you if possible. If you are unable to agree on a price for the creature’s service, the creature immediately returns to its home plane."
    }
   ]
  }
 },
 {
  "id": "planar-binding",
  "name": {
   "de": "Bindung der Ebenen",
   "en": "Planar Binding"
  },
  "gradzeile": {
   "de": "Bannzauber 5. Grades (Barde, Druide, Hexenmeister, Kleriker, Magier)",
   "en": "Level 5 Abjuration (Bard, Cleric, Druid, Warlock, Wizard)"
  },
  "grad": 5,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Juwel im Wert von mindestens 1.000 GM, das der Zauber verbraucht)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a jewel worth 1,000+ GP, which the spell consumes)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versuchst, ein celestisches Wesen, einen Elementar, ein Feenwesen oder einen Unhold in deinen Dienst zu verpflichten. Die Kreatur muss sich für die gesamte Wirkungsdauer in Reichweite befinden. (Normalerweise wird die Kreatur zuerst in einen umgekehrten Schutzkreis beschworen, wo sie gefangen bleibt, während du den Zauber wirkst.) Nach Wirken des Zaubers muss das Ziel einen Charismarettungswurf bestehen, oder es muss dir für die Wirkungsdauer dienen. Wenn die Kreatur durch einen anderen Zauber beschworen oder erschaffen wurde, verlängert sich dessen Wirkungsdauer auf die Wirkungsdauer von Bindung der Ebenen. Eine verpflichtete Kreatur muss deine Befehle nach besten Kräften befolgen. Du kannst der Kreatur befehlen, dich auf ein Abenteuer zu begleiten, einen Ort zu bewachen oder eine Botschaft zu übermitteln. Ist sie dir jedoch feindlich gesinnt, so versucht sie, deine Worte zu verdrehen, um ihre eigenen Ziele zu verfolgen. Wenn die Kreatur deine Anweisungen vollständig ausgeführt hat, bevor der Zauber endet, kehrt sie zu dir zurück und meldet Vollzug, sofern du dich auf derselben Existenzebene befindest. Falls nicht, kehrt sie an den Ort zurück, an dem du sie verpflichtet hast, und verbleibt dort, bis der Zauber endet."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Die Wirkungsdauer wird erhöht: bei einem Zauberplatzgrad von 6 auf zehn Tage, bei einem Zauberplatzgrad von 7 auf 30 Tage, bei einem Zauberplatzgrad von 8 auf 180 Tage, bei einem Zauberplatzgrad von 9 auf 366 Tage."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You attempt to bind a Celestial, an Elemental, a Fey, or a Fiend to your service. The creature must be within range for the entire casting of the spell. (Typically, the creature is first summoned into the center of the inverted version of the Magic Circle spell to trap it while this spell is cast.) At the completion of the casting, the target must succeed on a Charisma saving throw or be bound to serve you for the duration. If the creature was summoned or created by another spell, that spell’s duration is extended to match the duration of this spell. A bound creature must follow your commands to the best of its ability. You might command the creature to accompany you on an adventure, to guard a location, or to deliver a message. If the creature is Hostile, it strives to twist your commands to achieve its own objectives. If the creature carries out your commands completely before the spell ends, it travels to you to report this fact if you are on the same plane of existence. If you are on a different plane, it returns to the place where you bound it and remains there until the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The duration increases with a spell slot of level 6 (10 days), 7 (30 days), 8 (180 days), and 9 (366 days)."
    }
   ]
  }
 },
 {
  "id": "plane-shift",
  "name": {
   "de": "Ebenenwechsel",
   "en": "Plane Shift"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 7. Grades (Druide, Hexenmeister, Kleriker, Magier, Zauberer)",
   "en": "Level 7 Conjuration (Cleric, Druid, Sorcerer, Warlock, Wizard)"
  },
  "grad": 7,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "hexenmeister",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine gegabelte Metallrute im Wert von mindestens 250 GM, die auf eine Existenzebene eingestimmt ist)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a forked, metal rod worth 250+ GP and attuned to a plane of existence)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber transportiert dich und bis zu acht bereitwillige Kreaturen, die sich in einem Kreis an den Händen halten, auf eine andere Existenzebene. Du kannst einen allgemeinen Zielort bestimmten, beispielsweise eine bestimmte Stadt auf der Elementarebene des Feuers oder einen bestimmten Palast auf der zweiten Ebene der Neun Höllen. Ihr erscheint am Ziel oder in dessen Nähe nach Ermessen des SL. Wenn du die Siegelsequenz eines Kreises der Teleportation auf einer anderen Existenzebene kennst, kann dich der Zauber zu diesem Kreis bringen. Ist der Kreis der Teleportation zu klein für alle transportieren Kreaturen, so erscheinen sie im nächsten freien Bereich neben dem Kreis."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as a specific city on the Elemental Plane of Fire or palace on the second level of the Nine Hells, and you appear in or near that destination, as determined by the GM. Alternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. If the teleportation circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle."
    }
   ]
  }
 },
 {
  "id": "plant-growth",
  "name": {
   "de": "Pflanzenwachstum",
   "en": "Plant Growth"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Barde, Druide, Waldläufer)",
   "en": "Level 3 Transmutation (Bard, Druid, Ranger)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion (Mehr Wachstum) oder 8 Stunden (Mehr Ertrag)",
    "reichweite": "45 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action (Overgrowth) or 8 hours (Enrichment)",
    "reichweite": "150 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber kanalisiert Vitalität in Pflanzen. Der Zeitaufwand, den du verwendest, bestimmt, ob der Zauber den Effekt Mehr Wachstum oder den Effekt Mehr Ertrag (beide unten beschrieben) bewirkt."
    },
    {
     "typ": "punkt",
     "text": "Mehr Wachstum: Wähle einen Punkt in Reichweite aus. Alle normalen Pflanzen in einem Radius von 30 Metern um diesen Punkt gedeihen und wuchern. Jede Kreatur in diesem Bereich muss für jeden Meter, den sie sich bewegt, vier Meter ihrer Bewegungsrate verbrauchen. Du kannst mindestens einen Bereich beliebiger Größe im Wirkungsbereich vom Effekt ausschließen."
    },
    {
     "typ": "punkt",
     "text": "Mehr Ertrag: Alle Pflanzen in einem Radius von 0,8 Kilometern um einen Punkt in Reichweite werden 365 Tage lang ertragreich. Bei der Ernte spenden sie doppelt so viel Nahrung wie gewöhnlich. Sie können nur von einem Pflanzenwachstum‑Zauber pro Jahr profitieren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell channels vitality into plants. The casting time you use determines whether the spell has the Overgrowth or the Enrichment effect below."
    },
    {
     "typ": "punkt",
     "text": "Overgrowth. Choose a point within range. All normal plants in a 100-foot-radius Sphere centered on that point become thick and overgrown. A creature moving through that area must spend 4 feet of movement for every 1 foot it moves. You can exclude one or more areas of any size within the spell’s area from being affected."
    },
    {
     "typ": "punkt",
     "text": "Enrichment. All plants in a half-mile radius centered on a point within range become enriched for 365 days. The plants yield twice the normal amount of food when harvested. They can benefit from only one Plant Growth per year."
    }
   ]
  }
 },
 {
  "id": "poison-spray",
  "name": {
   "de": "Gift versprühen",
   "en": "Poison Spray"
  },
  "gradzeile": {
   "de": "Zaubertrick der Nekromantie (Druide, Hexenmeister, Magier, Zauberer)",
   "en": "Necromancy Cantrip (Druid, Sorcerer, Warlock, Wizard)"
  },
  "grad": 0,
  "schule": "nekromantie",
  "klassen": [
   "druide",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du sprühst giftigen Nebel auf eine Kreatur in Reichweite. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 1W12 Giftschaden."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W12 erhöht, wenn du die 5. (2W12), die 11. (3W12) und die 17. (4W12) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You spray toxic mist at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d12 Poison damage."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d12 when you reach levels 5 (2d12), 11 (3d12), and 17 (4d12)."
    }
   ]
  }
 },
 {
  "id": "polymorph",
  "name": {
   "de": "Verwandlung",
   "en": "Polymorph"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 4. Grades (Barde, Druide, Magier, Zauberer)",
   "en": "Level 4 Transmutation (Bard, Druid, Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (Kokon einer Raupe)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a caterpillar cocoon)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versuchst, eine Kreatur in Reichweite, die du sehen kannst, in ein Tier zu verwandeln. Das Ziel muss einen Weisheitsrettungswurf bestehen, oder es nimmt für die Wirkungsdauer eine Tiergestalt an. Dabei kann es sich um ein beliebiges Tier deiner Wahl handeln, dessen Herausforderungsgrad nicht höher als der des Ziels ist (wenn das Ziel keinen Herausforderungsgrad hat, verwende seine Stufe). Die Spielwerte des Ziels werden vom Wertekasten des Tieres ersetzt. Das Ziel behält jedoch Gesinnung, Persönlichkeit, Kreaturentyp, Trefferpunkte sowie Trefferpunktewürfel bei. Beispiele für Wertekästen von Tieren findest du im Abschnitt „Tiere“ unter „Monster“. Das Ziel erhält eine Anzahl von temporären Trefferpunkten, die der Anzahl von Trefferpunkten der Tiergestalt entspricht. Nach der Wirkungsdauer dieses Zaubers verbleibende temporäre Trefferpunkte gehen verloren. Der Zauber endet beim Ziel vorzeitig, wenn es keine temporären Trefferpunkte übrig hat. Das Ziel kann nur Aktionen ausführen, die in seiner neuen Gestalt anatomisch möglich sind. Es kann weder sprechen noch Zauber wirken. Die Ausrüstung des Ziels verschmilzt mit seiner neuen Gestalt. Die Kreatur kann die Ausrüstung nicht verwenden oder anderweitig nutzen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You attempt to transform a creature that you can see within range into a Beast. The target must succeed on a Wisdom saving throw or shape-shift into a Beast form for the duration. That form can be any Beast you choose that has a Challenge Rating equal to or less than the target’s (or the target’s level if it doesn’t have a Challenge Rating). The target’s game statistics are replaced by the stat block of the chosen Beast, but the target retains its alignment, personality, creature type, Hit Points, and Hit Point Dice. See the “Animals” section of “Monsters” for a sample of Beast stat blocks. The target gains a number of Temporary Hit Points equal to the Hit Points of the Beast form. These Temporary Hit Points vanish if any remain when the spell ends. The spell ends early on the target if it has no Temporary Hit Points left. The target is limited in the actions it can perform by the anatomy of its new form, and it can’t speak or cast spells. The target’s gear melds into the new form. The creature can’t use or otherwise benefit from any of that equipment."
    }
   ]
  }
 },
 {
  "id": "power-word-heal",
  "name": {
   "de": "Wort der Macht: Heilung",
   "en": "Power Word Heal"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 9. Grades (Barde, Kleriker)",
   "en": "Level 9 Enchantment (Bard, Cleric)"
  },
  "grad": 9,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du sprichst ein Wort der Macht, um eine Kreatur in Reichweite, die du sehen kannst, mit einer Welle heilender Energie zu umhüllen. Das Ziel erhält sämtliche Trefferpunkte zurück. Wenn die Kreatur betäubt, bezaubert, gelähmt, verängstigt oder vergiftet ist, endet dieser Zustand. Wenn die Kreatur den Zustand Liegend hat, kann sie ihre Reaktion verwenden, um aufzustehen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A wave of healing energy washes over one creature you can see within range. The target regains all its Hit Points. If the creature has the Charmed, Frightened, Paralyzed, Poisoned, or Stunned condition, the condition ends. If the creature has the Prone condition, it can use its Reaction to stand up."
    }
   ]
  }
 },
 {
  "id": "power-word-kill",
  "name": {
   "de": "Wort der Macht: Tod",
   "en": "Power Word Kill"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 9. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 9 Enchantment (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 9,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du nötigst eine Kreatur in Reichweite, die du sehen kannst, zum Sterben. Wenn das Ziel maximal 100 Trefferpunkte hat, stirbt es. Anderenfalls erleidet es 12W12 psychischen Schaden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You compel one creature you can see within range to die. If the target has 100 Hit Points or fewer, it dies. Otherwise, it takes 12d12 Psychic damage."
    }
   ]
  }
 },
 {
  "id": "power-word-stun",
  "name": {
   "de": "Wort der Macht: Betäubung",
   "en": "Power Word Stun"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 8. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 8 Enchantment (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 8,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du überwältigst den Verstand einer Kreatur in Reichweite, die du sehen kannst. Wenn das Ziel höchstens 150 Trefferpunkte hat, wird es betäubt. Anderenfalls beträgt seine Bewegungsrate bis zum Beginn deines nächsten Zugs 0. Das betäubte Ziel führt am Ende jedes seiner Züge einen Konstitutionsrettungswurf aus. Bei einem Erfolg endet der Zustand bei ihm."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You overwhelm the mind of one creature you can see within range. If the target has 150 Hit Points or fewer, it has the Stunned condition. Otherwise, its Speed is 0 until the start of your next turn. The Stunned target makes a Constitution saving throw at the end of each of its turns, ending the condition on itself on a success."
    }
   ]
  }
 },
 {
  "id": "prayer-of-healing",
  "name": {
   "de": "Gebet der Heilung",
   "en": "Prayer of Healing"
  },
  "gradzeile": {
   "de": "Bannzauber 2. Grades (Kleriker, Paladin)",
   "en": "Level 2 Abjuration (Cleric, Paladin)"
  },
  "grad": 2,
  "schule": "bann",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "9 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "30 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Bis zu fünf Kreaturen deiner Wahl, die während des gesamten Zeitaufwands in Reichweite verbleiben, erhalten die Vorzüge einer kurzen Rast. Außerdem erhalten sie jeweils 2W8 Trefferpunkte zurück. Eine Kreatur kann erst nach einer langen Rast erneut Ziel dieses Zaubers werden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird die Heilung um 1W8 Trefferpunkte erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Up to five creatures of your choice who remain within range for the spell’s entire casting gain the benefits of a Short Rest and also regain 2d8 Hit Points. A creature can’t be affected by this spell again until that creature finishes a Long Rest."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The healing increases by 1d8 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "prestidigitation",
  "name": {
   "de": "Taschenspielerei",
   "en": "Prestidigitation"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verwandlung (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Transmutation Cantrip (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 0,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "3 Meter",
    "komponenten": "V, G",
    "dauer": "Bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "10 feet",
    "komponenten": "V, S",
    "dauer": "Up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erzeugst einen magischen Effekt in Reichweite. Wähle den Effekt aus den Optionen unten aus. Wenn du diesen Zauber mehrmals wirkst, können bis zu drei der langfristigen Effekte gleichzeitig aktiv sein."
    },
    {
     "typ": "punkt",
     "text": "Sensorischer Effekt: Du erzeugst einen unmittelbaren, harmlosen sensorischen Effekt, beispielsweise einen Funkenregen, einen Windstoß, eine leise Melodie oder einen merkwürdigen Geruch."
    },
    {
     "typ": "punkt",
     "text": "Feuerspiel: Du entzündest oder löschst unmittelbar eine Kerze, eine Fackel oder ein kleines Lagerfeuer."
    },
    {
     "typ": "punkt",
     "text": "Sauber oder schmutzig: Du kannst unmittelbar einen Gegenstand, der nicht größer als ein Würfel mit 30 Zentimetern Metern Kantenlänge ist, säubern oder verschmutzen."
    },
    {
     "typ": "punkt",
     "text": "Einfache Sinneswahrnehmung: Du kannst unbelebtes Material, das nicht größer als ein Würfel mit 30 Zentimetern Metern Kantenlänge ist, abkühlen, erhitzen oder würzen. Dies hält eine Stunde lang an."
    },
    {
     "typ": "punkt",
     "text": "Magisches Zeichen: Du lässt eine Stunde lang einen Farbfleck, ein Mal oder ein Symbol auf einem Gegenstand oder einer Oberfläche erscheinen."
    },
    {
     "typ": "punkt",
     "text": "Einfache Schöpfung: Du erzeugst ein nichtmagisches Schmuckstück oder ein illusionäres Bild, das in deine Hand passt. Es bleibt bis zum Ende deines nächsten Zugs bestehen. Diese Schöpfung kann keinen Schaden bewirken und hat keinen Geldwert."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a magical effect within range. Choose the effect from the options below. If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time."
    },
    {
     "typ": "punkt",
     "text": "Sensory Effect. You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor."
    },
    {
     "typ": "punkt",
     "text": "Fire Play. You instantaneously light or snuff out a candle, a torch, or a small campfire."
    },
    {
     "typ": "punkt",
     "text": "Clean or Soil. You instantaneously clean or soil an object no larger than 1 cubic foot."
    },
    {
     "typ": "punkt",
     "text": "Minor Sensation. You chill, warm, or flavor up to 1 cubic foot of nonliving material for 1 hour."
    },
    {
     "typ": "punkt",
     "text": "Magic Mark. You make a color, a small mark, or a symbol appear on an object or a surface for 1 hour."
    },
    {
     "typ": "punkt",
     "text": "Minor Creation. You create a nonmagical trinket or an illusory image that can fit in your hand. It lasts until the end of your next turn. A trinket can deal no damage and has no monetary worth."
    }
   ]
  }
 },
 {
  "id": "prismatic-spray",
  "name": {
   "de": "Regenbogenspiel",
   "en": "Prismatic Spray"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 7. Grades (Barde, Magier, Zauberer)",
   "en": "Level 7 Evocation (Bard, Sorcerer, Wizard)"
  },
  "grad": 7,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt in einem Kegel von 18 Metern acht Lichtstrahlen. Alle Kreaturen im Kegel führen einen Geschicklichkeitsrettungswurf aus. Würfle für jedes Ziel mit 1W8, um die Farbe des Strahls zu ermitteln, der es trifft (Effekt siehe Tabelle „Regenbogenstrahlen“)."
    },
    {
     "typ": "tabelle",
     "titel": "Regenbogenstrahlen",
     "kopf": [
      "1W8",
      "Strahl"
     ],
     "reihen": [
      [
       "1",
       "Rot: Misslungener Rettungswurf: 12W6 Feuerschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden."
      ],
      [
       "2",
       "Orange: Misslungener Rettungswurf: 12W6 Säureschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden."
      ],
      [
       "3",
       "Gelb: Misslungener Rettungswurf: 12W6 Blitzschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden."
      ],
      [
       "4",
       "Grün: Misslungener Rettungswurf: 12W6 Giftschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden."
      ],
      [
       "5",
       "Blau: Misslungener Rettungswurf: 12W6 Kälteschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden."
      ],
      [
       "6",
       "Indigoblau: Misslungener Rettungswurf: Das Ziel ist festgesetzt und führt am Ende jedes seiner Züge einen Konstitutionsrettungswurf aus. Bei drei erfolgreichen Rettungswürfen endet der Zustand. Bei drei misslungenen Rettungswürfen wird das Ziel versteinert, bis es durch einen Effekt wie den des Zaubers Vollständige Genesung befreit wird. Die Erfolge und Misserfolge müssen nicht aufeinanderfolgen. Notiere einfach beide, bis das Ziel drei von einem hat."
      ],
      [
       "7",
       "Violett: Misslungener Rettungswurf: Das Ziel ist blind und führt zu Beginn deines nächsten Zugs einen Weisheitsrettungswurf aus. Bei einem erfolgreichen Rettungswurf endet der Zustand. Misslingt der Wurf, so endet der Zustand, und die Kreatur wird auf eine andere Existenzebene (nach Wahl des SL) teleportiert."
      ],
      [
       "8",
       "Besonders: Das Ziel wird von zwei Strahlen getroffen. Würfle zweimal. Bei einem Ergebnis von 8 würfelst du erneut."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Eight rays of light flash from you in a 60-foot Cone. Each creature in the Cone makes a Dexterity saving throw. For each target, roll 1d8 to determine which color ray affects it, consulting the Prismatic Rays table."
    },
    {
     "typ": "tabelle",
     "titel": "Prismatic Rays",
     "kopf": [
      "1d8",
      "Ray"
     ],
     "reihen": [
      [
       "1",
       "Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage."
      ],
      [
       "2",
       "Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage."
      ],
      [
       "3",
       "Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage."
      ],
      [
       "4",
       "Green. Failed Save: 12d6 Poison damage. Successful Save: Half as much damage."
      ],
      [
       "5",
       "Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage."
      ],
      [
       "6",
       "Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn’t be consecutive; keep track of both until the target collects three of a kind."
      ],
      [
       "7",
       "Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (GM’s choice)."
      ],
      [
       "8",
       "Special. The target is struck by two rays. Roll twice, rerolling any 8."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "prismatic-wall",
  "name": {
   "de": "Regenbogenwand",
   "en": "Prismatic Wall"
  },
  "gradzeile": {
   "de": "Bannzauber 9. Grades (Barde, Magier)",
   "en": "Level 9 Abjuration (Bard, Wizard)"
  },
  "grad": 9,
  "schule": "bann",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Um einen Punkt in Reichweite entsteht eine undurchsichtige vertikale Wand aus bunt schimmerndem Licht. Die Wand ist bis zu 27 Meter lang, neun Meter hoch und 2,5 Zentimeter dick. Alternativ formst du eine Kugel mit einem Radius von bis zu 4,5 Metern um einen Punkt in Reichweite. Wand oder Kugel bleibt für die Wirkungsdauer bestehen. Platzierst du die Wand in einem Bereich, der von einer Kreatur besetzt ist, so endet der Zauber sofort ohne Effekt. Die Wand spendet in einem Radius von 30 Metern helles Licht und in einem Radius von weiteren 30 Metern dämmriges Licht. Du und Kreaturen, die du beim Wirken des Zaubers bestimmst, könnt die Wand durchqueren und sich in ihrer Nähe aufhalten, ohne Schaden zu erleiden. Wenn eine andere Kreatur, welche die Wand sehen kann, sich ihr auf höchstens sechs Meter nähert oder ihren Zug in diesem Bereich beginnt, muss sie einen Konstitutionsrettungswurf bestehen, oder sie ist eine Minute lang blind. Die Wand besteht aus sieben Schichten, jede in einer anderen Farbe. Wenn eine Kreatur durch die Wand greift oder geht, geschieht dies Schicht für Schicht durch alle sieben Schichten der Wand. Jede Schicht zwingt die Kreatur zu einem Geschicklichkeitsrettungswurf. Misslingt der Wurf, so ist die Kreatur von den Eigenschaften der Schicht betroffen, wie in der Tabelle „Regenbogenschichten“ beschrieben. Die Wand besitzt eine RK von 10. Sie kann auch Schicht für Schicht von Rot nach Violett auf jeweils spezifische Weise zerstört werden. Eine zerstörte Schicht bleibt für die Wirkungsdauer verschwunden. Der Zauber Antimagisches Feld hat keine Wirkung auf die Mauer, und der Zauber Magie bannen kann nur auf die violette Schicht wirken."
    },
    {
     "typ": "tabelle",
     "titel": "Regenbogenschichten",
     "kopf": [
      "Reihenfolge",
      "Effekte"
     ],
     "reihen": [
      [
       "1",
       "Rot: Misslungener Rettungswurf: 12W6 Feuerschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden. Zusätzliche Effekte: Nichtmagische Fernkampfangriffe können diese Schicht nicht durchdringen. Die Schicht wird zerstört, wenn sie mindestens 25 Kälteschaden erleidet."
      ],
      [
       "2",
       "Orange: Misslungener Rettungswurf: 12W6 Säureschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden. Zusätzliche Effekte: Magische Fernkampfangriffe können diese Schicht nicht durchdringen. Die Schicht wird durch einen starken Wind (wie solchen durch Windstoß) zerstört."
      ],
      [
       "3",
       "Gelb: Misslungener Rettungswurf: 12W6 Blitzschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden. Zusätzliche Effekte: Die Schicht wird zerstört, wenn sie mindestens 60 Energieschaden erleidet."
      ],
      [
       "4",
       "Grün: Misslungener Rettungswurf: 12W6 Giftschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden. Zusätzliche Effekte: Die Schicht wird durch den Zauber Wände passieren oder einen Zauber des mindestens gleichen Grades zerstört, der auf einer festen Oberfläche ein Portal öffnet."
      ],
      [
       "5",
       "Blau: Misslungener Rettungswurf: 12W6 Kälteschaden. Erfolgreicher Rettungswurf: Halb so viel Schaden. Zusätzliche Effekte: Die Schicht wird zerstört, wenn sie mindestens 25 Feuerschaden erleidet."
      ],
      [
       "6",
       "Indigoblau: Misslungener Rettungswurf: Das Ziel ist festgesetzt und führt am Ende jedes seiner Züge einen Konstitutionsrettungswurf aus. Bei drei erfolgreichen Rettungswürfen endet der Zustand. Bei drei misslungenen Rettungswürfen wird das Ziel versteinert, bis es durch einen Effekt wie den des Zaubers Vollständige Genesung befreit wird. Die Erfolge und Misserfolge müssen nicht aufeinanderfolgen. Notiere einfach beide, bis das Ziel drei von einem hat. Zusätzliche Effekte: Zauber können diese Schicht nicht durchdringen. Die Schicht wird von hellem Licht des Zaubers Tageslicht zerstört."
      ],
      [
       "7",
       "Violett: Misslungener Rettungswurf: Das Ziel ist blind und führt zu Beginn deines nächsten Zugs einen Weisheitsrettungswurf aus. Bei einem erfolgreichen Rettungswurf endet der Zustand. Misslingt der Wurf, so endet der Zustand, und die Kreatur wird auf eine andere Existenzebene (nach Wahl des SL) teleportiert. Zusätzliche Effekte: Diese Schicht wird durch den Zauber Magie bannen zerstört."
      ]
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A shimmering, multicolored plane of light forms a vertical opaque wall—up to 90 feet long, 30 feet high, and 1 inch thick—centered on a point within range. Alternatively, you shape the wall into a globe up to 30 feet in diameter centered on a point within range. The wall lasts for the duration. If you position the wall in a space occupied by a creature, the spell ends instantly without effect. The wall sheds Bright Light within 100 feet and Dim Light for an additional 100 feet. You and creatures you designate when you cast the spell can pass through and be near the wall without harm. If another creature that can see the wall moves within 20 feet of it or starts its turn there, the creature must succeed on a Constitution saving throw or have the Blinded condition for 1 minute. The wall consists of seven layers, each with a different color. When a creature reaches into or passes through the wall, it does so one layer at a time through all the layers. Each layer forces the creature to make a Dexterity saving throw or be affected by that layer’s properties as described in the Prismatic Layers table. The wall, which has AC 10, can be destroyed one layer at a time, in order from red to violet, by means specific to each layer. If a layer is destroyed, it is gone for the duration. Antimagic Field has no effect on the wall, and Dispel Magic can affect only the violet layer."
    },
    {
     "typ": "tabelle",
     "titel": "Prismatic Layers",
     "kopf": [
      "Order",
      "Effects"
     ],
     "reihen": [
      [
       "1",
       "Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage. Additional Effects: Nonmagical ranged attacks can’t pass through this layer, which is destroyed if it takes at least 25 Cold damage."
      ],
      [
       "2",
       "Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage. Additional Effects: Magical ranged attacks can’t pass through this layer, which is destroyed by a strong wind (such as the one created by Gust of Wind)."
      ],
      [
       "3",
       "Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage. Additional Effects: The layer is destroyed if it takes at least 60 Force damage."
      ],
      [
       "4",
       "Green. Failed Save: 12d6 Poison damage. Successful Save: Half as much damage. Additional Effects: A Passwall spell, or another spell of equal or greater level that can open a portal on a solid surface, destroys this layer."
      ],
      [
       "5",
       "Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage. Additional Effects: The layer is destroyed if it takes at least 25 Fire damage."
      ],
      [
       "6",
       "Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn’t be consecutive; keep track of both until the target collects three of a kind. Additional Effects: Spells can’t be cast through this layer, which is destroyed by Bright Light shed by the Daylight spell."
      ],
      [
       "7",
       "Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (GM’s choice). Additional Effects: This layer is destroyed by Dispel Magic."
      ]
     ]
    }
   ]
  }
 },
 {
  "id": "private-sanctum",
  "name": {
   "de": "Privates Heiligtum",
   "en": "Private Sanctum"
  },
  "gradzeile": {
   "de": "Bannzauber 4. Grades (Magier)",
   "en": "Level 4 Abjuration (Wizard)"
  },
  "grad": 4,
  "schule": "bann",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (ein dünnes Bleiblech)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a thin sheet of lead)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du sicherst einen Bereich in Reichweite auf magische Art. Dabei handelt es sich um einen Würfel mit einer Kantenlänge zwischen 1,5 und 30 Metern. Der Zauber bleibt für die Wirkungsdauer bestehen. Wenn du den Zauber wirkst, entscheidest du, welche Sicherheit er bietet. Du kannst eine beliebige der folgenden Eigenschaften auswählen: • Geräusche können die Barriere am Rand des geschützten Bereichs nicht durchdringen. • Die Barriere des geschützten Bereichs erscheint dunkel und neblig und verhindert jegliche Sicht (auch Dunkelsicht). • Sensoren von Erkenntniszaubern können weder im geschützten Bereich erscheinen noch den Rand der Barriere durchdringen. • Kreaturen in dem Bereich können nicht zum Ziel von Erkenntniszaubern werden. • Nichts kann in den bewachten Bereich hinein‑ oder aus ihm herausteleportiert werden. • Ebenenreisen werden innerhalb des geschützten Bereichs blockiert. Wenn du diesen Zauber 365 Tage lang täglich am selben Ort wirkst, wird der Effekt dauerhaft."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. kannst du die Kantenlänge des Würfels um 30 Meter vergrößern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You make an area within range magically secure. The area is a Cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration. When you cast the spell, you decide what sort of security the spell provides, choosing any of the following properties: • Sound can’t pass through the barrier at the edge of the warded area. • The barrier of the warded area appears dark and foggy, preventing vision (including Darkvision) through it. • Sensors created by Divination spells can’t appear inside the protected area or pass through the barrier at its perimeter. • Creatures in the area can’t be targeted by Divination spells. • Nothing can teleport into or out of the warded area. • Planar travel is blocked within the warded area. Casting this spell on the same spot every day for 365 days makes the spell last until dispelled."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can increase the size of the Cube by 100 feet for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "produce-flame",
  "name": {
   "de": "Flammen erzeugen",
   "en": "Produce Flame"
  },
  "gradzeile": {
   "de": "Zaubertrick der Beschwörung (Druide)",
   "en": "Conjuration Cantrip (Druid)"
  },
  "grad": 0,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "10 Minuten"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In deiner Hand erscheint für die Wirkungsdauer eine flackernde Flamme. Sie strahlt keine Wärme aus und kann nichts entzünden, spendet jedoch in einem Radius von sechs Metern helles Licht und in einem Radius von weiteren sechs Metern dämmriges Licht. Der Zauber endet vorzeitig, wenn du ihn erneut wirkst. Bis der Zauber endet, kannst du eine magische Aktion ausführen, um Feuer auf eine Kreatur oder einen Gegenstand im Abstand von bis zu 18 Metern von dir zu schleudern. Führe einen Fernkampf‑Zauberangriff aus. Bei einem Treffer erleidet das Ziel 1W8 Feuerschaden."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W8 erhöht, wenn du die 5. (2W8), die 11. (3W8) und die 17. (4W8) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A flickering flame appears in your hand and remains there for the duration. While there, the flame emits no heat and ignites nothing, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The spell ends if you cast it again. Until the spell ends, you can take a Magic action to hurl fire at a creature or an object within 60 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 Fire damage."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
    }
   ]
  }
 },
 {
  "id": "programmed-illusion",
  "name": {
   "de": "Vorbestimmtes Trugbild",
   "en": "Programmed Illusion"
  },
  "gradzeile": {
   "de": "Illusionszauber 6. Grades (Barde, Magier)",
   "en": "Level 6 Illusion (Bard, Wizard)"
  },
  "grad": 6,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (Jadestaub im Wert von mindestens 25 GM)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (jade dust worth 25+ GP)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst die Illusion eines Gegenstands, einer Kreatur oder eines anderen sichtbaren Phänomens in Reichweite, die von einem bestimmten Auslöser aktiviert wird. Bis dahin ist die Illusion nicht wahrnehmbar. Sie darf nicht größer als ein Würfel mit neun Metern Kantenlänge sein. Beim Wirken des Zaubers bestimmst du, wie sich die Illusion verhält und welche Geräusche sie macht. Diese vorbestimmte Darbietung kann bis zu fünf Minuten andauern. Tritt der festgelegte Auslöser auf, so entsteht die Illusion und verhält sich auf die von dir beschriebene Weise. Sobald die Illusion ihre Darbietung beendet hat, verschwindet sie und ist zehn Minuten lang inaktiv. Danach kann sie erneut aktiviert werden. Der Auslöser kann beliebig allgemein oder detailliert sein. Er muss jedoch auf sichtbaren und hörbaren Phänomenen basieren, die im Abstand von bis zu neun Metern um den Bereich auftreten. Beispielsweise könntest du eine Illusion deiner selbst erschaffen, die andere davor warnt, eine Tür mit einer Falle zu öffnen. Physische Interaktionen mit dem Abbild enttarnen es als illusionär, da Dinge es einfach durchdringen können. Eine Kreatur, die das Abbild mit der Studieren‑Aktion untersucht, kann mit einem erfolgreichen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG erkennen, dass es sich um eine Illusion handelt. Erkennt eine Kreatur die Illusion als solche, so wird das Abbild für sie durchscheinend, und sämtliche Geräusche klingen für sie hohl."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific trigger occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot Cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes. When the trigger you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes, after which the illusion can be activated again. The trigger can be as general or as detailed as you like, though it must be based on visual or audible phenomena that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door. Physical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
    }
   ]
  }
 },
 {
  "id": "project-image",
  "name": {
   "de": "Trugbild projizieren",
   "en": "Project Image"
  },
  "gradzeile": {
   "de": "Illusionszauber 7. Grades (Barde, Magier)",
   "en": "Level 7 Illusion (Bard, Wizard)"
  },
  "grad": 7,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "800 km",
    "komponenten": "V, G, M (eine Statuette von dir im Wert von mindestens 5 GM)",
    "dauer": "Konzentration, bis zu 1 Tag"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "500 miles",
    "komponenten": "V, S, M (a statuette of yourself worth 5+ GP)",
    "dauer": "Concentration, up to 1 day"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst ein illusionäres Abbild von dir selbst, das für die Wirkungsdauer bestehen bleibt. Das Abbild kann unabhängig von Hindernissen an einem beliebigen Ort in Reichweite erscheinen, den du schon einmal gesehen hast. Die Illusion sieht aus und klingt wie du, ist aber immateriell. Erleidet die Illusion Schaden, so verschwindet sie, und der Zauber endet. Du kannst durch ihre Augen sehen und durch ihre Ohren hören, als befändest du dich in ihrem Bereich. Als magische Aktion kannst du die Illusion bis zu 18 Meter weit bewegen und sie gestikulieren, sprechen und auf eine beliebige Art handeln lassen. Sie ahmt dein Verhalten perfekt nach. Physische Interaktionen mit dem Abbild enttarnen es als illusionär, da Dinge es einfach durchdringen können. Eine Kreatur, die das Abbild mit der Studieren‑Aktion untersucht, kann mit einem erfolgreichen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG erkennen, dass es sich um eine Illusion handelt. Erkennt eine Kreatur die Illusion als solche, so wird das Abbild für sie durchscheinend, und sämtliche Geräusche klingen für sie hohl."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you, but it is intangible. If the illusion takes any damage, it disappears, and the spell ends. You can see through the illusion’s eyes and hear through its ears as if you were in its space. As a Magic action, you can move it up to 60 feet and make it gesture, speak, and behave in whatever way you choose. It mimics your mannerisms perfectly. Physical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
    }
   ]
  }
 },
 {
  "id": "protection-from-energy",
  "name": {
   "de": "Schutz vor Energie",
   "en": "Protection from Energy"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Druide, Kleriker, Magier, Waldläufer, Zauberer)",
   "en": "Level 3 Abjuration (Cleric, Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "druide",
   "kleriker",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer ist eine bereitwillige Kreatur, die du berührst, gegen eine Schadensart deiner Wahl resistent: Blitz, Feuer, Kälte, Säure oder Schall."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, the willing creature you touch has Resistance to one damage type of your choice: Acid, Cold, Fire, Lightning, or Thunder."
    }
   ]
  }
 },
 {
  "id": "protection-from-evil-and-good",
  "name": {
   "de": "Schutz vor Gut und Böse",
   "en": "Protection from Evil and Good"
  },
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Druide, Hexenmeister, Kleriker, Magier, Paladin)",
   "en": "Level 1 Abjuration (Cleric, Druid, Paladin, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "druide",
   "hexenmeister",
   "kleriker",
   "magier",
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Flasche Weihwasser im Wert von mindestens 25 GM, die der Zauber verbraucht)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a flask of Holy Water worth 25+ GP, which the spell consumes)",
    "dauer": "Concentration up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer ist eine bereitwillige Kreatur, die du berührst, vor bestimmten Kreaturentypen geschützt: vor Aberrationen, celestischen Wesen, Elementaren, Feenwesen, Unholden und Untoten. Der Schutz gewährt mehrere Vorzüge: Angriffswürfe von Kreaturen dieses Typs sind gegen das Ziel im Nachteil. Außerdem kann das Ziel nicht von Kreaturen dieses Typs besessen, bezaubert oder verängstigt werden. Wenn das Ziel bereits von einer solchen Kreatur besessen, bezaubert oder verängstigt ist, so ist es bei jedem neuen Rettungswurf gegen den entsprechenden Effekt im Vorteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, one willing creature you touch is protected against creatures that are Aberrations, Celestials, Elementals, Fey, Fiends, or Undead. The protection grants several benefits. Creatures of those types have Disadvantage on attack rolls against the target. The target also can’t be possessed by or gain the Charmed or Frightened conditions from them. If the target is already possessed, Charmed, or Frightened by such a creature, the target has Advantage on any new saving throw against the relevant effect."
    }
   ]
  }
 },
 {
  "id": "protection-from-poison",
  "name": {
   "de": "Schutz vor Gift",
   "en": "Protection from Poison"
  },
  "gradzeile": {
   "de": "Bannzauber 2. Grades (Druide, Kleriker, Paladin, Waldläufer)",
   "en": "Level 2 Abjuration (Cleric, Druid, Paladin, Ranger)"
  },
  "grad": 2,
  "schule": "bann",
  "klassen": [
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur und beendest bei ihr den Zustand Vergiftet. Für die Wirkungsdauer ist das Ziel bei Rettungswürfen zum Vermeiden oder Beenden des Zustands Vergiftet im Vorteil und gegen Giftschaden resistent."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature and end the Poisoned condition on it. For the duration, the target has Advantage on saving throws to avoid or end the Poisoned condition, and it has Resistance to Poison damage."
    }
   ]
  }
 },
 {
  "id": "purify-food-and-drink",
  "name": {
   "de": "Nahrung und Wasser reinigen",
   "en": "Purify Food and Drink"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 1. Grades (Druide, Kleriker, Paladin)",
   "en": "Level 1 Transmutation (Cleric, Druid, Paladin)"
  },
  "grad": 1,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "3 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "10 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du entfernst Gifte und Verderbnis aus nichtmagischen Speisen und Getränken in einer Kugel mit einem Radius von 1,5 Metern um einen Punkt deiner Wahl in Reichweite."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You remove poison and rot from nonmagical food and drink in a 5-foot-radius Sphere centered on a point within range."
    }
   ]
  }
 },
 {
  "id": "raise-dead",
  "name": {
   "de": "Tote erwecken",
   "en": "Raise Dead"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 5. Grades (Barde, Kleriker, Paladin)",
   "en": "Level 5 Necromancy (Bard, Cleric, Paladin)"
  },
  "grad": 5,
  "schule": "nekromantie",
  "klassen": [
   "barde",
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Diamant im Wert von mindestens 500 GM, den der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a diamond worth 500+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erweckst eine tote Kreatur durch eine Berührung wieder zum Leben, sofern sie höchstens zehn Tage lang tot und nicht untot war, als sie starb. Sie wird mit 1 Trefferpunkt wieder lebendig. Dieser Zauber neutralisiert zudem sämtliche Gifte, die zum Zeitpunkt des Todes auf das Ziel gewirkt haben. Der Zauber schließt alle tödlichen Wunden, kann jedoch keine abgetrennten Gliedmaßen wiederherstellen. Fehlen der Kreatur lebensnotwendige Körperteile oder Organe, beispielsweise ihr Kopf, so misslingt der Zauber automatisch. Von den Toten aufzuerstehen ist eine Tortur. Das Ziel erleidet einen Malus von −4 auf W20-Prüfungen. Nach jeder langen Rast wird der Malus um 1 verringert, bis er 0 beträgt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "With a touch, you revive a dead creature if it has been dead no longer than 10 days and it wasn’t Undead when it died. The creature returns to life with 1 Hit Point. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds, but it doesn’t restore missing body parts. If the creature is lacking body parts or organs integral for its survival— its head, for instance—the spell automatically fails. Coming back from the dead is an ordeal. The target takes a −4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0."
    }
   ]
  }
 },
 {
  "id": "ray-of-enfeeblement",
  "name": {
   "de": "Schwächestrahl",
   "en": "Ray of Enfeeblement"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 2. Grades (Hexenmeister, Magier)",
   "en": "Level 2 Necromancy (Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "nekromantie",
  "klassen": [
   "hexenmeister",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt einen Strahl aus entkräftender Energie auf eine Kreatur in Reichweite. Das Ziel muss einen Konstitutionsrettungswurf ausführen. Bei einem erfolgreichen Rettungswurf ist das Ziel bei seinem nächsten Angriffswurf bis zum Beginn deines nächsten Zugs im Nachteil. Misslingt der Wurf, so ist das Ziel für die Wirkungsdauer bei W20‑Prüfungen, die auf Stärke basieren, im Nachteil. Während dieser Dauer zieht es außerdem 1W8 von all seinen Schadenswürfen ab. Das Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A beam of enervating energy shoots from you toward a creature within range. The target must make a Constitution saving throw. On a successful save, the target has Disadvantage on the next attack roll it makes until the start of your next turn. On a failed save, the target has Disadvantage on Strength-based D20 Tests for the duration. During that time, it also subtracts 1d8 from all its damage rolls. The target repeats the save at the end of each of its turns, ending the spell on a success."
    }
   ]
  }
 },
 {
  "id": "ray-of-frost",
  "name": {
   "de": "Kältestrahl",
   "en": "Ray of Frost"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Magier, Zauberer)",
   "en": "Evocation Cantrip (Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein eisiger Strahl blau‑weißen Lichts schießt auf eine Kreatur in Reichweite zu. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet es 1W8 Kälteschaden, und seine Bewegungsrate ist bis zum Beginn deines nächsten Zugs um drei Meter verringert."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W8 erhöht, wenn du die 5. (2W8), die 11. (3W8) und die 17. (4W8) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 Cold damage, and its Speed is reduced by 10 feet until the start of your next turn."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
    }
   ]
  }
 },
 {
  "id": "ray-of-sickness",
  "name": {
   "de": "Strahl der Übelkeit",
   "en": "Ray of Sickness"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Necromancy (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "nekromantie",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt einen grünlichen Strahl auf eine Kreatur in Reichweite. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 2W8 Giftschaden und ist bis zum Ende deines nächsten Zugs vergiftet."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You shoot a greenish ray at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 Poison damage and has the Poisoned condition until the end of your next turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "regenerate",
  "name": {
   "de": "Regeneration",
   "en": "Regenerate"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 7. Grades (Barde, Druide, Kleriker)",
   "en": "Level 7 Transmutation (Bard, Cleric, Druid)"
  },
  "grad": 7,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Gebetsmühle)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a prayer wheel)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kreatur, die du berührst, erhält 4W8+15 Trefferpunkte zurück. Für die Wirkungsdauer erhält das Ziel zu Beginn jedes seiner Züge 1 Trefferpunkt zurück, und fehlende Gliedmaßen wachsen nach zwei Minuten nach."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A creature you touch regains 4d8 + 15 Hit Points. For the duration, the target regains 1 Hit Point at the start of each of its turns, and any severed body parts regrow after 2 minutes."
    }
   ]
  }
 },
 {
  "id": "reincarnate",
  "name": {
   "de": "Wiedergeburt",
   "en": "Reincarnate"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 5. Grades (Druide)",
   "en": "Level 5 Necromancy (Druid)"
  },
  "grad": 5,
  "schule": "nekromantie",
  "klassen": [
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (seltene Öle im Wert von mindestens 1.000 GM, die der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "Touch",
    "komponenten": "V, S, M (rare oils worth 1,000+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst einen toten Humanoiden oder seine Überreste. Sofern die Kreatur höchstens zehn Tage lang tot war, erschafft der Zauber einen neuen Körper für sie und ruft die Seele in diesen Körper. Würfle mit 1W10 und ermittle die Spezies des Körpers anhand der Tabelle unten, oder der SL wählt eine andere spielbare Spezies aus."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1W10",
      "Spezies"
     ],
     "reihen": [
      [
       "1",
       "Drachenblütiger"
      ],
      [
       "2",
       "Elf"
      ],
      [
       "3",
       "Erneut würfeln"
      ],
      [
       "4",
       "Gnom"
      ],
      [
       "5",
       "Goliath"
      ],
      [
       "6",
       "Halblingisch"
      ],
      [
       "7",
       "Mensch"
      ],
      [
       "8",
       "Orkisch"
      ],
      [
       "9",
       "Tiefling"
      ],
      [
       "10",
       "Zwerg"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "Die reinkarnierte Kreatur trifft alle Entscheidungen, welche die Beschreibung ihrer Spezies bietet, und erinnert sich an ihr voriges Leben. Sie behält die Fähigkeiten bei, die sie in der ursprünglichen Gestalt hatte, verliert jedoch die Merkmale der bisherigen Spezies und erhält die Merkmale der neuen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a dead Humanoid or a piece of one. If the creature has been dead no longer than 10 days, the spell forms a new body for it and calls the soul to enter that body. Roll 1d10 and consult the table below to determine the body’s species, or the GM chooses another playable species."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "1d10",
      "Species"
     ],
     "reihen": [
      [
       "1",
       "Roll again."
      ],
      [
       "2",
       "Dragonborn"
      ],
      [
       "3",
       "Dwarf"
      ],
      [
       "4",
       "Elf"
      ],
      [
       "5",
       "Gnome"
      ],
      [
       "6",
       "Goliath"
      ],
      [
       "7",
       "Halfling"
      ],
      [
       "8",
       "Human"
      ],
      [
       "9",
       "Orc"
      ],
      [
       "10",
       "Tiefling"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "The reincarnated creature makes any choices that a species’ description offers, and the creature recalls its former life. It retains the capabilities it had in its original form, except it loses the traits of its previous species and gains the traits of its new one."
    }
   ]
  }
 },
 {
  "id": "remove-curse",
  "name": {
   "de": "Fluch brechen",
   "en": "Remove Curse"
  },
  "gradzeile": {
   "de": "Bannzauber 3. Grades (Hexenmeister, Kleriker, Magier, Paladin)",
   "en": "Level 3 Abjuration (Cleric, Paladin, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "bann",
  "klassen": [
   "hexenmeister",
   "kleriker",
   "magier",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Auf deine Berührung hin enden alle Flüche, die auf eine Kreatur oder einen Gegenstand wirken. Ist ein verfluchter Gegenstand magisch, so bleibt der Fluch zwar bestehen, aber der Zauber bricht die Einstimmung des Besitzers, sodass der Gegenstand entfernt oder weggeworfen werden kann."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner’s Attunement to the object so it can be removed or discarded."
    }
   ]
  }
 },
 {
  "id": "resilient-sphere",
  "name": {
   "de": "Unverwüstliche Sphäre",
   "en": "Resilient Sphere"
  },
  "gradzeile": {
   "de": "Bannzauber 4. Grades (Magier)",
   "en": "Level 4 Abjuration (Wizard)"
  },
  "grad": 4,
  "schule": "bann",
  "klassen": [
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Glaskugel)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a glass sphere)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine schimmernde Kugel umschließt eine Kreatur oder einen Gegenstand von jeweils höchstens großer Größe in Reichweite. Eine nicht bereitwillige Kreatur muss einen Geschicklichkeitsrettungswurf bestehen, oder sie wird für die Wirkungsdauer eingeschlossen. Physische Gegenstände, Energien und Zaubereffekte können die Barriere weder von außen noch von innen durchdringen. Eine Kreatur in der Kugel kann jedoch atmen. Die Kugel ist gegen alle Schadensarten immun, und eine Kreatur oder ein Gegenstand darin kann weder durch Angriffe noch Effekte von außerhalb Schaden erleiden. Gleichermaßen kann eine Kreatur in der Kugel keinen Schaden außerhalb der Kugel bewirken. Die Kugel ist schwerelos und gerade groß genug für die Kreatur oder den Gegenstand darin. Eine gefangene Kreatur kann sich als Aktion gegen die Wand der Kugel lehnen und die Kugel so bis zur halben Bewegungsrate der Kreatur bewegen. Ebenso kann die Kugel von anderen Kreaturen aufgehoben und bewegt werden. Wird der Zauber Auflösung auf die Kugel gewirkt, so wird die Kugel zerstört, ohne dass etwas im Inneren Schaden erleidet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A shimmering sphere encloses a Large or smaller creature or object within range. An unwilling creature must succeed on a Dexterity saving throw or be enclosed for the duration. Nothing—not physical objects, energy, or other spell effects—can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can’t be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it. The sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can take an action to push against the sphere’s walls and thus roll the sphere at up to half the creature’s Speed. Similarly, the globe can be picked up and moved by other creatures. A Disintegrate spell targeting the globe destroys it without harming anything inside."
    }
   ]
  }
 },
 {
  "id": "resistance",
  "name": {
   "de": "Widerstand",
   "en": "Resistance"
  },
  "gradzeile": {
   "de": "Zaubertrick des Banns (Druide, Kleriker)",
   "en": "Abjuration Cantrip (Cleric, Druid)"
  },
  "grad": 0,
  "schule": "bann",
  "klassen": [
   "druide",
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur und wählst eine Schadensart aus: Blitz, Feuer, Gift, Gleißend, Hieb, Kälte, Nekrotisch, Säure, Schall, Stich oder Wucht. Wenn die Kreatur während der Wirkungsdauer Schaden des ausgewählten Typs erleidet, verringert sie den erlittenen Gesamtschaden um 1W4. Eine Kreatur kann von diesem Zauber nur einmal pro Zug profitieren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a willing creature and choose a damage type: Acid, Bludgeoning, Cold, Fire, Lightning, Necrotic, Piercing, Poison, Radiant, Slashing, or Thunder. When the creature takes damage of the chosen type before the spell ends, the creature reduces the total damage taken by 1d4. A creature can benefit from this spell only once per turn."
    }
   ]
  }
 },
 {
  "id": "resurrection",
  "name": {
   "de": "Auferstehung",
   "en": "Resurrection"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 7. Grades (Barde, Kleriker)",
   "en": "Level 7 Necromancy (Bard, Cleric)"
  },
  "grad": 7,
  "schule": "nekromantie",
  "klassen": [
   "barde",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Diamant im Wert von mindestens 1.000 GM, den der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a diamond worth 1,000+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erweckst mit einer Berührung eine tote Kreatur zum Leben, die nicht länger als ein Jahrhundert tot war, nicht an Altersschwäche gestorben ist und nicht untot war, als sie starb. Die Kreatur kehrt mit all ihren Trefferpunkten ins Leben zurück. Dieser Zauber neutralisiert zudem sämtliche Gifte, die zum Zeitpunkt des Todes auf das Ziel gewirkt haben. Dieser Zauber schließt alle tödlichen Wunden und stellt sämtliche abgetrennten Gliedmaßen wieder her. Von den Toten aufzuerstehen ist eine Tortur. Das Ziel erleidet einen Malus von −4 auf W20-Prüfungen. Nach jeder langen Rast wird der Malus um 1 verringert, bis er 0 beträgt. Wirkst du diesen Zauber, um eine Kreatur zum Leben zu erwecken, die seit mindestens 365 Tagen tot ist, so belastet dich das stark. Du kannst erst nach einer langen Rast wieder Zauber wirken und bist bis dahin bei W20‑Prüfungen im Nachteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "With a touch, you revive a dead creature that has been dead for no more than a century, didn’t die of old age, and wasn’t Undead when it died. The creature returns to life with all its Hit Points. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds and restores any missing body parts. Coming back from the dead is an ordeal. The target takes a −4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0. Casting this spell to revive a creature that has been dead for 365 days or longer taxes you. Until you finish a Long Rest, you can’t cast spells again, and you have Disadvantage on D20 Tests."
    }
   ]
  }
 },
 {
  "id": "reverse-gravity",
  "name": {
   "de": "Schwerkraft umkehren",
   "en": "Reverse Gravity"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 7. Grades (Druide, Magier, Zauberer)",
   "en": "Level 7 Transmutation (Druid, Sorcerer, Wizard)"
  },
  "grad": 7,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "30 Meter",
    "komponenten": "V, G, M (ein Magnetstein und Eisenspäne)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "100 feet",
    "komponenten": "V, S, M (a lodestone and iron filings)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber kehrt in einem 30 Meter hohen Zylinder mit einem Radius von 15 Metern um einen Punkt in Reichweite die Schwerkraft um. Alle Kreaturen und Gegenstände im Bereich, die nicht mit dem Boden verbunden sind, stürzen nach oben bis zur Oberseite des Zylinders. Eine Kreatur kann einen Geschicklichkeitsrettungswurf ausführen, um sich an einem verankerten Gegenstand in Reichweite festzuhalten und den Sturz nach oben zu vermeiden. Wenn eine Decke oder ein fixer Gegenstand bei dem umgekehrten Sturz im Weg ist, kollidieren fallende Gegenstände und Kreaturen mit ihm wie bei einem normalen Sturz. Erreicht eine betroffene Kreatur oder ein Gegenstand die Oberseite des Zylinders, ohne mit etwas zu kollidieren, so verbleibt das Ziel für die Wirkungsdauer schwebend dort. Wenn der Zauber endet, fallen betroffene Gegenstände und Kreaturen nach unten."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell reverses gravity in a 50-foot-radius, 100foot high Cylinder centered on a point within range. All creatures and objects in that area that aren’t anchored to the ground fall upward and reach the top of the Cylinder. A creature can make a Dexterity saving throw to grab a fixed object it can reach, thus avoiding the fall upward. If a ceiling or an anchored object is encountered in this upward fall, creatures and objects strike it just as they would during a downward fall. If an affected creature or object reaches the Cylinder’s top without striking anything, it hovers there for the duration. When the spell ends, affected objects and creatures fall downward."
    }
   ]
  }
 },
 {
  "id": "revivify",
  "name": {
   "de": "Wiederbeleben",
   "en": "Revivify"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 3. Grades (Druide, Kleriker, Paladin, Waldläufer)",
   "en": "Level 3 Necromancy (Cleric, Druid, Paladin, Ranger)"
  },
  "grad": 3,
  "schule": "nekromantie",
  "klassen": [
   "druide",
   "kleriker",
   "paladin",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Diamant im Wert von mindestens 300 GM, den der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a diamond worth 300+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine Kreatur, die innerhalb der letzten Minute gestorben ist. Diese Kreatur wird mit 1 Trefferpunkt wiederbelebt. Dieser Zauber kann keine Kreaturen wiederbeleben, die an Altersschwäche gestorben sind, und stellt auch keine fehlenden Körperteile wieder her."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature that has died within the last minute. That creature revives with 1 Hit Point. This spell can’t revive a creature that has died of old age, nor does it restore any missing body parts."
    }
   ]
  }
 },
 {
  "id": "rope-trick",
  "name": {
   "de": "Seiltrick",
   "en": "Rope Trick"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Magier)",
   "en": "Level 2 Transmutation (Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Stück Seil)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a segment of rope)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst ein Seil. Ein Seilende erhebt sich in die Luft, bis das gesamte Seil senkrecht zum Boden in der Luft hängt oder das Seilende eine Decke erreicht. Am oberen Ende des Seils öffnet sich ein unsichtbares Portal zu einem extradimensionalen Raum. Das Portal ist einen Meter mal 1,5 Meter groß und bleibt für die Wirkungsdauer bestehen. Der Raum kann über das Seil erreicht werden, das in den Raum hineingezogen werden oder heraushängen kann. Der Raum fasst bis zu acht Kreaturen von höchstens mittelgroßer Größe. Angriffe, Zauber und andere Effekte können den extradimensionalen Raum weder von innen noch von außen durchdringen. Kreaturen im Raum können jedoch durch das Portal nach draußen blicken. Alles, was im Raum enthalten ist, fällt heraus, wenn der Zauber endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a rope. One end of it hovers upward until the rope hangs perpendicular to the ground or the rope reaches a ceiling. At the rope’s upper end, an Invisible 3-foot-by-5-foot portal opens to an extradimensional space that lasts until the spell ends. That space can be reached by climbing the rope, which can be pulled into or dropped out of it. The space can hold up to eight Medium or smaller creatures. Attacks, spells, and other effects can’t pass into or out of the space, but creatures inside it can see through the portal. Anything inside the space drops out when the spell ends."
    }
   ]
  }
 },
 {
  "id": "sacred-flame",
  "name": {
   "de": "Heilige Flamme",
   "en": "Sacred Flame"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Kleriker)",
   "en": "Evocation Cantrip (Cleric)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Auf eine Kreatur in Reichweite, die du sehen kannst, schießt ein Strahl aus gleißenden Flammen herab. Das Ziel muss einen Geschicklichkeitsrettungswurf bestehen, oder es erleidet 1W8 gleißenden Schaden. Teildeckung sowie Dreivierteldeckung bieten ihm bei diesem Rettungswurf keine Vorzüge."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W8 erhöht, wenn du die 5. (2W8), die 11. (3W8) und die 17. (4W8) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 Radiant damage. The target gains no benefit from Half Cover or Three-Quarters Cover for this save."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
    }
   ]
  }
 },
 {
  "id": "sanctuary",
  "name": {
   "de": "Heiligtum",
   "en": "Sanctuary"
  },
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Kleriker)",
   "en": "Level 1 Abjuration (Cleric)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Spiegelscherbe)",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a shard of glass from a mirror)",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schützt eine Kreatur in Reichweite. Für die Wirkungsdauer muss jede Kreatur, die mit einem Angriffswurf oder Schadenszauber auf die geschützte Kreatur zielt, einen Weisheits rettungs wurf bestehen. Misslingt der Wurf, so muss sie ein neues Ziel auswählen, oder sie verliert den Angriff oder Zauber. Dieser Zauber schützt das Ziel nicht vor Wirkungsbereichen. Der Zauber endet, wenn die geschützte Kreatur einen Angriffswurf ausführt, einen Zauber wirkt oder Schaden bewirkt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You ward a creature within range. Until the spell ends, any creature who targets the warded creature with an attack roll or a damaging spell must succeed on a Wisdom saving throw or either choose a new target or lose the attack or spell. This spell doesn’t protect the warded creature from areas of effect. The spell ends if the warded creature makes an attack roll, casts a spell, or deals damage."
    }
   ]
  }
 },
 {
  "id": "scorching-ray",
  "name": {
   "de": "Sengender Strahl",
   "en": "Scorching Ray"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Magier, Zauberer)",
   "en": "Level 2 Evocation (Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst drei feurige Strahlen. Du kannst sie auf ein Ziel oder auf mehrere Ziele in Reichweite schleudern. Führe für jeden Strahl einen Fernkampf‑Zauberangriff aus. Bei einem Treffer erleidet das Ziel 2W6 Feuerschaden pro Strahl."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. kannst du einen zusätzlichen Strahl erzeugen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You hurl three fiery rays. You can hurl them at one target within range or at several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 Fire damage."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You create one additional ray for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "scrying",
  "name": {
   "de": "Ausspähung",
   "en": "Scrying"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 5. Grades (Barde, Druide, Hexenmeister, Kleriker, Magier)",
   "en": "Level 5 Divination (Bard, Cleric, Druid, Warlock, Wizard)"
  },
  "grad": 5,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "kleriker",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "10 Minuten",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Fokus im Wert von mindestens 1.000 GM, beispielsweise eine Kristallkugel, ein Spiegel oder ein mit Wasser gefülltes Becken)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "10 minutes",
    "reichweite": "Self",
    "komponenten": "V, S, M (a focus worth 1,000+ GP, such as a crystal ball, mirror, or water-filled font)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du kannst eine Kreatur deiner Wahl, die sich auf derselben Existenzebene wie du befindet, hören und sehen. Das Ziel führt einen Weisheitsrettungswurf aus, der dadurch modifiziert wird, wie gut du das Ziel kennst und ob du einen Gegenstand hast, der dich mit ihm verbindet (siehe Tabellen unten). Das Ziel weiß nicht, wogegen es den Rettungswurf ausführt. Es fühlt sich nur vage unwohl."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Dein Wissen über das Ziel ist ...",
      "Rettungswurf-Modifikator"
     ],
     "reihen": [
      [
       "... aus zweiter Hand (du hast von dem Ziel gehört)",
       "+5"
      ],
      [
       "... aus erster Hand (du bist dem Ziel begegnet)",
       "+0"
      ],
      [
       "... umfassend (du kennst das Ziel gut)",
       "−5"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Du hast etwas vom Ziel, und zwar ...",
      "Rettungswurf-Modifikator"
     ],
     "reihen": [
      [
       "... ein Abbild oder Porträt",
       "−2"
      ],
      [
       "... ein Kleidungsstück oder anderen Besitz",
       "−4"
      ],
      [
       "... ein Körperteil, eine Haarlocke oder ein Nagelstück",
       "−10"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "Bei einem erfolgreichen Rettungswurf ist das Ziel nicht betroffen, und du kannst diesen Zauber erst nach 24 Stunden erneut auf das Ziel wirken. Misslingt der Wurf, so erschafft der Zauber einen unsichtbaren, immateriellen Sensor im Abstand von bis zu drei Metern vom Ziel. Du kannst durch den Sensor hören und sehen, als ob du dich in seinem Bereich befändest. Der Sensor bewegt sich mit dem Ziel und bleibt für die Wirkungsdauer im Abstand von bis zu drei Metern von ihm. Wer den Sensor sehen kann, sieht ihn als leuchtende, etwa faustgroße Kugel. Anstelle einer Kreatur kannst du auf einen Ort zielen, den du schon einmal gesehen hast. In diesem Fall erscheint der Sensor an diesem Ort und bewegt sich nicht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You can see and hear a creature you choose that is on the same plane of existence as you. The target makes a Wisdom saving throw, which is modified (see the tables below) by how well you know the target and the sort of physical connection you have to it. The target doesn’t know what it is making the save against, only that it feels uneasy."
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "Your Knowledge of the Target Is … Save",
      "Modifier"
     ],
     "reihen": [
      [
       "Secondhand (heard of the target)",
       "+5"
      ],
      [
       "Firsthand (met the target)",
       "+0"
      ],
      [
       "Extensive (know the target well)",
       "−5"
      ]
     ]
    },
    {
     "typ": "tabelle",
     "titel": "",
     "kopf": [
      "You Have the Target’s … Save",
      "Modifier"
     ],
     "reihen": [
      [
       "Picture or other likeness",
       "−2"
      ],
      [
       "Garment or other possession",
       "−4"
      ],
      [
       "Body part, lock of hair, or bit of nail",
       "−10"
      ]
     ]
    },
    {
     "typ": "absatz",
     "text": "On a successful save, the target isn’t affected, and you can’t use this spell on it again for 24 hours. On a failed save, the spell creates an Invisible, intangible sensor within 10 feet of the target. You can see and hear through the sensor as if you were there. The sensor moves with the target, remaining within 10 feet of it for the duration. If something can see the sensor, it appears as a luminous orb about the size of your fist. Instead of targeting a creature, you can target a location you have seen. When you do so, the sensor appears at that location and doesn’t move."
    }
   ]
  }
 },
 {
  "id": "searing-smite",
  "name": {
   "de": "Sengendes Niederstrecken",
   "en": "Searing Smite"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Paladin)",
   "en": "Level 1 Evocation (Paladin)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion, die du sofort ausführst, wenn du ein Ziel mit einer Nahkampfwaffe oder einem waffenlosen Angriff getroffen hast",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Bonus Action, which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du das Ziel triffst, erleidet es zusätzlich 1W6 Feuerschaden durch den Angriff. Für die Wirkungsdauer erleidet das Ziel zu Beginn jedes seiner Züge 1W6 Feuerschaden und führt dann einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so wirkt der Zauber weiter. Bei einem erfolgreichen Rettungswurf endet der Zauber."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird jeder Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As you hit the target, it takes an extra 1d6 Fire damage from the attack. At the start of each of its turns until the spell ends, the target takes 1d6 Fire damage and then makes a Constitution saving throw. On a failed save, the spell continues. On a successful save, the spell ends."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. All the damage increases by 1d6 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "secret-chest",
  "name": {
   "de": "Geheime Truhe",
   "en": "Secret Chest"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 4. Grades (Magier)",
   "en": "Level 4 Conjuration (Wizard)"
  },
  "grad": 4,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (eine Truhe in den Abmessungen 90 mal 60 mal 60 Zentimeter aus seltenen Materialien im Wert von mindestens 5.000 GM und eine winzige Nachbildung der Truhe aus den gleichen Materialien im Wert von mindestens 50 GM)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth 5,000+ GP, and a Tiny replica of the chest made from the same materials worth 50+ GP)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versteckst eine Truhe mit ihrem gesamten Inhalt auf der Ätherebene. Dazu musst du beide Materialkomponenten für den Zauber berühren, die Truhe und die winzige Nachbildung. Die Truhe fasst bis zu 324 Liter anorganischen Materials (90 mal 60 mal 60 Zentimeter). Solange sich die Truhe auf der Ätherebene befindet, kannst du mit einer magischen Aktion die Nachbildung berühren, um die Truhe herbeizurufen. Sie erscheint in einem freien Bereich auf dem Boden im Abstand von bis zu 1,5 Metern von dir. Du kannst die Truhe wieder auf die Ätherebene zurückschicken, indem du mit einer magischen Aktion die Truhe und ihre Nachbildung gleichzeitig berührst. Nach 60 Tagen besteht am Ende jedes Tages eine kumulative Chance von fünf Prozent, dass der Zauber endet. Er endet auch dann, wenn du den Zauber erneut wirkst oder die winzige Nachbildung zerstört wird. Wenn der Zauber endet, während sich die große Truhe auf der Ätherebene befindet, bleibt sie dort, bis sie von dir oder jemand anderem gefunden wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You hide a chest and all its contents on the Ethereal Plane. You must touch the chest and the miniature replica that serve as Material components for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet). While the chest remains on the Ethereal Plane, you can take a Magic action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by taking a Magic action to touch the chest and the replica. After 60 days, there is a cumulative 5 percent chance at the end of each day that the spell ends. The spell also ends if you cast this spell again or if the Tiny replica chest is destroyed. If the spell ends and the larger chest is on the Ethereal Plane, the chest remains there for you or someone else to find."
    }
   ]
  }
 },
 {
  "id": "see-invisibility",
  "name": {
   "de": "Unsichtbares sehen",
   "en": "See Invisibility"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 2. Grades (Barde, Magier, Zauberer)",
   "en": "Level 2 Divination (Bard, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine Prise Talk)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a pinch of talc)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer siehst du unsichtbare Kreaturen und Gegenstände, als wären sie sichtbar. Du kannst zudem in die Ätherebene blicken. Kreaturen und Gegenstände dort erscheinen geisterhaft."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you see creatures and objects that have the Invisible condition as if they were visible, and you can see into the Ethereal Plane. Creatures and objects there appear ghostly."
    }
   ]
  }
 },
 {
  "id": "seeming",
  "name": {
   "de": "Äußerlichkeiten",
   "en": "Seeming"
  },
  "gradzeile": {
   "de": "Illusionszauber 5. Grades (Barde, Magier, Zauberer)",
   "en": "Level 5 Illusion (Bard, Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verleihst jeder Kreatur deiner Wahl in Reichweite, die du sehen kannst, ein illusionäres Erscheinungsbild. Ein nicht bereitwilliges Ziel kann einen Charismarettungswurf ausführen. Bei einem Erfolg ist es nicht von diesem Effekt betroffen. Du kannst den Zielen dasselbe Erscheinungsbild oder unterschiedliche geben. Der Zauber kann das Erscheinungsbild von Körpern sowie Ausrüstung der Ziele verändern. Du kannst jede Kreatur 30 Zentimeter größer oder kleiner sowie schwerer oder leichter erscheinen lassen. Das neue Erscheinungsbild eines Ziels muss die gleiche Grundanordnung von Gliedmaßen haben. Abgesehen davon sind die Einzelheiten der Illusion dir überlassen. Der Zauber bleibt für die Wirkungsdauer bestehen. Einer genauen körperlichen Untersuchung halten die Veränderungen dieser Illusion nicht stand. Nutzt du diesen Zauber beispielsweise, um einer Kreatur einen Hut aufzusetzen, so durchdringen Gegenstände diesen einfach. Eine Kreatur, die die Studieren‑Aktion ausführt, um ein Ziel zu untersuchen, kann einen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG ausführen. Bei einem Erfolg weiß sie, dass das Ziel verkleidet wurde."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You give an illusory appearance to each creature of your choice that you can see within range. An unwilling target can make a Charisma saving throw, and if it succeeds, it is unaffected by this spell. You can give the same appearance or different ones to the targets. The spell can change the appearance of the targets’ bodies and equipment. You can make each creature seem 1 foot shorter or taller and appear heavier or lighter. A target’s new appearance must have the same basic arrangement of limbs as the target, but the extent of the illusion is otherwise up to you. The spell lasts for the duration. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to a creature’s outfit, objects pass through the hat. A creature that takes the Study action to examine a target can make an Intelligence (Investigation) check against your spell save DC. If it succeeds, it becomes aware that the target is disguised."
    }
   ]
  }
 },
 {
  "id": "sending",
  "name": {
   "de": "Verständigung",
   "en": "Sending"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 3. Grades (Barde, Kleriker, Magier)",
   "en": "Level 3 Divination (Bard, Cleric, Wizard)"
  },
  "grad": 3,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Unbegrenzt",
    "komponenten": "V, G, M (ein Stück Kupferdraht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Unlimited",
    "komponenten": "V, S, M (a copper wire)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du sendest eine kurze Botschaft von höchstens 25 Worten an eine Kreatur, der du begegnet bist oder die dir von jemandem beschrieben wurde, der ihr begegnet ist. Das Ziel hört die Botschaft in seinem Kopf, erkennt dich als Absender, sofern es dich kennt, und kann auf gleiche Weise sofort antworten. Der Zauber ermöglicht dem Ziel, die Bedeutung deiner Botschaft zu verstehen. Du kannst die Botschaft über beliebige Entfernungen und sogar auf andere Existenzebenen senden. Wenn sich das Ziel jedoch auf einer anderen Ebene befindet als du, besteht ein Risiko von fünf Prozent, dass die Botschaft nicht ankommt. Ist dies der Fall, so weißt du, dass sie nicht angekommen ist. Wenn eine Kreatur deine Botschaft erhalten hat, kann sie für die nächsten acht Stunden verhindern, dass du sie erneut mit diesem Zauber erreichst. Versuchst du in diesem Fall, ihr eine weitere Botschaft zu senden, so erfährst du, dass du blockiert wurdest, und der Zauber misslingt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You send a short message of 25 words or fewer to a creature you have met or a creature described to you by someone who has met it. The target hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. The spell enables targets to understand the meaning of your message. You can send the message across any distance and even to other planes of existence, but if the target is on a different plane than you, there is a 5 percent chance that the message doesn’t arrive. You know if the delivery fails. Upon receiving your message, a creature can block your ability to reach it again with this spell for 8 hours. If you try to send another message during that time, you learn that you are blocked, and the spell fails."
    }
   ]
  }
 },
 {
  "id": "sequester",
  "name": {
   "de": "Verbergen",
   "en": "Sequester"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 7. Grades (Magier)",
   "en": "Level 7 Transmutation (Wizard)"
  },
  "grad": 7,
  "schule": "verwandlung",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Edelsteinpulver im Wert von mindestens 5.000 GM, das der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (gem dust worth 5,000+ GP, which the spell consumes)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verbirgst einen Gegenstand oder eine bereitwillige Kreatur auf magische Art, indem du das Ziel berührst. Für die Wirkungsdauer ist das Ziel unsichtbar und kann nicht Ziel von Erkenntniszaubern werden, von Magie aufgespürt oder magisch aus der Ferne betrachtet werden. Wenn das Ziel eine Kreatur ist, fällt es in einen scheintoten Zustand: Es ist bewusstlos, altert nicht und benötigt weder Nahrung noch Wasser noch Luft. Du kannst eine Bedingung festlegen, durch die der Zauber vorzeitig endet. Dabei hast du freie Wahl, solange die Bedingung im Abstand von bis zu 1,6 Kilometern um das Ziel eintritt oder sichtbar ist. Beispiele dafür wären „Nach 1.000 Jahren“ oder „Wenn die Tarraske erwacht“. Dieser Zauber endet auch dann, wenn das Ziel Schaden erleidet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "With a touch, you magically sequester an object or a willing creature. For the duration, the target has the Invisible condition and can’t be targeted by Divination spells, detected by magic, or viewed remotely with magic. If the target is a creature, it enters a state of suspended animation; it has the Unconscious condition, doesn’t age, and doesn’t need food, water, or air. You can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include “after 1,000 years” or “when the tarrasque awakens.” This spell also ends if the target takes any damage."
    }
   ]
  }
 },
 {
  "id": "shapechange",
  "name": {
   "de": "Gestaltwandel",
   "en": "Shapechange"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 9. Grades (Druide, Magier)",
   "en": "Level 9 Transmutation (Druid, Wizard)"
  },
  "grad": 9,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Jadediadem im Wert von mindestens 1.500 GM)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a jade circlet worth 1,500+ GP)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du nimmst die Gestalt einer anderen Kreatur an, bis der Zauber endet oder du eine magische Aktion ausführst, um eine andere mögliche Gestalt anzunehmen. Bei der neuen Gestalt muss es sich um eine Kreatur handeln, deren Herausforderungsgrad höchstens deiner Stufe oder deinem Herausforderungsgrad entspricht. Du musst diese Art von Kreatur mindestens einmal gesehen haben, und es darf sich weder um ein Konstrukt noch um einen Untoten handeln. Wenn du den Zauber wirkst, erhältst du eine Anzahl von temporären Trefferpunkten, die der Anzahl von Trefferpunkten der ersten Gestalt entspricht, die du annimmst. Nach der Wirkungsdauer dieses Zaubers verbleibende temporäre Trefferpunkte gehen verloren. Deine Spielwerte werden durch den Wertekasten der ausgewählten Gestalt ersetzt. Du behältst jedoch Folgendes bei: Kreaturentyp, Gesinnung, Persönlichkeit, Werte für Intelligenz, Weisheit und Charisma, Trefferpunkte, Trefferpunktewürfel, Übungen sowie die Fähigkeit zu kommunizieren. Auch das Merkmal Zauberwirken behältst du bei, sofern du darüber verfügst. Bei der Verwandlung entscheidest du, ob deine Ausrüstung zu Boden fällt oder ihre Form und Größe ändert, sodass sie zu deiner neuen Gestalt passt, solange du diese beibehältst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You shape-shift into another creature for the duration or until you take a Magic action to shape-shift into a different eligible form. The new form must be of a creature that has a Challenge Rating no higher than your level or Challenge Rating. You must have seen the sort of creature before, and it can’t be a Construct or an Undead. When you cast the spell, you gain a number of Temporary Hit Points equal to the Hit Points of the first form into which you shape-shift. These Temporary Hit Points vanish if any remain when the spell ends. Your game statistics are replaced by the stat block of the chosen form, but you retain your creature type; alignment; personality; Intelligence, Wisdom, and Charisma scores; Hit Points; Hit Point Dice; proficiencies; and ability to communicate. If you have the Spellcasting feature, you retain it too. Upon shape-shifting, you determine whether your equipment drops to the ground or changes in size and shape to fit the new form while you’re in it."
    }
   ]
  }
 },
 {
  "id": "shatter",
  "name": {
   "de": "Zerbersten",
   "en": "Shatter"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Barde, Magier, Zauberer)",
   "en": "Level 2 Evocation (Bard, Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Glimmersplitter)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a chip of mica)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von einem Punkt deiner Wahl in Reichweite geht ein lautes Geräusch aus. Jede Kreatur in einer Kugel mit einem Radius von drei Metern um den Punkt führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 3W8 Schallschaden, anderenfalls die Hälfte. Konstrukte sind beim Rettungswurf im Nachteil. Nichtmagische Gegenstände im Bereich, die nicht getragen oder gehalten werden, erleiden den gleichen Schaden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A loud noise erupts from a point of your choice within range. Each creature in a 10-foot-radius Sphere centered there makes a Constitution saving throw, taking 3d8 Thunder damage on a failed save or half as much damage on a successful one. A Construct has Disadvantage on the save. A nonmagical object that isn’t being worn or carried also takes the damage if it’s in the spell’s area."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."
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
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Magier, Zauberer)",
   "en": "Level 1 Abjuration (Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Reaktion, die du ausführst, wenn du von einem Angriffswurf getroffen oder als Ziel des Zaubers Magisches Geschoss ausgewählt wirst",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "1 Runde"
   },
   "en": {
    "zeit": "Reaction, which you take when you are hit by an attack roll or targeted by the Magic Missile spell",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "1 round"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine nicht wahrnehmbare Barriere aus magischer Energie schützt dich. Bis zum Beginn deines nächsten Zugs hast du einen Bonus von +5 auf deine RK (auch gegen den auslösenden Angriff), und du erleidest keinen Schaden durch Magisches Geschoss."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from Magic Missile."
    }
   ]
  }
 },
 {
  "id": "shield-of-faith",
  "name": {
   "de": "Schild des Glaubens",
   "en": "Shield of Faith"
  },
  "gradzeile": {
   "de": "Bannzauber 1. Grades (Kleriker, Paladin)",
   "en": "Level 1 Abjuration (Cleric, Paladin)"
  },
  "grad": 1,
  "schule": "bann",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (eine Gebetsschriftrolle)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a prayer scroll)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Ein schimmerndes Feld umgibt eine Kreatur deiner Wahl in Reichweite und gewährt ihr für die Wirkungsdauer einen Bonus von +2 auf ihre RK."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A shimmering field surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration."
    }
   ]
  }
 },
 {
  "id": "shillelagh",
  "name": {
   "de": "Shillelagh",
   "en": "Shillelagh"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verwandlung (Druide)",
   "en": "Transmutation Cantrip (Druid)"
  },
  "grad": 0,
  "schule": "verwandlung",
  "klassen": [
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (ein Mistelzweig)",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (mistletoe)",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Das Holz eines Knüppels oder Kampfstabs, den du in der Hand hältst, wird von der Macht der Natur erfüllt. Für die Wirkungsdauer kannst du bei Angriffs ‑ und Schadenswürfen von Nahkampfangriffen mit dieser Waffe dein Attribut zum Zauberwirken anstatt Stärke verwenden, und der Schadenswürfel der Waffe wird zu einem W8. Wenn der Angriff Schaden bewirkt, kann dies Energieschaden oder die normale Schadensart der Waffe sein (nach deiner Wahl). Der Zauber endet vorzeitig, wenn du ihn erneut wirkst oder die Waffe loslässt."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schadenswürfel ändert sich, wenn du die 5. (W10), die 11. (W12) und die 17. (2W6) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A Club or Quarterstaff you are holding is imbued with nature’s power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon’s damage die becomes a d8. If the attack deals damage, it can be Force damage or the weapon’s normal damage type (your choice). The spell ends early if you cast it again or if you let go of the weapon."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage die changes when you reach levels 5 (d10), 11 (d12), and 17 (2d6)."
    }
   ]
  }
 },
 {
  "id": "shining-smite",
  "name": {
   "de": "Strahlendes Niederstrecken",
   "en": "Shining Smite"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Paladin)",
   "en": "Level 2 Transmutation (Paladin)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "paladin"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion, die du sofort ausführst, wenn du eine Kreatur mit einer Nahkampfwaffe oder einem waffenlosen Angriff getroffen hast",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Bonus Action, which you take immediately after hitting a creature with a Melee weapon or an Unarmed Strike",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Das Ziel des Schlags erleidet zusätzlich 2W6 gleißenden Schaden. Bis der Zauber endet, spendet das Ziel in einem Radius von 1,5 Metern helles Licht, Angriffswürfe gegen es sind im Vorteil, und es kann nicht unsichtbar werden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The target hit by the strike takes an extra 2d6 Radiant damage from the attack. Until the spell ends, the target sheds Bright Light in a 5-foot radius, attack rolls against it have Advantage, and it can’t benefit from the Invisible condition."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "shocking-grasp",
  "name": {
   "de": "Schockgriff",
   "en": "Shocking Grasp"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Magier, Zauberer)",
   "en": "Evocation Cantrip (Sorcerer, Wizard)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von dir springt ein Blitz auf eine Kreatur über, die du zu berühren versuchst. Führe einen Nahkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 1W8 Blitzschaden und kann bis zum Beginn seines nächsten Zugs keine Gelegenheitsangriffe ausführen."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W8 erhöht, wenn du die 5. (2W8), die 11. (3W8) und die 17. (4W8) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Lightning springs from you to a creature that you try to touch. Make a melee spell attack against the target. On a hit, the target takes 1d8 Lightning damage, and it can’t make Opportunity Attacks until the start of its next turn."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
    }
   ]
  }
 },
 {
  "id": "silence",
  "name": {
   "de": "Stille",
   "en": "Silence"
  },
  "gradzeile": {
   "de": "Illusionszauber 2. Grades (Barde, Kleriker, Waldläufer)",
   "en": "Level 2 Illusion (Bard, Cleric, Ranger)"
  },
  "grad": 2,
  "schule": "illusion",
  "klassen": [
   "barde",
   "kleriker",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer kann in einer Kugel mit einem Radius von sechs Metern kein Geräusch erzeugt werden, und kein Geräusch kann in die Kugel dringen. Die Kugel wird an einem Ort deiner Wahl in Reichweite erzeugt. Alle Kreaturen und Gegenstände, die sich vollständig in der Kugel befinden, sind taub und gegen Schallschaden immun. In der Kugel können keine Zauber mit Verbalkomponente gewirkt werden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, no sound can be created within or pass through a 20-foot-radius Sphere centered on a point you choose within range. Any creature or object entirely inside the Sphere has Immunity to Thunder damage, and creatures have the Deafened condition while entirely inside it. Casting a spell that includes a Verbal component is impossible there."
    }
   ]
  }
 },
 {
  "id": "silent-image",
  "name": {
   "de": "Lautloses Trugbild",
   "en": "Silent Image"
  },
  "gradzeile": {
   "de": "Illusionszauber 1. Grades (Barde, Magier, Zauberer)",
   "en": "Level 1 Illusion (Bard, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "illusion",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Stück Vlies)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a bit of fleece)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst das Abbild eines Gegenstands, einer Kreatur oder eines anderen sichtbaren Phänomens, das nicht größer als ein Würfel mit 4,5 Metern Kantenlänge sein darf. Das Abbild erscheint an einem Punkt in Reichweite und bleibt für die Wirkungsdauer bestehen. Es ist ein rein visueller Eindruck ohne Geräusche, Gerüche oder andere Sinneseffekte. Als magische Aktion kannst du das Abbild an jeden beliebigen Punkt in Reichweite bewegen. Dabei kannst du das Abbild so verändern, dass seine Bewegung natürlich erscheint. Beispiel: Wenn du das Abbild einer Kreatur erschaffst und bewegst, kannst du es so verändern, dass es zu laufen scheint. Physische Interaktionen mit dem Abbild enttarnen es als Illusion, da Dinge es einfach durchdringen können. Eine Kreatur, die das Abbild mit der Studieren‑Aktion untersucht, kann mit einem erfolgreichen Intelligenzwurf (Nachforschungen) gegen deinen Zauberrettungswurf‑SG erkennen, dass es sich um eine Illusion handelt. Erkennt eine Kreatur die Illusion als solche, so wird das Abbild für sie durchscheinend."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot Cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn’t accompanied by sound, smell, or other sensory effects. As a Magic action, you can cause the image to move to any spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Physical interaction with the image reveals it to be an illusion, since things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image."
    }
   ]
  }
 },
 {
  "id": "simulacrum",
  "name": {
   "de": "Simulakrum",
   "en": "Simulacrum"
  },
  "gradzeile": {
   "de": "Illusionszauber 7. Grades (Magier)",
   "en": "Level 7 Illusion (Wizard)"
  },
  "grad": 7,
  "schule": "illusion",
  "klassen": [
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "12 Stunden",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Rubinpulver im Wert von mindestens 1.500 GM, das der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt wird"
   },
   "en": {
    "zeit": "12 hours",
    "reichweite": "Touch",
    "komponenten": "V, S, M (powdered ruby worth 1,500+ GP, which the spell consumes)",
    "dauer": "Until dispelled"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst das Abbild eines Tieres oder eines Humanoiden. Das Original muss sich während des gesamten Zeitaufwands im Abstand von bis zu drei Metern von dir befinden. Du schließt das Zauberwirken ab, indem du sowohl die Kreatur als auch einen Haufen Eis oder Schnee von gleicher Größe berührst. Der Haufen verwandelt sich in das Simulakrum, welches eine Kreatur ist. Es verwendet die Spielwerte der ursprünglichen Kreatur zum Zeitpunkt des Zauberwirkens, ist allerdings ein Konstrukt, sein Trefferpunktemaximum beträgt die Hälfte, und es kann diesen Zauber nicht wirken. Das Simulakrum ist dir und allen von dir bestimmten Kreaturen freundlich gesinnt. Es gehorcht deinen Befehlen und agiert im Kampf in deinem Zug. Ihm sind weder Stufenaufstiege noch kurze oder lange Rasten möglich. Wenn das Simulakrum Schaden erleidet, besteht die einzige Möglichkeit, seine Trefferpunkte wiederherzustellen, in einer Reparatur während deiner langen Rast, wobei du Komponenten im Wert von 100 GM pro wiederhergestelltem Trefferpunkt verbrauchen musst. Bei der Reparatur muss es im Abstand von bis zu 1,5 Metern von dir bleiben. Das Simulakrum bleibt bestehen, bis seine Trefferpunkte auf 0 sinken. Dann wird es wieder zu Schnee oder Eis und schmilzt. Wirkst du diesen Zauber erneut, so wird das vorige Simulakrum sofort zerstört."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a simulacrum of one Beast or Humanoid that is within 10 feet of you for the entire casting of the spell. You finish the casting by touching both the creature and a pile of ice or snow that is the same size as that creature, and the pile turns into the simulacrum, which is a creature. It uses the game statistics of the original creature at the time of casting, except it is a Construct, its Hit Point maximum is half as much, and it can’t cast this spell. The simulacrum is Friendly to you and creatures you designate. It obeys your commands and acts on your turn in combat. The simulacrum can’t gain levels, and it can’t take Short or Long Rests. If the simulacrum takes damage, the only way to restore its Hit Points is to repair it as you take a Long Rest, during which you expend components worth 100 GP per Hit Point restored. The simulacrum must stay within 5 feet of you for the repair. The simulacrum lasts until it drops to 0 Hit Points, at which point it reverts to snow and melts away. If you cast this spell again, any simulacrum you created with this spell is instantly destroyed."
    }
   ]
  }
 },
 {
  "id": "sleep",
  "name": {
   "de": "Schlaf",
   "en": "Sleep"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 1. Grades (Barde, Magier, Zauberer)",
   "en": "Level 1 Enchantment (Bard, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (eine Prise Sand oder Rosenblütenblätter)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a pinch of sand or rose petals)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Jede Kreatur deiner Wahl in einer Kugel mit einem Radius von 1,5 Metern um einen Punkt in Reichweite muss einen Weisheitsrettungswurf bestehen, oder es ist bis zum Ende seines nächsten Zugs kampfunfähig und muss den Rettungswurf dann wiederholen. Wenn das Ziel auch beim zweiten Rettungswurf scheitert, ist es für die Wirkungsdauer bewusstlos. Der Zauber endet bei einem Ziel, wenn es Schaden erleidet oder jemand im Abstand von bis zu 1,5 Metern von ihm eine Aktion ausführt, um es zu schütteln. Kreaturen, die wie Elfen nicht schlafen oder die gegen den Zustand Erschöpft immun sind, bestehen Rettungswürfe gegen diesen Zauber automatisch."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Each creature of your choice in a 5-foot-radius Sphere centered on a point within range must succeed on a Wisdom saving throw or have the Incapacitated condition until the end of its next turn, at which point it must repeat the save. If the target fails the second save, the target has the Unconscious condition for the duration. The spell ends on a target if it takes damage or someone within 5 feet of it takes an action to shake it out of the spell’s effect. Creatures that don’t sleep, such as elves, or that have Immunity to the Exhaustion condition automatically succeed on saves against this spell."
    }
   ]
  }
 },
 {
  "id": "sleet-storm",
  "name": {
   "de": "Schneesturm",
   "en": "Sleet Storm"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 3. Grades (Druide, Magier, Zauberer)",
   "en": "Level 3 Conjuration (Druid, Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (ein Miniaturregenschirm)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (a miniature umbrella)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer fallen in einem zwölf Meter hohen Zylinder mit einem Radius von sechs Metern um einen Punkt deiner Wahl in Reichweite Schnee und Graupel. Der Bereich ist komplett verschleiert, und offene Flammen erlöschen darin. Der Boden im Zylinder ist schwieriges Gelände. Wenn eine Kreatur den Zylinder in einem Zug erstmals betritt oder den Zug darin beginnt, muss sie einen Geschicklichkeitsrettungswurf bestehen, oder sie stürzt hin, sodass sie liegend ist, und verliert ihre Konzentration."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, sleet falls in a 40-foot-tall, 20-foot-radius Cylinder centered on a point you choose within range. The area is Heavily Obscured, and exposed flames in the area are doused. Ground in the Cylinder is Difficult Terrain. When a creature enters the Cylinder for the first time on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the Prone condition and lose Concentration."
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
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Barde, Magier, Zauberer)",
   "en": "Level 3 Transmutation (Bard, Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (ein Tropfen Melasse)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a drop of molasses)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verlangsamst die Zeit um bis zu sechs Kreaturen deiner Wahl in einem Würfel mit zwölf Metern Kantenlänge in Reichweite. Jedes Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer von diesem Zauber betroffen. Die Bewegungsrate eines betroffenen Ziels wird halbiert, es erleidet einen Malus von −2 auf seine RK und auf Geschicklichkeitsrettungswürfe. Außerdem kann es keine Reaktionen ausführen. Es kann in seinem Zug eine Aktion oder eine Bonusaktion verwenden, jedoch nicht beides. Wenn es die Angriffsaktion ausführt, kann es nur einen Angriff ausführen. Wenn es einen Zauber mit Gestenkomponente wirkt, besteht eine Chance von 25 Prozent, dass der Zauber misslingt, weil das Ziel die Gesten zu langsam ausführt. Ein betroffenes Ziel wiederholt den Rettungswurf am Ende jedes seiner Züge. Bei einem Erfolg endet der Effekt."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You alter time around up to six creatures of your choice in a 40-foot Cube within range. Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration. An affected target’s Speed is halved, it takes a −2 penalty to AC and Dexterity saving throws, and it can’t take Reactions. On its turns, it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. If it casts a spell with a Somatic component, there is a 25 percent chance the spell fails as a result of the target making the spell’s gestures too slowly. An affected target repeats the save at the end of each of its turns, ending the spell on itself on a success."
    }
   ]
  }
 },
 {
  "id": "sorcerous-burst",
  "name": {
   "de": "Explosion der Zauberei",
   "en": "Sorcerous Burst"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Zauberer)",
   "en": "Evocation Cantrip (Sorcerer)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du wirkst zauberische Energie auf eine Kreatur oder einen Gegenstand in Reichweite. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 1W8 Schaden von einer Art deiner Wahl: Blitz, Feuer, Gift, Kälte, Psychisch, Säure oder Schall. Wenn du mit einem W8 eine 8 für diesen Zauber würfelst, kannst du mit einem weiteren W8 würfeln und das Ergebnis dem Schaden hinzufügen. Wenn du diesen Zauber wirkst, entspricht die maximale Anzahl von W8, die du dem Zauberschaden hinzufügen kannst, deinem Zauberwirken‑Attributsmodifikator."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W8 erhöht, wenn du die 5. (2W8), die 11. (3W8) und die 17. (4W8) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You cast sorcerous energy at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 damage of a type you choose: Acid, Cold, Fire, Lightning, Poison, Psychic, or Thunder. If you roll an 8 on a d8 for this spell, you can roll another d8, and add it to the damage. When you cast this spell, the maximum number of these d8s you can add to the spell’s damage equals your spellcasting ability modifier."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
    }
   ]
  }
 },
 {
  "id": "spare-the-dying",
  "name": {
   "de": "Verschonung der Sterbenden",
   "en": "Spare the Dying"
  },
  "gradzeile": {
   "de": "Zaubertrick der Nekromantie (Druide, Kleriker)",
   "en": "Necromancy Cantrip (Cleric, Druid)"
  },
  "grad": 0,
  "schule": "nekromantie",
  "klassen": [
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "4,5 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "15 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle eine Kreatur in Reichweite aus, deren Trefferpunkte auf 0 gesunken sind, die jedoch noch nicht tot ist. Die Kreatur wird stabil."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Die Reichweite wird jeweils verdoppelt, wenn du die 5. (neun Meter), die 11. (18 Meter) und die 17. (36 Meter) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose a creature within range that has 0 Hit Points and isn’t dead. The creature becomes Stable."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The range doubles when you reach levels 5 (30 feet), 11 (60 feet), and 17 (120 feet)."
    }
   ]
  }
 },
 {
  "id": "speak-with-animals",
  "name": {
   "de": "Mit Tieren sprechen",
   "en": "Speak with Animals"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 1. Grades (Barde, Druide, Hexenmeister, Waldläufer)",
   "en": "Level 1 Divination (Bard, Druid, Ranger, Warlock)"
  },
  "grad": 1,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "druide",
   "hexenmeister",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "10 Minuten"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer kannst du Tiere verstehen und verbal mit ihnen kommunizieren, und du kannst beliebige Fertigkeitsoptionen der Beeinflussen-Aktion auf sie anwenden. Die meisten Tiere haben zu Themen abseits von Überleben oder Gefährtenschaft nicht viel zu sagen. Sie sind jedoch zumindest in der Lage, Informationen über nahe Orte und Monster sowie über Ereignisse mitzuteilen, die sie innerhalb des letzten Tages erlebt haben."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, you can comprehend and verbally communicate with Beasts, and you can use any of the Influence action’s skill options with them. Most Beasts have little to say about topics that don’t pertain to survival or companionship, but at minimum, a Beast can give you information about nearby locations and monsters, including whatever it has perceived within the past day."
    }
   ]
  }
 },
 {
  "id": "speak-with-dead",
  "name": {
   "de": "Mit Toten sprechen",
   "en": "Speak with Dead"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 3. Grades (Barde, Kleriker, Magier)",
   "en": "Level 3 Necromancy (Bard, Cleric, Wizard)"
  },
  "grad": 3,
  "schule": "nekromantie",
  "klassen": [
   "barde",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "3 Meter",
    "komponenten": "V, G, M (brennender Weihrauch)",
    "dauer": "10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "10 feet",
    "komponenten": "V, S, M (burning incense)",
    "dauer": "10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erfüllst einem Leichnam deiner Wahl in Reichweite mit einem Hauch von Leben, damit er Fragen beantworten kann, die du ihm stellst. Der Leichnam muss einen Mund besitzen. Wenn die Kreatur untot war, als sie starb, misslingt dieser Zauber. Er misslingt auch dann, wenn die Leiche innerhalb der letzten zehn Tage bereits Ziel dieses Zaubers war. Für die Wirkungsdauer kannst du der Leiche bis zu fünf Fragen stellen. Die Leiche besitzt nur das Wissen, das sie zu Lebzeiten hatte, und spricht nur die ihr zu Lebzeiten bekannten Sprachen. Die Antworten sind normalerweise kurz, kryptisch oder monoton. Der Leichnam muss dir nicht wahrheitsgemäß antworten, wenn du ihm feindselig gesinnt bist oder er dich als Feind erkennt. Dieser Zauber bringt nicht die Seele der Kreatur in ihren Körper zurück, nur ihren belebenden Geist. Daher kann die Leiche keine neuen Informationen erhalten, weiß nichts, was nach ihrem Tod geschehen ist, und kann nicht über zukünftige Ereignisse mutmaßen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You grant the semblance of life to a corpse of your choice within range, allowing it to answer questions you pose. The corpse must have a mouth, and this spell fails if the deceased creature was Undead when it died. The spell also fails if the corpse was the target of this spell within the past 10 days. Until the spell ends, you can ask the corpse up to five questions. The corpse knows only what it knew in life, including the languages it knew. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are antagonistic toward it or it recognizes you as an enemy. This spell doesn’t return the creature’s soul to its body, only its animating spirit. Thus, the corpse can’t learn new information, doesn’t comprehend anything that has happened since it died, and can’t speculate about future events."
    }
   ]
  }
 },
 {
  "id": "speak-with-plants",
  "name": {
   "de": "Mit Pflanzen sprechen",
   "en": "Speak with Plants"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Barde, Druide, Waldläufer)",
   "en": "Level 3 Transmutation (Bard, Druid, Ranger)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "druide",
   "waldlaeufer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einer unbeweglichen Ausströmung von neun Metern um dich herum erfüllst du Pflanzen mit begrenztem Bewusstsein, sodass sie mit dir kommunizieren und einfache Befehle befolgen können. Du kannst die Pflanzen über Ereignisse des letzten Tages im Bereich des Zaubers befragen und so Informationen über vorbeiziehende Kreaturen, das Wetter und andere Umstände erhalten. Außerdem kannst du schwieriges Gelände aufgrund von Pflanzenwachstum – beispielsweise Dickicht oder Unterholz – für die Wirkungsdauer in normales Gelände verwandeln. Umgekehrt kannst du normales Gelände für die Wirkungsdauer zu schwierigem Gelände durch Pflanzenwachstum machen. Der Zauber ermöglicht es ihnen zwar nicht, sich zu entwurzeln und umherzulaufen, aber sie sind in der Lage, ihre Zweige, Ranken und Stiele für dich zu bewegen. Wenn sich eine Pflanzenkreatur in der Umgebung befindet, kannst du mit ihr kommunizieren, als würdet ihr dieselbe Sprache sprechen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You imbue plants in an immobile 30-foot Emanation with limited sentience and animation, giving them the ability to communicate with you and follow your simple commands. You can question plants about events in the spell’s area within the past day, gaining information about creatures that have passed, weather, and other circumstances. You can also turn Difficult Terrain caused by plant growth (such as thickets and undergrowth) into ordinary terrain that lasts for the duration. Or you can turn ordinary terrain where plants are present into Difficult Terrain that lasts for the duration. The spell doesn’t enable plants to uproot themselves and move about, but they can move their branches, tendrils, and stalks for you. If a Plant creature is in the area, you can communicate with it as if you shared a common language."
    }
   ]
  }
 },
 {
  "id": "spider-climb",
  "name": {
   "de": "Spinnenklettern",
   "en": "Spider Climb"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 2 Transmutation (Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (etwas Pech und eine Spinne)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a drop of bitumen and a spider)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine bereitwillige Kreatur, die du berührst, erhält für die Wirkungsdauer die Fähigkeit, sich in alle Richtungen und mit freien Händen über senkrechte Oberflächen sowie an Decken zu bewegen. Außerdem erhält das Ziel eine Kletterbewegungsrate in Höhe seiner Bewegungsrate."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. kannst du auf eine weitere Kreatur zielen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and along ceilings, while leaving its hands free. The target also gains a Climb Speed equal to its Speed."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2."
    }
   ]
  }
 },
 {
  "id": "spike-growth",
  "name": {
   "de": "Dornenwuchs",
   "en": "Spike Growth"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 2. Grades (Druide, Waldläufer)",
   "en": "Level 2 Transmutation (Druid, Ranger)"
  },
  "grad": 2,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (sieben Dornen)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (seven thorns)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "In einem Radius von sechs Metern um einen Punkt in Reichweite wird der Boden von harten Stacheln und Dornen überwuchert. Der Bereich wird für die Wirkungsdauer zu schwierigem Gelände. Bewegt sich eine Kreatur in oder durch den Bereich, so erleidet sie pro zurückgelegten 1,5 Metern 2W4 Stichschaden. Die Verwandlung des Bodens ist als natürlich getarnt. Jede Kreatur, die den Bereich beim Wirken des Zaubers nicht sehen kann, muss die Suchen‑Aktion ausführen und einen Weisheitswurf (Überlebenskunst oder Wahrnehmung) gegen deinen Zauberrettungswurf‑SG ausführen. Bei einem Erfolg erkennt sie das Gelände vor dem Betreten als gefährlich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The ground in a 20-foot-radius Sphere centered on a point within range sprouts hard spikes and thorns. The area becomes Difficult Terrain for the duration. When a creature moves into or within the area, it takes 2d4 Piercing damage for every 5 feet it travels. The transformation of the ground is camouflaged to look natural. Any creature that can’t see the area when the spell is cast must take a Search action and succeed on a Wisdom (Perception or Survival) check against your spell save DC to recognize the terrain as hazardous before entering it."
    }
   ]
  }
 },
 {
  "id": "spirit-guardians",
  "name": {
   "de": "Schutzgeister",
   "en": "Spirit Guardians"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 3. Grades (Kleriker)",
   "en": "Level 3 Conjuration (Cleric)"
  },
  "grad": 3,
  "schule": "beschwoerung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine Gebetsschriftrolle)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a prayer scroll)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Beschützende Naturgeister umschwirren dich für die Wirkungsdauer in einer Ausströmung von 4,5 Metern. Wenn du guter oder neutraler Gesinnung bist, erscheint ihre Spektralform engel‑ oder feenhaft (nach deiner Wahl). Wenn du böser Gesinnung bist, erscheinen sie als Unholde. Wenn du diesen Zauber wirkst, kannst du Kreaturen bestimmen, die vom Zauber nicht betroffen sind. Die Bewegungsrate betroffener Kreaturen ist innerhalb der Ausströmung halbiert, und wann immer die Ausströmung in den Bereich einer Kreatur gelangt, eine Kreatur die Ausströmung betritt oder ihren Zug darin beendet, muss die Kreatur einen Weisheits rettungswurf ausführen. Misslingt der Wurf, so erleidet die Kreatur 3W8 gleißenden Schaden (wenn du guter oder neutraler Gesinnung bist) oder 3W8 nekrotischen Schaden (wenn du böser Gesinnung bist). Bei einem erfolgreichen Rettungswurf erleidet die Kreatur halb so viel Schaden. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Protective spirits flit around you in a 15-foot Emanation for the duration. If you are good or neutral, their spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish. When you cast this spell, you can designate creatures to be unaffected by it. Any other creature’s Speed is halved in the Emanation, and whenever the Emanation enters a creature’s space and whenever a creature enters the Emanation or ends its turn there, the creature must make a Wisdom saving throw. On a failed save, the creature takes 3d8 Radiant damage (if you are good or neutral) or 3d8 Necrotic damage (if you are evil). On a successful save, the creature takes half as much damage. A creature makes this save only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "spiritual-weapon",
  "name": {
   "de": "Waffe des Glaubens",
   "en": "Spiritual Weapon"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 2. Grades (Kleriker)",
   "en": "Level 2 Evocation (Cleric)"
  },
  "grad": 2,
  "schule": "hervorrufung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Bonusaktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Bonus Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erzeugst eine schwebende geisterhafte Kraft, die wie eine Waffe deiner Wahl aussieht und für die Wirkungsdauer bestehen bleibt. Die Kraft erscheint in einem Bereich deiner Wahl in Reichweite, und du kannst sofort einen Nahkampf‑Zauberangriff gegen eine Kreatur im Abstand von bis zu 1,5 Metern von der Kraft ausführen. Bei einem Treffer erleidet das Ziel Energieschaden in Höhe von 1W8 plus deinem Zauberwirken-Attributsmodifikator. In deinen folgenden Zügen kannst du die Waffe als Bonusaktion um bis zu sechs Meter bewegen und einen weiteren Angriff gegen eine Kreatur im Abstand von bis zu 1,5 Metern von ihr ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 2. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a floating, spectral force that resembles a weapon of your choice and lasts for the duration. The force appears within range in a space of your choice, and you can immediately make one melee spell attack against one creature within 5 feet of the force. On a hit, the target takes Force damage equal to 1d8 plus your spellcasting ability modifier. As a Bonus Action on your later turns, you can move the force up to 20 feet and repeat the attack against a creature within 5 feet of it."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for every slot level above 2."
    }
   ]
  }
 },
 {
  "id": "starry-wisp",
  "name": {
   "de": "Sternenfunke",
   "en": "Starry Wisp"
  },
  "gradzeile": {
   "de": "Zaubertrick der Hervorrufung (Barde, Druide)",
   "en": "Evocation Cantrip (Bard, Druid)"
  },
  "grad": 0,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schleuderst einen Lichtfunken auf eine Kreatur oder einen Gegenstand in Reichweite. Führe einen Fernkampf‑Zauberangriff gegen das Ziel aus. Bei einem Treffer erleidet das Ziel 1W8 gleißenden Schaden, und bis zum Ende deines nächsten Zugs spendet es in einem Radius von drei Metern dämmriges Licht und kann nicht unsichtbar werden."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W8 erhöht, wenn du die 5. (2W8), die 11. (3W8) und die 17. (4W8) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You launch a mote of light at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 Radiant damage, and until the end of your next turn, it emits Dim Light in a 10-foot radius and can’t benefit from the Invisible condition."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
    }
   ]
  }
 },
 {
  "id": "stinking-cloud",
  "name": {
   "de": "Stinkende Wolke",
   "en": "Stinking Cloud"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 3. Grades (Barde, Magier, Zauberer)",
   "en": "Level 3 Conjuration (Bard, Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "27 Meter",
    "komponenten": "V, G, M (ein faules Ei)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "90 feet",
    "komponenten": "V, S, M (a rotten egg)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst eine Kugel mit einem Radius von sechs Metern um einen Punkt in Reichweite, die mit gelbem, übelriechendem Gas gefüllt ist. Diese Gaswolke ist komplett verschleiert. Sie bleibt für die Wirkungsdauer in der Luft, oder bis starker Wind (wie solcher durch Windstoß) sie auflöst. Jede Kreatur, die ihren Zug in der Kugel beginnt, muss einen Konstitutionsrettungswurf bestehen, oder sie ist bis zum Ende des aktuellen Zugs vergiftet. Eine auf diese Art vergiftete Kreatur kann weder eine Aktion noch eine Bonusaktion ausführen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a 20-foot-radius Sphere of yellow, nauseating gas centered on a point within range. The cloud is Heavily Obscured. The cloud lingers in the air for the duration or until a strong wind (such as the one created by Gust of Wind) disperses it. Each creature that starts its turn in the Sphere must succeed on a Constitution saving throw or have the Poisoned condition until the end of the current turn. While Poisoned in this way, the creature can’t take an action or a Bonus Action."
    }
   ]
  }
 },
 {
  "id": "stone-shape",
  "name": {
   "de": "Stein formen",
   "en": "Stone Shape"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 4. Grades (Druide, Kleriker, Magier)",
   "en": "Level 4 Transmutation (Cleric, Druid, Wizard)"
  },
  "grad": 4,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (weicher Lehm)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (soft clay)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst einen steinernen Gegenstand von höchstens mittelgroßer Größe oder einen Abschnitt aus Stein, der in keiner Abmessung größer als 1,5 Meter sein darf, und verformst ihn nach deinen Wünschen. Du könntest beispielsweise eine Waffe, eine Statue oder eine Truhe aus einem Felsbrocken formen oder einen kleinen Durchgang in einer Mauer schaffen, die höchstens 1,5 Meter dick ist. Du könntest auch eine Steintür oder ihren Rahmen teilweise umformen, um sie zu versiegeln. Der von dir erschaffene Gegenstand kann bis zu zwei Scharniere und einen Riegel besitzen, feinere mechanische Details sind jedoch nicht möglich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape you like. For example, you could shape a large rock into a weapon, statue, or coffer, or you could make a small passage through a wall that is 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn’t possible."
    }
   ]
  }
 },
 {
  "id": "stoneskin",
  "name": {
   "de": "Steinhaut",
   "en": "Stoneskin"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 4. Grades (Druide, Magier, Waldläufer, Zauberer)",
   "en": "Level 4 Transmutation (Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Diamantstaub im Wert von mindestens 100 GM, den der Zauber verbraucht)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (diamond dust worth 100+ GP, which the spell consumes)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Bis der Zauber endet, ist eine bereitwillige Kreatur, die du berührst, gegen Hieb ‑, Stich‑ und Wuchtschaden resistent."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Until the spell ends, one willing creature you touch has Resistance to Bludgeoning, Piercing, and Slashing damage."
    }
   ]
  }
 },
 {
  "id": "storm-of-vengeance",
  "name": {
   "de": "Sturm der Vergeltung",
   "en": "Storm of Vengeance"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 9. Grades (Druide)",
   "en": "Level 9 Conjuration (Druid)"
  },
  "grad": 9,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "1,6 Kilometer",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "1 mile",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer bildet sich um einen Punkt in Reichweite eine brodelnde Sturmwolke, die sich in einem Radius von 90 Metern ausbreitet. Jede Kreatur unter der Wolke muss einen Konstitutionsrettungswurf bestehen, oder sie erleidet 2W6 Schallschaden und ist für die Wirkungsdauer taub. Zu Beginn jedes deiner folgenden Züge bringt die Sturmwolke andere Effekte hervor wie unten ausgeführt."
    },
    {
     "typ": "punkt",
     "text": "Runde 2: Es fällt Säureregen. Alle Kreaturen und Gegenstände unter der Wolke erleiden 4W6 Säureschaden."
    },
    {
     "typ": "punkt",
     "text": "Runde 3: Du rufst sechs Blitze aus der Wolke hervor, die sechs verschiedene Kreaturen oder Gegenstände darunter treffen. Jedes Ziel muss einen Geschicklichkeitsrettungswurf ausführen. Misslingt der Wurf, so erleidet es 10W6 Blitzschaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Runde 4: Hagelkörner prasseln herab. Jede Kreatur unter der Wolke erleidet 2W6 Wuchtschaden."
    },
    {
     "typ": "punkt",
     "text": "Runden 5–10: Durch den Bereich unter der Wolke peitschen Windstöße und Eisregen. Jede Kreatur im Bereich erleidet 1W6 Kälteschaden. Bis der Zauber endet, ist der Bereich schwieriges Gelände sowie komplett verschleiert, Fernkampfangriffe mit Waffen sind darin nicht möglich, und es fegen starke Stürme hindurch."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A churning storm cloud forms for the duration, centered on a point within range and spreading to a radius of 300 feet. Each creature under the cloud when it appears must succeed on a Constitution saving throw or take 2d6 Thunder damage and have the Deafened condition for the duration. At the start of each of your later turns, the storm produces different effects, as detailed below."
    },
    {
     "typ": "punkt",
     "text": "Turn 2. Acidic rain falls. Each creature and object under the cloud takes 4d6 Acid damage."
    },
    {
     "typ": "punkt",
     "text": "Turn 3. You call six bolts of lightning from the cloud to strike six different creatures or objects beneath it. Each target makes a Dexterity saving throw, taking 10d6 Lightning damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Turn 4. Hailstones rain down. Each creature under the cloud takes 2d6 Bludgeoning damage."
    },
    {
     "typ": "punkt",
     "text": "Turns 5–10. Gusts and freezing rain assail the area under the cloud. Each creature there takes 1d6 Cold damage. Until the spell ends, the area is Difficult Terrain and Heavily Obscured, ranged attacks with weapons are impossible there, and strong wind blows through the area."
    }
   ]
  }
 },
 {
  "id": "suggestion",
  "name": {
   "de": "Einflüsterung",
   "en": "Suggestion"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 2. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 2 Enchantment (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 2,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, M (ein Tropfen Honig)",
    "dauer": "Konzentration, bis zu 8 Stunden"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, M (a drop of honey)",
    "dauer": "Concentration, up to 8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du schlägst einer Kreatur in Reichweite, die du sehen kannst und die dich hören und verstehen kann, mit höchstens 25 Worten eine Vorgehensweise vor. Der Vorschlag muss realistisch klingen und darf nichts enthalten, was dem Ziel oder seinen Verbündeten Schaden zufügen würde. Du könntest beispielsweise sagen: „Holt den Schlüssel zur Schatzkammer des Kults und gebt ihn mir.“ Oder du könntest sagen: „Hört auf zu kämpfen, verlasst diese Bibliothek friedlich und kehrt nicht zurück.“ Das Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist für die Wirkungsdauer – oder bis du oder deine Verbündeten ihm Schaden zufügen – bezaubert. Das bezauberte Ziel führt den Vorschlag nach besten Kräften aus. Die vorgeschlagene Aktivität kann während der gesamten Wirkungsdauer fortgesetzt werden. Wenn sie jedoch in kürzerer Zeit abgeschlossen werden kann, endet der Zauber beim Ziel, sobald es die Aktivität ausgeführt hat."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You suggest a course of activity—described in no more than 25 words—to one creature you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to the target or its allies. For example, you could say, “Fetch the key to the cult’s treasure vault, and give the key to me.” Or you could say, “Stop fighting, leave this library peacefully, and don’t return.” The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. The Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for the target upon completing it."
    }
   ]
  }
 },
 {
  "id": "summon-dragon",
  "name": {
   "de": "Drachen herbeirufen",
   "en": "Summon Dragon"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 5. Grades (Magier)",
   "en": "Level 5 Conjuration (Wizard)"
  },
  "grad": 5,
  "schule": "beschwoerung",
  "klassen": [
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Gegenstand mit eingraviertem Drachenbildnis im Wert von mindestens 500 GM)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (an object with the image of a dragon engraved on it worth 500+ GP)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du rufst einen Drachengeist herbei. Er erscheint in einem freien Bereich in Reichweite, den du sehen kannst, und verwendet den Wertekasten eines Drakonischen Geists. Die Kreatur verschwindet, wenn ihre Trefferpunkte auf 0 sinken oder der Zauber endet. Die Kreatur ist mit dir und deinen Verbündeten verbündet. Im Kampf nutzt sie deinen Initiativewert und ist direkt nach dir am Zug. Sie gehorcht deinen mündlichen Befehlen (keine Aktion deinerseits erforderlich). Befiehlst du ihr nichts, so führt sie die Ausweichaktion aus und nutzt ihre Bewegung, um Gefahren zu vermeiden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Verwende den Zauberplatzgrad als Zaubergrad im Wertekasten."
    },
    {
     "typ": "liste",
     "titel": "Drakonischer Geist",
     "eintraege": [
      "Großer Drache, neutral",
      "RK 14 + Zaubergrad",
      "TP 50 + 10 für jeden Zaubergrad ab dem 6.",
      "Bewegungsrate 9 m, Fliegen 18 m, Schwimmen 9 m MOD RW MOD RW MOD RW",
      "Stä 19 +4 +4 GeS 14 +2 +2 Kon 17 +3 +3",
      "Int 10 +0 +0 WeI 14 +2 +2 Cha 14 +2 +2",
      "Resistenzen Blitz, Feuer, Gift, Kälte, Säure",
      "Immunitäten Bezaubert, Verängstigt, Vergiftet",
      "Sinne Blindsicht 9 m, Dunkelsicht 18 m; Passive Wahrnehmung 12",
      "Sprachen Drakonisch, versteht die Sprachen, die du kennst",
      "HG − (EP 0, ÜB entspricht deinem Übungsbonus)",
      "Merkmale",
      "Gemeinsame Resistenzen: Wenn du den Geist herbeirufst, wähle eine seiner Resistenzen aus. Du bist gegen die ausgewählte Schadensart resistent, bis der Zauber endet.",
      "Aktionen",
      "Mehrfachangriff: Der Geist führt eine Anzahl von Zerfetzen-Angriffen in Höhe der Hälfte des Zaubergrades (abgerundet) aus und setzt seine Odemwaffe ein.",
      "Zerfetzen: Nahkampfangriffswurf: Bonus in Höhe deines Zauberangriff-Modifikators, Reichweite 3 m. Treffer: 1W6+4 + Zaubergrad Stichschaden.",
      "Odemwaffe: Geschicklichkeitsrettungswurf: Der SG entspricht deinem Zauberrettungswurf-SG, alle Kreaturen in einem Kegel von neun Metern. Misserfolg: 2W6 Schaden von einer Art, gegen die dieser Geist resistent ist (nach deiner Wahl beim Wirken des Zaubers). Erfolg: Halber Schaden."
     ]
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You call forth a Dragon spirit. It manifests in an unoccupied space that you can see within range and uses the Draconic Spirit stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends. The creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don’t issue any, it takes the Dodge action and uses its movement to avoid danger."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Use the spell slot’s level for the spell’s level in the stat block."
    },
    {
     "typ": "liste",
     "titel": "Draconic Spirit",
     "eintraege": [
      "Large Dragon, Neutral",
      "AC 14 + the spell’s level",
      "HP 50 + 10 for each spell level above 5",
      "Speed 30 ft., Fly 60 ft., Swim 30 ft. MOD SAVE MOD SAVE MOD SAVE",
      "Str 19 +4 +4 dex 14 +2 +2 con 17 +3 +3",
      "int 10 +0 +0 WiS 14 +2 +2 chA 14 +2 +2",
      "Resistances Acid, Cold, Fire, Lightning, Poison",
      "Immunities Charmed, Frightened, Poisoned",
      "Senses Blindsight 30 ft., Darkvision 60 ft.; Passive Perception 12",
      "Languages Draconic, understands the languages you know",
      "CR None (XP 0; PB equals your Proficiency Bonus)",
      "Traits",
      "Shared Resistances. When you summon the spirit, choose one of its Resistances. You have Resistance to the chosen damage type until the spell ends.",
      "Actions",
      "Multiattack. The spirit makes a number of Rend attacks equal to half the spell’s level (round down), and it uses Breath Weapon.",
      "Rend. Melee Attack Roll: Bonus equals your spell attack modifier, reach 10 feet. Hit: 1d6 + 4 + the spell’s level Piercing damage.",
      "Breath Weapon. Dexterity Saving Throw: DC equals your spell save DC, each creature in a 30-foot Cone. Failure: 2d6 damage of a type this spirit has Resistance to (your choice when you cast the spell). Success: Half damage."
     ]
    }
   ]
  }
 },
 {
  "id": "sunbeam",
  "name": {
   "de": "Sonnenstrahl",
   "en": "Sunbeam"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 6. Grades (Druide, Kleriker, Magier, Zauberer)",
   "en": "Level 6 Evocation (Cleric, Druid, Sorcerer, Wizard)"
  },
  "grad": 6,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine Lupe)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S, M (a magnifying glass)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du verschießt einen Sonnenstrahl in einer 1,5 Meter breiten und 18 Meter langen Linie. Jede Kreatur in der Linie führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 6W8 gleißenden Schaden und ist bis zum Beginn deines nächsten Zugs blind. Bei einem erfolgreichen Rettungswurf erleidet das Ziel nur halb so viel Schaden. Bis der Zauber endet, kannst du eine magische Aktion ausführen, um eine neue gleißende Linie zu erschaffen. Für die Wirkungsdauer erstrahlt ein heller Funke über dir. Er spendet in einem Radius von neun Metern helles Licht und in einem Radius von weiteren neun Metern dämmriges Licht. Beim Licht handelt es sich um Sonnenlicht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You launch a sunbeam in a 5-foot-wide, 60-foot-long Line. Each creature in the Line makes a Constitution saving throw. On a failed save, a creature takes 6d8 Radiant damage and has the Blinded condition until the start of your next turn. On a successful save, it takes half as much damage only. Until the spell ends, you can take a Magic action to create a new Line of radiance. For the duration, a mote of brilliant radiance shines above you. It sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. This light is sunlight."
    }
   ]
  }
 },
 {
  "id": "sunburst",
  "name": {
   "de": "Sonnenfeuer",
   "en": "Sunburst"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 8. Grades (Druide, Kleriker, Magier, Zauberer)",
   "en": "Level 8 Evocation (Cleric, Druid, Sorcerer, Wizard)"
  },
  "grad": 8,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (ein Stück Sonnenstein)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (a piece of sunstone)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Eine Kugel mit einem Radius von 18 Metern um einen Punkt deiner Wahl in Reichweite wird von gleißendem Sonnenlicht erfüllt. Jede Kreatur in der Linie führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 12W6 gleißenden Schaden und ist eine Minute lang blind. Bei einem erfolgreichen Rettungswurf erleidet das Ziel nur halb so viel Schaden. Eine von diesem Zauber geblendete Kreatur führt am Ende jedes ihrer Züge einen weiteren Konstitutionsrettungswurf aus. Bei einem Erfolg endet der Effekt bei ihr. Dieser Zauber bannt durch beliebige Zauber erschaffene Dunkelheit im Bereich."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Brilliant sunlight flashes in a 60-foot-radius Sphere centered on a point you choose within range. Each creature in the Sphere makes a Constitution saving throw. On a failed save, a creature takes 12d6 Radiant damage and has the Blinded condition for 1 minute. On a successful save, it takes half as much damage only. A creature Blinded by this spell makes another Constitution saving throw at the end of each of its turns, ending the effect on itself on a success. This spell dispels Darkness in its area that was created by any spell."
    }
   ]
  }
 },
 {
  "id": "symbol",
  "name": {
   "de": "Symbol",
   "en": "Symbol"
  },
  "gradzeile": {
   "de": "Bannzauber 7. Grades (Barde, Druide, Kleriker, Magier)",
   "en": "Level 7 Abjuration (Bard, Cleric, Druid, Wizard)"
  },
  "grad": 7,
  "schule": "bann",
  "klassen": [
   "barde",
   "druide",
   "kleriker",
   "magier"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Diamantpulver im Wert von mindestens 1.000 GM, das der Zauber verbraucht)",
    "dauer": "Bis der Zauber gebannt oder die Glyphe ausgelöst wird"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "Touch",
    "komponenten": "V, S, M (powdered diamond worth 1,000+ GP, which the spell consumes)",
    "dauer": "Until dispelled or triggered"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du zeichnest eine schädliche Glyphe entweder auf eine Oberfläche (wie den Fußboden oder eine Wand) oder in einen Gegenstand (wie ein Buch oder eine Truhe), der geschlossen werden kann. Die Glyphe kann höchstens in einem Radius von 1,5 Metern wirken. Wählst du einen Gegenstand aus, so muss dieser an seinem Standort bleiben. Wenn er um mehr als drei Meter von der Stelle entfernt wird, an der du den Zauber gewirkt hast, wird die Glyphe zerstört, und der Zauber endet, ohne ausgelöst zu werden. Die Glyphe ist kaum wahrnehmbar. Es ist ein erfolgreicher Weisheitswurf (Wahrnehmung) gegen deinen Zauberrettungswurf‑SG erforderlich, um sie zu bemerken. Wenn du die Glyphe zeichnest, bestimmst du ihren Auslöser und entscheidest, welchen Effekt das Symbol trägt: Betäubung, Furcht, Schlaf, Schmerz, Tod oder Zwietracht. Die Effekte sind unten erläutert."
    },
    {
     "typ": "punkt",
     "text": "Auslöser bestimmen: Wenn du den Zauber wirkst, bestimmst du einen Auslöser für die Glyphe. Glyphen auf Oberflächen werden meist dadurch ausgelöst, dass jemand sie berührt oder betritt, einen Gegenstand bewegt, der die Glyphe verdeckt, oder einen Mindestabstand zur Glyphe unterschreitet. Glyphen in Gegenständen werden meist dadurch ausgelöst, dass jemand den Gegenstand öffnet oder die Glyphe sieht. Du kannst den Auslöser verfeinern, sodass die Glyphe nur von bestimmten Kreaturentypen ausgelöst wird (beispielsweise könnte die Glyphe nur auf Aberrationen wirken). Du kannst auch Bedingungen festlegen, unter denen die Glyphe nicht ausgelöst wird, beispielsweise wenn ein bestimmtes Kennwort ausgesprochen wird. Sobald die Glyphe ausgelöst wurde, beginnt sie zu leuchten und erfüllt eine Kugel mit einem Radius von 18 Metern zehn Minuten lang mit dämmrigem Licht. Danach endet der Zauber. Jede Kreatur, die sich beim Aktivieren der Glyphe in der Kugel befindet, diese in ihrem Zug erstmals betritt oder ihren Zug darin beendet, wird zum Ziel des vorher festgelegten Effekts. Eine Kreatur kann nur einmal pro Zug zum Ziel werden."
    },
    {
     "typ": "punkt",
     "text": "Betäubung: Jedes Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist eine Minute lang betäubt."
    },
    {
     "typ": "punkt",
     "text": "Furcht: Jedes Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist eine Minute lang verängstigt. Ein verängstigtes Ziel muss sich in jedem seiner Züge um mindestens neun Meter von der Glyphe entfernen, sofern dies möglich ist."
    },
    {
     "typ": "punkt",
     "text": "Schlaf: Jedes Ziel muss einen Weisheitsrettungswurf bestehen, oder es ist zehn Minuten lang bewusstlos. Eine Kreatur erwacht, wenn sie Schaden erleidet oder jemand eine Aktion ausführt, um sie wachzurütteln."
    },
    {
     "typ": "punkt",
     "text": "Schmerz: Jedes Ziel muss einen Konstitutionsrettungswurf bestehen, oder es ist eine Minute lang kampfunfähig."
    },
    {
     "typ": "punkt",
     "text": "Tod: Jedes Ziel führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet das Ziel 10W10 nekrotischen Schaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Zwietracht: Jedes Ziel führt einen Weisheitsrettungswurf aus. Misslingt der Wurf, so streitet sich das Ziel eine Minute lang mit anderen Kreaturen. Während dieser Zeit ist es nicht zu sinnvollen Gesprächen in der Lage und bei Angriffs ‑ sowie Attributswürfen im Nachteil."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You inscribe a harmful glyph either on a surface (such as a section of floor or wall) or within an object that can be closed (such as a book or chest). The glyph can cover an area no larger than 10 feet in diameter. If you choose an object, it must remain in place; if it is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered. The glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice. When you inscribe the glyph, you set its trigger and choose which effect the symbol bears: Death, Discord, Fear, Pain, Sleep, or Stunning. Each one is explained below."
    },
    {
     "typ": "punkt",
     "text": "Set the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph. You can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don’t trigger the glyph, such as those who say a certain password. Once triggered, the glyph glows, filling a 60-foot-radius Sphere with Dim Light for 10 minutes, after which time the spell ends. Each creature in the Sphere when the glyph activates is targeted by its effect, as is a creature that enters the Sphere for the first time on a turn or ends its turn there. A creature is targeted only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Death. Each target makes a Constitution saving throw, taking 10d10 Necrotic damage on a failed save or half as much damage on a successful save."
    },
    {
     "typ": "punkt",
     "text": "Discord. Each target makes a Wisdom saving throw. On a failed save, a target argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has Disadvantage on attack rolls and ability checks."
    },
    {
     "typ": "punkt",
     "text": "Fear. Each target must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute. While Frightened, the target must move at least 30 feet away from the glyph on each of its turns, if able."
    },
    {
     "typ": "punkt",
     "text": "Pain. Each target must succeed on a Constitution saving throw or have the Incapacitated condition for 1 minute."
    },
    {
     "typ": "punkt",
     "text": "Sleep. Each target must succeed on a Wisdom saving throw or have the Unconscious condition for 10 minutes. A creature awakens if it takes damage or if someone takes an action to shake it awake."
    },
    {
     "typ": "punkt",
     "text": "Stunning. Each target must succeed on a Wisdom saving throw or have the Stunned condition for 1 minute."
    }
   ]
  }
 },
 {
  "id": "telekinesis",
  "name": {
   "de": "Telekinese",
   "en": "Telekinesis"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 5. Grades (Magier, Zauberer)",
   "en": "Level 5 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst die Fähigkeit, Kreaturen oder Gegenstände mit deinen Gedanken zu bewegen oder zu manipulieren. Wenn du den Zauber wirkst – und als magische Aktion in deinen folgenden Zügen, ehe der Zauber endet –, kannst du deinen Willen auf ein Ziel (Kreatur oder Gegenstand) in Reichweite richten, das du sehen kannst, und den entsprechenden Effekt auslösen. Du kannst in jeder Runde dasselbe Ziel beeinflussen oder ein neues auswählen. Wenn du das Ziel wechselst, ist das vorige nicht mehr vom Zauber betroffen."
    },
    {
     "typ": "punkt",
     "text": "Kreatur: Du kannst versuchen, eine Kreatur von höchstens riesiger Größe zu bewegen. Das Ziel muss einen Stärkerettungswurf bestehen, oder du bewegst es um bis zu neun Meter in eine beliebige Richtung in Reichweite des Zaubers. Die Kreatur ist bis zum Ende deines nächsten Zugs festgesetzt, und wenn du sie in die Luft hebst, schwebt sie und verbleibt dort. Am Ende deines nächsten Zugs fällt sie herunter, sofern du diese Option nicht erneut auf sie anwendest und ihr Rettungswurf misslingt."
    },
    {
     "typ": "punkt",
     "text": "Gegenstand: Du kannst versuchen, einen Gegenstand von höchstens riesiger Größe zu bewegen. Wird der Gegenstand weder getragen noch gehalten, so bewegst du ihn automatisch um bis zu neun Meter in eine beliebige Richtung in Reichweite des Zaubers. Wenn der Gegenstand von einer Kreatur getragen oder gehalten wird, muss diese Kreatur einen Stärkerettungswurf bestehen, oder du entwindest ihr den Gegenstand und bewegst ihn um bis zu neun Meter in eine beliebige Richtung in Reichweite des Zaubers. Du kannst mit deinem telekinetischen Griff Gegenstände präzise steuern, beispielsweise ein einfaches Werkzeug verwenden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell and as a Magic action on your later turns before the spell ends, you can exert your will on one creature or object that you can see within range, causing the appropriate effect below. You can affect the same target round after round or choose a new one at any time. If you switch targets, the prior target is no longer affected by the spell."
    },
    {
     "typ": "punkt",
     "text": "Creature. You can try to move a Huge or smaller creature. The target must succeed on a Strength saving throw, or you move it up to 30 feet in any direction within the spell’s range. Until the end of your next turn, the creature has the Restrained condition, and if you lift it into the air, it is suspended there. It falls at the end of your next turn unless you use this option on it again and it fails the save."
    },
    {
     "typ": "punkt",
     "text": "Object. You can try to move a Huge or smaller object. If the object isn’t being worn or carried, you automatically move it up to 30 feet in any direction within the spell’s range. If the object is worn or carried by a creature, that creature must succeed on a Strength saving throw, or you pull the object away and move it up to 30 feet in any direction within the spell’s range. You can exert fine control on objects with your telekinetic grip, such as manipulating a simple tool,"
    }
   ]
  }
 },
 {
  "id": "telepathic-bond",
  "name": {
   "de": "Telepathische Bindung",
   "en": "Telepathic Bond"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 5. Grades (Barde, Magier)",
   "en": "Level 5 Divination (Bard, Wizard)"
  },
  "grad": 5,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (zwei Eier)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (two eggs)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst zwischen bis zu acht bereitwilligen Kreaturen deiner Wahl in Reichweite eine telepathische Verbindung. Dadurch sind alle Kreaturen für die Wirkungsdauer psychisch miteinander verbunden. Kreaturen, die in keiner Sprache kommunizieren können, sind von diesem Zauber nicht betroffen. Bis der Zauber endet, können die Ziele telepathisch miteinander kommunizieren, unabhängig davon, ob sie eine gemeinsame Sprache sprechen. Die Kommunikation ist auf jede Entfernung möglich, reicht allerdings nicht bis auf andere Existenzebenen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You forge a telepathic link among up to eight willing creatures of your choice within range, psychically linking each creature to all the others for the duration. Creatures that can’t communicate in any languages aren’t affected by this spell. Until the spell ends, the targets can communicate telepathically through the bond whether or not they share a language. The communication is possible over any distance, though it can’t extend to other planes of existence."
    }
   ]
  }
 },
 {
  "id": "teleport",
  "name": {
   "de": "Teleportieren",
   "en": "Teleport"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 7. Grades (Barde, Magier, Zauberer)",
   "en": "Level 7 Conjuration (Bard, Sorcerer, Wizard)"
  },
  "grad": 7,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "3 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "10 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber transportiert dich und bis zu acht bereitwillige Kreaturen (oder aber einen Gegenstand) in Reichweite, die du sehen kannst, sofort an einen von dir gewählten Ort. Ein Gegenstand muss von höchstens großer Größe sein und darf nicht von einer Kreatur gehalten oder getragen werden, die nicht bereitwillig ist. Der Zielort muss dir bekannt sein und sich auf derselben Existenzebene wie du befinden. Deine Vertrautheit mit dem Zielort bestimmt, ob du erfolgreich dort eintriffst. Der SL würfelt mit 1W100 und konsultiert die Tabelle „Ergebnis der Teleportation“ sowie die entsprechenden Erläuterungen."
    },
    {
     "typ": "tabelle",
     "titel": "Ergebnis der Teleportation",
     "kopf": [
      "Vertrautheit",
      "Missgeschick",
      "Ähnliches Gebiet",
      "Abseits des Zielorts",
      "Am Zielort"
     ],
     "reihen": [
      [
       "Dauerhafter Kreis",
       "−",
       "−",
       "−",
       "1–100"
      ],
      [
       "Bezugsgegenstand",
       "−",
       "−",
       "−",
       "1–100"
      ],
      [
       "Sehr vertraut",
       "1–5",
       "6–13",
       "14–24",
       "25–100"
      ],
      [
       "Mehrfach gesehen",
       "1–33",
       "34–43",
       "44–53",
       "54–100"
      ],
      [
       "Einmal gesehen oder Beschreibung erhalten",
       "1–43",
       "44–53",
       "54–73",
       "74–100"
      ],
      [
       "Falscher Zielort",
       "1–50",
       "51–100",
       "−",
       "−"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Vertrautheit: Hier werden die Bedeutungen der Begriffe in der Spalte „Vertrautheit“ der Tabelle erläutert: • Mit „Dauerhafter Kreis“ ist ein dauerhafter Kreis der Teleportation gemeint, dessen Siegelsequenz dir bekannt ist. • „Bezugsgegenstand“ bedeutet, dass du einen Gegenstand besitzt, der innerhalb der letzten sechs Monate vom gewünschten Zielort genommen wurde, beispielsweise ein Buch aus der Bibliothek eines Magiers. • „Sehr vertraut“ beschreibt einen Ort, den du oft aufgesucht oder genau studiert hast oder den du beim Wirken des Zaubers sehen kannst. • „Mehrfach gesehen“ bezeichnet einen Ort, den du mehr als einmal gesehen hast, mit dem du jedoch nicht sehr vertraut bist. • „Einmal gesehen oder Beschreibung erhalten“ beschreibt einen Ort, den du einmal gesehen hast, wahrscheinlich durch Magie, oder der dir beschrieben wurde, vielleicht anhand einer Karte. • „Falscher Zielort“ bedeutet, dass ein Ort nicht existiert. Vielleicht hast du versucht, das Sanktum eines Gegners magisch auszuspähen, konntest jedoch nur eine Illusion sehen. Oder du versuchst, dich ein einen Ort zu teleportieren, der nicht mehr existiert."
    },
    {
     "typ": "punkt",
     "text": "Missgeschick: Die unberechenbare Magie des Zaubers führt zu einer unglückseligen Reise. Jede teleportierte Kreatur (oder der Zielgegenstand) erleidet 3W10 Energieschaden. Zudem würfelt der SL anhand der Tabelle, um zu bestimmen, wo ihr landet. Es kann zu mehreren Missgeschicken kommen, die jeweils Schaden bewirken."
    },
    {
     "typ": "punkt",
     "text": "Ähnliches Gebiet: Du erscheinst mit deiner Gruppe (oder dem Gegenstand) in einem anderen Gebiet, das dem Zielort visuell oder thematisch ähnlich ist. Du erscheinst am nächstgelegenen ähnlichen Ort. Wenn du beispielsweise in dein Labor teleportieren wolltest, könntest du in das Labor einer anderen Person in der gleichen Stadt gelangen."
    },
    {
     "typ": "punkt",
     "text": "Abseits des Zielorts: Du erscheinst mit deiner Gruppe (oder dem Gegenstand) in 2W12 mal 1,6 Kilometern abseits des Zielorts. Würfle mit 1W8, um die Richtung zu bestimmen: 1: Osten, 2: Südosten, 3: Süden, 4: Südwesten, 5: Westen, 6: Nordwesten, 7: Norden, 8: Nordosten."
    },
    {
     "typ": "punkt",
     "text": "Am Zielort: Du erscheinst mit deiner Gruppe (oder dem Gegenstand) dort, wo du hinwolltest."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell instantly transports you and up to eight willing creatures that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be Large or smaller, and it can’t be held or carried by an unwilling creature. The destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The GM rolls 1d100 and consults the Teleportation Outcome table and the explanations after it."
    },
    {
     "typ": "tabelle",
     "titel": "Teleportation Outcome",
     "kopf": [
      "Familiarity",
      "Mishap",
      "Similar Area",
      "Off Target",
      "On Target"
     ],
     "reihen": [
      [
       "Permanent circle",
       "—",
       "—",
       "—",
       "01–00"
      ],
      [
       "Linked object",
       "—",
       "—",
       "—",
       "01–00"
      ],
      [
       "Very familiar",
       "01–05",
       "06–13",
       "14–24",
       "25–00"
      ],
      [
       "Seen casually",
       "01–33",
       "34–43",
       "44–53",
       "54–00"
      ],
      [
       "Viewed once or described",
       "01–43",
       "44–53",
       "54–73",
       "74–00"
      ],
      [
       "False destination",
       "01–50",
       "51–00",
       "—",
       "—"
      ]
     ]
    },
    {
     "typ": "punkt",
     "text": "Familiarity. Here are the meanings of the terms in the table’s Familiarity column: • “Permanent circle” means a permanent teleportation circle whose sigil sequence you know. • “Linked object” means you possess an object taken from the desired destination within the last six months, such as a book from a wizard’s library. • “Very familiar” is a place you have visited often, a place you have carefully studied, or a place you can see when you cast the spell. • “Seen casually” is a place you have seen more than once but with which you aren’t very familiar. • “Viewed once or described” is a place you have seen once, possibly using magic, or a place you know through someone else’s description, perhaps from a map. • “False destination” is a place that doesn’t exist. Perhaps you tried to scry an enemy’s sanctum but instead viewed an illusion, or you are attempting to teleport to a location that no longer exists."
    },
    {
     "typ": "punkt",
     "text": "Mishap. The spell’s unpredictable magic results in a difficult journey. Each teleporting creature (or the target object) takes 3d10 Force damage, and the GM rerolls on the table to see where you wind up (multiple mishaps can occur, dealing damage each time)."
    },
    {
     "typ": "punkt",
     "text": "Similar Area. You and your group (or the target object) appear in a different area that’s visually or thematically similar to the target area. You appear in the closest similar place. If you are heading for your home laboratory, for example, you might appear in another person’s laboratory in the same city."
    },
    {
     "typ": "punkt",
     "text": "Off Target. You and your group (or the target object) appear 2d12 miles away from the destination in a random direction. Roll 1d8 for the direction: 1, east; 2, southeast; 3, south; 4, southwest; 5, west; 6, northwest; 7, north; or 8, northeast."
    },
    {
     "typ": "punkt",
     "text": "On Target. You and your group (or the target object) appear where you intended."
    }
   ]
  }
 },
 {
  "id": "teleportation-circle",
  "name": {
   "de": "Kreis der Teleportation",
   "en": "Teleportation Circle"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 5. Grades (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Level 5 Conjuration (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 5,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "3 Meter",
    "komponenten": "V, M (seltene Tinten im Wert von mindestens 50 GM, die der Zauber verbraucht)",
    "dauer": "1 Runde"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "10 feet",
    "komponenten": "V, M (rare inks worth 50+ GP, which the spell consumes)",
    "dauer": "1 round"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wenn du den Zauber wirkst, zeichnest du einen Kreis mit einem Radius von 1,5 Metern auf den Boden. In den Kreis arbeitest du Siegel ein, die deine aktuelle Position mit einem anderen dauerhaften Kreis der Teleportation deiner Wahl verbinden, dessen Siegel sequenz du kennst und der sich auf derselben Existenzebene befindet. Im Kreis öffnet sich ein schimmerndes Portal, das bis zum Ende deines nächsten Zugs geöffnet bleibt. Jede Kreatur, die durch das Portal tritt, erscheint sofort in einem freien Bereich im Abstand von bis zu 1,5 Metern um den Zielkreis, falls verfügbar, ansonsten im nächsten freien Bereich. Viele größere Tempel, Gildenhallen und weitere wichtige Orte verfügen über dauerhafte Kreise der Teleportation. Jeder Kreis besitzt eine einzigartige Siegelsequenz, eine Reihe von Runen, die in einem bestimmten Muster angeordnet sind. Wenn du diesen Zauber erlernst, erhältst du die Siegelsequenzen zweier Zielorte auf der materiellen Ebene nach Wahl des SL. Im Laufe deiner Abenteuer könntest du weitere Siegelsequenzen erfahren. Um eine neue Siegelsequenz zu erlernen, musst du sie eine Minute lang studieren. Wenn du diesen Zauber 365 Tage lang täglich am selben Ort wirkst, erschaffst du einen dauerhaften Kreis der Teleportation."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "As you cast the spell, you draw a 5-foot-radius circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space if that space is occupied. Many major temples, guildhalls, and other important places have permanent teleportation circles. Each circle includes a unique sigil sequence—a string of runes arranged in a particular pattern. When you first gain the ability to cast this spell, you learn the sigil sequences for two destinations on the Material Plane, determined by the GM. You might learn additional sigil sequences during your adventures. You can commit a new sigil sequence to memory after studying it for 1 minute. You can create a permanent teleportation circle by casting this spell in the same location every day for 365 days."
    }
   ]
  }
 },
 {
  "id": "thaumaturgy",
  "name": {
   "de": "Thaumaturgie",
   "en": "Thaumaturgy"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verwandlung (Kleriker)",
   "en": "Transmutation Cantrip (Cleric)"
  },
  "grad": 0,
  "schule": "verwandlung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V",
    "dauer": "Bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V",
    "dauer": "Up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du manifestierst in Reichweite ein kleines Wunder. Du bewirkst in Reichweite einen der unten beschriebenen Effekte. Wenn du diesen Zauber mehrmals wirkst, können bis zu drei seiner einminütigen Effekte gleichzeitig wirken. Du kannst einen solchen Effekt verwerfen (keine Aktion erforderlich)."
    },
    {
     "typ": "punkt",
     "text": "Beben: Du bewirkst ein harmloses Erdbeben, das eine Minute lang andauert."
    },
    {
     "typ": "punkt",
     "text": "Dröhnende Stimme: Deine Stimme ertönt eine Minute lang bis zu dreimal so laut wie sonst. Für die Wirkungsdauer bist du bei Charismawürfen (Einschüchtern) im Vorteil."
    },
    {
     "typ": "punkt",
     "text": "Feuerspiel: Du lässt eine Minute lang Flammen auflodern, stärker oder schwächer leuchten oder ihre Farbe ändern."
    },
    {
     "typ": "punkt",
     "text": "Phantomgeräusch: Du erzeugst ein unmittelbares Geräusch, das von einem Punkt deiner Wahl in Reichweite ausgeht, beispielsweise Donnergrollen, Rabenkrächzen oder bedrohliches Flüstern."
    },
    {
     "typ": "punkt",
     "text": "Unsichtbare Hand: Du lässt unmittelbar eine unverschlossene Tür oder ein unverschlossenes Fenster auffliegen oder zuschlagen."
    },
    {
     "typ": "punkt",
     "text": "Veränderte Augen: Du veränderst für eine Minute das Aussehen deiner Augen."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You manifest a minor wonder within range. You create one of the effects below within range. If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time."
    },
    {
     "typ": "punkt",
     "text": "Altered Eyes. You alter the appearance of your eyes for 1 minute."
    },
    {
     "typ": "punkt",
     "text": "Booming Voice. Your voice booms up to three times as loud as normal for 1 minute. For the duration, you have Advantage on Charisma (Intimidation) checks."
    },
    {
     "typ": "punkt",
     "text": "Fire Play. You cause flames to flicker, brighten, dim, or change color for 1 minute."
    },
    {
     "typ": "punkt",
     "text": "Invisible Hand. You instantaneously cause an unlocked door or window to fly open or slam shut."
    },
    {
     "typ": "punkt",
     "text": "Phantom Sound. You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers."
    },
    {
     "typ": "punkt",
     "text": "Tremors. You cause harmless tremors in the ground for 1 minute."
    }
   ]
  }
 },
 {
  "id": "thunderwave",
  "name": {
   "de": "Donnerwoge",
   "en": "Thunderwave"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 1. Grades (Barde, Druide, Magier, Zauberer)",
   "en": "Level 1 Evocation (Bard, Druid, Sorcerer, Wizard)"
  },
  "grad": 1,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du entfesselst eine Welle aus donnernder Energie. Alle Kreaturen in einem Würfel mit 4,5 Metern Kantenlänge, der von dir ausgeht, führen einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet eine Kreatur 2W8 Schallschaden und wird drei Meter weit von dir weggestoßen. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur nur halb so viel Schaden. Außerdem werden Gegenstände, die sich vollständig innerhalb des Würfels befinden und nicht fixiert sind, drei Meter weit von dir weggestoßen, und der Donnerschlag ist im Abstand von bis zu 90 Metern zu hören."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 1. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You unleash a wave of thunderous energy. Each creature in a 15-foot Cube originating from you makes a Constitution saving throw. On a failed save, a creature takes 2d8 Thunder damage and is pushed 10 feet away from you. On a successful save, a creature takes half as much damage only. In addition, unsecured objects that are entirely within the Cube are pushed 10 feet away from you, and a thunderous boom is audible within 300 feet."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
    }
   ]
  }
 },
 {
  "id": "time-stop",
  "name": {
   "de": "Zeitstopp",
   "en": "Time Stop"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 9. Grades (Magier, Zauberer)",
   "en": "Level 9 Transmutation (Sorcerer, Wizard)"
  },
  "grad": 9,
  "schule": "verwandlung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du stoppst kurzzeitig für alle außer dir selbst den Fluss der Zeit. Für andere Kreaturen vergeht keine Zeit, während du 1W4+1 Züge hintereinander bekommst, in denen du wie gewohnt Aktionen ausführen und dich bewegen kannst. Dieser Zauber endet, wenn eine deiner Aktionen oder ein von dir erschaffener Effekt während dieser Zeitspanne eine Kreatur außer dir selbst oder einen Gegenstand beeinflusst, den jemand anders trägt oder hält. Zudem endet der Zauber, wenn du dich um mehr als 300 Meter von dem Ort entfernst, an dem du ihn gewirkt hast."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal. This spell ends if one of the actions you use during this period, or any effects that you create during it, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it."
    }
   ]
  }
 },
 {
  "id": "tiny-hut",
  "name": {
   "de": "Winzige Hütte",
   "en": "Tiny Hut"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 3. Grades (Barde, Magier)",
   "en": "Level 3 Evocation (Bard, Wizard)"
  },
  "grad": 3,
  "schule": "hervorrufung",
  "klassen": [
   "barde",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute oder Ritual",
    "reichweite": "Selbst",
    "komponenten": "V, G, M (eine Kristallperle)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "1 minute or Ritual",
    "reichweite": "Self",
    "komponenten": "V, S, M (a crystal bead)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Um dich herum entsteht eine Ausströmung von drei Metern und bleibt für die Wirkungsdauer ortsfest. Der Zauber misslingt beim Wirken, wenn die Ausströmung nicht groß genug ist, um alle Kreaturen in ihrem Bereich vollständig aufzunehmen. Kreaturen und Gegenstände, die sich beim Wirken des Zaubers innerhalb der Ausströmung befinden, können sich frei darin bewegen oder bewegt werden. Andere Kreaturen und Gegenstände können sie nicht passieren. Zauber des höchstens 3. Grades können nicht durch die Aura hindurch gewirkt werden, und ihre Effekte können sich nicht bis in die Aura erstrecken. Die Atmosphäre innerhalb der Ausströmung ist unabhängig vom Wetter außerhalb angenehm und trocken. Für die Wirkungsdauer kannst du befehlen, dass innerhalb der Aura dämmriges Licht oder Dunkelheit herrschen soll (keine Aktion erforderlich). Die Ausströmung ist von außen undurchsichtig und erscheint in einer Farbe deiner Wahl. Von innen ist sie durchsichtig. Der Zauber endet vorzeitig, wenn du die Ausströmung verlässt oder den Zauber erneut wirkst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A 10-foot Emanation springs into existence around you and remains stationary for the duration. The spell fails when you cast it if the Emanation isn’t big enough to fully encapsulate all creatures in its area. Creatures and objects within the Emanation when you cast the spell can move through it freely. All other creatures and objects are barred from passing through it. Spells of level 3 or lower can’t be cast through it, and the effects of such spells can’t extend into it. The atmosphere inside the Emanation is comfortable and dry, regardless of the weather outside. Until the spell ends, you can command the interior to have Dim Light or Darkness (no action required). The Emanation is opaque from the outside and of any color you choose, but it’s transparent from the inside. The spell ends early if you leave the Emanation or if you cast it again."
    }
   ]
  }
 },
 {
  "id": "tongues",
  "name": {
   "de": "Zungen",
   "en": "Tongues"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 3. Grades (Barde, Hexenmeister, Kleriker, Magier, Zauberer)",
   "en": "Level 3 Divination (Bard, Cleric, Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "hexenmeister",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, M (eine Miniatur-Zikkurat)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, M (a miniature ziggurat)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber gewährt einer von dir berührten Kreatur die Fähigkeit, jede gesprochene Sprache oder Gebärdensprache zu verstehen, die sie hört oder sieht. Wenn das Ziel außerdem durch Sprache oder Gebärden kommuniziert, wird es von jeder Kreatur verstanden, die mindestens eine Sprache versteht und das Ziel hören oder sehen kann."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell grants the creature you touch the ability to understand any spoken or signed language that it hears or sees. Moreover, when the target communicates by speaking or signing, any creature that knows at least one language can understand it if that creature can hear the speech or see the signing."
    }
   ]
  }
 },
 {
  "id": "transport-via-plants",
  "name": {
   "de": "Pflanzentor",
   "en": "Transport via Plants"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 6. Grades (Druide)",
   "en": "Level 6 Conjuration (Druid)"
  },
  "grad": 6,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "3 Meter",
    "komponenten": "V, G",
    "dauer": "1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "10 feet",
    "komponenten": "V, S",
    "dauer": "1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber erschafft eine magische Verbindung zwischen einer unbelebten Pflanze von mindestens großer Größe in Reichweite und einer anderen Pflanze in beliebiger Entfernung auf derselben Existenzebene. Du musst die Zielpflanze mindestens einmal gesehen oder berührt haben. Für die Wirkungsdauer kann jede Kreatur die verzauberte Pflanze betreten und steigt dann aus der Zielpflanze wieder heraus. Dafür benötigt sie 1,5 Meter ihrer Bewegungsrate."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement."
    }
   ]
  }
 },
 {
  "id": "tree-stride",
  "name": {
   "de": "Baumwandeln",
   "en": "Tree Stride"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 5. Grades (Druide, Waldläufer)",
   "en": "Level 5 Conjuration (Druid, Ranger)"
  },
  "grad": 5,
  "schule": "beschwoerung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erhältst die Fähigkeit, einen Baum zu betreten und aus einem anderen Baum derselben Art im Abstand von bis zu 150 Metern wieder herauszusteigen. Beide Bäume müssen lebendig und mindestens so groß wie du sein. Es kostet 1,5 Meter Bewegung, den Baum zu betreten. Du erfährst sofort die Position aller anderen Bäume derselben Art im Abstand von bis zu 150 Metern. Als Teil der Bewegung, um den Baum zu betreten, kannst du entweder in einen dieser Bäume wechseln und oder aus dem Baum heraustreten, in dem du dich befindest. Du erscheinst in einem Bereich deiner Wahl im Abstand von bis zu 1,5 Metern vom Zielbaum, was dich weitere 1,5 Meter Bewegung kostet. Hast du keine Bewegungsrate übrig, so erscheinst du im Abstand von bis zu 1,5 Metern vom Baum, den du betreten hast. Du kannst diese Transportmöglichkeit nur einmal in jedem deiner Züge anwenden. Du musst jeden Zug außerhalb eines Baums beenden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You gain the ability to enter a tree and move from inside it to inside another tree of the same kind within 500 feet. Both trees must be living and at least the same size as you. You must use 5 feet of movement to enter a tree. You instantly know the location of all other trees of the same kind within 500 feet and, as part of the move used to enter the tree, can either pass into one of those trees or step out of the tree you’re in. You appear in a spot of your choice within 5 feet of the destination tree, using another 5 feet of movement. If you have no movement left, you appear within 5 feet of the tree you entered. You can use this transportation ability only once on each of your turns. You must end each turn outside a tree."
    }
   ]
  }
 },
 {
  "id": "true-polymorph",
  "name": {
   "de": "Wahre Verwandlung",
   "en": "True Polymorph"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 9. Grades (Barde, Hexenmeister, Magier)",
   "en": "Level 9 Transmutation (Bard, Warlock, Wizard)"
  },
  "grad": 9,
  "schule": "verwandlung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Tropfen Quecksilber, ein Stück Gummiarabikum und eine Rauchschwade)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a drop of mercury, a dollop of gum arabic, and a wisp of smoke)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wähle ein Ziel – eine Kreatur oder einen nichtmagischen Gegenstand – in Reichweite aus, das du sehen kannst. Eine Kreatur verwandelt sich in eine andere Kreatur oder einen nichtmagischen Gegenstand. Ein Gegenstand, der weder getragen noch gehalten werden darf, verwandelt sich in eine Kreatur. Die Verwandlung bleibt für die Wirkungsdauer bestehen, sofern das Ziel nicht stirbt oder zerstört wird. Wenn du allerdings deine Konzentration auf diesen Zauber für die gesamte Wirkungsdauer aufrechterhältst, wirkt der Zauber, bis er gebannt wird. Eine nicht bereitwillige Kreatur kann einen Weisheitsrettungswurf ausführen. Bei einem Erfolg ist sie nicht von diesem Zauber betroffen."
    },
    {
     "typ": "punkt",
     "text": "Kreatur in Kreatur: Verwandelst du eine Kreatur in eine andere Kreatur, so kannst du eine beliebige Gestalt wählen, deren Herausforderungsgrad nicht höher ist als der Herausforderungsgrad oder die Stufe des Ziels. Die Spielwerte des Ziels werden durch den Wertekasten der neuen Gestalt ersetzt. Das Ziel behält jedoch Trefferpunkte, Trefferpunktewürfel, Gesinnung und Persönlichkeit bei. Das Ziel erhält eine Anzahl von temporären Trefferpunkten, die der Anzahl von Trefferpunkten der neuen Gestalt entspricht. Nach der Wirkungsdauer dieses Zaubers verbleibende temporäre Trefferpunkte gehen verloren. Das Ziel kann nur Aktionen ausführen, die in seiner neuen Gestalt anatomisch möglich sind. Es kann weder sprechen noch Zauber wirken. Die Ausrüstung des Ziels verschmilzt mit seiner neuen Gestalt. Die Kreatur kann die Ausrüstung nicht verwenden oder anderweitig nutzen."
    },
    {
     "typ": "punkt",
     "text": "Gegenstand in Kreatur: Du kannst einen Gegenstand in eine beliebige Kreatur verwandeln, sofern die Kreatur nicht größer als der Gegenstand ist und ihr Herausforderungsgrad höchstens 9 beträgt. Die Kreatur ist dir und deinen Verbündeten freundlich gesinnt. Im Kampf ist sie unmittelbar nach dir am Zug, und sie gehorcht deinen Befehlen. Wenn der Zauber länger als eine Stunde andauert, kannst du die Kreatur nicht mehr kontrollieren. Sie kann dir freundlich gesinnt bleiben, je nachdem, wie du sie behandelt hast."
    },
    {
     "typ": "punkt",
     "text": "Kreatur in Gegenstand: Verwandelst du eine Kreatur in einen Gegenstand, so verwandelt sie sich mit allem, was sie trägt und in der Hand hält. Der Gegenstand darf nicht größer sein als die Kreatur. Die Spielwerte der Kreatur werden zu denen des Gegenstands. Wenn der Zauber endet und das Ziel wieder seine ursprüngliche Gestalt annimmt, besitzt es keine Erinnerungen an die Zeit, die es als Gegenstand verbracht hat."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Choose one creature or nonmagical object that you can see within range. The creature shape-shifts into a different creature or a nonmagical object, or the object shape-shifts into a creature (the object must be neither worn nor carried). The transformation lasts for the duration or until the target dies or is destroyed, but if you maintain Concentration on this spell for the full duration, the spell lasts until dispelled. An unwilling creature can make a Wisdom saving throw, and if it succeeds, it isn’t affected by this spell."
    },
    {
     "typ": "punkt",
     "text": "Creature into Creature. If you turn a creature into another kind of creature, the new form can be any kind you choose that has a Challenge Rating equal to or less than the target’s Challenge Rating or level. The target’s game statistics are replaced by the stat block of the new form, but it retains its Hit Points, Hit Point Dice, alignment, and personality. The target gains a number of Temporary Hit Points equal to the Hit Points of the new form. These Temporary Hit Points vanish if any remain when the spell ends. The target is limited in the actions it can perform by the anatomy of its new form, and it can’t speak or cast spells. The target’s gear melds into the new form. The creature can’t use or otherwise benefit from any of that equipment."
    },
    {
     "typ": "punkt",
     "text": "Object into Creature. You can turn an object into any kind of creature, as long as the creature’s size is no larger than the object’s size and the creature has a Challenge Rating of 9 or lower. The creature is Friendly to you and your allies. In combat, it takes its turns immediately after yours, and it obeys your commands. If the spell lasts more than an hour, you no longer control the creature. It might remain Friendly to you, depending on how you have treated it."
    },
    {
     "typ": "punkt",
     "text": "Creature into Object. If you turn a creature into an object, it transforms along with whatever it is wearing and carrying into that form, as long as the object’s size is no larger than the creature’s size. The creature’s statistics become those of the object, and the creature has no memory of time spent in this form after the spell ends and it returns to normal."
    }
   ]
  }
 },
 {
  "id": "true-resurrection",
  "name": {
   "de": "Wahre Auferstehung",
   "en": "True Resurrection"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 9. Grades (Druide, Kleriker)",
   "en": "Level 9 Necromancy (Cleric, Druid)"
  },
  "grad": 9,
  "schule": "nekromantie",
  "klassen": [
   "druide",
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Stunde",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Diamanten im Wert von 25.000 GM, die der Zauber verbraucht)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "1 hour",
    "reichweite": "Touch",
    "komponenten": "V, S, M (diamonds worth 25,000+ GP, which the spell consumes)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine tote Kreatur. Ihr Tod darf höchstens 200 Jahre zurückliegen, und sie darf nicht an Altersschwäche gestorben sein. Die Kreatur wird mit allen Trefferpunkten wiederbelebt. Dieser Zauber schließt alle Wunden, neutralisiert jedes Gift, heilt alle magischen Krankheiten und bannt sämtliche Flüche, unter denen die Kreatur zum Zeitpunkt ihres Todes gelitten hat. Beschädigte oder fehlende Organe und Gliedmaßen werden ersetzt. Wenn die Kreatur untot war, wird ihre nicht‑untote Gestalt wiederhergestellt. Der Zauber kann einen neuen Körper erschaffen, wenn der ursprüngliche Körper nicht mehr existiert. In diesem Fall musst du den Namen der Kreatur aussprechen. Die Kreatur erscheint dann in einem freien Bereich deiner Wahl im Abstand von bis zu drei Metern von dir."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. The creature is revived with all its Hit Points. This spell closes all wounds, neutralizes any poison, cures all magical contagions, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs. If the creature was Undead, it is restored to its non-Undead form. The spell can provide a new body if the original no longer exists, in which case you must speak the creature’s name. The creature then appears in an unoccupied space you choose within 10 feet of you."
    }
   ]
  }
 },
 {
  "id": "true-seeing",
  "name": {
   "de": "Wahrer Blick",
   "en": "True Seeing"
  },
  "gradzeile": {
   "de": "Erkenntniszauber 6. Grades (Barde, Hexenmeister, Kleriker, Magier, Zauberer)",
   "en": "Level 6 Divination (Bard, Cleric, Sorcerer, Warlock, Wizard)"
  },
  "grad": 6,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "hexenmeister",
   "kleriker",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (Pilzpulver im Wert von mindestens 25 GM, das der Zauber verbraucht)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (mushroom powder worth 25+ GP, which the spell consumes)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Für die Wirkungsdauer hat eine bereitwillige Kreatur, die du berührst, Wahrer Blick mit einer Reichweite von 36 Metern."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "For the duration, the willing creature you touch has Truesight with a range of 120 feet."
    }
   ]
  }
 },
 {
  "id": "true-strike",
  "name": {
   "de": "Zielsicherer Schlag",
   "en": "True Strike"
  },
  "gradzeile": {
   "de": "Zaubertrick der Erkenntnis (Barde, Hexenmeister, Magier, Zauberer)",
   "en": "Divination Cantrip (Bard, Sorcerer, Warlock, Wizard)"
  },
  "grad": 0,
  "schule": "erkenntnis",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "G, M (eine Waffe, mit der du Übung hast, im Wert von mindestens 1 KM)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "S, M (a weapon with which you have proficiency and that is worth 1+ CP)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Von einem Blitz magischer Einsicht geleitet, führst du einen Angriff mit der Waffe aus, die du zum Wirken des Zaubers verwendet hast. Der Zauber nutzt dein Attribut zum Zauberwirken für den Angriff und Schadenswürfe (statt Stärke oder Geschicklichkeit). Wenn der Angriff Schaden bewirkt, kann dies gleißender Schaden oder die normale Schadensart der Waffe sein (nach deiner Wahl)."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Unabhängig davon, ob du gleißenden Schaden oder die normale Schadensart der Waffe bewirkst, bewirkt der Angriff zusätzlich gleißenden Schaden, wenn du die 5. (1W6), die 11. (2W6) und die 17. (3W6) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Guided by a flash of magical insight, you make one attack with the weapon used in the spell’s casting. The attack uses your spellcasting ability for the attack and damage rolls instead of using Strength or Dexterity. If the attack deals damage, it can be Radiant damage or the weapon’s normal damage type (your choice)."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. Whether you deal Radiant damage or the weapon’s normal damage type, the attack deals extra Radiant damage when you reach levels 5 (1d6), 11 (2d6), and 17 (3d6)."
    }
   ]
  }
 },
 {
  "id": "tsunami",
  "name": {
   "de": "Tsunami",
   "en": "Tsunami"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 8. Grades (Druide)",
   "en": "Level 8 Conjuration (Druid)"
  },
  "grad": 8,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "1,6 Kilometer",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 6 Runden"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "1 mile",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 6 rounds"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An einem Punkt deiner Wahl in Reichweite erscheint eine Wasserwand. Du kannst sie bis zu 90 Meter lang, 90 Meter hoch und 15 Meter dick sein lassen. Die Wand bleibt für die Wirkungsdauer bestehen. Wenn die Wand erscheint, führt jede Kreatur in ihrem Bereich einen Stärkerettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 6W10 Wuchtschaden, anderenfalls die Hälfte. Zu Beginn jedes deiner Züge nach Erscheinen der Wand bewegt diese sich und alle Kreaturen darin um 15 Meter von dir weg. Alle Kreaturen von höchstens riesiger Größe, die sich in der Wand befinden oder in deren Bereiche die Wand sich bewegt, müssen einen Stärkerettungswurf bestehen, oder sie erleiden 5W10 Wuchtschaden. Eine Kreatur kann diesen Schaden nur einmal pro Runde erleiden. Am Ende des Zugs ist die Höhe der Wand um 15 Meter verringert, und der Schaden, den die Wand in späteren Runden bewirkt, ist um 1W10 verringert. Wenn die Höhe der Wand auf 0 sinkt, endet der Zauber. Eine Kreatur in der Wand kann sich schwimmend bewegen. Aufgrund der Wucht der Welle muss die Kreatur jedoch einen Stärkewurf (Athletik) gegen deinen Zauberrettungswurf‑SG bestehen, um sich überhaupt bewegen zu können. Misslingt der Wurf, so kann die Kreatur sich nicht bewegen. Wenn eine Kreatur die Wand verlässt, fällt sie zu Boden."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A wall of water springs into existence at a point you choose within range. You can make the wall up to 300 feet long, 300 feet high, and 50 feet thick. The wall lasts for the duration. When the wall appears, each creature in its area makes a Strength saving throw, taking 6d10 Bludgeoning damage on a failed save or half as much damage on a successful one. At the start of each of your turns after the wall appears, the wall, along with any creatures in it, moves 50 feet away from you. Any Huge or smaller creature inside the wall or whose space the wall enters when it moves must succeed on a Strength saving throw or take 5d10 Bludgeoning damage. A creature can take this damage only once per round. At the end of the turn, the wall’s height is reduced by 50 feet, and the damage the wall deals on later rounds is reduced by 1d10. When the wall reaches 0 feet in height, the spell ends. A creature caught in the wall can move by swimming. Because of the wave’s force, though, the creature must succeed on a Strength (Athletics) check against your spell save DC to move at all. If it fails the check, it can’t move. A creature that moves out of the wall falls to the ground."
    }
   ]
  }
 },
 {
  "id": "unseen-servant",
  "name": {
   "de": "Unsichtbarer Diener",
   "en": "Unseen Servant"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 1. Grades (Barde, Hexenmeister, Magier)",
   "en": "Level 1 Conjuration (Bard, Warlock, Wizard)"
  },
  "grad": 1,
  "schule": "beschwoerung",
  "klassen": [
   "barde",
   "hexenmeister",
   "magier"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (ein Stück Schnur und etwas Holz)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a bit of string and of wood)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber erschafft eine mittelgroße unsichtbare, geist‑ und formlose Kraft, die auf deinen Befehl einfache Aufgaben erfüllt, bis der Zauber endet. Der Diener erscheint in Reichweite in einem freien Bereich auf dem Boden. Er besitzt eine RK von 10, einen Stärkewert von 2, 1 Trefferpunkt und kann nicht angreifen. Wenn seine Trefferpunkte auf 0 sinken, endet der Zauber. Als Bonusaktion kannst du in jedem deiner Züge dem Diener mental befehlen, sich um bis zu 4,5 Meter zu bewegen und mit einem Gegenstand zu interagieren. Der Diener kann einfache Aufgaben übernehmen, die auch ein Mensch ausführen könnte: Dinge holen, reinigen und reparieren, Kleidung zusammenlegen, Feuer entfachen, Speisen servieren und Getränke einschenken. Sobald du einen Befehl erteilst, erfüllt der Diener diesen nach Kräften, bis die Aufgabe erledigt ist. Dann wartet er auf deinen nächsten Befehl. Wenn du dem Diener befiehlst, sich für eine Aufgabe mehr als 18 Meter weit von dir zu entfernen, endet der Zauber."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell creates an Invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 Hit Point, and a Strength of 2, and it can’t attack. If it drops to 0 Hit Points, the spell ends. Once on each of your turns as a Bonus Action, you can mentally command the servant to move up to 15 feet and interact with an object. The servant can perform simple tasks that a human could do, such as fetching things, cleaning, mending, folding clothes, lighting fires, serving food, and pouring drinks. Once you give the command, the servant performs the task to the best of its ability until it completes the task, then waits for your next command. If you command the servant to perform a task that would move it more than 60 feet away from you, the spell ends."
    }
   ]
  }
 },
 {
  "id": "vampiric-touch",
  "name": {
   "de": "Vampirgriff",
   "en": "Vampiric Touch"
  },
  "gradzeile": {
   "de": "Nekromantiezauber 3. Grades (Hexenmeister, Magier, Zauberer)",
   "en": "Level 3 Necromancy (Sorcerer, Warlock, Wizard)"
  },
  "grad": 3,
  "schule": "nekromantie",
  "klassen": [
   "hexenmeister",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Die Berührung deiner in Schatten gehüllten Hand kann anderen Kreaturen Lebenskraft entziehen, um dich zu heilen. Führe einen Nahkampf‑Zauberangriff gegen eine Kreatur in Reichweite aus. Bei einem Treffer erleidet das Ziel 3W6 nekrotischen Schaden, und du erhältst Trefferpunkte in Höhe der Hälfte des nekrotischen Schadens zurück. Für die Wirkungsdauer kannst du in jedem deiner Züge den Angriff als magische Aktion wiederholen und dabei auf dieselbe oder auf eine andere Kreatur zielen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 3. wird der Schaden um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "The touch of your shadow-wreathed hand can siphon life force from others to heal your wounds. Make a melee spell attack against one creature within reach. On a hit, the target takes 3d6 Necrotic damage, and you regain Hit Points equal to half the amount of Necrotic damage dealt. Until the spell ends, you can make the attack again on each of your turns as a Magic action, targeting the same creature or a different one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
    }
   ]
  }
 },
 {
  "id": "vicious-mockery",
  "name": {
   "de": "Gehässiger Spott",
   "en": "Vicious Mockery"
  },
  "gradzeile": {
   "de": "Zaubertrick der Verzauberung (Barde)",
   "en": "Enchantment Cantrip (Bard)"
  },
  "grad": 0,
  "schule": "verzauberung",
  "klassen": [
   "barde"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du entfesselst eine Reihe von Beleidigungen mit subtilen Verzauberungen auf eine Kreatur in Reichweite, die du hören oder sehen kannst. Das Ziel muss einen Weisheitsrettungswurf bestehen, oder es erleidet 1W6 psychischen Schaden und ist beim nächsten Angriffswurf vor dem Ende seines nächsten Zugs im Nachteil."
    },
    {
     "typ": "punkt",
     "text": "Zaubertrick-Aufwertung: Der Schaden wird um jeweils 1W6 erhöht, wenn du die 5. (2W6), die 11. (3W6) und die 17. (4W6) Stufe erreichst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You unleash a string of insults laced with subtle enchantments at one creature you can see or hear within range. The target must succeed on a Wisdom saving throw or take 1d6 Psychic damage and have Disadvantage on the next attack roll it makes before the end of its next turn."
    },
    {
     "typ": "punkt",
     "text": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
    }
   ]
  }
 },
 {
  "id": "vitriolic-sphere",
  "name": {
   "de": "Ätzkugel",
   "en": "Vitriolic Sphere"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 4. Grades (Magier, Zauberer)",
   "en": "Level 4 Evocation (Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "hervorrufung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "45 Meter",
    "komponenten": "V, G, M (ein Tropfen Galle)",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "150 feet",
    "komponenten": "V, S, M (a drop of bile)",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du deutest auf einen Ort in Reichweite. Dort schlägt ein leuchtender Ball aus Säure mit einem Radius von 15 Zentimetern auf und explodiert in einer Kugel mit einem Radius von sechs Metern. Jede Kreatur in diesem Bereich führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 10W4 Säureschaden sowie weitere 5W4 Säureschaden am Ende ihres nächsten Zugs. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur nur die Hälfte des anfänglichen Schadens."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der anfängliche Schaden um 2W4 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You point at a location within range, and a glowing, 1-foot-diameter ball of acid streaks there and explodes in a 20-foot-radius Sphere. Each creature in that area makes a Dexterity saving throw. On a failed save, a creature takes 10d4 Acid damage and another 5d4 Acid damage at the end of its next turn. On a successful save, a creature takes half the initial damage only."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The initial damage increases by 2d4 for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "wall-of-fire",
  "name": {
   "de": "Feuerwand",
   "en": "Wall of Fire"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 4. Grades (Druide, Magier, Zauberer)",
   "en": "Level 4 Evocation (Druid, Sorcerer, Wizard)"
  },
  "grad": 4,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (ein Stück Kohle)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a piece of charcoal)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst auf einer festen Oberfläche in Reichweite eine Feuerwand. Du kannst eine gerade Wand mit bis zu 18 Metern Länge oder eine ringförmige Wand mit einem Radius von bis zu drei Metern erschaffen. In beiden Fällen ist die Wand sechs Meter hoch und 30 Zentimeter dick. Die Wand ist undurchsichtig und bleibt für die Wirkungsdauer bestehen. Wenn die Wand erscheint, führt jede Kreatur in ihrem Bereich einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 5W8 Feuerschaden, anderenfalls die Hälfte. Eine Seite der Wand, die du beim Wirken des Zaubers bestimmst, fügt jeder Kreatur, die ihren Zug im Abstand von bis zu drei Metern von der Seite oder in der Wand beendet, 5W8 Feuerschaden zu. Eine Kreatur erleidet den Schaden ebenfalls, wenn sie die Wand in einem Zug erstmals betritt. Die andere Seite der Wand bewirkt keinen Schaden."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 4. wird der Schaden um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration. When the wall appears, each creature in its area makes a Dexterity saving throw, taking 5d8 Fire damage on a failed save or half as much damage on a successful one. One side of the wall, selected by you when you cast this spell, deals 5d8 Fire damage to each creature that ends its turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other side of the wall deals no damage."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
    }
   ]
  }
 },
 {
  "id": "wall-of-force",
  "name": {
   "de": "Energiewand",
   "en": "Wall of Force"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 5. Grades (Magier)",
   "en": "Level 5 Evocation (Wizard)"
  },
  "grad": 5,
  "schule": "hervorrufung",
  "klassen": [
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (eine Glasscherbe)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a shard of glass)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An einem Punkt deiner Wahl in Reichweite erscheint eine unsichtbare Energiewand. Es kann sich um eine senkrechte, waagerechte oder abgewinkelte Barriere in einer Ausrichtung deiner Wahl handeln. Sie kann frei schweben oder auf einer festen Oberfläche stehen. Du kannst sie auch zu einer halbkugelförmigen Kuppel oder zu einer Kugel mit einem Radius von bis zu drei Metern formen, oder du kannst eine flache Oberfläche aus zehn Platten mit je drei Metern Kantenlänge erschaffen. Jede Platte muss an mindestens eine andere angrenzen. Die Wand ist in jeder Form einen halben Zentimeter dick und bleibt für die Wirkungsdauer bestehen. Erschaffst du die Wand so, dass sie den Bereich einer Kreatur durchdringt, so wird die Kreatur auf eine Seite der Wand (nach deiner Wahl) gestoßen. Nichts kann die Wand physisch durchdringen. Sie ist gegen alle Schadensarten immun und kann durch Magie bannen nicht aufgehoben werden. Der Zauber Auflösung zerstört die Wand jedoch sofort. Die Wand erstreckt sich auch in die Ätherebene und blockiert damit Reisen über diese Ebene."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "An Invisible wall of force springs into existence at a point you choose within range. The wall appears in any orientation you choose, as a horizontal or vertical barrier or at an angle. It can be free floating or resting on a solid surface. You can form it into a hemispherical dome or a globe with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-by-10-foot panels. Each panel must be contiguous with another panel. In any form, the wall is 1/4 inch thick and lasts for the duration. If the wall cuts through a creature’s space when it appears, the creature is pushed to one side of the wall (you choose which side). Nothing can physically pass through the wall. It is immune to all damage and can’t be dispelled by Dispel Magic. A Disintegrate spell destroys the wall instantly, however. The wall also extends into the Ethereal Plane and blocks ethereal travel through the wall."
    }
   ]
  }
 },
 {
  "id": "wall-of-ice",
  "name": {
   "de": "Eiswand",
   "en": "Wall of Ice"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 6. Grades (Magier)",
   "en": "Level 6 Evocation (Wizard)"
  },
  "grad": 6,
  "schule": "hervorrufung",
  "klassen": [
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (ein Stück Quarz)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a piece of quartz)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst auf einer festen Oberfläche in Reichweite eine Eiswand. Du kannst sie auch zu einer halbkugelförmigen Kuppel oder zu einer Kugel mit einem Radius von bis zu drei Metern formen, oder du kannst eine flache Oberfläche aus zehn Platten mit je drei Metern Kantenlänge erschaffen. Jede Platte muss an mindestens eine andere angrenzen. Die Wand ist in jeder Form 30 Zentimeter dick und bleibt für die Wirkungsdauer bestehen. Erschaffst du die Wand so, dass sie den Bereich einer Kreatur durchdringt, so wird die Kreatur auf eine Seite der Wand (nach deiner Wahl) gestoßen und führt einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 10W6 Kälteschaden, anderenfalls die Hälfte. Die Wand ist ein Gegenstand, der beschädigt und somit durchbrochen werden kann. Sie besitzt eine RK von 12 und 30 Trefferpunkte pro Abschnitt von drei Metern. Sie ist gegen Gift ‑, Kälte‑ und psychischen Schaden immun und anfällig für Feuerschaden. Sinken die Trefferpunkte eines Abschnitts von drei Metern der Wand auf 0, so wird dieser Abschnitt zerstört und hinterlässt in seinem Bereich eine eisige Luftschicht. Eine Kreatur, die sich erstmals in einem Zug durch die kalte Luftschicht bewegt, führt einen Konstitutionsrettungswurf aus. Misslingt der Wurf, so erleidet sie 5W6 Kälteschaden, anderenfalls die Hälfte."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. wird der Schaden, den die Wand beim Erscheinen bewirkt, um 2W6 erhöht, und der Schaden beim Durchqueren der eisigen Luftschicht wird um 1W6 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a globe with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-square panels. Each panel must be contiguous with another panel. In any form, the wall is 1 foot thick and lasts for the duration. If the wall cuts through a creature’s space when it appears, the creature is pushed to one side of the wall (you choose which side) and makes a Dexterity saving throw, taking 10d6 Cold damage on a failed save or half as much damage on a successful one. The wall is an object that can be damaged and thus breached. It has AC 12 and 30 Hit Points per 10-foot section, and it has Immunity to Cold, Poison, and Psychic damage and Vulnerability to Fire damage. Reducing a 10-foot section of wall to 0 Hit Points destroys it and leaves behind a sheet of frigid air in the space the wall occupied. A creature moving through the sheet of frigid air for the first time on a turn makes a Constitution saving throw, taking 5d6 Cold damage on a failed save or half as much damage on a successful one."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. The damage the wall deals when it appears increases by 2d6 and the damage from passing through the sheet of frigid air increases by 1d6 for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "wall-of-stone",
  "name": {
   "de": "Steinwand",
   "en": "Wall of Stone"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 5. Grades (Druide, Magier, Zauberer)",
   "en": "Level 5 Evocation (Druid, Sorcerer, Wizard)"
  },
  "grad": 5,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (ein Granitwürfel)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a cube of granite)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An einem Punkt deiner Wahl in Reichweite erscheint eine nichtmagische Wand aus massivem Stein. Sie ist 15 Zentimeter dick und besteht aus zehn quadratischen Platten mit jeweils drei Metern Kantenlänge. Jede Platte muss an mindestens eine andere angrenzen. Alternativ kannst du drei Meter mal sechs Meter große Platten erschaffen, die nur 7,5 Zentimeter dick sind. Erschaffst du die Wand so, dass sie den Bereich einer Kreatur durchdringt, so wird die Kreatur auf eine Seite der Wand (nach deiner Wahl) gestoßen. Wenn eine Kreatur auf allen Seiten von der Wand umschlossen (oder zwischen der Wand und einer anderen soliden Oberfläche eingeschlossen) wäre, kann diese Kreatur einen Geschicklich keitsrettungswurf ausführen. Bei einem Erfolg kann sie ihre Reaktion verwenden, um sich bis zu ihrer Bewegungsrate zu bewegen, sodass sie nicht mehr eingeschlossen ist. Die Wand kann jede gewünschte Form annehmen, jedoch nicht denselben Bereich wie eine Kreatur oder ein Gegenstand einnehmen. Sie muss nicht senkrecht sein oder auf festem Untergrund stehen. Allerdings muss sie mit bestehendem Stein verschmelzen und von ihm getragen werden. Somit kannst du diesen Zauber verwenden, um eine Schlucht zu überwinden oder eine Rampe zu erschaffen. Wenn du eine Brücke von mehr als sechs Metern Länge erschaffen willst, musst du die halbe Größe jeder Platte für Stützpfeiler verbrauchen. Du kannst die Steinwand grob formen, um Wehranlagen und dergleichen zu erschaffen. Die Wand ist ein Gegenstand aus Stein, der beschädigt und somit durchbrochen werden kann. Jede Platte besitzt eine RK von 15, 30 Trefferpunkte pro 2,5 Zentimetern Dicke und ist gegen Gift ‑ und psychischen Schaden immun. Wenn die Trefferpunkte einer Platte auf 0 sinken, wird sie zerstört, was angrenzende Platten nach Ermessen des SL zum Einsturz bringen könnte. Konzentrierst du dich für die gesamte Wirkungsdauer auf diesen Zauber, so wird die Wand dauerhaft und kann nicht gebannt werden. Anderenfalls verschwindet sie, wenn der Zauber endet."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by-10-foot panels. Each panel must be contiguous with another panel. Alternatively, you can create 10-footby-20-foot panels that are only 3 inches thick. If the wall cuts through a creature’s space when it appears, the creature is pushed to one side of the wall (you choose which side). If a creature would be surrounded on all sides by the wall (or the wall and another solid surface), that creature can make a Dexterity saving throw. On a success, it can use its Reaction to move up to its Speed so that it is no longer enclosed by the wall. The wall can have any shape you desire, though it can’t occupy the same space as a creature or object. The wall doesn’t need to be vertical or rest on a firm foundation. It must, however, merge with and be solidly supported by existing stone. Thus, you can use this spell to bridge a chasm or create a ramp. If you create a span greater than 20 feet in length, you must halve the size of each panel to create supports. You can crudely shape the wall to create battlements and the like. The wall is an object made of stone that can be damaged and thus breached. Each panel has AC 15 and 30 Hit Points per inch of thickness, and it has Immunity to Poison and Psychic damage. Reducing a panel to 0 Hit Points destroys it and might cause connected panels to collapse at the GM’s discretion. If you maintain your Concentration on this spell for its full duration, the wall becomes permanent and can’t be dispelled. Otherwise, the wall disappears when the spell ends."
    }
   ]
  }
 },
 {
  "id": "wall-of-thorns",
  "name": {
   "de": "Dornenwand",
   "en": "Wall of Thorns"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 6. Grades (Druide)",
   "en": "Level 6 Conjuration (Druid)"
  },
  "grad": 6,
  "schule": "beschwoerung",
  "klassen": [
   "druide"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (eine Handvoll Dornen)",
    "dauer": "Konzentration, bis zu 10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a handful of thorns)",
    "dauer": "Concentration, up to 10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst eine Wand aus verworrenem Gestrüpp mit nadelspitzen Dornen. Die Wand erscheint auf einer festen Oberfläche in Reichweite und bleibt für die Wirkungsdauer bestehen. Die Wand kann bis zu 18 Meter lang, drei Meter hoch und 1,5 Meter dick sein. Alternativ kannst du eine ringförmige Wand mit einem Radius von drei Metern erschaffen, die bis zu sechs Meter hoch und 1,5 Meter dick ist. Die Wand blockiert die Sichtlinie. Wenn die Wand erscheint, führt jede Kreatur in ihrem Bereich einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 7W8 Stichschaden, anderenfalls die Hälfte. Eine Kreatur kann die Dornenwand durchdringen, jedoch nur langsam und unter Schmerzen. Für jeden Meter, den sie sich durch die Wand bewegt, muss sie vier Meter ihrer Bewegungsrate verbrauchen. Wenn eine Kreatur außerdem in einem Zug die Dornenwand erstmals betritt oder ihren Zug darin beendet, führt sie einen Geschicklichkeitsrettungswurf aus. Misslingt der Wurf, so erleidet sie 7W8 Hiebschaden, anderenfalls die Hälfte. Eine Kreatur kann diesen Rettungswurf nur einmal pro Zug ausführen."
    },
    {
     "typ": "punkt",
     "text": "Verwenden von Zauberplätzen höheren Grades: Für jeden Zauberplatzgrad über dem 6. werden beide Schadensarten um 1W8 erhöht."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a wall of tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight. When the wall appears, each creature in its area makes a Dexterity saving throw, taking 7d8 Piercing damage on a failed save or half as much damage on a successful one. A creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters a space in the wall on a turn or ends its turn there, the creature makes a Dexterity saving throw, taking 7d8 Slashing damage on a failed save or half as much damage on a successful one. A creature makes this save only once per turn."
    },
    {
     "typ": "punkt",
     "text": "Using a Higher-Level Spell Slot. Both types of damage increase by 1d8 for each spell slot level above 6."
    }
   ]
  }
 },
 {
  "id": "warding-bond",
  "name": {
   "de": "Schützendes Band",
   "en": "Warding Bond"
  },
  "gradzeile": {
   "de": "Bannzauber 2. Grades (Kleriker, Paladin)",
   "en": "Level 2 Abjuration (Cleric, Paladin)"
  },
  "grad": 2,
  "schule": "bann",
  "klassen": [
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Berührung",
    "komponenten": "V, G, M (ein Paar Platinringe im Wert von jeweils mindestens 50 GM, die du und das Ziel für die Wirkungsdauer tragen müsst)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Touch",
    "komponenten": "V, S, M (a pair of platinum rings worth 50+ GP each, which you and the target must wear for the duration)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du berührst eine bereitwillige Kreatur und erzeugst eine mystische Verbindung zwischen euch, die bestehen bleibt, bis der Zauber endet. Solange sich das Ziel im Abstand von bis zu 18 Metern von dir befindet, erhält es einen Bonus von +1 auf seine RK sowie auf Rettungswürfe und ist gegen alle Schadensarten resistent. Allerdings erleidest du jedes Mal, wenn dem Ziel Schaden zugefügt wird, die gleiche Menge Schaden. Der Zauber endet, falls deine Trefferpunkte auf 0 sinken oder ihr euch weiter als 18 Meter voneinander entfernt. Der Zauber endet auch, wenn er auf einen der beiden Beteiligten erneut gewirkt wird."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You touch another creature that is willing and create a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has Resistance to all damage. Also, each time it takes damage, you take the same amount of damage. The spell ends if you drop to 0 Hit Points or if you and the target become separated by more than 60 feet. It also ends if the spell is cast again on either of the connected creatures."
    }
   ]
  }
 },
 {
  "id": "water-breathing",
  "name": {
   "de": "Wasser atmen",
   "en": "Water Breathing"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Druide, Magier, Waldläufer, Zauberer)",
   "en": "Level 3 Transmutation (Druid, Ranger, Sorcerer, Wizard)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "magier",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein kurzes Schilfrohr)",
    "dauer": "24 Stunden"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a short reed)",
    "dauer": "24 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Bis zu zehn bereitwillige Kreaturen deiner Wahl in Reichweite können für die Wirkungsdauer unter Wasser atmen. Betroffene Kreaturen verfügen weiterhin über ihre normale Atmung."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell grants up to ten willing creatures of your choice within range the ability to breathe underwater until the spell ends. Affected creatures also retain their normal mode of respiration."
    }
   ]
  }
 },
 {
  "id": "water-walk",
  "name": {
   "de": "Wasserwandeln",
   "en": "Water Walk"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 3. Grades (Druide, Kleriker, Waldläufer, Zauberer)",
   "en": "Level 3 Transmutation (Cleric, Druid, Ranger, Sorcerer)"
  },
  "grad": 3,
  "schule": "verwandlung",
  "klassen": [
   "druide",
   "kleriker",
   "waldlaeufer",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": true,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion oder Ritual",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (ein Stück Kork)",
    "dauer": "1 Stunde"
   },
   "en": {
    "zeit": "Action or Ritual",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a piece of cork)",
    "dauer": "1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber verleiht die Fähigkeit, sich über flüssige Oberflächen zu bewegen, darunter Wasser, Säure, Schlamm, Schnee, Treibsand oder Lava, als handele es sich um ungefährlichen, festen Boden (Kreaturen, die sich über geschmolzene Lava bewegen, können jedoch trotzdem Hitzeschaden erleiden). Bis zu zehn bereitwillige Kreaturen deiner Wahl in Reichweite erhalten für die Wirkungsdauer diese Fähigkeit. Ein betroffenes Ziel muss eine Bonusaktion ausführen, um von der Oberfläche der Flüssigkeit in die Flüssigkeit zu gelangen und umgekehrt. Wenn das Ziel jedoch in den Bereich fällt, gelangt es automatisch durch die Oberfläche in die Flüssigkeit darunter."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "This spell grants the ability to move across any liquid surface—such as water, acid, mud, snow, quicksand, or lava—as if it were harmless solid ground (creatures crossing molten lava can still take damage from the heat). Up to ten willing creatures of your choice within range gain this ability for the duration. An affected target must take a Bonus Action to pass from the liquid’s surface into the liquid itself and vice versa, but if the target falls into the liquid, the target passes through the surface into the liquid below."
    }
   ]
  }
 },
 {
  "id": "web",
  "name": {
   "de": "Spinnennetz",
   "en": "Web"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 2. Grades (Magier, Zauberer)",
   "en": "Level 2 Conjuration (Sorcerer, Wizard)"
  },
  "grad": 2,
  "schule": "beschwoerung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G, M (einige Spinnweben)",
    "dauer": "Konzentration, bis zu 1 Stunde"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S, M (a bit of spiderweb)",
    "dauer": "Concentration, up to 1 hour"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du beschwörst an einem Punkt in Reichweite eine Masse aus klebrigen Netzen. Für die Wirkungsdauer füllen die Netze dort einen Würfel mit sechs Metern Kantenlänge. Die Netze sind schwieriges Gelände, und ihr Bereich ist leicht verschleiert. Wenn sich die Netze nicht zwischen zwei festen Gegenständen wie Mauern oder Bäumen befinden oder über einen Fußboden, eine Wand oder unter einer Decke gespannt sind, fallen sie in sich zusammen, und zu Beginn deines nächsten Zugs endet der Zauber. Netze, die über eine flache Oberfläche ausgebreitet sind, besitzen eine Dicke von 1,5 Metern. Wenn eine Kreatur in einem Zug die Netze erstmals betritt oder ihren Zug darin beginnt, muss sie einen Geschicklichkeitsrettungswurf bestehen, oder sie ist festgesetzt, solange sie sich in den Netzen befindet oder bis sie sich befreit. Eine von den Netzen festgesetzte Kreatur kann als Aktion einen Stärkewurf (Athletik) gegen deinen Zauberrettungswurf‑SG ausführen. Bei einem Erfolg ist sie nicht mehr festgesetzt. Die Netze sind brennbar. Alle Netze innerhalb eines Würfels mit 1,5 Metern Kantenlänge verbrennen innerhalb von einer Runde, wenn sie mit Feuer in Kontakt kommen, und fügen dabei allen Kreaturen, die ihren Zug im Feuer beginnen, 2W4 Feuerschaden zu."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You conjure a mass of sticky webbing at a point within range. The webs fill a 20-foot Cube there for the duration. The webs are Difficult Terrain, and the area within them is Lightly Obscured. If the webs aren’t anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet. The first time a creature enters the webs on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the Restrained condition while in the webs or until it breaks free. A creature Restrained by the webs can take an action to make a Strength (Athletics) check against your spell save DC. If it succeeds, it is no longer Restrained. The webs are flammable. Any 5-foot Cube of webs exposed to fire burns away in 1 round, dealing 2d4 Fire damage to any creature that starts its turn in the fire."
    }
   ]
  }
 },
 {
  "id": "weird",
  "name": {
   "de": "Unheimliches Schicksal",
   "en": "Weird"
  },
  "gradzeile": {
   "de": "Illusionszauber 9. Grades (Hexenmeister, Magier)",
   "en": "Level 9 Illusion (Warlock, Wizard)"
  },
  "grad": 9,
  "schule": "illusion",
  "klassen": [
   "hexenmeister",
   "magier"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du versuchst, illusionäre Schrecken im Geiste anderer zu erzeugen. Jede Kreatur deiner Wahl in einer Kugel mit einem Radius von neun Metern um einen Punkt in Reichweite führt einen Weisheitsrettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 10W10 psychischen Schaden und ist für die Wirkungsdauer verängstigt. Bei einem erfolgreichen Rettungswurf erleidet die Kreatur nur halb so viel Schaden. Ein verängstigtes Ziel führt am Ende jedes seiner Züge einen Weisheitsrettungswurf aus. Misslingt der Wurf, so erleidet es 5W10 psychischen Schaden. Bei einem erfolgreichen Rettungswurf endet der Zauber bei diesem Ziel."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You try to create illusory terrors in others’ minds. Each creature of your choice in a 30-foot-radius Sphere centered on a point within range makes a Wisdom saving throw. On a failed save, a target takes 10d10 Psychic damage and has the Frightened condition for the duration. On a successful save, a target takes half as much damage only. A Frightened target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes 5d10 Psychic damage. On a successful save, the spell ends on that target."
    }
   ]
  }
 },
 {
  "id": "wind-walk",
  "name": {
   "de": "Windwandeln",
   "en": "Wind Walk"
  },
  "gradzeile": {
   "de": "Verwandlungszauber 6. Grades (Druide)",
   "en": "Level 6 Transmutation (Druid)"
  },
  "grad": 6,
  "schule": "verwandlung",
  "klassen": [
   "druide"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "1 Minute",
    "reichweite": "9 Meter",
    "komponenten": "V, G, M (eine Kerze)",
    "dauer": "8 Stunden"
   },
   "en": {
    "zeit": "1 minute",
    "reichweite": "30 feet",
    "komponenten": "V, S, M (a candle)",
    "dauer": "8 hours"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber verwandelt dich und bis zu zehn bereitwillige Kreaturen deiner Wahl in Reichweite für die Wirkungsdauer in gasförmige Gestalten, die als Wolkenschwaden erscheinen. In Wolkengestalt verfügt ein Ziel über eine Flugbewegungsrate von 90 Metern und kann schweben. Es ist gegen den Zustand Liegend immun und gegen Hieb ‑, Stich‑ und Wuchtschaden resistent. Die einzigen Aktionen, die ein Ziel in dieser Gestalt ausführen kann, sind die Spurt‑Aktion oder eine magische Aktion, um die Rückverwandlung in seine normale Gestalt zu beginnen. Die Rückverwandlung dauert eine Minute, in der das Ziel betäubt ist. Bis der Zauber endet, kann das Ziel zur Wolkengestalt zurückkehren. Auch dies erfordert eine magische Aktion, gefolgt von einer einminütigen Verwandlung. Befindet sich ein Ziel in Wolkengestalt in der Luft, wenn der Zauber endet, so sinkt es eine Minute lang 18 Meter pro Runde hinab, bis es sicher landet. Wenn es nach einer Minute nicht landen kann, stürzt es die verbleibende Entfernung nach unten."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You and up to ten willing creatures of your choice within range assume gaseous forms for the duration, appearing as wisps of cloud. While in this cloud form, a target has a Fly Speed of 300 feet and can hover; it has Immunity to the Prone condition; and it has Resistance to Bludgeoning, Piercing, and Slashing damage. The only actions a target can take in this form are the Dash action or a Magic action to begin reverting to its normal form. Reverting takes 1 minute, during which the target has the Stunned condition. Until the spell ends, the target can revert to cloud form, which also requires a Magic action followed by a 1-minute transformation. If a target is in cloud form and flying when the effect ends, the target descends 60 feet per round for 1 minute until it lands, which it does safely. If it can’t land after 1 minute, it falls the remaining distance."
    }
   ]
  }
 },
 {
  "id": "wind-wall",
  "name": {
   "de": "Windwall",
   "en": "Wind Wall"
  },
  "gradzeile": {
   "de": "Hervorrufungszauber 3. Grades (Druide, Waldläufer)",
   "en": "Level 3 Evocation (Druid, Ranger)"
  },
  "grad": 3,
  "schule": "hervorrufung",
  "klassen": [
   "druide",
   "waldlaeufer"
  ],
  "konzentration": true,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "36 Meter",
    "komponenten": "V, G, M (ein Fächer und eine Feder)",
    "dauer": "Konzentration, bis zu 1 Minute"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "120 feet",
    "komponenten": "V, S, M (a fan and a feather)",
    "dauer": "Concentration, up to 1 minute"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "An einem Punkt deiner Wahl in Reichweite erscheint eine Wand aus starkem Wind. Die Wand kann bis zu 15 Meter lang, 4,5 Meter hoch und 30 Zentimeter dick sein. Du kannst sie beliebig formen, solange sie einem ununterbrochenen Pfad auf dem Boden folgt. Die Wand bleibt für die Wirkungsdauer bestehen. Wenn die Wand erscheint, führt jede Kreatur in ihrem Bereich einen Stärkerettungswurf aus. Misslingt der Wurf, so erleidet die Kreatur 4W8 Wuchtschaden, anderenfalls die Hälfte. Der starke Wind hält Nebel, Rauch und andere Gase auf Abstand. Fliegende Kreaturen und Gegenstände von höchstens kleiner Größe können die Wand nicht durchdringen. Lose, leichte Materialien, die in die Wand gebracht werden, fliegen nach oben. Pfeile, Bolzen und andere gewöhnliche Geschosse, die auf Ziele hinter der Wand geschossen werden, werden nach oben abgelenkt und verfehlen ihr Ziel automatisch. Felsbrocken, die von Riesen oder Belagerungsmaschinen geschleudert werden, und ähnliche Geschosse sind hiervon nicht betroffen. Kreaturen in gasförmiger Gestalt können die Wand nicht passieren."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "A wall of strong wind rises from the ground at a point you choose within range. You can make the wall up to 50 feet long, 15 feet high, and 1 foot thick. You can shape the wall in any way you choose so long as it makes one continuous path along the ground. The wall lasts for the duration. When the wall appears, each creature in its area makes a Strength saving throw, taking 4d8 Bludgeoning damage on a failed save or half as much damage on a successful one. The strong wind keeps fog, smoke, and other gases at bay. Small or smaller flying creatures or objects can’t pass through the wall. Loose, lightweight materials brought into the wall fly upward. Arrows, bolts, and other ordinary projectiles launched at targets behind the wall are deflected upward and miss automatically. Boulders hurled by Giants or siege engines, and similar projectiles, are unaffected. Creatures in gaseous form can’t pass through it."
    }
   ]
  }
 },
 {
  "id": "wish",
  "name": {
   "de": "Wunsch",
   "en": "Wish"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 9. Grades (Magier, Zauberer)",
   "en": "Level 9 Conjuration (Sorcerer, Wizard)"
  },
  "grad": 9,
  "schule": "beschwoerung",
  "klassen": [
   "magier",
   "zauberer"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "Selbst",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "Self",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Wunsch ist der mächtigste Zauber, den ein Sterblicher wirken kann. Durch einfaches Aussprechen kann die Realität selbst verändert werden. Die grundlegende Verwendung dieses Zaubers besteht darin, einen beliebigen anderen Zauber des höchstens 8. Grades zu kopieren. Auf diese Art musst du weder die Voraussetzungen erfüllen, um den Zauber zu wirken, noch teure Materialkomponenten bezahlen. Der Zauber tritt einfach in Kraft. Alternativ kannst du einen der folgenden Effekte (nach deiner Wahl) erzeugen:"
    },
    {
     "typ": "stichpunkt",
     "text": "Gegenstand erschaffen: Du erschaffst einen nichtmagischen Gegenstand im Wert von bis zu 25.000 GM. Dieser darf in keiner Abmessung größer als 90 Meter sein. Er erscheint in einem freien Bereich auf dem Boden, den du sehen kannst."
    },
    {
     "typ": "stichpunkt",
     "text": "Sofortige Gesundheit: Du selbst und bis zu zwanzig Kreaturen, die du sehen kannst, erhaltet all eure Trefferpunkte zurück. Du beendest zudem alle auf euch wirkenden Effekte, wie unter dem Zauber Vollständige Genesung beschrieben."
    },
    {
     "typ": "stichpunkt",
     "text": "Resistenz: Du gewährst bis zu zehn Kreaturen, die du sehen kannst, Resistenz gegen eine Schadensart deiner Wahl. Diese Resistenz ist dauerhaft."
    },
    {
     "typ": "stichpunkt",
     "text": "Immunität gegen Zauber: Du verleihst bis zu zehn Kreaturen, die du sehen kannst, acht Stunden lang Immunität gegen einen einzelnen Zauber oder magischen Effekt."
    },
    {
     "typ": "stichpunkt",
     "text": "Sofortiges Lernen: Du ersetzt eines deiner Talente durch ein anderes Talent, das für dich in Frage kommt. Du verlierst alle Vorzüge des bisherigen Talents und erhältst die Vorzüge des neuen. Talente, die Voraussetzungen für andere Talente oder Merkmale sind, kannst du nicht ersetzen."
    },
    {
     "typ": "stichpunkt",
     "text": "Würfelwurf wiederholen: Du machst ein kurz zurückliegendes Ereignis ungeschehen, indem du eine Wiederholung eines beliebigen Würfelwurfs in der letzten Runde erzwingst (einschließlich deines letzten Zugs). Die Realität passt sich an das neue Ergebnis an. Beispiel: Der Zauber Wunsch könnte den misslungenen Rettungswurf eines Verbündeten oder den kritischen Treffer eines Gegners ungeschehen machen. Du kannst erzwingen, dass der neue Wurf im Vorteil oder im Nachteil ist. Zudem hast du die Wahl, ob das ursprüngliche oder das neue Ergebnis gilt."
    },
    {
     "typ": "stichpunkt",
     "text": "Realität umformen: Du könntest etwas wünschen, das nicht in den anderen Effekten enthalten ist. Beschreibe dazu dem SL deinen Wunsch so genau wie möglich. Der SL hat einigen Spielraum bei der Entscheidung, was in einem solchen Fall geschieht. Je größer der Wunsch, desto größer auch das Risiko, dass etwas schiefgeht. Der Zauber könnte schlicht misslingen, der gewünschte Effekt nur zum Teil erfüllt werden, oder du selbst könntest je nach Formulierung des Wunsches unvorhergesehene Nebenwirkungen erleiden. Wenn du dir beispielsweise einen Bösewicht tot wünschst, könntest du in eine Zukunft katapultiert werden, in der er nicht mehr lebt – wodurch du praktisch aus dem Spiel entfernt wirst. Wünschst du dir einen legendären magischen Gegenstand oder ein Artefakt, so könntest du zum aktuellen Besitzer des Gegenstands teleportiert werden. Wenn dein Wunsch gewährt wird und Konsequenzen für eine ganze Gemeinschaft, Region oder Welt hat, ziehst du wahrscheinlich mächtige Gegner an. Wenn dein Wunsch Auswirkungen auf einen Gott hätte, könnten dessen Diener sofort eingreifen, um den Wunsch zu verhindern, oder sie könnten dich ermuntern, ihn auf eine bestimmte Art zu wirken. Wenn dein Wunsch das Multiversum zerstören würde, misslingt er. Wirkst du Wunsch, um einen anderen Effekt zu erzielen, als einen Zauber zu kopieren, so belastet dich das sehr. Jedes Mal, wenn du nach dieser Belastung einen Zauber wirkst, erleidest du 1W10 nekrotischen Schaden pro Zaubergrad. Dieser Effekt verschwindet nach einer langen Rast. Der Schaden kann weder verringert noch verhindert werden. Außerdem hast du 2W4 Tage lang einen Stärkewert von 3. In dieser Zeit verringerst du mit jedem Tag, an dem du dich ausruhst oder nur leichten Tätigkeiten nachgehst, die verbleibende Erholungszeit um zwei Tage. Nicht zuletzt besteht ein Risiko von 33 Prozent, dass du den Zauber Wunsch aufgrund dieser Belastung nie wieder wirken kannst."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "Wish is the mightiest spell a mortal can cast. By simply speaking aloud, you can alter reality itself. The basic use of this spell is to duplicate any other spell of level 8 or lower. If you use it this way, you don’t need to meet any requirements to cast that spell, including costly components. The spell simply takes effect. Alternatively, you can create one of the following effects of your choice:"
    },
    {
     "typ": "stichpunkt",
     "text": "Object Creation. You create one object of up to 25,000 GP in value that isn’t a magic item. The object can be no more than 300 feet in any dimension, and it appears in an unoccupied space that you can see on the ground."
    },
    {
     "typ": "stichpunkt",
     "text": "Instant Health. You allow yourself and up to twenty creatures that you can see to regain all Hit Points, and you end all effects on them listed in the Greater Restoration spell."
    },
    {
     "typ": "stichpunkt",
     "text": "Resistance. You grant up to ten creatures that you can see Resistance to one damage type that you choose. This Resistance is permanent."
    },
    {
     "typ": "stichpunkt",
     "text": "Spell Immunity. You grant up to ten creatures you can see immunity to a single spell or other magical effect for 8 hours."
    },
    {
     "typ": "stichpunkt",
     "text": "Sudden Learning. You replace one of your feats with another feat for which you are eligible. You lose all the benefits of the old feat and gain the benefits of the new one. You can’t replace a feat that is a prerequisite for any of your other feats or features."
    },
    {
     "typ": "stichpunkt",
     "text": "Roll Redo. You undo a single recent event by forcing a reroll of any die roll made within the last round (including your last turn). Reality reshapes itself to accommodate the new result. For example, a Wish spell could undo an ally’s failed saving throw or a foe’s Critical Hit. You can force the reroll to be made with Advantage or Disadvantage, and you choose whether to use the reroll or the original roll."
    },
    {
     "typ": "stichpunkt",
     "text": "Reshape Reality. You may wish for something not included in any of the other effects. To do so, state your wish to the GM as precisely as possible. The GM has great latitude in ruling what occurs in such an instance; the greater the wish, the greater the likelihood that something goes wrong. This spell might simply fail, the effect you desire might be achieved only in part, or you might suffer an unforeseen consequence as a result of how you worded the wish. For example, wishing that a villain were dead might propel you forward in time to a period when that villain is no longer alive, effectively removing you from the game. Similarly, wishing for a Legendary magic item or an Artifact might instantly transport you to the presence of the item’s current owner. If your wish is granted and its effects have consequences for a whole community, region, or world, you are likely to attract powerful foes. If your wish would affect a god, the god’s divine servants might instantly intervene to prevent it or to encourage you to craft the wish in a particular way. If your wish would undo the multiverse itself, your wish fails. The stress of casting Wish to produce any effect other than duplicating another spell weakens you. After enduring that stress, each time you cast a spell until you finish a Long Rest, you take 1d10 Necrotic damage per level of that spell. This damage can’t be reduced or prevented in any way. In addition, your Strength score becomes 3 for 2d4 days. For each of those days that you spend resting and doing nothing more than light activity, your remaining recovery time decreases by 2 days. Finally, there is a 33 percent chance that you are unable to cast Wish ever again if you suffer this stress."
    }
   ]
  }
 },
 {
  "id": "word-of-recall",
  "name": {
   "de": "Wort des Rückrufs",
   "en": "Word of Recall"
  },
  "gradzeile": {
   "de": "Beschwörungszauber 6. Grades (Kleriker)",
   "en": "Level 6 Conjuration (Cleric)"
  },
  "grad": 6,
  "schule": "beschwoerung",
  "klassen": [
   "kleriker"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "1,5 Meter",
    "komponenten": "V",
    "dauer": "Unmittelbar"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "5 feet",
    "komponenten": "V",
    "dauer": "Instantaneous"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Dieser Zauber teleportiert dich und bis zu fünf bereitwillige Kreaturen im Abstand von bis zu 1,5 Metern von dir sofort zu einer zuvor festgelegten Zuflucht. Du und alle Kreaturen, die mit dir teleportiert werden, erscheint in einem freien Bereich, der dem von dir als Zuflucht bestimmten Ort am nächsten liegt (siehe unten). Wenn du diesen Zauber wirkst, ohne eine Zuflucht festgelegt zu haben, hat er keinen Effekt. Du musst einen Ort, beispielsweise einen Tempel, als Zuflucht benennen, um diesen Zauber dort zu wirken."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary (see below). If you cast this spell without first preparing a sanctuary, the spell has no effect. You must designate a location, such as a temple, as a sanctuary by casting this spell there."
    }
   ]
  }
 },
 {
  "id": "zone-of-truth",
  "name": {
   "de": "Zone der Wahrheit",
   "en": "Zone of Truth"
  },
  "gradzeile": {
   "de": "Verzauberungszauber 2. Grades (Barde, Kleriker, Paladin)",
   "en": "Level 2 Enchantment (Bard, Cleric, Paladin)"
  },
  "grad": 2,
  "schule": "verzauberung",
  "klassen": [
   "barde",
   "kleriker",
   "paladin"
  ],
  "konzentration": false,
  "ritual": false,
  "eigenschaften": {
   "de": {
    "zeit": "Aktion",
    "reichweite": "18 Meter",
    "komponenten": "V, G",
    "dauer": "10 Minuten"
   },
   "en": {
    "zeit": "Action",
    "reichweite": "60 feet",
    "komponenten": "V, S",
    "dauer": "10 minutes"
   }
  },
  "bloecke": {
   "de": [
    {
     "typ": "absatz",
     "text": "Du erschaffst in einer Kugel mit einem Radius von 4,5 Metern um einen Punkt in Reichweite eine magische Zone, die vor Täuschung schützt. Für die Wirkungsdauer führt jede Kreatur, die den Bereich des Zaubers in einem Zug erstmals betritt oder den Zug darin beginnt, einen Charismarettungswurf aus. Misslingt der Wurf, so kann die Kreatur innerhalb des Radius nicht lügen. Du weißt, ob eine Kreatur diesen Rettungswurf bestanden hat. Eine betroffene Kreatur ist sich des Zaubers bewusst und kann Antworten auf Fragen vermeiden, auf die sie sonst mit einer Lüge antworten würde. In diesem Fall kann sie ausweichend antworten, muss aber bei der Wahrheit bleiben."
    }
   ],
   "en": [
    {
     "typ": "absatz",
     "text": "You create a magical zone that guards against deception in a 15-foot-radius Sphere centered on a point within range. Until the spell ends, a creature that enters the spell’s area for the first time on a turn or starts its turn there makes a Charisma saving throw. On a failed save, a creature can’t speak a deliberate lie while in the radius. You know whether a creature succeeds or fails on this save. An affected creature is aware of the spell and can avoid answering questions to which it would normally respond with a lie. Such a creature can be evasive yet must be truthful."
    }
   ]
  }
 }
];
