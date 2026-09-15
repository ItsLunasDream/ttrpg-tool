/**
 * Figuren — aber nicht als Steckbrief.
 *
 * Steckbriefe macht der NPC Creator, und zwar besser (Spezies, Aussehen,
 * Eigenheiten). Hier zaehlt nur, wofuer eine Figur im Geflecht gut ist:
 * welche Rolle sie hat, was sie will, was sie in der Hand haelt und was
 * gegen sie spricht. Eine Figur von hier laesst sich spaeter im NPC Creator
 * ausbauen, umgekehrt nicht.
 *
 * Die Rufnamen sind in beiden Sprachen dieselben — Mara heisst nirgends
 * anders. Die Beinamen kommen aus denselben Namenshaelften wie die Orte:
 * wer aus Rabenstein stammt, heisst dort auch so, und die Welt klingt nach
 * einem Guss statt nach zwei Tabellen.
 */
import { NAME_ERSTE, NAME_ZWEITE } from './orte';
import type { Eintrag, Paar } from './tabellen';

export { NAME_ERSTE, NAME_ZWEITE };

/** Rufnamen. Sprachneutral, darum einfache Zeichenketten. */
export const RUFNAMEN: readonly string[] = [
  'Mara', 'Edda', 'Roswitha', 'Jorun', 'Tove', 'Selma', 'Hilde', 'Isa',
  'Almut', 'Ronja', 'Sigrid', 'Vera', 'Lenya', 'Mira', 'Katla', 'Perrin',
  'Halvard', 'Ansgar', 'Bertram', 'Corvin', 'Detlev', 'Egon', 'Falk', 'Gero',
  'Hagen', 'Ivar', 'Jost', 'Knut', 'Lorenz', 'Malte', 'Norbert', 'Oswin',
  'Piet', 'Quirin', 'Rasmus', 'Sten', 'Torben', 'Ulf', 'Veit', 'Wendel',
  'Arne', 'Birk', 'Cord', 'Dorin', 'Enno', 'Freya', 'Gunda', 'Helga',
  'Inka', 'Jutta', 'Kira', 'Liv', 'Meret', 'Nele', 'Oda', 'Pia',
  'Runa', 'Svea', 'Thora', 'Ulla', 'Vala', 'Wilma', 'Yrsa', 'Zita',
  'Aslak', 'Benno', 'Cassian', 'Darek', 'Eiven', 'Fenn', 'Gorm', 'Hedda',
  'Imre', 'Janne', 'Kalla', 'Lund', 'Morten', 'Nord', 'Ottilie', 'Pelle'
];

/**
 * Die Rolle im Geflecht.
 *
 * Nicht der Beruf — der steht im NPC Creator. Hier steht, wozu die Figur am
 * Tisch da ist.
 *
 * Alle Rollen sind ohne Geschlecht formuliert, und das ist kein Feinschliff:
 * die Namen werden getrennt gezogen, und „Falk Eisenschacht — Auftraggeberin"
 * ist genau die Art Fehler, die jeder sofort sieht. Im Deutschen heisst das
 * Taetigkeiten statt Personenbezeichnungen: „Auftraggebend" statt
 * „Auftraggeberin".
 */
