import { GraphMode } from '../../features/graph/GraphMode';
import { OracleMode } from '../../features/oracle/OracleMode';
import { StartMode } from '../../features/start/StartMode';
import { WorldMode } from '../../features/world/WorldMode';
import type { AppMode } from '../../entities/system/modes';
import { PRESSURE_OPTIONS } from '../state/launchContext';
import { MODE_SIGNAL } from '../../engine/sceneSignals';
import type { useSceneState } from '../state/useSceneState';

type SceneViewportProps = {
  mode: AppMode;
  sceneState: ReturnType<typeof useSceneState>;
  onModeChange: (mode: AppMode) => void;
};

export const SceneViewport = ({ mode, sceneState, onModeChange }: SceneViewportProps) => {
  const signal = MODE_SIGNAL[mode];

  return (
    <section className="scene-viewport" aria-label="Иммерсивная сцена">
      <div className="scene-canvas" style={{ ['--mode-hue' as string]: signal.hue }}>
        <div className="scene-grid" aria-hidden="true" />
        <div className="scene-core-glow" aria-hidden="true" />
        <header className="scene-hud">
          <p className="scene-hud-label">{signal.title}</p>
          <p className="scene-hud-metric">Пульс {Math.round(signal.pulse * 100)}%</p>
        </header>
        <div className="scene-anchor-memory" aria-live="polite">
          <p>Якорь системы: <strong>{sceneState.selectedGraphNode.name}</strong></p>
          <p>Планета мира: <strong>{sceneState.selectedPlanetLabel}</strong></p>
          <p>Давление запуска: <strong>{PRESSURE_OPTIONS.find((entry) => entry.id === sceneState.launchContext.pressureId)?.label ?? 'Не задано'}</strong></p>
        </div>
        <div className={`scene-mode-content ${mode}`}>
          {mode === 'start' && (
            <StartMode
              selectedNodeId={sceneState.selection.graphNodeId}
              selectedNodeName={sceneState.selectedGraphNode.name}
              selectedPlanetLabel={sceneState.selectedPlanetLabel}
              onAnchorChange={sceneState.selectGraphNode}
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
            />
          )}
          {mode === 'graph' && (
            <GraphMode
              selectedNodeId={sceneState.selection.graphNodeId}
              onSelectNode={sceneState.selectGraphNode}
              lens={sceneState.graphLens}
              onLensChange={sceneState.setGraphLens}
              launchContext={sceneState.launchContext}
            />
          )}
          {mode === 'oracle' && (
            <OracleMode
              selectedNodeId={sceneState.selection.graphNodeId}
              sharedLens={sceneState.graphLens}
              launchContext={sceneState.launchContext}
            />
          )}
        </div>
      </div>
    </section>
  );
};
