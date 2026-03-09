import { useMemo, useState } from 'react';
import { DEFAULT_MODE, MODES, type AppMode } from '../../entities/system/modes';

const MODE_STORAGE_KEY = 'graf.active-mode';

const isAppMode = (value: string): value is AppMode => MODES.some((mode) => mode.id === value);

const readStoredMode = (): AppMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_MODE;
  }

  const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY);

  return storedMode && isAppMode(storedMode) ? storedMode : DEFAULT_MODE;
};

export const useModeState = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(readStoredMode);

  const setMode = (nextMode: AppMode) => {
    setActiveMode(nextMode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MODE_STORAGE_KEY, nextMode);
    }
  };

  const activeModeDefinition = useMemo(
    () => MODES.find((mode) => mode.id === activeMode) ?? MODES[0],
    [activeMode],
  );

  return {
    activeMode,
    activeModeDefinition,
    setActiveMode: setMode,
  };
};
