import type { AppMode } from '../../entities/system/modes';

type ModeGlyphProps = {
  mode: AppMode;
  short: string;
  active?: boolean;
};

export const ModeGlyph = ({ mode, short, active = false }: ModeGlyphProps) => (
  <span className={active ? 'mode-glyph active' : 'mode-glyph'} data-mode={mode}>
    {short}
  </span>
);
