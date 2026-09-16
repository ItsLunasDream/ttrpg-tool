/** Der Zugang zur Bruecke, einmal getippt. */
import type { MonsterApi } from '../preload/index';

declare global {
  interface Window {
    readonly monster: MonsterApi;
  }
}

export const api = window.monster;
