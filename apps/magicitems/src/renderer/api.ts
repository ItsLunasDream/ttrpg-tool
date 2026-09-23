/** Der Zugang zur Bruecke, einmal getippt. */
import type { MagicItemsApi } from '../preload/index';

declare global {
  interface Window {
    readonly magicitems: MagicItemsApi;
  }
}

export const api = window.magicitems;
