import { GraphMode } from '../../features/graph/GraphMode';
import { OracleMode } from '../../features/oracle/OracleMode';
import { StartMode } from '../../features/start/StartMode';
import { WorldMode } from '../../features/world/WorldMode';
import type { AppMode } from '../../entities/system/modes';
import { MODE_SIGNAL } from '../../engine/sceneSignals';
import type { useSceneState } from '../state/useSceneState';

type SceneViewportProps = {
  mode: AppMode;
  sceneState: ReturnType<typeof useSceneState>;
};

export const SceneViewport = ({ mode, sceneState }: SceneViewportProps) => {
  const signal = MODE_SIGNAL[mode];

  return (
    <section className="scene-viewport" aria-label="Иммерсивная сцена">
      <header className="scene-hud">
        <p className="scene-hud-label">{signal.title}</p>
        <p className="scene-hud-metric">Пульс {Math.round(signal.pulse * 100)}%</p>
      </header>

      <div className="scene-canvas" style={{ ['--mode-hue' as string]: signal.hue }}>
        <div className="scene-grid" aria-hidden="true" />
        <div className="scene-core-glow" aria-hidden="true" />
        <div className="scene-anchor-memory" aria-live="polite">
          <p>Якорь системы: <strong>{sceneState.selectedGraphNode.name}</strong></p>
          <p>Планета мира: <strong>{sceneState.selectedPlanetLabel}</strong></p>
        </div>
        <div className={`scene-mode-content ${mode}`}>
          {mode === 'start' && <StartMode selectedNodeName={sceneState.selectedGraphNode.name} />}
          {mode === 'world' && (
            <WorldMode selectedPlanetId={sceneState.selection.worldPlanetId} onSelectPlanet={sceneState.selectWorldPlanet} />
          )}
          {mode === 'graph' && (
            <GraphMode
              selectedNodeId={sceneState.selection.graphNodeId}
              onSelectNode={sceneState.selectGraphNode}
              lens={sceneState.graphLens}
              onLensChange={sceneState.setGraphLens}
            />
          )}
          {mode === 'oracle' && <OracleMode selectedNodeId={sceneState.selection.graphNodeId} sharedLens={sceneState.graphLens} />}
        </div>
      </div>
    </section>
  );
};
