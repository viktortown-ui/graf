import type { CSSProperties } from 'react';
import { GraphMode } from '../../features/graph/GraphMode';
import { OverviewMode } from '../../features/overview/OverviewMode';
import { OracleMode } from '../../features/oracle/OracleMode';
import { SettingsMode } from '../../features/settings/SettingsMode';
import { DataLabMode } from '../../features/dataLab/DataLabMode';
import { StartMode } from '../../features/start/StartMode';
import { WorldMode } from '../../features/world/WorldMode';
import type { AppMode } from '../../entities/system/modes';
import { PRESSURE_OPTIONS } from '../state/launchContext';
import type { AppSettings } from '../state/settingsModel';
import type { useSceneState } from '../state/useSceneState';
import type { useSettingsState } from '../state/useSettingsState';
import { MODE_SIGNAL } from '../../engine/sceneSignals';
import { MODES } from '../../entities/system/modes';

type SceneViewportProps = {
  mode: AppMode;
  sceneState: ReturnType<typeof useSceneState>;
  settingsState: ReturnType<typeof useSettingsState>;
  onModeChange: (mode: AppMode) => void;
};

const getThemeVars = (settings: AppSettings) => {
  const themes = {
    contour: {
      modeHue: '#64b7ff',
      panelBg: 'linear-gradient(180deg, rgba(8,18,37,0.62), rgba(4,10,19,0.4))',
      lineEmphasis: 0.82,
      grid: 0.12,
    },
    cosmos: {
      modeHue: '#9a83ff',
      panelBg: 'linear-gradient(180deg, rgba(14,20,44,0.72), rgba(7,9,26,0.52))',
      lineEmphasis: 1.1,
      grid: 0.2,
    },
    abyss: {
      modeHue: '#7de8ff',
      panelBg: 'linear-gradient(180deg, rgba(5,8,14,0.9), rgba(2,4,10,0.84))',
      lineEmphasis: 1.25,
      grid: 0.08,
    },
  } as const;

  const profile = themes[settings.theme];
  const glowFactor = settings.lowGlowMode ? 0.2 : settings.glowBrightness / 100;
  const alphaFactor = settings.reduceTransparency ? 0.94 : settings.hudOpacity / 100;

  return {
    '--mode-hue': profile.modeHue,
    '--scene-grid-opacity': `${profile.grid * (settings.backgroundDensity / 55)}`,
    '--scene-glow-opacity': `${0.12 + glowFactor * 0.5}`,
    '--hud-opacity': `${alphaFactor}`,
    '--panel-bg': profile.panelBg,
    '--line-emphasis': `${profile.lineEmphasis}`,
    '--label-density': `${settings.labelDensity / 100}`,
    '--ui-scale': `${settings.uiTextScale / 100}`,
  } as CSSProperties;
};

