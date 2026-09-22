/** Der Zugang zur Bruecke, einmal getippt. */
import type { EncounterApi } from '../preload/index';

declare global {
  interface Window {
    readonly encounter: EncounterApi;
  }
}

export const api = window.encounter;
