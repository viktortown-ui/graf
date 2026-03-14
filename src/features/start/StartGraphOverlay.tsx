import { V1_MAJOR_DOMAINS, type GraphStartDomain } from './graphStartModel';

type StartGraphOverlayProps = {
  focusedDomainId: GraphStartDomain['id'] | null;
  selectedEdgeId: string | null;
  pinnedIds: Set<GraphStartDomain['id']>;
};

export const StartGraphOverlay = ({ focusedDomainId, selectedEdgeId, pinnedIds }: StartGraphOverlayProps) => {
  const focusedDomain = V1_MAJOR_DOMAINS.find((domain) => domain.id === focusedDomainId) ?? null;

  return (
    <div className="start-graph-overlay" aria-live="polite">
      <div>
        <p>Центр системы</p>
        <strong>{focusedDomain ? `Фокус: ${focusedDomain.shortTitle}` : 'Ядро ожидает фокус'}</strong>
      </div>
      <div>
        <p>Рёбра</p>
        <strong>{selectedEdgeId ? `Выбрано ${selectedEdgeId}` : 'Выберите связь для инспекции'}</strong>
      </div>
      <div>
        <p>Закреплённые узлы</p>
        <strong>{pinnedIds.size}</strong>
      </div>
    </div>
  );
};
