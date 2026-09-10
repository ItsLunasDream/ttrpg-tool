/**
 * Der Wuerfel.
 *
 * Links die Auswahl: je Wuerfelart ein Symbol mit einer Zahl. Rechts der Wurf.
 * Die Auswahl bleibt nach dem Rollen stehen — man wuerfelt am Tisch dieselbe
 * Sache mehrmals hintereinander, und sie jedes Mal neu zusammenzuklicken waere
 * die haeufigste Handlung, die man sich sparen kann.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ARTEN, artName, seitenVon, type Art } from '../shared/formen';
import {
  aendereAnzahl,
  alsAusdruck,
  anzahlGesamt,
  begrenzeModifikator,
  MAX_MODIFIKATOR,
  setzeAnzahl,
  wuerfle,
  type Auswahl,
  type Wurf
} from '../shared/pool';
import { STANDARD, type Einstellungen } from '../shared/einstellungen';
import { getLanguage, onLanguageChange, t, type Language } from './i18n';
import { Wuerfel } from './Wuerfel';
import { Verlauf } from './Verlauf';
import { VERLAUF_LAENGE, type Eintrag } from './verlaufTypen';
import { Aussehen } from './Aussehen';
import { Buehne3d, kannDreiD } from './wuerfel3d/Buehne3d';
import { api } from './api';

/** Wie lange die Wuerfel rollen. Aus @suite/motion: DAUER.ortswechsel × 3. */
const ROLLDAUER = 660;

/**
 * Bis zu wie vielen Wuerfeln als Koerper geworfen wird.
 *
 * Darueber bleibt es bei der flachen Darstellung. Die Zahl ist gemessen: im
 * Vorversuch lagen zwanzig Koerper nach gut zwei Sekunden, hundert erst nach
 * dreizehn, und allein das Rechnen dauerte da 1,6 Sekunden. Hundert ist der
 * ausdrueckliche Extremfall und darf sich zaeh anfuehlen; darueber waere es
 * kein Wuerfeln mehr, sondern Warten.
 */
const DREID_HOECHSTENS = 100;

