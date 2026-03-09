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

type StartModeProps = {
  selectedNodeId: string;
  selectedNodeName: string;
  selectedPlanetLabel: string;
  launchContext: LaunchContext;
  onAnchorChange: (nodeId: string) => void;
  onLaunchContextChange: (context: LaunchContext) => void;
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

const PRESSURE_HELP: Record<PressureId, string> = {
  load: 'Слишком много задач и обязательств на текущий ресурс.',
  'energy-drop': 'Энергии не хватает даже на важное.',
  'attention-drift': 'Сложно удерживать внимание и темп.',
  money: 'Расходы и обязательства мешают действовать спокойно.',
  'goal-slip': 'Есть риск сорвать результат или срок.',
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
  { id: 'fast' as const, label: 'Вернуть контроль', tone: 'stabilize' },
  { id: 'analysis' as const, label: 'Найти корень проблемы', tone: 'analyze' },
  { id: 'forecast' as const, label: 'Выбрать лучший следующий шаг', tone: 'trajectory' },
  { id: 'fast' as const, label: 'Стабилизировать состояние', tone: 'stabilize' },
  { id: 'analysis' as const, label: 'Восстановить ресурс', tone: 'recover' },
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

const PRESSURE_SCORE: Record<PressureId, number> = {
  load: 88,
  'energy-drop': 72,
  'attention-drift': 66,
  money: 74,
  'goal-slip': 81,
};

const HORIZON_FACTOR: Record<HorizonId, number> = {
  today: 1,
  week: 0.92,
  month: 0.84,
};

const TARGET_SHIFT: Record<TargetFocusId, number> = {
  'Удержать систему': 4,
  'Снизить риск': 10,
  'Усилить цель': -6,
  'Восстановить ресурс': 7,
};

const ENTRY_SHIFT: Record<EntryModeId, number> = {
  fast: 8,
  analysis: 2,
  forecast: -4,
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const StartMode = ({
  selectedNodeId,
  selectedNodeName,
  selectedPlanetLabel,
  launchContext,
  onAnchorChange,
  onLaunchContextChange,
  onLaunch,
}: StartModeProps) => {
  const [pressureId, setPressureId] = useState<PressureId>(launchContext.pressureId);
  const [entryModeId, setEntryModeId] = useState<EntryModeId>(launchContext.entryModeId);
  const [horizonId, setHorizonId] = useState<HorizonId>(launchContext.horizonId);
  const [targetFocus, setTargetFocus] = useState<TargetFocusId>(launchContext.targetFocus);
  const [showWhy, setShowWhy] = useState(false);

  const selectedPressure = useMemo(
    () => PRESSURE_OPTIONS.find((option) => option.id === pressureId) ?? PRESSURE_OPTIONS[0],
    [pressureId],
  );
  const selectedEntryMode = useMemo(
    () => ENTRY_MODES.find((option) => option.id === entryModeId) ?? ENTRY_MODES[0],
    [entryModeId],
  );
  const selectedHorizon = useMemo(() => HORIZONS.find((option) => option.id === horizonId) ?? HORIZONS[0], [horizonId]);

  const suggestedMode = selectedEntryMode.id === 'fast' ? selectedPressure.recommendedMode : selectedEntryMode.recommendedMode;
  const launchState: LaunchContext = { pressureId, entryModeId, horizonId, targetFocus };

  const pressureValue = clamp(PRESSURE_SCORE[pressureId] * HORIZON_FACTOR[horizonId]);
  const riskValue = clamp(pressureValue + TARGET_SHIFT[targetFocus] + ENTRY_SHIFT[entryModeId]);
  const stabilityValue = clamp(100 - riskValue + (targetFocus === 'Восстановить ресурс' ? 10 : 0));
  const readinessValue = clamp(100 - pressureValue + (entryModeId === 'fast' ? 15 : 6));
  const leverageValue = clamp((stabilityValue + readinessValue) / 2 + (entryModeId === 'analysis' ? 8 : 0));
  const errorCostValue = clamp(riskValue - (horizonId === 'month' ? 8 : 0));

  const mainProblem = selectedPressure.label;
  const nextRisk = `${selectedPressure.risk} на горизонте ${selectedHorizon.label.toLowerCase()}.`;
  const bestStart = PATH_LABEL[suggestedMode];
  const weakPoint =
    selectedPressure.anchorNodeId === selectedNodeId
      ? `${selectedNodeName} уже держит главный удар.`
      : `${selectedNodeName} вне центра внимания, риск уходит в «${selectedPressure.label.toLowerCase()}».`;

  const dialAngle = -120 + (readinessValue / 100) * 240;

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
                <small>{PRESSURE_HELP[option.id]}</small>
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
                <button
                  key={option}
                  type="button"
                  className={option === targetFocus ? 'active' : ''}
                  onClick={() => setTargetFocus(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="start-console" aria-live="polite" aria-label="Launch console">
        <article className="start-scene-context">
          <p><span>Проблема</span><strong>{mainProblem}</strong></p>
          <p><span>Цель</span><strong>{selectedEntryMode.label}</strong></p>
          <p><span>Горизонт</span><strong>{selectedHorizon.label}</strong></p>
          <p><span>Приоритет</span><strong>{targetFocus}</strong></p>
          <p><span>Сцена</span><strong>{selectedPlanetLabel}</strong></p>
        </article>

        <article className="start-main-dial" aria-label="Главный прибор состояния">
          <div className="dial-shell">
            <div className="dial-ring" style={{ ['--dial-progress' as string]: `${readinessValue}` }} />
            <div className="dial-needle" style={{ transform: `translateX(-50%) rotate(${dialAngle}deg)` }} />
            <div className="dial-core">
              <p>Готовность хода</p>
              <strong>{readinessValue}%</strong>
            </div>
          </div>
          <div className="dial-legend">
            <p><span>Давление</span><strong>{pressureValue}%</strong></p>
            <p><span>Риск</span><strong>{riskValue}%</strong></p>
            <p><span>Устойчивость</span><strong>{stabilityValue}%</strong></p>
          </div>
        </article>

        <article className="start-secondary-zone">
          <div className="start-meter-grid">
            {[
              { label: 'Давление', value: pressureValue },
              { label: 'Рычаг', value: leverageValue },
              { label: 'Цена ошибки', value: errorCostValue },
              { label: 'Потенциал хода', value: readinessValue },
            ].map((metric) => (
              <div key={metric.label} className="mini-meter">
                <p>{metric.label}</p>
                <div className="mini-meter-track"><span style={{ width: `${metric.value}%` }} /></div>
                <strong>{metric.value}%</strong>
              </div>
            ))}
          </div>
          <div className="start-mini-scene" aria-label="Мини-сцена запуска">
            <div className="mini-scene-line" />
            <div className="mini-scene-node input">Проблема</div>
            <div className="mini-scene-node core">Ядро</div>
            <div className="mini-scene-node output">Ход</div>
          </div>
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
      </section>
    </div>
  );
};
