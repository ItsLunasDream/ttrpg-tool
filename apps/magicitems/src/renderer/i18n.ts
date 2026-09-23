/**
 * Die Texte des Magic Item Creators. Paarweise `[de, en]` wie in den
 * anderen Werkzeugen.
 */
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';

const TEXTE = {
  titel: ['Magic Item Creator', 'Magic Item Creator'],
  untertitel: [
    'Magische Gegenstände würfeln, anpassen und ablegen.',
    'Roll, adjust and store magic items.'
  ],
  'liste.leer': ['Noch keine Gegenstände.', 'No items yet.'],
  'liste.anzahl': ['{anzahl} Gegenstände', '{anzahl} items'],
  'liste.eine': ['1 Gegenstand', '1 item'],
  'liste.nichts': ['Nichts gefunden.', 'Nothing found.'],
  'liste.suche': ['Suchen', 'Search'],
  'erzeuger.art': ['Art', 'Type'],
  'erzeuger.seltenheit': ['Seltenheit', 'Rarity'],
  'erzeuger.zufall': ['Zufällig', 'Random'],
  'erzeuger.los': ['Würfeln', 'Roll'],
  'erzeuger.fluch': ['Fluch möglich', 'Curse possible'],
  leer: ['Leerer Gegenstand', 'Blank item'],
  speichern: ['Speichern', 'Save'],
  gespeichert: ['Gespeichert.', 'Saved.'],
  loeschen: ['Löschen', 'Delete'],
  'loeschen.sicher': ['„{name}" wirklich löschen?', 'Really delete “{name}”?'],
  zurueck: ['Zurück zur Liste', 'Back to the list'],
  nochmal: ['Neu würfeln', 'Reroll'],
  'feld.name': ['Name', 'Name'],
  'feld.einstimmung': ['Erfordert Einstimmung', 'Requires attunement'],
  'feld.wirkungen': ['Wirkungen', 'Properties'],
  'feld.wirkungDazu': ['Wirkung', 'Property'],
  'feld.wirkungWeg': ['Wirkung entfernen', 'Remove property'],
  'feld.wirkungNeu': ['Diese Wirkung neu würfeln', 'Reroll this property'],
  'feld.wirkungWuerfeln': ['Wirkung würfeln', 'Roll a property'],
  'feld.fluchWuerfeln': ['Fluch würfeln', 'Roll a curse'],
  'feld.fluchNeu': ['Fluch neu würfeln', 'Reroll curse'],
  'feld.fluch': ['Fluch', 'Curse'],
  'feld.fluchHinweis': ['Leer lassen, wenn der Gegenstand nicht verflucht ist.', 'Leave empty if the item is not cursed.'],
  'feld.notiz': ['Notiz', 'Note'],
  'feld.wert': ['Wert: {wert} GM', 'Value: {wert} GP'],
  'wert.hinweis': [
    'Nach der Tabelle „Seltenheit und Wert" des SRD 5.2.1; Tränke und Schriftrollen verbrauchen sich.',
    'From the SRD 5.2.1 “Magic Item Rarities and Values” table; potions and scrolls are consumables.'
  ],
  anpassen: ['Wirkungen für „{seltenheit}" neu würfeln', 'Reroll properties for “{seltenheit}”'],
  'anpassen.sicher': [
    'Die Wirkungen werden durch neu gewürfelte ersetzt. Name, Fluch und Notiz bleiben.',
    'The properties will be replaced by newly rolled ones. Name, curse and note stay.'
  ],
  foundry: ['Als JSON exportieren', 'Export as JSON'],
  'foundry.fertig': ['Als JSON gespeichert: {pfad}', 'Saved as JSON: {pfad}'],
  loot: ['An den Loot Generator', 'Send to Loot Generator'],
  'loot.drin': ['Im Loot Generator ✓', 'In Loot Generator ✓'],
  'loot.fertig': ['Steht jetzt im Loot Generator.', 'Now in the Loot Generator.'],
  'loot.fehler': ['Konnte nicht an den Loot Generator geben.', 'Could not send to the Loot Generator.'],
  einstimmung: ['Einstimmung', 'Attunement'],
  verflucht: ['verflucht', 'cursed'],
  'fehler.speichern': ['Konnte nicht speichern: {detail}', 'Could not save: {detail}'],
  'fehler.lesen': ['Dieser Gegenstand ließ sich nicht öffnen.', 'This item could not be opened.']
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
