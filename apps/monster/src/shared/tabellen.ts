/**
 * Die Tabellen des Monster Creators.
 *
 * Wie in den anderen Werkzeugen der Sammlung: zweisprachige Paare, und
 * genug davon, dass zwei Wuerfe nicht gleich aussehen. Fuenf Eintraege je
 * Liste waeren nach einem Abend durchschaut.
 *
 * Die ROLLEN sind keine Erfindung: sie stammen aus derselben CC-BY-Quelle
 * wie die Richtwerte (Namensnennung in richtwerte.ts und NOTICE.md). Die
 * Beschreibungen sind eigene Worte, die Einteilung ist es nicht.
 */

import type { SchadensartId } from './schadensarten';

export type Sprache = 'de' | 'en';

export interface Paar {
  readonly de: string;
  readonly en: string;
}

export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'en' ? paar.en : paar.de;
}

/* ---------- Themen: was fuer ein Wesen es ist ---------- */

export interface Thema {
  readonly id: string;
  readonly name: Paar;
  /**
   * Woraus die Namen gebaut werden.
   *
   * Zwei Teile ergeben „Grabwandler" — das traegt eine Weile und faellt dann
   * auf, weil immer dieselben acht Bausteine wiederkommen. Deshalb sind es
   * jetzt sechzehn je Liste, und es gibt einen dritten Weg.
   */
  readonly erstes: readonly Paar[];
  readonly zweites: readonly Paar[];
  /**
   * Namen, die fuer sich stehen: „Wolf", „Ghul", „Räuberhauptmann".
   *
   * Nicht jedes Monster heisst wie eine Zusammensetzung aus zwei Woertern.
   * Die Haelfte aller Wesen im Regelwerk traegt einen einzelnen Namen, und
   * bei Tieren ist es ohnehin die einzige Form, die nicht albern klingt.
   */
  readonly einzeln: readonly Paar[];
  /**
   * Schadensarten, die zu diesem Wesen passen — als Kennung, nicht als Text.
   *
   * Die Kennung, weil dieselbe Art an drei Stellen auftaucht: im Angriff, in
   * den Resistenzen und im Statblock. Zwei Schreibweisen desselben Feuers
   * waeren zwei Dinge, die nur zufaellig gleich aussehen.
   */
  readonly schaden: readonly SchadensartId[];
}

