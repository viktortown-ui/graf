import { LeftRail } from './LeftRail';
import { OverlayLayer } from './OverlayLayer';
import { SceneViewport } from './SceneViewport';
import { useModeState } from '../state/useModeState';

export const AppShell = () => {
  const { activeMode, activeModeDefinition, setActiveMode } = useModeState();

  return (
    <main className="app-shell">
      <LeftRail activeMode={activeMode} onSelectMode={setActiveMode} />
      <section className="scene-stage">
        <SceneViewport mode={activeMode} />
        <OverlayLayer mode={activeModeDefinition} />
      </section>
    </main>
  );
};
