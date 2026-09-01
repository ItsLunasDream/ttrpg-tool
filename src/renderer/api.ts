import type { BackstoryApi } from '../preload/index';

declare global {
  interface Window {
    api: BackstoryApi;
  }
}

export class ApiError extends Error {}

/** Entpackt das IpcResult aus dem Main-Prozess und wirft bei Fehlern. */
export async function call<T>(promise: Promise<{ ok: true; value: T } | { ok: false; error: string }>): Promise<T> {
  const result = await promise;
  if (!result.ok) throw new ApiError(result.error);
  return result.value;
}

export const api = window.api;
