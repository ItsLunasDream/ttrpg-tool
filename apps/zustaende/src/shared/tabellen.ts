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
      { de: 'in kühler Luft', en: 'in cool air' }, { de: 'unter feuchtem Tuch', en: 'under a damp cloth' }
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
      { de: 'Das Fieber', en: 'The fever' }, { de: 'Ein Wühlen unter der Haut', en: 'A burrowing under the skin' }
    ],
    gegenmittel: [
      { de: 'mit sauberem Verband', en: 'with a clean bandage' }, { de: 'unter kundiger Pflege', en: 'under proper care' },
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
      { de: 'Ein fremder Gedanke', en: 'A borrowed thought' }, { de: 'Die Stimme', en: 'The voice' }
    ],
    gegenmittel: [
      { de: 'an einem stillen Ort', en: 'in a quiet place' }, { de: 'in Gesellschaft', en: 'in company' },
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
      { de: 'bei geschlossenen Augen', en: 'with your eyes closed' }, { de: 'unter einem Tuch', en: 'under a cloth' }
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
      { de: 'Die Ferne', en: 'The distance' }, { de: 'Eine Weite ohne Rand', en: 'A vastness without edge' }
    ],
    gegenmittel: [
      { de: 'mit festem Boden unter den Füßen', en: 'with solid ground underfoot' },
      { de: 'im Kreis von Vertrauten', en: 'among trusted company' },
      { de: 'an einem geweihten Ort', en: 'at a hallowed place' },
      { de: 'in voller Ruhe', en: 'at full rest' }
    ],
    orte: [
      { de: 'unter dem leeren Himmel', en: 'under the empty sky' }, { de: 'an der Naht', en: 'at the seam' },
      { de: 'im Nichts dazwischen', en: 'in the nothing between' }, { de: 'am Rand des Grundes', en: 'at the edge of the abyss' }
    ]
  }
