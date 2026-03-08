import type { ForecastResult, GraphModel, Mode } from '../domain/types';

const modeTitles: Record<Mode, string> = {
  start: 'Activation Orbit',
  world: 'Living World Projection',
  graph: 'System Graph Lens',
  oracle: 'Oracle Forecast Lens',
};

type SceneCanvasProps = {
  mode: Mode;
  model: GraphModel;
  forecast: ForecastResult;
};

export const SceneCanvas = ({ mode, model, forecast }: SceneCanvasProps) => {
  const nodeLookup = new Map(model.nodes.map((node) => [node.id, node]));

  return (
    <section className={`scene mode-${mode}`}>
      <header className="scene-header">
        <h1>{modeTitles[mode]}</h1>
        <p>
          Tick {model.tick} · Deterministic local state engine · {model.nodes.length} domains · {model.edges.length}{' '}
          influences
        </p>
      </header>

      <div className="scene-core" role="img" aria-label="Cosmic graph scene">
        <div className="core-pulse" />

        <svg className="influence-layer" viewBox="0 0 100 100" aria-hidden="true">
          {model.edges.map((edge) => {
            const from = nodeLookup.get(edge.from);
            const to = nodeLookup.get(edge.to);
            if (!from || !to) {
              return null;
            }

            const x1 = 50 + Math.cos((from.angle * Math.PI) / 180) * from.distance;
            const y1 = 50 + Math.sin((from.angle * Math.PI) / 180) * from.distance;
            const x2 = 50 + Math.cos((to.angle * Math.PI) / 180) * to.distance;
            const y2 = 50 + Math.sin((to.angle * Math.PI) / 180) * to.distance;

            return (
              <line
                key={edge.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={0.3 + edge.influence * 0.65}
                stroke="rgba(124, 211, 255, 0.45)"
              />
            );
          })}
        </svg>

        {model.nodes.map((node) => (
          <article
            key={node.id}
            className="planet"
            style={{
              left: `${50 + Math.cos((node.angle * Math.PI) / 180) * node.distance}%`,
              top: `${50 + Math.sin((node.angle * Math.PI) / 180) * node.distance}%`,
            }}
          >
            <span className="planet-label">{node.label}</span>
            <span className="planet-state">{Math.round(node.state * 100)}%</span>
          </article>
        ))}

        {mode === 'oracle' && (
          <div className="oracle-strip">
            {forecast.snapshots.slice(0, 6).map((snapshot) => (
              <div key={snapshot.step} className="oracle-step">
                <p>+{snapshot.step}</p>
                <p>{Math.round((snapshot.nodeState.focus ?? 0) * 100)} F</p>
                <p>{Math.round((snapshot.nodeState.craft ?? 0) * 100)} C</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
