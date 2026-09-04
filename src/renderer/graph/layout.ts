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
 * Stellt aus einer Kennung eine Zahl zwischen 0 und 1, immer dieselbe fuer
 * dieselbe Kennung.
 *
 * Die Startaufstellung haengt daran statt an der Stelle der Notiz in der
 * Liste: sonst verschoebe schon eine einzige neu angelegte oder geloeschte
 * Notiz die Startwinkel aller anderen, weil sich deren Index in der Liste
 * verschiebt. Damit spraenge beim naechsten Oeffnen des Graphen fast das
 * ganze Netz, obwohl nur eine Notiz dazukam.
 */
function hashUnit(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1_000_000) / 1_000_000;
}

/**
 * Reihenfolge fuer die Startaufstellung: dem Netz entlang statt rein nach
 * Kennung gewuerfelt. Verbundene Knoten bekommen so von Anfang an
 * benachbarte Plaetze auf dem Kreis, sonst muessten sie sich erst quer durchs
 * Bild zueinander vorarbeiten, und bei vielen Knoten reicht die Rechenzeit
 * dafuer nicht.
 *
 * Haengt nur an der Kennung und am Netz, nicht an der Reihenfolge der
 * uebergebenen Liste: dieselbe Notiz bekommt so immer denselben Platz, egal
 * in welcher Reihenfolge sie diesmal ankam.
 */
function stableOrder(ids: { id: string }[], edges: GraphEdge[]): string[] {
  const known = new Set(ids.map((entry) => entry.id));
  const neighbours = new Map<string, string[]>();
  for (const id of known) neighbours.set(id, []);
  for (const edge of edges) {
    if (!known.has(edge.source) || !known.has(edge.target)) continue;
    neighbours.get(edge.source)!.push(edge.target);
    neighbours.get(edge.target)!.push(edge.source);
  }
  // Sortiert, damit die Besuchsreihenfolge nicht an der Reihenfolge der
  // Kanten haengt.
  for (const list of neighbours.values()) list.sort();

  const remaining = new Set(known);
  const order: string[] = [];

  while (remaining.size > 0) {
    // Startpunkt je Teilnetz: die Kennung mit dem kleinsten Fingerabdruck,
    // damit auch der Anfang unabhaengig von der Ankunftsreihenfolge ist.
    let root = '';
    let smallest = Infinity;
    for (const id of remaining) {
      const value = hashUnit(id);
      if (value < smallest) {
        smallest = value;
        root = id;
      }
    }

    const queue = [root];
    remaining.delete(root);
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);
      for (const neighbour of neighbours.get(current) ?? []) {
        if (!remaining.has(neighbour)) continue;
        remaining.delete(neighbour);
        queue.push(neighbour);
      }
    }
  }

  return order;
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
  const hasFixedNodes = ids.some((entry) => options.fixed?.[entry.id]);
  if (!hasFixedNodes) return arrange(ids, edges, options, 1, false);

  /*
   * Mit festen Stellen faellt das Einpassen am Ende weg, die Rechnung muss
   * also selbst in der Flaeche landen. Wie gross sie ausfaellt, haengt an
   * der Knotenzahl und am Netz; eine feste Zahl passte mal fuer wenige und
   * mal fuer viele, nie fuer beide.
   *
   * Deshalb wird einmal ohne Ruecksicht gerechnet, das Ergebnis gemessen und
   * mit dem passenden Wunschabstand ein zweites Mal gerechnet. Das kostet
   * einen zweiten Durchlauf, dafuer stimmt die Groesse in jedem Fall.
   */
  // Der Messlauf darf nicht begrenzt werden, sonst faende er immer genau die
  // Flaeche vor und haette nichts zu messen. Er laeuft ueber die vollen
  // Runden: mit der Haelfte faellt die gemessene Groesse zu klein aus, weil
  // sich das Netz bis zuletzt weiter ausdehnt, und die Knoten landeten
  // wieder am Rand. Der Preis ist der doppelte Rechenaufwand, sobald eine
  // Stelle gesetzt ist.
  const draft = arrange(ids, edges, options, 1, false);
  const spanX = Math.max(...draft.map((node) => node.x)) - Math.min(...draft.map((node) => node.x));
  const spanY = Math.max(...draft.map((node) => node.y)) - Math.min(...draft.map((node) => node.y));

  const usable = Math.min(
    spanX > 1 ? (options.width - EDGE_MARGIN * 2) / spanX : 1,
    spanY > 1 ? (options.height - EDGE_MARGIN * 2) / spanY : 1
  );

  return arrange(ids, edges, options, Math.min(1, usable), true);
}

