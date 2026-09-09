/** Ansicht verschieben. Auch aktiv, während Leertaste oder mittlere Maustaste gehalten wird. */

import type { Tool, ToolContext, ToolPointerEvent } from './types';

export class PanTool implements Tool {
  readonly cursor = 'grab';

  private panning = false;

  onPointerDown(e: ToolPointerEvent): void {
    if (e.button === 0 || e.button === 1) this.panning = true;
  }

  onPointerMove(e: ToolPointerEvent, ctx: ToolContext): void {
    if (!this.panning) return;
    ctx.renderer.camera.panByScreen(e.deltaScreen.x, e.deltaScreen.y);
    ctx.requestRender();
  }

  onPointerUp(): void {
    this.panning = false;
  }

  deactivate(): void {
    this.panning = false;
  }
}
