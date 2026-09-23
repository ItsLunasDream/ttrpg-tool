/**
 * Die Tabellen des Magic Item Creators: Arten, Wirkungen, Namen.
 *
 * Zweisprachig als Paar, wie in den anderen Werkzeugen. Die Wirkungen sind
 * EIGENE Formulierungen nach dem Muster, das man aus dem Regelwerk kennt
 * („+1 auf Angriffs- und Schadenswuerfe"), keine abgeschriebenen Gegenstaende.
 *
 * Jede Wirkung sagt, ab welcher Seltenheit sie vorkommt und bei welchen Arten.
 * Welche Seltenheit eine Wirkung „wert ist", ist unsere Einschaetzung — das
 * Regelwerk kennt keine Formel dafuer (docs/magicitems.md). Die Eichung an
 * SRD-Gegenstaenden ist ein eigener Schritt (#143).
 */
import type { Paar, Seltenheit } from '@suite/srd';

export const ARTEN = [
  'waffe',
  'ruestung',
  'schild',
  'wundersam',
  'ring',
  'stab',
  'trank',
  'schriftrolle'
] as const;
export type Art = (typeof ARTEN)[number];

export const ART_NAME: Record<Art, Paar> = {
  waffe: { de: 'Waffe', en: 'Weapon' },
  ruestung: { de: 'Rüstung', en: 'Armor' },
  schild: { de: 'Schild', en: 'Shield' },
  wundersam: { de: 'Wundersamer Gegenstand', en: 'Wondrous Item' },
  ring: { de: 'Ring', en: 'Ring' },
  stab: { de: 'Zauberstab', en: 'Wand' },
  trank: { de: 'Trank', en: 'Potion' },
  schriftrolle: { de: 'Schriftrolle', en: 'Scroll' }
};

/** Ein Zeichen je Art, fuer die Kacheln. */
export const ART_ZEICHEN: Record<Art, string> = {
  waffe: '⚔',
  ruestung: '⛨',
  schild: '⛉',
  wundersam: '✧',
  ring: '◯',
  stab: '⚚',
  trank: '⚱',
  schriftrolle: '✉'
};

/** Verbraucht sich beim Benutzen (halber Wert nach dem SRD). */
export const VERBRAUCH: Record<Art, boolean> = {
  waffe: false,
  ruestung: false,
  schild: false,
  wundersam: false,
  ring: false,
  stab: false,
  trank: true,
  schriftrolle: true
};

export const STUFE: Record<Seltenheit, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  veryRare: 3,
  legendary: 4
};

/**
 * Eine Wirkung. `text` traegt Platzhalter, die der Erzeuger aus `werte`
 * fuellt: {bonus}, {schaden}, {art}, {zauber}, {ladungen}, {wurf}.
 */
export interface Wirkung {
  readonly id: string;
  readonly arten: readonly Art[];
  /** Ab dieser Seltenheit (Stufe 0 bis 4). */
  readonly ab: number;
  /** Bis zu dieser Seltenheit. */
  readonly bis: number;
  /** Braucht der Gegenstand Einstimmung, wenn er diese Wirkung traegt? */
  readonly einstimmung: boolean;
  readonly text: Paar;
  /**
   * Wie {bonus} aus der Seltenheit folgt. Ohne Angabe: Ungewoehnlich +1,
   * Selten +2, Sehr selten +3. `versatz: -1` fuer Ruestungen (Selten +1),
   * `fest` fuer einen Bonus, der nicht mitwaechst (Schutzumhang: immer +1).
   * Beides aus den Eichpunkten des SRD, siehe eichpunkte.ts.
   */
  readonly bonus?: { readonly versatz?: number; readonly fest?: number };
}

export const SCHADENSARTEN: readonly Paar[] = [
  { de: 'Feuer', en: 'Fire' },
  { de: 'Kälte', en: 'Cold' },
  { de: 'Blitz', en: 'Lightning' },
  { de: 'Säure', en: 'Acid' },
  { de: 'Gift', en: 'Poison' },
  { de: 'Schall', en: 'Thunder' },
  { de: 'Nekrotisch', en: 'Necrotic' },
  { de: 'Gleißend', en: 'Radiant' },
  { de: 'Psychisch', en: 'Psychic' }
];

