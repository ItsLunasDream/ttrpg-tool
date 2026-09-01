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
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [view, setView] = useState({ x: 0, y: 0, width: WIDTH, height: HEIGHT });
  const [panning, setPanning] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Ausgeblendete Typen fliegen samt ihrer Kanten raus, damit die Anordnung
  // den verbleibenden Knoten den ganzen Platz gibt.
  const visibleNotes = useMemo(
    () => index.notes.filter((note) => !hiddenTypes.has(note.type)),
    [index.notes, hiddenTypes]
  );
  const visibleIndex = useMemo(
    () => ({ ...index, notes: visibleNotes, byId: new Map(visibleNotes.map((note) => [note.id, note])) }),
    [index, visibleNotes]
  );

  const edges = useMemo(() => buildGraphEdges(visibleIndex, mode), [visibleIndex, mode]);
  const nodeSeeds = useMemo(() => buildGraphNodes(visibleNotes, edges), [visibleNotes, edges]);

  const computed = useMemo(
    () => layoutGraph(nodeSeeds, edges, { width: WIDTH, height: HEIGHT, seed }),
    [nodeSeeds, edges, seed]
  );

  // Nach einer Neuberechnung zaehlen wieder die berechneten Werte, von Hand
  // verschobene Knoten werden verworfen.
  useEffect(() => {
    setPositions({});
    setView({ x: 0, y: 0, width: WIDTH, height: HEIGHT });
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

  /** Bildschirmkoordinate in Diagrammkoordinate, unter Beruecksichtigung des Zooms. */
  function toSvgPoint(event: { clientX: number; clientY: number }): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: view.x + ((event.clientX - rect.left) / rect.width) * view.width,
      y: view.y + ((event.clientY - rect.top) / rect.height) * view.height
    };
  }

  /** Zoomt um den Punkt unter dem Mauszeiger, nicht um die Bildmitte. */
  function zoomAt(factor: number, anchor: { x: number; y: number } | null) {
    setView((previous) => {
      const width = Math.min(WIDTH * 4, Math.max(WIDTH / 8, previous.width * factor));
      const scale = width / previous.width;
      const height = previous.height * scale;
      const point = anchor ?? { x: previous.x + previous.width / 2, y: previous.y + previous.height / 2 };
      return {
        width,
        height,
        x: point.x - (point.x - previous.x) * scale,
        y: point.y - (point.y - previous.y) * scale
      };
    });
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

        <div className="graph__modes">
          <button
            type="button"
            className={hiddenTypes.size === 0 ? 'is-active' : undefined}
            onClick={() => setHiddenTypes(new Set())}
            title={t('graph.filterType')}
          >
            {t('graph.allTypes')}
          </button>
          {index.types.map((def) => (
            <button
              key={def.id}
              type="button"
              className={hiddenTypes.has(def.id) ? undefined : 'is-active'}
              onClick={() =>
                setHiddenTypes((previous) => {
                  const next = new Set(previous);
                  if (next.has(def.id)) next.delete(def.id);
                  else next.add(def.id);
                  return next;
                })
              }
            >
              <span className="graph__swatch" style={{ background: typeColor(def.id) }} />
              {def.label}
            </button>
          ))}
        </div>

        <span className="graph__count">{t('graph.nodes', { nodes: nodes.length, edges: edges.length })}</span>
        <span className="campaign-bar__spacer" />

        <button type="button" title={t('graph.zoomOut')} onClick={() => zoomAt(1.25, null)}>
          −
        </button>
        <button type="button" title={t('graph.zoomIn')} onClick={() => zoomAt(0.8, null)}>
          +
        </button>
        <button type="button" onClick={() => setView({ x: 0, y: 0, width: WIDTH, height: HEIGHT })}>
          {t('graph.zoomReset')}
        </button>
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
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={(event) => zoomAt(event.deltaY > 0 ? 1.12 : 0.89, toSvgPoint(event))}
        onMouseDown={(event) => {
          // Nur auf freier Flaeche verschieben, auf Knoten gilt das Ziehen.
          if (event.target === event.currentTarget) setPanning(toSvgPoint(event));
        }}
        onMouseMove={(event) => {
          if (dragging) {
            const point = toSvgPoint(event);
            if (point) setPositions((previous) => ({ ...previous, [dragging]: point }));
            return;
          }
          if (!panning) return;

          const point = toSvgPoint(event);
          if (!point) return;
          setView((previous) => ({
            ...previous,
            x: previous.x - (point.x - panning.x),
            y: previous.y - (point.y - panning.y)
          }));
        }}
        onMouseUp={() => {
          setDragging(null);
          setPanning(null);
        }}
        onMouseLeave={() => {
          setDragging(null);
          setPanning(null);
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
          const note = visibleIndex.byId.get(node.id);
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
              {/* Der Umriss in Hintergrundfarbe haelt die Beschriftung ueber
                  Kanten und anderen Knoten lesbar. */}
              <text y={radius + 15} className="graph__label">
                {note.title}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="graph__hint">{t('graph.hintFull')}</p>
    </div>
  );
}
