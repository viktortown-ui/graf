import { useMemo, useState } from 'react';
import { DEFAULT_MODE, MODES, type AppMode } from '../../entities/system/modes';

const isAppMode = (value: string): value is AppMode => MODES.some((mode) => mode.id === value);

export const useModeState = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(DEFAULT_MODE);

  const activeModeDefinition = useMemo(
    () => MODES.find((mode) => mode.id === activeMode) ?? MODES[0],
    [activeMode],
  );

  return {
    activeMode,
    activeModeDefinition,
    setActiveMode: (mode: AppMode) => {
      if (isAppMode(mode)) setActiveMode(mode);
    },
  };
};
