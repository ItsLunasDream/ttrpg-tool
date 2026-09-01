import { findNoteType } from '../../shared/noteTypes';
import type { NoteTypeDef } from '../../shared/types';
import type { Backlink } from '../noteIndex';

interface Props {
  backlinks: Backlink[];
  types: NoteTypeDef[];
  unresolved: string[];
  onOpenNote: (noteId: string) => void;
  onCreateNote: (title: string) => void;
}

export function BacklinksPanel({ backlinks, types, unresolved, onOpenNote, onCreateNote }: Props) {
  return (
    <>
      <section className="panel">
        <h3 className="panel__title">
          Erwähnt von <span className="panel__count">{backlinks.length}</span>
        </h3>
        {backlinks.length === 0 ? (
          <p className="panel__empty">Noch keine andere Notiz verlinkt hierher.</p>
        ) : (
          <ul className="backlinks">
            {backlinks.map(({ note, context }) => (
              <li key={note.id}>
                <button type="button" className="link-button" onClick={() => onOpenNote(note.id)}>
                  {note.title}
                </button>
                <span className="badge">{findNoteType(types, note.type).label}</span>
                <p className="backlinks__context">{context}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {unresolved.length ? (
        <section className="panel">
          <h3 className="panel__title">
            Offene Links <span className="panel__count">{unresolved.length}</span>
          </h3>
          <p className="panel__hint">Diese Links zeigen noch auf keine Notiz.</p>
          <ul className="unresolved">
            {unresolved.map((title) => (
              <li key={title}>
                <span>{title}</span>
                <button type="button" className="link-button" onClick={() => onCreateNote(title)}>
                  anlegen
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
