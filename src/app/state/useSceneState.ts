import { useMemo, useState } from 'react';
import { DEMO_GRAPH } from '../../features/graph/model';
import { WORLD_PLANETS } from '../../features/world/worldPlanets';
import { DEFAULT_LAUNCH_CONTEXT, PRESSURE_OPTIONS, type LaunchContext } from './launchContext';

export type SceneSelection = {
  worldPlanetId: string;
  graphNodeId: string;
};

export type SpatialLens = {
  panX: number;
  panY: number;
  zoom: number;
};

const DEFAULT_SELECTION: SceneSelection = {
  worldPlanetId: 'energy',
  graphNodeId: 'domain-focus',
};

const WORLD_TO_GRAPH_NODE: Record<string, string> = {
  energy: 'domain-energy',
  money: 'domain-money',
  discipline: 'factor-routine',
  focus: 'domain-focus',
  stress: 'domain-stress',
  social: 'goal-health',
  goal: 'goal-launch',
};

const GRAPH_TO_WORLD_PLANET = Object.fromEntries(Object.entries(WORLD_TO_GRAPH_NODE).map(([planet, node]) => [node, planet]));

export const useSceneState = () => {
  const [selection, setSelection] = useState<SceneSelection>(DEFAULT_SELECTION);
  const [graphLens, setGraphLens] = useState<SpatialLens>({ panX: 0, panY: 0, zoom: 1 });
  const [launchContext, setLaunchContext] = useState<LaunchContext>(DEFAULT_LAUNCH_CONTEXT);

  const selectedGraphNode = useMemo(
    () => DEMO_GRAPH.nodes.find((node) => node.id === selection.graphNodeId) ?? DEMO_GRAPH.nodes[0],
    [selection.graphNodeId],
  );

  const selectedPlanetLabel = useMemo(
    () => WORLD_PLANETS.find((planet) => planet.id === selection.worldPlanetId)?.label ?? selection.worldPlanetId,
    [selection.worldPlanetId],
  );

  const selectWorldPlanet = (planetId: string) => {
    setSelection((current) => ({
      worldPlanetId: planetId,
      graphNodeId: WORLD_TO_GRAPH_NODE[planetId] ?? current.graphNodeId,
    }));
  };

  const selectGraphNode = (nodeId: string) => {
    setSelection((current) => ({
      graphNodeId: nodeId,
      worldPlanetId: (GRAPH_TO_WORLD_PLANET[nodeId] as string | undefined) ?? current.worldPlanetId,
    }));
  };

  const applyLaunchContext = (next: LaunchContext) => {
    setLaunchContext(next);
    const pressure = PRESSURE_OPTIONS.find((option) => option.id === next.pressureId) ?? PRESSURE_OPTIONS[0];
    setSelection((current) => ({
      worldPlanetId: pressure.worldPlanetId ?? current.worldPlanetId,
      graphNodeId: pressure.anchorNodeId ?? current.graphNodeId,
    }));
  };

  return {
    selection,
    selectedGraphNode,
    selectedPlanetLabel,
    graphLens,
    launchContext,
    setGraphLens,
    applyLaunchContext,
    selectWorldPlanet,
    selectGraphNode,
  };
};
