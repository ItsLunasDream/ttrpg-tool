import Anthropic from '@anthropic-ai/sdk';
import { AiError, type AiProvider, type AiRequest, type AiStatus } from './provider';
import type { MessageKey, MessageParams } from '../../shared/i18n';

export interface ClaudeOptions {
  apiKey: string;
  model: string;
}

/** Voreinstellung. Bewusst nicht kleiner gewaehlt, die Wahl gehoert der Nutzerin. */
export const DEFAULT_CLAUDE_MODEL = 'claude-opus-5';

/**
 * Claude API. Besser bei kreativem Schreiben und Konsistenzpruefungen als ein
 * lokales Modell, verursacht dafuer laufende Kosten.
 *
 * Der Schluessel bleibt im Hauptprozess. Der Renderer erfaehrt nur, ob einer
 * hinterlegt ist.
 */
export class ClaudeProvider implements AiProvider {
  readonly id = 'claude';
  private client: Anthropic;

  constructor(private options: ClaudeOptions) {
    this.client = new Anthropic({ apiKey: options.apiKey });
  }

  describe(): string {
    return `Claude · ${this.options.model}`;
  }

  async check(): Promise<AiStatus> {
    if (!this.options.apiKey.trim()) return { ready: false, key: 'error.aiNoKey' };

    try {
      await this.client.models.retrieve(this.options.model);
      return { ready: true, detail: this.describe() };
    } catch (error) {
      return { ready: false, ...classify(error) };
    }
  }

  async ask(
    _request: AiRequest,
    systemPrompt: string,
    userPrompt: string,
    onChunk: (text: string) => void
  ): Promise<string> {
    try {
      // Gestroemt, damit die Antwort waehrend des Schreibens erscheint und
      // lange Antworten nicht in einen Zeitablauf laufen.
      const stream = this.client.beta.messages.stream({
        model: this.options.model,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        // Lehnt das Modell die Anfrage ab, uebernimmt ein anderes, statt dass
        // die Nutzerin ohne Antwort dasteht.
        betas: ['server-side-fallback-2026-06-01'],
        fallbacks: [{ model: 'claude-opus-4-8' }],
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      stream.on('text', onChunk);
      const response = await stream.finalMessage();

      if (response.stop_reason === 'refusal') throw new AiError('error.aiRefused');

      const text = response.content
        .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();

      if (!text) throw new AiError('error.aiEmpty');
      return text;
    } catch (error) {
      if (error instanceof AiError) throw error;
      const { key, params } = classify(error);
      throw new AiError(key, params);
    }
  }
}

/** Ordnet die typisierten SDK-Fehler uebersetzbaren Meldungen zu. */
function classify(error: unknown): { key: MessageKey; params?: MessageParams } {
  if (error instanceof Anthropic.AuthenticationError) return { key: 'error.aiAuth' };
  if (error instanceof Anthropic.RateLimitError) return { key: 'error.aiRateLimit' };
  if (error instanceof Anthropic.NotFoundError) return { key: 'error.aiModelMissing' };
  if (error instanceof Anthropic.APIConnectionError) return { key: 'error.aiNoConnection' };
  if (error instanceof Anthropic.APIError) return { key: 'error.aiHttp', params: { status: error.status ?? 0 } };
  return { key: 'error.aiOther', params: { detail: error instanceof Error ? error.message : String(error) } };
}
