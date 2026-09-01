import { noteTypeDef } from '../../shared/noteTypes';
import type { Note } from '../../shared/types';

interface Props {
  note: Note;
  rect: DOMRect;
  onOpen: (noteId: string) => void;
}

const CARD_WIDTH = 300;

/** Kurzinfo beim Ueberfahren eines Wiki-Links. Kein Seitenwechsel. */
export function InfoCard({ note, rect, onOpen }: Props) {
  const def = noteTypeDef(note.type);
  const filled = def.fields.filter((field) => note.fields[field.key]?.trim());

  const left = Math.max(8, Math.min(rect.left, window.innerWidth - CARD_WIDTH - 8));
  const placeAbove = rect.bottom + 220 > window.innerHeight;
  const style = placeAbove
    ? { left, bottom: window.innerHeight - rect.top + 8, width: CARD_WIDTH }
    : { left, top: rect.bottom + 8, width: CARD_WIDTH };

  return (
    <div className="info-card" style={style}>
      <div className="info-card__head">
        <strong>{note.title}</strong>
        <span className="badge">{def.label}</span>
      </div>

      {note.aliases.length ? <p className="info-card__aliases">alias {note.aliases.join(', ')}</p> : null}

      {filled.length ? (
        <dl className="info-card__fields">
          {filled.map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd>{note.fields[field.key]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="info-card__empty">Noch keine Felder gefüllt.</p>
      )}

      {note.tags.length ? (
        <div className="info-card__tags">
          {note.tags.map((tag) => (
            <span className="token token--static" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <button type="button" className="link-button" onClick={() => onOpen(note.id)}>
        Notiz öffnen
      </button>
    </div>
  );
}
