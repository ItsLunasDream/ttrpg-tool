import { Mark } from '@tiptap/core';

/**
 * Unterstrichener Text.
 *
 * Von Hand statt ueber @tiptap/extension-underline: es sind zwanzig Zeilen,
 * und eine weitere Abhaengigkeit will spaeter mitgepflegt werden — dieselbe
 * Ueberlegung wie beim Klappmenue.
 *
 * Markdown kennt kein Unterstrichen. In der Datei steht deshalb `<u>…</u>`,
 * also inline-HTML; das ist gueltiges Markdown und wird auch von Obsidian
 * dargestellt, so wie es die Bildbreite schon vormacht.
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unterstrichen: {
      toggleUnterstrichen: () => ReturnType;
    };
  }
}

export const Unterstrichen = Mark.create({
  name: 'underline',

  parseHTML() {
    // `text-decoration: underline` kommt aus eingefuegtem Text aus Word und
    // aus dem Browser. Ohne diese Zeile faellt die Auszeichnung beim
    // Einfuegen weg.
    return [{ tag: 'u' }, { style: 'text-decoration=underline' }];
  },

  renderHTML() {
    return ['u', 0];
  },

  addCommands() {
    return {
      toggleUnterstrichen:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name)
    };
  },

  /**
   * Nur Knopf und Strg+U, keine Eingaberegel. `__text__` waere die
   * naheliegende Schreibweise, gehoert in Markdown aber dem Fettdruck.
   */
  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.toggleUnterstrichen()
    };
  }
});
