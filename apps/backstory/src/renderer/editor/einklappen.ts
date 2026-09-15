import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { hatInhalt, versteckteBloecke, type Stufen } from '../../shared/abschnitte';

/**
 * Einklappbare Ueberschriften.
 *
 * Links neben dem Text steht ein Pfeil; ein Klick versteckt alles, was
 * hierarchisch darunter liegt.
 *
 * Nichts davon wandert in die Notiz. Der Zustand ist Ansicht und lebt nur,
 * solange die Anwendung laeuft — eine Notiz muss in Obsidian und in jedem
 * Texteditor unveraendert aussehen. Deshalb auch Dekorationen und keine
 * Knoten-Attribute: Attribute wuerden beim Speichern mitgeschrieben.
 *
 * Gemerkt wird die laufende Nummer der Ueberschrift, nicht ihre Stelle im
 * Dokument: beim Tippen verschiebt sich die Stelle staendig, die Reihenfolge
 * der Ueberschriften dagegen nicht.
 */
export const einklappenPluginKey = new PluginKey<Set<number>>('einklappen');

/** Die Ebene je Block auf oberster Ebene des Dokuments. */
function stufenVon(view: EditorView): Stufen {
  const stufen: (number | null)[] = [];
  view.state.doc.forEach((node) => {
    stufen.push(node.type.name === 'heading' ? (node.attrs.level as number) : null);
  });
  return stufen;
}

export interface EinklappHandlers {
  /** Beschriftung des Pfeils, uebersetzt. */
  titel: (zu: boolean) => string;
}

export function createEinklappExtension(handlers: EinklappHandlers) {
  return Extension.create({
    name: 'einklappen',

    addProseMirrorPlugins() {
      return [
        new Plugin<Set<number>>({
          key: einklappenPluginKey,

          state: {
            init: () => new Set<number>(),
            apply: (tr, vorher) => tr.getMeta(einklappenPluginKey) ?? vorher
          },

          props: {
            decorations(state) {
              const eingeklappt = einklappenPluginKey.getState(state) ?? new Set<number>();

              const stufen: (number | null)[] = [];
              const stellen: number[] = [];
              state.doc.forEach((node, offset) => {
                stufen.push(node.type.name === 'heading' ? (node.attrs.level as number) : null);
                stellen.push(offset);
              });

              const versteckt = versteckteBloecke(stufen, eingeklappt);
              const dekorationen: Decoration[] = [];

              let nummer = -1;
              state.doc.forEach((node, offset, index) => {
                if (versteckt.has(index)) {
                  dekorationen.push(
                    Decoration.node(offset, offset + node.nodeSize, { class: 'ist-eingeklappt' })
                  );
                }

                if (stufen[index] === null) return;
                nummer += 1;
                if (!hatInhalt(stufen, index)) return;

                const zu = eingeklappt.has(nummer);
                const eigene = nummer;
                dekorationen.push(
                  Decoration.widget(
                    offset + 1,
                    (view) => {
                      const knopf = document.createElement('button');
                      knopf.type = 'button';
                      knopf.className = `einklapp-pfeil${zu ? ' is-zu' : ''}`;
                      knopf.title = handlers.titel(zu);
                      knopf.setAttribute('aria-expanded', zu ? 'false' : 'true');
                      knopf.contentEditable = 'false';
                      knopf.textContent = zu ? '▸' : '▾';
                      knopf.addEventListener('mousedown', (ereignis) => {
                        // Sonst setzt der Klick den Cursor und nimmt dem
                        // Knopf das Ereignis weg.
                        ereignis.preventDefault();
                        ereignis.stopPropagation();
                        schalte(view, eigene);
                      });
                      return knopf;
                    },
                    { side: -1, ignoreSelection: true, key: `pfeil-${nummer}-${zu ? 'zu' : 'auf'}` }
                  )
                );
              });

              return DecorationSet.create(state.doc, dekorationen);
            }
          },

          view: () => ({
            /**
             * Landet der Cursor in einem versteckten Block, klappt der
             * Abschnitt wieder auf.
             *
             * Sonst schriebe man in Text, den niemand sieht — die Art
             * Fehler, bei der jemand Arbeit verliert. Der Fall kommt
             * vor: die Suche springt zu einer Fundstelle, und die kann
             * ueberall liegen.
             */
            update: (view) => {
              const eingeklappt = einklappenPluginKey.getState(view.state);
              if (!eingeklappt || eingeklappt.size === 0) return;

              const stufen = stufenVon(view);
              const versteckt = versteckteBloecke(stufen, eingeklappt);
              if (versteckt.size === 0) return;

              const auswahl = view.state.selection;
              const $von = view.state.doc.resolve(auswahl.from);
              if ($von.depth === 0) return;

              // Der wievielte Block auf oberster Ebene die Auswahl traegt.
              const index = $von.index(0);
              if (!versteckt.has(index)) return;

              // Alles aufklappen, was diesen Block versteckt haelt.
              const offen = new Set(eingeklappt);
              for (const nummer of eingeklappt) {
                const nurDiese = versteckteBloecke(stufen, new Set([nummer]));
                if (nurDiese.has(index)) offen.delete(nummer);
              }
              setze(view, offen);
            }
          })
        })
      ];
    }
  });
}

