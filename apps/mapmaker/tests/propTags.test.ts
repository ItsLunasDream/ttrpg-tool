/**
 * Schlagwörter der Prop-Palette, zweisprachig.
 *
 * Dieselbe Zusage wie bei den Oberflächentexten: kein Wort ohne Eintrag. Ein
 * Schlagwort, das nur auf Deutsch existiert, ist für den englischen Betrieb
 * nicht vorhanden — und das fällt niemandem auf, weil die Suche einfach nichts
 * findet.
 */

import { describe, expect, it } from 'vitest';
import { allProps, searchProps } from '@/assets/library';
import { TAG_EN, tagLabel, tagWords } from '@/assets/propTags';
import { setLanguage } from '@/i18n';

describe('Schlagwörter', () => {
  it('übersetzt jedes Schlagwort, das ein eingebautes Prop benutzt', () => {
    const ohne = new Set<string>();
    for (const p of allProps()) {
      if (p.source !== 'builtin') continue;
      for (const tag of p.tags) if (!TAG_EN[tag]) ohne.add(tag);
    }
    expect([...ohne].sort()).toEqual([]);
  });

  it('führt keine Einträge, die kein Prop benutzt', () => {
    const benutzt = new Set(allProps().flatMap((p) => p.tags));
    expect(Object.keys(TAG_EN).filter((t) => !benutzt.has(t)).sort()).toEqual([]);
  });

  it('gibt jedem Schlagwort mindestens ein englisches Wort', () => {
    for (const [tag, en] of Object.entries(TAG_EN)) {
      expect(en.length, tag).toBeGreaterThan(0);
      for (const w of en) expect(w.trim(), tag).not.toBe('');
    }
  });

  it('behält unbekannte Schlagwörter — importierte Assets bringen eigene mit', () => {
    expect(tagWords('gurkenglas')).toEqual(['gurkenglas']);
    setLanguage('en');
    expect(tagLabel('gurkenglas')).toBe('gurkenglas');
    setLanguage('de');
  });

  it('zeigt das Schlagwort in der eingestellten Sprache', () => {
    setLanguage('de');
    expect(tagLabel('truhe')).toBe('truhe');
    setLanguage('en');
    expect(tagLabel('truhe')).toBe('chest');
    setLanguage('de');
  });
});

describe('Suche in der Palette', () => {
  /**
   * Der eigentliche Punkt: gesucht wird in beiden Sprachen, egal welche
   * eingestellt ist. Vorher fand „chest" auf Deutsch nichts.
   */
  it('findet dasselbe Prop über das deutsche und das englische Schlagwort', () => {
    for (const sprache of ['de', 'en'] as const) {
      setLanguage(sprache);
      const deutsch = searchProps('truhe').map((p) => p.id);
      const englisch = searchProps('chest').map((p) => p.id);
      expect(deutsch.length, sprache).toBeGreaterThan(0);
      expect(englisch, sprache).toEqual(deutsch);
    }
    setLanguage('de');
  });

  it('findet auch über ein Nebenwort', () => {
    setLanguage('de');
    // „kaputt" führt „broken" *und* „damaged".
    expect(searchProps('damaged').length).toBeGreaterThan(0);
    expect(searchProps('broken').length).toBeGreaterThan(0);
  });
});
