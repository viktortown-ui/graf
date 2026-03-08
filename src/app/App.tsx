import { LeftRail } from '../components/LeftRail';
import { ModePanel } from '../components/ModePanel';
import { SceneCanvas } from '../components/SceneCanvas';
import { useGrafState } from '../state/useGrafState';
import '../styles/app.css';

export const App = () => {
  const { mode, model, forecast, nextAction, setMode, tick, reset } = useGrafState();

  return (
    <main className="app-shell">
      <LeftRail mode={mode} onModeChange={setMode} />
      <SceneCanvas mode={mode} model={model} forecast={forecast} />
      <ModePanel nextAction={nextAction} onTick={tick} onReset={reset} />
    </main>
  );
};
