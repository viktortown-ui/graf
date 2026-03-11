import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppMode } from '../../entities/system/modes';
import {
  ENTRY_MODES,
  HORIZONS,
  PRESSURE_OPTIONS,
  TARGETS,
  type EntryModeId,
  type HorizonId,
  type LaunchContext,
  type PressureId,
  type TargetFocusId,
} from '../../app/state/launchContext';
import type { DailyCheckIn, DailyFactors, DataSpine, Profile, WorkloadLevel } from '../../app/state/dataSpine';
import { CONFIDENCE_FIELDS, type ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';


type StartModeProps = {
  selectedNodeId: string;
  selectedNodeName: string;
  selectedPlanetLabel: string;
  contextModeLabel: string;
  contextModeSummary: string;
  launchContext: LaunchContext;
  dataSpine: DataSpine;
  confidence: ConfidenceSnapshot;
  onAnchorChange: (nodeId: string) => void;
  onLaunchContextChange: (context: LaunchContext) => void;
  onDataSpineChange: (payload: { profile: Profile; dailyCheckIn: DailyCheckIn; dailyFactors: DailyFactors }) => void;
  onLaunch: (mode: AppMode) => void;
};

const INTENT_HELP: Record<EntryModeId, string> = {
  fast: 'За 1 шаг вернуть управляемость и снять перегруз.',
  analysis: 'Найти корень, чтобы не бороться с симптомами.',
  forecast: 'Оценить траектории и выбрать самый сильный ход.',
};

const TARGET_HINT: Record<TargetFocusId, string> = {
  'Удержать систему': 'Фиксируем стабильность и держим контур без срывов.',
  'Снизить риск': 'Сначала снимаем то, что может резко ухудшить состояние.',
  'Усилить цель': 'Смещаем ресурс к ключевому результату и ускоряем прогресс.',
  'Восстановить ресурс': 'Возвращаем энергию и рабочий ритм без перегрева.',
};

const MODULE_DETAILS = {
  pressure: 'Показывает главный источник давления — именно от него зависит, куда уйдёт система без вмешательства.',
  intent: 'Фиксирует желаемый результат запуска: не «от чего бежим», а «куда направляем усилие».',
  horizon: 'Горизонт задаёт окно оценки: один и тот же шаг по-разному выглядит на сегодня, неделю и месяц.',
  priority: 'Режим приоритета определяет, что получит ресурс в первую очередь при ограниченной ёмкости.',
} as const;

const ENTRY_SCENE_OPTIONS = [
  { id: 'fast' as const, label: 'Вернуть контроль' },
  { id: 'analysis' as const, label: 'Найти корень проблемы' },
  { id: 'forecast' as const, label: 'Выбрать лучший следующий шаг' },
  { id: 'fast' as const, label: 'Стабилизировать состояние' },
  { id: 'analysis' as const, label: 'Восстановить ресурс' },
];

const PATH_LABEL: Record<AppMode, string> = {
  overview: 'Обзор: синхронизация контура',
  start: 'Повторный запуск в Старт',
  world: 'Мир: стабилизация состояния',
  graph: 'Граф причин: разбор источника давления',
  oracle: 'Прогноз: проверка сценариев',
  settings: 'Настройки',
};

const FIRST_STEP_BY_MODE: Record<AppMode, string> = {
  overview: 'Откройте обзор и подтвердите карту давления.',
  start: 'Обновите ввод и пересчитайте рекомендацию.',
  world: 'Перейдите в Мир и закрепите узел с максимальным напряжением.',
  graph: 'Откройте граф причин и выделите ветку с наибольшим эффектом.',
  oracle: 'Откройте прогноз и сравните базовый и усиленный сценарий.',
  settings: 'Настройте интерфейс под комфорт чтения.',
};

const MODE_SHORT_LABEL: Record<AppMode, string> = {
  overview: 'Обзор',
  start: 'Старт',
  world: 'Мир',
  graph: 'Граф',
  oracle: 'Прогноз',
  settings: 'Настройки',
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round0 = (value: number) => Math.round(value);
const round1 = (value: number) => Math.round(value * 10) / 10;
const formatPercent0 = (value: number) => `${round0(clamp(value))}%`;
const formatPercent1 = (value: number) => `${round1(clamp(value)).toFixed(1)}%`;


const DOMAIN_LABEL: Record<string, string> = {
  finance: 'Финансы',
  body: 'Тело',
  work: 'Работа',
  goal: 'Цель',
};

const SECTION_LABEL: Record<'profile' | 'state' | 'factors', string> = {
  profile: 'Профиль',
  state: 'Состояние',
  factors: 'Факторы',
};

const SCALE_FIELDS: { key: keyof DailyCheckIn; label: string }[] = [
  { key: 'mood', label: 'Настроение' },
  { key: 'energy', label: 'Энергия' },
  { key: 'focus', label: 'Фокус' },
  { key: 'pressure', label: 'Давление' },
  { key: 'recovery', label: 'Восстановление' },
];

const WORKLOAD_LABEL: Record<WorkloadLevel, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
};

type PromptPackId = 'finance' | 'body' | 'work' | 'goal';
type PromptPriority = 1 | 2 | 3 | 4;
type FormSection = 'profile' | 'state' | 'factors';

type PromptPack = {
  id: PromptPackId;
  title: string;
  why: string;
  improves: string;
  fields: string[];
  domain: keyof ConfidenceSnapshot['domainConfidence'];
};

type PromptCard = {
  id: string;
  title: string;
  why: string;
  missing: string[];
  improves: string;
  cta: string;
  priority: PromptPriority;
  section: FormSection;
  fields: string[];
};

const PROMPT_PACKS: PromptPack[] = [
  {
    id: 'finance',
    title: 'Усилим финансовую точность',
    why: 'Не хватает опорных данных для расчёта денежного давления.',
    improves: 'Поднимет finance confidence и точность verdict в Start.',
    fields: ['monthlyIncome', 'monthlyFixedExpenses', 'reserveAmount'],
    domain: 'finance',
  },
  {
    id: 'body',
    title: 'Усилим телесный контур',
    why: 'Сон и восстановление пока неполные, прогноз ресурса шумный.',
    improves: 'Точнее покажет риск перегруза и устойчивость на день.',
    fields: ['sleepTargetHours', 'sleepHours', 'energy', 'recovery'],
    domain: 'body',
  },
  {
    id: 'work',
    title: 'Закроем рабочий мини-пакет',
    why: 'Не хватает baseline нагрузки для оценки рабочей ёмкости.',
    improves: 'Уточнит work confidence и рекомендацию первого хода.',
    fields: ['workCapacityBaseline', 'workloadLevel', 'focus', 'pressure'],
    domain: 'work',
  },
  {
    id: 'goal',
    title: 'Уточним контур цели',
    why: 'Для прогноза по цели не хватает ключевых параметров.',
    improves: 'Сделает прогноз по цели и цене ошибки заметно точнее.',
    fields: ['activeGoalTitle', 'activeGoalDeadline', 'activeGoalFailureCost'],
    domain: 'goal',
  },
];

export const StartMode = ({
  selectedNodeId,
  selectedNodeName,
  selectedPlanetLabel,
  contextModeLabel,
  contextModeSummary,
  launchContext,
  dataSpine,
  confidence,
  onAnchorChange,
  onLaunchContextChange,
  onDataSpineChange,
  onLaunch,
}: StartModeProps) => {
  const [pressureId, setPressureId] = useState<PressureId>(launchContext.pressureId);
  const [entryModeId, setEntryModeId] = useState<EntryModeId>(launchContext.entryModeId);
  const [horizonId, setHorizonId] = useState<HorizonId>(launchContext.horizonId);
  const [targetFocus, setTargetFocus] = useState<TargetFocusId>(launchContext.targetFocus);
  const [showWhy, setShowWhy] = useState(false);
  const [openHint, setOpenHint] = useState<keyof typeof MODULE_DETAILS | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerSection, setActiveDrawerSection] = useState<FormSection>('profile');
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [dismissedPromptIds, setDismissedPromptIds] = useState<string[]>([]);
  const [profileForm, setProfileForm] = useState<Profile>(dataSpine.profile);
  const [checkInForm, setCheckInForm] = useState<DailyCheckIn>(dataSpine.dailyCheckIn);
  const [factorsForm, setFactorsForm] = useState<DailyFactors>(dataSpine.dailyFactors);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const selectedPressure = useMemo(
    () => PRESSURE_OPTIONS.find((option) => option.id === pressureId) ?? PRESSURE_OPTIONS[0],
    [pressureId],
  );
  const selectedEntryMode = useMemo(
    () => ENTRY_MODES.find((option) => option.id === entryModeId) ?? ENTRY_MODES[0],
    [entryModeId],
  );
  const selectedHorizon = useMemo(() => HORIZONS.find((option) => option.id === horizonId) ?? HORIZONS[0], [horizonId]);

  const suggestedMode = useMemo(() => {
    const { pressureValue, riskValue, readinessValue } = dataSpine.derived;
    if (riskValue > 68 || pressureValue > 70) return 'world';
    if (entryModeId === 'analysis') return 'graph';
    if (entryModeId === 'forecast') return 'oracle';
    if (readinessValue < 40) return 'world';
    return selectedEntryMode.id === 'fast' ? selectedPressure.recommendedMode : selectedEntryMode.recommendedMode;
  }, [dataSpine.derived, entryModeId, selectedEntryMode, selectedPressure]);

  const launchState: LaunchContext = { pressureId, entryModeId, horizonId, targetFocus };

  const pressureValue = clamp(round1(dataSpine.derived.pressureValue));
  const riskValue = clamp(round1(dataSpine.derived.riskValue));
  const stabilityValue = clamp(round1(dataSpine.derived.stabilityValue));
  const readinessValue = clamp(round1(dataSpine.derived.readinessValue));
  const leverageValue = clamp(round1(dataSpine.derived.leverageValue));
  const movePotential = clamp(round1((readinessValue * 0.64) + (leverageValue * 0.36)));
  const errorCostValue = clamp(round1((riskValue * 0.55) + (pressureValue * 0.45)));

  const nextRisk = `${selectedPressure.risk} на горизонте ${selectedHorizon.label.toLowerCase()}.`;
  const bestStart = PATH_LABEL[suggestedMode];
  const weakPoint =
    selectedPressure.anchorNodeId === selectedNodeId
      ? `${selectedNodeName} уже держит главный удар.`
      : `${selectedNodeName} вне центра внимания, риск уходит в «${selectedPressure.label.toLowerCase()}».`;

  const dialAngle = -120 + (readinessValue / 100) * 240;
  const missingHighlights = confidence.missingCriticalFields.length
    ? confidence.missingCriticalFields.slice(0, 3).map((field) => field.replace(/\s*\([^)]*\)/g, '')).join(', ')
    : 'критичные поля заполнены';
  const nextUnlockText = confidence.nextUnlock
    ? `${confidence.nextUnlock.title} через ${confidence.nextUnlock.daysLeft} дн.`
    : 'все уровни истории уже открыты';
  const readinessState = readinessValue >= 70 ? 'Готов к запуску' : readinessValue >= 45 ? 'Нужен точный первый ход' : 'Сначала стабилизация';
  const confidenceState = confidence.globalConfidence >= 70 ? 'доверие устойчивое' : confidence.globalConfidence >= 45 ? 'доверие среднее' : 'доверие низкое';

  const confidenceFieldByKey = useMemo(
    () => Object.fromEntries(CONFIDENCE_FIELDS.map((field) => [field.key, field])),
    [],
  );
  const confidenceFieldByLabel = useMemo(
    () => Object.fromEntries(CONFIDENCE_FIELDS.map((field) => [field.label, field])),
    [],
  );

  const fieldValues = useMemo(
    () => ({ ...profileForm, ...checkInForm, ...factorsForm } as Record<string, unknown>),
    [profileForm, checkInForm, factorsForm],
  );

  const isFieldFilled = useCallback((key: string) => {
    if (key === 'checkinRegularity') return confidence.streakDays >= 2 || confidence.historyDepthDays >= 3;
    if (key === 'heightWeight') return false;
    const value = fieldValues[key];
    if (typeof value === 'number') return Number.isFinite(value) && value > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'boolean') return true;
    return false;
  }, [fieldValues, confidence.streakDays, confidence.historyDepthDays]);

  const weakDomain = useMemo(
    () => (Object.entries(confidence.domainConfidence) as [keyof ConfidenceSnapshot['domainConfidence'], number][])
      .sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'finance',
    [confidence.domainConfidence],
  );

  const missingCriticalKeys = useMemo(
    () => CONFIDENCE_FIELDS.filter((field) => field.priority === 'critical' && !isFieldFilled(field.key)).map((field) => field.key),
    [isFieldFilled],
  );

  const missingRecommendedKeys = useMemo(
    () => CONFIDENCE_FIELDS.filter((field) => field.priority === 'recommended' && !isFieldFilled(field.key)).map((field) => field.key),
    [isFieldFilled],
  );

  const nextUnlockKeys = useMemo(
    () => (confidence.nextUnlock?.missingForUnlock ?? []).map((label) => confidenceFieldByLabel[label]?.key).filter(Boolean) as string[],
    [confidence.nextUnlock, confidenceFieldByLabel],
  );

  const promptCards = useMemo<PromptCard[]>(() => {
    const cards: PromptCard[] = [];
    PROMPT_PACKS.forEach((pack) => {
      const missing = pack.fields.filter((key) => !isFieldFilled(key)).slice(0, 3);
      if (!missing.length) return;
      const hasCritical = missing.some((key) => missingCriticalKeys.includes(key));
      const hasUnlock = missing.some((key) => nextUnlockKeys.includes(key));
      const hasRecommended = missing.some((key) => missingRecommendedKeys.includes(key));
      const priority: PromptPriority =
        hasCritical && pack.domain === weakDomain ? 1 :
        hasUnlock ? 2 :
        hasCritical ? 3 :
        hasRecommended ? 4 : 4;
      const section = confidenceFieldByKey[missing[0]]?.section ?? 'profile';
      cards.push({
        id: `pack-${pack.id}`,
        title: pack.title,
        why: pack.why,
        missing: missing.map((key) => confidenceFieldByKey[key]?.label ?? key),
        improves: pack.improves,
        cta: 'Добавить сейчас',
        priority,
        section,
        fields: missing,
      });
    });
    if (confidence.nextUnlock?.daysLeft) {
      cards.push({
        id: 'next-unlock-checkins',
        title: 'Откроем следующий слой истории',
        why: `До ${confidence.nextUnlock.title.toLowerCase()} не хватает ${confidence.nextUnlock.daysLeft} дн. check-in.`,
        missing: ['Регулярность check-in'],
        improves: 'Усилит уверенность по тренду и откроет следующий unlock.',
        cta: 'Добавить сейчас',
        priority: 2,
        section: 'state',
        fields: [],
      });
    }
    return cards.sort((a, b) => a.priority - b.priority);
  }, [isFieldFilled, weakDomain, missingCriticalKeys, missingRecommendedKeys, nextUnlockKeys, confidenceFieldByKey, confidence.nextUnlock]);

  const visiblePromptCards = promptCards.filter((card) => !dismissedPromptIds.includes(card.id)).slice(0, 2);

  const registerFieldRef = (key: string) => (node: HTMLElement | null) => {
    fieldRefs.current[key] = node;
  };

  const openDrawerForPack = (card: PromptCard) => {
    setDrawerOpen(true);
    setActiveDrawerSection(card.section);
    setHighlightedFields(card.fields);
  };

  useEffect(() => {
    if (!drawerOpen || !highlightedFields.length) return;
    const focusTarget = fieldRefs.current[highlightedFields[0]];
    if (focusTarget && 'focus' in focusTarget) {
      window.setTimeout(() => {
        (focusTarget as HTMLElement).focus();
      }, 60);
    }
  }, [drawerOpen, highlightedFields]);

  const updateScale = (key: keyof DailyCheckIn, value: number) => {
    setCheckInForm((current) => ({ ...current, [key]: value }));
  };

  const submitData = () => {
    onDataSpineChange({ profile: profileForm, dailyCheckIn: checkInForm, dailyFactors: factorsForm });
    setHighlightedFields([]);
    setDismissedPromptIds([]);
    setDrawerOpen(false);
  };

  return (
    <div className="start-mode">
      <section className="start-input-column" aria-label="Входные условия запуска">
        <article className="start-module start-module-pressure">
          <header>
            <span className="start-module-icon" aria-hidden="true">⌁</span>
            <div>
              <p className="start-module-kicker">Блок 1</p>
              <h3>Что мешает сильнее всего</h3>
            </div>
            <button type="button" className="start-module-info" aria-label="Пояснение к блоку проблемы" onClick={() => setOpenHint((current) => current === 'pressure' ? null : 'pressure')}>?</button>
          </header>
          <p className="start-module-helper">Выберите главный источник давления, который перехватывает управление прямо сейчас.</p>
          {openHint === 'pressure' ? <p className="start-module-detail">{MODULE_DETAILS.pressure}</p> : null}
          <div className="start-select-list">
            {PRESSURE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === pressureId ? 'active' : ''}
                aria-pressed={option.id === pressureId}
                onClick={() => {
                  setPressureId(option.id);
                  onAnchorChange(option.anchorNodeId);
                }}
              >
                <span>{option.label}</span>
                <small>{option.risk}</small>
              </button>
            ))}
          </div>
          <p className="start-active-line pressure">Главное давление: <strong>{selectedPressure.label}</strong> · {selectedPressure.risk}.</p>
        </article>

        <article className="start-module start-module-intent">
          <header>
            <span className="start-module-icon" aria-hidden="true">◎</span>
            <div>
              <p className="start-module-kicker">Блок 2</p>
              <h3>Что хотите получить сейчас</h3>
            </div>
            <button type="button" className="start-module-info" aria-label="Пояснение к блоку цели" onClick={() => setOpenHint((current) => current === 'intent' ? null : 'intent')}>?</button>
          </header>
          <p className="start-module-helper">Зафиксируйте намерение запуска: к какому результату ведёте систему в этом цикле.</p>
          {openHint === 'intent' ? <p className="start-module-detail">{MODULE_DETAILS.intent}</p> : null}
          <div className="start-select-list intent">
            {ENTRY_SCENE_OPTIONS.map((option, index) => (
              <button
                key={`${option.label}-${index}`}
                type="button"
                className={option.id === entryModeId ? 'active' : ''}
                aria-pressed={option.id === entryModeId}
                onClick={() => setEntryModeId(option.id)}
                title={INTENT_HELP[option.id]}
              >
                <span>{option.label}</span>
                <small>{INTENT_HELP[option.id]}</small>
              </button>
            ))}
          </div>
          <p className="start-active-line intent">Текущий вектор: <strong>{selectedEntryMode.label}</strong>.</p>
        </article>

        <div className="start-bottom-row">
          <article className="start-module start-module-horizon">
            <header>
              <span className="start-module-icon" aria-hidden="true">◷</span>
              <div>
                <p className="start-module-kicker">Блок 3</p>
                <h3>Горизонт</h3>
              </div>
              <button type="button" className="start-module-info" aria-label="Пояснение к горизонту" onClick={() => setOpenHint((current) => current === 'horizon' ? null : 'horizon')}>?</button>
            </header>
            <p className="start-module-helper">Окно оценки результата: когда вы хотите увидеть эффект первого хода.</p>
            {openHint === 'horizon' ? <p className="start-module-detail">{MODULE_DETAILS.horizon}</p> : null}
            <div className="start-segmented" role="tablist" aria-label="Горизонт запуска">
              {HORIZONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={option.id === horizonId}
                  className={option.id === horizonId ? 'active' : ''}
                  onClick={() => setHorizonId(option.id)}
                >
                  <span>{option.label}</span>
                  <small>{option.oracleHorizon} шага</small>
                </button>
              ))}
            </div>
            <p className="start-active-line horizon">Смотрим на горизонт: <strong>{selectedHorizon.label}</strong>.</p>
          </article>

          <article className="start-module start-module-priority">
            <header>
              <span className="start-module-icon" aria-hidden="true">◉</span>
              <div>
                <p className="start-module-kicker">Блок 4</p>
                <h3>Что сейчас важнее</h3>
              </div>
              <button type="button" className="start-module-info" aria-label="Пояснение к режиму приоритета" onClick={() => setOpenHint((current) => current === 'priority' ? null : 'priority')}>?</button>
            </header>
            <p className="start-module-helper">Режим распределения ресурса: что система должна защищать в первую очередь.</p>
            {openHint === 'priority' ? <p className="start-module-detail">{MODULE_DETAILS.priority}</p> : null}
            <div className="start-priority-capsules">
              {TARGETS.map((option) => (
                <button key={option} type="button" className={option === targetFocus ? 'active' : ''} aria-pressed={option === targetFocus} onClick={() => setTargetFocus(option)}>
                  <span>{option}</span>
                </button>
              ))}
            </div>
            <p className="start-active-line priority">Приоритет режима: <strong>{targetFocus}</strong>.</p>
          </article>
        </div>
      </section>

      <section className="start-console" aria-live="polite" aria-label="Launch console">
        <article className="start-scene-context start-console-header">
          <p className="start-context-kicker">Контекст сцены</p>
          <p><span>Режим</span><strong>{contextModeLabel}</strong></p>
          <p><span>Контур</span><strong>{selectedPlanetLabel} · {contextModeSummary}</strong></p>
          <p><span>Проблема</span><strong>{selectedPressure.label}</strong></p>
          <p><span>Цель</span><strong>{selectedEntryMode.label}</strong></p>
          <p><span>Горизонт</span><strong>{selectedHorizon.label}</strong></p>
          <p><span>Приоритет</span><strong>{targetFocus}</strong></p>
          <button type="button" className="start-update-data" onClick={() => { setDrawerOpen(true); setActiveDrawerSection('profile'); setHighlightedFields([]); }}>Обновить входные данные</button>
        </article>

        <article className="start-main-dial" aria-label="Главный прибор состояния">
          <div className="dial-shell">
            <div className="dial-ring" style={{ ['--dial-progress' as string]: `${readinessValue}` }} />
            <div className="dial-needle" style={{ transform: `translateX(-50%) rotate(${dialAngle}deg)` }} />
          <div className="dial-core">
              <p>Readiness</p>
              <strong>{formatPercent0(readinessValue)}</strong>
              <small>{readinessState}</small>
            </div>
          </div>
          <div className="dial-legend">
            <p><span>Контур сейчас</span><strong>{readinessState}</strong></p>
            <p><span>Доверие модели</span><strong>{confidenceState}</strong></p>
            <p><span>Ядро напряжения</span><strong>{selectedNodeName}</strong></p>
          </div>
        </article>

        <article className="start-secondary-zone">
          <div className="start-meter-grid">
            {[
              { label: 'Давление', value: pressureValue, tone: 'alert' },
              { label: 'Риск', value: riskValue, tone: 'alert' },
              { label: 'Устойчивость', value: stabilityValue, tone: 'good' },
              { label: 'Рычаг', value: leverageValue, tone: 'good' },
              { label: 'Потенциал хода', value: movePotential, tone: 'good' },
              { label: 'Цена ошибки', value: errorCostValue, tone: 'alert' },
            ].map((metric) => (
              <div key={metric.label} className={`mini-meter ${metric.tone}`}>
                <p>{metric.label}</p>
                <div className="mini-meter-track"><span style={{ width: `${metric.value}%` }} /></div>
                <strong>{formatPercent1(metric.value)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="start-confidence-zone">
          <div className="start-confidence-head">
            <p>Уверенность модели</p>
            <strong>{formatPercent0(confidence.globalConfidence)}</strong>
          </div>
          <div className="mini-meter-track"><span style={{ width: `${confidence.globalConfidence}%` }} /></div>
          <p className="start-confidence-note">Текущий уровень: <strong>{confidenceState}</strong>.</p>
          <div className="start-confidence-domains">
            {(Object.entries(confidence.domainConfidence) as [keyof typeof confidence.domainConfidence, number][]).map(([domain, value]) => (
              <div key={domain} className="mini-meter">
                <p>{DOMAIN_LABEL[domain]}</p>
                <div className="mini-meter-track"><span style={{ width: `${value}%` }} /></div>
                <strong>{formatPercent0(value)}</strong>
              </div>
            ))}
          </div>
          <p className="start-confidence-missing">
            <span>Для точного прогноза не хватает:</span> {missingHighlights}
          </p>
          <p className="start-confidence-next">
            <span>Следующее открытие:</span> {nextUnlockText}
          </p>
          {visiblePromptCards.length ? (
            <div className="start-prompt-list" aria-label="Адаптивные дозапросы">
              {visiblePromptCards.map((card) => (
                <article key={card.id} className="start-micro-prompt-card">
                  <h4>{card.title}</h4>
                  <p>{card.why}</p>
                  <p><span>Не хватает:</span> {card.missing.join(', ')}</p>
                  <small>{card.improves}</small>
                  <div className="start-micro-prompt-actions">
                    <button type="button" onClick={() => openDrawerForPack(card)}>{card.cta}</button>
                    <button type="button" className="ghost" onClick={() => setDismissedPromptIds((current) => [...current, card.id])}>Позже</button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </article>

        <article className="start-mini-scene" aria-label="Проблема ядро ход">
          <span className="mini-scene-line" aria-hidden="true" />
          <div className="mini-scene-node">
            <p>Проблема</p>
            <strong>{selectedPressure.label}</strong>
          </div>
          <div className="mini-scene-node core">
            <p>Ядро</p>
            <strong>{selectedNodeName}</strong>
          </div>
          <div className="mini-scene-node action">
            <p>Первый ход</p>
            <strong>{MODE_SHORT_LABEL[suggestedMode]}</strong>
          </div>
        </article>

        <article className="start-console-verdict">
          <p><span>Вердикт:</span><strong>{weakPoint}</strong></p>
          <p><span>Главный риск:</span><strong>{nextRisk}</strong></p>
          <p><span>Рычаг:</span><strong>{TARGET_HINT[targetFocus]}</strong></p>
          <p><span>Первый ход:</span><strong>{FIRST_STEP_BY_MODE[suggestedMode]}</strong></p>
          <button type="button" className="start-why-toggle" onClick={() => setShowWhy((state) => !state)}>
            {showWhy ? 'Скрыть почему' : 'Почему система так решила?'}
          </button>
          {showWhy ? <p className="start-why-line">{bestStart}. {INTENT_HELP[entryModeId]}</p> : null}
          <div className="start-launch-row">
            <button
              className="primary"
              type="button"
              onClick={() => {
                onLaunchContextChange(launchState);
                onLaunch(suggestedMode);
              }}
            >
              Запустить: {MODE_SHORT_LABEL[suggestedMode]}
            </button>
            {(['world', 'graph', 'oracle'] as AppMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className="ghost"
                onClick={() => {
                  onLaunchContextChange(launchState);
                  onLaunch(mode);
                }}
              >
                {MODE_SHORT_LABEL[mode]}
              </button>
            ))}
          </div>
        </article>

        {drawerOpen ? (
          <aside className="start-data-drawer" aria-label="Обновить входные данные">
            <div className="start-drawer-head">
              <div>
                <h3>Обновить входные данные</h3>
                <p>
                  Заполнено {CONFIDENCE_FIELDS.filter((field) => field.priority !== 'later' && isFieldFilled(field.key)).length}/
                  {CONFIDENCE_FIELDS.filter((field) => field.priority !== 'later').length} полей · критично: {missingCriticalKeys.length}
                </p>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

            <div className="start-drawer-summary">
              <p><span>Сильнее улучшит точность:</span><strong>{promptCards[0]?.missing[0] ?? 'Критичные поля закрыты'}</strong></p>
              <p><span>До unlock:</span><strong>{nextUnlockText}</strong></p>
            </div>

            <div className="start-drawer-sections" role="tablist" aria-label="Секции drawer">
              {(['profile', 'state', 'factors'] as const).map((section) => (
                <button
                  key={section}
                  type="button"
                  className={activeDrawerSection === section ? 'active' : ''}
                  onClick={() => setActiveDrawerSection(section)}
                >
                  {SECTION_LABEL[section]}
                </button>
              ))}
            </div>

            <div className="start-drawer-block start-drawer-completeness">
              <p className="start-drawer-title">Статус заполненности по разделам</p>
              {(['profile', 'state', 'factors'] as const).map((section) => {
                const sectionFields = CONFIDENCE_FIELDS.filter((field) => field.section === section);
                const filled = sectionFields.filter((field) => isFieldFilled(field.key)).length;
                return <p key={section}><span>{SECTION_LABEL[section]}</span><strong>{filled}/{sectionFields.length}</strong></p>;
              })}
            </div>

            {activeDrawerSection === 'profile' ? (
              <div className="start-drawer-block">
                <p className="start-drawer-title">Профиль</p>
                <label className={highlightedFields.includes('monthlyIncome') ? 'field-highlight' : ''}>Доход в месяц
                  <input ref={registerFieldRef('monthlyIncome')} type="number" value={profileForm.monthlyIncome} onChange={(e) => setProfileForm((c) => ({ ...c, monthlyIncome: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Улучшает finance confidence</small>
                </label>
                <label className={highlightedFields.includes('monthlyFixedExpenses') ? 'field-highlight' : ''}>Фикс. расходы
                  <input ref={registerFieldRef('monthlyFixedExpenses')} type="number" value={profileForm.monthlyFixedExpenses} onChange={(e) => setProfileForm((c) => ({ ...c, monthlyFixedExpenses: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Уточняет денежное давление</small>
                </label>
                <label className={highlightedFields.includes('reserveAmount') ? 'field-highlight' : ''}>Резерв
                  <input ref={registerFieldRef('reserveAmount')} type="number" value={profileForm.reserveAmount} onChange={(e) => setProfileForm((c) => ({ ...c, reserveAmount: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Снижает неопределённость риска</small>
                </label>
                <label className={highlightedFields.includes('sleepTargetHours') ? 'field-highlight' : ''}>Норма сна (часы)
                  <input ref={registerFieldRef('sleepTargetHours')} type="number" step="0.5" value={profileForm.sleepTargetHours} onChange={(e) => setProfileForm((c) => ({ ...c, sleepTargetHours: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Усиливает телесный контур</small>
                </label>
                <label className={highlightedFields.includes('workCapacityBaseline') ? 'field-highlight' : ''}>База рабочей ёмкости (1-10)
                  <input ref={registerFieldRef('workCapacityBaseline')} type="number" min={1} max={10} value={profileForm.workCapacityBaseline} onChange={(e) => setProfileForm((c) => ({ ...c, workCapacityBaseline: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Калибрует рабочую нагрузку</small>
                </label>
                <label className={highlightedFields.includes('activeGoalTitle') ? 'field-highlight' : ''}>Активная цель
                  <input ref={registerFieldRef('activeGoalTitle')} type="text" value={profileForm.activeGoalTitle} onChange={(e) => setProfileForm((c) => ({ ...c, activeGoalTitle: e.target.value }))} />
                  <small className="start-impact-hint">Уточняет направление оптимизации</small>
                </label>
                <label className={highlightedFields.includes('activeGoalDeadline') ? 'field-highlight' : ''}>Дедлайн цели
                  <input ref={registerFieldRef('activeGoalDeadline')} type="date" value={profileForm.activeGoalDeadline} onChange={(e) => setProfileForm((c) => ({ ...c, activeGoalDeadline: e.target.value }))} />
                  <small className="start-impact-hint">Даёт горизонт прогноза</small>
                </label>
                <label className={highlightedFields.includes('activeGoalFailureCost') ? 'field-highlight' : ''}>Цена провала цели
                  <input ref={registerFieldRef('activeGoalFailureCost')} type="number" value={profileForm.activeGoalFailureCost} onChange={(e) => setProfileForm((c) => ({ ...c, activeGoalFailureCost: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Уточняет verdict и цену ошибки</small>
                </label>
              </div>
            ) : null}

            {activeDrawerSection === 'state' ? (
              <div className="start-drawer-block">
                <p className="start-drawer-title">Состояние</p>
                {SCALE_FIELDS.map((field) => (
                  <div key={field.key} className={`scale-control ${highlightedFields.includes(field.key) ? 'field-highlight' : ''}`}>
                    <p>{field.label}<strong>{checkInForm[field.key]}</strong></p>
                    <input ref={registerFieldRef(field.key)} type="range" min={1} max={10} value={checkInForm[field.key]} onChange={(e) => updateScale(field.key, Number(e.target.value))} />
                    <small className="start-impact-hint">Повышает точность дневного контура</small>
                  </div>
                ))}
              </div>
            ) : null}

            {activeDrawerSection === 'factors' ? (
              <div className="start-drawer-block">
                <p className="start-drawer-title">Факторы</p>
                <label className={highlightedFields.includes('sleepHours') ? 'field-highlight' : ''}>Сон (часы)
                  <input ref={registerFieldRef('sleepHours')} type="number" step="0.5" value={factorsForm.sleepHours} onChange={(e) => setFactorsForm((c) => ({ ...c, sleepHours: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Уточняет восстановление</small>
                </label>
                <label className={highlightedFields.includes('unplannedSpend') ? 'field-highlight' : ''}>Неплановые траты
                  <input ref={registerFieldRef('unplannedSpend')} type="number" value={factorsForm.unplannedSpend} onChange={(e) => setFactorsForm((c) => ({ ...c, unplannedSpend: Number(e.target.value) }))} />
                  <small className="start-impact-hint">Уточняет краткосрочный финансовый риск</small>
                </label>
                <div className={`workload-segment ${highlightedFields.includes('workloadLevel') ? 'field-highlight' : ''}`} role="tablist" aria-label="Уровень нагрузки">
                  {(['low', 'medium', 'high'] as WorkloadLevel[]).map((level) => (
                    <button key={level} ref={level === 'low' ? registerFieldRef('workloadLevel') : undefined} type="button" className={factorsForm.workloadLevel === level ? 'active' : ''} onClick={() => setFactorsForm((c) => ({ ...c, workloadLevel: level }))}>{WORKLOAD_LABEL[level]}</button>
                  ))}
                </div>
                <label className="toggle-row"><input type="checkbox" checked={factorsForm.hadConflict} onChange={(e) => setFactorsForm((c) => ({ ...c, hadConflict: e.target.checked }))} /> Был конфликт</label>
                <label className="toggle-row"><input type="checkbox" checked={factorsForm.hadWorkout} onChange={(e) => setFactorsForm((c) => ({ ...c, hadWorkout: e.target.checked }))} /> Была тренировка</label>
                <label className="toggle-row"><input type="checkbox" checked={factorsForm.lateCaffeine} onChange={(e) => setFactorsForm((c) => ({ ...c, lateCaffeine: e.target.checked }))} /> Кофеин поздно</label>
              </div>
            ) : null}

            <button type="button" className="start-drawer-save" onClick={submitData}>Применить и пересчитать</button>
          </aside>
        ) : null}
      </section>
    </div>
  );
};
