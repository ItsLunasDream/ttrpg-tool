import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findNoteType } from '../../shared/noteTypes';
import type { NoteIndex } from '../noteIndex';
import { buildGraphEdges, buildGraphNodes, type GraphMode } from '../graph/build';
import { layoutGraph, type GraphNode } from '../graph/layout';
import { useT } from '../i18n';

interface Props {
  index: NoteIndex;
  activeNoteId: string | null;
  onOpenNote: (noteId: string) => void;
  onClose: () => void;
}

const WIDTH = 1200;
const HEIGHT = 780;

/** Feste Farbreihe, damit Notiztypen wiedererkennbar bleiben. */
const TYPE_COLORS = ['#c4a35a', '#8ec3e0', '#a3c48b', '#d98a7c', '#b39ddb', '#7fb3a8'];

export function GraphView({ index, activeNoteId, onOpenNote, onClose }: Props) {
  const t = useT();
  const [mode, setMode] = useState<GraphMode>('both');
  const [seed, setSeed] = useState(42);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  const edges = useMemo(() => buildGraphEdges(index, mode), [index, mode]);
  const nodeSeeds = useMemo(() => buildGraphNodes(index.notes, edges), [index.notes, edges]);

  const computed = useMemo(
    () => layoutGraph(nodeSeeds, edges, { width: WIDTH, height: HEIGHT, seed }),
    [nodeSeeds, edges, seed]
  );

  // Nach einer Neuberechnung zaehlen wieder die berechneten Werte, von Hand
  // verschobene Knoten werden verworfen.
  useEffect(() => {
    setPositions({});
  }, [computed]);

  const nodes: GraphNode[] = useMemo(
    () => computed.map((node) => ({ ...node, ...(positions[node.id] ?? {}) })),
    [computed, positions]
  );

  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const typeColor = useCallback(
    (typeId: string) => {
      const position = index.types.findIndex((def) => def.id === typeId);
      return TYPE_COLORS[(position === -1 ? index.types.length : position) % TYPE_COLORS.length];
    },
    [index.types]
  );

  /** Nachbarn des Knotens unter der Maus, fuer das Hervorheben. */
  const neighbours = useMemo(() => {
    if (!hovered) return null;
    const found = new Set<string>([hovered]);
    for (const edge of edges) {
      if (edge.source === hovered) found.add(edge.target);
      if (edge.target === hovered) found.add(edge.source);
    }
    return found;
  }, [hovered, edges]);

  function toSvgPoint(event: React.MouseEvent): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT
    };
  }

  return (
    <div className="graph">
      <header className="graph__bar">
        <strong>{t('graph.title')}</strong>

        <div className="graph__modes">
          {(['relations', 'mentions', 'both'] as GraphMode[]).map((entry) => (
            <button
              key={entry}
              type="button"
              className={entry === mode ? 'is-active' : undefined}
              onClick={() => setMode(entry)}
            >
              {t(entry === 'relations' ? 'graph.relations' : entry === 'mentions' ? 'graph.mentions' : 'graph.both')}
            </button>
          ))}
        </div>

        <span className="graph__count">{t('graph.nodes', { nodes: nodes.length, edges: edges.length })}</span>
        <span className="campaign-bar__spacer" />

        <button type="button" onClick={() => setSeed((previous) => previous + 1)}>
          {t('graph.recalculate')}
        </button>
        <button type="button" onClick={onClose}>
          {t('graph.close')}
        </button>
      </header>

      {edges.length === 0 ? <p className="graph__empty">{t('graph.empty')}</p> : null}

      <svg
        ref={svgRef}
        className="graph__canvas"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={(event) => {
          if (!dragging) return;
          const point = toSvgPoint(event);
          if (point) setPositions((previous) => ({ ...previous, [dragging]: point }));
        }}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => {
          setDragging(null);
          setHovered(null);
        }}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const source = byId.get(edge.source);
          const target = byId.get(edge.target);
          if (!source || !target) return null;

          const dimmed = neighbours ? !(neighbours.has(edge.source) && neighbours.has(edge.target)) : false;
          const radius = 8 + Math.min(10, target.degree);
          const angle = Math.atan2(target.y - source.y, target.x - source.x);

          return (
            <g
              key={`${edge.kind}-${edge.source}-${edge.target}`}
              className={`graph__edge graph__edge--${edge.kind}${dimmed ? ' is-dimmed' : ''}`}
            >
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x - Math.cos(angle) * radius}
                y2={target.y - Math.sin(angle) * radius}
                markerEnd="url(#arrow)"
              />
              {edge.label && !dimmed ? (
                <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 4}>
                  {edge.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {nodes.map((node) => {
          const note = index.byId.get(node.id);
          if (!note) return null;

          const dimmed = neighbours ? !neighbours.has(node.id) : false;
          const radius = 8 + Math.min(10, node.degree);

          return (
            <g
              key={node.id}
              className={`graph__node${dimmed ? ' is-dimmed' : ''}${node.id === activeNoteId ? ' is-active' : ''}`}
              transform={`translate(${node.x} ${node.y})`}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onMouseDown={(event) => {
                event.preventDefault();
                setDragging(node.id);
              }}
              onClick={() => onOpenNote(node.id)}
            >
              <title>{`${note.title} · ${findNoteType(index.types, note.type).label}`}</title>
              <circle r={radius} fill={typeColor(note.type)} />
              <text y={radius + 13}>{note.title}</text>
            </g>
          );
        })}
      </svg>

      <p className="graph__hint">{t('graph.hint')}</p>
    </div>
  );
}
