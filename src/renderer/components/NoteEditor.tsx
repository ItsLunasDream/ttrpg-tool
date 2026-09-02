import { useMemo } from 'react';
import { CHECKED, findNoteType } from '../../shared/noteTypes';
import type { Note, Relation } from '../../shared/types';
import { backlinksFor, unresolvedLinks, type NoteIndex } from '../noteIndex';
import { hasLinkReservedChars, normalizeName } from '../../shared/wikilinks';
import { countWords } from '../editor/markdown';
import { BodyEditor } from './BodyEditor';
import { RelationsPanel } from './RelationsPanel';
import { BacklinksPanel } from './BacklinksPanel';
import { TokenInput } from './TokenInput';
import { ImageField } from './ImageField';
import { AssistantPanel, type AiStatus } from './AssistantPanel';
import type { AiMessage, AiTask } from '../../main/ai/provider';
import { useT } from '../i18n';

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
  onOpenHistory: () => void;
  onOpenPrompts: () => void;
  onReport: (text: string) => void;
  onAddReverseRelation: (targetId: string) => void;
  aiStatus: AiStatus | null;
  onAsk: (
    task: AiTask,
    history: AiMessage[],
    followUp: string,
    onChunk: (text: string) => void
  ) => Promise<string | null>;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
  onOpenNote: (noteId: string) => void;
  onCreateNote: (title: string) => void;
  onHoverNote: (note: Note | null, rect: DOMRect | null) => void;
  onOpenExternal: (url: string) => void;
  /** Suchbegriff aus der Seitenleiste, fuer die Hervorhebung im Text. */
  searchQuery: string;
  campaignId: string;
  /** Hochgezaehlt, wenn der Text von aussen ersetzt wurde. */
  reloadKey: number;
  onImportImage: (file: File) => Promise<string | null>;
  onPickImage: () => Promise<string | null>;
}

