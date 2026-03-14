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
      id: 'core-self-system',
      type: 'goal',
      name: 'Я / Моя система',
      state: 62,
      inertia: 0.7,
      sensitivity: 0.52,
      tags: ['center'],
      position: { x: 0, y: 0 },
    },
    {
      id: 'domain-health-energy',
      type: 'domain',
      name: 'Здоровье и энергия',
      state: 68,
      inertia: 0.61,
      sensitivity: 0.66,
      tags: ['health', 'capacity'],
      position: { x: 0, y: -220 },
    },
    {
      id: 'domain-work-income',
      type: 'domain',
      name: 'Работа и доход',
      state: 63,
      inertia: 0.58,
      sensitivity: 0.72,
      tags: ['production', 'income'],
      position: { x: 178, y: -132 },
    },
    {
      id: 'domain-finance-obligations',
      type: 'domain',
      name: 'Финансы и обязательства',
      state: 57,
      inertia: 0.74,
      sensitivity: 0.51,
      tags: ['finance', 'pressure'],
      position: { x: 220, y: 58 },
    },
    {
      id: 'domain-relationships-family',
      type: 'domain',
      name: 'Отношения и семья',
      state: 61,
      inertia: 0.57,
      sensitivity: 0.64,
      tags: ['support', 'social'],
      position: { x: 98, y: 216 },
    },
    {
      id: 'domain-environment-home',
      type: 'domain',
      name: 'Среда и быт',
      state: 59,
      inertia: 0.68,
      sensitivity: 0.48,
      tags: ['routine', 'friction'],
      position: { x: -98, y: 216 },
    },
    {
      id: 'domain-focus-development',
      type: 'domain',
      name: 'Фокус и развитие',
      state: 64,
      inertia: 0.6,
      sensitivity: 0.74,
      tags: ['attention', 'growth'],
      position: { x: -220, y: 58 },
    },
    {
      id: 'domain-goals-meaning',
      type: 'domain',
      name: 'Цели и смысл',
      state: 60,
      inertia: 0.69,
      sensitivity: 0.57,
      tags: ['strategy', 'meaning'],
      position: { x: -178, y: -132 },
    },
    {
      id: 'factor-sleep',
      type: 'factor',
      name: 'Качество сна',
      state: 59,
      inertia: 0.64,
      sensitivity: 0.57,
      tags: ['recovery'],
      parentDomainId: 'domain-health-energy',
      position: { x: -322, y: -160 },
    },
    {
      id: 'factor-routine',
      type: 'factor',
      name: 'Ритм дня',
      state: 63,
      inertia: 0.73,
      sensitivity: 0.46,
      tags: ['consistency'],
      parentDomainId: 'domain-environment-home',
      position: { x: -300, y: 264 },
    },
    {
      id: 'factor-cashflow',
      type: 'factor',
      name: 'Финансовый буфер',
      state: 52,
      inertia: 0.79,
      sensitivity: 0.36,
      tags: ['resilience'],
      parentDomainId: 'domain-finance-obligations',
      position: { x: 374, y: 78 },
    },
    {
      id: 'action-sprint',
      type: 'action',
      name: 'Сфокусированный спринт',
      state: 62,
      inertia: 0.4,
      sensitivity: 0.8,
      tags: ['execution', 'high-impact'],
      position: { x: 34, y: -28 },
    },
    {
      id: 'action-review',
      type: 'action',
      name: 'Недельный разбор',
      state: 76,
      inertia: 0.88,
      sensitivity: 0.33,
      tags: ['planning'],
      position: { x: 140, y: -246 },
    },
    {
      id: 'risk-burnout',
      type: 'risk',
      name: 'Риск выгорания',
      state: 41,
      inertia: 0.29,
      sensitivity: 0.92,
      tags: ['health', 'critical'],
      position: { x: -208, y: -20 },
    },
    {
      id: 'risk-distraction',
      type: 'risk',
      name: 'Дрейф внимания',
      state: 38,
      inertia: 0.37,
      sensitivity: 0.88,
      tags: ['attention'],
      position: { x: -88, y: 86 },
    },
    {
      id: 'goal-launch',
      type: 'goal',
      name: 'Ключевой результат периода',
      state: 58,
      inertia: 0.67,
      sensitivity: 0.53,
      tags: ['north-star'],
      position: { x: 264, y: -206 },
    },
  ],
  edges: [
    { id: 'e-self-health', source: 'core-self-system', target: 'domain-health-energy', type: 'boosts', label: 'опора на состояние', weight: 0.66, confidence: 0.9 },
    { id: 'e-self-work', source: 'core-self-system', target: 'domain-work-income', type: 'boosts', label: 'включение в работу', weight: 0.62, confidence: 0.86 },
    { id: 'e-self-finance', source: 'core-self-system', target: 'domain-finance-obligations', type: 'boosts', label: 'контроль обязательств', weight: 0.57, confidence: 0.83 },
    { id: 'e-self-relations', source: 'core-self-system', target: 'domain-relationships-family', type: 'boosts', label: 'поддержка отношений', weight: 0.54, confidence: 0.79 },
    { id: 'e-self-environment', source: 'core-self-system', target: 'domain-environment-home', type: 'boosts', label: 'управление средой', weight: 0.53, confidence: 0.8 },
    { id: 'e-self-focus', source: 'core-self-system', target: 'domain-focus-development', type: 'boosts', label: 'настройка внимания', weight: 0.6, confidence: 0.84 },
    { id: 'e-self-goals', source: 'core-self-system', target: 'domain-goals-meaning', type: 'boosts', label: 'уточнение направления', weight: 0.61, confidence: 0.82 },
    { id: 'e-sleep-health', source: 'factor-sleep', target: 'domain-health-energy', type: 'boosts', label: 'восстановление ресурса', weight: 0.72, confidence: 0.86 },
    { id: 'e-routine-environment', source: 'factor-routine', target: 'domain-environment-home', type: 'boosts', label: 'стабильность быта', weight: 0.65, confidence: 0.81 },
    { id: 'e-cash-finance', source: 'factor-cashflow', target: 'domain-finance-obligations', type: 'boosts', label: 'запас устойчивости', weight: 0.56, confidence: 0.88 },
    { id: 'e-health-work', source: 'domain-health-energy', target: 'domain-work-income', type: 'boosts', label: 'рабочая ёмкость', weight: 0.58, confidence: 0.78 },
    { id: 'e-work-finance', source: 'domain-work-income', target: 'domain-finance-obligations', type: 'boosts', label: 'канал дохода', weight: 0.68, confidence: 0.8 },
    { id: 'e-finance-health', source: 'domain-finance-obligations', target: 'domain-health-energy', type: 'drags', label: 'стресс обязательств', weight: 0.49, confidence: 0.75 },
    { id: 'e-relations-health', source: 'domain-relationships-family', target: 'domain-health-energy', type: 'boosts', label: 'эмоциональная опора', weight: 0.51, confidence: 0.73 },
    { id: 'e-environment-focus', source: 'domain-environment-home', target: 'domain-focus-development', type: 'boosts', label: 'снижение трения', weight: 0.57, confidence: 0.77 },
    { id: 'e-focus-work', source: 'domain-focus-development', target: 'domain-work-income', type: 'boosts', label: 'качество выполнения', weight: 0.64, confidence: 0.79 },
    { id: 'e-goals-focus', source: 'domain-goals-meaning', target: 'domain-focus-development', type: 'boosts', label: 'приоритетный сигнал', weight: 0.63, confidence: 0.81 },
    { id: 'e-goals-work', source: 'domain-goals-meaning', target: 'domain-work-income', type: 'boosts', label: 'направление усилий', weight: 0.52, confidence: 0.74 },
    { id: 'e-focus-goal', source: 'domain-focus-development', target: 'goal-launch', type: 'boosts', label: 'пропускная способность действий', weight: 0.69, confidence: 0.79 },
    { id: 'e-distraction-focus', source: 'risk-distraction', target: 'domain-focus-development', type: 'blocks', label: 'раскол контекста', weight: 0.58, confidence: 0.76 },
    { id: 'e-burnout-health', source: 'risk-burnout', target: 'domain-health-energy', type: 'drags', label: 'долг восстановления', weight: 0.67, confidence: 0.85 },
    { id: 'e-review-finance', source: 'action-review', target: 'domain-finance-obligations', type: 'boosts', label: 'ясность распределения', weight: 0.43, confidence: 0.71 },
    { id: 'e-review-risk', source: 'action-review', target: 'risk-burnout', type: 'drags', label: 'раннее обнаружение', weight: 0.31, confidence: 0.67, lag: 2 },
    { id: 'e-sprint-home', source: 'action-sprint', target: 'domain-environment-home', type: 'conflicts', label: 'цена интенсивности', weight: 0.44, confidence: 0.63 },
    { id: 'e-sprint-goal', source: 'action-sprint', target: 'goal-launch', type: 'delayed', label: 'накопительный эффект', weight: 0.61, confidence: 0.7, lag: 3 },
  ],
};
