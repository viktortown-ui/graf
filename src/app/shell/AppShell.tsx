import { LeftRail } from './LeftRail';
import { OverlayLayer } from './OverlayLayer';
import { SceneViewport } from './SceneViewport';
import { useModeState } from '../state/useModeState';
import { useSceneState } from '../state/useSceneState';
import { useSettingsState } from '../state/useSettingsState';

export const AppShell = () => {
  const { activeMode, activeModeDefinition, setActiveMode } = useModeState();
  const sceneState = useSceneState();
  const settingsState = useSettingsState();

  return (
    <main className="app-shell" data-theme={settingsState.settings.theme}>
      <LeftRail activeMode={activeMode} onSelectMode={setActiveMode} />
      <section className="scene-stage">
        <SceneViewport mode={activeMode} sceneState={sceneState} settingsState={settingsState} onModeChange={setActiveMode} />
        <OverlayLayer mode={activeModeDefinition} sceneState={sceneState} />
      </section>
    </main>
  );
};
