/**
 * Orte.
 *
 * Ein Ort besteht aus vier Teilen, die getrennt gezogen werden: Name, Art,
 * ein Merkmal, das ihn von jedem anderen seiner Art unterscheidet, und sein
 * Zustand. Dazu eine Zeile fuer die Karte — nicht als Bild, sondern als Satz
 * darueber, was darauf gehoerte.
 *
 * Der Name entsteht aus zwei Haelften. Das ist der billigste Weg zu vielen
 * Namen, die trotzdem klingen, als kaemen sie aus derselben Welt: 44 x 40
 * Haelften sind ueber 1700 Namen, und keiner musste einzeln erfunden werden.
 * Beide Sprachen setzen dieselben zwei Stellen zusammen, darum heisst
 * Rabenstein auf Englisch Ravenstone und nicht Rabenstein.
 */
import type { Eintrag, Paar } from './tabellen';

/** Die erste Haelfte eines Ortsnamens. */
export const NAME_ERSTE: readonly Paar[] = [
  { de: 'Raben', en: 'Raven' },
  { de: 'Nebel', en: 'Mist' },
  { de: 'Asch', en: 'Ash' },
  { de: 'Grau', en: 'Grey' },
  { de: 'Eisen', en: 'Iron' },
  { de: 'Salz', en: 'Salt' },
  { de: 'Dorn', en: 'Thorn' },
  { de: 'Winter', en: 'Winter' },
  { de: 'Hoch', en: 'High' },
  { de: 'Tief', en: 'Deep' },
  { de: 'Alt', en: 'Old' },
  { de: 'Stein', en: 'Stone' },
  { de: 'Wolf', en: 'Wolf' },
  { de: 'Bären', en: 'Bear' },
  { de: 'Kupfer', en: 'Copper' },
  { de: 'Silber', en: 'Silver' },
  { de: 'Schatten', en: 'Shadow' },
  { de: 'Feuer', en: 'Fire' },
  { de: 'Sturm', en: 'Storm' },
  { de: 'Mond', en: 'Moon' },
  { de: 'Herbst', en: 'Autumn' },
  { de: 'Weiden', en: 'Willow' },
  { de: 'Erlen', en: 'Alder' },
  { de: 'Krähen', en: 'Crow' },
  { de: 'Falken', en: 'Falcon' },
  { de: 'Schwarz', en: 'Black' },
  { de: 'Rot', en: 'Red' },
  { de: 'Weiß', en: 'White' },
  { de: 'Glocken', en: 'Bell' },
  { de: 'Toten', en: 'Dead' },
  { de: 'Königs', en: 'King’s' },
  { de: 'Bettler', en: 'Beggar' },
  { de: 'Wind', en: 'Wind' },
  { de: 'Fels', en: 'Crag' },
  { de: 'Moos', en: 'Moss' },
  { de: 'Schilf', en: 'Reed' },
  { de: 'Anker', en: 'Anchor' },
  { de: 'Schmied', en: 'Smith' },
  { de: 'Pilger', en: 'Pilgrim' },
  { de: 'Wacht', en: 'Watch' },
  { de: 'Zwielicht', en: 'Twilight' },
  { de: 'Frost', en: 'Frost' },
  { de: 'Gold', en: 'Gold' },
  { de: 'Aschen', en: 'Cinder' }
];

/** Die zweite Haelfte. */
export const NAME_ZWEITE: readonly Paar[] = [
  { de: 'stein', en: 'stone' },
  { de: 'furt', en: 'ford' },
  { de: 'brücke', en: 'bridge' },
  { de: 'hafen', en: 'harbour' },
  { de: 'burg', en: 'burgh' },
  { de: 'feste', en: 'hold' },
  { de: 'markt', en: 'market' },
  { de: 'tal', en: 'dale' },
  { de: 'berg', en: 'mount' },
  { de: 'moor', en: 'moor' },
  { de: 'au', en: 'meadow' },
  { de: 'wald', en: 'wood' },
  { de: 'hain', en: 'grove' },
  { de: 'grund', en: 'bottom' },
  { de: 'halde', en: 'slope' },
  { de: 'klippe', en: 'cliff' },
  { de: 'bucht', en: 'cove' },
  { de: 'werft', en: 'yard' },
  { de: 'tor', en: 'gate' },
  { de: 'wacht', en: 'watch' },
  { de: 'turm', en: 'tower' },
  { de: 'hof', en: 'court' },
  { de: 'mühle', en: 'mill' },
  { de: 'brunnen', en: 'well' },
  { de: 'steg', en: 'pier' },
  { de: 'schlucht', en: 'gorge' },
  { de: 'kamm', en: 'ridge' },
  { de: 'pass', en: 'pass' },
  { de: 'schacht', en: 'shaft' },
  { de: 'stollen', en: 'adit' },
  { de: 'grab', en: 'barrow' },
  { de: 'kreuz', en: 'cross' },
  { de: 'anger', en: 'green' },
  { de: 'rast', en: 'rest' },
  { de: 'weide', en: 'pasture' },
  { de: 'quell', en: 'spring' },
  { de: 'see', en: 'mere' },
  { de: 'sand', en: 'sands' },
  { de: 'kessel', en: 'basin' },
  { de: 'scharte', en: 'notch' }
];

