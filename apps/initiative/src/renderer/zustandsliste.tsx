/**
 * Die Zustaende, die der Tracker vorschlaegt: die des SRD und die eigenen
 * aus dem Status Effect Creator.
 *
 * Als Kontext, weil jede Zeile sie braucht und sie sich nur beim Oeffnen
 * aendern. Der Text steht dabei, damit ein Zustand im Kampf seine Regel
 * zeigen kann, ohne dass man das Nachschlagewerk aufmacht.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ZUSTAENDE } from '@suite/srd/zustaende';
import { api } from './api';
import { getLanguage, onLanguageChange } from './i18n';

export interface Zustandseintrag {
  readonly name: string;
  readonly text: string;
  readonly eigen: boolean;
}

const Kontext = createContext<readonly Zustandseintrag[]>([]);

export function ZustandslisteGeber({ children }: { readonly children: ReactNode }) {
  const [eigene, setEigene] = useState<readonly { name: string; text: string }[]>([]);
  useEffect(() => {
    let aktiv = true;
    const lade = () =>
      void api
        .eigeneZustaende?.()
        .then((liste) => aktiv && setEigene(liste))
        .catch(() => undefined);
    lade();
    // Wer im Status Effect Creator einen neuen baut und zurueckkommt, soll
    // ihn gleich finden.
    window.addEventListener('focus', lade);
    return () => {
      aktiv = false;
      window.removeEventListener('focus', lade);
    };
  }, []);

  // Beim Sprachwechsel neu zeichnen: die SRD-Namen gibt es in beiden Sprachen.
  const [, setSprachstand] = useState(0);
  useEffect(() => onLanguageChange(() => setSprachstand((n) => n + 1)), []);

  const sprache = getLanguage() === 'en' ? 'en' : 'de';
  const liste: Zustandseintrag[] = [
    ...ZUSTAENDE.map((z) => ({ name: z.name[sprache], text: z.text[sprache], eigen: false })),
    ...eigene.map((z) => ({ name: z.name, text: z.text, eigen: true }))
  ];
  return <Kontext.Provider value={liste}>{children}</Kontext.Provider>;
}

export function useZustandsliste(): readonly Zustandseintrag[] {
  return useContext(Kontext);
}

/** Der Regeltext zu einem Namen, ohne Ruecksicht auf Gross- und Kleinschreibung. */
export function regelZu(liste: readonly Zustandseintrag[], name: string): string | null {
  const gesucht = name.trim().toLowerCase();
  return liste.find((z) => z.name.toLowerCase() === gesucht)?.text ?? null;
}
