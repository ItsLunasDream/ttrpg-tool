import { promises as fs } from 'node:fs';
import path from 'node:path';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import { Vault, VaultError, writeSettings } from './vault';
import { translate } from '../shared/i18n';
import { zipDirectory } from './export';
import { ALLOWED_IMAGE_EXTENSIONS } from './vault';
import { referencedAssets, renderNoteMarkdown, toFileName } from './markdownExport';
import { exportNotesToPdf } from './pdfExport';
import type { PromptCategory } from '../shared/writingPrompts';
import { askProvider, createProvider, decryptSecret, encryptSecret, AiError } from './ai';
import type { AiMessage, AiTask } from './ai/provider';
import { findNoteType } from '../shared/noteTypes';
import { findWikiLinks, normalizeName } from '../shared/wikilinks';
import type {
  AppSettings,
  Campaign,
  GraphPosition,
  Note,
  NoteType,
  NoteTypeDef,
  NoteVersion,
  OrphanedAsset,
  UnreadableNote
} from '../shared/types';

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

/** Wie makeHandler, reicht aber das IPC-Ereignis durch, etwa fuer Teilantworten. */
function makeEventHandler(context: IpcContext) {
  return function handle<Args extends unknown[], Result>(
    channel: string,
    fn: (event: IpcMainInvokeEvent, ...args: Args) => Promise<Result>
  ): void {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        return { ok: true as const, value: await fn(event, ...(args as Args)) };
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
  const handleWithEvent = makeEventHandler(context);

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
  handle<[string, Record<string, GraphPosition>], Campaign>('campaign:graphPositions', (id, positions) =>
    vault.saveGraphPositions(id, positions)
  );
  handle<[string, NoteTypeDef[]], Campaign>('campaign:updateNoteTypes', (id, types) =>
    vault.updateNoteTypes(id, types)
  );

  handle<[string], Note[]>('note:list', (campaignId) => vault.listNotes(campaignId));
  handle<[string], UnreadableNote[]>('note:unreadable', (campaignId) => vault.findUnreadableNotes(campaignId));
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

  // --- KI-Assistent --------------------------------------------------------

  handle<[], { provider: string; ready: boolean; detail: string; hasKey: boolean }>('ai:status', async () => {
    const provider = createProvider(context.settings, decryptSecret(context.settings.claudeApiKeyEncrypted));
    const hasKey = Boolean(context.settings.claudeApiKeyEncrypted);

    if (!provider) return { provider: 'none', ready: false, detail: '', hasKey };

    const status = await provider.check();
    return {
      provider: provider.id,
      ready: status.ready,
      // Der Grund wird hier uebersetzt, wo die eingestellte Sprache bekannt ist.
      detail: status.ready ? status.detail : translate(context.settings.language, status.key, status.params),
      hasKey
    };
  });

  /** Der Schluessel wird verschluesselt abgelegt und nie zurueckgegeben. */
  handle<[string], AppSettings>('ai:setApiKey', async (apiKey) => {
    const encrypted = encryptSecret(apiKey.trim());
    if (encrypted === null) throw new VaultError('error.noSecureStorage');

    context.settings = await writeSettings(context.settingsFile, {
      ...context.settings,
      claudeApiKeyEncrypted: encrypted
    });
    return context.settings;
  });

  handleWithEvent<[string, string, AiTask, string, AiMessage[], string], string>(
    'ai:ask',
    async (event, campaignId, noteId, task, streamId, history, followUp) => {
      const provider = createProvider(context.settings, decryptSecret(context.settings.claudeApiKeyEncrypted));
      if (!provider) throw new VaultError('error.noAiProvider');

      const campaign = await vault.getCampaign(campaignId);
      const notes = await vault.listNotes(campaignId);
      const note = notes.find((entry) => entry.id === noteId);
      if (!note) throw new VaultError('error.noteMissing');

      try {
        return await askProvider(
          provider,
          {
            task,
            language: context.settings.language,
            note: describeNote(note, campaign.noteTypes),
            context: describeLinkedNotes(note, notes, campaign.noteTypes),
            // Der Verlauf wird begrenzt, sonst waechst jede Rueckfrage die
            // Anfrage weiter auf und kostet mehr, ohne besser zu werden.
            history: history.slice(-8),
            followUp
          },
          // Teiltexte gehen als eigenes Ereignis an genau das Fenster, das
          // gefragt hat. Die Kennung ordnet sie der laufenden Anfrage zu.
          (chunk) => {
            if (!event.sender.isDestroyed()) event.sender.send('ai:chunk', streamId, chunk);
          }
        );
      } catch (error) {
        if (error instanceof AiError) throw new VaultError(error.key, error.params);
        throw error;
      }
    }
  );

  handle<[string], OrphanedAsset[]>('asset:orphans', (campaignId) => vault.listOrphanedAssets(campaignId));
  handle<[string, string[]], number>('asset:deleteMany', (campaignId, names) =>
    vault.deleteAssets(campaignId, names)
  );

  handle<[string], void>('shell:openExternal', async (url) => {
    // Nur diese drei oeffnen, damit ein Link im Text keine beliebigen Handler
    // startet. mailto gehoert dazu, seit der Editor solche Links kennt.
    const parsed = new URL(url);
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
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
      tags: translate(language, 'export.tags'),
      yes: translate(language, 'field.yes'),
      no: translate(language, 'field.no')
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
          tags: translate(language, 'export.tags'),
          yes: translate(language, 'field.yes'),
          no: translate(language, 'field.no')
        },
        // Ein einzelner kaputter Verweis darf den ganzen Export nicht
        // abbrechen. Ein leerer Pfad ergibt nur ein fehlendes Bild.
        resolveAsset: (relativePath) => {
          try {
            return vault.assetFile(campaignId, relativePath.replace(/^assets\//, ''));
          } catch {
            return '';
          }
        }
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

/** Notiz als Klartext fuer das Modell, ohne YAML und ohne Bildverweise. */
function describeNote(note: Note, types: NoteTypeDef[], maxBodyChars = 8000): string {
  const def = findNoteType(types, note.type);
  const lines = [`Titel: ${note.title}`, `Typ: ${def.label}`];

  for (const field of def.fields) {
    const value = note.fields[field.key]?.trim();
    if (value && field.type !== 'image') lines.push(`${field.label}: ${value}`);
  }
  if (note.aliases.length) lines.push(`Aliase: ${note.aliases.join(', ')}`);

  const body = note.body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim();
  lines.push('', body.length > maxBodyChars ? `${body.slice(0, maxBodyChars)} […]` : body);
  return lines.join('\n');
}

/**
 * Verlinkte Notizen als Kontext, gekuerzt. Ohne diese Grenze waechst die
 * Anfrage mit der Kampagne und wird teuer, ohne besser zu werden.
 */
function describeLinkedNotes(note: Note, notes: Note[], types: NoteTypeDef[], perNoteChars = 1200): string {
  const byName = new Map<string, Note>();
  for (const entry of notes) {
    for (const name of [entry.title, ...entry.aliases]) byName.set(normalizeName(name), entry);
  }

  const linked = new Map<string, Note>();
  for (const link of findWikiLinks(note.body)) {
    const target = byName.get(normalizeName(link.target));
    if (target && target.id !== note.id) linked.set(target.id, target);
  }
  for (const relation of note.relations) {
    const target = notes.find((entry) => entry.id === relation.targetId);
    if (target) linked.set(target.id, target);
  }

  return [...linked.values()]
    .slice(0, 12)
    .map((entry) => describeNote(entry, types, perNoteChars))
    .join('\n\n---\n\n');
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
