/**
 * Fensterlage ueber Sitzungen hinweg merken.
 *
 * Bewusst klein gehalten und ohne Abhaengigkeit: eine JSON-Datei im
 * userData-Verzeichnis. Faellt irgendetwas daran aus (Datei kaputt, Platte
 * voll, Bildschirm abgezogen), startet das Fenster in Standardgroesse. Ein
 * vergessener Fensterplatz ist ein Schoenheitsfehler, ein Absturz beim Start
 * waere keiner — deshalb schluckt dieses Modul seine Fehler.
 *
 * Die Bildschirmbereiche kommen als Parameter herein und werden nicht selbst
 * bei `electron` erfragt. Dadurch bleibt die Datei ohne `electron`-Import und
 * ihre Rechenregeln lassen sich in gewoehnlichen Tests pruefen, statt nur im
 * laufenden Fenster.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized: boolean;
}

export const DEFAULT_STATE: WindowState = {
  width: 1280,
  height: 860,
  maximized: false
};

const MIN_WIDTH = 960;
const MIN_HEIGHT = 640;

export { MIN_WIDTH, MIN_HEIGHT };

/**
 * Prueft, ob eine gespeicherte Lage auf einem der angeschlossenen Bildschirme
 * noch sichtbar waere.
 *
 * Ohne diese Pruefung landet das Fenster nach dem Abziehen eines zweiten
 * Monitors ausserhalb jedes sichtbaren Bereichs, und die Anwendung sieht aus,
 * als starte sie nicht. Verlangt wird nicht die volle Flaeche, sondern ein
 * greifbares Stueck der Titelleiste: sonst gaebe schon ein leicht ueber den
 * Rand geschobenes Fenster seine Position auf.
 */
export function isVisibleOnSomeDisplay(
  state: WindowState,
  bereiche: readonly { x: number; y: number; width: number; height: number }[]
): boolean {
  if (bereiche.length === 0) return true;
  if (state.x === undefined || state.y === undefined) return true;
  const GREIFRAND = 80;
  return bereiche.some((b) => {
    const schnittBreite = Math.min(state.x! + state.width, b.x + b.width) - Math.max(state.x!, b.x);
    const schnittHoehe = Math.min(state.y! + state.height, b.y + b.height) - Math.max(state.y!, b.y);
    return schnittBreite >= GREIFRAND && schnittHoehe >= GREIFRAND;
  });
}

/** Erzwingt sinnvolle Werte, egal was in der Datei stand. */
export function sanitize(roh: unknown): WindowState {
  if (typeof roh !== 'object' || roh === null) return { ...DEFAULT_STATE };
  const wert = roh as Record<string, unknown>;
  const zahl = (v: unknown): number | undefined =>
    typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : undefined;

  return {
    x: zahl(wert.x),
    y: zahl(wert.y),
    width: Math.max(MIN_WIDTH, zahl(wert.width) ?? DEFAULT_STATE.width),
    height: Math.max(MIN_HEIGHT, zahl(wert.height) ?? DEFAULT_STATE.height),
    maximized: wert.maximized === true
  };
}

export interface Bereich {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function readWindowState(
  datei: string,
  bereiche: readonly Bereich[]
): Promise<WindowState> {
  let gelesen: unknown;
  try {
    gelesen = JSON.parse(await readFile(datei, 'utf8'));
  } catch {
    return { ...DEFAULT_STATE };
  }
  const zustand = sanitize(gelesen);
  if (!isVisibleOnSomeDisplay(zustand, bereiche)) {
    return { width: zustand.width, height: zustand.height, maximized: zustand.maximized };
  }
  return zustand;
}

export async function writeWindowState(datei: string, zustand: WindowState): Promise<void> {
  try {
    await mkdir(dirname(datei), { recursive: true });
    await writeFile(datei, JSON.stringify(zustand, null, 2), 'utf8');
  } catch {
    // Ein nicht gemerkter Fensterplatz ist kein Grund, den Nutzer zu stoeren.
  }
}

/**
 * Dasselbe, aber blockierend — fuer den Moment des Schliessens.
 *
 * Dort ist die asynchrone Fassung nutzlos: das Fenster ist weg und der Prozess
 * endet, bevor das Schreiben drankaeme. Wer die Anwendung startet, das Fenster
 * an seinen Platz zieht und wieder schliesst, ohne dass ein Zeitgeber noch
 * gefeuert hat, faende seine Lage sonst nicht wieder.
 */
export function writeWindowStateSync(datei: string, zustand: WindowState): void {
  try {
    mkdirSync(dirname(datei), { recursive: true });
    writeFileSync(datei, JSON.stringify(zustand, null, 2), 'utf8');
  } catch {
    // Siehe oben.
  }
}
