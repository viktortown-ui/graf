import { GraphMode } from '../../features/graph/GraphMode';
import { OracleMode } from '../../features/oracle/OracleMode';
import { StartMode } from '../../features/start/StartMode';
import { WorldMode } from '../../features/world/WorldMode';
import type { ReactNode } from 'react';
import type { AppMode } from '../../entities/system/modes';
import { MODE_SIGNAL } from '../../engine/sceneSignals';

type SceneViewportProps = {
  mode: AppMode;
};

const modeContent: Record<AppMode, ReactNode> = {
  start: <StartMode />,
  world: <WorldMode />,
  graph: <GraphMode />,
  oracle: <OracleMode />,
};

export const SceneViewport = ({ mode }: SceneViewportProps) => {
  const signal = MODE_SIGNAL[mode];

  return (
    <section className="scene-viewport" aria-label="Immersive scene viewport">
      <header className="scene-hud">
        <p className="scene-hud-label">{signal.title}</p>
        <p className="scene-hud-metric">Pulse {Math.round(signal.pulse * 100)}%</p>
      </header>

      <div className="scene-canvas" style={{ ['--mode-hue' as string]: signal.hue }}>
        <div className="scene-grid" aria-hidden="true" />
        <div className="scene-core-glow" aria-hidden="true" />
        <div className={mode === 'world' ? 'scene-mode-content world' : 'scene-mode-content'}>{modeContent[mode]}</div>
      </div>
    </section>
  );
};
