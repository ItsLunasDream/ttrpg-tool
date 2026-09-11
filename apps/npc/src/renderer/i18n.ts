/** Texte des NPC Creators, Deutsch und Englisch paarweise. */
export const LANGUAGES = ['de', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const texte = {
  'app.title': ['NPC Creator', 'NPC Creator'],
  'knopf.wuerfeln': ['Neue Figur', 'New character'],
  'knopf.nachwuerfeln': ['Neu würfeln', 'Reroll'],
  'knopf.festhalten': ['Festhalten', 'Lock'],
  'knopf.losgeben': ['Freigeben', 'Unlock'],
  'knopf.export': ['In den Backstory Creator', 'Send to Backstory Creator'],
  'knopf.exportLaeuft': ['Wird angelegt …', 'Creating …'],
  'knopf.exportFertig': ['Angelegt', 'Created'],
  'leer': ['Noch keine Figur — wirf eine.', 'No character yet — roll one.'],
  'feld.name': ['Name', 'Name'],
  'feld.spezies': ['Spezies', 'Species'],
  'feld.beruf': ['Tätigkeit', 'Occupation'],
  'feld.aussehen': ['Auffällig', 'Notable'],
  'feld.motivation': ['Will', 'Wants'],
  'feld.geheimnis': ['Verschweigt', 'Hides'],
  'feld.eigenheit': ['Eigenheit', 'Quirk'],
  'feld.eigenheitLeer': ['keine besondere', 'nothing particular'],
  'wunsch.titel': ['Vorgaben', 'Constraints'],
  'wunsch.archetyp': ['Rolle', 'Role'],
  'wunsch.klang': ['Namensklang', 'Name style'],
  'wunsch.spezies': ['Spezies', 'Species'],
  'wunsch.beliebig': ['beliebig', 'any'],
  'wunsch.gemischt': ['gemischt', 'mixed'],
  'klang.weiblich': ['weiblich', 'feminine'],
  'klang.maennlich': ['männlich', 'masculine'],
  'klang.neutral': ['neutral', 'neutral'],
  'archetyp.beliebig': ['beliebig', 'Any'],
  'archetyp.wache': ['Wache und Söldner', 'Guards and soldiers'],
  'archetyp.haendler': ['Handel und Schankstube', 'Trade and taverns'],
  'archetyp.handwerk': ['Handwerk', 'Crafts'],
  'archetyp.schatten': ['Halbwelt', 'Underworld'],
  'archetyp.gelehrte': ['Gelehrte und Klerus', 'Scholars and clergy'],
  'archetyp.landvolk': ['Land und Wildnis', 'Country and wilds'],
  'ablage.titel': ['Merkliste', 'Shortlist'],
  'ablage.leer': ['Nur für diese Sitzung', 'This session only'],
  'ablage.merken': ['Merken', 'Keep'],
  'ablage.holen': ['Diese Figur zurückholen', 'Load this character again'],
  'ablage.leeren': ['Liste leeren', 'Clear list']
} as const;

export type TextKey = keyof typeof texte;

const STORAGE_KEY = 'ttrpg-npc.language';

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
