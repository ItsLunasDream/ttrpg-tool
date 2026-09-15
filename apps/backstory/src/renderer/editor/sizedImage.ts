import Image from '@tiptap/extension-image';
import { breiteAlsAttribute, breiteAusAttributen } from '../../shared/bildbreite';

/**
 * Bild mit einstellbarer Breite. TipTap kennt von Haus aus keine Groesse;
 * die Breite wird als Attribut gehalten und beim Speichern als inline-HTML
 * abgelegt, weil Markdown das nicht ausdruecken kann.
 *
 * Zwei Formen: Bildpunkte ("300") und Anteil der Textbreite ("50%"). Wie sie
 * am Bild stehen, entscheidet `breiteAlsAttribute` — ein Prozentwert im
 * Attribut `width` waere ungueltiges HTML.
 */
export const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) =>
          breiteAusAttributen(element.getAttribute('width'), element.getAttribute('style')),
        renderHTML: (attributes) => breiteAlsAttribute(attributes.width as string | null)
      }
    };
  }
});

/** Auswaehlbare Breiten in Bildpunkten. `null` bedeutet volle Textbreite. */
export const IMAGE_WIDTHS: { width: string | null; label: string }[] = [
  { width: '200', label: '200' },
  { width: '400', label: '400' },
  { width: null, label: '100%' }
];
