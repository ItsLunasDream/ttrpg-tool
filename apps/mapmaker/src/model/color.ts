/** Farbumrechnung und -variation. */

export function rgbToHsl(color: number): [number, number, number] {
  const r = ((color >> 16) & 0xff) / 255;
  const g = ((color >> 8) & 0xff) / 255;
  const b = (color & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

export function hslToRgb(h: number, s: number, l: number): number {
  h = ((h % 1) + 1) % 1;
  s = clamp01(s);
  l = clamp01(l);
  if (s === 0) {
    const v = Math.round(l * 255);
    return (v << 16) | (v << 8) | v;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const to = (t: number) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return (
    (Math.round(to(h + 1 / 3) * 255) << 16) |
    (Math.round(to(h) * 255) << 8) |
    Math.round(to(h - 1 / 3) * 255)
  );
}

/**
 * Variiert eine Farbe in HSL. Die Werte sind Prozentpunkte (0–100), wie sie im
 * Pinsel-Panel stehen; 0 lässt die Farbe unangetastet.
 */
export function jitterHsl(
  color: number,
  huePct: number,
  satPct: number,
  lightPct: number,
  rand: () => number,
): number {
  if (huePct === 0 && satPct === 0 && lightPct === 0) return color;
  const [h, s, l] = rgbToHsl(color);
  const j = (pct: number) => ((rand() * 2 - 1) * pct) / 100;
  return hslToRgb(h + j(huePct), s + j(satPct), l + j(lightPct));
}

export function toHex(color: number): string {
  return `#${(color >>> 0).toString(16).padStart(6, '0').slice(-6)}`;
}

export function fromHex(hex: string): number {
  return parseInt(hex.replace('#', ''), 16) || 0;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Steht auf diesem Grund besser eine dunkle oder eine helle Schrift?
 *
 * Über die Helligkeit nach ITU-R BT.601 — grob, aber für die Frage
 * „lesbar oder nicht" genau genug. Gebraucht überall dort, wo etwas *auf* die
 * Karte gesetzt wird, ohne dass jemand die Farbe wählt: eine Maßstabsleiste
 * auf pergamentfarbenem Grund braucht dunkle Zahlen, dieselbe Leiste auf einer
 * nächtlichen Battlemap helle.
 */
export function isDark(color: number): boolean {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
