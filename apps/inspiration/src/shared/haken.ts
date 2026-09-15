/**
 * Der Aufhaenger: drei Saetze, warum die Gruppe ueberhaupt anfaengt.
 *
 * Jeder Satz kommt aus einer eigenen Tabelle und steht fuer sich — kein
 * Lueckentext. Das ist Absicht: ein Muster mit Platzhaltern („{wer} hat
 * {was} getan") zwingt jeden Eintrag in denselben Satzbau, und nach dem
 * dritten Wurf hoert man das Muster statt der Idee. Ausserdem geht es im
 * Deutschen schief, sobald ein Fall oder ein Geschlecht nicht passt.
 *
 * Gezogen werden vier Teile: Auslöser, Betroffene, Komplikation und — nicht
 * immer — eine Frist. Das sind 50 x 44 x 48 Kombinationen allein bei den
 * ersten drei, und die Marken sorgen dafuer, dass sie zueinander passen.
 */
import type { Eintrag } from './tabellen';

/**
 * Was geschehen ist.
 *
 * Immer abgeschlossen und immer konkret. „Es liegt eine Bedrohung in der
 * Luft" ist kein Aufhaenger, sondern eine Ausrede.
 */
export const AUSLOESER: readonly Eintrag[] = [
  { de: 'In der Nacht ist das Zollhaus abgebrannt, samt aller Bücher.', en: 'The customs house burned down in the night, ledgers and all.', regionen: ['stadt', 'hafen'], themen: ['gier', 'verrat'] },
  { de: 'Ein Kind ist verschwunden, und niemand will sagen, wessen Kind.', en: 'A child has gone missing, and nobody will say whose.', themen: ['schuld', 'verrat'] },
  { de: 'Der Brunnen gibt seit sieben Tagen Salzwasser.', en: 'For seven days the well has given salt water.', themen: ['seuche', 'glaube'] },
  { de: 'Ein Schiff ist eingelaufen, das seit elf Jahren als gesunken gilt.', en: 'A ship has docked that was declared lost eleven years ago.', regionen: ['hafen', 'see'], themen: ['erbe', 'wissen'] },
  { de: 'Die Ernte steht, aber keine Hand rührt sich, sie einzubringen.', en: 'The harvest stands ripe, and not one hand moves to bring it in.', regionen: ['steppe', 'wald'], themen: ['glaube', 'seuche'] },
  { de: 'Der Statthalter hat eine Steuer erlassen, die es gar nicht gibt.', en: 'The governor has levied a tax that does not exist.', regionen: ['stadt'], themen: ['gier', 'aufstieg'] },
  { de: 'Ein Grabmal steht offen, von innen aufgestemmt.', en: 'A tomb stands open, forced from the inside.', themen: ['erbe', 'rache'] },
  { de: 'Die Nachtwache hat dreimal hintereinander dieselbe Meldung geschrieben.', en: 'The night watch has filed the same report three times running.', regionen: ['stadt'], themen: ['wissen', 'verrat'] },
  { de: 'Ein Bote ist angekommen, ohne die Botschaft, ohne die Zunge.', en: 'A messenger arrived, without the message and without a tongue.', themen: ['verrat', 'krieg'] },
  { de: 'Über Nacht ist ein Weg da, wo gestern Fels war.', en: 'Overnight a road appeared where yesterday there was rock.', regionen: ['berge', 'unterreich'], themen: ['wissen', 'wildnis'] },
  { de: 'Alle Hunde der Siedlung sind fort, in dieselbe Richtung gelaufen.', en: 'Every dog in the settlement is gone, all running the same way.', themen: ['wildnis', 'seuche'] },
  { de: 'Ein Vertrag ist aufgetaucht, den drei Häuser unterschrieben haben — zwei davon existieren nicht mehr.', en: 'A contract has surfaced, signed by three houses; two of them no longer exist.', regionen: ['stadt'], themen: ['erbe', 'verrat'] },
  { de: 'Die Flüchtenden aus dem Norden sagen alle dasselbe Wort, und keiner kennt es.', en: 'The refugees from the north all say the same word, and none of them knows it.', themen: ['krieg', 'glaube'] },
  { de: 'Ein Bergwerksstollen hat sich geschlossen, während zwölf Leute drin waren.', en: 'A mine shaft closed itself with twelve people inside.', regionen: ['berge', 'unterreich'], themen: ['gier', 'wildnis'] },
  { de: 'Das Eis vor der Küste ist über Nacht aufgebrochen, dreißig Tage zu früh.', en: 'The coastal ice broke up overnight, thirty days early.', regionen: ['eis', 'see'], themen: ['wildnis', 'glaube'] },
  { de: 'Ein Priester hat den Tempel von innen verschlossen und antwortet nicht.', en: 'A priest has barred the temple from within and will not answer.', themen: ['glaube', 'schuld'] },
  { de: 'Auf dem Markt wird eine Ware verkauft, die niemand hergestellt hat.', en: 'A good is on sale at the market that nobody made.', regionen: ['stadt', 'hafen'], themen: ['gier', 'wissen'] },
  { de: 'Die Karawane ist angekommen — vollständig, beladen, ohne einen Menschen.', en: 'The caravan arrived intact and fully laden, with nobody aboard.', regionen: ['wueste', 'steppe'], themen: ['wildnis', 'verrat'] },
  { de: 'Jemand hat über Nacht jeden Grenzstein um eine Handbreit versetzt.', en: 'Someone moved every boundary stone a hand’s width in the night.', themen: ['gier', 'erbe'] },
  { de: 'Ein Schuldschein über eine unbezahlbare Summe trägt die Unterschrift eines Gruppenmitglieds.', en: 'A promissory note for an unpayable sum bears a party member’s signature.', themen: ['schuld', 'gier'] },
  { de: 'Der Fluss führt seit drei Tagen Dinge mit, die flussaufwärts niemand vermisst.', en: 'For three days the river has carried things nobody upstream is missing.', regionen: ['sumpf', 'wald'], themen: ['schuld', 'rache'] },
  { de: 'Die Glocken haben geläutet, obwohl der Turm seit einem Jahr leer steht.', en: 'The bells rang, though the tower has stood empty for a year.', themen: ['glaube', 'rache'] },
  { de: 'Eine Fraktion hat ihr Quartier geräumt, ordentlich, ohne Abschied.', en: 'A faction cleared out its quarters — tidily, without a word.', regionen: ['stadt'], themen: ['verrat', 'krieg'] },
  { de: 'Zwei Leute schwören, dieselbe Person an zwei Orten gesehen zu haben.', en: 'Two people swear they saw the same person in two places.', themen: ['wissen', 'verrat'] },
  { de: 'Die Vulkanasche liegt diesmal in einem Kreis, nicht im Wind.', en: 'This time the volcanic ash lies in a circle, not with the wind.', regionen: ['vulkan'], themen: ['glaube', 'wissen'] },
  { de: 'Ein Feld ist über Nacht abgeerntet worden, sauber, bis auf den letzten Halm.', en: 'A field was harvested overnight, clean down to the last stalk.', regionen: ['steppe'], themen: ['wildnis', 'gier'] },
  { de: 'Der Leuchtturm hat in der Sturmnacht gebrannt — an der falschen Stelle.', en: 'The lighthouse burned through the storm night, in the wrong place.', regionen: ['hafen', 'see'], themen: ['verrat', 'gier'] },
  { de: 'Ein Gefangener ist ausgebrochen, indem er die Tür von außen aufschloss.', en: 'A prisoner escaped by unlocking the door from the outside.', themen: ['verrat', 'rache'] },
  { de: 'Seit der letzten Neumondnacht altert das Vieh doppelt so schnell.', en: 'Since the last new moon the livestock has been ageing twice as fast.', themen: ['seuche', 'wildnis'] },
  { de: 'Die Brücke ist eingestürzt, an einem Tag, an dem niemand darüber wollte.', en: 'The bridge collapsed on a day nobody meant to cross it.', themen: ['schuld', 'krieg'] },
  { de: 'Eine Landkarte wird gehandelt, auf der ein Ort eingezeichnet ist, den es geben sollte.', en: 'A map is changing hands showing a place that ought to exist.', themen: ['wissen', 'gier'] },
  { de: 'Ein Haus ist über Nacht abgetragen worden, Stein für Stein, spurlos.', en: 'A house was taken apart overnight, stone by stone, without a trace.', regionen: ['stadt'], themen: ['erbe', 'verrat'] },
  { de: 'Der letzte Zeuge eines alten Prozesses ist zurückgekommen.', en: 'The last witness of an old trial has come back.', themen: ['schuld', 'rache'] },
  { de: 'Aus dem Moor ist ein Wagen aufgetaucht, mit Ladung von übermorgen.', en: 'A wagon has risen from the bog, carrying goods from the day after tomorrow.', regionen: ['sumpf'], themen: ['wissen', 'erbe'] },
  { de: 'Ein Bündnis, das seit vierzig Jahren hält, ist gestern gekündigt worden.', en: 'An alliance forty years old was cancelled yesterday.', regionen: ['stadt'], themen: ['krieg', 'verrat'] },
  { de: 'Die Trinkwasserquelle schmeckt nach Eisen, und die Kranken werden mehr.', en: 'The drinking spring tastes of iron, and the sick are multiplying.', themen: ['seuche'] },
  { de: 'Ein Wanderzirkus hat eine Vorstellung gegeben, an die sich niemand erinnert.', en: 'A travelling show gave a performance nobody can remember.', themen: ['wissen', 'glaube'], tonfall: ['geheimnisvoll', 'heiter'] },
  { de: 'Auf dem Schlachtfeld von damals wächst nichts mehr — und gestern kam etwas heraus.', en: 'Nothing grows on the old battlefield, and yesterday something came out of it.', regionen: ['oedland'], themen: ['krieg', 'rache'] },
  { de: 'Die Zunft hat einen Meister ausgestoßen und will nicht sagen, wofür.', en: 'The guild expelled a master and will not say for what.', regionen: ['stadt'], themen: ['schuld', 'aufstieg'] },
  { de: 'Ein Tier spricht seit drei Tagen, immer denselben Satz.', en: 'An animal has been speaking for three days, always the same sentence.', themen: ['wildnis', 'glaube'], tonfall: ['geheimnisvoll'] },
  { de: 'Zwei Erben stehen vor demselben Haus, mit demselben Siegel.', en: 'Two heirs stand before the same house, holding the same seal.', themen: ['erbe', 'gier'] },
  { de: 'Ein Söldnertrupp ist durchgezogen und hat bezahlt, statt zu nehmen.', en: 'A mercenary company passed through and paid instead of taking.', themen: ['krieg', 'verrat'] },
  { de: 'Der Schnee schmilzt nur über einem einzigen Stück Boden.', en: 'The snow is melting over one patch of ground and nowhere else.', regionen: ['eis', 'berge'], themen: ['wissen', 'wildnis'] },
  { de: 'Jemand hat den Friedhof umgegraben — und nichts mitgenommen.', en: 'Someone dug up the graveyard and took nothing.', themen: ['rache', 'erloesung'] },
  { de: 'Die Tiefensiedlung hat ihren Handel eingestellt, ohne Erklärung.', en: 'The deep settlement has stopped trading, with no explanation.', regionen: ['unterreich'], themen: ['gier', 'verrat'] },
  { de: 'Ein Kranker ist gesund geworden, und sein Nachbar am selben Tag krank.', en: 'A sick man recovered, and his neighbour fell ill the same day.', themen: ['seuche', 'schuld'] },
  { de: 'Am Strand liegen dreißig Boote, sauber nebeneinander, alle fremd.', en: 'Thirty boats lie on the beach in a neat row, none of them local.', regionen: ['hafen', 'see'], themen: ['krieg', 'wissen'] },
  { de: 'Die Schatzkammer ist voll, aber das Verzeichnis nennt doppelt so viel.', en: 'The treasury is full, yet the inventory lists twice as much.', themen: ['gier', 'verrat'], regionen: ['stadt'] },
  { de: 'Ein Wald hat sich über Nacht um eine Meile ausgedehnt.', en: 'A forest spread a mile overnight.', regionen: ['wald'], themen: ['wildnis'] },
  { de: 'Der Verurteilte ist begnadigt worden, von jemandem, der dazu kein Recht hat.', en: 'The condemned was pardoned by someone with no right to do it.', themen: ['schuld', 'aufstieg', 'erloesung'] }
];

