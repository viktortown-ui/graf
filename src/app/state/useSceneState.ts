import { useMemo, useState } from 'react';
import { DEMO_GRAPH } from '../../features/graph/model';
import { WORLD_PLANETS } from '../../features/world/worldPlanets';
import type { DailyCheckIn, DailyFactors, Profile } from './dataSpine';
import { createDataSpine } from './dataSpine';
import { evaluateConfidence } from '../../entities/confidence/confidenceEngine';
import { DEFAULT_LAUNCH_CONTEXT, PRESSURE_OPTIONS, type LaunchContext } from './launchContext';

export type GraphReadingLens = 'pressure' | 'resources' | 'goals' | 'causes';

export type WorldGraphHandoff = {
  activeDomain: {
    id: 'finance' | 'body' | 'work' | 'goal';
    label: string;
    nodeId: string;
  };
  selectedLens: GraphReadingLens;
  launchContext: LaunchContext;
  derivedMetrics: {
    pressure: number;
    risk: number;
    leverage: number;
    stability: number;
    readiness: number;
  };
  confidence: {
    global: number;
    domain: number;
  };
  recommendedTransition: 'graph' | 'oracle' | 'world' | 'start';
};

export type OracleExecutionHandoff = {
  activeDomain: WorldGraphHandoff['activeDomain'];
  selectedLens: GraphReadingLens;
  launchContext: LaunchContext;
  derivedMetrics: WorldGraphHandoff['derivedMetrics'];
  confidence: WorldGraphHandoff['confidence'];
  pressureSource: string;
  blocker: string;
  leverageNode: string;
  resultNode: string;
  recommendedTransition: WorldGraphHandoff['recommendedTransition'];
};

export type SceneSelection = {
  worldPlanetId: string;
  graphNodeId: string;
};

type ChainStep = 'start' | 'world' | 'graph' | 'oracle';

export type AcceptedScenario = {
  id: 'cautious' | 'base' | 'strong' | 'collect-data';
  title: string;
  move: string;
  sourceDomain: string;
  nextMode: ChainStep;
};

