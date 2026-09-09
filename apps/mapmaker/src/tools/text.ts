/**
 * Textwerkzeug.
 *
 * Getippt wird in einem echten <textarea> über dem Canvas statt in einem
 * nachgebauten Editor — damit funktionieren Cursor, Auswahl, Zwischenablage und
 * Umlaut-Eingabe so, wie man es erwartet. Erst beim Abschließen entsteht ein
 * Modellobjekt.
 */

import { AddObjects, PatchObjects, RemoveObjects } from '@/model/commands';
import { canHoldObjects } from '@/model/document';
import { t } from '@/i18n';
import { toHex } from '@/model/color';
import { pickObject } from '@/engine/hitTest';
import type { ObjectId, TextObject } from '@/model/types';
import { createText } from './factory';
import type { Tool, ToolContext, ToolPointerEvent } from './types';

export class TextTool implements Tool {
  readonly cursor = 'text';

  private input: HTMLTextAreaElement | null = null;
  /** Gesetzt, wenn ein vorhandener Text bearbeitet statt ein neuer angelegt wird. */
  private editingId: ObjectId | null = null;
  private anchor = { x: 0, y: 0 };

  onPointerDown(e: ToolPointerEvent, ctx: ToolContext): void {
    if (e.button !== 0) return;

    // Ohne das zieht der Browser den Fokus direkt nach dem Handler auf den
    // Canvas-Container und das eben geöffnete Feld verliert ihn wieder.
    e.preventDefault();

    // Laufende Eingabe zuerst abschließen — ein Klick woanders heißt „fertig".
    if (this.input) {
      this.commit(ctx);
      return;
    }
    if (!canHoldObjects(ctx.doc, ctx.state.activeLayerId)) {
      ctx.state.setStatusMessage(t('status.layerLockedText'));
      return;
    }

    const hit = pickObject(ctx.doc, e.world, ctx.renderer.textMetrics);
    if (hit && hit.kind === 'text') {
      this.beginEdit(ctx, hit);
      return;
    }

    this.editingId = null;
    this.anchor = { ...e.world };
    this.openInput(ctx, '', null);
  }

  /**
   * Vorhandenen Text bearbeiten, ohne dass vorher geklickt wurde.
   *
   * Öffentlich, weil das Auswahl-Werkzeug beim Doppelklick hierher
   * durchreicht: einen zweiten Editor daneben zu bauen hieße, Fokus,
   * Zwischenablage und Abbruch ein zweites Mal richtig hinzubekommen.
   */
  beginEdit(ctx: ToolContext, obj: TextObject): void {
    if (this.input) this.commit(ctx);
    this.editingId = obj.id;
    this.anchor = { x: obj.x, y: obj.y };
    this.openInput(ctx, obj.text, obj);
  }

  /** Läuft gerade eine Eingabe? Das Auswahl-Werkzeug fragt danach. */
  get editing(): boolean {
    return this.input !== null;
  }

  onKeyDown(e: KeyboardEvent, ctx: ToolContext): boolean {
    if (!this.input) return false;
    if (e.key === 'Escape') {
      this.cancel(ctx);
      return true;
    }
    return false;
  }

  deactivate(ctx: ToolContext): void {
    if (this.input) this.commit(ctx);
  }

  // -------------------------------------------------------------------------

