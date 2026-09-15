/**
 * Fraktionen.
 *
 * Der wichtigste Baustein: zwei Gruppen mit Zielen, die einander im Weg
 * stehen, erzeugen Handlung von selbst. Niemand muss dafuer eine Geschichte
 * schreiben.
 *
 * Alle Texte sind Satzteile ohne Fuerwort („Den Salzhandel kontrollieren."),
 * keine ganzen Saetze ueber „sie". Das ist eine Sprachfrage: „Der Zirkel …
 * sie wollen" geht im Deutschen schief, und jede Loesung ueber Geschlechter
 * haette die Tabelle halbiert.
 */
import type { Eintrag, Paar } from './tabellen';

/** Der vordere Teil des Namens, mit Artikel. */
export const FRAKTION_FORM: readonly Paar[] = [
  { de: 'Der Zirkel', en: 'The Circle' },
  { de: 'Die Bruderschaft', en: 'The Brotherhood' },
  { de: 'Der Bund', en: 'The League' },
  { de: 'Das Kontor', en: 'The Counting House' },
  { de: 'Die Gesellschaft', en: 'The Company' },
  { de: 'Die Werkstatt', en: 'The Workshop' },
  { de: 'Der Orden', en: 'The Order' },
  { de: 'Die Zunft', en: 'The Guild' },
  { de: 'Der Rat', en: 'The Council' },
  { de: 'Die Wacht', en: 'The Watch' },
  { de: 'Das Haus', en: 'The House' },
  { de: 'Die Kammer', en: 'The Chamber' },
  { de: 'Die Schwesternschaft', en: 'The Sisterhood' },
  { de: 'Die Kompanie', en: 'The Free Company' },
  { de: 'Der Kreis', en: 'The Ring' },
  { de: 'Die Zeche', en: 'The Pit Crew' },
  { de: 'Die Hand', en: 'The Hand' },
  { de: 'Die Gilde', en: 'The Union' },
  { de: 'Das Kollegium', en: 'The College' },
  { de: 'Die Truppe', en: 'The Troupe' }
];

/**
 * Der hintere Teil, als fertige Fuegung.
 *
 * Fertig und nicht zusammengesetzt, weil im Deutschen sonst Fall und
 * Geschlecht zusammenpassen muessten — „der Bund der Stillen Hand" gegen
 * „der Bund vom Grauen Turm". Als Ganzes eingetragen, stimmt es immer.
 */
export const FRAKTION_ZUSATZ: readonly Paar[] = [
  { de: 'der Sieben Siegel', en: 'of the Seven Seals' },
  { de: 'vom Grauen Turm', en: 'of the Grey Tower' },
  { de: 'der Stillen Hand', en: 'of the Quiet Hand' },
  { de: 'der Zweiten Ernte', en: 'of the Second Harvest' },
  { de: 'zum Roten Anker', en: 'at the Red Anchor' },
  { de: 'der Langen Schulden', en: 'of the Long Debts' },
  { de: 'vom Offenen Tor', en: 'of the Open Gate' },
  { de: 'der Drei Brunnen', en: 'of the Three Wells' },
  { de: 'vom Letzten Licht', en: 'of the Last Light' },
  { de: 'der Weißen Asche', en: 'of the White Ash' },
  { de: 'zum Krummen Nagel', en: 'at the Crooked Nail' },
  { de: 'der Alten Maße', en: 'of the Old Measures' },
  { de: 'vom Tiefen Schacht', en: 'of the Deep Shaft' },
  { de: 'der Gebrochenen Kette', en: 'of the Broken Chain' },
  { de: 'der Zwölf Namen', en: 'of the Twelve Names' },
  { de: 'vom Nördlichen Weg', en: 'of the Northern Road' },
  { de: 'der Leeren Kasse', en: 'of the Empty Coffer' },
  { de: 'zum Grünen Fenster', en: 'at the Green Window' },
  { de: 'der Salzigen Bücher', en: 'of the Salted Ledgers' },
  { de: 'vom Kalten Herd', en: 'of the Cold Hearth' },
  { de: 'der Vierten Nacht', en: 'of the Fourth Night' },
  { de: 'des Langen Winters', en: 'of the Long Winter' },
  { de: 'der Verbrannten Verträge', en: 'of the Burnt Contracts' },
  { de: 'vom Doppelten Boden', en: 'of the False Bottom' },
  { de: 'der Zwei Wahrheiten', en: 'of Two Truths' },
  { de: 'zum Stummen Zeugen', en: 'at the Silent Witness' },
  { de: 'der Ungezählten', en: 'of the Uncounted' },
  { de: 'vom Ersten Frost', en: 'of the First Frost' },
  { de: 'der Geliehenen Zeit', en: 'of Borrowed Time' },
  { de: 'der Schmalen Tür', en: 'of the Narrow Door' }
];

