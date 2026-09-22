/**
 * Die Texte des Encounter Creators.
 *
 * Paarweise `[de, en]` wie in den anderen Werkzeugen: zwei getrennte
 * Woerterbuecher laufen auseinander.
 */
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';

const TEXTE = {
  titel: ['Encounter Creator', 'Encounter Creator'],
  untertitel: [
    'Begegnungen zusammenstellen — und in einem Zug in den Tracker schieben.',
    'Put an encounter together — and push it into the tracker in one go.'
  ],

  'liste.leer': [
    'Noch keine Begegnung. Leg eine an, gib ihr einen Namen, und füll sie danach.',
    'No encounters yet. Create one, give it a name, and fill it afterwards.'
  ],
  'liste.anzahl': ['{anzahl} Begegnungen', '{anzahl} encounters'],
  'liste.eine': ['1 Begegnung', '1 encounter'],
  'liste.nichts': [
    'Nichts gefunden. Gesucht wird im Namen und in den Gegnern.',
    'Nothing found. The search covers names and the creatures in them.'
  ],
  'liste.suche': ['Suchen', 'Search'],
  'liste.sortieren': ['Sortieren', 'Sort'],
  'liste.nachDatum': ['Zuletzt geändert', 'Last changed'],
  'liste.nachName': ['Nach Name', 'By name'],
  'liste.nachGegnern': ['Nach Gegnerzahl', 'By creature count'],

  neu: ['Neue Begegnung', 'New encounter'],
  'neu.name': ['Wie soll sie heißen?', 'What should it be called?'],
  'neu.platzhalter': ['Hinterhalt am Fluss', 'Ambush at the river'],
  'neu.anlegen': ['Anlegen', 'Create'],
  abbrechen: ['Abbrechen', 'Cancel'],
  speichern: ['Speichern', 'Save'],
  gespeichert: ['Gespeichert.', 'Saved.'],
  loeschen: ['Löschen', 'Delete'],
  'loeschen.sicher': [
    '„{name}" wirklich löschen? Das lässt sich nicht rückgängig machen.',
    'Really delete “{name}”? This cannot be undone.'
  ],
  zurueck: ['Zurück zur Liste', 'Back to the list'],

  'feld.name': ['Name', 'Name'],
  'feld.notiz': ['Notiz', 'Note'],
  'feld.notizHinweis': [
    'Taktik, Vorlesetext, was sonst dazugehört. Bleibt beim Speichern erhalten.',
    'Tactics, read-aloud text, whatever else belongs. Kept when you save.'
  ],

  'gegner.keine': [
    'Noch keine Gegner. Such dir unten welche aus deiner Monstersammlung.',
    'No creatures yet. Pick some from your monster collection below.'
  ],
  'gegner.zahl': ['{anzahl} Wesen', '{anzahl} creatures'],
  'gegner.titel': ['Gegner', 'Creatures'],
  'gegner.weg': ['Entfernen', 'Remove'],
  'gegner.fehlt': [
    'Dieses Monster gibt es nicht mehr.',
    'This monster no longer exists.'
  ],
  'gegner.fehltKurz': ['fehlt', 'missing'],

  'monster.titel': ['Aus deiner Sammlung', 'From your collection'],
  'monster.suche': ['Monster suchen', 'Search monsters'],
  'monster.leer': [
    'Im Monster Creator liegt noch nichts. Bau dir eines, dann steht es hier.',
    'Nothing in the Monster Creator yet. Build one and it shows up here.'
  ],
  'monster.nichts': ['Kein Monster passt dazu.', 'No monster matches that.'],
  'monster.dazu': ['Dazu', 'Add'],
  'monster.grad': ['Grad {cr}', 'CR {cr}'],
  'monster.werte': ['{tp} TP · RK {rk}', '{tp} HP · AC {rk}'],

  'fehler.speichern': ['Konnte nicht speichern: {detail}', 'Could not save: {detail}'],
  'fehler.lesen': [
    'Diese Begegnung ließ sich nicht öffnen.',
    'This encounter could not be opened.'
  ]
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
