import { useState } from 'react';
import { RELATION_SUGGESTIONS, findNoteType } from '../../shared/noteTypes';
import type { Note, Relation } from '../../shared/types';
import type { NoteIndex } from '../noteIndex';

interface Props {
  note: Note;
  index: NoteIndex;
  onChange: (relations: Relation[]) => void;
  onOpenNote: (noteId: string) => void;
}

/**
 * Beziehungen sind gerichtet und haengen am Notizpaar, nicht an der einzelnen
 * Textstelle. Der Fliesstext bleibt dadurch frei von Beziehungssyntax, und
 * dieselbe Beziehung wird nur einmal gepflegt.
 */
export function RelationsPanel({ note, index, onChange, onOpenNote }: Props) {
  const [targetId, setTargetId] = useState('');

  const available = index.notes.filter(
    (candidate) => candidate.id !== note.id && !note.relations.some((relation) => relation.targetId === candidate.id)
  );

  function add() {
    if (!targetId) return;
    onChange([...note.relations, { id: crypto.randomUUID(), targetId, type: '', note: '' }]);
    setTargetId('');
  }

  function update(id: string, patch: Partial<Relation>) {
    onChange(note.relations.map((relation) => (relation.id === id ? { ...relation, ...patch } : relation)));
  }

  return (
    <section className="panel">
      <h3 className="panel__title">
        Beziehungen <span className="panel__count">{note.relations.length}</span>
      </h3>
      <p className="panel__hint">
        Nur die Sicht von <strong>{note.title}</strong> auf die andere Notiz. Die Gegenrichtung wird dort separat gepflegt.
      </p>

      <ul className="relations">
        {note.relations.map((relation) => {
          const target = index.byId.get(relation.targetId);
          return (
            <li className="relation" key={relation.id}>
              <div className="relation__head">
                {target ? (
                  <button type="button" className="link-button" onClick={() => onOpenNote(target.id)}>
                    {target.title}
                  </button>
                ) : (
                  <span className="relation__missing">Notiz gelöscht</span>
                )}
                {target ? <span className="badge">{findNoteType(index.types, target.type).label}</span> : null}
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Beziehung entfernen"
                  onClick={() => onChange(note.relations.filter((entry) => entry.id !== relation.id))}
                >
                  ×
                </button>
              </div>
              <input
                list="relation-types"
                className="relation__type"
                placeholder="Beziehungstyp, z.B. Mentorin"
                value={relation.type}
                onChange={(event) => update(relation.id, { type: event.target.value })}
              />
              <textarea
                className="relation__note"
                rows={2}
                placeholder="Wie steht sie dazu?"
                value={relation.note}
                onChange={(event) => update(relation.id, { note: event.target.value })}
              />
            </li>
          );
        })}
      </ul>

      <datalist id="relation-types">
        {RELATION_SUGGESTIONS.map((suggestion) => (
          <option value={suggestion} key={suggestion} />
        ))}
      </datalist>

      <div className="relations__add">
        <select value={targetId} onChange={(event) => setTargetId(event.target.value)}>
          <option value="">Notiz wählen …</option>
          {available.map((candidate) => (
            <option value={candidate.id} key={candidate.id}>
              {candidate.title} ({findNoteType(index.types, candidate.type).label})
            </option>
          ))}
        </select>
        <button type="button" onClick={add} disabled={!targetId}>
          Hinzufügen
        </button>
      </div>
    </section>
  );
}