export const THEMEN: readonly Thema[] = [
  {
    id: 'untot',
    name: { de: 'Untot', en: 'Undead' },
    erstes: [
      { de: 'Grab', en: 'Grave' }, { de: 'Knochen', en: 'Bone' }, { de: 'Leichen', en: 'Corpse' },
      { de: 'Gruft', en: 'Crypt' }, { de: 'Toten', en: 'Death' }, { de: 'Asche', en: 'Ash' },
      { de: 'Moder', en: 'Rot' }, { de: 'Schweige', en: 'Silent' }, { de: 'Grau', en: 'Grey' },
      { de: 'Leichen', en: 'Pale' }, { de: 'Nacht', en: 'Night' }, { de: 'Stein', en: 'Barrow' },
      { de: 'Grimm', en: 'Grim' }, { de: 'Kalt', en: 'Cold' }, { de: 'Hohl', en: 'Hollow' },
      { de: 'Seelen', en: 'Soul' }
    ],
    zweites: [
      { de: 'wandler', en: 'walker' }, { de: 'wächter', en: 'warden' }, { de: 'zehrer', en: 'gnawer' },
      { de: 'chor', en: 'choir' }, { de: 'hand', en: 'hand' }, { de: 'braut', en: 'bride' },
      { de: 'herold', en: 'herald' }, { de: 'schlund', en: 'maw' }, { de: 'kriecher', en: 'creeper' },
      { de: 'schreiter', en: 'strider' }, { de: 'sänger', en: 'singer' }, { de: 'bote', en: 'courier' },
      { de: 'mahner', en: 'mourner' }, { de: 'greif', en: 'grasp' }, { de: 'schatten', en: 'shade' },
      { de: 'hüter', en: 'keeper' }
    ],
    einzeln: [
      { de: 'Wiedergänger', en: 'Revenant' }, { de: 'Ghul', en: 'Ghoul' }, { de: 'Schemen', en: 'Wraith' },
      { de: 'Nachzehrer', en: 'Gravefeeder' }, { de: 'Gespenst', en: 'Spectre' }, { de: 'Balg', en: 'Husk' },
      { de: 'Vettel', en: 'Crone' }, { de: 'Knochenhaufen', en: 'Bonepile' }, { de: 'Totenwache', en: 'Deathwatch' },
      { de: 'Staubmann', en: 'Dustman' }, { de: 'Leichnam', en: 'Cadaver' }, { de: 'Grabwurm', en: 'Tombworm' }
    ],
    schaden: ['nekrotisch', 'kaelte', 'psychisch']
  },
  {
    id: 'bestie',
    name: { de: 'Bestie', en: 'Beast' },
    erstes: [
      { de: 'Dorn', en: 'Thorn' }, { de: 'Klauen', en: 'Claw' }, { de: 'Fell', en: 'Pelt' },
      { de: 'Nacht', en: 'Night' }, { de: 'Sumpf', en: 'Marsh' }, { de: 'Fels', en: 'Crag' },
      { de: 'Blut', en: 'Blood' }, { de: 'Winter', en: 'Winter' }, { de: 'Donner', en: 'Thunder' },
      { de: 'Schilf', en: 'Reed' }, { de: 'Hochland', en: 'Highland' }, { de: 'Narben', en: 'Scar' },
      { de: 'Grau', en: 'Grey' }, { de: 'Riesen', en: 'Dire' }, { de: 'Sturz', en: 'Fell' },
      { de: 'Nebel', en: 'Mist' }
    ],
    zweites: [
      { de: 'katze', en: 'cat' }, { de: 'hetzer', en: 'stalker' }, { de: 'reisser', en: 'render' },
      { de: 'läufer', en: 'runner' }, { de: 'brut', en: 'brood' }, { de: 'eber', en: 'boar' },
      { de: 'greif', en: 'griffon' }, { de: 'schwarm', en: 'swarm' }, { de: 'wolf', en: 'wolf' },
      { de: 'bär', en: 'bear' }, { de: 'hund', en: 'hound' }, { de: 'kater', en: 'tom' },
      { de: 'schleicher', en: 'prowler' }, { de: 'beisser', en: 'biter' }, { de: 'hirsch', en: 'stag' },
      { de: 'rabe', en: 'raven' }
    ],
    einzeln: [
      { de: 'Wolf', en: 'Wolf' }, { de: 'Bär', en: 'Bear' }, { de: 'Luchs', en: 'Lynx' },
      { de: 'Eber', en: 'Boar' }, { de: 'Vielfrass', en: 'Wolverine' }, { de: 'Rabe', en: 'Raven' },
      { de: 'Adler', en: 'Eagle' }, { de: 'Krokodil', en: 'Crocodile' }, { de: 'Panther', en: 'Panther' },
      { de: 'Elch', en: 'Elk' }, { de: 'Otter', en: 'Otter' }, { de: 'Hyäne', en: 'Hyena' },
      { de: 'Stier', en: 'Bull' }, { de: 'Wildkatze', en: 'Wildcat' }
    ],
    schaden: ['wucht', 'stich', 'gift']
  },
  {
    id: 'konstrukt',
    name: { de: 'Konstrukt', en: 'Construct' },
    erstes: [
      { de: 'Eisen', en: 'Iron' }, { de: 'Uhrwerk', en: 'Clockwork' }, { de: 'Stein', en: 'Stone' },
      { de: 'Messing', en: 'Brass' }, { de: 'Scherben', en: 'Shard' }, { de: 'Runen', en: 'Rune' },
      { de: 'Kessel', en: 'Cauldron' }, { de: 'Granit', en: 'Granite' }, { de: 'Kupfer', en: 'Copper' },
      { de: 'Blei', en: 'Lead' }, { de: 'Glas', en: 'Glass' }, { de: 'Ton', en: 'Clay' },
      { de: 'Zahnrad', en: 'Cog' }, { de: 'Schmelz', en: 'Forge' }, { de: 'Anker', en: 'Anchor' },
      { de: 'Pfeiler', en: 'Pillar' }
    ],
    zweites: [
      { de: 'diener', en: 'servitor' }, { de: 'wächter', en: 'sentinel' }, { de: 'koloss', en: 'colossus' },
      { de: 'faust', en: 'fist' }, { de: 'spinne', en: 'spider' }, { de: 'herz', en: 'heart' },
      { de: 'arbeiter', en: 'labourer' }, { de: 'gehäuse', en: 'casing' }, { de: 'läufer', en: 'strider' },
      { de: 'tor', en: 'gate' }, { de: 'schreiter', en: 'walker' }, { de: 'greifer', en: 'grabber' },
      { de: 'brenner', en: 'burner' }, { de: 'rumpf', en: 'hull' }, { de: 'wärter', en: 'attendant' },
      { de: 'schild', en: 'shield' }
    ],
    einzeln: [
      { de: 'Automat', en: 'Automaton' }, { de: 'Wächterstatue', en: 'Guardian Statue' }, { de: 'Lehmleib', en: 'Claybody' },
      { de: 'Schmiedeherz', en: 'Forgeheart' }, { de: 'Türwächter', en: 'Doorward' }, { de: 'Ambossgeist', en: 'Anvilmind' },
      { de: 'Blechmann', en: 'Tinman' }, { de: 'Steinerner', en: 'Stonebound' }, { de: 'Räderwerk', en: 'Gearworks' },
      { de: 'Siegelläufer', en: 'Sealstrider' }, { de: 'Splitterleib', en: 'Shardframe' }, { de: 'Ofen', en: 'Furnace' }
    ],
    schaden: ['wucht', 'blitz', 'feuer']
  },
  {
    id: 'aberration',
    name: { de: 'Aberration', en: 'Aberration' },
    erstes: [
      { de: 'Leeren', en: 'Void' }, { de: 'Flüster', en: 'Whisper' }, { de: 'Traum', en: 'Dream' },
      { de: 'Spiegel', en: 'Mirror' }, { de: 'Tiefen', en: 'Deep' }, { de: 'Fremd', en: 'Strange' },
      { de: 'Zwischen', en: 'Between' }, { de: 'Kriech', en: 'Crawling' }, { de: 'Falt', en: 'Folded' },
      { de: 'Ohne', en: 'Nameless' }, { de: 'Wund', en: 'Raw' }, { de: 'Schwind', en: 'Waning' },
      { de: 'Sternen', en: 'Star' }, { de: 'Salz', en: 'Salt' }, { de: 'Wirr', en: 'Tangled' },
      { de: 'Stumm', en: 'Mute' }
    ],
    zweites: [
      { de: 'auge', en: 'eye' }, { de: 'mund', en: 'mouth' }, { de: 'gedanke', en: 'thought' },
      { de: 'ranke', en: 'tendril' }, { de: 'gestalt', en: 'shape' }, { de: 'hunger', en: 'hunger' },
      { de: 'echo', en: 'echo' }, { de: 'saat', en: 'seed' }, { de: 'naht', en: 'seam' },
      { de: 'chor', en: 'chorus' }, { de: 'ding', en: 'thing' }, { de: 'knoten', en: 'knot' },
      { de: 'schlick', en: 'silt' }, { de: 'gast', en: 'guest' }, { de: 'wirt', en: 'host' },
      { de: 'riss', en: 'rift' }
    ],
    einzeln: [
      { de: 'Namenloses', en: 'The Nameless' }, { de: 'Gast', en: 'The Guest' }, { de: 'Wandelndes Auge', en: 'Walking Eye' },
      { de: 'Gedankenkriecher', en: 'Mindcrawler' }, { de: 'Salzwurm', en: 'Saltworm' }, { de: 'Faltenwesen', en: 'Foldling' },
      { de: 'Der Zwischenraum', en: 'The Between' }, { de: 'Traumsaat', en: 'Dreamseed' }, { de: 'Schlickmund', en: 'Siltmouth' },
      { de: 'Der Wirt', en: 'The Host' }, { de: 'Nahtgänger', en: 'Seamwalker' }, { de: 'Stille Menge', en: 'Silent Many' }
    ],
    schaden: ['psychisch', 'saeure', 'energie']
  },
  {
    id: 'elementar',
    name: { de: 'Elementar', en: 'Elemental' },
    erstes: [
      { de: 'Glut', en: 'Ember' }, { de: 'Frost', en: 'Frost' }, { de: 'Sturm', en: 'Storm' },
      { de: 'Schlamm', en: 'Mire' }, { de: 'Funken', en: 'Spark' }, { de: 'Salz', en: 'Salt' },
      { de: 'Rauch', en: 'Smoke' }, { de: 'Tiefsee', en: 'Abyssal' }, { de: 'Ascheregen', en: 'Cinder' },
      { de: 'Grund', en: 'Bedrock' }, { de: 'Böen', en: 'Gale' }, { de: 'Lava', en: 'Lava' },
      { de: 'Reif', en: 'Rime' }, { de: 'Staub', en: 'Dust' }, { de: 'Strömung', en: 'Current' },
      { de: 'Grollen', en: 'Rumble' }
    ],
    zweites: [
      { de: 'geborener', en: 'born' }, { de: 'wirbel', en: 'vortex' }, { de: 'gestalt', en: 'form' },
      { de: 'zunge', en: 'tongue' }, { de: 'kern', en: 'core' }, { de: 'welle', en: 'surge' },
      { de: 'faust', en: 'fist' }, { de: 'atem', en: 'breath' }, { de: 'herz', en: 'heart' },
      { de: 'säule', en: 'pillar' }, { de: 'schleier', en: 'veil' }, { de: 'bruch', en: 'break' },
      { de: 'läufer', en: 'strider' }, { de: 'mantel', en: 'mantle' }, { de: 'stimme', en: 'voice' },
      { de: 'grat', en: 'ridge' }
    ],
    einzeln: [
      { de: 'Flammenzunge', en: 'Flametongue' }, { de: 'Frostgeborener', en: 'Frostborn' }, { de: 'Windsbraut', en: 'Galewife' },
      { de: 'Steinherz', en: 'Stoneheart' }, { de: 'Aschewolke', en: 'Ashcloud' }, { de: 'Wasserhose', en: 'Waterspout' },
      { de: 'Glutkern', en: 'Emberkern' }, { de: 'Salzsäule', en: 'Saltpillar' }, { de: 'Erdgroll', en: 'Earthgrowl' },
      { de: 'Dunstgestalt', en: 'Hazeform' }, { de: 'Blitzschlag', en: 'Thunderstrike' }, { de: 'Schlickwelle', en: 'Mirewave' }
    ],
    schaden: ['feuer', 'kaelte', 'blitz', 'donner']
  },
  {
    id: 'unhold',
    name: { de: 'Unhold', en: 'Fiend' },
    erstes: [
      { de: 'Pech', en: 'Pitch' }, { de: 'Schwefel', en: 'Sulphur' }, { de: 'Pakt', en: 'Pact' },
      { de: 'Grimm', en: 'Wrath' }, { de: 'Schuld', en: 'Debt' }, { de: 'Höllen', en: 'Hell' },
      { de: 'Rauch', en: 'Cinder' }, { de: 'Zorn', en: 'Spite' }, { de: 'Eid', en: 'Oath' },
      { de: 'Gier', en: 'Greed' }, { de: 'Qual', en: 'Torment' }, { de: 'Siegel', en: 'Seal' },
      { de: 'Blut', en: 'Blood' }, { de: 'Asche', en: 'Ash' }, { de: 'Ruß', en: 'Soot' },
      { de: 'Kettengrund', en: 'Chainhold' }
    ],
    zweites: [
      { de: 'schreiber', en: 'scribe' }, { de: 'treiber', en: 'driver' }, { de: 'zunge', en: 'tongue' },
      { de: 'klaue', en: 'talon' }, { de: 'vollstrecker', en: 'enforcer' }, { de: 'fürst', en: 'lord' },
      { de: 'bote', en: 'envoy' }, { de: 'kette', en: 'chain' }, { de: 'händler', en: 'broker' },
      { de: 'wächter', en: 'warden' }, { de: 'mahner', en: 'duns' }, { de: 'zeuge', en: 'witness' },
      { de: 'schnitter', en: 'reaper' }, { de: 'schlund', en: 'maw' }, { de: 'hüter', en: 'keeper' },
      { de: 'werber', en: 'recruiter' }
    ],
    einzeln: [
      { de: 'Schuldeintreiber', en: 'Debt Collector' }, { de: 'Rauchfürst', en: 'Cinder Lord' }, { de: 'Kettenschmied', en: 'Chainsmith' },
      { de: 'Eidbrecher', en: 'Oathbreaker' }, { de: 'Der Zeuge', en: 'The Witness' }, { de: 'Schwefelmaul', en: 'Sulphurmaw' },
      { de: 'Pechhund', en: 'Pitchhound' }, { de: 'Siegelträger', en: 'Sealbearer' }, { de: 'Qualmeister', en: 'Tormentmaster' },
      { de: 'Der Händler', en: 'The Broker' }, { de: 'Aschebote', en: 'Ashherald' }, { de: 'Grimmklaue', en: 'Wrathtalon' }
    ],
    schaden: ['feuer', 'nekrotisch', 'gift']
  },
  {
    id: 'fee',
    name: { de: 'Fee', en: 'Fey' },
    erstes: [
      { de: 'Dorn', en: 'Bramble' }, { de: 'Tau', en: 'Dew' }, { de: 'Mond', en: 'Moon' },
      { de: 'Nebel', en: 'Mist' }, { de: 'Pilz', en: 'Toadstool' }, { de: 'Wurzel', en: 'Root' },
      { de: 'Distel', en: 'Thistle' }, { de: 'Glöckchen', en: 'Bell' }, { de: 'Frost', en: 'Rime' },
      { de: 'Honig', en: 'Honey' }, { de: 'Zwielicht', en: 'Twilight' }, { de: 'Klage', en: 'Keening' },
      { de: 'Weiden', en: 'Willow' }, { de: 'Torf', en: 'Peat' }, { de: 'Lampen', en: 'Lantern' },
      { de: 'Reif', en: 'Hoar' }
    ],
    zweites: [
      { de: 'spieler', en: 'piper' }, { de: 'hüter', en: 'keeper' }, { de: 'geselle', en: 'fellow' },
      { de: 'tänzer', en: 'dancer' }, { de: 'flüsterer', en: 'whisperer' }, { de: 'freier', en: 'suitor' },
      { de: 'schelm', en: 'trickster' }, { de: 'lockruf', en: 'lure' }, { de: 'gast', en: 'guest' },
      { de: 'braut', en: 'bride' }, { de: 'händlerin', en: 'pedlar' }, { de: 'wache', en: 'watch' },
      { de: 'sänger', en: 'singer' }, { de: 'ranke', en: 'vine' }, { de: 'kerze', en: 'candle' },
      { de: 'spuk', en: 'haunt' }
    ],
    einzeln: [
      { de: 'Irrlicht', en: 'Will-o-Wisp' }, { de: 'Wechselbalg', en: 'Changeling' }, { de: 'Moosweiblein', en: 'Mosswife' },
      { de: 'Der Pfeifer', en: 'The Piper' }, { de: 'Distelherr', en: 'Thistlelord' }, { de: 'Nebelmädchen', en: 'Mistmaiden' },
      { de: 'Tautrinker', en: 'Dewdrinker' }, { de: 'Rankenkönig', en: 'Vine King' }, { de: 'Lampenträger', en: 'Lanternbearer' },
      { de: 'Die Gastgeberin', en: 'The Hostess' }, { de: 'Klagevogel', en: 'Keening Bird' }, { de: 'Pilzfürst', en: 'Toadstool Lord' }
    ],
    schaden: ['psychisch', 'kaelte', 'stich']
  },
  {
    id: 'drache',
    name: { de: 'Drache', en: 'Dragon' },
    erstes: [
      { de: 'Schuppen', en: 'Scale' }, { de: 'Horte', en: 'Hoard' }, { de: 'Gipfel', en: 'Summit' },
      { de: 'Rauch', en: 'Smoke' }, { de: 'Sturz', en: 'Plunge' }, { de: 'Bernstein', en: 'Amber' },
      { de: 'Schwefel', en: 'Sulphur' }, { de: 'Sturm', en: 'Storm' }, { de: 'Grat', en: 'Ridge' },
      { de: 'Tief', en: 'Deep' }, { de: 'Asche', en: 'Ash' }, { de: 'Salz', en: 'Salt' },
      { de: 'Alt', en: 'Elder' }, { de: 'Brand', en: 'Scorch' }, { de: 'Klippen', en: 'Cliff' },
      { de: 'Glut', en: 'Ember' }
    ],
    zweites: [
      { de: 'schwinge', en: 'wing' }, { de: 'rachen', en: 'jaws' }, { de: 'wächter', en: 'warden' },
      { de: 'herr', en: 'lord' }, { de: 'brut', en: 'brood' }, { de: 'zahn', en: 'fang' },
      { de: 'schweif', en: 'tail' }, { de: 'kralle', en: 'claw' }, { de: 'atem', en: 'breath' },
      { de: 'auge', en: 'eye' }, { de: 'kamm', en: 'crest' }, { de: 'mutter', en: 'mother' },
      { de: 'vater', en: 'sire' }, { de: 'schrecken', en: 'terror' }, { de: 'schatten', en: 'shadow' },
      { de: 'grimm', en: 'wrath' }
    ],
    einzeln: [
      { de: 'Wyvern', en: 'Wyvern' }, { de: 'Lindwurm', en: 'Lindworm' }, { de: 'Drachling', en: 'Drakeling' },
      { de: 'Schuppenalter', en: 'Scaled Elder' }, { de: 'Der Hortwächter', en: 'The Hoardwarden' }, { de: 'Sturmschwinge', en: 'Stormwing' },
      { de: 'Aschekamm', en: 'Ashcrest' }, { de: 'Der Gipfelherr', en: 'The Summit Lord' }, { de: 'Salzrachen', en: 'Saltjaws' },
      { de: 'Bernsteinauge', en: 'Amber Eye' }, { de: 'Klippendrache', en: 'Cliff Drake' }, { de: 'Glutmutter', en: 'Ember Mother' }
    ],
    schaden: ['feuer', 'saeure', 'blitz', 'kaelte']
  },
  {
    id: 'humanoid',
    name: { de: 'Humanoid', en: 'Humanoid' },
    erstes: [
      { de: 'Eisen', en: 'Iron' }, { de: 'Narben', en: 'Scar' }, { de: 'Galgen', en: 'Gallow' },
      { de: 'Grenz', en: 'Border' }, { de: 'Söldner', en: 'Free' }, { de: 'Wege', en: 'Road' },
      { de: 'Hafen', en: 'Harbour' }, { de: 'Rot', en: 'Red' }, { de: 'Stumm', en: 'Quiet' },
      { de: 'Graben', en: 'Ditch' }, { de: 'Klingen', en: 'Blade' }, { de: 'Wacht', en: 'Watch' },
      { de: 'Schwarz', en: 'Black' }, { de: 'Fluss', en: 'River' }, { de: 'Wall', en: 'Rampart' },
      { de: 'Nacht', en: 'Night' }
    ],
    zweites: [
      { de: 'hauptmann', en: 'captain' }, { de: 'läufer', en: 'runner' }, { de: 'klinge', en: 'blade' },
      { de: 'schwur', en: 'oath' }, { de: 'bruder', en: 'brother' }, { de: 'schwester', en: 'sister' },
      { de: 'wache', en: 'guard' }, { de: 'bogen', en: 'bow' }, { de: 'faust', en: 'fist' },
      { de: 'mantel', en: 'cloak' }, { de: 'meister', en: 'master' }, { de: 'fänger', en: 'catcher' },
      { de: 'schmied', en: 'smith' }, { de: 'stimme', en: 'voice' }, { de: 'hand', en: 'hand' },
      { de: 'späher', en: 'scout' }
    ],
    einzeln: [
      { de: 'Räuberhauptmann', en: 'Bandit Captain' }, { de: 'Söldner', en: 'Mercenary' }, { de: 'Wegelagerer', en: 'Highwayman' },
      { de: 'Kultistin', en: 'Cultist' }, { de: 'Schwertmeister', en: 'Swordmaster' }, { de: 'Kopfgeldjäger', en: 'Bounty Hunter' },
      { de: 'Hehler', en: 'Fence' }, { de: 'Schmuggler', en: 'Smuggler' }, { de: 'Aufseher', en: 'Overseer' },
      { de: 'Fanatiker', en: 'Zealot' }, { de: 'Grenzwache', en: 'Borderguard' }, { de: 'Meuchler', en: 'Cutthroat' }
    ],
    schaden: ['hieb', 'stich', 'wucht']
  },
  {
    id: 'pflanze',
    name: { de: 'Pflanze', en: 'Plant' },
    erstes: [
      { de: 'Moor', en: 'Bog' }, { de: 'Ranken', en: 'Vine' }, { de: 'Rinden', en: 'Bark' },
      { de: 'Sporen', en: 'Spore' }, { de: 'Wurzel', en: 'Root' }, { de: 'Dickicht', en: 'Thicket' },
      { de: 'Fäulnis', en: 'Blight' }, { de: 'Nadel', en: 'Needle' }, { de: 'Torf', en: 'Peat' },
      { de: 'Schilf', en: 'Reed' }, { de: 'Dorn', en: 'Thorn' }, { de: 'Harz', en: 'Resin' },
      { de: 'Laub', en: 'Leaf' }, { de: 'Stamm', en: 'Trunk' }, { de: 'Efeu', en: 'Ivy' },
      { de: 'Knollen', en: 'Tuber' }
    ],
    zweites: [
      { de: 'kriecher', en: 'creeper' }, { de: 'greifer', en: 'grasper' }, { de: 'mantel', en: 'mantle' },
      { de: 'husten', en: 'cough' }, { de: 'würger', en: 'strangler' }, { de: 'leib', en: 'body' },
      { de: 'fänger', en: 'trap' }, { de: 'schleier', en: 'veil' }, { de: 'wächter', en: 'warden' },
      { de: 'mutter', en: 'mother' }, { de: 'kranz', en: 'wreath' }, { de: 'bett', en: 'bed' },
      { de: 'hüter', en: 'keeper' }, { de: 'schlinge', en: 'snare' }, { de: 'brut', en: 'brood' },
      { de: 'faust', en: 'fist' }
    ],
    einzeln: [
      { de: 'Rankenwürger', en: 'Vinestrangler' }, { de: 'Moorleib', en: 'Bogbody' }, { de: 'Rindenmann', en: 'Barkman' },
      { de: 'Sporenkranz', en: 'Sporewreath' }, { de: 'Dornenbett', en: 'Thornbed' }, { de: 'Efeuhüter', en: 'Ivywarden' },
      { de: 'Wurzelmutter', en: 'Rootmother' }, { de: 'Fäulnisherz', en: 'Blightheart' }, { de: 'Schilfschlinge', en: 'Reedsnare' },
      { de: 'Harzfalle', en: 'Resintrap' }, { de: 'Laubgänger', en: 'Leafwalker' }, { de: 'Knollenbrut', en: 'Tuberbrood' }
    ],
    schaden: ['gift', 'saeure', 'wucht']
  }
];

