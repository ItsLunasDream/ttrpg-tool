/**
 * Eine gesicherte Kampagne wieder einlesen.
 *
 * Die Sicherung als ZIP gab es laengst, den Weg zurueck nicht: wer eine
 * Kampagne zurueckholen wollte, musste den Ordner von Hand an die richtige
 * Stelle kopieren und die Anwendung neu starten. Eine Sicherung, die man nur
 * von Hand zurueckspielen kann, ist keine.
 *
 * Zwei Regeln, die hier zaehlen:
 *
 * 1. Es wird NIE ueberschrieben. Die Kennung aus dem Archiv kann schon
 *    vergeben sein; dann bekommt die eingelesene Kampagne eine neue. Sonst
 *    verloere jemand eine Kampagne und merkte es Wochen spaeter.
 * 2. Jeder Pfad aus dem Archiv wird geprueft, bevor er in einen Dateipfad
 *    wandert. Ein Archiv, das beim Entpacken ausserhalb seines Ordners
 *    schreibt, ist die klassische Luecke an dieser Stelle.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { unzipSync } from 'fflate';

/** Was aus dem Archiv uebernommen wird, und sonst nichts. */
const ERLAUBTE_ORDNER = ['notes', 'assets', 'history'];

export interface EingelesenesArchiv {
  /** Der Inhalt von campaign.json, ungeprueft. */
  readonly kampagne: Record<string, unknown>;
  /** Pfad innerhalb der Kampagne -> Inhalt. */
  readonly dateien: Map<string, Uint8Array>;
}

/**
 * Ist der Pfad harmlos?
 *
 * Kein Wurzelpfad, kein Laufwerksbuchstabe, kein Schritt nach oben, keine
 * Rueckwaertsschraegstriche, die unter Windows als Trenner zaehlen.
 */
export function harmloserPfad(eintrag: string): boolean {
  if (!eintrag || eintrag.startsWith('/') || eintrag.startsWith('\\')) return false;
  if (/^[A-Za-z]:/.test(eintrag)) return false;
  if (eintrag.includes('\\')) return false;
  return eintrag.split('/').every((teil) => teil !== '' && teil !== '.' && teil !== '..');
}

/**
 * Schaelt den Ordner ab, in dem das Archiv seine Kampagne fuehrt.
 *
 * Gepackt wird mit dem Kampagnenordner als oberster Ebene. Liegt
 * campaign.json direkt oben, gibt es nichts abzuschaelen.
 */
export function ohneWurzel(pfade: string[]): string {
  if (pfade.includes('campaign.json')) return '';

  const erste = pfade
    .filter((pfad) => pfad.includes('/'))
    .map((pfad) => pfad.slice(0, pfad.indexOf('/')));
  const einzig = new Set(erste);
  if (einzig.size !== 1) return '';

  const wurzel = `${[...einzig][0]}/`;
  return pfade.includes(`${wurzel}campaign.json`) ? wurzel : '';
}

/** Liest das Archiv und gibt zurueck, was uebernommen werden darf. */
export function leseArchiv(inhalt: Uint8Array): EingelesenesArchiv | null {
  const entpackt = unzipSync(inhalt);
  const pfade = Object.keys(entpackt);
  const wurzel = ohneWurzel(pfade);

  const roh = entpackt[`${wurzel}campaign.json`];
  if (!roh) return null;

  let kampagne: Record<string, unknown>;
  try {
    kampagne = JSON.parse(new TextDecoder().decode(roh)) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!kampagne || typeof kampagne !== 'object' || typeof kampagne.name !== 'string') return null;

  const dateien = new Map<string, Uint8Array>();
  for (const [pfad, daten] of Object.entries(entpackt)) {
    if (!pfad.startsWith(wurzel)) continue;
    // Ordnereintraege tragen keinen Inhalt.
    if (pfad.endsWith('/')) continue;

    const innen = pfad.slice(wurzel.length);
    if (innen === 'campaign.json') continue;
    if (!harmloserPfad(innen)) continue;
    if (!ERLAUBTE_ORDNER.includes(innen.split('/')[0])) continue;

    dateien.set(innen, daten);
  }

  return { kampagne, dateien };
}

/** Schreibt die Dateien des Archivs in einen frisch angelegten Ordner. */
export async function schreibeArchiv(zielordner: string, dateien: Map<string, Uint8Array>): Promise<void> {
  for (const [innen, daten] of dateien) {
    const ziel = path.join(zielordner, innen);
    // Guertel und Hosentraeger: harmloserPfad hat schon gefiltert, aber der
    // fertige Pfad muss im Zielordner liegen, sonst wird nichts geschrieben.
    const drin = path.relative(zielordner, ziel);
    if (drin.startsWith('..') || path.isAbsolute(drin)) continue;

    await fs.mkdir(path.dirname(ziel), { recursive: true });
    await fs.writeFile(ziel, daten);
  }
}
