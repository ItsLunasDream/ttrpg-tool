/**
 * Verbindungen zwischen zwei Figuren.
 *
 * Gerichtet, wie die Beziehungen im Story Creator: A sieht B als
 * Mentorin, B sieht A als Bedrohung. Genau darin liegt der Reiz — eine
 * Beziehung, die beide gleich sehen, ist eine Angabe; eine, die jeder anders
 * sieht, ist eine Szene.
 *
 * `{a}` und `{b}` sind die Namen. Die Muster sind so gebaut, dass beide
 * Namen im Nominativ stehen und nur am Satzanfang oder nach einem Komma
 * auftauchen. Sonst muesste jedes Muster wissen, ob es „dem Halvard" oder
 * „der Mara" heisst.
 */
import type { Eintrag, Paar } from './tabellen';

export interface Muster extends Eintrag {
  /** Wie die erste Figur die zweite sieht. */
  readonly hin: Paar;
  /** Und wie die zweite die erste. */
  readonly zurueck: Paar;
}

export const PLATZ_A = '{a}';
export const PLATZ_B = '{b}';

/** Setzt die Namen in ein Muster ein. */
export function fuelle(muster: string, a: string, b: string): string {
  return muster.split(PLATZ_A).join(a).split(PLATZ_B).join(b);
}

