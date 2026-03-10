import type { DataSpine } from '../../app/state/dataSpine';
import { trackHistoryDepth } from './historyDepthTracker';
import { resolveMissingData } from './missingDataResolver';

export type ConfidenceDomain = 'finance' | 'body' | 'work' | 'goal';
export type FieldPriority = 'critical' | 'recommended' | 'later';
export type DataSection = 'profile' | 'state' | 'factors';

export type ConfidenceFieldDescriptor = {
  key: string;
  label: string;
  domain: ConfidenceDomain;
  section: DataSection;
  priority: FieldPriority;
  reason: string;
  isComputed?: boolean;
};

export type ConfidenceInput = {
  dataSpine: DataSpine;
  historyDates: string[];
  now?: Date;
};

export type NextUnlock = {
  thresholdDays: number;
  title: string;
  daysLeft: number;
  missingForUnlock: string[];
};

export type ConfidenceSnapshot = {
  globalConfidence: number;
  domainConfidence: Record<ConfidenceDomain, number>;
  historyDepthDays: number;
  streakDays: number;
  freshnessPenalty: number;
  missingCriticalFields: string[];
  missingRecommendedFields: string[];
  unlockedFeatures: string[];
  nextUnlock: NextUnlock | null;
  completenessScore: number;
  freshnessScore: number;
  consistencyScore: number;
  historyDepthScore: number;
};

export const CONFIDENCE_FIELDS: ConfidenceFieldDescriptor[] = [
  { key: 'monthlyIncome', label: 'Доход в месяц', domain: 'finance', section: 'profile', priority: 'critical', reason: 'Нужен для расчёта денежного давления и запаса хода.' },
  { key: 'monthlyFixedExpenses', label: 'Фиксированные расходы', domain: 'finance', section: 'profile', priority: 'critical', reason: 'Определяет долю доступного ресурса и реальный коридор решений.' },
  { key: 'reserveAmount', label: 'Резерв', domain: 'finance', section: 'profile', priority: 'critical', reason: 'Позволяет оценить устойчивость к внеплановым нагрузкам.' },
  { key: 'unplannedSpend', label: 'Неплановые траты (последний check-in)', domain: 'finance', section: 'factors', priority: 'recommended', reason: 'Повышает точность краткосрочного финансового риска.' },

  { key: 'sleepTargetHours', label: 'Норма сна', domain: 'body', section: 'profile', priority: 'critical', reason: 'Даёт базу для расчёта дефицита восстановления.' },
  { key: 'sleepHours', label: 'Фактический сон', domain: 'body', section: 'factors', priority: 'critical', reason: 'Показывает текущее отклонение от нормы и усталость.' },
  { key: 'energy', label: 'Энергия', domain: 'body', section: 'state', priority: 'critical', reason: 'Быстрый сигнал о ресурсе тела на текущий день.' },
  { key: 'recovery', label: 'Восстановление', domain: 'body', section: 'state', priority: 'recommended', reason: 'Уточняет риск перегруза при одинаковой энергии.' },
  { key: 'heightWeight', label: 'Рост / вес (будущее расширение)', domain: 'body', section: 'profile', priority: 'later', reason: 'Нужны для биометрик и персонального baseline v2.', isComputed: true },

  { key: 'workCapacityBaseline', label: 'База рабочей ёмкости', domain: 'work', section: 'profile', priority: 'critical', reason: 'Задаёт индивидуальную норму рабочей нагрузки.' },
  { key: 'workloadLevel', label: 'Текущая нагрузка', domain: 'work', section: 'factors', priority: 'critical', reason: 'Помогает оценить перегруз относительно baseline.' },
  { key: 'focus', label: 'Фокус', domain: 'work', section: 'state', priority: 'critical', reason: 'Ключевой индикатор рабочей способности сегодня.' },
  { key: 'pressure', label: 'Давление', domain: 'work', section: 'state', priority: 'recommended', reason: 'Добавляет контекст: дефицит фокуса из-за стресса или усталости.' },

  { key: 'activeGoalTitle', label: 'Активная цель', domain: 'goal', section: 'profile', priority: 'critical', reason: 'Без цели система не понимает направление оптимизации.' },
  { key: 'activeGoalDeadline', label: 'Дедлайн цели', domain: 'goal', section: 'profile', priority: 'critical', reason: 'Даёт временное давление и помогает выбрать темп.' },
  { key: 'activeGoalFailureCost', label: 'Цена провала цели', domain: 'goal', section: 'profile', priority: 'critical', reason: 'Определяет стоимость промаха и вес решения.' },
  { key: 'checkinRegularity', label: 'Регулярность check-in', domain: 'goal', section: 'state', priority: 'recommended', reason: 'Нужна для уверенного прогноза по прогрессу и отклонениям.', isComputed: true },
];

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const normalizeDate = (value: string) => value.slice(0, 10);
const daysBetween = (a: Date, b: Date) => Math.floor((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);

const getHistoryStats = (historyDates: string[], now: Date) => {
  if (!historyDates.length) return { historyDepthDays: 0, streakDays: 0, daysSinceLastCheckIn: 999 };
  const uniqSorted = Array.from(new Set(historyDates.map(normalizeDate))).sort();
  const dates = uniqSorted.map((entry) => new Date(entry));
  const oldest = dates[0];
  const newest = dates[dates.length - 1];
  const historyDepthDays = Math.max(1, daysBetween(newest, oldest) + 1);
  const daysSinceLastCheckIn = Math.max(0, daysBetween(now, newest));

  let streakDays = 1;
  for (let i = dates.length - 1; i > 0; i -= 1) {
    if (daysBetween(dates[i], dates[i - 1]) === 1) streakDays += 1;
    else break;
  }

  return { historyDepthDays, streakDays, daysSinceLastCheckIn };
};

const getFieldValue = (dataSpine: DataSpine, key: string) => {
  const profile = dataSpine.profile as Record<string, unknown>;
  const state = dataSpine.dailyCheckIn as Record<string, unknown>;
  const factors = dataSpine.dailyFactors as Record<string, unknown>;
  if (key in profile) return profile[key];
  if (key in state) return state[key];
  if (key in factors) return factors[key];
  return null;
};

const isFilled = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return true;
  return false;
};

