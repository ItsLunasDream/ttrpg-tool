/**
 * Woraus eine Figur zusammengesetzt wird.
 *
 * Jeder Eintrag steht zweisprachig da. Das ist keine Bequemlichkeit, sondern
 * die Bedingung dafuer, dass eine gewuerfelte Figur beim Sprachwechsel
 * dieselbe bleibt: sie merkt sich Stellen in diesen Listen, keine Texte.
 * Waeren hier nur deutsche Saetze, waere jede Figur fuer immer deutsch — und
 * eine englische Oberflaeche mit deutschen Inhalten sieht nicht nach zwei
 * Sprachen aus, sondern nach einem halben Werkzeug.
 *
 * Alles als reine Daten, ohne Oberflaeche und ohne Zufall — so laesst sich
 * pruefen, dass keine Liste leer ist, nichts doppelt vorkommt und keine
 * Sprache fehlt.
 */

/** Ein Eintrag in beiden Sprachen. */
export interface Paar {
  readonly de: string;
  readonly en: string;
}

export type Sprache = 'de' | 'en';

/** Den Text eines Paares in der gewuenschten Sprache. */
export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'de' ? paar.de : paar.en;
}

/**
 * Spezies.
 *
 * Die neun aus dem Spielerhandbuch zuerst, danach alles, was sonst am Tisch
 * auftaucht. Die Liste ist bewusst lang: der Reiz des Werkzeugs liegt darin,
 * dass auch mal ein Satyr hinter der Theke steht.
 *
 * `haeufig` steuert, wie oft eine Spezies beim Zufallswurf gezogen wird. Ohne
 * das waere jeder zweite Passant ein Golem, und die Welt fuehlte sich an wie
 * ein Jahrmarkt.
 *
 * Viele Namen sind in beiden Sprachen gleich — Tabaxi heisst ueberall Tabaxi.
 * Sie stehen trotzdem doppelt da, damit die Liste eine Form hat und nicht
 * zwei.
 */
export interface Spezies extends Paar {
  readonly haeufig: boolean;
}

