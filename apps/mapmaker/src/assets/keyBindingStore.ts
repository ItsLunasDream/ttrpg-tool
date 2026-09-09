/**
 * Die Tastenbelegung des Benutzers.
 *
 * Liegt neben der Karte, nicht in ihr: eine Belegung gehört dem, der tippt, und
 * soll auf der nächsten Karte wieder da sein. Im Dokument gespeichert wäre sie
 * mit genau einer Karte weitergegeben worden — und ein fremdes Projekt hätte
 * einem die eigenen Tasten umgestellt.
 *
 * Wie bei den Bausteinen ist jeder Zugriff eingefasst: im privaten Fenster
 * wirft `localStorage`, und daran soll kein Tastendruck scheitern.
 */

import {
  defaultBindings,
  sanitizeBindings,
  type KeyAction,
} from '@/model/keyBindings';

const KEY = 'ttrpg-map-editor.keys';
const VERSION = 1;

const listeners = new Set<() => void>();

function laden(): Record<KeyAction, string> {
  try {
    const roh = localStorage.getItem(KEY);
    if (!roh) return defaultBindings();
    const daten = JSON.parse(roh) as { version?: number; bindings?: unknown };
    if (!daten || daten.version !== VERSION) return defaultBindings();
    return sanitizeBindings(daten.bindings);
  } catch {
    return defaultBindings();
  }
}

let bindings = laden();

function melden(): void {
  for (const fn of listeners) fn();
}

/** Falsch heißt: übernommen, aber nicht dauerhaft gesichert. */
function sichern(): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, bindings }));
    return true;
  } catch {
    return false;
  }
}

export function allBindings(): Record<KeyAction, string> {
  return bindings;
}

export function bindingFor(action: KeyAction): string {
  return bindings[action] ?? '';
}

export function setBinding(action: KeyAction, combo: string): boolean {
  bindings = { ...bindings, [action]: combo };
  const ok = sichern();
  melden();
  return ok;
}

export function resetBindings(): void {
  bindings = defaultBindings();
  sichern();
  melden();
}

export function onBindingsChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
