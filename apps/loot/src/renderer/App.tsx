/**
 * Der Loot Generator.
 *
 * Zwei Ansichten wie in den anderen Werkzeugen: die Sammlung als Kacheln
 * mit Suche (und einem Wurf direkt von der Kachel, fuer den Spielabend),
 * und eine Tabelle zum Wuerfeln und Bearbeiten. Gewuerfelt wird immer auf
 * den Stand im Eingabefeld, auch ungespeichert — so sieht man beim
 * Schreiben sofort, was herauskommt.
 *
 * Siehe `docs/loot.md`.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';
import { wuerfle, wuerfleReihe, type Ergebnis } from '@suite/tabellen';
import { api } from './api';
import { setLanguage, t, type TextKey } from './i18n';
import {
  alsEintraege,
  alsZeilen,
  naechsterName,
  pruefe,
  type Befund,
  type Gespeichert,
  type Kachel
} from '../shared/ablage';

/** Was im Bearbeiten-Feld steht. Die Zeilen bleiben Text, bis gespeichert wird. */
interface Entwurf {
  readonly id: string;
  readonly name: string;
  readonly wuerfel: string;
  readonly ohneZuruecklegen: boolean;
  readonly zeilen: string;
  readonly notiz: string;
}

function alsEntwurf(g: Gespeichert): Entwurf {
  return {
    id: g.id,
    name: g.name,
    wuerfel: g.wuerfel ?? '',
    ohneZuruecklegen: Boolean(g.ohneZuruecklegen),
    zeilen: alsZeilen(g.eintraege),
    notiz: g.notiz
  };
}

function alsTabelle(e: Entwurf, ersatzName: string): Gespeichert {
  return {
    id: e.id,
    name: e.name.trim() || ersatzName,
    ...(e.wuerfel.trim() ? { wuerfel: e.wuerfel.trim() } : {}),
    ohneZuruecklegen: e.ohneZuruecklegen,
    eintraege: alsEintraege(e.zeilen),
    notiz: e.notiz,
    geaendert: ''
  };
}

/**
 * Ein Wurf als Notiz: die Ergebnisse als Liste, darunter, woher sie kamen.
 * Die Herkunft steht dabei, weil man sich spaeter fragt, welche Tabelle
 * das war — der Wurf selbst ist dann laengst vergessen.
 */
function alsNotiz(ergebnisse: readonly Ergebnis[]): string {
  const namen = new Set<string>();
  const sammle = (e: Ergebnis) => {
    if (!e.fehler) namen.add(e.tabelle);
    e.teile.forEach(sammle);
  };
  ergebnisse.forEach(sammle);
  return [...ergebnisse.map((e) => `- ${e.text}`), '', `*${[...namen].join(' · ')}*`, ''].join('\n');
}

/** Irgendwo im Baum etwas, das nicht aufging? */
function hatFehler(e: Ergebnis): boolean {
  return Boolean(e.fehler) || e.teile.some(hatFehler);
}

function befundText(b: Befund): string {
  const { art, ...rest } = b;
  if (b.art === 'luecke' && b.von === b.bis) return t('befund.luecke1', { von: b.von });
  return t(`befund.${art}` as TextKey, rest as Record<string, string | number>);
}

