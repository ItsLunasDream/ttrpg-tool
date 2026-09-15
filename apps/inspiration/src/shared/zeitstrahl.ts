/**
 * Was passiert, wenn die Gruppe nichts tut.
 *
 * Der Baustein, der ein Abenteuer lebendig macht: die Welt wartet nicht. Am
 * Tisch ist das Gold wert, weil die Spielleitung damit auch dann etwas in
 * der Hand hat, wenn die Gruppe in eine ganz andere Richtung laeuft.
 *
 * Die Schritte steigern sich nicht von selbst — dafuer sorgt die Reihenfolge
 * der Zeitmarken. Die Tabelle ist nach Wucht geordnet (`stufe`): 1 ist eine
 * Nachricht, 3 ist eine Beerdigung. Gezogen wird je Zeitmarke aus der
 * passenden Stufe, damit es nicht am dritten Tag Tote gibt und in der
 * sechsten Woche eine verspaetete Lieferung.
 */
import type { Eintrag, Paar, UmfangId } from './tabellen';

export interface Schritt extends Eintrag {
  /** 1 = es faellt auf, 2 = es tut weh, 3 = es ist nicht mehr zu drehen. */
  readonly stufe: 1 | 2 | 3;
}

/**
 * Die Zeitmarken je Umfang.
 *
 * Ein Abend spielt in Stunden, eine Kampagne in Monaten. Dieselben Schritte
 * auf beide Skalen gelegt zu bekommen, ist der ganze Trick: „bis zum Abend"
 * und „bis zum Frühjahr" sind derselbe Satz an verschiedenen Uhren.
 */
export const ZEITMARKEN: Record<UmfangId, readonly Paar[]> = {
  abend: [
    { de: 'Noch vor Einbruch der Dunkelheit', en: 'Before dark' },
    { de: 'In der Nacht', en: 'During the night' },
    { de: 'Im Morgengrauen', en: 'At first light' },
    { de: 'Am nächsten Mittag', en: 'By noon the next day' }
  ],
  bogen: [
    { de: 'Nach zwei Tagen', en: 'After two days' },
    { de: 'Nach einer Woche', en: 'After a week' },
    { de: 'Nach zwei Wochen', en: 'After two weeks' },
    { de: 'Nach einem Monat', en: 'After a month' },
    { de: 'Nach zwei Monaten', en: 'After two months' }
  ],
  kampagne: [
    { de: 'Nach einer Woche', en: 'After a week' },
    { de: 'Nach einem Monat', en: 'After a month' },
    { de: 'Nach einer Jahreszeit', en: 'After a season' },
    { de: 'Nach einem halben Jahr', en: 'After half a year' },
    { de: 'Nach einem Jahr', en: 'After a year' },
    { de: 'Nach drei Jahren', en: 'After three years' },
    { de: 'Wenn niemand mehr davon spricht', en: 'When nobody speaks of it any more' }
  ]
};

