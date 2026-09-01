import { promises as fs } from 'node:fs';
import path from 'node:path';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { Vault, VaultError, writeSettings } from './vault';
import { translate } from '../shared/i18n';
import { zipDirectory } from './export';
import { ALLOWED_IMAGE_EXTENSIONS } from './vault';
import { referencedAssets, renderNoteMarkdown, toFileName } from './markdownExport';
import { exportNotesToPdf } from './pdfExport';
import type { PromptCategory } from '../shared/writingPrompts';
import type { AppSettings, Campaign, Note, NoteType, NoteTypeDef, NoteVersion } from '../shared/types';

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
    vault.setHistoryOptions({
      enabled: context.settings.historyEnabled,
      maxVersions: context.settings.historyMaxVersions
    });
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

  handle<[], PromptCategory[]>('prompts:get', () => vault.readPrompts(context.settings.language));

  handle<[], void>('prompts:reveal', async () => {
    await vault.readPrompts(context.settings.language);
    await shell.showItemInFolder(vault.promptsFile());
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

  handle<[string, string], NoteVersion[]>('history:list', (campaignId, noteId) =>
    vault.listVersions(campaignId, noteId)
  );
  handle<[string, string, string], Note>('history:restore', (campaignId, noteId, versionId) =>
    vault.restoreVersion(campaignId, noteId, versionId)
  );

  /** Bild ueber einen Dateidialog waehlen und in die Kampagne kopieren. */
  handle<[string], string | null>('asset:pick', async (campaignId) => {
    const window = BrowserWindow.getFocusedWindow();
    const options = {
      properties: ['openFile' as const],
      filters: [{ name: 'Bilder', extensions: ALLOWED_IMAGE_EXTENSIONS.map((entry) => entry.slice(1)) }]
    };
    const result = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options);
    if (result.canceled || !result.filePaths[0]) return null;

    const source = result.filePaths[0];
    return vault.saveAsset(campaignId, path.basename(source), await fs.readFile(source));
  });

  /** Bild aus Zwischenablage oder Ziehen und Ablegen uebernehmen. */
  handle<[string, string, Uint8Array], string>('asset:save', (campaignId, name, data) =>
    vault.saveAsset(campaignId, name, data)
  );

  handle<[string], void>('shell:openExternal', async (url) => {
    // Nur http(s) oeffnen, damit ein Link im Text keine beliebigen Handler startet.
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new VaultError('error.externalProtocol');
    }
    await shell.openExternal(parsed.toString());
  });

  /**
   * Schreibt Notizen als lesbares Markdown in einen gewaehlten Ordner. Die
   * benutzten Bilder werden mitkopiert, damit der Export fuer sich steht.
   */
  async function exportMarkdown(campaignId: string, noteIds: string[] | null): Promise<{ path: string; count: number } | null> {
    const window = BrowserWindow.getFocusedWindow();
    const options = { properties: ['openDirectory' as const, 'createDirectory' as const] };
    const chosen = window ? await dialog.showOpenDialog(window, options) : await dialog.showOpenDialog(options);
    if (chosen.canceled || !chosen.filePaths[0]) return null;

    const campaign = await vault.getCampaign(campaignId);
    const allNotes = await vault.listNotes(campaignId);
    const selected = noteIds ? allNotes.filter((note) => noteIds.includes(note.id)) : allNotes;

    const targetDir = path.join(chosen.filePaths[0], sanitizeDirName(campaign.name));
    await fs.mkdir(targetDir, { recursive: true });

    const language = context.settings.language;
    const labels = {
      type: translate(language, 'export.type'),
      relations: translate(language, 'export.relations'),
      mentionedBy: translate(language, 'export.mentionedBy'),
      aliases: translate(language, 'export.aliases'),
      tags: translate(language, 'export.tags')
    };

    const usedNames = new Set<string>();
    const usedAssets = new Set<string>();

    for (const note of selected) {
      const fileName = toFileName(note.title, usedNames);
      usedNames.add(fileName);
      await fs.writeFile(
        path.join(targetDir, fileName),
        renderNoteMarkdown(note, campaign.noteTypes, allNotes, labels),
        'utf8'
      );
      for (const asset of referencedAssets(note, campaign.noteTypes)) usedAssets.add(asset);
    }

    if (usedAssets.size) {
      await fs.mkdir(path.join(targetDir, 'assets'), { recursive: true });
      for (const asset of usedAssets) {
        const fileName = asset.replace(/^assets\//, '');
        try {
          await fs.copyFile(vault.assetFile(campaignId, fileName), path.join(targetDir, 'assets', fileName));
        } catch {
          // Fehlendes Bild darf den Export nicht abbrechen.
        }
      }
    }

    return { path: targetDir, count: selected.length };
  }

  /** Notizen als PDF ausgeben, ueber ein unsichtbares Druckfenster. */
  async function exportPdf(campaignId: string, noteIds: string[] | null, suggestedName: string) {
    const window = BrowserWindow.getFocusedWindow();
    const options = {
      defaultPath: `${slug(suggestedName)}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    };
    const chosen = window ? await dialog.showSaveDialog(window, options) : await dialog.showSaveDialog(options);
    if (chosen.canceled || !chosen.filePath) return null;

    const campaign = await vault.getCampaign(campaignId);
    const allNotes = await vault.listNotes(campaignId);
    const selected = noteIds ? allNotes.filter((note) => noteIds.includes(note.id)) : allNotes;

    const language = context.settings.language;
    await exportNotesToPdf(
      selected,
      {
        types: campaign.noteTypes,
        allNotes,
        labels: {
          type: translate(language, 'export.type'),
          relations: translate(language, 'export.relations'),
          mentionedBy: translate(language, 'export.mentionedBy'),
          aliases: translate(language, 'export.aliases'),
          tags: translate(language, 'export.tags')
        },
        resolveAsset: (relativePath) => vault.assetFile(campaignId, relativePath.replace(/^assets\//, ''))
      },
      chosen.filePath
    );

    return { path: chosen.filePath, count: selected.length };
  }

  handle<[string, string], { path: string; count: number } | null>('export:campaignPdf', (campaignId, name) =>
    exportPdf(campaignId, null, name)
  );
  handle<[string, string, string], { path: string; count: number } | null>('export:notePdf', (campaignId, noteId, title) =>
    exportPdf(campaignId, [noteId], title)
  );

  handle<[string], { path: string; count: number } | null>('export:campaignMarkdown', (campaignId) =>
    exportMarkdown(campaignId, null)
  );
  handle<[string, string], { path: string; count: number } | null>('export:noteMarkdown', (campaignId, noteId) =>
    exportMarkdown(campaignId, [noteId])
  );

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

/** Ordnername aus dem Kampagnennamen, ohne Zeichen, die Dateisysteme stoeren. */
function sanitizeDirName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Kampagne';
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
