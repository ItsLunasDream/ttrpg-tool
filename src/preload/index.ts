import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, Campaign, Note, NoteType, NoteTypeDef } from '../shared/types';

export type IpcResult<T> = { ok: true; value: T } | { ok: false; error: string };

const invoke = <T>(channel: string, ...args: unknown[]): Promise<IpcResult<T>> =>
  ipcRenderer.invoke(channel, ...args) as Promise<IpcResult<T>>;

/**
 * Einzige Bruecke zwischen Renderer und Dateisystem. Der Renderer bekommt
 * bewusst keinen Node-Zugriff (contextIsolation), sondern nur diese Aufrufe.
 */
const api = {
  settings: {
    get: () => invoke<AppSettings>('settings:get'),
    update: (patch: Partial<AppSettings>) => invoke<AppSettings>('settings:update', patch),
    chooseVaultRoot: () => invoke<AppSettings | null>('settings:chooseVaultRoot')
  },
  vault: {
    reveal: () => invoke<void>('vault:reveal')
  },
  campaigns: {
    list: () => invoke<Campaign[]>('campaign:list'),
    create: (name: string) => invoke<Campaign>('campaign:create', name),
    rename: (id: string, name: string) => invoke<Campaign>('campaign:rename', id, name),
    remove: (id: string) => invoke<void>('campaign:delete', id),
    get: (id: string) => invoke<Campaign>('campaign:get', id),
    updateNoteTypes: (id: string, types: NoteTypeDef[]) =>
      invoke<Campaign>('campaign:updateNoteTypes', id, types)
  },
  notes: {
    list: (campaignId: string) => invoke<Note[]>('note:list', campaignId),
    create: (campaignId: string, type: NoteType, title: string) =>
      invoke<Note>('note:create', campaignId, type, title),
    save: (campaignId: string, note: Note) => invoke<Note>('note:save', campaignId, note),
    rename: (campaignId: string, noteId: string, title: string) =>
      invoke<{ note: Note; rewritten: number }>('note:rename', campaignId, noteId, title),
    remove: (campaignId: string, noteId: string) => invoke<void>('note:delete', campaignId, noteId)
  },
  exportCampaignZip: (campaignId: string, campaignName: string) =>
    invoke<string | null>('export:campaignZip', campaignId, campaignName),
  openExternal: (url: string) => invoke<void>('shell:openExternal', url)
};

export type BackstoryApi = typeof api;

contextBridge.exposeInMainWorld('api', api);
