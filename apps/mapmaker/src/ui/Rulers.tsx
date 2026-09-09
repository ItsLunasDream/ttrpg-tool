/**
 * Lineale am Rand der Bühne — und die Hilfslinien, die daraus hervorgehen.
 *
 * **Warum als DOM-Canvas und nicht in Pixi.** Ein Lineal steht *am Rand des
 * Fensters*, nicht auf der Karte: es wandert nicht mit, es zoomt nicht mit, und
 * beim Bild-Export hat es nichts verloren. In der Bühne läge es in
 * Weltkoordinaten und müsste bei jeder Kamerabewegung gegengerechnet werden.
 * Zwei kleine Canvas daneben sind der ehrlichere Ort.
 *
 * Gezeichnet wird nur, wenn sich etwas geändert hat. Ein Lineal, das sechzigmal
 * die Sekunde dieselben Striche malt, ist bei einer großen Karte genau die Art
 * Verschwendung, die man später mühsam sucht.
 */

import { useEffect, useRef } from 'react';
import { getRenderer } from '@/engine/instance';
import { SetGuides } from '@/model/commands';
import { guidesOf } from '@/model/guides';
import { makeId } from '@/model/ids';
import { useEditor } from '@/model/store';
import type { Guide } from '@/model/types';
import { useT } from '@/i18n/useT';

/** Breite der Linealstreifen in Bildschirmpixeln. */
export const RULER_SIZE = 18;

/**
 * Abstand der beschrifteten Striche in Feldern.
 *
 * Gesucht statt gerechnet: die Schrittweite soll auf dem Bildschirm ungefähr
 * gleich weit auseinanderliegen, egal wie weit man herausgezoomt hat. Eine
 * Formel dafür trifft immer nur einen Zoom.
 */
function schrittweite(pixelProFeld: number): number {
  for (const n of [1, 2, 5, 10, 20, 50, 100, 200, 500]) {
    if (n * pixelProFeld >= 60) return n;
  }
  return 1000;
}

/** Die Bühne selbst — daran hängen die Bildschirmkoordinaten der Kamera. */
const buehne = (): HTMLElement | null =>
  document.querySelector<HTMLElement>('.canvas-host canvas');

