/**
 * Dienste mit der Schnittstelle von OpenAI.
 *
 * Nicht "OpenAI" als Anbieter, sondern deren Schnittstelle: an
 * `/v1/chat/completions` sprechen ausser OpenAI selbst auch Groq, Mistral,
 * Together, OpenRouter, LM Studio und llama.cpp. Ein Anbieter deckt sie
 * damit alle ab, und wer einen Schluessel fuer einen dieser Dienste hat,
 * traegt Adresse, Modell und Schluessel ein.
 *
 * Kein SDK. Die Schnittstelle ist ein POST mit JSON und ein Datenstrom aus
 * `data:`-Zeilen — ein Paket dafuer waere mehr Abhaengigkeit als Gewinn, und
 * Ollama macht es hier nebenan schon genauso.
 *
 * Plattformfrei nach Regel 4.
 */
import { ordne } from './ollama';
import { KiFehler, type KiAnbieter, type KiAnfrage, type KiZustand } from './anbieter';

export interface OffenEinstellung {
  /** Die Basis-Adresse, mit oder ohne /v1 am Ende. */
  readonly adresse: string;
  readonly modell: string;
  readonly schluessel: string;
}

/** Wie lange auf die Bereitschaftsantwort gewartet wird. */
const PRUEF_FRIST_MS = 4000;

/**
 * Haengt den Pfad an die Basis-Adresse.
 *
 * Wer die Adresse eintraegt, schreibt mal `https://api.gross.example`, mal
 * `.../v1` und mal `.../v1/`. Alle drei sollen gehen; verlangte man genau
 * eine Form, laege der Fehler beim Tippen und die Meldung waere „nicht
 * erreichbar".
 */
export function baueUrl(adresse: string, pfad: string): string {
  const basis = adresse.trim().replace(/\/+$/, '');
  const mitV1 = /\/v\d+$/.test(basis) ? basis : `${basis}/v1`;
  return `${mitV1}${pfad}`;
}

export class OffenerAnbieter implements KiAnbieter {
  readonly id = 'offen';

  constructor(private einstellung: OffenEinstellung) {}

  beschreibe(): string {
    let host = this.einstellung.adresse;
    try {
      host = new URL(this.einstellung.adresse).host;
    } catch {
      // Dann steht die eingetippte Adresse da. Besser als gar nichts.
    }
    return `${host} · ${this.einstellung.modell}`;
  }

  private kopf(): Record<string, string> {
    return {
      'content-type': 'application/json',
      authorization: `Bearer ${this.einstellung.schluessel}`
    };
  }

  async pruefe(): Promise<KiZustand> {
    if (!this.einstellung.schluessel) return { bereit: false, schluessel: 'error.aiNoKey' };
    if (!this.einstellung.adresse.trim()) return { bereit: false, schluessel: 'error.aiNoConnection' };

    try {
      const antwort = await fetch(baueUrl(this.einstellung.adresse, '/models'), {
        headers: this.kopf(),
        signal: AbortSignal.timeout(PRUEF_FRIST_MS)
      });
      if (antwort.status === 401 || antwort.status === 403) {
        return { bereit: false, schluessel: 'error.aiAuth' };
      }
      // Nicht jeder Dienst bietet /models an. Ein 404 sagt nichts ueber die
      // Erreichbarkeit — geantwortet hat er ja.
      if (!antwort.ok && antwort.status !== 404) {
        return { bereit: false, schluessel: 'error.aiHttp', werte: { status: antwort.status } };
      }
      return { bereit: true, beschreibung: this.beschreibe() };
    } catch (fehler) {
      const { schluessel, werte } = ordne(fehler);
      return { bereit: false, schluessel, werte };
    }
  }

  async frage(anfrage: KiAnfrage, aufTeil: (text: string) => void): Promise<string> {
    if (!this.einstellung.schluessel) throw new KiFehler('error.aiNoKey');

    let antwort: Response;
    try {
      antwort = await fetch(baueUrl(this.einstellung.adresse, '/chat/completions'), {
        method: 'POST',
        headers: this.kopf(),
        signal: AbortSignal.timeout(600_000),
        body: JSON.stringify({
          model: this.einstellung.modell,
          stream: true,
          messages: [
            { role: 'system', content: anfrage.system },
            ...anfrage.nachrichten.map((n) => ({ role: n.rolle, content: n.inhalt }))
          ]
        })
      });
    } catch (fehler) {
      const { schluessel, werte } = ordne(fehler);
      throw new KiFehler(schluessel, werte);
    }

    if (antwort.status === 401 || antwort.status === 403) throw new KiFehler('error.aiAuth');
    if (antwort.status === 429) throw new KiFehler('error.aiRateLimit');
    if (antwort.status === 404) throw new KiFehler('error.aiModelMissing', { model: this.einstellung.modell });
    if (!antwort.ok) throw new KiFehler('error.aiHttp', { status: antwort.status });
    if (!antwort.body) throw new KiFehler('error.aiEmpty');

    const text = await leseStrom(antwort.body as unknown as AsyncIterable<Uint8Array>, aufTeil);
    const sauber = text.trim();
    if (!sauber) throw new KiFehler('error.aiEmpty');
    return sauber;
  }
}

/**
 * Liest den Datenstrom.
 *
 * Das Format sind Zeilen der Form `data: {...}`, abgeschlossen von
 * `data: [DONE]`. Eine Zeile kann ueber zwei Pakete verteilt ankommen,
 * deshalb der Zwischenpuffer — dieselbe Falle wie bei Ollama.
 */
export async function leseStrom(
  strom: AsyncIterable<Uint8Array>,
  aufTeil: (text: string) => void
): Promise<string> {
  const decoder = new TextDecoder();
  let puffer = '';
  let text = '';

  for await (const paket of strom) {
    puffer += decoder.decode(paket, { stream: true });

    const zeilen = puffer.split('\n');
    puffer = zeilen.pop() ?? '';

    for (const zeile of zeilen) {
      const roh = zeile.trim();
      if (!roh || !roh.startsWith('data:')) continue;

      const nutzlast = roh.slice(5).trim();
      if (nutzlast === '[DONE]') return text;

      let gelesen: { choices?: { delta?: { content?: string } }[]; error?: { message?: string } };
      try {
        gelesen = JSON.parse(nutzlast);
      } catch {
        continue; // Unvollstaendig, kommt beim naechsten Paket.
      }
      if (gelesen.error) throw new KiFehler('error.aiOther', { detail: gelesen.error.message ?? '' });

      const stueck = gelesen.choices?.[0]?.delta?.content;
      if (stueck) {
        text += stueck;
        aufTeil(stueck);
      }
    }
  }

  return text;
}
