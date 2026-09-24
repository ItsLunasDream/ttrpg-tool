import { Node } from '@tiptap/core';

/**
 * Ein HTML-Kommentar aus der Datei: `<!-- Notiz fuer die Spielleitung -->`.
 *
 * Der Editor kennt Kommentare nicht; ProseMirror warf sie beim Laden weg,
 * und nach der naechsten Aenderung fehlten sie in der Datei (Testbericht).
 * Beim Laden wird jeder Kommentar deshalb ein kleines, nicht bearbeitbares
 * Zeichen im Text, und beim Speichern wieder genau der Kommentar.
 *
 * Der Inhalt steht kodiert im Attribut: so kommt er durch HTML-Leser und
 * Editor, ohne dass `-->` oder Anfuehrungszeichen darin etwas zerbrechen.
 */
export const Kommentar = Node.create({
  name: 'kommentar',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      text: {
        default: '',
        parseHTML: (element) => {
          try {
            return decodeURIComponent(element.getAttribute('data-kommentar') ?? '');
          } catch {
            return element.getAttribute('data-kommentar') ?? '';
          }
        },
        renderHTML: (attribute) => ({ 'data-kommentar': encodeURIComponent(String(attribute.text ?? '')) })
      }
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-kommentar]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    // Das unsichtbare Zeichen haelt das Element fuer Turndown „nicht leer";
    // sonst verschwand beim Speichern der Leerraum hinter dem Kommentar.
    return ['span', { ...HTMLAttributes, class: 'md-kommentar', title: String(node.attrs.text ?? '').trim() }, '\u2060'];
  }
});
