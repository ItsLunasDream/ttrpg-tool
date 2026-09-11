/**
 * Lokales Modell ueber Ollama. Laeuft auf dem eigenen Rechner, kostet nichts,
 * ist aber meist schwaecher als ein Cloud-Modell und muss waehrend der
 * Nutzung laufen.
 *
 * Aufgerufen wird das aus dem Hauptprozess der jeweiligen Anwendung, nicht
 * aus der Oberflaeche: so bleibt der Renderer ohne Netzzugriff, und die
 * Inhaltsrichtlinie muss fuer die KI nicht geoeffnet werden.
 */
import { KiFehler, type KiAnbieter, type KiAnfrage, type KiSchluessel, type KiWerte, type KiZustand } from './anbieter';

export interface OllamaEinstellung {
  readonly adresse: string;
  readonly modell: string;
}

export class OllamaAnbieter implements KiAnbieter {
  readonly id = 'ollama';

  constructor(private einstellung: OllamaEinstellung) {}

  beschreibe(): string {
    return `Ollama · ${this.einstellung.modell}`;
  }

  private url(pfad: string): string {
    return new URL(pfad, this.einstellung.adresse).toString();
  }

  async pruefe(): Promise<KiZustand> {
    try {
      const antwort = await fetch(this.url('/api/tags'), { signal: AbortSignal.timeout(4000) });
      if (!antwort.ok) {
        return { bereit: false, schluessel: 'error.aiHttp', werte: { status: antwort.status } };
      }

      const daten = (await antwort.json()) as { models?: { name?: string }[] };
      const modelle = (daten.models ?? []).map((eintrag) => eintrag.name ?? '').filter(Boolean);
      if (modelle.length === 0) return { bereit: false, schluessel: 'error.aiNoModels' };

      // Ollama haengt an Modellnamen ein :tag an, deshalb Praefixvergleich.
      const gefunden = modelle.some(
        (name) => name === this.einstellung.modell || name.startsWith(`${this.einstellung.modell}:`)
      );
      return gefunden
        ? { bereit: true, beschreibung: this.beschreibe() }
        : {
            bereit: false,
            schluessel: 'error.aiModelNotInstalled',
            werte: { model: this.einstellung.modell }
          };
    } catch (fehler) {
      const { schluessel, werte } = ordne(fehler);
      return { bereit: false, schluessel, werte };
    }
  }

  async frage(anfrage: KiAnfrage, aufTeil: (text: string) => void): Promise<string> {
    let antwort: Response;
    try {
      antwort = await fetch(this.url('/api/chat'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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

    if (!antwort.ok) throw new KiFehler('error.aiHttp', { status: antwort.status });
    if (!antwort.body) throw new KiFehler('error.aiEmpty');

    // Ollama schickt eine JSON-Zeile je Teilstueck. Eine Zeile kann ueber
    // zwei Pakete verteilt ankommen, deshalb der Zwischenpuffer.
    const decoder = new TextDecoder();
    let puffer = '';
    let text = '';

    try {
      for await (const teil of antwort.body as unknown as AsyncIterable<Uint8Array>) {
        puffer += decoder.decode(teil, { stream: true });

        const zeilen = puffer.split('\n');
        puffer = zeilen.pop() ?? '';

        for (const zeile of zeilen) {
          if (!zeile.trim()) continue;
          let gelesen: { message?: { content?: string }; error?: string };
          try {
            gelesen = JSON.parse(zeile);
          } catch {
            continue; // Unvollstaendige Zeile, kommt beim naechsten Paket.
          }
          if (gelesen.error) throw new KiFehler('error.aiOther', { detail: gelesen.error });

          const stueck = gelesen.message?.content;
          if (stueck) {
            text += stueck;
            aufTeil(stueck);
          }
        }
      }
    } catch (fehler) {
      if (fehler instanceof KiFehler) throw fehler;
      const { schluessel, werte } = ordne(fehler);
      throw new KiFehler(schluessel, werte);
    }

    const sauber = text.trim();
    if (!sauber) throw new KiFehler('error.aiEmpty');
    return sauber;
  }
}

/** Ordnet einen Netzfehler einer uebersetzbaren Meldung zu. */
export function ordne(fehler: unknown): { schluessel: KiSchluessel; werte?: KiWerte } {
  const text = fehler instanceof Error ? fehler.message : String(fehler);
  if (/timeout|abort/i.test(text)) return { schluessel: 'error.aiTimeout' };
  if (/ECONNREFUSED|fetch failed|ENOTFOUND|ECONNRESET/i.test(text)) {
    return { schluessel: 'error.aiNoConnection' };
  }
  return { schluessel: 'error.aiOther', werte: { detail: text } };
}