export function NoteEditor(props: Props) {
  const t = useT();
  const { note, index, dirty, saving, autosaveEnabled, onPatch, onSave, onRename, onDelete } = props;
  const def = findNoteType(index.types, note.type);

  const backlinks = useMemo(() => backlinksFor(index, note.id), [index, note.id]);
  const unresolved = useMemo(() => unresolvedLinks(index, note), [index, note]);
  const words = useMemo(() => countWords(note.body), [note.body]);

  // Teilt sich diese Notiz einen Namen mit einer anderen, treffen Links darauf
  // stillschweigend immer dieselbe. Darauf muss hingewiesen werden.
  const ambiguousName = useMemo(
    () => [note.title, ...note.aliases].find((name) => index.ambiguous.has(normalizeName(name))),
    [note.title, note.aliases, index.ambiguous]
  );

  // Der Vault lehnt solche Namen ab. Ohne Hinweis bliebe nur eine
  // Fehlermeldung beim Speichern, ohne dass klar waere, woran es liegt.
  const reservedName = useMemo(
    () => [note.title, ...note.aliases].find((name) => hasLinkReservedChars(name)),
    [note.title, note.aliases]
  );

  const status = t(saving ? 'editor.saving' : dirty ? 'editor.unsaved' : 'editor.saved');

  return (
    <div className="note-editor">
      <header className="note-editor__head">
        <input
          className="note-editor__title"
          value={note.title}
          onChange={(event) => onPatch({ title: event.target.value })}
          onBlur={(event) => onRename(event.target.value)}
          aria-label={t('editor.title')}
        />
        <span className="badge">{def.label}</span>
        <span className={`status status--${dirty ? 'dirty' : 'clean'}`}>{status}</span>
        <span className="note-editor__words">{t('editor.words', { count: words })}</span>
        <button type="button" onClick={onSave} disabled={!dirty || saving}>
          {t('editor.save')}
        </button>
        <button type="button" onClick={props.onOpenPrompts}>
          {t('prompts.open')}
        </button>
        <button type="button" onClick={props.onOpenHistory}>
          {t('history.open')}
        </button>
        <button type="button" onClick={props.onExportMarkdown} title={t('export.markdownNote')}>
          MD
        </button>
        <button type="button" onClick={props.onExportPdf} title={t('export.pdfNote')}>
          PDF
        </button>
        <button type="button" className="danger" onClick={onDelete}>
          {t('editor.delete')}
        </button>
      </header>

      {!autosaveEnabled && dirty ? (
        <p className="note-editor__warning">{t('editor.autosaveOffHint')}</p>
      ) : null}

      {reservedName ? (
        <p className="note-editor__warning note-editor__warning--danger">
          {t('error.linkChars', { name: reservedName })}
        </p>
      ) : null}

      {ambiguousName ? (
        <p className="note-editor__warning note-editor__warning--danger">
          {t('editor.ambiguous', { name: ambiguousName })}
        </p>
      ) : null}

      <div className="note-editor__columns">
        <div className="note-editor__main">
          <BodyEditor
            noteId={note.id}
            markdown={note.body}
            index={index}
            searchQuery={props.searchQuery}
            campaignId={props.campaignId}
            reloadKey={props.reloadKey}
            onImportImage={props.onImportImage}
            onPickImage={props.onPickImage}
            onReport={props.onReport}
            onOpenExternal={props.onOpenExternal}
            onChange={(body) => onPatch({ body })}
            onOpenNote={props.onOpenNote}
            onCreateNote={props.onCreateNote}
            onHoverNote={props.onHoverNote}
          />
        </div>

        <aside className="note-editor__side">
          <section className="panel">
            <h3 className="panel__title">{t('editor.profile')}</h3>
            {def.fields.map((field) => {
              const value = note.fields[field.key] ?? '';
              const setValue = (next: string) => onPatch({ fields: { ...note.fields, [field.key]: next } });

              return (
                <label className="field" key={field.key}>
                  <span className="field__label">{field.label}</span>
                  {field.type === 'image' ? (
                    <ImageField
                      campaignId={props.campaignId}
                      value={value}
                      onChange={setValue}
                      onPickImage={props.onPickImage}
                      onImportImage={props.onImportImage}
                    />
                  ) : field.type === 'select' ? (
                    <select value={value} onChange={(e) => setValue(e.target.value)}>
                      <option value="">{t('field.notSet')}</option>
                      {(field.options ?? []).map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                      {/*
                        Ein eingetragener Wert, der nicht mehr zur Auswahl steht,
                        weil jemand die Liste geaendert hat. Ohne diesen Eintrag
                        stuende das Feld leer da, obwohl der Wert in der Datei
                        weiter vorhanden ist.
                      */}
                      {value && !(field.options ?? []).includes(value) ? (
                        <option value={value}>{t('field.notInList', { value })}</option>
                      ) : null}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      className="field__checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => setValue(e.target.checked ? CHECKED : '')}
                    />
                  ) : field.type === 'date' ? (
                    <input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
                  ) : field.type === 'textarea' ? (
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
                          {t('editor.open')}
                        </button>
                      ) : null}
                    </span>
                  )}
                </label>
              );
            })}

            <TokenInput
              label={t('editor.aliases')}
              values={note.aliases}
              placeholder={t('editor.aliasesHint')}
              onChange={(aliases) => onPatch({ aliases })}
            />
            <TokenInput
              label={t('editor.tags')}
              values={note.tags}
              placeholder={t('editor.tagsHint')}
              onChange={(tags) => onPatch({ tags })}
            />
          </section>

          <RelationsPanel
            note={note}
            index={index}
            onChange={(relations: Relation[]) => onPatch({ relations })}
            onOpenNote={props.onOpenNote}
            onAddReverse={props.onAddReverseRelation}
          />

          {/*
            Der Schluessel setzt das Gespraech beim Notizwechsel zurueck.
            Als Kontext geht immer die offene Notiz mit; ein Verlauf ueber
            eine andere Notiz haette das Modell in die Irre gefuehrt, und
            auf dem Schirm stuenden Antworten zu einer Notiz, die gar
            nicht mehr offen ist.
          */}
          <AssistantPanel key={note.id} status={props.aiStatus} onAsk={props.onAsk} />

          <BacklinksPanel
            backlinks={backlinks}
            types={index.types}
            unresolved={unresolved}
            onOpenNote={props.onOpenNote}
            onCreateNote={props.onCreateNote}
          />
        </aside>
      </div>
    </div>
  );
}