/** Was für eine Art Gruppe das ist. */
export const FRAKTION_ART: readonly Eintrag[] = [
  { de: 'eine Zunft, die längst mehr Geld verleiht als Waren herstellt', en: 'a guild that lends more money than it makes goods', regionen: ['stadt', 'hafen'] },
  { de: 'eine Familie mit zu vielen Söhnen und zu wenig Land', en: 'a family with too many sons and too little land' },
  { de: 'ein Orden, der seine eigene Lehre gerade neu auslegt', en: 'an order currently reinterpreting its own doctrine', themen: ['glaube'] },
  { de: 'eine Söldnerkompanie zwischen zwei Verträgen', en: 'a mercenary company between contracts', themen: ['krieg'] },
  { de: 'ein Schmugglerring, der sich für einen Wohltätigkeitsverein hält', en: 'a smuggling ring that thinks of itself as a charity', regionen: ['hafen', 'see'] },
  { de: 'eine Bergbaugenossenschaft mit einem gemeinsamen Geheimnis', en: 'a mining cooperative with a shared secret', regionen: ['berge', 'unterreich'] },
  { de: 'der Stadtrat, aber nur die Hälfte davon', en: 'the city council, or rather half of it', regionen: ['stadt'], themen: ['aufstieg'] },
  { de: 'eine Gelehrtenschule, die nach außen streng und innen zerstritten ist', en: 'a school of scholars, strict outside and at odds within', themen: ['wissen'] },
  { de: 'ein Netz von Wirten und Fuhrleuten entlang einer Straße', en: 'a web of innkeepers and carters along one road', regionen: ['steppe'] },
  { de: 'eine Sippe, die das Land lange vor allen anderen bewohnt hat', en: 'a clan that lived here long before anyone else', themen: ['wildnis', 'erbe'] },
  { de: 'eine Heilergemeinschaft, die auch die Falschen behandelt', en: 'a healers’ house that treats the wrong people too', themen: ['seuche'] },
  { de: 'eine Bande Jugendlicher, die für jemand anderen arbeitet', en: 'a gang of youngsters working for someone else', regionen: ['stadt'] },
  { de: 'eine Kaufmannsgesellschaft mit eigener kleiner Flotte', en: 'a merchant company with a small fleet of its own', regionen: ['hafen', 'see'], themen: ['gier'] },
  { de: 'ein Hofstaat ohne Hof, seit die Burg gefallen ist', en: 'a court without a seat, since the castle fell', themen: ['krieg', 'erbe'] },
  { de: 'eine Bruderschaft von Handwerkern, die den Preis halten', en: 'a brotherhood of craftsmen holding the price line', regionen: ['stadt'] },
  { de: 'ein Kult, der sich noch nicht für einen hält', en: 'a cult that does not yet think of itself as one', themen: ['glaube'] },
  { de: 'eine Karawanengesellschaft, die vier Sprachen spricht', en: 'a caravan company speaking four languages', regionen: ['wueste', 'steppe'] },
  { de: 'die Nachkommen derer, die man damals vertrieben hat', en: 'the descendants of the people driven out back then', themen: ['rache', 'erbe'] },
  { de: 'eine Garnison, die seit zwei Jahren keinen Sold gesehen hat', en: 'a garrison two years without pay', themen: ['krieg'] },
  { de: 'ein Gericht, das seine Urteile nicht mehr vollstrecken kann', en: 'a court that can no longer enforce its judgments', regionen: ['stadt'], themen: ['aufstieg'] },
  { de: 'eine Gruppe Geflüchteter mit Geld und ohne Papiere', en: 'a group of refugees with money and no papers', themen: ['krieg'] },
  { de: 'eine Fischereigemeinschaft, die auch bergen darf, was sinkt', en: 'a fishing commune with the right to salvage what sinks', regionen: ['hafen', 'see'] },
  { de: 'ein Netz von Boten, das nebenbei alles weiß', en: 'a courier network that knows everything on the side', themen: ['wissen'] },
  { de: 'eine Bank in allem außer dem Namen', en: 'a bank in all but name', regionen: ['stadt'], themen: ['gier'] },
  { de: 'die Bewohner einer einzigen, sehr großen Straße', en: 'the residents of a single, very long street', regionen: ['stadt'] },
  { de: 'ein Rat der Alten, dessen Beschlüsse niemand mehr befolgt', en: 'a council of elders whose rulings nobody follows', themen: ['erbe'] },
  { de: 'eine Jägerschaft, die auch Grenzen bewacht', en: 'a body of hunters who also watch the border', regionen: ['wald', 'berge'] },
  { de: 'eine Theatertruppe, die überall willkommen und nirgends beliebt ist', en: 'a troupe welcome everywhere and liked nowhere', tonfall: ['heiter'] },
  { de: 'ein Konsortium, das den Wiederaufbau bezahlt und dafür Bedingungen stellt', en: 'a consortium funding the rebuilding, with conditions', themen: ['gier', 'aufstieg'] },
  { de: 'ein Haufen ehemaliger Gefangener mit demselben Brandzeichen', en: 'a crowd of former prisoners sharing one brand mark', themen: ['rache', 'erloesung'] }
];