/**
 * Wer damit zur Gruppe kommt.
 *
 * Immer ein Mensch mit einem Anliegen, nie eine Behoerde. Wer den Auftrag
 * gibt, ist am Tisch wichtiger als der Auftrag.
 */
export const BETROFFENE: readonly Eintrag[] = [
  { de: 'Eine Hafenmeisterin bittet darum, dass es leise bleibt.', en: 'A harbourmaster asks that it be kept quiet.', regionen: ['hafen'] },
  { de: 'Die Witwe des Mannes, den alle für schuldig halten, bezahlt aus eigener Tasche.', en: 'The widow of the man everyone blames is paying out of her own pocket.', themen: ['schuld'] },
  { de: 'Ein Zunftschreiber kommt heimlich, ohne Auftrag seiner Zunft.', en: 'A guild clerk comes in secret, without his guild’s blessing.', regionen: ['stadt'] },
  { de: 'Zwei Kinder haben das Geld zusammengelegt, das sie hatten.', en: 'Two children have pooled what money they had.' },
  { de: 'Der Wirt fragt, weil sonst niemand mehr kommt.', en: 'The innkeeper is asking, because otherwise nobody comes any more.' },
  { de: 'Eine Söldnerin will es wissen, obwohl sie niemand bezahlt.', en: 'A mercenary wants to know, though nobody is paying her.', themen: ['krieg'] },
  { de: 'Der Bergmeister schickt seinen Sohn, weil er selbst nicht kann.', en: 'The mine foreman sends his son, because he cannot come himself.', regionen: ['berge', 'unterreich'] },
  { de: 'Eine Priesterin bittet, ohne ihren Orden zu nennen.', en: 'A priestess asks, without naming her order.', themen: ['glaube'] },
  { de: 'Der Statthalter lässt fragen, sehr höflich, sehr dringend.', en: 'The governor sends word, very politely, very urgently.', regionen: ['stadt'], themen: ['aufstieg'] },
  { de: 'Ein Kaufmann bietet zu viel Geld für zu wenig Arbeit.', en: 'A merchant offers too much money for too little work.', themen: ['gier'] },
  { de: 'Die Alte, der das halbe Dorf etwas schuldet, ruft die Schulden ein.', en: 'The old woman half the village owes is calling in her debts.' },
  { de: 'Ein Deserteur erzählt es, bevor er weiterzieht.', en: 'A deserter tells it before moving on.', themen: ['krieg'] },
  { de: 'Die Zunft der Färber legt zusammen, was sie entbehren kann.', en: 'The dyers’ guild puts together what it can spare.', regionen: ['stadt'] },
  { de: 'Ein Kartograf braucht Begleitung und redet zu viel.', en: 'A cartographer needs an escort and talks too much.', themen: ['wissen'], tonfall: ['heiter'] },
  { de: 'Der Kapitän bittet um Hilfe und nennt nicht seine Ladung.', en: 'The captain asks for help and does not mention his cargo.', regionen: ['hafen', 'see'] },
  { de: 'Eine Hebamme kommt, weil sie zu viele Fragen gestellt hat.', en: 'A midwife comes, because she asked too many questions.' },
  { de: 'Der Hausherr selbst, der eigentlich Grund hätte zu schweigen.', en: 'The master of the house himself, who has every reason to stay quiet.', themen: ['schuld'] },
  { de: 'Eine Gruppe Bauern, die sich einig sind, was falsch ist — und uneins, wer schuld ist.', en: 'A group of farmers who agree on what is wrong and disagree on who is to blame.', regionen: ['steppe', 'wald'] },
  { de: 'Ein Kind bringt einen Brief von jemandem, der nicht kommen kann.', en: 'A child brings a letter from someone who cannot come.' },
  { de: 'Die Nachbarin des Verschwundenen, die es als Einzige gemeldet hat.', en: 'The missing one’s neighbour, the only person who reported it.' },
  { de: 'Ein Bankhalter, der lieber zahlt als erklärt.', en: 'A banker who would rather pay than explain.', themen: ['gier'], regionen: ['stadt'] },
  { de: 'Der Anführer einer Fraktion, der seine eigenen Leute nicht mehr traut.', en: 'A faction leader who no longer trusts his own people.', themen: ['verrat'] },
  { de: 'Eine Jägerin, die es gesehen hat und dafür ausgelacht wird.', en: 'A huntress who saw it and is being laughed at for it.', regionen: ['wald', 'berge'] },
  { de: 'Der Stadtschreiber, der die Akte vor der Vernichtung gerettet hat.', en: 'The city clerk who saved the file from destruction.', regionen: ['stadt'], themen: ['wissen'] },
  { de: 'Die Tochter, die erst jetzt erfährt, wessen Tochter sie ist.', en: 'The daughter who is only now learning whose daughter she is.', themen: ['erbe'] },
  { de: 'Ein Heiler, dem die Mittel ausgehen und die Kranken nicht.', en: 'A healer running out of supplies and not out of patients.', themen: ['seuche'] },
  { de: 'Der Fährmann, der niemanden mehr übersetzt und sagt, warum nicht.', en: 'The ferryman who no longer takes anyone across, and says why.', regionen: ['sumpf', 'see'] },
  { de: 'Eine Fremde, die zu genau weiß, was sie will.', en: 'A stranger who knows far too precisely what she wants.', tonfall: ['geheimnisvoll'] },
  { de: 'Der Vorbesitzer des Hauses, in dem die Gruppe gerade wohnt.', en: 'The previous owner of the house the party is currently staying in.' },
  { de: 'Eine Karawanenführerin, die nicht warten kann und trotzdem wartet.', en: 'A caravan leader who cannot wait and is waiting anyway.', regionen: ['wueste', 'steppe'] },
  { de: 'Der Bruder des Toten, der nur die Leiche will, sonst nichts.', en: 'The dead man’s brother, who wants only the body and nothing else.', themen: ['rache', 'erloesung'] },
  { de: 'Eine Gelehrte, die es für einen Irrtum hält und hofft, recht zu behalten.', en: 'A scholar who thinks it is a mistake and hopes she is right.', themen: ['wissen'] },
  { de: 'Der Schmied, der die Waffen gemacht hat, die dabei benutzt wurden.', en: 'The smith who made the weapons that were used.', themen: ['schuld'] },
  { de: 'Ein Wirtshausgast, der nicht sagt, wer ihn schickt, aber bar bezahlt.', en: 'A tavern guest who will not say who sent him, but pays in coin.' },
  { de: 'Die Zwillinge, von denen nur einer redet.', en: 'The twins, only one of whom speaks.', tonfall: ['geheimnisvoll'] },
  { de: 'Eine Steuereintreiberin, die zum ersten Mal Angst hat.', en: 'A tax collector who is frightened for the first time.', regionen: ['stadt'] },
  { de: 'Der Anführer der Flüchtenden, der um Durchlass bittet statt um Hilfe.', en: 'The leader of the refugees, asking for passage rather than help.', themen: ['krieg'] },
  { de: 'Ein alter Lehrmeister der Gruppe, dem das sichtlich unangenehm ist.', en: 'An old mentor of the party, visibly uncomfortable about asking.' },
  { de: 'Die Wirtin, die eine Nachricht weitergibt und nicht weiß, von wem.', en: 'The landlady passing on a message, not knowing from whom.' },
  { de: 'Ein Kind der Tiefe, das zum ersten Mal oben ist.', en: 'A child of the depths, above ground for the first time.', regionen: ['unterreich'] },
  { de: 'Der Vorsteher, der lieber selbst ginge, aber gebraucht wird.', en: 'The headman who would rather go himself, but is needed here.' },
  { de: 'Eine Diebin, die etwas zurückgeben will, ohne erwischt zu werden.', en: 'A thief who wants to return something without being caught.', tonfall: ['heiter'] },
  { de: 'Der Verdächtige selbst, der beweisen will, dass er es nicht war.', en: 'The suspect himself, out to prove it was not him.', themen: ['schuld', 'erloesung'] },
  { de: 'Eine Hausherrin, die drei Fragen beantwortet und die vierte nicht.', en: 'A lady of the house who answers three questions and not the fourth.' }
];