/* ---------- Rollen: wie es kaempft ---------- */

export interface Rolle {
  readonly id: string;
  readonly name: Paar;
  readonly satz: Paar;
  /**
   * Wie weit die Rolle die beiden Haelften auseinanderzieht, in GRADEN.
   *
   * Positiv heisst: haelt so viel laenger durch, wie es weniger austeilt.
   * Der Mittelwert bleibt damit genau auf dem eingestellten Grad — die Rolle
   * ist ein Regler fuer „anders" und nicht fuer „staerker".
   *
   * In Graden und nicht in Prozent, und das ist keine Feinheit: im mittleren
   * Bereich der Tabelle sind sechs Prozent Trefferpunkte ein voller Grad,
   * beim Schaden zehn. Mit Prozenten verschob sich eine Rolle bei CR 4
   * anders als bei CR 10, und die Haelfte aller erzeugten Monster fiel durch
   * die eigene Pruefung. Gefunden hat das der Test.
   */
  readonly verschiebung: number;
  /**
   * Punkte Ruestungsklasse ueber oder unter dem Richtwert.
   *
   * Hoechstens einer, und das ist eine harte Grenze mit Grund: ein Punkt RK
   * ist in der Pruefung rund zehn Prozent wirksame Trefferpunkte. Bei +2
   * hatte der Verteidiger seine ganze Verschiebung schon in der Ruestung
   * ausgegeben, und seine rohen Trefferpunkte mussten heruntergerechnet
   * werden, damit der Grad stimmt — er stand am Ende mit WENIGER
   * Trefferpunkten da als der Schuetze. Rechnerisch richtig, auf dem
   * Steckbrief offensichtlich falsch.
   */
  readonly rk: number;
}

