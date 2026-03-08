export type AppMode = 'start' | 'world' | 'graph' | 'oracle';

export type ModeDefinition = {
  id: AppMode;
  label: string;
  short: string;
  summary: string;
};

export const MODES: ModeDefinition[] = [
  {
    id: 'start',
    label: 'Start',
    short: 'ST',
    summary: 'Prime the mission and align the system baseline.',
  },
  {
    id: 'world',
    label: 'World',
    short: 'WD',
    summary: 'Observe active world signals and regional pressure.',
  },
  {
    id: 'graph',
    label: 'Graph',
    short: 'GP',
    summary: 'Inspect the topology and influence corridors.',
  },
  {
    id: 'oracle',
    label: 'Oracle',
    short: 'OR',
    summary: 'Project probable trajectories and next actions.',
  },
];

export const DEFAULT_MODE: AppMode = 'start';
