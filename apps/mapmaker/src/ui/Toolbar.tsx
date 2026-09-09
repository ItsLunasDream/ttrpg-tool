/** Werkzeugleiste. */

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useEditor } from '@/model/store';
import { documentPixelSize } from '@/model/document';
import { getRenderer } from '@/engine/instance';
import { type ToolId } from '@/model/toolSettings';
import { formatCombo } from '@/model/keyBindings';
import { allBindings, onBindingsChange } from '@/assets/keyBindingStore';
import { useT } from '@/i18n/useT';
import type { StringKey } from '@/i18n';
import { FileMenu } from './FileMenu';
import { HelpDialog } from './HelpDialog';

const TOOLS: Array<{ id: ToolId; icon: string; name: StringKey; hint: StringKey }> = [
  { id: 'select', icon: '⬚', name: 'tool.select', hint: 'tool.select.hint' },
  // ✥ wäre das Vier-Wege-Kreuz und liest sich überall als „verschieben" —
  // in der Symbolansicht war es vom Auswahl-Werkzeug nicht zu trennen.
  { id: 'prop', icon: '❖', name: 'tool.prop', hint: 'tool.prop.hint' },
  { id: 'brush', icon: '❉', name: 'tool.brush', hint: 'tool.brush.hint' },
  { id: 'stamp', icon: '⧉', name: 'tool.stamp', hint: 'tool.stamp.hint' },
  { id: 'draw', icon: '✎', name: 'tool.draw', hint: 'tool.draw.hint' },
  { id: 'erase', icon: '⌫', name: 'tool.erase', hint: 'tool.erase.hint' },
  { id: 'text', icon: 'T', name: 'tool.text', hint: 'tool.text.hint' },
  { id: 'terrain', icon: '▨', name: 'tool.terrain', hint: 'tool.terrain.hint' },
  { id: 'wall', icon: '▙', name: 'tool.wall', hint: 'tool.wall.hint' },
  { id: 'room', icon: '▭', name: 'tool.room', hint: 'tool.room.hint' },
  { id: 'door', icon: '⊓', name: 'tool.door', hint: 'tool.door.hint' },
  { id: 'window', icon: '⊟', name: 'tool.window', hint: 'tool.window.hint' },
  { id: 'light', icon: '☀', name: 'tool.light', hint: 'tool.light.hint' },
  { id: 'note', icon: '⚑', name: 'tool.note', hint: 'tool.note.hint' },
  { id: 'height', icon: '⛰', name: 'tool.height', hint: 'tool.height.hint' },
  { id: 'region', icon: '⬡', name: 'tool.region', hint: 'tool.region.hint' },
  { id: 'route', icon: '⤳', name: 'tool.route', hint: 'tool.route.hint' },
  { id: 'measure', icon: '📏', name: 'tool.measure', hint: 'tool.measure.hint' },
  { id: 'pan', icon: '✋', name: 'tool.pan', hint: 'tool.pan.hint' },
];

/**
 * Das Kürzel eines Werkzeugs, wie es gerade belegt ist.
 *
 * Zog die Leiste früher aus einer eigenen Liste — die stimmte mit der wirklich
 * wirksamen Belegung nur zufällig überein und ging spätestens beim Umbelegen
 * auseinander.
 */
function useKuerzel(): (id: ToolId) => string {
  const bindings = useSyncExternalStore(onBindingsChange, allBindings, allBindings);
  return (id) => formatCombo(bindings[`tool.${id}`] ?? '');
}