export const ROLLEN: readonly Rolle[] = [
  {
    id: 'brecher',
    name: { de: 'Brecher', en: 'Bruiser' },
    satz: { de: 'Geht vorn hinein und bleibt dort.', en: 'Walks in first and stays there.' },
    verschiebung: 1.2, rk: 0
  },
  {
    id: 'schuetze',
    name: { de: 'Schütze', en: 'Artillery' },
    satz: {
      de: 'Trifft aus der Entfernung hart und fällt aus der Nähe schnell.',
      en: 'Hits hard from afar and falls fast up close.'
    },
    verschiebung: -1.5, rk: -1
  },
  {
    id: 'lauerer',
    name: { de: 'Lauerer', en: 'Ambusher' },
    satz: {
      de: 'Schlägt aus dem Verborgenen zu und verschwindet wieder.',
      en: 'Strikes from hiding and vanishes again.'
    },
    verschiebung: -1.2, rk: 0
  },
  {
    id: 'verteidiger',
    name: { de: 'Verteidiger', en: 'Defender' },
    satz: {
      de: 'Steht im Weg und lässt niemanden vorbei.',
      en: 'Stands in the way and lets nobody past.'
    },
    verschiebung: 1.5, rk: 1
  },
  {
    id: 'kontrolleur',
    name: { de: 'Kontrolleur', en: 'Controller' },
    satz: {
      de: 'Verschiebt, hält fest und nimmt Handlungen weg.',
      en: 'Moves, holds and takes actions away.'
    },
    verschiebung: 0.2, rk: 0
  },
  {
    id: 'plaenkler',
    name: { de: 'Plänkler', en: 'Skirmisher' },
    satz: {
      de: 'Kommt, trifft, ist wieder weg, bevor jemand zurückschlägt.',
      en: 'Comes in, hits, and is gone before anyone swings back.'
    },
    verschiebung: -0.8, rk: 1
  },
  {
    id: 'anfuehrer',
    name: { de: 'Anführer', en: 'Leader' },
    satz: {
      de: 'Macht die anderen gefährlich und ist allein wenig wert.',
      en: 'Makes the others dangerous and is little on its own.'
    },
    verschiebung: 0.6, rk: 0
  }
];

