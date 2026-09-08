/**
 * Wuerfelausdruecke lesen und werfen. Reine Funktionen, kein I/O, keine
 * Oberflaeche — siehe KONVENTIONEN.md, Regel 4: geteilte Pakete sind
 * plattformfrei und laufen unveraendert in jeder Anwendung.
 *
 * Der Zufallsgenerator wird injiziert (Standard: Math.random), damit
 * Aufrufer deterministisch testen koennen, ohne Zufall abzuklemmen.
 */

/** Liefert eine Zahl im Bereich [0, 1), wie Math.random. */
export type RandomSource = () => number;

/** Ergebnis eines einzelnen Wurfs (ein Ausdruck oder ein Vorteils-/Nachteilswurf). */
export interface RollResult {
  /** Der ausgewertete Ausdruck, z. B. "2d6+3" oder "1d20 (Vorteil)". */
  readonly expression: string;
  /** Die einzelnen Wuerfelergebnisse, ohne Modifikator. */
  readonly rolls: readonly number[];
  /** Der additive Modifikator aus dem Ausdruck (0, wenn keiner angegeben war). */
  readonly modifier: number;
  /**
   * Das gewertete Ergebnis samt Modifikator.
   *
   * Bei einem gewoehnlichen Ausdruck ist das die Summe aller Wuerfe plus
   * Modifikator. Bei Vorteil und Nachteil zaehlt dagegen nur der gewaehlte
   * der beiden Wuerfe — `rolls` enthaelt dann beide, `total` aber nur den
   * hoeheren beziehungsweise niedrigeren. `total` ist also nicht in jedem
   * Fall die Summe von `rolls`.
   */
  readonly total: number;
}

const EXPRESSION_PATTERN = /^\s*(\d*)d(\d+)\s*([+-]\s*\d+)?\s*$/i;

/** Wird geworfen, wenn ein Ausdruck nicht dem Muster `NdM+K` entspricht. */
export class InvalidDiceExpressionError extends Error {
  constructor(expression: string) {
    super(`Ungueltiger Wuerfelausdruck: "${expression}"`);
    this.name = 'InvalidDiceExpressionError';
  }
}

/**
 * Zerlegt einen Wuerfelausdruck der Form `NdM+K` in seine Bestandteile.
 * `N` (Anzahl) und `K` (Modifikator) sind optional, `N` faellt auf 1 zurueck.
 * Beispiele: "2d6+3", "d20", "4d6-1".
 */
export function parseDiceExpression(expression: string): { count: number; sides: number; modifier: number } {
  const match = EXPRESSION_PATTERN.exec(expression);
  if (!match) {
    throw new InvalidDiceExpressionError(expression);
  }
  const count = match[1] === '' ? 1 : parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3].replace(/\s+/g, ''), 10) : 0;
  if (count < 1) {
    throw new InvalidDiceExpressionError(expression);
  }
  if (sides < 2) {
    throw new InvalidDiceExpressionError(expression);
  }
  return { count, sides, modifier };
}

/** Wirft einen einzelnen Wuerfel mit `sides` Seiten (Ergebnis 1..sides). */
export function rollDie(sides: number, rng: RandomSource = Math.random): number {
  return Math.floor(rng() * sides) + 1;
}

/**
 * Wirft einen Wuerfelausdruck wie `2d6+3` oder `d20` und liefert die
 * Einzelwuerfe zusammen mit der Gesamtsumme.
 */
export function rollExpression(expression: string, rng: RandomSource = Math.random): RollResult {
  const { count, sides, modifier } = parseDiceExpression(expression);
  const rolls = Array.from({ length: count }, () => rollDie(sides, rng));
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  return { expression: expression.trim(), rolls, modifier, total };
}

export type AdvantageMode = 'advantage' | 'disadvantage';

const ADVANTAGE_LABEL: Record<AdvantageMode, string> = {
  advantage: 'Vorteil',
  disadvantage: 'Nachteil'
};

/**
 * Wirft einen W20, optional mit Vorteil oder Nachteil: zwei Wuerfe, davon
 * wird bei Vorteil der hoehere, bei Nachteil der niedrigere gewertet. Ohne
 * `mode` ist es ein gewoehnlicher einzelner W20-Wurf.
 */
export function rollD20(mode?: AdvantageMode, rng: RandomSource = Math.random): RollResult {
  if (!mode) {
    return rollExpression('1d20', rng);
  }
  const first = rollDie(20, rng);
  const second = rollDie(20, rng);
  const chosen = mode === 'advantage' ? Math.max(first, second) : Math.min(first, second);
  return {
    expression: `1d20 (${ADVANTAGE_LABEL[mode]})`,
    rolls: [first, second],
    modifier: 0,
    total: chosen
  };
}
