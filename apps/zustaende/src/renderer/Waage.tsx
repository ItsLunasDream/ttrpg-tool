/**
 * Die Waage: das Gewicht, sein Vergleich und die Hinweise dazu.
 *
 * Bewusst KEINE Ampel wie beim Monster Creator. Dort gibt es ein Richtig —
 * der Grad ist eine Rechnung. Hier gibt es keins: ob ein Zustand zu hart
 * ist, haengt daran, wie oft man ihn bekommt, und das weiss nur der Tisch.
 *
 * Was hier steht, ist deshalb eine Auskunft und kein Urteil: so schwer
 * wiegt er, so viel wie das da, und hier sind drei Dinge, die dir vielleicht
 * nicht aufgefallen sind. Der einschraenkende Satz steht dabei und wird
 * nicht weggelassen.
 */
import { eichname, naechsterVergleich } from '../shared/eichung';
import { betragVon, type Befund } from '../shared/gewicht';
import type { Stimmigkeitsbefund } from '../shared/stimmigkeit';
import { HAERTEN, text } from '../shared/tabellen';
import { getLanguage, t, type TextKey } from './i18n';

interface Props {
  readonly befund: Befund;
  readonly haerteId: string;
  /** Bei KI-Stufen ist das Gewicht geschaetzt. Dann steht ein Ungefaehr davor. */
  readonly geschaetzt?: boolean;
  /**
   * Ob die Teile des Zustands zueinander passen.
   *
   * Steht hier und nicht in einem eigenen Kasten: wer eine Zahl liest, soll
   * im selben Blick sehen, ob die Angaben darueber ueberhaupt zusammengehen.
   */
  readonly stimmig?: Stimmigkeitsbefund;
}

export function Waage({ befund, haerteId, geschaetzt, stimmig }: Props) {
  const sprache = getLanguage() === 'en' ? 'en' : 'de';
  const betrag = betragVon(befund.gewicht);
  const vergleich = naechsterVergleich(befund.gewicht);
  const haerte = HAERTEN.find((h) => h.id === haerteId) ?? HAERTEN[1];

  /*
   * Eine Unstimmigkeit ist schwerer als ein Gewicht, das neben dem Regler
   * liegt: die Zahl ist Geschmack, ein Widerspruch ist ein Fehler.
   */
  const unstimmig = stimmig !== undefined && !stimmig.ok;
  const stimmung =
    unstimmig || befund.urteil === 'kaputt'
      ? 'kaputt'
      : befund.urteil === 'passt'
        ? 'gut'
        : 'schief';
  const urteilText =
    befund.urteil === 'passt'
      ? t('urteil.passt')
      : befund.urteil === 'kaputt'
        ? t('urteil.kaputt')
        : befund.urteil === 'zu schwer'
          ? t('urteil.zuSchwer')
          : t('urteil.zuLeicht');

  return (
    <section className={`waage waage--${stimmung}`} aria-live="polite">
      <header className="waage__kopf">
        <div className="waage__zahl">
          {geschaetzt && <span className="waage__ungefaehr">≈</span>}
          {betrag}
        </div>
        <div>
          <p className="waage__urteil">{urteilText}</p>
          <p className="waage__vergleich">{t('gewicht.vergleich', { name: eichname(vergleich, sprache) })}</p>
        </div>
      </header>

      {/* Die Kurve: wo das Gewicht je Stufe steht. Ungleiche Stufen sieht
          man hier auf einen Blick, im Text nicht. */}
      {befund.kurve.length > 1 && (
        <ol className="waage__kurve">
          {befund.kurve.map((wert, stelle) => {
            const hoechster = Math.max(...befund.kurve.map((w) => Math.abs(w)), 1);
            return (
              <li key={stelle}>
                <span
                  className="waage__balken"
                  style={{ height: `${Math.max(4, (Math.abs(wert) / hoechster) * 40)}px` }}
                />
                <span className="waage__stufe">{stelle + 1}</span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="waage__spanne">
        {t('gewicht.spanne', {
          haerte: text(haerte.name, sprache),
          von: haerte.gewichtVon,
          bis: haerte.gewichtBis
        })}
      </p>

      {unstimmig && stimmig && (
        <div className="waage__stimmig">
          <p className="waage__stimmigTitel">{t('stimmig.titel')}</p>
          <ul>
            {stimmig.gruende.map((grund) => (
              <li key={grund}>{t(`stimmig.${grund}` as TextKey)}</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="waage__hinweise">
        {befund.flacheStufen.length > 0 && (
          <li>{t('hinweis.flach', { stufen: befund.flacheStufen.join(', ') })}</li>
        )}
        {befund.doppelte.length > 0 && <li>{t('hinweis.doppelt')}</li>}
        {befund.spruenge.length > 0 && (
          <li>{t('hinweis.sprung', { stufen: befund.spruenge.join(', ') })}</li>
        )}
      </ul>

      {geschaetzt && <p className="waage__fussnote">{t('gewicht.geschaetzt')}</p>}
      <p className="waage__fussnote">{t('gewicht.einschraenkung')}</p>
    </section>
  );
}
