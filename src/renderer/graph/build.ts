import { findWikiLinks, normalizeName } from '../../shared/wikilinks';
import type { Note } from '../../shared/types';
import type { NoteIndex } from '../noteIndex';
import type { GraphEdge } from './layout';

export type GraphMode = 'relations' | 'mentions' | 'both';

/**
 * Baut das Kantenbild einer Kampagne. Beziehungen sind gerichtet und tragen
 * ihren Typ als Beschriftung, Erwaehnungen ergeben sich aus den [[Links]] im
 * Text. Doppelte Erwaehnungen derselben Richtung zaehlen nur einmal.
 */
export function buildGraphEdges(index: NoteIndex, mode: GraphMode): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  const add = (edge: GraphEdge) => {
    const key = `${edge.kind}:${edge.source}:${edge.target}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push(edge);
  };

  for (const note of index.notes) {
    if (mode !== 'mentions') {
      for (const relation of note.relations) {
        if (!index.byId.has(relation.targetId)) continue;
        add({ source: note.id, target: relation.targetId, label: relation.type.trim(), kind: 'relation' });
      }
    }

    if (mode !== 'relations') {
      for (const link of findWikiLinks(note.body)) {
        const target = index.byName.get(normalizeName(link.target));
        if (!target || target.id === note.id) continue;
        add({ source: note.id, target: target.id, label: '', kind: 'mention' });
      }
    }
  }

  return edges;
}

/** Knoten samt Kantenzahl, in der Reihenfolge des Index. */
export function buildGraphNodes(notes: Note[], edges: GraphEdge[]): { id: string; degree: number }[] {
  const degree = new Map<string, number>(notes.map((note) => [note.id, 0]));
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }
  return notes.map((note) => ({ id: note.id, degree: degree.get(note.id) ?? 0 }));
}
