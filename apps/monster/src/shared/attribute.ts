/**
 * Die sechs Attribute — und warum sie hier nicht frei erfunden werden.
 *
 * In D&D haengen am Attribut mehr als sechs huebsche Zahlen: der
 * Angriffsbonus ist Uebungsbonus plus Modifikator, der Rettungs-SG ist acht
 * plus dasselbe. Wer die Attribute wuerfelt, ohne das nachzurechnen, baut
 * ein Monster, dessen Statblock sich widerspricht — und das faellt am Tisch
 * beim ersten Angriffswurf auf.
 *
 * Deshalb gilt hier eine harte Regel und viel Freiheit drumherum:
 *
 *   HART:   Uebungsbonus + Modifikator des Hauptattributs = Angriffsbonus.
 *   FREI:   welches Attribut das Hauptattribut ist, und wie die anderen
 *           fuenf aussehen. Das entscheiden Art und Rolle.
 *
 * Plattformfrei und ohne Zufall im Inneren: der Zufallsgeber kommt herein,
 * wie ueberall in der Sammlung.
 */

import type { Richtwert } from './richtwerte';
import type { Rolle, Sprache, Thema } from './tabellen';

export type AttributId = 'st' | 'ge' | 'ko' | 'in' | 'we' | 'ch';

/** Die Reihenfolge, in der sie im Statblock stehen. Die ist in D&D fest. */
export const ATTRIBUTE: readonly AttributId[] = ['st', 'ge', 'ko', 'in', 'we', 'ch'];

export type Attribute = Readonly<Record<AttributId, number>>;

/** Die Abkuerzung, wie sie im Statblock steht. */
export function attributKuerzel(id: AttributId, sprache: Sprache): string {
  const de: Record<AttributId, string> = { st: 'ST', ge: 'GE', ko: 'KO', in: 'IN', we: 'WE', ch: 'CH' };
  const en: Record<AttributId, string> = { st: 'STR', ge: 'DEX', ko: 'CON', in: 'INT', we: 'WIS', ch: 'CHA' };
  return sprache === 'en' ? en[id] : de[id];
}

/** Der Modifikator zu einem Attributwert. Die Formel aus dem Regelwerk. */
export function modifikator(wert: number): number {
  return Math.floor((wert - 10) / 2);
}

/** Wie ein Modifikator geschrieben wird: „+3", „0", „−1". */
export function alsVorzeichen(mod: number): string {
  return mod >= 0 ? `+${mod}` : `−${Math.abs(mod)}`;
}

/**
 * Der Uebungsbonus zu einem Grad.
 *
 * Aus dem Regelwerk: zwei bis einschliesslich Grad 4, danach alle vier Grade
 * einer mehr. Dass die Angriffsbonus-Spalte der Richtwerte genau dazu passt,
 * ist kein Zufall — sie ist daraus gebaut. Genau darauf stuetzt sich die
 * harte Regel oben.
 */
export function uebungsbonus(crWert: number): number {
  if (crWert < 5) return 2;
  return 2 + Math.floor((Math.ceil(crWert) - 1) / 4);
}

/** Der Rettungs-SG gegen eine Faehigkeit dieses Monsters: 8 + Uebung + Modifikator. */
export function rettungsSg(angriffsbonus: number): number {
  return 8 + angriffsbonus;
}

/**
 * Ein Attributwert zu einem Modifikator.
 *
 * Gerade und ungerade Werte ergeben denselben Modifikator. Welcher davon
 * herauskommt, entscheidet der Wurf — sonst traegt jedes Monster der
 * Sammlung ausschliesslich gerade Attributwerte, und das sieht generiert aus.
 */
function wertZuModifikator(mod: number, rng: () => number): number {
  const gerade = 10 + mod * 2;
  return Math.max(1, Math.min(30, gerade + (rng() < 0.5 ? 0 : 1)));
}

/**
 * Das Profil einer Art: wo sie stark ist und wo nicht.
 *
 * Die Zahlen sind Modifikatoren RELATIV zum Hauptattribut, nicht absolut.
 * So wachsen die Attribute mit dem Grad mit, ohne dass jede Art eine eigene
 * Tabelle ueber dreissig Grade braucht.
 *
 * `haupt` sagt, welches Attribut die Angriffe traegt — daran haengt die
 * harte Regel, und deshalb steht es hier und nicht in der Rolle.
 */
export interface Attributprofil {
  readonly haupt: AttributId;
  /** Abstand zum Hauptattribut, je Attribut. 0 heisst: genauso stark. */
  readonly abstand: Readonly<Record<AttributId, number>>;
}

/**
 * Welches Attribut die Angriffe traegt, nach Art und Rolle.
 *
 * Eine Bestie schlaegt mit Staerke zu, ein Unhold mit Charisma, eine
 * Aberration mit Verstand. Wer aus der Entfernung schiesst oder aus dem
 * Hinterhalt kommt, nimmt Geschick — unabhaengig davon, was er ist.
 */
