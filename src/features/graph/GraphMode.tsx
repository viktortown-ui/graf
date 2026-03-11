import { useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import type { AppMode } from '../../entities/system/modes';
import type { ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';
import type { AppSettings } from '../../app/state/settingsModel';
import type { GraphReadingLens, WorldGraphHandoff } from '../../app/state/useSceneState';
import { DEMO_GRAPH, type GraphEdge, type GraphEdgeType, type GraphNode } from './model';

type GraphModeProps = {
  settings: AppSettings;
  confidence: ConfidenceSnapshot;
  selectedNodeId: string;
  handoff: WorldGraphHandoff | null;
  onSelectNode: (nodeId: string) => void;
  onModeChange: (mode: AppMode) => void;
  lens: {
    panX: number;
    panY: number;
    zoom: number;
  };
  onLensChange: (lens: { panX: number; panY: number; zoom: number }) => void;
};

type CausalRole = 'primary' | 'secondary' | 'pressure' | 'blocker' | 'leverage' | 'result';

const EDGE_STYLE: Record<GraphEdgeType, { color: string; dash?: string }> = {
  boosts: { color: '#86ffd6' },
  drags: { color: '#ff996f' },
  blocks: { color: '#ff6d90', dash: '7 6' },
  conflicts: { color: '#ffcc8f', dash: '4 4' },
  delayed: { color: '#9ac8ff', dash: '2 7' },
};

const LENS_LABEL: Record<GraphReadingLens, string> = {
  pressure: 'Давление',
  resources: 'Ресурсы',
  goals: 'Цели',
  causes: 'Причины',
};

const NODE_BASE: Record<GraphNode['type'], { fill: string; stroke: string; radius: number }> = {
  domain: { fill: '#74c9ff', stroke: '#cae9ff', radius: 22 },
  factor: { fill: '#9eb5ff', stroke: '#dbe3ff', radius: 14 },
  action: { fill: '#8fffd2', stroke: '#d7ffef', radius: 16 },
  risk: { fill: '#ff8b7c', stroke: '#ffd4cc', radius: 17 },
  goal: { fill: '#ffe29a', stroke: '#fff3ca', radius: 18 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const lensEdgeBoost = (type: GraphEdgeType, lens: GraphReadingLens) => {
  if (lens === 'pressure') return type === 'drags' || type === 'blocks' || type === 'conflicts' ? 1.45 : 0.8;
  if (lens === 'resources') return type === 'boosts' ? 1.35 : type === 'delayed' ? 1.1 : 0.78;
  if (lens === 'goals') return type === 'boosts' || type === 'delayed' ? 1.3 : 0.88;
  return type === 'drags' || type === 'blocks' ? 1.2 : 1;
};

const edgePath = (from: GraphNode, to: GraphNode) => {
  const curve = clamp((to.position.x - from.position.x) * 0.2, -68, 68);
  return `M ${from.position.x} ${from.position.y} C ${from.position.x + curve} ${from.position.y}, ${to.position.x - curve} ${to.position.y}, ${to.position.x} ${to.position.y}`;
};

const focusNodeByDomain: Record<WorldGraphHandoff['activeDomain']['id'], string[]> = {
  work: ['domain-focus', 'domain-stress', 'risk-distraction', 'action-sprint', 'goal-launch', 'factor-routine'],
  finance: ['domain-money', 'domain-stress', 'factor-cashflow', 'action-review', 'goal-launch', 'risk-distraction'],
  body: ['domain-energy', 'risk-burnout', 'factor-sleep', 'goal-health', 'domain-focus', 'domain-stress'],
  goal: ['goal-launch', 'domain-focus', 'action-sprint', 'goal-health', 'domain-stress', 'risk-distraction'],
};

const scoreEdge = (edge: GraphEdge, nodeMap: Map<string, GraphNode>, lens: GraphReadingLens) => {
  const source = nodeMap.get(edge.source);
  const target = nodeMap.get(edge.target);
  if (!source || !target) return 0;
  const impact = edge.weight * edge.confidence * lensEdgeBoost(edge.type, lens);
  const targetPressure = (100 - target.state) / 100;
  return impact * (0.7 + targetPressure * 0.55);
};

export const GraphMode = ({ selectedNodeId, onSelectNode, lens, onLensChange, settings, handoff, confidence, onModeChange }: GraphModeProps) => {
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [manualLens, setManualLens] = useState<GraphReadingLens | null>(null);

  const nodeMap = useMemo(() => new Map(DEMO_GRAPH.nodes.map((node) => [node.id, node])), []);
  const activeLens = manualLens ?? handoff?.selectedLens ?? 'pressure';

  const focusSet = useMemo(() => {
    const domain = handoff?.activeDomain.id ?? 'work';
    const seed = focusNodeByDomain[domain];
    return new Set(seed);
  }, [handoff?.activeDomain.id]);

  const focusNodes = useMemo(() => DEMO_GRAPH.nodes.filter((node) => focusSet.has(node.id)), [focusSet]);
  const focusNodeIds = useMemo(() => new Set(focusNodes.map((node) => node.id)), [focusNodes]);

  const focusEdges = useMemo(
    () => DEMO_GRAPH.edges.filter((edge) => focusNodeIds.has(edge.source) && focusNodeIds.has(edge.target)),
    [focusNodeIds],
  );

  const sortedEdges = useMemo(
    () => focusEdges.map((edge) => ({ edge, score: scoreEdge(edge, nodeMap, activeLens) })).sort((a, b) => b.score - a.score),
    [activeLens, focusEdges, nodeMap],
  );

  const pressureEdge = sortedEdges.find((entry) => entry.edge.type === 'drags' || entry.edge.type === 'blocks' || entry.edge.type === 'conflicts')?.edge;
  const blockerEdge = sortedEdges.find((entry) => entry.edge.type === 'blocks' && entry.edge.id !== pressureEdge?.id)?.edge ?? pressureEdge;
  const leverageEdge = sortedEdges.find((entry) => entry.edge.type === 'boosts' || entry.edge.type === 'delayed')?.edge;

  const primaryChain = useMemo(() => {
    const main = [pressureEdge, blockerEdge, leverageEdge].filter(Boolean) as GraphEdge[];
    const fallback = sortedEdges.slice(0, 3).map((entry) => entry.edge);
    const chain = (main.length >= 2 ? main : fallback).slice(0, 3);
    return Array.from(new Set(chain));
  }, [blockerEdge, leverageEdge, pressureEdge, sortedEdges]);

  const secondaryEdges = sortedEdges
    .map((entry) => entry.edge)
    .filter((edge) => !primaryChain.find((primary) => primary.id === edge.id))
    .slice(0, 3);

  const selectedNode = nodeMap.get(selectedNodeId) ?? nodeMap.get(handoff?.activeDomain.nodeId ?? 'domain-focus') ?? DEMO_GRAPH.nodes[0];

  const roleMap = useMemo(() => {
    const map = new Map<string, CausalRole>();
    if (pressureEdge) map.set(pressureEdge.source, 'pressure');
    if (blockerEdge) map.set(blockerEdge.source, 'blocker');
    if (leverageEdge) map.set(leverageEdge.source, 'leverage');
    if (primaryChain[0]) map.set(primaryChain[0].target, 'primary');
    if (primaryChain[1]) map.set(primaryChain[1].target, 'primary');
    if (secondaryEdges[0]) map.set(secondaryEdges[0].target, 'secondary');
    if (handoff?.activeDomain.nodeId) map.set(handoff.activeDomain.nodeId, 'result');
    return map;
  }, [blockerEdge, handoff?.activeDomain.nodeId, leverageEdge, pressureEdge, primaryChain, secondaryEdges]);

  const confidenceGlobal = handoff?.confidence.global ?? confidence.globalConfidence;
  const confidenceDomain = handoff?.confidence.domain ?? confidence.globalConfidence;
  const lowConfidence = confidenceGlobal < 58 || confidenceDomain < 52;

  const recommendedRoute: AppMode = handoff?.recommendedTransition === 'oracle'
    ? 'oracle'
    : lowConfidence
      ? 'world'
      : leverageEdge
        ? 'oracle'
        : 'world';

  const confidencePrompt = lowConfidence
    ? confidence.missingCriticalFields[0] ?? 'Нужен дополнительный check-in по ключевым полям.'
    : 'Картина причин стабильна, можно перейти к выбору хода.';

  const nodeRadius = (node: GraphNode) => {
    const base = NODE_BASE[node.type].radius;
    const role = roleMap.get(node.id);
    if (role === 'pressure' || role === 'leverage') return base + 8;
    if (role === 'blocker' || role === 'result') return base + 6;
    if (role === 'primary') return base + 4;
    return base;
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    onLensChange({ ...lens, panX: lens.panX + dx, panY: lens.panY + dy });
  };
  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };
  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const zoom = clamp(lens.zoom + (event.deltaY < 0 ? 0.06 : -0.06), 0.64, 1.8);
    onLensChange({ ...lens, zoom });
  };

  return (
    <div className={`graph-mode ${lowConfidence ? 'confidence-low' : ''}`}>
      <header className="graph-summary-bar">
        <div>
          <p className="graph-kicker">Graph 2.0 · causal drilldown</p>
          <h3>{handoff?.activeDomain.label ?? 'Активный домен'} · линза «{LENS_LABEL[activeLens]}»</h3>
          <p>Risk signal: {Math.round(handoff?.derivedMetrics.risk ?? 0)}% · Pressure: {Math.round(handoff?.derivedMetrics.pressure ?? 0)}%</p>
        </div>
        <div className="graph-summary-confidence">
          <p>Confidence {Math.round(confidenceGlobal)}% / domain {Math.round(confidenceDomain)}%</p>
          {lowConfidence ? <p className="graph-warning">Низкая уверенность: {confidencePrompt}</p> : <p className="graph-ok">Причинная картина достаточно устойчива.</p>}
        </div>
      </header>

      <div className="graph-reading-modes">
        {(Object.keys(LENS_LABEL) as GraphReadingLens[]).map((entry) => (
          <button key={entry} type="button" className={entry === activeLens ? 'active' : ''} onClick={() => setManualLens(entry)}>{LENS_LABEL[entry]}</button>
        ))}
      </div>

      <svg className="graph-scene" style={{ opacity: settings.reduceTransparency ? 0.98 : 0.9 + settings.backgroundDensity / 1000 }} viewBox="-560 -340 1120 680" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
        <g transform={`translate(${lens.panX} ${lens.panY}) scale(${lens.zoom})`}>
          {secondaryEdges.map((edge) => {
            const from = nodeMap.get(edge.source);
            const to = nodeMap.get(edge.target);
            if (!from || !to) return null;
            return <path key={edge.id} d={edgePath(from, to)} fill="none" stroke={EDGE_STYLE[edge.type].color} strokeWidth={1.6} opacity={0.35} strokeDasharray={EDGE_STYLE[edge.type].dash} />;
          })}

          {primaryChain.map((edge) => {
            const from = nodeMap.get(edge.source);
            const to = nodeMap.get(edge.target);
            if (!from || !to) return null;
            const typeClass = edge.type === 'boosts' || edge.type === 'delayed' ? 'link-support' : edge.type === 'blocks' ? 'link-blocker' : 'link-pressure';
            return <path key={edge.id} d={edgePath(from, to)} className={`graph-primary-link ${typeClass}`} fill="none" stroke={EDGE_STYLE[edge.type].color} strokeWidth={3.4} strokeDasharray={EDGE_STYLE[edge.type].dash} />;
          })}

          {focusNodes.map((node) => {
            const base = NODE_BASE[node.type];
            const role = roleMap.get(node.id);
            const selected = node.id === selectedNode.id;
            const emphasis = selected ? 1 : role ? 0.95 : 0.6;
            return (
              <g key={node.id} transform={`translate(${node.position.x} ${node.position.y})`} className="graph-node" opacity={emphasis} onClick={() => onSelectNode(node.id)}>
                <circle r={nodeRadius(node) + 9} className="graph-node-halo" style={{ opacity: selected ? 0.35 : 0.12 }} />
                <circle r={nodeRadius(node)} fill={base.fill} stroke={base.stroke} strokeWidth={selected ? 3 : 1.4} />
                {role ? <text y={-nodeRadius(node) - 8} className="graph-node-role">{role}</text> : null}
                <text y={nodeRadius(node) + 18} className="graph-node-label">{node.name}</text>
              </g>
            );
          })}
        </g>
      </svg>

      <aside className="graph-tactical-panel">
        <h4>Тактическая интерпретация</h4>
        <p><strong>Главный источник:</strong> {pressureEdge ? `${nodeMap.get(pressureEdge.source)?.name} → ${nodeMap.get(pressureEdge.target)?.name}` : 'н/д'}</p>
        <p><strong>Ближайший блокер:</strong> {blockerEdge ? `${nodeMap.get(blockerEdge.source)?.name} → ${nodeMap.get(blockerEdge.target)?.name}` : 'н/д'}</p>
        <p><strong>Лучший рычаг:</strong> {leverageEdge ? `${nodeMap.get(leverageEdge.source)?.name} → ${nodeMap.get(leverageEdge.target)?.name}` : 'н/д'}</p>
        <p><strong>Focus/result:</strong> {handoff?.activeDomain.label ?? 'домен'} · readiness {Math.round(handoff?.derivedMetrics.readiness ?? 0)}%</p>
        <p><strong>Confidence:</strong> {Math.round(confidenceGlobal)}% · {lowConfidence ? `не хватает: ${confidencePrompt}` : 'достаточно для тактического хода'}</p>
      </aside>

      <div className="graph-cta-row">
        <button type="button" className={recommendedRoute === 'world' ? '' : 'ghost'} onClick={() => onModeChange('world')}>Вернуться в Мир</button>
        <button type="button" className={recommendedRoute === 'oracle' ? '' : 'ghost'} onClick={() => onModeChange('oracle')}>Перейти в Oracle</button>
        <button type="button" className="ghost" onClick={() => onModeChange('start')}>Подкрутить запуск в Start</button>
      </div>
    </div>
  );
};
