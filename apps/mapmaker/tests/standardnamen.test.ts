import { describe, expect, it } from 'vitest';
import { createDocument, uebersetzeStandardnamen } from '@/model/document';
import { setLanguage } from '@/i18n';

describe('Standardnamen folgen der Sprache', () => {
  it('uebersetzt nur, was noch ein Standardname ist', () => {
    setLanguage('en');
    const doc = createDocument();
    expect(doc.meta.name).toBe('Untitled map');
    const eigene = { ...doc, layers: { ...doc.layers, [doc.rootLayers[0]]: { ...doc.layers[doc.rootLayers[0]], name: 'Keller' } } };
    setLanguage('de');
    const neu = uebersetzeStandardnamen(eigene);
    expect(neu.meta.name).toBe('Unbenannte Karte');
    expect(neu.layers[neu.rootLayers[0]].name).toBe('Keller');
    expect(neu.layers[neu.rootLayers[5]].name).toBe('Wände & Licht');
    // Schon uebersetzt: dasselbe Objekt, keine Aenderung.
    expect(uebersetzeStandardnamen(neu)).toBe(neu);
  });
});
