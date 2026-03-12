import type { AppMode } from '../../entities/system/modes';
import { OverviewHeroVisual } from './OverviewHeroVisual';

type OverviewModeProps = {
  onModeChange: (mode: AppMode) => void;
};

type SceneSectionProps = {
  tone: 'world' | 'graph' | 'oracle';
  title: string;
  subtitle: string;
};

const SceneSection = ({ tone, title, subtitle }: SceneSectionProps) => (
  <section className={`overview-scene overview-scene-${tone}`} aria-label={title}>
    <div className="overview-scene-visual" role="img" aria-label={`${title}: визуальная сцена`}>
      <div className="overview-scene-overlay">
        <p className="scene-mode-kicker">{title}</p>
        <h3>{subtitle}</h3>
      </div>
    </div>
  </section>
);

export const OverviewMode = ({ onModeChange }: OverviewModeProps) => (
  <div className="overview-mode">
    <section className="overview-hero" aria-label="Обзор GRAF">
      <OverviewHeroVisual />
      <div className="overview-hero-copy">
        <p className="scene-mode-kicker">Иммерсивный обзор</p>
        <h2 className="scene-mode-title">GRAF собирает Мир, Граф и Оракул в единый контур решений.</h2>
        <p className="scene-mode-copy">Одна сцена — чтобы увидеть состояние, найти источник давления и выбрать следующий ход без потери контекста.</p>
        <div className="overview-cta-row">
          <button type="button" onClick={() => onModeChange('start')}>
            Перейти в старт
          </button>
          <button type="button" className="ghost" onClick={() => onModeChange('world')}>
            Открыть мир
          </button>
        </div>
      </div>
    </section>

    <SceneSection
      tone="world"
      title="Мир"
      subtitle="Карта состояния доменов, зон давления и контуров устойчивости."
    />
    <SceneSection
      tone="graph"
      title="Граф"
      subtitle="Причинные связи, корни проблем и рычаги, которые меняют траекторию."
    />
    <SceneSection
      tone="oracle"
      title="Оракул"
      subtitle="Сценарии развития, прогноз последствий и следующий лучший шаг."
    />

    <section className="overview-final" aria-label="Финальный вход">
      <p className="scene-mode-kicker">Вход в контур</p>
      <h3>Запустите старт и перейдите от картины к действию.</h3>
      <button type="button" onClick={() => onModeChange('start')}>Открыть Старт</button>
    </section>
  </div>
);
