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
  setzeAnzahl,
  wuerfle,
  type Auswahl,
  type Wurf
} from '../shared/pool';
import { STANDARD, type Einstellungen } from '../shared/einstellungen';
import { getLanguage, onLanguageChange, t, type Language } from './i18n';
import { Wuerfel } from './Wuerfel';

/** Wie lange die Wuerfel rollen. Aus @suite/motion: DAUER.ortswechsel × 3. */
const ROLLDAUER = 660;

export function App() {
  const [auswahl, setAuswahl] = useState<Auswahl>({});
  const [modifikator, setModifikator] = useState(0);
  const [wurf, setWurf] = useState<Wurf | null>(null);
  const [rollt, setRollt] = useState(false);
  const [einstellungen, setEinstellungen] = useState<Einstellungen>(STANDARD);
  const [, setSprache] = useState<Language>(getLanguage);

  useEffect(() => onLanguageChange(() => setSprache(getLanguage())), []);

  const gesamt = anzahlGesamt(auswahl);
  const ausdruck = useMemo(
    () => alsAusdruck(auswahl, einstellungen.eigeneSeiten, modifikator),
    [auswahl, einstellungen.eigeneSeiten, modifikator]
  );

  const rolle = useCallback(() => {
    if (gesamt === 0 || rollt) return;
    setRollt(true);
    // Das Ergebnis steht sofort fest; die Animation ist Schau, keine
    // Berechnung. Wuerde erst danach gewuerfelt, koennte ein zweiter Klick
    // waehrend der Drehung zwei Wuerfe ausloesen.
    const neuerWurf = wuerfle(auswahl, einstellungen.eigeneSeiten, modifikator);
    window.setTimeout(() => {
      setWurf(neuerWurf);
      setRollt(false);
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
                  ? (seiten) => setEinstellungen((vorher) => ({ ...vorher, eigeneSeiten: seiten }))
                  : undefined
              }
            />
          ))}
        </div>

        <label className="feld">
          <span className="feld__label">{t('feld.modifikator')}</span>
          <input
            type="number"
            value={modifikator}
            onChange={(ereignis) => setModifikator(Number.parseInt(ereignis.target.value, 10) || 0)}
          />
        </label>

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

        {wurf && !rollt ? (
          <div className="buehne__summe motion-eintritt" key={wurf.summe + wurf.ausdruck}>
            <span className="buehne__summe-zahl">{wurf.summe}</span>
          </div>
        ) : null}
      </main>
    </div>
  );
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