const HAUPT_NACH_ART: Record<string, AttributId> = {
  untot: 'st',
  bestie: 'st',
  konstrukt: 'st',
  aberration: 'in',
  elementar: 'st',
  unhold: 'ch',
  fee: 'ch',
  drache: 'st',
  humanoid: 'st',
  pflanze: 'st'
};

const HAUPT_NACH_ROLLE: Partial<Record<string, AttributId>> = {
  schuetze: 'ge',
  lauerer: 'ge',
  plaenkler: 'ge'
};

/**
 * Wie weit die uebrigen Attribute unter dem Hauptattribut liegen.
 *
 * Sechs Zahlen je Art waeren eine weitere Tabelle mit dreissig Zeilen. Statt
 * dessen: ein Grundprofil, das fuer alle gilt, und Ausnahmen je Art. Ein
 * Konstrukt ist dumm und stark, eine Fee gewandt und zerbrechlich, ein
 * Untoter zaeh und ohne Verstand.
 */
const GRUNDABSTAND: Record<AttributId, number> = { st: -1, ge: -1, ko: -1, in: -3, we: -2, ch: -3 };

const ABSTAND_JE_ART: Record<string, Partial<Record<AttributId, number>>> = {
  untot: { ko: 0, in: -5, ch: -2 },
  bestie: { ko: 0, in: -6, we: -1, ch: -4 },
  konstrukt: { ko: 0, ge: -3, in: -6, we: -3, ch: -5 },
  aberration: { we: -1, ch: -1, st: -2, ko: -1 },
  elementar: { ko: 0, in: -4, ch: -3 },
  unhold: { ko: -1, in: -1, we: -1 },
  fee: { ge: 0, ko: -3, in: -1, we: -1 },
  drache: { ko: 0, in: -1, we: -1, ch: -1 },
  humanoid: { ko: -1, in: -2, we: -2, ch: -2 },
  pflanze: { ko: 0, ge: -4, in: -6, we: -2, ch: -4 }
};

export function profilFuer(thema: Thema, rolle: Rolle): Attributprofil {
  const haupt = HAUPT_NACH_ROLLE[rolle.id] ?? HAUPT_NACH_ART[thema.id] ?? 'st';
  const abstand: Record<AttributId, number> = { ...GRUNDABSTAND, ...ABSTAND_JE_ART[thema.id] };
  // Das Hauptattribut liegt zu sich selbst bei null, was auch immer die
  // Tabelle darueber sagt.
  abstand[haupt] = 0;
  return { haupt, abstand };
}

/**
 * Die sechs Werte.
 *
 * Der Modifikator des Hauptattributs ergibt sich aus dem Angriffsbonus und
 * ist deshalb nicht verhandelbar. Die anderen fuenf bekommen ihren Abstand
 * aus dem Profil, dazu eine Schwankung von einem Punkt nach oben oder unten
 * — sonst sieht jede Bestie eines Grades gleich aus.
 *
 * Gedeckelt wird bei 1 und 30: darunter ist man nicht mehr handlungsfaehig,
 * darueber sieht es nach einem Tippfehler aus.
 */
export function attributeFuer(
  ziel: Richtwert,
  profil: Attributprofil,
  rng: () => number
): Attribute {
  const hauptMod = ziel.bonus - uebungsbonus(ziel.wert);
  const heraus: Record<AttributId, number> = { st: 10, ge: 10, ko: 10, in: 10, we: 10, ch: 10 };

  for (const id of ATTRIBUTE) {
    if (id === profil.haupt) {
      heraus[id] = wertZuModifikator(hauptMod, rng);
      continue;
    }
    const schwankung = Math.floor(rng() * 3) - 1;
    const mod = hauptMod + profil.abstand[id] + schwankung;
    // Nach unten begrenzt: −5 ist der Modifikator zu einem Attributwert von
    // 1, und tiefer geht es nicht.
    heraus[id] = wertZuModifikator(Math.max(-5, mod), rng);
  }
  return heraus;
}

/** Was bei der Pruefung der Attribute herauskam. */
export interface Attributbefund {
  readonly passt: boolean;
  /** Der Modifikator, den das Hauptattribut haben muesste. */
  readonly erwarteterModifikator: number;
  readonly tatsaechlich: number;
  /** Welcher Attributwert dazu passen wuerde. */
  readonly empfohlenerWert: number;
}

/**
 * Passen die Attribute zum Angriffsbonus?
 *
 * Genau eine Frage, und es ist die einzige, die sich ueberhaupt nachrechnen
 * laesst: ob Uebungsbonus plus Modifikator des Hauptattributs den
 * Angriffsbonus ergibt, den der Statblock behauptet. Ob ein Untoter klug
 * sein darf, ist Geschmackssache und wird hier nicht beurteilt.
 */
export function pruefeAttribute(
  attribute: Attribute,
  haupt: AttributId,
  angriffsbonus: number,
  crWert: number
): Attributbefund {
  const erwartet = angriffsbonus - uebungsbonus(crWert);
  const ist = modifikator(attribute[haupt]);
  return {
    passt: ist === erwartet,
    erwarteterModifikator: erwartet,
    tatsaechlich: ist,
    empfohlenerWert: Math.max(1, Math.min(30, 10 + erwartet * 2))
  };
}