/* ---------- Umgebungen: wo es lebt ---------- */

/*
 * Die Umgebungen sind umgezogen: `umgebungen.ts`.
 *
 * Sie sind dort keine blosse Liste mehr, sondern tragen, zu welchen Themen
 * sie passen und ob es dort Wasser und grabbaren Boden gibt. Eine Liste von
 * Paaren konnte das nicht, und deshalb stand ein Elementar mit
 * Schwimmbewegung in der Wueste.
 */

/* ---------- Faehigkeiten ---------- */

/**
 * In welchen Abschnitt des Statblocks eine Faehigkeit gehoert.
 *
 * In D&D ist das keine Kosmetik, sondern der Unterschied zwischen „kann es
 * dauernd" und „kann es einmal pro Runde, statt anzugreifen". Ein Statblock,
 * der alles in einen Topf wirft, ist am Tisch nicht zu leiten.
 */
export type Kategorie = 'passiv' | 'aktion' | 'bonusaktion' | 'reaktion' | 'legendaer';

export interface Faehigkeit {
  readonly name: Paar;
  readonly text: Paar;
  readonly kategorie: Kategorie;
  /** Bei welchen Rollen sie passt. Leer heisst: bei allen. */
  readonly rollen?: readonly string[];
}

/**
 * Was ein Monster kann, ausser zuschlagen.
 *
 * Bewusst knapp gehalten: acht Faehigkeiten liest am Tisch niemand, und
 * lange Regeltexte werden ueberblaettert. Der Erzeuger gibt je nach Grad
 * ein bis drei.
 */
