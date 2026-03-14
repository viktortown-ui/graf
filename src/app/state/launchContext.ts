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
    anchorNodeId: 'domain-finance-obligations',
    worldPlanetId: 'money',
    risk: 'Перегрузка начнёт ломать базовые решения',
    recommendedMode: 'world',
    pressureEdgeIds: ['e-finance-health', 'e-distraction-focus'],
  },
  {
    id: 'energy-drop',
    label: 'Не хватает сил',
    anchorNodeId: 'domain-health-energy',
    worldPlanetId: 'energy',
    risk: 'Даже важные задачи уйдут в просадку',
    recommendedMode: 'world',
    pressureEdgeIds: ['e-burnout-health', 'e-sleep-health'],
  },
  {
    id: 'attention-drift',
    label: 'Теряю фокус',
    anchorNodeId: 'domain-focus-development',
    worldPlanetId: 'focus',
    risk: 'Ошибки и незавершённые дела начнут накапливаться',
    recommendedMode: 'graph',
    pressureEdgeIds: ['e-distraction-focus', 'e-environment-focus'],
  },
  {
    id: 'money',
    label: 'Давят деньги',
    anchorNodeId: 'domain-finance-obligations',
    worldPlanetId: 'money',
    risk: 'Финансовое напряжение заблокирует манёвры',
    recommendedMode: 'graph',
    pressureEdgeIds: ['e-cash-finance', 'e-finance-health'],
  },
  {
    id: 'goal-slip',
    label: 'Цель под угрозой',
    anchorNodeId: 'goal-launch',
    worldPlanetId: 'goal',
    risk: 'Срок и результат могут выйти из-под контроля',
    recommendedMode: 'oracle',
    pressureEdgeIds: ['e-focus-goal', 'e-sprint-goal'],
  },
];

export const ENTRY_MODES = [
  { id: 'fast' as const, label: 'Быстро вернуть контроль', recommendedMode: 'world' as const },
  { id: 'analysis' as const, label: 'Понять, где корень проблемы', recommendedMode: 'graph' as const },
  { id: 'forecast' as const, label: 'Выбрать лучший следующий шаг', recommendedMode: 'oracle' as const },
];

export const HORIZONS = [
  { id: 'today' as const, label: 'Сегодня', oracleHorizon: 3 as const },
  { id: 'week' as const, label: 'Неделя', oracleHorizon: 7 as const },
  { id: 'month' as const, label: 'Месяц', oracleHorizon: 14 as const },
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
  'Удержать систему': ['e-review-risk', 'e-finance-health'],
  'Снизить риск': ['e-review-risk', 'e-burnout-health', 'e-finance-health'],
  'Усилить цель': ['e-focus-goal', 'e-sprint-goal'],
  'Восстановить ресурс': ['e-sleep-health', 'e-relations-health'],
};
