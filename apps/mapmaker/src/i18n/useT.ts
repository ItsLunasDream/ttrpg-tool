/** React-Anbindung an die Übersetzung. */

import { useSyncExternalStore } from 'react';
import { getLanguage, onLanguageChange, setLanguage, t, type Language } from './index';

/**
 * Liefert `t` und die aktuelle Sprache und rendert bei einem Sprachwechsel neu.
 *
 * `useSyncExternalStore` statt eines eigenen Zustands: die Sprache lebt außerhalb
 * von React (auch Werkzeuge und der Renderer greifen darauf zu), und so bleibt
 * genau eine Quelle der Wahrheit.
 */
export function useT(): {
  t: typeof t;
  language: Language;
  setLanguage: (language: Language) => void;
} {
  const language = useSyncExternalStore(onLanguageChange, getLanguage, getLanguage);
  return { t, language, setLanguage };
}