export type ChainContext = {
  launchContext: LaunchContext;
  activeDomain: WorldGraphHandoff['activeDomain'] | null;
  selectedLens: GraphReadingLens;
  worldToGraphHandoff: WorldGraphHandoff | null;
  graphToOracleHandoff: OracleExecutionHandoff | null;
  selectedOracleScenario: AcceptedScenario | null;
  lastAcceptedScenario: AcceptedScenario | null;
  recommendedPath: ChainStep[];
  routeMemory: ChainStep[];
  currentStep: ChainStep;
  lastBlocker: string | null;
  lastLeverage: string | null;
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

const DOMAIN_TO_GRAPH_NODE: Record<WorldGraphHandoff['activeDomain']['id'], string> = {
  finance: 'domain-money',
  body: 'domain-energy',
  work: 'domain-focus',
  goal: 'goal-launch',
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
  const [graphLens, setGraphLens] = useState<SpatialLens>(DEFAULT_GRAPH_LENS);
  const [worldCamera, setWorldCamera] = useState(DEFAULT_WORLD_CAMERA);
  const [launchContext, setLaunchContext] = useState<LaunchContext>(DEFAULT_LAUNCH_CONTEXT);
  const [dataSpine, setDataSpine] = useState(createDataSpine);
  const [historyDates, setHistoryDates] = useState<string[]>([new Date().toISOString().slice(0, 10)]);
  const [graphHandoff, setGraphHandoff] = useState<WorldGraphHandoff | null>(null);
  const [oracleHandoff, setOracleHandoff] = useState<OracleExecutionHandoff | null>(null);
  const [chainContext, setChainContext] = useState<ChainContext>({
    launchContext: DEFAULT_LAUNCH_CONTEXT,
    activeDomain: null,
    selectedLens: 'pressure',
    worldToGraphHandoff: null,
    graphToOracleHandoff: null,
    selectedOracleScenario: null,
    lastAcceptedScenario: null,
    recommendedPath: ['start', 'world', 'graph', 'oracle'],
    routeMemory: ['start'],
    currentStep: 'start',
    lastBlocker: null,
    lastLeverage: null,
  });
  const confidence = useMemo(() => evaluateConfidence({ dataSpine, historyDates }), [dataSpine, historyDates]);

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
    const entrySeedPlanet: Record<LaunchContext['entryModeId'], string> = {
      fast: pressure.worldPlanetId,
      analysis: pressure.worldPlanetId,
      forecast: next.targetFocus === 'Снизить риск' ? 'stress' : next.targetFocus === 'Восстановить ресурс' ? 'energy' : 'goal',
    };
    const targetPlanetByFocus: Record<LaunchContext['targetFocus'], string> = {
      'Удержать систему': entrySeedPlanet[next.entryModeId],
      'Снизить риск': 'stress',
      'Усилить цель': 'goal',
      'Восстановить ресурс': 'energy',
    };

    const selectedPlanet = targetPlanetByFocus[next.targetFocus] ?? pressure.worldPlanetId;
    const selectedGraph = WORLD_TO_GRAPH_NODE[selectedPlanet] ?? pressure.anchorNodeId;

    setSelection((current) => ({
      worldPlanetId: selectedPlanet ?? current.worldPlanetId,
      graphNodeId: selectedGraph ?? current.graphNodeId,
    }));
    setChainContext((current) => ({
      ...current,
      launchContext: next,
      selectedOracleScenario: null,
      lastAcceptedScenario: null,
      lastBlocker: null,
      lastLeverage: null,
      recommendedPath: ['start', 'world', next.entryModeId === 'forecast' ? 'oracle' : 'graph', 'oracle'],
      routeMemory: ['start'],
      currentStep: 'start',
    }));
  };

  const applyWorldGraphHandoff = (handoff: WorldGraphHandoff) => {
    setGraphHandoff(handoff);
    setLaunchContext(handoff.launchContext);
    const focusNode = DOMAIN_TO_GRAPH_NODE[handoff.activeDomain.id] ?? handoff.activeDomain.nodeId;
    selectGraphNode(focusNode, true);
    if (handoff.confidence.global < 55) {
      setGraphLens((current) => ({ ...current, zoom: 0.92 }));
    }
    setChainContext((current) => ({
      ...current,
      launchContext: handoff.launchContext,
      activeDomain: handoff.activeDomain,
      selectedLens: handoff.selectedLens,
      worldToGraphHandoff: handoff,
      recommendedPath: ['start', 'world', handoff.recommendedTransition === 'oracle' ? 'oracle' : 'graph', 'oracle'],
    }));
  };

  const applyGraphOracleHandoff = (handoff: OracleExecutionHandoff) => {
    setOracleHandoff(handoff);
    setChainContext((current) => ({
      ...current,
      launchContext: handoff.launchContext,
      activeDomain: handoff.activeDomain,
      selectedLens: handoff.selectedLens,
      graphToOracleHandoff: handoff,
      lastBlocker: handoff.blocker,
      lastLeverage: handoff.leverageNode,
      recommendedPath: ['start', 'world', 'graph', 'oracle'],
    }));
  };

  const applyOracleScenario = (scenario: AcceptedScenario) => {
    setChainContext((current) => ({
      ...current,
      selectedOracleScenario: scenario,
      lastAcceptedScenario: scenario,
      recommendedPath: ['start', 'world', 'graph', 'oracle'],
    }));
  };

  const registerModeVisit = (mode: string) => {
    if (!['start', 'world', 'graph', 'oracle'].includes(mode)) return;
    const step = mode as ChainStep;
    setChainContext((current) => ({
      ...current,
      currentStep: step,
      routeMemory: current.routeMemory.includes(step) ? current.routeMemory : [...current.routeMemory, step],
    }));
  };

  const updateDataSpine = (payload: { profile: Profile; dailyCheckIn: DailyCheckIn; dailyFactors: DailyFactors }) => {
    setDataSpine(createDataSpine(payload.profile, payload.dailyCheckIn, payload.dailyFactors));
    const today = new Date().toISOString().slice(0, 10);
    setHistoryDates((current) => (current[current.length - 1] === today ? current : [...current, today]));
  };

  return {
    selection,
    selectedGraphNode,
    selectedPlanetLabel,
    graphLens,
    worldCamera,
    launchContext,
    dataSpine,
    historyDates,
    confidence,
    graphHandoff,
    oracleHandoff,
    chainContext,
    setGraphLens,
    setWorldCamera,
    applyLaunchContext,
    applyWorldGraphHandoff,
    applyGraphOracleHandoff,
    applyOracleScenario,
    registerModeVisit,
    updateDataSpine,
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
      setDataSpine(createDataSpine());
      setHistoryDates([new Date().toISOString().slice(0, 10)]);
      setGraphHandoff(null);
      setOracleHandoff(null);
      setChainContext({
        launchContext: DEFAULT_LAUNCH_CONTEXT,
        activeDomain: null,
        selectedLens: 'pressure',
        worldToGraphHandoff: null,
        graphToOracleHandoff: null,
        selectedOracleScenario: null,
        lastAcceptedScenario: null,
        recommendedPath: ['start', 'world', 'graph', 'oracle'],
        routeMemory: ['start'],
        currentStep: 'start',
        lastBlocker: null,
        lastLeverage: null,
      });
    },
  };
};
