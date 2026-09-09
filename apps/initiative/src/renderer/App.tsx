/**
 * Der Initiative Tracker.
 *
 * Zwei Bilder: die Vorbereitung, in der Teilnehmer angelegt und Werte
 * eingetragen werden, und der laufende Kampf. Der Unterschied ist bewusst
 * gering — mitten im Kampf kommen Gegner dazu und Werte aendern sich, und ein
 * Werkzeug, das dafuer erst in einen Bearbeitungsmodus wechseln muesste, waere
 * am Tisch im Weg.
 *
 * Die Regeln stehen nicht hier, sondern in shared/kampf.ts. Diese Datei
 * zeichnet und leitet Tastendruecke weiter.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { rollD20 } from '@suite/dice';
import { api } from './api';
import { getLanguage, onLanguageChange, setLanguage, t, LANGUAGES, type Language } from './i18n';
import {
  aendereHp,
  beginne,
  dupliziere,
  entferneTeilnehmer,
  entferneZustand,
  fuegeEin,
  istAktiv,
  leererKampf,
  mitTeilnehmer,
  naechsterZug,
  neueId,
  neuerTeilnehmer,
  setzeGruppengroesse,
  setzeHp,
  setzeZustand
} from '../shared/kampf';
import { zuId } from '../shared/format';
import type { Begegnung, Kampf } from '../shared/types';
import { BILD_SCHEMA } from '../shared/kanaele';
import { Zeile } from './Zeile';
import { Begegnungen } from './Begegnungen';
import { Dialog } from './Dialog';

export function App() {
  const [kampf, setKampf] = useState<Kampf>(leererKampf);
  const [geladen, setGeladen] = useState(false);
  const [sprache, setSprache] = useState<Language>(getLanguage);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [begegnungen, setBegegnungen] = useState<Begegnung[]>([]);
  const [zeigeBegegnungen, setZeigeBegegnungen] = useState(false);
  /** Teilnehmer, dessen Zeile gerade aufgeklappt ist. */
  const [offen, setOffen] = useState<string | null>(null);
  /**
   * Der Rumpf der geladenen Begegnung: Taktik, Plan, was der Tisch braucht.
   *
   * Steht getrennt vom Kampf, weil er zum *Dokument* gehoert und nicht zum
   * laufenden Gefecht — ein Kampf, den man aus einer Begegnung startet, aendert
   * die Trefferpunkte, aber nicht den Plan.
   */
  const [taktik, setTaktik] = useState('');
  const [zeigeTaktik, setZeigeTaktik] = useState(false);
  /**
   * Der offene Dialog.
   *
   * Eigene statt `window.prompt`/`window.confirm`: `prompt()` wirft in
   * Electron, und `confirm()` haelt den ganzen Renderer an.
   */
  const [dialog, setDialog] = useState<'speichern' | 'beenden' | null>(null);

  // Die Sprache kann von der Huelle gesetzt werden, ohne dass hier jemand
  // klickt. Ohne diesen Anschluss bliebe die Oberflaeche auf dem alten Stand.
  useEffect(() => onLanguageChange(() => setSprache(getLanguage())), []);
  useEffect(() => {
    document.documentElement.lang = sprache;
  }, [sprache]);

  // Beim Start den letzten Kampf zurueckholen. Wer die Sammlung mitten im
  // Gefecht schliesst, soll dort weitermachen, wo er war.
  useEffect(() => {
    void (async () => {
      const gespeichert = await api.kampf.lesen();
      if (gespeichert) setKampf(gespeichert);
      setBegegnungen(await api.begegnungen.liste());
      setGeladen(true);
    })();
  }, []);

  /**
   * Jede Aenderung wandert sofort auf die Platte.
   *
   * Kein Autosave mit Verzoegerung und kein Speichern-Knopf: der laufende
   * Kampf ist Sitzungszustand, kein Dokument. Wer ihn verliert, weil das
   * Programm abstuerzt, hat mitten im Kampf ein Problem, das kein Knopf
   * loesen kann.
   */
  const setzeUndSichere = useCallback((naechster: Kampf | ((vorher: Kampf) => Kampf)) => {
    setKampf((vorher) => {
      const neu = typeof naechster === 'function' ? naechster(vorher) : naechster;
      void api.kampf.schreiben(neu);
      return neu;
    });
  }, []);

  const sortiert = kampf.teilnehmer;
  const dranId = kampf.laeuft && kampf.amZug >= 0 ? sortiert[kampf.amZug]?.id : null;

  const weiter = useCallback(() => {
    setzeUndSichere((vorher) => naechsterZug(vorher));
  }, [setzeUndSichere]);

  /**
   * Leertaste heisst „weiter\" — die eine Handlung, die hundertmal pro Abend
   * passiert.
   *
   * Nicht, wenn gerade in ein Feld getippt wird: sonst liesse sich kein
   * Leerzeichen mehr in einen Namen schreiben.
   */
  useEffect(() => {
    function beiTaste(ereignis: KeyboardEvent) {
      if (ereignis.key !== ' ' && ereignis.code !== 'Space') return;
      const ziel = ereignis.target as HTMLElement | null;
      if (ziel && /^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName)) return;
      if (ziel?.isContentEditable) return;
      if (!kampf.laeuft) return;
      ereignis.preventDefault();
      weiter();
    }
    window.addEventListener('keydown', beiTaste);
    return () => window.removeEventListener('keydown', beiTaste);
  }, [kampf.laeuft, weiter]);

  const melde = useCallback((text: string) => {
    setMeldung(text);
    window.setTimeout(() => setMeldung(null), 2500);
  }, []);

  const neu = useCallback(() => {
    const eintrag = neuerTeilnehmer('');
    setzeUndSichere((vorher) => fuegeEin(vorher, eintrag));
    setOffen(eintrag.id);
  }, [setzeUndSichere]);

  /**
   * Initiative auswuerfeln.
   *
   * Nur fuer Gegner: Spielerfiguren wuerfeln am Tisch selbst, und ein
   * Werkzeug, das ihnen die Zahl vorschreibt, nimmt ihnen etwas weg. Der
   * Feinwert kommt als Modifikator dazu — systemneutral heisst er so, in D&D
   * ist es die Geschicklichkeit.
   */
  const wuerfle = useCallback(() => {
    setzeUndSichere((vorher) => ({
      ...vorher,
      teilnehmer: vorher.teilnehmer.map((eintrag) =>
        eintrag.istSpieler
          ? eintrag
          : { ...eintrag, initiative: rollD20().total + eintrag.feinwert }
      )
    }));
  }, [setzeUndSichere]);

  const starteOderBeende = useCallback(() => {
    if (kampf.laeuft) {
      setDialog('beenden');
      return;
    }
    setzeUndSichere((vorher) => beginne(vorher));
  }, [kampf.laeuft, setzeUndSichere]);

  const beende = useCallback(() => {
    setzeUndSichere((vorher) => ({ ...vorher, laeuft: false, amZug: -1, runde: 0 }));
  }, [setzeUndSichere]);

  const speichereBegegnung = useCallback(async (name: string) => {
    const begegnung: Begegnung = {
      schemaVersion: 1,
      id: kampf.begegnungId ?? zuId(name),
      name,
      // Ohne laufende Trefferpunkte und Zustaende: eine gespeicherte
      // Begegnung ist eine Vorlage, kein eingefrorener Kampf.
      teilnehmer: kampf.teilnehmer.map((eintrag) => ({
        ...eintrag,
        koerper: eintrag.koerper.map((koerper) => ({
          ...koerper,
          hp: koerper.hpMax,
          tempHp: 0,
          raus: false
        })),
        zustaende: []
      })),
      taktik
    };
    await api.begegnungen.speichern(begegnung);
    setKampf((vorher) => ({ ...vorher, name, begegnungId: begegnung.id }));
    setBegegnungen(await api.begegnungen.liste());
    melde(t('msg.gespeichert'));
  }, [kampf, taktik, melde]);

  const ladeBegegnung = useCallback(
    async (id: string) => {
      const begegnung = await api.begegnungen.lesen(id);
      setzeUndSichere({
        ...leererKampf(),
        begegnungId: begegnung.id,
        name: begegnung.name,
        teilnehmer: begegnung.teilnehmer
      });
      setTaktik(begegnung.taktik);
      setZeigeBegegnungen(false);
      melde(t('msg.geladen'));
    },
    [setzeUndSichere, melde]
  );

  const aktive = useMemo(() => sortiert.filter(istAktiv).length, [sortiert]);

  if (!geladen) return <div className="laedt" />;

  return (
    <div className="tracker">
      <header className="leiste">
        <span className="leiste__titel">{t('app.title')}</span>
        {kampf.name ? <span className="leiste__name">{kampf.name}</span> : null}
        {kampf.laeuft ? (
          <span className="leiste__runde motion-erscheinen" key={kampf.runde}>
            {t('runde', { n: kampf.runde })}
          </span>
        ) : null}
        <span className="leiste__fueller" />

        <button type="button" onClick={neu}>
          + {t('knopf.neu')}
        </button>
        <button type="button" onClick={wuerfle} disabled={sortiert.length === 0}>
          {t('knopf.wuerfeln')}
        </button>
        <button
          type="button"
          className={kampf.laeuft ? '' : 'knopf--haupt'}
          onClick={starteOderBeende}
          disabled={sortiert.length === 0}
        >
          {kampf.laeuft ? t('knopf.beenden') : t('knopf.beginnen')}
        </button>
        <span className="leiste__trenner" />
        <button type="button" onClick={() => setZeigeBegegnungen((vorher) => !vorher)}>
          {t('knopf.oeffnen')}
        </button>
        <button type="button" onClick={() => setDialog('speichern')} disabled={sortiert.length === 0}>
          {t('knopf.speichern')}
        </button>
        <button
          type="button"
          className={zeigeTaktik ? 'knopf--an' : ''}
          onClick={() => setZeigeTaktik((vorher) => !vorher)}
          aria-pressed={zeigeTaktik}
        >
          {t('feld.taktik')}
        </button>
        <select
          className="leiste__sprache"
          value={sprache}
          onChange={(ereignis) => setLanguage(ereignis.target.value as Language)}
          aria-label="Sprache"
        >
          {LANGUAGES.map((eintrag) => (
            <option key={eintrag} value={eintrag}>
              {eintrag.toUpperCase()}
            </option>
          ))}
        </select>
      </header>

      {zeigeBegegnungen ? (
        <Begegnungen
          begegnungen={begegnungen}
          onOeffnen={(id) => void ladeBegegnung(id)}
          onLoeschen={async (id) => {
            await api.begegnungen.loeschen(id);
            setBegegnungen(await api.begegnungen.liste());
          }}
          onSchliessen={() => setZeigeBegegnungen(false)}
        />
      ) : null}

      {zeigeTaktik ? (
        <textarea
          className="taktik motion-eintritt"
          placeholder={t('feld.taktik')}
          value={taktik}
          onChange={(ereignis) => setTaktik(ereignis.target.value)}
        />
      ) : null}

      <main className="liste">
        {sortiert.length === 0 ? (
          <div className="leer motion-eintritt">
            <p className="leer__titel">{t('leer.titel')}</p>
            <p className="leer__text">{t('leer.text')}</p>
            <button type="button" className="knopf--haupt" onClick={neu}>
              + {t('knopf.neu')}
            </button>
          </div>
        ) : (
          sortiert.map((teilnehmer, nummer) => (
            <Zeile
              key={teilnehmer.id}
              teilnehmer={teilnehmer}
              amZug={teilnehmer.id === dranId}
              laeuft={kampf.laeuft}
              offen={offen === teilnehmer.id}
              nummer={nummer}
              onOeffnen={() => setOffen(offen === teilnehmer.id ? null : teilnehmer.id)}
              onAendern={(aendere) => setzeUndSichere((vorher) => mitTeilnehmer(vorher, teilnehmer.id, aendere))}
              onSchaden={(koerperId, betrag) =>
                setzeUndSichere((vorher) => aendereHp(vorher, teilnehmer.id, koerperId, betrag))
              }
              onSetzeHp={(koerperId, wert) =>
                setzeUndSichere((vorher) => setzeHp(vorher, teilnehmer.id, koerperId, wert))
              }
              onGruppe={(anzahl) =>
                setzeUndSichere((vorher) => setzeGruppengroesse(vorher, teilnehmer.id, anzahl))
              }
              onDuplizieren={() => setzeUndSichere((vorher) => dupliziere(vorher, teilnehmer.id))}
              onEntfernen={() => setzeUndSichere((vorher) => entferneTeilnehmer(vorher, teilnehmer.id))}
              onZustand={(name, runden) =>
                setzeUndSichere((vorher) =>
                  setzeZustand(vorher, teilnehmer.id, { id: neueId(), name, rundenRest: runden })
                )
              }
              onZustandWeg={(zustandId) =>
                setzeUndSichere((vorher) => entferneZustand(vorher, teilnehmer.id, zustandId))
              }
              onBild={async () => {
                const datei = await api.bild.waehlen();
                if (datei) {
                  setzeUndSichere((vorher) =>
                    mitTeilnehmer(vorher, teilnehmer.id, (eintrag) => ({ ...eintrag, bild: datei }))
                  );
                }
              }}
              bildUrl={teilnehmer.bild ? `${BILD_SCHEMA}://${encodeURIComponent(teilnehmer.bild)}` : null}
            />
          ))
        )}
      </main>

      <footer className="fuss">
        {kampf.laeuft ? (
          <>
            <button type="button" className="knopf--haupt fuss__weiter" onClick={weiter}>
              {t('knopf.weiter')} ›
            </button>
            <span className="fuss__hinweis">{t('taste.leertaste')}</span>
          </>
        ) : null}
        <span className="leiste__fueller" />
        {sortiert.length > 0 ? (
          <span className="fuss__zahl">
            {aktive} / {sortiert.length}
          </span>
        ) : null}
      </footer>

      {dialog === 'speichern' ? (
        <Dialog
          titel={t('begegnung.name')}
          vorgabe={kampf.name}
          bestaetigen={t('knopf.speichern')}
          onAbschluss={(wert) => {
            setDialog(null);
            if (wert) void speichereBegegnung(wert);
          }}
        />
      ) : null}
      {dialog === 'beenden' ? (
        <Dialog
          titel={t('bestaetigen.beenden')}
          bestaetigen={t('ja')}
          onAbschluss={(wert) => {
            setDialog(null);
            if (wert) beende();
          }}
        />
      ) : null}

      {meldung ? <div className="meldung motion-eintritt">{meldung}</div> : null}
    </div>
  );
}
