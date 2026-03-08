import { useMemo, useState } from 'react';
import { DEFAULT_MODE, MODES, type AppMode } from '../../entities/system/modes';

export const useModeState = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(DEFAULT_MODE);

  const activeModeDefinition = useMemo(
    () => MODES.find((mode) => mode.id === activeMode) ?? MODES[0],
    [activeMode],
  );

  return {
    activeMode,
    activeModeDefinition,
    setActiveMode,
  };
};
