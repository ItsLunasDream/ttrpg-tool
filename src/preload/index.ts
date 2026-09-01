import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, Campaign, Note, NoteType, NoteTypeDef, NoteVersion, OrphanedAsset } from '../shared/types';
import type { PromptCategory } from '../shared/writingPrompts';
import type { AiTask } from '../main/ai/provider';

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
  ai: {
    status: () => invoke<{ provider: string; ready: boolean; detail: string; hasKey: boolean }>('ai:status'),
    setApiKey: (apiKey: string) => invoke<AppSettings>('ai:setApiKey', apiKey),
    ask: (campaignId: string, noteId: string, task: AiTask) =>
      invoke<string>('ai:ask', campaignId, noteId, task)
  },
  prompts: {
    get: () => invoke<PromptCategory[]>('prompts:get'),
    reveal: () => invoke<void>('prompts:reveal')
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
  history: {
    list: (campaignId: string, noteId: string) => invoke<NoteVersion[]>('history:list', campaignId, noteId),
    restore: (campaignId: string, noteId: string, versionId: string) =>
      invoke<Note>('history:restore', campaignId, noteId, versionId)
  },
  assets: {
    /** Bild ueber einen Dateidialog waehlen. Liefert den relativen Verweis. */
    pick: (campaignId: string) => invoke<string | null>('asset:pick', campaignId),
    /** Bild aus Zwischenablage oder Ziehen und Ablegen uebernehmen. */
    save: (campaignId: string, name: string, data: Uint8Array) =>
      invoke<string>('asset:save', campaignId, name, data),
    /** Bilder, auf die keine Notiz und keine gesicherte Fassung mehr verweist. */
    orphans: (campaignId: string) => invoke<OrphanedAsset[]>('asset:orphans', campaignId),
    deleteMany: (campaignId: string, names: string[]) =>
      invoke<number>('asset:deleteMany', campaignId, names)
  },
  exportCampaignZip: (campaignId: string, campaignName: string) =>
    invoke<string | null>('export:campaignZip', campaignId, campaignName),
  exportPdf: {
    campaign: (campaignId: string, name: string) =>
      invoke<{ path: string; count: number } | null>('export:campaignPdf', campaignId, name),
    note: (campaignId: string, noteId: string, title: string) =>
      invoke<{ path: string; count: number } | null>('export:notePdf', campaignId, noteId, title)
  },
  exportMarkdown: {
    campaign: (campaignId: string) =>
      invoke<{ path: string; count: number } | null>('export:campaignMarkdown', campaignId),
    note: (campaignId: string, noteId: string) =>
      invoke<{ path: string; count: number } | null>('export:noteMarkdown', campaignId, noteId)
  },
  openExternal: (url: string) => invoke<void>('shell:openExternal', url)
};

export type BackstoryApi = typeof api;

contextBridge.exposeInMainWorld('api', api);
