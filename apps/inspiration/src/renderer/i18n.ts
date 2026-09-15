/** Texte der Inspirationshilfe, Deutsch und Englisch paarweise. */
export const LANGUAGES = ['de', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const texte = {
  'app.title': ['Inspirationshilfe', 'Inspiration'],
  'app.unterzeile': [
    'Ein Gerüst für eine Kampagne: wer will was, wer steht wem im Weg, wo passiert es.',
    'A scaffold for a campaign: who wants what, who is in whose way, where it happens.'
  ],

  'regler.umfang': ['Umfang', 'Scope'],
  'regler.region': ['Region', 'Region'],
  'regler.thema': ['Thema', 'Theme'],
  'regler.tonfall': ['Tonfall', 'Tone'],
  'regler.beliebig': ['beliebig', 'any'],
  'regler.frei': [
    'Eigener Text ist erlaubt — er schränkt die Tabellen dann nicht ein.',
    'Your own wording is fine — it simply does not narrow the tables.'
  ],

  'knopf.allesWuerfeln': ['Alles würfeln', 'Roll everything'],
  'knopf.nochmal': ['Neu würfeln', 'Reroll'],
  'knopf.festhalten': ['Festhalten', 'Lock'],
  'knopf.losgeben': ['Freigeben', 'Unlock'],
  'knopf.zeileNeu': ['Diese Zeile neu würfeln', 'Reroll this line'],
  'knopf.export': ['In den Backstory Creator', 'Send to Backstory Creator'],
  'knopf.exportLaeuft': ['Wird angelegt …', 'Creating …'],
  'knopf.kopieren': ['Als Text kopieren', 'Copy as text'],
  'knopf.kopiert': ['Kopiert', 'Copied'],

  'leer': [
    'Noch nichts gewürfelt. Stell den Umfang ein und drück auf „Alles würfeln".',
    'Nothing rolled yet. Set the scope and press “Roll everything”.'
  ],
  'moeglichkeiten': [
    '{aufhaenger} Aufhänger, {orte} Orte und {figuren} Figuren stecken in den Tabellen — ganz ohne KI.',
    '{aufhaenger} hooks, {orte} places and {figuren} characters sit in the tables — with no AI at all.'
  ],

  'baustein.aufhaenger': ['Aufhänger', 'Hook'],
  'baustein.fraktionen': ['Fraktionen', 'Factions'],
  'baustein.figuren': ['Figuren', 'Characters'],
  'baustein.orte': ['Orte', 'Places'],
  'baustein.verbindungen': ['Verbindungen', 'Connections'],
  'baustein.zeitstrahl': ['Wenn niemand eingreift', 'If nobody intervenes'],

  'hinweis.fraktionen': [
    'Zwei Ziele, die einander im Weg stehen, ergeben Handlung von selbst.',
    'Two goals in each other’s way produce plot by themselves.'
  ],
  'hinweis.verbindungen': [
    'Gerichtet: beide sehen dieselbe Sache verschieden.',
    'Directed: the two of them see the same thing differently.'
  ],
  'hinweis.zeitstrahl': [
    'Der Zeitstrahl läuft auch, wenn die Gruppe woanders ist.',
    'The clock runs even while the party is somewhere else.'
  ],

  'feld.frist': ['Frist', 'Deadline'],
  'feld.ziel': ['Ziel', 'Goal'],
  'feld.mittel': ['Mittel', 'Methods'],
  'feld.schwaeche': ['Schwachstelle', 'Weak point'],
  'feld.rolle': ['Rolle', 'Role'],
  'feld.will': ['Will', 'Wants'],
  'feld.hat': ['Hat', 'Holds'],
  'feld.haken': ['Haken', 'Snag'],
  'feld.karte': ['Auf der Karte', 'On the map'],

  'export.titel': ['Titel der Übersichtsnotiz', 'Title of the overview note'],
  'export.titelVorgabe': ['Neuer Entwurf', 'New draft'],
  'export.hinweis': [
    'Legt je Figur, Ort und Fraktion eine Notiz an, dazu eine Übersicht mit Verweisen. Nichts wird überschrieben.',
    'Creates a note per character, place and faction, plus a linked overview. Nothing is overwritten.'
  ],
  'export.fertig': ['{anzahl} Notizen angelegt: {ziel}', '{anzahl} notes created: {ziel}'],
  'export.leer': ['Erst würfeln, dann übernehmen.', 'Roll something first, then send it over.'],
  'export.fehler': ['Das hat nicht geklappt: {grund}', 'That did not work: {grund}']
} as const;

export type TextKey = keyof typeof texte;

const STORAGE_KEY = 'ttrpg-inspiration.language';

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
    /* Privater Modus — dann die Browsersprache. */
  }
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('de') ? 'de' : 'en';
}

export function getLanguage(): Language {
  return aktuell;
}

function uebernimm(language: Language): void {
  if (language === aktuell) return;
  aktuell = language;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    /* Gilt dann nur fuer diese Sitzung. */
  }
  for (const fn of hoerer) fn();
}

export function setLanguage(language: Language): void {
  if (language === aktuell) return;
  uebernimm(language);
  if (typeof window !== 'undefined') window.ttrpgToolsSprache?.gewechselt(language);
}

export function onLanguageChange(fn: () => void): () => void {
  hoerer.add(fn);
  return () => hoerer.delete(fn);
}

if (typeof window !== 'undefined' && window.ttrpgToolsSprache) {
  // `uebernimm` statt `setLanguage`: sonst meldete dieses Modul die Aenderung
  // postwendend zurueck und die Huelle benachrichtigte sich im Kreis.
  window.ttrpgToolsSprache.onGesetzt((language) => {
    if ((LANGUAGES as readonly string[]).includes(language)) uebernimm(language as Language);
  });
}

export function t(key: TextKey, params?: Record<string, string | number>): string {
  const eintrag = texte[key];
  if (!eintrag) return key;
  let text: string = eintrag[aktuell === 'de' ? 0 : 1];
  if (params) for (const name in params) text = text.replaceAll(`{${name}}`, String(params[name]));
  return text;
}