export const SCHRITTE: readonly Schritt[] = [
  // Stufe 1 — es faellt auf.
  { stufe: 1, de: 'Eine zweite Gruppe nimmt denselben Auftrag an.', en: 'A second party takes the same job.' },
  { stufe: 1, de: 'Der Preis für das Nötigste verdoppelt sich.', en: 'The price of necessities doubles.', themen: ['gier'] },
  { stufe: 1, de: 'Die Wache verstärkt die Streifen und findet nichts.', en: 'The watch doubles its patrols and finds nothing.', regionen: ['stadt'] },
  { stufe: 1, de: 'Ein Zeuge zieht seine Aussage zurück.', en: 'A witness retracts a statement.', themen: ['schuld'] },
  { stufe: 1, de: 'Die Nachricht erreicht eine Fraktion, die sie nicht haben sollte.', en: 'The news reaches a faction that should not have it.', themen: ['verrat'] },
  { stufe: 1, de: 'Jemand räumt still sein Haus und verschwindet.', en: 'Someone quietly clears out and leaves.' },
  { stufe: 1, de: 'Das erste Kind hustet.', en: 'The first child starts coughing.', themen: ['seuche'] },
  { stufe: 1, de: 'Ein Bote wird unterwegs aufgehalten und ausgefragt.', en: 'A courier is stopped and questioned on the road.' },
  { stufe: 1, de: 'Ein Gerücht bekommt einen Namen, und der ist falsch.', en: 'A rumour acquires a name, and it is the wrong one.' },
  { stufe: 1, de: 'Die Lieferung bleibt aus, zum ersten Mal.', en: 'The delivery fails to arrive, for the first time.' },
  { stufe: 1, de: 'Eine Fraktion stellt ihre Leute an neue Posten.', en: 'A faction reassigns its people to new posts.' },
  { stufe: 1, de: 'Ein Gebet wird öffentlich gesprochen, das sonst niemand spricht.', en: 'A prayer is said in public that nobody says any more.', themen: ['glaube'] },
  { stufe: 1, de: 'Die Tiere gehen nicht mehr über eine bestimmte Stelle.', en: 'The animals stop crossing a certain spot.', themen: ['wildnis'] },
  { stufe: 1, de: 'Jemand kauft alles auf, wovon es noch genug gibt.', en: 'Someone buys up everything still in supply.', themen: ['gier'] },
  { stufe: 1, de: 'Ein Vertrag wird um genau eine Klausel ergänzt.', en: 'A contract gains exactly one new clause.', regionen: ['stadt'] },
  { stufe: 1, de: 'Der Weg über den Pass wird gesperrt.', en: 'The pass road is closed.', regionen: ['berge', 'eis'] },
  { stufe: 1, de: 'Die ersten packen ihre Sachen, ohne es zuzugeben.', en: 'The first families pack, without admitting it.' },
  { stufe: 1, de: 'Ein Fund wird gemeldet und sofort zurückgenommen.', en: 'A find is reported and immediately unreported.', themen: ['wissen'] },

  // Stufe 2 — es tut weh.
  { stufe: 2, de: 'Eine Fraktion besetzt den Ort, um den es geht.', en: 'A faction occupies the place in question.' },
  { stufe: 2, de: 'Der Auftraggeber zieht sich zurück und leugnet alles.', en: 'The client withdraws and denies everything.', themen: ['verrat'] },
  { stufe: 2, de: 'Es gibt den ersten Toten, und beide Seiten nennen ihn ihren.', en: 'There is a first death, and both sides claim him.' },
  { stufe: 2, de: 'Die Beweise werden vernichtet, ordentlich und vollständig.', en: 'The evidence is destroyed, tidily and completely.', themen: ['wissen'] },
  { stufe: 2, de: 'Ein Viertel wird abgeriegelt, offiziell wegen der Kranken.', en: 'A quarter is sealed off, officially because of the sick.', themen: ['seuche'] },
  { stufe: 2, de: 'Das Bündnis wird geschlossen, gegen die falsche Seite.', en: 'The alliance is signed, against the wrong side.', themen: ['krieg'] },
  { stufe: 2, de: 'Der Schuldige wird gefunden — es ist der Falsche, und er gesteht.', en: 'The culprit is found: the wrong man, and he confesses.', themen: ['schuld'] },
  { stufe: 2, de: 'Die Gruppe wird namentlich für etwas verantwortlich gemacht.', en: 'The party is named as responsible for something.' },
  { stufe: 2, de: 'Die Vorräte reichen nur noch für die halbe Siedlung.', en: 'The stores now feed only half the settlement.' },
  { stufe: 2, de: 'Der Erbe taucht auf und ist kaufbar.', en: 'The heir appears, and can be bought.', themen: ['erbe', 'gier'] },
  { stufe: 2, de: 'Die Quelle versiegt ganz.', en: 'The spring dries up completely.', regionen: ['wueste', 'steppe'] },
  { stufe: 2, de: 'Jemand aus dem Umfeld der Gruppe wechselt die Seite.', en: 'Someone close to the party changes sides.', themen: ['verrat'] },
  { stufe: 2, de: 'Ein Heiligtum wird geschlossen und versiegelt.', en: 'A shrine is closed and sealed.', themen: ['glaube'] },
  { stufe: 2, de: 'Die Zahlungen werden eingestellt, alle auf einmal.', en: 'Payments stop, all of them at once.', themen: ['gier'] },
  { stufe: 2, de: 'Das Wasser steht in den Kellern.', en: 'Water stands in the cellars.', regionen: ['sumpf', 'see'] },
  { stufe: 2, de: 'Eine Fraktion stellt ein Ultimatum, öffentlich.', en: 'A faction issues an ultimatum, publicly.' },
  { stufe: 2, de: 'Die Leute fangen an, sich gegenseitig anzuzeigen.', en: 'People begin informing on each other.', tonfall: ['duester'] },
  { stufe: 2, de: 'Der Ort wird geräumt, in einer Nacht.', en: 'The place is cleared out, in one night.' },
  { stufe: 2, de: 'Zwei Fraktionen treffen eine Abmachung auf Kosten Dritter.', en: 'Two factions strike a deal at a third’s expense.' },

  // Stufe 3 — es ist nicht mehr zu drehen.
  { stufe: 3, de: 'Die Sache wird Gesetz, und niemand erinnert sich, wie es anfing.', en: 'It becomes law, and nobody remembers how it began.', regionen: ['stadt'] },
  { stufe: 3, de: 'Der Ort ist verloren und wird auf neuen Karten weggelassen.', en: 'The place is lost, and is left off the new maps.' },
  { stufe: 3, de: 'Eine Fraktion hat gewonnen und ist damit das nächste Problem.', en: 'One faction has won, and is now the next problem.', themen: ['aufstieg'] },
  { stufe: 3, de: 'Die Seuche erreicht die Nachbarregion.', en: 'The sickness reaches the neighbouring region.', themen: ['seuche'] },
  { stufe: 3, de: 'Der Krieg beginnt, aus einem anderen Grund als dem eigentlichen.', en: 'The war begins, for a reason other than the real one.', themen: ['krieg'] },
  { stufe: 3, de: 'Die Wahrheit kommt heraus und ändert nichts mehr.', en: 'The truth comes out and changes nothing.', tonfall: ['duester'] },
  { stufe: 3, de: 'Die Überlebenden gründen den Ort andernorts neu, ohne Erinnerung.', en: 'The survivors found the place anew elsewhere, without the memory.' },
  { stufe: 3, de: 'Das, was unter dem Ort lag, ist jetzt darüber.', en: 'What lay under the place is now over it.', tonfall: ['geheimnisvoll'] },
  { stufe: 3, de: 'Die Gruppe wird gesucht, mit Bild und Namen.', en: 'The party is wanted, with name and likeness.' },
  { stufe: 3, de: 'Eine Generation wächst mit dieser Sache als Normalzustand auf.', en: 'A generation grows up with this as the normal state of things.' },
  { stufe: 3, de: 'Der letzte, der es hätte beweisen können, wird begraben.', en: 'The last person who could have proved it is buried.', themen: ['schuld'] },
  { stufe: 3, de: 'Der Handelsweg verlegt sich dauerhaft und lässt alles zurück.', en: 'The trade route shifts for good and leaves everything behind.', themen: ['gier'] },
  { stufe: 3, de: 'Aus dem Brauch wird ein Glaube und aus dem Glauben eine Pflicht.', en: 'The custom becomes a faith, and the faith an obligation.', themen: ['glaube'] },
  { stufe: 3, de: 'Wer bleiben wollte, kann nicht mehr gehen.', en: 'Those who wanted to stay can no longer leave.' },
  { stufe: 3, de: 'Das Land gehört jetzt jemandem, den hier niemand je gesehen hat.', en: 'The land now belongs to someone nobody here has ever seen.', themen: ['erbe'] }
];
