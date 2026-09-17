/**
 * Die Karte gross auf dem Schirm.
 *
 * Dasselbe HTML, das auch ins PDF geht — nicht ein zweites, das ihm
 * aehnlich sieht. Zwei Wege zu demselben Blatt waeren zwei Blaetter, die
 * irgendwann auseinanderlaufen.
 *
 * Deshalb steht der Inhalt in einem `iframe` mit `srcDoc`: so gilt das
 * Karten-Stylesheet fuer sich und faerbt nicht auf das Werkzeug ab, und was
 * man sieht, ist das, was gedruckt wird.
 */
import { useEffect, useRef } from 'react';
import { bogen } from '../shared/karte';
import type { Zustand } from '../shared/erzeuge';
import { getLanguage, t } from './i18n';

interface Props {
  readonly zustaende: readonly Zustand[];
  readonly ausformuliert?: Readonly<Record<number, string>>;
  readonly onSchliessen: () => void;
  readonly onDrucken: () => void;
}

export function Karte({ zustaende, ausformuliert, onSchliessen, onDrucken }: Props) {
  const sprache = getLanguage() === 'en' ? 'en' : 'de';
  const schliessen = useRef(onSchliessen);
  schliessen.current = onSchliessen;

  // Escape schliesst, wie in jedem anderen Dialog der Sammlung.
  useEffect(() => {
    const beiTaste = (ereignis: KeyboardEvent) => {
      if (ereignis.key === 'Escape') schliessen.current();
    };
    window.addEventListener('keydown', beiTaste);
    return () => window.removeEventListener('keydown', beiTaste);
  }, []);

  return (
    <div className="kartenschirm" role="dialog" aria-modal="true">
      <div className="kartenschirm__leiste">
        <button type="button" className="knopf knopf--haupt" onClick={onDrucken}>
          {t('karte.drucken')}
        </button>
        <button type="button" className="knopf" onClick={onSchliessen}>
          {t('karte.schliessen')}
        </button>
      </div>
      <iframe
        className="kartenschirm__blatt"
        title={t('karte.vorschau')}
        // Kein Skript in der Karte, und keins von aussen hinein: sie ist ein
        // Blatt Papier und soll sich auch so verhalten.
        sandbox=""
        srcDoc={bogen(zustaende, sprache, ausformuliert)}
      />
    </div>
  );
}