/**
 * Was der Ort ist.
 *
 * Nach Region markiert, denn hier faellt es auf: eine Salzsiederei im
 * Unterreich geht noch durch, eine Wüstenoase im Hafen nicht.
 */
export const ORT_ART: readonly Eintrag[] = [
  { de: 'ein Zollhaus am einzigen befahrbaren Tor', en: 'a customs house at the only usable gate', regionen: ['stadt', 'hafen'] },
  { de: 'ein Badehaus, in dem mehr verhandelt als gebadet wird', en: 'a bathhouse where more is negotiated than washed', regionen: ['stadt'] },
  { de: 'eine Färberei, die das halbe Viertel riechen lässt', en: 'a dyeworks the whole quarter can smell', regionen: ['stadt'] },
  { de: 'ein Armenspital mit zwei Ärzten und achtzig Betten', en: 'a poorhouse hospital with two doctors and eighty beds', regionen: ['stadt'] },
  { de: 'ein Waisenhaus, das von einer Zunft bezahlt wird', en: 'an orphanage paid for by a guild', regionen: ['stadt'] },
  { de: 'ein Archiv in einem ehemaligen Getreidespeicher', en: 'an archive in a former granary', regionen: ['stadt'] },
  { de: 'ein Schuldturm, in dem längst keine Schuldner mehr sitzen', en: 'a debtors’ tower with no debtors left in it', regionen: ['stadt'] },
  { de: 'eine Trockendockanlage mit einem Schiff, das nie fertig wird', en: 'a dry dock holding a ship that is never finished', regionen: ['hafen'] },
  { de: 'ein Leuchtturm mit eigenem Brunnen und eigener Vorratskammer', en: 'a lighthouse with its own well and larder', regionen: ['hafen', 'see'] },
  { de: 'eine Salzsiederei, in der rund um die Uhr Feuer brennt', en: 'a saltworks where the fires never go out', regionen: ['hafen', 'see'] },
  { de: 'ein Fischmarkt, der um vier Uhr morgens am lautesten ist', en: 'a fish market loudest at four in the morning', regionen: ['hafen'] },
  { de: 'ein Wrackfeld, das bei Ebbe begehbar wird', en: 'a field of wrecks you can walk at low tide', regionen: ['hafen', 'see'] },
  { de: 'eine Köhlerei tief im Bestand, drei Tage von allem entfernt', en: 'a charcoal camp deep in the timber, three days from anywhere', regionen: ['wald'] },
  { de: 'ein Jagdhaus, das dem Landesherrn gehört und leer steht', en: 'a hunting lodge owned by the lord and standing empty', regionen: ['wald', 'berge'] },
  { de: 'ein Baumdorf in den Kronen, über Stege verbunden', en: 'a village in the canopy, linked by walkways', regionen: ['wald'] },
  { de: 'eine Lichtung, auf der nichts wächst und nichts verrottet', en: 'a clearing where nothing grows and nothing rots', regionen: ['wald', 'oedland'] },
  { de: 'ein Bergkloster, erreichbar über eine einzige Treppe', en: 'a mountain monastery reached by a single stair', regionen: ['berge'] },
  { de: 'ein Erzbergwerk mit drei Sohlen, zwei davon geflutet', en: 'an ore mine on three levels, two of them flooded', regionen: ['berge', 'unterreich'] },
  { de: 'eine Passhütte, in der nie jemand allein übernachtet', en: 'a pass shelter where nobody ever sleeps alone', regionen: ['berge', 'eis'] },
  { de: 'eine Seilbahn aus Weidenseil über eine Schlucht', en: 'a willow-rope cableway over a gorge', regionen: ['berge'] },
  { de: 'eine Karawanserei mit vier Brunnen, von denen zwei trocken sind', en: 'a caravanserai with four wells, two of them dry', regionen: ['wueste', 'steppe'] },
  { de: 'eine Grabstadt, in der die Lebenden nur Gäste sind', en: 'a city of tombs where the living are guests only', regionen: ['wueste', 'oedland'] },
  { de: 'ein Glasfeld, das ein alter Brand zurückgelassen hat', en: 'a field of glass left behind by an old fire', regionen: ['wueste', 'vulkan'] },
  { de: 'eine Pfahlsiedlung über braunem Wasser', en: 'a stilt settlement over brown water', regionen: ['sumpf'] },
  { de: 'eine Torfstecherei mit einem sehr alten Fund im Schuppen', en: 'a peat cutting with a very old find in the shed', regionen: ['sumpf'] },
  { de: 'ein Damm, der eine ganze Talsenke trocken hält', en: 'a dyke keeping an entire hollow dry', regionen: ['sumpf', 'see'] },
  { de: 'eine Pilzfarm in einer ausgeräumten Kaverne', en: 'a fungus farm in a hollowed-out cavern', regionen: ['unterreich'] },
  { de: 'ein Tiefenmarkt, auf dem Licht die teuerste Ware ist', en: 'a deep market where light is the costliest good', regionen: ['unterreich'] },
  { de: 'ein Schachtaufzug, bedient von einer einzigen Familie', en: 'a shaft lift run by one single family', regionen: ['unterreich', 'berge'] },
  { de: 'ein Fährhaus an einer Stelle, an der der Fluss zu breit ist', en: 'a ferry house where the river is too wide', regionen: ['see', 'sumpf'] },
  { de: 'eine Insel mit einem Haus und ohne Boot', en: 'an island with one house and no boat', regionen: ['see'] },
  { de: 'ein Winterlager, das im Sommer eine Ruine ist', en: 'a winter camp that is a ruin in summer', regionen: ['steppe', 'eis'] },
  { de: 'ein Steinkreis, den die Herden weiträumig umgehen', en: 'a stone circle the herds give a wide berth', regionen: ['steppe', 'oedland'] },
  { de: 'eine Poststation mit frischen Pferden und alten Nachrichten', en: 'a post station with fresh horses and stale news', regionen: ['steppe'] },
  { de: 'eine Walfangstation, seit zwei Jahren ohne Wale', en: 'a whaling station, two years without whales', regionen: ['eis', 'see'] },
  { de: 'eine Höhle unter dem Gletscher, in der es wärmer wird statt kälter', en: 'a cave under the glacier that grows warmer, not colder', regionen: ['eis'] },
  { de: 'ein Schwefelfeld, auf dem man nur mit nassem Tuch atmet', en: 'a sulphur field where you breathe through a wet cloth', regionen: ['vulkan'] },
  { de: 'eine Schmiede, die die Erdwärme selbst als Esse nutzt', en: 'a forge using the earth’s own heat as its hearth', regionen: ['vulkan', 'unterreich'] },
  { de: 'ein Aschedorf, das jedes Jahr einmal ausgegraben wird', en: 'an ash village dug out once a year', regionen: ['vulkan'] },
  { de: 'ein Schlachtfeld, auf dem noch die Zelte stehen', en: 'a battlefield with the tents still standing', regionen: ['oedland'] },
  { de: 'eine Straße ohne Anfang und Ende, gepflastert und gerade', en: 'a road with no beginning and no end, paved and straight', regionen: ['oedland', 'steppe'] },
  { de: 'ein Gasthaus an einer Kreuzung, an der keine vier Wege mehr zusammenkommen', en: 'an inn at a crossing where four roads no longer meet' },
  { de: 'eine Kapelle, in der zwei Glaubensrichtungen abwechselnd beten', en: 'a chapel where two faiths pray in turns' },
  { de: 'ein Turm, der nur von innen kleiner ist als von außen', en: 'a tower smaller inside than out' },
  { de: 'ein Lagerhaus, dessen Besitzer seit sechs Jahren niemand gesehen hat', en: 'a warehouse whose owner nobody has seen in six years' },
  { de: 'eine Brücke mit einem Haus darauf, in dem jemand wohnt', en: 'a bridge with a house on it, and someone living in it' },
  { de: 'ein Friedhof, der größer ist als die Siedlung daneben', en: 'a graveyard larger than the settlement beside it' },
  { de: 'ein Gestüt, auf dem seit einem Jahr kein Fohlen mehr fällt', en: 'a stud farm where no foal has been born for a year' },
  { de: 'eine Bibliothek, die Bücher nur gegen Bücher herausgibt', en: 'a library that lends books only in exchange for books' },
  { de: 'eine Mühle, die stillsteht, obwohl der Bach läuft', en: 'a mill standing idle though the stream runs' }
];

