/** Mountet Pixi-Bühne und Werkzeug-Manager. */

import { useEffect, useRef } from 'react';
import { MapRenderer } from '@/engine/renderer';
import { setRenderer } from '@/engine/instance';
import { ToolManager } from '@/tools/manager';
import { Rulers } from './Rulers';

/**
 * Bühne und Werkzeug-Manager leben außerhalb des React-Baums.
 *
 * Grund: bei jedem Hot-Reload und bei jedem Neu-Mounten würde sonst der
 * WebGL-Kontext weggeworfen und asynchron neu aufgebaut — der Canvas wäre
 * dazwischen sichtbar verschwunden. Der Manager wird beim Wiedereinhängen
 * dagegen ersetzt, sonst sammeln sich doppelte Ereignis-Listener an und jeder
 * Klick löst seine Aktion mehrfach aus.
 */
let shared: { renderer: MapRenderer; manager: ToolManager } | null = null;

export function CanvasHost({ onReady }: { onReady?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    const wire = (renderer: MapRenderer) => {
      shared?.manager.detach();
      renderer.attachTo(host);
      setRenderer(renderer);

      const manager = new ToolManager(renderer, host);
      manager.attach();
      shared = { renderer, manager };
      onReady?.();
    };

    if (shared) {
      wire(shared.renderer);
    } else {
      const renderer = new MapRenderer();
      renderer
        .init(host)
        .then(() => {
          if (cancelled) {
            renderer.destroy();
            return;
          }
          wire(renderer);
        })
        .catch((err) => {
          console.error('[canvas] Bühne konnte nicht starten:', err);
        });
    }

    return () => {
      cancelled = true;
      shared?.manager.detach();
    };
    // Bewusst nur einmal: die Bühne überlebt Rerender und Hot-Reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Die Lineale liegen als Geschwister daneben, nicht als Kinder darin.
   *
   * In den Host hinein dürfen sie nicht: dort hängt der Pixi-Canvas, den React
   * nicht kennt — React würde beim Einfügen eigener Knoten an dessen
   * Reihenfolge rühren. Der Rahmen darum ist der Bezugspunkt für beide.
   */
  return (
    <div className="stage-wrap">
      <div className="canvas-host" ref={hostRef} tabIndex={-1} />
      <Rulers />
    </div>
  );
}