export function App() {
  const [, neuZeichnen] = useState(0);
  const [kacheln, setKacheln] = useState<readonly Kachel[]>([]);
  const [alle, setAlle] = useState<readonly Gespeichert[]>([]);
  const [suche, setSuche] = useState('');
  const [offen, setOffen] = useState<Entwurf | null>(null);
  const [istNeu, setIstNeu] = useState(false);
  const [veraendert, setVeraendert] = useState(false);
  const [anzahl, setAnzahl] = useState(1);
  const [ergebnisse, setErgebnisse] = useState<readonly Ergebnis[]>([]);
  const [schnell, setSchnell] = useState<Ergebnis | null>(null);
  const [meldung, setMeldung] = useState('');
  const [fehler, setFehler] = useState('');

  const ladeListe = useCallback(async () => {
    const [k, a] = await Promise.all([api.sammlung.liste(), api.sammlung.alle()]);
    setKacheln(k);
    setAlle(a);
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

  const oeffne = useCallback(async (id: string) => {
    const geladen = await api.sammlung.lesen(id);
    if (!geladen) {
      setFehler(t('fehler.lesen'));
      return;
    }
    setOffen(alsEntwurf(geladen));
    setIstNeu(false);
    setVeraendert(false);
    setErgebnisse([]);
    setMeldung('');
    setFehler('');
  }, []);

  useEffect(() => api.beiSuchtreffer((kennung) => void oeffne(kennung)), [oeffne]);

  const gefunden = useMemo(() => {
    const worte = suche.toLowerCase().split(/\s+/).filter(Boolean);
    return [...kacheln]
      .filter((k) => {
        const heu = `${k.name} ${k.kurz}`.toLowerCase();
        return worte.every((w) => heu.includes(w));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [kacheln, suche]);

  const ersatzName = useMemo(() => naechsterName(t('neu.name'), alle.map((a) => a.name)), [alle]);

  // Die Tabelle, wie sie gerade im Feld steht, und der Bestand drumherum:
  // Verweise auf sie selbst gehen auf die bearbeitete Fassung.
  const aktuell = useMemo(() => (offen ? alsTabelle(offen, ersatzName) : null), [offen, ersatzName]);
  const bestand = useMemo(() => {
    if (!aktuell) return alle;
    const ohne = alle.filter((a) => a.id !== aktuell.id || !aktuell.id);
    return [...ohne, aktuell];
  }, [alle, aktuell]);
  const befunde = useMemo(() => (aktuell ? pruefe(aktuell, alle) : []), [aktuell, alle]);

  // --- Eine Tabelle ---------------------------------------------------------
  if (offen && aktuell) {
    const setze = (teil: Partial<Entwurf>) => {
      setOffen({ ...offen, ...teil });
      setVeraendert(true);
      setMeldung('');
    };

    const speichere = async () => {
      setFehler('');
      const ergebnis = await api.sammlung.speichern(aktuell, istNeu);
      if (!ergebnis.ok) {
        setFehler(t('fehler.speichern', { detail: ergebnis.text }));
        return;
      }
      setOffen({ ...offen, id: ergebnis.id, name: aktuell.name });
      setIstNeu(false);
      setVeraendert(false);
      setMeldung(t('gespeichert'));
      await ladeListe();
    };

    const insStory = async () => {
      const ergebnis = await api.story(t('story.titel', { name: aktuell.name }), alsNotiz(ergebnisse));
      if (ergebnis.ok) setMeldung(t('story.fertig', { text: ergebnis.text }));
      else setFehler(t('story.fehler', { text: ergebnis.text }));
    };

    const kopiere = async () => {
      try {
        await navigator.clipboard.writeText(ergebnisse.map((e) => e.text).join('\n'));
        setMeldung(t('wurf.kopiert'));
      } catch {
        // Ohne Zwischenablage bleibt der Text zum Markieren stehen.
      }
    };

    return (
      <div className="rahmen">
        <Kopf />
        <div className="leiste">
          <button
            type="button"
            className="knopf"
            onClick={() => {
              if (veraendert && !confirm(t('verwerfen.sicher'))) return;
              setOffen(null);
              setErgebnisse([]);
              setMeldung('');
              setFehler('');
            }}
          >
            ← {t('zurueck')}
          </button>
          <span className="leiste__luecke" />
          <button
            type="button"
            className="knopf"
            data-weitergeben
            onClick={() => {
              if (istNeu || veraendert) {
                setMeldung(t('weitergeben.erst'));
                return;
              }
              void (async () => {
                const ergebnis = await api.sammlung.weitergeben(offen.id);
                if (ergebnis.ok) setMeldung(t('weitergeben.fertig', { pfad: ergebnis.text }));
                else if (ergebnis.text) setFehler(t('fehler.speichern', { detail: ergebnis.text }));
              })();
            }}
          >
            {t('weitergeben')}
          </button>
          {!istNeu ? (
            <button
              type="button"
              className="knopf"
              data-loeschen
              onClick={() => {
                if (!confirm(t('loeschen.sicher', { name: aktuell.name }))) return;
                void (async () => {
                  await api.sammlung.loeschen(offen.id);
                  setOffen(null);
                  setErgebnisse([]);
                  await ladeListe();
                })();
              }}
            >
              {t('loeschen')}
            </button>
          ) : null}
          <button type="button" className="knopf knopf--haupt" data-speichern onClick={() => void speichere()}>
            {t('speichern')}
          </button>
        </div>

        <section className="karte wurfkarte">
          <div className="wurfzeile">
            <h2>{aktuell.name}</h2>
            <span className="leiste__luecke" />
            <label className="feld feld--zeile">
              <span className="feld__name">{t('wurf.anzahl')}</span>
              <input
                className="feld__eingabe feld__eingabe--zahl"
                type="number"
                min={1}
                max={20}
                value={anzahl}
                data-anzahl
                onChange={(e) => setAnzahl(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              />
            </label>
            <button
              type="button"
              className="knopf knopf--haupt"
              data-wuerfeln
              disabled={aktuell.eintraege.length === 0}
              onClick={() => {
                setErgebnisse(wuerfleReihe(aktuell, bestand, anzahl, Math.random));
                setMeldung('');
              }}
            >
              ⚄ {t('wuerfeln')}
            </button>
          </div>
          {aktuell.eintraege.length === 0 ? <p className="hinweis">{t('wurf.leer')}</p> : null}
          {ergebnisse.length > 0 ? (
            <>
              <ol className="ergebnisse" data-ergebnisse>
                {ergebnisse.map((e, i) => (
                  <ErgebnisZeile key={i} ergebnis={e} />
                ))}
              </ol>
              <div className="knopfreihe">
                <button type="button" className="knopf" onClick={() => void kopiere()}>
                  {t('wurf.kopieren')}
                </button>
                <button type="button" className="knopf" data-story onClick={() => void insStory()}>
                  {t('story')}
                </button>
              </div>
            </>
          ) : null}
        </section>

        <section className="karte">
          <div className="kopfzeile">
            <label className="feld feld--breit">
              <span className="feld__name">{t('feld.name')}</span>
              <input
                className="feld__eingabe"
                value={offen.name}
                placeholder={istNeu ? ersatzName : ''}
                data-feld="name"
                onChange={(e) => setze({ name: e.target.value })}
              />
            </label>
            <label className="feld">
              <span className="feld__name">{t('feld.wuerfel')}</span>
              <input
                className="feld__eingabe"
                value={offen.wuerfel}
                placeholder={t('feld.wuerfelHinweis')}
                data-feld="wuerfel"
                onChange={(e) => setze({ wuerfel: e.target.value })}
              />
            </label>
          </div>
          <label className="feld feld--haken" title={t('feld.ohneZuruecklegenHinweis')}>
            <input
              type="checkbox"
              checked={offen.ohneZuruecklegen}
              data-feld="ohneZuruecklegen"
              onChange={(e) => setze({ ohneZuruecklegen: e.target.checked })}
            />{' '}
            {t('feld.ohneZuruecklegen')}
            <span className="hinweis--klein"> · {t('feld.ohneZuruecklegenHinweis')}</span>
          </label>

          <label className="feld feld--hoch">
            <span className="feld__name">{t('feld.eintraege')}</span>
            <textarea
              className="feld__flaeche zeilenfeld"
              rows={12}
              spellCheck={false}
              value={offen.zeilen}
              data-feld="zeilen"
              onChange={(e) => setze({ zeilen: e.target.value })}
            />
          </label>
          <p className="hinweis hinweis--klein">{t('feld.eintraegeHinweis')}</p>
          {befunde.length > 0 ? (
            <ul className="befunde" data-befunde>
              {befunde.map((b, i) => (
                <li key={i}>{befundText(b)}</li>
              ))}
            </ul>
          ) : null}

          <label className="feld feld--hoch">
            <span className="feld__name">{t('feld.notiz')}</span>
            <textarea
              className="feld__flaeche"
              rows={3}
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

      <div className="leiste">
        <input
          className="feld__eingabe leiste__suche"
          type="search"
          value={suche}
          placeholder={t('liste.suche')}
          aria-label={t('liste.suche')}
          onChange={(e) => setSuche(e.target.value)}
        />
        <span className="leiste__luecke" />
        <button
          type="button"
          className="knopf"
          data-einlesen
          onClick={() => {
            void (async () => {
              const ergebnis = await api.sammlung.einlesen();
              if (ergebnis.ok) {
                setMeldung(
                  ergebnis.namen.length ? t('einlesen.fertig', { namen: ergebnis.namen.join(', ') }) : t('einlesen.nichts')
                );
                await ladeListe();
              } else if (ergebnis.text) setFehler(t('fehler.speichern', { detail: ergebnis.text }));
            })();
          }}
        >
          {t('einlesen')}
        </button>
        <button
          type="button"
          className="knopf knopf--haupt"
          data-neu
          onClick={() => {
            setOffen({ id: '', name: '', wuerfel: '', ohneZuruecklegen: false, zeilen: '', notiz: '' });
            setIstNeu(true);
            setVeraendert(false);
            setErgebnisse([]);
            setMeldung('');
            setFehler('');
          }}
        >
          + {t('neu')}
        </button>
      </div>

      {schnell ? (
        <section className="karte schnellwurf" data-schnellwurf>
          <div className="wurfzeile">
            <h3>
              {t('wurf.letzter')}: {schnell.tabelle}
            </h3>
            <span className="leiste__luecke" />
            <button type="button" className="knopf" aria-label="×" onClick={() => setSchnell(null)}>
              ×
            </button>
          </div>
          <ol className="ergebnisse">
            <ErgebnisZeile ergebnis={schnell} />
          </ol>
        </section>
      ) : null}

      <p className="anzahl">
        {gefunden.length === 1 ? t('liste.eine') : t('liste.anzahl', { anzahl: gefunden.length })}
      </p>

      {kacheln.length === 0 ? (
        <p className="hinweis">{t('liste.leer')}</p>
      ) : gefunden.length === 0 ? (
        <p className="hinweis">{t('liste.nichts')}</p>
      ) : (
        <ul className="kacheln">
          {gefunden.map((k) => (
            <li key={k.id}>
              <button type="button" className="tabellenkachel" data-id={k.id} onClick={() => void oeffne(k.id)}>
                <span className="tabellenkachel__name">{k.name}</span>
                <span className="tabellenkachel__zahl">
                  {k.wuerfel || t('kachel.gleich')} · {t('kachel.eintraege', { anzahl: k.anzahl })}
                  {k.ohneZuruecklegen ? ` · ${t('kachel.ohneZuruecklegen')}` : ''}
                </span>
                {k.kurz ? <span className="tabellenkachel__unten">{k.kurz}</span> : null}
              </button>
              <button
                type="button"
                className="tabellenkachel__wurf"
                data-schnell={k.id}
                aria-label={t('schnell')}
                title={t('schnell')}
                disabled={k.anzahl === 0}
                onClick={() => {
                  const tabelle = alle.find((a) => a.id === k.id);
                  if (tabelle) setSchnell(wuerfle(tabelle, alle, Math.random));
                }}
              >
                ⚄
              </button>
            </li>
          ))}
        </ul>
      )}
      {meldung ? <p className="meldung">{meldung}</p> : null}
      {fehler ? <p className="fehler">{fehler}</p> : null}
    </div>
  );
}

/** Ein Ergebnis mit aufklappbarer Herkunft, wenn es Verweise hatte. */
function ErgebnisZeile({ ergebnis }: { readonly ergebnis: Ergebnis }) {
  const unvollstaendig = hatFehler(ergebnis);
  return (
    <li className="ergebnis" data-ergebnis>
      <span className="ergebnis__text">{ergebnis.text}</span>
      {unvollstaendig ? <span className="ergebnis__warnung"> ⚠ {t('wurf.unvollstaendig')}</span> : null}
      {ergebnis.teile.length > 0 || ergebnis.wurf !== undefined ? (
        <details className="herkunft">
          <summary>{t('wurf.herkunft')}</summary>
          <Baum ergebnis={ergebnis} />
        </details>
      ) : null}
    </li>
  );
}

function Baum({ ergebnis }: { readonly ergebnis: Ergebnis }) {
  return (
    <ul className="baum">
      <li>
        {ergebnis.fehler === 'fehlt' ? (
          <span className="baum__fehler">{t('baum.fehlt', { name: ergebnis.tabelle })}</span>
        ) : ergebnis.fehler === 'zu-tief' ? (
          <span className="baum__fehler">{t('baum.zutief', { name: ergebnis.tabelle })}</span>
        ) : (
          <>
            <strong>{ergebnis.tabelle}</strong>
            {ergebnis.wurf !== undefined ? <span className="baum__wurf"> ({ergebnis.wurf})</span> : null}
            {': '}
            {ergebnis.text}
          </>
        )}
        {ergebnis.teile.map((teil, i) => (
          <Baum key={i} ergebnis={teil} />
        ))}
      </li>
    </ul>
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
