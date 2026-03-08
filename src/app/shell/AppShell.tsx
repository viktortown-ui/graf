import { LeftRail } from './LeftRail';
import { OverlayLayer } from './OverlayLayer';
import { SceneViewport } from './SceneViewport';
import { useModeState } from '../state/useModeState';
import { useSceneState } from '../state/useSceneState';

export const AppShell = () => {
  const { activeMode, activeModeDefinition, setActiveMode } = useModeState();
  const sceneState = useSceneState();

  return (
    <main className="app-shell">
      <LeftRail activeMode={activeMode} onSelectMode={setActiveMode} />
      <section className="scene-stage">
        <SceneViewport mode={activeMode} sceneState={sceneState} onModeChange={setActiveMode} />
        <OverlayLayer mode={activeModeDefinition} sceneState={sceneState} />
      </section>
    </main>
  );
};