/**
 * Was die Sache schief macht.
 *
 * Ein Auftrag ohne Haken ist eine Besorgung. Diese Zeile ist die, an der am
 * Tisch das Gespraech anfaengt.
 */
export const KOMPLIKATIONEN: readonly Eintrag[] = [
  { de: 'Nur: Der einzige Zeuge ist seit gestern tot.', en: 'Only: the sole witness died yesterday.' },
  { de: 'Nur: Wer es aufklärt, macht sich einen sehr geduldigen Feind.', en: 'Only: whoever solves it makes a very patient enemy.' },
  { de: 'Nur: Die Belohnung ist Geld, das jemandem anderen gehört.', en: 'Only: the reward is money that belongs to somebody else.', themen: ['gier'] },
  { de: 'Nur: Die Wahrheit würde einen Unschuldigen das Leben kosten.', en: 'Only: the truth would cost an innocent his life.', themen: ['schuld'] },
  { de: 'Nur: Es hat schon einmal jemand versucht, und der ist zurückgekommen — verändert.', en: 'Only: someone tried before, and came back changed.', tonfall: ['duester', 'geheimnisvoll'] },
  { de: 'Nur: Die Person, die helfen könnte, hat mit der Gruppe noch eine Rechnung offen.', en: 'Only: the one person who could help has unfinished business with the party.', themen: ['rache'] },
  { de: 'Nur: Der Auftrag ist rechtens, die Absicht dahinter nicht.', en: 'Only: the job is lawful, the intent behind it is not.', themen: ['verrat'] },
  { de: 'Nur: Beide Seiten sagen die Wahrheit, und beide Wahrheiten schließen einander aus.', en: 'Only: both sides are telling the truth, and the two truths exclude each other.' },
  { de: 'Nur: Es gibt einen zweiten Auftraggeber für dieselbe Sache, mit umgekehrtem Ziel.', en: 'Only: a second client wants the same thing done backwards.', themen: ['verrat'] },
  { de: 'Nur: Der schnellste Weg führt über Land, das niemand betreten darf.', en: 'Only: the fastest route crosses land nobody may set foot on.', themen: ['glaube', 'wildnis'] },
  { de: 'Nur: Jeder, der davon weiß, ist inzwischen krank.', en: 'Only: everyone who knows of it has since fallen ill.', themen: ['seuche'] },
  { de: 'Nur: Der Beweis liegt in einem Archiv, das nächste Woche verbrannt wird.', en: 'Only: the proof sits in an archive due to be burned next week.', themen: ['wissen'] },
  { de: 'Nur: Es ist schon gelöst worden — vor achtzig Jahren, und offenbar falsch.', en: 'Only: it was already solved eighty years ago, and evidently wrongly.', themen: ['erbe'] },
  { de: 'Nur: Wer fragt, wird beobachtet, und zwar von Anfang an.', en: 'Only: whoever asks is being watched, and has been from the start.' },
  { de: 'Nur: Die Gruppe hat auf dem Weg hierher schon einen Teil davon zerstört.', en: 'Only: the party already destroyed part of it on the way here.', themen: ['schuld'] },
  { de: 'Nur: Der Ort ist nur bei Ebbe erreichbar, und die Ebbe dauert vier Stunden.', en: 'Only: the place is reachable at low tide, and low tide lasts four hours.', regionen: ['hafen', 'see'] },
  { de: 'Nur: Ein Kind weiß mehr als alle Erwachsenen und redet nur mit einer Person.', en: 'Only: a child knows more than every adult and will speak to one person alone.' },
  { de: 'Nur: Die Lösung macht die eine Fraktion so stark, dass sie zum nächsten Problem wird.', en: 'Only: the fix leaves one faction strong enough to become the next problem.', themen: ['aufstieg'] },
  { de: 'Nur: Was gestohlen wurde, will nicht zurück.', en: 'Only: the stolen thing does not want to go back.', tonfall: ['geheimnisvoll'] },
  { de: 'Nur: Der Auftraggeber kann nicht zahlen und weiß es.', en: 'Only: the client cannot pay and knows it.' },
  { de: 'Nur: Es gibt eine Aufzeichnung davon, und sie ist bereits unterwegs zum Falschen.', en: 'Only: there is a record of it, already on its way to the wrong person.' },
  { de: 'Nur: Der Schuldige ist ein Kind der Frau, die um Hilfe bittet.', en: 'Only: the culprit is the child of the woman asking for help.', themen: ['schuld'] },
  { de: 'Nur: Wer den Ort verlässt, vergisst binnen eines Tages, was er gesehen hat.', en: 'Only: whoever leaves the place forgets within a day what they saw.', tonfall: ['geheimnisvoll'] },
  { de: 'Nur: Das Rechtsmittel dagegen läuft in drei Tagen ab, und der Richter ist verreist.', en: 'Only: the legal remedy expires in three days and the judge is away.', regionen: ['stadt'], themen: ['aufstieg'] },
  { de: 'Nur: Es hängt an einem Vertrag, den die Gruppe vor Monaten selbst unterschrieben hat.', en: 'Only: it hinges on a contract the party signed months ago.', themen: ['schuld'] },
  { de: 'Nur: Der Weg ist frei, die Rückkehr nicht.', en: 'Only: the way in is open, the way back is not.' },
  { de: 'Nur: Wer hilft, verliert das Wohlwollen der Leute, bei denen er überwintern wollte.', en: 'Only: helping costs the goodwill of the people you meant to winter with.', regionen: ['eis', 'berge'] },
  { de: 'Nur: Die Sache ist längst öffentlich, und alle haben beschlossen, sie nicht zu sehen.', en: 'Only: it is common knowledge, and everyone has agreed not to see it.' },
  { de: 'Nur: Zwei Fraktionen wollen gerade beide, dass die Gruppe scheitert, aus verschiedenen Gründen.', en: 'Only: two factions both want the party to fail, for different reasons.' },
  { de: 'Nur: Es ist kein Verbrechen. Es ist ein Brauch, und der ist älter als die Stadt.', en: 'Only: it is no crime. It is a custom, and older than the town.', themen: ['glaube'] },
  { de: 'Nur: Wer den Auftrag annimmt, wird für etwas bezahlt, das er ohnehin tun würde.', en: 'Only: taking the job means being paid for what you would do anyway.', tonfall: ['heiter'] },
  { de: 'Nur: Die Spur endet an einem Grab, und im Grab liegt jemand anderes.', en: 'Only: the trail ends at a grave, and the grave holds someone else.' },
  { de: 'Nur: Der Ort gehört jemandem, der seit Jahren tot sein sollte.', en: 'Only: the place belongs to someone who should have died years ago.', themen: ['erbe'] },
  { de: 'Nur: Jeder Tag Aufschub kostet ein Menschenleben, und niemand sagt, wessen.', en: 'Only: every day of delay costs a life, and nobody says whose.', tonfall: ['duester'] },
  { de: 'Nur: Der Gegner tut nichts Unrechtes. Er tut nur alles zuerst.', en: 'Only: the adversary does nothing wrong. He merely does everything first.', themen: ['aufstieg'] },
  { de: 'Nur: Was die Gruppe finden soll, ist schon gefunden und wieder versteckt worden.', en: 'Only: the thing to be found has already been found and hidden again.' },
  { de: 'Nur: Die Zeugenaussagen stimmen zu genau überein.', en: 'Only: the witness statements agree a little too exactly.', themen: ['verrat'] },
  { de: 'Nur: Es gibt einen einfachen Weg, und er ist eine Falle für den, der ihn wählt.', en: 'Only: there is an easy way, and it is a trap for whoever takes it.' },
  { de: 'Nur: Die Kranken sind ansteckend, aber nur für die, die ihnen glauben.', en: 'Only: the sick are contagious, but only to those who believe them.', themen: ['seuche', 'glaube'] },
  { de: 'Nur: Der Gegenstand lässt sich nicht tragen, ohne dass man gesehen wird.', en: 'Only: the object cannot be carried without being seen.' },
  { de: 'Nur: Eine Gruppenperson wird namentlich erwartet — von jemandem, den sie nicht kennt.', en: 'Only: one of the party is expected by name, by someone they have never met.' },
  { de: 'Nur: Das alles ergibt erst Sinn, wenn man ein zweites, älteres Verbrechen kennt.', en: 'Only: none of it makes sense until you know about a second, older crime.' },
  { de: 'Nur: Die Wache hat den Fall geschlossen und ist gekränkt, wenn jemand weitergräbt.', en: 'Only: the watch closed the case and takes offence at anyone digging.', regionen: ['stadt'] },
  { de: 'Nur: Der Ort ist bewohnt, und die Bewohner sind im Recht.', en: 'Only: the place is inhabited, and the inhabitants are in the right.', themen: ['wildnis'] },
  { de: 'Nur: Wer es beendet, beendet auch den Grund, aus dem die Leute hier zusammenhalten.', en: 'Only: ending it also ends the reason these people stick together.' },
  { de: 'Nur: Es gibt eine Belohnung, doch sie wird erst nach dem Winter ausgezahlt.', en: 'Only: there is a reward, but it is paid out after winter.' },
  { de: 'Nur: Ein Mitglied der Gruppe kennt jemanden darin und hat es bisher nicht gesagt.', en: 'Only: one of the party knows someone involved and has not mentioned it.', themen: ['verrat'] },
  { de: 'Nur: Das Gegenmittel und das Gift kommen aus derselben Hand.', en: 'Only: the cure and the poison come from the same hand.', themen: ['seuche'] }
];

