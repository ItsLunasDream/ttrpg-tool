/**
 * Die Suche ueber alle Werkzeuge hinweg (Strg+K).
 *
 * Ein Feld, eine Liste, Enter. Was man tippt, sucht in Monstern, Zustaenden
 * und Begegnungen auf einmal — und ein Treffer bringt einen dorthin, wo er
 * liegt.
 *
 * Sie liegt ueber allem, auch ueber der Ansicht des offenen Werkzeugs. Das
 * geht, weil die Huelle beim Oeffnen zuruecktritt — derselbe Weg, den die
 * Dialoge schon gehen.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { buendle, eintragsSchluessel, finde, WERKZEUG_APP, type Eintrag } from '@suite/eintraege';
import type { MessageKey, MessageParams } from '../shared/i18n';
import { nameKey } from '../shared/apps';

interface Props {
  readonly eintraege: readonly Eintrag[];
  /** `null`, solange noch geladen wird. */
  readonly laedt: boolean;
  readonly onWahl: (eintrag: Eintrag) => void;
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Suche({ eintraege, laedt, onWahl, onClose, t }: Props) {
  const [text, setText] = useState('');
  const [aktiv, setAktiv] = useState(0);
  const feld = useRef<HTMLInputElement>(null);

  useEffect(() => {
    feld.current?.focus();
  }, []);

  const treffer = useMemo(() => finde(eintraege, text), [eintraege, text]);
  const gruppen = useMemo(() => buendle(treffer), [treffer]);

  /*
   * Die Auswahl beim Tippen zurueck auf den ersten Treffer.
   *
   * Ohne das steht sie auf Platz sieben, waehrend oben laengst etwas
   * anderes steht — und Enter oeffnet dann etwas, das niemand gemeint hat.
   */
  useEffect(() => setAktiv(0), [text]);

  const waehle = (eintrag: Eintrag | undefined) => {
    if (!eintrag) return;
    onWahl(eintrag);
    onClose();
  };

  return (
    <div className="suche__schirm" onPointerDown={onClose}>
      <div
        className="suche"
        role="dialog"
        aria-label={t('search.title')}
        // Ein Klick INNEN darf nicht schliessen. `stopPropagation` und nicht
        // ein zweiter Lauscher: so gibt es nur eine Stelle, die schliesst.
        onPointerDown={(ereignis) => ereignis.stopPropagation()}
      >
        <input
          ref={feld}
          className="suche__feld"
          type="search"
          value={text}
          placeholder={t('search.placeholder')}
          aria-label={t('search.title')}
          onChange={(ereignis) => setText(ereignis.target.value)}
          onKeyDown={(ereignis) => {
            if (ereignis.key === 'Escape') {
              ereignis.preventDefault();
              onClose();
              return;
            }
            if (ereignis.key === 'ArrowDown' || ereignis.key === 'ArrowUp') {
              ereignis.preventDefault();
              if (treffer.length === 0) return;
              const schritt = ereignis.key === 'ArrowDown' ? 1 : treffer.length - 1;
              setAktiv((vorher) => (vorher + schritt) % treffer.length);
              return;
            }
            if (ereignis.key === 'Enter') {
              ereignis.preventDefault();
              waehle(treffer[aktiv]);
            }
          }}
        />

        {laedt ? (
          <p className="suche__hinweis">{t('search.loading')}</p>
        ) : treffer.length === 0 ? (
          <p className="suche__hinweis">
            {text.trim() ? t('search.nothing') : t('search.hint')}
          </p>
        ) : (
          <div className="suche__liste">
            {gruppen.map((gruppe) => (
              <section key={gruppe.werkzeug}>
                <h3 className="suche__werkzeug">
                  {/* Die Anwendungen sind kein Werkzeug mit eigenem Namen —
                      sie sind die Werkzeuge. */}
                  {gruppe.werkzeug === WERKZEUG_APP
                    ? t('search.appGruppe')
                    : t(nameKey(gruppe.werkzeug))}
                </h3>
                <ul>
                  {gruppe.eintraege.map((eintrag) => {
                    // Die Nummer ueber ALLE Treffer hinweg, nicht je Gruppe:
                    // die Pfeiltasten laufen durch die ganze Liste.
                    const nummer = treffer.indexOf(eintrag);
                    return (
                      <li key={eintragsSchluessel(eintrag)}>
                        <button
                          type="button"
                          className={nummer === aktiv ? 'suche__treffer is-active' : 'suche__treffer'}
                          onMouseEnter={() => setAktiv(nummer)}
                          onClick={() => waehle(eintrag)}
                        >
                          <span className="suche__name">{eintrag.name}</span>
                          <span className="suche__art">{eintrag.art}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="suche__fuss">{t('search.keys')}</p>
      </div>
    </div>
  );
}
