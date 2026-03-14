export type DomainState = 'inactive' | 'active' | 'adjacent' | 'locked';

export type GraphStartDomain = {
  id: 'energy-state' | 'stability-constraints' | 'direction-commitments' | 'execution-delivery' | 'capability-craft';
  title: string;
  shortTitle: string;
  summary: string;
  anchorNodeId: string;
  depthLayerLabel: string;
  depthLayerSummary: string;
  firstLayerNodes: { id: string; label: string; status: 'ready' | 'tracking' | 'locked'; note: string }[];
  tools: { id: string; name: string; status: 'available' | 'structured' | 'locked'; note: string }[];
};

export type GraphStartEdge = {
  id: string;
  from: GraphStartDomain['id'];
  to: GraphStartDomain['id'];
  relation: 'enables' | 'depends-on' | 'stabilizes' | 'amplifies' | 'drains';
  strength: 'low' | 'med' | 'high';
  confidence: 'hypothesis' | 'medium' | 'verified';
};

export const V1_MAJOR_DOMAINS: GraphStartDomain[] = [
  {
    id: 'energy-state',
    title: 'Энергия и состояние',
    shortTitle: 'Энергия',
    summary: 'Пропускная способность системы: восстановление, ясность, регуляция.',
    anchorNodeId: 'domain-energy',
    depthLayerLabel: 'Слой Surface → Pattern',
    depthLayerSummary: 'Сначала фиксируем снимки состояния и паттерны истощения.',
    firstLayerNodes: [
      { id: 'sleep-recovery', label: 'Ритм сна и восстановления', status: 'ready', note: 'Заполните базу дня и регулярность.' },
      { id: 'attention-stability', label: 'Стабильность внимания', status: 'tracking', note: 'Отслеживайте прерывания против окон фокуса.' },
      { id: 'depletion-events', label: 'События истощения', status: 'locked', note: 'Откроется после 3 снимков состояния.' },
    ],
    tools: [
      { id: 'power-scan', name: 'Power Scan состояния', status: 'available', note: 'Быстрый вход данных за 90 секунд.' },
      { id: 'crash-detector', name: 'Детектор срывов', status: 'structured', note: 'Готов после накопления истории.' },
    ],
  },
  {
    id: 'stability-constraints',
    title: 'Стабильность и ограничения',
    shortTitle: 'Стабильность',
    summary: 'Инфраструктура жизни: время, обязательства, запас ресурса.',
    anchorNodeId: 'domain-money',
    depthLayerLabel: 'Слой Surface → Mechanism',
    depthLayerSummary: 'Показывает, где маршруты ломаются о реальные границы.',
    firstLayerNodes: [
      { id: 'time-buffer', label: 'Буферы времени', status: 'ready', note: 'Задайте доступные окна без компромисса.' },
      { id: 'money-runway', label: 'Давление runway', status: 'tracking', note: 'Отслеживайте фиксированные обязательства.' },
      { id: 'admin-friction', label: 'Админ-трение', status: 'locked', note: 'Откроется после сохранения карты ограничений.' },
    ],
    tools: [
      { id: 'constraint-mapper', name: 'Constraint Mapper', status: 'available', note: 'Преобразует ограничения в граничные узлы.' },
      { id: 'buffer-gauge', name: 'Индикатор буфера', status: 'structured', note: 'Готов после 7 дней сигнала буферов.' },
    ],
  },
  {
    id: 'direction-commitments',
    title: 'Направление и обязательства',
    shortTitle: 'Направление',
    summary: 'Фокус системы: что делаем, что не делаем, какой trade-off принят.',
    anchorNodeId: 'goal-launch',
    depthLayerLabel: 'Слой Surface → Strategy',
    depthLayerSummary: 'Формирует контракт обязательства и карту конфликтов.',
    firstLayerNodes: [
      { id: 'current-commitment', label: 'Контракт обязательства', status: 'ready', note: 'Зафиксируйте результат, срок, цену отказа.' },
      { id: 'conflict-grid', label: 'Сетка конфликтов', status: 'tracking', note: 'Проверьте совместимость с ёмкостью.' },
      { id: 'horizon-balance', label: 'Баланс горизонтов', status: 'locked', note: 'Откроется после 2 активных обязательств.' },
    ],
    tools: [
      { id: 'contract-builder', name: 'Конструктор контракта', status: 'available', note: 'Создаёт структурный узел обязательства.' },
      { id: 'conflict-resolver', name: 'Разрешение конфликтов', status: 'structured', note: 'Запускается при заполненных сроках/ёмкости.' },
    ],
  },
  {
    id: 'execution-delivery',
    title: 'Исполнение и доставка',
    shortTitle: 'Исполнение',
    summary: 'Переход от намерения к закрытому результату и проверке маршрута.',
    anchorNodeId: 'factor-routine',
    depthLayerLabel: 'Слой Surface → Mechanism',
    depthLayerSummary: 'Открывает шаги маршрута и эскалацию блокеров.',
    firstLayerNodes: [
      { id: 'route-steps', label: 'Минимальные шаги маршрута', status: 'ready', note: 'Постройте последовательность с зависимостями.' },
      { id: 'blocker-age', label: 'Возраст блокера', status: 'tracking', note: 'Следите за длительностью стопа.' },
      { id: 'delivery-forecast', label: 'Диапазон доставки', status: 'locked', note: 'Откроется после одного полного цикла.' },
    ],
    tools: [
      { id: 'route-builder', name: 'Route Builder', status: 'available', note: 'Строит маршрут из контракта.' },
      { id: 'blocker-engine', name: 'Эскалация блокера', status: 'structured', note: 'Показывает варианты при затяжном блоке.' },
    ],
  },
  {
    id: 'capability-craft',
    title: 'Способность и мастерство',
    shortTitle: 'Мастерство',
    summary: 'Качество метода и навыков, влияющее на потолок результата.',
    anchorNodeId: 'domain-focus',
    depthLayerLabel: 'Слой Surface → Pattern',
    depthLayerSummary: 'Связывает повторные сбои с долгом компетенции.',
    firstLayerNodes: [
      { id: 'skill-gap', label: 'Карта skill-gap', status: 'ready', note: 'Свяжите повторные блокеры с пробелами навыка.' },
      { id: 'practice-loop', label: 'Practice loop', status: 'tracking', note: 'Запустите короткий цикл отработки.' },
      { id: 'quality-drift', label: 'Дрейф качества', status: 'locked', note: 'Откроется при регулярном сигнале качества.' },
    ],
    tools: [
      { id: 'bottleneck-diagnosis', name: 'Диагностика узкого места', status: 'available', note: 'Создаёт ребра capability debt.' },
      { id: 'practice-planner', name: 'Планировщик практики', status: 'structured', note: 'Готов после выбора skill-gap.' },
    ],
  },
];

export const V1_DOMAIN_EDGES: GraphStartEdge[] = [
  { id: 'edge-energy-execution', from: 'energy-state', to: 'execution-delivery', relation: 'enables', strength: 'high', confidence: 'verified' },
  { id: 'edge-stability-direction', from: 'stability-constraints', to: 'direction-commitments', relation: 'depends-on', strength: 'high', confidence: 'verified' },
  { id: 'edge-direction-execution', from: 'direction-commitments', to: 'execution-delivery', relation: 'enables', strength: 'high', confidence: 'verified' },
  { id: 'edge-execution-craft', from: 'execution-delivery', to: 'capability-craft', relation: 'amplifies', strength: 'med', confidence: 'medium' },
  { id: 'edge-craft-execution', from: 'capability-craft', to: 'execution-delivery', relation: 'stabilizes', strength: 'med', confidence: 'medium' },
  { id: 'edge-stability-energy', from: 'stability-constraints', to: 'energy-state', relation: 'stabilizes', strength: 'med', confidence: 'medium' },
  { id: 'edge-direction-energy', from: 'direction-commitments', to: 'energy-state', relation: 'drains', strength: 'low', confidence: 'hypothesis' },
];
