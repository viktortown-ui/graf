import type { AppMode } from '../entities/system/modes';

export const MODE_SIGNAL: Record<AppMode, { pulse: number; hue: string; title: string }> = {
  overview: { pulse: 0.58, hue: '#7ec9ff', title: 'Центральный обзор' },
  start: { pulse: 0.82, hue: '#62d6ff', title: 'Контур запуска' },
  world: { pulse: 0.68, hue: '#8bb3ff', title: 'Сканирование мира' },
  graph: { pulse: 0.91, hue: '#71ffe4', title: 'Линза графа' },
  oracle: { pulse: 0.74, hue: '#cf8cff', title: 'Прогноз оракула' },
  settings: { pulse: 0.66, hue: '#7bd4ff', title: 'Системный контроль' },
  datalab: { pulse: 0.79, hue: '#7affd8', title: 'Data Lab · инженерный контур' },
};
