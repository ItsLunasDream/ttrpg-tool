/** Zugriff auf die Bruecke aus dem Preload. */
import type { InitiativeApi } from '../preload/index';

declare global {
  interface Window {
    readonly initiative: InitiativeApi;
  }
}

export const api = window.initiative;