/** Was diesen Ort von jedem anderen seiner Art unterscheidet. */
export const ORT_MERKMAL: readonly Eintrag[] = [
  { de: 'Alles hier ist doppelt vorhanden, seit dem Brand von damals.', en: 'Everything here exists twice, ever since the old fire.' },
  { de: 'Es gibt genau eine Regel, und sie wird streng eingehalten.', en: 'There is exactly one rule, and it is kept strictly.' },
  { de: 'Fremde werden bewirtet, aber nicht angesehen.', en: 'Strangers are fed here, but not looked at.' },
  { de: 'Die Wände tragen Namen, die regelmäßig überschrieben werden.', en: 'The walls carry names, regularly written over.' },
  { de: 'Kinder gehen frei überall hin, Erwachsene nicht.', en: 'Children go anywhere they like; adults do not.' },
  { de: 'Es riecht durchgehend nach etwas, das hier nicht verarbeitet wird.', en: 'It smells constantly of something nobody here processes.' },
  { de: 'Nachts wird an einer Stelle gearbeitet, die tagsüber verschlossen ist.', en: 'At night work is done in a place locked by day.' },
  { de: 'Es gibt mehr Türen als Räume.', en: 'There are more doors than rooms.' },
  { de: 'Die Uhr geht vor, und alle richten sich nach ihr.', en: 'The clock runs fast, and everyone goes by it.' },
  { de: 'Jeder hier schuldet derselben Person etwas.', en: 'Everyone here owes the same person something.' },
  { de: 'Ein Teil ist frisch gebaut und passt nicht zum Rest.', en: 'One part is newly built and does not match the rest.' },
  { de: 'Die Vorräte reichen für dreimal so viele Leute.', en: 'The stores would feed three times as many people.' },
  { de: 'Man spricht hier eine ältere Fassung der Landessprache.', en: 'They speak an older form of the local tongue here.' },
  { de: 'Es gibt keinen einzigen Spiegel.', en: 'There is not one mirror in the place.' },
  { de: 'Die Tiere sind auffallend ruhig.', en: 'The animals are conspicuously calm.' },
  { de: 'Jeden Abend wird etwas verbrannt, und niemand erklärt was.', en: 'Something is burned every evening and nobody explains what.' },
  { de: 'Die Zufahrt ist besser instand gehalten als der Ort selbst.', en: 'The approach road is in better repair than the place itself.' },
  { de: 'Hier wird nicht gehandelt, sondern getauscht — auf Heller und Pfennig.', en: 'Nothing is bought here, only traded, and to the penny.' },
  { de: 'Ein Raum steht leer und wird sauber gehalten.', en: 'One room stands empty and is kept clean.' },
  { de: 'Alle tragen dasselbe Zeichen, aber keiner nennt es beim Namen.', en: 'They all wear the same token, and none of them names it.' },
  { de: 'Das Wasser muss von weit her geholt werden, seit Jahren.', en: 'Water has to be fetched from far away, and has for years.' },
  { de: 'Wer hier ankommt, bleibt länger als geplant.', en: 'People who arrive here stay longer than they meant to.' },
  { de: 'Es gibt eine Liste, wer wann hier war, und sie wird geführt.', en: 'There is a list of who was here and when, and it is kept up.' },
  { de: 'Ein Teil des Gebäudes ist zugemauert, von innen.', en: 'Part of the building is bricked up, from the inside.' },
  { de: 'Die Nachtruhe beginnt hier eine Stunde früher als überall sonst.', en: 'Curfew here falls an hour earlier than anywhere else.' },
  { de: 'Es wird gebaut, aber nie fertiggebaut.', en: 'Building never stops and never finishes.' },
  { de: 'Die Ältesten treffen die Entscheidungen, und sie sind alle unter dreißig.', en: 'The elders decide everything, and all of them are under thirty.' },
  { de: 'Man bezahlt mit Marken, die nur hier etwas wert sind.', en: 'Payment is in tokens worth something only here.' },
  { de: 'Es gibt zwei Eingänge und nur einen Ausgang.', en: 'There are two ways in and only one way out.' },
  { de: 'Die Böden sind neu, die Wände uralt.', en: 'The floors are new, the walls ancient.' },
  { de: 'Hier wohnen mehr Alte als Junge, und das seit einer Generation.', en: 'The old outnumber the young here, and have for a generation.' },
  { de: 'Ein Hund läuft frei herum, den niemand füttert und alle kennen.', en: 'A dog runs loose that nobody feeds and everybody knows.' },
  { de: 'Jede Tür lässt sich nur von einer Seite schließen.', en: 'Every door locks from one side only.' },
  { de: 'Seit dem letzten Winter fehlen drei Leute im Verzeichnis.', en: 'Three people have been missing from the register since last winter.' },
  { de: 'Das Beste hier wird nicht verkauft, sondern verschenkt.', en: 'The best thing here is not sold but given away.' },
  { de: 'Fremde Sprache, fremde Münze, und beides wird angenommen.', en: 'Foreign tongue, foreign coin, and both are accepted.' },
  { de: 'Es gibt einen Platz, an dem alle stehen bleiben, ohne zu wissen warum.', en: 'There is a spot where everyone pauses without knowing why.' },
  { de: 'Die Vorräte sind gezählt und stimmen nie.', en: 'The stores are counted, and the count is never right.' },
  { de: 'Hier wird eine Fehde ausgetragen, die niemand mehr begründen kann.', en: 'A feud is running here that nobody can explain any more.' },
  { de: 'Die Arbeit hört auf, sobald ein Fremder zusieht.', en: 'Work stops the moment a stranger watches.' }
];

