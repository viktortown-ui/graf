import type { GraphEdge, GraphNodeType, InfluenceGraph } from './model';

type EdgeSign = -1 | 1;

const EDGE_SIGN: Record<GraphEdge['type'], EdgeSign> = {
  boosts: 1,
  delayed: 1,
  drags: -1,
  blocks: -1,
  conflicts: -1,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export type NodeInfluenceSummary = {
  inboundCount: number;
  outboundCount: number;
  inboundBoost: number;
  inboundDrag: number;
  outboundBoost: number;
  outboundDrag: number;
};

const influenceAmount = (edge: GraphEdge) => edge.weight * edge.confidence * 34 * EDGE_SIGN[edge.type];

export const summarizeNodeInfluence = (graph: InfluenceGraph, nodeId: string): NodeInfluenceSummary => {
  const inbound = graph.edges.filter((edge) => edge.target === nodeId);
  const outbound = graph.edges.filter((edge) => edge.source === nodeId);

  const sumBoost = (edges: GraphEdge[]) =>
    edges.filter((edge) => EDGE_SIGN[edge.type] > 0).reduce((total, edge) => total + Math.abs(influenceAmount(edge)), 0);
  const sumDrag = (edges: GraphEdge[]) =>
    edges.filter((edge) => EDGE_SIGN[edge.type] < 0).reduce((total, edge) => total + Math.abs(influenceAmount(edge)), 0);

  return {
    inboundCount: inbound.length,
    outboundCount: outbound.length,
    inboundBoost: sumBoost(inbound),
    inboundDrag: sumDrag(inbound),
    outboundBoost: sumBoost(outbound),
    outboundDrag: sumDrag(outbound),
  };
};

export const propagateGraphState = (graph: InfluenceGraph, iterations = 1) => {
  const stateMap = new Map(graph.nodes.map((node) => [node.id, node.state]));

  for (let i = 0; i < iterations; i += 1) {
    const nextMap = new Map(stateMap);

    graph.nodes.forEach((node) => {
      const inbound = graph.edges.filter((edge) => edge.target === node.id);
      const incomingSignal = inbound.reduce((total, edge) => {
        const sourceState = stateMap.get(edge.source) ?? 50;
        const normalized = (sourceState - 50) / 50;
        const lagPenalty = edge.lag ? 1 / (1 + edge.lag * 0.24) : 1;
        return total + normalized * influenceAmount(edge) * lagPenalty;
      }, 0);

      const inertiaHold = node.state * node.inertia;
      const sensitivityMix = incomingSignal * node.sensitivity;
      const baseline = 50 * (1 - node.inertia);
      const recomputed = clamp(inertiaHold + baseline + sensitivityMix, 0, 100);

      nextMap.set(node.id, recomputed);
    });

    stateMap.clear();
    nextMap.forEach((value, key) => stateMap.set(key, value));
  }

  return graph.nodes.map((node) => ({ ...node, state: Number((stateMap.get(node.id) ?? node.state).toFixed(1)) }));
};

export type PropagationBoost = {
  nodeId: string;
  amount: number;
};

export const propagateGraphScenario = (graph: InfluenceGraph, iterations: number, boosts: PropagationBoost[] = []) => {
  const boostMap = new Map(boosts.map((entry) => [entry.nodeId, entry.amount]));
  const stateMap = new Map(graph.nodes.map((node) => [node.id, node.state]));

  for (let i = 0; i < iterations; i += 1) {
    const nextMap = new Map(stateMap);

    graph.nodes.forEach((node) => {
      const inbound = graph.edges.filter((edge) => edge.target === node.id);
      const incomingSignal = inbound.reduce((total, edge) => {
        const sourceState = stateMap.get(edge.source) ?? 50;
        const normalized = (sourceState - 50) / 50;
        const lagPenalty = edge.lag ? 1 / (1 + edge.lag * 0.24) : 1;
        return total + normalized * influenceAmount(edge) * lagPenalty;
      }, 0);

      const inertiaHold = node.state * node.inertia;
      const sensitivityMix = incomingSignal * node.sensitivity;
      const baseline = 50 * (1 - node.inertia);
      const interventionPush = (boostMap.get(node.id) ?? 0) * (1 - i / (iterations + 1));
      const recomputed = clamp(inertiaHold + baseline + sensitivityMix + interventionPush, 0, 100);

      nextMap.set(node.id, recomputed);
    });

    stateMap.clear();
    nextMap.forEach((value, key) => stateMap.set(key, value));
  }

  return graph.nodes.map((node) => ({ ...node, state: Number((stateMap.get(node.id) ?? node.state).toFixed(1)) }));
};

export const neighborsOf = (graph: InfluenceGraph, nodeId: string) => {
  const inbound = graph.edges.filter((edge) => edge.target === nodeId);
  const outbound = graph.edges.filter((edge) => edge.source === nodeId);

  return {
    nodeIds: new Set([nodeId, ...inbound.map((edge) => edge.source), ...outbound.map((edge) => edge.target)]),
    edgeIds: new Set([...inbound.map((edge) => edge.id), ...outbound.map((edge) => edge.id)]),
  };
};

const TYPE_ORDER: GraphNodeType[] = ['domain', 'factor', 'action', 'risk', 'goal'];

export const nodeLayerIndex = (type: GraphNodeType) => TYPE_ORDER.indexOf(type);
