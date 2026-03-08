import { useMemo, useState } from 'react';
import { DEMO_GRAPH } from '../graph/model';
import { propagateGraphScenario } from '../graph/engine';

type Horizon = 3 | 7 | 14;
type ScenarioKind = 'base' | 'inaction' | 'intervention';

type OracleModeProps = {
  selectedNodeId: string;
};

const SCENARIO_LABEL: Record<ScenarioKind, string> = {
  base: 'Базовый',
  inaction: 'Бездействие',
  intervention: 'Вмешательство',
};

const HORIZONS: Horizon[] = [3, 7, 14];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const OracleMode = ({ selectedNodeId }: OracleModeProps) => {
  const [horizon, setHorizon] = useState<Horizon>(7);
  const [scenario, setScenario] = useState<ScenarioKind>('intervention');
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
      .sort((a, b) => (b.intervention - b.inaction) - (a.intervention - a.inaction))[0]?.node;

    const targetGoal = deltas
      .filter(({ node }) => node.type === 'goal')
      .sort((a, b) => (b.intervention - a.intervention))[0]?.node;

    const selectedDelta = clamp(getNodeState(intervention, selectedNode.id) - getNodeState(inaction, selectedNode.id), -100, 100);

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
    };
  }, [actionNode, horizon, scenario, selectedNode.id]);

  const stateOfAnchor = scenarioData.chosen.find((node) => node.id === selectedNode.id)?.state ?? selectedNode.state;

  return (
    <div className="oracle-mode" aria-label="Режим оракула и прогнозов">
      <div className="oracle-header">
        <p className="scene-mode-kicker">Прогнозный слой</p>
        <h2 className="scene-mode-title">Детерминированный прогноз вокруг якоря «{selectedNode.name}».</h2>
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
          {HORIZONS.map((step) => (
            <button key={step} className={horizon === step ? 'active' : ''} type="button" onClick={() => setHorizon(step)}>
              {step} шагов
            </button>
          ))}
        </div>

        <label className="oracle-select-wrap">
          <span>Действие для вмешательства</span>
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
        <p className="oracle-anchor-state">Якорь сейчас: {Math.round(stateOfAnchor)}%</p>
        <h3>Главный риск: {scenarioData.riskNode?.name}</h3>
        <p>
          Лучший рычаг: <strong>{scenarioData.bestLever?.name ?? 'Не определён'}</strong>
        </p>
        <p>
          Следующий шаг: <strong>{scenarioData.targetGoal?.name ?? 'Стабилизировать ядро'}</strong>
        </p>
        <p>
          Почему: выбранное вмешательство меняет состояние якоря на <strong>{scenarioData.selectedDelta.toFixed(1)} п.п.</strong> к горизонту {horizon}{' '}
          шагов относительно сценария без действий.
        </p>
      </div>

      <div className="oracle-arcs" aria-hidden="true">
        {scenarioData.trendLine.map((point, index) => (
          <div
            key={index}
            className="oracle-arc"
            style={{
              left: `${18 + index * 28}%`,
              height: `${28 + point * 0.48}px`,
              opacity: 0.45 + index * 0.18,
            }}
          />
        ))}
      </div>
    </div>
  );
};
