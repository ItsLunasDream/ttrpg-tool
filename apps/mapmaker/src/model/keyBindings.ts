/**
 * Tastenkürzel — frei belegbar.
 *
 * **Warum eine Tabelle und keine Kette von `if`s.** Die Belegung stand in
 * `tools/manager.ts` als Folge von Abfragen: erst Strg+Z, dann Strg+Y, dann
 * Strg+C … Das ließ sich nicht ändern, ohne den Quelltext anzufassen, und es
 * ließ sich auch nicht *anzeigen* — die Werkzeugleiste zog ihre Buchstaben aus
 * einer zweiten Liste, die mit der ersten nur zufällig übereinstimmte.
 *
 * Hier steht beides an einer Stelle: eine benannte Handlung je Zeile, dazu die
 * Tastenkombination als normierter Text. Der Manager schlägt nach, die
 * Oberfläche zeigt an, und wer umbelegen will, ändert die Tabelle zur Laufzeit.
 *
 * Die Schreibweise einer Kombination ist festgelegt und wird nirgends sonst
 * gebildet: Zusatztasten in fester Reihenfolge `ctrl+alt+shift+`, danach die
 * Taste. Buchstaben klein, benannte Tasten so, wie der Browser sie liefert
 * (`Delete`, `Escape`). Ohne diese Festlegung wären `shift+ctrl+z` und
 * `ctrl+shift+z` zwei verschiedene Belegungen für dieselbe Handgriff.
 */

import { TOOL_SHORTCUTS, type ToolId } from './toolSettings';

/** Handlungen, die sich auf eine Taste legen lassen. */
export const EDIT_ACTIONS = [
  'edit.undo',
  'edit.redo',
  'edit.copy',
  'edit.paste',
  'edit.duplicate',
  'edit.selectAll',
  'edit.delete',
  'edit.deselect',
  'edit.group',
  'edit.ungroup',
  'edit.front',
  'edit.back',
  'file.save',
  'file.saveAs',
] as const;

export type EditAction = (typeof EDIT_ACTIONS)[number];
export type ToolAction = `tool.${ToolId}`;
export type KeyAction = EditAction | ToolAction;

/**
 * Voreinstellung.
 *
 * Die Werkzeugkürzel kommen aus `TOOL_SHORTCUTS` — die Liste bleibt die
 * Wahrheit über die *Voreinstellung*, damit ein neues Werkzeug nicht an zwei
 * Stellen eingetragen werden muss.
 */
export function defaultBindings(): Record<KeyAction, string> {
  const out = {} as Record<KeyAction, string>;
  for (const [tool, key] of Object.entries(TOOL_SHORTCUTS) as Array<[ToolId, string]>) {
    out[`tool.${tool}`] = key.toLowerCase();
  }
  out['edit.undo'] = 'ctrl+z';
  out['edit.redo'] = 'ctrl+y';
  out['edit.copy'] = 'ctrl+c';
  out['edit.paste'] = 'ctrl+v';
  out['edit.duplicate'] = 'ctrl+d';
  out['edit.selectAll'] = 'ctrl+a';
  out['edit.delete'] = 'Delete';
  out['edit.deselect'] = 'Escape';
  out['edit.group'] = 'ctrl+g';
  out['edit.ungroup'] = 'ctrl+shift+g';
  out['edit.front'] = ']';
  out['edit.back'] = '[';
  out['file.save'] = 'ctrl+s';
  out['file.saveAs'] = 'ctrl+shift+s';
  return out;
}

/**
 * Zweitbelegungen, die *nicht* umbelegbar sind.
 *
 * Rückschritt neben Entfernen und Strg+Umschalt+Z neben Strg+Y: beides sind
 * Griffe, die Leute aus anderen Programmen mitbringen. Sie stehen fest, weil
 * sie sonst in der Liste als eigene Zeile auftauchen müssten — und niemand
 * will „Rückgängig (zweite Taste)" einstellen.
 */
export const FIXED_ALIASES: Record<string, KeyAction> = {
  Backspace: 'edit.delete',
  'ctrl+shift+z': 'edit.redo',
};

/** Die Tastenkombination eines Ereignisses in der festgelegten Schreibweise. */
export function comboOf(e: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}): string {
  const teile: string[] = [];
  // Befehlstaste zählt wie Strg: auf dem Mac liegt dort derselbe Handgriff.
  if (e.ctrlKey || e.metaKey) teile.push('ctrl');
  if (e.altKey) teile.push('alt');
  if (e.shiftKey) teile.push('shift');
  // Ein einzelner Buchstabe klein; alles Benannte, wie der Browser es liefert.
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  teile.push(key);
  return teile.join('+');
}

/** Ist die Taste selbst nur eine Zusatztaste? Damit lässt sich nichts belegen. */
export function isModifierOnly(key: string): boolean {
  return key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta';
}

/** Anzeige einer Kombination. */
export function formatCombo(combo: string): string {
  return combo
    .split('+')
    .map((teil) =>
      teil === 'ctrl'
        ? 'Strg'
        : teil === 'shift'
          ? '⇧'
          : teil === 'alt'
            ? 'Alt'
            : teil.length === 1
              ? teil.toUpperCase()
              : teil,
    )
    .join('+');
}

/**
 * Kombination auf Handlung.
 *
 * Umgedreht statt bei jedem Tastendruck durchsucht. Die festen
 * Zweitbelegungen kommen zuerst hinein, damit eine eigene Belegung sie
 * überschreiben kann und nicht umgekehrt.
 */
export function bindingLookup(bindings: Record<KeyAction, string>): Record<string, KeyAction> {
  const out: Record<string, KeyAction> = { ...FIXED_ALIASES };
  for (const [action, combo] of Object.entries(bindings) as Array<[KeyAction, string]>) {
    if (combo) out[combo] = action;
  }
  return out;
}

/**
 * Doppelt belegte Kombinationen.
 *
 * Die Oberfläche zeigt sie an, statt sie zu verbieten: wer bewusst zwei
 * Handlungen auf dieselbe Taste legt, bekommt die erste — aber er soll es
 * sehen.
 */
export function conflicts(bindings: Record<KeyAction, string>): Map<string, KeyAction[]> {
  const nach = new Map<string, KeyAction[]>();
  for (const [action, combo] of Object.entries(bindings) as Array<[KeyAction, string]>) {
    if (!combo) continue;
    const liste = nach.get(combo) ?? [];
    liste.push(action);
    nach.set(combo, liste);
  }
  for (const [combo, liste] of [...nach]) if (liste.length < 2) nach.delete(combo);
  return nach;
}

/** Eine gespeicherte Belegung auf die bekannten Handlungen zurechtstutzen. */
export function sanitizeBindings(input: unknown): Record<KeyAction, string> {
  const out = defaultBindings();
  if (!input || typeof input !== 'object') return out;
  for (const [action, combo] of Object.entries(input as Record<string, unknown>)) {
    // Unbekannte Handlungen fliegen raus: sie kämen aus einer älteren oder
    // neueren Fassung und würden hier nur mitgeschleppt.
    if (!(action in out)) continue;
    if (typeof combo !== 'string') continue;
    out[action as KeyAction] = combo;
  }
  return out;
}
