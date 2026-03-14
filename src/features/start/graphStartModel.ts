export type DomainState = 'inactive' | 'active' | 'adjacent' | 'locked';

export type GraphStartDomain = {
  id: 'health-energy' | 'work-income' | 'finance-obligations' | 'relationships-family' | 'environment-home' | 'focus-development' | 'goals-meaning';
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
    id: 'health-energy',
    title: 'Здоровье и энергия',
    shortTitle: 'Здоровье',
    summary: 'Базовая ёмкость системы: сон, восстановление, физическое состояние.',
    anchorNodeId: 'domain-health-energy',
    depthLayerLabel: 'Слой Surface → Pattern',
    depthLayerSummary: 'Фиксируем нагрузку, восстановление и ранние сигналы срыва.',
    firstLayerNodes: [
      { id: 'sleep-rhythm', label: 'Ритм сна и восстановления', status: 'ready', note: 'Соберите 7-дневный базовый паттерн.' },
      { id: 'fatigue-points', label: 'Пики усталости', status: 'tracking', note: 'Отмечайте часы провала энергии.' },
      { id: 'burnout-risk', label: 'Риск выгорания', status: 'locked', note: 'Откроется после истории сигналов.' },
    ],
    tools: [
      { id: 'energy-scan', name: 'Скан состояния', status: 'available', note: 'Быстрый замер ёмкости дня.' },
      { id: 'recovery-loop', name: 'Контур восстановления', status: 'structured', note: 'Станет точнее после 1 недели данных.' },
    ],
  },
  {
    id: 'work-income',
    title: 'Работа и доход',
    shortTitle: 'Работа',
    summary: 'Производственный контур: задачи, результат, устойчивость дохода.',
    anchorNodeId: 'domain-work-income',
    depthLayerLabel: 'Слой Surface → Mechanism',
    depthLayerSummary: 'Собираем пропускную способность, блокеры и качество pipeline.',
    firstLayerNodes: [
      { id: 'role-clarity', label: 'Ясность роли и приоритета', status: 'ready', note: 'Зафиксируйте 1-2 ключевых результата.' },
      { id: 'deadline-load', label: 'Нагрузка по дедлайнам', status: 'tracking', note: 'Отслеживайте плотность обязательств.' },
      { id: 'income-volatility', label: 'Волатильность дохода', status: 'locked', note: 'Откроется после карты источников.' },
    ],
    tools: [
      { id: 'work-route', name: 'Маршрут результата', status: 'available', note: 'Собирает шаги доставки в графе.' },
      { id: 'pipeline-check', name: 'Проверка pipeline', status: 'structured', note: 'Показывает узкие места потока.' },
    ],
  },
  {
    id: 'finance-obligations',
    title: 'Финансы и обязательства',
    shortTitle: 'Финансы',
    summary: 'Денежный контур давления: платежи, запас, долговая нагрузка.',
    anchorNodeId: 'domain-finance-obligations',
    depthLayerLabel: 'Слой Surface → Mechanism',
    depthLayerSummary: 'Показывает где cashflow ограничивает движение всей системы.',
    firstLayerNodes: [
      { id: 'fixed-payments', label: 'Обязательные платежи', status: 'ready', note: 'Соберите базу повторяющихся выплат.' },
      { id: 'cashflow-gap', label: 'Разрыв cashflow', status: 'tracking', note: 'Помечайте напряжённые недели.' },
      { id: 'reserve-buffer', label: 'Резервный буфер', status: 'locked', note: 'Откроется после выравнивания расходов.' },
    ],
    tools: [
      { id: 'obligation-map', name: 'Карта обязательств', status: 'available', note: 'Строит структуру финансовых зависимостей.' },
      { id: 'runway-estimator', name: 'Оценка runway', status: 'structured', note: 'Точность растёт с длиной истории.' },
    ],
  },
  {
    id: 'relationships-family',
    title: 'Отношения и семья',
    shortTitle: 'Отношения',
    summary: 'Социальный контур поддержки, конфликта и договорённостей.',
    anchorNodeId: 'domain-relationships-family',
    depthLayerLabel: 'Слой Surface → Pattern',
    depthLayerSummary: 'Выделяем источники поддержки и точки эмоциональной нагрузки.',
    firstLayerNodes: [
      { id: 'support-map', label: 'Карта поддержки', status: 'ready', note: 'Определите реальные опоры и контакты.' },
      { id: 'conflict-heat', label: 'Температура конфликта', status: 'tracking', note: 'Фиксируйте повторяющиеся триггеры.' },
      { id: 'boundary-fail', label: 'Срывы границ', status: 'locked', note: 'Откроется после журнала конфликтов.' },
    ],
    tools: [
      { id: 'agreement-builder', name: 'Конструктор договорённостей', status: 'available', note: 'Фиксирует рабочие правила взаимодействия.' },
      { id: 'conflict-loop', name: 'Контур деэскалации', status: 'structured', note: 'Нужны повторяемые события для калибровки.' },
    ],
  },
  {
    id: 'environment-home',
    title: 'Среда и быт',
    shortTitle: 'Среда',
    summary: 'Физический и бытовой контур, влияющий на трение и ритм.',
    anchorNodeId: 'domain-environment-home',
    depthLayerLabel: 'Слой Surface → Mechanism',
    depthLayerSummary: 'Собираем карту бытового трения и автоматизаций.',
    firstLayerNodes: [
      { id: 'friction-map', label: 'Карта трения среды', status: 'ready', note: 'Отметьте 3 главные точки потери времени.' },
      { id: 'routine-gaps', label: 'Провалы рутины', status: 'tracking', note: 'Следите за срывами базовых циклов.' },
      { id: 'home-chaos', label: 'Индекс хаоса', status: 'locked', note: 'Откроется после 10 наблюдений.' },
    ],
    tools: [
      { id: 'space-reset', name: 'Сброс среды', status: 'available', note: 'Запускает минимальный пакет упрощений.' },
      { id: 'routine-automator', name: 'Автоматизация рутины', status: 'structured', note: 'Предлагает шаги после стабилизации паттернов.' },
    ],
  },
  {
    id: 'focus-development',
    title: 'Фокус и развитие',
    shortTitle: 'Фокус',
    summary: 'Контур обучения, внимания и адаптации к новым требованиям.',
    anchorNodeId: 'domain-focus-development',
    depthLayerLabel: 'Слой Surface → Pattern',
    depthLayerSummary: 'Связываем внимание, практику и накопление компетенции.',
    firstLayerNodes: [
      { id: 'attention-fragmentation', label: 'Фрагментация внимания', status: 'ready', note: 'Считайте частоту переключений контекста.' },
      { id: 'practice-cycle', label: 'Цикл практики', status: 'tracking', note: 'Фиксируйте регулярность коротких повторений.' },
      { id: 'skill-obsolescence', label: 'Устаревание навыка', status: 'locked', note: 'Откроется после анализа повторных блокеров.' },
    ],
    tools: [
      { id: 'focus-guard', name: 'Защита фокуса', status: 'available', note: 'Строит границы для рабочих окон.' },
      { id: 'growth-loop', name: 'Контур развития', status: 'structured', note: 'Привязывает обучение к реальным задачам.' },
    ],
  },
  {
    id: 'goals-meaning',
    title: 'Цели и смысл',
    shortTitle: 'Цели',
    summary: 'Стратегический контур: направление, приоритеты, согласованность ценностей.',
    anchorNodeId: 'domain-goals-meaning',
    depthLayerLabel: 'Слой Surface → Strategy',
    depthLayerSummary: 'Уточняем цель, цену выбора и иерархию обязательств.',
    firstLayerNodes: [
      { id: 'goal-clarity', label: 'Ясность цели', status: 'ready', note: 'Сформулируйте результат на горизонт.' },
      { id: 'priority-conflicts', label: 'Конфликты приоритетов', status: 'tracking', note: 'Отмечайте конкурирующие обязательства.' },
      { id: 'meaning-collapse', label: 'Провал мотивации', status: 'locked', note: 'Откроется после повторных остановок маршрута.' },
    ],
    tools: [
      { id: 'goal-contract', name: 'Контракт цели', status: 'available', note: 'Фиксирует критерии завершения и цену отказа.' },
      { id: 'priority-matrix', name: 'Матрица приоритетов', status: 'structured', note: 'Показывает конфликтующие ветви нагрузки.' },
    ],
  },
];