/** Wie es gerade um ihn steht. */
export const ORT_ZUSTAND: readonly Eintrag[] = [
  { de: 'Er läuft gut, und genau das macht die Nachbarn nervös.', en: 'Business is good, and that is what makes the neighbours nervous.' },
  { de: 'Er ist überfüllt, seit die Leute von weiter weg kommen.', en: 'It is overfull since people started coming from further away.', themen: ['krieg', 'seuche'] },
  { de: 'Er wird geräumt, und niemand sagt, wohin.', en: 'It is being evacuated, and nobody says where to.' },
  { de: 'Er hat den Besitzer gewechselt, zum dritten Mal in einem Jahr.', en: 'It changed hands, for the third time this year.', themen: ['gier'] },
  { de: 'Er steht unter Quarantäne, mehr aus Vorsicht als aus Not.', en: 'It is under quarantine, more from caution than from need.', themen: ['seuche'] },
  { de: 'Er ist verpfändet und wird in drei Monaten versteigert.', en: 'It is mortgaged and goes to auction in three months.', themen: ['gier', 'erbe'] },
  { de: 'Er wird gerade wieder aufgebaut, mit fremdem Geld.', en: 'It is being rebuilt, with somebody else’s money.' },
  { de: 'Er ist seit dem Herbst ohne Anführung.', en: 'It has had nobody in charge since autumn.' },
  { de: 'Zwei Parteien beanspruchen ihn, beide mit Papier.', en: 'Two parties claim it, both with paperwork.', themen: ['erbe', 'verrat'] },
  { de: 'Er ist zur Hälfte aufgegeben; die andere Hälfte ist voller denn je.', en: 'Half of it is abandoned; the other half is fuller than ever.' },
  { de: 'Er wird bewacht, seit dort etwas gefunden wurde.', en: 'It has been guarded ever since something was found there.', themen: ['wissen'] },
  { de: 'Die Wege dorthin sind verlegt worden, angeblich wegen Hochwasser.', en: 'The roads there were rerouted, supposedly because of flooding.' },
  { de: 'Er blüht auf, seit die alte Ordnung dort nicht mehr gilt.', en: 'It is thriving since the old order stopped applying there.', themen: ['aufstieg'] },
  { de: 'Er ist verschuldet, aber niemand weiß bei wem.', en: 'It is in debt, though nobody knows to whom.', themen: ['gier'] },
  { de: 'Er ist gerade abgebrannt, zum zweiten Mal an derselben Stelle.', en: 'It just burned, for the second time in the same spot.' },
  { de: 'Er wird bald geschlossen, sagt ein Aushang von vor zwei Jahren.', en: 'It is closing soon, says a notice posted two years ago.', tonfall: ['heiter'] },
  { de: 'Er ist von einer Fraktion besetzt, die sich gut benimmt.', en: 'A faction has occupied it, and is behaving well.', themen: ['krieg'] },
  { de: 'Er hat mehr Wachen als Bewohner.', en: 'It has more guards than residents.' },
  { de: 'Er ist bis zum Frühjahr abgeschnitten.', en: 'It is cut off until spring.', regionen: ['berge', 'eis'] },
  { de: 'Er ist aufgegeben worden, aber jemand hält ihn instand.', en: 'It was abandoned, and somebody is keeping it up.', tonfall: ['geheimnisvoll'] },
  { de: 'Er wird gerade durchsucht, gründlich und ohne Erklärung.', en: 'It is being searched, thoroughly and without explanation.' },
  { de: 'Er gehört jetzt der Gemeinschaft, und die ist zerstritten.', en: 'It belongs to the commons now, and the commons are at odds.', themen: ['aufstieg'] },
  { de: 'Er wurde umbenannt, und die Alten benutzen den alten Namen weiter.', en: 'It was renamed, and the old folk still use the old name.' },
  { de: 'Er wird über den Winter geschlossen, dieses Jahr zum ersten Mal.', en: 'It closes over winter, this year for the first time.' },
  { de: 'Er ist voll bezahlter Arbeit und leer an Leuten, die sie tun.', en: 'It is full of paid work and empty of people to do it.' },
  { de: 'Er ist Zufluchtsort geworden, ohne dass jemand das beschlossen hat.', en: 'It has become a refuge without anyone deciding so.' },
  { de: 'Er steht seit dem Unglück unverändert da.', en: 'It has stood untouched since the accident.', themen: ['schuld'] },
  { de: 'Er wird besteuert, als wäre er dreimal so groß.', en: 'It is taxed as though it were three times the size.', themen: ['gier'] },
  { de: 'Er hat gerade zum ersten Mal seit Jahren Überschuss.', en: 'It has a surplus, for the first time in years.', tonfall: ['heiter'] },
  { de: 'Er wird von zwei Seiten beliefert, die einander nicht ausstehen können.', en: 'It is supplied by two parties who cannot stand each other.' }
];

