import type { AppMode } from '../entities/system/modes';

export const MODE_SIGNAL: Record<AppMode, { pulse: number; hue: string; title: string }> = {
  start: { pulse: 0.82, hue: '#62d6ff', title: 'Boot Sequence' },
  world: { pulse: 0.68, hue: '#8bb3ff', title: 'World Scan' },
  graph: { pulse: 0.91, hue: '#71ffe4', title: 'Graph Lens' },
  oracle: { pulse: 0.74, hue: '#cf8cff', title: 'Oracle Projection' },
};
