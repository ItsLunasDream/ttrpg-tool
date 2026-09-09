/**
 * Texte des Trackers, Deutsch und Englisch paarweise.
 *
 * Dasselbe Vorgehen wie im Karteneditor: `[de, en]` in einer Tabelle, weil
 * zwei getrennte Woerterbuecher auseinanderlaufen. Ein Test prueft, dass
 * beide Seiten vollstaendig sind.
 */
export const LANGUAGES = ['de', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const texte = {
  'app.title': ['Initiative', 'Initiative'],
  'leer.titel': ['Noch keine Begegnung', 'No encounter yet'],
  'leer.text': [
    'Lege Teilnehmer an oder oeffne eine gespeicherte Begegnung.',
    'Add participants or open a saved encounter.'
  ],
  'knopf.neu': ['Teilnehmer', 'Participant'],
  'knopf.beginnen': ['Kampf beginnen', 'Start combat'],
  'knopf.beenden': ['Kampf beenden', 'End combat'],
  'knopf.weiter': ['Weiter', 'Next'],
  'knopf.wuerfeln': ['Initiative wuerfeln', 'Roll initiative'],
  'knopf.duplizieren': ['Duplizieren', 'Duplicate'],
  'knopf.entfernen': ['Entfernen', 'Remove'],
  'knopf.speichern': ['Begegnung speichern', 'Save encounter'],
  'knopf.oeffnen': ['Oeffnen', 'Open'],
  'knopf.bild': ['Bild waehlen', 'Choose image'],
  'knopf.bildAendern': ['Bild aendern', 'Change image'],
  'knopf.bildWeg': ['Bild entfernen', 'Remove image'],
  'knopf.zustand': ['Zustand', 'Condition'],
  'feld.name': ['Name', 'Name'],
  'feld.initiative': ['Ini', 'Init'],
  'feld.feinwert': ['Feinwert', 'Tiebreak'],
  'feld.hp': ['TP', 'HP'],
  'feld.hpMax': ['TP max', 'HP max'],
  'feld.tempHp': ['Temp', 'Temp'],
  'feld.anzahl': ['Anzahl', 'Count'],
  'feld.spieler': ['Spielerfigur', 'Player character'],
  'feld.notiz': ['Notiz', 'Note'],
  'feld.taktik': ['Taktik und Notizen', 'Tactics and notes'],
  'feld.runden': ['Runden', 'Rounds'],
  'runde': ['Runde {n}', 'Round {n}'],
  'amZug': ['Am Zug', 'Active'],
  'liegt': ['Liegt', 'Down'],
  'gruppe.mitglieder': ['{n} Mitglieder', '{n} members'],
  'schaden.hinweis': ['Schaden eintippen, Minus heilt', 'Type damage, minus heals'],
  'wurf.modifikator': ['Modifikator', 'Modifier'],
  'wurf.nurGegner': ['Nur Gegner wuerfeln', 'Roll for enemies only'],
  'begegnung.name': ['Name der Begegnung', 'Encounter name'],
  'begegnung.keine': ['Keine gespeicherten Begegnungen', 'No saved encounters'],
  'msg.gespeichert': ['Begegnung gespeichert', 'Encounter saved'],
  'msg.geladen': ['Begegnung geladen', 'Encounter loaded'],
  'taste.leertaste': ['Leertaste: weiter', 'Space: next'],
  'bestaetigen.beenden': [
    'Kampf wirklich beenden? Die Reihenfolge geht verloren.',
    'Really end combat? The order will be lost.'
  ],
  'ja': ['Ja', 'Yes'],
  'nein': ['Nein', 'No']
} as const;

export type TextKey = keyof typeof texte;

const STORAGE_KEY = 'ttrpg-initiative.language';

/** Die Bruecke aus embed/preload — nur vorhanden, wenn eingebettet. */
interface SpracheBruecke {
  gewechselt(language: string): void;
  onGesetzt(callback: (language: string) => void): () => void;
}
declare global {
  interface Window {
    ttrpgToolsSprache?: SpracheBruecke;
  }
}

let aktuell: Language = erkenne();
const hoerer = new Set<() => void>();

function erkenne(): Language {
  try {
    const gespeichert = localStorage.getItem(STORAGE_KEY);
    if (gespeichert && (LANGUAGES as readonly string[]).includes(gespeichert)) {
      return gespeichert as Language;
    }
  } catch {
    /* Privater Modus — dann eben die Browsersprache. */
  }
  // Alles, was nicht deutsch ist, bekommt Englisch (Konvention 6).
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('de') ? 'de' : 'en';
}

export function getLanguage(): Language {
  return aktuell;
}

/** Setzt lokal, ohne der Huelle Bescheid zu sagen. */
function uebernimm(language: Language): void {
  if (language === aktuell) return;
  aktuell = language;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    /* Dann gilt die Wahl nur fuer diese Sitzung. */
  }
  for (const fn of hoerer) fn();
}

export function setLanguage(language: Language): void {
  if (language === aktuell) return;
  uebernimm(language);
  // Eingebettet: der Huelle melden, damit sie es an die anderen Werkzeuge
  // weiterreicht. Sonst liefen sie auseinander.
  if (typeof window !== 'undefined') window.ttrpgToolsSprache?.gewechselt(language);
}

export function onLanguageChange(fn: () => void): () => void {
  hoerer.add(fn);
  return () => hoerer.delete(fn);
}

if (typeof window !== 'undefined' && window.ttrpgToolsSprache) {
  // `uebernimm` und nicht `setLanguage`: sonst meldete dieses Modul die
  // Aenderung postwendend zurueck und die Huelle benachrichtigte sich im Kreis.
  window.ttrpgToolsSprache.onGesetzt((language) => {
    if ((LANGUAGES as readonly string[]).includes(language)) uebernimm(language as Language);
  });
}

/** Uebersetzt. Platzhalter `{n}` werden aus `params` ersetzt. */
export function t(key: TextKey, params?: Record<string, string | number>): string {
  const eintrag = texte[key];
  // Fehlt ein Schluessel, kommt er selbst zurueck — sichtbar falsch statt
  // leer, damit die Luecke beim Durchklicken auffaellt.
  if (!eintrag) return key;
  let text: string = eintrag[aktuell === 'de' ? 0 : 1];
  if (params) {
    for (const name in params) text = text.replaceAll(`{${name}}`, String(params[name]));
  }
  return text;
}
