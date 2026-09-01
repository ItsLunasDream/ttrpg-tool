import type { Language } from './i18n';

/** Wird in jede Notiz- und Kampagnendatei geschrieben, damit spaetere Migrationen moeglich sind. */
export const SCHEMA_VERSION = 1;

/**
 * Notiztypen sind Daten, keine feste Aufzaehlung: sie liegen pro Kampagne in
 * campaign.json und lassen sich in der Oberflaeche anpassen.
 */
export type NoteType = string;

export type FieldType = 'text' | 'textarea' | 'number' | 'url' | 'image';

export interface FieldDef {
  /** Stabiler Schluessel, unter dem der Wert in der Notiz steht. Wird nie geaendert. */
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface NoteTypeDef {
  id: NoteType;
  label: string;
  /** Mehrzahl, fuer Ueberschriften und Filter. */
  plural: string;
  fields: FieldDef[];
}

/** Gerichtete Beziehung. A -> B und B -> A werden getrennt gepflegt. */
export interface Relation {
  id: string;
  targetId: string;
  /** Freitext, die Vorschlagsliste in der UI ist nur eine Hilfe. */
  type: string;
  note: string;
}

export interface NoteMeta {
  id: string;
  schemaVersion: number;
  type: NoteType;
  title: string;
  aliases: string[];
  tags: string[];
  fields: Record<string, string>;
  relations: Relation[];
  createdAt: string;
  updatedAt: string;
}

export interface Note extends NoteMeta {
  /** Markdown-Rumpf der Notiz. */
  body: string;
}

export interface Campaign {
  id: string;
  schemaVersion: number;
  name: string;
  createdAt: string;
  /** Notiztypen dieser Kampagne, samt ihrer Steckbrieffelder. */
  noteTypes: NoteTypeDef[];
}

export interface AppSettings {
  schemaVersion: number;
  vaultRoot: string;
  language: Language;
  autosaveEnabled: boolean;
  autosaveDelayMs: number;
  lastCampaignId: string | null;
}

/** Fundstelle innerhalb eines Textausschnitts, fuer die Hervorhebung. */
export interface SnippetMatch {
  from: number;
  to: number;
}

export interface SearchHit {
  noteId: string;
  title: string;
  type: NoteType;
  field: 'title' | 'alias' | 'tag' | 'body' | 'field';
  /** Vorangestellte Bezeichnung, z.B. "Alias" oder der Feldname. */
  label: string | null;
  /** Textausschnitt rund um den Treffer. */
  snippet: string;
  /** Fundstellen innerhalb von `snippet`. */
  matches: SnippetMatch[];
  /** Anzahl Fundstellen im gesamten Rumpf, unabhaengig vom Ausschnitt. */
  bodyMatches: number;
}
