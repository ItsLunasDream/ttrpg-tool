/** Zugriff auf die Bruecke aus dem Preload. */
import type { NpcApi } from '../preload/index';

declare global {
  interface Window {
    readonly npc: NpcApi;
  }
}

export const api = window.npc;
