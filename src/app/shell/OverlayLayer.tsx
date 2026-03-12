import type { ModeDefinition } from '../../entities/system/modes';
import type { useSceneState } from '../state/useSceneState';

type OverlayLayerProps = {
  mode: ModeDefinition;
  sceneState: ReturnType<typeof useSceneState>;
};

export const OverlayLayer = ({ mode, sceneState }: OverlayLayerProps) => {
  if (mode.id === 'overview' || mode.id === 'start' || mode.id === 'world' || mode.id === 'graph' || mode.id === 'oracle' || mode.id === 'settings') {
    return null;
  }

  return (
    <aside className="overlay-layer" aria-label="Контекстный слой">
      <p className="overlay-kicker">Контекст сцены</p>
      <h2>{mode.label}</h2>
      <p>{mode.summary}</p>
      <p>
        Якорь фокуса: <strong>{sceneState.selectedGraphNode.name}</strong> · Отражение в мире: <strong>{sceneState.selectedPlanetLabel}</strong>
      </p>
    </aside>
  );
};
