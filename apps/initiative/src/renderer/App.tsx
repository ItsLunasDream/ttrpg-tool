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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { rollD20 } from '@suite/dice';
import { api } from './api';
import { nichtsZuVerlieren, pruefeVerlust } from '../shared/neuebegegnung';
import { alsTaktik, alsTeilnehmer } from '../shared/uebernahme';
import type { Uebergabe } from '@suite/uebergabe';
import {
  kannVor,
  kannZurueck,
  leererVerlauf,
  merke,
  vor as verlaufVor,
  zurueck as verlaufZurueck,
  type Verlauf
} from '../shared/verlauf';
import { getLanguage, onLanguageChange, t, type Language } from './i18n';
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
  neuesTerrain,
  setzeGruppengroesse,
  setzeHp,
  setzeZustand
} from '../shared/kampf';
import { zuId } from '../shared/format';
import type { Begegnung, Kampf } from '../shared/types';
import { BILD_SCHEMA } from '../shared/kanaele';
import { Kontextmenue } from './Kontextmenue';
import { Zeile } from './Zeile';
import { Begegnungen } from './Begegnungen';
import { Dialog } from './Dialog';
import { Geteilt } from './Geteilt';
import {
  KEIN_RAUM,
  leseBotschaft,
  setzeBesitz,
  teileKampf,
  wendeAn,
  type GeteilterKampf,
  type RaumLage
} from '../shared/teilen';

