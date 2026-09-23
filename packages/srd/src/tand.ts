/**
 * Die Tabelle „Trinkets" / „Requisiten" (1W100) aus dem SRD 5.2.1.
 *
 * DIESE DATEI IST ERZEUGT (packages/srd/werkzeug/tand_lesen.py). Gepaart
 * ueber die Nummer, die in beiden Fassungen dieselbe ist. Der Text steht so
 * da, wie ihn das jeweilige PDF druckt.
 */

export const TAND_TITEL = { de: 'Requisiten', en: 'Trinkets' } as const;

/** Hundert Eintraege, Index 0 ist die 1 (im englischen Druck „01"), Index 99 die 100 („00"). */
export const TAND: readonly { readonly de: string; readonly en: string }[] = [
  {
    "de": "Mumifizierte Hand eines Goblins",
    "en": "A mummified goblin hand"
  },
  {
    "de": "Kristall, der im Mondlicht schwach leuchtet",
    "en": "A crystal that faintly glows in moonlight"
  },
  {
    "de": "Goldmünze, die in einem fremden Land geprägt wurde",
    "en": "A gold coin minted in an unknown land"
  },
  {
    "de": "In einer dir unbekannten Sprache verfasstes Tagebuch",
    "en": "A diary written in a language you don’t know"
  },
  {
    "de": "Messingring, der niemals matt wird",
    "en": "A brass ring that never tarnishes"
  },
  {
    "de": "Alte Schachfigur aus Glas",
    "en": "An old chess piece made from glass"
  },
  {
    "de": "Zwei Knochenwürfel mit einem Totenschädel anstelle der Sechs",
    "en": "A pair of knucklebone dice, each with a skull symbol on the side that would normally show six pips"
  },
  {
    "de": "Kleine Götzenskulptur einer alptraumhaften Kreatur, die dir beunruhigende Träume beschert, wenn du in ihrer Nähe schläfst",
    "en": "A small idol depicting a nightmarish creature that gives you unsettling dreams when you sleep near it"
  },
  {
    "de": "Haarlocke",
    "en": "A lock of someone’s hair"
  },
  {
    "de": "Urkunde für ein Grundstück in einem dir unbekannten Land",
    "en": "The deed for a parcel of land in a realm unknown to you"
  },
  {
    "de": "Block aus unbekanntem Material, etwa 30 Gramm schwer",
    "en": "A 1-ounce block made from an unknown material"
  },
  {
    "de": "Kleine nadelgespickte Stoffpuppe",
    "en": "A small cloth doll skewered with needles"
  },
  {
    "de": "Zahn eines unbekannten Tieres",
    "en": "A tooth from an unknown beast"
  },
  {
    "de": "Riesige Schuppe, vielleicht von einem Drachen",
    "en": "An enormous scale, perhaps from a dragon"
  },
  {
    "de": "Leuchtend grüne Feder",
    "en": "A bright-green feather"
  },
  {
    "de": "Alte Wahrsagerkarte, die dein Abbild trägt",
    "en": "An old divination card bearing your likeness"
  },
  {
    "de": "Glaskugel, gefüllt mit wirbelndem Rauch",
    "en": "A glass orb filled with moving smoke"
  },
  {
    "de": "Ei mit leuchtend roter Schale, etwa 500 Gramm schwer",
    "en": "A 1-pound egg with a bright-red shell"
  },
  {
    "de": "Pfeife, die Seifenblasen entstehen lässt",
    "en": "A pipe that blows bubbles"
  },
  {
    "de": "Einmachglas mit einem Stück Fleisch in Beize",
    "en": "A glass jar containing a bit of flesh floating in pickling fluid"
  },
  {
    "de": "Kleine gnomische Spieluhr, die ein Lied spielt, an das du dich vage aus deiner Kindheit erinnerst",
    "en": "A gnome-crafted music box that plays a song you dimly remember from your childhood"
  },
  {
    "de": "Kleine Holzfigur, die einen selbstgefälligen Halbling darstellt",
    "en": "A wooden statuette of a smug halfling"
  },
  {
    "de": "Messingkugel, in die seltsame Runen eingraviert sind",
    "en": "A brass orb etched with strange runes"
  },
  {
    "de": "Bunte Steinscheibe",
    "en": "A multicolored stone disk"
  },
  {
    "de": "Winziges silbernes Abbild eines Raben",
    "en": "A silver icon of a raven"
  },
  {
    "de": "Beutel mit 47 Zähnen, einer davon faulig",
    "en": "A bag containing forty-seven teeth, one of which is rotten"
  },
  {
    "de": "Obsidianscherbe, die sich warm anfühlt",
    "en": "A shard of obsidian that always feels warm to the touch"
  },
  {
    "de": "Drachenklaue an einem Lederhalsband",
    "en": "A dragon’s talon strung on a leather necklace"
  },
  {
    "de": "Ein Paar alte Socken",
    "en": "A pair of old socks"
  },
  {
    "de": "Leeres Buch, dessen Seiten weder Tinte, Kreide oder Graphit noch irgendeine andere Substanz aufnehmen",
    "en": "A blank book whose pages refuse to hold ink, chalk, graphite, or any other marking"
  },
  {
    "de": "Silbernes Abzeichen in Form eines fünfzackigen Sterns",
    "en": "A silver badge that is a five-pointed star"
  },
  {
    "de": "Messer, das einmal einem Verwandten gehört hat",
    "en": "A knife that belonged to a relative"
  },
  {
    "de": "Glasphiole mit Fingernagelabschnitten",
    "en": "A glass vial filled with nail clippings"
  },
  {
    "de": "Rechteckiger Metallapparat mit zwei winzigen Metallschälchen an einem Ende, die Funken sprühen, wenn sie nass werden",
    "en": "A rectangular metal device with two tiny metal cups on one end that throws sparks when wet"
  },
  {
    "de": "Weißer Handschuh mit Pailletten, passend für einen Menschen",
    "en": "A white, sequined glove sized for a human"
  },
  {
    "de": "Weste mit Hunderten von kleinen Taschen",
    "en": "A vest with one hundred tiny pockets"
  },
  {
    "de": "Gewichtsloser Kiesel",
    "en": "A weightless stone"
  },
  {
    "de": "Skizze eines Goblins",
    "en": "A sketch of a goblin"
  },
  {
    "de": "Leere Glasphiole, die nach Parfüm riecht",
    "en": "An empty glass vial that smells of perfume"
  },
  {
    "de": "Edelstein, der für jeden außer dir wie ein Stück Kohle aussieht",
    "en": "A gemstone that looks like a lump of coal when examined by anyone but you"
  },
  {
    "de": "Fetzen eines alten Kriegsbanners",
    "en": "A scrap of cloth from an old banner"
  },
  {
    "de": "Rangabzeichen eines verschollenen Legionärs",
    "en": "A rank insignia from a lost legionnaire"
  },
  {
    "de": "Silberglöckchen ohne Klöppel",
    "en": "A silver bell without a clapper"
  },
  {
    "de": "Mechanischer Kanarienvogel in einer Lampe",
    "en": "A mechanical canary inside a lamp"
  },
  {
    "de": "Winzige Truhe, die so geschnitzt ist, als hätte sie unten zahlreiche Füße",
    "en": "A miniature chest carved to look like it has numerous feet on the bottom"
  },
  {
    "de": "Toter Feengeist in einer farblosen Glasflasche",
    "en": "A dead sprite inside a clear glass bottle"
  },
  {
    "de": "Metalldose ohne Öffnung, die klingt, als enthielte sie (nach deiner Wahl) Flüssigkeit, Sand, Spinnen oder Glasscherben",
    "en": "A metal can that has no opening but sounds as if it is filled with liquid, sand, spiders, or broken glass (your choice)"
  },
  {
    "de": "Glaskugel voll Wasser, in der ein Uhrwerk-Goldfisch schwimmt",
    "en": "A glass orb filled with water, in which swims a clockwork goldfish"
  },
  {
    "de": "Silberlöffel mit eingraviertem M am Griff",
    "en": "A silver spoon with an M engraved on the handle"
  },
  {
    "de": "Pfeife aus goldfarbenem Holz",
    "en": "A whistle made from gold-colored wood"
  },
  {
    "de": "Toter Mistkäfer, so groß wie deine Hand",
    "en": "A dead scarab beetle the size of your hand"
  },
  {
    "de": "Zwei Spielzeugsoldaten, einer ohne Kopf",
    "en": "Two toy soldiers, one missing a head"
  },
  {
    "de": "Schatulle, mit unterschiedlich großen Knöpfen gefüllt",
    "en": "A small box filled with different-sized buttons"
  },
  {
    "de": "Kerze, die sich nicht anzünden lässt",
    "en": "A candle that can’t be lit"
  },
  {
    "de": "Winziger Käfig ohne Tür",
    "en": "A miniature cage with no door"
  },
  {
    "de": "Alter Schlüssel",
    "en": "An old key"
  },
  {
    "de": "Nicht zu entschlüsselnde Schatzkarte",
    "en": "An indecipherable treasure map"
  },
  {
    "de": "Heft eines zerbrochenen Schwertes",
    "en": "A hilt from a broken sword"
  },
  {
    "de": "Hasenpfote",
    "en": "A rabbit’s foot"
  },
  {
    "de": "Glasauge",
    "en": "A glass eye"
  },
  {
    "de": "Kamee, die eine hässliche Person darstellt",
    "en": "A cameo of a hideous person"
  },
  {
    "de": "Münzgroßer silberner Totenschädel",
    "en": "A silver skull the size of a coin"
  },
  {
    "de": "Alabastermaske",
    "en": "An alabaster mask"
  },
  {
    "de": "Stinkender Kegel aus klebrigem schwarzen Weihrauch",
    "en": "A cone of sticky black incense that stinks"
  },
  {
    "de": "Schlafmütze, die dem Träger angenehme Träume beschert",
    "en": "A nightcap that gives you pleasant dreams when you wear it"
  },
  {
    "de": "Einzelner Krähenfuß aus Knochen",
    "en": "A single caltrop made from bone"
  },
  {
    "de": "Goldener Monokelrahmen ohne Linse",
    "en": "A gold monocle frame without the lens"
  },
  {
    "de": "Fingerbreiter Würfel, jede Seite andersfarbig",
    "en": "A 1-inch cube, each side a different color"
  },
  {
    "de": "Kristallener Türknauf",
    "en": "A crystal doorknob"
  },
  {
    "de": "Päckchen mit rosafarbenem Staub",
    "en": "A packet filled with pink dust"
  },
  {
    "de": "Zwei Pergamentseiten mit den Noten eines wundervollen Lieds",
    "en": "A fragment of a beautiful song, written as musical notes on two pieces of parchment"
  },
  {
    "de": "Silberner tropfenförmiger Ohrring, der eine echte Träne enthält",
    "en": "A silver teardrop earring containing a real teardrop"
  },
  {
    "de": "Schale eines Eis, auf die verstörend detailreiche Szenen des Leids gemalt wurden",
    "en": "An eggshell painted with scenes of misery in disturbing detail"
  },
  {
    "de": "Fächer, der geöffnet eine schlafende Katze zeigt",
    "en": "A fan that, when unfolded, shows a sleepy cat"
  },
  {
    "de": "Knochenpfeifensatz",
    "en": "A set of bone pipes"
  },
  {
    "de": "Vierblättriges Kleeblatt, verwahrt in einem Buch über Anstand und Etikette",
    "en": "A four-leaf clover pressed inside a book discussing manners and etiquette"
  },
  {
    "de": "Pergamentseite mit der Skizze eines mechanischen Apparats",
    "en": "A sheet of parchment upon which is drawn a mechanical contraption"
  },
  {
    "de": "Verzierte Scheide, in die keine dir bekannte Klinge passt",
    "en": "An ornate scabbard that fits no blade you have found"
  },
  {
    "de": "Einladung zu einer Feier, auf der ein Mord verübt wurde",
    "en": "An invitation to a party where a murder happened"
  },
  {
    "de": "Fünfeckiger Stern aus Bronze mit eingraviertem Rattenkopf in der Mitte",
    "en": "A bronze pentacle with an etching of a rat’s head in its center"
  },
  {
    "de": "Violettes Taschentuch, mit dem Namen eines mächtigen Erzmagiers bestickt",
    "en": "A purple handkerchief embroidered with the name of an archmage"
  },
  {
    "de": "Halber Grundriss eines Tempels, Schlosses oder anderen Bauwerks",
    "en": "Half a floor plan for a temple, a castle, or another structure"
  },
  {
    "de": "Stück gefalteter Stoff, das entfaltet zu einer schicken Mütze wird",
    "en": "A bit of folded cloth that, when unfolded, turns into a stylish cap"
  },
  {
    "de": "Einzahlungsbeleg einer Bank in einer fernen Stadt",
    "en": "A receipt of deposit at a bank in a far-off city"
  },
  {
    "de": "Tagebuch, dem sieben Seiten fehlen",
    "en": "A diary with seven missing pages"
  },
  {
    "de": "Leere silberne Schnupftabakdose, in deren Deckel das Wort „Träume“ eingraviert ist",
    "en": "An empty silver snuffbox bearing the inscription “dreams” on its lid"
  },
  {
    "de": "Eisernes heiliges Symbol, einer unbekannten Gottheit geweiht",
    "en": "An iron holy symbol devoted to an unknown god"
  },
  {
    "de": "Buch über Aufstieg und Fall eines legendären Helden – das letzte Kapitel fehlt",
    "en": "A book about a legendary hero’s rise and fall, with the last chapter missing"
  },
  {
    "de": "Phiole mit Drachenblut",
    "en": "A vial of dragon blood"
  },
  {
    "de": "Uralter Pfeil nach elfischer Art",
    "en": "An ancient arrow of elven design"
  },
  {
    "de": "Nadel, die sich nicht verbiegen lässt",
    "en": "A needle that never bends"
  },
  {
    "de": "Verzierte Brosche nach zwergischer Art",
    "en": "An ornate brooch of dwarven design"
  },
  {
    "de": "Leere Weinflasche mit hübschem Etikett, beschriftet mit: „Weinmagiers Winzerei, Roter Drache Spätlese, 331422-W“",
    "en": "An empty wine bottle bearing a pretty label that says, “The Wizard of Wines Winery, Red Dragon Crush, 331422-W”"
  },
  {
    "de": "Mosaikfliese mit bunt glasierter Oberfläche",
    "en": "A mosaic tile with a multicolored, glazed surface"
  },
  {
    "de": "Versteinerte Maus",
    "en": "A petrified mouse"
  },
  {
    "de": "Schwarze Piratenflagge mit Drachenschädel und gekreuzten Knochen",
    "en": "A black pirate flag adorned with a dragon’s skull and crossbones"
  },
  {
    "de": "Winzige mechanische Krabbe oder Spinne, die sich bewegt, wenn man nicht hinsieht",
    "en": "A tiny mechanical crab or spider that moves about when it’s not being observed"
  },
  {
    "de": "Einmachglas mit Fett, beschriftet mit „Greifenschmalz“",
    "en": "A glass jar containing lard with a label that reads, “Griffon Grease”"
  },
  {
    "de": "Holzschatulle mit Keramikboden, die einen Wurm mit einem Kopf an jedem Körperende enthält",
    "en": "A wooden box with a ceramic bottom that holds a living worm with a head on each end of its body"
  },
  {
    "de": "Metallene Urne mit der Asche eines Helden",
    "en": "A metal urn containing the ashes of a hero"
  }
];
