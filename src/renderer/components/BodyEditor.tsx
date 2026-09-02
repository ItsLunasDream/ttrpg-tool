import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { SizedImage } from '../editor/sizedImage';
import { createWikiLinkExtension, type SuggestionState } from '../editor/wikiLinkExtension';
import { createSearchHighlightExtension, replaceMatches, selectMatch } from '../editor/searchHighlight';
import { htmlToMarkdown, markdownToHtml } from '../editor/markdown';
import { assetPath, assetUrl, isImageFile } from '../editor/assets';
import { normalizeName } from '../../shared/wikilinks';
import type { NoteIndex } from '../noteIndex';
import type { Note } from '../../shared/types';
import { findNoteType } from '../../shared/noteTypes';
import { Toolbar } from './Toolbar';
import { Modal } from './Modal';
import { useT } from '../i18n';

/** Was der Editor verlinken und was der Hauptprozess oeffnen darf. */
const LINK_PROTOCOLS = ['http', 'https', 'mailto'];

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
  /** Meldung an die Anwendung, etwa nach dem Ersetzen. */
  onReport: (text: string) => void;
  onOpenExternal: (url: string) => void;
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
  onPickImage,
  onReport,
  onOpenExternal
}: Props) {
  const t = useT();
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null);
  const [highlight, setHighlight] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [activeMatch, setActiveMatch] = useState(-1);
  // Eigene Suche im Dokument, unabhaengig von der Suche in der Seitenleiste.
  const [localSearch, setLocalSearch] = useState<{ query: string; replace: string } | null>(null);
  /** Adresse im Link-Dialog, null wenn er zu ist. */
  const [linkDraft, setLinkDraft] = useState<string | null>(null);

  // Ist die eigene Suche offen, gilt ihr Begriff, sonst der aus der Seitenleiste.
  const effectiveQuery = localSearch ? localSearch.query : searchQuery;
  const searchOpen = Boolean(localSearch) || Boolean(searchQuery.trim());

  // Handler laufen in ProseMirror-Plugins, die nur einmal erzeugt werden.
  // Ueber diese Ref sehen sie trotzdem immer den aktuellen Index.
  const indexRef = useRef(index);
  indexRef.current = index;

  const handlersRef = useRef({ onOpenNote, onHoverNote });
  handlersRef.current = { onOpenNote, onHoverNote };

  const queryRef = useRef(effectiveQuery);
  queryRef.current = effectiveQuery;
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
      // Die Werkzeugleiste bietet nur H1 bis H3 an, das reicht fuer eine
      // Backstory. Tiefere Ueberschriften muss der Editor trotzdem kennen,
      // sonst wuerde ein #### aus einer bestehenden Datei beim Speichern zu
      // gewoehnlichem Text.
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Placeholder.configure({ placeholder: t('editor.placeholder') }),
      // Ohne diese Erweiterung kennt der Editor keine Links: [Text](URL) aus
      // der Datei verlor beim Speichern seine Adresse. Geoeffnet wird wie bei
      // Wiki-Links mit Strg+Klick, damit der Cursor sonst normal gesetzt
      // werden kann, und im Systembrowser statt im App-Fenster.
      Link.configure({ openOnClick: false, autolink: false, protocols: LINK_PROTOCOLS }),
      // Ohne Tabellen zog der Editor alle Zellen zu einer Textwurst zusammen.
      // resizable false: Spaltenbreiten liessen sich in Markdown ohnehin nicht
      // ablegen, sie waeren beim naechsten Laden wieder weg.
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      wikiLink,
      searchHighlight,
      SizedImage.configure({ inline: false, allowBase64: false })
    ],
    content: markdownToHtml(markdown, (target) => assetUrl(campaignId, target)),
    onUpdate: ({ editor: instance }) => onChange(htmlToMarkdown(instance.getHTML(), assetPath)),

    editorProps: {
      // Bilder aus der Zwischenablage oder per Ziehen und Ablegen werden in
      // die Kampagne kopiert, nicht als Base64 in den Text geschrieben.
      handlePaste: (_view, event) => importFromDataTransfer(event.clipboardData),
      handleDrop: (_view, event) => importFromDataTransfer((event as DragEvent).dataTransfer),

      handleDOMEvents: {
        mousedown: (_view, event) => {
          const href = (event.target as HTMLElement | null)?.closest('a')?.getAttribute('href');
          if (!href || !(event.ctrlKey || event.metaKey)) return false;

          // Alles andere waere ein Verweis, den der Editor gar nicht erst
          // anlegt, und der Hauptprozess wiese ihn ohnehin ab.
          // Kleingeschrieben vergleichen: HTTPS: ist derselbe Verweis.
          const scheme = href.slice(0, href.indexOf(':')).toLowerCase();
          if (!LINK_PROTOCOLS.includes(scheme)) return false;

          event.preventDefault();
          onOpenExternal(href);
          return true;
        }
      }
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
  }, [editor, effectiveQuery, noteId]);

  const goToMatch = useCallback(
    (direction: 1 | -1) => {
      if (!editor || matchCount === 0) return;
      const next = activeMatch === -1
        ? (direction === 1 ? 0 : matchCount - 1)
        : (activeMatch + direction + matchCount) % matchCount;
      setActiveMatch(next);
      selectMatch(editor.view, next, effectiveQuery);
    },
    [editor, matchCount, activeMatch, effectiveQuery]
  );

  // F3 und Umschalt+F3 springen zwischen den Fundstellen, wie in einem
  // Code-Editor. Ohne Suchbegriff passiert nichts.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setLocalSearch((previous) => previous ?? { query: '', replace: '' });
        // Der Fokus muss nach dem Rendern gesetzt werden.
        window.setTimeout(() => document.querySelector<HTMLInputElement>('.search-bar__query')?.select(), 0);
        return;
      }

      if (event.key === 'Escape' && localSearch) {
        event.preventDefault();
        setLocalSearch(null);
        editorRef.current?.commands.focus();
        return;
      }

      if (event.key === 'F3' && effectiveQuery.trim() && matchCount > 0) {
        event.preventDefault();
        goToMatch(event.shiftKey ? -1 : 1);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [effectiveQuery, matchCount, goToMatch, localSearch]);

  /**
   * Setzt oder entfernt den Link auf der aktuellen Auswahl. Ohne Auswahl wird
   * die Adresse als Text eingefuegt und verlinkt, sonst passierte nichts
   * Sichtbares.
   */
  const applyLink = useCallback(
    (raw: string) => {
      const url = raw.trim();
      setLinkDraft(null);
      if (!editorRef.current) return;
      const chain = editorRef.current.chain().focus().extendMarkRange('link');

      if (!url) {
        chain.unsetLink().run();
        return;
      }

      if (editorRef.current.state.selection.empty && !editorRef.current.isActive('link')) {
        chain.insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] }).run();
        return;
      }

      chain.setLink({ href: url }).run();
    },
    []
  );

  const replace = useCallback(
    (scope: number | 'all') => {
      if (!editor || !localSearch?.query.trim()) return;
      const count = replaceMatches(editor.view, localSearch.query, localSearch.replace, scope);
      if (count > 0) {
        setActiveMatch(-1);
        onReport(count === 1 ? t('search.replacedOne') : t('search.replaced', { count }));
      }
    },
    [editor, localSearch, onReport, t]
  );

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
      {searchOpen ? (
        <div className="search-bar">
          {localSearch ? (
            <>
              <input
                className="search-bar__query"
                value={localSearch.query}
                placeholder={t('search.inNote')}
                aria-label={t('search.inNote')}
                onChange={(event) => setLocalSearch({ ...localSearch, query: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    goToMatch(event.shiftKey ? -1 : 1);
                  }
                }}
              />
              <input
                className="search-bar__replace"
                value={localSearch.replace}
                placeholder={t('search.replaceWith')}
                aria-label={t('search.replaceWith')}
                onChange={(event) => setLocalSearch({ ...localSearch, replace: event.target.value })}
              />
            </>
          ) : (
            <span className="search-bar__term" title={t('search.fromSidebar')}>
              „{searchQuery.trim()}"
            </span>
          )}

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

          {localSearch ? (
            <>
              <button type="button" disabled={matchCount === 0 || activeMatch === -1} onClick={() => replace(activeMatch)}>
                {t('search.replace')}
              </button>
              <button type="button" disabled={matchCount === 0} onClick={() => replace('all')}>
                {t('search.replaceAll')}
              </button>
              <button type="button" className="icon-button" title={t('search.close')} onClick={() => setLocalSearch(null)}>
                ×
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {linkDraft !== null && editor ? (
        <Modal
          title={t('link.title')}
          onClose={() => setLinkDraft(null)}
          footer={
            <button type="button" onClick={() => applyLink(linkDraft)}>
              {t('link.apply')}
            </button>
          }
        >
          <label className="field">
            <span className="field__label">{t('link.url')}</span>
            <input
              autoFocus
              value={linkDraft}
              placeholder="https://"
              onChange={(event) => setLinkDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyLink(linkDraft);
              }}
            />
          </label>
          <p className="panel__hint">{t('link.hint')}</p>
        </Modal>
      ) : null}

      <Toolbar
        editor={editor}
        onEditLink={() => setLinkDraft(editor?.getAttributes('link').href ?? '')}
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
