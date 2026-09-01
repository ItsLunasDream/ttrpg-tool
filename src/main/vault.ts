import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseFrontmatter, stringifyFrontmatter } from './frontmatter';
import { rewriteWikiLinks } from '../shared/wikilinks';
import { noteTypeDef } from '../shared/noteTypes';
import { SCHEMA_VERSION } from '../shared/types';
import type { AppSettings, Campaign, Note, NoteType, Relation } from '../shared/types';

const CAMPAIGNS_DIR = 'campaigns';
const NOTES_DIR = 'notes';
const ASSETS_DIR = 'assets';
const CAMPAIGN_FILE = 'campaign.json';

export class VaultError extends Error {}

/**
 * Ablage auf der Platte:
 *
 *   <vaultRoot>/
 *     campaigns/
 *       <campaignId>/
 *         campaign.json
 *         notes/<noteId>.md      Frontmatter + Markdown-Rumpf
 *         assets/                Bilder (Phase 2)
 *
 * Jede Kampagne ist ein echter Container: Notizen gehoeren zu genau einer
 * Kampagne und sind nur innerhalb dieser verlinkbar.
 */
export class Vault {
  constructor(private root: string) {}

  get vaultRoot(): string {
    return this.root;
  }

  setRoot(root: string): void {
    this.root = root;
  }

  private campaignDir(campaignId: string): string {
    assertSafeId(campaignId);
    return path.join(this.root, CAMPAIGNS_DIR, campaignId);
  }

  private noteFile(campaignId: string, noteId: string): string {
    assertSafeId(noteId);
    return path.join(this.campaignDir(campaignId), NOTES_DIR, `${noteId}.md`);
  }

  async init(): Promise<void> {
    await fs.mkdir(path.join(this.root, CAMPAIGNS_DIR), { recursive: true });
  }

  // --- Kampagnen -----------------------------------------------------------

  async listCampaigns(): Promise<Campaign[]> {
    const dir = path.join(this.root, CAMPAIGNS_DIR);
    await fs.mkdir(dir, { recursive: true });
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const campaigns: Campaign[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const raw = await fs.readFile(path.join(dir, entry.name, CAMPAIGN_FILE), 'utf8');
        const parsed = JSON.parse(raw) as Partial<Campaign>;
        campaigns.push({
          id: entry.name,
          schemaVersion: parsed.schemaVersion ?? SCHEMA_VERSION,
          name: parsed.name ?? entry.name,
          createdAt: parsed.createdAt ?? new Date().toISOString()
        });
      } catch {
        // Verzeichnis ohne gueltige campaign.json wird ignoriert statt die Liste zu sprengen.
      }
    }
    return campaigns.sort((a, b) => a.name.localeCompare(b.name, 'de-DE'));
  }

  async createCampaign(name: string): Promise<Campaign> {
    const trimmed = name.trim();
    if (!trimmed) throw new VaultError('Die Kampagne braucht einen Namen.');

    const campaign: Campaign = {
      id: randomUUID(),
      schemaVersion: SCHEMA_VERSION,
      name: trimmed,
      createdAt: new Date().toISOString()
    };
    const dir = this.campaignDir(campaign.id);
    await fs.mkdir(path.join(dir, NOTES_DIR), { recursive: true });
    await fs.mkdir(path.join(dir, ASSETS_DIR), { recursive: true });
    await writeJson(path.join(dir, CAMPAIGN_FILE), campaign);
    return campaign;
  }

  async renameCampaign(campaignId: string, name: string): Promise<Campaign> {
    const trimmed = name.trim();
    if (!trimmed) throw new VaultError('Die Kampagne braucht einen Namen.');

    const file = path.join(this.campaignDir(campaignId), CAMPAIGN_FILE);
    const campaign = JSON.parse(await fs.readFile(file, 'utf8')) as Campaign;
    const updated: Campaign = { ...campaign, id: campaignId, name: trimmed };
    await writeJson(file, updated);
    return updated;
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await fs.rm(this.campaignDir(campaignId), { recursive: true, force: true });
  }

  // --- Notizen -------------------------------------------------------------

  async listNotes(campaignId: string): Promise<Note[]> {
    const dir = path.join(this.campaignDir(campaignId), NOTES_DIR);
    await fs.mkdir(dir, { recursive: true });
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const notes: Note[] = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const noteId = entry.name.slice(0, -3);
      try {
        notes.push(await this.getNote(campaignId, noteId));
      } catch {
        // Kaputte Einzeldatei darf nicht die ganze Kampagne unlesbar machen.
      }
    }
    return notes.sort((a, b) => a.title.localeCompare(b.title, 'de-DE'));
  }

  async getNote(campaignId: string, noteId: string): Promise<Note> {
    const raw = await fs.readFile(this.noteFile(campaignId, noteId), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    return normalizeNote(noteId, data, body);
  }

  async createNote(campaignId: string, type: NoteType, title: string): Promise<Note> {
    const trimmed = title.trim();
    if (!trimmed) throw new VaultError('Die Notiz braucht einen Titel.');
    noteTypeDef(type);

    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      schemaVersion: SCHEMA_VERSION,
      type,
      title: trimmed,
      aliases: [],
      tags: [],
      fields: {},
      relations: [],
      createdAt: now,
      updatedAt: now,
      body: ''
    };
    await this.writeNote(campaignId, note);
    return note;
  }

  async saveNote(campaignId: string, note: Note): Promise<Note> {
    const trimmed = note.title.trim();
    if (!trimmed) throw new VaultError('Die Notiz braucht einen Titel.');

    const updated: Note = {
      ...note,
      title: trimmed,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: new Date().toISOString()
    };
    await this.writeNote(campaignId, updated);
    return updated;
  }

  /**
   * Benennt eine Notiz um und zieht alle [[Links]] in der Kampagne mit.
   * Damit bleibt der Klartext lesbar, ohne dass Umbenennen Links zerreisst.
   */
  async renameNote(campaignId: string, noteId: string, newTitle: string): Promise<{ note: Note; rewritten: number }> {
    const trimmed = newTitle.trim();
    if (!trimmed) throw new VaultError('Die Notiz braucht einen Titel.');

    const note = await this.getNote(campaignId, noteId);
    if (note.title === trimmed) return { note, rewritten: 0 };

    const updated = await this.saveNote(campaignId, { ...note, title: trimmed });

    let rewritten = 0;
    for (const other of await this.listNotes(campaignId)) {
      if (other.id === noteId) continue;
      const body = rewriteWikiLinks(other.body, note.title, trimmed);
      if (body === other.body) continue;
      await this.writeNote(campaignId, { ...other, body, updatedAt: new Date().toISOString() });
      rewritten += 1;
    }

    return { note: updated, rewritten };
  }

  async deleteNote(campaignId: string, noteId: string): Promise<void> {
    await fs.rm(this.noteFile(campaignId, noteId), { force: true });

    // Beziehungen auf die geloeschte Notiz wuerden sonst ins Leere zeigen.
    for (const other of await this.listNotes(campaignId)) {
      const relations = other.relations.filter((relation) => relation.targetId !== noteId);
      if (relations.length === other.relations.length) continue;
      await this.writeNote(campaignId, { ...other, relations, updatedAt: new Date().toISOString() });
    }
  }

  private async writeNote(campaignId: string, note: Note): Promise<void> {
    const file = this.noteFile(campaignId, note.id);
    await fs.mkdir(path.dirname(file), { recursive: true });

    const { body, ...meta } = note;
    await writeAtomic(file, stringifyFrontmatter(meta as unknown as Record<string, unknown>, body));
  }
}

