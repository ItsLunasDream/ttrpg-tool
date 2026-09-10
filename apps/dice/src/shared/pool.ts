/**
 * Der Wuerfelpool und das Auswerten eines Wurfs.
 *
 * Reine Funktionen, kein DOM, keine Dateien. Gewuerfelt wird ueber
 * `packages/dice`; hier steht nur, wie aus einer Auswahl ein Wurf wird und
 * wie sich das Ergebnis zusammenrechnet.
 */
import type { RandomSource } from '@suite/dice';
import { rollDie } from '@suite/dice';
import { ARTEN, seitenVon, type Art } from './formen';

/**
 * Die Auswahl: je Art eine ganze Zahl.
 *
 * Sie darf negativ sein — dann wird abgezogen. `3` beim d20 und `-2` beim d4
 * heisst `3d20 - 2d4`. Das ist einfacher als ein Vorzeichen je Wuerfel und
 * naeher an dem, was man ohnehin tippt.
 */
export type Auswahl = Partial<Record<Art, number>>;

/** Hoechstzahl je Art. Ohne Grenze liesse sich das Feld beliebig fuellen. */
export const MAX_PRO_ART = 100;

/**
 * Die Grenze des Modifikators.
 *
 * Zuerst gab es keine: getippt wurde „999999999", und die Zahl stand so im
 * Ausdruck und in der Summe, wo sie jede Wuerfelzahl unlesbar machte. Vier
 * Stellen sind weit jenseits dessen, was am Tisch vorkommt.
 */
export const MAX_MODIFIKATOR = 9999;

/** Schneidet einen getippten Modifikator auf das Erlaubte zurecht. */
export function begrenzeModifikator(wert: number): number {
  if (!Number.isFinite(wert)) return 0;
  return Math.max(-MAX_MODIFIKATOR, Math.min(MAX_MODIFIKATOR, Math.trunc(wert)));
}

export interface Einzelwurf {
  readonly art: Art;
  readonly seiten: number;
  readonly augen: number;
  /** `false` heisst: dieser Wuerfel wird abgezogen. */
  readonly zaehltPositiv: boolean;
  /** Hoechstzahl gewuerfelt. Bei Abzugswuerfeln immer `false` — siehe unten. */
  readonly istHoechst: boolean;
  /** Eine Eins gewuerfelt. Bei Abzugswuerfeln immer `false`. */
  readonly istTiefst: boolean;
}

export interface Wurf {
  readonly wuerfe: readonly Einzelwurf[];
  readonly modifikator: number;
  /** Summe der positiven minus Summe der negativen, plus Modifikator. */
  readonly summe: number;
  /** Der Rechenweg als Text, z. B. „3d20 - 2d4 + 5". */
  readonly ausdruck: string;
}

/** Setzt eine Anzahl und haelt sie in den Grenzen. */
export function setzeAnzahl(auswahl: Auswahl, art: Art, anzahl: number): Auswahl {
  const begrenzt = Math.max(-MAX_PRO_ART, Math.min(MAX_PRO_ART, Math.trunc(anzahl) || 0));
  const naechste = { ...auswahl };
  // Null heisst „nicht im Wurf" und fliegt raus, statt als 0 stehenzubleiben:
  // sonst stuende die Art weiter im Ausdruck.
  if (begrenzt === 0) delete naechste[art];
  else naechste[art] = begrenzt;
  return naechste;
}

/** Erhoeht oder verringert um eins. */
export function aendereAnzahl(auswahl: Auswahl, art: Art, schritt: number): Auswahl {
  return setzeAnzahl(auswahl, art, (auswahl[art] ?? 0) + schritt);
}

