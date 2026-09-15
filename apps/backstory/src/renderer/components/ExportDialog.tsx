import { useState } from 'react';
import type { Note } from '../../shared/types';
import { findNoteType } from '../../shared/noteTypes';
import type { NoteIndex } from '../noteIndex';
import { Modal } from './Modal';
import { useT } from '../i18n';

export type ExportFormat = 'markdown' | 'pdf';

interface Props {
  format: ExportFormat;
  index: NoteIndex;
  onExport: (noteIds: string[] | null, inhaltsverzeichnis: boolean) => void;
  onClose: () => void;
}

/**
 * Was in den Export kommt.
 *
 * Bisher ging immer die ganze Kampagne raus. Bei zwanzig Notizen ist das
 * richtig, bei zweihundert selten — und wer nur die Figuren einer Sitzung
 * drucken will, hat keinen Weg dazu.
 *
 * Sind alle ausgewaehlt, wird `null` gemeldet und nicht die vollstaendige
 * Liste: der Hauptprozess nimmt dann den Stand auf der Platte, ohne dass die
 * Oberflaeche ihm sagen muss, was dort liegt.
 */
export function ExportDialog({ format, index, onExport, onClose }: Props) {
  const t = useT();
  const [gewaehlt, setGewaehlt] = useState<Set<string>>(() => new Set(index.notes.map((note) => note.id)));
  const [mitInhalt, setMitInhalt] = useState(true);

  const alle = index.notes.length;

  function umschalten(note: Note): void {
    setGewaehlt((vorher) => {
      const naechste = new Set(vorher);
      if (naechste.has(note.id)) naechste.delete(note.id);
      else naechste.add(note.id);
      return naechste;
    });
  }

  return (
    <Modal title={t('export.title')} onClose={onClose}>
      <div className="field">
        <span className="field__label">{t('export.chooseNotes')}</span>
        <div className="modal__actions">
          <button type="button" onClick={() => setGewaehlt(new Set(index.notes.map((note) => note.id)))}>
            {t('export.all')}
          </button>
          <button type="button" onClick={() => setGewaehlt(new Set())}>
            {t('export.none')}
          </button>
        </div>

        <ul className="export-liste">
          {index.notes.map((note) => (
            <li key={note.id}>
              <label>
                <input type="checkbox" checked={gewaehlt.has(note.id)} onChange={() => umschalten(note)} />
                <span>{note.title}</span>
                <span className="export-liste__typ">{findNoteType(index.types, note.type).label}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="modal__hint">{t('export.selected', { count: gewaehlt.size, total: alle })}</p>
      </div>

      {format === 'pdf' ? (
        <label className="field field--inline">
          <input type="checkbox" checked={mitInhalt} onChange={(event) => setMitInhalt(event.target.checked)} />
          <span>{t('export.withToc')}</span>
        </label>
      ) : null}

      <div className="modal__actions">
        <button
          type="button"
          className="primary"
          disabled={gewaehlt.size === 0}
          onClick={() => onExport(gewaehlt.size === alle ? null : [...gewaehlt], mitInhalt)}
        >
          {t('export.start')}
        </button>
      </div>
    </Modal>
  );
}
