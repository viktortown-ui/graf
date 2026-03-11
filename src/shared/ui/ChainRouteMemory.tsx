import type { ChainContext } from '../../app/state/useSceneState';

const CHAIN_STEPS = ['start', 'world', 'graph', 'oracle'] as const;
type ChainStep = (typeof CHAIN_STEPS)[number];

const STEP_LABEL: Record<ChainStep, string> = {
  start: 'Start',
  world: 'Мир',
  graph: 'Graph',
  oracle: 'Oracle',
};

type ChainRouteMemoryProps = {
  chainContext: ChainContext;
};

export const ChainRouteMemory = ({ chainContext }: ChainRouteMemoryProps) => {
  return (
    <div className="chain-route-memory" aria-label="Маршрут GRAF">
      {CHAIN_STEPS.map((step) => {
        const isCurrent = chainContext.currentStep === step;
        const isVisited = chainContext.routeMemory.includes(step);
        const isNext = !isCurrent && !isVisited && chainContext.recommendedPath.includes(step);

        return (
          <span
            key={step}
            className={`chain-step ${isCurrent ? 'active' : ''} ${isVisited ? 'visited' : ''} ${isNext ? 'next' : ''}`}
          >
            {STEP_LABEL[step]}
          </span>
        );
      })}
    </div>
  );
};
