import type { DataSpine } from '../../app/state/dataSpine';

export type RegistryDomain = 'finance' | 'body' | 'work' | 'goal' | 'state' | 'factors' | 'confidence' | 'later';
export type RegistrySection = 'profile' | 'state' | 'factors' | 'derived' | 'future';
export type FieldSource = 'manual' | 'derived' | 'auto' | 'missing';
export type FieldStatus = 'filled' | 'missing' | 'stale' | 'inferred';
export type InputType = 'numeric' | 'scale' | 'segmented' | 'boolean' | 'date' | 'text';
export type ControlType = 'input' | 'slider' | 'segmented' | 'toggle' | 'date-picker' | 'textarea' | 'metric-chip';
export type Criticality = 'critical' | 'recommended' | 'later';

export type RegistryField = {
  id: string;
  label: string;
  domain: RegistryDomain;
  section: RegistrySection;
  inputType: InputType;
  controlType: ControlType;
  source: FieldSource;
  criticality: Criticality;
  description: string;
  whyItMatters: string;
  improvesWhat: string;
  usedIn: string[];
  affectsMetrics: string[];
  affectsConfidence: string[];
  affectsUnlock: boolean;
  promptPack: string[];
  formatter: string;
  defaultValue: string;
  validation: string;
  suggestedPrompt: string;
  uiSurface: 'drawer' | 'start prompt' | 'later' | 'hidden';
};

const makeField = (field: RegistryField) => field;

