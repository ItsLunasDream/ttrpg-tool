/**
 * Der NPC Creator.
 *
 * Ein Knopf, eine fertige Figur. Alles andere ordnet sich dem unter: das
 * Werkzeug wird benutzt, waehrend die Gruppe wartet, und wer in dem Moment
 * erst Felder ausfuellen muss, benutzt es beim naechsten Mal nicht mehr.
 *
 * Jedes Feld laesst sich einzeln nachwuerfeln und einzeln festhalten. Ohne
 * das Festhalten wuerfelt man den guten Namen weg, waehrend man den Beruf
 * sucht.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  alsMarkdown,
  erzeugeFeld,
  erzeugeFigur,
  FELDER,
  NAMENSKLANG,
  STANDARD_WUENSCHE,
  type Feld,
  type Figur,
  type Namensklang,
  type Wuensche
} from '../shared/erzeuge';
import { ARCHETYPEN, SPEZIES } from '../shared/tabellen';
import { getLanguage, onLanguageChange, t, type Language, type TextKey } from './i18n';
import { api } from './api';

/** Die Felder in der Reihenfolge, in der sie gelesen werden. */
const REIHENFOLGE: readonly Feld[] = FELDER;

interface Gemerkt {
  readonly id: number;
  readonly figur: Figur;
}

