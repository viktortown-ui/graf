import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, type AppSettings } from './settingsModel';

const STORAGE_KEY = 'graf.settings.v1';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalize = (raw: Partial<AppSettings>): AppSettings => ({
  ...DEFAULT_SETTINGS,
  ...raw,
  glowBrightness: clamp(raw.glowBrightness ?? DEFAULT_SETTINGS.glowBrightness, 0, 100),
  hudOpacity: clamp(raw.hudOpacity ?? DEFAULT_SETTINGS.hudOpacity, 35, 100),
  backgroundDensity: clamp(raw.backgroundDensity ?? DEFAULT_SETTINGS.backgroundDensity, 0, 100),
  labelDensity: clamp(raw.labelDensity ?? DEFAULT_SETTINGS.labelDensity, 30, 100),
  uiTextScale: clamp(raw.uiTextScale ?? DEFAULT_SETTINGS.uiTextScale, 90, 125),
});

const readStoredSettings = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return normalize(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const useSettingsState = () => {
  const [settings, setSettings] = useState<AppSettings>(() => readStoredSettings());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const api = useMemo(
    () => ({
      settings,
      lastSavedAt: 'локально сохранено',
      setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings((current) => normalize({ ...current, [key]: value }));
      },
      patchSettings: (patch: Partial<AppSettings>) => {
        setSettings((current) => normalize({ ...current, ...patch }));
      },
      resetRecommended: () => setSettings(DEFAULT_SETTINGS),
      exportSettings: () => JSON.stringify(settings, null, 2),
      importSettings: (raw: string) => {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        setSettings(normalize(parsed));
      },
      clearStoredSettings: () => {
        window.localStorage.removeItem(STORAGE_KEY);
      },
      estimateStorageKb: () => {
        const bytes = new TextEncoder().encode(window.localStorage.getItem(STORAGE_KEY) ?? '').length;
        return (bytes / 1024).toFixed(2);
      },
    }),
    [settings],
  );

  return api;
};
