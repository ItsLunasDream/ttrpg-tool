/**
 * Die Tabellen des Status Effect Creators.
 *
 * Zweisprachige Paare wie ueberall in der Sammlung. Der Anspruch ist
 * derselbe wie beim Monster Creator: genug Eintraege, dass man das Muster
 * nicht nach fuenf Wuerfen wiedererkennt.
 *
 * Was hier NICHT steht: ausformulierte Regeltexte. Eine Stufe ist ein
 * Stichpunkt aus `wirkungen.ts`. Ausformuliert wird nur auf Knopfdruck von
 * der KI — wer Stichpunkte wollte, soll keine Prosa zurueckbekommen.
 */

import type { Spur } from './wirkungen';

export type Sprache = 'de' | 'en';

export interface Paar {
  readonly de: string;
  readonly en: string;
}

export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'en' ? paar.en : paar.de;
}

/* ---------- Zeitskala: in welchem Takt etwas passiert ---------- */

/**
 * Der Takt, in dem ein Zustand laeuft.
 *
 * Klingt nach Kleinigkeit und ist der Grund, warum selbstgebaute Zustaende
 * sich am Tisch falsch anfuehlen: ein Zustand, der bis zum naechsten Zug
 * anhaelt, laesst sich nicht durch eine Stunde am Feuer lindern — er ist
 * laengst vorbei. Wer das aufschreibt, merkt es beim Schreiben nicht und am
 * Tisch sofort.
 *
 *   kampf  Runden und Zuege. Ein Kampf dauert Sekunden.
 *   kurz   Stunden. Die Reisezeit zwischen zwei Orten.
 *   lang   Tage, Rasten, „bis es geheilt wird".
 *
 * Verglichen wird ueber `skalaWert`: was laenger dauert, hat die groessere
 * Zahl.
 */
export const ZEITSKALEN = ['kampf', 'kurz', 'lang'] as const;
export type Zeitskala = (typeof ZEITSKALEN)[number];

export function skalaWert(skala: Zeitskala): number {
  return ZEITSKALEN.indexOf(skala);
}

/* ---------- Art: woher der Zustand kommt ---------- */

/** Ein Ausloeser mit dem Takt, in dem er zuschlaegt. */
export interface Ausloeser {
  readonly text: Paar;
  readonly zeitskala: Zeitskala;
}

export interface Art {
  readonly id: string;
  readonly name: Paar;
  /** Wie eine Verschlimmerung bei dieser Art klingt, samt Takt. */
  readonly ausloeser: readonly Ausloeser[];
}

