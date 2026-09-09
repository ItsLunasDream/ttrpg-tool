/**
 * Eigenheiten der Importer — Foundry, Roll20, Owlbear Rodeo.
 *
 * Alle drei lesen Universal VTT, und alle drei lesen es verschieden. Was hier
 * steht, ist am Quelltext der Importer nachgelesen, nicht vermutet:
 *
 * - **Foundry** über *Universal Battlemap Importer* (moo-man/FVTT-DD-Import).
 *   Lichtfarbe: `"#" + light.color.substring(2)` — die Datei liefert AARRGGBB,
 *   die ersten beiden Stellen fliegen weg.
 * - **Roll20** über das API-Skript *UniversalVTTImporter*
 *   (Roll20/roll20-api-scripts). Die Datei wird nur angenommen, wenn sie ein
 *   Feld `format` mit einem Wert ≥ 0.2 hat. `pixels_per_grid` wird *nicht*
 *   ausgewertet — der Maßstab kommt aus dem schon platzierten Kartenbild
 *   (`scaleFactor = tokenWidth / map_size.x`). Farben laufen durch `argb2rgba`,
 *   also ebenfalls AARRGGBB. Die Lichtstärke wird auf 0,5 bis 3 gestutzt.
 *   `portals[].closed` entscheidet Tür gegen Fenster; `rotation` wird ignoriert
 *   und aus den Begrenzungspunkten neu gerechnet.
 * - **Owlbear Rodeo** über die Erweiterung *Scene Importer* (Eppinguin). Hier
 *   liegt der teure Unterschied: `normalizeHexColor` nimmt bei acht Stellen die
 *   **ersten sechs** — die Datei wird also als RRGGBBAA gelesen. Ein warmes
 *   `ffffcc88` (Alpha ff, Farbe ffcc88) wird dort zu `#FFFFCC`, einem blassen
 *   Gelb. Außerdem: `map_origin` wird gar nicht gelesen, `line_of_sight` und
 *   `objects_line_of_sight` landen im selben Topf (aus Fenstern werden also
 *   Wände), `pixels_per_grid` wird die Auflösung der Szene, und ohne Bild in
 *   der Datei entsteht keine Szene.
 *
 * Daraus folgt: eine Datei kann nicht für alle drei zugleich richtig sein. Die
 * Farbreihenfolge ist der Punkt, an dem sich Owlbear und die anderen beiden
 * ausschließen. Deshalb steht das Zielsystem im Export-Dialog, statt dass hier
 * jemand rät.
 */

import { t } from '@/i18n';
import type { MapDocument } from '@/model/types';
import { uvttBucket } from '@/model/wallSenses';

export type VttTarget = 'foundry' | 'roll20' | 'owlbear';
export const VTT_TARGETS: VttTarget[] = ['foundry', 'roll20', 'owlbear'];

export interface VttTargetTraits {
  /** Reihenfolge der Stellen in einer Farbe mit Alpha. */
  colorOrder: 'argb' | 'rgba';
  /** Wertet der Importer `resolution.map_origin` aus? */
  readsOrigin: boolean;
  /** Hält er `objects_line_of_sight` von den normalen Wänden getrennt? */
  separatesObjects: boolean;
  /** Entsteht ohne eingebettetes Bild überhaupt eine Szene? */
  needsImage: boolean;
  /** Grenzen, in die er die Lichtstärke zwingt; `null` heißt: keine. */
  intensityRange: [number, number] | null;
}

export const TARGET_TRAITS: Record<VttTarget, VttTargetTraits> = {
  foundry: {
    colorOrder: 'argb',
    readsOrigin: true,
    separatesObjects: true,
    needsImage: true,
    intensityRange: null,
  },
  roll20: {
    colorOrder: 'argb',
    readsOrigin: true,
    separatesObjects: true,
    needsImage: false,
    intensityRange: [0.5, 3],
  },
  owlbear: {
    colorOrder: 'rgba',
    readsOrigin: false,
    separatesObjects: false,
    needsImage: true,
    intensityRange: null,
  },
};

/**
 * Was am gewählten Ziel anders ankommt, als hier eingestellt ist.
 *
 * Nur Punkte, die auf *dieser* Karte tatsächlich vorkommen: eine Warnung über
 * Fenster, wo es keine gibt, ist Lärm und trainiert das Wegklicken an.
 */
export function targetWarnings(doc: MapDocument, target: VttTarget): string[] {
  const traits = TARGET_TRAITS[target];
  const out: string[] = [];

  if (!traits.separatesObjects) {
    const objekte = doc.vtt.walls.filter((w) => uvttBucket(w) === 'objects_line_of_sight').length;
    if (objekte > 0) out.push(t('uvtt.targetMergesObjects', { n: objekte }));
  }

  if (traits.intensityRange) {
    const [lo, hi] = traits.intensityRange;
    const daneben = doc.vtt.lights.filter((l) => l.intensity < lo || l.intensity > hi).length;
    if (daneben > 0) {
      out.push(t('uvtt.targetClampsIntensity', { n: daneben, lo, hi }));
    }
  }

  if (target === 'roll20' && doc.vtt.lights.length > 0) {
    out.push(t('uvtt.targetRoll20Scale'));
  }

  return out;
}
