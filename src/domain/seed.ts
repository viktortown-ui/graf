import type { GraphModel } from './types';

export const seedGraphModel = (): GraphModel => ({
  tick: 0,
  nodes: [
    { id: 'energy', label: 'Energy', angle: 10, distance: 28, weight: 1.1, state: 0.52, velocity: 0 },
    { id: 'focus', label: 'Focus', angle: 85, distance: 35, weight: 1.2, state: 0.48, velocity: 0 },
    { id: 'health', label: 'Health', angle: 165, distance: 31, weight: 1.3, state: 0.55, velocity: 0 },
    { id: 'craft', label: 'Craft', angle: 240, distance: 36, weight: 1.1, state: 0.45, velocity: 0 },
    { id: 'relationships', label: 'Relationships', angle: 315, distance: 32, weight: 1.0, state: 0.5, velocity: 0 },
  ],
  edges: [
    { id: 'e1', from: 'health', to: 'energy', influence: 0.6 },
    { id: 'e2', from: 'energy', to: 'focus', influence: 0.52 },
    { id: 'e3', from: 'focus', to: 'craft', influence: 0.58 },
    { id: 'e4', from: 'relationships', to: 'focus', influence: 0.33 },
    { id: 'e5', from: 'craft', to: 'energy', influence: 0.27 },
  ],
  goals: [
    { nodeId: 'focus', targetState: 0.72, gravity: 0.4 },
    { nodeId: 'health', targetState: 0.69, gravity: 0.35 },
    { nodeId: 'craft', targetState: 0.7, gravity: 0.45 },
  ],
  history: [],
});