export const ARTEN: readonly Art[] = [
  {
    id: 'umgebung',
    name: { de: 'Umgebung', en: 'Environment' },
    ausloeser: [
      { text: { de: 'jede Stunde ohne Schutz', en: 'each hour without protection' }, zeitskala: 'kurz' },
      { text: { de: 'jeder Tag im Freien', en: 'each day in the open' }, zeitskala: 'lang' },
      { text: { de: 'jede Rast ohne Feuer', en: 'each rest without a fire' }, zeitskala: 'lang' },
      { text: { de: 'jede Stunde in Bewegung', en: 'each hour on the move' }, zeitskala: 'kurz' }
    ]
  },
  {
    id: 'gift',
    name: { de: 'Gift', en: 'Poison' },
    ausloeser: [
      { text: { de: 'jede weitere Dosis', en: 'each further dose' }, zeitskala: 'kurz' },
      { text: { de: 'jede Runde ohne Gegenmittel', en: 'each round without an antidote' }, zeitskala: 'kampf' },
      { text: { de: 'jede Anstrengung', en: 'each strenuous action' }, zeitskala: 'kampf' }
    ]
  },
  {
    id: 'fluch',
    name: { de: 'Fluch', en: 'Curse' },
    ausloeser: [
      { text: { de: 'jede Nacht bis zum Vollmond', en: 'each night until the full moon' }, zeitskala: 'lang' },
      { text: { de: 'jedes gebrochene Versprechen', en: 'each broken promise' }, zeitskala: 'lang' },
      { text: { de: 'jeder Blick in den Spiegel', en: 'each look into a mirror' }, zeitskala: 'kurz' },
      { text: { de: 'jede genannte Nennung des Namens', en: 'each time the name is spoken' }, zeitskala: 'kurz' }
    ]
  },
  {
    id: 'krankheit',
    name: { de: 'Krankheit', en: 'Disease' },
    ausloeser: [
      { text: { de: 'jeder Tag ohne Pflege', en: 'each day without care' }, zeitskala: 'lang' },
      { text: { de: 'jede misslungene Konstitutionsrettung', en: 'each failed Constitution save' }, zeitskala: 'kampf' },
      { text: { de: 'jeder Kontakt mit einem Erkrankten', en: 'each contact with the afflicted' }, zeitskala: 'lang' }
    ]
  },
  {
    id: 'verletzung',
    name: { de: 'Verletzung', en: 'Injury' },
    ausloeser: [
      { text: { de: 'jeder weitere Treffer auf dieselbe Stelle', en: 'each further hit in the same place' }, zeitskala: 'kampf' },
      { text: { de: 'jede Anstrengung ohne Verband', en: 'each exertion without a bandage' }, zeitskala: 'kurz' }
    ]
  },
  {
    id: 'magie',
    name: { de: 'Magie', en: 'Magic' },
    ausloeser: [
      { text: { de: 'jede Runde im Wirkungsbereich', en: 'each round inside the area' }, zeitskala: 'kampf' },
      { text: { de: 'jeder gewirkte Zauber', en: 'each spell you cast' }, zeitskala: 'kampf' },
      { text: { de: 'jede Berührung des Siegels', en: 'each touch of the seal' }, zeitskala: 'kurz' }
    ]
  },
  {
    id: 'segen',
    name: { de: 'Segen', en: 'Blessing' },
    ausloeser: [
      { text: { de: 'jedes eingelöste Gelübde', en: 'each vow kept' }, zeitskala: 'lang' },
      { text: { de: 'jede Nacht am Schrein', en: 'each night at the shrine' }, zeitskala: 'lang' },
      { text: { de: 'jeder Sieg im Namen des Gebers', en: 'each victory in the giver’s name' }, zeitskala: 'lang' }
    ]
  }
];

/* ---------- Thema: woraus der Zustand gemacht ist ---------- */

export interface Thema {
  readonly id: string;
  readonly name: Paar;
  /** Welche Spuren dieses Thema bevorzugt angreift. */
  readonly spuren: readonly Spur[];
  /** Erste Haelfte des Namens. */
  readonly erstes: readonly Paar[];
  /** Zweite Haelfte. */
  readonly zweites: readonly Paar[];
  /** Namen, die fuer sich stehen. */
  readonly einzeln: readonly Paar[];
  /** Das Bild fuer den Kurzsatz: was kriecht, frisst, sich legt. */
  readonly bilder: readonly Paar[];
  /** Was dagegen hilft. Fuer die Linderung. */
  readonly gegenmittel: readonly Paar[];
  /** Wo es herkommt. Fuer die Verschlimmerung. */
  readonly orte: readonly Paar[];
}

