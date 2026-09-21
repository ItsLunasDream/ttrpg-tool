/**
 * Umgebungen — an einer Stelle, fuer die ganze Sammlung.
 *
 * **Warum das Paket.** Eine Umgebung gab es dreimal und dreimal anders: im
 * Monster Creator als Ort, an dem ein Wesen lebt (mit Themenbindung und den
 * Merkmalen Wasser und grabbar), im Initiative Tracker als Gelaende, das im
 * Kampf eine Runde hat, und in der Inspirationshilfe als Beschreibung zum
 * Vorlesen. Drei Sichten auf dieselbe Sache, und keine kannte die andere.
 * Der Encounter Creator waere die vierte gewesen.
 *
 * **Die drei Sichten, die eine Umgebung hier zusammenhaelt:**
 *
 *   `name`    — wie sie heisst.
 *   `anblick` — was man sieht. Daraus liest die Spielleitung vor, und daraus
 *               entsteht eine Karte.
 *   `regel`   — was am Tisch wirkt, mit einer Zahl. „Sicht hoechstens
 *               30 Fuss" ist eine Regel; „neblig" ist Deko.
 *
 * Die Regel mit Zahl ist der Teil, den es vorher nirgends gab. Ohne sie
 * waere das Zusammenlegen ein Umzug ohne Gewinn.
 *
 * Plattformfrei: kein `node:*`, kein `electron`, keine Browser-Globals.
 */

export interface Paar {
  readonly de: string;
  readonly en: string;
}

export type Sprache = 'de' | 'en';

export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'en' ? paar.en : paar.de;
}

/**
 * Eine Regel, die am Tisch wirkt.
 *
 * `wirkung` traegt die Zahl im Satz, damit sie dort steht, wo man sie liest.
 * `feld` ist dieselbe Zahl noch einmal fuer sich — der Tracker kann damit
 * rechnen, ohne den Satz zu zerlegen.
 */
export interface Regel {
  readonly id: string;
  readonly wirkung: Paar;
  /** Die Zahl der Regel, wo es eine gibt: Fuss Sicht, Fuss Bewegung, ein SG. */
  readonly wert?: number;
  /** Woran die Zahl haengt — `sicht`, `bewegung`, `sg`, `schaden`. */
  readonly art?: 'sicht' | 'bewegung' | 'sg' | 'schaden';
}

export interface Umgebung {
  readonly id: string;
  readonly name: Paar;
  /**
   * Zu welchen Themen sie passt. Leer heisst: zu allen.
   *
   * Absichtlich grosszuegig: ausgeschlossen wird nur, was am Tisch stutzig
   * macht, nicht alles, was ungewoehnlich ist. Ein Untoter im Gebirge ist
   * selten und kein Fehler.
   */
  readonly themen?: readonly string[];
  /** Gibt es genug Wasser, dass eine Schwimmbewegung etwas nuetzt? */
  readonly wasser: boolean;
  /** Laesst sich der Boden durchgraben? */
  readonly grabbar: boolean;
  /** Was man sieht — zum Vorlesen und als Vorlage fuer eine Karte. */
  readonly anblick: readonly Paar[];
  /** Was am Tisch wirkt. Jede Umgebung hat mindestens eine Regel. */
  readonly regeln: readonly Regel[];
}

/**
 * Die Umgebungen.
 *
 * Sechzehn Stueck: genug, dass zwei Wuerfe nicht gleich aussehen, und wenig
 * genug, dass jede eine eigene Regel mit Zahl bekommen hat statt einer
 * Floskel.
 */
