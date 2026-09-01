import { NOTE_TYPES, noteTypeDef } from '../../shared/noteTypes';
import type { Note, NoteType } from '../../shared/types';
import type { NoteIndex, SearchFilters } from '../noteIndex';

interface Props {
  index: NoteIndex;
  notes: Note[];
  activeNoteId: string | null;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSelect: (noteId: string) => void;
  onCreate: (type: NoteType) => void;
}

export function NoteList({ index, notes, activeNoteId, filters, onFiltersChange, onSelect, onCreate }: Props) {
  const grouped = NOTE_TYPES.map((def) => ({
    def,
    entries: notes.filter((note) => note.type === def.type)
  })).filter((group) => group.entries.length > 0);

  return (
    <div className="note-list">
      <div className="note-list__search">
        <input
          type="search"
          value={filters.query}
          placeholder="Volltextsuche …"
          onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
        />
      </div>

      <div className="note-list__filters">
        <select
          value={filters.type}
          onChange={(event) => onFiltersChange({ ...filters, type: event.target.value as NoteType | 'all' })}
        >
          <option value="all">Alle Typen</option>
          {NOTE_TYPES.map((def) => (
            <option value={def.type} key={def.type}>
              {def.plural}
            </option>
          ))}
        </select>
        <select
          value={filters.tag ?? ''}
          onChange={(event) => onFiltersChange({ ...filters, tag: event.target.value || null })}
        >
          <option value="">Alle Tags</option>
          {index.tags.map((tag) => (
            <option value={tag} key={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="note-list__new">
        {NOTE_TYPES.map((def) => (
          <button type="button" key={def.type} onClick={() => onCreate(def.type)} title={`Neue Notiz: ${def.label}`}>
            + {def.label}
          </button>
        ))}
      </div>

      <div className="note-list__scroll">
        {grouped.length === 0 ? (
          <p className="note-list__empty">Keine Notiz passt zum Filter.</p>
        ) : (
          grouped.map(({ def, entries }) => (
            <section key={def.type}>
              <h4 className="note-list__group">{def.plural}</h4>
              <ul>
                {entries.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      className={note.id === activeNoteId ? 'is-active' : undefined}
                      onClick={() => onSelect(note.id)}
                    >
                      <span className="note-list__title">{note.title}</span>
                      {note.tags.length ? <span className="note-list__tags">{note.tags.join(' · ')}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <p className="note-list__total">
        {index.notes.length} Notizen · {notes.length} sichtbar
        {filters.type !== 'all' ? ` · ${noteTypeDef(filters.type).plural}` : ''}
      </p>
    </div>
  );
}
