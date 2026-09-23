/**
 * Der Austausch aus Sicht der Huelle (docs/austausch.md, Stufe 1).
 *
 * Die Huelle vermittelt nur. Was eine Sendung ist und wie ein Paket
 * aussieht, steht in `@suite/austausch`; was ein Eintrag enthaelt und wie er
 * abgelegt wird, weiss das jeweilige Werkzeug (`austausch` in seiner
 * embed.ts). Hier steht, WER mitmacht, und der Weg dazwischen.
 *
 * Stufe 1 ohne Netz: weitergegeben wird als Datei, eingelesen aus einer
 * Datei. Genau derselbe Weg wird spaeter der Raum im lokalen Netz gehen —
 * nur dass das Paket dann nicht auf der Platte liegt, sondern ankommt.
 */
import { readFile, stat, writeFile } from 'node:fs/promises';
import {
  alsPaket,
  lesePaket,
  MAX_PAKET_BYTES,
  PaketFehler,
  VORGABE_MODUS,
  type Empfang,
  type Modus,
  type Paket,
  type Sendung,
  type Teilnehmer,
  type Ziel
} from '@suite/austausch';
import type { Eintrag } from '@suite/eintraege';
import { austausch as monster } from '../../../monster/src/main/embed';
import { austausch as notizen } from '../../../backstory/src/main/embed';
import { austausch as regeln } from '../../../nachschlagewerk/src/main/embed';
import { alleEintraege } from './suche';

/**
 * Wer mitmacht. Ein Werkzeug ohne Eintrag hier taucht im Austausch nicht
 * auf; die Huelle muss ueber es nichts wissen.
 */
const TEILNEHMER: ReadonlyMap<string, Teilnehmer> = new Map(
  [monster, notizen, regeln].map((t) => [t.werkzeug, t])
);

export function machtMit(werkzeug: string): boolean {
  return TEILNEHMER.has(werkzeug);
}

/**
 * Was sich weitergeben laesst: die Eintraege der Suche aus den Werkzeugen,
 * die mitmachen. Ohne die Notizen am Regeltext — die sind fuer einen selbst
 * (docs/austausch.md).
 */
export async function teilbar(datenordner: string): Promise<readonly Eintrag[]> {
  return (await alleEintraege(datenordner)).filter(
    (e) => machtMit(e.werkzeug) && !(e.werkzeug === 'nachschlagewerk' && e.kennung.startsWith('notiz/'))
  );
}

/** Schnuert die gewaehlten Eintraege. Was es nicht mehr gibt, faellt heraus. */
export async function schnuere(
  datenordner: string,
  auswahl: readonly { werkzeug: string; kennung: string }[]
): Promise<Paket> {
  const sendungen: Sendung[] = [];
  for (const { werkzeug, kennung } of auswahl) {
    const sendung = await TEILNEHMER.get(werkzeug)?.gib(datenordner, kennung);
    if (sendung) sendungen.push(sendung);
  }
  return { version: 1, erstellt: new Date().toISOString(), sendungen };
}

export async function schreibePaket(datei: string, paket: Paket): Promise<void> {
  await writeFile(datei, alsPaket(paket), 'utf8');
}

/** Liest ein Paket von der Platte. Wirft `PaketFehler` mit einem lesbaren Grund. */
export async function lesePaketDatei(datei: string): Promise<Paket> {
  const groesse = (await stat(datei)).size;
  if (groesse > MAX_PAKET_BYTES) throw new PaketFehler('Die Datei ist zu gross fuer ein Paket');
  return lesePaket(await readFile(datei, 'utf8'));
}

/** Eine empfangene Sendung, wie die Oberflaeche sie zum Entscheiden braucht. */
export interface Ankunft {
  readonly nummer: number;
  readonly werkzeug: string;
  readonly name: string;
  readonly art: string;
  readonly bilder: number;
  /** Eine offizielle Regel: sie wird nur genannt, nichts wird geschrieben. */
  readonly verweis: boolean;
  /** Ob ein Werkzeug hier sie annehmen kann. */
  readonly annehmbar: boolean;
}

export function ankuenfte(paket: Paket): Ankunft[] {
  return paket.sendungen.map((s, nummer) => ({
    nummer,
    werkzeug: s.werkzeug,
    name: s.name,
    art: s.art,
    bilder: s.bilder.length,
    verweis: s.inhalt === null,
    annehmbar: machtMit(s.werkzeug)
  }));
}

/** Die Orte, an die etwas gehen kann, je Werkzeug (nur, wo es mehrere gibt). */
export async function zieleFuer(datenordner: string, werkzeuge: readonly string[]): Promise<Record<string, readonly Ziel[]>> {
  const heraus: Record<string, readonly Ziel[]> = {};
  for (const werkzeug of new Set(werkzeuge)) {
    const t = TEILNEHMER.get(werkzeug);
    if (t?.ziele) heraus[werkzeug] = await t.ziele(datenordner);
  }
  return heraus;
}

/** Welche Sendungen es im jeweiligen Ziel schon gibt. */
export async function konflikte(
  datenordner: string,
  paket: Paket,
  ziele: Readonly<Record<string, string>>
): Promise<boolean[]> {
  return Promise.all(
    paket.sendungen.map(async (s) => {
      const t = TEILNEHMER.get(s.werkzeug);
      return t ? t.gibtEs(datenordner, s, ziele[s.werkzeug]) : false;
    })
  );
}

/** Nimmt die Sendungen an, jede nach ihrer Entscheidung. */
export async function nimmAn(
  datenordner: string,
  paket: Paket,
  entscheidungen: readonly { nummer: number; modus?: Modus }[],
  ziele: Readonly<Record<string, string>>
): Promise<(Empfang & { werkzeug: string; name: string })[]> {
  const heraus: (Empfang & { werkzeug: string; name: string })[] = [];
  for (const { nummer, modus } of entscheidungen) {
    const s = paket.sendungen[nummer];
    if (!s) continue;
    const t = TEILNEHMER.get(s.werkzeug);
    if (!t) {
      heraus.push({ ok: false, grund: 'kein Werkzeug dafür', werkzeug: s.werkzeug, name: s.name });
      continue;
    }
    try {
      const empfang = await t.nimmAn(datenordner, s, modus ?? VORGABE_MODUS, ziele[s.werkzeug]);
      heraus.push({ ...empfang, werkzeug: s.werkzeug, name: s.name });
    } catch (fehler) {
      heraus.push({
        ok: false,
        grund: fehler instanceof Error ? fehler.message : String(fehler),
        werkzeug: s.werkzeug,
        name: s.name
      });
    }
  }
  return heraus;
}
