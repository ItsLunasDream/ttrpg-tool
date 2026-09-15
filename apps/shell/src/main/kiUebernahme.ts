/**
 * Uebernahme einer KI, die frueher in einer einzelnen Anwendung eingerichtet
 * wurde.
 *
 * Getrennt von ki.ts, weil dort `electron` fuer den Schluesselbund gebraucht
 * wird und ein Modultest das nicht laden kann. Hier steht nur Dateizugriff
 * und Umformen — genau das, was sich pruefen laesst.
 */
import { readFile } from 'node:fs/promises';
import { istAnbieterId } from '@suite/ki/einstellungen';
import type { ShellSettings } from './settings';

/**
 * Uebernimmt eine KI, die frueher im Story Creator eingerichtet wurde.
 *
 * Bis diese Einstellung in die Huelle wanderte, lag sie in dessen
 * settings.json. Wer sie dort eingerichtet hat, soll sie nicht neu eintippen
 * muessen — und ein API-Schluessel ist nichts, was man eben nachschlaegt.
 *
 * Der verschluesselte Schluessel wandert dabei unveraendert mit: derselbe
 * Rechner, derselbe Schluesselbund, also laesst er sich hier genauso wieder
 * aufmachen.
 *
 * Uebernommen wird nur, wenn hier noch nichts eingerichtet ist. Wer in der
 * Huelle bewusst etwas anderes eingestellt hat, bekommt nicht den alten
 * Stand zurueck.
 */
export async function findeKiUebernahme(
  aktuell: ShellSettings,
  backstorySettingsDatei: string
): Promise<Partial<ShellSettings> | null> {
  if (aktuell.ki.anbieter !== 'none' || aktuell.claudeSchluessel) return null;

  let roh: Record<string, unknown>;
  try {
    roh = JSON.parse(await readFile(backstorySettingsDatei, 'utf8')) as Record<string, unknown>;
  } catch {
    return null; // Keine Datei, kaputte Datei: dann eben nichts zu uebernehmen.
  }

  const anbieter = roh.aiProvider;
  const schluessel = typeof roh.claudeApiKeyEncrypted === 'string' ? roh.claudeApiKeyEncrypted : '';
  if (!istAnbieterId(anbieter) || anbieter === 'none') {
    // Ein Schluessel ohne eingerichteten Anbieter ist trotzdem die Muehe
    // wert: den will niemand zweimal eintippen.
    return schluessel ? { claudeSchluessel: schluessel } : null;
  }

  const text = (wert: unknown, vorgabe: string) =>
    typeof wert === 'string' && wert.trim() ? wert : vorgabe;

  return {
    ki: {
      anbieter,
      ollamaAdresse: text(roh.ollamaBaseUrl, aktuell.ki.ollamaAdresse),
      ollamaModell: text(roh.ollamaModel, aktuell.ki.ollamaModell),
      claudeModell: text(roh.claudeModel, aktuell.ki.claudeModell),
      // Den offenen Anbieter gab es im Story Creator nie, es ist also
      // nichts zu uebernehmen.
      offenAdresse: aktuell.ki.offenAdresse,
      offenModell: aktuell.ki.offenModell
    },
    claudeSchluessel: schluessel
  };
}