export const THEMEN: readonly Thema[] = [
  {
    id: 'kaelte',
    name: { de: 'Kälte', en: 'Cold' },
    spuren: ['bewegung', 'koerper', 'sinne'],
    erstes: [
      { de: 'Frost', en: 'Frost' }, { de: 'Eis', en: 'Ice' }, { de: 'Winter', en: 'Winter' },
      { de: 'Reif', en: 'Rime' }, { de: 'Schnee', en: 'Snow' }, { de: 'Klamm', en: 'Clammy' },
      { de: 'Nacht', en: 'Night' }, { de: 'Starr', en: 'Still' }
    ],
    zweites: [
      { de: 'biss', en: 'bite' }, { de: 'griff', en: 'grasp' }, { de: 'hauch', en: 'breath' },
      { de: 'kuss', en: 'kiss' }, { de: 'schlaf', en: 'sleep' }, { de: 'zehrung', en: 'creep' },
      { de: 'starre', en: 'stillness' }, { de: 'fessel', en: 'shackle' }
    ],
    einzeln: [
      { de: 'Klammfrost', en: 'Creeping Chill' }, { de: 'Erfrierung', en: 'Frostbite' },
      { de: 'Winterschlaf', en: 'Winter Sleep' }, { de: 'Blaue Stunde', en: 'Blue Hour' },
      { de: 'Eisatem', en: 'Icebreath' }, { de: 'Kaltes Herz', en: 'Cold Heart' }
    ],
    bilder: [
      { de: 'Die Kälte', en: 'The cold' }, { de: 'Der Frost', en: 'The frost' },
      { de: 'Ein klammes Ziehen', en: 'A clammy ache' }, { de: 'Die Starre', en: 'The stillness' }
    ],
    gegenmittel: [
      { de: 'an einem Feuer', en: 'at a fire' }, { de: 'in trockener Kleidung', en: 'in dry clothes' },
      { de: 'mit heißem Essen', en: 'with hot food' }, { de: 'in einem warmen Raum', en: 'in a warm room' }
    ],
    orte: [
      { de: 'in großer Kälte', en: 'in severe cold' }, { de: 'im Schneesturm', en: 'in a blizzard' },
      { de: 'auf dem Gletscher', en: 'on the glacier' }, { de: 'im eisigen Wasser', en: 'in freezing water' }
    ]
  },
  {
    id: 'hitze',
    name: { de: 'Hitze', en: 'Heat' },
    spuren: ['koerper', 'sinne', 'handlung'],
    erstes: [
      { de: 'Dürre', en: 'Parched' }, { de: 'Brand', en: 'Scorch' }, { de: 'Sonnen', en: 'Sun' },
      { de: 'Glut', en: 'Ember' }, { de: 'Staub', en: 'Dust' }, { de: 'Flimmer', en: 'Shimmer' },
      { de: 'Sand', en: 'Sand' }, { de: 'Trocken', en: 'Arid' }
    ],
    zweites: [
      { de: 'schwindel', en: 'swoon' }, { de: 'zunge', en: 'tongue' }, { de: 'stich', en: 'stroke' },
      { de: 'blindheit', en: 'blindness' }, { de: 'zehrung', en: 'wasting' }, { de: 'durst', en: 'thirst' },
      { de: 'fieber', en: 'fever' }, { de: 'last', en: 'weight' }
    ],
    einzeln: [
      { de: 'Sonnenstich', en: 'Sunstroke' }, { de: 'Sandblind', en: 'Sandblind' },
      { de: 'Trockenfieber', en: 'Dry Fever' }, { de: 'Mittagsglut', en: 'Noon Glare' },
      { de: 'Aschelunge', en: 'Ashlung' }, { de: 'Durststarre', en: 'Thirstlock' }
    ],
    bilder: [
      { de: 'Die Hitze', en: 'The heat' }, { de: 'Der Durst', en: 'The thirst' },
      { de: 'Ein trockenes Brennen', en: 'A dry burning' }, { de: 'Das Flimmern', en: 'The shimmer' }
    ],
    gegenmittel: [
      { de: 'im Schatten', en: 'in the shade' }, { de: 'mit frischem Wasser', en: 'with fresh water' },
      { de: 'nach einer kühlen Nacht', en: 'after a cool night' }, { de: 'unter feuchtem Tuch', en: 'under a damp cloth' }
    ],
    orte: [
      { de: 'in sengender Hitze', en: 'in searing heat' }, { de: 'in der Wüste', en: 'in the desert' },
      { de: 'ohne Wasser', en: 'without water' }, { de: 'in der Mittagssonne', en: 'in the midday sun' }
    ]
  },
  {
    id: 'faeulnis',
    name: { de: 'Fäulnis', en: 'Rot' },
    spuren: ['koerper', 'schaden', 'verteidigung'],
    erstes: [
      { de: 'Moder', en: 'Mould' }, { de: 'Sumpf', en: 'Marsh' }, { de: 'Grab', en: 'Grave' },
      { de: 'Schwarz', en: 'Black' }, { de: 'Süß', en: 'Sweet' }, { de: 'Kriech', en: 'Creeping' },
      { de: 'Aas', en: 'Carrion' }, { de: 'Faul', en: 'Foul' }
    ],
    zweites: [
      { de: 'brand', en: 'rot' }, { de: 'fieber', en: 'fever' }, { de: 'geruch', en: 'reek' },
      { de: 'fleck', en: 'blight' }, { de: 'zehrung', en: 'wasting' }, { de: 'saat', en: 'bloom' },
      { de: 'atem', en: 'breath' }, { de: 'hand', en: 'hand' }
    ],
    einzeln: [
      { de: 'Schwarzbrand', en: 'Blackrot' }, { de: 'Sumpffieber', en: 'Marsh Fever' },
      { de: 'Grabschimmel', en: 'Gravebloom' }, { de: 'Süßer Atem', en: 'Sweet Breath' },
      { de: 'Aasblüte', en: 'Carrion Bloom' }, { de: 'Kriechfäule', en: 'Creeping Rot' }
    ],
    bilder: [
      { de: 'Die Fäulnis', en: 'The rot' }, { de: 'Ein süßlicher Geruch', en: 'A sweetish reek' },
      { de: 'Das Fieber', en: 'The fever' }, { de: 'Etwas unter der Haut', en: 'Something under the skin' }
    ],
    gegenmittel: [
      { de: 'mit sauberem Verband', en: 'with a clean bandage' }, { de: 'nach einem Tag Pflege', en: 'after a day of care' },
      { de: 'mit gebranntem Kraut', en: 'with burnt herbs' }, { de: 'durch Ausbrennen', en: 'by cauterising' }
    ],
    orte: [
      { de: 'im stehenden Wasser', en: 'in standing water' }, { de: 'in der Gruft', en: 'in the crypt' },
      { de: 'unter Aas', en: 'among carrion' }, { de: 'im Moor', en: 'in the mire' }
    ]
  },
  {
    id: 'wahnsinn',
    name: { de: 'Wahnsinn', en: 'Madness' },
    spuren: ['geist', 'handlung', 'sinne'],
    erstes: [
      { de: 'Flüster', en: 'Whisper' }, { de: 'Spiegel', en: 'Mirror' }, { de: 'Leer', en: 'Hollow' },
      { de: 'Zähl', en: 'Counting' }, { de: 'Nacht', en: 'Night' }, { de: 'Wach', en: 'Waking' },
      { de: 'Schwarm', en: 'Swarm' }, { de: 'Namen', en: 'Name' }
    ],
    zweites: [
      { de: 'zwang', en: 'compulsion' }, { de: 'stimme', en: 'voice' }, { de: 'schlaf', en: 'sleep' },
      { de: 'blick', en: 'gaze' }, { de: 'gedanke', en: 'thought' }, { de: 'sucht', en: 'craving' },
      { de: 'lachen', en: 'laughter' }, { de: 'gast', en: 'guest' }
    ],
    einzeln: [
      { de: 'Zählzwang', en: 'Counting Fit' }, { de: 'Wachschlaf', en: 'Waking Sleep' },
      { de: 'Der Gast', en: 'The Guest' }, { de: 'Spiegelangst', en: 'Mirror Dread' },
      { de: 'Leeres Lachen', en: 'Hollow Laughter' }, { de: 'Fremde Stimme', en: 'Borrowed Voice' }
    ],
    bilder: [
      { de: 'Ein Flüstern', en: 'A whisper' }, { de: 'Der Gedanke', en: 'The thought' },
      { de: 'Etwas, das nicht da ist', en: 'Something that is not there' }, { de: 'Die Stimme', en: 'The voice' }
    ],
    gegenmittel: [
      { de: 'nach einer ruhigen Nacht', en: 'after a quiet night' }, { de: 'in Gesellschaft', en: 'in company' },
      { de: 'mit einem vertrauten Lied', en: 'with a familiar song' }, { de: 'bei Tageslicht', en: 'in daylight' }
    ],
    orte: [
      { de: 'an dem stillen Ort', en: 'in the silent place' }, { de: 'unter dem falschen Himmel', en: 'under the wrong sky' },
      { de: 'im Dunkeln allein', en: 'alone in the dark' }, { de: 'nahe dem Riss', en: 'near the rift' }
    ]
  },
  {
    id: 'licht',
    name: { de: 'Licht', en: 'Light' },
    spuren: ['sinne', 'geist', 'verteidigung'],
    erstes: [
      { de: 'Blend', en: 'Glare' }, { de: 'Weiß', en: 'White' }, { de: 'Brenn', en: 'Searing' },
      { de: 'Klar', en: 'Clear' }, { de: 'Gold', en: 'Gilded' }, { de: 'Nadel', en: 'Needle' },
      { de: 'Mittags', en: 'Noon' }, { de: 'Spiegel', en: 'Mirror' }
    ],
    zweites: [
      { de: 'blindheit', en: 'blindness' }, { de: 'brand', en: 'burn' }, { de: 'urteil', en: 'judgement' },
      { de: 'schnitt', en: 'cut' }, { de: 'last', en: 'weight' }, { de: 'wache', en: 'vigil' },
      { de: 'blick', en: 'gaze' }, { de: 'gnade', en: 'grace' }
    ],
    einzeln: [
      { de: 'Schneeblind', en: 'Snowblind' }, { de: 'Weißbrand', en: 'Whitebrand' },
      { de: 'Nadelblick', en: 'Needle Sight' }, { de: 'Goldene Last', en: 'Gilded Weight' },
      { de: 'Mittagsurteil', en: 'Noon Judgement' }, { de: 'Ewige Wache', en: 'Endless Vigil' }
    ],
    bilder: [
      { de: 'Das Licht', en: 'The light' }, { de: 'Ein weißes Brennen', en: 'A white burning' },
      { de: 'Die Helligkeit', en: 'The brightness' }, { de: 'Der Glanz', en: 'The glare' }
    ],
    gegenmittel: [
      { de: 'im Dunkeln', en: 'in the dark' }, { de: 'mit verbundenen Augen', en: 'with your eyes bound' },
      { de: 'nach einer Nacht Ruhe', en: 'after a night of rest' }, { de: 'unter einem Tuch', en: 'under a cloth' }
    ],
    orte: [
      { de: 'im offenen Schnee', en: 'in open snow' }, { de: 'vor dem Altar', en: 'before the altar' },
      { de: 'in der grellen Sonne', en: 'in the harsh sun' }, { de: 'im Spiegelsaal', en: 'in the hall of mirrors' }
    ]
  },
  {
    id: 'leere',
    name: { de: 'Leere', en: 'Void' },
    spuren: ['geist', 'koerper', 'handlung'],
    erstes: [
      { de: 'Stern', en: 'Star' }, { de: 'Fern', en: 'Distant' }, { de: 'Grund', en: 'Abyssal' },
      { de: 'Zwischen', en: 'Between' }, { de: 'Kalt', en: 'Cold' }, { de: 'Ohne', en: 'Nameless' },
      { de: 'Sog', en: 'Pull' }, { de: 'Weit', en: 'Vast' }
    ],
    zweites: [
      { de: 'zehrung', en: 'wasting' }, { de: 'hunger', en: 'hunger' }, { de: 'kälte', en: 'chill' },
      { de: 'ferne', en: 'distance' }, { de: 'naht', en: 'seam' }, { de: 'stille', en: 'silence' },
      { de: 'fall', en: 'fall' }, { de: 'schatten', en: 'shadow' }
    ],
    einzeln: [
      { de: 'Sternenkälte', en: 'Starchill' }, { de: 'Der lange Fall', en: 'The Long Fall' },
      { de: 'Namenlose Ferne', en: 'Nameless Distance' }, { de: 'Leerer Hunger', en: 'Hollow Hunger' },
      { de: 'Nahtriss', en: 'Seamtear' }, { de: 'Weite Stille', en: 'Vast Silence' }
    ],
    bilder: [
      { de: 'Die Leere', en: 'The emptiness' }, { de: 'Ein Sog', en: 'A pull' },
      { de: 'Die Ferne', en: 'The distance' }, { de: 'Etwas Weites', en: 'Something vast' }
    ],
    gegenmittel: [
      { de: 'mit festem Boden unter den Füßen', en: 'with solid ground underfoot' },
      { de: 'im Kreis von Vertrauten', en: 'among trusted company' },
      { de: 'an einem geweihten Ort', en: 'at a hallowed place' },
      { de: 'nach einer vollen Rast', en: 'after a full rest' }
    ],
    orte: [
      { de: 'unter dem leeren Himmel', en: 'under the empty sky' }, { de: 'an der Naht', en: 'at the seam' },
      { de: 'im Nichts dazwischen', en: 'in the nothing between' }, { de: 'am Rand des Grundes', en: 'at the edge of the abyss' }
    ]
  }
];

