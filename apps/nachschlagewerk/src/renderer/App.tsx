/**
 * Die Oberflaeche des Nachschlagewerks.
 *
 * Zwei Spalten: links die Liste mit dem Suchfeld, rechts der Eintrag. Kein
 * Seitenwechsel beim Auswaehlen — wer nachschlaegt, will zurueck zur Liste,
 * ohne sie neu aufzubauen, und die Suche soll stehen bleiben.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';
import { NAMENSNENNUNG, type Sprache } from '@suite/srd';
import { api } from './api';
import { getLanguage, setLanguage, t } from './i18n';
import {
  ARTEN,
  ART_GRUPPE,
  ART_NAME,
  alleRegeln,
  glossarId,
  regelFuerGlossar,
  regelMitNamen,
  regelNach,
  unterpunkt,
  type Regel
} from '../shared/bestand';
import type { Glossarblock } from '@suite/srd/glossar';
import { finde } from '../shared/suche';
import { verlinke } from '../shared/verweise';

/**
 * Was ein Verweis kann: oeffnen und seine Vorschau zeigen. Als Kontext, weil
 * Verweise tief in Bloecken, Listen und Saetzen stecken.
 */
interface Verweiskontext {
  readonly oeffne: (id: string) => void;
  readonly zeige: (id: string, rect: DOMRect) => void;
  readonly verberge: () => void;
}

const VerweisKontext = createContext<Verweiskontext>({
  oeffne: () => undefined,
  zeige: () => undefined,
  verberge: () => undefined
});

/** Wie lange der Zeiger auf einem Verweis ruhen muss, bis die Karte kommt. */
const VORSCHAU_NACH_MS = 250;
/** Wie lange sie stehen bleibt, wenn der Zeiger den Verweis verlaesst — Zeit, auf die Karte zu wechseln. */
const VORSCHAU_BLEIBT_MS = 200;

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
  const [vorschau, setVorschau] = useState<{ id: string; rect: DOMRect } | null>(null);
  const uhr = useRef<number | null>(null);

  const warteDann = (ms: number, tun: () => void) => {
    if (uhr.current !== null) window.clearTimeout(uhr.current);
    uhr.current = window.setTimeout(() => {
      uhr.current = null;
      tun();
    }, ms);
  };

  const verweise = useMemo<Verweiskontext>(
    () => ({
      oeffne: (id) => {
        if (uhr.current !== null) window.clearTimeout(uhr.current);
        setVorschau(null);
        setOffenId(id);
      },
      zeige: (id, rect) => warteDann(VORSCHAU_NACH_MS, () => setVorschau({ id, rect })),
      verberge: () => warteDann(VORSCHAU_BLEIBT_MS, () => setVorschau(null))
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
    <VerweisKontext.Provider value={verweise}>
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
            <Blatt regel={offen} daneben={daneben} onDaneben={() => setDaneben(!daneben)} />
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

      {vorschau && regelNach(vorschau.id) ? (
        <Vorschau
          regel={regelNach(vorschau.id) as Regel}
          rect={vorschau.rect}
          bleib={() => {
            if (uhr.current !== null) window.clearTimeout(uhr.current);
          }}
          geh={() => verweise.verberge()}
        />
      ) : null}
    </div>
    </VerweisKontext.Provider>
  );
}

/**
 * Ein Verweis im Text. Darueberfahren zeigt die Vorschau, ein Klick oeffnet
 * den Eintrag — mit oder ohne Strg: im Story Creator braucht es Strg, weil
 * man dort im Text schreibt; hier liest man nur, und Strg+Klick geht
 * trotzdem.
 */
function Verweis({
  id,
  kind,
  leise
}: {
  readonly id: string;
  readonly kind: ReactNode;
  readonly leise?: boolean;
}) {
  const { oeffne, zeige, verberge } = useContext(VerweisKontext);
  return (
    <button
      type="button"
      className={leise ? 'verweis verweis--leise' : 'verweis verweis--text'}
      data-ziel={id}
      onMouseEnter={(e) => zeige(id, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={verberge}
      onFocus={(e) => zeige(id, e.currentTarget.getBoundingClientRect())}
      onBlur={verberge}
      onClick={() => oeffne(id)}
    >
      {kind}
    </button>
  );
}

const KARTE_BREIT = 320;

/** Die Vorschau: Name, Art, der Anfang des Textes. Genug, um die Frage zu beantworten. */
function Vorschau({
  regel,
  rect,
  bleib,
  geh
}: {
  readonly regel: Regel;
  readonly rect: DOMRect;
  readonly bleib: () => void;
  readonly geh: () => void;
}) {
  const spr = sprache();
  const { oeffne } = useContext(VerweisKontext);
  const links = Math.max(8, Math.min(rect.left, window.innerWidth - KARTE_BREIT - 8));
  const oben = rect.bottom + 260 > window.innerHeight;
  const lage = oben
    ? { left: links, bottom: window.innerHeight - rect.top + 6, width: KARTE_BREIT }
    : { left: links, top: rect.bottom + 6, width: KARTE_BREIT };
  // Eine kurze Regel steht ganz da; eine lange wird nach etwa 420 Zeichen
  // an einer Satzgrenze abgeschnitten.
  const text = regel.text[spr];
  const kurz = text.length <= 480 ? text : `${text.slice(0, 420).replace(/[^.!?:]*$/, '')} …`;
  return (
    <div
      className="vorschau"
      style={lage}
      role="dialog"
      aria-label={regel.name[spr]}
      data-vorschau={regel.id}
      onMouseEnter={bleib}
      onMouseLeave={geh}
    >
      <div className="vorschau__kopf">
        <strong>{regel.name[spr]}</strong>
        <span className="vorschau__art">{ART_NAME[regel.art][spr]}</span>
      </div>
      <p className="vorschau__anders">{regel.name[andere(spr)]}</p>
      {kurz.split(/\n{2,}/).map((absatz, i) => (
        <p key={i} className="vorschau__text">
          {absatz}
        </p>
      ))}
      <button type="button" className="vorschau__oeffnen" onClick={() => oeffne(regel.id)}>
        {t('vorschau.oeffnen')}
      </button>
    </div>
  );
}

function Blatt({
  regel,
  daneben,
  onDaneben
}: {
  readonly regel: Regel;
  readonly daneben: boolean;
  readonly onDaneben: () => void;
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
            {(() => {
              // Je Sprachfassung ein eigenes Gedaechtnis: „nur das erste
              // Vorkommen" gilt ueber alle Bloecke dieses Eintrags.
              const gesehen = new Set<string>();
              return regel.bloecke.map((block, index) => (
                <Block
                  key={index}
                  block={block}
                  sprache={s}
                  eigenes={glossarId(regel)}
                  gesehen={gesehen}
                />
              ));
            })()}
          </section>
        ))}
      </div>

      {regel.verweise.length > 0 ? (
        <nav className="regel__verweise" aria-label={t('verweise')}>
          <span>{t('verweise')}</span>
          {regel.verweise.map((id) => {
            const ziel = regelNach(id);
            return ziel ? (
              <span key={id} className="verweis-knopf" data-verweis={id}>
                <Verweis id={id} kind={ziel.name[spr]} />
              </span>
            ) : null;
          })}
        </nav>
      ) : null}

      {spr === 'de' ? <p className="regel__massgeblich">{t('massgeblich')}</p> : null}
    </article>
  );
}