export function App() {
  const [kampf, setKampf] = useState<Kampf>(leererKampf);
  const [geladen, setGeladen] = useState(false);
  const [sprache, setSprache] = useState<Language>(getLanguage);
  const [meldung, setMeldung] = useState<string | null>(null);
  /*
   * Rueckgaengig: gemerkt werden ganze Kampfstaende, nicht einzelne
   * Handlungen. Siehe `shared/verlauf.ts` — ein Kampf ist klein genug dafuer,
   * und eine Umkehrung je Aktion koennte etwas vergessen.
   */
  const [verlauf, setVerlauf] = useState<Verlauf<Kampf>>(leererVerlauf);
  const [begegnungen, setBegegnungen] = useState<Begegnung[]>([]);
  const [zeigeBegegnungen, setZeigeBegegnungen] = useState(false);
  /** Teilnehmer, dessen Zeile gerade aufgeklappt ist. */
  const [offen, setOffen] = useState<string | null>(null);
  /** Rechtsklick auf die freie Flaeche unter der Liste. */
  const [flaechenmenue, setFlaechenmenue] = useState<{ x: number; y: number } | null>(null);
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
  const [dialog, setDialog] = useState<'speichern' | 'beenden' | 'neu' | null>(null);
  /**
   * Eine Begegnung aus dem Encounter Creator, die auf ihre Antwort wartet.
   *
   * Sie liegt hier, bis die Rueckfrage beantwortet ist. Von aussen wird im
   * Tracker nichts weggeworfen — dieselbe Regel wie beim Karteneditor.
   */
  const [wartendeUebergabe, setWartendeUebergabe] = useState<Uebergabe | null>(null);
  /** Wer gerade umbenannt wird. Der Dialog fragt nach dem neuen Namen. */
  const [umbenennen, setUmbenennen] = useState<{ id: string; name: string } | null>(null);
  /*
   * Der Raum (docs/austausch.md). `teilt`: dieser Kampf geht an alle im
   * Raum. `geteilt`: der Kampf, den jemand anderes teilt — nur einer zur
   * Zeit, der zuletzt gemeldete.
   */
  const [raum, setRaum] = useState<RaumLage>(KEIN_RAUM);
  const [teilt, setTeilt] = useState(false);
  const [geteilt, setGeteilt] = useState<{ von: { id: string; name: string }; stand: GeteilterKampf } | null>(
    null
  );

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
  /*
   * Der jetzige Stand auch als Ref.
   *
   * Zwei Zustaende muessen zusammen umgesetzt werden — der Kampf und sein
   * Verlauf —, und der neue Verlauf haengt vom alten Kampf ab. Mit den
   * Aktualisierungsfunktionen von React ginge das nur ineinander
   * verschachtelt, und ein `setState` in der Funktion eines anderen ist
   * keine reine Rechnung: im Strict Mode liefe es doppelt und schriebe jeden
   * Schritt zweimal in den Verlauf. Die Refs werden vor dem Setzen
   * mitgezogen, damit zwei Aenderungen im selben Durchlauf sich sehen.
   */
  const standRef = useRef(kampf);
  const verlaufRef = useRef(verlauf);
  useEffect(() => {
    // Faengt auch die Wege ab, die `setKampf` direkt benutzen — das Einlesen
    // beim Start zum Beispiel, das ausdruecklich keinen Verlauf anlegen soll.
    standRef.current = kampf;
  }, [kampf]);

  const setzeStand = useCallback((neu: Kampf, neuerVerlauf: Verlauf<Kampf>) => {
    standRef.current = neu;
    verlaufRef.current = neuerVerlauf;
    setKampf(neu);
    setVerlauf(neuerVerlauf);
    void api.kampf.schreiben(neu);
  }, []);

  const setzeUndSichere = useCallback(
    (naechster: Kampf | ((vorher: Kampf) => Kampf)) => {
      const vorher = standRef.current;
      const neu = typeof naechster === 'function' ? naechster(vorher) : naechster;
      // Hier laeuft alles durch, was den Kampf aendert — deshalb steht das
      // Merken genau hier und nicht an zwanzig Aufrufstellen.
      if (neu !== vorher) setzeStand(neu, merke(verlaufRef.current, vorher));
    },
    [setzeStand]
  );

  /** Einen Schritt zurueck oder vor, ohne dabei neuen Verlauf anzulegen. */
  const springe = useCallback(
    (richtung: 'zurueck' | 'vor') => {
      const jetzt = standRef.current;
      const schritt =
        richtung === 'zurueck'
          ? verlaufZurueck(verlaufRef.current, jetzt)
          : verlaufVor(verlaufRef.current, jetzt);
      if (schritt) setzeStand(schritt.stand, schritt.verlauf);
    },
    [setzeStand]
  );

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
      const ziel = ereignis.target as HTMLElement | null;
      const tippt =
        (ziel && /^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName)) || ziel?.isContentEditable;

      /*
       * Strg+Z und Strg+Umschalt+Z (auch Strg+Y) — die gewohnten Tasten.
       *
       * Nicht zu verwechseln mit dem Zurueck-Pfeil der Huelle (Alt+Links,
       * M4): der ist der Verlauf ZWISCHEN den Werkzeugen. Naehme er hier
       * eine Loeschung zurueck, kaeme man nicht mehr zum vorigen Werkzeug.
       * Deshalb hoert der Tracker ausdruecklich nur auf Strg.
       */
      if ((ereignis.ctrlKey || ereignis.metaKey) && !ereignis.altKey) {
        const taste = ereignis.key.toLowerCase();
        // Im Eingabefeld gehoert Strg+Z dem Feld: dort nimmt es Tippen
        // zurueck, und das erwartet man auch.
        if (tippt) return;
        if (taste === 'z' && !ereignis.shiftKey) {
          ereignis.preventDefault();
          springe('zurueck');
          return;
        }
        if (taste === 'y' || (taste === 'z' && ereignis.shiftKey)) {
          ereignis.preventDefault();
          springe('vor');
          return;
        }
      }

      if (ereignis.key !== ' ' && ereignis.code !== 'Space') return;
      if (tippt) return;
      if (!kampf.laeuft) return;
      ereignis.preventDefault();
      weiter();
    }
    window.addEventListener('keydown', beiTaste);
    return () => window.removeEventListener('keydown', beiTaste);
  }, [kampf.laeuft, weiter, springe]);

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
   * Das Gelaende als Eintrag in der Reihenfolge.
   *
   * Steht bei Initiative 20, hinter allen Figuren mit derselben Zahl — so
   * wie die Unterschlupfaktion im Regelwerk.
   */
  const neuesGelaende = useCallback(() => {
    const eintrag = neuesTerrain(t('terrain.vorgabe'));
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
        // Das Gelaende wuerfelt nicht: es steht fest bei 20.
        eintrag.istSpieler || eintrag.istTerrain
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

  /**
   * Eine neue Begegnung anfangen.
   *
   * Gefragt wird nur, wo etwas auf dem Spiel steht — laeuft der Kampf noch,
   * oder steht die Aufstellung so nicht auf der Platte. Eine Rueckfrage bei
   * jedem Klick waere nach dem dritten Mal nur noch ein Hindernis.
   */
  const warnung = useMemo(() => pruefeVerlust(kampf, begegnungen), [kampf, begegnungen]);

  const legeNeuAn = useCallback(() => {
    setTaktik('');
    setZeigeBegegnungen(false);
    setzeUndSichere(leererKampf());
  }, [setzeUndSichere]);

  const neueBegegnung = useCallback(() => {
    if (nichtsZuVerlieren(warnung)) {
      legeNeuAn();
      return;
    }
    setDialog('neu');
  }, [warnung, legeNeuAn]);

  /**
   * Eine Uebergabe wird zum Kampf.
   *
   * Der bisherige wird dabei ersetzt, genau wie beim Laden einer
   * Begegnung aus der eigenen Sammlung. Gefragt wurde vorher.
   */
  const uebernimm = useCallback(
    (uebergabe: Uebergabe) => {
      setTaktik(alsTaktik(uebergabe));
      setZeigeBegegnungen(false);
      setzeUndSichere({
        ...leererKampf(),
        // KEINE begegnungId: die Kennung gehoert dem Encounter Creator,
        // und der Tracker schreibt dort nichts hinein. Sie hier zu
        // uebernehmen hiesse, dass „Speichern" spaeter in eine fremde
        // Ablage zielt.
        begegnungId: null,
        name: uebergabe.name,
        teilnehmer: alsTeilnehmer(uebergabe, neueId)
      });
      melde(t('msg.uebernommen'));
    },
    [setzeUndSichere, melde]
  );

  /*
   * Die Huelle stellt eine Begegnung zu.
   *
   * Dieselbe Frage wie bei „Neue Begegnung", nicht eine zweite eigene:
   * laeuft ein Kampf oder steht etwas Ungespeichertes da, wird gefragt.
   * Sonst geht es ohne Rueckfrage, wie ueberall.
   */
  useEffect(
    () =>
      api.beiUebergabe((uebergabe) => {
        if (nichtsZuVerlieren(warnung)) {
          uebernimm(uebergabe);
          return;
        }
        setWartendeUebergabe(uebergabe);
      }),
    [uebernimm, warnung]
  );

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

  /*
   * Ein Treffer aus der Suche der Huelle (Strg+K).
   *
   * Derselbe Weg wie ein Klick in der eigenen Sammlung. Ein laufender Kampf
   * wuerde dabei ueberschrieben — das ist derselbe Fall wie beim Laden von
   * Hand, und die Rueckfrage dafuer gehoert in eine eigene Runde, nicht
   * hier nebenbei.
   */
  useEffect(() => api.beiSuchtreffer((kennung) => void ladeBegegnung(kennung)), [ladeBegegnung]);

  const aktive = useMemo(() => sortiert.filter(istAktiv).length, [sortiert]);

  /*
   * Nachrichten aus dem Raum. Ein Stand ersetzt den vorigen derselben
   * Person; eine Aenderung wird nur angenommen, solange hier geteilt wird,
   * und nur fuer die eigene Figur des Absenders (`wendeAn`).
   */
  const teiltRef = useRef(teilt);
  teiltRef.current = teilt;
  const verarbeite = useCallback(
    (von: { id: string; name: string }, inhalt: string) => {
      const botschaft = leseBotschaft(inhalt);
      if (!botschaft) return;
      if (botschaft.art === 'stand') {
        setGeteilt({ von, stand: botschaft.stand });
        return;
      }
      if (botschaft.art === 'ende') {
        setGeteilt((vorher) => (vorher && vorher.von.id === von.id ? null : vorher));
        return;
      }
      if (!teiltRef.current) return;
      const neu = wendeAn(standRef.current, botschaft.aenderung, von.name);
      if (neu) setzeUndSichere(neu);
    },
    [setzeUndSichere]
  );

  useEffect(() => {
    let aus = false;
    void api.raum.anfang().then(({ lage, nachrichten }) => {
      if (aus) return;
      setRaum(lage);
      for (const n of nachrichten) verarbeite(n.von, n.inhalt);
    });
    const weg1 = api.raum.beiNachricht(verarbeite);
    const weg2 = api.raum.beiZustand((lage) => {
      setRaum(lage);
      if (lage.rolle === 'aus') {
        setTeilt(false);
        setGeteilt(null);
      } else {
        // Wer den Raum verlassen hat, teilt auch nichts mehr.
        setGeteilt((vorher) => (vorher && lage.personen.some((p) => p.id === vorher.von.id) ? vorher : null));
      }
    });
    return () => {
      aus = true;
      weg1();
      weg2();
    };
  }, [verarbeite]);

  /*
   * Teilen: jede Aenderung, und jede neue Person im Raum, bekommt den Stand.
   * Kurz gebuendelt, damit Tippen in ein Feld nicht jeden Buchstaben schickt.
   */
  const ansicht = useMemo(() => JSON.stringify({ art: 'stand', stand: teileKampf(kampf) }), [kampf]);
  const personenSchluessel = raum.personen.map((p) => p.id).join(',');
  useEffect(() => {
    if (!teilt) return;
    const zeit = window.setTimeout(() => void api.raum.sende(ansicht, null), 150);
    return () => window.clearTimeout(zeit);
  }, [teilt, ansicht, personenSchluessel]);

  const schalteTeilen = useCallback(() => {
    if (teilt) void api.raum.sende(JSON.stringify({ art: 'ende' }), null);
    setTeilt(!teilt);
  }, [teilt]);

  /** Die anderen im Raum: ihnen kann eine Figur gehoeren. */
  const andere = useMemo(
    () => raum.personen.filter((p) => p.id !== raum.ich?.id),
    [raum]
  );

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

        {/*
          Rueckgaengig und Wiederherstellen. Ausgegraut, wenn nichts geht —
          sonst klickt man ins Leere und weiss nicht, ob es kaputt ist.
        */}
        <button
          type="button"
          className="knopf--schmal"
          onClick={() => springe('zurueck')}
          disabled={!kannZurueck(verlauf)}
          title={t('knopf.zurueckTitel')}
          aria-label={t('knopf.zurueck')}
        >
          ↶
        </button>
        <button
          type="button"
          className="knopf--schmal"
          onClick={() => springe('vor')}
          disabled={!kannVor(verlauf)}
          title={t('knopf.vorTitel')}
          aria-label={t('knopf.vor')}
        >
          ↷
        </button>
        <span className="leiste__trenner" />

        <button type="button" onClick={neu}>
          + {t('knopf.neu')}
        </button>
        <button type="button" className="knopf--terrain" onClick={neuesGelaende}>
          + {t('knopf.terrain')}
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
        <button type="button" onClick={neueBegegnung}>
          {t('knopf.neueBegegnung')}
        </button>
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
        {raum.rolle !== 'aus' ? (
          <button
            type="button"
            className={teilt ? 'knopf--an' : ''}
            onClick={schalteTeilen}
            aria-pressed={teilt}
            title={t('raum.teilenTitel')}
            data-initiative-teilen
          >
            {teilt ? t('raum.teilenEnde') : t('raum.teilen')}
          </button>
        ) : null}
        {/*
          Hier stand ein eigener EN/DE-Waehler. Die Sprache steht in den
          Einstellungen der Huelle und wird von dort durchgereicht; zwei
          Stellen fuer dieselbe Einstellung sind eine zu viel. Die Anzeige
          folgt weiterhin, siehe `onLanguageChange` weiter oben.
        */}
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

      {geteilt ? (
        <Geteilt
          von={geteilt.von.name}
          stand={geteilt.stand}
          ich={raum.ich?.name ?? null}
          onAenderung={(aenderung) =>
            void api.raum.sende(JSON.stringify({ art: 'aenderung', aenderung }), geteilt.von.id)
          }
        />
      ) : null}

      {/*
        Rechtsklick auf die freie Flaeche unter der Liste bietet an, was man
        dort erwartet: etwas hinzufuegen.

        Eine Zeile hat ihr eigenes Menue, laesst das Ereignis aber weiter nach
        oben laufen. Deshalb die Abfrage auf `currentTarget`: nur ein Klick,
        der wirklich ins Leere geht, oeffnet dieses Menue — sonst staenden
        beide zugleich offen.
      */}
      <main
        className="liste"
        onContextMenu={(ereignis) => {
          if (ereignis.target !== ereignis.currentTarget) return;
          ereignis.preventDefault();
          setFlaechenmenue({ x: ereignis.clientX, y: ereignis.clientY });
        }}
      >
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
              onUmbenennen={() => setUmbenennen({ id: teilnehmer.id, name: teilnehmer.name })}
              onDuplizieren={() => setzeUndSichere((vorher) => dupliziere(vorher, teilnehmer.id))}
              onEntfernen={() => setzeUndSichere((vorher) => entferneTeilnehmer(vorher, teilnehmer.id))}
              onZustand={(name, dauer, runden) =>
                setzeUndSichere((vorher) =>
                  setzeZustand(vorher, teilnehmer.id, {
                    id: neueId(),
                    name,
                    dauer,
                    rundenRest: runden,
                    // Im eigenen Zug gesetzt? Dann zaehlt der erste eigene
                    // Zugwechsel nicht mit — sonst waere ein Effekt "bis zum
                    // Ende deines naechsten Zuges" Sekunden spaeter wieder
                    // weg.
                    // `teilnehmer` ist seit `beginne()` bereits sortiert,
                    // `amZug` zeigt also direkt hinein.
                    frisch:
                      vorher.laeuft && vorher.teilnehmer[vorher.amZug]?.id === teilnehmer.id
                  })
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
              besitzer={kampf.besitz?.[teilnehmer.id]}
              zusatzMenue={
                raum.rolle === 'aus' || teilnehmer.istTerrain
                  ? undefined
                  : [
                      ...andere.map((person) => ({
                        text: t('raum.gehoert', { name: person.name }),
                        onWahl: () =>
                          setzeUndSichere((vorher) => setzeBesitz(vorher, teilnehmer.id, person.name))
                      })),
                      ...(kampf.besitz?.[teilnehmer.id]
                        ? [
                            {
                              text: t('raum.loesen'),
                              onWahl: () => setzeUndSichere((vorher) => setzeBesitz(vorher, teilnehmer.id, null))
                            }
                          ]
                        : [])
                    ]
              }
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

      {dialog === 'neu' ? (
        <Dialog
          titel={
            warnung.laeuft && warnung.ungespeichert
              ? t('bestaetigen.neuBeides')
              : warnung.laeuft
                ? t('bestaetigen.neuLaeuft')
                : t('bestaetigen.neuUngespeichert')
          }
          bestaetigen={t('knopf.verwerfen')}
          onAbschluss={(wert) => {
            setDialog(null);
            if (wert) legeNeuAn();
          }}
        />
      ) : null}

      {wartendeUebergabe ? (
        <Dialog
          titel={
            warnung.laeuft && warnung.ungespeichert
              ? t('bestaetigen.neuBeides')
              : warnung.laeuft
                ? t('bestaetigen.neuLaeuft')
                : t('bestaetigen.neuUngespeichert')
          }
          bestaetigen={t('knopf.verwerfen')}
          onAbschluss={(wert) => {
            const welche = wartendeUebergabe;
            setWartendeUebergabe(null);
            if (wert) uebernimm(welche);
          }}
        />
      ) : null}

      {umbenennen ? (
        <Dialog
          titel={t('dialog.umbenennen')}
          vorgabe={umbenennen.name}
          bestaetigen={t('knopf.umbenennen')}
          onAbschluss={(wert) => {
            const wen = umbenennen.id;
            setUmbenennen(null);
            if (wert) {
              setzeUndSichere((vorher) =>
                mitTeilnehmer(vorher, wen, (alt) => ({ ...alt, name: wert }))
              );
            }
          }}
        />
      ) : null}

      {flaechenmenue ? (
        <Kontextmenue
          x={flaechenmenue.x}
          y={flaechenmenue.y}
          onSchliessen={() => setFlaechenmenue(null)}
          eintraege={[
            { text: t('knopf.neu'), onWahl: neu },
            { text: t('knopf.terrain'), onWahl: neuesGelaende }
          ]}
        />
      ) : null}

      {meldung ? <div className="meldung motion-eintritt">{meldung}</div> : null}
    </div>
  );
}
