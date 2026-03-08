import type { ModeDefinition } from '../../entities/system/modes';

type OverlayLayerProps = {
  mode: ModeDefinition;
};

export const OverlayLayer = ({ mode }: OverlayLayerProps) => (
  <aside className="overlay-layer" aria-label="Contextual overlay layer">
    <p className="overlay-kicker">Context overlay</p>
    <h2>{mode.label}</h2>
    <p>{mode.summary}</p>
  </aside>
);