const resolveRegularityFilled = (streakDays: number, historyDepthDays: number) => streakDays >= 2 || historyDepthDays >= 3;

const calcFreshnessScore = (daysSinceLastCheckIn: number, streakDays: number) => {
  if (daysSinceLastCheckIn <= 0) return clamp(93 + Math.min(7, streakDays * 2));
  if (daysSinceLastCheckIn === 1) return clamp(84 + Math.min(8, streakDays * 2));
  if (daysSinceLastCheckIn === 2) return clamp(74 + Math.min(8, streakDays * 1.8));
  const drop = 20 + (daysSinceLastCheckIn - 2) * 9;
  return clamp(86 - drop + Math.min(10, streakDays * 2.6));
};

const calcHistoryDepthScore = (historyDepthDays: number) => {
  if (historyDepthDays >= 60) return 100;
  if (historyDepthDays >= 30) return 82 + ((historyDepthDays - 30) / 30) * 18;
  if (historyDepthDays >= 14) return 64 + ((historyDepthDays - 14) / 16) * 18;
  if (historyDepthDays >= 7) return 46 + ((historyDepthDays - 7) / 7) * 18;
  if (historyDepthDays >= 3) return 30 + ((historyDepthDays - 3) / 4) * 16;
  return historyDepthDays * 10;
};

const calcConsistencyScore = (dataSpine: DataSpine) => {
  const sleepGap = Math.abs(dataSpine.profile.sleepTargetHours - dataSpine.dailyFactors.sleepHours) * 8;
  const focusPressureGap = Math.abs((10 - dataSpine.dailyCheckIn.focus) - (dataSpine.dailyCheckIn.pressure - 1)) * 7;
  const energyRecoveryGap = Math.abs(dataSpine.dailyCheckIn.energy - dataSpine.dailyCheckIn.recovery) * 5;
  const penalty = sleepGap * 0.4 + focusPressureGap * 0.35 + energyRecoveryGap * 0.25;
  return clamp(100 - penalty);
};

export const evaluateConfidence = ({ dataSpine, historyDates, now = new Date() }: ConfidenceInput): ConfidenceSnapshot => {
  const history = getHistoryStats(historyDates, now);

  const fields = CONFIDENCE_FIELDS.filter((field) => field.priority !== 'later').map((field) => ({
    ...field,
    filled: field.key === 'checkinRegularity'
      ? resolveRegularityFilled(history.streakDays, history.historyDepthDays)
      : isFilled(getFieldValue(dataSpine, field.key)),
  }));

  const critical = fields.filter((field) => field.priority === 'critical');
  const recommended = fields.filter((field) => field.priority === 'recommended');

  const completenessScore = clamp(
    ((critical.filter((field) => field.filled).length / critical.length) * 100) * 0.7 +
    ((recommended.filter((field) => field.filled).length / recommended.length) * 100) * 0.3,
  );

  const freshnessScore = calcFreshnessScore(history.daysSinceLastCheckIn, history.streakDays);
  const consistencyScore = calcConsistencyScore(dataSpine);
  const historyDepthScore = calcHistoryDepthScore(history.historyDepthDays);
  const historyDepthStatus = trackHistoryDepth(history.historyDepthDays);

  const globalConfidence = clamp(completenessScore * 0.35 + freshnessScore * 0.25 + consistencyScore * 0.2 + historyDepthScore * 0.2);

  const domainConfidence = (['finance', 'body', 'work', 'goal'] as ConfidenceDomain[]).reduce((acc, domain) => {
    const domainFields = fields.filter((field) => field.domain === domain);
    const domainCompleteness = (domainFields.filter((field) => field.filled).length / domainFields.length) * 100;
    return {
      ...acc,
      [domain]: Math.round(clamp(domainCompleteness * 0.6 + freshnessScore * 0.2 + consistencyScore * 0.2)),
    };
  }, {} as Record<ConfidenceDomain, number>);

  const missing = resolveMissingData(fields, historyDepthStatus.nextUnlock?.daysLeft ?? 0);

  return {
    globalConfidence: Math.round(globalConfidence),
    domainConfidence,
    historyDepthDays: history.historyDepthDays,
    streakDays: history.streakDays,
    freshnessPenalty: Math.round(100 - freshnessScore),
    missingCriticalFields: missing.critical,
    missingRecommendedFields: missing.recommended,
    unlockedFeatures: historyDepthStatus.unlockedFeatures,
    nextUnlock: historyDepthStatus.nextUnlock
      ? { ...historyDepthStatus.nextUnlock, missingForUnlock: missing.forNextUnlock }
      : null,
    completenessScore: Math.round(completenessScore),
    freshnessScore: Math.round(freshnessScore),
    consistencyScore: Math.round(consistencyScore),
    historyDepthScore: Math.round(historyDepthScore),
  };
};
