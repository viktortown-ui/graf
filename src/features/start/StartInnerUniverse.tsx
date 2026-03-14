import type { GraphStartDomain } from './graphStartModel';

type StartInnerUniverseProps = {
  domain: GraphStartDomain;
  attachedPosition: { left: number; top: number } | null;
  activatedToolId: string | null;
  onActivateTool: (toolId: string) => void;
};

const TOOL_STATUS_LABEL = {
  available: 'доступен',
  structured: 'ожидает сигналы',
  locked: 'заблокирован',
} as const;

const DEPTH_STATUS_LABEL = {
  ready: 'готово',
  tracking: 'наблюдение',
  locked: 'закрыто',
} as const;

export const StartInnerUniverse = ({ domain, attachedPosition, activatedToolId, onActivateTool }: StartInnerUniverseProps) => {
  const nextUnlock = domain.firstLayerNodes.find((node) => node.status === 'locked');

  return (
    <aside
      className="start-inner-universe"
      style={
        attachedPosition
          ? {
              left: `${attachedPosition.left}px`,
              top: `${attachedPosition.top}px`,
            }
          : undefined
      }
      aria-label={`Внутренний контур: ${domain.title}`}
    >
      <header>
        <p>Внутренний контур</p>
        <h3>{domain.title}</h3>
        <small>
          {domain.depthLayerLabel} · {domain.depthLayerSummary}
        </small>
      </header>

      <section>
        <p className="start-inner-universe__label">Локальная структура</p>
        <ul>
          {domain.firstLayerNodes.map((node) => (
            <li key={node.id} className={`depth-node ${node.status}`}>
              <div>
                <strong>{node.label}</strong>
                <small>{node.note}</small>
              </div>
              <em>{DEPTH_STATUS_LABEL[node.status]}</em>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="start-inner-universe__label">Встроенные инструменты</p>
        <ul>
          {domain.tools.map((tool) => (
            <li key={tool.id} className={`tool-card ${tool.status}`}>
              <div>
                <strong>{tool.name}</strong>
                <small>{tool.note}</small>
              </div>
              <button type="button" disabled={tool.status === 'locked'} onClick={() => onActivateTool(tool.id)}>
                {tool.status === 'available' ? 'Запустить' : 'Проверить'}
              </button>
              <em>{TOOL_STATUS_LABEL[tool.status]}</em>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        <p>
          Сигнал готовности: <strong>{nextUnlock ? `Следующий unlock: ${nextUnlock.label}` : 'Базовый слой открыт'}</strong>
        </p>
        <p>
          Активный инструмент: <strong>{activatedToolId ?? 'не выбран'}</strong>
        </p>
      </footer>
    </aside>
  );
};