export const FIELD_REGISTRY: RegistryField[] = [
  makeField({ id: 'monthlyIncome', label: 'Доход в месяц', domain: 'finance', section: 'profile', inputType: 'numeric', controlType: 'input', source: 'manual', criticality: 'critical', description: 'Стабильный месячный приток денег.', whyItMatters: 'Нужен для давления и риска.', improvesWhat: 'Точность денежного давления.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Финансы', 'Вердикт'], affectsMetrics: ['pressureValue', 'riskValue'], affectsConfidence: ['finance', 'global'], affectsUnlock: false, promptPack: ['Пакет «Финансы»'], formatter: '₽ + разделители тысяч', defaultValue: '180000', validation: '>= 0', suggestedPrompt: 'Сколько сейчас стабильно заходит в месяц?', uiSurface: 'drawer' }),
  makeField({ id: 'monthlyFixedExpenses', label: 'Фиксированные расходы', domain: 'finance', section: 'profile', inputType: 'numeric', controlType: 'input', source: 'manual', criticality: 'critical', description: 'Обязательные траты в месяц.', whyItMatters: 'Определяет реальный коридор.', improvesWhat: 'Оценка запаса хода.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Финансы'], affectsMetrics: ['pressureValue', 'riskValue'], affectsConfidence: ['finance', 'global'], affectsUnlock: false, promptPack: ['Пакет «Финансы»'], formatter: '₽ + разделители тысяч', defaultValue: '95000', validation: '>= 0', suggestedPrompt: 'Какая сумма обязательных расходов в месяц?', uiSurface: 'drawer' }),
  makeField({ id: 'reserveAmount', label: 'Резерв', domain: 'finance', section: 'profile', inputType: 'numeric', controlType: 'input', source: 'manual', criticality: 'critical', description: 'Свободный запас денег.', whyItMatters: 'Влияет на стресс устойчивости.', improvesWhat: 'Финансовая устойчивость и риск.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Финансы', 'Вердикт'], affectsMetrics: ['pressureValue', 'riskValue', 'stabilityValue'], affectsConfidence: ['finance', 'global'], affectsUnlock: false, promptPack: ['Пакет «Финансы»'], formatter: '₽ + разделители тысяч', defaultValue: '240000', validation: '>= 0', suggestedPrompt: 'Какой у тебя живой резерв сейчас?', uiSurface: 'drawer' }),
  makeField({ id: 'sleepTargetHours', label: 'Норма сна', domain: 'body', section: 'profile', inputType: 'numeric', controlType: 'slider', source: 'manual', criticality: 'critical', description: 'Целевое количество часов сна.', whyItMatters: 'База для дефицита сна.', improvesWhat: 'Качество биоритм-оценки.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Тело'], affectsMetrics: ['pressureValue', 'stabilityValue'], affectsConfidence: ['body', 'global'], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'Часы с 0.5 шагом', defaultValue: '7.5', validation: '0..12', suggestedPrompt: 'Сколько часов сна для тебя рабочая норма?', uiSurface: 'drawer' }),
  makeField({ id: 'workCapacityBaseline', label: 'База рабочей ёмкости', domain: 'work', section: 'profile', inputType: 'scale', controlType: 'slider', source: 'manual', criticality: 'critical', description: 'Личная норма рабочей нагрузки.', whyItMatters: 'Сравнение нагрузки с базовым уровнем.', improvesWhat: 'Точность прогноза перегруза.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Работа'], affectsMetrics: ['pressureValue', 'leverageValue'], affectsConfidence: ['work', 'global'], affectsUnlock: false, promptPack: ['Пакет «Работа»'], formatter: 'Шкала 1..10', defaultValue: '7', validation: '1..10', suggestedPrompt: 'Какой уровень нагрузки для тебя устойчивый?', uiSurface: 'drawer' }),
  makeField({ id: 'activeGoalTitle', label: 'Активная цель', domain: 'goal', section: 'profile', inputType: 'text', controlType: 'textarea', source: 'manual', criticality: 'critical', description: 'Название цели, которую тянем первой.', whyItMatters: 'Определяет направление оптимизации.', improvesWhat: 'Приоритизацию действий.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Цель', 'Вердикт'], affectsMetrics: ['pressureValue', 'readinessValue'], affectsConfidence: ['goal', 'global'], affectsUnlock: false, promptPack: ['Пакет «Цель»'], formatter: 'Строка', defaultValue: 'Запустить MVP GRAF', validation: 'min length 3', suggestedPrompt: 'Какая цель сейчас №1?', uiSurface: 'start prompt' }),
  makeField({ id: 'activeGoalDeadline', label: 'Дедлайн цели', domain: 'goal', section: 'profile', inputType: 'date', controlType: 'date-picker', source: 'manual', criticality: 'critical', description: 'Крайний срок активной цели.', whyItMatters: 'Добавляет временное давление.', improvesWhat: 'Сильнее выбор горизонта.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Цель'], affectsMetrics: ['pressureValue', 'riskValue'], affectsConfidence: ['goal', 'global'], affectsUnlock: false, promptPack: ['Пакет «Цель»'], formatter: 'YYYY-MM-DD', defaultValue: '2026-06-30', validation: 'valid date', suggestedPrompt: 'Когда дедлайн по этой цели?', uiSurface: 'drawer' }),
  makeField({ id: 'activeGoalFailureCost', label: 'Цена провала цели', domain: 'goal', section: 'profile', inputType: 'numeric', controlType: 'input', source: 'manual', criticality: 'critical', description: 'Потенциальная цена, если цель провалится.', whyItMatters: 'Ключевая часть риска.', improvesWhat: 'Серьёзность вердикта.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Цель', 'Вердикт'], affectsMetrics: ['riskValue', 'pressureValue'], affectsConfidence: ['goal', 'global'], affectsUnlock: false, promptPack: ['Пакет «Цель»'], formatter: '₽', defaultValue: '180000', validation: '>=0', suggestedPrompt: 'Сколько реально стоит провал этой цели?', uiSurface: 'drawer' }),
  makeField({ id: 'mood', label: 'Настроение', domain: 'state', section: 'state', inputType: 'scale', controlType: 'slider', source: 'manual', criticality: 'recommended', description: 'Субъективный тон дня.', whyItMatters: 'Контекст для интерпретации давления.', improvesWhat: 'Точность daily профиля.', usedIn: ['Старт', 'Пакет подсказок: Тело'], affectsMetrics: ['pressureValue'], affectsConfidence: ['body'], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'Шкала 1..10', defaultValue: '6', validation: '1..10', suggestedPrompt: 'Какое сегодня настроение по шкале?', uiSurface: 'start prompt' }),
  makeField({ id: 'energy', label: 'Энергия', domain: 'body', section: 'state', inputType: 'scale', controlType: 'slider', source: 'manual', criticality: 'critical', description: 'Текущий уровень энергии.', whyItMatters: 'Сигнал операционной ёмкости.', improvesWhat: 'Готовность хода и рычаг.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Тело'], affectsMetrics: ['pressureValue', 'leverageValue', 'readinessValue'], affectsConfidence: ['body', 'global'], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'Шкала 1..10', defaultValue: '6', validation: '1..10', suggestedPrompt: 'Сколько у тебя энергии прямо сейчас?', uiSurface: 'start prompt' }),
  makeField({ id: 'focus', label: 'Фокус', domain: 'work', section: 'state', inputType: 'scale', controlType: 'slider', source: 'manual', criticality: 'critical', description: 'Способность удерживать внимание.', whyItMatters: 'Влияет на качество исполнения.', improvesWhat: 'Рычаг и готовность хода.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Работа', 'Вердикт'], affectsMetrics: ['leverageValue', 'readinessValue'], affectsConfidence: ['work', 'global'], affectsUnlock: false, promptPack: ['Пакет «Работа»'], formatter: 'Шкала 1..10', defaultValue: '5', validation: '1..10', suggestedPrompt: 'Какой сегодня уровень фокуса?', uiSurface: 'start prompt' }),
  makeField({ id: 'pressure', label: 'Давление', domain: 'work', section: 'state', inputType: 'scale', controlType: 'slider', source: 'manual', criticality: 'recommended', description: 'Ощущаемое напряжение.', whyItMatters: 'Уточняет риск перегрева.', improvesWhat: 'Pressure/risk метрики.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Работа'], affectsMetrics: ['pressureValue', 'riskValue'], affectsConfidence: ['work'], affectsUnlock: false, promptPack: ['Пакет «Работа»'], formatter: 'Шкала 1..10', defaultValue: '7', validation: '1..10', suggestedPrompt: 'Какое сейчас ощущаемое давление?', uiSurface: 'start prompt' }),
  makeField({ id: 'recovery', label: 'Восстановление', domain: 'body', section: 'state', inputType: 'scale', controlType: 'slider', source: 'manual', criticality: 'recommended', description: 'Насколько получилось восстановиться.', whyItMatters: 'Снижает ложные тревоги.', improvesWhat: 'Stability/readiness точность.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Тело'], affectsMetrics: ['stabilityValue', 'readinessValue'], affectsConfidence: ['body'], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'Шкала 1..10', defaultValue: '5', validation: '1..10', suggestedPrompt: 'Насколько удалось восстановиться?', uiSurface: 'start prompt' }),
  makeField({ id: 'sleepHours', label: 'Фактический сон', domain: 'body', section: 'factors', inputType: 'numeric', controlType: 'slider', source: 'manual', criticality: 'critical', description: 'Сон за последнюю ночь.', whyItMatters: 'Быстро меняет устойчивость.', improvesWhat: 'Pressure/stability.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Тело'], affectsMetrics: ['pressureValue', 'stabilityValue'], affectsConfidence: ['body', 'global'], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'Часы 0..12', defaultValue: '6.5', validation: '0..12', suggestedPrompt: 'Сколько часов удалось поспать?', uiSurface: 'drawer' }),
  makeField({ id: 'workloadLevel', label: 'Нагрузка', domain: 'work', section: 'factors', inputType: 'segmented', controlType: 'segmented', source: 'manual', criticality: 'critical', description: 'Уровень текущей нагрузки.', whyItMatters: 'Сравнение с базой.', improvesWhat: 'Риск перегруза.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Работа'], affectsMetrics: ['pressureValue', 'leverageValue'], affectsConfidence: ['work', 'global'], affectsUnlock: false, promptPack: ['Пакет «Работа»'], formatter: 'low|medium|high', defaultValue: 'high', validation: 'enum', suggestedPrompt: 'Какая нагрузка сейчас: низкая, средняя или высокая?', uiSurface: 'drawer' }),
  makeField({ id: 'hadConflict', label: 'Был конфликт', domain: 'factors', section: 'factors', inputType: 'boolean', controlType: 'toggle', source: 'manual', criticality: 'recommended', description: 'Наличие конфликтной ситуации за день.', whyItMatters: 'Шумит давление.', improvesWhat: 'Точность стресс-контекста.', usedIn: ['Старт', 'Пакет подсказок: Работа'], affectsMetrics: ['pressureValue'], affectsConfidence: ['work'], affectsUnlock: false, promptPack: ['Пакет «Работа»'], formatter: 'Да/Нет', defaultValue: 'false', validation: 'boolean', suggestedPrompt: 'Были ли конфликты сегодня?', uiSurface: 'drawer' }),
  makeField({ id: 'unplannedSpend', label: 'Неплановые траты', domain: 'finance', section: 'factors', inputType: 'numeric', controlType: 'input', source: 'manual', criticality: 'recommended', description: 'Неожиданные траты за период.', whyItMatters: 'Сигнал экстренного давления.', improvesWhat: 'Краткосрочный риск.', usedIn: ['Старт', 'Уверенность', 'Пакет подсказок: Финансы'], affectsMetrics: ['pressureValue', 'riskValue'], affectsConfidence: ['finance'], affectsUnlock: false, promptPack: ['Пакет «Финансы»'], formatter: '₽', defaultValue: '8000', validation: '>=0', suggestedPrompt: 'Какие внеплановые траты были недавно?', uiSurface: 'drawer' }),
  makeField({ id: 'hadWorkout', label: 'Была тренировка', domain: 'body', section: 'factors', inputType: 'boolean', controlType: 'toggle', source: 'manual', criticality: 'recommended', description: 'Факт физической нагрузки.', whyItMatters: 'Повышает устойчивость.', improvesWhat: 'Устойчивость и готовность хода.', usedIn: ['Старт', 'Пакет подсказок: Тело'], affectsMetrics: ['stabilityValue', 'readinessValue'], affectsConfidence: ['body'], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'Да/Нет', defaultValue: 'true', validation: 'boolean', suggestedPrompt: 'Была ли тренировка/активность?', uiSurface: 'drawer' }),
  makeField({ id: 'lateCaffeine', label: 'Поздний кофеин', domain: 'factors', section: 'factors', inputType: 'boolean', controlType: 'toggle', source: 'manual', criticality: 'recommended', description: 'Кофеин поздно вечером.', whyItMatters: 'Ухудшает восстановление.', improvesWhat: 'Точность прогноза сна.', usedIn: ['Старт', 'Пакет подсказок: Тело'], affectsMetrics: ['pressureValue', 'stabilityValue'], affectsConfidence: ['body'], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'Да/Нет', defaultValue: 'true', validation: 'boolean', suggestedPrompt: 'Был ли поздний кофеин?', uiSurface: 'drawer' }),
  makeField({ id: 'checkinRegularity', label: 'Регулярность проверки', domain: 'confidence', section: 'derived', inputType: 'scale', controlType: 'metric-chip', source: 'auto', criticality: 'recommended', description: 'Стабильность заполнения истории.', whyItMatters: 'Ключ к открытию и истории.', improvesWhat: 'Оценка глубины истории.', usedIn: ['Уверенность', 'Подсказка открытия'], affectsMetrics: [], affectsConfidence: ['global', 'goal'], affectsUnlock: true, promptPack: ['Подсказка открытия'], formatter: 'вычисляемый', defaultValue: 'auto', validation: 'streak>=2 || history>=3', suggestedPrompt: 'Добавьте проверку сегодня, чтобы продвинуть открытие.', uiSurface: 'hidden' }),
  makeField({ id: 'heightWeight', label: 'Рост / вес (позже)', domain: 'later', section: 'future', inputType: 'numeric', controlType: 'input', source: 'missing', criticality: 'later', description: 'Заготовка для v2 биометрик.', whyItMatters: 'В будущем поможет базовый контур тела.', improvesWhat: 'Персонализация домена тела.', usedIn: ['Пакет будущего'], affectsMetrics: [], affectsConfidence: [], affectsUnlock: false, promptPack: ['Пакет «Тело»'], formatter: 'см', defaultValue: 'н/д', validation: 'не включено', suggestedPrompt: 'Соберём в следующей итерации.', uiSurface: 'later' }),
];

