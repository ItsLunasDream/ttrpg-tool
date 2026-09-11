/**
 * Woraus eine Figur zusammengesetzt wird.
 *
 * Alles als reine Daten, ohne Oberflaeche und ohne Zufall — so laesst sich
 * pruefen, dass keine Liste leer ist und nichts doppelt vorkommt.
 */

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
 */
export interface Spezies {
  readonly name: string;
  readonly haeufig: boolean;
}

export const SPEZIES: readonly Spezies[] = [
  // Spielerhandbuch
  { name: 'Mensch', haeufig: true },
  { name: 'Elf', haeufig: true },
  { name: 'Zwerg', haeufig: true },
  { name: 'Halbling', haeufig: true },
  { name: 'Gnom', haeufig: true },
  { name: 'Halbelf', haeufig: true },
  { name: 'Halbork', haeufig: true },
  { name: 'Drachenblütiger', haeufig: true },
  { name: 'Tiefling', haeufig: true },
  // Weitere, seltener
  { name: 'Aasimar', haeufig: false },
  { name: 'Goliath', haeufig: false },
  { name: 'Tabaxi', haeufig: false },
  { name: 'Firbolg', haeufig: false },
  { name: 'Kenku', haeufig: false },
  { name: 'Tortle', haeufig: false },
  { name: 'Genasi', haeufig: false },
  { name: 'Triton', haeufig: false },
  { name: 'Goblin', haeufig: false },
  { name: 'Kobold', haeufig: false },
  { name: 'Hobgoblin', haeufig: false },
  { name: 'Bugbear', haeufig: false },
  { name: 'Ork', haeufig: false },
  { name: 'Lizardfolk', haeufig: false },
  { name: 'Yuan-ti', haeufig: false },
  { name: 'Aarakocra', haeufig: false },
  { name: 'Fee', haeufig: false },
  { name: 'Satyr', haeufig: false },
  { name: 'Zentaur', haeufig: false },
  { name: 'Minotaur', haeufig: false },
  { name: 'Golem', haeufig: false },
  { name: 'Warforged', haeufig: false },
  { name: 'Changeling', haeufig: false },
  { name: 'Shifter', haeufig: false },
  { name: 'Kalashtar', haeufig: false },
  { name: 'Harengon', haeufig: false },
  { name: 'Owlin', haeufig: false },
  { name: 'Loxodon', haeufig: false },
  { name: 'Vedalken', haeufig: false },
  { name: 'Simic-Hybrid', haeufig: false },
  { name: 'Leonin', haeufig: false },
  { name: 'Fairy', haeufig: false },
  { name: 'Autognom', haeufig: false },
  { name: 'Plasmoid', haeufig: false },
  { name: 'Thri-Kreen', haeufig: false },
  { name: 'Hadozee', haeufig: false },
  { name: 'Astral-Elf', haeufig: false },
  { name: 'Giff', haeufig: false },
  { name: 'Duergar', haeufig: false },
  { name: 'Eladrin', haeufig: false },
  { name: 'Seeelf', haeufig: false },
  { name: 'Schattarkai-Elf', haeufig: false },
  { name: 'Revenant', haeufig: false },
  { name: 'Dhampir', haeufig: false },
  { name: 'Hexblood', haeufig: false },
  { name: 'Reborn', haeufig: false }
];

/** Was die Figur tut. Der Beruf traegt die halbe Begegnung. */
export const BERUFE = [
  'Wirt', 'Schmied', 'Bäckerin', 'Fuhrmann', 'Stadtwache', 'Marktschreier',
  'Fischer', 'Müllerin', 'Gerber', 'Töpferin', 'Weber', 'Zimmermann',
  'Hebamme', 'Totengräber', 'Bettler', 'Taschendieb', 'Hehler', 'Schmuggler',
  'Söldnerin', 'Karawanenführer', 'Priesterin', 'Novize', 'Schreiber',
  'Gelehrte', 'Alchemistin', 'Kräuterfrau', 'Wilderer', 'Jägerin', 'Köhler',
  'Bergmann', 'Steinmetz', 'Glasbläserin', 'Barbier', 'Bader', 'Gaukler',
  'Barde', 'Puppenspielerin', 'Stallbursche', 'Magd', 'Kutscher',
  'Zöllnerin', 'Ratsherr', 'Schöffe', 'Kerkermeister', 'Henker',
  'Kartografin', 'Bibliothekar', 'Schiffszimmerer', 'Lotse', 'Leuchtturmwärterin',
  'Falkner', 'Hundezüchterin', 'Imker', 'Winzerin', 'Salzhändler',
  'Waffenhändlerin', 'Pfandleiher', 'Geldwechslerin', 'Spielmacher',
  'Wahrsagerin', 'Straßenprediger', 'Reliquienhändlerin', 'Grabräuber',
  'Abenteurerin außer Dienst', 'Deserteur', 'Veteranin', 'Waisenaufseher',
  'Gassenkind', 'Laufbursche', 'Wäscherin'
] as const;