export const SPEZIES: readonly Spezies[] = [
  // Spielerhandbuch
  { de: 'Mensch', en: 'Human', haeufig: true },
  { de: 'Elf', en: 'Elf', haeufig: true },
  { de: 'Zwerg', en: 'Dwarf', haeufig: true },
  { de: 'Halbling', en: 'Halfling', haeufig: true },
  { de: 'Gnom', en: 'Gnome', haeufig: true },
  { de: 'Halbelf', en: 'Half-Elf', haeufig: true },
  { de: 'Halbork', en: 'Half-Orc', haeufig: true },
  { de: 'Drachenblütiger', en: 'Dragonborn', haeufig: true },
  { de: 'Tiefling', en: 'Tiefling', haeufig: true },
  // Weitere, seltener
  { de: 'Aasimar', en: 'Aasimar', haeufig: false },
  { de: 'Goliath', en: 'Goliath', haeufig: false },
  { de: 'Tabaxi', en: 'Tabaxi', haeufig: false },
  { de: 'Firbolg', en: 'Firbolg', haeufig: false },
  { de: 'Kenku', en: 'Kenku', haeufig: false },
  { de: 'Tortle', en: 'Tortle', haeufig: false },
  { de: 'Genasi', en: 'Genasi', haeufig: false },
  { de: 'Triton', en: 'Triton', haeufig: false },
  { de: 'Goblin', en: 'Goblin', haeufig: false },
  { de: 'Kobold', en: 'Kobold', haeufig: false },
  { de: 'Hobgoblin', en: 'Hobgoblin', haeufig: false },
  { de: 'Bugbear', en: 'Bugbear', haeufig: false },
  { de: 'Ork', en: 'Orc', haeufig: false },
  { de: 'Echsenvolk', en: 'Lizardfolk', haeufig: false },
  { de: 'Yuan-ti', en: 'Yuan-ti', haeufig: false },
  { de: 'Aarakocra', en: 'Aarakocra', haeufig: false },
  { de: 'Fee', en: 'Fey', haeufig: false },
  { de: 'Satyr', en: 'Satyr', haeufig: false },
  { de: 'Zentaur', en: 'Centaur', haeufig: false },
  { de: 'Minotaur', en: 'Minotaur', haeufig: false },
  { de: 'Golem', en: 'Golem', haeufig: false },
  { de: 'Warforged', en: 'Warforged', haeufig: false },
  { de: 'Gestaltwandler', en: 'Changeling', haeufig: false },
  { de: 'Shifter', en: 'Shifter', haeufig: false },
  { de: 'Kalashtar', en: 'Kalashtar', haeufig: false },
  { de: 'Harengon', en: 'Harengon', haeufig: false },
  { de: 'Owlin', en: 'Owlin', haeufig: false },
  { de: 'Loxodon', en: 'Loxodon', haeufig: false },
  { de: 'Vedalken', en: 'Vedalken', haeufig: false },
  { de: 'Simic-Hybrid', en: 'Simic Hybrid', haeufig: false },
  { de: 'Leonin', en: 'Leonin', haeufig: false },
  { de: 'Fairy', en: 'Fairy', haeufig: false },
  { de: 'Autognom', en: 'Autognome', haeufig: false },
  { de: 'Plasmoid', en: 'Plasmoid', haeufig: false },
  { de: 'Thri-Kreen', en: 'Thri-Kreen', haeufig: false },
  { de: 'Hadozee', en: 'Hadozee', haeufig: false },
  { de: 'Astral-Elf', en: 'Astral Elf', haeufig: false },
  { de: 'Giff', en: 'Giff', haeufig: false },
  { de: 'Duergar', en: 'Duergar', haeufig: false },
  { de: 'Eladrin', en: 'Eladrin', haeufig: false },
  { de: 'Seeelf', en: 'Sea Elf', haeufig: false },
  { de: 'Schattarkai-Elf', en: 'Shadar-kai', haeufig: false },
  { de: 'Wiedergänger', en: 'Revenant', haeufig: false },
  { de: 'Dhampir', en: 'Dhampir', haeufig: false },
  { de: 'Hexenblut', en: 'Hexblood', haeufig: false },
  { de: 'Zurückgekehrte', en: 'Reborn', haeufig: false }
];

