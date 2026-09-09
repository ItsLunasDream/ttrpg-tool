/**
 * Deterministischer Zufall (mulberry32).
 *
 * Gleicher Seed, gleiches Ergebnis — davon hängen zwei Dinge ab: prozedurale
 * Props sehen nach dem Neuladen einer Projektdatei genauso aus wie vorher,
 * und Generatoren lassen sich über ihr Seed-Feld reproduzieren.
 */

export class Rng {
  private s: number;

  constructor(seed: number) {
    this.s = (seed >>> 0) || 0x9e3779b9;
  }

  /** [0, 1) */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** [min, max) */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** [min, max] ganzzahlig */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  /** Gewichtete Auswahl; `weights` muss dieselbe Länge haben wie `items`. */
  pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
    let total = 0;
    for (let i = 0; i < items.length; i++) total += weights[i] ?? 1;
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i] ?? 1;
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /** Normalverteilung um 0 mit Standardabweichung 1 (Box-Muller). */
  gaussian(): number {
    const u = 1 - this.next();
    const v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}

/** Streut einen Zahlenwert zu einem stabilen Seed. */
export function hashSeed(...values: number[]): number {
  let h = 0x811c9dc5;
  for (const v of values) {
    h ^= Math.imul(v | 0, 0x01000193);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
