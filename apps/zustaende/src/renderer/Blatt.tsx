/**
 * Das Zustandsblatt: der Zustand, wie er am Tisch gelesen wird.
 *
 * Aufbau nach dem, was man zuerst braucht: Zeichen und Name, der Kurzsatz,
 * dann die Stufen als Liste. Was darunter steht — Dauer, Verschlimmerung,
 * Linderung — braucht man erst, wenn es wirklich anliegt.
 *
 * Die Stufen sind nummeriert und stehen untereinander, nicht als Fliesstext.
 * Ein Absatz ist am Tisch eine Unterbrechung.
 */
import type { Zustand } from '../shared/erzeuge';
import { wirkung } from '../shared/wirkungen';
import { text } from '../shared/tabellen';
import { getLanguage, t } from './i18n';

interface Props {
  readonly zustand: Zustand;
  /** Stufentexte, die die KI ausformuliert hat. Leer heisst: aus den Tabellen. */
  readonly ausformuliert?: Readonly<Record<number, string>>;
}

export function Blatt({ zustand, ausformuliert }: Props) {
  const sprache = getLanguage() === 'en' ? 'en' : 'de';

  const stufentext = (nummer: number, wirkungen: readonly string[]): string => {
    const eigener = ausformuliert?.[nummer];
    if (eigener) return eigener;
    return wirkungen
      .map((id) => {
        const gefunden = wirkung(id);
        return gefunden ? text(gefunden.text, sprache) : id;
      })
      .join('; ');
  };

  return (
    <section className="blatt" style={{ ['--marke' as string]: zustand.farbe }}>
      <header className="blatt__kopf">
        <span className="blatt__zeichen" aria-hidden="true">
          {zustand.zeichen}
        </span>
        <div>
          <h2 className="blatt__name">{zustand.name}</h2>
          <p className="blatt__art">
            {zustand.art} · {zustand.thema} · {zustand.haerte}
          </p>
        </div>
      </header>

      <p className="blatt__satz">{zustand.kurzsatz}</p>

      {zustand.stufen.length > 1 ? (
        <>
          <h3 className="blatt__ueberschrift">{t('blatt.stufen')}</h3>
          <ol className="blatt__stufen">
            {zustand.stufen.map((stufe) => (
              <li key={stufe.nummer}>
                <span className="blatt__nummer">{stufe.nummer}</span>
                <span>{stufentext(stufe.nummer, stufe.wirkungen)}</span>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="blatt__zeile">
          <strong>{t('blatt.wirkung')}</strong>{' '}
          {zustand.stufen[0] ? stufentext(1, zustand.stufen[0].wirkungen) : ''}
        </p>
      )}

      <div className="blatt__fuss">
        <p className="blatt__zeile">
          <strong>{t('blatt.dauer')}</strong> {zustand.dauer}
        </p>
        <p className="blatt__zeile">
          <strong>{t('blatt.schlimmer')}</strong> {zustand.verschlimmerung}
        </p>
        <p className="blatt__zeile">
          <strong>{t('blatt.besser')}</strong> {zustand.linderung}
        </p>
        {zustand.ausloeser !== '' && (
          <p className="blatt__zeile">
            <strong>{t('blatt.ausgeloest')}</strong> {zustand.ausloeser}
          </p>
        )}
      </div>
    </section>
  );
}
