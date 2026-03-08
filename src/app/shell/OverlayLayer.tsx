import type { ModeDefinition } from '../../entities/system/modes';
import type { useSceneState } from '../state/useSceneState';

type OverlayLayerProps = {
  mode: ModeDefinition;
  sceneState: ReturnType<typeof useSceneState>;
};

export const OverlayLayer = ({ mode, sceneState }: OverlayLayerProps) => {
  if (mode.id === 'world' || mode.id === 'graph') {
    return null;
  }

  return (
    <aside className="overlay-layer" aria-label="Contextual overlay layer">
      <p className="overlay-kicker">Context overlay</p>
      <h2>{mode.label}</h2>
      <p>{mode.summary}</p>
      <p>
        Focus anchor: <strong>{sceneState.selectedGraphNode.name}</strong> · World mirror: <strong>{sceneState.selectedPlanetLabel}</strong>
      </p>
    </aside>
  );
};