export const ROLLEN: readonly Eintrag[] = [
  { de: 'Auftraggebend', en: 'Patron' },
  { de: 'Gegenseite', en: 'Adversary' },
  { de: 'Ahnungslos', en: 'Oblivious' },
  { de: 'Mitwissend', en: 'In on it' },
  { de: 'Hat es gesehen', en: 'Saw it happen' },
  { de: 'Steht in der Erbfolge', en: 'In line to inherit' },
  { de: 'Wechselt die Seite', en: 'Changing sides' },
  { de: 'Vermittelnd', en: 'Go-between' },
  { de: 'Will nach oben', en: 'On the way up' },
  { de: 'Steht in der Kreide', en: 'Deep in debt' },
  { de: 'Hält die Schulden', en: 'Holds the debts' },
  { de: 'Betroffen, aber kein Opfer', en: 'Caught in it, not a victim' },
  { de: 'Hütet einen Ort', en: 'Keeps a place' },
  { de: 'Vertretung, die zu weit geht', en: 'Deputy going too far' },
  { de: 'Hütet ein Geheimnis', en: 'Keeps a secret' },
  { de: 'Alte Rivalität', en: 'Old rivalry' },
  { de: 'War raus, muss zurück', en: 'Out, and pulled back in' },
  { de: 'Wird erpresst', en: 'Under leverage' },
  { de: 'Fälscht Papiere', en: 'Forges papers' },
  { de: 'Kämpft für eine verlorene Sache', en: 'Fights a lost cause' },
  { de: 'Passt auf, für andere', en: 'Minding, for someone else' },
  { de: 'Weiß zu viel und redet', en: 'Knows too much and talks' },
  { de: 'Hilft gegen Gegenleistung', en: 'Helps, for a price' },
  { de: 'Beschuldigt, ohne Alibi', en: 'Accused, no alibi' },
  { de: 'Zweite Wahl beim Erbe', en: 'Second-choice heir' },
  { de: 'Soll nachfolgen, will nicht', en: 'Named successor, unwilling' },
  { de: 'Außen vor, weiß das Entscheidende', en: 'Outsider with the key fact' },
  { de: 'Führt, ohne Gefolgschaft', en: 'Leads, with nobody following' }
];

/** Was diese Figur will. Ohne Fuerwort, aus demselben Grund wie die Rollen. */
export const TRIEBFEDERN: readonly Eintrag[] = [
  { de: 'Will vor allem, dass niemand nachfragt.', en: 'Wants above all that nobody asks questions.' },
  { de: 'Will den Ruf der Familie zurück.', en: 'Wants the family name back.', themen: ['erbe'] },
  { de: 'Will jemanden aus der Sache heraushalten.', en: 'Wants to keep someone out of it.' },
  { de: 'Will beweisen, recht gehabt zu haben.', en: 'Wants to prove they were right.' },
  { de: 'Will die Stelle, die gerade frei geworden ist.', en: 'Wants the post that just came open.', themen: ['aufstieg'] },
  { de: 'Will genug Geld, um endlich wegzugehen.', en: 'Wants enough money to leave for good.', themen: ['gier'] },
  { de: 'Will wiedergutmachen, was nicht wiedergutzumachen ist.', en: 'Wants to make good what cannot be made good.', themen: ['schuld', 'erloesung'] },
  { de: 'Will, dass alles genau so bleibt.', en: 'Wants everything to stay exactly as it is.' },
  { de: 'Will erfahren, wer damals geredet hat.', en: 'Wants to learn who talked back then.', themen: ['verrat', 'rache'] },
  { de: 'Will nach Hause, und das geht nicht.', en: 'Wants to go home, and cannot.' },
  { de: 'Will Recht bekommen, nicht Frieden.', en: 'Wants justice, not peace.', themen: ['rache'] },
  { de: 'Will die eigenen Leute durch den Winter bringen.', en: 'Wants to get their people through the winter.' },
  { de: 'Will endlich wieder gebraucht werden.', en: 'Wants to be needed again.' },
  { de: 'Will dieselbe Sache wie die Gruppe, aber zuerst.', en: 'Wants the same thing as the party, only first.' },
  { de: 'Will ein Versprechen halten, das zu groß war.', en: 'Wants to keep a promise that was too large.' },
  { de: 'Will nicht mehr lügen und weiß nicht, wie aufhören.', en: 'Wants to stop lying and does not know how.' },
  { de: 'Will das Kind zurück, egal was es kostet.', en: 'Wants the child back, whatever it costs.' },
  { de: 'Will vergessen werden.', en: 'Wants to be forgotten.' },
  { de: 'Will eine Schuld eintreiben, die zwanzig Jahre alt ist.', en: 'Wants to collect a twenty-year-old debt.', themen: ['gier', 'rache'] },
  { de: 'Will, dass die Wahrheit herauskommt — nur nicht die ganze.', en: 'Wants the truth out, but not all of it.', themen: ['verrat'] },
  { de: 'Will beweisen, dass der Glaube trägt.', en: 'Wants to prove the faith holds.', themen: ['glaube'] },
  { de: 'Will die Gruppe loswerden, ohne sie zu verärgern.', en: 'Wants the party gone without offending them.' },
  { de: 'Will erben, was rechtlich jemand anderem zusteht.', en: 'Wants to inherit what is legally someone else’s.', themen: ['erbe', 'gier'] },
  { de: 'Will die Kranken retten, auch gegen deren Willen.', en: 'Wants to save the sick, even against their will.', themen: ['seuche'] },
  { de: 'Will eine zweite Chance und traut ihr nicht.', en: 'Wants a second chance and does not trust it.', themen: ['erloesung'] },
  { de: 'Will das Land zurück, das unter Wasser steht.', en: 'Wants back the land that lies under water.', regionen: ['sumpf', 'see'] },
  { de: 'Will wissen, was am Grund liegt.', en: 'Wants to know what lies at the bottom.', themen: ['wissen'] },
  { de: 'Will den Krieg, weil Frieden ruinös wäre.', en: 'Wants the war, because peace would mean ruin.', themen: ['krieg', 'gier'] }
];

