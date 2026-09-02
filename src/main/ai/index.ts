import { safeStorage } from 'electron';
import { ClaudeProvider, DEFAULT_CLAUDE_MODEL } from './claude';
import { OllamaProvider } from './ollama';
import { systemPrompt, userPrompt } from './prompts';
import { AiError, type AiProvider, type AiRequest } from './provider';
import type { AppSettings } from '../../shared/types';

export { AiError, DEFAULT_CLAUDE_MODEL };
export type { AiProvider, AiRequest, AiMessage } from './provider';

/**
 * Waehlt den eingestellten Anbieter aus. Der Rest der Anwendung kennt nur das
 * Interface, ein Wechsel aendert hier eine Zeile.
 */
export function createProvider(settings: AppSettings, apiKey: string): AiProvider | null {
  switch (settings.aiProvider) {
    case 'ollama':
      return new OllamaProvider({ baseUrl: settings.ollamaBaseUrl, model: settings.ollamaModel });
    case 'claude':
      return new ClaudeProvider({ apiKey, model: settings.claudeModel || DEFAULT_CLAUDE_MODEL });
    default:
      return null;
  }
}

export async function askProvider(
  provider: AiProvider,
  request: AiRequest,
  onChunk: (text: string) => void
): Promise<string> {
  const language = request.language === 'en' ? 'en' : 'de';
  const messages = [...request.history, { role: 'user' as const, content: userPrompt(request) }];
  return provider.ask(request, systemPrompt(language), messages, onChunk);
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
