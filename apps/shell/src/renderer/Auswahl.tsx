/**
 * Was geteilt wird: die Auswahl der Eintraege.
 *
 * Rueckmeldung: „Die Auswahl muss deutlich schoener werden. Sortierung nach
 * Apps. Zusaetzlich zur Suche ein Filter, bei dem man anklickt, welche Apps
 * angezeigt werden — wie bei Amazon die Kategorien."
 *
 * Also drei Dinge uebereinander:
 * - Filter-Chips, einer je App mit Eintraegen, mit Anzahl. Keiner gewaehlt
 *   heisst alle; mehrere sind erlaubt.
 * - Die Suche wie bisher, sie wirkt innerhalb der gewaehlten Apps.
 * - Die Liste, nach App gruppiert, mit Symbol, Anzahl und „alle waehlen" je
 *   Gruppe.
 *
 * Die offiziellen Regeln des Nachschlagewerks (ueber 900) stehen nur bei
 * einer Suche in der Liste; sonst waeren sie eine Wand.
 */
import { useMemo, useState } from 'react';
import { eintragsSchluessel, finde, type Eintrag } from '@suite/eintraege';
import type { MessageKey, MessageParams } from '../shared/i18n';
import { nameKey } from '../shared/apps';
import { AppSymbol } from './icons';

interface Props {
  readonly teilbar: readonly Eintrag[] | null;
  readonly gewaehlt: ReadonlySet<string>;
  readonly setGewaehlt: (neu: Set<string>) => void;
  readonly symbole: Record<string, string>;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

function istOffiziell(e: Eintrag): boolean {
  return e.werkzeug === 'nachschlagewerk' && !e.kennung.startsWith('hausregel/');
}

export function Auswahl({ teilbar, gewaehlt, setGewaehlt, symbole, t }: Props) {
  const [suche, setSuche] = useState('');
  const [apps, setApps] = useState<ReadonlySet<string>>(new Set());
  const werkzeugName = (id: string) => t(nameKey(id));

  /** Die Apps mit Eintraegen, und wie viele (ohne die offiziellen Regeln). */
  const chips = useMemo(() => {
    const zahl = new Map<string, number>();
    for (const e of teilbar ?? []) if (!istOffiziell(e)) zahl.set(e.werkzeug, (zahl.get(e.werkzeug) ?? 0) + 1);
    return [...zahl.entries()].sort((a, b) => werkzeugName(a[0]).localeCompare(werkzeugName(b[0])));
  }, [teilbar, t]);

  const gruppen = useMemo(() => {
    if (!teilbar) return [];
    const imFilter = (e: Eintrag) => apps.size === 0 || apps.has(e.werkzeug);
    const liste = suche.trim()
      ? [...finde(teilbar.filter(imFilter), suche, 300)]
      : teilbar.filter((e) => imFilter(e) && !istOffiziell(e));
    const nachApp = new Map<string, Eintrag[]>();
    for (const e of liste) nachApp.set(e.werkzeug, [...(nachApp.get(e.werkzeug) ?? []), e]);
    return [...nachApp.entries()]
      .sort((a, b) => werkzeugName(a[0]).localeCompare(werkzeugName(b[0])))
      .map(([werkzeug, eintraege]) => ({
        werkzeug,
        eintraege: suche.trim() ? eintraege : [...eintraege].sort((a, b) => a.name.localeCompare(b.name))
      }));
  }, [teilbar, suche, apps, t]);

  const schalteApp = (id: string) => {
    const neu = new Set(apps);
    if (neu.has(id)) neu.delete(id);
    else neu.add(id);
    setApps(neu);
  };

  const schalte = (schluessel: readonly string[], an: boolean) => {
    const neu = new Set(gewaehlt);
    for (const k of schluessel) {
      if (an) neu.add(k);
      else neu.delete(k);
    }
    setGewaehlt(neu);
  };

  if (teilbar === null) return <p className="einst__satz">{t('search.loading')}</p>;

  return (
    <div className="auswahl" data-auswahl>
      <div className="auswahl__chips" role="group" aria-label={t('share.filterApps')}>
        <button
          type="button"
          className={apps.size === 0 ? 'auswahl__chip is-an' : 'auswahl__chip'}
          aria-pressed={apps.size === 0}
          data-chip="alle"
          onClick={() => setApps(new Set())}
        >
          {t('share.allApps')}
        </button>
        {chips.map(([id, anzahl]) => (
          <button
            key={id}
            type="button"
            className={apps.has(id) ? 'auswahl__chip is-an' : 'auswahl__chip'}
            aria-pressed={apps.has(id)}
            data-chip={id}
            onClick={() => schalteApp(id)}
          >
            <AppSymbol id={id} size={16} bild={symbole[id]} />
            {werkzeugName(id)}
            <span className="auswahl__zahl">{anzahl}</span>
          </button>
        ))}
      </div>

      <input
        className="suche__feld austausch__filter"
        value={suche}
        placeholder={t('share.filter')}
        data-auswahl-suche
        onChange={(e) => setSuche(e.target.value)}
      />

      {gruppen.length === 0 ? (
        <p className="einst__satz">{t('share.nothing')}</p>
      ) : (
        <div className="auswahl__gruppen">
          {gruppen.map(({ werkzeug, eintraege }) => {
            const schluessel = eintraege.map(eintragsSchluessel);
            const alle = schluessel.every((k) => gewaehlt.has(k));
            return (
              <section key={werkzeug} className="auswahl__gruppe motion-erscheinen" data-gruppe={werkzeug}>
                <header className="auswahl__kopf">
                  <AppSymbol id={werkzeug} size={20} bild={symbole[werkzeug]} />
                  <strong>{werkzeugName(werkzeug)}</strong>
                  <span className="auswahl__zahl">{eintraege.length}</span>
                  <span className="auswahl__luecke" />
                  <button
                    type="button"
                    className="auswahl__alle"
                    data-gruppe-alle={werkzeug}
                    onClick={() => schalte(schluessel, !alle)}
                  >
                    {alle ? t('share.noneInGroup') : t('share.allInGroup')}
                  </button>
                </header>
                <ul className="auswahl__liste">
                  {eintraege.map((e) => {
                    const k = eintragsSchluessel(e);
                    const an = gewaehlt.has(k);
                    return (
                      <li key={k}>
                        <label className={an ? 'auswahl__karte is-an' : 'auswahl__karte'}>
                          <input
                            type="checkbox"
                            data-teilen={k}
                            checked={an}
                            onChange={() => schalte([k], !an)}
                          />
                          <span className="auswahl__name">{e.name}</span>
                          {e.art ? <span className="auswahl__art">{e.art}</span> : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