export const VERBINDUNGEN: readonly Muster[] = [
  {
    de: 'Gemeinsame Schuld', en: 'Shared guilt', themen: ['schuld'],
    hin: { de: '{a} war dabei und hat geschwiegen.', en: '{a} was there and said nothing.' },
    zurueck: { de: '{b} hält {a} für die einzige Person, die reden könnte.', en: '{b} sees {a} as the one person who could still talk.' }
  },
  {
    de: 'Lehre', en: 'Apprenticeship',
    hin: { de: '{a} hat {b} alles beigebracht und den letzten Handgriff ausgelassen.', en: '{a} taught {b} everything and left out the last trick.' },
    zurueck: { de: '{b} ist längst besser und wartet darauf, dass es jemand sagt.', en: '{b} is long since better, and is waiting for someone to say so.' }
  },
  {
    de: 'Familie über Bande', en: 'Family by a side door', themen: ['erbe'],
    hin: { de: '{a} und {b} haben denselben Vater, und beide wissen es.', en: '{a} and {b} share a father, and both know it.' },
    zurueck: { de: '{b} hat {a} bislang aus jedem Papier herausgehalten.', en: '{b} has so far kept {a} out of every document.' }
  },
  {
    de: 'Alte Rechnung', en: 'Old score', themen: ['rache'],
    hin: { de: '{a} wartet seit Jahren auf den richtigen Moment für {b}.', en: '{a} has waited years for the right moment with {b}.' },
    zurueck: { de: '{b} hat die Sache vergessen — wirklich vergessen.', en: '{b} has forgotten the whole thing, genuinely.' }
  },
  {
    de: 'Gerettet', en: 'A life owed',
    hin: { de: '{a} hat {b} aus dem Wasser gezogen und erinnert zu oft daran.', en: '{a} pulled {b} out of the water and brings it up too often.' },
    zurueck: { de: '{b} wäre lieber ertrunken als so verpflichtet.', en: '{b} would rather have drowned than be this indebted.' }
  },
  {
    de: 'Geld', en: 'Money', themen: ['gier'],
    hin: { de: '{a} hat {b} Geld geliehen, das nie zurückkam.', en: '{a} lent {b} money that never came back.' },
    zurueck: { de: '{b} zahlt lieber mit Gefallen als mit Münzen.', en: '{b} would rather pay in favours than coin.' }
  },
  {
    de: 'Verlobung, die nicht wurde', en: 'A betrothal that fell through',
    hin: { de: '{a} sollte {b} heiraten, bis etwas dazwischenkam.', en: '{a} was to marry {b}, until something got in the way.' },
    zurueck: { de: '{b} hält bis heute die falsche Person für schuld.', en: '{b} still blames the wrong person for it.' }
  },
  {
    de: 'Dienstverhältnis', en: 'Service',
    hin: { de: '{a} arbeitet für {b} und weiß mehr als vorgesehen.', en: '{a} works for {b} and knows more than intended.' },
    zurueck: { de: '{b} hält {a} für loyal und unbedeutend.', en: '{b} takes {a} for loyal and insignificant.' }
  },
  {
    de: 'Zwei Seiten derselben Sache', en: 'Two sides of one thing', themen: ['verrat'],
    hin: { de: '{a} liefert an die eine Partei, {b} an die andere.', en: '{a} supplies one party, {b} the other.' },
    zurueck: { de: '{b} weiß das und hat es noch niemandem gesagt.', en: '{b} knows, and has told nobody.' }
  },
  {
    de: 'Gemeinsames Geheimnis', en: 'A shared secret',
    hin: { de: '{a} und {b} haben denselben Fund verschwiegen — {a} aus Angst.', en: '{a} and {b} concealed the same find; {a} out of fear.' },
    zurueck: { de: '{b} verschweigt ihn aus Berechnung.', en: '{b} conceals it out of calculation.' }
  },
  {
    de: 'Glaube', en: 'Faith', themen: ['glaube'],
    hin: { de: '{a} hält {b} für ein Zeichen und richtet sich danach.', en: '{a} takes {b} for a sign and lives by it.' },
    zurueck: { de: '{b} findet das unangenehm und nutzt es trotzdem.', en: '{b} finds it uncomfortable and uses it anyway.' }
  },
  {
    de: 'Rivalität im Handwerk', en: 'Rivalry in the trade',
    hin: { de: '{a} bekommt die Aufträge, die {b} verdient hätte.', en: '{a} gets the work {b} deserved.' },
    zurueck: { de: '{b} hat die bessere Hand und die schlechteren Manieren.', en: '{b} has the better hand and the worse manners.' }
  },
  {
    de: 'Zeugenschaft', en: 'Testimony', themen: ['schuld'],
    hin: { de: '{a} hat gegen {b} ausgesagt, und zwar die Wahrheit.', en: '{a} testified against {b}, and told the truth.' },
    zurueck: { de: '{b} sieht in {a} den Grund für sechs verlorene Jahre.', en: '{b} sees in {a} the cause of six lost years.' }
  },
  {
    de: 'Fremde Kinder', en: 'Other people’s children',
    hin: { de: '{a} zieht das Kind von {b} groß, ohne dass jemand fragt.', en: '{a} is raising {b}’s child, and nobody asks.' },
    zurueck: { de: '{b} schickt Geld und kommt nie.', en: '{b} sends money and never visits.' }
  },
  {
    de: 'Brieffreundschaft', en: 'Letters', tonfall: ['heiter'],
    hin: { de: '{a} schreibt {b} seit Jahren, ohne sich je gezeigt zu haben.', en: '{a} has written to {b} for years without ever appearing.' },
    zurueck: { de: '{b} hat sich ein Bild gemacht, das nicht stimmt.', en: '{b} has formed a picture that is wrong.' }
  },
  {
    de: 'Dieselbe Herkunft', en: 'Same origin',
    hin: { de: '{a} stammt aus demselben abgebrannten Ort wie {b}.', en: '{a} comes from the same burned-out place as {b}.' },
    zurueck: { de: '{b} bestreitet das, sobald jemand zuhört.', en: '{b} denies it the moment anyone listens.' }
  },
  {
    de: 'Erpressung', en: 'Leverage',
    hin: { de: '{a} hält einen Brief in der Hand, der {b} ruinieren würde.', en: '{a} holds a letter that would ruin {b}.' },
    zurueck: { de: '{b} hat noch nicht herausgefunden, wer ihn hat.', en: '{b} has not yet worked out who holds it.' }
  },
  {
    de: 'Vertretung', en: 'Standing in',
    hin: { de: '{a} führt die Geschäfte, solange {b} nicht kann.', en: '{a} runs the business while {b} cannot.' },
    zurueck: { de: '{b} kann längst wieder und sagt es nicht.', en: '{b} has long been able to, and says nothing.' }
  },
  {
    de: 'Heilung', en: 'A cure', themen: ['seuche'],
    hin: { de: '{a} hat {b} gepflegt, als es sonst niemand tat.', en: '{a} nursed {b} when nobody else would.' },
    zurueck: { de: '{b} erinnert sich anders und ist überzeugt davon.', en: '{b} remembers it differently, and is certain.' }
  },
  {
    de: 'Gemeinsamer Feind', en: 'A common enemy',
    hin: { de: '{a} braucht {b}, solange der Dritte im Spiel ist.', en: '{a} needs {b} while the third party is in play.' },
    zurueck: { de: '{b} plant schon, was danach kommt.', en: '{b} is already planning for afterwards.' }
  },
  {
    de: 'Schriftverkehr', en: 'The paperwork', themen: ['wissen'],
    hin: { de: '{a} hat die Unterschrift von {b} gefälscht, damals, aus Not.', en: '{a} forged {b}’s signature, back then, out of need.' },
    zurueck: { de: '{b} hat es bemerkt und nichts unternommen.', en: '{b} noticed and did nothing.' }
  },
  {
    de: 'Ein Grab', en: 'One grave',
    hin: { de: '{a} und {b} haben dieselbe Person begraben, an verschiedenen Tagen.', en: '{a} and {b} buried the same person, on different days.' },
    zurueck: { de: '{b} weiß nicht, dass {a} überhaupt dort war.', en: '{b} does not know {a} was ever there.' }
  },
  {
    de: 'Nachfolge', en: 'Succession', themen: ['aufstieg'],
    hin: { de: '{a} ist als Nachfolge vorgesehen und will nicht.', en: '{a} is named as successor and does not want it.' },
    zurueck: { de: '{b} will es sehr und wird übergangen.', en: '{b} wants it badly and is being passed over.' }
  },
  {
    de: 'Verpfändet', en: 'Pawned',
    hin: { de: '{a} hat etwas von {b} verpfändet, ohne zu fragen.', en: '{a} pawned something of {b}’s without asking.' },
    zurueck: { de: '{b} sucht es seit Monaten im eigenen Haus.', en: '{b} has been searching the house for it for months.' }
  },
  {
    de: 'Doppelte Loyalität', en: 'Double loyalty', themen: ['verrat'],
    hin: { de: '{a} berichtet über {b} an jemanden, den beide kennen.', en: '{a} reports on {b} to someone they both know.' },
    zurueck: { de: '{b} vertraut {a} mehr als der eigenen Familie.', en: '{b} trusts {a} more than family.' }
  },
  {
    de: 'Krieg', en: 'The war', themen: ['krieg'],
    hin: { de: '{a} hat im Feld auf der Seite gestanden, die {b} verloren hat.', en: '{a} stood in the field on the side {b} lost to.' },
    zurueck: { de: '{b} erkennt {a} nicht wieder, noch nicht.', en: '{b} does not recognise {a}, not yet.' }
  },
  {
    de: 'Ein Versprechen', en: 'A promise', themen: ['erloesung'],
    hin: { de: '{a} hat {b} etwas versprochen, das sich nicht halten lässt.', en: '{a} promised {b} something that cannot be kept.' },
    zurueck: { de: '{b} richtet das ganze Leben danach ein.', en: '{b} is arranging an entire life around it.' }
  },
  {
    de: 'Nachbarschaft', en: 'Neighbours', tonfall: ['bodenstaendig'],
    hin: { de: '{a} und {b} streiten seit acht Jahren um dieselbe Mauer.', en: '{a} and {b} have argued over the same wall for eight years.' },
    zurueck: { de: '{b} hat recht und wird es nie beweisen können.', en: '{b} is in the right and will never prove it.' }
  },
  {
    de: 'Der gleiche Traum', en: 'The same dream', tonfall: ['geheimnisvoll'],
    hin: { de: '{a} träumt seit dem Frühjahr von einem Ort, den {b} kennt.', en: '{a} has dreamed since spring of a place {b} knows.' },
    zurueck: { de: '{b} war dort und spricht nicht darüber.', en: '{b} has been there and does not speak of it.' }
  },
  {
    de: 'Geschäftspartner', en: 'Partners', themen: ['gier'],
    hin: { de: '{a} hält die Hälfte an einem Geschäft von {b}.', en: '{a} holds half a share in a business of {b}’s.' },
    zurueck: { de: '{b} führt zwei Bücher, eines davon für {a}.', en: '{b} keeps two sets of books, one of them for {a}.' }
  },
  {
    de: 'Aufgenommen', en: 'Taken in',
    hin: { de: '{a} hat {b} als Kind bei sich aufgenommen.', en: '{a} took {b} in as a child.' },
    zurueck: { de: '{b} hat erst später erfahren, warum.', en: '{b} only learned later why.' }
  },
  {
    de: 'Zwei Namen', en: 'Two names', themen: ['verrat'],
    hin: { de: '{a} kennt {b} unter einem anderen Namen als alle anderen.', en: '{a} knows {b} by a different name than everyone else.' },
    zurueck: { de: '{b} hofft, dass es dabei bleibt.', en: '{b} hopes it stays that way.' }
  },
  {
    de: 'Der gleiche Fehler', en: 'The same mistake', themen: ['schuld'],
    hin: { de: '{a} hat denselben Fehler gemacht wie {b}, nur früher.', en: '{a} made the same mistake as {b}, only earlier.' },
    zurueck: { de: '{b} weiß nichts davon und hält {a} für unfehlbar.', en: '{b} knows nothing of it and takes {a} for infallible.' }
  },
  {
    de: 'Auftrag auf die andere', en: 'Contract on the other', tonfall: ['duester'],
    hin: { de: '{a} hat den Auftrag, {b} nicht aus den Augen zu lassen.', en: '{a} is under orders never to let {b} out of sight.' },
    zurueck: { de: '{b} hält das für Freundschaft.', en: '{b} takes it for friendship.' }
  }
];
