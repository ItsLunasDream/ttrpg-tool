/**
 * Übersetzt die Filterwerte des Modells in Pixi-Filter.
 *
 * Getrennt vom Renderer, damit die Zuordnung an einer Stelle steht und sich
 * einzeln lesen lässt. Die Reihenfolge ist bewusst: erst Farbe, dann
 * Weichzeichnen, zuletzt Korn — Korn vor dem Weichzeichnen würde gleich wieder
 * verwischt.
 *
 * Vignette fehlt hier: sie ist kein Filter, sondern eine gezeichnete Fläche
 * über der Karte (siehe renderer.drawVignette). Als Filter bräuchte sie einen
 * eigenen Shader, und über mehrere Layer gelegt ergäbe sie mehrere
 * Abdunkelungen statt einer.
 */

import { BlurFilter, ColorMatrixFilter, NoiseFilter, type Filter } from 'pixi.js';
import { isNeutral, type FilterSettings } from '@/model/filters';

export function buildFilters(f: FilterSettings | null | undefined): Filter[] | null {
  if (isNeutral(f) || !f) return null;
  const out: Filter[] = [];

  const farbe = new ColorMatrixFilter();
  let farbeBenutzt = false;

  // Pixis ColorMatrix-Helfer hängen sich aneinander, wenn `multiply` true ist —
  // so lassen sich mehrere Anpassungen kombinieren.
  if (f.brightness !== 1) {
    farbe.brightness(f.brightness, farbeBenutzt);
    farbeBenutzt = true;
  }
  if (f.contrast !== 1) {
    farbe.contrast(f.contrast, farbeBenutzt);
    farbeBenutzt = true;
  }
  if (f.saturation !== 1) {
    // Pixi zählt 0 als unverändert, das Modell 1 — sonst wäre „keine Änderung"
    // je nach Feld ein anderer Wert.
    farbe.saturate(f.saturation - 1, farbeBenutzt);
    farbeBenutzt = true;
  }
  if (f.hue !== 0) {
    farbe.hue(f.hue, farbeBenutzt);
    farbeBenutzt = true;
  }
  if (farbeBenutzt) out.push(farbe);

  // Einfärbung als *eigener* Filter: `alpha` regelt die Stärke, wirkt aber auf
  // die ganze Matrix. Zusammen mit Helligkeit und Sättigung in einem Filter
  // würden auch die nur anteilig angewandt — bei der Nacht-Vorlage blieb davon
  // fast nichts übrig.
  if (f.tint !== null && f.tintAmount > 0) {
    const einfaerben = new ColorMatrixFilter();
    einfaerben.tint(f.tint, false);
    einfaerben.alpha = f.tintAmount;
    out.push(einfaerben);
  }

  if (f.blur > 0) {
    out.push(new BlurFilter({ strength: f.blur, quality: 3 }));
  }

  if (f.grain > 0) {
    out.push(new NoiseFilter({ noise: f.grain }));
  }

  return out.length > 0 ? out : null;
}