/* ---------- Haerte: wie weit die Stufen gehen duerfen ---------- */

export interface Haerte {
  readonly id: string;
  readonly name: Paar;
  /** Bis zu welcher Schwere die Wirkungen reichen. */
  readonly bis: 'leicht' | 'mittel' | 'schwer' | 'toedlich';
  /** Woran sich das Gewicht messen laesst. Siehe `gewicht.ts`. */
  readonly gewichtVon: number;
  readonly gewichtBis: number;
}

export const HAERTEN: readonly Haerte[] = [
  { id: 'laestig', name: { de: 'lästig', en: 'Nuisance' }, bis: 'leicht', gewichtVon: 1, gewichtBis: 5 },
  { id: 'ernst', name: { de: 'ernst', en: 'Serious' }, bis: 'mittel', gewichtVon: 4, gewichtBis: 12 },
  { id: 'gefaehrlich', name: { de: 'gefährlich', en: 'Dangerous' }, bis: 'schwer', gewichtVon: 10, gewichtBis: 24 },
  { id: 'toedlich', name: { de: 'tödlich', en: 'Deadly' }, bis: 'toedlich', gewichtVon: 20, gewichtBis: 60 }
];

/* ---------- Wirkrichtung: wohin der Zustand zieht ---------- */

export const WIRKRICHTUNGEN = ['schaden', 'debuff', 'buff', 'gemischt'] as const;
export type Wirkrichtung = (typeof WIRKRICHTUNGEN)[number];

