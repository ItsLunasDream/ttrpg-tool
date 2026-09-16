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
  /** Woraus die Namen gebaut werden. */
  readonly erstes: readonly Paar[];
  readonly zweites: readonly Paar[];
  /** Schadensarten, die zu diesem Wesen passen. */
  readonly schaden: readonly Paar[];
}

export const THEMEN: readonly Thema[] = [
  {
    id: 'untot',
    name: { de: 'Untot', en: 'Undead' },
    erstes: [
      { de: 'Grab', en: 'Grave' }, { de: 'Knochen', en: 'Bone' }, { de: 'Leichen', en: 'Corpse' },
      { de: 'Gruft', en: 'Crypt' }, { de: 'Toten', en: 'Death' }, { de: 'Asche', en: 'Ash' },
      { de: 'Moder', en: 'Rot' }, { de: 'Schweige', en: 'Silent' }
    ],
    zweites: [
      { de: 'wandler', en: 'walker' }, { de: 'wächter', en: 'warden' }, { de: 'zehrer', en: 'gnawer' },
      { de: 'chor', en: 'choir' }, { de: 'hand', en: 'hand' }, { de: 'braut', en: 'bride' },
      { de: 'herold', en: 'herald' }, { de: 'schlund', en: 'maw' }
    ],
    schaden: [
      { de: 'nekrotisch', en: 'necrotic' }, { de: 'Kälte', en: 'cold' }, { de: 'psychisch', en: 'psychic' }
    ]
  },
  {
    id: 'bestie',
    name: { de: 'Bestie', en: 'Beast' },
    erstes: [
      { de: 'Dorn', en: 'Thorn' }, { de: 'Klauen', en: 'Claw' }, { de: 'Fell', en: 'Pelt' },
      { de: 'Nacht', en: 'Night' }, { de: 'Sumpf', en: 'Marsh' }, { de: 'Fels', en: 'Crag' },
      { de: 'Blut', en: 'Blood' }, { de: 'Winter', en: 'Winter' }
    ],
    zweites: [
      { de: 'katze', en: 'cat' }, { de: 'hetzer', en: 'stalker' }, { de: 'reisser', en: 'render' },
      { de: 'läufer', en: 'runner' }, { de: 'brut', en: 'brood' }, { de: 'eber', en: 'boar' },
      { de: 'greif', en: 'griffon' }, { de: 'schwarm', en: 'swarm' }
    ],
    schaden: [
      { de: 'Wucht', en: 'bludgeoning' }, { de: 'Stich', en: 'piercing' }, { de: 'Gift', en: 'poison' }
    ]
  },
  {
    id: 'konstrukt',
    name: { de: 'Konstrukt', en: 'Construct' },
    erstes: [
      { de: 'Eisen', en: 'Iron' }, { de: 'Uhrwerk', en: 'Clockwork' }, { de: 'Stein', en: 'Stone' },
      { de: 'Messing', en: 'Brass' }, { de: 'Scherben', en: 'Shard' }, { de: 'Runen', en: 'Rune' },
      { de: 'Kessel', en: 'Cauldron' }, { de: 'Granit', en: 'Granite' }
    ],
    zweites: [
      { de: 'diener', en: 'servitor' }, { de: 'wächter', en: 'sentinel' }, { de: 'koloss', en: 'colossus' },
      { de: 'faust', en: 'fist' }, { de: 'spinne', en: 'spider' }, { de: 'herz', en: 'heart' },
      { de: 'arbeiter', en: 'labourer' }, { de: 'gehäuse', en: 'casing' }
    ],
    schaden: [
      { de: 'Wucht', en: 'bludgeoning' }, { de: 'Blitz', en: 'lightning' }, { de: 'Feuer', en: 'fire' }
    ]
  },
  {
    id: 'aberration',
    name: { de: 'Aberration', en: 'Aberration' },
    erstes: [
      { de: 'Leeren', en: 'Void' }, { de: 'Flüster', en: 'Whisper' }, { de: 'Traum', en: 'Dream' },
      { de: 'Spiegel', en: 'Mirror' }, { de: 'Tiefen', en: 'Deep' }, { de: 'Fremd', en: 'Strange' },
      { de: 'Zwischen', en: 'Between' }, { de: 'Kriech', en: 'Crawling' }
    ],
    zweites: [
      { de: 'auge', en: 'eye' }, { de: 'mund', en: 'mouth' }, { de: 'gedanke', en: 'thought' },
      { de: 'ranke', en: 'tendril' }, { de: 'gestalt', en: 'shape' }, { de: 'hunger', en: 'hunger' },
      { de: 'echo', en: 'echo' }, { de: 'saat', en: 'seed' }
    ],
    schaden: [
      { de: 'psychisch', en: 'psychic' }, { de: 'Säure', en: 'acid' }, { de: 'Energie', en: 'force' }
    ]
  },
  {
    id: 'elementar',
    name: { de: 'Elementar', en: 'Elemental' },
    erstes: [
      { de: 'Glut', en: 'Ember' }, { de: 'Frost', en: 'Frost' }, { de: 'Sturm', en: 'Storm' },
      { de: 'Schlamm', en: 'Mire' }, { de: 'Funken', en: 'Spark' }, { de: 'Salz', en: 'Salt' },
      { de: 'Rauch', en: 'Smoke' }, { de: 'Tiefsee', en: 'Abyssal' }
    ],
    zweites: [
      { de: 'geborener', en: 'born' }, { de: 'wirbel', en: 'vortex' }, { de: 'gestalt', en: 'form' },
      { de: 'zunge', en: 'tongue' }, { de: 'kern', en: 'core' }, { de: 'welle', en: 'surge' },
      { de: 'faust', en: 'fist' }, { de: 'atem', en: 'breath' }
    ],
    schaden: [
      { de: 'Feuer', en: 'fire' }, { de: 'Kälte', en: 'cold' }, { de: 'Blitz', en: 'lightning' },
      { de: 'Donner', en: 'thunder' }
    ]
  },
  {
    id: 'unhold',
    name: { de: 'Unhold', en: 'Fiend' },
    erstes: [
      { de: 'Pech', en: 'Pitch' }, { de: 'Schwefel', en: 'Sulphur' }, { de: 'Pakt', en: 'Pact' },
      { de: 'Grimm', en: 'Wrath' }, { de: 'Schuld', en: 'Debt' }, { de: 'Höllen', en: 'Hell' },
      { de: 'Rauch', en: 'Cinder' }, { de: 'Zorn', en: 'Spite' }
    ],
    zweites: [
      { de: 'schreiber', en: 'scribe' }, { de: 'treiber', en: 'driver' }, { de: 'zunge', en: 'tongue' },
      { de: 'klaue', en: 'talon' }, { de: 'vollstrecker', en: 'enforcer' }, { de: 'fürst', en: 'lord' },
      { de: 'bote', en: 'envoy' }, { de: 'kette', en: 'chain' }
    ],
    schaden: [
      { de: 'Feuer', en: 'fire' }, { de: 'nekrotisch', en: 'necrotic' }, { de: 'Gift', en: 'poison' }
    ]
  },
  {
    id: 'fee',
    name: { de: 'Fee', en: 'Fey' },
    erstes: [
      { de: 'Dorn', en: 'Bramble' }, { de: 'Mond', en: 'Moon' }, { de: 'Nebel', en: 'Mist' },
      { de: 'Honig', en: 'Honey' }, { de: 'Spott', en: 'Mockery' }, { de: 'Reif', en: 'Rime' },
      { de: 'Wurzel', en: 'Root' }, { de: 'Glas', en: 'Glass' }
    ],
    zweites: [
      { de: 'tänzer', en: 'dancer' }, { de: 'händler', en: 'trader' }, { de: 'pate', en: 'godling' },
      { de: 'spieler', en: 'piper' }, { de: 'hüter', en: 'keeper' }, { de: 'kind', en: 'child' },
      { de: 'gast', en: 'guest' }, { de: 'krone', en: 'crown' }
    ],
    schaden: [
      { de: 'psychisch', en: 'psychic' }, { de: 'Kälte', en: 'cold' }, { de: 'Stich', en: 'piercing' }
    ]
  },
  {
    id: 'drache',
    name: { de: 'Drache', en: 'Dragon' },
    erstes: [
      { de: 'Horte', en: 'Hoard' }, { de: 'Schuppen', en: 'Scale' }, { de: 'Kessel', en: 'Cauldron' },
      { de: 'Gipfel', en: 'Summit' }, { de: 'Sturm', en: 'Storm' }, { de: 'Erz', en: 'Ore' },
      { de: 'Schlaf', en: 'Slumber' }, { de: 'Alt', en: 'Elder' }
    ],
    zweites: [
      { de: 'wurm', en: 'wyrm' }, { de: 'schlund', en: 'maw' }, { de: 'schwinge', en: 'wing' },
      { de: 'zorn', en: 'wrath' }, { de: 'hüter', en: 'keeper' }, { de: 'brut', en: 'brood' },
      { de: 'kiefer', en: 'jaws' }, { de: 'auge', en: 'eye' }
    ],
    schaden: [
      { de: 'Feuer', en: 'fire' }, { de: 'Säure', en: 'acid' }, { de: 'Blitz', en: 'lightning' },
      { de: 'Kälte', en: 'cold' }
    ]
  },
  {
    id: 'humanoid',
    name: { de: 'Humanoid', en: 'Humanoid' },
    erstes: [
      { de: 'Grau', en: 'Grey' }, { de: 'Narben', en: 'Scar' }, { de: 'Söldner', en: 'Sell' },
      { de: 'Eid', en: 'Oath' }, { de: 'Winter', en: 'Winter' }, { de: 'Hafen', en: 'Harbour' },
      { de: 'Klingen', en: 'Blade' }, { de: 'Stein', en: 'Stone' }
    ],
    zweites: [
      { de: 'klinge', en: 'blade' }, { de: 'bruder', en: 'brother' }, { de: 'hauptmann', en: 'captain' },
      { de: 'schwur', en: 'vow' }, { de: 'jäger', en: 'hunter' }, { de: 'sprecher', en: 'speaker' },
      { de: 'faust', en: 'fist' }, { de: 'schatten', en: 'shadow' }
    ],
    schaden: [
      { de: 'Hieb', en: 'slashing' }, { de: 'Stich', en: 'piercing' }, { de: 'Wucht', en: 'bludgeoning' }
    ]
  },
  {
    id: 'pflanze',
    name: { de: 'Pflanze', en: 'Plant' },
    erstes: [
      { de: 'Moos', en: 'Moss' }, { de: 'Pilz', en: 'Fungal' }, { de: 'Ranken', en: 'Vine' },
      { de: 'Sporen', en: 'Spore' }, { de: 'Harz', en: 'Resin' }, { de: 'Dickicht', en: 'Thicket' },
      { de: 'Fäulnis', en: 'Blight' }, { de: 'Samen', en: 'Seed' }
    ],
    zweites: [
      { de: 'würger', en: 'strangler' }, { de: 'mutter', en: 'mother' }, { de: 'teppich', en: 'carpet' },
      { de: 'hirte', en: 'shepherd' }, { de: 'schlinge', en: 'snare' }, { de: 'wald', en: 'wood' },
      { de: 'kelch', en: 'chalice' }, { de: 'geflecht', en: 'weave' }
    ],
    schaden: [
      { de: 'Gift', en: 'poison' }, { de: 'Säure', en: 'acid' }, { de: 'Wucht', en: 'bludgeoning' }
    ]
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

export const UMGEBUNGEN: readonly Paar[] = [
  { de: 'Wald', en: 'forest' }, { de: 'Unterreich', en: 'underdark' }, { de: 'Stadt', en: 'city' },
  { de: 'Tiefsee', en: 'deep sea' }, { de: 'Wüste', en: 'desert' }, { de: 'Gebirge', en: 'mountains' },
  { de: 'Sumpf', en: 'swamp' }, { de: 'Ruinen', en: 'ruins' }, { de: 'Eiswüste', en: 'ice waste' },
  { de: 'Grabmal', en: 'tomb' }, { de: 'Küste', en: 'coast' }, { de: 'Ebene', en: 'plains' }
];

/* ---------- Faehigkeiten ---------- */

export interface Faehigkeit {
  readonly name: Paar;
  readonly text: Paar;
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
    text: {
      de: 'Trifft es im Nahkampf, ist das Ziel gepackt und festgehalten.',
      en: 'On a melee hit the target is grappled and restrained.'
    },
    rollen: ['brecher', 'verteidiger', 'kontrolleur']
  },
  {
    name: { de: 'Umwerfen', en: 'Knockdown' },
    text: {
      de: 'Trifft es im Nahkampf, muss das Ziel eine Stärkerettung bestehen oder fällt hin.',
      en: 'On a melee hit the target makes a Strength save or falls prone.'
    },
    rollen: ['brecher', 'verteidiger']
  },
  {
    name: { de: 'Ausweichender Schritt', en: 'Shifting Step' },
    text: {
      de: 'Als Bonusaktion bewegt es sich, ohne Gelegenheitsangriffe auszulösen.',
      en: 'As a bonus action it moves without provoking opportunity attacks.'
    },
    rollen: ['plaenkler', 'lauerer', 'schuetze']
  },
  {
    name: { de: 'Aus dem Nichts', en: 'Out of Nowhere' },
    text: {
      de: 'Greift es aus dem Verborgenen an, richtet der Treffer die Hälfte mehr Schaden an.',
      en: 'Attacking from hiding, its hit deals half again as much damage.'
    },
    rollen: ['lauerer']
  },
  {
    name: { de: 'Zehrende Nähe', en: 'Draining Presence' },
    text: {
      de: 'Wer seinen Zug in 10 Fuß Nähe beginnt, nimmt Schaden. Dafür hat es einen Angriff weniger.',
      en: 'Anyone starting their turn within 10 feet takes damage. In exchange it has one attack fewer.'
    }
  },
  {
    name: { de: 'Ausbruch', en: 'Burst' },
    text: {
      de: 'Als Aktion ein Ausbruch im Umkreis von 10 Fuß: halber Rundenschaden, bei bestandener Rettung die Hälfte davon.',
      en: 'As an action, a burst in a 10-foot radius: half its round damage, halved again on a successful save.'
    },
    rollen: ['schuetze', 'kontrolleur', 'anfuehrer']
  },
  {
    name: { de: 'Befehl', en: 'Command' },
    text: {
      de: 'Als Bonusaktion darf ein Verbündeter in Sichtweite sofort einen Angriff machen.',
      en: 'As a bonus action an ally it can see makes one attack immediately.'
    },
    rollen: ['anfuehrer']
  },
  {
    name: { de: 'Zäher Brocken', en: 'Hard to Kill' },
    text: {
      de: 'Fällt es zum ersten Mal auf 0 Trefferpunkte, bleibt es stattdessen mit 1 stehen.',
      en: 'The first time it drops to 0 hit points, it drops to 1 instead.'
    },
    rollen: ['brecher', 'verteidiger', 'anfuehrer']
  },
  {
    name: { de: 'Schmerzhafte Rüstung', en: 'Spiteful Hide' },
    text: {
      de: 'Wer es im Nahkampf trifft, nimmt selbst Schaden. Dafür hat es einen Angriff weniger.',
      en: 'Whoever hits it in melee takes damage in return. In exchange it has one attack fewer.'
    },
    rollen: ['verteidiger', 'brecher']
  },
  {
    name: { de: 'Flimmern', en: 'Blink' },
    text: {
      de: 'Als Bonusaktion versetzt es sich bis zu 30 Fuß weit an eine sichtbare Stelle.',
      en: 'As a bonus action it teleports up to 30 feet to a space it can see.'
    },
    rollen: ['lauerer', 'plaenkler', 'kontrolleur']
  },
  {
    name: { de: 'Lähmender Blick', en: 'Binding Gaze' },
    text: {
      de: 'Als Aktion: ein sichtbares Ziel muss eine Weisheitsrettung bestehen oder kann sich eine Runde nicht bewegen.',
      en: 'As an action, one visible target makes a Wisdom save or cannot move for a round.'
    },
    rollen: ['kontrolleur', 'anfuehrer']
  },
  {
    name: { de: 'Weitergereichter Schmerz', en: 'Shared Pain' },
    text: {
      de: 'Erleidet es Schaden, kann es die Hälfte an einen willigen Verbündeten in 30 Fuß weitergeben.',
      en: 'When it takes damage it can pass half to a willing ally within 30 feet.'
    },
    rollen: ['anfuehrer']
  }
];
