/**
 * Die Einstellungen der Huelle.
 *
 * Bewusst getrennt von denen der eingebetteten Anwendungen: die haben ihre
 * eigenen, und die gehoeren ihnen. Hier steht nur, was den Rahmen selbst
 * betrifft.
 *
 * Wie beim Fensterzustand eine schlichte JSON-Datei ohne Abhaengigkeit.
 * Beim *Lesen* werden Fehler geschluckt: eine kaputte Datei fuehrt zu den
 * Vorgaben, nicht zu einem Start, der abbricht. Beim *Schreiben* nicht — wer
 * eine Einstellung umstellt und sie nach dem Neustart nicht wiederfindet,
 * soll das gleich erfahren und nicht erst dann.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from '../shared/i18n';

export interface ShellSettings {
  language: Language;
}

export const DEFAULT_SETTINGS: ShellSettings = {
  language: DEFAULT_LANGUAGE
};

/** Erzwingt gueltige Werte, egal was in der Datei stand. */
export function sanitizeSettings(roh: unknown): ShellSettings {
  if (typeof roh !== 'object' || roh === null) return { ...DEFAULT_SETTINGS };
  const wert = roh as Record<string, unknown>;
  return {
    language: isLanguage(wert.language) ? wert.language : DEFAULT_SETTINGS.language
  };
}

export async function readSettings(datei: string): Promise<ShellSettings> {
  try {
    return sanitizeSettings(JSON.parse(await readFile(datei, 'utf8')));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function writeSettings(datei: string, einstellungen: ShellSettings): Promise<void> {
  const sauber = sanitizeSettings(einstellungen);
  await mkdir(dirname(datei), { recursive: true });
  await writeFile(datei, JSON.stringify(sauber, null, 2), 'utf8');
}
