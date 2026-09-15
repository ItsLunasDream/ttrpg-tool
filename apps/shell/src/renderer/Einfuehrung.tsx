/**
 * Das Fenster, das ein Werkzeug beim ersten Mal erklaert.
 *
 * Es liegt in der Huelle und nicht in den Werkzeugen: so sieht es ueberall
 * gleich aus, und kein Werkzeug kann es vergessen. Die Huelle versteckt
 * dafuer kurz die Ansicht der Anwendung — genau wie bei den Einstellungen,
 * denn die Anwendungen liegen ueber ihrer Oberflaeche.
 *
 * Der Rahmen ist derselbe wie bei den anderen Dialogen der Huelle. Sein
 * Schliessen-Knopf traegt hier nur eine andere Aufschrift: gelesen und
 * losgelegt ist dasselbe wie geschlossen.
 *
 * Gezeigt wird es genau einmal. Wer es wiederhaben will, findet in den
 * Einstellungen einen Knopf; ein Kaestchen „nicht mehr zeigen" waere
 * ueberfluessig, weil es ohnehin nicht wiederkommt.
 */
import type { Einfuehrung as Inhalt, Paar } from '../shared/einfuehrung';
import { WILLKOMMEN } from '../shared/einfuehrung';
import type { Language, MessageKey, MessageParams } from '../shared/i18n';
import { Dialog } from './Dialog';
import { AppSymbol, SuiteIcon } from './icons';

interface Props {
  readonly inhalt: Inhalt;
  readonly sprache: Language;
  /** Das eigene Bild des Werkzeugs, wenn eines hinterlegt ist. */
  readonly bild?: string;
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Einfuehrung({ inhalt, sprache, bild, onClose, t }: Props) {
  const text = (paar: Paar) => (sprache === 'de' ? paar.de : paar.en);

  return (
    <Dialog titel={text(inhalt.titel)} schliessenText={t('intro.start')} onClose={onClose}>
      <div className="einfuehrung__kopf">
        <span className="einfuehrung__symbol" aria-hidden="true">
          {inhalt.id === WILLKOMMEN ? (
            <SuiteIcon size={44} />
          ) : (
            <AppSymbol id={inhalt.id} size={44} bild={bild} />
          )}
        </span>
        <p className="einfuehrung__satz">{text(inhalt.satz)}</p>
      </div>

      <ul className="einfuehrung__punkte">
        {inhalt.punkte.map((punkt) => (
          <li key={punkt.en}>{text(punkt)}</li>
        ))}
      </ul>

      <p className="einfuehrung__hinweis">{t('intro.wieder')}</p>
    </Dialog>
  );
}
