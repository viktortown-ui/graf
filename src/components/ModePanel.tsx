import type { NextAction } from '../domain/types';

type ModePanelProps = {
  nextAction: NextAction;
  onTick: () => void;
  onReset: () => void;
};

export const ModePanel = ({ nextAction, onTick, onReset }: ModePanelProps) => (
  <section className="mode-panel">
    <p className="panel-kicker">Next best action</p>
    <h2>{nextAction.title}</h2>
    <p>{nextAction.reason}</p>

    <div className="delta-pill">Projected lift +{Math.round(nextAction.expectedDelta * 100)}%</div>

    <div className="panel-actions">
      <button type="button" onClick={onTick}>
        Run one deterministic tick
      </button>
      <button type="button" className="ghost" onClick={onReset}>
        Reset scene
      </button>
    </div>
  </section>
);
