/**
 * Tastenbelegung ändern.
 *
 * Aufnehmen statt eintippen: wer ein Kürzel ändern will, drückt es. Ein Feld,
 * in das man „ctrl+shift+g" schreibt, hätte drei Fehlerquellen mehr — Reihenfolge,
 * Schreibweise, Tippfehler — und die Schreibweise ist ohnehin nur intern.
 *
 * Doppelte Belegungen werden angezeigt, nicht verboten. Wer zwei Handlungen auf
 * dieselbe Taste legt, hat einen Grund; er soll nur sehen, dass es so ist.
 */

import { useState, useSyncExternalStore } from 'react';
import {
  EDIT_ACTIONS,
  comboOf,
  conflicts,
  formatCombo,
  isModifierOnly,
  type KeyAction,
} from '@/model/keyBindings';
import { TOOL_SHORTCUTS, type ToolId } from '@/model/toolSettings';
import { allBindings, onBindingsChange, resetBindings, setBinding } from '@/assets/keyBindingStore';
import { useT } from '@/i18n/useT';
import type { StringKey } from '@/i18n';

const TOOL_ACTIONS = (Object.keys(TOOL_SHORTCUTS) as ToolId[]).map(
  (id) => `tool.${id}` as KeyAction,
);

export function KeyBindings() {
  const { t } = useT();
  const bindings = useSyncExternalStore(onBindingsChange, allBindings, allBindings);
  const [recording, setRecording] = useState<KeyAction | null>(null);
  const [notSaved, setNotSaved] = useState(false);
  const doppelt = conflicts(bindings);

  const label = (action: KeyAction): string =>
    action.startsWith('tool.')
      ? t(`tool.${action.slice(5)}` as StringKey)
      : t(`act.${action}` as StringKey);

  /**
   * Die gedrückte Taste übernehmen.
   *
   * `onKeyDown` am Knopf und nicht am Fenster: solange aufgenommen wird, liegt
   * der Fokus auf ihm, und der Werkzeug-Manager kommt nicht zum Zug — sonst
   * schaltete das Drücken von „W" beim Umbelegen zugleich auf die Wand.
   */
  const aufnehmen = (e: React.KeyboardEvent, action: KeyAction) => {
    e.preventDefault();
    e.stopPropagation();
    if (isModifierOnly(e.key)) return;
    if (e.key === 'Escape') {
      setRecording(null);
      return;
    }
    setNotSaved(!setBinding(action, comboOf(e.nativeEvent)));
    setRecording(null);
  };

  const zeile = (action: KeyAction) => {
    const combo = bindings[action] ?? '';
    const clash = combo && doppelt.has(combo);
    return (
      <tr key={action}>
        <th>{label(action)}</th>
        <td>
          <button
            className={`key-cell${recording === action ? ' recording' : ''}${clash ? ' clash' : ''}`}
            onClick={() => setRecording(action)}
            onKeyDown={(e) => (recording === action ? aufnehmen(e, action) : undefined)}
            title={clash ? t('keys.clash') : undefined}
          >
            {recording === action ? t('keys.press') : formatCombo(combo)}
          </button>
        </td>
      </tr>
    );
  };

  return (
    <>
      <h4>{t('keys.title')}</h4>
      <p className="hint">{t('keys.hint')}</p>
      {doppelt.size > 0 ? <p className="warn">{t('keys.clashHint')}</p> : null}
      {notSaved ? <p className="warn">{t('keys.notSaved')}</p> : null}

      <div className="key-columns">
        <div>
          <strong className="sub">{t('keys.tools')}</strong>
          <table className="help-table">
            <tbody>{TOOL_ACTIONS.map(zeile)}</tbody>
          </table>
        </div>
        <div>
          <strong className="sub">{t('keys.editing')}</strong>
          <table className="help-table">
            <tbody>{EDIT_ACTIONS.map((a) => zeile(a))}</tbody>
          </table>
        </div>
      </div>

      <button onClick={() => resetBindings()}>{t('keys.reset')}</button>
    </>
  );
}
