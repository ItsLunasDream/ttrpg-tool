import { useMemo } from 'react';
import { noteTypeDef } from '../../shared/noteTypes';
import type { Note, Relation } from '../../shared/types';
import { backlinksFor, unresolvedLinks, type NoteIndex } from '../noteIndex';
import { countWords } from '../editor/markdown';
import { BodyEditor } from './BodyEditor';
import { RelationsPanel } from './RelationsPanel';
import { BacklinksPanel } from './BacklinksPanel';
import { TokenInput } from './TokenInput';

interface Props {
  note: Note;
  index: NoteIndex;
  dirty: boolean;
  saving: boolean;
  autosaveEnabled: boolean;
  onPatch: (patch: Partial<Note>) => void;
  onSave: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onOpenNote: (noteId: string) => void;
  onCreateNote: (title: string) => void;
  onHoverNote: (note: Note | null, rect: DOMRect | null) => void;
  onOpenExternal: (url: string) => void;
  /** Suchbegriff aus der Seitenleiste, fuer die Hervorhebung im Text. */
  searchQuery: string;
}

export function NoteEditor(props: Props) {
  const { note, index, dirty, saving, autosaveEnabled, onPatch, onSave, onRename, onDelete } = props;
  const def = noteTypeDef(note.type);

  const backlinks = useMemo(() => backlinksFor(index, note.id), [index, note.id]);
  const unresolved = useMemo(() => unresolvedLinks(index, note), [index, note]);
  const words = useMemo(() => countWords(note.body), [note.body]);

  const status = saving ? 'Speichert …' : dirty ? 'Nicht gespeichert' : 'Gespeichert';

  return (
    <div className="note-editor">
      <header className="note-editor__head">
        <input
          className="note-editor__title"
          value={note.title}
          onChange={(event) => onPatch({ title: event.target.value })}
          onBlur={(event) => onRename(event.target.value)}
          aria-label="Titel"
        />
        <span className="badge">{def.label}</span>
        <span className={`status status--${dirty ? 'dirty' : 'clean'}`}>{status}</span>
        <span className="note-editor__words">{words} Wörter</span>
        <button type="button" onClick={onSave} disabled={!dirty || saving}>
          Speichern
        </button>
        <button type="button" className="danger" onClick={onDelete}>
          Löschen
        </button>
      </header>

      {!autosaveEnabled && dirty ? (
        <p className="note-editor__warning">Autosave ist aus. Strg+S speichert.</p>
      ) : null}

      <div className="note-editor__columns">
        <div className="note-editor__main">
          <BodyEditor
            noteId={note.id}
            markdown={note.body}
            index={index}
            searchQuery={props.searchQuery}
            onChange={(body) => onPatch({ body })}
            onOpenNote={props.onOpenNote}
            onCreateNote={props.onCreateNote}
            onHoverNote={props.onHoverNote}
          />
        </div>

        <aside className="note-editor__side">
          <section className="panel">
            <h3 className="panel__title">Steckbrief</h3>
            {def.fields.map((field) => {
              const value = note.fields[field.key] ?? '';
              const setValue = (next: string) => onPatch({ fields: { ...note.fields, [field.key]: next } });

              return (
                <label className="field" key={field.key}>
                  <span className="field__label">{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea rows={3} value={value} placeholder={field.placeholder} onChange={(e) => setValue(e.target.value)} />
                  ) : (
                    <span className="field__row">
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => setValue(e.target.value)}
                      />
                      {field.type === 'url' && value.trim() ? (
                        <button type="button" className="link-button" onClick={() => props.onOpenExternal(value.trim())}>
                          öffnen
                        </button>
                      ) : null}
                    </span>
                  )}
                </label>
              );
            })}

            <TokenInput
              label="Aliase"
              values={note.aliases}
              placeholder="Spitzname, Titel …"
              onChange={(aliases) => onPatch({ aliases })}
            />
            <TokenInput label="Tags" values={note.tags} placeholder="Kampagnenrolle, Thema …" onChange={(tags) => onPatch({ tags })} />
          </section>

          <RelationsPanel
            note={note}
            index={index}
            onChange={(relations: Relation[]) => onPatch({ relations })}
            onOpenNote={props.onOpenNote}
          />

          <BacklinksPanel
            backlinks={backlinks}
            unresolved={unresolved}
            onOpenNote={props.onOpenNote}
            onCreateNote={props.onCreateNote}
          />
        </aside>
      </div>
    </div>
  );
}
