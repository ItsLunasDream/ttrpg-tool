/**
 * Sperren nach Foundry bringen, die Universal VTT nicht fassen kann.
 *
 * Das Format kennt zwei Töpfe: „Sichtlinie" und „Objekt-Sichtlinie". Foundry
 * führt dagegen vier Kanäle getrennt — Bewegung, Sicht, Licht, Schall. Eine
 * Wand, die Licht aufhält und Sicht durchlässt, oder eine Absperrung, die nur
 * den Weg versperrt, ließ sich deshalb bisher nur in Foundry von Hand
 * nachstellen.
 *
 * Dieses Makro stellt sie nach dem Import ein. Es legt *keine* Wände an — die
 * kommen aus der `.uvtt` — sondern sucht die schon vorhandenen anhand ihrer
 * Koordinaten und setzt die Flags. Anders herum ginge es auch, wäre aber
 * schlechter: dann müsste man dem Importer misstrauen und alles doppelt bauen.
 *
 * **Warum das Suchen nach Koordinaten trägt.** Der Importer legt je Teilstück
 * eine Wand an, mit genau den Punkten aus der Datei, multipliziert mit der
 * Rasterweite der Szene. Hier stehen dieselben Punkte in Grid-Einheiten; die
 * Umrechnung passiert erst in Foundry und stimmt damit auch, wenn die Szene mit
 * einer anderen Auflösung importiert wurde. Verglichen wird mit Toleranz und in
 * beide Richtungen — ob der Importer ein Stück vorwärts oder rückwärts anlegt,
 * ist nicht zugesichert.
 */

import type { MapDocument, Wall } from '@/model/types';
import { isPresetSenses, sensesOf, uvttBucket } from '@/model/wallSenses';

/** Ein Teilstück mit seinen Sperren, in Grid-Einheiten. */
export interface FoundryWallSegment {
  /** [x0, y0, x1, y1] in Grid-Einheiten. */
  c: [number, number, number, number];
  /** Foundry-Werte: 0 = frei, 20 = normal. */
  move: number;
  sight: number;
  light: number;
  sound: number;
}

/** Foundrys `CONST.WALL_SENSE_TYPES`: NONE = 0, NORMAL = 20. */
const NONE = 0;
const NORMAL = 20;

/**
 * Die Teilstücke, die das Makro anfassen soll.
 *
 * Nur Wände, die von ihrer Typ-Voreinstellung abweichen: alles andere hat der
 * Importer schon richtig, und ein Makro, das dreitausend Wände anfasst, um
 * nichts zu ändern, ist ein Makro, das man nicht laufen lässt.
 *
 * Wände, die gar nicht exportiert werden, fallen ebenfalls weg — es gäbe in
 * Foundry nichts, was zu ihnen passt.
 */
export function buildFoundryWalls(doc: MapDocument): FoundryWallSegment[] {
  const tile = doc.grid.tileSize;
  const out: FoundryWallSegment[] = [];

  for (const wall of doc.vtt.walls) {
    if (isPresetSenses(wall)) continue;
    if (uvttBucket(wall) === 'none') continue;
    const s = sensesOf(wall);
    for (const [x0, y0, x1, y1] of segments(wall)) {
      out.push({
        c: [
          runde(x0 / tile),
          runde(y0 / tile),
          runde(x1 / tile),
          runde(y1 / tile),
        ],
        move: s.move ? NORMAL : NONE,
        sight: s.sight ? NORMAL : NONE,
        light: s.light ? NORMAL : NONE,
        sound: s.sound ? NORMAL : NONE,
      });
    }
  }
  return out;
}

/** Teilstücke eines Wandzugs; ein geschlossener Zug hat eines mehr. */
function segments(wall: Wall): Array<[number, number, number, number]> {
  const out: Array<[number, number, number, number]> = [];
  const n = wall.points.length / 2;
  const bis = wall.closed ? n : n - 1;
  for (let i = 0; i < bis; i++) {
    const j = (i + 1) % n;
    out.push([
      wall.points[i * 2],
      wall.points[i * 2 + 1],
      wall.points[j * 2],
      wall.points[j * 2 + 1],
    ]);
  }
  return out;
}

const runde = (v: number) => Math.round(v * 1000) / 1000;

/** Gibt es überhaupt etwas nachzutragen? */
export function needsFoundryWallMacro(doc: MapDocument): boolean {
  return doc.vtt.walls.some((w) => !isPresetSenses(w) && uvttBucket(w) !== 'none');
}

/**
 * Das Makro als Text.
 *
 * Die Daten stehen als JSON-Literal darin, nicht als eingebauter Code — dieselbe
 * Vorsicht wie beim Notiz-Makro.
 */
export function buildFoundryWallsMacro(doc: MapDocument): string {
  const segmente = buildFoundryWalls(doc);
  const daten = JSON.stringify(segmente, null, 2).replace(/<\/script/gi, '<\\/script');
  const kartenname = doc.meta.name.replace(/[\r\n]/g, ' ').replace(/\*\//g, '*\\/');

  return `/**
 * Wandsperren aus dem TTRPG Map Editor für "${kartenname}".
 *
 * So wird es benutzt:
 *   1. Die .uvtt zuerst importieren — dieses Makro legt keine Wände an, es
 *      stellt vorhandene ein.
 *   2. Die Szene öffnen, Makro-Verzeichnis > Neues Makro > Typ "Script",
 *      diesen Text einfügen, ausführen.
 *
 * Betroffen sind ${segmente.length} Teilstück(e). Mehrfach auszuführen schadet nicht:
 * es werden immer dieselben Werte gesetzt.
 */
const SPERREN = ${daten};

/** So nah dürfen zwei Endpunkte liegen, um als derselbe zu gelten (in Feldern). */
const TOLERANZ = 0.2;

(async () => {
  const szene = canvas?.scene;
  if (!szene) {
    ui.notifications.error('Keine aktive Szene.');
    return;
  }
  const feld = szene.grid.size;
  const nah = (a, b) => Math.abs(a - b) <= TOLERANZ * feld;
  const passt = (wand, c) => {
    const [x0, y0, x1, y1] = wand.c;
    const [a0, b0, a1, b1] = [c[0] * feld, c[1] * feld, c[2] * feld, c[3] * feld];
    // Beide Richtungen: ob der Importer ein Stück vorwärts oder rückwärts
    // angelegt hat, ist nicht zugesichert.
    return (
      (nah(x0, a0) && nah(y0, b0) && nah(x1, a1) && nah(y1, b1)) ||
      (nah(x0, a1) && nah(y0, b1) && nah(x1, a0) && nah(y1, b0))
    );
  };

  const aenderungen = [];
  const offen = [];
  for (const s of SPERREN) {
    const wand = szene.walls.find((w) => passt(w, s.c));
    if (!wand) {
      offen.push(s);
      continue;
    }
    aenderungen.push({ _id: wand.id, move: s.move, sight: s.sight, light: s.light, sound: s.sound });
  }

  if (aenderungen.length > 0) await szene.updateEmbeddedDocuments('Wall', aenderungen);

  if (offen.length > 0) {
    ui.notifications.warn(
      \`\${aenderungen.length} Wand-Sperren gesetzt, \${offen.length} Teilstück(e) nicht gefunden — wurde die passende .uvtt importiert?\`,
    );
  } else {
    ui.notifications.info(\`\${aenderungen.length} Wand-Sperren gesetzt.\`);
  }
})();
`;
}
