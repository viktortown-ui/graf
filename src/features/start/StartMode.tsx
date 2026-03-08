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

  const launchState: LaunchContext = { pressureId, entryModeId, horizonId, targetFocus };

  return (
    <div className="start-mode">
      <section className="start-brief">
        <p className="scene-mode-kicker">Контур запуска</p>
        <h2 className="scene-mode-title">Соберите фокус и откройте сцену как рабочий инструмент, а не витрину.</h2>
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
            <select value={entryModeId} onChange={(event) => setEntryModeId(event.target.value as EntryModeId)}>
              {ENTRY_MODES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Горизонт внимания</span>
            <select value={horizonId} onChange={(event) => setHorizonId(event.target.value as HorizonId)}>
              {HORIZONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Целевой фокус</span>
            <select value={targetFocus} onChange={(event) => setTargetFocus(event.target.value as TargetFocusId)}>
              {TARGETS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="start-launch-row">
          <button
            type="button"
            onClick={() => {
              onLaunchContextChange(launchState);
              onLaunch(suggestedMode);
            }}
          >
            {MODE_ACTION_LABEL[suggestedMode]}
          </button>
          {[...new Set([suggestedMode, 'world', 'graph', 'oracle'])]
            .filter((mode): mode is AppMode => mode !== 'start')
            .map((mode) => (
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
          Линза запуска: <strong>{selectedEntryMode.label}</strong> · {selectedHorizon.label.toLowerCase()} · {targetFocus.toLowerCase()}.
        </p>
      </section>
    </div>
  );
};