/** Was sie in der Hand hat. Das macht sie fuer die Gruppe interessant. */
export const HEBEL: readonly Paar[] = [
  { de: 'Hat einen Schlüssel, der zu mehr passt als gedacht.', en: 'Holds a key that fits more than expected.' },
  { de: 'Hat eine Liste mit Namen und Beträgen.', en: 'Holds a list of names and sums.' },
  { de: 'Kennt einen Weg hinein, den es auf keiner Karte gibt.', en: 'Knows a way in that is on no map.' },
  { de: 'Hat die Unterschrift von jemandem, der alles leugnet.', en: 'Holds the signature of someone who denies everything.' },
  { de: 'Ist der einzige Mensch, dem die Wache glaubt.', en: 'Is the only person the watch believes.' },
  { de: 'Hat Zugang zu einem Lager, das offiziell leer ist.', en: 'Has access to a store that is officially empty.' },
  { de: 'Hat Familie bei der Gegenseite.', en: 'Has family on the other side.' },
  { de: 'Besitzt das letzte Stück eines Paares.', en: 'Owns the last piece of a matched pair.' },
  { de: 'Hat drei Tage Vorsprung an Wissen.', en: 'Is three days ahead in what they know.' },
  { de: 'Kann die Urkunde beglaubigen — oder eben nicht.', en: 'Can certify the deed, or decline to.' },
  { de: 'Hat ein Boot und niemanden, der es rudert.', en: 'Has a boat and nobody to row it.' },
  { de: 'Hat die Krankheit überstanden und ist nicht mehr ansteckbar.', en: 'Survived the sickness and can no longer catch it.' },
  { de: 'Hat Geld, das sich nicht offen ausgeben lässt.', en: 'Has money that cannot be spent openly.' },
  { de: 'Kennt den wahren Namen von jemandem.', en: 'Knows somebody’s true name.' },
  { de: 'Hat die alte Karte, aber nicht die Erlaubnis.', en: 'Has the old map, but not the permission.' },
  { de: 'Hat ein Pferd, das den Pass kennt.', en: 'Has a horse that knows the pass.' },
  { de: 'Steht in einem Testament, das noch nicht eröffnet ist.', en: 'Is named in a will not yet opened.' },
  { de: 'Hat die Werkzeuge und weiß, wie man sie benutzt.', en: 'Has the tools and knows how to use them.' },
  { de: 'Kann Türen öffnen lassen, ohne selbst dabei zu sein.', en: 'Can have doors opened without being present.' },
  { de: 'Hat eine Nachricht, die noch niemand gelesen hat.', en: 'Holds a message nobody has read yet.' },
  { de: 'Hat das Vertrauen der Kinder im Viertel.', en: 'Has the trust of every child in the quarter.' },
  { de: 'Hat ein Alibi zu verkaufen.', en: 'Has an alibi for sale.' },
  { de: 'Kann als Einzige die alte Schrift lesen.', en: 'Is the only one able to read the old script.' },
  { de: 'Kennt den Wächter beim Vornamen.', en: 'Is on first-name terms with the guard.' },
  { de: 'Hat eine zweite Tür zum eigenen Haus, von der niemand weiß.', en: 'Has a second door to the house nobody knows of.' },
  { de: 'Hat ein Fass von etwas, das gerade knapp ist.', en: 'Has a barrel of something currently scarce.' }
];