/** Was sie erreichen wollen. Ohne Fuerwort, als Vorhaben. */
export const FRAKTION_ZIEL: readonly Eintrag[] = [
  { de: 'Den Salzhandel der Küste kontrollieren.', en: 'Control the coastal salt trade.', regionen: ['hafen', 'see'], themen: ['gier'] },
  { de: 'Die alten Grenzen wiederherstellen, notfalls Stein für Stein.', en: 'Restore the old borders, stone by stone if need be.', themen: ['erbe', 'krieg'] },
  { de: 'Den eigenen Namen wieder in die Ratsliste bringen.', en: 'Get the family name back onto the council roll.', themen: ['aufstieg'] },
  { de: 'Beweisen, dass das Urteil von damals falsch war.', en: 'Prove the old verdict was wrong.', themen: ['schuld', 'erloesung'] },
  { de: 'Eine zweite Straße bauen, an der Zollstelle vorbei.', en: 'Build a second road, past the toll station.', themen: ['gier'] },
  { de: 'Das Wissen sichern, bevor es jemand vernichtet.', en: 'Secure the knowledge before somebody destroys it.', themen: ['wissen'] },
  { de: 'Den Winter überstehen, ohne jemanden zurückzulassen.', en: 'Get through the winter without leaving anyone behind.', regionen: ['eis', 'berge'] },
  { de: 'Die Kranken versorgen, auch die auf der falschen Seite.', en: 'Treat the sick, including those on the wrong side.', themen: ['seuche'] },
  { de: 'Den Schuldigen finden, bevor es jemand anderes tut.', en: 'Find the guilty party before anyone else does.', themen: ['rache'] },
  { de: 'Unabhängig werden von der Stadt, die alles abschöpft.', en: 'Break free of the city that skims everything.', themen: ['aufstieg'] },
  { de: 'Ein Bündnis schmieden, das seit drei Generationen scheitert.', en: 'Forge an alliance that has failed for three generations.', themen: ['krieg'] },
  { de: 'Den Ort räumen lassen, bevor der Berg nachgibt.', en: 'Get the place evacuated before the mountain gives way.', regionen: ['berge', 'unterreich'] },
  { de: 'Die Preise halten, koste es, was es wolle.', en: 'Hold prices, whatever it costs.', themen: ['gier'], regionen: ['stadt'] },
  { de: 'Jemanden aus der Haft holen, legal oder anders.', en: 'Get somebody out of custody, legally or otherwise.' },
  { de: 'Das Heiligtum zurückbekommen, das seit dem Krieg fremd verwaltet wird.', en: 'Recover the shrine that has been in foreign hands since the war.', themen: ['glaube'] },
  { de: 'Beweisen, dass es den Ort auf der Karte wirklich gibt.', en: 'Prove that the place on the map is real.', themen: ['wissen'] },
  { de: 'Den Erben finden, bevor die Frist abläuft.', en: 'Find the heir before the deadline passes.', themen: ['erbe'] },
  { de: 'Alle Schuldscheine aufkaufen und auf einmal fällig stellen.', en: 'Buy up every note of debt and call them all in at once.', themen: ['gier', 'rache'] },
  { de: 'Den eigenen Leuten endlich Sold zahlen.', en: 'Finally pay their own people.', themen: ['krieg'] },
  { de: 'Den Fluss zurück in sein altes Bett zwingen.', en: 'Force the river back into its old bed.', regionen: ['sumpf', 'see'] },
  { de: 'Eine zweite Quelle finden, bevor die erste versiegt.', en: 'Find a second spring before the first runs dry.', regionen: ['wueste', 'steppe'] },
  { de: 'Die Wahrheit öffentlich machen, ohne selbst dabei unterzugehen.', en: 'Make the truth public without going down with it.', themen: ['verrat'] },
  { de: 'Den Handelsweg unter den Berg verlegen.', en: 'Move the trade route under the mountain.', regionen: ['unterreich', 'berge'] },
  { de: 'Eine Ausnahme vom Gesetz erwirken, dauerhaft.', en: 'Win a permanent exemption from the law.', regionen: ['stadt'], themen: ['aufstieg'] },
  { de: 'Die eigenen Toten zurückholen und ordentlich bestatten.', en: 'Bring their own dead home and bury them properly.', themen: ['erloesung', 'krieg'] },
  { de: 'Jede Kopie eines bestimmten Buches einsammeln.', en: 'Collect every copy of a certain book.', themen: ['wissen', 'glaube'] },
  { de: 'Dafür sorgen, dass der Ort so bleibt, wie er ist.', en: 'Keep the place exactly as it is.', themen: ['wildnis'] },
  { de: 'Einen Krieg anfangen, der nach außen wie Notwehr aussieht.', en: 'Start a war that will look like self-defence.', themen: ['krieg', 'verrat'] },
  { de: 'Unentbehrlich werden und dann verhandeln.', en: 'Become indispensable and then negotiate.', themen: ['aufstieg'] },
  { de: 'Jemanden vergessen machen — Name, Taten, Grab.', en: 'Have someone forgotten: name, deeds and grave.', themen: ['rache'], tonfall: ['duester'] }
];

