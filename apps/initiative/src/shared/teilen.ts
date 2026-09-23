/**
 * Die geteilte Initiative (docs/austausch.md, Raum).
 *
 * Wer seinen Kampf teilt, fuehrt ihn: sein Stand ist der maßgebliche, und
 * er schickt bei jeder Aenderung eine Ansicht in den Raum. Die Ansicht ist
 * GEFILTERT — entschieden von der Nutzerin:
 *
 * - Spielerfiguren stehen mit genauen Trefferpunkten da.
 * - Von allen anderen sehen die Spieler nur Name, Reihenfolge und einen
 *   groben Zustand (unverletzt / angeschlagen / schwer verletzt /
 *   kampfunfaehig), keine Zahlen.
 * - Zustaende („Liegend") sieht jeder; sie sind am Tisch ohnehin sichtbar.
 *
 * Spieler duerfen ihre EIGENE Figur aendern: Trefferpunkte und Zustaende.
 * Die Aenderung geht an den, der teilt; er prueft sie gegen `besitz`,
 * wendet sie an und schickt die neue Ansicht an alle.
 *
 * Plattformfrei und ohne Oberflaeche.
 */
import { entferneZustand, neueId, reihenfolge, setzeHp, setzeZustand } from './kampf';
import type { Kampf, Teilnehmer } from './types';

/** Was ein Werkzeug vom Raum wissen muss: wer man ist und wer da ist. */
export interface RaumLage {
  readonly rolle: 'aus' | 'gastgeber' | 'gast';
  readonly ich: { readonly id: string; readonly name: string } | null;
  readonly personen: readonly { readonly id: string; readonly name: string }[];
}

export const KEIN_RAUM: RaumLage = { rolle: 'aus', ich: null, personen: [] };

export type Stufe = 'unverletzt' | 'angeschlagen' | 'schwer' | 'kampfunfaehig';

export interface GeteilterKoerper {
  readonly id: string;
  readonly marke: string;
  /** Nur bei Spielerfiguren. */
  readonly hp?: number;
  readonly hpMax?: number;
  readonly tempHp?: number;
  readonly stufe: Stufe;
  readonly raus: boolean;
}

export interface GeteilterTeilnehmer {
  readonly id: string;
  readonly name: string;
  readonly istSpieler: boolean;
  readonly istTerrain: boolean;
  /** Name der Person im Raum, der die Figur gehoert, oder null. */
  readonly gehoert: string | null;
  readonly koerper: readonly GeteilterKoerper[];
  readonly zustaende: readonly { readonly id: string; readonly name: string; readonly rundenRest: number | null }[];
  readonly amZug: boolean;
}

export interface GeteilterKampf {
  readonly version: 1;
  readonly name: string;
  readonly runde: number;
  readonly laeuft: boolean;
  /** In der Reihenfolge des Kampfes. */
  readonly teilnehmer: readonly GeteilterTeilnehmer[];
}

export type Aenderung =
  | { readonly art: 'hp'; readonly teilnehmerId: string; readonly koerperId: string; readonly hp: number }
  | { readonly art: 'zustand-dazu'; readonly teilnehmerId: string; readonly name: string; readonly runden: number | null }
  | { readonly art: 'zustand-weg'; readonly teilnehmerId: string; readonly zustandId: string };

/** Was ueber den Raum geht, als Inhalt einer Werkzeugnachricht. */
export type Botschaft =
  | { readonly art: 'stand'; readonly stand: GeteilterKampf }
  | { readonly art: 'ende' }
  | { readonly art: 'aenderung'; readonly aenderung: Aenderung };

export function stufe(hp: number, hpMax: number): Stufe {
  if (hp <= 0) return 'kampfunfaehig';
  if (hpMax <= 0 || hp >= hpMax) return 'unverletzt';
  return hp * 2 <= hpMax ? 'schwer' : 'angeschlagen';
}

/**
 * Die Ansicht fuer den Raum: Spieler genau, alle anderen grob.
 *
 * `stufen: false` laesst auch das Grobe weg: von Gegnern sehen die Spieler
 * dann nur Name, Reihenfolge und Zustaende.
 */
