import type { Mode } from '../domain/types';

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'start', label: 'Start' },
  { id: 'world', label: 'World' },
  { id: 'graph', label: 'Graph' },
  { id: 'oracle', label: 'Oracle' },
];

type LeftRailProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export const LeftRail = ({ mode, onModeChange }: LeftRailProps) => (
  <aside className="left-rail">
    <p className="brand">GRAF</p>
    <p className="subtitle">Decision Engine</p>

    <nav className="mode-nav" aria-label="Mode switcher">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          className={item.id === mode ? 'mode-button active' : 'mode-button'}
          onClick={() => onModeChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </aside>
);
