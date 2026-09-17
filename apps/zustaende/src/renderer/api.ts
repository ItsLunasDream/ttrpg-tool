/** Der Zugang zur Bruecke, einmal getippt. */
import type { ZustaendeApi } from '../preload/index';

declare global {
  interface Window {
    readonly zustaende: ZustaendeApi;
  }
}

export const api = window.zustaende;
