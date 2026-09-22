/**
 * Die Texte des Nachschlagewerks — die der Oberflaeche, nicht die Regeln.
 *
 * Paarweise `[de, en]` wie in den anderen Werkzeugen. Der Regeltext selbst
 * steht NICHT hier, sondern in `@suite/srd`: er ist woertlich uebernommen
 * und keine Oberflaechenbeschriftung, die man umformulieren duerfte.
 */
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';

const TEXTE = {
  titel: ['Nachschlagewerk', 'Reference'],
  untertitel: [
    'Das Regelglossar des SRD 5.2.1, offline, auf Deutsch und Englisch.',
    'The rules glossary of the SRD 5.2.1, offline, in German and English.'
  ],
  suche: ['Suchen', 'Search'],
  'suche.platzhalter': ['Begriff oder Stelle im Text …', 'A term or a phrase in the text …'],
  'suche.anzahl': ['{anzahl} Treffer', '{anzahl} results'],
  'suche.nichts': ['Nichts gefunden.', 'Nothing found.'],
  'leer.titel': ['Wähle links einen Eintrag.', 'Pick an entry on the left.'],
  'leer.satz': [
    'Oder such nach einem Begriff: „liegend", „prone" oder eine Stelle im Text wie „critical hit".',
    'Or search for a term: “prone”, “liegend”, or a phrase from the text such as “critical hit”.'
  ],
  daneben: ['Andere Sprache daneben', 'Other language alongside'],
  'daneben.aus': ['Nur eine Sprache', 'One language only'],
  massgeblich: [
    'Bei einer Abweichung gilt die englische Fassung.',
    'Where the two differ, the English version applies.'
  ],
  quelle: ['Quelle', 'Source'],
  verweise: ['Siehe auch', 'See also'],
  'vorschau.oeffnen': ['Eintrag öffnen', 'Open entry']
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