export function Rulers() {
  const { t } = useT();
  const rulers = useEditor((s) => s.rulers);
  const doc = useEditor((s) => s.doc);
  const rev = useEditor((s) => s.rev);
  const exec = useEditor((s) => s.exec);
  const oben = useRef<HTMLCanvasElement>(null);
  const links = useRef<HTMLCanvasElement>(null);
  /** Die gerade herausgezogene Linie; null heißt: es wird nicht gezogen. */
  const zieht = useRef<{ id: string; axis: 'x' | 'y' } | null>(null);

  // Zeichnen im Bildtakt, aber nur bei Änderung: der Schlüsselvergleich ist
  // dieselbe Vorsichtsmaßnahme wie im Grid-Overlay.
  useEffect(() => {
    if (!rulers) return;
    let laeuft = true;
    let letzterKey = '';

    const zeichne = () => {
      if (!laeuft) return;
      requestAnimationFrame(zeichne);
      const renderer = getRenderer();
      const cOben = oben.current;
      const cLinks = links.current;
      if (!renderer || !cOben || !cLinks) return;
      const cam = renderer.camera;
      const tile = doc.grid.tileSize;
      const breite = cam.viewportWidth;
      const hoehe = cam.viewportHeight;

      const key = [
        Math.round(cam.x),
        Math.round(cam.y),
        cam.zoom.toFixed(4),
        Math.round(breite),
        Math.round(hoehe),
        tile,
        guidesOf(doc).length,
      ].join('|');
      if (key === letzterKey) return;
      letzterKey = key;

      const dpr = window.devicePixelRatio || 1;
      const stelle = (c: HTMLCanvasElement, w: number, h: number) => {
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
          c.width = Math.round(w * dpr);
          c.height = Math.round(h * dpr);
        }
        const g = c.getContext('2d')!;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);
        g.fillStyle = '#191b1f';
        g.fillRect(0, 0, w, h);
        g.strokeStyle = '#3a3f47';
        g.fillStyle = '#8b929c';
        g.font = '9px system-ui, sans-serif';
        return g;
      };

      const pixelProFeld = tile * cam.zoom;
      const schritt = schrittweite(pixelProFeld);

      // Waagerecht
      {
        const g = stelle(cOben, breite, RULER_SIZE);
        const links0 = cam.screenToWorld(0, 0).x / tile;
        const rechts0 = cam.screenToWorld(breite, 0).x / tile;
        g.beginPath();
        for (let f = Math.ceil(links0 / schritt) * schritt; f <= rechts0; f += schritt) {
          const x = Math.round(cam.worldToScreen(f * tile, 0).x) + 0.5;
          g.moveTo(x, RULER_SIZE - 6);
          g.lineTo(x, RULER_SIZE);
          g.fillText(String(f), x + 2, 9);
        }
        g.stroke();
      }

      // Senkrecht — die Zahl liegt gedreht, sonst passt sie nicht auf 18 Pixel.
      {
        const g = stelle(cLinks, RULER_SIZE, hoehe);
        const oben0 = cam.screenToWorld(0, 0).y / tile;
        const unten0 = cam.screenToWorld(0, hoehe).y / tile;
        g.beginPath();
        for (let f = Math.ceil(oben0 / schritt) * schritt; f <= unten0; f += schritt) {
          const y = Math.round(cam.worldToScreen(0, f * tile).y) + 0.5;
          g.moveTo(RULER_SIZE - 6, y);
          g.lineTo(RULER_SIZE, y);
          g.save();
          g.translate(9, y + 2);
          g.rotate(-Math.PI / 2);
          g.fillText(String(f), 0, 0);
          g.restore();
        }
        g.stroke();
      }
    };
    requestAnimationFrame(zeichne);
    return () => {
      laeuft = false;
    };
  }, [rulers, doc, rev]);

  if (!rulers) return null;

  /**
   * Aus dem Lineal ziehen legt eine Hilfslinie an.
   *
   * Die Linie entsteht sofort und wandert mit dem Zeiger; alle Schritte tragen
   * denselben Verschmelzungsschlüssel, also ist es *ein* Rückgängig-Schritt.
   * Landet sie am Ende wieder auf dem Lineal, verschwindet sie — dieselbe
   * Geste wie in Zeichenprogrammen.
   */
  const start = (axis: 'x' | 'y') => (e: React.PointerEvent) => {
    const renderer = getRenderer();
    if (!renderer) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const id = makeId('guide');
    zieht.current = { id, axis };
    bewege(e, id, axis);
  };

  const bewege = (e: React.PointerEvent, id: string, axis: 'x' | 'y') => {
    const renderer = getRenderer();
    const host = buehne();
    if (!renderer || !host) return;
    const r = host.getBoundingClientRect();
    const welt = renderer.camera.screenToWorld(e.clientX - r.left, e.clientY - r.top);
    const pos = axis === 'x' ? welt.x : welt.y;
    const rest = guidesOf(doc).filter((g) => g.id !== id);
    const neu: Guide = { id, axis, pos };
    exec(new SetGuides([...rest, neu], t('cmd.guides'), `guide:${id}`));
  };

  const ende = (e: React.PointerEvent) => {
    const z = zieht.current;
    zieht.current = null;
    if (!z) return;
    const renderer = getRenderer();
    const host = buehne();
    if (!renderer || !host) return;
    const r = host.getBoundingClientRect();
    const innerhalb =
      e.clientX - r.left > RULER_SIZE && e.clientY - r.top > RULER_SIZE;
    if (!innerhalb) {
      exec(new SetGuides(guidesOf(doc).filter((g) => g.id !== z.id), t('cmd.guides'), `guide:${z.id}`));
    }
  };

  return (
    <>
      <canvas
        ref={oben}
        className="ruler ruler-top"
        title={t('guides.showHint')}
        onPointerDown={start('y')}
        onPointerMove={(e) => zieht.current && bewege(e, zieht.current.id, zieht.current.axis)}
        onPointerUp={ende}
      />
      <canvas
        ref={links}
        className="ruler ruler-left"
        title={t('guides.showHint')}
        onPointerDown={start('x')}
        onPointerMove={(e) => zieht.current && bewege(e, zieht.current.id, zieht.current.axis)}
        onPointerUp={ende}
      />
      <div className="ruler-corner" />
    </>
  );
}
