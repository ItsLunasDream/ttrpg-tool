/**
 * Übersetzungsfunktion.
 *
 * Bewusst ohne Bibliothek: zwei Sprachen, flache Schlüssel, keine Pluralregeln,
 * die sich nicht mit einem Wörterbuch abbilden ließen. Eine Abhängigkeit wäre
 * hier mehr Aufwand als Nutzen.
 */

import { LANGUAGES, strings, type Language, type StringKey } from './strings';

const STORAGE_KEY = 'ttrpg-map-editor.language';

let current: Language = detect();
const listeners = new Set<() => void>();

function detect(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (LANGUAGES as readonly string[]).includes(stored)) return stored as Language;
  } catch {
    /* Privater Modus oder blockierter Speicher — dann eben die Browsersprache. */
  }
  // Alles, was nicht deutsch ist, bekommt Englisch.
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('de') ? 'de' : 'en';
}

export function getLanguage(): Language {
  return current;
}

export function setLanguage(language: Language): void {
  if (language === current) return;
  current = language;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    /* Nicht schlimm — die Wahl gilt dann nur für diese Sitzung. */
  }
  for (const fn of listeners) fn();
}

export function onLanguageChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Übersetzt einen Schlüssel. Platzhalter `{name}` werden aus `params` ersetzt.
 *
 * Fehlt ein Schlüssel, kommt er selbst zurück — sichtbar falsch statt leer,
 * damit die Lücke beim Durchklicken auffällt.
 */
export function t(key: StringKey, params?: Record<string, string | number>): string {
  const entry = strings[key];
  if (!entry) return key;
  let text = entry[current === 'de' ? 0 : 1];
  if (params) {
    for (const name in params) {
      text = text.replaceAll(`{${name}}`, String(params[name]));
    }
  }
  return text;
}

export { LANGUAGES, LANGUAGE_LABELS } from './strings';
export type { Language, StringKey } from './strings';
