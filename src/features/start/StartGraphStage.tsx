import { useMemo, useState } from 'react';
import type { AppMode } from '../../entities/system/modes';
import type { LaunchContext } from '../../app/state/launchContext';
import type { ChainContext, StartGraphPersistentState } from '../../app/state/useSceneState';
import type { ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';
import { StartGraphScene } from './StartGraphScene';
import { StartInnerUniverse } from './StartInnerUniverse';
import { StartGraphOverlay } from './StartGraphOverlay';
import { V1_DOMAIN_EDGES, V1_MAJOR_DOMAINS, type GraphStartDomain } from './graphStartModel';

type StartGraphStageProps = {
  selectedNodeName: string;
  launchContext: LaunchContext;
  chainContext: ChainContext;
  confidence: ConfidenceSnapshot;
  startGraph: StartGraphPersistentState;
  onStartGraphChange: (patch: Partial<StartGraphPersistentState>) => void;
  onAnchorChange: (nodeId: string) => void;
  onLaunchContextChange: (context: LaunchContext) => void;
  onLaunch: (mode: AppMode) => void;
};

const RELATION_LABEL = {
  enables: 'усиливает',
  'depends-on': 'зависит',
  stabilizes: 'стабилизирует',
  amplifies: 'ускоряет',
  drains: 'истощает',
} as const;

export const StartGraphStage = ({
  selectedNodeName,
  launchContext,
  chainContext,
  confidence,
  startGraph,
  onStartGraphChange,
  onAnchorChange,
  onLaunchContextChange,
  onLaunch,
}: StartGraphStageProps) => {
  const [anchorPosition, setAnchorPosition] = useState<{ left: number; top: number } | null>(null);
  const { focusedDomainId, selectedEdgeId, activatedToolId, pinnedDomainIds, nodePositions } = startGraph;
  const pinnedIds = useMemo(() => new Set(pinnedDomainIds), [pinnedDomainIds]);

  const focusedDomain = useMemo(
    () => V1_MAJOR_DOMAINS.find((domain) => domain.id === focusedDomainId) ?? null,
    [focusedDomainId],
  );

  const adjacentIds = useMemo(() => {
    if (!focusedDomainId) return new Set<GraphStartDomain['id']>();
    const ids = new Set<GraphStartDomain['id']>();
    V1_DOMAIN_EDGES.forEach((edge) => {
      if (edge.from === focusedDomainId) ids.add(edge.to);
      if (edge.to === focusedDomainId) ids.add(edge.from);
    });
    return ids;
  }, [focusedDomainId]);

  const handleFocusDomain = (domainId: GraphStartDomain['id']) => {
    onStartGraphChange({ focusedDomainId: domainId, activatedToolId: null, selectedEdgeId: null });
    const domain = V1_MAJOR_DOMAINS.find((item) => item.id === domainId);
    if (domain) {
      onAnchorChange(domain.anchorNodeId);
      onLaunchContextChange({ ...launchContext, entryModeId: 'analysis' });
    }
  };

  const togglePin = (domainId: GraphStartDomain['id']) => {
    const next = new Set(pinnedIds);
    if (next.has(domainId)) next.delete(domainId);
    else next.add(domainId);
    onStartGraphChange({ pinnedDomainIds: Array.from(next) });
  };

  const topRelations = V1_DOMAIN_EDGES.filter(
    (edge) => !focusedDomainId || edge.from === focusedDomainId || edge.to === focusedDomainId,
  ).slice(0, 5);

  return (
    <div className="start-graph-v2" aria-label="Графовый старт">
      <header className="start-graph-v2__header">
        <p className="start-graph-v2__kicker">Start / Graph Core v1</p>
        <h2>Живая граф-сцена входа</h2>
        <p>Ядро держит систему, домены реагируют структурно, а выбор открывает внутренний контур как локальный мир.</p>
      </header>

      <section className="start-graph-v2__stage-wrap">
        <StartGraphScene
          focusedDomainId={focusedDomainId}
          nodePositions={nodePositions}
          onDomainFocus={handleFocusDomain}
          onEdgeSelect={(edgeId) => onStartGraphChange({ selectedEdgeId: edgeId })}
          onNodePosition={(domainId, position) => {
            onStartGraphChange({ nodePositions: { ...nodePositions, [domainId]: position } });
          }}
          onRenderedAnchorPosition={setAnchorPosition}
        />
        <StartGraphOverlay focusedDomainId={focusedDomainId} selectedEdgeId={selectedEdgeId} pinnedIds={pinnedIds} />

        {focusedDomain ? (
          <StartInnerUniverse
            domain={focusedDomain}
            attachedPosition={
              anchorPosition
                ? {
                    left: Math.max(16, Math.min(anchorPosition.left + 84, 720)),
                    top: Math.max(120, Math.min(anchorPosition.top - 40, 460)),
                  }
                : null
            }
            activatedToolId={activatedToolId}
            onActivateTool={(toolId) => onStartGraphChange({ activatedToolId: toolId })}
          />
        ) : null}
      </section>

      <section className="start-graph-v2__status-grid">
        <article className="start-graph-v2__panel">
          <h3>Структурная реакция</h3>
          <p>
            Режим: <strong>{focusedDomain ? `фокус на «${focusedDomain.shortTitle}»` : 'ожидание выбора домена'}</strong>
          </p>
          <p>
            Соседние домены: <strong>{focusedDomain ? adjacentIds.size : 0}</strong>
          </p>
          <p>
            Якорь сцены: <strong>{selectedNodeName}</strong>
          </p>
          <p>
            Позиция узла:{' '}
            <strong>{focusedDomainId && nodePositions[focusedDomainId] ? `${nodePositions[focusedDomainId].x}, ${nodePositions[focusedDomainId].y}` : 'стандартный пресет'}</strong>
          </p>
        </article>

        <article className="start-graph-v2__panel">
          <h3>Следующий ход</h3>
          <p>
            Уверенность контура: <strong>{Math.round(confidence.globalConfidence)}%</strong> (сигнал готовности, не обещание результата).
          </p>
          <p>
            Цепочка сейчас: <strong>{chainContext.currentStep}</strong>
          </p>
          <p>
            Инструмент домена: <strong>{activatedToolId ?? 'ещё не активирован'}</strong>
          </p>
          <div className="start-graph-v2__actions">
            <button type="button" onClick={() => onLaunch('graph')}>Открыть режим «Граф»</button>
            <button type="button" onClick={() => onLaunch('world')}>Открыть режим «Мир»</button>
          </div>
        </article>

        <article className="start-graph-v2__panel">
          <h3>Связи и фиксация</h3>
          <ul className="start-graph-v2__relations">
            {topRelations.map((edge) => {
              const from = V1_MAJOR_DOMAINS.find((domain) => domain.id === edge.from)?.shortTitle ?? edge.from;
              const to = V1_MAJOR_DOMAINS.find((domain) => domain.id === edge.to)?.shortTitle ?? edge.to;
              return (
                <li key={edge.id}>
                  <span>
                    {from} → {to}
                  </span>
                  <small>
                    {RELATION_LABEL[edge.relation]} · {edge.strength} · {edge.confidence}
                  </small>
                </li>
              );
            })}
          </ul>

          {focusedDomainId ? (
            <button type="button" className="start-graph-v2__pin" onClick={() => togglePin(focusedDomainId)}>
              {pinnedIds.has(focusedDomainId) ? 'Открепить текущий домен' : 'Закрепить текущий домен'}
            </button>
          ) : (
            <p className="start-graph-v2__hint">Выберите домен на сцене, чтобы закрепить его позицию.</p>
          )}
        </article>
      </section>
    </div>
  );
};