/** Ein Satz, der beim ersten Blick auffaellt. */
export const AUSSEHEN = [
  'eine Narbe quer über dem linken Auge',
  'auffallend saubere Hände für diese Arbeit',
  'ein Ohr fehlt zur Hälfte',
  'graue Strähnen, obwohl noch jung',
  'Finger voller Tintenflecken',
  'ein Gesicht wie ausgetrocknetes Leder',
  'einen Kopf größer als alle im Raum',
  'ungewöhnlich helle, fast farblose Augen',
  'eine Nase, die zweimal gebrochen wurde',
  'Zähne, bei denen zwei aus Silber sind',
  'ein Muttermal in Form eines Blattes am Hals',
  'Hände, die nie ganz stillstehen',
  'Kleidung eine Nummer zu groß',
  'Stiefel, die teurer sind als der Rest',
  'ein frisch rasierter Schädel mit Schnittspuren',
  'Brandnarben an beiden Unterarmen',
  'eine schiefe Schulter vom Tragen',
  'auffällig lange Wimpern',
  'ein Gang, als täte etwas weh',
  'Sommersprossen bis auf die Lider',
  'eine Tätowierung, die halb unter dem Kragen verschwindet',
  'Augenringe wie nach drei schlaflosen Nächten',
  'ein Lächeln, das die Augen nicht erreicht',
  'Ruß in jeder Falte',
  'ein Kinnbart, akkurat gestutzt',
  'Hände voller alter Bissspuren',
  'ein Auge blickt leicht am Gegenüber vorbei',
  'ein Kranz aus getrockneten Blumen im Haar',
  'ein Ring an jedem Finger, alle billig',
  'eine Stimme, die tiefer ist als erwartet'
] as const;

/** Was die Figur will. Ohne das ist sie Kulisse. */
export const MOTIVATIONEN = [
  'will die Schulden abbezahlen, bevor jemand davon erfährt',
  'sucht ein verschwundenes Familienmitglied',
  'will weg aus dieser Stadt, egal wohin',
  'möchte endlich ernst genommen werden',
  'hält ein Versprechen, das längst niemand mehr einfordert',
  'will die eigene Werkstatt übernehmen',
  'sammelt Geld für eine Heilung',
  'sucht jemanden, der zuhört',
  'will den eigenen Namen reinwaschen',
  'wartet auf ein Schiff, das nicht kommt',
  'hütet ein Grab, von dem niemand weiß',
  'will beweisen, dass die Familie unrecht hatte',
  'sucht einen Lehrmeister',
  'will einen alten Streit endlich beilegen',
  'plant heimlich die Abreise',
  'möchte das Kind aus der Gasse holen',
  'will die Konkurrenz ruinieren',
  'sucht ein Buch, das es nicht geben sollte',
  'will noch einmal das Meer sehen',
  'hofft, dass die Abenteurer wieder verschwinden',
  'will endlich schlafen können',
  'sucht Rache, traut sich aber nicht',
  'will die alte Straße wieder öffnen lassen',
  'hält die Stellung, bis Ablösung kommt',
  'sammelt Beweise gegen jemanden',
  'will dazugehören',
  'möchte den Betrieb loswerden',
  'sucht ein Heilmittel für das Vieh',
  'will die Wahrheit über den Brand wissen',
  'hofft auf ein Zeichen der Götter'
] as const;

/** Etwas, das nicht auf der Hand liegt. */
export const GEHEIMNISSE = [
  'kann lesen, gibt es aber nicht zu',
  'hat vor Jahren einen Menschen sterben lassen',
  'arbeitet für die falsche Seite',
  'ist nicht, wer alle denken',
  'versteckt jemanden im Keller',
  'hat die Steuern seit zwei Jahren nicht gezahlt',
  'kann ein wenig zaubern, ganz wenig',
  'trägt eine Waffe, die jemand anderem gehörte',
  'weiß, wo die Leiche liegt',
  'hat den Brief nie abgeschickt',
  'ist das uneheliche Kind einer wichtigen Person',
  'schuldet einer Bande Geld',
  'hat den Vertrag gefälscht',
  'träumt seit Wochen immer dasselbe',
  'sammelt Dinge, die anderen gehören',
  'wurde schon einmal für tot erklärt',
  'hat Angst vor dem eigenen Vater',
  'kennt einen Weg aus der Stadt, den sonst keiner kennt',
  'hat den Fund nicht gemeldet',
  'gehört einem Kult an, der harmlos wirkt'
] as const;

/**
 * Eigenheiten — Marotten, Tics, Lieblingswoerter.
 *
 * Sie werden NUR mit geringer Wahrscheinlichkeit vergeben. Wenn jede Figur
 * eine Marotte haette, waere keine mehr besonders, und der Tisch haette nach
 * drei Begegnungen eine Parade von Karikaturen vor sich.
 */
export const EIGENHEITEN = [
  'sagt bei jedem zweiten Satz „verstehst du"',
  'zählt beim Sprechen an den Fingern mit',
  'wiederholt die letzten Worte des Gegenübers leise',
  'nennt alle „Chef", unabhängig vom Stand',
  'räuspert sich vor jeder Lüge',
  'putzt beim Reden ständig etwas',
  'lacht an den falschen Stellen',
  'spricht von sich in der dritten Person',
  'klopft dreimal auf Holz, bevor es losgeht',
  'starrt auf den Mund statt in die Augen',
  'antwortet grundsätzlich mit einer Gegenfrage',
  'kaut auf einem Halm herum',
  'sagt „so" statt „ja"',
  'flüstert, sobald es wichtig wird',
  'schaut ständig zur Tür',
  'nennt Preise immer zuerst, egal worum es geht',
  'fängt Sätze an und lässt sie hängen',
  'benutzt Seemannsausdrücke an Land',
  'spricht schneller, je unsicherer es wird',
  'duzt sofort jeden'
] as const;

/**
 * Archetypen: Vorbelegung statt Zwang.
 *
 * Sie schraenken nur den Beruf ein — alles andere bleibt dem Zufall, sonst
 * saehe jede Wache gleich aus.
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