export const KREATURENTYPEN: readonly Paar[] = [
  { de: 'Untote', en: 'Undead' },
  { de: 'Drachen', en: 'Dragons' },
  { de: 'Unholde', en: 'Fiends' },
  { de: 'Riesen', en: 'Giants' },
  { de: 'Aberrationen', en: 'Aberrations' },
  { de: 'Feenwesen', en: 'Fey' },
  { de: 'Monstrositäten', en: 'Monstrosities' },
  { de: 'Konstrukte', en: 'Constructs' }
];

export const ZUSTAENDE: readonly Paar[] = [
  { de: 'Verängstigt', en: 'Frightened' },
  { de: 'Bezaubert', en: 'Charmed' },
  { de: 'Vergiftet', en: 'Poisoned' },
  { de: 'Gelähmt', en: 'Paralyzed' },
  { de: 'Liegend', en: 'Prone' },
  { de: 'Festgesetzt', en: 'Restrained' }
];

/** Zauber je Grad, fuer Stab und Schriftrolle. Namen wie im SRD 5.2.1. */
export const ZAUBER: readonly (readonly Paar[])[] = [
  [
    { de: 'Feuerpfeil', en: 'Fire Bolt' },
    { de: 'Licht', en: 'Light' },
    { de: 'Magierhand', en: 'Mage Hand' }
  ],
  [
    { de: 'Magisches Geschoss', en: 'Magic Missile' },
    { de: 'Wunden heilen', en: 'Cure Wounds' },
    { de: 'Schild', en: 'Shield' },
    { de: 'Donnerwoge', en: 'Thunderwave' }
  ],
  [
    { de: 'Unsichtbarkeit', en: 'Invisibility' },
    { de: 'Nebelschritt', en: 'Misty Step' },
    { de: 'Person festhalten', en: 'Hold Person' }
  ],
  [
    { de: 'Feuerball', en: 'Fireball' },
    { de: 'Blitz', en: 'Lightning Bolt' },
    { de: 'Fliegen', en: 'Fly' },
    { de: 'Gegenzauber', en: 'Counterspell' }
  ],
  [
    { de: 'Verwandlung', en: 'Polymorph' },
    { de: 'Dimensionstür', en: 'Dimension Door' },
    { de: 'Eissturm', en: 'Ice Storm' }
  ],
  [
    { de: 'Kältekegel', en: 'Cone of Cold' },
    { de: 'Monster festhalten', en: 'Hold Monster' }
  ],
  [
    { de: 'Kettenblitz', en: 'Chain Lightning' },
    { de: 'Auflösung', en: 'Disintegrate' }
  ],
  [{ de: 'Teleportieren', en: 'Teleport' }],
  [{ de: 'Sonnenstrahl', en: 'Sunburst' }],
  [{ de: 'Wunsch', en: 'Wish' }]
];