/* ---------- Dauer ---------- */

export interface Dauer {
  readonly id: string;
  readonly name: Paar;
  readonly zeitskala: Zeitskala;
}

/**
 * Wie lange ein Zustand anhaelt.
 *
 * Die Zeitskala ist hier kein Beiwerk: an ihr haengt, ob die Linderung
 * ueberhaupt Sinn ergibt. „Bis zu deinem naechsten Zug" und „eine Stunde am
 * Feuer senkt ihn um 1" ist ein Widerspruch — der Zustand ist laengst
 * vorbei, wenn die Stunde anfaengt.
 */
export const DAUERN: readonly Dauer[] = [
  { id: 'rundenende', name: { de: 'bis zum Rundenende', en: 'until the end of the round' }, zeitskala: 'kampf' },
  { id: 'naechsterZug', name: { de: 'bis zu deinem nächsten Zug', en: 'until your next turn' }, zeitskala: 'kampf' },
  { id: 'kampfende', name: { de: 'bis zum Ende des Kampfes', en: 'until the end of the fight' }, zeitskala: 'kampf' },
  { id: 'stunde', name: { de: 'eine Stunde', en: 'one hour' }, zeitskala: 'kurz' },
  { id: 'stunden', name: { de: 'mehrere Stunden', en: 'several hours' }, zeitskala: 'kurz' },
  { id: 'kurzeRast', name: { de: 'bis zur nächsten kurzen Rast', en: 'until the next short rest' }, zeitskala: 'kurz' },
  { id: 'langeRast', name: { de: 'bis zur nächsten langen Rast', en: 'until the next long rest' }, zeitskala: 'lang' },
  { id: 'geheilt', name: { de: 'bis es geheilt wird', en: 'until cured' }, zeitskala: 'lang' },
  { id: 'offen', name: { de: 'offen', en: 'open-ended' }, zeitskala: 'lang' }
];

export function dauer(id: string): Dauer | undefined {
  return DAUERN.find((d) => d.id === id);
}

/* ---------- Symbole fuer den Tracker ---------- */

export interface Sinnbild {
  readonly zeichen: string;
  readonly farbe: string;
  readonly themen: readonly string[];
}

export const SINNBILDER: readonly Sinnbild[] = [
  { zeichen: '❄', farbe: '#6aa9e9', themen: ['kaelte'] },
  { zeichen: '☀', farbe: '#e0a33a', themen: ['hitze', 'licht'] },
  { zeichen: '☣', farbe: '#7fa93a', themen: ['faeulnis'] },
  { zeichen: '☾', farbe: '#9a7ad6', themen: ['wahnsinn', 'leere'] },
  { zeichen: '✦', farbe: '#d9c26a', themen: ['licht'] },
  { zeichen: '✧', farbe: '#7a8ca8', themen: ['leere'] },
  { zeichen: '☠', farbe: '#c05a53', themen: [] },
  { zeichen: '◈', farbe: '#5aa5a0', themen: [] }
];
