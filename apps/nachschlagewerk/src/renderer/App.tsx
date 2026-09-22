/**
 * Die Oberflaeche des Nachschlagewerks.
 *
 * Zwei Spalten: links die Liste mit dem Suchfeld, rechts der Eintrag. Kein
 * Seitenwechsel beim Auswaehlen — wer nachschlaegt, will zurueck zur Liste,
 * ohne sie neu aufzubauen, und die Suche soll stehen bleiben.
 */
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';
import { NAMENSNENNUNG, type Sprache } from '@suite/srd';
import { api } from './api';
import { getLanguage, setLanguage, t } from './i18n';
import {
  ARTEN,
  ART_GRUPPE,
  ART_NAME,
  alleRegeln,
  regelMitNamen,
  regelNach,
  unterpunkt,
  type Regel
} from '../shared/bestand';
import type { Glossarblock } from '@suite/srd/glossar';
import { finde } from '../shared/suche';

function sprache(): Sprache {
  return getLanguage() === 'de' ? 'de' : 'en';
}

function andere(spr: Sprache): Sprache {
  return spr === 'de' ? 'en' : 'de';
}

export function App() {
  const [, neuZeichnen] = useState(0);
  const [suche, setSuche] = useState('');
  const [offenId, setOffenId] = useState<string | null>(null);
  /**
   * Die zweite Sprache daneben.
   *
   * Weil die englische Fassung die massgebliche ist: wer auf Deutsch
   * liest und bei einer Formulierung stutzt, soll das Original daneben
   * sehen koennen, ohne die ganze Huelle umzustellen.
   */
  const [daneben, setDaneben] = useState(false);

  const regeln = useMemo(() => alleRegeln(), []);
  const spr = sprache();
  const treffer = useMemo(() => finde(regeln, suche, spr), [regeln, suche, spr]);
  const offen = offenId ? regelNach(offenId) : undefined;

  /*
   * Die Sprache kommt aus der Huelle, nicht aus einem eigenen Waehler.
   * Zwei Stellen fuer dieselbe Einstellung heisst, dass man immer in der
   * falschen nachsieht.
   */
  useEffect(() => {
    setLanguage(DEFAULT_LANGUAGE);
    return api.sprache.beiWechsel((neu) => {
      setLanguage((neu === 'de' ? 'de' : 'en') as Language);
      neuZeichnen((n) => n + 1);
    });
  }, []);

  /** Ein Treffer aus der Suche der Huelle (Strg+K) oeffnet den Eintrag. */
  useEffect(
    () =>
      api.beiSuchtreffer((kennung) => {
        if (regelNach(kennung)) {
          setOffenId(kennung);
          setSuche('');
        }
      }),
    []
  );

  // Gruppiert nach Art, in der festen Reihenfolge der Arten. Mit Suche
  // bleibt die Reihenfolge der Guete: dann zaehlt, was am besten passt,
  // nicht, wozu es gehoert.
  const gruppen = useMemo(() => {
    if (suche.trim()) return [{ art: null, treffer }];
    return ARTEN.map((art) => ({
      art,
      treffer: treffer
        .filter((eintrag) => eintrag.regel.art === art)
        .sort((a, b) => a.regel.name[spr].localeCompare(b.regel.name[spr], spr))
    })).filter((gruppe) => gruppe.treffer.length > 0);
  }, [suche, treffer, spr]);

  return (
    <div className="rahmen">
      <header className="kopf">
        <h1>{t('titel')}</h1>
        <p>{t('untertitel')}</p>
      </header>

      <div className="spalten">
        <nav className="liste" aria-label={t('titel')}>
          <input
            className="liste__suche"
            type="search"
            value={suche}
            placeholder={t('suche.platzhalter')}
            aria-label={t('suche')}
            onChange={(e) => setSuche(e.target.value)}
          />
          {suche.trim() ? (
            <p className="liste__anzahl">
              {treffer.length === 0 ? t('suche.nichts') : t('suche.anzahl', { anzahl: treffer.length })}
            </p>
          ) : null}

          {gruppen.map((gruppe) => (
            <section key={gruppe.art ?? 'treffer'} className="liste__gruppe">
              {gruppe.art ? <h2>{ART_GRUPPE[gruppe.art][spr]}</h2> : null}
              <ul>
                {gruppe.treffer.map(({ regel, stelle }) => (
                  <li key={regel.id}>
                    <button
                      type="button"
                      className={
                        regel.id === offenId ? 'eintrag eintrag--offen' : 'eintrag'
                      }
                      data-regel={regel.id}
                      aria-current={regel.id === offenId ? 'true' : undefined}
                      onClick={() => setOffenId(regel.id)}
                    >
                      <span className="eintrag__name">{regel.name[spr]}</span>
                      <span className="eintrag__anders">{regel.name[andere(spr)]}</span>
                      {/* Die Fundstelle, wenn es nicht am Namen lag: sie ist
                          der Grund, warum der Eintrag ueberhaupt dasteht. */}
                      {stelle ? <span className="eintrag__stelle">{stelle}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <main className="blatt">
          {offen ? (
            <Blatt
              regel={offen}
              daneben={daneben}
              onDaneben={() => setDaneben(!daneben)}
              oeffne={setOffenId}
            />
          ) : (
            <div className="blatt__leer">
              <h2>{t('leer.titel')}</h2>
              <p>{t('leer.satz')}</p>
            </div>
          )}
        </main>
      </div>

      {/*
        Die Namensnennung, woertlich und in der Sprache der Huelle. Sie steht
        auch im Ueber-Dialog; hier steht sie, weil dieses Werkzeug fast nur
        aus fremdem Material besteht und man wissen soll, woher es kommt.
      */}
      <footer className="fuss">
        <span className="fuss__marke">{t('quelle')}</span> {NAMENSNENNUNG[spr]}
      </footer>
    </div>
  );
}

function Blatt({
  regel,
  daneben,
  onDaneben,
  oeffne
}: {
  readonly regel: Regel;
  readonly daneben: boolean;
  readonly onDaneben: () => void;
  readonly oeffne: (id: string) => void;
}) {
  const spr = sprache();
  const sprachen: Sprache[] = daneben ? [spr, andere(spr)] : [spr];

  return (
    <article className="regel" data-regel={regel.id}>
      <header className="regel__kopf">
        <div>
          <span className="regel__art">{ART_NAME[regel.art][spr]}</span>
          <h2>{regel.name[spr]}</h2>
          <p className="regel__anders">{regel.name[andere(spr)]}</p>
        </div>
        <button type="button" className="knopf" data-daneben onClick={onDaneben}>
          {daneben ? t('daneben.aus') : t('daneben')}
        </button>
      </header>

      <div className={daneben ? 'regel__fassungen regel__fassungen--zwei' : 'regel__fassungen'}>
        {sprachen.map((s) => (
          <section key={s} className="regel__fassung" lang={s} data-sprache={s}>
            {daneben ? <h3>{s === 'de' ? 'Deutsch' : 'English'}</h3> : null}
            {regel.bloecke.map((block, index) => (
              <Block key={index} block={block} sprache={s} oeffne={oeffne} />
            ))}
          </section>
        ))}
      </div>

      {regel.verweise.length > 0 ? (
        <nav className="regel__verweise" aria-label={t('verweise')}>
          <span>{t('verweise')}</span>
          {regel.verweise.map((id) => {
            const ziel = regelNach(id);
            return ziel ? (
              <button key={id} type="button" className="verweis" data-verweis={id} onClick={() => oeffne(id)}>
                {ziel.name[spr]}
              </button>
            ) : null;
          })}
        </nav>
      ) : null}

      {spr === 'de' ? <p className="regel__massgeblich">{t('massgeblich')}</p> : null}
    </article>
  );
}

/** Ein Block des Glossars: Absatz, Unterpunkt, Tabelle oder Liste. */
function Block({
  block,
  sprache: s,
  oeffne
}: {
  readonly block: Glossarblock;
  readonly sprache: Sprache;
  readonly oeffne: (id: string) => void;
}) {
  if (block.typ === 'tabelle') {
    return (
      <table className="regel__tabelle">
        {block.titel[s] ? <caption>{block.titel[s]}</caption> : null}
        <thead>
          <tr>
            {block.kopf[s].map((zelle, i) => (
              <th key={i} scope="col">
                {zelle}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.reihen[s].map((reihe, i) => (
            <tr key={i}>
              {reihe.map((zelle, j) => (
                <td key={j}>{zelle}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (block.typ === 'liste') {
    return (
      <>
        {block.titel[s] ? <p className="regel__listentitel">{block.titel[s]}</p> : null}
        <ul className="regel__liste">
          {block.eintraege[s].map((eintrag) => {
            // Nennt der Punkt einen Eintrag des Glossars, fuehrt er dorthin.
            const ziel = regelMitNamen(eintrag, s);
            return (
              <li key={eintrag}>
                {ziel ? (
                  <button type="button" className="verweis verweis--leise" onClick={() => oeffne(ziel.id)}>
                    {eintrag}
                  </button>
                ) : (
                  eintrag
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  }
  if (block.typ === 'absatz') {
    return <p className="regel__einleitung">{block.text[s]}</p>;
  }
  const teil = unterpunkt(block.text[s]);
  return (
    <p className={block.typ === 'stichpunkt' ? 'regel__punkt regel__punkt--tief' : 'regel__punkt'}>
      {teil.kopf ? <strong>{teil.kopf} </strong> : null}
      {teil.rest}
    </p>
  );
}
