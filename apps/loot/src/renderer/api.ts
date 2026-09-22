/** Der Zugang zur Bruecke, einmal getippt. */
import type { LootApi } from '../preload/index';

declare global {
  interface Window {
    readonly loot: LootApi;
  }
}

export const api = window.loot;
