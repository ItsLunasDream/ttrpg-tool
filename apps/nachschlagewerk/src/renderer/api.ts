/** Der Zugang zur Bruecke, einmal getippt. */
import type { NachschlagewerkApi } from '../preload/index';

declare global {
  interface Window {
    readonly nachschlagewerk: NachschlagewerkApi;
  }
}

export const api = window.nachschlagewerk;
