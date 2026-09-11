/**
 * Name, Fassung und Lizenz der Sammlung. Kein Rechtsdokument, nur der Verweis
 * darauf — der vollstaendige Text steht im Repository und ist von hier aus
 * einen Klick entfernt.
 *
 * Dass es diese Angaben ueberhaupt geben muss, kommt von der AGPL: wer die
 * Software weitergibt, muss sagen, unter welcher Lizenz das geschieht und wo
 * der Quelltext zu finden ist.
 */
import type { MessageKey, MessageParams } from '../shared/i18n';
import { Dialog } from './Dialog';
import { SuiteIcon } from './icons';

const REPO_URL = 'https://github.com/ItsLunasDream/ttrpg-tool';
const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;

interface Props {
  readonly version: string;
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Ueber({ version, onClose, t }: Props) {
  return (
    <Dialog titel={t('about.title')} schliessenText={t('dialog.close')} onClose={onClose}>
      <div className="ueber">
        <span className="ueber__marke" aria-hidden="true">
          <SuiteIcon size={48} />
        </span>
        <p className="ueber__name">TTRPG-Tools</p>
        <p className="ueber__autor">{t('about.author')}</p>
        {/* Die Fassung ist eine Zugabe: kommt sie nicht an, faellt die Zeile
            weg, statt den Dialog aufzuhalten. */}
        {version && <p className="ueber__fassung">{t('about.version', { version })}</p>}
        <p>{t('about.description')}</p>

        <p className="ueber__lizenz">{t('about.license')}</p>
        <p>{t('about.licenseDetail')}</p>
        <p className="ueber__gewaehr">{t('about.warranty')}</p>

        <div className="ueber__verweise">
          {/* Kein <a href>: die Ansicht wuerde selbst dorthin navigieren und
              danach laege auf der fremden Seite dieselbe Bruecke wie auf der
              eigenen. Der Hauptprozess gibt die Adresse an den Browser des
              Systems weiter. */}
          <button type="button" onClick={() => void window.shell.app.oeffneExtern(REPO_URL)}>
            {t('about.sourceLink')}
          </button>
          <button type="button" onClick={() => void window.shell.app.oeffneExtern(LICENSE_URL)}>
            {t('about.licenseLink')}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
