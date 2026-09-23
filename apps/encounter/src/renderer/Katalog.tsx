/**
 * Der Monsterkatalog: offizielle und eigene Monster, filtern, sortieren,
 * nachlesen, dazunehmen.
 *
 * Eine Tabelle und keine Kacheln: bei dreihundert Monstern vergleicht man
 * Zahlen, und Zahlen vergleicht man in Spalten. Ein Klick auf den Namen
 * klappt den ganzen Wertekasten auf, ein Klick auf „+" nimmt das Monster in
 * die Begegnung.
 */
import { useMemo, useState } from 'react';
import { KREATURENTYPEN, SRD_MONSTER, type Kreaturentyp } from '@suite/srd/monster';
import {
  GRADE,
  LEERER_FILTER,
  SRD_PRAEFIX,
  filtere,
  typName,
  type Filter,
  type Katalogkarte,
  type Sortierung,
  type Spalte,
  type Sprache
} from '../shared/katalog';
import { gradAlsZahl } from '../shared/schwierigkeit';
import { t } from './i18n';

/** Mehr Zeilen zeichnet die Liste nicht auf einmal; der Rest kommt auf Wunsch. */
const SEITE = 60;

export function Katalog({
  karten,
  sprache,
  dazu
}: {
  readonly karten: readonly Katalogkarte[];
  readonly sprache: Sprache;
  readonly dazu: (karte: Katalogkarte) => void;
}) {
  const [filter, setFilter] = useState<Filter>(LEERER_FILTER);
  const [sortierung, setSortierung] = useState<Sortierung>({ spalte: 'name', absteigend: false });
  const [offen, setOffen] = useState<string | null>(null);
  const [anzahl, setAnzahl] = useState(SEITE);

  const liste = useMemo(
    () => filtere(karten, filter, sortierung, sprache),
    [karten, filter, sortierung, sprache]
  );

  const setze = (teil: Partial<Filter>) => {
    setFilter((vorher) => ({ ...vorher, ...teil }));
    setAnzahl(SEITE);
  };

  const kopf = (spalte: Spalte, text: string) => (
    <th
      scope="col"
      aria-sort={
        sortierung.spalte === spalte ? (sortierung.absteigend ? 'descending' : 'ascending') : 'none'
      }
    >
      <button
        type="button"
        className="katalog__sortierer"
        data-sortiere={spalte}
        onClick={() =>
          setSortierung((vorher) => ({
            spalte,
            absteigend: vorher.spalte === spalte ? !vorher.absteigend : spalte !== 'name' && spalte !== 'typ'
          }))
        }
      >
        {text}
        {sortierung.spalte === spalte ? (sortierung.absteigend ? ' ▾' : ' ▴') : ''}
      </button>
    </th>
  );

  const gradWahl = (wert: number | null, setzen: (neu: number | null) => void, beschriftung: string) => (
    <select
      className="feld__wahl katalog__grad"
      aria-label={beschriftung}
      value={wert === null ? '' : String(wert)}
      onChange={(e) => setzen(e.target.value === '' ? null : Number(e.target.value))}
    >
      <option value="">{beschriftung}</option>
      {GRADE.map((g) => (
        <option key={g} value={String(gradAlsZahl(g))}>
          {g}
        </option>
      ))}
    </select>
  );

  return (
    <div className="katalog">
      <div className="katalog__filter">
        <input
          className="feld__eingabe katalog__suche"
          type="search"
          value={filter.suche}
          placeholder={t('monster.suche')}
          aria-label={t('monster.suche')}
          onChange={(e) => setze({ suche: e.target.value })}
        />
        <div className="katalog__quelle" role="group" aria-label={t('katalog.quelle')}>
          {(['alle', 'srd', 'eigen'] as const).map((q) => (
            <button
              key={q}
              type="button"
              className={filter.quelle === q ? 'is-an' : ''}
              aria-pressed={filter.quelle === q}
              data-quelle={q}
              onClick={() => setze({ quelle: q })}
            >
              {t(`katalog.quelle.${q}` as 'katalog.quelle.alle')}
            </button>
          ))}
        </div>
        <select
          className="feld__wahl"
          aria-label={t('katalog.typ')}
          data-filter="typ"
          value={filter.typ}
          onChange={(e) => setze({ typ: e.target.value as Kreaturentyp | '' })}
        >
          <option value="">{t('katalog.alleTypen')}</option>
          {(Object.keys(KREATURENTYPEN) as Kreaturentyp[])
            .sort((a, b) => typName(a, sprache).localeCompare(typName(b, sprache), sprache))
            .map((typ) => (
              <option key={typ} value={typ}>
                {typName(typ, sprache)}
              </option>
            ))}
        </select>
        {gradWahl(filter.hgVon, (neu) => setze({ hgVon: neu }), t('katalog.hgVon'))}
        {gradWahl(filter.hgBis, (neu) => setze({ hgBis: neu }), t('katalog.hgBis'))}
        <label className="katalog__haken">
          <input
            type="checkbox"
            checked={filter.nurLegendaer}
            data-filter="legendaer"
            onChange={(e) => setze({ nurLegendaer: e.target.checked })}
          />
          {t('katalog.legendaer')}
        </label>
      </div>

      <p className="anzahl">{t('katalog.anzahl', { anzahl: liste.length })}</p>

      {liste.length === 0 ? (
        <p className="hinweis">{t('monster.nichts')}</p>
      ) : (
        <table className="katalog__tabelle">
          <thead>
            <tr>
              {kopf('name', t('katalog.name'))}
              {kopf('typ', t('katalog.typ'))}
              {kopf('hg', t('katalog.hg'))}
              {kopf('tp', t('katalog.tp'))}
              {kopf('rk', t('katalog.rk'))}
              <th scope="col">
                <span className="katalog__unsichtbar">{t('monster.dazu')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {liste.slice(0, anzahl).map((k) => (
              <Zeile
                key={k.id}
                karte={k}
                sprache={sprache}
                offen={offen === k.id}
                umschalten={() => setOffen(offen === k.id ? null : k.id)}
                dazu={() => dazu(k)}
              />
            ))}
          </tbody>
        </table>
      )}
      {liste.length > anzahl ? (
        <button type="button" className="knopf" onClick={() => setAnzahl((n) => n + SEITE * 3)}>
          {t('katalog.mehr', { anzahl: liste.length - anzahl })}
        </button>
      ) : null}
    </div>
  );
}

function Zeile({
  karte,
  sprache,
  offen,
  umschalten,
  dazu
}: {
  readonly karte: Katalogkarte;
  readonly sprache: Sprache;
  readonly offen: boolean;
  readonly umschalten: () => void;
  readonly dazu: () => void;
}) {
  const srd = karte.quelle === 'srd';
  return (
    <>
      <tr className={offen ? 'katalog__zeile is-offen' : 'katalog__zeile'} data-karte={karte.id}>
        <td>
          <button
            type="button"
            className="katalog__name"
            aria-expanded={srd ? offen : undefined}
            disabled={!srd}
            onClick={umschalten}
          >
            {karte.name}
          </button>
          {karte.legendaer ? (
            <span className="katalog__marke" title={t('katalog.legendaer')}>
              ★
            </span>
          ) : null}
          {srd ? null : <span className="katalog__marke katalog__marke--eigen">{t('katalog.eigen')}</span>}
        </td>
        <td>{typName(karte.typ, sprache)}</td>
        <td className="katalog__zahl">{karte.cr || '?'}</td>
        <td className="katalog__zahl">{karte.tp}</td>
        <td className="katalog__zahl">{karte.rk}</td>
        <td>
          <button
            type="button"
            className="katalog__dazu"
            data-monster={karte.id}
            title={t('monster.dazu')}
            aria-label={`${t('monster.dazu')}: ${karte.name}`}
            onClick={dazu}
          >
            +
          </button>
        </td>
      </tr>
      {offen && srd ? (
        <tr className="katalog__blatt">
          <td colSpan={6}>
            <Wertekasten id={karte.id.slice(SRD_PRAEFIX.length)} sprache={sprache} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

const ABSCHNITT_NAME: Record<string, readonly [string, string]> = {
  merkmale: ['Merkmale', 'Traits'],
  aktionen: ['Aktionen', 'Actions'],
  bonusaktionen: ['Bonusaktionen', 'Bonus Actions'],
  reaktionen: ['Reaktionen', 'Reactions'],
  legendaer: ['Legendäre Aktionen', 'Legendary Actions']
};

const ATTRIBUTE: Record<Sprache, readonly string[]> = {
  de: ['Stä', 'Ges', 'Kon', 'Int', 'Wei', 'Cha'],
  en: ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha']
};

/** Der ganze Wertekasten eines SRD-Monsters, woertlich. */
function Wertekasten({ id, sprache }: { readonly id: string; readonly sprache: Sprache }) {
  const m = SRD_MONSTER.find((x) => x.id === id);
  if (!m) return null;
  const de = sprache === 'de';
  const mod = (wert: number) => {
    const z = Math.floor((wert - 10) / 2);
    return z >= 0 ? `+${z}` : `−${-z}`;
  };
  return (
    <div className="wertekasten">
      <p className="wertekasten__art">{m.art[sprache]}</p>
      <p>
        <b>{de ? 'RK' : 'AC'}</b> {m.rk} · <b>Initiative</b> {m.initiative >= 0 ? '+' : '−'}
        {Math.abs(m.initiative)} · <b>{de ? 'TP' : 'HP'}</b> {m.tp} ({m.tpFormel[sprache]})
      </p>
      <p>
        <b>{de ? 'Bewegungsrate' : 'Speed'}</b> {m.bewegung[sprache]}
      </p>
      <div className="wertekasten__attribute">
        {m.attribute.map((wert, i) => (
          <span key={ATTRIBUTE[sprache][i]}>
            <b>{ATTRIBUTE[sprache][i]}</b> {wert} ({mod(wert)})
          </span>
        ))}
      </div>
      {m.zeilen[sprache].map((zeile) => (
        <p key={zeile} className="wertekasten__zeile">
          {zeile}
        </p>
      ))}
      <p className="wertekasten__zeile">
        <b>{de ? 'HG' : 'CR'}</b> {m.hg} ({m.ep.toLocaleString(de ? 'de-DE' : 'en-US')} {de ? 'EP' : 'XP'})
      </p>
      {m.abschnitte.map((a) => (
        <section key={a.id} className="wertekasten__abschnitt">
          <h5>{ABSCHNITT_NAME[a.id]?.[de ? 0 : 1] ?? a.id}</h5>
          {a.einleitung[sprache] ? <p>{a.einleitung[sprache]}</p> : null}
          {a.eintraege.map((e) => (
            <p key={e.name.en}>
              <b>
                <i>
                  {e.name[sprache]}
                  {de ? ':' : '.'}
                </i>
              </b>{' '}
              {e.text[sprache]}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
