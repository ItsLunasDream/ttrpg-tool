/**
 * Die Begegnung zu einem Ziel zusammenstellen lassen.
 *
 * Man sagt, wie stark sie sein soll (Grad oder EP), optional wie viele
 * Gegner, und woraus gewaehlt wird. Was schon in der Begegnung steht, bleibt
 * auf Wunsch drin — so legt man fest, welche Monster vorkommen muessen:
 * erst im Katalog dazunehmen, dann hier auffuellen lassen.
 */
import { useState } from 'react';
import { KREATURENTYPEN, type Kreaturentyp } from '@suite/srd/monster';
import { GRADE, typName, type Katalogkarte, type Sprache } from '../shared/katalog';
import type { Gegner } from '../shared/ablage';
import {
  abweichung,
  naechsterGrad,
  stelleZusammen,
  zielAusGrad,
  type Pflicht
} from '../shared/zusammenstellen';
import { t } from './i18n';

type Quelle = 'srd' | 'eigen' | 'gemischt';

interface Ergebnis {
  readonly ziel: number;
  readonly ep: number | null;
}

/** Ab dieser Abweichung sagt das Werkzeug es dazu. */
const HINWEIS_AB = 0.1;

export function Zusammensteller({
  karten,
  gegner,
  sprache,
  setzeGegner
}: {
  readonly karten: readonly Katalogkarte[];
  readonly gegner: readonly Gegner[];
  readonly sprache: Sprache;
  readonly setzeGegner: (neu: Gegner[]) => void;
}) {
  const [art, setArt] = useState<'hg' | 'ep'>('hg');
  const [grad, setGrad] = useState('3');
  const [ep, setEp] = useState('700');
  const [anzahl, setAnzahl] = useState('');
  const [quelle, setQuelle] = useState<Quelle>('gemischt');
  const [typ, setTyp] = useState<Kreaturentyp | ''>('');
  const [behalten, setBehalten] = useState(true);
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);

  const zahlformat = (n: number) => n.toLocaleString(sprache === 'de' ? 'de-DE' : 'en-US');

  const los = () => {
    const ziel = art === 'hg' ? zielAusGrad(grad) : Math.round(Number(ep));
    if (!ziel || ziel <= 0) return;
    const vorrat = karten.filter(
      (k) => (quelle === 'gemischt' || k.quelle === quelle) && (!typ || k.typ === typ)
    );
    const pflicht: Pflicht[] = behalten
      ? gegner.flatMap((g) => {
          const karte = karten.find((k) => k.id === g.monsterId);
          return karte ? [{ karte, anzahl: g.anzahl }] : [];
        })
      : [];
    const zahl = anzahl.trim() === '' ? null : Math.max(1, Math.round(Number(anzahl)) || 1);
    const vorschlag = stelleZusammen({ zielEp: ziel, anzahl: zahl, vorrat, pflicht });
    setErgebnis({ ziel, ep: vorschlag ? vorschlag.ep : null });
    if (!vorschlag) return;
    setzeGegner(
      vorschlag.gegner.map((g) => ({ monsterId: g.karte.id, name: g.karte.name, anzahl: g.anzahl }))
    );
  };

  return (
    <div className="zusammensteller">
      <div className="zusammensteller__reihe">
        <div className="katalog__quelle" role="group" aria-label={t('bau.ziel')}>
          {(['hg', 'ep'] as const).map((a) => (
            <button
              key={a}
              type="button"
              className={art === a ? 'is-an' : ''}
              aria-pressed={art === a}
              data-ziel-art={a}
              onClick={() => setArt(a)}
            >
              {t(`bau.${a}` as 'bau.hg')}
            </button>
          ))}
        </div>
        {art === 'hg' ? (
          <select
            className="feld__wahl katalog__grad"
            aria-label={t('bau.hg')}
            data-bau="grad"
            value={grad}
            onChange={(e) => setGrad(e.target.value)}
          >
            {GRADE.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="gruppenfeld__zahl zusammensteller__ep"
            type="number"
            min={10}
            step={50}
            aria-label={t('bau.ep')}
            data-bau="ep"
            value={ep}
            onChange={(e) => setEp(e.target.value)}
          />
        )}
        <label className="zusammensteller__feld">
          {t('bau.anzahl')}
          <input
            className="gruppenfeld__zahl"
            type="number"
            min={1}
            max={30}
            placeholder={t('bau.beliebig')}
            data-bau="anzahl"
            value={anzahl}
            onChange={(e) => setAnzahl(e.target.value)}
          />
        </label>
      </div>
      <div className="zusammensteller__reihe">
        <div className="katalog__quelle" role="group" aria-label={t('katalog.quelle')}>
          {(['srd', 'eigen', 'gemischt'] as const).map((q) => (
            <button
              key={q}
              type="button"
              className={quelle === q ? 'is-an' : ''}
              aria-pressed={quelle === q}
              data-bau-quelle={q}
              onClick={() => setQuelle(q)}
            >
              {t(`bau.quelle.${q}` as 'bau.quelle.srd')}
            </button>
          ))}
        </div>
        <select
          className="feld__wahl"
          aria-label={t('katalog.typ')}
          value={typ}
          onChange={(e) => setTyp(e.target.value as Kreaturentyp | '')}
        >
          <option value="">{t('katalog.alleTypen')}</option>
          {(Object.keys(KREATURENTYPEN) as Kreaturentyp[])
            .sort((a, b) => typName(a, sprache).localeCompare(typName(b, sprache), sprache))
            .map((k) => (
              <option key={k} value={k}>
                {typName(k, sprache)}
              </option>
            ))}
        </select>
        <label className="katalog__haken">
          <input
            type="checkbox"
            checked={behalten}
            data-bau="behalten"
            onChange={(e) => setBehalten(e.target.checked)}
          />
          {t('bau.behalten')}
        </label>
        <button type="button" className="knopf knopf--haupt" data-bau="los" onClick={los}>
          {t('bau.los')}
        </button>
      </div>

      {ergebnis ? (
        ergebnis.ep === null ? (
          <p className="fehler" data-bau-ergebnis>
            {t('bau.nichts')}
          </p>
        ) : (
          <p
            className={
              abweichung(ergebnis.ep, ergebnis.ziel) > HINWEIS_AB ||
              naechsterGrad(ergebnis.ep) !== naechsterGrad(ergebnis.ziel)
                ? 'zusammensteller__ergebnis is-abweichend'
                : 'zusammensteller__ergebnis'
            }
            data-bau-ergebnis
          >
            {t('bau.ergebnis', {
              ziel: zahlformat(ergebnis.ziel),
              zielGrad: naechsterGrad(ergebnis.ziel),
              ep: zahlformat(ergebnis.ep),
              grad: naechsterGrad(ergebnis.ep)
            })}
            {abweichung(ergebnis.ep, ergebnis.ziel) > HINWEIS_AB ||
            naechsterGrad(ergebnis.ep) !== naechsterGrad(ergebnis.ziel) ? (
              <>
                {' '}
                <b>
                  {t('bau.abweichung', {
                    prozent: Math.round(abweichung(ergebnis.ep, ergebnis.ziel) * 100)
                  })}
                </b>
              </>
            ) : null}
          </p>
        )
      ) : (
        <p className="hinweis hinweis--klein">{t('bau.hinweis')}</p>
      )}
    </div>
  );
}
