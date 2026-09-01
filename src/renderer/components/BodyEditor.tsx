import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { createWikiLinkExtension, type SuggestionState } from '../editor/wikiLinkExtension';
import { createSearchHighlightExtension, selectMatch } from '../editor/searchHighlight';
import { htmlToMarkdown, markdownToHtml } from '../editor/markdown';
import { assetPath, assetUrl, isImageFile } from '../editor/assets';
import { normalizeName } from '../../shared/wikilinks';
import type { NoteIndex } from '../noteIndex';
import type { Note } from '../../shared/types';
import { findNoteType } from '../../shared/noteTypes';
import { Toolbar } from './Toolbar';
import { useT } from '../i18n';

interface Props {
  noteId: string;
  markdown: string;
  index: NoteIndex;
  /** Aktueller Suchbegriff aus der Seitenleiste, leer wenn nicht gesucht wird. */
  searchQuery: string;
  campaignId: string;
  /**
   * Wird hochgezaehlt, wenn der Text von aussen ersetzt wurde, etwa beim
   * Wiederherstellen einer alten Fassung. Der Editor laedt dann neu, obwohl
   * dieselbe Notiz offen bleibt.
   */
  reloadKey: number;
  /** Legt ein Bild in der Kampagne ab und liefert den relativen Verweis. */
  onImportImage: (file: File) => Promise<string | null>;
  /** Oeffnet den Dateidialog und liefert den relativen Verweis. */
  onPickImage: () => Promise<string | null>;
  onChange: (markdown: string) => void;
  onOpenNote: (noteId: string) => void;
  onCreateNote: (title: string) => void;
  onHoverNote: (note: Note | null, rect: DOMRect | null) => void;
}

const MAX_SUGGESTIONS = 8;

export function BodyEditor({
  noteId,
  markdown,
  index,
  searchQuery,
  campaignId,
  reloadKey,
  onChange,
  onOpenNote,
  onCreateNote,
  onHoverNote,
  onImportImage,
  onPickImage
}: Props) {
  const t = useT();
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

  // Die ProseMirror-Handler entstehen einmal und brauchen deshalb Referenzen
  // auf die jeweils aktuellen Werte.
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const importRef = useRef({ campaignId, onImportImage });
  importRef.current = { campaignId, onImportImage };

  /**
   * Nimmt Bilder aus Zwischenablage oder Ziehen und Ablegen entgegen. Der
   * Import laeuft asynchron, deshalb wird das Ereignis sofort geschluckt und
   * das Bild nachtraeglich eingefuegt.
   */
  function importFromDataTransfer(transfer: DataTransfer | null): boolean {
    const files = [...(transfer?.files ?? [])].filter(isImageFile);
    if (files.length === 0) return false;

    void (async () => {
      for (const file of files) {
        const relativePath = await importRef.current.onImportImage(file);
        if (!relativePath) continue;
        editorRef.current
          ?.chain()
          .focus()
          .setImage({ src: assetUrl(importRef.current.campaignId, relativePath) })
          .run();
      }
    })();

    return true;
  }

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
      Placeholder.configure({ placeholder: t('editor.placeholder') }),
      wikiLink,
      searchHighlight,
      Image.configure({ inline: false, allowBase64: false })
    ],
    content: markdownToHtml(markdown, (target) => assetUrl(campaignId, target)),
    onUpdate: ({ editor: instance }) => onChange(htmlToMarkdown(instance.getHTML(), assetPath)),

    editorProps: {
      // Bilder aus der Zwischenablage oder per Ziehen und Ablegen werden in
      // die Kampagne kopiert, nicht als Base64 in den Text geschrieben.
      handlePaste: (_view, event) => importFromDataTransfer(event.clipboardData),
      handleDrop: (_view, event) => importFromDataTransfer((event as DragEvent).dataTransfer)
    }
  });

  editorRef.current = editor;

  // Inhalt nur bei Notizwechsel oder ersetztem Text neu setzen, sonst
  // springt bei jedem Tastendruck der Cursor an den Anfang.
  const loaded = useRef(`${noteId}:${reloadKey}`);
  useEffect(() => {
    const marker = `${noteId}:${reloadKey}`;
    if (!editor || loaded.current === marker) return;
    loaded.current = marker;
    editor.commands.setContent(markdownToHtml(markdown, (target) => assetUrl(campaignId, target)), false);
  }, [editor, noteId, reloadKey, markdown, campaignId]);

  const insertImage = useCallback(
    (relativePath: string) => {
      editorRef.current?.chain().focus().setImage({ src: assetUrl(campaignId, relativePath) }).run();
    },
    [campaignId]
  );

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
              ? t('search.noHit')
              : t('search.position', { current: activeMatch === -1 ? '–' : activeMatch + 1, total: matchCount })}
          </span>
          <button type="button" title={t('search.previous')} disabled={matchCount === 0} onClick={() => goToMatch(-1)}>
            ‹
          </button>
          <button type="button" title={t('search.next')} disabled={matchCount === 0} onClick={() => goToMatch(1)}>
            ›
          </button>
        </div>
      ) : null}

      <Toolbar
        editor={editor}
        onInsertImage={() =>
          void onPickImage().then((relativePath) => {
            if (relativePath) insertImage(relativePath);
          })
        }
      />
      {/*
        ProseMirror faengt Drop und Einfuegen nur innerhalb des Textbereichs ab.
        Faellt ein Bild daneben, etwa in den Rand unterhalb des Textes, greift
        dieser Handler. Hat ProseMirror das Ereignis schon behandelt, ist
        defaultPrevented gesetzt und hier passiert nichts mehr.
      */}
      <div
        className="body-editor__surface"
        onDragOver={(event) => {
          if ([...event.dataTransfer.items].some((item) => item.kind === 'file')) event.preventDefault();
        }}
        onDrop={(event) => {
          if (event.defaultPrevented) return;
          if (importFromDataTransfer(event.dataTransfer)) event.preventDefault();
        }}
        onPaste={(event) => {
          if (event.defaultPrevented) return;
          if (importFromDataTransfer(event.clipboardData)) event.preventDefault();
        }}
      >
        <EditorContent editor={editor} />
      </div>

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
                <span className="suggestions__type">{findNoteType(index.types, note.type).label}</span>
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
                <span>{t('suggest.createNew', { title: suggestion.query.trim() })}</span>
                <span className="suggestions__type">{t('suggest.new')}</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
