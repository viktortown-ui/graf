import type { ReactNode } from 'react';
import type { AppMode } from '../../entities/system/modes';

type ModeGlyphProps = {
  mode: AppMode;
  active?: boolean;
};

const iconByMode: Record<AppMode, ReactNode> = {
  overview: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="6.1" />
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v2.3" />
      <path d="M21 12h-2.3" />
      <path d="M12 21v-2.3" />
      <path d="M3 12h2.3" />
    </svg>
  ),
  start: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5v4.2" />
      <path d="M12 16.3v4.2" />
      <path d="M6.1 7.8 9 10.7" />
      <path d="m15 13.7 2.9 2.9" />
      <path d="M3.5 12h4.2" />
      <path d="M16.3 12h4.2" />
      <path d="m6.1 16.2 2.9-2.9" />
      <path d="m15 10.3 2.9-2.9" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  world: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6.1" />
      <ellipse cx="12" cy="12" rx="9.2" ry="3.8" />
      <path d="M12 5.9a8.4 8.4 0 0 1 0 12.2" />
      <path d="M12 5.9a8.4 8.4 0 0 0 0 12.2" />
    </svg>
  ),
  graph: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 8.6 16 6.8" />
      <path d="m8 8.6 1.8 7" />
      <path d="m9.8 15.6 8.2-1.8" />
      <circle cx="8" cy="8.6" r="2.1" />
      <circle cx="16" cy="6.8" r="2.1" />
      <circle cx="9.8" cy="15.6" r="2.1" />
      <circle cx="18" cy="13.8" r="2.1" />
    </svg>
  ),
  oracle: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 18.4c2.6-.4 5.4-1.4 7.8-3.2 2.4-1.8 4.2-4 5.2-6.6" />
      <path d="m15.8 6.4 2.2-.3-.2 2.3" />
      <path d="M10.6 8.1a3 3 0 1 1 0 6" />
      <path d="M13.6 11.1h4.9" />
      <path d="M8.2 18.2h6.2" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.2 7h13.6" />
      <circle cx="9" cy="7" r="2" />
      <path d="M5.2 12h13.6" />
      <circle cx="14.7" cy="12" r="2" />
      <path d="M5.2 17h13.6" />
      <circle cx="11.2" cy="17" r="2" />
    </svg>
  ),
};

export const ModeGlyph = ({ mode, active = false }: ModeGlyphProps) => (
  <span className={active ? 'mode-glyph active' : 'mode-glyph'} data-mode={mode} aria-hidden="true">
    {iconByMode[mode]}
  </span>
);