export const PROMPT_PACKS = [
  { id: 'finance', title: 'Пакет «Финансы»', fields: ['monthlyIncome', 'monthlyFixedExpenses', 'reserveAmount', 'unplannedSpend'], required: ['monthlyIncome', 'monthlyFixedExpenses', 'reserveAmount'], priority: 'P1', surface: 'drawer + start' },
  { id: 'body', title: 'Пакет «Тело»', fields: ['sleepTargetHours', 'sleepHours', 'energy', 'recovery', 'hadWorkout', 'lateCaffeine'], required: ['sleepTargetHours', 'sleepHours', 'energy'], priority: 'P1', surface: 'start + drawer' },
  { id: 'work', title: 'Пакет «Работа»', fields: ['workCapacityBaseline', 'workloadLevel', 'focus', 'pressure', 'hadConflict'], required: ['workCapacityBaseline', 'workloadLevel', 'focus'], priority: 'P1', surface: 'start + drawer' },
  { id: 'goal', title: 'Пакет «Цель»', fields: ['activeGoalTitle', 'activeGoalDeadline', 'activeGoalFailureCost'], required: ['activeGoalTitle', 'activeGoalDeadline', 'activeGoalFailureCost'], priority: 'P1', surface: 'start' },
  { id: 'unlock', title: 'Подсказка открытия', fields: ['checkinRegularity'], required: ['checkinRegularity'], priority: 'P2', surface: 'prompt card' },
] as const;