export const FAEHIGKEITEN: readonly Faehigkeit[] = [
  {
    name: { de: 'Umklammern', en: 'Restraining Grab' },
    kategorie: 'passiv',
    text: {
      de: 'Trifft es im Nahkampf, ist das Ziel gepackt und festgehalten; Befreien mit einer Stärke- oder Geschicklichkeitsprobe gegen SG {sg}.',
      en: 'On a melee hit the target is grappled and restrained; escaping takes a DC {sg} Strength or Dexterity check.'
    },
    rollen: ['brecher', 'verteidiger', 'kontrolleur']
  },
  {
    name: { de: 'Umwerfen', en: 'Knockdown' },
    kategorie: 'passiv',
    text: {
      de: 'Trifft es im Nahkampf, muss das Ziel eine Stärkerettung (SG {sg}) bestehen oder fällt hin.',
      en: 'On a melee hit the target must succeed on a DC {sg} Strength save or falls prone.'
    },
    rollen: ['brecher', 'verteidiger']
  },
  {
    name: { de: 'Ausweichender Schritt', en: 'Shifting Step' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Als Bonusaktion bewegt es sich bis zur Hälfte seiner Bewegungsrate, ohne Gelegenheitsangriffe auszulösen.',
      en: 'As a bonus action it moves up to half its speed without provoking opportunity attacks.'
    },
    rollen: ['plaenkler', 'lauerer', 'schuetze']
  },
  {
    name: { de: 'Aus dem Nichts', en: 'Out of Nowhere' },
    kategorie: 'passiv',
    text: {
      de: 'Greift es aus dem Verborgenen an, richtet der Treffer {kleinerSchaden} Schaden mehr an.',
      en: 'Attacking from hiding, its hit deals {kleinerSchaden} extra damage.'
    },
    rollen: ['lauerer']
  },
  {
    name: { de: 'Zehrende Nähe', en: 'Draining Presence' },
    kategorie: 'passiv',
    text: {
      de: 'Wer seinen Zug in 10 Fuß Nähe beginnt, nimmt {kleinerSchaden} {schadensart}. Dafür hat es einen Angriff weniger.',
      en: 'Anyone starting their turn within 10 feet takes {kleinerSchaden} {schadensart}. In exchange it has one attack fewer.'
    }
  },
  {
    name: { de: 'Ausbruch', en: 'Burst' },
    kategorie: 'aktion',
    text: {
      de: 'Als Aktion ein Ausbruch im Umkreis von 10 Fuß: {schaden} {schadensart}, bei bestandener Geschicklichkeitsrettung (SG {sg}) die Hälfte.',
      en: 'As an action, a burst in a 10-foot radius: {schaden} {schadensart}, or half on a successful DC {sg} Dexterity save.'
    },
    rollen: ['schuetze', 'kontrolleur', 'anfuehrer']
  },
  {
    name: { de: 'Befehl', en: 'Command' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Als Bonusaktion darf ein Verbündeter in 30 Fuß, den es sehen kann, sofort einen Angriff machen.',
      en: 'As a bonus action an ally within 30 feet that it can see makes one attack immediately.'
    },
    rollen: ['anfuehrer']
  },
  {
    name: { de: 'Zäher Brocken', en: 'Hard to Kill' },
    kategorie: 'passiv',
    text: {
      de: 'Fällt es zum ersten Mal auf 0 Trefferpunkte, bleibt es stattdessen mit 1 stehen.',
      en: 'The first time it drops to 0 hit points, it drops to 1 instead.'
    },
    rollen: ['brecher', 'verteidiger', 'anfuehrer']
  },
  {
    name: { de: 'Schmerzhafte Rüstung', en: 'Spiteful Hide' },
    kategorie: 'reaktion',
    text: {
      de: 'Wer es im Nahkampf trifft, nimmt selbst {kleinerSchaden} {schadensart}. Dafür hat es einen Angriff weniger.',
      en: 'Whoever hits it in melee takes {kleinerSchaden} {schadensart} in return. In exchange it has one attack fewer.'
    },
    rollen: ['verteidiger', 'brecher']
  },
  {
    name: { de: 'Flimmern', en: 'Blink' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Als Bonusaktion versetzt es sich bis zu 30 Fuß weit an eine sichtbare Stelle.',
      en: 'As a bonus action it teleports up to 30 feet to a space it can see.'
    },
    rollen: ['lauerer', 'plaenkler', 'kontrolleur']
  },
  {
    name: { de: 'Lähmender Blick', en: 'Binding Gaze' },
    kategorie: 'aktion',
    text: {
      de: 'Als Aktion: ein sichtbares Ziel muss eine Weisheitsrettung (SG {sg}) bestehen oder kann sich eine Runde nicht bewegen.',
      en: 'As an action, one visible target must succeed on a DC {sg} Wisdom save or cannot move for a round.'
    },
    rollen: ['kontrolleur', 'anfuehrer']
  },
  {
    name: { de: 'Weitergereichter Schmerz', en: 'Shared Pain' },
    kategorie: 'reaktion',
    text: {
      de: 'Erleidet es Schaden, kann es die Hälfte an einen willigen Verbündeten in 30 Fuß weitergeben.',
      en: 'When it takes damage it can pass half to a willing ally within 30 feet.'
    },
    rollen: ['anfuehrer']
  }
,
  {
    name: { de: 'Rudeltaktik', en: 'Pack Tactics' },
    kategorie: 'passiv',
    text: {
      de: 'Es hat Vorteil auf Angriffe, wenn ein Verbündeter neben dem Ziel steht.',
      en: 'It has advantage on attacks when an ally is next to the target.'
    },
    rollen: ['plaenkler', 'lauerer', 'brecher']
  },
  {
    name: { de: 'Amphibisch', en: 'Amphibious' },
    kategorie: 'passiv',
    text: { de: 'Es atmet Luft und Wasser.', en: 'It breathes air and water.' }
  },
  {
    name: { de: 'Falsche Erscheinung', en: 'False Appearance' },
    kategorie: 'passiv',
    text: {
      de: 'Solange es sich nicht bewegt, hält man es für einen gewöhnlichen Gegenstand; wer es durchschauen will, braucht eine Nachforschungsprobe gegen SG {sg}.',
      en: 'While it remains motionless it passes for an ordinary object; seeing through it takes a DC {sg} Investigation check.'
    },
    rollen: ['lauerer', 'verteidiger']
  },
  {
    name: { de: 'Belagerungsungeheuer', en: 'Siege Monster' },
    kategorie: 'passiv',
    text: {
      de: 'Gegen Bauwerke richtet es doppelten Schaden an.',
      en: 'It deals double damage to objects and structures.'
    },
    rollen: ['brecher', 'verteidiger']
  },
  {
    name: { de: 'Magieresistenz', en: 'Magic Resistance' },
    kategorie: 'passiv',
    text: {
      de: 'Es hat Vorteil auf Rettungswürfe gegen Zauber und andere magische Wirkungen.',
      en: 'It has advantage on saving throws against spells and other magical effects.'
    }
  },
  {
    name: { de: 'Wachsamkeit', en: 'Keen Senses' },
    kategorie: 'passiv',
    text: {
      de: 'Vorteil auf Wahrnehmung, die auf Geruch oder Gehör beruht. Es wird nicht überrascht.',
      en: 'Advantage on Perception checks relying on smell or hearing. It is not surprised.'
    }
  },
  {
    name: { de: 'Standhaft', en: 'Unyielding' },
    kategorie: 'passiv',
    text: {
      de: 'Es kann nicht verängstigt werden und hat Vorteil gegen Zwang, sich zu bewegen.',
      en: 'It cannot be frightened and has advantage against being moved against its will.'
    },
    rollen: ['verteidiger', 'brecher', 'anfuehrer']
  },
  {
    name: { de: 'Sonnenempfindlich', en: 'Sunlight Sensitivity' },
    kategorie: 'passiv',
    text: {
      de: 'Im Sonnenlicht hat es Nachteil auf Angriffe und auf Wahrnehmung mit den Augen.',
      en: 'In sunlight it has disadvantage on attacks and on Perception checks relying on sight.'
    }
  },
  {
    name: { de: 'Regeneration', en: 'Regeneration' },
    kategorie: 'passiv',
    text: {
      de: 'Zu Beginn seines Zuges heilt es {kleinerSchaden} Trefferpunkte, solange es seit der letzten Runde keinen Feuer- oder Säureschaden genommen hat.',
      en: 'At the start of its turn it regains {kleinerSchaden} hit points unless it took fire or acid damage since its last turn.'
    },
    rollen: ['verteidiger', 'brecher']
  },
  {
    name: { de: 'Schwebender Schritt', en: 'Weightless Step' },
    kategorie: 'passiv',
    text: {
      de: 'Schwieriges Gelände kostet es keine zusätzliche Bewegung.',
      en: 'Difficult terrain costs it no extra movement.'
    },
    rollen: ['plaenkler', 'lauerer']
  },
  {
    name: { de: 'Furchtbare Erscheinung', en: 'Dreadful Presence' },
    kategorie: 'passiv',
    text: {
      de: 'Wer seinen Zug in 30 Fuß Nähe beginnt und es sehen kann, muss eine Weisheitsrettung (SG {sg}) bestehen oder ist eine Runde lang verängstigt.',
      en: 'Anyone starting their turn within 30 feet who can see it must succeed on a DC {sg} Wisdom save or is frightened for a round.'
    },
    rollen: ['anfuehrer', 'brecher']
  },
  {
    name: { de: 'Blutgeruch', en: 'Scent of Blood' },
    kategorie: 'passiv',
    text: {
      de: 'Gegen Ziele unter der Hälfte ihrer Trefferpunkte richten seine Angriffe {kleinerSchaden} Schaden mehr an.',
      en: 'Its attacks deal {kleinerSchaden} extra damage against targets below half their hit points.'
    },
    rollen: ['brecher', 'plaenkler', 'lauerer']
  },
  {
    name: { de: 'Rückzug', en: 'Disengaging Step' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Es zieht sich seine volle Bewegungsrate weit zurück, ohne Gelegenheitsangriffe auszulösen.',
      en: 'It disengages and moves up to its full speed without provoking opportunity attacks.'
    },
    rollen: ['plaenkler', 'schuetze', 'lauerer']
  },
  {
    name: { de: 'Hetzen', en: 'Dash' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Es bewegt sich ein zweites Mal seine volle Bewegungsrate weit.',
      en: 'It moves up to its speed a second time.'
    },
    rollen: ['plaenkler', 'lauerer']
  },
  {
    name: { de: 'Verschwinden', en: 'Vanish' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Es versteckt sich, auch wenn es nur leicht verdeckt ist.',
      en: 'It hides, even when only lightly obscured.'
    },
    rollen: ['lauerer', 'schuetze']
  },
  {
    name: { de: 'Zielen', en: 'Take Aim' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Sein nächster Fernkampfangriff in dieser Runde hat Vorteil.',
      en: 'Its next ranged attack this turn has advantage.'
    },
    rollen: ['schuetze']
  },
  {
    name: { de: 'Antreiben', en: 'Rally' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Ein Verbündeter in 30 Fuß, den es sehen kann, bekommt Vorteil auf seinen nächsten Angriffswurf.',
      en: 'An ally within 30 feet that it can see gains advantage on its next attack roll.'
    },
    rollen: ['anfuehrer']
  },
  {
    name: { de: 'Wütender Ausfall', en: 'Reckless Lunge' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Seine Angriffe haben bis zum nächsten Zug Vorteil, Angriffe gegen es ebenfalls.',
      en: 'Its attacks have advantage until its next turn, and so do attacks against it.'
    },
    rollen: ['brecher']
  },
  {
    name: { de: 'Schattenschritt', en: 'Shadow Step' },
    kategorie: 'bonusaktion',
    text: {
      de: 'Aus einem Schatten heraus versetzt es sich in einen anderen in 60 Fuß Entfernung.',
      en: 'From one shadow it teleports to another within 60 feet.'
    },
    rollen: ['lauerer', 'kontrolleur']
  },
  {
    name: { de: 'Erschütternder Schlag', en: 'Staggering Blow' },
    kategorie: 'aktion',
    text: {
      de: 'Ein Ziel in Reichweite muss eine Konstitutionsrettung (SG {sg}) bestehen oder verliert seine Reaktion bis zu seinem nächsten Zug.',
      en: 'One target in reach must succeed on a DC {sg} Constitution save or loses its reaction until its next turn.'
    },
    rollen: ['brecher', 'verteidiger']
  },
  {
    name: { de: 'Fesselndes Netz', en: 'Entangling Web' },
    kategorie: 'aktion',
    text: {
      de: 'Ein Ziel in 30 Fuß muss eine Geschicklichkeitsrettung (SG {sg}) bestehen oder ist festgehalten, bis es sich befreit.',
      en: 'A target within 30 feet must succeed on a DC {sg} Dexterity save or is restrained until it breaks free.'
    },
    rollen: ['kontrolleur', 'lauerer']
  },
  {
    name: { de: 'Verderbtes Wort', en: 'Word of Ruin' },
    kategorie: 'aktion',
    text: {
      de: 'Ein hörendes Ziel in 60 Fuß muss eine Charismarettung (SG {sg}) bestehen oder nimmt {kleinerSchaden} psychischen Schaden und hat Nachteil auf seinen nächsten Wurf.',
      en: 'A target within 60 feet that can hear it must succeed on a DC {sg} Charisma save or takes {kleinerSchaden} psychic damage and has disadvantage on its next roll.'
    },
    rollen: ['anfuehrer', 'kontrolleur']
  },
  {
    name: { de: 'Herbeirufen', en: 'Call of the Pack' },
    kategorie: 'aktion',
    text: {
      de: 'Einmal am Tag ruft es 1d4 schwächere Verbündete herbei, die in der nächsten Runde eintreffen.',
      en: 'Once per day it calls 1d4 weaker allies, arriving on the following round.'
    },
    rollen: ['anfuehrer']
  },
  {
    name: { de: 'Boden aufreißen', en: 'Rend the Ground' },
    kategorie: 'aktion',
    text: {
      de: 'Ein Bereich von 10 Fuß wird zu schwierigem Gelände. Wer darin steht, fällt bei misslungener Geschicklichkeitsrettung (SG {sg}) hin.',
      en: 'A 10-foot area becomes difficult terrain. Creatures in it fall prone on a failed DC {sg} Dexterity save.'
    },
    rollen: ['kontrolleur', 'brecher']
  },
  {
    name: { de: 'Blendender Staub', en: 'Blinding Dust' },
    kategorie: 'aktion',
    text: {
      de: 'Ein Ziel in 15 Fuß muss eine Konstitutionsrettung (SG {sg}) bestehen oder ist bis zum Ende seines nächsten Zuges blind.',
      en: 'A target within 15 feet must succeed on a DC {sg} Constitution save or is blinded until the end of its next turn.'
    },
    rollen: ['lauerer', 'kontrolleur', 'plaenkler']
  },
  {
    name: { de: 'Lebenszehrung', en: 'Life Drain' },
    kategorie: 'aktion',
    text: {
      de: 'Ein Ziel in Reichweite nimmt {kleinerSchaden} nekrotischen Schaden, und das Monster heilt um denselben Betrag.',
      en: 'A target in reach takes {kleinerSchaden} necrotic damage and the monster regains that many hit points.'
    },
    rollen: ['brecher', 'kontrolleur']
  },
  {
    name: { de: 'Parade', en: 'Parry' },
    kategorie: 'reaktion',
    text: {
      de: 'Es erhöht seine Rüstungsklasse um {uebung} gegen einen Nahkampfangriff, den es kommen sieht.',
      en: 'It adds {uebung} to its AC against one melee attack it can see.'
    },
    rollen: ['verteidiger', 'plaenkler']
  },
  {
    name: { de: 'Gegenschlag', en: 'Riposte' },
    kategorie: 'reaktion',
    text: {
      de: 'Verfehlt es ein Nahkampfangriff, darf es sofort zurückschlagen.',
      en: 'When a melee attack misses it, it may immediately strike back.'
    },
    rollen: ['brecher', 'plaenkler']
  },
  {
    name: { de: 'Dazwischentreten', en: 'Interpose' },
    kategorie: 'reaktion',
    text: {
      de: 'Es nimmt den Schaden eines Angriffs auf sich, der einem Verbündeten in 5 Fuß gilt.',
      en: 'It takes the damage of an attack aimed at an ally within 5 feet.'
    },
    rollen: ['verteidiger', 'anfuehrer']
  },
  {
    name: { de: 'Rachedornen', en: 'Retributive Spines' },
    kategorie: 'reaktion',
    text: {
      de: 'Wer es aus der Nähe trifft, nimmt {kleinerSchaden} Stichschaden.',
      en: 'A creature that hits it from close range takes {kleinerSchaden} piercing damage.'
    },
    rollen: ['verteidiger', 'brecher']
  },
  {
    name: { de: 'Schwinden', en: 'Fade' },
    kategorie: 'reaktion',
    text: {
      de: 'Wird es getroffen, versetzt es sich bis zu 15 Fuß weit.',
      en: 'When hit, it teleports up to 15 feet away.'
    },
    rollen: ['lauerer', 'kontrolleur', 'schuetze']
  },
  {
    name: { de: 'Warnruf', en: 'Warning Cry' },
    kategorie: 'reaktion',
    text: {
      de: 'Wird ein Verbündeter angegriffen, darf dieser sich 10 Fuß weit bewegen.',
      en: 'When an ally is attacked, that ally may move 10 feet.'
    },
    rollen: ['anfuehrer', 'schuetze']
  },
  {
    name: { de: 'Streifen', en: 'Move' },
    kategorie: 'legendaer',
    text: {
      de: 'Es bewegt sich bis zur Hälfte seiner Bewegungsrate, ohne Gelegenheitsangriffe auszulösen.',
      en: 'It moves up to half its speed without provoking opportunity attacks.'
    }
  },
  {
    name: { de: 'Niederwerfen', en: 'Bear Down' },
    kategorie: 'legendaer',
    text: {
      de: 'Kostet 2 Aktionen. Ein Ziel in Reichweite muss eine Stärkerettung (SG {sg}) bestehen oder fällt hin und ist festgehalten, bis es sich befreit.',
      en: 'Costs 2 actions. A target in reach must succeed on a DC {sg} Strength save or falls prone and is restrained until it breaks free.'
    }
  },
  {
    name: { de: 'Verheerender Ausbruch', en: 'Devastating Surge' },
    kategorie: 'legendaer',
    text: {
      de: 'Kostet 2 Aktionen. Alle in 10 Fuß Umkreis nehmen {schaden} {schadensart}, bei bestandener Geschicklichkeitsrettung (SG {sg}) die Hälfte.',
      en: 'Costs 2 actions. Everyone within 10 feet takes {schaden} {schadensart}, or half on a successful DC {sg} Dexterity save.'
    }
  },
  {
    name: { de: 'Befehl erteilen', en: 'Issue Command' },
    kategorie: 'legendaer',
    text: {
      de: 'Ein Verbündeter in 30 Fuß, den es sehen kann, bewegt sich und greift einmal an.',
      en: 'An ally within 30 feet that it can see moves and makes one attack.'
    },
    rollen: ['anfuehrer', 'kontrolleur']
  },
  {
    name: { de: 'Zermürbender Blick', en: 'Withering Glare' },
    kategorie: 'legendaer',
    text: {
      de: 'Ein Ziel in 30 Fuß, das es sehen kann, muss eine Weisheitsrettung (SG {sg}) bestehen oder hat Nachteil auf seinen nächsten Angriff.',
      en: 'A target within 30 feet that it can see must succeed on a DC {sg} Wisdom save or has disadvantage on its next attack.'
    }
  },
  {
    name: { de: 'Platzwechsel', en: 'Change Places' },
    kategorie: 'legendaer',
    text: {
      de: 'Es tauscht den Platz mit einem Verbündeten in 30 Fuß. Beide lösen dabei keine Gelegenheitsangriffe aus.',
      en: 'It swaps places with an ally within 30 feet. Neither provokes opportunity attacks.'
    },
    rollen: ['anfuehrer', 'kontrolleur', 'plaenkler']
  },
  {
    name: { de: 'Boden aufreißen', en: 'Break the Ground' },
    kategorie: 'legendaer',
    text: {
      de: 'Kostet 2 Aktionen. Ein Bereich von 20 Fuß wird bis zum Ende seines nächsten Zuges zu schwierigem Gelände.',
      en: 'Costs 2 actions. A 20-foot area becomes difficult terrain until the end of its next turn.'
    }
  },
  {
    name: { de: 'Wunden schließen', en: 'Knit Shut' },
    kategorie: 'legendaer',
    text: {
      de: 'Kostet 2 Aktionen. Es heilt {kleinerSchaden} Trefferpunkte.',
      en: 'Costs 2 actions. It regains {kleinerSchaden} hit points.'
    },
    rollen: ['brocken', 'lauerer', 'schlaeger']
  },
  {
    name: { de: 'Heranziehen', en: 'Reel In' },
    kategorie: 'legendaer',
    text: {
      de: 'Ein Ziel in 30 Fuß muss eine Stärkerettung (SG {sg}) bestehen oder wird 20 Fuß zu ihm gezogen.',
      en: 'A target within 30 feet must succeed on a DC {sg} Strength save or is pulled 20 feet towards it.'
    }
  },
  {
    name: { de: 'Entwaffnen', en: 'Strip Away' },
    kategorie: 'legendaer',
    text: {
      de: 'Ein Ziel in Reichweite muss eine Stärkerettung (SG {sg}) bestehen oder lässt fallen, was es in einer Hand hält.',
      en: 'A target in reach must succeed on a DC {sg} Strength save or drops what it holds in one hand.'
    },
    rollen: ['plaenkler', 'lauerer', 'schlaeger']
  },
  {
    name: { de: 'Ins Auge fassen', en: 'Single Out' },
    kategorie: 'legendaer',
    text: {
      de: 'Es fasst ein Ziel ins Auge. Bis zum Ende seines nächsten Zuges haben seine Angriffe dagegen Vorteil.',
      en: 'It singles out a target. Until the end of its next turn its attacks against that target have advantage.'
    }
  },
  {
    name: { de: 'Schneise', en: 'Cut a Swathe' },
    kategorie: 'legendaer',
    text: {
      de: 'Kostet 2 Aktionen. Eine Linie von 30 Fuß Länge und 5 Fuß Breite: {schaden} {schadensart}, bei bestandener Geschicklichkeitsrettung (SG {sg}) die Hälfte.',
      en: 'Costs 2 actions. A line 30 feet long and 5 feet wide: {schaden} {schadensart}, or half on a successful DC {sg} Dexterity save.'
    }
  },
  {
    name: { de: 'Überspringen', en: 'Arc Across' },
    kategorie: 'legendaer',
    text: {
      de: 'Kostet 2 Aktionen. Bis zu drei Ziele in 30 Fuß, keines weiter als 15 Fuß vom vorigen: je {kleinerSchaden} {schadensart}.',
      en: 'Costs 2 actions. Up to three targets within 30 feet, none more than 15 feet from the last: {kleinerSchaden} {schadensart} each.'
    },
    rollen: ['schuetze', 'kontrolleur']
  },
  {
    name: { de: 'Verhüllen', en: 'Veil' },
    kategorie: 'legendaer',
    text: {
      de: 'Bis zum Ende seines nächsten Zuges ist ein Umkreis von 15 Fuß um es herum stark verschleiert. Es selbst sieht hindurch.',
      en: 'Until the end of its next turn a 15-foot radius around it is heavily obscured. It sees through the effect.'
    },
    rollen: ['lauerer', 'plaenkler', 'kontrolleur']
  },
  {
    name: { de: 'Abschütteln', en: 'Shake It Off' },
    kategorie: 'legendaer',
    text: {
      de: 'Kostet 2 Aktionen. Es wiederholt einen Rettungswurf gegen eine Wirkung, die es beeinträchtigt, und beendet sie bei Erfolg.',
      en: 'Costs 2 actions. It repeats one saving throw against an effect on it, ending the effect on a success.'
    }
  },
  {
    name: { de: 'Wer weicht, blutet', en: 'Nowhere to Go' },
    kategorie: 'legendaer',
    text: {
      de: 'Bis zum Beginn seines nächsten Zuges nimmt jede Kreatur, die seine Reichweite verlässt, {kleinerSchaden} {schadensart}.',
      en: 'Until the start of its next turn, any creature that leaves its reach takes {kleinerSchaden} {schadensart}.'
    },
    rollen: ['brocken', 'schlaeger', 'lauerer']
  },
  {
    name: { de: 'Anfeuern', en: 'Spur On' },
    kategorie: 'legendaer',
    text: {
      de: 'Ein Verbündeter in 30 Fuß richtet mit seinem nächsten Treffer {kleinerSchaden} Schaden mehr an.',
      en: 'An ally within 30 feet deals {kleinerSchaden} extra damage on its next hit.'
    },
    rollen: ['anfuehrer']
  },
  {
    name: { de: 'Zunge lähmen', en: 'Still the Tongue' },
    kategorie: 'legendaer',
    text: {
      de: 'Ein Ziel in 60 Fuß muss eine Konstitutionsrettung (SG {sg}) bestehen oder kann bis zum Ende seines nächsten Zuges nicht zaubern.',
      en: 'A target within 60 feet must succeed on a DC {sg} Constitution save or cannot cast spells until the end of its next turn.'
    },
    rollen: ['kontrolleur', 'anfuehrer', 'schuetze']
  }
];