  private openInput(ctx: ToolContext, initial: string, existing: TextObject | null): void {
    const host = ctx.renderer.app.canvas.parentElement;
    if (!host) return;

    const s = ctx.state.text;
    const style = existing ?? s;
    const zoom = ctx.renderer.camera.zoom;
    const screen = ctx.renderer.camera.worldToScreen(this.anchor.x, this.anchor.y);

    const input = document.createElement('textarea');
    input.className = 'text-input';
    input.value = initial;
    input.rows = 1;
    input.cols = 1;
    input.spellcheck = false;

    // Auf Bildschirmgröße skaliert, damit die Eingabe so groß aussieht wie das
    // spätere Ergebnis — sonst tippt man blind in der falschen Größe.
    Object.assign(input.style, {
      position: 'absolute',
      left: `${screen.x}px`,
      top: `${screen.y}px`,
      transform: 'translate(-50%, -50%)',
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize * zoom}px`,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      lineHeight: String(style.lineHeight),
      letterSpacing: `${style.letterSpacing * zoom}px`,
      color: toHex(style.color),
      textAlign: style.align,
    } as Partial<CSSStyleDeclaration>);

    host.appendChild(input);
    this.input = input;

    // Beim Bearbeiten das Original ausblenden, sonst steht der Text doppelt da.
    // Über den Renderer und nicht über einen Befehl: „während der Eingabe
    // versteckt" ist kein Zustand der Karte. Als Befehl stand die Deckkraft 0
    // im Verlauf, und ein Rückgängig nach dem Umbenennen hielt genau dort an —
    // alter Text, unsichtbar.
    if (existing) ctx.renderer.setObjectHidden(existing.id, true);

    const autoGrow = () => {
      // Erst auf null zusammenziehen, dann messen. Ohne das liefert scrollWidth
      // die Standardbreite eines textarea (cols=20, rund 180 px) statt der
      // Textbreite — und weil die Box um ihre eigene halbe Breite zentriert
      // wird, säße sie beim Tippen sichtbar zu weit links.
      input.style.width = '0px';
      input.style.height = '0px';
      input.style.width = `${Math.max(16, input.scrollWidth + 2)}px`;
      input.style.height = `${input.scrollHeight}px`;
    };
    autoGrow();
    input.addEventListener('input', autoGrow);
    input.addEventListener('keydown', (ev) => {
      // Enter bricht die Zeile um; abgeschlossen wird mit Strg+Enter.
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault();
        this.commit(ctx);
      }
      ev.stopPropagation();
    });
    input.focus();
    input.select();

    // Blur-Handler bewusst erst im nächsten Task anhängen: fokussiert der
    // Browser unmittelbar nach dem Klick noch etwas anderes, würde die Eingabe
    // sonst geschlossen, bevor überhaupt ein Zeichen ankommt.
    setTimeout(() => {
      if (this.input !== input) return;
      if (document.activeElement !== input) input.focus();
      input.addEventListener('blur', () => this.commit(ctx));
    }, 0);
  }

  private closeInput(): string {
    const value = this.input?.value ?? '';
    const input = this.input;
    this.input = null;
    // Erst abmelden, dann entfernen: `remove()` wirft in Chromium, wenn der
    // Knoten inzwischen nicht mehr am gemerkten Elternteil hängt — und das
    // kommt vor, sobald React den Host neu aufbaut, während die Eingabe offen
    // ist. Ein Werkzeugwechsel im falschen Moment riss damit den Editor ab.
    input?.parentNode?.removeChild(input);
    return value;
  }

  private commit(ctx: ToolContext): void {
    if (!this.input) return;
    const text = this.closeInput().replace(/\s+$/, '');
    const editingId = this.editingId;
    this.editingId = null;

    if (editingId) {
      ctx.renderer.setObjectHidden(editingId, false);
      const existing = ctx.doc.objects[editingId];
      if (!existing || existing.kind !== 'text') return;
      if (!text) {
        ctx.exec(new RemoveObjects([editingId], t('cmd.removeText')));
        return;
      }
      if (text !== existing.text) {
        ctx.exec(new PatchObjects({ [editingId]: { text } }, t('cmd.editText')));
      }
      ctx.state.setSelection([editingId]);
      return;
    }

    if (!text) return;
    const obj = createText(
      ctx.doc,
      ctx.state.activeLayerId,
      ctx.state.text,
      this.anchor.x,
      this.anchor.y,
      text,
    );
    ctx.exec(new AddObjects([obj], t('cmd.addText')));
    ctx.state.setSelection([obj.id]);
  }

  private cancel(ctx: ToolContext): void {
    const editingId = this.editingId;
    this.closeInput();
    this.editingId = null;
    // Abbrechen hinterlässt nichts im Verlauf: es ist nichts geschehen.
    if (editingId) ctx.renderer.setObjectHidden(editingId, false);
  }
}
