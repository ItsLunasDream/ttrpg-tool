import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { findWikiLinks, hasLinkReservedChars, insideWikiLink } from '../../shared/wikilinks';

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

  // Im Inneren eines fertigen Verweises sieht es nach links wie ein frisch
  // begonnener aus: `[[Ela` ohne `]]`. Ohne diese Pruefung schlaegt die Liste
  // den halben Titel vor, legt ihn an und haengt ein zweites `]]` an.
  const ganzerAbsatz = $from.parent.textBetween(0, $from.parent.content.size, '\n', '\n');
  if (insideWikiLink(ganzerAbsatz, $from.parentOffset)) return null;

  const from = $from.pos - open.offset;
  const coords = view.coordsAtPos(from);
  return { query: open.query, from, to: $from.pos, left: coords.left, top: coords.bottom };
}

export function createWikiLinkExtension(handlers: WikiLinkHandlers) {
  return Extension.create({
    name: 'wikiLink',

    addProseMirrorPlugins() {
      let hovered: string | null = null;
      /**
       * Die Markierung, die von der ersten Klammer verschluckt wurde.
       *
       * Getippt kommen die beiden Klammern einzeln an, und die erste ersetzt
       * die Markierung schon. Um sie bei der zweiten umschliessen zu koennen,
       * muss sie hier zwischenliegen.
       */
      let verschluckt: { text: string; von: number } | null = null;

      /** Taugt der markierte Text als Zieltitel? */
      function alsZiel(text: string): string | null {
        const ziel = text.trim();
        // Ueber Absatzgrenzen ergaebe das keinen Titel, und die Zeichen des
        // Link-Formats selbst zerlegten ihn.
        if (!ziel || ziel.includes('\n') || hasLinkReservedChars(ziel)) return null;
        return ziel;
      }


      return [
        new Plugin({
          key: wikiLinkPluginKey,

          view: () => ({
            update: (view) => handlers.onSuggestion(suggestionAt(view)),
            destroy: () => handlers.onSuggestion(null)
          }),

          props: {
            /**
             * Markierter Text und `[[` ergeben einen Verweis statt ihn zu
             * ersetzen: aus "Elara" wird "[[Elara]]".
             *
             * Nur der Wiki-Link. Eine einzelne Klammer ersetzt die Markierung
             * weiterhin, so wie jede andere Eingabe auch.
             */
            handleTextInput(view, from, to, text) {
              if (text !== '[' && text !== '[[') {
                verschluckt = null;
                return false;
              }

              function umschliesse(ziel: string, von: number, bis: number): boolean {
                view.dispatch(view.state.tr.insertText(`[[${ziel}]]`, von, bis).scrollIntoView());
                return true;
              }

              // Beide Klammern auf einmal, etwa eingefuegt.
              if (text === '[[') {
                const ziel = from === to ? null : alsZiel(view.state.doc.textBetween(from, to, '\n', '\n'));
                verschluckt = null;
                return ziel === null ? false : umschliesse(ziel, from, to);
              }

              // Erste Klammer: die Markierung merken, sie wird gleich ersetzt.
              if (from !== to) {
                const ziel = alsZiel(view.state.doc.textBetween(from, to, '\n', '\n'));
                verschluckt = ziel === null ? null : { text: ziel, von: from };
                return false;
              }

              // Zweite Klammer unmittelbar dahinter: jetzt wird umschlossen.
              const gemerkt = verschluckt;
              verschluckt = null;
              if (!gemerkt || from !== gemerkt.von + 1) return false;
              if (view.state.doc.textBetween(gemerkt.von, from, '\n', '\n') !== '[') return false;

              return umschliesse(gemerkt.text, gemerkt.von, from);
            },

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