export const V1_DOMAIN_EDGES: GraphStartEdge[] = [
  { id: 'edge-health-work', from: 'health-energy', to: 'work-income', relation: 'enables', strength: 'high', confidence: 'verified' },
  { id: 'edge-work-finance', from: 'work-income', to: 'finance-obligations', relation: 'enables', strength: 'high', confidence: 'verified' },
  { id: 'edge-finance-environment', from: 'finance-obligations', to: 'environment-home', relation: 'stabilizes', strength: 'med', confidence: 'verified' },
  { id: 'edge-environment-focus', from: 'environment-home', to: 'focus-development', relation: 'enables', strength: 'med', confidence: 'medium' },
  { id: 'edge-focus-work', from: 'focus-development', to: 'work-income', relation: 'amplifies', strength: 'med', confidence: 'medium' },
  { id: 'edge-relations-health', from: 'relationships-family', to: 'health-energy', relation: 'stabilizes', strength: 'med', confidence: 'medium' },
  { id: 'edge-goals-focus', from: 'goals-meaning', to: 'focus-development', relation: 'enables', strength: 'high', confidence: 'verified' },
  { id: 'edge-finance-health', from: 'finance-obligations', to: 'health-energy', relation: 'drains', strength: 'low', confidence: 'hypothesis' },
  { id: 'edge-goals-relations', from: 'goals-meaning', to: 'relationships-family', relation: 'drains', strength: 'low', confidence: 'hypothesis' },
];
