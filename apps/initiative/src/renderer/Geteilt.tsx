/**
 * Der geteilte Kampf eines anderen, so wie er im Raum ankommt.
 *
 * Nur ansehen — bis auf die eigene Figur: deren Trefferpunkte und Zustaende
 * lassen sich hier aendern. Die Aenderung geht an den, der teilt; er prueft
 * sie und schickt den neuen Stand. Bis dahin steht hier der alte: angezeigt
 * wird nie etwas, das nicht bestaetigt ist.
 */
import { useState } from 'react';
import type { Aenderung, GeteilterKampf, GeteilterTeilnehmer } from '../shared/teilen';
import { t } from './i18n';

interface Props {
  readonly von: string;
  readonly stand: GeteilterKampf;
  /** Der eigene Name im Raum: wessen Figur man aendern darf. */
  readonly ich: string | null;
  onAenderung(aenderung: Aenderung): void;
}

export function Geteilt({ von, stand, ich, onAenderung }: Props) {
  return (
    <section className="geteilt motion-erscheinen" data-geteilt>
      <header className="geteilt__kopf">
        <strong>{t('raum.geteilt', { name: von })}</strong>
        {stand.name ? <span>{stand.name}</span> : null}
        {stand.laeuft ? <span>{t('runde', { n: stand.runde })}</span> : null}
      </header>
      <ol className="geteilt__liste">
        {stand.teilnehmer.map((teilnehmer) => (
          <Zeile
            key={teilnehmer.id}
            teilnehmer={teilnehmer}
            eigen={ich !== null && teilnehmer.gehoert === ich}
            onAenderung={onAenderung}
          />
        ))}
      </ol>
    </section>
  );
}

function Zeile({
  teilnehmer,
  eigen,
  onAenderung
}: {
  teilnehmer: GeteilterTeilnehmer;
  eigen: boolean;
  onAenderung(aenderung: Aenderung): void;
}) {
  const [zustand, setZustand] = useState('');
  const [runden, setRunden] = useState('');
  return (
    <li
      className={`geteilt__zeile${teilnehmer.amZug ? ' is-dran' : ''}${eigen ? ' is-eigen' : ''}`}
      data-geteilt-zeile={teilnehmer.name}
    >
      <div className="geteilt__name">
        <span>{teilnehmer.name}</span>
        {teilnehmer.gehoert ? (
          <span className="geteilt__besitz">{eigen ? t('raum.deine') : teilnehmer.gehoert}</span>
        ) : null}
      </div>
      <div className="geteilt__koerper">
        {teilnehmer.koerper.map((k) =>
          k.hp !== undefined ? (
            <span key={k.id} className="geteilt__hp">
              {k.marke ? `${k.marke}: ` : ''}
              {eigen ? (
                <input
                  className="geteilt__hpfeld"
                  data-geteilt-hp={teilnehmer.name}
                  defaultValue={k.hp}
                  key={k.hp}
                  title={t('raum.hpSetzen')}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    const wert = Number.parseInt((e.target as HTMLInputElement).value, 10);
                    if (Number.isFinite(wert)) onAenderung({ art: 'hp', teilnehmerId: teilnehmer.id, koerperId: k.id, hp: wert });
                  }}
                />
              ) : (
                k.hp
              )}
              /{k.hpMax}
              {k.tempHp ? ` (+${k.tempHp})` : ''}
            </span>
          ) : (
            <span key={k.id} className={`geteilt__stufe geteilt__stufe--${k.stufe}`} data-stufe={k.stufe}>
              {k.marke ? `${k.marke}: ` : ''}
              {t(`stufe.${k.stufe}`)}
            </span>
          )
        )}
      </div>
      <div className="geteilt__zustaende">
        {teilnehmer.zustaende.map((z) => (
          <span key={z.id} className="geteilt__zustand">
            {z.name}
            {z.rundenRest !== null ? ` (${z.rundenRest})` : ''}
            {eigen ? (
              <button
                type="button"
                className="geteilt__weg"
                aria-label="×"
                onClick={() => onAenderung({ art: 'zustand-weg', teilnehmerId: teilnehmer.id, zustandId: z.id })}
              >
                ×
              </button>
            ) : null}
          </span>
        ))}
        {eigen ? (
          <form
            className="geteilt__neu"
            onSubmit={(e) => {
              e.preventDefault();
              const name = zustand.trim();
              if (!name) return;
              const zahl = Number.parseInt(runden, 10);
              onAenderung({
                art: 'zustand-dazu',
                teilnehmerId: teilnehmer.id,
                name,
                runden: Number.isFinite(zahl) && zahl > 0 ? zahl : null
              });
              setZustand('');
              setRunden('');
            }}
          >
            <input
              data-geteilt-zustand={teilnehmer.name}
              value={zustand}
              maxLength={60}
              placeholder={t('raum.zustandNeu')}
              onChange={(e) => setZustand(e.target.value)}
            />
            <input
              className="geteilt__runden"
              value={runden}
              inputMode="numeric"
              placeholder={t('raum.runden')}
              onChange={(e) => setRunden(e.target.value)}
            />
          </form>
        ) : null}
      </div>
    </li>
  );
}
