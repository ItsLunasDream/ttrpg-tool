/**
 * Der Magic Item Creator.
 *
 * Zwei Ansichten wie in den anderen Werkzeugen: die Sammlung als Kacheln mit
 * Suche und dem Erzeuger darueber, und ein Gegenstand zum Bearbeiten. Ein
 * gewuerfelter Gegenstand ist ein Entwurf — auf die Platte kommt er erst mit
 * „Speichern".
 *
 * Siehe `docs/magicitems.md`.
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';
import { SELTENHEITEN, SELTENHEIT_NAME, gegenstandswert, type Seltenheit } from '@suite/srd';
import { api } from './api';
import { getLanguage, setLanguage, t } from './i18n';
import { erzeuge, wuerfleFluch, wuerfleWirkung, type Gegenstand, type Sprache } from '../shared/erzeuge';
import type { Eintrag } from '../shared/ablage';
import { alsFoundryDatei } from '../shared/foundry';
import { ARTEN, ART_NAME, ART_ZEICHEN, VERBRAUCH, type Art } from '../shared/tabellen';

function sprache(): Sprache {
  return getLanguage() === 'de' ? 'de' : 'en';
}

/** Die Farbe der Seltenheit, wie man sie aus Spielen kennt. */
const FARBE: Record<Seltenheit, string> = {
  common: '#9aa0a6',
  uncommon: '#4caf6a',
  rare: '#4a8fe0',
  veryRare: '#a064e0',
  legendary: '#e0a33a'
};

function zahl(wert: number): string {
  return wert.toLocaleString(sprache() === 'de' ? 'de-DE' : 'en-US');
}

function leer(): Gegenstand {
  return {
    id: '',
    name: '',
    art: 'wundersam',
    seltenheit: 'uncommon',
    einstimmung: false,
    wirkungen: [''],
    fluch: '',
    wert: gegenstandswert('uncommon'),
    notiz: '',
    geaendert: ''
  };
}

