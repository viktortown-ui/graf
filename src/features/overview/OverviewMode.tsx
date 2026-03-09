import type { AppMode } from '../../entities/system/modes';

type OverviewModeProps = {
  onModeChange: (mode: AppMode) => void;
};

export const OverviewMode = ({ onModeChange }: OverviewModeProps) => (
  <div className="overview-mode">
    <section className="overview-hero" aria-label="Обзор GRAF">
      <p className="scene-mode-kicker">Обзор системы</p>
      <h2 className="scene-mode-title">GRAF объединяет Мир, Граф и Оракул в один контур решений.</h2>
      <p className="scene-mode-copy">
        Вы видите проблему целиком, находите главный риск, определяете рычаг влияния и выбираете следующий шаг без
        переключения между разрозненными инструментами.
      </p>

      <div className="overview-collage" aria-hidden="true">
        <div className="overview-core">
          <span>Ядро решения</span>
        </div>
        <div className="overview-orbit world">Мир</div>
        <div className="overview-orbit graph">Граф</div>
        <div className="overview-orbit oracle">Оракул</div>
      </div>

      <div className="overview-points">
        <p>• увидеть проблему</p>
        <p>• найти главный риск</p>
        <p>• понять рычаг</p>
        <p>• выбрать следующий шаг</p>
      </div>

      <div className="overview-cta-row">
        <button type="button" onClick={() => onModeChange('start')}>
          Перейти в старт
        </button>
        <button type="button" className="ghost" onClick={() => onModeChange('world')}>
          Открыть мир
        </button>
      </div>
    </section>
  </div>
);
