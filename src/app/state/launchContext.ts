import type { AppMode } from '../../entities/system/modes';

export type PressureId = 'load' | 'energy-drop' | 'attention-drift' | 'money' | 'goal-slip';
export type EntryModeId = 'fast' | 'analysis' | 'forecast';
export type HorizonId = 'today' | 'week' | 'month';
export type TargetFocusId = 'Удержать систему' | 'Снизить риск' | 'Усилить цель' | 'Восстановить ресурс';

export type LaunchPreset = {
  id: PressureId;
  label: string;
  anchorNodeId: string;
  worldPlanetId: string;
  risk: string;
  recommendedMode: AppMode;
  pressureEdgeIds: string[];
};

export const PRESSURE_OPTIONS: LaunchPreset[] = [
  {
    id: 'load',
    label: 'Перегрузка',
    anchorNodeId: 'domain-stress',
    worldPlanetId: 'stress',
    risk: 'Рост каскада напряжения',
    recommendedMode: 'world',
    pressureEdgeIds: ['e-sprint-stress', 'e-stress-focus', 'e-money-stress'],
  },
  {
    id: 'energy-drop',
    label: 'Просадка энергии',
    anchorNodeId: 'domain-energy',
    worldPlanetId: 'energy',
    risk: 'Потеря темпа восстановления',
    recommendedMode: 'world',
    pressureEdgeIds: ['e-burnout-energy', 'e-energy-focus'],
  },
  {
    id: 'attention-drift',
    label: 'Дрейф внимания',
    anchorNodeId: 'risk-distraction',
    worldPlanetId: 'focus',
    risk: 'Рассыпание контекста выполнения',
    recommendedMode: 'graph',
    pressureEdgeIds: ['e-distraction-focus', 'e-stress-focus'],
  },
  {
    id: 'money',
    label: 'Давление денег',
    anchorNodeId: 'domain-money',
    worldPlanetId: 'money',
    risk: 'Ослабление буфера решений',
    recommendedMode: 'graph',
    pressureEdgeIds: ['e-money-stress', 'e-cash-money'],
  },
  {
    id: 'goal-slip',
    label: 'Риск срыва цели',
    anchorNodeId: 'goal-launch',
    worldPlanetId: 'goal',
    risk: 'Смещение северной цели',
    recommendedMode: 'oracle',
    pressureEdgeIds: ['e-focus-launch', 'e-sprint-launch'],
  },
];

export const ENTRY_MODES = [
  { id: 'fast' as const, label: 'Быстрый запуск', recommendedMode: 'world' as const },
  { id: 'analysis' as const, label: 'Анализ причин', recommendedMode: 'graph' as const },
  { id: 'forecast' as const, label: 'Прогноз сценариев', recommendedMode: 'oracle' as const },
];

export const HORIZONS = [
  { id: 'today' as const, label: 'Сегодня', oracleHorizon: 3 as const },
  { id: 'week' as const, label: '7 дней', oracleHorizon: 7 as const },
  { id: 'month' as const, label: '30 дней', oracleHorizon: 14 as const },
];

export const TARGETS = ['Удержать систему', 'Снизить риск', 'Усилить цель', 'Восстановить ресурс'] as const;

export type LaunchContext = {
  pressureId: PressureId;
  entryModeId: EntryModeId;
  horizonId: HorizonId;
  targetFocus: TargetFocusId;
};

export const DEFAULT_LAUNCH_CONTEXT: LaunchContext = {
  pressureId: PRESSURE_OPTIONS[0].id,
  entryModeId: ENTRY_MODES[0].id,
  horizonId: HORIZONS[0].id,
  targetFocus: TARGETS[0],
};

export const TARGET_EDGE_HINT: Record<TargetFocusId, string[]> = {
  'Удержать систему': ['e-health-burnout', 'e-review-risk'],
  'Снизить риск': ['e-health-burnout', 'e-review-risk', 'e-burnout-energy'],
  'Усилить цель': ['e-focus-launch', 'e-sprint-launch'],
  'Восстановить ресурс': ['e-sleep-energy', 'e-cash-money'],
};