export const UMGEBUNGEN: readonly Umgebung[] = [
  {
    id: 'wald',
    name: { de: 'Wald', en: 'forest' },
    wasser: true,
    grabbar: true,
    themen: ['bestie', 'fee', 'pflanze', 'humanoid', 'untot', 'drache'],
    anblick: [
      { de: 'Stämme dicht genug, dass man auf zehn Schritt niemanden mehr sieht', en: 'trunks close enough that you lose sight of anyone ten paces off' },
      { de: 'umgestürzte Riesen, moosüberwachsen, hüfthoch', en: 'fallen giants, moss-grown, hip-high' },
      { de: 'ein Wildpfad, schmal, quer durch das Dickicht', en: 'a game trail, narrow, cutting through the thicket' },
    ],
    regeln: [
      { id: 'sicht', wirkung: { de: 'Das Unterholz begrenzt die Sicht auf 30 Fuß.', en: 'Undergrowth limits sight to 30 feet.' }, wert: 30, art: 'sicht' },
      { id: 'gelaende', wirkung: { de: 'Wurzelwerk ist schwieriges Gelände: jeder Fuß Bewegung kostet zwei.', en: 'Roots are difficult terrain: every foot of movement costs two.' }, art: 'bewegung' },
    ]
  },
  {
    id: 'hain',
    name: { de: 'Feenhain', en: 'fae grove' },
    wasser: true,
    grabbar: true,
    themen: ['fee', 'pflanze', 'bestie'],
    anblick: [
      { de: 'ein Ring aus Steinen, zwölf Schritt weit, das Gras darin kurz', en: 'a ring of stones, twelve paces across, the grass inside cropped short' },
      { de: 'Blüten, die Licht geben, so hell wie eine Kerze', en: 'blossoms that give light, about as bright as a candle' },
      { de: 'ein Bach, knietief, der zweimal durch die Lichtung läuft', en: 'a brook, knee-deep, crossing the clearing twice' },
    ],
    regeln: [
      { id: 'licht', wirkung: { de: 'Die Blüten geben Dämmerlicht im Umkreis von 20 Fuß.', en: 'The blossoms give dim light within 20 feet.' }, wert: 20, art: 'sicht' },
      { id: 'verwirrt', wirkung: { de: 'Wer den Hain verlässt, besteht eine Weisheitsrettung (SG 13) oder steht wieder am Ring.', en: 'Leaving the grove requires a DC 13 Wisdom save or you end up back at the ring.' }, wert: 13, art: 'sg' },
    ]
  },
  {
    id: 'unterreich',
    name: { de: 'Unterreich', en: 'underdark' },
    wasser: true,
    grabbar: true,
    themen: ['aberration', 'untot', 'konstrukt', 'elementar', 'humanoid', 'unhold', 'bestie'],
    anblick: [
      { de: 'eine Halle, deren Decke im Dunkeln verschwindet', en: 'a hall whose ceiling disappears into the dark' },
      { de: 'Pilze, mannshoch, in Gruppen zu dritt', en: 'mushrooms, man-high, in groups of three' },
      { de: 'ein Spalt im Boden, zwei Schritt breit, ohne sichtbaren Grund', en: 'a crack in the floor, two paces wide, with no visible bottom' },
    ],
    regeln: [
      { id: 'dunkel', wirkung: { de: 'Ohne eigenes Licht ist alles jenseits von 0 Fuß Dunkelheit.', en: 'Without your own light everything beyond 0 feet is darkness.' }, wert: 0, art: 'sicht' },
      { id: 'sturz', wirkung: { de: 'Der Spalt ist 40 Fuß tief: 4d6 Wuchtschaden, wer hineinfällt.', en: 'The crack is 40 feet deep: 4d6 bludgeoning damage to anyone who falls in.' }, wert: 40, art: 'schaden' },
    ]
  },
  {
    id: 'stadt',
    name: { de: 'Stadt', en: 'city' },
    wasser: false,
    grabbar: false,
    themen: ['humanoid', 'untot', 'konstrukt', 'unhold', 'fee'],
    anblick: [
      { de: 'eine Gasse, zwei Schritt breit, Wäscheleinen darüber', en: 'an alley two paces wide, washing lines overhead' },
      { de: 'Marktstände, umgeworfen, halbhohe Deckung', en: 'market stalls, overturned, half cover' },
      { de: 'Dächer, die sich fast berühren, fünf Schritt über dem Pflaster', en: 'roofs that nearly touch, five paces above the cobbles' },
    ],
    regeln: [
      { id: 'enge', wirkung: { de: 'In der Gasse kämpft höchstens zu zweit nebeneinander, wer größer als klein ist.', en: 'In the alley no more than two creatures larger than Small fight abreast.' } },
      { id: 'klettern', wirkung: { de: 'Auf die Dächer sind es 15 Fuß: Stärkeprobe (SG 12) oder halbe Bewegung an der Leiter.', en: 'The roofs are 15 feet up: a DC 12 Strength check, or half movement on a ladder.' }, wert: 12, art: 'sg' },
    ]
  },
  {
    id: 'turm',
    name: { de: 'Zauberturm', en: 'wizard’s tower' },
    wasser: false,
    grabbar: false,
    themen: ['konstrukt', 'aberration', 'humanoid', 'untot'],
    anblick: [
      { de: 'eine Wendeltreppe ohne Geländer, um einen offenen Schacht', en: 'a spiral stair without a rail, around an open shaft' },
      { de: 'schwebende Bücher, die sich langsam drehen', en: 'floating books, turning slowly' },
      { de: 'ein Kreis aus Kreide, frisch, zwei Schritt weit', en: 'a chalk circle, fresh, two paces across' },
    ],
    regeln: [
      { id: 'schacht', wirkung: { de: 'Der Schacht ist 30 Fuß tief: 3d6 Wuchtschaden.', en: 'The shaft is 30 feet deep: 3d6 bludgeoning damage.' }, wert: 30, art: 'schaden' },
      { id: 'magie', wirkung: { de: 'Im Kreidekreis haben Zauber Vorteil auf ihren Angriff, aber der SG sinkt um 2.', en: 'Inside the chalk circle spells have advantage on attacks, but their DC drops by 2.' }, wert: 2, art: 'sg' },
    ]
  },
  {
    id: 'tiefsee',
    name: { de: 'Tiefsee', en: 'deep sea' },
    wasser: true,
    grabbar: false,
    themen: ['bestie', 'aberration', 'elementar', 'drache'],
    anblick: [
      { de: 'Wasser in alle Richtungen, kein Boden zu sehen', en: 'water in every direction, no floor in sight' },
      { de: 'eine Säule aus aufsteigenden Blasen, drei Schritt breit', en: 'a column of rising bubbles, three paces wide' },
      { de: 'Licht von oben, das nach zwanzig Schritt aufhört', en: 'light from above that stops after twenty paces' },
    ],
    regeln: [
      { id: 'sicht', wirkung: { de: 'Im trüben Wasser reicht die Sicht 60 Fuß weit.', en: 'In the murky water sight reaches 60 feet.' }, wert: 60, art: 'sicht' },
      { id: 'schwimmen', wirkung: { de: 'Wer nicht schwimmen kann, bewegt sich nur halb so weit und hat Nachteil auf Nahkampfangriffe.', en: 'Without a swimming speed you move at half rate and have disadvantage on melee attacks.' }, art: 'bewegung' },
    ]
  },
  {
    id: 'kueste',
    name: { de: 'Küste', en: 'coast' },
    wasser: true,
    grabbar: true,
    themen: ['bestie', 'humanoid', 'drache', 'elementar', 'fee', 'aberration'],
    anblick: [
      { de: 'nasser Fels, in Stufen, knöchelhohe Tümpel dazwischen', en: 'wet rock in steps, ankle-deep pools between' },
      { de: 'Brandung, die alle paar Atemzüge über den Rand schlägt', en: 'surf that breaks over the edge every few breaths' },
      { de: 'Treibholz, aufgetürmt, hüfthoch', en: 'driftwood piled hip-high' },
    ],
    regeln: [
      { id: 'rutschig', wirkung: { de: 'Nasser Fels: Geschicklichkeitsrettung (SG 11) beim Rennen, sonst liegend.', en: 'Wet rock: a DC 11 Dexterity save when dashing, or you fall prone.' }, wert: 11, art: 'sg' },
      { id: 'brandung', wirkung: { de: 'Die Brandung schiebt alles in 10 Fuß Küstennähe jede Runde 5 Fuß landeinwärts.', en: 'The surf pushes everything within 10 feet of the water 5 feet inland each round.' }, wert: 5, art: 'bewegung' },
    ]
  },
  {
    id: 'sumpf',
    name: { de: 'Sumpf', en: 'swamp' },
    wasser: true,
    grabbar: true,
    themen: ['bestie', 'pflanze', 'untot', 'aberration', 'fee', 'drache'],
    anblick: [
      { de: 'Wasser, kniehoch, mit festen Stellen dazwischen', en: 'water, knee-deep, with firm patches between' },
      { de: 'tote Bäume, einzeln, ohne Laub', en: 'dead trees, standing alone, bare' },
      { de: 'Nebel, der in Schwaden über der Fläche liegt', en: 'mist lying in banks over the surface' },
    ],
    regeln: [
      { id: 'schlamm', wirkung: { de: 'Schlamm ist schwieriges Gelände; wer rennt, besteht eine Stärkeprobe (SG 10) oder steckt fest.', en: 'Mud is difficult terrain; dashing requires a DC 10 Strength check or you are stuck.' }, wert: 10, art: 'sg' },
      { id: 'nebel', wirkung: { de: 'Der Nebel begrenzt die Sicht auf 20 Fuß.', en: 'The mist limits sight to 20 feet.' }, wert: 20, art: 'sicht' },
    ]
  },
  {
    id: 'wueste',
    name: { de: 'Wüste', en: 'desert' },
    wasser: false,
    grabbar: true,
    themen: ['bestie', 'konstrukt', 'untot', 'elementar', 'drache', 'humanoid'],
    anblick: [
      { de: 'Dünen, zwei Mannshöhen hoch, der Kamm scharf', en: 'dunes two man-heights tall, the crest sharp' },
      { de: 'ein Felsvorsprung, der Schatten für sechs Leute gibt', en: 'a rock ledge with shade for six' },
      { de: 'Knochen, halb eingeweht, in einer Reihe', en: 'bones, half drifted over, in a line' },
    ],
    regeln: [
      { id: 'hitze', wirkung: { de: 'Ohne Schatten: jede Stunde eine Konstitutionsrettung (SG 10), bei Misserfolg eine Stufe Erschöpfung.', en: 'Without shade: a DC 10 Constitution save each hour or one level of exhaustion.' }, wert: 10, art: 'sg' },
      { id: 'sand', wirkung: { de: 'Loser Sand am Hang ist schwieriges Gelände.', en: 'Loose sand on the slope is difficult terrain.' }, art: 'bewegung' },
    ]
  },
  {
    id: 'gebirge',
    name: { de: 'Gebirge', en: 'mountains' },
    wasser: false,
    grabbar: true,
    themen: ['drache', 'bestie', 'elementar', 'humanoid', 'konstrukt', 'unhold'],
    anblick: [
      { de: 'ein Grat, drei Schritt breit, links und rechts fällt es ab', en: 'a ridge three paces wide, dropping away on both sides' },
      { de: 'Geröll, das bei jedem Schritt nachgibt', en: 'scree that gives way underfoot' },
      { de: 'eine Höhlenöffnung, mannshoch, im Fels', en: 'a cave mouth, man-high, in the rock' },
    ],
    regeln: [
      { id: 'absturz', wirkung: { de: 'Vom Grat sind es 60 Fuß: 6d6 Wuchtschaden, Geschicklichkeitsrettung (SG 13) beim Zurückstoßen.', en: 'Off the ridge is 60 feet: 6d6 bludgeoning damage, DC 13 Dexterity save when shoved.' }, wert: 60, art: 'schaden' },
      { id: 'hoehe', wirkung: { de: 'Über 10.000 Fuß zählt jede Stunde Marsch als zwei.', en: 'Above 10,000 feet each hour of travel counts as two.' }, art: 'bewegung' },
    ]
  },
  {
    id: 'eiswueste',
    name: { de: 'Eiswüste', en: 'ice waste' },
    wasser: false,
    grabbar: true,
    themen: ['elementar', 'bestie', 'drache', 'untot', 'humanoid'],
    anblick: [
      { de: 'eine Fläche ohne Merkmal, bis zum Horizont', en: 'a plain without feature, to the horizon' },
      { de: 'Spalten im Eis, handbreit bis mannsbreit', en: 'cracks in the ice, a hand to a man wide' },
      { de: 'aufgewehter Schnee, der in Fahnen über den Boden zieht', en: 'blown snow streaming across the ground in banners' },
    ],
    regeln: [
      { id: 'sturm', wirkung: { de: 'Im Schneesturm sieht man höchstens 30 Fuß weit und hat Nachteil auf Wahrnehmung.', en: 'In the blizzard you see at most 30 feet and have disadvantage on Perception.' }, wert: 30, art: 'sicht' },
      { id: 'kaelte', wirkung: { de: 'Jede Stunde ohne Kälteschutz: Konstitutionsrettung (SG 10) oder eine Stufe Erschöpfung.', en: 'Each hour without cold protection: a DC 10 Constitution save or one level of exhaustion.' }, wert: 10, art: 'sg' },
    ]
  },
  {
    id: 'vulkan',
    name: { de: 'Vulkanland', en: 'volcanic land' },
    wasser: false,
    grabbar: true,
    themen: ['elementar', 'drache', 'unhold', 'konstrukt'],
    anblick: [
      { de: 'Lavaadern im Boden, handbreit, orange glühend', en: 'veins of lava in the ground, a hand wide, glowing orange' },
      { de: 'Ascheregen, der alles grau färbt', en: 'ash falling, turning everything grey' },
      { de: 'Basaltsäulen, fünf Schritt hoch, dicht beieinander', en: 'basalt columns five paces high, close together' },
    ],
    regeln: [
      { id: 'hitze', wirkung: { de: 'Wer eine Lavaader berührt, nimmt 3d6 Feuerschaden.', en: 'Touching a lava vein deals 3d6 fire damage.' }, art: 'schaden' },
      { id: 'asche', wirkung: { de: 'Der Ascheregen begrenzt die Sicht auf 40 Fuß.', en: 'Falling ash limits sight to 40 feet.' }, wert: 40, art: 'sicht' },
    ]
  },
  {
    id: 'aschewueste',
    name: { de: 'Aschewüste', en: 'ash waste' },
    wasser: false,
    grabbar: true,
    themen: ['unhold', 'untot', 'elementar', 'drache'],
    anblick: [
      { de: 'Asche, knöcheltief, die jeden Schritt hörbar macht', en: 'ash, ankle-deep, making every step audible' },
      { de: 'verkohlte Stümpfe, in Reihen, wie ein Wald es war', en: 'charred stumps in rows, where a forest stood' },
      { de: 'kein Wind, keine Geräusche', en: 'no wind, no sound' },
    ],
    regeln: [
      { id: 'spur', wirkung: { de: 'Jeder Schritt hinterlässt eine Spur: Nachteil auf Heimlichkeit.', en: 'Every step leaves a track: disadvantage on Stealth.' } },
      { id: 'staub', wirkung: { de: 'Aufgewirbelte Asche macht einen Umkreis von 10 Fuß stark verschleiert.', en: 'Kicked-up ash makes a 10-foot radius heavily obscured.' }, wert: 10, art: 'sicht' },
    ]
  },
  {
    id: 'ruinen',
    name: { de: 'Ruinen', en: 'ruins' },
    wasser: false,
    grabbar: true,
    themen: ['untot', 'konstrukt', 'humanoid', 'unhold', 'aberration', 'pflanze'],
    anblick: [
      { de: 'Mauerreste, brusthoch, in einem Raster', en: 'remains of walls, chest-high, in a grid' },
      { de: 'ein eingestürztes Dach, dessen Balken schräg stehen', en: 'a collapsed roof, its beams at an angle' },
      { de: 'ein Kellerloch, ohne Treppe, zehn Fuß tief', en: 'a cellar hole, no stair, ten feet down' },
    ],
    regeln: [
      { id: 'deckung', wirkung: { de: 'Die Mauerreste geben halbe Deckung: +2 auf Rüstungsklasse und Geschicklichkeitsrettungen.', en: 'The walls give half cover: +2 to AC and Dexterity saves.' }, wert: 2, art: 'sg' },
      { id: 'einsturz', wirkung: { de: 'Wer auf die Balken tritt: Geschicklichkeitsrettung (SG 12) oder 2d6 Wuchtschaden und zehn Fuß tiefer.', en: 'Stepping on the beams: DC 12 Dexterity save or 2d6 bludgeoning damage and ten feet down.' }, wert: 12, art: 'sg' },
    ]
  },
  {
    id: 'grabmal',
    name: { de: 'Grabmal', en: 'tomb' },
    wasser: false,
    grabbar: true,
    themen: ['untot', 'konstrukt', 'unhold', 'aberration'],
    anblick: [
      { de: 'ein Gang, zwei Schritt breit, Nischen links und rechts', en: 'a corridor two paces wide, niches left and right' },
      { de: 'Sarkophage, mannslang, die Deckel verschoben', en: 'sarcophagi, man-length, lids pushed aside' },
      { de: 'Staub, in dem noch keine Spur steht', en: 'dust with no track in it yet' },
    ],
    regeln: [
      { id: 'enge', wirkung: { de: 'Im Gang kämpft nur einer nebeneinander; Fernkampf hat Nachteil über 30 Fuß.', en: 'Only one creature fights abreast in the corridor; ranged attacks have disadvantage beyond 30 feet.' }, wert: 30, art: 'sicht' },
      { id: 'falle', wirkung: { de: 'Die Nischen sind gestellt: Nachforschungsprobe (SG 14), sonst 2d10 Stichschaden.', en: 'The niches are trapped: DC 14 Investigation, or 2d10 piercing damage.' }, wert: 14, art: 'sg' },
    ]
  },
  {
    id: 'ebene',
    name: { de: 'Ebene', en: 'plains' },
    wasser: false,
    grabbar: true,
    themen: ['bestie', 'humanoid', 'drache', 'untot', 'konstrukt', 'pflanze'],
    anblick: [
      { de: 'Gras, hüfthoch, so weit man sieht', en: 'grass, hip-high, as far as you can see' },
      { de: 'eine einzelne Baumgruppe, sechs Stämme', en: 'a single stand of trees, six trunks' },
      { de: 'eine flache Senke, die erst auffällt, wenn man darin steht', en: 'a shallow dip you only notice once you are in it' },
    ],
    regeln: [
      { id: 'sicht', wirkung: { de: 'Freies Feld: man sieht 600 Fuß weit, Fernkampf ohne Deckung.', en: 'Open field: sight carries 600 feet, ranged attacks without cover.' }, wert: 600, art: 'sicht' },
      { id: 'gras', wirkung: { de: 'Im hüfthohen Gras ist liegend leicht verschleiert.', en: 'Prone in the hip-high grass counts as lightly obscured.' } },
    ]
  },
];

