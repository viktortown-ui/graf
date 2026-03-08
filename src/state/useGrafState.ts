import { useEffect, useMemo, useState } from 'react';
import { seedGraphModel } from '../domain/seed';
import type { GraphModel, Mode } from '../domain/types';
import { deriveNextAction, simulateWhatIf, tickModel } from '../model/engine';

const STORAGE_KEY = 'graf-v1-state';

type StoredState = {
  mode: Mode;
  model: GraphModel;
};

const loadState = (): StoredState => {
  const fallback: StoredState = {
    mode: 'start',
    model: seedGraphModel(),
  };

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed?.model?.nodes?.length) {
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
};

export const useGrafState = () => {
  const [state, setState] = useState<StoredState>(() => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const forecast = useMemo(() => simulateWhatIf(state.model, 10), [state.model]);
  const nextAction = useMemo(() => deriveNextAction(state.model), [state.model]);

  return {
    mode: state.mode,
    model: state.model,
    forecast,
    nextAction,
    setMode: (mode: Mode) => setState((prev) => ({ ...prev, mode })),
    tick: () => setState((prev) => ({ ...prev, model: tickModel(prev.model) })),
    reset: () => setState({ mode: 'start', model: seedGraphModel() }),
  };
};
