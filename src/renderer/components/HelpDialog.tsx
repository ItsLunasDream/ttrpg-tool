import type { MessageKey } from '../../shared/i18n';
import { useT } from '../i18n';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
}

const ROWS: { keys: string; key: MessageKey }[] = [
  { keys: 'Strg + S', key: 'help.save' },
  { keys: 'Strg + F', key: 'help.find' },
  { keys: 'F3 / ⇧ F3', key: 'help.nextMatch' },
  { keys: '[[', key: 'help.link' },
  { keys: 'Strg + Klick', key: 'help.openLink' },
  { keys: 'Strg + B / I', key: 'help.format' },
  { keys: '⇥', key: 'help.suggestion' }
];

/** Kurze Übersicht der Tastenkürzel und der wichtigsten Handgriffe. */
export function HelpDialog({ onClose }: Props) {
  const t = useT();

  return (
    <Modal title={t('help.title')} onClose={onClose}>
      <table className="help">
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.keys}>
              <th>{row.keys}</th>
              <td>{t(row.key)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="type-editor__heading">{t('help.mouseTitle')}</h4>
      <ul className="help__list">
        <li>{t('help.dropImage')}</li>
        <li>{t('help.imageWidth')}</li>
        <li>{t('help.hoverLink')}</li>
        <li>{t('help.graph')}</li>
      </ul>

      <p className="modal__hint">{t('help.storage')}</p>
    </Modal>
  );
}
