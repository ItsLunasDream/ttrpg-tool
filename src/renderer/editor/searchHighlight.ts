import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import type { EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { findOccurrences } from '../noteIndex';

export interface DocMatch {
  from: number;
  to: number;
}

/**
 * Alle Fundstellen im Dokument, in Dokumentreihenfolge. Positionen sind
 * ProseMirror-Positionen, keine Zeichenindizes im Markdown.
 */
export function collectDocMatches(doc: ProseMirrorNode, query: string): DocMatch[] {
  const needle = query.trim();
  if (!needle) return [];

  const matches: DocMatch[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    for (const hit of findOccurrences(node.text, needle)) {
      matches.push({ from: pos + hit.from, to: pos + hit.to });
    }
  });
  return matches;
}

export interface SearchHighlightHandlers {
  getQuery: () => string;
  /** Index der aktiven Fundstelle, oder -1 wenn keine aktiv ist. */
  getActiveIndex: () => number;
  onMatchesChanged: (count: number) => void;
}

export const searchHighlightPluginKey = new PluginKey('searchHighlight');

/**
 * Faerbt alle Fundstellen des Suchbegriffs ein und hebt die aktive
 * zusaetzlich hervor, wie die Suche in einem Code-Editor.
 */
export function createSearchHighlightExtension(handlers: SearchHighlightHandlers) {
  let lastCount = -1;

  return Extension.create({
    name: 'searchHighlight',

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: searchHighlightPluginKey,

          props: {
            decorations(state: EditorState) {
              const matches = collectDocMatches(state.doc, handlers.getQuery());

              // Zaehler nur melden, wenn er sich geaendert hat, und ausserhalb
              // des Renderlaufs, sonst beschwert sich React.
              if (matches.length !== lastCount) {
                lastCount = matches.length;
                queueMicrotask(() => handlers.onMatchesChanged(matches.length));
              }

              if (matches.length === 0) return DecorationSet.empty;

              const active = handlers.getActiveIndex();
              return DecorationSet.create(
                state.doc,
                matches.map((match, position) =>
                  Decoration.inline(match.from, match.to, {
                    class: position === active ? 'search-hit search-hit--active' : 'search-hit'
                  })
                )
              );
            }
          }
        })
      ];
    }
  });
}

/**
 * Ersetzt eine oder alle Fundstellen.
 *
 * Von hinten nach vorne, weil jede Ersetzung die Positionen dahinter
 * verschiebt. In einer Transaktion, damit ein Rueckgaengig alles zusammen
 * zurueckholt.
 */
export function replaceMatches(
  view: { state: EditorState; dispatch: (tr: EditorState['tr']) => void },
  query: string,
  replacement: string,
  index: number | 'all'
): number {
  const matches = collectDocMatches(view.state.doc, query);
  const targets = index === 'all' ? matches : matches[index] ? [matches[index]] : [];
  if (targets.length === 0) return 0;

  const tr = view.state.tr;
  for (const match of [...targets].reverse()) {
    if (replacement) tr.insertText(replacement, match.from, match.to);
    else tr.delete(match.from, match.to);
  }
  view.dispatch(tr);
  return targets.length;
}

/** Springt zur Fundstelle mit dem gegebenen Index und markiert sie. */
export function selectMatch(
  view: { state: EditorState; dispatch: (tr: EditorState['tr']) => void },
  index: number,
  query: string
): boolean {
  const matches = collectDocMatches(view.state.doc, query);
  const match = matches[index];
  if (!match) return false;

  const selection = TextSelection.create(view.state.doc, match.from, match.to);
  view.dispatch(view.state.tr.setSelection(selection).scrollIntoView());
  return true;
}