// --- Hilfsfunktionen -------------------------------------------------------

/** Verhindert, dass eine manipulierte ID aus dem Vault-Verzeichnis ausbricht. */
function assertSafeId(id: string): void {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new VaultError(`Ungültige ID: ${id}`);
  }
}

async function writeAtomic(file: string, content: string): Promise<void> {
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, content, 'utf8');
  await fs.rename(tmp, file);
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await writeAtomic(file, `${JSON.stringify(value, null, 2)}\n`);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean);
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === 'string') result[key] = entry;
    else if (typeof entry === 'number') result[key] = String(entry);
  }
  return result;
}

function asRelations(value: unknown): Relation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.targetId !== 'string') return [];
    return [{
      id: typeof record.id === 'string' ? record.id : randomUUID(),
      targetId: record.targetId,
      type: typeof record.type === 'string' ? record.type : '',
      note: typeof record.note === 'string' ? record.note : ''
    }];
  });
}

const KNOWN_TYPES: NoteType[] = ['character', 'location', 'faction', 'event'];

/** Macht aus rohem Frontmatter eine vollstaendige Notiz, auch wenn Felder fehlen. */
function normalizeNote(noteId: string, data: Record<string, unknown>, body: string): Note {
  const now = new Date().toISOString();
  const type = KNOWN_TYPES.includes(data.type as NoteType) ? (data.type as NoteType) : 'character';

  return {
    id: noteId,
    schemaVersion: typeof data.schemaVersion === 'number' ? data.schemaVersion : SCHEMA_VERSION,
    type,
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Ohne Titel',
    aliases: asStringArray(data.aliases),
    tags: asStringArray(data.tags),
    fields: asStringRecord(data.fields),
    relations: asRelations(data.relations),
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : now,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : now,
    body
  };
}

// --- Einstellungen ---------------------------------------------------------

export function defaultSettings(vaultRoot: string): AppSettings {
  return {
    schemaVersion: SCHEMA_VERSION,
    vaultRoot,
    autosaveEnabled: true,
    autosaveDelayMs: 1500,
    lastCampaignId: null
  };
}

export async function readSettings(file: string, fallbackRoot: string): Promise<AppSettings> {
  const defaults = defaultSettings(fallbackRoot);
  try {
    const parsed = JSON.parse(await fs.readFile(file, 'utf8')) as Partial<AppSettings>;
    return {
      ...defaults,
      ...parsed,
      schemaVersion: SCHEMA_VERSION,
      vaultRoot: typeof parsed.vaultRoot === 'string' && parsed.vaultRoot ? parsed.vaultRoot : defaults.vaultRoot,
      autosaveDelayMs: clampDelay(parsed.autosaveDelayMs ?? defaults.autosaveDelayMs)
    };
  } catch {
    return defaults;
  }
}

export async function writeSettings(file: string, settings: AppSettings): Promise<AppSettings> {
  const normalized: AppSettings = {
    ...settings,
    schemaVersion: SCHEMA_VERSION,
    autosaveDelayMs: clampDelay(settings.autosaveDelayMs)
  };
  await writeJson(file, normalized);
  return normalized;
}

function clampDelay(value: number): number {
  if (!Number.isFinite(value)) return 1500;
  return Math.min(30_000, Math.max(300, Math.round(value)));
}
