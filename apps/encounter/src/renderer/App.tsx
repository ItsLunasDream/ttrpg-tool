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
import { getLanguage, setLanguage, t } from './i18n';
import { finde, type Sortierung } from '../shared/suche';
import { gegnerzahl, leereBegegnung, type Begegnung, type Eintrag } from '../shared/ablage';
import { findeMonster, type Monsterkarte } from '../shared/monsterliste';
import {
  UMGEBUNGEN,
  anblickzeilen,
  umgebungNach,
  umgebungName,
  type Sprache,
  type Umgebung
} from '@suite/umgebungen';
import { modifikator, type Uebergabe } from '@suite/uebergabe';
import {
  gradsumme,
  gruppenstaerke,
  ordneEin,
  punktsumme,
  type Gruppe
} from '../shared/schwierigkeit';
import { EINORDNUNG_NAME, budget, text as srdText } from '@suite/srd';

/** Die Sprache, wie `@suite/umgebungen` sie erwartet. */
function sprache(): Sprache {
  return getLanguage() === 'de' ? 'de' : 'en';
}

export function App() {
  const [, neuZeichnen] = useState(0);
  const [eintraege, setEintraege] = useState<readonly Eintrag[]>([]);
  /** Die Gruppe am Tisch, aus den Einstellungen der Huelle. */
  const [gruppe, setGruppe] = useState<Gruppe>([]);
  const [offen, setOffen] = useState<Begegnung | null>(null);
  const [suche, setSuche] = useState('');
  const [sortierung, setSortierung] = useState<Sortierung>('geaendert');
  const [anlegen, setAnlegen] = useState<string | null>(null);
  const [meldung, setMeldung] = useState('');
  const [fehler, setFehler] = useState('');
  const [monster, setMonster] = useState<readonly Monsterkarte[]>([]);
  const [monstersuche, setMonstersuche] = useState('');

  const ladeListe = useCallback(async () => {
    setEintraege(await api.sammlung.liste());
  }, []);

  useEffect(() => {
    void ladeListe();
  }, [ladeListe]);

  /*
   * Die Monster bei jedem Start frisch.
   *
   * Wer eben ein Monster gebaut hat, soll es hier sofort finden — und ein
   * geloeschtes soll verschwinden. Ein gemerkter Stand waere die zweite
   * Stelle, an der dieselbe Wahrheit steht.
   */
  useEffect(() => {
    void api.monster.liste().then(setMonster, () => setMonster([]));
  }, []);

  /*
   * Die Gruppe am Tisch.
   *
   * Einmal beim Start gelesen, und danach auf Zuruf: wer sie im Dialog
   * der Huelle umstellt, soll das Verhaeltnis sofort anders sehen und
   * nicht erst nach einem Neustart des Werkzeugs.
   */
  useEffect(() => {
    void api.gruppe.lesen().then(setGruppe, () => setGruppe([]));
    return api.gruppe.beiWechsel(setGruppe);
  }, []);

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

  /**
   * Schiebt die offene Begegnung in den Initiative Tracker.
   *
   * Zusammengestellt wird hier nur die gemeinsame Form aus
   * `@suite/uebergabe` — Namen, Zahlen, Saetze. Teilnehmer und Terrain
   * baut der Tracker daraus selbst; dieses Werkzeug kennt sein
   * Datenmodell nicht und soll es nicht kennen.
   *
   * Die Werte kommen aus der MONSTERLISTE und nicht aus der Datei: wer
   * sein Monster eben noch geaendert hat, soll die neuen Trefferpunkte
   * im Tracker sehen. Ein Monster, das es nicht mehr gibt, wandert mit
   * seinen Nullen mit — es fehlt sichtbar, statt stillschweigend zu
   * verschwinden.
   */
  const inDenTracker = async () => {
    if (!offen) return;
    setFehler('');
    const umgebung = umgebungNach(offen.umgebungId);
    const spr = sprache();
    const uebergabe: Uebergabe = {
      name: offen.name,
      quelle: offen.id,
      gegner: offen.gegner.map((einer) => {
        const karte = monster.find((m) => m.id === einer.monsterId);
        return {
          name: einer.name,
          anzahl: einer.anzahl,
          tp: karte?.tp ?? 0,
          rk: karte?.rk ?? 0,
          iniMod: modifikator(karte?.ge ?? 10)
        };
      }),
      umgebung: umgebung
        ? {
            name: umgebungName(umgebung, spr),
            beschreibung: anblickzeilen(umgebung, spr),
            regeln: umgebung.regeln.map((regel) => ({
              text: regel.wirkung[spr === 'de' ? 'de' : 'en'],
              wert: typeof regel.wert === 'number' ? regel.wert : null
            }))
          }
        : null
    };
    const ging = await api.inDenTracker(uebergabe);
    if (ging) setMeldung(t('tracker.unterwegs'));
    else setFehler(t('tracker.ging-nicht'));
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
          {/*
            Der Weg in den Tracker steht NEBEN dem Speichern und nicht
            statt seiner. Er schiebt hinueber, was gerade auf dem Schirm
            steht; was auf der Platte liegt, bleibt davon unberuehrt.
          */}
          <button
            type="button"
            className="knopf"
            data-tracker
            disabled={offen.gegner.length === 0}
            onClick={() => void inDenTracker()}
          >
            {t('tracker.knopf')}
          </button>
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

          <h3>
            {t('gegner.titel')} · {t('gegner.zahl', { anzahl: gegnerzahl(offen.gegner) })}
          </h3>
          {offen.gegner.length === 0 ? (
            <p className="hinweis">{t('gegner.keine')}</p>
          ) : (
            <ul className="gegnerliste">
              {offen.gegner.map((einer) => {
                /*
                 * Ein geloeschtes Monster verschwindet NICHT stillschweigend.
                 *
                 * Der Name steht mit in der Datei, also bleibt die Zeile
                 * stehen und sagt, dass es das Monster nicht mehr gibt. Wer
                 * die Begegnung Wochen spaeter aufmacht, soll sehen, was
                 * fehlt, statt sich zu wundern, warum sie duenner ist.
                 */
                const gibtEs = monster.some((m) => m.id === einer.monsterId);
                return (
                  <li
                    key={einer.monsterId || einer.name}
                    className={gibtEs ? 'gegnerzeile' : 'gegnerzeile gegnerzeile--fehlt'}
                    data-monster={einer.monsterId}
                  >
                    <input
                      className="gegnerzeile__anzahl"
                      type="number"
                      min={1}
                      max={99}
                      value={einer.anzahl}
                      aria-label={einer.name}
                      onChange={(e) => {
                        const anzahl = Math.max(1, Math.min(99, Number(e.target.value) || 1));
                        setOffen({
                          ...offen,
                          gegner: offen.gegner.map((g) =>
                            g.monsterId === einer.monsterId ? { ...g, anzahl } : g
                          )
                        });
                      }}
                    />
                    <span className="gegnerzeile__name">{einer.name}</span>
                    {gibtEs ? null : (
                      <span className="gegnerzeile__marke" title={t('gegner.fehlt')}>
                        {t('gegner.fehltKurz')}
                      </span>
                    )}
                    <button
                      type="button"
                      className="gegnerzeile__weg"
                      aria-label={t('gegner.weg')}
                      title={t('gegner.weg')}
                      onClick={() =>
                        setOffen({
                          ...offen,
                          gegner: offen.gegner.filter((g) => g.monsterId !== einer.monsterId)
                        })
                      }
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <h3>{t('monster.titel')}</h3>
          {monster.length === 0 ? (
            <p className="hinweis">{t('monster.leer')}</p>
          ) : (
            <>
              <input
                className="feld__eingabe"
                type="search"
                value={monstersuche}
                placeholder={t('monster.suche')}
                aria-label={t('monster.suche')}
                onChange={(e) => setMonstersuche(e.target.value)}
              />
              {findeMonster(monster, monstersuche).length === 0 ? (
                <p className="hinweis">{t('monster.nichts')}</p>
              ) : (
                <ul className="monsterliste">
                  {findeMonster(monster, monstersuche).map((einer) => (
                    <li key={einer.id}>
                      <button
                        type="button"
                        className="monsterzeile"
                        data-monster={einer.id}
                        onClick={() => {
                          /*
                           * Zweimal dasselbe Monster ist keine zweite Zeile,
                           * sondern eine hoehere Anzahl. „3x Wolf" ist der
                           * Normalfall, drei Zeilen „Wolf" waeren Rauschen.
                           */
                          const schon = offen.gegner.find((g) => g.monsterId === einer.id);
                          setOffen({
                            ...offen,
                            gegner: schon
                              ? offen.gegner.map((g) =>
                                  g.monsterId === einer.id
                                    ? { ...g, anzahl: Math.min(99, g.anzahl + 1) }
                                    : g
                                )
                              : [
                                  ...offen.gegner,
                                  { monsterId: einer.id, name: einer.name, anzahl: 1 }
                                ]
                          });
                        }}
                      >
                        <span className="monsterzeile__name">{einer.name}</span>
                        <span className="monsterzeile__grad">
                          {t('monster.grad', { cr: einer.cr || '?' })}
                        </span>
                        <span className="monsterzeile__werte">
                          {t('monster.werte', { tp: einer.tp, rk: einer.rk })}
                        </span>
                        <span className="monsterzeile__dazu">+ {t('monster.dazu')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <Verhaeltnis offen={offen} monster={monster} gruppe={gruppe} />

          <h3>{t('umgebung.titel')}</h3>
          <p className="hinweis hinweis--klein">{t('umgebung.satz')}</p>
          <div className="leiste">
            <select
              className="feld__wahl"
              value={offen.umgebungId}
              aria-label={t('umgebung.titel')}
              onChange={(e) => setOffen({ ...offen, umgebungId: e.target.value })}
            >
              <option value="">{t('umgebung.keine')}</option>
              {UMGEBUNGEN.map((umgebung) => (
                <option key={umgebung.id} value={umgebung.id}>
                  {umgebungName(umgebung, sprache())}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="knopf"
              onClick={() =>
                setOffen({
                  ...offen,
                  umgebungId: UMGEBUNGEN[Math.floor(Math.random() * UMGEBUNGEN.length)].id
                })
              }
            >
              {t('umgebung.wuerfeln')}
            </button>
          </div>
          <Umgebungsblatt umgebung={umgebungNach(offen.umgebungId)} />

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

/**
 * Was die Begegnung der Gruppe gegenueberstellt — und kein Urteil.
 *
 * Hier steht ausdruecklich NICHT „mittelschwer". Die Schwellen dafuer
 * gehoeren nach `packages/srd/` und sind dort noch nicht erfasst; eine
 * aus dem Kopf getippte Schwelle saehe aus wie eine Auskunft. Also das
 * Zweitbeste, das ehrlich bleibt: beide Zahlen nebeneinander, und wer
 * sie deutet, ist der Mensch am Tisch.
 *
 * Fehlt die Gruppe, steht trotzdem die Gradsumme da. Sie ist fuer sich
 * schon brauchbar, und ein leerer Kasten waere eine Aufforderung, in die
 * Einstellungen zu gehen — die steht im Hinweis, nicht als Leerstelle.
 */
function Verhaeltnis({
  offen,
  monster,
  gruppe
}: {
  readonly offen: Begegnung;
  readonly monster: readonly Monsterkarte[];
  readonly gruppe: Gruppe;
}) {
  const gewertet = offen.gegner.map((einer) => ({
    anzahl: einer.anzahl,
    grad: monster.find((m) => m.id === einer.monsterId)?.cr ?? ''
  }));
  const summe = gradsumme(gewertet);
  const punkte = punktsumme(gewertet);
  const staerke = gruppenstaerke(gruppe);
  const wo = ordneEin(gewertet, gruppe);
  const spr = sprache();
  if (offen.gegner.length === 0) return null;

  return (
    <div className="verhaeltnis" data-einordnung={wo ?? ''}>
      {/*
        Die Einordnung steht oben und gross — sie ist die Antwort, die man
        sucht. Darunter die beiden Zahlen, aus denen sie entstanden ist:
        eine Einordnung ohne ihre Grundlage muss man glauben, mit ihr kann
        man sie nachrechnen.
      */}
      {wo ? (
        <p className="verhaeltnis__urteil">
          {srdText(EINORDNUNG_NAME[wo], spr)}
          <span className="verhaeltnis__punkte">
            {t('verhaeltnis.punkte', {
              punkte: punkte.summe.toLocaleString(spr === 'de' ? 'de-DE' : 'en-US'),
              budget: (budget(gruppe, 'mittel') ?? 0).toLocaleString(
                spr === 'de' ? 'de-DE' : 'en-US'
              )
            })}
          </span>
        </p>
      ) : null}

      <div className="verhaeltnis__zahlen">
        <span className="verhaeltnis__seite">
          {t('verhaeltnis.grade', { summe: zahl(summe.summe) })}
        </span>
        <span className="verhaeltnis__gegen">{t('verhaeltnis.gegen')}</span>
        <span className="verhaeltnis__seite">
          {staerke
            ? staerke.kleinsteStufe === staerke.groessteStufe
              ? t('verhaeltnis.gruppe', {
                  figuren: staerke.figuren,
                  stufe: staerke.kleinsteStufe
                })
              : t('verhaeltnis.gruppeSpanne', {
                  figuren: staerke.figuren,
                  von: staerke.kleinsteStufe,
                  bis: staerke.groessteStufe
                })
            : t('verhaeltnis.keineGruppe')}
        </span>
      </div>

      {summe.ohneGrad > 0 ? (
        <p className="hinweis hinweis--klein">
          {t('verhaeltnis.ohneGrad', { anzahl: summe.ohneGrad })}
        </p>
      ) : null}
      {/*
        Warum KEINE Einordnung dasteht, ist eine eigene Auskunft. Ohne sie
        sieht ein fehlendes Urteil aus wie ein Fehler der Anwendung.
      */}
      {!wo ? (
        <p className="hinweis hinweis--klein">
          {staerke ? t('verhaeltnis.keineGrade') : t('verhaeltnis.gruppeFehlt')}
        </p>
      ) : null}
    </div>
  );
}

/** Halbe Grade lesbar: „1,5" statt „1.5000000000000002". */
function zahl(wert: number): string {
  return Number.isInteger(wert) ? String(wert) : String(Math.round(wert * 100) / 100);
}

/**
 * Die Umgebung in ihren ZWEI Sorten.
 *
 * Das ist die Entscheidung, die dieses Werkzeug von einer Monsterliste
 * unterscheidet: was man sieht (zum Vorlesen, Vorlage fuer eine Karte) und
 * was am Tisch wirkt (eine Regel mit Zahl, spaeter als Terrain im
 * Tracker). Ohne die zweite Sorte ist die Umgebung Deko, ohne die erste
 * eine Tabellenzeile — deshalb stehen hier beide, getrennt beschriftet.
 */
function Umgebungsblatt({ umgebung }: { readonly umgebung: Umgebung | undefined }) {
  if (!umgebung) return null;
  const spr = sprache();
  return (
    <div className="umgebung">
      <section className="umgebung__teil">
        <h4>{t('umgebung.anblick')}</h4>
        <ul>
          {anblickzeilen(umgebung, spr).map((zeile) => (
            <li key={zeile}>{zeile}</li>
          ))}
        </ul>
      </section>
      <section className="umgebung__teil umgebung__teil--regeln">
        <h4>{t('umgebung.regeln')}</h4>
        <ul>
          {umgebung.regeln.map((regel) => (
            <li key={regel.id}>
              {regel.wirkung[spr === 'de' ? 'de' : 'en']}
              {/* Die Zahl steht als Marke daneben, nicht im Satz: so sieht
                  man auf einen Blick, welche Regel ueberhaupt eine hat. */}
              {typeof regel.wert === 'number' && regel.art ? (
                <span className="umgebung__wert">
                  {t(`umgebung.${regel.art}` as 'umgebung.sicht')} {regel.wert}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
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