function arrange(
  ids: { id: string; degree: number }[],
  edges: GraphEdge[],
  options: LayoutOptions,
  spread: number,
  /** Waehrend der Rechnung in der Flaeche halten. Nur mit festen Stellen. */
  bounded: boolean
): GraphNode[] {
  // Jede Runde vergleicht alle Knotenpaare. Bei vielen Notizen waere das mit
  // fester Rundenzahl eine spuerbare Blockade, deshalb sinkt sie mit der
  // Groesse. Das Ergebnis wird gröber, bleibt aber brauchbar.
  const defaultIterations = Math.round(Math.min(300, Math.max(60, 30000 / Math.max(1, ids.length))));
  const { width, height, iterations = defaultIterations, seed = 42, fixed = {} } = options;
  const random = makeRandom(seed);
  const hasFixed = ids.some((entry) => fixed[entry.id]);

  // Reihenfolge auf dem Kreis: dem Netz entlang und nach Kennung, statt nach
  // der Stelle in der uebergebenen Liste. So bekommt jede Notiz immer
  // denselben Platz im Kreis, gleich in welcher Reihenfolge sie ankommt, und
  // verbundene Notizen starten nah beieinander.
  const rank = new Map(stableOrder(ids, edges).map((id, index) => [id, index]));

  // Startaufstellung auf einem Kreis, damit nichts exakt aufeinanderliegt.
  const nodes: GraphNode[] = ids.map((entry) => {
    const angle = (rank.get(entry.id)! / Math.max(1, ids.length)) * Math.PI * 2;
    const radius = Math.min(width, height) * 0.3;
    const jitter = hashUnit(`${entry.id}:jitter`);
    const set = fixed[entry.id];
    return {
      id: entry.id,
      degree: entry.degree,
      x: set ? set.x : width / 2 + Math.cos(angle) * radius + (jitter - 0.5) * 10,
      y: set ? set.y : height / 2 + Math.sin(angle) * radius + (jitter - 0.5) * 10
    };
  });

  if (nodes.length <= 1) return nodes;

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const linked = edges.filter((edge) => byId.has(edge.source) && byId.has(edge.target));

  const idealDistance = Math.sqrt((width * height) / nodes.length) * 0.7 * spread;
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

      // Mit festen Stellen faellt das Einpassen am Ende weg, also muss schon
      // waehrend der Rechnung begrenzt werden. Erst hinterher zu schneiden
      // schoebe alle Ausreisser auf denselben Randpunkt; so bleibt die
      // Abstossung wirksam und verteilt sie am Rand entlang. Und die
      // Abstaende zu den festen Knoten bleiben erhalten, was ein
      // nachtraegliches Einpassen der freien Knoten zerstoert haette.
      if (bounded) {
        node.x = Math.min(width - EDGE_MARGIN, Math.max(EDGE_MARGIN, node.x));
        node.y = Math.min(height - EDGE_MARGIN, Math.max(EDGE_MARGIN, node.y));
      }
    }
  }

  // Mit festen Stellen wurde schon in jeder Runde begrenzt. Nachtraeglich
  // einzupassen wuerde entweder die gesetzten Stellen verschieben oder die
  // Abstaende zu ihnen zerstoeren.
  const placed = hasFixed ? nodes : fitToViewport(nodes, width, height);

  // Die Kraeftesimulation findet nicht in jeder Netzform von selbst genug
  // Abstand: bei einer langen Kette etwa bleibt schon mal ein Paar zu nah
  // beieinander haengen, auch nach vielen Runden. Ein letzter Durchgang
  // trennt solche Reste, ohne feste Stellen zu verschieben.
  return resolveOverlaps(placed, fixed, width, height, hasFixed);
}

/** Abstand zum Rand, damit ein Knoten nicht halb ausserhalb klebt. */
const EDGE_MARGIN = 40;

/** Mindestabstand, den kein Knotenpaar unterschreiten darf. */
const MIN_NODE_GAP = 28;

/**
 * Trennt Knotenpaare, die sich trotz der Simulation noch zu nah gekommen
 * sind. Feste Stellen bleiben unangetastet, ein zu nah geratener freier
 * Knoten weicht ganz allein aus.
 */
function resolveOverlaps(
  nodes: GraphNode[],
  fixed: Record<string, { x: number; y: number }>,
  width: number,
  height: number,
  bounded: boolean
): GraphNode[] {
  for (let pass = 0; pass < 20; pass++) {
    let moved = false;

    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const first = nodes[a];
        const second = nodes[b];
        const firstFixed = Boolean(fixed[first.id]);
        const secondFixed = Boolean(fixed[second.id]);
        if (firstFixed && secondFixed) continue;

        let dx = first.x - second.x;
        let dy = first.y - second.y;
        let distance = Math.hypot(dx, dy);
        if (distance >= MIN_NODE_GAP) continue;

        if (distance < 0.01) {
          dx = 1;
          dy = 0;
          distance = 0.01;
        }

        const ux = dx / distance;
        const uy = dy / distance;
        // Ist nur eine Seite fest, weicht die andere ganz alleine aus.
        const share = firstFixed || secondFixed ? MIN_NODE_GAP - distance : (MIN_NODE_GAP - distance) / 2;

        if (!firstFixed) {
          first.x += ux * share;
          first.y += uy * share;
        }
        if (!secondFixed) {
          second.x -= ux * share;
          second.y -= uy * share;
        }
        moved = true;
      }
    }

    if (bounded) {
      for (const node of nodes) {
        if (fixed[node.id]) continue;
        node.x = Math.min(width - EDGE_MARGIN, Math.max(EDGE_MARGIN, node.x));
        node.y = Math.min(height - EDGE_MARGIN, Math.max(EDGE_MARGIN, node.y));
      }
    }

    if (!moved) break;
  }

  return nodes;
}
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