export function App() {
  const [auswahl, setAuswahl] = useState<Auswahl>({});
  const [modifikator, setModifikator] = useState(0);
  const [wurf, setWurf] = useState<Wurf | null>(null);
  const [rollt, setRollt] = useState(false);
  const [einstellungen, setEinstellungen] = useState<Einstellungen>(STANDARD);
  const [verlauf, setVerlauf] = useState<Eintrag[]>([]);
  const [, setSprache] = useState<Language>(getLanguage);
  // Einmal beim Start gemessen und nicht bei jedem Bild: die Antwort aendert
  // sich waehrend einer Sitzung nicht, und die Probe legt jedes Mal eine
  // Leinwand an.
  const [grafikDa] = useState(kannDreiD);
  const [wurfNummer, setWurfNummer] = useState(0);

  useEffect(() => onLanguageChange(() => setSprache(getLanguage())), []);

  // Das Aussehen bleibt ueber Neustarts — es ist eine Einstellung, kein
  // Sitzungszustand. Der Verlauf daneben ausdruecklich nicht.
  useEffect(() => {
    void api.einstellungen.lesen().then(setEinstellungen);
  }, []);

  const aendereEinstellungen = useCallback((teil: Partial<Einstellungen>) => {
    setEinstellungen((vorher) => {
      const neu = { ...vorher, ...teil };
      void api.einstellungen.schreiben(neu);
      return neu;
    });
  }, []);

  const gesamt = anzahlGesamt(auswahl);
  const ausdruck = useMemo(
    () => alsAusdruck(auswahl, einstellungen.eigeneSeiten, modifikator),
    [auswahl, einstellungen.eigeneSeiten, modifikator]
  );

  /**
   * Die Wuerfel des laufenden Wurfs fuer die Koerperdarstellung.
   *
   * Erst wenn ein Ergebnis vorliegt: die Koerper zeigen den Wurf, keine
   * Vorschau. Vor dem ersten Wurf bleibt die Buehne leer, und das ist
   * richtig — ein Haufen liegender Koerper ohne Zahlen sagt weniger als
   * nichts.
   */
  const dreiDEinwuerfe = useMemo(
    () =>
      wurf
        ? wurf.wuerfe.map((einzel) => ({
            art: einzel.art,
            augen: einzel.augen,
            hoechst: einzel.istHoechst && einstellungen.glitzerAn,
            tiefst: einzel.istTiefst && einstellungen.streifenAn
          }))
        : [],
    [wurf, einstellungen.glitzerAn, einstellungen.streifenAn]
  );
  const dreiDAn =
    einstellungen.dreiD && grafikDa && gesamt <= DREID_HOECHSTENS && dreiDEinwuerfe.length > 0;

  const rolle = useCallback(() => {
    if (gesamt === 0 || rollt) return;
    setRollt(true);
    setWurfNummer((vorher) => vorher + 1);
    // Das Ergebnis steht sofort fest; die Animation ist Schau, keine
    // Berechnung. Wuerde erst danach gewuerfelt, koennte ein zweiter Klick
    // waehrend der Drehung zwei Wuerfe ausloesen.
    const neuerWurf = wuerfle(auswahl, einstellungen.eigeneSeiten, modifikator);
    window.setTimeout(() => {
      setWurf(neuerWurf);
      setRollt(false);
      setVerlauf((vorher) =>
        [
          {
            // Fortlaufend statt Zufall: der Verlauf lebt nur in dieser
            // Sitzung, und eine Zahl reicht als Schluessel fuer React.
            id: (vorher[0]?.id ?? 0) + 1,
            wurf: neuerWurf,
            auswahl,
            modifikator,
            eigeneSeiten: einstellungen.eigeneSeiten
          },
          ...vorher
        ].slice(0, VERLAUF_LAENGE)
      );
    }, ROLLDAUER);
  }, [auswahl, einstellungen.eigeneSeiten, modifikator, gesamt, rollt]);

  return (
    <div className="wuerfelapp">
      <aside className="auswahl">
        <p className="auswahl__hinweis">{t('pool.hinweis')}</p>
        <div className="auswahl__gitter">
          {ARTEN.map((art) => (
            <Artfeld
              key={art}
              art={art}
              anzahl={auswahl[art] ?? 0}
              einstellungen={einstellungen}
              onAendern={(schritt) => setAuswahl((vorher) => aendereAnzahl(vorher, art, schritt))}
              onSetzen={(anzahl) => setAuswahl((vorher) => setzeAnzahl(vorher, art, anzahl))}
              onSeiten={
                art === 'custom'
                  ? (seiten) => aendereEinstellungen({ eigeneSeiten: seiten })
                  : undefined
              }
            />
          ))}
        </div>

        <label className="feld">
          <span className="feld__label">{t('feld.modifikator')}</span>
          {/*
            Bei Null steht hier nichts, nur der Platzhalter — und das ist kein
            Schoenheitsgrund: stuende die 0 im Feld, koennte man keinen
            negativen Modifikator eintippen. Ein Zahlenfeld haelt ein
            getipptes Minus nur fest, solange es leer ist; ist es nicht leer,
            wird aus „-" und „5" die Anzeige „05", also +5. Genau das ist
            passiert, und ueber die Pfeile herunterzuklicken war der einzige
            Weg zu einem Abzug.
          */}
          <input
            type="number"
            value={modifikator === 0 ? '' : modifikator}
            placeholder="0"
            min={-MAX_MODIFIKATOR}
            max={MAX_MODIFIKATOR}
            onChange={(ereignis) =>
              setModifikator(begrenzeModifikator(Number.parseInt(ereignis.target.value, 10) || 0))
            }
          />
        </label>

        <Aussehen einstellungen={einstellungen} onAendern={aendereEinstellungen} />

        <div className="auswahl__knoepfe">
          <button type="button" className="knopf--haupt" onClick={rolle} disabled={gesamt === 0 || rollt}>
            {t('knopf.rollen')}
          </button>
          <button type="button" onClick={() => setAuswahl({})} disabled={gesamt === 0}>
            {t('knopf.leeren')}
          </button>
        </div>
      </aside>

      <main className="buehne">
        <div className="buehne__ausdruck">{ausdruck || t('pool.leer')}</div>

        {/*
          Drei Wege, und der gewaehlte haengt an drei Bedingungen: der
          Einstellung, der Grafikbeschleunigung und der Zahl der Wuerfel.
          Faellt eine davon aus, bleibt es bei der flachen Darstellung — die
          laeuft ueberall. Chromium hat den Rueckfall auf Software-WebGL
          bereits als ueberholt gemeldet, ganz ohne Grafikkarte kann also
          nichts kommen.
        */}
        {dreiDAn ? (
          <Buehne3d
            einwuerfe={dreiDEinwuerfe}
            einstellungen={einstellungen}
            wurfNummer={wurfNummer}
            onFertig={() => undefined}
          />
        ) : (
          <div className="buehne__tisch">
            {wurf && !rollt
              ? wurf.wuerfe.map((einzel, nummer) => (
                  <Wuerfel
                    key={nummer}
                    art={einzel.art}
                    augen={einzel.augen}
                    farbe={einstellungen.farbe}
                    muster={einstellungen.muster}
                    groesse={72}
                    abzug={!einzel.zaehltPositiv}
                    hoechst={einzel.istHoechst && einstellungen.glitzerAn}
                    tiefst={einzel.istTiefst && einstellungen.streifenAn}
                  />
                ))
              : vorschau(auswahl, einstellungen).map((eintrag, nummer) => (
                  <Wuerfel
                    key={nummer}
                    art={eintrag.art}
                    augen={null}
                    farbe={einstellungen.farbe}
                    muster={einstellungen.muster}
                    groesse={72}
                    abzug={eintrag.abzug}
                    rollt={rollt}
                    verzug={rollt ? Math.min(nummer, 12) * 22 : 0}
                  />
                ))}
          </div>
        )}

        {wurf && !rollt ? (
          <div className="buehne__summe motion-eintritt" key={`${wurf.summe}-${verlauf[0]?.id ?? 0}`}>
            <span className="buehne__summe-zahl">{wurf.summe}</span>
            <span className="buehne__summe-weg">{rechenweg(wurf)}</span>
          </div>
        ) : null}
      </main>

      <Verlauf
        eintraege={verlauf}
        onZurueckholen={(eintrag) => {
          setAuswahl(eintrag.auswahl);
          setModifikator(eintrag.modifikator);
          // Ueber aendereEinstellungen und nicht ueber setEinstellungen: die
          // Seitenzahl des eigenen Wuerfels ist eine Einstellung und muss
          // mitgeschrieben werden. Sonst zeigt das Feld nach dem Zurueckholen
          // die alte Zahl und nach dem naechsten Start wieder eine andere.
          aendereEinstellungen({ eigeneSeiten: eintrag.eigeneSeiten });
        }}
      />
    </div>
  );
}

