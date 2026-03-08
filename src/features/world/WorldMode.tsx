import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import type { AppMode } from '../../entities/system/modes';
import { HORIZONS, PRESSURE_OPTIONS, TARGET_EDGE_HINT, type LaunchContext } from '../../app/state/launchContext';
import type { AppSettings } from '../../app/state/settingsModel';
import { DEMO_GRAPH } from '../graph/model';
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

const LAYER_LABEL: Record<WorldLayer, string> = {
  risks: 'Риски',
  resources: 'Ресурсы',
  goals: 'Цели',
  pressure: 'Давление',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const PLANET_TO_DOMAIN_NODE: Record<string, string> = {
  energy: 'domain-energy',
  money: 'domain-money',
  discipline: 'factor-routine',
  focus: 'domain-focus',
  stress: 'domain-stress',
  social: 'goal-health',
  goal: 'goal-launch',
};

type WorldModeProps = {
  settings: AppSettings;
  camera: CameraState;
  onCameraChange: (camera: CameraState) => void;
  selectedPlanetId: string;
  launchContext: LaunchContext;
  onSelectPlanet: (planetId: string) => void;
  onModeChange: (mode: AppMode) => void;
};

export const WorldMode = ({ selectedPlanetId, launchContext, onSelectPlanet, onModeChange, camera, onCameraChange, settings }: WorldModeProps) => {
  const [time, setTime] = useState(0);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
  const [layer, setLayer] = useState<WorldLayer>('pressure');
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
  const horizon = HORIZONS.find((option) => option.id === launchContext.horizonId) ?? HORIZONS[0];

  const selectedPlanet = WORLD_PLANETS.find((planet) => planet.id === selectedPlanetId) ?? WORLD_PLANETS[0];
  const selectedDomainNodeId = PLANET_TO_DOMAIN_NODE[selectedPlanet.id] ?? pressure.anchorNodeId;
  const selectedDomainNode = DEMO_GRAPH.nodes.find((node) => node.id === selectedDomainNodeId);
  const linkedGoal = DEMO_GRAPH.edges.find((edge) => edge.source === selectedDomainNodeId && edge.target.startsWith('goal-'));
  const linkedRisk = DEMO_GRAPH.edges.find((edge) => edge.source === selectedDomainNodeId && edge.target.startsWith('risk-'));

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
  const focusShift = {
    x: -focusAnchor.x * 0.28,
    y: -focusAnchor.y * 0.3,
  };

  const planets: PlanetRender[] = preFocusPlanets.map((planet) => ({
    id: planet.id,
    label: planet.label,
    x: planet.x + focusShift.x,
    y: planet.y + focusShift.y,
    r: 8 + planet.size * 17 * (0.83 + planet.depth * 0.38),
    color: planet.color,
    depth: planet.depth,
    pulse: planet.pulse,
    brightness: planet.brightness,
    accent: planet.accent,
    state: planet.state,
    stability: planet.orbitStability,
  }));

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
    if (!dragRef.current) {
      return;
    }

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
    if (planetId === selectedPlanetId) {
      return 1.45;
    }
    if (layer === 'pressure' && planetId === pressure.worldPlanetId) {
      return 1.3;
    }
    if (layer === 'goals' && (planetId === 'goal' || planetId === 'social')) {
      return 1.24;
    }
    if (layer === 'resources' && (planetId === 'energy' || planetId === 'money' || planetId === 'discipline')) {
      return 1.2;
    }
    if (layer === 'risks' && (planetId === 'stress' || planetId === 'focus')) {
      return 1.26;
    }
    return 0.82;
  };

  return (
    <div className="world-mode" aria-label="Сцена системного мира">
      <div className="world-overlay">
        <p className="world-kicker">Живой мир · Оперативная карта</p>
        <p className="world-selected">
          {selectedPlanet.label} · {STATE_COPY[selectedPlanet.state]}
        </p>
        <p className="world-launch-lens">
          Линза: {pressure.label} · {horizon.label.toLowerCase()} · {launchContext.targetFocus.toLowerCase()}
        </p>
      </div>

      <div className="world-layer-switch" role="toolbar" aria-label="Слои интерпретации мира">
        {(['risks', 'resources', 'goals', 'pressure'] as const).map((mode) => (
          <button key={mode} type="button" className={layer === mode ? 'active' : ''} onClick={() => setLayer(mode)}>
            {LAYER_LABEL[mode]}
          </button>
        ))}
      </div>

      <div className="world-domain-readout" aria-live="polite">
        <p className="world-domain-title">{selectedPlanet.label}</p>
        <p>состояние: <strong>{STATE_COPY[selectedPlanet.state]}</strong></p>
        <p>давление: <strong>{pressure.label}</strong></p>
        <p>ресурс: <strong>{selectedDomainNode?.name ?? 'Локальный контур'}</strong></p>
        <p>связанный риск: <strong>{linkedRisk ? DEMO_GRAPH.nodes.find((n) => n.id === linkedRisk.target)?.name : pressure.risk}</strong></p>
        <p>связанная цель: <strong>{linkedGoal ? DEMO_GRAPH.nodes.find((n) => n.id === linkedGoal.target)?.name : 'Стабилизировать систему'}</strong></p>
        <p>рекомендованный переход: <strong>{launchContext.entryModeId === 'forecast' ? 'Перейти в Прогноз' : 'Перейти в Граф причин'}</strong></p>
      </div>

      <div className="world-handoff">
        <button type="button" onClick={() => onModeChange('graph')}>перейти в Граф причин</button>
        <button type="button" className="ghost" onClick={() => onModeChange('oracle')}>перейти в Прогноз</button>
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
          <radialGradient id="selectedFocusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f7ffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9cd5ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {stars.map((star) => (
          <circle key={star.id} cx={`${star.x * 11.2 - 560}`} cy={`${star.y * 6.8 - 340}`} r={star.size} fill="#b9d8ff" opacity={star.opacity * (settings.backgroundDensity / 100)} />
        ))}

        <g opacity="0.34">
          {WORLD_PLANETS.map((planet) => (
            <ellipse
              key={planet.id}
              cx={focusShift.x}
              cy={focusShift.y}
              rx={planet.orbitRadius * camera.zoom}
              ry={planet.orbitRadius * camera.zoom * 0.58}
              stroke="rgba(127, 174, 255, 0.34)"
              strokeWidth={selectedPlanetId === planet.id || pressure.worldPlanetId === planet.id ? 1.6 : 1}
              fill="none"
              opacity={layer === 'pressure' && pressure.worldPlanetId === planet.id ? 0.95 : 0.6}
            />
          ))}
        </g>

        <g>
          <circle cx={focusShift.x} cy={focusShift.y} r={90} fill="url(#coreGradient)" opacity={0.78 + Math.sin(time * 1.5) * 0.08} />
          <circle
            cx={focusShift.x}
            cy={focusShift.y}
            r={126 + Math.sin(time * 0.8) * 8}
            fill="none"
            stroke="#8ad6ff"
            strokeOpacity="0.3"
          />
          <circle
            cx={focusShift.x}
            cy={focusShift.y}
            r={172 + Math.sin(time * 0.42) * 12}
            fill="none"
            stroke="#77b8ff"
            strokeOpacity="0.2"
            strokeDasharray="5 10"
          />
        </g>

        {planets
          .slice()
          .sort((a, b) => a.depth - b.depth)
          .map((planet) => {
            const selected = planet.id === selectedPlanetId;
            const hovered = planet.id === hoveredPlanetId;
            const layerEmphasis = getLayerEmphasis(planet.id);
            const pressureEmphasis = pressure.worldPlanetId === planet.id ? 1.15 : 1;
            const emphasis = (selected ? 1.35 : hovered ? 1.18 : 1) * layerEmphasis * pressureEmphasis;
            const hintEdge = TARGET_EDGE_HINT[launchContext.targetFocus]
              .map((edgeId) => DEMO_GRAPH.edges.find((edge) => edge.id === edgeId))
              .some((edge) => edge?.source === PLANET_TO_DOMAIN_NODE[planet.id] || edge?.target === PLANET_TO_DOMAIN_NODE[planet.id]);

            return (
              <g
                key={planet.id}
                transform={`translate(${planet.x}, ${planet.y})`}
                onMouseEnter={() => setHoveredPlanetId(planet.id)}
                onMouseLeave={() => setHoveredPlanetId(null)}
                onClick={() => onSelectPlanet(planet.id)}
                className="world-planet-hit"
              >
                <circle r={planet.r * (1.55 + (1 - planet.stability) * 0.35)} fill={planet.color} opacity={0.09 + planet.pulse * 0.09} />
                <circle r={planet.r * emphasis} fill={planet.color} opacity={clamp(planet.brightness * 0.7 + planet.pulse * 0.2, 0.42, 0.98)} />

                {(planet.accent === 'ring' || planet.accent === 'shield') && (
                  <ellipse
                    rx={planet.r * (1.42 + (selected ? 0.32 : 0))}
                    ry={planet.r * 0.58}
                    fill="none"
                    stroke={planet.accent === 'shield' ? '#d8f6ff' : '#99c8ff'}
                    strokeOpacity={planet.accent === 'shield' ? 0.85 : 0.65}
                    strokeWidth={selected ? 2 : 1.3}
                  />
                )}

                {planet.accent === 'crack' && (
                  <path
                    d={`M ${-planet.r * 0.38} ${-planet.r * 0.15} L ${-planet.r * 0.1} ${planet.r * 0.1} L ${planet.r * 0.15} ${-planet.r * 0.04} L ${planet.r * 0.34} ${planet.r * 0.32}`}
                    stroke="#ffe3d8"
                    strokeWidth={1.4}
                    opacity={0.85}
                    fill="none"
                  />
                )}

                {planet.accent === 'haze' && <circle r={planet.r * 1.26} fill={planet.color} opacity={0.14} />}

                {(hovered || selected) && (
                  <text x={planet.r + 16} y={5} className="world-planet-label">
                    {planet.label}
                  </text>
                )}

                {selected && <circle r={planet.r * 2.6} fill="url(#selectedFocusGlow)" opacity={0.36 + Math.sin(time * 2.6) * 0.12} />}
                {hintEdge && <circle r={planet.r * 1.8} fill="none" stroke="#b5f8dd" strokeOpacity="0.45" strokeDasharray="4 6" />}
              </g>
            );
          })}
      </svg>
    </div>
  );
};
