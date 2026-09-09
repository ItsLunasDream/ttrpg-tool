/**
 * Bildfilter für Layer und die ganze Karte.
 *
 * Sie liegen im Dokument, nicht im Editor-Zustand: eine Karte, die als
 * „Nacht" angelegt wurde, soll auch nach dem Speichern und Weitergeben so
 * aussehen. Beim Bild-Export werden sie deshalb identisch mitgerendert —
 * es ist dieselbe Szene, nur in eine Textur statt auf den Bildschirm.
 *
 * Reines Modell: hier stehen nur Werte und ihre Bedeutung. Wie daraus
 * Pixi-Filter werden, entscheidet der Renderer.
 */

export interface FilterSettings {
  /** 1 = unverändert. */
  brightness: number;
  contrast: number;
  saturation: number;
  /** Farbtondrehung in Grad. */
  hue: number;
  /** Einfärbung; null heißt keine. */
  tint: number | null;
  /** Wie stark die Einfärbung durchschlägt, 0–1. */
  tintAmount: number;
  /** Weichzeichnen in Pixeln; 0 = aus. */
  blur: number;
  /** Korn, 0–1. */
  grain: number;
  /**
   * Vignette, 0–1. Nur global sinnvoll: je Layer angewandt ergäbe sie mehrere
   * übereinanderliegende Abdunkelungen statt einer.
   */
  vignette: number;
}

export function defaultFilters(): FilterSettings {
  return {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    hue: 0,
    tint: null,
    tintAmount: 0,
    blur: 0,
    grain: 0,
    vignette: 0,
  };
}

/**
 * Ändert dieser Satz überhaupt etwas?
 *
 * Wird gebraucht, damit unveränderte Layer gar keinen Filter bekommen: jeder
 * Filter kostet in Pixi einen eigenen Render-Durchgang, und ein neutraler
 * wäre reine Verschwendung.
 */
export function isNeutral(f: FilterSettings | null | undefined): boolean {
  if (!f) return true;
  return (
    f.brightness === 1 &&
    f.contrast === 1 &&
    f.saturation === 1 &&
    f.hue === 0 &&
    (f.tint === null || f.tintAmount === 0) &&
    f.blur === 0 &&
    f.grain === 0 &&
    f.vignette === 0
  );
}

export type FilterPresetId =
  | 'none'
  | 'night'
  | 'torch'
  | 'underwater'
  | 'poison'
  | 'winter'
  | 'oldmap';

export const FILTER_PRESETS: Array<{ id: FilterPresetId; nameKey: string }> = [
  { id: 'none', nameKey: 'filterFx.presetNone' },
  { id: 'night', nameKey: 'filterFx.presetNight' },
  { id: 'torch', nameKey: 'filterFx.presetTorch' },
  { id: 'underwater', nameKey: 'filterFx.presetUnderwater' },
  { id: 'poison', nameKey: 'filterFx.presetPoison' },
  { id: 'winter', nameKey: 'filterFx.presetWinter' },
  { id: 'oldmap', nameKey: 'filterFx.presetOldMap' },
];

/** Vorlagen. Sie setzen den ganzen Satz, damit ein Wechsel nichts stehen lässt. */
export function presetFilters(id: FilterPresetId): FilterSettings {
  const basis = defaultFilters();
  switch (id) {
    case 'none':
      return basis;
    case 'night':
      // Dunkel, blaustichig, entsättigt — der klassische Mondlicht-Look.
      return { ...basis, brightness: 0.55, saturation: 0.45, tint: 0x3b5c9c, tintAmount: 0.45, vignette: 0.35 };
    case 'torch':
      return { ...basis, brightness: 0.85, saturation: 1.1, tint: 0xffb457, tintAmount: 0.35, vignette: 0.45 };
    case 'underwater':
      return { ...basis, saturation: 0.8, tint: 0x2f8fa8, tintAmount: 0.5, blur: 1.5, vignette: 0.3 };
    case 'poison':
      return { ...basis, saturation: 0.9, hue: -25, tint: 0x6fbf3a, tintAmount: 0.4, vignette: 0.25 };
    case 'winter':
      return { ...basis, brightness: 1.12, saturation: 0.6, tint: 0xbcd6f0, tintAmount: 0.35 };
    case 'oldmap':
      // Sepia plus Korn: nicht bloß entsättigt, sondern ins Bräunliche gezogen.
      return { ...basis, saturation: 0.25, tint: 0xc4a26a, tintAmount: 0.55, grain: 0.25, vignette: 0.4 };
  }
}
