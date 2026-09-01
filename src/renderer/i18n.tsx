import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_LANGUAGE, translate, type Language, type MessageKey, type MessageParams } from '../shared/i18n';

export type Translate = (key: MessageKey, params?: MessageParams) => string;

interface LanguageValue {
  language: Language;
  t: Translate;
  /** Sortierung nach den Regeln der eingestellten Sprache. */
  compare: (a: string, b: string) => number;
}

const LanguageContext = createContext<LanguageValue>({
  language: DEFAULT_LANGUAGE,
  t: (key, params) => translate(DEFAULT_LANGUAGE, key, params),
  compare: (a, b) => a.localeCompare(b, DEFAULT_LANGUAGE)
});

export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  const value = useMemo<LanguageValue>(() => {
    const collator = new Intl.Collator(language);
    return {
      language,
      t: (key, params) => translate(language, key, params),
      compare: (a, b) => collator.compare(a, b)
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  return useContext(LanguageContext);
}

/** Kurzform fuer Komponenten, die nur Texte brauchen. */
export function useT(): Translate {
  return useContext(LanguageContext).t;
}
