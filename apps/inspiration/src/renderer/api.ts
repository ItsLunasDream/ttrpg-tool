/** Zugriff auf die Bruecke aus dem Preload. */
import type { InspirationApi } from '../preload/index';

declare global {
  interface Window {
    readonly inspiration: InspirationApi;
  }
}

export const api = window.inspiration;
