import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { createWikiLinkExtension, type SuggestionState } from '../editor/wikiLinkExtension';
import { createSearchHighlightExtension, selectMatch } from '../editor/searchHighlight';
import { htmlToMarkdown, markdownToHtml } from '../editor/markdown';
import { normalizeName } from '../../shared/wikilinks';
import type { NoteIndex } from '../noteIndex';
import type { Note } from '../../shared/types';
import { noteTypeDef } from '../../shared/noteTypes';
import { Toolbar } from './Toolbar';

interface Props {
  noteId: string;
  markdown: string;
  index: NoteIndex;
  /** Aktueller Suchbegriff aus der Seitenleiste, leer wenn nicht gesucht wird. */
  searchQuery: string;
  onChange: (markdown: string) => void;
  onOpenNote: (noteId: string) => void;
  onCreateNote: (title: string) => void;
  onHoverNote: (note: Note | null, rect: DOMRect | null) => void;
}

const MAX_SUGGESTIONS = 8;

export function BodyEditor({ noteId, markdown, index, searchQuery, onChange, onOpenNote, onCreateNote, onHoverNote }: Props) {
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [activeMatch, setActiveMatch] = useState(-1);

  // Handler laufen in ProseMirror-Plugins, die nur einmal erzeugt werden.
  // Ueber diese Ref sehen sie trotzdem immer den aktuellen Index.
  const indexRef = useRef(index);
  indexRef.current = index;

  const handlersRef = useRef({ onOpenNote, onHoverNote });
  handlersRef.current = { onOpenNote, onHoverNote };

  const queryRef = useRef(searchQuery);
  queryRef.current = searchQuery;
  const activeMatchRef = useRef(activeMatch);
  activeMatchRef.current = activeMatch;

  const searchHighlight = useMemo(
    () =>
      createSearchHighlightExtension({
        getQuery: () => queryRef.current,
        getActiveIndex: () => activeMatchRef.current,
        onMatchesChanged: setMatchCount
      }),
    []
  );

  const wikiLink = useMemo(
    () =>
      createWikiLinkExtension({
        resolves: (target) => indexRef.current.byName.has(normalizeName(target)),
        onOpen: (target) => {
          const note = indexRef.current.byName.get(normalizeName(target));
          if (note) handlersRef.current.onOpenNote(note.id);
        },
        onHover: (target, rect) => {
          const note = target ? indexRef.current.byName.get(normalizeName(target)) ?? null : null;
          handlersRef.current.onHoverNote(note, rect);
        },
        onSuggestion: (state) => {
          setSuggestion(state);
          setHighlight(0);
        }
      }),
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Schreib los. Mit [[ verlinkst du andere Notizen.' }),
      wikiLink,
      searchHighlight
    ],
    content: markdownToHtml(markdown),
    onUpdate: ({ editor: instance }) => onChange(htmlToMarkdown(instance.getHTML()))
  });

  // Inhalt nur beim Notizwechsel neu setzen, sonst springt der Cursor.
  const loadedNoteId = useRef(noteId);
  useEffect(() => {
    if (!editor || loadedNoteId.current === noteId) return;
    loadedNoteId.current = noteId;
    editor.commands.setContent(markdownToHtml(markdown), false);
  }, [editor, noteId, markdown]);

  // Suchbegriff oder Notiz gewechselt: Dekorationen neu berechnen lassen und
  // die Auswahl der aktiven Fundstelle zuruecksetzen.
  useEffect(() => {
    setActiveMatch(-1);
    if (editor) editor.view.dispatch(editor.state.tr);
  }, [editor, searchQuery, noteId]);

  const goToMatch = useCallback(
    (direction: 1 | -1) => {
      if (!editor || matchCount === 0) return;
      const next = activeMatch === -1
        ? (direction === 1 ? 0 : matchCount - 1)
        : (activeMatch + direction + matchCount) % matchCount;
      setActiveMatch(next);
      selectMatch(editor.view, next, searchQuery);
    },
    [editor, matchCount, activeMatch, searchQuery]
  );

  // F3 und Umschalt+F3 springen zwischen den Fundstellen, wie in einem
  // Code-Editor. Ohne Suchbegriff passiert nichts.
  useEffect(() => {
    if (!searchQuery.trim() || matchCount === 0) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'F3') return;
      event.preventDefault();
      goToMatch(event.shiftKey ? -1 : 1);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchQuery, matchCount, goToMatch]);

  const candidates = useMemo(() => {
    if (!suggestion) return [];
    const needle = normalizeName(suggestion.query);
    const matches = index.notes.filter((note) => {
      if (note.id === noteId) return false;
      if (!needle) return true;
      return [note.title, ...note.aliases].some((name) => normalizeName(name).includes(needle));
    });
    return matches.slice(0, MAX_SUGGESTIONS);
  }, [suggestion, index, noteId]);

  const canCreate = Boolean(suggestion?.query.trim()) && !index.byName.has(normalizeName(suggestion?.query ?? ''));
  const optionCount = candidates.length + (canCreate ? 1 : 0);

  const insertLink = useCallback(
    (title: string) => {
      if (!editor || !suggestion) return;
      editor
        .chain()
        .focus()
        .insertContentAt({ from: suggestion.from, to: suggestion.to }, `[[${title}]]`)
        .run();
      setSuggestion(null);
    },
    [editor, suggestion]
  );

  useEffect(() => {
    if (!suggestion || optionCount === 0) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlight((current) => (current + 1) % optionCount);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlight((current) => (current - 1 + optionCount) % optionCount);
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const picked = candidates[highlight];
        if (picked) {
          insertLink(picked.title);
        } else if (canCreate && suggestion) {
          const title = suggestion.query.trim();
          insertLink(title);
          onCreateNote(title);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setSuggestion(null);
      }
    }

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [suggestion, optionCount, candidates, highlight, canCreate, insertLink, onCreateNote]);

  return (
    <div className="body-editor">
      {searchQuery.trim() ? (
        <div className="search-bar">
          <span className="search-bar__term">„{searchQuery.trim()}"</span>
          <span className="search-bar__count">
            {matchCount === 0
              ? 'keine Fundstelle'
              : `${activeMatch === -1 ? '–' : activeMatch + 1} von ${matchCount}`}
          </span>
          <button type="button" title="Vorherige Fundstelle (Umschalt+F3)" disabled={matchCount === 0} onClick={() => goToMatch(-1)}>
            ‹
          </button>
          <button type="button" title="Nächste Fundstelle (F3)" disabled={matchCount === 0} onClick={() => goToMatch(1)}>
            ›
          </button>
        </div>
      ) : null}

      <Toolbar editor={editor} />
      <EditorContent className="body-editor__surface" editor={editor} />

      {suggestion && optionCount > 0 ? (
        <ul className="suggestions" style={{ left: suggestion.left, top: suggestion.top + 4 }}>
          {candidates.map((note, position) => (
            <li key={note.id}>
              <button
                type="button"
                className={position === highlight ? 'is-active' : undefined}
                onMouseDown={(event) => {
                  event.preventDefault();
                  insertLink(note.title);
                }}
              >
                <span>{note.title}</span>
                <span className="suggestions__type">{noteTypeDef(note.type).label}</span>
              </button>
            </li>
          ))}
          {canCreate ? (
            <li>
              <button
                type="button"
                className={candidates.length === highlight ? 'is-active' : undefined}
                onMouseDown={(event) => {
                  event.preventDefault();
                  const title = suggestion.query.trim();
                  insertLink(title);
                  onCreateNote(title);
                }}
              >
                <span>„{suggestion.query.trim()}“ neu anlegen</span>
                <span className="suggestions__type">neu</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