/**
 * Was gegen sie spricht. Ohne Makel ist eine Figur nur eine Auskunft.
 *
 * Verbfoermig und ohne „sie" oder „er" — der Name davor kann jeder sein.
 */
export const MAKEL: readonly Paar[] = [
  { de: 'Aber: erzählt es niemals zweimal gleich.', en: 'But: never tells it the same way twice.' },
  { de: 'Aber: schuldet der Gegenseite mehr als der Gruppe.', en: 'But: owes the other side more than the party.' },
  { de: 'Aber: trinkt, und zwar genau dann, wenn es darauf ankommt.', en: 'But: drinks, and precisely when it matters.' },
  { de: 'Aber: glaubt jedes eigene Wort und irrt sich trotzdem.', en: 'But: believes every word of it, and is wrong anyway.' },
  { de: 'Aber: wird beobachtet, ohne es zu wissen.', en: 'But: is being watched, and does not know it.' },
  { de: 'Aber: verkauft dieselbe Auskunft noch dreimal.', en: 'But: will sell the same information three more times.' },
  { de: 'Aber: hat Angst vor genau der Person, die man fragen müsste.', en: 'But: is afraid of exactly the person one would have to ask.' },
  { de: 'Aber: redet erst, wenn jemand dafür bürgt.', en: 'But: will not speak until someone vouches for it.' },
  { de: 'Aber: erwartet dafür etwas, das sich nicht bezahlen lässt.', en: 'But: expects something in return that money cannot cover.' },
  { de: 'Aber: hat bereits bei einer anderen Partei unterschrieben.', en: 'But: has already signed with another party.' },
  { de: 'Aber: hält die Gruppe für den eigentlichen Feind.', en: 'But: considers the party to be the real enemy.' },
  { de: 'Aber: wird die Sache bei erster Gelegenheit wenden.', en: 'But: will turn on it at the first opportunity.' },
  { de: 'Aber: erinnert sich an den entscheidenden Abend nicht.', en: 'But: does not remember the decisive evening.' },
  { de: 'Aber: tut das Richtige immer einen Tag zu spät.', en: 'But: always does the right thing a day late.' },
  { de: 'Aber: ist abgereist, sobald man es braucht.', en: 'But: will have left by the time it matters.' },
  { de: 'Aber: kann nicht schweigen, auch mit bestem Vorsatz.', en: 'But: cannot keep quiet, however good the intention.' },
  { de: 'Aber: wird für etwas gesucht, das nichts damit zu tun hat.', en: 'But: is wanted for something unrelated.' },
  { de: 'Aber: nimmt Geld an, von jedem.', en: 'But: takes money, from anyone.' },
  { de: 'Aber: hat der Gegenseite dasselbe versprochen.', en: 'But: promised the other side the same thing.' },
  { de: 'Aber: wird krank, sobald es ernst wird.', en: 'But: falls ill the moment it gets serious.' },
  { de: 'Aber: hat eine zweite Familie, an einem anderen Ort.', en: 'But: has a second family, elsewhere.' },
  { de: 'Aber: hasst genau die Fraktion, die man jetzt braucht.', en: 'But: hates exactly the faction that is needed now.' },
  { de: 'Aber: schreibt alles auf, und das Buch liegt nicht sicher.', en: 'But: writes it all down, and the book is not safe.' },
  { de: 'Aber: hat zuletzt gelogen, ohne jeden Grund.', en: 'But: lied last time, for no reason at all.' },
  { de: 'Aber: erträgt es nicht, im Unrecht zu sein.', en: 'But: cannot bear being in the wrong.' },
  { de: 'Aber: handelt nur, wenn ein Dritter zusieht.', en: 'But: only acts when a third party is watching.' }
];
