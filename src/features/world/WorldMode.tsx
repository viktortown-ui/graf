import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import type { AppMode } from '../../entities/system/modes';
import { HORIZONS, PRESSURE_OPTIONS, TARGET_EDGE_HINT, type LaunchContext } from '../../app/state/launchContext';
import type { DataSpine } from '../../app/state/dataSpine';
import type { AppSettings } from '../../app/state/settingsModel';
import type { ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';
import { DEMO_GRAPH, type GraphEdge, type GraphNode } from '../graph/model';
import { STATE_COPY, WORLD_PLANETS } from './worldPlanets';

export type CameraState = {
  rotation: number;
  panX: number;
  panY: number;
  zoom: number;
};

type PlanetRender = {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  color: string;
  depth: number;
  pulse: number;
  brightness: number;
  accent: 'ring' | 'shield' | 'crack' | 'haze';
  state: keyof typeof STATE_COPY;
  stability: number;
};

type WorldLayer = 'risks' | 'resources' | 'goals' | 'pressure';
type DomainId = 'finance' | 'body' | 'work' | 'goal';

type OperationalProfile = {
  planetId: string;
  domainNodeId: string;
  stateLabel: string;
  pressure: number;
  resource: number;
  risk: number;
  goal: number;
  leverageLabel: string;
  linkedRiskLabel: string;
  linkedGoalLabel: string;
  explanation: string[];
};

type DomainOperational = {
  id: DomainId;
  label: string;
  pressure: number;
  risk: number;
  stability: number;
  leverage: number;
  readiness: number;
  confidence: number;
  importance: number;
  primaryPlanetId: string;
};

const LAYER_LABEL: Record<WorldLayer, string> = {
  risks: 'Риски',
  resources: 'Ресурсы',
  goals: 'Цели',
  pressure: 'Давление',
};

const DOMAIN_LABEL: Record<DomainId, string> = {
  finance: 'Finance',
  body: 'Body',
  work: 'Work',
  goal: 'Goal',
};

const DOMAIN_SECONDARY_LABELS: Record<DomainId, string[]> = {
  finance: ['Ресурсы'],
  body: ['Энергия'],
  work: ['Фокус', 'Дисциплина', 'Напряжение'],
  goal: ['Цель', 'Поддержка'],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 10) / 10;

const PLANET_TO_DOMAIN_NODE: Record<string, string> = {
  energy: 'domain-energy',
  money: 'domain-money',
  discipline: 'factor-routine',
  focus: 'domain-focus',
  stress: 'domain-stress',
  social: 'goal-health',
  goal: 'goal-launch',
};

const TARGET_LAYER: Record<LaunchContext['targetFocus'], WorldLayer> = {
  'Удержать систему': 'pressure',
  'Снизить риск': 'risks',
  'Усилить цель': 'goals',
  'Восстановить ресурс': 'resources',
};

const HORIZON_FACTOR: Record<LaunchContext['horizonId'], number> = {
  today: 1,
  week: 1.2,
  month: 1.4,
};

const EDGE_SIGN: Record<GraphEdge['type'], number> = {
  boosts: 1,
  delayed: 0.8,
  drags: -1,
  blocks: -0.9,
  conflicts: -0.75,
};

const ENTRY_MODE_PRESSURE_BIAS: Record<LaunchContext['entryModeId'], number> = {
  fast: 1.08,
  analysis: 1.18,
  forecast: 0.95,
};

const ENTRY_MODE_RESOURCE_BIAS: Record<LaunchContext['entryModeId'], number> = {
  fast: 1,
  analysis: 0.92,
  forecast: 1.14,
};

const DOMAIN_PLANETS: Record<DomainId, string[]> = {
  finance: ['money'],
  body: ['energy'],
  work: ['focus', 'discipline', 'stress'],
  goal: ['goal', 'social'],
};

const DOMAIN_ZONE_POSITION: Record<DomainId, { x: number; y: number }> = {
  finance: { x: 240, y: -170 },
  body: { x: -250, y: -160 },
  work: { x: -210, y: 175 },
  goal: { x: 225, y: 170 },
};

const getNodeById = (nodeId: string) => DEMO_GRAPH.nodes.find((node) => node.id === nodeId);
const getNodeReadiness = (node?: GraphNode) => (node ? node.state / 100 : 0.5);
const getPlanetDomainId = (planetId: string): DomainId =>
  (Object.keys(DOMAIN_PLANETS) as DomainId[]).find((domainId) => DOMAIN_PLANETS[domainId].includes(planetId)) ?? 'work';

const getRecommendedMode = (domain: DomainOperational): AppMode => {
  if (domain.pressure > 70 || domain.confidence < 45) return 'graph';
  if (domain.leverage > 62 && domain.confidence >= 55) return 'oracle';
  if (domain.risk > 68) return 'graph';
  return 'oracle';
};

type WorldModeProps = {
  settings: AppSettings;
  camera: CameraState;
  onCameraChange: (camera: CameraState) => void;
  selectedPlanetId: string;
  launchContext: LaunchContext;
  dataSpine: DataSpine;
  confidence: ConfidenceSnapshot;
  onSelectPlanet: (planetId: string) => void;
  onModeChange: (mode: AppMode) => void;
};

export const WorldMode = ({
  selectedPlanetId,
  launchContext,
  dataSpine,
  confidence,
  onSelectPlanet,
  onModeChange,
  camera,
  onCameraChange,
  settings,
}: WorldModeProps) => {
  const [time, setTime] = useState(0);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
  const [lockedPlanetId, setLockedPlanetId] = useState<{ planetId: string; launchKey: string } | null>(null);
  const [manualLayer, setManualLayer] = useState<{ layer: WorldLayer; launchKey: string } | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let frame = 0;
    const started = performance.now();
    const loop = (timestamp: number) => {
      setTime((timestamp - started) / 1000);
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const pressure = PRESSURE_OPTIONS.find((option) => option.id === launchContext.pressureId) ?? PRESSURE_OPTIONS[0];
  const launchKey = `${launchContext.pressureId}-${launchContext.entryModeId}-${launchContext.horizonId}-${launchContext.targetFocus}`;
  const lockedPlanet = lockedPlanetId?.launchKey === launchKey ? lockedPlanetId.planetId : null;
  const layer = manualLayer?.launchKey === launchKey ? manualLayer.layer : TARGET_LAYER[launchContext.targetFocus];
  const horizon = HORIZONS.find((option) => option.id === launchContext.horizonId) ?? HORIZONS[0];
  const horizonFactor = HORIZON_FACTOR[launchContext.horizonId];

  const profiles = useMemo(() => {
    const pressureEdgeIds = new Set(pressure.pressureEdgeIds);
    const targetHintEdgeIds = new Set(TARGET_EDGE_HINT[launchContext.targetFocus]);

    return WORLD_PLANETS.map<OperationalProfile>((planet) => {
      const domainNodeId = PLANET_TO_DOMAIN_NODE[planet.id];
      const node = getNodeById(domainNodeId);
      const relatedEdges = DEMO_GRAPH.edges.filter((edge) => edge.source === domainNodeId || edge.target === domainNodeId);
      const outgoing = DEMO_GRAPH.edges.filter((edge) => edge.source === domainNodeId);
      const incoming = DEMO_GRAPH.edges.filter((edge) => edge.target === domainNodeId);

      const weightedPressure = relatedEdges.reduce((acc, edge) => {
        const directional = edge.target === domainNodeId ? 1 : 0.72;
        const pressureBias = pressureEdgeIds.has(edge.id) ? 1.55 : 1;
        const destabilizing = EDGE_SIGN[edge.type] < 0 ? 1.2 : 0.56;
        return acc + edge.weight * directional * pressureBias * destabilizing;
      }, 0);

      const resourceFlow = incoming.reduce((acc, edge) => {
        const sign = EDGE_SIGN[edge.type];
        return acc + Math.max(0, sign) * edge.weight * (0.55 + edge.confidence * 0.45);
      }, 0);

      const riskFlow = outgoing.reduce((acc, edge) => {
        const targetNode = getNodeById(edge.target);
        if (!targetNode) return acc;
        const riskWeight = targetNode.type === 'risk' ? 1.7 : EDGE_SIGN[edge.type] < 0 ? 1.2 : 0.5;
        return acc + edge.weight * riskWeight;
      }, 0);

      const goalFlow = outgoing.reduce((acc, edge) => {
        const targetNode = getNodeById(edge.target);
        if (!targetNode) return acc;
        const towardGoal = targetNode.type === 'goal' ? 1.8 : EDGE_SIGN[edge.type] > 0 ? 0.75 : 0.2;
        const targetBoost = targetHintEdgeIds.has(edge.id) ? 1.45 : 1;
        return acc + edge.weight * towardGoal * targetBoost;
      }, 0);

      const nodeReadiness = getNodeReadiness(node);
      const entryPressureBias = ENTRY_MODE_PRESSURE_BIAS[launchContext.entryModeId];
      const entryResourceBias = ENTRY_MODE_RESOURCE_BIAS[launchContext.entryModeId];
      const pressureScore = clamp((weightedPressure * horizonFactor * entryPressureBias + (1 - nodeReadiness) * 2.8) * 21, 0, 100);
      const resourceScore = clamp((resourceFlow * entryResourceBias + nodeReadiness * 1.4) * 38, 0, 100);
      const riskScore = clamp((riskFlow * entryPressureBias + (1 - nodeReadiness) * 1.8 + (1 - planet.orbitStability) * 1.2) * 32, 0, 100);
      const goalScore = clamp((goalFlow + nodeReadiness * 1.2 + (launchContext.targetFocus === 'Усилить цель' ? 0.9 : 0.4)) * 35, 0, 100);

      const leverageEdge = outgoing.slice().sort((a, b) => b.weight * b.confidence - a.weight * a.confidence)[0];
      const linkedRiskEdge = outgoing.find((edge) => getNodeById(edge.target)?.type === 'risk');
      const linkedGoalEdge = outgoing.find((edge) => getNodeById(edge.target)?.type === 'goal');
      const linkedRiskLabel = linkedRiskEdge ? getNodeById(linkedRiskEdge.target)?.name ?? pressure.risk : pressure.risk;
      const linkedGoalLabel = linkedGoalEdge ? getNodeById(linkedGoalEdge.target)?.name ?? 'Стабилизация контура' : 'Стабилизация контура';

      return {
        planetId: planet.id,
        domainNodeId,
        stateLabel: node?.name ?? planet.label,
        pressure: pressureScore,
        resource: resourceScore,
        risk: riskScore,
        goal: goalScore,
        leverageLabel: leverageEdge?.label ?? 'Локальная стабилизация орбиты',
        linkedRiskLabel,
        linkedGoalLabel,
        explanation: [
          `Давление ${pressureScore > 70 ? 'растёт' : 'контролируется'} через ${pressure.label.toLowerCase()}.`,
          `Ресурс ${resourceScore > 65 ? 'поддерживает' : 'проседает для'} домена «${planet.label.toLowerCase()}».`,
          `Цель связана с «${linkedGoalLabel.toLowerCase()}» на горизонте ${horizon.label.toLowerCase()}.`,
        ],
      };
    });
  }, [horizon.label, horizonFactor, launchContext.entryModeId, launchContext.targetFocus, pressure]);

  const selectedPlanet = WORLD_PLANETS.find((planet) => planet.id === selectedPlanetId) ?? WORLD_PLANETS[0];
  const selectedProfile = profiles.find((profile) => profile.planetId === selectedPlanet.id) ?? profiles[0];

  const domainCards = useMemo(() => {
    const metrics = dataSpine.derived;
    return (Object.keys(DOMAIN_PLANETS) as DomainId[]).map<DomainOperational>((domainId) => {
      const domainProfiles = profiles.filter((profile) => DOMAIN_PLANETS[domainId].includes(profile.planetId));
      const divisor = Math.max(domainProfiles.length, 1);
      const avgPressure = domainProfiles.reduce((acc, item) => acc + item.pressure, 0) / divisor;
      const avgRisk = domainProfiles.reduce((acc, item) => acc + item.risk, 0) / divisor;
      const avgGoal = domainProfiles.reduce((acc, item) => acc + item.goal, 0) / divisor;
      const avgResource = domainProfiles.reduce((acc, item) => acc + item.resource, 0) / divisor;
      const confidenceScore = confidence.domainConfidence[domainId];

      const pressureScore = clamp(avgPressure * 0.7 + metrics.pressureValue * 0.3, 0, 100);
      const riskScore = clamp(avgRisk * 0.62 + metrics.riskValue * 0.38, 0, 100);
      const leverageScore = clamp(avgGoal * 0.54 + avgResource * 0.23 + metrics.leverageValue * 0.23, 0, 100);
      const stabilityScore = clamp(avgResource * 0.45 + (100 - avgPressure) * 0.2 + metrics.stabilityValue * 0.35, 0, 100);
      const readinessScore = clamp(metrics.readinessValue * 0.46 + leverageScore * 0.22 + stabilityScore * 0.18 - riskScore * 0.14, 0, 100);
      const importance = clamp(pressureScore * 0.35 + riskScore * 0.25 + (100 - stabilityScore) * 0.2 + (100 - confidenceScore) * 0.2, 0, 100);

      return {
        id: domainId,
        label: DOMAIN_LABEL[domainId],
        pressure: round(pressureScore),
        risk: round(riskScore),
        stability: round(stabilityScore),
        leverage: round(leverageScore),
        readiness: round(readinessScore),
        confidence: confidenceScore,
        importance: round(importance),
        primaryPlanetId: DOMAIN_PLANETS[domainId][0],
      };
    });
  }, [confidence.domainConfidence, dataSpine.derived, profiles]);

  const mainContour = domainCards.slice().sort((a, b) => b.importance - a.importance)[0] ?? domainCards[0];
  const selectedDomainId = getPlanetDomainId(selectedPlanet.id);
  const activeDomain = domainCards.find((domain) => domain.id === selectedDomainId) ?? mainContour;
  const weakestConfidenceDomain = domainCards.slice().sort((a, b) => a.confidence - b.confidence)[0] ?? domainCards[0];
  const ctaMode = getRecommendedMode(activeDomain);

  const recommendedProfile = profiles
    .slice()
    .sort((a, b) => {
      if (layer === 'risks') return b.risk - a.risk;
      if (layer === 'resources') return b.resource - a.resource;
      if (layer === 'goals') return b.goal - a.goal;
      return b.pressure - a.pressure;
    })[0];

  const preFocusPlanets = useMemo(() => {
    return WORLD_PLANETS.map((planet) => {
      const wobble = (1 - planet.orbitStability) * 14 * Math.sin(time * 2.4 + planet.baseAngle * 1.6);
      const angle = planet.baseAngle + time * planet.orbitSpeed + camera.rotation;
      const radius = planet.orbitRadius * camera.zoom + wobble;
      const depth = 0.3 + ((Math.sin(angle + planet.baseAngle) + 1) / 2) * 0.7;
      return {
        ...planet,
        x: Math.cos(angle) * radius + camera.panX,
        y: Math.sin(angle) * radius * 0.58 + camera.panY,
        depth,
        pulse: 0.68 + Math.sin(time * (1.3 + planet.pulseIntensity) + planet.baseAngle) * 0.32,
      };
    });
  }, [camera.panX, camera.panY, camera.rotation, camera.zoom, time]);

  const focusAnchor = preFocusPlanets.find((planet) => planet.id === selectedPlanetId) ?? preFocusPlanets[0];
  const focusShift = { x: -focusAnchor.x * 0.28, y: -focusAnchor.y * 0.3 };

  const planets: PlanetRender[] = preFocusPlanets.map((planet) => {
    const profile = profiles.find((entry) => entry.planetId === planet.id);
    const domain = domainCards.find((entry) => DOMAIN_PLANETS[entry.id].includes(planet.id));
    const layerBias =
      layer === 'risks'
        ? (profile?.risk ?? 50) / 100
        : layer === 'resources'
          ? (profile?.resource ?? 50) / 100
          : layer === 'goals'
            ? (profile?.goal ?? 50) / 100
            : (profile?.pressure ?? 50) / 100;
    const confidenceFog = 1 - (domain?.confidence ?? 60) / 100;

    return {
      id: planet.id,
      label: planet.label,
      x: planet.x + focusShift.x,
      y: planet.y + focusShift.y,
      r: (8 + planet.size * 17 * (0.83 + planet.depth * 0.38)) * (0.86 + layerBias * 0.28),
      color: planet.color,
      depth: planet.depth,
      pulse: planet.pulse,
      brightness: clamp(planet.brightness - confidenceFog * 0.2, 0.45, 1),
      accent: planet.accent,
      state: planet.state,
      stability: clamp(planet.orbitStability - ((profile?.pressure ?? 40) / 100) * 0.2, 0.4, 0.96),
    };
  });

  const links = DEMO_GRAPH.edges
    .map((edge) => {
      const sourcePlanetId = Object.entries(PLANET_TO_DOMAIN_NODE).find(([, nodeId]) => nodeId === edge.source)?.[0];
      const targetPlanetId = Object.entries(PLANET_TO_DOMAIN_NODE).find(([, nodeId]) => nodeId === edge.target)?.[0];
      if (!sourcePlanetId || !targetPlanetId) return null;
      const source = planets.find((planet) => planet.id === sourcePlanetId);
      const target = planets.find((planet) => planet.id === targetPlanetId);
      if (!source || !target) return null;
      const hot = sourcePlanetId === selectedPlanetId || targetPlanetId === selectedPlanetId;
      const relevant = pressure.pressureEdgeIds.includes(edge.id) || TARGET_EDGE_HINT[launchContext.targetFocus].includes(edge.id);
      const sourceDomainId = getPlanetDomainId(sourcePlanetId);
      const targetDomainId = getPlanetDomainId(targetPlanetId);
      const inActiveDomain = sourceDomainId === activeDomain.id || targetDomainId === activeDomain.id;
      return { edge, source, target, hot, relevant, inActiveDomain };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const stars = useMemo(
    () =>
      Array.from({ length: 92 }, (_, index) => {
        const seed = index * 9277;
        return {
          id: index,
          x: ((seed % 100) / 100) * 100,
          y: (((seed / 7) % 100) / 100) * 100,
          size: 0.5 + ((seed / 13) % 2.1),
          opacity: 0.2 + ((seed / 17) % 0.45),
        };
      }),
    [],
  );

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    onCameraChange({
      ...camera,
      rotation: camera.rotation + deltaX * 0.0024 * (settings.sceneSpeed === 'fast' ? 1.2 : settings.sceneSpeed === 'slow' ? 0.8 : 1),
      panX: clamp(camera.panX + deltaX * 0.3, -220, 220),
      panY: clamp(camera.panY + deltaY * 0.3, -150, 150),
    });
  };

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const amount = event.deltaY > 0 ? -0.07 : 0.07;
    onCameraChange({ ...camera, zoom: clamp(camera.zoom + amount, 0.74, 1.55) });
  };

  const getLayerEmphasis = (planetId: string) => {
    const profile = profiles.find((entry) => entry.planetId === planetId);
    if (!profile) return 0.86;
    const layerMetric = layer === 'risks' ? profile.risk : layer === 'resources' ? profile.resource : layer === 'goals' ? profile.goal : profile.pressure;
    const inActiveDomain = getPlanetDomainId(planetId) === activeDomain.id;
    const active = planetId === selectedPlanetId;
    const hovered = hoveredPlanetId === planetId;
    const locked = lockedPlanet === planetId;
    const recommended = recommendedProfile?.planetId === planetId;
    return clamp((0.58 + layerMetric / 165) * (inActiveDomain ? 1.2 : 0.76) * (active ? 1.34 : hovered ? 1.15 : 1) * (locked ? 1.07 : 1) * (recommended ? 1.08 : 1), 0.54, 1.8);
  };

  const movePotential = round(clamp(dataSpine.derived.readinessValue * 0.64 + dataSpine.derived.leverageValue * 0.36, 0, 100));
  const errorCost = round(clamp(dataSpine.derived.riskValue * 0.55 + dataSpine.derived.pressureValue * 0.45, 0, 100));

  return (
    <div className="world-mode" aria-label="Сцена системного мира">
      <div className="world-overlay">
        <p className="world-kicker">Мир 2.0 · Operational Map</p>
        <p className="world-selected">Активный контур: {activeDomain.label} · давление {round(activeDomain.pressure)}%</p>
        <p className="world-launch-lens">Handoff: {pressure.label} · {launchContext.entryModeId} · {horizon.label.toLowerCase()} · {launchContext.targetFocus}</p>
      </div>

      <div className="world-operational-summary" aria-live="polite">
        <p className="world-operational-title">Operational summary</p>
        <p>Main contour: <strong>{activeDomain.label}</strong></p>
        <p>Primary pressure: <strong>{round(activeDomain.pressure)}%</strong> · risk {round(activeDomain.risk)}%</p>
        <p>Confidence warning: <strong>{weakestConfidenceDomain.label}</strong> ({weakestConfidenceDomain.confidence}%)</p>
        <p>Next best transition: <strong>{ctaMode === 'graph' ? `Граф: причины ${activeDomain.label}` : `Оракул: ход для ${activeDomain.label}`}</strong></p>
      </div>

      <div className="world-domain-grid">
        {domainCards
          .slice()
          .sort((a, b) => (a.id === activeDomain.id ? -1 : b.id === activeDomain.id ? 1 : b.importance - a.importance))
          .map((domain) => {
          const active = domain.id === activeDomain.id;
          return (
            <article key={domain.id} className={`world-domain-card ${active ? 'active' : ''}`}>
              <p className="world-domain-card-title">{domain.label}</p>
              {active ? (
                <>
                  <p>Pressure {round(domain.pressure)}% · Risk {round(domain.risk)}%</p>
                  <p>Stability {round(domain.stability)}% · Leverage {round(domain.leverage)}%</p>
                  <p>Readiness {round(domain.readiness)}% · Confidence {domain.confidence}%</p>
                  <p>Secondary: {DOMAIN_SECONDARY_LABELS[domain.id].join(' · ')}</p>
                </>
              ) : (
                <p>Pressure {round(domain.pressure)}% · Confidence {domain.confidence}%</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="world-domain-readout">
        <p className="world-domain-title">{activeDomain.label}</p>
        <p>Фокусный узел: {selectedPlanet.label}</p>
        <p>Состояние: {selectedProfile.stateLabel}</p>
        <p>Давление: {round(selectedProfile.pressure)}%</p>
        <p>Риск: {round(selectedProfile.risk)}%</p>
        <p>Стабильность: {round(100 - selectedProfile.pressure * 0.6)}%</p>
        <p>Leverage: {round(selectedProfile.goal)}%</p>
        <p>Readiness: {round((selectedProfile.resource * 0.52) + (selectedProfile.goal * 0.48))}%</p>
        <p>Цена ошибки: {errorCost}% · Потенциал хода: {movePotential}%</p>
      </div>

      <div className="world-layer-switch">
        {(Object.keys(LAYER_LABEL) as WorldLayer[]).map((entry) => (
          <button
            key={entry}
            type="button"
            className={layer === entry ? 'active' : ''}
            onClick={() => setManualLayer({ layer: entry, launchKey })}
          >
            {LAYER_LABEL[entry]}
          </button>
        ))}
      </div>

      <div className="world-handoff">
        <button type="button" onClick={() => onModeChange('graph')}>Graph: причины {activeDomain.label}</button>
        <button type="button" onClick={() => onModeChange('oracle')} className={ctaMode === 'oracle' ? '' : 'ghost'}>Oracle: ход по {activeDomain.label}</button>
        <button type="button" className="ghost" onClick={() => onModeChange('start')}>Start: перенастроить запуск</button>
      </div>

      <svg
        className="world-scene"
        style={{ opacity: settings.reduceTransparency ? 0.98 : 0.86 + settings.backgroundDensity / 700 }}
        viewBox="-560 -340 1120 680"
        role="presentation"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <defs>
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="56%">
            <stop offset="0%" stopColor="#d8ebff" />
            <stop offset="34%" stopColor="#8bdbff" />
            <stop offset="100%" stopColor="#282f86" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {stars.map((star) => (
          <circle key={star.id} cx={`${star.x * 11.2 - 560}`} cy={`${star.y * 6.8 - 340}`} r={star.size} fill="#b9d8ff" opacity={star.opacity * (settings.backgroundDensity / 100)} />
        ))}

        <g opacity="0.38">
          {(Object.keys(DOMAIN_ZONE_POSITION) as DomainId[]).map((domainId) => {
            const domain = domainCards.find((entry) => entry.id === domainId);
            if (!domain) return null;
            const zone = DOMAIN_ZONE_POSITION[domainId];
            const fog = clamp((100 - domain.confidence) / 100, 0.06, 0.72);
            const pressureGlow = clamp(domain.pressure / 100, 0.2, 1);
            const isActiveDomain = domain.id === activeDomain.id;
            return (
              <g key={domainId} transform={`translate(${zone.x + focusShift.x}, ${zone.y + focusShift.y})`}>
                <circle r={58 + domain.importance * 0.46} fill="#9ab8ff" opacity={(isActiveDomain ? 0.16 : 0.06) + pressureGlow * 0.08} />
                <circle r={44 + fog * 34} fill="#dce9ff" opacity={isActiveDomain ? fog * 1.1 : fog * 0.65} />
                <circle
                  r={34}
                  fill="none"
                  stroke={isActiveDomain ? '#88ecff' : '#8da9d4'}
                  strokeWidth={isActiveDomain ? 2.6 : 1.2}
                  strokeOpacity={isActiveDomain ? 0.95 : 0.36}
                  onClick={() => onSelectPlanet(domain.primaryPlanetId)}
                  className="world-domain-node-hit"
                />
                <text className="world-planet-label" x={0} y={-62} textAnchor="middle" fontSize={13}>{DOMAIN_LABEL[domainId]}</text>
                <text className="world-domain-score" x={0} y={6} textAnchor="middle">{round(layer === 'risks' ? domain.risk : layer === 'resources' ? domain.stability : layer === 'goals' ? domain.leverage : domain.pressure)}%</text>
              </g>
            );
          })}
        </g>

        <g opacity="0.4">
          {links.map(({ edge, source, target, hot, relevant, inActiveDomain }) => (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={EDGE_SIGN[edge.type] > 0 ? '#9dffda' : '#ff9888'}
              strokeWidth={hot ? 2.2 : inActiveDomain ? 1.8 : 1.05}
              strokeOpacity={relevant ? 0.74 : inActiveDomain ? 0.46 : 0.16}
              strokeDasharray={EDGE_SIGN[edge.type] > 0 ? '0' : '4 8'}
            />
          ))}
        </g>

        <g>
          <circle cx={focusShift.x} cy={focusShift.y} r={90} fill="url(#coreGradient)" opacity={0.78 + Math.sin(time * 1.5) * 0.08} />
        </g>

        {planets
          .slice()
          .sort((a, b) => a.depth - b.depth)
          .map((planet) => {
            const selected = planet.id === selectedPlanetId;
            const hovered = planet.id === hoveredPlanetId;
            const emphasis = (selected ? 1.35 : hovered ? 1.14 : 1) * getLayerEmphasis(planet.id) * (pressure.worldPlanetId === planet.id ? 1.15 : 1);
            const domain = domainCards.find((entry) => DOMAIN_PLANETS[entry.id].includes(planet.id));
            const confidenceFog = clamp((100 - (domain?.confidence ?? 60)) / 100, 0, 0.7);
            const inActiveDomain = getPlanetDomainId(planet.id) === activeDomain.id;

            return (
              <g
                key={planet.id}
                transform={`translate(${planet.x}, ${planet.y})`}
                onMouseEnter={() => setHoveredPlanetId(planet.id)}
                onMouseLeave={() => setHoveredPlanetId(null)}
                onClick={() => {
                  onSelectPlanet(planet.id);
                  setLockedPlanetId({ planetId: planet.id, launchKey });
                }}
                className="world-planet-hit"
              >
                <circle r={planet.r * (1.55 + (1 - planet.stability) * 0.35)} fill={planet.color} opacity={(inActiveDomain ? 0.1 : 0.04) + planet.pulse * 0.08} />
                <circle r={planet.r * emphasis} fill={planet.color} opacity={clamp((planet.brightness * 0.66 + planet.pulse * 0.22) * (inActiveDomain ? 1 : 0.58), 0.24, 0.98)} />
                <circle r={planet.r * (1.1 + confidenceFog * 0.8)} fill="#e5f2ff" opacity={confidenceFog * 0.28} />
                <text className="world-planet-label" x={0} y={planet.r + 20} textAnchor="middle" opacity={inActiveDomain ? 1 : 0.62}>{planet.label}</text>
              </g>
            );
          })}
      </svg>
    </div>
  );
};