/** Was die Figur tut. Der Beruf traegt die halbe Begegnung. */
export const BERUFE: readonly Paar[] = [
  { de: 'Wirt', en: 'Innkeeper' },
  { de: 'Schmied', en: 'Blacksmith' },
  { de: 'Bäckerin', en: 'Baker' },
  { de: 'Fuhrmann', en: 'Carter' },
  { de: 'Stadtwache', en: 'City guard' },
  { de: 'Marktschreier', en: 'Market crier' },
  { de: 'Fischer', en: 'Fisher' },
  { de: 'Müllerin', en: 'Miller' },
  { de: 'Gerber', en: 'Tanner' },
  { de: 'Töpferin', en: 'Potter' },
  { de: 'Weber', en: 'Weaver' },
  { de: 'Zimmermann', en: 'Carpenter' },
  { de: 'Hebamme', en: 'Midwife' },
  { de: 'Totengräber', en: 'Gravedigger' },
  { de: 'Bettler', en: 'Beggar' },
  { de: 'Taschendieb', en: 'Pickpocket' },
  { de: 'Hehler', en: 'Fence' },
  { de: 'Schmuggler', en: 'Smuggler' },
  { de: 'Söldnerin', en: 'Mercenary' },
  { de: 'Karawanenführer', en: 'Caravan master' },
  { de: 'Priesterin', en: 'Priest' },
  { de: 'Novize', en: 'Novice' },
  { de: 'Schreiber', en: 'Scribe' },
  { de: 'Gelehrte', en: 'Scholar' },
  { de: 'Alchemistin', en: 'Alchemist' },
  { de: 'Kräuterfrau', en: 'Herbalist' },
  { de: 'Wilderer', en: 'Poacher' },
  { de: 'Jägerin', en: 'Hunter' },
  { de: 'Köhler', en: 'Charcoal burner' },
  { de: 'Bergmann', en: 'Miner' },
  { de: 'Steinmetz', en: 'Stonemason' },
  { de: 'Glasbläserin', en: 'Glassblower' },
  { de: 'Barbier', en: 'Barber' },
  { de: 'Bader', en: 'Bathhouse keeper' },
  { de: 'Gaukler', en: 'Juggler' },
  { de: 'Barde', en: 'Bard' },
  { de: 'Puppenspielerin', en: 'Puppeteer' },
  { de: 'Stallbursche', en: 'Stable hand' },
  { de: 'Magd', en: 'Servant' },
  { de: 'Kutscher', en: 'Coachman' },
  { de: 'Zöllnerin', en: 'Toll collector' },
  { de: 'Ratsherr', en: 'Council member' },
  { de: 'Schöffe', en: 'Lay judge' },
  { de: 'Kerkermeister', en: 'Jailer' },
  { de: 'Henker', en: 'Executioner' },
  { de: 'Kartografin', en: 'Cartographer' },
  { de: 'Bibliothekar', en: 'Librarian' },
  { de: 'Schiffszimmerer', en: 'Shipwright' },
  { de: 'Lotse', en: 'Harbour pilot' },
  { de: 'Leuchtturmwärterin', en: 'Lighthouse keeper' },
  { de: 'Falkner', en: 'Falconer' },
  { de: 'Hundezüchterin', en: 'Dog breeder' },
  { de: 'Imker', en: 'Beekeeper' },
  { de: 'Winzerin', en: 'Vintner' },
  { de: 'Salzhändler', en: 'Salt merchant' },
  { de: 'Waffenhändlerin', en: 'Weapon dealer' },
  { de: 'Pfandleiher', en: 'Pawnbroker' },
  { de: 'Geldwechslerin', en: 'Money changer' },
  { de: 'Spielmacher', en: 'Bookmaker' },
  { de: 'Wahrsagerin', en: 'Fortune teller' },
  { de: 'Straßenprediger', en: 'Street preacher' },
  { de: 'Reliquienhändlerin', en: 'Relic seller' },
  { de: 'Grabräuber', en: 'Grave robber' },
  { de: 'Abenteurerin außer Dienst', en: 'Retired adventurer' },
  { de: 'Deserteur', en: 'Deserter' },
  { de: 'Veteranin', en: 'Veteran' },
  { de: 'Waisenaufseher', en: 'Orphanage warden' },
  { de: 'Gassenkind', en: 'Street child' },
  { de: 'Laufbursche', en: 'Errand runner' },
  { de: 'Wäscherin', en: 'Laundress' }
];