export const WIRKUNGEN: readonly Wirkung[] = [
  // --- Waffen -------------------------------------------------------------
  {
    id: 'waffe-bonus',
    arten: ['waffe'],
    ab: 1,
    bis: 3,
    einstimmung: false,
    text: {
      de: 'Du erhältst {bonus} auf Angriffs- und Schadenswürfe mit dieser magischen Waffe.',
      en: 'You gain a {bonus} bonus to attack rolls and damage rolls made with this magic weapon.'
    }
  },
  {
    id: 'waffe-element',
    arten: ['waffe'],
    ab: 2,
    bis: 4,
    einstimmung: true,
    text: {
      de: 'Bei einem Treffer verursacht die Waffe zusätzlich {schaden} {art}schaden.',
      en: 'On a hit, the weapon deals an extra {schaden} {art} damage.'
    }
  },
  {
    id: 'waffe-bann',
    arten: ['waffe'],
    ab: 2,
    bis: 3,
    einstimmung: false,
    text: {
      de: 'Gegen {typ} verursacht die Waffe zusätzlich {schaden} Schaden der Waffenart.',
      en: 'Against {typ}, the weapon deals an extra {schaden} damage of the weapon’s type.'
    }
  },
  {
    id: 'waffe-rueckkehr',
    arten: ['waffe'],
    ab: 1,
    bis: 2,
    einstimmung: false,
    text: {
      de: 'Nach einem Fernkampfangriff fliegt die Waffe sofort in deine Hand zurück.',
      en: 'Immediately after you make a ranged attack with it, the weapon flies back to your hand.'
    }
  },
  {
    id: 'waffe-licht',
    arten: ['waffe'],
    ab: 0,
    bis: 1,
    einstimmung: false,
    text: {
      de: 'Auf ein Befehlswort gibt die Klinge helles Licht in 3 Metern und dämmriges Licht in weiteren 3 Metern ab.',
      en: 'On a command word, the weapon sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet.'
    }
  },
  // --- Ruestung und Schild --------------------------------------------------
  {
    // Eine Ruestung +1 ist im SRD selten, +3 legendaer — eine Stufe teurer
    // als der Schild mit demselben Bonus.
    id: 'ruestung-bonus',
    arten: ['ruestung'],
    ab: 2,
    bis: 4,
    einstimmung: false,
    bonus: { versatz: -1 },
    text: {
      de: 'Solange du sie trägst, erhältst du {bonus} auf deine Rüstungsklasse.',
      en: 'You have a {bonus} bonus to Armor Class while wearing this armor.'
    }
  },
  {
    id: 'schild-bonus',
    arten: ['schild'],
    ab: 1,
    bis: 3,
    einstimmung: false,
    text: {
      de: 'Solange du den Schild führst, erhältst du {bonus} auf deine Rüstungsklasse.',
      en: 'While holding this Shield, you have a {bonus} bonus to Armor Class.'
    }
  },
  {
    id: 'resistenz',
    arten: ['ruestung', 'schild', 'ring', 'wundersam'],
    ab: 2,
    bis: 3,
    einstimmung: true,
    text: {
      de: 'Solange du ihn trägst, hast du Resistenz gegen {art}schaden.',
      en: 'You have Resistance to {art} damage while wearing it.'
    }
  },
  {
    id: 'ruestung-leise',
    arten: ['ruestung'],
    ab: 0,
    bis: 1,
    einstimmung: false,
    text: {
      de: 'Die Rüstung verursacht keinen Nachteil bei Geschicklichkeitswürfen (Heimlichkeit).',
      en: 'The armor doesn’t impose Disadvantage on Dexterity (Stealth) checks.'
    }
  },
  {
    id: 'schild-geschosse',
    arten: ['schild'],
    ab: 2,
    bis: 2,
    einstimmung: true,
    text: {
      de: 'Trifft dich ein Fernkampfangriff, kannst du ihn als Reaktion auf dich statt auf ein Ziel neben dir lenken; du hast dabei +2 auf die RK.',
      en: 'When a ranged attack targets a creature near you, you can take a Reaction to become the target instead, with a +2 bonus to AC against it.'
    }
  },
  // --- Wundersames, Ringe ---------------------------------------------------
  {
    id: 'rettung-vorteil',
    arten: ['wundersam', 'ring'],
    ab: 1,
    bis: 2,
    einstimmung: true,
    text: {
      de: 'Du bist bei Rettungswürfen im Vorteil, um den Zustand {zustand} zu vermeiden oder zu beenden.',
      en: 'You have Advantage on saving throws to avoid or end the {zustand} condition.'
    }
  },
  {
    id: 'dunkelsicht',
    arten: ['wundersam', 'ring'],
    ab: 1,
    bis: 1,
    einstimmung: false,
    text: {
      de: 'Solange du ihn trägst, hast du Dunkelsicht auf 18 Meter.',
      en: 'While wearing it, you have Darkvision with a range of 60 feet.'
    }
  },
  {
    id: 'bewegung',
    arten: ['wundersam'],
    ab: 1,
    bis: 2,
    einstimmung: false,
    text: {
      de: 'Deine Bewegungsrate steigt um 3 Meter.',
      en: 'Your Speed increases by 10 feet.'
    }
  },
  {
    // Stulpen der Ogerkraft und Stirnband des Intellekts sind ungewoehnlich,
    // das Amulett der Gesundheit selten.
    id: 'attribut',
    arten: ['wundersam'],
    ab: 1,
    bis: 2,
    einstimmung: true,
    text: {
      de: 'Dein {attribut}wert beträgt 19, solange du ihn trägst. Ist er ohnehin 19 oder höher, bewirkt er nichts.',
      en: 'Your {attribut} score is 19 while you wear it. It has no effect if your score is already 19 or higher.'
    }
  },
  {
    // Schutzumhang (ungewoehnlich) und Schutzring (selten) geben beide +1.
    id: 'rettung-bonus',
    arten: ['ring', 'wundersam'],
    ab: 1,
    bis: 2,
    einstimmung: true,
    bonus: { fest: 1 },
    text: {
      de: 'Du erhältst {bonus} auf Rettungswürfe und auf deine Rüstungsklasse.',
      en: 'You gain a {bonus} bonus to saving throws and to Armor Class.'
    }
  },
  {
    // Gefluegelte Stiefel sind ungewoehnlich — mit vier Stunden am Tag.
    id: 'fliegen',
    arten: ['wundersam', 'ring'],
    ab: 1,
    bis: 4,
    einstimmung: true,
    text: {
      de: 'Bis zu vier Stunden am Tag hast du eine Flugbewegungsrate, die deiner Bewegungsrate entspricht.',
      en: 'For up to 4 hours per day, you have a Fly Speed equal to your Speed.'
    }
  },
  {
    id: 'telepathie',
    arten: ['wundersam', 'ring'],
    ab: 2,
    bis: 3,
    einstimmung: true,
    text: {
      de: 'Du kannst telepathisch mit jeder Kreatur im Umkreis von 18 Metern sprechen, die eine Sprache beherrscht.',
      en: 'You can communicate telepathically with any creature within 60 feet that knows a language.'
    }
  },
  {
    id: 'zauber-taeglich',
    arten: ['wundersam', 'ring'],
    ab: 1,
    bis: 4,
    einstimmung: true,
    text: {
      de: 'Einmal täglich kannst du damit {zauber} wirken. Die Fähigkeit lädt sich im Morgengrauen wieder auf.',
      en: 'Once per day, you can cast {zauber} from it. The property recharges at dawn.'
    }
  },
  // --- Zauberstab -----------------------------------------------------------
  {
    id: 'stab-ladungen',
    arten: ['stab'],
    ab: 1,
    bis: 4,
    einstimmung: true,
    text: {
      de: 'Der Stab hat {ladungen} Ladungen. Du kannst eine verbrauchen, um {zauber} zu wirken (Zauberrettungswurf-SG {wurf}). Im Morgengrauen erhält er 1W{ladungen} Ladungen zurück.',
      en: 'The wand has {ladungen} charges. You can expend 1 charge to cast {zauber} (save DC {wurf}). It regains 1d{ladungen} expended charges daily at dawn.'
    }
  },
  {
    id: 'stab-bonus',
    arten: ['stab'],
    ab: 1,
    bis: 3,
    einstimmung: true,
    text: {
      de: 'Solange du ihn hältst, erhältst du {bonus} auf Zauberangriffswürfe und auf den SG deiner Zauber.',
      en: 'While holding it, you gain a {bonus} bonus to spell attack rolls and to the saving throw DCs of your spells.'
    }
  },
  // --- Traenke und Schriftrollen --------------------------------------------
  {
    id: 'trank-heilung',
    arten: ['trank'],
    ab: 0,
    bis: 3,
    einstimmung: false,
    text: {
      de: 'Wer den Trank trinkt, erhält {heilung} Trefferpunkte zurück.',
      en: 'You regain {heilung} Hit Points when you drink this potion.'
    }
  },
  {
    id: 'trank-resistenz',
    arten: ['trank'],
    ab: 1,
    bis: 1,
    einstimmung: false,
    text: {
      de: 'Eine Stunde lang hast du Resistenz gegen {art}schaden.',
      en: 'For 1 hour, you have Resistance to {art} damage.'
    }
  },
  {
    id: 'trank-fliegen',
    arten: ['trank'],
    ab: 3,
    bis: 3,
    einstimmung: false,
    text: {
      de: 'Eine Stunde lang hast du eine Flugbewegungsrate von 18 Metern und kannst schweben.',
      en: 'For 1 hour, you have a Fly Speed of 60 feet and can hover.'
    }
  },
  {
    id: 'schriftrolle-zauber',
    arten: ['schriftrolle'],
    ab: 0,
    bis: 4,
    einstimmung: false,
    text: {
      de: 'Die Schriftrolle enthält den Zauber {zauber} (Grad {grad}). Nach dem Wirken zerfällt sie zu Staub.',
      en: 'The scroll holds the spell {zauber} (level {grad}). Once cast, it crumbles to dust.'
    }
  }
];

