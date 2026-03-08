import { useMemo, useState } from 'react';
import { DEMO_GRAPH, type GraphEdge, type GraphNode } from '../graph/model';
import { HORIZONS, PRESSURE_OPTIONS, TARGET_EDGE_HINT, type LaunchContext } from '../../app/state/launchContext';
import type { AppSettings } from '../../app/state/settingsModel';
import { propagateGraphScenario } from '../graph/engine';

type Horizon = 3 | 7 | 14;
type ScenarioKind = 'base' | 'inaction' | 'intervention';

type OracleModeProps = {
  settings: AppSettings;
  launchContext: LaunchContext;
  selectedNodeId: string;
  sharedLens: {
    panX: number;
    panY: number;
    zoom: number;
  };
};

const SCENARIO_LABEL: Record<ScenarioKind, string> = {
  base: 'Базовый',
  inaction: 'Бездействие',
  intervention: 'Вмешательство',
};

const FORECAST_STEPS: Horizon[] = [3, 7, 14];

const SCENARIO_TONE: Record<ScenarioKind, string> = {
  base: '#9fc1ff',
  inaction: '#ff9688',
  intervention: '#87ffd0',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const edgeStrength = (edge: GraphEdge) => edge.weight * edge.confidence;
const edgeSign = (edge: GraphEdge) => (edge.type === 'boosts' || edge.type === 'delayed' ? 1 : -1);

const toProjectedPosition = (node: GraphNode, anchor: GraphNode, lens: OracleModeProps['sharedLens'], horizon: Horizon) => {
  const horizonScale = horizon === 3 ? 0.18 : horizon === 7 ? 0.22 : 0.27;
  return {
    x: 50 + lens.panX * 0.022 + (node.position.x - anchor.position.x) * horizonScale * (1 / lens.zoom),
    y: 50 + lens.panY * 0.026 + (node.position.y - anchor.position.y) * horizonScale * (1 / lens.zoom),
  };
};

const findPath = (fromId: string, toId: string) => {
  const queue: string[][] = [[fromId]];
  const visited = new Set([fromId]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    const last = current[current.length - 1];
    if (last === toId) {
      return current;
    }

    DEMO_GRAPH.edges
      .filter((edge) => edge.source === last)
      .forEach((edge) => {
        if (visited.has(edge.target)) {
          return;
        }
        visited.add(edge.target);
        queue.push([...current, edge.target]);
      });
  }

  return null;
};

export const OracleMode = ({ selectedNodeId, sharedLens, launchContext, settings }: OracleModeProps) => {
  const launchHorizon = (HORIZONS.find((entry) => entry.id === launchContext.horizonId)?.oracleHorizon ?? 7) as Horizon;
  const [horizonOverride, setHorizonOverride] = useState<Horizon | null>(null);
  const horizon = horizonOverride ?? launchHorizon;
  const [scenario, setScenario] = useState<ScenarioKind>('intervention');
  const pressure = PRESSURE_OPTIONS.find((option) => option.id === launchContext.pressureId) ?? PRESSURE_OPTIONS[0];
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const actionNodes = useMemo(() => DEMO_GRAPH.nodes.filter((node) => node.type === 'action'), []);
  const [actionId, setActionId] = useState(actionNodes[0]?.id ?? '');

  const nodeMap = useMemo(() => new Map(DEMO_GRAPH.nodes.map((node) => [node.id, node])), []);
  const selectedNode = nodeMap.get(selectedNodeId) ?? DEMO_GRAPH.nodes[0];
  const actionNode = nodeMap.get(actionId) ?? actionNodes[0];

  const scenarioData = useMemo(() => {
    const base = propagateGraphScenario(DEMO_GRAPH, horizon);
    const inaction = propagateGraphScenario(DEMO_GRAPH, horizon, [{ nodeId: selectedNode.id, amount: -8 }]);
    const intervention = actionNode
      ? propagateGraphScenario(DEMO_GRAPH, horizon, [
          { nodeId: selectedNode.id, amount: 4 },
          { nodeId: actionNode.id, amount: 14 },
        ])
      : base;

    const getNodeState = (nodes: typeof base, nodeId: string) => nodes.find((node) => node.id === nodeId)?.state ?? 50;

    const chosen = scenario === 'base' ? base : scenario === 'inaction' ? inaction : intervention;
    const risks = chosen.filter((node) => node.type === 'risk').sort((a, b) => b.state - a.state);
    const riskNode = risks[0] ?? chosen[0];

    const deltas = DEMO_GRAPH.nodes.map((node) => ({
      node,
      base: getNodeState(base, node.id),
      inaction: getNodeState(inaction, node.id),
      intervention: getNodeState(intervention, node.id),
    }));

    const bestLever = deltas
      .filter(({ node }) => node.type === 'action')
      .sort((a, b) => b.intervention - b.inaction - (a.intervention - a.inaction))[0]?.node;

    const targetGoal = deltas
      .filter(({ node }) => node.type === 'goal')
      .sort((a, b) => b.intervention - a.intervention)[0]?.node;

    const selectedDelta = clamp(getNodeState(intervention, selectedNode.id) - getNodeState(inaction, selectedNode.id), -100, 100);

    const neighborhoodIds = new Set<string>([selectedNode.id]);
    for (let depth = 0; depth < 2; depth += 1) {
      DEMO_GRAPH.edges.forEach((edge) => {
        if (neighborhoodIds.has(edge.source) || neighborhoodIds.has(edge.target)) {
          neighborhoodIds.add(edge.source);
          neighborhoodIds.add(edge.target);
        }
      });
    }

    const preferredTarget = TARGET_EDGE_HINT[launchContext.targetFocus]
      .map((edgeId) => DEMO_GRAPH.edges.find((edge) => edge.id === edgeId)?.target)
      .find((id): id is string => Boolean(id));
    const recommendationPath = findPath(bestLever?.id ?? selectedNode.id, preferredTarget ?? targetGoal?.id ?? selectedNode.id) ?? [];
    const recommendationEdgeIds = new Set<string>();
    for (let i = 0; i < recommendationPath.length - 1; i += 1) {
      const source = recommendationPath[i];
      const target = recommendationPath[i + 1];
      const edge = DEMO_GRAPH.edges.find((entry) => entry.source === source && entry.target === target);
      if (edge) {
        recommendationEdgeIds.add(edge.id);
      }
    }

    const projectionNodes = DEMO_GRAPH.nodes
      .filter((node) => neighborhoodIds.has(node.id))
      .map((node) => ({
        node,
        x: toProjectedPosition(node, selectedNode, sharedLens, horizon).x,
        y: toProjectedPosition(node, selectedNode, sharedLens, horizon).y,
        value: getNodeState(chosen, node.id),
        baseValue: getNodeState(base, node.id),
        scenarioDelta: getNodeState(chosen, node.id) - getNodeState(base, node.id),
      }))
      .sort((a, b) => Math.abs(b.scenarioDelta) - Math.abs(a.scenarioDelta));

    const projectionEdges = DEMO_GRAPH.edges
      .filter((edge) => neighborhoodIds.has(edge.source) && neighborhoodIds.has(edge.target))
      .map((edge) => {
        const source = projectionNodes.find((node) => node.node.id === edge.source);
        const target = projectionNodes.find((node) => node.node.id === edge.target);
        if (!source || !target) {
          return null;
        }

        const targetDelta = getNodeState(chosen, edge.target) - getNodeState(base, edge.target);
        return {
          edge,
          source,
          target,
          pressure: edgeSign(edge) * targetDelta,
          relief: getNodeState(inaction, edge.target) - getNodeState(intervention, edge.target),
          isRecommended: recommendationEdgeIds.has(edge.id),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    const mainDriverEdge = DEMO_GRAPH.edges
      .filter((edge) => edge.target === riskNode.id)
      .map((edge) => ({
        edge,
        sourceState: getNodeState(chosen, edge.source),
        score: edgeStrength(edge) * edgeSign(edge) * ((getNodeState(chosen, edge.source) - 50) / 50),
      }))
      .sort((a, b) => b.score - a.score)[0]?.edge;

    const reliefEdge = DEMO_GRAPH.edges
      .filter((edge) => nodeMap.get(edge.source)?.type === 'action')
      .map((edge) => ({ edge, relief: getNodeState(inaction, edge.target) - getNodeState(intervention, edge.target) }))
      .sort((a, b) => b.relief - a.relief)[0]?.edge;

    const worseningBranches = DEMO_GRAPH.edges
      .map((edge) => ({
        edge,
        impact: (getNodeState(chosen, edge.target) - getNodeState(base, edge.target)) * edgeStrength(edge) * (edgeSign(edge) < 0 ? 1 : 0.35),
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 2);

    const reliefBranches = DEMO_GRAPH.edges
      .map((edge) => ({
        edge,
        impact: (getNodeState(inaction, edge.target) - getNodeState(intervention, edge.target)) * edgeStrength(edge),
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 2);

    const goalBranches = DEMO_GRAPH.edges
      .map((edge) => ({
        edge,
        impact: (getNodeState(intervention, edge.target) - getNodeState(base, edge.target)) * edgeStrength(edge),
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 2);

    const actionPathNodes = recommendationPath.map((nodeId) => nodeMap.get(nodeId)?.name).filter((name): name is string => Boolean(name));

    return {
      base,
      inaction,
      intervention,
      chosen,
      riskNode,
      bestLever,
      targetGoal,
      selectedDelta,
      trendLine: [
        getNodeState(base, selectedNode.id),
        getNodeState(inaction, selectedNode.id),
        getNodeState(intervention, selectedNode.id),
      ],
      projectionNodes,
      projectionEdges,
      mainDriverEdge,
      reliefEdge,
      actionPathNodes,
      worseningBranches,
      reliefBranches,
      goalBranches,
      recommendationEdgeIds,
    };
  }, [actionNode, horizon, launchContext.targetFocus, nodeMap, scenario, selectedNode, sharedLens]);

  const stateOfAnchor = scenarioData.chosen.find((node) => node.id === selectedNode.id)?.state ?? selectedNode.state;

  return (
    <div className="oracle-mode" aria-label="Режим оракула и прогнозов">
      <div className="oracle-header">
        <p className="scene-mode-kicker">Oracle · Прогноз</p>
        <p className="oracle-header-copy">Якорь «{selectedNode.name}» · линия на {horizon} шагов · давление: {pressure.label.toLowerCase()}</p>
      </div>

      <div className="oracle-projection-scene" aria-hidden="true" style={{ opacity: settings.reduceTransparency ? 1 : 0.78 + settings.glowBrightness / 500 }}>
        <svg viewBox="0 0 100 100" className="oracle-projection-svg" style={{ transitionDuration: settings.reduceMotion ? '0ms' : undefined }}>
          <defs>
            <radialGradient id="oracleAnchorGlow" cx="50%" cy="50%" r="52%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="100%" stopColor={SCENARIO_TONE[scenario]} stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r={horizon === 3 ? 18 : horizon === 7 ? 24 : 30}
            className={`oracle-anchor-ripple ${scenario}`}
            style={{ opacity: scenario === 'base' ? 0.22 : 0.4 }}
          />

          {scenarioData.projectionEdges.map(({ edge, source, target, pressure, relief, isRecommended }) => {
            const midpointX = (source.x + target.x) / 2;
            const curveUp = clamp((target.x - source.x) * 0.12, -8, 8);
            const tone = pressure > 0.8 ? '#ff8f86' : relief > 0.8 ? '#7effd2' : SCENARIO_TONE[scenario];
            const edgeHot = hoveredNodeId ? edge.source === hoveredNodeId || edge.target === hoveredNodeId : false;

            return (
              <path
                key={edge.id}
                d={`M ${source.x} ${source.y} Q ${midpointX + curveUp} ${(source.y + target.y) / 2 - 4} ${target.x} ${target.y}`}
                className={`oracle-future-link ${edgeHot ? 'is-hot' : ''} ${isRecommended ? 'is-recommended' : ''}`}
                style={{
                  stroke: tone,
                  strokeWidth: 0.35 + Math.min(Math.abs(pressure) * 0.22, 0.9) + (isRecommended ? 0.45 : 0),
                  opacity: edgeHot ? 0.92 : scenario === 'base' ? 0.28 : 0.44 + Math.min(Math.abs(relief) * 0.04, 0.33),
                }}
              />
            );
          })}

          {scenarioData.projectionNodes.map(({ node, x, y, value, scenarioDelta }) => {
            const isAnchor = node.id === selectedNode.id;
            const isAction = node.id === actionNode?.id;
            const isHovered = node.id === hoveredNodeId;
            const radius = (isAnchor ? 4.2 : 2.1) + clamp(Math.abs(scenarioDelta) * 0.03, 0.2, 1.2);
            const ring = scenarioDelta < -0.8 ? '#ff9a90' : scenarioDelta > 0.8 ? '#8dffd6' : '#c8d8ff';

            return (
              <g key={node.id} transform={`translate(${x} ${y})`} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)}>
                {isAnchor && <circle r={11.4} fill="url(#oracleAnchorGlow)" opacity={0.58} />}
                <circle r={radius + 1.25} fill={ring} opacity={isHovered ? 0.34 : 0.22} />
                <circle r={radius} fill="#0c1122" stroke={ring} strokeWidth={isAnchor || isAction ? 0.9 : 0.4} className={isAction ? 'oracle-action-node' : ''} />
                <text y={radius + 3.2} className="oracle-node-label">
                  {node.name}
                </text>
                <text y={radius + 5.6} className="oracle-node-state">
                  {Math.round(value)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="oracle-controls" role="group" aria-label="Управление сценарием">
        <div className="oracle-segment">
          <span>Сценарий</span>
          {(['base', 'inaction', 'intervention'] as const).map((kind) => (
            <button key={kind} className={scenario === kind ? 'active' : ''} type="button" onClick={() => setScenario(kind)}>
              {SCENARIO_LABEL[kind]}
            </button>
          ))}
        </div>

        <div className="oracle-segment">
          <span>Горизонт</span>
          {FORECAST_STEPS.map((step) => (
            <button key={step} className={horizon === step ? 'active' : ''} type="button" onClick={() => setHorizonOverride(step)}>
              {step} шагов
            </button>
          ))}
        </div>

        <label className="oracle-select-wrap">
          <span>Вмешательство</span>
          <select value={actionId} onChange={(event) => setActionId(event.target.value)}>
            {actionNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="oracle-core-readout">
        <p className="oracle-anchor-state">Якорь {Math.round(stateOfAnchor)}%</p>
        <h3>{scenarioData.riskNode?.name}</h3>
        <p>
          Рычаг: <strong>{scenarioData.bestLever?.name ?? 'Не определён'}</strong>
        </p>
        <p>
          Следующий узел: <strong>{scenarioData.targetGoal?.name ?? 'Стабилизировать ядро'}</strong>
        </p>
        <p className="oracle-recommendation">
          Сейчас: <strong>{scenarioData.bestLever?.name ?? 'Сохранить курс'}</strong> ·{' '}
          <strong>{scenarioData.selectedDelta.toFixed(1)} п.п.</strong> к {horizon} шагам.
        </p>
      </div>

      <aside className="oracle-cause-chain" aria-label="Цепочка причин">
        <p className="oracle-cause-kicker">Причинные ветки</p>
        <div className="oracle-cause-group">
          <p>Что ухудшает</p>
          {scenarioData.worseningBranches.map(({ edge }) => (
            <strong key={edge.id}>{`${nodeMap.get(edge.source)?.name} → ${nodeMap.get(edge.target)?.name}`}</strong>
          ))}
        </div>
        <div className="oracle-cause-group">
          <p>Что ослабляет риск</p>
          {scenarioData.reliefBranches.map(({ edge }) => (
            <strong key={edge.id}>{`${nodeMap.get(edge.source)?.name} → ${nodeMap.get(edge.target)?.name}`}</strong>
          ))}
        </div>
        <div className="oracle-cause-group">
          <p>Что усиливает цель</p>
          {scenarioData.goalBranches.map(({ edge }) => (
            <strong key={edge.id}>{`${nodeMap.get(edge.source)?.name} → ${nodeMap.get(edge.target)?.name}`}</strong>
          ))}
        </div>
      </aside>

      <div className="oracle-arcs" aria-hidden="true">
        {scenarioData.trendLine.map((point, index) => (
          <div
            key={index}
            className="oracle-arc"
            style={{
              left: `${14 + index * 18}%`,
              height: `${20 + point * 0.4}px`,
              opacity: 0.26 + index * 0.2,
              borderColor: `${SCENARIO_TONE[index === 0 ? 'base' : index === 1 ? 'inaction' : 'intervention']}70`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
