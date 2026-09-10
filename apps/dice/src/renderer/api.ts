/** Zugriff auf die Bruecke aus dem Preload. */
import type { DiceApi } from '../preload/index';

declare global {
  interface Window {
    readonly dice: DiceApi;
  }
}

export const api = window.dice;
