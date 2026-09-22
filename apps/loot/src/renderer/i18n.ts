/**
 * Die Texte des Loot Generators. Paarweise `[de, en]` wie in den anderen
 * Werkzeugen. Nur die Oberflaeche: die Tabellen selbst werden nicht
 * uebersetzt (siehe docs/loot.md).
 */
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';

const TEXTE = {
  titel: ['Loot Generator', 'Loot Generator'],
  untertitel: [
    'Eigene Zufallstabellen schreiben, verschachteln und würfeln.',
    'Write, nest and roll your own random tables.'
  ],
  'liste.leer': ['Noch keine Tabellen.', 'No tables yet.'],
  'liste.anzahl': ['{anzahl} Tabellen', '{anzahl} tables'],
  'liste.eine': ['1 Tabelle', '1 table'],
  'liste.nichts': ['Nichts gefunden.', 'Nothing found.'],
  'liste.suche': ['Suchen', 'Search'],
  neu: ['Neue Tabelle', 'New table'],
  'neu.name': ['Tabelle', 'Table'],
  einlesen: ['Einlesen', 'Import'],
  'einlesen.fertig': ['Eingelesen: {namen}', 'Imported: {namen}'],
  'einlesen.nichts': ['Keine Tabelle in der Datei gefunden.', 'No table found in the file.'],
  weitergeben: ['Weitergeben', 'Share'],
  'weitergeben.fertig': ['Gespeichert unter {pfad}', 'Saved to {pfad}'],
  'weitergeben.erst': ['Erst speichern, dann weitergeben.', 'Save first, then share.'],
  speichern: ['Speichern', 'Save'],
  gespeichert: ['Gespeichert.', 'Saved.'],
  loeschen: ['Löschen', 'Delete'],
  'loeschen.sicher': ['„{name}" wirklich löschen?', 'Really delete “{name}”?'],
  'verwerfen.sicher': ['Ungespeicherte Änderungen verwerfen?', 'Discard unsaved changes?'],
  zurueck: ['Zurück zur Liste', 'Back to the list'],
  wuerfeln: ['Würfeln', 'Roll'],
  schnell: ['Einmal würfeln', 'Roll once'],
  'wurf.anzahl': ['Anzahl', 'Count'],
  'wurf.leer': ['Diese Tabelle hat noch keine Einträge.', 'This table has no entries yet.'],
  'wurf.herkunft': ['Woher', 'Where from'],
  'wurf.kopieren': ['Kopieren', 'Copy'],
  'wurf.kopiert': ['Kopiert.', 'Copied.'],
  'wurf.letzter': ['Letzter Wurf', 'Last roll'],
  'wurf.unvollstaendig': ['Nicht alles ließ sich auflösen, siehe „Woher".', 'Not everything could be resolved, see “Where from”.'],
  'baum.fehlt': ['„{name}" gibt es nicht', '“{name}” does not exist'],
  'baum.zutief': ['„{name}": zu tief verschachtelt, hier abgebrochen', '“{name}”: nested too deeply, stopped here'],
  'feld.name': ['Name', 'Name'],
  'feld.wuerfel': ['Würfel', 'Die'],
  'feld.wuerfelHinweis': ['z. B. 1d6 oder 1W100, leer = alle gleich', 'e.g. 1d6 or 1d100, empty = all equal'],
  'feld.ohneZuruecklegen': ['Ohne Zurücklegen', 'Without replacement'],
  'feld.ohneZuruecklegenHinweis': [
    'Bei mehreren Würfen kommt kein Eintrag doppelt, bis alle dran waren.',
    'When rolling several times, no entry repeats until all have come up.'
  ],
  'feld.eintraege': ['Einträge', 'Entries'],
  'feld.eintraegeHinweis': [
    'Eine Zeile je Eintrag. Spanne davor, wenn die Tabelle einen Würfel hat: „1-3: 2d6 × 10 Kupfer". Andere Tabelle in eckigen Klammern: „[Taschenkram]". Würfel im Text werden ausgerechnet.',
    'One line per entry. Put a range in front if the table has a die: “1-3: 2d6 × 10 copper”. Another table in square brackets: “[Pocket Junk]”. Dice in the text are rolled.'
  ],
  'feld.notiz': ['Notiz', 'Note'],
  'kachel.eintraege': ['{anzahl} Einträge', '{anzahl} entries'],
  'kachel.ohneZuruecklegen': ['ohne Zurücklegen', 'without replacement'],
  'kachel.gleich': ['gleich verteilt', 'equal odds'],
  'befund.wuerfel-unlesbar': ['„{wuerfel}" ist kein Würfel, den das Werkzeug lesen kann.', '“{wuerfel}” is not a die the tool can read.'],
  'befund.spannen-ohne-wuerfel': [
    'Einträge haben Spannen, die Tabelle aber keinen Würfel: alle Einträge sind gleich wahrscheinlich.',
    'Entries have ranges but the table has no die: all entries are equally likely.'
  ],
  'befund.wuerfel-ohne-spannen': [
    'Die Tabelle hat einen Würfel, die Einträge aber keine Spannen: alle Einträge sind gleich wahrscheinlich.',
    'The table has a die but the entries have no ranges: all entries are equally likely.'
  ],
  'befund.luecke': ['Lücke {von}–{bis}: dort nimmt der Wurf den Eintrag darunter.', 'Gap {von}–{bis}: rolls there take the entry below.'],
  'befund.luecke1': ['Lücke bei {von}: dort nimmt der Wurf den Eintrag darunter.', 'Gap at {von}: rolls there take the entry below.'],
  'befund.doppelt': ['Die {zahl} steht in zwei Spannen; der erste Eintrag gewinnt.', '{zahl} is in two ranges; the first entry wins.'],
  'befund.ausserhalb': ['Die {zahl} kann der Würfel nicht zeigen.', 'The die cannot show {zahl}.'],
  'befund.verweis-fehlt': ['„[{name}]" zeigt auf keine Tabelle.', '“[{name}]” points to no table.'],
  'befund.verweis-selbst': [
    'Die Tabelle verweist auf sich selbst; nach zehn Ebenen bricht der Wurf ab.',
    'The table refers to itself; a roll stops after ten levels.'
  ],
  'fehler.speichern': ['Konnte nicht speichern: {detail}', 'Could not save: {detail}'],
  'fehler.lesen': ['Diese Tabelle ließ sich nicht öffnen.', 'This table could not be opened.']
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