export function Toolbar() {
  const { t, language } = useT();
  const kuerzel = useKuerzel();
  const tool = useEditor((s) => s.tool);
  const setTool = useEditor((s) => s.setTool);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const history = useEditor((s) => s.history);
  const rev = useEditor((s) => s.rev);
  const doc = useEditor((s) => s.doc);
  const setZoom = useEditor((s) => s.setZoom);
  const [showHelp, setShowHelp] = useState(false);
  const [compact, setCompact] = useState(false);
  /** Werkzeug unter dem Zeiger und wo sein Knopf sitzt; null heißt: keiner. */
  const [hint, setHint] = useState<{ id: ToolId; left: number; top: number } | null>(null);
  const hintTimer = useRef<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  /** Breite der Leiste mit vollen Beschriftungen; 0 heißt „noch nicht gemessen". */
  const naturalWidth = useRef(0);
  /** Dieselbe Messung, aber ohne die Beschriftungen. */
  const compactWidth = useRef(0);

  // rev lesen, damit sich die Undo-Beschriftungen mit dem Verlauf aktualisieren.
  void rev;

  const fit = () => {
    const r = getRenderer();
    if (!r) return;
    const { width, height } = documentPixelSize(doc);
    r.camera.fit(width, height);
    setZoom(r.camera.zoom);
  };

  const zoomBy = (factor: number) => {
    const r = getRenderer();
    if (!r) return;
    r.camera.zoomAt(r.camera.viewportWidth / 2, r.camera.viewportHeight / 2, factor);
    setZoom(r.camera.zoom);
  };

  /**
   * Wird es eng, zeigen die Werkzeuge nur noch ihr Symbol.
   *
   * Die Leiste scrollt zwar waagerecht, aber dann liegen Einpassen und Hilfe
   * außerhalb des Bildes und werden schlicht nicht gefunden.
   *
   * Gekürzt wird nur, wenn es auch hilft: passt die Leiste selbst ohne
   * Beschriftungen nicht, bleiben sie stehen — dann wird ohnehin gescrollt, und
   * beim Scrollen sind Wörter nützlicher als nackte Symbole. „⊓" und „⊟"
   * auseinanderzuhalten gelingt sonst niemandem.
   *
   * Beide Breiten stammen aus derselben Messung im ungekürzten Zustand. Aus dem
   * jeweils aktuellen Zustand zu messen ließe die Leiste pendeln: ohne
   * Beschriftungen passt sie ja wieder, also würde sofort wieder ausgeklappt.
   */
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const decide = () => {
      // Im ungekürzten Zustand einmal beide Maße nehmen.
      if (naturalWidth.current === 0) {
        naturalWidth.current = el.scrollWidth;
        let labels = 0;
        for (const label of el.querySelectorAll('button > .label')) {
          labels += label.getBoundingClientRect().width;
        }
        compactWidth.current = el.scrollWidth - labels;
      }
      const room = el.clientWidth;
      setCompact(naturalWidth.current > room && compactWidth.current <= room);
    };

    decide();
    const observer = new ResizeObserver(decide);
    observer.observe(el);
    return () => observer.disconnect();
  }, [language]);

  // Andere Sprache heißt andere Wortlängen — neu messen.
  useLayoutEffect(() => {
    naturalWidth.current = 0;
    setCompact(false);
  }, [language]);

  /**
   * Hinweis beim Überfahren.
   *
   * Statt des eingebauten `title`: das erscheint erst nach rund einer Sekunde,
   * sieht auf jedem System anders aus und lässt sich nicht unter dem Knopf
   * platzieren. Bei fünfzehn Werkzeugen, die auf Symbole gekürzt sind, ist der
   * Name aber genau das, was man beim Suchen braucht.
   *
   * Die kurze Verzögerung ist Absicht: ohne sie flackert bei jedem Streifen
   * über die Leiste ein Kästchen nach dem anderen auf.
   */
  const zeigeHinweis = (id: ToolId, el: HTMLElement) => {
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
    const r = el.getBoundingClientRect();
    hintTimer.current = window.setTimeout(() => {
      setHint({ id, left: Math.round(r.left + r.width / 2), top: Math.round(r.bottom + 6) });
    }, 260);
  };

  const versteckeHinweis = () => {
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
    hintTimer.current = null;
    setHint(null);
  };

  // Beim Verlassen der Seite darf kein Zeitgeber überleben.
  useEffect(() => () => {
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
  }, []);

  // F1 ist die Taste, die jeder für Hilfe versucht.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="toolbar" ref={barRef}>
      {/*
        Kein Titel mehr: er stand fest im Bild und nahm der Leiste die Breite,
        die die Werkzeuge brauchen. Wie das Programm heißt, steht im Fenstertitel.
      */}
      <FileMenu />
      <span className="sep" />

      {TOOLS.map((entry) => (
        <button
          key={entry.id}
          className={`tool${tool === entry.id ? ' active' : ''}`}
          aria-label={t(entry.name)}
          onClick={() => setTool(entry.id)}
          onMouseEnter={(e) => zeigeHinweis(entry.id, e.currentTarget)}
          onFocus={(e) => zeigeHinweis(entry.id, e.currentTarget)}
          onMouseLeave={versteckeHinweis}
          onBlur={versteckeHinweis}
        >
          {entry.icon}
          {compact ? null : <span className="label"> {t(entry.name)}</span>}
          {/*
            Das Kürzel sitzt in der Ecke des Knopfes und nicht daneben: neben
            dem Symbol kostete es bei fünfzehn Werkzeugen rund hundertachtzig
            Pixel, und genau die hat die Leiste nicht. So kostet es keine.
          */}
          {compact ? <span className="shortcut">{kuerzel(entry.id)}</span> : null}
        </button>
      ))}

      <span className="sep" />

      <button
        className="icon"
        disabled={!history.canUndo}
        title={
          history.undoLabel
            ? t('toolbar.undoOf', { label: history.undoLabel })
            : t('toolbar.undo')
        }
        onClick={undo}
      >
        ↶
      </button>
      <button
        className="icon"
        disabled={!history.canRedo}
        title={
          history.redoLabel
            ? t('toolbar.redoOf', { label: history.redoLabel })
            : t('toolbar.redo')
        }
        onClick={redo}
      >
        ↷
      </button>

      <span className="sep" />

      <button className="icon" title={t('toolbar.zoomOut')} onClick={() => zoomBy(1 / 1.3)}>
        −
      </button>
      <button className="icon" title={t('toolbar.zoomIn')} onClick={() => zoomBy(1.3)}>
        ＋
      </button>
      <button title={t('toolbar.fitHint')} onClick={fit}>
        {t('toolbar.fit')}
      </button>

      <span className="spacer" />
      <span className="hint map-name">{doc.meta.name}</span>
      <button title={t('toolbar.helpHint')} onClick={() => setShowHelp(true)}>
        ? {t('toolbar.help')}
      </button>

      {showHelp ? <HelpDialog onClose={() => setShowHelp(false)} /> : null}

      {/*
        Am body und nicht in der Leiste: die scrollt waagerecht und schneidet
        darum senkrecht ab — dasselbe, was das Datei-Menü unsichtbar machte.
      */}
      {hint
        ? createPortal(
            <div className="tool-hint" style={{ left: hint.left, top: hint.top }}>
              {t(TOOLS.find((x) => x.id === hint.id)!.name)}
              <span className="tool-hint-key">{kuerzel(hint.id)}</span>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
