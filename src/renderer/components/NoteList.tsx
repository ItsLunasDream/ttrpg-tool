import { findNoteType } from '../../shared/noteTypes';
import type { Note, NoteType, SearchHit } from '../../shared/types';
import type { NoteIndex, SearchFilters } from '../noteIndex';
import { HighlightedText } from './HighlightedText';

interface Props {
  index: NoteIndex;
  notes: Note[];
  /** Treffer der Volltextsuche, nach Notiz-ID. Leer, wenn nicht gesucht wird. */
  hits: Map<string, SearchHit>;
  activeNoteId: string | null;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSelect: (noteId: string) => void;
  onCreate: (type: NoteType) => void;
}

export function NoteList({ index, notes, hits, activeNoteId, filters, onFiltersChange, onSelect, onCreate }: Props) {
  const grouped = index.types
    .map((def) => ({ def, entries: notes.filter((note) => note.type === def.id) }))
    .filter((group) => group.entries.length > 0);

  // Notizen, deren Typ geloescht wurde, wuerden sonst unsichtbar werden.
  const orphans = notes.filter((note) => !index.types.some((def) => def.id === note.type));
  if (orphans.length) {
    grouped.push({ def: { id: '__orphan', label: 'Ohne Typ', plural: 'Ohne Typ', fields: [] }, entries: orphans });
  }

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
          {index.types.map((def) => (
            <option value={def.id} key={def.id}>
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
        {index.types.map((def) => (
          <button type="button" key={def.id} onClick={() => onCreate(def.id)} title={`Neue Notiz: ${def.label}`}>
            + {def.label}
          </button>
        ))}
      </div>

      <div className="note-list__scroll">
        {grouped.length === 0 ? (
          <p className="note-list__empty">Keine Notiz passt zum Filter.</p>
        ) : (
          grouped.map(({ def, entries }) => (
            <section key={def.id}>
              <h4 className="note-list__group">{def.plural}</h4>
              <ul>
                {entries.map((note) => {
                  const hit = hits.get(note.id);
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        className={note.id === activeNoteId ? 'is-active' : undefined}
                        onClick={() => onSelect(note.id)}
                      >
                        <span className="note-list__title">
                          {hit?.field === 'title' ? (
                            <HighlightedText text={hit.snippet} matches={hit.matches} />
                          ) : (
                            note.title
                          )}
                        </span>

                        {hit && hit.field !== 'title' ? (
                          <span className="note-list__snippet">
                            {hit.label ? <span className="note-list__snippet-label">{hit.label}: </span> : null}
                            <HighlightedText text={hit.snippet} matches={hit.matches} />
                            {hit.bodyMatches > 1 ? (
                              <span className="note-list__more"> +{hit.bodyMatches - 1}</span>
                            ) : null}
                          </span>
                        ) : note.tags.length ? (
                          <span className="note-list__tags">{note.tags.join(' · ')}</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      <p className="note-list__total">
        {index.notes.length} Notizen · {notes.length} sichtbar
        {filters.type !== 'all' ? ` · ${findNoteType(index.types, filters.type).plural}` : ''}
      </p>
    </div>
  );
}