/* ---------- Auswaehlen ---------- */

/**
 * Was eine Bewegung braucht — so wenig wie moeglich vom Werkzeug gewusst.
 *
 * Das Paket kennt die Bewegungsmodelle der Werkzeuge nicht und soll sie auch
 * nicht kennen. Wer hier auswaehlt, sagt schlicht, ob geschwommen und ob
 * gegraben wird.
 */
export interface Fortbewegung {
  readonly schwimmt?: boolean;
  readonly graebt?: boolean;
}

/**
 * Passt diese Umgebung zu dieser Fortbewegung?
 *
 * Nur zwei harte Regeln, und beide fallen am Tisch sofort auf: eine
 * Schwimmbewegung ohne Wasser und eine Grabbewegung auf Pflaster. Fliegen
 * bleibt ungeprueft — auch unter der Erde fliegt allerhand, und eine Regel,
 * die zu viel ausschliesst, macht aus sechzehn Umgebungen drei.
 */
export function passtZurBewegung(umgebung: Umgebung, wie: Fortbewegung): boolean {
  if (wie.schwimmt && !umgebung.wasser) return false;
  if (wie.graebt && !umgebung.grabbar) return false;
  return true;
}

export function passtZumThema(umgebung: Umgebung, themaId: string): boolean {
  return !umgebung.themen || umgebung.themen.includes(themaId);
}

