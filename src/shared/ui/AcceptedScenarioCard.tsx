import type { AcceptedScenario } from '../../app/state/useSceneState';

const MODE_LABEL: Record<AcceptedScenario['nextMode'], string> = {
  start: 'Вернуться в Старт и запустить новый цикл',
  world: 'Вернуться в Мир и закрепить эффект',
  graph: 'Вернуться в Граф и уточнить причинный фокус',
  oracle: 'Остаться в Оракуле и сверить сценарии',
};

type AcceptedScenarioCardProps = {
  scenario: AcceptedScenario;
  tone?: 'oracle' | 'system';
};

export const AcceptedScenarioCard = ({ scenario, tone = 'system' }: AcceptedScenarioCardProps) => (
  <aside className={`accepted-scenario-card ${tone}`} aria-label="Принятый сценарий">
    <p className="accepted-scenario-title">Принят сценарий: <strong>{scenario.title}</strong></p>
    <p>Тип хода: <strong>{scenario.id}</strong></p>
    <p>Следующий шаг: <strong>{MODE_LABEL[scenario.nextMode]}</strong></p>
  </aside>
);
