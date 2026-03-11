import { useMemo } from 'react';
import type { AppMode } from '../../entities/system/modes';
import { DEMO_GRAPH } from '../graph/model';
import { HORIZONS, PRESSURE_OPTIONS, type LaunchContext } from '../../app/state/launchContext';
import type { AppSettings } from '../../app/state/settingsModel';
import type { AcceptedScenario, ChainContext, OracleExecutionHandoff } from '../../app/state/useSceneState';
import { propagateGraphScenario } from '../graph/engine';

type Horizon = 3 | 7 | 14;
type ScenarioTone = 'cautious' | 'base' | 'strong' | 'collect-data';

type OracleModeProps = {
  settings: AppSettings;
  launchContext: LaunchContext;
  selectedNodeId: string;
  sharedLens: {
    panX: number;
    panY: number;
    zoom: number;
  };
  handoff: OracleExecutionHandoff | null;
  chainContext: ChainContext;
  onApplyScenario: (scenario: AcceptedScenario) => void;
  onModeChange: (mode: AppMode) => void;
};

type ScenarioCard = {
  id: ScenarioTone;
  title: string;
  move: string;
  effect: string;
  risk: string;
  errorCost: string;
  movePotential: string;
  confidenceFit: string;
  why: string;
  recommended: boolean;
};

const scoreToLabel = (value: number) => (value >= 66 ? 'высокий' : value >= 45 ? 'средний' : 'низкий');

