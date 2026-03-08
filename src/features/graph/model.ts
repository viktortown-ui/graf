export type GraphNodeType = 'domain' | 'factor' | 'action' | 'risk' | 'goal';

export type GraphEdgeType = 'boosts' | 'drags' | 'blocks' | 'conflicts' | 'delayed';

export type GraphNode = {
  id: string;
  type: GraphNodeType;
  name: string;
  state: number;
  inertia: number;
  sensitivity: number;
  tags: string[];
  position: { x: number; y: number };
  parentDomainId?: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  label: string;
  weight: number;
  confidence: number;
  lag?: number;
};

export type InfluenceGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export const DEMO_GRAPH: InfluenceGraph = {
  nodes: [
    {
      id: 'domain-energy',
      type: 'domain',
      name: 'Energy Domain',
      state: 71,
      inertia: 0.58,
      sensitivity: 0.62,
      tags: ['vitality', 'core'],
      position: { x: -320, y: -60 },
    },
    {
      id: 'domain-focus',
      type: 'domain',
      name: 'Focus Domain',
      state: 63,
      inertia: 0.55,
      sensitivity: 0.72,
      tags: ['cognitive', 'execution'],
      position: { x: -30, y: -148 },
    },
    {
      id: 'domain-money',
      type: 'domain',
      name: 'Money Domain',
      state: 66,
      inertia: 0.7,
      sensitivity: 0.44,
      tags: ['stability', 'resource'],
      position: { x: 280, y: -74 },
    },
    {
      id: 'domain-stress',
      type: 'domain',
      name: 'Stress Domain',
      state: 47,
      inertia: 0.43,
      sensitivity: 0.84,
      tags: ['load', 'volatility'],
      position: { x: 48, y: 172 },
    },
    {
      id: 'factor-sleep',
      type: 'factor',
      name: 'Sleep Quality',
      state: 59,
      inertia: 0.64,
      sensitivity: 0.57,
      tags: ['recovery'],
      parentDomainId: 'domain-energy',
      position: { x: -424, y: 94 },
    },
    {
      id: 'factor-routine',
      type: 'factor',
      name: 'Morning Routine',
      state: 73,
      inertia: 0.75,
      sensitivity: 0.46,
      tags: ['consistency'],
      parentDomainId: 'domain-focus',
      position: { x: -170, y: -258 },
    },
    {
      id: 'factor-cashflow',
      type: 'factor',
      name: 'Cash Buffer',
      state: 69,
      inertia: 0.82,
      sensitivity: 0.31,
      tags: ['resilience'],
      parentDomainId: 'domain-money',
      position: { x: 392, y: 84 },
    },
    {
      id: 'action-sprint',
      type: 'action',
      name: 'Deep Work Sprint',
      state: 62,
      inertia: 0.4,
      sensitivity: 0.8,
      tags: ['execution', 'high-impact'],
      position: { x: -84, y: -2 },
    },
    {
      id: 'action-review',
      type: 'action',
      name: 'Weekly Review',
      state: 76,
      inertia: 0.88,
      sensitivity: 0.33,
      tags: ['planning'],
      position: { x: 176, y: -238 },
    },
    {
      id: 'risk-burnout',
      type: 'risk',
      name: 'Burnout Risk',
      state: 41,
      inertia: 0.29,
      sensitivity: 0.92,
      tags: ['health', 'critical'],
      position: { x: -246, y: 214 },
    },
    {
      id: 'risk-distraction',
      type: 'risk',
      name: 'Distraction Drift',
      state: 38,
      inertia: 0.37,
      sensitivity: 0.88,
      tags: ['attention'],
      position: { x: 152, y: 54 },
    },
    {
      id: 'goal-launch',
      type: 'goal',
      name: 'Launch Milestone',
      state: 58,
      inertia: 0.67,
      sensitivity: 0.53,
      tags: ['north-star'],
      position: { x: 354, y: -234 },
    },
    {
      id: 'goal-health',
      type: 'goal',
      name: 'Sustainable Pace',
      state: 64,
      inertia: 0.74,
      sensitivity: 0.49,
      tags: ['wellbeing'],
      position: { x: -4, y: 286 },
    },
  ],
  edges: [
    {
      id: 'e-sleep-energy',
      source: 'factor-sleep',
      target: 'domain-energy',
      type: 'boosts',
      label: 'Restorative lift',
      weight: 0.72,
      confidence: 0.86,
    },
    {
      id: 'e-routine-focus',
      source: 'factor-routine',
      target: 'domain-focus',
      type: 'boosts',
      label: 'Priming window',
      weight: 0.65,
      confidence: 0.81,
    },
    {
      id: 'e-cash-money',
      source: 'factor-cashflow',
      target: 'domain-money',
      type: 'boosts',
      label: 'Buffer confidence',
      weight: 0.56,
      confidence: 0.88,
    },
    {
      id: 'e-energy-focus',
      source: 'domain-energy',
      target: 'domain-focus',
      type: 'boosts',
      label: 'Cognitive fuel',
      weight: 0.51,
      confidence: 0.74,
    },
    {
      id: 'e-focus-launch',
      source: 'domain-focus',
      target: 'goal-launch',
      type: 'boosts',
      label: 'Execution throughput',
      weight: 0.69,
      confidence: 0.79,
    },
    {
      id: 'e-stress-focus',
      source: 'domain-stress',
      target: 'domain-focus',
      type: 'drags',
      label: 'Cognitive fog',
      weight: 0.63,
      confidence: 0.91,
    },
    {
      id: 'e-distraction-focus',
      source: 'risk-distraction',
      target: 'domain-focus',
      type: 'blocks',
      label: 'Context fracture',
      weight: 0.58,
      confidence: 0.76,
    },
    {
      id: 'e-burnout-energy',
      source: 'risk-burnout',
      target: 'domain-energy',
      type: 'drags',
      label: 'Recovery debt',
      weight: 0.67,
      confidence: 0.85,
    },
    {
      id: 'e-review-money',
      source: 'action-review',
      target: 'domain-money',
      type: 'boosts',
      label: 'Allocation clarity',
      weight: 0.43,
      confidence: 0.71,
    },
    {
      id: 'e-review-risk',
      source: 'action-review',
      target: 'risk-burnout',
      type: 'drags',
      label: 'Early detection',
      weight: 0.31,
      confidence: 0.67,
      lag: 2,
    },
    {
      id: 'e-sprint-stress',
      source: 'action-sprint',
      target: 'domain-stress',
      type: 'conflicts',
      label: 'Intensity tax',
      weight: 0.44,
      confidence: 0.63,
    },
    {
      id: 'e-sprint-launch',
      source: 'action-sprint',
      target: 'goal-launch',
      type: 'delayed',
      label: 'Compounding output',
      weight: 0.61,
      confidence: 0.7,
      lag: 3,
    },
    {
      id: 'e-money-stress',
      source: 'domain-money',
      target: 'domain-stress',
      type: 'drags',
      label: 'Uncertainty pressure',
      weight: 0.39,
      confidence: 0.66,
    },
    {
      id: 'e-health-burnout',
      source: 'goal-health',
      target: 'risk-burnout',
      type: 'blocks',
      label: 'Recovery protocol',
      weight: 0.47,
      confidence: 0.78,
    },
    {
      id: 'e-stress-health',
      source: 'domain-stress',
      target: 'goal-health',
      type: 'drags',
      label: 'Sustainability erosion',
      weight: 0.55,
      confidence: 0.73,
    },
  ],
};
