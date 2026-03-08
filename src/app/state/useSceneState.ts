import { useMemo, useState } from 'react';
import { DEMO_GRAPH } from '../../features/graph/model';

export type SceneSelection = {
  worldPlanetId: string;
  graphNodeId: string;
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

  const selectedGraphNode = useMemo(
    () => DEMO_GRAPH.nodes.find((node) => node.id === selection.graphNodeId) ?? DEMO_GRAPH.nodes[0],
    [selection.graphNodeId],
  );

  const selectedPlanetLabel = useMemo(
    () => selection.worldPlanetId.charAt(0).toUpperCase() + selection.worldPlanetId.slice(1),
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

  return {
    selection,
    selectedGraphNode,
    selectedPlanetLabel,
    selectWorldPlanet,
    selectGraphNode,
  };
};
