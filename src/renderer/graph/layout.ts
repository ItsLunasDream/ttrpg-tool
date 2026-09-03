export interface GraphNode {
  id: string;
  x: number;
  y: number;
  /** Anzahl Kanten, bestimmt die dargestellte Größe. */
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  /** Beschriftung, etwa der Beziehungstyp. */
  label: string;
  kind: 'relation' | 'mention';
}

export interface LayoutOptions {
  width: number;
  height: number;
  iterations?: number;
  seed?: number;
  /**
   * Von Hand gesetzte Stellen. Diese Knoten bleiben, wo sie sind, die
   * uebrigen ordnen sich um sie herum. So verschiebt eine neu angelegte
   * Notiz nicht das ganze Netz.
   */
  fixed?: Record<string, { x: number; y: number }>;
}

/** Einfacher, wiederholbarer Zufallsgenerator, damit dasselbe Netz gleich aussieht. */
function makeRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Kraeftebasierte Anordnung, von Hand statt mit einer Bibliothek: das Netz
 * einer Kampagne ist klein, und so bleibt die Anwendung ohne zusaetzliche
 * Abhaengigkeit.
 *
 * Drei Kraefte wirken: verbundene Knoten ziehen sich an, alle Knoten stossen
 * sich ab, und ein leichter Zug zur Mitte haelt das Ganze zusammen.
 */
export function layoutGraph(
  ids: { id: string; degree: number }[],
  edges: GraphEdge[],
  options: LayoutOptions
): GraphNode[] {
  // Jede Runde vergleicht alle Knotenpaare. Bei vielen Notizen waere das mit
  // fester Rundenzahl eine spuerbare Blockade, deshalb sinkt sie mit der
  // Groesse. Das Ergebnis wird gröber, bleibt aber brauchbar.
  const defaultIterations = Math.round(Math.min(300, Math.max(60, 30000 / Math.max(1, ids.length))));
  const { width, height, iterations = defaultIterations, seed = 42, fixed = {} } = options;
  const random = makeRandom(seed);
  const hasFixed = ids.some((entry) => fixed[entry.id]);

  // Startaufstellung auf einem Kreis, damit nichts exakt aufeinanderliegt.
  const nodes: GraphNode[] = ids.map((entry, index) => {
    const angle = (index / Math.max(1, ids.length)) * Math.PI * 2;
    const radius = Math.min(width, height) * 0.3;
    const set = fixed[entry.id];
    return {
      id: entry.id,
      degree: entry.degree,
      x: set ? set.x : width / 2 + Math.cos(angle) * radius + (random() - 0.5) * 10,
      y: set ? set.y : height / 2 + Math.sin(angle) * radius + (random() - 0.5) * 10
    };
  });

  if (nodes.length <= 1) return nodes;

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const linked = edges.filter((edge) => byId.has(edge.source) && byId.has(edge.target));

  const idealDistance = Math.sqrt((width * height) / nodes.length) * 0.7;
  const repulsion = idealDistance * idealDistance;

  for (let step = 0; step < iterations; step++) {
    // Abkuehlung: grosse Schritte am Anfang, feine am Ende.
    const temperature = (1 - step / iterations) * idealDistance * 0.12;
    const displacement = new Map(nodes.map((node) => [node.id, { x: 0, y: 0 }]));

    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const first = nodes[a];
        const second = nodes[b];
        let dx = first.x - second.x;
        let dy = first.y - second.y;
        let distance = Math.hypot(dx, dy);

        if (distance < 0.01) {
          dx = random() - 0.5;
          dy = random() - 0.5;
          distance = 0.01;
        }

        const force = repulsion / distance;
        const pushX = (dx / distance) * force;
        const pushY = (dy / distance) * force;

        const moveFirst = displacement.get(first.id)!;
        const moveSecond = displacement.get(second.id)!;
        moveFirst.x += pushX;
        moveFirst.y += pushY;
        moveSecond.x -= pushX;
        moveSecond.y -= pushY;
      }
    }

    for (const edge of linked) {
      const source = byId.get(edge.source)!;
      const target = byId.get(edge.target)!;
      const dx = source.x - target.x;
      const dy = source.y - target.y;
      const distance = Math.max(0.01, Math.hypot(dx, dy));

      const force = (distance * distance) / idealDistance;
      const pullX = (dx / distance) * force;
      const pullY = (dy / distance) * force;

      const moveSource = displacement.get(source.id)!;
      const moveTarget = displacement.get(target.id)!;
      moveSource.x -= pullX;
      moveSource.y -= pullY;
      moveTarget.x += pullX;
      moveTarget.y += pullY;
    }

    for (const node of nodes) {
      if (fixed[node.id]) continue;
      const move = displacement.get(node.id)!;

      // Zug zur Mitte, sonst driften unverbundene Knoten ins Nichts.
      move.x += (width / 2 - node.x) * 0.02;
      move.y += (height / 2 - node.y) * 0.02;

      const length = Math.max(0.01, Math.hypot(move.x, move.y));
      const limited = Math.min(length, temperature);
      node.x += (move.x / length) * limited;
      node.y += (move.y / length) * limited;

    }
  }

  // Mit festen Stellen darf nicht eingepasst werden: das Skalieren wuerde
  // genau die Knoten verschieben, die stehen bleiben sollen. Die freien
  // werden stattdessen in die Flaeche geholt, sonst treiben sie aus dem Bild
  // und waeren nur noch ueber das Verschieben der Ansicht zu finden.
  if (!hasFixed) return fitToViewport(nodes, width, height);

  return nodes.map((node) =>
    fixed[node.id]
      ? node
      : {
          ...node,
          x: Math.min(width - EDGE_MARGIN, Math.max(EDGE_MARGIN, node.x)),
          y: Math.min(height - EDGE_MARGIN, Math.max(EDGE_MARGIN, node.y))
        }
  );
}

/** Abstand zum Rand, damit ein Knoten nicht halb ausserhalb klebt. */
const EDGE_MARGIN = 40;

/**
 * Skaliert und zentriert das Ergebnis so, dass es die Flaeche ausfuellt.
 * Ohne diesen Schritt haengt die Groesse des Netzes davon ab, wie stark
 * Abstossung und Anziehung bei der jeweiligen Knotenzahl ausfallen, und bei
 * wenigen Knoten kleben sie am Rand.
 */
function fitToViewport(nodes: GraphNode[], width: number, height: number, margin = 60): GraphNode[] {
  if (nodes.length === 0) return nodes;
  if (nodes.length === 1) return [{ ...nodes[0], x: width / 2, y: height / 2 }];

  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const usableWidth = Math.max(1, width - margin * 2);
  const usableHeight = Math.max(1, height - margin * 2);

  // Gleichmaessig skalieren, sonst verzerrt sich das Netz.
  const scale = Math.min(spanX > 1 ? usableWidth / spanX : 1, spanY > 1 ? usableHeight / spanY : 1);

  const offsetX = (width - spanX * scale) / 2 - minX * scale;
  const offsetY = (height - spanY * scale) / 2 - minY * scale;

  return nodes.map((node) => ({ ...node, x: node.x * scale + offsetX, y: node.y * scale + offsetY }));
}
