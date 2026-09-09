/** Gemeinsames Werkzeug-Interface. */

import type { Point } from '@/model/grid';
import type { Command } from '@/model/commands';
import type { MapDocument } from '@/model/types';
import type { MapRenderer } from '@/engine/renderer';
import type { EditorState } from '@/model/store';

export interface ToolPointerEvent {
  /** Position in Weltkoordinaten. */
  world: Point;
  /** Rohposition auf dem Canvas, für Pan und Gummiband. */
  screen: Point;
  /** Bewegung seit dem letzten Ereignis, in Bildschirmpixeln. */
  deltaScreen: Point;
  button: number;
  buttons: number;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  /** Stiftdruck, 0–1; bei Maus konstant 0.5. */
  pressure: number;
  /**
   * Unterdrückt die Standardaktion des Browsers.
   *
   * Nötig für Werkzeuge, die selbst den Fokus setzen: nach dem Handler zieht
   * der Browser den Fokus sonst auf den Canvas-Container und ein gerade
   * geöffnetes Eingabefeld verliert ihn sofort wieder.
   */
  preventDefault(): void;
}

export interface ToolContext {
  renderer: MapRenderer;
  /** Immer der aktuelle Zustand — nicht zwischenspeichern. */
  get doc(): MapDocument;
  get state(): EditorState;
  exec(cmd: Command): void;
  beginTransaction(): void;
  endTransaction(): void;
  /** Erzwingt ein Neuzeichnen der Werkzeugvorschau. */
  requestRender(): void;
}

export interface Tool {
  readonly cursor: string;
  onPointerDown?(e: ToolPointerEvent, ctx: ToolContext): void;
  /**
   * Doppelklick — als eigener Haken und nicht über `detail` am Druck.
   *
   * `PointerEvent.detail` ist beim Zeigerdruck nicht überall gefüllt, und ein
   * selbstgebauter Zähler aus Zeit und Abstand ginge an den Einstellungen des
   * Systems vorbei. Das `dblclick`-Ereignis weiß, was hier ein Doppelklick
   * ist.
   */
  onDoubleClick?(e: ToolPointerEvent, ctx: ToolContext): void;
  onPointerMove?(e: ToolPointerEvent, ctx: ToolContext): void;
  onPointerUp?(e: ToolPointerEvent, ctx: ToolContext): void;
  /** true = Ereignis verbraucht, der Manager reicht es nicht weiter. */
  onKeyDown?(e: KeyboardEvent, ctx: ToolContext): boolean;
  /** Aufräumen beim Werkzeugwechsel: Vorschauen entfernen, Züge abbrechen. */
  deactivate?(ctx: ToolContext): void;
}
