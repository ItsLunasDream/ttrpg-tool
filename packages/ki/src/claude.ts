/**
 * Claude API. Besser bei kreativem Schreiben und Konsistenzpruefungen als ein
 * lokales Modell, verursacht dafuer laufende Kosten.
 *
 * Der Schluessel wird uebergeben und bleibt im Hauptprozess der Anwendung.
 * Die Oberflaeche erfaehrt nur, ob einer hinterlegt ist.
 */
import Anthropic from '@anthropic-ai/sdk';
import { KiFehler, type KiAnbieter, type KiAnfrage, type KiSchluessel, type KiWerte, type KiZustand } from './anbieter';

export interface ClaudeEinstellung {
  readonly schluessel: string;
  readonly modell: string;
}

/** Voreinstellung. Bewusst nicht kleiner gewaehlt, die Wahl gehoert der Nutzerin. */
export const CLAUDE_VOREINSTELLUNG = 'claude-opus-5';

export class ClaudeAnbieter implements KiAnbieter {
  readonly id = 'claude';
  private klient: Anthropic;

  constructor(private einstellung: ClaudeEinstellung) {
    this.klient = new Anthropic({ apiKey: einstellung.schluessel });
  }

  beschreibe(): string {
    return `Claude · ${this.einstellung.modell}`;
  }

  async pruefe(): Promise<KiZustand> {
    if (!this.einstellung.schluessel.trim()) return { bereit: false, schluessel: 'error.aiNoKey' };

    try {
      await this.klient.models.retrieve(this.einstellung.modell);
      return { bereit: true, beschreibung: this.beschreibe() };
    } catch (fehler) {
      const { schluessel, werte } = ordne(fehler);
      return { bereit: false, schluessel, werte };
    }
  }

  async frage(anfrage: KiAnfrage, aufTeil: (text: string) => void): Promise<string> {
    try {
      // Gestroemt, damit die Antwort waehrend des Schreibens erscheint und
      // lange Antworten nicht in einen Zeitablauf laufen.
      const strom = this.klient.beta.messages.stream({
        model: this.einstellung.modell,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        // Lehnt das Modell die Anfrage ab, uebernimmt ein anderes, statt dass
        // die Nutzerin ohne Antwort dasteht.
        betas: ['server-side-fallback-2026-06-01'],
        fallbacks: [{ model: 'claude-opus-4-8' }],
        system: anfrage.system,
        messages: anfrage.nachrichten.map((n) => ({ role: n.rolle, content: n.inhalt }))
      });

      strom.on('text', aufTeil);
      const antwort = await strom.finalMessage();

      if (antwort.stop_reason === 'refusal') throw new KiFehler('error.aiRefused');

      const text = antwort.content
        .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('\n')
        .trim();

      if (!text) throw new KiFehler('error.aiEmpty');
      return text;
    } catch (fehler) {
      if (fehler instanceof KiFehler) throw fehler;
      const { schluessel, werte } = ordne(fehler);
      throw new KiFehler(schluessel, werte);
    }
  }
}

/** Ordnet die typisierten SDK-Fehler uebersetzbaren Meldungen zu. */
export function ordne(fehler: unknown): { schluessel: KiSchluessel; werte?: KiWerte } {
  if (fehler instanceof Anthropic.AuthenticationError) return { schluessel: 'error.aiAuth' };
  if (fehler instanceof Anthropic.RateLimitError) return { schluessel: 'error.aiRateLimit' };
  if (fehler instanceof Anthropic.NotFoundError) return { schluessel: 'error.aiModelMissing' };
  if (fehler instanceof Anthropic.APIConnectionError) return { schluessel: 'error.aiNoConnection' };
  if (fehler instanceof Anthropic.APIError) {
    return { schluessel: 'error.aiHttp', werte: { status: fehler.status ?? 0 } };
  }
  return {
    schluessel: 'error.aiOther',
    werte: { detail: fehler instanceof Error ? fehler.message : String(fehler) }
  };
}