/** Ein Satz, der beim ersten Blick auffaellt. */
export const AUSSEHEN: readonly Paar[] = [
  { de: 'eine Narbe quer über dem linken Auge', en: 'a scar across the left eye' },
  { de: 'auffallend saubere Hände für diese Arbeit', en: 'hands far too clean for this work' },
  { de: 'ein Ohr fehlt zur Hälfte', en: 'half an ear missing' },
  { de: 'graue Strähnen, obwohl noch jung', en: 'grey streaks despite the young face' },
  { de: 'Finger voller Tintenflecken', en: 'ink stains on every finger' },
  { de: 'ein Gesicht wie ausgetrocknetes Leder', en: 'a face like dried leather' },
  { de: 'einen Kopf größer als alle im Raum', en: 'a head taller than anyone in the room' },
  { de: 'ungewöhnlich helle, fast farblose Augen', en: 'unusually pale, almost colourless eyes' },
  { de: 'eine Nase, die zweimal gebrochen wurde', en: 'a nose broken twice' },
  { de: 'Zähne, bei denen zwei aus Silber sind', en: 'two silver teeth among the rest' },
  { de: 'ein Muttermal in Form eines Blattes am Hals', en: 'a leaf-shaped birthmark on the neck' },
  { de: 'Hände, die nie ganz stillstehen', en: 'hands that never quite go still' },
  { de: 'Kleidung eine Nummer zu groß', en: 'clothes a size too large' },
  { de: 'Stiefel, die teurer sind als der Rest', en: 'boots worth more than everything else' },
  { de: 'ein frisch rasierter Schädel mit Schnittspuren', en: 'a freshly shaved scalp, nicked in places' },
  { de: 'Brandnarben an beiden Unterarmen', en: 'burn scars on both forearms' },
  { de: 'eine schiefe Schulter vom Tragen', en: 'one shoulder lower from years of carrying' },
  { de: 'auffällig lange Wimpern', en: 'strikingly long lashes' },
  { de: 'ein Gang, als täte etwas weh', en: 'a walk that suggests something hurts' },
  { de: 'Sommersprossen bis auf die Lider', en: 'freckles right up to the eyelids' },
  { de: 'eine Tätowierung, die halb unter dem Kragen verschwindet', en: 'a tattoo half hidden by the collar' },
  { de: 'Augenringe wie nach drei schlaflosen Nächten', en: 'shadows under the eyes, three nights deep' },
  { de: 'ein Lächeln, das die Augen nicht erreicht', en: 'a smile that never reaches the eyes' },
  { de: 'Ruß in jeder Falte', en: 'soot in every crease' },
  { de: 'ein Kinnbart, akkurat gestutzt', en: 'a chin beard, precisely trimmed' },
  { de: 'Hände voller alter Bissspuren', en: 'hands covered in old bite marks' },
  { de: 'ein Auge blickt leicht am Gegenüber vorbei', en: 'one eye looks just past you' },
  { de: 'ein Kranz aus getrockneten Blumen im Haar', en: 'a wreath of dried flowers in the hair' },
  { de: 'ein Ring an jedem Finger, alle billig', en: 'a ring on every finger, all of them cheap' },
  { de: 'eine Stimme, die tiefer ist als erwartet', en: 'a voice deeper than expected' }
];

/** Was die Figur will. Ohne das ist sie Kulisse. */
export const MOTIVATIONEN: readonly Paar[] = [
  { de: 'will die Schulden abbezahlen, bevor jemand davon erfährt', en: 'wants the debts paid before anyone finds out' },
  { de: 'sucht ein verschwundenes Familienmitglied', en: 'is looking for a missing relative' },
  { de: 'will weg aus dieser Stadt, egal wohin', en: 'wants out of this town, anywhere will do' },
  { de: 'möchte endlich ernst genommen werden', en: 'wants to be taken seriously for once' },
  { de: 'hält ein Versprechen, das längst niemand mehr einfordert', en: 'keeps a promise nobody is asking about any more' },
  { de: 'will die eigene Werkstatt übernehmen', en: 'wants to take over the workshop' },
  { de: 'sammelt Geld für eine Heilung', en: 'is saving up for a cure' },
  { de: 'sucht jemanden, der zuhört', en: 'is looking for someone who listens' },
  { de: 'will den eigenen Namen reinwaschen', en: 'wants their name cleared' },
  { de: 'wartet auf ein Schiff, das nicht kommt', en: 'is waiting for a ship that will not come' },
  { de: 'hütet ein Grab, von dem niemand weiß', en: 'tends a grave nobody knows about' },
  { de: 'will beweisen, dass die Familie unrecht hatte', en: 'wants to prove the family wrong' },
  { de: 'sucht einen Lehrmeister', en: 'is looking for a teacher' },
  { de: 'will einen alten Streit endlich beilegen', en: 'wants an old quarrel settled at last' },
  { de: 'plant heimlich die Abreise', en: 'is quietly planning to leave' },
  { de: 'möchte das Kind aus der Gasse holen', en: 'wants to get the child out of the alley' },
  { de: 'will die Konkurrenz ruinieren', en: 'wants the competition ruined' },
  { de: 'sucht ein Buch, das es nicht geben sollte', en: 'is after a book that should not exist' },
  { de: 'will noch einmal das Meer sehen', en: 'wants to see the sea one more time' },
  { de: 'hofft, dass die Abenteurer wieder verschwinden', en: 'hopes the adventurers move on soon' },
  { de: 'will endlich schlafen können', en: 'just wants to sleep again' },
  { de: 'sucht Rache, traut sich aber nicht', en: 'wants revenge but lacks the nerve' },
  { de: 'will die alte Straße wieder öffnen lassen', en: 'wants the old road reopened' },
  { de: 'hält die Stellung, bis Ablösung kommt', en: 'is holding the post until relief arrives' },
  { de: 'sammelt Beweise gegen jemanden', en: 'is gathering evidence against someone' },
  { de: 'will dazugehören', en: 'wants to belong' },
  { de: 'möchte den Betrieb loswerden', en: 'wants rid of the business' },
  { de: 'sucht ein Heilmittel für das Vieh', en: 'needs a remedy for the livestock' },
  { de: 'will die Wahrheit über den Brand wissen', en: 'wants the truth about the fire' },
  { de: 'hofft auf ein Zeichen der Götter', en: 'is hoping for a sign from the gods' }
];

