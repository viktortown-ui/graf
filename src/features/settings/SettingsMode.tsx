import { useMemo, useRef, useState } from 'react';
import { DEFAULT_SETTINGS, THEME_PRESETS, type AppSettings } from '../../app/state/settingsModel';

type SettingsModeProps = {
  settings: AppSettings;
  activeModeLabel: string;
  saveStatus: string;
  storageSizeKb: string;
  appVersion: string;
  onSettingChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetRecommended: () => void;
  onResetView: () => void;
  onResetScene: () => void;
  onResetLaunch: () => void;
  onResetUserData: () => void;
  onResetSystem: () => void;
  onExport: () => string;
  onImport: (raw: string) => void;
  onResetVisualCache: () => void;
};

export const SettingsMode = ({
  settings,
  activeModeLabel,
  saveStatus,
  storageSizeKb,
  appVersion,
  onSettingChange,
  onResetRecommended,
  onResetView,
  onResetScene,
  onResetLaunch,
  onResetUserData,
  onResetSystem,
  onExport,
  onImport,
  onResetVisualCache,
}: SettingsModeProps) => {
  const [importValue, setImportValue] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const motionScale = useMemo(() => {
    if (settings.reduceMotion || settings.animationIntensity === 'minimum') return 'Минимум';
    if (settings.animationIntensity === 'cinema') return 'Кино';
    return 'Нормально';
  }, [settings.animationIntensity, settings.reduceMotion]);

  const confirmReset = (text: string, action: () => void) => {
    if (window.confirm(text)) {
      action();
    }
  };

  const strongConfirm = () => {
    const token = window.prompt('Введите ПОЛНЫЙ СБРОС, чтобы подтвердить необратимое действие.');
    if (token === 'ПОЛНЫЙ СБРОС') {
      onResetSystem();
    }
  };

  const downloadExport = () => {
    const blob = new Blob([onExport()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graf-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-mode" aria-label="Центр управления настройками">
      <section className="settings-header">
        <p className="scene-mode-kicker">Системный центр · Настройки</p>
        <h2 className="scene-mode-title">Управляйте атмосферой, поведением и безопасностью сцены как единым инструментом.</h2>
        <p className="scene-mode-copy">Текущий режим: <strong>{activeModeLabel}</strong> · Сохранение: <strong>{saveStatus || 'в процессе'}</strong>.</p>
      </section>

      <section className="settings-grid">
        <article className="settings-panel">
          <p className="settings-panel-title">Идентичность сцены</p>
          <div className="settings-segmented">
            {(Object.keys(THEME_PRESETS) as (keyof typeof THEME_PRESETS)[]).map((themeId) => (
              <button
                key={themeId}
                type="button"
                className={settings.theme === themeId ? 'active' : ''}
                onClick={() => onSettingChange('theme', themeId)}
              >
                <strong>{THEME_PRESETS[themeId].label}</strong>
                <span>{THEME_PRESETS[themeId].description}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Поведение сцены</p>
          <div className="settings-chip-row">
            {(['minimum', 'normal', 'cinema'] as const).map((value) => (
              <button key={value} type="button" className={settings.animationIntensity === value ? 'active' : ''} onClick={() => onSettingChange('animationIntensity', value)}>
                {value === 'minimum' ? 'Минимум' : value === 'normal' ? 'Нормально' : 'Кино'}
              </button>
            ))}
          </div>
          <div className="settings-chip-row">
            {(['slow', 'standard', 'fast'] as const).map((value) => (
              <button key={value} type="button" className={settings.sceneSpeed === value ? 'active' : ''} onClick={() => onSettingChange('sceneSpeed', value)}>
                {value === 'slow' ? 'Медленно' : value === 'standard' ? 'Стандарт' : 'Быстро'}
              </button>
            ))}
          </div>
          <label>Яркость свечения<input type="range" min={0} max={100} value={settings.glowBrightness} onChange={(e) => onSettingChange('glowBrightness', Number(e.target.value))} /></label>
          <label>Прозрачность HUD<input type="range" min={35} max={100} value={settings.hudOpacity} onChange={(e) => onSettingChange('hudOpacity', Number(e.target.value))} /></label>
          <label>Плотность фона<input type="range" min={0} max={100} value={settings.backgroundDensity} onChange={(e) => onSettingChange('backgroundDensity', Number(e.target.value))} /></label>
          <label>Плотность подписей<input type="range" min={30} max={100} value={settings.labelDensity} onChange={(e) => onSettingChange('labelDensity', Number(e.target.value))} /></label>
          <div className="settings-toggle-grid">
            <button type="button" className={settings.showSecondaryLinks ? 'active' : ''} onClick={() => onSettingChange('showSecondaryLinks', !settings.showSecondaryLinks)}>Показывать вторичные связи</button>
            <button type="button" className={settings.showDelays ? 'active' : ''} onClick={() => onSettingChange('showDelays', !settings.showDelays)}>Показывать задержки</button>
            <button type="button" className={settings.autoFocusNode ? 'active' : ''} onClick={() => onSettingChange('autoFocusNode', !settings.autoFocusNode)}>Автофокус на выбранном узле</button>
            <button type="button" className={settings.persistCameraBetweenModes ? 'active' : ''} onClick={() => onSettingChange('persistCameraBetweenModes', !settings.persistCameraBetweenModes)}>Сохранять положение камеры между режимами</button>
          </div>
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Доступность и контроль</p>
          <div className="settings-toggle-grid">
            <button type="button" className={settings.reduceMotion ? 'active' : ''} onClick={() => onSettingChange('reduceMotion', !settings.reduceMotion)}>Уменьшить анимацию</button>
            <button type="button" className={settings.reduceTransparency ? 'active' : ''} onClick={() => onSettingChange('reduceTransparency', !settings.reduceTransparency)}>Уменьшить прозрачность</button>
            <button type="button" className={settings.highContrast ? 'active' : ''} onClick={() => onSettingChange('highContrast', !settings.highContrast)}>Повысить контраст</button>
            <button type="button" className={settings.enhancedFocus ? 'active' : ''} onClick={() => onSettingChange('enhancedFocus', !settings.enhancedFocus)}>Усилить фокус элементов</button>
            <button type="button" className={settings.lowGlowMode ? 'active' : ''} onClick={() => onSettingChange('lowGlowMode', !settings.lowGlowMode)}>Режим без лишнего свечения</button>
          </div>
          <label>Размер интерфейсного текста<input type="range" min={90} max={125} value={settings.uiTextScale} onChange={(e) => onSettingChange('uiTextScale', Number(e.target.value))} /></label>
          <p className="settings-note">Текущий профиль движения: <strong>{motionScale}</strong>.</p>
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Данные и сброс</p>
          <p className="settings-note">Каждый уровень сброса влияет на разный слой данных.</p>
          <div className="settings-reset-list">
            <button type="button" onClick={onResetView}>Сбросить вид <span>камера и масштаб графа</span></button>
            <button type="button" onClick={onResetScene}>Сбросить сцену <span>выделения, линзы и локальные панели</span></button>
            <button type="button" onClick={onResetLaunch}>Сбросить стартовый запуск <span>давление, горизонт и цель запуска</span></button>
            <button type="button" onClick={() => confirmReset('Сбросить все пользовательские настройки и локальные данные?', onResetUserData)}>Сбросить пользовательские данные <span>темы, поведение, доступность</span></button>
            <button type="button" className="danger" onClick={strongConfirm}>Полный сброс системы <span>полная очистка localStorage + возврат по умолчанию</span></button>
          </div>
          <div className="settings-actions-row">
            <button type="button" onClick={downloadExport}>Экспорт настроек</button>
            <button type="button" onClick={() => fileRef.current?.click()}>Импорт настроек</button>
            <button type="button" className="ghost" onClick={onResetRecommended}>Вернуть рекомендуемые настройки</button>
          </div>
          <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder="Вставьте JSON настроек для импорта" />
          <div className="settings-actions-row">
            <button type="button" onClick={() => onImport(importValue)}>Применить JSON</button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const raw = await file.text();
              onImport(raw);
            }}
          />
        </article>

        <article className="settings-panel compact">
          <p className="settings-panel-title">Система и диагностика</p>
          <p>версия приложения: <strong>{appVersion}</strong></p>
          <p>активная тема: <strong>{THEME_PRESETS[settings.theme].label}</strong></p>
          <p>объём локальных данных: <strong>{storageSizeKb} КБ</strong></p>
          <p>статус сохранения настроек: <strong>{saveStatus || 'ожидание'}</strong></p>
          <p>производительность: <strong>{settings.reduceMotion ? 'бережный рендер' : 'полный рендер'}</strong></p>
          <div className="settings-actions-row">
            <button type="button" onClick={onResetVisualCache}>Сбросить визуальный кэш</button>
            <button type="button" className="ghost" onClick={() => onSettingChange('theme', DEFAULT_SETTINGS.theme)}>Тема по умолчанию</button>
          </div>
        </article>
      </section>
    </div>
  );
};
