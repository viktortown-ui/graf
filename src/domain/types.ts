export type Mode = 'start' | 'world' | 'graph' | 'oracle';

export type DomainNode = {
  id: string;
  label: string;
  angle: number;
  distance: number;
  weight: number;
  state: number;
  velocity: number;
};

export type InfluenceEdge = {
  id: string;
  from: string;
  to: string;
  influence: number;
};

export type GoalVector = {
  nodeId: string;
  targetState: number;
  gravity: number;
};

export type GraphModel = {
  tick: number;
  nodes: DomainNode[];
  edges: InfluenceEdge[];
  goals: GoalVector[];
  history: Array<{ tick: number; nodeState: Record<string, number> }>;
};

export type NextAction = {
  nodeId: string;
  title: string;
  reason: string;
  expectedDelta: number;
};

export type ForecastResult = {
  horizon: number;
  snapshots: Array<{ step: number; nodeState: Record<string, number> }>;
};