,
  {
    id: 'feuer',
    name: { de: 'Feuer', en: 'Fire' },
    spuren: ['koerper', 'schaden', 'sinne'],
    erstes: [
      { de: 'Brand', en: 'Sear' }, { de: 'Glut', en: 'Ember' }, { de: 'Asche', en: 'Ash' },
      { de: 'Funken', en: 'Spark' }, { de: 'Rauch', en: 'Smoke' }, { de: 'Zunder', en: 'Tinder' },
      { de: 'Flammen', en: 'Flame' }, { de: 'Schwel', en: 'Smoulder' }
    ],
    zweites: [
      { de: 'mal', en: 'brand' }, { de: 'zehrung', en: 'wasting' }, { de: 'hauch', en: 'breath' },
      { de: 'kuss', en: 'kiss' }, { de: 'narbe', en: 'scar' }, { de: 'biss', en: 'bite' },
      { de: 'atem', en: 'draught' }, { de: 'saat', en: 'seed' }
    ],
    einzeln: [
      { de: 'Brandmal', en: 'Searing Brand' }, { de: 'Schwelfeuer', en: 'Smoulder' }, { de: 'Aschelunge', en: 'Ashlung' },
      { de: 'Glutfieber', en: 'Ember Fever' }, { de: 'Rauchblind', en: 'Smokeblind' }, { de: 'Flammenhunger', en: 'Flame Hunger' }
    ],
    bilder: [
      { de: 'Das Feuer', en: 'The fire' }, { de: 'Die Glut', en: 'The ember heat' }, { de: 'Ein Brennen', en: 'A burning' },
      { de: 'Der Rauch', en: 'The smoke' }
    ],
    gegenmittel: [
      { de: 'in kühlem Wasser', en: 'in cool water' }, { de: 'mit Salbe und Verband', en: 'with salve and bandage' }, { de: 'ohne jede Anstrengung', en: 'without any exertion' },
      { de: 'im Schatten', en: 'in the shade' }
    ],
    orte: [
      { de: 'in der brennenden Halle', en: 'in the burning hall' }, { de: 'nahe der Esse', en: 'near the forge' }, { de: 'im Ascheregen', en: 'in the ashfall' },
      { de: 'über der Feuerstelle', en: 'over the firepit' }
    ]
  },
  {
    id: 'gift',
    name: { de: 'Gift', en: 'Venom' },
    spuren: ['koerper', 'schaden', 'geist'],
    erstes: [
      { de: 'Natter', en: 'Viper' }, { de: 'Schierling', en: 'Hemlock' }, { de: 'Galle', en: 'Bile' },
      { de: 'Schwarz', en: 'Black' }, { de: 'Kriech', en: 'Creeping' }, { de: 'Faul', en: 'Foul' },
      { de: 'Speichel', en: 'Spittle' }, { de: 'Dorn', en: 'Thorn' }
    ],
    zweites: [
      { de: 'biss', en: 'bite' }, { de: 'saft', en: 'sap' }, { de: 'zehrung', en: 'wasting' },
      { de: 'lähmung', en: 'palsy' }, { de: 'fieber', en: 'fever' }, { de: 'schlund', en: 'gullet' },
      { de: 'blut', en: 'blood' }, { de: 'kuss', en: 'kiss' }
    ],
    einzeln: [
      { de: 'Nattergift', en: 'Viper’s Gift' }, { de: 'Schierlingsschlaf', en: 'Hemlock Sleep' }, { de: 'Schwarzes Blut', en: 'Black Blood' },
      { de: 'Kriechlähmung', en: 'Creeping Palsy' }, { de: 'Gallenfieber', en: 'Bile Fever' }, { de: 'Dornenschlaf', en: 'Thorn Sleep' }
    ],
    bilder: [
      { de: 'Das Gift', en: 'The venom' }, { de: 'Eine Taubheit', en: 'A numbness' }, { de: 'Ein bitterer Geschmack', en: 'A bitter taste' },
      { de: 'Die Lähmung', en: 'The palsy' }
    ],
    gegenmittel: [
      { de: 'mit einem Gegenmittel', en: 'with an antidote' }, { de: 'in warme Decken gepackt', en: 'wrapped in warm blankets' }, { de: 'mit Kohle und Wasser', en: 'with charcoal and water' },
      { de: 'unter der Hand eines Heilers', en: 'under a healer’s hand' }
    ],
    orte: [
      { de: 'im Nest der Nattern', en: 'in the viper nest' }, { de: 'über dem offenen Kessel', en: 'over the open cauldron' }, { de: 'im Dunst der Sümpfe', en: 'in the marsh haze' },
      { de: 'an der vergifteten Klinge', en: 'on the poisoned blade' }
    ]
  },
  {
    id: 'saeure',
    name: { de: 'Säure', en: 'Acid' },
    spuren: ['koerper', 'verteidigung', 'schaden'],
    erstes: [
      { de: 'Ätz', en: 'Etch' }, { de: 'Rost', en: 'Rust' }, { de: 'Zisch', en: 'Hiss' },
      { de: 'Gruben', en: 'Pit' }, { de: 'Loch', en: 'Hole' }, { de: 'Schlamm', en: 'Sludge' },
      { de: 'Grün', en: 'Green' }, { de: 'Tropf', en: 'Drip' }
    ],
    zweites: [
      { de: 'brand', en: 'burn' }, { de: 'fraß', en: 'feed' }, { de: 'narbe', en: 'scar' },
      { de: 'loch', en: 'pit' }, { de: 'haut', en: 'skin' }, { de: 'zehrung', en: 'wasting' },
      { de: 'biss', en: 'bite' }, { de: 'nebel', en: 'haze' }
    ],
    einzeln: [
      { de: 'Ätzbrand', en: 'Etchburn' }, { de: 'Rostfäule', en: 'Rustrot' }, { de: 'Lochhaut', en: 'Pitted Skin' },
      { de: 'Grünnebel', en: 'Green Haze' }, { de: 'Zischwunde', en: 'Hissing Wound' }, { de: 'Grubenfraß', en: 'Pitfeed' }
    ],
    bilder: [
      { de: 'Die Säure', en: 'The acid' }, { de: 'Ein Zischen', en: 'A hissing' }, { de: 'Ein Fressen', en: 'A gnawing' },
      { de: 'Der Ätzgeruch', en: 'The acrid smell' }
    ],
    gegenmittel: [
      { de: 'mit reichlich Wasser', en: 'with plenty of water' }, { de: 'mit Asche und Kalk', en: 'with ash and lime' }, { de: 'unter fließendem Wasser', en: 'under running water' },
      { de: 'mit frischem Verband', en: 'with a fresh bandage' }
    ],
    orte: [
      { de: 'in der Säurepfütze', en: 'in the acid pool' }, { de: 'unter dem tropfenden Gewölbe', en: 'under the dripping vault' }, { de: 'im Nest', en: 'in the nest' },
      { de: 'über dem offenen Fass', en: 'over the open vat' }
    ]
  },
  {
    id: 'sturm',
    name: { de: 'Sturm', en: 'Storm' },
    spuren: ['bewegung', 'sinne', 'handlung'],
    erstes: [
      { de: 'Donner', en: 'Thunder' }, { de: 'Blitz', en: 'Bolt' }, { de: 'Böen', en: 'Gale' },
      { de: 'Wetter', en: 'Weather' }, { de: 'Grollen', en: 'Rumble' }, { de: 'Schlag', en: 'Strike' },
      { de: 'Hagel', en: 'Hail' }, { de: 'Wirbel', en: 'Whirl' }
    ],
    zweites: [
      { de: 'schlag', en: 'strike' }, { de: 'hall', en: 'peal' }, { de: 'zucken', en: 'twitch' },
      { de: 'taubheit', en: 'deafness' }, { de: 'sturz', en: 'fall' }, { de: 'riss', en: 'tear' },
      { de: 'griff', en: 'grip' }, { de: 'leuchten', en: 'light' }
    ],
    einzeln: [
      { de: 'Donnerhall', en: 'Thunderclap' }, { de: 'Blitzzucken', en: 'Twitching Bolt' }, { de: 'Hagelschlag', en: 'Hailstruck' },
      { de: 'Wetterleuchten', en: 'Stormsight' }, { de: 'Böenriss', en: 'Galetorn' }, { de: 'Grollentaub', en: 'Thunderdeaf' }
    ],
    bilder: [
      { de: 'Der Donner', en: 'The thunder' }, { de: 'Ein Zucken in den Gliedern', en: 'A twitching in the limbs' }, { de: 'Das Grollen', en: 'The rumble' },
      { de: 'Der Schlag', en: 'The strike' }
    ],
    gegenmittel: [
      { de: 'unter festem Dach', en: 'under a solid roof' }, { de: 'in einer ruhigen Stunde', en: 'through a quiet hour' }, { de: 'mit trockenem Boden unter den Füßen', en: 'with dry ground underfoot' },
      { de: 'hinter dickem Stein', en: 'behind thick stone' }
    ],
    orte: [
      { de: 'im offenen Feld', en: 'in the open field' }, { de: 'auf dem Grat', en: 'on the ridge' }, { de: 'unter dem Wetterhimmel', en: 'under the storm sky' },
      { de: 'an der eingeschlagenen Stelle', en: 'at the strike site' }
    ]
  },
  {
    id: 'stein',
    name: { de: 'Stein', en: 'Stone' },
    spuren: ['bewegung', 'koerper', 'verteidigung'],
    erstes: [
      { de: 'Stein', en: 'Stone' }, { de: 'Grau', en: 'Grey' }, { de: 'Starr', en: 'Locked' },
      { de: 'Kalk', en: 'Chalk' }, { de: 'Fels', en: 'Crag' }, { de: 'Last', en: 'Weight' },
      { de: 'Grund', en: 'Bedrock' }, { de: 'Krust', en: 'Crust' }
    ],
    zweites: [
      { de: 'haut', en: 'skin' }, { de: 'starre', en: 'stillness' }, { de: 'last', en: 'burden' },
      { de: 'griff', en: 'grip' }, { de: 'glied', en: 'limb' }, { de: 'schlaf', en: 'sleep' },
      { de: 'fessel', en: 'shackle' }, { de: 'mal', en: 'mark' }
    ],
    einzeln: [
      { de: 'Graustarre', en: 'Grey Stillness' }, { de: 'Kalkhaut', en: 'Chalkskin' }, { de: 'Steinlast', en: 'Stoneweight' },
      { de: 'Krustenfieber', en: 'Crustfever' }, { de: 'Grundschlaf', en: 'Bedrock Sleep' }, { de: 'Starrglied', en: 'Locked Limb' }
    ],
    bilder: [
      { de: 'Der Stein', en: 'The stone' }, { de: 'Eine Schwere', en: 'A heaviness' }, { de: 'Die Starre', en: 'The stiffness' },
      { de: 'Eine Härte unter der Haut', en: 'A hardness under the skin' }
    ],
    gegenmittel: [
      { de: 'in anhaltender Wärme', en: 'in steady warmth' }, { de: 'mit Öl und kundigen Händen', en: 'with oil and skilled hands' }, { de: 'in voller Ruhe', en: 'at full rest' },
      { de: 'in ständiger Bewegung', en: 'in constant motion' }
    ],
    orte: [
      { de: 'vor der Statue', en: 'before the statue' }, { de: 'im alten Gewölbe', en: 'in the old vault' }, { de: 'am geborstenen Siegel', en: 'at the cracked seal' },
      { de: 'in der Steinkammer', en: 'in the stone chamber' }
    ]
  },
  {
    id: 'blut',
    name: { de: 'Blut', en: 'Blood' },
    spuren: ['koerper', 'schaden', 'geist'],
    erstes: [
      { de: 'Blut', en: 'Blood' }, { de: 'Ader', en: 'Vein' }, { de: 'Rot', en: 'Red' },
      { de: 'Zehr', en: 'Wither' }, { de: 'Puls', en: 'Pulse' }, { de: 'Wund', en: 'Wound' },
      { de: 'Eisen', en: 'Iron' }, { de: 'Dünn', en: 'Thin' }
    ],
    zweites: [
      { de: 'durst', en: 'thirst' }, { de: 'zehrung', en: 'wasting' }, { de: 'verlust', en: 'loss' },
      { de: 'fluss', en: 'flow' }, { de: 'mal', en: 'mark' }, { de: 'ruf', en: 'calling' },
      { de: 'hunger', en: 'hunger' }, { de: 'schuld', en: 'debt' }
    ],
    einzeln: [
      { de: 'Blutdurst', en: 'Bloodthirst' }, { de: 'Dünnes Blut', en: 'Thin Blood' }, { de: 'Aderzehrung', en: 'Veinwither' },
      { de: 'Roter Ruf', en: 'Red Calling' }, { de: 'Wundmal', en: 'Wound Mark' }, { de: 'Pulsfieber', en: 'Pulse Fever' }
    ],
    bilder: [
      { de: 'Das Blut', en: 'The blood' }, { de: 'Ein Pochen', en: 'A throbbing' }, { de: 'Der Durst', en: 'The thirst' },
      { de: 'Die Schwäche', en: 'The weakness' }
    ],
    gegenmittel: [
      { de: 'bei Ruhe und warmer Kost', en: 'with rest and warm food' }, { de: 'mit festem Verband', en: 'with a tight bandage' }, { de: 'bei ruhigem Schlaf', en: 'in quiet sleep' },
      { de: 'unter der Hand eines Heilers', en: 'under a healer’s hand' }
    ],
    orte: [
      { de: 'am Altar', en: 'at the altar' }, { de: 'im Ring', en: 'in the ring' }, { de: 'nach der langen Jagd', en: 'after the long hunt' },
      { de: 'über dem geöffneten Grab', en: 'over the opened grave' }
    ]
  },
  {
    id: 'schatten',
    name: { de: 'Schatten', en: 'Shadow' },
    spuren: ['sinne', 'geist', 'verteidigung'],
    erstes: [
      { de: 'Schatten', en: 'Shade' }, { de: 'Dunkel', en: 'Dark' }, { de: 'Zwie', en: 'Twi' },
      { de: 'Ohne', en: 'Un' }, { de: 'Lösch', en: 'Snuff' }, { de: 'Grau', en: 'Grey' },
      { de: 'Nacht', en: 'Night' }, { de: 'Rand', en: 'Edge' }
    ],
    zweites: [
      { de: 'griff', en: 'grasp' }, { de: 'zehrung', en: 'wither' }, { de: 'wurf', en: 'cast' },
      { de: 'fessel', en: 'binding' }, { de: 'rand', en: 'edge' }, { de: 'gast', en: 'guest' },
      { de: 'blick', en: 'sight' }, { de: 'mantel', en: 'mantle' }
    ],
    einzeln: [
      { de: 'Schattenzehrung', en: 'Shadewither' }, { de: 'Lichtlos', en: 'Lightless' }, { de: 'Zwielichtblick', en: 'Twilight Sight' },
      { de: 'Randgänger', en: 'Edgewalker' }, { de: 'Löschgriff', en: 'Snuffing Grasp' }, { de: 'Ohne Schatten', en: 'Shadowless' }
    ],
    bilder: [
      { de: 'Der Schatten', en: 'The shadow' }, { de: 'Das Dunkel', en: 'The dark' }, { de: 'Ein Schatten im Rücken', en: 'A shadow at your back' },
      { de: 'Die Kälte im Rücken', en: 'The chill at your back' }
    ],
    gegenmittel: [
      { de: 'im hellen Licht', en: 'in bright light' }, { de: 'an einem geweihten Ort', en: 'at a hallowed place' }, { de: 'in Gesellschaft', en: 'in company' },
      { de: 'bei Sonnenaufgang', en: 'at sunrise' }
    ],
    orte: [
      { de: 'im Schattenwald', en: 'in the shadewood' }, { de: 'unter der erloschenen Laterne', en: 'under the dead lantern' }, { de: 'im fensterlosen Raum', en: 'in the windowless room' },
      { de: 'am Rand des Lichts', en: 'at the edge of the light' }
    ]
  },
  {
    id: 'zeit',
    name: { de: 'Zeit', en: 'Time' },
    spuren: ['geist', 'koerper', 'handlung'],
    erstes: [
      { de: 'Stunden', en: 'Hour' }, { de: 'Alter', en: 'Age' }, { de: 'Sand', en: 'Sand' },
      { de: 'Uhr', en: 'Clock' }, { de: 'Spät', en: 'Late' }, { de: 'Rück', en: 'Back' },
      { de: 'Vergess', en: 'Forget' }, { de: 'Gleich', en: 'Same' }
    ],
    zweites: [
      { de: 'zehrung', en: 'wither' }, { de: 'schlaf', en: 'sleep' }, { de: 'lauf', en: 'course' },
      { de: 'sucht', en: 'craving' }, { de: 'riss', en: 'tear' }, { de: 'last', en: 'burden' },
      { de: 'blick', en: 'sight' }, { de: 'staub', en: 'dust' }
    ],
    einzeln: [
      { de: 'Stundenzehrung', en: 'Hourwither' }, { de: 'Sandschlaf', en: 'Sandsleep' }, { de: 'Altersstaub', en: 'Agedust' },
      { de: 'Gleichlauf', en: 'Same Hour' }, { de: 'Rückriss', en: 'Backtear' }, { de: 'Vergessensucht', en: 'The Forgetting' }
    ],
    bilder: [
      { de: 'Die Zeit', en: 'Time' }, { de: 'Ein Nachhall', en: 'An echo' }, { de: 'Eine Lücke', en: 'A gap' },
      { de: 'Die späte Stunde', en: 'The late hour' }
    ],
    gegenmittel: [
      { de: 'in voller Ruhe', en: 'at full rest' }, { de: 'mit einem festen Anker', en: 'with a firm anchor' }, { de: 'in vertrauter Umgebung', en: 'in familiar surroundings' },
      { de: 'in völliger Ruhe', en: 'in complete quiet' }
    ],
    orte: [
      { de: 'in der stehenden Kammer', en: 'in the stilled chamber' }, { de: 'am gesprungenen Glas', en: 'at the cracked glass' }, { de: 'im Raum ohne Fenster', en: 'in the room without windows' },
      { de: 'an der falschen Stelle', en: 'at the wrong place' }
    ]
  },
  {
    id: 'klang',
    name: { de: 'Klang', en: 'Sound' },
    spuren: ['sinne', 'geist', 'handlung'],
    erstes: [
      { de: 'Glocken', en: 'Bell' }, { de: 'Hall', en: 'Echo' }, { de: 'Schrill', en: 'Shrill' },
      { de: 'Stumm', en: 'Mute' }, { de: 'Summ', en: 'Hum' }, { de: 'Dröhn', en: 'Drone' },
      { de: 'Ton', en: 'Note' }, { de: 'Lärm', en: 'Din' }
    ],
    zweites: [
      { de: 'hall', en: 'peal' }, { de: 'klang', en: 'tone' }, { de: 'taubheit', en: 'deafness' },
      { de: 'ruf', en: 'call' }, { de: 'zwang', en: 'compulsion' }, { de: 'faden', en: 'thread' },
      { de: 'sturm', en: 'storm' }, { de: 'kopf', en: 'head' }
    ],
    einzeln: [
      { de: 'Glockenhall', en: 'Bellringing' }, { de: 'Ohrensturm', en: 'Earstorm' }, { de: 'Stummer Ton', en: 'Silent Note' },
      { de: 'Summfieber', en: 'Humming Fever' }, { de: 'Dröhnkopf', en: 'Droning Head' }, { de: 'Schrillruf', en: 'Shrill Call' }
    ],
    bilder: [
      { de: 'Der Ton', en: 'The note' }, { de: 'Ein Summen', en: 'A humming' }, { de: 'Der Hall', en: 'The echo' },
      { de: 'Das Dröhnen', en: 'The drone' }
    ],
    gegenmittel: [
      { de: 'in der Stille', en: 'in silence' }, { de: 'mit verstopften Ohren', en: 'with stopped ears' }, { de: 'an einem stillen Ort', en: 'in a quiet place' },
      { de: 'tief unter der Erde', en: 'deep underground' }
    ],
    orte: [
      { de: 'im Glockenturm', en: 'in the bell tower' }, { de: 'in der hallenden Halle', en: 'in the echoing hall' }, { de: 'am singenden Stein', en: 'at the singing stone' },
      { de: 'mitten in der Schlacht', en: 'in the middle of the battle' }
    ]
  },
  {
    id: 'traum',
    name: { de: 'Traum', en: 'Dream' },
    spuren: ['geist', 'sinne', 'handlung'],
    erstes: [
      { de: 'Traum', en: 'Dream' }, { de: 'Schlaf', en: 'Sleep' }, { de: 'Wach', en: 'Waking' },
      { de: 'Nacht', en: 'Night' }, { de: 'Mohn', en: 'Poppy' }, { de: 'Schleier', en: 'Veil' },
      { de: 'Falsch', en: 'False' }, { de: 'Halb', en: 'Half' }
    ],
    zweites: [
      { de: 'fessel', en: 'bind' }, { de: 'wandel', en: 'walk' }, { de: 'gast', en: 'guest' },
      { de: 'sucht', en: 'craving' }, { de: 'faden', en: 'thread' }, { de: 'wache', en: 'vigil' },
      { de: 'riss', en: 'tear' }, { de: 'blick', en: 'sight' }
    ],
    einzeln: [
      { de: 'Traumfessel', en: 'Dreambind' }, { de: 'Wachschleier', en: 'Waking Veil' }, { de: 'Mohnsucht', en: 'Poppy Craving' },
      { de: 'Halbwache', en: 'Half Vigil' }, { de: 'Falschnacht', en: 'False Night' }, { de: 'Schlafwandel', en: 'Sleepwalk' }
    ],
    bilder: [
      { de: 'Der Traum', en: 'The dream' }, { de: 'Ein Schleier', en: 'A veil' }, { de: 'Die Müdigkeit', en: 'The weariness' },
      { de: 'Ein Sog ins Dunkle', en: 'A pull into the dark' }
    ],
    gegenmittel: [
      { de: 'in ungestörtem Schlaf', en: 'in undisturbed sleep' }, { de: 'mit kaltem Wasser', en: 'with cold water' }, { de: 'in hellem Tageslicht', en: 'in broad daylight' },
      { de: 'mit starkem Tee', en: 'with strong tea' }
    ],
    orte: [
      { de: 'im Mohnfeld', en: 'in the poppy field' }, { de: 'unter dem falschen Mond', en: 'under the false moon' }, { de: 'in der Kammer ohne Uhr', en: 'in the chamber without a clock' },
      { de: 'am Bett des Schläfers', en: 'at the sleeper’s bed' }
    ]
  },
  {
    id: 'tiefe',
    name: { de: 'Tiefe', en: 'Depths' },
    spuren: ['koerper', 'bewegung', 'sinne'],
    erstes: [
      { de: 'Tief', en: 'Deep' }, { de: 'Druck', en: 'Pressure' }, { de: 'Salz', en: 'Salt' },
      { de: 'Ertrink', en: 'Drowning' }, { de: 'Flut', en: 'Tide' }, { de: 'Schlund', en: 'Maw' },
      { de: 'Grund', en: 'Bottom' }, { de: 'Nass', en: 'Sodden' }
    ],
    zweites: [
      { de: 'last', en: 'weight' }, { de: 'atem', en: 'breath' }, { de: 'griff', en: 'grip' },
      { de: 'zehrung', en: 'wasting' }, { de: 'ruf', en: 'call' }, { de: 'stille', en: 'silence' },
      { de: 'fessel', en: 'shackle' }, { de: 'husten', en: 'cough' }
    ],
    einzeln: [
      { de: 'Wasserlunge', en: 'Waterlung' }, { de: 'Druckstarre', en: 'Pressure Lock' }, { de: 'Salzhusten', en: 'Salt Cough' },
      { de: 'Flutruf', en: 'Tidecall' }, { de: 'Grundstille', en: 'Deep Silence' }, { de: 'Ertrinkenslast', en: 'Drowning Weight' }
    ],
    bilder: [
      { de: 'Das Wasser', en: 'The water' }, { de: 'Der Druck', en: 'The pressure' }, { de: 'Ein Husten', en: 'A cough' },
      { de: 'Die Tiefe', en: 'The deep' }
    ],
    gegenmittel: [
      { de: 'an frischer Luft', en: 'in fresh air' }, { de: 'an Land', en: 'ashore' }, { de: 'mit warmem Trank', en: 'with a warm draught' },
      { de: 'unter kundigen Händen', en: 'under skilled hands' }
    ],
    orte: [
      { de: 'unter Wasser', en: 'underwater' }, { de: 'im gefluteten Gang', en: 'in the flooded passage' }, { de: 'an der Küste im Sturm', en: 'on the coast in a storm' },
      { de: 'am Grund', en: 'at the bottom' }
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
  { zeichen: '✹', farbe: '#d9662f', themen: ['feuer'] },
  { zeichen: '☀', farbe: '#e0a33a', themen: ['hitze'] },
  { zeichen: '☠', farbe: '#7a9b4e', themen: ['gift'] },
  { zeichen: '✳', farbe: '#8fbf4a', themen: ['saeure'] },
  { zeichen: '☣', farbe: '#7f8a3a', themen: ['faeulnis'] },
  { zeichen: '✶', farbe: '#7fb0e0', themen: ['sturm'] },
  { zeichen: '◆', farbe: '#9a9086', themen: ['stein'] },
  { zeichen: '✱', farbe: '#b8434a', themen: ['blut'] },
  { zeichen: '◐', farbe: '#6f6a85', themen: ['schatten'] },
  { zeichen: '☾', farbe: '#9a7ad6', themen: ['wahnsinn'] },
  { zeichen: '✦', farbe: '#d9c26a', themen: ['licht'] },
  { zeichen: '◈', farbe: '#5aa5a0', themen: ['leere'] },
  { zeichen: '⌛', farbe: '#c2a878', themen: ['zeit'] },
  { zeichen: '♪', farbe: '#b07fc4', themen: ['klang'] },
  { zeichen: '☁', farbe: '#8c9ec4', themen: ['traum'] },
  { zeichen: '≈', farbe: '#4e8fa0', themen: ['tiefe'] },
  // Zwei ohne festes Thema. Sie greifen, wenn jemand ein Thema hinzufuegt
  // und das Sinnbild vergisst — besser ein neutrales Zeichen als keins.
  { zeichen: '✧', farbe: '#7a8ca8', themen: [] },
  { zeichen: '⌂', farbe: '#9a8f7a', themen: [] }
];