export function App() {
  const [figur, setFigur] = useState<Figur | null>(null);
  const [festgehalten, setFestgehalten] = useState<readonly Feld[]>([]);
  const [wuensche, setWuensche] = useState<Wuensche>(STANDARD_WUENSCHE);
  const [gemerkt, setGemerkt] = useState<Gemerkt[]>([]);
  const [exportStand, setExportStand] = useState<'ruht' | 'laeuft' | 'fertig' | 'fehler'>('ruht');
  const [exportText, setExportText] = useState('');
  const [, setSprache] = useState<Language>(getLanguage);

  useEffect(() => onLanguageChange(() => setSprache(getLanguage())), []);

  const wuerfle = useCallback(() => {
    setFigur((vorher) => erzeugeFigur(wuensche, Math.random, festgehalten, vorher));
    setExportStand('ruht');
  }, [wuensche, festgehalten]);

  const nachwuerfeln = useCallback(
    (feld: Feld) => {
      setFigur((vorher) =>
        vorher ? { ...vorher, [feld]: erzeugeFeld(feld, wuensche, Math.random) } : vorher
      );
      setExportStand('ruht');
    },
    [wuensche]
  );

  const schalteFest = useCallback((feld: Feld) => {
    setFestgehalten((vorher) =>
      vorher.includes(feld) ? vorher.filter((eintrag) => eintrag !== feld) : [...vorher, feld]
    );
  }, []);

  const exportiere = useCallback(async () => {
    if (!figur) return;
    setExportStand('laeuft');
    const ergebnis = await api.export(figur, alsMarkdown(figur));
    setExportStand(ergebnis.ok ? 'fertig' : 'fehler');
    setExportText(ergebnis.text);
  }, [figur]);

  const artenNachName = useMemo(() => SPEZIES.map((art) => art.name), []);

  return (
    <div className="npcapp">
      <aside className="vorgaben">
        <span className="vorgaben__titel">{t('wunsch.titel')}</span>

        <label className="feld">
          <span className="feld__label">{t('wunsch.archetyp')}</span>
          <select
            value={wuensche.archetyp}
            onChange={(e) => setWuensche((v) => ({ ...v, archetyp: e.target.value }))}
          >
            {ARCHETYPEN.map((archetyp) => (
              <option key={archetyp.id} value={archetyp.id}>
                {t(`archetyp.${archetyp.id}` as TextKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="feld">
          <span className="feld__label">{t('wunsch.klang')}</span>
          <select
            value={wuensche.klang ?? ''}
            onChange={(e) =>
              setWuensche((v) => ({ ...v, klang: (e.target.value || null) as Namensklang | null }))
            }
          >
            <option value="">{t('wunsch.gemischt')}</option>
            {NAMENSKLANG.map((klang) => (
              <option key={klang} value={klang}>
                {t(`klang.${klang}` as TextKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="feld">
          <span className="feld__label">{t('wunsch.spezies')}</span>
          <select
            value={wuensche.spezies ?? ''}
            onChange={(e) => setWuensche((v) => ({ ...v, spezies: e.target.value || null }))}
          >
            <option value="">{t('wunsch.beliebig')}</option>
            {artenNachName.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="knopf--haupt" onClick={wuerfle}>
          {t('knopf.wuerfeln')}
        </button>
      </aside>

      <main className="buehne">
        {figur ? (
          <>
            <h1 className="figur__name">{figur.name}</h1>
            <p className="figur__zeile">
              {figur.spezies} · {figur.beruf}
            </p>

            <dl className="figur">
              {REIHENFOLGE.map((feld) => (
                <Zeile
                  key={feld}
                  feld={feld}
                  wert={figur[feld]}
                  fest={festgehalten.includes(feld)}
                  onNachwuerfeln={() => nachwuerfeln(feld)}
                  onFest={() => schalteFest(feld)}
                />
              ))}
            </dl>

            <div className="buehne__knoepfe">
              {/* Der Export laeuft auf Knopfdruck und nicht von selbst: eine
                  Figur, die man verwirft, soll nicht schon im Archiv liegen. */}
              <button
                type="button"
                className="knopf--haupt"
                onClick={() => void exportiere()}
                disabled={exportStand === 'laeuft'}
              >
                {exportStand === 'laeuft'
                  ? t('knopf.exportLaeuft')
                  : exportStand === 'fertig'
                    ? t('knopf.exportFertig')
                    : t('knopf.export')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setGemerkt((vorher) =>
                    [{ id: (vorher[0]?.id ?? 0) + 1, figur }, ...vorher].slice(0, 20)
                  )
                }
              >
                {t('ablage.merken')}
              </button>
            </div>

            {exportStand === 'fehler' ? <p className="stoerung">{exportText}</p> : null}
          </>
        ) : (
          <p className="buehne__leer">{t('leer')}</p>
        )}
      </main>

      <section className="merkliste">
        <header className="merkliste__kopf">
          <span className="merkliste__titel">{t('ablage.titel')}</span>
          <span className="merkliste__hinweis">{t('ablage.leer')}</span>
          {gemerkt.length > 0 ? (
            <button type="button" className="merkliste__leeren" onClick={() => setGemerkt([])}>
              {t('ablage.leeren')}
            </button>
          ) : null}
        </header>
        <ol className="merkliste__liste">
          {gemerkt.map((eintrag) => (
            <li key={eintrag.id}>
              <button
                type="button"
                onClick={() => {
                  setFigur(eintrag.figur);
                  setExportStand('ruht');
                }}
                title={t('ablage.holen')}
              >
                <span className="merkliste__name">{eintrag.figur.name}</span>
                <span className="merkliste__rolle">
                  {eintrag.figur.spezies} · {eintrag.figur.beruf}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Zeile({
  feld,
  wert,
  fest,
  onNachwuerfeln,
  onFest
}: {
  feld: Feld;
  wert: string;
  fest: boolean;
  onNachwuerfeln: () => void;
  onFest: () => void;
}) {
  // Ein leeres Feld ist beim Tic der Normalfall und keine Luecke — deshalb
  // steht dort ein Wort und nicht nichts.
  const leer = wert === '';
  return (
    <div className={`zeile ${fest ? 'zeile--fest' : ''} ${leer ? 'zeile--leer' : ''}`}>
      <dt>{t(`feld.${feld}` as TextKey)}</dt>
      <dd>{leer ? t('feld.eigenheitLeer') : wert}</dd>
      <span className="zeile__knoepfe">
        <button type="button" onClick={onNachwuerfeln} title={t('knopf.nachwuerfeln')}>
          ↻
        </button>
        <button
          type="button"
          onClick={onFest}
          title={fest ? t('knopf.losgeben') : t('knopf.festhalten')}
          aria-pressed={fest}
        >
          {fest ? '🔒' : '🔓'}
        </button>
      </span>
    </div>
  );
}
