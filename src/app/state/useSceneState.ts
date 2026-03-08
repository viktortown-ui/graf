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

const DEFAULT_GRAPH_LENS: SpatialLens = { panX: 0, panY: 0, zoom: 1 };
const DEFAULT_WORLD_CAMERA = { rotation: 0, panX: 0, panY: 0, zoom: 1 };

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
  const [graphLens, setGraphLens] = useState<SpatialLens>(DEFAULT_GRAPH_LENS);
  const [worldCamera, setWorldCamera] = useState(DEFAULT_WORLD_CAMERA);
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

  const selectGraphNode = (nodeId: string, autoFocus = true) => {
    setSelection((current) => ({
      graphNodeId: nodeId,
      worldPlanetId: (GRAPH_TO_WORLD_PLANET[nodeId] as string | undefined) ?? current.worldPlanetId,
    }));

    if (autoFocus) {
      const node = DEMO_GRAPH.nodes.find((entry) => entry.id === nodeId);
      if (node) {
        setGraphLens((current) => ({ ...current, panX: -node.position.x * 0.26, panY: -node.position.y * 0.2 }));
      }
    }
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
    worldCamera,
    launchContext,
    setGraphLens,
    setWorldCamera,
    applyLaunchContext,
    selectWorldPlanet,
    selectGraphNode,
    resetView: () => {
      setGraphLens(DEFAULT_GRAPH_LENS);
      setWorldCamera(DEFAULT_WORLD_CAMERA);
    },
    resetScene: () => {
      setSelection(DEFAULT_SELECTION);
      setGraphLens(DEFAULT_GRAPH_LENS);
      setWorldCamera(DEFAULT_WORLD_CAMERA);
    },
    resetLaunch: () => {
      setLaunchContext(DEFAULT_LAUNCH_CONTEXT);
      setSelection(DEFAULT_SELECTION);
    },
  };
};