/** Ein Block des Glossars: Absatz, Unterpunkt, Tabelle oder Liste. */
/** Ein Text mit seinen erkannten Verweisen. */
function Verlinkt({
  text,
  sprache: s,
  eigenes,
  gesehen
}: {
  readonly text: string;
  readonly sprache: Sprache;
  readonly eigenes: string;
  readonly gesehen: Set<string>;
}) {
  return (
    <>
      {verlinke(text, s, eigenes, gesehen).map((stueck, i) => {
        if (typeof stueck === 'string') return stueck;
        const ziel = regelFuerGlossar(stueck.ziel);
        return ziel ? <Verweis key={i} id={ziel.id} kind={stueck.text} leise /> : stueck.text;
      })}
    </>
  );
}

function Block({
  block,
  sprache: s,
  eigenes,
  gesehen
}: {
  readonly block: Glossarblock;
  readonly sprache: Sprache;
  readonly eigenes: string;
  readonly gesehen: Set<string>;
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
                {ziel ? <Verweis id={ziel.id} kind={eintrag} leise /> : eintrag}
              </li>
            );
          })}
        </ul>
      </>
    );
  }
  if (block.typ === 'absatz') {
    return (
      <p className="regel__einleitung">
        <Verlinkt text={block.text[s]} sprache={s} eigenes={eigenes} gesehen={gesehen} />
      </p>
    );
  }
  const teil = unterpunkt(block.text[s]);
  return (
    <p className={block.typ === 'stichpunkt' ? 'regel__punkt regel__punkt--tief' : 'regel__punkt'}>
      {teil.kopf ? <strong>{teil.kopf} </strong> : null}
      <Verlinkt text={teil.rest} sprache={s} eigenes={eigenes} gesehen={gesehen} />
    </p>
  );
}
