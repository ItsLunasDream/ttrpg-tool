import { describe, expect, it } from 'vitest';
import { strings, LANGUAGES, LANGUAGE_LABELS } from '@/i18n/strings';
import { getLanguage, setLanguage, t } from '@/i18n';

const entries = Object.entries(strings) as Array<[string, readonly [string, string]]>;

describe('Wörterbuch', () => {
  it('hat für jeden Schlüssel beide Sprachen', () => {
    for (const [key, [de, en]] of entries) {
      expect(de, `${key} deutsch`).toBeTruthy();
      expect(en, `${key} englisch`).toBeTruthy();
    }
  });

  it('verwendet in beiden Sprachen dieselben Platzhalter', () => {
    // Ein vergessener Platzhalter fällt sonst erst auf, wenn irgendwo
    // wörtlich „{count}" in der Oberfläche steht.
    const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const [key, [de, en]] of entries) {
      expect(placeholders(en), `${key}`).toEqual(placeholders(de));
    }
  });

  it('lässt keine deutschen Texte in der englischen Spalte stehen', () => {
    // Grobe Kontrolle auf typische Übersetzungslücken.
    const suspicious = /\b(Wände|Türen|Lichter|Deckkraft|Größe|Auswahl|Karte|Ebene)\b/;
    const missed = entries
      .filter(([key, [, en]]) => suspicious.test(en) && !key.startsWith('prop.'))
      .map(([key]) => key);
    expect(missed).toEqual([]);
  });

  it('kennt für jede Sprache eine Beschriftung', () => {
    for (const l of LANGUAGES) expect(LANGUAGE_LABELS[l]).toBeTruthy();
  });
});

describe('t()', () => {
  it('liefert je nach Sprache den passenden Text', () => {
    setLanguage('de');
    expect(t('file.save')).toBe('Speichern');
    setLanguage('en');
    expect(t('file.save')).toBe('Save');
  });

  it('ersetzt Platzhalter', () => {
    setLanguage('en');
    expect(t('status.objects', { n: 42 })).toBe('42 objects');
    setLanguage('de');
    expect(t('status.objects', { n: 42 })).toBe('42 Objekte');
  });

  it('ersetzt einen Platzhalter überall, nicht nur beim ersten Vorkommen', () => {
    setLanguage('de');
    expect(t('map.sizeHint', { cols: 2, rows: 3, w: 4, h: 5, tile: 6 })).not.toContain('{');
  });

  it('merkt sich die gewählte Sprache', () => {
    setLanguage('en');
    expect(getLanguage()).toBe('en');
    setLanguage('de');
    expect(getLanguage()).toBe('de');
  });
});
