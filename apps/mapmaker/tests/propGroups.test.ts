/**
 * Eigene Prop-Gruppen.
 *
 * Anders als die feste Kategorie (`PropCategory`, ein Prop gehört zu genau
 * einer) ist eine Gruppe eine selbst benannte Sammlung, in der ein Prop
 * mehrfach stecken darf. Geprüft wird die Verwaltung selbst — Anlegen,
 * Zuordnen, Umbenennen, Löschen — unabhängig von der Bibliothek und der
 * Oberfläche.
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
  allPropGroups,
  createPropGroup,
  getPropGroup,
  groupsForProp,
  removePropGroup,
  renamePropGroup,
  resetPropGroups,
  setPropGroupMembership,
} from '@/assets/propGroupStore';

afterEach(() => resetPropGroups());

describe('Prop-Gruppen', () => {
  it('legt eine leere Gruppe mit eigener Id an', () => {
    const a = createPropGroup('Taverne');
    const b = createPropGroup('Taverne');
    expect(a.propIds).toEqual([]);
    expect(a.id).not.toBe(b.id);
    expect(allPropGroups().map((g) => g.name)).toEqual(['Taverne', 'Taverne']);
  });

  it('nimmt ein Prop auf und wieder heraus', () => {
    const g = createPropGroup('Taverne');
    setPropGroupMembership(g.id, 'barrel', true);
    setPropGroupMembership(g.id, 'table_round', true);
    expect(getPropGroup(g.id)?.propIds).toEqual(['barrel', 'table_round']);

    setPropGroupMembership(g.id, 'barrel', false);
    expect(getPropGroup(g.id)?.propIds).toEqual(['table_round']);
  });

  it('nimmt dasselbe Prop nicht zweimal auf', () => {
    const g = createPropGroup('Taverne');
    setPropGroupMembership(g.id, 'barrel', true);
    setPropGroupMembership(g.id, 'barrel', true);
    expect(getPropGroup(g.id)?.propIds).toEqual(['barrel']);
  });

  it('tut nichts, wenn die Gruppe schon gelöscht ist', () => {
    const g = createPropGroup('Taverne');
    removePropGroup(g.id);
    expect(() => setPropGroupMembership(g.id, 'barrel', true)).not.toThrow();
    expect(getPropGroup(g.id)).toBeNull();
  });

  it('lässt ein Prop in mehreren Gruppen gleichzeitig zu', () => {
    const taverne = createPropGroup('Taverne');
    const licht = createPropGroup('Beleuchtung');
    setPropGroupMembership(taverne.id, 'lantern', true);
    setPropGroupMembership(licht.id, 'lantern', true);

    const gruppen = groupsForProp('lantern').map((g) => g.name).sort();
    expect(gruppen).toEqual(['Beleuchtung', 'Taverne']);
  });

  it('benennt um, ohne die Mitglieder zu verlieren', () => {
    const g = createPropGroup('Taverne');
    setPropGroupMembership(g.id, 'barrel', true);
    renamePropGroup(g.id, 'Gasthaus');
    expect(getPropGroup(g.id)).toMatchObject({ name: 'Gasthaus', propIds: ['barrel'] });
  });

  it('löscht eine Gruppe vollständig', () => {
    const g = createPropGroup('Taverne');
    removePropGroup(g.id);
    expect(getPropGroup(g.id)).toBeNull();
    expect(allPropGroups()).toEqual([]);
  });
});