export const OracleMode = ({ launchContext, selectedNodeId, handoff, chainContext, onApplyScenario, onModeChange }: OracleModeProps) => {
  const pressure = PRESSURE_OPTIONS.find((option) => option.id === launchContext.pressureId) ?? PRESSURE_OPTIONS[0];
  const horizon = (HORIZONS.find((entry) => entry.id === launchContext.horizonId)?.oracleHorizon ?? 7) as Horizon;

  const selectedNode = useMemo(() => DEMO_GRAPH.nodes.find((node) => node.id === selectedNodeId) ?? DEMO_GRAPH.nodes[0], [selectedNodeId]);

  const oracleContext = useMemo(() => {
    const fallback = propagateGraphScenario(DEMO_GRAPH, horizon);
    const fallbackRisk = fallback.filter((node) => node.type === 'risk').sort((a, b) => b.state - a.state)[0] ?? fallback[0];
    const fallbackAction = fallback.filter((node) => node.type === 'action').sort((a, b) => b.state - a.state)[0] ?? fallback[0];
    const fallbackGoal = fallback.filter((node) => node.type === 'goal').sort((a, b) => b.state - a.state)[0] ?? fallback[0];

    return {
      activeDomain: handoff?.activeDomain.label ?? 'Работа',
      selectedLens: handoff?.selectedLens ?? 'pressure',
      pressureSource: handoff?.pressureSource ?? `${pressure.label} → ${fallbackRisk.name}`,
      blocker: handoff?.blocker ?? `${fallbackRisk.name} блокирует ${selectedNode.name}`,
      leverageNode: handoff?.leverageNode ?? fallbackAction.name,
      resultNode: handoff?.resultNode ?? fallbackGoal.name,
      confidenceGlobal: handoff?.confidence.global ?? 55,
      confidenceDomain: handoff?.confidence.domain ?? 52,
      metrics: handoff?.derivedMetrics ?? {
        pressure: 58,
        risk: 55,
        leverage: 54,
        stability: 50,
        readiness: 51,
      },
      recommendedTransition: handoff?.recommendedTransition ?? 'oracle',
    };
  }, [handoff, horizon, pressure.label, selectedNode.name]);

  const lowConfidence = oracleContext.confidenceGlobal < 58 || oracleContext.confidenceDomain < 52;

  const scenarios = useMemo<ScenarioCard[]>(() => {
    const c = oracleContext;
    const cautiousRecommended = c.metrics.risk > 62 || c.metrics.stability < 47;
    const strongRecommended = !lowConfidence && c.metrics.leverage > 61 && c.metrics.readiness > 54;
    const baseRecommended = !cautiousRecommended && !strongRecommended && !lowConfidence;
    const collectRecommended = lowConfidence;

    return [
      {
        id: 'cautious',
        title: 'Осторожный ход · стабилизировать контур',
        move: 'На ближайшие 2 часа убрать 1 главный отвлекающий блок и закрепить один короткий ритуал фокуса.',
        effect: `Снижение давления (${scoreToLabel(c.metrics.pressure)}) и возврат контролируемого ритма.`,
        risk: 'Медленный прогресс по цели, но меньше вероятность срыва.',
        errorCost: 'Низкая: потеряете темп, но не сломаете контур.',
        movePotential: 'Надёжный, если система уже перегружена.',
        confidenceFit: lowConfidence ? 'Хорошо подходит при низкой уверенности.' : 'Подходит, если нужна мягкая стабилизация.',
        why: `Обходит blocker: ${c.blocker}. Работает через мягкий leverage: ${c.leverageNode}.`,
        recommended: cautiousRecommended && !collectRecommended,
      },
      {
        id: 'base',
        title: 'Базовый ход · убрать blocker + запустить рычаг',
        move: 'Снять главный blocker и выполнить 1 сфокусированный спринт до перезапуска цикла.',
        effect: `Баланс между снижением риска (${scoreToLabel(c.metrics.risk)}) и движением к результату.`,
        risk: 'Средний: нужна дисциплина выполнения в текущем цикле.',
        errorCost: 'Средняя: можно потерять часть окна прогресса.',
        movePotential: 'Лучший компромисс для большинства ситуаций.',
        confidenceFit: lowConfidence ? 'Можно делать только в облегчённой версии.' : 'Оптимальный при текущей уверенности.',
        why: `Бьёт в узкое место ${c.blocker}, усиливает ${c.leverageNode} и ведёт к ${c.resultNode}.`,
        recommended: baseRecommended,
      },
      {
        id: 'strong',
        title: 'Сильный ход · форсировать результат',
        move: 'Сделать усиленный фокус-блок + дополнительный цикл давления на ключевую цель до конца горизонта.',
        effect: `Максимальный апсайд по результату (${scoreToLabel(c.metrics.readiness)} readiness).`,
        risk: 'Высокий: при ошибке возрастает нагрузка и возможен откат.',
        errorCost: 'Высокая: цена промаха заметно выше базового хода.',
        movePotential: 'Сильный прирост, если контур уже стабилен.',
        confidenceFit: lowConfidence ? 'Не рекомендуется при слабой уверенности.' : 'Подходит, когда данные устойчивы.',
        why: `Агрессивно использует leverage ${c.leverageNode}, но требует контроля риска ${c.pressureSource}.`,
        recommended: strongRecommended,
      },
      {
        id: 'collect-data',
        title: 'Уточнить данные · не форсировать сейчас',
        move: 'Сделать короткий check-in по недостающим сигналам и обновить causal картину перед сильным ходом.',
        effect: 'Повышает точность выбора, снижает шанс дорогой ошибки.',
        risk: 'Потеря части скорости в обмен на качество решения.',
        errorCost: 'Низкая: максимум небольшой сдвиг по сроку.',
        movePotential: 'Открывает путь к более сильному сценарию на следующем шаге.',
        confidenceFit: lowConfidence ? 'Лучшее соответствие при низком confidence.' : 'Опционально, если есть сомнения в данных.',
        why: `При confidence ${Math.round(c.confidenceGlobal)}% риск переоценить leverage выше нормы.`,
        recommended: collectRecommended,
      },
    ];
  }, [lowConfidence, oracleContext]);

  const recommendedScenario = scenarios.find((entry) => entry.recommended) ?? scenarios[1];

  const applyScenario = (scenario: ScenarioCard) => {
    const nextMode = scenario.id === 'collect-data' ? 'start' : scenario.id === 'cautious' ? 'world' : 'graph';
    onApplyScenario({
      id: scenario.id,
      title: scenario.title,
      move: scenario.move,
      sourceDomain: oracleContext.activeDomain,
      nextMode,
    });
    onModeChange(nextMode);
  };

  return (
    <div className={`oracle-mode oracle-execution ${lowConfidence ? 'is-caution' : ''}`} aria-label="Oracle 2.0 выбор сценария">
      <div className="chain-route-memory" aria-label="Маршрут GRAF">
        {(['start', 'world', 'graph', 'oracle'] as const).map((step) => (
          <span key={step} className={`chain-step ${chainContext.currentStep === step ? 'active' : ''} ${chainContext.routeMemory.includes(step) ? 'visited' : ''}`}>
            {step === 'start' ? 'Start' : step === 'world' ? 'Мир' : step === 'graph' ? 'Graph' : 'Oracle'}
          </span>
        ))}
      </div>
      <header className="oracle-summary-compact">
        <p className="scene-mode-kicker">Oracle 2.0 · execution chooser</p>
        <h3>{oracleContext.activeDomain} · линза «{oracleContext.selectedLens}»</h3>
        <p>Blocker: <strong>{oracleContext.blocker}</strong> · Leverage: <strong>{oracleContext.leverageNode}</strong></p>
        <p>
          Confidence: <strong>{Math.round(oracleContext.confidenceGlobal)}%</strong> / domain <strong>{Math.round(oracleContext.confidenceDomain)}%</strong>
          {lowConfidence ? <span className="oracle-caution-pill">Caution mode: сначала уточнить данные</span> : null}
        </p>
      </header>

      <section className="oracle-scenario-board" aria-label="Сценарии действий">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className={`oracle-scenario-card ${scenario.recommended ? 'recommended' : ''}`}>
            <p className="oracle-card-title">{scenario.title}</p>
            <p>{scenario.move}</p>
            <ul>
              <li><strong>Effect:</strong> {scenario.effect}</li>
              <li><strong>Risk:</strong> {scenario.risk}</li>
              <li><strong>Error cost:</strong> {scenario.errorCost}</li>
              <li><strong>Move potential:</strong> {scenario.movePotential}</li>
              <li><strong>Confidence fit:</strong> {scenario.confidenceFit}</li>
            </ul>
            <p className="oracle-card-why">Почему: {scenario.why}</p>
            {scenario.recommended ? <span className="oracle-recommended-mark">Рекомендовано сейчас</span> : null}
          </article>
        ))}
      </section>

      <aside className="oracle-tactical-reasoning" aria-label="Tactical reasoning panel">
        <h4>Tactical reasoning panel</h4>
        <p><strong>Почему выбран:</strong> {recommendedScenario.title}</p>
        <p><strong>Какой blocker обходит:</strong> {oracleContext.blocker}</p>
        <p><strong>Какой leverage использует:</strong> {oracleContext.leverageNode}</p>
        <p><strong>Главный риск:</strong> {oracleContext.pressureSource}</p>
        <p><strong>Что при ошибке:</strong> {recommendedScenario.errorCost}</p>
        <p><strong>Если ничего не делать:</strong> давление «{pressure.label.toLowerCase()}» закрепится и риск в узле результата вырастет.</p>
      </aside>

      <div className="oracle-cta-path">
        <button type="button" onClick={() => applyScenario(recommendedScenario)}>Принять сценарий: {recommendedScenario.title}</button>
        <button type="button" className="ghost" onClick={() => onModeChange('graph')}>Вернуться в Graph</button>
        <button type="button" className="ghost" onClick={() => onModeChange('world')}>Вернуться в Мир</button>
        <button type="button" className="ghost" onClick={() => onModeChange('start')}>Подкрутить запуск в Start</button>
      </div>

      {chainContext.lastAcceptedScenario ? (
        <aside className="oracle-accepted-state" aria-label="Принятый сценарий">
          <p>Принятый сценарий: <strong>{chainContext.lastAcceptedScenario.title}</strong></p>
          <p>Тип хода: <strong>{chainContext.lastAcceptedScenario.id}</strong> · следующий шаг: <strong>{chainContext.lastAcceptedScenario.nextMode === 'world' ? 'Мир' : chainContext.lastAcceptedScenario.nextMode === 'graph' ? 'Graph' : 'Start'}</strong></p>
        </aside>
      ) : null}
    </div>
  );
};
