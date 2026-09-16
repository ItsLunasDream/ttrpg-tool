/**
 * Die Texte des Monster Creators.
 *
 * Paarweise `[de, en]` wie im Karteneditor und in der Inspirationshilfe:
 * zwei getrennte Woerterbuecher laufen auseinander.
 */
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';

const TEXTE = {
  'titel': ['Monster Creator', 'Monster Creator'],
  'untertitel': [
    'Homebrew-Monster zu einem vorgegebenen Grad — und jede Zahl wird nachgerechnet.',
    'Homebrew monsters at a rating you choose — and every number gets checked.'
  ],

  'reiter.bauen': ['Bauen', 'Build'],
  'reiter.sammlung': ['Sammlung', 'Collection'],
  'reiter.pruefen': ['Prüfen', 'Check'],

  'feld.cr': ['Herausforderungsgrad', 'Challenge rating'],
  'feld.thema': ['Art', 'Type'],
  'feld.rolle': ['Rolle im Kampf', 'Combat role'],
  'feld.legendaer': ['Legendäre Aktionen', 'Legendary actions'],
  'feld.beliebig': ['beliebig', 'any'],

  'knopf.wuerfeln': ['Würfeln', 'Roll'],
  'knopf.ki': ['Von der KI', 'From the AI'],
  'knopf.kiLaeuft': ['Fragt …', 'Asking …'],
  'knopf.speichern': ['In die Sammlung', 'To the collection'],
  'knopf.export': ['In den Story Creator', 'To the Story Creator'],
  'knopf.variante': ['Variante anlegen', 'Create variant'],
  'knopf.neuerName': ['Neuer Name', 'New name'],
  'knopf.neueFaehigkeiten': ['Neue Fähigkeiten', 'New features'],
  'knopf.neueWerte': ['Werte neu', 'Reroll numbers'],
  'knopf.zurueckZurKi': ['Zurück zum Vorschlag der KI', 'Back to the AI’s suggestion'],
  'knopf.uebernehmen': ['Übernehmen', 'Apply'],
  'knopf.loeschen': ['Löschen', 'Delete'],

  'werte.tp': ['Trefferpunkte', 'Hit points'],
  'werte.rk': ['Rüstungsklasse', 'Armor class'],
  'werte.schaden': ['Schaden pro Runde', 'Damage per round'],
  'werte.bonus': ['Angriffsbonus', 'Attack bonus'],
  'werte.angriffe': ['Angriffe', 'Attacks'],

  'befund.passt': ['Passt', 'On target'],
  'befund.zuStark': ['Zu stark', 'Too strong'],
  'befund.zuSchwach': ['Zu schwach', 'Too weak'],
  'befund.gerechnet': ['Gerechnet: Grad {cr}', 'Computed: CR {cr}'],
  'befund.eingestellt': ['Eingestellt: Grad {cr}', 'Set: CR {cr}'],
  'befund.verteidigung': ['Verteidigung', 'Defence'],
  'befund.angriff': ['Angriff', 'Offence'],
  'befund.empfohlen': ['Empfohlen: {von}–{bis}', 'Recommended: {von}–{bis}'],
  'befund.vorschlaege': ['Das lässt sich drehen:', 'Here is what you can turn:'],

  'grund.tpZuHoch': ['Trefferpunkte zu hoch', 'Hit points too high'],
  'grund.tpZuNiedrig': ['Trefferpunkte zu niedrig', 'Hit points too low'],
  'grund.schadenZuHoch': ['Schaden zu hoch', 'Damage too high'],
  'grund.schadenZuNiedrig': ['Schaden zu niedrig', 'Damage too low'],
  'grund.rkDaneben': ['Rüstungsklasse weit daneben', 'Armor class far off'],
  'grund.bonusDaneben': ['Angriffsbonus weit daneben', 'Attack bonus far off'],
  'vorschlag.setzen': ['{feld} auf {wert} setzen', 'Set {feld} to {wert}'],

  'ki.berichtigt': [
    'Die KI lag daneben. Die Zahlen wurden auf Grad {cr} gezogen.',
    'The AI was off. The numbers were pulled to CR {cr}.'
  ],
  'ki.aenderung': ['{feld}: {von} → {auf}', '{feld}: {von} → {auf}'],
  'ki.aus': [
    'Keine KI eingerichtet. Die Tabellen können alles ohne sie.',
    'No AI set up. The tables do all of this without one.'
  ],

  'sammlung.suche': ['Suchen: Name, Art, Grad …', 'Search: name, type, rating …'],
  'sammlung.sucheHinweis': [
    'Ein Feld für alles: „untot" sucht die Art, „4" den Grad, „untot 4" beides.',
    'One field for everything: “undead” finds the type, “4” the rating, “undead 4” both.'
  ],
  'sammlung.leer': [
    'Noch nichts gebaut. Was du speicherst, steht hier.',
    'Nothing built yet. What you save shows up here.'
  ],
  'sammlung.nichts': ['Nichts gefunden.', 'Nothing found.'],
  'sammlung.anzahl': ['{anzahl} Monster', '{anzahl} monsters'],
  'sammlung.kacheln': ['Kacheln', 'Tiles'],
  'sammlung.liste': ['Liste', 'List'],
  'sammlung.sortieren': ['Sortieren', 'Sort'],
  'sammlung.nachCr': ['nach Grad', 'by rating'],
  'sammlung.nachName': ['nach Name', 'by name'],
  'sammlung.nachDatum': ['zuletzt geändert', 'last changed'],

  'pruefen.hinweis': [
    'Zahlen eintragen und nachrechnen lassen — für Monster aus Büchern, aus dem Netz oder von früher.',
    'Enter numbers and have them checked — for monsters from books, from the web, or from before.'
  ],

  'meldung.gespeichert': ['„{name}" liegt in der Sammlung.', '“{name}” is in the collection.'],
  'meldung.exportiert': ['„{name}" liegt als Notiz im Story Creator.', '“{name}” is a note in the Story Creator.'],
  'meldung.fehler': ['Das ging nicht: {detail}', 'That did not work: {detail}'],
  'meldung.geloescht': ['„{name}" ist gelöscht.', '“{name}” is deleted.'],

  'fehler.kiKeinAnbieter': ['Es ist keine KI eingerichtet.', 'No AI is set up.'],
  'fehler.kiKeinJson': ['Die Antwort war nicht lesbar.', 'The answer could not be read.'],
  'error.aiOther': ['Die KI meldet einen Fehler.', 'The AI reports an error.'],
  'error.aiNoConnection': ['Keine Verbindung zur KI.', 'No connection to the AI.'],
  'error.aiTimeout': ['Die KI antwortet nicht.', 'The AI is not answering.'],
  'error.aiAuth': ['Der API-Schlüssel wird nicht akzeptiert.', 'The API key is not accepted.'],
  'error.aiRateLimit': ['Zu viele Anfragen. Gleich noch einmal.', 'Too many requests. Try again shortly.']
} as const;

export type TextKey = keyof typeof TEXTE;

let sprache: Language = DEFAULT_LANGUAGE;

export function setLanguage(neu: Language): void {
  sprache = neu;
}

export function getLanguage(): Language {
  return sprache;
}

export function t(key: TextKey, params?: Record<string, string | number>): string {
  const paar = TEXTE[key];
  let text: string = sprache === 'de' ? paar[0] : paar[1];
  if (params) {
    for (const [name, wert] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(wert));
    }
  }
  return text;
}
