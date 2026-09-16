/**
 * Die Bewegungsrate.
 *
 * In D&D steht sie in jedem Statblock, und ohne sie ist der Kampf auf der
 * Karte nicht zu leiten: „kommt es diese Runde bei mir an" ist die Frage,
 * die am Tisch am oeftesten gestellt wird.
 *
 * Standard sind 30 Fuss zu Fuss. Klettern, Schwimmen, Fliegen und Graben
 * gibt es dazu — aber NICHT immer und nicht alles auf einmal. Ein Monster,
 * das laeuft, klettert, schwimmt und fliegt, ist kein Monster, sondern eine
 * Aufzaehlung. Deshalb haengt jede zusaetzliche Art an einer Chance, und die
 * haengt an der Art des Wesens.
 *
 * Auf den Herausforderungsgrad wirkt das nicht: Bewegung macht ein Monster
 * beweglicher, nicht staerker. Sie geht deshalb bewusst nicht in die
 * Pruefung ein.
 */

import type { Paar, Sprache, Thema } from './tabellen';
import { text } from './tabellen';

export type GangartId = 'gehen' | 'klettern' | 'schwimmen' | 'fliegen' | 'graben';

export interface Gangart {
  readonly art: GangartId;
  /** In Fuss. Immer ein Vielfaches von fuenf, wie im Regelwerk. */
  readonly fuss: number;
}

export interface Bewegung {
  readonly gangarten: readonly Gangart[];
}

const NAMEN: Record<GangartId, Paar> = {
  gehen: { de: '', en: '' },
  klettern: { de: 'klettern', en: 'climb' },
  schwimmen: { de: 'schwimmen', en: 'swim' },
  fliegen: { de: 'fliegen', en: 'fly' },
  graben: { de: 'graben', en: 'burrow' }
};

/**
 * Wie wahrscheinlich eine zusaetzliche Gangart ist, je Art des Wesens.
 *
 * Eigene Einschaetzung aus dem, was in den Regelwerken ueblich ist, keine
 * Tabelle aus einer Quelle. Sie ist bewusst zurueckhaltend: die meisten
 * Monster laufen einfach.
 */
const CHANCEN: Record<string, Partial<Record<GangartId, number>>> = {
  untot: { klettern: 0.1, fliegen: 0.15 },
  bestie: { klettern: 0.3, schwimmen: 0.25, fliegen: 0.15, graben: 0.1 },
  konstrukt: { klettern: 0.15, graben: 0.1 },
  aberration: { fliegen: 0.3, klettern: 0.2, graben: 0.15 },
  elementar: { fliegen: 0.35, schwimmen: 0.3, graben: 0.2 },
  unhold: { fliegen: 0.35, klettern: 0.15 },
  fee: { fliegen: 0.4, klettern: 0.2 },
  drache: { fliegen: 0.8, schwimmen: 0.25, klettern: 0.1 },
  humanoid: { klettern: 0.1, schwimmen: 0.1 },
  pflanze: { klettern: 0.15, graben: 0.2 }
};

/** Die uebliche Grundgeschwindigkeit. Dreissig Fuss, wie fast alles in D&D. */
export const GRUNDTEMPO = 30;

/** Auf das naechste Vielfache von fuenf, wie es im Statblock steht. */
function aufFuenf(wert: number): number {
  return Math.max(5, Math.round(wert / 5) * 5);
}

/**
 * Die Bewegung eines Monsters.
 *
 * Zu Fuss zwischen 20 und 40 Fuss — langsam, normal, schnell. Alles
 * Weitere nur, wenn der Wurf es hergibt, und hoechstens zwei zusaetzliche
 * Arten: wer fliegt und schwimmt und graebt, braucht keine Karte mehr.
 *
 * Wer fliegt, laeuft meistens langsamer. Das ist keine Regel aus dem Buch,
 * sondern eine Beobachtung an den Statblocks, und sie macht den Unterschied
 * zwischen einem Wesen, das fliegt, und einem, das alles kann.
 */
export function bewegungFuer(thema: Thema, rng: () => number): Bewegung {
  const gehen = aufFuenf(GRUNDTEMPO + (Math.floor(rng() * 3) - 1) * 10);
  const gangarten: Gangart[] = [{ art: 'gehen', fuss: gehen }];

  const chancen = CHANCEN[thema.id] ?? {};
  const moeglich: GangartId[] = ['fliegen', 'klettern', 'schwimmen', 'graben'];
  for (const art of moeglich) {
    if (gangarten.length >= 3) break;
    const chance = chancen[art] ?? 0;
    if (rng() >= chance) continue;

    // Fliegen ist schneller als Laufen, Graben langsamer, der Rest ungefaehr
    // gleich. Auch das aus den Statblocks abgesehen, nicht aus einer Tabelle.
    const faktor = art === 'fliegen' ? 1.5 : art === 'graben' ? 0.5 : 1;
    gangarten.push({ art, fuss: aufFuenf(gehen * faktor) });
  }

  // Wer fliegt, ist zu Fuss langsamer — sonst ist Fliegen ein reiner Zusatz.
  if (gangarten.some((g) => g.art === 'fliegen') && gehen > 20) {
    gangarten[0] = { art: 'gehen', fuss: aufFuenf(gehen - 10) };
  }
  return { gangarten };
}

/** Die Zeile, wie sie im Statblock steht: „30 ft., fly 60 ft." */
export function alsZeile(bewegung: Bewegung, sprache: Sprache): string {
  const einheit = sprache === 'en' ? 'ft.' : 'Fuß';
  return bewegung.gangarten
    .map((gangart) => {
      const name = text(NAMEN[gangart.art], sprache);
      return name ? `${name} ${gangart.fuss} ${einheit}` : `${gangart.fuss} ${einheit}`;
    })
    .join(', ');
}