export function teileKampf(kampf: Kampf, stufen = true): GeteilterKampf {
  // Laeuft der Kampf, ist die Liste schon sortiert und `amZug` zeigt direkt
  // hinein (siehe beginne()).
  const liste: readonly Teilnehmer[] = kampf.laeuft ? kampf.teilnehmer : reihenfolge(kampf.teilnehmer);
  const amZugId = kampf.laeuft ? kampf.teilnehmer[kampf.amZug]?.id : undefined;
  return {
    version: 1,
    name: kampf.name,
    runde: kampf.runde,
    laeuft: kampf.laeuft,
    teilnehmer: liste.map((t) => ({
      id: t.id,
      name: t.name,
      istSpieler: t.istSpieler,
      istTerrain: t.istTerrain,
      gehoert: kampf.besitz?.[t.id] ?? null,
      amZug: t.id === amZugId,
      zustaende: t.zustaende.map((z) => ({ id: z.id, name: z.name, rundenRest: z.rundenRest })),
      koerper:
        t.istTerrain || (!stufen && !t.istSpieler)
          ? []
          : t.koerper.map((k) => ({
              id: k.id,
              marke: k.marke,
              stufe: stufe(k.hp, k.hpMax),
              raus: k.raus,
              ...(t.istSpieler ? { hp: k.hp, hpMax: k.hpMax, tempHp: k.tempHp } : {})
            }))
    }))
  };
}

function text(wert: unknown, max: number): wert is string {
  return typeof wert === 'string' && wert.length > 0 && wert.length <= max;
}

/** Prueft eine Botschaft aus dem Raum. Alles, was nicht passt, ist `null`. */
export function leseBotschaft(roh: string): Botschaft | null {
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(roh) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (typeof b !== 'object' || b === null) return null;
  if (b.art === 'ende') return { art: 'ende' };
  if (b.art === 'stand') {
    const s = b.stand as GeteilterKampf;
    if (typeof s !== 'object' || s === null || s.version !== 1 || !Array.isArray(s.teilnehmer)) return null;
    return { art: 'stand', stand: s };
  }
  if (b.art === 'aenderung') {
    const a = b.aenderung as Record<string, unknown>;
    if (typeof a !== 'object' || a === null || !text(a.teilnehmerId, 64)) return null;
    if (a.art === 'hp' && text(a.koerperId, 64) && typeof a.hp === 'number' && Number.isFinite(a.hp)) {
      return { art: 'aenderung', aenderung: { art: 'hp', teilnehmerId: a.teilnehmerId, koerperId: a.koerperId, hp: Math.round(a.hp) } };
    }
    if (a.art === 'zustand-dazu' && text(a.name, 60) && (a.runden === null || (typeof a.runden === 'number' && a.runden > 0 && a.runden < 1000))) {
      return {
        art: 'aenderung',
        aenderung: { art: 'zustand-dazu', teilnehmerId: a.teilnehmerId, name: a.name.trim(), runden: a.runden === null ? null : Math.round(a.runden as number) }
      };
    }
    if (a.art === 'zustand-weg' && text(a.zustandId, 64)) {
      return { art: 'aenderung', aenderung: { art: 'zustand-weg', teilnehmerId: a.teilnehmerId, zustandId: a.zustandId } };
    }
  }
  return null;
}

/**
 * Wendet die Aenderung einer Person an, wenn die Figur ihr gehoert.
 * Sonst `null`: niemand aendert die Figur eines anderen, und keiner die
 * Gegner.
 */
export function wendeAn(kampf: Kampf, aenderung: Aenderung, person: string): Kampf | null {
  const t = kampf.teilnehmer.find((x) => x.id === aenderung.teilnehmerId);
  if (!t || kampf.besitz?.[t.id] !== person) return null;
  if (aenderung.art === 'hp') {
    if (!t.koerper.some((k) => k.id === aenderung.koerperId)) return null;
    return setzeHp(kampf, t.id, aenderung.koerperId, aenderung.hp);
  }
  if (aenderung.art === 'zustand-dazu') {
    return setzeZustand(kampf, t.id, {
      id: neueId(),
      name: aenderung.name,
      dauer: aenderung.runden === null ? 'offen' : 'rundeEnde',
      rundenRest: aenderung.runden,
      frisch: false
    });
  }
  if (!t.zustaende.some((z) => z.id === aenderung.zustandId)) return null;
  return entferneZustand(kampf, t.id, aenderung.zustandId);
}

/** Ordnet eine Figur einer Person zu, oder loest sie (`null`). */
export function setzeBesitz(kampf: Kampf, teilnehmerId: string, person: string | null): Kampf {
  const besitz = { ...(kampf.besitz ?? {}) };
  if (person) besitz[teilnehmerId] = person;
  else delete besitz[teilnehmerId];
  return { ...kampf, besitz };
}
