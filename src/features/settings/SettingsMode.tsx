import { useMemo, useRef, useState } from 'react';
import { DEFAULT_SETTINGS, THEME_PRESETS, type AppSettings } from '../../app/state/settingsModel';

type SettingsModeProps = {
  settings: AppSettings;
  activeModeLabel: string;
  saveStatus: string;
  persistenceError: string | null;
  snapshots: Array<{ id: string; label: string; createdAt: string }>;
  storageSizeKb: string;
  appVersion: string;
  onSettingChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onResetRecommended: () => void;
  onResetView: () => void;
  onResetScene: () => void;
  onResetLaunch: () => void;
  onResetUserData: () => void;
  onResetSystem: () => void;
  onExportProject: () => string;
  onImportProject: (raw: string) => Promise<void>;
  onCreateSnapshot: (label?: string) => Promise<void>;
  onRestoreSnapshot: (snapshotId: string) => Promise<void>;
  onResetVisualCache: () => void;
};

const levelLabel = (value: number) => {
  if (value < 40) return 'низко';
  if (value < 70) return 'средне';
  return 'высоко';
};

const textScaleLabel = (value: number) => {
  if (value <= 92) return 'меньше';
  if (value >= 110) return 'крупнее';
  return 'стандарт';
};

export const SettingsMode = ({
  settings,
  activeModeLabel,
  saveStatus,
  persistenceError,
  snapshots,
  storageSizeKb,
  appVersion,
  onSettingChange,
  onResetRecommended,
  onResetView,
  onResetScene,
  onResetLaunch,
  onResetUserData,
  onResetSystem,
  onExportProject,
  onImportProject,
  onCreateSnapshot,
  onRestoreSnapshot,
  onResetVisualCache,
}: SettingsModeProps) => {
  const [importValue, setImportValue] = useState('');
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState('');
  const [projectError, setProjectError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const motionScale = useMemo(() => {
    if (settings.reduceMotion || settings.animationIntensity === 'minimum') return 'бережно';
    if (settings.animationIntensity === 'cinema') return 'выразительно';
    return 'нормальная';
  }, [settings.animationIntensity, settings.reduceMotion]);

  const confirmReset = (text: string, action: () => void) => {
    if (window.confirm(text)) action();
  };

  const strongConfirm = () => {
    const token = window.prompt('Введите ПОЛНЫЙ СБРОС, чтобы подтвердить необратимое действие.');
    if (token === 'ПОЛНЫЙ СБРОС') onResetSystem();
  };

  const downloadExport = () => {
    const blob = new Blob([onExportProject()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graf-project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-mode" aria-label="Центр управления настройками">
      <section className="settings-header">
        <p className="scene-mode-kicker">Настройки интерфейса</p>
        <h2 className="scene-mode-title">Компактная настройка внешнего вида, читаемости и поведения сцены.</h2>
        <p className="scene-mode-copy">Текущий режим: <strong>{activeModeLabel}</strong> · Сохранение: <strong>{saveStatus || 'в процессе'}</strong>.</p>
        <p className="scene-mode-copy">Экспорт проекта v1 пока <strong>без шифрования</strong>. Используйте только доверенное локальное хранение.</p>
        {persistenceError ? <p className="scene-mode-copy">Ошибка сохранения: <strong>{persistenceError}</strong></p> : null}
      </section>

      <section className="settings-grid">
        <article className="settings-panel">
          <p className="settings-panel-title">Тема</p>
          <div className="settings-segmented" role="tablist" aria-label="Выбор темы">
            {(Object.keys(THEME_PRESETS) as (keyof typeof THEME_PRESETS)[]).map((themeId) => (
              <button key={themeId} type="button" className={settings.theme === themeId ? 'active' : ''} onClick={() => onSettingChange('theme', themeId)} aria-label={`Тема ${THEME_PRESETS[themeId].label}`}>
                <strong>{THEME_PRESETS[themeId].label}</strong>
                <span>{THEME_PRESETS[themeId].description}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Динамика</p>
          <div className="settings-chip-row" aria-label="Интенсивность анимации">
            {(['minimum', 'normal', 'cinema'] as const).map((value) => (
              <button key={value} type="button" className={settings.animationIntensity === value ? 'active' : ''} onClick={() => onSettingChange('animationIntensity', value)}>
                {value === 'minimum' ? 'Минимум' : value === 'normal' ? 'Нормально' : 'Выразительно'}
              </button>
            ))}
          </div>
          <div className="settings-chip-row" aria-label="Скорость интерфейса">
            {(['slow', 'standard', 'fast'] as const).map((value) => (
              <button key={value} type="button" className={settings.sceneSpeed === value ? 'active' : ''} onClick={() => onSettingChange('sceneSpeed', value)}>
                {value === 'slow' ? 'Медленнее' : value === 'standard' ? 'Нормальная' : 'Быстрее'}
              </button>
            ))}
          </div>
          <p className="settings-note">Скорость интерфейса: <strong>{settings.sceneSpeed === 'slow' ? 'медленнее' : settings.sceneSpeed === 'fast' ? 'быстрее' : 'нормальная'}</strong>.</p>
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Слайдеры читаемости</p>
          <label aria-label="Яркость свечения">
            Яркость свечения: <strong>{settings.glowBrightness}% ({levelLabel(settings.glowBrightness)})</strong>
            <input type="range" min={0} max={100} value={settings.glowBrightness} onChange={(e) => onSettingChange('glowBrightness', Number(e.target.value))} />
          </label>
          <label aria-label="Прозрачность HUD">
            Прозрачность HUD: <strong>{settings.hudOpacity}% ({levelLabel(settings.hudOpacity)})</strong>
            <input type="range" min={35} max={100} value={settings.hudOpacity} onChange={(e) => onSettingChange('hudOpacity', Number(e.target.value))} />
          </label>
          <label aria-label="Плотность фона">
            Плотность фона: <strong>{settings.backgroundDensity}% ({levelLabel(settings.backgroundDensity)})</strong>
            <input type="range" min={0} max={100} value={settings.backgroundDensity} onChange={(e) => onSettingChange('backgroundDensity', Number(e.target.value))} />
          </label>
          <label aria-label="Плотность подписей">
            Плотность подписей: <strong>{settings.labelDensity}% ({levelLabel(settings.labelDensity)})</strong>
            <input type="range" min={30} max={100} value={settings.labelDensity} onChange={(e) => onSettingChange('labelDensity', Number(e.target.value))} />
          </label>
          <label aria-label="Размер интерфейсного текста">
            Размер интерфейсного текста: <strong>{settings.uiTextScale}% ({textScaleLabel(settings.uiTextScale)})</strong>
            <input type="range" min={90} max={125} value={settings.uiTextScale} onChange={(e) => onSettingChange('uiTextScale', Number(e.target.value))} />
          </label>
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Доступность и подсказки</p>
          <div className="settings-toggle-grid">
            <button type="button" className={settings.reduceMotion ? 'active' : ''} onClick={() => onSettingChange('reduceMotion', !settings.reduceMotion)} aria-label="Уменьшить анимацию">Уменьшить анимацию</button>
            <button type="button" className={settings.reduceTransparency ? 'active' : ''} onClick={() => onSettingChange('reduceTransparency', !settings.reduceTransparency)} aria-label="Сделать панели менее прозрачными">Снизить прозрачность</button>
            <button type="button" className={settings.highContrast ? 'active' : ''} onClick={() => onSettingChange('highContrast', !settings.highContrast)} aria-label="Повысить контраст текста">Повысить контраст</button>
            <button type="button" className={settings.enhancedFocus ? 'active' : ''} onClick={() => onSettingChange('enhancedFocus', !settings.enhancedFocus)} aria-label="Усилить фокус элементов">Усилить фокус</button>
            <button type="button" className={settings.lowGlowMode ? 'active' : ''} onClick={() => onSettingChange('lowGlowMode', !settings.lowGlowMode)} aria-label="Ограничить свечение">Меньше свечения</button>
            <button type="button" className={settings.autoFocusNode ? 'active' : ''} onClick={() => onSettingChange('autoFocusNode', !settings.autoFocusNode)} aria-label="Автофокус на выбранном узле">Автофокус узла</button>
          </div>
          <p className="settings-note">Движение интерфейса: <strong>{motionScale}</strong>.</p>
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Сброс и данные</p>
          <div className="settings-reset-list">
            <button type="button" onClick={onResetView}>Сбросить вид <span>камера и масштаб</span></button>
            <button type="button" onClick={onResetScene}>Сбросить сцену <span>выделения и панели</span></button>
            <button type="button" onClick={onResetLaunch}>Сбросить старт <span>давление, горизонт, цель</span></button>
            <button type="button" onClick={() => confirmReset('Сбросить все пользовательские настройки и локальные данные?', onResetUserData)}>Сбросить пользовательские данные <span>темы, поведение, доступность</span></button>
            <button type="button" className="danger" onClick={strongConfirm}>Полный сброс системы <span>очистка localStorage + значения по умолчанию</span></button>
          </div>
          <div className="settings-actions-row">
            <button type="button" onClick={downloadExport}>Экспорт проекта</button>
            <button type="button" onClick={() => fileRef.current?.click()}>Импорт проекта</button>
            <button type="button" className="ghost" onClick={onResetRecommended}>Рекомендованные значения</button>
          </div>
          <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder="Вставьте JSON пакета проекта" aria-label="Поле импорта JSON" />
          <div className="settings-actions-row">
            <button type="button" onClick={async () => {
              try {
                await onImportProject(importValue);
                setProjectError(null);
              } catch (error) {
                setProjectError(error instanceof Error ? error.message : 'Import failed');
              }
            }}>Применить импорт</button>
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
              try {
                await onImportProject(raw);
                setProjectError(null);
              } catch (error) {
                setProjectError(error instanceof Error ? error.message : 'Import failed');
              }
            }}
          />
          {projectError ? <p className="settings-note">Ошибка проекта: <strong>{projectError}</strong></p> : null}
        </article>

        <article className="settings-panel">
          <p className="settings-panel-title">Snapshots v1</p>
          <input type="text" value={snapshotLabel} onChange={(event) => setSnapshotLabel(event.target.value)} placeholder="Имя снимка (опционально)" />
          <div className="settings-actions-row">
            <button type="button" onClick={() => void onCreateSnapshot(snapshotLabel)}>Создать snapshot</button>
          </div>
          <select value={selectedSnapshotId} onChange={(event) => setSelectedSnapshotId(event.target.value)}>
            <option value="">Выберите snapshot для восстановления</option>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>{snapshot.label} · {new Date(snapshot.createdAt).toLocaleString()}</option>
            ))}
          </select>
          <div className="settings-actions-row">
            <button type="button" disabled={!selectedSnapshotId} onClick={() => void onRestoreSnapshot(selectedSnapshotId)}>Восстановить snapshot</button>
          </div>
          <p className="settings-note">Snapshot сохраняет полный проект в IndexedDB и ограничен локальным retention cap.</p>
        </article>

        <article className="settings-panel compact">
          <p className="settings-panel-title">Система и диагностика</p>
          <p>Версия: <strong>{appVersion}</strong></p>
          <p>Тема: <strong>{THEME_PRESETS[settings.theme].label}</strong></p>
          <p>Локальные данные: <strong>{storageSizeKb} КБ</strong></p>
          <p>Сохранение: <strong>{saveStatus || 'ожидание'}</strong></p>
          <div className="settings-actions-row">
            <button type="button" onClick={onResetVisualCache}>Сбросить визуальный кэш</button>
            <button type="button" className="ghost" onClick={() => onSettingChange('theme', DEFAULT_SETTINGS.theme)}>Тема по умолчанию</button>
          </div>
        </article>
      </section>
    </div>
  );
};