export function umgebungNach(id: string): Umgebung | undefined {
  return UMGEBUNGEN.find((umgebung) => umgebung.id === id);
}

/**
 * Eine Umgebung zu Thema und Fortbewegung.
 *
 * Drei Anlaeufe, absteigend streng. Der letzte nimmt irgendeine — lieber
 * eine unpassende Umgebung als gar keine. Dass es je dazu kommt, schliessen
 * die Pruefungen aus.
 */
export function waehleUmgebung(
  themaId: string,
  wie: Fortbewegung,
  rng: () => number
): Umgebung {
  const beides = UMGEBUNGEN.filter(
    (u) => passtZumThema(u, themaId) && passtZurBewegung(u, wie)
  );
  const nurThema = UMGEBUNGEN.filter((u) => passtZumThema(u, themaId));
  const auswahl = beides.length > 0 ? beides : nurThema.length > 0 ? nurThema : UMGEBUNGEN;
  return auswahl[Math.floor(rng() * auswahl.length)];
}

export function umgebungName(umgebung: Umgebung, sprache: Sprache): string {
  return text(umgebung.name, sprache);
}

/** Die Regeln als Saetze — fuer den Statblock, die Notiz, den Tracker. */
export function regelzeilen(umgebung: Umgebung, sprache: Sprache): string[] {
  return umgebung.regeln.map((regel) => text(regel.wirkung, sprache));
}

/** Der Anblick als Saetze — zum Vorlesen und als Vorlage fuer eine Karte. */
export function anblickzeilen(umgebung: Umgebung, sprache: Sprache): string[] {
  return umgebung.anblick.map((zeile) => text(zeile, sprache));
}
