import { useMemo, useState } from 'react';
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

const MODE_ACTION_LABEL: Record<AppMode, string> = {
  overview: 'Открыть обзор',
  start: 'Вернуться в Старт',
  world: 'Открыть Мир',
  graph: 'Разобрать причины',
  oracle: 'Открыть прогноз',
  settings: 'Открыть настройки',
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

const PRIORITY_LABEL: Record<string, string> = {
  critical: 'Критично',
  recommended: 'Рекомендуется',
  later: 'Позже',
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<Profile>(dataSpine.profile);
  const [checkInForm, setCheckInForm] = useState<DailyCheckIn>(dataSpine.dailyCheckIn);
  const [factorsForm, setFactorsForm] = useState<DailyFactors>(dataSpine.dailyFactors);

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

  const updateScale = (key: keyof DailyCheckIn, value: number) => {
    setCheckInForm((current) => ({ ...current, [key]: value }));
  };

  const submitData = () => {
    onDataSpineChange({ profile: profileForm, dailyCheckIn: checkInForm, dailyFactors: factorsForm });
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
          </header>
          <div className="start-select-list">
            {PRESSURE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === pressureId ? 'active' : ''}
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
        </article>

        <article className="start-module start-module-intent">
          <header>
            <span className="start-module-icon" aria-hidden="true">◎</span>
            <div>
              <p className="start-module-kicker">Блок 2</p>
              <h3>Что хотите получить сейчас</h3>
            </div>
          </header>
          <div className="start-select-list intent">
            {ENTRY_SCENE_OPTIONS.map((option, index) => (
              <button
                key={`${option.label}-${index}`}
                type="button"
                className={option.id === entryModeId ? 'active' : ''}
                onClick={() => setEntryModeId(option.id)}
                title={INTENT_HELP[option.id]}
              >
                <span>{option.label}</span>
                <small>{INTENT_HELP[option.id]}</small>
              </button>
            ))}
          </div>
        </article>

        <div className="start-bottom-row">
          <article className="start-module start-module-horizon">
            <header>
              <span className="start-module-icon" aria-hidden="true">◷</span>
              <div>
                <p className="start-module-kicker">Блок 3</p>
                <h3>Горизонт</h3>
              </div>
            </header>
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
                  {option.label}
                </button>
              ))}
            </div>
          </article>

          <article className="start-module start-module-priority">
            <header>
              <span className="start-module-icon" aria-hidden="true">◉</span>
              <div>
                <p className="start-module-kicker">Блок 4</p>
                <h3>Что сейчас важнее</h3>
              </div>
            </header>
            <div className="start-priority-capsules">
              {TARGETS.map((option) => (
                <button key={option} type="button" className={option === targetFocus ? 'active' : ''} onClick={() => setTargetFocus(option)}>
                  {option}
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="start-console" aria-live="polite" aria-label="Launch console">
        <article className="start-scene-context start-console-header">
          <p className="start-context-kicker">Контекст сцены</p>
          <p><span>Режим</span><strong>{contextModeLabel}</strong></p>
          <p><span>Описание</span><strong>{contextModeSummary}</strong></p>
          <p><span>Якорь</span><strong>{selectedNodeName}</strong></p>
          <p><span>Сцена</span><strong>{selectedPlanetLabel}</strong></p>
          <button type="button" className="start-update-data" onClick={() => setDrawerOpen(true)}>Обновить входные данные</button>
        </article>

        <article className="start-main-dial" aria-label="Главный прибор состояния">
          <div className="dial-shell">
            <div className="dial-ring" style={{ ['--dial-progress' as string]: `${readinessValue}` }} />
            <div className="dial-needle" style={{ transform: `translateX(-50%) rotate(${dialAngle}deg)` }} />
          <div className="dial-core">
              <p>Готовность хода</p>
              <strong>{formatPercent0(readinessValue)}</strong>
            </div>
          </div>
          <div className="dial-legend">
            <p><span>Давление</span><strong>{formatPercent1(pressureValue)}</strong></p>
            <p><span>Риск</span><strong>{formatPercent1(riskValue)}</strong></p>
            <p><span>Устойчивость</span><strong>{formatPercent1(stabilityValue)}</strong></p>
          </div>
        </article>

        <article className="start-secondary-zone">
          <div className="start-meter-grid">
            {[
              { label: 'Давление', value: pressureValue },
              { label: 'Рычаг', value: leverageValue },
              { label: 'Риск', value: riskValue },
              { label: 'Потенциал хода', value: readinessValue },
            ].map((metric) => (
              <div key={metric.label} className="mini-meter">
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
            <span>Для точного прогноза:</span> {missingHighlights}
          </p>
          <p className="start-confidence-next">
            <span>Следующее открытие:</span> {nextUnlockText}
          </p>
        </article>

        <article className="start-console-verdict">
          <p><span>Система видит:</span><strong>{weakPoint}</strong></p>
          <p><span>Главный риск:</span><strong>{nextRisk}</strong></p>
          <p><span>Лучший рычаг:</span><strong>{TARGET_HINT[targetFocus]}</strong></p>
          <p><span>Первый ход:</span><strong>{FIRST_STEP_BY_MODE[suggestedMode]}</strong></p>
          <button type="button" className="start-why-toggle" onClick={() => setShowWhy((state) => !state)}>
            {showWhy ? 'Скрыть почему' : 'Почему система так решила?'}
          </button>
          {showWhy ? <p className="start-why-line">{bestStart}. {INTENT_HELP[entryModeId]}</p> : null}
          <div className="start-launch-row">
            <button
              type="button"
              onClick={() => {
                onLaunchContextChange(launchState);
                onLaunch(suggestedMode);
              }}
            >
              Перейти в рекомендованный режим
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
                {MODE_ACTION_LABEL[mode]}
              </button>
            ))}
          </div>
        </article>

        {drawerOpen ? (
          <aside className="start-data-drawer" aria-label="Обновить входные данные">
            <div className="start-drawer-head">
              <h3>Обновить входные данные</h3>
              <button type="button" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

            <div className="start-drawer-block start-drawer-completeness">
              <p className="start-drawer-title">Статус заполненности по разделам</p>
              {(['profile', 'state', 'factors'] as const).map((section) => {
                const sectionFields = CONFIDENCE_FIELDS.filter((field) => field.section === section);
                const filled = sectionFields.filter((field) => {
                  if (field.key === 'checkinRegularity') return confidence.streakDays >= 2 || confidence.historyDepthDays >= 3;
                  if (field.key === 'heightWeight') return false;
                  const profile = profileForm as Record<string, unknown>;
                  const checkin = checkInForm as Record<string, unknown>;
                  const factors = factorsForm as Record<string, unknown>;
                  const value = field.key in profile ? profile[field.key] : field.key in checkin ? checkin[field.key] : factors[field.key];
                  return typeof value === 'number' ? value > 0 : typeof value === 'string' ? value.trim().length > 0 : typeof value === 'boolean';
                }).length;
                return <p key={section}><span>{SECTION_LABEL[section]}</span><strong>{filled}/{sectionFields.length}</strong></p>;
              })}
              <div className="start-field-hints">
                {CONFIDENCE_FIELDS.map((field) => (
                  <div key={field.key} className="start-field-hint">
                    <p><strong>{field.label}</strong><em>{PRIORITY_LABEL[field.priority]}</em></p>
                    <small>{field.reason}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="start-drawer-block">
              <p className="start-drawer-title">A. Профиль</p>
              <label>Доход в месяц<input type="number" value={profileForm.monthlyIncome} onChange={(e) => setProfileForm((c) => ({ ...c, monthlyIncome: Number(e.target.value) }))} /></label>
              <label>Фикс. расходы<input type="number" value={profileForm.monthlyFixedExpenses} onChange={(e) => setProfileForm((c) => ({ ...c, monthlyFixedExpenses: Number(e.target.value) }))} /></label>
              <label>Резерв<input type="number" value={profileForm.reserveAmount} onChange={(e) => setProfileForm((c) => ({ ...c, reserveAmount: Number(e.target.value) }))} /></label>
              <label>Норма сна (часы)<input type="number" step="0.5" value={profileForm.sleepTargetHours} onChange={(e) => setProfileForm((c) => ({ ...c, sleepTargetHours: Number(e.target.value) }))} /></label>
              <label>База рабочей ёмкости (1-10)<input type="number" min={1} max={10} value={profileForm.workCapacityBaseline} onChange={(e) => setProfileForm((c) => ({ ...c, workCapacityBaseline: Number(e.target.value) }))} /></label>
              <label>Активная цель<input type="text" value={profileForm.activeGoalTitle} onChange={(e) => setProfileForm((c) => ({ ...c, activeGoalTitle: e.target.value }))} /></label>
              <label>Дедлайн цели<input type="date" value={profileForm.activeGoalDeadline} onChange={(e) => setProfileForm((c) => ({ ...c, activeGoalDeadline: e.target.value }))} /></label>
              <label>Цена провала цели<input type="number" value={profileForm.activeGoalFailureCost} onChange={(e) => setProfileForm((c) => ({ ...c, activeGoalFailureCost: Number(e.target.value) }))} /></label>
            </div>

            <div className="start-drawer-block">
              <p className="start-drawer-title">B. Состояние</p>
              {SCALE_FIELDS.map((field) => (
                <div key={field.key} className="scale-control">
                  <p>{field.label}<strong>{checkInForm[field.key]}</strong></p>
                  <input type="range" min={1} max={10} value={checkInForm[field.key]} onChange={(e) => updateScale(field.key, Number(e.target.value))} />
                </div>
              ))}
            </div>

            <div className="start-drawer-block">
              <p className="start-drawer-title">C. Факторы</p>
              <label>Сон (часы)<input type="number" step="0.5" value={factorsForm.sleepHours} onChange={(e) => setFactorsForm((c) => ({ ...c, sleepHours: Number(e.target.value) }))} /></label>
              <label>Неплановые траты<input type="number" value={factorsForm.unplannedSpend} onChange={(e) => setFactorsForm((c) => ({ ...c, unplannedSpend: Number(e.target.value) }))} /></label>
              <div className="workload-segment" role="tablist" aria-label="Уровень нагрузки">
                {(['low', 'medium', 'high'] as WorkloadLevel[]).map((level) => (
                  <button key={level} type="button" className={factorsForm.workloadLevel === level ? 'active' : ''} onClick={() => setFactorsForm((c) => ({ ...c, workloadLevel: level }))}>{level}</button>
                ))}
              </div>
              <label className="toggle-row"><input type="checkbox" checked={factorsForm.hadConflict} onChange={(e) => setFactorsForm((c) => ({ ...c, hadConflict: e.target.checked }))} /> Был конфликт</label>
              <label className="toggle-row"><input type="checkbox" checked={factorsForm.hadWorkout} onChange={(e) => setFactorsForm((c) => ({ ...c, hadWorkout: e.target.checked }))} /> Была тренировка</label>
              <label className="toggle-row"><input type="checkbox" checked={factorsForm.lateCaffeine} onChange={(e) => setFactorsForm((c) => ({ ...c, lateCaffeine: e.target.checked }))} /> Кофеин поздно</label>
            </div>

            <button type="button" className="start-drawer-save" onClick={submitData}>Применить и пересчитать</button>
          </aside>
        ) : null}
      </section>
    </div>
  );
};
