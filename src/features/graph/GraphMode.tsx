import { useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { neighborsOf, nodeLayerIndex, propagateGraphState, summarizeNodeInfluence } from './engine';
import { DEMO_GRAPH, type GraphEdgeType, type GraphNode } from './model';

type CameraState = {
  panX: number;
  panY: number;
  zoom: number;
};

type LayerFilter = 'risks' | 'actions' | 'goals' | 'delays';

const EDGE_STYLE: Record<GraphEdgeType, { color: string; dash?: string }> = {
  boosts: { color: '#82ffe2' },
  drags: { color: '#ff9f84' },
  blocks: { color: '#ff6f8a', dash: '8 6' },
  conflicts: { color: '#ffc58f', dash: '4 5' },
  delayed: { color: '#9ec8ff', dash: '2 7' },
};

const NODE_STYLE: Record<GraphNode['type'], { fill: string; stroke: string; radius: number }> = {
  domain: { fill: '#6ec6ff', stroke: '#c7e6ff', radius: 23 },
  factor: { fill: '#97b1ff', stroke: '#d9e2ff', radius: 14 },
  action: { fill: '#8affc6', stroke: '#cbffe8', radius: 16 },
  risk: { fill: '#ff8678', stroke: '#ffd4cc', radius: 17 },
  goal: { fill: '#ffe08c', stroke: '#fff3c7', radius: 18 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toPercent = (value: number) => `${Math.round(value)}%`;

const edgePath = (from: GraphNode, to: GraphNode) => {
  const curve = clamp((to.position.x - from.position.x) * 0.22, -70, 70);
  const c1x = from.position.x + curve;
  const c1y = from.position.y;
  const c2x = to.position.x - curve;
  const c2y = to.position.y;
  return `M ${from.position.x} ${from.position.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.position.x} ${to.position.y}`;
};

export const GraphMode = () => {
  const [selectedNodeId, setSelectedNodeId] = useState('domain-focus');
  const [camera, setCamera] = useState<CameraState>({ panX: 0, panY: 0, zoom: 1 });
  const [filters, setFilters] = useState<Record<LayerFilter, boolean>>({ risks: true, actions: true, goals: true, delays: true });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const nodes = useMemo(() => propagateGraphState(DEMO_GRAPH, 2), []);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const selectedNode = nodeMap.get(selectedNodeId) ?? nodes[0];
  const neighborhood = neighborsOf(DEMO_GRAPH, selectedNode.id);

  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (node.type === 'risk' && !filters.risks) {
        return false;
      }
      if (node.type === 'action' && !filters.actions) {
        return false;
      }
      if (node.type === 'goal' && !filters.goals) {
        return false;
      }
      if (node.type === 'factor' && node.parentDomainId && selectedNode.type !== 'domain') {
        return neighborhood.nodeIds.has(node.id);
      }
      if (node.type === 'factor' && node.parentDomainId && selectedNode.type === 'domain') {
        return node.parentDomainId === selectedNode.id || neighborhood.nodeIds.has(node.id);
      }
      return true;
    });
  }, [filters.actions, filters.goals, filters.risks, neighborhood.nodeIds, nodes, selectedNode.id, selectedNode.type]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const visibleEdges = useMemo(
    () =>
      DEMO_GRAPH.edges.filter((edge) => {
        if (!visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to)) {
          return false;
        }
        if (edge.type === 'delayed' && !filters.delays) {
          return false;
        }
        return true;
      }),
    [filters.delays, visibleNodeIds],
  );

  const summary = summarizeNodeInfluence(DEMO_GRAPH, selectedNode.id);

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };

    setCamera((current) => ({
      ...current,
      panX: clamp(current.panX + deltaX * 0.75, -340, 340),
      panY: clamp(current.panY + deltaY * 0.75, -220, 220),
    }));
  };

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.1 : 0.1;
    setCamera((current) => ({ ...current, zoom: clamp(current.zoom + direction, 0.62, 1.68) }));
  };

  return (
    <div className="graph-mode" aria-label="Graph influence view">
      <div className="graph-header">
        <p className="scene-mode-kicker">Analytical Projection</p>
        <h2 className="scene-mode-title">Causal force-map of the same living world.</h2>
      </div>

      <div className="graph-filter-bar" role="toolbar" aria-label="Graph layers">
        {(['risks', 'actions', 'goals', 'delays'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            className={filters[filter] ? 'graph-filter active' : 'graph-filter'}
            onClick={() => setFilters((current) => ({ ...current, [filter]: !current[filter] }))}
          >
            {filter}
          </button>
        ))}
      </div>

      <svg
        className="graph-scene"
        viewBox="-560 -340 1120 680"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <defs>
          <filter id="edgeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.3" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="11" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 11 3.5, 0 7" fill="#cbe9ff" opacity="0.88" />
          </marker>
        </defs>

        <g transform={`translate(${camera.panX} ${camera.panY}) scale(${camera.zoom})`}>
          {visibleEdges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) {
              return null;
            }

            const style = EDGE_STYLE[edge.type];
            const isNeighbor = neighborhood.edgeIds.has(edge.id);

            return (
              <g key={edge.id} opacity={isNeighbor ? 0.95 : 0.25} filter="url(#edgeGlow)">
                <path
                  d={edgePath(from, to)}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={isNeighbor ? 2.9 : 1.4}
                  strokeDasharray={style.dash}
                  markerEnd="url(#arrowhead)"
                />
                <text x={(from.position.x + to.position.x) / 2} y={(from.position.y + to.position.y) / 2 - 5} className="graph-edge-label">
                  {edge.label}
                </text>
              </g>
            );
          })}

          {[...visibleNodes]
            .sort((left, right) => nodeLayerIndex(left.type) - nodeLayerIndex(right.type))
            .map((node) => {
              const style = NODE_STYLE[node.type];
              const isSelected = node.id === selectedNode.id;
              const inNeighborhood = neighborhood.nodeIds.has(node.id);
              const emphasis = isSelected ? 1 : inNeighborhood ? 0.93 : 0.42;
              const haloSize = style.radius + (isSelected ? 16 : 8);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.position.x} ${node.position.y})`}
                  className="graph-node"
                  opacity={emphasis}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <circle r={haloSize} className="graph-node-halo" style={{ opacity: isSelected ? 0.46 : 0.14 }} />
                  <circle r={style.radius + 7} fill={style.fill} opacity={0.12} />
                  <circle r={style.radius} fill={style.fill} stroke={style.stroke} strokeWidth={isSelected ? 2.4 : 1.3} />
                  <text y={style.radius + 20} className="graph-node-label">
                    {node.name}
                  </text>
                  <text y={style.radius + 35} className="graph-node-state">
                    {toPercent(node.state)}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>

      <aside className="graph-inspector" aria-label="Selected node details">
        <p className="graph-inspector-kicker">
          {selectedNode.type} · {selectedNode.id}
        </p>
        <h3>{selectedNode.name}</h3>
        <p className="graph-inspector-state">State {toPercent(selectedNode.state)}</p>
        <div className="graph-metrics">
          <p>Inertia {toPercent(selectedNode.inertia * 100)}</p>
          <p>Sensitivity {toPercent(selectedNode.sensitivity * 100)}</p>
        </div>
        <div className="graph-summary">
          <p>Inbound {summary.inboundCount}</p>
          <p>Outbound {summary.outboundCount}</p>
          <p>Inbound boost {toPercent(summary.inboundBoost)}</p>
          <p>Inbound drag {toPercent(summary.inboundDrag)}</p>
          <p>Outbound boost {toPercent(summary.outboundBoost)}</p>
          <p>Outbound drag {toPercent(summary.outboundDrag)}</p>
        </div>
      </aside>
    </div>
  );
};
