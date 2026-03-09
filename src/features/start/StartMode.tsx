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
  start: 'Вернуться в Старт',
  world: 'Открыть Мир',
  graph: 'Разобрать причины',
  oracle: 'Перейти в прогноз',
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
  fast: 'За 1 шаг получить действие, которое сразу снижает давление.',
  analysis: 'Понять, где корень проблемы, чтобы не лечить симптомы.',
  forecast: 'Сравнить сценарии и выбрать путь с наименьшим риском.',
};

const TARGET_HINT: Record<TargetFocusId, string> = {
  'Удержать систему': 'Стабилизировать текущий контур и не допустить срыва.',
  'Снизить риск': 'Убрать самые опасные точки до того, как они вырастут.',
  'Усилить цель': 'Сместить ресурс в сторону главного результата.',
  'Восстановить ресурс': 'Вернуть энергию и рабочий темп без перегрева.',
};

const PATH_LABEL: Record<AppMode, string> = {
  start: 'Повторный запуск в Старт',
  world: 'Мир: стабилизация состояния',
  graph: 'Граф причин: разбор источника давления',
  oracle: 'Прогноз: проверка сценариев',
  settings: 'Настройки',
};

const FIRST_STEP_BY_MODE: Record<AppMode, string> = {
  start: 'Обновить ввод и пересчитать стартовую рекомендацию.',
  world: 'Откройте Мир и закрепите планету с максимальным давлением.',
  graph: 'Откройте Граф причин и выделите ветку, которая даёт наибольший эффект.',
  oracle: 'Откройте Прогноз и сравните базовый и усиленный сценарий.',
  settings: 'Настройте сцену под комфортный режим чтения.',
};

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

  const mainProblem = selectedPressure.label;
  const weakPoint = selectedPressure.anchorNodeId === selectedNodeId
    ? `${selectedNodeName} — сейчас уже в фокусе.`
    : `${selectedNodeName} отстаёт, но главный провал в зоне «${selectedPressure.label.toLowerCase()}».`;
  const nextRisk = `${selectedPressure.risk} на горизонте «${selectedHorizon.label.toLowerCase()}».`;

  return (
    <div className="start-mode">
      <section className="start-brief">
        <p className="scene-mode-kicker">Стартовый запуск</p>
        <h2 className="scene-mode-title">Верните систему в управляемое состояние за один запуск.</h2>
        <p className="scene-mode-copy">
          Выберите текущее давление, желаемый результат и горизонт. Система сразу покажет, где растёт риск,
          где главный рычаг и какой следующий шаг даст лучший эффект.
        </p>
      </section>

      <section className="start-system-output" aria-live="polite" aria-label="Что система уже видит">
        <p className="start-system-output-kicker">Что система уже видит сейчас</p>
        <p><span>Главная проблема:</span><strong>{mainProblem}</strong></p>
        <p><span>Слабое место:</span><strong>{weakPoint}</strong></p>
        <p><span>Ближайший риск:</span><strong>{nextRisk}</strong></p>
        <p><span>Лучший старт:</span><strong>{PATH_LABEL[suggestedMode]}</strong></p>
        <p><span>Контекст сцены:</span><strong>{selectedPlanetLabel}</strong></p>
        <button type="button" className="start-why-toggle" onClick={() => setShowWhy((state) => !state)}>
          {showWhy ? 'Скрыть объяснение' : 'Почему система так решила?'}
        </button>
        {showWhy ? (
          <p className="start-why-copy">
            На выбор влияют: давление «{selectedPressure.label.toLowerCase()}», запрос «{selectedEntryMode.label.toLowerCase()}»,
            горизонт «{selectedHorizon.label.toLowerCase()}» и приоритет «{targetFocus.toLowerCase()}».
          </p>
        ) : null}
      </section>

      <section className="start-launch-console" aria-label="Параметры стартового запуска">
        <article className="start-control-panel">
          <header>
            <p>1. Что сейчас мешает сильнее всего?</p>
          </header>
          <div className="start-chip-row">
            {PRESSURE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === pressureId ? 'active' : ''}
                onClick={() => {
                  setPressureId(option.id);
                  onAnchorChange(option.anchorNodeId);
                }}
                title={PRESSURE_HELP[option.id]}
              >
                <span>{option.label}</span>
                <small>{PRESSURE_HELP[option.id]}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="start-control-panel compact">
          <header>
            <p>2. Что вы хотите получить сейчас?</p>
          </header>
          <div className="start-option-grid">
            {ENTRY_MODES.map((option) => (
              <button
                key={option.id}
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

        <article className="start-control-panel compact">
          <header>
            <p>3. На какой срок смотрим?</p>
          </header>
          <div className="start-pill-row">
            {HORIZONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === horizonId ? 'active' : ''}
                onClick={() => setHorizonId(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="start-inline-help">Горизонт нужен, чтобы точнее оценить, где риск проявится первым.</p>
        </article>

        <article className="start-control-panel compact">
          <header>
            <p>4. Что сейчас важнее всего?</p>
          </header>
          <div className="start-pill-row target">
            {TARGETS.map((option) => (
              <button
                key={option}
                type="button"
                className={option === targetFocus ? 'active' : ''}
                onClick={() => setTargetFocus(option)}
                title={TARGET_HINT[option]}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="start-inline-help">{TARGET_HINT[targetFocus]}</p>
        </article>
      </section>

      <section className="start-verdict" aria-live="polite">
        <p><span>Главная зона внимания:</span><strong>{mainProblem}</strong></p>
        <p><span>Ближайший риск:</span><strong>{selectedPressure.risk}</strong></p>
        <p><span>Лучший путь сейчас:</span><strong>{PATH_LABEL[suggestedMode]}</strong></p>
        <p><span>Первый шаг:</span><strong>{FIRST_STEP_BY_MODE[suggestedMode]}</strong></p>

        <div className="start-launch-row">
          <button
            type="button"
            onClick={() => {
              onLaunchContextChange(launchState);
              onLaunch(suggestedMode);
            }}
          >
            Открыть рекомендованный режим
          </button>
          {[...new Set(['world', 'graph', 'oracle'])].map((mode) => (
            <button
              key={mode}
              type="button"
              className="ghost"
              onClick={() => {
                onLaunchContextChange(launchState);
                onLaunch(mode as AppMode);
              }}
            >
              {MODE_ACTION_LABEL[mode as AppMode]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