/**
 * Was auf einer Karte davon stehen wuerde.
 *
 * Bewusst kein Bild. Der Karteneditor macht Karten; dieses Werkzeug liefert
 * den Satz, den man beim Zeichnen daneben legt. (Siehe
 * docs/inspirationshilfe.md, Abschnitt „Und der Karteneditor?")
 */
export const ORT_KARTE: readonly Paar[] = [
  { de: 'Drei Zugänge, einer davon verschüttet.', en: 'Three ways in, one of them collapsed.' },
  { de: 'Wasser auf zwei Seiten, Mauer auf der dritten.', en: 'Water on two sides, a wall on the third.' },
  { de: 'Ein Turm im Nordosten, höher als alles andere.', en: 'A tower to the north-east, taller than anything else.' },
  { de: 'Alles auf einer Ebene, außer dem Keller, der es nicht ist.', en: 'All on one level, except the cellar, which is not.' },
  { de: 'Zwei Höfe, verbunden durch einen einzigen Durchgang.', en: 'Two yards joined by a single passage.' },
  { de: 'Die Hauptstraße teilt den Ort ungleich.', en: 'The main street splits the place unevenly.' },
  { de: 'Ein Graben, trocken, aber tiefer als er aussieht.', en: 'A ditch, dry, and deeper than it looks.' },
  { de: 'Eine Treppe, die alles verbindet — und ein Engpass ist.', en: 'One stair connects everything, and is a bottleneck.' },
  { de: 'Vier Gebäude im Karree, die Mitte offen.', en: 'Four buildings in a square, the middle open.' },
  { de: 'Die Rückseite geht in den Fels über, ohne Übergang.', en: 'The back merges into the rock with no seam.' },
  { de: 'Hohe Galerien ringsum, unten steht man im Blickfeld.', en: 'High galleries all round; below you stand in plain sight.' },
  { de: 'Ein Dach, über das man den halben Ort erreicht.', en: 'One roof gets you across half the place.' },
  { de: 'Ein breiter Raum und sieben schmale.', en: 'One wide room and seven narrow ones.' },
  { de: 'Ein Brunnen genau in der Mitte, weithin sichtbar.', en: 'A well dead centre, visible from everywhere.' },
  { de: 'Zwei Etagen, die Obere ist nur von außen erreichbar.', en: 'Two floors; the upper one is reachable only from outside.' },
  { de: 'Der Boden fällt nach hinten ab, merklich.', en: 'The floor slopes noticeably towards the back.' },
  { de: 'Ein Nebeneingang, den nur Lieferanten kennen.', en: 'A side entrance known only to deliveries.' },
  { de: 'Halb im Wasser, halb an Land, bei Flut anders als bei Ebbe.', en: 'Half in the water, half ashore, different at each tide.' },
  { de: 'Ein langer Gang, an dem alles hängt.', en: 'One long corridor everything hangs off.' },
  { de: 'Schmale Gassen, kein Platz für zwei nebeneinander.', en: 'Narrow lanes, no room for two abreast.' },
  { de: 'Ein freies Feld davor, ohne Deckung, sechzig Schritt.', en: 'An open field in front, no cover, sixty paces.' },
  { de: 'Von oben einsehbar, von unten nicht.', en: 'Overlooked from above, blind from below.' },
  { de: 'Stützpfeiler im Weg, überall.', en: 'Support pillars in the way, everywhere.' },
  { de: 'Ein Raum ohne Tür, nur mit Luke.', en: 'One room with no door, only a hatch.' },
  { de: 'Rauch steht immer in der Luft und nimmt Sicht.', en: 'Smoke hangs in the air and cuts sight lines.' },
  { de: 'Drei Ebenen über Leitern verbunden.', en: 'Three levels joined by ladders.' },
  { de: 'Eine Mauer, die mitten durch ein Gebäude läuft.', en: 'A wall running straight through a building.' },
  { de: 'Der einzige Weg hinein ist auch der einzige Weg hinaus.', en: 'The only way in is also the only way out.' },
  { de: 'Ein Platz, groß genug für vierhundert Leute.', en: 'A square big enough for four hundred people.' },
  { de: 'Viel Gerümpel, wenig Sicht, gute Deckung.', en: 'Plenty of clutter, poor sight, good cover.' }
];