/** Womit sie es versuchen. */
export const FRAKTION_MITTEL: readonly Paar[] = [
  { de: 'Geduldige Bestechung, in kleinen Beträgen über Jahre.', en: 'Patient bribery, small sums over years.' },
  { de: 'Öffentliche Wohltätigkeit, gut sichtbar.', en: 'Public charity, well displayed.' },
  { de: 'Zwei, drei Leute an genau den richtigen Stellen.', en: 'Two or three people in exactly the right posts.' },
  { de: 'Gewalt, aber nur wenn niemand zusieht.', en: 'Violence, but only when nobody is watching.' },
  { de: 'Papierkrieg: Anträge, Fristen, Einsprüche.', en: 'Paperwork: petitions, deadlines, objections.' },
  { de: 'Gerüchte, sauber gestreut und nie selbst erzählt.', en: 'Rumours, cleanly sown and never told firsthand.' },
  { de: 'Heiraten, die auf dem Papier nichts kosten.', en: 'Marriages that cost nothing on paper.' },
  { de: 'Warenknappheit, künstlich erzeugt.', en: 'Shortages, manufactured.' },
  { de: 'Ein eigener Bote, schneller als alle anderen.', en: 'Their own courier, faster than anyone else’s.' },
  { de: 'Schulden, die man lieber abarbeitet als zurückzahlt.', en: 'Debts people would rather work off than repay.' },
  { de: 'Fromme Reden, hinter denen eine Rechnung steht.', en: 'Pious speeches with a ledger behind them.' },
  { de: 'Kinder ausbilden, die in zehn Jahren nützlich sind.', en: 'Training children who will be useful in ten years.' },
  { de: 'Ein Archiv über jeden, der Rang hat.', en: 'A file on everyone of rank.' },
  { de: 'Streiks, sobald es teuer wird für die Gegenseite.', en: 'Strikes, timed to cost the other side most.' },
  { de: 'Alte Verträge, die niemand mehr gelesen hat.', en: 'Old contracts nobody has read in years.' },
  { de: 'Geschenke, die sich nicht ablehnen lassen.', en: 'Gifts that cannot be refused.' },
  { de: 'Söldner, angeworben über einen Mittelsmann.', en: 'Mercenaries hired through a middleman.' },
  { de: 'Eine Bank im Rücken, die nicht genannt wird.', en: 'A bank behind them that is never named.' },
  { de: 'Das Recht, streng ausgelegt, gegen alle.', en: 'The law, strictly applied, against everybody.' },
  { de: 'Gastfreundschaft, aus der man schwer wieder herauskommt.', en: 'Hospitality that is hard to leave.' },
  { de: 'Feuer, immer an der richtigen Stelle.', en: 'Fires, always in the right place.' },
  { de: 'Dolmetscher, die ein wenig danebenübersetzen.', en: 'Interpreters who translate slightly askew.' },
  { de: 'Kredit an alle, die sonst keinen bekommen.', en: 'Credit to everyone nobody else will lend to.' },
  { de: 'Sperrung des einzigen Weges, angeblich wegen Reparatur.', en: 'Closing the only road, allegedly for repairs.' },
  { de: 'Eine Zeitung, die keiner Partei gehört — angeblich.', en: 'A newssheet belonging to no party, allegedly.' },
  { de: 'Geiseln, die als Gäste bezeichnet werden.', en: 'Hostages referred to as guests.' },
  { de: 'Ein Schwur, den man nicht kündigen kann.', en: 'An oath that cannot be renounced.' },
  { de: 'Preise, die kurzfristig jede Konkurrenz erdrücken.', en: 'Prices that crush every competitor for a season.' }
];

