/**
 * Tastenbelegung.
 *
 * Der Punkt, an dem es schiefgeht, ist die Schreibweise: `ctrl+shift+z` und
 * `shift+ctrl+z` wären zwei Belegungen für denselben Handgriff. Deshalb wird
 * eine Kombination an genau einer Stelle gebildet — und genau das wird hier
 * geprüft, dazu die Fälle, in denen eine gespeicherte Belegung nicht mehr passt.
 */

import { describe, expect, it } from 'vitest';
import {
  EDIT_ACTIONS,
  FIXED_ALIASES,
  bindingLookup,
  comboOf,
  conflicts,
  defaultBindings,
  formatCombo,
  isModifierOnly,
  sanitizeBindings,
  type KeyAction,
} from '@/model/keyBindings';
import { TOOL_SHORTCUTS, type ToolId } from '@/model/toolSettings';

const taste = (key: string, mods: Partial<Record<'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey', boolean>> = {}) =>
  ({ key, ...mods }) as Parameters<typeof comboOf>[0];

describe('Schreibweise einer Kombination', () => {
  it('setzt die Zusatztasten in feste Reihenfolge', () => {
    expect(comboOf(taste('z', { ctrlKey: true, shiftKey: true }))).toBe('ctrl+shift+z');
    // Dieselbe Taste, andere Reihenfolge im Ereignis — dieselbe Schreibweise.
    expect(comboOf(taste('Z', { shiftKey: true, ctrlKey: true }))).toBe('ctrl+shift+z');
  });

  it('behandelt die Befehlstaste wie Strg', () => {
    expect(comboOf(taste('s', { metaKey: true }))).toBe(comboOf(taste('s', { ctrlKey: true })));
  });

  it('lässt benannte Tasten, wie sie sind', () => {
    expect(comboOf(taste('Delete'))).toBe('Delete');
    expect(comboOf(taste('Escape'))).toBe('Escape');
    expect(comboOf(taste('['))).toBe('[');
  });

  it('erkennt reine Zusatztasten', () => {
    for (const k of ['Control', 'Shift', 'Alt', 'Meta']) expect(isModifierOnly(k)).toBe(true);
    expect(isModifierOnly('w')).toBe(false);
  });

  it('schreibt eine Kombination lesbar', () => {
    expect(formatCombo('ctrl+shift+g')).toBe('Strg+⇧+G');
    expect(formatCombo('Delete')).toBe('Delete');
    expect(formatCombo('w')).toBe('W');
  });
});

describe('Voreinstellung', () => {
  it('belegt jedes Werkzeug und jede Handlung', () => {
    const d = defaultBindings();
    for (const id of Object.keys(TOOL_SHORTCUTS) as ToolId[]) {
      expect(d[`tool.${id}`], id).toBeTruthy();
    }
    for (const a of EDIT_ACTIONS) expect(d[a], a).toBeTruthy();
  });

  it('kommt ohne Doppelbelegung aus', () => {
    expect([...conflicts(defaultBindings()).keys()]).toEqual([]);
  });

  it('nimmt die Werkzeugkürzel aus der Werkzeugliste', () => {
    expect(defaultBindings()['tool.wall']).toBe(TOOL_SHORTCUTS.wall.toLowerCase());
  });
});

describe('Nachschlagen', () => {
  it('findet die Handlung zur Taste', () => {
    const l = bindingLookup(defaultBindings());
    expect(l['ctrl+z']).toBe('edit.undo');
    expect(l.w).toBe('tool.wall');
  });

  it('kennt die festen Zweitbelegungen', () => {
    const l = bindingLookup(defaultBindings());
    for (const [combo, action] of Object.entries(FIXED_ALIASES)) expect(l[combo]).toBe(action);
  });

  /**
   * Eine eigene Belegung muss eine feste Zweitbelegung schlagen können — sonst
   * ließe sich Rückschritt nie für etwas anderes benutzen.
   */
  it('lässt die eigene Belegung eine Zweitbelegung überschreiben', () => {
    const b = { ...defaultBindings(), 'tool.select': 'Backspace' } as Record<KeyAction, string>;
    expect(bindingLookup(b).Backspace).toBe('tool.select');
  });
});

describe('Doppelbelegung', () => {
  it('meldet, was zweimal auf derselben Taste liegt', () => {
    const b = { ...defaultBindings(), 'tool.select': 'w' } as Record<KeyAction, string>;
    const c = conflicts(b);
    expect([...(c.get('w') ?? [])].sort()).toEqual(['tool.select', 'tool.wall']);
  });
});

describe('Gespeicherte Belegung einlesen', () => {
  it('fällt bei Unsinn auf die Voreinstellung zurück', () => {
    expect(sanitizeBindings(null)).toEqual(defaultBindings());
    expect(sanitizeBindings('kaputt')).toEqual(defaultBindings());
  });

  it('übernimmt bekannte Handlungen und lässt unbekannte liegen', () => {
    const g = sanitizeBindings({ 'edit.undo': 'ctrl+q', 'edit.zauberei': 'x' });
    expect(g['edit.undo']).toBe('ctrl+q');
    expect('edit.zauberei' in g).toBe(false);
  });

  /**
   * Der Fall, der eine ältere Datei teuer machen würde: ein Werkzeug kommt
   * dazu, die gespeicherte Belegung kennt es nicht. Es muss trotzdem eine
   * Taste haben.
   */
  it('gibt einem neuen Werkzeug die Vorgabetaste', () => {
    const g = sanitizeBindings({ 'edit.undo': 'ctrl+q' });
    expect(g['tool.route']).toBe(defaultBindings()['tool.route']);
  });
});