/**
 * Der Rechenweg unter der Summe.
 *
 * Er steht da, damit man die Zahl nachvollziehen kann, ohne die Wuerfel
 * einzeln abzulesen — besonders bei einem Wurf mit Abzuegen, wo eine Summe
 * sonst leicht nach einem Fehler aussieht.
 */
function rechenweg(wurf: Wurf): string {
  const positiv = wurf.wuerfe.filter((einzel) => einzel.zaehltPositiv);
  const negativ = wurf.wuerfe.filter((einzel) => !einzel.zaehltPositiv);
  const teile: string[] = [];
  if (positiv.length > 0) teile.push(positiv.map((einzel) => einzel.augen).join(' + '));
  for (const einzel of negativ) teile.push(`− ${einzel.augen}`);
  if (wurf.modifikator !== 0) {
    teile.push(`${wurf.modifikator < 0 ? '−' : '+'} ${Math.abs(wurf.modifikator)}`);
  }
  return teile.join(' ');
}

/** Die Wuerfel, die im Pool liegen — vor dem Wurf und waehrend der Drehung. */
function vorschau(auswahl: Auswahl, einstellungen: Einstellungen): { art: Art; abzug: boolean }[] {
  const liste: { art: Art; abzug: boolean }[] = [];
  const positiv = ARTEN.filter((art) => (auswahl[art] ?? 0) > 0);
  const negativ = ARTEN.filter((art) => (auswahl[art] ?? 0) < 0);
  for (const art of [...positiv, ...negativ]) {
    const anzahl = auswahl[art] ?? 0;
    for (let i = 0; i < Math.abs(anzahl); i++) liste.push({ art, abzug: anzahl < 0 });
  }
  void einstellungen;
  return liste;
}

/**
 * Ein Feld der Auswahl: das Symbol der Wuerfelart mit einer Zahl darunter.
 *
 * Linksklick auf das Symbol legt einen dazu, Rechtsklick nimmt einen weg —
 * und das Kontextmenue muss dabei unterdrueckt werden, sonst klappt bei jedem
 * Verringern das Systemmenue auf.
 */
function Artfeld({
  art,
  anzahl,
  einstellungen,
  onAendern,
  onSetzen,
  onSeiten
}: {
  art: Art;
  anzahl: number;
  einstellungen: Einstellungen;
  onAendern: (schritt: number) => void;
  onSetzen: (anzahl: number) => void;
  /** Nur beim eigenen Wuerfel gesetzt: dort laesst sich die Seitenzahl aendern. */
  onSeiten?: (seiten: number) => void;
}) {
  const name = artName(art, einstellungen.eigeneSeiten);
  return (
    <div className={`artfeld ${anzahl !== 0 ? 'artfeld--aktiv' : ''} ${anzahl < 0 ? 'artfeld--abzug' : ''}`}>
      <Wuerfel
        art={art}
        augen={null}
        farbe={einstellungen.farbe}
        muster={einstellungen.muster}
        groesse={52}
        onClick={() => onAendern(1)}
        onContextMenu={(ereignis) => {
          ereignis.preventDefault();
          onAendern(-1);
        }}
        titel={name}
      />
      {/* Beim eigenen Wuerfel steht hier ein Eingabefeld statt eines Namens.
          Zuerst stand dort schlicht „d3" — die Standard-Seitenzahl —, und
          niemand konnte erkennen, dass das der einstellbare Wuerfel ist. */}
      {onSeiten ? (
        <span className="artfeld__seiten">
          d
          <input
            type="number"
            min={2}
            max={1000}
            value={einstellungen.eigeneSeiten}
            onChange={(ereignis) =>
              onSeiten(Math.max(2, Math.min(1000, Number.parseInt(ereignis.target.value, 10) || 2)))
            }
            aria-label={t('feld.seiten')}
          />
        </span>
      ) : (
        <span className="artfeld__name">{name}</span>
      )}
      <input
        className="artfeld__zahl"
        type="number"
        value={anzahl === 0 ? '' : anzahl}
        placeholder="0"
        onChange={(ereignis) => onSetzen(Number.parseInt(ereignis.target.value, 10) || 0)}
        aria-label={name}
      />
    </div>
  );
}

void seitenVon;