/** Etwas, das nicht auf der Hand liegt. */
export const GEHEIMNISSE: readonly Paar[] = [
  { de: 'kann lesen, gibt es aber nicht zu', en: 'can read but will not admit it' },
  { de: 'hat vor Jahren einen Menschen sterben lassen', en: 'let someone die years ago' },
  { de: 'arbeitet für die falsche Seite', en: 'works for the wrong side' },
  { de: 'ist nicht, wer alle denken', en: 'is not who everyone thinks' },
  { de: 'versteckt jemanden im Keller', en: 'is hiding someone in the cellar' },
  { de: 'hat die Steuern seit zwei Jahren nicht gezahlt', en: 'has not paid tax in two years' },
  { de: 'kann ein wenig zaubern, ganz wenig', en: 'can cast a little magic, very little' },
  { de: 'trägt eine Waffe, die jemand anderem gehörte', en: 'carries a weapon that belonged to someone else' },
  { de: 'weiß, wo die Leiche liegt', en: 'knows where the body is' },
  { de: 'hat den Brief nie abgeschickt', en: 'never sent the letter' },
  { de: 'ist das uneheliche Kind einer wichtigen Person', en: 'is the illegitimate child of someone important' },
  { de: 'schuldet einer Bande Geld', en: 'owes money to a gang' },
  { de: 'hat den Vertrag gefälscht', en: 'forged the contract' },
  { de: 'träumt seit Wochen immer dasselbe', en: 'has had the same dream for weeks' },
  { de: 'sammelt Dinge, die anderen gehören', en: 'collects things that belong to others' },
  { de: 'wurde schon einmal für tot erklärt', en: 'was once declared dead' },
  { de: 'hat Angst vor dem eigenen Vater', en: 'is afraid of their own father' },
  { de: 'kennt einen Weg aus der Stadt, den sonst keiner kennt', en: 'knows a way out of town nobody else does' },
  { de: 'hat den Fund nicht gemeldet', en: 'never reported the find' },
  { de: 'gehört einem Kult an, der harmlos wirkt', en: 'belongs to a cult that looks harmless' }
];

/**
 * Eigenheiten — Marotten, Tics, Lieblingswoerter.
 *
 * Sie werden NUR mit geringer Wahrscheinlichkeit vergeben. Wenn jede Figur
 * eine Marotte haette, waere keine mehr besonders, und der Tisch haette nach
 * drei Begegnungen eine Parade von Karikaturen vor sich.
 */