function setze(view: EditorView, eingeklappt: Set<number>): void {
  view.dispatch(view.state.tr.setMeta(einklappenPluginKey, eingeklappt));
}

/**
 * Die Stelle hinter dem Text einer Ueberschrift.
 *
 * Gezaehlt wird dieselbe laufende Nummer wie ueberall hier: die der
 * Ueberschriften im Dokument, nicht ihre Stelle.
 */
function endeDerUeberschrift(view: EditorView, nummer: number): number | null {
  let gesucht = -1;
  let stelle: number | null = null;
  view.state.doc.forEach((node, offset) => {
    if (node.type.name !== 'heading' || stelle !== null) return;
    gesucht += 1;
    if (gesucht === nummer) stelle = offset + 1 + node.content.size;
  });
  return stelle;
}

/**
 * Eine Ueberschrift auf- oder zuklappen.
 *
 * Steht der Cursor in dem Abschnitt, der gleich verschwindet, wandert er
 * vorher ans Ende der Ueberschrift. Ohne das ging Zuklappen von dort aus gar
 * nicht: die Ansicht klappt einen Abschnitt wieder auf, sobald der Cursor
 * darin landet (sonst schriebe man in Text, den niemand sieht) — und das griff
 * hier sofort, so dass der Knopf nichts zu tun schien.
 *
 * Auswahl und Zustand gehen in EINER Transaktion hinaus. Zwei nacheinander,
 * und dazwischen sieht der Aufklapp-Waechter den Cursor noch im versteckten
 * Abschnitt.
 */
export function schalte(view: EditorView, nummer: number): void {
  const vorher = einklappenPluginKey.getState(view.state) ?? new Set<number>();
  const naechste = new Set(vorher);
  const klapptZu = !naechste.has(nummer);
  if (klapptZu) naechste.add(nummer);
  else naechste.delete(nummer);

  const tr = view.state.tr.setMeta(einklappenPluginKey, naechste);

  if (klapptZu) {
    const stufen = stufenVon(view);
    const versteckt = versteckteBloecke(stufen, new Set([nummer]));
    const $von = view.state.doc.resolve(view.state.selection.from);
    const index = $von.depth === 0 ? -1 : $von.index(0);
    if (versteckt.has(index)) {
      const ziel = endeDerUeberschrift(view, nummer);
      if (ziel !== null) tr.setSelection(TextSelection.create(tr.doc, ziel));
    }
  }

  view.dispatch(tr);
}

/** Alles aufklappen. */
export function klappeAllesAuf(view: EditorView): void {
  setze(view, new Set());
}