/**
 * Was in der Szene steht.
 *
 * Der Unterschied zu `ORT_MERKMAL` und `ORT_ZUSTAND` ist der Zweck. Jene
 * beiden sagen, wie es um einen Ort bestellt ist — „es riecht durchgehend
 * nach etwas, das hier nicht verarbeitet wird", „er ist verpfaendet". Das
 * gehoert in eine Notiz und ist beim Kartenzeichnen wertlos: man kann einen
 * Geruch nicht einzeichnen.
 *
 * Hier steht deshalb nur, was man HINSTELLEN kann. Jeder Eintrag ist ein
 * Gegenstand oder ein Stueck Geleande mit Groesse, Lage oder Zustand dabei,
 * damit klar ist, wie viel Platz er braucht und was er blockiert. Drei davon
 * gehen als Pins auf eine neue Karte, und drei Dinge sind genug, um eine
 * leere Flaeche in eine Szene zu verwandeln.
 *
 * Die Regionen sind Vorlieben, keine Vorschriften — dieselbe Mechanik wie
 * bei den anderen Tabellen: ohne Zuschnitt zaehlen alle Eintraege.
 */
export const ORT_AUSSTATTUNG: readonly Eintrag[] = [
  /* Ueberall brauchbar */
  { de: 'ein Brunnen mit Winde, zwei Schritt weit, der Rand geborsten', en: 'a well with a windlass, two paces across, its rim broken' },
  { de: 'ein Karren ohne Rad, quer im Durchgang', en: 'a cart missing a wheel, across the passage' },
  { de: 'Fässer, brusthoch gestapelt, zwei Reihen tief', en: 'barrels stacked chest-high, two rows deep' },
  { de: 'eine Feuerstelle, drei Schritt breit, kalter Rost und frische Asche', en: 'a fire pit three paces wide, cold grate and fresh ash' },
  { de: 'eine Treppe ohne Geländer, acht Stufen', en: 'a stair with no rail, eight steps' },
  { de: 'ein Tisch, lang genug für zwölf Leute, festgeschraubt', en: 'a table long enough for twelve, bolted down' },
  { de: 'Kisten in zwei Haufen, einer davon aufgebrochen', en: 'crates in two heaps, one of them broken open' },
  { de: 'ein Zaun aus ungleichen Latten, an drei Stellen durchbrochen', en: 'a fence of mismatched slats, broken through in three places' },
  { de: 'eine Grube, mannstief, mit einer Bohle darüber', en: 'a pit, man-deep, with a plank across it' },
  { de: 'ein Stapel Bauholz, hüfthoch, gute Deckung', en: 'a stack of timber, hip-high, decent cover' },
  { de: 'zwei Wagen, hintereinander abgestellt, die Deichseln verkeilt', en: 'two wagons parked nose to tail, shafts jammed together' },
  { de: 'ein Tor, breit genug für einen Wagen, eine Hälfte ausgehängt', en: 'a gate wide enough for a wagon, one leaf off its hinges' },
  { de: 'ein Schuppen ohne Vorderwand, drei Schritt tief', en: 'a shed with no front wall, three paces deep' },
  { de: 'Seile und Flaschenzüge an einem Ausleger über der Tür', en: 'ropes and pulleys on a jib above the door' },
  { de: 'ein Trog, vier Schritt lang, halb voll Wasser', en: 'a trough, four paces long, half full of water' },
  { de: 'eine Mauer, brusthoch, mit Lücken zum Durchsehen', en: 'a wall, chest-high, with gaps to see through' },
  { de: 'ein Altar, hüfthoch, Kerzen frisch abgebrannt', en: 'an altar, hip-high, candles freshly burned down' },
  { de: 'eine Leiter mit zwölf Sprossen, hoch zu einer Luke im Dach', en: 'a ladder of twelve rungs up to a hatch in the roof' },
  { de: 'ein Haufen Schutt, kniehoch, schlecht zu begehen', en: 'a heap of rubble, knee-high, hard to cross' },
  { de: 'ein Käfig oder Verschlag, groß genug für einen Menschen', en: 'a cage or pen, big enough to hold a person' },
  { de: 'eine Rinne, handbreit, quer durch den ganzen Raum', en: 'a channel, a hand wide, running the width of the room' },
  { de: 'ein Regal, kopfhoch, an der Wand, halb leergeräumt', en: 'shelving, head-high, along the wall, half cleared out' },
  { de: 'ein umgestürzter Baum, acht Schritt lang, als Sitzbank benutzt', en: 'a fallen tree, eight paces long, used as a bench' },
  { de: 'Pfähle in unregelmäßigen Abständen, mannshoch', en: 'posts at uneven spacing, man-high' },
  { de: 'ein Schlagbaum, vier Schritt lang, oben festgebunden', en: 'a barrier pole, four paces long, tied up in the raised position' },

  /* Stadt und Hafen */
  { de: 'ein Marktstand mit Plane, die Hälfte der Ware noch darunter', en: 'a market stall under canvas, half the goods still beneath it', regionen: ['stadt', 'hafen'] },
  { de: 'eine offene Rinne, einen Schritt breit, mitten durch die Straße', en: 'an open gutter, a pace wide, down the middle of the street', regionen: ['stadt', 'hafen'] },
  { de: 'ein Anschlagbrett, mannshoch, dick mit Papier beklebt', en: 'a notice board, man-high, thick with pasted paper', regionen: ['stadt', 'hafen'] },
  { de: 'ein Poller, hüfthoch, mit einem Tau dick wie ein Arm', en: 'a bollard, hip-high, with a hawser as thick as an arm', regionen: ['stadt', 'hafen'] },
  { de: 'ein Landungssteg, zwanzig Schritt weit ins Wasser', en: 'a landing pier twenty paces into the water', regionen: ['stadt', 'hafen'] },
  { de: 'ein Holzkran, drei Mann hoch, das Rad noch begehbar', en: 'a wooden crane, three men high, its treadwheel still walkable', regionen: ['stadt', 'hafen'] },
  { de: 'Netze zum Trocknen aufgespannt, kopfhoch', en: 'nets hung out to dry at head height', regionen: ['stadt', 'hafen'] },
  { de: 'ein Ruderboot, vier Schritt lang, kieloben an Land gezogen', en: 'a rowing boat, four paces long, hauled ashore keel up', regionen: ['stadt', 'hafen'] },

  /* Wald, Berge, Steppe */
  { de: 'ein Hochsitz auf vier Beinen, Leiter abgenommen', en: 'a hunting stand on four legs, its ladder removed', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'ein Kohlenmeiler, noch warm, mannshoch', en: 'a charcoal mound, still warm, man-high', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'ein Bachlauf, drei Schritt breit, mit einem Steg', en: 'a stream three paces wide with a footbridge', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'Felsblöcke, drei Stück, größer als ein Wagen', en: 'boulders, three of them, bigger than a wagon', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'eine Geröllhalde, zwanzig Schritt breit, die bei Belastung rutscht', en: 'a scree slope twenty paces wide that slides when weighted', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'ein Seil über eine Schlucht, mit Holzgriffen', en: 'a rope across a gorge with wooden grips', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'ein Steinhaufen als Wegmarke, schulterhoch', en: 'a cairn as a waymark, shoulder-high', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'ein Pferch aus Flechtwerk, für zwanzig Tiere', en: 'a wattle pen for twenty animals', regionen: ['wald', 'berge', 'steppe'] },
  { de: 'ein Filzzelt, mannshoch, Rauchloch offen', en: 'a felt tent, man-high, smoke hole open', regionen: ['wald', 'berge', 'steppe'] },

  /* Sumpf, See, Eis */
  { de: 'Bohlenwege über nassen Grund, an zwei Stellen fehlend', en: 'plank walkways over wet ground, missing in two places', regionen: ['sumpf', 'see', 'eis'] },
  { de: 'ein Kahn, drei Schritt lang, angebunden, ohne Stange', en: 'a punt, three paces long, tied up, with no pole', regionen: ['sumpf', 'see', 'eis'] },
  { de: 'Schilfgürtel, kopfhoch, undurchsichtig', en: 'a belt of reeds, head-high, opaque', regionen: ['sumpf', 'see', 'eis'] },
  { de: 'eine Eisfläche, dreißig Schritt weit, dunkel in der Mitte', en: 'a sheet of ice thirty paces across, dark at its centre', regionen: ['sumpf', 'see', 'eis'] },
  { de: 'Eiszapfen an einem Vordach, armlang', en: 'icicles along an eave, an arm in length', regionen: ['sumpf', 'see', 'eis'] },
  { de: 'ein Schneewall, brusthoch, von Hand aufgeworfen', en: 'a snow bank, chest-high, thrown up by hand', regionen: ['sumpf', 'see', 'eis'] },

  /* Unterreich und Vulkan */
  { de: 'Tropfsteine, dicht wie ein Wald, mannshoch', en: 'dripstones as dense as a wood, man-high', regionen: ['unterreich', 'vulkan', 'berge'] },
  { de: 'ein Schacht im Boden, zwei Schritt weit, mit morschen Brettern abgedeckt', en: 'a shaft in the floor two paces across, covered with rotten boards', regionen: ['unterreich', 'vulkan', 'berge'] },
  { de: 'eine Loren-Spur, zwei Wagen darauf stehengeblieben', en: 'a mine-cart track with two carts left standing on it', regionen: ['unterreich', 'vulkan', 'berge'] },
  { de: 'Stützbalken alle vier Schritt, einer geborsten', en: 'support beams every four paces, one of them split', regionen: ['unterreich', 'vulkan', 'berge'] },
  { de: 'ein Wasserbecken, knietief, klar und kalt', en: 'a pool, knee-deep, clear and cold', regionen: ['unterreich', 'vulkan', 'berge'] },
  { de: 'eine Spalte, aus der Dampf steht, zwei Schritt breit', en: 'a fissure venting steam, two paces across', regionen: ['unterreich', 'vulkan', 'berge'] },
  { de: 'erkaltete Lava in Wülsten, kniehoch, schlecht zu begehen', en: 'cooled lava in ridges, knee-high, bad footing', regionen: ['unterreich', 'vulkan', 'berge'] },

  /* Wueste und Oedland */
  { de: 'eine Zisterne, drei Schritt weit, Steindeckel halb verweht', en: 'a cistern three paces across, its stone lid half buried in sand', regionen: ['wueste', 'oedland'] },
  { de: 'Mauerreste, kniehoch, im Karree', en: 'the remains of walls, knee-high, in a square', regionen: ['wueste', 'oedland'] },
  { de: 'ein Wrack, so groß, dass man darin steht', en: 'a wreck large enough to stand inside', regionen: ['wueste', 'oedland'] },
  { de: 'Pfahlreihen eines alten Lagers, die meisten umgekippt', en: 'the post rows of an old camp, most of them toppled', regionen: ['wueste', 'oedland'] },
  { de: 'ein Brunnenschacht ohne Seil, tiefer als der Blick reicht', en: 'a well shaft with no rope, deeper than the eye follows', regionen: ['wueste', 'oedland'] }
];
