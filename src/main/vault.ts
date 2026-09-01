import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseFrontmatter, stringifyFrontmatter } from './frontmatter';
import { rewriteWikiLinks } from '../shared/wikilinks';
import { DEFAULT_NOTE_TYPES, isKnownNoteType, toKey } from '../shared/noteTypes';
import { SCHEMA_VERSION } from '../shared/types';
import type { AppSettings, Campaign, FieldDef, Note, NoteType, NoteTypeDef, Relation } from '../shared/types';
import { DEFAULT_LANGUAGE, isLanguage } from '../shared/i18n';
import type { MessageKey, MessageParams } from '../shared/i18n';

const CAMPAIGNS_DIR = 'campaigns';
const NOTES_DIR = 'notes';
const ASSETS_DIR = 'assets';
const CAMPAIGN_FILE = 'campaign.json';

/**
 * Fehler mit uebersetzbarem Text. Der Hauptprozess kennt die eingestellte
 * Sprache nicht an jeder Stelle, deshalb wird nur der Schluessel geworfen und
 * erst in der IPC-Schicht uebersetzt.
 */
export class VaultError extends Error {
  constructor(readonly key: MessageKey, readonly params?: MessageParams) {
    super(key);
    this.name = 'VaultError';
  }
}

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
        campaigns.push(await this.readCampaign(entry.name));
      } catch {
        // Verzeichnis ohne gueltige campaign.json wird ignoriert statt die Liste zu sprengen.
      }
    }
    return campaigns.sort((a, b) => a.name.localeCompare(b.name, 'de-DE'));
  }

  /**
   * Liest campaign.json und ergaenzt fehlende Angaben. Kampagnen aus einer
   * Version ohne eigene Notiztypen bekommen dabei die Vorlage eingetragen
   * und einmalig zurueckgeschrieben.
   */
  private async readCampaign(campaignId: string): Promise<Campaign> {
    const file = path.join(this.campaignDir(campaignId), CAMPAIGN_FILE);
    const parsed = JSON.parse(await fs.readFile(file, 'utf8')) as Partial<Campaign>;

    const migrated = !Array.isArray(parsed.noteTypes) || parsed.noteTypes.length === 0;
    const campaign: Campaign = {
      id: campaignId,
      schemaVersion: SCHEMA_VERSION,
      name: parsed.name ?? campaignId,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      noteTypes: migrated ? structuredClone(DEFAULT_NOTE_TYPES) : normalizeNoteTypes(parsed.noteTypes as NoteTypeDef[])
    };

    if (migrated) await writeJson(file, campaign);
    return campaign;
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    return this.readCampaign(campaignId);
  }

  /** Ersetzt die Notiztypen einer Kampagne, nach Pruefung auf Vollstaendigkeit. */
  async updateNoteTypes(campaignId: string, noteTypes: NoteTypeDef[]): Promise<Campaign> {
    const campaign = await this.readCampaign(campaignId);
    const updated: Campaign = { ...campaign, noteTypes: validateNoteTypes(noteTypes) };
    await writeJson(path.join(this.campaignDir(campaignId), CAMPAIGN_FILE), updated);
    return updated;
  }

  async createCampaign(name: string): Promise<Campaign> {
    const trimmed = name.trim();
    if (!trimmed) throw new VaultError('error.campaignName');

    const campaign: Campaign = {
      id: randomUUID(),
      schemaVersion: SCHEMA_VERSION,
      name: trimmed,
      createdAt: new Date().toISOString(),
      noteTypes: structuredClone(DEFAULT_NOTE_TYPES)
    };
    const dir = this.campaignDir(campaign.id);
    await fs.mkdir(path.join(dir, NOTES_DIR), { recursive: true });
    await fs.mkdir(path.join(dir, ASSETS_DIR), { recursive: true });
    await writeJson(path.join(dir, CAMPAIGN_FILE), campaign);
    return campaign;
  }

  async renameCampaign(campaignId: string, name: string): Promise<Campaign> {
    const trimmed = name.trim();
    if (!trimmed) throw new VaultError('error.campaignName');

    const campaign = await this.readCampaign(campaignId);
    const updated: Campaign = { ...campaign, name: trimmed };
    await writeJson(path.join(this.campaignDir(campaignId), CAMPAIGN_FILE), updated);
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
    if (!trimmed) throw new VaultError('error.noteTitle');

    const campaign = await this.readCampaign(campaignId);
    if (!isKnownNoteType(campaign.noteTypes, type)) {
      throw new VaultError('error.unknownNoteType', { type });
    }

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
    if (!trimmed) throw new VaultError('error.noteTitle');

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
    if (!trimmed) throw new VaultError('error.noteTitle');

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
    throw new VaultError('error.invalidId', { id });
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

/**
 * Macht aus rohem Frontmatter eine vollstaendige Notiz, auch wenn Felder
 * fehlen. Der Typ wird nicht gegen die Kampagne geprueft: ein geloeschter Typ
 * bleibt in der Datei stehen, damit nichts verloren geht.
 */
function normalizeNote(noteId: string, data: Record<string, unknown>, body: string): Note {
  const now = new Date().toISOString();
  const type = typeof data.type === 'string' && data.type.trim() ? data.type.trim() : 'note';

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

const FIELD_TYPES: FieldDef['type'][] = ['text', 'textarea', 'number', 'url'];

/**
 * Prueft Notiztypen aus der Oberflaeche, bevor sie geschrieben werden.
 * Doppelte Schluessel wuerden dazu fuehren, dass zwei Felder denselben Wert
 * teilen, doppelte Typ-IDs, dass Notizen dem falschen Typ zugeordnet werden.
 */
function validateNoteTypes(types: NoteTypeDef[]): NoteTypeDef[] {
  if (!Array.isArray(types) || types.length === 0) {
    throw new VaultError('error.needsOneType');
  }

  const seenTypes = new Set<string>();
  return types.map((def) => {
    const id = String(def.id ?? '').trim();
    const label = String(def.label ?? '').trim();
    if (!id) throw new VaultError('error.typeWithoutId');
    if (!label) throw new VaultError('error.typeNeedsLabel', { id });
    if (seenTypes.has(id)) throw new VaultError('error.duplicateType', { id });
    seenTypes.add(id);

    const seenFields = new Set<string>();
    const fields = (Array.isArray(def.fields) ? def.fields : []).map((field) => {
      const key = String(field.key ?? '').trim();
      const fieldLabel = String(field.label ?? '').trim();
      if (!key) throw new VaultError('error.fieldWithoutKey', { label });
      if (!fieldLabel) throw new VaultError('error.fieldNeedsLabel', { label });
      if (seenFields.has(key)) throw new VaultError('error.duplicateField', { key, label });
      seenFields.add(key);

      const normalized: FieldDef = {
        key,
        label: fieldLabel,
        type: FIELD_TYPES.includes(field.type) ? field.type : 'text'
      };
      const placeholder = String(field.placeholder ?? '').trim();
      return placeholder ? { ...normalized, placeholder } : normalized;
    });

    return { id, label, plural: String(def.plural ?? '').trim() || label, fields };
  });
}

/** Wie validateNoteTypes, repariert aber statt zu werfen. Fuer das Lesen von der Platte. */
function normalizeNoteTypes(types: NoteTypeDef[]): NoteTypeDef[] {
  const seenTypes = new Set<string>();
  const normalized = types.flatMap((def) => {
    const id = String(def?.id ?? '').trim();
    if (!id || seenTypes.has(id)) return [];
    seenTypes.add(id);

    const label = String(def.label ?? '').trim() || id;
    const seenFields = new Set<string>();
    const fields = (Array.isArray(def.fields) ? def.fields : []).flatMap((field) => {
      const fieldLabel = String(field?.label ?? '').trim();
      if (!fieldLabel) return [];
      const key = String(field.key ?? '').trim() || toKey(fieldLabel, seenFields);
      if (seenFields.has(key)) return [];
      seenFields.add(key);

      const result: FieldDef = {
        key,
        label: fieldLabel,
        type: FIELD_TYPES.includes(field.type) ? field.type : 'text'
      };
      const placeholder = String(field.placeholder ?? '').trim();
      return [placeholder ? { ...result, placeholder } : result];
    });

    return [{ id, label, plural: String(def.plural ?? '').trim() || label, fields }];
  });

  return normalized.length ? normalized : structuredClone(DEFAULT_NOTE_TYPES);
}

// --- Einstellungen ---------------------------------------------------------

export function defaultSettings(vaultRoot: string): AppSettings {
  return {
    schemaVersion: SCHEMA_VERSION,
    vaultRoot,
    language: DEFAULT_LANGUAGE,
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
      autosaveDelayMs: clampDelay(parsed.autosaveDelayMs ?? defaults.autosaveDelayMs),
      language: isLanguage(parsed.language) ? parsed.language : defaults.language
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
