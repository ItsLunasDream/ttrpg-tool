/**
 * Der Encounter Creator.
 *
 * Erste Stufe: Begegnungen anlegen, benennen, mit einer Notiz versehen und
 * in einer Sammlung wiederfinden. Die Gegner (Stufe 2), die Umgebung
 * (Stufe 3) und der Weg in den Tracker (Stufe 4) kommen danach — die Form
 * der Datei traegt sie schon, damit der Ausbau nichts umbaut.
 *
 * Siehe `docs/encounter.md`.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';
import { api } from './api';
import { setLanguage, t } from './i18n';
import { finde, type Sortierung } from '../shared/suche';
import { gegnerzahl, leereBegegnung, type Begegnung, type Eintrag } from '../shared/ablage';

export function App() {
  const [, neuZeichnen] = useState(0);
  const [eintraege, setEintraege] = useState<readonly Eintrag[]>([]);
  const [offen, setOffen] = useState<Begegnung | null>(null);
  const [suche, setSuche] = useState('');
  const [sortierung, setSortierung] = useState<Sortierung>('geaendert');
  const [anlegen, setAnlegen] = useState<string | null>(null);
  const [meldung, setMeldung] = useState('');
  const [fehler, setFehler] = useState('');

  const ladeListe = useCallback(async () => {
    setEintraege(await api.sammlung.liste());
  }, []);

  useEffect(() => {
    void ladeListe();
  }, [ladeListe]);

  /*
   * Die Sprache kommt aus der Huelle, nicht aus einem eigenen Waehler.
   *
   * Dasselbe wie im Initiative Tracker seit #120: zwei Stellen fuer
   * dieselbe Einstellung heisst, dass man immer in der falschen nachsieht.
   */
  useEffect(() => {
    return api.sprache.beiWechsel((neu) => {
      setLanguage((neu === 'de' ? 'de' : 'en') as Language);
      neuZeichnen((n) => n + 1);
    });
  }, []);

  useEffect(() => {
    setLanguage(DEFAULT_LANGUAGE);
  }, []);

  /** Ein Treffer aus der Suche der Huelle (Strg+K) landet hier. */
  useEffect(
    () =>
      api.beiSuchtreffer((kennung) => {
        void (async () => {
          const geladen = await api.sammlung.lesen(kennung);
          if (geladen) setOffen(geladen);
          else setFehler(t('fehler.lesen'));
        })();
      }),
    []
  );

  const gefunden = useMemo(
    () => finde(eintraege, suche, sortierung),
    [eintraege, suche, sortierung]
  );

  const speichere = async (begegnung: Begegnung, neu: boolean) => {
    setFehler('');
    const ergebnis = await api.sammlung.speichern(begegnung, neu);
    if (!ergebnis.ok) {
      setFehler(t('fehler.speichern', { detail: ergebnis.text }));
      return null;
    }
    setMeldung(t('gespeichert'));
    await ladeListe();
    return ergebnis.id;
  };

  // --- Eine neue Begegnung --------------------------------------------------
  if (anlegen !== null) {
    return (
      <div className="rahmen">
        <Kopf />
        <section className="karte karte--schmal">
          <h2>{t('neu')}</h2>
          <label className="feld">
            <span className="feld__name">{t('neu.name')}</span>
            <input
              className="feld__eingabe"
              autoFocus
              value={anlegen}
              placeholder={t('neu.platzhalter')}
              onChange={(e) => setAnlegen(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && anlegen.trim()) void lege();
                if (e.key === 'Escape') setAnlegen(null);
              }}
            />
          </label>
          <div className="knopfreihe">
            <button
              type="button"
              className="knopf knopf--haupt"
              disabled={!anlegen.trim()}
              onClick={() => void lege()}
            >
              {t('neu.anlegen')}
            </button>
            <button type="button" className="knopf" onClick={() => setAnlegen(null)}>
              {t('abbrechen')}
            </button>
          </div>
          {fehler ? <p className="fehler">{fehler}</p> : null}
        </section>
      </div>
    );
  }

  async function lege() {
    const name = (anlegen ?? '').trim();
    if (!name) return;
    const neu = leereBegegnung(name, new Date().toISOString());
    const id = await speichere(neu, true);
    if (id === null) return;
    setAnlegen(null);
    // Mit der Kennung, die der Hauptprozess vergeben hat — sie kann wegen
    // eines Namensgleichstands eine andere sein als die geratene.
    setOffen({ ...neu, id });
  }

  // --- Eine offene Begegnung ------------------------------------------------
  if (offen) {
    return (
      <div className="rahmen">
        <Kopf />
        <div className="leiste">
          <button
            type="button"
            className="knopf"
            onClick={() => {
              setOffen(null);
              setMeldung('');
            }}
          >
            ← {t('zurueck')}
          </button>
          <span className="leiste__luecke" />
          <button
            type="button"
            className="knopf knopf--haupt"
            onClick={() => void speichere(offen, false)}
          >
            {t('speichern')}
          </button>
        </div>

        <section className="karte">
          <label className="feld">
            <span className="feld__name">{t('feld.name')}</span>
            <input
              className="feld__eingabe"
              value={offen.name}
              onChange={(e) => setOffen({ ...offen, name: e.target.value })}
            />
          </label>

          <h3>{t('gegner.zahl', { anzahl: gegnerzahl(offen.gegner) })}</h3>
          {offen.gegner.length === 0 ? (
            <p className="hinweis">{t('gegner.keine')}</p>
          ) : (
            <ul className="gegnerliste">
              {offen.gegner.map((einer) => (
                <li key={einer.monsterId || einer.name}>
                  {einer.anzahl}× {einer.name}
                </li>
              ))}
            </ul>
          )}

          <label className="feld feld--hoch">
            <span className="feld__name">{t('feld.notiz')}</span>
            <textarea
              className="feld__flaeche"
              rows={8}
              value={offen.notiz}
              onChange={(e) => setOffen({ ...offen, notiz: e.target.value })}
            />
          </label>
          <p className="hinweis hinweis--klein">{t('feld.notizHinweis')}</p>

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
        <button type="button" className="knopf knopf--haupt" onClick={() => setAnlegen('')}>
          + {t('neu')}
        </button>
        <input
          className="feld__eingabe leiste__suche"
          type="search"
          value={suche}
          placeholder={t('liste.suche')}
          aria-label={t('liste.suche')}
          onChange={(e) => setSuche(e.target.value)}
        />
        <select
          className="feld__wahl"
          value={sortierung}
          aria-label={t('liste.sortieren')}
          onChange={(e) => setSortierung(e.target.value as Sortierung)}
        >
          <option value="geaendert">{t('liste.nachDatum')}</option>
          <option value="name">{t('liste.nachName')}</option>
          <option value="gegner">{t('liste.nachGegnern')}</option>
        </select>
      </div>

      <p className="anzahl">
        {gefunden.length === 1
          ? t('liste.eine')
          : t('liste.anzahl', { anzahl: gefunden.length })}
      </p>

      {eintraege.length === 0 ? (
        <p className="hinweis">{t('liste.leer')}</p>
      ) : gefunden.length === 0 ? (
        <p className="hinweis">{t('liste.nichts')}</p>
      ) : (
        <ul className="kacheln">
          {gefunden.map((eintrag) => (
            <li key={eintrag.id}>
              <button
                type="button"
                className="begegnungskachel"
                data-id={eintrag.id}
                onClick={() => {
                  void (async () => {
                    const geladen = await api.sammlung.lesen(eintrag.id);
                    if (geladen) setOffen(geladen);
                    else setFehler(t('fehler.lesen'));
                  })();
                }}
              >
                <span className="begegnungskachel__name">{eintrag.name}</span>
                <span className="begegnungskachel__zahl">
                  {t('gegner.zahl', { anzahl: eintrag.gegnerzahl })}
                </span>
                {eintrag.gegnernamen.length > 0 ? (
                  <span className="begegnungskachel__unten">
                    {eintrag.gegnernamen.join(', ')}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="begegnungskachel__weg"
                aria-label={t('loeschen')}
                title={t('loeschen')}
                onClick={() => {
                  // Kein stilles Loeschen: eine Begegnung ist Arbeit, und
                  // ein Fehlklick soll sie nicht kosten.
                  if (!confirm(t('loeschen.sicher', { name: eintrag.name }))) return;
                  void (async () => {
                    await api.sammlung.loeschen(eintrag.id);
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
