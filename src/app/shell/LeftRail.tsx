import { MODES, type AppMode } from '../../entities/system/modes';
import { cn } from '../../shared/lib/cn';
import { ModeGlyph } from '../../shared/ui/ModeGlyph';

type LeftRailProps = {
  activeMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
};

export const LeftRail = ({ activeMode, onSelectMode }: LeftRailProps) => (
  <aside className="left-rail" aria-label="Панель режимов">
    <div className="brand-lockup">
      <p className="brand">GRAF</p>
      <p className="brand-subtitle">Граф-нативная командная сцена</p>
    </div>

    <nav className="mode-rail-nav" aria-label="Основные режимы">
      {MODES.map((mode) => {
        const active = mode.id === activeMode;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelectMode(mode.id)}
            className={cn('mode-rail-button', active && 'active')}
            aria-pressed={active}
          >
            <ModeGlyph mode={mode.id} short={mode.short} active={active} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </nav>
  </aside>
);
