import { AiError, type AiProvider, type AiRequest, type AiStatus } from './provider';
import type { MessageKey, MessageParams } from '../../shared/i18n';

export interface OllamaOptions {
  baseUrl: string;
  model: string;
}

/**
 * Lokales Modell ueber Ollama. Laeuft auf dem eigenen Rechner, kostet nichts,
 * ist aber meist schwaecher als ein Cloud-Modell und muss waehrend der Nutzung
 * laufen.
 *
 * Der Aufruf geht bewusst vom Hauptprozess aus: der Renderer bekommt keinen
 * Netzzugriff, und so gilt dieselbe Grenze wie fuer alle anderen Zugriffe.
 */
export class OllamaProvider implements AiProvider {
  readonly id = 'ollama';

  constructor(private options: OllamaOptions) {}

  describe(): string {
    return `Ollama · ${this.options.model}`;
  }

  private url(path: string): string {
    return new URL(path, this.options.baseUrl).toString();
  }

  async check(): Promise<AiStatus> {
    try {
      const response = await fetch(this.url('/api/tags'), { signal: AbortSignal.timeout(4000) });
      if (!response.ok) return { ready: false, key: 'error.aiHttp', params: { status: response.status } };

      const data = (await response.json()) as { models?: { name?: string }[] };
      const models = (data.models ?? []).map((entry) => entry.name ?? '').filter(Boolean);
      if (models.length === 0) return { ready: false, key: 'error.aiNoModels' };

      // Ollama haengt an Modellnamen ein :tag an, deshalb Praefixvergleich.
      const found = models.some((name) => name === this.options.model || name.startsWith(`${this.options.model}:`));
      return found
        ? { ready: true, detail: this.describe() }
        : { ready: false, key: 'error.aiModelNotInstalled', params: { model: this.options.model } };
    } catch (error) {
      return { ready: false, ...classify(error) };
    }
  }

  async ask(_request: AiRequest, systemPrompt: string, userPrompt: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch(this.url('/api/chat'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(180_000),
        body: JSON.stringify({
          model: this.options.model,
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
    } catch (error) {
      const { key, params } = classify(error);
      throw new AiError(key, params);
    }

    if (!response.ok) throw new AiError('error.aiHttp', { status: response.status });

    const data = (await response.json()) as { message?: { content?: string } };
    const text = data.message?.content?.trim();
    if (!text) throw new AiError('error.aiEmpty');
    return text;
  }
}

/** Ordnet einen Netzfehler einer uebersetzbaren Meldung zu. */
export function classify(error: unknown): { key: MessageKey; params?: MessageParams } {
  const message = error instanceof Error ? error.message : String(error);
  if (/timeout|abort/i.test(message)) return { key: 'error.aiTimeout' };
  if (/ECONNREFUSED|fetch failed|ENOTFOUND|ECONNRESET/i.test(message)) return { key: 'error.aiNoConnection' };
  return { key: 'error.aiOther', params: { detail: message } };
}
