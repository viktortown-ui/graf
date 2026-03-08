import { useMemo, useState } from 'react';
import type { AppMode } from '../../entities/system/modes';

type StartModeProps = {
  selectedNodeId: string;
  selectedNodeName: string;
  selectedPlanetLabel: string;
  onAnchorChange: (nodeId: string) => void;
  onLaunch: (mode: AppMode) => void;
};

type LaunchPreset = {
  id: string;
  label: string;
  anchorNodeId: string;
  risk: string;
  recommendedMode: AppMode;
};

const PRESSURE_OPTIONS: LaunchPreset[] = [
  { id: 'load', label: 'Перегрузка', anchorNodeId: 'domain-stress', risk: 'Рост каскада напряжения', recommendedMode: 'world' },
  { id: 'energy-drop', label: 'Просадка энергии', anchorNodeId: 'domain-energy', risk: 'Потеря темпа восстановления', recommendedMode: 'world' },
  {
    id: 'attention-drift',
    label: 'Дрейф внимания',
    anchorNodeId: 'risk-distraction',
    risk: 'Рассыпание контекста выполнения',
    recommendedMode: 'graph',
  },
  { id: 'money', label: 'Давление денег', anchorNodeId: 'domain-money', risk: 'Ослабление буфера решений', recommendedMode: 'graph' },
  { id: 'goal-slip', label: 'Риск срыва цели', anchorNodeId: 'goal-launch', risk: 'Смещение северной цели', recommendedMode: 'oracle' },
];

const ENTRY_MODES = [
  { id: 'fast', label: 'Быстрый запуск', recommendedMode: 'world' as const },
  { id: 'analysis', label: 'Анализ причин', recommendedMode: 'graph' as const },
  { id: 'forecast', label: 'Прогноз сценариев', recommendedMode: 'oracle' as const },
];

const HORIZONS = [
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: '7 дней' },
  { id: 'month', label: '30 дней' },
];

const TARGETS = ['Удержать систему', 'Снизить риск', 'Усилить цель', 'Восстановить ресурс'] as const;

const MODE_LABEL: Record<AppMode, string> = {
  start: 'Старт',
  world: 'Мир',
  graph: 'Граф причин',
  oracle: 'Прогноз',
};

const MODE_ACTION_LABEL: Record<AppMode, string> = {
  start: 'Войти в Старт',
  world: 'Войти в Мир',
  graph: 'Открыть Граф причин',
  oracle: 'Перейти в прогноз',
};

export const StartMode = ({ selectedNodeId, selectedNodeName, selectedPlanetLabel, onAnchorChange, onLaunch }: StartModeProps) => {
  const [pressureId, setPressureId] = useState(PRESSURE_OPTIONS[0].id);
  const [entryModeId, setEntryModeId] = useState(ENTRY_MODES[0].id);
  const [horizonId, setHorizonId] = useState(HORIZONS[0].id);
  const [targetFocus, setTargetFocus] = useState<(typeof TARGETS)[number]>(TARGETS[0]);

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

  const mainZone = selectedPressure.anchorNodeId === selectedNodeId ? selectedNodeName : selectedPressure.label;

  return (
    <div className="start-mode">
      <section className="start-brief">
        <p className="scene-mode-kicker">Контур запуска</p>
        <h2 className="scene-mode-title">Соберите стартовый фокус и войдите в рабочую сцену без разрыва контекста.</h2>
        <p className="scene-mode-copy">
          Текущий якорь: <strong>{selectedNodeName}</strong> · Отражение: <strong>{selectedPlanetLabel}</strong>
        </p>
      </section>

      <section className="start-controls" aria-label="Параметры запуска">
        <div className="start-control-block">
          <p>Главное давление</p>
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
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="start-control-grid">
          <label>
            <span>Режим входа</span>
            <select value={entryModeId} onChange={(event) => setEntryModeId(event.target.value)}>
              {ENTRY_MODES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Горизонт внимания</span>
            <select value={horizonId} onChange={(event) => setHorizonId(event.target.value)}>
              {HORIZONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Целевой фокус</span>
            <select value={targetFocus} onChange={(event) => setTargetFocus(event.target.value as (typeof TARGETS)[number])}>
              {TARGETS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="start-verdict" aria-live="polite">
        <p>
          Главная зона внимания: <strong>{mainZone}</strong>
        </p>
        <p>
          Первичный риск: <strong>{selectedPressure.risk}</strong>
        </p>
        <p>
          Рекомендуемый режим: <strong>{MODE_LABEL[suggestedMode]}</strong>
        </p>
        <p>
          Следующий шаг: <strong>{selectedEntryMode.label}</strong> · {selectedHorizon.label.toLowerCase()} · {targetFocus.toLowerCase()}.
        </p>
        <div className="start-launch-row">
          <button type="button" onClick={() => onLaunch(suggestedMode)}>
            {MODE_ACTION_LABEL[suggestedMode]}
          </button>
          {[...new Set([suggestedMode, 'world', 'graph', 'oracle'])]
            .filter((mode): mode is AppMode => mode !== 'start')
            .map((mode) => (
              <button key={mode} type="button" className="ghost" onClick={() => onLaunch(mode)}>
                {MODE_ACTION_LABEL[mode]}
              </button>
            ))}
        </div>
      </section>
    </div>
  );
};
