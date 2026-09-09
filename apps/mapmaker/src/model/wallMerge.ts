/**
 * Wandzüge zusammenführen.
 *
 * In Foundry sind zwei Wandenden auf demselben Punkt eine häufige Leckstelle:
 * was im Editor wie eine durchgehende Wand aussieht, sind zwei Züge, und je
 * nach Rundung bleibt zwischen ihnen ein Spalt, durch den Sicht hindurchgeht.
 * Ein einziger Zug hat das Problem nicht.
 *
 * Zusammengeführt wird nur, was zusammengehört: gleiche Wandart und Enden, die
 * aufeinanderliegen. **Nur Enden** — dass ein Ende mitten auf einem anderen Zug
 * liegt, ist ein T-Stoß; den zu einem Zug zu verschmelzen hieße, ihn irgendwo
 * aufzutrennen, und das wäre eine andere Wand als die gezeichnete.
 *
 * Geschlossene Züge bleiben, wie sie sind: sie haben keine Enden.
 */

import { makeId } from './ids';
import type { Wall } from './types';

/** Zwei Enden gelten als derselbe Punkt, wenn sie näher liegen als das hier. */
export const JOIN_TOLERANCE = 1.5;

interface Kette {
  points: number[];
  type: Wall['type'];
  /** Kennungen der Züge, aus denen die Kette entstanden ist. */
  sources: string[];
}

function ersterPunkt(points: number[]): [number, number] {
  return [points[0], points[1]];
}

function letzterPunkt(points: number[]): [number, number] {
  return [points[points.length - 2], points[points.length - 1]];
}

function nah(a: [number, number], b: [number, number], toleranz: number): boolean {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 <= toleranz * toleranz;
}

/** Punktliste rückwärts — beim Anhängen muss oft ein Zug umgedreht werden. */
function umgedreht(points: number[]): number[] {
  const out: number[] = [];
  for (let i = points.length - 2; i >= 0; i -= 2) out.push(points[i], points[i + 1]);
  return out;
}

export interface MergeResult {
  /** Neue, zusammengeführte Züge. */
  merged: Wall[];
  /** Kennungen der Züge, die dafür weichen — immer mindestens zwei je Ergebnis. */
  removedIds: string[];
}

/**
 * Führt zusammen, was sich an den Enden berührt.
 *
 * Arbeitet gierig: ein Zug wird zur Kette, dann wird gesucht, was an ihren
 * beiden Enden anschließt, bis nichts mehr passt. Das reicht hier — es geht um
 * Wandzüge, die jemand von Hand nacheinander gezeichnet hat, nicht um ein
 * beliebiges Netz.
 *
 * Berühren sich am Ende Anfang und Schluss derselben Kette, wird sie
 * geschlossen: der doppelte Punkt fällt weg, `closed` übernimmt seine Aufgabe.
 * Genau so entsteht sonst die Lücke, um die es hier geht.
 */
export function mergeWalls(walls: Wall[], tolerance = JOIN_TOLERANCE): MergeResult {
  const offen = walls.filter((w) => !w.closed && w.points.length >= 4);
  const rest = [...offen];
  const merged: Wall[] = [];
  const removedIds: string[] = [];

  while (rest.length > 0) {
    const start = rest.shift()!;
    const kette: Kette = {
      points: [...start.points],
      type: start.type,
      sources: [start.id],
    };

    let gewachsen = true;
    while (gewachsen) {
      gewachsen = false;
      for (let i = 0; i < rest.length; i++) {
        const kandidat = rest[i];
        // Verschiedene Wandarten bleiben getrennt: eine Fensterreihe und eine
        // Mauer sehen in Foundry verschieden aus, auch wenn sie sich berühren.
        if (kandidat.type !== kette.type) continue;

        const kEnde = letzterPunkt(kette.points);
        const kAnfang = ersterPunkt(kette.points);
        const anfang = ersterPunkt(kandidat.points);
        const ende = letzterPunkt(kandidat.points);

        let angehaengt: number[] | null = null;
        if (nah(kEnde, anfang, tolerance)) {
          angehaengt = [...kette.points, ...kandidat.points.slice(2)];
        } else if (nah(kEnde, ende, tolerance)) {
          angehaengt = [...kette.points, ...umgedreht(kandidat.points).slice(2)];
        } else if (nah(kAnfang, ende, tolerance)) {
          angehaengt = [...kandidat.points.slice(0, -2), ...kette.points];
        } else if (nah(kAnfang, anfang, tolerance)) {
          angehaengt = [...umgedreht(kandidat.points).slice(0, -2), ...kette.points];
        }

        if (!angehaengt) continue;
        kette.points = angehaengt;
        kette.sources.push(kandidat.id);
        rest.splice(i, 1);
        gewachsen = true;
        break;
      }
    }

    // Aus einem einzelnen Zug wird nichts Neues.
    if (kette.sources.length < 2) continue;

    let punkte = kette.points;
    let closed = false;
    if (punkte.length >= 8 && nah(ersterPunkt(punkte), letzterPunkt(punkte), tolerance)) {
      // Der Schlusspunkt liegt auf dem Anfang: das ist ein Ring. Den doppelten
      // Punkt stehen zu lassen ergäbe ein Segment der Länge null.
      punkte = punkte.slice(0, -2);
      closed = true;
    }

    merged.push({ id: makeId('wall'), points: punkte, type: kette.type, closed });
    removedIds.push(...kette.sources);
  }

  return { merged, removedIds };
}
