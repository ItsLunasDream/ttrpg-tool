import { findNoteType } from '../../shared/noteTypes';
import { textPreview } from '../editor/markdown';
import { assetUrl } from '../editor/assets';
import type { Note, NoteTypeDef } from '../../shared/types';
import { useT } from '../i18n';

interface Props {
  note: Note;
  types: NoteTypeDef[];
  campaignId: string;
  rect: DOMRect;
  onOpen: (noteId: string) => void;
}

const CARD_WIDTH = 300;

/** Kurzinfo beim Ueberfahren eines Wiki-Links. Kein Seitenwechsel. */
export function InfoCard({ note, types, campaignId, rect, onOpen }: Props) {
  const t = useT();
  const def = findNoteType(types, note.type);
  const portraitField = def.fields.find((field) => field.type === 'image' && note.fields[field.key]?.trim());
  const filled = def.fields.filter((field) => field.type !== 'image' && note.fields[field.key]?.trim());
  const preview = textPreview(note.body);

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

      {portraitField ? (
        <img
          className="info-card__portrait"
          src={assetUrl(campaignId, note.fields[portraitField.key])}
          alt={portraitField.label}
        />
      ) : null}

      {note.aliases.length ? (
        <p className="info-card__aliases">{t('card.alias', { names: note.aliases.join(', ') })}</p>
      ) : null}

      {filled.length ? (
        <dl className="info-card__fields">
          {filled.map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd>{note.fields[field.key]}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {preview ? (
        <p className="info-card__preview">{preview}</p>
      ) : (
        <p className="info-card__empty">{t('card.noText')}</p>
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
        {t('card.openNote')}
      </button>
    </div>
  );
}
