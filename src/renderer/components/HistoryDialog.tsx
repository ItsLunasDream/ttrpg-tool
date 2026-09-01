import { useEffect, useState } from 'react';
import type { Note, NoteVersion } from '../../shared/types';
import { countWords } from '../editor/markdown';
import { useLanguage } from '../i18n';
import { Modal } from './Modal';

interface Props {
  note: Note;
  versions: NoteVersion[] | null;
  historyEnabled: boolean;
  onRestore: (versionId: string) => void;
  onClose: () => void;
}

/**
 * Zeigt die gesicherten Fassungen einer Notiz und stellt eine davon wieder her.
 * Die Vorschau rechts ist bewusst reiner Text: es geht ums Wiedererkennen,
 * nicht ums Bearbeiten.
 */
export function HistoryDialog({ note, versions, historyEnabled, onRestore, onClose }: Props) {
  const { t, language } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (versions?.length && selectedId === null) setSelectedId(versions[0].id);
  }, [versions, selectedId]);

  const selected = versions?.find((version) => version.id === selectedId) ?? null;
  const formatter = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <Modal
      title={t('history.title')}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}>
            {t('dialog.cancel')}
          </button>
          <button
            type="button"
            className="primary"
            disabled={!selected}
            onClick={() => selected && onRestore(selected.id)}
          >
            {t('history.restore')}
          </button>
        </>
      }
    >
      {!historyEnabled ? <p className="panel__hint">{t('history.disabled')}</p> : null}

      {versions === null ? (
        <p className="panel__empty">{t('app.loading')}</p>
      ) : versions.length === 0 ? (
        <p className="panel__empty">{t('history.empty')}</p>
      ) : (
        <div className="history">
          <ul className="history__list">
            {versions.map((version) => (
              <li key={version.id}>
                <button
                  type="button"
                  className={version.id === selectedId ? 'is-active' : undefined}
                  onClick={() => setSelectedId(version.id)}
                >
                  <span>{formatter.format(new Date(version.savedAt))}</span>
                  <span className="history__meta">{t('history.words', { count: countWords(version.body) })}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="history__preview">
            <h4 className="type-editor__heading">
              {selected ? selected.title || note.title : t('history.current')}
            </h4>
            <pre>{selected?.body || ''}</pre>
          </div>
        </div>
      )}

      <p className="modal__hint">{t('history.hint')}</p>
    </Modal>
  );
}
