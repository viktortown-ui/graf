import { useMemo, useState } from 'react';
import type { AppMode } from '../../entities/system/modes';
import type { LaunchContext } from '../../app/state/launchContext';
import type { ChainContext, StartGraphPersistentState } from '../../app/state/useSceneState';
import type { ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';
import { StartGraphScene } from './StartGraphScene';
import { StartInnerUniverse } from './StartInnerUniverse';
import { StartGraphOverlay } from './StartGraphOverlay';
import {
  DEFAULT_RELATION_USER_MODIFIER,
  RELATION_ACTIVATION_LABEL,
  RELATION_CONFIDENCE_LABEL,
  RELATION_STATE_LABEL,
  RELATION_STRENGTH_LABEL,
  RELATION_TYPE_LABEL,
  V1_MAJOR_DOMAINS,
  V1_NATIVE_RELATION_MATRIX,
  getEffectiveStrength,
  resolveEffectiveRelationState,
  type GraphStartDomain,
  type GraphRelationMatrixEntry,
  type UserRelationModifier,
} from './graphStartModel';

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

type EffectiveRelationView = GraphRelationMatrixEntry & {
  edgeId: string;
  userModifier: UserRelationModifier;
  effectiveStrength: 'low' | 'med' | 'high';
  effectiveState: 'active' | 'muted' | 'disabled' | 'weak' | 'hypothesis';
};

const toEdgeId = (relationId: string) => `edge:${relationId}`;

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
  const { focusedDomainId, selectedEdgeId, activatedToolId, pinnedDomainIds, nodePositions, relationModifiers } = startGraph;
  const pinnedIds = useMemo(() => new Set(pinnedDomainIds), [pinnedDomainIds]);

  const effectiveRelations = useMemo<EffectiveRelationView[]>(() => {
    return V1_NATIVE_RELATION_MATRIX.map((relation) => {
      const userModifier = relationModifiers[relation.id] ?? DEFAULT_RELATION_USER_MODIFIER;
      const effectiveStrength = getEffectiveStrength(relation.defaultStrength, userModifier.strengthDelta);
      const effectiveState = resolveEffectiveRelationState(relation, userModifier);
      return {
        ...relation,
        edgeId: toEdgeId(relation.id),
        userModifier,
        effectiveStrength,
        effectiveState,
      };
    });
  }, [relationModifiers]);

  const selectedRelation = useMemo(
    () => effectiveRelations.find((relation) => relation.edgeId === selectedEdgeId) ?? null,
    [effectiveRelations, selectedEdgeId],
  );

  const focusedDomain = useMemo(
    () => V1_MAJOR_DOMAINS.find((domain) => domain.id === focusedDomainId) ?? null,
    [focusedDomainId],
  );

  const adjacentIds = useMemo(() => {
    if (!focusedDomainId) return new Set<GraphStartDomain['id']>();
    const ids = new Set<GraphStartDomain['id']>();
    effectiveRelations.forEach((relation) => {
      if (relation.source === focusedDomainId) ids.add(relation.target);
      if (relation.target === focusedDomainId) ids.add(relation.source);
    });
    return ids;
  }, [focusedDomainId, effectiveRelations]);

  const topRelations = effectiveRelations
    .filter((relation) => !focusedDomainId || relation.source === focusedDomainId || relation.target === focusedDomainId)
    .slice(0, 5);

  const updateRelationModifier = (relationId: string, patch: Partial<UserRelationModifier>) => {
    const current = relationModifiers[relationId] ?? DEFAULT_RELATION_USER_MODIFIER;
    onStartGraphChange({
      relationModifiers: {
        ...relationModifiers,
        [relationId]: {
          ...current,
          ...patch,
        },
      },
    });
  };

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
          selectedEdgeId={selectedEdgeId}
          relationModifiers={relationModifiers}
          nodePositions={nodePositions}
          onDomainFocus={handleFocusDomain}
          onEdgeSelect={(edgeId) => onStartGraphChange({ selectedEdgeId: edgeId })}
          onNodePosition={(domainId, position) => {
            onStartGraphChange({ nodePositions: { ...nodePositions, [domainId]: position } });
          }}
          onRenderedAnchorPosition={setAnchorPosition}
        />
        <StartGraphOverlay focusedDomainId={focusedDomainId} selectedEdgeId={selectedEdgeId} pinnedIds={pinnedIds} />

        {selectedRelation ? (
          <aside
            className="start-graph-relation-inspector"
            style={
              anchorPosition
                ? {
                    left: Math.max(16, Math.min(anchorPosition.left + 96, 780)),
                    top: Math.max(96, Math.min(anchorPosition.top + 48, 520)),
                  }
                : undefined
            }
          >
            <p className="start-graph-relation-inspector__kicker">Связь доменов</p>
            <h4>
              {V1_MAJOR_DOMAINS.find((d) => d.id === selectedRelation.source)?.shortTitle} →{' '}
              {V1_MAJOR_DOMAINS.find((d) => d.id === selectedRelation.target)?.shortTitle}
            </h4>
            <p>
              {RELATION_TYPE_LABEL[selectedRelation.relationType]} · {RELATION_STATE_LABEL[selectedRelation.effectiveState]}
            </p>
            <dl>
              <div>
                <dt>Тип</dt>
                <dd>{RELATION_TYPE_LABEL[selectedRelation.relationType]}</dd>
              </div>
              <div>
                <dt>Базовая сила</dt>
                <dd>{RELATION_STRENGTH_LABEL[selectedRelation.defaultStrength]}</dd>
              </div>
              <div>
                <dt>Текущая сила</dt>
                <dd>{RELATION_STRENGTH_LABEL[selectedRelation.effectiveStrength]}</dd>
              </div>
              <div>
                <dt>Уверенность модели</dt>
                <dd>{RELATION_CONFIDENCE_LABEL[selectedRelation.defaultConfidence]}</dd>
              </div>
              <div>
                <dt>Режим активации</dt>
                <dd>{RELATION_ACTIVATION_LABEL[selectedRelation.activationMode]}</dd>
              </div>
            </dl>

            <div className="start-graph-relation-inspector__controls">
              <p>Управление связью</p>
              <div>
                <button
                  type="button"
                  disabled={selectedRelation.activationMode === 'always_on'}
                  onClick={() =>
                    updateRelationModifier(selectedRelation.id, {
                      muted: !selectedRelation.userModifier.muted,
                      disabled: false,
                      stateOverride: null,
                    })
                  }
                >
                  {selectedRelation.userModifier.muted ? 'Вернуть нормальную яркость' : 'Приглушить связь'}
                </button>
                <button
                  type="button"
                  disabled={selectedRelation.activationMode === 'always_on'}
                  onClick={() =>
                    updateRelationModifier(selectedRelation.id, {
                      disabled: !selectedRelation.userModifier.disabled,
                      muted: false,
                      stateOverride: null,
                    })
                  }
                >
                  {selectedRelation.userModifier.disabled ? 'Включить обратно' : 'Отключить связь'}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() =>
                    updateRelationModifier(selectedRelation.id, {
                      strengthDelta: Math.max(-1, selectedRelation.userModifier.strengthDelta - 1) as -1 | 0 | 1,
                    })
                  }
                >
                  Ослабить
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateRelationModifier(selectedRelation.id, {
                      strengthDelta: Math.min(1, selectedRelation.userModifier.strengthDelta + 1) as -1 | 0 | 1,
                    })
                  }
                >
                  Усилить
                </button>
              </div>
            </div>
          </aside>
        ) : null}

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
          <h3>Нативные связи</h3>
          <ul className="start-graph-v2__relations">
            {topRelations.map((relation) => {
              const from = V1_MAJOR_DOMAINS.find((domain) => domain.id === relation.source)?.shortTitle ?? relation.source;
              const to = V1_MAJOR_DOMAINS.find((domain) => domain.id === relation.target)?.shortTitle ?? relation.target;
              return (
                <li key={relation.id}>
                  <span>
                    {from} → {to}
                  </span>
                  <small>
                    {RELATION_TYPE_LABEL[relation.relationType]} · {RELATION_STRENGTH_LABEL[relation.effectiveStrength]} ·{' '}
                    {RELATION_STATE_LABEL[relation.effectiveState]}
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