/**
 * Nachteile, die man dazuwuerfeln kann. Ein Fluch macht einen Gegenstand
 * leichter, nicht schwerer (docs/magicitems.md).
 */
export const FLUECHE: readonly Paar[] = [
  {
    de: 'Fluch: Du kannst dich nicht freiwillig von dem Gegenstand trennen, bis der Fluch gebrochen wird.',
    en: 'Curse: You are unwilling to part with the item until the curse is broken.'
  },
  {
    de: 'Fluch: Solange du eingestimmt bist, bist du bei Weisheitsrettungswürfen im Nachteil.',
    en: 'Curse: While attuned, you have Disadvantage on Wisdom saving throws.'
  },
  {
    de: 'Fluch: Jede Nacht flüstert der Gegenstand; nach einer langen Rast erhältst du eine Stufe Erschöpfung, wenn du einen Konstitutionsrettungswurf (SG 12) nicht bestehst.',
    en: 'Curse: The item whispers at night; after a Long Rest, you gain 1 Exhaustion level unless you succeed on a DC 12 Constitution saving throw.'
  }
];

export const ATTRIBUTE: readonly Paar[] = [
  { de: 'Stärke', en: 'Strength' },
  { de: 'Geschicklichkeit', en: 'Dexterity' },
  { de: 'Konstitution', en: 'Constitution' },
  { de: 'Intelligenz', en: 'Intelligence' },
  { de: 'Weisheit', en: 'Wisdom' },
  { de: 'Charisma', en: 'Charisma' }
];