export function App() {
  const [, neuZeichnen] = useState(0);
  const [eintraege, setEintraege] = useState<readonly Eintrag[]>([]);
  const [suche, setSuche] = useState('');
  const [offen, setOffen] = useState<Gegenstand | null>(null);
  const [istNeu, setIstNeu] = useState(false);
  const [art, setArt] = useState<Art | ''>('');
  const [seltenheit, setSeltenheit] = useState<Seltenheit | ''>('');
  const [fluch, setFluch] = useState(true);
  const [meldung, setMeldung] = useState('');
  // Fuer welche Seltenheit die Wirkungen gewuerfelt wurden. Weicht die
  // eingestellte davon ab, bietet ein Knopf neue Wirkungen an — von selbst
  // ueberschrieben wird nichts, die Texte gehoeren der Spielleitung.
  const [wirkungenFuer, setWirkungenFuer] = useState<Seltenheit | null>(null);
  const [fehler, setFehler] = useState('');

  const ladeListe = useCallback(async () => {
    setEintraege(await api.sammlung.liste());
  }, []);

  useEffect(() => {
    void ladeListe();
  }, [ladeListe]);

  useEffect(() => {
    setLanguage(DEFAULT_LANGUAGE);
    return api.sprache.beiWechsel((neu) => {
      setLanguage((neu === 'de' ? 'de' : 'en') as Language);
      neuZeichnen((n) => n + 1);
    });
  }, []);

  useEffect(
    () =>
      api.beiSuchtreffer((kennung) => {
        void (async () => {
          const geladen = await api.sammlung.lesen(kennung);
          if (geladen) {
            setOffen(geladen);
            setWirkungenFuer(geladen.seltenheit);
            setIstNeu(false);
          } else setFehler(t('fehler.lesen'));
        })();
      }),
    []
  );

  const spr = sprache();
  const gefunden = useMemo(() => {
    const worte = suche.toLowerCase().split(/\s+/).filter(Boolean);
    return [...eintraege]
      .filter((e) => {
        const heu = `${e.name} ${ART_NAME[e.art].de} ${ART_NAME[e.art].en} ${SELTENHEIT_NAME[e.seltenheit].de} ${SELTENHEIT_NAME[e.seltenheit].en} ${e.kurz}`.toLowerCase();
        return worte.every((w) => heu.includes(w));
      })
      .sort((a, b) => b.geaendert.localeCompare(a.geaendert));
  }, [eintraege, suche]);

  const wuerfle = () => {
    const neu = erzeuge(
      { art: art || undefined, seltenheit: seltenheit || undefined, fluchChance: fluch ? 0.1 : 0 },
      spr
    );
    setOffen(neu);
    setWirkungenFuer(neu.seltenheit);
    setIstNeu(true);
    setMeldung('');
    setFehler('');
  };

  const speichere = async (): Promise<Gegenstand | null> => {
    if (!offen) return null;
    setFehler('');
    const name = offen.name.trim() || ART_NAME[offen.art][spr];
    const fertig = { ...offen, name, wirkungen: offen.wirkungen.filter((w) => w.trim()) };
    const ergebnis = await api.sammlung.speichern(fertig, istNeu);
    if (!ergebnis.ok) {
      setFehler(t('fehler.speichern', { detail: ergebnis.text }));
      return null;
    }
    setOffen({ ...fertig, id: ergebnis.id });
    setIstNeu(false);
    setMeldung(t('gespeichert'));
    await ladeListe();
    return { ...fertig, id: ergebnis.id };
  };

  /*
   * In den Loot Generator. Ein ungespeicherter Entwurf wird vorher
   * gespeichert — in den Loot kann nur, was auch in der Sammlung steht.
   */
  const inDenLoot = async () => {
    if (!offen) return;
    const gespeichert = await speichere();
    if (!gespeichert) return;
    if (await api.sammlung.inDenLoot(gespeichert.id)) {
      setOffen({ ...gespeichert, imLoot: true });
      setMeldung(t('loot.fertig'));
    } else setFehler(t('loot.fehler'));
  };

  /*
   * Die Leiste des Erzeugers steht in BEIDEN Ansichten: auch mit einem
   * offenen Gegenstand soll man Art und Seltenheit fuer den naechsten
   * einstellen koennen, und „Neu wuerfeln" darf nach dem Speichern nicht
   * verschwinden (Rueckmeldung).
   */
  const erzeugerLeiste = (imGegenstand: boolean) => (
    <>
      {/*
        Der Erzeuger steht oben und ist mit einem Klick benutzt: nichts
        waehlen heisst Zufall. Wer eine Art oder Seltenheit festlegt, bekommt
        genau die.
      */}
      <div className="erzeuger">
        <select
          className="feld__wahl"
          aria-label={t('erzeuger.art')}
          value={art}
          data-erzeuger="art"
          onChange={(e) => setArt(e.target.value as Art | '')}
        >
          <option value="">
            {t('erzeuger.art')}: {t('erzeuger.zufall')}
          </option>
          {ARTEN.map((a) => (
            <option key={a} value={a}>
              {ART_ZEICHEN[a]} {ART_NAME[a][spr]}
            </option>
          ))}
        </select>
        <select
          className="feld__wahl"
          aria-label={t('erzeuger.seltenheit')}
          value={seltenheit}
          data-erzeuger="seltenheit"
          onChange={(e) => setSeltenheit(e.target.value as Seltenheit | '')}
        >
          <option value="">
            {t('erzeuger.seltenheit')}: {t('erzeuger.zufall')}
          </option>
          {SELTENHEITEN.map((s) => (
            <option key={s} value={s}>
              {SELTENHEIT_NAME[s][spr]}
            </option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={fluch} onChange={(e) => setFluch(e.target.checked)} />{' '}
          {t('erzeuger.fluch')}
        </label>
        <span className="leiste__luecke" />
        <button type="button" className="knopf" data-leer onClick={() => {
          setOffen(leer());
          setWirkungenFuer(null);
          setIstNeu(true);
        }}>
          + {t('leer')}
        </button>
        <button
          type="button"
          className="knopf knopf--haupt"
          data-wuerfeln
          data-nochmal={imGegenstand ? true : undefined}
          onClick={wuerfle}
        >
          ⚄ {imGegenstand ? t('nochmal') : t('erzeuger.los')}
        </button>
      </div>
    </>
  );

  // --- Ein Gegenstand -------------------------------------------------------
  if (offen) {
    const setze = (teil: Partial<Gegenstand>) => {
      const neu = { ...offen, ...teil };
      // Der Wert folgt der Seltenheit — ausser bei der Schriftrolle, deren
      // Wert am Zaubergrad haengt und beim Wuerfeln schon feststand.
      if ((teil.seltenheit || teil.art) && neu.art !== 'schriftrolle') {
        neu.wert = gegenstandswert(neu.seltenheit, { verbrauch: VERBRAUCH[neu.art] });
      }
      setOffen(neu);
      setMeldung('');
    };
    return (
      <div className="rahmen">
        <Kopf />
        {erzeugerLeiste(true)}
        <div className="leiste">
          <button
            type="button"
            className="knopf"
            onClick={() => {
              setOffen(null);
              setIstNeu(false);
              setMeldung('');
            }}
          >
            ← {t('zurueck')}
          </button>
          <span className="leiste__luecke" />
          <button
            type="button"
            className="knopf"
            data-foundry
            onClick={() => {
              void (async () => {
                const datei = alsFoundryDatei(offen);
                const ergebnis = await api.foundry(datei.name, datei.inhalt);
                if (ergebnis.ok) setMeldung(t('foundry.fertig', { pfad: ergebnis.text }));
                else if (ergebnis.text) setFehler(t('fehler.speichern', { detail: ergebnis.text }));
              })();
            }}
          >
            {t('foundry')}
          </button>
          <button
            type="button"
            className="knopf"
            data-loot
            disabled={Boolean(offen.imLoot)}
            onClick={() => void inDenLoot()}
          >
            {offen.imLoot ? t('loot.drin') : t('loot')}
          </button>
          <button type="button" className="knopf knopf--haupt" data-speichern onClick={() => void speichere()}>
            {t('speichern')}
          </button>
        </div>

        <section className="karte">
          <label className="feld">
            <span className="feld__name">{t('feld.name')}</span>
            <input
              className="feld__eingabe"
              value={offen.name}
              data-feld="name"
              onChange={(e) => setze({ name: e.target.value })}
            />
          </label>

          <div className="kopfzeile">
            <label className="feld">
              <span className="feld__name">{t('erzeuger.art')}</span>
              <select
                className="feld__wahl"
                value={offen.art}
                onChange={(e) => setze({ art: e.target.value as Art })}
              >
                {ARTEN.map((a) => (
                  <option key={a} value={a}>
                    {ART_NAME[a][spr]}
                  </option>
                ))}
              </select>
            </label>
            <label className="feld">
              <span className="feld__name">{t('erzeuger.seltenheit')}</span>
              <select
                className="feld__wahl"
                value={offen.seltenheit}
                onChange={(e) => setze({ seltenheit: e.target.value as Seltenheit })}
              >
                {SELTENHEITEN.map((s) => (
                  <option key={s} value={s}>
                    {SELTENHEIT_NAME[s][spr]}
                  </option>
                ))}
              </select>
            </label>
            <label className="feld">
              <input
                type="checkbox"
                checked={offen.einstimmung}
                onChange={(e) => setze({ einstimmung: e.target.checked })}
              />{' '}
              {t('feld.einstimmung')}
            </label>
          </div>
          <p className="wert" title={t('wert.hinweis')} data-wert>
            {t('feld.wert', { wert: zahl(offen.wert) })}
          </p>
          {wirkungenFuer && wirkungenFuer !== offen.seltenheit ? (
            <p className="anpassen">
              <button
                type="button"
                className="knopf"
                data-anpassen
                onClick={() => {
                  if (offen.wirkungen.some((w) => w.trim()) && !confirm(t('anpassen.sicher'))) return;
                  const neu = erzeuge({ art: offen.art, seltenheit: offen.seltenheit, fluchChance: 0 }, spr);
                  setze({ wirkungen: neu.wirkungen, einstimmung: neu.einstimmung || Boolean(offen.fluch.trim()) });
                  setWirkungenFuer(offen.seltenheit);
                }}
              >
                ⚄ {t('anpassen', { seltenheit: SELTENHEIT_NAME[offen.seltenheit][spr] })}
              </button>
            </p>
          ) : null}

          <h3>{t('feld.wirkungen')}</h3>
          <ul className="wirkungsliste">
            {offen.wirkungen.map((w, i) => (
              <li key={i}>
                <textarea
                  className="feld__flaeche"
                  rows={2}
                  value={w}
                  data-wirkung={i}
                  onChange={(e) =>
                    setze({ wirkungen: offen.wirkungen.map((x, j) => (j === i ? e.target.value : x)) })
                  }
                />
                <div className="zeilenknoepfe">
                  <button
                    type="button"
                    className="knopf"
                    data-wirkung-neu={i}
                    aria-label={t('feld.wirkungNeu')}
                    title={t('feld.wirkungNeu')}
                    onClick={() =>
                      setze({
                        wirkungen: offen.wirkungen.map((x, j) =>
                          j === i ? wuerfleWirkung(offen.art, offen.seltenheit, spr, offen.wirkungen) : x
                        )
                      })
                    }
                  >
                    ⚄
                  </button>
                  <button
                    type="button"
                    className="knopf"
                    aria-label={t('feld.wirkungWeg')}
                    title={t('feld.wirkungWeg')}
                    onClick={() => setze({ wirkungen: offen.wirkungen.filter((_, j) => j !== i) })}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/*
            Ausdruecklich noch eine Wirkung oder einen Fluch wuerfeln, nicht
            nur ein leeres Feld anlegen (Rueckmeldung).
          */}
          <div className="knopfreihe">
            <button
              type="button"
              className="knopf"
              data-wirkung-wuerfeln
              onClick={() =>
                setze({
                  wirkungen: [
                    ...offen.wirkungen.filter((w) => w.trim()),
                    wuerfleWirkung(offen.art, offen.seltenheit, spr, offen.wirkungen)
                  ]
                })
              }
            >
              ⚄ {t('feld.wirkungWuerfeln')}
            </button>
            <button
              type="button"
              className="knopf"
              onClick={() => setze({ wirkungen: [...offen.wirkungen, ''] })}
            >
              + {t('feld.wirkungDazu')}
            </button>
          </div>

          <label className="feld feld--hoch fluch">
            <span className="feld__name feld__name--mitknopf">
              {t('feld.fluch')}
              <button
                type="button"
                className="knopf knopf--klein"
                data-fluch-wuerfeln
                onClick={(e) => {
                  e.preventDefault();
                  // Ein Fluch bindet immer: mit ihm verlangt der Gegenstand Einstimmung.
                  setze({ fluch: wuerfleFluch(spr, offen.fluch), einstimmung: offen.art !== 'trank' && offen.art !== 'schriftrolle' ? true : offen.einstimmung });
                }}
              >
                ⚄ {offen.fluch.trim() ? t('feld.fluchNeu') : t('feld.fluchWuerfeln')}
              </button>
            </span>
            <textarea
              className="feld__flaeche"
              rows={2}
              value={offen.fluch}
              placeholder={t('feld.fluchHinweis')}
              onChange={(e) => setze({ fluch: e.target.value })}
            />
          </label>

          <label className="feld feld--hoch">
            <span className="feld__name">{t('feld.notiz')}</span>
            <textarea
              className="feld__flaeche"
              rows={5}
              value={offen.notiz}
              onChange={(e) => setze({ notiz: e.target.value })}
            />
          </label>

          {meldung ? <p className="meldung">{meldung}</p> : null}
          {fehler ? <p className="fehler">{fehler}</p> : null}
        </section>
      </div>
    );
  }

  // --- Die Sammlung ---------------------------------------------------------
  return (
    <div className="rahmen">
      <Kopf />

      {erzeugerLeiste(false)}

      <div className="leiste">
        <input
          className="feld__eingabe leiste__suche"
          type="search"
          value={suche}
          placeholder={t('liste.suche')}
          aria-label={t('liste.suche')}
          onChange={(e) => setSuche(e.target.value)}
        />
      </div>

      <p className="anzahl">
        {gefunden.length === 1 ? t('liste.eine') : t('liste.anzahl', { anzahl: gefunden.length })}
      </p>

      {eintraege.length === 0 ? (
        <p className="hinweis">{t('liste.leer')}</p>
      ) : gefunden.length === 0 ? (
        <p className="hinweis">{t('liste.nichts')}</p>
      ) : (
        <ul className="kacheln">
          {gefunden.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="gegenstandskachel"
                data-id={e.id}
                style={{ '--marke': FARBE[e.seltenheit] } as CSSProperties}
                onClick={() => {
                  void (async () => {
                    const geladen = await api.sammlung.lesen(e.id);
                    if (geladen) {
                      setOffen(geladen);
                      setWirkungenFuer(geladen.seltenheit);
                      setIstNeu(false);
                    } else setFehler(t('fehler.lesen'));
                  })();
                }}
              >
                <span className="gegenstandskachel__name">
                  <span className="gegenstandskachel__zeichen" aria-hidden="true">
                    {ART_ZEICHEN[e.art]}
                  </span>{' '}
                  {e.name}
                </span>
                <span className="gegenstandskachel__zahl">
                  <span className="seltenheit">{SELTENHEIT_NAME[e.seltenheit][spr]}</span> ·{' '}
                  {ART_NAME[e.art][spr]}
                  {e.einstimmung ? ` · ${t('einstimmung')}` : ''}
                  {e.verflucht ? ` · ${t('verflucht')}` : ''}
                </span>
                {e.kurz ? <span className="gegenstandskachel__unten">{e.kurz}</span> : null}
              </button>
              <button
                type="button"
                className="gegenstandskachel__weg"
                aria-label={t('loeschen')}
                title={t('loeschen')}
                onClick={() => {
                  if (!confirm(t('loeschen.sicher', { name: e.name }))) return;
                  void (async () => {
                    await api.sammlung.loeschen(e.id);
                    await ladeListe();
                  })();
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {fehler ? <p className="fehler">{fehler}</p> : null}
    </div>
  );
}

function Kopf() {
  return (
    <header className="kopf">
      <h1>{t('titel')}</h1>
      <p>{t('untertitel')}</p>
    </header>
  );
}