export const EIGENHEITEN: readonly Paar[] = [
  { de: 'sagt bei jedem zweiten Satz „verstehst du"', en: 'says "you follow?" every other sentence' },
  { de: 'zählt beim Sprechen an den Fingern mit', en: 'counts on their fingers while talking' },
  { de: 'wiederholt die letzten Worte des Gegenübers leise', en: 'quietly repeats your last few words' },
  { de: 'nennt alle „Chef", unabhängig vom Stand', en: 'calls everyone "boss", whatever their station' },
  { de: 'räuspert sich vor jeder Lüge', en: 'clears their throat before every lie' },
  { de: 'putzt beim Reden ständig etwas', en: 'is always polishing something while talking' },
  { de: 'lacht an den falschen Stellen', en: 'laughs in the wrong places' },
  { de: 'spricht von sich in der dritten Person', en: 'speaks of themselves in the third person' },
  { de: 'klopft dreimal auf Holz, bevor es losgeht', en: 'knocks on wood three times before starting' },
  { de: 'starrt auf den Mund statt in die Augen', en: 'watches your mouth instead of your eyes' },
  { de: 'antwortet grundsätzlich mit einer Gegenfrage', en: 'answers every question with another' },
  { de: 'kaut auf einem Halm herum', en: 'chews on a stalk of grass' },
  { de: 'sagt „so" statt „ja"', en: 'says "right" instead of "yes"' },
  { de: 'flüstert, sobald es wichtig wird', en: 'drops to a whisper when it matters' },
  { de: 'schaut ständig zur Tür', en: 'keeps glancing at the door' },
  { de: 'nennt Preise immer zuerst, egal worum es geht', en: 'names a price first, whatever the subject' },
  { de: 'fängt Sätze an und lässt sie hängen', en: 'starts sentences and leaves them hanging' },
  { de: 'benutzt Seemannsausdrücke an Land', en: "uses sailor talk far from any sea" },
  { de: 'spricht schneller, je unsicherer es wird', en: 'talks faster the less certain they are' },
  { de: 'duzt sofort jeden', en: 'is on first-name terms within a breath' }
];

/**
 * Archetypen: Vorbelegung statt Zwang.
 *
 * Sie schraenken nur den Beruf ein — alles andere bleibt dem Zufall, sonst
 * saehe jede Wache gleich aus. Verwiesen wird ueber die deutsche Fassung als
 * Schluessel; das ist Innenleben und taucht nirgends in der Oberflaeche auf.
 */
export interface Archetyp {
  readonly id: string;
  readonly berufe: readonly string[];
}

export const ARCHETYPEN: readonly Archetyp[] = [
  { id: 'beliebig', berufe: [] },
  { id: 'wache', berufe: ['Stadtwache', 'Söldnerin', 'Zöllnerin', 'Kerkermeister', 'Veteranin'] },
  { id: 'haendler', berufe: ['Wirt', 'Marktschreier', 'Salzhändler', 'Waffenhändlerin', 'Pfandleiher', 'Geldwechslerin'] },
  { id: 'handwerk', berufe: ['Schmied', 'Bäckerin', 'Töpferin', 'Weber', 'Zimmermann', 'Gerber', 'Glasbläserin', 'Steinmetz'] },
  { id: 'schatten', berufe: ['Taschendieb', 'Hehler', 'Schmuggler', 'Grabräuber', 'Spielmacher'] },
  { id: 'gelehrte', berufe: ['Schreiber', 'Gelehrte', 'Alchemistin', 'Bibliothekar', 'Kartografin', 'Priesterin'] },
  { id: 'landvolk', berufe: ['Fischer', 'Müllerin', 'Köhler', 'Wilderer', 'Jägerin', 'Imker', 'Winzerin', 'Kräuterfrau'] }
];
