import { useMemo, useState } from 'react';
import type { AppMode } from '../../entities/system/modes';
import type { LaunchContext } from '../../app/state/launchContext';
import type { ChainContext } from '../../app/state/useSceneState';
import type { ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';
import { V1_DOMAIN_EDGES, V1_MAJOR_DOMAINS, type DomainState, type GraphStartDomain } from './graphStartModel';

type StartModeProps = {
  selectedNodeName: string;
  launchContext: LaunchContext;
  chainContext: ChainContext;
  confidence: ConfidenceSnapshot;
  onAnchorChange: (nodeId: string) => void;
  onLaunchContextChange: (context: LaunchContext) => void;
  onLaunch: (mode: AppMode) => void;
};

const DOMAIN_POSITIONS: Record<GraphStartDomain['id'], { x: number; y: number }> = {
  'energy-state': { x: 50, y: 12 },
  'stability-constraints': { x: 20, y: 32 },
  'direction-commitments': { x: 28, y: 72 },
  'execution-delivery': { x: 72, y: 72 },
  'capability-craft': { x: 80, y: 32 },
};

const RELATION_LABEL = {
  enables: 'усиливает',
  'depends-on': 'зависит',
  stabilizes: 'стабилизирует',
  amplifies: 'ускоряет',
  drains: 'истощает',
} as const;

const TOOL_STATUS_LABEL = {
  available: 'доступен',
  structured: 'готов после данных',
  locked: 'заблокирован',
} as const;

export const StartMode = ({
  selectedNodeName,
  launchContext,
  chainContext,
  confidence,
  onAnchorChange,
  onLaunchContextChange,
  onLaunch,
}: StartModeProps) => {
  const [selectedDomainId, setSelectedDomainId] = useState<GraphStartDomain['id'] | null>(null);
  const [activatedToolId, setActivatedToolId] = useState<string | null>(null);

  const selectedDomain = useMemo(
    () => V1_MAJOR_DOMAINS.find((domain) => domain.id === selectedDomainId) ?? null,
    [selectedDomainId],
  );

  const adjacentIds = useMemo(() => {
    if (!selectedDomainId) return new Set<GraphStartDomain['id']>();
    const ids = new Set<GraphStartDomain['id']>();
    V1_DOMAIN_EDGES.forEach((edge) => {
      if (edge.from === selectedDomainId) ids.add(edge.to);
      if (edge.to === selectedDomainId) ids.add(edge.from);
    });
    return ids;
  }, [selectedDomainId]);

  const domainState = (domainId: GraphStartDomain['id']): DomainState => {
    if (!selectedDomainId) return 'inactive';
    if (domainId === selectedDomainId) return 'active';
    if (adjacentIds.has(domainId)) return 'adjacent';
    return 'locked';
  };

  const handleSelectDomain = (domain: GraphStartDomain) => {
    setSelectedDomainId(domain.id);
    setActivatedToolId(null);
    onAnchorChange(domain.anchorNodeId);
    onLaunchContextChange({ ...launchContext, entryModeId: 'analysis' });
  };

  const nextUnlock = selectedDomain?.firstLayerNodes.find((node) => node.status === 'locked') ?? null;

  return (
    <div className="start-graph-v1" aria-label="Графовый старт">
      <header className="start-graph-v1__header">
        <p className="start-graph-v1__kicker">Старт = первый активный режим графа</p>
        <h2>Выберите домен, чтобы активировать систему</h2>
        <p>Подстанция данных остаётся отдельным контуром истины. Здесь — живая карта входа и первый слой действий.</p>
      </header>

      <section className="start-graph-v1__stage" aria-live="polite">
        <div className={`start-graph-v1__core ${selectedDomain ? 'active' : ''}`}>
          <p>Ядро</p>
          <strong>{selectedDomain?.shortTitle ?? 'Выберите точку входа'}</strong>
          <small>{selectedDomain ? 'Контур активирован' : '5 доменов готовы к запуску'}</small>
        </div>

        <svg className="start-graph-v1__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {V1_DOMAIN_EDGES.map((edge) => {
            const from = DOMAIN_POSITIONS[edge.from];
            const to = DOMAIN_POSITIONS[edge.to];
            const active = Boolean(selectedDomainId);
            const focused = selectedDomainId === edge.from || selectedDomainId === edge.to;
            const edgeClass = focused ? 'is-focused' : active ? 'is-visible' : 'is-muted';
            return <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={edgeClass} />;
          })}
        </svg>

        {V1_MAJOR_DOMAINS.map((domain) => {
          const state = domainState(domain.id);
          const pos = DOMAIN_POSITIONS[domain.id];
          return (
            <button
              key={domain.id}
              type="button"
              className={`start-domain-node ${state}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => handleSelectDomain(domain)}
            >
              <span className="start-domain-node__title">{domain.title}</span>
              <small>{domain.summary}</small>
            </button>
          );
        })}

        {selectedDomain ? (
          <aside className="start-domain-expansion" data-side={DOMAIN_POSITIONS[selectedDomain.id].x > 50 ? 'left' : 'right'}>
            <h3>{selectedDomain.title}: первый слой</h3>
            <p className="start-domain-expansion__depth">
              <strong>{selectedDomain.depthLayerLabel}</strong> · {selectedDomain.depthLayerSummary}
            </p>

            <div className="start-domain-expansion__section">
              <p className="start-domain-expansion__label">Узлы глубины</p>
              <ul>
                {selectedDomain.firstLayerNodes.map((node) => (
                  <li key={node.id} className={`depth-node ${node.status}`}>
                    <span>{node.label}</span>
                    <small>{node.note}</small>
                  </li>
                ))}
              </ul>
            </div>

            <div className="start-domain-expansion__section">
              <p className="start-domain-expansion__label">Встроенные инструменты</p>
              <ul>
                {selectedDomain.tools.map((tool) => (
                  <li key={tool.id} className={`tool-card ${tool.status}`}>
                    <div>
                      <strong>{tool.name}</strong>
                      <small>{tool.note}</small>
                    </div>
                    <button type="button" disabled={tool.status === 'locked'} onClick={() => setActivatedToolId(tool.id)}>
                      {tool.status === 'available' ? 'Открыть вход' : 'Проверить готовность'}
                    </button>
                    <em>{TOOL_STATUS_LABEL[tool.status]}</em>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="start-graph-v1__status-grid">
        <article className="start-graph-v1__panel">
          <h3>Реакция графа</h3>
          <p>
            Состояние: <strong>{selectedDomain ? 'домен в фокусе' : 'ожидание выбора ядра'}</strong>
          </p>
          <p>
            Связанные домены: <strong>{selectedDomain ? adjacentIds.size : 0}</strong>
          </p>
          <p>
            Якорь сцены: <strong>{selectedNodeName}</strong>
          </p>
          <p>
            Инструмент: <strong>{activatedToolId ? 'вход активирован, контур обновлён' : 'ещё не активирован'}</strong>
          </p>
        </article>

        <article className="start-graph-v1__panel">
          <h3>Следующий структурный ход</h3>
          <p>
            Следующий unlock:{' '}
            <strong>{nextUnlock ? `${nextUnlock.label}: ${nextUnlock.note}` : 'выберите домен, чтобы увидеть условие открытия'}</strong>
          </p>
          <p>
            Уверенность контура: <strong>{Math.round(confidence.globalConfidence)}%</strong> (структурный сигнал, не прогноз-вердикт).
          </p>
          <p className="start-graph-v1__meta">Текущий шаг цепочки: {chainContext.currentStep}. Глубокий маршрут пока упрощён намеренно.</p>
          <div className="start-graph-v1__actions">
            <button type="button" onClick={() => onLaunch('graph')}>Перейти в Граф</button>
            <button type="button" onClick={() => onLaunch('world')}>Перейти в Мир</button>
          </div>
        </article>

        <article className="start-graph-v1__panel">
          <h3>Активные связи</h3>
          <ul className="start-graph-v1__relations">
            {V1_DOMAIN_EDGES.filter((edge) => !selectedDomainId || edge.from === selectedDomainId || edge.to === selectedDomainId)
              .slice(0, 4)
              .map((edge) => {
                const from = V1_MAJOR_DOMAINS.find((domain) => domain.id === edge.from)?.shortTitle ?? edge.from;
                const to = V1_MAJOR_DOMAINS.find((domain) => domain.id === edge.to)?.shortTitle ?? edge.to;
                return (
                  <li key={edge.id}>
                    <span>{from} → {to}</span>
                    <small>{RELATION_LABEL[edge.relation]} · {edge.strength} · {edge.confidence}</small>
                  </li>
                );
              })}
          </ul>
        </article>
      </section>
    </div>
  );
};