/**
 * Die Arten in der Reihenfolge, in der sie im Wurf erscheinen: erst die, die
 * dazugezaehlt werden, dann die Abzuege — je nach Wuerfelart sortiert.
 *
 * Nicht einfach die Reihenfolge von `ARTEN`, und das ist der Grund: dort
 * steht der d4 vor dem d20, ein Wurf aus 3d20 und -2d4 hiesse also
 * „-2d4 + 3d20". Das ist dieselbe Rechnung und liest sich wie ein Fehler.
 * Ein Ausdruck faengt mit dem an, was man dazuzaehlt.
 *
 * Dieselbe Reihenfolge gilt beim Wuerfeln, damit die abgebildeten Wuerfel in
 * derselben Folge stehen wie der Ausdruck darueber — sonst sucht man beim
 * Nachrechnen die falsche Zahl.
 */
function reihenfolge(auswahl: Auswahl): Art[] {
  const positiv = ARTEN.filter((art) => (auswahl[art] ?? 0) > 0);
  const negativ = ARTEN.filter((art) => (auswahl[art] ?? 0) < 0);
  return [...positiv, ...negativ];
}

/** Wie viele Wuerfel insgesamt geworfen werden — Abzugswuerfel zaehlen mit. */
export function anzahlGesamt(auswahl: Auswahl): number {
  return ARTEN.reduce((summe, art) => summe + Math.abs(auswahl[art] ?? 0), 0);
}

/**
 * Schreibt die Auswahl als Ausdruck.
 *
 * Das erste Glied traegt kein Pluszeichen, die folgenden schon. Ohne diesen
 * Unterschied stuende „+3d20 - 2d4" da, was niemand so schreibt.
 */
export function alsAusdruck(auswahl: Auswahl, eigeneSeiten: number, modifikator: number): string {
  const glieder: string[] = [];
  for (const art of reihenfolge(auswahl)) {
    const anzahl = auswahl[art] ?? 0;
    if (anzahl === 0) continue;
    const zeichen = anzahl < 0 ? '-' : glieder.length === 0 ? '' : '+';
    const wuerfel = `${Math.abs(anzahl)}d${seitenVon(art, eigeneSeiten)}`;
    glieder.push(glieder.length === 0 ? `${zeichen}${wuerfel}` : `${zeichen} ${wuerfel}`);
  }
  if (glieder.length === 0) return '';
  const rumpf = glieder.join(' ');
  if (modifikator === 0) return rumpf;
  return `${rumpf} ${modifikator < 0 ? '-' : '+'} ${Math.abs(modifikator)}`;
}

/**
 * Wuerfelt die Auswahl aus.
 *
 * Abzugswuerfel bekommen weder den Hoechst- noch den Tiefstwurf angerechnet:
 * eine 4 auf dem d4 in „1d20 - 1d4" ist die hoechste Zahl, aber fuer den Wurf
 * das schlechteste Ergebnis. Sie zu feiern waere verwirrend, und die Regel
 * umzudrehen hiesse, dass dasselbe Zeichen im selben Wurf zwei Bedeutungen
 * haette.
 */
export function wuerfle(
  auswahl: Auswahl,
  eigeneSeiten: number,
  modifikator: number,
  rng: RandomSource = Math.random
): Wurf {
  const wuerfe: Einzelwurf[] = [];
  let summe = 0;

  for (const art of reihenfolge(auswahl)) {
    const anzahl = auswahl[art] ?? 0;
    if (anzahl === 0) continue;
    const seiten = seitenVon(art, eigeneSeiten);
    const positiv = anzahl > 0;
    for (let i = 0; i < Math.abs(anzahl); i++) {
      const augen = rollDie(seiten, rng);
      summe += positiv ? augen : -augen;
      wuerfe.push({
        art,
        seiten,
        augen,
        zaehltPositiv: positiv,
        istHoechst: positiv && augen === seiten,
        istTiefst: positiv && augen === 1
      });
    }
  }

  return {
    wuerfe,
    modifikator,
    summe: summe + modifikator,
    ausdruck: alsAusdruck(auswahl, eigeneSeiten, modifikator)
  };
}