export const SceneViewport = ({ mode, sceneState, settingsState, onModeChange }: SceneViewportProps) => {
  const signal = MODE_SIGNAL[mode];
  const styleVars = getThemeVars(settingsState.settings);
  const activeModeDefinition = MODES.find((entry) => entry.id === mode);
  const activeModeLabel = activeModeDefinition?.label ?? 'Неизвестно';
  const activeModeSummary = activeModeDefinition?.summary ?? '';
  const showServiceHud = mode !== 'overview';

  return (
    <section className="scene-viewport" aria-label="Иммерсивная сцена" style={styleVars}>
      <div className="scene-canvas">
        <div className="scene-grid" aria-hidden="true" />
        <div className="scene-core-glow" aria-hidden="true" />
        {showServiceHud ? (
          <>
            <header className="scene-hud">
              <p className="scene-hud-label">{signal.title}</p>
              {mode !== 'start' ? <p className="scene-hud-metric">Пульс {Math.round(signal.pulse * 100)}%</p> : null}
            </header>
            <div className="scene-anchor-memory" aria-live="polite">
              <p>Якорь системы: <strong>{sceneState.selectedGraphNode.name}</strong></p>
              <p>Планета мира: <strong>{sceneState.selectedPlanetLabel}</strong></p>
              <p>Давление запуска: <strong>{PRESSURE_OPTIONS.find((entry) => entry.id === sceneState.launchContext.pressureId)?.label ?? 'Не задано'}</strong></p>
              <p>Контур перехода: <strong>Обзор → Старт → Мир → {mode === 'graph' ? 'Граф причин' : mode === 'oracle' ? 'Прогноз' : mode === 'datalab' ? 'Data Lab' : 'оперативный выбор'}</strong></p>
            </div>
          </>
        ) : null}
        <div className={`scene-mode-content ${mode}`}>
          {mode === 'overview' && <OverviewMode onModeChange={onModeChange} />}
          {mode === 'start' && (
            <StartMode
              selectedNodeId={sceneState.selection.graphNodeId}
              selectedNodeName={sceneState.selectedGraphNode.name}
              selectedPlanetLabel={sceneState.selectedPlanetLabel}
              contextModeLabel={activeModeLabel}
              contextModeSummary={activeModeSummary}
              dataSpine={sceneState.dataSpine}
              confidence={sceneState.confidence}
              onDataSpineChange={sceneState.updateDataSpine}
              onAnchorChange={(id) => sceneState.selectGraphNode(id, settingsState.settings.autoFocusNode)}
              launchContext={sceneState.launchContext}
              onLaunchContextChange={sceneState.applyLaunchContext}
              onLaunch={onModeChange}
            />
          )}
          {mode === 'world' && (
            <WorldMode
              selectedPlanetId={sceneState.selection.worldPlanetId}
              launchContext={sceneState.launchContext}
              onSelectPlanet={sceneState.selectWorldPlanet}
              onModeChange={onModeChange}
              camera={sceneState.worldCamera}
              onCameraChange={sceneState.setWorldCamera}
              settings={settingsState.settings}
            />
          )}
          {mode === 'graph' && (
            <GraphMode
              selectedNodeId={sceneState.selection.graphNodeId}
              onSelectNode={(id) => sceneState.selectGraphNode(id, settingsState.settings.autoFocusNode)}
              lens={sceneState.graphLens}
              onLensChange={sceneState.setGraphLens}
              launchContext={sceneState.launchContext}
              settings={settingsState.settings}
            />
          )}
          {mode === 'oracle' && (
            <OracleMode
              selectedNodeId={sceneState.selection.graphNodeId}
              sharedLens={sceneState.graphLens}
              launchContext={sceneState.launchContext}
              settings={settingsState.settings}
            />
          )}
          {mode === 'datalab' && (
            <DataLabMode
              dataSpine={sceneState.dataSpine}
              confidence={sceneState.confidence}
              historyDates={sceneState.historyDates}
              onApplySandbox={sceneState.updateDataSpine}
            />
          )}
          {mode === 'settings' && (
            <SettingsMode
              settings={settingsState.settings}
              activeModeLabel={activeModeLabel}
              saveStatus={settingsState.lastSavedAt}
              storageSizeKb={settingsState.estimateStorageKb()}
              appVersion={'0.1.0'}
              onSettingChange={settingsState.setSetting}
              onResetRecommended={settingsState.resetRecommended}
              onResetView={sceneState.resetView}
              onResetScene={sceneState.resetScene}
              onResetLaunch={sceneState.resetLaunch}
              onResetUserData={() => {
                settingsState.clearStoredSettings();
                settingsState.resetRecommended();
                sceneState.resetScene();
                sceneState.resetLaunch();
              }}
              onResetSystem={() => {
                window.localStorage.clear();
                settingsState.resetRecommended();
                sceneState.resetScene();
                sceneState.resetLaunch();
                sceneState.resetView();
              }}
              onExport={settingsState.exportSettings}
              onImport={settingsState.importSettings}
              onResetVisualCache={() => sceneState.resetView()}
            />
          )}
        </div>
      </div>
    </section>
  );
};