/** Woran es hakt. Ohne das waere jede Fraktion unbesiegbar. */
export const FRAKTION_SCHWAECHE: readonly Paar[] = [
  { de: 'Die Führung ist alt und hat keine Nachfolge geregelt.', en: 'The leadership is old and has named no successor.' },
  { de: 'Zwei Flügel, die sich seit dem Winter nicht mehr abstimmen.', en: 'Two wings that have stopped coordinating since winter.' },
  { de: 'Das Geld kommt von außen und kann jederzeit ausbleiben.', en: 'The money comes from outside and could stop any day.' },
  { de: 'Ein einziger Mensch hält alles zusammen — und ist krank.', en: 'One single person holds it together, and is ill.' },
  { de: 'Die Vorräte reichen bis zum Frühjahr, nicht darüber hinaus.', en: 'Supplies last until spring and no further.' },
  { de: 'Es gibt eine Liste mit Namen, und sie ist nicht sicher verwahrt.', en: 'There is a list of names, and it is poorly kept.' },
  { de: 'Der eigene Nachwuchs glaubt nicht mehr an die Sache.', en: 'Their own young no longer believe in the cause.' },
  { de: 'Ein früheres Verbrechen, das nie verjährt.', en: 'An old crime that never expires.' },
  { de: 'Alle Botschaften laufen über einen einzigen Mittelsmann.', en: 'Every message runs through one middleman.' },
  { de: 'Sie brauchen die Gegenseite mehr, als sie zugeben.', en: 'They need the other side more than they admit.' },
  { de: 'Die Vorräte lagern an einem Ort, den jeder kennt.', en: 'The stores sit in one place everybody knows.' },
  { de: 'Ein Schwur verbietet ihnen genau das, was jetzt nötig wäre.', en: 'An oath forbids precisely what is needed now.' },
  { de: 'Die eigenen Leute wissen nicht, wofür sie eigentlich arbeiten.', en: 'Their own people do not know what they are working for.' },
  { de: 'Ein Mitglied redet zu viel, und alle wissen wer.', en: 'One member talks too much, and everyone knows which.' },
  { de: 'Ihr Ruf ist besser als ihre Lage.', en: 'Their reputation is better than their position.' },
  { de: 'Sie haben einen Feind, der geduldiger ist als sie.', en: 'They have an enemy more patient than they are.' },
  { de: 'Ihre Stärke hängt an einer einzigen Lieferung im Monat.', en: 'Their strength hangs on one delivery a month.' },
  { de: 'Die eigenen Regeln lassen keine schnelle Entscheidung zu.', en: 'Their own rules make a quick decision impossible.' },
  { de: 'Sie haben dieselbe Schuld wie die Gegenseite, nur früher.', en: 'They carry the same guilt as the other side, only earlier.' },
  { de: 'Es gibt einen Erben, den sie nicht kennen.', en: 'There is an heir they do not know about.' },
  { de: 'Sie halten die Gruppe für unwichtig.', en: 'They consider the party unimportant.' },
  { de: 'Jede Aktion muss von drei Stellen genehmigt werden.', en: 'Every move needs sign-off from three offices.' },
  { de: 'Ihr Anführer will eigentlich aufhören.', en: 'Their leader actually wants out.' },
  { de: 'Sie sind auf einen Ort angewiesen, der bald unbewohnbar ist.', en: 'They depend on a place that will soon be uninhabitable.' },
  { de: 'Ihre Stärke ist geliehen und muss zurückgegeben werden.', en: 'Their strength is borrowed and has to be returned.' },
  { de: 'Ein Teil der Mitglieder wurde nie eingeweiht.', en: 'Part of the membership was never let in on it.' }
];
