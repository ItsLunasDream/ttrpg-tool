/**
 * Der KI-Assistent des Backstory Creators.
 *
 * Wie mit einem Modell gesprochen wird, steht in @suite/ki — dort liegen die
 * Anbieter, die Fehlerschluessel und die Schnittstelle. Hier steht nur, was
 * dieser Anwendung eigen ist: welche Aufgaben der Assistent uebernimmt, was
 * er dabei nicht darf (prompts.ts), und wo der API-Schluessel liegt.
 *
 * Der Schluessel bleibt hier und nicht im Paket: verschluesseln kann nur,
 * wer den Schluesselbund des Systems kennt, und `electron` hat in einem
 * geteilten Paket nichts zu suchen (Regel 4).
 */
import { safeStorage } from 'electron';
import {
  baueAnbieter,
  CLAUDE_VOREINSTELLUNG,
  KiFehler,
  type KiAnbieter,
  type KiEinstellungen,
  type KiNachricht
} from '@suite/ki';
import { systemPrompt, userPrompt } from './prompts';
import type { Language } from '../../shared/i18n';
import type { AiMessage, AiTask, AppSettings } from '../../shared/types';

export { KiFehler as AiError };
export type { KiAnbieter as AiProvider } from '@suite/ki';
export const DEFAULT_CLAUDE_MODEL = CLAUDE_VOREINSTELLUNG;

/** Was der Assistent zum Antworten braucht. */
export interface AiRequest {
  task: AiTask;
  language: Language;
  /** Die Notiz, um die es geht, bereits als Klartext aufbereitet. */
  note: string;
  /** Verlinkte Notizen als Kontext, gekuerzt. */
  context: string;
  /** Bisheriger Gespraechsverlauf, aelteste Nachricht zuerst. */
  history: AiMessage[];
  /** Rueckfrage der Nutzerin. Ist sie gesetzt, gilt sie statt der Aufgabe. */
  followUp?: string;
}

/**
 * Woher die KI-Anbindung kommt, wenn nicht aus den eigenen Einstellungen.
 *
 * Gesetzt, wenn die Huelle die KI fuer die ganze Sammlung fuehrt. Eine
 * Funktion, kein Schnappschuss: eine Aenderung dort soll hier sofort gelten.
 */
export type KiQuelle = () => { einstellungen: KiEinstellungen; schluessel: string };

/**
 * Waehlt den eingestellten Anbieter aus.
 *
 * Fuehrt die Huelle die KI, gilt deren Einstellung; sonst die eigene. Der
 * eigenstaendige Start uebergibt keine Quelle und aendert sich damit nicht.
 */
export function createProvider(
  settings: AppSettings,
  apiKey: string,
  kiQuelle?: KiQuelle
): KiAnbieter | null {
  if (kiQuelle) {
    const quelle = kiQuelle();
    return baueAnbieter(quelle.einstellungen, quelle.schluessel);
  }
  return baueAnbieter(
    {
      anbieter: settings.aiProvider,
      ollamaAdresse: settings.ollamaBaseUrl,
      ollamaModell: settings.ollamaModel,
      claudeModell: settings.claudeModel,
      // Der eigenstaendige Backstory Creator bietet den offenen Anbieter
      // nicht an: eingerichtet wird die KI in der Huelle, und dort steht er.
      offenAdresse: '',
      offenModell: ''
    },
    apiKey
  );
}

export async function askProvider(
  provider: KiAnbieter,
  request: AiRequest,
  onChunk: (text: string) => void
): Promise<string> {
  const language = request.language === 'en' ? 'en' : 'de';
  const nachrichten: KiNachricht[] = [
    ...request.history.map((eintrag) => ({ rolle: eintrag.role, inhalt: eintrag.content })),
    { rolle: 'user', inhalt: userPrompt(request) }
  ];
  return provider.frage({ system: systemPrompt(language), nachrichten }, onChunk);
}

/**
 * Der API-Schluessel wird mit dem Schluesselbund des Betriebssystems
 * verschluesselt, wo das moeglich ist. Steht das nicht zur Verfuegung, wird
 * gar nicht erst gespeichert: ein Schluessel im Klartext in einer
 * Einstellungsdatei waere schlechter als keiner.
 */
export function encryptSecret(value: string): string | null {
  if (!value) return '';
  if (!safeStorage.isEncryptionAvailable()) return null;
  return safeStorage.encryptString(value).toString('base64');
}

export function decryptSecret(stored: string): string {
  if (!stored) return '';
  try {
    return safeStorage.decryptString(Buffer.from(stored, 'base64'));
  } catch {
    return '';
  }
}