/** Grundwoerter fuer Namen, je Art. */
export const GRUNDWORT: Record<Art, readonly Paar[]> = {
  waffe: [
    { de: 'Klinge', en: 'Blade' },
    { de: 'Axt', en: 'Axe' },
    { de: 'Speer', en: 'Spear' },
    { de: 'Bogen', en: 'Bow' },
    { de: 'Hammer', en: 'Hammer' }
  ],
  ruestung: [
    { de: 'Harnisch', en: 'Harness' },
    { de: 'Kettenhemd', en: 'Mail' },
    { de: 'Lederwams', en: 'Jerkin' }
  ],
  schild: [
    { de: 'Schild', en: 'Shield' },
    { de: 'Tartsche', en: 'Buckler' }
  ],
  wundersam: [
    { de: 'Amulett', en: 'Amulet' },
    { de: 'Umhang', en: 'Cloak' },
    { de: 'Stiefel', en: 'Boots' },
    { de: 'Gürtel', en: 'Belt' },
    { de: 'Brosche', en: 'Brooch' },
    { de: 'Handschuhe', en: 'Gloves' }
  ],
  ring: [
    { de: 'Ring', en: 'Ring' },
    { de: 'Siegelring', en: 'Signet' }
  ],
  stab: [
    { de: 'Zauberstab', en: 'Wand' },
    { de: 'Rute', en: 'Rod' }
  ],
  trank: [
    { de: 'Trank', en: 'Potion' },
    { de: 'Elixier', en: 'Elixir' }
  ],
  schriftrolle: [{ de: 'Schriftrolle', en: 'Scroll' }]
};

/** Beinamen: „… des Morgenrots" / „… of Dawn". */
export const BEINAME: readonly Paar[] = [
  { de: 'des Morgenrots', en: 'of Dawn' },
  { de: 'der Stille', en: 'of Silence' },
  { de: 'des Wächters', en: 'of the Warden' },
  { de: 'der Tiefe', en: 'of the Deep' },
  { de: 'des Sturms', en: 'of the Storm' },
  { de: 'der Asche', en: 'of Ashes' },
  { de: 'des Wanderers', en: 'of the Wanderer' },
  { de: 'der letzten Wacht', en: 'of the Last Watch' },
  { de: 'des Nebels', en: 'of Mist' },
  { de: 'der Königin', en: 'of the Queen' }
];
