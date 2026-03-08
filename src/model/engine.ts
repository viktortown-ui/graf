import type { ForecastResult, GraphModel, NextAction } from '../domain/types';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const toMap = (model: GraphModel) => Object.fromEntries(model.nodes.map((node) => [node.id, node.state]));

export const tickModel = (model: GraphModel): GraphModel => {
  const nodeMap = new Map(model.nodes.map((node) => [node.id, node]));

  const nextNodes = model.nodes.map((node) => {
    const incoming = model.edges.filter((edge) => edge.to === node.id);
    const influenceForce = incoming.reduce((acc, edge) => {
      const source = nodeMap.get(edge.from);
      if (!source) {
        return acc;
      }
      return acc + (source.state - node.state) * edge.influence;
    }, 0);

    const goal = model.goals.find((goalItem) => goalItem.nodeId === node.id);
    const goalForce = goal ? (goal.targetState - node.state) * goal.gravity : 0;

    const velocity = clamp(node.velocity * 0.68 + influenceForce * 0.12 + goalForce * 0.15, -0.08, 0.08);
    const state = clamp(node.state + velocity * 0.5);

    return {
      ...node,
      velocity,
      state,
    };
  });

  const historyPoint = {
    tick: model.tick,
    nodeState: toMap(model),
  };

  return {
    ...model,
    tick: model.tick + 1,
    nodes: nextNodes,
    history: [...model.history.slice(-29), historyPoint],
  };
};

export const simulateWhatIf = (model: GraphModel, horizon = 12): ForecastResult => {
  let simulationModel = structuredClone(model);
  const snapshots: ForecastResult['snapshots'] = [];

  for (let step = 1; step <= horizon; step += 1) {
    simulationModel = tickModel(simulationModel);
    snapshots.push({
      step,
      nodeState: toMap(simulationModel),
    });
  }

  return { horizon, snapshots };
};

export const deriveNextAction = (model: GraphModel): NextAction => {
  const bestCandidate = model.nodes
    .map((node) => {
      const goal = model.goals.find((goalItem) => goalItem.nodeId === node.id);
      const target = goal?.targetState ?? 0.65;
      const delta = target - node.state;

      return {
        node,
        delta,
      };
    })
    .sort((a, b) => b.delta - a.delta)[0];

  const expectedDelta = Number((bestCandidate.delta * 0.35).toFixed(3));

  return {
    nodeId: bestCandidate.node.id,
    title: `Stabilize ${bestCandidate.node.label}`,
    reason: `${bestCandidate.node.label} is below its goal gravity line and has the biggest contribution gap.`,
    expectedDelta,
  };
};
