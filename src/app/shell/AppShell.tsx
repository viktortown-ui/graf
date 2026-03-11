import { useEffect, useMemo, useState } from 'react';
import { LeftRail } from './LeftRail';
import { OverlayLayer } from './OverlayLayer';
import { SceneViewport } from './SceneViewport';
import { useModeState } from '../state/useModeState';
import { useSceneState } from '../state/useSceneState';
import { useSettingsState } from '../state/useSettingsState';
import { MODES } from '../../entities/system/modes';
import { readDevLabEnabled, setDevLabEnabled } from '../../entities/system/devLabAccess';

export const AppShell = () => {
  const { activeMode, activeModeDefinition, setActiveMode } = useModeState();
  const sceneState = useSceneState();
  const settingsState = useSettingsState();
  const [devLabEnabled, setDevLabState] = useState(readDevLabEnabled);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
        const next = !devLabEnabled;
        setDevLabEnabled(next);
        setDevLabState(next);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [devLabEnabled]);

  useEffect(() => {
    if (!devLabEnabled && activeMode === 'datalab') {
      setActiveMode('overview');
    }
  }, [activeMode, devLabEnabled, setActiveMode]);

  useEffect(() => {
    sceneState.registerModeVisit(activeMode);
  }, [activeMode, sceneState]);

  const visibleModes = useMemo(
    () => MODES.filter((mode) => (mode.id === 'datalab' ? devLabEnabled : true)),
    [devLabEnabled],
  );

  return (
    <main className="app-shell" data-theme={settingsState.settings.theme}>
      <LeftRail activeMode={activeMode} modes={visibleModes} onSelectMode={setActiveMode} />
      <section className="scene-stage">
        <SceneViewport mode={activeMode} sceneState={sceneState} settingsState={settingsState} onModeChange={setActiveMode} />
        <OverlayLayer mode={activeModeDefinition} sceneState={sceneState} />
      </section>
    </main>
  );
};
