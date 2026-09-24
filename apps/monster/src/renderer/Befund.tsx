/**
 * Der Befund — das Herzstueck der Oberflaeche.
 *
 * Kein „bestanden/nicht bestanden", sondern eine Ampel mit Begruendung: die
 * beiden Haelften getrennt, und darunter, was sich drehen laesst. Ein Befund,
 * der nur sagt, DASS etwas klemmt, hilft beim naechsten Schritt nicht.
 */
import type { Befund as Werteurteil, Vorschlag } from '../shared/pruefung';
import { schadensSpanne } from '../shared/pruefung';
import { richtwert } from '../shared/richtwerte';
import { t, type TextKey } from './i18n';

const FELDNAME: Record<Vorschlag['feld'], TextKey> = {
  tp: 'werte.tp',
  rk: 'werte.rk',
  schadenProRunde: 'werte.schaden',
  angriffsbonus: 'werte.bonus'
};

interface Props {
  readonly befund: Werteurteil;
  /** Wird ein Vorschlag angeklickt, setzt die Oberflaeche ihn ein. */
  readonly onUebernehmen?: (vorschlag: Vorschlag) => void;
}

export function Befund({ befund, onUebernehmen }: Props) {
  const ziel = richtwert(befund.ziel);
  const ampel =
    befund.urteil === 'passt' ? 'gut' : befund.urteil === 'zu stark' ? 'hoch' : 'niedrig';
  const urteilText =
    befund.urteil === 'passt'
      ? t('befund.passt')
      : befund.urteil === 'zu stark'
        ? t('befund.zuStark')
        : t('befund.zuSchwach');

  return (
    <section className={`befund befund--${ampel}`} aria-live="polite">
      <header className="befund__kopf">
        <span className="befund__urteil">{urteilText}</span>
        <span className="befund__grade">
          {t('befund.gerechnet', { cr: befund.cr })} · {t('befund.eingestellt', { cr: befund.ziel })}
        </span>
      </header>

      {/* Ein Urteil ohne Rechenweg ist eine Behauptung. Der Satz steht
          deshalb dabei und nicht in der Hilfe. */}
      <p className="befund__erklaerung">{t('befund.erklaerung')}</p>

      <div className="befund__haelften">
        <Haelfte
          titel={t('befund.verteidigung')}
          cr={befund.verteidigung.cr}
          gemessen={befund.verteidigung.gemessen}
          spanne={ziel ? `${ziel.tpVon}–${ziel.tpBis}` : ''}
          passt={befund.verteidigung.passt}
        />
        <Haelfte
          titel={t('befund.angriff')}
          cr={befund.angriff.cr}
          gemessen={befund.angriff.gemessen}
          spanne={ziel ? `${Math.ceil(schadensSpanne(ziel).von)}–${Math.floor(schadensSpanne(ziel).bis)}` : ''}
          passt={befund.angriff.passt}
        />
      </div>

      {befund.vorschlaege.length > 0 && (
        <div className="befund__vorschlaege">
          <p className="befund__hinweis">{t('befund.vorschlaege')}</p>
          <ul>
            {befund.vorschlaege.map((vorschlag) => (
              <li key={vorschlag.feld}>
                <span className="befund__grund">{t(`grund.${vorschlag.grund}` as TextKey)}</span>
                {onUebernehmen ? (
                  <button type="button" className="knopf knopf--klein" onClick={() => onUebernehmen(vorschlag)}>
                    {t('vorschlag.setzen', {
                      feld: t(FELDNAME[vorschlag.feld]),
                      wert: vorschlag.auf
                    })}
                  </button>
                ) : (
                  <span>
                    {t('vorschlag.setzen', { feld: t(FELDNAME[vorschlag.feld]), wert: vorschlag.auf })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Haelfte({
  titel,
  cr,
  gemessen,
  spanne,
  passt
}: {
  readonly titel: string;
  readonly cr: string;
  readonly gemessen: number;
  readonly spanne: string;
  readonly passt: boolean;
}) {
  return (
    <div className={passt ? 'haelfte haelfte--gut' : 'haelfte haelfte--schlecht'}>
      <span className="haelfte__titel">{titel}</span>
      <span className="haelfte__cr">{t('befund.grad')} {cr}</span>
      <span className="haelfte__zahl">{gemessen}</span>
      {spanne && <span className="haelfte__spanne">{spanne}</span>}
      <span className="haelfte__zeichen" aria-hidden="true">
        {passt ? '✓' : '✗'}
      </span>
    </div>
  );
}
