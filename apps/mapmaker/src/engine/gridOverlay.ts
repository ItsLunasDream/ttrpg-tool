/**
 * Grid-Overlay.
 *
 * Gezeichnet wird nur, was gerade im Bild ist. Bei 150×150 Hex-Zellen wären das
 * sonst 22 500 Sechsecke pro Neuzeichnung — sichtbar ruckelig beim Zoomen.
 */

import { Graphics } from 'pixi.js';
import { cellCorners, cellStride, mapPixelSize } from '@/model/grid';
import type { GridSettings } from '@/model/types';
import type { Camera } from './camera';

export class GridOverlay {
  readonly view = new Graphics();

  private lastKey = '';

  /**
   * Zeichnet neu, wenn sich Einstellungen oder Ausschnitt geändert haben.
   * Der Schlüsselvergleich verhindert Neuzeichnen bei jedem Frame.
   */
  update(
    grid: GridSettings,
    size: { cols: number; rows: number },
    camera: Camera,
    force = false,
  ): void {
    if (!grid.visible || grid.opacity <= 0) {
      if (this.view.visible) {
        this.view.visible = false;
        this.view.clear();
        this.lastKey = '';
      }
      return;
    }
    this.view.visible = true;

    const b = camera.visibleBounds(grid.tileSize * 2);
    // Auf Zellraster gerundet, damit kleine Kamerabewegungen nichts auslösen.
    const q = grid.tileSize;
    const key = [
      grid.type,
      grid.tileSize,
      grid.color,
      grid.lineWidth,
      grid.offsetX,
      grid.offsetY,
      size.cols,
      size.rows,
      Math.floor(b.minX / q),
      Math.floor(b.minY / q),
      Math.ceil(b.maxX / q),
      Math.ceil(b.maxY / q),
      camera.zoom.toFixed(3),
    ].join('|');
    if (!force && key === this.lastKey) {
      this.view.alpha = grid.opacity;
      return;
    }
    this.lastKey = key;

    this.view.clear();
    this.view.alpha = grid.opacity;

    // Linienstärke gegen den Zoom kompensieren, sonst verschwindet das Grid
    // beim Herauszoomen und wird beim Hineinzoomen zum Balken.
    const width = Math.max(0.4, grid.lineWidth / camera.zoom);
    const stroke = { width, color: grid.color, alpha: 1 } as const;

    if (grid.type === 'square') {
      this.drawSquare(grid, size, b, stroke);
    } else {
      this.drawHex(grid, size, b, stroke);
    }
  }

  private drawSquare(
    grid: GridSettings,
    size: { cols: number; rows: number },
    b: { minX: number; minY: number; maxX: number; maxY: number },
    stroke: { width: number; color: number; alpha: number },
  ): void {
    const map = mapPixelSize(grid, size);
    const t = grid.tileSize;
    const x0 = grid.offsetX;
    const y0 = grid.offsetY;

    const startCol = Math.max(0, Math.floor((b.minX - x0) / t));
    const endCol = Math.min(size.cols, Math.ceil((b.maxX - x0) / t));
    const startRow = Math.max(0, Math.floor((b.minY - y0) / t));
    const endRow = Math.min(size.rows, Math.ceil((b.maxY - y0) / t));

    const top = y0 + Math.max(0, startRow) * t;
    const bottom = y0 + Math.min(size.rows, endRow) * t;
    const left = x0 + Math.max(0, startCol) * t;
    const right = x0 + Math.min(size.cols, endCol) * t;

    for (let c = startCol; c <= endCol; c++) {
      const x = x0 + c * t;
      this.view.moveTo(x, Math.max(y0, top)).lineTo(x, Math.min(y0 + map.height, bottom));
    }
    for (let r = startRow; r <= endRow; r++) {
      const y = y0 + r * t;
      this.view.moveTo(Math.max(x0, left), y).lineTo(Math.min(x0 + map.width, right), y);
    }
    this.view.stroke(stroke);
  }

  private drawHex(
    grid: GridSettings,
    size: { cols: number; rows: number },
    b: { minX: number; minY: number; maxX: number; maxY: number },
    stroke: { width: number; color: number; alpha: number },
  ): void {
    const stride = cellStride(grid);

    const startCol = Math.max(0, Math.floor((b.minX - grid.offsetX) / stride.x) - 1);
    const endCol = Math.min(size.cols - 1, Math.ceil((b.maxX - grid.offsetX) / stride.x) + 1);
    const startRow = Math.max(0, Math.floor((b.minY - grid.offsetY) / stride.y) - 1);
    const endRow = Math.min(size.rows - 1, Math.ceil((b.maxY - grid.offsetY) / stride.y) + 1);

    // Notbremse: bei extremem Herauszoomen wird das Grid unlesbar und teuer.
    const cells = (endCol - startCol + 1) * (endRow - startRow + 1);
    if (cells > 20000) return;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const corners = cellCorners(grid, { col: c, row: r });
        this.view.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) this.view.lineTo(corners[i].x, corners[i].y);
        this.view.closePath();
      }
    }
    this.view.stroke(stroke);
  }

  destroy(): void {
    this.view.destroy();
  }
}
