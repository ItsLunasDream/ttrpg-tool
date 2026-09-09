/**
 * Universal VTT (`.uvtt` / `.dd2vtt`) — Schreiben und Lesen.
 *
 * Drei Details entscheiden darüber, ob der Import in Foundry stimmt. Alle drei
 * sind hier bewusst festgehalten, weil sie sich beim Testen nicht von selbst
 * zeigen — eine falsch importierte Karte sieht aus, als hätte man sie schlecht
 * gebaut:
 *
 * 1. **Koordinaten sind Grid-Einheiten, nicht Pixel.** Alles wird beim Export
 *    durch die Tile-Größe des Dokuments geteilt.
 * 2. **Lichtfarben sind AARRGGBB**, Alpha zuerst. Der verbreitete Importer
 *    (moo-man/FVTT-DD-Import) macht `"#" + light.color.substring(2)` — er wirft
 *    also die ersten zwei Stellen weg. Bei RRGGBBAA würde aus einem warmen
 *    ffcc88 ein violettes cc88ff.
 * 3. **`portals.rotation` ist im Bogenmaß.**
 *
 * **Notizen sind kein Teil des Formats.** Weder Universal VTT 0.3 noch der
 * Foundry-Importer kennen sie. Sie werden trotzdem unter `notes` mitgeschrieben:
 * unbekannte Felder überliest jeder Importer, und so geht beim Weitergeben der
 * Datei nichts verloren — der eigene Reader holt sie zurück. Damit sie
 * *tatsächlich* in Foundry landen, gibt es `io/foundryNotes.ts`.
 *
 * Gelesen wird bewusst toleranter als geschrieben: fremde Dateien halten sich
 * nicht immer an dieselben Konventionen.
 */

import { makeId } from '@/model/ids';
import { t } from '@/i18n';
import { mapPixelSize } from '@/model/grid';
import { circleIntersectsRect, pointSegmentDistanceSq } from '@/model/geometry';
import { NOTE_ICONS } from '@/model/types';
import { uvttBucket } from '@/model/wallSenses';
import { TARGET_TRAITS, type VttTarget } from './vttTargets';
import type {
  LightSource,
  MapDocument,
  MapNote,
  NoteIcon,
  Portal,
  VttData,
  Wall,
} from '@/model/types';

export const UVTT_FORMAT = 0.3;

export interface UvttPoint {
  x: number;
  y: number;
}

