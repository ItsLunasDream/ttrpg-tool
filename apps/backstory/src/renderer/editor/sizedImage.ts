import Image from '@tiptap/extension-image';

/**
 * Bild mit einstellbarer Breite. TipTap kennt von Haus aus keine Groesse;
 * die Breite wird als Attribut gehalten und beim Speichern als inline-HTML
 * abgelegt, weil Markdown das nicht ausdruecken kann.
 */
export const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {})
      }
    };
  }
});

/** Auswaehlbare Breiten in Bildpunkten. `null` bedeutet volle Textbreite. */
export const IMAGE_WIDTHS: { width: number | null; label: string }[] = [
  { width: 200, label: '200' },
  { width: 400, label: '400' },
  { width: null, label: '100%' }
];
