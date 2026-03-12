import { useMemo, useState } from 'react';
import type { AppMode } from '../../entities/system/modes';
import { DEMO_GRAPH } from '../graph/model';
import { HORIZONS, PRESSURE_OPTIONS, type LaunchContext } from '../../app/state/launchContext';
import type { AppSettings } from '../../app/state/settingsModel';
import type { AcceptedScenario, ChainContext, OracleExecutionHandoff } from '../../app/state/useSceneState';
import { propagateGraphScenario } from '../graph/engine';
import { AcceptedScenarioCard } from '../../shared/ui/AcceptedScenarioCard';

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
  
  why: string;
  recommended: boolean;
};

const scoreToLabel = (value: number) => (value >= 66 ? 'высокий' : value >= 45 ? 'средний' : 'низкий');

const LENS_LABEL: Record<string, string> = {
  pressure: 'давление',
  resources: 'ресурсы',
  goals: 'цели',
  causes: 'причины',
};

export const OracleMode = ({ launchContext, selectedNodeId, handoff, chainContext, onApplyScenario, onModeChange }: OracleModeProps) => {
  const [postApplyNextMode, setPostApplyNextMode] = useState<AppMode | null>(null);
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
      selectedLens: LENS_LABEL[handoff?.selectedLens ?? 'pressure'] ?? 'давление',
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
        
        why: `Обходит узкое место: ${c.blocker}. Работает через мягкий рычаг: ${c.leverageNode}.`,
        recommended: cautiousRecommended && !collectRecommended,
      },
      {
        id: 'base',
        title: 'Базовый ход · убрать узкое место и запустить рычаг',
        move: 'Снять главное узкое место и выполнить 1 сфокусированный спринт до перезапуска цикла.',
        effect: `Баланс между снижением риска (${scoreToLabel(c.metrics.risk)}) и движением к результату.`,
        risk: 'Средний: нужна дисциплина выполнения в текущем цикле.',
        errorCost: 'Средняя: можно потерять часть окна прогресса.',
        
        why: `Бьёт в узкое место ${c.blocker}, усиливает ${c.leverageNode} и ведёт к ${c.resultNode}.`,
        recommended: baseRecommended,
      },
      {
        id: 'strong',
        title: 'Сильный ход · форсировать результат',
        move: 'Сделать усиленный фокус-блок + дополнительный цикл давления на ключевую цель до конца горизонта.',
        effect: `Максимальный потенциал результата (${scoreToLabel(c.metrics.readiness)} готовность).`,
        risk: 'Высокий: при ошибке возрастает нагрузка и возможен откат.',
        errorCost: 'Высокая: цена промаха заметно выше базового хода.',
        movePotential: 'Сильный прирост, если контур уже стабилен.',
        confidenceFit: lowConfidence ? 'Не рекомендуется при слабой уверенности.' : 'Подходит, когда данные устойчивы.',
        why: `Агрессивно использует рычаг ${c.leverageNode}, но требует контроля риска ${c.pressureSource}.`,
        recommended: strongRecommended,
      },
      {
        id: 'collect-data',
        title: 'Уточнить данные · не форсировать сейчас',
        move: 'Сделать короткую сверку по недостающим сигналам и обновить причинную картину перед сильным ходом.',
        effect: 'Повышает точность выбора, снижает шанс дорогой ошибки.',
        risk: 'Потеря части скорости в обмен на качество решения.',
        errorCost: 'Низкая: максимум небольшой сдвиг по сроку.',
        
        why: `При уверенности ${Math.round(c.confidenceGlobal)}% риск переоценить рычаг выше нормы.`,
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
    setPostApplyNextMode(nextMode);
  };

  return (
    <div className={`oracle-mode oracle-execution ${lowConfidence ? 'is-caution' : ''}`} aria-label="Оракул: выбор сценария">
      <header className="oracle-summary-compact">
        <p className="scene-mode-kicker">Оракул · выбор сценария</p>
        <h3>{oracleContext.activeDomain} · линза «{oracleContext.selectedLens}»</h3>
        <p>Блокер: <strong>{oracleContext.blocker}</strong> · Рычаг: <strong>{oracleContext.leverageNode}</strong></p>
        <p>
          Уверенность модели: <strong>{Math.round(oracleContext.confidenceGlobal)}%</strong> / домен <strong>{Math.round(oracleContext.confidenceDomain)}%</strong>
          {lowConfidence ? <span className="oracle-caution-pill">Режим осторожности: сначала уточнить данные</span> : null}
        </p>
      </header>

      <section className="oracle-scenario-board" aria-label="Сценарии действий">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className={`oracle-scenario-card ${scenario.recommended ? 'recommended' : ''}`}>
            <p className="oracle-card-title">{scenario.title}</p>
            <p>{scenario.move}</p>
            <ul>
              <li><strong>Эффект:</strong> {scenario.effect}</li>
              <li><strong>Риск:</strong> {scenario.risk}</li>
              <li><strong>Цена ошибки:</strong> {scenario.errorCost}</li>
              
            </ul>
            <p className="oracle-card-why">Почему: {scenario.why}</p>
            {scenario.recommended ? <span className="oracle-recommended-mark">Рекомендовано сейчас</span> : null}
          </article>
        ))}
      </section>

      <aside className="oracle-tactical-reasoning" aria-label="Пояснение выбора">
        <h4>Почему выбран этот сценарий</h4>
        <p><strong>Почему выбран:</strong> {recommendedScenario.title}</p>
        <p><strong>Какое узкое место обходит:</strong> {oracleContext.blocker}</p>
        <p><strong>Какой рычаг использует:</strong> {oracleContext.leverageNode}</p>
        <p><strong>Главный риск:</strong> {oracleContext.pressureSource}</p>
        <p><strong>Что при ошибке:</strong> {recommendedScenario.errorCost}</p>
        <p><strong>Если ничего не делать:</strong> давление «{pressure.label.toLowerCase()}» закрепится и риск в узле результата вырастет.</p>
      </aside>

      <div className="oracle-cta-path">
        <button type="button" onClick={() => applyScenario(recommendedScenario)}>Принять сценарий</button>
        <button type="button" className="ghost" onClick={() => onModeChange('graph')}>Вернуться в Граф</button>
        <button type="button" className="ghost" onClick={() => onModeChange('world')}>Вернуться в Мир</button>
        <button type="button" className="ghost" onClick={() => onModeChange('start')}>Вернуться в Старт</button>
      </div>

      {chainContext.lastAcceptedScenario ? <AcceptedScenarioCard scenario={chainContext.lastAcceptedScenario} tone="oracle" /> : null}
      {postApplyNextMode ? (
        <div className="oracle-post-apply">
          <p>Сценарий сохранён. Следующий лучший шаг — <strong>{postApplyNextMode === 'world' ? 'вернуться в Мир' : postApplyNextMode === 'graph' ? 'вернуться в Граф' : 'вернуться в Старт'}</strong>.</p>
          <button type="button" onClick={() => onModeChange(postApplyNextMode)}>Продолжить</button>
        </div>
      ) : null}
    </div>
  );
};