export interface UvttFile {
  format: number;
  resolution: {
    map_origin: UvttPoint;
    map_size: UvttPoint;
    pixels_per_grid: number;
  };
  line_of_sight: UvttPoint[][];
  objects_line_of_sight: UvttPoint[][];
  portals: Array<{
    position: UvttPoint;
    bounds: UvttPoint[];
    rotation: number;
    closed: boolean;
    freestanding: boolean;
  }>;
  environment: {
    baked_lighting: boolean;
    ambient_light: string;
  };
  lights: Array<{
    position: UvttPoint;
    range: number;
    intensity: number;
    color: string;
    shadows: boolean;
  }>;
  image: string;
  /**
   * Nicht Teil des Universal-VTT-Formats — siehe Kopfkommentar.
   * Positionen wie überall in Grid-Einheiten.
   */
  notes?: Array<{
    position: UvttPoint;
    title: string;
    text: string;
    icon: string;
    size: number;
    color: string;
    player_visible: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// Farben
// ---------------------------------------------------------------------------

/**
 * 0xRRGGBB plus Alpha 0–1 zu einer achtstelligen Farbe.
 *
 * AARRGGBB ist die Voreinstellung: so schreibt es Dungeondraft, und so lesen es
 * der Foundry-Importer und das Roll20-Skript. Owlbear Rodeo liest dieselben
 * acht Stellen als RRGGBBAA und behält die ersten sechs — dort käme aus einem
 * warmen `ffffcc88` ein blasses `#FFFFCC` heraus. Für dieses Ziel wird deshalb
 * umgestellt; siehe `io/vttTargets.ts`.
 */
export function toUvttColor(rgb: number, alpha = 1, order: 'argb' | 'rgba' = 'argb'): string {
  const a = Math.round(clamp01(alpha) * 255);
  const rgbHex = (rgb & 0xffffff).toString(16).padStart(6, '0');
  const aHex = a.toString(16).padStart(2, '0');
  return order === 'argb' ? `${aHex}${rgbHex}` : `${rgbHex}${aHex}`;
}

/**
 * Liest eine Farbe aus einer fremden Datei.
 *
 * Acht Stellen werden als AARRGGBB gelesen — so schreibt es Dungeondraft und so
 * liest es der Foundry-Importer. Sechs Stellen sind schlicht RGB mit vollem
 * Alpha. Alles andere fällt auf Weiß zurück, statt den Import scheitern zu lassen.
 *
 * `order` ist für die Gegenprobe da: wer eine Datei für Owlbear Rodeo
 * geschrieben hat, muss sie auch so wieder lesen, sonst prüft die Gegenprobe
 * etwas anderes, als in der Datei steht. Zum Öffnen fremder Dateien bleibt
 * AARRGGBB die Annahme — das schreibt die überwiegende Mehrheit.
 */
export function fromUvttColor(
  input: string,
  order: 'argb' | 'rgba' = 'argb',
): { color: number; alpha: number } {
  const hex = (input ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{8}$/.test(hex)) {
    return order === 'argb'
      ? { alpha: parseInt(hex.slice(0, 2), 16) / 255, color: parseInt(hex.slice(2), 16) }
      : { alpha: parseInt(hex.slice(6), 16) / 255, color: parseInt(hex.slice(0, 6), 16) };
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return { alpha: 1, color: parseInt(hex, 16) };
  }
  return { alpha: 1, color: 0xffffff };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// ---------------------------------------------------------------------------
// Schreiben
// ---------------------------------------------------------------------------

export interface UvttBuildOptions {
  /** Base64 des Kartenbildes, ohne `data:`-Präfix. */
  image: string;
  /**
   * Auflösung des mitgelieferten Bildes in Pixeln pro Tile. Muss zur
   * tatsächlich exportierten Bildgröße passen, sonst sitzt in Foundry das
   * Grid neben der Karte.
   */
  pixelsPerGrid: number;
  /**
   * Für welchen Importer geschrieben wird. Ohne Angabe: Foundry — das war
   * bisher der einzige Weg und bleibt die Voreinstellung.
   */
  target?: VttTarget;
}

export function buildUvtt(doc: MapDocument, options: UvttBuildOptions): UvttFile {
  const tile = doc.grid.tileSize;
  const farbfolge = TARGET_TRAITS[options.target ?? 'foundry'].colorOrder;
  /** Weltpixel in Grid-Einheiten. */
  const g = (value: number) => round(value / tile);

  const toPath = (wall: Wall): UvttPoint[] => {
    const pts: UvttPoint[] = [];
    for (let i = 0; i < wall.points.length; i += 2) {
      pts.push({ x: g(wall.points[i]), y: g(wall.points[i + 1]) });
    }
    // Geschlossene Züge brauchen den Anfangspunkt am Ende noch einmal, sonst
    // bleibt eine Lücke in der Sichtlinie.
    if (wall.closed && pts.length > 2) pts.push({ ...pts[0] });
    return pts;
  };

  return {
    format: UVTT_FORMAT,
    resolution: {
      map_origin: { x: 0, y: 0 },
      map_size: { x: doc.size.cols, y: doc.size.rows },
      pixels_per_grid: Math.round(options.pixelsPerGrid),
    },
    /**
     * Das Format kennt zwei Töpfe, Foundry vier Kanäle.
     *
     * Sortiert wird nach dem, was die Wand *tut*, nicht nach ihrem Typ: was
     * Sicht hält, ist eine Sichtlinie, was Sicht durchlässt und sonst etwas
     * aufhält, eine Objekt-Sichtlinie. Was gar nichts hält, bleibt draußen.
     * Die feineren Unterschiede — Licht ja, Schall nein — trägt das Makro aus
     * `io/foundryWalls.ts` nach; in die Datei passen sie nicht.
     */
    line_of_sight: doc.vtt.walls.filter((w) => uvttBucket(w) === 'line_of_sight').map(toPath),
    objects_line_of_sight: doc.vtt.walls
      .filter((w) => uvttBucket(w) === 'objects_line_of_sight')
      .map(toPath),
    portals: doc.vtt.portals.map((p) => {
      const [x0, y0, x1, y1] = p.bounds;
      return {
        position: { x: g((x0 + x1) / 2), y: g((y0 + y1) / 2) },
        bounds: [
          { x: g(x0), y: g(y0) },
          { x: g(x1), y: g(y1) },
        ],
        // Bogenmaß, nicht Grad.
        rotation: round(Math.atan2(y1 - y0, x1 - x0)),
        closed: p.closed,
        freestanding: p.freestanding,
      };
    }),
    environment: {
      baked_lighting: doc.vtt.bakedLighting,
      ambient_light: toUvttColor(doc.vtt.ambientLight, doc.vtt.ambientAlpha, farbfolge),
    },
    lights: doc.vtt.lights.map((l) => ({
      position: { x: g(l.x), y: g(l.y) },
      // Reichweite ist bereits in Tiles gespeichert — Foundry rechnet daraus
      // dim = range × Feldgröße.
      range: round(l.range),
      intensity: round(l.intensity),
      color: toUvttColor(l.color, l.alpha, farbfolge),
      shadows: l.shadows,
    })),
    image: options.image,
    notes: doc.vtt.notes.map((n) => ({
      position: { x: g(n.x), y: g(n.y) },
      title: n.title,
      text: n.text,
      icon: n.icon,
      size: round(n.size),
      // Ohne Alpha-Anteil wie bei den Lichtern: ein Pin ist entweder da
      // oder nicht, halbdurchsichtig ergibt hier nichts. Und immer AARRGGBB,
      // unabhängig vom Ziel: Notizen liest kein fremder Importer, nur der
      // eigene Reader — der soll die Datei jedes Mal gleich verstehen.
      color: toUvttColor(n.color, 1),
      player_visible: n.playerVisible,
    })),
  };
}

export function serializeUvtt(file: UvttFile): string {
  return JSON.stringify(file, null, 2);
}

/**
 * Auf sechs Nachkommastellen.
 *
 * In Grid-Einheiten entspricht das bei 100 px/Tile einem Zehntausendstel Pixel —
 * unsichtbar, aber deutlich genug unter der Schwelle, ab der beim Zurückrechnen
 * sichtbare Abweichungen entstehen. Vier Stellen ergaben bei krummen
 * Tile-Größen bereits Abweichungen im Hundertstelpixel-Bereich.
 */
function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

// ---------------------------------------------------------------------------
// Lesen
// ---------------------------------------------------------------------------

export interface UvttReadResult {
  vtt: VttData;
  /** Kartengröße in Tiles, wie in der Datei angegeben. */
  size: { cols: number; rows: number };
  pixelsPerGrid: number;
  /** Base64 des Kartenbildes, falls vorhanden. */
  image: string | null;
  warnings: string[];
}

/**
 * Liest eine `.uvtt`/`.dd2vtt`-Datei ein.
 *
 * Damit lässt sich der eigene Export prüfen, ohne für jeden Test Foundry zu
 * starten — und man kann gekaufte Karten zum Weiterbearbeiten öffnen.
 *
 * `tileSize` bestimmt, in welche Weltpixel die Grid-Einheiten übersetzt werden.
 */
export function parseUvtt(
  json: string | UvttFile,
  tileSize: number,
  /**
   * Wie achtstellige Farben zu lesen sind. Nur für die Gegenprobe nach dem
   * eigenen Export gedacht; fremde Dateien folgen der Voreinstellung.
   */
  colorOrder: 'argb' | 'rgba' = 'argb',
): UvttReadResult {
  const warnings: string[] = [];

  let file: UvttFile;
  if (typeof json === 'string') {
    try {
      file = JSON.parse(json) as UvttFile;
    } catch {
      throw new Error('Datei ist kein gültiges JSON.');
    }
  } else {
    file = json;
  }

  const resolution = file.resolution;
  if (!resolution || typeof resolution.pixels_per_grid !== 'number') {
    throw new Error('Der Datei fehlt der Abschnitt "resolution".');
  }

  const cols = Math.max(1, Math.round(resolution.map_size?.x ?? 1));
  const rows = Math.max(1, Math.round(resolution.map_size?.y ?? 1));

  const originX = resolution.map_origin?.x ?? 0;
  const originY = resolution.map_origin?.y ?? 0;
  if (originX !== 0 || originY !== 0) {
    warnings.push(
      `map_origin ist (${originX}, ${originY}) — der Inhalt wurde entsprechend verschoben.`,
    );
  }

  /** Grid-Einheiten in Weltpixel, Ursprung eingerechnet. */
  const px = (value: number, origin: number) => (value - origin) * tileSize;

  const toWall = (path: UvttPoint[], type: Wall['type']): Wall | null => {
    if (!Array.isArray(path) || path.length < 2) return null;
    const points: number[] = [];
    for (const p of path) points.push(px(p.x, originX), px(p.y, originY));

    // Läuft der Zug zum Anfang zurück, als geschlossen führen und den
    // doppelten Punkt entfernen — sonst liegt ein Segment doppelt.
    let closed = false;
    if (points.length >= 6) {
      const dx = points[0] - points[points.length - 2];
      const dy = points[1] - points[points.length - 1];
      if (Math.hypot(dx, dy) < tileSize * 0.01) {
        closed = true;
        points.length -= 2;
      }
    }
    return { id: makeId('wall'), points, type, closed };
  };

  const walls: Wall[] = [];
  for (const path of file.line_of_sight ?? []) {
    const wall = toWall(path, 'normal');
    if (wall) walls.push(wall);
  }
  for (const path of file.objects_line_of_sight ?? []) {
    const wall = toWall(path, 'window');
    if (wall) walls.push(wall);
  }

  const portals: Portal[] = [];
  for (const p of file.portals ?? []) {
    const bounds = p.bounds;
    if (!Array.isArray(bounds) || bounds.length < 2) {
      warnings.push('Eine Tür ohne zwei Begrenzungspunkte wurde übersprungen.');
      continue;
    }
    portals.push({
      id: makeId('portal'),
      bounds: [
        px(bounds[0].x, originX),
        px(bounds[0].y, originY),
        px(bounds[1].x, originX),
        px(bounds[1].y, originY),
      ],
      closed: p.closed ?? true,
      freestanding: p.freestanding ?? false,
    });
  }

  const lights: LightSource[] = [];
  for (const l of file.lights ?? []) {
    if (!l.position) continue;
    const { color, alpha } = fromUvttColor(l.color, colorOrder);
    lights.push({
      id: makeId('light'),
      x: px(l.position.x, originX),
      y: px(l.position.y, originY),
      range: typeof l.range === 'number' ? l.range : 3,
      intensity: typeof l.intensity === 'number' ? l.intensity : 1,
      color,
      alpha,
      shadows: l.shadows ?? true,
    });
  }

  const notes: MapNote[] = [];
  for (const n of file.notes ?? []) {
    if (!n.position) continue;
    notes.push({
      id: makeId('note'),
      x: px(n.position.x, originX),
      y: px(n.position.y, originY),
      title: typeof n.title === 'string' ? n.title : '',
      text: typeof n.text === 'string' ? n.text : '',
      icon: (NOTE_ICONS as string[]).includes(n.icon) ? (n.icon as NoteIcon) : 'marker',
      size: typeof n.size === 'number' && n.size > 0 ? n.size : 1,
      color: fromUvttColor(n.color).color,
      playerVisible: n.player_visible === true,
    });
  }

  const ambient = fromUvttColor(file.environment?.ambient_light ?? 'ffffffff', colorOrder);

  if (typeof file.format === 'number' && file.format > UVTT_FORMAT) {
    warnings.push(`Die Datei nennt Format ${file.format}, gelesen wird als ${UVTT_FORMAT}.`);
  }

  return {
    vtt: {
      walls,
      portals,
      lights,
      notes,
      ambientLight: ambient.color,
      ambientAlpha: ambient.alpha,
      bakedLighting: file.environment?.baked_lighting ?? true,
    },
    size: { cols, rows },
    pixelsPerGrid: resolution.pixels_per_grid,
    image: typeof file.image === 'string' && file.image.length > 0 ? file.image : null,
    warnings,
  };
}

/** Prüft, ob Bildgröße und angegebene Auflösung zusammenpassen. */
export function checkConsistency(doc: MapDocument, pixelsPerGrid: number): string[] {
  const problems: string[] = [];
  const base = mapPixelSize(doc.grid, doc.size);
  const expected = {
    width: Math.round((base.width / doc.grid.tileSize) * pixelsPerGrid),
    height: Math.round((base.height / doc.grid.tileSize) * pixelsPerGrid),
  };
  if (expected.width < 1 || expected.height < 1) problems.push(t('export.reasonArea'));
  if (doc.grid.type !== 'square') problems.push(t('uvtt.hexWarn'));
  if (doc.grid.offsetX !== 0 || doc.grid.offsetY !== 0) problems.push(t('uvtt.offsetWarn'));
  return problems;
}

// ---------------------------------------------------------------------------
// Bereinigung vor dem Export
// ---------------------------------------------------------------------------

/**
 * Zwei Toleranzen, weil es zwei verschiedene Fragen sind.
 *
 * Ob eine Tür noch auf ihrer Wand sitzt, darf großzügig ausfallen: beim Ziehen
 * wird auf die Wandrichtung projiziert, und gerundet wird auch. Ob zwei
 * Wandenden aneinanderstoßen, darf es nicht — eine Lücke von zwei Pixeln ist in
 * Foundry genau die Leckstelle, die gemeldet gehört, und keine Kleinigkeit.
 */
const DOOR_ON_WALL_TOLERANCE = 2;
const WALL_JOINT_TOLERANCE = 0.5;

export interface CleanupItem {
  id: string;
  /** Fundstelle in Weltpixeln; die Anzeige rechnet daraus Feldkoordinaten. */
  x: number;
  y: number;
}

/**
 * Was eine Bereinigung am Export ändern würde.
 *
 * Bewusst je Art getrennt und nicht als eine gemeinsame Problemliste: die drei
 * Fälle werden verschieden behandelt, und genau das soll die Vorschau zeigen,
 * bevor jemand exportiert.
 */
export interface CleanupPlan {
  /** Als angehängt markiert, aber ohne Wand darunter — wird freistehend. */
  orphanDoors: CleanupItem[];
  /** Offene Wandenden ohne Anschluss — werden nur gemeldet, nie verändert. */
  danglingWallEnds: CleanupItem[];
  /** Lichter, deren Lichtkreis die Karte nicht erreicht — fallen weg. */
  uselessLights: CleanupItem[];
}

export function isCleanupEmpty(plan: CleanupPlan): boolean {
  return (
    plan.orphanDoors.length === 0 &&
    plan.danglingWallEnds.length === 0 &&
    plan.uselessLights.length === 0
  );
}

/** Nur was auch exportiert wird — unsichtbare Wände sind reine Editor-Hilfen. */
function exportedWalls(doc: MapDocument): Wall[] {
  return doc.vtt.walls.filter((w) => w.type !== 'invisible');
}

/** Ruft `visit` für jedes Wandsegment auf; geschlossene Züge inklusive Schluss. */
function eachWallSegment(
  walls: Wall[],
  visit: (wall: Wall, index: number, ax: number, ay: number, bx: number, by: number) => void,
): void {
  for (const wall of walls) {
    const pts = wall.points;
    const segments = wall.closed ? pts.length / 2 : pts.length / 2 - 1;
    for (let i = 0; i < segments; i++) {
      const j = ((i + 1) * 2) % pts.length;
      visit(wall, i, pts[i * 2], pts[i * 2 + 1], pts[j], pts[j + 1]);
    }
  }
}

/**
 * Findet, was den Export in Foundry stören würde.
 *
 * Rein lesend: der Plan sagt nur, was passieren *würde*. Angewandt wird er von
 * `applyExportCleanup`, und auch dann nur auf eine Kopie.
 */
export function planExportCleanup(doc: MapDocument): CleanupPlan {
  const walls = exportedWalls(doc);
  const plan: CleanupPlan = { orphanDoors: [], danglingWallEnds: [], uselessLights: [] };

  // Türen ------------------------------------------------------------------
  // Eine freistehende Tür ist ein Torbogen und völlig in Ordnung; sie wird nie
  // angefasst. Gemeint sind nur Türen, die sich selbst als angehängt ausgeben,
  // deren Wand aber gelöscht oder verschoben wurde.
  for (const portal of doc.vtt.portals) {
    if (portal.freestanding) continue;
    const [x0, y0, x1, y1] = portal.bounds;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    // Geprüft wird die Mitte, nicht die Enden: beim Ziehen wird die Tür auf die
    // Wandrichtung projiziert und darf dabei über das Wandende hinausragen —
    // beide Enden zu verlangen meldete solche völlig gesunden Türen.
    let onWall = false;
    eachWallSegment(walls, (_w, _i, ax, ay, bx, by) => {
      if (onWall) return;
      if (pointSegmentDistanceSq(mx, my, ax, ay, bx, by) <= DOOR_ON_WALL_TOLERANCE ** 2) {
        onWall = true;
      }
    });
    if (!onWall) plan.orphanDoors.push({ id: portal.id, x: mx, y: my });
  }

  // Wandenden --------------------------------------------------------------
  // Ein Endpunkt gilt als angeschlossen, wenn er irgendein anderes Wandsegment
  // berührt — auch mittendrin, denn ein T-Stoß leckt nicht. Türen zählen
  // ebenfalls: wer die Wand für eine Tür auftrennt, hat dort keine Lücke,
  // sondern in Foundry ein Türsegment.
  for (const wall of walls) {
    if (wall.closed) continue;
    const pts = wall.points;
    if (pts.length < 4) continue;
    const lastSegment = pts.length / 2 - 2;
    const ends = [
      { x: pts[0], y: pts[1], own: 0 },
      { x: pts[pts.length - 2], y: pts[pts.length - 1], own: lastSegment },
    ];
    for (const end of ends) {
      let connected = false;
      eachWallSegment(walls, (w, i, ax, ay, bx, by) => {
        if (connected) return;
        // Das eigene Endsegment berührt der Punkt naturgemäß.
        if (w === wall && i === end.own) return;
        if (pointSegmentDistanceSq(end.x, end.y, ax, ay, bx, by) <= WALL_JOINT_TOLERANCE ** 2) {
          connected = true;
        }
      });
      for (const portal of doc.vtt.portals) {
        if (connected) break;
        const [px0, py0, px1, py1] = portal.bounds;
        if (
          pointSegmentDistanceSq(end.x, end.y, px0, py0, px1, py1) <=
          WALL_JOINT_TOLERANCE ** 2
        ) {
          connected = true;
        }
      }
      if (!connected) plan.danglingWallEnds.push({ id: wall.id, x: end.x, y: end.y });
    }
  }

  // Lichter ----------------------------------------------------------------
  // Der Mittelpunkt allein sagt nichts: eine Fackel neben der Karte leuchtet
  // durchaus auf sie. Maßgeblich ist, ob der Lichtkreis die Fläche berührt.
  const base = mapPixelSize(doc.grid, doc.size);
  const area = { minX: 0, minY: 0, maxX: base.width, maxY: base.height };
  for (const light of doc.vtt.lights) {
    if (!circleIntersectsRect(light.x, light.y, light.range * doc.grid.tileSize, area)) {
      plan.uselessLights.push({ id: light.id, x: light.x, y: light.y });
    }
  }

  return plan;
}

/**
 * Wendet den Plan auf eine Kopie der VTT-Daten an.
 *
 * Rein, und das ist die Entscheidung dahinter: der Haken im Export-Dialog
 * verändert die Karte im Editor nicht, er beschreibt nur, was in die Datei
 * geht. Deshalb auch kein Command und kein Eintrag im Rückgängig-Verlauf.
 *
 * `danglingWallEnds` bleibt bewusst folgenlos — Enden zu verbinden hieße raten,
 * welche zusammengehören, und zwei zufällig benachbarte Wände zu verschmelzen
 * wäre schlimmer als die Lücke.
 */
export function applyExportCleanup(vtt: VttData, plan: CleanupPlan): VttData {
  const doors = new Set(plan.orphanDoors.map((d) => d.id));
  const lights = new Set(plan.uselessLights.map((l) => l.id));
  return {
    ...vtt,
    portals: vtt.portals.map((p) => (doors.has(p.id) ? { ...p, freestanding: true } : p)),
    lights: vtt.lights.filter((l) => !lights.has(l.id)),
  };
}
