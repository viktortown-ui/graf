import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, type AppSettings } from './settingsModel';

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

export const useSettingsState = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', `${settings.uiTextScale / 100}`);
    return () => {
      document.documentElement.style.removeProperty('--app-font-scale');
    };
  }, [settings.uiTextScale]);

  const api = useMemo(
    () => ({
      settings,
      lastSavedAt: 'pending',
      setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings((current) => normalize({ ...current, [key]: value }));
      },
      patchSettings: (patch: Partial<AppSettings>) => {
        setSettings((current) => normalize({ ...current, ...patch }));
      },
      replaceSettings: (next: AppSettings) => {
        setSettings(normalize(next));
      },
      getSnapshot: () => settings,
      resetRecommended: () => setSettings(DEFAULT_SETTINGS),
      clearStoredSettings: () => setSettings(DEFAULT_SETTINGS),
      estimateStorageKb: () => {
        const bytes = new TextEncoder().encode(JSON.stringify(settings)).length;
        return (bytes / 1024).toFixed(2);
      },
    }),
    [settings],
  );

  return api;
};
