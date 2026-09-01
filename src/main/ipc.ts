import { promises as fs } from 'node:fs';
import path from 'node:path';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { Vault, VaultError, writeSettings } from './vault';
import { translate } from '../shared/i18n';
import { zipDirectory } from './export';
import type { AppSettings, Campaign, Note, NoteType, NoteTypeDef } from '../shared/types';

export interface IpcContext {
  vault: Vault;
  settingsFile: string;
  settings: AppSettings;
}

/** Fehler aus dem Main-Prozess kommen im Renderer als lesbare Meldung an. */
function makeHandler(context: IpcContext) {
  return function handle<Args extends unknown[], Result>(
    channel: string,
    fn: (...args: Args) => Promise<Result>
  ): void {
    ipcMain.handle(channel, async (_event, ...args) => {
      try {
        return { ok: true as const, value: await fn(...(args as Args)) };
      } catch (error) {
        const language = context.settings.language;
        const message =
          error instanceof VaultError
            ? translate(language, error.key, error.params)
            : translate(language, 'error.unexpected', { detail: String(error) });
        if (!(error instanceof VaultError)) console.error(`[ipc] ${channel}`, error);
        return { ok: false as const, error: message };
      }
    });
  };
}

export function registerIpc(context: IpcContext): void {
  const { vault } = context;
  const handle = makeHandler(context);

  handle<[], AppSettings>('settings:get', async () => context.settings);

  handle<[Partial<AppSettings>], AppSettings>('settings:update', async (patch) => {
    const next: AppSettings = { ...context.settings, ...patch, vaultRoot: context.settings.vaultRoot };
    context.settings = await writeSettings(context.settingsFile, next);
    return context.settings;
  });

  handle<[], AppSettings | null>('settings:chooseVaultRoot', async () => {
    const window = BrowserWindow.getFocusedWindow();
    const result = window
      ? await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] })
      : await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
    if (result.canceled || !result.filePaths[0]) return null;

    const root = result.filePaths[0];
    vault.setRoot(root);
    await vault.init();
    context.settings = await writeSettings(context.settingsFile, {
      ...context.settings,
      vaultRoot: root,
      lastCampaignId: null
    });
    return context.settings;
  });

  handle<[], void>('vault:reveal', async () => {
    await fs.mkdir(vault.vaultRoot, { recursive: true });
    await shell.openPath(vault.vaultRoot);
  });

  handle<[], Campaign[]>('campaign:list', () => vault.listCampaigns());
  handle<[string], Campaign>('campaign:create', (name) => vault.createCampaign(name));
  handle<[string, string], Campaign>('campaign:rename', (id, name) => vault.renameCampaign(id, name));
  handle<[string], void>('campaign:delete', (id) => vault.deleteCampaign(id));
  handle<[string], Campaign>('campaign:get', (id) => vault.getCampaign(id));
  handle<[string, NoteTypeDef[]], Campaign>('campaign:updateNoteTypes', (id, types) =>
    vault.updateNoteTypes(id, types)
  );

  handle<[string], Note[]>('note:list', (campaignId) => vault.listNotes(campaignId));
  handle<[string, NoteType, string], Note>('note:create', (campaignId, type, title) =>
    vault.createNote(campaignId, type, title)
  );
  handle<[string, Note], Note>('note:save', (campaignId, note) => vault.saveNote(campaignId, note));
  handle<[string, string, string], { note: Note; rewritten: number }>('note:rename', (campaignId, noteId, title) =>
    vault.renameNote(campaignId, noteId, title)
  );
  handle<[string, string], void>('note:delete', (campaignId, noteId) => vault.deleteNote(campaignId, noteId));

  handle<[string], void>('shell:openExternal', async (url) => {
    // Nur http(s) oeffnen, damit ein Link im Text keine beliebigen Handler startet.
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new VaultError('error.externalProtocol');
    }
    await shell.openExternal(parsed.toString());
  });

  handle<[string, string], string | null>('export:campaignZip', async (campaignId, campaignName) => {
    const window = BrowserWindow.getFocusedWindow();
    const suggested = `${slug(campaignName)}-${new Date().toISOString().slice(0, 10)}.zip`;
    const options = { defaultPath: suggested, filters: [{ name: 'ZIP-Archiv', extensions: ['zip'] }] };
    const result = window ? await dialog.showSaveDialog(window, options) : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) return null;

    const sourceDir = path.join(vault.vaultRoot, 'campaigns', campaignId);
    await zipDirectory(sourceDir, result.filePath);
    return result.filePath;
  });
}

function slug(name: string): string {
  return (
    name
      .toLocaleLowerCase('de-DE')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'kampagne'
  );
}
