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
  alsRegel,
  glossarId,
  regelFuerGlossar,
  regelMitNamen,
  unterpunkt,
  type Regel
} from '../shared/bestand';
import type { Glossarblock } from '@suite/srd/glossar';
import { finde } from '../shared/suche';
import { verlinke } from '../shared/verweise';
import { zerlege, type Hausregel } from '../shared/hausregeln';

/**
 * Was ein Verweis kann: oeffnen und seine Vorschau zeigen. Als Kontext, weil
 * Verweise tief in Bloecken, Listen und Saetzen stecken.
 */
interface Verweiskontext {
  /** Ein Eintrag nach Kennung, offiziell oder Hausregel. */
  readonly nach: (id: string) => Regel | undefined;
  readonly oeffne: (id: string) => void;
  readonly zeige: (id: string, rect: DOMRect) => void;
  readonly verberge: () => void;
}

const VerweisKontext = createContext<Verweiskontext>({
  nach: () => undefined,
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
  const [hausregeln, setHausregeln] = useState<readonly Hausregel[]>([]);
  /** Die Hausregel, die gerade geschrieben wird. `neu`: noch nicht auf der Platte. */
  const [bearbeitung, setBearbeitung] = useState<{ regel: Hausregel; neu: boolean } | null>(null);
  const [fehler, setFehler] = useState('');

  const ladeHausregeln = async () => {
    try {
      setHausregeln(await api.hausregeln.liste());
    } catch {
      setHausregeln([]);
    }
  };
  useEffect(() => {
    void ladeHausregeln();
  }, []);

  const regeln = useMemo(
    () => [...hausregeln.map(alsRegel), ...alleRegeln()],
    [hausregeln]
  );
  const regelnRef = useRef(regeln);
  regelnRef.current = regeln;
  const nach = (id: string) => regelnRef.current.find((regel) => regel.id === id);

  const warteDann = (ms: number, tun: () => void) => {
    if (uhr.current !== null) window.clearTimeout(uhr.current);
    uhr.current = window.setTimeout(() => {
      uhr.current = null;
      tun();
    }, ms);
  };

  const verweise = useMemo<Verweiskontext>(
    () => ({
      nach,
      oeffne: (id) => {
        if (uhr.current !== null) window.clearTimeout(uhr.current);
        setVorschau(null);
        setBearbeitung(null);
        setOffenId(id);
      },
      zeige: (id, rect) => warteDann(VORSCHAU_NACH_MS, () => setVorschau({ id, rect })),
      verberge: () => warteDann(VORSCHAU_BLEIBT_MS, () => setVorschau(null))
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const spr = sprache();
  const treffer = useMemo(() => finde(regeln, suche, spr), [regeln, suche, spr]);
  const offen = offenId ? regeln.find((regel) => regel.id === offenId) : undefined;

  const speichereHausregel = async (regel: Hausregel, neu: boolean) => {
    setFehler('');
    const name = regel.name.trim();
    if (!name) {
      setFehler(t('haus.nameFehlt'));
      return;
    }
    const ergebnis = await api.hausregeln.speichern({ ...regel, name }, neu);
    if (!ergebnis.ok) {
      setFehler(t('haus.fehler', { detail: ergebnis.text }));
      return;
    }
    await ladeHausregeln();
    setBearbeitung(null);
    setOffenId(`hausregel/${ergebnis.id}`);
  };

  const loescheHausregel = async (regel: Hausregel) => {
    if (!confirm(t('haus.loeschenSicher', { name: regel.name }))) return;
    await api.hausregeln.loeschen(regel.id);
    await ladeHausregeln();
    setOffenId(regel.bezug || null);
  };

  const neueHausregel = (bezug: string) =>
    setBearbeitung({ regel: { id: '', name: '', bezug, text: '', geaendert: '' }, neu: true });

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
        // Hausregeln kommen erst mit dem Lesen der Platte; darum hier nicht
        // pruefen, ob es den Eintrag gibt — gibt es ihn nicht, steht rechts
        // der leere Hinweis.
        setBearbeitung(null);
        setOffenId(kennung);
        setSuche('');
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
          <button type="button" className="knopf liste__neu" data-hausregel-neu onClick={() => neueHausregel('')}>
            + {t('haus.neu')}
          </button>
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
                      onClick={() => {
                        setBearbeitung(null);
                        setOffenId(regel.id);
                      }}
                    >
                      <span className="eintrag__name">{regel.name[spr]}</span>
                      {regel.art === 'hausregel' ? null : (
                        <span className="eintrag__anders">{regel.name[andere(spr)]}</span>
                      )}
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
          {bearbeitung ? (
            <Hausregelformular
              regel={bearbeitung.regel}
              neu={bearbeitung.neu}
              regeln={regeln}
              fehler={fehler}
              speichern={(regel) => void speichereHausregel(regel, bearbeitung.neu)}
              abbrechen={() => {
                setBearbeitung(null);
                setFehler('');
              }}
            />
          ) : offen && offen.art === 'hausregel' ? (
            <Hausblatt
              regel={hausregeln.find((h) => `hausregel/${h.id}` === offen.id) as Hausregel}
              bearbeiten={(regel) => setBearbeitung({ regel, neu: false })}
              loeschen={(regel) => void loescheHausregel(regel)}
            />
          ) : offen ? (
            <Blatt
              regel={offen}
              daneben={daneben}
              onDaneben={() => setDaneben(!daneben)}
              amTisch={hausregeln.filter((h) => h.bezug === offen.id)}
              hausregelDazu={() => neueHausregel(offen.id)}
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

      {vorschau && nach(vorschau.id) ? (
        <Vorschau
          regel={nach(vorschau.id) as Regel}
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
  onDaneben,
  amTisch,
  hausregelDazu
}: {
  readonly regel: Regel;
  readonly daneben: boolean;
  readonly onDaneben: () => void;
  /** Hausregeln, die diese Regel aendern. */
  readonly amTisch: readonly Hausregel[];
  readonly hausregelDazu: () => void;
}) {
  const spr = sprache();
  const { nach } = useContext(VerweisKontext);
  const sprachen: Sprache[] = daneben ? [spr, andere(spr)] : [spr];

  return (
    <article className="regel" data-regel={regel.id}>
      <header className="regel__kopf">
        <div>
          <span className="regel__art">{ART_NAME[regel.art][spr]}</span>
          <h2>{regel.name[spr]}</h2>
          <p className="regel__anders">{regel.name[andere(spr)]}</p>
        </div>
        <div className="regel__knoepfe">
          <button type="button" className="knopf" data-daneben onClick={onDaneben}>
            {daneben ? t('daneben.aus') : t('daneben')}
          </button>
          <button type="button" className="knopf" data-hausregel-dazu onClick={hausregelDazu}>
            + {t('haus.dazu')}
          </button>
        </div>
      </header>

      {/*
        DIE MARKE. Wer hier nachschlaegt, liest sonst die offizielle Regel und
        vergisst, dass am eigenen Tisch etwas anderes gilt.
      */}
      {amTisch.length > 0 ? (
        <p className="regel__amtisch" data-amtisch>
          <span>{t('haus.amTisch')}</span>{' '}
          {amTisch.map((h, i) => (
            <span key={h.id}>
              {i > 0 ? ', ' : null}
              <Verweis id={`hausregel/${h.id}`} kind={h.name} leise />
            </span>
          ))}
        </p>
      ) : null}

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
            const ziel = nach(id);
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

/**
 * Eine Hausregel lesen. Keine zweite Sprache: uebersetzt wird nicht, was die
 * Spielleitung schreibt. `[[Name]]` wird zum Verweis — ein Verweis ins Leere
 * steht sichtbar anders da, statt still Text zu werden.
 */
function Hausblatt({
  regel,
  bearbeiten,
  loeschen
}: {
  readonly regel: Hausregel | undefined;
  readonly bearbeiten: (regel: Hausregel) => void;
  readonly loeschen: (regel: Hausregel) => void;
}) {
  const spr = sprache();
  const { nach } = useContext(VerweisKontext);
  if (!regel) return null;
  const bezug = regel.bezug ? nach(regel.bezug) : undefined;
  return (
    <article className="regel regel--haus" data-regel={`hausregel/${regel.id}`}>
      <header className="regel__kopf">
        <div>
          <span className="regel__art">{ART_NAME.hausregel[spr]}</span>
          <h2>{regel.name}</h2>
        </div>
        <div className="regel__knoepfe">
          <button type="button" className="knopf" data-hausregel-bearbeiten onClick={() => bearbeiten(regel)}>
            {t('haus.bearbeiten')}
          </button>
          <button type="button" className="knopf" onClick={() => loeschen(regel)}>
            {t('haus.loeschen')}
          </button>
        </div>
      </header>
      {regel.bezug ? (
        <p className="regel__amtisch">
          {t('haus.aendert')}{' '}
          {bezug ? (
            <Verweis id={bezug.id} kind={bezug.name[spr]} leise />
          ) : (
            <span className="verweis--kaputt">{regel.bezug}</span>
          )}
        </p>
      ) : null}
      <section className="regel__fassung">
        {regel.text
          .split(/\n{2,}/)
          .filter((absatz) => absatz.trim())
          .map((absatz, i) => (
            <p key={i} className="regel__einleitung">
              <Hausverweise text={absatz} />
            </p>
          ))}
      </section>
    </article>
  );
}

function Hausverweise({ text }: { readonly text: string }) {
  const { nach } = useContext(VerweisKontext);
  const alle = alleRegeln();
  return (
    <>
      {zerlege(text).map((stueck, i) => {
        if (typeof stueck === 'string') return stueck;
        const gesucht = stueck.verweis.toLowerCase();
        const ziel =
          alle.find((r) => r.name.de.toLowerCase() === gesucht || r.name.en.toLowerCase() === gesucht) ??
          nach(stueck.verweis);
        return ziel ? (
          <Verweis key={i} id={ziel.id} kind={stueck.verweis} leise />
        ) : (
          <span key={i} className="verweis--kaputt" title={t('haus.insLeere')}>
            {stueck.verweis}
          </span>
        );
      })}
    </>
  );
}

function Hausregelformular({
  regel,
  neu,
  regeln,
  fehler,
  speichern,
  abbrechen
}: {
  readonly regel: Hausregel;
  readonly neu: boolean;
  readonly regeln: readonly Regel[];
  readonly fehler: string;
  readonly speichern: (regel: Hausregel) => void;
  readonly abbrechen: () => void;
}) {
  const spr = sprache();
  const [entwurf, setEntwurf] = useState(regel);
  const offizielle = useMemo(
    () =>
      regeln
        .filter((r) => r.art !== 'hausregel')
        .sort((a, b) => a.name[spr].localeCompare(b.name[spr], spr)),
    [regeln, spr]
  );
  return (
    <form
      className="hausformular"
      data-hausregel-formular
      onSubmit={(e) => {
        e.preventDefault();
        speichern(entwurf);
      }}
    >
      <h2>{neu ? t('haus.neu') : t('haus.bearbeiten')}</h2>
      <label className="hausformular__feld">
        <span>{t('haus.name')}</span>
        <input
          autoFocus
          value={entwurf.name}
          data-feld="name"
          onChange={(e) => setEntwurf({ ...entwurf, name: e.target.value })}
        />
      </label>
      <label className="hausformular__feld">
        <span>{t('haus.bezug')}</span>
        <select
          value={entwurf.bezug}
          data-feld="bezug"
          onChange={(e) => setEntwurf({ ...entwurf, bezug: e.target.value })}
        >
          <option value="">{t('haus.keinBezug')}</option>
          {offizielle.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name[spr]}
            </option>
          ))}
        </select>
      </label>
      <label className="hausformular__feld">
        <span>{t('haus.text')}</span>
        <textarea
          rows={10}
          value={entwurf.text}
          data-feld="text"
          placeholder={t('haus.textHinweis')}
          onChange={(e) => setEntwurf({ ...entwurf, text: e.target.value })}
        />
      </label>
      {fehler ? <p className="hausformular__fehler">{fehler}</p> : null}
      <div className="regel__knoepfe">
        <button type="submit" className="knopf knopf--haupt" data-hausregel-speichern>
          {t('haus.speichern')}
        </button>
        <button type="button" className="knopf" onClick={abbrechen}>
          {t('haus.abbrechen')}
        </button>
      </div>
    </form>
  );
}

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