export const CONTROL_PREVIEW = [
  { id: 'numeric', label: 'Числовой ввод', states: ['по умолчанию', 'наведение', 'активно', 'фокус', 'заполнено', 'пусто', 'подсвечено подсказкой'] },
  { id: 'scale', label: 'Шкала-слайдер', states: ['по умолчанию', 'наведение', 'активно', 'фокус', 'заполнено', 'пусто', 'подсвечено подсказкой'] },
  { id: 'segmented', label: 'Сегмент', states: ['по умолчанию', 'наведение', 'активно', 'фокус', 'заполнено', 'пусто', 'подсвечено подсказкой'] },
  { id: 'boolean', label: 'Переключатель', states: ['по умолчанию', 'наведение', 'активно', 'фокус', 'заполнено', 'пусто', 'подсвечено подсказкой'] },
  { id: 'date', label: 'Дата', states: ['по умолчанию', 'наведение', 'активно', 'фокус', 'заполнено', 'пусто', 'подсвечено подсказкой'] },
  { id: 'text-goal', label: 'Текст цели', states: ['по умолчанию', 'наведение', 'активно', 'фокус', 'заполнено', 'пусто', 'подсвечено подсказкой'] },
  { id: 'field-highlight', label: 'Подсветка поля', states: ['по умолчанию', 'подсвечено подсказкой'] },
  { id: 'drawer-focus', label: 'Фокус панели', states: ['по умолчанию', 'активно', 'фокус'] },
  { id: 'prompt-card', label: 'Состояние карточки подсказки', states: ['по умолчанию', 'наведение', 'активно', 'фокус'] },
] as const;

const readValue = (dataSpine: DataSpine, id: string): unknown => {
  const profile = dataSpine.profile as Record<string, unknown>;
  const state = dataSpine.dailyCheckIn as Record<string, unknown>;
  const factors = dataSpine.dailyFactors as Record<string, unknown>;
  const derived = dataSpine.derived as Record<string, unknown>;
  return profile[id] ?? state[id] ?? factors[id] ?? derived[id] ?? null;
};

export const fieldFilled = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return true;
  return false;
};

export const getRegistrySnapshot = (dataSpine: DataSpine, historyDepthDays: number) => FIELD_REGISTRY.map((field) => {
  const value = readValue(dataSpine, field.id);
  const stale = ['checkinRegularity'].includes(field.id) && historyDepthDays < 3;
  const status: FieldStatus = stale ? 'stale' : field.source === 'derived' || field.source === 'auto' ? 'inferred' : fieldFilled(value) ? 'filled' : 'missing';
  return {
    ...field,
    value,
    freshness: stale ? 'needs history' : 'fresh',
    status,
  };
});
