import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { findWikiLinks } from '../../shared/wikilinks';

export interface SuggestionState {
  query: string;
  /** Dokumentpositionen des offenen `[[...` inklusive Klammern. */
  from: number;
  to: number;
  left: number;
  top: number;
}

export interface WikiLinkHandlers {
  /** Liefert true, wenn zu diesem Titel/Alias eine Notiz existiert. */
  resolves: (target: string) => boolean;
  onOpen: (target: string) => void;
  onHover: (target: string | null, rect: DOMRect | null) => void;
  onSuggestion: (state: SuggestionState | null) => void;
}

export const wikiLinkPluginKey = new PluginKey('wikiLink');

/** Sucht ein offenes `[[` links vom Cursor, ohne dazwischenliegendes `]]`. */
function readOpenLink(textBefore: string): { query: string; offset: number } | null {
  const open = textBefore.lastIndexOf('[[');
  if (open === -1) return null;

  const query = textBefore.slice(open + 2);
  if (query.includes(']]') || query.includes('[[') || query.includes('\n')) return null;

  return { query, offset: textBefore.length - open };
}

function suggestionAt(view: EditorView): SuggestionState | null {
  const { state } = view;
  const { empty, $from } = state.selection;
  if (!empty) return null;

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\n', '\n');
  const open = readOpenLink(textBefore);
  if (!open) return null;

  const from = $from.pos - open.offset;
  const coords = view.coordsAtPos(from);
  return { query: open.query, from, to: $from.pos, left: coords.left, top: coords.bottom };
}

export function createWikiLinkExtension(handlers: WikiLinkHandlers) {
  return Extension.create({
    name: 'wikiLink',

    addProseMirrorPlugins() {
      let hovered: string | null = null;

      return [
        new Plugin({
          key: wikiLinkPluginKey,

          view: () => ({
            update: (view) => handlers.onSuggestion(suggestionAt(view)),
            destroy: () => handlers.onSuggestion(null)
          }),

          props: {
            decorations(state) {
              const decorations: Decoration[] = [];

              state.doc.descendants((node, pos) => {
                if (!node.isText || !node.text) return;
                for (const link of findWikiLinks(node.text)) {
                  const resolved = handlers.resolves(link.target);
                  decorations.push(
                    Decoration.inline(pos + link.from, pos + link.to, {
                      class: resolved ? 'wikilink' : 'wikilink wikilink--unresolved',
                      'data-wikilink': link.target
                    })
                  );
                }
              });

              return DecorationSet.create(state.doc, decorations);
            },

            handleDOMEvents: {
              mousedown(_view, event) {
                const target = (event.target as HTMLElement | null)?.closest('[data-wikilink]');
                const name = target?.getAttribute('data-wikilink');
                // Nur mit Modifier oeffnen, damit der Cursor normal gesetzt werden kann.
                if (!name || !(event.ctrlKey || event.metaKey)) return false;

                event.preventDefault();
                handlers.onOpen(name);
                return true;
              },

              mouseover(_view, event) {
                const element = (event.target as HTMLElement | null)?.closest('[data-wikilink]');
                const name = element?.getAttribute('data-wikilink') ?? null;
                if (name === hovered) return false;

                hovered = name;
                handlers.onHover(name, element ? element.getBoundingClientRect() : null);
                return false;
              },

              mouseleave() {
                if (hovered === null) return false;
                hovered = null;
                handlers.onHover(null, null);
                return false;
              }
            }
          }
        })
      ];
    }
  });
}