/**
 * Die Uhr, die tickt.
 *
 * Nicht immer dabei — eine Frist an jedem Aufhaenger waere keine Frist mehr,
 * sondern ein Format.
 */
export const FRISTEN: readonly Eintrag[] = [
  { de: 'Zeit bis zum nächsten Vollmond.', en: 'You have until the next full moon.' },
  { de: 'Drei Tage, dann fährt das Schiff.', en: 'Three days, then the ship sails.', regionen: ['hafen', 'see'] },
  { de: 'Bis zur Gerichtsverhandlung am Freitag.', en: 'Until the trial on Friday.', regionen: ['stadt'] },
  { de: 'Solange der Pass offen ist — also etwa zwei Wochen.', en: 'As long as the pass stays open, so about two weeks.', regionen: ['berge', 'eis'] },
  { de: 'Bis die Fieberkranken nicht mehr zu zählen sind.', en: 'Until the fevered are too many to count.', themen: ['seuche'] },
  { de: 'Bis zur Hochzeit, die alles besiegeln würde.', en: 'Until the wedding that would seal everything.', themen: ['erbe', 'aufstieg'] },
  { de: 'Bis zum Ende der Ebbe.', en: 'Until the tide turns.', regionen: ['hafen', 'see'] },
  { de: 'Bis das Heer hier ist, und es marschiert seit gestern.', en: 'Until the army arrives, and it marched out yesterday.', themen: ['krieg'] },
  { de: 'Eine Nacht. Danach ist der Ort wieder verschlossen.', en: 'One night. After that the place seals again.', tonfall: ['geheimnisvoll'] },
  { de: 'Bis zur Zahlung am Monatsende.', en: 'Until the payment at month’s end.', themen: ['gier'] },
  { de: 'Bis der Schnee taut und freilegt, was darunter liegt.', en: 'Until the snow melts and uncovers what lies beneath.', regionen: ['eis', 'berge'] },
  { de: 'Bis der Markt schließt und die Fremden weiterziehen.', en: 'Until the market closes and the strangers move on.' },
  { de: 'Keine Frist — und genau das ist das Unangenehme daran.', en: 'No deadline at all, and that is the uncomfortable part.' },
  { de: 'Bis zur Beerdigung, denn danach wird nicht mehr geredet.', en: 'Until the funeral, because after that nobody will talk.' },
  { de: 'Bis die Ernte eingebracht ist, sonst verhungert das Tal.', en: 'Until the harvest is in, or the valley starves.', regionen: ['steppe', 'wald'] },
  { de: 'Sieben Tage, sagt die Botschaft. Sie lügt.', en: 'Seven days, says the message. It is lying.', themen: ['verrat'] }
];
